// Global variables to persist across page changes
let audio = null;
let audioContext = null;
let source = null;
let splitter = null;
let analyserLeft = null;
let analyserRight = null;
let isPlaying = false;
let currentStation = 'https://stream.pcradio.ru/etnfm_trance-hi';
let volume = 0.5;
let popoutWindow = null;

function initRadioStreamPlayer() {
    const stationSelect = document.getElementById('station-select');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const popoutBtn = document.getElementById('popout-btn');
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
        // Sync pop-out window if open
        if (popoutWindow && !popoutWindow.closed) {
            popoutWindow.postMessage({ type: 'sync', isPlaying, currentStation, volume }, '*');
        }
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
        // Sync pop-out window if open
        if (popoutWindow && !popoutWindow.closed) {
            popoutWindow.postMessage({ type: 'sync', isPlaying, currentStation, volume }, '*');
        }
    });

    // Volume control
    volumeSlider.addEventListener('input', () => {
        volume = volumeSlider.value;
        audio.volume = volume;
        // Sync pop-out window if open
        if (popoutWindow && !popoutWindow.closed) {
            popoutWindow.postMessage({ type: 'sync', isPlaying, currentStation, volume }, '*');
        }
    });

    // Pop-out button
    popoutBtn.addEventListener('click', () => {
        if (popoutWindow && !popoutWindow.closed) {
            popoutWindow.focus();
            return;
        }

        popoutWindow = window.open('', 'RadioStreamPlayer', 'width=400,height=600');
        popoutWindow.document.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Radio Stream Player</title>
                <style>
                    body {
                        margin: 0;
                        padding: 20px;
                        font-family: Arial, sans-serif;
                        background: var(--card-bg, #f8fafc);
                        color: var(--text-color, #333);
                    }
                    .radiostream-player {
                        background: var(--card-bg, #f8fafc);
                        border-radius: 16px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        padding: 20px;
                        display: flex;
                        gap: 20px;
                        align-items: stretch;
                    }
                    .vu-meters {
                        display: flex;
                        flex-direction: row;
                        justify-content: center;
                        gap: 10px;
                        width: 80px;
                        align-items: stretch;
                    }
                    .vu-meter {
                        background: var(--console-bg, #f5f5f5);
                        border-radius: 8px;
                        height: 100%;
                        width: 15px;
                        position: relative;
                        overflow: hidden;
                        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
                        border: 1px solid var(--border-color, #d1d5db);
                    }
                    .vu-level {
                        position: absolute;
                        bottom: 0;
                        width: 100%;
                        background: green;
                        transition: height 0.1s ease, background 0.1s ease;
                    }
                    .player-content {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        gap: 20px;
                    }
                    .station-selector label {
                        display: block;
                        margin-bottom: 8px;
                        font-weight: bold;
                        font-size: 1.1em;
                        color: var(--primary-color, #2563eb);
                    }
                    .station-selector select {
                        width: 100%;
                        padding: 10px;
                        border: 1px solid var(--primary-color, #2563eb);
                        border-radius: 8px;
                        background: var(--console-bg, #f5f5f5);
                        color: var(--text-color, #333);
                        font-size: 1rem;
                        cursor: pointer;
                    }
                    .station-selector select:focus {
                        outline: none;
                        border-color: var(--primary-hover, #1d4ed8);
                    }
                    .player-controls {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 15px;
                    }
                    .console-btn {
                        background: var(--sub-button-color, #2563eb);
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 1em;
                        transition: background 0.3s ease;
                    }
                    .console-btn:hover {
                        background: var(--sub-button-hover, #1d4ed8);
                    }
                    .volume-control {
                        width: 100%;
                        max-width: 300px;
                    }
                    .volume-control label {
                        display: block;
                        margin-bottom: 8px;
                        font-weight: bold;
                        font-size: 1em;
                        color: var(--primary-color, #2563eb);
                    }
                    .volume-control input[type="range"] {
                        width: 100%;
                        -webkit-appearance: none;
                        appearance: none;
                        height: 8px;
                        background: var(--border-color, #d1d5db);
                        border-radius: 5px;
                        outline: none;
                    }
                    .volume-control input[type="range"]::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        appearance: none;
                        width: 20px;
                        height: 20px;
                        background: var(--primary-color, #2563eb);
                        border-radius: 50%;
                        cursor: pointer;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    }
                    .volume-control input[type="range"]::-moz-range-thumb {
                        width: 20px;
                        height: 20px;
                        background: var(--primary-color, #2563eb);
                        border-radius: 50%;
                        cursor: pointer;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    }
                    .volume-control input[type="range"]:hover {
                        background: var(--primary-hover, #1d4ed8);
                    }
                    .now-playing {
                        font-size: 1.2em;
                        font-weight: 500;
                        color: var(--primary-color, #2563eb);
                        background: var(--console-bg, #f5f5f5);
                        padding: 10px 15px;
                        border-radius: 8px;
                        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                </style>
            </head>
            <body>
                <div class="radiostream-player">
                    <div class="vu-meters">
                        <div class="vu-meter" id="left-vu">
                            <div class="vu-level" id="left-vu-level"></div>
                        </div>
                        <div class="vu-meter" id="right-vu">
                            <div class="vu-level" id="right-vu-level"></div>
                        </div>
                    </div>
                    <div class="player-content">
                        <div class="station-selector">
                            <label for="station-select">Select Station:</label>
                            <select id="station-select">
                                <option value="https://stream.pcradio.ru/etnfm_trance-hi">ETN-FM Trance</option>
                                <option value="https://sonafm.stream.laut.fm/sonafm">Sona FM</option>
                                <option value="https://cast.magicstreams.gr/sc/psyndora/stream">Psyndora Psytrance</option>
                                <option value="https://dc1.serverse.com/proxy/ywycfrxn/stream">DMT-FM</option>
                                <option value="https://strm112.1.fm/psytrance_mobile_mp3?aw_0_req.gdpr=true">BOM Psytrance Radio</option>
                                <option value="https://s2.radio.co/s2696f08b5/listen">Psychedelic FM</option>
                            </select>
                        </div>
                        <div class="player-controls">
                            <button class="console-btn" id="play-pause-btn">Play</button>
                            <div class="volume-control">
                                <label for="volume-slider">Volume:</label>
                                <input type="range" id="volume-slider" min="0" max="1" step="0.01" value="0.5">
                            </div>
                        </div>
                        <div class="now-playing" id="now-playing">Now Playing: ETN-FM Trance</div>
                    </div>
                </div>
                <script>
                    let isPlaying = ${isPlaying};
                    let currentStation = '${currentStation}';
                    let volume = ${volume};

                    const stationSelect = document.getElementById('station-select');
                    const playPauseBtn = document.getElementById('play-pause-btn');
                    const volumeSlider = document.getElementById('volume-slider');
                    const nowPlaying = document.getElementById('now-playing');
                    const leftVuLevel = document.getElementById('left-vu-level');
                    const rightVuLevel = document.getElementById('right-vu-level');

                    // Sync with main window
                    stationSelect.value = currentStation;
                    volumeSlider.value = volume;
                    playPauseBtn.textContent = isPlaying ? 'Pause' : 'Play';

                    function updateNowPlaying() {
                        const stationName = stationSelect.options[stationSelect.selectedIndex].text;
                        nowPlaying.textContent = \`Now Playing: \${stationName}\`;
                    }

                    // VU meter animation
                    const bufferLength = ${bufferLength};
                    const dataArrayLeft = new Uint8Array(bufferLength);
                    const dataArrayRight = new Uint8Array(bufferLength);

                    function updateVUMeters() {
                        if (!isPlaying) {
                            leftVuLevel.style.height = '0%';
                            rightVuLevel.style.height = '0%';
                            leftVuLevel.style.background = 'green';
                            rightVuLevel.style.background = 'green';
                            requestAnimationFrame(updateVUMeters);
                            return;
                        }

                        window.opener.analyserLeft.getByteTimeDomainData(dataArrayLeft);
                        window.opener.analyserRight.getByteTimeDomainData(dataArrayRight);

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

                        leftVuLevel.style.height = \`\${levelLeft}%\`;
                        rightVuLevel.style.height = \`\${levelRight}%\`;

                        const colorLeft = levelLeft < 60 ? 'green' : levelLeft < 85 ? 'yellow' : 'red';
                        const colorRight = levelRight < 60 ? 'green' : levelRight < 85 ? 'yellow' : 'red';
                        leftVuLevel.style.background = colorLeft;
                        rightVuLevel.style.background = colorRight;

                        requestAnimationFrame(updateVUMeters);
                    }

                    playPauseBtn.addEventListener('click', () => {
                        window.opener.postMessage({ type: 'play-pause' }, '*');
                    });

                    stationSelect.addEventListener('change', () => {
                        window.opener.postMessage({ type: 'station-change', station: stationSelect.value }, '*');
                    });

                    volumeSlider.addEventListener('input', () => {
                        window.opener.postMessage({ type: 'volume-change', volume: volumeSlider.value }, '*');
                    });

                    window.addEventListener('message', (e) => {
                        if (e.data.type === 'sync') {
                            isPlaying = e.data.isPlaying;
                            currentStation = e.data.currentStation;
                            volume = e.data.volume;
                            stationSelect.value = currentStation;
                            volumeSlider.value = volume;
                            playPauseBtn.textContent = isPlaying ? 'Pause' : 'Play';
                            updateNowPlaying();
                        }
                    });

                    updateVUMeters();
                    updateNowPlaying();
                </script>
            </body>
            </html>
        `);
        popoutWindow.addEventListener('unload', () => {
            popoutWindow = null;
        });
    });

    // Handle messages from pop-out window
    window.addEventListener('message', (e) => {
        if (e.data.type === 'play-pause') {
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
            if (popoutWindow && !popoutWindow.closed) {
                popoutWindow.postMessage({ type: 'sync', isPlaying, currentStation, volume }, '*');
            }
        } else if (e.data.type === 'station-change') {
            currentStation = e.data.station;
            audio.src = currentStation;
            stationSelect.value = currentStation;
            updateNowPlaying();
            if (isPlaying) {
                audio.play().catch(err => {
                    console.error('Playback failed:', err);
                    nowPlaying.textContent = 'Error: Unable to play stream';
                });
            }
            if (popoutWindow && !popoutWindow.closed) {
                popoutWindow.postMessage({ type: 'sync', isPlaying, currentStation, volume }, '*');
            }
        } else if (e.data.type === 'volume-change') {
            volume = e.data.volume;
            audio.volume = volume;
            volumeSlider.value = volume;
            if (popoutWindow && !popoutWindow.closed) {
                popoutWindow.postMessage({ type: 'sync', isPlaying, currentStation, volume }, '*');
            }
        }
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
