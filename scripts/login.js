window.addEventListener("DOMContentLoaded", () => {
  const supabase = window.supabase.createClient(
    'https://bmblkqgeaaezttikpxxf.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtYmxrcWdlYWFlenR0aWtweHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MzY3MzMsImV4cCI6MjA2NDUxMjczM30.4TRpAxHihyPQnvuaMOZP5DnGre2OLYu9YQJIn2cXsrE'
  );

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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return alert("Login failed: " + error.message);

      const user = data.user;
      if (!user) return alert("User not found after login.");

      // Check if profile exists
      const { data: profiles, error: profileFetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileFetchError && profileFetchError.code === 'PGRST116') {
        // No profile row found, create it
        const { error: profileInsertError } = await supabase.from("profiles").insert([{
          id: user.id,
          username: nameInput.value || null,
          avatar_url: avatarInput.value || null,
          minutes_listened: 0,
          top_artist: null,
          songs_listened_to: 0,
        }]);

        if (profileInsertError) return alert("Failed to create profile: " + profileInsertError.message);
      }

      window.location.href = "profile.html";
    }
  });
});
