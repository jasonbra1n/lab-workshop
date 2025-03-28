// Global audio state to persist across tool loads
window.radioStreamState = window.radioStreamState || {
    audio: null,
    isPlaying: false,
    currentStation: null,
    volume: 0.5,
    audioContext: null,
    source: null,
    splitter: null,
    analyserLeft: null,
    analyserRight: null,
    animationFrameId: null,
    popoutWindow: null
};

function initRadioStreamPlayer() {
    const state = window.radioStreamState;
    let audio = state.audio;
    let audioContext = state.audioContext;
    let source = state.source;
    let splitter = state.splitter;
    let analyserLeft = state.analyserLeft;
    let analyserRight = state.analyserRight;

    const stationSelect = document.getElementById('station-select');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const popoutBtn = document.getElementById('popout-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const nowPlaying = document.getElementById('now-playing');
    const leftVuLevel = document.getElementById('left-vu-level');
    const rightVuLevel = document.getElementById('right-vu-level');

    // Initialize audio and Web Audio API if not already set up
    if (!audio) {
        audio = new Audio();
        audio.crossOrigin = 'anonymous';
        state.audio = audio;

        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        source = audioContext.createMediaElementSource(audio);
        splitter = audioContext.createChannelSplitter(2);
        analyserLeft = audioContext.createAnalyser();
        analyserRight = audioContext.createAnalyser();
        analyserLeft.fftSize = 256;
        analyserRight.fftSize = 256;

        source.connect(splitter);
        splitter.connect(analyserLeft, 0);
        splitter.connect(analyserRight, 1);
        source.connect(audioContext.destination);

        state.audioContext = audioContext;
        state.source = source;
        state.splitter = splitter;
        state.analyserLeft = analyserLeft;
        state.analyserRight = analyserRight;
    }

    // Arrays to hold frequency data
    const bufferLength = analyserLeft.frequencyBinCount;
    const dataArrayLeft = new Uint8Array(bufferLength);
    const dataArrayRight = new Uint8Array(bufferLength);

    // Restore or set initial state
    audio.src = state.currentStation || stationSelect.value;
    audio.volume = state.volume || volumeSlider.value;
    let isPlaying = state.isPlaying;

    // Update UI based on state
    if (state.currentStation) {
        stationSelect.value = state.currentStation;
    }
    volumeSlider.value = audio.volume;
    playPauseBtn.textContent = isPlaying ? 'Pause' : 'Play';

    // Update now-playing display
    function updateNowPlaying() {
        const stationName = stationSelect.options[stationSelect.selectedIndex].text;
        nowPlaying.textContent = `Now Playing: ${stationName}`;
        state.currentStation = stationSelect.value;
    }

    // VU meter animation
    function updateVUMeters() {
        if (!isPlaying) {
            leftVuLevel.style.height = '0%';
            rightVuLevel.style.height = '0%';
            leftVuLevel.style.background = 'green';
            rightVuLevel.style.background = 'green';
            state.animationFrameId = requestAnimationFrame(updateVUMeters);
            return;
        }

        analyserLeft.getByteTimeDomainData(dataArrayLeft);
        analyserRight.getByteTimeDomainData(dataArrayRight);

        let sumLeft = 0;
        for (let i = 0; i < bufferLength; i++) {
            const sample = (dataArrayLeft[i] - 128) / 128;
            sumLeft += sample * sample;
        }
        const rmsLeft = Math.sqrt(sumLeft / bufferLength);
        const levelLeft = Math.min(rmsLeft * 200, 100);

        let sumRight = 0;
        for (let i = 0; i < bufferLength; i++) {
            const sample = (dataArrayRight[i] - 128) / 128;
            sumRight += sample * sample;
        }
        const rmsRight = Math.sqrt(sumRight / bufferLength);
        const levelRight = Math.min(rmsRight * 200, 100);

        leftVuLevel.style.height = `${levelLeft}%`;
        rightVuLevel.style.height = `${levelRight}%`;

        const colorLeft = levelLeft < 60 ? 'green' : levelLeft < 85 ? 'yellow' : 'red';
        const colorRight = levelRight < 60 ? 'green' : levelRight < 85 ? 'yellow' : 'red';
        leftVuLevel.style.background = colorLeft;
        rightVuLevel.style.background = colorRight;

        state.animationFrameId = requestAnimationFrame(updateVUMeters);
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
        state.isPlaying = isPlaying;
        updateNowPlaying();
    });

    // Station change
    stationSelect.addEventListener('change', () => {
        audio.src = stationSelect.value;
        state.currentStation = stationSelect.value;
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
        state.volume = audio.volume;
    });

    // Pop-out button
    popoutBtn.addEventListener('click', () => {
        if (state.popoutWindow && !state.popoutWindow.closed) {
            state.popoutWindow.focus();
            return;
        }

        // Pause main player
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
            state.isPlaying = false;
            playPauseBtn.textContent = 'Play';
        }

        // Open pop-out window
        const popoutUrl = `tools/radiostream-player/popout.html?station=${encodeURIComponent(stationSelect.value)}`;
        state.popoutWindow = window.open(popoutUrl, 'RadioStreamPopout', 'width=300,height=400');
    });

    // Listen for pop-out close event
    window.addEventListener('message', (event) => {
        if (event.data.type === 'popoutClosed') {
            state.popoutWindow = null;
            if (state.isPlaying) {
                audio.play().catch(err => {
                    console.error('Playback failed:', err);
                    nowPlaying.textContent = 'Error: Unable to play stream';
                });
                isPlaying = true;
                playPauseBtn.textContent = 'Pause';
            }
        }
    });

    // Start VU meter animation
    updateVUMeters();

    // Update now-playing on load
    updateNowPlaying();

    // Cleanup function to pause audio and stop animation when tool unloads
    window.addEventListener('beforeunload', cleanup);
    document.addEventListener('toolUnload', cleanup);

    function cleanup() {
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
            state.isPlaying = false;
            playPauseBtn.textContent = 'Play';
        }
        if (state.animationFrameId) {
            cancelAnimationFrame(state.animationFrameId);
            state.animationFrameId = null;
        }
    }
}

if (document.getElementById('station-select')) {
    initRadioStreamPlayer();
}
