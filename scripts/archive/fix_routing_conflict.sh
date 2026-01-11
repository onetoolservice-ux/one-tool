#!/bin/bash

echo "í·¹ Cleaning up conflicting category pages..."

# These files are obsolete and cause the "Objects are not valid" error
# because they conflict with the new [category]/page.tsx dynamic route.

rm -f app/tools/finance/page.tsx
rm -f app/tools/documents/page.tsx
rm -f app/tools/health/page.tsx
rm -f app/tools/developer/page.tsx
rm -f app/tools/design/page.tsx
rm -f app/tools/productivity/page.tsx
rm -f app/tools/converters/page.tsx

echo "âœ… Conflicts removed. The dynamic [category] page will now handle routing."
echo "í´„ Please restart your server: 'npm run dev'"
