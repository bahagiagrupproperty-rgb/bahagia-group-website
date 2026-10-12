import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import {
  SyncedProjectRecord,
  SyncedProjectBlock,
  SyncedProjectPromo,
  slugifyProjectName,
} from '../data/superAdminSeedData';
import { ASSETS, formatRupiah, FASUM_16_TYPES } from '../data/seedData';
import { UploadFoto } from './UploadFoto';
import {
  Plus,
  Edit3,
  Eye,
  Copy,
  Trash2,
  Globe,
  Star,
  MapPin,
  Building2,
  CheckCircle2,
  X,
  ArrowLeft,
  Rocket,
  Layers,
  Image as ImageIcon,
  FileText,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

export const AutoSyncProjectManager: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    syncedProjects,
    companies,
    kavling,
    saveSyncedProject,
    toggleProjectPublishStatus,
    toggleProjectFeatured,
    duplicateSyncedProject,
    deleteSyncedProjectSoft,
    bulkUpdateSyncedProjects,
  } = useAppStore();

  const [viewMode, setViewMode] = useState<'LIST' | 'FORM'>('LIST');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Published' | 'Draft' | 'Nonaktif'>('ALL');
  const [ptFilter, setPtFilter] = useState<string>('ALL');
  const [deletingProject, setDeletingProject] = useState<SyncedProjectRecord | null>(null);

  // =========================================================
  // 10-SECTION FORM STATE
  // =========================================================
  // Section 1 - Info Dasar
  const [projectName, setProjectName] = useState('');
  const [companyId, setCompanyId] = useState<'PT_TBL' | 'PT_BPP' | string>('PT_BPP');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState<SyncedProjectRecord['projectType']>('Perumahan Subsidi');

  // Section 2 - Lokasi
  const [address, setAddress] = useState('');
  const [kelurahan, setKelurahan] = useState('');
  const [kecamatan, setKecamatan] = useState('');
  const [city, setCity] = useState('Kota Kendari');
  const [province, setProvince] = useState('Sulawesi Tenggara');
  const [lat, setLat] = useState(-4.0096);
  const [lng, setLng] = useState(122.5127);
  const [googleMapsEmbedUrl, setGoogleMapsEmbedUrl] = useState('');
  const [landmark, setLandmark] = useState('');

  // Section 3 - Data Tanah & Blok
  const [landAreaTotal, setLandAreaTotal] = useState(5000);
  const [blocks, setBlocks] = useState<SyncedProjectBlock[]>([
    {
      id: 'blk-1',
      blockName: 'A',
      unitCount: 15,
      startNumber: 'A-01',
      endNumber: 'A-15',
      landAreaPerBlock: 1800,
    },
    {
      id: 'blk-2',
      blockName: 'B',
      unitCount: 15,
      startNumber: 'B-01',
      endNumber: 'B-15',
      landAreaPerBlock: 1800,
    },
  ]);
  const [certificateType, setCertificateType] = useState<'SHM' | 'SHGB' | 'Girik' | 'Lainnya'>('SHGB');
  const [imbNumber, setImbNumber] = useState('PBG-7471-2026-NEW');
  const [landStatus, setLandStatus] = useState<'Milik Sendiri' | 'Kerjasama' | 'Proses Akuisisi'>('Milik Sendiri');

  // Section 4 - Spesifikasi Unit Standar
  const [unitType, setUnitType] = useState('Tipe 36/91');
  const [landSize, setLandSize] = useState(91);
  const [buildingSize, setBuildingSize] = useState(36);
  const [lotDimensions, setLotDimensions] = useState('7×13m');
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(1);
  const [foundationSpec, setFoundationSpec] = useState('Batu Kali / Gunung');
  const [wallSpec, setWallSpec] = useState('Batu Bata Merah / Batako Press Plester Aci');
  const [roofSpec, setRoofSpec] = useState('Rangka Baja Ringan + Spandek / Genteng Metal');
  const [floorSpec, setFloorSpec] = useState('Keramik 40×40');
  const [ceilingSpec, setCeilingSpec] = useState('4 meter (Gypsum / Rangka Hollow)');
  const [waterSpec, setWaterSpec] = useState('Sumur Bor / PDAM');
  const [electricitySpec, setElectricitySpec] = useState('PLN 1300 VA');

  // Section 5 - Harga & Pembiayaan
  const [price, setPrice] = useState(169000000);
  const [hpp, setHpp] = useState(125000000);
  const [bookingFee, setBookingFee] = useState(2000000);
  const [minDp, setMinDp] = useState(1690000);
  const [dpInfo, setDpInfo] = useState('DP 1% (Rp1.690.000) · Bebas Biaya Akad & Notaris');
  const [paymentSchemes, setPaymentSchemes] = useState<string[]>([
    'KPR Subsidi (FLPP)',
    'KPR Komersil',
    'Cash Keras',
    'Cash Bertahap',
  ]);
  const [partnerBanks, setPartnerBanks] = useState<string[]>(['Bank BTN', 'Bank BRI', 'Bank Mandiri']);
  const [tenorOptions, setTenorOptions] = useState<number[]>([10, 15, 20]);
  const [estimatedInstallment, setEstimatedInstallment] = useState(1080000);

  // Section 6 - Promo & Keunggulan
  const [promoTitle, setPromoTitle] = useState('Promo Perdana: Gratis Kanopi + Tandon Air 1.200L');
  const [promoDesc, setPromoDesc] = useState('Khusus 15 pembeli pertama bebas biaya balik nama & SHM.');
  const [promoStart, setPromoStart] = useState('2026-10-01');
  const [promoEnd, setPromoEnd] = useState('2026-12-31');
  const [promoBadge, setPromoBadge] = useState('PROMO PERDANA');
  const [promoBonusText, setPromoBonusText] = useState(
    'Gratis Kanopi Depan, Gratis Tandon Air 1.200L, Bebas Biaya Akad & Notaris'
  );
  const [advantagesText, setAdvantagesText] = useState(
    'Bebas Banjir, Dekat Jalan Raya Utama, Plafon Tinggi 4 Meter, Air Bersih Jernih'
  );
  const [facilities, setFacilities] = useState<string[]>([
    'Masjid/Musholla',
    'Taman/Ruang Terbuka Hijau (RTH)',
    'Jalan Lingkungan (Paving/Aspal/Beton)',
    'Saluran Drainase/Gorong-gorong',
    'Pos Jaga/Security Gate',
    'Penerangan Jalan Umum (PJU)',
  ]);

  // Section 7 - Foto & Media
  const [heroImage, setHeroImage] = useState<string>(ASSETS.bahagiaResidence);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([
    ASSETS.bahagiaResidence,
    ASSETS.unitInterior,
    ASSETS.unitFloorplan,
  ]);
  const [sitePlanImage, setSitePlanImage] = useState<string>(ASSETS.unitFloorplan);
  const [floorplanImage, setFloorplanImage] = useState<string>(ASSETS.unitFloorplan);
  const [brochurePdfUrl, setBrochurePdfUrl] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');

  // Section 8 - Kontak Proyek
  const [picMarketing, setPicMarketing] = useState('Andi Saputra');
  const [picPhone, setPicPhone] = useState('0811-4000-169');
  const [marketingAddress, setMarketingAddress] = useState(
    'Kantor Pemasaran Bahagia Group, Kota Kendari'
  );
  const [operationalHours, setOperationalHours] = useState('Senin - Minggu (08.00 - 17.00 WITA)');

  // Section 9 - Auto-Generate Unit Kavling
  const [autoGenerateUnits, setAutoGenerateUnits] = useState(true);

  // Section 10 - Status Publikasi
  const [showOnHome, setShowOnHome] = useState(true);
  const [showInCatalog, setShowInCatalog] = useState(true);
  const [showInNavbar, setShowInNavbar] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Handle query params (?edit=... or ?fromSubmission=...)
  useEffect(() => {
    const editParam = searchParams.get('edit');
    const fromSub = searchParams.get('fromSubmission');
    const compParam = searchParams.get('company');

    if (editParam) {
      const target = syncedProjects.find((p) => p.id === editParam);
      if (target) {
        loadProjectIntoForm(target);
        setViewMode('FORM');
      }
    } else if (fromSub) {
      resetFormToNew();
      setProjectName(fromSub);
      if (compParam === 'PT_TBL' || compParam === 'PT_BPP') {
        setCompanyId(compParam);
      }
      setTagline('Kawasan Hunian Baru Hasil Pengajuan PJT Disetujui Direktur');
      setViewMode('FORM');
      toast.info(`Membuat publikasi proyek otomatis dari Pengajuan PJT: "${fromSub}"`);
    }
  }, [searchParams]);

  const totalUnitsFromBlocks = blocks.reduce((acc, b) => acc + Number(b.unitCount || 0), 0);

  const resetFormToNew = () => {
    setEditingId(null);
    setProjectName('Perumahan Bahagia Residence Tahap 2');
    setCompanyId('PT_BPP');
    setTagline('Hunian Modern Bata Merah untuk Keluarga Muda');
    setDescription(
      'Pengembangan tahap kedua Perumahan Bahagia Residence dengan spesifikasi bata merah penuh, plafon tinggi 4 meter, jalan lingkungan paving lebar, serta lokasi strategis dekat bandara dan pusat pendidikan.'
    );
    setProjectType('Perumahan Subsidi');
    setAddress('Jl. Poros Bandara Haluoleo KM 14');
    setKelurahan('Ranomeeto');
    setKecamatan('Ranomeeto');
    setCity('Kab. Konawe Selatan');
    setProvince('Sulawesi Tenggara');
    setLat(-4.0625);
    setLng(122.4735);
    setGoogleMapsEmbedUrl('https://maps.google.com/maps?q=-4.0625,122.4735&z=15&output=embed');
    setLandmark('5 Menit dari Bandara Haluoleo & Pasar Ranomeeto');
    setLandAreaTotal(4500);
    setBlocks([
      {
        id: `blk-${Date.now()}-1`,
        blockName: 'A',
        unitCount: 15,
        startNumber: 'A-01',
        endNumber: 'A-15',
        landAreaPerBlock: 1800,
      },
      {
        id: `blk-${Date.now()}-2`,
        blockName: 'B',
        unitCount: 15,
        startNumber: 'B-01',
        endNumber: 'B-15',
        landAreaPerBlock: 1800,
      },
    ]);
    setCertificateType('SHGB');
    setImbNumber('PBG-7405-2026-0192');
    setLandStatus('Milik Sendiri');
    setUnitType('Tipe 36/91');
    setLandSize(91);
    setBuildingSize(36);
    setLotDimensions('7×13m');
    setBedrooms(2);
    setBathrooms(1);
    setFoundationSpec('Batu Gunung / Batu Kali');
    setWallSpec('Batu Bata Merah Plester Aci Cat Weatherproof');
    setRoofSpec('Rangka Baja Ringan + Atap Spandek Pasir');
    setFloorSpec('Keramik 40×40 Putih Polos');
    setCeilingSpec('4 Meter (Gypsum Rangka Hollow)');
    setWaterSpec('Sumur Bor Jernih + Mesin Air');
    setElectricitySpec('PLN 1.300 VA');
    setPrice(169000000);
    setHpp(125000000);
    setBookingFee(2000000);
    setMinDp(1000000);
    setDpInfo('DP Mulai Rp1.000.000 · Gratis Kanopi & Tandon Air');
    setPaymentSchemes(['KPR Subsidi (FLPP)', 'Cash Keras', 'Cash Bertahap']);
    setPartnerBanks(['Bank BTN', 'Bank BRI', 'Bank Mandiri']);
    setTenorOptions([10, 15, 20]);
    setEstimatedInstallment(1050000);
    setPromoTitle('Promo Launching Tahap 2: DP Rp1 Juta All-In');
    setPromoDesc('Gratis Kanopi, Tandon Air 1.200L, dan Bebas Biaya Notaris/BPHTB.');
    setPromoBadge('LAUNCHING TAHAP 2');
    setPromoBonusText('Gratis Kanopi Depan, Gratis Tandon Air 1.200L, Bebas Biaya Akad');
    setAdvantagesText('Batu Bata Merah Penuh, Plafon Tinggi 4 Meter, 5 Menit dari Bandara');
    setFacilities([
      'Masjid/Musholla',
      'Taman/Ruang Terbuka Hijau (RTH)',
      'Jalan Lingkungan (Paving/Aspal/Beton)',
      'Saluran Drainase/Gorong-gorong',
      'Pos Jaga/Security Gate',
    ]);
    setHeroImage(ASSETS.bahagiaResidence);
    setGalleryPhotos([ASSETS.bahagiaResidence, ASSETS.unitInterior, ASSETS.unitFloorplan]);
    setSitePlanImage(ASSETS.unitFloorplan);
    setFloorplanImage(ASSETS.unitFloorplan);
    setAutoGenerateUnits(true);
    setShowOnHome(true);
    setShowInCatalog(true);
    setShowInNavbar(true);
    setIsFeatured(true);
  };

  const loadProjectIntoForm = (proj: SyncedProjectRecord) => {
    setEditingId(proj.id);
    setProjectName(proj.projectName);
    setCompanyId(proj.companyId);
    setTagline(proj.tagline);
    setDescription(proj.description);
    setProjectType(proj.projectType);
    setAddress(proj.address);
    setKelurahan(proj.kelurahan);
    setKecamatan(proj.kecamatan);
    setCity(proj.city);
    setProvince(proj.province);
    setLat(proj.coordinates.lat);
    setLng(proj.coordinates.lng);
    setGoogleMapsEmbedUrl(proj.googleMapsEmbedUrl);
    setLandmark(proj.landmark);
    setLandAreaTotal(proj.landAreaTotal);
    setBlocks(proj.blocks);
    setCertificateType(proj.certificateType);
    setImbNumber(proj.imbNumber);
    setLandStatus(proj.landStatus);
    setUnitType(proj.unitType);
    setLandSize(proj.landSize);
    setBuildingSize(proj.buildingSize);
    setLotDimensions(proj.lotDimensions);
    setBedrooms(proj.bedrooms);
    setBathrooms(proj.bathrooms);
    setFoundationSpec(proj.foundationSpec);
    setWallSpec(proj.wallSpec);
    setRoofSpec(proj.roofSpec);
    setFloorSpec(proj.floorSpec);
    setCeilingSpec(proj.ceilingSpec);
    setWaterSpec(proj.waterSpec);
    setElectricitySpec(proj.electricitySpec);
    setPrice(proj.price);
    setHpp(proj.hpp);
    setBookingFee(proj.bookingFee);
    setMinDp(proj.minDp);
    setDpInfo(proj.dpInfo);
    setPaymentSchemes(proj.paymentSchemes);
    setPartnerBanks(proj.partnerBanks);
    setTenorOptions(proj.tenorOptions);
    setEstimatedInstallment(proj.estimatedInstallment);
    if (proj.promos[0]) {
      setPromoTitle(proj.promos[0].title);
      setPromoDesc(proj.promos[0].description);
      setPromoStart(proj.promos[0].startDate);
      setPromoEnd(proj.promos[0].endDate);
      setPromoBadge(proj.promos[0].badgeText);
    }
    setPromoBonusText(proj.promoBonus.join(', '));
    setAdvantagesText(proj.advantages.join(', '));
    setFacilities(proj.facilities);
    setHeroImage(proj.heroImage);
    setGalleryPhotos(proj.galleryPhotos);
    setSitePlanImage(proj.sitePlanImage);
    setFloorplanImage(proj.floorplanImage);
    setBrochurePdfUrl(proj.brochurePdfUrl || '');
    setVideoUrl(proj.videoUrl || '');
    setPicMarketing(proj.picMarketing);
    setPicPhone(proj.picPhone);
    setMarketingAddress(proj.marketingAddress);
    setOperationalHours(proj.operationalHours);
    setAutoGenerateUnits(false); // When editing existing, default false so we don't duplicate unless checked
    setShowOnHome(proj.showOnHome);
    setShowInCatalog(proj.showInCatalog);
    setShowInNavbar(proj.showInNavbar);
    setIsFeatured(proj.isFeatured);
  };

  const handleSave = (publishStatus: 'Draft' | 'Published', openPreviewAfter = false) => {
    if (!projectName.trim() || !address.trim()) {
      toast.error('Nama Proyek dan Alamat Lengkap wajib diisi!');
      return;
    }

    const compObj = companies.find((c) => c.id === companyId);
    const companyName =
      compObj?.name ||
      (companyId === 'PT_TBL' ? 'PT Tata Bahagia Land' : 'PT Bahagia Prima Property');

    const slug = slugifyProjectName(projectName);
    const promos: SyncedProjectPromo[] = [
      {
        id: `prm-${Date.now()}`,
        title: promoTitle,
        description: promoDesc,
        startDate: promoStart,
        endDate: promoEnd,
        badgeText: promoBadge || 'PROMO AKTIF',
        isActive: true,
      },
    ];

    const saved = saveSyncedProject(
      {
        id: editingId || undefined,
        slug,
        projectName: projectName.trim(),
        companyId,
        companyName,
        tagline,
        description,
        projectType,
        address,
        kelurahan,
        kecamatan,
        city,
        province,
        coordinates: { lat: Number(lat), lng: Number(lng) },
        googleMapsEmbedUrl:
          googleMapsEmbedUrl ||
          `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`,
        landmark,
        landAreaTotal: Number(landAreaTotal),
        totalUnits: totalUnitsFromBlocks,
        blocks,
        certificateType,
        imbNumber,
        landStatus,
        unitType,
        landSize: Number(landSize),
        buildingSize: Number(buildingSize),
        lotDimensions,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        foundationSpec,
        wallSpec,
        roofSpec,
        floorSpec,
        ceilingSpec,
        waterSpec,
        electricitySpec,
        price: Number(price),
        hpp: Number(hpp),
        bookingFee: Number(bookingFee),
        minDp: Number(minDp),
        dpInfo,
        paymentSchemes,
        partnerBanks,
        tenorOptions,
        estimatedInstallment: Number(estimatedInstallment),
        promos,
        promoBonus: promoBonusText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        advantages: advantagesText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        facilities,
        heroImage,
        galleryPhotos,
        sitePlanImage,
        floorplanImage,
        brochurePdfUrl,
        videoUrl,
        picMarketing,
        picPhone,
        marketingAddress,
        operationalHours,
        autoGenerateUnits,
        publishStatus,
        showOnHome,
        showInCatalog,
        showInNavbar,
        isFeatured,
      },
      autoGenerateUnits
    );

    if (openPreviewAfter) {
      toast.success(`👁️ Membuka Mode Preview untuk proyek "${saved.projectName}"...`);
      navigate(`/preview/proyek/${saved.slug}`);
      return;
    }

    if (publishStatus === 'Published') {
      toast.success(
        `🚀 Proyek "${saved.projectName}" (${totalUnitsFromBlocks} unit) berhasil dipublish & otomatis tayang di Website Publik (Home, Katalog, Navbar, Footer & /proyek/${saved.slug})!`
      );
    } else {
      toast.success(`📝 Proyek "${saved.projectName}" berhasil disimpan sebagai Draft.`);
    }

    setSearchParams({});
    setViewMode('LIST');
  };

  const filteredProjects = syncedProjects.filter((p) => {
    if (statusFilter !== 'ALL' && p.publishStatus !== statusFilter) return false;
    if (ptFilter !== 'ALL' && p.companyId !== ptFilter) return false;
    if (
      searchQuery &&
      !p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !p.address.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !p.city.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // =========================================================
  // RENDER: FORM TAMBAH / EDIT PROYEK BARU (10 SECTION)
  // =========================================================
  if (viewMode === 'FORM') {
    return (
      <div className="space-y-6 text-xs">
        {/* Top Action Bar */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-emerald-700 font-mono font-bold text-[11px]">
              AUTO-SYNC PROYEK & LOKASI BARU KE WEBSITE PUBLIK · 10 SECTION LENGKAP
            </div>
            <h2 className="text-lg font-bold text-gray-900 mt-0.5">
              {editingId ? `✏️ Edit Proyek: ${projectName}` : '➕ Tambah Proyek / Lokasi Baru (Auto-Sync)'}
            </h2>
            <p className="text-gray-500">
              URL Publik Otomatis:{' '}
              <span className="font-mono font-semibold text-emerald-700">
                /proyek/{slugifyProjectName(projectName || 'proyek-baru')}
              </span>{' '}
              · Total Rencana Unit: <strong className="text-gray-900">{totalUnitsFromBlocks} Unit</strong>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSearchParams({});
                setViewMode('LIST');
              }}
              className="px-3.5 py-2 border border-gray-300 bg-white hover:bg-gray-50 rounded-xl font-semibold text-gray-700 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Daftar</span>
            </button>
            <button
              type="button"
              onClick={() => handleSave('Draft', true)}
              className="px-3.5 py-2 bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>👁️ Preview Dulu</span>
            </button>
            <button
              type="button"
              onClick={() => handleSave('Published', false)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>🚀 Simpan & Publish Sekarang</span>
            </button>
          </div>
        </div>

        {/* SECTION 1: INFO DASAR */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <div className="border-b border-gray-100 pb-2.5 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">SECTION 1 — Info Dasar Proyek</h3>
            <span className="font-mono text-[11px] text-emerald-700">Auto-Slug: /proyek/{slugifyProjectName(projectName || 'proyek-baru')}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Nama Proyek *</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Contoh: Bahagia Residence Tahap 2"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-bold text-gray-900"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">PT Pemilik *</label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white font-semibold"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Jenis Proyek *</label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
              >
                <option value="Perumahan Subsidi">Perumahan Subsidi</option>
                <option value="Komersil">Komersil</option>
                <option value="Ruko">Ruko</option>
                <option value="Apartemen">Apartemen</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className="font-semibold text-gray-700 block mb-1">Tagline Proyek</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Contoh: Hunian Modern untuk Keluarga Muda"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="font-semibold text-gray-700 block mb-1">Deskripsi Lengkap Proyek (Rich Text)</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: LOKASI & KOORDINAT PETA */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2.5">
            SECTION 2 — Lokasi, Titik Koordinat GPS & Google Maps Preview
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="font-semibold text-gray-700 block mb-1">Alamat Lengkap *</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Poros Bandara Haluoleo KM 14"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Kelurahan / Desa</label>
                <input
                  type="text"
                  value={kelurahan}
                  onChange={(e) => setKelurahan(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Kecamatan</label>
                <input
                  type="text"
                  value={kecamatan}
                  onChange={(e) => setKecamatan(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Kabupaten / Kota</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Provinsi</label>
                <input
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Latitude (Geser/Input)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setLat(v);
                    setGoogleMapsEmbedUrl(`https://maps.google.com/maps?q=${v},${lng}&z=15&output=embed`);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Longitude (Geser/Input)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setLng(v);
                    setGoogleMapsEmbedUrl(`https://maps.google.com/maps?q=${lat},${v}&z=15&output=embed`);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold text-gray-700 block mb-1">Patokan / Landmark Terdekat</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Contoh: 5 Menit dari Bandara Haluoleo"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-gray-500">
                <span>Live Google Maps Embed Preview</span>
                <span className="font-mono">{lat}, {lng}</span>
              </div>
              <div className="h-56 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                <iframe
                  title="Preview Peta Lokasi"
                  src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: DATA TANAH & RINCIAN PER BLOK */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
            <h3 className="text-sm font-bold text-gray-900">
              SECTION 3 — Data Tanah, Legalitas & Rincian Per Blok (Multiple Blok)
            </h3>
            <button
              type="button"
              onClick={() => {
                const nextLetter = String.fromCharCode(65 + blocks.length);
                setBlocks([
                  ...blocks,
                  {
                    id: `blk-${Date.now()}`,
                    blockName: nextLetter,
                    unitCount: 10,
                    startNumber: `${nextLetter}-01`,
                    endNumber: `${nextLetter}-10`,
                    landAreaPerBlock: 1200,
                  },
                ]);
              }}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold cursor-pointer"
            >
              + Tambah Blok Baru
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Luas Tanah Total (m²)</label>
              <input
                type="number"
                value={landAreaTotal}
                onChange={(e) => setLandAreaTotal(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono font-bold"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Jumlah Unit Total (Auto)</label>
              <input
                type="number"
                readOnly
                value={totalUnitsFromBlocks}
                className="w-full border border-gray-200 bg-gray-100 rounded-lg px-3 py-2 font-mono font-bold text-emerald-800"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Sertifikat Induk</label>
              <select
                value={certificateType}
                onChange={(e) => setCertificateType(e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
              >
                <option value="SHGB">SHGB</option>
                <option value="SHM">SHM</option>
                <option value="Girik">Girik</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Nomor IMB / PBG</label>
              <input
                type="text"
                value={imbNumber}
                onChange={(e) => setImbNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Status Lahan</label>
              <select
                value={landStatus}
                onChange={(e) => setLandStatus(e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
              >
                <option value="Milik Sendiri">Milik Sendiri</option>
                <option value="Kerjasama">Kerjasama</option>
                <option value="Proses Akuisisi">Proses Akuisisi</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="font-semibold text-gray-800">Rincian Blok Kawasan ({blocks.length} Blok):</div>
            {blocks.map((blk, idx) => (
              <div
                key={blk.id}
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl grid grid-cols-2 sm:grid-cols-6 gap-3 items-end"
              >
                <div>
                  <label className="text-[11px] text-gray-500 block mb-1">Nama Blok</label>
                  <input
                    type="text"
                    value={blk.blockName}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setBlocks(
                        blocks.map((b, i) =>
                          i === idx
                            ? {
                                ...b,
                                blockName: val,
                                startNumber: `${val}-01`,
                                endNumber: `${val}-${String(b.unitCount).padStart(2, '0')}`,
                              }
                            : b
                        )
                      );
                    }}
                    className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 block mb-1">Jumlah Unit Blok</label>
                  <input
                    type="number"
                    value={blk.unitCount}
                    onChange={(e) => {
                      const cnt = Math.max(1, Number(e.target.value));
                      setBlocks(
                        blocks.map((b, i) =>
                          i === idx
                            ? {
                                ...b,
                                unitCount: cnt,
                                endNumber: `${b.blockName}-${String(cnt).padStart(2, '0')}`,
                              }
                            : b
                        )
                      );
                    }}
                    className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 block mb-1">Nomor Awal</label>
                  <input
                    type="text"
                    value={blk.startNumber}
                    onChange={(e) =>
                      setBlocks(blocks.map((b, i) => (i === idx ? { ...b, startNumber: e.target.value } : b)))
                    }
                    className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 block mb-1">Nomor Akhir</label>
                  <input
                    type="text"
                    value={blk.endNumber}
                    onChange={(e) =>
                      setBlocks(blocks.map((b, i) => (i === idx ? { ...b, endNumber: e.target.value } : b)))
                    }
                    className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 block mb-1">Luas Tanah Blok (m²)</label>
                  <input
                    type="number"
                    value={blk.landAreaPerBlock}
                    onChange={(e) =>
                      setBlocks(
                        blocks.map((b, i) => (i === idx ? { ...b, landAreaPerBlock: Number(e.target.value) } : b))
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white font-mono"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    disabled={blocks.length <= 1}
                    onClick={() => setBlocks(blocks.filter((_, i) => i !== idx))}
                    className="w-full py-1.5 px-3 bg-red-50 text-red-700 border border-red-200 rounded-lg font-semibold disabled:opacity-40 cursor-pointer"
                  >
                    🗑️ Hapus Blok
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: SPESIFIKASI UNIT STANDAR */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2.5">
            SECTION 4 — Spesifikasi Unit Standar
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Tipe Unit</label>
              <input
                type="text"
                value={unitType}
                onChange={(e) => setUnitType(e.target.value)}
                placeholder="Tipe 36/91"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-bold"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Luas Tanah / Unit (m²)</label>
              <input
                type="number"
                value={landSize}
                onChange={(e) => setLandSize(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Luas Bangunan (m²)</label>
              <input
                type="number"
                value={buildingSize}
                onChange={(e) => setBuildingSize(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Ukuran Kavling</label>
              <input
                type="text"
                value={lotDimensions}
                onChange={(e) => setLotDimensions(e.target.value)}
                placeholder="7×13m"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Kamar Tidur</label>
              <input
                type="number"
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Kamar Mandi</label>
              <input
                type="number"
                value={bathrooms}
                onChange={(e) => setBathrooms(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Pondasi</label>
              <input
                type="text"
                value={foundationSpec}
                onChange={(e) => setFoundationSpec(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Dinding</label>
              <input
                type="text"
                value={wallSpec}
                onChange={(e) => setWallSpec(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Atap & Rangka</label>
              <input
                type="text"
                value={roofSpec}
                onChange={(e) => setRoofSpec(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Lantai</label>
              <input
                type="text"
                value={floorSpec}
                onChange={(e) => setFloorSpec(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Tinggi Plafon</label>
              <input
                type="text"
                value={ceilingSpec}
                onChange={(e) => setCeilingSpec(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Air Bersih & Listrik</label>
              <input
                type="text"
                value={`${waterSpec} · ${electricitySpec}`}
                onChange={(e) => setWaterSpec(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5 & 6: HARGA, PEMBIAYAAN, PROMO & FASILITAS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2.5">
              SECTION 5 — Harga & Skema Pembiayaan KPR
            </h3>
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Harga Jual per Unit (Rp)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono font-bold text-emerald-800"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">HPP per Unit (Internal)</label>
                <input
                  type="number"
                  value={hpp}
                  onChange={(e) => setHpp(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Booking Fee (Rp)</label>
                <input
                  type="number"
                  value={bookingFee}
                  onChange={(e) => setBookingFee(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">DP Minimal (Rp)</label>
                <input
                  type="number"
                  value={minDp}
                  onChange={(e) => setMinDp(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                />
              </div>
              <div className="col-span-2">
                <label className="font-semibold text-gray-700 block mb-1">Info Ringkas DP & Akad</label>
                <input
                  type="text"
                  value={dpInfo}
                  onChange={(e) => setDpInfo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="col-span-2">
                <label className="font-semibold text-gray-700 block mb-1">Bank Mitra KPR (Centang)</label>
                <div className="flex flex-wrap gap-3 pt-1">
                  {['Bank BTN', 'Bank BRI', 'Bank Mandiri', 'Bank BNI', 'Bank BSI'].map((bk) => (
                    <label key={bk} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={partnerBanks.includes(bk)}
                        onChange={(e) => {
                          if (e.target.checked) setPartnerBanks([...partnerBanks, bk]);
                          else setPartnerBanks(partnerBanks.filter((x) => x !== bk));
                        }}
                        className="accent-emerald-600"
                      />
                      <span>{bk}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2.5">
              SECTION 6 — Promo, Keunggulan & Fasilitas Kawasan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Judul Promo Aktif</label>
                <input
                  type="text"
                  value={promoTitle}
                  onChange={(e) => setPromoTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-bold"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Badge Promo</label>
                <input
                  type="text"
                  value={promoBadge}
                  onChange={(e) => setPromoBadge(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold text-gray-700 block mb-1">Bonus Konsumen (Pisahkan Koma)</label>
                <input
                  type="text"
                  value={promoBonusText}
                  onChange={(e) => setPromoBonusText(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold text-gray-700 block mb-1">Keunggulan Proyek (Pisahkan Koma)</label>
                <input
                  type="text"
                  value={advantagesText}
                  onChange={(e) => setAdvantagesText(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold text-gray-700 block mb-1">Fasilitas Umum Kawasan</label>
                <div className="grid grid-cols-2 gap-1.5 pt-1 max-h-28 overflow-y-auto p-2 bg-gray-50 rounded-lg border border-gray-200">
                  {FASUM_16_TYPES.slice(0, 10).map((fasObj) => {
                    const fasName = typeof fasObj === 'string' ? fasObj : fasObj.name;
                    return (
                      <label key={fasName} className="flex items-center gap-1.5 text-[11px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={facilities.includes(fasName)}
                          onChange={(e) => {
                            if (e.target.checked) setFacilities([...facilities, fasName]);
                            else setFacilities(facilities.filter((x) => x !== fasName));
                          }}
                          className="accent-emerald-600"
                        />
                        <span className="truncate">{fasName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 7 & 8: FOTO/MEDIA & KONTAK */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2.5">
              SECTION 7 — Foto Utama, Galeri Unlimited, Site Plan & Denah
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">URL / Upload Foto Utama (Hero) *</label>
                <input
                  type="text"
                  value={heroImage}
                  onChange={(e) => setHeroImage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Gambar Site Plan Kawasan</label>
                <input
                  type="text"
                  value={sitePlanImage}
                  onChange={(e) => setSitePlanImage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                />
              </div>
            </div>
            <UploadFoto
              photos={galleryPhotos}
              label="Upload Foto Galeri Proyek (Unlimited · Auto-Compress)"
              onChange={(urls: string[]) => {
                setGalleryPhotos(urls);
                if (urls.length > 0) {
                  setHeroImage(urls[0]);
                }
              }}
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2.5">
              SECTION 8, 9 & 10 — Kontak, Auto-Generate Unit & Status Publikasi
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">PIC Marketing</label>
                <input
                  type="text"
                  value={picMarketing}
                  onChange={(e) => setPicMarketing(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">No HP / Telepon Marketing</label>
                <input
                  type="text"
                  value={picPhone}
                  onChange={(e) => setPicPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                />
              </div>
            </div>

            {/* Section 9: Auto-Generate Unit Kavling */}
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
              <label className="flex items-center gap-2 font-bold text-emerald-950 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoGenerateUnits}
                  onChange={(e) => setAutoGenerateUnits(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600"
                />
                <span>
                  SECTION 9: Auto-Generate {totalUnitsFromBlocks} Unit Kavling Otomatis Berdasarkan Data Blok
                </span>
              </label>
              <p className="text-[11px] text-emerald-800 pl-6">
                Sistem otomatis membuat {blocks.map((b) => `Blok ${b.blockName} (${b.startNumber} s/d ${b.endNumber})`).join(', ')} dengan status awal "Tersedia", harga {formatRupiah(price)}, dan langsung aktif di Site Plan Interaktif & Katalog Unit.
              </p>
            </div>

            {/* Section 10: Status Publikasi */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl grid grid-cols-2 gap-2.5">
              <label className="flex items-center gap-2 font-semibold text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnHome}
                  onChange={(e) => setShowOnHome(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600"
                />
                <span>Tampilkan di Halaman Home</span>
              </label>
              <label className="flex items-center gap-2 font-semibold text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInCatalog}
                  onChange={(e) => setShowInCatalog(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600"
                />
                <span>Tampilkan di Tab Katalog Unit</span>
              </label>
              <label className="flex items-center gap-2 font-semibold text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInNavbar}
                  onChange={(e) => setShowInNavbar(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600"
                />
                <span>Tampilkan di Menu Navigasi</span>
              </label>
              <label className="flex items-center gap-2 font-bold text-amber-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 accent-amber-500"
                />
                <span>⭐ Jadikan Proyek Unggulan (Featured)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Bottom 3 Action Buttons */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="text-gray-600">
            Begitu klik <strong>Simpan & Publish</strong>, proyek langsung muncul di Home, Katalog, Navbar, Footer, dan halaman detail <span className="font-mono text-emerald-700">/proyek/{slugifyProjectName(projectName || 'proyek')}</span>.
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleSave('Draft', false)}
              className="px-4 py-2.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-bold rounded-xl cursor-pointer"
            >
              [📝 Simpan sebagai Draft]
            </button>
            <button
              type="button"
              onClick={() => handleSave('Draft', true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold rounded-xl cursor-pointer"
            >
              [👁️ Preview Dulu]
            </button>
            <button
              type="button"
              onClick={() => handleSave('Published', false)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
            >
              [🚀 Simpan & Publish Sekarang]
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER: DAFTAR PROYEK AUTO-SYNC (/sistem/proyek)
  // =========================================================
  return (
    <div className="space-y-6 text-xs">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-emerald-700 font-mono font-bold text-[11px]">
              AUTO-SYNC PROYEK & LOKASI BARU KE WEBSITE PUBLIK · /sistem/proyek
            </div>
            <h2 className="text-lg font-bold text-gray-900 mt-0.5">
              Manajemen Proyek & Sinkronisasi Otomatis Website Publik ({syncedProjects.length} Proyek)
            </h2>
            <p className="text-gray-500">
              Tambah proyek baru → Otomatis membuat kartu di Home, tab di Katalog Unit, menu Navbar, daftar Footer, halaman detail <span className="font-mono">/proyek/[slug]</span>, dan meng-generate seluruh unit kavling tanpa coding.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                resetFormToNew();
                setViewMode('FORM');
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Proyek Baru</span>
            </button>
          </div>
        </div>

        {/* Filter, Search & Bulk Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="text"
              placeholder="Cari nama proyek atau lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-60"
            />
            <select
              value={ptFilter}
              onChange={(e) => setPtFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              <option value="ALL">Semua PT</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              <option value="ALL">Semua Status Publikasi</option>
              <option value="Published">🟢 Published (Tayang di Web)</option>
              <option value="Draft">🟡 Draft (Belum Tayang)</option>
              <option value="Nonaktif">🔴 Nonaktif (Disembunyikan)</option>
            </select>
          </div>

          {selectedProjectIds.length > 0 && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              <span className="font-bold text-emerald-900">
                {selectedProjectIds.length} Proyek Dipilih:
              </span>
              <button
                type="button"
                onClick={() => {
                  bulkUpdateSyncedProjects(selectedProjectIds, 'PUBLISH');
                  setSelectedProjectIds([]);
                  toast.success('🟢 Proyek terpilih berhasil di-Publish ke Website Publik');
                }}
                className="px-2.5 py-1 bg-emerald-600 text-white font-semibold rounded-lg cursor-pointer"
              >
                Publish
              </button>
              <button
                type="button"
                onClick={() => {
                  bulkUpdateSyncedProjects(selectedProjectIds, 'UNPUBLISH');
                  setSelectedProjectIds([]);
                  toast.success('🟡 Proyek terpilih diubah ke Nonaktif (Unpublish)');
                }}
                className="px-2.5 py-1 bg-amber-600 text-white font-semibold rounded-lg cursor-pointer"
              >
                Unpublish
              </button>
              <button
                type="button"
                onClick={() => {
                  bulkUpdateSyncedProjects(selectedProjectIds, 'DELETE');
                  setSelectedProjectIds([]);
                  toast.success('🗑️ Proyek terpilih dipindahkan ke Trash');
                }}
                className="px-2.5 py-1 bg-red-600 text-white font-semibold rounded-lg cursor-pointer"
              >
                Hapus
              </button>
            </div>
          )}
        </div>

        {/* Tabel Daftar Proyek Auto-Sync */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="py-2.5 pr-2">
                  <input
                    type="checkbox"
                    checked={
                      filteredProjects.length > 0 &&
                      selectedProjectIds.length === filteredProjects.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProjectIds(filteredProjects.map((p) => p.id));
                      } else {
                        setSelectedProjectIds([]);
                      }
                    }}
                    className="accent-emerald-600"
                  />
                </th>
                <th className="py-2.5 px-2">No</th>
                <th className="py-2.5 px-2">Foto</th>
                <th className="py-2.5 px-2">Nama Proyek & URL Publik</th>
                <th className="py-2.5 px-2">PT Pemilik</th>
                <th className="py-2.5 px-2">Lokasi</th>
                <th className="py-2.5 px-2">Unit (Tersedia / Terjual)</th>
                <th className="py-2.5 px-2">Harga</th>
                <th className="py-2.5 px-2">Status Tayang</th>
                <th className="py-2.5 pl-2 text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProjects.map((proj, idx) => {
                const projLots = kavling.filter(
                  (k) => k.projectName.toLowerCase() === proj.projectName.toLowerCase()
                );
                const availCount = projLots.filter((k) => k.status === 'Tersedia').length;
                const soldCount = projLots.filter(
                  (k) => k.status === 'Terjual' || k.status === 'Akad' || k.status === 'Booking'
                ).length;

                return (
                  <tr key={proj.id} className="hover:bg-gray-50">
                    <td className="py-3 pr-2">
                      <input
                        type="checkbox"
                        checked={selectedProjectIds.includes(proj.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProjectIds([...selectedProjectIds, proj.id]);
                          } else {
                            setSelectedProjectIds(selectedProjectIds.filter((id) => id !== proj.id));
                          }
                        }}
                        className="accent-emerald-600"
                      />
                    </td>
                    <td className="py-3 px-2 font-mono text-gray-500">{idx + 1}</td>
                    <td className="py-3 px-2">
                      <img
                        src={proj.heroImage}
                        alt={proj.projectName}
                        className="w-14 h-10 object-cover rounded-lg border border-gray-200"
                      />
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-bold text-gray-900 flex items-center gap-1.5">
                        <span>{proj.projectName}</span>
                        {proj.isFeatured && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                            ★ Unggulan
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[11px] text-emerald-700 flex items-center gap-2 mt-0.5">
                        <Link to={`/proyek/${proj.slug}`} className="hover:underline">
                          /proyek/{proj.slug}
                        </Link>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-500">
                          {proj.showOnHome ? 'Home ✓' : ''} {proj.showInCatalog ? 'Katalog ✓' : ''}{' '}
                          {proj.showInNavbar ? 'Navbar ✓' : ''}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 font-medium text-gray-800">{proj.companyName}</td>
                    <td className="py-3 px-2 text-gray-600">
                      <div>{proj.address}</div>
                      <div className="text-[11px] text-gray-400">
                        {proj.kecamatan}, {proj.city}
                      </div>
                    </td>
                    <td className="py-3 px-2 font-mono">
                      <span className="font-bold text-gray-900">
                        {projLots.length || proj.totalUnits} Total
                      </span>
                      <div className="text-[11px]">
                        <span className="text-emerald-700 font-semibold">{availCount} Tersedia</span> ·{' '}
                        <span className="text-amber-700">{soldCount} Terisi</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 font-mono font-bold text-gray-900">
                      {formatRupiah(proj.price)}
                    </td>
                    <td className="py-3 px-2">
                      <select
                        value={proj.publishStatus}
                        onChange={(e) => {
                          const nextStatus = e.target.value as 'Draft' | 'Published' | 'Nonaktif';
                          toggleProjectPublishStatus(proj.id, nextStatus);
                          toast.success(
                            `Status publikasi "${proj.projectName}" diubah ke ${nextStatus}`
                          );
                        }}
                        className={`px-2.5 py-1 rounded-lg font-bold border text-[11px] cursor-pointer ${
                          proj.publishStatus === 'Published'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : proj.publishStatus === 'Draft'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        <option value="Published">🟢 Published</option>
                        <option value="Draft">🟡 Draft</option>
                        <option value="Nonaktif">🔴 Nonaktif</option>
                      </select>
                    </td>
                    <td className="py-3 pl-2 text-right space-x-1 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          loadProjectIntoForm(proj);
                          setViewMode('FORM');
                        }}
                        className="px-2.5 py-1 border border-gray-300 bg-white hover:bg-gray-50 rounded-lg font-semibold cursor-pointer"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            proj.publishStatus === 'Published'
                              ? `/proyek/${proj.slug}`
                              : `/preview/proyek/${proj.slug}`
                          )
                        }
                        className="px-2.5 py-1 border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg font-semibold cursor-pointer"
                      >
                        👁️ Lihat di Web
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          toggleProjectFeatured(proj.id);
                          toast.success(`Status Unggulan (Featured) "${proj.projectName}" diperbarui`);
                        }}
                        className={`px-2 py-1 border rounded-lg font-semibold cursor-pointer ${
                          proj.isFeatured
                            ? 'bg-amber-100 border-amber-300 text-amber-900'
                            : 'bg-white border-gray-200 text-gray-500'
                        }`}
                        title="Jadikan Proyek Unggulan"
                      >
                        ⭐
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          duplicateSyncedProject(proj.id);
                          toast.success(`📋 Proyek "${proj.projectName}" berhasil diduplikat sebagai Draft`);
                        }}
                        className="px-2.5 py-1 border border-gray-300 bg-white hover:bg-gray-50 rounded-lg font-semibold cursor-pointer"
                      >
                        📋 Duplikat
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingProject(proj)}
                        className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-lg font-semibold cursor-pointer"
                      >
                        🗑️ Hapus
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus / Nonaktifkan Proyek (Section 6 Prompt) */}
      {deletingProject && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setDeletingProject(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                Konfirmasi Hapus / Nonaktifkan Proyek "{deletingProject.projectName}"
              </h3>
              <button
                type="button"
                onClick={() => setDeletingProject(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Pilih tindakan untuk proyek <strong>{deletingProject.projectName}</strong>:
            </p>
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  toggleProjectPublishStatus(deletingProject.id, 'Nonaktif');
                  toast.success(
                    `🔴 Proyek "${deletingProject.projectName}" dinonaktifkan dari Website Publik (data tetap aman di sistem internal).`
                  );
                  setDeletingProject(null);
                }}
                className="w-full p-3.5 text-left rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 space-y-0.5 cursor-pointer"
              >
                <div className="font-bold text-amber-950">
                  1. Nonaktifkan Saja dari Website Publik (Rekomendasi)
                </div>
                <div className="text-[11px] text-amber-800">
                  Proyek disembunyikan dari Home, Katalog, Navbar & Footer, tetapi seluruh data unit dan transaksi tetap tersimpan.
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  deleteSyncedProjectSoft(deletingProject.id, false);
                  toast.success(
                    `🗑️ Proyek "${deletingProject.projectName}" dipindahkan ke Trash (Unit kavling tetap dipertahankan).`
                  );
                  setDeletingProject(null);
                }}
                className="w-full p-3.5 text-left rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 space-y-0.5 cursor-pointer"
              >
                <div className="font-bold text-red-900">
                  2. Hapus Proyek ke Trash (Simpan Unit Kavling)
                </div>
                <div className="text-[11px] text-red-700">
                  Proyek masuk ke Keranjang Sampah (Trash 30 Hari), namun daftar unit kavling tidak dihapus.
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  deleteSyncedProjectSoft(deletingProject.id, true);
                  toast.success(
                    `🗑️ Proyek "${deletingProject.projectName}" beserta seluruh unit kavlingnya dipindahkan ke Trash.`
                  );
                  setDeletingProject(null);
                }}
                className="w-full p-3.5 text-left rounded-xl border border-red-300 bg-red-100/70 hover:bg-red-100 space-y-0.5 cursor-pointer"
              >
                <div className="font-bold text-red-950">
                  3. Hapus Proyek + Hapus Semua Unit Kavling Terkait (Soft Delete)
                </div>
                <div className="text-[11px] text-red-800">
                  Menghapus proyek dari website publik dan memindahkan seluruh unit kavling proyek ini ke Trash (bisa di-restore 30 hari).
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
