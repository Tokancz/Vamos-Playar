// 🎵 SONGS QUEUE
const songs = [
    {
        title: "Blinding Lights",
        artists: "AGONY, kyoto, overrated",//Artists - span js
        file: "./songs/AGONY - Blinding Lights.mp3",
        cover: "./covers/BlindingLights.jpg"
    },
    {
        title: "Я НЕ ХОЧУ!",
        artists: "Flerian, Lieless & AGONY ",
        file: "./songs/Я НЕ ХОЧУ!.mp3",
        cover: "./covers/Я НЕ ХОЧУ!.jpg"
    },
    {
        title: "I REALLY WANT TO STAY AT YOUR HOUSE",
        artists: "Rosa Walton, Hallie Coggins",
        file: "./songs/I REALLY WANT TO STAY AT YOUR HOUSE.mp3",
        cover: "./covers/I REALLY WANT TO STAY AT YOUR HOUSE.jpg"
    },
    {
        title: "Eenie Meenie - A Minecraft Parody",
        artists: "Rosa Walton, Hallie Coggins",
        file: "./songs/Eenie Meenie - A Minecraft Parody.mp3",
        cover: "./covers/Eenie Meenie - A Minecraft Parody.png"
    },
    {
        title: "This Is The Life - LIZOT & KYANU",
        artists: "LIZOT & KYANU",
        file: "./songs/This Is The Life - LIZOT & KYANU.mp3",
        cover: "./covers/This Is The Life - LIZOT & KYANU.jpg"
    }
];

// 🔥 SETUP
let currentSong = 0;
let playstate = false;
let Song = new Audio();
let volume = .05;
let invertedValue = 100;
let muted = false;
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

let tabOpen = false;

function toggleTab() {
    const tab = document.getElementById("tab");
    const nav = document.getElementById("nav");
    const sList = document.getElementById("songList");
    const song = document.getElementById("songCover");
    const yap = document.getElementById("yap");

    if (!tabOpen) {
        // OPEN TAB
        BG.style.backdropFilter = "brightness(1) blur(30px)";
        nav.style.display = "none";
        sList.style.display = "none";
        cross.style.display = "block";
        song.style.position = "fixed";
        song.style.left = "50%";
        song.style.top = "35%";
        song.style.transform = "translate(-50%, -50%)";
        song.style.width = "90%";
        song.style.maxWidth = "500px";
        song.style.height = "auto";
        song.style.flexDirection = "column-reverse";
        song.style.alignItems = "center";
        coverImage.style.width = "100%";
        artists.style.textAlign = "center";
        songTitle.style.textAlign = "center";
        tab.style.width = "35%";
        tab.style.flexDirection = "row-reverse";
        tab.style.justifyContent = "center";
        tab.style.alignItems = "center";
        tab.style.gap = "20px";
        slider.style.width = "100%";
        yap.style.gap = "20px";
        tabOpen = true;
    } else {
        // CLOSE TAB
        BG.style.backdropFilter = "blur(30px) brightness(.2)";
        nav.style.display = "flex";
        sList.style.display = "flex";
        cross.style.display = "none";
        song.style = "";
        coverImage.style = "";
        artists.style.textAlign = "";
        songTitle.style.textAlign = "";
        tab.style = "";
        tabOpen = false;
    }
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

document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') { // Spacebar toggles play/pause
        e.preventDefault(); // prevent page from scrolling down
        togglePlayPause();
    }
});

// 📻 SETUP EVENT LISTENERS
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
    updateVolumeColor(); // Update color dynamically as user moves the thumb
});

cross.addEventListener("click", triggerAnimation);
cross.addEventListener("click", () => {
    triggerAnimation();
    toggleTab();
});


coverImage.addEventListener("click", toggleTab);

// No auto play on page load
loadSong(currentSong, false);
updateMusic();
updateGradient();
setVolume();
updateVolumeColor();
setInterval(updateMusic, 500);


//Todo: Fix media Keys