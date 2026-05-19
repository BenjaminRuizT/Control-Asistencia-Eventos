import ExcelJS from 'exceljs';

const HEADER_ALIASES = {
  employeeNumber: ['numero de empleado', 'número de empleado', 'num empleado', 'empleado', 'employee number'],
  name: ['nombre', 'name'],
  region: ['region', 'región'],
  plaza: ['plaza'],
  store: ['tienda', 'store']
};

export const REQUIRED_TEMPLATE_HEADERS = ['Numero de empleado', 'Nombre', 'Region', 'Plaza', 'Tienda'];

function normalize(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function findColumn(row, aliases) {
  const normalizedAliases = aliases.map(normalize);
  return Object.keys(row).find((key) => normalizedAliases.includes(normalize(key)));
}

export async function parseAttendeesWorkbook(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('El archivo no contiene hojas.');
  }

  const headerRow = worksheet.getRow(1).values.slice(1).map((value) => String(value || '').trim());
  const rows = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const item = {};
    headerRow.forEach((header, index) => {
      item[header] = row.getCell(index + 1).text || row.getCell(index + 1).value || '';
    });
    rows.push(item);
  });

  if (!rows.length) {
    throw new Error('El archivo no contiene asistentes.');
  }

  const columns = Object.fromEntries(
    Object.entries(HEADER_ALIASES).map(([field, aliases]) => [field, findColumn(rows[0], aliases)])
  );

  const missing = Object.entries(columns)
    .filter(([, column]) => !column)
    .map(([field]) => field);

  if (missing.length) {
    throw new Error(`Faltan columnas requeridas: ${REQUIRED_TEMPLATE_HEADERS.join(', ')}.`);
  }

  const seen = new Set();
  return rows
    .map((row, index) => ({
      rowNumber: index + 2,
      employeeNumber: String(row[columns.employeeNumber]).trim(),
      name: String(row[columns.name]).trim(),
      region: String(row[columns.region]).trim(),
      plaza: String(row[columns.plaza]).trim(),
      store: String(row[columns.store]).trim()
    }))
    .filter((row) => row.employeeNumber || row.name)
    .map((row) => {
      if (!row.employeeNumber || !row.name) {
        throw new Error(`La fila ${row.rowNumber} requiere Numero de empleado y Nombre.`);
      }
      if (seen.has(row.employeeNumber)) {
        throw new Error(`El numero de empleado ${row.employeeNumber} esta duplicado en el archivo.`);
      }
      seen.add(row.employeeNumber);
      return row;
    });
}

export async function createTemplateWorkbookBuffer() {
  const data = [
    REQUIRED_TEMPLATE_HEADERS,
    ['10001', 'Ana Martinez Lopez', 'Norte', 'Monterrey', 'Tienda Centro'],
    ['10002', 'Carlos Ruiz Gomez', 'Occidente', 'Guadalajara', 'Tienda Chapultepec']
  ];
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Asistentes');
  worksheet.addRows(data);
  worksheet.columns = [
    { width: 22 },
    { width: 32 },
    { width: 18 },
    { width: 20 },
    { width: 24 }
  ];
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

function addJsonSheet(workbook, name, rows) {
  const worksheet = workbook.addWorksheet(name);
  if (!rows.length) {
    worksheet.addRow(['Sin datos']);
    return worksheet;
  }

  const headers = Object.keys(rows[0]);
  worksheet.addRow(headers);
  rows.forEach((row) => worksheet.addRow(headers.map((header) => row[header])));
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
  worksheet.columns = headers.map((header) => ({ header, width: Math.min(Math.max(header.length + 8, 16), 34) }));
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];
  return worksheet;
}

export async function createExportWorkbookBuffer({ event, attendees, attendanceMap, draws }) {
  const presentRows = [];
  const missingRows = [];

  attendees.forEach((attendee) => {
    const attendance = attendanceMap.get(attendee.employeeNumber);
    const row = {
      'Numero de empleado': attendee.employeeNumber,
      Nombre: attendee.name,
      Region: attendee.region,
      Plaza: attendee.plaza,
      Tienda: attendee.store,
      Estatus: attendance ? 'Presente' : 'Faltante',
      'Fecha de registro': attendance ? attendance.checkedInAt.toISOString() : ''
    };
    if (attendance) presentRows.push(row);
    else missingRows.push(row);
  });

  const drawRows = draws.map((draw) => ({
    'Numero de empleado': draw.employeeNumber,
    Nombre: draw.attendeeId?.name || '',
    Sorteo: draw.pool === 'present' ? 'Solo presentes' : 'Todos los cargados',
    Fecha: draw.createdAt.toISOString()
  }));

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Control de asistencia para eventos';
  addJsonSheet(workbook, 'Resumen', [{ Evento: event.title, Asistentes: attendees.length, Presentes: presentRows.length, Faltantes: missingRows.length }]);
  addJsonSheet(workbook, 'Presentes', presentRows);
  addJsonSheet(workbook, 'Faltantes', missingRows);
  addJsonSheet(workbook, 'Sorteos', drawRows);
  return Buffer.from(await workbook.xlsx.writeBuffer());
}
