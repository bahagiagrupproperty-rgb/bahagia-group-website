import { ASSETS } from './seedData';

// =========================================================================
// 1. TESTIMONI KONSUMEN TYPES & SETTINGS
// =========================================================================
export interface PublicTestimonialRecord {
  id: string;
  consumerName: string;
  unitBlock: string; // e.g., "A-05"
  projectName: 'Bahagia Land' | 'Bahagia Residence' | string;
  photoUrl: string;
  testimonialText: string; // max 500 chars
  rating: number; // 1 - 5
  date: string; // YYYY-MM-DD
  status: 'Aktif' | 'Nonaktif';
  isFeatured: boolean;
  order: number;
  createdAt?: string;
}

export interface TestimonialSectionSettings {
  showOnHomepage: boolean;
  maxDisplayCount: 3 | 6 | 9;
  autoSlideSeconds: number;
  orderMode: 'TERBARU' | 'RATING_TERTINGGI' | 'MANUAL';
}

// =========================================================================
// 2. GALERI PEMBANGUNAN & PROGRESS FISIK TYPES & SETTINGS
// =========================================================================
export type GalleryPhotoCategory =
  | 'Pembangunan Unit'
  | 'Fasum & Jalan'
  | 'Serah Terima Kunci'
  | 'Tampak Depan'
  | string;

export interface GalleryProgressPhotoRecord {
  id: string;
  title: string;
  category: GalleryPhotoCategory;
  projectName: 'Bahagia Land' | 'Bahagia Residence' | string;
  unitBlock?: string;
  photoUrl: string; // atau array jika multi-upload, direpresentasikan per item galeri
  dateTaken: string; // YYYY-MM-DD
  description: string;
  status: 'Aktif' | 'Nonaktif';
  isFeaturedOnHome: boolean;
  order: number;
  createdAt?: string;
}

export interface PhysicalProgressStageItem {
  id: string;
  label: string; // e.g. "Pondasi & Struktur", "Dinding & Atap", "Finishing", "Jalan & Drainase", "Taman & Fasum"
  percentage: number; // 0 - 100
}

export interface ProjectPhysicalProgressRecord {
  id: string;
  projectId: string;
  projectName: 'Bahagia Land' | 'Bahagia Residence' | string;
  overallPercentage: number; // 0 - 100
  stages: PhysicalProgressStageItem[];
  updatedAt: string;
}

export interface GallerySectionSettings {
  showGallerySection: boolean;
  showProgressSection: boolean;
  maxPhotosHomepage: 6 | 9 | 12;
  customCategories: string[];
}

// =========================================================================
// 3. ARTIKEL & BERITA (BLOG) TYPES & SETTINGS
// =========================================================================
export type BlogArticleCategory =
  | 'Tips KPR'
  | 'Info Proyek'
  | 'Berita Perusahaan'
  | 'Panduan'
  | 'Promo'
  | string;

export interface BlogArticleRecord {
  id: string;
  title: string;
  slug: string;
  category: BlogArticleCategory;
  thumbnailUrl: string;
  excerpt: string; // max 200 karakter
  contentHtml: string; // Rich text / HTML content
  contentImages: string[];
  tags: string[];
  author: string;
  publishDate: string; // YYYY-MM-DD
  status: 'Draft' | 'Published' | 'Scheduled';
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  viewsCount: number;
  order: number;
  createdAt?: string;
}

export interface BlogSectionSettings {
  showOnHomepage: boolean;
  maxArticlesHomepage: 3 | 6;
  customCategories: string[];
}

// =========================================================================
// INITIAL SEED DATA — SECTION 1: 6 TESTIMONI KONSUMEN
// =========================================================================
export const INITIAL_TESTIMONIAL_SETTINGS: TestimonialSectionSettings = {
  showOnHomepage: true,
  maxDisplayCount: 6,
  autoSlideSeconds: 5,
  orderMode: 'MANUAL',
};

export const INITIAL_PUBLIC_TESTIMONIALS: PublicTestimonialRecord[] = [
  {
    id: 'TESTI-001',
    consumerName: 'Budi Santoso',
    unitBlock: 'A-05',
    projectName: 'Bahagia Land',
    photoUrl: ASSETS.unitInterior,
    testimonialText:
      'Rumahnya bagus, lokasi strategis di Jl. Anawai Kota Kendari, dan proses KPR BTN sangat mudah. Sisa tanah belakang 3 meter langsung kami manfaatkan untuk dapur. Terima kasih Bahagia Land!',
    rating: 5,
    date: '2026-10-02',
    status: 'Aktif',
    isFeatured: true,
    order: 1,
    createdAt: '2026-10-02 09:00',
  },
  {
    id: 'TESTI-002',
    consumerName: 'La Ode Abdul Rahman, S.KM.',
    unitBlock: 'A-04',
    projectName: 'Bahagia Land',
    photoUrl: ASSETS.bahagiaLand,
    testimonialText:
      'Sebelum ambil di Perumahan Bahagia Land Blok A-04, kami mengontrak 4 tahun di Wua-wua. Proses KPR FLPP dibantu penuh tanpa biaya notaris maupun administrasi. Kavling 7x13m sangat lega.',
    rating: 5,
    date: '2026-10-03',
    status: 'Aktif',
    isFeatured: true,
    order: 2,
    createdAt: '2026-10-03 10:15',
  },
  {
    id: 'TESTI-003',
    consumerName: 'Hj. Rostina & Keluarga',
    unitBlock: 'A-02',
    projectName: 'Bahagia Residence',
    photoUrl: ASSETS.bahagiaResidence,
    testimonialText:
      'Kami memilih Perumahan Bahagia Residence di Ranomeeto karena menggunakan batu bata merah penuh dan plafon setinggi 4 meter. Siang hari rumah tetap sejuk, dekat Bandara Haluoleo, dan DP hanya Rp1 Juta.',
    rating: 5,
    date: '2026-10-04',
    status: 'Aktif',
    isFeatured: true,
    order: 3,
    createdAt: '2026-10-04 14:20',
  },
  {
    id: 'TESTI-004',
    consumerName: 'Wa Ode Siti Nurhaliza, S.Pd.',
    unitBlock: 'B-11',
    projectName: 'Bahagia Land',
    photoUrl: ASSETS.heroEstate,
    testimonialText:
      'Sebagai guru ASN di Kendari, angsuran KPR subsidi flat Rp1 jutaan per bulan sangat meringankan. Kualitas bangunan diverifikasi tim teknis PJT sehingga saat serah terima kunci semuanya rapi.',
    rating: 5,
    date: '2026-10-05',
    status: 'Aktif',
    isFeatured: false,
    order: 4,
    createdAt: '2026-10-05 11:30',
  },
  {
    id: 'TESTI-005',
    consumerName: 'Muh. Fajrin Pratama',
    unitBlock: 'C-08',
    projectName: 'Bahagia Land',
    photoUrl: ASSETS.unitFloorplan,
    testimonialText:
      'Jalan lingkungan lebar, drainase tertata rapi, dan ada bonus tandon air serta kanopi. Tim marketing sangat responsif membantu dari pemberkasan sampai akad kredit selesai.',
    rating: 5,
    date: '2026-10-06',
    status: 'Aktif',
    isFeatured: false,
    order: 5,
    createdAt: '2026-10-06 16:00',
  },
  {
    id: 'TESTI-006',
    consumerName: 'Andi Hendra Wijaya',
    unitBlock: 'A-09',
    projectName: 'Bahagia Residence',
    photoUrl: ASSETS.unitInterior,
    testimonialText:
      'Kualitas dinding batu bata merah di Bahagia Residence benar-benar kokoh seperti rumah komersil. Lingkungan tenang dan hanya 5 menit ke Bandara Haluoleo.',
    rating: 4,
    date: '2026-10-08',
    status: 'Aktif',
    isFeatured: false,
    order: 6,
    createdAt: '2026-10-08 08:45',
  },
];

// =========================================================================
// INITIAL SEED DATA — SECTION 2: GALERI & PROGRESS FISIK
// =========================================================================
export const INITIAL_GALLERY_SETTINGS: GallerySectionSettings = {
  showGallerySection: true,
  showProgressSection: true,
  maxPhotosHomepage: 9,
  customCategories: [
    'Pembangunan Unit',
    'Fasum & Jalan',
    'Serah Terima Kunci',
    'Tampak Depan',
  ],
};

export const INITIAL_PROJECT_PHYSICAL_PROGRESS: ProjectPhysicalProgressRecord[] = [
  {
    id: 'PROG-TBL',
    projectId: 'PROJ-SYNC-TBL',
    projectName: 'Bahagia Land',
    overallPercentage: 75,
    updatedAt: '2026-10-10 08:00',
    stages: [
      { id: 'st-tbl-1', label: 'Pondasi & Struktur', percentage: 90 },
      { id: 'st-tbl-2', label: 'Dinding & Atap', percentage: 80 },
      { id: 'st-tbl-3', label: 'Finishing', percentage: 60 },
      { id: 'st-tbl-4', label: 'Jalan & Drainase', percentage: 70 },
      { id: 'st-tbl-5', label: 'Taman & Fasum', percentage: 50 },
    ],
  },
  {
    id: 'PROG-BPP',
    projectId: 'PROJ-SYNC-BPP',
    projectName: 'Bahagia Residence',
    overallPercentage: 60,
    updatedAt: '2026-10-10 08:00',
    stages: [
      { id: 'st-bpp-1', label: 'Pondasi & Struktur', percentage: 85 },
      { id: 'st-bpp-2', label: 'Dinding & Atap', percentage: 70 },
      { id: 'st-bpp-3', label: 'Finishing', percentage: 55 },
      { id: 'st-bpp-4', label: 'Jalan & Drainase', percentage: 50 },
      { id: 'st-bpp-5', label: 'Taman & Fasum', percentage: 40 },
    ],
  },
];

export const INITIAL_GALLERY_PHOTOS: GalleryProgressPhotoRecord[] = [
  {
    id: 'GAL-001',
    title: 'Tampak Depan Deretan Unit Blok A Siap Huni',
    category: 'Tampak Depan',
    projectName: 'Bahagia Land',
    unitBlock: 'Blok A (A-01 s/d A-10)',
    photoUrl: ASSETS.bahagiaLand,
    dateTaken: '2026-10-08',
    description:
      'Deretan rumah subsidi tipe 36/91 (7x13m) di Blok A Perumahan Bahagia Land Kota Kendari yang telah selesai pengecatan fasad dan siap serah terima kunci.',
    status: 'Aktif',
    isFeaturedOnHome: true,
    order: 1,
    createdAt: '2026-10-08 09:00',
  },
  {
    id: 'GAL-002',
    title: 'Konstruksi Dinding Batu Bata Merah & Plafon 4 Meter',
    category: 'Pembangunan Unit',
    projectName: 'Bahagia Residence',
    unitBlock: 'Blok A (A-01 s/d A-22)',
    photoUrl: ASSETS.bahagiaResidence,
    dateTaken: '2026-10-07',
    description:
      'Pekerjaan pasangan dinding batu bata merah penuh dan pemasangan rangka atap baja ringan pada unit Bahagia Residence di Ranomeeto, Konawe Selatan.',
    status: 'Aktif',
    isFeaturedOnHome: true,
    order: 2,
    createdAt: '2026-10-07 14:15',
  },
  {
    id: 'GAL-003',
    title: 'Serah Terima Kunci & BAST Penghuni Kavling A-04',
    category: 'Serah Terima Kunci',
    projectName: 'Bahagia Land',
    unitBlock: 'A-04',
    photoUrl: ASSETS.unitInterior,
    dateTaken: '2026-10-06',
    description:
      'Momen serah terima kunci resmi setelah verifikasi 11 checklist teknis oleh Penanggung Jawab Teknis (PJT) dan akad KPR Bank BTN.',
    status: 'Aktif',
    isFeaturedOnHome: true,
    order: 3,
    createdAt: '2026-10-06 11:00',
  },
  {
    id: 'GAL-004',
    title: 'Perkerasan Jalan Utama Kawasan & Saluran Drainase',
    category: 'Fasum & Jalan',
    projectName: 'Bahagia Land',
    unitBlock: 'Koridor Utama Blok A - B',
    photoUrl: ASSETS.heroEstate,
    dateTaken: '2026-10-05',
    description:
      'Pembangunan jalan lingkungan lebar 7 meter beserta saluran drainase beton keliling dan area Ruang Terbuka Hijau (RTH) di Perumahan Bahagia Land.',
    status: 'Aktif',
    isFeaturedOnHome: true,
    order: 4,
    createdAt: '2026-10-05 16:30',
  },
  {
    id: 'GAL-005',
    title: 'Finishing Interior Keramik 40x40 & Sanitair Unit',
    category: 'Pembangunan Unit',
    projectName: 'Bahagia Land',
    unitBlock: 'Blok B-05',
    photoUrl: ASSETS.unitInterior,
    dateTaken: '2026-10-04',
    description:
      'Pemasangan keramik lantai 40x40 cm, kusen jendela pencahayaan alami, dan instalasi listrik 1.300 VA pada unit Blok B.',
    status: 'Aktif',
    isFeaturedOnHome: true,
    order: 5,
    createdAt: '2026-10-04 10:20',
  },
  {
    id: 'GAL-006',
    title: 'Tampak Fasad Modern Minimalis Bahagia Residence',
    category: 'Tampak Depan',
    projectName: 'Bahagia Residence',
    unitBlock: 'A-01 & A-02',
    photoUrl: ASSETS.bahagiaResidence,
    dateTaken: '2026-10-03',
    description:
      'Fasad modern tropis dengan plafon setinggi 4 meter yang memberikan sirkulasi udara sejuk sepanjang hari di kawasan Ranomeeto.',
    status: 'Aktif',
    isFeaturedOnHome: true,
    order: 6,
    createdAt: '2026-10-03 13:45',
  },
  {
    id: 'GAL-007',
    title: 'Penataan Taman Hijau & Gerbang Kawasan',
    category: 'Fasum & Jalan',
    projectName: 'Bahagia Residence',
    unitBlock: 'Area Gerbang & RTH',
    photoUrl: ASSETS.heroEstate,
    dateTaken: '2026-10-02',
    description:
      'Pengerjaan taman kawasan, lampu penerangan jalan umum (PJU), dan drainase utama di Perumahan Bahagia Residence.',
    status: 'Aktif',
    isFeaturedOnHome: true,
    order: 7,
    createdAt: '2026-10-02 15:10',
  },
  {
    id: 'GAL-008',
    title: 'Inspeksi Bersama & Serah Terima Kunci Blok A-02',
    category: 'Serah Terima Kunci',
    projectName: 'Bahagia Residence',
    unitBlock: 'A-02',
    photoUrl: ASSETS.bahagiaLand,
    dateTaken: '2026-10-01',
    description:
      'Pengecekan fungsi air bersih, instalasi listrik, dan kunci pintu bersama konsumen sebelum penandatanganan Berita Acara Serah Terima (BAST).',
    status: 'Aktif',
    isFeaturedOnHome: true,
    order: 8,
    createdAt: '2026-10-01 09:30',
  },
  {
    id: 'GAL-009',
    title: 'Denah & Pengukuran Kavling 7x13 Meter (91 m²)',
    category: 'Pembangunan Unit',
    projectName: 'Bahagia Land',
    unitBlock: 'Blok C & D',
    photoUrl: ASSETS.unitFloorplan,
    dateTaken: '2026-09-29',
    description:
      'Verifikasi patok batas kavling 7x13 meter (luas tanah 91 m²) dengan sisa tanah belakang 3 meter untuk pengembangan masa depan.',
    status: 'Aktif',
    isFeaturedOnHome: true,
    order: 9,
    createdAt: '2026-09-29 14:00',
  },
];

// =========================================================================
// INITIAL SEED DATA — SECTION 3: ARTIKEL & BERITA (BLOG)
// =========================================================================
export const INITIAL_BLOG_SETTINGS: BlogSectionSettings = {
  showOnHomepage: true,
  maxArticlesHomepage: 3,
  customCategories: [
    'Tips KPR',
    'Info Proyek',
    'Berita Perusahaan',
    'Panduan',
    'Promo',
  ],
};

export const INITIAL_BLOG_ARTICLES: BlogArticleRecord[] = [
  {
    id: 'BLOG-001',
    title: '5 Tips Lolos KPR Subsidi dengan Mudah',
    slug: '5-tips-lolos-kpr-subsidi-dengan-mudah',
    category: 'Tips KPR',
    thumbnailUrl: ASSETS.unitInterior,
    excerpt:
      'Panduan lengkap menyiapkan berkas KPR Subsidi FLPP di Bank BTN, BRI, dan Mandiri agar pengajuan rumah pertama Anda langsung disetujui tanpa kendala SLIK OJK.',
    contentHtml: `<p>Memiliki rumah sendiri melalui program <strong>KPR Subsidi FLPP (Fasilitas Likuiditas Pembiayaan Perumahan)</strong> adalah langkah cerdas bagi keluarga muda maupun ASN/karyawan swasta di Kota Kendari dan Konawe Selatan. Dengan harga resmi <strong>Rp169.000.000</strong> dan bunga tetap (flat) <strong>5% per tahun</strong> hingga lunas, angsuran bulanan menjadi sangat terjangkau di kisaran Rp1 jutaan.</p>
<h3>1. Pastikan Riwayat SLIK OJK (BI Checking) Bersih</h3>
<p>Sebelum mengajukan permohonan KPR di Bank BTN, BRI, atau Mandiri, pastikan Anda dan pasangan tidak memiliki tunggakan cicilan kendaraan, kartu kredit, maupun pinjaman daring/paylater. Riwayat kredit yang lancar (Kol 1) mempercepat persetujuan analis bank.</p>
<h3>2. Siapkan Dokumen Kependudukan & Pekerjaan Sejak Awal</h3>
<ul>
  <li>KTP Elektronik (Pemohon & Pasangan bagi yang sudah menikah)</li>
  <li>Kartu Keluarga (KK), Buku Nikah/Surat Keterangan Belum Menikah, dan NPWP</li>
  <li>SK Pengangkatan / Surat Keterangan Kerja minimal 1 tahun</li>
  <li>Slip Gaji 3 bulan terakhir dan Rekening Koran Gaji 3 bulan terakhir</li>
</ul>
<h3>3. Jaga Rasio Kemampuan Bayar (Debt Burden Ratio)</h3>
<p>Bank pelaksana KPR FLPP umumnya mensyaratkan besaran angsuran KPR maksimal 30%–35% dari total penghasilan bersih bulanan rumah tangga. Tim Marketing Bahagia Group siap membantu menghitung simulasi tenor 10, 15, atau 20 tahun yang paling pas untuk Anda.</p>
<h3>4. Pilih Pengembang Resmi Terdaftar di SiKumbang PUPR</h3>
<p>Pastikan perumahan yang Anda pilih dikembangkan oleh badan hukum resmi seperti <strong>PT Tata Bahagia Land (Perumahan Bahagia Land)</strong> dan <strong>PT Bahagia Prima Property (Perumahan Bahagia Residence)</strong> yang seluruh unitnya diverifikasi oleh Penanggung Jawab Teknis (PJT) bersertifikat.</p>
<h3>5. Manfaatkan Promo Bebas Biaya Akad & DP Ringan</h3>
<p>Di Bahagia Group Property, konsumen mendapatkan kemudahan DP mulai 1% serta bebas biaya administrasi, notaris, dan BPHTB sesuai program promo aktif sehingga Anda tidak perlu menyiapkan dana cadangan yang besar saat akad kredit.</p>`,
    contentImages: [ASSETS.unitInterior, ASSETS.unitFloorplan],
    tags: ['KPR Subsidi', 'FLPP', 'Bank BTN', 'Tips Rumah Pertama', 'Kendari'],
    author: 'Tim KPR Bahagia Group',
    publishDate: '2026-10-10',
    status: 'Published',
    isFeatured: true,
    metaTitle: '5 Tips Lolos KPR Subsidi FLPP dengan Mudah — Bahagia Group Property',
    metaDescription:
      'Pelajari 5 langkah praktis agar pengajuan KPR Subsidi FLPP di Bank BTN, BRI, dan Mandiri disetujui cepat untuk Perumahan Bahagia Land & Bahagia Residence.',
    viewsCount: 342,
    order: 1,
    createdAt: '2026-10-10 08:30',
  },
  {
    id: 'BLOG-002',
    title: 'Update Progress Pembangunan Bahagia Land Oktober 2026',
    slug: 'update-progress-pembangunan-bahagia-land-oktober-2026',
    category: 'Info Proyek',
    thumbnailUrl: ASSETS.bahagiaLand,
    excerpt:
      'Progress fisik kawasan Perumahan Bahagia Land di Jl. Anawai Kota Kendari telah mencapai 75%. Blok A dan B memasuki tahap finishing akhir serta perkerasan jalan utama.',
    contentHtml: `<p>Kabar gembira bagi seluruh calon penghuni dan konsumen yang telah melakukan pemesanan kavling di <strong>Perumahan Bahagia Land (PT Tata Bahagia Land)</strong>, Jl. Anawai, Kel. Anawai, Kec. Wua-wua, Kota Kendari. Hingga pekan kedua <strong>Oktober 2026</strong>, rata-rata capaian pembangunan fisik kawasan telah menyentuh angka <strong>75%</strong>.</p>
<h3>Rincian Capaian Fisik per Tahapan Pekerjaan</h3>
<ul>
  <li><strong>Pondasi & Struktur Beton Bertulang (90%):</strong> Seluruh 97 titik kavling di Blok A, B, C, dan D telah menyelesaikan pekerjaan pondasi batu kali dan sloof beton.</li>
  <li><strong>Pasangan Dinding & Rangka Atap (80%):</strong> Pemasangan rangka baja ringan dan atap berwarna merah marun/biru sesuai blok berjalan tepat jadwal.</li>
  <li><strong>Pekerjaan Finishing & Sanitair (60%):</strong> Pemasangan keramik 40x40 cm, pengecatan dinding, serta instalasi listrik 1.300 VA pada unit Blok A dan B sedang berlangsung intensif.</li>
  <li><strong>Jalan Lingkungan & Drainase Kawasan (70%):</strong> Saluran drainase beton dan perkerasan jalan akses utama kawasan telah terhubung penuh.</li>
</ul>
<h3>Verifikasi Ketat oleh Penanggung Jawab Teknis (PJT)</h3>
<p>Setiap unit yang selesai dibangun wajib melewati 11 daftar periksa (checklist) teknis oleh PJT independen sebelum diterbitkan Berita Acara Serah Terima (BAST) kepada konsumen. Anda juga dapat memantau ketersediaan kavling secara langsung melalui fitur <strong>Site Plan Interaktif</strong> di website resmi kami.</p>`,
    contentImages: [ASSETS.bahagiaLand, ASSETS.heroEstate],
    tags: ['Bahagia Land', 'Progress Konstruksi', 'Kendari', 'Site Plan 97 Unit'],
    author: 'Ir. Hendra Wijaya, S.T. (PJT)',
    publishDate: '2026-10-08',
    status: 'Published',
    isFeatured: true,
    metaTitle: 'Update Progress Pembangunan Bahagia Land Oktober 2026 — PT Tata Bahagia Land',
    metaDescription:
      'Laporan resmi progress fisik Perumahan Bahagia Land Kendari bulan Oktober 2026 mencapai 75% meliputi struktur, atap, finishing, dan jalan kawasan.',
    viewsCount: 289,
    order: 2,
    createdAt: '2026-10-08 14:00',
  },
  {
    id: 'BLOG-003',
    title: 'Promo Spesial Akhir Tahun: Gratis Biaya Akad & Bonus Kanopi',
    slug: 'promo-spesial-akhir-tahun-gratis-biaya-akad-dan-bonus-kanopi',
    category: 'Promo',
    thumbnailUrl: ASSETS.bahagiaResidence,
    excerpt:
      'Dapatkan promo akhir tahun khusus pemesanan unit di Bahagia Land & Bahagia Residence: Bebas Biaya Akad, Notaris, BPHTB, serta gratis Kanopi dan Tandon Air 1.200L.',
    contentHtml: `<p>Menyambut kuartal akhir tahun 2026, <strong>Bahagia Group Property</strong> menghadirkan program apresiasi khusus bagi masyarakat Sulawesi Tenggara yang ingin mewujudkan impian memiliki rumah pertama tanpa beban biaya tambahan di awal.</p>
<h3>Keuntungan Promo Spesial Akhir Tahun 2026</h3>
<ul>
  <li><strong>Gratis Biaya Akad Kredit & Administrasi KPR:</strong> Seluruh biaya proses akad di Bank BTN, BRI, dan Mandiri ditanggung oleh pengembang.</li>
  <li><strong>Bebas Biaya Notaris/PPAT, AJB, Balik Nama SHM & BPHTB:</strong> Konsumen terima beres hingga sertifikat terdaftar atas nama pembeli.</li>
  <li><strong>Bonus Langsung Kanopi Depan & Tandon Air 1.200 Liter:</strong> Rumah langsung siap dihuni tanpa perlu renovasi atap teras depan.</li>
  <li><strong>Uang Muka (DP) Super Ringan:</strong> Mulai dari Rp1.000.000 di Perumahan Bahagia Residence (Ranomeeto) dan DP 1% di Perumahan Bahagia Land (Kota Kendari).</li>
</ul>
<h3>Cara Mengunci Unit Promo Secara Online</h3>
<p>Kuota unit promo terbatas untuk kavling pilihan yang masih berstatus <em>Tersedia</em>. Anda dapat memilih posisi kavling langsung pada <strong>Peta Site Plan Interaktif</strong> di halaman utama, lalu mengisi formulir Booking Online untuk menerbitkan kode resmi <code>BKG-2026-XXXX</code>.</p>`,
    contentImages: [ASSETS.bahagiaResidence],
    tags: ['Promo Akhir Tahun', 'Gratis Biaya Akad', 'Bonus Kanopi', 'Bahagia Residence'],
    author: 'Manajemen Marketing Bahagia Group',
    publishDate: '2026-10-05',
    status: 'Published',
    isFeatured: true,
    metaTitle: 'Promo Spesial Akhir Tahun: Gratis Biaya Akad & Bonus Kanopi — Bahagia Group',
    metaDescription:
      'Nikmati promo bebas biaya akad, notaris, BPHTB, serta bonus kanopi dan tandon air untuk pembelian unit di Bahagia Land dan Bahagia Residence.',
    viewsCount: 415,
    order: 3,
    createdAt: '2026-10-05 10:00',
  },
  {
    id: 'BLOG-004',
    title: 'Keunggulan Rumah Dinding Batu Bata Merah & Plafon 4 Meter di Iklim Tropis',
    slug: 'keunggulan-rumah-dinding-batu-bata-merah-dan-plafon-4-meter',
    category: 'Panduan',
    thumbnailUrl: ASSETS.heroEstate,
    excerpt:
      'Mengapa spesifikasi batu bata merah penuh dan plafon tinggi 4 meter di Perumahan Bahagia Residence membuat suhu ruangan jauh lebih sejuk dan tahan puluhan tahun?',
    contentHtml: `<p>Saat memilih rumah tinggal di wilayah beriklim tropis seperti Sulawesi Tenggara, material dinding dan ketinggian plafon menentukan kenyamanan jangka panjang keluarga Anda. Di <strong>Perumahan Bahagia Residence (PT Bahagia Prima Property)</strong>, kami menerapkan standar konstruksi komersil pada rumah subsidi.</p>
<h3>1. Isolasi Termal Alami dari Batu Bata Merah</h3>
<p>Dinding batu bata merah tanah liat yang dibakar sempurna memiliki daya serap panas yang rendah. Siang hari suhu di dalam kamar tetap sejuk, serta kedap suara dari kebisingan luar.</p>
<h3>2. Plafon Setinggi 4 Meter untuk Sirkulasi Udara Maksimal</h3>
<p>Udara panas secara alami bergerak ke atas. Dengan plafon setinggi 4 meter (lebih tinggi dibanding standar 2,8–3 meter), ruang keluarga terasa jauh lebih lapang, terang, dan hemat penggunaan pendingin ruangan (AC).</p>`,
    contentImages: [ASSETS.heroEstate, ASSETS.bahagiaResidence],
    tags: ['Batu Bata Merah', 'Plafon 4 Meter', 'Bahagia Residence', 'Ranomeeto'],
    author: 'Tim Arsitek & Teknis Bahagia Group',
    publishDate: '2026-10-01',
    status: 'Published',
    isFeatured: false,
    metaTitle: 'Keunggulan Rumah Batu Bata Merah & Plafon 4 Meter — Bahagia Residence',
    metaDescription:
      'Ketahui manfaat konstruksi dinding batu bata merah penuh dan plafon tinggi 4 meter pada Perumahan Bahagia Residence Ranomeeto.',
    viewsCount: 198,
    order: 4,
    createdAt: '2026-10-01 09:00',
  },
];

export function generateArticleSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 80) || `artikel-${Date.now()}`
  );
}
