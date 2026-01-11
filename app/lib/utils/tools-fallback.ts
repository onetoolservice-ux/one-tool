/**
 * Tools Data Fallback Utility
 * 
 * Provides static tools data from frontend (no database calls)
 * Use this for tool catalog - static data doesn't need Supabase
 * 
 * Keep Supabase ONLY for:
 * - User-specific data (favorites, recents, user_profiles)
 * - Tool usage analytics (if needed)
 * - Admin-managed tool metadata (if needed in future)
 */

import { ALL_TOOLS } from '@/app/lib/tools-data';
import { getIconNameFromComponent } from './tools-helper';

export interface Tool {
  id: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  icon_name?: string;
  color?: string;
  href: string;
  popular: boolean;
  status: string;
  metadata?: Record<string, any>;
}

/**
 * Get all tools from static frontend data
 * No database call - instant, no rate limits
 */
export function getAllTools(): Tool[] {
  return ALL_TOOLS.map(tool => ({
    id: tool.id,
    name: tool.name,
    description: tool.desc || tool.description,
    category: tool.category,
    href: tool.href,
    icon_name: getIconNameFromComponent(tool.icon),
    color: tool.color,
    popular: tool.popular || false,
    status: 'Active',
  }));
}

/**
 * Get tool by ID from static data
 */
export function getToolById(id: string): Tool | null {
  const tool = ALL_TOOLS.find(t => t.id === id);
  if (!tool) return null;

  return {
    id: tool.id,
    name: tool.name,
    description: tool.desc || tool.description,
    category: tool.category,
    href: tool.href,
    icon_name: getIconNameFromComponent(tool.icon),
    color: tool.color,
    popular: tool.popular || false,
    status: 'Active',
  };
}

/**
 * Get tools by category from static data
 */
export function getToolsByCategory(category: string): Tool[] {
  return ALL_TOOLS
    .filter(tool => tool.category === category)
    .map(tool => ({
      id: tool.id,
      name: tool.name,
      description: tool.desc || tool.description,
      category: tool.category,
      href: tool.href,
      icon_name: getIconNameFromComponent(tool.icon),
      color: tool.color,
      popular: tool.popular || false,
      status: 'Active',
    }));
}

/**
 * Get popular tools from static data
 */
export function getPopularTools(): Tool[] {
  return ALL_TOOLS
    .filter(tool => tool.popular)
    .map(tool => ({
      id: tool.id,
      name: tool.name,
      description: tool.desc || tool.description,
      category: tool.category,
      href: tool.href,
      icon_name: getIconNameFromComponent(tool.icon),
      color: tool.color,
      popular: true,
      status: 'Active',
    }));
}

/**
 * Search tools by query
 */
export function searchTools(query: string): Tool[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return getAllTools();

  return ALL_TOOLS
    .filter(tool => {
      const nameMatch = tool.name.toLowerCase().includes(lowerQuery);
      const descMatch = (tool.desc || '').toLowerCase().includes(lowerQuery);
      const categoryMatch = tool.category.toLowerCase().includes(lowerQuery);
      return nameMatch || descMatch || categoryMatch;
    })
    .map(tool => ({
      id: tool.id,
      name: tool.name,
      description: tool.desc || tool.description,
      category: tool.category,
      href: tool.href,
      icon_name: getIconNameFromComponent(tool.icon),
      color: tool.color,
      popular: tool.popular || false,
      status: 'Active',
    }));
}
