const desiredOrder = [
    "FECHA",
    "TIPO_DOCUMENTO",
    "FACTURA",
    "SERIE",
    "CDC",
    "TIMBRADO",
    "TIMBRADO_VENCIMIENTO",
    "TIPO_DOCUMENTO_PERSONA",
    "DOCUMENTO_PERSONA",
    "NOMBRE_PERSONA",
    "SUBTOTAL_10",
    "SUBTOTAL_05",
    "SUBTOTAL_EXENTAS",
    "LIQUIDACION_IVA_10",
    "LIQUIDACION_IVA_05",
    "LIQUIDACION_IVA_TOTAL",
    "TOTAL_BRUTO",
    "REDONDEO",
    "TOTAL",
    "MONEDA",
    "TOTAL_GS",
    "CONDICION",
    "CUOTAS",
    "CUENTA_10",
    "CUENTA_05",
    "CUENTA_00",
    "CUENTA_DEBE",
    "TRANSACCION",
    "ESTADO_DOCUMENTO",
    "MOTIVO",
    "OBSERVACIÓN"
];

// BIMS header -> Abaco header
const headerRenames = {
    "Tipo de Comprobante": "CONDICION",
    "Fecha de Emisión": "FECHA",
    "Número de Comprobante": "FACTURA",
    "Código de Timbrado": "TIMBRADO",
    "Número de Documento": "DOCUMENTO_PERSONA",
    "Nombre / Razón Social": "NOMBRE_PERSONA",
    "Exento": "SUBTOTAL_EXENTAS",
    "IVA 10 Impuesto": "LIQUIDACION_IVA_10",
    "IVA 5 Impuesto": "LIQUIDACION_IVA_05",
    "Total": "TOTAL_BRUTO"
};

// Every BIMS column the conversion reads. Files missing any of these are rejected before processing.
const requiredBimsHeaders = [
    ...Object.keys(headerRenames),
    "IVA 10 Base Imponible",
    "IVA 5 Base Imponible"
];

const fileInput = document.getElementById('fileInput');

const downloadBtn = document.getElementById('downloadBtn');

const in_process_section = document.querySelector('.in-process');

const download_section = document.querySelector('.finished');

const form = document.querySelector('.main-form');

const timbrado_overlay = document.querySelector('.timbrado-overlay');

const timbrado_form = document.querySelector('.timbrado-form');

const timbrado_list = document.querySelector('.timbrado-list');

const timbrado_cancel_button = document.querySelector('.cancel-button');

const timbrado_section_button = document.querySelector('.timbrado-section__button');

const timbrado_section = document.querySelector('.timbrado-section__overlay');

const timbrado_section_salir_button = document.querySelector('.timbrado-section__salir');

timbrado_section_salir_button.addEventListener('click', (event) => {
    timbrado_section.classList.toggle('hidden');
})

let processedWorkbook = null; // store after processing

// Save every new timbrado from the prompt, then re-run the conversion on the same file
timbrado_form.addEventListener('submit', (event) => {
    event.preventDefault();
    let timbrados = JSON.parse(localStorage.getItem("timbrados") || "{}");

    timbrado_list.querySelectorAll('.new-timbrado').forEach(entry => {
        timbrados[entry.dataset.timbrado] = {
            vencimiento: entry.querySelector('input[type="date"]').value,
            tipo: entry.querySelector('select').value
        };
    });

    localStorage.setItem("timbrados", JSON.stringify(timbrados));
    generateTimbradoTable();
    timbrado_overlay.classList.add("hidden");
    processFile(fileInput.files[0]);
})

timbrado_section_button.addEventListener('click', (event) => {
    timbrado_section.classList.toggle('hidden');
})

timbrado_cancel_button.addEventListener('click', (event) => {
    timbrado_overlay.classList.add("hidden");
})

function showNewTimbradosForm(codes) {
    timbrado_list.replaceChildren();

    codes.forEach(code => {
        const entry = document.createElement("div");
        entry.classList.add("new-timbrado", "p-3", "rounded-lg", "border", "border-gray-600");
        entry.dataset.timbrado = code;

        const title = document.createElement("p");
        title.classList.add("font-bold", "mb-2");
        title.textContent = `Timbrado ${code}`;

        const vencLabel = document.createElement("label");
        vencLabel.classList.add("block", "mb-2", "text-sm", "font-medium", "text-white");
        vencLabel.textContent = "Vencimiento";
        const vencInput = document.createElement("input");
        vencInput.type = "date";
        vencInput.required = true;
        vencInput.classList.add("mb-3", "border", "text-sm", "rounded-lg", "block", "w-full", "p-2.5", "bg-gray-800", "border-gray-600", "text-white");
        vencLabel.appendChild(vencInput);

        const tipoLabel = document.createElement("label");
        tipoLabel.classList.add("block", "mb-2", "text-sm", "font-medium", "text-white");
        tipoLabel.textContent = "Tipo";
        const tipoSelect = document.createElement("select");
        tipoSelect.classList.add("border", "text-sm", "rounded-lg", "block", "w-full", "p-2.5", "bg-gray-800", "border-gray-600", "text-white");
        ["PREIMPRESO", "AUTOIMPRESO"].forEach(tipo => {
            const option = document.createElement("option");
            option.value = tipo;
            option.textContent = tipo;
            tipoSelect.appendChild(option);
        });
        tipoLabel.appendChild(tipoSelect);

        entry.append(title, vencLabel, tipoLabel);
        timbrado_list.appendChild(entry);
    });

    timbrado_overlay.classList.remove("hidden");
}

// BIMS sometimes exports timbrado codes with stray whitespace (e.g. a leading tab)
function normalizeTimbrado(value) {
    return value == null ? "" : value.toString().trim();
}

generateTimbradoTable()

function generateTimbradoTable() {
    const timbradosData = JSON.parse(localStorage.getItem("timbrados") || "{}");
    const container = document.querySelector(".timbrado-section");
    
    // Clear previous table
    const oldTable = container.querySelector("table");
    if (oldTable) {
        container.removeChild(oldTable);
    }

    const table = document.createElement("table");
    table.classList.add("table-auto", "border", "border-collapse", "w-full", "mt-4");

    const headerRow = document.createElement("tr");
    ["Timbrado", "Fecha de Vencimiento", "Tipo", "Acciones"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        th.classList.add("border", "px-4", "py-2");
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    for (const [id, object] of Object.entries(timbradosData)) {
        const row = document.createElement("tr");

        // Timbrado Cell
        const idTd = document.createElement("td");
        idTd.classList.add("border", "px-4", "py-2");
        const idInput = document.createElement("input");
        idInput.type = "text";
        idInput.value = id;
        idInput.readOnly = true; 
        idInput.classList.add("bg-transparent", "w-fit");
        idTd.appendChild(idInput);
        row.appendChild(idTd);
        
        // Expiration Cell
        const expirationTd = document.createElement("td");
        expirationTd.classList.add("border", "px-4", "py-2");
        const expirationInput = document.createElement("input");
        expirationInput.type = "date";
        expirationInput.value = object.vencimiento;
        expirationInput.readOnly = true;
        expirationInput.classList.add("bg-transparent", "w-fit");
        expirationTd.appendChild(expirationInput);
        row.appendChild(expirationTd);
        
        // Type Cell
        const typeTd = document.createElement("td");
        typeTd.classList.add("border", "px-4", "py-2");


        const optionsData = [
            { value: 'PREIMPRESO', text: 'PREIMPRESO' },
            { value: 'AUTOIMPRESO', text: 'AUTOIMPRESO' },
        ];

        const typeInput = document.createElement("select");
        typeInput.classList.add("bg-transparent", "w-fit");

        optionsData.forEach(optionInfo => {
            const option = document.createElement('option');
            option.className = "bg-slate-800 text-white";
            option.value = optionInfo.value;
            option.textContent = optionInfo.text; // or option.innerText = optionInfo.text;
            typeInput.appendChild(option);
        });

        typeInput.value = object.tipo;
        typeInput.disabled = true;
        typeInput.classList.add("bg-transparent", "w-full");
        typeTd.appendChild(typeInput);
        row.appendChild(typeTd);

        // Actions Cell
        const actionsTd = document.createElement("td");
        actionsTd.classList.add("border", "px-4", "py-2");

        const editButton = document.createElement("button");
        editButton.textContent = "Editar";
        editButton.classList.add("bg-yellow-500", "hover:bg-yellow-600", "text-white", "font-bold", "py-1", "px-2", "rounded", "mr-2");
        
        const saveButton = document.createElement("button");
        saveButton.textContent = "Guardar";
        saveButton.classList.add("bg-green-500", "hover:bg-green-600", "text-white", "font-bold", "py-1", "px-2", "rounded", "mr-2", "hidden");

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Eliminar";
        deleteButton.classList.add("bg-red-500", "hover:bg-red-600", "text-white", "font-bold", "py-1", "px-2", "rounded");

        actionsTd.appendChild(editButton);
        actionsTd.appendChild(saveButton);
        actionsTd.appendChild(deleteButton);
        row.appendChild(actionsTd);

        // Event Listeners
        editButton.addEventListener('click', () => {
            expirationInput.readOnly = false;
            typeInput.disabled = false;
            editButton.classList.add('hidden');
            saveButton.classList.remove('hidden');
        });

        saveButton.addEventListener('click', () => {
            const oldId = id;
            const newId = idInput.value;
            const newExpiration = expirationInput.value;
            const newType = typeInput.value;

            let timbrados = JSON.parse(localStorage.getItem("timbrados") || "{}");
            
            if (oldId !== newId) {
                delete timbrados[oldId];
            }
            timbrados[newId].vencimiento = newExpiration;
            timbrados[newId].tipo = newType;
            
            localStorage.setItem("timbrados", JSON.stringify(timbrados));

            idInput.readOnly = true;
            expirationInput.readOnly = true;
            typeInput.readOnly = true;
            editButton.classList.remove('hidden');
            saveButton.classList.add('hidden');
            
            generateTimbradoTable(); // Redraw the table
        });

        deleteButton.addEventListener('click', () => {
            let timbrados = JSON.parse(localStorage.getItem("timbrados") || "{}");
            delete timbrados[id];
            localStorage.setItem("timbrados", JSON.stringify(timbrados));
            generateTimbradoTable(); // Redraw the table
        });

        table.appendChild(row);
    }

    container.appendChild(table);
}


function reformatDate(fechaCell) {
    if (fechaCell && fechaCell.value) {
        let dateVal = fechaCell.value;
        if (dateVal instanceof Date) {
            if (!isNaN(dateVal.getTime())) { // Check for valid date
                const day = String(dateVal.getUTCDate()).padStart(2, '0');
                const month = String(dateVal.getUTCMonth() + 1).padStart(2, '0');
                const year = dateVal.getUTCFullYear();
                fechaCell.value = `${day}/${month}/${year}`;
            }
        } else if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateVal)) {
            const [year, month, day] = dateVal.substring(0, 10).split('-');
            fechaCell.value = `${day}/${month}/${year}`;
        }
    }
}

function reorderColumnsByHeaders(worksheet, desiredHeaders) {
    const headerRow = worksheet.getRow(1);

    // 1. Build a map from header name to column index
    const headerToIndex = {};
    for (let col = 1; col <= headerRow.cellCount; col++) {
        const headerValue = headerRow.getCell(col).value;
        if (headerValue) headerToIndex[headerValue.toString().trim()] = col;
    }

    // 2. Create a new worksheet to hold reordered data
    const newWorksheet = worksheet.workbook.addWorksheet('Reordered');

    // 3. Copy rows, rearranging columns in the desired order
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        const newRowValues = [];

        desiredHeaders.forEach((header, i) => {
            const oldColIndex = headerToIndex[header];
            if (oldColIndex !== undefined) {
                newRowValues[i + 1] = row.getCell(oldColIndex).value;
            } else {
                newRowValues[i + 1] = null; // or "" if you prefer
            }
        });

        newWorksheet.addRow(newRowValues);
    });

    // 4. Optional: delete original worksheet if you want
    // worksheet.workbook.removeWorksheet(worksheet.id);

    // 5. Return new worksheet for further use
    return newWorksheet;
}

function getCellHeader(worksheet, headerName) {
    const headerRow = worksheet.getRow(1); // assuming first row has headers
    for (let colIndex = 1; colIndex <= headerRow.cellCount; colIndex++) {
        const value = headerRow.getCell(colIndex).value;
        if (value != null && value.toString().trim() === headerName) {
            return headerRow.getCell(colIndex);
        }
    }
    return -1; // not found
}

function insertColumnWithDefault(worksheet, position, headerName, defaultValue) {
    // 1. Insert the new column
    worksheet.spliceColumns(position, 0, []); // empty column

    // 2. Set the header
    worksheet.getRow(1).getCell(position).value = headerName;

    // 3. Fill default value until the last data row
    const lastRow = worksheet.actualRowCount;
    for (let rowIndex = 2; rowIndex <= lastRow; rowIndex++) {
        worksheet.getRow(rowIndex).getCell(position).value = defaultValue;
    }
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    timbrado_overlay.classList.add("hidden");
    in_process_section.classList.add('hidden');
    download_section.classList.add('hidden')


    // Security checkings
    const selectedFile = fileInput.files[0];
    if (!selectedFile) {
        alert("Por favor seleccione un archivo.");
        return;
    }

    // Only .xlsx is supported (ExcelJS reads it via workbook.xlsx).
    // Some browsers/OSes report an empty MIME type for .xlsx, so only reject a known-wrong one.
    const xlsxMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();

    if (fileExtension !== 'xlsx' || (selectedFile.type && selectedFile.type !== xlsxMimeType)) {
        alert("Solo se permiten archivos de Excel (.xlsx).");
        return;
    }

    await processFile(selectedFile);
});

async function processFile(file) {
    processedWorkbook = null;
    download_section.classList.add('hidden');
    in_process_section.classList.remove('hidden');

    try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);

        const worksheet = workbook.worksheets[0];

        // ----------- VALIDATE BIMS LAYOUT --------------
        const missingHeaders = requiredBimsHeaders.filter(header => getCellHeader(worksheet, header) === -1);
        if (missingHeaders.length > 0) {
            in_process_section.classList.add('hidden');
            alert("El archivo no tiene el formato esperado de BIMS. Faltan las columnas:\n- " + missingHeaders.join("\n- "));
            return;
        }

        // BIMS-only columns (Día, Sucursal, Retención, ...) don't need deleting:
        // reorderColumnsByHeaders only keeps the columns listed in desiredOrder.

        // ----------- RENAME COLUMNS --------------
        for (const [bimsHeader, abacoHeader] of Object.entries(headerRenames)) {
            getCellHeader(worksheet, bimsHeader).value = abacoHeader;
        }

        // ----------- INSERT NEW COLUMNS WITH DEFAULTS --------------
        // Note: Inserting all at position 1 adds them in reverse order, which is fine since we reorder them later.
        insertColumnWithDefault(worksheet, 1, "TIPO_DOCUMENTO", "");
        insertColumnWithDefault(worksheet, 1, "SERIE", "");
        insertColumnWithDefault(worksheet, 1, "CDC", "");
        insertColumnWithDefault(worksheet, 1, "TIMBRADO_VENCIMIENTO", "");
        insertColumnWithDefault(worksheet, 1, "TIPO_DOCUMENTO_PERSONA", "");
        insertColumnWithDefault(worksheet, 1, "SUBTOTAL_10", "");
        insertColumnWithDefault(worksheet, 1, "SUBTOTAL_05", "");
        insertColumnWithDefault(worksheet, 1, "LIQUIDACION_IVA_TOTAL", "");
        insertColumnWithDefault(worksheet, 1, "REDONDEO", "0");
        insertColumnWithDefault(worksheet, 1, "TOTAL", "");
        insertColumnWithDefault(worksheet, 1, "MONEDA", "GS");
        insertColumnWithDefault(worksheet, 1, "TOTAL_GS", "0.00");
        insertColumnWithDefault(worksheet, 1, "CUOTAS", "0");
        insertColumnWithDefault(worksheet, 1, "CUENTA_10", "VENTA DE MERCADERÍAS GRAV. 10%");
        insertColumnWithDefault(worksheet, 1, "CUENTA_05", "VENTA DE MERCADERÍAS GRAV. 05%");
        insertColumnWithDefault(worksheet, 1, "CUENTA_00", "VENTAS DE MERCADERÍAS EXENTAS DEL IVA");
        insertColumnWithDefault(worksheet, 1, "CUENTA_DEBE", "");
        insertColumnWithDefault(worksheet, 1, "TRANSACCION", "");
        insertColumnWithDefault(worksheet, 1, "ESTADO_DOCUMENTO", "ACTIVO");
        insertColumnWithDefault(worksheet, 1, "MOTIVO", "");
        insertColumnWithDefault(worksheet, 1, "OBSERVACIÓN", "");

        let timbrados = JSON.parse(localStorage.getItem("timbrados") || "{}");
        const unknownTimbrados = new Set();
        // ----------- PERFORM DATA TRANSFORMATIONS AND CALCULATIONS -----------
        
        // 1. Get all column indices by header name for efficient access
        const colIndexes = {};
        worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell, colNumber) => {
            if (cell.value) {
                colIndexes[cell.value.toString().trim()] = colNumber;
            }
        });

        // 2. Iterate through each data row to apply all transformations
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) return; // Skip the header row

            // Task: Reformat "FECHA" from YYYY-MM-DD to DD/MM/YYYY
            const fechaCell = row.getCell(colIndexes['FECHA']);
            reformatDate(fechaCell);
            
            // Task: Manipulate "NOMBRE_PERSONA" (replace and uppercase)
            const nombrePersonaCell = row.getCell(colIndexes['NOMBRE_PERSONA']);
            if (nombrePersonaCell && nombrePersonaCell.value) {
                let nombre = nombrePersonaCell.value.toString().trim();
                if (nombre === "Cliente  Ocasional" || nombre === "SIN NOMBRE") {
                    nombre = "IMPORTES CONSOLIDADOS";
                }
                nombrePersonaCell.value = nombre.toUpperCase();
            }

            // Task: Replace value in "DOCUMENTO_PERSONA"
            const docPersonaCell = row.getCell(colIndexes['DOCUMENTO_PERSONA']);
            if (docPersonaCell && docPersonaCell.value) {
                const docValue = docPersonaCell.value.toString().trim();
                if (docValue === 'X') {
                    docPersonaCell.value = "44444401-7";
                } else if (docValue.startsWith('CD') || docValue.startsWith('OF')) {
                    docPersonaCell.value = "44444401-7";
                    row.getCell(colIndexes['TIPO_DOCUMENTO_PERSONA']).value = "RUC";
                    row.getCell(colIndexes['NOMBRE_PERSONA']).value = "IMPORTES CONSOLIDADOS";
                }
            }
            
            // Task: Conditional "TIPO_DOCUMENTO_PERSONA"
            const tipoDocPersonaCell = row.getCell(colIndexes['TIPO_DOCUMENTO_PERSONA']);
            if (docPersonaCell && docPersonaCell.value && tipoDocPersonaCell) {
                if (!tipoDocPersonaCell.value) { // Only set if not already set by the special case above
                    tipoDocPersonaCell.value = docPersonaCell.value.toString().includes('-') 
                        ? "RUC" 
                        : "CEDULA_PARAGUAYA";
                }
            }
            
            // --- Calculations ---
            // Get values from source columns, defaulting to 0 if not a number
            const liqIva10 = Number(row.getCell(colIndexes['LIQUIDACION_IVA_10']).value) || 0;
            const baseIva10 = Number(row.getCell(colIndexes['IVA 10 Base Imponible']).value) || 0;
            
            const liqIva05 = Number(row.getCell(colIndexes['LIQUIDACION_IVA_05']).value) || 0;
            const baseIva05 = Number(row.getCell(colIndexes['IVA 5 Base Imponible']).value) || 0;

            const totalBruto = row.getCell(colIndexes['TOTAL_BRUTO']).value;

            // Task: Calculate "SUBTOTAL_10"
            row.getCell(colIndexes['SUBTOTAL_10']).value = liqIva10 + baseIva10;
            
            // Task: Calculate "SUBTOTAL_05"
            row.getCell(colIndexes['SUBTOTAL_05']).value = liqIva05 + baseIva05;
            
            // Task: Calculate "LIQUIDACION_IVA_TOTAL"
            row.getCell(colIndexes['LIQUIDACION_IVA_TOTAL']).value = liqIva10 + liqIva05;
            
            // Task: Copy "TOTAL_BRUTO" to "TOTAL"
            row.getCell(colIndexes['TOTAL']).value = totalBruto;


            // Task: check if "CONDICION" is "CREDITO" and set "CUOTAS" to 1
            const condicionCell = row.getCell(colIndexes['CONDICION']);
            if (condicionCell.value == "CRÉDITO") {
                row.getCell(colIndexes['CUOTAS']).value = "1";
            }

            // Task: check if "TOTAL" is 0 and set "ESTADO_DOCUMENTO" to "ANULADO"
            const totalCell = row.getCell(colIndexes['TOTAL']);
            if (totalCell.value == 0) {
                row.getCell(colIndexes['ESTADO_DOCUMENTO']).value = "ANULADO";
                row.getCell(colIndexes['MOTIVO']).value = "INUTILIZADO";
            }

            // Task: check if timbrado exists in localStorage
            const timbradoVencCell = row.getCell(colIndexes['TIMBRADO_VENCIMIENTO']);
            const timbradoCell =  row.getCell(colIndexes['TIMBRADO']);
            const tipoCell = row.getCell(colIndexes['TIPO_DOCUMENTO']);

            const timbrado = normalizeTimbrado(timbradoCell.value);
            if (timbrado === "") return;
            timbradoCell.value = /^\d+$/.test(timbrado) ? Number(timbrado) : timbrado;

            if (timbrados[timbrado] != undefined) {
                timbradoVencCell.value = timbrados[timbrado].vencimiento;
                tipoCell.value = timbrados[timbrado].tipo;
                reformatDate(timbradoVencCell);
            }
            else {
                unknownTimbrados.add(timbrado);
            }
        });

        // Ask for all unknown timbrados at once; the form re-runs the conversion once they're saved
        if (unknownTimbrados.size > 0) {
            in_process_section.classList.add('hidden');
            showNewTimbradosForm([...unknownTimbrados]);
            return;
        }


        // ----------- REORDER ALL COLUMNS -----------
        const reorderedSheet = reorderColumnsByHeaders(worksheet, desiredOrder);

        // Remove the old sheet and rename the new one to match
        worksheet.workbook.removeWorksheet(worksheet.id);
        reorderedSheet.name = worksheet.name; // Preserve old sheet name

        processedWorkbook = workbook;
        in_process_section.classList.add('hidden');
        download_section.classList.remove('hidden');

    } catch (err) {
        console.error("Error processing file:", err);
        alert("No se pudo procesar el archivo. Revise la consola para más detalles.");
        in_process_section.classList.add('hidden');
    }
}


downloadBtn.addEventListener('click', async () => {
    if (!processedWorkbook) return;

    const buffer = await processedWorkbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "modified.xlsx";
    link.click();
});