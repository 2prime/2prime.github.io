# 博客写作

博客列表：<https://2prime.github.io/blog/>

在线写作：<https://2prime.github.io/blog/write/>

## 在线写作

1. 填写标题、摘要、日期、网址名称和标签。
2. 在左侧写 Markdown，右侧预览正文和 LaTeX 公式。行内公式使用 `$a_i+b_j=c_{ij}$`，独立公式使用单独成行的 `$$`。
3. 草稿自动保存在当前浏览器。需要在其他设备继续写时，先下载 Markdown 文件；浏览器草稿不会同步到其他设备。
4. 点击“前往 GitHub 发布”，登录具有仓库写入权限的账号，检查文章后点击 **Commit changes**。长文章会先下载 Markdown，再打开 GitHub 上传页。
5. 等待 GitHub Pages 构建完成，文章会自动出现在博客列表和首页。

GitHub 确认提交前不会生成公开文章。已有文章可通过阅读页底部的编辑链接修改。

## 直接写 Markdown 文件

在 `_posts` 中创建 `YYYY-MM-DD-short-title.md`，例如：

```yaml
---
title: "一篇研究笔记"
date: 2026-10-11
description: "显示在扁平卡片上的简短摘要。"
tags: ["研究笔记", "概率"]
lang: zh-CN
permalink: /blog/my-research-note/
---
```

在这个文件头之后写正文。正文不需要重复一级标题。使用 `##` 和 `###` 分节，阅读页会自动生成目录。

博客继承 `_config.yml` 中的默认布局和公式设置，无需给每篇文章重复填写。已有文章的显式 `permalink` 会保留。

## 公式

原生 Jekyll 的 kramdown 使用 `$$...$$` 保护行内数学内容，避免公式下标被 Markdown 当作斜体。直接编辑文件时请使用下面的写法。在线编辑器同时接受 `$...$`，导出时自动转换成 kramdown 的格式。

```markdown
行内公式：$$ a_i + b_j = c_{ij} $$。

$$
\begin{aligned}
f(x) &= x^2, \\
f'(x) &= 2x.
\end{aligned}
$$
```

MathJax 支持分式、矩阵、上下标、积分和常用 AMS 环境。代码块中的公式文本会保留原样。长公式在窄屏幕上可以横向滚动。

如果要展示 Liquid 模板代码，使用 Jekyll 的 `raw` 标签包裹这段代码，避免构建时被 Liquid 解释。

## 草稿与图片

`_drafts/blog-template.md` 是未发布的模板。把完成的草稿复制到 `_posts`，并在文件名中加入日期，即可发布。该仓库是公开仓库，提交到 `_drafts` 的内容仍然能在 GitHub 上被看到；尚未准备公开的笔记请只保存在本地或浏览器中。

图片可存入 `images/blog/`，正文通过 `![图片说明](/images/blog/example.png)` 引用。在线编辑器的预览不执行原始 HTML，适合使用标准 Markdown。

文章标题和正文保留写作时的语言；界面文字跟随主页的中文和英文切换。`lang` 可设置为 `zh-CN` 或 `en`。
