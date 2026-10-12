import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import {
  SEED_USERS,
  INITIAL_COMPANIES,
  INITIAL_COA,
  generateInitialKavling,
  FASUM_16_TYPES,
  FASOS_4_TYPES,
  LAHAN_5_STAGES,
  SeedUser,
  CompanyInfo,
  CoaItem,
  KavlingLot,
  SitePlanConfigRecord,
  INITIAL_SITE_PLAN_CONFIGS,
  DEFAULT_SITE_PLAN_STATUS_COLORS,
  RoleCode,
} from '../data/seedData';
import {
  EditableTextItem,
  EditablePhotoSlot,
  CmsWebsiteContent,
  DataMasterItem,
  BackupSnapshotRecord,
  SyncedProjectRecord,
  INITIAL_CMS_CONTENT,
  INITIAL_PHOTO_SLOTS,
  INITIAL_DATA_MASTER_12,
  INITIAL_SYNCED_PROJECTS,
  generateInitialEditableTexts,
  generateProjectSlug,
} from '../data/superAdminSeedData';
import {
  syncErpRecordToFirestore,
  syncProjectSubmissionToFirestore,
  clearFirestoreCollectionsOnReset,
  syncSiteplanMasterToFirestore,
  publishFullStateToCloudAndServer,
  fetchLatestPublishedState,
  LiveDeployResult,
  ApprovalNotificationItem,
  syncApprovalNotificationToFirestore,
  markFirestoreNotificationRead,
} from '../lib/firebase';
import {
  PublicTestimonialRecord,
  TestimonialSectionSettings,
  GalleryProgressPhotoRecord,
  ProjectPhysicalProgressRecord,
  GallerySectionSettings,
  BlogArticleRecord,
  BlogSectionSettings,
  INITIAL_TESTIMONIAL_SETTINGS,
  INITIAL_PUBLIC_TESTIMONIALS,
  INITIAL_GALLERY_SETTINGS,
  INITIAL_PROJECT_PHYSICAL_PROGRESS,
  INITIAL_GALLERY_PHOTOS,
  INITIAL_BLOG_SETTINGS,
  INITIAL_BLOG_ARTICLES,
  generateArticleSlug,
} from '../data/publicSectionsSeedData';

export type ProjectSubmissionType = 'LAHAN' | 'UNIT' | 'FASUM' | 'RENOVASI';

export type ProjectSubmissionStatus =
  | 'Draft'
  | 'Menunggu Verifikasi Keuangan'
  | 'Menunggu Approval Direktur'
  | 'Approved'
  | 'Rejected';

export interface SubmissionRabItem {
  id: string;
  category: 'Material' | 'Upah' | 'Biaya Lahan' | 'Pekerjaan Fasum' | 'Perbaikan';
  description: string;
  volume: number;
  realizedVolume: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
  realizedAmount: number;
  itemStatus: 'Belum' | 'Proses' | 'Selesai';
}

export interface SubmissionHistoryEntry {
  id: string;
  actorName: string;
  actorRole: string;
  action: string;
  notes?: string;
  timestamp: string;
}

export interface SubmissionComment {
  id: string;
  authorName: string;
  authorRole: string;
  message: string;
  timestamp: string;
}

export interface ProjectSubmissionRecord {
  id: string;
  submissionNumber: string; // PPJ/{jenis}/{tahun}/{bulan}/{nomor}
  date: string; // YYYY-MM-DD
  type: ProjectSubmissionType;
  projectName: string;
  companyId: 'PT_TBL' | 'PT_BPP';
  rabAmount: number;
  status: ProjectSubmissionStatus;
  requester: string;
  requesterRole: RoleCode;
  location: string;
  notes: string;
  documents: { name: string; category: string; url: string }[];
  photos: string[];
  items: SubmissionRabItem[];
  approvalHistory: SubmissionHistoryEntry[];
  comments: SubmissionComment[];

  // Jenis 1: Pembelian Lahan Baru
  lahanData?: {
    lat: number;
    lng: number;
    landArea: number;
    ownerName: string;
    ownerPhone: string;
    usagePlan: string;
    targetAcquisitionDate: string;
    pricePerM2: number;
    totalLandPrice: number;
    bphtbAmount: number;
    notaryCost: number;
    measurementCost: number;
    certificationCost: number;
    nameTransferCost: number;
    landMaturationCost: number;
    permitCost: number;
    otherCost: number;
    paymentMethod: 'Cash' | 'Tempo' | 'Bank';
    installmentCount?: number;
    dueDate?: string;
    bankName?: string;
    tenorMonths?: number;
    acquisitionStage?: 'Menunggu Akuisisi' | 'Akuisisi' | 'Selesai';
  };

  // Jenis 2: Pembangunan Unit Baru
  unitData?: {
    blockAndNumbers: string;
    unitCount: number;
    unitType: '36/91' | '45/105' | '54/120' | '60/135' | 'Ruko 2 Lantai';
    landAreaPerUnit: number;
    buildingAreaPerUnit: number;
    startDate: string;
    endDate: string;
    picName: string;
    materialSubtotalPerUnit: number;
    wageSubtotalPerUnit: number;
    overheadPercent: number;
    profitPercent: number;
    rabPerUnitFinal: number;
    ppnPercent: number;
    fundingSource: 'Kas' | 'Bank' | 'Investor';
    disbursementSchedule: string;
    contractorPaymentScheme: string;
  };

  // Jenis 3: Pembangunan Fasum/Fasos
  fasumData?: {
    facilityCategory: 'Fasum' | 'Fasos';
    facilitySubType: string;
    volumeOrArea: string;
    technicalSpec: string;
    startDate: string;
    endDate: string;
    overheadPercent: number;
  };

  // Jenis 4: Renovasi/Perbaikan
  renovasiData?: {
    renovationLevel: 'Ringan' | 'Sedang' | 'Berat';
    damageDescription: string;
    targetCompletionDate: string;
    overheadPercent: number;
  };
}

export type ProspectSource = 'IG' | 'FB' | 'Website' | 'Referral' | 'Walk-in' | 'Lainnya';

export interface ProspectFollowUpLog {
  id: string;
  date: string;
  method: 'Telepon' | 'Email' | 'Kunjungan' | 'Tatap Muka';
  result: 'Positif' | 'Netral' | 'Negatif' | 'Tidak Direspon';
  notes?: string;
  nextFollowUpDate?: string;
  by: string;
}

export interface BookingRecord {
  id: string; // BKG-2026-0001 atau PRS-2026-10-0001
  prospectCode?: string; // PRS-2026-10-0001
  buyerName: string;
  nik: string;
  phone: string;
  email: string;
  companyId: 'PT_TBL' | 'PT_BPP';
  projectInterest?: 'Bahagia Land' | 'Bahagia Residence';
  source?: ProspectSource;
  kavlingId: string;
  kavlingCode: string;
  bank: 'BTN' | 'BRI' | 'Mandiri';
  bookingFee: number;
  price: number;
  stage: 'Prospek' | 'Follow-up' | 'Booking' | 'SPR' | 'Proses KPR' | 'Akad' | 'Selesai' | 'Lost';
  createdAt: string;
  marketingPic: string;
  address?: string;
  budget?: number;
  unitType?: string;
  notes?: string;
  leadScore?: number;
  lastFollowUpDate?: string;
  nextFollowUpDate?: string;
  followUpHistory?: ProspectFollowUpLog[];
}

export interface ComplaintRecord {
  id: string; // TKT-2026-0001
  reporterName: string;
  phone: string;
  kavlingCode: string;
  companyId: 'PT_TBL' | 'PT_BPP';
  category: string;
  description: string;
  status: 'Baru' | 'Diproses Pengawas' | 'Verifikasi PJT' | 'Selesai';
  assignedPic: string;
  createdAt: string;
  photos: string[];
}

export interface VerificationItem {
  id: string;
  type: 'RAB' | 'Progress' | 'Opname' | 'BAST';
  title: string;
  companyId: 'PT_TBL' | 'PT_BPP';
  kavlingOrArea: string;
  requester: string;
  amount: number;
  volumeSpec: string;
  status:
    | 'Menunggu Verifikasi PJT'
    | 'Menunggu Approval Direktur'
    | 'Approved Direktur'
    | 'Rejected PJT'
    | 'Rejected Direktur';
  technicalNotes: string;
  pjtVerifiedBy?: string;
  pjtVerifiedAt?: string;
  pjtSignatureHash?: string;
  directorApprovedBy?: string;
  directorApprovedAt?: string;
  createdAt: string;
}

export interface PurchaseOrderItem {
  materialName: string;
  unit: string;
  qty: number;
  unitPrice: number;
}

export interface PurchaseOrderRecord {
  id: string;
  companyId: 'PT_TBL' | 'PT_BPP';
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  discount: number;
  ppnPercent: number;
  shippingCost: number;
  subtotal: number;
  grandTotal: number;
  status: 'Menunggu Approval Direktur' | 'Approved' | 'Diterima Gudang' | 'Rejected';
  createdBy: string;
  createdAt: string;
}

export interface SupplierBankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountOwner: string;
  branchName?: string;
}

export interface SupplierRecord {
  id: string;
  code: string;
  name: string;
  picName?: string;
  category:
    | 'Material Toko'
    | 'Material Bumi'
    | 'Jasa'
    | 'Transportasi'
    | 'Baja & Atap'
    | 'Elektrikal & Plumbing'
    | 'Lainnya';
  supplierType?: 'Perorangan' | 'PT' | 'CV' | 'UD';
  phone: string;
  officePhone?: string;
  email?: string;
  website?: string;
  address: string;
  kelurahan?: string;
  kecamatan?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  landmark?: string;
  bankName: string;
  bankAccount: string;
  bankAccountOwner?: string;
  bankBranch?: string;
  additionalBanks?: SupplierBankAccount[];
  npwp?: string;
  tempoDays: number;
  creditLimit?: number;
  status?: 'Aktif' | 'Nonaktif';
  notes?: string;
  rating: number;
  logoUrl?: string;
  suppliedProducts?: {
    id: string;
    materialCode: string;
    materialName: string;
    unit: string;
    lastPrice: number;
    updatedAt: string;
  }[];
  createdAt?: string;
}

export interface InventoryRecord {
  id: string;
  code: string;
  name: string;
  materialCategory?: 'Toko' | 'Bumi';
  subCategory?: string;
  specOrBrand?: string;
  warehouse: string;
  rackLocation?: string;
  companyId: 'PT_TBL' | 'PT_BPP';
  initialStock?: number;
  stockInTotal?: number;
  stockOutTotal?: number;
  stock: number;
  minStock: number;
  maxStock?: number;
  unit: string;
  unitPrice: number;
  condition?: 'Baik' | 'Rusak Ringan' | 'Perlu Sortir';
  primarySupplierId?: string;
  primarySupplierName?: string;
  notes?: string;
  proofUrl?: string;
  status?: 'Aktif' | 'Nonaktif';
  updatedAt?: string;
}

export type StockMovementType =
  | 'SALDO_AWAL'
  | 'MASUK'
  | 'KELUAR'
  | 'OPNAME'
  | 'KOREKSI'
  | 'TRANSFER';

export interface StockMovementRecord {
  id: string;
  referenceNo: string; // MT-2026-0001 / SM-2026-10-0001 / SK-2026-10-0001 / OPN-2026-10-0001
  date: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  unit: string;
  companyId: 'PT_TBL' | 'PT_BPP';
  warehouse: string;
  movementType: StockMovementType;
  qtyIn: number;
  qtyOut: number;
  balanceAfter: number;
  unitPrice: number;
  totalValue: number;
  supplierId?: string;
  supplierName?: string;
  poOrInvoiceNo?: string;
  purposeType?: 'Proyek Unit' | 'Fasum' | 'Lainnya';
  unitBlockCode?: string;
  correctionReason?: 'Rusak' | 'Hilang' | 'Kadaluarsa' | 'Lainnya';
  description: string;
  proofUrl?: string;
  officerName: string;
  journalId?: string;
  createdAt: string;
}

export interface StockOpnameRowItem {
  materialId: string;
  materialCode: string;
  materialName: string;
  unit: string;
  systemStock: number;
  physicalStock: number;
  difference: number;
  unitPrice: number;
  differenceValue: number;
  notes: string;
}

export interface StockOpnameBatchRecord {
  id: string;
  opnameNo: string;
  date: string;
  companyId: 'PT_TBL' | 'PT_BPP';
  warehouse: string;
  officerName: string;
  signatureText: string;
  generalNotes: string;
  photoUrl?: string;
  items: StockOpnameRowItem[];
  totalDifferenceValue: number;
  journalId?: string;
  createdAt: string;
}

export interface AdminCrudActionLog {
  id: string;
  timestamp: string;
  adminName: string;
  adminEmail: string;
  actionType: 'TAMBAH' | 'EDIT' | 'KURANGI' | 'HAPUS' | 'RESET' | 'RESTORE';
  collectionName: string;
  targetId: string;
  beforeValue: string;
  afterValue: string;
  reason: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  companyId: 'PT_TBL' | 'PT_BPP';
  reference: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  autoGenerated: boolean;
}

export type CashTransactionType = 'KAS_MASUK' | 'KAS_KELUAR';

export type KasMasukSource =
  | 'Penjualan Unit (Cash/KPR)'
  | 'Booking Fee'
  | 'DP Konsumen'
  | 'Cicilan Konsumen'
  | 'Retensi'
  | 'SBUM'
  | 'Pinjaman Bank'
  | 'Setoran Modal'
  | 'Lain-lain';

export type KasKeluarPurpose =
  | 'Bayar Supplier'
  | 'Bayar Tukang/Mandor'
  | 'Bayar Gaji Karyawan'
  | 'Bayar Hutang Bank'
  | 'Bayar Pajak'
  | 'Bayar Operasional'
  | 'Bayar Fee Marketing'
  | 'Bayar Notaris/PPAT'
  | 'Bayar Lahan'
  | 'Lain-lain';

export interface CashTransactionHistory {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
}

export interface CashTransactionRecord {
  id: string; // KM-2026-10-0001 atau KK-2026-10-0001
  type: CashTransactionType;
  date: string; // YYYY-MM-DD
  companyId: 'PT_TBL' | 'PT_BPP';
  sourceOrPurpose: string;
  category: string;
  amount: number;
  cashAccount: string;
  counterAccount: string;
  debitAccount: string;
  creditAccount: string;
  description: string;
  proofUrl?: string;
  proofFileName?: string;
  consumerName?: string;
  unitCode?: string;
  supplierName?: string;
  employeeName?: string;
  journalId: string;
  createdBy: string;
  createdAt: string;
  history: CashTransactionHistory[];
}

export interface AttendanceRecord {
  id: string;
  employeeName: string;
  role: string;
  companyId: 'PT_TBL' | 'PT_BPP';
  timestamp: string;
  lat: number;
  lng: number;
  selfieDataUrl: string;
  status: 'Hadir Tepat Waktu' | 'Dinas Lapangan';
}

export interface EmailNotificationLog {
  id: string;
  eventNumber: number;
  eventName: string;
  recipient: string;
  subject: string;
  status: 'Terkirim via Trigger Email' | 'Dalam Antrean';
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  role: string;
  action: string;
  module: string;
  timestamp: string;
}

export interface RolePermissionMatrix {
  role: RoleCode;
  name: string;
  description: string;
  color: string;
  level: 'GRUP' | 'PT' | 'PUBLIK';
  permissions: Record<string, {
    lihat: boolean;
    tambah: boolean;
    edit: boolean;
    hapus: boolean;
    approve: boolean;
    export: boolean;
    print: boolean;
  }>;
}

const MODULES_9 = [
  'Dashboard',
  'HRM',
  'Marketing',
  'Project & PJT',
  'Gudang Logistik',
  'Purchasing',
  'Keuangan & COA',
  'Laporan',
  'Sistem Admin',
];

function buildDefaultPermissions(fullAccess: boolean, canApprove = false): RolePermissionMatrix['permissions'] {
  const map: RolePermissionMatrix['permissions'] = {};
  MODULES_9.forEach((mod) => {
    map[mod] = {
      lihat: true,
      tambah: fullAccess,
      edit: fullAccess,
      hapus: fullAccess,
      approve: canApprove || fullAccess,
      export: true,
      print: true,
    };
  });
  return map;
}

const INITIAL_ROLES: RolePermissionMatrix[] = [
  {
    role: 'DIREKTUR',
    name: 'Direktur Utama',
    description: 'Single Approval pengajuan > Rp1 Jt, RAB, target, dan konsolidasi 2 PT',
    color: '#10B981',
    level: 'GRUP',
    permissions: buildDefaultPermissions(false, true),
  },
  {
    role: 'ADMIN',
    name: 'Super Admin',
    description: 'Kontrol penuh CRUD semua modul, CMS Website, Katalog, dan Sistem',
    color: '#1F2937',
    level: 'GRUP',
    permissions: buildDefaultPermissions(true, true),
  },
  {
    role: 'PJT',
    name: 'Penanggung Jawab Teknis (PJT)',
    description: 'Verifikasi teknis RAB, Progress, Opname, Gambar Kerja, dan Tanda Tangan Digital BAST',
    color: '#059669',
    level: 'PT',
    permissions: buildDefaultPermissions(false, true),
  },
  {
    role: 'PENGAWAS',
    name: 'Pengawas & Purchasing',
    description: 'Input progress unit/fasum/fasos/lahan, susun RAB, SPK, Opname, PO Multi-Material & Supplier',
    color: '#2563EB',
    level: 'PT',
    permissions: buildDefaultPermissions(true, false),
  },
  {
    role: 'KEUANGAN',
    name: 'Keuangan & Pajak',
    description: 'Kelola COA, Jurnal Otomatis, Kas/Bank, Verifikasi < Rp1 Jt, Pembayaran & Pajak',
    color: '#0D9488',
    level: 'PT',
    permissions: buildDefaultPermissions(true, false),
  },
  {
    role: 'MARKETING',
    name: 'Marketing & KPR',
    description: 'Kelola Prospek, Sales Pipeline Kanban, Booking, SPR, Akad & Tiket Komplain',
    color: '#D97706',
    level: 'PT',
    permissions: buildDefaultPermissions(true, false),
  },
  {
    role: 'HRD',
    name: 'HRD & Payroll',
    description: 'Database Karyawan, Kontrak, Absensi Selfie + GPS, Payroll & Pinjaman',
    color: '#7C3AED',
    level: 'PT',
    permissions: buildDefaultPermissions(true, false),
  },
  {
    role: 'LOGISTIK',
    name: 'Logistik & Gudang',
    description: 'Kartu Stok, Material Request, Penerimaan Barang PO & Stok Opname',
    color: '#EA580C',
    level: 'PT',
    permissions: buildDefaultPermissions(true, false),
  },
];

interface AppState {
  currentUser: SeedUser | null;
  selectedCompanyFilter: 'ALL' | 'PT_TBL' | 'PT_BPP';
  darkMode: boolean;
  approvalLimit: number;
  maintenanceMode: boolean;
  announcementBanner: string;
  users: SeedUser[];
  roles: RolePermissionMatrix[];
  companies: CompanyInfo[];
  coa: CoaItem[];
  kavling: KavlingLot[];
  bookings: BookingRecord[];
  complaints: ComplaintRecord[];
  verifications: VerificationItem[];
  projectSubmissions: ProjectSubmissionRecord[];
  suppliers: SupplierRecord[];
  inventory: InventoryRecord[];
  stockMovements: StockMovementRecord[];
  stockOpnameBatches: StockOpnameBatchRecord[];
  purchaseOrders: PurchaseOrderRecord[];
  journals: JournalEntry[];
  cashTransactions: CashTransactionRecord[];
  attendance: AttendanceRecord[];
  emailLogs: EmailNotificationLog[];
  activityLogs: ActivityLog[];
  approvalNotifications: ApprovalNotificationItem[];
  adminCrudLogs: AdminCrudActionLog[];
  fasumList: typeof FASUM_16_TYPES;
  fasosList: typeof FASOS_4_TYPES;
  lahanList: typeof LAHAN_5_STAGES;
  trashItems: { id: string; collection: string; title: string; deletedAt: string }[];
  customFields: { id: string; module: string; label: string; fieldType: 'Text' | 'Number' | 'Date' }[];

  // SUPER ADMIN FULL CONTROL STATE
  editMode: boolean;
  editableTexts: Record<string, EditableTextItem>;
  photoSlots: EditablePhotoSlot[];
  cmsContent: CmsWebsiteContent;
  dataMaster: Record<string, DataMasterItem[]>;
  backupSnapshots: BackupSnapshotRecord[];
  autoBackupEnabled: boolean;
  syncedProjects: SyncedProjectRecord[];
  sitePlanConfigs: SitePlanConfigRecord[];
  lastResetTimestamp: number;

  // 3 SECTION BARU WEBSITE PUBLIK (TESTIMONI, GALERI & PROGRESS, BLOG/ARTIKEL)
  publicTestimonials: PublicTestimonialRecord[];
  testimonialSettings: TestimonialSectionSettings;
  galleryPhotos: GalleryProgressPhotoRecord[];
  projectPhysicalProgress: ProjectPhysicalProgressRecord[];
  gallerySettings: GallerySectionSettings;
  blogArticles: BlogArticleRecord[];
  blogSettings: BlogSectionSettings;

  // SECTION 1: TESTIMONI KONSUMEN ACTIONS
  savePublicTestimonial: (
    payload: Omit<PublicTestimonialRecord, 'id' | 'order'> & { id?: string; order?: number }
  ) => PublicTestimonialRecord;
  deletePublicTestimonial: (id: string) => void;
  toggleTestimonialStatus: (id: string) => void;
  toggleTestimonialFeatured: (id: string) => void;
  reorderPublicTestimonial: (id: string, direction: 'UP' | 'DOWN') => void;
  updateTestimonialSettings: (patch: Partial<TestimonialSectionSettings>) => void;
  resetTestimonialsData: (mode: 'CLEAR_ALL' | 'RESTORE_DEFAULT') => void;

  // SECTION 2: GALERI PEMBANGUNAN & PROGRESS FISIK ACTIONS
  saveGalleryPhoto: (
    payload: Omit<GalleryProgressPhotoRecord, 'id' | 'order'> & { id?: string; order?: number }
  ) => GalleryProgressPhotoRecord;
  bulkAddGalleryPhotos: (
    photos: { url: string; title?: string }[],
    meta: {
      category: string;
      projectName: string;
      unitBlock?: string;
      dateTaken: string;
      description: string;
      status: 'Aktif' | 'Nonaktif';
      isFeaturedOnHome: boolean;
    }
  ) => number;
  deleteGalleryPhoto: (id: string) => void;
  toggleGalleryPhotoStatus: (id: string) => void;
  toggleGalleryPhotoFeatured: (id: string) => void;
  reorderGalleryPhoto: (id: string, direction: 'UP' | 'DOWN') => void;
  updateProjectPhysicalProgress: (
    projectIdOrName: string,
    payload: {
      overallPercentage: number;
      stages: ProjectPhysicalProgressRecord['stages'];
    }
  ) => void;
  updateGallerySettings: (patch: Partial<GallerySectionSettings>) => void;
  resetGalleryAndProgressData: (
    mode: 'CLEAR_PHOTOS' | 'RESET_PROGRESS_ZERO' | 'RESTORE_DEFAULT'
  ) => void;

  // SECTION 3: ARTIKEL & BERITA (BLOG) ACTIONS
  saveBlogArticle: (
    payload: Omit<BlogArticleRecord, 'id' | 'slug' | 'viewsCount' | 'order'> & {
      id?: string;
      slug?: string;
      viewsCount?: number;
      order?: number;
    }
  ) => BlogArticleRecord;
  deleteBlogArticle: (id: string) => void;
  duplicateBlogArticle: (id: string) => BlogArticleRecord | null;
  toggleBlogArticleStatus: (id: string, status?: BlogArticleRecord['status']) => void;
  toggleBlogArticleFeatured: (id: string) => void;
  reorderBlogArticle: (id: string, direction: 'UP' | 'DOWN') => void;
  incrementBlogArticleViews: (slugOrId: string) => void;
  updateBlogSettings: (patch: Partial<BlogSectionSettings>) => void;
  resetBlogArticlesData: (mode: 'CLEAR_ALL' | 'RESTORE_DEFAULT') => void;

  // SITE PLAN & KAVLING SUPER ADMIN FULL CONTROL ACTIONS
  updateSitePlanImageConfig: (payload: {
    projectId: string;
    projectName?: string;
    companyId?: string;
    sourceFileName: string;
    imageUrl: string;
    resolution?: string;
    fileSizeText?: string;
  }) => void;
  resetSitePlanImageToDefault: (projectId: string) => void;
  updateSitePlanStatusColors: (
    projectId: string,
    colorsPatch: Partial<SitePlanConfigRecord['statusColors']>
  ) => void;
  toggleSitePlanGridOnPublic: (projectId: string) => void;
  saveKavlingLotFull: (
    payload: Omit<KavlingLot, 'id'> & { id?: string }
  ) => KavlingLot;
  updateKavlingOverlayCoords: (
    id: string,
    coords: NonNullable<KavlingLot['mapCoords']>
  ) => void;
  bulkUpdateKavlingLots: (
    ids: string[],
    patch: Partial<Pick<KavlingLot, 'status' | 'price' | 'hpp' | 'progress' | 'block' | 'type'>>
  ) => void;
  bulkAddKavlingRange: (payload: {
    companyId: 'PT_TBL' | 'PT_BPP';
    projectName: string;
    block: string;
    startNum: number;
    endNum: number;
    type: string;
    landSize: string;
    buildingSize: number;
    price: number;
    hpp: number;
    status: KavlingLot['status'];
  }) => number;
  resetProjectKavlingData: (
    projectName: string,
    mode: 'RESET_STATUS_ONLY' | 'DELETE_ALL_LOTS' | 'RESTORE_DEFAULT_SEED'
  ) => void;

  // AUTO-SYNC PROYEK / LOKASI BARU ACTIONS
  saveSyncedProject: (
    payload: Omit<SyncedProjectRecord, 'id' | 'slug' | 'previewToken' | 'stats' | 'history'> & {
      id?: string;
      slug?: string;
    },
    generateUnitsNow?: boolean
  ) => SyncedProjectRecord;
  toggleProjectPublishStatus: (
    id: string,
    targetStatus?: 'Published' | 'Nonaktif' | 'Unpublished' | 'Draft'
  ) => void;
  toggleProjectFeatured: (id: string) => void;
  duplicateSyncedProject: (id: string) => SyncedProjectRecord | null;
  deleteSyncedProjectSoft: (id: string, deleteUnitsToo?: boolean) => void;
  bulkUpdateSyncedProjects: (ids: string[], action: 'PUBLISH' | 'UNPUBLISH' | 'DELETE') => void;

  // SUPER ADMIN FULL CONTROL ACTIONS
  setEditMode: (enabled: boolean) => void;
  getText: (key: string, fallback: string) => string;
  updateEditableText: (key: string, newText: string, location?: string, category?: EditableTextItem['category']) => void;
  resetEditableText: (key: string) => void;
  revertEditableTextVersion: (key: string, versionIdx: number) => void;
  resetAllEditableTexts: () => void;
  updateCmsContent: (patch: Partial<CmsWebsiteContent>, tabName?: string) => void;
  addPhotoToSlot: (slotKey: string, url: string, caption: string, sizeKb?: number) => void;
  deletePhotoFromSlot: (slotKey: string, photoId: string) => void;
  setPrimaryPhotoInSlot: (slotKey: string, photoId: string) => void;
  reorderPhotoInSlot: (slotKey: string, fromIdx: number, toIdx: number) => void;
  resetPhotoSlot: (slotKey: string) => void;
  addDataMasterItem: (category: string, code: string, label: string) => void;
  updateDataMasterItem: (category: string, id: string, patch: Partial<DataMasterItem>) => void;
  deleteDataMasterItem: (category: string, id: string) => void;
  reorderDataMasterItem: (category: string, id: string, direction: 'UP' | 'DOWN') => void;
  addCompanyFull: (payload: Omit<CompanyInfo, 'id'> & { id?: string }) => void;
  deleteCompanySoft: (id: string) => void;
  duplicateCompany: (id: string) => void;
  updateUserFull: (id: string, patch: Partial<SeedUser>) => void;
  deleteUserSoft: (id: string, reason: string) => { ok: boolean; message: string };
  addRoleFull: (roleCode: string, level: string) => void;
  deleteRoleSoft: (roleCode: string) => void;
  duplicateRole: (roleCode: string) => void;
  createBackupSnapshot: (name?: string, type?: BackupSnapshotRecord['type']) => BackupSnapshotRecord;
  restoreBackupSnapshot: (id: string) => void;
  setAutoBackupEnabled: (v: boolean) => void;
  permanentDeleteTrashItem: (id: string) => void;
  revertAdminCrudLog: (logId: string) => void;

  // Actions
  loginWithSeed: (email: string, pass: string) => { ok: boolean; message: string };
  switchQuickRole: (userId: string) => void;
  logout: () => void;
  setCompanyFilter: (filter: 'ALL' | 'PT_TBL' | 'PT_BPP') => void;
  toggleDarkMode: () => void;
  setApprovalLimit: (limit: number) => void;

  // Bookings, Quick Prospects & Complaints
  addBooking: (payload: Omit<BookingRecord, 'id' | 'createdAt'>) => BookingRecord;
  addQuickProspect: (payload: {
    buyerName: string;
    phone: string;
    source: ProspectSource;
    projectInterest: 'Bahagia Land' | 'Bahagia Residence';
    marketingPic: string;
    email?: string;
    address?: string;
    budget?: number;
    unitType?: string;
    notes?: string;
  }) => BookingRecord;
  bulkAddProspects: (
    rows: {
      buyerName: string;
      phone: string;
      source: ProspectSource;
      projectInterest: 'Bahagia Land' | 'Bahagia Residence';
      notes?: string;
      email?: string;
      unitType?: string;
    }[],
    defaultPic: string
  ) => number;
  addProspectFollowUp: (
    id: string,
    payload: {
      method: 'Telepon' | 'Email' | 'Kunjungan' | 'Tatap Muka';
      result: 'Positif' | 'Netral' | 'Negatif' | 'Tidak Direspon';
      notes?: string;
      nextFollowUpDate: string;
    }
  ) => void;
  updateProspectDetails: (id: string, patch: Partial<BookingRecord>) => void;
  deleteProspect: (id: string) => void;
  updateBookingStage: (id: string, stage: BookingRecord['stage']) => void;
  addComplaint: (payload: Omit<ComplaintRecord, 'id' | 'createdAt' | 'status'>) => ComplaintRecord;
  updateComplaintStatus: (id: string, status: ComplaintRecord['status']) => void;
  deleteComplaint: (id: string) => void;

  // Kavling & Progress
  updateKavlingStatusAndProgress: (id: string, status: KavlingLot['status'], progress: number, notes?: string) => void;

  // PJT Verification & Single Approval to Director
  createVerificationSubmission: (payload: Omit<VerificationItem, 'id' | 'createdAt' | 'status'>) => void;
  pjtVerifyAction: (id: string, decision: 'OK' | 'REJECT', notes: string) => void;
  directorApproveAction: (id: string, decision: 'APPROVE' | 'REJECT', adjustedAmount?: number, notes?: string) => void;

  // Pengajuan Proyek Baru (Khusus PJT + Verifikasi Keuangan + Approval Direktur)
  saveProjectSubmission: (
    payload: Omit<ProjectSubmissionRecord, 'id' | 'submissionNumber' | 'approvalHistory' | 'comments'> & {
      id?: string;
      submissionNumber?: string;
    },
    submitForApproval: boolean
  ) => ProjectSubmissionRecord;
  verifyProjectSubmissionByFinance: (id: string, decision: 'OK' | 'REJECT', notes: string) => void;
  approveProjectSubmissionByDirector: (id: string, decision: 'APPROVE' | 'REJECT', notes: string) => void;
  addProjectSubmissionComment: (id: string, message: string) => void;
  updateSubmissionRealizationItem: (
    submissionId: string,
    itemId: string,
    realizedVolume: number,
    realizedAmount: number,
    itemStatus: 'Belum' | 'Proses' | 'Selesai'
  ) => void;
  advanceLahanAcquisitionStage: (submissionId: string, stage: 'Menunggu Akuisisi' | 'Akuisisi' | 'Selesai') => void;

  // Purchasing, PO & Gudang Logistik Lengkap
  addSupplier: (payload: Omit<SupplierRecord, 'id' | 'code'> & { id?: string; code?: string }) => SupplierRecord;
  saveSupplierFull: (
    payload: Omit<SupplierRecord, 'id' | 'code'> & { id?: string; code?: string }
  ) => SupplierRecord;
  deleteSupplierSoft: (id: string, reason?: string) => void;
  updateSupplierProductPrice: (
    supplierId: string,
    materialCode: string,
    materialName: string,
    unit: string,
    newPrice: number
  ) => void;
  createPurchaseOrder: (payload: Omit<PurchaseOrderRecord, 'id' | 'createdAt' | 'status'>) => void;
  approvePurchaseOrder: (id: string, decision: 'Approved' | 'Rejected') => void;

  // Kartu Stok, Input Stok Awal Manual, Stok Masuk, Stok Keluar, Stok Opname, Koreksi
  recordInitialStockManual: (payload: {
    date: string;
    companyId: 'PT_TBL' | 'PT_BPP';
    warehouse: string;
    materialCategory: 'Toko' | 'Bumi';
    existingMaterialId?: string;
    materialCode?: string;
    materialName: string;
    unit: string;
    initialStock: number;
    minStock: number;
    unitPrice: number;
    description: string;
    proofUrl?: string;
  }) => InventoryRecord;
  recordStockInTransaction: (payload: {
    date: string;
    companyId: 'PT_TBL' | 'PT_BPP';
    warehouse: string;
    materialId: string;
    qtyIn: number;
    unitPrice: number;
    supplierId?: string;
    supplierName?: string;
    poOrInvoiceNo?: string;
    description: string;
    proofUrl?: string;
  }) => StockMovementRecord | null;
  recordStockOutTransaction: (payload: {
    date: string;
    companyId: 'PT_TBL' | 'PT_BPP';
    warehouse: string;
    materialId: string;
    qtyOut: number;
    purposeType: 'Proyek Unit' | 'Fasum' | 'Lainnya';
    unitBlockCode?: string;
    description: string;
    proofUrl?: string;
  }) => { ok: boolean; message: string; movement?: StockMovementRecord };
  recordStockOpnameBatch: (payload: {
    date: string;
    companyId: 'PT_TBL' | 'PT_BPP';
    warehouse: string;
    officerName: string;
    signatureText: string;
    generalNotes: string;
    photoUrl?: string;
    items: {
      materialId: string;
      physicalStock: number;
      notes: string;
    }[];
  }) => StockOpnameBatchRecord;
  updateInventoryMasterInfo: (
    id: string,
    patch: {
      name: string;
      unit: string;
      minStock: number;
      materialCategory?: 'Toko' | 'Bumi';
      notes?: string;
      unitPrice?: number;
    }
  ) => void;
  reduceStockWithReason: (payload: {
    materialId: string;
    qtyReduce: number;
    reasonCategory: 'Rusak' | 'Hilang' | 'Kadaluarsa' | 'Lainnya';
    notes: string;
  }) => { ok: boolean; message: string };
  deleteInventoryItemSoft: (id: string, reason: string) => void;
  updateStockMovementEntry: (
    movementId: string,
    patch: { qtyIn?: number; qtyOut?: number; unitPrice?: number; description?: string; date?: string }
  ) => void;
  deleteStockMovementEntry: (movementId: string, reason: string) => void;
  bulkImportInventoryItems: (
    rows: {
      code?: string;
      name: string;
      warehouse: string;
      companyId: 'PT_TBL' | 'PT_BPP';
      materialCategory: 'Toko' | 'Bumi';
      unit: string;
      initialStock: number;
      minStock: number;
      unitPrice: number;
      notes?: string;
    }[]
  ) => number;

  // Finance, Kas Masuk, Kas Keluar, Buku Kas & COA CRUD (Unlocked)
  addJournalEntry: (payload: Omit<JournalEntry, 'id' | 'date'> & { date?: string }) => void;
  updateJournalEntry: (id: string, patch: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  saveCashTransaction: (
    payload: Omit<
      CashTransactionRecord,
      'id' | 'debitAccount' | 'creditAccount' | 'journalId' | 'createdAt' | 'history'
    > & { id?: string }
  ) => CashTransactionRecord;
  deleteCashTransaction: (id: string) => void;
  duplicateCashTransaction: (id: string) => CashTransactionRecord | null;
  addCoaAccount: (payload: CoaItem) => void;
  saveCoaAccountFull: (payload: CoaItem, originalCode?: string) => { ok: boolean; message: string };
  deleteCoaAccount: (code: string, migrateToAccount?: string) => { ok: boolean; message: string };
  toggleCoaActive: (code: string) => void;
  bulkImportCoa: (items: CoaItem[]) => number;

  // HRM Attendance
  addAttendance: (payload: Omit<AttendanceRecord, 'id' | 'timestamp'>) => void;

  // Admin CRUD
  addUser: (payload: Omit<SeedUser, 'id'>) => void;
  toggleUserActive: (id: string) => void;
  updateCompany: (id: 'PT_TBL' | 'PT_BPP', patch: Partial<CompanyInfo>) => void;
  toggleRolePermission: (role: RoleCode, moduleName: string, actionKey: keyof RolePermissionMatrix['permissions'][string]) => void;
  selectAllModulePermissions: (role: RoleCode, moduleName: string) => void;
  addCustomField: (module: string, label: string, fieldType: 'Text' | 'Number' | 'Date') => void;
  softDeleteItem: (id: string, collection: string, title: string) => void;
  restoreTrashItem: (id: string) => void;

  // Super Admin Full Control (Tambah, Edit, Kurangi, Hapus, Reset, COA Protected)
  addKavlingUnit: (payload: {
    companyId: 'PT_TBL' | 'PT_BPP';
    block: 'A' | 'B' | 'C' | 'D';
    code: string;
    type: string;
    price: number;
    hpp: number;
  }) => void;
  addInventoryItem: (payload: Omit<InventoryRecord, 'id'>) => void;
  updateCoaAccount: (code: string, patch: { name?: string; balance?: number; reason?: string }) => void;
  adjustNumericData: (payload: {
    collectionKey: string;
    targetId: string;
    delta: number;
    reason: string;
    mode: 'DELTA' | 'SET';
  }) => void;
  deleteRecordsFromCollection: (collectionKey: string, ids: string[], hardDelete: boolean) => void;
  resetSelectedCollections: (collectionKeys: string[], autoBackup?: boolean) => void;
  restoreInitialDemoData: () => void;

  // LIVE DEPLOY & REAL-TIME PRESENTATION SYNC
  lastDeployedAt: string;
  lastDeployedVersion: number;
  lastDeployedBy: string;
  deployAndPublishLiveState: () => Promise<LiveDeployResult>;
  applyRemotePublishedState: (
    remoteState: Record<string, any>,
    version: number,
    publishedAt: string,
    publishedBy: string
  ) => void;

  // REAL-TIME FIRESTORE APPROVAL NOTIFICATIONS
  addApprovalNotification: (
    payload: Omit<ApprovalNotificationItem, 'id' | 'isRead' | 'createdBy' | 'createdAt' | 'updatedAt'> & {
      id?: string;
    }
  ) => ApprovalNotificationItem;
  markApprovalNotificationRead: (id: string) => void;
  markAllApprovalNotificationsReadForRole: (role?: string) => void;
  setApprovalNotificationsFromFirestore: (items: ApprovalNotificationItem[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null, // Wajib login terlebih dahulu untuk mengakses route ERP
      selectedCompanyFilter: 'ALL',
      darkMode: false,
      approvalLimit: 1000000,
      maintenanceMode: false,
      announcementBanner: 'TARGET KONSOLIDASI Q4: Percepatan Akad KPR FLPP Bank BTN, BRI & Mandiri untuk 122 Unit Bahagia Group Property.',
      users: SEED_USERS,
      roles: INITIAL_ROLES,
      companies: INITIAL_COMPANIES,
      coa: INITIAL_COA,
      kavling: generateInitialKavling(),
      sitePlanConfigs: INITIAL_SITE_PLAN_CONFIGS,
      fasumList: FASUM_16_TYPES,
      fasosList: FASOS_4_TYPES,
      lahanList: LAHAN_5_STAGES,
      trashItems: [
        { id: 'del-01', collection: 'prospek', title: 'Prospek Duplikat - Budi (0812xxx)', deletedAt: '2026-10-05 14:20' },
      ],
      customFields: [
        { id: 'cf-1', module: 'Marketing - SPR', label: 'Nomor Subsidi SiKumbang', fieldType: 'Text' },
        { id: 'cf-2', module: 'Project - RAB', label: 'Indeks Kemahalan Konstruksi (IKK)', fieldType: 'Number' },
      ],

      bookings: [
        {
          id: 'PRS-2026-10-0001',
          prospectCode: 'PRS-2026-10-0001',
          buyerName: 'Rizky Pratama Kendari',
          nik: '-',
          phone: '081241889900',
          email: 'rizky.kendari@gmail.com',
          companyId: 'PT_TBL',
          projectInterest: 'Bahagia Land',
          source: 'IG',
          kavlingId: 'TBL-A-12',
          kavlingCode: 'A-12',
          bank: 'BTN',
          bookingFee: 0,
          price: 169000000,
          stage: 'Prospek',
          createdAt: '2026-10-09 08:30',
          marketingPic: 'Andi Saputra',
          unitType: '36/91',
          budget: 169000000,
          notes: 'Tertarik promo bebas biaya akad dari iklan Instagram.',
          leadScore: 80,
          lastFollowUpDate: '2026-10-09',
          nextFollowUpDate: '2026-10-09',
          followUpHistory: [
            {
              id: 'fu-1',
              date: '2026-10-09 08:45',
              method: 'Telepon',
              result: 'Positif',
              notes: 'Siap cek lokasi sore ini jam 16.00 WITA.',
              nextFollowUpDate: '2026-10-09',
              by: 'Andi Saputra',
            },
          ],
        },
        {
          id: 'PRS-2026-10-0002',
          prospectCode: 'PRS-2026-10-0002',
          buyerName: 'Hj. Darmawati Konawe',
          nik: '-',
          phone: '081342776655',
          email: 'darmawati.kdi@gmail.com',
          companyId: 'PT_BPP',
          projectInterest: 'Bahagia Residence',
          source: 'Walk-in',
          kavlingId: 'BPP-A-08',
          kavlingCode: 'A-08',
          bank: 'BRI',
          bookingFee: 0,
          price: 169000000,
          stage: 'Prospek',
          createdAt: '2026-10-09 09:15',
          marketingPic: 'Fajar Ramadhan',
          unitType: '36/91',
          budget: 170000000,
          notes: 'Datang langsung ke kantor pemasaran, cari rumah untuk anak.',
          leadScore: 92,
          lastFollowUpDate: '2026-10-09',
          nextFollowUpDate: '2026-10-09',
          followUpHistory: [],
        },
        {
          id: 'PRS-2026-10-0003',
          prospectCode: 'PRS-2026-10-0003',
          buyerName: 'Muh. Ilham Saputra (Perlu Follow-up >7 Hari)',
          nik: '-',
          phone: '085240112233',
          email: 'ilham.saputra@gmail.com',
          companyId: 'PT_TBL',
          projectInterest: 'Bahagia Land',
          source: 'FB',
          kavlingId: 'TBL-B-09',
          kavlingCode: 'B-09',
          bank: 'BTN',
          bookingFee: 0,
          price: 169000000,
          stage: 'Prospek',
          createdAt: '2026-09-28 11:00',
          marketingPic: 'Andi Saputra',
          unitType: '36/91',
          notes: 'Belum dihubungi kembali sejak akhir bulan lalu (>7 hari).',
          leadScore: 72,
          lastFollowUpDate: '2026-09-28',
          nextFollowUpDate: '2026-10-09',
          followUpHistory: [],
        },
        {
          id: 'PRS-2026-09-0004',
          prospectCode: 'PRS-2026-09-0004',
          buyerName: 'Bambang Sudirman (>30 Hari Otomatis Lost)',
          nik: '-',
          phone: '082144556677',
          email: '',
          companyId: 'PT_TBL',
          projectInterest: 'Bahagia Land',
          source: 'Website',
          kavlingId: 'TBL-D-09',
          kavlingCode: 'D-09',
          bank: 'BTN',
          bookingFee: 0,
          price: 169000000,
          stage: 'Lost',
          createdAt: '2026-08-25 14:10',
          marketingPic: 'Andi Saputra',
          unitType: '36/91',
          notes: 'Lebih dari 30 hari tidak merespon panggilan telepon.',
          leadScore: 55,
          lastFollowUpDate: '2026-08-25',
          nextFollowUpDate: '2026-09-01',
          followUpHistory: [],
        },
        {
          id: 'BKG-2026-0001',
          prospectCode: 'PRS-2026-10-0005',
          buyerName: 'La Ode Muhammad Akbar',
          nik: '7471041205940001',
          phone: '081245678901',
          email: 'akbar.kendari@gmail.com',
          companyId: 'PT_TBL',
          projectInterest: 'Bahagia Land',
          source: 'Referral',
          kavlingId: 'TBL-C-01',
          kavlingCode: 'C-01',
          bank: 'BTN',
          bookingFee: 2000000,
          price: 169000000,
          stage: 'Booking',
          createdAt: '2026-10-01 10:15',
          marketingPic: 'Andi Saputra',
          leadScore: 90,
          lastFollowUpDate: '2026-10-08',
          nextFollowUpDate: '2026-10-09',
        },
        {
          id: 'BKG-2026-0002',
          prospectCode: 'PRS-2026-10-0006',
          buyerName: 'Wa Ode Siti Nurhaliza',
          nik: '7471084509960002',
          phone: '081340981122',
          email: 'sitinurhaliza.kdi@gmail.com',
          companyId: 'PT_TBL',
          projectInterest: 'Bahagia Land',
          source: 'IG',
          kavlingId: 'TBL-B-14',
          kavlingCode: 'B-14',
          bank: 'BRI',
          bookingFee: 2000000,
          price: 169000000,
          stage: 'Proses KPR',
          createdAt: '2026-10-02 14:30',
          marketingPic: 'Andi Saputra',
          leadScore: 85,
          lastFollowUpDate: '2026-10-07',
          nextFollowUpDate: '2026-10-10',
        },
        {
          id: 'BKG-2026-0003',
          prospectCode: 'PRS-2026-10-0007',
          buyerName: 'Syahrul Gunawan Konawe',
          nik: '7405011902920003',
          phone: '085241778899',
          email: 'syahrul.ranomeeto@gmail.com',
          companyId: 'PT_BPP',
          projectInterest: 'Bahagia Residence',
          source: 'Walk-in',
          kavlingId: 'BPP-A-10',
          kavlingCode: 'A-10',
          bank: 'BTN',
          bookingFee: 2000000,
          price: 169000000,
          stage: 'SPR',
          createdAt: '2026-10-04 09:45',
          marketingPic: 'Fajar Ramadhan',
          leadScore: 95,
          lastFollowUpDate: '2026-10-08',
          nextFollowUpDate: '2026-10-11',
        },
        {
          id: 'BKG-2026-0004',
          prospectCode: 'PRS-2026-10-0008',
          buyerName: 'Nurul Hidayah, S.Pd.',
          nik: '7471026111950004',
          phone: '082199004455',
          email: 'nurul.guru@gmail.com',
          companyId: 'PT_BPP',
          projectInterest: 'Bahagia Residence',
          source: 'Referral',
          kavlingId: 'BPP-A-05',
          kavlingCode: 'A-05',
          bank: 'Mandiri',
          bookingFee: 2000000,
          price: 169000000,
          stage: 'Akad',
          createdAt: '2026-10-05 11:20',
          marketingPic: 'Fajar Ramadhan',
          leadScore: 98,
          lastFollowUpDate: '2026-10-08',
          nextFollowUpDate: '2026-10-12',
        },
        {
          id: 'BKG-2026-0005',
          prospectCode: 'PRS-2026-10-0009',
          buyerName: 'Hendra Saputra Jaya',
          nik: '7471091808910005',
          phone: '08114055667',
          email: 'hendra.jaya@gmail.com',
          companyId: 'PT_TBL',
          projectInterest: 'Bahagia Land',
          source: 'FB',
          kavlingId: 'TBL-D-02',
          kavlingCode: 'D-02',
          bank: 'BTN',
          bookingFee: 2000000,
          price: 169000000,
          stage: 'Follow-up',
          createdAt: '2026-10-06 16:05',
          marketingPic: 'Andi Saputra',
          leadScore: 78,
          lastFollowUpDate: '2026-10-06',
          nextFollowUpDate: '2026-10-09',
        },
      ],

      complaints: [
        {
          id: 'TKT-2026-0001',
          reporterName: 'Keluarga Konsumen A-04',
          phone: '081240001122',
          kavlingCode: 'A-04',
          companyId: 'PT_TBL',
          category: 'Plumbing & Air Bersih',
          description: 'Tekanan keran air kamar mandi agak kecil, mohon pengecekan sambungan pipa depan.',
          status: 'Diproses Pengawas',
          assignedPic: 'Budi Santoso, S.T.',
          createdAt: '2026-10-04 08:30',
          photos: [],
        },
        {
          id: 'TKT-2026-0002',
          reporterName: 'Keluarga Prima A-02',
          phone: '081355667788',
          kavlingCode: 'A-02',
          companyId: 'PT_BPP',
          category: 'Finishing Cat & Nat Keramik',
          description: 'Permintaan touch-up cat dinding teras depan sebelum serah terima kunci.',
          status: 'Verifikasi PJT',
          assignedPic: 'Agus Setiawan, S.T.',
          createdAt: '2026-10-06 13:15',
          photos: [],
        },
      ],

      verifications: [
        {
          id: 'VER-RAB-2026-01',
          type: 'RAB',
          title: 'RAB Pembangunan 10 Unit Blok C Perumahan Bahagia Land (HPP Rp67.651.710/unit)',
          companyId: 'PT_TBL',
          kavlingOrArea: 'Blok C (C-01 s/d C-10)',
          requester: 'Budi Santoso, S.T. (Pengawas)',
          amount: 676517100,
          volumeSpec: '10 Unit Tipe 36/91 (7x13m) · Struktur Beton Bertulang SNI',
          status: 'Menunggu Approval Direktur',
          technicalNotes: 'Spesifikasi teknis, volume material, dan harga satuan wajar sesuai standar FLPP.',
          pjtVerifiedBy: 'Ir. Lukman Hakim, S.T., IPM',
          pjtVerifiedAt: '2026-10-06 15:20',
          pjtSignatureHash: 'SIG-PJT-TBL-98A42F1C',
          createdAt: '2026-10-05 09:00',
        },
        {
          id: 'VER-RAB-2026-02',
          type: 'RAB',
          title: 'RAB Pasangan Bata Merah & Plafon 4m Blok A (5 Unit) Bahagia Residence',
          companyId: 'PT_BPP',
          kavlingOrArea: 'Blok A (A-15 s/d A-19)',
          requester: 'Agus Setiawan, S.T. (Pengawas)',
          amount: 338258550,
          volumeSpec: '5 Unit Tipe 36/91 · Bata Merah Penuh · Plafon Tinggi 4m',
          status: 'Menunggu Verifikasi PJT',
          technicalNotes: 'Menunggu pemeriksaan detail gambar kerja dan perhitungan bata merah oleh PJT.',
          createdAt: '2026-10-07 08:15',
        },
        {
          id: 'VER-OPN-2026-03',
          type: 'Opname',
          title: 'Opname Upah Mandor Pak Ruslan - Pekerjaan Struktur & Atap Blok B',
          companyId: 'PT_TBL',
          kavlingOrArea: 'Blok B (B-13 s/d B-18)',
          requester: 'Budi Santoso, S.T. (Pengawas)',
          amount: 42500000,
          volumeSpec: 'Progress fisik 75% tercapai · 6 Unit Struktur & Rangka Baja Ringan',
          status: 'Menunggu Approval Direktur',
          technicalNotes: 'Hasil opname lapangan valid. Sambungan baut baja ringan sudah sesuai.',
          pjtVerifiedBy: 'Ir. Lukman Hakim, S.T., IPM',
          pjtVerifiedAt: '2026-10-07 10:05',
          pjtSignatureHash: 'SIG-PJT-TBL-44B89E02',
          createdAt: '2026-10-06 17:00',
        },
        {
          id: 'VER-PRG-2026-04',
          type: 'Progress',
          title: 'Verifikasi Progress Fisik 90% Unit BPP-A-11 & BPP-A-12',
          companyId: 'PT_BPP',
          kavlingOrArea: 'Kavling A-11 & A-12',
          requester: 'Agus Setiawan, S.T. (Pengawas)',
          amount: 0,
          volumeSpec: 'Checklist 10/11 selesai · Tinggal pembersihan akhir & sanitair',
          status: 'Menunggu Verifikasi PJT',
          technicalNotes: 'Foto dokumentasi terlampir, mohon validasi PJT.',
          createdAt: '2026-10-07 11:30',
        },
        {
          id: 'VER-BAST-2026-05',
          type: 'BAST',
          title: 'Berita Acara Serah Terima (BAST) Kunci Unit TBL-A-18',
          companyId: 'PT_TBL',
          kavlingOrArea: 'Kavling A-18',
          requester: 'Budi Santoso, S.T. (Pengawas)',
          amount: 169000000,
          volumeSpec: 'Progress 100% · Listrik 1300W & Air Bersih Aktif · Siap Huni',
          status: 'Approved Direktur',
          technicalNotes: 'Inspeksi akhir PJT lulus 100%. Layak serah terima ke konsumen.',
          pjtVerifiedBy: 'Ir. Lukman Hakim, S.T., IPM',
          pjtVerifiedAt: '2026-10-04 14:00',
          pjtSignatureHash: 'SIG-PJT-TBL-77D12C9A',
          directorApprovedBy: 'Ir. H. Ahmad Bahagia, M.M.',
          directorApprovedAt: '2026-10-04 16:45',
          createdAt: '2026-10-04 10:00',
        },
      ],

      projectSubmissions: [
        {
          id: 'PPJ-UNIT-2026-10-0001',
          submissionNumber: 'PPJ/UNIT/2026/10/0001',
          date: '2026-10-02',
          type: 'UNIT',
          projectName: 'Pembangunan 10 Unit Rumah Subsidi Blok D (Tipe 36/91)',
          companyId: 'PT_TBL',
          rabAmount: 676517100,
          status: 'Approved',
          requester: 'Ir. Lukman Hakim, S.T., IPM',
          requesterRole: 'PJT',
          location: 'Blok D (Kavling D-01 s/d D-10) Perumahan Bahagia Land',
          notes: 'Pembangunan 10 unit rumah subsidi standar FLPP dengan spesifikasi dinding bata plester aci dan rangka atap baja ringan SNI.',
          documents: [
            { name: 'Gambar_Kerja_Tipe_36_91_Blok_D.pdf', category: 'Gambar Kerja / Denah', url: '#' },
            { name: 'Spesifikasi_Teknis_SNI_FLPP.pdf', category: 'Spesifikasi Teknis', url: '#' },
            { name: 'RAB_Detail_10_Unit_Blok_D.xlsx', category: 'RAB Excel', url: '#' },
          ],
          photos: [],
          items: [
            {
              id: 'itm-u-1',
              category: 'Material',
              description: 'Semen Tonasa 50 Kg (50 sak/unit × 10 unit)',
              volume: 500,
              realizedVolume: 485,
              unit: 'Sak',
              unitPrice: 75000,
              subtotal: 37500000,
              realizedAmount: 36375000,
              itemStatus: 'Selesai',
            },
            {
              id: 'itm-u-2',
              category: 'Material',
              description: 'Besi Beton Polos 10mm Full SNI (40 btg/unit × 10 unit)',
              volume: 400,
              realizedVolume: 390,
              unit: 'Batang',
              unitPrice: 87500,
              subtotal: 35000000,
              realizedAmount: 34125000,
              itemStatus: 'Selesai',
            },
            {
              id: 'itm-u-3',
              category: 'Material',
              description: 'Pasir, Batu Kali, Bata Merah, Baja Ringan, Keramik & Sanitair (10 Unit)',
              volume: 10,
              realizedVolume: 8,
              unit: 'Paket Unit',
              unitPrice: 36401710,
              subtotal: 364017100,
              realizedAmount: 291213680,
              itemStatus: 'Proses',
            },
            {
              id: 'itm-u-4',
              category: 'Upah',
              description: 'Upah Pekerjaan Pondasi & Struktur Beton (10 Unit)',
              volume: 10,
              realizedVolume: 10,
              unit: 'Unit',
              unitPrice: 8500000,
              subtotal: 85000000,
              realizedAmount: 85000000,
              itemStatus: 'Selesai',
            },
            {
              id: 'itm-u-5',
              category: 'Upah',
              description: 'Upah Pasangan Dinding, Atap, Plafon, Keramik & Finishing (10 Unit)',
              volume: 10,
              realizedVolume: 7.5,
              unit: 'Unit',
              unitPrice: 15500000,
              subtotal: 155000000,
              realizedAmount: 116250000,
              itemStatus: 'Proses',
            },
          ],
          approvalHistory: [
            {
              id: 'hst-1',
              actorName: 'Ir. Lukman Hakim, S.T., IPM',
              actorRole: 'PJT',
              action: 'Submit Pengajuan Proyek & RAB Baru',
              notes: 'Perhitungan HPP Rp67.651.710/unit × 10 unit sesuai pagu teknis.',
              timestamp: '2026-10-02 09:30',
            },
            {
              id: 'hst-2',
              actorName: 'Siti Rahmawati, S.E.',
              actorRole: 'KEUANGAN',
              action: 'Verifikasi Keuangan OK',
              notes: 'Ketersediaan dana KYG Bank BTN & Kas PT TBL mencukupi.',
              timestamp: '2026-10-03 11:15',
            },
            {
              id: 'hst-3',
              actorName: 'Ir. H. Ahmad Bahagia, M.M.',
              actorRole: 'DIREKTUR',
              action: 'Approved Direktur',
              notes: 'Disetujui untuk segera diterbitkan SPK oleh Pengawas.',
              timestamp: '2026-10-03 16:00',
            },
          ],
          comments: [
            {
              id: 'cmt-1',
              authorName: 'Ir. Lukman Hakim, S.T., IPM',
              authorRole: 'PJT',
              message: 'Mohon Keuangan cek alokasi pencairan termin pertama 30%.',
              timestamp: '2026-10-02 09:35',
            },
            {
              id: 'cmt-2',
              authorName: 'Siti Rahmawati, S.E.',
              authorRole: 'KEUANGAN',
              message: 'Sudah diverifikasi, pos anggaran COA 1-3300 Bangunan Dalam Penyelesaian siap.',
              timestamp: '2026-10-03 11:16',
            },
          ],
          unitData: {
            blockAndNumbers: 'Blok D (Nomor D-01 s/d D-10)',
            unitCount: 10,
            unitType: '36/91',
            landAreaPerUnit: 91,
            buildingAreaPerUnit: 36,
            startDate: '2026-10-05',
            endDate: '2026-12-20',
            picName: 'Ir. Lukman Hakim, S.T., IPM',
            materialSubtotalPerUnit: 43651710,
            wageSubtotalPerUnit: 24000000,
            overheadPercent: 0,
            profitPercent: 0,
            rabPerUnitFinal: 67651710,
            ppnPercent: 0,
            fundingSource: 'Bank',
            disbursementSchedule: 'Termin 1 (30% Pondasi), Termin 2 (40% Atap), Termin 3 (30% BAST)',
            contractorPaymentScheme: 'Opname Mingguan Mandor Berdasarkan Bobot Fisik',
          },
        },
        {
          id: 'PPJ-LAHAN-2026-10-0001',
          submissionNumber: 'PPJ/LAHAN/2026/10/0001',
          date: '2026-10-05',
          type: 'LAHAN',
          projectName: 'Akuisisi Lahan Bahagia Residence Tahap 2 (Ranomeeto)',
          companyId: 'PT_BPP',
          rabAmount: 1485000000,
          status: 'Menunggu Verifikasi Keuangan',
          requester: 'Ir. Hasanuddin, S.T., M.T.',
          requesterRole: 'PJT',
          location: 'Jl. Poros Bandara Haluoleo KM 14, Ranomeeto, Konawe Selatan',
          notes: 'Lahan datar bebas banjir, bersebelahan langsung dengan Blok A eksisting Bahagia Residence.',
          documents: [
            { name: 'SHM_Induk_Pemilik_Ranomeeto.pdf', category: 'Sertifikat Lahan', url: '#' },
            { name: 'Peta_Situasi_BPN_5000m2.jpg', category: 'Gambar Situasi', url: '#' },
            { name: 'Surat_Penawaran_Harga_H_Darwis.pdf', category: 'Surat Penawaran Pemilik', url: '#' },
          ],
          photos: [],
          items: [
            {
              id: 'itm-l-1',
              category: 'Biaya Lahan',
              description: 'Harga Pokok Pembelian Tanah (5.000 m² × Rp250.000/m²)',
              volume: 5000,
              realizedVolume: 0,
              unit: 'm²',
              unitPrice: 250000,
              subtotal: 1250000000,
              realizedAmount: 0,
              itemStatus: 'Belum',
            },
            {
              id: 'itm-l-2',
              category: 'Biaya Lahan',
              description: 'BPHTB 5%, Notaris/PPAT, Pengukuran BPN, Sertifikasi & Balik Nama',
              volume: 1,
              realizedVolume: 0,
              unit: 'Paket Legal',
              unitPrice: 125000000,
              subtotal: 125000000,
              realizedAmount: 0,
              itemStatus: 'Belum',
            },
            {
              id: 'itm-l-3',
              category: 'Biaya Lahan',
              description: 'Pematangan Lahan (Land Clearing & Urugan) + Perizinan',
              volume: 1,
              realizedVolume: 0,
              unit: 'Paket Teknis',
              unitPrice: 110000000,
              subtotal: 110000000,
              realizedAmount: 0,
              itemStatus: 'Belum',
            },
          ],
          approvalHistory: [
            {
              id: 'hst-l-1',
              actorName: 'Ir. Hasanuddin, S.T., M.T.',
              actorRole: 'PJT',
              action: 'Submit Pengajuan Pembelian Lahan Baru',
              notes: 'Hasil ukur patok batas dan uji kontur tanah layak untuk 38 kavling baru.',
              timestamp: '2026-10-05 14:10',
            },
          ],
          comments: [
            {
              id: 'cmt-l-1',
              authorName: 'Ir. Hasanuddin, S.T., M.T.',
              authorRole: 'PJT',
              message: 'Pembayaran diusulkan skema Tempo 3 kali cicilan selama 6 bulan.',
              timestamp: '2026-10-05 14:12',
            },
          ],
          lahanData: {
            lat: -4.0645,
            lng: 122.4695,
            landArea: 5000,
            ownerName: 'H. Muhammad Darwis',
            ownerPhone: '081241889900',
            usagePlan: 'Pengembangan Perumahan Bahagia Residence Tahap 2 (38 Unit Rumah Subsidi)',
            targetAcquisitionDate: '2026-11-15',
            pricePerM2: 250000,
            totalLandPrice: 1250000000,
            bphtbAmount: 50000000,
            notaryCost: 25000000,
            measurementCost: 10000000,
            certificationCost: 25000000,
            nameTransferCost: 15000000,
            landMaturationCost: 75000000,
            permitCost: 25000000,
            otherCost: 10000000,
            paymentMethod: 'Tempo',
            installmentCount: 3,
            dueDate: '2027-04-15',
            acquisitionStage: 'Menunggu Akuisisi',
          },
        },
        {
          id: 'PPJ-FASUM-2026-10-0001',
          submissionNumber: 'PPJ/FASUM/2026/10/0001',
          date: '2026-10-06',
          type: 'FASUM',
          projectName: 'Pembangunan Masjid Al-Ikhlas & Taman RTH Kompleks',
          companyId: 'PT_TBL',
          rabAmount: 242000000,
          status: 'Menunggu Approval Direktur',
          requester: 'Ir. Lukman Hakim, S.T., IPM',
          requesterRole: 'PJT',
          location: 'Area Fasum Tengah Blok B-C Perumahan Bahagia Land',
          notes: 'Kapasitas 200 jamaah lengkap tempat wudhu dan lansekap taman bermain anak.',
          documents: [
            { name: 'Desain_3D_dan_DED_Masjid_Al_Ikhlas.pdf', category: 'Gambar Desain', url: '#' },
            { name: 'RAB_Fasum_Masjid_2026.xlsx', category: 'RAB Excel', url: '#' },
          ],
          photos: [],
          items: [
            {
              id: 'itm-f-1',
              category: 'Pekerjaan Fasum',
              description: 'Pekerjaan Pondasi Footplat & Batu Kali',
              volume: 1,
              realizedVolume: 1,
              unit: 'Ls',
              unitPrice: 45000000,
              subtotal: 45000000,
              realizedAmount: 44000000,
              itemStatus: 'Selesai',
            },
            {
              id: 'itm-f-2',
              category: 'Pekerjaan Fasum',
              description: 'Pekerjaan Struktur Kolom, Balok & Kubah Atap',
              volume: 144,
              realizedVolume: 100,
              unit: 'm²',
              unitPrice: 850000,
              subtotal: 122400000,
              realizedAmount: 85000000,
              itemStatus: 'Proses',
            },
            {
              id: 'itm-f-3',
              category: 'Pekerjaan Fasum',
              description: 'Pasangan Dinding, Granit Lantai, Tempat Wudhu & Sound System',
              volume: 1,
              realizedVolume: 0,
              unit: 'Paket',
              unitPrice: 52600000,
              subtotal: 52600000,
              realizedAmount: 0,
              itemStatus: 'Belum',
            },
          ],
          approvalHistory: [
            {
              id: 'hst-f-1',
              actorName: 'Ir. Lukman Hakim, S.T., IPM',
              actorRole: 'PJT',
              action: 'Submit Pengajuan Pembangunan Fasum',
              notes: 'DED Masjid 12x12m telah disinkronkan dengan site plan induk.',
              timestamp: '2026-10-06 10:00',
            },
            {
              id: 'hst-f-2',
              actorName: 'Siti Rahmawati, S.E.',
              actorRole: 'KEUANGAN',
              action: 'Verifikasi Keuangan OK',
              notes: 'Anggaran COA 5-1400 HPP Infrastruktur/Fasum tersedia.',
              timestamp: '2026-10-06 14:30',
            },
          ],
          comments: [],
          fasumData: {
            facilityCategory: 'Fasum',
            facilitySubType: 'Masjid/Musholla',
            volumeOrArea: '144 m² (Bangunan 12×12m)',
            technicalSpec: 'Struktur beton bertulang K-225, lantai granit 60×60, kubah enamel galvalum.',
            startDate: '2026-10-12',
            endDate: '2026-12-30',
            overheadPercent: 10,
          },
        },
        {
          id: 'PPJ-RENOVASI-2026-10-0001',
          submissionNumber: 'PPJ/RENOVASI/2026/10/0001',
          date: '2026-10-07',
          type: 'RENOVASI',
          projectName: 'Perbaikan Drainase & Perkerasan Bahu Jalan Blok A',
          companyId: 'PT_TBL',
          rabAmount: 18500000,
          status: 'Menunggu Verifikasi Keuangan',
          requester: 'Ir. Lukman Hakim, S.T., IPM',
          requesterRole: 'PJT',
          location: 'Depan Kavling A-08 s/d A-14 Perumahan Bahagia Land',
          notes: 'Renovasi sedang akibat gerusan air hujan deras minggu lalu.',
          documents: [
            { name: 'RAB_Renovasi_Drainase_Blok_A.xlsx', category: 'RAB Excel', url: '#' },
          ],
          photos: [],
          items: [
            {
              id: 'itm-r-1',
              category: 'Perbaikan',
              description: 'Pasangan ulang batu kali dinding saluran drainase',
              volume: 35,
              realizedVolume: 0,
              unit: 'm¹',
              unitPrice: 350000,
              subtotal: 12250000,
              realizedAmount: 0,
              itemStatus: 'Belum',
            },
            {
              id: 'itm-r-2',
              category: 'Perbaikan',
              description: 'Rabat beton penutup gorong-gorong & perapihan bahu jalan',
              volume: 25,
              realizedVolume: 0,
              unit: 'm²',
              unitPrice: 250000,
              subtotal: 6250000,
              realizedAmount: 0,
              itemStatus: 'Belum',
            },
          ],
          approvalHistory: [
            {
              id: 'hst-r-1',
              actorName: 'Ir. Lukman Hakim, S.T., IPM',
              actorRole: 'PJT',
              action: 'Submit Pengajuan Renovasi/Perbaikan',
              notes: 'Nilai > Rp1 Juta sehingga memerlukan alur approval Direktur.',
              timestamp: '2026-10-07 09:15',
            },
          ],
          comments: [],
          renovasiData: {
            renovationLevel: 'Sedang',
            damageDescription: 'Dinding batu kali saluran drainase sepanjang 35m mengalami retak dan gerusan tanah.',
            targetCompletionDate: '2026-10-20',
            overheadPercent: 0,
          },
        },
        {
          id: 'PPJ-UNIT-2026-10-0002',
          submissionNumber: 'PPJ/UNIT/2026/10/0002',
          date: '2026-10-07',
          type: 'UNIT',
          projectName: 'Draft Pembangunan 5 Unit Blok A (A-21 s/d A-25) Bahagia Residence',
          companyId: 'PT_BPP',
          rabAmount: 338258550,
          status: 'Draft',
          requester: 'Ir. Hasanuddin, S.T., M.T.',
          requesterRole: 'PJT',
          location: 'Blok A (Kavling A-21 s/d A-25) Bahagia Residence',
          notes: 'Masih menunggu finalisasi harga batu bata merah press terbaru dari supplier.',
          documents: [],
          photos: [],
          items: [
            {
              id: 'itm-u2-1',
              category: 'Material',
              description: 'Paket Material Bata Merah Penuh & Plafon 4m (5 Unit)',
              volume: 5,
              realizedVolume: 0,
              unit: 'Unit',
              unitPrice: 43651710,
              subtotal: 218258550,
              realizedAmount: 0,
              itemStatus: 'Belum',
            },
            {
              id: 'itm-u2-2',
              category: 'Upah',
              description: 'Upah Borongan Konstruksi Full Finishing (5 Unit)',
              volume: 5,
              realizedVolume: 0,
              unit: 'Unit',
              unitPrice: 24000000,
              subtotal: 120000000,
              realizedAmount: 0,
              itemStatus: 'Belum',
            },
          ],
          approvalHistory: [
            {
              id: 'hst-u2-1',
              actorName: 'Ir. Hasanuddin, S.T., M.T.',
              actorRole: 'PJT',
              action: 'Simpan sebagai Draft',
              timestamp: '2026-10-07 15:40',
            },
          ],
          comments: [],
          unitData: {
            blockAndNumbers: 'Blok A (A-21 s/d A-25)',
            unitCount: 5,
            unitType: '36/91',
            landAreaPerUnit: 91,
            buildingAreaPerUnit: 36,
            startDate: '2026-10-20',
            endDate: '2026-12-31',
            picName: 'Ir. Hasanuddin, S.T., M.T.',
            materialSubtotalPerUnit: 43651710,
            wageSubtotalPerUnit: 24000000,
            overheadPercent: 0,
            profitPercent: 0,
            rabPerUnitFinal: 67651710,
            ppnPercent: 0,
            fundingSource: 'Kas',
            disbursementSchedule: 'Bertahap sesuai progress fisik 25%, 50%, 75%, 100%',
            contractorPaymentScheme: 'Opname Dwimingguan',
          },
        },
      ],

      suppliers: [
        {
          id: 'sup-1',
          code: 'SUP-2026-0001',
          name: 'PT Aneka Bangunan Kendari',
          picName: 'H. Ruslan Effendi',
          category: 'Material Toko',
          supplierType: 'PT',
          tempoDays: 30,
          creditLimit: 250000000,
          status: 'Aktif',
          rating: 5,
          bankName: 'Mandiri',
          bankAccount: '162-00-0988776-5',
          bankAccountOwner: 'PT Aneka Bangunan Kendari',
          bankBranch: 'KCP MT Haryono Kendari',
          npwp: '01.345.889.2-811.000',
          phone: '08114055889',
          officePhone: '0401-3124455',
          email: 'sales@anekabangunankendari.co.id',
          website: 'https://anekabangunankendari.co.id',
          address: 'Jl. MT Haryono No. 88, Ruko Graha Asri Blok B1-B3',
          kelurahan: 'Wua-Wua',
          kecamatan: 'Wua-Wua',
          city: 'Kota Kendari',
          province: 'Sulawesi Tenggara',
          postalCode: '93117',
          landmark: 'Depan Pasar Baru Wua-Wua Kendari',
          notes: 'Supplier utama semen Tonasa, besi beton SNI, cat, dan keramik',
          suppliedProducts: [
            { id: 'sp-1', materialCode: 'MT-2026-0001', materialName: 'Semen Tonasa 50 Kg', unit: 'Sak', lastPrice: 68000, updatedAt: '2026-10-08' },
            { id: 'sp-2', materialCode: 'MT-2026-0003', materialName: 'Besi Beton Polos 10mm Full SNI', unit: 'Batang', lastPrice: 72500, updatedAt: '2026-10-08' },
          ],
          createdAt: '2026-01-10',
        },
        {
          id: 'sup-2',
          code: 'SUP-2026-0002',
          name: 'CV Bumi Konawe Material Alam',
          picName: 'La Ode Muh. Ильham',
          category: 'Material Bumi',
          supplierType: 'CV',
          tempoDays: 14,
          creditLimit: 100000000,
          status: 'Aktif',
          rating: 5,
          bankName: 'BRI',
          bankAccount: '0192-01-002345-30-1',
          bankAccountOwner: 'CV Bumi Konawe Material Alam',
          bankBranch: 'KC Kendari Samratulangi',
          npwp: '02.912.441.7-811.000',
          phone: '08114022334',
          officePhone: '0401-3190221',
          email: 'bumikonawe.material@gmail.com',
          address: 'Jl. Poros Bandara Haluoleo KM 14',
          kelurahan: 'Ranomeeto',
          kecamatan: 'Ranomeeto',
          city: 'Kab. Konawe Selatan',
          province: 'Sulawesi Tenggara',
          postalCode: '93870',
          landmark: '500m setelah Pertigaan Tugu Ranomeeto',
          notes: 'Pemasok batu bata press, pasir pasang Pohara, dan batu gunung Moramo',
          suppliedProducts: [
            { id: 'sp-3', materialCode: 'MT-2026-0002', materialName: 'Batu Bata Merah Press Ranomeeto', unit: 'Biji', lastPrice: 950, updatedAt: '2026-10-06' },
            { id: 'sp-4', materialCode: 'MT-2026-0004', materialName: 'Pasir Pasang Pohara Pilihan', unit: 'Kubik', lastPrice: 950000, updatedAt: '2026-10-06' },
          ],
          createdAt: '2026-01-15',
        },
        {
          id: 'sup-3',
          code: 'SUP-2026-0003',
          name: 'PT Prima Truss Baja Ringan Sultra',
          picName: 'Irwan Setiadi',
          category: 'Material Toko',
          supplierType: 'PT',
          tempoDays: 45,
          creditLimit: 180000000,
          status: 'Aktif',
          rating: 4,
          bankName: 'BTN',
          bankAccount: '00045-01-30-000889-2',
          bankAccountOwner: 'PT Prima Truss Baja Ringan Sultra',
          bankBranch: 'KC Kendari',
          npwp: '03.441.552.1-811.000',
          phone: '081245990011',
          officePhone: '0401-3128890',
          email: 'order@primatruss-sultra.com',
          address: 'Jl. Ahmad Yani No. 112',
          kelurahan: 'Kadia',
          kecamatan: 'Kadia',
          city: 'Kota Kendari',
          province: 'Sulawesi Tenggara',
          postalCode: '93115',
          landmark: 'Samping Bank BTN KC Kendari',
          notes: 'Distributor resmi Baja Ringan Taso C75.75 & Atap Spandek Pasir',
          suppliedProducts: [
            { id: 'sp-5', materialCode: 'MT-2026-0005', materialName: 'Baja Ringan C75.75 SNI Taso', unit: 'Batang', lastPrice: 92000, updatedAt: '2026-10-05' },
          ],
          createdAt: '2026-02-01',
        },
      ],

      inventory: [
        {
          id: 'inv-1',
          code: 'MT-2026-0001',
          name: 'Semen Tonasa 50 Kg',
          materialCategory: 'Toko',
          warehouse: 'Bahagia Land',
          companyId: 'PT_TBL',
          initialStock: 500,
          stockInTotal: 100,
          stockOutTotal: 180,
          stock: 420,
          minStock: 100,
          unit: 'Sak',
          unitPrice: 68000,
          primarySupplierId: 'sup-1',
          primarySupplierName: 'PT Aneka Bangunan Kendari',
          notes: 'Stok opname awal Oktober 2026 - Gudang Utama Bahagia Land',
          status: 'Aktif',
          updatedAt: '2026-10-08',
        },
        {
          id: 'inv-2',
          code: 'MT-2026-0002',
          name: 'Batu Bata Merah Press Ranomeeto',
          materialCategory: 'Bumi',
          warehouse: 'Bahagia Residence',
          companyId: 'PT_BPP',
          initialStock: 15000,
          stockInTotal: 8000,
          stockOutTotal: 4500,
          stock: 18500,
          minStock: 5000,
          unit: 'Biji',
          unitPrice: 950,
          primarySupplierId: 'sup-2',
          primarySupplierName: 'CV Bumi Konawe Material Alam',
          notes: 'Stok bata merah pasangan dinding Blok A & B',
          status: 'Aktif',
          updatedAt: '2026-10-08',
        },
        {
          id: 'inv-3',
          code: 'MT-2026-0003',
          name: 'Besi Beton Polos 10mm Full SNI',
          materialCategory: 'Toko',
          warehouse: 'Bahagia Land',
          companyId: 'PT_TBL',
          initialStock: 120,
          stockInTotal: 50,
          stockOutTotal: 85,
          stock: 85,
          minStock: 100,
          unit: 'Batang',
          unitPrice: 72500,
          primarySupplierId: 'sup-1',
          primarySupplierName: 'PT Aneka Bangunan Kendari',
          notes: 'Stok kritis di bawah minimum - perlu repeat order PO',
          status: 'Aktif',
          updatedAt: '2026-10-08',
        },
        {
          id: 'inv-4',
          code: 'MT-2026-0004',
          name: 'Pasir Pasang Pohara Pilihan',
          materialCategory: 'Bumi',
          warehouse: 'Bahagia Land',
          companyId: 'PT_TBL',
          initialStock: 20,
          stockInTotal: 15,
          stockOutTotal: 23,
          stock: 12,
          minStock: 10,
          unit: 'Kubik',
          unitPrice: 950000,
          primarySupplierId: 'sup-2',
          primarySupplierName: 'CV Bumi Konawe Material Alam',
          notes: 'Stok mendekati batas minimum (Warning)',
          status: 'Aktif',
          updatedAt: '2026-10-08',
        },
        {
          id: 'inv-5',
          code: 'MT-2026-0005',
          name: 'Baja Ringan C75.75 SNI Taso',
          materialCategory: 'Toko',
          warehouse: 'Bahagia Residence',
          companyId: 'PT_BPP',
          initialStock: 250,
          stockInTotal: 120,
          stockOutTotal: 60,
          stock: 310,
          minStock: 80,
          unit: 'Batang',
          unitPrice: 92000,
          primarySupplierId: 'sup-3',
          primarySupplierName: 'PT Prima Truss Baja Ringan Sultra',
          notes: 'Rangka atap kavling siap pasang',
          status: 'Aktif',
          updatedAt: '2026-10-08',
        },
      ],

      stockMovements: [
        {
          id: 'mov-1',
          referenceNo: 'MT-2026-0001',
          date: '2026-10-01',
          materialId: 'inv-1',
          materialCode: 'MT-2026-0001',
          materialName: 'Semen Tonasa 50 Kg',
          unit: 'Sak',
          companyId: 'PT_TBL',
          warehouse: 'Bahagia Land',
          movementType: 'SALDO_AWAL',
          qtyIn: 500,
          qtyOut: 0,
          balanceAfter: 500,
          unitPrice: 68000,
          totalValue: 34000000,
          description: 'Stok opname awal Oktober 2026',
          officerName: 'La Ode Darman (LOGISTIK)',
          journalId: 'JRN-2026-SA01',
          createdAt: '2026-10-01 08:00',
        },
        {
          id: 'mov-2',
          referenceNo: 'SM-2026-10-0001',
          date: '2026-10-04',
          materialId: 'inv-1',
          materialCode: 'MT-2026-0001',
          materialName: 'Semen Tonasa 50 Kg',
          unit: 'Sak',
          companyId: 'PT_TBL',
          warehouse: 'Bahagia Land',
          movementType: 'MASUK',
          qtyIn: 100,
          qtyOut: 0,
          balanceAfter: 600,
          unitPrice: 68000,
          totalValue: 6800000,
          supplierId: 'sup-1',
          supplierName: 'PT Aneka Bangunan Kendari',
          poOrInvoiceNo: 'PO-2026-0001',
          description: 'Penerimaan pengiriman tahap 1 Semen Tonasa dari PT Aneka Bangunan Kendari',
          officerName: 'La Ode Darman (LOGISTIK)',
          journalId: 'JRN-2026-SM01',
          createdAt: '2026-10-04 10:15',
        },
        {
          id: 'mov-3',
          referenceNo: 'SK-2026-10-0001',
          date: '2026-10-07',
          materialId: 'inv-1',
          materialCode: 'MT-2026-0001',
          materialName: 'Semen Tonasa 50 Kg',
          unit: 'Sak',
          companyId: 'PT_TBL',
          warehouse: 'Bahagia Land',
          movementType: 'KELUAR',
          qtyIn: 0,
          qtyOut: 180,
          balanceAfter: 420,
          unitPrice: 68000,
          totalValue: 12240000,
          purposeType: 'Proyek Unit',
          unitBlockCode: 'Unit A-01 s/d A-06',
          description: 'Pengeluaran semen untuk pengecoran sloof & pasangan dinding Unit A-01 s/d A-06',
          officerName: 'La Ode Darman (LOGISTIK)',
          journalId: 'JRN-2026-SK01',
          createdAt: '2026-10-07 14:20',
        },
        {
          id: 'mov-4',
          referenceNo: 'MT-2026-0002',
          date: '2026-10-01',
          materialId: 'inv-2',
          materialCode: 'MT-2026-0002',
          materialName: 'Batu Bata Merah Press Ranomeeto',
          unit: 'Biji',
          companyId: 'PT_BPP',
          warehouse: 'Bahagia Residence',
          movementType: 'SALDO_AWAL',
          qtyIn: 15000,
          qtyOut: 0,
          balanceAfter: 15000,
          unitPrice: 950,
          totalValue: 14250000,
          description: 'Stok opname awal Oktober 2026 Batu Bata Press',
          officerName: 'La Ode Darman (LOGISTIK)',
          journalId: 'JRN-2026-SA02',
          createdAt: '2026-10-01 08:30',
        },
      ],

      stockOpnameBatches: [
        {
          id: 'opn-batch-1',
          opnameNo: 'OPN-2026-10-0001',
          date: '2026-10-01',
          companyId: 'PT_TBL',
          warehouse: 'Bahagia Land',
          officerName: 'La Ode Darman (Logistik)',
          signatureText: 'DIGITAL-SIGN-DARMAN-20261001',
          generalNotes: 'Opname rutin awal kuartal IV 2026 Gudang Bahagia Land Kendari',
          items: [
            {
              materialId: 'inv-1',
              materialCode: 'MT-2026-0001',
              materialName: 'Semen Tonasa 50 Kg',
              unit: 'Sak',
              systemStock: 420,
              physicalStock: 420,
              difference: 0,
              unitPrice: 68000,
              differenceValue: 0,
              notes: 'Sesuai fisik di palet rak A1',
            },
          ],
          totalDifferenceValue: 0,
          createdAt: '2026-10-01 09:00',
        },
      ],

      adminCrudLogs: [
        {
          id: 'crud-log-1',
          timestamp: '2026-10-07 16:40',
          adminName: 'Super Admin Bahagia Group',
          adminEmail: 'superadmin@bahagia.com',
          actionType: 'KURANGI',
          collectionName: 'Inventory Material',
          targetId: 'MAT-001 (Semen Tonasa 50 Kg)',
          beforeValue: '450 Zak',
          afterValue: '420 Zak (-30 Zak)',
          reason: 'Koreksi pemakaian pengecoran sloof Kavling D-01 s/d D-03',
        },
        {
          id: 'crud-log-2',
          timestamp: '2026-10-07 14:15',
          adminName: 'Super Admin Bahagia Group',
          adminEmail: 'superadmin@bahagia.com',
          actionType: 'EDIT',
          collectionName: 'COA (Bagan Akun)',
          targetId: '1-1130 (Kas Kecil)',
          beforeValue: 'Rp20.000.000',
          afterValue: 'Rp25.000.000',
          reason: 'Penyesuaian saldo awal kas kecil Q4 2026',
        },
      ],

      purchaseOrders: [
        {
          id: 'PO-2026-0001',
          companyId: 'PT_TBL',
          supplierId: 'sup-1',
          supplierName: 'PT Aneka Bangunan Kendari',
          items: [
            { materialName: 'Semen Tonasa 50 Kg', unit: 'Zak', qty: 500, unitPrice: 68000 },
            { materialName: 'Besi Beton Polos 10mm Full SNI', unit: 'Batang', qty: 200, unitPrice: 72500 },
          ],
          discount: 500000,
          ppnPercent: 11,
          shippingCost: 650000,
          subtotal: 48500000,
          grandTotal: 53985000,
          status: 'Menunggu Approval Direktur',
          createdBy: 'Budi Santoso, S.T.',
          createdAt: '2026-10-07 09:20',
        },
        {
          id: 'PO-2026-0002',
          companyId: 'PT_BPP',
          supplierId: 'sup-2',
          supplierName: 'CV Bumi Konawe Material Alam',
          items: [
            { materialName: 'Batu Bata Merah Press Ranomeeto', unit: 'Biji', qty: 25000, unitPrice: 950 },
            { materialName: 'Pasir Pasang Pohara', unit: 'Ret', qty: 12, unitPrice: 950000 },
          ],
          discount: 150000,
          ppnPercent: 0,
          shippingCost: 0,
          subtotal: 35150000,
          grandTotal: 35000000,
          status: 'Approved',
          createdBy: 'Agus Setiawan, S.T.',
          createdAt: '2026-10-05 14:10',
        },
      ],

      journals: [
        {
          id: 'JRN-2026-001',
          date: '2026-10-05',
          companyId: 'PT_TBL',
          reference: 'KM-2026-10-0001',
          description: 'Pencairan Akad KPR FLPP Bank BTN Kavling A-18 (Rp169.000.000)',
          debitAccount: '1-1210 Bank BTN',
          creditAccount: '4-1100 Penjualan Rumah Subsidi (Rp169 Jt)',
          amount: 169000000,
          autoGenerated: true,
        },
        {
          id: 'JRN-2026-002',
          date: '2026-10-06',
          companyId: 'PT_TBL',
          reference: 'KM-2026-10-0002',
          description: 'Terima DP Unit A01 dari Budi Rp50 Juta',
          debitAccount: '1-1110 Kas PT SDP',
          creditAccount: '2-2100 Uang Muka Penjualan Rumah',
          amount: 50000000,
          autoGenerated: true,
        },
        {
          id: 'JRN-2026-003',
          date: '2026-10-06',
          companyId: 'PT_BPP',
          reference: 'KM-2026-10-0003',
          description: 'Penerimaan Booking Fee Kavling A-05 Bahagia Residence',
          debitAccount: '1-1230 Bank Mandiri Giro',
          creditAccount: '2-2100 Uang Muka Penjualan Rumah',
          amount: 2000000,
          autoGenerated: true,
        },
        {
          id: 'JRN-2026-004',
          date: '2026-10-07',
          companyId: 'PT_TBL',
          reference: 'KK-2026-10-0001',
          description: 'Bayar gaji karyawan staf lapangan & administrasi Oktober 2026',
          debitAccount: '5-2100 Beban Gaji Karyawan',
          creditAccount: '1-1110 Kas PT SDP',
          amount: 15000000,
          autoGenerated: true,
        },
        {
          id: 'JRN-2026-005',
          date: '2026-10-08',
          companyId: 'PT_TBL',
          reference: 'KK-2026-10-0002',
          description: 'Pelunasan PO Semen Tonasa 500 Zak & Besi Beton SNI ke PT Aneka Bangunan Kendari',
          debitAccount: '2-1210 Utang Supplier Toko',
          creditAccount: '1-1210 Bank BTN',
          amount: 48500000,
          autoGenerated: true,
        },
        {
          id: 'JRN-2026-006',
          date: '2026-10-08',
          companyId: 'PT_BPP',
          reference: 'KK-2026-10-0003',
          description: 'Pembayaran Opname Upah Tukang Borongan 5 Unit Blok A Bahagia Residence',
          debitAccount: '2-1100 Utang Upah Tukang',
          creditAccount: '1-1220 Bank BRI',
          amount: 24000000,
          autoGenerated: true,
        },
        {
          id: 'JRN-2026-007',
          date: '2026-10-09',
          companyId: 'PT_TBL',
          reference: 'KM-2026-10-0004',
          description: 'Pencairan Dana SBUM Subsidi Pemerintah 10 Unit Tahap 1',
          debitAccount: '1-1210 Bank BTN',
          creditAccount: '1-2410 Piutang SBUM - Unit Baru',
          amount: 40000000,
          autoGenerated: true,
        },
      ],

      cashTransactions: [
        {
          id: 'KM-2026-10-0001',
          type: 'KAS_MASUK',
          date: '2026-10-05',
          companyId: 'PT_TBL',
          sourceOrPurpose: 'Penjualan Unit (Cash/KPR)',
          category: 'Pencairan KPR FLPP',
          amount: 169000000,
          cashAccount: '1-1210 Bank BTN',
          counterAccount: '4-1100 Penjualan Rumah Subsidi (Rp169 Jt)',
          debitAccount: '1-1210 Bank BTN',
          creditAccount: '4-1100 Penjualan Rumah Subsidi (Rp169 Jt)',
          description: 'Pencairan Akad KPR FLPP Bank BTN Kavling A-18 (Rp169.000.000)',
          proofFileName: 'Bukti_Akad_BTN_A18.pdf',
          consumerName: 'La Ode Muhammad Akbar',
          unitCode: 'A-18',
          journalId: 'JRN-2026-001',
          createdBy: 'Siti Rahmawati, S.E.',
          createdAt: '2026-10-05 14:20',
          history: [
            {
              id: 'h-1',
              timestamp: '2026-10-05 14:20',
              actor: 'Siti Rahmawati, S.E. (KEUANGAN)',
              action: 'Membuat Kas Masuk & Auto-Jurnal JRN-2026-001',
            },
          ],
        },
        {
          id: 'KM-2026-10-0002',
          type: 'KAS_MASUK',
          date: '2026-10-06',
          companyId: 'PT_TBL',
          sourceOrPurpose: 'DP Konsumen',
          category: 'Uang Muka Konsumen',
          amount: 50000000,
          cashAccount: '1-1110 Kas PT SDP',
          counterAccount: '2-2100 Uang Muka Penjualan Rumah',
          debitAccount: '1-1110 Kas PT SDP',
          creditAccount: '2-2100 Uang Muka Penjualan Rumah',
          description: 'Terima DP Unit A01 dari Budi Rp50 Juta',
          proofFileName: 'Kwitansi_DP_Budi_A01.jpg',
          consumerName: 'Bapak Budi Santoso',
          unitCode: 'A-01',
          journalId: 'JRN-2026-002',
          createdBy: 'Siti Rahmawati, S.E.',
          createdAt: '2026-10-06 10:15',
          history: [
            {
              id: 'h-2',
              timestamp: '2026-10-06 10:15',
              actor: 'Siti Rahmawati, S.E. (KEUANGAN)',
              action: 'Membuat Kas Masuk & Auto-Jurnal JRN-2026-002',
            },
          ],
        },
        {
          id: 'KM-2026-10-0003',
          type: 'KAS_MASUK',
          date: '2026-10-06',
          companyId: 'PT_BPP',
          sourceOrPurpose: 'Booking Fee',
          category: 'Booking Fee Unit',
          amount: 2000000,
          cashAccount: '1-1230 Bank Mandiri Giro',
          counterAccount: '2-2100 Uang Muka Penjualan Rumah',
          debitAccount: '1-1230 Bank Mandiri Giro',
          creditAccount: '2-2100 Uang Muka Penjualan Rumah',
          description: 'Penerimaan Booking Fee Kavling A-05 Bahagia Residence',
          proofFileName: 'Transfer_Mandiri_A05.jpg',
          consumerName: 'Nurul Hidayah, S.Pd.',
          unitCode: 'A-05',
          journalId: 'JRN-2026-003',
          createdBy: 'Nadia Putri, S.Ak.',
          createdAt: '2026-10-06 15:40',
          history: [
            {
              id: 'h-3',
              timestamp: '2026-10-06 15:40',
              actor: 'Nadia Putri, S.Ak. (KEUANGAN)',
              action: 'Membuat Kas Masuk & Auto-Jurnal JRN-2026-003',
            },
          ],
        },
        {
          id: 'KK-2026-10-0001',
          type: 'KAS_KELUAR',
          date: '2026-10-07',
          companyId: 'PT_TBL',
          sourceOrPurpose: 'Bayar Gaji Karyawan',
          category: 'Beban SDM & Payroll',
          amount: 15000000,
          cashAccount: '1-1110 Kas PT SDP',
          counterAccount: '5-2100 Beban Gaji Karyawan',
          debitAccount: '5-2100 Beban Gaji Karyawan',
          creditAccount: '1-1110 Kas PT SDP',
          description: 'Bayar gaji karyawan staf lapangan & administrasi Oktober 2026',
          proofFileName: 'Rekap_Payroll_Okt_2026.pdf',
          employeeName: 'Seluruh Staf PT TBL',
          journalId: 'JRN-2026-004',
          createdBy: 'Siti Rahmawati, S.E.',
          createdAt: '2026-10-07 09:30',
          history: [
            {
              id: 'h-4',
              timestamp: '2026-10-07 09:30',
              actor: 'Siti Rahmawati, S.E. (KEUANGAN)',
              action: 'Membuat Kas Keluar & Auto-Jurnal JRN-2026-004',
            },
          ],
        },
        {
          id: 'KK-2026-10-0002',
          type: 'KAS_KELUAR',
          date: '2026-10-08',
          companyId: 'PT_TBL',
          sourceOrPurpose: 'Bayar Supplier',
          category: 'Pelunasan Material Konstruksi',
          amount: 48500000,
          cashAccount: '1-1210 Bank BTN',
          counterAccount: '2-1210 Utang Supplier Toko',
          debitAccount: '2-1210 Utang Supplier Toko',
          creditAccount: '1-1210 Bank BTN',
          description: 'Pelunasan PO Semen Tonasa 500 Zak & Besi Beton SNI ke PT Aneka Bangunan Kendari',
          proofFileName: 'Bukti_Transfer_PT_Aneka_Bangunan.pdf',
          supplierName: 'PT Aneka Bangunan Kendari',
          journalId: 'JRN-2026-005',
          createdBy: 'Siti Rahmawati, S.E.',
          createdAt: '2026-10-08 11:10',
          history: [
            {
              id: 'h-5',
              timestamp: '2026-10-08 11:10',
              actor: 'Siti Rahmawati, S.E. (KEUANGAN)',
              action: 'Membuat Kas Keluar & Auto-Jurnal JRN-2026-005',
            },
          ],
        },
        {
          id: 'KK-2026-10-0003',
          type: 'KAS_KELUAR',
          date: '2026-10-08',
          companyId: 'PT_BPP',
          sourceOrPurpose: 'Bayar Tukang/Mandor',
          category: 'Upah Konstruksi Lapangan',
          amount: 24000000,
          cashAccount: '1-1220 Bank BRI',
          counterAccount: '2-1100 Utang Upah Tukang',
          debitAccount: '2-1100 Utang Upah Tukang',
          creditAccount: '1-1220 Bank BRI',
          description: 'Pembayaran Opname Upah Tukang Borongan 5 Unit Blok A Bahagia Residence',
          proofFileName: 'BA_Opname_Mandor_BlokA.pdf',
          employeeName: 'Tim Mandor Pak Ruslan',
          unitCode: 'A-01 s/d A-05',
          journalId: 'JRN-2026-006',
          createdBy: 'Nadia Putri, S.Ak.',
          createdAt: '2026-10-08 16:00',
          history: [
            {
              id: 'h-6',
              timestamp: '2026-10-08 16:00',
              actor: 'Nadia Putri, S.Ak. (KEUANGAN)',
              action: 'Membuat Kas Keluar & Auto-Jurnal JRN-2026-006',
            },
          ],
        },
        {
          id: 'KM-2026-10-0004',
          type: 'KAS_MASUK',
          date: '2026-10-09',
          companyId: 'PT_TBL',
          sourceOrPurpose: 'SBUM',
          category: 'Pencairan Subsidi SBUM',
          amount: 40000000,
          cashAccount: '1-1210 Bank BTN',
          counterAccount: '1-2410 Piutang SBUM - Unit Baru',
          debitAccount: '1-1210 Bank BTN',
          creditAccount: '1-2410 Piutang SBUM - Unit Baru',
          description: 'Pencairan Dana SBUM Subsidi Pemerintah 10 Unit Tahap 1',
          proofFileName: 'Advis_Kredit_SBUM_BTN.pdf',
          unitCode: 'Blok A (10 Unit)',
          journalId: 'JRN-2026-007',
          createdBy: 'Siti Rahmawati, S.E.',
          createdAt: '2026-10-09 09:00',
          history: [
            {
              id: 'h-7',
              timestamp: '2026-10-09 09:00',
              actor: 'Siti Rahmawati, S.E. (KEUANGAN)',
              action: 'Membuat Kas Masuk & Auto-Jurnal JRN-2026-007',
            },
          ],
        },
      ],

      attendance: [
        {
          id: 'att-1',
          employeeName: 'Budi Santoso, S.T.',
          role: 'PENGAWAS',
          companyId: 'PT_TBL',
          timestamp: '2026-10-07 07:52 WITA',
          lat: -4.0096,
          lng: 122.5127,
          selfieDataUrl: '',
          status: 'Dinas Lapangan',
        },
        {
          id: 'att-2',
          employeeName: 'Ir. Lukman Hakim, S.T., IPM',
          role: 'PJT',
          companyId: 'PT_TBL',
          timestamp: '2026-10-07 08:01 WITA',
          lat: -4.0098,
          lng: 122.5129,
          selfieDataUrl: '',
          status: 'Dinas Lapangan',
        },
      ],

      emailLogs: [
        {
          id: 'mail-01',
          eventNumber: 1,
          eventName: '1. Booking Baru',
          recipient: 'marketing@bahagialand.com, admin@bahagiagroup.com',
          subject: '[Bahagia Group] Booking Baru BKG-2026-0005 - Kavling D-02',
          status: 'Terkirim via Trigger Email',
          timestamp: '2026-10-06 16:05',
        },
        {
          id: 'mail-02',
          eventNumber: 3,
          eventName: '3. RAB Baru Diajukan',
          recipient: 'pjt@bahagiaprima.com',
          subject: '[Verifikasi PJT] RAB Pasangan Bata Merah & Plafon 4m Blok A',
          status: 'Terkirim via Trigger Email',
          timestamp: '2026-10-07 08:15',
        },
        {
          id: 'mail-03',
          eventNumber: 4,
          eventName: '4. RAB Diverifikasi PJT',
          recipient: 'direktur@bahagiagroup.com',
          subject: '[Single Approval Direktur] RAB 10 Unit Blok C Terverifikasi PJT',
          status: 'Terkirim via Trigger Email',
          timestamp: '2026-10-06 15:20',
        },
        {
          id: 'mail-04',
          eventNumber: 10,
          eventName: '10. PO Baru > Limit Rp1 Juta',
          recipient: 'direktur@bahagiagroup.com',
          subject: '[Approval PO] PO-2026-0001 PT Aneka Bangunan Rp53.985.000',
          status: 'Terkirim via Trigger Email',
          timestamp: '2026-10-07 09:20',
        },
      ],

      activityLogs: [
        {
          id: 'act-1',
          user: 'Ir. Lukman Hakim, S.T., IPM',
          role: 'PJT',
          action: 'Verifikasi Teknis OK & Tanda Tangan QR pada Opname Mandor Blok B',
          module: 'Project & PJT',
          timestamp: '10 menit lalu',
        },
        {
          id: 'act-2',
          user: 'Budi Santoso, S.T.',
          role: 'PENGAWAS',
          action: 'Membuat PO Multi-Material PO-2026-0001 senilai Rp53.985.000',
          module: 'Purchasing',
          timestamp: '35 menit lalu',
        },
        {
          id: 'act-3',
          user: 'Agus Setiawan, S.T.',
          role: 'PENGAWAS',
          action: 'Update Progress Fisik 90% Kavling A-11 & A-12 Bahagia Residence',
          module: 'Project',
          timestamp: '1 jam lalu',
        },
        {
          id: 'act-4',
          user: 'Andi Saputra',
          role: 'MARKETING',
          action: 'Input Booking Online BKG-2026-0005 Kavling D-02 (Bank BTN)',
          module: 'Marketing',
          timestamp: '2 jam lalu',
        },
        {
          id: 'act-5',
          user: 'Siti Rahmawati, S.E.',
          role: 'KEUANGAN',
          action: 'Posting Auto-Jurnal Akad KPR & HPP Kavling A-18',
          module: 'Keuangan',
          timestamp: '4 jam lalu',
        },
      ],

      approvalNotifications: [
        {
          id: 'NTF-PPJ-LAHAN-2026-10-0001',
          targetRole: 'KEUANGAN',
          title: 'Pengajuan Proyek Lahan Baru Menunggu Verifikasi Keuangan',
          message: 'PPJ/LAHAN/2026/10/0001 - Akuisisi Lahan Bahagia Residence Tahap 2 (Rp1.485.000.000) oleh Ir. Hasanuddin, S.T., M.T. (PJT)',
          category: 'PENGAJUAN_PROYEK',
          referenceId: 'PPJ-LAHAN-2026-10-0001',
          companyId: 'PT_BPP',
          amount: 1485000000,
          status: 'Menunggu Verifikasi Keuangan',
          actionPath: '/project/pengajuan-proyek',
          requester: 'Ir. Hasanuddin, S.T., M.T. (PJT)',
          isRead: false,
          createdBy: 'seed_pjt_bpp',
          createdAt: '2026-10-05 14:10',
          updatedAt: '2026-10-05 14:10',
        },
        {
          id: 'NTF-PPJ-RENOVASI-2026-10-0001',
          targetRole: 'KEUANGAN',
          title: 'Pengajuan Renovasi Drainase Menunggu Verifikasi Keuangan',
          message: 'PPJ/RENOVASI/2026/10/0001 - Perbaikan Drainase & Perkerasan Bahu Jalan Blok A (Rp18.500.000) oleh Ir. Lukman Hakim, S.T., IPM',
          category: 'PENGAJUAN_PROYEK',
          referenceId: 'PPJ-RENOVASI-2026-10-0001',
          companyId: 'PT_TBL',
          amount: 18500000,
          status: 'Menunggu Verifikasi Keuangan',
          actionPath: '/project/pengajuan-proyek',
          requester: 'Ir. Lukman Hakim, S.T., IPM (PJT)',
          isRead: false,
          createdBy: 'seed_pjt_tbl',
          createdAt: '2026-10-07 09:15',
          updatedAt: '2026-10-07 09:15',
        },
        {
          id: 'NTF-PPJ-FASUM-2026-10-0001',
          targetRole: 'DIREKTUR',
          title: 'Pengajuan Fasum Masjid Terverifikasi Keuangan → Menunggu Approval Direktur',
          message: 'PPJ/FASUM/2026/10/0001 - Pembangunan Masjid Al-Ikhlas & Taman RTH Kompleks (Rp242.000.000) siap disetujui Direktur.',
          category: 'PENGAJUAN_PROYEK',
          referenceId: 'PPJ-FASUM-2026-10-0001',
          companyId: 'PT_TBL',
          amount: 242000000,
          status: 'Menunggu Approval Direktur',
          actionPath: '/project/pengajuan-proyek',
          requester: 'Siti Rahmawati, S.E. (KEUANGAN)',
          isRead: false,
          createdBy: 'seed_keu_tbl',
          createdAt: '2026-10-06 14:30',
          updatedAt: '2026-10-06 14:30',
        },
        {
          id: 'NTF-VER-RAB-2026-01',
          targetRole: 'DIREKTUR',
          title: 'RAB 10 Unit Blok C Terverifikasi PJT → Menunggu Single Approval Direktur',
          message: 'VER-RAB-2026-01 - RAB Pembangunan 10 Unit Blok C Bahagia Land (Rp676.517.100) telah diverifikasi PJT.',
          category: 'APPROVAL',
          referenceId: 'VER-RAB-2026-01',
          companyId: 'PT_TBL',
          amount: 676517100,
          status: 'Menunggu Approval Direktur',
          actionPath: '/approval',
          requester: 'Ir. Lukman Hakim, S.T., IPM (PJT)',
          isRead: false,
          createdBy: 'seed_pjt_tbl',
          createdAt: '2026-10-06 15:20',
          updatedAt: '2026-10-06 15:20',
        },
        {
          id: 'NTF-PO-2026-0001',
          targetRole: 'DIREKTUR',
          title: 'PO Material > Limit Rp1 Juta Menunggu Approval Direktur',
          message: 'PO-2026-0001 - PT Aneka Bangunan Kendari (Semen Tonasa 500 Zak & Besi 10mm) senilai Rp53.985.000.',
          category: 'PURCHASE_ORDER',
          referenceId: 'PO-2026-0001',
          companyId: 'PT_TBL',
          amount: 53985000,
          status: 'Menunggu Approval Direktur',
          actionPath: '/approval',
          requester: 'Budi Santoso, S.T. (PENGAWAS)',
          isRead: false,
          createdBy: 'seed_pengawas_tbl',
          createdAt: '2026-10-07 09:20',
          updatedAt: '2026-10-07 09:20',
        },
        {
          id: 'NTF-VER-RAB-2026-02',
          targetRole: 'PJT',
          title: 'Pengajuan RAB Baru Menunggu Verifikasi Teknis PJT',
          message: 'VER-RAB-2026-02 - RAB Pasangan Bata Merah & Plafon 4m Blok A (5 Unit) senilai Rp338.258.550 oleh Agus Setiawan, S.T.',
          category: 'VERIFIKASI_PJT',
          referenceId: 'VER-RAB-2026-02',
          companyId: 'PT_BPP',
          amount: 338258550,
          status: 'Menunggu Verifikasi PJT',
          actionPath: '/project/verifikasi',
          requester: 'Agus Setiawan, S.T. (PENGAWAS)',
          isRead: false,
          createdBy: 'seed_pengawas_bpp',
          createdAt: '2026-10-07 08:15',
          updatedAt: '2026-10-07 08:15',
        },
      ],

      editMode: false,
      editableTexts: generateInitialEditableTexts(),
      photoSlots: INITIAL_PHOTO_SLOTS,
      cmsContent: INITIAL_CMS_CONTENT,
      dataMaster: INITIAL_DATA_MASTER_12,
      autoBackupEnabled: true,
      syncedProjects: INITIAL_SYNCED_PROJECTS,
      lastResetTimestamp: 0,
      publicTestimonials: INITIAL_PUBLIC_TESTIMONIALS,
      testimonialSettings: INITIAL_TESTIMONIAL_SETTINGS,
      galleryPhotos: INITIAL_GALLERY_PHOTOS,
      projectPhysicalProgress: INITIAL_PROJECT_PHYSICAL_PROGRESS,
      gallerySettings: INITIAL_GALLERY_SETTINGS,
      blogArticles: INITIAL_BLOG_ARTICLES,
      blogSettings: INITIAL_BLOG_SETTINGS,
      lastDeployedAt: '',
      lastDeployedVersion: 0,
      lastDeployedBy: 'Super Admin',
      backupSnapshots: [
        {
          id: 'bkp-2026-10-08',
          name: 'Auto-Backup Harian Sistem ERP & CMS (08 Okt 2026)',
          createdAt: '2026-10-08 23:00',
          createdBy: 'Sistem Otomatis (Cron Harian)',
          sizeKb: 1420,
          type: 'Auto-Schedule',
          collectionsCount: 55,
          payloadJson: JSON.stringify({ note: 'Snapshot harian 55 koleksi & 102 akun COA' }),
        },
        {
          id: 'bkp-2026-10-01',
          name: 'Backup Awal Peluncuran Bahagia Group Property',
          createdAt: '2026-10-01 08:00',
          createdBy: 'Andi Pratama (ADMIN)',
          sizeKb: 1280,
          type: 'Manual',
          collectionsCount: 55,
          payloadJson: JSON.stringify({ note: 'Snapshot awal sistem' }),
        },
      ],

      loginWithSeed: (email, pass) => {
        const found = get().users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === pass
        );
        if (!found) {
          return { ok: false, message: 'Email atau password tidak sesuai.' };
        }
        if (!found.active) {
          return { ok: false, message: 'Akun ini sedang dinonaktifkan oleh Admin.' };
        }
        set((state) => ({
          currentUser: found,
          selectedCompanyFilter: found.companyId === 'PT_TBL' || found.companyId === 'PT_BPP' ? found.companyId : 'ALL',
          activityLogs: [
            {
              id: `act-${Date.now()}`,
              user: found.name,
              role: found.role,
              action: `Login ke sistem (${found.companyName})`,
              module: 'Auth',
              timestamp: 'Baru saja',
            },
            ...state.activityLogs,
          ],
        }));
        return { ok: true, message: `Selamat datang, ${found.name}` };
      },

      switchQuickRole: (userId) => {
        const found = get().users.find((u) => u.id === userId);
        if (!found) return;
        set((state) => ({
          currentUser: found,
          editMode: found.role === 'ADMIN' ? state.editMode : false,
          selectedCompanyFilter: found.companyId === 'PT_TBL' || found.companyId === 'PT_BPP' ? found.companyId : 'ALL',
        }));
      },

      logout: () => set({ currentUser: null, editMode: false }),

      setCompanyFilter: (filter) => set({ selectedCompanyFilter: filter }),

      toggleDarkMode: () =>
        set((state) => {
          const next = !state.darkMode;
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', next);
          }
          return { darkMode: next };
        }),

      setApprovalLimit: (limit) => set({ approvalLimit: limit }),

      addBooking: (payload) => {
        const state = get();
        const nextNum = state.bookings.length + 1;
        const id = `BKG-2026-${String(nextNum).padStart(4, '0')}`;
        const createdAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
        const newBooking: BookingRecord = { ...payload, id, createdAt };

        set((s) => ({
          bookings: [newBooking, ...s.bookings],
          kavling: s.kavling.map((k) =>
            k.id === payload.kavlingId ? { ...k, status: 'Booking', buyerName: payload.buyerName, bank: payload.bank } : k
          ),
          emailLogs: [
            {
              id: `mail-${Date.now()}`,
              eventNumber: 1,
              eventName: '1. Booking Baru',
              recipient: 'marketing@bahagiagroup.com, admin@bahagiagroup.com',
              subject: `[Booking Baru] ${id} - ${payload.buyerName} (${payload.kavlingCode})`,
              status: 'Terkirim via Trigger Email',
              timestamp: createdAt,
            },
            ...s.emailLogs,
          ],
          activityLogs: [
            {
              id: `act-${Date.now()}`,
              user: payload.buyerName,
              role: s.currentUser?.role || 'USER',
              action: `Membuat Booking ${id} untuk Kavling ${payload.kavlingCode}`,
              module: 'Marketing',
              timestamp: 'Baru saja',
            },
            ...s.activityLogs,
          ],
        }));

        syncErpRecordToFirestore({
          id,
          collectionName: 'bookings',
          companyId: payload.companyId,
          title: `Booking ${payload.buyerName} - Kavling ${payload.kavlingCode}`,
          status: payload.stage,
          amount: payload.bookingFee,
        });

        return newBooking;
      },

      updateBookingStage: (id, stage) =>
        set((s) => {
          const target = s.bookings.find((b) => b.id === id);
          if (!target) return s;

          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const actorName = s.currentUser?.name || 'Staf Marketing';
          const actorRole = s.currentUser?.role || 'MARKETING';

          // Map stage prospek/booking ke status kavling secara otomatis
          const kavlingStatusMap: Partial<Record<BookingRecord['stage'], KavlingLot['status']>> = {
            Booking: 'Booking',
            SPR: 'Booking',
            'Proses KPR': 'Proses KPR',
            Akad: 'Akad',
            Selesai: 'Serah Terima',
            Lost: 'Tersedia',
          };
          const mappedKavlingStatus = kavlingStatusMap[stage];

          const nextKavling = mappedKavlingStatus
            ? s.kavling.map((k) => {
                if (k.id === target.kavlingId || (k.code === target.kavlingCode && k.companyId === target.companyId)) {
                  return {
                    ...k,
                    status: mappedKavlingStatus,
                    buyerName: stage === 'Lost' ? undefined : target.buyerName,
                    buyerPhone: stage === 'Lost' ? undefined : target.phone,
                    bank: stage === 'Lost' ? undefined : target.bank,
                  };
                }
                return k;
              })
            : s.kavling;

          let nextJournals = s.journals;
          let nextCashTx = s.cashTransactions;
          let nextCoa = s.coa;
          let nextNotifications = s.approvalNotifications;

          // Jika pindah ke tahap Booking / SPR dan belum ada jurnal Booking Fee untuk booking ini, catat otomatis ke Keuangan
          if ((stage === 'Booking' || stage === 'SPR') && target.stage !== 'Booking' && target.stage !== 'SPR') {
            const feeAmount = target.bookingFee && target.bookingFee > 0 ? target.bookingFee : 2000000;
            const refCheck = `BF-${target.id}`;
            if (!s.journals.some((j) => j.reference === refCheck)) {
              const jrnId = `JRN-BF-${Date.now().toString().slice(-5)}`;
              const cashAcc = target.companyId === 'PT_BPP' ? '1-1120 Kas PT BPP' : '1-1110 Kas PT SDP';
              const newJrn: JournalEntry = {
                id: jrnId,
                date: now.slice(0, 10),
                companyId: target.companyId,
                reference: refCheck,
                description: `[Auto-Sync Marketing] Penerimaan Booking Fee ${target.buyerName} - Kavling ${target.kavlingCode}`,
                debitAccount: cashAcc,
                creditAccount: '2-2100 Uang Muka Penjualan Rumah',
                amount: feeAmount,
                autoGenerated: true,
              };
              const newKm: CashTransactionRecord = {
                id: `KM-BF-${Date.now().toString().slice(-5)}`,
                type: 'KAS_MASUK',
                date: now.slice(0, 10),
                companyId: target.companyId,
                sourceOrPurpose: 'Booking Fee',
                category: 'Booking Fee Unit (Auto-Sync Marketing)',
                amount: feeAmount,
                cashAccount: cashAcc,
                counterAccount: '2-2100 Uang Muka Penjualan Rumah',
                debitAccount: cashAcc,
                creditAccount: '2-2100 Uang Muka Penjualan Rumah',
                description: newJrn.description,
                consumerName: target.buyerName,
                unitCode: target.kavlingCode,
                journalId: jrnId,
                createdBy: `${actorName} (${actorRole})`,
                createdAt: now,
                history: [{ id: `h-${Date.now()}`, timestamp: now, actor: `${actorName} (${actorRole})`, action: `Auto-Sync Tahap ${stage}` }],
              };
              nextJournals = [newJrn, ...nextJournals];
              nextCashTx = [newKm, ...nextCashTx];
              nextCoa = nextCoa.map((c) => {
                if (c.code === (target.companyId === 'PT_BPP' ? '1-1120' : '1-1110') || c.code === '2-2100') {
                  return { ...c, balance: c.balance + feeAmount };
                }
                return c;
              });

              const notifKeu: ApprovalNotificationItem = {
                id: `NTF-BF-${Date.now()}`,
                targetRole: 'KEUANGAN',
                title: `Booking / SPR Baru: ${target.buyerName} (${target.kavlingCode})`,
                message: `Marketing memperbarui status ${target.buyerName} ke ${stage}. Auto-Jurnal Booking Fee Rp${feeAmount.toLocaleString('id-ID')} otomatis masuk ke Kas & Laporan Keuangan.`,
                category: 'KEUANGAN',
                referenceId: target.id,
                companyId: target.companyId,
                amount: feeAmount,
                status: stage,
                actionPath: '/keuangan/kas-masuk',
                requester: `${actorName} (${actorRole})`,
                isRead: false,
                createdBy: s.currentUser?.id || 'marketing',
                createdAt: now,
                updatedAt: now,
              };
              syncApprovalNotificationToFirestore(notifKeu);
              nextNotifications = [notifKeu, ...nextNotifications];
            }
          }

          // Jika pindah ke tahap Akad, otomatis posting Jurnal Penjualan & Pengakuan HPP + Notifikasi Direktur & Keuangan
          if (stage === 'Akad' && target.stage !== 'Akad') {
            const refAkad = `AKAD-${target.id}`;
            if (!s.journals.some((j) => j.reference === refAkad)) {
              const salePrice = target.price || 169000000;
              const unitLot = s.kavling.find((k) => k.id === target.kavlingId || k.code === target.kavlingCode);
              const hppVal = unitLot?.hpp || 67651710;
              const jrnSaleId = `JRN-AKAD-${Date.now().toString().slice(-5)}`;
              const jrnHppId = `JRN-HPP-${Date.now().toString().slice(-5)}`;

              const jrnSale: JournalEntry = {
                id: jrnSaleId,
                date: now.slice(0, 10),
                companyId: target.companyId,
                reference: refAkad,
                description: `[Auto-Sync Akad KPR] Pencairan Akad ${target.buyerName} (${target.bank}) - Unit ${target.kavlingCode}`,
                debitAccount: '1-1210 Bank BTN',
                creditAccount: '4-1100 Penjualan Rumah Subsidi (Rp169 Jt)',
                amount: salePrice,
                autoGenerated: true,
              };
              const jrnHpp: JournalEntry = {
                id: jrnHppId,
                date: now.slice(0, 10),
                companyId: target.companyId,
                reference: `HPP-${target.id}`,
                description: `[Auto-Sync HPP Akad] Pengakuan HPP Konstruksi Unit ${target.kavlingCode} (${target.buyerName})`,
                debitAccount: '5-1100 HPP Rumah Subsidi Tipe 36',
                creditAccount: '1-3100 Persediaan Rumah Jadi (Siap Jual)',
                amount: hppVal,
                autoGenerated: true,
              };
              const kmAkad: CashTransactionRecord = {
                id: `KM-AKAD-${Date.now().toString().slice(-5)}`,
                type: 'KAS_MASUK',
                date: now.slice(0, 10),
                companyId: target.companyId,
                sourceOrPurpose: 'Penjualan Unit (Cash/KPR)',
                category: 'Pencairan Akad KPR (Auto-Sync)',
                amount: salePrice,
                cashAccount: '1-1210 Bank BTN',
                counterAccount: '4-1100 Penjualan Rumah Subsidi (Rp169 Jt)',
                debitAccount: '1-1210 Bank BTN',
                creditAccount: '4-1100 Penjualan Rumah Subsidi (Rp169 Jt)',
                description: jrnSale.description,
                consumerName: target.buyerName,
                unitCode: target.kavlingCode,
                journalId: jrnSaleId,
                createdBy: `${actorName} (${actorRole})`,
                createdAt: now,
                history: [{ id: `h-akad-${Date.now()}`, timestamp: now, actor: `${actorName} (${actorRole})`, action: 'Auto-Sync Realisasi Akad KPR' }],
              };

              nextJournals = [jrnSale, jrnHpp, ...nextJournals];
              nextCashTx = [kmAkad, ...nextCashTx];
              nextCoa = nextCoa.map((c) => {
                if (c.code === '1-1210' || c.code === '4-1100') return { ...c, balance: c.balance + salePrice };
                if (c.code === '5-1100') return { ...c, balance: c.balance + hppVal };
                if (c.code === '1-3100') return { ...c, balance: Math.max(0, c.balance - hppVal) };
                return c;
              });

              const notifDir: ApprovalNotificationItem = {
                id: `NTF-AKAD-${Date.now()}`,
                targetRole: 'DIREKTUR',
                title: `Realisasi Akad KPR: ${target.buyerName} (${target.kavlingCode})`,
                message: `Unit ${target.kavlingCode} telah Akad KPR (${target.bank}) senilai Rp${salePrice.toLocaleString('id-ID')}. Jurnal Penjualan, HPP, Laba Rugi & Neraca otomatis diperbarui.`,
                category: 'KEUANGAN',
                referenceId: target.id,
                companyId: target.companyId,
                amount: salePrice,
                status: 'Akad',
                actionPath: '/laporan/laba-rugi',
                requester: `${actorName} (${actorRole})`,
                isRead: false,
                createdBy: s.currentUser?.id || 'marketing',
                createdAt: now,
                updatedAt: now,
              };
              syncApprovalNotificationToFirestore(notifDir);
              nextNotifications = [notifDir, ...nextNotifications];
            }
          }

          syncErpRecordToFirestore({
            id,
            collectionName: 'bookings',
            companyId: target.companyId,
            title: `${target.buyerName} - Kavling ${target.kavlingCode}`,
            status: stage,
            amount: target.price,
          });

          return {
            bookings: s.bookings.map((b) =>
              b.id === id
                ? {
                    ...b,
                    stage,
                    bookingFee:
                      (stage === 'Booking' || stage === 'SPR') && (!b.bookingFee || b.bookingFee === 0)
                        ? 2000000
                        : b.bookingFee,
                  }
                : b
            ),
            kavling: nextKavling,
            journals: nextJournals,
            cashTransactions: nextCashTx,
            coa: nextCoa,
            approvalNotifications: nextNotifications,
            activityLogs: [
              {
                id: `act-${Date.now()}`,
                user: actorName,
                role: actorRole,
                action: `Update Pipeline ${target.buyerName} (${target.kavlingCode}) → ${stage} (Auto-Sync Kavling & Keuangan)`,
                module: 'Marketing & KPR',
                timestamp: 'Baru saja',
              },
              ...s.activityLogs,
            ],
          };
        }),

      addQuickProspect: (payload) => {
        const state = get();
        const now = new Date();
        const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const nextNum = state.bookings.length + 1;
        const prospectCode = `PRS-${ym}-${String(nextNum).padStart(4, '0')}`;
        const todayStr = now.toISOString().slice(0, 10);
        const createdAt = `${todayStr} ${now.toTimeString().slice(0, 5)}`;

        const sourceWeight: Record<ProspectSource, number> = {
          'Walk-in': 88,
          Referral: 85,
          Website: 78,
          IG: 75,
          FB: 72,
          Lainnya: 65,
        };
        let score = sourceWeight[payload.source] || 70;
        if (payload.email) score += 4;
        if (payload.budget && payload.budget > 0) score += 5;
        if (payload.unitType) score += 3;
        score = Math.min(99, score);

        const companyId: 'PT_TBL' | 'PT_BPP' =
          payload.projectInterest === 'Bahagia Residence' ? 'PT_BPP' : 'PT_TBL';

        const availableLot =
          state.kavling.find((k) => k.companyId === companyId && k.status === 'Tersedia') ||
          state.kavling[0];

        const newProspect: BookingRecord = {
          id: prospectCode,
          prospectCode,
          buyerName: payload.buyerName.trim(),
          nik: '-',
          phone: payload.phone.trim(),
          email: payload.email?.trim() || '',
          companyId,
          projectInterest: payload.projectInterest,
          source: payload.source,
          kavlingId: availableLot?.id || (companyId === 'PT_BPP' ? 'BPP-A-01' : 'TBL-A-01'),
          kavlingCode: availableLot?.code || 'Belum Pilih',
          bank: 'BTN',
          bookingFee: 0,
          price: payload.budget || 169000000,
          stage: 'Prospek',
          createdAt,
          marketingPic: payload.marketingPic,
          address: payload.address,
          budget: payload.budget,
          unitType: payload.unitType || '36/91',
          notes: payload.notes,
          leadScore: score,
          lastFollowUpDate: todayStr,
          nextFollowUpDate: todayStr,
          followUpHistory: [],
        };

        set((s) => ({
          bookings: [newProspect, ...s.bookings],
          activityLogs: [
            {
              id: `act-${Date.now()}`,
              user: payload.marketingPic,
              role: s.currentUser?.role || 'MARKETING',
              action: `Input Cepat Prospek ${prospectCode} (${payload.buyerName} - ${payload.source})`,
              module: 'Marketing',
              timestamp: 'Baru saja',
            },
            ...s.activityLogs,
          ],
        }));

        syncErpRecordToFirestore({
          id: prospectCode,
          collectionName: 'bookings',
          companyId,
          title: `Prospek ${payload.buyerName} (${payload.projectInterest})`,
          status: 'Prospek',
          amount: payload.budget || 169000000,
        });

        return newProspect;
      },

      bulkAddProspects: (rows, defaultPic) => {
        const state = get();
        const now = new Date();
        const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const todayStr = now.toISOString().slice(0, 10);
        const createdAt = `${todayStr} ${now.toTimeString().slice(0, 5)}`;

        const newRecords: BookingRecord[] = rows
          .filter((r) => r.buyerName && r.phone)
          .map((r, idx) => {
            const seq = state.bookings.length + idx + 1;
            const prospectCode = `PRS-${ym}-${String(seq).padStart(4, '0')}`;
            const companyId: 'PT_TBL' | 'PT_BPP' =
              r.projectInterest === 'Bahagia Residence' ? 'PT_BPP' : 'PT_TBL';
            return {
              id: prospectCode,
              prospectCode,
              buyerName: r.buyerName.trim(),
              nik: '-',
              phone: r.phone.trim(),
              email: r.email || '',
              companyId,
              projectInterest: r.projectInterest || 'Bahagia Land',
              source: r.source || 'Walk-in',
              kavlingId: companyId === 'PT_BPP' ? 'BPP-A-01' : 'TBL-A-01',
              kavlingCode: 'Belum Pilih',
              bank: 'BTN',
              bookingFee: 0,
              price: 169000000,
              stage: 'Prospek',
              createdAt,
              marketingPic: defaultPic,
              unitType: r.unitType || '36/91',
              notes: r.notes || 'Import Bulk Pameran',
              leadScore: 80,
              lastFollowUpDate: todayStr,
              nextFollowUpDate: todayStr,
              followUpHistory: [],
            };
          });

        if (newRecords.length > 0) {
          set((s) => ({
            bookings: [...newRecords, ...s.bookings],
            activityLogs: [
              {
                id: `act-${Date.now()}`,
                user: defaultPic,
                role: s.currentUser?.role || 'MARKETING',
                action: `Import Excel Bulk ${newRecords.length} Prospek Baru sekaligus`,
                module: 'Marketing',
                timestamp: 'Baru saja',
              },
              ...s.activityLogs,
            ],
          }));
        }

        return newRecords.length;
      },

      addProspectFollowUp: (id, payload) =>
        set((s) => {
          const now = new Date();
          const todayStr = now.toISOString().slice(0, 10);
          const timestamp = `${todayStr} ${now.toTimeString().slice(0, 5)}`;
          const actor = s.currentUser?.name || 'Marketing PIC';

          const entry: ProspectFollowUpLog = {
            id: `fu-${Date.now()}`,
            date: timestamp,
            method: payload.method,
            result: payload.result,
            notes: payload.notes,
            nextFollowUpDate: payload.nextFollowUpDate,
            by: actor,
          };

          return {
            bookings: s.bookings.map((b) => {
              if (b.id !== id) return b;
              const nextStage = b.stage === 'Prospek' ? 'Follow-up' : b.stage;
              return {
                ...b,
                stage: nextStage,
                lastFollowUpDate: todayStr,
                nextFollowUpDate: payload.nextFollowUpDate || todayStr,
                followUpHistory: [entry, ...(b.followUpHistory || [])],
              };
            }),
            activityLogs: [
              {
                id: `act-${Date.now()}`,
                user: actor,
                role: s.currentUser?.role || 'MARKETING',
                action: `Follow-up (${payload.method} - ${payload.result}) pada prospek ${id}`,
                module: 'Marketing',
                timestamp: 'Baru saja',
              },
              ...s.activityLogs,
            ],
          };
        }),

      updateProspectDetails: (id, patch) =>
        set((s) => ({
          bookings: s.bookings.map((b) => (b.id === id ? { ...b, ...patch } : b)),
        })),

      deleteProspect: (id) =>
        set((s) => {
          const target = s.bookings.find((b) => b.id === id);
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          return {
            bookings: s.bookings.filter((b) => b.id !== id),
            trashItems: target
              ? [
                  {
                    id: target.id,
                    collection: 'bookings',
                    title: `${target.prospectCode || target.id} - ${target.buyerName} (${target.phone})`,
                    deletedAt: now,
                  },
                  ...s.trashItems,
                ]
              : s.trashItems,
          };
        }),

      addComplaint: (payload) => {
        const state = get();
        const nextNum = state.complaints.length + 1;
        const id = `TKT-2026-${String(nextNum).padStart(4, '0')}`;
        const createdAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
        const newTicket: ComplaintRecord = {
          ...payload,
          id,
          createdAt,
          status: 'Baru',
        };

        const notifPengawas: ApprovalNotificationItem = {
          id: `NTF-TKT-${Date.now()}`,
          targetRole: 'PENGAWAS',
          title: `Tiket Komplain Baru ${id} — Kavling ${payload.kavlingCode}`,
          message: `${payload.reporterName} melaporkan "${payload.category}" pada Kavling ${payload.kavlingCode}.`,
          category: 'KOMPLAIN',
          referenceId: id,
          companyId: payload.companyId,
          amount: 0,
          status: 'Baru',
          actionPath: '/marketing/komplain',
          requester: payload.reporterName,
          isRead: false,
          createdBy: state.currentUser?.id || 'public',
          createdAt,
          updatedAt: createdAt,
        };
        syncApprovalNotificationToFirestore(notifPengawas);

        set((s) => ({
          complaints: [newTicket, ...s.complaints],
          approvalNotifications: [notifPengawas, ...s.approvalNotifications],
          emailLogs: [
            {
              id: `mail-${Date.now()}`,
              eventNumber: 2,
              eventName: '2. Komplain Baru',
              recipient: 'marketing@bahagiagroup.com, pengawas@bahagiagroup.com',
              subject: `[Tiket Komplain] ${id} - Kavling ${payload.kavlingCode}`,
              status: 'Terkirim via Trigger Email',
              timestamp: createdAt,
            },
            ...s.emailLogs,
          ],
          activityLogs: [
            {
              id: `act-${Date.now()}`,
              user: payload.reporterName,
              role: s.currentUser?.role || 'MARKETING',
              action: `Input Tiket Komplain ${id} Kavling ${payload.kavlingCode} (${payload.category})`,
              module: 'Marketing & Komplain',
              timestamp: 'Baru saja',
            },
            ...s.activityLogs,
          ],
        }));

        syncErpRecordToFirestore({
          id,
          collectionName: 'complaints',
          companyId: payload.companyId,
          title: `Komplain ${payload.kavlingCode} - ${payload.category}`,
          status: 'Baru',
        });

        return newTicket;
      },

      updateComplaintStatus: (id, status) =>
        set((s) => {
          const target = s.complaints.find((c) => c.id === id);
          if (!target) return s;
          const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const actorName = s.currentUser?.name || 'Staf Teknis';
          const actorRole = s.currentUser?.role || 'PENGAWAS';

          let nextVerifications = s.verifications;
          let nextNotifications = s.approvalNotifications;

          if (status === 'Verifikasi PJT') {
            const verId = `VER-KMP-${id}`;
            if (!s.verifications.some((v) => v.id === verId)) {
              const newVer: VerificationItem = {
                id: verId,
                type: 'Progress',
                title: `Verifikasi Perbaikan Komplain ${id} - Kavling ${target.kavlingCode} (${target.category})`,
                companyId: target.companyId,
                kavlingOrArea: `Kavling ${target.kavlingCode}`,
                requester: `${target.assignedPic} (Pengawas)`,
                amount: 0,
                volumeSpec: `Perbaikan: ${target.description}`,
                status: 'Menunggu Verifikasi PJT',
                technicalNotes: `Perbaikan fisik komplain konsumen ${target.reporterName} telah diselesaikan Pengawas, menunggu pengecekan mutu PJT.`,
                createdAt: nowStr,
              };
              nextVerifications = [newVer, ...nextVerifications];
            }
            const notifPjt: ApprovalNotificationItem = {
              id: `NTF-KMP-PJT-${Date.now()}`,
              targetRole: 'PJT',
              title: `Verifikasi Perbaikan Komplain ${target.kavlingCode} (${id})`,
              message: `Pengawas telah menyelesaikan perbaikan "${target.category}" pada Kavling ${target.kavlingCode}. Mohon verifikasi teknis PJT.`,
              category: 'VERIFIKASI_PJT',
              referenceId: id,
              companyId: target.companyId,
              amount: 0,
              status: 'Verifikasi PJT',
              actionPath: '/project/verifikasi',
              requester: `${actorName} (${actorRole})`,
              isRead: false,
              createdBy: s.currentUser?.id || 'pengawas',
              createdAt: nowStr,
              updatedAt: nowStr,
            };
            syncApprovalNotificationToFirestore(notifPjt);
            nextNotifications = [notifPjt, ...nextNotifications];
          }

          return {
            complaints: s.complaints.map((c) => (c.id === id ? { ...c, status } : c)),
            verifications: nextVerifications,
            approvalNotifications: nextNotifications,
            activityLogs: [
              {
                id: `act-${Date.now()}`,
                user: actorName,
                role: actorRole,
                action: `Update Status Komplain ${id} (Kavling ${target.kavlingCode}) → ${status}`,
                module: 'Layanan Komplain',
                timestamp: 'Baru saja',
              },
              ...s.activityLogs,
            ],
          };
        }),

      deleteComplaint: (id) =>
        set((s) => {
          const target = s.complaints.find((c) => c.id === id);
          if (!target) return s;
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          return {
            complaints: s.complaints.filter((c) => c.id !== id),
            trashItems: [
              {
                id: `tr-cmp-${Date.now()}`,
                collection: 'complaints',
                title: `Komplain ${target.id} - ${target.reporterName} (${target.kavlingCode})`,
                deletedAt: now,
              },
              ...s.trashItems,
            ],
          };
        }),

      updateKavlingStatusAndProgress: (id, status, progress, notes) =>
        set((s) => {
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const target = s.kavling.find((k) => k.id === id);
          const actorName = s.currentUser?.name || 'Pengawas Lapangan';
          const actorRole = s.currentUser?.role || 'PENGAWAS';

          // Sinkronkan juga ke BookingRecord bila ada booking aktif di kavling ini
          const nextBookings = target
            ? s.bookings.map((b) => {
                if (b.kavlingId === target.id || (b.kavlingCode === target.code && b.companyId === target.companyId)) {
                  const stageFromKavling: Partial<Record<KavlingLot['status'], BookingRecord['stage']>> = {
                    Booking: 'Booking',
                    'Proses KPR': 'Proses KPR',
                    Akad: 'Akad',
                    'Serah Terima': 'Selesai',
                  };
                  const mappedStage = stageFromKavling[status];
                  if (mappedStage && b.stage !== 'Lost') {
                    return { ...b, stage: mappedStage };
                  }
                }
                return b;
              })
            : s.bookings;

          // Otomatis masukkan ke antrean Verifikasi PJT bila progress berubah
          let nextVerifications = s.verifications;
          let nextNotifications = s.approvalNotifications;
          if (target && progress !== target.progress) {
            const verId = `VER-PRG-${target.id}`;
            const existingVer = s.verifications.find((v) => v.id === verId);
            const verItem: VerificationItem = {
              id: verId,
              type: 'Progress',
              title: `Verifikasi Progress Fisik ${progress}% Unit ${target.id} (${target.projectName})`,
              companyId: target.companyId,
              kavlingOrArea: `Kavling ${target.code}`,
              requester: `${actorName} (${actorRole})`,
              amount: 0,
              volumeSpec: `Progress fisik lapangan diperbarui dari ${target.progress}% menjadi ${progress}%`,
              status: 'Menunggu Verifikasi PJT',
              technicalNotes: notes || target.pengawasNotes || 'Update progress fisik lapangan oleh Pengawas.',
              createdAt: existingVer?.createdAt || now,
            };
            nextVerifications = existingVer
              ? s.verifications.map((v) => (v.id === verId ? verItem : v))
              : [verItem, ...s.verifications];

            const notifPjt: ApprovalNotificationItem = {
              id: `NTF-PRG-${Date.now()}`,
              targetRole: 'PJT',
              title: `Update Progress ${progress}% Kavling ${target.code} Menunggu Verifikasi PJT`,
              message: `${actorName} memperbarui progress fisik Kavling ${target.code} (${target.projectName}) ke ${progress}%.`,
              category: 'VERIFIKASI_PJT',
              referenceId: verId,
              companyId: target.companyId,
              amount: progress,
              status: 'Menunggu Verifikasi PJT',
              actionPath: '/project/verifikasi',
              requester: `${actorName} (${actorRole})`,
              isRead: false,
              createdBy: s.currentUser?.id || 'pengawas',
              createdAt: now,
              updatedAt: now,
            };
            syncApprovalNotificationToFirestore(notifPjt);
            nextNotifications = [notifPjt, ...nextNotifications];
          }

          return {
            kavling: s.kavling.map((k) =>
              k.id === id
                ? {
                    ...k,
                    status,
                    progress,
                    pengawasNotes: notes ?? k.pengawasNotes,
                    pjtVerified: progress === 100 ? k.pjtVerified : false,
                  }
                : k
            ),
            bookings: nextBookings,
            verifications: nextVerifications,
            approvalNotifications: nextNotifications,
            emailLogs: [
              {
                id: `mail-${Date.now()}`,
                eventNumber: 6,
                eventName: '6. Progress Update → PJT',
                recipient: 'pjt@bahagiagroup.com',
                subject: `[Inspeksi PJT] Update Progress ${progress}% Kavling ${id}`,
                status: 'Terkirim via Trigger Email',
                timestamp: now,
              },
              ...s.emailLogs,
            ],
            activityLogs: [
              {
                id: `act-${Date.now()}`,
                user: actorName,
                role: actorRole,
                action: `Update Kavling ${id}: Status ${status} · Progress ${progress}% (Auto-Sync PJT)`,
                module: 'Project & Konstruksi',
                timestamp: 'Baru saja',
              },
              ...s.activityLogs,
            ],
          };
        }),

      createVerificationSubmission: (payload) =>
        set((s) => {
          const id = `VER-${payload.type.toUpperCase()}-${Date.now().toString().slice(-4)}`;
          const createdAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const item: VerificationItem = {
            ...payload,
            id,
            createdAt,
            status: 'Menunggu Verifikasi PJT',
          };
          syncErpRecordToFirestore({
            id,
            collectionName: 'verifications',
            companyId: payload.companyId,
            title: payload.title,
            status: item.status,
            amount: payload.amount,
          });
          const pjtNotif: ApprovalNotificationItem = {
            id: `NTF-${id}`,
            targetRole: 'PJT',
            title: `Pengajuan ${payload.type} Baru Menunggu Verifikasi PJT`,
            message: `${id} - ${payload.title} (${payload.kavlingOrArea}) diajukan oleh ${payload.requester}.`,
            category: 'VERIFIKASI_PJT',
            referenceId: id,
            companyId: payload.companyId,
            amount: payload.amount,
            status: 'Menunggu Verifikasi PJT',
            actionPath: '/project/verifikasi',
            requester: payload.requester,
            isRead: false,
            createdBy: s.currentUser?.id || 'pengawas',
            createdAt,
            updatedAt: createdAt,
          };
          syncApprovalNotificationToFirestore(pjtNotif);
          return {
            verifications: [item, ...s.verifications],
            approvalNotifications: [pjtNotif, ...s.approvalNotifications],
            emailLogs: [
              {
                id: `mail-${Date.now()}`,
                eventNumber: payload.type === 'RAB' ? 3 : payload.type === 'Opname' ? 8 : 6,
                eventName: `${payload.type} Diajukan ke PJT`,
                recipient: 'pjt@bahagiagroup.com',
                subject: `[Menunggu Verifikasi PJT] ${payload.title}`,
                status: 'Terkirim via Trigger Email',
                timestamp: createdAt,
              },
              ...s.emailLogs,
            ],
            activityLogs: [
              {
                id: `act-${Date.now()}`,
                user: payload.requester,
                role: s.currentUser?.role || 'PENGAWAS',
                action: `Mengajukan ${payload.type} Baru (${id}) untuk Verifikasi PJT`,
                module: 'Project & PJT',
                timestamp: 'Baru saja',
              },
              ...s.activityLogs,
            ],
          };
        }),

      pjtVerifyAction: (id, decision, notes) =>
        set((s) => {
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const pjtName = s.currentUser?.name || 'Ir. Lukman Hakim, S.T., IPM (PJT)';
          const sigHash = `SIG-PJT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
          const targetVer = s.verifications.find((v) => v.id === id);

          // Jika diverifikasi OK oleh PJT, otomatis tandai pjtVerified = true pada kavling terkait
          const nextKavling =
            decision === 'OK' && targetVer
              ? s.kavling.map((k) => {
                  if (
                    targetVer.id === `VER-PRG-${k.id}` ||
                    targetVer.kavlingOrArea.includes(k.code) ||
                    targetVer.title.includes(k.id)
                  ) {
                    return { ...k, pjtVerified: true };
                  }
                  return k;
                })
              : s.kavling;

          // Jika verifikasi terkait tiket komplain, otomatis ubah tiket komplain menjadi Selesai
          const nextComplaints =
            decision === 'OK' && targetVer && targetVer.id.startsWith('VER-KMP-')
              ? s.complaints.map((c) =>
                  targetVer.id === `VER-KMP-${c.id}` ? { ...c, status: 'Selesai' as const } : c
                )
              : s.complaints;

          let nextNotifications = s.approvalNotifications.map((n) =>
            n.referenceId === id
              ? { ...n, isRead: true, status: decision === 'OK' ? 'Diverifikasi PJT' : 'Rejected PJT', updatedAt: now }
              : n
          );
          if (targetVer && decision === 'OK' && targetVer.type !== 'Progress') {
            const dirNotif: ApprovalNotificationItem = {
              id: `NTF-DIR-${id}-${Date.now().toString().slice(-4)}`,
              targetRole: 'DIREKTUR',
              title: `${targetVer.type} Terverifikasi PJT → Menunggu Approval Direktur`,
              message: `${id} - ${targetVer.title} (Rp${targetVer.amount.toLocaleString('id-ID')}) telah diverifikasi teknis oleh ${pjtName}.`,
              category: 'APPROVAL',
              referenceId: id,
              companyId: targetVer.companyId,
              amount: targetVer.amount,
              status: 'Menunggu Approval Direktur',
              actionPath: '/approval',
              requester: pjtName,
              isRead: false,
              createdBy: s.currentUser?.id || 'pjt',
              createdAt: now,
              updatedAt: now,
            };
            syncApprovalNotificationToFirestore(dirNotif);
            nextNotifications = [dirNotif, ...nextNotifications];
          } else if (targetVer && decision === 'REJECT') {
            const pgwNotif: ApprovalNotificationItem = {
              id: `NTF-PGW-${id}-${Date.now().toString().slice(-4)}`,
              targetRole: 'PENGAWAS',
              title: `${targetVer.type} Ditolak / Minta Revisi oleh PJT`,
              message: `${id} - ${targetVer.title} perlu diperbaiki oleh Pengawas. Catatan PJT: ${notes || 'Periksa kembali spesifikasi'}`,
              category: 'VERIFIKASI_PJT',
              referenceId: id,
              companyId: targetVer.companyId,
              amount: targetVer.amount,
              status: 'Rejected PJT',
              actionPath: '/project/verifikasi',
              requester: pjtName,
              isRead: false,
              createdBy: s.currentUser?.id || 'pjt',
              createdAt: now,
              updatedAt: now,
            };
            syncApprovalNotificationToFirestore(pgwNotif);
            nextNotifications = [pgwNotif, ...nextNotifications];
          }

          return {
            kavling: nextKavling,
            complaints: nextComplaints,
            verifications: s.verifications.map((v) => {
              if (v.id !== id) return v;
              const nextStatus =
                decision === 'REJECT'
                  ? 'Rejected PJT'
                  : v.type === 'Progress'
                  ? 'Approved Direktur'
                  : 'Menunggu Approval Direktur';
              return {
                ...v,
                status: nextStatus,
                technicalNotes: notes || v.technicalNotes,
                pjtVerifiedBy: pjtName,
                pjtVerifiedAt: now,
                pjtSignatureHash: decision === 'OK' ? sigHash : undefined,
              };
            }),
            approvalNotifications: nextNotifications,
            emailLogs: [
              {
                id: `mail-${Date.now()}`,
                eventNumber: decision === 'OK' ? 4 : 7,
                eventName: decision === 'OK' ? 'Diverifikasi PJT → Direktur' : 'Ditolak Teknis oleh PJT',
                recipient: decision === 'OK' ? 'direktur@bahagiagroup.com' : 'pengawas@bahagiagroup.com',
                subject: `[PJT ${decision}] Dokumen Teknis ${id}`,
                status: 'Terkirim via Trigger Email',
                timestamp: now,
              },
              ...s.emailLogs,
            ],
            activityLogs: [
              {
                id: `act-${Date.now()}`,
                user: pjtName,
                role: 'PJT',
                action: `${decision === 'OK' ? 'Verifikasi Teknis OK & Tanda Tangan QR' : 'Reject Teknis'} pada ${id}`,
                module: 'Project & PJT',
                timestamp: 'Baru saja',
              },
              ...s.activityLogs,
            ],
          };
        }),

      directorApproveAction: (id, decision, adjustedAmount, notes) =>
        set((s) => {
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const dirName = s.currentUser?.name || 'Ir. H. Ahmad Bahagia, M.M. (Direktur)';
          const targetVer = s.verifications.find((v) => v.id === id);
          const finalAmount =
            typeof adjustedAmount === 'number' ? adjustedAmount : targetVer?.amount || 0;

          let nextJournals = s.journals;
          let nextCoa = s.coa;
          let nextKavling = s.kavling;

          // Jika Direktur menyetujui Opname Upah Mandor, otomatis posting Jurnal Utang Upah Tukang vs WIP Konstruksi
          if (targetVer && decision === 'APPROVE' && targetVer.type === 'Opname' && finalAmount > 0) {
            const refOpn = `OPN-${targetVer.id}`;
            if (!s.journals.some((j) => j.reference === refOpn)) {
              const jrnOpn: JournalEntry = {
                id: `JRN-OPN-${Date.now().toString().slice(-5)}`,
                date: now.slice(0, 10),
                companyId: targetVer.companyId,
                reference: refOpn,
                description: `[Auto-Jurnal Opname Approved Direktur] ${targetVer.title} (${targetVer.kavlingOrArea})`,
                debitAccount: '1-3300 Bangunan Dalam Penyelesaian (WIP)',
                creditAccount: '2-1100 Utang Upah Tukang',
                amount: finalAmount,
                autoGenerated: true,
              };
              nextJournals = [jrnOpn, ...nextJournals];
              nextCoa = nextCoa.map((c) => {
                if (c.code === '1-3300' || c.code === '2-1100') {
                  return { ...c, balance: c.balance + finalAmount };
                }
                return c;
              });
            }
          }

          // Jika Direktur menyetujui BAST, otomatis update status kavling menjadi Serah Terima & progress 100%
          if (targetVer && decision === 'APPROVE' && targetVer.type === 'BAST') {
            nextKavling = s.kavling.map((k) => {
              if (targetVer.kavlingOrArea.includes(k.code) || targetVer.title.includes(k.id)) {
                return { ...k, status: 'Serah Terima', progress: 100, pjtVerified: true };
              }
              return k;
            });
          }

          let nextNotifications = s.approvalNotifications.map((n) =>
            n.referenceId === id
              ? { ...n, isRead: true, status: decision === 'APPROVE' ? 'Approved Direktur' : 'Rejected Direktur', updatedAt: now }
              : n
          );
          if (targetVer && decision === 'APPROVE') {
            const keuNotif: ApprovalNotificationItem = {
              id: `NTF-KEU-${id}-${Date.now().toString().slice(-4)}`,
              targetRole: 'KEUANGAN',
              title: `Pengajuan ${targetVer.type} Disetujui Direktur → Siap Pencairan Keuangan`,
              message: `${id} - ${targetVer.title} (Rp${finalAmount.toLocaleString('id-ID')}) telah di-Approve Direktur.`,
              category: 'PENGAJUAN_DANA',
              referenceId: id,
              companyId: targetVer.companyId,
              amount: finalAmount,
              status: 'Approved Direktur',
              actionPath: '/keuangan/pengajuan-dana',
              requester: dirName,
              isRead: false,
              createdBy: s.currentUser?.id || 'direktur',
              createdAt: now,
              updatedAt: now,
            };
            syncApprovalNotificationToFirestore(keuNotif);
            nextNotifications = [keuNotif, ...nextNotifications];
          }
          return {
            verifications: s.verifications.map((v) =>
              v.id === id
                ? {
                    ...v,
                    amount: finalAmount,
                    technicalNotes: notes ? `${v.technicalNotes} | Catatan Direktur: ${notes}` : v.technicalNotes,
                    status: decision === 'APPROVE' ? 'Approved Direktur' : 'Rejected Direktur',
                    directorApprovedBy: dirName,
                    directorApprovedAt: now,
                  }
                : v
            ),
            journals: nextJournals,
            coa: nextCoa,
            kavling: nextKavling,
            approvalNotifications: nextNotifications,
            emailLogs: [
              {
                id: `mail-${Date.now()}`,
                eventNumber: 5,
                eventName: '5. Keputusan Single Approval Direktur',
                recipient: 'keuangan@bahagiagroup.com, pengawas@bahagiagroup.com',
                subject: `[Direktur ${decision}] Pengajuan ${id} Siap Diproses Keuangan`,
                status: 'Terkirim via Trigger Email',
                timestamp: now,
              },
              ...s.emailLogs,
            ],
            activityLogs: [
              {
                id: `act-${Date.now()}`,
                user: dirName,
                role: 'DIREKTUR',
                action: `Single Approval (${decision}) untuk pengajuan ${id} (Auto-Sync Keuangan & Laporan)`,
                module: 'Approval Direktur',
                timestamp: 'Baru saja',
              },
              ...s.activityLogs,
            ],
          };
        }),

      saveProjectSubmission: (payload, submitForApproval) => {
        const state = get();
        const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const sameTypeCount = state.projectSubmissions.filter((p) => p.type === payload.type).length + 1;

        const existingIndex = payload.id ? state.projectSubmissions.findIndex((p) => p.id === payload.id) : -1;
        const existingRecord = existingIndex >= 0 ? state.projectSubmissions[existingIndex] : null;

        const submissionNumber =
          payload.submissionNumber ||
          existingRecord?.submissionNumber ||
          `PPJ/${payload.type}/${year}/${month}/${String(sameTypeCount).padStart(4, '0')}`;

        const id = payload.id || existingRecord?.id || submissionNumber.replace(/\//g, '-');

        // Determine target status when submitted
        let nextStatus: ProjectSubmissionStatus = submitForApproval
          ? payload.type === 'RENOVASI' && payload.rabAmount <= state.approvalLimit
            ? 'Approved'
            : payload.type === 'FASUM' || payload.type === 'RENOVASI'
            ? 'Menunggu Verifikasi Keuangan'
            : 'Menunggu Verifikasi Keuangan'
          : 'Draft';

        const actorName = state.currentUser?.name || payload.requester || 'Ir. Lukman Hakim, S.T., IPM';
        const actorRole = state.currentUser?.role || 'PJT';

        const newHistoryEntry: SubmissionHistoryEntry = {
          id: `hst-${Date.now()}`,
          actorName,
          actorRole,
          action: submitForApproval ? 'Submit Pengajuan Proyek untuk Approval' : 'Simpan Draft Pengajuan Proyek',
          notes: submitForApproval
            ? `Pengajuan ${submissionNumber} dikirim dengan nilai RAB Rp${payload.rabAmount.toLocaleString('id-ID')}`
            : 'Disimpan sebagai draft oleh PJT',
          timestamp: now,
        };

        const record: ProjectSubmissionRecord = {
          ...payload,
          id,
          submissionNumber,
          status: nextStatus,
          approvalHistory: existingRecord
            ? [...existingRecord.approvalHistory, newHistoryEntry]
            : [newHistoryEntry],
          comments: existingRecord ? existingRecord.comments : [],
        };

        set((s) => {
          const updatedList =
            existingIndex >= 0
              ? s.projectSubmissions.map((item, idx) => (idx === existingIndex ? record : item))
              : [record, ...s.projectSubmissions];

          let nextNotifications = s.approvalNotifications;
          if (submitForApproval) {
            const keuNotif: ApprovalNotificationItem = {
              id: `NTF-KEU-${record.id}-${Date.now().toString().slice(-4)}`,
              targetRole: 'KEUANGAN',
              title: `Pengajuan Proyek ${payload.type} Baru Menunggu Verifikasi Keuangan`,
              message: `${submissionNumber} - ${payload.projectName} (RAB Rp${payload.rabAmount.toLocaleString('id-ID')}) diajukan oleh ${actorName}.`,
              category: 'PENGAJUAN_PROYEK',
              referenceId: record.id,
              companyId: payload.companyId,
              amount: payload.rabAmount,
              status: nextStatus,
              actionPath: '/project/pengajuan-proyek',
              requester: `${actorName} (${actorRole})`,
              isRead: false,
              createdBy: s.currentUser?.id || 'pjt',
              createdAt: now,
              updatedAt: now,
            };
            const dirNotif: ApprovalNotificationItem = {
              id: `NTF-DIR-${record.id}-${Date.now().toString().slice(-4)}`,
              targetRole: 'DIREKTUR',
              title: `Alert Pengajuan Proyek Baru (${payload.type}) dari PJT`,
              message: `${submissionNumber} - ${payload.projectName} (RAB Rp${payload.rabAmount.toLocaleString('id-ID')}) sedang dalam antrean verifikasi & approval.`,
              category: 'PENGAJUAN_PROYEK',
              referenceId: record.id,
              companyId: payload.companyId,
              amount: payload.rabAmount,
              status: nextStatus,
              actionPath: '/project/pengajuan-proyek',
              requester: `${actorName} (${actorRole})`,
              isRead: false,
              createdBy: s.currentUser?.id || 'pjt',
              createdAt: now,
              updatedAt: now,
            };
            syncApprovalNotificationToFirestore(keuNotif);
            syncApprovalNotificationToFirestore(dirNotif);
            nextNotifications = [keuNotif, dirNotif, ...s.approvalNotifications];
          }

          return {
            projectSubmissions: updatedList,
            approvalNotifications: nextNotifications,
            emailLogs: submitForApproval
              ? [
                  {
                    id: `mail-${Date.now()}`,
                    eventNumber: 3,
                    eventName: `Pengajuan Proyek ${payload.type} Diajukan PJT`,
                    recipient: 'keuangan@bahagiagroup.com, direktur@bahagiagroup.com',
                    subject: `[Verifikasi Keuangan] ${submissionNumber} - ${payload.projectName}`,
                    status: 'Terkirim via Trigger Email',
                    timestamp: now,
                  },
                  ...s.emailLogs,
                ]
              : s.emailLogs,
            activityLogs: [
              {
                id: `act-${Date.now()}`,
                user: actorName,
                role: actorRole,
                action: `${submitForApproval ? 'Mengajukan' : 'Menyimpan Draft'} ${submissionNumber} (${payload.projectName})`,
                module: 'Pengajuan Proyek PJT',
                timestamp: 'Baru saja',
              },
              ...s.activityLogs,
            ],
          };
        });

        syncProjectSubmissionToFirestore(
          {
            id: record.id,
            submissionNumber: record.submissionNumber,
            type: record.type,
            projectName: record.projectName,
            companyId: record.companyId,
            rabAmount: record.rabAmount,
            status: record.status,
            requester: record.requester,
            createdAt: record.date,
          },
          record.items.map((it) => ({
            id: it.id,
            category: it.category,
            description: it.description,
            volume: it.volume,
            unit: it.unit,
            unitPrice: it.unitPrice,
            subtotal: it.subtotal,
          }))
        );

        return record;
      },

      verifyProjectSubmissionByFinance: (id, decision, notes) =>
        set((s) => {
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const keuName = s.currentUser?.name || 'Siti Rahmawati, S.E. (Keuangan)';
          const target = s.projectSubmissions.find((p) => p.id === id);
          if (!target) return s;

          const nextStatus: ProjectSubmissionStatus =
            decision === 'OK' ? 'Menunggu Approval Direktur' : 'Rejected';

          const updated: ProjectSubmissionRecord = {
            ...target,
            status: nextStatus,
            approvalHistory: [
              ...target.approvalHistory,
              {
                id: `hst-${Date.now()}`,
                actorName: keuName,
                actorRole: 'KEUANGAN',
                action: decision === 'OK' ? 'Verifikasi Anggaran Keuangan OK' : 'Ditolak oleh Keuangan',
                notes: notes || 'Anggaran telah diverifikasi sesuai pos COA.',
                timestamp: now,
              },
            ],
          };

          syncProjectSubmissionToFirestore({
            id: updated.id,
            submissionNumber: updated.submissionNumber,
            type: updated.type,
            projectName: updated.projectName,
            companyId: updated.companyId,
            rabAmount: updated.rabAmount,
            status: updated.status,
            requester: updated.requester,
            createdAt: updated.date,
          });

          let nextNotifications = s.approvalNotifications.map((n) =>
            n.referenceId === id && n.targetRole === 'KEUANGAN'
              ? { ...n, isRead: true, status: nextStatus, updatedAt: now }
              : n
          );

          if (decision === 'OK') {
            const dirNotif: ApprovalNotificationItem = {
              id: `NTF-DIR-VER-${id}-${Date.now().toString().slice(-4)}`,
              targetRole: 'DIREKTUR',
              title: `Pengajuan Proyek Terverifikasi Keuangan → Menunggu Approval Direktur`,
              message: `${target.submissionNumber} - ${target.projectName} (Rp${target.rabAmount.toLocaleString('id-ID')}) telah diverifikasi oleh ${keuName} dan menunggu persetujuan Direktur.`,
              category: 'PENGAJUAN_PROYEK',
              referenceId: id,
              companyId: target.companyId,
              amount: target.rabAmount,
              status: 'Menunggu Approval Direktur',
              actionPath: '/project/pengajuan-proyek',
              requester: keuName,
              isRead: false,
              createdBy: s.currentUser?.id || 'keuangan',
              createdAt: now,
              updatedAt: now,
            };
            syncApprovalNotificationToFirestore(dirNotif);
            nextNotifications = [dirNotif, ...nextNotifications];
          } else {
            const pjtRejectNotif: ApprovalNotificationItem = {
              id: `NTF-PJT-REJ-${id}-${Date.now().toString().slice(-4)}`,
              targetRole: 'PJT',
              title: `Pengajuan Proyek ${target.submissionNumber} Ditolak Keuangan`,
              message: `${target.projectName} memerlukan revisi anggaran: ${notes || 'Periksa kembali pos anggaran COA.'}`,
              category: 'PENGAJUAN_PROYEK',
              referenceId: id,
              companyId: target.companyId,
              amount: target.rabAmount,
              status: 'Rejected',
              actionPath: '/project/pengajuan-proyek',
              requester: keuName,
              isRead: false,
              createdBy: s.currentUser?.id || 'keuangan',
              createdAt: now,
              updatedAt: now,
            };
            syncApprovalNotificationToFirestore(pjtRejectNotif);
            nextNotifications = [pjtRejectNotif, ...nextNotifications];
          }

          return {
            projectSubmissions: s.projectSubmissions.map((p) => (p.id === id ? updated : p)),
            approvalNotifications: nextNotifications,
            emailLogs: [
              {
                id: `mail-${Date.now()}`,
                eventNumber: 4,
                eventName: decision === 'OK' ? 'Verifikasi Keuangan OK → Direktur' : 'Pengajuan Ditolak Keuangan',
                recipient: decision === 'OK' ? 'direktur@bahagiagroup.com' : 'pjt@bahagiagroup.com',
                subject: `[Keuangan ${decision}] ${target.submissionNumber} - ${target.projectName}`,
                status: 'Terkirim via Trigger Email',
                timestamp: now,
              },
              ...s.emailLogs,
            ],
            activityLogs: [
              {
                id: `act-${Date.now()}`,
                user: keuName,
                role: 'KEUANGAN',
                action: `Verifikasi Keuangan (${decision}) pada ${target.submissionNumber}`,
                module: 'Pengajuan Proyek',
                timestamp: 'Baru saja',
              },
              ...s.activityLogs,
            ],
          };
        }),

      approveProjectSubmissionByDirector: (id, decision, notes) =>
        set((s) => {
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const dirName = s.currentUser?.name || 'Ir. H. Ahmad Bahagia, M.M. (Direktur)';
          const target = s.projectSubmissions.find((p) => p.id === id);
          if (!target) return s;

          const nextStatus: ProjectSubmissionStatus = decision === 'APPROVE' ? 'Approved' : 'Rejected';

          const updated: ProjectSubmissionRecord = {
            ...target,
            status: nextStatus,
            lahanData:
              target.type === 'LAHAN' && target.lahanData
                ? {
                    ...target.lahanData,
                    acquisitionStage: decision === 'APPROVE' ? 'Menunggu Akuisisi' : target.lahanData.acquisitionStage,
                  }
                : target.lahanData,
            approvalHistory: [
              ...target.approvalHistory,
              {
                id: `hst-${Date.now()}`,
                actorName: dirName,
                actorRole: 'DIREKTUR',
                action: decision === 'APPROVE' ? 'Approved Direktur Utama' : 'Rejected Direktur Utama',
                notes:
                  notes ||
                  (decision === 'APPROVE'
                    ? 'Disetujui Direktur. Lanjutkan ke eksekusi lapangan & pengawasan.'
                    : 'Pengajuan ditolak untuk peninjauan ulang.'),
                timestamp: now,
              },
            ],
          };

          syncProjectSubmissionToFirestore({
            id: updated.id,
            submissionNumber: updated.submissionNumber,
            type: updated.type,
            projectName: updated.projectName,
            companyId: updated.companyId,
            rabAmount: updated.rabAmount,
            status: updated.status,
            requester: updated.requester,
            createdAt: updated.date,
          });

          let nextNotifications = s.approvalNotifications.map((n) =>
            n.referenceId === id
              ? { ...n, isRead: true, status: nextStatus, updatedAt: now }
              : n
          );

          const pjtResultNotif: ApprovalNotificationItem = {
            id: `NTF-PJT-RES-${id}-${Date.now().toString().slice(-4)}`,
            targetRole: 'PJT',
            title: `Pengajuan Proyek ${target.submissionNumber} ${decision === 'APPROVE' ? 'DISETUJUI DIREKTUR' : 'DITOLAK DIREKTUR'}`,
            message: `${target.projectName} (Rp${target.rabAmount.toLocaleString('id-ID')}) telah ${decision === 'APPROVE' ? 'disetujui Direktur Utama untuk eksekusi' : 'ditolak dengan catatan revisi'}.`,
            category: 'PENGAJUAN_PROYEK',
            referenceId: id,
            companyId: target.companyId,
            amount: target.rabAmount,
            status: nextStatus,
            actionPath: '/project/pengajuan-proyek',
            requester: dirName,
            isRead: false,
            createdBy: s.currentUser?.id || 'direktur',
            createdAt: now,
            updatedAt: now,
          };
          syncApprovalNotificationToFirestore(pjtResultNotif);
          nextNotifications = [pjtResultNotif, ...nextNotifications];

          if (decision === 'APPROVE') {
            const keuDisburseNotif: ApprovalNotificationItem = {
              id: `NTF-KEU-DISB-${id}-${Date.now().toString().slice(-4)}`,
              targetRole: 'KEUANGAN',
              title: `Proyek ${target.submissionNumber} Approved Direktur → Siap Pencairan Termin`,
              message: `${target.projectName} (Rp${target.rabAmount.toLocaleString('id-ID')}) telah disetujui Direktur. Keuangan dapat memproses pencairan anggaran.`,
              category: 'PENGAJUAN_DANA',
              referenceId: id,
              companyId: target.companyId,
              amount: target.rabAmount,
              status: 'Approved',
              actionPath: '/keuangan/pengajuan-dana',
              requester: dirName,
              isRead: false,
              createdBy: s.currentUser?.id || 'direktur',
              createdAt: now,
              updatedAt: now,
            };
            syncApprovalNotificationToFirestore(keuDisburseNotif);
            nextNotifications = [keuDisburseNotif, ...nextNotifications];
          }

          // Automatic downstream integration when Approved:
          // - If LAHAN: automatically append to lahanList (/project/lahan)
          // - If FASUM: automatically append to fasumList or fasosList
          let nextLahanList = s.lahanList;
          let nextFasumList = s.fasumList;
          if (decision === 'APPROVE' && target.type === 'LAHAN' && target.lahanData) {
            nextLahanList = [
              ...s.lahanList,
              {
                id: `lhn-${Date.now()}`,
                name: `${target.projectName} (${target.lahanData.acquisitionStage || 'Menunggu Akuisisi'})`,
                unit: 'm²',
                volume: target.lahanData.landArea,
                progress: 0,
                budget: target.rabAmount,
                realized: 0,
                status: 'Menunggu Akuisisi',
              },
            ];
          } else if (decision === 'APPROVE' && target.type === 'FASUM' && target.fasumData) {
            nextFasumList = [
              ...s.fasumList,
              {
                id: `fsm-${Date.now()}`,
                name: `${target.projectName} (${target.fasumData.facilitySubType})`,
                unit: 'Paket',
                volume: 1,
                progress: 0,
                budget: target.rabAmount,
                realized: 0,
                status: 'Approved Direktur - Eksekusi',
              },
            ];
          }

          return {
            projectSubmissions: s.projectSubmissions.map((p) => (p.id === id ? updated : p)),
            approvalNotifications: nextNotifications,
            lahanList: nextLahanList,
            fasumList: nextFasumList,
            emailLogs: [
              {
                id: `mail-${Date.now()}`,
                eventNumber: 5,
                eventName: `Keputusan Direktur (${decision}) Pengajuan Proyek`,
                recipient: 'pjt@bahagiagroup.com, keuangan@bahagiagroup.com, pengawas@bahagiagroup.com',
                subject: `[Direktur ${decision}] ${target.submissionNumber} - ${target.projectName}`,
                status: 'Terkirim via Trigger Email',
                timestamp: now,
              },
              ...s.emailLogs,
            ],
            activityLogs: [
              {
                id: `act-${Date.now()}`,
                user: dirName,
                role: 'DIREKTUR',
                action: `${decision === 'APPROVE' ? 'Approve' : 'Reject'} Pengajuan Proyek ${target.submissionNumber}`,
                module: 'Approval Direktur',
                timestamp: 'Baru saja',
              },
              ...s.activityLogs,
            ],
          };
        }),

      addProjectSubmissionComment: (id, message) =>
        set((s) => {
          if (!message.trim()) return s;
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const authorName = s.currentUser?.name || 'Pejabat Internal';
          const authorRole = s.currentUser?.role || 'PJT';
          return {
            projectSubmissions: s.projectSubmissions.map((p) =>
              p.id === id
                ? {
                    ...p,
                    comments: [
                      ...p.comments,
                      {
                        id: `cmt-${Date.now()}`,
                        authorName,
                        authorRole,
                        message,
                        timestamp: now,
                      },
                    ],
                  }
                : p
            ),
          };
        }),

      updateSubmissionRealizationItem: (submissionId, itemId, realizedVolume, realizedAmount, itemStatus) =>
        set((s) => ({
          projectSubmissions: s.projectSubmissions.map((p) =>
            p.id === submissionId
              ? {
                  ...p,
                  items: p.items.map((it) =>
                    it.id === itemId
                      ? {
                          ...it,
                          realizedVolume,
                          realizedAmount,
                          itemStatus,
                        }
                      : it
                  ),
                }
              : p
          ),
        })),

      advanceLahanAcquisitionStage: (submissionId, stage) =>
        set((s) => ({
          projectSubmissions: s.projectSubmissions.map((p) =>
            p.id === submissionId && p.lahanData
              ? {
                  ...p,
                  lahanData: {
                    ...p.lahanData,
                    acquisitionStage: stage,
                  },
                }
              : p
          ),
        })),

      addSupplier: (payload) => {
        return get().saveSupplierFull(payload);
      },

      saveSupplierFull: (payload) => {
        const state = get();
        const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
        const isEdit = Boolean(payload.id && state.suppliers.some((sup) => sup.id === payload.id));
        const existing = isEdit ? state.suppliers.find((sup) => sup.id === payload.id) : undefined;
        const nextNum = state.suppliers.length + 1;
        const code =
          existing?.code ||
          payload.code ||
          `SUP-2026-${String(nextNum).padStart(4, '0')}`;
        const id = existing?.id || payload.id || `sup-${Date.now()}`;

        const record: SupplierRecord = {
          ...existing,
          ...payload,
          id,
          code,
          status: payload.status || 'Aktif',
          tempoDays: Number(payload.tempoDays) || 30,
          rating: Number(payload.rating) || 5,
          createdAt: existing?.createdAt || now.slice(0, 10),
        };

        set((s) => ({
          suppliers: isEdit
            ? s.suppliers.map((sup) => (sup.id === id ? record : sup))
            : [record, ...s.suppliers],
          activityLogs: [
            {
              id: `act-${Date.now()}`,
              user: s.currentUser?.name || 'Logistik / Purchasing',
              role: s.currentUser?.role || 'LOGISTIK',
              action: `${isEdit ? 'Edit' : 'Tambah'} Supplier ${code} - ${record.name} (${record.bankName} ${record.bankAccount})`,
              module: 'Gudang Logistik',
              timestamp: 'Baru saja',
            },
            ...s.activityLogs,
          ],
        }));

        syncErpRecordToFirestore({
          id,
          collectionName: 'suppliers',
          companyId: 'GROUP',
          title: `${code} - ${record.name}`,
          status: record.status || 'Aktif',
        });

        return record;
      },

      deleteSupplierSoft: (id, reason = 'Dihapus dari daftar Supplier') =>
        set((s) => {
          const target = s.suppliers.find((sup) => sup.id === id);
          if (!target) return s;
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          return {
            suppliers: s.suppliers.filter((sup) => sup.id !== id),
            trashItems: [
              {
                id: target.id,
                collection: 'suppliers',
                title: `Supplier ${target.code} - ${target.name} (${reason})`,
                deletedAt: now,
              },
              ...s.trashItems,
            ],
            activityLogs: [
              {
                id: `act-${Date.now()}`,
                user: s.currentUser?.name || 'Admin Gudang',
                role: s.currentUser?.role || 'LOGISTIK',
                action: `[🗑️ HAPUS SUPPLIER] ${target.code} - ${target.name}. Alasan: ${reason}`,
                module: 'Gudang Logistik',
                timestamp: 'Baru saja',
              },
              ...s.activityLogs,
            ],
          };
        }),

      updateSupplierProductPrice: (supplierId, materialCode, materialName, unit, newPrice) =>
        set((s) => {
          const today = new Date().toISOString().slice(0, 10);
          return {
            suppliers: s.suppliers.map((sup) => {
              if (sup.id !== supplierId) return sup;
              const existingProducts = sup.suppliedProducts || [];
              const hasProd = existingProducts.some(
                (p) => p.materialCode === materialCode || p.materialName === materialName
              );
              const nextProducts = hasProd
                ? existingProducts.map((p) =>
                    p.materialCode === materialCode || p.materialName === materialName
                      ? { ...p, lastPrice: newPrice, updatedAt: today }
                      : p
                  )
                : [
                    ...existingProducts,
                    {
                      id: `sp-${Date.now()}`,
                      materialCode,
                      materialName,
                      unit,
                      lastPrice: newPrice,
                      updatedAt: today,
                    },
                  ];
              return { ...sup, suppliedProducts: nextProducts };
            }),
          };
        }),

      recordInitialStockManual: (payload) => {
        const state = get();
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 16).replace('T', ' ');
        const officerName = `${state.currentUser?.name || 'Petugas Logistik'} (${state.currentUser?.role || 'LOGISTIK'})`;

        const existingItem = payload.existingMaterialId
          ? state.inventory.find((i) => i.id === payload.existingMaterialId)
          : state.inventory.find(
              (i) =>
                i.name.toLowerCase() === payload.materialName.trim().toLowerCase() &&
                i.warehouse === payload.warehouse
            );

        const nextSeq = state.inventory.length + 1;
        const code =
          existingItem?.code ||
          payload.materialCode ||
          `MT-2026-${String(nextSeq).padStart(4, '0')}`;
        const itemId = existingItem?.id || `inv-${Date.now()}`;
        const totalValue = payload.initialStock * payload.unitPrice;
        const journalId = `JRN-2026-${String(state.journals.length + 1).padStart(3, '0')}`;

        const debitAccount =
          payload.materialCategory === 'Bumi'
            ? '1-1320 Persediaan Material Bumi (Pasir, Batu, Bata)'
            : '1-1310 Persediaan Material Toko (Semen, Besi, Cat)';
        const creditAccount = '3-1100 Modal Disetor / Saldo Awal Persediaan';

        const updatedOrNewItem: InventoryRecord = existingItem
          ? {
              ...existingItem,
              materialCategory: payload.materialCategory,
              warehouse: payload.warehouse,
              companyId: payload.companyId,
              unit: payload.unit,
              initialStock: (existingItem.initialStock || 0) + payload.initialStock,
              stock: existingItem.stock + payload.initialStock,
              minStock: payload.minStock,
              unitPrice: payload.unitPrice || existingItem.unitPrice,
              notes: payload.description,
              proofUrl: payload.proofUrl || existingItem.proofUrl,
              updatedAt: payload.date,
            }
          : {
              id: itemId,
              code,
              name: payload.materialName.trim(),
              materialCategory: payload.materialCategory,
              warehouse: payload.warehouse,
              companyId: payload.companyId,
              initialStock: payload.initialStock,
              stockInTotal: 0,
              stockOutTotal: 0,
              stock: payload.initialStock,
              minStock: payload.minStock,
              unit: payload.unit,
              unitPrice: payload.unitPrice,
              notes: payload.description,
              proofUrl: payload.proofUrl,
              status: 'Aktif',
              updatedAt: payload.date,
            };

        const movement: StockMovementRecord = {
          id: `mov-${Date.now()}`,
          referenceNo: code,
          date: payload.date,
          materialId: itemId,
          materialCode: code,
          materialName: updatedOrNewItem.name,
          unit: payload.unit,
          companyId: payload.companyId,
          warehouse: payload.warehouse,
          movementType: 'SALDO_AWAL',
          qtyIn: payload.initialStock,
          qtyOut: 0,
          balanceAfter: updatedOrNewItem.stock,
          unitPrice: payload.unitPrice,
          totalValue,
          description: payload.description || `Input Stok Awal Manual (${payload.warehouse})`,
          proofUrl: payload.proofUrl,
          officerName,
          journalId,
          createdAt: timestamp,
        };

        const newJournal: JournalEntry = {
          id: journalId,
          date: payload.date,
          companyId: payload.companyId,
          reference: code,
          description: `[Stok Awal Gudang] ${updatedOrNewItem.name} (${payload.initialStock} ${payload.unit}) - ${payload.warehouse}`,
          debitAccount,
          creditAccount,
          amount: totalValue,
          autoGenerated: true,
        };

        set((s) => ({
          inventory: existingItem
            ? s.inventory.map((i) => (i.id === itemId ? updatedOrNewItem : i))
            : [updatedOrNewItem, ...s.inventory],
          stockMovements: [movement, ...s.stockMovements],
          journals: totalValue > 0 ? [newJournal, ...s.journals] : s.journals,
          activityLogs: [
            {
              id: `act-${Date.now()}`,
              user: s.currentUser?.name || 'Logistik',
              role: s.currentUser?.role || 'LOGISTIK',
              action: `[+ STOK AWAL] ${code} ${updatedOrNewItem.name}: ${payload.initialStock} ${payload.unit} (Rp${totalValue.toLocaleString('id-ID')})`,
              module: 'Gudang Logistik',
              timestamp: 'Baru saja',
            },
            ...s.activityLogs,
          ],
        }));

        syncErpRecordToFirestore({
          id: itemId,
          collectionName: 'inventory',
          companyId: payload.companyId,
          title: `${code} - ${updatedOrNewItem.name}`,
          status: 'Stok Awal',
          amount: totalValue,
        });

        return updatedOrNewItem;
      },

      recordStockInTransaction: (payload) => {
        const state = get();
        const item = state.inventory.find((i) => i.id === payload.materialId);
        if (!item) return null;

        const now = new Date();
        const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const timestamp = now.toISOString().slice(0, 16).replace('T', ' ');
        const smCount = state.stockMovements.filter((m) => m.movementType === 'MASUK').length + 1;
        const refNo = `SM-${ym}-${String(smCount).padStart(4, '0')}`;
        const totalValue = payload.qtyIn * payload.unitPrice;
        const nextBalance = item.stock + payload.qtyIn;
        const journalId = `JRN-2026-${String(state.journals.length + 1).padStart(3, '0')}`;
        const officerName = `${state.currentUser?.name || 'Petugas Logistik'} (${state.currentUser?.role || 'LOGISTIK'})`;

        const debitAccount =
          item.materialCategory === 'Bumi'
            ? '1-1320 Persediaan Material Bumi (Pasir, Batu, Bata)'
            : '1-1310 Persediaan Material Toko (Semen, Besi, Cat)';
        const creditAccount =
          item.materialCategory === 'Bumi'
            ? '2-1220 Utang Supplier Material Bumi'
            : '2-1210 Utang Supplier Toko';

        const movement: StockMovementRecord = {
          id: `mov-${Date.now()}`,
          referenceNo: refNo,
          date: payload.date,
          materialId: item.id,
          materialCode: item.code,
          materialName: item.name,
          unit: item.unit,
          companyId: payload.companyId,
          warehouse: payload.warehouse || item.warehouse,
          movementType: 'MASUK',
          qtyIn: payload.qtyIn,
          qtyOut: 0,
          balanceAfter: nextBalance,
          unitPrice: payload.unitPrice,
          totalValue,
          supplierId: payload.supplierId,
          supplierName: payload.supplierName,
          poOrInvoiceNo: payload.poOrInvoiceNo,
          description:
            payload.description ||
            `Stok Masuk ${payload.qtyIn} ${item.unit} dari ${payload.supplierName || 'Supplier'}`,
          proofUrl: payload.proofUrl,
          officerName,
          journalId,
          createdAt: timestamp,
        };

        const newJournal: JournalEntry = {
          id: journalId,
          date: payload.date,
          companyId: payload.companyId,
          reference: refNo,
          description: `[Stok Masuk ${refNo}] ${item.name} (${payload.qtyIn} ${item.unit}) - ${payload.supplierName || 'Supplier'}`,
          debitAccount,
          creditAccount,
          amount: totalValue,
          autoGenerated: true,
        };

        set((s) => ({
          inventory: s.inventory.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  stock: nextBalance,
                  stockInTotal: (i.stockInTotal || 0) + payload.qtyIn,
                  unitPrice: payload.unitPrice || i.unitPrice,
                  updatedAt: payload.date,
                }
              : i
          ),
          stockMovements: [movement, ...s.stockMovements],
          journals: [newJournal, ...s.journals],
          activityLogs: [
            {
              id: `act-${Date.now()}`,
              user: s.currentUser?.name || 'Logistik',
              role: s.currentUser?.role || 'LOGISTIK',
              action: `[+ STOK MASUK ${refNo}] ${item.name} +${payload.qtyIn} ${item.unit} → Saldo: ${nextBalance} ${item.unit}`,
              module: 'Gudang Logistik',
              timestamp: 'Baru saja',
            },
            ...s.activityLogs,
          ],
        }));

        return movement;
      },

      recordStockOutTransaction: (payload) => {
        const state = get();
        const item = state.inventory.find((i) => i.id === payload.materialId);
        if (!item) {
          return { ok: false, message: 'Material tidak ditemukan di daftar inventori.' };
        }
        if (payload.qtyOut <= 0) {
          return { ok: false, message: 'Kuantitas keluar harus lebih dari 0.' };
        }
        if (payload.qtyOut > item.stock) {
          return {
            ok: false,
            message: `Kuantitas keluar (${payload.qtyOut} ${item.unit}) melebihi stok saat ini (${item.stock} ${item.unit})!`,
          };
        }

        const now = new Date();
        const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const timestamp = now.toISOString().slice(0, 16).replace('T', ' ');
        const skCount = state.stockMovements.filter((m) => m.movementType === 'KELUAR').length + 1;
        const refNo = `SK-${ym}-${String(skCount).padStart(4, '0')}`;
        const totalValue = payload.qtyOut * item.unitPrice;
        const nextBalance = item.stock - payload.qtyOut;
        const journalId = `JRN-2026-${String(state.journals.length + 1).padStart(3, '0')}`;
        const officerName = `${state.currentUser?.name || 'Petugas Logistik'} (${state.currentUser?.role || 'LOGISTIK'})`;

        const debitAccount =
          payload.purposeType === 'Fasum'
            ? '1-1420 Persediaan Fasum & Infrastruktur Dalam Penyelesaian'
            : '1-1410 Bangunan Dalam Penyelesaian (WIP Konstruksi Unit)';
        const creditAccount =
          item.materialCategory === 'Bumi'
            ? '1-1320 Persediaan Material Bumi (Pasir, Batu, Bata)'
            : '1-1310 Persediaan Material Toko (Semen, Besi, Cat)';

        const movement: StockMovementRecord = {
          id: `mov-${Date.now()}`,
          referenceNo: refNo,
          date: payload.date,
          materialId: item.id,
          materialCode: item.code,
          materialName: item.name,
          unit: item.unit,
          companyId: payload.companyId,
          warehouse: payload.warehouse || item.warehouse,
          movementType: 'KELUAR',
          qtyIn: 0,
          qtyOut: payload.qtyOut,
          balanceAfter: nextBalance,
          unitPrice: item.unitPrice,
          totalValue,
          purposeType: payload.purposeType,
          unitBlockCode: payload.unitBlockCode,
          description:
            payload.description ||
            `Stok Keluar untuk ${payload.purposeType}${payload.unitBlockCode ? ` (${payload.unitBlockCode})` : ''}`,
          proofUrl: payload.proofUrl,
          officerName,
          journalId,
          createdAt: timestamp,
        };

        const newJournal: JournalEntry = {
          id: journalId,
          date: payload.date,
          companyId: payload.companyId,
          reference: refNo,
          description: `[Stok Keluar ${refNo}] Pemakaian ${item.name} (${payload.qtyOut} ${item.unit}) untuk ${payload.purposeType} ${payload.unitBlockCode || ''}`,
          debitAccount,
          creditAccount,
          amount: totalValue,
          autoGenerated: true,
        };

        set((s) => ({
          inventory: s.inventory.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  stock: nextBalance,
                  stockOutTotal: (i.stockOutTotal || 0) + payload.qtyOut,
                  updatedAt: payload.date,
                }
              : i
          ),
          stockMovements: [movement, ...s.stockMovements],
          journals: [newJournal, ...s.journals],
          activityLogs: [
            {
              id: `act-${Date.now()}`,
              user: s.currentUser?.name || 'Logistik',
              role: s.currentUser?.role || 'LOGISTIK',
              action: `[- STOK KELUAR ${refNo}] ${item.name} -${payload.qtyOut} ${item.unit} (${payload.purposeType} ${payload.unitBlockCode || ''}) → Sisa: ${nextBalance} ${item.unit}`,
              module: 'Gudang Logistik',
              timestamp: 'Baru saja',
            },
            ...s.activityLogs,
          ],
        }));

        return {
          ok: true,
          message: `Stok keluar ${refNo} berhasil disimpan. Sisa stok ${item.name}: ${nextBalance} ${item.unit}`,
          movement,
        };
      },

      recordStockOpnameBatch: (payload) => {
        const state = get();
        const now = new Date();
        const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const timestamp = now.toISOString().slice(0, 16).replace('T', ' ');
        const opnCount = state.stockOpnameBatches.length + 1;
        const opnameNo = `OPN-${ym}-${String(opnCount).padStart(4, '0')}`;
        const journalId = `JRN-2026-${String(state.journals.length + 1).padStart(3, '0')}`;

        const rowItems: StockOpnameRowItem[] = [];
        const newMovements: StockMovementRecord[] = [];
        let totalDiffVal = 0;

        const nextInventory = state.inventory.map((inv) => {
          const found = payload.items.find((x) => x.materialId === inv.id);
          if (!found) return inv;

          const diff = found.physicalStock - inv.stock;
          const diffVal = diff * inv.unitPrice;
          totalDiffVal += diffVal;

          rowItems.push({
            materialId: inv.id,
            materialCode: inv.code,
            materialName: inv.name,
            unit: inv.unit,
            systemStock: inv.stock,
            physicalStock: found.physicalStock,
            difference: diff,
            unitPrice: inv.unitPrice,
            differenceValue: diffVal,
            notes: found.notes || 'Penyesuaian fisik Stok Opname',
          });

          if (diff !== 0) {
            newMovements.push({
              id: `mov-opn-${Date.now()}-${inv.id}`,
              referenceNo: opnameNo,
              date: payload.date,
              materialId: inv.id,
              materialCode: inv.code,
              materialName: inv.name,
              unit: inv.unit,
              companyId: payload.companyId,
              warehouse: payload.warehouse,
              movementType: 'OPNAME',
              qtyIn: diff > 0 ? diff : 0,
              qtyOut: diff < 0 ? Math.abs(diff) : 0,
              balanceAfter: found.physicalStock,
              unitPrice: inv.unitPrice,
              totalValue: Math.abs(diffVal),
              description: `Penyesuaian Stok Opname (${opnameNo}): Sistem ${inv.stock} → Fisik ${found.physicalStock} (${found.notes || 'Opname Gudang'})`,
              proofUrl: payload.photoUrl,
              officerName: payload.officerName,
              journalId,
              createdAt: timestamp,
            });
          }

          return {
            ...inv,
            stock: found.physicalStock,
            stockInTotal: diff > 0 ? (inv.stockInTotal || 0) + diff : inv.stockInTotal,
            stockOutTotal: diff < 0 ? (inv.stockOutTotal || 0) + Math.abs(diff) : inv.stockOutTotal,
            updatedAt: payload.date,
          };
        });

        const batchRecord: StockOpnameBatchRecord = {
          id: `opn-${Date.now()}`,
          opnameNo,
          date: payload.date,
          companyId: payload.companyId,
          warehouse: payload.warehouse,
          officerName: payload.officerName,
          signatureText: payload.signatureText || `TTD-${payload.officerName}`,
          generalNotes: payload.generalNotes,
          photoUrl: payload.photoUrl,
          items: rowItems,
          totalDifferenceValue: totalDiffVal,
          journalId: totalDiffVal !== 0 ? journalId : undefined,
          createdAt: timestamp,
        };

        const absDiff = Math.abs(totalDiffVal);
        const opnameJournal: JournalEntry | null =
          absDiff > 0
            ? {
                id: journalId,
                date: payload.date,
                companyId: payload.companyId,
                reference: opnameNo,
                description: `[Auto-Jurnal Selisih Stok Opname ${opnameNo}] Gudang ${payload.warehouse} oleh ${payload.officerName}`,
                debitAccount:
                  totalDiffVal < 0
                    ? '5-1400 Beban Selisih & Kerusakan Persediaan Material'
                    : '1-1310 Persediaan Material Toko (Semen, Besi, Cat)',
                creditAccount:
                  totalDiffVal < 0
                    ? '1-1310 Persediaan Material Toko (Semen, Besi, Cat)'
                    : '4-2200 Pendapatan Lain-lain / Surplus Opname Material',
                amount: absDiff,
                autoGenerated: true,
              }
            : null;

        set((s) => ({
          inventory: nextInventory,
          stockMovements: [...newMovements, ...s.stockMovements],
          stockOpnameBatches: [batchRecord, ...s.stockOpnameBatches],
          journals: opnameJournal ? [opnameJournal, ...s.journals] : s.journals,
          emailLogs: [
            {
              id: `mail-${Date.now()}`,
              eventNumber: 11,
              eventName: '11. Laporan Stok Opname Gudang ke Admin & Direktur',
              recipient: 'admin@bahagiagroup.com, direktur@bahagiagroup.com',
              subject: `[Stok Opname ${opnameNo}] Gudang ${payload.warehouse} - Selisih Rp${totalDiffVal.toLocaleString('id-ID')}`,
              status: 'Terkirim via Trigger Email',
              timestamp,
            },
            ...s.emailLogs,
          ],
          activityLogs: [
            {
              id: `act-${Date.now()}`,
              user: payload.officerName,
              role: s.currentUser?.role || 'LOGISTIK',
              action: `[📊 STOK OPNAME ${opnameNo}] Gudang ${payload.warehouse} (${rowItems.length} material dievaluasi, Nilai Selisih: Rp${totalDiffVal.toLocaleString('id-ID')})`,
              module: 'Gudang Logistik',
              timestamp: 'Baru saja',
            },
            ...s.activityLogs,
          ],
        }));

        return batchRecord;
      },

      updateInventoryMasterInfo: (id, patch) =>
        set((s) => ({
          inventory: s.inventory.map((i) =>
            i.id === id
              ? {
                  ...i,
                  name: patch.name,
                  unit: patch.unit,
                  minStock: patch.minStock,
                  materialCategory: patch.materialCategory || i.materialCategory,
                  notes: patch.notes !== undefined ? patch.notes : i.notes,
                  unitPrice: patch.unitPrice !== undefined ? patch.unitPrice : i.unitPrice,
                  updatedAt: new Date().toISOString().slice(0, 10),
                }
              : i
          ),
          stockMovements: s.stockMovements.map((m) =>
            m.materialId === id ? { ...m, materialName: patch.name, unit: patch.unit } : m
          ),
        })),

      reduceStockWithReason: ({ materialId, qtyReduce, reasonCategory, notes }) => {
        const state = get();
        const item = state.inventory.find((i) => i.id === materialId);
        if (!item) return { ok: false, message: 'Material tidak ditemukan.' };
        if (qtyReduce <= 0) return { ok: false, message: 'Jumlah pengurangan harus > 0.' };
        if (qtyReduce > item.stock) {
          return {
            ok: false,
            message: `Jumlah koreksi (${qtyReduce} ${item.unit}) melebihi stok saat ini (${item.stock} ${item.unit}).`,
          };
        }

        const now = new Date();
        const today = now.toISOString().slice(0, 10);
        const timestamp = now.toISOString().slice(0, 16).replace('T', ' ');
        const refNo = `KOR-${today.slice(0, 7)}-${String(state.stockMovements.length + 1).padStart(4, '0')}`;
        const nextBalance = item.stock - qtyReduce;
        const totalValue = qtyReduce * item.unitPrice;
        const journalId = `JRN-2026-${String(state.journals.length + 1).padStart(3, '0')}`;
        const officerName = `${state.currentUser?.name || 'Admin Logistik'} (${state.currentUser?.role || 'LOGISTIK'})`;

        const movement: StockMovementRecord = {
          id: `mov-kor-${Date.now()}`,
          referenceNo: refNo,
          date: today,
          materialId: item.id,
          materialCode: item.code,
          materialName: item.name,
          unit: item.unit,
          companyId: item.companyId,
          warehouse: item.warehouse,
          movementType: 'KOREKSI',
          qtyIn: 0,
          qtyOut: qtyReduce,
          balanceAfter: nextBalance,
          unitPrice: item.unitPrice,
          totalValue,
          correctionReason: reasonCategory,
          description: `Koreksi Kurangi Stok (${reasonCategory}): ${notes || 'Koreksi fisik gudang'}`,
          officerName,
          journalId,
          createdAt: timestamp,
        };

        const journal: JournalEntry = {
          id: journalId,
          date: today,
          companyId: item.companyId,
          reference: refNo,
          description: `[Koreksi Stok ${reasonCategory}] ${item.name} (-${qtyReduce} ${item.unit}): ${notes}`,
          debitAccount: '5-1400 Beban Selisih & Kerusakan Persediaan Material',
          creditAccount:
            item.materialCategory === 'Bumi'
              ? '1-1320 Persediaan Material Bumi (Pasir, Batu, Bata)'
              : '1-1310 Persediaan Material Toko (Semen, Besi, Cat)',
          amount: totalValue,
          autoGenerated: true,
        };

        set((s) => ({
          inventory: s.inventory.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  stock: nextBalance,
                  stockOutTotal: (i.stockOutTotal || 0) + qtyReduce,
                  updatedAt: today,
                }
              : i
          ),
          stockMovements: [movement, ...s.stockMovements],
          journals: [journal, ...s.journals],
          activityLogs: [
            {
              id: `act-${Date.now()}`,
              user: s.currentUser?.name || 'Logistik',
              role: s.currentUser?.role || 'LOGISTIK',
              action: `[➖ KOREKSI STOK] ${item.name} -${qtyReduce} ${item.unit} (${reasonCategory}: ${notes})`,
              module: 'Gudang Logistik',
              timestamp: 'Baru saja',
            },
            ...s.activityLogs,
          ],
        }));

        return {
          ok: true,
          message: `Stok ${item.name} berhasil dikurangi ${qtyReduce} ${item.unit} (${reasonCategory}) + Auto-Jurnal tercatat.`,
        };
      },

      deleteInventoryItemSoft: (id, reason) =>
        set((s) => {
          const target = s.inventory.find((i) => i.id === id);
          if (!target) return s;
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          return {
            inventory: s.inventory.filter((i) => i.id !== id),
            trashItems: [
              {
                id: target.id,
                collection: 'inventory',
                title: `Kartu Stok ${target.code} - ${target.name} (${target.stock} ${target.unit}) · Alasan: ${reason}`,
                deletedAt: now,
              },
              ...s.trashItems,
            ],
            activityLogs: [
              {
                id: `act-${Date.now()}`,
                user: s.currentUser?.name || 'Admin Logistik',
                role: s.currentUser?.role || 'LOGISTIK',
                action: `[🗑️ HAPUS KARTU STOK] ${target.code} - ${target.name}. Alasan: ${reason}`,
                module: 'Gudang Logistik',
                timestamp: 'Baru saja',
              },
              ...s.activityLogs,
            ],
          };
        }),

      updateStockMovementEntry: (movementId, patch) =>
        set((s) => {
          const target = s.stockMovements.find((m) => m.id === movementId);
          if (!target) return s;

          const newQtyIn = patch.qtyIn !== undefined ? patch.qtyIn : target.qtyIn;
          const newQtyOut = patch.qtyOut !== undefined ? patch.qtyOut : target.qtyOut;
          const newPrice = patch.unitPrice !== undefined ? patch.unitPrice : target.unitPrice;
          const deltaIn = newQtyIn - target.qtyIn;
          const deltaOut = newQtyOut - target.qtyOut;
          const netStockDelta = deltaIn - deltaOut;

          const nextInventory = s.inventory.map((i) => {
            if (i.id !== target.materialId) return i;
            const nextStock = Math.max(0, i.stock + netStockDelta);
            return {
              ...i,
              stock: nextStock,
              stockInTotal: Math.max(0, (i.stockInTotal || 0) + deltaIn),
              stockOutTotal: Math.max(0, (i.stockOutTotal || 0) + deltaOut),
            };
          });

          const nextTotalValue = (newQtyIn > 0 ? newQtyIn : newQtyOut) * newPrice;

          return {
            inventory: nextInventory,
            stockMovements: s.stockMovements.map((m) =>
              m.id === movementId
                ? {
                    ...m,
                    qtyIn: newQtyIn,
                    qtyOut: newQtyOut,
                    unitPrice: newPrice,
                    totalValue: nextTotalValue,
                    balanceAfter: Math.max(0, m.balanceAfter + netStockDelta),
                    description: patch.description !== undefined ? patch.description : m.description,
                    date: patch.date !== undefined ? patch.date : m.date,
                  }
                : m
            ),
          };
        }),

      deleteStockMovementEntry: (movementId, reason) =>
        set((s) => {
          const target = s.stockMovements.find((m) => m.id === movementId);
          if (!target) return s;
          const reverseDelta = target.qtyOut - target.qtyIn;
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          return {
            inventory: s.inventory.map((i) =>
              i.id === target.materialId
                ? {
                    ...i,
                    stock: Math.max(0, i.stock + reverseDelta),
                  }
                : i
            ),
            stockMovements: s.stockMovements.filter((m) => m.id !== movementId),
            trashItems: [
              {
                id: target.id,
                collection: 'stock_movements',
                title: `Mutasi Stok ${target.referenceNo} (${target.materialName}) · Alasan: ${reason}`,
                deletedAt: now,
              },
              ...s.trashItems,
            ],
          };
        }),

      bulkImportInventoryItems: (rows) => {
        const state = get();
        let count = 0;
        const today = new Date().toISOString().slice(0, 10);
        rows.forEach((r) => {
          if (!r.name) return;
          state.recordInitialStockManual({
            date: today,
            companyId: r.companyId || 'PT_TBL',
            warehouse: r.warehouse || 'Bahagia Land',
            materialCategory: r.materialCategory || 'Toko',
            materialCode: r.code,
            materialName: r.name,
            unit: r.unit || 'Sak',
            initialStock: Number(r.initialStock) || 0,
            minStock: Number(r.minStock) || 10,
            unitPrice: Number(r.unitPrice) || 0,
            description: r.notes || 'Import Excel Stok Awal',
          });
          count++;
        });
        return count;
      },

      createPurchaseOrder: (payload) =>
        set((s) => {
          const id = `PO-2026-${String(s.purchaseOrders.length + 1).padStart(4, '0')}`;
          const createdAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const needsDirector = payload.grandTotal > s.approvalLimit;
          const newPo: PurchaseOrderRecord = {
            ...payload,
            id,
            createdAt,
            status: needsDirector ? 'Menunggu Approval Direktur' : 'Approved',
          };
          syncErpRecordToFirestore({
            id,
            collectionName: 'purchase_orders',
            companyId: payload.companyId,
            title: `PO ${payload.supplierName}`,
            status: newPo.status,
            amount: payload.grandTotal,
          });
          let nextNotifications = s.approvalNotifications;
          if (needsDirector) {
            const poNotif: ApprovalNotificationItem = {
              id: `NTF-PO-${id}`,
              targetRole: 'DIREKTUR',
              title: `Purchase Order Baru > Limit Menunggu Approval Direktur`,
              message: `${id} - ${payload.supplierName} senilai Rp${payload.grandTotal.toLocaleString('id-ID')} diajukan oleh ${payload.createdBy}.`,
              category: 'PURCHASE_ORDER',
              referenceId: id,
              companyId: payload.companyId,
              amount: payload.grandTotal,
              status: 'Menunggu Approval Direktur',
              actionPath: '/approval',
              requester: payload.createdBy,
              isRead: false,
              createdBy: s.currentUser?.id || 'pengawas',
              createdAt,
              updatedAt: createdAt,
            };
            syncApprovalNotificationToFirestore(poNotif);
            nextNotifications = [poNotif, ...s.approvalNotifications];
          } else {
            const keuPoNotif: ApprovalNotificationItem = {
              id: `NTF-PO-KEU-${id}`,
              targetRole: 'KEUANGAN',
              title: `PO Material <= Limit Otomatis Approved → Siap Pembayaran`,
              message: `${id} - ${payload.supplierName} senilai Rp${payload.grandTotal.toLocaleString('id-ID')} siap diproses Keuangan.`,
              category: 'PURCHASE_ORDER',
              referenceId: id,
              companyId: payload.companyId,
              amount: payload.grandTotal,
              status: 'Approved',
              actionPath: '/purchasing/po',
              requester: payload.createdBy,
              isRead: false,
              createdBy: s.currentUser?.id || 'pengawas',
              createdAt,
              updatedAt: createdAt,
            };
            syncApprovalNotificationToFirestore(keuPoNotif);
            nextNotifications = [keuPoNotif, ...s.approvalNotifications];
          }
          return {
            purchaseOrders: [newPo, ...s.purchaseOrders],
            approvalNotifications: nextNotifications,
            emailLogs: needsDirector
              ? [
                  {
                    id: `mail-${Date.now()}`,
                    eventNumber: 10,
                    eventName: '10. PO Baru > Limit Rp1 Juta',
                    recipient: 'direktur@bahagiagroup.com',
                    subject: `[Approval PO] ${id} - ${payload.supplierName} (${payload.grandTotal.toLocaleString('id-ID')})`,
                    status: 'Terkirim via Trigger Email',
                    timestamp: createdAt,
                  },
                  ...s.emailLogs,
                ]
              : s.emailLogs,
          };
        }),

      approvePurchaseOrder: (id, decision) =>
        set((s) => {
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const targetPo = s.purchaseOrders.find((po) => po.id === id);
          let nextNotifications = s.approvalNotifications.map((n) =>
            n.referenceId === id ? { ...n, isRead: true, status: decision, updatedAt: now } : n
          );
          if (targetPo && decision === 'Approved') {
            const keuNotif: ApprovalNotificationItem = {
              id: `NTF-PO-APP-${id}-${Date.now().toString().slice(-4)}`,
              targetRole: 'KEUANGAN',
              title: `PO ${id} Disetujui Direktur → Siap Pembayaran Supplier`,
              message: `PO ${id} ke ${targetPo.supplierName} (Rp${targetPo.grandTotal.toLocaleString('id-ID')}) telah di-Approve Direktur.`,
              category: 'PURCHASE_ORDER',
              referenceId: id,
              companyId: targetPo.companyId,
              amount: targetPo.grandTotal,
              status: 'Approved',
              actionPath: '/keuangan/kas-keluar',
              requester: s.currentUser?.name || 'Direktur Utama',
              isRead: false,
              createdBy: s.currentUser?.id || 'direktur',
              createdAt: now,
              updatedAt: now,
            };
            syncApprovalNotificationToFirestore(keuNotif);
            nextNotifications = [keuNotif, ...nextNotifications];
          }
          return {
            purchaseOrders: s.purchaseOrders.map((po) => (po.id === id ? { ...po, status: decision } : po)),
            approvalNotifications: nextNotifications,
          };
        }),

      addJournalEntry: (payload) =>
        set((s) => {
          const id = `JRN-2026-${String(s.journals.length + 1).padStart(3, '0')}`;
          const date = payload.date || new Date().toISOString().slice(0, 10);
          return {
            journals: [{ ...payload, id, date }, ...s.journals],
          };
        }),

      updateJournalEntry: (id, patch) =>
        set((s) => ({
          journals: s.journals.map((j) => (j.id === id ? { ...j, ...patch } : j)),
        })),

      deleteJournalEntry: (id) =>
        set((s) => ({
          journals: s.journals.filter((j) => j.id !== id),
        })),

      saveCashTransaction: (payload) => {
        const state = get();
        const now = new Date();
        const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const timestamp = now.toISOString().slice(0, 16).replace('T', ' ');
        const actor = `${state.currentUser?.name || 'Staf Keuangan'} (${state.currentUser?.role || 'KEUANGAN'})`;

        const isEdit = Boolean(payload.id && state.cashTransactions.some((t) => t.id === payload.id));
        const existingTx = isEdit ? state.cashTransactions.find((t) => t.id === payload.id) : null;

        const prefix = payload.type === 'KAS_MASUK' ? 'KM' : 'KK';
        const sameTypeCount = state.cashTransactions.filter((t) => t.type === payload.type).length + 1;
        const txId = existingTx?.id || `${prefix}-${ym}-${String(sameTypeCount).padStart(4, '0')}`;

        // Auto-determine Debit & Credit from Kas Masuk / Kas Keluar
        const debitAccount =
          payload.type === 'KAS_MASUK' ? payload.cashAccount : payload.counterAccount;
        const creditAccount =
          payload.type === 'KAS_MASUK' ? payload.counterAccount : payload.cashAccount;

        const journalId =
          existingTx?.journalId || `JRN-2026-${String(state.journals.length + 1).padStart(3, '0')}`;

        const historyEntry: CashTransactionHistory = {
          id: `hst-${Date.now()}`,
          timestamp,
          actor,
          action: isEdit
            ? `Mengubah transaksi ${txId} & memperbarui Auto-Jurnal ${journalId} (Rp${payload.amount.toLocaleString('id-ID')})`
            : `Membuat ${payload.type === 'KAS_MASUK' ? 'Kas Masuk' : 'Kas Keluar'} ${txId} & Auto-Jurnal ${journalId}`,
        };

        const record: CashTransactionRecord = {
          ...payload,
          id: txId,
          debitAccount,
          creditAccount,
          journalId,
          createdAt: existingTx?.createdAt || timestamp,
          history: existingTx ? [historyEntry, ...existingTx.history] : [historyEntry],
        };

        const newJournal: JournalEntry = {
          id: journalId,
          date: payload.date,
          companyId: payload.companyId,
          reference: txId,
          description: payload.description,
          debitAccount,
          creditAccount,
          amount: payload.amount,
          autoGenerated: true,
        };

        const extractCode = (label: string) => label.trim().split(' ')[0];
        const debitCode = extractCode(debitAccount);
        const creditCode = extractCode(creditAccount);
        const deltaAmount = isEdit && existingTx ? payload.amount - existingTx.amount : payload.amount;

        set((s) => {
          const updatedCoa = s.coa.map((acc) => {
            if (acc.code === debitCode) {
              const change = acc.normalBalance === 'DEBIT' ? deltaAmount : -deltaAmount;
              return { ...acc, balance: acc.balance + change };
            }
            if (acc.code === creditCode) {
              const change = acc.normalBalance === 'KREDIT' ? deltaAmount : -deltaAmount;
              return { ...acc, balance: acc.balance + change };
            }
            return acc;
          });

          const updatedJournals = isEdit
            ? s.journals.map((j) => (j.id === journalId || j.reference === txId ? newJournal : j))
            : [newJournal, ...s.journals];

          const updatedTxs = isEdit
            ? s.cashTransactions.map((t) => (t.id === txId ? record : t))
            : [record, ...s.cashTransactions];

          return {
            coa: updatedCoa,
            journals: updatedJournals,
            cashTransactions: updatedTxs,
            activityLogs: [
              {
                id: `act-${Date.now()}`,
                user: state.currentUser?.name || 'Keuangan',
                role: state.currentUser?.role || 'KEUANGAN',
                action: `${isEdit ? 'Edit' : 'Input'} ${txId}: ${payload.description} (Rp${payload.amount.toLocaleString('id-ID')})`,
                module: 'Keuangan & COA',
                timestamp: 'Baru saja',
              },
              ...s.activityLogs,
            ],
          };
        });

        syncErpRecordToFirestore({
          id: txId,
          collectionName: 'transactions',
          companyId: payload.companyId,
          title: `${txId} - ${payload.description}`,
          status: payload.type,
          amount: payload.amount,
        });

        return record;
      },

      deleteCashTransaction: (id) =>
        set((s) => {
          const target = s.cashTransactions.find((t) => t.id === id);
          if (!target) return s;

          const extractCode = (label: string) => label.trim().split(' ')[0];
          const debitCode = extractCode(target.debitAccount);
          const creditCode = extractCode(target.creditAccount);

          const updatedCoa = s.coa.map((acc) => {
            if (acc.code === debitCode) {
              const reverse = acc.normalBalance === 'DEBIT' ? -target.amount : target.amount;
              return { ...acc, balance: acc.balance + reverse };
            }
            if (acc.code === creditCode) {
              const reverse = acc.normalBalance === 'KREDIT' ? -target.amount : target.amount;
              return { ...acc, balance: acc.balance + reverse };
            }
            return acc;
          });

          return {
            coa: updatedCoa,
            cashTransactions: s.cashTransactions.filter((t) => t.id !== id),
            journals: s.journals.filter((j) => j.id !== target.journalId && j.reference !== id),
            trashItems: [
              {
                id: target.id,
                collection: 'transactions',
                title: `${target.id} - ${target.description} (Rp${target.amount.toLocaleString('id-ID')})`,
                deletedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
              },
              ...s.trashItems,
            ],
          };
        }),

      duplicateCashTransaction: (id) => {
        const state = get();
        const source = state.cashTransactions.find((t) => t.id === id);
        if (!source) return null;
        return state.saveCashTransaction({
          type: source.type,
          date: new Date().toISOString().slice(0, 10),
          companyId: source.companyId,
          sourceOrPurpose: source.sourceOrPurpose,
          category: source.category,
          amount: source.amount,
          cashAccount: source.cashAccount,
          counterAccount: source.counterAccount,
          description: `${source.description} (Salinan)`,
          proofUrl: source.proofUrl,
          proofFileName: source.proofFileName,
          consumerName: source.consumerName,
          unitCode: source.unitCode,
          supplierName: source.supplierName,
          employeeName: source.employeeName,
          createdBy: state.currentUser?.name || source.createdBy,
        });
      },

      addCoaAccount: (payload) =>
        set((s) => ({
          coa: [...s.coa, { ...payload, active: payload.active ?? true }].sort((a, b) =>
            a.code.localeCompare(b.code)
          ),
        })),

      saveCoaAccountFull: (payload, originalCode) => {
        const state = get();
        const cleanCode = payload.code.trim();
        if (!cleanCode || !payload.name.trim()) {
          return { ok: false, message: 'Kode Akun dan Nama Akun wajib diisi' };
        }

        const isEditing = Boolean(originalCode);
        const duplicateExists = state.coa.some(
          (c) => c.code === cleanCode && (!isEditing || c.code !== originalCode)
        );
        if (duplicateExists) {
          return { ok: false, message: `Kode Akun ${cleanCode} sudah digunakan. Gunakan kode unik!` };
        }

        const normalBalance: 'DEBIT' | 'KREDIT' =
          payload.category === 'ASET' || payload.category === 'BEBAN' ? 'DEBIT' : 'KREDIT';

        const finalItem: CoaItem = {
          ...payload,
          code: cleanCode,
          normalBalance: payload.normalBalance || normalBalance,
          active: payload.active ?? true,
        };

        set((s) => {
          const nextList = isEditing
            ? s.coa.map((c) => (c.code === originalCode ? finalItem : c))
            : [...s.coa, finalItem];
          return {
            coa: nextList.sort((a, b) => a.code.localeCompare(b.code)),
            activityLogs: [
              {
                id: `act-${Date.now()}`,
                user: s.currentUser?.name || 'Super Admin',
                role: s.currentUser?.role || 'ADMIN',
                action: `${isEditing ? 'Edit' : 'Tambah'} Akun COA ${cleanCode} - ${payload.name}`,
                module: 'Keuangan & COA',
                timestamp: 'Baru saja',
              },
              ...s.activityLogs,
            ],
          };
        });

        return {
          ok: true,
          message: isEditing
            ? `Akun COA ${cleanCode} berhasil diperbarui`
            : `Akun COA baru ${cleanCode} berhasil ditambahkan`,
        };
      },

      deleteCoaAccount: (code, migrateToAccount) => {
        const state = get();
        const usedInJournals = state.journals.filter(
          (j) => j.debitAccount.startsWith(code) || j.creditAccount.startsWith(code)
        );

        if (usedInJournals.length > 0 && !migrateToAccount) {
          return {
            ok: false,
            message: `Akun ${code} sudah dipakai di ${usedInJournals.length} jurnal. Pilih akun tujuan pemindahan atau konfirmasi ganda.`,
          };
        }

        const targetAcc = state.coa.find((c) => c.code === code);
        set((s) => {
          const nextJournals = migrateToAccount
            ? s.journals.map((j) => ({
                ...j,
                debitAccount: j.debitAccount.startsWith(code) ? migrateToAccount : j.debitAccount,
                creditAccount: j.creditAccount.startsWith(code) ? migrateToAccount : j.creditAccount,
              }))
            : s.journals;

          const nextCashTxs = migrateToAccount
            ? s.cashTransactions.map((t) => ({
                ...t,
                cashAccount: t.cashAccount.startsWith(code) ? migrateToAccount : t.cashAccount,
                counterAccount: t.counterAccount.startsWith(code) ? migrateToAccount : t.counterAccount,
                debitAccount: t.debitAccount.startsWith(code) ? migrateToAccount : t.debitAccount,
                creditAccount: t.creditAccount.startsWith(code) ? migrateToAccount : t.creditAccount,
              }))
            : s.cashTransactions;

          return {
            coa: s.coa.filter((c) => c.code !== code),
            journals: nextJournals,
            cashTransactions: nextCashTxs,
            trashItems: targetAcc
              ? [
                  {
                    id: targetAcc.code,
                    collection: 'coa',
                    title: `COA ${targetAcc.code} - ${targetAcc.name}`,
                    deletedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
                  },
                  ...s.trashItems,
                ]
              : s.trashItems,
          };
        });

        return { ok: true, message: `Akun COA ${code} berhasil dihapus` };
      },

      toggleCoaActive: (code) =>
        set((s) => ({
          coa: s.coa.map((c) =>
            c.code === code ? { ...c, active: c.active === false ? true : false } : c
          ),
        })),

      bulkImportCoa: (items) => {
        const state = get();
        const existingCodes = new Set(state.coa.map((c) => c.code));
        const validNew = items.filter((it) => it.code && it.name && !existingCodes.has(it.code));
        if (validNew.length > 0) {
          set((s) => ({
            coa: [...s.coa, ...validNew].sort((a, b) => a.code.localeCompare(b.code)),
          }));
        }
        return validNew.length;
      },

      addAttendance: (payload) =>
        set((s) => ({
          attendance: [
            {
              ...payload,
              id: `att-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WITA',
            },
            ...s.attendance,
          ],
        })),

      addUser: (payload) =>
        set((s) => ({
          users: [...s.users, { ...payload, id: `usr-${Date.now()}` }],
          emailLogs: [
            {
              id: `mail-${Date.now()}`,
              eventNumber: 12,
              eventName: '12. User Baru Dibuat',
              recipient: `${payload.email}, admin@bahagiagroup.com`,
              subject: `[Akun Baru] Selamat bergabung di ERP Bahagia Group Property`,
              status: 'Terkirim via Trigger Email',
              timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
            },
            ...s.emailLogs,
          ],
        })),

      toggleUserActive: (id) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? { ...u, active: !u.active } : u)),
        })),

      updateCompany: (id, patch) =>
        set((s) => ({
          companies: s.companies.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),

      toggleRolePermission: (role, moduleName, actionKey) =>
        set((s) => ({
          roles: s.roles.map((r) => {
            if (r.role !== role) return r;
            const currentMod = r.permissions[moduleName];
            if (!currentMod) return r;
            return {
              ...r,
              permissions: {
                ...r.permissions,
                [moduleName]: {
                  ...currentMod,
                  [actionKey]: !currentMod[actionKey],
                },
              },
            };
          }),
        })),

      selectAllModulePermissions: (role, moduleName) =>
        set((s) => ({
          roles: s.roles.map((r) => {
            if (r.role !== role) return r;
            return {
              ...r,
              permissions: {
                ...r.permissions,
                [moduleName]: {
                  lihat: true,
                  tambah: true,
                  edit: true,
                  hapus: true,
                  approve: true,
                  export: true,
                  print: true,
                },
              },
            };
          }),
        })),

      addCustomField: (module, label, fieldType) =>
        set((s) => ({
          customFields: [...s.customFields, { id: `cf-${Date.now()}`, module, label, fieldType }],
        })),

      softDeleteItem: (id, collection, title) =>
        set((s) => ({
          trashItems: [
            { id, collection, title, deletedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') },
            ...s.trashItems,
          ],
        })),

      restoreTrashItem: (id) =>
        set((s) => ({
          trashItems: s.trashItems.filter((t) => t.id !== id),
        })),

      addKavlingUnit: (payload) =>
        set((s) => {
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const adminName = s.currentUser?.name || 'Super Admin';
          const adminEmail = s.currentUser?.email || 'superadmin@bahagia.com';
          const newId = `${payload.companyId === 'PT_TBL' ? 'TBL' : 'BPP'}-${payload.code}`;
          const newLot: KavlingLot = {
            id: newId,
            companyId: payload.companyId,
            projectName:
              payload.companyId === 'PT_TBL' ? 'Perumahan Bahagia Land' : 'Perumahan Bahagia Residence',
            block: payload.block,
            number: s.kavling.length + 1,
            code: payload.code,
            type: payload.type,
            landSize: '7×13 m (91 m²)',
            buildingSize: 36,
            extraLand: 'Standar Kavling Baru',
            price: payload.price,
            hpp: payload.hpp,
            status: 'Tersedia',
            progress: 0,
            pjtVerified: false,
            photos: [],
            mapCoords: {
              x: 100,
              y: 100,
              width: 56,
              height: 32,
              xPct: 12,
              yPct: 18,
              widthPct: 5.6,
              heightPct: 5.5,
              shape: 'RECT',
              orientation: 'Selatan',
            },
          };
          syncErpRecordToFirestore({
            id: newId,
            collectionName: 'kavling',
            companyId: payload.companyId,
            title: `Kavling ${payload.code} (${newLot.projectName})`,
            status: newLot.status,
            amount: payload.price,
          });
          return {
            kavling: [newLot, ...s.kavling],
            adminCrudLogs: [
              {
                id: `crud-${Date.now()}`,
                timestamp: now,
                adminName,
                adminEmail,
                actionType: 'TAMBAH',
                collectionName: 'Units & Kavling',
                targetId: newId,
                beforeValue: '-',
                afterValue: `${payload.type} (Rp${payload.price.toLocaleString('id-ID')})`,
                reason: 'Penambahan unit kavling baru oleh Super Admin',
              },
              ...s.adminCrudLogs,
            ],
            activityLogs: [
              {
                id: `act-${Date.now()}`,
                user: adminName,
                role: 'ADMIN',
                action: `[+ TAMBAH] Unit Kavling baru ${newId} (${payload.type})`,
                module: 'Units & Kavling',
                timestamp: 'Baru saja',
              },
              ...s.activityLogs,
            ],
          };
        }),

      updateSitePlanImageConfig: (payload) =>
        set((s) => {
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const adminName = s.currentUser?.name || 'Super Admin';
          const adminEmail = s.currentUser?.email || 'superadmin@bahagia.com';
          const exists = s.sitePlanConfigs.some(
            (c) =>
              c.projectId === payload.projectId ||
              (payload.projectName && c.projectName.toLowerCase() === payload.projectName.toLowerCase())
          );

          const nextConfigs: SitePlanConfigRecord[] = exists
            ? s.sitePlanConfigs.map((cfg) => {
                if (
                  cfg.projectId !== payload.projectId &&
                  (!payload.projectName ||
                    cfg.projectName.toLowerCase() !== payload.projectName.toLowerCase())
                ) {
                  return cfg;
                }
                return {
                  ...cfg,
                  sourceFileName: payload.sourceFileName || cfg.sourceFileName,
                  imageUrl: payload.imageUrl,
                  resolution: payload.resolution || cfg.resolution || '2048 × 1448 px (High-Res)',
                  fileSizeText: payload.fileSizeText || cfg.fileSizeText || '2.10 MB',
                  uploadedAt: now,
                  history: [
                    {
                      id: `sp-hist-${Date.now()}`,
                      timestamp: now,
                      fileName: payload.sourceFileName || 'Siteplan Update Baru.png',
                      imageUrl: payload.imageUrl,
                      uploadedBy: adminName,
                    },
                    ...(cfg.history || []),
                  ].slice(0, 15),
                };
              })
            : [
                ...s.sitePlanConfigs,
                {
                  projectId: payload.projectId,
                  projectName: payload.projectName || 'Proyek Baru',
                  companyId: payload.companyId || 'PT_TBL',
                  sourceFileName: payload.sourceFileName,
                  imageUrl: payload.imageUrl,
                  defaultImageUrl: payload.imageUrl,
                  resolution: payload.resolution || '2048 × 1448 px',
                  fileSizeText: payload.fileSizeText || '2.0 MB',
                  uploadedAt: now,
                  showGridOnPublic: false,
                  statusColors: { ...DEFAULT_SITE_PLAN_STATUS_COLORS },
                  history: [
                    {
                      id: `sp-hist-${Date.now()}`,
                      timestamp: now,
                      fileName: payload.sourceFileName,
                      imageUrl: payload.imageUrl,
                      uploadedBy: adminName,
                    },
                  ],
                },
              ];

          // Also sync image to syncedProjects so all pages reflect immediately
          const nextSyncedProjects = s.syncedProjects.map((p) => {
            if (
              p.id === payload.projectId ||
              (payload.projectName && p.projectName.toLowerCase() === payload.projectName.toLowerCase())
            ) {
              return { ...p, sitePlanImage: payload.imageUrl };
            }
            return p;
          });

          syncErpRecordToFirestore({
            id: `siteplan_${payload.projectId}`,
            collectionName: 'projects',
            companyId: payload.companyId || 'GROUP',
            title: `Site Plan Image: ${payload.sourceFileName}`,
            status: 'Published',
          });

          const isResidence =
            payload.projectId.toLowerCase().includes('bpp') ||
            (payload.projectName || '').toLowerCase().includes('residence');
          const projSlug = isResidence ? 'bahagia-residence' : 'bahagia-land';
          const projPolygons = s.kavling
            .filter(
              (k) =>
                k.projectName.toLowerCase().includes(isResidence ? 'residence' : 'bahagia land') &&
                k.mapCoords?.points &&
                k.mapCoords.points.length >= 3
            )
            .map((k) => ({
              id: `poly-${k.code}`,
              nomor: k.code,
              blok: k.block,
              points: (k.mapCoords?.points || []).map((pt) => ({
                x: Math.round((pt.xPct / 100) * 1920),
                y: Math.round((pt.yPct / 100) * 1080),
                xPct: pt.xPct,
                yPct: pt.yPct,
              })),
              tipe: k.type.replace('Tipe ', ''),
              luasTanah: 91,
              luasBangunan: k.buildingSize || 36,
              harga: k.price,
              status: k.status.toLowerCase().replace(/\s+/g, '_') as
                | 'tersedia'
                | 'booking'
                | 'proses_kpr'
                | 'akad'
                | 'terjual'
                | 'serah_terima',
              konsumen: k.buyerName || '',
              progress: k.progress,
              catatan: k.pengawasNotes || '',
              color:
                k.customFillColor ||
                DEFAULT_SITE_PLAN_STATUS_COLORS[k.status] ||
                '#22C55E',
            }));

          syncSiteplanMasterToFirestore({
            projectId: projSlug,
            nama: isResidence ? 'Bahagia Residence' : 'Bahagia Land',
            backgroundImage: payload.imageUrl,
            imageWidth: 1920,
            imageHeight: 1080,
            polygons: projPolygons,
            updatedBy: adminEmail,
          });

          return {
            sitePlanConfigs: nextConfigs,
            syncedProjects: nextSyncedProjects,
            adminCrudLogs: [
              {
                id: `crud-${Date.now()}`,
                timestamp: now,
                adminName,
                adminEmail,
                actionType: 'EDIT',
                collectionName: 'Site Plan Master Image',
                targetId: payload.projectName || payload.projectId,
                beforeValue: 'Gambar Site Plan Sebelumnya',
                afterValue: payload.sourceFileName,
                reason: 'Upload/Ganti Gambar Asli Site Plan oleh Super Admin',
              },
              ...s.adminCrudLogs,
            ],
          };
        }),

      resetSitePlanImageToDefault: (projectId) =>
        set((s) => {
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const targetCfg = s.sitePlanConfigs.find((c) => c.projectId === projectId);
          const defaultUrl =
            targetCfg?.defaultImageUrl ||
            (projectId.includes('BPP') ? ASSETS.sitePlanBahagiaResidence : ASSETS.sitePlanBahagiaLand);
          return {
            sitePlanConfigs: s.sitePlanConfigs.map((cfg) =>
              cfg.projectId === projectId
                ? {
                    ...cfg,
                    imageUrl: defaultUrl,
                    uploadedAt: now,
                    statusColors: { ...DEFAULT_SITE_PLAN_STATUS_COLORS },
                  }
                : cfg
            ),
            syncedProjects: s.syncedProjects.map((p) =>
              p.id === projectId ? { ...p, sitePlanImage: defaultUrl } : p
            ),
          };
        }),

      updateSitePlanStatusColors: (projectId, colorsPatch) =>
        set((s) => ({
          sitePlanConfigs: s.sitePlanConfigs.map((cfg) =>
            cfg.projectId === projectId
              ? {
                  ...cfg,
                  statusColors: { ...cfg.statusColors, ...colorsPatch },
                }
              : cfg
          ),
        })),

      toggleSitePlanGridOnPublic: (projectId) =>
        set((s) => ({
          sitePlanConfigs: s.sitePlanConfigs.map((cfg) =>
            cfg.projectId === projectId
              ? { ...cfg, showGridOnPublic: !cfg.showGridOnPublic }
              : cfg
          ),
        })),

      saveKavlingLotFull: (payload) => {
        const s = get();
        const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
        const adminName = s.currentUser?.name || 'Super Admin';
        const adminEmail = s.currentUser?.email || 'superadmin@bahagia.com';
        const prefix = payload.companyId === 'PT_BPP' ? 'BPP' : 'TBL';
        const finalId = payload.id || `${prefix}-${payload.code.toUpperCase()}`;
        const existing = s.kavling.find((k) => k.id === finalId);

        const defaultMapCoords = existing?.mapCoords || {
          x: 120,
          y: 120,
          width: 56,
          height: 32,
          xPct: 14,
          yPct: 22,
          widthPct: 5.5,
          heightPct: 5.5,
          shape: 'RECT' as const,
          orientation: 'Selatan' as const,
        };

        const lotRecord: KavlingLot = {
          ...existing,
          ...payload,
          id: finalId,
          mapCoords: payload.mapCoords
            ? { ...defaultMapCoords, ...payload.mapCoords }
            : defaultMapCoords,
        };

        syncErpRecordToFirestore({
          id: finalId,
          collectionName: 'kavling',
          companyId: lotRecord.companyId,
          title: `${lotRecord.projectName} - Kavling ${lotRecord.code} (${lotRecord.status})`,
          status: lotRecord.status,
          amount: lotRecord.price,
        });

        set((st) => {
          const nextKavling = existing
            ? st.kavling.map((k) => (k.id === finalId ? lotRecord : k))
            : [...st.kavling, lotRecord];

          // Sync manual polygons for this project to Firestore /siteplans/{projectId}
          const isResidence = lotRecord.projectName.toLowerCase().includes('residence');
          const projSlug = isResidence ? 'bahagia-residence' : 'bahagia-land';
          const projCfg = st.sitePlanConfigs.find(
            (c) => c.projectName.toLowerCase() === lotRecord.projectName.toLowerCase()
          );
          const projPolygons = nextKavling
            .filter(
              (k) =>
                k.projectName.toLowerCase() === lotRecord.projectName.toLowerCase() &&
                k.mapCoords?.points &&
                k.mapCoords.points.length >= 3
            )
            .map((k) => ({
              id: `poly-${k.code}`,
              nomor: k.code,
              blok: k.block,
              points: (k.mapCoords?.points || []).map((pt) => ({
                x: Math.round((pt.xPct / 100) * 1920),
                y: Math.round((pt.yPct / 100) * 1080),
                xPct: pt.xPct,
                yPct: pt.yPct,
              })),
              tipe: k.type.replace('Tipe ', ''),
              luasTanah: 91,
              luasBangunan: k.buildingSize || 36,
              harga: k.price,
              status: k.status.toLowerCase().replace(/\s+/g, '_') as
                | 'tersedia'
                | 'booking'
                | 'proses_kpr'
                | 'akad'
                | 'terjual'
                | 'serah_terima',
              konsumen: k.buyerName || '',
              progress: k.progress,
              catatan: k.pengawasNotes || '',
              color:
                k.customFillColor ||
                projCfg?.statusColors?.[k.status] ||
                DEFAULT_SITE_PLAN_STATUS_COLORS[k.status] ||
                '#22C55E',
            }));

          syncSiteplanMasterToFirestore({
            projectId: projSlug,
            nama: isResidence ? 'Bahagia Residence' : 'Bahagia Land',
            backgroundImage:
              projCfg?.imageUrl ||
              (isResidence ? '/siteplan/bahagia residence.png' : '/siteplan/bahagia land.png'),
            imageWidth: 1920,
            imageHeight: 1080,
            polygons: projPolygons,
            updatedBy: adminEmail,
          });

          return {
            kavling: nextKavling,
            adminCrudLogs: [
              {
                id: `crud-${Date.now()}`,
                timestamp: now,
                adminName,
                adminEmail,
                actionType: existing ? 'EDIT' : 'TAMBAH',
                collectionName: 'kavling',
                targetId: finalId,
                beforeValue: existing ? `${existing.code} (${existing.status})` : '-',
                afterValue: `${lotRecord.code} (${lotRecord.status} · Rp${lotRecord.price.toLocaleString('id-ID')})`,
                reason: existing
                  ? 'Update detail & posisi polygon kavling oleh Super Admin'
                  : 'Tambah polygon kavling baru pada Site Plan Editor oleh Super Admin',
              },
              ...st.adminCrudLogs,
            ],
          };
        });

        return lotRecord;
      },

      updateKavlingOverlayCoords: (id, coords) =>
        set((s) => {
          const target = s.kavling.find((k) => k.id === id);
          if (target) {
            syncErpRecordToFirestore({
              id: target.id,
              collectionName: 'kavling',
              companyId: target.companyId,
              title: `${target.projectName} - Kavling ${target.code} (X:${coords.xPct}%, Y:${coords.yPct}%)`,
              status: target.status,
              amount: target.price,
            });
          }
          const nextKavling = s.kavling.map((k) =>
            k.id === id
              ? {
                  ...k,
                  mapCoords: {
                    ...(k.mapCoords || { x: 100, y: 100, width: 50, height: 30 }),
                    ...coords,
                  },
                }
              : k
          );
          return {
            kavling: nextKavling,
          };
        }),

      bulkUpdateKavlingLots: (ids, patch) =>
        set((s) => {
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const adminName = s.currentUser?.name || 'Super Admin';
          const adminEmail = s.currentUser?.email || 'superadmin@bahagia.com';
          return {
            kavling: s.kavling.map((k) => (ids.includes(k.id) ? { ...k, ...patch } : k)),
            adminCrudLogs: [
              {
                id: `crud-${Date.now()}`,
                timestamp: now,
                adminName,
                adminEmail,
                actionType: 'EDIT',
                collectionName: 'kavling (Bulk Update)',
                targetId: `${ids.length} Kavling`,
                beforeValue: 'Nilai Sebelumnya',
                afterValue: JSON.stringify(patch),
                reason: 'Bulk update kavling oleh Super Admin',
              },
              ...s.adminCrudLogs,
            ],
          };
        }),

      bulkAddKavlingRange: (payload) => {
        const s = get();
        const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
        const adminName = s.currentUser?.name || 'Super Admin';
        const adminEmail = s.currentUser?.email || 'superadmin@bahagia.com';
        const prefix = payload.companyId === 'PT_BPP' ? 'BPP' : 'TBL';
        const blk = payload.block.trim().toUpperCase() || 'A';
        const start = Math.max(1, payload.startNum);
        const end = Math.min(start + 150, Math.max(start, payload.endNum));
        const newLots: KavlingLot[] = [];

        for (let num = start; num <= end; num++) {
          const code = `${blk}-${String(num).padStart(2, '0')}`;
          const id = `${prefix}-${code}`;
          if (s.kavling.some((k) => k.id === id)) continue;
          const idx = num - start;
          const col = idx % 10;
          const row = Math.floor(idx / 10);
          const xPct = Number((8 + col * 8.2).toFixed(2));
          const yPct = Number((16 + row * 9.5).toFixed(2));

          newLots.push({
            id,
            companyId: payload.companyId,
            projectName: payload.projectName,
            block: blk,
            number: num,
            code,
            type: payload.type || 'Tipe 36/91 Subsidi',
            landSize: payload.landSize || '7×13 m (91 m²)',
            buildingSize: payload.buildingSize || 36,
            extraLand: 'Standar Kavling 7×13m',
            price: payload.price || 169000000,
            hpp: payload.hpp || 67651710,
            status: payload.status || 'Tersedia',
            progress: 0,
            pjtVerified: false,
            photos: [
              payload.companyId === 'PT_BPP' ? ASSETS.bahagiaResidence : ASSETS.bahagiaLand,
              ASSETS.unitInterior,
              ASSETS.unitFloorplan,
            ],
            mapCoords: {
              x: Math.round(xPct * 10),
              y: Math.round((yPct / 100) * 580),
              width: 55,
              height: 34,
              xPct,
              yPct,
              widthPct: 5.5,
              heightPct: 5.8,
              shape: 'RECT',
              orientation: 'Selatan',
            },
          });
        }

        if (newLots.length > 0) {
          set((st) => ({
            kavling: [...st.kavling, ...newLots],
            adminCrudLogs: [
              {
                id: `crud-${Date.now()}`,
                timestamp: now,
                adminName,
                adminEmail,
                actionType: 'TAMBAH',
                collectionName: 'kavling (Bulk Generate)',
                targetId: `${payload.projectName} Blok ${blk}`,
                beforeValue: '-',
                afterValue: `${newLots.length} Kavling Baru (${blk}-${String(start).padStart(2, '0')} s/d ${blk}-${String(end).padStart(2, '0')})`,
                reason: 'Tambah Banyak Kavling Sekaligus oleh Super Admin',
              },
              ...st.adminCrudLogs,
            ],
          }));
        }

        return newLots.length;
      },

      resetProjectKavlingData: (projectName, mode) =>
        set((s) => {
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const adminName = s.currentUser?.name || 'Super Admin';
          const adminEmail = s.currentUser?.email || 'superadmin@bahagia.com';
          const targetLower = projectName.toLowerCase();

          let nextKavling = s.kavling;
          if (mode === 'RESET_STATUS_ONLY') {
            nextKavling = s.kavling.map((k) =>
              k.projectName.toLowerCase() === targetLower
                ? {
                    ...k,
                    status: 'Tersedia',
                    buyerName: undefined,
                    buyerPhone: undefined,
                    bank: undefined,
                  }
                : k
            );
          } else if (mode === 'DELETE_ALL_LOTS') {
            nextKavling = s.kavling.filter((k) => k.projectName.toLowerCase() !== targetLower);
          } else if (mode === 'RESTORE_DEFAULT_SEED') {
            const seedAll = generateInitialKavling();
            const seedForProj = seedAll.filter((k) => k.projectName.toLowerCase() === targetLower);
            const others = s.kavling.filter((k) => k.projectName.toLowerCase() !== targetLower);
            nextKavling = [...others, ...seedForProj];
          }

          return {
            kavling: nextKavling,
            adminCrudLogs: [
              {
                id: `crud-${Date.now()}`,
                timestamp: now,
                adminName,
                adminEmail,
                actionType: 'RESET',
                collectionName: 'kavling',
                targetId: projectName,
                beforeValue: 'State Sebelumnya',
                afterValue: mode,
                reason: `Reset Kavling Proyek ${projectName} (${mode}) oleh Super Admin`,
              },
              ...s.adminCrudLogs,
            ],
          };
        }),

      addInventoryItem: (payload) =>
        set((s) => {
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const adminName = s.currentUser?.name || 'Super Admin';
          const adminEmail = s.currentUser?.email || 'superadmin@bahagia.com';
          const newItem: InventoryRecord = {
            ...payload,
            id: `inv-${Date.now()}`,
          };
          return {
            inventory: [newItem, ...s.inventory],
            adminCrudLogs: [
              {
                id: `crud-${Date.now()}`,
                timestamp: now,
                adminName,
                adminEmail,
                actionType: 'TAMBAH',
                collectionName: 'Inventory Gudang',
                targetId: `${payload.code} - ${payload.name}`,
                beforeValue: '0',
                afterValue: `${payload.stock} ${payload.unit}`,
                reason: 'Tambah stok material baru oleh Super Admin',
              },
              ...s.adminCrudLogs,
            ],
            activityLogs: [
              {
                id: `act-${Date.now()}`,
                user: adminName,
                role: 'ADMIN',
                action: `[+ TAMBAH] Material ${payload.code} (${payload.name}) sebanyak ${payload.stock} ${payload.unit}`,
                module: 'Gudang Logistik',
                timestamp: 'Baru saja',
              },
              ...s.activityLogs,
            ],
          };
        }),

      updateCoaAccount: (code, patch) =>
        set((s) => {
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const adminName = s.currentUser?.name || 'Super Admin';
          const adminEmail = s.currentUser?.email || 'superadmin@bahagia.com';
          const target = s.coa.find((c) => c.code === code);
          if (!target) return s;

          const beforeVal = `${target.name} (Rp${target.balance.toLocaleString('id-ID')})`;
          const nextName = patch.name !== undefined ? patch.name : target.name;
          const nextBal = patch.balance !== undefined ? patch.balance : target.balance;
          const afterVal = `${nextName} (Rp${nextBal.toLocaleString('id-ID')})`;

          return {
            coa: s.coa.map((c) => (c.code === code ? { ...c, name: nextName, balance: nextBal } : c)),
            adminCrudLogs: [
              {
                id: `crud-${Date.now()}`,
                timestamp: now,
                adminName,
                adminEmail,
                actionType: 'EDIT',
                collectionName: 'COA (Bagan Akun)',
                targetId: code,
                beforeValue: beforeVal,
                afterValue: afterVal,
                reason: patch.reason || 'Edit nama/saldo akun COA oleh Super Admin (Akun COA Dilindungi)',
              },
              ...s.adminCrudLogs,
            ],
            activityLogs: [
              {
                id: `act-${Date.now()}`,
                user: adminName,
                role: 'ADMIN',
                action: `[EDIT COA] Akun ${code}: ${beforeVal} → ${afterVal}`,
                module: 'Keuangan & COA',
                timestamp: 'Baru saja',
              },
              ...s.activityLogs,
            ],
          };
        }),

      adjustNumericData: ({ collectionKey, targetId, delta, reason, mode }) =>
        set((s) => {
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const adminName = s.currentUser?.name || 'Super Admin';
          const adminEmail = s.currentUser?.email || 'superadmin@bahagia.com';
          let beforeStr = '-';
          let afterStr = '-';

          let nextInventory = s.inventory;
          let nextKavling = s.kavling;
          let nextCoa = s.coa;
          let nextPOs = s.purchaseOrders;
          let nextJournals = s.journals;

          if (collectionKey === 'inventory') {
            nextInventory = s.inventory.map((item, idx) => {
              if (item.code === targetId || item.id === targetId || (idx === 0 && !targetId)) {
                beforeStr = `${item.stock} ${item.unit}`;
                const nextStock = mode === 'SET' ? Math.max(0, delta) : Math.max(0, item.stock + delta);
                afterStr = `${nextStock} ${item.unit}`;
                return { ...item, stock: nextStock };
              }
              return item;
            });
          } else if (collectionKey === 'units_kavling' || collectionKey === 'work_progress') {
            nextKavling = s.kavling.map((lot, idx) => {
              if (lot.id === targetId || lot.code === targetId || (idx === 0 && !targetId)) {
                beforeStr = `Progress ${lot.progress}% · Rp${lot.price.toLocaleString('id-ID')}`;
                const nextProg =
                  mode === 'SET'
                    ? Math.min(100, Math.max(0, delta))
                    : Math.min(100, Math.max(0, lot.progress + delta));
                afterStr = `Progress ${nextProg}%`;
                return { ...lot, progress: nextProg };
              }
              return lot;
            });
          } else if (collectionKey === 'coa') {
            nextCoa = s.coa.map((acc, idx) => {
              if (acc.code === targetId || (idx === 3 && !targetId)) {
                beforeStr = `Rp${acc.balance.toLocaleString('id-ID')}`;
                const nextBal = mode === 'SET' ? delta : acc.balance + delta;
                afterStr = `Rp${nextBal.toLocaleString('id-ID')}`;
                return { ...acc, balance: nextBal };
              }
              return acc;
            });
          } else if (collectionKey === 'po_invoice') {
            nextPOs = s.purchaseOrders.map((po, idx) => {
              if (po.id === targetId || (idx === 0 && !targetId)) {
                beforeStr = `Rp${po.grandTotal.toLocaleString('id-ID')}`;
                const nextTotal = mode === 'SET' ? Math.max(0, delta) : Math.max(0, po.grandTotal + delta);
                afterStr = `Rp${nextTotal.toLocaleString('id-ID')}`;
                return { ...po, grandTotal: nextTotal };
              }
              return po;
            });
          } else if (collectionKey === 'transactions') {
            nextJournals = s.journals.map((j, idx) => {
              if (j.id === targetId || (idx === 0 && !targetId)) {
                beforeStr = `Rp${j.amount.toLocaleString('id-ID')}`;
                const nextAmt = mode === 'SET' ? Math.max(0, delta) : Math.max(0, j.amount + delta);
                afterStr = `Rp${nextAmt.toLocaleString('id-ID')}`;
                return { ...j, amount: nextAmt };
              }
              return j;
            });
          }

          return {
            inventory: nextInventory,
            kavling: nextKavling,
            coa: nextCoa,
            purchaseOrders: nextPOs,
            journals: nextJournals,
            adminCrudLogs: [
              {
                id: `crud-${Date.now()}`,
                timestamp: now,
                adminName,
                adminEmail,
                actionType: mode === 'SET' ? 'EDIT' : 'KURANGI',
                collectionName: collectionKey,
                targetId: targetId || 'ITEM-UTAMA',
                beforeValue: beforeStr,
                afterValue: afterStr,
                reason,
              },
              ...s.adminCrudLogs,
            ],
            activityLogs: [
              {
                id: `act-${Date.now()}`,
                user: adminName,
                role: 'ADMIN',
                action: `[${mode === 'SET' ? 'EDIT' : '➖ KURANGI'}] ${collectionKey} (${targetId}): ${beforeStr} → ${afterStr}. Alasan: ${reason}`,
                module: 'Super Admin Control',
                timestamp: 'Baru saja',
              },
              ...s.activityLogs,
            ],
          };
        }),

      deleteRecordsFromCollection: (collectionKey, ids, hardDelete) =>
        set((s) => {
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const adminName = s.currentUser?.name || 'Super Admin';
          const adminEmail = s.currentUser?.email || 'superadmin@bahagia.com';
          const isLastOnly = ids.length === 1 && ids[0] === 'LAST_RECORD';

          let deletedTitle = `${collectionKey} (${ids.join(', ')})`;
          let nextKavling = s.kavling;
          let nextBookings = s.bookings;
          let nextSuppliers = s.suppliers;
          let nextInventory = s.inventory;
          let nextPOs = s.purchaseOrders;
          let nextJournals = s.journals;
          let nextAttendance = s.attendance;
          let nextSubmissions = s.projectSubmissions;

          if (collectionKey === 'units_kavling') {
            if (isLastOnly && s.kavling.length > 0) {
              deletedTitle = `Kavling ${s.kavling[0].id}`;
              nextKavling = s.kavling.slice(1);
            } else {
              nextKavling = s.kavling.filter((k) => !ids.includes(k.id));
            }
          } else if (collectionKey === 'bookings' || collectionKey === 'spr_prospek') {
            if (isLastOnly && s.bookings.length > 0) {
              deletedTitle = `Booking ${s.bookings[0].id} - ${s.bookings[0].buyerName}`;
              nextBookings = s.bookings.slice(1);
            } else {
              nextBookings = s.bookings.filter((b) => !ids.includes(b.id));
            }
          } else if (collectionKey === 'suppliers') {
            if (isLastOnly && s.suppliers.length > 0) {
              deletedTitle = `Supplier ${s.suppliers[0].name}`;
              nextSuppliers = s.suppliers.slice(1);
            } else {
              nextSuppliers = s.suppliers.filter((sup) => !ids.includes(sup.id));
            }
          } else if (collectionKey === 'inventory') {
            if (isLastOnly && s.inventory.length > 0) {
              deletedTitle = `Material ${s.inventory[0].name}`;
              nextInventory = s.inventory.slice(1);
            } else {
              nextInventory = s.inventory.filter((inv) => !ids.includes(inv.id) && !ids.includes(inv.code));
            }
          } else if (collectionKey === 'po_invoice') {
            if (isLastOnly && s.purchaseOrders.length > 0) {
              deletedTitle = `PO ${s.purchaseOrders[0].id}`;
              nextPOs = s.purchaseOrders.slice(1);
            } else {
              nextPOs = s.purchaseOrders.filter((po) => !ids.includes(po.id));
            }
          } else if (collectionKey === 'transactions') {
            if (isLastOnly && s.journals.length > 0) {
              deletedTitle = `Jurnal ${s.journals[0].id}`;
              nextJournals = s.journals.slice(1);
            } else {
              nextJournals = s.journals.filter((j) => !ids.includes(j.id));
            }
          } else if (collectionKey === 'absensi_payroll') {
            if (isLastOnly && s.attendance.length > 0) {
              deletedTitle = `Absensi ${s.attendance[0].employeeName}`;
              nextAttendance = s.attendance.slice(1);
            } else {
              nextAttendance = s.attendance.filter((a) => !ids.includes(a.id));
            }
          } else if (collectionKey === 'project_submissions') {
            if (isLastOnly && s.projectSubmissions.length > 0) {
              deletedTitle = `Pengajuan ${s.projectSubmissions[0].submissionNumber}`;
              nextSubmissions = s.projectSubmissions.slice(1);
            } else {
              nextSubmissions = s.projectSubmissions.filter((p) => !ids.includes(p.id));
            }
          }

          return {
            kavling: nextKavling,
            bookings: nextBookings,
            suppliers: nextSuppliers,
            inventory: nextInventory,
            purchaseOrders: nextPOs,
            journals: nextJournals,
            attendance: nextAttendance,
            projectSubmissions: nextSubmissions,
            trashItems: hardDelete
              ? s.trashItems
              : [
                  {
                    id: `del-${Date.now()}`,
                    collection: collectionKey,
                    title: deletedTitle,
                    deletedAt: now,
                  },
                  ...s.trashItems,
                ],
            adminCrudLogs: [
              {
                id: `crud-${Date.now()}`,
                timestamp: now,
                adminName,
                adminEmail,
                actionType: 'HAPUS',
                collectionName: collectionKey,
                targetId: deletedTitle,
                beforeValue: 'Aktif',
                afterValue: hardDelete ? 'Hard Deleted (Permanen)' : 'Soft Deleted (Trash 30 Hari)',
                reason: hardDelete ? 'Penghapusan permanen oleh Super Admin' : 'Dipindahkan ke Trash Bin',
              },
              ...s.adminCrudLogs,
            ],
            activityLogs: [
              {
                id: `act-${Date.now()}`,
                user: adminName,
                role: 'ADMIN',
                action: `[🗑️ HAPUS ${hardDelete ? 'PERMANEN' : 'SOFT DELETE'}] ${deletedTitle}`,
                module: 'Super Admin Control',
                timestamp: 'Baru saja',
              },
              ...s.activityLogs,
            ],
          };
        }),

      resetSelectedCollections: (collectionKeys, autoBackup = true) =>
        set((s) => {
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const adminName = s.currentUser?.name || 'Super Admin';
          const adminEmail = s.currentUser?.email || 'superadmin@bahagia.com';

          // Trigger automatic JSON Backup download before resetting
          if (autoBackup && typeof window !== 'undefined') {
            try {
              const backupPayload = {
                backupTimestamp: now,
                triggeredBy: adminEmail,
                protectedCoaCount: s.coa.length,
                resetCollections: collectionKeys,
                snapshot: {
                  kavling: s.kavling,
                  bookings: s.bookings,
                  journals: s.journals,
                  verifications: s.verifications,
                  purchaseOrders: s.purchaseOrders,
                  inventory: s.inventory,
                  suppliers: s.suppliers,
                  attendance: s.attendance,
                  projectSubmissions: s.projectSubmissions,
                },
              };
              const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
                type: 'application/json',
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `auto-backup-before-reset-${Date.now()}.json`;
              a.click();
            } catch {
              // ignore browser download restrictions
            }
          }

          const resetAll = collectionKeys.includes('all_dummy');
          const has = (k: string) => resetAll || collectionKeys.includes(k);

          // Bersihkan dokumen erp_records di Firestore secara asinkron
          clearFirestoreCollectionsOnReset();

          const nextCoa = collectionKeys.includes('coa')
            ? INITIAL_COA.map((c) => ({ ...c, balance: 0 }))
            : has('transactions')
            ? s.coa.map((c) => ({ ...c, balance: 0 }))
            : s.coa;

          return {
            lastResetTimestamp: Date.now(),
            coa: nextCoa,
            kavling: has('units_kavling') ? [] : s.kavling,
            bookings: has('bookings') || has('spr_prospek') ? [] : s.bookings,
            complaints: has('bookings') || has('spr_prospek') ? [] : s.complaints,
            journals: has('transactions') ? [] : s.journals,
            cashTransactions: has('transactions') ? [] : s.cashTransactions,
            verifications: has('work_progress') ? [] : s.verifications,
            fasumList: has('work_progress')
              ? s.fasumList.map((f) => ({ ...f, progress: 0, realized: 0 }))
              : s.fasumList,
            fasosList: has('work_progress')
              ? s.fasosList.map((f) => ({ ...f, progress: 0, realized: 0 }))
              : s.fasosList,
            lahanList: has('work_progress')
              ? s.lahanList.map((l) => ({ ...l, progress: 0, realized: 0 }))
              : s.lahanList,
            purchaseOrders: has('po_invoice') ? [] : s.purchaseOrders,
            inventory: has('inventory') ? [] : s.inventory,
            stockMovements: has('inventory') ? [] : s.stockMovements,
            stockOpnameBatches: has('inventory') ? [] : s.stockOpnameBatches,
            suppliers: has('suppliers') ? [] : s.suppliers,
            attendance: has('absensi_payroll') ? [] : s.attendance,
            projectSubmissions: has('project_submissions') ? [] : s.projectSubmissions,
            emailLogs: resetAll ? [] : s.emailLogs,
            activityLogs: resetAll ? [] : s.activityLogs,
            publicTestimonials: has('testimonials') ? [] : s.publicTestimonials,
            galleryPhotos: has('gallery_photos') ? [] : s.galleryPhotos,
            projectPhysicalProgress:
              has('gallery_photos') || has('work_progress')
                ? s.projectPhysicalProgress.map((p) => ({
                    ...p,
                    overallPercentage: 0,
                    stages: p.stages.map((st) => ({ ...st, percentage: 0 })),
                  }))
                : s.projectPhysicalProgress,
            blogArticles: has('articles') ? [] : s.blogArticles,
            adminCrudLogs: [
              {
                id: `crud-${Date.now()}`,
                timestamp: now,
                adminName,
                adminEmail,
                actionType: 'RESET',
                collectionName: collectionKeys.join(', '),
                targetId: 'KOLEKSI DUMMY',
                beforeValue: 'Berisi Data Contoh',
                afterValue: '0 Data (Siap Input Riil · COA Aman)',
                reason: 'Reset Data Dummy melalui /sistem/reset-data dengan Auto-Backup JSON',
              },
              ...s.adminCrudLogs,
            ],
          };
        }),

      restoreInitialDemoData: () =>
        set((s) => {
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const adminName = s.currentUser?.name || 'Super Admin';
          const adminEmail = s.currentUser?.email || 'superadmin@bahagia.com';
          return {
            lastResetTimestamp: 0,
            coa: INITIAL_COA,
            kavling: generateInitialKavling(),
            fasumList: FASUM_16_TYPES,
            fasosList: FASOS_4_TYPES,
            lahanList: LAHAN_5_STAGES,
            publicTestimonials: INITIAL_PUBLIC_TESTIMONIALS,
            testimonialSettings: INITIAL_TESTIMONIAL_SETTINGS,
            galleryPhotos: INITIAL_GALLERY_PHOTOS,
            projectPhysicalProgress: INITIAL_PROJECT_PHYSICAL_PROGRESS,
            gallerySettings: INITIAL_GALLERY_SETTINGS,
            blogArticles: INITIAL_BLOG_ARTICLES,
            blogSettings: INITIAL_BLOG_SETTINGS,
            adminCrudLogs: [
              {
                id: `crud-${Date.now()}`,
                timestamp: now,
                adminName,
                adminEmail,
                actionType: 'RESTORE',
                collectionName: 'Seluruh Koleksi Demo',
                targetId: '122 Unit & Data Awal',
                beforeValue: 'Kosong',
                afterValue: 'Dipulihkan ke Data Seed Awal',
                reason: 'Restore sampel data demo oleh Super Admin',
              },
              ...s.adminCrudLogs,
            ],
          };
        }),

      // =========================================================
      // SUPER ADMIN FULL CONTROL ACTIONS
      // =========================================================
      setEditMode: (enabled) => set({ editMode: enabled }),

      getText: (key, fallback) => {
        const item = get().editableTexts[key];
        return item ? item.currentText : fallback;
      },

      updateEditableText: (key, newText, location = 'Halaman Aplikasi', category = 'Website') =>
        set((s) => {
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const adminName = s.currentUser?.name || 'Super Admin';
          const adminEmail = s.currentUser?.email || 'superadmin@bahagia.com';
          const existing = s.editableTexts[key] || {
            key,
            category,
            location,
            defaultText: newText,
            currentText: newText,
            history: [],
          };
          const prevVal = existing.currentText;
          const updatedItem: EditableTextItem = {
            ...existing,
            currentText: newText,
            updatedAt: now,
            updatedBy: adminName,
            history: [
              { timestamp: now, editor: adminName, value: prevVal },
              ...(existing.history || []),
            ].slice(0, 20),
          };
          syncErpRecordToFirestore({
            id: key,
            collectionName: 'website_content',
            companyId: 'GROUP',
            title: existing.location || key,
            status: 'Published',
          });
          return {
            editableTexts: {
              ...s.editableTexts,
              [key]: updatedItem,
            },
            adminCrudLogs: [
              {
                id: `crud-${Date.now()}`,
                timestamp: now,
                adminName,
                adminEmail,
                actionType: 'EDIT',
                collectionName: `Teks (${existing.category})`,
                targetId: existing.location || key,
                beforeValue: prevVal.slice(0, 60),
                afterValue: newText.slice(0, 60),
                reason: 'Edit teks langsung oleh Super Admin',
              },
              ...s.adminCrudLogs,
            ],
            activityLogs: [
              {
                id: `act-${Date.now()}`,
                user: adminName,
                role: 'ADMIN',
                action: `[✏️ EDIT TEKS] ${existing.location || key}: "${newText.slice(0, 45)}"`,
                module: 'Edit Teks',
                timestamp: 'Baru saja',
              },
              ...s.activityLogs,
            ],
          };
        }),

      resetEditableText: (key) =>
        set((s) => {
          const existing = s.editableTexts[key];
          if (!existing) return s;
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const adminName = s.currentUser?.name || 'Super Admin';
          return {
            editableTexts: {
              ...s.editableTexts,
              [key]: {
                ...existing,
                currentText: existing.defaultText,
                updatedAt: now,
                updatedBy: adminName,
              },
            },
          };
        }),

      revertEditableTextVersion: (key, versionIdx) =>
        set((s) => {
          const existing = s.editableTexts[key];
          if (!existing || !existing.history[versionIdx]) return s;
          const targetVer = existing.history[versionIdx];
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const adminName = s.currentUser?.name || 'Super Admin';
          return {
            editableTexts: {
              ...s.editableTexts,
              [key]: {
                ...existing,
                currentText: targetVer.value,
                updatedAt: now,
                updatedBy: adminName,
              },
            },
          };
        }),

      resetAllEditableTexts: () =>
        set(() => ({
          editableTexts: generateInitialEditableTexts(),
        })),

      updateCmsContent: (patch, tabName = 'CMS') =>
        set((s) => {
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const adminName = s.currentUser?.name || 'Super Admin';
          const adminEmail = s.currentUser?.email || 'superadmin@bahagia.com';
          const nextCms = { ...s.cmsContent, ...patch };
          syncErpRecordToFirestore({
            id: `cms_${tabName}`,
            collectionName: 'website_content',
            companyId: 'GROUP',
            title: `CMS Tab ${tabName}`,
            status: 'Published',
          });
          return {
            cmsContent: nextCms,
            adminCrudLogs: [
              {
                id: `crud-${Date.now()}`,
                timestamp: now,
                adminName,
                adminEmail,
                actionType: 'EDIT',
                collectionName: 'website_content',
                targetId: `Tab ${tabName}`,
                beforeValue: 'Versi Sebelumnya',
                afterValue: 'Dipublikasikan ke Website Publik',
                reason: `Publikasi CMS Website Tab ${tabName}`,
              },
              ...s.adminCrudLogs,
            ],
            activityLogs: [
              {
                id: `act-${Date.now()}`,
                user: adminName,
                role: 'ADMIN',
                action: `[🚀 PUBLISH CMS] Menyimpan & mempublikasikan perubahan Tab ${tabName}`,
                module: 'Website Editor',
                timestamp: 'Baru saja',
              },
              ...s.activityLogs,
            ],
          };
        }),

      addPhotoToSlot: (slotKey, url, caption, sizeKb = 320) =>
        set((s) => {
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const adminName = s.currentUser?.name || 'Super Admin';
          const ts = Date.now();
          const exists = s.photoSlots.some((sl) => sl.slotKey === slotKey);
          const nextSlots = exists
            ? s.photoSlots.map((sl) => {
                if (sl.slotKey !== slotKey) return sl;
                const newEntry = {
                  id: `ph-${ts}-${Math.random().toString(36).slice(2, 6)}`,
                  url,
                  storagePath: sl.folderPath.replace('{timestamp}', String(ts)).replace('{blok}{nomor}', 'A01'),
                  caption: caption || sl.title,
                  isPrimary: true,
                  sizeKb,
                  uploadedAt: now,
                };
                return {
                  ...sl,
                  photos: [
                    newEntry,
                    ...sl.photos.map((p) => ({ ...p, isPrimary: false })),
                  ],
                };
              })
            : [
                ...s.photoSlots,
                {
                  slotKey,
                  title: caption || slotKey,
                  scope: 'Website Publik' as const,
                  folderPath: `/photos/${slotKey}-${ts}.jpg`,
                  defaultUrl: url,
                  photos: [
                    {
                      id: `ph-${ts}`,
                      url,
                      storagePath: `/photos/${slotKey}-${ts}.jpg`,
                      caption: caption || slotKey,
                      isPrimary: true,
                      sizeKb,
                      uploadedAt: now,
                    },
                  ],
                },
              ];
          return {
            photoSlots: nextSlots,
            activityLogs: [
              {
                id: `act-${ts}`,
                user: adminName,
                role: 'ADMIN',
                action: `[🖼️ GANTI/UPLOAD FOTO] Mengganti foto utama pada slot "${slotKey}"`,
                module: 'Manajemen Foto',
                timestamp: 'Baru saja',
              },
              ...s.activityLogs,
            ],
          };
        }),

      deletePhotoFromSlot: (slotKey, photoId) =>
        set((s) => {
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          let deletedTitle = `Foto (${slotKey})`;
          const nextSlots = s.photoSlots.map((sl) => {
            if (sl.slotKey !== slotKey) return sl;
            const found = sl.photos.find((p) => p.id === photoId);
            if (found) deletedTitle = `${found.caption} (${found.storagePath})`;
            const remaining = sl.photos.filter((p) => p.id !== photoId);
            if (remaining.length > 0 && !remaining.some((p) => p.isPrimary)) {
              remaining[0] = { ...remaining[0], isPrimary: true };
            }
            return { ...sl, photos: remaining };
          });
          return {
            photoSlots: nextSlots,
            trashItems: [
              { id: `tr-ph-${Date.now()}`, collection: 'photos', title: deletedTitle, deletedAt: now },
              ...s.trashItems,
            ],
          };
        }),

      setPrimaryPhotoInSlot: (slotKey, photoId) =>
        set((s) => ({
          photoSlots: s.photoSlots.map((sl) =>
            sl.slotKey === slotKey
              ? {
                  ...sl,
                  photos: sl.photos.map((p) => ({ ...p, isPrimary: p.id === photoId })),
                }
              : sl
          ),
        })),

      reorderPhotoInSlot: (slotKey, fromIdx, toIdx) =>
        set((s) => ({
          photoSlots: s.photoSlots.map((sl) => {
            if (sl.slotKey !== slotKey) return sl;
            const arr = [...sl.photos];
            if (fromIdx < 0 || toIdx < 0 || fromIdx >= arr.length || toIdx >= arr.length) return sl;
            const [moved] = arr.splice(fromIdx, 1);
            arr.splice(toIdx, 0, moved);
            return { ...sl, photos: arr };
          }),
        })),

      resetPhotoSlot: (slotKey) =>
        set((s) => {
          const initial = INITIAL_PHOTO_SLOTS.find((x) => x.slotKey === slotKey);
          if (!initial) return s;
          return {
            photoSlots: s.photoSlots.map((sl) => (sl.slotKey === slotKey ? initial : sl)),
          };
        }),

      addDataMasterItem: (category, code, label) =>
        set((s) => {
          const list = s.dataMaster[category] || [];
          const newItem: DataMasterItem = {
            id: `dm-${Date.now()}`,
            code: code.toUpperCase(),
            label,
            active: true,
            order: list.length + 1,
          };
          return {
            dataMaster: {
              ...s.dataMaster,
              [category]: [...list, newItem],
            },
          };
        }),

      updateDataMasterItem: (category, id, patch) =>
        set((s) => ({
          dataMaster: {
            ...s.dataMaster,
            [category]: (s.dataMaster[category] || []).map((it) =>
              it.id === id ? { ...it, ...patch } : it
            ),
          },
        })),

      deleteDataMasterItem: (category, id) =>
        set((s) => {
          const list = s.dataMaster[category] || [];
          const target = list.find((x) => x.id === id);
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          return {
            dataMaster: {
              ...s.dataMaster,
              [category]: list.filter((x) => x.id !== id),
            },
            trashItems: target
              ? [
                  {
                    id: `tr-dm-${Date.now()}`,
                    collection: 'data_master',
                    title: `[${category}] ${target.code} - ${target.label}`,
                    deletedAt: now,
                  },
                  ...s.trashItems,
                ]
              : s.trashItems,
          };
        }),

      reorderDataMasterItem: (category, id, direction) =>
        set((s) => {
          const list = [...(s.dataMaster[category] || [])];
          const idx = list.findIndex((x) => x.id === id);
          if (idx === -1) return s;
          const targetIdx = direction === 'UP' ? idx - 1 : idx + 1;
          if (targetIdx < 0 || targetIdx >= list.length) return s;
          const [moved] = list.splice(idx, 1);
          list.splice(targetIdx, 0, moved);
          return {
            dataMaster: {
              ...s.dataMaster,
              [category]: list.map((it, i) => ({ ...it, order: i + 1 })),
            },
          };
        }),

      addCompanyFull: (payload) =>
        set((s) => {
          const newId = (payload.id || `PT_${Date.now().toString().slice(-3)}`) as any;
          const newComp: CompanyInfo = {
            ...payload,
            id: newId,
          };
          return {
            companies: [...s.companies, newComp],
          };
        }),

      deleteCompanySoft: (id) =>
        set((s) => {
          const target = s.companies.find((c) => c.id === id);
          if (!target) return s;
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          return {
            companies: s.companies.filter((c) => c.id !== id),
            trashItems: [
              {
                id: `tr-comp-${Date.now()}`,
                collection: 'companies',
                title: `${target.name} (${target.projectName})`,
                deletedAt: now,
              },
              ...s.trashItems,
            ],
          };
        }),

      duplicateCompany: (id) =>
        set((s) => {
          const target = s.companies.find((c) => c.id === id);
          if (!target) return s;
          const copy: CompanyInfo = {
            ...target,
            id: `${target.id}_COPY` as any,
            name: `${target.name} (Salinan)`,
            projectName: `${target.projectName} Tahap Baru`,
            slug: `${target.slug}-baru`,
          };
          return {
            companies: [...s.companies, copy],
          };
        }),

      updateUserFull: (id, patch) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
        })),

      deleteUserSoft: (id, reason) => {
        const s = get();
        const target = s.users.find((u) => u.id === id);
        if (!target) return { ok: false, message: 'User tidak ditemukan' };
        const activeAdmins = s.users.filter((u) => u.roles.includes('ADMIN') && u.active);
        if (target.roles.includes('ADMIN') && activeAdmins.length <= 1) {
          return {
            ok: false,
            message: 'Tidak dapat menghapus Super Admin terakhir di sistem!',
          };
        }
        const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
        const adminName = s.currentUser?.name || 'Super Admin';
        const adminEmail = s.currentUser?.email || 'superadmin@bahagia.com';
        set((st) => ({
          users: st.users.filter((u) => u.id !== id),
          trashItems: [
            {
              id: `tr-usr-${Date.now()}`,
              collection: 'users',
              title: `User: ${target.name} (${target.email})`,
              deletedAt: now,
            },
            ...st.trashItems,
          ],
          adminCrudLogs: [
            {
              id: `crud-${Date.now()}`,
              timestamp: now,
              adminName,
              adminEmail,
              actionType: 'HAPUS',
              collectionName: 'users',
              targetId: target.email,
              beforeValue: `${target.name} (${target.role})`,
              afterValue: 'Soft Deleted (Trash 30 Hari)',
              reason: reason || 'Dihapus oleh Super Admin',
            },
            ...st.adminCrudLogs,
          ],
        }));
        return { ok: true, message: `User ${target.name} berhasil dipindahkan ke Trash.` };
      },

      addRoleFull: (roleCode, level) =>
        set((s) => {
          const basePerms = s.roles[0]?.permissions || {};
          return {
            roles: [
              ...s.roles,
              {
                role: roleCode.toUpperCase() as RoleCode,
                name: roleCode.toUpperCase(),
                level: 'PT' as const,
                description: level,
                color: '#059669',
                permissions: JSON.parse(JSON.stringify(basePerms)),
              },
            ],
          };
        }),

      deleteRoleSoft: (roleCode) =>
        set((s) => {
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          return {
            roles: s.roles.filter((r) => r.role !== roleCode),
            trashItems: [
              {
                id: `tr-role-${Date.now()}`,
                collection: 'roles',
                title: `Role: ${roleCode}`,
                deletedAt: now,
              },
              ...s.trashItems,
            ],
          };
        }),

      duplicateRole: (roleCode) =>
        set((s) => {
          const target = s.roles.find((r) => r.role === roleCode);
          if (!target) return s;
          return {
            roles: [
              ...s.roles,
              {
                ...target,
                role: `${target.role}_COPY` as RoleCode,
                name: `${target.name} (Salinan)`,
                permissions: JSON.parse(JSON.stringify(target.permissions)),
              },
            ],
          };
        }),

      createBackupSnapshot: (name, type = 'Manual') => {
        const s = get();
        const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
        const adminName = s.currentUser?.name || 'Super Admin';
        const payloadObj = {
          timestamp: now,
          companies: s.companies,
          usersCount: s.users.length,
          coaCount: s.coa.length,
          kavlingCount: s.kavling.length,
          bookings: s.bookings,
          cashTransactions: s.cashTransactions,
          journals: s.journals,
          cmsContent: s.cmsContent,
          dataMaster: s.dataMaster,
        };
        const jsonStr = JSON.stringify(payloadObj, null, 2);
        const snap: BackupSnapshotRecord = {
          id: `bkp-${Date.now()}`,
          name: name || `Backup Penuh Sistem (${now})`,
          createdAt: now,
          createdBy: adminName,
          sizeKb: Math.max(120, Math.round(jsonStr.length / 1024) + 850),
          type,
          collectionsCount: 55,
          payloadJson: jsonStr,
        };
        set((st) => ({
          backupSnapshots: [snap, ...st.backupSnapshots],
        }));
        return snap;
      },

      restoreBackupSnapshot: (id) =>
        set((s) => {
          const snap = s.backupSnapshots.find((b) => b.id === id);
          if (!snap) return s;
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const adminName = s.currentUser?.name || 'Super Admin';
          return {
            activityLogs: [
              {
                id: `act-${Date.now()}`,
                user: adminName,
                role: 'ADMIN',
                action: `[♻️ RESTORE BACKUP] Memulihkan snapshot "${snap.name}" (${snap.createdAt})`,
                module: 'Backup & Restore',
                timestamp: 'Baru saja',
              },
              ...s.activityLogs,
            ],
          };
        }),

      setAutoBackupEnabled: (v) => set({ autoBackupEnabled: v }),

      permanentDeleteTrashItem: (id) =>
        set((s) => ({
          trashItems: s.trashItems.filter((t) => t.id !== id),
        })),

      revertAdminCrudLog: (logId) =>
        set((s) => {
          const log = s.adminCrudLogs.find((l) => l.id === logId);
          if (!log) return s;
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const adminName = s.currentUser?.name || 'Super Admin';
          return {
            adminCrudLogs: s.adminCrudLogs.filter((l) => l.id !== logId),
            activityLogs: [
              {
                id: `act-${Date.now()}`,
                user: adminName,
                role: 'ADMIN',
                action: `[↩️ REVERT PERUBAHAN] Mengembalikan ${log.collectionName} (${log.targetId}) ke nilai "${log.beforeValue}"`,
                module: 'Audit Log Revert',
                timestamp: 'Baru saja',
              },
              ...s.activityLogs,
            ],
          };
        }),

      // =========================================================
      // AUTO-SYNC PROYEK / LOKASI BARU KE WEBSITE PUBLIK
      // =========================================================
      saveSyncedProject: (payload, generateUnitsNow = true) => {
        const s = get();
        const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
        const adminName = s.currentUser?.name || 'Super Admin';
        const adminEmail = s.currentUser?.email || 'superadmin@bahagia.com';

        const existing = payload.id ? s.syncedProjects.find((p) => p.id === payload.id) : undefined;
        const otherSlugs = s.syncedProjects
          .filter((p) => p.id !== existing?.id)
          .map((p) => p.slug);

        const finalSlug =
          existing && existing.projectName.toLowerCase() === payload.projectName.toLowerCase()
            ? existing.slug
            : generateProjectSlug(payload.projectName, otherSlugs);

        const lat = Number(payload.coordinates?.lat) || -4.0096;
        const lng = Number(payload.coordinates?.lng) || 122.5127;
        const autoEmbedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

        const totalCalculatedUnits =
          payload.blocks && payload.blocks.length > 0
            ? payload.blocks.reduce((acc, b) => acc + (Number(b.unitCount) || 0), 0)
            : Number(payload.totalUnits) || 25;

        const nextStatus: SyncedProjectRecord['publishStatus'] =
          payload.publishStatus || 'Published';

        const record: SyncedProjectRecord = {
          ...payload,
          id: existing?.id || `PRJ-${Date.now().toString().slice(-5)}`,
          slug: finalSlug,
          totalUnits: totalCalculatedUnits,
          coordinates: { lat, lng },
          googleMapsEmbedUrl: autoEmbedUrl,
          publishStatus: nextStatus,
          previewToken: existing?.previewToken || `prev-${Date.now().toString(36)}`,
          stats: existing?.stats || { views: 120, leads: 14, bookingsCount: 2 },
          history: [
            {
              timestamp: now,
              actor: `${adminName} (ADMIN)`,
              action: existing
                ? `Update Proyek "${payload.projectName}" (${nextStatus}) — Auto-Sync ke Website Publik`
                : `Tambah Proyek Baru "${payload.projectName}" (/proyek/${finalSlug}) — Auto-Sync ke Website Publik`,
            },
            ...(existing?.history || []),
          ],
        };

        // Auto-generate Kavling units for this project if requested and not yet present
        const existingProjectLots = s.kavling.filter(
          (k) => k.projectName.toLowerCase() === record.projectName.toLowerCase()
        );
        const generatedLots: KavlingLot[] = [];
        if (generateUnitsNow && existingProjectLots.length === 0 && record.blocks.length > 0) {
          let seq = 1;
          for (const blk of record.blocks) {
            const blkLetter = (blk.blockName.trim().toUpperCase().slice(0, 1) || 'A') as 'A' | 'B' | 'C' | 'D';
            const count = Math.min(100, Math.max(1, Number(blk.unitCount) || 10));
            for (let i = 1; i <= count; i++) {
              const code = `${blkLetter}-${String(i).padStart(2, '0')}`;
              generatedLots.push({
                id: `${record.slug.toUpperCase()}-${code}`,
                companyId: (record.companyId === 'PT_BPP' ? 'PT_BPP' : 'PT_TBL') as 'PT_TBL' | 'PT_BPP',
                projectName: record.projectName,
                block: blkLetter,
                number: seq++,
                code,
                type: `${record.unitType} (${record.lotDimensions})`,
                landSize: `${record.lotDimensions} (${record.landSize} m²)`,
                extraLand: record.advantages[0] || 'Kavling Siap Bangun',
                price: record.price || 169000000,
                hpp: record.hpp || 125000000,
                status: 'Tersedia',
                progress: 0,
                pjtVerified: true,
                photos: [record.heroImage, ...(record.galleryPhotos || [])],
                pengawasNotes: `Auto-Sync Proyek ${record.projectName}`,
                pjtNotes: `${record.wallSpec} · ${record.roofSpec}`,
              });
            }
          }
        }

        syncErpRecordToFirestore({
          id: record.id,
          collectionName: 'projects',
          companyId: record.companyId,
          title: `${record.projectName} (/proyek/${record.slug})`,
          status: record.publishStatus,
          amount: record.price,
        });

        set((st) => ({
          syncedProjects: existing
            ? st.syncedProjects.map((p) => (p.id === existing.id ? record : p))
            : [...st.syncedProjects, record],
          kavling: generatedLots.length > 0 ? [...st.kavling, ...generatedLots] : st.kavling,
          adminCrudLogs: [
            {
              id: `crud-${Date.now()}`,
              timestamp: now,
              adminName,
              adminEmail,
              actionType: existing ? 'EDIT' : 'TAMBAH',
              collectionName: 'projects (Auto-Sync Web)',
              targetId: `/proyek/${record.slug}`,
              beforeValue: existing ? existing.projectName : '-',
              afterValue: `${record.projectName} (${record.totalUnits} Unit · ${record.publishStatus})`,
              reason: 'Auto-Sync Proyek/Lokasi ke Home, Katalog, Detail Proyek, Navbar & Footer',
            },
            ...st.adminCrudLogs,
          ],
          activityLogs: [
            {
              id: `act-${Date.now()}`,
              user: adminName,
              role: 'ADMIN',
              action: `[🚀 AUTO-SYNC PROYEK] ${record.projectName} (/proyek/${record.slug}) — Status: ${record.publishStatus}`,
              module: 'Kelola Proyek',
              timestamp: 'Baru saja',
            },
            ...st.activityLogs,
          ],
        }));

        return record;
      },

      toggleProjectPublishStatus: (id, targetStatus) =>
        set((s) => {
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const adminName = s.currentUser?.name || 'Super Admin';
          return {
            syncedProjects: s.syncedProjects.map((p) => {
              if (p.id !== id) return p;
              const nextSt =
                targetStatus || (p.publishStatus === 'Published' ? 'Nonaktif' : 'Published');
              return {
                ...p,
                publishStatus: nextSt,
                history: [
                  {
                    timestamp: now,
                    actor: `${adminName} (ADMIN)`,
                    action: `Ubah status publikasi ke ${nextSt}`,
                  },
                  ...(p.history || []),
                ],
              };
            }),
          };
        }),

      toggleProjectFeatured: (id) =>
        set((s) => ({
          syncedProjects: s.syncedProjects.map((p) =>
            p.id === id ? { ...p, isFeatured: !p.isFeatured } : p
          ),
        })),

      duplicateSyncedProject: (id) => {
        const s = get();
        const target = s.syncedProjects.find((p) => p.id === id);
        if (!target) return null;
        const copyName = `${target.projectName} Tahap Baru`;
        return s.saveSyncedProject(
          {
            ...target,
            id: undefined,
            projectName: copyName,
            publishStatus: 'Draft',
          },
          false
        );
      },

      deleteSyncedProjectSoft: (id, deleteUnitsToo = false) =>
        set((s) => {
          const target = s.syncedProjects.find((p) => p.id === id);
          if (!target) return s;
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const adminName = s.currentUser?.name || 'Super Admin';
          const adminEmail = s.currentUser?.email || 'superadmin@bahagia.com';
          return {
            syncedProjects: s.syncedProjects.filter((p) => p.id !== id),
            kavling: deleteUnitsToo
              ? s.kavling.filter(
                  (k) => k.projectName.toLowerCase() !== target.projectName.toLowerCase()
                )
              : s.kavling,
            trashItems: [
              {
                id: `tr-prj-${Date.now()}`,
                collection: 'projects',
                title: `Proyek: ${target.projectName} (/proyek/${target.slug})`,
                deletedAt: now,
              },
              ...s.trashItems,
            ],
            adminCrudLogs: [
              {
                id: `crud-${Date.now()}`,
                timestamp: now,
                adminName,
                adminEmail,
                actionType: 'HAPUS',
                collectionName: 'projects',
                targetId: target.projectName,
                beforeValue: `${target.publishStatus} (${target.totalUnits} Unit)`,
                afterValue: 'Soft Deleted (Trash 30 Hari)',
                reason: deleteUnitsToo
                  ? 'Hapus proyek beserta seluruh unit kavling'
                  : 'Hapus proyek (unit kavling dipertahankan)',
              },
              ...s.adminCrudLogs,
            ],
          };
        }),

      bulkUpdateSyncedProjects: (ids, action) =>
        set((s) => {
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          if (action === 'DELETE') {
            const removed = s.syncedProjects.filter((p) => ids.includes(p.id));
            const removedNames = removed.map((r) => r.projectName.toLowerCase());
            return {
              syncedProjects: s.syncedProjects.filter((p) => !ids.includes(p.id)),
              kavling: s.kavling.filter((k) => !removedNames.includes(k.projectName.toLowerCase())),
              trashItems: [
                ...removed.map((r) => ({
                  id: `tr-prj-${Date.now()}-${r.id}`,
                  collection: 'projects',
                  title: `Proyek: ${r.projectName} (/proyek/${r.slug})`,
                  deletedAt: now,
                })),
                ...s.trashItems,
              ],
            };
          }
          const nextStatus = action === 'PUBLISH' ? 'Published' : 'Unpublished';
          return {
            syncedProjects: s.syncedProjects.map((p) =>
              ids.includes(p.id) ? { ...p, publishStatus: nextStatus } : p
            ),
          };
        }),

      // =========================================================
      // SECTION 1: TESTIMONI KONSUMEN ACTIONS
      // =========================================================
      savePublicTestimonial: (payload) => {
        const s = get();
        const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
        const adminName = s.currentUser?.name || 'Super Admin';
        const adminEmail = s.currentUser?.email || 'superadmin@bahagia.com';
        const existing = payload.id
          ? s.publicTestimonials.find((t) => t.id === payload.id)
          : undefined;

        const record: PublicTestimonialRecord = {
          ...payload,
          id: existing?.id || `TESTI-${Date.now().toString().slice(-5)}`,
          order: existing?.order ?? payload.order ?? s.publicTestimonials.length + 1,
          createdAt: existing?.createdAt || now,
        };

        syncErpRecordToFirestore({
          id: record.id,
          collectionName: 'testimonials',
          companyId: record.projectName.toLowerCase().includes('residence') ? 'PT_BPP' : 'PT_TBL',
          title: `Testimoni ${record.consumerName} (${record.projectName} ${record.unitBlock})`,
          status: record.status,
          amount: record.rating,
        });

        set((st) => ({
          publicTestimonials: existing
            ? st.publicTestimonials.map((t) => (t.id === existing.id ? record : t))
            : [...st.publicTestimonials, record],
          adminCrudLogs: [
            {
              id: `crud-${Date.now()}`,
              timestamp: now,
              adminName,
              adminEmail,
              actionType: existing ? 'EDIT' : 'TAMBAH',
              collectionName: 'testimonials',
              targetId: `${record.consumerName} (${record.unitBlock})`,
              beforeValue: existing ? existing.testimonialText.slice(0, 40) : '-',
              afterValue: `${record.rating}★ · ${record.status}`,
              reason: 'Kelola Testimoni Konsumen (/sistem/testimoni)',
            },
            ...st.adminCrudLogs,
          ],
        }));

        return record;
      },

      deletePublicTestimonial: (id) =>
        set((s) => {
          const target = s.publicTestimonials.find((t) => t.id === id);
          if (!target) return s;
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const adminName = s.currentUser?.name || 'Super Admin';
          const adminEmail = s.currentUser?.email || 'superadmin@bahagia.com';
          return {
            publicTestimonials: s.publicTestimonials.filter((t) => t.id !== id),
            trashItems: [
              {
                id: `tr-testi-${Date.now()}`,
                collection: 'testimonials',
                title: `Testimoni: ${target.consumerName} (${target.projectName} ${target.unitBlock})`,
                deletedAt: now,
              },
              ...s.trashItems,
            ],
            adminCrudLogs: [
              {
                id: `crud-${Date.now()}`,
                timestamp: now,
                adminName,
                adminEmail,
                actionType: 'HAPUS',
                collectionName: 'testimonials',
                targetId: target.consumerName,
                beforeValue: target.status,
                afterValue: 'Dihapus ke Trash',
                reason: 'Hapus testimoni konsumen oleh Super Admin',
              },
              ...s.adminCrudLogs,
            ],
          };
        }),

      toggleTestimonialStatus: (id) =>
        set((s) => ({
          publicTestimonials: s.publicTestimonials.map((t) =>
            t.id === id
              ? { ...t, status: t.status === 'Aktif' ? 'Nonaktif' : 'Aktif' }
              : t
          ),
        })),

      toggleTestimonialFeatured: (id) =>
        set((s) => ({
          publicTestimonials: s.publicTestimonials.map((t) =>
            t.id === id ? { ...t, isFeatured: !t.isFeatured } : t
          ),
        })),

      reorderPublicTestimonial: (id, direction) =>
        set((s) => {
          const sorted = [...s.publicTestimonials].sort((a, b) => a.order - b.order);
          const idx = sorted.findIndex((t) => t.id === id);
          if (idx === -1) return s;
          const swapIdx = direction === 'UP' ? idx - 1 : idx + 1;
          if (swapIdx < 0 || swapIdx >= sorted.length) return s;
          const temp = sorted[idx];
          sorted[idx] = sorted[swapIdx];
          sorted[swapIdx] = temp;
          return {
            publicTestimonials: sorted.map((item, i) => ({ ...item, order: i + 1 })),
          };
        }),

      updateTestimonialSettings: (patch) =>
        set((s) => ({
          testimonialSettings: { ...s.testimonialSettings, ...patch },
        })),

      resetTestimonialsData: (mode) =>
        set((s) => {
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const adminName = s.currentUser?.name || 'Super Admin';
          const adminEmail = s.currentUser?.email || 'superadmin@bahagia.com';
          return {
            publicTestimonials: mode === 'CLEAR_ALL' ? [] : INITIAL_PUBLIC_TESTIMONIALS,
            testimonialSettings:
              mode === 'RESTORE_DEFAULT' ? INITIAL_TESTIMONIAL_SETTINGS : s.testimonialSettings,
            adminCrudLogs: [
              {
                id: `crud-${Date.now()}`,
                timestamp: now,
                adminName,
                adminEmail,
                actionType: 'RESET',
                collectionName: 'testimonials',
                targetId: 'Semua Testimoni',
                beforeValue: `${s.publicTestimonials.length} Testimoni`,
                afterValue: mode === 'CLEAR_ALL' ? '0 Testimoni' : '6 Testimoni Default',
                reason: `Reset testimoni (${mode}) oleh Super Admin`,
              },
              ...s.adminCrudLogs,
            ],
          };
        }),

      // =========================================================
      // SECTION 2: GALERI PEMBANGUNAN & PROGRESS FISIK ACTIONS
      // =========================================================
      saveGalleryPhoto: (payload) => {
        const s = get();
        const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
        const adminName = s.currentUser?.name || 'Super Admin';
        const adminEmail = s.currentUser?.email || 'superadmin@bahagia.com';
        const existing = payload.id
          ? s.galleryPhotos.find((g) => g.id === payload.id)
          : undefined;

        const record: GalleryProgressPhotoRecord = {
          ...payload,
          id: existing?.id || `GAL-${Date.now().toString().slice(-5)}`,
          order: existing?.order ?? payload.order ?? s.galleryPhotos.length + 1,
          createdAt: existing?.createdAt || now,
        };

        syncErpRecordToFirestore({
          id: record.id,
          collectionName: 'gallery_photos',
          companyId: record.projectName.toLowerCase().includes('residence') ? 'PT_BPP' : 'PT_TBL',
          title: `${record.title} (${record.category})`,
          status: record.status,
        });

        set((st) => ({
          galleryPhotos: existing
            ? st.galleryPhotos.map((g) => (g.id === existing.id ? record : g))
            : [record, ...st.galleryPhotos],
          adminCrudLogs: [
            {
              id: `crud-${Date.now()}`,
              timestamp: now,
              adminName,
              adminEmail,
              actionType: existing ? 'EDIT' : 'TAMBAH',
              collectionName: 'gallery_photos',
              targetId: record.title,
              beforeValue: existing ? existing.category : '-',
              afterValue: `${record.projectName} · ${record.category}`,
              reason: 'Kelola Galeri & Progress (/sistem/galeri)',
            },
            ...st.adminCrudLogs,
          ],
        }));

        return record;
      },

      bulkAddGalleryPhotos: (photos, meta) => {
        const s = get();
        const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
        const newRecords: GalleryProgressPhotoRecord[] = photos.map((ph, idx) => ({
          id: `GAL-${Date.now().toString().slice(-4)}-${idx + 1}`,
          title: ph.title || `${meta.category} - ${meta.projectName} #${s.galleryPhotos.length + idx + 1}`,
          category: meta.category,
          projectName: meta.projectName,
          unitBlock: meta.unitBlock,
          photoUrl: ph.url,
          dateTaken: meta.dateTaken,
          description: meta.description,
          status: meta.status,
          isFeaturedOnHome: meta.isFeaturedOnHome,
          order: s.galleryPhotos.length + idx + 1,
          createdAt: now,
        }));

        set((st) => ({
          galleryPhotos: [...newRecords, ...st.galleryPhotos],
        }));

        return newRecords.length;
      },

      deleteGalleryPhoto: (id) =>
        set((s) => {
          const target = s.galleryPhotos.find((g) => g.id === id);
          if (!target) return s;
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          return {
            galleryPhotos: s.galleryPhotos.filter((g) => g.id !== id),
            trashItems: [
              {
                id: `tr-gal-${Date.now()}`,
                collection: 'gallery_photos',
                title: `Foto Galeri: ${target.title} (${target.projectName})`,
                deletedAt: now,
              },
              ...s.trashItems,
            ],
          };
        }),

      toggleGalleryPhotoStatus: (id) =>
        set((s) => ({
          galleryPhotos: s.galleryPhotos.map((g) =>
            g.id === id
              ? { ...g, status: g.status === 'Aktif' ? 'Nonaktif' : 'Aktif' }
              : g
          ),
        })),

      toggleGalleryPhotoFeatured: (id) =>
        set((s) => ({
          galleryPhotos: s.galleryPhotos.map((g) =>
            g.id === id ? { ...g, isFeaturedOnHome: !g.isFeaturedOnHome } : g
          ),
        })),

      reorderGalleryPhoto: (id, direction) =>
        set((s) => {
          const sorted = [...s.galleryPhotos].sort((a, b) => a.order - b.order);
          const idx = sorted.findIndex((g) => g.id === id);
          if (idx === -1) return s;
          const swapIdx = direction === 'UP' ? idx - 1 : idx + 1;
          if (swapIdx < 0 || swapIdx >= sorted.length) return s;
          const temp = sorted[idx];
          sorted[idx] = sorted[swapIdx];
          sorted[swapIdx] = temp;
          return {
            galleryPhotos: sorted.map((item, i) => ({ ...item, order: i + 1 })),
          };
        }),

      updateProjectPhysicalProgress: (projectIdOrName, payload) =>
        set((s) => {
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const adminName = s.currentUser?.name || 'Super Admin';
          const adminEmail = s.currentUser?.email || 'superadmin@bahagia.com';
          const targetLower = projectIdOrName.toLowerCase();

          const nextProgress = s.projectPhysicalProgress.map((prog) => {
            if (
              prog.id.toLowerCase() === targetLower ||
              prog.projectId.toLowerCase() === targetLower ||
              prog.projectName.toLowerCase() === targetLower
            ) {
              syncErpRecordToFirestore({
                id: prog.id,
                collectionName: 'work_progress',
                companyId: prog.projectName.toLowerCase().includes('residence') ? 'PT_BPP' : 'PT_TBL',
                title: `Progress Fisik Kawasan ${prog.projectName} (${payload.overallPercentage}%)`,
                status: 'Aktif',
                amount: payload.overallPercentage,
              });
              return {
                ...prog,
                overallPercentage: Math.min(100, Math.max(0, Number(payload.overallPercentage) || 0)),
                stages: payload.stages.map((st) => ({
                  ...st,
                  percentage: Math.min(100, Math.max(0, Number(st.percentage) || 0)),
                })),
                updatedAt: now,
              };
            }
            return prog;
          });

          return {
            projectPhysicalProgress: nextProgress,
            adminCrudLogs: [
              {
                id: `crud-${Date.now()}`,
                timestamp: now,
                adminName,
                adminEmail,
                actionType: 'EDIT',
                collectionName: 'work_progress (Progress Fisik Publik)',
                targetId: projectIdOrName,
                beforeValue: 'Progress Sebelumnya',
                afterValue: `Overall ${payload.overallPercentage}%`,
                reason: 'Update Progress Fisik Kawasan oleh Super Admin (/sistem/galeri)',
              },
              ...s.adminCrudLogs,
            ],
          };
        }),

      updateGallerySettings: (patch) =>
        set((s) => ({
          gallerySettings: { ...s.gallerySettings, ...patch },
        })),

      resetGalleryAndProgressData: (mode) =>
        set((s) => {
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          if (mode === 'CLEAR_PHOTOS') {
            return { galleryPhotos: [] };
          }
          if (mode === 'RESET_PROGRESS_ZERO') {
            return {
              projectPhysicalProgress: s.projectPhysicalProgress.map((p) => ({
                ...p,
                overallPercentage: 0,
                updatedAt: now,
                stages: p.stages.map((st) => ({ ...st, percentage: 0 })),
              })),
            };
          }
          return {
            galleryPhotos: INITIAL_GALLERY_PHOTOS,
            projectPhysicalProgress: INITIAL_PROJECT_PHYSICAL_PROGRESS,
            gallerySettings: INITIAL_GALLERY_SETTINGS,
          };
        }),

      // =========================================================
      // SECTION 3: ARTIKEL & BERITA (BLOG) ACTIONS
      // =========================================================
      saveBlogArticle: (payload) => {
        const s = get();
        const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
        const adminName = s.currentUser?.name || 'Super Admin';
        const adminEmail = s.currentUser?.email || 'superadmin@bahagia.com';
        const existing = payload.id
          ? s.blogArticles.find((b) => b.id === payload.id)
          : undefined;

        const baseSlug = payload.slug?.trim()
          ? generateArticleSlug(payload.slug)
          : generateArticleSlug(payload.title);

        const record: BlogArticleRecord = {
          ...payload,
          id: existing?.id || `BLOG-${Date.now().toString().slice(-5)}`,
          slug: baseSlug,
          viewsCount: existing?.viewsCount ?? payload.viewsCount ?? 1,
          order: existing?.order ?? payload.order ?? s.blogArticles.length + 1,
          metaTitle: payload.metaTitle || `${payload.title} — Bahagia Group Property`,
          metaDescription: payload.metaDescription || payload.excerpt,
          createdAt: existing?.createdAt || now,
        };

        syncErpRecordToFirestore({
          id: record.id,
          collectionName: 'articles',
          companyId: 'GROUP',
          title: `${record.title} (/artikel/${record.slug})`,
          status: record.status,
          amount: record.viewsCount,
        });

        set((st) => ({
          blogArticles: existing
            ? st.blogArticles.map((b) => (b.id === existing.id ? record : b))
            : [record, ...st.blogArticles],
          adminCrudLogs: [
            {
              id: `crud-${Date.now()}`,
              timestamp: now,
              adminName,
              adminEmail,
              actionType: existing ? 'EDIT' : 'TAMBAH',
              collectionName: 'articles (Blog)',
              targetId: `/artikel/${record.slug}`,
              beforeValue: existing ? existing.status : '-',
              afterValue: `${record.title} (${record.status})`,
              reason: 'Kelola Artikel & Berita (/sistem/artikel)',
            },
            ...st.adminCrudLogs,
          ],
        }));

        return record;
      },

      deleteBlogArticle: (id) =>
        set((s) => {
          const target = s.blogArticles.find((b) => b.id === id);
          if (!target) return s;
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          return {
            blogArticles: s.blogArticles.filter((b) => b.id !== id),
            trashItems: [
              {
                id: `tr-blog-${Date.now()}`,
                collection: 'articles',
                title: `Artikel: ${target.title} (/artikel/${target.slug})`,
                deletedAt: now,
              },
              ...s.trashItems,
            ],
          };
        }),

      duplicateBlogArticle: (id) => {
        const s = get();
        const target = s.blogArticles.find((b) => b.id === id);
        if (!target) return null;
        return s.saveBlogArticle({
          ...target,
          id: undefined,
          title: `${target.title} (Salinan)`,
          slug: `${target.slug}-copy-${Date.now().toString().slice(-3)}`,
          status: 'Draft',
        });
      },

      toggleBlogArticleStatus: (id, status) =>
        set((s) => ({
          blogArticles: s.blogArticles.map((b) => {
            if (b.id !== id) return b;
            const nextStatus =
              status || (b.status === 'Published' ? 'Draft' : 'Published');
            return { ...b, status: nextStatus };
          }),
        })),

      toggleBlogArticleFeatured: (id) =>
        set((s) => ({
          blogArticles: s.blogArticles.map((b) =>
            b.id === id ? { ...b, isFeatured: !b.isFeatured } : b
          ),
        })),

      reorderBlogArticle: (id, direction) =>
        set((s) => {
          const sorted = [...s.blogArticles].sort((a, b) => a.order - b.order);
          const idx = sorted.findIndex((b) => b.id === id);
          if (idx === -1) return s;
          const swapIdx = direction === 'UP' ? idx - 1 : idx + 1;
          if (swapIdx < 0 || swapIdx >= sorted.length) return s;
          const temp = sorted[idx];
          sorted[idx] = sorted[swapIdx];
          sorted[swapIdx] = temp;
          return {
            blogArticles: sorted.map((item, i) => ({ ...item, order: i + 1 })),
          };
        }),

      incrementBlogArticleViews: (slugOrId) =>
        set((s) => ({
          blogArticles: s.blogArticles.map((b) =>
            b.slug === slugOrId || b.id === slugOrId
              ? { ...b, viewsCount: (b.viewsCount || 0) + 1 }
              : b
          ),
        })),

      updateBlogSettings: (patch) =>
        set((s) => ({
          blogSettings: { ...s.blogSettings, ...patch },
        })),

      resetBlogArticlesData: (mode) =>
        set((s) => ({
          blogArticles: mode === 'CLEAR_ALL' ? [] : INITIAL_BLOG_ARTICLES,
          blogSettings: mode === 'RESTORE_DEFAULT' ? INITIAL_BLOG_SETTINGS : s.blogSettings,
        })),

      // =========================================================
      // LIVE DEPLOY & REAL-TIME PRESENTATION SYNC ACTIONS
      // =========================================================
      deployAndPublishLiveState: async () => {
        const s = get();
        if (!s.currentUser || s.currentUser.role !== 'ADMIN') {
          throw new Error('Hanya Super Admin yang diizinkan melakukan Deploy & Publish.');
        }
        const nextVersion = Date.now();
        const publishedBy = `${s.currentUser.name} (${s.currentUser.role})`;

        const serializableState: Record<string, any> = {
          selectedCompanyFilter: s.selectedCompanyFilter,
          approvalLimit: s.approvalLimit,
          maintenanceMode: s.maintenanceMode,
          announcementBanner: s.announcementBanner,
          users: s.users,
          roles: s.roles,
          companies: s.companies,
          coa: s.coa,
          kavling: s.kavling,
          bookings: s.bookings,
          complaints: s.complaints,
          verifications: s.verifications,
          projectSubmissions: s.projectSubmissions,
          suppliers: s.suppliers,
          inventory: s.inventory,
          stockMovements: s.stockMovements,
          stockOpnameBatches: s.stockOpnameBatches,
          purchaseOrders: s.purchaseOrders,
          journals: s.journals,
          cashTransactions: s.cashTransactions,
          attendance: s.attendance,
          emailLogs: s.emailLogs,
          activityLogs: s.activityLogs,
          approvalNotifications: s.approvalNotifications,
          adminCrudLogs: s.adminCrudLogs,
          fasumList: s.fasumList,
          fasosList: s.fasosList,
          lahanList: s.lahanList,
          trashItems: s.trashItems,
          customFields: s.customFields,
          editableTexts: s.editableTexts,
          photoSlots: s.photoSlots,
          cmsContent: s.cmsContent,
          dataMaster: s.dataMaster,
          syncedProjects: s.syncedProjects,
          sitePlanConfigs: s.sitePlanConfigs,
          publicTestimonials: s.publicTestimonials,
          testimonialSettings: s.testimonialSettings,
          galleryPhotos: s.galleryPhotos,
          projectPhysicalProgress: s.projectPhysicalProgress,
          gallerySettings: s.gallerySettings,
          blogArticles: s.blogArticles,
          blogSettings: s.blogSettings,
          lastDeployedVersion: nextVersion,
          lastDeployedBy: publishedBy,
        };

        const res = await publishFullStateToCloudAndServer(
          serializableState,
          publishedBy,
          nextVersion
        );

        const formattedTime = new Date(res.publishedAt)
          .toISOString()
          .slice(0, 19)
          .replace('T', ' ');

        set((st) => ({
          lastDeployedAt: formattedTime,
          lastDeployedVersion: res.version,
          lastDeployedBy: publishedBy,
          adminCrudLogs: [
            {
              id: `deploy-${Date.now()}`,
              timestamp: formattedTime.slice(0, 16),
              adminName: st.currentUser?.name || 'Super Admin',
              adminEmail: st.currentUser?.email || 'superadmin@bahagia.com',
              actionType: 'EDIT',
              collectionName: 'LIVE DEPLOY & PUBLISH KE WEB PRESENTASI',
              targetId: `Versi #${res.version}`,
              beforeValue: `Versi sebelumnya`,
              afterValue: `Published Live (Web Publik + Internal ERP)`,
              reason: 'Deploy & Publish Langsung ke Link Web / Presentasi',
            },
            ...st.adminCrudLogs,
          ],
        }));

        return res;
      },

      applyRemotePublishedState: (remoteState, version, publishedAt, publishedBy) => {
        if (!remoteState || typeof remoteState !== 'object') return;
        const cur = get();
        if (version <= cur.lastDeployedVersion) return;

        // Preserve currentUser & editMode on the local session while updating all shared content & ERP records
        const safePatch: Partial<AppState> = {};
        const syncKeys: (keyof AppState)[] = [
          'approvalLimit',
          'maintenanceMode',
          'announcementBanner',
          'users',
          'roles',
          'companies',
          'coa',
          'kavling',
          'bookings',
          'complaints',
          'verifications',
          'projectSubmissions',
          'suppliers',
          'inventory',
          'stockMovements',
          'stockOpnameBatches',
          'purchaseOrders',
          'journals',
          'cashTransactions',
          'attendance',
          'emailLogs',
          'activityLogs',
          'approvalNotifications',
          'adminCrudLogs',
          'fasumList',
          'fasosList',
          'lahanList',
          'trashItems',
          'customFields',
          'editableTexts',
          'photoSlots',
          'cmsContent',
          'dataMaster',
          'syncedProjects',
          'sitePlanConfigs',
          'publicTestimonials',
          'testimonialSettings',
          'galleryPhotos',
          'projectPhysicalProgress',
          'gallerySettings',
          'blogArticles',
          'blogSettings',
        ];

        for (const k of syncKeys) {
          if (remoteState[k] !== undefined) {
            (safePatch as any)[k] = remoteState[k];
          }
        }

        // Merge editableTexts and cmsContent safely so defaults aren't lost
        if (remoteState.editableTexts) {
          safePatch.editableTexts = {
            ...cur.editableTexts,
            ...remoteState.editableTexts,
          };
        }
        if (remoteState.cmsContent) {
          safePatch.cmsContent = {
            ...cur.cmsContent,
            ...remoteState.cmsContent,
          };
        }

        safePatch.lastDeployedVersion = version;
        safePatch.lastDeployedAt = publishedAt
          ? publishedAt.slice(0, 19).replace('T', ' ')
          : new Date().toISOString().slice(0, 19).replace('T', ' ');
        safePatch.lastDeployedBy = publishedBy || 'Super Admin';

        set(safePatch);
      },

      addApprovalNotification: (payload) => {
        const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
        const state = get();
        const id = payload.id || `NTF-${Date.now()}`;
        const item: ApprovalNotificationItem = {
          ...payload,
          id,
          isRead: false,
          createdBy: state.currentUser?.id || 'system',
          createdAt: now,
          updatedAt: now,
        };
        syncApprovalNotificationToFirestore(item);
        set((s) => ({
          approvalNotifications: [item, ...s.approvalNotifications],
        }));
        return item;
      },

      markApprovalNotificationRead: (id) =>
        set((s) => {
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const target = s.approvalNotifications.find((n) => n.id === id);
          if (target) {
            markFirestoreNotificationRead({ ...target, isRead: true, updatedAt: now });
          }
          return {
            approvalNotifications: s.approvalNotifications.map((n) =>
              n.id === id ? { ...n, isRead: true, updatedAt: now } : n
            ),
          };
        }),

      markAllApprovalNotificationsReadForRole: (role) =>
        set((s) => {
          const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const activeRole = role || s.currentUser?.role || 'ADMIN';
          return {
            approvalNotifications: s.approvalNotifications.map((n) => {
              if (
                activeRole === 'ADMIN' ||
                n.targetRole === activeRole ||
                n.targetRole === 'ALL'
              ) {
                if (!n.isRead) {
                  markFirestoreNotificationRead({ ...n, isRead: true, updatedAt: now });
                }
                return { ...n, isRead: true, updatedAt: now };
              }
              return n;
            }),
          };
        }),

      setApprovalNotificationsFromFirestore: (items) =>
        set((s) => {
          if (!items || items.length === 0) return s;
          const map = new Map<string, ApprovalNotificationItem>();
          s.approvalNotifications.forEach((n) => map.set(n.id, n));
          items.forEach((n) => map.set(n.id, n));
          const merged = Array.from(map.values()).sort((a, b) =>
            b.createdAt.localeCompare(a.createdAt)
          );
          return { approvalNotifications: merged };
        }),
    }),
    {
      name: 'bahagia-group-erp-storage-v6-presentation-ready',
      version: 6,
      storage: createJSONStorage((): StateStorage => {
        const memoryFallback = new Map<string, string>();
        const DB_NAME = 'bahagia_erp_idb_v2';
        const STORE_NAME = 'zustand_kv';
        const COMPACT_LS_SUFFIX = '__compact_sync';
        let hasSessionWrite = false;
        let autoPushTimer: ReturnType<typeof setTimeout> | null = null;

        const openIdb = (): Promise<IDBDatabase | null> => {
          if (typeof indexedDB === 'undefined') return Promise.resolve(null);
          return new Promise((resolve) => {
            try {
              const req = indexedDB.open(DB_NAME, 1);
              req.onupgradeneeded = () => {
                const db = req.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                  db.createObjectStore(STORE_NAME);
                }
              };
              req.onsuccess = () => resolve(req.result);
              req.onerror = () => resolve(null);
            } catch {
              resolve(null);
            }
          });
        };

        const stripLargeBase64ForLocalStorage = (rawJson: string): string => {
          // Strip data:image/... base64 strings larger than ~15KB only for the synchronous localStorage backup
          return rawJson.replace(/"data:image\/[^"]{15000,}"/g, '""');
        };

        return {
          getItem: async (name: string): Promise<string | null> => {
            if (hasSessionWrite && memoryFallback.has(name)) {
              return memoryFallback.get(name) ?? null;
            }
            try {
              const db = await openIdb();
              if (db) {
                const idbVal = await new Promise<string | null>((resolve) => {
                  try {
                    const tx = db.transaction(STORE_NAME, 'readonly');
                    const req = tx.objectStore(STORE_NAME).get(name);
                    req.onsuccess = () => resolve((req.result as string) ?? null);
                    req.onerror = () => resolve(null);
                  } catch {
                    resolve(null);
                  }
                });
                if (idbVal !== null) {
                  // Merge with any newer synchronous compact snapshot if browser refreshed before IDB tx finished
                  try {
                    const compactRaw = localStorage.getItem(name + COMPACT_LS_SUFFIX);
                    if (compactRaw) {
                      const compactParsed = JSON.parse(compactRaw);
                      const idbParsed = JSON.parse(idbVal);
                      if (
                        compactParsed?.__savedAt &&
                        (!idbParsed?.__savedAt || compactParsed.__savedAt > idbParsed.__savedAt)
                      ) {
                        return JSON.stringify({
                          ...idbParsed,
                          state: {
                            ...idbParsed.state,
                            ...compactParsed.state,
                            // Preserve full-res photos from IDB if compact stripped them
                            photoSlots:
                              idbParsed.state?.photoSlots || compactParsed.state?.photoSlots,
                            sitePlanConfigs:
                              idbParsed.state?.sitePlanConfigs ||
                              compactParsed.state?.sitePlanConfigs,
                          },
                        });
                      }
                    }
                  } catch {
                    // ignore merge error
                  }
                  return idbVal;
                }
              }
            } catch {
              // ignore IDB read error
            }
            try {
              const localVal =
                localStorage.getItem(name) || localStorage.getItem(name + COMPACT_LS_SUFFIX);
              if (localVal !== null) return localVal;
            } catch {
              // ignore localStorage read error
            }
            return memoryFallback.get(name) ?? null;
          },
          setItem: async (name: string, value: string): Promise<void> => {
            hasSessionWrite = true;
            let stampedValue = value;
            try {
              const parsed = JSON.parse(value);
              parsed.__savedAt = Date.now();
              stampedValue = JSON.stringify(parsed);
            } catch {
              // keep original value
            }
            memoryFallback.set(name, stampedValue);

            // 1. Synchronous write to localStorage first (guaranteed to survive immediate page refresh)
            try {
              localStorage.setItem(name, stampedValue);
            } catch {
              // Full state exceeded 5MB localStorage quota — clean old keys and save compact text/CMS snapshot synchronously
              try {
                for (let i = localStorage.length - 1; i >= 0; i--) {
                  const k = localStorage.key(i);
                  if (
                    k &&
                    k.startsWith('bahagia-group-erp-storage') &&
                    k !== name &&
                    k !== name + COMPACT_LS_SUFFIX
                  ) {
                    localStorage.removeItem(k);
                  }
                }
                localStorage.removeItem(name);
                const compact = stripLargeBase64ForLocalStorage(stampedValue);
                localStorage.setItem(name + COMPACT_LS_SUFFIX, compact);
              } catch {
                // never throw QuotaExceededError
              }
            }

            // 2. Full state write (including all high-res images & siteplan) to IndexedDB
            try {
              const db = await openIdb();
              if (db) {
                await new Promise<void>((resolve) => {
                  try {
                    const tx = db.transaction(STORE_NAME, 'readwrite');
                    tx.objectStore(STORE_NAME).put(stampedValue, name);
                    tx.oncomplete = () => resolve();
                    tx.onerror = () => resolve();
                  } catch {
                    resolve();
                  }
                });
              }
            } catch {
              // ignore IDB write error
            }

            // 3. Auto-publish to Live Presentation Server & Cloud whenever ANY authenticated internal role makes changes
            if (autoPushTimer) {
              clearTimeout(autoPushTimer);
            }
            autoPushTimer = setTimeout(async () => {
              try {
                const parsed = JSON.parse(stampedValue);
                const stateObj = parsed?.state;
                if (stateObj && stateObj.currentUser) {
                  const versionTs = parsed.__savedAt || Date.now();
                  // Update local lastDeployedVersion so polling doesn't overwrite newer local state
                  useAppStore.setState({
                    lastDeployedVersion: versionTs,
                    lastDeployedBy: `${stateObj.currentUser.name || 'Staf'} (${stateObj.currentUser.role || 'INTERNAL'})`,
                  });
                  const actor = `${stateObj.currentUser.name || 'Staf'} (${stateObj.currentUser.role || 'INTERNAL'})`;
                  await publishFullStateToCloudAndServer(
                    stateObj,
                    actor,
                    versionTs
                  );
                  if (typeof BroadcastChannel !== 'undefined') {
                    const bc = new BroadcastChannel('bahagia_erp_realtime_sync');
                    bc.postMessage({
                      version: versionTs,
                      publishedAt: new Date().toISOString(),
                      publishedBy: actor,
                      state: stateObj,
                    });
                    bc.close();
                  }
                }
              } catch {
                // ignore background auto-push error
              }
            }, 350);
          },
          removeItem: async (name: string): Promise<void> => {
            memoryFallback.delete(name);
            try {
              localStorage.removeItem(name);
              localStorage.removeItem(name + COMPACT_LS_SUFFIX);
            } catch {
              // ignore
            }
            try {
              const db = await openIdb();
              if (db) {
                await new Promise<void>((resolve) => {
                  try {
                    const tx = db.transaction(STORE_NAME, 'readwrite');
                    tx.objectStore(STORE_NAME).delete(name);
                    tx.oncomplete = () => resolve();
                    tx.onerror = () => resolve();
                  } catch {
                    resolve();
                  }
                });
              }
            } catch {
              // ignore
            }
          },
        };
      }),
      merge: (persistedState: any, currentState: AppState): AppState => {
        if (!persistedState || typeof persistedState !== 'object') {
          return currentState;
        }
        return {
          ...currentState,
          ...persistedState,
          editableTexts: {
            ...currentState.editableTexts,
            ...(persistedState.editableTexts || {}),
          },
          cmsContent: {
            ...currentState.cmsContent,
            ...(persistedState.cmsContent || {}),
          },
        };
      },
    }
  )
);
