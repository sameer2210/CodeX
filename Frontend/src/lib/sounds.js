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

  // Modified to a modern, short electronic beep (like a notification ping)
  createPulse(ctx, {
    type: 'sine', // Changed to sine for smoother, modern tone
    frequency: 800, // Higher frequency for a modern feel
    sweepTo: 600, // Gentle sweep down
    duration: 0.15, // Shorter duration
    gain: 0.08,
    startAt: 0,
  });

  createPulse(ctx, {
    type: 'sine',
    frequency: 800,
    sweepTo: 600,
    duration: 0.15,
    gain: 0.08,
    startAt: 0.25, // Slightly shorter delay
  });
};

const playRingtonePulse = () => {
  const ctx = getAudioCtx();
  if (!ctx) return;
  resumeAudio(ctx);

  // Modified to a modern, chime-like sequence (inspired by contemporary app ringtones)
  const base = [
    { frequency: 440, sweepTo: 420, startAt: 0 }, // A note with slight drop
    { frequency: 554, sweepTo: 534, startAt: 0.2 }, // C# note
    { frequency: 659, sweepTo: 639, startAt: 0.45 }, // E note
    { frequency: 554, sweepTo: 534, startAt: 0.7 }, // Back to C#
  ];

  base.forEach(tone => {
    createPulse(ctx, {
      type: 'triangle', // Changed to triangle for a softer, modern electronic vibe (less harsh than sine or sawtooth)
      frequency: tone.frequency,
      sweepTo: tone.sweepTo,
      duration: 0.15, // Shorter pulses for crispness
      gain: 0.06, // Slightly higher gain for clarity
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
      intervalId = setInterval(playRingtonePulse, 2000); // Shortened interval for a more modern, faster-paced ring
    },
    stop() {
      if (!intervalId) return;
      clearInterval(intervalId);
      intervalId = null;
    },
  };
};
