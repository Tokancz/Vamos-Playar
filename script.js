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
const BG = document.body;
const cross = document.getElementById("X");

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
    BG.style.backgroundSize = "cover";
    BG.style.backgroundPosition = "center";
    BG.style.backgroundRepeat = "no-repeat";
    BG.style.backgroundAttachment = "fixed";
    BG.style.backdropFilter = "blur(30px)";

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
    const val = (slider.value - slider.min) / (slider.max - slider.min) * 100;
    slider.style.background = `linear-gradient(to right, #C04065 0%, #ddd ${val}%)`;
}
function updateVolumeColor() {
    const val = (Vslider.value - Vslider.min) / (Vslider.max - Vslider.min) * 100; // Calculate progress in percentage
    Vslider.style.background = `linear-gradient(to bottom, #ddd ${val}%, #C04065 ${val}%)`; // Set color from start to thumb position
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

// No auto play on page load
loadSong(currentSong, false);
updateMusic();
updateGradient();
setVolume();
updateVolumeColor();
setInterval(updateMusic, 500);

//Todo: volume slider, automatic accent color