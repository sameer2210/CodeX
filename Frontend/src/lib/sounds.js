let sharedAudioCtx = null;

const getAudioCtx = () => {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new AudioCtx();
  }
  return sharedAudioCtx;
};

const resumeAudio = ctx => {
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
};

const createPulse = (ctx, { type, frequency, sweepTo, duration, gain, detune = 0, startAt }) => {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const startTime = ctx.currentTime + startAt;

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);
  if (sweepTo) {
    osc.frequency.exponentialRampToValueAtTime(sweepTo, startTime + duration);
  }
  if (detune) {
    osc.detune.setValueAtTime(detune, startTime);
  }

  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.exponentialRampToValueAtTime(gain, startTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
};

export const playHorn = () => {
  const ctx = getAudioCtx();
  if (!ctx) return;
  resumeAudio(ctx);

  createPulse(ctx, {
    type: 'sawtooth',
    frequency: 240,
    sweepTo: 180,
    duration: 0.22,
    gain: 0.06,
    startAt: 0,
  });

  createPulse(ctx, {
    type: 'sawtooth',
    frequency: 240,
    sweepTo: 180,
    duration: 0.22,
    gain: 0.06,
    startAt: 0.32,
  });
};

const playRingtonePulse = () => {
  const ctx = getAudioCtx();
  if (!ctx) return;
  resumeAudio(ctx);

  const base = [
    { frequency: 520, sweepTo: 480, startAt: 0 },
    { frequency: 660, sweepTo: 620, startAt: 0.25 },
    { frequency: 520, sweepTo: 480, startAt: 0.55 },
    { frequency: 660, sweepTo: 620, startAt: 0.8 },
  ];

  base.forEach(tone => {
    createPulse(ctx, {
      type: 'sine',
      frequency: tone.frequency,
      sweepTo: tone.sweepTo,
      duration: 0.18,
      gain: 0.045,
      startAt: tone.startAt,
    });
  });
};

export const createRingtoneLoop = () => {
  let intervalId = null;

  return {
    start() {
      if (intervalId) return;
      playRingtonePulse();
      intervalId = setInterval(playRingtonePulse, 2400);
    },
    stop() {
      if (!intervalId) return;
      clearInterval(intervalId);
      intervalId = null;
    },
  };
};
