import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  useAppStore,
  CashTransactionRecord,
  KasMasukSource,
  KasKeluarPurpose,
  JournalEntry,
} from '../store/useAppStore';
import { CoaItem, formatRupiah, terbilangRupiah } from '../data/seedData';
import { SuperAdminCrudBar } from '../components/SuperAdminCrudBar';
import {
  ExportActionButtons,
  exportToExcel,
  exportToPDF,
  exportToCSV,
  printHtmlReport,
} from '../utils/exportUtils';
import {
  Plus,
  Search,
  Download,
  Upload,
  Printer,
  Pencil,
  Trash2,
  Copy,
  Eye,
  ArrowUpDown,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Rocket,
  X,
  RefreshCw,
  FileText,
  ChevronLeft,
} from 'lucide-react';
import { toast } from 'sonner';

const KAS_MASUK_SOURCES: {
  source: KasMasukSource;
  defaultCategory: string;
  defaultCreditCoa: string;
}[] = [
  {
    source: 'Penjualan Unit (Cash/KPR)',
    defaultCategory: 'Pencairan KPR / Cash Keras',
    defaultCreditCoa: '4-1100 Penjualan Rumah Subsidi (Rp169 Jt)',
  },
  {
    source: 'Booking Fee',
    defaultCategory: 'Booking Fee Konsumen',
    defaultCreditCoa: '2-2100 Uang Muka Penjualan Rumah',
  },
  {
    source: 'DP Konsumen',
    defaultCategory: 'Uang Muka (DP) Rumah',
    defaultCreditCoa: '2-2100 Uang Muka Penjualan Rumah',
  },
  {
    source: 'Cicilan Konsumen',
    defaultCategory: 'Angsuran In-House / Bertahap',
    defaultCreditCoa: '1-2200 Piutang User',
  },
  {
    source: 'Retensi',
    defaultCategory: 'Pencairan Dana Retensi Bank',
    defaultCreditCoa: '1-2310 Piutang Retensi - Unit Baru',
  },
  {
    source: 'SBUM',
    defaultCategory: 'Pencairan Subsidi Bantuan Uang Muka',
    defaultCreditCoa: '1-2410 Piutang SBUM - Unit Baru',
  },
  {
    source: 'Pinjaman Bank',
    defaultCategory: 'Pencairan Kredit Konstruksi (KYG)',
    defaultCreditCoa: '2-3100 Utang Bank Jangka Pendek (KYG)',
  },
  {
    source: 'Setoran Modal',
    defaultCategory: 'Setoran Modal Pemegang Saham',
    defaultCreditCoa: '3-1000 Modal Disetor',
  },
  {
    source: 'Lain-lain',
    defaultCategory: 'Pendapatan Lain-lain',
    defaultCreditCoa: '4-2000 Pendapatan Lain-lain',
  },
];

const KAS_KELUAR_PURPOSES: {
  purpose: KasKeluarPurpose;
  defaultCategory: string;
  defaultDebitCoa: string;
}[] = [
  {
    purpose: 'Bayar Supplier',
    defaultCategory: 'Pelunasan Material Konstruksi',
    defaultDebitCoa: '2-1210 Utang Supplier Toko',
  },
  {
    purpose: 'Bayar Tukang/Mandor',
    defaultCategory: 'Upah Borongan Konstruksi',
    defaultDebitCoa: '2-1100 Utang Upah Tukang',
  },
  {
    purpose: 'Bayar Gaji Karyawan',
    defaultCategory: 'Beban SDM & Payroll Bulanan',
    defaultDebitCoa: '5-2100 Beban Gaji Karyawan',
  },
  {
    purpose: 'Bayar Hutang Bank',
    defaultCategory: 'Angsuran Pokok & Bunga Bank',
    defaultDebitCoa: '2-3100 Utang Bank Jangka Pendek (KYG)',
  },
  {
    purpose: 'Bayar Pajak',
    defaultCategory: 'Setoran Pajak PPh Final / PPh 21 / PPN',
    defaultDebitCoa: '2-4100 Utang PPh Final Pasal 4(2) (2.5%)',
  },
  {
    purpose: 'Bayar Operasional',
    defaultCategory: 'Operasional Kantor & Lapangan',
    defaultDebitCoa: '5-2200 Beban Operasional Kantor',
  },
  {
    purpose: 'Bayar Fee Marketing',
    defaultCategory: 'Komisi & Insentif Closing Marketing',
    defaultDebitCoa: '5-2400 Beban Pemasaran & Komisi',
  },
  {
    purpose: 'Bayar Notaris/PPAT',
    defaultCategory: 'Biaya AJB, Balik Nama & Notaris',
    defaultDebitCoa: '5-2300 Beban Administrasi (Notaris, Materai, Akad)',
  },
  {
    purpose: 'Bayar Lahan',
    defaultCategory: 'Akuisisi & Pematangan Lahan',
    defaultDebitCoa: '1-3200 Tanah Dalam Pengembangan',
  },
  {
    purpose: 'Lain-lain',
    defaultCategory: 'Pengeluaran Lain-lain',
    defaultDebitCoa: '5-2900 Beban Lain-lain',
  },
];

// Format input angka menjadi string ribuan (contoh: 50.000.000)
function formatThousandDots(val: number | string): string {
  const digits = String(val).replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('id-ID');
}

function parseThousandDots(val: string): number {
  const digits = val.replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}

export const FinanceModuleComprehensivePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    coa,
    journals,
    cashTransactions,
    suppliers,
    kavling,
    bookings,
    currentUser,
    selectedCompanyFilter,
    saveCashTransaction,
    deleteCashTransaction,
    duplicateCashTransaction,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    saveCoaAccountFull,
    deleteCoaAccount,
    toggleCoaActive,
    bulkImportCoa,
    projectSubmissions,
    verifications,
    approvalNotifications,
    verifyProjectSubmissionByFinance,
    markApprovalNotificationRead,
    markAllApprovalNotificationsReadForRole,
  } = useAppStore();

  const isSuperAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'DIREKTUR';
  const todayStr = new Date().toISOString().slice(0, 10);

  const financeUnreadNotifs = useMemo(
    () =>
      approvalNotifications.filter(
        (n) => (n.targetRole === 'KEUANGAN' || n.targetRole === 'ALL') && !n.isRead
      ),
    [approvalNotifications]
  );

  const financePendingProjectSubs = useMemo(
    () => projectSubmissions.filter((s) => s.status === 'Menunggu Verifikasi Keuangan'),
    [projectSubmissions]
  );

  const financeApprovedReadyForPayout = useMemo(
    () =>
      verifications.filter((v) => v.status === 'Approved Direktur').length +
      projectSubmissions.filter((s) => s.status === 'Approved').length,
    [verifications, projectSubmissions]
  );

  // Sync active tab with URL
  type FinanceTab =
    | 'DASHBOARD'
    | 'KAS_MASUK'
    | 'KAS_KELUAR'
    | 'BUKU_KAS'
    | 'COA'
    | 'JURNAL'
    | 'DETAIL';

  const getTabFromPath = (pathname: string): FinanceTab => {
    if (pathname.includes('/keuangan/transaksi/')) return 'DETAIL';
    if (pathname.includes('/keuangan/dashboard')) return 'DASHBOARD';
    if (pathname.includes('/keuangan/kas-masuk') || pathname.includes('/keuangan/piutang')) return 'KAS_MASUK';
    if (pathname.includes('/keuangan/kas-keluar') || pathname.includes('/keuangan/hutang') || pathname.includes('/keuangan/pengajuan-dana')) return 'KAS_KELUAR';
    if (pathname.includes('/keuangan/buku-kas')) return 'BUKU_KAS';
    if (pathname.includes('/keuangan/jurnal')) return 'JURNAL';
    if (pathname.includes('/keuangan/coa')) return 'COA';
    return 'DASHBOARD';
  };

  const [tab, setTab] = useState<FinanceTab>(() => getTabFromPath(location.pathname));
  const [selectedTxId, setSelectedTxId] = useState<string | null>(() => {
    if (location.pathname.includes('/keuangan/transaksi/')) {
      return decodeURIComponent(location.pathname.split('/keuangan/transaksi/')[1] || '');
    }
    return null;
  });

  useEffect(() => {
    const next = getTabFromPath(location.pathname);
    setTab(next);
    if (location.pathname.includes('/keuangan/transaksi/')) {
      const idPart = decodeURIComponent(location.pathname.split('/keuangan/transaksi/')[1] || '');
      setSelectedTxId(idPart);
    }
  }, [location.pathname]);

  const switchFinanceTab = (nextTab: FinanceTab, path: string) => {
    setTab(nextTab);
    navigate(path);
  };

  // Active COA options for dropdowns (exclude non-active accounts)
  const activeCoaList = useMemo(
    () => coa.filter((c) => c.active !== false),
    [coa]
  );

  const cashBankCoaOptions = useMemo(
    () =>
      activeCoaList
        .filter((c) => c.code.startsWith('1-11') || c.code.startsWith('1-12'))
        .map((c) => `${c.code} ${c.name}`),
    [activeCoaList]
  );

  const allActiveCoaOptions = useMemo(
    () => activeCoaList.map((c) => `${c.code} ${c.name}`),
    [activeCoaList]
  );

  // =========================================================
  // STATE: MODAL INPUT / EDIT KAS MASUK & KAS KELUAR
  // =========================================================
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState<'KAS_MASUK' | 'KAS_KELUAR'>('KAS_MASUK');
  const [editingTxId, setEditingTxId] = useState<string | undefined>(undefined);
  const [txDate, setTxDate] = useState('2026-10-09');
  const [txCompanyId, setTxCompanyId] = useState<'PT_TBL' | 'PT_BPP'>('PT_TBL');
  const [txSourceOrPurpose, setTxSourceOrPurpose] = useState<string>('DP Konsumen');
  const [txCategory, setTxCategory] = useState<string>('Uang Muka (DP) Rumah');
  const [txAmountFormatted, setTxAmountFormatted] = useState<string>('50.000.000');
  const [txCashAccount, setTxCashAccount] = useState<string>('1-1110 Kas PT SDP');
  const [txCounterAccount, setTxCounterAccount] = useState<string>(
    '2-2100 Uang Muka Penjualan Rumah'
  );
  const [txDescription, setTxDescription] = useState<string>('');
  const [txConsumerName, setTxConsumerName] = useState<string>('');
  const [txUnitCode, setTxUnitCode] = useState<string>('');
  const [txSupplierName, setTxSupplierName] = useState<string>('');
  const [txEmployeeName, setTxEmployeeName] = useState<string>('');
  const [txProofFileName, setTxProofFileName] = useState<string>('');
  const [txProofUrl, setTxProofUrl] = useState<string>('');

  const openNewTxModal = (type: 'KAS_MASUK' | 'KAS_KELUAR') => {
    setEditingTxId(undefined);
    setTxModalType(type);
    setTxDate('2026-10-09');
    setTxCompanyId(selectedCompanyFilter === 'PT_BPP' ? 'PT_BPP' : 'PT_TBL');
    setTxCashAccount(cashBankCoaOptions[1] || '1-1110 Kas PT SDP');
    if (type === 'KAS_MASUK') {
      const def = KAS_MASUK_SOURCES[2]; // DP Konsumen
      setTxSourceOrPurpose(def.source);
      setTxCategory(def.defaultCategory);
      setTxCounterAccount(def.defaultCreditCoa);
      setTxAmountFormatted('50.000.000');
    } else {
      const def = KAS_KELUAR_PURPOSES[2]; // Bayar Gaji Karyawan
      setTxSourceOrPurpose(def.purpose);
      setTxCategory(def.defaultCategory);
      setTxCounterAccount(def.defaultDebitCoa);
      setTxAmountFormatted('15.000.000');
    }
    setTxDescription('');
    setTxConsumerName('');
    setTxUnitCode('');
    setTxSupplierName('');
    setTxEmployeeName('');
    setTxProofFileName('');
    setTxProofUrl('');
    setTxModalOpen(true);
  };

  const openEditTxModal = (tx: CashTransactionRecord) => {
    setEditingTxId(tx.id);
    setTxModalType(tx.type);
    setTxDate(tx.date);
    setTxCompanyId(tx.companyId);
    setTxSourceOrPurpose(tx.sourceOrPurpose);
    setTxCategory(tx.category);
    setTxAmountFormatted(formatThousandDots(tx.amount));
    setTxCashAccount(tx.cashAccount);
    setTxCounterAccount(tx.counterAccount);
    setTxDescription(tx.description);
    setTxConsumerName(tx.consumerName || '');
    setTxUnitCode(tx.unitCode || '');
    setTxSupplierName(tx.supplierName || '');
    setTxEmployeeName(tx.employeeName || '');
    setTxProofFileName(tx.proofFileName || '');
    setTxProofUrl(tx.proofUrl || '');
    setTxModalOpen(true);
  };

  const nextAutoTxCode = useMemo(() => {
    if (editingTxId) return editingTxId;
    const prefix = txModalType === 'KAS_MASUK' ? 'KM' : 'KK';
    const count = cashTransactions.filter((t) => t.type === txModalType).length + 1;
    return `${prefix}-2026-10-${String(count).padStart(4, '0')}`;
  }, [editingTxId, txModalType, cashTransactions]);

  const handleSaveTxForm = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseThousandDots(txAmountFormatted);
    if (numericAmount <= 0) {
      toast.error('Nominal harus lebih besar dari Rp 0');
      return;
    }
    if (!txDescription.trim()) {
      toast.error('Keterangan transaksi wajib diisi');
      return;
    }

    saveCashTransaction({
      id: editingTxId,
      type: txModalType,
      date: txDate,
      companyId: txCompanyId,
      sourceOrPurpose: txSourceOrPurpose,
      category: txCategory,
      amount: numericAmount,
      cashAccount: txCashAccount,
      counterAccount: txCounterAccount,
      description: txDescription.trim(),
      consumerName: txConsumerName || undefined,
      unitCode: txUnitCode || undefined,
      supplierName: txSupplierName || undefined,
      employeeName: txEmployeeName || undefined,
      proofFileName: txProofFileName || undefined,
      proofUrl: txProofUrl || undefined,
      createdBy: currentUser?.name || 'Siti Rahmawati, S.E.',
    });

    toast.success(
      txModalType === 'KAS_MASUK'
        ? 'Kas Masuk berhasil disimpan'
        : 'Kas Keluar berhasil disimpan'
    );
    setTxModalOpen(false);
  };

  // =========================================================
  // STATE: KONFIRMASI HAPUS TRANSAKSI
  // =========================================================
  const [deleteTxConfirm, setDeleteTxConfirm] = useState<CashTransactionRecord | null>(null);

  // =========================================================
  // STATE: FILTER, SEARCH, SORT & PAGINATION KAS MASUK & KAS KELUAR
  // =========================================================
  const [txSearch, setTxSearch] = useState('');
  const [txFilterDate, setTxFilterDate] = useState('');
  const [txFilterCategory, setTxFilterCategory] = useState('ALL');
  const [txFilterAccount, setTxFilterAccount] = useState('ALL');
  const [txFilterCompany, setTxFilterCompany] = useState<'ALL' | 'PT_TBL' | 'PT_BPP'>('ALL');
  const [txSortField, setTxSortField] = useState<
    'id' | 'date' | 'sourceOrPurpose' | 'category' | 'amount' | 'cashAccount' | 'counterAccount'
  >('date');
  const [txSortDir, setTxSortDir] = useState<'asc' | 'desc'>('desc');
  const [txPageSize, setTxPageSize] = useState<number>(10);
  const [txPage, setTxPage] = useState<number>(1);

  const toggleSort = (
    field: 'id' | 'date' | 'sourceOrPurpose' | 'category' | 'amount' | 'cashAccount' | 'counterAccount'
  ) => {
    if (txSortField === field) {
      setTxSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setTxSortField(field);
      setTxSortDir('desc');
    }
  };

  const getFilteredAndSortedTxs = (type: 'KAS_MASUK' | 'KAS_KELUAR') => {
    const list = cashTransactions.filter((t) => {
      if (t.type !== type) return false;
      if (txFilterCompany !== 'ALL' && t.companyId !== txFilterCompany) return false;
      if (txFilterDate && t.date !== txFilterDate) return false;
      if (
        txFilterCategory !== 'ALL' &&
        t.sourceOrPurpose !== txFilterCategory &&
        t.category !== txFilterCategory
      )
        return false;
      if (
        txFilterAccount !== 'ALL' &&
        !t.cashAccount.includes(txFilterAccount) &&
        !t.counterAccount.includes(txFilterAccount)
      )
        return false;
      if (txSearch.trim()) {
        const q = txSearch.toLowerCase();
        const matchId = t.id.toLowerCase().includes(q);
        const matchDesc = t.description.toLowerCase().includes(q);
        const matchSrc = t.sourceOrPurpose.toLowerCase().includes(q);
        if (!matchId && !matchDesc && !matchSrc) return false;
      }
      return true;
    });

    return list.sort((a, b) => {
      const dir = txSortDir === 'asc' ? 1 : -1;
      if (txSortField === 'amount') return (a.amount - b.amount) * dir;
      return String(a[txSortField]).localeCompare(String(b[txSortField])) * dir;
    });
  };

  const handleExportTxCsv = (type: 'KAS_MASUK' | 'KAS_KELUAR', formatLabel: 'Excel' | 'CSV' | 'PDF' | 'PRINT') => {
    const rows = getFilteredAndSortedTxs(type);
    const title = type === 'KAS_MASUK' ? 'Laporan Pencatatan Kas Masuk' : 'Laporan Pencatatan Kas Keluar';
    const headers = [
      'No Transaksi',
      'Tanggal',
      'PT',
      type === 'KAS_MASUK' ? 'Sumber' : 'Tujuan',
      'Kategori',
      'Nominal (Rp)',
      type === 'KAS_MASUK' ? 'Akun Kas (Debit)' : 'Akun Kas (Kredit)',
      type === 'KAS_MASUK' ? 'Akun Kredit' : 'Akun Debit',
      'Keterangan',
    ];
    const dataObjs = rows.map((r) => ({
      'No Transaksi': r.id,
      Tanggal: r.date,
      PT: r.companyId,
      [type === 'KAS_MASUK' ? 'Sumber' : 'Tujuan']: r.sourceOrPurpose,
      Kategori: r.category,
      'Nominal (Rp)': r.amount,
      [type === 'KAS_MASUK' ? 'Akun Kas (Debit)' : 'Akun Kas (Kredit)']: r.cashAccount,
      [type === 'KAS_MASUK' ? 'Akun Kredit' : 'Akun Debit']: r.counterAccount,
      Keterangan: r.description,
    }));
    const rowArrays = rows.map((r) => [
      r.id,
      r.date,
      r.companyId,
      r.sourceOrPurpose,
      r.category,
      formatRupiah(r.amount),
      r.cashAccount,
      r.counterAccount,
      r.description,
    ]);
    if (formatLabel === 'Excel') {
      exportToExcel(dataObjs, `${type}_${todayStr}`, type, headers);
    } else if (formatLabel === 'CSV') {
      exportToCSV(dataObjs, `${type}_${todayStr}`, headers);
    } else if (formatLabel === 'PDF') {
      exportToPDF(title, headers, rowArrays, `${type}_${todayStr}`);
    } else {
      printHtmlReport(title, `Periode s/d ${todayStr}`, headers, rowArrays);
    }
  };

  // =========================================================
  // STATE: BUKU KAS (RUNNING BALANCE)
  // =========================================================
  const [bukuKasStartDate, setBukuKasStartDate] = useState('2026-10-01');
  const [bukuKasEndDate, setBukuKasEndDate] = useState('2026-10-31');
  const [bukuKasAccountFilter, setBukuKasAccountFilter] = useState('ALL');

  const bukuKasRows = useMemo(() => {
    const sortedChronological = [...cashTransactions]
      .filter((t) => {
        if (bukuKasStartDate && t.date < bukuKasStartDate) return false;
        if (bukuKasEndDate && t.date > bukuKasEndDate) return false;
        if (bukuKasAccountFilter !== 'ALL' && t.cashAccount !== bukuKasAccountFilter) return false;
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));

    let runningBalance = cashTransactions.length === 0 ? 0 : 250000000;
    return sortedChronological.map((t) => {
      const kasMasuk = t.type === 'KAS_MASUK' ? t.amount : 0;
      const kasKeluar = t.type === 'KAS_KELUAR' ? t.amount : 0;
      runningBalance = runningBalance + kasMasuk - kasKeluar;
      return {
        ...t,
        kasMasuk,
        kasKeluar,
        runningBalance,
      };
    });
  }, [cashTransactions, bukuKasStartDate, bukuKasEndDate, bukuKasAccountFilter]);

  // =========================================================
  // STATE: COA UNLOCKED CRUD MODAL & DELETE VALIDATION
  // =========================================================
  const [coaSearch, setCoaSearch] = useState('');
  const [coaCategoryFilter, setCoaCategoryFilter] = useState<string>('ALL');
  const [coaModalOpen, setCoaModalOpen] = useState(false);
  const [coaOriginalCode, setCoaOriginalCode] = useState<string | undefined>(undefined);
  const [coaCode, setCoaCode] = useState('');
  const [coaName, setCoaName] = useState('');
  const [coaCategory, setCoaCategory] = useState<CoaItem['category']>('ASET');
  const [coaParent, setCoaParent] = useState('1-1000');
  const [coaLevel, setCoaLevel] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [coaActive, setCoaActive] = useState(true);
  const [coaDescription, setCoaDescription] = useState('');
  const [coaBalanceFormatted, setCoaBalanceFormatted] = useState('0');

  // Delete COA validation modal
  const [deleteCoaTarget, setDeleteCoaTarget] = useState<CoaItem | null>(null);
  const [migrateTargetCoa, setMigrateTargetCoa] = useState<string>('1-1110 Kas PT SDP');
  const [coaImportModalOpen, setCoaImportModalOpen] = useState(false);
  const [coaImportText, setCoaImportText] = useState(
    '1-1140,Kas Operasional Proyek Tahap 2,ASET,4,DEBIT,15000000\n5-2500,Beban Iklan Digital & Sosmed,BEBAN,3,DEBIT,5000000'
  );
  const [deployModalOpen, setDeployModalOpen] = useState(false);

  const openAddCoaModal = () => {
    setCoaOriginalCode(undefined);
    setCoaCode('1-1140');
    setCoaName('');
    setCoaCategory('ASET');
    setCoaParent('1-1100');
    setCoaLevel(4);
    setCoaActive(true);
    setCoaDescription('');
    setCoaBalanceFormatted('0');
    setCoaModalOpen(true);
  };

  const openEditCoaModal = (acc: CoaItem) => {
    setCoaOriginalCode(acc.code);
    setCoaCode(acc.code);
    setCoaName(acc.name);
    setCoaCategory(acc.category);
    setCoaParent(acc.parentCode || '1-0000');
    setCoaLevel(acc.level);
    setCoaActive(acc.active !== false);
    setCoaDescription(acc.description || '');
    setCoaBalanceFormatted(formatThousandDots(Math.abs(acc.balance)));
    setCoaModalOpen(true);
  };

  const openDuplicateCoaModal = (acc: CoaItem) => {
    setCoaOriginalCode(undefined);
    setCoaCode(`${acc.code}-COPY`);
    setCoaName(`${acc.name} (Salinan)`);
    setCoaCategory(acc.category);
    setCoaParent(acc.parentCode || acc.code);
    setCoaLevel(acc.level);
    setCoaActive(true);
    setCoaDescription(acc.description || '');
    setCoaBalanceFormatted(formatThousandDots(Math.abs(acc.balance)));
    setCoaModalOpen(true);
  };

  const handleSaveCoaForm = (e: React.FormEvent) => {
    e.preventDefault();
    const normalBalance: 'DEBIT' | 'KREDIT' =
      coaCategory === 'ASET' || coaCategory === 'BEBAN' ? 'DEBIT' : 'KREDIT';
    const res = saveCoaAccountFull(
      {
        code: coaCode,
        name: coaName,
        category: coaCategory,
        level: coaLevel,
        normalBalance,
        balance: parseThousandDots(coaBalanceFormatted),
        parentCode: coaParent,
        active: coaActive,
        description: coaDescription,
      },
      coaOriginalCode
    );
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    toast.success(res.message);
    setCoaModalOpen(false);
  };

  // Edit Manual Jurnal state
  const [editingJournal, setEditingJournal] = useState<JournalEntry | null>(null);

  // =========================================================
  // DASHBOARD KEUANGAN KPI & CHART CALCULATIONS
  // =========================================================
  const totalKasDanBank = useMemo(() => {
    return coa
      .filter((c) => c.code.startsWith('1-11') || c.code.startsWith('1-12'))
      .reduce((sum, c) => sum + c.balance, 0);
  }, [coa]);

  const totalKasMasukBulanIni = useMemo(() => {
    return cashTransactions
      .filter((t) => t.type === 'KAS_MASUK')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [cashTransactions]);

  const totalKasKeluarBulanIni = useMemo(() => {
    return cashTransactions
      .filter((t) => t.type === 'KAS_KELUAR')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [cashTransactions]);

  const saldoBersihBulanIni = totalKasMasukBulanIni - totalKasKeluarBulanIni;

  const cashFlow6Months = useMemo(() => {
    const monthDefs = [
      { key: '2026-05', month: 'Mei' },
      { key: '2026-06', month: 'Jun' },
      { key: '2026-07', month: 'Jul' },
      { key: '2026-08', month: 'Agu' },
      { key: '2026-09', month: 'Sep' },
      { key: '2026-10', month: 'Okt' },
    ];
    return monthDefs.map((m) => {
      const masuk = cashTransactions
        .filter((t) => t.type === 'KAS_MASUK' && (t.date || '').startsWith(m.key))
        .reduce((s, t) => s + (Number(t.amount) || 0), 0);
      const keluar = cashTransactions
        .filter((t) => t.type === 'KAS_KELUAR' && (t.date || '').startsWith(m.key))
        .reduce((s, t) => s + (Number(t.amount) || 0), 0);
      return { month: m.month, masuk, keluar };
    });
  }, [cashTransactions]);

  const selectedDetailTx = useMemo(
    () =>
      cashTransactions.find((t) => t.id === selectedTxId) ||
      cashTransactions[0] ||
      null,
    [cashTransactions, selectedTxId]
  );

  return (
    <div className="space-y-6 pb-16">
      {/* HEADER MODUL KEUANGAN LENGKAP + TOMBOL DEPLOY */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">
              Keuangan Terpadu — Kas Masuk, Kas Keluar, Buku Kas, Auto-Jurnal &amp; COA CRUD
            </h1>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[11px] font-semibold">
              COA Unlocked · Auto-Jurnal Aktif
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Setiap Kas Masuk &amp; Kas Keluar otomatis memposting Jurnal Umum dan memperbarui saldo akun COA secara real-time
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => openNewTxModal('KAS_MASUK')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>+ Tambah Kas Masuk</span>
          </button>
          <button
            type="button"
            onClick={() => openNewTxModal('KAS_KELUAR')}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>+ Tambah Kas Keluar</span>
          </button>
          {currentUser?.role === 'ADMIN' && (
            <button
              type="button"
              onClick={() => setDeployModalOpen(true)}
              className="px-3.5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Rocket className="w-3.5 h-3.5 text-emerald-400" />
              <span>Deploy</span>
            </button>
          )}
        </div>
      </div>

      {/* NAVIGASI 6 SUB-MENU KEUANGAN */}
      <div className="flex items-center gap-1.5 overflow-x-auto bg-white border border-gray-200 rounded-xl p-1.5 text-xs font-semibold no-print">
        <button
          type="button"
          onClick={() => switchFinanceTab('DASHBOARD', '/keuangan/dashboard')}
          className={`px-3.5 py-2.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
            tab === 'DASHBOARD' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          1. Dashboard Keuangan
        </button>
        <button
          type="button"
          onClick={() => switchFinanceTab('KAS_MASUK', '/keuangan/kas-masuk')}
          className={`px-3.5 py-2.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
            tab === 'KAS_MASUK' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          2. Kas Masuk ({cashTransactions.filter((t) => t.type === 'KAS_MASUK').length})
        </button>
        <button
          type="button"
          onClick={() => switchFinanceTab('KAS_KELUAR', '/keuangan/kas-keluar')}
          className={`px-3.5 py-2.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
            tab === 'KAS_KELUAR' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          3. Kas Keluar ({cashTransactions.filter((t) => t.type === 'KAS_KELUAR').length})
        </button>
        <button
          type="button"
          onClick={() => switchFinanceTab('BUKU_KAS', '/keuangan/buku-kas')}
          className={`px-3.5 py-2.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
            tab === 'BUKU_KAS' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          4. Buku Kas (Running Balance)
        </button>
        <button
          type="button"
          onClick={() => switchFinanceTab('COA', '/keuangan/coa')}
          className={`px-3.5 py-2.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
            tab === 'COA' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          5. COA CRUD ({coa.length} Akun)
        </button>
        <button
          type="button"
          onClick={() => switchFinanceTab('JURNAL', '/keuangan/jurnal')}
          className={`px-3.5 py-2.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
            tab === 'JURNAL' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          6. Auto-Jurnal, Buku Besar &amp; Pajak ({journals.length})
        </button>
      </div>

      {/* SUPER ADMIN 5-BUTTON CRUD TOOLBAR (COA UNLOCKED!) */}
      <div className="no-print">
        <SuperAdminCrudBar
          collectionKey={tab === 'COA' ? 'coa' : 'transactions'}
          collectionLabel={
            tab === 'COA'
              ? `Bagan Akun COA (${coa.length} Akun — Unlocked CRUD)`
              : 'Transaksi Kas Masuk, Kas Keluar & Jurnal'
          }
          itemCount={tab === 'COA' ? coa.length : cashTransactions.length}
          protectDeleteAndReset={false}
          sampleAdjustTarget={
            tab === 'COA'
              ? {
                  id: '1-1110',
                  label: 'Kas PT SDP',
                  currentValue: 250000000,
                  unitLabel: 'Rp',
                }
              : {
                  id: cashTransactions[0]?.id || 'KM-2026-10-0001',
                  label: cashTransactions[0]?.description || 'Transaksi',
                  currentValue: cashTransactions[0]?.amount || 169000000,
                  unitLabel: 'Rp',
                }
          }
        />
      </div>

      {/* =========================================================
          4. DASHBOARD KEUANGAN (/keuangan/dashboard)
          4 KPI Cards + 2 Grafik + 2 Tabel
      ========================================================= */}
      {tab === 'DASHBOARD' && (
        <div className="space-y-6">
          {/* ALERT NOTIFIKASI FIRESTORE REAL-TIME & ANTREAN VERIFIKASI KEUANGAN */}
          {(financeUnreadNotifs.length > 0 || financePendingProjectSubs.length > 0) && (
            <div className="bg-gradient-to-r from-amber-50 via-white to-emerald-50/40 border border-amber-300 rounded-xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-amber-600 animate-ping" />
                  <div>
                    <div className="text-xs font-bold text-amber-950 flex items-center gap-2">
                      <span>ALERT NOTIFIKASI FIRESTORE — MEJA VERIFIKASI &amp; PENCAIRAN KEUANGAN</span>
                      <span className="px-2 py-0.5 bg-red-600 text-white rounded-full text-[10px] font-mono">
                        {financeUnreadNotifs.length} Alert Baru · {financePendingProjectSubs.length} Antrean Verifikasi
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600">
                      Setiap pengajuan proyek PJT, pencairan dana di bawah limit, atau persetujuan Direktur langsung masuk ke antrean Keuangan secara real-time.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {financeUnreadNotifs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        markAllApprovalNotificationsReadForRole('KEUANGAN');
                        toast.success('Semua notifikasi Keuangan ditandai sudah dibaca');
                      }}
                      className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-[11px] font-semibold text-gray-700 cursor-pointer"
                    >
                      ✓ Tandai Dibaca ({financeUnreadNotifs.length})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate('/project/pengajuan-proyek')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                  >
                    Buka Semua Pengajuan Proyek →
                  </button>
                </div>
              </div>

              {/* Daftar Pengajuan Proyek PJT yang Menunggu Verifikasi Keuangan */}
              {financePendingProjectSubs.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-gray-900">
                    Menunggu Verifikasi Anggaran oleh Keuangan ({financePendingProjectSubs.length} Pengajuan PJT):
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {financePendingProjectSubs.map((sub) => (
                      <div
                        key={sub.id}
                        className="bg-white border border-amber-200 rounded-xl p-3.5 flex flex-col justify-between gap-2.5 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono text-[11px] font-bold text-emerald-700">
                              {sub.submissionNumber} · {sub.companyId} · {sub.type}
                            </span>
                            <div className="text-xs font-bold text-gray-900 mt-0.5">{sub.projectName}</div>
                            <div className="text-[11px] text-gray-500">
                              Pengaju: {sub.requester} ({sub.requesterRole}) · {sub.date}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-xs font-bold text-gray-900">
                              {formatRupiah(sub.rabAmount)}
                            </div>
                            <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-semibold mt-0.5">
                              {sub.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={() => {
                              verifyProjectSubmissionByFinance(
                                sub.id,
                                'OK',
                                'Pos anggaran & ketersediaan kas diverifikasi Keuangan via Dashboard.'
                              );
                              toast.success(
                                `Pengajuan ${sub.submissionNumber} diverifikasi Keuangan & diteruskan ke Direktur!`
                              );
                            }}
                            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                          >
                            ✓ Verifikasi Keuangan OK (Teruskan ke Direktur)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              verifyProjectSubmissionByFinance(
                                sub.id,
                                'REJECT',
                                'Revisi rincian RAB diperlukan sebelum diverifikasi Keuangan.'
                              );
                              toast.error(`Pengajuan ${sub.submissionNumber} ditolak oleh Keuangan`);
                            }}
                            className="px-2.5 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-[11px] font-semibold cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Daftar Notifikasi Firestore Terbaru untuk Keuangan */}
              {financeUnreadNotifs.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                  {financeUnreadNotifs.slice(0, 3).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markApprovalNotificationRead(notif.id);
                        navigate(notif.actionPath || '/keuangan/dashboard');
                      }}
                      className="bg-white/90 border border-gray-200 hover:border-emerald-400 rounded-lg p-3 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold text-teal-700 uppercase">
                          {notif.category}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">{notif.createdAt}</span>
                      </div>
                      <div className="text-xs font-bold text-gray-900 mt-0.5">{notif.title}</div>
                      <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5">{notif.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4 KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="text-xs font-medium text-gray-500">1. Total Kas &amp; Bank</div>
              <div className="text-xl font-bold font-mono text-gray-900 mt-1 tabular-nums">
                {formatRupiah(totalKasDanBank)}
              </div>
              <div className="text-[11px] text-emerald-700 font-medium mt-1">
                Akun 1-1100 Kas &amp; 1-1200 Bank
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="text-xs font-medium text-gray-500">2. Kas Masuk Bulan Ini</div>
              <div className="text-xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
                +{formatRupiah(totalKasMasukBulanIni)}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                {cashTransactions.filter((t) => t.type === 'KAS_MASUK').length} transaksi penerimaan
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="text-xs font-medium text-gray-500">3. Kas Keluar Bulan Ini</div>
              <div className="text-xl font-bold font-mono text-red-600 mt-1 tabular-nums">
                -{formatRupiah(totalKasKeluarBulanIni)}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                {cashTransactions.filter((t) => t.type === 'KAS_KELUAR').length} transaksi pengeluaran
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="text-xs font-medium text-gray-500">4. Saldo Bersih Bulan Ini</div>
              <div
                className={`text-xl font-bold font-mono mt-1 tabular-nums ${
                  saldoBersihBulanIni >= 0 ? 'text-emerald-700' : 'text-red-600'
                }`}
              >
                {formatRupiah(saldoBersihBulanIni)}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">Surplus / Defisit Oktober 2026</div>
            </div>
          </div>

          {/* 2 GRAFIK: CASH FLOW 6 BULAN (LINE CHART) & KAS MASUK VS KELUAR (BAR CHART) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Line Chart: Cash Flow 6 Bulan */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Grafik 1: Cash Flow Bersih 6 Bulan Terakhir (Line Chart)
                  </h3>
                  <p className="text-xs text-gray-500">Tren surplus arus kas Mei – Oktober 2026</p>
                </div>
                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-[11px] font-mono font-bold">
                  +Positif
                </span>
              </div>

              <div className="pt-2">
                <svg viewBox="0 0 500 180" className="w-full h-44 overflow-visible">
                  {[0, 40, 80, 120, 160].map((y) => (
                    <line
                      key={y}
                      x1="30"
                      y1={y}
                      x2="480"
                      y2={y}
                      stroke="#F3F4F6"
                      strokeWidth="1"
                    />
                  ))}
                  {(() => {
                    const maxVal = Math.max(
                      1,
                      ...cashFlow6Months.map((item) => Math.max(item.masuk, item.keluar, Math.abs(item.masuk - item.keluar)))
                    );
                    const allZero = cashFlow6Months.every((item) => item.masuk === 0 && item.keluar === 0);
                    const points = cashFlow6Months.map((item, idx) => {
                      const x = 55 + idx * 78;
                      const net = item.masuk - item.keluar;
                      const y = allZero ? 155 : 155 - Math.min(135, Math.max(0, Math.round((Math.max(0, net) / maxVal) * 135)));
                      return { x, y, month: item.month, net };
                    });
                    const polyPoints = points.map((p) => `${p.x},${p.y}`).join(' ');
                    return (
                      <>
                        <polyline
                          fill="none"
                          stroke="#059669"
                          strokeWidth="3"
                          points={polyPoints}
                        />
                        {points.map((p) => (
                          <g key={p.month}>
                            <circle cx={p.x} cy={p.y} r="5" fill="#059669" />
                            <text
                              x={p.x}
                              y={p.y - 10}
                              textAnchor="middle"
                              className="text-[10px] fill-gray-700 font-mono"
                            >
                              {Math.round(p.net / 1000000)}Jt
                            </text>
                            <text
                              x={p.x}
                              y={174}
                              textAnchor="middle"
                              className="text-[11px] fill-gray-500 font-semibold"
                            >
                              {p.month}
                            </text>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>
              </div>
            </div>

            {/* Bar Chart: Kas Masuk vs Kas Keluar */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Grafik 2: Kas Masuk vs Kas Keluar (Bar Chart)
                  </h3>
                  <p className="text-xs text-gray-500">Perbandingan penerimaan &amp; pengeluaran bulanan</p>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" /> Masuk
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" /> Keluar
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-3 items-end h-44 pt-4 px-2 border-b border-gray-100">
                {cashFlow6Months.map((m) => {
                  const maxBar = Math.max(1, ...cashFlow6Months.map((x) => Math.max(x.masuk, x.keluar)));
                  const hMasuk = m.masuk > 0 ? Math.max(10, Math.round((m.masuk / maxBar) * 120)) : 2;
                  const hKeluar = m.keluar > 0 ? Math.max(10, Math.round((m.keluar / maxBar) * 120)) : 2;
                  return (
                    <div key={m.month} className="flex flex-col items-center gap-1.5">
                      <div className="flex items-end gap-1 h-32">
                        <div
                          style={{ height: `${hMasuk}px` }}
                          className="w-3.5 sm:w-4 bg-emerald-600 rounded-t"
                          title={`Masuk: ${formatRupiah(m.masuk)}`}
                        />
                        <div
                          style={{ height: `${hKeluar}px` }}
                          className="w-3.5 sm:w-4 bg-amber-500 rounded-t"
                          title={`Keluar: ${formatRupiah(m.keluar)}`}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-gray-600">{m.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2 TABEL: 10 TRANSAKSI TERBARU & 5 TRANSAKSI TERBESAR BULAN INI */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">
                  Tabel 1: 10 Transaksi Kas Terbaru (Klik Baris untuk Detail)
                </h3>
                <button
                  type="button"
                  onClick={() => switchFinanceTab('BUKU_KAS', '/keuangan/buku-kas')}
                  className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                >
                  Buka Buku Kas →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500">
                      <th className="py-2 pr-2">No Transaksi</th>
                      <th className="py-2 px-2">Tanggal</th>
                      <th className="py-2 px-2">Uraian</th>
                      <th className="py-2 pl-2 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cashTransactions.slice(0, 10).map((t) => (
                      <tr
                        key={t.id}
                        onClick={() => navigate(`/keuangan/transaksi/${t.id}`)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="py-2.5 pr-2 font-mono font-bold text-emerald-700">{t.id}</td>
                        <td className="py-2.5 px-2 font-mono text-gray-600">{t.date}</td>
                        <td className="py-2.5 px-2 text-gray-800 truncate max-w-xs">{t.description}</td>
                        <td
                          className={`py-2.5 pl-2 text-right font-mono font-bold tabular-nums ${
                            t.type === 'KAS_MASUK' ? 'text-emerald-700' : 'text-red-600'
                          }`}
                        >
                          {t.type === 'KAS_MASUK' ? '+' : '-'}
                          {formatRupiah(t.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white border border-gray-200 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-gray-900">
                Tabel 2: 5 Transaksi Terbesar Bulan Ini
              </h3>
              <div className="divide-y divide-gray-100">
                {[...cashTransactions]
                  .sort((a, b) => b.amount - a.amount)
                  .slice(0, 5)
                  .map((t, idx) => (
                    <div
                      key={t.id}
                      onClick={() => navigate(`/keuangan/transaksi/${t.id}`)}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-gray-50 px-2 rounded-lg cursor-pointer"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-700 font-mono text-[11px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-mono text-xs font-bold text-gray-900">{t.id}</span>
                          <span className="text-[11px] text-gray-500">{t.sourceOrPurpose}</span>
                        </div>
                        <div className="text-xs text-gray-600 truncate">{t.description}</div>
                      </div>
                      <div
                        className={`font-mono text-xs font-bold shrink-0 tabular-nums ${
                          t.type === 'KAS_MASUK' ? 'text-emerald-700' : 'text-red-600'
                        }`}
                      >
                        {formatRupiah(t.amount)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          1 & 2. HALAMAN KAS MASUK (/keuangan/kas-masuk) & KAS KELUAR (/keuangan/kas-keluar)
      ========================================================= */}
      {(tab === 'KAS_MASUK' || tab === 'KAS_KELUAR') && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          {(() => {
            const currentType = tab === 'KAS_MASUK' ? 'KAS_MASUK' : 'KAS_KELUAR';
            const allRows = getFilteredAndSortedTxs(currentType);
            const totalPages = Math.max(1, Math.ceil(allRows.length / txPageSize));
            const safePage = Math.min(txPage, totalPages);
            const paginatedRows = allRows.slice((safePage - 1) * txPageSize, safePage * txPageSize);
            const totalSum = allRows.reduce((s, r) => s + r.amount, 0);

            return (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">
                      {currentType === 'KAS_MASUK'
                        ? 'Pencatatan Kas Masuk (/keuangan/kas-masuk)'
                        : 'Pencatatan Kas Keluar (/keuangan/kas-keluar)'}
                    </h2>
                    <p className="text-xs text-gray-500">
                      Total {allRows.length} transaksi · Akumulasi:{' '}
                      <strong className="font-mono text-gray-900">{formatRupiah(totalSum)}</strong> · Klik baris untuk lihat Detail &amp; Kwitansi
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 no-print">
                    <button
                      type="button"
                      onClick={() => openNewTxModal(currentType)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>
                        {currentType === 'KAS_MASUK' ? '+ Tambah Kas Masuk' : '+ Tambah Kas Keluar'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportTxCsv(currentType, 'Excel')}
                      className="px-3 py-2 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-xs font-bold text-emerald-800 flex items-center gap-1 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                      <span>📥 Excel</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportTxCsv(currentType, 'PDF')}
                      className="px-3 py-2 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-bold text-red-800 flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-red-700" />
                      <span>📄 PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportTxCsv(currentType, 'CSV')}
                      className="px-3 py-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs font-bold text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-700" />
                      <span>📋 CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportTxCsv(currentType, 'PRINT')}
                      className="px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 rounded-lg text-xs font-bold text-gray-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>🖨️ Print</span>
                    </button>
                  </div>
                </div>

                {/* FILTER & SEARCH BAR */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1 no-print">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={txSearch}
                      onChange={(e) => {
                        setTxSearch(e.target.value);
                        setTxPage(1);
                      }}
                      placeholder="Cari no transaksi / keterangan..."
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>

                  <input
                    type="date"
                    value={txFilterDate}
                    onChange={(e) => {
                      setTxFilterDate(e.target.value);
                      setTxPage(1);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white font-mono"
                  />

                  <select
                    value={txFilterCategory}
                    onChange={(e) => {
                      setTxFilterCategory(e.target.value);
                      setTxPage(1);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white"
                  >
                    <option value="ALL">
                      Semua {currentType === 'KAS_MASUK' ? 'Sumber / Kategori' : 'Tujuan / Kategori'}
                    </option>
                    {(currentType === 'KAS_MASUK'
                      ? KAS_MASUK_SOURCES.map((s) => s.source)
                      : KAS_KELUAR_PURPOSES.map((p) => p.purpose)
                    ).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  <select
                    value={txFilterAccount}
                    onChange={(e) => {
                      setTxFilterAccount(e.target.value);
                      setTxPage(1);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white"
                  >
                    <option value="ALL">Semua Akun Kas/Bank</option>
                    {cashBankCoaOptions.map((acc) => (
                      <option key={acc} value={acc}>
                        {acc}
                      </option>
                    ))}
                  </select>

                  <select
                    value={txFilterCompany}
                    onChange={(e) => {
                      setTxFilterCompany(e.target.value as any);
                      setTxPage(1);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white"
                  >
                    <option value="ALL">Semua PT (Konsolidasi)</option>
                    <option value="PT_TBL">PT Tata Bahagia Land</option>
                    <option value="PT_BPP">PT Bahagia Prima Property</option>
                  </select>
                </div>

                {/* TABEL KAS MASUK / KAS KELUAR */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-600 bg-gray-50">
                        <th
                          onClick={() => toggleSort('id')}
                          className="py-3 px-3 font-semibold cursor-pointer hover:text-gray-900 whitespace-nowrap"
                        >
                          <span className="inline-flex items-center gap-1">
                            No Transaksi <ArrowUpDown className="w-3 h-3" />
                          </span>
                        </th>
                        <th
                          onClick={() => toggleSort('date')}
                          className="py-3 px-3 font-semibold cursor-pointer hover:text-gray-900 whitespace-nowrap"
                        >
                          <span className="inline-flex items-center gap-1">
                            Tanggal <ArrowUpDown className="w-3 h-3" />
                          </span>
                        </th>
                        <th
                          onClick={() => toggleSort('sourceOrPurpose')}
                          className="py-3 px-3 font-semibold cursor-pointer hover:text-gray-900"
                        >
                          <span className="inline-flex items-center gap-1">
                            {currentType === 'KAS_MASUK' ? 'Sumber' : 'Tujuan'}{' '}
                            <ArrowUpDown className="w-3 h-3" />
                          </span>
                        </th>
                        <th
                          onClick={() => toggleSort('category')}
                          className="py-3 px-3 font-semibold cursor-pointer hover:text-gray-900"
                        >
                          <span className="inline-flex items-center gap-1">
                            Kategori <ArrowUpDown className="w-3 h-3" />
                          </span>
                        </th>
                        <th
                          onClick={() => toggleSort('amount')}
                          className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-gray-900 whitespace-nowrap"
                        >
                          <span className="inline-flex items-center justify-end gap-1">
                            Nominal <ArrowUpDown className="w-3 h-3" />
                          </span>
                        </th>
                        <th
                          onClick={() => toggleSort('cashAccount')}
                          className="py-3 px-3 font-semibold cursor-pointer hover:text-gray-900"
                        >
                          <span className="inline-flex items-center gap-1">
                            Akun Kas <ArrowUpDown className="w-3 h-3" />
                          </span>
                        </th>
                        <th
                          onClick={() => toggleSort('counterAccount')}
                          className="py-3 px-3 font-semibold cursor-pointer hover:text-gray-900"
                        >
                          <span className="inline-flex items-center gap-1">
                            {currentType === 'KAS_MASUK' ? 'Akun Kredit' : 'Akun Debit'}{' '}
                            <ArrowUpDown className="w-3 h-3" />
                          </span>
                        </th>
                        <th className="py-3 px-3 text-right font-semibold no-print">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedRows.map((row) => (
                        <tr
                          key={row.id}
                          onClick={() => navigate(`/keuangan/transaksi/${row.id}`)}
                          className="hover:bg-emerald-50/40 cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-3 font-mono font-bold text-emerald-700 whitespace-nowrap">
                            {row.id}
                          </td>
                          <td className="py-3 px-3 font-mono text-gray-700 whitespace-nowrap">
                            {row.date}
                          </td>
                          <td className="py-3 px-3 font-semibold text-gray-900">
                            <div>{row.sourceOrPurpose}</div>
                            <div className="text-[11px] font-normal text-gray-500 truncate max-w-xs">
                              {row.description}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-gray-700">{row.category}</td>
                          <td
                            className={`py-3 px-3 text-right font-mono font-bold whitespace-nowrap tabular-nums ${
                              currentType === 'KAS_MASUK' ? 'text-emerald-700' : 'text-red-600'
                            }`}
                          >
                            {formatRupiah(row.amount)}
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-gray-800">
                            {row.cashAccount}
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-gray-700">
                            {row.counterAccount}
                          </td>
                          <td
                            className="py-3 px-3 text-right whitespace-nowrap no-print"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => navigate(`/keuangan/transaksi/${row.id}`)}
                                className="px-2 py-1 border border-gray-300 hover:bg-gray-100 rounded text-[11px] font-medium text-gray-700 cursor-pointer"
                                title="Lihat Rincian & Jurnal"
                              >
                                Detail
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditTxModal(row)}
                                className="px-2 py-1 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded text-[11px] font-medium text-blue-700 cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTxConfirm(row)}
                                className="px-2 py-1 border border-red-200 bg-red-50 hover:bg-red-100 rounded text-[11px] font-medium text-red-600 cursor-pointer"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION: 10 / 25 / 50 / 100 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100 text-xs no-print">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Tampilkan per halaman:</span>
                    {[10, 25, 50, 100].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          setTxPageSize(sz);
                          setTxPage(1);
                        }}
                        className={`px-2.5 py-1 rounded font-mono cursor-pointer ${
                          txPageSize === sz
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">
                      Halaman {safePage} dari {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40 cursor-pointer"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      disabled={safePage >= totalPages}
                      onClick={() => setTxPage((p) => Math.min(totalPages, p + 1))}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* =========================================================
          3. DETAIL TRANSAKSI (/keuangan/transaksi/:id)
          Info lengkap, Auto-Jurnal Debit & Kredit, Bukti Upload, Riwayat, Edit/Hapus/Print Kwitansi/Duplikat
      ========================================================= */}
      {tab === 'DETAIL' && selectedDetailTx && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    switchFinanceTab(
                      selectedDetailTx.type === 'KAS_MASUK' ? 'KAS_MASUK' : 'KAS_KELUAR',
                      selectedDetailTx.type === 'KAS_MASUK'
                        ? '/keuangan/kas-masuk'
                        : '/keuangan/kas-keluar'
                    )
                  }
                  className="p-2 border border-gray-200 hover:bg-gray-50 rounded-lg no-print cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-emerald-700">
                      {selectedDetailTx.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        selectedDetailTx.type === 'KAS_MASUK'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {selectedDetailTx.type === 'KAS_MASUK' ? 'KAS MASUK' : 'KAS KELUAR'}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mt-0.5">
                    {selectedDetailTx.description}
                  </h2>
                </div>
              </div>

              {/* Tombol: Edit, Hapus, Print Kwitansi, Duplikat */}
              <div className="flex flex-wrap items-center gap-2 no-print">
                <button
                  type="button"
                  onClick={() => openEditTxModal(selectedDetailTx)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const copy = duplicateCashTransaction(selectedDetailTx.id);
                    if (copy) {
                      toast.success(`📋 Transaksi berhasil diduplikat menjadi ${copy.id}`);
                      navigate(`/keuangan/transaksi/${copy.id}`);
                    }
                  }}
                  className="px-3.5 py-2 border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplikat</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.success(`Mencetak Kwitansi Resmi ${selectedDetailTx.id}`);
                    window.print();
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Kwitansi</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTxConfirm(selectedDetailTx)}
                  className="px-3.5 py-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>

            {/* Info Lengkap Transaksi */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <div className="font-bold text-gray-900 border-b border-gray-200 pb-1.5">
                  Informasi Utama Transaksi
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">No Transaksi:</span>
                  <span className="font-mono font-bold">{selectedDetailTx.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tanggal:</span>
                  <span className="font-mono">{selectedDetailTx.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Perusahaan (PT):</span>
                  <span className="font-semibold">{selectedDetailTx.companyId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    {selectedDetailTx.type === 'KAS_MASUK' ? 'Sumber:' : 'Tujuan:'}
                  </span>
                  <span className="font-semibold">{selectedDetailTx.sourceOrPurpose}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Kategori:</span>
                  <span>{selectedDetailTx.category}</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <div className="font-bold text-emerald-950 border-b border-emerald-200 pb-1.5">
                  Nilai Nominal &amp; Kwitansi
                </div>
                <div className="text-2xl font-extrabold font-mono text-emerald-800 tabular-nums">
                  {formatRupiah(selectedDetailTx.amount)}
                </div>
                <div className="text-[11px] text-emerald-900 italic">
                  Terbilang: # {terbilangRupiah(selectedDetailTx.amount)} #
                </div>
                {selectedDetailTx.consumerName && (
                  <div className="text-gray-700 pt-1">
                    Konsumen: <strong>{selectedDetailTx.consumerName}</strong>{' '}
                    {selectedDetailTx.unitCode ? `(Unit ${selectedDetailTx.unitCode})` : ''}
                  </div>
                )}
                {selectedDetailTx.supplierName && (
                  <div className="text-gray-700 pt-1">
                    Supplier: <strong>{selectedDetailTx.supplierName}</strong>
                  </div>
                )}
                {selectedDetailTx.employeeName && (
                  <div className="text-gray-700 pt-1">
                    Karyawan/Mandor: <strong>{selectedDetailTx.employeeName}</strong>
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <div className="font-bold text-gray-900 border-b border-gray-200 pb-1.5">
                  Preview Bukti Upload
                </div>
                {selectedDetailTx.proofUrl ? (
                  <img
                    src={selectedDetailTx.proofUrl}
                    alt="Bukti Transaksi"
                    className="w-full h-28 object-cover rounded-lg border border-gray-200"
                  />
                ) : (
                  <div className="p-4 bg-white border border-dashed border-gray-300 rounded-lg text-center space-y-1">
                    <FileText className="w-6 h-6 text-emerald-600 mx-auto" />
                    <div className="font-mono text-[11px] font-semibold text-gray-800">
                      {selectedDetailTx.proofFileName || 'Bukti_Transaksi_Terverifikasi.pdf'}
                    </div>
                    <div className="text-[10px] text-gray-400">Dokumen Bukti Kas Tersimpan</div>
                  </div>
                )}
              </div>
            </div>

            {/* JURNAL OTOMATIS YANG DI-GENERATE (DEBIT & KREDIT) */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Jurnal Otomatis yang Di-Generate ({selectedDetailTx.journalId})
                  </h3>
                  <p className="text-xs text-gray-500">
                    Tercatat otomatis di Jurnal Umum &amp; Buku Besar COA
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-mono font-bold">
                  BALANCE: DEBIT = KREDIT
                </span>
              </div>

              <table className="w-full text-left text-xs border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                  <tr>
                    <th className="py-2.5 px-3">Posisi</th>
                    <th className="py-2.5 px-3">Akun COA</th>
                    <th className="py-2.5 px-3 text-right">Debit (Rp)</th>
                    <th className="py-2.5 px-3 text-right">Kredit (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-emerald-700">DEBIT</td>
                    <td className="py-2.5 px-3 text-gray-900">{selectedDetailTx.debitAccount}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                      {formatRupiah(selectedDetailTx.amount)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-400">Rp0</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-blue-700 pl-8">KREDIT</td>
                    <td className="py-2.5 px-3 text-gray-900 pl-8">
                      {selectedDetailTx.creditAccount}
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-400">Rp0</td>
                    <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                      {formatRupiah(selectedDetailTx.amount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* RIWAYAT PERUBAHAN */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2 text-xs">
              <div className="font-bold text-gray-900">Riwayat Perubahan Transaksi</div>
              <div className="space-y-1.5">
                {selectedDetailTx.history.map((h) => (
                  <div key={h.id} className="flex items-center justify-between text-gray-600">
                    <span>
                      <strong>{h.actor}</strong> — {h.action}
                    </span>
                    <span className="font-mono text-[11px] text-gray-400">{h.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          5. BUKU KAS (/keuangan/buku-kas)
          Gabungan Kas Masuk & Kas Keluar + Running Balance
      ========================================================= */}
      {tab === 'BUKU_KAS' && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Buku Kas Terpadu — Gabungan Kas Masuk &amp; Kas Keluar (/keuangan/buku-kas)
              </h2>
              <p className="text-xs text-gray-500">
                Dilengkapi perhitungan Saldo Berjalan (Running Balance) otomatis setiap transaksi
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 no-print">
              <ExportActionButtons
                title="Laporan Buku Kas Terpadu (Running Balance)"
                subtitle={`Periode: ${bukuKasStartDate} s/d ${bukuKasEndDate}`}
                filename={`Buku_Kas_${todayStr}`}
                headers={['Tanggal', 'No Transaksi', 'Uraian', 'Akun Kas', 'Kas Masuk (Rp)', 'Kas Keluar (Rp)', 'Saldo Berjalan (Rp)']}
                data={bukuKasRows.map((r) => ({
                  Tanggal: r.date,
                  'No Transaksi': r.id,
                  Uraian: r.description,
                  'Akun Kas': r.cashAccount,
                  'Kas Masuk (Rp)': r.kasMasuk,
                  'Kas Keluar (Rp)': r.kasKeluar,
                  'Saldo Berjalan (Rp)': r.runningBalance,
                }))}
                rows={bukuKasRows.map((r) => [
                  r.date,
                  r.id,
                  r.description,
                  r.cashAccount,
                  r.kasMasuk > 0 ? formatRupiah(r.kasMasuk) : '-',
                  r.kasKeluar > 0 ? formatRupiah(r.kasKeluar) : '-',
                  formatRupiah(r.runningBalance),
                ])}
              />
            </div>
          </div>

          {/* Filter Periode & Akun Kas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs no-print">
            <div>
              <label className="text-gray-600 font-semibold block mb-1">Dari Tanggal:</label>
              <input
                type="date"
                value={bukuKasStartDate}
                onChange={(e) => setBukuKasStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-gray-600 font-semibold block mb-1">Sampai Tanggal:</label>
              <input
                type="date"
                value={bukuKasEndDate}
                onChange={(e) => setBukuKasEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-gray-600 font-semibold block mb-1">Filter Akun Kas/Bank:</label>
              <select
                value={bukuKasAccountFilter}
                onChange={(e) => setBukuKasAccountFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
              >
                <option value="ALL">Semua Akun Kas &amp; Bank</option>
                {cashBankCoaOptions.map((acc) => (
                  <option key={acc} value={acc}>
                    {acc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-600 bg-gray-50">
                  <th className="py-3 px-3 font-semibold">Tanggal</th>
                  <th className="py-3 px-3 font-semibold">No Transaksi</th>
                  <th className="py-3 px-3 font-semibold">Uraian</th>
                  <th className="py-3 px-3 font-semibold text-right">Kas Masuk (Debit)</th>
                  <th className="py-3 px-3 font-semibold text-right">Kas Keluar (Kredit)</th>
                  <th className="py-3 px-3 font-semibold text-right">Saldo Berjalan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="bg-gray-50/70 font-mono text-gray-600">
                  <td className="py-2.5 px-3">{bukuKasStartDate || '2026-10-01'}</td>
                  <td className="py-2.5 px-3 font-bold">SALDO-AWAL</td>
                  <td className="py-2.5 px-3 font-sans font-semibold text-gray-800">
                    Saldo Awal Kas &amp; Setara Kas Periode Berjalan
                  </td>
                  <td className="py-2.5 px-3 text-right">-</td>
                  <td className="py-2.5 px-3 text-right">-</td>
                  <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                    {formatRupiah(250000000)}
                  </td>
                </tr>
                {bukuKasRows.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => navigate(`/keuangan/transaksi/${r.id}`)}
                    className="hover:bg-emerald-50/40 cursor-pointer"
                  >
                    <td className="py-3 px-3 font-mono text-gray-700 whitespace-nowrap">{r.date}</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700 whitespace-nowrap">
                      {r.id}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-gray-900">{r.description}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{r.cashAccount}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 tabular-nums">
                      {r.kasMasuk > 0 ? formatRupiah(r.kasMasuk) : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-red-600 tabular-nums">
                      {r.kasKeluar > 0 ? formatRupiah(r.kasKeluar) : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-extrabold text-gray-900 tabular-nums">
                      {formatRupiah(r.runningBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          6. COA BISA DI-CRUD / UNLOCKED (/keuangan/coa)
          [+ Tambah Akun] [✏️ Edit Akun] [🗑️ Hapus Akun] [📋 Duplikat] [🔄 Nonaktifkan] [📥 Import] [📤 Export]
      ========================================================= */}
      {tab === 'COA' && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">
                  Chart of Accounts (COA) — Kontrol Penuh Super Admin ({coa.length} Akun)
                </h2>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[11px] font-bold">
                  🔓 UNLOCKED CRUD
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Tambah akun, edit, duplikat, nonaktifkan dari dropdown, import/export Excel, dan hapus dengan validasi jurnal otomatis
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 no-print">
              <button
                type="button"
                onClick={openAddCoaModal}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Akun</span>
              </button>
              <button
                type="button"
                onClick={() => setCoaImportModalOpen(true)}
                className="px-3.5 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>📥 Import Excel</span>
              </button>
              <ExportActionButtons
                title="Bagan Akun Standar (Chart of Accounts - COA)"
                subtitle={`Total ${coa.length} Akun COA`}
                filename={`COA_Bahagia_Group_${todayStr}`}
                headers={['Kode Akun', 'Nama Akun', 'Tipe', 'Level', 'Saldo Normal', 'Saldo (Rp)', 'Status']}
                data={coa.map((c) => ({
                  'Kode Akun': c.code,
                  'Nama Akun': c.name,
                  Tipe: c.category,
                  Level: c.level,
                  'Saldo Normal': c.normalBalance,
                  'Saldo (Rp)': c.balance,
                  Status: c.active === false ? 'Nonaktif' : 'Aktif',
                }))}
                rows={coa.map((c) => [
                  c.code,
                  c.name,
                  c.category,
                  c.level,
                  c.normalBalance,
                  formatRupiah(c.balance),
                  c.active === false ? 'Nonaktif' : 'Aktif',
                ])}
              />
            </div>
          </div>

          {/* Search & Filter COA */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-2">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={coaSearch}
                onChange={(e) => setCoaSearch(e.target.value)}
                placeholder="Cari kode akun (1-1110) atau nama akun COA..."
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <select
              value={coaCategoryFilter}
              onChange={(e) => setCoaCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white"
            >
              <option value="ALL">Semua Tipe Akun (1 s/d 5)</option>
              <option value="ASET">1 - ASET</option>
              <option value="LIABILITAS">2 - LIABILITAS</option>
              <option value="EKUITAS">3 - EKUITAS</option>
              <option value="PENDAPATAN">4 - PENDAPATAN</option>
              <option value="BEBAN">5 - BEBAN</option>
            </select>
          </div>

          <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 text-gray-600">
                <tr>
                  <th className="py-3 px-3">Kode Akun</th>
                  <th className="py-3 px-3">Nama Akun COA</th>
                  <th className="py-3 px-3">Tipe</th>
                  <th className="py-3 px-3">Saldo Normal</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Saldo (Rp)</th>
                  <th className="py-3 px-3 text-right">Aksi CRUD COA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coa
                  .filter((c) => {
                    if (coaCategoryFilter !== 'ALL' && c.category !== coaCategoryFilter) return false;
                    if (
                      coaSearch.trim() &&
                      !c.code.toLowerCase().includes(coaSearch.toLowerCase()) &&
                      !c.name.toLowerCase().includes(coaSearch.toLowerCase())
                    )
                      return false;
                    return true;
                  })
                  .map((acc) => {
                    const isActive = acc.active !== false;
                    return (
                      <tr
                        key={acc.code}
                        className={`${acc.level === 1 ? 'bg-gray-50 font-bold' : 'hover:bg-gray-50'} ${
                          !isActive ? 'opacity-50 bg-gray-100/60' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-gray-900 whitespace-nowrap">
                          {acc.code}
                        </td>
                        <td
                          className="py-2.5 px-3 text-gray-800"
                          style={{ paddingLeft: `${(acc.level - 1) * 16 + 12}px` }}
                        >
                          <div>{acc.name}</div>
                          {acc.description && (
                            <div className="text-[10px] text-gray-400 font-normal">
                              {acc.description}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-gray-600">{acc.category}</td>
                        <td className="py-2.5 px-3 font-mono text-gray-600">{acc.normalBalance}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {isActive ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-gray-900">
                          {formatRupiah(acc.balance)}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditCoaModal(acc)}
                              className="px-2 py-1 border border-gray-300 hover:bg-gray-100 rounded text-[11px] font-medium text-gray-700 cursor-pointer"
                              title="Edit Akun COA"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => openDuplicateCoaModal(acc)}
                              className="px-2 py-1 border border-gray-300 hover:bg-gray-100 rounded text-[11px] font-medium text-gray-700 cursor-pointer"
                              title="Duplikat Akun"
                            >
                              📋 Duplikat
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                toggleCoaActive(acc.code);
                                toast.success(
                                  `Status akun ${acc.code} diubah menjadi ${
                                    isActive ? 'Nonaktif' : 'Aktif'
                                  }`
                                );
                              }}
                              className="px-2 py-1 border border-amber-200 bg-amber-50 hover:bg-amber-100 rounded text-[11px] font-medium text-amber-800 cursor-pointer"
                              title="Aktifkan / Nonaktifkan dari Dropdown"
                            >
                              🔄 {isActive ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteCoaTarget(acc)}
                              className="px-2 py-1 border border-red-200 bg-red-50 hover:bg-red-100 rounded text-[11px] font-medium text-red-600 cursor-pointer"
                              title="Hapus Akun COA"
                            >
                              🗑️ Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          7. JURNAL UMUM, AUTO-JURNAL, BUKU BESAR & PAJAK (/keuangan/jurnal)
      ========================================================= */}
      {tab === 'JURNAL' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Jurnal Umum &amp; Auto-Jurnal dari Transaksi Kas Masuk / Kas Keluar
                </h2>
                <p className="text-xs text-gray-500">
                  Semua jurnal otomatis dari Kas Masuk &amp; Kas Keluar tercatat di sini dan dapat di-edit manual jika diperlukan
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ExportActionButtons
                  title="Laporan Jurnal Umum & Auto-Jurnal"
                  subtitle={`Total ${journals.length} Jurnal Tercatat`}
                  filename={`Jurnal_Umum_${todayStr}`}
                  headers={['No Jurnal', 'Tanggal', 'PT', 'Referensi', 'Uraian', 'Akun Debit', 'Akun Kredit', 'Nominal (Rp)']}
                  data={journals.map((j) => ({
                    'No Jurnal': j.id,
                    Tanggal: j.date,
                    PT: j.companyId,
                    Referensi: j.reference,
                    Uraian: j.description,
                    'Akun Debit': j.debitAccount,
                    'Akun Kredit': j.creditAccount,
                    'Nominal (Rp)': j.amount,
                  }))}
                  rows={journals.map((j) => [
                    j.id,
                    j.date,
                    j.companyId,
                    j.reference,
                    j.description,
                    j.debitAccount,
                    j.creditAccount,
                    formatRupiah(j.amount),
                  ])}
                />
                <button
                  type="button"
                  onClick={() =>
                    setEditingJournal({
                      id: '',
                      date: '2026-10-09',
                      companyId: 'PT_TBL',
                      reference: 'MAN-JRN',
                      description: '',
                      debitAccount: '5-2200 Beban Operasional Kantor',
                      creditAccount: '1-1110 Kas PT SDP',
                      amount: 5000000,
                      autoGenerated: false,
                    })
                  }
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tambah Jurnal Manual</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {journals.map((j) => (
                <div
                  key={j.id}
                  className="p-4 border border-gray-200 rounded-xl text-xs space-y-2 hover:border-emerald-300 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-mono text-gray-600">
                      <strong className="text-gray-900">{j.id}</strong> · Tanggal: {j.date} · Ref:{' '}
                      <span className="text-emerald-700 font-bold">{j.reference}</span> ·{' '}
                      {j.companyId}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          j.autoGenerated
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {j.autoGenerated ? '⚡ Auto-Jurnal Transaksi' : 'Jurnal Manual'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingJournal(j)}
                        className="px-2 py-1 border border-gray-300 hover:bg-gray-100 rounded text-[11px] font-medium text-gray-700 cursor-pointer"
                      >
                        ✏️ Edit Manual
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          deleteJournalEntry(j.id);
                          toast.success(`Jurnal ${j.id} dihapus`);
                        }}
                        className="px-2 py-1 border border-red-200 hover:bg-red-50 rounded text-[11px] font-medium text-red-600 cursor-pointer"
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </div>
                  <div className="font-bold text-gray-900 text-sm">{j.description}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-xs bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-emerald-800 font-bold">DEBIT: {j.debitAccount}</span>
                      <span className="font-bold">{formatRupiah(j.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800 font-bold">KREDIT: {j.creditAccount}</span>
                      <span className="font-bold">{formatRupiah(j.amount)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL FORM INPUT / EDIT KAS MASUK & KAS KELUAR
      ========================================================= */}
      {txModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setTxModalOpen(false)}
        >
          <form
            onSubmit={handleSaveTxForm}
            className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  {editingTxId ? '✏️ Edit Transaksi ' : '+ Tambah '}
                  {txModalType === 'KAS_MASUK' ? 'Kas Masuk' : 'Kas Keluar'}
                </h3>
                <p className="text-gray-500">
                  Otomatis memposting Jurnal Umum (Debit &amp; Kredit) dan mengupdate saldo COA
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTxModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">No Transaksi (Auto)</label>
                <input
                  type="text"
                  readOnly
                  value={nextAutoTxCode}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-100 font-mono font-bold text-emerald-800"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Tanggal Transaksi *</label>
                <input
                  type="date"
                  required
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Entitas PT *</label>
                <select
                  value={txCompanyId}
                  onChange={(e) => setTxCompanyId(e.target.value as 'PT_TBL' | 'PT_BPP')}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white"
                >
                  <option value="PT_TBL">PT Tata Bahagia Land</option>
                  <option value="PT_BPP">PT Bahagia Prima Property</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  {txModalType === 'KAS_MASUK' ? 'Sumber Penerimaan *' : 'Tujuan Pembayaran *'}
                </label>
                <select
                  value={txSourceOrPurpose}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTxSourceOrPurpose(val);
                    if (txModalType === 'KAS_MASUK') {
                      const found = KAS_MASUK_SOURCES.find((s) => s.source === val);
                      if (found) {
                        setTxCategory(found.defaultCategory);
                        setTxCounterAccount(found.defaultCreditCoa);
                      }
                    } else {
                      const found = KAS_KELUAR_PURPOSES.find((p) => p.purpose === val);
                      if (found) {
                        setTxCategory(found.defaultCategory);
                        setTxCounterAccount(found.defaultDebitCoa);
                      }
                    }
                  }}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white font-semibold"
                >
                  {(txModalType === 'KAS_MASUK'
                    ? KAS_MASUK_SOURCES.map((s) => s.source)
                    : KAS_KELUAR_PURPOSES.map((p) => p.purpose)
                  ).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Kategori *</label>
                <input
                  type="text"
                  required
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl"
                />
              </div>
            </div>

            {/* Nominal dengan Format Ribuan Otomatis */}
            <div>
              <label className="font-bold text-gray-700 block mb-1">
                Nominal (Rp) — Format Ribuan Otomatis *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-gray-500">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={txAmountFormatted}
                  onChange={(e) => setTxAmountFormatted(formatThousandDots(e.target.value))}
                  placeholder="50.000.000"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl font-mono text-base font-extrabold text-gray-900"
                />
              </div>
              <div className="text-[11px] text-emerald-700 italic mt-1">
                Terbilang: # {terbilangRupiah(parseThousandDots(txAmountFormatted))} #
              </div>
            </div>

            {/* Pilih Akun COA (Auto-Jurnal Preview) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
              <div>
                <label className="font-bold text-emerald-950 block mb-1">
                  {txModalType === 'KAS_MASUK'
                    ? 'Akun Debit (Default: Kas/Bank) *'
                    : 'Akun Kredit (Default: Kas/Bank) *'}
                </label>
                <select
                  value={txCashAccount}
                  onChange={(e) => setTxCashAccount(e.target.value)}
                  className="w-full px-3 py-2.5 border border-emerald-300 rounded-xl bg-white font-mono text-xs"
                >
                  {cashBankCoaOptions.map((acc) => (
                    <option key={acc} value={acc}>
                      {acc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-emerald-950 block mb-1">
                  {txModalType === 'KAS_MASUK'
                    ? 'Akun Kredit (Sesuai Kategori) *'
                    : 'Akun Debit (Sesuai Kategori) *'}
                </label>
                <select
                  value={txCounterAccount}
                  onChange={(e) => setTxCounterAccount(e.target.value)}
                  className="w-full px-3 py-2.5 border border-emerald-300 rounded-xl bg-white font-mono text-xs"
                >
                  {allActiveCoaOptions.map((acc) => (
                    <option key={acc} value={acc}>
                      {acc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 text-[11px] font-mono text-emerald-900 bg-white/80 p-2.5 rounded-lg border border-emerald-200">
                <div className="font-bold text-emerald-800 mb-0.5">Preview Auto-Jurnal:</div>
                <div>
                  DEBIT: {txModalType === 'KAS_MASUK' ? txCashAccount : txCounterAccount} —{' '}
                  {formatRupiah(parseThousandDots(txAmountFormatted))}
                </div>
                <div>
                  KREDIT: {txModalType === 'KAS_MASUK' ? txCounterAccount : txCashAccount} —{' '}
                  {formatRupiah(parseThousandDots(txAmountFormatted))}
                </div>
              </div>
            </div>

            {/* Field Opsional Sesuai Jenis */}
            {txModalType === 'KAS_MASUK' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Konsumen (Opsional)
                  </label>
                  <input
                    type="text"
                    list="consumer-list"
                    value={txConsumerName}
                    onChange={(e) => setTxConsumerName(e.target.value)}
                    placeholder="Contoh: Bapak Budi Santoso"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                  <datalist id="consumer-list">
                    {bookings.map((b) => (
                      <option key={b.id} value={b.buyerName} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Unit / Kavling (Opsional)
                  </label>
                  <input
                    type="text"
                    list="kavling-list"
                    value={txUnitCode}
                    onChange={(e) => setTxUnitCode(e.target.value)}
                    placeholder="Contoh: A-01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                  <datalist id="kavling-list">
                    {kavling.slice(0, 30).map((k) => (
                      <option key={k.id} value={k.code} />
                    ))}
                  </datalist>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Supplier (Opsional)
                  </label>
                  <input
                    type="text"
                    list="supplier-list"
                    value={txSupplierName}
                    onChange={(e) => setTxSupplierName(e.target.value)}
                    placeholder="Pilih / ketik nama supplier..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                  <datalist id="supplier-list">
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.name} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Karyawan / Mandor (Opsional)
                  </label>
                  <input
                    type="text"
                    value={txEmployeeName}
                    onChange={(e) => setTxEmployeeName(e.target.value)}
                    placeholder="Contoh: Tim Mandor Pak Ruslan"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="font-bold text-gray-700 block mb-1">Keterangan Transaksi *</label>
              <textarea
                rows={2}
                required
                value={txDescription}
                onChange={(e) => setTxDescription(e.target.value)}
                placeholder={
                  txModalType === 'KAS_MASUK'
                    ? 'Contoh: Terima DP Unit A01 dari Budi Rp50 Juta'
                    : 'Contoh: Bayar gaji karyawan Rp15 Juta'
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">
                Upload Bukti (Foto / PDF, Max 5MB)
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setTxProofFileName(f.name);
                  if (f.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (ev) => setTxProofUrl(String(ev.target?.result || ''));
                    reader.readAsDataURL(f);
                  }
                }}
                className="w-full text-xs border border-gray-300 rounded-xl p-2 bg-gray-50"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTxModalOpen(false)}
                className="px-4 py-2.5 border border-gray-300 rounded-xl font-semibold text-gray-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
              >
                Simpan &amp; Posting Auto-Jurnal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================
          MODAL KONFIRMASI HAPUS TRANSAKSI
      ========================================================= */}
      {deleteTxConfirm && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setDeleteTxConfirm(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-red-600 font-bold text-base">
              <AlertTriangle className="w-5 h-5" />
              <span>Konfirmasi Hapus Transaksi</span>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus transaksi{' '}
              <strong className="font-mono text-gray-900">{deleteTxConfirm.id}</strong> (
              {deleteTxConfirm.description}) senilai{' '}
              <strong>{formatRupiah(deleteTxConfirm.amount)}</strong>? Jurnal otomatis terkait dan saldo COA akan disesuaikan kembali.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTxConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-xl font-semibold text-gray-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const deletedType = deleteTxConfirm.type;
                  deleteCashTransaction(deleteTxConfirm.id);
                  setDeleteTxConfirm(null);
                  toast.success('🗑️ Transaksi & jurnal terkait berhasil dihapus');
                  if (tab === 'DETAIL') {
                    switchFinanceTab(
                      deletedType === 'KAS_MASUK' ? 'KAS_MASUK' : 'KAS_KELUAR',
                      deletedType === 'KAS_MASUK' ? '/keuangan/kas-masuk' : '/keuangan/kas-keluar'
                    );
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl cursor-pointer"
              >
                Ya, Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL TAMBAH / EDIT / DUPLIKAT AKUN COA
      ========================================================= */}
      {coaModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setCoaModalOpen(false)}
        >
          <form
            onSubmit={handleSaveCoaForm}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-3.5 shadow-2xl text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <h3 className="text-base font-bold text-gray-900">
                {coaOriginalCode ? `✏️ Edit Akun COA (${coaOriginalCode})` : '+ Tambah Akun COA Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setCoaModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Kode Akun (Unique) *</label>
                <input
                  type="text"
                  required
                  value={coaCode}
                  onChange={(e) => setCoaCode(e.target.value)}
                  placeholder="Contoh: 1-1110"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Tipe Akun *</label>
                <select
                  value={coaCategory}
                  onChange={(e) => setCoaCategory(e.target.value as CoaItem['category'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white font-semibold"
                >
                  <option value="ASET">Aset</option>
                  <option value="LIABILITAS">Liabilitas</option>
                  <option value="EKUITAS">Ekuitas</option>
                  <option value="PENDAPATAN">Pendapatan</option>
                  <option value="BEBAN">Beban</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Nama Akun *</label>
              <input
                type="text"
                required
                value={coaName}
                onChange={(e) => setCoaName(e.target.value)}
                placeholder="Contoh: Kas PT SDP"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Saldo Normal (Auto)</label>
                <input
                  type="text"
                  readOnly
                  value={coaCategory === 'ASET' || coaCategory === 'BEBAN' ? 'DEBIT' : 'KREDIT'}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-100 font-mono font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Level (1-5)</label>
                <select
                  value={coaLevel}
                  onChange={(e) => setCoaLevel(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white font-mono"
                >
                  <option value={1}>Level 1 (Header Utama)</option>
                  <option value={2}>Level 2 (Grup)</option>
                  <option value={3}>Level 3 (Sub-Grup)</option>
                  <option value={4}>Level 4 (Akun Transaksi)</option>
                  <option value={5}>Level 5 (Sub-Akun Detail)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Parent Akun</label>
                <select
                  value={coaParent}
                  onChange={(e) => setCoaParent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white font-mono text-[11px]"
                >
                  {coa.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Status Akun</label>
                <select
                  value={coaActive ? 'AKTIF' : 'NONAKTIF'}
                  onChange={(e) => setCoaActive(e.target.value === 'AKTIF')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white font-semibold"
                >
                  <option value="AKTIF">Aktif (Muncul di Dropdown)</option>
                  <option value="NONAKTIF">Nonaktif (Disembunyikan)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Saldo Awal / Berjalan (Rp)</label>
              <input
                type="text"
                inputMode="numeric"
                value={coaBalanceFormatted}
                onChange={(e) => setCoaBalanceFormatted(formatThousandDots(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Keterangan</label>
              <input
                type="text"
                value={coaDescription}
                onChange={(e) => setCoaDescription(e.target.value)}
                placeholder="Catatan penggunaan akun..."
                className="w-full px-3 py-2 border border-gray-300 rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
            >
              Simpan Akun COA
            </button>
          </form>
        </div>
      )}

      {/* =========================================================
          MODAL VALIDASI HAPUS AKUN COA (CEK PEMAKAIAN DI JURNAL)
      ========================================================= */}
      {deleteCoaTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setDeleteCoaTarget(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const usedInJournals = journals.filter(
                (j) =>
                  j.debitAccount.startsWith(deleteCoaTarget.code) ||
                  j.creditAccount.startsWith(deleteCoaTarget.code)
              );
              const isUsed = usedInJournals.length > 0;

              return (
                <>
                  <div className="flex items-center gap-2 text-red-600 font-bold text-base">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Hapus Akun COA {deleteCoaTarget.code}</span>
                  </div>

                  {!isUsed ? (
                    <p className="text-gray-600 leading-relaxed">
                      Akun <strong>{deleteCoaTarget.code} — {deleteCoaTarget.name}</strong> belum pernah dipakai di jurnal mana pun. Anda dapat langsung menghapus akun ini.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 space-y-1">
                        <div className="font-bold">
                          ⚠️ Peringatan Validasi: Dipakai di {usedInJournals.length} Jurnal!
                        </div>
                        <p className="text-[11px]">
                          Akun ini sudah memiliki riwayat jurnal. Pilih akun COA pengganti di bawah ini untuk memindahkan jurnal secara otomatis sebelum menghapus (Konfirmasi Ganda):
                        </p>
                      </div>
                      <div>
                        <label className="font-bold text-gray-700 block mb-1">
                          Pindahkan Transaksi Jurnal ke Akun:
                        </label>
                        <select
                          value={migrateTargetCoa}
                          onChange={(e) => setMigrateTargetCoa(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white font-mono"
                        >
                          {allActiveCoaOptions
                            .filter((opt) => !opt.startsWith(deleteCoaTarget.code))
                            .map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setDeleteCoaTarget(null)}
                      className="px-4 py-2 border border-gray-300 rounded-xl font-semibold text-gray-700"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const res = deleteCoaAccount(
                          deleteCoaTarget.code,
                          isUsed ? migrateTargetCoa : undefined
                        );
                        if (!res.ok) {
                          toast.error(res.message);
                          return;
                        }
                        toast.success(res.message);
                        setDeleteCoaTarget(null);
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl cursor-pointer"
                    >
                      {isUsed ? 'Pindahkan Jurnal & Hapus Akun' : 'Hapus Akun Sekarang'}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL IMPORT COA DARI EXCEL
      ========================================================= */}
      {coaImportModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setCoaImportModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <h3 className="text-base font-bold text-gray-900">📥 Import Akun COA dari Excel/CSV</h3>
              <button onClick={() => setCoaImportModalOpen(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-500">
              Format baris: <code>Kode,Nama Akun,Tipe,Level,Saldo Normal,Saldo Awal</code>
            </p>
            <textarea
              rows={5}
              value={coaImportText}
              onChange={(e) => setCoaImportText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl font-mono text-[11px]"
            />
            <button
              type="button"
              onClick={() => {
                const lines = coaImportText
                  .split('\n')
                  .map((l) => l.trim())
                  .filter(Boolean);
                const parsed: CoaItem[] = lines.map((line) => {
                  const p = line.split(',').map((s) => s.trim());
                  return {
                    code: p[0] || `1-${Math.floor(1000 + Math.random() * 8000)}`,
                    name: p[1] || 'Akun Import Baru',
                    category: (['ASET', 'LIABILITAS', 'EKUITAS', 'PENDAPATAN', 'BEBAN'].includes(
                      p[2]
                    )
                      ? p[2]
                      : 'ASET') as CoaItem['category'],
                    level: (Number(p[3]) || 4) as 1 | 2 | 3 | 4 | 5,
                    normalBalance: p[4] === 'KREDIT' ? 'KREDIT' : 'DEBIT',
                    balance: Number(p[5]) || 0,
                    active: true,
                  };
                });
                const added = bulkImportCoa(parsed);
                toast.success(`✅ ${added} Akun COA baru berhasil di-import!`);
                setCoaImportModalOpen(false);
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
            >
              Proses Import COA
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL EDIT / TAMBAH JURNAL MANUAL
      ========================================================= */}
      {editingJournal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setEditingJournal(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editingJournal.id) {
                updateJournalEntry(editingJournal.id, editingJournal);
                toast.success(`✅ Jurnal ${editingJournal.id} berhasil diperbarui`);
              } else {
                addJournalEntry({
                  date: editingJournal.date,
                  companyId: editingJournal.companyId,
                  reference: editingJournal.reference || 'MAN-JRN',
                  description: editingJournal.description,
                  debitAccount: editingJournal.debitAccount,
                  creditAccount: editingJournal.creditAccount,
                  amount: editingJournal.amount,
                  autoGenerated: false,
                });
                toast.success('✅ Jurnal baru berhasil ditambahkan');
              }
              setEditingJournal(null);
            }}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-3.5 shadow-2xl text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <h3 className="text-base font-bold text-gray-900">
                {editingJournal.id ? `✏️ Edit Jurnal ${editingJournal.id}` : '+ Input Jurnal Manual'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingJournal(null)}
                className="text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Tanggal</label>
              <input
                type="date"
                value={editingJournal.date}
                onChange={(e) => setEditingJournal({ ...editingJournal, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Uraian Jurnal *</label>
              <input
                type="text"
                required
                value={editingJournal.description}
                onChange={(e) =>
                  setEditingJournal({ ...editingJournal, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Akun Debit</label>
              <select
                value={editingJournal.debitAccount}
                onChange={(e) =>
                  setEditingJournal({ ...editingJournal, debitAccount: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white font-mono text-[11px]"
              >
                {allActiveCoaOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Akun Kredit</label>
              <select
                value={editingJournal.creditAccount}
                onChange={(e) =>
                  setEditingJournal({ ...editingJournal, creditAccount: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white font-mono text-[11px]"
              >
                {allActiveCoaOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Nominal (Rp)</label>
              <input
                type="text"
                inputMode="numeric"
                value={formatThousandDots(editingJournal.amount)}
                onChange={(e) =>
                  setEditingJournal({
                    ...editingJournal,
                    amount: parseThousandDots(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono font-bold"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
            >
              Simpan Jurnal
            </button>
          </form>
        </div>
      )}

      {/* =========================================================
          MODAL DEPLOY APLIKASI (KHUSUS SUPER ADMIN)
      ========================================================= */}
      {deployModalOpen && currentUser?.role === 'ADMIN' && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setDeployModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-gray-900">
                  Deploy &amp; Publish Modul Keuangan Lengkap
                </h3>
              </div>
              <button onClick={() => setDeployModalOpen(false)} className="text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>7 Fitur Keuangan &amp; Auto-Jurnal Telah Aktif</span>
              </div>
              <p>
                Kas Masuk, Kas Keluar, Detail Transaksi, Dashboard Keuangan, Buku Kas, dan COA CRUD telah siap dipublikasikan.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.origin);
                  toast.success('🔗 URL Aplikasi berhasil disalin!');
                }}
                className="px-4 py-2.5 border border-gray-300 rounded-xl font-semibold text-gray-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Link Aplikasi</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await useAppStore.getState().deployAndPublishLiveState();
                    setDeployModalOpen(false);
                    toast.success('🚀 Modul Keuangan berhasil di-deploy & disinkronkan!');
                  } catch {
                    toast.error('Gagal melakukan deploy');
                  }
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
              >
                Deploy Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
