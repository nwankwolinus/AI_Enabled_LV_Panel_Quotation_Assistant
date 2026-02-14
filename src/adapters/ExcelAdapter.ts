import * as XLSX from 'xlsx';

export interface ExcelRow {
  [key: string]: any;
}

export interface ExcelAdapter {
  readFile(file: File): Promise<ExcelRow[]>;
  createWorkbook(data: ExcelRow[], sheetName?: string): XLSX.WorkBook;
  exportToBuffer(workbook: XLSX.WorkBook): ArrayBuffer;
  exportToFile(workbook: XLSX.WorkBook, filename: string): void;
}

export class XLSXAdapter implements ExcelAdapter {
  async readFile(file: File): Promise<ExcelRow[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json<ExcelRow>(firstSheet);
          resolve(rows);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(reader.error);
      reader.readAsBinaryString(file);
    });
  }

  createWorkbook(data: ExcelRow[], sheetName: string = 'Sheet1'): XLSX.WorkBook {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    return workbook;
  }

  exportToBuffer(workbook: XLSX.WorkBook): ArrayBuffer {
    return XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  }

  exportToFile(workbook: XLSX.WorkBook, filename: string): void {
    XLSX.writeFile(workbook, filename);
  }

  // Additional helper methods
  createMultiSheetWorkbook(sheets: Array<{ name: string; data: ExcelRow[] }>): XLSX.WorkBook {
    const workbook = XLSX.utils.book_new();

    sheets.forEach(sheet => {
      const worksheet = XLSX.utils.json_to_sheet(sheet.data);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
    });

    return workbook;
  }

  addStyling(worksheet: XLSX.WorkSheet): void {
    // Add styling (headers, borders, etc.)
    // This is a simplified example
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + '1';
      if (!worksheet[address]) continue;
      
      worksheet[address].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: '1E3A8A' } },
        alignment: { horizontal: 'center' },
      };
    }
  }
}
