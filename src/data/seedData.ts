import heroEstateImg from '../assets/images/hero_bahagia_group_estate_1791437896598.jpg';
import projectBahagiaLandImg from '../assets/images/project_bahagia_land_1791437910906.jpg';
import projectBahagiaResidenceImg from '../assets/images/project_bahagia_residence_1791437924820.jpg';
import unitInteriorImg from '../assets/images/unit_interior_living_1791437937833.jpg';
import unitFloorplanImg from '../assets/images/unit_floorplan_36_91_1791437949377.jpg';
import sitePlanBahagiaLandImg from '../assets/images/bahagia land.png';
import sitePlanBahagiaResidenceImg from '../assets/images/bahagia residence.png';

export const DUMMY_LOGO_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none"><rect width="120" height="120" rx="24" fill="#059669"/><path d="M26 62L60 32L94 62V92C94 95.3137 91.3137 98 88 98H32C28.6863 98 26 95.3137 26 92V62Z" fill="#10B981" stroke="white" stroke-width="5" stroke-linejoin="round"/><path d="M46 98V68H74V98" fill="#047857" stroke="white" stroke-width="4" stroke-linejoin="round"/><text x="60" y="59" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="800" font-size="16">LOGO</text></svg>'
)}`;

export const ASSETS = {
  logoUrl: DUMMY_LOGO_DATA_URL,
  heroEstate: heroEstateImg,
  bahagiaLand: projectBahagiaLandImg,
  bahagiaResidence: projectBahagiaResidenceImg,
  unitInterior: unitInteriorImg,
  unitFloorplan: unitFloorplanImg,
  sitePlanBahagiaLand: sitePlanBahagiaLandImg,
  sitePlanBahagiaResidence: sitePlanBahagiaResidenceImg,
  placeholder: 'https://placehold.co/800x600/F3F4F6/9CA3AF?text=Foto',
};

export type RoleCode =
  | 'DIREKTUR'
  | 'ADMIN'
  | 'KEUANGAN'
  | 'HRD'
  | 'MARKETING'
  | 'LOGISTIK'
  | 'PENGAWAS'
  | 'PJT'
  | 'USER';

export interface SeedUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: RoleCode;
  roles: RoleCode[];
  companyId: 'GROUP' | 'PT_TBL' | 'PT_BPP' | 'PUBLIC';
  companyName: string;
  active: boolean;
  twoFactorEnabled?: boolean;
}

export const SEED_USERS: SeedUser[] = [
  // DEFAULT TESTING ACCOUNTS (SESUAI PERMINTAAN)
  {
    id: 'usr-superadmin-bahagia',
    name: 'Super Admin Bahagia Group',
    email: 'superadmin@bahagia.com',
    password: 'Password123!',
    role: 'ADMIN',
    roles: ['ADMIN', 'DIREKTUR'],
    companyId: 'GROUP',
    companyName: 'BAHAGIA GROUP PROPERTY',
    active: true,
    twoFactorEnabled: true,
  },
  {
    id: 'usr-admingroup-bahagia',
    name: 'Direktur & Admin Group Bahagia',
    email: 'admin.group@bahagia.com',
    password: 'Password123!',
    role: 'DIREKTUR',
    roles: ['DIREKTUR', 'ADMIN'],
    companyId: 'GROUP',
    companyName: 'BAHAGIA GROUP PROPERTY',
    active: true,
  },
  {
    id: 'usr-marketing-bahagia',
    name: 'Marketing Executive Bahagia',
    email: 'marketing@bahagia.com',
    password: 'Password123!',
    role: 'MARKETING',
    roles: ['MARKETING'],
    companyId: 'PT_TBL',
    companyName: 'PT TATA BAHAGIA LAND',
    active: true,
  },
  // LEVEL GRUP
  {
    id: 'usr-direktur',
    name: 'Ir. H. Ahmad Bahagia, M.M.',
    email: 'direktur@bahagiagroup.com',
    password: 'direktur123',
    role: 'DIREKTUR',
    roles: ['DIREKTUR'],
    companyId: 'GROUP',
    companyName: 'BAHAGIA GROUP PROPERTY',
    active: true,
  },
  {
    id: 'usr-admin',
    name: 'Rizky Pratama (Super Admin)',
    email: 'admin@bahagiagroup.com',
    password: 'admin123',
    role: 'ADMIN',
    roles: ['ADMIN', 'DIREKTUR'],
    companyId: 'GROUP',
    companyName: 'BAHAGIA GROUP PROPERTY',
    active: true,
    twoFactorEnabled: true,
  },
  // PT TATA BAHAGIA LAND
  {
    id: 'usr-keu-tbl',
    name: 'Siti Rahmawati, S.E.',
    email: 'keuangan@bahagialand.com',
    password: 'keuangan123',
    role: 'KEUANGAN',
    roles: ['KEUANGAN'],
    companyId: 'PT_TBL',
    companyName: 'PT TATA BAHAGIA LAND',
    active: true,
  },
  {
    id: 'usr-hrd-tbl',
    name: 'Dewi Sartika, S.Psi.',
    email: 'hrd@bahagialand.com',
    password: 'hrd123',
    role: 'HRD',
    roles: ['HRD'],
    companyId: 'PT_TBL',
    companyName: 'PT TATA BAHAGIA LAND',
    active: true,
  },
  {
    id: 'usr-mkt-tbl',
    name: 'Andi Saputra',
    email: 'marketing@bahagialand.com',
    password: 'marketing123',
    role: 'MARKETING',
    roles: ['MARKETING'],
    companyId: 'PT_TBL',
    companyName: 'PT TATA BAHAGIA LAND',
    active: true,
  },
  {
    id: 'usr-log-tbl',
    name: 'Hendra Wijaya',
    email: 'logistik@bahagialand.com',
    password: 'logistik123',
    role: 'LOGISTIK',
    roles: ['LOGISTIK'],
    companyId: 'PT_TBL',
    companyName: 'PT TATA BAHAGIA LAND',
    active: true,
  },
  {
    id: 'usr-pgw-tbl',
    name: 'Budi Santoso, S.T.',
    email: 'pengawas@bahagialand.com',
    password: 'pengawas123',
    role: 'PENGAWAS',
    roles: ['PENGAWAS'],
    companyId: 'PT_TBL',
    companyName: 'PT TATA BAHAGIA LAND',
    active: true,
  },
  {
    id: 'usr-pjt-tbl',
    name: 'Ir. Lukman Hakim, S.T., IPM',
    email: 'pjt@bahagialand.com',
    password: 'pjt123',
    role: 'PJT',
    roles: ['PJT'],
    companyId: 'PT_TBL',
    companyName: 'PT TATA BAHAGIA LAND',
    active: true,
  },
  // PT BAHAGIA PRIMA PROPERTY
  {
    id: 'usr-keu-bpp',
    name: 'Nadia Putri, S.Ak.',
    email: 'keuangan@bahagiaprima.com',
    password: 'keuangan123',
    role: 'KEUANGAN',
    roles: ['KEUANGAN'],
    companyId: 'PT_BPP',
    companyName: 'PT BAHAGIA PRIMA PROPERTY',
    active: true,
  },
  {
    id: 'usr-hrd-bpp',
    name: 'Ratna Sari, S.H.',
    email: 'hrd@bahagiaprima.com',
    password: 'hrd123',
    role: 'HRD',
    roles: ['HRD'],
    companyId: 'PT_BPP',
    companyName: 'PT BAHAGIA PRIMA PROPERTY',
    active: true,
  },
  {
    id: 'usr-mkt-bpp',
    name: 'Fajar Ramadhan',
    email: 'marketing@bahagiaprima.com',
    password: 'marketing123',
    role: 'MARKETING',
    roles: ['MARKETING'],
    companyId: 'PT_BPP',
    companyName: 'PT BAHAGIA PRIMA PROPERTY',
    active: true,
  },
  {
    id: 'usr-log-bpp',
    name: 'Dedi Kurniawan',
    email: 'logistik@bahagiaprima.com',
    password: 'logistik123',
    role: 'LOGISTIK',
    roles: ['LOGISTIK'],
    companyId: 'PT_BPP',
    companyName: 'PT BAHAGIA PRIMA PROPERTY',
    active: true,
  },
  {
    id: 'usr-pgw-bpp',
    name: 'Agus Setiawan, S.T.',
    email: 'pengawas@bahagiaprima.com',
    password: 'pengawas123',
    role: 'PENGAWAS',
    roles: ['PENGAWAS'],
    companyId: 'PT_BPP',
    companyName: 'PT BAHAGIA PRIMA PROPERTY',
    active: true,
  },
  {
    id: 'usr-pjt-bpp',
    name: 'Ir. Hasanuddin, S.T., M.T.',
    email: 'pjt@bahagiaprima.com',
    password: 'pjt123',
    role: 'PJT',
    roles: ['PJT'],
    companyId: 'PT_BPP',
    companyName: 'PT BAHAGIA PRIMA PROPERTY',
    active: true,
  },
  // USER PUBLIK
  {
    id: 'usr-public',
    name: 'Keluarga Muhammad Ilham',
    email: 'user@test.com',
    password: 'user123',
    role: 'USER',
    roles: ['USER'],
    companyId: 'PUBLIC',
    companyName: 'Konsumen Publik',
    active: true,
  },
];

export interface CompanyInfo {
  id: 'PT_TBL' | 'PT_BPP';
  name: string;
  projectName: string;
  slug: string;
  tagline: string;
  location: string;
  coordinates: { lat: number; lng: number };
  landArea: string;
  totalUnits: number;
  blockBreakdown: string;
  specs: string;
  promoBonus: string[];
  price: number;
  bookingFee: number;
  hppPerUnit: number;
  dpInfo: string;
  banks: string[];
  heroImage: string;
  operationalHours: string;
  legality: string;
  phone: string;
  whatsapp: string;
}

export const INITIAL_COMPANIES: CompanyInfo[] = [
  {
    id: 'PT_TBL',
    name: 'PT TATA BAHAGIA LAND',
    projectName: 'Perumahan Bahagia Land',
    slug: 'bahagia-land',
    tagline: 'Membangun Hunian Bahagia untuk Keluarga Indonesia di Kota Kendari',
    location: 'Jl. Anawai, Kel. Anawai, Kec. Wua-wua, Kota Kendari, Sulawesi Tenggara',
    coordinates: { lat: -4.0096, lng: 122.5127 },
    landArea: '9.028 m²',
    totalUnits: 97,
    blockBreakdown: 'Blok A: 27, Blok B: 27, Blok C: 23, Blok D: 20',
    specs: 'Tipe 36/91 (7×13=91 m²), kelebihan tanah (depan 4m, belakang 3m, samping 1m), 2 Kamar Tidur, 1 Kamar Mandi',
    promoBonus: ['Free Angsuran Pertama', 'Free Materai', 'Free Admin Bank', 'Free Biaya Notaris'],
    price: 169000000,
    bookingFee: 2000000,
    hppPerUnit: 67651710,
    dpInfo: 'DP 1% Subsidi Pemerintah · Angsuran Flat Rp1,05 Juta/bln',
    banks: ['BTN', 'BRI', 'Mandiri'],
    heroImage: ASSETS.bahagiaLand,
    operationalHours: 'Senin – Sabtu: 08.00 – 17.00 WITA | Minggu: 09.00 – 15.00 WITA (Kunjungan Lokasi)',
    legality: 'SHGB Induk Pecah Per Kavling, IMB/PBG Lengkap, NIDI & SLO Resmi, Terdaftar SiKumbang Kementerian PUPR',
    phone: '0401-3128899',
    whatsapp: '628114008899',
  },
  {
    id: 'PT_BPP',
    name: 'PT BAHAGIA PRIMA PROPERTY',
    projectName: 'Perumahan Bahagia Residence',
    slug: 'bahagia-residence',
    tagline: 'Hunian Subsidi Rasa Komersil dengan Plafon Tinggi 4 Meter & Bata Merah',
    location: 'Jl. Gersamata, Ranomeeto, Kab. Konawe Selatan, Sulawesi Tenggara',
    coordinates: { lat: -4.0631, lng: 122.4682 },
    landArea: '3.250 m²',
    totalUnits: 22,
    blockBreakdown: 'Blok A: 22 Unit Eksklusif (A-01 s/d A-22)',
    specs: 'Tipe 36/91 (7×13=91 m²), konstruksi batu bata merah penuh, high ceiling 4m sejuk alami, 2 Kamar Tidur, 1 Kamar Mandi',
    promoBonus: ['Free Biaya Admin', 'Free Biaya Notaris', 'Free Pajak BPHTB', 'Free Balik Nama Sertifikat', 'Free Materai'],
    price: 169000000,
    bookingFee: 2000000,
    hppPerUnit: 67651710,
    dpInfo: 'DP Rp1.000.000 · Biaya Akad Rp4.000.000 Terima Kunci',
    banks: ['BTN', 'BRI', 'Mandiri'],
    heroImage: ASSETS.bahagiaResidence,
    operationalHours: 'Senin – Sabtu: 08.00 – 17.00 WITA | Minggu: 09.00 – 15.00 WITA',
    legality: 'SHGB Pecah Per Kavling, PBG/IMB Terbit, Terdaftar Resmi FLPP Kementerian PUPR',
    phone: '0401-3129900',
    whatsapp: '628114009900',
  },
];

export interface CoaItem {
  code: string;
  name: string;
  category: 'ASET' | 'LIABILITAS' | 'EKUITAS' | 'PENDAPATAN' | 'BEBAN';
  level: 1 | 2 | 3 | 4 | 5;
  normalBalance: 'DEBIT' | 'KREDIT';
  balance: number;
  parentCode?: string;
  active?: boolean;
  description?: string;
}

export const INITIAL_COA: CoaItem[] = [
  // 1-0000 ASET
  { code: '1-0000', name: 'ASET', category: 'ASET', level: 1, normalBalance: 'DEBIT', balance: 18450000000 },
  { code: '1-1000', name: 'KAS DAN SETARA KAS', category: 'ASET', level: 2, normalBalance: 'DEBIT', balance: 3420000000 },
  { code: '1-1100', name: 'Kas', category: 'ASET', level: 3, normalBalance: 'DEBIT', balance: 420000000 },
  { code: '1-1110', name: 'Kas PT SDP', category: 'ASET', level: 4, normalBalance: 'DEBIT', balance: 250000000 },
  { code: '1-1120', name: 'Kas Pak Ahmad', category: 'ASET', level: 4, normalBalance: 'DEBIT', balance: 145000000 },
  { code: '1-1130', name: 'Kas Kecil', category: 'ASET', level: 4, normalBalance: 'DEBIT', balance: 25000000 },
  { code: '1-1200', name: 'Bank', category: 'ASET', level: 3, normalBalance: 'DEBIT', balance: 3000000000 },
  { code: '1-1210', name: 'Bank BTN', category: 'ASET', level: 4, normalBalance: 'DEBIT', balance: 1450000000 },
  { code: '1-1220', name: 'Bank BRI', category: 'ASET', level: 4, normalBalance: 'DEBIT', balance: 780000000 },
  { code: '1-1230', name: 'Bank Mandiri Giro', category: 'ASET', level: 4, normalBalance: 'DEBIT', balance: 420000000 },
  { code: '1-1240', name: 'Bank Mandiri Ops', category: 'ASET', level: 4, normalBalance: 'DEBIT', balance: 210000000 },
  { code: '1-1250', name: 'Bank BNI', category: 'ASET', level: 4, normalBalance: 'DEBIT', balance: 140000000 },
  { code: '1-2000', name: 'PIUTANG USAHA', category: 'ASET', level: 2, normalBalance: 'DEBIT', balance: 1850000000 },
  { code: '1-2100', name: 'Piutang Pihak Berelasi', category: 'ASET', level: 3, normalBalance: 'DEBIT', balance: 200000000 },
  { code: '1-2200', name: 'Piutang User', category: 'ASET', level: 3, normalBalance: 'DEBIT', balance: 640000000 },
  { code: '1-2300', name: 'Piutang Retensi', category: 'ASET', level: 3, normalBalance: 'DEBIT', balance: 520000000 },
  { code: '1-2310', name: 'Piutang Retensi - Unit Baru', category: 'ASET', level: 4, normalBalance: 'DEBIT', balance: 340000000 },
  { code: '1-2320', name: 'Piutang Retensi - Unit Lama', category: 'ASET', level: 4, normalBalance: 'DEBIT', balance: 180000000 },
  { code: '1-2400', name: 'Piutang SBUM', category: 'ASET', level: 3, normalBalance: 'DEBIT', balance: 280000000 },
  { code: '1-2410', name: 'Piutang SBUM - Unit Baru', category: 'ASET', level: 4, normalBalance: 'DEBIT', balance: 200000000 },
  { code: '1-2420', name: 'Piutang SBUM - Unit Lama', category: 'ASET', level: 4, normalBalance: 'DEBIT', balance: 80000000 },
  { code: '1-2500', name: 'Piutang Material Toko', category: 'ASET', level: 3, normalBalance: 'DEBIT', balance: 65000000 },
  { code: '1-2600', name: 'Piutang Material Bumi', category: 'ASET', level: 3, normalBalance: 'DEBIT', balance: 45000000 },
  { code: '1-2700', name: 'Piutang Komisaris', category: 'ASET', level: 3, normalBalance: 'DEBIT', balance: 75000000 },
  { code: '1-2800', name: 'Piutang Karyawan', category: 'ASET', level: 3, normalBalance: 'DEBIT', balance: 35000000 },
  { code: '1-2900', name: 'Penyisihan Penurunan Nilai Piutang', category: 'ASET', level: 3, normalBalance: 'KREDIT', balance: -10000000 },
  { code: '1-3000', name: 'PERSEDIAAN', category: 'ASET', level: 2, normalBalance: 'DEBIT', balance: 9650000000 },
  { code: '1-3100', name: 'Tanah Siap Dijual', category: 'ASET', level: 3, normalBalance: 'DEBIT', balance: 2800000000 },
  { code: '1-3200', name: 'Tanah Dalam Pengembangan', category: 'ASET', level: 3, normalBalance: 'DEBIT', balance: 2100000000 },
  { code: '1-3300', name: 'Bangunan Dalam Penyelesaian', category: 'ASET', level: 3, normalBalance: 'DEBIT', balance: 2450000000 },
  { code: '1-3400', name: 'Unit Siap Dijual', category: 'ASET', level: 3, normalBalance: 'DEBIT', balance: 1850000000 },
  { code: '1-3500', name: 'Persediaan Material', category: 'ASET', level: 3, normalBalance: 'DEBIT', balance: 450000000 },
  { code: '1-3510', name: 'Persediaan Material Toko', category: 'ASET', level: 4, normalBalance: 'DEBIT', balance: 290000000 },
  { code: '1-3520', name: 'Persediaan Material Bumi', category: 'ASET', level: 4, normalBalance: 'DEBIT', balance: 160000000 },
  { code: '1-4000', name: 'UANG MUKA', category: 'ASET', level: 2, normalBalance: 'DEBIT', balance: 830000000 },
  { code: '1-4100', name: 'Uang Muka Tanah/Kavling', category: 'ASET', level: 3, normalBalance: 'DEBIT', balance: 500000000 },
  { code: '1-4200', name: 'Uang Muka Upah Tukang', category: 'ASET', level: 3, normalBalance: 'DEBIT', balance: 180000000 },
  { code: '1-4300', name: 'Beban Dibayar Dimuka', category: 'ASET', level: 3, normalBalance: 'DEBIT', balance: 90000000 },
  { code: '1-4400', name: 'PPN Masukan', category: 'ASET', level: 3, normalBalance: 'DEBIT', balance: 60000000 },
  { code: '1-5000', name: 'ASET TETAP', category: 'ASET', level: 2, normalBalance: 'DEBIT', balance: 2100000000 },
  { code: '1-5100', name: 'Tanah & Bangunan Kantor', category: 'ASET', level: 3, normalBalance: 'DEBIT', balance: 1500000000 },
  { code: '1-5200', name: 'Peralatan Kantor', category: 'ASET', level: 3, normalBalance: 'DEBIT', balance: 180000000 },
  { code: '1-5300', name: 'Kendaraan', category: 'ASET', level: 3, normalBalance: 'DEBIT', balance: 620000000 },
  { code: '1-5400', name: 'Akumulasi Penyusutan', category: 'ASET', level: 3, normalBalance: 'KREDIT', balance: -200000000 },
  { code: '1-6000', name: 'PROPERTI INVESTASI', category: 'ASET', level: 2, normalBalance: 'DEBIT', balance: 450000000 },
  { code: '1-7000', name: 'ASET TAK BERWUJUD', category: 'ASET', level: 2, normalBalance: 'DEBIT', balance: 150000000 },

  // 2-0000 LIABILITAS
  { code: '2-0000', name: 'LIABILITAS', category: 'LIABILITAS', level: 1, normalBalance: 'KREDIT', balance: 4920000000 },
  { code: '2-1000', name: 'UTANG USAHA', category: 'LIABILITAS', level: 2, normalBalance: 'KREDIT', balance: 890000000 },
  { code: '2-1100', name: 'Utang Upah Tukang', category: 'LIABILITAS', level: 3, normalBalance: 'KREDIT', balance: 240000000 },
  { code: '2-1200', name: 'Utang Supplier', category: 'LIABILITAS', level: 3, normalBalance: 'KREDIT', balance: 650000000 },
  { code: '2-1210', name: 'Utang Supplier Toko', category: 'LIABILITAS', level: 4, normalBalance: 'KREDIT', balance: 430000000 },
  { code: '2-1220', name: 'Utang Supplier Bumi', category: 'LIABILITAS', level: 4, normalBalance: 'KREDIT', balance: 220000000 },
  { code: '2-2000', name: 'UANG MUKA PELANGGAN', category: 'LIABILITAS', level: 2, normalBalance: 'KREDIT', balance: 540000000 },
  { code: '2-2100', name: 'Uang Muka Penjualan Rumah', category: 'LIABILITAS', level: 3, normalBalance: 'KREDIT', balance: 380000000 },
  { code: '2-2200', name: 'Pendapatan Diterima di Muka', category: 'LIABILITAS', level: 3, normalBalance: 'KREDIT', balance: 160000000 },
  { code: '2-3000', name: 'UTANG BANK', category: 'LIABILITAS', level: 2, normalBalance: 'KREDIT', balance: 3100000000 },
  { code: '2-3100', name: 'Utang Bank Jangka Pendek (KYG)', category: 'LIABILITAS', level: 3, normalBalance: 'KREDIT', balance: 1100000000 },
  { code: '2-3200', name: 'Utang Bank Jangka Panjang', category: 'LIABILITAS', level: 3, normalBalance: 'KREDIT', balance: 2000000000 },
  { code: '2-4000', name: 'UTANG PAJAK', category: 'LIABILITAS', level: 2, normalBalance: 'KREDIT', balance: 240000000 },
  { code: '2-4100', name: 'Utang PPh Final Pasal 4(2) (2.5%)', category: 'LIABILITAS', level: 3, normalBalance: 'KREDIT', balance: 135000000 },
  { code: '2-4200', name: 'Utang PPN Keluaran', category: 'LIABILITAS', level: 3, normalBalance: 'KREDIT', balance: 55000000 },
  { code: '2-4300', name: 'Utang PPh 21 Karyawan', category: 'LIABILITAS', level: 3, normalBalance: 'KREDIT', balance: 28000000 },
  { code: '2-4400', name: 'Utang PPh 23 Jasa/Vendor', category: 'LIABILITAS', level: 3, normalBalance: 'KREDIT', balance: 22000000 },
  { code: '2-5000', name: 'BEBAN YANG MASIH HARUS DIBAYAR', category: 'LIABILITAS', level: 2, normalBalance: 'KREDIT', balance: 150000000 },

  // 3-0000 EKUITAS
  { code: '3-0000', name: 'EKUITAS', category: 'EKUITAS', level: 1, normalBalance: 'KREDIT', balance: 13530000000 },
  { code: '3-1000', name: 'MODAL SAHAM', category: 'EKUITAS', level: 2, normalBalance: 'KREDIT', balance: 8500000000 },
  { code: '3-1100', name: 'Modal Ditempatkan', category: 'EKUITAS', level: 3, normalBalance: 'KREDIT', balance: 8500000000 },
  { code: '3-1110', name: 'Modal Pak Ahmad', category: 'EKUITAS', level: 4, normalBalance: 'KREDIT', balance: 4500000000 },
  { code: '3-1120', name: 'Modal PT SDP', category: 'EKUITAS', level: 4, normalBalance: 'KREDIT', balance: 2500000000 },
  { code: '3-1130', name: 'Modal Komisaris Lain', category: 'EKUITAS', level: 4, normalBalance: 'KREDIT', balance: 1500000000 },
  { code: '3-1200', name: 'Saham Treasury', category: 'EKUITAS', level: 3, normalBalance: 'DEBIT', balance: 0 },
  { code: '3-2000', name: 'TAMBAHAN MODAL DISETOR', category: 'EKUITAS', level: 2, normalBalance: 'KREDIT', balance: 1200000000 },
  { code: '3-3000', name: 'SALDO LABA', category: 'EKUITAS', level: 2, normalBalance: 'KREDIT', balance: 2150000000 },
  { code: '3-4000', name: 'LABA TAHUN BERJALAN', category: 'EKUITAS', level: 2, normalBalance: 'KREDIT', balance: 1680000000 },

  // 4-0000 PENDAPATAN
  { code: '4-0000', name: 'PENDAPATAN', category: 'PENDAPATAN', level: 1, normalBalance: 'KREDIT', balance: 8112000000 },
  { code: '4-1000', name: 'PENDAPATAN PENJUALAN', category: 'PENDAPATAN', level: 2, normalBalance: 'KREDIT', balance: 7605000000 },
  { code: '4-1100', name: 'Penjualan Rumah Subsidi (Rp169 Jt)', category: 'PENDAPATAN', level: 3, normalBalance: 'KREDIT', balance: 7436000000 },
  { code: '4-1200', name: 'Penjualan Tanah Kavling / Kelebihan Tanah', category: 'PENDAPATAN', level: 3, normalBalance: 'KREDIT', balance: 169000000 },
  { code: '4-1300', name: 'PENDAPATAN RETENSI', category: 'PENDAPATAN', level: 2, normalBalance: 'KREDIT', balance: 220000000 },
  { code: '4-1400', name: 'PENDAPATAN SBUM', category: 'PENDAPATAN', level: 2, normalBalance: 'KREDIT', balance: 176000000 },
  { code: '4-1500', name: 'Pendapatan Uang Muka / Booking Fee', category: 'PENDAPATAN', level: 2, normalBalance: 'KREDIT', balance: 88000000 },
  { code: '4-1600', name: 'Pendapatan Lain-lain', category: 'PENDAPATAN', level: 2, normalBalance: 'KREDIT', balance: 23000000 },

  // 5-0000 BEBAN
  { code: '5-0000', name: 'BEBAN', category: 'BEBAN', level: 1, normalBalance: 'DEBIT', balance: 6432000000 },
  { code: '5-1000', name: 'HARGA POKOK PENJUALAN (HPP)', category: 'BEBAN', level: 2, normalBalance: 'DEBIT', balance: 4426675240 },
  { code: '5-1100', name: 'HPP - Rumah (Rp67.651.710/unit)', category: 'BEBAN', level: 3, normalBalance: 'DEBIT', balance: 2976675240 },
  { code: '5-1200', name: 'HPP - Tanah/Kavling', category: 'BEBAN', level: 3, normalBalance: 'DEBIT', balance: 540000000 },
  { code: '5-1300', name: 'HPP - Konstruksi', category: 'BEBAN', level: 3, normalBalance: 'DEBIT', balance: 420000000 },
  { code: '5-1400', name: 'HPP - Infrastruktur/Fasum', category: 'BEBAN', level: 3, normalBalance: 'DEBIT', balance: 310000000 },
  { code: '5-1500', name: 'HPP - Perizinan dan Legal', category: 'BEBAN', level: 3, normalBalance: 'DEBIT', balance: 180000000 },
  { code: '5-2000', name: 'BEBAN USAHA', category: 'BEBAN', level: 2, normalBalance: 'DEBIT', balance: 1520000000 },
  { code: '5-2100', name: 'Beban Gaji dan Tunjangan', category: 'BEBAN', level: 3, normalBalance: 'DEBIT', balance: 540000000 },
  { code: '5-2200', name: 'Beban Pemasaran dan Promosi', category: 'BEBAN', level: 3, normalBalance: 'DEBIT', balance: 185000000 },
  { code: '5-2300', name: 'Beban Administrasi (PBB, KJJP, Peil Banjir, Plat KPR, Pemecahan Sertifikat, Notaris, Materai, NIDI SLO, ATK, Akad, DP, Petugas Bank, SKMHT)', category: 'BEBAN', level: 3, normalBalance: 'DEBIT', balance: 310000000 },
  { code: '5-2500', name: 'Beban Sewa', category: 'BEBAN', level: 3, normalBalance: 'DEBIT', balance: 45000000 },
  { code: '5-2600', name: 'Beban Penyusutan', category: 'BEBAN', level: 3, normalBalance: 'DEBIT', balance: 65000000 },
  { code: '5-2700', name: 'Beban Pemeliharaan', category: 'BEBAN', level: 3, normalBalance: 'DEBIT', balance: 40000000 },
  { code: '5-2800', name: 'Beban Utilitas (Listrik Warga/Kantor/Air)', category: 'BEBAN', level: 3, normalBalance: 'DEBIT', balance: 55000000 },
  { code: '5-2900', name: 'Beban Upah (Tukang Unit/Perbaikan/Fasum/Listrik)', category: 'BEBAN', level: 3, normalBalance: 'DEBIT', balance: 280000000 },
  { code: '5-3000', name: 'BEBAN KEUANGAN (Bunga Pinjaman, Adm Bank, Akad Kredit)', category: 'BEBAN', level: 2, normalBalance: 'DEBIT', balance: 195000000 },
  { code: '5-4000', name: 'BEBAN PAJAK (Final 2.5%, Kini, Tangguhan)', category: 'BEBAN', level: 2, normalBalance: 'DEBIT', balance: 190324760 },
  { code: '5-5000', name: 'BEBAN LAIN-LAIN', category: 'BEBAN', level: 2, normalBalance: 'DEBIT', balance: 35000000 },
  { code: '5-6000', name: 'BEBAN OPERASIONAL (Konsumsi, BBM, Lain)', category: 'BEBAN', level: 2, normalBalance: 'DEBIT', balance: 65000000 },
];

export const UNIT_PROGRESS_CHECKLIST_ITEMS = [
  { id: 'chk-1', name: '1. Pembersihan Lahan & Bowplank', weight: 5 },
  { id: 'chk-2', name: '2. Galian & Pasangan Pondasi Batu Kali', weight: 10 },
  { id: 'chk-3', name: '3. Sloof, Kolom Praktis & Ring Balk Beton', weight: 15 },
  { id: 'chk-4', name: '4. Pasangan Dinding Bata & Plesteran', weight: 15 },
  { id: 'chk-5', name: '5. Rangka Atap Baja Ringan & Penutup Atap', weight: 15 },
  { id: 'chk-6', name: '6. Plafon Tinggi (High Ceiling) & List', weight: 8 },
  { id: 'chk-7', name: '7. Instalasi Listrik & Pipa Air Bersih/Kotor', weight: 8 },
  { id: 'chk-8', name: '8. Pemasangan Keramik Lantai & Kamar Mandi', weight: 10 },
  { id: 'chk-9', name: '9. Kusen, Pintu, Jendela & Kaca', weight: 6 },
  { id: 'chk-10', name: '10. Pengecatan Interior & Eksterior', weight: 5 },
  { id: 'chk-11', name: '11. Finishing, Sanitair & Pembersihan Akhir', weight: 3 },
];

export const FASUM_16_TYPES = [
  { id: 'fsm-1', name: 'Jalan Utama (Row 10m)', unit: 'm²', volume: 2400, progress: 85, budget: 360000000, realized: 306000000, status: 'Terverifikasi PJT' },
  { id: 'fsm-2', name: 'Jalan Lingkungan Blok A-D (Row 7m)', unit: 'm²', volume: 3100, progress: 75, budget: 410000000, realized: 307500000, status: 'Terverifikasi PJT' },
  { id: 'fsm-3', name: 'Jalan Setapak / Pedestrian', unit: 'm¹', volume: 650, progress: 60, budget: 65000000, realized: 39000000, status: 'Menunggu Verifikasi PJT' },
  { id: 'fsm-4', name: 'Drainase Lingkungan Pasangan Batu', unit: 'm¹', volume: 1850, progress: 90, budget: 277500000, realized: 249750000, status: 'Terverifikasi PJT' },
  { id: 'fsm-5', name: 'Taman Hijau & RTH Kompleks', unit: 'm²', volume: 450, progress: 70, budget: 85000000, realized: 59500000, status: 'Terverifikasi PJT' },
  { id: 'fsm-6', name: 'Masjid Al-Bahagia Kompleks', unit: 'Unit', volume: 1, progress: 80, budget: 450000000, realized: 360000000, status: 'Terverifikasi PJT' },
  { id: 'fsm-7', name: 'Pos Ronda / Keamanan Terpadu', unit: 'Unit', volume: 2, progress: 100, budget: 45000000, realized: 44000000, status: 'Terverifikasi PJT' },
  { id: 'fsm-8', name: 'Gerbang Utama (Main Gate) Bahagia', unit: 'Unit', volume: 1, progress: 100, budget: 125000000, realized: 122500000, status: 'Terverifikasi PJT' },
  { id: 'fsm-9', name: 'Papan Nama Proyek & Penunjuk Blok', unit: 'Titik', volume: 12, progress: 100, budget: 24000000, realized: 23500000, status: 'Terverifikasi PJT' },
  { id: 'fsm-10', name: 'Lapangan Olahraga Serbaguna', unit: 'm²', volume: 320, progress: 50, budget: 95000000, realized: 47500000, status: 'Menunggu Verifikasi PJT' },
  { id: 'fsm-11', name: 'Area Parkir Komunal', unit: 'm²', volume: 200, progress: 65, budget: 50000000, realized: 32500000, status: 'Terverifikasi PJT' },
  { id: 'fsm-12', name: 'Jaringan Listrik PLN & Tiang TM/TR', unit: 'Paket', volume: 1, progress: 95, budget: 210000000, realized: 199500000, status: 'Terverifikasi PJT' },
  { id: 'fsm-13', name: 'Jaringan Air Bersih / Sumur Bor Induk', unit: 'Paket', volume: 2, progress: 90, budget: 160000000, realized: 144000000, status: 'Terverifikasi PJT' },
  { id: 'fsm-14', name: 'Penerangan Jalan Umum (PJU Solar/LED)', unit: 'Titik', volume: 36, progress: 85, budget: 108000000, realized: 91800000, status: 'Terverifikasi PJT' },
  { id: 'fsm-15', name: 'Tempat Sampah Terpilah Kawasan', unit: 'Unit', volume: 50, progress: 80, budget: 35000000, realized: 28000000, status: 'Terverifikasi PJT' },
  { id: 'fsm-16', name: 'Saluran Pembuangan Air Hujan Induk', unit: 'm¹', volume: 520, progress: 88, budget: 156000000, realized: 137280000, status: 'Terverifikasi PJT' },
];

export const FASOS_4_TYPES = [
  { id: 'fss-1', name: 'PAUD / TK Taman Bahagia', unit: 'Unit', volume: 1, progress: 75, budget: 185000000, realized: 138750000, status: 'Terverifikasi PJT' },
  { id: 'fss-2', name: 'Posyandu & Klinik Pratama Warga', unit: 'Unit', volume: 1, progress: 80, budget: 140000000, realized: 112000000, status: 'Terverifikasi PJT' },
  { id: 'fss-3', name: 'Balai Pertemuan Warga Bahagia', unit: 'Unit', volume: 1, progress: 90, budget: 165000000, realized: 148500000, status: 'Terverifikasi PJT' },
  { id: 'fss-4', name: 'Kios Pasar Lingkungan / UMKM Warga', unit: 'Petak', volume: 8, progress: 60, budget: 220000000, realized: 132000000, status: 'Menunggu Verifikasi PJT' },
];

export const LAHAN_5_STAGES = [
  { id: 'lhn-1', name: '1. Pembersihan Lahan (Land Clearing)', unit: 'm²', volume: 12278, progress: 100, budget: 98000000, realized: 96500000, status: 'Terverifikasi PJT' },
  { id: 'lhn-2', name: '2. Cut & Fill / Penimbunan & Pemadatan', unit: 'm³', volume: 8400, progress: 95, budget: 420000000, realized: 399000000, status: 'Terverifikasi PJT' },
  { id: 'lhn-3', name: '3. Pembentukan Jalan Akses Alat Berat', unit: 'm¹', volume: 850, progress: 100, budget: 115000000, realized: 112000000, status: 'Terverifikasi PJT' },
  { id: 'lhn-4', name: '4. Galian Drainase Induk Kawasan', unit: 'm¹', volume: 1200, progress: 90, budget: 144000000, realized: 129600000, status: 'Terverifikasi PJT' },
  { id: 'lhn-5', name: '5. Penanaman Pohon Pelindung Tepi', unit: 'Pohon', volume: 150, progress: 70, budget: 37500000, realized: 26250000, status: 'Menunggu Verifikasi PJT' },
];

export interface KavlingLot {
  id: string;
  companyId: 'PT_TBL' | 'PT_BPP';
  projectName: string;
  block: 'A' | 'B' | 'C' | 'D' | string;
  number: number;
  code: string;
  type: string;
  landSize: string;
  buildingSize?: number;
  extraLand: string;
  price: number;
  hpp: number;
  status: 'Tersedia' | 'Booking' | 'Proses KPR' | 'Akad' | 'Terjual' | 'Serah Terima';
  progress: number;
  pjtVerified: boolean;
  buyerName?: string;
  buyerPhone?: string;
  paymentMethod?: 'Cash' | 'KPR' | 'Tempo';
  bank?: 'BTN' | 'BRI' | 'Mandiri' | string;
  pengawasNotes?: string;
  pjtNotes?: string;
  photos: string[];
  blockColor?: 'yellow' | 'purple' | 'blue' | 'red' | 'emerald';
  customFillColor?: string;
  mapCoords?: {
    x: number;
    y: number;
    width: number;
    height: number;
    orientation?: 'Utara' | 'Selatan' | 'Timur' | 'Barat';
    // Percentage coordinates (0-100%) on top of original PNG site plan image
    xPct?: number;
    yPct?: number;
    widthPct?: number;
    heightPct?: number;
    rotationDeg?: number;
    shape?: 'RECT' | 'POLYGON';
    points?: { xPct: number; yPct: number }[];
  };
}

export interface SitePlanConfigRecord {
  projectId: string;
  projectName: string;
  companyId: 'PT_TBL' | 'PT_BPP' | string;
  sourceFileName: string;
  imageUrl: string;
  defaultImageUrl: string;
  resolution: string;
  fileSizeText: string;
  uploadedAt: string;
  showGridOnPublic: boolean;
  statusColors: {
    Tersedia: string;
    Booking: string;
    'Proses KPR': string;
    Akad: string;
    Terjual: string;
    'Serah Terima': string;
  };
  history: {
    id: string;
    timestamp: string;
    fileName: string;
    imageUrl: string;
    uploadedBy: string;
  }[];
}

export const DEFAULT_SITE_PLAN_STATUS_COLORS: SitePlanConfigRecord['statusColors'] = {
  Tersedia: '#10B981', // Hijau
  Booking: '#EAB308', // Kuning
  'Proses KPR': '#F97316', // Oranye
  Akad: '#EF4444', // Merah
  Terjual: '#EF4444', // Merah
  'Serah Terima': '#8B5CF6', // Ungu
};

export function generateInitialKavling(): KavlingLot[] {
  const lots: KavlingLot[] = [];
  // PT Tata Bahagia Land: 97 units (A: 27 kuning, B: 27 ungu, C: 23 biru, D: 20 merah)
  const tblBlocks: {
    block: 'A' | 'B' | 'C' | 'D';
    count: number;
    color: 'yellow' | 'purple' | 'blue' | 'red';
  }[] = [
    { block: 'A', count: 27, color: 'yellow' },
    { block: 'B', count: 27, color: 'purple' },
    { block: 'C', count: 23, color: 'blue' },
    { block: 'D', count: 20, color: 'red' },
  ];

  // PENTING: JANGAN generate ulang koordinat kotak/polygon otomatis!
  // Biarkan mapCoords kosong secara default agar gambar PNG asli tampil bersih apa adanya,
  // dan Admin menggambar sendiri polygon secara manual menggunakan Canvas Editor (seperti Paint/Canva).
  tblBlocks.forEach(({ block, count, color }) => {
    for (let i = 1; i <= count; i++) {
      const code = `${block}-${String(i).padStart(2, '0')}`;
      let status: KavlingLot['status'] = 'Tersedia';
      let progress = 45;
      let buyerName: string | undefined;
      let buyerPhone: string | undefined;
      let paymentMethod: KavlingLot['paymentMethod'] | undefined;
      let bank: KavlingLot['bank'] | undefined;

      if (block === 'A' && i <= 18) {
        status = 'Terjual';
        progress = 100;
        buyerName = `Keluarga Konsumen ${code}`;
        buyerPhone = `08114000${String(100 + i)}`;
        paymentMethod = 'KPR';
        bank = i % 3 === 0 ? 'Mandiri' : i % 2 === 0 ? 'BRI' : 'BTN';
      } else if (block === 'A' && i <= 23) {
        status = 'Akad';
        progress = 100;
        buyerName = `Pemohon Akad ${code}`;
        buyerPhone = `08124100${String(200 + i)}`;
        paymentMethod = 'KPR';
        bank = 'BTN';
      } else if (block === 'B' && i <= 12) {
        status = 'Terjual';
        progress = 100;
        buyerName = `Keluarga Bahagia ${code}`;
        buyerPhone = `08134200${String(300 + i)}`;
        paymentMethod = 'KPR';
        bank = 'BRI';
      } else if (block === 'B' && i <= 18) {
        status = 'Proses KPR';
        progress = 85;
        buyerName = `Calon Debitur ${code}`;
        buyerPhone = `08524000${String(400 + i)}`;
        paymentMethod = 'KPR';
        bank = 'BTN';
      } else if (block === 'C' && i <= 6) {
        status = 'Booking';
        progress = 75;
        buyerName = `Pemesan Booking ${code}`;
        buyerPhone = `08214400${String(500 + i)}`;
        paymentMethod = 'KPR';
        bank = 'Mandiri';
      } else {
        progress = block === 'C' ? 50 : 25;
      }

      lots.push({
        id: `TBL-${code}`,
        companyId: 'PT_TBL',
        projectName: 'Perumahan Bahagia Land',
        block,
        number: i,
        code,
        type: 'Tipe 36/91 Subsidi',
        landSize: '7×13 m (91 m²)',
        buildingSize: 36,
        extraLand: 'Depan 4m, Belakang 3m, Samping 1m',
        price: 169000000,
        hpp: 67651710,
        status,
        progress,
        pjtVerified: progress >= 75,
        buyerName,
        buyerPhone,
        paymentMethod,
        bank,
        pengawasNotes: `Konstruksi ${code} sesuai spesifikasi teknis 7x13m.`,
        pjtNotes: progress >= 75 ? 'Spesifikasi teknis & struktur tervalidasi PJT.' : 'Menunggu inspeksi tahap lanjutan.',
        photos: [ASSETS.bahagiaLand, ASSETS.unitInterior, ASSETS.unitFloorplan],
        blockColor: color,
      });
    }
  });

  // PT Bahagia Prima Property: 22 units (Blok A: 22 unit A-01 s/d A-22)
  // Tanpa koordinat otomatis agar gambar PNG asli "bahagia residence.png" tampil apa adanya dan digambar manual oleh Admin.
  for (let i = 1; i <= 22; i++) {
    const code = `A-${String(i).padStart(2, '0')}`;
    let status: KavlingLot['status'] = 'Tersedia';
    let progress = 60;
    let buyerName: string | undefined;
    let buyerPhone: string | undefined;
    let paymentMethod: KavlingLot['paymentMethod'] | undefined;
    let bank: KavlingLot['bank'] | undefined;

    if (i <= 9) {
      status = 'Terjual';
      progress = 100;
      buyerName = `Keluarga Prima ${code}`;
      buyerPhone = `08114099${String(100 + i)}`;
      paymentMethod = 'KPR';
      bank = i % 2 === 0 ? 'BTN' : 'BRI';
    } else if (i <= 13) {
      status = 'Booking';
      progress = 90;
      buyerName = `Pemesan Prima ${code}`;
      buyerPhone = `08124199${String(200 + i)}`;
      paymentMethod = 'KPR';
      bank = 'BTN';
    } else if (i <= 16) {
      status = 'Proses KPR';
      progress = 80;
      buyerName = `Debitur Prima ${code}`;
      buyerPhone = `08134299${String(300 + i)}`;
      paymentMethod = 'KPR';
      bank = 'Mandiri';
    }

    lots.push({
      id: `BPP-${code}`,
      companyId: 'PT_BPP',
      projectName: 'Perumahan Bahagia Residence',
      block: 'A',
      number: i,
      code,
      type: 'Tipe 36/91 Bata Merah Ceiling 4m',
      landSize: '7×13 m (91 m²)',
      buildingSize: 36,
      extraLand: 'Batu Bata Merah Penuh · Ceiling 4m',
      price: 169000000,
      hpp: 67651710,
      status,
      progress,
      pjtVerified: progress >= 80,
      buyerName,
      buyerPhone,
      paymentMethod,
      bank,
      pengawasNotes: 'Pasangan bata merah penuh dan tinggi plafon 4m sesuai gambar kerja.',
      pjtNotes: progress >= 80 ? 'Kualitas pasangan bata merah & elevasi plafon 4m memenuhi standar.' : 'Dalam tahap penyelesaian.',
      photos: [ASSETS.bahagiaResidence, ASSETS.unitInterior, ASSETS.unitFloorplan],
      blockColor: 'emerald',
    });
  }

  return lots;
}

export const INITIAL_SITE_PLAN_CONFIGS: SitePlanConfigRecord[] = [
  {
    projectId: 'PROJ-SYNC-TBL',
    projectName: 'Perumahan Bahagia Land',
    companyId: 'PT_TBL',
    sourceFileName: 'bahagia land.png',
    imageUrl: ASSETS.sitePlanBahagiaLand,
    defaultImageUrl: ASSETS.sitePlanBahagiaLand,
    resolution: '1600 × 1131 px (Original PNG)',
    fileSizeText: '2.45 MB',
    uploadedAt: '2026-10-10 08:30',
    showGridOnPublic: false,
    statusColors: { ...DEFAULT_SITE_PLAN_STATUS_COLORS },
    history: [
      {
        id: 'sp-hist-tbl-1',
        timestamp: '2026-10-10 08:30',
        fileName: 'bahagia land.png (Gambar Asli Site Plan 97 Unit)',
        imageUrl: ASSETS.sitePlanBahagiaLand,
        uploadedBy: 'Super Admin',
      },
    ],
  },
  {
    projectId: 'PROJ-SYNC-BPP',
    projectName: 'Perumahan Bahagia Residence',
    companyId: 'PT_BPP',
    sourceFileName: 'bahagia residence.png',
    imageUrl: ASSETS.sitePlanBahagiaResidence,
    defaultImageUrl: ASSETS.sitePlanBahagiaResidence,
    resolution: '1600 × 1131 px (Original PNG)',
    fileSizeText: '1.92 MB',
    uploadedAt: '2026-10-10 08:35',
    showGridOnPublic: false,
    statusColors: { ...DEFAULT_SITE_PLAN_STATUS_COLORS },
    history: [
      {
        id: 'sp-hist-bpp-1',
        timestamp: '2026-10-10 08:35',
        fileName: 'bahagia residence.png (Gambar Asli Site Plan 22 Unit)',
        imageUrl: ASSETS.sitePlanBahagiaResidence,
        uploadedBy: 'Super Admin',
      },
    ],
  },
];

export const ROLE_WORKFLOWS: Record<
  RoleCode,
  {
    title: string;
    subtitle: string;
    steps: { label: string; desc: string; path: string }[];
    todayTasks: { id: string; title: string; priority: 'Tinggi' | 'Normal'; path: string }[];
    quickActions: { label: string; path: string }[];
  }
> = {
  DIREKTUR: {
    title: 'Alur Kerja Direktur Utama (Level Grup)',
    subtitle: 'Lihat Laporan → Approve Pengajuan → Evaluasi Target Konsolidasi 2 PT',
    steps: [
      { label: '1. Lihat Laporan', desc: 'Evaluasi Cash Flow & Penjualan', path: '/laporan' },
      { label: '2. Approve Pengajuan', desc: 'Single Approval > Rp1 Jt & RAB', path: '/approval' },
      { label: '3. Target & Konsolidasi', desc: 'Pantau KPI PT TBL & PT BPP', path: '/dashboard' },
    ],
    todayTasks: [
      { id: 't-dir-1', title: 'Approve RAB Blok C Bahagia Land (Sudah Verifikasi PJT)', priority: 'Tinggi', path: '/approval' },
      { id: 't-dir-2', title: 'Approve PO Semen Tonasa & Besi Beton Rp48.500.000', priority: 'Tinggi', path: '/approval' },
      { id: 't-dir-3', title: 'Tanda Tangan Digital BAST Unit TBL-A-19', priority: 'Normal', path: '/project/verifikasi' },
    ],
    quickActions: [
      { label: 'Buka Antrean Single Approval', path: '/approval' },
      { label: 'Laporan Konsolidasi Grup', path: '/laporan' },
      { label: 'Monitor Site Plan 122 Unit', path: '/sistem/kavling' },
    ],
  },
  ADMIN: {
    title: 'Alur Kerja Super Admin (Full Control)',
    subtitle: 'Setup PT → Setup Role → Setup User → Monitor Sistem & CMS',
    steps: [
      { label: '1. Setup PT', desc: 'Kelola 2 Perusahaan & Proyek', path: '/sistem/perusahaan' },
      { label: '2. Setup Role', desc: 'Matriks Izin 9 Modul × 7 Aksi', path: '/sistem/role' },
      { label: '3. Setup User', desc: 'Kelola Akun Multi-Role & 2FA', path: '/sistem/user' },
      { label: '4. Monitor & CMS', desc: 'Control Center 24 Sub-Menu', path: '/sistem/dashboard' },
    ],
    todayTasks: [
      { id: 't-adm-1', title: 'Review Perubahan Katalog Unit dari Marketing', priority: 'Tinggi', path: '/sistem/catalog-editor' },
      { id: 't-adm-2', title: 'Cek Log Trigger Email Firestore (12 Event)', priority: 'Normal', path: '/sistem/email-log' },
      { id: 't-adm-3', title: 'Verifikasi Backup Otomatis Harian Database', priority: 'Normal', path: '/sistem/backup' },
    ],
    quickActions: [
      { label: 'CMS Website Editor (10 Tab)', path: '/sistem/website-editor' },
      { label: 'Kelola User & Permission Matrix', path: '/sistem/role' },
      { label: 'Audit Trail & System Health', path: '/sistem/health' },
    ],
  },
  MARKETING: {
    title: 'Alur Kerja Marketing & Penjualan KPR',
    subtitle: 'Prospek → Follow-up → Booking → SPR → Akad → Selesai',
    steps: [
      { label: '1. Prospek', desc: 'Input Leads & Sumber Prospek', path: '/marketing/prospek' },
      { label: '2. Follow-up', desc: 'Kanban Pipeline & WA Template', path: '/marketing/pipeline' },
      { label: '3. Booking', desc: 'Generate BKG-2026 & Pilih Kavling', path: '/marketing/booking' },
      { label: '4. SPR', desc: 'Cetak Surat Pemesanan Rumah', path: '/marketing/spr' },
      { label: '5. Akad Kredit', desc: 'Proses Bank BTN/BRI/Mandiri', path: '/marketing/pipeline' },
      { label: '6. Selesai / BAST', desc: 'Serah Terima & Layanan Komplain', path: '/marketing/komplain' },
    ],
    todayTasks: [
      { id: 't-mkt-1', title: 'Follow-up berkas KPR Bank BTN atas nama BKG-2026-0004', priority: 'Tinggi', path: '/marketing/pipeline' },
      { id: 't-mkt-2', title: 'Terbitkan SPR resmi untuk kavling BPP-A-12', priority: 'Tinggi', path: '/marketing/spr' },
      { id: 't-mkt-3', title: 'Tanggapi tiket komplain TKT-2026-0002', priority: 'Normal', path: '/marketing/komplain' },
    ],
    quickActions: [
      { label: 'Sales Pipeline Kanban', path: '/marketing/pipeline' },
      { label: 'Input Booking Baru', path: '/marketing/booking' },
      { label: 'Cetak Dokumen SPR', path: '/marketing/spr' },
    ],
  },
  KEUANGAN: {
    title: 'Alur Kerja Keuangan & Akuntansi',
    subtitle: 'Pengajuan → Verifikasi → Approve Direktur → Pembayaran → Jurnal Otomatis',
    steps: [
      { label: '1. Pengajuan', desc: 'Terima SPP / Tagihan / Opname', path: '/keuangan/pembayaran' },
      { label: '2. Verifikasi', desc: 'Cek Bukti & Limit Rp1.000.000', path: '/keuangan/verifikasi' },
      { label: '3. Approve Direktur', desc: 'Otorisasi > Rp1 Jt oleh Direktur', path: '/approval' },
      { label: '4. Pembayaran', desc: 'Pencairan Kas/Bank & Kwitansi', path: '/keuangan/kas' },
      { label: '5. Jurnal & Pajak', desc: 'Auto-Jurnal COA & PPh/PPN', path: '/keuangan/jurnal' },
    ],
    todayTasks: [
      { id: 't-keu-1', title: 'Proses pembayaran opname mandor yang telah di-approve Direktur', priority: 'Tinggi', path: '/keuangan/pembayaran' },
      { id: 't-keu-2', title: 'Rekonsiliasi pencairan retensi KPR Bank BTN (Rp169 Jt/unit)', priority: 'Tinggi', path: '/keuangan/coa' },
      { id: 't-keu-3', title: 'Hitung & setor PPh Final 2.5% atas 3 unit akad bulan ini', priority: 'Normal', path: '/keuangan/pajak' },
    ],
    quickActions: [
      { label: 'Bagan Akun (COA Lengkap)', path: '/keuangan/coa' },
      { label: 'Input Jurnal & Kas/Bank', path: '/keuangan/jurnal' },
      { label: 'Kalkulator Pajak Otomatis', path: '/keuangan/pajak' },
    ],
  },
  HRD: {
    title: 'Alur Kerja HRD & Personalia',
    subtitle: 'Karyawan → Kontrak → Absensi Selfie+GPS → Payroll → Selesai',
    steps: [
      { label: '1. Karyawan', desc: 'Database Staf Kedua PT', path: '/hrm/karyawan' },
      { label: '2. Kontrak & SPK', desc: 'Kontrak Kerja & Jabatan', path: '/hrm/karyawan' },
      { label: '3. Absensi', desc: 'Verifikasi Selfie + Titik GPS', path: '/hrm/absensi' },
      { label: '4. Payroll', desc: 'Hitung Gaji, PPh 21 & Pinjaman', path: '/hrm/payroll' },
      { label: '5. Selesai', desc: 'Cetak Slip Gaji Resmi QR', path: '/hrm/payroll' },
    ],
    todayTasks: [
      { id: 't-hrd-1', title: 'Verifikasi log absensi selfie + GPS tim lapangan proyek Kendari', priority: 'Normal', path: '/hrm/absensi' },
      { id: 't-hrd-2', title: 'Siapkan draft Payroll bulan berjalan & potongan kasbon karyawan', priority: 'Tinggi', path: '/hrm/payroll' },
    ],
    quickActions: [
      { label: 'Absensi Selfie + GPS', path: '/hrm/absensi' },
      { label: 'Generate Payroll & Slip Gaji', path: '/hrm/payroll' },
      { label: 'Data Pinjaman Karyawan', path: '/hrm/pinjaman' },
    ],
  },
  LOGISTIK: {
    title: 'Alur Kerja Logistik & Gudang Material',
    subtitle: 'Material Request → Cek Stok → Penerimaan PO → Update Kartu Stok',
    steps: [
      { label: '1. Material Request', desc: 'Permintaan Bahan dari Pengawas', path: '/gudang/request' },
      { label: '2. Cek Stok', desc: 'Cek Gudang Toko & Material Bumi', path: '/gudang/stok' },
      { label: '3. Penerimaan', desc: 'Terima Barang dari Supplier PO', path: '/gudang/penerimaan' },
      { label: '4. Update Stok', desc: 'Stok Opname & Alert Minimum', path: '/gudang/opname' },
    ],
    todayTasks: [
      { id: 't-log-1', title: 'Cek stok Semen Tonasa & Bata Merah (mendekati batas minimum)', priority: 'Tinggi', path: '/gudang/stok' },
      { id: 't-log-2', title: 'Verifikasi surat jalan penerimaan besi beton 10mm SNI', priority: 'Normal', path: '/gudang/penerimaan' },
    ],
    quickActions: [
      { label: 'Kartu Stok Material', path: '/gudang/stok' },
      { label: 'Material Request Lapangan', path: '/gudang/request' },
      { label: 'Stok Opname Gudang', path: '/gudang/opname' },
    ],
  },
  PENGAWAS: {
    title: 'Alur Kerja Pengawas Lapangan (Merangkap Purchasing)',
    subtitle: 'Pengajuan Bahan → PO Multi-Material → Progress Unit/Fasum → Opname → Lapor Selesai',
    steps: [
      { label: '1. Pengajuan & RAB', desc: 'Susun RAB & Pengajuan Bahan', path: '/project/rab' },
      { label: '2. PO & Supplier', desc: 'Buat PO Multi-Material & Invoice', path: '/purchasing/po' },
      { label: '3. Progress 0-100%', desc: 'Checklist 11 Item Unit & 16 Fasum', path: '/project/progress' },
      { label: '4. Opname Mandor', desc: 'Hitung Volume SPK Mandor', path: '/project/opname' },
      { label: '5. Lapor Selesai', desc: 'Ajukan Verifikasi PJT & BAST', path: '/project/verifikasi' },
    ],
    todayTasks: [
      { id: 't-pgw-1', title: 'Update progress fisik 11 checklist unit Blok B Bahagia Land', priority: 'Tinggi', path: '/project/progress' },
      { id: 't-pgw-2', title: 'Buat PO Multi-Material untuk kebutuhan atap baja ringan', priority: 'Tinggi', path: '/purchasing/po' },
      { id: 't-pgw-3', title: 'Submit Opname Mandor minggu ke-2 ke PJT', priority: 'Normal', path: '/project/opname' },
    ],
    quickActions: [
      { label: 'Update Progress Unit (11 Checklist)', path: '/project/progress' },
      { label: 'Buat PO Multi-Material', path: '/purchasing/po' },
      { label: 'Susun RAB & Bandingkan Realisasi', path: '/project/rab' },
    ],
  },
  PJT: {
    title: 'Alur Kerja PJT (Penanggung Jawab Teknis)',
    subtitle: 'Buat Pengajuan → RAB → Verifikasi Keuangan → Direktur → Eksekusi → Verifikasi Progress → TTD → Selesai',
    steps: [
      { label: '1. Buat Pengajuan', desc: 'Ajukan Lahan / Unit / Fasum / Renovasi', path: '/project/pengajuan-proyek' },
      { label: '2. Susun RAB', desc: 'RAB Material, Upah, Overhead & Pajak', path: '/project/pengajuan-proyek' },
      { label: '3. Verifikasi Keuangan', desc: 'Validasi Anggaran & Sumber Dana', path: '/project/pengajuan-proyek' },
      { label: '4. Approval Direktur', desc: 'Single Approval Direktur Utama', path: '/approval' },
      { label: '5. Eksekusi & SPK', desc: 'RAB vs Realisasi & SPK Mandor', path: '/project/rab-vs-realisasi' },
      { label: '6. Verifikasi Progress', desc: 'Validasi Foto & Checklist (Read-Only)', path: '/project/verifikasi' },
      { label: '7. TTD QR & Selesai', desc: 'Digital Signature BAST & Serah Terima', path: '/project/verifikasi' },
    ],
    todayTasks: [
      { id: 't-pjt-1', title: '3 pengajuan dalam proses (Lahan Tahap 2, Unit Blok D & Masjid Al-Ikhlas)', priority: 'Tinggi', path: '/project/pengajuan-proyek' },
      { id: 't-pjt-2', title: '2 RAB menunggu verifikasi keuangan (PPJ/UNIT/2026/10/0001 & PPJ/LAHAN/2026/10/0001)', priority: 'Tinggi', path: '/project/pengajuan-proyek' },
      { id: 't-pjt-3', title: '1 pengajuan menunggu approval direktur (PPJ/FASUM/2026/10/0001)', priority: 'Normal', path: '/approval' },
    ],
    quickActions: [
      { label: '+ Ajukan Proyek Baru', path: '/project/pengajuan-proyek' },
      { label: 'Lihat Pengajuan Saya', path: '/project/pengajuan-proyek' },
      { label: 'Verifikasi RAB Pengawas', path: '/project/verifikasi-rab' },
    ],
  },
  USER: {
    title: 'Alur Pemesanan Rumah Konsumen',
    subtitle: 'Pilih Unit → Booking Online → Pemberkasan KPR → Akad → Serah Terima Kunci',
    steps: [
      { label: '1. Katalog Unit', desc: 'Pilih Bahagia Land / Residence', path: '/katalog' },
      { label: '2. Booking Online', desc: 'Dapatkan Nomor BKG-2026', path: '/booking' },
      { label: '3. Lacak KPR & BAST', desc: 'Pantau Pembangunan & Akad', path: '/komplain' },
    ],
    todayTasks: [
      { id: 't-usr-1', title: 'Lengkapi dokumen slip gaji & KTP untuk pengajuan KPR FLPP', priority: 'Normal', path: '/booking' },
    ],
    quickActions: [
      { label: 'Booking Unit Sekarang', path: '/booking' },
      { label: 'Ajukan Tiket Komplain / Garansi', path: '/komplain' },
    ],
  },
};

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function terbilangRupiah(nilai: number): string {
  const satuan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  const hitung = (n: number): string => {
    n = Math.floor(Math.abs(n));
    if (n < 12) return satuan[n];
    if (n < 20) return hitung(n - 10) + ' Belas';
    if (n < 100) return hitung(Math.floor(n / 10)) + ' Puluh ' + hitung(n % 10);
    if (n < 200) return 'Seratus ' + hitung(n - 100);
    if (n < 1000) return hitung(Math.floor(n / 100)) + ' Ratus ' + hitung(n % 100);
    if (n < 2000) return 'Seribu ' + hitung(n - 1000);
    if (n < 1000000) return hitung(Math.floor(n / 1000)) + ' Ribu ' + hitung(n % 1000);
    if (n < 1000000000) return hitung(Math.floor(n / 1000000)) + ' Juta ' + hitung(n % 1000000);
    if (n < 1000000000000) return hitung(Math.floor(n / 1000000000)) + ' Miliar ' + hitung(n % 1000000000);
    return hitung(Math.floor(n / 1000000000000)) + ' Triliun ' + hitung(n % 1000000000000);
  };
  if (nilai === 0) return 'Nol Rupiah';
  return (hitung(nilai).replace(/\s+/g, ' ').trim() + ' Rupiah');
}
