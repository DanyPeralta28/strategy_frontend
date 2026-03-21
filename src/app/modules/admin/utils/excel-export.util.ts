import Swal from 'sweetalert2';

export type ExcelRow = Record<string, string | number | boolean | null | undefined>;

export type ExcelSheetConfig = {
  name: string;
  rows: ExcelRow[];
  widths?: number[];
};

export async function exportSheetsToExcel(
  fileName: string,
  sheets: ExcelSheetConfig[]
): Promise<void> {
  void Swal.fire({
    title: 'Generando Excel',
    text: 'Preparando descarga...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();

    const validSheets = sheets.filter((sheet) => Array.isArray(sheet.rows));
    const usedNames = new Set<string>();

    if (!validSheets.length) {
      const fallbackSheet = XLSX.utils.json_to_sheet([{ Info: 'Sin datos' }]);
      XLSX.utils.book_append_sheet(workbook, fallbackSheet, 'Resumen');
    } else {
      validSheets.forEach((sheetConfig) => {
        const rows = sheetConfig.rows.length ? sheetConfig.rows : [{ Info: 'Sin datos' }];
        const sheet = XLSX.utils.json_to_sheet(rows);
        if (sheetConfig.widths?.length) {
          (sheet as { ['!cols']?: Array<{ wch: number }> })['!cols'] = sheetConfig.widths.map((width) => ({ wch: width }));
        }
        XLSX.utils.book_append_sheet(
          workbook,
          sheet,
          buildUniqueSheetName(sheetConfig.name, usedNames)
        );
      });
    }

    XLSX.writeFile(workbook, `${fileName}_${formatExcelTimestamp(new Date())}.xlsx`);
  } catch (error) {
    console.error('Error al exportar Excel:', error);
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo generar el Excel.',
      confirmButtonColor: '#003660',
    });
  } finally {
    Swal.close();
  }
}

function buildUniqueSheetName(baseName: string, usedNames: Set<string>): string {
  const sanitizedBase = sanitizeSheetName(baseName);
  let candidate = sanitizedBase;
  let suffix = 2;

  while (usedNames.has(candidate)) {
    const suffixText = ` ${suffix}`;
    candidate = `${sanitizedBase.slice(0, Math.max(1, 31 - suffixText.length))}${suffixText}`;
    suffix++;
  }

  usedNames.add(candidate);
  return candidate;
}

function sanitizeSheetName(name: string): string {
  return name.replace(/[\\/*?:[\]]/g, '').slice(0, 31) || 'Hoja';
}

function formatExcelTimestamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}`;
}
