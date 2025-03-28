function initPopoutPlayer() {
    const audio = new Audio();
    const stationSelect = document.getElementById('station-select');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const nowPlaying = document.getElementById('now-playing');
    let isPlaying = false;

    // Apply the theme from the URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const theme = urlParams.get('theme');
    if (theme) {
        document.documentElement.classList.add(theme);
    }

    // Set initial station from URL parameter
    const initialStation = urlParams.get('station') || stationSelect.value;
    stationSelect.value = initialStation;
    audio.src = initialStation;
    audio.volume = volumeSlider.value;
    audio.crossOrigin = 'anonymous';

    // Update now-playing display
    function updateNowPlaying() {
        const stationName = stationSelect.options[stationSelect.selectedIndex].text;
        nowPlaying.textContent = `Now Playing: ${stationName}`;
    }

    // Play/Pause toggle
    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            playPauseBtn.textContent = 'Play';
        } else {
            audio.play().catch(err => {
                console.error('Playback failed:', err);
                nowPlaying.textContent = 'Error: Unable to play stream';
            });
            playPauseBtn.textContent = 'Pause';
        }
        isPlaying = !isPlaying;
    });

    // Station change
    stationSelect.addEventListener('change', () => {
        audio.src = stationSelect.value;
        updateNowPlaying();
        if (isPlaying) {
            audio.play().catch(err => {
                console.error('Playback failed:', err);
                nowPlaying.textContent = 'Error: Unable to play stream';
            });
        }
    });

    // Volume control
    volumeSlider.addEventListener('input', () => {
        audio.volume = volumeSlider.value;
    });

    // Update now-playing on load
    updateNowPlaying();

    // Notify main window when pop-out is closed
    window.addEventListener('beforeunload', () => {
        if (window.opener) {
            window.opener.postMessage({ type: 'popoutClosed' }, '*');
        }
    });
}

initPopoutPlayer();
