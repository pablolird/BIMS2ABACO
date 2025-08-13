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


const fileInput = document.getElementById('fileInput');

const downloadBtn = document.getElementById('downloadBtn');

const in_process_section = document.querySelector('.in-process');

const download_section = document.querySelector('.finished');

const form = document.querySelector('.main-form');

const timbrado_overlay = document.querySelector('.timbrado-overlay');

const timbrado_field = document.getElementById('timbrado');

const timbrado_submit_button = document.querySelector('.submit-button');

const timbrado_cancel_button = document.querySelector('.cancel-button');

const timbrado_venc_field = document.querySelector('.timbrado-vencimiento');

const timbrado_tipo_field = document.querySelector('.timbrado-tipo')

const timbrado_section_button = document.querySelector('.timbrado-section__button');

const timbrado_section = document.querySelector('.timbrado-section__overlay');

const timbrado_section_salir_button = document.querySelector('.timbrado-section__salir');

timbrado_section_salir_button.addEventListener('click', (event) => {
    timbrado_section.classList.toggle('hidden');
})

let processedWorkbook = null; // store after processing

timbrado_submit_button.addEventListener('click', (event) => {
    let timbrados = JSON.parse(localStorage.getItem("timbrados") || "{}");

    timbrados[timbrado_field.value] = {
        vencimiento: timbrado_venc_field.value,
        tipo: timbrado_tipo_field.value
    };

    localStorage.setItem("timbrados", JSON.stringify(timbrados));
})

timbrado_section_button.addEventListener('click', (event) => {
    timbrado_section.classList.toggle('hidden');
})

timbrado_cancel_button.addEventListener('click', (event) => {
    event.preventDefault();
    location.reload();
})

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
        if (headerRow.getCell(colIndex).value === headerName) {
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
        alert("Please select a file.");
        return;
    }

    // Allowed extensions and MIME types
    const allowedExtensions = ['xlsx', 'xls', 'csv'];
    const allowedMimeTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel',                                         // .xls
        'text/csv'                                                          // .csv
    ];

    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    const fileMimeType = selectedFile.type;

    if (!allowedExtensions.includes(fileExtension) || !allowedMimeTypes.includes(fileMimeType)) {
        alert("Only spreadsheet files (.xlsx, .xls, .csv) are allowed.");
        return;
    }
    
    in_process_section.classList.toggle('hidden');

    try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);

        const worksheet = workbook.worksheets[0];

        // ----------- DELETE COLUMNS --------------
        // NOTE: Column indices change after each splice.
        // Original: 1:DIA, 2:Fecha, 3:TipoComp, 4:SUCURSAL
        worksheet.spliceColumns(1, 1); // Deletes "DIA", SUCURSAL is now at col 3
        worksheet.spliceColumns(3, 1); // Deletes "SUCURSAL"
        // After deletions, original column 15 ("RETENCION") is now at column 13
        worksheet.spliceColumns(13, 1); // Deletes "RETENCION"

        // ----------- RENAME COLUMNS --------------
        getCellHeader(worksheet, 'Tipo de Comprobante').value = "CONDICION";
        getCellHeader(worksheet, 'Fecha de Emisión').value = "FECHA";
        getCellHeader(worksheet, 'Número de Comprante').value = "FACTURA";
        getCellHeader(worksheet, 'Código de Timbrado').value = "TIMBRADO";
        getCellHeader(worksheet, 'Número de Documento').value = "DOCUMENTO_PERSONA";
        getCellHeader(worksheet, 'Nombre / Razón Social').value = "NOMBRE_PERSONA";
        getCellHeader(worksheet, 'Exento').value = "SUBTOTAL_EXENTAS";
        getCellHeader(worksheet, 'IVA 10 Impuesto').value = "LIQUIDACION_IVA_10";
        getCellHeader(worksheet, 'IVA 5 Impuesto').value = "LIQUIDACION_IVA_05";
        getCellHeader(worksheet, 'Total').value = "TOTAL_BRUTO";

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
                console.log("XD")
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

            if (timbrados[timbradoCell.value] != undefined) {
                // console.log(timbrados[timbradoCell.value]);
                timbradoVencCell.value = timbrados[timbradoCell.value].vencimiento;
                tipoCell.value = timbrados[timbradoCell.value].tipo;
                reformatDate(timbradoVencCell);
            }
            else {
                timbrado_field.value = timbradoCell.value;
                timbrado_overlay.classList.toggle("hidden");
                in_process_section.classList.toggle('hidden');
                throw new Error("Missing timbrado, stop processing");
            }
        });


        // ----------- REORDER ALL COLUMNS -----------
        const reorderedSheet = reorderColumnsByHeaders(worksheet, desiredOrder);

        // Remove the old sheet and rename the new one to match
        worksheet.workbook.removeWorksheet(worksheet.id);
        reorderedSheet.name = worksheet.name; // Preserve old sheet name

        processedWorkbook = workbook;
        in_process_section.classList.toggle('hidden');
        download_section.classList.toggle('hidden')
        // alert("File processed successfully! Click 'Download' to get the new file.");

    } catch (err) {
        if (err != "Error: Missing timbrado, stop processing") {
            console.error("Error processing file:", err);
            alert("Could not process the file. Please check the console for errors.");
            in_process_section.classList.toggle('hidden');
        }
    }
});


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
});Te 