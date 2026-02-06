# Internationalization (i18n) Setup - Manual Management

## Overview
Simple, manual translation system using local JSON files. Perfect for small projects with ~85 translation keys.

## Supported Languages
- **English (en)** - Default
- **Spanish (es)** - Español
- **French (fr)** - Français
- **German (de)** - Deutsch
- **Hindi (hi)** - हिंदी
- **Chinese (zh)** - 中文
- **Japanese (ja)** - 日本語

## Architecture

### Files
1. **`i18n.ts`** - Configuration (supported locales)
2. **`messages/[locale].json`** - Translation files for each language
3. **`app/providers/LanguageProvider.tsx`** - React context provider
4. **`app/components/layout/LanguageSwitcher.tsx`** - Language switcher UI
5. **`app/lib/translations/translation-service.ts`** - Translation service

### How It Works

1. **LanguageProvider**: 
   - Wraps the entire application
   - Loads translations from JSON files
   - Stores language preference in localStorage
   - Provides `useLanguage()` hook

2. **Language Switcher**:
   - Located in GlobalHeader
   - Allows users to change language
   - Persists preference

3. **Translation Files**:
   - JSON files in `messages/` directory
   - Organized by namespace (common, unitConverter, categories, etc.)

## Usage in Components

### Basic Usage
```tsx
import { useLanguage } from '@/app/providers/LanguageProvider';

function MyComponent() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('common.appName')}</h1>
      <p>{t('common.description')}</p>
    </div>
  );
}
```

### With Parameters
```tsx
const { t } = useLanguage();
// Translation: "Hello {name}"
const message = t('common.greeting', { name: 'John' });
```

### Change Language Programmatically
```tsx
const { changeLanguage, locale } = useLanguage();
changeLanguage('es'); // Switch to Spanish
```

## Adding New Translations

1. **Add to English file** (`messages/en.json`):
```json
{
  "common": {
    "newKey": "New Text"
  }
}
```

2. **Add to all other language files** with translations

3. **Use in component**:
```tsx
const { t } = useLanguage();
t('common.newKey')
```

## Language Switcher Location

The language switcher is automatically in the GlobalHeader, next to the theme toggle.

## Language Preference Storage

- Stored in `localStorage` with key `preferred-language`
- Persists across sessions
- Falls back to browser language, then English

## Browser Language Detection

Automatically detects user's browser language and uses it if supported.

## Maintenance

Since you have only ~85 translation keys, manual maintenance is simple:

1. **Add new key** → Add to all language files
2. **Update translation** → Edit JSON file directly
3. **Add new language** → Create new JSON file, add locale to `i18n.ts`

## Current Status

✅ **Working:**
- Language detection
- Translation loading
- Language switcher
- No URL changes (routes stay the same)
- Simple manual management

✅ **Ready for:**
- Adding more languages
- Adding more translation keys
- Easy maintenance

The system is simple, lightweight, and perfect for manual translation management.
