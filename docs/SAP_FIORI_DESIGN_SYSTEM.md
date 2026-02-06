# SAP Fiori Design System - Enterprise Finance Tools
## Foundation for OneTool Finance Ecosystem

### Design Philosophy
**Core Principle**: Optimize for 6-8 hour daily use by finance professionals (Accountants, Controllers, Managers)

**Non-Negotiables**:
- Information density over aesthetics
- Speed and efficiency over visual flair
- Predictability over surprise
- Stability over innovation
- Data-first over emotion-first

---

## 1. Layout Architecture

### Application Shell
```
┌─────────────────────────────────────────────────────────┐
│ Top Navigation (Fixed, 48px height)                     │
├─────────────────────────────────────────────────────────┤
│ Object Header (Dynamic, compact, left-aligned)          │
├─────────────────────────────────────────────────────────┤
│ MessageStrip Area (Conditional, 40px max)               │
├─────────────────────────────────────────────────────────┤
│ Content Area (Full-width, no side margins)               │
│ ┌──────────────┬──────────────┬──────────────┐         │
│ │ Facet 1      │ Facet 2      │ Facet 3      │         │
│ │ (Fixed width)│ (Flex)       │ (Fixed width)│         │
│ └──────────────┴──────────────┴──────────────┘         │
│ ┌──────────────────────────────────────────────┐        │
│ │ Section (Full width, grid-based)             │        │
│ └──────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

### Key Rules
- **NO decorative padding** at page level
- **NO max-width constraints** (full viewport width)
- **NO floating cards** (sections anchor to grid)
- **Strict 8px grid** for all spacing
- **Consistent section heights** where possible

---

## 2. Spacing System (8px Grid)

### Base Unit: 8px
```
xs:  8px  (0.5rem)  - Tight spacing, table cells
sm:  16px (1rem)    - Section padding, field spacing
md:  24px (1.5rem)  - Section gaps, card padding
lg:  32px (2rem)    - Major section separation
xl:  40px (2.5rem)  - Page-level spacing (rare)
```

### Application
- **Section padding**: 16px (sm)
- **Section gaps**: 24px (md)
- **Field spacing**: 8px (xs)
- **Table cell padding**: 8px vertical, 12px horizontal
- **Card padding**: 16px (sm)

---

## 3. Typography Scale (Data-First)

### Font Sizes
```
xs:   12px (0.75rem)  - Labels, metadata, table text
sm:   14px (0.875rem) - Body text, form inputs
base: 16px (1rem)     - Section headers, primary data
lg:   18px (1.125rem) - Page title
xl:   20px (1.25rem)  - KPI values (rare)
```

### Font Weights
```
normal:  400 - Body text, labels
medium:  500 - Section headers, field labels
semibold: 600 - KPI labels, table headers
bold:    700 - Page title, critical data (sparingly)
```

### Line Heights
```
tight:   1.25 - Headers, KPIs
normal:  1.5  - Body text
relaxed: 1.75 - Long-form content (avoid in dense layouts)
```

### Color Hierarchy
```
Primary Text:   #212121 (slate-900)
Secondary Text: #616161 (slate-600)
Tertiary Text:  #9E9E9E (slate-400)
```

---

## 4. Color System (Neutral Base + Semantic)

### Base Palette
```
Background:     #FAFAFA (slate-50)
Surface:        #FFFFFF (white)
Border:         #E0E0E0 (slate-200)
Divider:        #E0E0E0 (slate-200)
```

### Semantic Colors (Use Sparingly)
```
Error:    #D32F2F (red-700)   - Critical issues only
Warning:  #F57C00 (orange-700) - Important notices
Success:  #388E3C (green-700)  - Positive confirmation
Info:     #1976D2 (blue-700)   - Informational (rare)
```

### Rules
- **Never use semantic colors decoratively**
- **Never use more than 2 semantic colors per screen**
- **Prefer neutral grays for 90% of UI**
- **Color = meaning, not decoration**

---

## 5. Component Patterns

### Object Header
```
┌─────────────────────────────────────────────────┐
│ Monthly Budget Overview    [January 2026]      │
│ Status: Overspending ₹3,000 (Critical)         │
└─────────────────────────────────────────────────┘
```
- Height: 56px (compact)
- Left-aligned
- No decorative elements
- Status badge (semantic color only)

### MessageStrip
```
┌─────────────────────────────────────────────────┐
│ ⚠ Overspending by ₹3,000. Reduce Wants.        │
└─────────────────────────────────────────────────┘
```
- Height: 40px max
- Full-width
- No card styling
- Icon + text only
- Dismissible

### Facet (Sidebar)
```
┌──────────────┐
│ Financial    │
│ Health       │
│              │
│ Score: 76    │
│ Grade: B     │
│              │
│ Breakdown:   │
│ • Savings: 28│
│ • Needs: 18  │
│ • Wants: 30  │
└──────────────┘
```
- Fixed width: 280px
- Compact padding: 16px
- No shadows
- Subtle border
- Same height as main content

### Section (Main Content)
```
┌──────────────────────────────────────────────┐
│ Budget Breakdown                              │
│ ┌──────────────────────────────────────────┐ │
│ │ [Chart/Table]                            │ │
│ └──────────────────────────────────────────┘ │
│                                               │
│ Income & Expenses                             │
│ ┌──────────────────────────────────────────┐ │
│ │ [Table/Form]                             │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```
- Full-width or flex
- Consistent padding: 16px
- Subtle border or divider
- No rounded corners (or minimal: 4px)
- No shadows

### KPI Header
```
┌──────────────────────────────────────────────┐
│ Total Income    Total Expenses    Savings    │
│ ₹50,000         ₹43,000          ₹10,000    │
└──────────────────────────────────────────────┘
```
- Horizontal layout
- Equal width columns
- Right-aligned numbers
- Small labels above
- No decorative elements

### Table (Primary Data Display)
```
┌──────────────────────────────────────────────┐
│ Name          Category    Amount    Actions   │
├──────────────────────────────────────────────┤
│ Rent          Need        ₹20,000   [Edit]    │
│ Groceries     Need        ₹8,000    [Edit]    │
│ Dining        Want        ₹6,000    [Edit]    │
└──────────────────────────────────────────────┘
```
- Compact rows: 40px height
- Minimal padding: 8px vertical
- Clear borders/dividers
- Inline actions
- Sortable headers

---

## 6. Information Density Rules

### Vertical Spacing
- **Between sections**: 24px (md)
- **Within sections**: 16px (sm)
- **Between fields**: 8px (xs)
- **Table rows**: 0px (borders only)

### Horizontal Spacing
- **Section padding**: 16px (sm)
- **Field padding**: 12px horizontal
- **Icon-text gap**: 8px (xs)

### Density Targets
- **Minimum 3-4 sections visible** without scrolling on 1920x1080
- **Table shows 8-10 rows** without scrolling
- **No single section taller than 400px** (split if needed)

---

## 7. Grid System

### Breakpoints
```
sm:  640px  - 1 column
md:  768px  - 2 columns
lg:  1024px - 3 columns
xl:  1280px - 4 columns
2xl: 1536px - 5 columns
```

### Column Structure
```
Desktop (lg+):
┌──────────┬──────────┬──────────┐
│ Facet    │ Section  │ Facet    │
│ 280px    │ Flex     │ 280px    │
└──────────┴──────────┴──────────┘

Tablet (md):
┌──────────┬──────────┐
│ Facet    │ Section  │
│ 240px    │ Flex     │
└──────────┴──────────┘

Mobile (sm):
┌──────────┐
│ Section  │
│ Full     │
└──────────┘
```

---

## 8. Interaction Patterns

### Focus States
- **Outline**: 2px solid #1976D2 (blue-700)
- **No shadow effects**
- **Clear, visible, accessible**

### Hover States
- **Background**: #F5F5F5 (slate-100)
- **Subtle, not decorative**
- **Only on interactive elements**

### Loading States
- **Skeleton screens** (not spinners)
- **Maintain layout structure**
- **No decorative animations**

---

## 9. Content Strategy

### Language Rules
- **Action-focused**: "Reduce Wants by ₹3,000" not "Consider reducing..."
- **Data-first**: Show numbers, not feelings
- **Direct**: "Overspending" not "You're spending more than you earn"
- **No coaching**: Remove motivational language
- **No gamification**: Remove scores, badges, achievements

### Information Hierarchy
1. **Critical data** (KPIs, totals)
2. **Actionable items** (what to fix)
3. **Supporting data** (breakdowns, details)
4. **Metadata** (dates, filters)

---

## 10. Component Library

### Core Components
- `ObjectHeader` - Page title and status
- `MessageStrip` - Alerts and notices
- `Facet` - Sidebar information panels
- `Section` - Main content containers
- `KPIHeader` - Key metrics display
- `DataTable` - Primary data display
- `FieldGroup` - Related fields together
- `ActionBar` - Toolbar with actions

### Reusable Patterns
- **Two-column layout**: Facet + Section
- **Three-column layout**: Facet + Section + Facet
- **Full-width section**: For tables and charts
- **Compact form**: Inline editing, minimal padding

---

## 11. Implementation Checklist

### Layout
- [ ] Full-width application shell
- [ ] No decorative padding at page level
- [ ] Strict 8px grid system
- [ ] Consistent section heights
- [ ] Grid-based alignment

### Typography
- [ ] Reduced font sizes (data-first)
- [ ] Tight line heights
- [ ] Neutral color hierarchy
- [ ] Right-aligned numbers

### Components
- [ ] MessageStrip instead of cards
- [ ] Facets for sidebar info
- [ ] Sections for main content
- [ ] Tables for data display
- [ ] KPI headers for metrics

### Density
- [ ] Reduced padding throughout
- [ ] Compact tables (40px rows)
- [ ] Side-by-side sections
- [ ] Minimize scrolling

### Content
- [ ] Action-focused language
- [ ] Remove emotional copy
- [ ] Data-first presentation
- [ ] No decorative elements

---

## 12. Ecosystem Consistency

### Application Across Tools
This design system applies to:
- Smart Budget
- Smart Loan
- Smart SIP
- Smart Net Worth
- Smart Retirement
- GST Calculator
- All Finance Tools

### Trademark Elements
- **Object Header pattern** (consistent across all tools)
- **MessageStrip styling** (same everywhere)
- **Facet/Section layout** (predictable structure)
- **Color system** (neutral base + semantic)
- **Typography scale** (data-first)
- **Grid system** (8px base)

### Brand Identity
- **Stability**: Predictable, consistent
- **Efficiency**: Dense, fast, keyboard-friendly
- **Professional**: Enterprise-grade, serious
- **Trustworthy**: Data-first, no fluff

---

**Status**: Design System Defined
**Next**: Implement in Smart Budget component
