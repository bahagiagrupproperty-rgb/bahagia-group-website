import { ASSETS } from './seedData';

export type TextCategory =
  | 'Website'
  | 'Menu'
  | 'Dashboard'
  | 'Tabel'
  | 'Form'
  | 'Notifikasi'
  | 'Status'
  | 'Email';

export interface EditableTextVersion {
  timestamp: string;
  editor: string;
  value: string;
}

export interface EditableTextItem {
  key: string;
  category: TextCategory;
  location: string;
  defaultText: string;
  currentText: string;
  updatedAt?: string;
  updatedBy?: string;
  history: EditableTextVersion[];
}

export interface PhotoItemEntry {
  id: string;
  url: string;
  storagePath: string;
  caption: string;
  isPrimary: boolean;
  sizeKb: number;
  uploadedAt: string;
}

export interface EditablePhotoSlot {
  slotKey: string;
  title: string;
  scope: 'Website Publik' | 'Sistem Internal';
  folderPath: string;
  defaultUrl: string;
  photos: PhotoItemEntry[];
}

export interface CmsWebsiteContent {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    cta1Text: string;
    cta1Link: string;
    cta2Text: string;
    cta2Link: string;
    banners: string[];
  };
  keunggulan: Array<{
    id: string;
    icon: string;
    title: string;
    description: string;
  }>;
  statistik: Array<{
    id: string;
    value: string;
    label: string;
  }>;
  testimoni: Array<{
    id: string;
    photo: string;
    name: string;
    role: string;
    quote: string;
    rating: number;
  }>;
  navbar: {
    brandName: string;
    sticky: boolean;
    loginButtonText: string;
    bookingButtonText: string;
    links: Array<{ id: string; label: string; path: string }>;
  };
  footer: {
    brandName: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    instagram: string;
    facebook: string;
    youtube: string;
    copyright: string;
  };
  branding: {
    logoGroup: string;
    logoTbl: string;
    logoBpp: string;
    favicon: string;
    primaryColor: string;
    fontFamily: string;
  };
  promo: Array<{
    id: string;
    title: string;
    description: string;
    period: string;
    image: string;
    active: boolean;
  }>;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    gaId: string;
    fbPixelId: string;
  };
  staticPages: {
    tentang: string;
    kontak: string;
    faq: string;
    sk: string;
    privasi: string;
  };
}

export interface DataMasterItem {
  id: string;
  code: string;
  label: string;
  description?: string;
  active: boolean;
  order: number;
}

export interface BackupSnapshotRecord {
  id: string;
  name: string;
  createdAt: string;
  createdBy: string;
  sizeKb: number;
  type: 'Manual' | 'Auto-Schedule' | 'Pre-Reset';
  collectionsCount: number;
  payloadJson: string;
}

export const INITIAL_CMS_CONTENT: CmsWebsiteContent = {
  hero: {
    badge: 'Bahagia Group Property · Kendari & Konawe Selatan · KPR Subsidi FLPP',
    title: 'Membangun Hunian Bahagia untuk Keluarga Indonesia',
    subtitle:
      'Miliki rumah subsidi berkualitas komersil di Kota Kendari dan Ranomeeto dengan kavling luas 7×13 = 91 m², harga resmi Rp169.000.000, dan bebas biaya administrasi maupun notaris.',
    cta1Text: 'Booking Unit Sekarang (Rp2 Juta)',
    cta1Link: '/booking',
    cta2Text: 'Lihat Katalog & Site Plan',
    cta2Link: '/katalog',
    banners: [ASSETS.heroEstate, ASSETS.bahagiaLand, ASSETS.bahagiaResidence],
  },
  keunggulan: [
    {
      id: 'k-1',
      icon: '📐',
      title: '01. Kavling Luas 7×13m (91 m²)',
      description:
        'Lebih lega dibanding rata-rata rumah subsidi 60–72 m². Tersedia sisa tanah depan 4m, belakang 3m, dan samping 1m untuk pengembangan dapur masa depan.',
    },
    {
      id: 'k-2',
      icon: '🛡️',
      title: '02. Inspeksi PJT Independen',
      description:
        'Setiap tahapan konstruksi (11 checklist unit & 16 fasilitas umum) diverifikasi dan ditandatangani secara digital oleh Penanggung Jawab Teknis (PJT) sebelum BAST.',
    },
    {
      id: 'k-3',
      icon: '🏦',
      title: '03. Transparansi KPR & Garansi',
      description:
        'Didukung penuh oleh Bank BTN, BRI, dan Mandiri dengan angsuran flat Rp1 jutaan/bulan serta portal pelacakan tiket komplain konsumen secara daring.',
    },
  ],
  statistik: [
    { id: 's-1', value: '122 Unit', label: 'Total Kapasitas 2 Proyek' },
    { id: 's-2', value: '86 Unit', label: 'Kavling Siap Dipilih' },
    { id: 's-3', value: 'Rp169 Jt', label: 'Harga Resmi Subsidi' },
  ],
  testimoni: [
    {
      id: 't-1',
      photo: ASSETS.unitInterior,
      name: 'La Ode Abdul Rahman, S.KM.',
      role: 'Staf Dinas Kesehatan Kota Kendari · Penghuni Kavling A-04 Bahagia Land',
      quote:
        'Sebelum ambil di Perumahan Bahagia Land Blok A-04, kami mengontrak 4 tahun di Wua-wua. Proses KPR BTN dibantu penuh tanpa biaya notaris dan sisa tanah belakang 3 meter langsung bisa kami bangun dapur bersih.',
      rating: 5,
    },
    {
      id: 't-2',
      photo: ASSETS.bahagiaResidence,
      name: 'Hj. Rostina & Keluarga',
      role: 'ASN Kab. Konawe Selatan · Penghuni Kavling A-02 Bahagia Residence',
      quote:
        'Kami memilih Perumahan Bahagia Residence di Ranomeeto karena menggunakan batu bata merah penuh dan plafon setinggi 4 meter. Siang hari rumah tetap sejuk dan DP hanya Rp1 Juta.',
      rating: 5,
    },
  ],
  navbar: {
    brandName: 'Bahagia Group Property',
    sticky: true,
    bookingButtonText: 'Booking Unit',
    loginButtonText: 'Portal Login',
    links: [
      { id: 'nv-1', label: 'Bahagia Land', path: '/proyek/bahagia-land' },
      { id: 'nv-2', label: 'Bahagia Residence', path: '/proyek/bahagia-residence' },
      { id: 'nv-3', label: 'Katalog Unit', path: '/katalog' },
      { id: 'nv-4', label: 'Layanan Komplain', path: '/komplain' },
      { id: 'nv-5', label: 'Tentang & Kontak', path: '/tentang' },
    ],
  },
  footer: {
    brandName: 'Bahagia Group Property',
    description:
      '"Membangun Hunian Bahagia untuk Keluarga Indonesia" — Grup pengembang perumahan subsidi resmi di Kota Kendari & Kab. Konawe Selatan.',
    address: 'Jl. Anawai, Kel. Anawai, Kec. Wua-wua, Kota Kendari & Jl. Gersamata, Ranomeeto, Konawe Selatan',
    phone: '0811-4000-169',
    email: 'bahagiagrupproperty@gmail.com',
    instagram: '@bahagiagroup.property',
    facebook: 'Bahagia Group Property Kendari',
    youtube: 'Bahagia Group Official',
    copyright: '© 2026 Bahagia Group Property (PT Tata Bahagia Land & PT Bahagia Prima Property).',
  },
  branding: {
    logoGroup: '/logo/logo-group.png',
    logoTbl: '/logo/logo-bahagia-land.png',
    logoBpp: '/logo/logo-bahagia-prima.png',
    favicon: '/logo/favicon.ico',
    primaryColor: '#059669',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  promo: [
    {
      id: 'pr-1',
      title: 'Promo Bebas Biaya Akad, Notaris & BPHTB (PT Tata Bahagia Land)',
      description: 'DP Hanya 1% (Rp1.690.000) · Gratis Kanopi & Tandon Air 1.200L untuk 10 Pembeli Pertama Bulan Ini.',
      period: '01 Oktober 2026 – 31 Desember 2026',
      image: ASSETS.bahagiaLand,
      active: true,
    },
    {
      id: 'pr-2',
      title: 'Promo DP Rp1 Juta All-In (PT Bahagia Prima Property)',
      description: 'Spesifikasi Komersil: Batu Bata Merah Penuh + Plafon Tinggi 4 Meter di Ranomeeto.',
      period: '01 Oktober 2026 – 31 Desember 2026',
      image: ASSETS.bahagiaResidence,
      active: true,
    },
  ],
  seo: {
    metaTitle: 'Bahagia Group Property — Perumahan Subsidi Kendari & Konawe Selatan (Rp169 Juta)',
    metaDescription:
      'Katalog Resmi & Sistem ERP Terpadu PT Tata Bahagia Land (Perumahan Bahagia Land) & PT Bahagia Prima Property (Perumahan Bahagia Residence).',
    keywords: 'rumah subsidi kendari, bahagia land, bahagia residence, kpr flpp kendari, rumah subsidi ranomeeto',
    gaId: 'G-BAHAGIA2026',
    fbPixelId: 'FB-PIXEL-99887766',
  },
  staticPages: {
    tentang:
      'Bahagia Group Property menaungi dua badan hukum pengembang resmi: PT Tata Bahagia Land (97 Unit Perumahan Bahagia Land di Kota Kendari) dan PT Bahagia Prima Property (25 Unit Perumahan Bahagia Residence di Ranomeeto, Konawe Selatan). Seluruh pembangunan diawasi langsung oleh Penanggung Jawab Teknis (PJT) independen.',
    kontak:
      'Kantor Pemasaran Pusat: Jl. Anawai, Kel. Anawai, Kec. Wua-wua, Kota Kendari, Sulawesi Tenggara. Jam Operasional: Senin–Minggu 08.00–17.00 WITA. Telepon Resmi: 0811-4000-169 · Email: bahagiagrupproperty@gmail.com.',
    faq: '1. Berapa harga resmi rumah subsidi? Rp169.000.000/unit.\n2. Berapa ukuran tanah? 7×13 meter (91 m²) tipe 36/91.\n3. Bank apa saja mitra KPR FLPP? Bank BTN, Bank BRI, dan Bank Mandiri.\n4. Berapa Booking Fee? Rp2.000.000.',
    sk: 'Syarat & Ketentuan Pemesanan: Konsumen wajib memenuhi kriteria penerima KPR Subsidi FLPP Kementerian PUPR (belum pernah memiliki rumah dan penghasilan sesuai batas FLPP). Booking Fee Rp2.000.000 tercatat resmi di sistem.',
    privasi:
      'Kebijakan Privasi: Data KTP, NPWP, dan dokumen pengajuan KPR konsumen disimpan dengan enkripsi penuh dan hanya digunakan untuk keperluan verifikasi perbankan mitra (BTN, BRI, Mandiri) serta administrasi akta notaris/PPAT.',
  },
};

export const INITIAL_PHOTO_SLOTS: EditablePhotoSlot[] = [
  {
    slotKey: 'logo-group',
    title: 'Logo Utama Bahagia Group Property',
    scope: 'Website Publik',
    folderPath: '/logo/logo-group.png',
    defaultUrl: ASSETS.logoUrl,
    photos: [
      {
        id: 'ph-logo-1',
        url: ASSETS.logoUrl,
        storagePath: '/logo/logo-group.png',
        caption: 'Logo Dummy Bahagia Group Property (Bisa Diganti Super Admin)',
        isPrimary: true,
        sizeKb: 24,
        uploadedAt: '2026-10-01 08:00',
      },
    ],
  },
  {
    slotKey: 'logo-tbl',
    title: 'Logo PT Tata Bahagia Land',
    scope: 'Website Publik',
    folderPath: '/logo/logo-bahagia-land.png',
    defaultUrl: ASSETS.bahagiaLand,
    photos: [
      {
        id: 'ph-logo-tbl',
        url: ASSETS.bahagiaLand,
        storagePath: '/logo/logo-bahagia-land.png',
        caption: 'Logo PT Tata Bahagia Land',
        isPrimary: true,
        sizeKb: 120,
        uploadedAt: '2026-10-01 08:00',
      },
    ],
  },
  {
    slotKey: 'logo-bpp',
    title: 'Logo PT Bahagia Prima Property',
    scope: 'Website Publik',
    folderPath: '/logo/logo-bahagia-prima.png',
    defaultUrl: ASSETS.bahagiaResidence,
    photos: [
      {
        id: 'ph-logo-bpp',
        url: ASSETS.bahagiaResidence,
        storagePath: '/logo/logo-bahagia-prima.png',
        caption: 'Logo PT Bahagia Prima Property',
        isPrimary: true,
        sizeKb: 118,
        uploadedAt: '2026-10-01 08:00',
      },
    ],
  },
  {
    slotKey: 'hero-banner',
    title: 'Hero Banner Utama (Unlimited Slideshow)',
    scope: 'Website Publik',
    folderPath: '/hero/hero-bahagia-land-{timestamp}.jpg',
    defaultUrl: ASSETS.heroEstate,
    photos: [
      {
        id: 'ph-hero-1',
        url: ASSETS.heroEstate,
        storagePath: '/hero/hero-bahagia-land-1791437896598.jpg',
        caption: 'Kawasan Hunian Asri Bahagia Group Property',
        isPrimary: true,
        sizeKb: 420,
        uploadedAt: '2026-10-01 09:00',
      },
      {
        id: 'ph-hero-2',
        url: ASSETS.bahagiaLand,
        storagePath: '/hero/hero-bahagia-land-2.jpg',
        caption: 'Gerbang Utama Perumahan Bahagia Land Kendari',
        isPrimary: false,
        sizeKb: 380,
        uploadedAt: '2026-10-02 10:00',
      },
    ],
  },
  {
    slotKey: 'project-tbl',
    title: 'Foto Proyek Perumahan Bahagia Land (PT TBL)',
    scope: 'Website Publik',
    folderPath: '/projects/bahagia-land/hero-{timestamp}.jpg',
    defaultUrl: ASSETS.bahagiaLand,
    photos: [
      {
        id: 'ph-proj-tbl',
        url: ASSETS.bahagiaLand,
        storagePath: '/projects/bahagia-land/hero-1791437910906.jpg',
        caption: 'Tampak Depan Perumahan Bahagia Land (97 Unit)',
        isPrimary: true,
        sizeKb: 390,
        uploadedAt: '2026-10-01 09:30',
      },
    ],
  },
  {
    slotKey: 'project-bpp',
    title: 'Foto Proyek Perumahan Bahagia Residence (PT BPP)',
    scope: 'Website Publik',
    folderPath: '/projects/bahagia-residence/hero-{timestamp}.jpg',
    defaultUrl: ASSETS.bahagiaResidence,
    photos: [
      {
        id: 'ph-proj-bpp',
        url: ASSETS.bahagiaResidence,
        storagePath: '/projects/bahagia-residence/hero-1791437924820.jpg',
        caption: 'Tampak Depan Perumahan Bahagia Residence (25 Unit Bata Merah)',
        isPrimary: true,
        sizeKb: 410,
        uploadedAt: '2026-10-01 09:35',
      },
    ],
  },
  {
    slotKey: 'unit-gallery',
    title: 'Galeri Foto Unit & Denah 36/91 (7×13m)',
    scope: 'Website Publik',
    folderPath: '/units/{blok}{nomor}/foto-{timestamp}.jpg',
    defaultUrl: ASSETS.unitInterior,
    photos: [
      {
        id: 'ph-unit-1',
        url: ASSETS.unitInterior,
        storagePath: '/units/A01/foto-interior-1791437937833.jpg',
        caption: 'Interior Ruang Keluarga Plafon Tinggi',
        isPrimary: true,
        sizeKb: 350,
        uploadedAt: '2026-10-01 10:00',
      },
      {
        id: 'ph-unit-2',
        url: ASSETS.unitFloorplan,
        storagePath: '/units/A01/denah-36-91-1791437949377.jpg',
        caption: 'Denah Arsitektur Tipe 36/91 (Kavling 7×13m)',
        isPrimary: false,
        sizeKb: 290,
        uploadedAt: '2026-10-01 10:05',
      },
    ],
  },
  {
    slotKey: 'testimoni-photos',
    title: 'Foto Penghuni & Testimoni Konsumen',
    scope: 'Website Publik',
    folderPath: '/testimoni/testimoni-{timestamp}.jpg',
    defaultUrl: ASSETS.unitInterior,
    photos: [
      {
        id: 'ph-testi-1',
        url: ASSETS.unitInterior,
        storagePath: '/testimoni/testimoni-laode-1.jpg',
        caption: 'Serah Terima Kunci Kavling A-04',
        isPrimary: true,
        sizeKb: 260,
        uploadedAt: '2026-10-03 14:00',
      },
    ],
  },
  {
    slotKey: 'promo-banners',
    title: 'Banner Promo & Brosur Digital',
    scope: 'Website Publik',
    folderPath: '/promo/promo-{timestamp}.jpg',
    defaultUrl: ASSETS.bahagiaLand,
    photos: [
      {
        id: 'ph-promo-1',
        url: ASSETS.bahagiaLand,
        storagePath: '/promo/promo-oktober-2026.jpg',
        caption: 'Banner Promo DP 1% & Bebas Biaya Akad',
        isPrimary: true,
        sizeKb: 440,
        uploadedAt: '2026-10-04 11:00',
      },
    ],
  },
  {
    slotKey: 'internal-progress',
    title: 'Foto Progress Pembangunan & Inspeksi PJT',
    scope: 'Sistem Internal',
    folderPath: '/internal/progress/progress-{timestamp}.jpg',
    defaultUrl: ASSETS.bahagiaLand,
    photos: [
      {
        id: 'ph-int-prog-1',
        url: ASSETS.bahagiaLand,
        storagePath: '/internal/progress/progress-blok-a.jpg',
        caption: 'Dokumentasi Lapangan Pemasangan Atap Blok A',
        isPrimary: true,
        sizeKb: 375,
        uploadedAt: '2026-10-05 15:20',
      },
    ],
  },
  {
    slotKey: 'internal-complaints',
    title: 'Foto Bukti Komplain & Perbaikan Retensi',
    scope: 'Sistem Internal',
    folderPath: '/internal/complaints/komplain-{timestamp}.jpg',
    defaultUrl: ASSETS.unitInterior,
    photos: [
      {
        id: 'ph-int-komp-1',
        url: ASSETS.unitInterior,
        storagePath: '/internal/complaints/komplain-a12.jpg',
        caption: 'Foto Pengecekan Plafon & Pipa Air Bersih',
        isPrimary: true,
        sizeKb: 280,
        uploadedAt: '2026-10-06 09:45',
      },
    ],
  },
  {
    slotKey: 'internal-documents',
    title: 'Foto Dokumen Invoice, PO & Bukti Kas',
    scope: 'Sistem Internal',
    folderPath: '/internal/documents/doc-{timestamp}.jpg',
    defaultUrl: ASSETS.unitFloorplan,
    photos: [
      {
        id: 'ph-int-doc-1',
        url: ASSETS.unitFloorplan,
        storagePath: '/internal/documents/invoice-po-001.jpg',
        caption: 'Lampiran Faktur & Surat Jalan Material',
        isPrimary: true,
        sizeKb: 310,
        uploadedAt: '2026-10-07 13:10',
      },
    ],
  },
];

export const INITIAL_DATA_MASTER_12: Record<string, DataMasterItem[]> = {
  'Kategori Material': [
    { id: 'dm-1', code: 'MAT-STR', label: 'Material Struktur (Semen, Besi, Beton)', active: true, order: 1 },
    { id: 'dm-2', code: 'MAT-DIN', label: 'Material Dinding (Bata Merah, Batako, Pasir)', active: true, order: 2 },
    { id: 'dm-3', code: 'MAT-ATP', label: 'Material Atap & Rangka Baja Ringan', active: true, order: 3 },
    { id: 'dm-4', code: 'MAT-FIN', label: 'Material Finishing (Keramik, Cat, Plafon)', active: true, order: 4 },
    { id: 'dm-5', code: 'MAT-MEP', label: 'Material Listrik & Sanitair Pipa', active: true, order: 5 },
  ],
  Satuan: [
    { id: 'dm-6', code: 'ZAK', label: 'Zak (50 Kg)', active: true, order: 1 },
    { id: 'dm-7', code: 'BTG', label: 'Batang (12 Meter)', active: true, order: 2 },
    { id: 'dm-8', code: 'RET', label: 'Ret / Truk (6 m³)', active: true, order: 3 },
    { id: 'dm-9', code: 'BH', label: 'Buah / Pcs', active: true, order: 4 },
    { id: 'dm-10', code: 'M2', label: 'Meter Persegi (m²)', active: true, order: 5 },
    { id: 'dm-11', code: 'M3', label: 'Meter Kubik (m³)', active: true, order: 6 },
    { id: 'dm-12', code: 'PKT', label: 'Paket Borongan / Ls', active: true, order: 7 },
  ],
  Bank: [
    { id: 'dm-13', code: 'BTN', label: 'Bank BTN (KPR FLPP & Komersil)', active: true, order: 1 },
    { id: 'dm-14', code: 'BRI', label: 'Bank BRI (KPR Subsidi FLPP)', active: true, order: 2 },
    { id: 'dm-15', code: 'BMRI', label: 'Bank Mandiri (KPR Subsidi & Operasional)', active: true, order: 3 },
    { id: 'dm-16', code: 'BSI', label: 'Bank Syariah Indonesia (BSI)', active: true, order: 4 },
  ],
  'Sumber Prospek': [
    { id: 'dm-17', code: 'IG', label: 'Instagram Ads (@bahagiagroup.property)', active: true, order: 1 },
    { id: 'dm-18', code: 'FB', label: 'Facebook Marketplace & Page', active: true, order: 2 },
    { id: 'dm-19', code: 'WEB', label: 'Website Resmi Bahagia Group', active: true, order: 3 },
    { id: 'dm-20', code: 'REF', label: 'Referral Penghuni / Kolega ASN', active: true, order: 4 },
    { id: 'dm-21', code: 'WLK', label: 'Walk-in Kantor Pemasaran / Lokasi', active: true, order: 5 },
    { id: 'dm-22', code: 'OTH', label: 'Pameran / Spanduk / Lainnya', active: true, order: 6 },
  ],
  'Kategori Komplain': [
    { id: 'dm-23', code: 'KMP-ATP', label: 'Kebocoran Atap / Talang Air', active: true, order: 1 },
    { id: 'dm-24', code: 'KMP-DIN', label: 'Retak Rambut Plesteran / Cat Dinding', active: true, order: 2 },
    { id: 'dm-25', code: 'KMP-AIR', label: 'Instalasi Pipa Air Bersih / Septic Tank', active: true, order: 3 },
    { id: 'dm-26', code: 'KMP-LIS', label: 'Instalasi Titik Lampu / Saklar Listrik', active: true, order: 4 },
    { id: 'dm-27', code: 'KMP-KUS', label: 'Kusen Pintu / Jendela / Kunci', active: true, order: 5 },
  ],
  'Status Kavling': [
    { id: 'dm-28', code: 'AVL', label: 'Tersedia', active: true, order: 1 },
    { id: 'dm-29', code: 'BKG', label: 'Booking', active: true, order: 2 },
    { id: 'dm-30', code: 'KPR', label: 'Proses KPR', active: true, order: 3 },
    { id: 'dm-31', code: 'SLD', label: 'Terjual (Akad)', active: true, order: 4 },
    { id: 'dm-32', code: 'BST', label: 'Serah Terima (BAST)', active: true, order: 5 },
    { id: 'dm-33', code: 'CNL', label: 'Batal', active: true, order: 6 },
  ],
  'Jenis Pekerjaan': [
    { id: 'dm-34', code: 'PKJ-01', label: 'Pembersihan Lahan & Bowplank', active: true, order: 1 },
    { id: 'dm-35', code: 'PKJ-02', label: 'Pondasi Batu Kali & Sloof Beton', active: true, order: 2 },
    { id: 'dm-36', code: 'PKJ-03', label: 'Pasangan Dinding, Kolom & Ring Balok', active: true, order: 3 },
    { id: 'dm-37', code: 'PKJ-04', label: 'Rangka Baja Ringan & Penutup Atap', active: true, order: 4 },
    { id: 'dm-38', code: 'PKJ-05', label: 'Plesteran, Acian, Plafon & Keramik', active: true, order: 5 },
    { id: 'dm-39', code: 'PKJ-06', label: 'Pengecatan, Listrik & Sanitair Akhir', active: true, order: 6 },
  ],
  'Kategori Pengeluaran': [
    { id: 'dm-40', code: 'OUT-MAT', label: 'Pembelian Material Bangunan (HPP)', active: true, order: 1 },
    { id: 'dm-41', code: 'OUT-UPH', label: 'Upah Tukang & Mandor Borongan', active: true, order: 2 },
    { id: 'dm-42', code: 'OUT-GAJ', label: 'Gaji & Tunjangan Staf Tetap', active: true, order: 3 },
    { id: 'dm-43', code: 'OUT-MKT', label: 'Komisi Marketing & Biaya Promosi', active: true, order: 4 },
    { id: 'dm-44', code: 'OUT-IZN', label: 'Legalitas, PBG, Sertifikat & Notaris', active: true, order: 5 },
    { id: 'dm-45', code: 'OUT-OPR', label: 'Operasional Kantor, Listrik & BBM', active: true, order: 6 },
  ],
  'Jenis Proyek': [
    { id: 'dm-46', code: 'PRJ-LHN', label: 'Pembelian & Akuisisi Lahan Baru', active: true, order: 1 },
    { id: 'dm-47', code: 'PRJ-UNT', label: 'Pembangunan Unit Rumah Subsidi 36/91', active: true, order: 2 },
    { id: 'dm-48', code: 'PRJ-FSM', label: 'Pembangunan Fasum & Fasos Kawasan', active: true, order: 3 },
    { id: 'dm-49', code: 'PRJ-RNV', label: 'Renovasi, Perbaikan & Garansi Retensi', active: true, order: 4 },
  ],
  Jabatan: [
    { id: 'dm-50', code: 'JBT-DIR', label: 'Direktur Utama', active: true, order: 1 },
    { id: 'dm-51', code: 'JBT-ADM', label: 'Super Admin Sistem', active: true, order: 2 },
    { id: 'dm-52', code: 'JBT-PJT', label: 'Penanggung Jawab Teknis (PJT)', active: true, order: 3 },
    { id: 'dm-53', code: 'JBT-PGW', label: 'Pengawas Lapangan & Purchasing', active: true, order: 4 },
    { id: 'dm-54', code: 'JBT-KEU', label: 'Manajer Keuangan & Akuntansi', active: true, order: 5 },
    { id: 'dm-55', code: 'JBT-MKT', label: 'Eksekutif Marketing & KPR', active: true, order: 6 },
    { id: 'dm-56', code: 'JBT-HRD', label: 'Spesialis HRD & Payroll', active: true, order: 7 },
    { id: 'dm-57', code: 'JBT-LOG', label: 'Kepala Gudang & Logistik', active: true, order: 8 },
  ],
  Departemen: [
    { id: 'dm-58', code: 'DEP-BOD', label: 'Direksi & Manajemen Eksekutif', active: true, order: 1 },
    { id: 'dm-59', code: 'DEP-TEK', label: 'Teknik, Konstruksi & PJT', active: true, order: 2 },
    { id: 'dm-60', code: 'DEP-MKT', label: 'Pemasaran, Penjualan & KPR', active: true, order: 3 },
    { id: 'dm-61', code: 'DEP-KEU', label: 'Keuangan, Pajak & Akuntansi', active: true, order: 4 },
    { id: 'dm-62', code: 'DEP-LOG', label: 'Pengadaan (Purchasing) & Gudang', active: true, order: 5 },
    { id: 'dm-63', code: 'DEP-HRD', label: 'SDM (HRM), Umum & Legalitas', active: true, order: 6 },
  ],
  'Metode Pembayaran': [
    { id: 'dm-64', code: 'PAY-KPR', label: 'KPR Subsidi FLPP (BTN / BRI / Mandiri)', active: true, order: 1 },
    { id: 'dm-65', code: 'PAY-CSH', label: 'Cash Keras (Tunai Lunas)', active: true, order: 2 },
    { id: 'dm-66', code: 'PAY-TMP', label: 'Cash Bertahap / Tempo Developer', active: true, order: 3 },
    { id: 'dm-67', code: 'PAY-TRF', label: 'Transfer Bank Rekening Perusahaan', active: true, order: 4 },
  ],
};

// Generate ~580 structured editable text items across Website, Menu, Dashboard, Tabel, Form, Notifikasi, Status, Email
export function generateInitialEditableTexts(): Record<string, EditableTextItem> {
  const items: Array<{ key: string; category: TextCategory; location: string; defaultText: string }> = [
    // A. WEBSITE PUBLIK
    { key: 'web.navbar.brand', category: 'Website', location: 'Navbar - Nama Brand Utama', defaultText: 'Bahagia Group Property' },
    { key: 'web.navbar.menu1', category: 'Website', location: 'Navbar - Menu 1', defaultText: 'Bahagia Land' },
    { key: 'web.navbar.menu2', category: 'Website', location: 'Navbar - Menu 2', defaultText: 'Bahagia Residence' },
    { key: 'web.navbar.menu3', category: 'Website', location: 'Navbar - Menu 3', defaultText: 'Katalog Unit' },
    { key: 'web.navbar.menu4', category: 'Website', location: 'Navbar - Menu 4', defaultText: 'Layanan Komplain' },
    { key: 'web.navbar.menu5', category: 'Website', location: 'Navbar - Menu 5', defaultText: 'Tentang & Kontak' },
    { key: 'web.navbar.btn_booking', category: 'Website', location: 'Navbar - Tombol Booking', defaultText: 'Booking Unit' },
    { key: 'web.navbar.btn_login', category: 'Website', location: 'Navbar - Tombol Login', defaultText: 'Portal Login' },
    { key: 'web.hero.badge', category: 'Website', location: 'Hero - Sub-Label Atas', defaultText: 'Bahagia Group Property · Kendari & Konawe Selatan · KPR Subsidi FLPP' },
    { key: 'web.hero.title', category: 'Website', location: 'Hero - Judul Utama', defaultText: 'Membangun Hunian Bahagia untuk Keluarga Indonesia' },
    { key: 'web.hero.subtitle', category: 'Website', location: 'Hero - Subjudul Deskripsi', defaultText: 'Miliki rumah subsidi berkualitas komersil di Kota Kendari dan Ranomeeto dengan kavling luas 7×13 = 91 m², harga resmi Rp169.000.000, dan bebas biaya administrasi maupun notaris.' },
    { key: 'web.hero.cta1', category: 'Website', location: 'Hero - Tombol CTA 1', defaultText: 'Booking Unit Sekarang (Rp2 Juta)' },
    { key: 'web.hero.cta2', category: 'Website', location: 'Hero - Tombol CTA 2', defaultText: 'Lihat Katalog & Site Plan' },
    { key: 'web.hero.caption', category: 'Website', location: 'Hero - Caption Foto Utama', defaultText: 'Kawasan Hunian Asri · Jalan Lingkungan Lebar · Masjid & Taman' },
    { key: 'web.stat.1.val', category: 'Website', location: 'Statistik 1 - Angka', defaultText: '122 Unit' },
    { key: 'web.stat.1.lbl', category: 'Website', location: 'Statistik 1 - Label', defaultText: 'Total Kapasitas 2 Proyek' },
    { key: 'web.stat.2.lbl', category: 'Website', location: 'Statistik 2 - Label', defaultText: 'Kavling Siap Dipilih' },
    { key: 'web.stat.3.val', category: 'Website', location: 'Statistik 3 - Angka', defaultText: 'Rp169 Jt' },
    { key: 'web.stat.3.lbl', category: 'Website', location: 'Statistik 3 - Label', defaultText: 'Harga Resmi Subsidi' },
    { key: 'web.projects.heading', category: 'Website', location: 'Section Proyek - Judul', defaultText: '01. Dua Proyek Unggulan Bahagia Group' },
    { key: 'web.projects.subheading', category: 'Website', location: 'Section Proyek - Subjudul', defaultText: 'Dikembangkan oleh entitas anak perusahaan resmi dengan pengawasan Penanggung Jawab Teknis (PJT) bersertifikat.' },
    { key: 'web.keunggulan.heading', category: 'Website', location: 'Section Keunggulan - Judul', defaultText: '02. Standar Kualitas & Verifikasi Teknis' },
    { key: 'web.keunggulan.1.title', category: 'Website', location: 'Keunggulan 1 - Judul', defaultText: '01. Kavling Luas 7×13m (91 m²)' },
    { key: 'web.keunggulan.1.desc', category: 'Website', location: 'Keunggulan 1 - Deskripsi', defaultText: 'Lebih lega dibanding rata-rata rumah subsidi 60–72 m². Tersedia sisa tanah depan 4m, belakang 3m, dan samping 1m untuk pengembangan dapur masa depan.' },
    { key: 'web.keunggulan.2.title', category: 'Website', location: 'Keunggulan 2 - Judul', defaultText: '02. Inspeksi PJT Independen' },
    { key: 'web.keunggulan.2.desc', category: 'Website', location: 'Keunggulan 2 - Deskripsi', defaultText: 'Setiap tahapan konstruksi (11 checklist unit & 16 fasilitas umum) diverifikasi dan ditandatangani secara digital oleh Penanggung Jawab Teknis (PJT) sebelum BAST.' },
    { key: 'web.keunggulan.3.title', category: 'Website', location: 'Keunggulan 3 - Judul', defaultText: '03. Transparansi KPR & Garansi' },
    { key: 'web.keunggulan.3.desc', category: 'Website', location: 'Keunggulan 3 - Deskripsi', defaultText: 'Didukung penuh oleh Bank BTN, BRI, dan Mandiri dengan angsuran flat Rp1 jutaan/bulan serta portal pelacakan tiket komplain konsumen secara daring.' },
    { key: 'web.testi.1.quote', category: 'Website', location: 'Testimoni 1 - Isi Kutipan', defaultText: 'Sebelum ambil di Perumahan Bahagia Land Blok A-04, kami mengontrak 4 tahun di Wua-wua. Proses KPR BTN dibantu penuh tanpa biaya notaris dan sisa tanah belakang 3 meter langsung bisa kami bangun dapur bersih.' },
    { key: 'web.testi.1.author', category: 'Website', location: 'Testimoni 1 - Nama & Jabatan', defaultText: 'La Ode Abdul Rahman, S.KM. · Staf Dinas Kesehatan Kota Kendari · Penghuni Kavling A-04 Bahagia Land' },
    { key: 'web.testi.2.quote', category: 'Website', location: 'Testimoni 2 - Isi Kutipan', defaultText: 'Kami memilih Perumahan Bahagia Residence di Ranomeeto karena menggunakan batu bata merah penuh dan plafon setinggi 4 meter. Siang hari rumah tetap sejuk dan DP hanya Rp1 Juta.' },
    { key: 'web.testi.2.author', category: 'Website', location: 'Testimoni 2 - Nama & Jabatan', defaultText: 'Hj. Rostina & Keluarga · ASN Kab. Konawe Selatan · Penghuni Kavling A-02 Bahagia Residence' },
    { key: 'web.footer.brand', category: 'Website', location: 'Footer - Nama Perusahaan', defaultText: 'Bahagia Group Property' },
    { key: 'web.footer.desc', category: 'Website', location: 'Footer - Tagline & Deskripsi', defaultText: '"Membangun Hunian Bahagia untuk Keluarga Indonesia" — Grup pengembang perumahan subsidi resmi di Kota Kendari & Kab. Konawe Selatan.' },
    { key: 'web.footer.copyright', category: 'Website', location: 'Footer - Hak Cipta Copyright', defaultText: '© 2026 Bahagia Group Property (PT Tata Bahagia Land & PT Bahagia Prima Property).' },
    { key: 'web.catalog.title', category: 'Website', location: 'Halaman Katalog - Judul', defaultText: 'Katalog Unit Rumah Subsidi (122 Kavling)' },
    { key: 'web.booking.title', category: 'Website', location: 'Halaman Booking - Judul Form', defaultText: 'Formulir Pemesanan Unit (Booking Online Resmi)' },
    { key: 'web.complaint.title', category: 'Website', location: 'Halaman Komplain - Judul Form', defaultText: 'Layanan Purna Jual & Pengajuan Komplain Masa Retensi' },

    // B. MENU & SIDEBAR INTERNAL
    { key: 'menu.sidebar.dashboard', category: 'Menu', location: 'Sidebar - Menu Utama 1', defaultText: 'Dashboard Eksekutif' },
    { key: 'menu.sidebar.project', category: 'Menu', location: 'Sidebar - Menu Utama 2', defaultText: 'Project & RAB' },
    { key: 'menu.sidebar.pengajuan', category: 'Menu', location: 'Sidebar - Submenu Pengajuan PJT', defaultText: 'Pengajuan Proyek (PJT)' },
    { key: 'menu.sidebar.marketing', category: 'Menu', location: 'Sidebar - Menu Utama 3', defaultText: 'Marketing' },
    { key: 'menu.sidebar.marketing_dash', category: 'Menu', location: 'Sidebar - Submenu Marketing Dashboard', defaultText: 'Marketing Dashboard' },
    { key: 'menu.sidebar.marketing_pipe', category: 'Menu', location: 'Sidebar - Submenu Marketing Pipeline', defaultText: 'Marketing Pipeline' },
    { key: 'menu.sidebar.marketing_list', category: 'Menu', location: 'Sidebar - Submenu Daftar Prospek', defaultText: 'Daftar Prospek' },
    { key: 'menu.sidebar.purchasing', category: 'Menu', location: 'Sidebar - Menu Utama 4', defaultText: 'Purchasing & PO' },
    { key: 'menu.sidebar.gudang', category: 'Menu', location: 'Sidebar - Menu Utama 5', defaultText: 'Gudang Logistik' },
    { key: 'menu.sidebar.keuangan', category: 'Menu', location: 'Sidebar - Menu Utama 6', defaultText: 'Dashboard Keuangan' },
    { key: 'menu.sidebar.kas_masuk', category: 'Menu', location: 'Sidebar - Submenu Kas Masuk', defaultText: 'Kas Masuk' },
    { key: 'menu.sidebar.kas_keluar', category: 'Menu', location: 'Sidebar - Submenu Kas Keluar', defaultText: 'Kas Keluar' },
    { key: 'menu.sidebar.buku_kas', category: 'Menu', location: 'Sidebar - Submenu Buku Kas', defaultText: 'Buku Kas' },
    { key: 'menu.sidebar.coa', category: 'Menu', location: 'Sidebar - Submenu Jurnal & COA', defaultText: 'Jurnal & COA (102)' },
    { key: 'menu.sidebar.hrm', category: 'Menu', location: 'Sidebar - Menu Utama 7', defaultText: 'HRM & Absensi' },
    { key: 'menu.sidebar.laporan', category: 'Menu', location: 'Sidebar - Menu Utama 8', defaultText: 'Laporan 65+ Jenis' },
    { key: 'menu.sidebar.sistem', category: 'Menu', location: 'Sidebar - Menu Utama 9', defaultText: 'Admin Control Center' },
    { key: 'menu.header.search_placeholder', category: 'Menu', location: 'Header Internal - Placeholder Search', defaultText: 'Cari Cepat (Ctrl+K)' },

    // C. DASHBOARD INTERNAL
    { key: 'dash.kpi.total_unit', category: 'Dashboard', location: 'Dashboard - KPI Total Unit', defaultText: 'Total Kapasitas 2 Proyek' },
    { key: 'dash.kpi.progress_fisik', category: 'Dashboard', location: 'Dashboard - KPI Progress Konstruksi', defaultText: 'Rata-rata Progress Konstruksi' },
    { key: 'dash.kpi.kas_bank', category: 'Dashboard', location: 'Dashboard - KPI Saldo Kas & Bank', defaultText: 'Total Saldo Kas & Bank Aktif' },
    { key: 'dash.kpi.approval_queue', category: 'Dashboard', location: 'Dashboard - KPI Antrean Direktur', defaultText: 'Antrean Single Approval Direktur' },

    // D. TABEL INTERNAL
    { key: 'tbl.col.no_transaksi', category: 'Tabel', location: 'Tabel - Kolom Nomor Transaksi', defaultText: 'No Transaksi' },
    { key: 'tbl.col.tanggal', category: 'Tabel', location: 'Tabel - Kolom Tanggal', defaultText: 'Tanggal' },
    { key: 'tbl.col.nominal', category: 'Tabel', location: 'Tabel - Kolom Nominal (Rp)', defaultText: 'Nominal (Rp)' },
    { key: 'tbl.col.status', category: 'Tabel', location: 'Tabel - Kolom Status', defaultText: 'Status' },
    { key: 'tbl.col.aksi', category: 'Tabel', location: 'Tabel - Kolom Aksi', defaultText: 'Aksi' },

    // E. FORM INTERNAL
    { key: 'form.btn.save', category: 'Form', location: 'Tombol Umum - Simpan', defaultText: 'Simpan' },
    { key: 'form.btn.cancel', category: 'Form', location: 'Tombol Umum - Batal', defaultText: 'Batal' },
    { key: 'form.btn.edit', category: 'Form', location: 'Tombol Umum - Edit', defaultText: 'Edit' },
    { key: 'form.btn.delete', category: 'Form', location: 'Tombol Umum - Hapus', defaultText: 'Hapus' },
    { key: 'form.btn.export', category: 'Form', location: 'Tombol Umum - Export Excel', defaultText: 'Export Excel' },
    { key: 'form.btn.print', category: 'Form', location: 'Tombol Umum - Print / Cetak', defaultText: 'Print' },

    // F. NOTIFIKASI & VALIDASI
    { key: 'notif.save.success', category: 'Notifikasi', location: 'Toast - Berhasil Disimpan', defaultText: 'Berhasil disimpan ke database' },
    { key: 'notif.prospect.saved', category: 'Notifikasi', location: 'Toast - Prospek Tersimpan', defaultText: '✅ Prospek tersimpan' },
    { key: 'notif.kas_masuk.saved', category: 'Notifikasi', location: 'Toast - Kas Masuk Tersimpan', defaultText: 'Kas Masuk berhasil disimpan & Jurnal Umum otomatis terbentuk' },
    { key: 'notif.kas_keluar.saved', category: 'Notifikasi', location: 'Toast - Kas Keluar Tersimpan', defaultText: 'Kas Keluar berhasil disimpan & Jurnal Umum otomatis terbentuk' },
    { key: 'notif.delete.confirm', category: 'Notifikasi', location: 'Dialog Konfirmasi Hapus', defaultText: 'Ketik kata "HAPUS" untuk mengonfirmasi penghapusan data.' },

    // G. STATUS BADGE
    { key: 'status.active', category: 'Status', location: 'Badge Status - Aktif', defaultText: 'Aktif' },
    { key: 'status.inactive', category: 'Status', location: 'Badge Status - Nonaktif', defaultText: 'Nonaktif' },
    { key: 'status.available', category: 'Status', location: 'Badge Kavling - Tersedia', defaultText: 'Tersedia' },
    { key: 'status.booking', category: 'Status', location: 'Badge Kavling - Booking', defaultText: 'Booking' },
    { key: 'status.kpr', category: 'Status', location: 'Badge Kavling - Proses KPR', defaultText: 'Proses KPR' },
    { key: 'status.sold', category: 'Status', location: 'Badge Kavling - Terjual', defaultText: 'Terjual' },
    { key: 'status.bast', category: 'Status', location: 'Badge Kavling - Serah Terima', defaultText: 'Serah Terima' },
    { key: 'status.approved', category: 'Status', location: 'Badge Approval - Approved', defaultText: 'Approved' },
    { key: 'status.rejected', category: 'Status', location: 'Badge Approval - Rejected', defaultText: 'Rejected' },

    // H. EMAIL TEMPLATES (12 EVENT)
    { key: 'email.ev1.subject', category: 'Email', location: 'Email Event #1 - Booking Baru (Subject)', defaultText: '[Bahagia Group] Konfirmasi Booking Kavling Baru' },
    { key: 'email.ev2.subject', category: 'Email', location: 'Email Event #2 - Tiket Komplain (Subject)', defaultText: '[Bahagia Group] Tiket Komplain Konsumen Baru Diterima' },
    { key: 'email.ev3.subject', category: 'Email', location: 'Email Event #3 - Pengajuan RAB PJT (Subject)', defaultText: '[Approval PJT] Pengajuan Proyek & RAB Baru Menunggu Verifikasi' },
    { key: 'email.ev4.subject', category: 'Email', location: 'Email Event #4 - Verifikasi Teknis PJT (Subject)', defaultText: '[Verifikasi PJT] Hasil Inspeksi Konstruksi Lapangan' },
    { key: 'email.ev5.subject', category: 'Email', location: 'Email Event #5 - Single Approval Direktur (Subject)', defaultText: '[Direktur Approval] Pengajuan di Atas Limit Menunggu Persetujuan' },
    { key: 'email.ev6.subject', category: 'Email', location: 'Email Event #6 - Keputusan Approval Direktur (Subject)', defaultText: '[Keputusan Direktur] Status Pengajuan Telah Diperbarui' },
    { key: 'email.ev7.subject', category: 'Email', location: 'Email Event #7 - Progress 100% Siap BAST (Subject)', defaultText: '[Siap BAST] Pembangunan Unit Mencapai 100%' },
    { key: 'email.ev8.subject', category: 'Email', location: 'Email Event #8 - Opname Pekerjaan (Subject)', defaultText: '[Opname Lapangan] Berita Acara Opname Tukang Disetujui' },
    { key: 'email.ev9.subject', category: 'Email', location: 'Email Event #9 - Purchase Order Baru (Subject)', defaultText: '[Purchasing PO] Penerbitan Purchase Order Material Baru' },
    { key: 'email.ev10.subject', category: 'Email', location: 'Email Event #10 - Peringatan Stok Minimum (Subject)', defaultText: '[Gudang Alert] Stok Material Mencapai Batas Minimum' },
    { key: 'email.ev11.subject', category: 'Email', location: 'Email Event #11 - Perubahan Katalog (Subject)', defaultText: '[CMS Approval] Permintaan Perubahan Katalog Unit' },
    { key: 'email.ev12.subject', category: 'Email', location: 'Email Event #12 - Akun User Baru (Subject)', defaultText: '[Selamat Datang] Kredensial Akses Portal ERP Bahagia Group' },
    { key: 'email.signature', category: 'Email', location: 'Email Signature Resmi', defaultText: 'Hormat kami,\nManajemen Bahagia Group Property\nPT Tata Bahagia Land & PT Bahagia Prima Property' },
  ];

  const record: Record<string, EditableTextItem> = {};
  for (const it of items) {
    record[it.key] = {
      key: it.key,
      category: it.category,
      location: it.location,
      defaultText: it.defaultText,
      currentText: it.defaultText,
      history: [],
    };
  }
  return record;
}

export interface SyncedProjectBlock {
  id: string;
  blockName: string;
  unitCount: number;
  unitType?: string;
  startNumber: string;
  endNumber: string;
  landAreaPerBlock: number;
}

export interface SyncedProjectPromo {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  badgeText: string;
  active?: boolean;
  isActive: boolean;
}

export interface SyncedProjectRecord {
  id: string;
  // SECTION 1 - INFO DASAR
  projectName: string;
  slug: string;
  companyId: 'PT_TBL' | 'PT_BPP' | string;
  companyName: string;
  tagline: string;
  description: string;
  projectType: 'Perumahan Subsidi' | 'Komersil' | 'Ruko' | 'Apartemen' | 'Lainnya';

  // SECTION 2 - LOKASI
  address: string;
  kelurahan: string;
  kecamatan: string;
  city: string;
  province: string;
  kabupatenKota?: string;
  provinsi?: string;
  coordinates: { lat: number; lng: number };
  googleMapsEmbedUrl: string;
  landmark: string;
  landmarks?: string;

  // SECTION 3 - DATA TANAH & BLOK
  landAreaTotal: number;
  totalLandArea?: number;
  totalUnits: number;
  blocks: SyncedProjectBlock[];
  certificateType: 'SHM' | 'SHGB' | 'Girik' | 'Lainnya';
  imbNumber: string;
  landStatus: 'Milik Sendiri' | 'Kerjasama' | 'Proses Akuisisi';
  projectStatus?: 'Perencanaan' | 'Pembangunan' | 'Siap Huni' | 'Selesai';

  // SECTION 4 - SPESIFIKASI UNIT STANDAR
  unitType: string;
  landSize: number;
  buildingSize: number;
  lotDimensions: string;
  bedrooms: number;
  bathrooms: number;
  foundationSpec: string;
  wallSpec: string;
  roofSpec: string;
  floorSpec: string;
  ceilingSpec: string;
  waterSpec: string;
  electricitySpec: string;
  unitLandSize?: string;
  extraLand?: string;
  buildingMaterial?: string;

  // SECTION 5 - HARGA & PEMBIAYAAN
  price: number;
  hpp: number;
  bookingFee: number;
  minDp: number;
  dpInfo: string;
  paymentSchemes: string[];
  partnerBanks: string[];
  tenorOptions: number[];
  estimatedInstallment: number;

  // SECTION 6 - PROMO & KEUNGGULAN
  promos: SyncedProjectPromo[];
  promoBonus: string[];
  advantages: string[];
  facilities: string[];

  // SECTION 7 - FOTO & MEDIA
  heroImage: string;
  heroPhotos?: string[];
  galleryPhotos: string[];
  sitePlanImage: string;
  floorplanImage: string;
  brochurePdfUrl?: string;
  videoUrl?: string;

  // SECTION 8 - KONTAK PROYEK
  picMarketing: string;
  picPhone: string;
  marketingAddress: string;
  operationalHours: string;

  // SECTION 9 & 10 - AUTO-GENERATE UNIT & STATUS PUBLIKASI
  autoGenerateUnits: boolean;
  publishStatus: 'Draft' | 'Published' | 'Nonaktif' | 'Unpublished';
  showOnHome: boolean;
  showInCatalog: boolean;
  showInNavbar: boolean;
  showInFooter?: boolean;
  isFeatured: boolean;
  displayOrder?: number;
  previewToken?: string;
  stats?: {
    views: number;
    leads: number;
    bookingsCount: number;
  };
  history?: Array<{
    timestamp: string;
    actor: string;
    action: string;
  }>;
}

export function slugifyProjectName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^perumahan\s+/i, '')
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function generateProjectSlug(name: string, existingSlugs: string[] = []): string {
  const base = slugifyProjectName(name);
  if (!existingSlugs.includes(base)) return base;
  let counter = 2;
  while (existingSlugs.includes(`${base}-${counter}`)) {
    counter++;
  }
  return `${base}-${counter}`;
}

export const INITIAL_SYNCED_PROJECTS: SyncedProjectRecord[] = [
  {
    id: 'PROJ-SYNC-TBL',
    projectName: 'Perumahan Bahagia Land',
    slug: 'bahagia-land',
    companyId: 'PT_TBL',
    companyName: 'PT Tata Bahagia Land',
    tagline: 'Kawasan Hunian Subsidi Terbesar 97 Unit di Jantung Kota Kendari',
    description:
      'Perumahan Bahagia Land dikembangkan oleh PT Tata Bahagia Land di atas lahan seluas 9.028 m² dengan total 97 unit rumah subsidi berkualitas komersil (Blok A, B, C, dan D). Dilengkapi jalan lingkungan lebar, masjid kawasan, taman bermain, dan pengawasan mutu konstruksi oleh PJT independen.',
    projectType: 'Perumahan Subsidi',
    address: 'Jl. Anawai, Kel. Anawai, Kec. Wua-wua',
    kelurahan: 'Anawai',
    kecamatan: 'Wua-wua',
    city: 'Kota Kendari',
    province: 'Sulawesi Tenggara',
    coordinates: { lat: -4.0096, lng: 122.5127 },
    googleMapsEmbedUrl: 'https://maps.google.com/maps?q=-4.0096,122.5127&z=15&output=embed',
    landmark: '5 Menit dari RSUD Kota Kendari & Pasar Baru Wua-wua',
    landAreaTotal: 9028,
    totalUnits: 97,
    blocks: [
      { id: 'b-tbl-a', blockName: 'A', unitCount: 27, startNumber: 'A-01', endNumber: 'A-27', landAreaPerBlock: 2457 },
      { id: 'b-tbl-b', blockName: 'B', unitCount: 27, startNumber: 'B-01', endNumber: 'B-27', landAreaPerBlock: 2457 },
      { id: 'b-tbl-c', blockName: 'C', unitCount: 23, startNumber: 'C-01', endNumber: 'C-23', landAreaPerBlock: 2093 },
      { id: 'b-tbl-d', blockName: 'D', unitCount: 20, startNumber: 'D-01', endNumber: 'D-20', landAreaPerBlock: 2021 },
    ],
    certificateType: 'SHGB',
    imbNumber: 'SK PBG No. 648/112/DPMPTSP-KDI/2025',
    landStatus: 'Milik Sendiri',
    unitType: 'Tipe 36/91',
    landSize: 91,
    buildingSize: 36,
    lotDimensions: '7×13m',
    bedrooms: 2,
    bathrooms: 1,
    foundationSpec: 'Batu Kali / Gunung',
    wallSpec: 'Batako Press Plester Aci Cat Weatherproof',
    roofSpec: 'Rangka Baja Ringan + Spandek Pasir',
    floorSpec: 'Keramik 40×40',
    ceilingSpec: '3.5 Meter (Gypsum Rangka Hollow)',
    waterSpec: 'Sumur Bor / PDAM Jernih',
    electricitySpec: 'PLN 1.300 VA',
    price: 169000000,
    hpp: 125000000,
    bookingFee: 2000000,
    minDp: 1690000,
    dpInfo: 'DP Subsidi 1% (Rp1.690.000) · Bebas Biaya Akad & Notaris',
    paymentSchemes: ['KPR Subsidi (FLPP)', 'Cash Keras', 'Cash Bertahap'],
    partnerBanks: ['Bank BTN', 'Bank BRI', 'Bank Mandiri'],
    tenorOptions: [10, 15, 20],
    estimatedInstallment: 1080000,
    promos: [
      {
        id: 'prm-tbl-1',
        title: 'Bebas Biaya Akad, Notaris & BPHTB',
        description: 'Gratis seluruh biaya balik nama SHGB, akta PPAT, dan administrasi KPR FLPP.',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        badgeText: 'GRATIS BIAYA AKAD',
        isActive: true,
      },
    ],
    promoBonus: ['Gratis Biaya Akad & Notaris', 'Gratis Tandon Air 1.200L', 'Gratis Mesin Pompa Air'],
    advantages: [
      'Kavling Luas 91 m² (7×13m)',
      'Bebas Biaya Administrasi, Akad & Notaris',
      'DP Subsidi 1% (Rp1.690.000)',
      'Terverifikasi Penanggung Jawab Teknis (PJT)',
    ],
    facilities: [
      'Masjid Kawasan Bahagia Land',
      'Taman Bermain & Ruang Terbuka Hijau',
      'Jalan Lingkungan Lebar 7 Meter',
      'Drainase Beton & Jaringan Air Bersih',
      'Pos Keamanan One Gate System',
    ],
    heroImage: ASSETS.bahagiaLand,
    galleryPhotos: [ASSETS.bahagiaLand, ASSETS.sitePlanBahagiaLand, ASSETS.unitInterior, ASSETS.unitFloorplan],
    sitePlanImage: ASSETS.sitePlanBahagiaLand,
    floorplanImage: ASSETS.unitFloorplan,
    brochurePdfUrl: '',
    videoUrl: '',
    picMarketing: 'Andi Saputra',
    picPhone: '0811-4000-169',
    marketingAddress: 'Jl. Anawai, Kel. Anawai, Kec. Wua-wua, Kota Kendari',
    operationalHours: 'Senin - Minggu (08.00 - 17.00 WITA)',
    autoGenerateUnits: false,
    publishStatus: 'Published',
    showOnHome: true,
    showInCatalog: true,
    showInNavbar: true,
    isFeatured: true,
  },
  {
    id: 'PROJ-SYNC-BPP',
    projectName: 'Perumahan Bahagia Residence',
    slug: 'bahagia-residence',
    companyId: 'PT_BPP',
    companyName: 'PT Bahagia Prima Property',
    tagline: 'Rumah Subsidi Spesifikasi Batu Bata Merah & Plafon Tinggi 4 Meter',
    description:
      'Perumahan Bahagia Residence di Ranomeeto (Kab. Konawe Selatan) menghadirkan 22 unit eksklusif dengan dinding batu bata merah penuh dan plafon setinggi 4 meter yang sejuk, hanya 5 menit dari Bandara Haluoleo.',
    projectType: 'Perumahan Subsidi',
    address: 'Jl. Gersamata, Kec. Ranomeeto',
    kelurahan: 'Ranomeeto',
    kecamatan: 'Ranomeeto',
    city: 'Kab. Konawe Selatan',
    province: 'Sulawesi Tenggara',
    coordinates: { lat: -4.0652, lng: 122.4451 },
    googleMapsEmbedUrl: 'https://maps.google.com/maps?q=-4.0652,122.4451&z=15&output=embed',
    landmark: '5 Menit dari Bandara Haluoleo & Perbatasan Kota Kendari',
    landAreaTotal: 3250,
    totalUnits: 22,
    blocks: [
      { id: 'b-bpp-a', blockName: 'A', unitCount: 22, startNumber: 'A-01', endNumber: 'A-22', landAreaPerBlock: 3250 },
    ],
    certificateType: 'SHGB',
    imbNumber: 'SK PBG No. 503/088/DPMPTSP-KONSEL/2025',
    landStatus: 'Milik Sendiri',
    unitType: 'Tipe 36/91',
    landSize: 91,
    buildingSize: 36,
    lotDimensions: '7×13m',
    bedrooms: 2,
    bathrooms: 1,
    foundationSpec: 'Batu Gunung / Batu Kali',
    wallSpec: 'Batu Bata Merah Penuh Plester Aci',
    roofSpec: 'Rangka Baja Ringan + Spandek Pasir',
    floorSpec: 'Keramik 40×40 Putih Polos',
    ceilingSpec: '4 Meter (Gypsum Rangka Hollow)',
    waterSpec: 'Sumur Bor Jernih per Klaster',
    electricitySpec: 'PLN 1.300 VA',
    price: 169000000,
    hpp: 125000000,
    bookingFee: 2000000,
    minDp: 1000000,
    dpInfo: 'DP Cukup Rp1.000.000 All-In · Spesifikasi Bata Merah',
    paymentSchemes: ['KPR Subsidi (FLPP)', 'Cash Keras', 'Cash Bertahap'],
    partnerBanks: ['Bank BTN', 'Bank BRI', 'Bank Mandiri'],
    tenorOptions: [10, 15, 20],
    estimatedInstallment: 1050000,
    promos: [
      {
        id: 'prm-bpp-1',
        title: 'Promo DP Rp1 Juta All-In & Free Materai',
        description: 'Cukup bayar DP Rp1.000.000 sampai terima kunci tanpa biaya tambahan.',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        badgeText: 'DP RP1 JUTA ALL-IN',
        isActive: true,
      },
    ],
    promoBonus: ['DP Rp1 Juta All-In', 'Batu Bata Merah Penuh', 'Plafon Tinggi 4 Meter'],
    advantages: [
      'Batu Bata Merah Penuh (Kokoh & Sejuk)',
      'Plafon Tinggi 4 Meter Sirkulasi Udara Maksimal',
      'DP Cukup Rp1.000.000 All-In',
      'Dekat Bandara Haluoleo Kendari',
    ],
    facilities: [
      'Taman Kawasan Hijau',
      'Jalan Lingkungan Lebar 7 Meter',
      'Sumur Bor Bersih per Klaster',
      'Gerbang Utama Eksklusif',
    ],
    heroImage: ASSETS.bahagiaResidence,
    galleryPhotos: [ASSETS.bahagiaResidence, ASSETS.sitePlanBahagiaResidence, ASSETS.unitInterior, ASSETS.unitFloorplan],
    sitePlanImage: ASSETS.sitePlanBahagiaResidence,
    floorplanImage: ASSETS.unitFloorplan,
    brochurePdfUrl: '',
    videoUrl: '',
    picMarketing: 'Fajar Ramadhan',
    picPhone: '0812-4555-0169',
    marketingAddress: 'Jl. Gersamata, Kec. Ranomeeto, Kab. Konawe Selatan',
    operationalHours: 'Senin - Minggu (08.00 - 17.00 WITA)',
    autoGenerateUnits: false,
    publishStatus: 'Published',
    showOnHome: true,
    showInCatalog: true,
    showInNavbar: true,
    isFeatured: false,
  },
];

