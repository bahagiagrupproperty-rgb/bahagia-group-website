import React, { useState } from 'react';
import { useAppStore, VerificationItem } from '../store/useAppStore';
import {
  formatRupiah,
  UNIT_PROGRESS_CHECKLIST_ITEMS,
} from '../data/seedData';
import { UploadFoto } from '../components/UploadFoto';
import { UnitLiveCameraCapture } from '../components/UnitLiveCameraCapture';
import { OfficialDocumentCenter } from '../components/OfficialDocumentCenter';
import { SuperAdminCrudBar } from '../components/SuperAdminCrudBar';
import { ExportActionButtons } from '../utils/exportUtils';
import {
  CheckCircle2,
  XCircle,
  QrCode,
  ShieldCheck,
  FileCheck2,
  Sliders,
  Plus,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';

// ==========================================
// 1. PJT VERIFICATION DESK (/project/verifikasi & /project/verifikasi-rab)
// ==========================================
export const PjtVerificationPage: React.FC = () => {
  const { verifications, pjtVerifyAction, currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<'WAITING' | 'VERIFIED' | 'HISTORY'>('WAITING');
  const [selectedItem, setSelectedItem] = useState<VerificationItem | null>(verifications[0] || null);
  const [techNotes, setTechNotes] = useState('');

  const waitingList = verifications.filter((v) => v.status === 'Menunggu Verifikasi PJT');
  const verifiedList = verifications.filter(
    (v) => v.status === 'Menunggu Approval Direktur' || v.status === 'Approved Direktur'
  );
  const displayedList =
    activeTab === 'WAITING' ? waitingList : activeTab === 'VERIFIED' ? verifiedList : verifications;

  const isPjtOrAdmin = currentUser?.role === 'PJT' || currentUser?.role === 'ADMIN' || currentUser?.role === 'DIREKTUR';

  const handleDecision = (decision: 'OK' | 'REJECT') => {
    if (!selectedItem) return;
    if (decision === 'REJECT' && !techNotes.trim()) {
      toast.error('Untuk Reject teknis, wajib mengisi alasan teknis pada kolom catatan PJT.');
      return;
    }
    pjtVerifyAction(
      selectedItem.id,
      decision,
      techNotes || 'Spesifikasi teknis, volume, dan kualitas pekerjaan memenuhi standar PJT.'
    );
    toast.success(
      decision === 'OK'
        ? `Dokumen ${selectedItem.id} berhasil diverifikasi PJT + Tanda Tangan QR dibubuhkan. Diteruskan ke Direktur.`
        : `Dokumen ${selectedItem.id} ditolak oleh PJT untuk direvisi Pengawas.`
    );
    setTechNotes('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-emerald-700">
            MEJA VERIFIKASI TEKNIS PJT (PENANGGUNG JAWAB TEKNIS)
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-0.5">
            Verifikasi RAB, Progress Fisik, Opname Mandor & BAST Digital QR
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            PJT memiliki akses Read-Only terhadap angka progress (tidak mengubah persentase secara langsung), namun berwenang memvalidasi atau menolak dengan catatan teknis sebelum masuk ke Direktur.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('WAITING')}
            className={`px-3 py-2 rounded-md whitespace-nowrap ${
              activeTab === 'WAITING' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
            }`}
          >
            Menunggu Verifikasi ({waitingList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('VERIFIED')}
            className={`px-3 py-2 rounded-md whitespace-nowrap ${
              activeTab === 'VERIFIED' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
            }`}
          >
            Sudah Diverifikasi ({verifiedList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3 py-2 rounded-md whitespace-nowrap ${
              activeTab === 'HISTORY' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
            }`}
          >
            Semua Riwayat ({verifications.length})
          </button>
        </div>
      </div>

      {/* SUPER ADMIN 5-BUTTON CRUD TOOLBAR FOR WORK PROGRESS & VERIFICATION */}
      <SuperAdminCrudBar
        collectionKey="work_progress"
        collectionLabel="Verifikasi Teknis PJT & Progress Pekerjaan"
        itemCount={verifications.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table List */}
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-gray-900">Daftar Pengajuan Teknis (Klik Baris untuk Pemeriksaan)</h2>
            <ExportActionButtons
              title="Laporan Verifikasi Teknis PJT"
              subtitle={`Total ${displayedList.length} Dokumen Teknis`}
              filename="Laporan_Verifikasi_PJT"
              headers={['ID', 'Jenis', 'Judul', 'Lokasi', 'Pengaju', 'Nilai', 'Status']}
              data={displayedList.map((v) => ({
                ID: v.id,
                Jenis: v.type,
                Judul: v.title,
                Lokasi: v.kavlingOrArea,
                Pengaju: v.requester,
                Nilai: v.amount,
                Status: v.status,
              }))}
              rows={displayedList.map((v) => [
                v.id,
                v.type,
                v.title,
                v.kavlingOrArea,
                v.requester,
                v.amount > 0 ? formatRupiah(v.amount) : 'Fisik 0-100%',
                v.status,
              ])}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="py-2.5 pr-2">Jenis & Judul</th>
                  <th className="py-2.5 px-2">Pengaju</th>
                  <th className="py-2.5 px-2 text-right">Nilai RAB/Opname</th>
                  <th className="py-2.5 pl-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayedList.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`cursor-pointer transition-colors ${
                      selectedItem?.id === item.id ? 'bg-emerald-50/60' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="py-3 pr-2">
                      <div className="font-mono text-[11px] text-emerald-700 font-semibold">
                        {item.type} · {item.id}
                      </div>
                      <div className="font-semibold text-gray-900">{item.title}</div>
                      <div className="text-[11px] text-gray-500">{item.kavlingOrArea}</div>
                    </td>
                    <td className="py-3 px-2 text-gray-600 whitespace-nowrap">{item.requester}</td>
                    <td className="py-3 px-2 text-right font-mono font-semibold text-gray-900 tabular-nums whitespace-nowrap">
                      {item.amount > 0 ? formatRupiah(item.amount) : 'Fisik 0-100%'}
                    </td>
                    <td className="py-3 pl-2 text-right whitespace-nowrap">
                      <span className="font-medium text-gray-800">{item.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Inspection & Digital Signature Box */}
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          {selectedItem ? (
            <>
              <div className="border-b border-gray-100 pb-3">
                <span className="text-xs font-mono text-emerald-700 font-semibold">
                  LEMBAR PEMERIKSAAN TEKNIS PJT · {selectedItem.id}
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-1">{selectedItem.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Lokasi: {selectedItem.kavlingOrArea} ({selectedItem.companyId}) · Diajukan: {selectedItem.createdAt}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5 text-xs space-y-2">
                <div>
                  <span className="text-gray-500 block">Spesifikasi Teknis & Volume</span>
                  <span className="font-semibold text-gray-900">{selectedItem.volumeSpec}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Nilai Anggaran / Opname</span>
                  <span className="font-mono font-bold text-emerald-700 tabular-nums">
                    {selectedItem.amount > 0 ? formatRupiah(selectedItem.amount) : 'Inspeksi Progress Fisik (Read-Only)'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Catatan Teknis Saat Ini</span>
                  <span className="text-gray-800">{selectedItem.technicalNotes}</span>
                </div>
              </div>

              {/* Digital Signature Preview if already verified */}
              {selectedItem.pjtSignatureHash && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
                  <QrCode className="w-10 h-10 text-emerald-800 shrink-0" />
                  <div className="text-xs text-emerald-950 font-mono">
                    <div className="font-bold flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> TANDA TANGAN DIGITAL PJT SAH
                    </div>
                    <div>Pejabat: {selectedItem.pjtVerifiedBy}</div>
                    <div>Hash QR: {selectedItem.pjtSignatureHash} · {selectedItem.pjtVerifiedAt}</div>
                  </div>
                </div>
              )}

              {/* Input Catatan Teknis PJT */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-800 block">
                  Tambah Catatan Teknis / Alasan Reject PJT:
                </label>
                <textarea
                  rows={3}
                  value={techNotes}
                  onChange={(e) => setTechNotes(e.target.value)}
                  placeholder="Contoh: Spesifikasi besi 10mm SNI, adukan 1:4, dan elevasi plafon 4m telah sesuai gambar kerja..."
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              {isPjtOrAdmin ? (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleDecision('OK')}
                    className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verifikasi OK + TTD QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecision('REJECT')}
                    className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject (Revisi Pengawas)</span>
                  </button>
                </div>
              ) : (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-lg">
                  Hanya akun dengan role <strong>PJT</strong> yang dapat menekan tombol Verifikasi Teknis.
                </div>
              )}
            </>
          ) : (
            <div className="text-xs text-gray-500 py-8 text-center">Pilih baris di sebelah kiri untuk melihat detail.</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. SINGLE APPROVAL KE DIREKTUR (/approval)
// ==========================================
export const SingleApprovalDirectorPage: React.FC = () => {
  const {
    verifications,
    purchaseOrders,
    projectSubmissions,
    approvalNotifications,
    markApprovalNotificationRead,
    markAllApprovalNotificationsReadForRole,
    directorApproveAction,
    approvePurchaseOrder,
    approveProjectSubmissionByDirector,
    approvalLimit,
    currentUser,
  } = useAppStore();
  const [tab, setTab] = useState<'WAITING' | 'APPROVED' | 'ALL'>('WAITING');
  const [editAmountMap, setEditAmountMap] = useState<Record<string, number>>({});
  const [projectNotesMap, setProjectNotesMap] = useState<Record<string, string>>({});

  const waitingVerifications = verifications.filter((v) => v.status === 'Menunggu Approval Direktur');
  const waitingPOs = purchaseOrders.filter((p) => p.status === 'Menunggu Approval Direktur');
  const waitingProjectSubmissions = projectSubmissions.filter(
    (s) => s.status === 'Menunggu Approval Direktur'
  );
  const totalWaitingDirector =
    waitingVerifications.length + waitingPOs.length + waitingProjectSubmissions.length;

  const directorUnreadNotifs = approvalNotifications.filter(
    (n) => (n.targetRole === 'DIREKTUR' || n.targetRole === 'ALL') && !n.isRead
  );

  const handleBulkApproveAll = () => {
    waitingVerifications.forEach((v) => directorApproveAction(v.id, 'APPROVE'));
    waitingPOs.forEach((po) => approvePurchaseOrder(po.id, 'Approved'));
    waitingProjectSubmissions.forEach((s) =>
      approveProjectSubmissionByDirector(
        s.id,
        'APPROVE',
        'Disetujui melalui Bulk Approval Direktur.'
      )
    );
    toast.success('Semua pengajuan di antrean berhasil di-Approve secara massal (Bulk Approval Direktur)');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-emerald-700">
            SINGLE APPROVAL DIREKTUR UTAMA · LIMIT OTOMATIS: {formatRupiah(approvalLimit)}
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-0.5">
            Otorisasi Pengeluaran &gt; Rp1 Juta, PO Multi-Material, RAB (Setelah PJT), Upah & Proyek Baru
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Pengeluaran &lt; {formatRupiah(approvalLimit)} langsung diproses oleh Keuangan. Pengajuan teknis wajib melewati Verifikasi PJT terlebih dahulu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ExportActionButtons
            title="Laporan Antrean & Riwayat Single Approval Direktur"
            subtitle={`Total ${verifications.length} Pengajuan Teknis & ${purchaseOrders.length} PO`}
            filename="Laporan_Single_Approval_Direktur"
            headers={['ID', 'Jenis', 'Uraian', 'Pengaju', 'Nominal', 'Status']}
            data={verifications.map((v) => ({
              ID: v.id,
              Jenis: v.type,
              Uraian: v.title,
              Pengaju: v.requester,
              Nominal: v.amount,
              Status: v.status,
            }))}
            rows={verifications.map((v) => [
              v.id,
              v.type,
              v.title,
              v.requester,
              formatRupiah(v.amount),
              v.status,
            ])}
          />
          <button
            type="button"
            onClick={handleBulkApproveAll}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg"
          >
            Approve Semua Antrean ({totalWaitingDirector})
          </button>
        </div>
      </div>

      {/* Real-Time Firestore Notification Alert Banner for Director */}
      {directorUnreadNotifs.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-ping" />
              <span className="text-xs font-bold text-amber-950">
                ALERT FIRESTORE REAL-TIME: {directorUnreadNotifs.length} Pengajuan Baru Menunggu Keputusan Direktur
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                markAllApprovalNotificationsReadForRole('DIREKTUR');
                toast.success('Semua alert notifikasi Direktur ditandai sudah dibaca');
              }}
              className="text-[11px] font-semibold text-amber-900 bg-white border border-amber-300 px-2.5 py-1 rounded-lg hover:bg-amber-100 cursor-pointer"
            >
              ✓ Tandai Semua Dibaca
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {directorUnreadNotifs.slice(0, 4).map((n) => (
              <div
                key={n.id}
                onClick={() => markApprovalNotificationRead(n.id)}
                className="bg-white border border-amber-200 rounded-lg p-3 flex items-start justify-between gap-2 cursor-pointer hover:border-emerald-400"
              >
                <div className="space-y-0.5 text-xs">
                  <div className="font-bold text-gray-900">{n.title}</div>
                  <div className="text-[11px] text-gray-600">{n.message}</div>
                  <div className="text-[10px] font-mono text-gray-500">
                    Oleh: {n.requester || n.createdBy} · {n.createdAt}
                  </div>
                </div>
                {n.amount > 0 && (
                  <span className="font-mono text-xs font-bold text-emerald-700 shrink-0">
                    {formatRupiah(n.amount)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTab('WAITING')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg border ${
            tab === 'WAITING' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200'
          }`}
        >
          Menunggu Approval Direktur ({totalWaitingDirector})
        </button>
        <button
          onClick={() => setTab('APPROVED')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg border ${
            tab === 'APPROVED' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200'
          }`}
        >
          Sudah Di-Approve
        </button>
        <button
          onClick={() => setTab('ALL')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg border ${
            tab === 'ALL' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200'
          }`}
        >
          Semua Riwayat Approval
        </button>
      </div>

      {/* Section 1: RAB, Opname, BAST (Sudah Diverifikasi PJT) */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-gray-900">
          1. Pengajuan RAB, Opname Mandor & BAST (Telah Diverifikasi Teknis oleh PJT)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="py-2.5 pr-3">Kode & Uraian Pengajuan</th>
                <th className="py-2.5 px-3">Verifikasi PJT</th>
                <th className="py-2.5 px-3 text-right">Nominal (Bisa Edit & Approve)</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 pl-3 text-right">Keputusan Direktur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {verifications
                .filter((v) =>
                  tab === 'WAITING'
                    ? v.status === 'Menunggu Approval Direktur'
                    : tab === 'APPROVED'
                    ? v.status === 'Approved Direktur'
                    : true
                )
                .map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="py-3 pr-3">
                      <div className="font-mono text-[11px] text-emerald-700 font-semibold">
                        {v.id} · {v.companyId}
                      </div>
                      <div className="font-semibold text-gray-900">{v.title}</div>
                      <div className="text-[11px] text-gray-500">{v.requester}</div>
                    </td>
                    <td className="py-3 px-3">
                      {v.pjtVerifiedBy ? (
                        <div className="text-[11px]">
                          <div className="font-semibold text-emerald-700">{v.pjtVerifiedBy}</div>
                          <div className="font-mono text-gray-500">QR: {v.pjtSignatureHash}</div>
                        </div>
                      ) : (
                        <span className="text-amber-600">Belum Verifikasi PJT</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <input
                        type="number"
                        value={editAmountMap[v.id] ?? v.amount}
                        onChange={(e) =>
                          setEditAmountMap({ ...editAmountMap, [v.id]: Number(e.target.value) })
                        }
                        className="w-36 text-right font-mono font-semibold border border-gray-300 rounded-md px-2 py-1 bg-white"
                      />
                    </td>
                    <td className="py-3 px-3 font-medium text-gray-800">{v.status}</td>
                    <td className="py-3 pl-3 text-right whitespace-nowrap space-x-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          directorApproveAction(v.id, 'APPROVE', editAmountMap[v.id] ?? v.amount);
                          toast.success(`Pengajuan ${v.id} di-Approve Direktur & diteruskan ke Keuangan`);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md"
                      >
                        Approve / Edit & Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          directorApproveAction(v.id, 'REJECT');
                          toast.error(`Pengajuan ${v.id} ditolak oleh Direktur`);
                        }}
                        className="px-3 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 font-medium rounded-md"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Purchase Orders > Rp1.000.000 */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-gray-900">
          2. Purchase Order (PO Multi-Material) di Atas Limit Rp1.000.000
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="py-2.5 pr-3">Nomor PO & Supplier</th>
                <th className="py-2.5 px-3">Rincian Item Material</th>
                <th className="py-2.5 px-3 text-right">Grand Total</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 pl-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50">
                  <td className="py-3 pr-3">
                    <div className="font-mono font-bold text-gray-900">{po.id}</div>
                    <div className="text-gray-600">{po.supplierName}</div>
                  </td>
                  <td className="py-3 px-3 text-gray-600">
                    {po.items.map((it) => `${it.materialName} (${it.qty} ${it.unit})`).join(', ')}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 tabular-nums">
                    {formatRupiah(po.grandTotal)}
                  </td>
                  <td className="py-3 px-3 font-medium">{po.status}</td>
                  <td className="py-3 pl-3 text-right whitespace-nowrap space-x-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        approvePurchaseOrder(po.id, 'Approved');
                        toast.success(`PO ${po.id} berhasil di-Approve Direktur`);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md"
                    >
                      Approve PO
                    </button>
                    <button
                      type="button"
                      onClick={() => approvePurchaseOrder(po.id, 'Rejected')}
                      className="px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-100 rounded-md"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Pengajuan Proyek Baru PJT (Lahan, Unit, Fasum/Fasos, Renovasi) */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              3. Pengajuan Proyek Baru PJT (Pembelian Lahan, Unit Baru, Fasum/Fasos &amp; Renovasi)
            </h2>
            <p className="text-xs text-gray-500">
              Otomatis tersinkronisasi dari modul /project/pengajuan-proyek setelah melewati Verifikasi Keuangan
            </p>
          </div>
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-mono font-bold">
            {waitingProjectSubmissions.length} Menunggu Keputusan Direktur
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="py-2.5 pr-3">No Pengajuan &amp; Nama Proyek</th>
                <th className="py-2.5 px-3">Pengaju (PJT) &amp; Jenis</th>
                <th className="py-2.5 px-3 text-right">Total RAB</th>
                <th className="py-2.5 px-3">Status &amp; Catatan</th>
                <th className="py-2.5 pl-3 text-right">Keputusan Direktur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projectSubmissions
                .filter((s) =>
                  tab === 'WAITING'
                    ? s.status === 'Menunggu Approval Direktur'
                    : tab === 'APPROVED'
                    ? s.status === 'Approved'
                    : true
                )
                .map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="py-3 pr-3">
                      <div className="font-mono font-bold text-emerald-700">
                        {sub.submissionNumber} · {sub.companyId}
                      </div>
                      <div className="font-semibold text-gray-900">{sub.projectName}</div>
                      <div className="text-[11px] text-gray-500">{sub.location}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-gray-900">
                        {sub.requester} ({sub.requesterRole})
                      </div>
                      <div className="text-[11px] font-mono text-gray-500">
                        Jenis: {sub.type} · {sub.date}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 tabular-nums">
                      {formatRupiah(sub.rabAmount)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-gray-800">{sub.status}</div>
                      <input
                        type="text"
                        value={projectNotesMap[sub.id] || ''}
                        onChange={(e) =>
                          setProjectNotesMap({ ...projectNotesMap, [sub.id]: e.target.value })
                        }
                        placeholder="Catatan Direktur..."
                        className="mt-1 w-44 border border-gray-300 rounded px-2 py-1 text-[11px] bg-white"
                      />
                    </td>
                    <td className="py-3 pl-3 text-right whitespace-nowrap space-x-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          approveProjectSubmissionByDirector(
                            sub.id,
                            'APPROVE',
                            projectNotesMap[sub.id] || 'Disetujui Direktur Utama.'
                          );
                          toast.success(
                            `Proyek ${sub.submissionNumber} berhasil di-Approve Direktur & notifikasi dikirim ke Keuangan & PJT`
                          );
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md cursor-pointer"
                      >
                        Approve Proyek
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          approveProjectSubmissionByDirector(
                            sub.id,
                            'REJECT',
                            projectNotesMap[sub.id] || 'Ditolak Direktur untuk dievaluasi ulang.'
                          );
                          toast.error(`Proyek ${sub.submissionNumber} ditolak Direktur`);
                        }}
                        className="px-3 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 font-medium rounded-md cursor-pointer"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. PROJECT PROGRESS (UNIT 11 ITEM, FASUM 16, FASOS 4, LAHAN 5, RAB vs REALISASI)
// ==========================================
export const ProjectComprehensivePage: React.FC = () => {
  const {
    kavling,
    fasumList,
    fasosList,
    lahanList,
    updateKavlingStatusAndProgress,
    createVerificationSubmission,
    currentUser,
  } = useAppStore();

  const getInitialProjectTab = (): 'UNIT' | 'FASUM' | 'FASOS' | 'LAHAN' | 'RAB_REALISASI' | 'DOC_PRINT' => {
    const p = window.location.pathname;
    if (p.includes('/project/lahan')) return 'LAHAN';
    if (p.includes('/project/rab') || p.includes('/project/pengajuan-bahan')) return 'RAB_REALISASI';
    if (p.includes('/project/spk') || p.includes('/project/master-tukang')) return 'DOC_PRINT';
    if (p.includes('/project/fasum')) return 'FASUM';
    return 'UNIT';
  };

  const [subTab, setSubTab] = useState<'UNIT' | 'FASUM' | 'FASOS' | 'LAHAN' | 'RAB_REALISASI' | 'DOC_PRINT'>(getInitialProjectTab);

  React.useEffect(() => {
    const p = window.location.pathname;
    if (p.includes('/project/lahan')) setSubTab('LAHAN');
    else if (p.includes('/project/rab') || p.includes('/project/pengajuan-bahan')) setSubTab('RAB_REALISASI');
    else if (p.includes('/project/spk') || p.includes('/project/master-tukang')) setSubTab('DOC_PRINT');
    else if (p.includes('/project/fasum')) setSubTab('FASUM');
    else if (p.includes('/project/progress') || p.includes('/project/penyelesaian-unit')) setSubTab('UNIT');
  }, [window.location.pathname]);

  const [selectedKavlingId, setSelectedKavlingId] = useState(kavling[0]?.id || 'TBL-A-01');
  const [checkedItems, setCheckedItems] = useState<string[]>([
    'chk-1',
    'chk-2',
    'chk-3',
    'chk-4',
    'chk-5',
    'chk-6',
    'chk-7',
  ]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [rabTitle, setRabTitle] = useState('');
  const [rabAmount, setRabAmount] = useState(67651710);

  const isPjtReadOnly = currentUser?.role === 'PJT';
  const activeLot = kavling.find((k) => k.id === selectedKavlingId) || kavling[0];

  const calculatedProgress = UNIT_PROGRESS_CHECKLIST_ITEMS.reduce(
    (acc, item) => (checkedItems.includes(item.id) ? acc + item.weight : acc),
    0
  );

  const toggleChecklist = (id: string) => {
    if (isPjtReadOnly) {
      toast.error('Role PJT bersifat Read-Only terhadap input progress. Gunakan menu Verifikasi PJT.');
      return;
    }
    setCheckedItems((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSaveUnitProgress = () => {
    if (isPjtReadOnly) return;
    updateKavlingStatusAndProgress(
      activeLot.id,
      activeLot.status,
      calculatedProgress,
      `Update 11 checklist konstruksi (${calculatedProgress}%)`
    );
    toast.success(
      `Progress Kavling ${activeLot.code} (${calculatedProgress}%) disimpan & notifikasi milestone 25/50/75/100% dikirim ke PJT.`
    );
  };

  const handleCreateRab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rabTitle.trim()) return;
    createVerificationSubmission({
      type: 'RAB',
      title: rabTitle,
      companyId: 'PT_TBL',
      kavlingOrArea: 'Proyek Perumahan Bahagia Land',
      requester: currentUser?.name || 'Pengawas Lapangan',
      amount: rabAmount,
      volumeSpec: 'Standar HPP Rp67.651.710/unit · Tipe 36/91 (7×13m)',
      technicalNotes: 'Menunggu verifikasi spesifikasi & kewajaran harga oleh PJT.',
    });
    setRabTitle('');
    toast.success('Pengajuan RAB baru berhasil dikirim ke PJT untuk diverifikasi sebelum ke Direktur.');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Manajemen Konstruksi Proyek, RAB vs Realisasi & Progress 0–100%
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            HPP Standar: Rp67.651.710/unit · Mencakup 11 Checklist Unit, 16 Jenis Fasum, 4 Fasos, dan 5 Tahap Pematangan Lahan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-gray-100 rounded-lg text-xs font-medium">
          {[
            { id: 'UNIT', label: '1. Progress Unit (11 Item)' },
            { id: 'FASUM', label: '2. Fasum (16 Jenis)' },
            { id: 'FASOS', label: '3. Fasos (4 Jenis)' },
            { id: 'LAHAN', label: '4. Lahan (5 Tahap)' },
            { id: 'RAB_REALISASI', label: '5. RAB vs Realisasi' },
            { id: 'DOC_PRINT', label: '6. SPK / BAST / QR' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id as any)}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
                subTab === t.id ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUPER ADMIN 5-BUTTON CRUD TOOLBAR FOR UNITS & WORK PROGRESS */}
      <SuperAdminCrudBar
        collectionKey={subTab === 'UNIT' ? 'units_kavling' : 'work_progress'}
        collectionLabel={
          subTab === 'UNIT'
            ? `Units & Kavling Konstruksi (${kavling.length} Unit)`
            : 'Work Progress Fasum, Fasos & Lahan'
        }
        itemCount={subTab === 'UNIT' ? kavling.length : fasumList.length}
        sampleAdjustTarget={{
          id: activeLot?.id || 'TBL-A-01',
          label: `Progress Kavling ${activeLot?.code || 'A-01'}`,
          currentValue: activeLot?.progress || 45,
          unitLabel: '%',
        }}
      />

      {subTab === 'UNIT' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  Checklist 11 Tahap Pekerjaan Unit Rumah (0–100%)
                </h2>
                <p className="text-xs text-gray-500">
                  {isPjtReadOnly
                    ? 'Mode PJT: Read-Only (Tidak dapat mengubah checklist secara langsung)'
                    : 'Mode Pengawas: Centang bobot pekerjaan selesai & unggah foto lapangan'}
                </p>
              </div>
              <select
                value={selectedKavlingId}
                onChange={(e) => setSelectedKavlingId(e.target.value)}
                className="text-xs border border-gray-300 rounded-lg px-3 py-2 font-mono bg-white"
              >
                {kavling.slice(0, 40).map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.id} ({k.progress}%)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              {UNIT_PROGRESS_CHECKLIST_ITEMS.map((item) => {
                const checked = checkedItems.includes(item.id);
                return (
                  <label
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className={`p-3 border rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors ${
                      checked ? 'bg-emerald-50/50 border-emerald-300' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={checked}
                        readOnly
                        className="accent-emerald-600 w-4 h-4"
                      />
                      <span className="font-medium text-gray-900">{item.name}</span>
                    </div>
                    <span className="font-mono font-semibold text-gray-600 tabular-nums">
                      Bobot {item.weight}%
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-gray-200 rounded-xl p-6 space-y-5">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Total Akumulasi Progress Kavling {activeLot.code}</span>
                <span className="font-mono text-lg font-bold text-emerald-700 tabular-nums">
                  {calculatedProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full transition-all" style={{ width: `${calculatedProgress}%` }} />
              </div>
              <div className="text-[11px] text-gray-500">
                Notifikasi otomatis terkirim pada milestone 25%, 50%, 75%, dan 100% ke PJT & Direktur.
              </div>
            </div>

            <UnitLiveCameraCapture unit={activeLot} />

            <UploadFoto
              photos={photos}
              onChange={setPhotos}
              label="Foto Dokumentasi Progress Fisik Unit (Wajib untuk Verifikasi PJT)"
            />

            {!isPjtReadOnly && (
              <button
                type="button"
                onClick={handleSaveUnitProgress}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg"
              >
                Simpan Progress ({calculatedProgress}%) & Ajukan Verifikasi PJT
              </button>
            )}
          </div>
        </div>
      )}

      {subTab === 'FASUM' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-gray-900">
              Progress 16 Jenis Fasilitas Umum (Fasum) Kawasan Perumahan
            </h2>
            <ExportActionButtons
              title="Laporan Progress 16 Jenis Fasilitas Umum (Fasum)"
              filename="Laporan_Progress_Fasum"
              headers={['Nama Fasum', 'Volume', 'Progress (%)', 'Anggaran RAB', 'Realisasi', 'Status PJT']}
              data={fasumList.map((f) => ({
                'Nama Fasum': f.name,
                Volume: `${f.volume} ${f.unit}`,
                'Progress (%)': `${f.progress}%`,
                'Anggaran RAB': f.budget,
                Realisasi: f.realized,
                'Status PJT': f.status,
              }))}
              rows={fasumList.map((f) => [
                f.name,
                `${f.volume} ${f.unit}`,
                `${f.progress}%`,
                formatRupiah(f.budget),
                formatRupiah(f.realized),
                f.status,
              ])}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="py-2.5 pr-3">Nama Fasilitas Umum (16 Jenis)</th>
                  <th className="py-2.5 px-3">Volume</th>
                  <th className="py-2.5 px-3">Progress (0-100%)</th>
                  <th className="py-2.5 px-3 text-right">Anggaran RAB</th>
                  <th className="py-2.5 px-3 text-right">Realisasi</th>
                  <th className="py-2.5 pl-3 text-right">Status PJT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fasumList.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="py-2.5 pr-3 font-semibold text-gray-900">{f.name}</td>
                    <td className="py-2.5 px-3 font-mono tabular-nums">
                      {f.volume} {f.unit}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full" style={{ width: `${f.progress}%` }} />
                        </div>
                        <span className="font-mono font-semibold tabular-nums">{f.progress}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">{formatRupiah(f.budget)}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">{formatRupiah(f.realized)}</td>
                    <td className="py-2.5 pl-3 text-right font-medium text-emerald-700">{f.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'FASOS' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900">
            Progress 4 Fasilitas Sosial (Sekolah PAUD, Posyandu/Puskesmas, Balai Warga, Pasar Lingkungan)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fasosList.map((fs) => (
              <div key={fs.id} className="p-4 border border-gray-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 text-sm">{fs.name}</span>
                  <span className="font-mono font-bold text-emerald-700">{fs.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full" style={{ width: `${fs.progress}%` }} />
                </div>
                <div className="flex justify-between text-gray-500 pt-1">
                  <span>RAB: {formatRupiah(fs.budget)}</span>
                  <span>Realisasi: {formatRupiah(fs.realized)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'LAHAN' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900">
            Progress 5 Tahap Pematangan Lahan (Pembersihan, Penimbunan, Jalan Akses, Drainase, Penanaman)
          </h2>
          <div className="space-y-3">
            {lahanList.map((lh) => (
              <div key={lh.id} className="p-4 border border-gray-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-gray-900">{lh.name}</div>
                  <div className="text-gray-500">
                    Volume: {lh.volume} {lh.unit} · RAB: {formatRupiah(lh.budget)} · Realisasi: {formatRupiah(lh.realized)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-emerald-700 text-sm">{lh.progress}%</span>
                  <span className="text-gray-600">{lh.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'RAB_REALISASI' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-gray-900">
              Evaluasi RAB vs Realisasi HPP Per Unit Rumah Subsidi (Standar Rp67.651.710 / Unit)
            </h2>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="py-2 pr-2">Komponen Pekerjaan</th>
                  <th className="py-2 px-2 text-right">Anggaran RAB</th>
                  <th className="py-2 px-2 text-right">Realisasi</th>
                  <th className="py-2 pl-2 text-right">Selisih Efisiensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono">
                <tr>
                  <td className="py-2.5 pr-2 font-sans font-medium">1. Pekerjaan Pondasi & Sloof Beton</td>
                  <td className="py-2.5 px-2 text-right">Rp14.200.000</td>
                  <td className="py-2.5 px-2 text-right">Rp13.950.000</td>
                  <td className="py-2.5 pl-2 text-right text-emerald-700">+Rp250.000</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-2 font-sans font-medium">2. Dinding Bata, Plesteran & Acian</td>
                  <td className="py-2.5 px-2 text-right">Rp16.850.000</td>
                  <td className="py-2.5 px-2 text-right">Rp16.700.000</td>
                  <td className="py-2.5 pl-2 text-right text-emerald-700">+Rp150.000</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-2 font-sans font-medium">3. Rangka Baja Ringan, Atap & Plafon 4m</td>
                  <td className="py-2.5 px-2 text-right">Rp15.400.000</td>
                  <td className="py-2.5 px-2 text-right">Rp15.210.000</td>
                  <td className="py-2.5 pl-2 text-right text-emerald-700">+Rp190.000</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-2 font-sans font-medium">4. Lantai Keramik, Kusen, Listrik & Finishing</td>
                  <td className="py-2.5 px-2 text-right">Rp21.201.710</td>
                  <td className="py-2.5 px-2 text-right">Rp20.990.000</td>
                  <td className="py-2.5 pl-2 text-right text-emerald-700">+Rp211.710</td>
                </tr>
                <tr className="font-bold bg-gray-50">
                  <td className="py-2.5 pr-2 font-sans">TOTAL HPP KONSTRUKSI / UNIT</td>
                  <td className="py-2.5 px-2 text-right">Rp67.651.710</td>
                  <td className="py-2.5 px-2 text-right">Rp66.850.000</td>
                  <td className="py-2.5 pl-2 text-right text-emerald-700">+Rp801.710</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="lg:col-span-5 bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-gray-900">Buat Pengajuan Proyek / RAB Baru (Ke PJT)</h2>
            <form onSubmit={handleCreateRab} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-700 font-medium block mb-1">Judul RAB / Pekerjaan Konstruksi *</label>
                <input
                  type="text"
                  required
                  value={rabTitle}
                  onChange={(e) => setRabTitle(e.target.value)}
                  placeholder="Contoh: RAB Pembangunan 5 Unit Blok D Bahagia Land"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="text-gray-700 font-medium block mb-1">Total Nilai RAB (Rp)</label>
                <input
                  type="number"
                  value={rabAmount}
                  onChange={(e) => setRabAmount(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg"
              >
                Submit RAB ke Meja Verifikasi PJT
              </button>
            </form>
          </div>
        </div>
      )}

      {subTab === 'DOC_PRINT' && <OfficialDocumentCenter docType="BAST" />}
    </div>
  );
};
