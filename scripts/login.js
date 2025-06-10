window.addEventListener("DOMContentLoaded", async () => {
  const supabase = window.supabase.createClient(
    'https://bmblkqgeaaezttikpxxf.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtYmxrcWdlYWFlenR0aWtweHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MzY3MzMsImV4cCI6MjA2NDUxMjczM30.4TRpAxHihyPQnvuaMOZP5DnGre2OLYu9YQJIn2cXsrE'
  );

  // Check if user already logged in
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    // User logged in — redirect to profile page
    window.location.href = "profile.html";
    return; // Stop running the rest of the login script
  }

  const form = document.getElementById("authForm");
  const toggleBtn = document.getElementById("toggleForm");
  const toggleText = document.getElementById("toggleText");
  const submitBtn = document.getElementById("submitBtn");
  const title = document.getElementById("formTitle");
  const nameInput = form.querySelector('input[name="name"]');
  const avatarInput = form.querySelector('input[name="avatar"]');

  let isLogin = false;

  const updateFormUI = () => {
    submitBtn.textContent = isLogin ? "Log In" : "Sign Up";
    toggleText.textContent = isLogin
      ? "Don't have an account?"
      : "Already have an account?";
    title.textContent = isLogin ? "Log In" : "Sign Up";

    // Toggle visibility
    nameInput.style.display = isLogin ? "none" : "inline";
    avatarInput.style.display = isLogin ? "none" : "inline";
  };

  toggleBtn.addEventListener("click", () => {
    isLogin = !isLogin;
    updateFormUI();
  });

  updateFormUI(); // run on page load

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = form.email.value;
    const password = form.password.value;
    const name = nameInput.value || null;
    const avatar = avatarInput.value || null;

    if (isLogin) {
      // Login flow
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return alert("Login failed: " + error.message);
      window.location.href = "profile.html";
    } else {
      // Signup flow
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: name,
            avatar_url: avatar,
          },
        },
      });

      if (signUpError) {
        return alert("Signup failed: " + signUpError.message);
      }

      const user = signUpData.user;

      if (!user) {
        return alert("User not available yet, please confirm your email or try again.");
      }

      // Insert profile row in your profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: user.id,
            username: name,
            avatar_url: avatar || null,
            minutes_listened: 0,
            top_artist: null,
            songs_listened_to: 0,
          },
        ]);

      if (profileError) {
        return alert("Failed to create profile: " + profileError.message);
      }

      alert("Signed up! Please check your email.");
      window.location.href = "profile.html";
    }
  });
});
