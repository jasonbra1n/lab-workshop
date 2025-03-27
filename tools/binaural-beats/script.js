const modeRadios = document.querySelectorAll('input[name="mode"]');
const sleepOptions = document.getElementById('sleep-options');
const toneOptions = document.getElementById('tone-options');
const stateSelect = document.getElementById('state');
const beatFrequencyInput = document.getElementById('beat-frequency');
const customFrequencyInput = document.getElementById('custom-hz');
const volumeSlider = document.getElementById('volume');
const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
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

// Toggle mode options
modeRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    sleepOptions.style.display = radio.value === 'sleep' ? 'block' : 'none';
    toneOptions.style.display = radio.value === 'tone' ? 'block' : 'none';
    updateAudio();
  });
});

// Update beat frequency input range based on selected state
stateSelect.addEventListener('change', () => {
  const state = stateSelect.value;
  switch (state) {
    case 'gamma':
      beatFrequencyInput.min = 30.1;
      beatFrequencyInput.max = 100;
      beatFrequencyInput.value = 40;
      break;
    case 'beta':
      beatFrequencyInput.min = 13;
      beatFrequencyInput.max = 30;
      beatFrequencyInput.value = 20;
      break;
    case 'alpha':
      beatFrequencyInput.min = 8;
      beatFrequencyInput.max = 12;
      beatFrequencyInput.value = 10;
      break;
    case 'theta':
      beatFrequencyInput.min = 4;
      beatFrequencyInput.max = 8;
      beatFrequencyInput.value = 6;
      break;
    case 'delta':
      beatFrequencyInput.min = 0.5;
      beatFrequencyInput.max = 4;
      beatFrequencyInput.value = 2;
      break;
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
    visualizeSleepCycle();
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

    visualizeBeatFrequency(beatFrequency);
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
    }, 2000);
  }
});

// Remaining functions (updateAudio, updateVolume, etc.) remain unchanged
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

function updateVolume() {
  const volume = volumeSlider.value / 100;
  if (masterGain) masterGain.gain.value = volume;
}

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

function visualizeBeatFrequency(beatFrequency) {
  let phase = 0;
  function draw() {
    requestAnimationFrame(draw);
    phase += 0.01;
    ctx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
    ctx.beginPath();
    for (let x = 0; x < waveCanvas.width; x++) {
      const y = waveCanvas.height / 2 + Math.sin(x * 0.01 * beatFrequency + phase) * 50;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
  }
  draw();
}

function visualizeSleepCycle() {
  function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
    const elapsed = Tone.now() - startTime;
    const beatFrequency = 2;
    ctx.beginPath();
    for (let x = 0; x < waveCanvas.width; x++) {
      const time = (x / waveCanvas.width) * totalDuration;
      const carrier = getCurrentCarrier(time, parseInt(transitionTimeInput.value) * 60, parseInt(riseTimeInput.value) * 60, totalDuration, parseFloat(carrierFrequencyInput.value) || 200, parseFloat(secondCarrierInput.value) || 150);
      const y = waveCanvas.height / 2 + Math.sin(x * 0.01 * beatFrequency) * (carrier / 1000) * 50;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    const progress = Math.min((elapsed / totalDuration) * waveCanvas.width, waveCanvas.width);
    ctx.beginPath();
    ctx.moveTo(progress, 0);
    ctx.lineTo(progress, waveCanvas.height);
    ctx.strokeStyle = '#ff0000';
    ctx.stroke();
  }
  draw();
}
