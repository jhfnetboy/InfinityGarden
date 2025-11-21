# Release Notes - v0.1.3

## 🎉 XGarden v0.1.3 - Immersive Storytelling Update

**Release Date**: 2025-01-21

### ✨ New Features

#### 🎨 Background System
- **World Default Backgrounds**: Set default background images and music for each world
- **Chapter-Specific Media**: Each chapter can have unique background images and music
- **Auto-Switching**: Backgrounds and music automatically change when chapters progress
- **Priority System**: Chapter media > World defaults > System defaults

#### 📖 Enhanced Chapter Management
- **Worldbook Integration**: Chapter management moved to Worldbook panel for better organization
- **Visual Indicators**: Active and completed chapter status badges
- **Chapter Triggers**: Support for time-based, keyword-based, and AI-judgment triggers

#### 🖼️ Image Generation API
- **Jimeng Integration**: Added configuration for Volcengine Jimeng API
- **Separate Settings**: Image API configured independently from AI chat API
- **Future-Ready**: Prepared for AI-generated avatars and scene illustrations

### 🐛 Bug Fixes
- Fixed database prefix mismatch causing imported worlds not to appear
- Fixed maximize button to preserve world state when opening in new tab
- Fixed dialog click event propagation issues
- Fixed background image display with proper CSS syntax
- Fixed auto-save for world default settings
- Improved error handling for missing music files

### 🔧 Improvements
- **Better UI Organization**: Worldbook panel now has separate tabs for Entries and Chapters
- **Auto-Save**: World defaults save immediately upon change
- **Enhanced Debugging**: Added detailed logging for background loading
- **Optimized Overlays**: Reduced opacity for better background visibility
- **Music Playback**: Implemented background music with auto-play support

### 📚 Documentation
- Comprehensive README with setup guide
- API configuration instructions
- Music file setup guide
- Development documentation

### 🎯 What's Working
✅ Character creation and management  
✅ Group conversations  
✅ Worldbook entries  
✅ Chapter system with auto-progression  
✅ Background images and music  
✅ World import/export  
✅ Multiple AI provider support (Gemini, OpenAI)  
✅ Image API configuration  

### 🔄 In Development
🔄 AI image generation (avatars, scenes)  
🔄 Vector embeddings for RAG  
🔄 Video generation support  

### 📦 Installation

1. Download the latest release
2. Extract the zip file
3. Open `chrome://extensions/` in Chrome
4. Enable "Developer mode"
5. Click "Load unpacked" and select the extracted folder

### 🚀 Quick Start

1. Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Open XGarden and go to Settings → AI Config
3. Enter your API key and select a model
4. Create your first world and start chatting!

### 🙏 Acknowledgments

Special thanks to:
- Google Gemini for free AI API
- Volcengine for Jimeng image generation API
- All contributors and testers

---

**Full Changelog**: https://github.com/jhfnetboy/XGarden/compare/v0.1.2...v0.1.3
