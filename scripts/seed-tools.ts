/**
 * Seed Tools Data Script
 * 
 * This script migrates tools from app/lib/tools-data.tsx to the Supabase database
 * 
 * Usage:
 * 1. Make sure DATABASE_SCHEMA.sql has been run in Supabase
 * 2. Set up environment variables in .env.local
 * 3. Run: npx ts-node scripts/seed-tools.ts
 * 
 * Note: You'll need the service role key for this script (or run it manually in Supabase dashboard)
 */

import { createClient } from '@supabase/supabase-js';

// Import the tools data
// Since we can't easily import TSX files, we'll need to extract the data
// For now, this is a reference implementation

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // You'll need to add this

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Map icon components to icon names (stored as strings in DB)
const iconNameMap: Record<string, string> = {
  'Wallet': 'Wallet',
  'Calculator': 'Calculator',
  'Lock': 'Lock',
  'Layers': 'Layers',
  'Image': 'Image',
  'Sparkles': 'Sparkles',
  'BrainCircuit': 'BrainCircuit',
  'FileText': 'FileText',
  'FileCode': 'FileCode',
  // Add more as needed
};

async function seedTools() {
  console.log('Starting tools seed...');
  
  // You'll need to extract the actual tool data from tools-data.tsx
  // For now, this is a template showing the structure
  
  const tools = [
    // Example structure - replace with actual data extraction
    {
      id: 'smart-budget',
      name: 'Budget Planner Pro',
      description: 'Track expenses and manage your budget',
      category: 'Finance',
      subcategory: 'Personal Finance',
      icon_name: 'Wallet',
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400',
      href: '/tools/finance/smart-budget',
      popular: true,
      status: 'Ready',
      metadata: {}
    },
    // ... add all tools
  ];

  try {
    // Insert tools (with conflict handling - upsert)
    const { data, error } = await supabase
      .from('tools')
      .upsert(tools, {
        onConflict: 'id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Error seeding tools:', error);
      return;
    }

    console.log(`✅ Successfully seeded ${tools.length} tools`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run if executed directly
if (require.main === module) {
  seedTools();
}

export { seedTools };
