/* VaultBreak — procedural audio via Web Audio API. No sound files. */
(function (APP) {
  'use strict';

  let ctx = null;
  let master = null;
  let muted = false;

  function ensureContext() {
    if (ctx) return ctx;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.55;
    master.connect(ctx.destination);
    return ctx;
  }

  function resume() {
    const c = ensureContext();
    if (c && c.state === 'suspended') c.resume().catch(() => {});
  }

  function setMuted(v) {
    muted = v;
    if (master) master.gain.setTargetAtTime(muted ? 0 : 0.55, ctx.currentTime, 0.01);
  }
  function isMuted() { return muted; }

  function tone(freq, opts) {
    const c = ensureContext();
    if (!c) return;
    opts = opts || {};
    const t0 = c.currentTime + (opts.delay || 0);
    const dur = opts.duration || 0.18;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = opts.type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (opts.slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.slideTo), t0 + dur);
    const peak = opts.gain != null ? opts.gain : 0.35;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + (opts.attack || 0.012));
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function noiseBurst(opts) {
    const c = ensureContext();
    if (!c) return;
    opts = opts || {};
    const dur = opts.duration || 0.4;
    const bufSize = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, bufSize, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    const src = c.createBufferSource();
    src.buffer = buf;
    const filter = c.createBiquadFilter();
    filter.type = opts.filterType || 'bandpass';
    const t0 = c.currentTime + (opts.delay || 0);
    filter.frequency.setValueAtTime(opts.freqFrom || 400, t0);
    filter.frequency.exponentialRampToValueAtTime(opts.freqTo || 2200, t0 + dur);
    const gain = c.createGain();
    gain.gain.setValueAtTime(opts.gain || 0.25, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter).connect(gain).connect(master);
    src.start(t0);
  }

  function chord(freqs, opts) {
    freqs.forEach((f, i) => tone(f, Object.assign({}, opts, { delay: (opts && opts.delay || 0) + i * (opts && opts.stagger || 0) })));
  }

  const SFX = {
    click() { tone(720, { type: 'square', duration: 0.045, gain: 0.18 }); },
    navClick() { tone(500, { type: 'sine', duration: 0.05, gain: 0.12 }); },
    cash() { tone(1100, { type: 'triangle', duration: 0.09, gain: 0.22 }); tone(1500, { type: 'triangle', duration: 0.12, gain: 0.18, delay: 0.05 }); },
    buy() { tone(300, { type: 'sine', duration: 0.12, gain: 0.25, slideTo: 180 }); },
    error() { tone(140, { type: 'sawtooth', duration: 0.22, gain: 0.2, slideTo: 90 }); },
    caseOpenStart() { noiseBurst({ duration: 0.5, freqFrom: 250, freqTo: 3000, gain: 0.22 }); },
    reveal(rarityKey) {
      switch (rarityKey) {
        case 'common': tone(440, { duration: 0.16, gain: 0.22 }); break;
        case 'uncommon': chord([440, 554], { duration: 0.18, gain: 0.22, stagger: 0.05 }); break;
        case 'rare': chord([440, 554, 659], { duration: 0.2, gain: 0.24, stagger: 0.06 }); break;
        case 'epic': chord([392, 494, 587, 784], { duration: 0.28, gain: 0.26, stagger: 0.05 }); break;
        case 'legendary':
          chord([349, 440, 523, 698], { duration: 0.35, gain: 0.28, stagger: 0.06 });
          noiseBurst({ duration: 0.6, gain: 0.12, freqFrom: 1200, freqTo: 4000, delay: 0.15 });
          break;
        case 'mythic':
          tone(120, { type: 'sine', duration: 0.4, gain: 0.3 });
          chord([392, 494, 587, 784, 988], { duration: 0.4, gain: 0.28, stagger: 0.055, delay: 0.08 });
          noiseBurst({ duration: 0.7, gain: 0.14, freqFrom: 1500, freqTo: 5000, delay: 0.2 });
          break;
        case 'ancient':
          tone(90, { type: 'sine', duration: 0.5, gain: 0.32 });
          chord([440, 554, 659, 880, 1108], { duration: 0.5, gain: 0.3, stagger: 0.05, delay: 0.1 });
          noiseBurst({ duration: 0.9, gain: 0.16, freqFrom: 1800, freqTo: 6000, delay: 0.25 });
          break;
        case 'contraband':
          tone(70, { type: 'sine', duration: 0.7, gain: 0.36 });
          chord([392, 494, 587, 784, 988, 1175], { duration: 0.6, gain: 0.32, stagger: 0.06, delay: 0.12 });
          noiseBurst({ duration: 1.1, gain: 0.2, freqFrom: 2000, freqTo: 7000, delay: 0.3 });
          break;
        default: tone(440, { duration: 0.16, gain: 0.2 });
      }
    },
    levelUp() { chord([523, 659, 784, 1046], { duration: 0.3, gain: 0.28, stagger: 0.07 }); },
    achievement() { chord([659, 880], { duration: 0.22, gain: 0.24, stagger: 0.08 }); },
    prestige() {
      tone(700, { duration: 0.4, gain: 0.25, slideTo: 90 });
      chord([220, 277, 330, 440, 554, 660], { duration: 0.6, gain: 0.28, stagger: 0.06, delay: 0.35 });
    },
  };

  APP.audio = {
    resume,
    setMuted, isMuted,
    play(name, arg) { try { if (SFX[name]) SFX[name](arg); } catch (e) { /* audio best-effort */ } },
  };
})(window.APP = window.APP || {});
