window.addEventListener("DOMContentLoaded", async () => {
  const supabase = window.supabase.createClient(
    'https://bmblkqgeaaezttikpxxf.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtYmxrcWdlYWFlenR0aWtweHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MzY3MzMsImV4cCI6MjA2NDUxMjczM30.4TRpAxHihyPQnvuaMOZP5DnGre2OLYu9YQJIn2cXsrE'
  );

  const form = document.getElementById("authForm");
  const toggleBtn = document.getElementById("toggleForm");
  const toggleText = document.getElementById("toggleText");
  const toggleForm = document.getElementById("toggleForm");
  const submitBtn = document.getElementById("submitBtn");
  const title = document.getElementById("formTitle");
  const nameInput = form.querySelector('input[name="name"]');

  let isLogin = true;

  const updateFormUI = () => {
    submitBtn.textContent = isLogin ? "Log In" : "Sign Up";
    toggleText.textContent = isLogin
      ? "Don't have an account?"
      : "Already have an account?";
    toggleForm.textContent = isLogin
      ? "Switch to Sign up"
      : "Switch to Login";
    title.textContent = isLogin ? "Log In" : "Sign Up";

    // Toggle visibility
    nameInput.style.display = isLogin ? "none" : "inline";
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

    if (isLogin) {
     // Login flow
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) return alert("Login failed: " + loginError.message);

      // ✅ Fetch logged-in user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return alert("Login failed: couldn't retrieve user.");
      }

      // ✅ Get their profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("times_logged_in")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.warn("Could not fetch profile to update login count:", profileError.message);
      } else {
        // ✅ Increment login count
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ times_logged_in: (profile.times_logged_in || 0) + 1 })
          .eq("id", user.id);

        if (updateError) {
          console.warn("Failed to increment login count:", updateError.message);
        }
      }

      window.location.href = "profile.html";

    } else {
      // Signup flow
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: name,
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
        .insert({
          id: data.user.id,
          username: name,
          minutes_listened: 0,
          songs_listened_to: 0,
          unique_songs_listened: 0,
          top_artist: null,
          top_song: null,
          top_song_cover: null,
          top_song_accent: null,
          times_logged_in: 1
        });

      if (profileError) {
        return alert("Failed to create profile: " + profileError.message);
      }

      alert("Signed up! Please check your email.");
      window.location.href = "profile.html";
    }
  });
});
