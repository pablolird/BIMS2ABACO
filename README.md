<p align='center'>
  <img width="600" height="250" alt="BIMS2ABACO (1)" src="https://github.com/user-attachments/assets/eb0f0add-07b1-43da-959a-3610846fd10b" />
</p>

[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000)](#)
[![HTML](https://img.shields.io/badge/HTML-%23E34F26.svg?logo=html5&logoColor=white)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-%2338B2AC.svg?logo=tailwind-css&logoColor=white)](#)

# BIMS2ABACO

**Live tool:** https://pablolird.github.io/BIMS2ABACO/

A browser-based converter that turns monthly sales exports from **BIMS** (a point-of-sale and invoicing platform) into the import format of **Abaco**, an accounting package used in Paraguay. It has been used every month since August 2025 by a small accounting firm to post a client's sales into Abaco.

> 🇵🇾 **Resumen:** BIMS2ABACO convierte el reporte mensual de ventas exportado desde BIMS al formato de importación de Abaco. Se sube el archivo `.xlsx`, se completan los datos de los timbrados nuevos (solo la primera vez) y se descarga el archivo listo para importar. Todo el procesamiento ocurre en el navegador: los datos nunca salen de la computadora.

<!-- Screenshots / GIF: upload → new-timbrado prompt → download, and a BIMS sheet next to the converted Abaco sheet -->

## The problem

The firm's client sells from two locations and issues around **4,000 invoices a month**. BIMS can export them as a spreadsheet, but its columns, header names, date format and tax breakdown don't match what Abaco imports. Without a converter, every invoice would have to be keyed into Abaco by hand, which the firm estimates at **~30 hours of data entry per month**.

## Results

| | |
|---|---|
| Invoices converted since Aug 2025 | **50,000+** (≈4,000/month, run monthly) |
| Time to convert one month (4,339 invoices) | **0.33 s**, or 0.65 s including writing the `.xlsx` ¹ |
| Manual data entry avoided | **~30 h/month** (firm's estimate) |
| Invoices imported into Abaco without errors | **~95%** ² |

¹ Median of 10 runs of `main.js` with ExcelJS on Node 25, Apple M1 Pro, using a real monthly export.
² The remaining rejections come from customer ID numbers mistyped by cashiers in BIMS, not from the conversion.

## How it works

1. **Upload** the monthly BIMS export (`.xlsx`).
2. **Validate** that every BIMS column the conversion depends on is present. If the export layout changed, the tool lists the missing columns instead of producing a wrong file.
3. **Rename and add columns.** 10 BIMS headers are mapped to their Abaco names, and 21 Abaco-only columns are added with defaults (currency, ledger accounts, document status…).
4. **Apply the business rules to every invoice:**
   - dates `YYYY-MM-DD` → `DD/MM/YYYY`
   - VAT (IVA) 10% and 5% subtotals and total VAT computed from BIMS's base + tax columns
   - customer ID type detected: numbers with a check digit (`1234567-8`) are **RUC**, the rest **CEDULA_PARAGUAYA**
   - walk-in / anonymous customers (`X`, `Cliente Ocasional`, `SIN NOMBRE`, `CD…`/`OF…` codes) → Abaco's generic `IMPORTES CONSOLIDADOS` / `44444401-7`
   - zero-total invoices marked `ANULADO` / `INUTILIZADO`; credit sales get `CUOTAS = 1`
   - each invoice's **timbrado** (the tax authority's invoice-authorization code) is looked up to fill in its expiry date and type
5. **Ask once for new timbrados.** If the file contains timbrados the tool hasn't seen, it asks for all of them in a single form, saves them, and finishes the conversion automatically. Saved timbrados can be viewed, edited and deleted from the **Timbrados** panel.
6. **Reorder** into Abaco's 31-column layout and **download** the result.

### Column mapping

| BIMS | Abaco |
|---|---|
| Fecha de Emisión | `FECHA` |
| Tipo de Comprobante | `CONDICION` |
| Número de Comprobante | `FACTURA` |
| Código de Timbrado | `TIMBRADO` (+ `TIMBRADO_VENCIMIENTO`, `TIPO_DOCUMENTO` from the registry) |
| Número de Documento | `DOCUMENTO_PERSONA` (+ `TIPO_DOCUMENTO_PERSONA`) |
| Nombre / Razón Social | `NOMBRE_PERSONA` |
| IVA 10 Base Imponible + IVA 10 Impuesto | `SUBTOTAL_10` |
| IVA 5 Base Imponible + IVA 5 Impuesto | `SUBTOTAL_05` |
| IVA 10 Impuesto / IVA 5 Impuesto | `LIQUIDACION_IVA_10` / `LIQUIDACION_IVA_05` (+ `LIQUIDACION_IVA_TOTAL`) |
| Exento | `SUBTOTAL_EXENTAS` |
| Total | `TOTAL_BRUTO`, `TOTAL` |
| CDC | `CDC` |
| Día, Sucursal, Retención | *(dropped)* |

## Architecture

```
index.html   UI: upload form, new-timbrado prompt, Timbrados panel, download
main.js      conversion pipeline + timbrado registry (ES module)
```

- **No backend.** The file is read, transformed and written entirely in the browser with [ExcelJS](https://github.com/exceljs/exceljs). Client financial data never leaves the user's computer, and hosting on GitHub Pages costs nothing.
- **No build step.** ExcelJS, Tailwind CSS and Flowbite load from CDNs.
- **Timbrado registry** is stored in the browser's `localStorage` as `{ code: { vencimiento, tipo } }`, so each timbrado only has to be entered once per machine.

## Running locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000. Opening `index.html` straight from the file system can hit CORS issues with the CDN scripts.

## Limitations

- Only `.xlsx` exports are supported.
- The timbrado registry lives in one browser's `localStorage`; it isn't shared between computers.
- The whole workbook is loaded into memory, which is fine for monthly exports (thousands of rows) but not designed for very large files.
