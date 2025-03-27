const modeRadios = document.querySelectorAll('input[name="mode"]');
const sleepOptions = document.getElementById('sleep-options');
const toneOptions = document.getElementById('tone-options');
const stateSelect = document.getElementById('state');
const beatFrequencyInput = document.getElementById('beat-frequency');
const customFrequencyInput = document.getElementById('custom-hz');
const volumeSlider = document.getElementById('volume');
const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const resetButton = document.getElementById('reset');
const carrierFrequencyInput = document.getElementById('carrier-frequency');
const secondCarrierInput = document.getElementById('second-carrier');
const totalTimeInput = document.getElementById('total-time');
const transitionTimeInput = document.getElementById('transition-time');
const riseTimeInput = document.getElementById('rise-time');
const timelineSlider = document.getElementById('timeline');
const panningCheckbox = document.getElementById('panning');
const waveCanvas = document.getElementById('wave-canvas');
const ctx = waveCanvas.getContext('2d');

let leftOsc, rightOsc, leftGain, rightGain, lfoLeft, lfoRight, masterGain, startTime, totalDuration, intervalId, beatFrequency;
let animationFrameId;

// Set initial canvas width and handle resize
function resizeCanvas() {
  const containerWidth = waveCanvas.parentElement.clientWidth - 20; // Account for 10px padding on each side
  waveCanvas.width = containerWidth;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial call to set width

// Toggle mode options and update visualization
modeRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    sleepOptions.style.display = radio.value === 'sleep' ? 'block' : 'none';
    toneOptions.style.display = radio.value === 'tone' ? 'block' : 'none';
    updateAudio();
    startVisualization(); // Update canvas when mode changes
  });
});

// Update beat frequency based on selected preset
stateSelect.addEventListener('change', () => {
  const state = stateSelect.value;
  switch (state) {
    case 'gamma': beatFrequencyInput.value = 40; break;
    case 'beta': beatFrequencyInput.value = 20; break;
    case 'alpha': beatFrequencyInput.value = 10; break;
    case 'theta': beatFrequencyInput.value = 6; break;
    case 'delta': beatFrequencyInput.value = 2; break;
    case 'study': beatFrequencyInput.value = 14; break;
    case 'meditation': beatFrequencyInput.value = 7; break;
    case 'energy': beatFrequencyInput.value = 25; break;
  }
  updateAudio();
});

// Real-time updates
carrierFrequencyInput.addEventListener('input', updateAudio);
secondCarrierInput.addEventListener('input', updateAudio);
volumeSlider.addEventListener('input', updateVolume);
beatFrequencyInput.addEventListener('input', updateAudio);
customFrequencyInput.addEventListener('input', updateAudio);
panningCheckbox.addEventListener('change', updateAudio);
totalTimeInput.addEventListener('input', updateAudio);
transitionTimeInput.addEventListener('input', updateAudio);
riseTimeInput.addEventListener('input', updateAudio);

// Play audio
playButton.addEventListener('click', async () => {
  await Tone.start();
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const carrier = parseFloat(carrierFrequencyInput.value) || 200;
  const volume = volumeSlider.value / 100;

  if (leftOsc) {
    leftOsc.stop();
    rightOsc.stop();
    lfoLeft?.stop();
    lfoRight?.stop();
  }

  masterGain = new Tone.Gain(volume).toDestination();
  leftGain = new Tone.Gain(1);
  rightGain = new Tone.Gain(1);

  if (mode === 'sleep') {
    totalDuration = parseInt(totalTimeInput.value) * 60;
    const secondCarrier = parseFloat(secondCarrierInput.value) || 150;
    const transitionTime = parseInt(transitionTimeInput.value) * 60;
    const riseTime = parseInt(riseTimeInput.value) * 60;
    beatFrequency = 2;

    leftOsc = new Tone.Oscillator(carrier, 'sine');
    rightOsc = new Tone.Oscillator(carrier + beatFrequency, 'sine');

    const leftPanner = new Tone.Panner(-1).connect(masterGain);
    const rightPanner = new Tone.Panner(1).connect(masterGain);
    leftOsc.connect(leftGain).connect(leftPanner);
    rightOsc.connect(rightGain).connect(rightPanner);

    lfoLeft = new Tone.LFO(beatFrequency, 0.5, 1).start();
    lfoRight = new Tone.LFO(beatFrequency, 0.5, 1).start();
    lfoRight.phase = 180;

    leftOsc.start();
    rightOsc.start();

    scheduleSleepCycle(transitionTime, riseTime, totalDuration, carrier, secondCarrier);
    startTime = Tone.now();
    updateTimeline();
    startVisualization();
  } else {
    beatFrequency = parseFloat(beatFrequencyInput.value) || parseFloat(customFrequencyInput.value) || 10;

    leftOsc = new Tone.Oscillator(carrier, 'sine');
    rightOsc = new Tone.Oscillator(carrier + beatFrequency, 'sine');

    const leftPanner = new Tone.Panner(-1).connect(masterGain);
    const rightPanner = new Tone.Panner(1).connect(masterGain);
    leftOsc.connect(leftGain).connect(leftPanner);
    rightOsc.connect(rightGain).connect(rightPanner);

    lfoLeft = new Tone.LFO(beatFrequency, 0.5, 1).start();
    lfoRight = new Tone.LFO(beatFrequency, 0.5, 1).start();
    lfoRight.phase = 180;

    leftOsc.start();
    rightOsc.start();

    startVisualization();
  }

  updateAudio();
});

// Stop audio
stopButton.addEventListener('click', () => {
  if (leftOsc) {
    masterGain.gain.rampTo(0, 2);
    setTimeout(() => {
      leftOsc.stop();
      rightOsc.stop();
      lfoLeft?.stop();
      lfoRight?.stop();
      leftOsc = null;
      rightOsc = null;
      lfoLeft = null;
      lfoRight = null;
      clearInterval(intervalId);
      timelineSlider.value = 0;
      cancelAnimationFrame(animationFrameId);
    }, 2000);
  }
});

// Reset settings
resetButton.addEventListener('click', () => {
  if (leftOsc) {
    masterGain.gain.rampTo(0, 2);
    setTimeout(() => {
      leftOsc.stop();
      rightOsc.stop();
      lfoLeft?.stop();
      lfoRight?.stop();
      leftOsc = null;
      rightOsc = null;
      lfoLeft = null;
      lfoRight = null;
      clearInterval(intervalId);
      cancelAnimationFrame(animationFrameId);
    }, 2000);
  }

  carrierFrequencyInput.value = 200;
  volumeSlider.value = 50;
  panningCheckbox.checked = false;
  document.querySelector('input[name="mode"][value="tone"]').checked = true;
  sleepOptions.style.display = 'none';
  toneOptions.style.display = 'block';
  stateSelect.value = 'alpha';
  beatFrequencyInput.value = 10;
  customFrequencyInput.value = 10;
  secondCarrierInput.value = 150;
  totalTimeInput.value = 480;
  transitionTimeInput.value = 30;
  riseTimeInput.value = 30;
  timelineSlider.value = 0;

  updateAudio();
  updateVolume();
  startVisualization(); // Update canvas after reset
});

// Update audio parameters and visualization
function updateAudio() {
  if (leftOsc && rightOsc) {
    const mode = document.querySelector('input[name="mode"]:checked').value;
    const carrier = parseFloat(carrierFrequencyInput.value) || 200;
    const panningEnabled = panningCheckbox.checked;

    if (mode === 'sleep') {
      const elapsed = Tone.now() - startTime;
      const transitionTime = parseInt(transitionTimeInput.value) * 60;
      const riseTime = parseInt(riseTimeInput.value) * 60;
      const totalDuration = parseInt(totalTimeInput.value) * 60;
      const secondCarrier = parseFloat(secondCarrierInput.value) || 150;
      beatFrequency = 2;
      const currentCarrier = getCurrentCarrier(elapsed, transitionTime, riseTime, totalDuration, carrier, secondCarrier);
      leftOsc.frequency.value = currentCarrier;
      rightOsc.frequency.value = currentCarrier + beatFrequency;

      if (panningEnabled) {
        lfoLeft.frequency.value = beatFrequency;
        lfoRight.frequency.value = beatFrequency;
        lfoLeft.connect(leftGain.gain);
        lfoRight.connect(rightGain.gain);
      } else {
        lfoLeft.disconnect();
        lfoRight.disconnect();
        leftGain.gain.value = 1;
        rightGain.gain.value = 1;
      }
    } else {
      beatFrequency = parseFloat(beatFrequencyInput.value) || parseFloat(customFrequencyInput.value) || 10;
      leftOsc.frequency.value = carrier;
      rightOsc.frequency.value = carrier + beatFrequency;

      if (panningEnabled) {
        lfoLeft.frequency.value = beatFrequency;
        lfoRight.frequency.value = beatFrequency;
        lfoLeft.connect(leftGain.gain);
        lfoRight.connect(rightGain.gain);
      } else {
        lfoLeft.disconnect();
        lfoRight.disconnect();
        leftGain.gain.value = 1;
        rightGain.gain.value = 1;
      }
    }
  }
}

// Update volume
function updateVolume() {
  const volume = volumeSlider.value / 100;
  if (masterGain) masterGain.gain.value = volume;
}

// Schedule sleep cycle carrier changes
function scheduleSleepCycle(transitionTime, riseTime, totalDuration, startCarrier, secondCarrier) {
  leftOsc.frequency.setValueAtTime(startCarrier, Tone.now());
  leftOsc.frequency.linearRampTo(secondCarrier, transitionTime, Tone.now());
  leftOsc.frequency.setValueAtTime(secondCarrier, Tone.now() + totalDuration - riseTime);
  leftOsc.frequency.linearRampTo(startCarrier, riseTime, Tone.now() + totalDuration - riseTime);

  rightOsc.frequency.setValueAtTime(startCarrier + 2, Tone.now());
  rightOsc.frequency.linearRampTo(secondCarrier + 2, transitionTime, Tone.now());
  rightOsc.frequency.setValueAtTime(secondCarrier + 2, Tone.now() + totalDuration - riseTime);
  rightOsc.frequency.linearRampTo(startCarrier + 2, riseTime, Tone.now() + totalDuration - riseTime);
}

// Update timeline
function updateTimeline() {
  intervalId = setInterval(() => {
    if (leftOsc) {
      const elapsed = Tone.now() - startTime;
      const progress = (elapsed / totalDuration) * 100;
      timelineSlider.value = Math.min(progress, 100);
      if (progress >= 100) clearInterval(intervalId);
    }
  }, 1000);
}

timelineSlider.addEventListener('input', () => {
  if (leftOsc) {
    const progress = parseFloat(timelineSlider.value);
    const newTime = (progress / 100) * totalDuration;
    startTime = Tone.now() - newTime;
    updateAudio();
  }
});

// Calculate current carrier frequency
function getCurrentCarrier(elapsed, transitionTime, riseTime, totalDuration, startCarrier, secondCarrier) {
  if (elapsed < transitionTime) {
    return startCarrier + (secondCarrier - startCarrier) * (elapsed / transitionTime);
  } else if (elapsed < totalDuration - riseTime) {
    return secondCarrier;
  } else {
    const timeLeft = totalDuration - elapsed;
    return secondCarrier + (startCarrier - secondCarrier) * (1 - timeLeft / riseTime);
  }
}

// Start visualization loop
function startVisualization() {
  cancelAnimationFrame(animationFrameId);
  const mode = document.querySelector('input[name="mode"]:checked').value;
  if (mode === 'sleep') {
    visualizeSleepCycle();
  } else {
    visualizeBeatFrequency();
  }
}

// Visualize beat frequency with two lines
function visualizeBeatFrequency() {
  let phaseLeft = 0;
  let phaseRight = 0;

  function draw() {
    const carrier = parseFloat(carrierFrequencyInput.value) || 200;
    beatFrequency = parseFloat(beatFrequencyInput.value) || parseFloat(customFrequencyInput.value) || 10;

    ctx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);

    // Left ear (blue)
    ctx.beginPath();
    ctx.moveTo(0, waveCanvas.height / 2);
    for (let x = 0; x <= waveCanvas.width; x++) {
      const t = x / waveCanvas.width * 2 * Math.PI;
      const y = waveCanvas.height / 2 + Math.sin(t + (leftOsc ? phaseLeft : 0)) * 50;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#00f';
    ctx.stroke();

    // Right ear (red)
    ctx.beginPath();
    ctx.moveTo(0, waveCanvas.height / 2);
    for (let x = 0; x <= waveCanvas.width; x++) {
      const t = x / waveCanvas.width * 2 * Math.PI;
      const y = waveCanvas.height / 2 + Math.sin(t + (leftOsc ? phaseRight : 0)) * 50;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#f00';
    ctx.stroke();

    if (leftOsc) {
      phaseLeft += beatFrequency * 0.01;
      phaseRight += (carrier + beatFrequency) * 0.01;
      animationFrameId = requestAnimationFrame(draw);
    }
  }
  draw();
}

// Visualize sleep cycle with two lines
function visualizeSleepCycle() {
  let phaseLeft = 0;
  let phaseRight = 0;

  function draw() {
    const elapsed = leftOsc ? Tone.now() - startTime : 0;
    const transitionTime = parseInt(transitionTimeInput.value) * 60;
    const riseTime = parseInt(riseTimeInput.value) * 60;
    const totalDuration = parseInt(totalTimeInput.value) * 60;
    const startCarrier = parseFloat(carrierFrequencyInput.value) || 200;
    const secondCarrier = parseFloat(secondCarrierInput.value) || 150;
    beatFrequency = 2;

    ctx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);

    // Left ear (blue)
    ctx.beginPath();
    ctx.moveTo(0, waveCanvas.height / 2);
    for (let x = 0; x <= waveCanvas.width; x++) {
      const time = (x / waveCanvas.width) * totalDuration;
      const carrier = getCurrentCarrier(time, transitionTime, riseTime, totalDuration, startCarrier, secondCarrier);
      const t = x / waveCanvas.width * 2 * Math.PI;
      const y = waveCanvas.height / 2 + Math.sin(t * beatFrequency + (leftOsc ? phaseLeft : 0)) * (carrier / 1000) * 50;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#00f';
    ctx.stroke();

    // Right ear (red)
    ctx.beginPath();
    ctx.moveTo(0, waveCanvas.height / 2);
    for (let x = 0; x <= waveCanvas.width; x++) {
      const time = (x / waveCanvas.width) * totalDuration;
      const carrier = getCurrentCarrier(time, transitionTime, riseTime, totalDuration, startCarrier, secondCarrier);
      const t = x / waveCanvas.width * 2 * Math.PI;
      const y = waveCanvas.height / 2 + Math.sin(t * beatFrequency + (leftOsc ? phaseRight : 0)) * (carrier / 1000) * 50;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#f00';
    ctx.stroke();

    // Current position indicator (if playing)
    if (leftOsc) {
      const progress = Math.min((elapsed / totalDuration) * waveCanvas.width, waveCanvas.width);
      ctx.beginPath();
      ctx.moveTo(progress, 0);
      ctx.lineTo(progress, waveCanvas.height);
      ctx.strokeStyle = '#fff';
      ctx.stroke();

      phaseLeft += beatFrequency * 0.01;
      phaseRight += (beatFrequency + 2) * 0.01;
      animationFrameId = requestAnimationFrame(draw);
    }
  }
  draw();
}

// Initial visualization on page load
startVisualization();
