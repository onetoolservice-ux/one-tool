#!/bin/bash

echo "í» ï¸  Installing missing 'react-is' dependency..."

# Install react-is explicitly to satisfy recharts
npm install react-is

echo "âœ… 'react-is' installed."

# Add to git
git add package.json package-lock.json
git commit -m "fix: add explicit react-is dependency for recharts build"
git push

echo "í¾‰ Fix pushed! Check Vercel, the build should succeed now."
