#!/bin/bash

echo "í¾¨ Initializing OneTool Enterprise UI Upgrade..."

# 1. Create the Theme Configuration Engine
# This centralizes all color logic so we can change it easily later.
cat > app/lib/theme-config.ts << 'THEME_EOF'
export type ToolCategory = 'finance' | 'developer' | 'health' | 'documents' | 'converters' | 'ai' | 'design' | 'productivity' | 'writing' | 'default';

export const THEME_CONFIG: Record<ToolCategory, {
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
  bgGradient: string;
  iconBg: string;
  border: string;
}> = {
  finance: {
    primary: "text-blue-600 dark:text-blue-400",
    secondary: "text-emerald-600 dark:text-emerald-400",
    accent: "bg-blue-100 dark:bg-blue-900/30",
    gradient: "from-blue-600 to-emerald-500",
    bgGradient: "from-blue-50/50 via-white to-emerald-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-blue-500 to-emerald-500",
    border: "group-hover:border-blue-500/50 dark:group-hover:border-blue-400/50",
  },
  developer: {
    primary: "text-violet-600 dark:text-violet-400",
    secondary: "text-fuchsia-600 dark:text-fuchsia-400",
    accent: "bg-violet-100 dark:bg-violet-900/30",
    gradient: "from-violet-600 to-fuchsia-500",
    bgGradient: "from-violet-50/50 via-white to-fuchsia-50/50 dark:from-gray-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-violet-500 to-fuchsia-500",
    border: "group-hover:border-violet-500/50 dark:group-hover:border-violet-400/50",
  },
  health: {
    primary: "text-teal-600 dark:text-teal-400",
    secondary: "text-orange-500 dark:text-orange-400",
    accent: "bg-teal-100 dark:bg-teal-900/30",
    gradient: "from-teal-500 to-orange-400",
    bgGradient: "from-teal-50/50 via-white to-orange-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-teal-400 to-orange-400",
    border: "group-hover:border-teal-500/50 dark:group-hover:border-teal-400/50",
  },
  documents: {
    primary: "text-slate-700 dark:text-slate-300",
    secondary: "text-indigo-600 dark:text-indigo-400",
    accent: "bg-slate-100 dark:bg-slate-800",
    gradient: "from-slate-700 to-indigo-600",
    bgGradient: "from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-slate-600 to-indigo-500",
    border: "group-hover:border-indigo-500/50 dark:group-hover:border-indigo-400/50",
  },
  converters: {
    primary: "text-amber-600 dark:text-amber-400",
    secondary: "text-rose-600 dark:text-rose-400",
    accent: "bg-amber-100 dark:bg-amber-900/30",
    gradient: "from-amber-500 to-rose-500",
    bgGradient: "from-amber-50/50 via-white to-rose-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-amber-500 to-rose-500",
    border: "group-hover:border-amber-500/50 dark:group-hover:border-amber-400/50",
  },
  ai: {
    primary: "text-indigo-600 dark:text-indigo-400",
    secondary: "text-purple-600 dark:text-purple-400",
    accent: "bg-indigo-100 dark:bg-indigo-900/30",
    gradient: "from-indigo-600 via-purple-600 to-pink-500",
    bgGradient: "from-indigo-50/50 via-white to-purple-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500",
    border: "group-hover:border-indigo-500/50 dark:group-hover:border-indigo-400/50",
  },
  design: {
    primary: "text-pink-600 dark:text-pink-400",
    secondary: "text-rose-600 dark:text-rose-400",
    accent: "bg-pink-100 dark:bg-pink-900/30",
    gradient: "from-pink-500 to-rose-500",
    bgGradient: "from-pink-50/50 via-white to-rose-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-pink-500 to-rose-500",
    border: "group-hover:border-pink-500/50 dark:group-hover:border-pink-400/50",
  },
  productivity: {
    primary: "text-sky-600 dark:text-sky-400",
    secondary: "text-cyan-600 dark:text-cyan-400",
    accent: "bg-sky-100 dark:bg-sky-900/30",
    gradient: "from-sky-500 to-cyan-500",
    bgGradient: "from-sky-50/50 via-white to-cyan-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-sky-500 to-cyan-500",
    border: "group-hover:border-sky-500/50 dark:group-hover:border-sky-400/50",
  },
  writing: {
    primary: "text-gray-700 dark:text-gray-300",
    secondary: "text-gray-900 dark:text-white",
    accent: "bg-gray-100 dark:bg-gray-800",
    gradient: "from-gray-700 to-gray-900",
    bgGradient: "from-gray-50 via-white to-gray-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
    iconBg: "bg-gradient-to-br from-gray-600 to-gray-800",
    border: "group-hover:border-gray-400/50 dark:group-hover:border-gray-500/50",
  },
  default: {
    primary: "text-slate-900 dark:text-white",
    secondary: "text-slate-600 dark:text-slate-400",
    accent: "bg-slate-100 dark:bg-slate-800",
    gradient: "from-slate-900 to-slate-700",
    bgGradient: "from-white to-slate-50 dark:from-slate-950 dark:to-slate-900",
    iconBg: "bg-slate-900",
    border: "group-hover:border-slate-300 dark:group-hover:border-slate-700",
  },
};

export function getTheme(category: string) {
  const normalizedCategory = category?.toLowerCase() as ToolCategory;
  return THEME_CONFIG[normalizedCategory] || THEME_CONFIG.default;
}
THEME_EOF

echo "âœ¨ Creating Dynamic Background Component..."

# 2. Create the Dynamic Background Component
mkdir -p app/components/layout
cat > app/components/layout/DynamicBackground.tsx << 'BG_EOF'
"use client";

import { usePathname } from "next/navigation";
import { getTheme } from "@/app/lib/theme-config";
import { useEffect, useState } from "react";

export default function DynamicBackground() {
  const pathname = usePathname();
  const [category, setCategory] = useState("default");

  useEffect(() => {
    if (!pathname) return;
    
    // Extract category from URL (e.g., /tools/finance/smart-budget -> finance)
    const parts = pathname.split("/");
    if (parts[1] === "tools" && parts[2]) {
      setCategory(parts[2]);
    } else {
      setCategory("default");
    }
  }, [pathname]);

  const theme = getTheme(category);

  return (
    <div className="fixed inset-0 -z-50 transition-all duration-1000 ease-in-out">
      <div className={"absolute inset-0 bg-gradient-to-br " + theme.bgGradient} />
      
      {/* Optional: Ambient Mesh Gradients for extra 'Enterprise' feel */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 opacity-50" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 opacity-50" />
    </div>
  );
}
BG_EOF

echo "í³ Upgrading Tool Cards to 'Enterprise Glassmorphism'..."

# 3. Update ToolTile.tsx to use the new Theme Engine
# This applies the colorful borders, hover effects, and gradients.
cat > app/shared/ToolTile.tsx << 'TILE_EOF'
import Link from "next/link";
import * as Icons from "lucide-react";
import { getTheme } from "@/app/lib/theme-config";

interface Tool {
  id: string;
  title: string;
  desc: string;
  icon: string;
  category: string;
  href?: string;
}

export default function ToolTile({ tool }: { tool: Tool }) {
  const IconComponent = (Icons as any)[tool.icon] || Icons.Wrench;
  const theme = getTheme(tool.category);
  const href = tool.href || \`/tools/\${tool.category}/\${tool.id}\`;

  return (
    <Link 
      href={href} 
      className="group relative block h-full"
    >
      {/* Card Container with Glassmorphism and Theme-based Border */}
      <article className={\`
        relative h-full p-6 rounded-2xl
        bg-white/80 dark:bg-slate-900/80 
        backdrop-blur-sm
        border border-slate-200 dark:border-slate-800
        shadow-sm hover:shadow-xl transition-all duration-300 ease-out
        hover:-translate-y-1
        \${theme.border}
      \`}>
        
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          {/* Icon with Gradient Background */}
          <div className={\`
            p-3 rounded-xl text-white shadow-md
            transform group-hover:scale-110 transition-transform duration-300
            \${theme.iconBg}
          \`}>
            <IconComponent className="w-6 h-6" />
          </div>

          {/* Arrow Icon (Hidden by default, slides in on hover) */}
          <div className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-slate-400">
            <Icons.ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r \${theme.gradient} transition-colors">
            {tool.title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {tool.desc}
          </p>
        </div>

        {/* Bottom Highlight Bar (Decorative) */}
        <div className={\`
          absolute bottom-0 left-6 right-6 h-1 rounded-t-full opacity-0 
          group-hover:opacity-100 transition-opacity duration-300
          bg-gradient-to-r \${theme.gradient}
        \`} />
      </article>
    </Link>
  );
}
TILE_EOF

echo "í´— Integrating Dynamic Background into Layout..."

# 4. Inject DynamicBackground into Root Layout
# Using a temporary file to safely insert the import and component
LAYOUT_FILE="app/layout.tsx"

# Check if DynamicBackground is already imported to avoid duplicates
if ! grep -q "DynamicBackground" "$LAYOUT_FILE"; then
  # Add import
  sed -i '1i import DynamicBackground from "@/app/components/layout/DynamicBackground";' "$LAYOUT_FILE"
  
  # Insert component inside body, before children
  # This sed command looks for <body ...> and appends the component after it
  # Note: This is a simplified insertion. You might need to manually check layout.tsx if this fails.
  sed -i '/<body/a \        <DynamicBackground />' "$LAYOUT_FILE"
fi

echo "âœ… Phase 1 Upgrade Complete!"
echo "í±‰ Run 'npm run dev' to see the new Colorful Cards and Dynamic Backgrounds."
