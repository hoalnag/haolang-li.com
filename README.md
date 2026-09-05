# haolang-li.com — 个人网站

macOS Finder 复刻版作品集网站。纯静态 HTML/CSS/JS,零依赖,零构建。
外观与交互以我自己的 Mac(Sequoia 深色模式 + 橙色强调色)为准 1:1 复刻。

本地路径:`~/github/haolang-li.com`(和其他仓库放一起)。

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

顶部一横排从左到右是三块:文件、人、他在哪儿。

- **左上**:三个文件——Self Intro、CV、Filmmaker's Reel。
  在 `app.js` 的 `DESK_FILES` 里加减。Reel 是外链(Vimeo),点了直接开新标签页;
  它同时也在 FILM 文件夹里,所以 "Recently Updated" 按 `href` 去了重,只列一次。
- **中间**:自动轮转的自画像。把照片命名为 `portrait-01.jpg` ~ `portrait-06.jpg`
  放进 `assets/photos/`,放几张就轮几张(每 4.6 秒淡入淡出,少于两张不轮转)。
  一张都没有时显示 HL 字母组合,不会显示破图。图下没有文字。
- **右上角**:纽约 / 北京的当地时间与实时气温。数据来自 Open-Meteo 公开接口,
  无需 API key;取不到时静默显示 "—"。改城市在 `app.js` 的 `CITIES` 数组。
  ≤940px 时它会独占一行(仍然靠右),≤660px 时移到自画像下面。
- 文件和自画像之间那片空白暂时留着,以后再想放什么。
- **中部横排**:五个文件夹,做成方块。
- **底部 Recently Updated**:**自动生成,不用手动维护**。它扫描整棵文件树,
  按每个条目的 `at` 日期倒序取前五条(顶层那五个文件夹会跳过,因为方块已经在上面了)。
  你只要在 `app.js` 的 `ROOT` 里加一条新条目并写上 `at` 日期,它就会自己出现在这里,
  时间也会自动显示成 `14h` / `2d` / `3mo` 这样的相对格式。

## Guest Book(公共画板)

菜单栏右上角 **Wallpaper / Guest Book** 切换。进 Guest Book 后整个桌面变成一张纸:
画笔(五色)、点击打字、插入照片、撤销、Clear,**Sign it** 命名后提交,**Book** 打开画册。

### 后端:Supabase(公开可画 + 你审核)

一次性设置:

1. 在 Supabase → SQL Editor 里跑仓库里的 [`supabase-setup.sql`](supabase-setup.sql)
2. Settings → API Keys 复制 **anon public** key
3. 填进 `assets/app.js` 顶部:

```js
const SUPA = {
  url: "https://knpwwgqkpcfjupsegouu.supabase.co",
  key: "eyJ...",        // ← anon public key
};
```

**key 留空时自动退回本地模式**(只存在访客自己浏览器里),所以没配好也不会坏。

### 审核怎么做

Supabase → Table Editor → `drawings` 表:

- 勾选 `approved` → 这张画公开显示
- 删除该行 → 拒绝

数据库策略保证了:访客**只能读到已批准的**,**只能新增、不能修改或删除**,
也**无法给自己的画标记通过**。所以没人能篡改或清空你的画册。

投稿人在自己浏览器里能立刻看到自己刚画的,标着 "Awaiting review",
通过审核后就并入正常画册——不会以为没保存成功。

### 安全提醒

- 只能填 **anon public** key。`service_role` key 会绕过所有权限规则,
  写进网页代码等于把数据库公开。
- SQL 里已加了约束:名字 ≤60 字、只收 PNG、单张 ≤650KB。

### 日期怎么写

每个条目的第二个参数就是修改时间,ISO 格式:

```js
folder("Short Films", "2026-07-16T11:40"),
pdf("CV-2026-7.pdf", "2026-07-18T09:00", "assets/files/CV-2026-7.pdf"),
mov("Filmmaker's Reel.mov", "2026-07-15T20:35", "assets/files/Filmmakers_Reel.mov"),
```

现在树里的日期是占位值,按你的真实情况改即可——列表和"最近更新"都会跟着变。

切到 List / Columns / Gallery 视图时,Desktop 会回到常规显示。

## AD Schedule(FILMS 里的实时通告板)

`FILMS › AD Schedule`,路由 `/films/ad-schedule`。拍摄当天的活体通告板:每一项点
「Start / Done」,整张表按实际用时重排,并且**把硬节点钉死**——超时的分钟数从后面的
turnaround / setup / strike 里扣,而不是让收工时间往后跑。

- 代码全在 `assets/ad-board.js`(自成一体,`window.ADBoard.mount(el)` / `.unmount()`),
  样式在 `style.css` 末尾的 AD Schedule 段,用的是全站同一套 Finder token。
- 三种重排策略:**保收工·先压周转** / **保收工·先压场次** / **不保·顺延收工**。
  地板值:场次最低 30 min、turnaround 10 min、strike 20 min;**午餐和 company move 锁死**。
  压不下去时会明说还差几分钟,不粉饰。
- 页面上只出现角色名和街区,不出现演员真名和门牌号 —— 这是公开页面。

### 后端:Supabase(公开可看,凭密钥才能改)

一次性设置:在 Supabase → SQL Editor 里跑 [`supabase-ad-schedule.sql`](supabase-ad-schedule.sql)。
它建一张 `shoot_state` 表(RLS 开启、**不给任何策略也不给 grant**,所以 PostgREST 根本碰不到),
只暴露两个 `security definer` 函数:

- `shoot_get(id)` —— 任何人可读,访客就是靠它实时跟看的
- `shoot_put(id, key, state)` —— 必须带对密钥才能写

跑完 SQL 最后会打印一行 `bookmark_this`,形如
`https://haolang-li.com/films/ad-schedule#k=<key>`。**这个带密钥的链接就是操作权**:

- 你自己存书签,电脑和 iPad 各打开一次,之后密钥进 localStorage,刷新也在
- 想让制片/导演也能改,把这条链接发给他们即可
- 不带密钥进来的人 = 只读,页面顶部会写明「Watching live」

密钥只存在 URL 和你的浏览器里,**不在网站代码里**,所以别人拿公开 anon key 也捞不到、改不了。
换一天拍摄:在 `shoot_state` 里插一行新的 `id`,改 `ad-board.js` 顶部的 `SHOOT_ID`。

## 桌面背景

静态渐变,写在 `style.css` 的 `.desktop`(深色)和 `[data-theme="light"] .desktop`(浅色)里。
以前这里放过 Vimeo 的 reel 当动态壁纸,已经拿掉了——改背景只要动这两条 `background` 即可。

## 手机端

窄屏(≤740px)的规则集中在 `style.css` 末尾的 "small screens" 一段:

- 窗口铺满全屏,侧边栏浮在内容上,点遮罩或点任一条目都会收起
- Dock 隐藏,社交链接走侧边栏的 Links 区
- **触屏单击即打开**(触屏没有双击,双击是浏览器的缩放手势)。
  逻辑在 `app.js` 的 content `click` 监听里,按 `pointerType` 判断,所以
  触屏笔电上鼠标仍然是"单击选中、双击打开"
- ≤480px 时菜单栏只留时间,日期让位
- 底部状态栏 / 画板工具条避开 iPhone 的 Home Indicator(`env(safe-area-inset-bottom)`)

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
