# XGarden - AI-Powered Interactive Storytelling Chrome Extension

<div align="center">

<img src="public/assets/icon.png" width="240" alt="XGarden Logo" align="center" />

**🌸 Create Your Own Interactive Story Worlds 🌸**

An open-source Chrome extension for AI-driven character interactions, world-building, and immersive storytelling.

[![Version](https://img.shields.io/badge/version-0.1.4-blue.svg)](https://github.com/jhfnetboy/XGarden/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

[English](README.md) | [中文](README_CN.md)

[Features](#features) • [Installation](#installation) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Roadmap](#roadmap)

</div>

---

## ✨ Features

### 🎭 Character & World Management
- **Create Custom Characters**: Design unique NPCs with personalities, greetings, and avatars
- **Character Avatars**: Upload custom avatars or generate via AI
- **Player Character**: Set your own character with custom personality traits
- **Group Conversations**: Organize characters into groups for multi-character interactions
- **World Building**: Define world settings, backgrounds, and lore with keyword-based worldbook entries
- **Avatar & Portrait Management**: Upload, preview, and delete character avatars and portraits

### 📖 Chapter System
- **Dynamic Chapters**: Create story chapters with custom backgrounds and music
- **Auto-Progression**: Chapters advance based on:
  - Time/dialogue count
  - Keyword triggers
  - AI-driven story judgment
- **Chapter-Specific Media**: Each chapter can have unique background images and music

### 🎨 Immersive Experience
- **Background Images**: World defaults + chapter-specific backgrounds with stretch-to-fill mode
- **Background Music**: Atmospheric audio that changes with chapters
- **Visual Effects**: Enhanced transparency for better background visibility with blur effects
- **Sound Effects**: Typewriter sound effects for authentic text appearance
- **Character Portraits**: Display character portraits during conversations with download capability

### 🤖 AI Integration
- **Google Gemini**: Free API via Google AI Studio (recommended)
- **OpenAI Compatible**: Support for OpenAI and compatible APIs
- **Image Generation**: Jimeng (Volcengine) API for character avatars and scene illustrations
- **Multi-Language**: Built-in support for English, Chinese, and Thai

### 💾 Data Management
- **Multiple Worlds**: Create and switch between different story worlds
- **Import/Export**: Complete world data export including characters, avatars, backgrounds, and chapters
- **World Rename**: Easily rename existing worlds
- **Local Storage**: All data stored locally in IndexedDB
- **Example Worlds**: Pre-configured example worlds for quick start

---

## 📸 Screenshots

### World Selection & Configuration
![World Selector](docs/screenshots/plugin-window.png)
*Create and manage multiple story worlds*

![World Configuration](docs/screenshots/world-config1.png)
*Configure world settings, backgrounds, and music*

![World Configuration - Chapters](docs/screenshots/world-config2.png)
*Manage story chapters with backgrounds and triggers*

### Character Management
![Character List](docs/screenshots/Charactor-talk.png)
*Talk with diverse AI characters in immersive worlds*

![Character Creation & Editing](docs/screenshots/Charactor-edit.png)
*Create and customize characters with detailed settings and avatars*

![Character Creation Dialog](docs/screenshots/charactor-add.jpg)
*Add new characters with personality, greeting, and avatar*

### Immersive Chat Experience
![Chat Interface - Spring World](docs/screenshots/chat1-Spring.jpg)
*Experience immersive chat with beautiful backgrounds and effects*

![Chat Interface - CypherPink World](docs/screenshots/chat2-CyperPink.jpg)
*Dynamic storytelling with character interactions and chapter progression*

### Character Profiles
![ZiWei Character](docs/screenshots/ZiWei.png)
*Example character with detailed persona and backstory*

![Boss Character](docs/screenshots/Boss.png)
*Diverse character types for varied interactions*

![Coach Character](docs/screenshots/Coach.png)
*Create characters with different roles and personalities*

### Relaxing Atmospheres
![Sakura Background](docs/screenshots/Sakura.png)
*Beautiful world environments with immersive backgrounds*

![Puppy Companion](docs/screenshots/Puppy.png)
*Craft unique worlds and characters for your stories*

### Application Views
![Full Screen Chat](docs/screenshots/full-screen-chat.png)
*Expanded chat view for maximum immersion*

![Full Window Interface](docs/screenshots/full-window.png)
*Complete interface showing all controls and options*

![Sidebar Navigation](docs/screenshots/left-bar.png)
*Character and group management with quick access*

---

## 🚀 Quick Start

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jhfnetboy/XGarden.git
   cd XGarden
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Build the extension**
   ```bash
   pnpm run build
   ```

4. **Load in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### First-Time Setup

1. **Get a Free API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a free Gemini API key

2. **Configure XGarden**
   - Click the XGarden extension icon
   - Go to Settings → AI Config
   - Enter your Gemini API key
   - Select your preferred model (e.g., `gemini-2.0-flash`)

3. **Create Your First World**
   - Click "Create New World"
   - Add characters, define the world setting
   - Start chatting!

---

## 📚 Documentation

### World Setup

#### 1. World Defaults (Worldbook → Entries)
- **World Description**: Overall setting and theme
- **Default Background**: Image shown when no chapter is active
- **Default Music**: Ambient music for the world

#### 2. Characters
- **Name**: Character identifier
- **Persona**: Personality description for AI
- **Greeting**: First message
- **Player Character**: Mark one character as yourself

#### 3. Worldbook Entries
- **Keywords**: Trigger words (e.g., "magic system", "The Great War")
- **Content**: Lore and context injected when keywords appear

#### 4. Chapters (Worldbook → Chapters)
- **Order**: Chapter sequence
- **Title & Description**: Chapter info
- **Background Image/Music**: Chapter-specific media
- **Trigger Type**:
  - **Time**: Advance after N dialogues or minutes
  - **Keyword**: Advance when specific words appear
  - **AI Judgment**: Let AI decide when to progress

### Image Generation API (Optional)

For AI-generated character avatars and scene illustrations:

1. **Get Jimeng API Keys**
   - Visit [Volcengine Console](https://console.volcengine.com/ai/ability/detail/2)
   - Get Access Key ID and Secret Access Key

2. **Configure in Settings**
   - Settings → Image API
   - Enter your credentials
   - [Documentation](https://www.volcengine.com/docs/85621/1817045)

---

## 🎵 Adding Background Music

Music files should be placed in `public/assets/music/`:
- `peaceful-forest.mp3`
- `calm-piano.mp3`
- `ambient-space.mp3`
- `medieval-lute.mp3`
- `gentle-rain.mp3`

**Free Music Resources**:
- [Pixabay Music](https://pixabay.com/music/)
- [Free Music Archive](https://freemusicarchive.org/)
- [Incompetech](https://incompetech.com/music/royalty-free/)

Alternatively, modify `getMusicUrl()` in `ChatInterface.tsx` to use online URLs.

---

## 🛠️ Development

### Tech Stack
- **React** + **TypeScript**
- **Vite** - Build tool
- **IndexedDB** (via `idb`) - Local storage
- **LangChain** - AI integration
- **TailwindCSS** - Styling

### Project Structure
```
src/
├── components/          # React components
│   ├── ChatInterface.tsx
│   ├── WorldSelector.tsx
│   ├── Sidebar.tsx
│   └── ...
├── services/           # Core services
│   ├── database.ts     # IndexedDB operations
│   ├── ai.ts          # AI service
│   ├── globalConfig.ts # Settings
│   └── vector-db.ts   # Vector search (RAG)
└── App.tsx            # Main app
```

### Build Commands
```bash
pnpm run dev    # Development mode
pnpm run build  # Production build
pnpm run preview # Preview build
```

---

## 🗺️ Roadmap

### v0.1.3 ✅
- ✅ World default backgrounds and music
- ✅ Chapter system with auto-progression
- ✅ Character and group management
- ✅ Worldbook entries
- ✅ Image API configuration (Jimeng)

### v0.1.4 (Current) ✅
- ✅ Enhanced background image clarity (bg-cover stretching)
- ✅ Avatar and portrait management with delete functionality
- ✅ Improved UI transparency for better background visibility
- ✅ Typewriter sound effects for authentic text appearance
- ✅ World rename functionality
- ✅ Multi-language support (English, Chinese, Thai)
- ✅ Portrait download capability
- ✅ Sidebar logo branding

### v0.2.0 (Next Release)
- 🔄 AI image generation integration
  - Character avatar generation
  - Scene illustration generation
  - Dynamic visual storytelling
- 🔄 Enhanced RAG with vector embeddings
- 🔄 Performance optimizations

### v0.3.0 - Historical & Literary Worlds
- 📚 **Pre-built World Templates**
  - Romance of the Three Kingdoms (三国演义)
  - Journey to the West (西游记)
  - The Three Musketeers
  - Greek Mythology
  - Norse Mythology
  - And more classic literature worlds
- 🎭 **Historical Characters Integration**
  - Interact with historical figures in their contexts
  - Accurate historical backgrounds and settings
  - Educational storytelling experiences

### v0.4.0 - Famous Personalities Database
- 🧑‍🔬 **Scientists & Innovators**
  - Alan Turing (Computer Science Pioneer)
  - Claude Shannon (Information Theory Founder)
  - Albert Einstein (Theoretical Physicist)
  - Isaac Newton (Mathematician & Physicist)
  - Marie Curie (Physicist & Chemist)
  - And many more...
- 💭 **Philosophers & Thinkers**
  - Socrates, Plato, Aristotle
  - Confucius, Laozi
  - Modern philosophers
- 💼 **Economists & Psychologists**
  - Adam Smith, John Maynard Keynes
  - Sigmund Freud, Carl Jung
  - Contemporary thought leaders
- 🎨 **Artists & Writers**
  - Shakespeare, Tolstoy, Hemingway
  - Da Vinci, Van Gogh, Picasso
  - And more cultural icons

### v0.5.0 - Open Gaming Platform
- 🎮 **Community Features**
  - Share custom worlds and characters
  - Community-created content library
  - Rating and review system
- 🌐 **Multiplayer Interactions**
  - Shared world experiences
  - Collaborative storytelling
  - Real-time character interactions
- 🏆 **Gamification**
  - Achievement system
  - Story progression tracking
  - Community challenges

### Future Vision
- 🎬 Video generation for cinematic storytelling
- 🎙️ Voice synthesis for character dialogues
- 🌳 Branching storylines with choice consequences
- 🔗 Blockchain integration for NFT characters/worlds
- 📱 Mobile companion app
- 🌍 Multi-language support (Chinese, English, Japanese, etc.)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini** for free AI API access
- **Volcengine Jimeng** for image generation capabilities
- **LangChain** for AI integration framework
- **Open-source AI training datasets** for historical character data
- All open-source contributors and community members

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/jhfnetboy/XGarden/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jhfnetboy/XGarden/discussions)

---

<div align="center">

**Made with ❤️ by the XGarden Team**

⭐ Star us on GitHub if you find this project useful!
❤️ Thanks and inspired by [3000World](https://github.com/34892002/3000World) repo and [SillyTavern](https://github.com/SillyTavern/SillyTavern)

</div>