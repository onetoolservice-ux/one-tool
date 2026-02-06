# SEO Quick Reference Guide

## 🚀 Quick Start

### 1. Configure Domain
```bash
# Add to .env.local or production
NEXT_PUBLIC_BASE_URL=https://onetool.co.in
```

### 2. Deploy
```bash
npm run build
npm start
```

### 3. Submit Sitemap
- Google Search Console: Submit `https://yourdomain.com/sitemap.xml`
- Bing Webmaster Tools: Submit sitemap

---

## 📁 File Structure

```
app/
├── lib/seo/
│   ├── metadata-generator.ts    # SEO metadata generation
│   └── internal-linking.ts      # Internal linking engine
├── components/seo/
│   └── ToolSEO.tsx              # SEO components
├── tools/
│   ├── [category]/
│   │   ├── page.tsx            # Category pages
│   │   └── [id]/
│   │       └── page.tsx        # Tool pages (SEO integrated)
├── sitemap.ts                   # Enhanced sitemap
└── robots.ts                    # Optimized robots.txt
```

---

## 🔧 Key Functions

### Metadata Generation
```typescript
import { generateSEOTitle, generateSEODescription } from '@/app/lib/seo/metadata-generator';

const title = generateSEOTitle(tool);
const description = generateSEODescription(tool);
```

### Internal Linking
```typescript
import { getRelatedTools } from '@/app/lib/seo/internal-linking';

const related = getRelatedTools(tool, { maxLinks: 6 });
```

### Schema Generation
```typescript
import { generateToolSchema, generateFAQSchema } from '@/app/lib/seo/metadata-generator';

const schema = generateToolSchema(tool);
const faqs = generateFAQSchema(tool);
```

---

## ✅ Automatic SEO Per Tool

Every tool automatically gets:

1. **Metadata**
   - Title tag
   - Meta description
   - Keywords
   - Open Graph
   - Twitter Card

2. **Structured Data**
   - SoftwareApplication schema
   - FAQ schema
   - Breadcrumb schema

3. **Internal Links**
   - Related tools
   - Category links
   - Popular tools

4. **Sitemap**
   - Automatic inclusion
   - Priority assignment

---

## 🧪 Testing

### Validate Structured Data
```
https://search.google.com/test/rich-results
```

### Check Sitemap
```
https://yourdomain.com/sitemap.xml
```

### Check Robots.txt
```
https://yourdomain.com/robots.txt
```

---

## 📊 Monitoring

### Google Search Console
- Submit sitemap
- Monitor indexing
- Check performance
- Review errors

### Key Metrics
- Organic traffic
- Keyword rankings
- Click-through rate
- Index coverage

---

## 🐛 Troubleshooting

### Pages Not Indexing?
1. Check robots.txt
2. Verify sitemap submission
3. Request indexing in Search Console

### Schema Errors?
1. Use Rich Results Test
2. Check JSON-LD syntax
3. Verify required fields

### Low Rankings?
1. Check page speed
2. Verify metadata quality
3. Analyze competitor pages

---

## 📚 Full Documentation

- **Architecture**: `SEO_ARCHITECTURE.md`
- **Implementation**: `SEO_IMPLEMENTATION_CHECKLIST.md`
- **Summary**: `SEO_SUMMARY.md`

---

## 💡 Pro Tips

1. **Monitor Regularly**: Check Search Console weekly
2. **Test Schemas**: Validate before major releases
3. **Track Performance**: Use analytics to measure impact
4. **Iterate**: Refine based on data

---

## 🎯 Remember

- ✅ System is automatic - new tools inherit SEO
- ✅ Scales to 500+ tools without changes
- ✅ No manual work per tool required
- ✅ Platform-first approach (like Wikipedia)

**Set it and forget it!** 🚀
