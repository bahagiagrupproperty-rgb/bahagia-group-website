import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  useAppStore,
  ProjectSubmissionRecord,
  ProjectSubmissionType,
  ProjectSubmissionStatus,
  SubmissionRabItem,
} from '../store/useAppStore';
import { formatRupiah, terbilangRupiah, FASUM_16_TYPES, FASOS_4_TYPES } from '../data/seedData';
import { UploadFoto } from '../components/UploadFoto';
import { SuperAdminCrudBar } from '../components/SuperAdminCrudBar';
import {
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  Printer,
  MapPin,
  Trash2,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ArrowLeft,
  Building2,
  LandPlot,
  Wrench,
  Landmark,
  FileText,
  Clock,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

const JENIS_BADGE: Record<ProjectSubmissionType, { label: string; color: string }> = {
  LAHAN: { label: '1. Pembelian Lahan Baru', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' },
  UNIT: { label: '2. Pembangunan Unit Baru', color: 'text-blue-800 bg-blue-50 border-blue-200' },
  FASUM: { label: '3. Pembangunan Fasum/Fasos', color: 'text-purple-800 bg-purple-50 border-purple-200' },
  RENOVASI: { label: '4. Renovasi / Perbaikan', color: 'text-amber-800 bg-amber-50 border-amber-200' },
};

export const ProjectSubmissionsHubPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    projectSubmissions,
    saveProjectSubmission,
    verifyProjectSubmissionByFinance,
    approveProjectSubmissionByDirector,
    addProjectSubmissionComment,
    updateSubmissionRealizationItem,
    advanceLahanAcquisitionStage,
    approvalLimit,
    currentUser,
  } = useAppStore();

  // Determine current sub-route
  const path = location.pathname;
  const isFormLahan = path.includes('/pengajuan-proyek/lahan-baru');
  const isFormUnit = path.includes('/pengajuan-proyek/unit-baru');
  const isFormFasum = path.includes('/pengajuan-proyek/fasum-baru');
  const isFormRenovasi = path.includes('/pengajuan-proyek/renovasi');
  const isRabVsRealisasi = path.includes('/rab-vs-realisasi');

  // Filter & Search States for Main List
  const [typeFilter, setTypeFilter] = useState<'ALL' | ProjectSubmissionType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ProjectSubmissionStatus>('ALL');
  const [ptFilter, setPtFilter] = useState<'ALL' | 'PT_TBL' | 'PT_BPP'>('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewTypeModal, setShowNewTypeModal] = useState(false);

  // Selected submission for Detail Modal / Drawer or RAB vs Realisasi
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');

  // =========================================================
  // FORM STATES FOR 4 SUBMISSION TYPES
  // =========================================================
  const [companyId, setCompanyId] = useState<'PT_TBL' | 'PT_BPP'>('PT_TBL');
  const [projectName, setProjectName] = useState('');
  const [locationText, setLocationText] = useState('');
  const [notesText, setNotesText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<{ name: string; category: string; url: string }[]>([
    { name: 'Dokumen_Pendukung_Teknis_PJT.pdf', category: 'Dokumen Utama', url: '#' },
  ]);

  // Jenis 1: Pembelian Lahan Baru
  const [lat, setLat] = useState(-4.0096);
  const [lng, setLng] = useState(122.5127);
  const [landArea, setLandArea] = useState(5000);
  const [ownerName, setOwnerName] = useState('H. Muhammad Darwis');
  const [ownerPhone, setOwnerPhone] = useState('081241889900');
  const [usagePlan, setUsagePlan] = useState('Pengembangan Cluster Baru 40 Unit Rumah Subsidi');
  const [targetAcquisitionDate, setTargetAcquisitionDate] = useState('2026-11-30');
  const [pricePerM2, setPricePerM2] = useState(250000);
  const [bphtbAmount, setBphtbAmount] = useState(50000000);
  const [notaryCost, setNotaryCost] = useState(25000000);
  const [measurementCost, setMeasurementCost] = useState(10000000);
  const [certificationCost, setCertificationCost] = useState(25000000);
  const [nameTransferCost, setNameTransferCost] = useState(15000000);
  const [landMaturationCost, setLandMaturationCost] = useState(75000000);
  const [permitCost, setPermitCost] = useState(25000000);
  const [otherCost, setOtherCost] = useState(10000000);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Tempo' | 'Bank'>('Tempo');
  const [installmentCount, setInstallmentCount] = useState(3);
  const [dueDate, setDueDate] = useState('2027-04-30');
  const [bankName, setBankName] = useState('Bank BTN Cabang Kendari');
  const [tenorMonths, setTenorMonths] = useState(24);

  const totalLandPrice = landArea * pricePerM2;
  const totalLahanRab =
    totalLandPrice +
    bphtbAmount +
    notaryCost +
    measurementCost +
    certificationCost +
    nameTransferCost +
    landMaturationCost +
    permitCost +
    otherCost;

  // Jenis 2: Pembangunan Unit Baru
  const [blockAndNumbers, setBlockAndNumbers] = useState('Blok D (Nomor D-11 s/d D-20)');
  const [unitCount, setUnitCount] = useState(10);
  const [unitType, setUnitType] = useState<'36/91' | '45/105' | '54/120' | '60/135' | 'Ruko 2 Lantai'>('36/91');
  const [landAreaPerUnit, setLandAreaPerUnit] = useState(91);
  const [buildingAreaPerUnit, setBuildingAreaPerUnit] = useState(36);
  const [startDate, setStartDate] = useState('2026-10-15');
  const [endDate, setEndDate] = useState('2026-12-30');
  const [picName, setPicName] = useState(currentUser?.name || 'Ir. Lukman Hakim, S.T., IPM');
  const [materialRows, setMaterialRows] = useState([
    { id: 'm-1', name: 'Semen Tonasa 50 Kg', qty: 50, unit: 'Sak', price: 75000 },
    { id: 'm-2', name: 'Besi Beton Polos 10mm SNI', qty: 40, unit: 'Batang', price: 87500 },
    { id: 'm-3', name: 'Batu Bata Merah / Batako Press', qty: 3500, unit: 'Biji', price: 950 },
    { id: 'm-4', name: 'Paket Rangka Baja Ringan, Atap, Plafon, Keramik & Sanitair', qty: 1, unit: 'Paket', price: 33076710 },
  ]);
  const [wageRows, setWageRows] = useState([
    { id: 'w-1', name: 'Pekerjaan Galian & Pondasi Batu Kali', vol: 1, unit: 'Ls', price: 5000000 },
    { id: 'w-2', name: 'Pasangan Dinding, Plesteran & Acian', vol: 120, unit: 'm²', price: 50000 },
    { id: 'w-3', name: 'Pekerjaan Struktur, Atap, Keramik, Listrik & Finishing', vol: 1, unit: 'Ls', price: 13000000 },
  ]);
  const [overheadPercent, setOverheadPercent] = useState(0);
  const [profitPercent, setProfitPercent] = useState(0);
  const [ppnPercent, setPpnPercent] = useState(0);
  const [fundingSource, setFundingSource] = useState<'Kas' | 'Bank' | 'Investor'>('Bank');
  const [disbursementSchedule, setDisbursementSchedule] = useState(
    'Termin 1 (30% Pondasi), Termin 2 (40% Atap), Termin 3 (30% BAST)'
  );
  const [contractorPaymentScheme, setContractorPaymentScheme] = useState(
    'Opname Mingguan Mandor Berdasarkan Progress Fisik'
  );

  const subtotalMaterialPerUnit = materialRows.reduce((acc, r) => acc + r.qty * r.price, 0);
  const subtotalWagePerUnit = wageRows.reduce((acc, r) => acc + r.vol * r.price, 0);
  const baseRabPerUnit = subtotalMaterialPerUnit + subtotalWagePerUnit;
  const rabPerUnitAfterOhProfit = Math.round(
    baseRabPerUnit * (1 + (overheadPercent + profitPercent) / 100)
  );
  const totalAllUnitsBeforeTax = rabPerUnitAfterOhProfit * unitCount;
  const totalUnitGrandRab = Math.round(totalAllUnitsBeforeTax * (1 + ppnPercent / 100));

  // Jenis 3: Pembangunan Fasum / Fasos
  const [facilityCategory, setFacilityCategory] = useState<'Fasum' | 'Fasos'>('Fasum');
  const [facilitySubType, setFacilitySubType] = useState('Masjid/Musholla');
  const [volumeOrArea, setVolumeOrArea] = useState('144 m² (12×12m)');
  const [technicalSpec, setTechnicalSpec] = useState(
    'Beton bertulang K-225, lantai granit 60×60, kubah galvalum enamel'
  );
  const [fasumRows, setFasumRows] = useState([
    { id: 'f-1', desc: 'Pekerjaan Tanah, Galian & Pondasi', vol: 1, unit: 'Ls', price: 45000000 },
    { id: 'f-2', desc: 'Pekerjaan Struktur Beton & Atap', vol: 144, unit: 'm²', price: 850000 },
    { id: 'f-3', desc: 'Arsitektur, Keramik, Listrik & Finishing', vol: 1, unit: 'Ls', price: 52600000 },
  ]);
  const [fasumOverheadPct, setFasumOverheadPct] = useState(10);
  const fasumSubtotal = fasumRows.reduce((acc, r) => acc + r.vol * r.price, 0);
  const fasumGrandTotal = Math.round(fasumSubtotal * (1 + fasumOverheadPct / 100));

  // Jenis 4: Renovasi / Perbaikan
  const [renovationLevel, setRenovationLevel] = useState<'Ringan' | 'Sedang' | 'Berat'>('Sedang');
  const [damageDescription, setDamageDescription] = useState(
    'Retak dinding saluran drainase & perkerasan bahu jalan lingkungan akibat curah hujan tinggi'
  );
  const [renovasiRows, setRenovasiRows] = useState([
    { id: 'r-1', desc: 'Pembongkaran & Pasangan Ulang Batu Kali', vol: 25, unit: 'm¹', price: 350000 },
    { id: 'r-2', desc: 'Plesteran, Acian & Pengecatan Ulang', vol: 40, unit: 'm²', price: 120000 },
  ]);
  const renovasiGrandTotal = renovasiRows.reduce((acc, r) => acc + r.vol * r.price, 0);

  // Filtered submissions
  const filteredSubmissions = projectSubmissions.filter((sub) => {
    if (typeFilter !== 'ALL' && sub.type !== typeFilter) return false;
    if (statusFilter !== 'ALL' && sub.status !== statusFilter) return false;
    if (ptFilter !== 'ALL' && sub.companyId !== ptFilter) return false;
    if (dateFilter && sub.date !== dateFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        sub.projectName.toLowerCase().includes(q) ||
        sub.submissionNumber.toLowerCase().includes(q) ||
        sub.requester.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeDetailSub: ProjectSubmissionRecord | undefined =
    projectSubmissions.find((p) => p.id === selectedSubId) || projectSubmissions[0];

  const handleSaveOrSubmit = (type: ProjectSubmissionType, submitForApproval: boolean) => {
    const today = new Date().toISOString().slice(0, 10);
    let items: SubmissionRabItem[] = [];
    let rabAmount = 0;
    let defaultName = projectName;

    if (type === 'LAHAN') {
      defaultName = projectName || 'Pengajuan Pembelian Lahan Baru Tahap Pengembangan';
      rabAmount = totalLahanRab;
      items = [
        {
          id: `l-1-${Date.now()}`,
          category: 'Biaya Lahan',
          description: `Harga Pokok Lahan (${landArea.toLocaleString('id-ID')} m² × ${formatRupiah(pricePerM2)})`,
          volume: landArea,
          realizedVolume: 0,
          unit: 'm²',
          unitPrice: pricePerM2,
          subtotal: totalLandPrice,
          realizedAmount: 0,
          itemStatus: 'Belum',
        },
        {
          id: `l-2-${Date.now()}`,
          category: 'Biaya Lahan',
          description: 'BPHTB 5%, Notaris/PPAT, Pengukuran, Sertifikasi & Balik Nama',
          volume: 1,
          realizedVolume: 0,
          unit: 'Paket Legal',
          unitPrice: bphtbAmount + notaryCost + measurementCost + certificationCost + nameTransferCost,
          subtotal: bphtbAmount + notaryCost + measurementCost + certificationCost + nameTransferCost,
          realizedAmount: 0,
          itemStatus: 'Belum',
        },
        {
          id: `l-3-${Date.now()}`,
          category: 'Biaya Lahan',
          description: 'Pematangan Lahan (Urug & Pembersihan), Perizinan & Lain-lain',
          volume: 1,
          realizedVolume: 0,
          unit: 'Paket Teknis',
          unitPrice: landMaturationCost + permitCost + otherCost,
          subtotal: landMaturationCost + permitCost + otherCost,
          realizedAmount: 0,
          itemStatus: 'Belum',
        },
      ];
    } else if (type === 'UNIT') {
      defaultName = projectName || `Pembangunan ${unitCount} Unit Baru (${blockAndNumbers})`;
      rabAmount = totalUnitGrandRab;
      items = [
        ...materialRows.map((m) => ({
          id: m.id,
          category: 'Material' as const,
          description: `${m.name} (${m.qty} ${m.unit}/unit × ${unitCount} unit)`,
          volume: m.qty * unitCount,
          realizedVolume: 0,
          unit: m.unit,
          unitPrice: m.price,
          subtotal: m.qty * m.price * unitCount,
          realizedAmount: 0,
          itemStatus: 'Belum' as const,
        })),
        ...wageRows.map((w) => ({
          id: w.id,
          category: 'Upah' as const,
          description: `${w.name} (${w.vol} ${w.unit}/unit × ${unitCount} unit)`,
          volume: w.vol * unitCount,
          realizedVolume: 0,
          unit: w.unit,
          unitPrice: w.price,
          subtotal: w.vol * w.price * unitCount,
          realizedAmount: 0,
          itemStatus: 'Belum' as const,
        })),
      ];
    } else if (type === 'FASUM') {
      defaultName = projectName || `Pembangunan ${facilityCategory}: ${facilitySubType}`;
      rabAmount = fasumGrandTotal;
      items = fasumRows.map((f) => ({
        id: f.id,
        category: 'Pekerjaan Fasum' as const,
        description: f.desc,
        volume: f.vol,
        realizedVolume: 0,
        unit: f.unit,
        unitPrice: f.price,
        subtotal: f.vol * f.price,
        realizedAmount: 0,
        itemStatus: 'Belum' as const,
      }));
    } else {
      defaultName = projectName || `Renovasi ${renovationLevel} - ${locationText || 'Kawasan Perumahan'}`;
      rabAmount = renovasiGrandTotal;
      items = renovasiRows.map((r) => ({
        id: r.id,
        category: 'Perbaikan' as const,
        description: r.desc,
        volume: r.vol,
        realizedVolume: 0,
        unit: r.unit,
        unitPrice: r.price,
        subtotal: r.vol * r.price,
        realizedAmount: 0,
        itemStatus: 'Belum' as const,
      }));
    }

    const created = saveProjectSubmission(
      {
        date: today,
        type,
        projectName: defaultName,
        companyId,
        rabAmount,
        status: submitForApproval ? 'Menunggu Verifikasi Keuangan' : 'Draft',
        requester: currentUser?.name || 'Ir. Lukman Hakim, S.T., IPM',
        requesterRole: currentUser?.role || 'PJT',
        location: locationText || 'Kawasan Perumahan Bahagia Group',
        notes: notesText || 'Sesuai perhitungan RAB teknis PJT.',
        documents: uploadedDocs,
        photos,
        items,
        lahanData:
          type === 'LAHAN'
            ? {
                lat,
                lng,
                landArea,
                ownerName,
                ownerPhone,
                usagePlan,
                targetAcquisitionDate,
                pricePerM2,
                totalLandPrice,
                bphtbAmount,
                notaryCost,
                measurementCost,
                certificationCost,
                nameTransferCost,
                landMaturationCost,
                permitCost,
                otherCost,
                paymentMethod,
                installmentCount,
                dueDate,
                bankName,
                tenorMonths,
                acquisitionStage: 'Menunggu Akuisisi',
              }
            : undefined,
        unitData:
          type === 'UNIT'
            ? {
                blockAndNumbers,
                unitCount,
                unitType,
                landAreaPerUnit,
                buildingAreaPerUnit,
                startDate,
                endDate,
                picName,
                materialSubtotalPerUnit: subtotalMaterialPerUnit,
                wageSubtotalPerUnit: subtotalWagePerUnit,
                overheadPercent,
                profitPercent,
                rabPerUnitFinal: rabPerUnitAfterOhProfit,
                ppnPercent,
                fundingSource,
                disbursementSchedule,
                contractorPaymentScheme,
              }
            : undefined,
        fasumData:
          type === 'FASUM'
            ? {
                facilityCategory,
                facilitySubType,
                volumeOrArea,
                technicalSpec,
                startDate,
                endDate,
                overheadPercent: fasumOverheadPct,
              }
            : undefined,
        renovasiData:
          type === 'RENOVASI'
            ? {
                renovationLevel,
                damageDescription,
                targetCompletionDate: endDate,
                overheadPercent: 0,
              }
            : undefined,
      },
      submitForApproval
    );

    toast.success(
      submitForApproval
        ? `Pengajuan ${created.submissionNumber} berhasil diajukan! Alert notifikasi Firestore real-time terkirim ke Keuangan & Direktur.`
        : `Draft ${created.submissionNumber} berhasil disimpan.`
    );
    navigate('/project/pengajuan-proyek');
  };

  // =========================================================
  // RENDER: RAB VS REALISASI (/project/rab-vs-realisasi)
  // =========================================================
  if (isRabVsRealisasi) {
    const sub = activeDetailSub;
    const totalRab = sub ? sub.items.reduce((a, b) => a + b.subtotal, 0) : 0;
    const totalReal = sub ? sub.items.reduce((a, b) => a + b.realizedAmount, 0) : 0;
    const diff = totalRab - totalReal;
    const pctReal = totalRab > 0 ? Math.round((totalReal / totalRab) * 100) : 0;

    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-emerald-700">
              MONITORING ANGGARAN PROYEK · /project/rab-vs-realisasi
            </div>
            <h1 className="text-xl font-bold text-gray-900 mt-0.5">
              Perbandingan RAB vs Realisasi Pengajuan Proyek PJT
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Warna Hijau: Realisasi &lt; RAB (Hemat) · Kuning: 90–100% RAB (Hati-hati) · Merah: &gt; RAB (Over Budget + Alert Direktur)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sub?.id || ''}
              onChange={(e) => setSelectedSubId(e.target.value)}
              className="text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white font-semibold"
            >
              {projectSubmissions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.submissionNumber} — {p.projectName}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => navigate('/project/pengajuan-proyek')}
              className="px-3.5 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Daftar Pengajuan</span>
            </button>
          </div>
        </div>

        {sub && (
          <>
            {/* Summary Cards + Bar Chart */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-1">
                <div className="text-gray-500">Total Anggaran RAB</div>
                <div className="font-mono text-lg font-bold text-gray-900 tabular-nums">
                  {formatRupiah(totalRab)}
                </div>
                <div className="text-[11px] text-gray-500">{sub.submissionNumber}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-1">
                <div className="text-gray-500">Total Realisasi Lapangan</div>
                <div className="font-mono text-lg font-bold text-emerald-700 tabular-nums">
                  {formatRupiah(totalReal)}
                </div>
                <div className="text-[11px] text-gray-500">Serapan: {pctReal}% dari RAB</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-1">
                <div className="text-gray-500">Selisih (RAB - Realisasi)</div>
                <div
                  className={`font-mono text-lg font-bold tabular-nums ${
                    diff >= 0 ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  {diff >= 0 ? `+${formatRupiah(diff)} (Hemat)` : `${formatRupiah(diff)} (Over Budget!)`}
                </div>
                <div className="text-[11px] text-gray-500">
                  {diff < 0 ? '⚠️ Alert terkirim ke Direktur' : 'Efisiensi Anggaran Terjaga'}
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-gray-600 font-semibold">
                  <span>Grafik Bar Serapan</span>
                  <span className="font-mono">{pctReal}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      pctReal > 100
                        ? 'bg-red-600'
                        : pctReal >= 90
                        ? 'bg-amber-500'
                        : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(100, pctReal)}%` }}
                  />
                </div>
                <div className="text-[11px] text-gray-500">Status: {sub.status}</div>
              </div>
            </div>

            {/* Table RAB vs Realisasi per Item */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-gray-900">
                Tabel Rincian RAB vs Realisasi per Item Pekerjaan / Material
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500">
                      <th className="py-2.5 pr-2">No</th>
                      <th className="py-2.5 px-2">Uraian Item</th>
                      <th className="py-2.5 px-2 text-right">Vol RAB</th>
                      <th className="py-2.5 px-2 text-right">Vol Realisasi</th>
                      <th className="py-2.5 px-2 text-right">RAB (Rp)</th>
                      <th className="py-2.5 px-2 text-right">Realisasi (Rp)</th>
                      <th className="py-2.5 px-2 text-right">Selisih</th>
                      <th className="py-2.5 px-2 text-right">%</th>
                      <th className="py-2.5 pl-2 text-right">Status & Indikator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sub.items.map((it, idx) => {
                      const itemDiff = it.subtotal - it.realizedAmount;
                      const itemPct = it.subtotal > 0 ? Math.round((it.realizedAmount / it.subtotal) * 100) : 0;
                      const badgeColor =
                        itemPct > 100
                          ? 'text-red-700 bg-red-50 border-red-200'
                          : itemPct >= 90
                          ? 'text-amber-800 bg-amber-50 border-amber-200'
                          : 'text-emerald-800 bg-emerald-50 border-emerald-200';
                      return (
                        <tr key={it.id} className="hover:bg-gray-50">
                          <td className="py-2.5 pr-2 font-mono">{idx + 1}</td>
                          <td className="py-2.5 px-2">
                            <div className="font-semibold text-gray-900">{it.description}</div>
                            <div className="text-[11px] text-gray-500">{it.category}</div>
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                            {it.volume} {it.unit}
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            <input
                              type="number"
                              value={it.realizedVolume}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                updateSubmissionRealizationItem(
                                  sub.id,
                                  it.id,
                                  v,
                                  v * it.unitPrice,
                                  v >= it.volume ? 'Selesai' : v > 0 ? 'Proses' : 'Belum'
                                );
                              }}
                              className="w-20 border border-gray-300 rounded px-2 py-1 text-right font-mono bg-white"
                            />
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                            {formatRupiah(it.subtotal)}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono font-semibold tabular-nums">
                            {formatRupiah(it.realizedAmount)}
                          </td>
                          <td
                            className={`py-2.5 px-2 text-right font-mono font-semibold tabular-nums ${
                              itemDiff >= 0 ? 'text-emerald-700' : 'text-red-600'
                            }`}
                          >
                            {formatRupiah(itemDiff)}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums">{itemPct}%</td>
                          <td className="py-2.5 pl-2 text-right">
                            <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${badgeColor}`}>
                              {it.itemStatus} · {itemPct > 100 ? 'Over Budget' : itemPct >= 90 ? 'Hati-hati' : 'Hemat'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // =========================================================
  // RENDER: FORM 1 - PEMBELIAN LAHAN BARU (/project/pengajuan-proyek/lahan-baru)
  // =========================================================
  if (isFormLahan) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono font-bold text-emerald-700">
              JENIS 1 · /project/pengajuan-proyek/lahan-baru
            </div>
            <h1 className="text-xl font-bold text-gray-900 mt-0.5">
              Form Pengajuan Pembelian Lahan Baru (PJT)
            </h1>
            <p className="text-xs text-gray-500">
              Alur: PJT Submit → Verifikasi Keuangan → Approval Direktur → Otomatis Masuk /project/lahan
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/project/pengajuan-proyek')}
            className="px-3.5 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
          <div className="lg:col-span-8 space-y-6">
            {/* Section 1 - Informasi Proyek */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
                Section 1 — Informasi Proyek & Titik Koordinat Lahan
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 block mb-1">Nama Proyek Pengembangan *</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Contoh: Bahagia Residence Tahap 2"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">Perusahaan (PT)</label>
                  <select
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="PT_TBL">PT Tata Bahagia Land</option>
                    <option value="PT_BPP">PT Bahagia Prima Property</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-gray-600 block mb-1">Lokasi Lahan Lengkap *</label>
                  <input
                    type="text"
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                    placeholder="Jl. Poros Bandara Haluoleo KM 14, Ranomeeto, Konawe Selatan"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">Latitude (Titik Koordinat)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lat}
                    onChange={(e) => setLat(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">Longitude (Titik Koordinat)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lng}
                    onChange={(e) => setLng(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">Luas Lahan (m²) *</label>
                  <input
                    type="number"
                    value={landArea}
                    onChange={(e) => setLandArea(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">Target Akuisisi (Tanggal)</label>
                  <input
                    type="date"
                    value={targetAcquisitionDate}
                    onChange={(e) => setTargetAcquisitionDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">Nama Pemilik Lahan</label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">Kontak Pemilik (No HP)</label>
                  <input
                    type="text"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-gray-600 block mb-1">Rencana Penggunaan (Untuk Proyek Apa)</label>
                  <input
                    type="text"
                    value={usagePlan}
                    onChange={(e) => setUsagePlan(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Section 2 - Rincian Biaya */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
                Section 2 — Rincian Biaya Akuisisi & Pematangan Lahan (Auto-Sum)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 block mb-1">Harga Lahan per m² (Rp)</label>
                  <input
                    type="number"
                    value={pricePerM2}
                    onChange={(e) => setPricePerM2(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">
                    Harga Total Lahan (Otomatis: Luas × Harga/m²)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={formatRupiah(totalLandPrice)}
                    className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 font-mono font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">BPHTB 5% dari NJOP (Input Manual Rp)</label>
                  <input
                    type="number"
                    value={bphtbAmount}
                    onChange={(e) => setBphtbAmount(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">Biaya Notaris / PPAT (Rp)</label>
                  <input
                    type="number"
                    value={notaryCost}
                    onChange={(e) => setNotaryCost(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">Biaya Pengukuran BPN (Rp)</label>
                  <input
                    type="number"
                    value={measurementCost}
                    onChange={(e) => setMeasurementCost(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">Biaya Sertifikasi Induk/Pecah (Rp)</label>
                  <input
                    type="number"
                    value={certificationCost}
                    onChange={(e) => setCertificationCost(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">Biaya Balik Nama (Rp)</label>
                  <input
                    type="number"
                    value={nameTransferCost}
                    onChange={(e) => setNameTransferCost(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">
                    Biaya Pematangan Lahan (Urug, Pembersihan) (Rp)
                  </label>
                  <input
                    type="number"
                    value={landMaturationCost}
                    onChange={(e) => setLandMaturationCost(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">Biaya Perizinan Lingkungan/PKKPR (Rp)</label>
                  <input
                    type="number"
                    value={permitCost}
                    onChange={(e) => setPermitCost(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">Biaya Lain-lain (Rp)</label>
                  <input
                    type="number"
                    value={otherCost}
                    onChange={(e) => setOtherCost(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 3 - Cara Pembayaran */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
                Section 3 — Cara Pembayaran Akuisisi Lahan
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-600 block mb-1">Metode Pembayaran</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white font-semibold"
                  >
                    <option value="Cash">Cash / Tunai Keras</option>
                    <option value="Tempo">Tempo Bertahap (Termin)</option>
                    <option value="Bank">Pembiayaan Bank (KYG)</option>
                  </select>
                </div>
                {paymentMethod === 'Tempo' && (
                  <>
                    <div>
                      <label className="text-gray-600 block mb-1">Berapa Kali Cicilan (Termin)</label>
                      <input
                        type="number"
                        value={installmentCount}
                        onChange={(e) => setInstallmentCount(Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-gray-600 block mb-1">Jatuh Tempo Pelunasan</label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                      />
                    </div>
                  </>
                )}
                {paymentMethod === 'Bank' && (
                  <>
                    <div>
                      <label className="text-gray-600 block mb-1">Nama Bank Mitra</label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="text-gray-600 block mb-1">Tenor Kredit (Bulan)</label>
                      <input
                        type="number"
                        value={tenorMonths}
                        onChange={(e) => setTenorMonths(Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Map Preview, Docs Upload, Total Summary & Actions */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
              <div className="font-bold text-gray-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Google Maps Koordinat Preview</span>
              </div>
              <div className="p-4 bg-gray-900 text-white rounded-xl font-mono text-[11px] space-y-1">
                <div>LATITUDE : {lat}</div>
                <div>LONGITUDE: {lng}</div>
                <div className="text-emerald-400 pt-1">
                  ✓ Zona Pemukiman Terverifikasi ({landArea.toLocaleString('id-ID')} m²)
                </div>
              </div>
              <UploadFoto
                photos={photos}
                onChange={setPhotos}
                label="Section 4 — Upload Sertifikat, Gambar Situasi, Foto Lahan & Surat Penawaran"
              />
              <div>
                <label className="text-gray-600 block mb-1">Section 5 — Catatan Tambahan PJT</label>
                <textarea
                  rows={3}
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Catatan kelayakan kontur tanah, akses jalan, dan legalitas SHM..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="bg-emerald-950 text-white rounded-xl p-6 space-y-3">
              <div className="text-xs text-emerald-300 font-mono">TOTAL BIAYA AKUISISI LAHAN (AUTO-SUM)</div>
              <div className="text-2xl font-bold font-mono tabular-nums">
                {formatRupiah(totalLahanRab)}
              </div>
              <div className="text-[11px] text-emerald-200 italic">
                Terbilang: # {terbilangRupiah(totalLahanRab)} #
              </div>
              <div className="pt-3 space-y-2">
                <button
                  type="button"
                  onClick={() => handleSaveOrSubmit('LAHAN', true)}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-lg cursor-pointer"
                >
                  Ajukan Approval (Ke Keuangan & Direktur)
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveOrSubmit('LAHAN', false)}
                    className="py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg cursor-pointer"
                  >
                    Simpan Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER: FORM 2 - PEMBANGUNAN UNIT BARU (/project/pengajuan-proyek/unit-baru)
  // =========================================================
  if (isFormUnit) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono font-bold text-blue-700">
              JENIS 2 · /project/pengajuan-proyek/unit-baru
            </div>
            <h1 className="text-xl font-bold text-gray-900 mt-0.5">
              Form Pengajuan Pembangunan Unit Baru + RAB Dinamis (Material & Upah)
            </h1>
            <p className="text-xs text-gray-500">
              Standar HPP Rumah Subsidi Tipe 36/91: Rp67.651.710 / Unit
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/project/pengajuan-proyek')}
            className="px-3.5 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5 text-xs">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
            Section 1 — Informasi Proyek / Cluster & Spesifikasi Unit
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="text-gray-600 block mb-1">Nama Proyek / Cluster *</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Contoh: Pembangunan 10 Unit Rumah Subsidi Blok D"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-gray-600 block mb-1">Lokasi (Blok, Nomor Unit)</label>
              <input
                type="text"
                value={blockAndNumbers}
                onChange={(e) => setBlockAndNumbers(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-gray-600 block mb-1">Jumlah Unit yang Dibangun</label>
              <input
                type="number"
                min={1}
                value={unitCount}
                onChange={(e) => setUnitCount(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono font-bold text-emerald-700"
              />
            </div>
            <div>
              <label className="text-gray-600 block mb-1">Tipe Unit</label>
              <select
                value={unitType}
                onChange={(e) => setUnitType(e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
              >
                <option value="36/91">Tipe 36/91 Subsidi</option>
                <option value="45/105">Tipe 45/105 Komersil</option>
                <option value="54/120">Tipe 54/120 Deluxe</option>
                <option value="60/135">Tipe 60/135</option>
                <option value="Ruko 2 Lantai">Ruko 2 Lantai</option>
              </select>
            </div>
            <div>
              <label className="text-gray-600 block mb-1">Luas Tanah / Unit (m²)</label>
              <input
                type="number"
                value={landAreaPerUnit}
                onChange={(e) => setLandAreaPerUnit(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
              />
            </div>
            <div>
              <label className="text-gray-600 block mb-1">Luas Bangunan / Unit (m²)</label>
              <input
                type="number"
                value={buildingAreaPerUnit}
                onChange={(e) => setBuildingAreaPerUnit(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
              />
            </div>
            <div>
              <label className="text-gray-600 block mb-1">Penanggung Jawab (PJT)</label>
              <input
                type="text"
                value={picName}
                onChange={(e) => setPicName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          {/* Section 2: Tabel Material & Tabel Upah per Unit */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">
                Section 2A — Tabel RAB Material per Unit (Dinamis)
              </h3>
              <button
                type="button"
                onClick={() =>
                  setMaterialRows([
                    ...materialRows,
                    { id: `m-${Date.now()}`, name: 'Material Tambahan', qty: 10, unit: 'Sak', price: 75000 },
                  ])
                }
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> + Tambah Material
              </button>
            </div>
            <div className="space-y-2">
              {materialRows.map((row, idx) => (
                <div key={row.id} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                  <div className="col-span-1 font-mono text-gray-500">#{idx + 1}</div>
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) => {
                      const next = [...materialRows];
                      next[idx].name = e.target.value;
                      setMaterialRows(next);
                    }}
                    className="col-span-4 border border-gray-300 rounded px-2 py-1.5 bg-white"
                  />
                  <input
                    type="number"
                    value={row.qty}
                    onChange={(e) => {
                      const next = [...materialRows];
                      next[idx].qty = Number(e.target.value);
                      setMaterialRows(next);
                    }}
                    className="col-span-2 border border-gray-300 rounded px-2 py-1.5 bg-white font-mono"
                  />
                  <input
                    type="text"
                    value={row.unit}
                    onChange={(e) => {
                      const next = [...materialRows];
                      next[idx].unit = e.target.value;
                      setMaterialRows(next);
                    }}
                    className="col-span-1 border border-gray-300 rounded px-2 py-1.5 bg-white"
                  />
                  <input
                    type="number"
                    value={row.price}
                    onChange={(e) => {
                      const next = [...materialRows];
                      next[idx].price = Number(e.target.value);
                      setMaterialRows(next);
                    }}
                    className="col-span-2 border border-gray-300 rounded px-2 py-1.5 bg-white font-mono text-right"
                  />
                  <div className="col-span-1 text-right font-mono font-semibold">
                    {formatRupiah(row.qty * row.price)}
                  </div>
                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => setMaterialRows(materialRows.filter((x) => x.id !== row.id))}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="text-right font-mono font-bold text-gray-900">
                Subtotal Material per Unit: {formatRupiah(subtotalMaterialPerUnit)}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <h3 className="text-sm font-bold text-gray-900">
                Section 2B — Tabel RAB Upah Tukang per Unit (Dinamis)
              </h3>
              <button
                type="button"
                onClick={() =>
                  setWageRows([
                    ...wageRows,
                    { id: `w-${Date.now()}`, name: 'Upah Pekerjaan Tambahan', vol: 1, unit: 'Ls', price: 2500000 },
                  ])
                }
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> + Tambah Upah
              </button>
            </div>
            <div className="space-y-2">
              {wageRows.map((row, idx) => (
                <div key={row.id} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                  <div className="col-span-1 font-mono text-gray-500">#{idx + 1}</div>
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) => {
                      const next = [...wageRows];
                      next[idx].name = e.target.value;
                      setWageRows(next);
                    }}
                    className="col-span-4 border border-gray-300 rounded px-2 py-1.5 bg-white"
                  />
                  <input
                    type="number"
                    value={row.vol}
                    onChange={(e) => {
                      const next = [...wageRows];
                      next[idx].vol = Number(e.target.value);
                      setWageRows(next);
                    }}
                    className="col-span-2 border border-gray-300 rounded px-2 py-1.5 bg-white font-mono"
                  />
                  <input
                    type="text"
                    value={row.unit}
                    onChange={(e) => {
                      const next = [...wageRows];
                      next[idx].unit = e.target.value;
                      setWageRows(next);
                    }}
                    className="col-span-1 border border-gray-300 rounded px-2 py-1.5 bg-white"
                  />
                  <input
                    type="number"
                    value={row.price}
                    onChange={(e) => {
                      const next = [...wageRows];
                      next[idx].price = Number(e.target.value);
                      setWageRows(next);
                    }}
                    className="col-span-2 border border-gray-300 rounded px-2 py-1.5 bg-white font-mono text-right"
                  />
                  <div className="col-span-1 text-right font-mono font-semibold">
                    {formatRupiah(row.vol * row.price)}
                  </div>
                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => setWageRows(wageRows.filter((x) => x.id !== row.id))}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="text-right font-mono font-bold text-gray-900">
                Subtotal Upah per Unit: {formatRupiah(subtotalWagePerUnit)}
              </div>
            </div>
          </div>

          {/* Ringkasan & Sumber Dana */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-200">
            <div>
              <label className="text-gray-600 block mb-1">Overhead (%) & Profit (%)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={overheadPercent}
                  onChange={(e) => setOverheadPercent(Number(e.target.value))}
                  placeholder="Overhead %"
                  className="border border-gray-300 rounded-lg px-3 py-2 font-mono"
                />
                <input
                  type="number"
                  value={profitPercent}
                  onChange={(e) => setProfitPercent(Number(e.target.value))}
                  placeholder="Profit %"
                  className="border border-gray-300 rounded-lg px-3 py-2 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-gray-600 block mb-1">Sumber Dana (Section 3)</label>
              <select
                value={fundingSource}
                onChange={(e) => setFundingSource(e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
              >
                <option value="Bank">Kredit Konstruksi Bank (KYG)</option>
                <option value="Kas">Kas Internal PT</option>
                <option value="Investor">Dana Investor Mitra</option>
              </select>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <div className="flex justify-between">
                <span>Total RAB Akhir / Unit:</span>
                <span className="font-mono font-bold">{formatRupiah(rabPerUnitAfterOhProfit)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-emerald-950">
                <span>GRAND TOTAL ({unitCount} Unit):</span>
                <span className="font-mono">{formatRupiah(totalUnitGrandRab)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleSaveOrSubmit('UNIT', false)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700"
            >
              Simpan Draft
            </button>
            <button
              type="button"
              onClick={() => handleSaveOrSubmit('UNIT', true)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
            >
              Ajukan Approval Pembangunan Unit Baru
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER: FORM 3 - FASUM/FASOS BARU (/project/pengajuan-proyek/fasum-baru)
  // =========================================================
  if (isFormFasum) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono font-bold text-purple-700">
              JENIS 3 · /project/pengajuan-proyek/fasum-baru
            </div>
            <h1 className="text-xl font-bold text-gray-900 mt-0.5">
              Form Pengajuan Pembangunan Fasum (16 Jenis) & Fasos (4 Jenis)
            </h1>
          </div>
          <button
            type="button"
            onClick={() => navigate('/project/pengajuan-proyek')}
            className="px-3.5 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-gray-600 block mb-1">Kategori Fasilitas</label>
              <select
                value={facilityCategory}
                onChange={(e) => setFacilityCategory(e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white font-bold"
              >
                <option value="Fasum">Fasilitas Umum (16 Sub-Jenis)</option>
                <option value="Fasos">Fasilitas Sosial (4 Sub-Jenis)</option>
              </select>
            </div>
            <div>
              <label className="text-gray-600 block mb-1">Sub-Jenis Fasum / Fasos</label>
              <select
                value={facilitySubType}
                onChange={(e) => setFacilitySubType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
              >
                {(facilityCategory === 'Fasum' ? FASUM_16_TYPES : FASOS_4_TYPES).map((f) => (
                  <option key={f.id} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-600 block mb-1">Ukuran / Luas / Volume</label>
              <input
                type="text"
                value={volumeOrArea}
                onChange={(e) => setVolumeOrArea(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-gray-600 block mb-1">Nama Pekerjaan Fasum/Fasos *</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Contoh: Pembangunan Masjid Al-Ikhlas & Taman Bermain"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-gray-600 block mb-1">Overhead (%)</label>
              <input
                type="number"
                value={fasumOverheadPct}
                onChange={(e) => setFasumOverheadPct(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
              />
            </div>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-purple-900 font-bold">Total RAB Pembangunan {facilityCategory}</div>
              <div className="text-[11px] text-purple-700">
                Otomatis masuk ke /project/fasum atau /project/fasos setelah Approved Direktur
              </div>
            </div>
            <div className="font-mono text-xl font-bold text-purple-950">
              {formatRupiah(fasumGrandTotal)}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => handleSaveOrSubmit('FASUM', false)}
              className="px-4 py-2 border border-gray-300 rounded-lg font-semibold"
            >
              Simpan Draft
            </button>
            <button
              type="button"
              onClick={() => handleSaveOrSubmit('FASUM', true)}
              className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-lg"
            >
              Ajukan Approval Fasum/Fasos
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER: FORM 4 - RENOVASI / PERBAIKAN (/project/pengajuan-proyek/renovasi)
  // =========================================================
  if (isFormRenovasi) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono font-bold text-amber-700">
              JENIS 4 · /project/pengajuan-proyek/renovasi
            </div>
            <h1 className="text-xl font-bold text-gray-900 mt-0.5">
              Form Pengajuan Renovasi / Perbaikan Unit & Fasum
            </h1>
            <p className="text-xs text-gray-500">
              Jika &le; Limit ({formatRupiah(approvalLimit)}) langsung diproses Keuangan; jika &gt; Limit wajib Approval Direktur
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/project/pengajuan-proyek')}
            className="px-3.5 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-gray-600 block mb-1">Objek yang Direnovasi (Unit / Fasum / Jalan) *</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Contoh: Perbaikan Dinding Saluran Drainase Blok A"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-gray-600 block mb-1">Tingkat Renovasi</label>
              <select
                value={renovationLevel}
                onChange={(e) => setRenovationLevel(e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white font-bold"
              >
                <option value="Ringan">Renovasi Ringan</option>
                <option value="Sedang">Renovasi Sedang</option>
                <option value="Berat">Renovasi Berat</option>
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className="text-gray-600 block mb-1">Deskripsi Kerusakan / Kebutuhan Perbaikan</label>
              <textarea
                rows={2}
                value={damageDescription}
                onChange={(e) => setDamageDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <UploadFoto
            photos={photos}
            onChange={setPhotos}
            label="Foto Kondisi Saat Ini (Before) — Wajib Dilampirkan"
          />

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
            <div>
              <div className="font-bold text-amber-950">Total Estimasi Biaya Perbaikan</div>
              <div className="text-[11px] text-amber-800">
                {renovasiGrandTotal <= approvalLimit
                  ? '✓ Di bawah limit Rp1 Juta: Otomatis Approved & Diproses Keuangan'
                  : '⚠️ Di atas limit Rp1 Juta: Memerlukan Verifikasi Keuangan & Approval Direktur'}
              </div>
            </div>
            <div className="font-mono text-xl font-bold text-amber-950">
              {formatRupiah(renovasiGrandTotal)}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => handleSaveOrSubmit('RENOVASI', false)}
              className="px-4 py-2 border border-gray-300 rounded-lg font-semibold"
            >
              Simpan Draft
            </button>
            <button
              type="button"
              onClick={() => handleSaveOrSubmit('RENOVASI', true)}
              className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-lg"
            >
              Ajukan Renovasi / Perbaikan
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER DEFAULT: HALAMAN UTAMA (/project/pengajuan-proyek)
  // =========================================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-emerald-700">
            MODUL KHUSUS PJT (PENANGGUNG JAWAB TEKNIS) · /project/pengajuan-proyek
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-0.5">
            Daftar Pengajuan Proyek Baru & Rencana Anggaran Biaya (RAB) Lengkap
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            4 Jenis Pengajuan: Pembelian Lahan Baru · Pembangunan Unit Baru · Pembangunan Fasum/Fasos · Renovasi/Perbaikan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/project/rab-vs-realisasi')}
            className="px-3.5 py-2 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold rounded-lg cursor-pointer"
          >
            RAB vs Realisasi
          </button>
          <button
            type="button"
            onClick={() => toast.success('Data pengajuan proyek berhasil diekspor ke Excel (.xlsx)')}
            className="px-3.5 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
          <button
            type="button"
            onClick={() => setShowNewTypeModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajukan Proyek Baru</span>
          </button>
        </div>
      </div>

      {/* SUPER ADMIN 5-BUTTON CRUD TOOLBAR */}
      <SuperAdminCrudBar
        collectionKey="project_submissions"
        collectionLabel="Pengajuan Proyek & RAB PJT"
        itemCount={projectSubmissions.length}
        sampleAdjustTarget={{
          id: projectSubmissions[0]?.id || 'PPJ-UNIT-2026-10-0001',
          label: projectSubmissions[0]?.projectName || 'RAB Proyek',
          currentValue: projectSubmissions[0]?.rabAmount || 676517100,
          unitLabel: 'Rp',
        }}
      />

      {/* Filter & Search Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama proyek / nomor PPJ..."
            className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
        >
          <option value="ALL">Semua Jenis (4 Opsi)</option>
          <option value="LAHAN">1. Pembelian Lahan Baru</option>
          <option value="UNIT">2. Pembangunan Unit Baru</option>
          <option value="FASUM">3. Pembangunan Fasum/Fasos</option>
          <option value="RENOVASI">4. Renovasi / Perbaikan</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
        >
          <option value="ALL">Semua Status Approval</option>
          <option value="Draft">Draft</option>
          <option value="Menunggu Verifikasi Keuangan">Menunggu Verifikasi Keuangan</option>
          <option value="Menunggu Approval Direktur">Menunggu Approval Direktur</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <select
          value={ptFilter}
          onChange={(e) => setPtFilter(e.target.value as any)}
          className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
        >
          <option value="ALL">Semua Entitas PT</option>
          <option value="PT_TBL">PT Tata Bahagia Land</option>
          <option value="PT_BPP">PT Bahagia Prima Property</option>
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 font-mono"
        />
      </div>

      {/* Main Grid: Table + Detail Inspection Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">
              Daftar Semua Pengajuan Proyek ({filteredSubmissions.length})
            </h2>
            <span className="text-[11px] text-gray-500">Klik baris untuk melihat detail RAB & alur approval</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="py-2.5 pr-2">No Pengajuan & Tanggal</th>
                  <th className="py-2.5 px-2">Jenis & Nama Proyek</th>
                  <th className="py-2.5 px-2 text-right">Nominal RAB</th>
                  <th className="py-2.5 px-2">Status</th>
                  <th className="py-2.5 pl-2 text-right">Pengaju & Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubmissions.map((sub) => {
                  const active = activeDetailSub?.id === sub.id;
                  return (
                    <tr
                      key={sub.id}
                      onClick={() => setSelectedSubId(sub.id)}
                      className={`cursor-pointer transition-colors ${
                        active ? 'bg-emerald-50/60' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="py-3 pr-2 whitespace-nowrap">
                        <div className="font-mono font-bold text-emerald-700">{sub.submissionNumber}</div>
                        <div className="font-mono text-[11px] text-gray-500">
                          {sub.date} · {sub.companyId}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-[11px] font-semibold text-gray-500">
                          {JENIS_BADGE[sub.type].label}
                        </div>
                        <div className="font-bold text-gray-900">{sub.projectName}</div>
                        <div className="text-[11px] text-gray-500 truncate max-w-xs">{sub.location}</div>
                      </td>
                      <td className="py-3 px-2 text-right font-mono font-bold text-gray-900 tabular-nums whitespace-nowrap">
                        {formatRupiah(sub.rabAmount)}
                      </td>
                      <td className="py-3 px-2 whitespace-nowrap">
                        <span className="font-semibold text-gray-800">{sub.status}</span>
                      </td>
                      <td className="py-3 pl-2 text-right whitespace-nowrap">
                        <div className="text-gray-700 font-medium">{sub.requester}</div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSubId(sub.id);
                          }}
                          className="text-[11px] text-emerald-700 font-semibold hover:underline"
                        >
                          Detail RAB →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Pengajuan Panel */}
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-xl p-6 space-y-5 text-xs">
          {activeDetailSub ? (
            <>
              <div className="border-b border-gray-100 pb-3 flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-emerald-700 font-bold">
                    {activeDetailSub.submissionNumber} · {activeDetailSub.date}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 mt-0.5">
                    {activeDetailSub.projectName}
                  </h3>
                  <p className="text-gray-500 mt-0.5">
                    Pengaju: {activeDetailSub.requester} ({activeDetailSub.requesterRole}) · {activeDetailSub.companyId}
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-gray-100 font-bold rounded text-gray-800 shrink-0">
                  {activeDetailSub.status}
                </span>
              </div>

              {/* Tabel RAB Detail */}
              <div className="space-y-2">
                <div className="font-bold text-gray-900 flex justify-between">
                  <span>Rincian Item RAB ({activeDetailSub.items.length} Komponen)</span>
                  <span className="font-mono text-emerald-700">
                    Total: {formatRupiah(activeDetailSub.rabAmount)}
                  </span>
                </div>
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-52 overflow-y-auto">
                  {activeDetailSub.items.map((it) => (
                    <div key={it.id} className="p-2.5 flex items-center justify-between gap-2">
                      <div>
                        <div className="font-semibold text-gray-900">{it.description}</div>
                        <div className="text-[11px] text-gray-500 font-mono">
                          {it.volume} {it.unit} × {formatRupiah(it.unitPrice)}
                        </div>
                      </div>
                      <div className="font-mono font-bold text-gray-900 shrink-0">
                        {formatRupiah(it.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Akuisisi Lahan Controls if Type == LAHAN & Approved */}
              {activeDetailSub.type === 'LAHAN' && activeDetailSub.lahanData && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
                  <div className="font-bold text-emerald-950">
                    Status Tahap Akuisisi Lahan ({activeDetailSub.lahanData.landArea} m²):
                  </div>
                  <div className="flex items-center gap-2">
                    {(['Menunggu Akuisisi', 'Akuisisi', 'Selesai'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          advanceLahanAcquisitionStage(activeDetailSub.id, st);
                          toast.success(`Tahap lahan diperbarui menjadi: ${st}`);
                        }}
                        className={`px-2.5 py-1 rounded font-semibold ${
                          activeDetailSub.lahanData?.acquisitionStage === st
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Riwayat Approval Timeline */}
              <div className="space-y-2">
                <div className="font-bold text-gray-900">Riwayat Alur Approval:</div>
                <div className="space-y-2">
                  {activeDetailSub.approvalHistory.map((h) => (
                    <div key={h.id} className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex justify-between font-semibold text-gray-900">
                        <span>
                          {h.actorName} ({h.actorRole})
                        </span>
                        <span className="font-mono text-[11px] text-gray-500">{h.timestamp}</span>
                      </div>
                      <div className="text-emerald-700 font-medium">{h.action}</div>
                      {h.notes && <div className="text-[11px] text-gray-600 mt-0.5">{h.notes}</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tombol Verifikasi Keuangan / Approval Direktur */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <input
                  type="text"
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Catatan verifikasi Keuangan / keputusan Direktur..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <div className="grid grid-cols-2 gap-2">
                  {activeDetailSub.status === 'Menunggu Verifikasi Keuangan' && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          verifyProjectSubmissionByFinance(activeDetailSub.id, 'OK', approvalNotes);
                          setApprovalNotes('');
                          toast.success('Diverifikasi Keuangan → Diteruskan ke Direktur');
                        }}
                        className="py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg"
                      >
                        ✓ Verifikasi Keuangan OK
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          verifyProjectSubmissionByFinance(activeDetailSub.id, 'REJECT', approvalNotes);
                          setApprovalNotes('');
                          toast.error('Ditolak oleh Keuangan');
                        }}
                        className="py-2 px-3 border border-red-300 text-red-600 rounded-lg font-semibold"
                      >
                        Reject Keuangan
                      </button>
                    </>
                  )}
                  {activeDetailSub.status === 'Menunggu Approval Direktur' && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          approveProjectSubmissionByDirector(activeDetailSub.id, 'APPROVE', approvalNotes);
                          setApprovalNotes('');
                          toast.success('Approved Direktur! Proyek siap dieksekusi.');
                        }}
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg"
                      >
                        ✓ Approve Direktur
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          approveProjectSubmissionByDirector(activeDetailSub.id, 'REJECT', approvalNotes);
                          setApprovalNotes('');
                          toast.error('Ditolak oleh Direktur');
                        }}
                        className="py-2 px-3 border border-red-300 text-red-600 rounded-lg font-semibold"
                      >
                        Reject Direktur
                      </button>
                    </>
                  )}
                  {activeDetailSub.status === 'Approved' && (
                    <div className="col-span-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                      <div className="text-xs font-bold text-emerald-950">
                        🌐 Auto-Sync ke Website Publik:
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        Pengajuan proyek ini telah disetujui Direktur. Anda dapat langsung membuka Form Auto-Sync Proyek untuk menayangkan proyek & unit kavling ke Website Publik.
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/sistem/proyek?fromSubmission=${encodeURIComponent(
                              activeDetailSub.projectName
                            )}&company=${activeDetailSub.companyId}`
                          )
                        }
                        className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer"
                      >
                        🚀 Publish Proyek Ini ke Website Publik →
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="font-bold text-gray-900">Komentar & Diskusi Lintas Role:</div>
                {activeDetailSub.comments.map((c) => (
                  <div key={c.id} className="p-2 bg-gray-50 rounded border border-gray-200">
                    <span className="font-bold text-gray-900">{c.authorName}</span> ({c.authorRole}):{' '}
                    <span className="text-gray-700">{c.message}</span>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Tulis komentar..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addProjectSubmissionComment(activeDetailSub.id, commentText);
                      setCommentText('');
                    }}
                    className="px-3 py-1.5 bg-gray-900 text-white rounded-lg font-semibold"
                  >
                    Kirim
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">Pilih pengajuan di sebelah kiri</div>
          )}
        </div>
      </div>

      {/* Modal Pilih 4 Jenis Pengajuan Proyek Baru */}
      {showNewTypeModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowNewTypeModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-gray-200 rounded-xl max-w-2xl w-full p-6 space-y-5 shadow-xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="font-mono text-emerald-700 font-bold">PILIH JENIS PENGAJUAN PROYEK BARU</span>
                <h3 className="text-base font-bold text-gray-900 mt-0.5">
                  4 Opsi Pengajuan Proyek & RAB Lengkap (Role PJT)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewTypeModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => {
                  setShowNewTypeModal(false);
                  navigate('/project/pengajuan-proyek/lahan-baru');
                }}
                className="p-4 border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/40 rounded-xl text-left space-y-1.5 transition-all cursor-pointer"
              >
                <LandPlot className="w-6 h-6 text-emerald-600" />
                <div className="text-sm font-bold text-gray-900">1. Pembelian Lahan Baru</div>
                <p className="text-gray-500">
                  Koordinat GPS, luas m², harga/m², BPHTB, Notaris, Sertifikasi, Pematangan Lahan & Cara Bayar.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowNewTypeModal(false);
                  navigate('/project/pengajuan-proyek/unit-baru');
                }}
                className="p-4 border border-gray-200 hover:border-blue-500 hover:bg-blue-50/40 rounded-xl text-left space-y-1.5 transition-all cursor-pointer"
              >
                <Building2 className="w-6 h-6 text-blue-600" />
                <div className="text-sm font-bold text-gray-900">2. Pembangunan Unit Baru</div>
                <p className="text-gray-500">
                  Tabel RAB Material & Upah per unit dinamis, jumlah unit, Overhead, Profit & Sumber Dana.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowNewTypeModal(false);
                  navigate('/project/pengajuan-proyek/fasum-baru');
                }}
                className="p-4 border border-gray-200 hover:border-purple-500 hover:bg-purple-50/40 rounded-xl text-left space-y-1.5 transition-all cursor-pointer"
              >
                <Landmark className="w-6 h-6 text-purple-600" />
                <div className="text-sm font-bold text-gray-900">3. Pembangunan Fasum / Fasos</div>
                <p className="text-gray-500">
                  16 Sub-jenis Fasum (Jalan, Drainase, Masjid, Taman, PJU) & 4 Sub-jenis Fasos (PAUD, Posyandu).
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowNewTypeModal(false);
                  navigate('/project/pengajuan-proyek/renovasi');
                }}
                className="p-4 border border-gray-200 hover:border-amber-500 hover:bg-amber-50/40 rounded-xl text-left space-y-1.5 transition-all cursor-pointer"
              >
                <Wrench className="w-6 h-6 text-amber-600" />
                <div className="text-sm font-bold text-gray-900">4. Renovasi / Perbaikan</div>
                <p className="text-gray-500">
                  Renovasi Ringan/Sedang/Berat untuk unit, jalan, atau drainase lengkap foto kondisi awal.
                </p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
