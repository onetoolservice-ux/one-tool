# Phase 3: Comprehensive Tool Migration Plan

**Status:** In Progress  
**Strategy:** Batch migrations by complexity and category  
**Goal:** Migrate all 34 tools to use shared components

## Migration Batches

### Batch 1: Simple Finance Calculators ✅ (Partially Complete)
- ✅ GST Calculator (DONE)
- ⏳ SIP Calculator
- ⏳ Loan Calculator  
- ⏳ Retirement Planner
- ⏳ Net Worth Tracker
- ⏳ Finance Calculator

### Batch 2: Document Tools
- ⏳ CSV Studio
- ⏳ Markdown Studio
- ⏳ File Uploader
- ⏳ Image Compressor
- ⏳ Image Converter

### Batch 3: Developer Tools
- ⏳ JWT Debugger
- ⏳ Cron Generator
- ⏳ Git Cheats
- ⏳ Diff Studio
- ⏳ Smart Editor (JSON/SQL)

### Batch 4: AI Tools
- ⏳ Prompt Generator (improvements)
- ⏳ Sentiment Analyzer
- ⏳ AI Chat

### Batch 5: Remaining Simple Tools
- ⏳ Health Tools (BMI, Breathing, HIIT)
- ⏳ Design Tools (Color Picker, Color Studio)
- ⏳ QR Generator
- ⏳ Pomodoro Timer

### Batch 6: Complex Tools (Last)
- ⏳ Budget Planner
- ⏳ Life OS
- ⏳ Invoice Generator
- ⏳ Universal Converter
- ⏳ API Playground
- ⏳ PDF Tools

## Migration Checklist Per Tool

For each tool:
- [ ] Replace custom inputs → `Input`/`Textarea`
- [ ] Replace custom buttons → `Button`
- [ ] Replace copy logic → `CopyButton`
- [ ] Add error handling (if missing)
- [ ] Add loading states (if async)
- [ ] Use helper functions (`formatCurrency`, etc.)
- [ ] Verify build
- [ ] Test functionality

## Progress Tracker

**Completed:** 3/34 (9%)  
**In Progress:** Batch 1  
**Next:** Continue with finance calculators
