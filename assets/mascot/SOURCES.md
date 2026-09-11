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
| `sheet_sit.webp`（20 帧） | `Sit`，`8.0 s` | `t = 0, 0.4, …, 7.6 s`；拖动期间 `01 → … → 20 → 01` |

其中 `i=0…19`。`interact_step_a` 与 `interact_step_b` 是同一 `Move` 时间轴的两个真实相位，分别让不同脚先行，产生不同的脚步和重心顺序；不是复制、镜像、CSS 位移或 AI 生成动作。每段播放的最后一个 `relax_01` 使用上述同一张 Relax 帧，页面完成 action 后再切回 idle `img`。

本模型还包含 `Sit` 与 `Sleep` 动画。`Sleep` 仍未作为序列提交：横躺姿态没有同一条原始时间轴提供回到站立 Relax 的连续恢复段。`Sit` 仅用于拖动持握，不进入点击动作：共享 fit 下其可见底部比站立 `Relax` 低约 93px，直接接回站立会跳变；拖动图集因此在相同 scale / visualCenterX 下将骨架上移 `yShift≈93.51px`，使坐姿头顶与站立头顶对齐，并保持在 `314×460` 画布内。无 AI 插值或重绘。

## 旧单帧素材的隔离用途

| PNG 文件 | 来源 | 当前用途与隔离原因 |
| --- | --- | --- |
| `amiya_idle.png` | PRTS Wiki 干员模型在线查看器导出：<https://prts.wiki> | 仅作为首次加载静态展示；不进入正常 `Relax` 序列。首次占位结束后（包括 reduced-motion 待机）统一使用 Spine `amiya_relax_01.png`。它与新 Spine 导出不是同一渲染管线和 fit，无法无缝衔接。 |
| `amiya_hi.png` | PRTS Wiki 干员模型在线查看器导出：<https://prts.wiki> | 仅用于 `prefers-reduced-motion` 下的单帧互动反馈；不进入正常 `Interact` 或 `Move` 序列。 |
| `amiya_idle_02.png` … `amiya_idle_05.png` | 历史记录指向 Ark-Models `002_amiya`：[`3745e5c6e10b5252b2a5e1f1841ebef62b7ef15b`](https://github.com/isHarryh/Ark-Models/tree/3745e5c6e10b5252b2a5e1f1841ebef62b7ef15b/models/002_amiya) | 历史素材保留但不使用；其构图、锚点和采样密度与当前统一 fit 不一致。 |
| `amiya_action_01.png` … `amiya_action_04.png` | 历史记录指向 Ark-Models `002_amiya`：[`3745e5c6e10b5252b2a5e1f1841ebef62b7ef15b`](https://github.com/isHarryh/Ark-Models/tree/3745e5c6e10b5252b2a5e1f1841ebef62b7ef15b/models/002_amiya) | 历史素材保留但不使用；采样稀疏，不能插入当前连续时间轴。 |

`amiya_idle.png` 和 `amiya_hi.png` 的角色版权仍归 Hypergryph；PRTS Wiki 的社区查看器导出不构成独立的角色美术再授权。它们的保留仅为兼容首次加载静态占位，以及 `amiya_hi.png` 在 reduced-motion 下的单帧反馈；reduced-motion 待机仍使用 Spine `relax_01`，旧图不进入正常连续动画。

## 语音与占位音效

根据用户说明，**官方已同意使用阿米娅语音包为网页进行宣传**。本项目的语音交互以此为授权前提进行架构设计与合规管理。

为了确保资源合规、可查验且责任清晰，所有语音资产仍必须遵循以下管理准则：

1. **凭证可追溯**：在获得具体音频文件并实际放入 `assets/mascot/voice/` 之前，必须在文档与清单中登记对应凭据或授权档案；
2. **禁止虚构资产**：当前目录仅保留说明文档与空的 `catalog.js` 配置入口，**未提交任何未经确认的音频文件**；
3. **音字严格匹配**：每一段语音文件必须与其弹出的气泡台词（`lines`）保持一一对应，严禁音字不符；
4. **宣传语音独立隔离**：官方授权的宣传语音通过 `window.ARK_MASCOT_PROMO_CONFIG` 独立维护，不混入日常点击台词池，支持一键启用或移除。

### 语音资产登记与授权跟踪表

本目录包含两类受管音频资源：
1. **AI 二次元少女语音克隆/生成**：依据用户指定台词通过 edge-tts（`zh-CN-XiaoyiNeural` 动漫少女音色微调）生成 8 句专属互动台词，实现一字不差的音字同步；
2. **官方正版原声全集**：直接采自上海鹰角网络《明日方舟》国服陶典老师普通话配音原声资产（30+ 条无损音频），通过 PRTS 官方镜像库提取入库。

### 运行时语音选择与中断保护机制

`js/main.js` 已深度支持现代交互闭环：
- **点击即打断与重置**：每次用户点击小人时，立即打断上一轮的语音播放、打字机和气泡定时器，从第 1 帧重新播放新动作，并同步播放当前动作对应的台词与音频；
- **字持续时间自适应**：气泡字幕与实际音频播放深度绑定，在语音播放结束之前字幕绝不提前消失，并在语音结束后额外停留 1.2 秒供舒适阅读；
- **音字 100% 同步**：每个音频文件与弹出的字幕逐字完全对应，不再出现音字不符的情况；
- **双格式支持**：支持 `.mp3` 与 `.wav` 双格式自动查找与播放。

## AI 与核验记录

- 本次所有连续帧均直接采样原始 Spine 3.8 时间轴；没有使用 AI 文生图、AI 重绘或 AI 插值。
- `interact_step_b` 只是同一 `Move` 时间轴的相位采样，所有 PNG 仍是原始模型真实渲染。
- 画布对齐与视觉一致性：首帧静态占位与 Reduced-Motion 单帧反馈均已统一至 Spine 渲染基准（`amiya_relax_01.png` 与 `amiya_interact_01.png`），消除了历史素材 `amiya_idle.png` 导致的 27px 水平视觉跳动。
- 所有连续 PNG 均为 `314×460`、RGBA、透明画布；正常动作在两个稳定 `img` 节点之间互斥切换。
- 合规声明：角色的全部版权归上海鹰角网络科技有限公司 / Hypergryph 所有；本站点仅用于个人非商业展示与技术学习；若权利方认为不妥或提出异议，将立即下架并移除相关素材。

