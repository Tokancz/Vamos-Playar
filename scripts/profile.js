document.addEventListener("DOMContentLoaded", async () => {
  const supabase = window.supabase.createClient(
    'https://bmblkqgeaaezttikpxxf.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtYmxrcWdlYWFlenR0aWtweHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MzY3MzMsImV4cCI6MjA2NDUxMjczM30.4TRpAxHihyPQnvuaMOZP5DnGre2OLYu9YQJIn2cXsrE'
  );

  const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      // No user logged in - redirect to login page
      window.location.href = "auth.html";
      return;
    }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return window.location.href = "/auth.html";

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return alert("Failed to fetch profile");

  // Render profile
  document.getElementById("profileName").textContent = data.username || "No username";
  document.getElementById("profileAvatar").src = data.avatar_url || "default-avatar.png";
  document.getElementById("profileEmail").textContent = user.email;
  document.getElementById("profileStats").textContent = `
    Minutes listened: ${data.minutes_listened || 0}
    Songs listened: ${data.songs_listened_to || 0}
    Unique songs: ${data.unique_songs_listened || 0}
    Top artist: ${data.top_artist || "N/A"}
    Top song: ${data.top_song || "N/A"}
    Times logged in: ${data.times_logged_in || 0}
  `;


  document.getElementById("logout").addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "auth.html";
  });
});
