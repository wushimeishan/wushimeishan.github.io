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

/* ============== 明日方舟 Q版小干员（全站悬浮 · 点击互动） ============== */
(() => {
  const ASSET = 'assets/mascot/';
  const VOICE_ASSET_DIR = `${ASSET}voice/`;
  const FRAME_COUNT = 20;
  const RELAX_FRAMES = Array.from({ length: FRAME_COUNT }, (_, index) => `amiya_relax_${String(index + 1).padStart(2, '0')}.png`);
  const makeFrames = (prefix) => Array.from({ length: FRAME_COUNT }, (_, index) => `${prefix}${String(index + 1).padStart(2, '0')}.png`);
  const ACTIONS = Object.freeze({
    interact_wave: { frames: makeFrames('amiya_interact_'), duration: 1000, tone: 1 },
    interact_step_a: { frames: makeFrames('amiya_interact_step_a_'), duration: 1133.3333253860474, tone: 2 },
    interact_step_b: { frames: makeFrames('amiya_interact_step_b_'), duration: 1133.3333253860474, tone: 3 },
  });
  const ACTION_TAIL = 'amiya_relax_01.png';
  const STATIC_IDLE_FRAME = 'amiya_relax_01.png';
  const STATIC_ACTION_FRAME = 'amiya_interact_01.png';
  const IDLE_FRAME_MS = 50;
  const ACTION_TAIL_MS = 90;
  const LONG_IDLE_MS = 60 * 1000;
  const SHORT_REPEAT_GAP_MS = 850;
  const RAPID_GAP_MS = 260;
  const IRREGULAR_WINDOW_MS = 2200;
  const CHAOS_COOLDOWN_MS = 9000;
  const AWAY_NOTICE_COOLDOWN_MS = 55 * 1000;
  const VOICE_COOLDOWN_MS = 2200;
  const MASCOT_HTML = '<img class="ark-sprite ark-sprite-idle" src="assets/mascot/amiya_relax_01.png" alt="阿米娅Q版小人" draggable="false"><img class="ark-sprite ark-sprite-action" src="assets/mascot/amiya_interact_01.png" alt="" draggable="false" aria-hidden="true" hidden>';

  const CLICK_LINES = [
    '博士，欢迎回来。今天的行程我已经整理好了。','嗯，我在。有什么任务尽管交给我吧。','请放心，罗德岛会一直陪在博士身边。','博士的指挥很可靠，我也要再认真一点。','工作告一段落的话，记得喝一口水哦。','这次行动的资料，我再核对一遍。','今天也一起把该完成的事做好吧。','理智恢复得差不多了，要不要稍微休息一下？','博士，需要我为您准备行动方案吗？','虽然会紧张……但我会努力跟上博士。','甲板上的风很舒服，忙完可以去走走。','我相信博士的判断，也相信大家。','别把所有事都一个人扛着，可以叫上我。','今天的罗德岛也很平稳，真是太好了。','资料已经分类完成，随时可以查看。','博士，眼睛累了就看远处一会儿吧。','我会把每一次托付都认真记下来。','就算是小小的一步，也是在向前走。','那、那个……被博士点到名，我很高兴。','请把接下来的任务也交给我吧。','大家都在努力，博士也别太勉强自己。','今天的目标，和博士一起完成。','报告：小队状态良好，可以随时出发。','博士的到来，让这里安心了很多。'
  ];
  const IDLE_LINES = [
    '博士……还在忙吗？我会在这里等您。','不用急，先把手边这一项完成就好。','窗外天色变了，博士要不要稍微休息？','我刚整理完几份报告，感觉很充实。','安静的时候，罗德岛的引擎声也很好听。','博士，肩膀放松一点……这样会舒服些。','等您有空，我们一起确认明天的计划吧。','我在练习更清楚地传达想法，希望有进步。','大家平安地回来，就是最好的结果。','要是累了，停下来看看风景也没关系。','今天的空气很清新，适合深呼吸一下。','博士不说话也没关系，我会陪着您的。','偶尔放慢一点，之后才能走得更远。','我想把每一天都过得更认真一些。'
  ];
  const REPEAT_LINES = [
    '博士，我收到啦。我们慢慢确认就好。','连续点名也没关系，我会认真回应。','我在这里，刚才的指令没有漏掉。','一项一项来就好，博士不用着急。','嗯嗯，我听见了。请给我一点整理时间。'
  ];
  const RAPID_LINES = [
    '啊……博士，慢一点，我会跟不上啦！','这么着急，是有紧急任务吗？','我、我收到了！请让我先深呼吸一下。','博士的手速真厉害……不过也请休息。','连续确认这么多次，我可不会漏掉哦。','别急别急，我们一项一项来。','我在听，博士不用担心。','再快一点的话……我就要转圈啦！','博士好有精神，我也不能输。','这么频繁地叫我，是不是想聊天？'
  ];
  const CHAOTIC_LINES = [
    '博士，刚才的节奏有些快……我还在这里。','指令交错了也没关系，我们重新整理一下吧。','我、我都记下来了，请先让我们稳住节奏。','刚才像是同时收到了好几项任务呢。','不用慌，博士。我们把顺序重新排好就好。'
  ];
  const AWAY_LINES = [
    '博士，好久没有互动了。现在还顺利吗？','我留了一盏小灯，回来时不会找不到路。','报告先放在这里，等博士方便时再看。','大家都很安静，我想博士大概在专心工作。','别忘了补充水分，我会替您记着的。','时间过去一会儿了，眼睛需要休息吗？','我还在这里。博士回来时叫我就好。','如果遇到难题，不必急着一个人解决。','今天也辛苦了，哪怕只完成一点点。'
  ];
  const END_LINES = ['动作汇报完毕。接下来继续待命！','呼……完成了。博士，下一个安排是什么？','我回到岗位啦，随时可以再叫我。','这样就好。谢谢博士陪我练习。','嗯，状态稳定。让我们继续努力吧。','小小的互动也结束了，我会继续守在这里。','报告完成，阿米娅继续待命。'];
  const MILESTONES = { 5: '已经互动 5 次了……博士今天很有精神呢。', 10: '第 10 次确认！博士的专注让我也更有干劲。', 20: '20 次了。谢谢博士一直愿意回应我。', 50: '第 50 次互动：这份信赖，我会好好珍惜。', 100: '100 次！博士，我们已经很有默契了吧？', 200: '200 次互动达成。罗德岛的记录里会写下这一页。' };
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
    const idleSprite = root.querySelector('.ark-sprite-idle');
    const actionSprite = root.querySelector('.ark-sprite-action');
    const soundButton = root.querySelector('#ark-sound');
    const voiceCatalog = readVoiceCatalog();
    const promoConfig = readPromoConfig();
    const storage = {
      get(key, fallback) {
        try { return localStorage.getItem(key) ?? fallback; } catch (error) { return fallback; }
      },
      set(key, value) {
        try { localStorage.setItem(key, value); } catch (error) { /* file:// 或隐私模式可能禁用存储。 */ }
      },
    };
    const preloadFrames = [...new Set([STATIC_IDLE_FRAME, STATIC_ACTION_FRAME, ACTION_TAIL, ...RELAX_FRAMES, ...Object.values(ACTIONS).flatMap((action) => action.frames)])];
    preloadFrames.forEach((frame) => { const image = new Image(); image.decoding = 'async'; image.src = ASSET + frame; });

    let count = Math.max(0, Number.parseInt(storage.get('ark_pokes', '0'), 10) || 0);
    let muted = storage.get('ark_muted', '0') === '1';
    let typeTimer = null;
    let hideTimer = null;
    let idleFrameTimer = null;
    let idleLineTimer = null;
    let awayTimer = null;
    let actionTimer = null;
    let audioContext = null;
    let voiceAudio = null;
    let blipNodes = [];
    let introPending = !REDUCED_MOTION.matches;
    const lineHistory = { click: [], repeat: [], rapid: [], chaotic: [], idle: [], away: [], end: [], milestone: [] };
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
    const remember = (kind, value) => {
      const history = lineHistory[kind] || (lineHistory[kind] = []);
      history.push(value);
      if (history.length > 5) history.shift();
      return value;
    };
    const pickLine = (kind, lines) => {
      const history = lineHistory[kind] || [];
      const candidates = lines.filter((line) => !history.includes(line));
      const pool = candidates.length ? candidates : lines;
      return remember(kind, pool[Math.floor(Math.random() * pool.length)]);
    };
    const setSpriteFrame = (sprite, frame) => {
      if (sprite.dataset.frame === frame) return;
      sprite.dataset.frame = frame;
      sprite.src = ASSET + frame;
    };
    const showIdle = (frame = RELAX_FRAMES[state.idleIndex]) => {
      state.phase = 'idle';
      state.actionKey = null;
      stage.classList.remove('is-action');
      setSpriteFrame(idleSprite, frame);
      idleSprite.hidden = false;
      actionSprite.hidden = true;
    };
    const runIdle = () => {
      stopIdle();
      if (REDUCED_MOTION.matches || document.hidden || state.phase === 'action') return;
      const start = () => {
        if (document.hidden || state.phase === 'action') return;
        state.idleIndex = 0;
        showIdle();
        const startedAt = performance.now();
        const loop = () => {
          if (document.hidden || state.phase === 'action') return;
          state.idleIndex = (state.idleIndex + 1) % RELAX_FRAMES.length;
          showIdle();
          const elapsed = performance.now() - startedAt;
          idleFrameTimer = setTimeout(loop, Math.max(0, IDLE_FRAME_MS - (elapsed % IDLE_FRAME_MS)));
        };
        idleFrameTimer = setTimeout(loop, IDLE_FRAME_MS);
      };
      if (introPending) {
        introPending = false;
        showIdle(STATIC_IDLE_FRAME);
        idleFrameTimer = setTimeout(start, 420);
      } else start();
    };
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
        // 字出现时间至少要和语音时间一样长：文字展示完毕且音频播放结束时才开始倒计时
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
      }

      if (REDUCED_MOTION.matches) {
        bubble.textContent = text;
        textFinished = true;
        if (!audioObj) {
          scheduleBubbleHide(minHold);
        } else {
          tryHide();
        }
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
        if (!audioObj) {
          scheduleBubbleHide(minHold);
        } else {
          tryHide();
        }
      }, stepMs);
    };
    const syncSoundButton = () => {
      soundButton.textContent = muted ? '♪̸' : '♪';
      soundButton.classList.toggle('is-off', muted);
      soundButton.setAttribute('aria-pressed', String(!muted));
    };
    const stopVoice = () => {
      state.voiceToken += 1;
      if (!voiceAudio) return;
      voiceAudio.onerror = null;
      voiceAudio.onended = null;
      voiceAudio.onpause = null;
      try { voiceAudio.pause(); } catch (error) { /* 媒体元素不可用时继续清理状态。 */ }
      try { voiceAudio.currentTime = 0; } catch (error) { /* 尚未加载媒体时 currentTime 可能不可写。 */ }
    };
    const stopBlip = () => {
      blipNodes.forEach((node) => { try { node.stop(); } catch (error) { /* 已结束的振荡器无需处理。 */ } });
      blipNodes = [];
    };
    const stopAudio = () => { stopVoice(); stopBlip(); };
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
      } catch (error) { /* 浏览器禁用音频时保持静默。 */ }
    };
    const pickPromoAsset = (actionKey, clickType, comboCount, currentCount) => {
      if (!promoConfig || !promoConfig.enabled || !Array.isArray(promoConfig.entries) || !promoConfig.entries.length) return null;
      if (promoConfig.triggerMode === 'milestone') {
        const milestones = Array.isArray(promoConfig.triggerMilestones) ? promoConfig.triggerMilestones : [];
        if (!milestones.includes(currentCount)) return null;
      }
      const candidates = promoConfig.entries.filter((entry) => {
        if (entry.action && entry.action !== actionKey) return false;
        const types = Array.isArray(entry.types) ? entry.types : entry.type ? [entry.type] : [];
        if (types.length && !types.includes(clickType) && !types.includes('any')) return false;
        const comboMin = Number(entry.comboMin);
        const comboMax = Number(entry.comboMax);
        if (Number.isFinite(comboMin) && comboCount < comboMin) return false;
        if (Number.isFinite(comboMax) && comboCount > comboMax) return false;
        return true;
      });
      if (!candidates.length) return null;
      return candidates[Math.floor(Math.random() * candidates.length)];
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

    const getEntryLine = (entry) => {
      if (!entry) return null;
      if (Array.isArray(entry.lines) && entry.lines.length) {
        const candidates = entry.lines.filter((line) => !state.recentVoiceLines.includes(line));
        return candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : entry.lines[0];
      }
      if (typeof entry.line === 'string' && entry.line.trim()) return entry.line.trim();
      return null;
    };

    const rememberVoiceLine = (line) => {
      if (!line) return;
      state.recentVoiceLines.push(line);
      if (state.recentVoiceLines.length > 5) state.recentVoiceLines.shift();
    };

    const playVoice = (entry, line) => {
      if (muted || !entry) return null;
      stopVoice();
      const token = state.voiceToken;
      try { voiceAudio = voiceAudio || new Audio(); } catch (error) { return null; }
      const candidateSources = (Array.isArray(entry.sources) && entry.sources.length ? entry.sources : [entry.src]).filter(isLocalVoiceAsset);
      if (!candidateSources.length) return null;
      const voiceId = entry.id || candidateSources[0];
      let sourceIndex = 0;

      const tryPlay = () => {
        if (token !== state.voiceToken) return;
        try {
          voiceAudio.preload = 'auto';
          const volume = Number(entry.volume);
          voiceAudio.volume = Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : 0.78;
          voiceAudio.src = candidateSources[sourceIndex];
          voiceAudio.onerror = () => {
            if (token !== state.voiceToken) return;
            if (sourceIndex < candidateSources.length - 1) {
              sourceIndex += 1;
              tryPlay();
            }
          };
          const result = voiceAudio.play();
          if (result && typeof result.catch === 'function') {
            result.catch(() => {
              if (token !== state.voiceToken) return;
              if (sourceIndex < candidateSources.length - 1) {
                sourceIndex += 1;
                tryPlay();
              }
            });
          }
        } catch (error) {}
      };

      try {
        state.lastVoiceAt = Date.now();
        state.lastVoiceId = voiceId;
        rememberVoiceLine(line);
        tryPlay();
        return voiceAudio;
      } catch (error) {
        state.lastVoiceAt = 0;
        state.lastVoiceId = '';
        stopVoice();
        return null;
      }
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
    const clearBurstParticles = () => {
      document.querySelectorAll('.ark-particle').forEach((particle) => particle.remove());
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
    const selectInteractionLine = (clickType) => {
      if (MILESTONES[count]) return remember('milestone', MILESTONES[count]);
      if (clickType === 'away') return pickLine('away', AWAY_LINES);
      if (clickType === 'chaotic') return pickLine('chaotic', CHAOTIC_LINES);
      if (clickType === 'rapid') return pickLine('rapid', RAPID_LINES);
      if (clickType === 'short-repeat') return pickLine('repeat', REPEAT_LINES);
      return pickLine('click', CLICK_LINES);
    };
    const finishAction = (token, announce = true) => {
      if (token !== state.actionToken || state.phase !== 'action') return;
      actionTimer = null;
      state.idleIndex = 0;
      showIdle(RELAX_FRAMES[0]);
      runIdle();
      if (announce && !document.hidden) say(pickLine('end', END_LINES), 2600);
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
      setSpriteFrame(actionSprite, REDUCED_MOTION.matches ? STATIC_ACTION_FRAME : action.frames[0]);
      stage.classList.add('is-action');
      idleSprite.hidden = true;
      actionSprite.hidden = false;
      if (REDUCED_MOTION.matches) {
        actionTimer = setTimeout(() => finishAction(token, false), 180);
        return;
      }
      const frameMs = action.duration / action.frames.length;
      const startedAt = performance.now();
      const advance = (index) => {
        if (token !== state.actionToken || state.phase !== 'action') return;
        setSpriteFrame(actionSprite, action.frames[index]);
        const target = startedAt + (index + 1) * frameMs;
        actionTimer = setTimeout(() => {
          if (token !== state.actionToken || state.phase !== 'action') return;
          if (index === action.frames.length - 1) {
            setSpriteFrame(actionSprite, ACTION_TAIL);
            actionTimer = setTimeout(() => finishAction(token, false), ACTION_TAIL_MS);
          } else advance(index + 1);
        }, Math.max(0, target - performance.now()));
      };
      advance(0);
    };
    const scheduleIdleLines = () => {
      clearTimeout(idleLineTimer);
      const check = () => {
        const quietFor = Date.now() - state.lastUserAt;
        if (document.visibilityState === 'visible' && state.phase !== 'action' && quietFor >= 22000) say(pickLine('idle', IDLE_LINES), 3600);
        idleLineTimer = setTimeout(check, 42000 + Math.random() * 16000);
      };
      idleLineTimer = setTimeout(check, 26000 + Math.random() * 9000);
    };
    const scheduleAway = () => {
      clearTimeout(awayTimer);
      const check = () => {
        const quietFor = Date.now() - state.lastUserAt;
        const canAnnounce = Date.now() - state.lastAwayNoticeAt >= AWAY_NOTICE_COOLDOWN_MS;
        if (document.visibilityState === 'visible' && state.phase !== 'action' && quietFor >= LONG_IDLE_MS && canAnnounce) {
          state.lastAwayNoticeAt = Date.now();
          say(pickLine('away', AWAY_LINES), 4400);
        }
        awayTimer = setTimeout(check, 45000 + Math.random() * 18000);
      };
      awayTimer = setTimeout(check, 62000 + Math.random() * 18000);
    };
    const restartIdleAndNotices = () => { runIdle(); scheduleIdleLines(); scheduleAway(); };
    const activate = (event) => {
      // 1. 核心要求：每一次点击立即结束上一次的语音、打字机和气泡倒计时
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

      // 2. 核心要求：开启下一次的动作动画
      playAction(actionKey);

      // 3. 核心要求：开启下一次的字以及字所对应的语音
      let voiceEntry = null;
      let line = null;

      // 检查里程碑宣传触发 (如第 5, 10, 20, 50, 100 次点击)
      if (promoConfig && Array.isArray(promoConfig.triggerMilestones) && promoConfig.triggerMilestones.includes(count)) {
        const pEntries = promoConfig.entries || [];
        voiceEntry = pEntries[Math.floor(Math.random() * pEntries.length)] || null;
        if (voiceEntry) line = getEntryLine(voiceEntry);
      }

      // 常规动作匹配可用语音条目（不再被冷却拦截，点击即发声）
      if (!voiceEntry) {
        voiceEntry = pickVoiceAsset(actionKey);
        if (voiceEntry) line = getEntryLine(voiceEntry);
      }

      if (!line) line = selectInteractionLine(clickType);

      // 4. 播放该语音，并将 audio 对象传给 say，使“字出现时间至少和语音时间一样长”
      let audioInstance = null;
      if (voiceEntry && !muted) {
        audioInstance = playVoice(voiceEntry, line);
      } else if (!voiceEntry && !muted) {
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
        showIdle(RELAX_FRAMES[0]);
      } else {
        state.idleIndex = 0;
        showIdle(RELAX_FRAMES[0]);
        restartIdleAndNotices();
      }
    });
    window.addEventListener('pagehide', stopAudio);
    const onMotionPreferenceChange = () => {
      stopIdle();
      clearActionTimer();
      clearSpeechTimers();
      clearBurstParticles();
      bubble.classList.remove('show');
      stopAudio();
      state.actionToken += 1;
      state.phase = 'idle';
      state.actionKey = null;
      state.idleIndex = 0;
      showIdle(RELAX_FRAMES[0]);
      restartIdleAndNotices();
    };
    if (typeof REDUCED_MOTION.addEventListener === 'function') REDUCED_MOTION.addEventListener('change', onMotionPreferenceChange);
    else if (typeof REDUCED_MOTION.addListener === 'function') REDUCED_MOTION.addListener(onMotionPreferenceChange);
    syncSoundButton();
    showIdle(REDUCED_MOTION.matches ? RELAX_FRAMES[0] : STATIC_IDLE_FRAME);
    restartIdleAndNotices();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
