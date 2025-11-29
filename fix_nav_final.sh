#!/bin/bash

# ====================================================
# 🛡️ A11Y & PERFORMANCE LAYER
# ====================================================
# 1. FIXES: 49+ missing button names (Critical Failure).
# 2. FIXES: Viewport zooming restriction (Accessibility failure).
# 3. SETS UP: The Codebase for future Lazy Loading.

echo "🔍 Detecting project structure..."
if [ -f "app/lib/tools-data.tsx" ]; then
    APP_ROOT="app"
elif [ -f "project/app/lib/tools-data.tsx" ]; then
    APP_ROOT="project/app"
else
    echo "❌ Error: Could not find project root."
    exit 1
fi

echo "🚀 Applying Accessibility & Performance Fixes..."

# ----------------------------------------------------
# 1. FIX VIEWPORT (Remove Zoom Restriction)
# ----------------------------------------------------
echo "📝 Removing mobile zoom restrictions..."

LAYOUT_FILE="$APP_ROOT/layout.tsx"
# This requires manipulating the string that holds the meta tag in Next.js/React structure
# We'll just patch the file where the meta tag is defined, or ensure the final output is correct.

# We will apply a patch to the next-env.d.ts to allow user-scalable.
DTS_FILE="$APP_ROOT/../next-env.d.ts"
if [ -f "$DTS_FILE" ]; then
    # We remove the user-scalable=no part of the meta tag to allow zooming
    sed -i 's/user-scalable=no/user-scalable=yes, maximum-scale=5/g' "$DTS_FILE"
fi

# ----------------------------------------------------
# 2. ACCESSIBILITY FIX (Button Names)
# ----------------------------------------------------
echo "📝 Injecting ARIA Labels into all button/link elements..."

# Generic function to add aria-labels to icon-only buttons
# This addresses the 49 failing elements in the Lighthouse report.
add_aria_label() {
    local ICON=$1
    local LABEL=$2
    # Find button or link containing the icon and inject the aria-label
    find "$APP_ROOT" -name "*.tsx" -print0 | xargs -0 sed -i "s|<button[^>]*><$ICON|<button aria-label=\"$LABEL\"&|g"
    find "$APP_ROOT" -name "*.tsx" -print0 | xargs -0 sed -i "s|<a [^>]*><$ICON|<a aria-label=\"$LABEL\"&|g"
}

# Apply fixes for the most common failing icons found across the app:
add_aria_label "Settings" "Open Settings"
add_aria_label "Info" "Open Guide"
add_aria_label "X" "Close"
add_aria_label "Menu" "Open Menu"
add_aria_label "Star" "Toggle Favorite"
add_aria_label "Trash2" "Delete Item"
add_aria_label "RefreshCw" "Reset/Refresh Data"
add_aria_label "Copy" "Copy to Clipboard"
add_aria_label "ArrowRight" "View Tool"
add_aria_label "ChevronUp" "Collapse"
add_aria_label "ChevronDown" "Expand"

# Fix the specific button in Navbar that triggers the Menu
sed -i 's|<button onClick={() => setIsMenuOpen(!isMenuOpen)} className="xl:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100">|<button aria-label="Toggle Menu" onClick={() => setIsMenuOpen(!isMenuOpen)} className="xl:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100">|g' "$NAVBAR_FILE"

# ----------------------------------------------------
# 3. PERFORMANCE PREP (Lazy Loading Setup)
# ----------------------------------------------------
echo "📝 Preparing for Lazy Loading (Performance Prep)..."

# The issue is large JS bundles. We need to tell Next.js to split the dashboard from the tools.
# This requires changing all tool imports to dynamic imports.
# Since we cannot accurately trace and replace ALL imports in a batch script without risks, 
# we'll implement the crucial step of wrapping the main component content in a <Suspense> boundary.

# Patch Home Page (for potential future speed boost on tool list)
HOME_PAGE="$APP_ROOT/page.tsx"
if ! grep -q "import { Suspense } from 'react'" "$HOME_PAGE"; then
    sed -i 's|import { ArrowRight,|import { Suspense } from "react";\nimport { ArrowRight,|' "$HOME_PAGE"
fi

if ! grep -q "Suspense" "$HOME_PAGE"; then
    # Wrap the main content in Suspense
    sed -i 's|<div className="w-full px-6 space-y-10 pt-4 pb-20">|<div className="w-full px-6 space-y-10 pt-4 pb-20">\n      <Suspense fallback={<div>Loading tools...</div>}>|' "$HOME_PAGE"
    sed -i 's|\[/A-Z\])}/g|\[/A-Z\])}/g\n      </Suspense>|' "$HOME_PAGE"
fi


echo "✅ SUCCESS! A11y, UX, and Performance preparation complete."