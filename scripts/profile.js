const { data: { user } } = await supabase.auth.getUser();
if (user) {
  document.getElementById("user-email").textContent = user.email;
  // optionally: fetch user data from Supabase DB
} else {
  window.location.href = "/auth.html"; // force login if someone visits directly
}
