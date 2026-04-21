import Swal from 'sweetalert2';

export async function exportElementToPdf(
  element: HTMLElement | undefined,
  fileName: string
): Promise<void> {
  if (!element) {
    await Swal.fire({
      icon: 'warning',
      title: 'No se pudo exportar',
      text: 'No se encontro el contenido para exportar.',
      confirmButtonColor: '#003660',
    });
    return;
  }

  void Swal.fire({
    title: 'Generando PDF',
    text: 'Preparando descarga...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);

    const hiddenNodes = Array.from(element.querySelectorAll('.print-hide')) as HTMLElement[];
    const previousDisplay = hiddenNodes.map(node => node.style.display);
    hiddenNodes.forEach(node => {
      node.style.display = 'none';
    });

    let canvas: HTMLCanvasElement;
    try {
      canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        windowWidth: document.documentElement.clientWidth,
        windowHeight: document.documentElement.clientHeight,
        scrollX: 0,
        scrollY: -window.scrollY,
      });
    } finally {
      hiddenNodes.forEach((node, idx) => {
        node.style.display = previousDisplay[idx] || '';
      });
    }

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const marginX = 8;
    const marginTop = 10;
    const marginBottom = 10;
    const availableWidth = pageWidth - marginX * 2;
    const availableHeight = pageHeight - marginTop - marginBottom;
    const pageCanvasHeight = Math.max(
      1,
      Math.floor((availableHeight * canvas.width) / availableWidth)
    );

    let sourceY = 0;
    let page = 0;

    while (sourceY < canvas.height) {
      const sliceHeight = Math.min(pageCanvasHeight, canvas.height - sourceY);
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;

      const context = pageCanvas.getContext('2d');
      if (!context) {
        throw new Error('No se pudo preparar el lienzo para la paginacion del PDF.');
      }

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      context.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight
      );

      const sliceHeightMm = (sliceHeight * availableWidth) / canvas.width;
      const imgData = pageCanvas.toDataURL('image/jpeg', 0.98);

      if (page > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, 'JPEG', marginX, marginTop, availableWidth, sliceHeightMm, undefined, 'FAST');

      sourceY += sliceHeight;
      page++;
    }

    pdf.save(`${fileName}_${formatDateForFile(new Date())}.pdf`);
  } catch (error) {
    console.error('Error al exportar PDF:', error);
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo generar el PDF.',
      confirmButtonColor: '#003660',
    });
  } finally {
    Swal.close();
  }
}

export async function exportElementToExcel(
  element: HTMLElement | undefined,
  fileName: string
): Promise<void> {
  if (!element) {
    await Swal.fire({
      icon: 'warning',
      title: 'No se pudo exportar',
      text: 'No se encontro el contenido para exportar.',
      confirmButtonColor: '#003660',
    });
    return;
  }

  try {
    const XLSX = await import('xlsx');
    const clone = element.cloneNode(true) as HTMLElement;
    syncControlValues(element, clone);
    clone.querySelectorAll('.print-hide').forEach((node) => node.remove());
    const headings = Array.from(clone.querySelectorAll('h1, h2, h3, h4, h5, h6')) as HTMLElement[];

    void Swal.fire({
      title: 'Generando Excel',
      text: 'Preparando descarga...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const workbook = XLSX.utils.book_new();
    const fieldRows = extractFieldRows(clone, headings);
    const tableSheets = extractTableSheets(clone, headings);
    const usedSheetNames = new Set<string>();

    const fieldsSheet = XLSX.utils.json_to_sheet(fieldRows.length ? fieldRows : [{
      Seccion: 'General',
      Campo: 'Sin datos',
      Valor: '',
    }]);

    setColumnWidths(fieldsSheet, [28, 34, 80]);
    XLSX.utils.book_append_sheet(workbook, fieldsSheet, buildUniqueSheetName('Campos', usedSheetNames));

    tableSheets.forEach((table, index) => {
      const sheet = XLSX.utils.json_to_sheet(table.rows);
      setColumnWidths(sheet, new Array(table.width).fill(24));
      XLSX.utils.book_append_sheet(
        workbook,
        sheet,
        buildUniqueSheetName(table.name || `Tabla ${index + 1}`, usedSheetNames)
      );
    });

    XLSX.writeFile(workbook, `${fileName}_${formatDateForFile(new Date())}.xlsx`);
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

function formatDateForFile(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}`;
}

type FieldRow = {
  Seccion: string;
  Campo: string;
  Valor: string;
};

type TableSheet = {
  name: string;
  rows: Record<string, string>[];
  width: number;
};

function extractFieldRows(root: HTMLElement, headings: HTMLElement[]): FieldRow[] {
  const controls = Array.from(root.querySelectorAll('input, textarea, select')) as Array<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
  const rows: FieldRow[] = [];
  const seen = new Set<string>();

  controls.forEach((control) => {
    if (shouldSkipControl(control)) {
      return;
    }

    const field = getControlLabel(control);
    const value = getControlValue(control);
    if (!field || !value) {
      return;
    }

    const section = getNearestSectionTitle(control, root, headings);
    const key = `${section}|${field}|${value}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    rows.push({
      Seccion: section,
      Campo: field,
      Valor: value,
    });
  });

  return rows;
}

function extractTableSheets(root: HTMLElement, headings: HTMLElement[]): TableSheet[] {
  const tables = Array.from(root.querySelectorAll('table')) as HTMLTableElement[];

  return tables
    .map((table, index) => {
      const { headers, includeFirstRow } = getTableHeaders(table);
      const rows = getTableRows(table, headers, includeFirstRow);

      if (!headers.length || !rows.length) {
        return null;
      }

      return {
        name: getNearestSectionTitle(table, root, headings) || `Tabla ${index + 1}`,
        rows,
        width: headers.length,
      };
    })
    .filter((sheet): sheet is TableSheet => !!sheet);
}

function getTableHeaders(table: HTMLTableElement): { headers: string[]; includeFirstRow: boolean } {
  const headerCells = Array.from(table.querySelectorAll('thead th')) as HTMLTableCellElement[];
  if (headerCells.length) {
    return {
      headers: headerCells.map((cell, index) => normalizeText(cell.textContent) || `Columna ${index + 1}`),
      includeFirstRow: false,
    };
  }

  const firstRowCells = Array.from(table.querySelectorAll('tr:first-child th, tr:first-child td')) as HTMLTableCellElement[];
  const looksLikeHeader = firstRowCells.length > 0 && firstRowCells.every((cell) => {
    const hasControl = !!cell.querySelector('input, textarea, select');
    const text = normalizeText(cell.textContent);
    return !hasControl && !!text;
  });

  return {
    headers: firstRowCells.map((cell, index) => normalizeText(cell.textContent) || `Columna ${index + 1}`),
    includeFirstRow: !looksLikeHeader,
  };
}

function getTableRows(table: HTMLTableElement, headers: string[], includeFirstRow: boolean): Record<string, string>[] {
  const bodyRows = Array.from(table.querySelectorAll('tbody tr')).length
    ? Array.from(table.querySelectorAll('tbody tr'))
    : Array.from(table.querySelectorAll('tr')).slice(includeFirstRow ? 0 : 1);

  return bodyRows
    .map((row, rowIndex) => {
      const cells = Array.from(row.querySelectorAll('th, td')) as HTMLTableCellElement[];
      if (!cells.length) {
        return null;
      }

      const data: Record<string, string> = {};
      headers.forEach((header, index) => {
        const cell = cells[index];
        data[header] = cell ? getNodeValue(cell, rowIndex, index) : '';
      });

      const hasValue = Object.values(data).some(Boolean);
      return hasValue ? data : null;
    })
    .filter((row): row is Record<string, string> => !!row);
}

function shouldSkipControl(control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): boolean {
  const inputType = control instanceof HTMLInputElement ? control.type : '';
  if (['button', 'submit', 'reset', 'file', 'hidden'].includes(inputType)) {
    return true;
  }
  if (control.closest('.print-hide')) {
    return true;
  }
  return false;
}

function getControlLabel(control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string {
  const id = control.getAttribute('id');
  if (id) {
    const label = control.ownerDocument.querySelector(`label[for="${id}"]`);
    const text = normalizeText(label?.textContent);
    if (text) {
      return text;
    }
  }

  const closestField = control.closest('div, td, th, section, article');
  if (closestField) {
    const label = closestField.querySelector('label');
    const text = normalizeText(label?.textContent);
    if (text) {
      return text;
    }
  }

  return (
    normalizeText(control.getAttribute('placeholder')) ||
    normalizeText(control.getAttribute('formControlName')) ||
    normalizeText(control.getAttribute('name')) ||
    'Campo'
  );
}

function getControlValue(control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string {
  if (control instanceof HTMLInputElement && control.type === 'checkbox') {
    return control.checked ? 'Si' : 'No';
  }

  if (control instanceof HTMLSelectElement) {
    const selectedText = control.selectedOptions.length ? normalizeText(control.selectedOptions[0].textContent) : '';
    return selectedText || normalizeText(control.value);
  }

  return normalizeText(control.value);
}

function getNodeValue(node: HTMLElement, rowIndex = 0, cellIndex = 0): string {
  const control = node.querySelector('input, textarea, select') as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
  if (control) {
    const controlValue = getControlValue(control);
    if (controlValue) {
      return controlValue;
    }
    if (cellIndex === 0) {
      return `Fila ${rowIndex + 1}`;
    }
    return '';
  }

  const swatch = node.querySelector('[style*="background-color"]') as HTMLElement | null;
  if (swatch && cellIndex === 0) {
    return `Fila ${rowIndex + 1}`;
  }
  return normalizeText(node.textContent);
}

function getNearestSectionTitle(node: Element, root: HTMLElement, headings: HTMLElement[]): string {
  let current: Element | null = node;
  while (current && current !== root) {
    const ownHeading = Array.from(current.children).find((child) =>
      /^H[1-6]$/.test(child.tagName)
    ) as HTMLElement | undefined;
    const ownHeadingText = normalizeText(ownHeading?.textContent);
    if (ownHeadingText) {
      return ownHeadingText;
    }
    current = current.parentElement;
  }

  let nearest = '';
  for (const heading of headings) {
    if (heading.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_PRECEDING) {
      break;
    }
    nearest = normalizeText(heading.textContent);
  }

  return nearest || 'General';
}

function normalizeText(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function sanitizeSheetName(name: string): string {
  return name.replace(/[\\/*?:[\]]/g, '').slice(0, 31) || 'Hoja';
}

function setColumnWidths(sheet: unknown, widths: number[]): void {
  (sheet as { ['!cols']?: Array<{ wch: number }> })['!cols'] = widths.map((width) => ({ wch: width }));
}

function buildUniqueSheetName(baseName: string, usedNames: Set<string>): string {
  const sanitizedBase = sanitizeSheetName(baseName);
  let candidate = sanitizedBase;
  let suffix = 2;

  while (usedNames.has(candidate)) {
    const suffixText = ` ${suffix}`;
    const trimmedBase = sanitizedBase.slice(0, Math.max(1, 31 - suffixText.length));
    candidate = `${trimmedBase}${suffixText}`;
    suffix++;
  }

  usedNames.add(candidate);
  return candidate;
}

function syncControlValues(sourceRoot: HTMLElement, cloneRoot: HTMLElement): void {
  const sourceControls = Array.from(sourceRoot.querySelectorAll('input, textarea, select')) as Array<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
  const cloneControls = Array.from(cloneRoot.querySelectorAll('input, textarea, select')) as Array<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

  sourceControls.forEach((sourceControl, index) => {
    const cloneControl = cloneControls[index];
    if (!cloneControl) {
      return;
    }

    if (sourceControl instanceof HTMLInputElement && cloneControl instanceof HTMLInputElement) {
      cloneControl.value = sourceControl.value;
      cloneControl.checked = sourceControl.checked;
      return;
    }

    if (sourceControl instanceof HTMLTextAreaElement && cloneControl instanceof HTMLTextAreaElement) {
      cloneControl.value = sourceControl.value;
      cloneControl.textContent = sourceControl.value;
      return;
    }

    if (sourceControl instanceof HTMLSelectElement && cloneControl instanceof HTMLSelectElement) {
      cloneControl.value = sourceControl.value;
      Array.from(cloneControl.options).forEach((option) => {
        option.selected = option.value === sourceControl.value;
      });
    }
  });
}
