# 阿米娅小组件素材来源

本目录中的连续动画帧来自同一份 Ark-Models `models/002_amiya` Spine 模型。角色、美术资源及相关权利归上海鹰角网络科技有限公司 / Hypergryph 所有；本个人主页仅作非商业学习与粉丝向展示，不把这些文件视为可自由再授权素材。若权利方认为不妥，相关文件将被移除。

## 连续 Spine 帧

模型来源为固定提交 [`3745e5c6e10b5252b2a5e1f1841ebef62b7ef15b`](https://github.com/isHarryh/Ark-Models/tree/3745e5c6e10b5252b2a5e1f1841ebef62b7ef15b/models/002_amiya)，文件为 `build_char_002_amiya.skel`、`build_char_002_amiya.atlas` 和 `build_char_002_amiya.png`。运行时版本为 Spine 3.8；帧由 PixiJS Spine 3.8 runtime 配合 `@napi-rs/canvas` 直接渲染。

所有连续帧均使用以下固定参数：

- 画布：`314×460`，透明 RGBA，未合并背景。
- fit：`scale=0.8382821411128282`、`visualCenterX=-59.104738641968424`、`visualBottomY=11.135570861539804`。
- fit 测量范围：`Relax`、`Interact`、`Move` 三条原始时间轴；`Move` 的两个序列只改变时间轴起始相位。
- 渲染内边距：`PADDING_X=14`、`PADDING_Y=10`。
- 坐标映射：`x = point.x * scale + 157 - visualCenterX * scale`；`y = point.y * scale + 460 - 10 - visualBottomY * scale`。
- 不逐帧自动裁切、缩放、平移、旋转；页面 CSS 不参与角色动作变形。

| PNG 文件 | 原始 Spine 动画 | 时间轴采样与播放顺序 |
| --- | --- | --- |
| `amiya_relax_01.png` … `amiya_relax_20.png` | `Relax`，`1.0 s` | `t = 0, 0.05, …, 0.95 s`；`01 → … → 20 → 01` |
| `amiya_interact_01.png` … `amiya_interact_20.png` | `Interact`，`1.0 s` | `t = 0, 0.05, …, 0.95 s`；`01 → … → 20 → relax_01` |
| `amiya_interact_step_a_01.png` … `amiya_interact_step_a_20.png` | `Move`，`1.1333333253860474 s` | `t = 0 + i × duration/20`；`01 → … → 20 → relax_01` |
| `amiya_interact_step_b_01.png` … `amiya_interact_step_b_20.png` | `Move`，`1.1333333253860474 s` | `t = (0.5 × duration + i × duration/20) mod duration`；`01 → … → 20 → relax_01` |

其中 `i=0…19`。`interact_step_a` 与 `interact_step_b` 是同一 `Move` 时间轴的两个真实相位，分别让不同脚先行，产生不同的脚步和重心顺序；不是复制、镜像、CSS 位移或 AI 生成动作。每段播放的最后一个 `relax_01` 使用上述同一张 Relax 帧，页面完成 action 后再切回 idle `img`。

本模型还包含 `Sit` 与 `Sleep` 动画，但没有作为点击序列提交：在共享 fit 下 `Sit` 的可见底部比站立 `Relax` 低约 75px，直接接回站立姿态会产生地面跳变；`Sleep` 为横躺姿态，也没有同一条原始时间轴提供回到站立 Relax 的连续恢复段。保留它们会违反本组件的固定原点和自然回落要求。

## 旧单帧素材的隔离用途

| PNG 文件 | 来源 | 当前用途与隔离原因 |
| --- | --- | --- |
| `amiya_idle.png` | PRTS Wiki 干员模型在线查看器导出：<https://prts.wiki> | 仅作为首次加载静态展示；不进入正常 `Relax` 序列。首次占位结束后（包括 reduced-motion 待机）统一使用 Spine `amiya_relax_01.png`。它与新 Spine 导出不是同一渲染管线和 fit，无法无缝衔接。 |
| `amiya_hi.png` | PRTS Wiki 干员模型在线查看器导出：<https://prts.wiki> | 仅用于 `prefers-reduced-motion` 下的单帧互动反馈；不进入正常 `Interact` 或 `Move` 序列。 |
| `amiya_idle_02.png` … `amiya_idle_05.png` | 历史记录指向 Ark-Models `002_amiya`：[`3745e5c6e10b5252b2a5e1f1841ebef62b7ef15b`](https://github.com/isHarryh/Ark-Models/tree/3745e5c6e10b5252b2a5e1f1841ebef62b7ef15b/models/002_amiya) | 历史素材保留但不使用；其构图、锚点和采样密度与当前统一 fit 不一致。 |
| `amiya_action_01.png` … `amiya_action_04.png` | 历史记录指向 Ark-Models `002_amiya`：[`3745e5c6e10b5252b2a5e1f1841ebef62b7ef15b`](https://github.com/isHarryh/Ark-Models/tree/3745e5c6e10b5252b2a5e1f1841ebef62b7ef15b/models/002_amiya) | 历史素材保留但不使用；采样稀疏，不能插入当前连续时间轴。 |

`amiya_idle.png` 和 `amiya_hi.png` 的角色版权仍归 Hypergryph；PRTS Wiki 的社区查看器导出不构成独立的角色美术再授权。它们的保留仅为兼容首次加载静态占位，以及 `amiya_hi.png` 在 reduced-motion 下的单帧反馈；reduced-motion 待机仍使用 Spine `relax_01`，旧图不进入正常连续动画。

## 语音与占位音效

当前没有已核实、可合法随仓库再分发的阿米娅官方原声或正规二创音频，因此没有下载或提交商业语音包。`assets/mascot/voice/` 保留为可插拔入口；当前目录只有说明文件和空的 `catalog.js`，**没有实际语音文件**。

“非商业粉丝展示 / 二创宣传”的使用意图本身，不自动等于官方原声或他人二创音频的仓库再分发许可；后续仍以具体来源写明允许再分发的许可，或作者对本仓库的明确同意为准。

| 音频文件 | 来源 | 授权状态 | 许可范围 | 替换方式 |
| --- | --- | --- | --- | --- |
| 无 | 尚未收到具体音频或可核验的再分发来源 | 不适用；当前没有音频授权可登记 | 无音频进入仓库；运行时使用 WebAudio 占位音效 | 获得逐文件授权后，将文件放入本目录，在 `catalog.js` 中登记完整台词与匹配条件，并同步补充本表；更换或撤销授权时删除文件、移除登记并更新本记录 |

`js/main.js` 支持在脚本加载前注入 `window.ARK_MASCOT_VOICE_ASSETS`，每个条目可包含 `id`、`src`、`types`、`lines`、`comboMin`、`comboMax`、`weight` 和 `volume`，且 `src` 必须指向本地 `assets/mascot/voice/`。其中 `lines` 可列出该音频对应的完整台词文本，用于避开最近播放过的台词。例如：

```js
window.ARK_MASCOT_VOICE_ASSETS = {
  interact_wave: [{
    id: 'amiya-wave-01',
    src: 'assets/mascot/voice/amiya-wave-01.ogg',
    types: ['single', 'away'],
    lines: ['嗯，我在。有什么任务尽管交给我吧。'],
    weight: 1,
    volume: 0.72
  }]
};
```

上面的 `.ogg` 仅是接口示例，不是当前仓库中的文件。实际登记时，四个页面通过 `assets/mascot/voice/catalog.js` 在 `js/main.js` 前注册清单；不需要修改运行时逻辑。

接口会按动作、点击类型、连击次数、全局语音冷却（900ms）和最近播放台词选择音频；同一时刻只有一个 `Audio` 通道，新动作会停止旧音频。浏览器拒绝播放、媒体加载失败或没有本地条目时，系统保留现有台词文本，并使用按动作和点击类型变化的 WebAudio 短音作为占位回退。占位音效不是真实语音，也不代表任何授权素材。

## AI 与核验记录

- 本次所有连续帧均直接采样原始 Spine 3.8 时间轴；没有使用 AI 文生图、AI 重绘或 AI 插值。
- `interact_step_b` 只是同一 `Move` 时间轴的相位采样，所有 PNG 仍是原始模型真实渲染。
- 已生成并人工查看 contact sheet；contact sheet、调试截图和临时渲染脚本均不提交到仓库。
- 所有新 PNG 应为 `314×460`、RGBA、透明画布；正常动作只在两个稳定 `img` 节点之间互斥切换。
- 仍存在的风险：上游 Ark-Models 与 PRTS 社区来源不等于 Hypergryph 的独立再分发授权；本仓库只作个人非商业展示，权利方要求时应移除相关素材。
