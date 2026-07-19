# haolang-li.com — 个人网站

macOS Finder 复刻版作品集网站。纯静态 HTML/CSS/JS,零依赖,零构建。
外观与交互以我自己的 Mac(Sequoia 深色模式 + 橙色强调色)为准 1:1 复刻。

## 文件结构

```
index.html          整站(单页应用:菜单栏 / 桌面 / Finder 窗口 / Dock)
CNAME               自定义域名配置(GitHub Pages 需要)
assets/
  style.css         整站样式(深色 + 浅色模式自动切换)
  app.js            Finder 引擎(文件系统数据 + 全部交互)
  photos/           照片
  files/            PDF 文件(Self_Intro.pdf / CV_2026_6.pdf / Recent_Writing.pdf)
```

## 已实现的 Finder 交互

- 单击选中(橙色高亮)、⌘/⇧ 多选、空白处拖拽框选、⌘A 全选
- 双击打开文件夹 / PDF / 链接;方向键移动选择;Enter 重命名
- 空格 Quick Look 预览;⌘I Get Info;⌘1/⌘2 切换图标/列表视图
- 右键上下文菜单(与真实 Finder 条目一致)
- 顶部菜单栏(File/Edit/View/Go/Window/Help 均可用,时钟实时走)
- 红绿灯:红/黄 = 关闭窗口(点 Dock 里的 Finder 图标恢复),绿 = 全屏
- 窗口可拖动、右下角可调大小;侧边栏窄屏自动收起
- 路径栏、状态栏(选中计数)、图标大小滑块均为真实功能

## Desktop 的专属版面

Desktop 不用普通图标网格,而是一个自定义版面(其他文件夹仍是网格):

- **右上**:自动轮转的自画像。把照片命名为 `portrait-01.jpg` ~ `portrait-06.jpg`
  放进 `assets/photos/`,放几张就轮几张(每 4.6 秒淡入淡出,少于两张不轮转)。
  一张都没有时显示 HL 字母组合,不会显示破图。
- **左上**:纽约 / 北京的当地时间与实时气温。数据来自 Open-Meteo 公开接口,
  无需 API key;取不到时静默显示 "—"。改城市在 `app.js` 的 `CITIES` 数组。
- **左中**:三个文件(PDF / MOV)。
- **中部横排**:五个文件夹,做成方块。
- **底部 Recently Updated**:**自动生成,不用手动维护**。它扫描整棵文件树,
  按每个条目的 `at` 日期倒序取前五条(顶层那五个文件夹会跳过,因为方块已经在上面了)。
  你只要在 `app.js` 的 `ROOT` 里加一条新条目并写上 `at` 日期,它就会自己出现在这里,
  时间也会自动显示成 `14h` / `2d` / `3mo` 这样的相对格式。

### Guest Book(画板)的重要限制

画板在桌面右侧,访客可以画画、命名、存进"See all drawings"的悬浮画廊。

**但目前每个访客只能看到自己画的画。** 因为 GitHub Pages 是纯静态托管,没有后端和数据库,
画作存在各自浏览器的 `localStorage` 里,无法跨访客共享,清浏览器数据也会丢失。

要做成真正"所有人共享"的画廊,需要加一个后端。改动很小——`app.js` 里只有两个函数
碰存储:

```js
function loadDrawings()  { ... }   // 换成 GET  /drawings
function storeDrawings() { ... }   // 换成 POST /drawings
```

可选方案(都有免费额度):Supabase、Firebase、Cloudflare Workers + KV。
选定后告诉我,界面一行都不用改。

### 日期怎么写

每个条目的第二个参数就是修改时间,ISO 格式:

```js
folder("Short Films", "2026-07-16T11:40"),
pdf("CV-2026-7.pdf", "2026-07-18T09:00", "assets/files/CV-2026-7.pdf"),
mov("Filmmaker's Reel.mov", "2026-07-15T20:35", "assets/files/Filmmakers_Reel.mov"),
```

现在树里的日期是占位值,按你的真实情况改即可——列表和"最近更新"都会跟着变。

切到 List / Columns / Gallery 视图时,Desktop 会回到常规显示。

## 修改内容

- **文件夹里加东西**:编辑 `assets/app.js` 顶部的 `ROOT` 文件树,
  给对应 `folder(...)` 的 children 数组加条目即可。
- **改社交链接**:`assets/app.js` 里的 `LINKS` 数组(搜 `YOUR_`)。
- **换日期/大小等元数据**:同样在 `ROOT` 树里。

## 上线前需要放入的素材

1. `assets/files/` — `Self_Intro.pdf` / `CV-2026-7.pdf` / `Filmmakers_Reel.mov`
   (Quick Look 与双击打开都依赖它们)
2. `assets/app.js` 里搜索 `YOUR_` — 替换成你的 Vimeo / Instagram / Spotify / Discord / Are.na / 邮箱链接

## 部署

已部署在 GitHub Pages(仓库 `hoalnag/haolang-li.com`,`main` 分支根目录),
绑定域名 haolang-li.com。日常更新:

```bash
git add . && git commit -m "update" && git push
```

一两分钟后自动生效。
