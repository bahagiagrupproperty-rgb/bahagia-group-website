import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { formatRupiah, ROLE_WORKFLOWS, SEED_USERS } from '../data/seedData';
import { db, collection, getDocs, query, where } from '../lib/firebase';
import { ExportActionButtons } from '../utils/exportUtils';
import {
  ArrowRight,
  FileText,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Rocket,
  Loader2,
  Database,
  Bell,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

// ==========================================
// 1. DASHBOARD EKSEKUTIF (/dashboard)
//    SEMUA ANGKA DINAMIS (FIRESTORE + REACTIVE STORE) — TANPA HARDCODE
// ==========================================
interface DashboardStatsState {
  unitTersedia: number;
  unitTerjual: number;
  totalUnits: number;
  pendapatan: number;
  piutang: number;
  monthsLabels: string[];
  cashFlowIn: number[];
  cashFlowOut: number[];
  salesMonthlyUnits: number[];
}

export const SimpleDashboardPage: React.FC = () => {
  const {
    kavling,
    bookings,
    cashTransactions,
    coa,
    verifications,
    projectSubmissions,
    purchaseOrders,
    approvalNotifications,
    markApprovalNotificationRead,
    markAllApprovalNotificationsReadForRole,
    activityLogs,
    selectedCompanyFilter,
    lastResetTimestamp,
    currentUser,
  } = useAppStore();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<DashboardStatsState>({
    unitTersedia: 0,
    unitTerjual: 0,
    totalUnits: 0,
    pendapatan: 0,
    piutang: 0,
    monthsLabels: ['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt'],
    cashFlowIn: [0, 0, 0, 0, 0, 0],
    cashFlowOut: [0, 0, 0, 0, 0, 0],
    salesMonthlyUnits: [0, 0, 0, 0, 0, 0],
  });

  const fetchStatsFromFirestoreAndSync = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Query Firestore collections ("units", "kas_masuk", "kas_keluar", "accounts", "bookings")
      let fsUnitsTersedia = 0;
      let fsUnitsTerjual = 0;
      let fsPendapatan = 0;
      let fsPiutang = 0;
      let hasFirestoreCustomDocs = false;

      try {
        // A. Unit Tersedia dari Firestore collection "units"
        const q1 = query(collection(db, 'units'), where('status', '==', 'tersedia'));
        const snap1 = await getDocs(q1);
        if (!snap1.empty) {
          hasFirestoreCustomDocs = true;
          fsUnitsTersedia = snap1.size;
        }

        // B. Unit Terjual dari Firestore collection "units"
        const q2 = query(collection(db, 'units'), where('status', '==', 'terjual'));
        const snap2 = await getDocs(q2);
        if (!snap2.empty) {
          hasFirestoreCustomDocs = true;
          fsUnitsTerjual = snap2.size;
        }

        // C. Pendapatan dari Firestore collection "kas_masuk" (kategori == "Penjualan Unit")
        const q3 = query(collection(db, 'kas_masuk'), where('kategori', '==', 'Penjualan Unit'));
        const snap3 = await getDocs(q3);
        if (!snap3.empty) {
          hasFirestoreCustomDocs = true;
          snap3.forEach((d) => {
            fsPendapatan += Number(d.data().nominal || d.data().amount || 0);
          });
        }

        // D. Total Piutang dari Firestore collection "accounts" (COA 1-2000 s/d 1-2999)
        const q4 = query(
          collection(db, 'accounts'),
          where('kode', '>=', '1-2000'),
          where('kode', '<', '1-3000')
        );
        const snap4 = await getDocs(q4);
        if (!snap4.empty) {
          hasFirestoreCustomDocs = true;
          snap4.forEach((d) => {
            fsPiutang += Number(d.data().saldo || d.data().balance || 0);
          });
        }
      } catch {
        // Jika koleksi belum di-provision di Firestore atau dibatasi rules, lanjutkan baca state sinkronisasi
      }

      // 2. Hitung dari data aktif aplikasi (yang otomatis kosong = 0 setelah di-reset di /sistem/reset-data)
      const filteredLots = kavling.filter((k) =>
        selectedCompanyFilter === 'ALL' ? true : k.companyId === selectedCompanyFilter
      );
      const filteredCashTx = cashTransactions.filter((tx) =>
        selectedCompanyFilter === 'ALL' ? true : tx.companyId === selectedCompanyFilter
      );
      const filteredBookings = bookings.filter((b) =>
        selectedCompanyFilter === 'ALL' ? true : b.companyId === selectedCompanyFilter
      );

      // A. Unit Tersedia
      const calcUnitTersedia = hasFirestoreCustomDocs
        ? fsUnitsTersedia
        : filteredLots.filter((k) => k.status.toLowerCase() === 'tersedia').length;

      // B. Unit Terjual & Akad
      const calcUnitTerjual = hasFirestoreCustomDocs
        ? fsUnitsTerjual
        : filteredLots.filter(
            (k) => k.status.toLowerCase() === 'terjual' || k.status.toLowerCase() === 'akad'
          ).length;

      // C. Pendapatan Penjualan (Sum dari kas_masuk dengan kategori/sumber Penjualan Unit)
      const calcPendapatan = hasFirestoreCustomDocs
        ? fsPendapatan
        : filteredCashTx
            .filter(
              (tx) =>
                tx.type === 'KAS_MASUK' &&
                (tx.sourceOrPurpose.toLowerCase().includes('penjualan unit') ||
                  tx.category.toLowerCase().includes('penjualan unit') ||
                  tx.category.toLowerCase().includes('kpr'))
            )
            .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

      // D. Total Piutang (Sum dari accounts / COA 1-2000 s/d 1-2999, hanya dihitung jika tidak baru di-reset)
      const piutangAccounts = coa.filter(
        (c) => c.code >= '1-2000' && c.code < '1-3000' && c.code !== '1-2000' && c.active !== false
      );
      const calcPiutang = hasFirestoreCustomDocs
        ? fsPiutang
        : filteredCashTx.length === 0 && filteredLots.length === 0 && filteredBookings.length === 0
        ? 0
        : piutangAccounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);

      // E. Cash Flow 6 Bulan (Mei - Okt 2026) dari kas_masuk dan kas_keluar
      const monthConfigs = [
        { label: 'Mei', ym: '2026-05' },
        { label: 'Jun', ym: '2026-06' },
        { label: 'Jul', ym: '2026-07' },
        { label: 'Agu', ym: '2026-08' },
        { label: 'Sep', ym: '2026-09' },
        { label: 'Okt', ym: '2026-10' },
      ];

      const computedCashIn = monthConfigs.map(({ ym }) => {
        const totalRp = filteredCashTx
          .filter((tx) => tx.type === 'KAS_MASUK' && tx.date.startsWith(ym))
          .reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);
        return Math.round(totalRp / 1000000); // dalam Juta Rp
      });

      const computedCashOut = monthConfigs.map(({ ym }) => {
        const totalRp = filteredCashTx
          .filter((tx) => tx.type === 'KAS_KELUAR' && tx.date.startsWith(ym))
          .reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);
        return Math.round(totalRp / 1000000); // dalam Juta Rp
      });

      // F. Penjualan per Bulan dari bookings dengan stage/status == "Akad" atau "Selesai"
      const computedMonthlySales = monthConfigs.map(({ ym }) => {
        return filteredBookings.filter(
          (b) =>
            (b.stage.toLowerCase() === 'akad' || b.stage.toLowerCase() === 'selesai') &&
            b.createdAt.startsWith(ym)
        ).length;
      });

      setStats({
        unitTersedia: calcUnitTersedia,
        unitTerjual: calcUnitTerjual,
        totalUnits: filteredLots.length,
        pendapatan: calcPendapatan,
        piutang: calcPiutang,
        monthsLabels: monthConfigs.map((m) => m.label),
        cashFlowIn: computedCashIn,
        cashFlowOut: computedCashOut,
        salesMonthlyUnits: computedMonthlySales,
      });
    } finally {
      setIsLoading(false);
    }
  }, [kavling, bookings, cashTransactions, coa, selectedCompanyFilter, lastResetTimestamp]);

  useEffect(() => {
    fetchStatsFromFirestoreAndSync();
  }, [fetchStatsFromFirestoreAndSync]);

  // Menunggu Approval gabungan (Verifikasi PJT + Pengajuan Proyek PJT + PO Material)
  const combinedPendingApprovals = [
    ...projectSubmissions
      .filter(
        (sub) =>
          (selectedCompanyFilter === 'ALL' || sub.companyId === selectedCompanyFilter) &&
          (sub.status === 'Menunggu Verifikasi Keuangan' || sub.status === 'Menunggu Approval Direktur')
      )
      .map((sub) => ({
        id: sub.id,
        title: `${sub.submissionNumber} — ${sub.projectName}`,
        type: `Proyek ${sub.type}`,
        companyId: sub.companyId,
        requester: `${sub.requester} (${sub.requesterRole})`,
        amount: sub.rabAmount,
        status: sub.status,
        targetRole: sub.status === 'Menunggu Verifikasi Keuangan' ? 'KEUANGAN' : 'DIREKTUR',
        actionPath: '/project/pengajuan-proyek',
      })),
    ...verifications
      .filter(
        (v) =>
          (selectedCompanyFilter === 'ALL' || v.companyId === selectedCompanyFilter) &&
          (v.status === 'Menunggu Verifikasi PJT' || v.status === 'Menunggu Approval Direktur')
      )
      .map((v) => ({
        id: v.id,
        title: v.title,
        type: v.type,
        companyId: v.companyId,
        requester: v.requester,
        amount: v.amount,
        status: v.status,
        targetRole: v.status === 'Menunggu Verifikasi PJT' ? 'PJT' : 'DIREKTUR',
        actionPath: v.status === 'Menunggu Verifikasi PJT' ? '/project/verifikasi' : '/approval',
      })),
    ...purchaseOrders
      .filter(
        (po) =>
          (selectedCompanyFilter === 'ALL' || po.companyId === selectedCompanyFilter) &&
          po.status === 'Menunggu Approval Direktur'
      )
      .map((po) => ({
        id: po.id,
        title: `PO Material — ${po.supplierName}`,
        type: 'Purchase Order',
        companyId: po.companyId,
        requester: po.createdBy,
        amount: po.grandTotal,
        status: po.status,
        targetRole: 'DIREKTUR',
        actionPath: '/approval',
      })),
  ].slice(0, 6);

  const activeUserRole = currentUser?.role || 'ADMIN';
  const roleApprovalAlerts = approvalNotifications.filter((n) => {
    const companyMatch =
      selectedCompanyFilter === 'ALL' ||
      n.companyId === 'GROUP' ||
      n.companyId === selectedCompanyFilter;
    if (!companyMatch) return false;
    if (activeUserRole === 'ADMIN') return true;
    return n.targetRole === activeUserRole || n.targetRole === 'ALL';
  });

  const unreadRoleAlerts = roleApprovalAlerts.filter((n) => !n.isRead);

  const recentLogs = activityLogs.slice(0, 5);

  // Data untuk Export Excel / PDF / CSV / Print pada halaman Dashboard
  const dashboardExportData = [
    {
      Indikator_KPI: 'Unit Tersedia',
      Nilai: `${stats.unitTersedia} Unit`,
      Sumber_Koleksi: 'units (status == tersedia)',
      Filter_PT: selectedCompanyFilter,
    },
    {
      Indikator_KPI: 'Unit Terjual & Akad',
      Nilai: `${stats.unitTerjual} Unit`,
      Sumber_Koleksi: 'units (status == terjual)',
      Filter_PT: selectedCompanyFilter,
    },
    {
      Indikator_KPI: 'Pendapatan Penjualan',
      Nilai: formatRupiah(stats.pendapatan),
      Sumber_Koleksi: 'kas_masuk (kategori == Penjualan Unit)',
      Filter_PT: selectedCompanyFilter,
    },
    {
      Indikator_KPI: 'Total Piutang (COA 1-2000)',
      Nilai: formatRupiah(stats.piutang),
      Sumber_Koleksi: 'accounts (kode 1-2000 s/d 1-2999)',
      Filter_PT: selectedCompanyFilter,
    },
    ...stats.monthsLabels.map((m, idx) => ({
      Indikator_KPI: `Arus Kas & Akad Bulan ${m} 2026`,
      Nilai: `Kas Masuk: Rp ${stats.cashFlowIn[idx]} Jt | Kas Keluar: Rp ${stats.cashFlowOut[idx]} Jt | Akad: ${stats.salesMonthlyUnits[idx]} Unit`,
      Sumber_Koleksi: 'kas_masuk, kas_keluar, bookings',
      Filter_PT: selectedCompanyFilter,
    })),
  ];

  // Hitung koordinat SVG Cash Flow secara dinamis (jika 0 semua -> garis rata di 0 pada y=135)
  const maxCashFlowVal = Math.max(10, ...stats.cashFlowIn, ...stats.cashFlowOut);
  const getYCoord = (valJuta: number) => {
    if (valJuta <= 0) return 135; // Garis rata di 0
    const ratio = Math.min(1, valJuta / maxCashFlowVal);
    return Math.round(135 - ratio * 105);
  };

  const cashInPoints = stats.cashFlowIn
    .map((val, idx) => `${20 + idx * 90},${getYCoord(val)}`)
    .join(' ');
  const cashOutPoints = stats.cashFlowOut
    .map((val, idx) => `${20 + idx * 90},${getYCoord(val)}`)
    .join(' ');

  const maxSalesUnit = Math.max(10, ...stats.salesMonthlyUnits);
  const isCashFlowEmpty = stats.cashFlowIn.every((v) => v === 0) && stats.cashFlowOut.every((v) => v === 0);
  const isSalesEmpty = stats.salesMonthlyUnits.every((v) => v === 0);

  return (
    <div className="space-y-6">
      {/* Header + Refresh + Export + Deploy */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl p-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-700">
            <Database className="w-3.5 h-3.5" />
            <span>REAL-TIME FIRESTORE SYNC · TANPA DATA HARDCODE</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-0.5">
            Dashboard Eksekutif Bahagia Group Property
          </h1>
          <p className="text-xs text-gray-500">
            Semua KPI, Grafik & Tabel dihitung langsung dari koleksi database aktif ({selectedCompanyFilter})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              fetchStatsFromFirestoreAndSync();
              toast.success('🔄 Data Dashboard berhasil di-refresh dari Firestore!');
            }}
            className="px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Refresh Data</span>
          </button>

          <ExportActionButtons
            title="LAPORAN RINGKASAN DASHBOARD EKSEKUTIF BAHAGIA GROUP PROPERTY"
            filename="Laporan_Dashboard_Eksekutif"
            subtitle={`Filter Entitas: ${selectedCompanyFilter}`}
            printedBy={currentUser?.name || 'Admin'}
            summaryText={`Unit Tersedia: ${stats.unitTersedia} Unit | Unit Terjual: ${stats.unitTerjual} Unit | Pendapatan: ${formatRupiah(stats.pendapatan)} | Piutang: ${formatRupiah(stats.piutang)}`}
            data={dashboardExportData}
            compact
          />

          {currentUser?.role === 'ADMIN' && (
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.origin);
                toast.success('🚀 Link Live Aplikasi berhasil disalin ke Clipboard untuk Presentasi / Deploy!');
              }}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>🚀 Deploy</span>
            </button>
          )}
        </div>
      </div>

      {/* REAL-TIME FIRESTORE ALERT NOTIFIKASI PENGAJUAN & APPROVAL (UNTUK KEUANGAN, DIREKTUR, PJT & ADMIN) */}
      <div className="bg-white border-2 border-amber-300 rounded-xl p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-gray-900">
                  Alert Notifikasi Pengajuan & Approval (Firestore Real-Time)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-600 text-white">
                  {unreadRoleAlerts.length} Belum Dibaca
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Menampilkan alert otomatis setiap ada pengajuan proyek PJT, RAB, Opname, atau PO yang membutuhkan verifikasi/persetujuan role{' '}
                <strong className="text-emerald-700">{activeUserRole}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadRoleAlerts.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  markAllApprovalNotificationsReadForRole(activeUserRole);
                  toast.success(`Semua alert notifikasi untuk role ${activeUserRole} ditandai sudah dibaca.`);
                }}
                className="px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tandai Semua Dibaca</span>
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                navigate(
                  activeUserRole === 'KEUANGAN'
                    ? '/project/pengajuan-proyek'
                    : activeUserRole === 'PJT'
                    ? '/project/verifikasi'
                    : '/approval'
                )
              }
              className="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <span>Buka Meja Approval</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {roleApprovalAlerts.length === 0 ? (
          <div className="py-4 text-center text-xs text-gray-400 italic">
            Tidak ada pengajuan baru yang menunggu persetujuan untuk role {activeUserRole}.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {roleApprovalAlerts.slice(0, 6).map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  markApprovalNotificationRead(notif.id);
                  navigate(notif.actionPath || '/approval');
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  notif.isRead
                    ? 'bg-gray-50/70 border-gray-200 hover:border-gray-300'
                    : 'bg-amber-50/60 border-amber-300 hover:bg-amber-50 shadow-2xs'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        notif.targetRole === 'DIREKTUR'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : notif.targetRole === 'KEUANGAN'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      TARGET: {notif.targetRole}
                    </span>
                    <span className="text-[10px] font-mono text-gray-500">
                      {notif.companyId} · {notif.createdAt}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-gray-900 flex items-start justify-between gap-1.5">
                    <span>{notif.title}</span>
                    {!notif.isRead && (
                      <span className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-mono font-bold rounded shrink-0">
                        BARU
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-gray-600 line-clamp-2">{notif.message}</p>
                </div>

                <div className="pt-2 border-t border-gray-200/70 flex items-center justify-between text-[11px]">
                  <span className="font-mono font-bold text-emerald-700">
                    {notif.amount > 0 ? formatRupiah(notif.amount) : notif.status}
                  </span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    Tindak Lanjuti <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LOADING STATE SKELETON */}
      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="w-7 h-7 text-emerald-600 animate-spin" />
          <div className="text-sm font-bold text-gray-800">Loading data dari Firestore...</div>
          <p className="text-xs text-gray-500">
            Menghitung Unit Tersedia, Unit Terjual, Kas Masuk, Saldo COA Piutang (1-2000), dan Arus Kas...
          </p>
        </div>
      ) : (
        <>
          {/* ROW 1: 4 KPI CARDS (100% DINAMIS, TAMPIL 0 JIKA KOSONG) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-1.5">
              <div className="text-xs font-medium text-gray-500">Unit Tersedia</div>
              <div className="text-2xl font-bold font-mono text-gray-900 tabular-nums">
                {stats.unitTersedia} Unit
              </div>
              <div className="text-xs text-gray-500">
                {stats.totalUnits > 0
                  ? `Dari total ${stats.totalUnits} kavling terdaftar`
                  : 'Belum ada data unit (0 kavling)'}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-1.5">
              <div className="text-xs font-medium text-gray-500">Unit Terjual & Akad</div>
              <div className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
                {stats.unitTerjual} Unit
              </div>
              <div className="text-xs text-gray-500">
                {stats.unitTerjual > 0 ? 'Status Terjual / Akad KPR' : 'Belum ada unit terjual'}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-1.5">
              <div className="text-xs font-medium text-gray-500">Pendapatan Penjualan</div>
              <div className="text-2xl font-bold font-mono text-gray-900 tabular-nums">
                {stats.pendapatan > 0 ? formatRupiah(stats.pendapatan) : 'Rp 0'}
              </div>
              <div className="text-xs text-gray-500">
                {stats.pendapatan > 0
                  ? 'Akumulasi Kas Masuk Penjualan Unit'
                  : 'Belum ada transaksi penjualan'}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-1.5">
              <div className="text-xs font-medium text-gray-500">Total Piutang (COA 1-2000)</div>
              <div className="text-2xl font-bold font-mono text-gray-900 tabular-nums">
                {stats.piutang > 0 ? formatRupiah(stats.piutang) : 'Rp 0'}
              </div>
              <div className="text-xs text-gray-500">
                {stats.piutang > 0
                  ? 'Saldo Akun COA 1-2000 s/d 1-2999'
                  : 'Saldo piutang kosong (Rp 0)'}
              </div>
            </div>
          </div>

          {/* ROW 2: 2 GRAFIK (50-50) — GARIS RATA DI 0 / BAR KOSONG JIKA DATA KOSONG */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Grafik 1: Cash Flow 6 Bulan (Line Chart) */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Cash Flow 6 Bulan (Juta Rupiah)</h2>
                  <p className="text-xs text-gray-500">
                    Dihitung dari koleksi <code className="font-mono">kas_masuk</code> &{' '}
                    <code className="font-mono">kas_keluar</code>
                  </p>
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>

              <div className="pt-2 relative">
                {isCashFlowEmpty && (
                  <div className="mb-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[11px] text-gray-500 text-center">
                    Belum ada data transaksi kas — Grafik menampilkan garis rata di 0
                  </div>
                )}
                <svg viewBox="0 0 500 180" className="w-full h-44 overflow-visible">
                  {/* Grid lines */}
                  {[0, 45, 90, 135].map((y) => (
                    <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="#F3F4F6" strokeWidth="1" />
                  ))}
                  {/* Cash In Polyline (Emerald) */}
                  <polyline
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3"
                    points={cashInPoints}
                  />
                  {/* Cash Out Polyline (Gray) */}
                  <polyline
                    fill="none"
                    stroke="#9CA3AF"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    points={cashOutPoints}
                  />
                  {stats.monthsLabels.map((m, i) => {
                    const x = 20 + i * 90;
                    const yIn = getYCoord(stats.cashFlowIn[i]);
                    return (
                      <g key={m}>
                        <circle cx={x} cy={yIn} r="4" fill="#10B981" />
                        <text
                          x={x}
                          y={yIn - 10}
                          textAnchor="middle"
                          className="text-[10px] fill-gray-700 font-mono"
                        >
                          {stats.cashFlowIn[i]}Jt
                        </text>
                        <text x={x} y={168} textAnchor="middle" className="text-[11px] fill-gray-500">
                          {m}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <div className="flex items-center justify-center gap-6 text-xs text-gray-600 pt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-emerald-500 inline-block" /> Kas Masuk
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-gray-400 inline-block" /> Kas Keluar
                  </span>
                </div>
              </div>
            </div>

            {/* Grafik 2: Penjualan per Bulan (Bar Chart) */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">
                    Penjualan Unit per Bulan (Unit Akad)
                  </h2>
                  <p className="text-xs text-gray-500">
                    Dihitung dari koleksi <code className="font-mono">bookings</code> dengan status{' '}
                    <code className="font-mono">Akad</code>
                  </p>
                </div>
                <BarChart3 className="w-4 h-4 text-emerald-600" />
              </div>

              {isSalesEmpty && (
                <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[11px] text-gray-500 text-center">
                  Belum ada data booking berstatus Akad — Semua bar tampil 0
                </div>
              )}

              <div className="h-44 flex items-end justify-between gap-4 pt-6 px-4 border-b border-gray-100 pb-2">
                {stats.monthsLabels.map((m, idx) => {
                  const val = stats.salesMonthlyUnits[idx];
                  const heightPct = val > 0 ? Math.max(8, Math.round((val / maxSalesUnit) * 100)) : 0;
                  return (
                    <div key={m} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <span className="font-mono text-xs font-bold text-gray-800 tabular-nums">
                        {val}
                      </span>
                      <div
                        className={`w-full max-w-[38px] rounded-t-md transition-all ${
                          val > 0
                            ? 'bg-emerald-500 hover:bg-emerald-600'
                            : 'bg-gray-200 h-[2px]'
                        }`}
                        style={{ height: val > 0 ? `${heightPct}%` : '2px' }}
                      />
                      <span className="text-xs text-gray-500">{m}</span>
                    </div>
                  );
                })}
              </div>
              <div className="text-center text-xs text-gray-500">
                Total Realisasi Akad 6 Bulan:{' '}
                <strong className="text-emerald-700">
                  {stats.salesMonthlyUnits.reduce((a, b) => a + b, 0)} Unit
                </strong>
              </div>
            </div>
          </div>

          {/* ROW 3: 2 TABEL (DENGAN EMPTY STATE "Belum ada data") */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tabel 1: Aktivitas Terbaru (5 baris) */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900">
                  Aktivitas Terbaru (5 Baris Terakhir)
                </h2>
                <Link to="/sistem/log" className="text-xs text-emerald-600 hover:underline font-medium">
                  Audit Log Lengkap
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500">
                      <th className="py-2 pr-2">Pengguna</th>
                      <th className="py-2 px-2">Aktivitas</th>
                      <th className="py-2 pl-2 text-right">Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentLogs.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-gray-400 italic">
                          Belum ada data
                        </td>
                      </tr>
                    ) : (
                      recentLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="py-2.5 pr-2 font-medium text-gray-900 whitespace-nowrap">
                            {log.user} <span className="text-gray-400">· {log.role}</span>
                          </td>
                          <td className="py-2.5 px-2 text-gray-600">{log.action}</td>
                          <td className="py-2.5 pl-2 text-right font-mono text-gray-500 whitespace-nowrap">
                            {log.timestamp}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tabel 2: Menunggu Verifikasi Keuangan, PJT & Approval Direktur */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900">
                  Antrean Menunggu Verifikasi (Keuangan / PJT) & Approval Direktur
                </h2>
                <Link to="/approval" className="text-xs text-emerald-600 hover:underline font-medium">
                  Ke Halaman Approval
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500">
                      <th className="py-2 pr-2">Dokumen / Pengajuan</th>
                      <th className="py-2 px-2 text-right">Nominal</th>
                      <th className="py-2 pl-2 text-right">Role Penyetuju</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {combinedPendingApprovals.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-gray-400 italic">
                          Belum ada data
                        </td>
                      </tr>
                    ) : (
                      combinedPendingApprovals.map((item) => (
                        <tr
                          key={item.id}
                          onClick={() => navigate(item.actionPath)}
                          className="hover:bg-gray-50 cursor-pointer"
                        >
                          <td className="py-2.5 pr-2">
                            <div className="font-medium text-gray-900 truncate max-w-xs">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-gray-500">
                              {item.type} · {item.companyId} · {item.requester}
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono font-semibold text-gray-900 tabular-nums whitespace-nowrap">
                            {item.amount > 0 ? formatRupiah(item.amount) : '-'}
                          </td>
                          <td className="py-2.5 pl-2 text-right whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                item.targetRole === 'DIREKTUR'
                                  ? 'bg-red-100 text-red-700'
                                  : item.targetRole === 'KEUANGAN'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {item.targetRole}
                            </span>
                            <div className="text-[10px] text-gray-500 mt-0.5">{item.status}</div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Tombol "Lihat Laporan Lengkap" di bawah */}
      <div className="flex justify-center pt-2">
        <Link
          to="/laporan"
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-xs transition-colors"
        >
          <FileText className="w-4 h-4" />
          <span>Lihat Laporan Lengkap (~65 Laporan Per Role)</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

// ==========================================
// 2. ALUR KERJA PER ROLE (/beranda-role)
// ==========================================
export const RoleWorkflowHubPage: React.FC = () => {
  const { currentUser, switchQuickRole } = useAppStore();
  const navigate = useNavigate();
  const activeRole = currentUser?.role || 'DIREKTUR';
  const workflow = ROLE_WORKFLOWS[activeRole] || ROLE_WORKFLOWS.DIREKTUR;

  return (
    <div className="space-y-6">
      {/* Header & Role Switcher */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-emerald-700">
            BERANDA ALUR KERJA PER ROLE · {currentUser?.companyName}
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-0.5">{workflow.title}</h1>
          <p className="text-xs text-gray-500 mt-1">{workflow.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 whitespace-nowrap">Simulasi Ganti Role:</span>
          <select
            value={currentUser?.id || SEED_USERS[0].id}
            onChange={(e) => {
              switchQuickRole(e.target.value);
              toast.success('Role aktif berhasil diganti');
            }}
            className="text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white font-medium text-gray-800"
          >
            {SEED_USERS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.role} — {u.companyName} ({u.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Horizontal Flowchart Steps (Clickable) */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">
            Flowchart Alur Kerja Horizontal (Klik Tahapan untuk Membuka Halaman Terkait)
          </h2>
          <span className="text-xs text-gray-500">{workflow.steps.length} Tahapan SOP</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {workflow.steps.map((step, index) => (
            <button
              key={step.label}
              type="button"
              onClick={() => navigate(step.path)}
              className="group p-4 border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/30 rounded-xl text-left transition-all flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-emerald-700 font-mono font-semibold">
                  <span>STEP 0{index + 1}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-sm font-bold text-gray-900">{step.label}</div>
                <p className="text-xs text-gray-500">{step.desc}</p>
              </div>
              <div className="pt-3 mt-3 border-t border-gray-100 text-[11px] font-mono text-gray-400 group-hover:text-emerald-700">
                Buka {step.path}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tugas Hari Ini & Aksi Cepat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900">Tugas Hari Ini ({activeRole})</h2>
          <div className="divide-y divide-gray-100">
            {workflow.todayTasks.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-gray-900">{t.title}</div>
                  <div className="text-[11px] text-gray-500">
                    Prioritas: <strong className="text-emerald-700">{t.priority}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(t.path)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-emerald-600 hover:text-white text-gray-800 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                >
                  Kerjakan
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900">Aksi Cepat Role {activeRole}</h2>
          <div className="space-y-2.5">
            {workflow.quickActions.map((qa) => (
              <button
                key={qa.label}
                type="button"
                onClick={() => navigate(qa.path)}
                className="w-full p-3.5 border border-gray-200 hover:border-emerald-500 rounded-lg flex items-center justify-between text-xs font-semibold text-gray-800 hover:bg-emerald-50/30 transition-colors"
              >
                <span>{qa.label}</span>
                <ArrowRight className="w-4 h-4 text-emerald-600" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ringkasan Semua 8 Role Internal */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-gray-900">
          Matriks Alur Kerja Seluruh Role di Bahagia Group Property
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {Object.entries(ROLE_WORKFLOWS).map(([rCode, wf]) => (
            <div key={rCode} className="p-3.5 bg-gray-50 border border-gray-200 rounded-lg space-y-1">
              <div className="font-bold text-gray-900">
                {rCode} — {wf.title}
              </div>
              <div className="text-gray-600">{wf.subtitle}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
