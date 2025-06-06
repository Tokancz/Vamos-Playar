document.addEventListener("DOMContentLoaded", async () => {
  const supabase = window.supabase.createClient(
    'https://bmblkqgeaaezttikpxxf.supabase.co',
    'YOUR_PUBLIC_ANON_KEY'
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return window.location.href = "/auth.html";

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return alert("Failed to fetch profile");

  // Render profile
  document.getElementById("profileName").textContent = data.name;
  document.getElementById("profileEmail").textContent = user.email;
  document.getElementById("profileAvatar").src = data.avatar_url;
  document.getElementById("profileStats").textContent = `
    Minutes listened: ${data.minutes_listened || 0}
    Songs listened: ${data.songs_listened || 0}
    Top artist: ${data.top_artist || "N/A"}
  `;

  document.getElementById("logout").addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth.html";
  });
});
