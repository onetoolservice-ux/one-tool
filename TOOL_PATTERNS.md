# Tool Development Patterns

**Purpose:** Standardized patterns for building and maintaining tools  
**Status:** Guidelines for Phase 2+ implementation

## Error Handling Pattern

### Standard Error Handling

```typescript
import { safeAsync, showToast } from '@/app/lib/utils/tool-helpers';
import { getErrorMessage } from '@/app/lib/errors/error-handler';

// Pattern 1: Using safeAsync (recommended for most cases)
const { data, error } = await safeAsync(
  async () => {
    // Your async operation
    return await someAsyncOperation();
  },
  'Failed to process. Please try again.'
);

if (error) {
  // Error already shown via toast
  return; // or handle error state
}

// Use data...

// Pattern 2: Manual try-catch with toast
try {
  const result = await someAsyncOperation();
  // Use result...
} catch (error) {
  const message = getErrorMessage(error);
  showToast(message, 'error');
  // Handle error state...
}
```

### Error Display

```typescript
import { ErrorMessage } from '@/app/components/shared';

// In component
{error && <ErrorMessage message={error} />}
```

## Loading State Pattern

### Standard Loading State

```typescript
import { useState } from 'react';
import { LoadingSpinner, FullPageLoader, InlineLoader } from '@/app/components/shared';

// Pattern 1: Full page loading
const [loading, setLoading] = useState(false);

if (loading) {
  return <FullPageLoader text="Processing..." />;
}

// Pattern 2: Inline loading (for buttons)
<Button loading={loading}>Process</Button>

// Pattern 3: Small spinner in component
{loading && <InlineLoader />}

// Pattern 4: Loading state with disabled UI
<div className={loading ? 'opacity-50 pointer-events-none' : ''}>
  {/* Content */}
</div>
```

### Loading State with Async Operations

```typescript
const handleSubmit = async () => {
  setLoading(true);
  try {
    const result = await processData();
    showToast('Success!', 'success');
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  } finally {
    setLoading(false);
  }
};
```

## Input Validation Pattern

### Standard Input Validation

```typescript
import { useState } from 'react';
import { Input } from '@/app/components/shared';
import { validateEmail, validateRequired } from '@/app/lib/validation/validators';

const [email, setEmail] = useState('');
const [errors, setErrors] = useState<Record<string, string>>({});

const handleSubmit = () => {
  // Validate
  const emailResult = validateEmail(email);
  if (!emailResult.isValid) {
    setErrors({ email: emailResult.error || 'Invalid email' });
    return;
  }

  // Clear errors and proceed
  setErrors({});
  // Process...
};

// In JSX
<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  required
/>
```

### Real-time Validation (Optional)

```typescript
const [email, setEmail] = useState('');
const [emailError, setEmailError] = useState('');

const handleEmailChange = (value: string) => {
  setEmail(value);
  if (value && !validateEmail(value).isValid) {
    setEmailError('Invalid email format');
  } else {
    setEmailError('');
  }
};
```

## Copy-to-Clipboard Pattern

### Standard Copy Pattern

```typescript
import { CopyButton } from '@/app/components/shared';
// OR
import { useCopyToClipboard } from '@/app/hooks/useCopyToClipboard';

// Pattern 1: Using CopyButton component (recommended)
<CopyButton text={outputText} variant="icon" />

// Pattern 2: Using hook
const { copy, copied } = useCopyToClipboard();
<button onClick={() => copy(outputText)}>
  {copied ? 'Copied!' : 'Copy'}
</button>
```

## Empty State Pattern

### Standard Empty State

```typescript
import { EmptyState } from '@/app/components/shared';
import { FileText } from 'lucide-react';

{items.length === 0 && (
  <EmptyState
    icon={FileText}
    title="No items found"
    description="Add your first item to get started"
    action={<Button onClick={handleAdd}>Add Item</Button>}
  />
)}
```

## Button Usage Pattern

### Standard Button Usage

```typescript
import { Button } from '@/app/components/shared';
import { Save, Trash2 } from 'lucide-react';

// Primary action
<Button variant="primary" onClick={handleSave}>Save</Button>

// Secondary action
<Button variant="secondary" onClick={handleProcess}>Process</Button>

// Danger action
<Button variant="danger" onClick={handleDelete}>Delete</Button>

// With icon
<Button variant="primary" icon={<Save />} iconPosition="left">
  Save Changes
</Button>

// Loading state
<Button variant="primary" loading={isSaving}>Save</Button>

// Disabled state
<Button variant="primary" disabled={!isValid}>Submit</Button>
```

## Form Pattern

### Standard Form Structure

```typescript
import { useState } from 'react';
import { Input, Textarea, Button } from '@/app/components/shared';
import { validateEmail, validateRequired } from '@/app/lib/validation/validators';
import { showToast } from '@/app/shared/Toast';

const [formData, setFormData] = useState({ email: '', message: '' });
const [errors, setErrors] = useState<Record<string, string>>({});
const [loading, setLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate
  const emailResult = validateEmail(formData.email);
  const messageResult = validateRequired(formData.message, 'Message');
  
  if (!emailResult.isValid || !messageResult.isValid) {
    setErrors({
      email: emailResult.error || '',
      message: messageResult.error || '',
    });
    return;
  }
  
  // Clear errors
  setErrors({});
  setLoading(true);
  
  try {
    await submitForm(formData);
    showToast('Success!', 'success');
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  } finally {
    setLoading(false);
  }
};

return (
  <form onSubmit={handleSubmit}>
    <Input
      label="Email"
      type="email"
      value={formData.email}
      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      error={errors.email}
      required
    />
    
    <Textarea
      label="Message"
      value={formData.message}
      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
      error={errors.message}
      required
    />
    
    <Button type="submit" variant="primary" loading={loading}>
      Submit
    </Button>
  </form>
);
```

## Async Operation Pattern

### Standard Async Operation

```typescript
import { useState } from 'react';
import { safeAsync } from '@/app/lib/utils/tool-helpers';
import { LoadingSpinner } from '@/app/components/shared';
import { showToast } from '@/app/shared/Toast';

const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);

const handleProcess = async () => {
  setLoading(true);
  
  const { data: result, error } = await safeAsync(
    async () => {
      // Your async operation
      return await fetchData();
    },
    'Failed to load data'
  );
  
  if (error) {
    // Error already shown via toast
    setLoading(false);
    return;
  }
  
  setData(result);
  setLoading(false);
  showToast('Data loaded successfully', 'success');
};

// In JSX
{loading ? (
  <LoadingSpinner text="Loading..." />
) : (
  <div>{/* Render data */}</div>
)}
```

## File Upload Pattern

### Standard File Upload

```typescript
import { useState } from 'react';
import { Input, Button, LoadingSpinner } from '@/app/components/shared';
import { showToast } from '@/app/shared/Toast';
import { Upload } from 'lucide-react';

const [file, setFile] = useState<File | null>(null);
const [uploading, setUploading] = useState(false);

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const selectedFile = e.target.files?.[0];
  if (!selectedFile) return;
  
  // Validate file size (e.g., 10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (selectedFile.size > maxSize) {
    showToast('File size must be less than 10MB', 'error');
    return;
  }
  
  // Validate file type if needed
  const allowedTypes = ['image/jpeg', 'image/png'];
  if (!allowedTypes.includes(selectedFile.type)) {
    showToast('Only JPEG and PNG images are allowed', 'error');
    return;
  }
  
  setFile(selectedFile);
};

const handleUpload = async () => {
  if (!file) return;
  
  setUploading(true);
  try {
    // Upload logic
    await uploadFile(file);
    showToast('File uploaded successfully', 'success');
    setFile(null);
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  } finally {
    setUploading(false);
  }
};

// In JSX
<Input
  type="file"
  onChange={handleFileChange}
  accept="image/jpeg,image/png"
  disabled={uploading}
/>
<Button
  variant="primary"
  onClick={handleUpload}
  disabled={!file || uploading}
  loading={uploading}
>
  Upload
</Button>
```

## Component Structure Pattern

### Standard Tool Component Structure

```typescript
"use client";

import React, { useState } from 'react';
import { Button, Input, LoadingSpinner, ErrorMessage, EmptyState } from '@/app/components/shared';
import { showToast } from '@/app/shared/Toast';
import { safeAsync } from '@/app/lib/utils/tool-helpers';

export const MyTool = () => {
  // State
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Handlers
  const handleProcess = async () => {
    setError('');
    setLoading(true);
    
    const { data, error: err } = await safeAsync(
      async () => {
        // Process logic
        return processData(input);
      },
      'Failed to process data'
    );
    
    if (err) {
      setError(err);
      setLoading(false);
      return;
    }
    
    setOutput(data);
    setLoading(false);
    showToast('Processed successfully', 'success');
  };
  
  // Render
  if (loading && !output) {
    return <LoadingSpinner text="Processing..." />;
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Input
        label="Input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        error={error}
      />
      
      <Button variant="primary" onClick={handleProcess} loading={loading}>
        Process
      </Button>
      
      {output && (
        <div>
          {/* Output */}
        </div>
      )}
    </div>
  );
};
```

## Best Practices

### DO:
- ✅ Use shared components (Button, Input, etc.)
- ✅ Use safeAsync for error handling
- ✅ Show loading states for async operations
- ✅ Validate inputs before processing
- ✅ Show user-friendly error messages
- ✅ Use EmptyState when no data
- ✅ Use CopyButton for copy functionality
- ✅ Add focus states (handled by components)
- ✅ Use design tokens for consistency

### DON'T:
- ❌ Use empty catch blocks (silent failures)
- ❌ Forget loading states
- ❌ Skip input validation
- ❌ Use inline styles (use Tailwind)
- ❌ Duplicate button/input code
- ❌ Use excessive animations
- ❌ Skip error handling
- ❌ Hardcode colors/spacing (use design tokens)

## Migration Strategy

When migrating existing tools:

1. **Identify** - Find duplicated code (buttons, inputs, copy logic)
2. **Replace** - Use shared components
3. **Verify** - Test functionality still works
4. **Improve** - Add loading states, error handling, validation

Example migration:

```typescript
// BEFORE
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
  Click me
</button>

// AFTER
import { Button } from '@/app/components/shared';
<Button variant="primary">Click me</Button>
```

---

**Status:** Guidelines ready for Phase 2+ implementation  
**Last Updated:** January 2026
