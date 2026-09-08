document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());const toggle=document.querySelector('.menu-toggle');const nav=document.querySelector('.site-nav');if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',open)});nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>nav.classList.remove('open')))}});

/* ============== 明日方舟 Q版小干员（全站悬浮 · 点击互动） ============== */
(()=>{
  const MASCOT_HTML = '<img class="ark-sprite ark-sprite-idle" src="assets/mascot/amiya_idle.png" alt="阿米娅Q版小人" draggable="false"><img class="ark-sprite ark-sprite-hi" src="assets/mascot/amiya_hi.png" alt="" draggable="false" aria-hidden="true">';

  const LINES = [
    '博士，欢迎回来！今天也要加油哦。',
    '理智已经回满啦，要不要来一把？',
    '基建的生产线好像又满了，记得收菜。',
    '公开招募遇到高资词条，一定要喊我！',
    '源石虽好，可不要贪多哦。',
    '行动开始！这一次一定能稳过。',
    '罗德岛号，随时可以启航。',
    '龙门币又不够用了……博士也是吗？',
    '剿灭作战就差一点点，别放弃！',
    '摸鱼被我抓到了哦，博士。',
    '信赖度 +1，今天也最喜欢博士了。',
    '代理指挥又翻车了？让我来帮你。',
    '记得把新干员拉去精二呀。',
    '博士，多喝热水，少熬夜。',
    '前方作战录像 +1，经验值安排上。',
    '叮——您的明日方舟能量已送达。'
  ];
  const IDLE_LINES = [
    '博士……还在忙吗？',
    'Zzz……啊！我、我没有睡着！',
    '要不要一起去甲板吹吹风？',
    '久坐记得站起来活动一下哦。',
    '盯着屏幕太久啦，让眼睛休息一下。'
  ];
  const MILESTONES = {
    5:'已经戳了 5 次了，博士很闲吗？',
    10:'10 连击！博士的手速可以去打剿灭了。',
    20:'20 次……博士是把我当抽卡按钮了吗？',
    50:'50 次戳击，获得成就「罗德岛闲者」。',
    100:'100 次！博士对我是真爱对吧，对吧？',
    200:'200 次了，这份信赖度早就满啦。'
  };
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];

  function init(){
    if(document.getElementById('ark-mascot')) return;
    const root = document.createElement('aside');
    root.id = 'ark-mascot';
    root.className = 'ark-mascot';
    root.setAttribute('aria-label','罗德岛小干员');
    root.innerHTML =
      '<div class="ark-bubble" id="ark-bubble" role="status" aria-live="polite"></div>' +
      '<div class="ark-bob"><div class="ark-stage" id="ark-stage" role="button" tabindex="0" aria-label="与阿米娅互动">' + MASCOT_HTML + '</div></div>' +
      '<div class="ark-tag">RHODES ISLAND</div>' +
      '<button class="ark-sound" id="ark-sound" type="button" aria-label="开关点击音效" title="开关音效">♪</button>';
    document.body.appendChild(root);

    const stage = root.querySelector('#ark-stage');
    const bubble = root.querySelector('#ark-bubble');
    const soundBtn = root.querySelector('#ark-sound');

    let count = Number(localStorage.getItem('ark_pokes')||0);
    let muted = localStorage.getItem('ark_muted')==='1';
    let typeTimer = null, hideTimer = null, idleTimer = null, actionTimer = null, actx = null;
    const syncSoundBtn = ()=>{ soundBtn.textContent = muted?'♪̸':'♪'; soundBtn.classList.toggle('is-off',muted); };
    syncSoundBtn();

    function say(text, hold=3800){
      clearInterval(typeTimer); clearTimeout(hideTimer);
      typeTimer = null; hideTimer = null;
      bubble.classList.add('show');
      bubble.textContent = '';
      let i = 0;
      const caret = document.createElement('span');
      caret.className = 'ark-caret'; caret.textContent = '_';
      typeTimer = setInterval(()=>{
        bubble.textContent = text.slice(0,++i);
        if(i>=text.length){
          clearInterval(typeTimer);
          typeTimer = null;
          bubble.appendChild(caret);
          hideTimer = setTimeout(()=>bubble.classList.remove('show'),hold);
        }
      },34);
    }
    function pickLine(){
      if(MILESTONES[count]) return MILESTONES[count];
      return pick(LINES);
    }
    function jump(){
      clearTimeout(actionTimer);
      stage.classList.remove('pop','is-action');
      void stage.offsetWidth;
      stage.classList.add('pop','is-action');
      actionTimer = setTimeout(()=>{
        stage.classList.remove('pop','is-action');
        actionTimer = null;
      },620);
    }
    function burst(x,y){
      const colors = ['#2fc4d6','#7de8f0','#f4f1f7','#ffd98a'];
      for(let i=0;i<9;i++){
        const p = document.createElement('i');
        p.className = 'ark-particle';
        const c = colors[i%colors.length];
        p.style.left = x+'px'; p.style.top = y+'px';
        p.style.background = c; p.style.boxShadow = '0 0 8px '+c;
        p.style.setProperty('--dx',((Math.random()-.5)*150)+'px');
        p.style.setProperty('--dy',(-36-Math.random()*78)+'px');
        document.body.appendChild(p);
        setTimeout(()=>p.remove(),740);
      }
    }
    function blip(){
      if(muted) return;
      try{
        const AC = window.AudioContext||window.webkitAudioContext;
        if(!AC) return;
        actx = actx||new AC();
        if(actx.state==='suspended') actx.resume();
        const t = actx.currentTime, base = 500+Math.random()*240;
        [[base,'triangle',.05,.16],[base*2,'square',.012,.1]].forEach(([f,type,vol,dur])=>{
          const o=actx.createOscillator(), g=actx.createGain();
          o.type=type;
          o.frequency.setValueAtTime(f,t);
          o.frequency.exponentialRampToValueAtTime(f*1.5,t+dur);
          g.gain.setValueAtTime(vol,t);
          g.gain.exponentialRampToValueAtTime(.0001,t+dur);
          o.connect(g); g.connect(actx.destination);
          o.start(t); o.stop(t+dur+.03);
        });
      }catch(e){/* 忽略音频异常 */}
    }
    function scheduleIdle(){
      clearTimeout(idleTimer);
      idleTimer = setTimeout(function loop(){
        if(document.visibilityState==='visible' && Math.random()<.75) say(pick(IDLE_LINES),3000);
        idleTimer = setTimeout(loop, 18000+Math.random()*10000);
      }, 20000+Math.random()*8000);
    }

    function activate(e){
      count++;
      localStorage.setItem('ark_pokes',count);
      jump();
      const rect = stage.getBoundingClientRect();
      const x = Number.isFinite(e?.clientX) && e.clientX ? e.clientX : rect.left + rect.width/2;
      const y = Number.isFinite(e?.clientY) && e.clientY ? e.clientY : rect.top + rect.height/2;
      burst(x,y);
      blip();
      say(pickLine());
      scheduleIdle();
    }
    stage.addEventListener('click',activate);
    stage.addEventListener('keydown',e=>{
      if(e.key==='Enter' || e.key===' '){
        e.preventDefault();
        activate(e);
      }
    });
    soundBtn.addEventListener('click',e=>{
      e.stopPropagation();
      muted = !muted;
      localStorage.setItem('ark_muted',muted?'1':'0');
      syncSoundBtn();
      if(!muted){ blip(); say('音效已开启 ♪',1600); }
      else {
        clearInterval(typeTimer); clearTimeout(hideTimer);
        typeTimer = null; hideTimer = null;
        bubble.classList.remove('show');
      }
    });
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden){
        clearInterval(typeTimer); clearTimeout(hideTimer); clearTimeout(actionTimer); clearTimeout(idleTimer);
        typeTimer = null; hideTimer = null; actionTimer = null; idleTimer = null;
        stage.classList.remove('pop','is-action');
        bubble.classList.remove('show');
      } else {
        scheduleIdle();
      }
    });
    scheduleIdle();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
