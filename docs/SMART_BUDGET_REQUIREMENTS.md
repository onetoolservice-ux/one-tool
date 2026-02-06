# SMART BUDGET - MINIMUM REQUIREMENTS DEFINITION

## PHASE 2: WHAT A "SMART BUDGET" MUST DO

---

## CORE FINANCE REQUIREMENTS

### 1. Time-Based Budgeting
- ✅ **Month/Year Selector** - Users can select which month they're budgeting for
- ✅ **Budget History** - Store and retrieve budgets for different months
- ✅ **Month-over-Month Comparison** - Compare current month vs previous month
- ✅ **Trend Analysis** - Show spending trends over time

### 2. Category Management
- ✅ **Category Totals** - Show total for Needs, Wants, Savings separately
- ✅ **Category Percentages** - Show what % of income each category represents
- ✅ **Budget Limits per Category** - Set max limits (e.g., Needs ≤ ₹50,000)
- ✅ **Percentage-Based Limits** - Set limits as % of income (e.g., Needs ≤ 50%)

### 3. Balance & Surplus Clarity
- ✅ **Clear Definitions:**
  - **Total Income:** Sum of all income sources
  - **Total Expenses (Needs + Wants):** Sum of non-savings expenses
  - **Allocated Savings:** Amount explicitly set aside for savings
  - **Surplus/Free Cash:** Income - Expenses - Allocated Savings
  - **Total Savings Capacity:** Allocated Savings + Surplus
- ✅ **Separate Display** - Show each value clearly, not just "Balance"
- ✅ **No Double-Counting** - Savings should not be treated as expenses

### 4. Over-Budget Detection
- ✅ **Category Over-Budget Warnings** - Alert when Needs > limit
- ✅ **Total Over-Budget Warnings** - Alert when expenses > income
- ✅ **Visual Indicators** - Red/yellow/green status for each category
- ✅ **Actionable Alerts** - "You're spending ₹5,000 over budget on Wants"

### 5. Negative Balance Handling
- ✅ **Crisis Detection** - Detect when expenses > income
- ✅ **Clear Warnings** - "⚠️ You're spending more than you earn!"
- ✅ **Actionable Guidance** - "Reduce Wants by ₹X to break even"
- ✅ **Visual Indicators** - Red background, warning icons

---

## INTELLIGENCE LAYER REQUIREMENTS

### 6. Rule-Based Insights (50/30/20 Rule)
- ✅ **Default Rule:** 50% Needs, 30% Wants, 20% Savings
- ✅ **Configurable Rule:** Users can set custom percentages
- ✅ **Rule Evaluation:** Compare actual spending vs rule
- ✅ **Rule Violation Warnings:** "Needs are 60% of income (should be ≤50%)"

### 7. Actionable Suggestions
- ✅ **What to Reduce:** "Consider reducing Wants by ₹X to meet savings goal"
- ✅ **What to Increase:** "You can increase Savings by ₹X (currently below 20%)"
- ✅ **Category-Specific:** "Dining expenses are high - consider meal prep"
- ✅ **Priority-Based:** Show most impactful suggestions first

### 8. Financial Health Warnings
- ✅ **Low Savings Warning:** "Savings are only 10% - aim for 20%"
- ✅ **High Needs Warning:** "Needs are 70% - consider reducing fixed costs"
- ✅ **Excessive Wants Warning:** "Wants are 40% - this may impact long-term goals"
- ✅ **Emergency Fund Check:** "Do you have 6 months of expenses saved?"

### 9. Automatic Category Suggestions
- ✅ **Smart Categorization:** Suggest category based on expense name
  - "Rent", "Mortgage" → Need
  - "Netflix", "Dining" → Want
  - "SIP", "FD" → Savings
- ✅ **Learning:** Remember user's categorizations
- ✅ **Override:** User can always change category

---

## TIME & HISTORY REQUIREMENTS

### 10. Month Selector
- ✅ **Current Month Default** - Show current month by default
- ✅ **Month Navigation** - Previous/Next month buttons
- ✅ **Month Picker** - Dropdown to select any month
- ✅ **Year Navigation** - Can view previous years

### 11. Budget History
- ✅ **Persistent Storage** - Save budgets to localStorage
- ✅ **Historical View** - View any past month's budget
- ✅ **Data Retention** - Keep at least 12 months of history

### 12. Month-over-Month Comparison
- ✅ **Side-by-Side View** - Current vs Previous month
- ✅ **Change Indicators** - "↑ 10% increase in Needs"
- ✅ **Trend Arrows** - Visual indicators for increases/decreases
- ✅ **Percentage Changes** - Show % change for each category

### 13. Trend Analysis
- ✅ **Spending Trends** - Chart showing spending over 3-6 months
- ✅ **Category Trends** - How each category changed over time
- ✅ **Savings Rate Trend** - Track savings rate over time
- ✅ **Income Trend** - Track income changes

---

## GOALS & MOTIVATION REQUIREMENTS

### 14. Emergency Fund Tracking
- ✅ **Target Setting** - Set emergency fund goal (e.g., 6 months expenses)
- ✅ **Current Status** - Show current emergency fund amount
- ✅ **Progress Bar** - Visual progress toward goal
- ✅ **Contribution Tracking** - Track monthly contributions

### 15. Savings Goals
- ✅ **Multiple Goals** - Set multiple savings goals (vacation, house, etc.)
- ✅ **Target Amount** - Set target for each goal
- ✅ **Target Date** - Set deadline for each goal
- ✅ **Progress Tracking** - Show progress toward each goal
- ✅ **Monthly Contribution** - Calculate required monthly contribution

### 16. Progress Indicators
- ✅ **Financial Health Score** - 0-100 score based on:
  - Savings rate (20% = 100 points)
  - Needs percentage (≤50% = 100 points)
  - Wants percentage (≤30% = 100 points)
  - Emergency fund status
- ✅ **Visual Score Display** - Progress bar or gauge
- ✅ **Improvement Suggestions** - "Increase score by reducing Wants"

### 17. Achievement System (Optional)
- ✅ **Milestones** - "Saved ₹1L for the first time!"
- ✅ **Streaks** - "5 months of meeting savings goal"
- ✅ **Badges** - Visual rewards for achievements

---

## UX & TRUST REQUIREMENTS

### 18. Onboarding
- ✅ **First-Time User Guide** - Explain Needs/Wants/Savings
- ✅ **50/30/20 Rule Explanation** - What it means and why it matters
- ✅ **Interactive Tutorial** - Walk through adding first income/expense
- ✅ **Sample Data Option** - "Try with sample data" button

### 19. Tooltips & Help
- ✅ **Category Tooltips:**
  - **Needs:** Essential expenses (rent, food, utilities, insurance)
  - **Wants:** Discretionary spending (entertainment, dining, shopping)
  - **Savings:** Money set aside for future (investments, emergency fund)
- ✅ **Balance Tooltips:** Explain surplus vs allocated savings
- ✅ **Contextual Help** - Help icon next to confusing elements

### 20. Empty States
- ✅ **Guided Empty State** - "Start by adding your monthly income"
- ✅ **Action Buttons** - "Add Income" button in empty state
- ✅ **Example Data** - "Load example budget" option

### 21. Data Validation
- ✅ **Input Validation:**
  - Amount must be > 0
  - Amount must be < reasonable max (e.g., ₹1 crore)
  - Name cannot be empty
  - Name cannot be duplicate (optional)
- ✅ **Business Logic Validation:**
  - Warn if expenses > income
  - Warn if category exceeds limit
  - Warn if rule violation
- ✅ **Real-Time Feedback** - Show errors as user types

### 22. Export & Backup
- ✅ **Export to CSV** - Download budget data
- ✅ **Export to PDF** - Printable budget report
- ✅ **Import from CSV** - Restore from backup
- ✅ **Auto-Backup** - Automatic localStorage backup

### 23. Privacy Clarity
- ✅ **Data Storage Notice** - "All data is stored locally on your device"
- ✅ **No Cloud Sync** - Clear that data doesn't leave device
- ✅ **Clear Data Option** - Easy way to delete all data

---

## TECHNICAL REQUIREMENTS

### 24. Data Model
```typescript
interface Budget {
  id: string;
  month: string; // YYYY-MM
  income: IncomeSource[];
  expenses: Expense[];
  limits: {
    needs: number | null; // null = no limit
    wants: number | null;
    savings: number | null;
  };
  rules: {
    needsPercent: number; // default 50
    wantsPercent: number; // default 30
    savingsPercent: number; // default 20
  };
  goals: SavingsGoal[];
  createdAt: string;
  updatedAt: string;
}

interface IncomeSource {
  id: string;
  name: string;
  amount: number;
}

interface Expense {
  id: string;
  name: string;
  amount: number;
  category: 'Need' | 'Want' | 'Savings';
}

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string;
  currentAmount: number;
}
```

### 25. State Management
- ✅ **localStorage Persistence** - Save all budgets
- ✅ **React Hooks** - Custom hooks for business logic
- ✅ **State Structure** - Separate UI state from data state

### 26. Performance
- ✅ **Memoization** - Memoize expensive calculations
- ✅ **Lazy Loading** - Load historical data on demand
- ✅ **Optimistic Updates** - Update UI immediately, sync later

---

## ACCESSIBILITY REQUIREMENTS

### 27. ARIA Labels
- ✅ **Chart Labels** - Describe chart content
- ✅ **Button Labels** - Clear button purposes
- ✅ **Input Labels** - Associate labels with inputs

### 28. Keyboard Navigation
- ✅ **Tab Order** - Logical tab sequence
- ✅ **Keyboard Shortcuts** - Common actions via keyboard
- ✅ **Focus Indicators** - Visible focus states

### 29. Screen Reader Support
- ✅ **Semantic HTML** - Use proper HTML elements
- ✅ **Alt Text** - Describe images/charts
- ✅ **Live Regions** - Announce dynamic updates

### 30. Color & Contrast
- ✅ **Color Not Only Indicator** - Use text + color
- ✅ **WCAG AA Contrast** - Minimum 4.5:1 for text
- ✅ **Colorblind Friendly** - Test with colorblind simulators

---

## IMPLEMENTATION PRIORITY

### Phase 3.1: Critical Fixes (Must Have)
1. Fix balance calculation logic
2. Add time-based budgeting (month selector)
3. Add data persistence (localStorage)
4. Add category totals and percentages
5. Separate surplus from allocated savings

### Phase 3.2: Intelligence Layer (Must Have)
6. Implement 50/30/20 rule evaluation
7. Add warnings for rule violations
8. Add actionable suggestions
9. Add over-budget detection

### Phase 3.3: UX Improvements (Should Have)
10. Add onboarding/tooltips
11. Add empty states
12. Add validation and error handling
13. Improve visual hierarchy

### Phase 3.4: Advanced Features (Nice to Have)
14. Add savings goals
15. Add financial health score
16. Add export/import
17. Add month-over-month comparison

---

## SUCCESS CRITERIA

A "Smart Budget" app is successful when:

1. ✅ Users can clearly understand their financial situation
2. ✅ Users receive actionable advice on improving their budget
3. ✅ Users can track their progress over time
4. ✅ Users cannot misinterpret financial data
5. ✅ Users feel motivated to improve their financial health
6. ✅ The app prevents common budgeting mistakes
7. ✅ The app is accessible to all users
8. ✅ The app is reliable and doesn't lose data

---

**Next:** Proceed to Phase 3 (Implementation)
