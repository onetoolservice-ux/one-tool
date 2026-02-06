# One Tool Platform: Testing Roadmap & Implementation Guide

**Created:** January 2026  
**Status:** Ready for Implementation  
**Target Coverage:** 80%+ Unit, 60%+ Integration, 100% Critical E2E

---

## Quick Start

### Running Tests

```bash
# Unit tests
npm test

# Unit tests with coverage
npm test -- --coverage

# E2E tests
npx playwright test

# E2E tests in UI mode
npx playwright test --ui

# Run specific test file
npm test validators.test.ts
npx playwright test loan-calculator.spec.ts
```

---

## Phase 1: Foundation (Week 1-2)

### ✅ Completed
- [x] QA Assessment Report
- [x] Unit tests for validators (`validators.test.ts`)
- [x] Unit tests for tool helpers (`tool-helpers.test.ts`)
- [x] Integration tests for ToolTile (`ToolTile.test.tsx`)
- [x] E2E tests for Loan Calculator (`loan-calculator.spec.ts`)

### 🔄 In Progress
- [ ] Unit tests for error handler (`error-handler.test.ts`)
- [ ] Unit tests for tools service (`tools-service.test.ts`)
- [ ] Integration tests for ToolGrid (`ToolGrid.test.tsx`)
- [ ] E2E tests for API Playground security (`api-playground-security.spec.ts`)

### 📋 Next Steps

#### 1. Error Handler Tests (`__tests__/error-handler.test.ts`)
**Priority:** HIGH  
**Estimated Time:** 2 hours

**Test Cases:**
- Supabase error parsing (auth errors, database errors)
- Error code mapping
- User-friendly message generation
- Unknown error handling

#### 2. Tools Service Tests (`__tests__/tools-service.test.ts`)
**Priority:** HIGH  
**Estimated Time:** 3 hours

**Test Cases:**
- `getAllTools()` - success and error cases
- `getToolById()` - found, not found, error cases
- `getToolsByCategory()` - filtering, empty results
- `getPopularTools()` - filtering logic
- Database connection failures
- Icon mapping

#### 3. ToolGrid Integration Tests (`__tests__/ToolGrid.test.tsx`)
**Priority:** MEDIUM  
**Estimated Time:** 3 hours

**Test Cases:**
- Data fetching on mount
- Loading state display
- Empty state display
- Search filtering
- Category filtering
- Error handling (database failures)
- Icon rendering

#### 4. API Playground Security Tests (`tests/api-playground-security.spec.ts`)
**Priority:** CRITICAL  
**Estimated Time:** 2 hours

**Test Cases:**
- SSRF prevention (internal IPs, localhost)
- Protocol validation (file://, javascript:)
- Request timeout handling
- CORS error handling
- Rate limiting (if implemented)

---

## Phase 2: Calculation Logic (Week 3-4)

### Unit Tests for Financial Calculations

#### 1. Loan Calculator Logic (`__tests__/calculations/loan-calculator.test.ts`)
**Priority:** CRITICAL  
**Estimated Time:** 4 hours

**Test Cases:**
```typescript
describe('EMI Calculation', () => {
  - calculateEMI(5000000, 8.5, 20) === expectedValue
  - calculateEMI(0, 8.5, 20) === 0
  - calculateEMI(5000000, 0, 20) === principal / (tenure * 12)
  - calculateEMI(5000000, 8.5, 0) === Infinity or error
  - Edge cases: very large numbers, very small numbers
});

describe('Amortization Schedule', () => {
  - generateSchedule() produces correct yearly data
  - Schedule balances decrease over time
  - Final balance === 0 (or close to 0)
  - Handles edge cases (1 year, 30 years)
});
```

#### 2. SIP Calculator Logic (`__tests__/calculations/sip-calculator.test.ts`)
**Priority:** CRITICAL  
**Estimated Time:** 4 hours

**Test Cases:**
- Future value calculation
- Rate of return calculation
- Monthly investment calculations
- Edge cases (zero investment, zero rate)

#### 3. GST Calculator Logic (`__tests__/calculations/gst-calculator.test.ts`)
**Priority:** CRITICAL  
**Estimated Time:** 3 hours

**Test Cases:**
- CGST/SGST calculation (intra-state)
- IGST calculation (inter-state)
- Reverse GST calculation
- Edge cases (zero amount, 100% GST)

---

## Phase 3: Hooks & Utilities (Week 5)

### 1. useSmartHistory Tests (`__tests__/hooks/useSmartHistory.test.ts`)
**Priority:** MEDIUM  
**Estimated Time:** 2 hours

**Test Cases:**
- Favorites loading from localStorage
- Recent tools tracking
- localStorage error handling (disabled, quota exceeded)
- Mount state handling

### 2. useSmartClipboard Tests (`__tests__/hooks/useSmartClipboard.test.ts`)
**Priority:** MEDIUM  
**Estimated Time:** 3 hours

**Test Cases:**
- JSON pattern detection
- SQL pattern detection
- JWT pattern detection
- Color pattern detection
- Clipboard permission handling
- Data handover to tools

---

## Phase 4: E2E Tests for Critical Tools (Week 6-8)

### Finance Tools

#### 1. SIP Calculator (`tests/sip-calculator.spec.ts`)
**Priority:** CRITICAL  
**Estimated Time:** 3 hours

**Test Cases:**
- Complete user flow
- Invalid input handling
- Edge cases
- Chart rendering

#### 2. GST Calculator (`tests/gst-calculator.spec.ts`)
**Priority:** CRITICAL  
**Estimated Time:** 2 hours

**Test Cases:**
- CGST/SGST calculation flow
- IGST calculation flow
- Reverse GST flow
- Input validation

#### 3. Budget Planner (`tests/budget-planner.spec.ts`)
**Priority:** HIGH  
**Estimated Time:** 4 hours

**Test Cases:**
- Add transaction
- Edit transaction
- Delete transaction
- Category filtering
- KPI calculations
- Data persistence

### Document Tools

#### 4. PDF Workbench (`tests/pdf-workbench.spec.ts`)
**Priority:** HIGH  
**Estimated Time:** 3 hours

**Test Cases:**
- File upload (valid, invalid)
- File removal
- Merge operation (if implemented)
- Error handling (corrupted PDFs)
- Empty state

#### 5. Smart OCR (`tests/smart-ocr.spec.ts`)
**Priority:** HIGH  
**Estimated Time:** 3 hours

**Test Cases:**
- Image upload
- OCR processing
- Text extraction
- Error handling (blurry images)
- Large image handling

### Developer Tools

#### 6. JWT Debugger (`tests/jwt-debugger.spec.ts`)
**Priority:** MEDIUM  
**Estimated Time:** 2 hours

**Test Cases:**
- Valid token parsing
- Invalid token handling
- Header/payload/signature extraction
- Expiration validation

#### 7. JSON Editor (`tests/json-editor.spec.ts`)
**Priority:** MEDIUM  
**Estimated Time:** 2 hours

**Test Cases:**
- JSON parsing
- Format/prettify
- Minify
- Error handling (invalid JSON)

---

## Phase 5: Shared Components (Week 9-10)

### 1. Button Component (`__tests__/components/Button.test.tsx`)
**Priority:** MEDIUM  
**Estimated Time:** 2 hours

**Test Cases:**
- Variants (primary, secondary, danger, ghost, outline)
- Sizes (sm, md, lg)
- Loading state
- Disabled state
- Icon positioning
- Click handlers

### 2. Input Component (`__tests__/components/Input.test.tsx`)
**Priority:** MEDIUM  
**Estimated Time:** 2 hours

**Test Cases:**
- Label display
- Error state
- Helper text
- Required indicator
- Icon positioning
- Value changes

### 3. Textarea Component (`__tests__/components/Textarea.test.tsx`)
**Priority:** LOW  
**Estimated Time:** 1 hour

**Test Cases:**
- Basic rendering
- Value changes
- Error state
- Resize behavior

---

## Phase 6: Regression & Performance (Week 11-12)

### Regression Tests

#### 1. Tool Routing (`tests/regression/routing.spec.ts`)
**Priority:** HIGH  
**Estimated Time:** 2 hours

**Test Cases:**
- All tools load correctly
- 404 handling for invalid routes
- Category filtering
- Search functionality

#### 2. State Persistence (`tests/regression/persistence.spec.ts`)
**Priority:** MEDIUM  
**Estimated Time:** 2 hours

**Test Cases:**
- Favorites persist across sessions
- Recent tools tracking
- Tool input persistence (if implemented)

### Performance Tests

#### 3. Large File Handling (`tests/performance/large-files.spec.ts`)
**Priority:** MEDIUM  
**Estimated Time:** 3 hours

**Test Cases:**
- PDF Workbench: 10+ files
- Image Compressor: Large images (10MB+)
- JSON Editor: Large JSON (1MB+)
- CSV Studio: Large CSV files

#### 4. Rapid Interactions (`tests/performance/rapid-interactions.spec.ts`)
**Priority:** LOW  
**Estimated Time:** 2 hours

**Test Cases:**
- Rapid button clicks
- Rapid input changes
- Rapid navigation
- Memory leak detection

---

## Test Coverage Goals

### Current Coverage
- **Unit Tests:** 6% (4/63 tools)
- **Integration Tests:** 0%
- **E2E Tests:** 100% smoke (0% functional)

### Phase 1 Target (Week 1-2)
- **Unit Tests:** 25% (utilities, validators, error handlers)
- **Integration Tests:** 10% (ToolTile, ToolGrid)
- **E2E Tests:** 5% functional (Loan Calculator, API Playground)

### Phase 2-3 Target (Week 3-5)
- **Unit Tests:** 50% (calculations, hooks)
- **Integration Tests:** 30% (shared components)
- **E2E Tests:** 15% functional (finance tools)

### Phase 4-5 Target (Week 6-10)
- **Unit Tests:** 70% (most tools)
- **Integration Tests:** 50% (all shared components)
- **E2E Tests:** 40% functional (critical tools)

### Final Target (Week 11-12)
- **Unit Tests:** 80%+
- **Integration Tests:** 60%+
- **E2E Tests:** 60%+ functional

---

## Test Maintenance

### Continuous Integration

**Recommended CI Setup:**
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test -- --coverage
      
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npx playwright test
```

### Coverage Monitoring

**Tools:**
- Jest coverage reports
- Playwright test reports
- Codecov or Coveralls (optional)

**Thresholds:**
- Unit tests: 80%+
- Integration tests: 60%+
- E2E tests: 100% critical paths

---

## Best Practices

### Unit Tests
- ✅ Test pure functions thoroughly
- ✅ Mock external dependencies
- ✅ Test edge cases and error conditions
- ✅ Keep tests fast (< 100ms each)
- ✅ Use descriptive test names

### Integration Tests
- ✅ Test component interactions
- ✅ Test data flow
- ✅ Test error boundaries
- ✅ Mock API calls
- ✅ Test user interactions

### E2E Tests
- ✅ Test complete user flows
- ✅ Test error recovery
- ✅ Test edge cases
- ✅ Keep tests independent
- ✅ Use page object pattern (optional)

### Test Organization
- ✅ Group related tests in describe blocks
- ✅ Use consistent naming conventions
- ✅ Keep test files close to source files
- ✅ Document complex test scenarios

---

## Troubleshooting

### Common Issues

#### Tests failing due to localStorage
**Solution:** Mock localStorage in test setup
```typescript
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;
```

#### Tests failing due to Next.js routing
**Solution:** Mock Next.js router
```typescript
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
```

#### E2E tests timing out
**Solution:** Increase timeout or add explicit waits
```typescript
test('slow test', async ({ page }) => {
  await page.goto('/slow-page', { waitUntil: 'networkidle' });
});
```

---

## Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/docs/intro)

### Example Test Files
- `__tests__/validators.test.ts` - Unit test example
- `__tests__/ToolTile.test.tsx` - Integration test example
- `tests/loan-calculator.spec.ts` - E2E test example

---

**Last Updated:** January 2026  
**Next Review:** After Phase 1 completion
