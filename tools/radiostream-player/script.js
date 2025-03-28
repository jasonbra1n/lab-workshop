// Global variables to persist across page changes
let audio = null;
let audioContext = null;
let source = null;
let splitter = null;
let analyserLeft = null;
let analyserRight = null;
let isPlaying = false;
let currentStation = 'https://stream.pcradio.ru/etnfm_trance-hi'; // Default station
let volume = 0.5; // Default volume

function initRadioStreamPlayer() {
    const stationSelect = document.getElementById('station-select');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const nowPlaying = document.getElementById('now-playing');
    const leftVuLevel = document.getElementById('left-vu-level');
    const rightVuLevel = document.getElementById('right-vu-level');

    // Initialize audio and Web Audio API if not already done
    if (!audio) {
        audio = new Audio();
        audio.crossOrigin = 'anonymous';

        // Web Audio API setup
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        source = audioContext.createMediaElementSource(audio);
        splitter = audioContext.createChannelSplitter(2);
        analyserLeft = audioContext.createAnalyser();
        analyserRight = audioContext.createAnalyser();
        analyserLeft.fftSize = 256;
        analyserRight.fftSize = 256;

        // Connect audio nodes
        source.connect(splitter);
        splitter.connect(analyserLeft, 0);
        splitter.connect(analyserRight, 1);
        source.connect(audioContext.destination);
    }

    // Arrays to hold frequency data
    const bufferLength = analyserLeft.frequencyBinCount;
    const dataArrayLeft = new Uint8Array(bufferLength);
    const dataArrayRight = new Uint8Array(bufferLength);

    // Restore state
    audio.src = currentStation;
    audio.volume = volume;
    stationSelect.value = currentStation;
    volumeSlider.value = volume;
    playPauseBtn.textContent = isPlaying ? 'Pause' : 'Play';
    if (isPlaying) {
        audio.play().catch(err => {
            console.error('Playback failed:', err);
            nowPlaying.textContent = 'Error: Unable to play stream';
        });
    }

    // Update now-playing display
    function updateNowPlaying() {
        const stationName = stationSelect.options[stationSelect.selectedIndex].text;
        nowPlaying.textContent = `Now Playing: ${stationName}`;
    }

    // VU meter animation
    function updateVUMeters() {
        if (!isPlaying) {
            leftVuLevel.style.height = '0%';
            rightVuLevel.style.height = '0%';
            leftVuLevel.style.background = 'green';
            rightVuLevel.style.background = 'green';
            requestAnimationFrame(updateVUMeters);
            return;
        }

        // Get time-domain data (waveform)
        analyserLeft.getByteTimeDomainData(dataArrayLeft);
        analyserRight.getByteTimeDomainData(dataArrayRight);

        // Calculate RMS for left channel
        let sumLeft = 0;
        for (let i = 0; i < bufferLength; i++) {
            const sample = (dataArrayLeft[i] - 128) / 128;
            sumLeft += sample * sample;
        }
        const rmsLeft = Math.sqrt(sumLeft / bufferLength);
        const levelLeft = Math.min(rmsLeft * 200, 100);

        // Calculate RMS for right channel
        let sumRight = 0;
        for (let i = 0; i < bufferLength; i++) {
            const sample = (dataArrayRight[i] - 128) / 128;
            sumRight += sample * sample;
        }
        const rmsRight = Math.sqrt(sumRight / bufferLength);
        const levelRight = Math.min(rmsRight * 200, 100);

        // Update VU meter heights
        leftVuLevel.style.height = `${levelLeft}%`;
        rightVuLevel.style.height = `${levelRight}%`;

        // Update colors based on level
        const colorLeft = levelLeft < 60 ? 'green' : levelLeft < 85 ? 'yellow' : 'red';
        const colorRight = levelRight < 60 ? 'green' : levelRight < 85 ? 'yellow' : 'red';
        leftVuLevel.style.background = colorLeft;
        rightVuLevel.style.background = colorRight;

        requestAnimationFrame(updateVUMeters);
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
        updateNowPlaying();
    });

    // Station change
    stationSelect.addEventListener('change', () => {
        currentStation = stationSelect.value;
        audio.src = currentStation;
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
        volume = volumeSlider.value;
        audio.volume = volume;
    });

    // Start VU meter animation
    updateVUMeters();

    // Update now-playing on load
    updateNowPlaying();
}

// Pause audio when leaving the page
document.addEventListener('toolChange', (e) => {
    if (e.detail.tool !== 'radiostream-player' && audio && isPlaying) {
        audio.pause();
        isPlaying = false;
    }
});

if (document.getElementById('station-select')) {
    initRadioStreamPlayer();
}
