# 南窗 · 心理学与生活手记

一个安静的个人博客：记录应用心理学的学习、南方的生活，以及那些慢慢想明白的事。

![南窗首页预览](docs/preview.png)

纯 Node.js 静态生成，不需要前端框架，不需要数据库。公式在构建时用 KaTeX 排好；站点通过 GitHub 网页上传源码，由 GitHub Actions 自动部署到 GitHub Pages。

**这个项目不需要安装 Git，也不需要使用任何 Git 命令。**

这份指南写给第一次接触个人博客和代码的人，照着做就可以。

## 目录

- [先选：你打算怎么用它](#先选你打算怎么用它)
- [认识这个文件夹](#认识这个文件夹)
- [零安装预览](#零安装预览)
- [安装 Node.js](#安装-nodejs)
- [本地写作和实时预览](#本地写作和实时预览)
- [先改站点身份](#先改站点身份)
- [写一篇新文章](#写一篇新文章)
- [用 DeepSeek Harness 修改博客](#用-deepseek-harness-修改博客)
- [开启评论区](#开启评论区)
- [发布到 GitHub Pages](#发布到-github-pages)
- [日常更新流程](#日常更新流程)
- [常见问题](#常见问题)
- [隐私与写作边界](#隐私与写作边界)

## 先选：你打算怎么用它

| 你想做的事 | 需要安装什么 | 用哪个文件 |
| --- | --- | --- |
| 只想打开看看 | 什么都不用装 | `preview.cmd` |
| 想改文章、改样式、实时预览 | Node.js | `dev.cmd` / `new-post.cmd` |
| 想发布到网上 | 浏览器 + GitHub 账号 | GitHub 网页上传 |

不需要 Git。发布时把源码上传到 GitHub，Actions 会在云端构建。

## 认识这个文件夹

```text
friend-blog/
├─ content/                 # 你写的内容
│  ├─ posts/                # 文章（一篇一个 .md 文件）
│  ├─ pages/                # 独立页面，例如“关于”
│  └─ series/               # 专栏说明
├─ src/assets/              # 样式、脚本、图片、图标
│  └─ author.jpg            # 作者照片
├─ scripts/                 # 构建、预览、检查用的脚本
├─ dist/                    # 构建出来的网站（自动生成，不要上传）
├─ docs/                    # README 用的预览图
├─ vendor/katex/            # 公式渲染工具（已经内置）
├─ .github/workflows/       # GitHub Actions 自动部署配置
├─ site.config.json         # 站点名称、作者、导航、评论等配置
├─ content/pages/about.md   # “关于”页正文
├─ preview.cmd              # 零安装预览（只读）
├─ dev.cmd                  # 本地开发预览（需要 Node.js）
├─ new-post.cmd             # 新建文章（需要 Node.js）
└─ README.md                # 这份指南
```

几个词先解释一下：

- **Markdown（`.md`）**：一种用简单符号写文章的方式，例如 `## 标题`、`**加粗**`。
- **构建**：把 `content/` 里的 Markdown 和 `src/` 里的样式，生成 `dist/` 里的网页。
- **终端 / PowerShell**：Windows 里输入命令的窗口。按 `Win + R`，输入 `powershell`，回车就能打开。
- **仓库**：GitHub 上存放这个项目的地方。
- **GitHub Pages**：GitHub 提供的免费静态网站托管服务。

## 零安装预览

如果只是想看看现在的样子：

1. 把压缩包解压到一个普通文件夹，例如 `D:\朋友博客\friend-blog`；
2. 双击根目录的 `preview.cmd`；
3. 浏览器会自动打开 `http://127.0.0.1:4173/`；
4. 看完后回到黑色窗口，按 `Ctrl+C` 停止。

它用的是 Windows 自带的 PowerShell，不需要安装 Node.js，也不需要 Git。

注意：

- **不要直接双击 `dist/index.html`**。这个站点的链接是绝对路径，直接打开会没有样式，搜索也会失效。
- `preview.cmd` 预览的是 `dist/` 里已经生成好的内容。改了文章后，它不会自动更新；要重新构建，见[本地写作和实时预览](#本地写作和实时预览)。

## 安装 Node.js

Node.js 用来在本地重新生成网页、实时预览和新建文章。

> 如果你只打算在 GitHub 网页上改字、完全不本地预览，可以跳过这一节。但装了之后会方便很多。

### 1. 下载

打开官网：

<https://nodejs.org/zh-cn>

选择 **LTS（长期支持版）**，下载 **Windows 安装包（.msi）**，一般选 64 位。

> 不要下载“Current”尝鲜版，LTS 更稳定。

### 2. 安装

双击安装包，一路点“Next”。安装选项保持默认即可，确认安装程序里有 **Add to PATH**（默认会勾选）。

### 3. 检查是否装好

安装完成后，**关掉所有已经打开的 PowerShell 窗口**，重新打开一个新的 PowerShell，输入：

```powershell
node -v
npm -v
```

如果看到类似 `v22.x.x` 和 `10.x.x` 的版本号，就成功了。

如果提示“无法将 node 项识别为 cmdlet”：

- 先关掉窗口重新打开；
- 还不行就重启电脑；
- 再不行，重新运行安装包，选择 Repair，确认安装时勾选了 Add to PATH；
- 检查 `C:\Program Files\nodejs\node.exe` 是否存在。

### 4. 不需要 npm install

这个博客的公式工具已经放在 `vendor/katex/` 里，不需要联网安装依赖。

## 本地写作和实时预览

装好 Node.js 后，双击根目录的 `dev.cmd`。

浏览器会打开：

```text
http://localhost:4173/
```

这个模式会监听文件变化：你保存文章或样式后，浏览器会自动刷新。

也可以在 PowerShell 里运行：

```powershell
npm run dev
```

停止服务：回到窗口按 `Ctrl+C`。

### preview.cmd 和 dev.cmd 的区别

| | `preview.cmd` | `dev.cmd` |
| --- | --- | --- |
| 需要 Node.js | 不需要 | 需要 |
| 是否重新构建 | 不构建，只打开 `dist/` | 自动构建并刷新 |
| 适合 | 只看看 | 写作、改样式 |

## 先改站点身份

打开 `site.config.json`，用记事本、VS Code 或 DeepSeek Harness 都可以。

这个文件是 JSON 格式，注意：

- 字符串要用**英文双引号** `"..."`，不能用中文引号；
- 每一项之间用英文逗号 `,`；
- **最后一项后面不要多写逗号**；
- 改完保存为 UTF-8 编码。

最常改的字段：

| 字段 | 作用 | 示例 |
| --- | --- | --- |
| `title` | 站点名 | `"南窗"` |
| `mark` | 页头的小方印/单字 | `"窗"` |
| `wordmark` | 页头文字 | `"南窗"` |
| `author` | 作者名/笔名 | `"南窗"` |
| `authorPhoto` | 作者照片路径 | `"/assets/author.jpg"` |
| `authorRole` | 首页作者身份一行 | `"应用心理学硕士生 · 在南方生活"` |
| `authorNote` | 首页作者卡里的一句短介绍 | `"心理学不是读心术，是愿意多听一会儿。"` |
| `description` | 站点简介，会用在搜索和分享 | |
| `url` | 上线后的网址 | `"https://你的用户名.github.io"` |
| `tagline` | 副标题 | |
| `bio` | 首页“关于这个房间”的短介绍 | |
| `hero` | 首页大标题、开场白、背景窗景 | |
| `now` | 首页“此刻”卡片 | |
| `social` | 其他主页链接，目前为空 | |

`url` 先保持占位，发布前再改成真实地址。

### 换作者照片

把新照片命名为 `author.jpg`，覆盖 `src/assets/author.jpg`，然后重新构建。

如果换了文件名，要同时修改：

- `site.config.json` 里的 `authorPhoto`；
- `content/pages/about.md` front matter 里的 `photo`。

### 改“关于”页

编辑 `content/pages/about.md`。文件开头 `---` 之间的部分是 front matter，不要删掉；下面是正文。

关于页的照片配置：

```yaml
photo: /assets/author.jpg
photoAlt: "作者照片"
photoCaption: "一句话说明这张照片"
```

## 写一篇新文章

双击 `new-post.cmd`，输入标题。也可以：

```powershell
npm run new -- "文章标题"
```

它会在 `content/posts/` 下生成一个 Markdown 文件，默认是草稿。打开文件，把：

```yaml
draft: true
```

改成：

```yaml
draft: false
```

或者直接删掉这一行，文章才会出现在站点里。

### 文章开头怎么写

```markdown
---
title: "文章标题"
date: 2026-11-09
category: 心理学笔记
tags: [倾听, 关系]
summary: "一句话摘要，会出现在首页、搜索和分享卡片里。"
---

正文从这里开始。

## 一个小标题

这是一段正文。

> 这是一句引用。

- 列表第一项
- 列表第二项
```

### front matter 字段

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 是 | 文章标题 |
| `date` | 是 | `YYYY-MM-DD`，例如 `2026-11-09` |
| `category` | 建议 | 一个分类名，例如 `心理学笔记`、`生活切片` |
| `tags` | 否 | 多个关键词，例如 `[共情, 倾听]` |
| `series` | 否 | 专栏 slug，例如 `listening-practice` |
| `seriesOrder` | 否 | 在专栏里的顺序，数字越小越靠前 |
| `seriesLabel` | 否 | 专栏里的篇目名，例如 `01 听见` |
| `summary` | 否 | 摘要；不填会自动截取正文 |
| `cover` | 否 | 封面图路径；不填会用分类单字封面 |
| `draft` | 否 | `true` 时不参与构建 |

文件名会成为网址。例如：

```text
content/posts/listening-in-three-layers.md
→ /posts/listening-in-three-layers/
```

发布后尽量不要改文件名，否则评论和外部链接会对不上。

### Markdown 最常用的写法

````markdown
# 一级标题（正文里一般不用，文章标题已经单独处理）
## 二级标题
### 三级标题

**加粗**
*斜体*

[链接文字](https://example.com)

![图片说明](/assets/images/example.jpg)

> 引用

- 无序列表
- 第二项

1. 有序列表
2. 第二项

`行内代码`

```js
console.log('代码块')
```
````

如果要在正文里写美元符号，用 `\$`。

公式不是必须的，但需要时可以写：

```markdown
行内公式：$E = mc^2$

独立公式：

$$
\int_0^1 x^2 \, dx = \frac{1}{3}
$$
```

### 加图片

1. 把图片放进 `src/assets/images/`，例如 `src/assets/images/rain.jpg`；
2. 在文章里写：

```markdown
![雨天的窗](/assets/images/rain.jpg)
```

建议：

- 文件名用小写英文、数字和短横线；
- 图片先压缩，不要放十几 MB 的原图；
- 图片说明（alt）要写，方便读屏软件；
- 不要直接引用别人网站上的图片。

## 用 DeepSeek Harness 修改博客

DeepSeek Harness（DSH）可以读取这个文件夹、修改文件、运行构建命令，也能帮你检查页面。它不是运行博客的必需品，但很适合不熟悉代码的人。

### 第一次打开

1. 解压博客文件夹，记住路径，例如 `D:\朋友博客\friend-blog`；
2. 打开 DeepSeek Harness；
3. 新建一个会话，把工作目录/工作区选为这个 `friend-blog` 文件夹；
4. 允许它读取和修改这个文件夹，以及运行构建命令；
5. 先让它读一遍文档，不要急着改。

第一条可以这样问：

```text
请先阅读 README.md、site.config.json 和 scripts/lib/templates.mjs，
用小白能听懂的话告诉我这个博客的结构、首页在哪里改、文章放在哪里。
先不要修改任何文件。
```

### 一个安全的修改流程

1. **先备份**：把整个文件夹复制一份，或压缩成 zip。
2. **一次只改一件事**：先改标题，再改文案，再改样式。
3. **让 DSH 说明要改哪些文件**：不要只说“随便帮我美化一下”。
4. **改完让它构建和检查**：
   ```text
   改完请运行 npm run build 和 npm run check，
   把错误信息解释给我听，不要自动上传或发布。
   ```
5. **自己打开预览看**：运行 `preview.cmd`，或在 DSH 里让它启动 `dev.cmd`。
6. **满意后再去网页上传**：把改动过的文件上传到 GitHub。

### 可以这样向 DSH 提要求

**改身份信息：**

```text
请把站点名改成「XXX」，作者改成「XXX」，首页大标题改成「……」，副标题改成「……」。
保持现在的暖色和拱窗风格，不要改布局。改完运行构建和检查，并告诉我改了哪些文件。
```

**改首页文案：**

```text
首页欢迎区的介绍有点长，请压缩到 80 字以内，
保留“心理学”“南方生活”这两个意思，第一人称不变。
```

**加文章：**

```text
我想新增一篇文章，标题是《……》，分类是「生活切片」，
标签是「梅雨、日常」。请先按现有格式创建草稿，
不要编造具体的地名和人物，正文留给我来写。
```

**调整视觉：**

```text
首页作者卡现在有点高，请在不改变照片比例的前提下，
让桌面端稍微紧凑一点，手机端保持横向卡片。
改完截图给我看，并检查有没有横向溢出。
```

**修问题：**

```text
评论区一直显示“正在准备中”。请先读 README 的评论区章节，
检查 site.config.json 里的 repo 是否已经替换，再告诉我下一步。
不要直接改我的 GitHub 设置。
```

**发布前检查：**

```text
请运行 npm run build 和 npm run check，
再检查有没有泄露学校全称、医院科室、导师姓名或个案信息。
把结果列出来，先不要上传。
```

### 让 DSH 改代码时的注意事项

- **说清楚范围**：是只改文字、只改颜色，还是可以动布局。
- **要求它先读文件**：不要让它凭想象重写整个项目。
- **要求它跑构建**：只改文件不构建，页面可能还是旧的。
- **不要一次改太多**：一次改三处，出问题很难找。
- **不要让它直接发布**：先预览，确认后再上传。
- **不要粘贴隐私**：来访者信息、学校全称、导师姓名、医院科室、身份证号、电话都不要发给 AI。
- **保留备份**：AI 改坏了，zip 备份是最可靠的后悔药。

### 如果改坏了

先不要慌：

1. 让 DSH 看错误信息：
   ```text
   页面现在打不开了。请先读终端里的报错，定位是哪个文件，
   给我最小的修复方案，不要重写整个项目。
   ```
2. 如果还没有备份，先不要再改，把当前文件夹复制一份；
3. 用之前的 zip 备份恢复；
4. 如果已经上传到 GitHub，可以在仓库的 Commits 页面用网页回退到上一个版本。

## 开启评论区

评论区使用 **Giscus**：把每篇文章的评论存到 GitHub Discussions 里。

- 读者需要登录 GitHub 才能留言；
- 评论是公开的，会出现在仓库的 Discussions 里；
- 不需要数据库，也不需要服务器；
- `giscus.app` 在国内通常可以正常打开；如果连它也打不开，评论区会显示兜底的 GitHub Discussions 链接；
- 本地 `preview.cmd` 里可能加载不出来，部署到 GitHub Pages 后再测试最准确。

当前 `site.config.json` 里的配置是：

```json
"comments": {
  "provider": "giscus",
  "repo": "DZRicardo/DZRicardo.github.io",
  "repoId": "R_kgDOVn1deA",
  "category": "Announcements",
  "categoryId": "DIC_kwDOVn1deM4DKtV3",
  "mapping": "pathname"
}
```

`repoId` 和 `categoryId` 都已经填好。如果线上仍然显示“评论区正在准备中”，检查仓库是否 Public、Discussions 是否开启、Giscus App 是否授权。

### 第 1 步：仓库必须是 Public

Giscus 要求仓库公开。如果你还没有仓库，先看[发布到 GitHub Pages](#发布到-github-pages)。

### 第 2 步：打开 Discussions

进入 GitHub 仓库：

**Settings → General → Features**，勾选 **Discussions**。

然后打开仓库的 **Discussions** 标签，确认至少有一个分类。推荐使用默认的 **Announcements**（公告）分类。

### 第 3 步：安装 Giscus App

打开：

<https://github.com/apps/giscus>

点击 **Install**，选择你的账号，然后选择这个博客仓库，授权安装。

如果打开 Giscus 配置页时提示：

```text
giscus is not installed on this repository
```

就是这一步没完成。

### 第 4 步：从 giscus.app 复制两个 ID

打开：

<https://giscus.app>

按顺序填写：

1. **Repository**：填 `DZRicardo/DZRicardo.github.io`；
2. **Page ↔ Discussions Mapping**：选 `pathname`；
3. **Discussion Category**：选 `Announcements`；
4. 页面底部会生成一段 `<script>` 代码。

代码里有两项：

```html
data-repo-id="R_xxxxxxxxxxxxxxxx"
data-category-id="DIC_xxxxxxxxxxxxxxxx"
```

本项目的 `repoId` 和 `categoryId` 都已经填好。以后如果换仓库，再按这里的步骤重新获取。

### 第 5 步：填进 site.config.json

把 `site.config.json` 改成：

```json
"comments": {
  "provider": "giscus",
  "repo": "DZRicardo/DZRicardo.github.io",
  "repoId": "R_你的仓库ID",
  "category": "Announcements",
  "categoryId": "DIC_你的分类ID",
  "mapping": "pathname"
}
```

注意：

- `repo` 是 `用户名/仓库名`，不要写完整网址；
- `repoId` 以 `R_` 开头；
- `categoryId` 以 `DIC_` 开头；
- `category` 必须和你在 giscus.app 选的分类名一致；
- 仓库必须是公开的。

### 第 6 步：重新上传并等待部署

把改过的 `site.config.json` 上传到 GitHub，提交后 Actions 会自动重新部署。部署完成后打开线上文章页，底部应该出现留言框。

### 评论区常见问题

**一直显示“评论区正在准备中”**

说明 `repoId` 或 `categoryId` 还是空的，或者 `repo` 还是占位。按第 4、5 步补齐。

**giscus.app 提示 “giscus is not installed on this repository”**

Giscus App 还没安装，或者安装后没有勾选这个仓库。打开 <https://github.com/apps/giscus> → Configure 检查。

**giscus.app 的分类下拉框是 “No categories found”**

通常是 Discussions 没开、仓库不是 Public，或者 Giscus App 没授权。先把这三项处理好。

**留言框空白 / 只显示“讨论”标题**

先确认你看的是线上地址（`https://dzricardo.github.io/...`），不是 `preview.cmd` 的本地地址。然后检查：

1. 仓库是不是 Public；
2. Discussions 是否开启；
3. Giscus App 是否安装并授权了这个仓库；
4. `repoId`、`categoryId` 是否和 giscus.app 生成的一致；
5. `category` 是否和仓库里的分类名一致；
6. 是否已经重新上传并部署；
7. 浏览器是否拦截了 `giscus.app`；
8. 强制刷新页面（`Ctrl+F5`），等几秒让 iframe 加载。

**评论会公开吗？**

会。每篇文章的评论对应一个 GitHub Discussion，任何能看到仓库的人都能看到。请不要在评论里写学校全称、医院科室、来访者信息或其他隐私。

## 发布到 GitHub Pages

发布不需要安装 Git。你只需要一个 GitHub 账号和浏览器。

### 第 1 步：创建仓库

登录 GitHub，点右上角 **+ → New repository**。

- **Repository name**：如果想让网址是 `https://用户名.github.io`，就填 `用户名.github.io`；
- 也可以填普通名字，例如 `blog`，网址会变成 `https://用户名.github.io/blog/`；
- 选择 **Public**；
- 不要勾选“Add a README file”，保持空仓库最省事。

### 第 2 步：打开 Pages

进入仓库 **Settings → Pages → Build and deployment**，Source 选择 **GitHub Actions**。

### 第 3 步：上传源码

**要上传：**

```text
content/
src/
scripts/
vendor/
.github/
docs/
package.json
site.config.json
README.md
dev.cmd
preview.cmd
new-post.cmd
```

**不要上传：**

```text
dist/
.edge-*
.preview-*
*.zip
```

原因：

- `dist/` 是构建产物，Actions 会重新生成；上传只会增加文件数量；
- 这个项目的源码大约 65 个文件，GitHub 网页一次上传最多 100 个文件，可以一次拖完；
- 如果把 `dist/` 也传上去，文件数会超过 100，可能需要分批。

**操作：**

1. 打开仓库首页，点 **Add file → Upload files**；
2. 在 Windows 资源管理器里选中上面那些文件和文件夹，拖进网页；
3. 如果 `.github` 文件夹在资源管理器里看不到，先开启“查看 → 显示 → 隐藏的项目”；
4. 在下方写一句提交说明，例如 `init: 上传博客源码`；
5. 点 **Commit changes**；
6. 打开仓库的 **Actions** 页面，等待 `Deploy blog to GitHub Pages` 变绿。

**最重要的一步：检查 `.github/workflows/deploy.yml` 是否存在。**

网页上传有时会漏掉以点开头的隐藏文件夹。如果仓库里没有这个文件，Actions 不会自动部署。手动补上：

1. 仓库首页 **Add file → Create new file**；
2. 文件名填 `.github/workflows/deploy.yml`；
3. 把本地 `.github\workflows\deploy.yml` 的内容完整粘贴进去；
4. 提交。

### 第 4 步：等待上线

打开仓库的 **Actions** 页面，等绿色的对勾。通常需要 1–2 分钟。

然后访问：

- 用户主页仓库：`https://你的用户名.github.io`
- 普通仓库：`https://你的用户名.github.io/仓库名/`

如果是普通仓库，别忘了改 `site.config.json`：

```json
"url": "https://你的用户名.github.io",
"basePath": "/仓库名/"
```

网页上传的话，可以直接在 GitHub 上编辑 `site.config.json`，提交后 Actions 会自动重新部署。

### 以后再更新

- **改文字**：在 GitHub 上点开文件 → 铅笔图标 → 修改 → Commit；
- **加文章**：可以本地用 `new-post.cmd` 写好后上传，也可以直接在 GitHub 上新建 `.md` 文件；
- **换照片**：上传新的 `author.jpg`，覆盖 `src/assets/author.jpg`；
- **删除文章**：在 GitHub 上打开对应文件 → 删除 → Commit。网页上传不会自动删除旧文件，必须手动删。

### 网页端上传的隐私提醒

网页上传和在线编辑也会产生 **公开的 GitHub 提交记录**。每次修改都能在仓库的 Commits 页面看到，提交者是你的 GitHub 账号。

所以：

- 只上传最终版内容，不上传草稿、私人笔记和旧版本；
- 建议用一个只用于博客的 GitHub 账号；
- 把 GitHub 邮箱设为 noreply 邮箱；
- 如果不想公开源码，可以把公开仓库改成只放构建后的 `dist/` 页面，或者使用私有仓库（GitHub 私有仓库发布 Pages 通常需要付费计划）。

## 日常更新流程

```text
双击 dev.cmd
  → 浏览器预览
  → 改文章 / 改配置
  → 保存，自动刷新
  → 满意后关闭窗口
  → 在 GitHub 网页上传改动过的文件
  → Actions 自动部署
```

新建文章：

```text
new-post.cmd → 写内容 → dev.cmd 预览 → 网页上传
```

发布前建议运行一次：

```powershell
npm run build
npm run check
```

`check` 会检查页面标题、重复 id、内部链接、搜索索引和 KaTeX 资源。

## 常见问题

### 提示“node 不是内部或外部命令”

Node.js 没装好，或者 PATH 没生效。

- 关掉所有 PowerShell 窗口，重新打开；
- 还不行就重启；
- 重新运行 Node 安装包，选择 Repair；
- 确认 `C:\Program Files\nodejs\node.exe` 存在。

### 打开页面没有样式

不要直接双击 `dist/index.html`。用 `preview.cmd` 或 `dev.cmd`。

### 改了文章，preview.cmd 里没变化

`preview.cmd` 只打开已经构建好的 `dist/`，不会重新生成。用 `dev.cmd`，或者手动运行：

```powershell
npm run build
```

### 图片不显示

- 图片要放在 `src/assets/` 下面；
- 文章里用 `/assets/...` 开头；
- 文件名大小写要一致；
- 改完要重新构建；
- 不要写 `C:\Users\...` 这种本地路径。

### JSON 报错

`site.config.json` 很容易因为一个逗号出错：

- 用英文双引号；
- 最后一项后面不要多逗号；
- 中文引号 `“”` 不是 JSON 引号；
- 不确定时，把报错原文发给 DSH，让它定位。

### 端口被占用

`preview.cmd` 会自动往后找端口；`dev.cmd` 默认用 4173，先关掉旧的预览窗口再试。

### 中文变成乱码

把文件保存为 **UTF-8**。Windows 记事本可以在“另存为”里选择编码。

### Actions 页面只显示 “Get started with GitHub Actions”

说明 GitHub 没有在仓库里找到工作流文件，通常是 `.github` 隐藏文件夹在上传时漏掉了。

在仓库里手动创建：

1. **Code** 页面 → **Add file → Create new file**；
2. 文件名填 `.github/workflows/deploy.yml`（斜杠会自动创建文件夹）；
3. 把本地 `.github\workflows\deploy.yml` 的内容完整粘贴进去；
4. **Commit changes**；
5. 回到 **Actions**，左侧应该出现 `Deploy blog to GitHub Pages`。

如果还是没有，确认文件在 `main` 分支上，并且路径和文件名完全一致。

### 发布后页面 404

- 检查仓库名和 `basePath` 是否对应；
- 普通仓库要设置 `basePath: "/仓库名/"`；
- 检查 Actions 是否成功；
- 等一分钟再刷新。

### 评论区一直“准备中”

检查 `site.config.json` 里的 `repoId`、`categoryId` 是否已经填好，仓库是否 Public，Discussions 是否开启，Giscus App 是否授权。

## 隐私与写作边界

这是一个公开博客。发布前建议逐项确认：

- 不写学校全称、具体院系、导师姓名、宿舍和常去的医院；
- 不写可识别的来访者、病人或同学信息；案例需要改动细节或合并；
- 不把课堂材料、未公开的研究数据直接贴上来；
- 照片发布前检查背景里的门牌、工牌、定位信息，并确认本人同意公开；
- 评论区是公开的 GitHub Discussions，不要在里面写隐私；
- 评论区由 Giscus 提供，打开文章页会加载 `giscus.app` 的脚本，也可能带上 GitHub 的 Cookie；不想用时把 `comments.provider` 改成 `"none"`；
- **这个压缩包没有 `.git` 目录，也没有本地提交历史**；
- **网页上传和在线编辑也会产生公开的 GitHub 提交记录**，每次修改都能在 Commits 里看到。不要上传草稿、私人笔记和不想公开的旧版本；
- 建议用只用于博客的 GitHub 账号，并把邮箱设为 GitHub 的 noreply 邮箱；
- 如果不想公开源码，公开仓库可以只放构建后的 `dist/` 页面；
- 如果以后接入统计工具，先看清楚它会收集什么。

站点本身没有统计脚本、没有广告。评论区只有在绑定 GitHub 仓库后才会加载第三方脚本。

## 速查

| 想做的事 | 操作 |
| --- | --- |
| 零安装看站点 | 双击 `preview.cmd` |
| 写作并实时预览 | 双击 `dev.cmd` |
| 新建文章 | 双击 `new-post.cmd` |
| 构建 | `npm run build` |
| 检查链接和页面 | `npm run check` |
| 发布 | 在 GitHub 网页上传源码，等待 Actions |
| 改站点名/作者 | `site.config.json` |
| 改关于页 | `content/pages/about.md` |
| 加文章 | `content/posts/` |
| 换作者照片 | `src/assets/author.jpg` |
| 开启评论 | 改 `site.config.json` 的 `comments.repoId` 和 `categoryId` |

写作愉快。
