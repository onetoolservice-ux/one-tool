Feature: Analytics Report — Report Builder (MVP) + Table widget + Exports

Summary
-------
This PR delivers the Report Builder MVP (branch: feat/report-builder-table) and completes remaining export & preview functionality. The builder allows users to drag widgets (KPI / Chart / Table) onto a canvas, toggle Sample/Live data, set a date range, preview a dashboard snapshot, and export dashboards as PNG/PDF/CSV/XLSX.

Key features implemented
------------------------
- Report Builder UI: palette, canvas, drag & drop, save/load to localStorage
- Widgets:
  - KPI Tile (computeKpi)
  - Chart (pivotForChart)
  - Table widget (client-side pagination, single & multi-column sorting, visible columns)
- Sample/Live toggle and date-range filtering
- Preview snapshot modal (uses html2canvas) with Download PNG / Download PDF / Close actions
- Export flows:
  - Export PNG (image capture)
  - Export PDF (html2canvas + jsPDF)
  - Export CSV (uses `buildDashboardCsv` helper; caps large exports to 20k rows)
  - Export XLSX (uses `xlsx` dynamically; creates a sheet per table widget + `Widgets` metadata sheet)
- Helper utilities: `app/lib/analytics/export-utils.ts` (buildTableCsv, buildDashboardCsv)

Files changed / added
---------------------
- app/components/tools/analytics/report-builder/ReportBuilder.tsx (main builder + exports + preview modal)
- app/components/tools/analytics/report-builder/widgets/TableWidget.tsx (table widget)
- app/components/tools/analytics/report-builder/widgets/KpiTile.tsx
- app/components/tools/analytics/report-builder/widgets/ChartWidget.tsx
- app/lib/analytics/export-utils.ts (CSV builders)
- app/components/tools/analytics/report-builder/__tests__/* (table + config tests; NOTE: per direction, no further tests added now)
- Added `PR_DESCRIPTION_REPORT_BUILDER.md` (this file)

Important implementation/UX decisions
-------------------------------------
- Table widget: client-side pagination and sorting are prioritized; column resizing not included in this phase.
- Exports: Use client-side rendering for PNG/PDF snapshots (html2canvas). CSV builder supports concatenating widgets and truncates to first 20k rows to avoid OOMs in the browser. XLSX export creates separate sheets for each table and a summary sheet for non-table widgets.
- Keep code decoupled: widgets read `effectiveRows` computed from either sample generator or filtered rows.

Manual QA checklist
-------------------
1. Open the app and navigate to Tools → Analytics → Analytics Report
2. Open Report Builder
3. Drag a KPI, Chart, and Table from the palette onto the canvas
4. Toggle between Sample and Live modes, set a date range, verify the widgets update
5. Click "Preview Snapshot" — preview modal should open and display an image; try Download PNG and Download PDF
6. Try Export PNG / Export PDF — files should download
7. Export XLSX — opens a workbook with a `Widgets` sheet and sheets for any Table widgets
8. Export CSV — produces a single CSV combining widget outputs (tables use visible columns)

Follow-ups / Pending improvements
---------------------------------
- Add more test coverage for export flows (mocking `html2canvas`, `jsPDF`, `xlsx`) — intentionally postponed per current direction
- Accessibility/a11y review and focus trapping in the preview modal
- UI polish & UX microcopy for save/load dashboards

If you'd like, I can open a draft PR with this description and attach screenshots / a short demo GIF.