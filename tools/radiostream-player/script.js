function initRadioStreamPlayer() {
    const audio = new Audio();
    const stationSelect = document.getElementById('station-select');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const nowPlaying = document.getElementById('now-playing');
    const leftVuLevel = document.getElementById('left-vu-level');
    const rightVuLevel = document.getElementById('right-vu-level');
    let isPlaying = false;

    // Web Audio API setup
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaElementSource(audio);
    const splitter = audioContext.createChannelSplitter(2); // Split into left and right channels
    const analyserLeft = audioContext.createAnalyser();
    const analyserRight = audioContext.createAnalyser();
    analyserLeft.fftSize = 256;
    analyserRight.fftSize = 256;

    // Connect audio nodes
    source.connect(splitter);
    splitter.connect(analyserLeft, 0); // Left channel
    splitter.connect(analyserRight, 1); // Right channel
    source.connect(audioContext.destination); // Connect to speakers

    // Arrays to hold frequency data
    const bufferLength = analyserLeft.frequencyBinCount;
    const dataArrayLeft = new Uint8Array(bufferLength);
    const dataArrayRight = new Uint8Array(bufferLength);

    // Set initial station
    audio.src = stationSelect.value;
    audio.volume = volumeSlider.value;
    audio.crossOrigin = 'anonymous'; // Required for Web Audio API with cross-origin streams

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
            const sample = (dataArrayLeft[i] - 128) / 128; // Normalize to -1 to 1
            sumLeft += sample * sample;
        }
        const rmsLeft = Math.sqrt(sumLeft / bufferLength);
        const levelLeft = Math.min(rmsLeft * 200, 100); // Scale to 0-100%

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

    // Start VU meter animation
    updateVUMeters();

    // Update now-playing on load
    updateNowPlaying();
}

if (document.getElementById('station-select')) {
    initRadioStreamPlayer();
}
