#!/bin/bash

echo "í» ï¸  Creating .npmrc to fix Vercel dependency conflict..."

# Create the .npmrc file in the root
# This tells npm to ignore the React version mismatch for react-quill
echo "legacy-peer-deps=true" > .npmrc

# Verify content
cat .npmrc

echo "âœ… .npmrc created."
echo "íº€ Pushing fix to Git..."

# Add, commit, and push
git add .npmrc
git commit -m "fix: add .npmrc to resolve react-quill dependency conflict"
git push

echo "í¾‰ Fix pushed! Check your Vercel dashboard, a new build should start automatically and succeed."
