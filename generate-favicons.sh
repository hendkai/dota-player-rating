#!/bin/bash

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick is not installed. Please install it first."
    echo "On Arch Linux: sudo pacman -S imagemagick"
    exit 1
fi

# Create favicons directory if it doesn't exist
mkdir -p favicons

# Convert SVG to different PNG sizes
echo "Generating favicons..."

# Basic favicons
convert -background none -size 16x16 assets/favicon.svg favicons/favicon-16x16.png
convert -background none -size 32x32 assets/favicon.svg favicons/favicon-32x32.png

# Apple Touch Icon
convert -background none -size 180x180 assets/favicon.svg favicons/apple-touch-icon.png

# Android Chrome Icons
convert -background none -size 192x192 assets/favicon.svg favicons/android-chrome-192x192.png
convert -background none -size 512x512 assets/favicon.svg favicons/android-chrome-512x512.png

# Generate ICO file (contains multiple sizes)
convert -background none favicons/favicon-16x16.png favicons/favicon-32x32.png favicons/favicon.ico

echo "Favicons generated successfully in the favicons directory!"

# Move files to root directory
mv favicons/* .
rmdir favicons

echo "Favicons moved to root directory." 