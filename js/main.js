document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-year]').forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (!toggle || !nav) return;

  const backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  backdrop.hidden = true;
  document.body.appendChild(backdrop);

  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    backdrop.hidden = !open;
    backdrop.classList.toggle('show', open);
    toggle.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '关闭导航' : '打开导航');
    document.body.classList.toggle('nav-open', open);
  };

  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  backdrop.addEventListener('click', () => setMenu(false));
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) setMenu(false);
  });
});

/* ============== 明日方舟 Q版小干员（图集并行加载 · rAF · blob 音频） ============== */
(() => {
  const ASSET = 'assets/mascot/';
  const VOICE_ASSET_DIR = `${ASSET}voice/`;
  const FRAME_COUNT = 20;
  const FRAME_W = 314;
  const FRAME_H = 460;

  const SPRITE_SHEETS = Object.freeze({
    relax: `${ASSET}sheet_relax.webp`,
    interact_wave: `${ASSET}sheet_interact_wave.webp`,
    interact_step_a: `${ASSET}sheet_interact_step_a.webp`,
    interact_step_b: `${ASSET}sheet_interact_step_b.webp`,
    sit: `${ASSET}sheet_sit.webp`,
  });
  const STATIC_FIRST_FRAME = `${ASSET}amiya_relax_01.webp`;

  const ACTIONS = Object.freeze({
    interact_wave: { duration: 1000, tone: 1 },
    interact_step_a: { duration: 1133.33, tone: 2 },
    interact_step_b: { duration: 1133.33, tone: 3 },
  });

  const IDLE_FRAME_MS = 50;
  const SIT_FRAME_MS = 100;
  const ACTION_TAIL_MS = 80;
  const LONG_IDLE_MS = 60 * 1000;
  const SHORT_REPEAT_GAP_MS = 850;
  const RAPID_GAP_MS = 260;
  const IRREGULAR_WINDOW_MS = 2200;
  const CHAOS_COOLDOWN_MS = 9000;
  const AWAY_NOTICE_COOLDOWN_MS = 55 * 1000;

  const ACTION_WEIGHTS = Object.freeze({
    single: { interact_wave: 0.55, interact_step_a: 0.25, interact_step_b: 0.20 },
    'short-repeat': { interact_wave: 0.20, interact_step_a: 0.45, interact_step_b: 0.35 },
    rapid: { interact_wave: 0.15, interact_step_a: 0.40, interact_step_b: 0.45 },
    away: { interact_wave: 0.55, interact_step_a: 0.20, interact_step_b: 0.25 },
    chaotic: { interact_wave: 0.35, interact_step_a: 0.35, interact_step_b: 0.30 },
  });

  const PRELOAD_VOICE_IDS = Object.freeze([
    'amiya-welcome', 'amiya-poke', 'amiya-giggle', 'amiya-here', 'amiya-ack',
  ]);

  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');
  const ALLOWED_AUDIO_EXT = /\.(ogg|mp3|wav|m4a|aac|webm)$/i;

  const isLocalVoiceAsset = (src) => {
    if (typeof src !== 'string' || !src.startsWith(VOICE_ASSET_DIR) || src.includes('\\')) return false;
    let decoded;
    try { decoded = decodeURIComponent(src); } catch (error) { return false; }
    if (decoded.includes('\\') || decoded.includes('\0')) return false;
    const cleanPath = decoded.split(/[?#]/, 1)[0];
    if (!ALLOWED_AUDIO_EXT.test(cleanPath)) return false;
    const relativePath = cleanPath.slice(VOICE_ASSET_DIR.length);
    return Boolean(relativePath) && relativePath.split('/').every((part) => part && part !== '.' && part !== '..');
  };

  const preferMp3 = (entry) => {
    const list = (Array.isArray(entry.sources) && entry.sources.length ? entry.sources : [entry.src])
      .filter(isLocalVoiceAsset);
    const mp3 = list.filter((src) => /\.mp3$/i.test(src));
    return mp3.length ? mp3 : list;
  };

  function readVoiceCatalog() {
    const source = window.ARK_MASCOT_VOICE_ASSETS;
    const catalog = {};
    Object.keys(ACTIONS).forEach((key) => {
      catalog[key] = source && Array.isArray(source[key]) ? source[key].filter((entry) => preferMp3(entry).length) : [];
    });
    return catalog;
  }

  function readPromoConfig() {
    const promo = window.ARK_MASCOT_PROMO_CONFIG;
    if (!promo || typeof promo !== 'object' || !promo.enabled || !Array.isArray(promo.entries)) return null;
    const validEntries = promo.entries.filter((entry) => preferMp3(entry).length);
    return validEntries.length ? { ...promo, entries: validEntries } : null;
  }

  function init() {
    if (document.getElementById('ark-mascot')) return;
    const root = document.createElement('aside');
    root.id = 'ark-mascot';
    root.className = 'ark-mascot is-loading';
    root.setAttribute('aria-label', '罗德岛小干员，可拖动');
    root.innerHTML = '<div class="ark-live" id="ark-live" aria-live="polite"></div><div class="ark-bubble" id="ark-bubble" role="presentation"></div><div class="ark-bob"><div class="ark-stage" id="ark-stage" role="button" tabindex="0" aria-label="与阿米娅互动，拖动可移动位置"><canvas class="ark-sprite ark-canvas" id="ark-canvas" width="314" height="460" aria-hidden="true"></canvas></div></div><div class="ark-tag">RHODES ISLAND</div><button class="ark-sound" id="ark-sound" type="button" aria-label="开关语音和点击音效" title="开关语音和点击音效" aria-pressed="true">♪</button><button class="ark-hide" id="ark-hide" type="button" aria-label="收起阿米娅" title="收起阿米娅">–</button>';
    document.body.appendChild(root);

    const stage = root.querySelector('#ark-stage');
    const bubble = root.querySelector('#ark-bubble');
    const live = root.querySelector('#ark-live');
    const canvas = root.querySelector('#ark-canvas');
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const soundButton = root.querySelector('#ark-sound');
    const hideButton = root.querySelector('#ark-hide');
    const voiceCatalog = readVoiceCatalog();
    const promoConfig = readPromoConfig();

    const storage = {
      get(key, fallback) {
        try { return localStorage.getItem(key) ?? fallback; } catch (error) { return fallback; }
      },
      set(key, value) {
        try { localStorage.setItem(key, value); } catch (error) { /* 忽略存储错误 */ }
      },
    };

    const sheets = {};
    let firstFrame = null;
    let idleFramesReady = false;
    let sitFramesReady = false;
    let rafId = null;
    let collapsed = storage.get('ark_hidden', '0') === '1';
    const DRAG_THRESHOLD_SQ = 64;
    const drag = {
      pointerId: null,
      startX: 0,
      startY: 0,
      originLeft: 0,
      originTop: 0,
      lastX: 0,
      lastT: 0,
      swing: 0,
      moved: false,
    };
    let suppressClick = false;
    let suppressClickTimer = 0;
    let settleTimer = 0;
    let lastPickupVoiceAt = 0;

    const stopLoop = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    };

    const syncCanvas = () => {
      const cssW = Math.max(1, canvas.clientWidth || 124);
      const cssH = Math.max(1, canvas.clientHeight || Math.round(cssW * FRAME_H / FRAME_W));
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const w = Math.max(1, Math.round(cssW * dpr));
      const h = Math.max(1, Math.round(cssH * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        return true;
      }
      return false;
    };

    const drawSource = (source, index) => {
      if (!ctx || !source) return false;
      const sw = source.width || source.naturalWidth || 0;
      const sh = source.height || source.naturalHeight || 0;
      if (!sw || !sh) return false;
      const dw = canvas.width;
      const dh = canvas.height;
      ctx.clearRect(0, 0, dw, dh);
      if (sw >= FRAME_W * 2) {
        const idx = Math.max(0, Math.min(FRAME_COUNT - 1, index | 0));
        ctx.drawImage(source, idx * FRAME_W, 0, FRAME_W, FRAME_H, 0, 0, dw, dh);
      } else {
        ctx.drawImage(source, 0, 0, sw, sh, 0, 0, dw, dh);
      }
      return true;
    };

    const drawFrame = (sheetKey, index) => {
      const sheet = sheets[sheetKey] || sheets.relax;
      if (sheet) return drawSource(sheet, index);
      if (firstFrame) return drawSource(firstFrame, 0);
      return false;
    };

    const loadSheet = async (key, url) => {
      try {
        const response = await fetch(url, { cache: 'force-cache' });
        if (!response.ok) throw new Error(String(response.status));
        const blob = await response.blob();
        const bitmap = await createImageBitmap(blob);
        if (key) sheets[key] = bitmap;
        return bitmap;
      } catch (error) {
        return new Promise((resolve) => {
          const img = new Image();
          img.decoding = 'async';
          img.onload = () => {
            if (key) sheets[key] = img;
            resolve(img);
          };
          img.onerror = () => resolve(null);
          img.src = url;
        });
      }
    };

    let count = Math.max(0, Number.parseInt(storage.get('ark_pokes', '0'), 10) || 0);
    let muted = storage.get('ark_muted', '0') === '1';
    let typeTimer = null;
    let hideTimer = null;
    let idleLineTimer = null;
    let awayTimer = null;
    let actionTimer = null;
    let audioContext = null;
    let activeAudio = null;
    let blipNodes = [];
    const audioUrls = new Map();

    const state = {
      phase: 'idle',
      actionKey: null,
      actionToken: 0,
      idleIndex: 0,
      lastUserAt: Date.now(),
      lastClickAt: 0,
      recentClicks: [],
      comboCount: 0,
      lastClickType: 'single',
      lastActionKey: null,
      chaosCooldownUntil: 0,
      lastAwayNoticeAt: 0,
      lastVoiceAt: 0,
      lastVoiceId: '',
      recentVoiceLines: [],
      voiceToken: 0,
      interacted: false,
      dragging: false,
      sitIndex: 0,
    };

    const clearSpeechTimers = () => {
      clearInterval(typeTimer);
      clearTimeout(hideTimer);
      typeTimer = null;
      hideTimer = null;
    };

    const clearActionTimer = () => {
      clearTimeout(actionTimer);
      actionTimer = null;
    };

    const runSit = () => {
      stopLoop();
      const key = sitFramesReady ? 'sit' : 'relax';
      if (collapsed || !state.dragging || document.hidden) {
        drawFrame(key, sitFramesReady ? state.sitIndex : 0);
        return;
      }
      if (REDUCED_MOTION.matches || !sitFramesReady) {
        drawFrame(key, 0);
        return;
      }
      let last = performance.now();
      let acc = 0;
      const tick = (now) => {
        if (collapsed || !state.dragging || document.hidden) return;
        acc += now - last;
        last = now;
        while (acc >= SIT_FRAME_MS) {
          acc -= SIT_FRAME_MS;
          state.sitIndex = (state.sitIndex + 1) % FRAME_COUNT;
        }
        drawFrame('sit', state.sitIndex);
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    };

    const runIdle = () => {
      stopLoop();
      if (collapsed || state.dragging || REDUCED_MOTION.matches || document.hidden || state.phase === 'action') {
        drawFrame('relax', idleFramesReady ? state.idleIndex : 0);
        return;
      }
      if (!idleFramesReady) {
        drawFrame('relax', 0);
        return;
      }
      let last = performance.now();
      let acc = 0;
      const tick = (now) => {
        if (collapsed || state.dragging || document.hidden || state.phase === 'action') return;
        acc += now - last;
        last = now;
        while (acc >= IDLE_FRAME_MS) {
          acc -= IDLE_FRAME_MS;
          state.idleIndex = (state.idleIndex + 1) % FRAME_COUNT;
        }
        drawFrame('relax', state.idleIndex);
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    };

    const stopBlip = () => {
      blipNodes.forEach((node) => { try { node.stop(); } catch (error) {} });
      blipNodes = [];
    };

    const stopAudio = () => {
      state.voiceToken += 1;
      if (activeAudio) {
        const audio = activeAudio;
        activeAudio = null;
        audio.onended = null;
        audio.onpause = null;
        audio.onerror = null;
        try { audio.pause(); } catch (error) {}
        try { audio.removeAttribute('src'); audio.load(); } catch (error) {}
      }
      stopBlip();
    };

    const ensureAudioUrl = async (src) => {
      if (audioUrls.has(src)) return audioUrls.get(src);
      const response = await fetch(src, { cache: 'force-cache' });
      if (!response.ok) throw new Error(`audio ${response.status}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      audioUrls.set(src, url);
      return url;
    };

    const preloadVoices = () => {
      const entries = Object.values(voiceCatalog).flat();
      PRELOAD_VOICE_IDS.forEach((id) => {
        const entry = entries.find((item) => item.id === id);
        const src = entry ? preferMp3(entry)[0] : null;
        if (src) ensureAudioUrl(src).catch(() => {});
      });
    };

    const rememberVoiceLine = (line) => {
      if (!line) return;
      state.recentVoiceLines.push(line);
      if (state.recentVoiceLines.length > 5) state.recentVoiceLines.shift();
    };

    const playVoice = (entry, line) => {
      if (muted || !entry) return null;
      stopAudio();
      const token = state.voiceToken;
      const sources = preferMp3(entry);
      if (!sources.length) return null;

      const audio = new Audio();
      audio.preload = 'auto';
      const volume = Number(entry.volume);
      audio.volume = Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : 0.8;
      activeAudio = audio;

      const startPlay = async () => {
        for (let index = 0; index < sources.length; index += 1) {
          if (token !== state.voiceToken) return;
          try {
            const url = await ensureAudioUrl(sources[index]);
            if (token !== state.voiceToken) return;
            audio.src = url;
            await audio.play();
            return;
          } catch (error) {
            if (token !== state.voiceToken) return;
            if (error && error.name === 'AbortError') return;
          }
        }
      };

      try {
        state.lastVoiceAt = Date.now();
        state.lastVoiceId = entry.id || sources[0];
        rememberVoiceLine(line);
        startPlay();
        return audio;
      } catch (error) {
        stopAudio();
        return null;
      }
    };

    const getEntryLine = (entry) => {
      if (!entry) return null;
      if (Array.isArray(entry.lines) && entry.lines.length) {
        const candidates = entry.lines.filter((line) => !state.recentVoiceLines.includes(line));
        return candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : entry.lines[0];
      }
      if (typeof entry.line === 'string' && entry.line.trim()) return entry.line.trim();
      return null;
    };

    const pickVoiceAsset = (actionKey, clickType) => {
      const entries = voiceCatalog[actionKey] || [];
      if (!entries.length) return null;
      let pool = entries;
      if (clickType) {
        const typed = entries.filter((entry) => {
          if (!Array.isArray(entry.types) || !entry.types.length) return true;
          return entry.types.includes(clickType) || entry.types.includes('any');
        });
        if (typed.length) pool = typed;
      }
      const fresh = pool.filter((entry) => (entry.id || entry.src) !== state.lastVoiceId);
      if (fresh.length) pool = fresh;
      const total = pool.reduce((sum, entry) => sum + (Number(entry.weight) > 0 ? Number(entry.weight) : 1), 0);
      let cursor = Math.random() * total;
      for (const entry of pool) {
        cursor -= (Number(entry.weight) > 0 ? Number(entry.weight) : 1);
        if (cursor <= 0) return entry;
      }
      return pool[0];
    };

    const say = (text, minHold = 3600, audioObj = null) => {
      if (typeof text !== 'string' || !text) return;
      clearSpeechTimers();
      bubble.classList.add('show');
      bubble.textContent = '';
      live.textContent = text;
      const token = state.voiceToken;
      let textFinished = false;
      let audioFinished = !audioObj;
      let hideArmed = false;

      const scheduleBubbleHide = (delayMs) => {
        if (hideArmed) return;
        hideArmed = true;
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
          if (token === state.voiceToken) bubble.classList.remove('show');
        }, Math.max(800, delayMs));
      };

      const tryHide = () => {
        if (textFinished && audioFinished) scheduleBubbleHide(1200);
      };

      if (audioObj) {
        const onAudioDone = () => {
          if (token !== state.voiceToken) return;
          audioFinished = true;
          tryHide();
        };
        audioObj.addEventListener('ended', onAudioDone, { once: true });
        audioObj.addEventListener('error', onAudioDone, { once: true });
        const armDuration = () => {
          if (!Number.isFinite(audioObj.duration) || audioObj.duration <= 0) return;
          setTimeout(() => {
            if (token === state.voiceToken && !audioFinished) {
              audioFinished = true;
              tryHide();
            }
          }, Math.ceil(audioObj.duration * 1000) + 1200);
        };
        if (audioObj.duration > 0) armDuration();
        else audioObj.addEventListener('loadedmetadata', armDuration, { once: true });
        setTimeout(() => {
          if (token === state.voiceToken && !audioFinished) {
            audioFinished = true;
            tryHide();
          }
        }, 14000);
      }

      if (REDUCED_MOTION.matches) {
        bubble.textContent = text;
        textFinished = true;
        if (!audioObj) scheduleBubbleHide(minHold);
        else tryHide();
        return;
      }

      let index = 0;
      const caret = document.createElement('span');
      caret.className = 'ark-caret';
      caret.textContent = '_';
      const stepMs = Math.max(18, Math.min(28, Math.floor(1200 / Math.max(text.length, 1))));
      typeTimer = setInterval(() => {
        if (token !== state.voiceToken) {
          clearInterval(typeTimer);
          return;
        }
        bubble.textContent = text.slice(0, ++index);
        if (index < text.length) return;
        clearInterval(typeTimer);
        typeTimer = null;
        bubble.appendChild(caret);
        textFinished = true;
        if (!audioObj) scheduleBubbleHide(minHold);
        else tryHide();
      }, stepMs);
    };

    const blip = (actionKey, clickType) => {
      if (muted) return;
      stopBlip();
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        audioContext = audioContext || new AudioContextClass();
        if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
        const profile = ACTIONS[actionKey] || ACTIONS.interact_wave;
        const base = 470 + profile.tone * 65 + (clickType === 'rapid' ? 100 : clickType === 'chaotic' ? 145 : 0);
        const now = audioContext.currentTime;
        const notes = [[base, 'triangle', 0.045, 0.14], [base * 1.5, 'sine', 0.018, 0.09]];
        blipNodes = notes.map(([frequency, type, volume, duration]) => {
          const oscillator = audioContext.createOscillator();
          const gain = audioContext.createGain();
          oscillator.type = type;
          oscillator.frequency.setValueAtTime(frequency, now);
          oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.35, now + duration);
          gain.gain.setValueAtTime(volume, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
          oscillator.connect(gain);
          gain.connect(audioContext.destination);
          oscillator.start(now);
          oscillator.stop(now + duration + 0.03);
          return oscillator;
        });
      } catch (error) {}
    };

    const burst = (x, y) => {
      if (REDUCED_MOTION.matches) return;
      const colors = ['#2fc4d6', '#7de8f0', '#f4f1f7', '#ffd98a'];
      for (let index = 0; index < 5; index += 1) {
        const particle = document.createElement('i');
        const color = colors[index % colors.length];
        particle.className = 'ark-particle';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.background = color;
        particle.style.boxShadow = `0 0 8px ${color}`;
        particle.style.setProperty('--dx', `${(Math.random() - 0.5) * 150}px`);
        particle.style.setProperty('--dy', `${-36 - Math.random() * 78}px`);
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 740);
      }
    };

    const classifyClick = (now, point) => {
      const quietFor = now - state.lastUserAt;
      if (quietFor > IRREGULAR_WINDOW_MS) state.recentClicks = [];
      const previous = state.recentClicks[state.recentClicks.length - 1];
      const record = { at: now, x: point.x, y: point.y };
      const cluster = [...state.recentClicks.filter((click) => now - click.at <= IRREGULAR_WINDOW_MS), record];
      const gaps = cluster.slice(1).map((click, index) => click.at - cluster[index].at);
      const gapRange = gaps.length ? Math.max(...gaps) - Math.min(...gaps) : 0;
      const turns = cluster.slice(2).filter((click, index) => {
        const first = cluster[index + 1].x - cluster[index].x;
        const second = click.x - cluster[index + 1].x;
        return first !== 0 && second !== 0 && Math.sign(first) !== Math.sign(second);
      }).length;
      let type = 'single';
      if (quietFor >= LONG_IDLE_MS) {
        type = 'away';
        state.recentClicks = [record];
      } else if (now >= state.chaosCooldownUntil && cluster.length >= 4 && gapRange >= 180 && (turns >= 1 || gapRange >= 320)) {
        type = 'chaotic';
        state.chaosCooldownUntil = now + CHAOS_COOLDOWN_MS;
        state.recentClicks = [record];
      } else {
        state.recentClicks = cluster;
        const gap = previous ? now - previous.at : Number.POSITIVE_INFINITY;
        if (previous && gap <= RAPID_GAP_MS && (cluster.length >= 3 || gap <= 180)) type = 'rapid';
        else if (cluster.length >= 2 && gap <= SHORT_REPEAT_GAP_MS) type = 'short-repeat';
      }
      state.comboCount = Math.min(cluster.length, 8);
      state.lastClickType = type;
      state.lastClickAt = now;
      state.lastUserAt = now;
      state.lastAwayNoticeAt = 0;
      return type;
    };

    const pickWeightedAction = (clickType) => {
      const weights = ACTION_WEIGHTS[clickType] || ACTION_WEIGHTS.single;
      let entries = Object.entries(weights).filter(([key, weight]) => ACTIONS[key] && weight > 0);
      if (entries.length > 1 && state.lastActionKey) entries = entries.filter(([key]) => key !== state.lastActionKey);
      const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
      let cursor = Math.random() * total;
      return (entries.find(([, weight]) => { cursor -= weight; return cursor <= 0; }) || entries[0])[0];
    };

    const playAction = (actionKey) => {
      if (state.dragging) return;
      const action = ACTIONS[actionKey] || ACTIONS.interact_wave;
      stopLoop();
      clearActionTimer();
      state.actionToken += 1;
      const token = state.actionToken;
      state.phase = 'action';
      state.actionKey = actionKey;
      state.lastActionKey = actionKey;
      const targetSheet = sheets[actionKey] ? actionKey : 'relax';

      if (REDUCED_MOTION.matches) {
        drawFrame(targetSheet, 0);
        actionTimer = setTimeout(() => {
          if (token !== state.actionToken) return;
          state.phase = 'idle';
          state.actionKey = null;
          drawFrame('relax', 0);
          runIdle();
        }, 360);
        return;
      }

      const started = performance.now();
      const duration = action.duration;
      const tick = (now) => {
        if (token !== state.actionToken || state.phase !== 'action') return;
        const elapsed = now - started;
        const idx = Math.min(FRAME_COUNT - 1, Math.floor((elapsed / duration) * FRAME_COUNT));
        drawFrame(targetSheet, idx);
        if (elapsed < duration) {
          rafId = requestAnimationFrame(tick);
        } else {
          actionTimer = setTimeout(() => {
            if (token !== state.actionToken || state.phase !== 'action') return;
            state.phase = 'idle';
            state.actionKey = null;
            state.idleIndex = 0;
            drawFrame('relax', 0);
            runIdle();
          }, ACTION_TAIL_MS);
        }
      };
      rafId = requestAnimationFrame(tick);
    };

    const scheduleIdleLines = () => {
      clearTimeout(idleLineTimer);
      const check = () => {
        const quietFor = Date.now() - state.lastUserAt;
        if (state.interacted && !collapsed && !muted && document.visibilityState === 'visible' && state.phase !== 'action' && quietFor >= 26000) {
          const idleEntries = voiceCatalog.interact_step_a || voiceCatalog.interact_wave || [];
          const entry = idleEntries.find((item) => item.id === 'amiya-idle-alert') || idleEntries[0];
          if (entry) {
            const line = getEntryLine(entry);
            if (line) {
              const aud = playVoice(entry, line);
              say(line, 4000, aud);
            }
          }
        }
        idleLineTimer = setTimeout(check, 45000 + Math.random() * 18000);
      };
      idleLineTimer = setTimeout(check, 32000 + Math.random() * 12000);
    };

    const scheduleAway = () => {
      clearTimeout(awayTimer);
      const check = () => {
        const quietFor = Date.now() - state.lastUserAt;
        const canAnnounce = Date.now() - state.lastAwayNoticeAt >= AWAY_NOTICE_COOLDOWN_MS;
        if (state.interacted && !collapsed && !muted && document.visibilityState === 'visible' && state.phase !== 'action' && quietFor >= LONG_IDLE_MS && canAnnounce) {
          state.lastAwayNoticeAt = Date.now();
          const awayEntry = (voiceCatalog.interact_wave || []).find((item) => item.id === 'amiya-companion');
          if (awayEntry) {
            const line = getEntryLine(awayEntry);
            if (line) {
              const aud = playVoice(awayEntry, line);
              say(line, 5000, aud);
            }
          }
        }
        awayTimer = setTimeout(check, 50000 + Math.random() * 20000);
      };
      awayTimer = setTimeout(check, 70000 + Math.random() * 20000);
    };

    const restartIdleAndNotices = () => { runIdle(); scheduleIdleLines(); scheduleAway(); };

    const readSavedPos = () => {
      try {
        const raw = storage.get('ark_pos', '');
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!Number.isFinite(data.x) || !Number.isFinite(data.y)) return null;
        return {
          x: Math.max(0, Math.min(1, data.x)),
          y: Math.max(0, Math.min(1, data.y)),
        };
      } catch (error) {
        return null;
      }
    };

    const clampPos = (left, top) => {
      const margin = 4;
      const width = root.offsetWidth || (collapsed ? 52 : 124);
      const height = root.offsetHeight || (collapsed ? 52 : 200);
      const maxX = Math.max(margin, window.innerWidth - width - margin);
      const maxY = Math.max(margin, window.innerHeight - height - margin);
      return {
        left: Math.max(margin, Math.min(maxX, left)),
        top: Math.max(margin, Math.min(maxY, top)),
      };
    };

    const updateBubbleAnchor = () => {
      const rect = root.getBoundingClientRect();
      root.classList.toggle('bubble-below', rect.top < 96);
      root.classList.toggle('bubble-end', rect.left < 48 || rect.left + rect.width < window.innerWidth * 0.45);
    };

    const applyPlacedPosition = (left, top) => {
      const pos = clampPos(left, top);
      root.classList.add('is-placed');
      root.style.left = `${pos.left}px`;
      root.style.top = `${pos.top}px`;
      root.style.right = 'auto';
      root.style.bottom = 'auto';
      updateBubbleAnchor();
      return pos;
    };

    const persistPosition = (pos) => {
      const width = root.offsetWidth || 1;
      const height = root.offsetHeight || 1;
      const maxX = Math.max(1, window.innerWidth - width);
      const maxY = Math.max(1, window.innerHeight - height);
      storage.set('ark_pos', JSON.stringify({
        x: Math.max(0, Math.min(1, pos.left / maxX)),
        y: Math.max(0, Math.min(1, pos.top / maxY)),
      }));
    };

    const restoreOrClampPosition = () => {
      const saved = readSavedPos();
      if (saved) {
        const maxX = Math.max(0, window.innerWidth - (root.offsetWidth || 1));
        const maxY = Math.max(0, window.innerHeight - (root.offsetHeight || 1));
        applyPlacedPosition(saved.x * maxX, saved.y * maxY);
        return;
      }
      if (root.classList.contains('is-placed')) {
        const rect = root.getBoundingClientRect();
        applyPlacedPosition(rect.left, rect.top);
        return;
      }
      updateBubbleAnchor();
    };

    const isDragHandle = (target) => {
      if (!(target instanceof Element)) return false;
      if (target.closest('#ark-sound')) return false;
      if (!collapsed && target.closest('#ark-hide')) return false;
      return true;
    };

    const applyCollapsed = () => {
      root.classList.toggle('is-collapsed', collapsed);
      hideButton.setAttribute('aria-label', collapsed ? '展开阿米娅' : '收起阿米娅');
      hideButton.setAttribute('title', collapsed ? '展开阿米娅' : '收起阿米娅');
      hideButton.textContent = collapsed ? '' : '–';
      if (collapsed) {
        stopLoop();
        clearActionTimer();
        stopAudio();
        clearSpeechTimers();
        bubble.classList.remove('show');
        live.textContent = '';
        state.phase = 'idle';
        state.actionKey = null;
      } else {
        syncCanvas();
        drawFrame('relax', idleFramesReady ? state.idleIndex : 0);
        runIdle();
      }
      restoreOrClampPosition();
    };

    const activate = (event) => {
      if (collapsed) return;
      stopAudio();
      clearSpeechTimers();
      state.interacted = true;

      if (!muted) {
        try {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) {
            audioContext = audioContext || new AudioContextClass();
            if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
          }
        } catch (error) {}
      }

      const now = Date.now();
      const rect = stage.getBoundingClientRect();
      const point = {
        x: Number.isFinite(event?.clientX) ? event.clientX : rect.left + rect.width / 2,
        y: Number.isFinite(event?.clientY) ? event.clientY : rect.top + rect.height / 2,
      };
      const clickType = classifyClick(now, point);
      const actionKey = pickWeightedAction(clickType);
      count += 1;
      storage.set('ark_pokes', String(count));
      burst(point.x, point.y);
      playAction(actionKey);

      let voiceEntry = null;
      if (promoConfig && Array.isArray(promoConfig.triggerMilestones) && promoConfig.triggerMilestones.includes(count)) {
        const promoEntries = promoConfig.entries || [];
        voiceEntry = promoEntries[Math.floor(Math.random() * promoEntries.length)] || null;
      }
      if (!voiceEntry) voiceEntry = pickVoiceAsset(actionKey, clickType);
      if (!voiceEntry) {
        const fallbackPool = voiceCatalog.interact_wave || [];
        voiceEntry = fallbackPool[Math.floor(Math.random() * fallbackPool.length)] || null;
      }

      const line = getEntryLine(voiceEntry) || '欢迎回家，博士！';
      let audioInstance = null;
      if (voiceEntry && !muted) audioInstance = playVoice(voiceEntry, line);
      else if (!muted) blip(actionKey, clickType);
      say(line, 3600, audioInstance);
      scheduleIdleLines();
      scheduleAway();
    };

    const setSwing = (deg) => {
      drag.swing = deg;
      root.style.setProperty('--ark-swing', `${deg.toFixed(2)}deg`);
    };

    const beginHeldPose = (event) => {
      state.dragging = true;
      state.actionToken += 1;
      state.phase = 'idle';
      state.actionKey = null;
      stopLoop();
      clearActionTimer();
      state.sitIndex = 0;
      drawFrame(sitFramesReady ? 'sit' : 'relax', 0);
      root.classList.add('is-dragging');
      root.classList.remove('is-settling');
      document.body.classList.add('ark-dragging');
      runSit();
      burst(event.clientX, event.clientY);
      const now = Date.now();
      if (!muted && now - lastPickupVoiceAt > 2600) {
        lastPickupVoiceAt = now;
        const poke = (voiceCatalog.interact_wave || []).find((item) => item.id === 'amiya-poke');
        const line = getEntryLine(poke) || '欸？博士？';
        const aud = poke ? playVoice(poke, line) : null;
        say(line, 1600, aud);
      } else if (!muted) {
        blip('interact_wave', 'single');
      }
    };

    const finishDrag = (event) => {
      if (drag.pointerId !== event.pointerId) return;
      const moved = drag.moved;
      if (moved) {
        const left = Number.parseFloat(root.style.left);
        const top = Number.parseFloat(root.style.top);
        if (Number.isFinite(left) && Number.isFinite(top)) persistPosition(applyPlacedPosition(left, top));
        else {
          root.classList.remove('is-dragging');
          const rect = root.getBoundingClientRect();
          persistPosition(applyPlacedPosition(rect.left, rect.top));
          root.classList.add('is-dragging');
        }
        suppressClick = true;
        window.clearTimeout(suppressClickTimer);
        suppressClickTimer = window.setTimeout(() => {
          suppressClick = false;
        }, 400);
      }
      state.dragging = false;
      setSwing(0);
      root.classList.remove('is-dragging');
      document.body.classList.remove('ark-dragging');
      if (moved && !REDUCED_MOTION.matches) {
        root.classList.add('is-settling');
        window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(() => root.classList.remove('is-settling'), 340);
      }
      try {
        if (root.hasPointerCapture?.(event.pointerId)) root.releasePointerCapture(event.pointerId);
      } catch (error) { /* ignore */ }
      drag.pointerId = null;
      drag.moved = false;
      if (moved && !collapsed) runIdle();
    };

    root.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (!isDragHandle(event.target)) return;
      const rect = root.getBoundingClientRect();
      drag.pointerId = event.pointerId;
      drag.startX = event.clientX;
      drag.startY = event.clientY;
      drag.originLeft = rect.left;
      drag.originTop = rect.top;
      drag.lastX = event.clientX;
      drag.lastT = performance.now();
      drag.moved = false;
      setSwing(0);
    });

    window.addEventListener('pointermove', (event) => {
      if (drag.pointerId !== event.pointerId) return;
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (!drag.moved) {
        if ((dx * dx) + (dy * dy) < DRAG_THRESHOLD_SQ) return;
        drag.moved = true;
        suppressClick = true;
        beginHeldPose(event);
        try { root.setPointerCapture(event.pointerId); } catch (error) { /* ignore */ }
      }
      event.preventDefault();
      const now = performance.now();
      const dt = Math.max(8, now - drag.lastT);
      const vx = (event.clientX - drag.lastX) / dt;
      drag.lastX = event.clientX;
      drag.lastT = now;
      if (!REDUCED_MOTION.matches) {
        const target = Math.max(-32, Math.min(32, vx * 180));
        setSwing(drag.swing + (target - drag.swing) * 0.38);
      }
      applyPlacedPosition(drag.originLeft + dx, drag.originTop + dy);
    }, { passive: false });

    window.addEventListener('pointerup', finishDrag);
    window.addEventListener('pointercancel', (event) => {
      finishDrag(event);
      suppressClick = false;
      window.clearTimeout(suppressClickTimer);
    });
    root.addEventListener('dragstart', (event) => event.preventDefault());

    root.addEventListener('click', (event) => {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      suppressClick = false;
      window.clearTimeout(suppressClickTimer);
    }, true);

    stage.addEventListener('click', activate);
    stage.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      activate(event);
    });

    const syncSoundButton = () => {
      soundButton.textContent = muted ? '♪̸' : '♪';
      soundButton.classList.toggle('is-off', muted);
      soundButton.setAttribute('aria-pressed', String(!muted));
    };

    soundButton.addEventListener('click', (event) => {
      event.stopPropagation();
      muted = !muted;
      storage.set('ark_muted', muted ? '1' : '0');
      syncSoundButton();
      if (muted) {
        stopAudio();
        clearSpeechTimers();
        bubble.classList.remove('show');
        live.textContent = '';
      } else {
        blip('interact_wave', 'single');
        say('音效已开启 ♪', 1600);
        preloadVoices();
      }
    });

    hideButton.addEventListener('click', (event) => {
      event.stopPropagation();
      collapsed = !collapsed;
      storage.set('ark_hidden', collapsed ? '1' : '0');
      applyCollapsed();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopLoop();
        clearActionTimer();
        state.actionToken += 1;
        state.phase = 'idle';
        state.actionKey = null;
        state.dragging = false;
        setSwing(0);
        root.classList.remove('is-dragging', 'is-settling');
        document.body.classList.remove('ark-dragging');
        clearSpeechTimers();
        clearTimeout(idleLineTimer);
        clearTimeout(awayTimer);
        stopAudio();
        drawFrame('relax', 0);
      } else {
        state.idleIndex = 0;
        syncCanvas();
        drawFrame('relax', 0);
        restartIdleAndNotices();
      }
    });

    window.addEventListener('pagehide', stopAudio);
    window.addEventListener('resize', () => {
      restoreOrClampPosition();
      if (!syncCanvas()) return;
      if (state.dragging) drawFrame(sitFramesReady ? 'sit' : 'relax', state.sitIndex);
      else drawFrame(state.actionKey || 'relax', state.idleIndex);
    });

    const onMotionPreferenceChange = () => {
      stopLoop();
      clearActionTimer();
      clearSpeechTimers();
      bubble.classList.remove('show');
      stopAudio();
      state.actionToken += 1;
      state.phase = 'idle';
      state.actionKey = null;
      state.idleIndex = 0;
      drawFrame('relax', 0);
      restartIdleAndNotices();
    };

    if (typeof REDUCED_MOTION.addEventListener === 'function') REDUCED_MOTION.addEventListener('change', onMotionPreferenceChange);
    else if (typeof REDUCED_MOTION.addListener === 'function') REDUCED_MOTION.addListener(onMotionPreferenceChange);

    syncCanvas();
    syncSoundButton();
    applyCollapsed();

    loadSheet(null, STATIC_FIRST_FRAME).then((image) => {
      firstFrame = image;
      if (!idleFramesReady) {
        syncCanvas();
        drawSource(image, 0);
      }
    });

    loadSheet('relax', SPRITE_SHEETS.relax).then((image) => {
      idleFramesReady = Boolean(image);
      root.classList.remove('is-loading');
      syncCanvas();
      drawFrame('relax', 0);
      if (!collapsed && !document.hidden && state.phase === 'idle' && !REDUCED_MOTION.matches) runIdle();
      Promise.all([
        loadSheet('interact_wave', SPRITE_SHEETS.interact_wave),
        loadSheet('interact_step_a', SPRITE_SHEETS.interact_step_a),
        loadSheet('interact_step_b', SPRITE_SHEETS.interact_step_b),
        loadSheet('sit', SPRITE_SHEETS.sit).then((image) => {
          sitFramesReady = Boolean(image);
          if (sitFramesReady && state.dragging && !collapsed) runSit();
          return image;
        }),
      ]).then(() => {
        if (!muted) preloadVoices();
      });
    });

    if (!collapsed) restartIdleAndNotices();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
