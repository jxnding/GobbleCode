# 🟡 GobbleCode

**WAKA WAKA! The quirky, flashy AI coding agent that munches through code!**

GobbleCode is a fork/inspired version of OpenCode with enhanced features, a flashy GUI, and a Pac-Man style mascot named Mr. Gobble who gobbles up your coding problems!

![GobbleCode Logo](packages/gui/src/assets/gobble.svg)

## ✨ Features

### 🎨 Flashy GUI
- Electron + React desktop app with stunning Pac-Man animations
- Wavy text effects and WAKA WAKA thinking animations
- Glass morphism design with golden yellow accent color
- Mr. Gobble (Pac-Man style) mascot with quick settings access

### 🤖 Visual Agent Programming
- Drag-and-drop agent graph editor
- Visual workflow builder with ReactFlow
- Built-in agent templates (Build, Plan, Custom)
- Subagent orchestration

### 🔍 Search-Boosted AI
- Direct browser integration for web search
- Multiple search providers (Google, DuckDuckGo, Perplexity, GitHub, Stack Overflow)
- Automatic search context to boost model responses
- Real-time web results integration

### 📱 Multi-Platform
- **GUI**: Electron desktop app (Windows, macOS, Linux)
- **TUI**: Terminal interface with Ink (React for CLI)
- **Phone**: React Native companion app (iOS, Android)
- **Online Sync**: Cloud sync for agents, models, and settings

### 🎵 Sound Effects
- Customizable sound effects for all actions
- Mr. Gobble's signature "gobble" sound
- Volume control and per-effect settings

### ⚙️ Skills Centralization
- Unified skill management system
- Skill search and discovery
- Category-based organization
- Easy skill installation and configuration

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/gobblecode.git
cd gobblecode

# Install dependencies
npm install

# Build all packages
npm run build

# Run the GUI
npm run gui

# Run the TUI
npm run tui
```

### Development

```bash
# Start all packages in development mode
npm run dev

# Run tests
npm run test

# Lint code
npm run lint

# Type check
npm run typecheck
```

## 📦 Project Structure

```
gobblecode/
├── packages/
│   ├── core/          # Shared types, config, agent system
│   ├── gui/           # Electron + React desktop app
│   ├── tui/           # Terminal interface with Ink
│   └── phone/         # React Native companion app
├── turbo.json         # Turborepo configuration
├── package.json       # Root package.json
└── README.md
```

### Core Package (`@gobblecode/core`)
- Agent management system
- Configuration management
- Skills system
- Search integration
- Sound effects
- Online sync

### GUI Package (`@gobblecode/gui`)
- Electron main process
- React frontend with Tailwind CSS
- Framer Motion animations
- ReactFlow for agent graphs
- Mr. Gobble mascot

### TUI Package (`@gobblecode/tui`)
- Ink-based terminal interface
- Chat interface
- Agent management
- Settings configuration

### Phone Package (`@gobblecode/phone`)
- React Native with Expo
- Mobile companion app
- View agents and settings
- Quick actions

## 🎮 Mr. Gobble

Mr. Gobble is GobbleCode's mascot - a Pac-Man style character who munches through code!

- Click the floating Mr. Gobble button for quick settings
- Watch him WAKA WAKA with animated mouth
- See ghosts follow him around
- Hear his signature sound effects
- He's always there to gobble up your coding problems!

## ⚙️ Configuration

GobbleCode uses a JSON configuration file at `~/.config/gobblecode/gobblecode.json`:

```json
{
  "version": "0.1.0",
  "providers": {},
  "defaultProvider": "",
  "defaultModel": "",
  "theme": {
    "mode": "dark",
    "accentColor": "#FFD700",
    "fontFamily": "JetBrains Mono",
    "animationSpeed": "normal",
    "wavyIntensity": 50
  },
  "sound": {
    "enabled": true,
    "volume": 50,
    "effects": {}
  },
  "sync": {
    "enabled": false,
    "syncAgents": true,
    "syncModels": true,
    "syncSkills": true,
    "syncConfig": true
  },
  "browser": {
    "enabled": true,
    "defaultEngine": "firefox",
    "searchProviders": [],
    "autoSearch": true,
    "maxResults": 5
  }
}
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests for specific package
cd packages/core && npm run test
cd packages/gui && npm run test
cd packages/tui && npm run test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [OpenCode](https://github.com/anthropics/opencode)
- Built with React, Electron, and Ink
- Animations powered by Framer Motion
- Graph editor powered by ReactFlow
- Mr. Gobble inspired by Pac-Man

---

**Made with 🟡 by the GobbleCode Team**

*WAKA WAKA!* 🎮
