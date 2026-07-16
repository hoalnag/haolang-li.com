# haolang-li.com — 个人网站

Finder 风格的作品集网站。纯静态 HTML/CSS,零依赖,零构建。

## 文件结构

```
index.html          首页(桌面)
ai.html             AI 子页面(AVA Studio / Test Footage)
film.html           FILM 子页面(Short Films / Cinematography / Festival & Sales / Poster Design)
writings.html       WRITINGS 子页面(Randomness / Poems / Reading Notes / Papers)
CNAME               自定义域名配置(GitHub Pages 需要)
assets/
  style.css         整站样式
  photos/           照片(见下方命名)
  files/            PDF 文件(Self_Intro.pdf / CV_2026_6.pdf / Recent_Writing.pdf)
```

## 上线前需要放入的素材

1. `assets/photos/background.jpg` — 背景大图(你那张虚化白衬衫照片)
2. `assets/photos/photo-01.jpg` ~ `photo-08.jpg` — 首页顶部横排照片
3. `assets/photos/placeholder.jpg` — 子页面卡片的默认缩略图(随便一张灰图即可,之后逐个替换)
4. `assets/files/` — 三个 PDF
5. `index.html` 里搜索 `YOUR_` — 替换成你的 Vimeo / Instagram / Spotify / Discord / Are.na / 邮箱链接

## 部署到 GitHub Pages

1. 在 GitHub 新建仓库(比如 `haolang-li.com` 或 `portfolio`)
2. 把这个文件夹里的所有文件推上去:
   ```bash
   cd haolang-li-site
   git init
   git add .
   git commit -m "initial site"
   git branch -M main
   git remote add origin https://github.com/你的用户名/仓库名.git
   git push -u origin main
   ```
3. 仓库 → Settings → Pages → Source 选 `main` 分支根目录,保存
4. 等 1–2 分钟,GitHub 会给你一个 `你的用户名.github.io/仓库名` 的地址,先确认站点正常

## 绑定 haolang-li.com

1. GitHub 仓库 → Settings → Pages → Custom domain 填 `haolang-li.com`(CNAME 文件已备好)
2. 去你的域名注册商后台,把 DNS 改成:

   | 类型  | 主机名 | 值 |
   |-------|--------|----|
   | A     | @      | 185.199.108.153 |
   | A     | @      | 185.199.109.153 |
   | A     | @      | 185.199.110.153 |
   | A     | @      | 185.199.111.153 |
   | CNAME | www    | 你的用户名.github.io |

   (先删掉原来指向 Cargo 的记录)
3. 回到 GitHub Pages 设置,勾选 **Enforce HTTPS**(DNS 生效后才能勾,通常几分钟到几小时)
4. 确认新站正常后,再取消 Cargo 订阅 —— 顺序别反,避免中间断站

## 日常更新

改动任何文件 → `git add . && git commit -m "update" && git push`,一两分钟后自动生效。
加新作品就是往子页面的 `.grid` 里加一个 `.card` 块,照着现有的复制即可。
