# Screenshot Preparation Guide

## Tools Needed

1. **Chrome Browser** (for taking screenshots)
2. **Image Editor** (optional, for annotations)
   - macOS: Preview, Pixelmator, Photoshop
   - Windows: Paint, GIMP, Photoshop
   - Online: Canva, Figma

## Screenshot Specifications

- **Size**: 1280x800 (recommended) or 640x400
- **Format**: PNG or JPEG
- **Max file size**: 5MB per image
- **Quantity**: 1-5 screenshots (recommend 5)

## How to Take Screenshots

### Method 1: Chrome DevTools (Recommended)

1. Open XGarden extension
2. Press `F12` to open DevTools
3. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
4. Type "Capture screenshot"
5. Select "Capture screenshot" (for 1280x800)
6. Save the image

### Method 2: macOS Screenshot

1. Open XGarden extension
2. Press `Cmd+Shift+4`
3. Press `Space` to capture window
4. Click on the extension window
5. Resize to 1280x800 if needed

### Method 3: Windows Snipping Tool

1. Open Snipping Tool
2. Select "Window Snip"
3. Click on extension window
4. Save and resize to 1280x800

## Screenshot Checklist

> **Note**: All screenshots have been generated and are stored in `docs/screenshots/`.

### Screenshot 1: World Selector ✅
**Filename**: `01-world-selector.png`

**Setup**:
1. Open extension
2. Create 2-3 sample worlds with different names
3. Make sure "Create New World" button is visible

**What to capture**:
- Full world selector screen
- List of worlds
- Create button
- XGarden logo

---

### Screenshot 2: Chat Interface ✅
**Filename**: `02-chat-interface.png`

**Setup**:
1. Open a world
2. Set a background image (world defaults or chapter)
3. Create a character
4. Have 3-4 messages in the chat
5. Make sure music button is visible

**What to capture**:
- Chat interface with background
- Message bubbles
- Character name
- Music control button
- Input area

---

### Screenshot 3: Character Creation ✅
**Filename**: `03-character-creation.png`

**Setup**:
1. Click "New Character" in sidebar
2. Fill in example data:
   - Name: "Aria the Wise"
   - Persona: "A wise and ancient wizard who guides travelers"
   - Greeting: "Welcome, traveler. What brings you to my tower?"

**What to capture**:
- Character dialog fully visible
- All fields filled
- "Create Character" button

---

### Screenshot 4: Worldbook Panel ✅
**Filename**: `04-worldbook-panel.png`

**Setup**:
1. Open Worldbook panel
2. Add 2-3 worldbook entries or chapters
3. Show the "Entries" or "Chapters" tab
4. Make sure world defaults section is visible

**What to capture**:
- Worldbook panel open
- Tabs visible
- List of entries/chapters
- World defaults section

---

### Screenshot 5: Settings Dialog ✅
**Filename**: `05-settings-dialog.png`

**Setup**:
1. Open Settings
2. Show AI Config tab
3. Select "Google Gemini" as provider
4. Show the "Get Gemini API Key" link

**What to capture**:
- Settings dialog
- AI Config tab
- Provider selection
- API key field (empty is fine)
- Link to get API key

---

## Tips for Great Screenshots

### Do ✅
- Use realistic example data
- Show the extension in action
- Keep UI clean and uncluttered
- Use high-quality background images
- Show 3-4 messages in chat (not too many)
- Make sure all text is readable

### Don't ❌
- Include personal information
- Show API keys (even fake ones)
- Have too many items in lists
- Use offensive or inappropriate content
- Include browser UI (address bar, bookmarks)
- Make screenshots too busy

## Example Data to Use

### World Names
- "Fantasy Kingdom"
- "Sci-Fi Adventure"
- "Mystery Manor"

### Character Examples
- **Name**: Aria the Wise
  **Persona**: Ancient wizard, wise and mysterious
  **Greeting**: "Welcome to my tower, traveler."

- **Name**: Captain Nova
  **Persona**: Brave space explorer, optimistic leader
  **Greeting**: "Ready for our next mission?"

### Chat Messages
- User: "Hello! What can you tell me about this place?"
- Character: "This ancient library holds secrets from a thousand years ago..."
- User: "That sounds fascinating! Can you show me around?"

### Worldbook Entry Example
- **Keywords**: "magic system"
  **Content**: "Magic in this world flows from ancient crystals hidden deep underground..."

## Post-Processing (Optional)

### Add Annotations
- Highlight key features with arrows
- Add text labels for important buttons
- Circle important UI elements

### Optimize Images
```bash
# Using ImageMagick (if installed)
convert screenshot.png -resize 1280x800 -quality 90 optimized.png

# Or use online tools:
# - TinyPNG.com
# - Squoosh.app
```

## Final Checklist

Before uploading to Chrome Web Store:

- [ ] All 5 screenshots taken
- [ ] All screenshots are 1280x800
- [ ] All screenshots are under 5MB
- [ ] No personal information visible
- [ ] No API keys shown
- [ ] UI looks clean and professional
- [ ] Example data is appropriate
- [ ] Screenshots show key features
- [ ] Images are properly named

## Upload Order

1. `01-world-selector.png` - First impression
2. `02-chat-interface.png` - Main feature
3. `03-character-creation.png` - Key functionality
4. `04-worldbook-panel.png` - Advanced features
5. `05-settings-dialog.png` - Easy setup

---

**Ready to upload!** 🎉

Once you have all screenshots, proceed to the Chrome Web Store Developer Dashboard and upload them in the order above.
