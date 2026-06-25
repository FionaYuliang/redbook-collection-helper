# 小红书收藏整理助手

一个 Manifest V3 Chrome 插件，用 Side Panel 导入并整理小红书收藏内容。当前版本面向 MVP：本地存储、增量同步、一级分类、二级主题、用户收藏夹、搜索和筛选。

## 功能

- 在已登录小红书的前提下，从当前页面扫描收藏笔记卡片。
- 使用 IndexedDB 本地保存笔记、分类、主题、收藏夹和同步元数据。
- 新增收藏增量分类，避免每次重复分析全部数据。
- 建立 `一级分类 -> 二级主题 -> 用户收藏夹` 的整理结构。
- 支持搜索标题、作者、分类、主题，并按分类、主题和置信度筛选。
- 支持重命名/删除一级分类、重命名二级主题。
- 支持创建项目型收藏夹，并把笔记加入收藏夹。
- AI 分类支持 OpenAI-compatible Chat Completions 接口；未配置 API Key 时自动使用本地规则分类兜底。

## 本地加载

1. 打开 Chrome：`chrome://extensions/`
2. 开启“开发者模式”。
3. 点击“加载已解压的扩展程序”。
4. 选择本项目目录：`/Users/yang/www/self-project/redbook-collection`
5. 打开 `https://www.xiaohongshu.com` 并登录。
6. 进入收藏相关页面，点击浏览器工具栏里的插件图标，打开 Side Panel 后点击右上角同步按钮。

## AI 设置

打开插件侧边栏的“设置”页：

- `AI Endpoint`：默认可使用 `https://api.openai.com/v1/chat/completions`
- `模型名`：填写你的 Chat Completions 模型名
- `API Key`：仅保存在本地浏览器 IndexedDB

不填写 API Key 时，插件仍可使用本地规则完成初步分类。

## 校验

```bash
npm run check
```

该命令会检查 manifest、必要文件和 JavaScript 语法。

## 实现说明

小红书页面结构和接口可能变化，MVP 采用内容脚本扫描当前页面 DOM 的方式导入，不修改小红书数据，也不会上传用户收藏内容到自有服务器。若开启外部 AI 接口，发送给接口的内容仅包含笔记 `id`、标题、作者和原始专辑字段。
