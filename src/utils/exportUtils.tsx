import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useReactToPrint } from 'react-to-print';
import {
  FileSpreadsheet,
  FileText,
  Printer,
  Download,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export interface ExportColumnDef<T = any> {
  header: string;
  accessor: keyof T | ((row: T) => string | number);
}

/**
 * Validasi sebelum export:
 * - Cek apakah user login (opsional)
 * - Cek apakah data kosong -> toast error
 * - Cek apakah data > 10.000 baris -> toast error
 */
export function validateBeforeExport(data: any[], requireAuthUser?: any): boolean {
  if (requireAuthUser === null) {
    toast.error('Silakan login terlebih dahulu untuk mengekspor laporan.');
    window.location.href = '/login';
    return false;
  }
  if (!data || data.length === 0) {
    toast.error('Tidak ada data untuk diexport (Data kosong).');
    return false;
  }
  if (data.length > 10000) {
    toast.error('Terlalu banyak data (> 10.000 baris), silakan gunakan filter terlebih dahulu.');
    return false;
  }
  return true;
}

/**
 * 1. EXPORT EXCEL (.XLSX) via SheetJS (xlsx) + file-saver
 */
export async function exportToExcelFile(
  data: Record<string, any>[],
  filename: string,
  sheetName = 'Data'
): Promise<boolean> {
  if (!validateBeforeExport(data)) return false;

  try {
    await new Promise((resolve) => setTimeout(resolve, 150));

    const ws = XLSX.utils.json_to_sheet(data);

    // Auto-width kolom
    const keys = Object.keys(data[0] || {});
    const colWidths = keys.map((key) => ({
      wch:
        Math.min(
          60,
          Math.max(
            key.length,
            ...data.map((row) => String(row[key] ?? '').length)
          )
        ) + 3,
    }));
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const dateStamp = new Date().toISOString().slice(0, 10);
    const cleanName = filename.replace(/[^a-zA-Z0-9_-]/g, '_');
    saveAs(blob, `${cleanName}_${dateStamp}.xlsx`);
    return true;
  } catch (error: any) {
    console.error('Export Excel error:', error);
    throw new Error(error?.message || 'Gagal mengekspor file Excel');
  }
}

/**
 * 2. EXPORT CSV (.CSV) via Blob UTF-8 BOM + file-saver
 */
export async function exportToCsvFile(
  data: Record<string, any>[],
  filename: string
): Promise<boolean> {
  if (!validateBeforeExport(data)) return false;

  try {
    await new Promise((resolve) => setTimeout(resolve, 120));

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((fieldName) => {
            const value = row[fieldName] ?? '';
            const escaped = String(value).replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(',')
      ),
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob(['\ufeff' + csvString], {
      type: 'text/csv;charset=utf-8;',
    });

    const dateStamp = new Date().toISOString().slice(0, 10);
    const cleanName = filename.replace(/[^a-zA-Z0-9_-]/g, '_');
    saveAs(blob, `${cleanName}_${dateStamp}.csv`);
    return true;
  } catch (error: any) {
    console.error('Export CSV error:', error);
    throw new Error(error?.message || 'Gagal mengekspor file CSV');
  }
}

/**
 * 3. EXPORT PDF (.PDF) via jsPDF + jspdf-autotable lengkap dengan Kop Surat,
 *    Periode, Tanggal Cetak, Ringkasan Total, Tanda Tangan & Nomor Halaman
 */
export async function exportToPdfFile(options: {
  data: (string | number)[][];
  columns: string[];
  filename: string;
  title: string;
  subtitle?: string;
  companyName?: string;
  summaryText?: string;
  printedBy?: string;
  orientation?: 'landscape' | 'portrait';
}): Promise<boolean> {
  const {
    data,
    columns,
    filename,
    title,
    subtitle,
    companyName = 'BAHAGIA GROUP PROPERTY',
    summaryText,
    printedBy = 'Admin',
    orientation = 'landscape',
  } = options;

  if (!validateBeforeExport(data)) return false;

  try {
    await new Promise((resolve) => setTimeout(resolve, 150));

    const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Logo Kotak Hijau Emerald [BG]
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(14, 10, 14, 14, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('BG', 21, 19, { align: 'center' });

    // Kop Surat: Nama PT & Alamat Lengkap
    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(companyName.toUpperCase(), 32, 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    doc.text(
      'Jl. Anawai, Kel. Anawai, Kec. Wua-wua, Kota Kendari, Sulawesi Tenggara',
      32,
      20
    );
    doc.text(
      'Telp: 0811-4000-169 | Email: info@bahagialand.com | PT Tata Bahagia Land & PT Bahagia Prima Property',
      32,
      24.5
    );

    // Garis Kop Surat
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.7);
    doc.line(14, 28, pageWidth - 14, 28);

    // Judul Laporan
    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(title.toUpperCase(), 14, 35);

    // Periode & Tanggal Cetak
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(75, 85, 99);
    const nowStr = new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    doc.text(
      `${subtitle ? `${subtitle}   |   ` : ''}Periode: Oktober 2026   |   Dicetak: ${nowStr} WITA`,
      14,
      40.5
    );

    // Tabel menggunakan autoTable
    autoTable(doc, {
      head: [columns],
      body: data,
      startY: 44,
      styles: {
        fontSize: 8,
        cellPadding: 2.2,
        overflow: 'linebreak',
        lineColor: [229, 231, 235],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { top: 44, left: 14, right: 14, bottom: 25 },
      didDrawPage: (hookData) => {
        const pageCount = (doc as any).internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.text(
          `Bahagia Group Property ERP — Halaman ${hookData.pageNumber} dari ${pageCount}`,
          pageWidth - 14,
          pageHeight - 8,
          { align: 'right' }
        );
      },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 55;
    let footerY = finalY + 7;

    if (footerY + 25 > pageHeight - 12) {
      doc.addPage();
      footerY = 20;
    }

    // Total & Tanda Tangan di bawah tabel
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(17, 24, 39);
    doc.text(summaryText || `Total Data: ${data.length} baris`, 14, footerY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Dicetak oleh: ${printedBy}`, pageWidth - 65, footerY);
    doc.text('Tanda tangan: _______________________', pageWidth - 65, footerY + 12);

    const dateStamp = new Date().toISOString().slice(0, 10);
    const cleanName = filename.replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`${cleanName}_${dateStamp}.pdf`);
    return true;
  } catch (error: any) {
    console.error('Export PDF error:', error);
    throw new Error(error?.message || 'Gagal mengekspor file PDF');
  }
}

export function exportToExcel(
  data: Record<string, any>[],
  filename: string,
  sheetName = 'Laporan',
  _headers?: string[]
) {
  exportToExcelFile(data, filename, sheetName)
    .then((ok) => {
      if (ok) toast.success(`✅ File ${filename}.xlsx berhasil didownload`);
    })
    .catch((err) => toast.error(`Gagal export Excel: ${err.message}`));
}

export function exportToCSV(
  data: Record<string, any>[],
  filename: string,
  _headers?: string[]
) {
  exportToCsvFile(data, filename)
    .then((ok) => {
      if (ok) toast.success(`✅ File ${filename}.csv berhasil didownload`);
    })
    .catch((err) => toast.error(`Gagal export CSV: ${err.message}`));
}

export function exportToPDF(
  title: string,
  columns: string[],
  rows: (string | number)[][],
  filename: string,
  options?: { subtitle?: string; summaryText?: string }
) {
  exportToPdfFile({
    data: rows,
    columns,
    filename,
    title,
    subtitle: options?.subtitle,
    summaryText: options?.summaryText,
  })
    .then((ok) => {
      if (ok) toast.success(`✅ File ${filename}.pdf berhasil didownload`);
    })
    .catch((err) => toast.error(`Gagal export PDF: ${err.message}`));
}

export function printHtmlReport(
  title: string,
  subtitle: string,
  headers: string[],
  rows: (string | number)[][],
  summaryHtml = ''
) {
  if (!validateBeforeExport(rows)) return;
  const printAreaId = 'bahagia-global-print-area';
  let container = document.getElementById(printAreaId);
  if (!container) {
    container = document.createElement('div');
    container.id = printAreaId;
    container.className = 'hidden print:block fixed inset-0 bg-white z-[99999] p-8 text-black print-area';
    document.body.appendChild(container);
  }
  const nowStr = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  container.innerHTML = `
    <div style="font-family: Inter, sans-serif; color: #111827;">
      <div style="border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between;">
        <div>
          <div style="font-size: 16px; font-weight: 800; color: #065f46;">BAHAGIA GROUP PROPERTY — DOKUMEN RESMI ERP</div>
          <div style="font-size: 11px; color: #4b5563;">Jl. Anawai, Kel. Anawai, Kec. Wua-wua, Kota Kendari, Sulawesi Tenggara | Telp: 0811-4000-169</div>
        </div>
        <div style="text-align: right; font-size: 10px; color: #6b7280;">
          Dicetak: ${nowStr} WITA
        </div>
      </div>
      <h2 style="font-size: 14px; font-weight: 700; margin: 0 0 4px 0;">${title}</h2>
      <p style="font-size: 11px; color: #6b7280; margin: 0 0 12px 0;">${subtitle}</p>
      ${summaryHtml}
      <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 10px;">
        <thead>
          <tr style="background: #10B981; color: #ffffff;">
            ${headers.map((h) => `<th style="padding: 6px; text-align: left; border: 1px solid #374151;">${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (r, i) =>
                `<tr style="background: ${i % 2 === 1 ? '#f9fafb' : '#ffffff'};">${r
                  .map((c) => `<td style="padding: 5px 6px; border: 1px solid #d1d5db;">${c ?? ''}</td>`)
                  .join('')}</tr>`
            )
            .join('')}
        </tbody>
      </table>
      <div style="margin-top: 24px; display: flex; justify-content: space-between; font-size: 11px;">
        <div><strong>Total: ${rows.length} baris data</strong></div>
        <div style="text-align: right;">
          <div>Dicetak oleh: Admin</div>
          <div style="margin-top: 36px; border-top: 1px solid #111827; padding-top: 4px;">Tanda Tangan & Stempel</div>
        </div>
      </div>
    </div>
  `;
  toast.info(`🖨️ Membuka dialog cetak (Print) untuk "${title}"...`);
  setTimeout(() => {
    window.print();
  }, 150);
}

/**
 * Legacy helper aliases agar komponen yang sudah memanggil exportToExcelCsv / exportToPdfDocument
 * tetap bekerja dan langsung men-download file asli.
 */
export function exportToExcelCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const jsonObjects = rows.map((r) => {
    const obj: Record<string, any> = {};
    headers.forEach((h, i) => {
      obj[h] = r[i] ?? '';
    });
    return obj;
  });
  exportToExcel(jsonObjects, filename, 'Laporan', headers);
}

export function exportToPdfDocument(
  title: string,
  subtitle: string,
  headers: string[],
  rows: (string | number)[][],
  summaryLines?: string[]
) {
  exportToPDF(title, headers, rows, title, {
    subtitle,
    summaryText: summaryLines?.join(' | '),
  });
}

/**
 * KOMPONEN REUSABLE: ExportActionButtons
 * Menampilkan 4 tombol standar:
 * - [📥 Export Excel] -> download .xlsx
 * - [📄 Export PDF]   -> download .pdf berkop surat
 * - [📊 Export CSV]   -> download .csv
 * - [🖨️ Print]        -> buka print dialog via react-to-print (lengkap dengan kop surat resmi)
 */
export interface ExportActionButtonsProps {
  title: string;
  filename: string;
  subtitle?: string;
  companyName?: string;
  printedBy?: string;
  summaryText?: string;
  headers?: string[];
  rows?: (string | number)[][];
  data: Record<string, any>[];
  compact?: boolean;
}

export const ExportActionButtons: React.FC<ExportActionButtonsProps> = ({
  title,
  filename,
  subtitle,
  companyName = 'BAHAGIA GROUP PROPERTY',
  printedBy = 'Admin',
  summaryText,
  data,
  compact = false,
}) => {
  const [exportingType, setExportingType] = useState<null | 'EXCEL' | 'PDF' | 'CSV' | 'PRINT'>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const reactToPrintFn = useReactToPrint({
    contentRef: printAreaRef,
    documentTitle: `${filename}_${new Date().toISOString().slice(0, 10)}`,
    pageStyle: `
      @page { size: A4 landscape; margin: 1cm; }
      @media print {
        body { font-family: sans-serif; font-size: 10px; color: #111827; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #374151; padding: 5px 6px; font-size: 9.5px; text-align: left; }
        th { background-color: #10B981 !important; color: #FFFFFF !important; font-weight: bold; }
        tr:nth-child(even) { background-color: #F9FAFB; }
      }
    `,
    onAfterPrint: () => {
      setExportingType(null);
    },
  });

  const handleExcel = async () => {
    if (!validateBeforeExport(data)) return;
    setExportingType('EXCEL');
    try {
      const ok = await exportToExcelFile(data, filename, 'Laporan');
      if (ok) toast.success(`✅ File ${filename}.xlsx berhasil didownload`);
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('Gagal export Excel: ' + (error?.message || 'Silakan coba lagi.'));
    } finally {
      setExportingType(null);
    }
  };

  const handleCsv = async () => {
    if (!validateBeforeExport(data)) return;
    setExportingType('CSV');
    try {
      const ok = await exportToCsvFile(data, filename);
      if (ok) toast.success(`✅ File ${filename}.csv berhasil didownload`);
    } catch (error: any) {
      console.error('Export CSV error:', error);
      toast.error('Gagal export CSV: ' + (error?.message || 'Silakan coba lagi.'));
    } finally {
      setExportingType(null);
    }
  };

  const handlePdf = async () => {
    if (!validateBeforeExport(data)) return;
    setExportingType('PDF');
    try {
      const columns = Object.keys(data[0] || {});
      const rows = data.map((row) => columns.map((col) => row[col] ?? ''));
      const ok = await exportToPdfFile({
        data: rows,
        columns,
        filename,
        title,
        subtitle,
        companyName,
        summaryText: summaryText || `Total: ${data.length} data`,
        printedBy,
      });
      if (ok) toast.success(`✅ File ${filename}.pdf berhasil didownload`);
    } catch (error: any) {
      console.error('Export PDF error:', error);
      toast.error('Gagal export PDF: ' + (error?.message || 'Silakan coba lagi.'));
    } finally {
      setExportingType(null);
    }
  };

  const handlePrint = () => {
    if (!validateBeforeExport(data)) return;
    setExportingType('PRINT');
    try {
      reactToPrintFn();
    } catch (error) {
      console.error('Print error:', error);
      window.print();
      setExportingType(null);
    }
  };

  const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
  const nowFormatted = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const btnPadding = compact ? 'px-2.5 py-1.5 text-[11px]' : 'px-3 py-2 text-xs';

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5 no-print">
        <button
          type="button"
          disabled={exportingType !== null}
          onClick={handleExcel}
          className={`${btnPadding} bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs`}
          title="Download File Microsoft Excel (.xlsx)"
        >
          {exportingType === 'EXCEL' ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Sedang memproses...</span>
            </>
          ) : (
            <>
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>📥 Export Excel</span>
            </>
          )}
        </button>

        <button
          type="button"
          disabled={exportingType !== null}
          onClick={handlePdf}
          className={`${btnPadding} bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs`}
          title="Download File PDF Berkop Surat (.pdf)"
        >
          {exportingType === 'PDF' ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Sedang memproses...</span>
            </>
          ) : (
            <>
              <FileText className="w-3.5 h-3.5" />
              <span>📄 Export PDF</span>
            </>
          )}
        </button>

        <button
          type="button"
          disabled={exportingType !== null}
          onClick={handleCsv}
          className={`${btnPadding} bg-white hover:bg-gray-50 disabled:opacity-60 text-gray-800 border border-gray-300 font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer`}
          title="Download File CSV (.csv)"
        >
          {exportingType === 'CSV' ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Sedang memproses...</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>📊 Export CSV</span>
            </>
          )}
        </button>

        <button
          type="button"
          disabled={exportingType !== null}
          onClick={handlePrint}
          className={`${btnPadding} bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer`}
          title="Buka Dialog Cetak Printer (Print)"
        >
          {exportingType === 'PRINT' ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Menyiapkan Print...</span>
            </>
          ) : (
            <>
              <Printer className="w-3.5 h-3.5" />
              <span>🖨️ Print</span>
            </>
          )}
        </button>
      </div>

      {/* Hidden Printable Area with Official Letterhead (Kop Surat) for react-to-print */}
      <div className="hidden">
        <div ref={printAreaRef} className="p-8 bg-white text-gray-900">
          {/* Kop Surat */}
          <div className="flex items-start justify-between border-b-2 border-emerald-700 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-lg">
                BG
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-gray-900 uppercase tracking-tight">
                  {companyName}
                </h1>
                <p className="text-xs text-gray-600">
                  Jl. Anawai, Kel. Anawai, Kec. Wua-wua, Kota Kendari, Sulawesi Tenggara
                </p>
                <p className="text-xs text-gray-600">
                  Telp: 0811-4000-169 | Email: info@bahagialand.com | PT Tata Bahagia Land & PT Bahagia Prima Property
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-gray-500 font-mono">
              <div>DOKUMEN RESMI ERP</div>
              <div>Dicetak: {nowFormatted} WITA</div>
            </div>
          </div>

          {/* Judul Laporan */}
          <div className="mb-4">
            <h2 className="text-base font-bold text-gray-900 uppercase">{title}</h2>
            {subtitle && <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>}
            <p className="text-xs text-gray-500 mt-0.5">Periode: Oktober 2026</p>
          </div>

          {/* Tabel Data */}
          {columns.length > 0 ? (
            <table className="w-full border-collapse border border-gray-400 text-[10px]">
              <thead>
                <tr className="bg-emerald-600 text-white">
                  <th className="border border-gray-400 px-2 py-1.5 text-center w-8">No</th>
                  {columns.map((col) => (
                    <th key={col} className="border border-gray-400 px-2 py-1.5 text-left">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border border-gray-300 px-2 py-1 text-center font-mono">
                      {idx + 1}
                    </td>
                    {columns.map((col) => (
                      <td key={col} className="border border-gray-300 px-2 py-1">
                        {String(row[col] ?? '-')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-gray-500 py-4">Tidak ada data.</p>
          )}

          {/* Ringkasan & Tanda Tangan */}
          <div className="mt-6 flex items-start justify-between text-xs">
            <div className="font-bold text-gray-900">
              {summaryText || `Total: ${data.length} baris data`}
            </div>
            <div className="text-right space-y-12 min-w-[200px]">
              <div>
                <div>Kendari, {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                <div className="font-semibold">Dicetak oleh: {printedBy}</div>
              </div>
              <div className="border-t border-gray-800 pt-1 font-semibold">
                Tanda Tangan & Stempel Resmi
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
