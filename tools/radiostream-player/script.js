function initRadioStreamPlayer() {
    const audio = new Audio();
    const stationSelect = document.getElementById('station-select');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const nowPlaying = document.getElementById('now-playing');
    const vuMeterLeft = document.getElementById('vu-meter-left');
    const vuMeterRight = document.getElementById('vu-meter-right');
    let isPlaying = false;
    let audioContext, analyserLeft, analyserRight, source, splitter;

    // Set initial station
    audio.src = stationSelect.value;
    audio.volume = volumeSlider.value;
    audio.crossOrigin = 'anonymous'; // Needed for CORS with audio streams

    // Update now-playing display
    function updateNowPlaying() {
        const stationName = stationSelect.options[stationSelect.selectedIndex].text;
        nowPlaying.textContent = `Now Playing: ${stationName}`;
    }

    // Initialize Web Audio API for VU meters
    function setupAudioAnalysis() {
        if (audioContext) {
            audioContext.close(); // Close existing context if any
        }

        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        source = audioContext.createMediaElementSource(audio);
        splitter = audioContext.createChannelSplitter(2); // Split stereo into left and right

        // Create analysers for left and right channels
        analyserLeft = audioContext.createAnalyser();
        analyserRight = audioContext.createAnalyser();
        analyserLeft.fftSize = 2048;
        analyserRight.fftSize = 2048;

        // Connect the audio graph: source -> splitter -> analysers
        source.connect(splitter);
        splitter.connect(analyserLeft, 0); // Left channel
        splitter.connect(analyserRight, 1); // Right channel
        source.connect(audioContext.destination); // Also connect to speakers
    }

    // Update VU meters in real-time
    function updateVUMeters() {
        if (!isPlaying) return;

        // Get time-domain data for left and right channels
        const leftData = new Float32Array(analyserLeft.fftSize);
        const rightData = new Float32Array(analyserRight.fftSize);
        analyserLeft.getFloatTimeDomainData(leftData);
        analyserRight.getFloatTimeDomainData(rightData);

        // Calculate RMS (Root Mean Square) for left and right channels
        let leftSum = 0, rightSum = 0;
        for (let i = 0; i < leftData.length; i++) {
            leftSum += leftData[i] * leftData[i];
            rightSum += rightData[i] * rightData[i];
        }
        const leftRMS = Math.sqrt(leftSum / leftData.length);
        const rightRMS = Math.sqrt(rightSum / rightData.length);

        // Convert RMS to dB (relative to full scale, 0 dB = 1)
        const leftDB = 20 * Math.log10(Math.max(leftRMS, 0.00001)); // Avoid log(0)
        const rightDB = 20 * Math.log10(Math.max(rightRMS, 0.00001));

        // Map dB to percentage (assuming -60 dB is 0% and 0 dB is 100%)
        const leftPercent = Math.max(0, Math.min(100, ((leftDB + 60) / 60) * 100));
        const rightPercent = Math.max(0, Math.min(100, ((rightDB + 60) / 60) * 100));

        // Determine color based on dB level
        function getColor(db) {
            if (db > -6) return 'red'; // Above -6 dB
            if (db > -12) return 'yellow'; // -12 dB to -6 dB
            return 'green'; // Below -12 dB
        }

        // Update left VU meter
        vuMeterLeft.querySelector('::after').style.height = `${leftPercent}%`;
        vuMeterLeft.querySelector('::after').style.background = getColor(leftDB);

        // Update right VU meter
        vuMeterRight.querySelector('::after').style.height = `${rightPercent}%`;
        vuMeterRight.querySelector('::after').style.background = getColor(rightDB);

        // Continue updating
        requestAnimationFrame(updateVUMeters);
    }

    // Play/Pause toggle
    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            playPauseBtn.textContent = 'Play';
            isPlaying = false;
        } else {
            audio.play().catch(err => {
                console.error('Playback failed:', err);
                nowPlaying.textContent = 'Error: Unable to play stream';
            });
            playPauseBtn.textContent = 'Pause';
            isPlaying = true;
            setupAudioAnalysis(); // Set up audio analysis when starting playback
            updateVUMeters(); // Start updating VU meters
        }
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
            setupAudioAnalysis(); // Reinitialize audio analysis for new stream
        }
    });

    // Volume control
    volumeSlider.addEventListener('input', () => {
        audio.volume = volumeSlider.value;
    });

    // Update now-playing on load
    updateNowPlaying();
}

if (document.getElementById('station-select')) {
    initRadioStreamPlayer();
}
