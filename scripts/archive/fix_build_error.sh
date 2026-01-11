#!/bin/bash

echo "í»‘ Killing stuck server on port 3000..."
# Try multiple methods to ensure port 3000 is free
if command -v lsof >/dev/null; then
  lsof -ti:3000 | xargs kill -9 2>/dev/null
fi
if command -v fuser >/dev/null; then
  fuser -k 3000/tcp 2>/dev/null
fi
# Fallback for some systems
pkill -f "next-server" 2>/dev/null
pkill -f "next-router-worker" 2>/dev/null

echo "í´§ Patching ToolClient.tsx to remove invalid 'use()' hook..."
# We need to make ToolClient accept the plain object passed by page.tsx
# instead of trying to unwrap it as a Promise again.

TARGET_FILE="app/tools/[category]/[tool]/ToolClient.tsx"

# 1. Remove 'use' from imports
# We use a temporary file approach for cross-platform compatibility (Mac/Linux sed differences)
sed 's/import { use } from "react";//g' "$TARGET_FILE" > "$TARGET_FILE.tmp" && mv "$TARGET_FILE.tmp" "$TARGET_FILE"
sed 's/import { use, /import { /g' "$TARGET_FILE" > "$TARGET_FILE.tmp" && mv "$TARGET_FILE.tmp" "$TARGET_FILE"

# 2. Replace 'use(params)' with just 'params'
# Matches: const { tool, category } = use(params);  ->  const { tool, category } = params;
sed 's/= use(params)/= params/g' "$TARGET_FILE" > "$TARGET_FILE.tmp" && mv "$TARGET_FILE.tmp" "$TARGET_FILE"

# 3. Replace 'use(props.params)' with 'props.params'
sed 's/= use(props.params)/= props.params/g' "$TARGET_FILE" > "$TARGET_FILE.tmp" && mv "$TARGET_FILE.tmp" "$TARGET_FILE"

echo "âœ… ToolClient patched."

echo "í¿—ï¸  Running Production Build..."
npm run build

echo "íº€ Starting Production Server..."
npm run start
