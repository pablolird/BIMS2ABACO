# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

BIMS2ABACO is a single-page, client-only web tool that converts BIMS spreadsheet exports into a format compatible with Abaco, two accounting software packages used in Paraguay. All processing happens in the browser — no backend, no build step, no package manager. The app is hosted as a static site via GitHub Pages at the repo's Pages URL.

## Running the app

There is no build/install step. Just serve the directory statically and open `index.html`, e.g.:

```
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. Opening `index.html` directly via `file://` may hit CORS restrictions on the CDN scripts, so prefer a local server.

There are no tests, linter, or bundler configured in this repo (no `package.json`). Verify changes manually in the browser by uploading a sample BIMS `.xlsx` file and walking through the conversion flow.

## Architecture

- `index.html` — the entire UI: upload form, "Timbrados" management overlay/table, and processing/download status sections. Styling is Tailwind CSS loaded from the CDN (`cdn.tailwindcss.com`) plus Flowbite CSS. No JSX/templating — DOM elements for the timbrado table are built imperatively in `main.js`.
- `main.js` — all application logic, loaded as an ES module. It uses ExcelJS (loaded from CDN as the global `ExcelJS`) to read/write `.xlsx` workbooks in-browser.
- `favicon/` — static icon assets, not relevant to app logic.

### Conversion pipeline (`main.js`, the form's `submit` handler)

The BIMS → Abaco conversion is a fixed sequence of worksheet mutations performed in-place on an ExcelJS `Workbook`, in this order:

1. **Validate upload** — only `.xlsx` is accepted (extension check; MIME type must be the xlsx type or empty). The form handler then calls `processFile(file)`, which holds the rest of the pipeline and can be re-run after new timbrados are saved.
2. **Validate BIMS layout** — every header in `requiredBimsHeaders` (top of `main.js`) must be present in row 1, otherwise conversion stops with an alert listing the missing columns. BIMS-only columns (`Día`, `Sucursal`, `Retención`) are not deleted explicitly; step 6 drops every column not in `desiredOrder`.
3. **Rename columns** — BIMS header text is rewritten to Abaco header names per the `headerRenames` map via `getCellHeader` (case-sensitive match on trimmed row-1 header text).
4. **Insert new columns** — Abaco-only columns are added via `insertColumnWithDefault`, each pre-filled with a default value (empty string, `"0"`, `"GS"`, fixed account-name strings, etc.).
5. **Row-by-row transformations** — for each data row: reformat dates (`reformatDate`, ISO → `DD/MM/YYYY`), normalize/replace customer name and document values, derive `TIPO_DOCUMENTO_PERSONA` (RUC vs CEDULA_PARAGUAYA) from whether the document number contains a `-`, compute IVA/subtotal/total fields, set `CUOTAS` for credit-condition rows, mark zero-total rows as `ANULADO`/`INUTILIZADO`, and look up the row's `TIMBRADO` in the timbrado registry (see below).
6. **Reorder columns** — `reorderColumnsByHeaders` builds a brand-new worksheet with columns arranged per the `desiredOrder` array (top of `main.js`) and replaces the original worksheet, preserving its name. This is the master schema for the Abaco output format — when adding/renaming an output column, update `desiredOrder` too.
7. Processed workbook is held in memory (`processedWorkbook`) until the user clicks download, then serialized via `workbook.xlsx.writeBuffer()` and offered as a `Blob` download named `modified.xlsx`.

### Timbrado registry

"Timbrados" (Paraguayan invoice authorization codes) are stored in `localStorage` under the key `"timbrados"`, as a JSON map of `{ [timbradoCode]: { vencimiento, tipo } }`. Codes are trimmed via `normalizeTimbrado` before lookup (BIMS sometimes exports them with a leading tab) and written back as numbers when purely numeric. During row processing, every code missing from this map is collected; if any are missing, conversion stops before reordering and `showNewTimbradosForm` prompts for the expiration date and type of all of them at once. Submitting saves them to `localStorage` and re-runs `processFile` on the same selected file. A separate "Timbrados" overlay lets the user view, edit, or delete saved entries directly (table is regenerated via `generateTimbradoTable()` after any change).

## Conventions to preserve

- UI copy and labels are in Spanish; keep new user-facing strings consistent with that.
- Column/header identifiers (both BIMS source headers and Abaco output headers like `TIMBRADO_VENCIMIENTO`, `SUBTOTAL_10`) are matched by exact string value — trimming is applied in a few places but not universally, so keep header renames exact.
- No external JS dependencies are installed locally; ExcelJS, Tailwind, and Flowbite are all pulled from CDN `<script>`/`<link>` tags in `index.html`. If adding a dependency, follow the same CDN-script pattern rather than introducing a bundler.
