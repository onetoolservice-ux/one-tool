# COMPREHENSIVE FIX SCRIPT — ALL BUGS & ISSUES

**Purpose:** Single script to fix ALL bugs found in QA assessment  
**Based On:** 
- `STRICT_QA_REPORT.md` — Zero-tolerance QA findings
- `QA_ASSESSMENT_REPORT.md` — Comprehensive testing gaps
- `TESTING_ROADMAP.md` — Implementation guide

---

## INSTRUCTIONS FOR CURSOR

**Read these files first:**
1. `STRICT_QA_REPORT.md` — All critical failures and UX issues
2. `QA_ASSESSMENT_REPORT.md` — Complete testing analysis
3. `TESTING_ROADMAP.md` — Test requirements

**Then fix ALL issues below in priority order.**

---

## 🔴 PHASE 1: CRITICAL FIXES (BLOCK RELEASE)

### Fix 1: PDF Workbench — Broken Merge Functionality

**File:** `app/components/tools/documents/pdf-workbench.tsx`

**Current State:** Merge button exists but does nothing.

**Fix Required:**
```typescript
// Add actual merge functionality OR show "Coming Soon"
import { PDFDocument } from 'pdf-lib';
import { showToast } from '@/app/shared/Toast';
import { getErrorMessage } from '@/app/lib/errors/error-handler';

const handleMerge = async () => {
  if (files.length < 2) {
    showToast('Please upload at least 2 PDF files', 'error');
    return;
  }
  
  setMerging(true);
  try {
    const mergedPdf = await PDFDocument.create();
    
    for (const file of files) {
      const pdfBytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(pdfBytes);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    }
    
    const mergedPdfBytes = await mergedPdf.save();
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'merged.pdf';
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('PDFs merged successfully', 'success');
  } catch (error) {
    const message = getErrorMessage(error);
    showToast(message || 'Failed to merge PDFs. Please try again.', 'error');
  } finally {
    setMerging(false);
  }
};

// Update button:
<button 
  onClick={handleMerge} 
  disabled={files.length < 2 || isMerging}
  className="..."
>
  {isMerging ? 'Merging...' : <><Download size={14}/> Merge Files</>}
</button>
```

**OR if pdf-lib not available, show warning:**
```typescript
const handleMerge = () => {
  showToast('PDF merge functionality coming soon. Please use a dedicated PDF tool.', 'info');
};
```

---

### Fix 2: PDF Splitter — Misleading Demo

**File:** `app/components/tools/documents/pdf-splitter.tsx`

**Current State:** Shows alert AFTER user interaction saying it's a demo.

**Fix Required:** Show warning BEFORE upload:
```typescript
// Add warning state
const [showWarning, setShowWarning] = useState(true);

// Show warning modal before allowing upload
{showWarning && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl max-w-md">
      <h3 className="font-bold mb-2">PDF Splitter - Coming Soon</h3>
      <p className="text-sm text-slate-600 mb-4">
        PDF splitting requires server-side processing. This feature is under development.
      </p>
      <button onClick={() => setShowWarning(false)} className="bg-slate-900 text-white px-4 py-2 rounded">
        I Understand
      </button>
    </div>
  </div>
)}
```

---

### Fix 3: Invoice Generator — Silent Failure

**File:** `app/components/tools/business/invoice-generator.tsx` (line 58)

**Current State:** `} catch (e) {}` — complete silence

**Fix Required:**
```typescript
import { getErrorMessage } from '@/app/lib/errors/error-handler';
import { showToast } from '@/app/shared/Toast';

// Replace line 58:
} catch (error) {
  const message = getErrorMessage(error);
  showToast(message || 'Failed to generate PDF. Please try again.', 'error');
  console.error('PDF generation error:', error);
}
```

---

### Fix 4: Salary Slip — Silent Failure

**File:** `app/components/tools/business/salary-slip.tsx` (line 130)

**Current State:** `} catch (e) { console.error(e); }` — no user feedback

**Fix Required:**
```typescript
import { getErrorMessage } from '@/app/lib/errors/error-handler';
import { showToast } from '@/app/shared/Toast';

// Replace line 130:
} catch (error) {
  const message = getErrorMessage(error);
  showToast(message || 'Failed to generate PDF. Please try again.', 'error');
  console.error('PDF generation error:', error);
}
```

---

### Fix 5: Loan Calculator — Division by Zero

**File:** `app/components/tools/finance/loan-calculator.tsx`

**Current State:** No validation, can produce Infinity/NaN

**Fix Required:**
```typescript
useEffect(() => {
  // Add validation FIRST
  if (p <= 0 || r < 0 || n <= 0) {
    setEmi(0);
    setTotalInterest(0);
    setTotalAmount(0);
    setSchedule([]);
    return;
  }
  
  const monthlyRate = r / 12 / 100;
  const months = n * 12;
  
  // Handle zero interest case
  if (r === 0) {
    const emiVal = p / months;
    setEmi(Math.round(emiVal));
    setTotalAmount(p);
    setTotalInterest(0);
    
    // Generate schedule for zero interest
    const data = [];
    for (let i = 1; i <= months; i++) {
      const balance = Math.max(0, p - (emiVal * i));
      if (i % 12 === 0) {
        data.push({ year: `Yr ${i/12}`, Balance: Math.round(balance) });
      }
    }
    setSchedule(data);
    return;
  }
  
  // Normal calculation
  const emiVal = (p * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                 (Math.pow(1 + monthlyRate, months) - 1);
  
  // Validate result
  if (!isFinite(emiVal) || isNaN(emiVal)) {
    setEmi(0);
    setTotalInterest(0);
    setTotalAmount(0);
    setSchedule([]);
    return;
  }
  
  setEmi(Math.round(emiVal));
  setTotalAmount(Math.round(emiVal * months));
  setTotalInterest(Math.round((emiVal * months) - p));

  // Generate Amortization
  let balance = p;
  const data = [];
  for (let i = 1; i <= months; i++) {
     const interest = balance * monthlyRate;
     const principal = emiVal - interest;
     balance -= principal;
     if (i % 12 === 0) {
        data.push({ year: `Yr ${i/12}`, Balance: Math.max(0, Math.round(balance)) });
     }
  }
  setSchedule(data);
}, [p, r, n]);
```

---

### Fix 6: API Playground — SSRF Vulnerability

**File:** `app/components/tools/developer/api-playground.tsx`

**Current State:** No internal IP blocking

**Fix Required:**
```typescript
// Add SSRF prevention function BEFORE component
function isInternalIP(hostname: string): boolean {
  if (['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(hostname)) return true;
  const parts = hostname.split('.').map(Number);
  if (parts.length === 4) {
    if (parts[0] === 10) return true; // 10.0.0.0/8
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true; // 172.16.0.0/12
    if (parts[0] === 192 && parts[1] === 168) return true; // 192.168.0.0/16
  }
  return false;
}

// Update send function:
const send = async () => {
  setLoading(true);
  try {
    if (!url || !url.trim()) {
      throw new Error('URL is required');
    }
    
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Only HTTP and HTTPS URLs are allowed');
    }
    
    // ADD SSRF CHECK
    if (isInternalIP(urlObj.hostname)) {
      throw new Error('Requests to internal IPs are not allowed for security reasons');
    }
    
    // ADD TIMEOUT
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const options: RequestInit = {
      method,
      mode: 'cors',
      signal: controller.signal,
    };
    
    // ADD REQUEST BODY SUPPORT
    const [requestBody, setRequestBody] = useState('');
    if (['POST', 'PUT'].includes(method) && requestBody.trim()) {
      try {
        options.body = JSON.stringify(JSON.parse(requestBody));
        options.headers = { 'Content-Type': 'application/json' };
      } catch (e) {
        clearTimeout(timeoutId);
        showToast('Invalid JSON in request body', 'error');
        setLoading(false);
        return;
      }
    }
    
    const res = await fetch(url, options);
    clearTimeout(timeoutId);
    
    // Handle non-JSON responses
    const contentType = res.headers.get('content-type');
    let data;
    if (contentType?.includes('application/json')) {
      data = await res.json();
    } else {
      data = { text: await res.text() };
    }
    
    setResponse(data);
    setStatus(res.status);
  } catch (e: unknown) {
    clearTimeout(timeoutId);
    if (e instanceof Error && e.name === 'AbortError') {
      showToast('Request timed out after 10 seconds', 'error');
      setResponse({ error: 'Request timeout' });
      setStatus(408);
    } else {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
      setResponse({ error: errorMessage });
      setStatus(500);
    }
  } finally {
    setLoading(false);
  }
};

// Update textarea to use requestBody state:
<textarea 
  value={requestBody} 
  onChange={e => setRequestBody(e.target.value)}
  className="..."
/>
```

---

### Fix 7: Replace ALL alert() Calls

**Files:**
- `app/components/tools/engines/file-engine.tsx` (line 54)
- `app/components/tools/documents/universal-converter.tsx` (line 110)
- `app/components/tools/developer/smart-editor.tsx` (line 12)
- `app/components/tools/documents/pdf-splitter.tsx` (line 37)

**Fix Required:**
```typescript
// Add imports:
import { showToast } from '@/app/shared/Toast';

// Replace ALL:
alert("Error message");
// With:
showToast("Error message", 'error');
```

---

### Fix 8: Add Input Validation to Financial Calculators

**Files:**
- `app/components/tools/finance/loan-calculator.tsx`
- `app/components/tools/finance/budget-planner.tsx`
- `app/components/tools/finance/investment-calculator.tsx`

**Fix Required:**
```typescript
import { showToast } from '@/app/shared/Toast';

// Loan Calculator - Principal input:
onChange={(e) => {
  const val = parseFloat(e.target.value) || 0;
  if (val < 0) {
    showToast('Loan amount cannot be negative', 'error');
    return;
  }
  if (val === 0) {
    showToast('Loan amount must be greater than 0', 'error');
    return;
  }
  if (val > 100000000) {
    showToast('Loan amount cannot exceed ₹10 crores', 'error');
    return;
  }
  setP(val);
}}

// Budget Planner - Amount inputs:
onChange={e => {
  const val = Number(e.target.value);
  if (val < 0) {
    showToast('Amount cannot be negative', 'error');
    return;
  }
  const n = [...incomes];
  n[idx].amount = val;
  setIncomes(n);
}}
```

---

### Fix 9: Add File Validation to Uploads

**Files:**
- `app/components/tools/documents/pdf-workbench.tsx`
- `app/components/tools/documents/image-compressor.tsx`
- `app/components/tools/documents/smart-ocr.tsx`

**Fix Required:**
```typescript
import { showToast } from '@/app/shared/Toast';

// PDF Workbench:
const handleUpload = (e: any) => {
  if (!e.target.files) return;
  
  const files = Array.from(e.target.files as FileList);
  const validFiles: File[] = [];
  
  files.forEach(file => {
    // Validate file type
    if (file.type !== 'application/pdf') {
      showToast(`${file.name} is not a PDF file`, 'error');
      return;
    }
    
    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      showToast(`${file.name} exceeds 50MB size limit`, 'error');
      return;
    }
    
    validFiles.push(file);
  });
  
  if (validFiles.length > 0) {
    setFiles([...files, ...validFiles]);
    showToast(`Added ${validFiles.length} PDF file(s)`, 'success');
  }
};

// Image tools - similar pattern with image MIME types:
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
if (!allowedTypes.includes(file.type)) {
  showToast(`${file.name} is not a supported image format`, 'error');
  return;
}
if (file.size > 10 * 1024 * 1024) { // 10MB for images
  showToast(`${file.name} exceeds 10MB size limit`, 'error');
  return;
}
```

---

### Fix 10: Budget Planner — Add Delete Functionality

**File:** `app/components/tools/finance/budget-planner.tsx`

**Fix Required:**
```typescript
import { Trash2 } from 'lucide-react';

// Add delete handlers:
const deleteIncome = (id: number) => {
  setIncomes(incomes.filter(i => i.id !== id));
};

const deleteExpense = (id: number) => {
  setExpenses(expenses.filter(e => e.id !== id));
};

// Update income items:
{incomes.map((i, idx) => (
  <div key={i.id} className="flex gap-2 mb-2 items-center">
    <input value={i.name} onChange={...} className="flex-1 ..."/>
    <input type="number" value={i.amount} onChange={...} className="w-24 ..."/>
    <button 
      onClick={() => deleteIncome(i.id)}
      className="p-2 text-rose-500 hover:bg-rose-50 rounded"
      title="Delete"
    >
      <Trash2 size={14}/>
    </button>
  </div>
))}

// Same for expenses
```

---

## 🟡 PHASE 2: HIGH-PRIORITY FIXES

### Fix 11: Reduce Font Sizes

**Files:** Multiple

**Fix Required:**
- `text-6xl` → `text-3xl` (cron-gen.tsx)
- `text-5xl` → `text-3xl` (invoice-generator.tsx)
- `text-4xl` → `text-2xl` (multiple files)

**Search and replace:**
```bash
# Find all instances:
grep -r "text-6xl\|text-5xl\|text-4xl" app/components/tools

# Replace manually or use regex:
text-6xl → text-3xl
text-5xl → text-3xl  
text-4xl → text-2xl
```

---

### Fix 12: Replace font-black with font-bold

**Files:** 30+ files

**Fix Required:**
```bash
# Find all instances:
grep -r "font-black" app/components/tools

# Replace:
font-black → font-bold
```

---

### Fix 13: Fix Layout Heights

**Files:** 30+ files using `h-[calc(100vh-80px)]`

**Fix Required:**
```bash
# Find all instances:
grep -r "h-\[calc\(100vh" app/components/tools

# Replace:
h-[calc(100vh-80px)] → min-h-[calc(100vh-80px)]
h-[calc(100vh-64px)] → min-h-[calc(100vh-64px)]
```

---

### Fix 14: ToolGrid Error Handling

**File:** `app/components/home/tool-grid.tsx`

**Fix Required:**
```typescript
const [error, setError] = useState<string | null>(null);

// In loadTools:
} catch (error) {
  console.error('Error loading tools:', error);
  setError('Failed to load tools. Please refresh the page.');
  setTools([]);
}

// In render:
{error && (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-3">
      <AlertCircle className="text-red-500" size={20} />
    </div>
    <h3 className="text-sm font-bold text-red-600 dark:text-red-400">Error loading tools</h3>
    <p className="text-xs text-gray-500 mt-1">{error}</p>
    <button 
      onClick={() => window.location.reload()} 
      className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold"
    >
      Retry
    </button>
  </div>
)}
```

---

## 📋 EXECUTION CHECKLIST

### Phase 1: Critical (Do First)
- [ ] Fix PDF Workbench merge
- [ ] Fix PDF Splitter warning
- [ ] Fix Invoice Generator silent failure
- [ ] Fix Salary Slip silent failure
- [ ] Fix Loan Calculator division by zero
- [ ] Fix API Playground SSRF
- [ ] Fix API Playground timeout
- [ ] Replace all alert() calls
- [ ] Add input validation
- [ ] Add file validation

### Phase 2: High Priority (Do Second)
- [ ] Add Budget Planner delete
- [ ] Fix ToolGrid error handling
- [ ] Fix API Playground request body
- [ ] Reduce font sizes
- [ ] Replace font-black
- [ ] Fix layout heights

---

## 🧪 TESTING AFTER FIXES

After each fix, verify:
1. ✅ No console errors
2. ✅ User-friendly error messages appear
3. ✅ Loading states work correctly
4. ✅ Input validation prevents invalid data
5. ✅ Security vulnerabilities are blocked

---

**End of Comprehensive Fix Script**
