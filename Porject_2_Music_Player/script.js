/* ==========================================================
   PRISM — Music Player logic
   Audio is fully self-generated in the browser (Web Audio API) —
   no network/streaming dependency, so playback always works offline.
   ========================================================== */

const TRACKS = [
  { id:1,  title:"Neon Skyline",   artist:"Halcyon Drift", category:"Energetic", color1:"#ff3ea5", color2:"#8a4fff" },
  { id:2,  title:"Slow Tide",      artist:"Marbled Sound", category:"Chill",     color1:"#33e0ff", color2:"#5b3cff" },
  { id:3,  title:"Glass Corridor", artist:"Nova Field",    category:"Focus",     color1:"#8a4fff", color2:"#33e0ff" },
  { id:4,  title:"Analog Memory",  artist:"Kilo Static",   category:"Retro",     color1:"#ff8a3e", color2:"#ff3ea5" },
  { id:5,  title:"Drift Chamber",  artist:"Halcyon Drift", category:"Ambient",   color1:"#3ea1ff", color2:"#8a4fff" },
  { id:6,  title:"Pulse Grid",     artist:"Vector Bloom",  category:"Energetic", color1:"#ff3ea5", color2:"#ffd23e" },
  { id:7,  title:"Paper Moon",     artist:"Marbled Sound", category:"Chill",     color1:"#5bffb0", color2:"#33e0ff" },
  { id:8,  title:"Deep Focus 04",  artist:"Nova Field",    category:"Focus",     color1:"#8a4fff", color2:"#3ea1ff" },
  { id:9,  title:"VHS Sunrise",    artist:"Kilo Static",   category:"Retro",     color1:"#ffb23e", color2:"#ff3ea5" },
  { id:10, title:"Hollow Orbit",   artist:"Vector Bloom",  category:"Ambient",   color1:"#5b3cff", color2:"#33e0ff" },
  { id:11, title:"Static Bloom",   artist:"Nova Field",    category:"Energetic", color1:"#ff3ea5", color2:"#8a4fff" },
  { id:12, title:"Cold Room",      artist:"Halcyon Drift", category:"Focus",     color1:"#33e0ff", color2:"#5b3cff" },
];

const CATEGORIES = ["All", ...Array.from(new Set(TRACKS.map(t => t.category)))];

/* ---------- state ---------- */
const state = {
  search: "",
  activeCategory: "all",
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  shuffle: false,
  repeat: false,
  volume: 0.7,
};

/* ==========================================================
   AUDIO ENGINE — generative, in-browser, zero network calls
   ========================================================== */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioCtx();
const masterGain = audioCtx.createGain();
masterGain.gain.value = state.volume;
masterGain.connect(audioCtx.destination);

const STYLE = {
  Chill:     { wave:"sine",     tempo:74,  filter:2000, chordNotes:3, arp:false, perc:false, attack:0.6,  release:1.3, detune:6, sub:true,  reverb:0.32 },
  Focus:     { wave:"triangle", tempo:92,  filter:2600, chordNotes:2, arp:true,  arpGap:0.5,  arpWave:"triangle", perc:false, attack:0.3,  release:0.6,  detune:4, sub:true,  reverb:0.24 },
  Energetic: { wave:"sawtooth", tempo:128, filter:3400, chordNotes:3, arp:true,  arpGap:0.25, arpWave:"sawtooth", perc:true,  attack:0.02, release:0.25, detune:8, sub:true,  reverb:0.16 },
  Retro:     { wave:"square",   tempo:112, filter:2800, chordNotes:2, arp:true,  arpGap:0.2,  arpWave:"square",   perc:true,  attack:0.01, release:0.15, detune:5, sub:false, reverb:0.18 },
  Ambient:   { wave:"sine",     tempo:50,  filter:1400, chordNotes:4, arp:false, perc:false, attack:1.5,  release:2.6,  detune:9, sub:true,  reverb:0.4  },
};
const SCALE = [0,2,4,7,9,12,14,16,19];

function noteFreq(rootMidi, scaleIndex, octaveShift = 0) {
  const semis = SCALE[((scaleIndex % SCALE.length) + SCALE.length) % SCALE.length] + octaveShift * 12;
  const midi = rootMidi + semis;
  return 440 * Math.pow(2, (midi - 69) / 12);
}
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
function trackDuration(track) {
  return 26 + (track.id % 5) * 2; // 26–34s per track
}

const bufferCache = new Map();
let loadToken = 0;

/** Creates a cheap feedback-delay reverb network. Connect sources to the
 *  returned input node; both dry and wet signal are routed to `destination`. */
function createReverbSend(ctx, destination, wetAmount) {
  const input = ctx.createGain();
  const dry = ctx.createGain();
  dry.gain.value = 1;
  input.connect(dry);
  dry.connect(destination);

  const wet = ctx.createGain();
  wet.gain.value = wetAmount;
  wet.connect(destination);

  [0.29, 0.371, 0.433].forEach(time => {
    const delay = ctx.createDelay(1.0);
    delay.delayTime.value = time;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.33;
    const damp = ctx.createBiquadFilter();
    damp.type = "lowpass";
    damp.frequency.value = 3400;
    input.connect(delay);
    delay.connect(damp);
    damp.connect(feedback);
    feedback.connect(delay);
    damp.connect(wet);
  });
  return input;
}

/** Renders a short generative track into an AudioBuffer offline. */
async function renderTrackBuffer(track) {
  if (bufferCache.has(track.id)) return bufferCache.get(track.id);

  const style = STYLE[track.category] || STYLE.Chill;
  const rootMidi = 45 + ((track.id * 5) % 12);
  const duration = trackDuration(track);
  const sr = 44100;
  const offline = new OfflineAudioContext(2, Math.ceil(duration * sr), sr);

  const master = offline.createGain();
  master.gain.value = 0.9;
  master.connect(offline.destination);

  const filter = offline.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = style.filter;

  const reverbIn = createReverbSend(offline, master, style.reverb || 0.2);
  filter.connect(reverbIn);

  const beatDur = 60 / style.tempo;
  const barDur = beatDur * 4;
  // Per-track chord progression so every song feels a little different.
  const progressionBank = [[0,2,3,1],[0,3,2,4],[0,1,3,2],[0,2,1,3]];
  const progression = progressionBank[track.id % progressionBank.length];
  let t = 0, bar = 0;

  while (t < duration) {
    const degree = progression[bar % progression.length];

    // Warm pad: two slightly detuned oscillators per chord tone (unison).
    for (let n = 0; n < style.chordNotes; n++) {
      const freq = noteFreq(rootMidi, degree + n * 2, n === style.chordNotes - 1 ? 1 : 0);
      const g = offline.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.1, Math.min(duration, t + style.attack));
      g.gain.linearRampToValueAtTime(0, Math.min(duration, t + barDur + style.release));
      g.connect(filter);

      [-1, 1].forEach(dir => {
        const osc = offline.createOscillator();
        osc.type = style.wave;
        osc.frequency.value = freq;
        osc.detune.value = dir * (style.detune || 5);
        osc.connect(g);
        osc.start(t); osc.stop(Math.min(duration, t + barDur + style.release + 0.1));
      });
    }

    // Sub-bass: one octave below the root, for warmth on the low end.
    if (style.sub) {
      const subOsc = offline.createOscillator();
      subOsc.type = "sine";
      subOsc.frequency.value = noteFreq(rootMidi, degree, -1);
      const subGain = offline.createGain();
      subGain.gain.setValueAtTime(0, t);
      subGain.gain.linearRampToValueAtTime(0.14, Math.min(duration, t + 0.08));
      subGain.gain.linearRampToValueAtTime(0, Math.min(duration, t + barDur));
      subOsc.connect(subGain); subGain.connect(master);
      subOsc.start(t); subOsc.stop(Math.min(duration, t + barDur + 0.1));
    }

    if (style.arp) {
      let at = t, step = 0;
      while (at < t + barDur && at < duration) {
        const osc = offline.createOscillator();
        osc.type = style.arpWave;
        osc.frequency.value = noteFreq(rootMidi, degree + (step % 4), 1);
        const g = offline.createGain();
        g.gain.setValueAtTime(0.001, at);
        g.gain.exponentialRampToValueAtTime(0.09, at + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, Math.max(at + 0.03, at + style.arpGap * 0.9));
        osc.connect(g); g.connect(filter);
        osc.start(at); osc.stop(at + style.arpGap);
        at += style.arpGap; step++;
      }
    }

    if (style.perc) {
      for (let b = 0; b < 4; b++) {
        const pt = t + b * beatDur;
        if (pt >= duration) break;
        const bufSize = Math.floor(sr * 0.12);
        const noiseBuf = offline.createBuffer(1, bufSize, sr);
        const data = noiseBuf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = (seededRandom(track.id * 1000 + pt * 97 + i) * 2 - 1) * (1 - i / bufSize);
        const noise = offline.createBufferSource();
        noise.buffer = noiseBuf;
        const ng = offline.createGain();
        ng.gain.setValueAtTime(0.16, pt);
        ng.gain.exponentialRampToValueAtTime(0.001, pt + 0.12);
        const nf = offline.createBiquadFilter();
        nf.type = "lowpass"; nf.frequency.value = 180;
        noise.connect(nf); nf.connect(ng); ng.connect(master);
        noise.start(pt);
      }
    }

    t += barDur; bar++;
  }

  const rendered = await offline.startRendering();
  bufferCache.set(track.id, rendered);
  return rendered;
}

/* ---- playback transport state ---- */
let currentSource = null;
let currentBuffer = null;
let currentBufferTrackId = null;
let playStartCtxTime = 0;
let pausedOffset = 0;
let rafId = null;

function elapsedTime() {
  if (currentSource) return audioCtx.currentTime - playStartCtxTime;
  return pausedOffset;
}

// Stops and fully silences whatever is currently playing. Each source
// carries its own "_manualStop" flag (rather than one shared flag) so a
// late 'ended' event from a just-stopped source can never race with, or be
// swallowed/confused by, a source that started right after it — this is
// what previously let a track keep sounding after switching tracks quickly.
function stopSourceNode() {
  if (currentSource) {
    const source = currentSource;
    source._manualStop = true;
    try { source.stop(); } catch (e) {}
    try { source.disconnect(); } catch (e) {}
    currentSource = null;
  }
  cancelAnimationFrame(rafId);
}

function startSourceFromOffset(offset) {
  if (!currentBuffer) return;
  stopSourceNode(); // guarantee nothing else is ever sounding at the same time
  const source = audioCtx.createBufferSource();
  source.buffer = currentBuffer;
  source.connect(masterGain);
  source._manualStop = false;
  source.onended = () => { if (!source._manualStop) playNext(false); };
  const safeOffset = Math.min(Math.max(0, offset), Math.max(0, currentBuffer.duration - 0.05));
  source.start(0, safeOffset);
  playStartCtxTime = audioCtx.currentTime - safeOffset;
  currentSource = source;
  pausedOffset = safeOffset;
  setPlayingUI(true);
  startProgressLoop();
}

function pausePlayback() {
  if (!currentSource) return;
  pausedOffset = elapsedTime();
  stopSourceNode();
  setPlayingUI(false);
}

function resumePlayback() {
  if (!currentBuffer) return;
  startSourceFromOffset(pausedOffset);
}

function seekTo(offset) {
  if (!currentBuffer) return;
  if (currentSource) {
    startSourceFromOffset(offset);
  } else {
    pausedOffset = Math.min(Math.max(0, offset), currentBuffer.duration);
    updateScrubberUI(pausedOffset, currentBuffer.duration);
  }
}

function startProgressLoop() {
  cancelAnimationFrame(rafId);
  const tick = () => {
    if (currentSource && currentBuffer) {
      updateScrubberUI(elapsedTime(), currentBuffer.duration);
      rafId = requestAnimationFrame(tick);
    }
  };
  rafId = requestAnimationFrame(tick);
}

function updateScrubberUI(elapsed, duration) {
  const pct = duration ? (elapsed / duration) * 100 : 0;
  el.scrubberFill.style.width = pct + "%";
  el.scrubberHandle.style.left = pct + "%";
  el.timeCurrent.textContent = fmtTime(elapsed);
}

/* ---------- DOM refs ---------- */
const el = {
  chipRow: document.getElementById("chipRow"),
  searchInput: document.getElementById("searchInput"),
  trackList: document.getElementById("trackList"),
  trackCount: document.getElementById("trackCount"),
  queueList: document.getElementById("queueList"),
  queueCount: document.getElementById("queueCount"),

  nowPlayingLabel: document.getElementById("nowPlayingLabel"),
  disc: document.getElementById("disc"),
  discFace: document.getElementById("discFace"),
  discInitial: document.getElementById("discInitial"),
  trackTitle: document.getElementById("trackTitle"),
  trackArtist: document.getElementById("trackArtist"),

  timeCurrent: document.getElementById("timeCurrent"),
  timeDuration: document.getElementById("timeDuration"),
  scrubber: document.getElementById("scrubber"),
  scrubberFill: document.getElementById("scrubberFill"),
  scrubberBars: document.getElementById("scrubberBars"),
  scrubberHandle: document.getElementById("scrubberHandle"),

  miniCover: document.getElementById("miniCover"),
  miniInitial: document.getElementById("miniInitial"),
  miniTitle: document.getElementById("miniTitle"),
  miniArtist: document.getElementById("miniArtist"),
  nowCat: document.getElementById("nowCat"),

  playBtn: document.getElementById("playBtn"),
  playIcon: document.getElementById("playIcon"),
  pauseIcon: document.getElementById("pauseIcon"),
  prevBtn: document.getElementById("prevBtn"),
  nextBtn: document.getElementById("nextBtn"),
  shuffleBtn: document.getElementById("shuffleBtn"),
  repeatBtn: document.getElementById("repeatBtn"),

  volKnob: document.getElementById("volKnob"),
  knobIndicator: document.getElementById("knobIndicator"),
  volIcon: document.getElementById("volIcon"),
};

/* ---------- helpers ---------- */
const byId = id => TRACKS.find(t => t.id === id);
const fmtTime = s => {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};
const gradientFor = t => `linear-gradient(135deg, ${t.color1}, ${t.color2})`;
const initialFor = t => t.title.trim()[0].toUpperCase();

function waveformBars(seed, count = 60) {
  let x = seed * 9301 + 49297;
  const bars = [];
  for (let i = 0; i < count; i++) {
    x = (x * 9301 + 49297) % 233280;
    const rnd = x / 233280;
    bars.push(6 + Math.round(rnd * 18));
  }
  return bars;
}
function buildWaveform(seed) {
  const bars = waveformBars(seed);
  el.scrubberBars.innerHTML = bars.map(h => `<span style="height:${h}px"></span>`).join("");
}
function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

/* ---------- render: category chips ---------- */
function renderChips() {
  el.chipRow.innerHTML = "";
  CATEGORIES.forEach(cat => {
    const key = cat.toLowerCase();
    const btn = document.createElement("button");
    btn.className = "chip" + (state.activeCategory === key ? " is-active" : "");
    btn.textContent = cat;
    btn.dataset.cat = key;
    btn.addEventListener("click", () => {
      state.activeCategory = key;
      renderChips();
      renderLibrary();
    });
    el.chipRow.appendChild(btn);
  });
}

/* ---------- render: library list ---------- */
function renderLibrary() {
  const q = state.search.trim().toLowerCase();
  const filtered = TRACKS.filter(t => {
    const matchesCat = state.activeCategory === "all" || t.category.toLowerCase() === state.activeCategory;
    const matchesSearch = !q || t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  el.trackCount.textContent = `${filtered.length} track${filtered.length !== 1 ? "s" : ""}`;
  el.trackList.innerHTML = "";

  if (filtered.length === 0) {
    const li = document.createElement("li");
    li.className = "no-results";
    li.textContent = "No tracks match your search.";
    el.trackList.appendChild(li);
    return;
  }

  const currentTrackId = state.queue[state.currentIndex];

  filtered.forEach(t => {
    const li = document.createElement("li");
    li.className = "track-row" + (t.id === currentTrackId ? " is-current" : "");

    li.innerHTML = `
      <div class="track-swatch" style="background:${gradientFor(t)}"></div>
      <div class="track-meta">
        <strong>${escapeHtml(t.title)}</strong>
        <small>${escapeHtml(t.artist)} · ${t.category}</small>
      </div>
      <span class="track-playing-icon"><span></span><span></span><span></span></span>
      <button class="add-btn ${state.queue.includes(t.id) ? "is-added" : ""}" title="${state.queue.includes(t.id) ? "In queue" : "Add to queue"}" data-id="${t.id}">${state.queue.includes(t.id) ? "✓" : "+"}</button>
    `;

    li.addEventListener("click", (e) => {
      if (e.target.closest(".add-btn")) return;
      playTrackDirectly(t.id);
    });
    li.querySelector(".add-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleQueue(t.id);
    });

    el.trackList.appendChild(li);
  });

  if (state.isPlaying) {
    document.querySelectorAll(".track-row.is-current .track-playing-icon").forEach(i => i.style.animationPlayState = "running");
  }
}

/* ---------- queue management ---------- */
function toggleQueue(id) {
  const idx = state.queue.indexOf(id);
  if (idx === -1) {
    state.queue.push(id);
    if (state.currentIndex === -1) {
      state.currentIndex = state.queue.length - 1;
      loadCurrentTrack(false);
    }
  } else {
    state.queue.splice(idx, 1);
    if (state.currentIndex === idx) {
      if (state.queue.length === 0) {
        state.currentIndex = -1;
        stopAllPlayback(true);
      } else {
        state.currentIndex = Math.min(state.currentIndex, state.queue.length - 1);
        loadCurrentTrack(state.isPlaying);
      }
    } else if (idx < state.currentIndex) {
      state.currentIndex -= 1;
    }
  }
  renderLibrary();
  renderQueue();
}

function playTrackDirectly(id) {
  audioCtx.resume();
  const isAlreadyCurrent = state.queue[state.currentIndex] === id;
  if (isAlreadyCurrent && currentBuffer) {
    // Same track clicked again → toggle, don't restart from the top.
    togglePlay();
    return;
  }
  if (!state.queue.includes(id)) state.queue.push(id);
  state.currentIndex = state.queue.indexOf(id);
  loadCurrentTrack(true);
  renderLibrary();
  renderQueue();
}

function renderQueue() {
  el.queueCount.textContent = `${state.queue.length} added`;
  el.queueList.innerHTML = "";

  if (state.queue.length === 0) {
    const li = document.createElement("li");
    li.className = "queue-empty";
    li.innerHTML = `Tap <strong>+</strong> on any track to build your set.`;
    el.queueList.appendChild(li);
    return;
  }

  state.queue.forEach((id, i) => {
    const t = byId(id);
    const li = document.createElement("li");
    li.className = "queue-row" + (i === state.currentIndex ? " is-current" : "");
    li.innerHTML = `
      <span class="queue-index">${(i + 1).toString().padStart(2, "0")}</span>
      <div class="track-swatch" style="width:28px;height:28px;background:${gradientFor(t)}"></div>
      <div class="track-meta">
        <strong>${escapeHtml(t.title)}</strong>
        <small>${escapeHtml(t.artist)}</small>
      </div>
      <button class="queue-remove" title="Remove from queue" data-id="${id}">×</button>
    `;
    li.addEventListener("click", (e) => {
      if (e.target.closest(".queue-remove")) return;
      audioCtx.resume();
      state.currentIndex = i;
      loadCurrentTrack(true);
      renderQueue();
      renderLibrary();
    });
    li.querySelector(".queue-remove").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleQueue(id);
    });
    el.queueList.appendChild(li);
  });
}

/* ---------- playback orchestration ---------- */
async function loadCurrentTrack(autoplay) {
  const id = state.queue[state.currentIndex];
  if (id === undefined) return;
  const t = byId(id);
  const myToken = ++loadToken;

  stopSourceNode();
  currentBuffer = null;
  currentBufferTrackId = null;
  pausedOffset = 0;

  el.nowPlayingLabel.textContent = "Loading…";
  el.trackTitle.textContent = t.title;
  el.trackArtist.textContent = t.artist;
  el.discFace.style.background = gradientFor(t);
  el.discInitial.textContent = initialFor(t);
  el.miniCover.style.background = gradientFor(t);
  el.miniInitial.textContent = initialFor(t);
  el.miniTitle.textContent = t.title;
  el.miniArtist.textContent = t.artist;
  el.nowCat.textContent = t.category;
  el.scrubberFill.style.width = "0%";
  el.scrubberHandle.style.left = "0%";
  el.timeCurrent.textContent = "0:00";
  el.timeDuration.textContent = fmtTime(trackDuration(t));
  buildWaveform(t.id);
  renderLibrary();
  renderQueue();

  let buffer;
  try {
    buffer = await renderTrackBuffer(t);
  } catch (err) {
    console.error("PRISM: failed to render track audio", err);
    if (myToken === loadToken) {
      el.nowPlayingLabel.textContent = "Couldn't load this track — try another";
      setPlayingUI(false);
    }
    return;
  }
  if (myToken !== loadToken) return; // a newer load superseded this one

  currentBuffer = buffer;
  currentBufferTrackId = t.id;
  el.timeDuration.textContent = fmtTime(buffer.duration);

  if (autoplay) {
    await audioCtx.resume();
    if (myToken !== loadToken) return; // superseded while resuming
    startSourceFromOffset(0);
  } else {
    setPlayingUI(false);
  }
}

function setPlayingUI(playing) {
  state.isPlaying = playing;
  el.playIcon.style.display = playing ? "none" : "block";
  el.pauseIcon.style.display = playing ? "block" : "none";
  el.disc.classList.toggle("is-spinning", playing);
  el.nowPlayingLabel.textContent = playing ? "Now Playing" : (state.currentIndex === -1 ? "Nothing queued yet" : "Paused");
  document.querySelectorAll(".track-row.is-current .track-playing-icon").forEach(iconEl => {
    iconEl.style.animationPlayState = playing ? "running" : "paused";
  });
}

async function togglePlay() {
  await audioCtx.resume();
  if (state.currentIndex === -1) {
    if (state.queue.length === 0) return;
    state.currentIndex = 0;
    loadCurrentTrack(true);
    return;
  }
  if (!currentBuffer) return; // still loading
  if (currentSource) {
    pausePlayback();
  } else {
    resumePlayback();
  }
}

function stopAllPlayback(resetVisuals) {
  stopSourceNode();
  currentBuffer = null;
  currentBufferTrackId = null;
  pausedOffset = 0;
  setPlayingUI(false);
  if (resetVisuals) {
    el.trackTitle.textContent = "Select a track";
    el.trackArtist.textContent = "— from the library to begin —";
    el.discFace.style.background = "var(--grad-brand)";
    el.discInitial.textContent = "?";
    el.miniCover.style.background = "var(--surface-2)";
    el.miniInitial.textContent = "?";
    el.miniTitle.textContent = "Nothing playing";
    el.miniArtist.textContent = "Pick a track to start";
    el.nowCat.textContent = "—";
    el.scrubberFill.style.width = "0%";
    el.scrubberHandle.style.left = "0%";
    el.timeCurrent.textContent = "0:00";
    el.timeDuration.textContent = "0:00";
    el.scrubberBars.innerHTML = "";
    el.nowPlayingLabel.textContent = "Nothing queued yet";
  }
}

function playNext(userInitiated) {
  if (state.queue.length === 0) return;
  if (state.shuffle && state.queue.length > 1) {
    let next;
    do { next = Math.floor(Math.random() * state.queue.length); } while (next === state.currentIndex);
    state.currentIndex = next;
  } else if (state.currentIndex < state.queue.length - 1) {
    state.currentIndex += 1;
  } else if (state.repeat) {
    state.currentIndex = 0;
  } else if (userInitiated) {
    state.currentIndex = 0;
  } else {
    setPlayingUI(false);
    return;
  }
  loadCurrentTrack(true);
}

function playPrev() {
  if (state.queue.length === 0) return;
  if (elapsedTime() > 3) {
    seekTo(0);
    return;
  }
  if (state.currentIndex > 0) {
    state.currentIndex -= 1;
  } else {
    state.currentIndex = state.repeat ? state.queue.length - 1 : 0;
  }
  loadCurrentTrack(true);
}

/* ---------- controls ---------- */
el.playBtn.addEventListener("click", togglePlay);
el.nextBtn.addEventListener("click", () => { audioCtx.resume(); playNext(true); });
el.prevBtn.addEventListener("click", () => { audioCtx.resume(); playPrev(); });

el.shuffleBtn.addEventListener("click", () => {
  state.shuffle = !state.shuffle;
  el.shuffleBtn.setAttribute("aria-pressed", state.shuffle);
});
el.repeatBtn.addEventListener("click", () => {
  state.repeat = !state.repeat;
  el.repeatBtn.setAttribute("aria-pressed", state.repeat);
});

/* ---------- scrubber ---------- */
let scrubbing = false;
function seekFromEvent(e) {
  if (!currentBuffer) return;
  const rect = el.scrubber.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  let pct = (clientX - rect.left) / rect.width;
  pct = Math.min(1, Math.max(0, pct));
  updateScrubberUI(pct * currentBuffer.duration, currentBuffer.duration);
  seekTo(pct * currentBuffer.duration);
}
el.scrubber.addEventListener("mousedown", (e) => { scrubbing = true; seekFromEvent(e); });
window.addEventListener("mousemove", (e) => { if (scrubbing) seekFromEvent(e); });
window.addEventListener("mouseup", () => scrubbing = false);
el.scrubber.addEventListener("touchstart", (e) => { scrubbing = true; seekFromEvent(e); });
window.addEventListener("touchmove", (e) => { if (scrubbing) seekFromEvent(e); });
window.addEventListener("touchend", () => scrubbing = false);

/* ---------- volume knob ---------- */
function setVolume(v) {
  state.volume = Math.min(1, Math.max(0, v));
  masterGain.gain.value = state.volume;
  const angle = state.volume * 300;
  el.volKnob.style.setProperty("--angle", angle + "deg");
  el.volKnob.setAttribute("aria-valuenow", Math.round(state.volume * 100));
  el.volIcon.style.opacity = state.volume === 0 ? 0.4 : 1;
}
let knobDragging = false;
function knobAngleFromEvent(e) {
  const rect = el.volKnob.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  let deg = Math.atan2(clientX - cx, -(clientY - cy)) * (180 / Math.PI);
  if (deg < 0) deg += 360;
  if (deg > 300 && deg < 330) deg = 300;
  if (deg >= 330) deg = 0;
  return Math.min(300, Math.max(0, deg));
}
el.volKnob.addEventListener("mousedown", (e) => { knobDragging = true; setVolume(knobAngleFromEvent(e) / 300); });
window.addEventListener("mousemove", (e) => { if (knobDragging) setVolume(knobAngleFromEvent(e) / 300); });
window.addEventListener("mouseup", () => knobDragging = false);
el.volKnob.addEventListener("touchstart", (e) => { knobDragging = true; setVolume(knobAngleFromEvent(e) / 300); });
window.addEventListener("touchmove", (e) => { if (knobDragging) setVolume(knobAngleFromEvent(e) / 300); });
window.addEventListener("touchend", () => knobDragging = false);
el.volKnob.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" || e.key === "ArrowRight") setVolume(state.volume + 0.05);
  if (e.key === "ArrowDown" || e.key === "ArrowLeft") setVolume(state.volume - 0.05);
});
el.volIcon.addEventListener("click", () => setVolume(state.volume > 0 ? 0 : 0.7));

/* ---------- search ---------- */
el.searchInput.addEventListener("input", (e) => {
  state.search = e.target.value;
  renderLibrary();
});

/* ---------- keyboard shortcuts ---------- */
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") return;
  if (e.code === "Space") { e.preventDefault(); togglePlay(); }
  if (e.code === "ArrowRight" && e.shiftKey) { audioCtx.resume(); playNext(true); }
  if (e.code === "ArrowLeft" && e.shiftKey) { audioCtx.resume(); playPrev(); }
});

/* ---------- init ---------- */
renderChips();
renderLibrary();
renderQueue();
setVolume(0.7);
