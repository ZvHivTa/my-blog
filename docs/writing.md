# 写作指南

## 内容放在哪里

- 学习与研究：`src/content/studies/<专题>/index.mdx`，同目录其他 MDX 是章节。图片可放在专题的 `images/` 中。
- 日常：`src/content/journal/<主题>/index.mdx` 是主题入口；同目录其他 MDX 可作为章节。图片放在该主题的 `images/` 中。
- 文件夹名建议使用小写英文和连字符。移动文章时一起移动图片。
- `draft: true` 不会生成页面，也不会出现在首页、列表或 RSS。
- 原 `/blog/...` 地址会跳转到 `/studies/...`，旧链接继续有效。

## 新建日常文章

复制 `src/content/journal/slow-afternoon/`，修改文件夹名称、文字和图片：

```yaml
---
title: '文章标题'
description: '一两句摘要'
date: 2026-09-24
cover: ./images/photo.jpg
coverAlt: '准确描述封面画面'
tags: ['生活', '散步']
draft: false
example: false
---
```

封面可省略；列表会显示文字卡片。封面不会在正文中自动重复插入，可自行选择正文配图位置。首页展示最新三篇日常。示例文章带 `example: true`，显示示例提示并设置 noindex；换成真实内容后改为 false。

日常也可以写成系列。保留 `index.mdx` 作为 Overview，在同一文件夹新增章节：

```yaml
---
title: '章节标题'
description: '章节摘要'
date: 2026-09-24
order: 1
tags: ['生活']
---
```

章节会按 `order` 排列，并在文章左侧显示 **In this series**；手机端显示可展开的 **Series** 菜单。章节不会单独出现在首页、日常列表或 RSS 中，主题卡片会显示章节数量。可参考 `src/content/journal/walk-by-the-river/`。

## 学习与研究

保留原来的 title、description、date、authors、tags、image 和 order。父专题可增加 `kind: research`（研究）或 `kind: learning`（学习，默认）。`featured: true` 将父专题列入首页精选（按日期取最多三项）。章节沿用日期升序、同日按 order 排序。

## 普通插图

```md
![图片内容的文字描述](./images/photo.jpg)
```

图片保持比例并适配正文宽度。小图不会被强行放大。普通 Markdown 图片不带点击放大；需要图注和放大时使用 Figure。

## 单图与图注

```mdx
import Figure from '@/components/content/Figure.astro'
import photo from './images/photo.jpg'

<Figure src={photo} alt="画面描述" caption="照片下的小字。" width="wide" />
```

`width` 为 normal（默认，正文宽度）、wide（日常允许超出文字列）或 small（竖图/小图居中）。学习页面的 wide 仍在正文列内，避免覆盖侧栏。默认完整显示，可点击放大，Esc、关闭按钮或点击遮罩关闭，并把焦点还给原图片按钮。`zoom={false}` 可关闭放大功能。

富文本图注可以替换 caption 属性：

```mdx
<Figure src={photo} alt="画面描述">
  <span slot="caption">补充说明。<a href="https://example.com">图片来源</a></span>
</Figure>
```

alt 用来描述画面，caption 用来补充时间、地点、感受或来源，不要把两者混为一谈。

## 组图

```mdx
import Gallery from '@/components/content/Gallery.astro'
import first from './images/first.jpg'
import second from './images/second.jpg'

<Gallery columns={2} images={[
  { src: first, alt: '第一张图', caption: '第一张的小字' },
  { src: second, alt: '第二张图', caption: '第二张的小字' },
]} caption="整组图片的说明" />
```

columns 可用 2 或 3。默认保留比例；摄影照片需要整齐的缩略图网格时增加 `crop={true}`，预览裁为 4:3，放大仍显示原图。研究图表、长截图不要裁切。520px 以下单列，三列在 700px 以下先降为两列。Gallery 默认宽图，也支持 `width="normal"`。

## 图片与预览

建议使用本地 JPG、PNG、WebP、AVIF 或 SVG，图片与文章一起提交。Figure/Gallery 接收导入的本地图片，Astro 对支持的位图生成响应式尺寸，使用懒加载并预留宽高。SVG 保持矢量原图。示例里的 SVG 是示意插画，可直接替换成照片。

运行 `npm run dev`，打开 `/journal` 或 `/studies` 预览。发布前运行 `npm run build`。

RSS：`/rss.xml` 汇总两部分，`/studies/rss.xml` 仅学习研究，`/journal/rss.xml` 仅日常。作者与标签索引目前服务于学习研究；日常标签只显示在文章中。科研助手的内容同步工作流仅同步 studies，日常文章不自动上传。
