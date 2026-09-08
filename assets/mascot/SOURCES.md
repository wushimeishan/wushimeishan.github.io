# 阿米娅小组件素材来源

本目录中的人物图均为《明日方舟》干员「阿米娅」的游戏内 Q 版 Spine 模型渲染；角色、美术资源及相关权利归上海鹰角网络科技有限公司 / Hypergryph 所有。本个人主页仅用于非商业学习与粉丝展示；如权利方认为不妥，将立即移除。

## 连续动画帧

以下 24 张 PNG 来自同一份 Ark-Models `002_amiya` Spine 3.8 模型，并使用同一个 PixiJS / Spine 3.8 渲染器、对两条动画共同测量的固定 fit、固定原点和 314×460 透明画布生成。模型提交固定为 [`3745e5c6e10b5252b2a5e1f1841ebef62b7ef15b`](https://github.com/isHarryh/Ark-Models/tree/3745e5c6e10b5252b2a5e1f1841ebef62b7ef15b/models/002_amiya)，文件为 `build_char_002_amiya.skel`、`.atlas` 与 `.png`。

| 文件序列 | Spine 动画 | 时间轴采样 | 播放顺序 |
| --- | --- | --- | --- |
| `amiya_relax_01.png` … `amiya_relax_12.png` | `Relax`（1.0 s） | `t = 0/12, 1/12, …, 11/12 s` | `relax_01 → … → relax_12 → relax_01` |
| `amiya_interact_01.png` … `amiya_interact_12.png` | `Interact`（1.0 s） | `t = 0/12, 1/12, …, 11/12 s` | `interact_01 → … → interact_12 → relax_01` |

`Interact` 的第 1 帧是动作起点，第 2～11 帧覆盖起势、耳朵放平、闭眼倾斜峰值及回落，第 12 帧已回到接近站姿；动作结束后接 `relax_01`，不插入不同构图的旧图。`Relax` 循环不重复追加 `t = 1.0 s`，因此首尾接缝使用同一时间轴的相邻姿态。

渲染参考流程来自 [`psy-shawn/Arknights-codex-pets`](https://github.com/psy-shawn/Arknights-codex-pets/tree/ea23bea978c3797a3b0b9c3da3f028bfa742d083)，其 PixiJS 捕获器用于加载 Spine 3.8、测量共享 fit 和导出 PNG。本次帧均直接提高原始 Spine 时间轴采样数量，**没有 AI 生成、AI 插值、重绘或 CSS 变形补帧**。

## 保留但隔离的旧 PNG

| 文件 | 原始记录 | 当前用途 |
| --- | --- | --- |
| `amiya_idle.png` | PRTS Wiki 干员模型在线查看器导出：<https://prts.wiki> | 首次加载的单帧展示；不进入 `Relax` 连续序列 |
| `amiya_hi.png` | PRTS Wiki 干员模型在线查看器导出：<https://prts.wiki> | `prefers-reduced-motion` 下的单帧互动反馈；不进入 `Interact` 连续序列 |
| `amiya_idle_02.png` … `amiya_idle_05.png` | 原记录指向 Ark-Models `002_amiya` | 历史素材保留，不使用；其构图/锚点与统一 fit 序列不一致 |
| `amiya_action_01.png` … `amiya_action_04.png` | 原记录指向 Ark-Models `002_amiya` | 历史素材保留，不使用；采样稀疏且无法与连续 `Interact` 时间轴无缝衔接 |

旧图和新图的角色版权均归 Hypergryph；Ark-Models 与 PRTS Wiki 的社区转载/导出不构成独立角色美术授权。本仓库仅作非商业个人主页展示，不应将这些文件视为可自由再授权素材；如权利方要求，相关文件将被移除。

## 核验记录

- 所有新 PNG 均为 RGBA、314×460，透明角像素，无单帧自动缩放。
- Contact sheet 按真实播放顺序逐帧检查了头部位置与大小、双脚地面基线、身体重心、耳朵/头发/袖子/手部轨迹、表情变化和互动回落。
- 检查结论：`Relax` 12 帧可按时间循环；`Interact` 12 帧从站姿起势到闭眼倾斜峰值再回落，未发现“换图式”跨姿势跳变。最终视觉验收仍以浏览器中 1440×900 与 375×812 的实际播放为准。
