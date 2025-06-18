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
  document.getElementById("profileEmail").textContent = user.email;
  document.getElementById("profileStats").textContent = `
    Minutes listened: ${data.minutes_listened || 0}
    Songs listened: ${data.songs_listened_to || 0}
    Unique songs: ${data.unique_songs_listened || 0}
    Top artist: ${data.top_artist || "N/A"}
    Top song: ${data.top_song || "N/A"}
    Times logged in: ${data.times_logged_in || 0}
  `;
  if (data.avatar_url) {
    const { data: signedUrlData, error: signedUrlError } = await supabase
      .storage
      .from('profile-images')
      .createSignedUrl(data.avatar_url, 60 * 60); // 1 hour

    if (!signedUrlError && signedUrlData?.signedUrl) {
      document.getElementById("profileAvatar").src = signedUrlData.signedUrl;
    } else {
      document.getElementById("profileAvatar").src = "./images/default-avatar.png";
    }
  } else {
    document.getElementById("profileAvatar").src = "./images/default-avatar.png";
  }


  // 🎨 Apply visual styling from top song
  if (data.top_song_cover) {
    const profileCard = document.querySelector(".profileCard");
    profileCard.style.backgroundImage = `url('${data.top_song_cover}')`;
    profileCard.style.backgroundSize = "cover";
    profileCard.style.backgroundPosition = "center";
    document.body.style.backgroundImage = `url('${data.top_song_cover}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backdropFilter = "blur(15px) brightness(0.15)";
    document.body.style.transition = "background-image 0.5s ease-in-out, backdrop-filter 0.5s ease-in-out";
  }

  if (data.top_song_accent) {
    document.documentElement.style.setProperty('--accent', data.top_song_accent);
  }

  document.getElementById("logout").addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "auth.html";
  });

  document.getElementById("changeAvatarBtn").addEventListener("click", () => {
    document.getElementById("avatarInput").click();
  });

  document.getElementById("avatarInput").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      alert("Upload failed.");
      console.error(uploadError);
      return;
    }

    // Create a signed URL to access the file
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('profile-images')
      .createSignedUrl(filePath, 60 * 60); // 1 hour

    if (signedUrlError) {
      alert("Failed to create signed URL.");
      console.error(signedUrlError);
      return;
    }

    const signedUrl = signedUrlData.signedUrl;

    // Update avatar_url in user profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: filePath })
      .eq("id", user.id);

    if (updateError) {
      alert("Failed to update profile.");
      console.error(updateError);
      return;
    }
    
    document.getElementById("profileAvatar").src = signedUrl;
    alert("Profile picture updated successfully!");
  });
});
