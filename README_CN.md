# XGarden - AI 驱动的互动叙事 Chrome 扩展

<div align="center">

**🌸 创造属于你的互动故事世界 🌸**

一个开源的 Chrome 扩展,用于 AI 驱动的角色互动、世界构建和沉浸式叙事。

[![Version](https://img.shields.io/badge/version-0.1.4-blue.svg)](https://github.com/jhfnetboy/XGarden/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

[English](README.md) | [中文](README_CN.md)

[功能特性](#功能特性) • [安装](#安装) • [快速开始](#快速开始) • [文档](#文档) • [开发路线图](#开发路线图)

</div>

---

## ✨ 功能特性

### 🎭 角色与世界管理
- **自定义角色创建**: 设计独特的 NPC,包含性格、问候语和头像
- **玩家角色**: 设置你自己的角色和个性特征
- **群组对话**: 将角色组织成群组进行多角色互动
- **世界构建**: 通过关键词触发的世界书条目定义世界设定、背景和传说

### 📖 章节系统
- **动态章节**: 创建带有自定义背景和音乐的故事章节
- **自动推进**: 章节根据以下条件自动推进:
  - 时间/对话数量
  - 关键词触发
  - AI 驱动的故事判断
- **章节专属媒体**: 每个章节可以有独特的背景图片和音乐

### 🎨 沉浸式体验
- **背景图片**: 世界默认背景 + 章节专属背景
- **背景音乐**: 随章节变化的氛围音乐
- **视觉效果**: 半透明遮罩确保文字可读性

### 🤖 AI 集成
- **Google Gemini**: 通过 Google AI Studio 免费 API(推荐)
- **OpenAI 兼容**: 支持 OpenAI 及兼容 API
- **图像生成**: 极梦(火山引擎) API 用于角色头像和场景插图 *(开发中)*

### 💾 数据管理
- **多世界**: 创建和切换不同的故事世界
- **导入/导出**: 以 JSON 文件分享世界
- **本地存储**: 所有数据本地存储在 IndexedDB

---

## 🚀 快速开始

### 安装

1. **克隆仓库**
   ```bash
   git clone https://github.com/jhfnetboy/XGarden.git
   cd XGarden
   ```

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **构建扩展**
   ```bash
   pnpm run build
   ```

4. **在 Chrome 中加载**
   - 打开 `chrome://extensions/`
   - 启用"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择 `dist` 文件夹

### 首次设置

1. **获取免费 API 密钥**
   - 访问 [Google AI Studio](https://aistudio.google.com/app/apikey)
   - 创建免费的 Gemini API 密钥

2. **配置 XGarden**
   - 点击 XGarden 扩展图标
   - 进入 设置 → AI 配置
   - 输入你的 Gemini API 密钥
   - 选择你喜欢的模型(如 `gemini-2.0-flash`)

3. **创建你的第一个世界**
   - 点击"创建新世界"
   - 添加角色,定义世界设定
   - 开始对话!

---

## 📚 文档

### 世界设置

#### 1. 世界默认设置(世界书 → 条目)
- **世界描述**: 整体设定和主题
- **默认背景**: 无激活章节时显示的图片
- **默认音乐**: 世界的环境音乐

#### 2. 角色
- **名称**: 角色标识符
- **人设**: AI 的性格描述
- **问候语**: 第一条消息
- **玩家角色**: 标记一个角色为你自己

#### 3. 世界书条目
- **关键词**: 触发词(如"魔法系统"、"大战")
- **内容**: 当关键词出现时注入的传说和上下文

#### 4. 章节(世界书 → 章节)
- **顺序**: 章节序列
- **标题和描述**: 章节信息
- **背景图片/音乐**: 章节专属媒体
- **触发类型**:
  - **时间**: N 次对话或分钟后推进
  - **关键词**: 特定词语出现时推进
  - **AI 判断**: 让 AI 决定何时推进

### 图像生成 API(可选)

用于 AI 生成角色头像和场景插图:

1. **获取极梦 API 密钥**
   - 访问 [火山引擎控制台](https://console.volcengine.com/ai/ability/detail/2)
   - 获取 Access Key ID 和 Secret Access Key

2. **在设置中配置**
   - 设置 → 图像 API
   - 输入你的凭证
   - [文档](https://www.volcengine.com/docs/85621/1817045)

---

## 🎵 添加背景音乐

音乐文件应放置在 `public/assets/music/`:
- `peaceful-forest.mp3`
- `calm-piano.mp3`
- `ambient-space.mp3`
- `medieval-lute.mp3`
- `gentle-rain.mp3`

**免费音乐资源**:
- [Pixabay Music](https://pixabay.com/music/)
- [Free Music Archive](https://freemusicarchive.org/)
- [Incompetech](https://incompetech.com/music/royalty-free/)

或者,修改 `ChatInterface.tsx` 中的 `getMusicUrl()` 使用在线 URL。

---

## 🛠️ 开发

### 技术栈
- **React** + **TypeScript**
- **Vite** - 构建工具
- **IndexedDB** (通过 `idb`) - 本地存储
- **LangChain** - AI 集成
- **TailwindCSS** - 样式

### 项目结构
```
src/
├── components/          # React 组件
│   ├── ChatInterface.tsx
│   ├── WorldSelector.tsx
│   ├── Sidebar.tsx
│   └── ...
├── services/           # 核心服务
│   ├── database.ts     # IndexedDB 操作
│   ├── ai.ts          # AI 服务
│   ├── globalConfig.ts # 设置
│   └── vector-db.ts   # 向量搜索 (RAG)
└── App.tsx            # 主应用
```

### 构建命令
```bash
pnpm run dev    # 开发模式
pnpm run build  # 生产构建
pnpm run preview # 预览构建
```

---

## 🗺️ 开发路线图

### v0.1.3 (当前版本) ✅
- ✅ 世界默认背景和音乐
- ✅ 章节系统与自动推进
- ✅ 角色和群组管理
- ✅ 世界书条目
- ✅ 图像 API 配置(极梦)

### v0.2.0 (下一版本)
- 🔄 AI 图像生成集成
  - 角色头像生成
  - 场景插图生成
  - 动态视觉叙事
- 🔄 增强的 RAG 向量嵌入
- 🔄 性能优化

### v0.3.0 - 历史与文学世界
- 📚 **预构建世界模板**
  - 三国演义
  - 西游记
  - 三个火枪手
  - 希腊神话
  - 北欧神话
  - 更多经典文学世界
- 🎭 **历史角色集成**
  - 在历史背景下与历史人物互动
  - 准确的历史背景和设定
  - 教育性叙事体验

### v0.4.0 - 名人数据库
- 🧑‍🔬 **科学家与创新者**
  - 艾伦·图灵(计算机科学先驱)
  - 克劳德·香农(信息论创始人)
  - 阿尔伯特·爱因斯坦(理论物理学家)
  - 艾萨克·牛顿(数学家与物理学家)
  - 玛丽·居里(物理学家与化学家)
  - 以及更多...
- 💭 **哲学家与思想家**
  - 苏格拉底、柏拉图、亚里士多德
  - 孔子、老子
  - 现代哲学家
- 💼 **经济学家与心理学家**
  - 亚当·斯密、约翰·梅纳德·凯恩斯
  - 西格蒙德·弗洛伊德、卡尔·荣格
  - 当代思想领袖
- 🎨 **艺术家与作家**
  - 莎士比亚、托尔斯泰、海明威
  - 达·芬奇、梵高、毕加索
  - 更多文化偶像

### v0.5.0 - 开放游戏平台
- 🎮 **社区功能**
  - 分享自定义世界和角色
  - 社区创作内容库
  - 评分和评论系统
- 🌐 **多人互动**
  - 共享世界体验
  - 协作叙事
  - 实时角色互动
- 🏆 **游戏化**
  - 成就系统
  - 故事进度追踪
  - 社区挑战

### 未来愿景
- 🎬 视频生成用于电影式叙事
- 🎙️ 角色对话的语音合成
- 🌳 带有选择后果的分支故事线
- 🔗 区块链集成用于 NFT 角色/世界
- 📱 移动伴侣应用
- 🌍 多语言支持(中文、英文、日文等)

---

## 🤝 贡献

欢迎贡献!请随时提交 Pull Request。

1. Fork 仓库
2. 创建你的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

---

## 🙏 致谢

- **Google Gemini** 提供免费 AI API 访问
- **火山引擎极梦** 提供图像生成能力
- **LangChain** 提供 AI 集成框架
- **开源 AI 训练数据集** 提供历史角色数据
- 所有开源贡献者和社区成员

---

## 📞 支持

- **问题反馈**: [GitHub Issues](https://github.com/jhfnetboy/XGarden/issues)
- **讨论**: [GitHub Discussions](https://github.com/jhfnetboy/XGarden/discussions)

---

<div align="center">

**由 XGarden 团队用 ❤️ 制作**

⭐ 如果觉得这个项目有用,请在 GitHub 上给我们一个 Star!

</div>
