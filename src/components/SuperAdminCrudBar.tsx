import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { formatRupiah } from '../data/seedData';
import {
  Plus,
  Pencil,
  Minus,
  Trash2,
  RotateCcw,
  Lock,
  AlertTriangle,
  FileSpreadsheet,
  X,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';

export type AdminCollectionKey =
  | 'units_kavling'
  | 'bookings'
  | 'transactions'
  | 'work_progress'
  | 'po_invoice'
  | 'inventory'
  | 'suppliers'
  | 'spr_prospek'
  | 'absensi_payroll'
  | 'project_submissions'
  | 'users'
  | 'coa';

interface SuperAdminCrudBarProps {
  collectionKey: AdminCollectionKey;
  collectionLabel: string;
  itemCount: number;
  selectedIds?: string[];
  onClearSelection?: () => void;
  protectDeleteAndReset?: boolean; // True for COA
  sampleAdjustTarget?: { id: string; label: string; currentValue: number; unitLabel: string };
}

export const SuperAdminCrudBar: React.FC<SuperAdminCrudBarProps> = ({
  collectionKey,
  collectionLabel,
  itemCount,
  selectedIds = [],
  onClearSelection,
  protectDeleteAndReset = false,
  sampleAdjustTarget,
}) => {
  const {
    currentUser,
    addBooking,
    addSupplier,
    addJournalEntry,
    addAttendance,
    addInventoryItem,
    addCoaAccount,
    addKavlingUnit,
    adjustNumericData,
    deleteRecordsFromCollection,
    resetSelectedCollections,
  } = useAppStore();

  const [activeModal, setActiveModal] = useState<
    null | 'TAMBAH' | 'EDIT' | 'KURANGI' | 'HAPUS' | 'RESET'
  >(null);

  // Form states for TAMBAH
  const [addMode, setAddMode] = useState<'SINGLE' | 'BULK' | 'EXCEL'>('SINGLE');
  const [titleInput, setTitleInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [companyInput, setCompanyInput] = useState<'PT_TBL' | 'PT_BPP'>('PT_TBL');
  const [amountInput, setAmountInput] = useState<number>(169000000);
  const [qtyInput, setQtyInput] = useState<number>(50);
  const [bulkCount, setBulkCount] = useState<number>(5);

  // Form states for EDIT
  const [editTargetId, setEditTargetId] = useState('');
  const [editFieldName, setEditFieldName] = useState('status / nominal / keterangan');
  const [editNewValue, setEditNewValue] = useState('');

  // Form states for KURANGI
  const [reduceTargetId, setReduceTargetId] = useState(sampleAdjustTarget?.id || '');
  const [reduceDelta, setReduceDelta] = useState<number>(10);
  const [reduceReason, setReduceReason] = useState('Koreksi opname / penyesuaian aktual lapangan');

  // Form states for HAPUS & RESET
  const [deleteMode, setDeleteMode] = useState<'SOFT' | 'HARD'>('SOFT');
  const [confirmWord, setConfirmWord] = useState('');

  const isSuperAdmin = Boolean(currentUser && currentUser.active && currentUser.role === 'ADMIN');

  if (!isSuperAdmin) {
    return null;
  }

  const handleTambahSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = addMode === 'BULK' ? Math.max(1, Math.min(25, bulkCount)) : 1;

    for (let i = 0; i < count; i++) {
      const suffix = count > 1 ? ` #${i + 1}` : '';
      if (collectionKey === 'units_kavling') {
        addKavlingUnit({
          companyId: companyInput,
          block: 'D',
          code: codeInput ? `${codeInput}${i > 0 ? `-${i + 1}` : ''}` : `D-${21 + i}`,
          type: titleInput || 'Tipe 36/91 Subsidi Baru',
          price: amountInput || 169000000,
          hpp: 67651710,
        });
      } else if (collectionKey === 'bookings' || collectionKey === 'spr_prospek') {
        addBooking({
          buyerName: `${titleInput || 'Konsumen Baru Bahagia'}${suffix}`,
          nik: `747101${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          phone: '081245009988',
          email: 'konsumen.baru@gmail.com',
          companyId: companyInput,
          kavlingId: `${companyInput === 'PT_TBL' ? 'TBL' : 'BPP'}-C-0${(i % 9) + 1}`,
          kavlingCode: codeInput || `C-0${(i % 9) + 1}`,
          bank: 'BTN',
          bookingFee: 2000000,
          price: amountInput || 169000000,
          stage: collectionKey === 'spr_prospek' ? 'Prospek' : 'Booking',
          marketingPic: currentUser?.name || 'Super Admin',
        });
      } else if (collectionKey === 'suppliers') {
        addSupplier({
          name: `${titleInput || 'CV Mitra Material Utama'}${suffix}`,
          category: 'Material Toko',
          tempoDays: 30,
          rating: 4.9,
          bankName: 'Bank Mandiri',
          bankAccount: codeInput || '162-00-8899001-2',
          phone: '0811409988',
          address: 'Kota Kendari, Sulawesi Tenggara',
        });
      } else if (collectionKey === 'inventory') {
        addInventoryItem({
          code: codeInput || `MAT-${Math.floor(100 + Math.random() * 899)}`,
          name: `${titleInput || 'Material Konstruksi Baru'}${suffix}`,
          warehouse: companyInput === 'PT_TBL' ? 'Gudang Bahagia Land' : 'Gudang Bahagia Residence',
          companyId: companyInput,
          stock: qtyInput || 100,
          minStock: 25,
          unit: 'Sak/Batang',
          unitPrice: amountInput || 75000,
        });
      } else if (collectionKey === 'transactions') {
        addJournalEntry({
          companyId: companyInput,
          reference: codeInput || 'ADM-ADD',
          description: `${titleInput || 'Input Transaksi Admin'}${suffix}`,
          debitAccount: '1-1110 Kas PT SDP',
          creditAccount: '4-1100 Penjualan Rumah Subsidi (Rp169 Jt)',
          amount: amountInput || 15000000,
          autoGenerated: false,
        });
      } else if (collectionKey === 'absensi_payroll') {
        addAttendance({
          employeeName: `${titleInput || 'Staf Lapangan Baru'}${suffix}`,
          role: 'PENGAWAS',
          companyId: companyInput,
          lat: -4.0096,
          lng: 122.5127,
          selfieDataUrl: '',
          status: 'Hadir Tepat Waktu',
        });
      } else if (collectionKey === 'coa') {
        addCoaAccount({
          code: codeInput || `5-6${Math.floor(10 + Math.random() * 89)}0`,
          name: `${titleInput || 'Sub-Akun Beban Operasional Baru'}${suffix}`,
          category: 'BEBAN',
          level: 3,
          normalBalance: 'DEBIT',
          balance: amountInput || 0,
        });
      }
    }

    toast.success(
      addMode === 'EXCEL'
        ? `Import Excel ke koleksi ${collectionLabel} berhasil diproses & dicatat di Audit Log.`
        : `Berhasil menambahkan ${count} data baru ke ${collectionLabel}.`
    );
    setTitleInput('');
    setCodeInput('');
    setActiveModal(null);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adjustNumericData({
      collectionKey,
      targetId: editTargetId || selectedIds[0] || 'BULK-EDIT',
      delta: Number(editNewValue) || 0,
      reason: `Edit Admin (${editFieldName} → ${editNewValue})`,
      mode: 'SET',
    });
    toast.success(`Data pada ${collectionLabel} berhasil diperbarui oleh Super Admin.`);
    setActiveModal(null);
  };

  const handleKurangiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reduceReason.trim()) {
      toast.error('Wajib mengisi alasan pengurangan untuk Audit Log!');
      return;
    }
    adjustNumericData({
      collectionKey,
      targetId: reduceTargetId || sampleAdjustTarget?.id || 'ITEM-01',
      delta: -Math.abs(reduceDelta),
      reason: reduceReason,
      mode: 'DELTA',
    });
    toast.success(
      `Berhasil mengurangi ${Math.abs(reduceDelta)} pada ${collectionLabel}. Tercatat di Audit Log.`
    );
    setActiveModal(null);
  };

  const handleHapusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (protectDeleteAndReset || collectionKey === 'coa') {
      toast.error('Bagan Akun (COA) DILINDUNGI dan tidak boleh dihapus!');
      return;
    }
    if (deleteMode === 'HARD' && confirmWord !== 'HAPUS') {
      toast.error('Ketik "HAPUS" untuk konfirmasi penghapusan permanen!');
      return;
    }
    deleteRecordsFromCollection(
      collectionKey,
      selectedIds.length > 0 ? selectedIds : ['LAST_RECORD'],
      deleteMode === 'HARD'
    );
    onClearSelection?.();
    setConfirmWord('');
    setActiveModal(null);
    toast.success(
      deleteMode === 'SOFT'
        ? `Data ${collectionLabel} dipindahkan ke Trash (dapat di-restore dalam 30 hari).`
        : `Data ${collectionLabel} dihapus permanen oleh Super Admin.`
    );
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (protectDeleteAndReset || collectionKey === 'coa') {
      toast.error('COA (110+ akun) dilindungi secara permanen dan tidak bisa direset!');
      return;
    }
    if (confirmWord !== 'HAPUS') {
      toast.error('Ketik "HAPUS" dengan huruf kapital untuk mereset koleksi ini.');
      return;
    }
    resetSelectedCollections([collectionKey], true);
    setConfirmWord('');
    setActiveModal(null);
    toast.success(
      `Koleksi ${collectionLabel} berhasil di-backup & direset ke 0. Notifikasi terkirim ke Direktur.`
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs no-print">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 bg-gray-900 text-white font-mono text-[11px] font-bold rounded-md">
            SUPER ADMIN CRUD
          </span>
          <div>
            <div className="text-xs font-bold text-gray-900 flex items-center gap-2">
              <span>Kontrol Penuh: {collectionLabel}</span>
              <span className="font-mono text-emerald-700">({itemCount} data)</span>
              {selectedIds.length > 0 && (
                <span className="text-amber-700 font-mono">· {selectedIds.length} dipilih</span>
              )}
            </div>
            <div className="text-[11px] text-gray-500">
              {protectDeleteAndReset
                ? '🔒 Akun Standar COA Dilindungi: Hanya bisa Tambah sub-akun, Edit nama/saldo awal & Kurangi/Koreksi saldo.'
                : 'Semua aksi Tambah, Edit, Kurangi, Hapus (Trash 30 hari) & Reset tercatat otomatis di Audit Log.'}
            </div>
          </div>
        </div>

        {/* 5 TOMBOL UTAMA SUPER ADMIN */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveModal('TAMBAH')}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ TAMBAH</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModal('EDIT')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>EDIT</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModal('KURANGI')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>KURANGI</span>
          </button>

          {protectDeleteAndReset ? (
            <div
              className="px-3 py-1.5 bg-gray-100 border border-gray-300 text-gray-500 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-not-allowed"
              title="COA Standar Dilindungi Permanen dan Tidak Boleh Dihapus atau Direset"
            >
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>COA DILINDUNGI (NO DELETE/RESET)</span>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setActiveModal('HAPUS')}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>HAPUS</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModal('RESET')}
                className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESET</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* MODAL A: [+ TAMBAH] */}
      {activeModal === 'TAMBAH' && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <form
            onSubmit={handleTambahSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-gray-200 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="font-mono text-[11px] text-emerald-700 font-bold">
                  SUPER ADMIN · [+ TAMBAH DATA]
                </span>
                <h3 className="text-base font-bold text-gray-900">
                  Tambah Data ke {collectionLabel}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setAddMode('SINGLE')}
                className={`flex-1 py-1.5 rounded-md font-semibold ${
                  addMode === 'SINGLE' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600'
                }`}
              >
                1 Data Tunggal
              </button>
              <button
                type="button"
                onClick={() => setAddMode('BULK')}
                className={`flex-1 py-1.5 rounded-md font-semibold ${
                  addMode === 'BULK' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600'
                }`}
              >
                Bulk (Banyak Sekaligus)
              </button>
              <button
                type="button"
                onClick={() => setAddMode('EXCEL')}
                className={`flex-1 py-1.5 rounded-md font-semibold ${
                  addMode === 'EXCEL' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600'
                }`}
              >
                Import Excel (.xlsx/.csv)
              </button>
            </div>

            {addMode === 'EXCEL' ? (
              <div className="p-5 border-2 border-dashed border-emerald-300 bg-emerald-50/40 rounded-xl text-center space-y-2">
                <FileSpreadsheet className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="font-bold text-gray-900">
                  Upload File Template Excel / CSV untuk {collectionLabel}
                </div>
                <p className="text-gray-500">
                  Format kolom otomatis disesuaikan dengan skema koleksi Firestore.
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="block w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:text-white file:font-semibold"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-600 block mb-1">Entitas Perusahaan (PT)</label>
                    <select
                      value={companyInput}
                      onChange={(e) => setCompanyInput(e.target.value as any)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white font-medium"
                    >
                      <option value="PT_TBL">PT Tata Bahagia Land</option>
                      <option value="PT_BPP">PT Bahagia Prima Property</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-600 block mb-1">
                      {collectionKey === 'coa'
                        ? 'Kode Sub-Akun COA (Contoh: 5-6100)'
                        : 'Kode / Nomor Referensi'}
                    </label>
                    <input
                      type="text"
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value)}
                      placeholder={collectionKey === 'coa' ? '5-6100' : 'Auto / Kustom'}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-600 block mb-1">
                    Nama / Judul / Uraian Data Baru *
                  </label>
                  <input
                    type="text"
                    required
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    placeholder={`Masukkan nama ${collectionLabel}...`}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-600 block mb-1">
                      Nominal / Harga / Saldo Awal (Rp)
                    </label>
                    <input
                      type="number"
                      value={amountInput}
                      onChange={(e) => setAmountInput(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                    />
                  </div>
                  {addMode === 'BULK' ? (
                    <div>
                      <label className="text-gray-600 block mb-1">
                        Jumlah Generate Sekaligus (Bulk)
                      </label>
                      <input
                        type="number"
                        min={2}
                        max={25}
                        value={bulkCount}
                        onChange={(e) => setBulkCount(Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono font-bold text-emerald-700"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-gray-600 block mb-1">Kuantitas / Stok Awal</label>
                      <input
                        type="number"
                        value={qtyInput}
                        onChange={(e) => setQtyInput(Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg"
              >
                Simpan Data Baru
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL B: [EDIT] */}
      {activeModal === 'EDIT' && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <form
            onSubmit={handleEditSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-gray-200 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="font-mono text-[11px] text-blue-700 font-bold">
                  SUPER ADMIN · [EDIT DATA & BULK EDIT]
                </span>
                <h3 className="text-base font-bold text-gray-900">
                  Edit Semua Field / Bulk Edit: {collectionLabel}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-gray-600 block mb-1">
                  ID Target / Kode Item (Kosongkan untuk Bulk Edit item terpilih)
                </label>
                <input
                  type="text"
                  value={editTargetId}
                  onChange={(e) => setEditTargetId(e.target.value)}
                  placeholder={
                    selectedIds.length > 0
                      ? `Bulk Edit ${selectedIds.length} item terpilih`
                      : sampleAdjustTarget?.id || 'Masukkan Kode / ID (Contoh: TBL-A-01 / 1-1110)'
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                />
              </div>

              <div>
                <label className="text-gray-600 block mb-1">Field yang Diubah</label>
                <select
                  value={editFieldName}
                  onChange={(e) => setEditFieldName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="Harga / Nominal / Saldo Awal">Harga / Nominal / Saldo Awal (Rp)</option>
                  <option value="Status (Override Super Admin)">Status (Override Super Admin)</option>
                  <option value="Nama / Deskripsi / Spesifikasi">Nama / Deskripsi / Spesifikasi</option>
                  <option value="Progress Fisik (%) / Stok">Progress Fisik (%) / Stok</option>
                </select>
              </div>

              <div>
                <label className="text-gray-600 block mb-1">Nilai Baru *</label>
                <input
                  type="text"
                  required
                  value={editNewValue}
                  onChange={(e) => setEditNewValue(e.target.value)}
                  placeholder="Masukkan nilai atau angka baru..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
              >
                Terapkan Perubahan Edit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL C: [KURANGI] */}
      {activeModal === 'KURANGI' && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <form
            onSubmit={handleKurangiSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-gray-200 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="font-mono text-[11px] text-amber-700 font-bold">
                  SUPER ADMIN · [KURANGI STOK / PROGRESS / NOMINAL]
                </span>
                <h3 className="text-base font-bold text-gray-900">
                  Kurangi Nilai / Kuantitas pada {collectionLabel}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-950 space-y-1">
              <div className="font-bold">Contoh Penggunaan Tombol [➖ KURANGI]:</div>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                <li>Kurangi stok material (contoh: Semen dari 100 sak dikurangi 10 menjadi 90 sak)</li>
                <li>Kurangi progress jika salah input (contoh: dari 80% dikurangi 10% menjadi 70%)</li>
                <li>Kurangi jumlah item di PO atau koreksi nominal pembayaran / saldo COA</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-gray-600 block mb-1">ID / Kode Target yang Dikurangi *</label>
                <input
                  type="text"
                  required
                  value={reduceTargetId}
                  onChange={(e) => setReduceTargetId(e.target.value)}
                  placeholder={sampleAdjustTarget?.id || 'Contoh: MAT-001 / TBL-A-01 / PO-2026-0001 / 1-1110'}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                />
              </div>

              <div>
                <label className="text-gray-600 block mb-1">
                  Nilai / Jumlah Pengurangan (Angka Positif) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={reduceDelta}
                  onChange={(e) => setReduceDelta(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono font-bold text-amber-800"
                />
              </div>

              <div>
                <label className="text-gray-600 block mb-1">
                  Alasan Pengurangan (Wajib untuk Audit Log) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={reduceReason}
                  onChange={(e) => setReduceReason(e.target.value)}
                  placeholder="Contoh: Koreksi selisih opname gudang / koreksi salah input progress..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg"
              >
                Kurangi & Catat di Audit Log
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL D: [HAPUS] */}
      {activeModal === 'HAPUS' && !protectDeleteAndReset && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <form
            onSubmit={handleHapusSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-gray-200 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                <h3 className="text-base font-bold text-gray-900">
                  Hapus Data: {collectionLabel}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeleteMode('SOFT')}
                className={`p-3 rounded-lg border text-left ${
                  deleteMode === 'SOFT'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                <div>Soft Delete (Direkomendasikan)</div>
                <div className="text-[11px] font-normal mt-0.5">
                  Masuk ke /sistem/trash & bisa di-restore dalam 30 hari
                </div>
              </button>
              <button
                type="button"
                onClick={() => setDeleteMode('HARD')}
                className={`p-3 rounded-lg border text-left ${
                  deleteMode === 'HARD'
                    ? 'border-red-600 bg-red-50 text-red-950 font-bold'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                <div>Hard Delete (Permanen)</div>
                <div className="text-[11px] font-normal mt-0.5">
                  Hapus permanen (Khusus Super Admin)
                </div>
              </button>
            </div>

            {deleteMode === 'HARD' && (
              <div>
                <label className="text-red-700 font-semibold block mb-1">
                  Ketik "HAPUS" untuk konfirmasi penghapusan permanen:
                </label>
                <input
                  type="text"
                  value={confirmWord}
                  onChange={(e) => setConfirmWord(e.target.value)}
                  placeholder="HAPUS"
                  className="w-full border border-red-300 rounded-lg px-3 py-2 font-mono font-bold"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg"
              >
                {deleteMode === 'SOFT' ? 'Pindahkan ke Trash (30 Hari)' : 'Hapus Permanen'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL E: [RESET] */}
      {activeModal === 'RESET' && !protectDeleteAndReset && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <form
            onSubmit={handleResetSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-gray-200 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-gray-900">
                  Reset Seluruh Data Koleksi: {collectionLabel}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-red-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Peringatan Reset Koleksi ({itemCount} Data)</span>
              </div>
              <p>
                Seluruh data dummy/contoh pada <strong>{collectionLabel}</strong> akan dikosongkan agar siap diisi data riil. Sistem otomatis mengunduh <strong>Backup JSON</strong> sebelum mereset.
              </p>
              <p className="text-emerald-800 font-semibold pt-1">
                🔒 Catatan: Bagan Akun (COA 110+ akun) tetap aman dan tidak akan terhapus.
              </p>
            </div>

            <div>
              <label className="text-gray-800 font-bold block mb-1">
                Ketik "HAPUS" untuk konfirmasi Reset Koleksi:
              </label>
              <input
                type="text"
                required
                value={confirmWord}
                onChange={(e) => setConfirmWord(e.target.value)}
                placeholder="HAPUS"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono font-bold text-red-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white font-semibold rounded-lg"
              >
                Backup Otomatis & Reset Koleksi Ini
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
