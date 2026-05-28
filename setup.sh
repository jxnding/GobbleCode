#!/bin/bash
# GobbleCode Quick Start Script

set -e

echo "🦃 GobbleCode Quick Start"
echo "========================"
echo ""

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js 20+ is required. Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Build packages
echo ""
echo "🔨 Building packages..."
npm run build

# Run tests
echo ""
echo "🧪 Running tests..."
npm run test

echo ""
echo "✨ Setup complete!"
echo ""
echo "To start GobbleCode:"
echo "  GUI: npm run gui"
echo "  TUI: npm run tui"
echo ""
echo "🦃 Happy coding with GobbleCode!"
