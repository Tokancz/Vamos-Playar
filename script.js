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
    }
];

// 🔥 SETUP
let currentSong = 0;
let playstate = false;
let Song = new Audio();
Song.volume = .05;

const play_btn = document.getElementById("play");
const pause_btn = document.getElementById("pause");
const next_btn = document.getElementById("nextBtn");
const prev_btn = document.getElementById("prevBtn");

const cur_time = document.getElementById("cur_time");
const duration = document.getElementById("duration");
const slider = document.getElementById("slider");
const songTitle = document.getElementById("songTitle");
const artists = document.getElementById("artists");
const coverImage = document.getElementById("coverImage");
const BG = document.body;
const cross = document.getElementById("X");

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

// 🌈 UPDATE SLIDER GRADIENT
function updateGradient() {
    const val = (slider.value - slider.min) / (slider.max - slider.min) * 100;
    slider.style.background = `linear-gradient(to right, #C04065 0%, #ddd ${val}%)`;
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

slider.addEventListener("input", updateGradient);
slider.addEventListener("change", seekSong);

cross.addEventListener("click", triggerAnimation);

// No auto play on page load
loadSong(currentSong, false);
updateMusic();
updateGradient();
setInterval(updateMusic, 500); // Update every second

//Todo: volume slider, automatic accent color