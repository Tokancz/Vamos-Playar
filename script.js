// 🎵 SONGS QUEUE
let songs = [];

fetch('./songs.json')
  .then(res => res.json())
  .then(data => {
    console.log("Loaded songs:", data);
    songs = data;
    if (songs.length > 0) {
        populateSongList();
        loadSong(currentSong, false);
        setup(); // Call your original setup logic
    } else {
        console.error("No songs found in songs.json");
    }
  })
  .catch(err => console.error("Failed to load songs:", err));

// 🔥 SETUP
let currentSong = 0;
let playstate = false;
let Song = new Audio();
let volume = .05;
let invertedValue = 100;
let muted = false;
let tabOpen = false;
Song.volume = volume;

const play_btn = document.getElementById("play");
const pause_btn = document.getElementById("pause");
const next_btn = document.getElementById("nextBtn");
const prev_btn = document.getElementById("prevBtn");
const unmute_btn = document.getElementById("unmuted");
const mute_btn = document.getElementById("muted");
const cur_time = document.getElementById("cur_time");
const duration = document.getElementById("duration");
const slider = document.getElementById("slider");
const Vslider = document.getElementById("volume-range");
const songTitle = document.getElementById("songTitle");
const artists = document.getElementById("artists");
const coverImage = document.getElementById("coverImage");
const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
const BG = document.body;
const cross = document.getElementById("X");

function setup() {
    updateMusic();
    updateGradient();
    setVolume();
    updateVolumeColor();
    setInterval(updateMusic, 500);

    play_btn.addEventListener('click', togglePlayPause);
    pause_btn.addEventListener('click', togglePlayPause);
    next_btn.addEventListener("click", nextSong);
    prev_btn.addEventListener("click", prevSong);
    mute_btn.addEventListener("click", toggleMute);
    unmute_btn.addEventListener("click", toggleMute);
    slider.addEventListener("input", updateGradient);
    slider.addEventListener("change", seekSong);
    Vslider.addEventListener("input", () => {
        setVolume();
        updateVolumeColor();
    });
    cross.addEventListener("click", () => {
        triggerAnimation();
        setTimeout(() => toggleTab(), 500);
    });
    coverImage.addEventListener("click", toggleTab);

    window.addEventListener("load", () => {
        const savedTabState = localStorage.getItem("tabState");
        if (savedTabState === "open") {
            setTimeout(() => toggleTab(), 50);
        }
    });

    Song.addEventListener("ended", nextSong);
    
    const searchInput = document.getElementById("searchInput");
    searchInput.addEventListener("input", () => {
        const query = searchInput.value;
        populateSongList(query);
    });

    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => {
            Song.play();
            playstate = true;
            play_btn.style.display = "none";
            pause_btn.style.display = "block";
        });

        navigator.mediaSession.setActionHandler('pause', () => {
            Song.pause();
            playstate = false;
            play_btn.style.display = "block";
            pause_btn.style.display = "none";
        });

        navigator.mediaSession.setActionHandler('previoustrack', prevSong);
        navigator.mediaSession.setActionHandler('nexttrack', nextSong);
    }
}

function toggleTab() {
    const tab = document.getElementById("tab");
    const nav = document.getElementById("nav");
    const sList = document.getElementById("songList");
    const song = document.getElementById("songCover");
    const detail = document.getElementById("detail");
    const yap = document.getElementById("yap");
    const volume = document.querySelector("section.volume");
    const sliderSection = document.querySelector("section.slider");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    if (!tabOpen) {
        // OPEN TAB
        BG.style.backdropFilter = "brightness(1) blur(30px)";
        nav.style.display = "none";
        sList.style.display = "none";
        cross.style.display = "block";

        tab.classList.remove("collapsed");
        song.classList.remove("collapsed");
        volume.classList.remove("collapsed");
        sliderSection.classList.remove("collapsed");
        prevBtn.classList.remove("collapsed");
        nextBtn.classList.remove("collapsed");
        artists.classList.remove("collapsed");

        tab.classList.add("expanded");
        song.classList.add("expanded");
        volume.classList.add("expanded");
        sliderSection.classList.add("expanded");
        prevBtn.classList.add("expanded");
        nextBtn.classList.add("expanded");
        artists.classList.add("expanded");

        coverImage.style.width = "100%";
        coverImage.style.height = "100%";
        artists.style.textAlign = "center";
        songTitle.style.textAlign = "center";
        detail.style.width = "80%";
        slider.style.width = "100%";
        yap.style.gap = "20px";
        document.body.style.height = "100vh";

        tabOpen = true;
        localStorage.setItem("tabState", "open");
    } else {
        // CLOSE TAB
        BG.style.backdropFilter = "blur(30px) brightness(.3)";
        nav.style.display = "flex";
        sList.style.display = "flex";
        cross.style.display = "none";

        tab.classList.remove("expanded");
        song.classList.remove("expanded");
        volume.classList.remove("expanded");
        sliderSection.classList.remove("expanded");
        prevBtn.classList.remove("expanded");
        nextBtn.classList.remove("expanded");
        artists.classList.remove("expanded");

        tab.classList.add("collapsed");
        song.classList.add("collapsed");
        volume.classList.add("collapsed");
        sliderSection.classList.add("collapsed");
        prevBtn.classList.add("collapsed");
        nextBtn.classList.add("collapsed");
        artists.classList.add("collapsed");

        coverImage.style = "";
        artists.style.textAlign = "";
        songTitle.style.textAlign = "";
        detail.style = "";
        yap.style.gap = "";
        document.body.style.height = "";

        tabOpen = false;
        localStorage.setItem("tabState", "closed");
    }
}

function populateSongList(filter = "") {
    const songList = document.getElementById("songList");
    songList.innerHTML = ""; // Clear previous

    const normalizedFilter = filter.toLowerCase();

    songs.forEach((song, index) => {
        const title = song.title.toLowerCase();
        const artist = song.artists.toLowerCase();

        if (
            !normalizedFilter ||
            title.includes(normalizedFilter) ||
            artist.includes(normalizedFilter)
        ) {
            const songTab = document.createElement("section");
            songTab.classList.add("songtab");
            songTab.dataset.index = index;

            songTab.innerHTML = `
                <section class="songInfo">
                    <img src="${song.cover}" alt="cover" class="songCover">
                    <section class="songTabDetails">
                        <h3 class="songName">${song.title}</h3>
                        <p class="songArtists">${song.artists}</p>
                    </section>
                </section>
                <p class="songDuration">0:00</p>
            `;

            songTab.addEventListener("click", () => {
                loadSong(index, true);
            });

            songList.appendChild(songTab);
        }
    });

    setDurations(); // Keep durations visible
}

function setDurations() {
    const tabs = document.querySelectorAll(".songtab");

    tabs.forEach((tab, index) => {
        const audio = new Audio();
        audio.src = songs[index].file;

        audio.addEventListener("loadedmetadata", () => {
            const dur = audio.duration;
            const minutes = Math.floor(dur / 60);
            const seconds = Math.floor(dur % 60).toString().padStart(2, "0");
            const durationText = `${minutes}:${seconds}`;
            
            const durationEl = tab.querySelector(".songDuration");
            if (durationEl) durationEl.textContent = durationText;
        });
    });
}

function setVolume() {

    if (invertedValue != 100 - Vslider.value) {
        invertedValue = 100 - Vslider.value;
        volume = Math.round(invertedValue) / 100;
        muted = false;
    }

    if (volume == 0) {
        mute_btn.style.display = "block";
        unmute_btn.style.display = "none";
    }
    else {
        mute_btn.style.display = "none";
        unmute_btn.style.display = "block";
    }

    Song.volume = volume;
    updateVolumeColor();
}

// 🎶 LOAD A SONG FROM QUEUE
function loadSong(index, autoplay = false) {
    const track = songs[index];
    Song.src = track.file;
    Song.load();
    songTitle.textContent = track.title;
    artists.textContent = track.artists;

    // Update body background
    BG.style.backgroundImage = `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(10,10,10,0.4) 100%), url('${track.cover}')`;

    // Update cover image
    coverImage.src = track.cover;  

    if (autoplay || playstate) {
        Song.play();
        playstate = true;
        play_btn.style.display = "none";
        pause_btn.style.display = "block";
    } else {
        play_btn.style.display = "block";
        pause_btn.style.display = "none";
    }

    if ('mediaSession' in navigator) {//lockscreen - Not sure
    navigator.mediaSession.metadata = new MediaMetadata({
        title: songs[currentSong].title,
        artist: songs[currentSong].artists,
        artwork: [
            { src: songs[currentSong].cover, sizes: '512x512', type: 'image/jpeg' }
        ]
    });
}

}

// ⏩ NEXT SONG
function nextSong() {
    currentSong = (currentSong + 1) % songs.length;
    loadSong(currentSong, true); // always autoplay after skipping
}

// ⏪ PREVIOUS SONG
function prevSong() {
    currentSong = (currentSong - 1 + songs.length) % songs.length;
    loadSong(currentSong, true); // always autoplay after skipping
}

function toggleMute() {
    if (!muted) { 
        localStorage.setItem("last_volume", volume);
        volume = 0;
    } else { 
        volume = parseFloat(localStorage.getItem("last_volume")) || 0.05; // Default if null
    }
    muted = !muted;
    // Update the real song volume
    Song.volume = volume;
    // Update slider position to match volume
    invertedValue = (1 - volume) * 100; // Because your slider is inverted
    Vslider.value = invertedValue; // Update slider
    // Update mute/unmute icons
    if (volume == 0) {
        mute_btn.style.display = "block";
        unmute_btn.style.display = "none";
    } else {
        mute_btn.style.display = "none";
        unmute_btn.style.display = "block";
    }
    updateVolumeColor();
}

async function togglePlayPause() {
    if (Song.paused) {
        try {
            await Song.play();
            play_btn.style.display = "none";
            pause_btn.style.display = "block";
        } catch (err) {
            console.error("Autoplay blocked:", err);
        }
    } else {
        Song.pause();
        play_btn.style.display = "block";
        pause_btn.style.display = "none";
    }
}

// ⏳ UPDATE TIME / SLIDER
function updateMusic() {
    if (Song.duration) {
        slider.max = Math.round(Song.duration);
        slider.value = Math.round(Song.currentTime);
        updateGradient();

        // Time formatting
        let minCur = Math.floor(slider.value / 60);
        let secCur = Math.floor(slider.value % 60);
        cur_time.textContent = `${minCur}:${secCur < 10 ? '0' : ''}${secCur}`;

        let minDur = Math.floor(Song.duration / 60);
        let secDur = Math.floor(Song.duration % 60);
        duration.textContent = `${minDur}:${secDur < 10 ? '0' : ''}${secDur}`;
    }
}

// 🌈 UPDATE SLIDER GRADIENTS
function updateGradient() {
    // Fetch the updated value of --accent after it has been set in the :root
    const accent = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent')
      .trim();
    const val = (slider.value - slider.min) / (slider.max - slider.min) * 100;
    slider.style.background = `linear-gradient(to right, ${accent} 0%, #ddd ${val}%)`;
}

function updateVolumeColor() {
    // Fetch the updated value of --accent after it has been set in the :root
    const accent = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent')
      .trim();
    const val = (Vslider.value - Vslider.min) / (Vslider.max - Vslider.min) * 100;
    Vslider.style.background = `linear-gradient(to bottom, #ddd ${val}%, ${accent} ${val}%)`;
}


// ⏩ SEEK TO NEW POSITION
function seekSong() {
    Song.currentTime = slider.value;
}

// ✨ CROSS (X) BUTTON ANIMATION
function triggerAnimation() {
    cross.animate([
        { transform: "scale(1) rotate(0deg)" },
        { transform: "scale(1.1) rotate(-10deg)" },
        { transform: "scale(1.1) rotate(10deg)" },
        { transform: "scale(1.1) rotate(-10deg)" },
        { transform: "scale(1.1) rotate(10deg)" },
        { transform: "scale(1) rotate(0deg)" }
    ], {
        duration: 500,
        easing: "ease-in-out"
    });
}

const colorThief = new ColorThief();
const img = document.getElementById('coverImage');

img.addEventListener('load', () => {
    if (img.complete && img.naturalHeight !== 0) {
      const palette = colorThief.getPalette(img, 10); // get 10 colors
  
      // Find the best vibrant color, not white/black/gray
      const accent = pickVibrantColor(palette);
  
      const hexAccent = rgbToHex(...accent);
      console.log('Chosen Accent Color:', hexAccent);
  
      // Update the --accent CSS variable
      document.documentElement.style.setProperty('--accent', hexAccent);
  
      // Now update your UI elements with the new accent
      updateGradient(); // Update slider gradient
      updateVolumeColor(); // Update volume slider color
    }
});

// Converts [r, g, b] into a hex string
function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join('');
}

// Picks the most vibrant color (not white/black/grayish)
function pickVibrantColor(palette) {
  for (const color of palette) {
    const [r, g, b] = color;
    const brightness = (r + g + b) / 3;

    // Ignore very bright (white-ish) and very dark (black-ish) colors
    if (brightness > 40 && brightness < 220) {
      // Also ignore very grayish colors (where r ≈ g ≈ b)
      const maxDiff = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b));
      if (maxDiff > 20) {
        return color; // found a colorful one
      }
    }
  }
  // fallback: just pick the first one if nothing better
  return palette[0];
}

// 🎧 WHEN SONG ENDS, AUTOPLAY NEXT
Song.addEventListener("ended", nextSong);

//format scripts, lockscreen?, ios, play pause button change on media keys, profiles