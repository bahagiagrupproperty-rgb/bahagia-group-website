import React, { useState, useRef } from 'react';
import { Printer, QrCode, CheckCircle2, ShieldCheck, FileSpreadsheet, FileText, Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { formatRupiah, terbilangRupiah } from '../data/seedData';
import { exportToExcel, exportToPDF, exportToCSV } from '../utils/exportUtils';
import { toast } from 'sonner';

export type OfficialDocType = 'KWITANSI' | 'INVOICE' | 'PO' | 'SPK' | 'SPR' | 'SPP' | 'BAST' | 'SLIP_GAJI';

interface OfficialDocumentModalProps {
  docType?: OfficialDocType;
  onClose?: () => void;
}

export const OfficialDocumentCenter: React.FC<OfficialDocumentModalProps> = ({ docType = 'SPR', onClose }) => {
  const [selectedDoc, setSelectedDoc] = useState<OfficialDocType>(docType);
  const [companyChoice, setCompanyChoice] = useState<'PT_TBL' | 'PT_BPP'>('PT_TBL');
  const [recipientName, setRecipientName] = useState('La Ode Muhammad Akbar');
  const [unitCode, setUnitCode] = useState('Kavling C-01 (Tipe 36/91 - 7×13m)');
  const [nominal, setNominal] = useState(169000000);
  const [description, setDescription] = useState(
    'Pemesanan 1 (Satu) Unit Rumah Subsidi Siap Huni Lengkap Kelebihan Tanah & Bebas Biaya Akad/Notaris'
  );
  const printSheetRef = useRef<HTMLDivElement>(null);

  const docNumberMap: Record<OfficialDocType, string> = {
    KWITANSI: 'KWT/BGP/X/2026/0089',
    INVOICE: 'INV/BGP/X/2026/0114',
    PO: 'PO/BGP-PURCH/X/2026/0001',
    SPK: 'SPK/BGP-TEKNIK/X/2026/0042',
    SPR: 'SPR/BGP-MKT/X/2026/0095',
    SPP: 'SPP/BGP-KEU/X/2026/0063',
    BAST: 'BAST/BGP-PJT/X/2026/0018',
    SLIP_GAJI: 'PAY/BGP-HRD/X/2026/0031',
  };

  const docTitleMap: Record<OfficialDocType, string> = {
    KWITANSI: 'KWITANSI PEMBAYARAN RESMI',
    INVOICE: 'FAKTUR TAGIHAN (INVOICE)',
    PO: 'PURCHASE ORDER (SURAT PESANAN MATERIAL)',
    SPK: 'SURAT PERINTAH KERJA (SPK MANDOR)',
    SPR: 'SURAT PEMESANAN RUMAH (SPR)',
    SPP: 'SURAT PERMINTAAN PEMBAYARAN (SPP)',
    BAST: 'BERITA ACARA SERAH TERIMA (BAST UNIT)',
    SLIP_GAJI: 'SLIP GAJI KARYAWAN RESMI',
  };

  const reactToPrintFn = useReactToPrint({
    contentRef: printSheetRef,
    documentTitle: `${selectedDoc}_${docNumberMap[selectedDoc].replace(/\//g, '-')}`,
  });

  const handlePrint = () => {
    toast.success(`🖨️ Membuka dialog cetak ${docTitleMap[selectedDoc]}...`);
    try {
      reactToPrintFn();
    } catch {
      window.print();
    }
  };

  const handleExportDocPdf = () => {
    exportToPDF(
      docTitleMap[selectedDoc],
      ['Nomor Dokumen', 'Entitas PT', 'Pihak Terkait', 'Unit / Referensi', 'Nominal', 'Terbilang', 'Uraian'],
      [
        [
          docNumberMap[selectedDoc],
          companyChoice === 'PT_TBL' ? 'PT Tata Bahagia Land' : 'PT Bahagia Prima Property',
          recipientName,
          unitCode,
          formatRupiah(nominal),
          terbilangRupiah(nominal),
          description,
        ],
      ],
      `${selectedDoc}_Resmi`
    );
  };

  const handleExportDocExcel = () => {
    exportToExcel(
      [
        {
          'Nomor Dokumen': docNumberMap[selectedDoc],
          'Jenis Dokumen': docTitleMap[selectedDoc],
          'Entitas PT': companyChoice === 'PT_TBL' ? 'PT Tata Bahagia Land' : 'PT Bahagia Prima Property',
          'Pihak Terkait': recipientName,
          'Unit / Referensi': unitCode,
          'Nominal (Rp)': nominal,
          Terbilang: terbilangRupiah(nominal),
          Uraian: description,
        },
      ],
      `${selectedDoc}_Resmi`,
      selectedDoc
    );
  };

  const handleExportDocCsv = () => {
    exportToCSV(
      [
        {
          'Nomor Dokumen': docNumberMap[selectedDoc],
          'Jenis Dokumen': docTitleMap[selectedDoc],
          'Entitas PT': companyChoice === 'PT_TBL' ? 'PT Tata Bahagia Land' : 'PT Bahagia Prima Property',
          'Pihak Terkait': recipientName,
          'Unit / Referensi': unitCode,
          'Nominal (Rp)': nominal,
          Terbilang: terbilangRupiah(nominal),
          Uraian: description,
        },
      ],
      `${selectedDoc}_Resmi`
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4 no-print">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Cetak Dokumen Resmi Berkop & Tanda Tangan QR Digital
          </h3>
          <p className="text-xs text-gray-500">
            Pilih 8 jenis dokumen standar grup properti (Kwitansi, Invoice, PO, SPK, SPR, SPP, BAST, Slip Gaji)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedDoc}
            onChange={(e) => setSelectedDoc(e.target.value as OfficialDocType)}
            className="text-xs border border-gray-300 rounded-lg px-3 py-2 font-medium text-gray-800 bg-white"
          >
            <option value="SPR">1. SPR (Surat Pemesanan Rumah)</option>
            <option value="KWITANSI">2. Kwitansi Resmi</option>
            <option value="INVOICE">3. Invoice Tagihan</option>
            <option value="PO">4. PO (Purchase Order Material)</option>
            <option value="SPK">5. SPK Mandor Konstruksi</option>
            <option value="SPP">6. SPP (Permintaan Pembayaran)</option>
            <option value="BAST">7. BAST (Berita Acara Serah Terima)</option>
            <option value="SLIP_GAJI">8. Slip Gaji Karyawan</option>
          </select>

          <select
            value={companyChoice}
            onChange={(e) => setCompanyChoice(e.target.value as 'PT_TBL' | 'PT_BPP')}
            className="text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800"
          >
            <option value="PT_TBL">Kop PT Tata Bahagia Land</option>
            <option value="PT_BPP">Kop PT Bahagia Prima Property</option>
          </select>

          <button
            type="button"
            onClick={handleExportDocExcel}
            className="px-3 py-2 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>📥 Excel</span>
          </button>
          <button
            type="button"
            onClick={handleExportDocPdf}
            className="px-3 py-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-800 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>📄 PDF</span>
          </button>
          <button
            type="button"
            onClick={handleExportDocCsv}
            className="px-3 py-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>📋 CSV</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>🖨️ Print</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50"
            >
              Tutup
            </button>
          )}
        </div>
      </div>

      {/* Form Quick Customizer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200 no-print">
        <div>
          <label className="text-xs text-gray-600 block mb-1">Pihak Kedua / Penerima / Konsumen</label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 block mb-1">Kavling / Objek Pekerjaan / Jabatan</label>
          <input
            type="text"
            value={unitCode}
            onChange={(e) => setUnitCode(e.target.value)}
            className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 block mb-1">Nilai Nominal (Rp)</label>
          <input
            type="number"
            value={nominal}
            onChange={(e) => setNominal(Number(e.target.value))}
            className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white font-mono"
          />
        </div>
      </div>

      {/* Printable Official Sheet */}
      <div
        ref={printSheetRef}
        className="border border-gray-300 rounded-xl p-8 bg-white text-gray-900 space-y-6 max-w-4xl mx-auto shadow-xs print-area"
      >
        {/* Letterhead / Kop Surat */}
        <div className="flex items-start justify-between border-b-2 border-gray-900 pb-4">
          <div>
            <div className="text-xs font-semibold tracking-wider text-emerald-700">
              BAHAGIA GROUP PROPERTY
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-0.5">
              {companyChoice === 'PT_TBL' ? 'PT TATA BAHAGIA LAND' : 'PT BAHAGIA PRIMA PROPERTY'}
            </h2>
            <p className="text-xs text-gray-600 mt-1">
              {companyChoice === 'PT_TBL'
                ? 'Proyek Perumahan Bahagia Land · Jl. Anawai, Kel. Anawai, Kec. Wua-wua, Kota Kendari'
                : 'Proyek Perumahan Bahagia Residence · Jl. Gersamata, Ranomeeto, Kab. Konawe Selatan'}
            </p>
            <p className="text-xs text-gray-500">
              Telp: 0401-3128899 · Email: official@bahagiagroup.com · Website: www.bahagiagroup.com
            </p>
          </div>
          <div className="text-right font-mono text-xs">
            <div className="font-bold text-gray-900">{docNumberMap[selectedDoc]}</div>
            <div className="text-gray-500 mt-1">Tanggal: 08 Oktober 2026</div>
            <div className="text-emerald-700 font-semibold mt-1">ASLI / TERVERIFIKASI</div>
          </div>
        </div>

        {/* Document Header */}
        <div className="text-center py-2">
          <h3 className="text-lg font-bold tracking-tight underline">{docTitleMap[selectedDoc]}</h3>
          <p className="text-xs text-gray-500 font-mono mt-0.5">Nomor Dokumen: {docNumberMap[selectedDoc]}</p>
        </div>

        {/* Document Body */}
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border border-gray-200 rounded-lg p-4 bg-gray-50/60 text-xs">
            <div>
              <span className="text-gray-500 block">Nama Pihak Terkait</span>
              <span className="font-semibold text-gray-900">{recipientName}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Unit / Kavling / Referensi</span>
              <span className="font-semibold text-gray-900">{unitCode}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Nilai Transaksi / Kontrak</span>
              <span className="font-mono font-bold text-emerald-700 tabular-nums">{formatRupiah(nominal)}</span>
            </div>
            <div className="sm:col-span-3 pt-2 border-t border-gray-200">
              <span className="text-gray-500 block">Terbilang Otomatis</span>
              <span className="italic font-medium text-gray-800"># {terbilangRupiah(nominal)} #</span>
            </div>
          </div>

          <div className="text-xs leading-relaxed text-gray-700 space-y-2">
            <p>
              <strong>Uraian / Keterangan Resmi:</strong> {description}
            </p>
            <p>
              Dokumen ini diterbitkan secara elektronik oleh Sistem ERP Terpadu{' '}
              <strong>{companyChoice === 'PT_TBL' ? 'PT Tata Bahagia Land' : 'PT Bahagia Prima Property'}</strong>{' '}
              (Bahagia Group Property) dan telah melalui verifikasi berjenjang sesuai SOP perusahaan.
            </p>
          </div>
        </div>

        {/* Digital Signatures with PJT QR Verification */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 text-center text-xs">
          <div className="space-y-2">
            <div className="text-gray-500">Pihak Kedua / Penerima</div>
            <div className="h-16 flex items-center justify-center text-gray-400 italic">
              (Tanda Tangan & Materai)
            </div>
            <div className="font-semibold text-gray-900 underline">{recipientName}</div>
          </div>

          <div className="space-y-1 border-x border-gray-100 px-2">
            <div className="text-gray-500">Verifikasi Teknis (PJT)</div>
            <div className="flex flex-col items-center justify-center py-1">
              <div className="p-1.5 border border-emerald-300 bg-emerald-50 rounded-lg inline-flex items-center gap-1.5">
                <QrCode className="w-8 h-8 text-emerald-800" />
                <div className="text-left text-[10px] leading-tight font-mono text-emerald-900">
                  <div className="font-bold flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" /> QR VALID
                  </div>
                  <div>SIG-PJT-98A42F</div>
                  <div>08/10/2026</div>
                </div>
              </div>
            </div>
            <div className="font-semibold text-gray-900 underline">
              {companyChoice === 'PT_TBL' ? 'Ir. Lukman Hakim, S.T., IPM' : 'Ir. Hasanuddin, S.T., M.T.'}
            </div>
            <div className="text-[11px] text-gray-500">Penanggung Jawab Teknis</div>
          </div>

          <div className="space-y-1">
            <div className="text-gray-500">Disetujui Oleh (Direktur)</div>
            <div className="flex flex-col items-center justify-center py-1">
              <div className="p-1.5 border border-gray-300 bg-gray-50 rounded-lg inline-flex items-center gap-1.5">
                <QrCode className="w-8 h-8 text-gray-800" />
                <div className="text-left text-[10px] leading-tight font-mono text-gray-800">
                  <div className="font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> APPROVED
                  </div>
                  <div>DIR-BGP-2026</div>
                  <div>Single Approval</div>
                </div>
              </div>
            </div>
            <div className="font-semibold text-gray-900 underline">Ir. H. Ahmad Bahagia, M.M.</div>
            <div className="text-[11px] text-gray-500">Direktur Utama Bahagia Group</div>
          </div>
        </div>
      </div>
    </div>
  );
};
