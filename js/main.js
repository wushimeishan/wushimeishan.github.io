document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());const toggle=document.querySelector('.menu-toggle');const nav=document.querySelector('.site-nav');if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',open)});nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>nav.classList.remove('open')))}});

/* ============== 明日方舟 Q版小干员（全站悬浮 · 点击互动） ============== */
(()=>{
  const ASSET = 'assets/mascot/';
  // These are evenly-spaced samples from fixed-fit Spine timelines; the final
  // action entry is the shared Relax start frame used as a visual transition.
  const IDLE_FRAMES = Array.from({length:12},(_,index)=>`amiya_relax_${String(index+1).padStart(2,'0')}.png`);
  const INTERACT_FRAMES = Array.from({length:12},(_,index)=>`amiya_interact_${String(index+1).padStart(2,'0')}.png`);
  const ACTION_FRAMES = [...INTERACT_FRAMES, 'amiya_relax_01.png'];
  const STATIC_IDLE_FRAME = 'amiya_idle.png';
  const STATIC_ACTION_FRAME = 'amiya_hi.png';
  const IDLE_FRAME_MS = 84;
  const ACTION_FRAME_MS = 84;
  const MASCOT_HTML = '<img class="ark-sprite ark-sprite-idle" src="assets/mascot/amiya_idle.png" alt="阿米娅Q版小人" draggable="false"><img class="ark-sprite ark-sprite-hi" src="assets/mascot/amiya_hi.png" alt="" draggable="false" aria-hidden="true">';

  const CLICK_LINES = [
    '博士，欢迎回来。今天的行程我已经整理好了。','嗯，我在。有什么任务尽管交给我吧。','请放心，罗德岛会一直陪在博士身边。','博士的指挥很可靠，我也要再认真一点。','工作告一段落的话，记得喝一口水哦。','这次行动的资料，我再核对一遍。','今天也一起把该完成的事做好吧。','理智恢复得差不多了，要不要稍微休息一下？','博士，需要我为您准备行动方案吗？','虽然会紧张……但我会努力跟上博士。','甲板上的风很舒服，忙完可以去走走。','我相信博士的判断，也相信大家。','别把所有事都一个人扛着，可以叫上我。','今天的罗德岛也很平稳，真是太好了。','资料已经分类完成，随时可以查看。','博士，眼睛累了就看远处一会儿吧。','我会把每一次托付都认真记下来。','就算是小小的一步，也是在向前走。','那、那个……被博士点到名，我很高兴。','请把接下来的任务也交给我吧。','大家都在努力，博士也别太勉强自己。','今天的目标，和博士一起完成。','报告：小队状态良好，可以随时出发。','博士的到来，让这里安心了很多。'
  ];
  const IDLE_LINES = [
    '博士……还在忙吗？我会在这里等您。','不用急，先把手边这一项完成就好。','窗外天色变了，博士要不要稍微休息？','我刚整理完几份报告，感觉很充实。','安静的时候，罗德岛的引擎声也很好听。','博士，肩膀放松一点……这样会舒服些。','等您有空，我们一起确认明天的计划吧。','我在练习更清楚地传达想法，希望有进步。','大家平安地回来，就是最好的结果。','要是累了，停下来看看风景也没关系。','今天的空气很清新，适合深呼吸一下。','博士不说话也没关系，我会陪着您的。','偶尔放慢一点，之后才能走得更远。','我想把每一天都过得更认真一些。'
  ];
  const RAPID_LINES = [
    '啊……博士，慢一点，我会跟不上啦！','这么着急，是有紧急任务吗？','我、我收到了！请让我先深呼吸一下。','博士的手速真厉害……不过也请休息。','连续确认这么多次，我可不会漏掉哦。','别急别急，我们一项一项来。','我在听，博士不用担心。','再快一点的话……我就要转圈啦！','博士好有精神，我也不能输。','这么频繁地叫我，是不是想聊天？'
  ];
  const AWAY_LINES = [
    '博士，好久没有互动了。现在还顺利吗？','我留了一盏小灯，回来时不会找不到路。','报告先放在这里，等博士方便时再看。','大家都很安静，我想博士大概在专心工作。','别忘了补充水分，我会替您记着的。','时间过去一会儿了，眼睛需要休息吗？','我还在这里。博士回来时叫我就好。','如果遇到难题，不必急着一个人解决。','今天也辛苦了，哪怕只完成一点点。'
  ];
  const END_LINES = ['动作汇报完毕。接下来继续待命！','呼……完成了。博士，下一个安排是什么？','我回到岗位啦，随时可以再叫我。','这样就好。谢谢博士陪我练习。','嗯，状态稳定。让我们继续努力吧。','小小的互动也结束了，我会继续守在这里。','报告完成，阿米娅继续待命。'];
  const MILESTONES = {5:'已经互动 5 次了……博士今天很有精神呢。',10:'第 10 次确认！博士的专注让我也更有干劲。',20:'20 次了。谢谢博士一直愿意回应我。',50:'第 50 次互动：这份信赖，我会好好珍惜。',100:'100 次！博士，我们已经很有默契了吧？',200:'200 次互动达成。罗德岛的记录里会写下这一页。'};
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');

  function init(){
    if(document.getElementById('ark-mascot')) return;
    const root = document.createElement('aside');
    root.id = 'ark-mascot'; root.className = 'ark-mascot'; root.setAttribute('aria-label','罗德岛小干员');
    root.innerHTML = '<div class="ark-bubble" id="ark-bubble" role="status" aria-live="polite"></div><div class="ark-bob"><div class="ark-stage" id="ark-stage" role="button" tabindex="0" aria-label="与阿米娅互动">' + MASCOT_HTML + '</div></div><div class="ark-tag">RHODES ISLAND</div><button class="ark-sound" id="ark-sound" type="button" aria-label="开关点击音效" title="开关音效">♪</button>';
    document.body.appendChild(root);

    const stage = root.querySelector('#ark-stage');
    const bubble = root.querySelector('#ark-bubble');
    const idleSprite = root.querySelector('.ark-sprite-idle');
    const actionSprite = root.querySelector('.ark-sprite-hi');
    const soundBtn = root.querySelector('#ark-sound');
    [...new Set([STATIC_IDLE_FRAME,STATIC_ACTION_FRAME,...IDLE_FRAMES,...ACTION_FRAMES])].forEach(frame=>{const image=new Image();image.src=ASSET+frame});

    let count = Number(localStorage.getItem('ark_pokes') || 0), muted = localStorage.getItem('ark_muted') === '1';
    let typeTimer = null, hideTimer = null, idleFrameTimer = null, idleLineTimer = null, awayTimer = null, frameTimer = null, finishTimer = null, actx = null;
    let lastInteractionAt = Date.now(), rapidClicks = 0, idleIndex = 0, introPending = !REDUCED_MOTION.matches;
    const lineHistory = {click:[],idle:[],rapid:[],away:[],end:[],milestone:[]};
    const clearActionTimers = ()=>{clearTimeout(frameTimer);clearTimeout(finishTimer);frameTimer=null;finishTimer=null};
    const clearSpeechTimers = ()=>{clearInterval(typeTimer);clearTimeout(hideTimer);typeTimer=null;hideTimer=null};
    const stopIdle = ()=>{clearTimeout(idleFrameTimer);idleFrameTimer=null};
    const remember = (kind,value)=>{const history=lineHistory[kind]||(lineHistory[kind]=[]);history.push(value);if(history.length>5)history.shift();return value};
    const pickLine = (kind,lines)=>{const candidates=lines.filter(line=>!(lineHistory[kind]||[]).includes(line));return remember(kind,(candidates.length?candidates:lines).sort(()=>Math.random()-.5)[0])};
    const setSpriteFrame = (sprite,frame)=>{if(sprite.dataset.frame===frame)return;sprite.dataset.frame=frame;sprite.src=ASSET+frame};
    const showIdle = (staticFrame=false)=>{stage.classList.remove('is-action');setSpriteFrame(idleSprite,staticFrame?STATIC_IDLE_FRAME:IDLE_FRAMES[idleIndex])};
    const runIdle = ()=>{
      stopIdle();
      if(REDUCED_MOTION.matches||document.hidden||stage.classList.contains('is-action'))return;
      const start=()=>{if(document.hidden||stage.classList.contains('is-action'))return;idleIndex=0;showIdle();idleFrameTimer=setTimeout(loop,IDLE_FRAME_MS)};
      const loop=()=>{if(document.hidden||stage.classList.contains('is-action'))return;idleIndex=(idleIndex+1)%IDLE_FRAMES.length;showIdle();idleFrameTimer=setTimeout(loop,IDLE_FRAME_MS)};
      if(introPending){introPending=false;showIdle(true);idleFrameTimer=setTimeout(start,420)}else start();
    };
    const say = (text,hold=3800)=>{
      clearSpeechTimers(); bubble.classList.add('show'); bubble.textContent=''; let index=0;
      const caret=document.createElement('span');caret.className='ark-caret';caret.textContent='_';
      typeTimer=setInterval(()=>{bubble.textContent=text.slice(0,++index);if(index<text.length)return;clearInterval(typeTimer);typeTimer=null;bubble.appendChild(caret);hideTimer=setTimeout(()=>bubble.classList.remove('show'),hold)},REDUCED_MOTION.matches?1:28);
    };
    const syncSoundBtn=()=>{soundBtn.textContent=muted?'♪̸':'♪';soundBtn.classList.toggle('is-off',muted)};
    const selectInteractionLine = elapsed=>{if(MILESTONES[count])return remember('milestone',MILESTONES[count]);if(elapsed<800||rapidClicks>=3)return pickLine('rapid',RAPID_LINES);return pickLine('click',CLICK_LINES)};
    function burst(x,y){const colors=['#2fc4d6','#7de8f0','#f4f1f7','#ffd98a'];for(let index=0;index<9;index++){const particle=document.createElement('i'),color=colors[index%colors.length];particle.className='ark-particle';particle.style.left=x+'px';particle.style.top=y+'px';particle.style.background=color;particle.style.boxShadow='0 0 8px '+color;particle.style.setProperty('--dx',((Math.random()-.5)*150)+'px');particle.style.setProperty('--dy',(-36-Math.random()*78)+'px');document.body.appendChild(particle);setTimeout(()=>particle.remove(),740)}}
    function blip(){if(muted)return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;actx=actx||new AC();if(actx.state==='suspended')actx.resume();const time=actx.currentTime,base=500+Math.random()*240;[[base,'triangle',.05,.16],[base*2,'square',.012,.1]].forEach(([frequency,type,volume,duration])=>{const oscillator=actx.createOscillator(),gain=actx.createGain();oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,time);oscillator.frequency.exponentialRampToValueAtTime(frequency*1.5,time+duration);gain.gain.setValueAtTime(volume,time);gain.gain.exponentialRampToValueAtTime(.0001,time+duration);oscillator.connect(gain);gain.connect(actx.destination);oscillator.start(time);oscillator.stop(time+duration+.03)})}catch(error){/* 音频不可用时保持静默。 */}}
    const finishAction = ()=>{stage.classList.remove('is-action');idleIndex=0;showIdle(REDUCED_MOTION.matches);runIdle();if(!document.hidden)say(pickLine('end',END_LINES),2600)};
    const playAction = ()=>{
      stopIdle();clearActionTimers();stage.classList.remove('is-action');stage.classList.add('is-action');
      if(REDUCED_MOTION.matches){setSpriteFrame(actionSprite,STATIC_ACTION_FRAME);finishTimer=setTimeout(finishAction,160);return}
      let index=0;
      const advance=()=>{setSpriteFrame(actionSprite,ACTION_FRAMES[index]);if(index>=ACTION_FRAMES.length-1){finishTimer=setTimeout(finishAction,130);return}index+=1;frameTimer=setTimeout(advance,ACTION_FRAME_MS)};
      advance();
    };
    const scheduleIdleLines = ()=>{
      clearTimeout(idleLineTimer);
      const check=()=>{const quietFor=Date.now()-lastInteractionAt;if(document.visibilityState==='visible'&&!stage.classList.contains('is-action')&&quietFor>=22000)say(pickLine('idle',IDLE_LINES),3600);idleLineTimer=setTimeout(check,42000+Math.random()*16000)};
      idleLineTimer=setTimeout(check,26000+Math.random()*9000);
    };
    const scheduleAway = ()=>{
      clearTimeout(awayTimer);
      const check=()=>{const quietFor=Date.now()-lastInteractionAt;if(document.visibilityState==='visible'&&!stage.classList.contains('is-action')&&quietFor>=62000){say(pickLine('away',AWAY_LINES),4400);lastInteractionAt=Date.now();scheduleIdleLines()}awayTimer=setTimeout(check,45000+Math.random()*18000)};
      awayTimer=setTimeout(check,62000+Math.random()*18000);
    };
    const restartIdleAndAway=()=>{runIdle();scheduleIdleLines();scheduleAway()};
    const activate=event=>{
      const now=Date.now(),elapsed=now-lastInteractionAt;rapidClicks=elapsed<850?rapidClicks+1:1;lastInteractionAt=now;count+=1;localStorage.setItem('ark_pokes',count);
      const rect=stage.getBoundingClientRect(),x=Number.isFinite(event?.clientX)&&event.clientX?event.clientX:rect.left+rect.width/2,y=Number.isFinite(event?.clientY)&&event.clientY?event.clientY:rect.top+rect.height/2;
      burst(x,y);blip();say(selectInteractionLine(elapsed));playAction();scheduleAway();
    };
    stage.addEventListener('click',activate);
    stage.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();activate(event)}});
    soundBtn.addEventListener('click',event=>{event.stopPropagation();muted=!muted;localStorage.setItem('ark_muted',muted?'1':'0');syncSoundBtn();if(!muted){blip();say('音效已开启 ♪',1600)}else{clearSpeechTimers();bubble.classList.remove('show')}});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){stopIdle();clearActionTimers();clearSpeechTimers();clearTimeout(idleLineTimer);clearTimeout(awayTimer);stage.classList.remove('is-action');bubble.classList.remove('show')}else{idleIndex=0;showIdle();restartIdleAndAway()}});
    REDUCED_MOTION.addEventListener?.('change',()=>{clearActionTimers();idleIndex=0;showIdle(REDUCED_MOTION.matches);restartIdleAndAway()});
    syncSoundBtn();if(REDUCED_MOTION.matches)showIdle(true);restartIdleAndAway();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
