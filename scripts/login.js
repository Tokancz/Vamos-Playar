// Supabase setup (define AFTER library is loaded, now it's guaranteed via defer)
const supabaseUrl = 'https://bmblkqgeaaezttikpxxf.supabase.co';
const supabaseKey = 'your-key-here';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("authForm");
  const toggleBtn = document.getElementById("toggleForm");
  const toggleText = document.getElementById("toggleText");
  const submitBtn = document.getElementById("submitBtn");
  const title = document.getElementById("formTitle");

  let isLogin = false;

  toggleBtn.addEventListener("click", () => {
    isLogin = !isLogin;
    submitBtn.textContent = isLogin ? "Log In" : "Sign Up";
    toggleText.textContent = isLogin
      ? "Don't have an account?"
      : "Already have an account?";
    title.textContent = isLogin ? "Log In" : "Sign Up";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = form.email.value;
    const password = form.password.value;
    const name = form.name?.value || null;
    const avatar = form.avatar?.value || null;

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return alert("Login failed: " + error.message);
      alert("Logged in!");
      window.location.href = "profile.html";
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            avatar,
          },
        },
      });
      if (error) return alert("Signup failed: " + error.message);
      alert("Signed up! Check your email.");
      window.location.href = "profile.html";
    }
  });
});
