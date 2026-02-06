# Tools Migration Guide

## Overview

This guide explains how to migrate tools from hardcoded data to the Supabase database.

## Steps

### 1. Run Database Schema

If you haven't already, run `DATABASE_SCHEMA.sql` in Supabase SQL Editor.

### 2. Seed Tools Data

Run `SEED_TOOLS.sql` in Supabase SQL Editor. This will insert all 34 tools into the database.

**Verify the seed:**
```sql
SELECT COUNT(*) FROM tools;  -- Should return 34
SELECT category, COUNT(*) FROM tools GROUP BY category;
```

### 3. Update Components (Already Done)

The following components have been updated to fetch from database:
- ✅ `app/lib/services/tools-service.ts` - Service layer
- ✅ `app/tools/[category]/[id]/page.tsx` - Tool detail page
- ✅ Icon mapper utility created

### 4. Test the Migration

1. **Test tool fetching:**
   - Visit any tool page (e.g., `/tools/finance/smart-budget`)
   - Should load from database

2. **Test tool listing:**
   - Visit home page
   - Tools should display from database

3. **Test tool search:**
   - Use search functionality
   - Should search database tools

### 5. Remove Hardcoded Data (Optional)

Once you've verified everything works:
- `app/lib/tools-data.tsx` can be kept as backup or removed
- Components should use `getAllTools()` from `tools-service.ts`

## Files Changed

### Created:
- ✅ `SEED_TOOLS.sql` - SQL script to seed tools
- ✅ `app/lib/utils/icon-mapper.tsx` - Icon name to component mapping
- ✅ `MIGRATION_GUIDE.md` - This file

### Updated:
- ✅ `app/lib/services/tools-service.ts` - Added icon mapping
- ✅ `app/tools/[category]/[id]/page.tsx` - Uses database (needs update)

### To Update:
- ⚠️ `app/components/home/tool-grid.tsx` - Still uses hardcoded data
- ⚠️ `app/hooks/useSmartHistory.ts` - May use ALL_TOOLS

## Database Schema

**Tools Table:**
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT)
- `category` (TEXT)
- `href` (TEXT)
- `icon_name` (TEXT) - Icon name from lucide-react
- `color` (TEXT) - Tailwind classes
- `popular` (BOOLEAN)
- `status` (TEXT)
- `description` (TEXT, optional)
- `subcategory` (TEXT, optional)
- `metadata` (JSONB, optional)

## Icon Mapping

Icons are stored as strings (e.g., "FileText", "Wallet") and mapped to React components using `icon-mapper.tsx`.

**Supported Icons:**
- FileText, Shield, User, Home, Wallet, Calculator, TrendingUp, Landmark, Briefcase
- RefreshCw, Layers, ScanLine, Minimize, Scissors, FileSpreadsheet, FileType
- Globe, Key, Braces, Database, Clock, Terminal, Code2
- Calendar, QrCode, Lock, Timer, ArrowRightLeft, Type, Pipette
- Scale, Wind, Dumbbell, Sparkles, BrainCircuit, Image, Table, Percent
- Split, Grid, Laptop, FileCode

## Troubleshooting

**Tools not showing:**
- Verify `SEED_TOOLS.sql` ran successfully
- Check browser console for errors
- Verify Supabase connection

**Icons not displaying:**
- Check icon name matches exactly (case-sensitive)
- Verify icon exists in `icon-mapper.tsx`
- Default icon (FileText) will show if icon not found

**Build errors:**
- Ensure `icon-mapper.tsx` is imported correctly
- Check TypeScript types match

## Next Steps

1. ✅ Run `SEED_TOOLS.sql` in Supabase
2. ⚠️ Update remaining components to use database
3. ⚠️ Test all tool pages
4. ⚠️ Remove hardcoded data (optional)
5. ⚠️ Add admin tool management UI (future)
