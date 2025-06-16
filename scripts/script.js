// 🎵 SONGS QUEUE
let songs = [];

const supabase = window.supabase.createClient(
    'https://bmblkqgeaaezttikpxxf.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtYmxrcWdlYWFlenR0aWtweHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MzY3MzMsImV4cCI6MjA2NDUxMjczM30.4TRpAxHihyPQnvuaMOZP5DnGre2OLYu9YQJIn2cXsrE'
);

fetch('./songs.json')
    .then(res => res.json())
    .then(data => {
        console.log("Loaded songs:", data);
        songs = data;
        if (songs.length > 0) {
            populateSongList();
            // 👇 Try to restore last played song
            const savedSongIndex = parseInt(localStorage.getItem("currentSong"));
            if (!isNaN(savedSongIndex) && savedSongIndex >= 0 && savedSongIndex < songs.length) {
                currentSong = savedSongIndex;
            } else {
                currentSong = 0;
            }
            loadSong(currentSong, false);
            setup();
        } else {
            console.error("No songs found in songs.json");
        }
    })
    .catch(err => console.error("Failed to load songs:", err));

// 🔥 SETUP
let currentSong = 0;
let playstate = false;
let volume = parseFloat(localStorage.getItem("last_volume"));
if (isNaN(volume)) volume = 0.05; // fallback to 5% if not saved
let Song = new Audio();
Song.volume = volume;
let invertedValue = 100;
let muted = false;
let tabOpen = false;
let playStartTime = null;
let accumulatedPlayTime = 0;
let songTracked = false;

const play_btn = document.getElementById("play");
const pause_btn = document.getElementById("pause");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
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
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");

function setup() {
    updateMusic();
    updateGradient();
    setVolume();
    updateVolumeColor();
    setInterval(updateMusic, 500);
    restoreVolume();

    play_btn.addEventListener('pointerdown', togglePlayPause);
    pause_btn.addEventListener('pointerdown', togglePlayPause);
    nextBtn.addEventListener("pointerdown", nextSong);
    prevBtn.addEventListener("pointerdown", prevSong);
    mute_btn.addEventListener("pointerdown", toggleMute);
    unmute_btn.addEventListener("pointerdown", toggleMute);
    slider.addEventListener("input", updateGradient);
    slider.addEventListener("change", seekSong);
    Vslider.addEventListener("input", () => {
        setVolume();
        updateVolumeColor();
    });
    cross.addEventListener("pointerdown", () => {
        triggerAnimation();
        setTimeout(() => toggleTab(), 500);
    });
    coverImage.addEventListener("pointerdown", toggleTab);

    window.addEventListener("load", () => {
        const savedTabState = localStorage.getItem("tabState");
        if (savedTabState === "open") {
            setTimeout(() => toggleTab(), 50);
        }
    });

    Song.addEventListener("play", () => {
        playStartTime = Date.now();
        songTracked = false;
    });

    Song.addEventListener("pause", async () => {
        updateListeningStats();
    });

    Song.addEventListener("ended", async () => {
        updateListeningStats(true); // force "finished" if song ends naturally
    });

    Song.addEventListener("ended", nextSong);

    const searchInput = document.getElementById("searchInput");
    searchInput.addEventListener("input", () => {
        const query = searchInput.value;
        populateSongList(query);
    });

    document.getElementById("user").addEventListener("pointerdown", async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            window.location.href = "profile.html";
        } else {
            window.location.href = "auth.html";
        }
    });

    // Restore saved shuffle state
    shuffle = localStorage.getItem("shuffle") === "true";
    updateShuffleUI();
     // Restore saved repeat state
    repeat = localStorage.getItem("repeat") === "true";
    updateRepeatUI();

    shuffleBtn.addEventListener("click", () => {
        shuffle = !shuffle;
        if (shuffle) {
            repeat = false;  // turn off repeat if shuffle turns on
            localStorage.setItem("repeat", repeat);
            updateRepeatUI();
        }
        localStorage.setItem("shuffle", shuffle);
        updateShuffleUI();
    });

    repeatBtn.addEventListener("click", () => {
        repeat = !repeat;
        if (repeat) {
            shuffle = false;  // turn off shuffle if repeat turns on
            localStorage.setItem("shuffle", shuffle);
            updateShuffleUI();
        }
        localStorage.setItem("repeat", repeat);
        updateRepeatUI();
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
    const icons = document.getElementById("icons");
    const yap = document.getElementById("yap");
    const visualizer = document.getElementById("visualizer");
    const volume = document.querySelector("section.volume");
    const sliderSection = document.querySelector("section.slider");

    if (!tabOpen) {
        // OPEN TAB
        BG.style.backdropFilter = "brightness(1) blur(30px)";
        nav.style.display = "none";
        sList.style.display = "none";
        cross.style.display = "block";

        tab.classList.remove("collapsed");
        song.classList.remove("collapsed");
        volume.classList.remove("collapsed");
        icons.classList.remove("collapsed");
        sliderSection.classList.remove("collapsed");
        prevBtn.classList.remove("collapsed");
        nextBtn.classList.remove("collapsed");
        shuffleBtn.classList.remove("collapsed");
        repeatBtn.classList.remove("collapsed");
        artists.classList.remove("collapsed");
        visualizer.classList.remove("collapsed");

        tab.classList.add("expanded");
        song.classList.add("expanded");
        volume.classList.add("expanded");
        icons.classList.add("expanded");
        sliderSection.classList.add("expanded");
        prevBtn.classList.add("expanded");
        nextBtn.classList.add("expanded");
        shuffleBtn.classList.add("expanded");
        repeatBtn.classList.add("expanded");
        artists.classList.add("expanded");
        visualizer.classList.add("expanded");

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
        icons.classList.remove("expanded");
        sliderSection.classList.remove("expanded");
        prevBtn.classList.remove("expanded");
        nextBtn.classList.remove("expanded");
        shuffleBtn.classList.remove("expanded");
        repeatBtn.classList.remove("expanded");
        artists.classList.remove("expanded");
        visualizer.classList.remove("expanded");

        tab.classList.add("collapsed");
        song.classList.add("collapsed");
        volume.classList.add("collapsed");
        icons.classList.add("collapsed");
        sliderSection.classList.add("collapsed");
        prevBtn.classList.add("collapsed");
        nextBtn.classList.add("collapsed");
        shuffleBtn.classList.add("collapsed");
        repeatBtn.classList.add("collapsed");
        artists.classList.add("collapsed");
        visualizer.classList.add("collapsed");

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

            const encodedCoverURL = encodeURI(song.cover);

            songTab.innerHTML = `
                <div class="cover-bg" style="background-image: linear-gradient(90deg, rgba(0,0,0,0.1) 0%, rgba(10,10,10,1) 70%), url('${encodedCoverURL}')"></div>
                <section class="songInfo">
                    <img src="${encodedCoverURL}" alt="cover" class="songCover">
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

let lastCountedTrackId = null;

async function updateListeningStats(forceFinished = false) {
    if (playStartTime === null) return;

    const elapsedSeconds = Math.floor((Date.now() - playStartTime) / 1000);
    accumulatedPlayTime += elapsedSeconds;
    playStartTime = null;

    const song = songs[currentSong];
    const artist = song.artists;
    const songDuration = song.duration || 0;
    const trackId = song.id || song.title; // ✅ Fallback if no ID
    const progress = song.currentTime || accumulatedPlayTime; // You may adjust this if your `song` has a currentTime field
    const duration = songDuration;

    const qualifiesAsListened =
        (progress > 30 || progress > duration * 0.5) &&
        trackId !== lastCountedTrackId;

    // ✅ Avoid unnecessary work if nothing qualifies
    const minutesListened = Math.floor(accumulatedPlayTime / 60);
    accumulatedPlayTime %= 60;

    if (!forceFinished && !qualifiesAsListened && minutesListened === 0) {
        return;
    }

    // ✅ Get Supabase user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        console.error("No user is logged in:", userError);
        return;
    }

    // ✅ Fetch user profile
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("minutes_listened, songs_listened_to, artist_counts, song_counts, top_song, unique_songs_listened, first_listen_at")
        .eq("id", user.id)
        .single();

    if (profileError) {
        console.error("Error fetching profile:", profileError);
        return;
    }

    const artistCounts = profile.artist_counts || {};
    const songCounts = profile.song_counts || {};
    const uniqueSongs = Object.keys(songCounts).length;
    const newMinutes = (profile.minutes_listened || 0) + minutesListened;
    const newSongs = qualifiesAsListened
        ? (profile.songs_listened_to || 0) + 1
        : (profile.songs_listened_to || 0);

    // ✅ Add artist counts only if valid
    if (qualifiesAsListened) {
        lastCountedTrackId = trackId;

        // Update artist counts
        const individualArtists = artist.split("/").map(a => a.trim());
        individualArtists.forEach(individualArtist => {
            artistCounts[individualArtist] = (artistCounts[individualArtist] || 0) + 1;
        });

        // Update song counts
        const songTitle = song.title;
        songCounts[songTitle] = (songCounts[songTitle] || 0) + 1;
    }

    let topArtist = "Unknown";
    let topArtistCount = 0;
    for (const [a, count] of Object.entries(artistCounts)) {
        if (count > topArtistCount) {
            topArtist = a;
            topArtistCount = count;
        }
    }

    let topSong = "Unknown";
    let topSongCount = 0;
    for (const [title, count] of Object.entries(songCounts)) {
        if (count > topSongCount) {
            topSong = title;
            topSongCount = count;
        }
    }

    const now = new Date().toISOString();
    const firstListen = profile.first_listen_at || now;
    const lastListen = now;

    // ✅ Update profile in Supabase
    const updates = {
        minutes_listened: newMinutes,
        songs_listened_to: newSongs,
        artist_counts: artistCounts,
        top_artist: topArtist,
        song_counts: songCounts,
        top_song: topSong,
        unique_songs_listened: uniqueSongs,
        first_listen_at: firstListen,
        last_listen_at: lastListen,
    };

    // Check if the top song has changed
    if (profile.top_song !== topSong) {
        const topSongData = songs.find(s => s.title === topSong);
        const cover = topSongData?.cover;

        if (cover) {
            try {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = cover;

                img.onload = async () => {
                    const palette = colorThief.getPalette(img, 10);
                    const vibrant = pickVibrantColor(palette);
                    const hexAccent = rgbToHex(...vibrant);

                    updates.top_song_cover = cover;
                    updates.top_song_accent = hexAccent;

                    const { error: updateError } = await supabase
                        .from("profiles")
                        .update(updates)
                        .eq("id", user.id);

                    if (updateError) {
                        console.error("Error updating profile with top song cover/accent:", updateError);
                    } else {
                        console.log("✅ Profile + top song visual updated.");
                    }
                };
            } catch (err) {
                console.error("Error loading image for color extraction:", err);
            }
        } else {
            // No cover found — just update text stats
            const { error: updateError } = await supabase
                .from("profiles")
                .update(updates)
                .eq("id", user.id);

            if (updateError) {
                console.error("Error updating profile stats:", updateError);
            } else {
                console.log("✅ Profile stats updated (no cover).");
            }
        }
    } else {
        // Top song hasn't changed — update regular stats only
        const { error: updateError } = await supabase
            .from("profiles")
            .update(updates)
            .eq("id", user.id);

        if (updateError) {
            console.error("Error updating profile stats:", updateError);
        } else {
            console.log("✅ Profile stats updated.");
        }
    }
}

function setDurations() {
    const tabs = document.querySelectorAll(".songtab");

    tabs.forEach((tab, index) => {
        const audio = new Audio();
        const tabIndex = parseInt(tab.dataset.index);
        audio.src = songs[tabIndex].file;

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
    invertedValue = 100 - Vslider.value;
    volume = invertedValue / 100;
    muted = volume === 0;

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

// 🎶 LOAD A SONG FROM QUEUe
function loadSong(index, autoplay = false) {
    currentSong = index;
    localStorage.setItem("currentSong", currentSong); // ⬅️ Save song index

    const track = songs[index];
    Song.src = track.file;

    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
        initVisualizer();

    Song.load();
    songTitle.textContent = track.title;
    artists.textContent = track.artists;

    BG.style.backgroundImage = `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(10,10,10,0.4) 100%), url('${track.cover}')`;
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

    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.title,
            artist: track.artists,
            artwork: [
                { src: track.cover, sizes: '512x512', type: 'image/jpeg' }
            ]
        });
    }
    // ✅ Highlight the active song in the list
    const songTabs = document.querySelectorAll('.songtab');
    songTabs.forEach((tab, i) => {
        if (i === index) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}

// ⏩ NEXT SONG
let shuffle = false;
let repeat = false;  // false means no repeat; true means repeat one

function nextSong() {
    if (repeat) {
        // If repeat is ON, do NOT change currentSong, just reload it.
        loadSong(currentSong, true);
        return; // exit early so no other logic runs
    }

    if (shuffle) {
        let next;
        do {
            next = Math.floor(Math.random() * songs.length);
        } while (next === currentSong);
        currentSong = next;
    } else {
        currentSong = (currentSong + 1) % songs.length;
    }
    loadSong(currentSong, true);
}

// ⏪ PREVIOUS SONG
function prevSong() {
    currentSong = (currentSong - 1 + songs.length) % songs.length;
    loadSong(currentSong, true); // always autoplay after skipping
}

function updateShuffleUI() {
    const btn = document.getElementById("shuffleBtn");
    if (shuffle) {
        btn.classList.add("active");
    } else {
        btn.classList.remove("active");
    }
}
function updateRepeatUI() {
    const btn = document.getElementById("repeatBtn");
    if (repeat) {
        btn.classList.add("active");
    } else {
        btn.classList.remove("active");
    }
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

function restoreVolume() {
    const savedVolume = parseFloat(localStorage.getItem("last_volume"));
    if (!isNaN(savedVolume)) {
        volume = savedVolume;
        invertedValue = 100 - volume * 100;
        Vslider.value = invertedValue;
        Song.volume = volume;
        muted = volume === 0;

        if (volume === 0) {
            mute_btn.style.display = "block";
            unmute_btn.style.display = "none";
        } else {
            mute_btn.style.display = "none";
            unmute_btn.style.display = "block";
        }

        updateVolumeColor();
    }
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

img.addEventListener('load', async () => {
    console.log('Image loaded:', img.src);
    if (img.complete && img.naturalHeight !== 0) {
        const palette = colorThief.getPalette(img, 10);
        const accent = pickVibrantColor(palette);
        const hexAccent = rgbToHex(...accent);
        console.log('Chosen Accent Color:', hexAccent);

        document.documentElement.style.setProperty('--accent', hexAccent);
        updateGradient();
        updateVolumeColor();
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

function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }
    const num = parseInt(hex, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
    };
}

function applyAccentColorToMask(selector, accentColor) {
    const el = document.querySelector(selector);
    if (!el) {
        console.warn('Element not found:', selector);
        return;
    }
    el.style.backgroundColor = accentColor;
}

// === 🎧 VISUALIZER ===
const visualizer = document.getElementById('visualizer');
const numBarsPerSide = 24; // total bars = 48
const bars = [];
let lastHeights = [];
const maxBarHeight = 100;
let visualizerInitialized = false;

let audioCtx, analyser, source, dataArray;

function initVisualizer() {
    if (visualizerInitialized) return;
    visualizerInitialized = true;
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        source = audioCtx.createMediaElementSource(Song);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
    }

    visualizer.innerHTML = '';
    bars.length = 0;
    lastHeights.length = 0;

    const totalBars = numBarsPerSide * 2;

    for (let i = 0; i < totalBars; i++) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', (i * (100 / totalBars)).toString());
        rect.setAttribute('width', (100 / totalBars - 1).toString());
        rect.setAttribute('y', '50');
        rect.setAttribute('height', '0');
        rect.setAttribute('fill', 'var(--accent)');
        rect.setAttribute('rx', '1.5');
        rect.setAttribute('ry', '1.5');
        bars.push(rect);
        lastHeights.push(0);
        visualizer.appendChild(rect);
    }

    animateVisualizer();
}

function animateVisualizer() {
    requestAnimationFrame(animateVisualizer);
    analyser.getByteFrequencyData(dataArray);

    for (let i = 0; i < numBarsPerSide * 2; i++) {
        const value = dataArray[Math.abs(numBarsPerSide - 1 - i)] ?? 0;
        const targetHeight = (value / 255) * maxBarHeight;

        const currentHeight = lastHeights[i];
        const easingFactor = 0.1 + (currentHeight / maxBarHeight) * 0.4; // range: 0.1 to 0.5
        const eased = currentHeight + (targetHeight - currentHeight) * easingFactor;

        lastHeights[i] = eased;

        bars[i].setAttribute('y', `${100 - eased}`);
        bars[i].setAttribute('height', `${eased}`);
    }
}
