# Translation Guide - Manual Management

## Overview
Simple, manual translation system using local JSON files. Perfect for small projects with limited translation keys (~85 keys).

## How It Works

### Translation Files
All translations are stored in `messages/[locale].json`:
- `messages/en.json` - English (source)
- `messages/es.json` - Spanish
- `messages/fr.json` - French
- `messages/de.json` - German
- `messages/hi.json` - Hindi
- `messages/zh.json` - Chinese
- `messages/ja.json` - Japanese

### Structure
```json
{
  "common": {
    "appName": "One Tool Solutions",
    "description": "Your all-in-one productivity suite"
  },
  "unitConverter": {
    "title": "Unit Converter",
    "fromUnit": "From Unit"
  }
}
```

## Adding Translations

### Step 1: Add Key to English File
Add the new key to `messages/en.json`:
```json
{
  "common": {
    "newKey": "New Text"
  }
}
```

### Step 2: Translate to Other Languages
Add the same key to all other language files:
- `messages/es.json` - Add Spanish translation
- `messages/fr.json` - Add French translation
- etc.

### Step 3: Use in Component
```tsx
import { useLanguage } from '@/app/providers/LanguageProvider';

function MyComponent() {
  const { t } = useLanguage();
  
  return <div>{t('common.newKey')}</div>;
}
```

## Supported Languages

Currently supported:
- **en** - English (default)
- **es** - Spanish
- **fr** - French
- **de** - German
- **hi** - Hindi
- **zh** - Chinese
- **ja** - Japanese

## Adding a New Language

1. Create new file: `messages/[locale].json`
2. Copy structure from `messages/en.json`
3. Translate all values
4. Add locale to `i18n.ts`:
```typescript
export const locales = ['en', 'es', 'fr', 'de', 'hi', 'zh', 'ja', 'new-locale'] as const;
```

## Usage Examples

### Basic Translation
```tsx
const { t } = useLanguage();
<h1>{t('common.appName')}</h1>
```

### With Parameters
```tsx
// In translation file: "Hello {name}"
const { t } = useLanguage();
<p>{t('common.greeting', { name: 'John' })}</p>
```

### Change Language
```tsx
const { changeLanguage, locale } = useLanguage();
<button onClick={() => changeLanguage('es')}>
  Switch to Spanish
</button>
```

## Best Practices

1. **Keep keys organized** - Use namespaces (common, unitConverter, etc.)
2. **Consistent naming** - Use camelCase for keys
3. **Complete translations** - Always add to all language files
4. **Test all languages** - Verify translations display correctly
5. **Keep it simple** - Only translate what users see

## Current Translation Keys

Total: ~85 keys organized in:
- `common` - Common UI elements (buttons, labels)
- `unitConverter` - Unit converter specific text
- `categories` - Category names
- `language` - Language names
- `navigation` - Navigation items

## Maintenance Tips

- **Small changes**: Edit JSON files directly
- **Bulk changes**: Use find/replace across all files
- **New features**: Add keys to English first, then translate
- **Review**: Periodically review translations for accuracy

## Language Switcher

Users can change language via the language switcher in the header. Preference is saved in localStorage and persists across sessions.

## Browser Language Detection

The system automatically detects the user's browser language and uses it if available. Falls back to English if language not supported.
