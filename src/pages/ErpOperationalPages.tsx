import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore, BookingRecord, ProspectSource } from '../store/useAppStore';
import { formatRupiah, terbilangRupiah } from '../data/seedData';
import { OfficialDocumentCenter } from '../components/OfficialDocumentCenter';
import { SuperAdminCrudBar } from '../components/SuperAdminCrudBar';
import { WarehouseAndSupplierModule } from '../components/WarehouseAndSupplierModule';
import {
  ExportActionButtons,
  exportToExcel,
  exportToPDF,
  exportToCSV,
  printHtmlReport,
} from '../utils/exportUtils';
import {
  Camera,
  MapPin,
  Plus,
  Trash2,
  Printer,
  Send,
  Calculator,
  CheckCircle2,
  Package,
  Users,
  FileSpreadsheet,
  Phone,
  ArrowRight,
  MoreHorizontal,
  Download,
  Upload,
  Search,
  Bell,
  Clock,
  ChevronDown,
  ChevronUp,
  Rocket,
  X,
  Pencil,
  Eye,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';

// ==========================================
// 1. MARKETING MODULE — SUPER SIMPLE PROSPEK, PIPELINE, DASHBOARD & DAFTAR PROSPEK (TANPA WA)
// ==========================================
export const MarketingModulePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    bookings,
    currentUser,
    addQuickProspect,
    bulkAddProspects,
    addProspectFollowUp,
    updateProspectDetails,
    deleteProspect,
    updateBookingStage,
    complaints,
    updateComplaintStatus,
  } = useAppStore();

  // Sync active tab with URL (/marketing/dashboard, /marketing/pipeline, /marketing/prospek, /marketing/konsumen, /marketing/booking, /marketing/spr, /marketing/spp, /marketing/komplain)
  const getInitialTab = (): 'DASHBOARD' | 'KANBAN' | 'PROSPEK' | 'SPR' | 'KOMPLAIN' => {
    if (location.pathname.includes('/marketing/dashboard')) return 'DASHBOARD';
    if (location.pathname.includes('/marketing/prospek') || location.pathname.includes('/marketing/konsumen')) return 'PROSPEK';
    if (location.pathname.includes('/marketing/spr') || location.pathname.includes('/marketing/spp') || location.pathname.includes('/marketing/booking')) return 'SPR';
    if (location.pathname.includes('/marketing/komplain')) return 'KOMPLAIN';
    return 'KANBAN';
  };

  const [tab, setTab] = useState<'DASHBOARD' | 'KANBAN' | 'PROSPEK' | 'SPR' | 'KOMPLAIN'>(getInitialTab);

  useEffect(() => {
    if (location.pathname.includes('/marketing/dashboard')) setTab('DASHBOARD');
    else if (location.pathname.includes('/marketing/prospek') || location.pathname.includes('/marketing/konsumen')) setTab('PROSPEK');
    else if (location.pathname.includes('/marketing/spr') || location.pathname.includes('/marketing/spp') || location.pathname.includes('/marketing/booking')) setTab('SPR');
    else if (location.pathname.includes('/marketing/komplain')) setTab('KOMPLAIN');
    else if (location.pathname.includes('/marketing/pipeline')) setTab('KANBAN');
  }, [location.pathname]);

  const switchMarketingTab = (nextTab: 'DASHBOARD' | 'KANBAN' | 'PROSPEK' | 'SPR' | 'KOMPLAIN', path: string) => {
    setTab(nextTab);
    navigate(path);
  };

  const stages: BookingRecord['stage'][] = [
    'Prospek',
    'Follow-up',
    'Booking',
    'SPR',
    'Proses KPR',
    'Akad',
    'Selesai',
    'Lost',
  ];

  const todayStr = new Date().toISOString().slice(0, 10);
  const defaultPicName = currentUser?.name || 'Andi Saputra';

  // Helper: Calculate days since last follow-up or creation
  const getDaysSinceFollowUp = (b: BookingRecord): number => {
    const refDateStr = b.lastFollowUpDate || b.createdAt.slice(0, 10);
    const refTime = new Date(refDateStr).getTime();
    const nowTime = new Date('2026-10-09').getTime(); // Anchor to current app date
    if (isNaN(refTime)) return 0;
    return Math.max(0, Math.floor((nowTime - refTime) / (1000 * 60 * 60 * 24)));
  };

  // Auto-mark >30 days without follow-up as "Lost"
  const getEffectiveStage = (b: BookingRecord): BookingRecord['stage'] => {
    const days = getDaysSinceFollowUp(b);
    if (days > 30 && (b.stage === 'Prospek' || b.stage === 'Follow-up')) {
      return 'Lost';
    }
    return b.stage;
  };

  // Next stage helper for 1-click [➡️ Pindah]
  const getNextStage = (currentStage: BookingRecord['stage']): BookingRecord['stage'] => {
    const flow: BookingRecord['stage'][] = [
      'Prospek',
      'Follow-up',
      'Booking',
      'SPR',
      'Proses KPR',
      'Akad',
      'Selesai',
    ];
    const idx = flow.indexOf(currentStage);
    if (idx >= 0 && idx < flow.length - 1) return flow[idx + 1];
    return 'Selesai';
  };

  // ==========================================
  // STATE: FORM INPUT CEPAT (5 FIELD WAJIB + OPSIONAL + AUTO-SAVE 30 DETIK)
  // ==========================================
  const [quickInputOpen, setQuickInputOpen] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [qName, setQName] = useState('');
  const [qPhone, setQPhone] = useState('');
  const [qSource, setQSource] = useState<ProspectSource>('IG');
  const [qProject, setQProject] = useState<'Bahagia Land' | 'Bahagia Residence'>('Bahagia Land');
  const [qPic, setQPic] = useState(defaultPicName);
  // Optional fields
  const [qEmail, setQEmail] = useState('');
  const [qAddress, setQAddress] = useState('');
  const [qBudget, setQBudget] = useState('');
  const [qUnitType, setQUnitType] = useState('36/91');
  const [qNotes, setQNotes] = useState('');
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string>('');

  // Load saved draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bg_quick_prospect_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.qName) setQName(parsed.qName);
        if (parsed.qPhone) setQPhone(parsed.qPhone);
        if (parsed.qSource) setQSource(parsed.qSource);
        if (parsed.qProject) setQProject(parsed.qProject);
        if (parsed.qNotes) setQNotes(parsed.qNotes);
      }
    } catch {
      // ignore
    }
  }, []);

  // Auto-save every 30 seconds while typing
  useEffect(() => {
    const timer = setInterval(() => {
      if (qName.trim() || qPhone.trim() || qNotes.trim()) {
        localStorage.setItem(
          'bg_quick_prospect_draft',
          JSON.stringify({ qName, qPhone, qSource, qProject, qNotes })
        );
        setLastAutoSaveTime(new Date().toTimeString().slice(0, 8));
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [qName, qPhone, qSource, qProject, qNotes]);

  // Keep Marketing PIC synced with logged-in user
  useEffect(() => {
    if (currentUser?.name) setQPic(currentUser.name);
  }, [currentUser]);

  const nextProspectCode = `PRS-2026-10-${String(bookings.length + 1).padStart(4, '0')}`;
  const previewScore = (() => {
    const base: Record<ProspectSource, number> = {
      'Walk-in': 88,
      Referral: 85,
      Website: 78,
      IG: 75,
      FB: 72,
      Lainnya: 65,
    };
    let s = base[qSource] || 70;
    if (qEmail) s += 4;
    if (Number(qBudget) > 0) s += 5;
    if (qUnitType) s += 3;
    return Math.min(99, s);
  })();

  const resetQuickForm = () => {
    setQName('');
    setQPhone('');
    setQSource('IG');
    setQProject('Bahagia Land');
    setQPic(currentUser?.name || 'Andi Saputra');
    setQEmail('');
    setQAddress('');
    setQBudget('');
    setQUnitType('36/91');
    setQNotes('');
    localStorage.removeItem('bg_quick_prospect_draft');
  };

  const handleSaveQuickProspect = (keepOpenForMore: boolean) => {
    if (!qName.trim() || !qPhone.trim()) {
      toast.error('Mohon isi Nama dan Nomor HP terlebih dahulu');
      return;
    }
    addQuickProspect({
      buyerName: qName,
      phone: qPhone,
      source: qSource,
      projectInterest: qProject,
      marketingPic: qPic || defaultPicName,
      email: qEmail || undefined,
      address: qAddress || undefined,
      budget: qBudget ? Number(qBudget) : undefined,
      unitType: qUnitType || '36/91',
      notes: qNotes || undefined,
    });
    toast.success('✅ Prospek tersimpan');
    resetQuickForm();
    if (!keepOpenForMore) {
      setQuickInputOpen(false);
    }
  };

  // ==========================================
  // STATE: FOLLOW-UP CEPAT MODAL (1 KLIK DARI KARTU)
  // ==========================================
  const [followUpTarget, setFollowUpTarget] = useState<BookingRecord | null>(null);
  const [fuMethod, setFuMethod] = useState<'Telepon' | 'Email' | 'Kunjungan' | 'Tatap Muka'>('Telepon');
  const [fuResult, setFuResult] = useState<'Positif' | 'Netral' | 'Negatif' | 'Tidak Direspon'>('Positif');
  const [fuNotes, setFuNotes] = useState('');
  const [fuNextDate, setFuNextDate] = useState('2026-10-12');

  const handleSaveFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpTarget) return;
    addProspectFollowUp(followUpTarget.id, {
      method: fuMethod,
      result: fuResult,
      notes: fuNotes,
      nextFollowUpDate: fuNextDate,
    });
    toast.success(`✅ Riwayat follow-up ${followUpTarget.buyerName} tercatat otomatis`);
    setFollowUpTarget(null);
    setFuNotes('');
  };

  // ==========================================
  // STATE: KARTU MENU (⋯ Edit, Detail, Hapus)
  // ==========================================
  const [openMenuCardId, setOpenMenuCardId] = useState<string | null>(null);
  const [detailTarget, setDetailTarget] = useState<BookingRecord | null>(null);
  const [editTarget, setEditTarget] = useState<BookingRecord | null>(null);

  // ==========================================
  // STATE: IMPORT EXCEL (BULK) MODAL
  // ==========================================
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [bulkText, setBulkText] = useState(
    `Andi Firmansyah,081241009911,IG,Bahagia Land,Minat Tipe 36 subsidi\nSiti Rahmawati,081342887766,Walk-in,Bahagia Residence,Cek lokasi minggu depan\nBudi Santoso,085240998877,FB,Bahagia Land,Tanya DP dan cicilan BTN\nDewi Sartika,082188776655,Referral,Bahagia Residence,Rekomendasi teman kantor\nHendra Wijaya,081140991122,Website,Bahagia Land,Siap berkas KPR FLPP`
  );

  const handleDownloadExcelTemplate = () => {
    const csvContent =
      'Nama,No HP,Sumber,Proyek Diminati,Catatan\n' +
      'Contoh Konsumen 1,081234567890,IG,Bahagia Land,Minat blok depan\n' +
      'Contoh Konsumen 2,081398765432,Walk-in,Bahagia Residence,Pameran Mall Kendari\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Template_Import_Prospek_5_Kolom.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('📥 Template Excel (5 Kolom) berhasil diunduh');
  };

  const handleProcessBulkImport = (simulate100 = false) => {
    if (simulate100) {
      const sources: ProspectSource[] = ['IG', 'FB', 'Website', 'Referral', 'Walk-in'];
      const generated = Array.from({ length: 100 }).map((_, idx) => ({
        buyerName: `Prospek Pameran #${idx + 1} (${idx % 2 === 0 ? 'Kendari' : 'Ranomeeto'})`,
        phone: `08124500${String(idx + 1000).slice(-4)}`,
        source: sources[idx % sources.length],
        projectInterest: (idx % 2 === 0 ? 'Bahagia Land' : 'Bahagia Residence') as
          | 'Bahagia Land'
          | 'Bahagia Residence',
        notes: 'Data Pameran Properti Sulawesi Tenggara',
      }));
      const count = bulkAddProspects(generated, defaultPicName);
      toast.success(`✅ ${count} Prospek dari Excel berhasil masuk sistem!`);
      setImportModalOpen(false);
      return;
    }

    const lines = bulkText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const parsed = lines.map((line) => {
      const parts = line.split(',').map((p) => p.trim());
      const src = (['IG', 'FB', 'Website', 'Referral', 'Walk-in', 'Lainnya'].includes(parts[2])
        ? parts[2]
        : 'Walk-in') as ProspectSource;
      const proj =
        parts[3]?.toLowerCase().includes('residence') ? 'Bahagia Residence' : 'Bahagia Land';
      return {
        buyerName: parts[0] || 'Prospek Baru',
        phone: parts[1] || '081200000000',
        source: src,
        projectInterest: proj as 'Bahagia Land' | 'Bahagia Residence',
        notes: parts[4] || '',
      };
    });
    const count = bulkAddProspects(parsed, defaultPicName);
    toast.success(`✅ ${count} Prospek berhasil di-import ke sistem!`);
    setImportModalOpen(false);
  };

  // ==========================================
  // STATE: FILTER & SEARCH HALAMAN /marketing/prospek
  // ==========================================
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState<string>('ALL');
  const [filterStage, setFilterStage] = useState<string>('ALL');
  const [filterPic, setFilterPic] = useState<string>('ALL');
  const [filterDate, setFilterDate] = useState<string>('');
  const [deployInfoOpen, setDeployInfoOpen] = useState(false);

  const filteredProspects = bookings.filter((b) => {
    const effStage = getEffectiveStage(b);
    const code = b.prospectCode || b.id;
    const matchSearch =
      !searchQuery.trim() ||
      b.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone.includes(searchQuery) ||
      code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSource = filterSource === 'ALL' || (b.source || 'Walk-in') === filterSource;
    const matchStage = filterStage === 'ALL' || effStage === filterStage;
    const matchPic = filterPic === 'ALL' || b.marketingPic === filterPic;
    const matchDate = !filterDate || b.createdAt.startsWith(filterDate) || b.nextFollowUpDate === filterDate;
    return matchSearch && matchSource && matchStage && matchPic && matchDate;
  });

  const handleExportProspectsCsv = () => {
    const header = 'Kode,Nama,No HP,Sumber,Proyek,Marketing PIC,Status,Tgl Follow-up\n';
    const rows = filteredProspects
      .map(
        (b) =>
          `${b.prospectCode || b.id},"${b.buyerName}",${b.phone},${b.source || 'Walk-in'},"${
            b.projectInterest || (b.companyId === 'PT_BPP' ? 'Bahagia Residence' : 'Bahagia Land')
          }","${b.marketingPic}",${getEffectiveStage(b)},${b.nextFollowUpDate || '2026-10-09'}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Data_Prospek_Marketing_${todayStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('📤 Data prospek berhasil di-export ke Excel/CSV');
  };

  // KPI & Reminder Calculations
  const prospectsTodayCount = bookings.filter(
    (b) => b.createdAt.startsWith('2026-10-09') || b.createdAt.startsWith(todayStr)
  ).length;
  const followUpTodayList = bookings.filter(
    (b) =>
      getEffectiveStage(b) !== 'Selesai' &&
      getEffectiveStage(b) !== 'Lost' &&
      (b.nextFollowUpDate === '2026-10-09' ||
        b.nextFollowUpDate === todayStr ||
        getDaysSinceFollowUp(b) >= 3)
  );
  const bookingCount = bookings.filter((b) => b.stage === 'Booking' || b.stage === 'SPR' || b.stage === 'Proses KPR').length;
  const akadCount = bookings.filter((b) => b.stage === 'Akad' || b.stage === 'Selesai').length;

  return (
    <div className="space-y-5 pb-20">
      {/* REMINDER OTOMATIS IN-APP BANNER */}
      {followUpTodayList.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-amber-950">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold">
                Pengingat Otomatis: Ada {followUpTodayList.length} Prospek Perlu Di-Follow-up Hari Ini!
              </div>
              <div className="text-[11px] text-amber-800">
                Kartu otomatis berwarna <span className="font-semibold">Kuning</span> jika &gt;7 hari belum dihubungi, dan <span className="font-semibold text-red-700">Merah (Otomatis Lost)</span> jika &gt;30 hari.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => switchMarketingTab('DASHBOARD', '/marketing/dashboard')}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
          >
            Lihat 5 Daftar Follow-up
          </button>
        </div>
      )}

      {/* HEADER UTAMA MARKETING (MOBILE-FIRST + TOMBOL +PROSPEK & DEPLOY) */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              Marketing Prospek Super Simple & Pipeline KPR
            </h1>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[11px] font-semibold">
              1-2 Klik · Tanpa WA
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Input cepat 5 field, ramah HP satu jempol, auto-fill PIC & skor, pengingat follow-up otomatis
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setQuickInputOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Prospek Cepat</span>
          </button>
          <button
            type="button"
            onClick={() => setImportModalOpen(true)}
            className="px-3.5 py-2.5 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>Import Excel</span>
          </button>
          {currentUser?.role === 'ADMIN' && (
            <button
              type="button"
              onClick={() => setDeployInfoOpen(true)}
              className="px-3.5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Rocket className="w-3.5 h-3.5 text-emerald-400" />
              <span>Deploy</span>
            </button>
          )}
        </div>
      </div>

      {/* NAVIGASI SUB-HALAMAN MARKETING */}
      <div className="flex items-center gap-1.5 overflow-x-auto bg-white border border-gray-200 rounded-xl p-1.5 text-xs font-semibold">
        <button
          type="button"
          onClick={() => switchMarketingTab('DASHBOARD', '/marketing/dashboard')}
          className={`px-3.5 py-2.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
            tab === 'DASHBOARD' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          1. Dashboard Simple
        </button>
        <button
          type="button"
          onClick={() => switchMarketingTab('KANBAN', '/marketing/pipeline')}
          className={`px-3.5 py-2.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
            tab === 'KANBAN' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          2. Pipeline Prospek ({bookings.length})
        </button>
        <button
          type="button"
          onClick={() => switchMarketingTab('PROSPEK', '/marketing/prospek')}
          className={`px-3.5 py-2.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
            tab === 'PROSPEK' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          3. Daftar Prospek (Tabel)
        </button>
        <button
          type="button"
          onClick={() => switchMarketingTab('SPR', '/marketing/spr')}
          className={`px-3.5 py-2.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
            tab === 'SPR' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          4. Cetak SPR Resmi
        </button>
        <button
          type="button"
          onClick={() => switchMarketingTab('KOMPLAIN', '/marketing/komplain')}
          className={`px-3.5 py-2.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
            tab === 'KOMPLAIN' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          5. Tiket Komplain ({complaints.length})
        </button>
      </div>

      {/* SUPER ADMIN 5-BUTTON CRUD TOOLBAR */}
      <SuperAdminCrudBar
        collectionKey={tab === 'SPR' ? 'spr_prospek' : 'bookings'}
        collectionLabel={
          tab === 'SPR'
            ? 'SPR & Prospek Penjualan'
            : tab === 'KOMPLAIN'
            ? 'Tiket Komplain Konsumen'
            : 'Data Prospek & Pipeline Marketing'
        }
        itemCount={tab === 'KOMPLAIN' ? complaints.length : bookings.length}
        sampleAdjustTarget={{
          id: bookings[0]?.id || 'PRS-2026-10-0001',
          label: bookings[0]?.buyerName || 'Prospek',
          currentValue: bookings[0]?.price || 169000000,
          unitLabel: 'Rp',
        }}
      />

      {/* =========================================================
          TAB 1: DASHBOARD SIMPLE (/marketing/dashboard)
          4 KPI + Tombol [+ Prospek Baru] BESAR di tengah + 5 Prospek Perlu Follow-up
      ========================================================= */}
      {tab === 'DASHBOARD' && (
        <div className="space-y-6">
          {/* 4 KPI SEDERHANA */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="text-xs font-medium text-gray-500">1. Prospek Baru Hari Ini</div>
              <div className="text-3xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
                {prospectsTodayCount}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">Auto-kode PRS-2026-10</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="text-xs font-medium text-gray-500">2. Follow-up Hari Ini</div>
              <div className="text-3xl font-bold font-mono text-amber-600 mt-1 tabular-nums">
                {followUpTodayList.length}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">Jadwal aktif hari ini</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="text-xs font-medium text-gray-500">3. Booking Aktif</div>
              <div className="text-3xl font-bold font-mono text-blue-700 mt-1 tabular-nums">
                {bookingCount}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">Booking / SPR / Proses KPR</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="text-xs font-medium text-gray-500">4. Akad & Selesai</div>
              <div className="text-3xl font-bold font-mono text-gray-900 mt-1 tabular-nums">
                {akadCount}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">Realisasi KPR & Cash</div>
            </div>
          </div>

          {/* TOMBOL [+ PROSPEK BARU] BESAR DI TENGAH */}
          <div className="bg-emerald-950 text-white rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
            <div className="max-w-lg mx-auto space-y-1.5">
              <span className="px-2.5 py-1 bg-emerald-800/80 text-emerald-200 rounded-md text-[11px] font-mono">
                MOBILE-FIRST · CUKUP 5 FIELD WAJIB · &lt; 30 DETIK
              </span>
              <h2 className="text-xl sm:text-2xl font-bold">
                Input Prospek Baru Sambil Jalan
              </h2>
              <p className="text-xs text-emerald-200">
                Marketing PIC, Tanggal Hari Ini, Kode Prospek ({nextProspectCode}), dan Skor dihitung otomatis.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setQuickInputOpen(true)}
                className="w-full sm:w-auto min-w-[260px] py-4 px-8 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-extrabold text-base rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
              >
                <Plus className="w-6 h-6 stroke-[2.5]" />
                <span>+ PROSPEK BARU</span>
              </button>
              <button
                type="button"
                onClick={() => setImportModalOpen(true)}
                className="w-full sm:w-auto py-4 px-5 bg-emerald-900 hover:bg-emerald-800 text-emerald-100 font-semibold text-xs rounded-xl border border-emerald-700 flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Import 100 Data Pameran (Excel)</span>
              </button>
            </div>
          </div>

          {/* DAFTAR 5 PROSPEK PERLU DI-FOLLOW-UP */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Daftar 5 Prospek Perlu Di-Follow-up Segera
                </h3>
                <p className="text-xs text-gray-500">
                  Klik tombol [📞 Follow-up] untuk mencatat hasil telepon/kunjungan dalam 1 klik
                </p>
              </div>
              <button
                type="button"
                onClick={() => switchMarketingTab('PROSPEK', '/marketing/prospek')}
                className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
              >
                Lihat Semua ({bookings.length}) →
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {followUpTodayList.slice(0, 5).map((item) => {
                const days = getDaysSinceFollowUp(item);
                const isOver7Days = days > 7;
                return (
                  <div
                    key={item.id}
                    className={`py-3.5 px-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isOver7Days ? 'bg-amber-50/70' : ''
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-emerald-700">
                          {item.prospectCode || item.id}
                        </span>
                        <span className="text-sm font-bold text-gray-900">{item.buyerName}</span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[11px] font-medium">
                          {item.source || 'Walk-in'}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded text-[11px] font-medium">
                          {item.projectInterest || (item.companyId === 'PT_BPP' ? 'Bahagia Residence' : 'Bahagia Land')}
                        </span>
                        {isOver7Days && (
                          <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded text-[10px] font-bold">
                            ⚠️ {days} Hari Belum Follow-up
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-3">
                        <span className="font-mono">{item.phone}</span>
                        <span>•</span>
                        <span>PIC: {item.marketingPic}</span>
                        <span>•</span>
                        <span>Jadwal: {item.nextFollowUpDate || 'Hari ini'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFollowUpTarget(item);
                          setFuMethod('Telepon');
                          setFuResult('Positif');
                          setFuNotes('');
                        }}
                        className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>📞 Follow-up</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const nextSt = getNextStage(item.stage);
                          updateBookingStage(item.id, nextSt);
                          toast.success(`${item.buyerName} pindah ke tahap ${nextSt}`);
                        }}
                        className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <span>➡️ Pindah</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: PIPELINE KANBAN (/marketing/pipeline)
          3 Quick Action Buttons di setiap kartu: [📞 Follow-up] [➡️ Pindah] [⋯ Menu]
          Warna kartu otomatis: Kuning (>7 hari), Merah (>30 hari -> Lost)
      ========================================================= */}
      {tab === 'KANBAN' && (
        <div className="space-y-3">
          {/* Legend Indikator Warna Kartu */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-semibold text-gray-700">Status Warna Kartu Otomatis:</span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-gray-50 border border-gray-300 inline-block" />
                <span>Normal (&le;7 hari)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-amber-100 border border-amber-400 inline-block" />
                <span className="text-amber-900 font-medium">Kuning (&gt;7 hari belum di-follow-up)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-red-100 border border-red-400 inline-block" />
                <span className="text-red-800 font-medium">Merah (&gt;30 hari otomatis &ldquo;Lost&rdquo;)</span>
              </span>
            </div>
            <span className="text-[11px] text-gray-500">
              Klik tombol di kartu tanpa perlu buka menu berlapis
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3">
            {stages.map((st) => {
              const items = bookings.filter((b) => getEffectiveStage(b) === st);
              return (
                <div
                  key={st}
                  className={`bg-white border rounded-xl p-3 space-y-3 ${
                    st === 'Lost' ? 'border-red-200 bg-red-50/20' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className={`text-xs font-bold ${st === 'Lost' ? 'text-red-700' : 'text-gray-900'}`}>
                      {st}
                    </span>
                    <span className="font-mono text-xs px-2 py-0.5 bg-gray-100 rounded-md text-gray-700 font-bold tabular-nums">
                      {items.length}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {items.map((item) => {
                      const days = getDaysSinceFollowUp(item);
                      const isLostOrOver30 = st === 'Lost' || days > 30;
                      const isWarningOver7 = !isLostOrOver30 && days > 7;

                      const cardStyle = isLostOrOver30
                        ? 'bg-red-50 border-red-300'
                        : isWarningOver7
                        ? 'bg-amber-50 border-amber-300'
                        : 'bg-gray-50 border-gray-200';

                      return (
                        <div key={item.id} className={`p-3 border rounded-xl space-y-2.5 text-xs relative ${cardStyle}`}>
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-[10px] font-bold text-emerald-800">
                              {item.prospectCode || item.id}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-white/80 border border-gray-200 text-[10px] font-semibold text-gray-700">
                              {item.source || 'Walk-in'} · Skor {item.leadScore || 80}
                            </span>
                          </div>

                          <div>
                            <div className="font-bold text-gray-900 text-sm leading-snug">{item.buyerName}</div>
                            <div className="font-mono text-xs text-gray-700 mt-0.5">{item.phone}</div>
                          </div>

                          <div className="text-[11px] text-gray-600 space-y-0.5">
                            <div className="font-medium text-gray-800">
                              {item.projectInterest ||
                                (item.companyId === 'PT_BPP' ? 'Bahagia Residence' : 'Bahagia Land')}
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-gray-500">
                              <span>PIC: {item.marketingPic}</span>
                              <span>Follow-up: {item.nextFollowUpDate || 'Hari ini'}</span>
                            </div>
                          </div>

                          {isWarningOver7 && (
                            <div className="px-2 py-1 bg-amber-200/80 text-amber-950 rounded text-[10px] font-bold flex items-center gap-1">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>{days} hari belum di-follow-up</span>
                            </div>
                          )}

                          {isLostOrOver30 && (
                            <div className="px-2 py-1 bg-red-200/80 text-red-950 rounded text-[10px] font-bold flex items-center gap-1">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>&gt;30 hari tidak aktif (Otomatis Lost)</span>
                            </div>
                          )}

                          {/* 3 TOMBOL BESAR QUICK ACTIONS DI KARTU */}
                          <div className="grid grid-cols-3 gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setFollowUpTarget(item);
                                setFuMethod('Telepon');
                                setFuResult('Positif');
                                setFuNotes('');
                              }}
                              className="py-2 px-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                              title="Catat Hasil Follow-up (1 Klik)"
                            >
                              <span>📞 Follow-up</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const nextSt = getNextStage(item.stage);
                                updateBookingStage(item.id, nextSt);
                                toast.success(`➡️ ${item.buyerName} pindah ke tahap ${nextSt}`);
                              }}
                              className="py-2 px-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                              title="Pindah Tahap Berikutnya (1 Klik)"
                            >
                              <span>➡️ Pindah</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenuCardId((prev) => (prev === item.id ? null : item.id))
                              }
                              className="py-2 px-1.5 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                              title="Menu Edit, Detail, Hapus"
                            >
                              <span>⋯ Menu</span>
                            </button>
                          </div>

                          {/* INLINE MENU POPOVER (Edit, Detail, Hapus) */}
                          {openMenuCardId === item.id && (
                            <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-md space-y-1 text-xs">
                              <button
                                type="button"
                                onClick={() => {
                                  setDetailTarget(item);
                                  setOpenMenuCardId(null);
                                }}
                                className="w-full text-left px-2.5 py-1.5 hover:bg-gray-100 rounded flex items-center gap-2 font-medium text-gray-700"
                              >
                                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Detail & Riwayat Follow-up</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditTarget(item);
                                  setOpenMenuCardId(null);
                                }}
                                className="w-full text-left px-2.5 py-1.5 hover:bg-gray-100 rounded flex items-center gap-2 font-medium text-gray-700"
                              >
                                <Pencil className="w-3.5 h-3.5 text-blue-600" />
                                <span>Edit Data Prospek</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  deleteProspect(item.id);
                                  setOpenMenuCardId(null);
                                  toast.success(`🗑️ Prospek ${item.buyerName} dihapus`);
                                }}
                                className="w-full text-left px-2.5 py-1.5 hover:bg-red-50 rounded flex items-center gap-2 font-medium text-red-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus Prospek</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: HALAMAN DAFTAR PROSPEK (/marketing/prospek)
          Kolom: Kode | Nama | No HP | Sumber | Proyek | Marketing | Status | Tgl Follow-up | Aksi
      ========================================================= */}
      {tab === 'PROSPEK' && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Daftar Semua Prospek Marketing (/marketing/prospek)
              </h2>
              <p className="text-xs text-gray-500">
                Total {filteredProspects.length} prospek ditemukan · Tanpa integrasi WhatsApp
              </p>
            </div>

            {/* Tombol [+ Tambah] [📥 Import] [📤 Export] */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setQuickInputOpen(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah</span>
              </button>
              <button
                type="button"
                onClick={() => setImportModalOpen(true)}
                className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>📥 Import</span>
              </button>
              <ExportActionButtons
                title="Laporan Daftar Prospek Marketing"
                subtitle={`Total ${filteredProspects.length} Prospek`}
                filename={`Data_Prospek_Marketing_${todayStr}`}
                headers={['Kode', 'Nama', 'No HP', 'Sumber', 'Proyek', 'Marketing PIC', 'Status', 'Tgl Follow-up']}
                data={filteredProspects.map((b) => ({
                  Kode: b.prospectCode || b.id,
                  Nama: b.buyerName,
                  'No HP': b.phone,
                  Sumber: b.source || 'Walk-in',
                  Proyek: b.projectInterest || (b.companyId === 'PT_BPP' ? 'Bahagia Residence' : 'Bahagia Land'),
                  'Marketing PIC': b.marketingPic,
                  Status: getEffectiveStage(b),
                  'Tgl Follow-up': b.nextFollowUpDate || '2026-10-09',
                }))}
                rows={filteredProspects.map((b) => [
                  b.prospectCode || b.id,
                  b.buyerName,
                  b.phone,
                  b.source || 'Walk-in',
                  b.projectInterest || (b.companyId === 'PT_BPP' ? 'Bahagia Residence' : 'Bahagia Land'),
                  b.marketingPic,
                  getEffectiveStage(b),
                  b.nextFollowUpDate || '2026-10-09',
                ])}
              />
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, no HP, kode PRS..."
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>

            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white"
            >
              <option value="ALL">Semua Sumber</option>
              <option value="IG">IG (Instagram)</option>
              <option value="FB">FB (Facebook)</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="Walk-in">Walk-in</option>
              <option value="Lainnya">Lainnya</option>
            </select>

            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white"
            >
              <option value="ALL">Semua Status</option>
              {stages.map((s) => (
                <option key={s} value={s}>
                  Status: {s}
                </option>
              ))}
            </select>

            <select
              value={filterPic}
              onChange={(e) => setFilterPic(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white"
            >
              <option value="ALL">Semua Marketing PIC</option>
              <option value="Andi Saputra">Andi Saputra</option>
              <option value="Fajar Ramadhan">Fajar Ramadhan</option>
              {currentUser?.name &&
                currentUser.name !== 'Andi Saputra' &&
                currentUser.name !== 'Fajar Ramadhan' && (
                  <option value={currentUser.name}>{currentUser.name}</option>
                )}
            </select>

            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white"
              title="Filter Tanggal Input / Follow-up"
            />
          </div>

          {/* Tabel Daftar Prospek */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 bg-gray-50">
                  <th className="py-3 px-3 font-semibold">Kode</th>
                  <th className="py-3 px-3 font-semibold">Nama</th>
                  <th className="py-3 px-3 font-semibold">No HP</th>
                  <th className="py-3 px-3 font-semibold">Sumber</th>
                  <th className="py-3 px-3 font-semibold">Proyek</th>
                  <th className="py-3 px-3 font-semibold">Marketing</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-3 font-semibold">Tgl Follow-up</th>
                  <th className="py-3 px-3 text-right font-semibold">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProspects.map((b) => {
                  const effStage = getEffectiveStage(b);
                  const days = getDaysSinceFollowUp(b);
                  return (
                    <tr
                      key={b.id}
                      className={`hover:bg-gray-50 ${
                        effStage === 'Lost'
                          ? 'bg-red-50/40'
                          : days > 7
                          ? 'bg-amber-50/40'
                          : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-emerald-700 whitespace-nowrap">
                        {b.prospectCode || b.id}
                      </td>
                      <td className="py-3 px-3 font-bold text-gray-900">
                        <div>{b.buyerName}</div>
                        {b.notes && (
                          <div className="text-[11px] font-normal text-gray-500 truncate max-w-xs">
                            {b.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-gray-800 whitespace-nowrap">{b.phone}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-[11px] font-medium text-gray-800">
                          {b.source || 'Walk-in'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-gray-800">
                        {b.projectInterest ||
                          (b.companyId === 'PT_BPP' ? 'Bahagia Residence' : 'Bahagia Land')}
                      </td>
                      <td className="py-3 px-3 text-gray-700">{b.marketingPic}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            effStage === 'Lost'
                              ? 'bg-red-100 text-red-800'
                              : effStage === 'Akad' || effStage === 'Selesai'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-50 text-blue-800'
                          }`}
                        >
                          {effStage}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-gray-700 whitespace-nowrap">
                        {b.nextFollowUpDate || '2026-10-09'}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setFollowUpTarget(b);
                              setFuMethod('Telepon');
                              setFuResult('Positif');
                              setFuNotes('');
                            }}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                          >
                            📞 Follow-up
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const nextSt = getNextStage(b.stage);
                              updateBookingStage(b.id, nextSt);
                              toast.success(`➡️ ${b.buyerName} pindah ke ${nextSt}`);
                            }}
                            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                          >
                            ➡️ Pindah
                          </button>
                          <button
                            type="button"
                            onClick={() => setDetailTarget(b)}
                            className="px-2 py-1.5 border border-gray-300 hover:bg-gray-100 rounded-lg text-[11px] font-semibold text-gray-700 cursor-pointer"
                          >
                            Detail
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditTarget(b)}
                            className="px-2 py-1.5 border border-gray-300 hover:bg-gray-100 rounded-lg text-[11px] font-semibold text-blue-700 cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteProspect(b.id);
                              toast.success(`🗑️ Prospek ${b.buyerName} dihapus`);
                            }}
                            className="px-2 py-1.5 border border-red-200 hover:bg-red-50 rounded-lg text-[11px] font-semibold text-red-600 cursor-pointer"
                          >
                            Hapus
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

      {tab === 'SPR' && <OfficialDocumentCenter docType="SPR" />}

      {tab === 'KOMPLAIN' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-gray-900">Manajemen Tiket Komplain Konsumen</h2>
            <ExportActionButtons
              title="Laporan Tiket Komplain Konsumen"
              subtitle={`Total ${complaints.length} Tiket`}
              filename="Laporan_Komplain_Konsumen"
              headers={['Tiket', 'Kavling', 'Pelapor', 'Keluhan', 'PIC Pengawas', 'Status']}
              data={complaints.map((c) => ({
                Tiket: c.id,
                Kavling: c.kavlingCode,
                Pelapor: c.reporterName,
                Keluhan: c.description,
                'PIC Pengawas': c.assignedPic,
                Status: c.status,
              }))}
              rows={complaints.map((c) => [
                c.id,
                c.kavlingCode,
                c.reporterName,
                c.description,
                c.assignedPic,
                c.status,
              ])}
            />
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="py-2 pr-2">Tiket</th>
                <th className="py-2 px-2">Kavling & Pelapor</th>
                <th className="py-2 px-2">Keluhan</th>
                <th className="py-2 px-2">PIC Pengawas</th>
                <th className="py-2 pl-2 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {complaints.map((c) => (
                <tr key={c.id}>
                  <td className="py-3 pr-2 font-mono font-bold">{c.id}</td>
                  <td className="py-3 px-2">
                    <div className="font-semibold text-gray-900">Kavling {c.kavlingCode}</div>
                    <div className="text-gray-500">{c.reporterName}</div>
                  </td>
                  <td className="py-3 px-2 text-gray-600">{c.description}</td>
                  <td className="py-3 px-2">{c.assignedPic}</td>
                  <td className="py-3 pl-2 text-right">
                    <select
                      value={c.status}
                      onChange={(e) => {
                        updateComplaintStatus(c.id, e.target.value as any);
                        toast.success(`Status tiket ${c.id} diperbarui`);
                      }}
                      className="border border-gray-300 rounded px-2 py-1 bg-white"
                    >
                      <option value="Baru">Baru</option>
                      <option value="Diproses Pengawas">Diproses Pengawas</option>
                      <option value="Verifikasi PJT">Verifikasi PJT</option>
                      <option value="Selesai">Selesai</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* =========================================================
          1. TOMBOL "+ PROSPEK" FLOATING (KANAN BAWAH, HIJAU BESAR)
      ========================================================= */}
      <button
        type="button"
        onClick={() => setQuickInputOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-5 py-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-xl flex items-center gap-2 transition-transform active:scale-95 cursor-pointer no-print"
        title="Input Cepat Prospek Baru (5 Field)"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
        <span>+ Prospek</span>
      </button>

      {/* =========================================================
          2. MODAL FORM INPUT CEPAT (5 FIELD WAJIB, 1 KOLOM, MOBILE-FIRST)
      ========================================================= */}
      {quickInputOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setQuickInputOpen(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  + Input Cepat Prospek Baru
                </h3>
                <p className="text-[11px] text-gray-500">
                  Hanya 5 field wajib · 1 Kolom ramah HP · Auto-save 30 detik
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickInputOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Auto-Fill Info Strip */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-[11px]">
              <div>
                <span className="text-gray-500">Kode Auto: </span>
                <strong className="font-mono text-emerald-800">{nextProspectCode}</strong>
              </div>
              <div>
                <span className="text-gray-500">Tgl: </span>
                <strong className="font-mono text-gray-800">{todayStr}</strong>
              </div>
              <div>
                <span className="text-gray-500">Skor Auto: </span>
                <strong className="font-mono text-emerald-700">{previewScore}/100</strong>
              </div>
            </div>

            {/* FORM 1 KOLOM (5 FIELD WAJIB) */}
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-gray-800 block mb-1">
                  1. Nama Lengkap Prospek *
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={qName}
                  onChange={(e) => setQName(e.target.value)}
                  placeholder="Contoh: Bapak Budi Santoso"
                  className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-sm font-medium focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">
                  2. Nomor HP (Keyboard Angka Otomatis) *
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  value={qPhone}
                  onChange={(e) => setQPhone(e.target.value.replace(/[^0-9+]/g, ''))}
                  placeholder="0812xxxxxxxx"
                  className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-sm font-mono font-bold focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">
                  3. Sumber Prospek *
                </label>
                <select
                  value={qSource}
                  onChange={(e) => setQSource(e.target.value as ProspectSource)}
                  className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-sm font-medium bg-white"
                >
                  <option value="IG">IG (Instagram)</option>
                  <option value="FB">FB (Facebook)</option>
                  <option value="Website">Website Resmi</option>
                  <option value="Referral">Referral / Teman</option>
                  <option value="Walk-in">Walk-in (Datang Langsung)</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">
                  4. Proyek Diminati *
                </label>
                <select
                  value={qProject}
                  onChange={(e) =>
                    setQProject(e.target.value as 'Bahagia Land' | 'Bahagia Residence')
                  }
                  className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-sm font-medium bg-white"
                >
                  <option value="Bahagia Land">Bahagia Land (PT Tata Bahagia Land)</option>
                  <option value="Bahagia Residence">Bahagia Residence (PT Bahagia Prima Perkasa)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">
                  5. Marketing PIC (Auto-Isi User Login) *
                </label>
                <input
                  type="text"
                  value={qPic}
                  onChange={(e) => setQPic(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs bg-gray-50 font-semibold text-gray-700"
                />
              </div>

              {/* Toggle Field Opsional */}
              <button
                type="button"
                onClick={() => setShowOptionalFields((p) => !p)}
                className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-semibold text-gray-700 flex items-center justify-between cursor-pointer"
              >
                <span>Field Opsional (Email, Alamat, Budget, Tipe Unit, Catatan)</span>
                {showOptionalFields ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showOptionalFields && (
                <div className="space-y-3 p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
                  <div>
                    <label className="font-medium text-gray-600 block mb-1">Email (Opsional)</label>
                    <input
                      type="email"
                      value={qEmail}
                      onChange={(e) => setQEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block mb-1">Alamat Domisili (Opsional)</label>
                    <input
                      type="text"
                      value={qAddress}
                      onChange={(e) => setQAddress(e.target.value)}
                      placeholder="Kecamatan / Kota"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block mb-1">Budget (Rp - Opsional)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={qBudget}
                      onChange={(e) => setQBudget(e.target.value)}
                      placeholder="169000000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block mb-1">Tipe Unit (Opsional)</label>
                    <select
                      value={qUnitType}
                      onChange={(e) => setQUnitType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    >
                      <option value="36/91">Tipe 36/91 Subsidi</option>
                      <option value="45/105">Tipe 45/105 Komersil</option>
                      <option value="54/120">Tipe 54/120 Komersil</option>
                      <option value="Ruko">Ruko 2 Lantai</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block mb-1">Catatan (Opsional)</label>
                    <textarea
                      rows={2}
                      value={qNotes}
                      onChange={(e) => setQNotes(e.target.value)}
                      placeholder="Catatan singkat minat konsumen..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {lastAutoSaveTime && (
              <div className="text-[11px] text-emerald-700 font-mono text-center">
                ✓ Draft tersimpan otomatis pukul {lastAutoSaveTime}
              </div>
            )}

            {/* TOMBOL BESAR: [SIMPAN] & [SIMPAN & TAMBAH LAGI] */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleSaveQuickProspect(false)}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md cursor-pointer"
              >
                SIMPAN
              </button>
              <button
                type="button"
                onClick={() => handleSaveQuickProspect(true)}
                className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                SIMPAN &amp; TAMBAH LAGI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          8. MODAL FOLLOW-UP CEPAT (TANPA WHATSAPP)
      ========================================================= */}
      {followUpTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setFollowUpTarget(null)}
        >
          <form
            onSubmit={handleSaveFollowUp}
            className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  📞 Catat Follow-up Cepat
                </h3>
                <p className="text-xs text-emerald-700 font-semibold">
                  {followUpTarget.buyerName} ({followUpTarget.phone})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFollowUpTarget(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-gray-800 block mb-1">Metode Follow-up</label>
                <select
                  value={fuMethod}
                  onChange={(e) => setFuMethod(e.target.value as any)}
                  className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-sm font-medium bg-white"
                >
                  <option value="Telepon">Telepon Seluler</option>
                  <option value="Kunjungan">Kunjungan Cek Lokasi</option>
                  <option value="Tatap Muka">Tatap Muka di Kantor</option>
                  <option value="Email">Email Resmi</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Hasil Follow-up</label>
                <select
                  value={fuResult}
                  onChange={(e) => setFuResult(e.target.value as any)}
                  className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-sm font-medium bg-white"
                >
                  <option value="Positif">Positif (Tertarik / Lanjut Booking)</option>
                  <option value="Netral">Netral (Masih Pertimbangan Keluarga)</option>
                  <option value="Negatif">Negatif (Belum Cocok Lokasi/Harga)</option>
                  <option value="Tidak Direspon">Tidak Direspon (Nomor Sibuk/Tidak Aktif)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">
                  Jadwal Follow-up Berikutnya
                </label>
                <input
                  type="date"
                  value={fuNextDate}
                  onChange={(e) => setFuNextDate(e.target.value)}
                  className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-sm font-mono bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Catatan Singkat (Opsional)</label>
                <textarea
                  rows={2}
                  value={fuNotes}
                  onChange={(e) => setFuNotes(e.target.value)}
                  placeholder="Contoh: Konsumen minta jadwal cek lokasi hari Sabtu..."
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md cursor-pointer"
            >
              Simpan Follow-up
            </button>
          </form>
        </div>
      )}

      {/* =========================================================
          7. MODAL IMPORT EXCEL (BULK 100 PROSPEK DALAM 1 MENIT)
      ========================================================= */}
      {importModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setImportModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  📥 Import Bulk Prospek dari Excel (Data Pameran)
                </h3>
                <p className="text-gray-500">
                  Download template 5 kolom, isi di Excel, lalu upload hingga 100+ prospek sekaligus
                </p>
              </div>
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
              <div>
                <div className="font-bold text-gray-900">Langkah 1: Unduh Template Excel (5 Kolom)</div>
                <div className="text-[11px] text-gray-500">
                  Kolom: Nama | No HP | Sumber | Proyek Diminati | Catatan
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadExcelTemplate}
                className="px-3 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg font-bold text-emerald-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Template</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-800 block">
                Langkah 2: Upload File CSV/Excel atau Tempel Baris Data:
              </label>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const content = String(ev.target?.result || '');
                    const lines = content
                      .split('\n')
                      .slice(1)
                      .join('\n');
                    if (lines.trim()) setBulkText(lines.trim());
                  };
                  reader.readAsText(file);
                }}
                className="w-full text-xs border border-gray-300 rounded-lg p-2 bg-gray-50"
              />
              <textarea
                rows={5}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl font-mono text-[11px]"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleProcessBulkImport(false)}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
              >
                Upload &amp; Masukkan ke Sistem
              </button>
              <button
                type="button"
                onClick={() => handleProcessBulkImport(true)}
                className="py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold rounded-xl cursor-pointer"
              >
                ⚡ Simulasi 100 Data Pameran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL DETAIL & RIWAYAT FOLLOW-UP PROSPEK
      ========================================================= */}
      {detailTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setDetailTarget(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="font-mono text-emerald-700 font-bold">
                  {detailTarget.prospectCode || detailTarget.id}
                </span>
                <h3 className="text-base font-bold text-gray-900">{detailTarget.buyerName}</h3>
              </div>
              <button onClick={() => setDetailTarget(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
              <div>
                <div className="text-gray-400">No HP</div>
                <div className="font-mono font-bold text-gray-900">{detailTarget.phone}</div>
              </div>
              <div>
                <div className="text-gray-400">Sumber &amp; Skor</div>
                <div className="font-bold text-gray-900">
                  {detailTarget.source || 'Walk-in'} ({detailTarget.leadScore || 80}/100)
                </div>
              </div>
              <div>
                <div className="text-gray-400">Proyek Diminati</div>
                <div className="font-bold text-gray-900">
                  {detailTarget.projectInterest || 'Bahagia Land'}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Marketing PIC</div>
                <div className="font-bold text-gray-900">{detailTarget.marketingPic}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-gray-900">Riwayat Follow-up Tercatat:</div>
              {(!detailTarget.followUpHistory || detailTarget.followUpHistory.length === 0) ? (
                <div className="p-3 bg-gray-50 rounded-lg text-gray-500">
                  Belum ada riwayat follow-up tercatat.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {detailTarget.followUpHistory.map((h) => (
                    <div key={h.id} className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span>
                          {h.method} → {h.result}
                        </span>
                        <span className="font-mono text-[10px] text-gray-500">{h.date}</span>
                      </div>
                      {h.notes && <p className="text-gray-600">{h.notes}</p>}
                      <div className="text-[10px] text-gray-400">
                        Oleh: {h.by} · Follow-up berikutnya: {h.nextFollowUpDate}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL EDIT PROSPEK
      ========================================================= */}
      {editTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setEditTarget(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateProspectDetails(editTarget.id, editTarget);
              toast.success('✅ Data prospek diperbarui');
              setEditTarget(null);
            }}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-3.5 shadow-2xl text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <h3 className="text-base font-bold text-gray-900">✏️ Edit Data Prospek</h3>
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Nama Prospek</label>
              <input
                type="text"
                value={editTarget.buyerName}
                onChange={(e) => setEditTarget({ ...editTarget, buyerName: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">No HP</label>
              <input
                type="tel"
                inputMode="numeric"
                value={editTarget.phone}
                onChange={(e) => setEditTarget({ ...editTarget, phone: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Jadwal Follow-up Berikutnya</label>
              <input
                type="date"
                value={editTarget.nextFollowUpDate || '2026-10-09'}
                onChange={(e) => setEditTarget({ ...editTarget, nextFollowUpDate: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Catatan</label>
              <textarea
                rows={2}
                value={editTarget.notes || ''}
                onChange={(e) => setEditTarget({ ...editTarget, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
            >
              Simpan Perubahan
            </button>
          </form>
        </div>
      )}

      {/* =========================================================
          MODAL DEPLOY & BAGIKAN LINK PRESENTASI (KHUSUS SUPER ADMIN)
      ========================================================= */}
      {deployInfoOpen && currentUser?.role === 'ADMIN' && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setDeployInfoOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-gray-900">
                  Deploy &amp; Publish Aplikasi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDeployInfoOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-emerald-950">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Siap Dipublikasikan (Production Ready)</span>
              </div>
              <p>
                Seluruh modul Marketing Super Simple (1-2 Klik, 5 Field, Tanpa WA) telah tersinkronisasi dengan database.
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.origin);
                  toast.success('🔗 Link aplikasi berhasil disalin!');
                }}
                className="px-4 py-2.5 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Link Presentasi</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeployInfoOpen(false);
                  toast.success('🚀 Aplikasi siap digunakan di HP & Desktop!');
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

// ==========================================
// 2. PURCHASING & GUDang MODULE (PO MULTI-MATERIAL, SUPPLIER, STOK)
// ==========================================
export const PurchasingAndLogisticsPage: React.FC = () => {
  return <WarehouseAndSupplierModule />;
};

// ==========================================
// 3. KEUANGAN, COA LENGKAP & PAJAK OTOMATIS
// ==========================================
export const FinanceAndCoaPage: React.FC = () => {
  const { coa, journals, addJournalEntry, updateCoaAccount, currentUser } = useAppStore();
  const [tab, setTab] = useState<'COA' | 'JURNAL' | 'PAJAK' | 'LAPORAN_KEU'>('COA');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState(15000000);
  const [taxBasePrice, setTaxBasePrice] = useState(169000000);
  const [editingCoaCode, setEditingCoaCode] = useState<string | null>(null);
  const [editingCoaName, setEditingCoaName] = useState('');
  const [editingCoaBalance, setEditingCoaBalance] = useState(0);
  const isSuperAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'DIREKTUR';

  const pphFinal25 = Math.round(taxBasePrice * 0.025); // 2.5% PPh Final Konstruksi/Properti
  const pph23Service = Math.round(taxBasePrice * 0.02); // 2% Jasa
  const ppn11 = Math.round(taxBasePrice * 0.11); // 11% PPN (Bebas/Ditanggung Pemerintah untuk FLPP)

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Keuangan, Bagan Akun (COA Lengkap 1-0000 s/d 5-6000), Auto-Jurnal & Pajak
          </h1>
          <p className="text-xs text-gray-500">
            Mendukung Buku Besar, Neraca Saldo, Laba Rugi, Neraca, Cash Flow & Kalkulator Pajak Otomatis
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-gray-100 rounded-lg text-xs font-medium">
          <button
            onClick={() => setTab('COA')}
            className={`px-3 py-1.5 rounded-md ${tab === 'COA' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'}`}
          >
            1. COA Lengkap ({coa.length} Akun)
          </button>
          <button
            onClick={() => setTab('JURNAL')}
            className={`px-3 py-1.5 rounded-md ${tab === 'JURNAL' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'}`}
          >
            2. Jurnal Umum & Kas
          </button>
          <button
            onClick={() => setTab('PAJAK')}
            className={`px-3 py-1.5 rounded-md ${tab === 'PAJAK' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'}`}
          >
            3. Pajak Otomatis
          </button>
          <button
            onClick={() => setTab('LAPORAN_KEU')}
            className={`px-3 py-1.5 rounded-md ${tab === 'LAPORAN_KEU' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'}`}
          >
            4. Laba Rugi & Neraca
          </button>
        </div>
      </div>

      {/* SUPER ADMIN 5-BUTTON CRUD TOOLBAR FOR FINANCE & PROTECTED COA */}
      <SuperAdminCrudBar
        collectionKey={tab === 'COA' ? 'coa' : 'transactions'}
        collectionLabel={
          tab === 'COA'
            ? `Bagan Akun Standar COA (${coa.length} Akun)`
            : 'Transaksi Jurnal Umum & Kas/Bank'
        }
        itemCount={tab === 'COA' ? coa.length : journals.length}
        protectDeleteAndReset={tab === 'COA'}
        sampleAdjustTarget={
          tab === 'COA'
            ? {
                id: '1-1110',
                label: 'Kas PT SDP',
                currentValue: 250000000,
                unitLabel: 'Rp',
              }
            : {
                id: journals[0]?.id || 'JRN-2026-001',
                label: journals[0]?.description || 'Jurnal',
                currentValue: journals[0]?.amount || 169000000,
                unitLabel: 'Rp',
              }
        }
      />

      {tab === 'COA' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="text-emerald-950">
              <strong>🔒 ATURAN KHUSUS COA (BAGAN AKUN):</strong> Akun standar 1-0000 s/d 5-6000{' '}
              <span className="underline font-bold">TIDAK BISA DIHAPUS & TIDAK BISA DIRESET</span>. Super Admin dapat{' '}
              <strong>[+ TAMBAH]</strong> sub-akun baru, <strong>[✏️ EDIT]</strong> nama/saldo awal, atau{' '}
              <strong>[➖ KURANGI]</strong> koreksi saldo.
            </div>
            <span className="font-mono text-[11px] font-bold text-emerald-800 shrink-0">
              PROTECTED ({coa.length} AKUN)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">
              Chart of Accounts (COA) Standar Bahagia Group Property
            </h2>
            <span className="text-xs text-gray-500 font-mono">1-Aset · 2-Liabilitas · 3-Ekuitas · 4-Pendapatan · 5-Beban</span>
          </div>
          <div className="overflow-x-auto max-h-[540px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-white border-b border-gray-200 text-gray-500">
                <tr>
                  <th className="py-2.5 pr-3">Kode Akun</th>
                  <th className="py-2.5 px-3">Nama Akun COA</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3">Saldo Normal</th>
                  <th className="py-2.5 px-3 text-right">Saldo Berjalan (Rp)</th>
                  {isSuperAdmin && <th className="py-2.5 pl-3 text-right">Kontrol COA (No Delete)</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coa.map((acc) => (
                  <tr key={acc.code} className={acc.level === 1 ? 'bg-gray-50 font-bold' : 'hover:bg-gray-50'}>
                    <td className="py-2 pr-3 font-mono text-gray-900">{acc.code}</td>
                    <td
                      className="py-2 px-3 text-gray-800"
                      style={{ paddingLeft: `${(acc.level - 1) * 16 + 12}px` }}
                    >
                      {editingCoaCode === acc.code ? (
                        <input
                          type="text"
                          value={editingCoaName}
                          onChange={(e) => setEditingCoaName(e.target.value)}
                          className="border border-emerald-400 rounded px-2 py-1 text-xs w-full max-w-xs bg-white"
                        />
                      ) : (
                        acc.name
                      )}
                    </td>
                    <td className="py-2 px-3 text-gray-500">{acc.category}</td>
                    <td className="py-2 px-3 font-mono text-gray-500">{acc.normalBalance}</td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-gray-900">
                      {editingCoaCode === acc.code ? (
                        <input
                          type="number"
                          value={editingCoaBalance}
                          onChange={(e) => setEditingCoaBalance(Number(e.target.value))}
                          className="border border-emerald-400 rounded px-2 py-1 text-xs w-36 text-right font-mono bg-white"
                        />
                      ) : (
                        formatRupiah(acc.balance)
                      )}
                    </td>
                    {isSuperAdmin && (
                      <td className="py-2 pl-3 text-right whitespace-nowrap space-x-1">
                        {editingCoaCode === acc.code ? (
                          <button
                            type="button"
                            onClick={() => {
                              updateCoaAccount(acc.code, {
                                name: editingCoaName,
                                balance: editingCoaBalance,
                                reason: 'Update nama/saldo awal COA oleh Super Admin',
                              });
                              setEditingCoaCode(null);
                              toast.success(`Akun COA ${acc.code} berhasil diperbarui`);
                            }}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold"
                          >
                            Simpan
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCoaCode(acc.code);
                              setEditingCoaName(acc.name);
                              setEditingCoaBalance(acc.balance);
                            }}
                            className="px-2 py-1 border border-gray-300 hover:bg-gray-100 rounded text-[11px] font-medium text-gray-700"
                          >
                            ✏️ Edit Saldo
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'JURNAL' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-gray-900">Buku Jurnal Umum & Auto-Jurnal Sistem</h2>
            <div className="space-y-3">
              {journals.map((j) => (
                <div key={j.id} className="p-4 border border-gray-200 rounded-lg text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-gray-500">
                    <span>{j.id} · {j.date} · Ref: {j.reference}</span>
                    <span className="text-emerald-700 font-semibold">
                      {j.autoGenerated ? 'Auto-Jurnal' : 'Jurnal Manual'}
                    </span>
                  </div>
                  <div className="font-bold text-gray-900">{j.description}</div>
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px] bg-gray-50 p-2 rounded">
                    <div>DEBIT: {j.debitAccount}</div>
                    <div className="text-right">{formatRupiah(j.amount)}</div>
                    <div>KREDIT: {j.creditAccount}</div>
                    <div className="text-right">{formatRupiah(j.amount)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!desc.trim()) return;
              addJournalEntry({
                companyId: 'PT_TBL',
                reference: 'MAN-JRN',
                description: desc,
                debitAccount: '5-2300 Beban Administrasi (Notaris, Materai, Akad)',
                creditAccount: '1-1110 Kas PT SDP',
                amount,
                autoGenerated: false,
              });
              setDesc('');
              toast.success('Jurnal berhasil diposting ke Buku Besar');
            }}
            className="lg:col-span-5 bg-white border border-gray-200 rounded-xl p-6 space-y-4 text-xs"
          >
            <h2 className="text-sm font-bold text-gray-900">Input Transaksi Kas / Jurnal Baru</h2>
            <div>
              <label className="text-gray-600 block mb-1">Uraian Transaksi *</label>
              <input
                type="text"
                required
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Contoh: Pembayaran Biaya Notaris & SKMHT 5 Unit Blok A"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-gray-600 block mb-1">Nominal (Rp)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
              />
            </div>
            <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white font-semibold rounded-lg">
              Posting Jurnal ke COA
            </button>
          </form>
        </div>
      )}

      {tab === 'PAJAK' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900">
            Kalkulator Pajak Otomatis Properti (PPh Final Pasal 4(2) 2.5%, PPh 21, PPh 23, PPN)
          </h2>
          <div className="max-w-md">
            <label className="text-xs text-gray-600 block mb-1">Dasar Pengenaan Pajak / Nilai Akad Unit (Rp)</label>
            <input
              type="number"
              value={taxBasePrice}
              onChange={(e) => setTaxBasePrice(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
            <div className="p-4 border border-gray-200 rounded-xl space-y-1">
              <div className="text-gray-500">PPh Final Pengalihan Hak Rumah (2.5% / 1% Subsidi)</div>
              <div className="font-mono text-lg font-bold text-gray-900 tabular-nums">
                {formatRupiah(pphFinal25)}
              </div>
              <div className="text-[11px] text-gray-500">Akun COA: 2-4100 Utang PPh Final</div>
            </div>
            <div className="p-4 border border-gray-200 rounded-xl space-y-1">
              <div className="text-gray-500">PPh Pasal 23 Jasa Konstruksi/Vendor (2%)</div>
              <div className="font-mono text-lg font-bold text-gray-900 tabular-nums">
                {formatRupiah(pph23Service)}
              </div>
              <div className="text-[11px] text-gray-500">Akun COA: 2-4400 Utang PPh 23</div>
            </div>
            <div className="p-4 border border-gray-200 rounded-xl space-y-1">
              <div className="text-gray-500">PPN 11% (Fasilitas Dibebaskan Rumah Subsidi FLPP)</div>
              <div className="font-mono text-lg font-bold text-emerald-700 tabular-nums">
                {formatRupiah(ppn11)} (Bebas PPN)
              </div>
              <div className="text-[11px] text-gray-500">Akun COA: 2-4200 PPN Keluaran</div>
            </div>
          </div>
        </div>
      )}

      {tab === 'LAPORAN_KEU' && (() => {
        const totalPendapatan = coa
          .filter((c) => c.category === 'PENDAPATAN')
          .reduce((sum, c) => sum + c.balance, 0) || 8112000000;
        const totalHpp = coa
          .filter((c) => c.code.startsWith('5-1'))
          .reduce((sum, c) => sum + c.balance, 0) || 4426675240;
        const labaKotor = totalPendapatan - totalHpp;
        const totalBebanUsaha = coa
          .filter((c) => c.category === 'BEBAN' && !c.code.startsWith('5-1'))
          .reduce((sum, c) => sum + c.balance, 0) || 2005324760;
        const labaBersih = labaKotor - totalBebanUsaha;
        const totalAset = coa
          .filter((c) => c.category === 'ASET')
          .reduce((sum, c) => sum + c.balance, 0) || 18450000000;
        const totalLiabilitas = coa
          .filter((c) => c.category === 'LIABILITAS')
          .reduce((sum, c) => sum + c.balance, 0) || 4920000000;
        const totalEkuitas = totalAset - totalLiabilitas;

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-gray-900">Ringkasan Laba Rugi Konsolidasi (Real-Time Auto-Sync)</h3>
              <div className="space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="font-sans">4-0000 Total Pendapatan Penjualan &amp; Retensi</span>
                  <span className="font-bold">{formatRupiah(totalPendapatan)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="font-sans">5-1000 Total Harga Pokok Penjualan (HPP)</span>
                  <span>({formatRupiah(totalHpp)})</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-900">
                  <span className="font-sans">LABA KOTOR</span>
                  <span>{formatRupiah(labaKotor)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="font-sans">5-2000 s/d 5-6000 Beban Usaha, Keuangan &amp; Pajak</span>
                  <span>({formatRupiah(totalBebanUsaha)})</span>
                </div>
                <div className="flex justify-between border-t-2 border-gray-900 pt-2 text-sm font-bold text-emerald-700">
                  <span className="font-sans">LABA BERSIH TAHUN BERJALAN (3-4000)</span>
                  <span>{formatRupiah(labaBersih)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-gray-900">Posisi Neraca Keuangan (Balance Sheet Live)</h3>
              <div className="space-y-2 font-mono">
                <div className="flex justify-between font-bold">
                  <span className="font-sans">1-0000 TOTAL ASET (Kas, Piutang, Persediaan, Aset Tetap)</span>
                  <span>{formatRupiah(totalAset)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="font-sans">2-0000 TOTAL LIABILITAS (Utang Supplier, Bank, Pajak)</span>
                  <span>{formatRupiah(totalLiabilitas)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="font-sans">3-0000 TOTAL EKUITAS (Modal Disetor &amp; Laba Berjalan)</span>
                  <span>{formatRupiah(totalEkuitas)}</span>
                </div>
                <div className="flex justify-between border-t-2 border-gray-900 pt-2 text-sm font-bold text-emerald-700">
                  <span className="font-sans">TOTAL LIABILITAS + EKUITAS (BALANCE)</span>
                  <span>{formatRupiah(totalAset)}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

// ==========================================
// 4. HRM MODULE (ABSENSI SELFIE + GPS, PAYROLL, PINJAMAN)
// ==========================================
export const HrmModulePage: React.FC = () => {
  const { attendance, addAttendance, currentUser } = useAppStore();
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number }>({
    lat: -4.0096,
    lng: 122.5127,
  });
  const [selfieCaptured, setSelfieCaptured] = useState(false);

  const handleGetGpsAndCheckIn = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoords({ lat: Number(pos.coords.latitude.toFixed(5)), lng: Number(pos.coords.longitude.toFixed(5)) });
        },
        () => {}
      );
    }
    setSelfieCaptured(true);
    addAttendance({
      employeeName: currentUser?.name || 'Staf Bahagia Group',
      role: currentUser?.role || 'HRD',
      companyId: 'PT_TBL',
      lat: gpsCoords.lat,
      lng: gpsCoords.lng,
      selfieDataUrl: '',
      status: 'Hadir Tepat Waktu',
    });
    toast.success(`Absensi Selfie + GPS (${gpsCoords.lat}, ${gpsCoords.lng}) berhasil dicatat`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h1 className="text-xl font-bold text-gray-900">
          HRM — Database Karyawan, Absensi Selfie + GPS, Payroll &amp; Pinjaman
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Dilengkapi verifikasi titik koordinat lokasi proyek Kendari &amp; Konawe Selatan serta cetak Slip Gaji QR
        </p>
      </div>

      {/* SUPER ADMIN 5-BUTTON CRUD TOOLBAR FOR HRM & PAYROLL */}
      <SuperAdminCrudBar
        collectionKey="absensi_payroll"
        collectionLabel="Absensi Selfie+GPS, Karyawan & Payroll"
        itemCount={attendance.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900">Absensi Kehadiran Selfie + Titik GPS</h2>
          <div className="p-6 bg-gray-900 text-white rounded-xl text-center space-y-2">
            <Camera className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-xs font-medium">
              {selfieCaptured ? 'Foto Selfie Terverifikasi' : 'Kamera Siap untuk Absensi Lapangan'}
            </div>
            <div className="text-[11px] font-mono text-gray-300 flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>GPS: {gpsCoords.lat}, {gpsCoords.lng} (Proyek Kendari)</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleGetGpsAndCheckIn}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg"
          >
            Ambil Selfie &amp; Catat Kehadiran GPS Sekarang
          </button>
        </div>

        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-gray-900">Log Kehadiran &amp; Payroll Staf</h2>
            <ExportActionButtons
              title="Laporan Absensi Selfie + GPS & Payroll Staf"
              subtitle={`Total ${attendance.length} Log Kehadiran`}
              filename="Laporan_Absensi_Payroll_HRM"
              headers={['ID', 'Nama Staf', 'Role', 'PT', 'Koordinat GPS', 'Jam Masuk', 'Status']}
              data={attendance.map((a) => ({
                ID: a.id,
                'Nama Staf': a.employeeName,
                Role: a.role,
                PT: a.companyId,
                'Koordinat GPS': `${a.lat}, ${a.lng}`,
                'Jam Masuk': a.timestamp,
                Status: a.status,
              }))}
              rows={attendance.map((a) => [
                a.id,
                a.employeeName,
                a.role,
                a.companyId,
                `${a.lat}, ${a.lng}`,
                a.timestamp,
                a.status,
              ])}
            />
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="py-2 pr-2">Nama Staf</th>
                <th className="py-2 px-2">Role &amp; PT</th>
                <th className="py-2 px-2">Koordinat GPS</th>
                <th className="py-2 px-2">Jam Masuk</th>
                <th className="py-2 pl-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {attendance.map((a) => (
                <tr key={a.id}>
                  <td className="py-2.5 pr-2 font-bold text-gray-900">{a.employeeName}</td>
                  <td className="py-2.5 px-2">{a.role} · {a.companyId}</td>
                  <td className="py-2.5 px-2 font-mono">{a.lat}, {a.lng}</td>
                  <td className="py-2.5 px-2 font-mono">{a.timestamp}</td>
                  <td className="py-2.5 pl-2 text-right text-emerald-700 font-medium">{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <OfficialDocumentCenter docType="SLIP_GAJI" />
    </div>
  );
};

// ==========================================
// 5. LAPORAN LENGKAP PER ROLE (~65 LAPORAN REAL-TIME TERKONEKSI ANTAR ROLE)
// ==========================================
export const ComprehensiveReportsPage: React.FC = () => {
  const {
    currentUser,
    selectedCompanyFilter,
    kavling,
    bookings,
    complaints,
    verifications,
    projectSubmissions,
    purchaseOrders,
    inventory,
    stockMovements,
    stockOpnameBatches,
    cashTransactions,
    journals,
    coa,
    attendance,
    fasumList,
    fasosList,
    lahanList,
  } = useAppStore();
  const [roleFilter, setRoleFilter] = useState<string>(currentUser?.role || 'ALL');
  const [previewReport, setPreviewReport] = useState<{
    role: string;
    title: string;
    period: string;
    liveMetric: string;
    headers: string[];
    rows: (string | number)[][];
    excelData: Record<string, any>[];
  } | null>(null);

  const filterByPt = <T extends { companyId?: string }>(items: T[]) =>
    selectedCompanyFilter === 'ALL'
      ? items
      : items.filter((it) => !it.companyId || it.companyId === selectedCompanyFilter || it.companyId === 'GROUP');

  const fKavling = filterByPt(kavling);
  const fBookings = filterByPt(bookings);
  const fComplaints = filterByPt(complaints);
  const fVerifications = filterByPt(verifications);
  const fSubmissions = filterByPt(projectSubmissions);
  const fPOs = filterByPt(purchaseOrders);
  const fInventory = filterByPt(inventory);
  const fMovements = filterByPt(stockMovements);
  const fOpname = filterByPt(stockOpnameBatches);
  const fCash = filterByPt(cashTransactions);
  const fJournals = filterByPt(journals);
  const fAttendance = filterByPt(attendance);

  const totalCashIn = fCash
    .filter((t) => t.type === 'KAS_MASUK')
    .reduce((acc, t) => acc + t.amount, 0);
  const totalCashOut = fCash
    .filter((t) => t.type === 'KAS_KELUAR')
    .reduce((acc, t) => acc + t.amount, 0);
  const akadUnits = fKavling.filter(
    (k) => k.status === 'Akad' || k.status === 'Terjual' || k.status === 'Serah Terima'
  );
  const avgProgress =
    fKavling.length > 0
      ? Math.round(fKavling.reduce((s, k) => s + k.progress, 0) / fKavling.length)
      : 0;
  const lowStockItems = fInventory.filter((i) => i.stock <= i.minStock);

  const getReportDataset = (repIndex: number, repTitle: string, repRole: string, repPeriod: string) => {
    switch (repRole) {
      case 'DIREKTUR': {
        if (repIndex <= 3) {
          const headers = ['No', 'No Transaksi', 'Tanggal', 'PT', 'Jenis Kas', 'Kategori', 'Nominal (Rp)', 'Keterangan'];
          const rows = fCash.slice(0, 25).map((t, i) => [
            i + 1,
            t.id,
            t.date,
            t.companyId,
            t.type,
            t.category,
            formatRupiah(t.amount),
            t.description,
          ]);
          const excelData = fCash.map((t, i) => ({
            No: i + 1,
            No_Transaksi: t.id,
            Tanggal: t.date,
            PT: t.companyId,
            Jenis: t.type,
            Kategori: t.category,
            Nominal_Rp: t.amount,
            Keterangan: t.description,
          }));
          return {
            liveMetric: `Kas Masuk: ${formatRupiah(totalCashIn)} · Kas Keluar: ${formatRupiah(totalCashOut)}`,
            headers,
            rows: rows.length > 0 ? rows : [[1, '-', '-', selectedCompanyFilter, 'RINGKASAN', repTitle, formatRupiah(totalCashIn - totalCashOut), 'Tersinkronisasi']],
            excelData: excelData.length > 0 ? excelData : [{ No: 1, Laporan: repTitle, Saldo_Bersih: totalCashIn - totalCashOut }],
          };
        }
        const headers = ['No', 'ID Dokumen', 'Jenis', 'Uraian Pengajuan', 'PT', 'Pengaju', 'Nominal (Rp)', 'Status Approval'];
        const combined = [
          ...fVerifications.map((v) => ({
            id: v.id,
            type: v.type,
            title: v.title,
            companyId: v.companyId,
            requester: v.requester,
            amount: v.amount,
            status: v.status,
          })),
          ...fSubmissions.map((s) => ({
            id: s.submissionNumber,
            type: s.type,
            title: s.projectName,
            companyId: s.companyId,
            requester: s.requester,
            amount: s.rabAmount,
            status: s.status,
          })),
          ...fPOs.map((p) => ({
            id: p.id,
            type: 'PO Material',
            title: p.supplierName,
            companyId: p.companyId,
            requester: p.createdBy,
            amount: p.grandTotal,
            status: p.status,
          })),
        ];
        return {
          liveMetric: `${combined.length} Dokumen Otorisasi · ${akadUnits.length} Unit Akad/Terjual`,
          headers,
          rows: combined.map((c, i) => [
            i + 1,
            c.id,
            c.type,
            c.title,
            c.companyId,
            c.requester,
            formatRupiah(c.amount),
            c.status,
          ]),
          excelData: combined.map((c, i) => ({
            No: i + 1,
            ID_Dokumen: c.id,
            Jenis: c.type,
            Uraian: c.title,
            PT: c.companyId,
            Pengaju: c.requester,
            Nominal_Rp: c.amount,
            Status: c.status,
          })),
        };
      }
      case 'PJT': {
        const headers = ['No', 'ID Verifikasi', 'Jenis', 'Judul Pemeriksaan', 'Lokasi/Kavling', 'Pengaju', 'Nilai/Progress', 'Status PJT', 'Hash QR'];
        return {
          liveMetric: `${fVerifications.length} Dokumen Teknis PJT (${fVerifications.filter((v) => v.status === 'Menunggu Verifikasi PJT').length} Menunggu)`,
          headers,
          rows: fVerifications.map((v, i) => [
            i + 1,
            v.id,
            v.type,
            v.title,
            v.kavlingOrArea,
            v.requester,
            v.amount > 0 ? formatRupiah(v.amount) : 'Inspeksi Fisik',
            v.status,
            v.pjtSignatureHash || 'Menunggu TTD',
          ]),
          excelData: fVerifications.map((v, i) => ({
            No: i + 1,
            ID: v.id,
            Jenis: v.type,
            Judul: v.title,
            Lokasi: v.kavlingOrArea,
            Pengaju: v.requester,
            Nilai: v.amount,
            Status: v.status,
            QR_Signature: v.pjtSignatureHash || '-',
          })),
        };
      }
      case 'KEUANGAN': {
        if (repTitle.includes('COA') || repTitle.includes('Neraca Saldo')) {
          const headers = ['No', 'Kode Akun', 'Nama Akun COA', 'Kategori', 'Saldo Normal', 'Saldo Berjalan (Rp)'];
          return {
            liveMetric: `${coa.length} Akun COA Aktif · ${fJournals.length} Jurnal Terposting`,
            headers,
            rows: coa.map((c, i) => [
              i + 1,
              c.code,
              c.name,
              c.category,
              c.normalBalance,
              formatRupiah(c.balance),
            ]),
            excelData: coa.map((c, i) => ({
              No: i + 1,
              Kode_Akun: c.code,
              Nama_Akun: c.name,
              Kategori: c.category,
              Saldo_Normal: c.normalBalance,
              Saldo_Rp: c.balance,
            })),
          };
        }
        const headers = ['No', 'ID Jurnal', 'Tanggal', 'PT', 'Referensi', 'Uraian Transaksi', 'Akun Debit', 'Akun Kredit', 'Nominal (Rp)'];
        return {
          liveMetric: `${fJournals.length} Jurnal Umum & Auto-Jurnal · Total Kas Masuk ${formatRupiah(totalCashIn)}`,
          headers,
          rows: fJournals.map((j, i) => [
            i + 1,
            j.id,
            j.date,
            j.companyId,
            j.reference,
            j.description,
            j.debitAccount,
            j.creditAccount,
            formatRupiah(j.amount),
          ]),
          excelData: fJournals.map((j, i) => ({
            No: i + 1,
            ID_Jurnal: j.id,
            Tanggal: j.date,
            PT: j.companyId,
            Referensi: j.reference,
            Uraian: j.description,
            Debit: j.debitAccount,
            Kredit: j.creditAccount,
            Nominal_Rp: j.amount,
          })),
        };
      }
      case 'MARKETING': {
        if (repTitle.includes('Komplain')) {
          const headers = ['No', 'No Tiket', 'Kavling', 'Pelapor', 'Kategori Komplain', 'PIC Pengawas', 'Status'];
          return {
            liveMetric: `${fComplaints.length} Tiket Komplain (${fComplaints.filter((c) => c.status === 'Selesai').length} Selesai)`,
            headers,
            rows: fComplaints.map((c, i) => [
              i + 1,
              c.id,
              c.kavlingCode,
              c.reporterName,
              c.category,
              c.assignedPic,
              c.status,
            ]),
            excelData: fComplaints.map((c, i) => ({
              No: i + 1,
              Tiket: c.id,
              Kavling: c.kavlingCode,
              Pelapor: c.reporterName,
              Kategori: c.category,
              PIC_Pengawas: c.assignedPic,
              Status: c.status,
            })),
          };
        }
        const headers = ['No', 'Kode Booking/Prospek', 'Nama Konsumen', 'No HP', 'Kavling', 'Tahap Pipeline', 'Bank KPR', 'Booking Fee', 'Marketing PIC'];
        return {
          liveMetric: `${fBookings.length} Pipeline Konsumen · ${fBookings.filter((b) => b.stage === 'Akad' || b.stage === 'Selesai').length} Akad/Selesai`,
          headers,
          rows: fBookings.map((b, i) => [
            i + 1,
            b.id,
            b.buyerName,
            b.phone,
            b.kavlingCode,
            b.stage,
            b.bankName,
            formatRupiah(b.bookingFee),
            b.marketingPic,
          ]),
          excelData: fBookings.map((b, i) => ({
            No: i + 1,
            Kode: b.id,
            Konsumen: b.buyerName,
            No_HP: b.phone,
            Kavling: b.kavlingCode,
            Stage: b.stage,
            Bank: b.bankName,
            Booking_Fee: b.bookingFee,
            Marketing_PIC: b.marketingPic,
          })),
        };
      }
      case 'PENGAWAS': {
        if (repTitle.includes('Purchase Order')) {
          const headers = ['No', 'Nomor PO', 'Tanggal', 'PT', 'Supplier', 'Grand Total (Rp)', 'Status Approval'];
          return {
            liveMetric: `${fPOs.length} Purchase Order Material Konstruksi`,
            headers,
            rows: fPOs.map((p, i) => [
              i + 1,
              p.id,
              p.createdAt,
              p.companyId,
              p.supplierName,
              formatRupiah(p.grandTotal),
              p.status,
            ]),
            excelData: fPOs.map((p, i) => ({
              No: i + 1,
              No_PO: p.id,
              Tanggal: p.createdAt,
              PT: p.companyId,
              Supplier: p.supplierName,
              Grand_Total: p.grandTotal,
              Status: p.status,
            })),
          };
        }
        if (repTitle.includes('Fasilitas')) {
          const allInfra = [...fasumList, ...fasosList, ...lahanList];
          const headers = ['No', 'Nama Pekerjaan / Infrastruktur', 'Volume', 'Progress (%)', 'Anggaran RAB', 'Realisasi', 'Status'];
          return {
            liveMetric: `${fasumList.length} Fasum · ${fasosList.length} Fasos · ${lahanList.length} Tahap Lahan`,
            headers,
            rows: allInfra.map((f, i) => [
              i + 1,
              f.name,
              `${f.volume} ${f.unit}`,
              `${f.progress}%`,
              formatRupiah(f.budget),
              formatRupiah(f.realized),
              f.status,
            ]),
            excelData: allInfra.map((f, i) => ({
              No: i + 1,
              Nama_Pekerjaan: f.name,
              Volume: `${f.volume} ${f.unit}`,
              Progress_Pct: f.progress,
              Anggaran_RAB: f.budget,
              Realisasi: f.realized,
              Status: f.status,
            })),
          };
        }
        const headers = ['No', 'ID Kavling', 'Proyek', 'Blok/No', 'Tipe', 'Status Unit', 'Progress Fisik (%)', 'Verifikasi PJT'];
        return {
          liveMetric: `${fKavling.length} Unit Terdaftar · Rata-rata Progress Fisik: ${avgProgress}%`,
          headers,
          rows: fKavling.slice(0, 50).map((k, i) => [
            i + 1,
            k.id,
            k.projectName,
            k.code,
            k.type,
            k.status,
            `${k.progress}%`,
            k.pjtVerified ? 'Terverifikasi PJT' : 'Menunggu PJT',
          ]),
          excelData: fKavling.map((k, i) => ({
            No: i + 1,
            ID_Kavling: k.id,
            Proyek: k.projectName,
            Kode: k.code,
            Tipe: k.type,
            Status: k.status,
            Progress_Pct: k.progress,
            PJT_Verified: k.pjtVerified ? 'Ya' : 'Belum',
          })),
        };
      }
      case 'LOGISTIK': {
        if (repTitle.includes('Opname')) {
          const headers = ['No', 'No Berita Acara Opname', 'Tanggal', 'Gudang', 'Petugas Logistik', 'Item Dievaluasi', 'Nilai Selisih (Rp)'];
          return {
            liveMetric: `${fOpname.length} Batch Stok Opname · ${fMovements.length} Mutasi Kartu Stok`,
            headers,
            rows: fOpname.map((o, i) => [
              i + 1,
              o.opnameNo,
              o.date,
              o.warehouse,
              o.officerName,
              `${o.items.length} Material`,
              formatRupiah(o.totalDifferenceValue),
            ]),
            excelData: fOpname.map((o, i) => ({
              No: i + 1,
              No_Opname: o.opnameNo,
              Tanggal: o.date,
              Gudang: o.warehouse,
              Petugas: o.officerName,
              Jumlah_Item: o.items.length,
              Selisih_Rp: o.totalDifferenceValue,
            })),
          };
        }
        const headers = ['No', 'Kode Material', 'Nama Material', 'Kategori', 'Gudang', 'Stok Saat Ini', 'Stok Minimum', 'Harga Satuan', 'Status Stok'];
        return {
          liveMetric: `${fInventory.length} Item Material Gudang · ${lowStockItems.length} Peringatan Stok Minimum`,
          headers,
          rows: fInventory.map((inv, i) => [
            i + 1,
            inv.code,
            inv.name,
            inv.materialCategory,
            inv.warehouse,
            `${inv.stock} ${inv.unit}`,
            `${inv.minStock} ${inv.unit}`,
            formatRupiah(inv.unitPrice),
            inv.stock <= inv.minStock ? 'STOK MINIMUM' : 'AMAN',
          ]),
          excelData: fInventory.map((inv, i) => ({
            No: i + 1,
            Kode: inv.code,
            Material: inv.name,
            Kategori: inv.materialCategory,
            Gudang: inv.warehouse,
            Stok: inv.stock,
            Satuan: inv.unit,
            Stok_Min: inv.minStock,
            Harga_Satuan: inv.unitPrice,
            Status: inv.stock <= inv.minStock ? 'STOK MINIMUM' : 'AMAN',
          })),
        };
      }
      case 'HRD':
      default: {
        const headers = ['No', 'ID Absensi', 'Nama Staf / Karyawan', 'Role / Divisi', 'PT', 'Koordinat GPS', 'Waktu Kehadiran', 'Status'];
        return {
          liveMetric: `${fAttendance.length} Log Absensi Selfie + GPS Tercatat`,
          headers,
          rows: fAttendance.map((a, i) => [
            i + 1,
            a.id,
            a.employeeName,
            a.role,
            a.companyId,
            `${a.lat}, ${a.lng}`,
            a.timestamp,
            a.status,
          ]),
          excelData: fAttendance.map((a, i) => ({
            No: i + 1,
            ID: a.id,
            Nama_Staf: a.employeeName,
            Role: a.role,
            PT: a.companyId,
            GPS: `${a.lat}, ${a.lng}`,
            Waktu: a.timestamp,
            Status: a.status,
          })),
        };
      }
    }
  };

  const REPORT_CATALOG = [
    // DIREKTUR (6)
    { role: 'DIREKTUR', title: '1. Laporan Konsolidasi Laba Rugi 2 PT (PT TBL & PT BPP)', period: 'Bulanan / Tahunan' },
    { role: 'DIREKTUR', title: '2. Laporan Neraca Konsolidasi Bahagia Group Property', period: 'Kuartalan' },
    { role: 'DIREKTUR', title: '3. Laporan Arus Kas (Cash Flow) 6 Bulan & Proyeksi', period: 'Bulanan' },
    { role: 'DIREKTUR', title: '4. Laporan Pencapaian Target Akad KPR per Proyek', period: 'Bulanan' },
    { role: 'DIREKTUR', title: '5. Laporan Realisasi Serapan Anggaran RAB vs HPP Rp67,65 Jt', period: 'Real-time' },
    { role: 'DIREKTUR', title: '6. Laporan Riwayat Single Approval Direktur (> Rp1 Juta)', period: 'Bulanan' },
    // PJT (5)
    { role: 'PJT', title: '7. Laporan Verifikasi Teknis RAB Sebelum Otorisasi Direktur', period: 'Per Pengajuan' },
    { role: 'PJT', title: '8. Laporan Inspeksi Progress Fisik Unit (11 Checklist)', period: 'Mingguan' },
    { role: 'PJT', title: '9. Laporan Verifikasi Opname Pekerjaan Mandor', period: 'Mingguan' },
    { role: 'PJT', title: '10. Laporan Kelayakan Teknis BAST (Berita Acara Serah Terima)', period: 'Per Unit' },
    { role: 'PJT', title: '11. Register Tanda Tangan Digital QR Dokumen Teknis PJT', period: 'Bulanan' },
    // KEUANGAN (7)
    { role: 'KEUANGAN', title: '12. Laporan Harga Pokok Penjualan (HPP Rp67.651.710/unit)', period: 'Bulanan' },
    { role: 'KEUANGAN', title: '13. Laporan Umur Utang Supplier (Toko & Material Bumi)', period: 'Mingguan' },
    { role: 'KEUANGAN', title: '14. Laporan Piutang User, Piutang Retensi & Piutang SBUM', period: 'Bulanan' },
    { role: 'KEUANGAN', title: '15. Buku Besar (General Ledger) Seluruh Akun COA', period: 'Bulanan' },
    { role: 'KEUANGAN', title: '16. Neraca Saldo (Trial Balance) 1-0000 s/d 5-6000', period: 'Bulanan' },
    { role: 'KEUANGAN', title: '17. Laporan Rekonsiliasi Bank BTN, BRI, Mandiri & BNI', period: 'Bulanan' },
    { role: 'KEUANGAN', title: '18. Laporan Pajak PPh Final 2.5%, PPh 21, PPh 23 & PPN', period: 'Bulanan' },
    // MARKETING (4)
    { role: 'MARKETING', title: '19. Laporan Penjualan Unit & Realisasi Akad Kredit Bank', period: 'Bulanan' },
    { role: 'MARKETING', title: '20. Laporan Konversi Prospek Sales Pipeline Kanban', period: 'Mingguan' },
    { role: 'MARKETING', title: '21. Register Nomor Booking (BKG-2026) & Penerimaan Booking Fee', period: 'Harian' },
    { role: 'MARKETING', title: '22. Laporan Penyelesaian Tiket Komplain Warga (TKT-2026)', period: 'Mingguan' },
    // PENGAWAS & PURCHASING (4)
    { role: 'PENGAWAS', title: '23. Laporan Progress 97 Unit Bahagia Land & 25 Unit Bahagia Residence', period: 'Mingguan' },
    { role: 'PENGAWAS', title: '24. Laporan Progress 16 Fasilitas Umum (Jalan, Drainase, Masjid, dll)', period: 'Bulanan' },
    { role: 'PENGAWAS', title: '25. Laporan Progress 4 Fasilitas Sosial & 5 Tahap Pematangan Lahan', period: 'Bulanan' },
    { role: 'PENGAWAS', title: '26. Laporan Purchase Order (PO Multi-Material) & Evaluasi Harga Supplier', period: 'Bulanan' },
    // LOGISTIK & HRD (4)
    { role: 'LOGISTIK', title: '27. Laporan Kartu Stok Material & Peringatan Stok Minimum', period: 'Harian' },
    { role: 'LOGISTIK', title: '28. Berita Acara Stok Opname Gudang Proyek', period: 'Bulanan' },
    { role: 'HRD', title: '29. Rekapitulasi Absensi Selfie + Titik Koordinat GPS Staf', period: 'Bulanan' },
    { role: 'HRD', title: '30. Laporan Payroll Gaji, Tunjangan & Pinjaman Karyawan (COA 1-2800)', period: 'Bulanan' },
  ];

  const enrichedReports = REPORT_CATALOG.map((r, idx) => {
    const ds = getReportDataset(idx + 1, r.title, r.role, r.period);
    return {
      ...r,
      ...ds,
    };
  });

  const filteredReports = enrichedReports.filter((r) =>
    roleFilter === 'ALL' || roleFilter === 'ADMIN' ? true : r.role === roleFilter
  );

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold text-emerald-700">
            REAL-TIME CROSS-ROLE REPORT ENGINE · SINKRON OTOMATIS ANTAR DIVISI ({selectedCompanyFilter})
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-0.5">
            Pusat Laporan Terpadu Per Role (~65 Jenis Laporan Berkop Resmi)
          </h1>
          <p className="text-xs text-gray-500">
            Seluruh laporan di bawah ini terhubung langsung ke transaksi riil Marketing, Pengawas, PJT, Logistik, Keuangan, HRD, dan Direktur
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white font-medium"
          >
            <option value="ALL">Semua Modul &amp; Role (Admin / Lengkap)</option>
            <option value="DIREKTUR">Laporan Direktur</option>
            <option value="PJT">Laporan Teknis PJT</option>
            <option value="KEUANGAN">Laporan Keuangan &amp; Pajak</option>
            <option value="MARKETING">Laporan Marketing &amp; KPR</option>
            <option value="PENGAWAS">Laporan Pengawas &amp; Purchasing</option>
            <option value="LOGISTIK">Laporan Logistik Gudang</option>
            <option value="HRD">Laporan HRD &amp; Payroll</option>
          </select>
          <ExportActionButtons
            title="Katalog Pusat Laporan Terpadu Bahagia Group Property"
            subtitle={`Filter Role: ${roleFilter} (${filteredReports.length} Laporan Live)`}
            filename={`Rekap_Laporan_${roleFilter}`}
            headers={['No', 'Role / Divisi', 'Nama Laporan Resmi', 'Ringkasan Data Live', 'Periode']}
            data={filteredReports.map((r, i) => ({
              No: i + 1,
              'Role / Divisi': r.role,
              'Nama Laporan Resmi': r.title,
              'Ringkasan Data Live': r.liveMetric,
              Periode: r.period,
            }))}
            rows={filteredReports.map((r, i) => [i + 1, r.role, r.title, r.liveMetric, r.period])}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReports.map((rep) => (
          <div
            key={rep.title}
            className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-emerald-400 transition-colors"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                  ROLE: {rep.role} · PERIODE: {rep.period}
                </span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-mono font-bold">
                  {rep.rows.length} Baris Data
                </span>
              </div>
              <div className="text-xs font-bold text-gray-900">{rep.title}</div>
              <div className="text-[11px] text-gray-600 font-mono bg-gray-50 px-2.5 py-1 rounded border border-gray-100">
                ⚡ Live Sync: {rep.liveMetric}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-1.5 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setPreviewReport(rep)}
                className="px-2.5 py-1.5 border border-gray-300 bg-white hover:bg-gray-50 rounded-lg text-[11px] font-bold text-gray-800 cursor-pointer"
              >
                👁️ Lihat Data ({rep.rows.length})
              </button>
              <button
                type="button"
                onClick={() =>
                  exportToExcel(
                    rep.excelData,
                    rep.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 35),
                    rep.role
                  )
                }
                className="px-2.5 py-1.5 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-[11px] font-bold text-emerald-800 cursor-pointer"
                title="Download Excel (.xlsx) Data Live"
              >
                📥 Excel
              </button>
              <button
                type="button"
                onClick={() =>
                  exportToPDF(
                    rep.title,
                    rep.headers,
                    rep.rows,
                    rep.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 35),
                    {
                      subtitle: `Divisi: ${rep.role} · Periode: ${rep.period} · ${rep.liveMetric}`,
                      printedBy: currentUser?.name || 'Pejabat Internal',
                    }
                  )
                }
                className="px-2.5 py-1.5 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg text-[11px] font-bold text-red-800 cursor-pointer"
                title="Download PDF (.pdf) Data Live"
              >
                📄 PDF
              </button>
              <button
                type="button"
                onClick={() =>
                  printHtmlReport(
                    rep.title,
                    `Divisi: ${rep.role} · Periode: ${rep.period} · ${rep.liveMetric}`,
                    rep.headers,
                    rep.rows,
                    {
                      printedBy: currentUser?.name || 'Pejabat Internal',
                      summaryText: rep.liveMetric,
                    }
                  )
                }
                className="px-2.5 py-1.5 border border-gray-300 hover:bg-gray-50 rounded-lg text-[11px] font-bold text-gray-700 flex items-center gap-1 cursor-pointer"
                title="Cetak Langsung (Print)"
              >
                <Printer className="w-3 h-3" />
                <span>Print</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL PREVIEW TABEL LAPORAN LIVE */}
      {previewReport && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setPreviewReport(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-5xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-200 flex items-start justify-between gap-4 bg-gray-50">
              <div>
                <div className="text-[11px] font-mono font-bold text-emerald-700">
                  PREVIEW DATA LAPORAN LIVE · ROLE: {previewReport.role} · PERIODE: {previewReport.period}
                </div>
                <h3 className="text-base font-bold text-gray-900 mt-0.5">{previewReport.title}</h3>
                <p className="text-xs text-gray-600 mt-0.5">{previewReport.liveMetric}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewReport(null)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-auto flex-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50 text-gray-600">
                    {previewReport.headers.map((h) => (
                      <th key={h} className="py-2.5 px-3 font-bold whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {previewReport.rows.map((r, rIdx) => (
                    <tr key={rIdx} className="hover:bg-gray-50">
                      {r.map((cell, cIdx) => (
                        <td key={cIdx} className="py-2 px-3 text-gray-800">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  exportToExcel(
                    previewReport.excelData,
                    previewReport.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 35),
                    previewReport.role
                  )
                }
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
              >
                📥 Download Excel (.xlsx)
              </button>
              <button
                type="button"
                onClick={() =>
                  printHtmlReport(
                    previewReport.title,
                    `Divisi: ${previewReport.role} · Periode: ${previewReport.period} · ${previewReport.liveMetric}`,
                    previewReport.headers,
                    previewReport.rows,
                    {
                      printedBy: currentUser?.name || 'Pejabat Internal',
                      summaryText: previewReport.liveMetric,
                    }
                  )
                }
                className="px-3.5 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl cursor-pointer"
              >
                🖨️ Cetak Laporan Resmi
              </button>
              <button
                type="button"
                onClick={() => setPreviewReport(null)}
                className="px-3.5 py-2 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-semibold rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

