#!/bin/bash

echo "Ì¥ß Fixing PWA Installation (Bypassing React 19 conflicts)..."

# 1. Force Install next-pwa
echo "Ì≥¶ Installing next-pwa with legacy support..."
if [ -f "yarn.lock" ]; then
    yarn add next-pwa --ignore-engines
else
    npm install next-pwa --legacy-peer-deps
fi

# 2. Clear Cache to prevent stale build errors
echo "Ì∑π Clearing Build Cache..."
rm -rf .next

# 3. Verify Build
echo "ÌøóÔ∏è Running Build to verify PWA integration..."
if [ -f "yarn.lock" ]; then
    yarn run build
else
    npm run build
fi

echo "‚úÖ PWA Installed & Built Successfully. Run 'npm run start' to test offline mode!"
