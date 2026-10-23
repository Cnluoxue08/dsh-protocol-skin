# 协议终端皮肤 · dsh-protocol-skin

DeepSeek Harness（DSH）Web 界面的深色「协议终端」皮肤：主要参考游戏《明日方舟》近黑底 + 薄荷绿主色 + 橙色警示色，
会话区铺地形等高线底图，左栏是罗德岛水印，启动时播一段带音效的开屏序列并从中心解析出界面。
基于deepseek做DSH的PRTS的皮肤（参考卫戍协议UI）

## 效果

以下为AI输出的参考图
开屏动画：<img width="1992" height="974" alt="01-splash-storyboard" src="https://github.com/user-attachments/assets/75be4916-aa13-4022-93e4-d27f4ee8666c" />
过渡动画：<img width="1992" height="974" alt="02-transition-storyboard" src="https://github.com/user-attachments/assets/63f3566b-389f-4d7d-a500-8401c7a101fa" />
会话页面：<img width="1280" height="820" alt="06-full-look" src="https://github.com/user-attachments/assets/7606041e-aec0-4a31-8eb3-597d3b37862f" />
以上为AI的参考图

- **配色**：固定深色协议盘（不跟随系统浅色/深色），直角面板、发丝描边、HUD 四角括号。
- **会话区背景**：地形等高线图，`background-attachment: fixed`，滚动不动；气泡、代码块、输入区都是实色，天然盖在底图之上，图片不会被任何叠加层干扰。
- **左栏**：不透明底板 + 罗德岛标志水印，宽度随侧栏拖拽/收起实时跟随。
- **开屏**：约 3.4 秒的 PRTS 启动序列（字标逐字浮现 → 自检日志逐行打字 → 分段进度条 → 就绪），
  结束时会话页从中心撒出一层六边形模块并解析出来。
- **开屏音效**：视频里截出的 “Welcome back, doctor” 人声，默认开启，可一键关闭并记住选择。

## 安装

### 官方桌面端（Electron）

桌面端 profile 由 Electron 独占，`dsh plugin` 拒绝 `--profile desktop`。两种装法：

**A. 在桌面端会话里让 DSH 自己装**（推荐）

> 请使用当前桌面端内置的 `plugin_manager`，以 `install_bundle` 安装本目录（绝对路径）。

**B. 手工装**：把本包放进 profile 的 `node_modules`，再在 `%USERPROFILE%\.dsh\profiles\desktop\package.json` 里登记：

```json
"dependencies": { "dsh-protocol-skin": "link:<本目录绝对路径>" },
"dsh": { "profile": { "bundles": ["@deepseek-ai/dsh-base", "@deepseek-ai/dsh-web-app", "dsh-protocol-skin"] } }
```

Windows 下可用目录联接，避免复制：`cmd /c mklink /J "%USERPROFILE%\.dsh\profiles\desktop\node_modules\dsh-protocol-skin" "<本目录绝对路径>"`。
保存后宿主会热重载插件，**重启客户端**即可看到开屏与皮肤。

### Web profile（`dsh web`）

```bash
dsh plugin --profile web add link:<本目录绝对路径>
```

## 配置

在 profile 的 patch 层里给这一行加配置即可：

```yaml
- id: protocol-skin
  name: dsh-protocol-skin
  config:
    bootSound: false   # 开屏默认静音（页面里仍可手动打开）
```

## 卸载

从 `dsh.profile.bundles` 里删掉 `dsh-protocol-skin`（保存即失效），再删掉 `dependencies` 里的对应行与 `node_modules` 下的目录/联接。

## 使用与排障

| 操作 | 结果 |
|---|---|
| 开屏时点击 / 滚轮 / Esc / Enter / 空格 | 跳过开屏 |
| 开屏右下角「音效 开/关」或按 `M` | 切换开屏音效，选择记在浏览器 localStorage |
| 刷新页面 | 重播开屏 |
| 查看 `%USERPROFILE%\.dsh\.protocol-skin.json` | 心跳：`listening: true` = 注入已挂上，`servedIndex` 随每次首页渲染递增 |

## 自定义

- 背景图：替换 `assets/contour-hi.webp`（建议 ≥2000px 宽、深色低对比）。
- 水印：替换 `assets/rhodes-small.png`（带透明通道，白标）。
- 开屏音效：替换 `assets/welcome.opus`（Opus 编码，短音效）。
- 配色与节奏：`assets/skin.css`。令牌在文件顶部，开屏时长在 `.gsb` 的 `animation` 与各 `animation-delay`。

> ⚠️ 注意：所有位图、水印、音频都是**内联成 data URI** 塞进首页注入表的。
> 桌面端外壳转发这张表时有体积上限（实测 >200 KB 会被截断，表现为背景/水印丢失），
> 所以图片做了压缩；替换素材时请控制总大小，样式表目前约 124 KB。

## 素材来源

- 等高线底图、罗德岛标志、开屏人声：由使用者提供（人声取自其 PRTS 视频并做归一化与剪接）。
- 字体使用系统自带 Bahnschrift / Microsoft YaHei UI。

## 许可

本皮肤以 **CC BY-NC-SA 4.0**（署名-非商业性使用-相同方式共享）授权，完整条款见 [LICENSE](LICENSE)：
可自由分享与修改并用于 DeepSeek Harness 的非商业安装运行，但**禁止任何商业用途**，修改后再分发需沿用相同许可并保留署名。随包图片与音频由使用者提供，其权利不因本许可改变，公开前请确认素材授权。
若侵权，联系删
