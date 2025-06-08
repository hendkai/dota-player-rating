#!/bin/bash

# 📱 Dota Player Rating - Android App Builder
# This script automates the TWA (Trusted Web Activities) build process

echo "🚀 Starting Android App Build for Dota Player Rating..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="Dota Player Rating"
PACKAGE_NAME="app.netlify.dota_player_rating.twa"
WEBSITE_URL="https://dota-player-rating.netlify.app/"
OUTPUT_DIR="./android-build"

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js and npm are installed${NC}"

# Install PWA Builder CLI if not installed
if ! command -v pwa-builder &> /dev/null; then
    echo -e "${YELLOW}📦 Installing PWA Builder CLI...${NC}"
    npm install -g @pwabuilder/cli
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PWA Builder CLI installed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to install PWA Builder CLI${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ PWA Builder CLI is already installed${NC}"
fi

# Create output directory
echo -e "${BLUE}📁 Creating output directory...${NC}"
mkdir -p "$OUTPUT_DIR"

# Generate TWA
echo -e "${YELLOW}🏗️  Generating TWA (Trusted Web Activities)...${NC}"
echo "Website: $WEBSITE_URL"
echo "Package: $PACKAGE_NAME"
echo ""

cd "$OUTPUT_DIR"

# Generate the Android app
pwa-builder "$WEBSITE_URL" -p android

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ TWA generated successfully${NC}"
else
    echo -e "${RED}❌ Failed to generate TWA${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Android app build completed!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Open Android Studio"
echo "2. Import the generated project from: $OUTPUT_DIR"
echo "3. Build and test the APK"
echo "4. Generate signed AAB for Play Store"
echo ""
echo -e "${YELLOW}📱 For Play Store submission:${NC}"
echo "1. Create Google Play Console account (\$25)"
echo "2. Prepare app assets (icon, screenshots, descriptions)"
echo "3. Upload AAB file to Play Console"
echo "4. Fill out store listing"
echo "5. Submit for review"
echo ""
echo -e "${BLUE}📖 For detailed instructions, see: android-release-guide.md${NC}"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}" 