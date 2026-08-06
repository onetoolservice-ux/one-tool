/**
 * Tools Helper Utilities
 * 
 * Helper functions for working with static tools data
 * No database calls - all data is frontend-only
 */

import { ALL_TOOLS } from '@/app/lib/tools-data';

/**
 * Extract icon name from React component
 */
export function getIconNameFromComponent(iconComponent: any): string | null {
  if (!iconComponent) return null;
  
  // Try different ways to get the component name
  const name = iconComponent.displayName || 
               iconComponent.name || 
               iconComponent.type?.displayName ||
               iconComponent.type?.name ||
               null;
  
  if (name) {
    // Map common variations
    const nameMap: Record<string, string> = {
      'FileText': 'FileText',
      'Shield': 'Shield',
      'User': 'User',
      'Home': 'Home',
      'Wallet': 'Wallet',
      'Calculator': 'Calculator',
      'TrendingUp': 'TrendingUp',
      'Landmark': 'Landmark',
      'Briefcase': 'Briefcase',
      'RefreshCw': 'RefreshCw',
      'Layers': 'Layers',
      'ScanLine': 'ScanLine',
      'Minimize': 'Minimize',
      'Scissors': 'Scissors',
      'FileSpreadsheet': 'FileSpreadsheet',
      'FileType': 'FileType',
      'Globe': 'Globe',
      'Key': 'Key',
      'Braces': 'Braces',
      'Database': 'Database',
      'Clock': 'Clock',
      'Terminal': 'Terminal',
      'Code2': 'Code2',
      'Link': 'Link',
      'Hash': 'Hash',
      'Binary': 'Binary',
      'Calendar': 'Calendar',
      'QrCode': 'QrCode',
      'Lock': 'Lock',
      'Timer': 'Timer',
      'ArrowRightLeft': 'ArrowRightLeft',
      'Type': 'Type',
      'Pipette': 'Pipette',
      'Scale': 'Scale',
      'Wind': 'Wind',
      'Dumbbell': 'Dumbbell',
      'Sparkles': 'Sparkles',
      'BrainCircuit': 'BrainCircuit',
      'Image': 'Image',
      'Table': 'Table',
      'Percent': 'Percent',
      'Check': 'Check',
      'Split': 'Split',
      'Grid': 'Grid',
      'Laptop': 'Laptop',
      'FileCode': 'FileCode',
    };
    
    return nameMap[name] || name;
  }
  
  return null;
}

/**
 * Get tool by ID from static data
 */
export function getToolByIdStatic(id: string) {
  return ALL_TOOLS.find(t => t.id === id) || null;
}

/**
 * Get tools by category from static data
 */
export function getToolsByCategoryStatic(category: string) {
  return ALL_TOOLS.filter(t => t.category === category);
}

/**
 * Get all tools from static data
 */
export function getAllToolsStatic() {
  return ALL_TOOLS;
}
