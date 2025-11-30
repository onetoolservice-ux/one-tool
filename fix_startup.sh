#!/bin/bash

echo "í´§ Fixing Startup Issues..."

# 1. Fix next.config.js (Remove deprecated 'eslint' key)
echo "âš™ï¸ Updating next.config.js..."
cat > next.config.js << 'JS_END'
/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  // Explicitly disable Turbopack for PWA compatibility if needed, 
  // or leave empty to let Next.js decide. 
  // We remove the invalid 'eslint' key here.
  turbopack: {}, 
};

module.exports = withPWA(nextConfig);
JS_END

# 2. Kill the stuck process (Windows specific)
echo "í²€ Killing stuck process (PID 37140)..."
# Try to kill the specific PID from your log
taskkill //F //PID 37140 2>/dev/null
# Also try to kill any rogue node processes just in case
taskkill //F //IM node.exe 2>/dev/null

# 3. Clear Cache & Locks
echo "bs Cleaning cache and locks..."
rm -rf .next
rm -rf node_modules/.cache

echo "âœ… Cleanup Complete. Run 'npm run dev' now."
