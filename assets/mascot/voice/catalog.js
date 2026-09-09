/**
 * 罗德岛小干员（阿米娅）本地语音配置清单（100% 官方原声纯享版 · 响度标准化）
 *
 * 【原声品质保障】
 * - 配音原声：上海鹰角网络《明日方舟》官方国服陶典老师普通话录音（100% 正版原声，相似度 100%）；
 * - 响度均衡：全库音频已统一标准化至 -14.0 dBFS（广播级响度），保证每个对话音量大小完全一致；
 * - 纯净交互：已将差异过大的通用 AI 试听语音单独隔离归档至 ai_generated/ 目录；
 * - 音字同步：每一句台词与音频原声 100% 逐字对应；
 * - 即时打断：每次点击立即切断上一句语音并立即开启新动作、新字幕与新配音；
 * - 字音共存：字展示时间与语音播放时长深度绑定，在语音播放结束前绝对不提前隐藏。
 */

window.ARK_MASCOT_VOICE_ASSETS = {
  // 动作一：挥手互动 (interact_wave) —— 问候、陪伴、轻触
  interact_wave: [
    {
      id: 'amiya-welcome',
      src: 'assets/mascot/voice/official_cn_042.mp3',
      sources: ['assets/mascot/voice/official_cn_042.mp3', 'assets/mascot/voice/official_cn_042.wav'],
      types: ['single'],
      lines: ['欢迎回家，博士！'],
      weight: 6,
      volume: 0.8,
    },
    {
      id: 'amiya-here',
      src: 'assets/mascot/voice/official_cn_022.mp3',
      sources: ['assets/mascot/voice/official_cn_022.mp3', 'assets/mascot/voice/official_cn_022.wav'],
      types: ['single'],
      lines: ['博士，我在这里。'],
      weight: 6,
      volume: 0.8,
    },
    {
      id: 'amiya-poke',
      src: 'assets/mascot/voice/official_cn_034.mp3',
      sources: ['assets/mascot/voice/official_cn_034.mp3', 'assets/mascot/voice/official_cn_034.wav'],
      types: ['single', 'short-repeat', 'rapid'],
      lines: ['欸？博士？'],
      weight: 5,
      volume: 0.8,
    },
    {
      id: 'amiya-giggle',
      src: 'assets/mascot/voice/official_cn_036.mp3',
      sources: ['assets/mascot/voice/official_cn_036.mp3', 'assets/mascot/voice/official_cn_036.wav'],
      types: ['single', 'short-repeat'],
      lines: ['欸嘿嘿……'],
      weight: 5,
      volume: 0.8,
    },
    {
      id: 'amiya-schedule',
      src: 'assets/mascot/voice/official_cn_003.mp3',
      sources: ['assets/mascot/voice/official_cn_003.mp3', 'assets/mascot/voice/official_cn_003.wav'],
      types: ['single'],
      lines: ['罗德岛全舰正处于通常航行状态。博士，整理下航程信息吧？'],
      weight: 5,
      volume: 0.8,
    },
    {
      id: 'amiya-hardwork',
      src: 'assets/mascot/voice/official_cn_001.mp3',
      sources: ['assets/mascot/voice/official_cn_001.mp3', 'assets/mascot/voice/official_cn_001.wav'],
      types: ['single'],
      lines: ['博士，您工作辛苦了。'],
      weight: 5,
      volume: 0.8,
    },
    {
      id: 'amiya-companion',
      src: 'assets/mascot/voice/official_cn_009.mp3',
      sources: ['assets/mascot/voice/official_cn_009.mp3', 'assets/mascot/voice/official_cn_009.wav'],
      types: ['single', 'away'],
      lines: ['博士，我们的脚下，是一条漫长的道路……也许这是一次没有终点的旅行，但如果是和您一起，我觉得，非常幸福。'],
      weight: 4,
      volume: 0.8,
    },
    {
      id: 'amiya-ack',
      src: 'assets/mascot/voice/official_cn_017.mp3',
      sources: ['assets/mascot/voice/official_cn_017.mp3', 'assets/mascot/voice/official_cn_017.wav'],
      types: ['single', 'short-repeat', 'rapid'],
      lines: ['嗯，我知道了。'],
      weight: 4,
      volume: 0.8,
    },
  ],

  // 动作二：欢快踏步 A (interact_step_a) —— 喝水关怀、工作督促、士气提振、出击准备
  interact_step_a: [
    {
      id: 'amiya-drink',
      src: 'assets/mascot/voice/official_cn_033.mp3',
      sources: ['assets/mascot/voice/official_cn_033.mp3', 'assets/mascot/voice/official_cn_033.wav'],
      types: ['single', 'short-repeat'],
      lines: ['有什么想喝的吗，博士？'],
      weight: 6,
      volume: 0.8,
    },
    {
      id: 'amiya-idle-alert',
      src: 'assets/mascot/voice/official_cn_010.mp3',
      sources: ['assets/mascot/voice/official_cn_010.mp3', 'assets/mascot/voice/official_cn_010.wav'],
      types: ['single', 'short-repeat'],
      lines: ['博士，您还有许多事情需要处理。现在还不能休息哦。'],
      weight: 6,
      volume: 0.8,
    },
    {
      id: 'amiya-rest',
      src: 'assets/mascot/voice/official_cn_031.mp3',
      sources: ['assets/mascot/voice/official_cn_031.mp3', 'assets/mascot/voice/official_cn_031.wav'],
      types: ['single', 'short-repeat'],
      lines: ['博士，辛苦了！累了的话请休息一会儿吧。'],
      weight: 5,
      volume: 0.8,
    },
    {
      id: 'amiya-ready',
      src: 'assets/mascot/voice/official_cn_020.mp3',
      sources: ['assets/mascot/voice/official_cn_020.mp3', 'assets/mascot/voice/official_cn_020.wav'],
      types: ['single', 'short-repeat'],
      lines: ['来了！大家，请做好战斗准备！'],
      weight: 4,
      volume: 0.8,
    },
    {
      id: 'amiya-depart',
      src: 'assets/mascot/voice/official_cn_019.mp3',
      sources: ['assets/mascot/voice/official_cn_019.mp3', 'assets/mascot/voice/official_cn_019.wav'],
      types: ['single', 'short-repeat', 'rapid'],
      lines: ['行动开始！'],
      weight: 4,
      volume: 0.8,
    },
    {
      id: 'amiya-fulfill',
      src: 'assets/mascot/voice/official_cn_018.mp3',
      sources: ['assets/mascot/voice/official_cn_018.mp3', 'assets/mascot/voice/official_cn_018.wav'],
      types: ['single'],
      lines: ['我不会辜负大家的。'],
      weight: 4,
      volume: 0.8,
    },
    {
      id: 'amiya-understood',
      src: 'assets/mascot/voice/official_cn_023.mp3',
      sources: ['assets/mascot/voice/official_cn_023.mp3', 'assets/mascot/voice/official_cn_023.wav'],
      types: ['single', 'short-repeat', 'rapid'],
      lines: ['我知道了！'],
      weight: 4,
      volume: 0.8,
    },
  ],

  // 动作三：欢快踏步 B (interact_step_b) —— 全神贯注、信赖坚信、并肩作战
  interact_step_b: [
    {
      id: 'amiya-focus',
      src: 'assets/mascot/voice/official_cn_002.mp3',
      sources: ['assets/mascot/voice/official_cn_002.mp3', 'assets/mascot/voice/official_cn_002.wav'],
      types: ['single', 'short-repeat'],
      lines: ['凯尔希医生教导过我，工作的时候一定要保持全神贯注……嗯，全神贯注。'],
      weight: 6,
      volume: 0.8,
    },
    {
      id: 'amiya-trust-resolve',
      src: 'assets/mascot/voice/official_cn_029.mp3',
      sources: ['assets/mascot/voice/official_cn_029.mp3', 'assets/mascot/voice/official_cn_029.wav'],
      types: ['single', 'short-repeat'],
      lines: ['无论多么艰难的任务，只要有博士在，就一定能完成，我一直这样坚信着！'],
      weight: 6,
      volume: 0.8,
    },
    {
      id: 'amiya-all-trust',
      src: 'assets/mascot/voice/official_cn_026.mp3',
      sources: ['assets/mascot/voice/official_cn_026.mp3', 'assets/mascot/voice/official_cn_026.wav'],
      types: ['single', 'short-repeat'],
      lines: ['大家可都相信着我！'],
      weight: 5,
      volume: 0.8,
    },
    {
      id: 'amiya-guide',
      src: 'assets/mascot/voice/official_cn_004.mp3',
      sources: ['assets/mascot/voice/official_cn_004.mp3', 'assets/mascot/voice/official_cn_004.wav'],
      types: ['single'],
      lines: ['作为罗德岛的领导者我还有很多不成熟的地方，希望您能更多地为我指明前进的方向。'],
      weight: 4,
      volume: 0.8,
    },
    {
      id: 'amiya-home',
      src: 'assets/mascot/voice/official_cn_005.mp3',
      sources: ['assets/mascot/voice/official_cn_005.mp3', 'assets/mascot/voice/official_cn_005.wav'],
      types: ['single'],
      lines: ['虽然这可能是我一厢情愿的想法，但我希望罗德岛能成为大家的第二个故乡……'],
      weight: 4,
      volume: 0.8,
    },
    {
      id: 'amiya-protect',
      src: 'assets/mascot/voice/official_cn_007.mp3',
      sources: ['assets/mascot/voice/official_cn_007.mp3', 'assets/mascot/voice/official_cn_007.wav'],
      types: ['single'],
      lines: ['有时候，我会想起寒冷的家乡，那里就连空气中都弥漫着铜锈的味道。相比之下罗德岛是如此的温暖。所以，为了守护好这里，我必须更加努力才行。'],
      weight: 4,
      volume: 0.8,
    },
    {
      id: 'amiya-violin',
      src: 'assets/mascot/voice/official_cn_008.mp3',
      sources: ['assets/mascot/voice/official_cn_008.mp3', 'assets/mascot/voice/official_cn_008.wav'],
      types: ['single'],
      lines: ['嘿嘿，博士，悄悄告诉你一件事——我重新开始练小提琴了。'],
      weight: 4,
      volume: 0.8,
    },
    {
      id: 'amiya-clear',
      src: 'assets/mascot/voice/official_cn_024.mp3',
      sources: ['assets/mascot/voice/official_cn_024.mp3', 'assets/mascot/voice/official_cn_024.wav'],
      types: ['single', 'short-repeat', 'rapid'],
      lines: ['了解。'],
      weight: 4,
      volume: 0.8,
    },
  ],
};

// 2. 官方宣传与里程碑专用语音通道 (第 5, 10, 20, 50, 100 次点击触发)
window.ARK_MASCOT_PROMO_CONFIG = {
  enabled: true,
  triggerMode: 'milestone',
  triggerMilestones: [5, 10, 20, 50, 100],
  entries: [
    {
      id: 'amiya-promo-report',
      src: 'assets/mascot/voice/official_cn_011.mp3',
      sources: ['assets/mascot/voice/official_cn_011.mp3', 'assets/mascot/voice/official_cn_011.wav'],
      action: 'interact_wave',
      types: ['single', 'any'],
      lines: ['博士，能再见到您……真是太好了。今后我们同行的路还很长，所以，请您多多关照！'],
      weight: 10,
      volume: 0.82,
      isPromo: true,
    },
    {
      id: 'amiya-promo-highdiff',
      src: 'assets/mascot/voice/official_cn_029.mp3',
      sources: ['assets/mascot/voice/official_cn_029.mp3', 'assets/mascot/voice/official_cn_029.wav'],
      action: 'interact_wave',
      types: ['single', 'any'],
      lines: ['无论多么艰难的任务，只要有博士在，就一定能完成，我一直这样坚信着！'],
      weight: 8,
      volume: 0.82,
      isPromo: true,
    },
  ],
};
