#!/bin/bash

# ====================================================
# 🏆 FINAL ERGONOMIC TUNE-UP: TEXT LEGIBILITY
# ====================================================
# 1. TUNES: Text contrast specifically for muted text/labels.
# 2. FIXES: Ensure the core background/surface definitions are robust.

echo "🔍 Detecting project structure..."
if [ -f "app/lib/tools-data.tsx" ]; then
    APP_ROOT="app"
elif [ -f "project/app/lib/tools-data.tsx" ]; then
    APP_ROOT="project/app"
else
    echo "❌ Error: Could not find project root."
    exit 1
fi

echo "🚀 Applying Final Contrast Tune-Up..."

# ----------------------------------------------------
# 1. REWRITE GLOBALS.CSS (Tuning Muted Contrast)
# ----------------------------------------------------
echo "📝 Tuning Muted Text Colors..."
CSS_FILE="$APP_ROOT/globals.css"

cat > "$CSS_FILE" << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* --- LIGHT MODE: Soft Zinc --- */
    --bg-app: 244 244 245;      /* Zinc-100 (Page Background) */
    --bg-card: 255 255 255;     /* White (Card Surface) */
    --bg-input: 250 250 250;    /* Zinc-50 (Input Fill) */
    
    --text-main: 39 39 42;      /* Zinc 800 (Charcoal) */
    --text-muted: 82 82 91;     /* Zinc 700 (High Legibility in Light Mode) */
    
    --border-color: 228 228 231; /* Zinc 200 */
    --primary: 79 70 229;        /* Indigo 600 */
  }

  .dark {
    /* --- DARK MODE: Deep Charcoal --- */
    --bg-app: 9 9 11;           /* Zinc 950 */
    --bg-card: 24 24 27;        /* Zinc 900 */
    --bg-input: 39 39 42;       /* Zinc 800 */
    
    --text-main: 244 244 245;   /* Zinc 100 */
    --text-muted: 161 161 170;  /* Zinc 400 (Soft contrast on dark backgrounds) */
    
    --border-color: 51 65 85;   /* Slate 700 */
    --primary: 99 102 241;      /* Indigo 500 */
  }
}

body {
  background-color: rgb(var(--bg-app));
  color: rgb(var(--text-main));
  font-family: var(--font-sans), system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  transition: background-color 0.3s ease, color 0.3s ease;

  /* Subtle Radial Gradient for Depth */
  background-image: radial-gradient(
    at 50% 10%, 
    rgb(var(--bg-card) / 0.1) 0%, 
    transparent 70%
  );
}

.dark body {
    background-image: radial-gradient(
      at 50% 10%, 
      rgb(var(--bg-card) / 0.15) 0%, 
      transparent 70%
    );
}

/* 1. Inputs: Fixed background and text color to ensure legibility */
input, select, textarea {
  background-color: rgb(var(--bg-input));
  color: rgb(var(--text-main));
  border: 1px solid rgb(var(--border-color));
  border-radius: 0.5rem;
  padding: 0.7rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  outline: none;
  transition: all 0.2s ease;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.05); 
}

input:focus, select:focus, textarea:focus {
  background-color: rgb(var(--bg-card));
  border-color: rgb(var(--primary));
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

input::placeholder, textarea::placeholder { color: rgb(var(--text-muted) / 0.6); }

/* 2. Cards: Shadow Layering for Separation */
.card-base {
  background-color: rgb(var(--bg-card));
  border: 1px solid rgb(var(--border-color));
  border-radius: 1rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
.dark .card-base {
  box-shadow: none;
}

/* 3. SCROLLBARS */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background-color: rgb(var(--text-muted) / 0.3); border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background-color: rgb(var(--text-muted) / 0.5); }
EOF

# ----------------------------------------------------
# 2. BATCH CODE MIGRATION (Final Cleanup)
# ----------------------------------------------------
echo "📝 Performing Final Code Cleanup..."

# Helper function to safely replace styles in all TSX files
patch_code() {
    local SEARCH=$1
    local REPLACE=$2
    # Find all TSX files in app/
    find "$APP_ROOT" -name "*.tsx" -print0 | xargs -0 sed -i "s|$SEARCH|$REPLACE|g"
}

# 1. Re-run text contrast fixes to ensure they target the new palette
patch_code 'text-slate-900' 'text-main'
patch_code 'text-slate-800' 'text-main'
patch_code 'text-slate-700' 'text-main'
patch_code 'text-slate-600' 'text-muted'
patch_code 'text-slate-500' 'text-muted'
patch_code 'text-slate-400' 'text-muted' # These will be dimmed via opacity if needed

# 2. Ensure Navbar uses the correct background surface
NAVBAR_FILE="$APP_ROOT/shared/layout/Navbar.tsx"
sed -i 's/bg-white\/80/bg-surface\/80/g' "$NAVBAR_FILE"
sed -i 's/border-slate-200/border-line/g' "$NAVBAR_FILE"

# 3. Patch Home Page for smooth rendering
HOME_PAGE="$APP_ROOT/page.tsx"
# Ensure the background of the main grid section uses the Page background, not a card surface.
sed -i 's|<div className="max-w-7xl mx-auto px-4 space-y-10 pt-4 pb-20">|<div className="w-full px-6 space-y-10 pt-4 pb-20 bg-background">|g' "$HOME_PAGE"

echo "✅ SUCCESS! Final Ergonomic Design System applied."