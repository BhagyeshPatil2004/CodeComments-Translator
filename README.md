# CodeComments Translator 🌐

> Translate code comments from any language to your preferred language instantly. Perfect for reading Chinese, Japanese, Korean, and other non-English codebases.

![CodeComments Translator](https://img.shields.io/badge/Lingo.dev-Hackathon%202026-purple)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🎯 Problem

Millions of developers struggle to read code with comments in foreign languages:
- 🇨🇳 Chinese open-source projects
- 🇯🇵 Japanese documentation
- 🇰🇷 Korean codebases
- And many more...

**Current solutions are broken:**
- Google Translate loses technical context
- Copy-pasting breaks code formatting
- Manual translation wastes hours

## ✨ Solution

**CodeComments Translator** translates code comments while preserving:
- ✅ Code structure (100% untouched)
- ✅ Syntax highlighting
- ✅ Technical terms accuracy
- ✅ Comment formatting

## 🚀 Features

- **Smart Comment Detection** - Supports `//`, `#`, `/* */`, `"""`, and more
- **Multi-Language Support** - Chinese, Japanese, Korean, Spanish, French, German, Hindi, and more
- **Auto Language Detection** - Automatically detects source language
- **Syntax Highlighting** - Beautiful code display with Prism.js
- **Batch Translation** - Translates all comments at once
- **Copy to Clipboard** - Easy code export
- **Beautiful UI** - Glassmorphism design with smooth animations

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS, Framer Motion
- **Translation:** Lingo.dev API / Google Gemini API
- **Syntax Highlighting:** Prism.js
- **State Management:** Zustand

## 📦 Installation

1. **Clone the repository:**
```bash
git clone https://github.com/BhagyeshPatil2004/polite-whip.git
cd polite-whip
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` and add your API key:
```env
# Option 1: Use Lingo.dev API (recommended)
LINGO_API_KEY=your_lingo_api_key_here

# Option 2: Use Google Gemini API (fallback)
GEMINI_API_KEY=your_gemini_api_key_here
```

4. **Run the development server:**
```bash
npm run dev
```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 🎮 Usage

1. **Paste your code** with comments in any language
2. **Select target language** (or use auto-detect)
3. **Click "Translate Comments"**
4. **Get translated code** with preserved structure!

### Example:

**Input (Chinese):**
```python
# 这个函数计算总价格
def calculate_total(items):
    # 遍历所有商品
    total = 0
    for item in items:
        total += item.price
    return total
```

**Output (English):**
```python
# This function calculates the total price
def calculate_total(items):
    # Loop through all items
    total = 0
    for item in items:
        total += item.price
    return total
```

## 🔑 API Keys

### Lingo.dev API (Recommended)
1. Sign up at [lingo.dev](https://lingo.dev)
2. Create a project
3. Get your API key from settings
4. Add to `.env` as `LINGO_API_KEY`

### Google Gemini API (Fallback)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key (FREE tier available)
3. Add to `.env` as `GEMINI_API_KEY`

## 🌟 Supported Languages

- 🇬🇧 English
- 🇨🇳 Chinese (Simplified)
- 🇯🇵 Japanese
- 🇰🇷 Korean
- 🇪🇸 Spanish
- 🇫🇷 French
- 🇩🇪 German
- 🇮🇳 Hindi
- 🇵🇹 Portuguese
- 🇷🇺 Russian
- 🇸🇦 Arabic
- 🇮🇹 Italian

## 📝 Supported Comment Styles

- `//` - C, C++, Java, JavaScript, TypeScript
- `#` - Python, Ruby, Shell, YAML
- `/* */` - C, C++, Java, JavaScript
- `"""` - Python docstrings
- `--` - SQL, Lua, Haskell

## 🎯 Use Cases

- **Learning from foreign repos** - Understand Chinese/Japanese open-source projects
- **Code reviews** - Review international team's code
- **Documentation** - Translate inline documentation
- **Education** - Learn from tutorials in any language

## 🏗️ Project Structure

```
├── app/
│   ├── api/translate/route.ts    # Translation API endpoint
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page
├── components/
│   ├── CodeEditor.tsx            # Code editor component
│   └── LanguageSelector.tsx      # Language selector
├── lib/
│   ├── comment-detector.ts       # Comment extraction logic
│   └── translator.ts             # Translation service
└── public/                       # Static assets
```

## 🚀 Deployment

Deploy to Vercel (recommended):

```bash
npm run build
vercel deploy
```

Or use any Node.js hosting platform.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for anything!

## 🙏 Acknowledgments

- Built for [Lingo.dev Hackathon 2026](https://lingo.dev)
- Powered by Lingo.dev API
- UI inspired by modern developer tools

## 📧 Contact

- GitHub: [@BhagyeshPatil2004](https://github.com/BhagyeshPatil2004)
- Project: [CodeComments Translator](https://github.com/BhagyeshPatil2004/polite-whip)

---

**Made with ❤️ for the global developer community**
