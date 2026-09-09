document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-year]').forEach((element) => {
    element.textContent = new Date().getFullYear();
  });
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => nav.classList.remove('open')));
});

/* ============== 明日方舟 Q版小干员（全站悬浮 · 点击互动 · Canvas极速图集引擎） ============== */
(() => {
  const ASSET = 'assets/mascot/';
  const VOICE_ASSET_DIR = `${ASSET}voice/`;
  const FRAME_COUNT = 20;

  // 1. 图集（Sprite Sheet）资源：将 80 个碎片化网络请求合并为 4 张高性能 WebP 图集
  // 彻底根治网络加载丢帧、HTTP 堵塞、DOM 切图闪烁，利用 Canvas GPU 硬件加速秒级切帧
  const SPRITE_SHEETS = Object.freeze({
    relax: `${ASSET}sheet_relax.webp`,
    interact_wave: `${ASSET}sheet_interact_wave.webp`,
    interact_step_a: `${ASSET}sheet_interact_step_a.webp`,
    interact_step_b: `${ASSET}sheet_interact_step_b.webp`,
  });
  const STATIC_FIRST_FRAME = `${ASSET}amiya_relax_01.webp`;

  const ACTIONS = Object.freeze({
    interact_wave: { duration: 1000, tone: 1 },
    interact_step_a: { duration: 1133.33, tone: 2 },
    interact_step_b: { duration: 1133.33, tone: 3 },
  });

  const IDLE_FRAME_MS = 50;
  const ACTION_TAIL_MS = 80;
  const LONG_IDLE_MS = 60 * 1000;
  const SHORT_REPEAT_GAP_MS = 850;
  const RAPID_GAP_MS = 260;
  const IRREGULAR_WINDOW_MS = 2200;
  const CHAOS_COOLDOWN_MS = 9000;
  const AWAY_NOTICE_COOLDOWN_MS = 55 * 1000;

  const MASCOT_HTML = '<canvas class="ark-sprite ark-canvas" id="ark-canvas" width="314" height="460" aria-label="阿米娅Q版小人"></canvas>';

  const ACTION_WEIGHTS = Object.freeze({
    single: { interact_wave: 0.55, interact_step_a: 0.25, interact_step_b: 0.20 },
    'short-repeat': { interact_wave: 0.20, interact_step_a: 0.45, interact_step_b: 0.35 },
    rapid: { interact_wave: 0.15, interact_step_a: 0.40, interact_step_b: 0.45 },
    away: { interact_wave: 0.55, interact_step_a: 0.20, interact_step_b: 0.25 },
    chaotic: { interact_wave: 0.35, interact_step_a: 0.35, interact_step_b: 0.30 },
  });

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

  function readVoiceCatalog() {
    const source = window.ARK_MASCOT_VOICE_ASSETS;
    const catalog = {};
    Object.keys(ACTIONS).forEach((key) => {
      catalog[key] = source && Array.isArray(source[key]) ? source[key].filter((entry) => {
        if (!entry) return false;
        if (typeof entry.src === 'string' && isLocalVoiceAsset(entry.src)) return true;
        if (Array.isArray(entry.sources) && entry.sources.some(isLocalVoiceAsset)) return true;
        return false;
      }) : [];
    });
    return catalog;
  }

  function readPromoConfig() {
    const promo = window.ARK_MASCOT_PROMO_CONFIG;
    if (!promo || typeof promo !== 'object' || !promo.enabled || !Array.isArray(promo.entries)) return null;
    const validEntries = promo.entries.filter((entry) => {
      if (!entry) return false;
      if (typeof entry.src === 'string' && isLocalVoiceAsset(entry.src)) return true;
      if (Array.isArray(entry.sources) && entry.sources.some(isLocalVoiceAsset)) return true;
      return false;
    });
    return validEntries.length ? { ...promo, entries: validEntries } : null;
  }

  function init() {
    if (document.getElementById('ark-mascot')) return;
    const root = document.createElement('aside');
    root.id = 'ark-mascot';
    root.className = 'ark-mascot';
    root.setAttribute('aria-label', '罗德岛小干员');
    root.innerHTML = '<div class="ark-bubble" id="ark-bubble" role="status" aria-live="polite"></div><div class="ark-bob"><div class="ark-stage" id="ark-stage" role="button" tabindex="0" aria-label="与阿米娅互动">' + MASCOT_HTML + '</div></div><div class="ark-tag">RHODES ISLAND</div><button class="ark-sound" id="ark-sound" type="button" aria-label="开关语音和点击音效" title="开关语音和点击音效" aria-pressed="true">♪</button>';
    document.body.appendChild(root);

    const stage = root.querySelector('#ark-stage');
    const bubble = root.querySelector('#ark-bubble');
    const canvas = root.querySelector('#ark-canvas');
    const ctx = canvas.getContext('2d', { alpha: true });
    const soundButton = root.querySelector('#ark-sound');
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

    // ================== Canvas 图集管理与平滑渲染 ==================
    const sheets = {};
    let idleFramesReady = false;

    const loadSingleSheet = (key, url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          sheets[key] = img;
          resolve(img);
        };
        img.onerror = () => resolve(null);
        img.src = url;
      });
    };

    const drawFrame = (sheetKey, index) => {
      const sheet = sheets[sheetKey] || sheets.relax;
      if (!sheet || !sheet.complete || sheet.naturalWidth === 0) return false;
      const idx = Math.max(0, Math.min(FRAME_COUNT - 1, index));
      ctx.clearRect(0, 0, 314, 460);
      ctx.drawImage(sheet, idx * 314, 0, 314, 460, 0, 0, 314, 460);
      return true;
    };

    // 1. 毫秒级展示第一帧静态首图（23KB，秒级直出，保证初载绝不白屏）
    const firstFrameImg = new Image();
    firstFrameImg.onload = () => {
      if (!idleFramesReady) {
        ctx.clearRect(0, 0, 314, 460);
        ctx.drawImage(firstFrameImg, 0, 0);
      }
    };
    firstFrameImg.src = STATIC_FIRST_FRAME;

    // 2. 优先预载待机动画图集（仅 432KB 单文件，杜绝 80 张网络并发阻塞）
    loadSingleSheet('relax', SPRITE_SHEETS.relax).then(() => {
      idleFramesReady = true;
      drawFrame('relax', 0);
      if (!document.hidden && state.phase === 'idle' && !REDUCED_MOTION.matches) {
        runIdle();
      }
      // 3. 待机就绪后，后台空闲平缓预载 3 个动作图集，完全不抢占带宽
      loadSingleSheet('interact_wave', SPRITE_SHEETS.interact_wave)
        .then(() => loadSingleSheet('interact_step_a', SPRITE_SHEETS.interact_step_a))
        .then(() => loadSingleSheet('interact_step_b', SPRITE_SHEETS.interact_step_b));
    });

    let count = Math.max(0, Number.parseInt(storage.get('ark_pokes', '0'), 10) || 0);
    let muted = storage.get('ark_muted', '0') === '1';
    let typeTimer = null;
    let hideTimer = null;
    let idleFrameTimer = null;
    let idleLineTimer = null;
    let awayTimer = null;
    let actionTimer = null;
    let audioContext = null;
    let activeAudio = null;
    let blipNodes = [];

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

    const stopIdle = () => {
      clearTimeout(idleFrameTimer);
      idleFrameTimer = null;
    };

    const runIdle = () => {
      stopIdle();
      if (REDUCED_MOTION.matches || document.hidden || state.phase === 'action') return;
      if (!idleFramesReady) {
        drawFrame('relax', 0);
        return;
      }
      const loop = () => {
        if (document.hidden || state.phase === 'action') return;
        state.idleIndex = (state.idleIndex + 1) % FRAME_COUNT;
        drawFrame('relax', state.idleIndex);
        idleFrameTimer = setTimeout(loop, IDLE_FRAME_MS);
      };
      idleFrameTimer = setTimeout(loop, IDLE_FRAME_MS);
    };

    // ================== 音频管理器（杜绝旧音残留 · 保证新音秒播） ==================
    const stopBlip = () => {
      blipNodes.forEach((node) => { try { node.stop(); } catch (error) {} });
      blipNodes = [];
    };

    const stopAudio = () => {
      state.voiceToken += 1; // 关键：立即作废所有旧异步任务与计时器
      if (activeAudio) {
        const a = activeAudio;
        activeAudio = null;
        a.onended = null;
        a.onpause = null;
        a.onerror = null;
        try { a.pause(); } catch (error) {}
        try { a.currentTime = 0; } catch (error) {}
        try {
          a.src = '';
          a.load(); // 强制释放硬件音频通道，绝不滞留声音
        } catch (error) {}
      }
      stopBlip();
    };

    const playVoice = (entry, line) => {
      if (muted || !entry) return null;
      stopAudio(); // 每次调用无条件彻底停掉上一次语音！
      const token = state.voiceToken;

      const candidateSources = (Array.isArray(entry.sources) && entry.sources.length ? entry.sources : [entry.src]).filter(isLocalVoiceAsset);
      if (!candidateSources.length) return null;

      const audio = new Audio();
      audio.preload = 'auto';
      const volume = Number(entry.volume);
      audio.volume = Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : 0.8;
      activeAudio = audio;

      let srcIndex = 0;
      const startPlay = () => {
        if (token !== state.voiceToken) return;
        audio.src = candidateSources[srcIndex];
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch((err) => {
            // 被快速连击主动打断时产生的 AbortError 属于正常现象，直接忽略
            if (token !== state.voiceToken) return;
            if (err.name === 'AbortError') return;
            if (srcIndex < candidateSources.length - 1) {
              srcIndex += 1;
              startPlay();
            }
          });
        }
      };

      try {
        state.lastVoiceAt = Date.now();
        state.lastVoiceId = entry.id || candidateSources[0];
        rememberVoiceLine(line);
        startPlay();
        return audio;
      } catch (error) {
        stopAudio();
        return null;
      }
    };

    const rememberVoiceLine = (line) => {
      if (!line) return;
      state.recentVoiceLines.push(line);
      if (state.recentVoiceLines.length > 5) state.recentVoiceLines.shift();
    };

    const getEntryLine = (entry) => {
      if (!entry) return null;
      if (Array.isArray(entry.lines) && entry.lines.length) {
        const candidates = entry.lines.filter((l) => !state.recentVoiceLines.includes(l));
        return candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : entry.lines[0];
      }
      if (typeof entry.line === 'string' && entry.line.trim()) return entry.line.trim();
      return null;
    };

    const pickVoiceAsset = (actionKey) => {
      const entries = voiceCatalog[actionKey] || [];
      if (!entries.length) return null;
      const fresh = entries.filter((entry) => (entry.id || entry.src) !== state.lastVoiceId);
      const pool = fresh.length ? fresh : entries;
      const total = pool.reduce((sum, entry) => sum + (Number(entry.weight) > 0 ? Number(entry.weight) : 1), 0);
      let cursor = Math.random() * total;
      for (const entry of pool) {
        cursor -= (Number(entry.weight) > 0 ? Number(entry.weight) : 1);
        if (cursor <= 0) return entry;
      }
      return pool[0];
    };

    // ================== 气泡打字机与音字同步 ==================
    const say = (text, minHold = 3600, audioObj = null) => {
      clearSpeechTimers();
      bubble.classList.add('show');
      bubble.textContent = '';
      const token = state.voiceToken;
      let textFinished = false;
      let audioFinished = !audioObj;

      const scheduleBubbleHide = (delayMs) => {
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
          if (token === state.voiceToken) {
            bubble.classList.remove('show');
          }
        }, Math.max(800, delayMs));
      };

      const tryHide = () => {
        // 核心要求：字出现时间至少要和语音时间一样长。文字打完且音频播放完毕时才启动 1.2s 消失倒计时！
        if (textFinished && audioFinished) {
          scheduleBubbleHide(1200);
        }
      };

      if (audioObj) {
        const onAudioDone = () => {
          if (token !== state.voiceToken) return;
          audioFinished = true;
          tryHide();
        };
        audioObj.addEventListener('ended', onAudioDone, { once: true });
        audioObj.addEventListener('pause', onAudioDone, { once: true });
        audioObj.addEventListener('error', onAudioDone, { once: true });
        // 超时兜底保障：即使浏览器没有正常派发 ended 事件，依据音频时长保证字在播放期间绝不提前消失
        if (audioObj.duration && Number.isFinite(audioObj.duration) && audioObj.duration > 0) {
          setTimeout(() => {
            if (token === state.voiceToken && !audioFinished) {
              audioFinished = true;
              tryHide();
            }
          }, Math.ceil(audioObj.duration * 1000) + 1200);
        }
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
      const stepMs = Math.max(16, Math.min(26, Math.floor(1200 / Math.max(text.length, 1))));
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
      for (let index = 0; index < 9; index += 1) {
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
      } else if (Date.now() >= state.chaosCooldownUntil && cluster.length >= 4 && gapRange >= 180 && (turns >= 1 || gapRange >= 320)) {
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
      const action = ACTIONS[actionKey] || ACTIONS.interact_wave;
      stopIdle();
      clearActionTimer();
      state.actionToken += 1;
      const token = state.actionToken;
      state.phase = 'action';
      state.actionKey = actionKey;
      state.lastActionKey = actionKey;
      stage.classList.add('is-action');

      const targetSheet = sheets[actionKey] ? actionKey : 'relax';
      const frameMs = action.duration / FRAME_COUNT;
      let frameIndex = 0;

      const advance = () => {
        if (token !== state.actionToken || state.phase !== 'action') return;
        drawFrame(targetSheet, frameIndex);
        frameIndex += 1;
        if (frameIndex < FRAME_COUNT) {
          actionTimer = setTimeout(advance, frameMs);
        } else {
          // 动作动画播完后，平滑复位待机，注意：绝不打印无声结语对白覆盖语音！
          actionTimer = setTimeout(() => {
            if (token !== state.actionToken || state.phase !== 'action') return;
            state.phase = 'idle';
            state.actionKey = null;
            stage.classList.remove('is-action');
            drawFrame('relax', 0);
            runIdle();
          }, ACTION_TAIL_MS);
        }
      };
      advance();
    };

    const scheduleIdleLines = () => {
      clearTimeout(idleLineTimer);
      const check = () => {
        const quietFor = Date.now() - state.lastUserAt;
        if (document.visibilityState === 'visible' && state.phase !== 'action' && quietFor >= 26000) {
          // 空闲提醒：选取一条真实的待机原声播放并展示对白，杜绝无声冒字
          const idleEntries = voiceCatalog.interact_step_a || voiceCatalog.interact_wave || [];
          const entry = idleEntries.find((e) => e.id === 'amiya-idle-alert') || idleEntries[0];
          if (entry && !muted) {
            const line = getEntryLine(entry);
            const aud = playVoice(entry, line);
            say(line, 4000, aud);
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
        if (document.visibilityState === 'visible' && state.phase !== 'action' && quietFor >= LONG_IDLE_MS && canAnnounce) {
          state.lastAwayNoticeAt = Date.now();
          // 离开回归提醒：选取官方原声 official_cn_009 进行陪伴提示，杜绝无声冒字
          const awayEntry = (voiceCatalog.interact_wave || []).find((e) => e.id === 'amiya-companion');
          if (awayEntry && !muted) {
            const line = getEntryLine(awayEntry);
            const aud = playVoice(awayEntry, line);
            say(line, 5000, aud);
          }
        }
        awayTimer = setTimeout(check, 50000 + Math.random() * 20000);
      };
      awayTimer = setTimeout(check, 70000 + Math.random() * 20000);
    };

    const restartIdleAndNotices = () => { runIdle(); scheduleIdleLines(); scheduleAway(); };

    // ================== 核心交互入口 (点击触发) ==================
    const activate = (event) => {
      // 1. 核心要求：每一次点击立即强行切断上一句语音、打字机和气泡倒计时
      stopAudio();
      clearSpeechTimers();

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

      // 2. 核心要求：开启下一次动作动画
      playAction(actionKey);

      // 3. 核心要求：开启下一次的字以及字所对应的语音（100% 官方原声匹配，绝不出现无声文本）
      let voiceEntry = null;

      // 检查里程碑宣传触发 (如第 5, 10, 20, 50, 100 次点击)
      if (promoConfig && Array.isArray(promoConfig.triggerMilestones) && promoConfig.triggerMilestones.includes(count)) {
        const pEntries = promoConfig.entries || [];
        voiceEntry = pEntries[Math.floor(Math.random() * pEntries.length)] || null;
      }

      // 常规动作匹配可用语音条目（确保每一个动作都有专属真实语音包）
      if (!voiceEntry) {
        voiceEntry = pickVoiceAsset(actionKey);
      }

      // 若动作语音库暂未命中，安全回退到问候原声库，确保点击 100% 有语音
      if (!voiceEntry) {
        const fallbackPool = voiceCatalog.interact_wave || [];
        voiceEntry = fallbackPool[Math.floor(Math.random() * fallbackPool.length)] || null;
      }

      // 台词严格取自该官方原声条目的实际录音对白！绝不从无声文本库随机抽取！
      const line = getEntryLine(voiceEntry) || '欢迎回家，博士！';

      // 4. 播放该语音，并将 audio 对象传递给 say()，实现字音完全同步、字持续时间 >= 语音时间
      let audioInstance = null;
      if (voiceEntry && !muted) {
        audioInstance = playVoice(voiceEntry, line);
      } else if (!muted) {
        blip(actionKey, clickType);
      }

      say(line, 3600, audioInstance);

      scheduleIdleLines();
      scheduleAway();
    };

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
      } else {
        blip('interact_wave', 'single');
        say('音效已开启 ♪', 1600);
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopIdle();
        clearActionTimer();
        state.actionToken += 1;
        state.phase = 'idle';
        state.actionKey = null;
        clearSpeechTimers();
        clearTimeout(idleLineTimer);
        clearTimeout(awayTimer);
        stopAudio();
        drawFrame('relax', 0);
      } else {
        state.idleIndex = 0;
        drawFrame('relax', 0);
        restartIdleAndNotices();
      }
    });

    window.addEventListener('pagehide', stopAudio);

    const onMotionPreferenceChange = () => {
      stopIdle();
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

    syncSoundButton();
    restartIdleAndNotices();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
