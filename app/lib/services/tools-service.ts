/**
 * Tools Service (DEPRECATED - Use tools-fallback.ts instead)
 * 
 * ⚠️ WARNING: This service fetches from Supabase database.
 * 
 * For tools catalog, use frontend static data instead:
 * import { getAllTools, getToolById } from '@/app/lib/utils/tools-fallback';
 * 
 * Keep Supabase ONLY for user-specific data:
 * - User profiles
 * - User favorites
 * - User recents
 * - User tool data
 * 
 * Tools catalog is static and should NOT hit Supabase on every page load.
 */

import { createClient } from '@/app/lib/supabase/client';
import { logger } from '@/app/lib/utils/logger';

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
  created_at?: string;
  updated_at?: string;
}

/**
 * Convert database tool to app tool format
 */
function formatTool(tool: any): Tool {
  return {
    ...tool,
  };
}

/**
 * ⚠️ DEPRECATED: Fetch all tools from database
 * 
 * Use frontend static data instead:
 * import { getAllTools } from '@/app/lib/utils/tools-fallback';
 * 
 * This function is kept for backward compatibility but should not be used
 * for tools catalog (wastes Supabase quota).
 */
export async function getAllTools(): Promise<Tool[]> {
  logger.warn('getAllTools() from tools-service is deprecated. Use tools-fallback.ts instead.');
  
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      logger.error('Error fetching tools:', error);
      return [];
    }

    return (data || []).map(formatTool);
  } catch (error) {
    logger.error('Error fetching tools:', error);
    return [];
  }
}

/**
 * ⚠️ DEPRECATED: Fetch tool by ID from database
 * 
 * Use frontend static data instead:
 * import { getToolById } from '@/app/lib/utils/tools-fallback';
 */
export async function getToolById(id: string): Promise<Tool | null> {
  logger.warn('getToolById() from tools-service is deprecated. Use tools-fallback.ts instead.');
  
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Error fetching tool:', error);
      return null;
    }

    return data ? formatTool(data) : null;
  } catch (error) {
    logger.error('Error fetching tool:', error);
    return null;
  }
}

/**
 * ⚠️ DEPRECATED: Fetch tools by category from database
 * 
 * Use frontend static data instead:
 * import { getToolsByCategory } from '@/app/lib/utils/tools-fallback';
 */
export async function getToolsByCategory(category: string): Promise<Tool[]> {
  logger.warn('getToolsByCategory() from tools-service is deprecated. Use tools-fallback.ts instead.');
  
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('category', category)
      .order('name', { ascending: true });

    if (error) {
      logger.error('Error fetching tools by category:', error);
      return [];
    }

    return (data || []).map(formatTool);
  } catch (error) {
    logger.error('Error fetching tools by category:', error);
    return [];
  }
}

/**
 * ⚠️ DEPRECATED: Fetch popular tools from database
 * 
 * Use frontend static data instead:
 * import { getPopularTools } from '@/app/lib/utils/tools-fallback';
 */
export async function getPopularTools(): Promise<Tool[]> {
  logger.warn('getPopularTools() from tools-service is deprecated. Use tools-fallback.ts instead.');
  
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('popular', true)
      .order('name', { ascending: true });

    if (error) {
      logger.error('Error fetching popular tools:', error);
      return [];
    }

    return (data || []).map(formatTool);
  } catch (error) {
    logger.error('Error fetching popular tools:', error);
    return [];
  }
}
