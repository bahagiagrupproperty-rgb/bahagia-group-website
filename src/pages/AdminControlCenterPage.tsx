import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { RoleCode, formatRupiah, ASSETS } from '../data/seedData';
import { TextCategory } from '../data/superAdminSeedData';
import { UploadFoto } from '../components/UploadFoto';
import { SitePlanInteractive } from '../components/SitePlanInteractive';
import { EditableImage } from '../components/SuperAdminInlineEditor';
import { AutoSyncProjectManager } from '../components/AutoSyncProjectManager';
import {
  AdminTestimonialsManager,
  AdminGalleryProgressManager,
  AdminBlogArticlesManager,
} from '../components/AdminPublicSectionsManager';
import {
  Building2,
  Shield,
  Users,
  Globe,
  Grid,
  Map,
  Database,
  Mail,
  Sliders,
  Trash2,
  HardDrive,
  Activity,
  Plus,
  Edit3,
  RotateCcw,
  Eye,
  Check,
  X,
  Search,
  Download,
  Upload,
  Copy,
  ArrowUp,
  ArrowDown,
  FileText,
  Image as ImageIcon,
  Rocket,
  History,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

export const SYSTEM_24_SUBMENUS = [
  { slug: 'dashboard', label: '1. Super Admin Dashboard', group: 'Ringkasan' },
  { slug: 'testimoni', label: '2. Testimoni Konsumen (Slider)', group: 'CMS & Katalog' },
  { slug: 'galeri', label: '3. Galeri & Progress Pembangunan', group: 'CMS & Katalog' },
  { slug: 'artikel', label: '4. Artikel & Berita (Blog KPR)', group: 'CMS & Katalog' },
  { slug: 'proyek', label: '5. Auto-Sync Proyek Baru (Web)', group: 'CMS & Katalog' },
  { slug: 'edit-teks', label: '6. Edit Semua Teks (~580 Teks)', group: 'Kontrol Penuh' },
  { slug: 'foto-manager', label: '7. Edit Semua Foto (Unlimited)', group: 'Kontrol Penuh' },
  { slug: 'website-editor', label: '8. CMS Website (10 Tab)', group: 'CMS & Katalog' },
  { slug: 'user', label: '9. Kelola User Multi-Role', group: 'Organisasi' },
  { slug: 'role', label: '10. Kelola Role & Matrix 9×7', group: 'Organisasi' },
  { slug: 'perusahaan', label: '11. Kelola PT (Perusahaan)', group: 'Organisasi' },
  { slug: 'catalog-editor', label: '12. Katalog Unit Editor', group: 'CMS & Katalog' },
  { slug: 'kavling', label: '13. Kavling & Site Plan', group: 'CMS & Katalog' },
  { slug: 'data-master', label: '14. Data Master (12 Kategori)', group: 'Master & Custom' },
  { slug: 'coa-control', label: '15. Kontrol COA (CRUD Penuh)', group: 'Keuangan & Database' },
  { slug: 'data-explorer', label: '16. Data Explorer (55+ Koleksi)', group: 'Database & Keamanan' },
  { slug: 'reset-data', label: '17. Reset Data & Backup', group: 'Database & Keamanan' },
  { slug: 'trash', label: '18. Trash (Keranjang Sampah)', group: 'Database & Keamanan' },
  { slug: 'log', label: '19. Riwayat Perubahan & Revert', group: 'Database & Keamanan' },
  { slug: 'backup', label: '20. Backup & Restore JSON', group: 'Database & Keamanan' },
  { slug: 'custom-field', label: '21. Custom Field Builder', group: 'Master & Custom' },
  { slug: 'limit-approval', label: '22. Limit Approval Direktur', group: 'Kontrol & Email' },
  { slug: 'email-templates', label: '23. Email Templates (12 Event)', group: 'Kontrol & Email' },
  { slug: 'email-log', label: '24. Email Trigger Log', group: 'Kontrol & Email' },
];

const ALL_55_COLLECTIONS = [
  'users', 'roles', 'companies', 'projects', 'units', 'kavling',
  'testimonials', 'gallery_photos', 'articles',
  'bookings', 'complaints', 'transactions', 'kas_masuk', 'kas_keluar', 'accounts',
  'suppliers', 'purchase_orders', 'purchase_invoices', 'work_progress',
  'activity_logs', 'approvals', 'catalog_changes', 'targets', 'budgets', 'spr',
  'prospek', 'absensi', 'payroll', 'inventory', 'inventory_transactions',
  'material_requests', 'spk', 'rab', 'opname', 'jadwal_kerja', 'pengumuman',
  'settings', 'notifications', 'website_content', 'photos', 'mail',
  'email_templates', 'email_settings', 'templates', 'pipeline', 'taxes',
  'project_submissions', 'data_master', 'custom_fields', 'fasum_progress',
  'fasos_progress', 'lahan_progress', 'verifications', 'digital_signatures',
  'trash', 'backups', 'login_logs', 'error_logs',
];

export const AdminControlCenterPage: React.FC = () => {
  const { section: rawSection = 'dashboard' } = useParams();
  const section =
    rawSection === 'email-settings'
      ? 'email-templates'
      : rawSection === 'log-aktivitas'
      ? 'log'
      : rawSection;
  const navigate = useNavigate();

  const {
    editMode,
    setEditMode,
    editableTexts,
    updateEditableText,
    resetEditableText,
    revertEditableTextVersion,
    resetAllEditableTexts,
    photoSlots,
    addPhotoToSlot,
    deletePhotoFromSlot,
    setPrimaryPhotoInSlot,
    reorderPhotoInSlot,
    resetPhotoSlot,
    cmsContent,
    updateCmsContent,
    dataMaster,
    addDataMasterItem,
    updateDataMasterItem,
    deleteDataMasterItem,
    reorderDataMasterItem,
    companies,
    updateCompany,
    addCompanyFull,
    deleteCompanySoft,
    duplicateCompany,
    roles,
    toggleRolePermission,
    selectAllModulePermissions,
    addRoleFull,
    deleteRoleSoft,
    duplicateRole,
    users,
    addUser,
    toggleUserActive,
    updateUserFull,
    deleteUserSoft,
    approvalLimit,
    setApprovalLimit,
    emailLogs,
    activityLogs,
    adminCrudLogs,
    revertAdminCrudLog,
    trashItems,
    restoreTrashItem,
    permanentDeleteTrashItem,
    customFields,
    addCustomField,
    kavling,
    addKavlingUnit,
    updateKavlingStatusAndProgress,
    bookings,
    complaints,
    journals,
    cashTransactions,
    verifications,
    purchaseOrders,
    inventory,
    suppliers,
    attendance,
    projectSubmissions,
    coa,
    resetSelectedCollections,
    restoreInitialDemoData,
    backupSnapshots,
    createBackupSnapshot,
    restoreBackupSnapshot,
    autoBackupEnabled,
    setAutoBackupEnabled,
    deleteRecordsFromCollection,
    publicTestimonials,
    galleryPhotos,
    blogArticles,
  } = useAppStore();

  // =========================================================
  // LOCAL STATES FOR ADMIN SECTIONS
  // =========================================================

  // 1. Edit Semua Teks (/sistem/edit-teks)
  const [textCatFilter, setTextCatFilter] = useState<'ALL' | TextCategory>('ALL');
  const [textSearch, setTextSearch] = useState('');
  const [editingTextKey, setEditingTextKey] = useState<string | null>(null);
  const [editingTextValue, setEditingTextValue] = useState('');
  const [newTextKey, setNewTextKey] = useState('');
  const [newTextLocation, setNewTextLocation] = useState('');
  const [newTextCat, setNewTextCat] = useState<TextCategory>('Website');
  const [newTextVal, setNewTextVal] = useState('');

  // 2. Edit Semua Foto (/sistem/foto-manager)
  const [photoScopeFilter, setPhotoScopeFilter] = useState<'ALL' | 'Website Publik' | 'Sistem Internal'>('ALL');

  // 3. CMS 10 Tabs (/sistem/website-editor)
  const [cmsTab, setCmsTab] = useState<string>('Hero');
  const [cmsPreviewOpen, setCmsPreviewOpen] = useState(false);
  const [newKeunggulanTitle, setNewKeunggulanTitle] = useState('');
  const [newKeunggulanDesc, setNewKeunggulanDesc] = useState('');
  const [newStatVal, setNewStatVal] = useState('');
  const [newStatLbl, setNewStatLbl] = useState('');
  const [newTestiName, setNewTestiName] = useState('');
  const [newTestiRole, setNewTestiRole] = useState('');
  const [newTestiQuote, setNewTestiQuote] = useState('');
  const [newPromoTitle, setNewPromoTitle] = useState('');
  const [newPromoDesc, setNewPromoDesc] = useState('');
  const [newPromoPeriod, setNewPromoPeriod] = useState('Oktober – Desember 2026');

  // 4. User & Role (/sistem/user & /sistem/role)
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');
  const [userPtFilter, setUserPtFilter] = useState<string>('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('ALL');
  const [userSearch, setUserSearch] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('bahagia123');
  const [newUserPhone, setNewUserPhone] = useState('08114000169');
  const [newUserRole, setNewUserRole] = useState<RoleCode>('MARKETING');
  const [newUserCompany, setNewUserCompany] = useState<'GROUP' | 'PT_TBL' | 'PT_BPP'>('PT_TBL');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [deleteUserReason, setDeleteUserReason] = useState('');
  const [deleteUserConfirm, setDeleteUserConfirm] = useState('');

  const [selectedRoleForMatrix, setSelectedRoleForMatrix] = useState<RoleCode>('PENGAWAS');
  const [newRoleCode, setNewRoleCode] = useState('');
  const [newRoleLevel, setNewRoleLevel] = useState('Operasional');

  // 5. PT (/sistem/perusahaan)
  const [showAddPtModal, setShowAddPtModal] = useState(false);
  const [newPtName, setNewPtName] = useState('');
  const [newPtProject, setNewPtProject] = useState('');
  const [newPtLocation, setNewPtLocation] = useState('');
  const [newPtSpecs, setNewPtSpecs] = useState('');

  // 6. Katalog & Data Master (/sistem/catalog-editor & /sistem/data-master)
  const [catalogSearch, setCatalogSearch] = useState('');
  const [newUnitBlock, setNewUnitBlock] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [newUnitCode, setNewUnitCode] = useState('');
  const [newUnitPrice, setNewUnitPrice] = useState(169000000);
  const [newUnitHpp, setNewUnitHpp] = useState(125000000);

  const masterCategories = Object.keys(dataMaster);
  const [selectedMasterCat, setSelectedMasterCat] = useState<string>(masterCategories[0] || 'Kategori Material');
  const [newDmCode, setNewDmCode] = useState('');
  const [newDmLabel, setNewDmLabel] = useState('');

  // 8. Data Explorer (/sistem/data-explorer)
  const [selectedExplorerCol, setSelectedExplorerCol] = useState<string>('kavling');
  const [explorerSearch, setExplorerSearch] = useState('');

  // 9. Reset Data (/sistem/reset-data)
  const [selectedResetCols, setSelectedResetCols] = useState<string[]>([
    'units_kavling',
    'bookings',
    'transactions',
  ]);
  const [resetConfirmText, setResetConfirmText] = useState('');

  // 10. Trash (/sistem/trash)
  const [trashFilterCol, setTrashFilterCol] = useState('ALL');
  const [trashSearch, setTrashSearch] = useState('');

  // 11. Log (/sistem/log)
  const [logTab, setLogTab] = useState<'AUDIT' | 'LOGIN' | 'ERROR' | 'API'>('AUDIT');
  const [logSearch, setLogSearch] = useState('');

  // 17. Custom Field
  const [cfModule, setCfModule] = useState('Marketing - SPR');
  const [cfLabel, setCfLabel] = useState('');
  const [cfType, setCfType] = useState<'Text' | 'Number' | 'Date'>('Text');

  const activeRoleObj = roles.find((r) => r.role === selectedRoleForMatrix) || roles[0];

  const CMS_10_TABS = [
    'Hero',
    'Keunggulan',
    'Statistik',
    'Testimoni',
    'Navbar',
    'Footer',
    'Logo & Branding',
    'Promo',
    'SEO',
    'Halaman Statis',
  ];

  // Filtered editable texts
  const allTextItems = useMemo(() => {
    const baseList = Object.values(editableTexts);
    return baseList.filter((item) => {
      if (textCatFilter !== 'ALL' && item.category !== textCatFilter) return false;
      if (textSearch.trim()) {
        const q = textSearch.toLowerCase();
        return (
          item.location.toLowerCase().includes(q) ||
          item.defaultText.toLowerCase().includes(q) ||
          item.currentText.toLowerCase().includes(q) ||
          item.key.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [editableTexts, textCatFilter, textSearch]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (userRoleFilter !== 'ALL' && !u.roles.includes(userRoleFilter as RoleCode)) return false;
      if (userPtFilter !== 'ALL' && u.companyId !== userPtFilter) return false;
      if (userStatusFilter === 'ACTIVE' && !u.active) return false;
      if (userStatusFilter === 'INACTIVE' && u.active) return false;
      if (userSearch.trim()) {
        const q = userSearch.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      }
      return true;
    });
  }, [users, userRoleFilter, userPtFilter, userStatusFilter, userSearch]);

  // Data Explorer dynamic records
  const explorerRecords = useMemo(() => {
    const map: Record<string, any[]> = {
      users,
      roles,
      companies,
      projects: companies,
      units: kavling,
      kavling,
      testimonials: publicTestimonials,
      gallery_photos: galleryPhotos,
      articles: blogArticles,
      bookings,
      prospek: bookings,
      spr: bookings,
      pipeline: bookings,
      complaints,
      transactions: journals,
      kas_masuk: cashTransactions.filter((t) => t.type === 'KAS_MASUK'),
      kas_keluar: cashTransactions.filter((t) => t.type === 'KAS_KELUAR'),
      accounts: coa,
      suppliers,
      purchase_orders: purchaseOrders,
      purchase_invoices: purchaseOrders,
      work_progress: verifications,
      verifications,
      activity_logs: activityLogs,
      approvals: verifications,
      absensi: attendance,
      payroll: attendance,
      inventory,
      inventory_transactions: inventory,
      project_submissions: projectSubmissions,
      rab: projectSubmissions,
      website_content: Object.values(editableTexts),
      photos: photoSlots,
      mail: emailLogs,
      email_templates: Object.values(editableTexts).filter((x) => x.category === 'Email'),
      custom_fields: customFields,
      trash: trashItems,
      backups: backupSnapshots,
    };
    const raw = map[selectedExplorerCol] || [];
    if (!explorerSearch.trim()) return raw;
    const q = explorerSearch.toLowerCase();
    return raw.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
  }, [
    selectedExplorerCol,
    explorerSearch,
    users,
    roles,
    companies,
    kavling,
    bookings,
    complaints,
    journals,
    cashTransactions,
    coa,
    suppliers,
    purchaseOrders,
    verifications,
    activityLogs,
    attendance,
    inventory,
    projectSubmissions,
    editableTexts,
    photoSlots,
    emailLogs,
    customFields,
    trashItems,
    backupSnapshots,
  ]);

  return (
    <div className="space-y-6">
      {/* SUPER ADMIN FULL CONTROL HEADER */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold rounded-md">
              SUPER ADMIN FULL CONTROL · ZERO CODING
            </span>
            <span className="text-xs text-gray-500 font-mono">
              ~580 Teks Editable · Unlimited Foto · 55+ Koleksi · 102+ Akun COA Unlocked
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">
            Pusat Kendali Penuh Super Admin — Bahagia Group Property
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">
            Edit semua tulisan, ganti semua foto, tambah/hapus/reset data publik maupun internal, kelola User/Role/PT/COA, serta Backup & Revert perubahan langsung dari dashboard.
          </p>
        </div>

        {/* Global Preview / Publish / Edit Mode Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              const next = !editMode;
              setEditMode(next);
              toast.success(
                next
                  ? '✏️ Inline Edit Mode AKTIF! Klik teks atau foto mana saja untuk mengedit langsung.'
                  : '✏️ Inline Edit Mode NONAKTIF.'
              );
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              editMode
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            }`}
          >
            {editMode ? '[✏️ Edit Mode: ON]' : '[✏️ Edit Mode: OFF]'}
          </button>

          <Link
            to="/"
            className="px-3.5 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            <span>[👁️ Preview Web]</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              createBackupSnapshot('Auto-Save Draft Super Admin', 'Manual');
              toast.success('💾 Draft perubahan berhasil disimpan!');
            }}
            className="px-3.5 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 rounded-xl text-xs font-semibold cursor-pointer"
          >
            [💾 Simpan Draft]
          </button>

          {useAppStore.getState().currentUser?.role === 'ADMIN' && (
            <button
              type="button"
              onClick={async () => {
                try {
                  await useAppStore.getState().deployAndPublishLiveState();
                  navigator.clipboard?.writeText(window.location.origin);
                  toast.success(
                    '🚀 Seluruh perubahan berhasil dipublikasikan ke Server & Cloud! Link Deploy disalin ke clipboard.'
                  );
                } catch {
                  toast.error('Hanya Super Admin yang dapat melakukan Deploy.');
                }
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>[🚀 Publish & Deploy]</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Navigation: 20 Sub-Menus */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl p-3 space-y-1 max-h-[760px] overflow-y-auto shadow-xs">
          <div className="px-3 py-2 text-xs font-bold text-gray-900 border-b border-gray-100 flex items-center justify-between">
            <span>Menu Kontrol Super Admin</span>
            <span className="font-mono text-[10px] text-emerald-700">{SYSTEM_24_SUBMENUS.length} Modul</span>
          </div>
          {SYSTEM_24_SUBMENUS.map((item) => {
            const active = section === item.slug;
            return (
              <button
                key={item.slug}
                type="button"
                onClick={() => navigate(`/sistem/${item.slug}`)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                  active
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Workspace Content */}
        <div className="lg:col-span-9 space-y-6">
          {/* =========================================================
              1. SUPER ADMIN DASHBOARD (/sistem/dashboard)
          ========================================================= */}
          {section === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div
                  onClick={() => navigate('/sistem/edit-teks')}
                  className="bg-white border border-gray-200 hover:border-emerald-500 rounded-xl p-4 cursor-pointer transition-all space-y-1"
                >
                  <div className="text-gray-500 font-medium">1. Edit Semua Teks</div>
                  <div className="font-mono text-xl font-bold text-gray-900">580+ Teks</div>
                  <div className="text-emerald-700 font-semibold">Publik, Internal & Email →</div>
                </div>
                <div
                  onClick={() => navigate('/sistem/foto-manager')}
                  className="bg-white border border-gray-200 hover:border-emerald-500 rounded-xl p-4 cursor-pointer transition-all space-y-1"
                >
                  <div className="text-gray-500 font-medium">2. Edit Semua Foto</div>
                  <div className="font-mono text-xl font-bold text-gray-900">{photoSlots.length} Slot Album</div>
                  <div className="text-emerald-700 font-semibold">Unlimited Upload & Compress →</div>
                </div>
                <div
                  onClick={() => navigate('/keuangan/coa')}
                  className="bg-white border border-gray-200 hover:border-emerald-500 rounded-xl p-4 cursor-pointer transition-all space-y-1"
                >
                  <div className="text-gray-500 font-medium">3. Kelola COA (Unlocked)</div>
                  <div className="font-mono text-xl font-bold text-gray-900">{coa.length} Akun</div>
                  <div className="text-emerald-700 font-semibold">CRUD Penuh & Validasi →</div>
                </div>
                <div
                  onClick={() => navigate('/sistem/data-explorer')}
                  className="bg-white border border-gray-200 hover:border-emerald-500 rounded-xl p-4 cursor-pointer transition-all space-y-1"
                >
                  <div className="text-gray-500 font-medium">4. Data Explorer</div>
                  <div className="font-mono text-xl font-bold text-gray-900">55+ Koleksi</div>
                  <div className="text-emerald-700 font-semibold">CRUD, Import & Export →</div>
                </div>
              </div>

              {/* 8 Prinsip Utama Quick Cards */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 text-xs">
                <h2 className="text-base font-bold text-gray-900">
                  8 Kontrol Penuh Super Admin (Tanpa Coding)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { title: '1. TESTIMONI KONSUMEN', desc: 'Slider "Apa Kata Penghuni Kami" & Rating', path: '/sistem/testimoni' },
                    { title: '2. GALERI & PROGRESS', desc: 'Grid Foto 3×3 Lightbox & Progress Bar %', path: '/sistem/galeri' },
                    { title: '3. ARTIKEL & BLOG', desc: 'Rich Text Editor, Tips KPR, Berita & SEO', path: '/sistem/artikel' },
                    { title: '4. EDIT TEKS & FOTO', desc: 'Semua tulisan (~580 teks) & semua gambar', path: '/sistem/edit-teks' },
                    { title: '5. KAVLING & SITE PLAN', desc: 'Gambar PNG Asli + Overlay Polygon Klik', path: '/sistem/kavling' },
                    { title: '6. RESET DATA', desc: 'Reset koleksi terpilih + Auto-Backup JSON', path: '/sistem/reset-data' },
                    { title: '7. KELOLA USER & ROLE', desc: 'CRUD User, Role & Matrix 9 Modul × 7 Aksi', path: '/sistem/user' },
                    { title: '8. KELOLA COA & PT', desc: 'CRUD Bagan Akun (102+ Akun) & Entitas PT', path: '/keuangan/coa' },
                  ].map((c) => (
                    <button
                      key={c.title}
                      type="button"
                      onClick={() => navigate(c.path)}
                      className="p-4 border border-gray-200 hover:border-emerald-600 hover:bg-emerald-50/30 rounded-xl text-left transition-all cursor-pointer space-y-1"
                    >
                      <div className="font-bold text-emerald-800">{c.title}</div>
                      <div className="text-gray-600 text-[11px]">{c.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              SECTION 1 BARU: TESTIMONI KONSUMEN (/sistem/testimoni)
          ========================================================= */}
          {section === 'testimoni' && <AdminTestimonialsManager />}

          {/* =========================================================
              SECTION 2 BARU: GALERI & PROGRESS PEMBANGUNAN (/sistem/galeri)
          ========================================================= */}
          {section === 'galeri' && <AdminGalleryProgressManager />}

          {/* =========================================================
              SECTION 3 BARU: ARTIKEL & BERITA BLOG (/sistem/artikel)
          ========================================================= */}
          {section === 'artikel' && <AdminBlogArticlesManager />}

          {/* =========================================================
              2. EDIT SEMUA TEKS (/sistem/edit-teks)
          ========================================================= */}
          {section === 'edit-teks' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <div className="text-emerald-700 font-mono font-bold text-[11px]">
                      BAGIAN 1 · /sistem/edit-teks · ~580 TEKS PUBLIK, INTERNAL & EMAIL
                    </div>
                    <h2 className="text-base font-bold text-gray-900 mt-0.5">
                      Manajemen & Edit Semua Tulisan Aplikasi (Tanpa Coding)
                    </h2>
                    <p className="text-gray-500">
                      Ubah nama menu sidebar (mis. "Marketing" → "Pemasaran"), judul Hero, label tabel, tombol, hingga pesan notifikasi toast secara real-time.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(!editMode);
                        toast.success(
                          !editMode
                            ? '✏️ Inline Edit Mode ON: Klik teks mana saja di layar untuk mengedit!'
                            : '✏️ Inline Edit Mode OFF'
                        );
                      }}
                      className={`px-3 py-2 rounded-lg font-bold cursor-pointer ${
                        editMode ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {editMode ? '✏️ Inline Edit: ON' : '✏️ Aktifkan Inline Edit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetAllEditableTexts();
                        toast.success('🔄 Semua teks telah dikembalikan ke nilai default sistem');
                      }}
                      className="px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 rounded-lg font-semibold text-gray-700 cursor-pointer"
                    >
                      🔄 Reset Semua Default
                    </button>
                  </div>
                </div>

                {/* Category Filter Tabs & Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {(['ALL', 'Website', 'Menu', 'Dashboard', 'Tabel', 'Form', 'Notifikasi', 'Status', 'Email'] as const).map(
                      (cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setTextCatFilter(cat)}
                          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                            textCatFilter === cat
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {cat === 'ALL' ? 'Semua Kategori' : cat}
                        </button>
                      )
                    )}
                  </div>

                  <div className="relative min-w-[260px]">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Cari teks (mis: Marketing, Berhasil disimpan, Hero)..."
                      value={textSearch}
                      onChange={(e) => setTextSearch(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 bg-white"
                    />
                  </div>
                </div>

                {/* Add Custom Text Key Form */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-end">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">Kategori</label>
                    <select
                      value={newTextCat}
                      onChange={(e) => setNewTextCat(e.target.value as TextCategory)}
                      className="w-full border border-gray-300 rounded-lg px-2.5 py-2 bg-white"
                    >
                      <option value="Website">Website</option>
                      <option value="Menu">Menu</option>
                      <option value="Dashboard">Dashboard</option>
                      <option value="Tabel">Tabel</option>
                      <option value="Form">Form</option>
                      <option value="Notifikasi">Notifikasi</option>
                      <option value="Status">Status</option>
                      <option value="Email">Email</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">Lokasi / Nama Elemen</label>
                    <input
                      type="text"
                      placeholder="Mis: Tombol Promo Baru"
                      value={newTextLocation}
                      onChange={(e) => setNewTextLocation(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2.5 py-2 bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">Isi Teks</label>
                    <input
                      type="text"
                      placeholder="Ketik isi tulisan..."
                      value={newTextVal}
                      onChange={(e) => setNewTextVal(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2.5 py-2 bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newTextLocation.trim() || !newTextVal.trim()) {
                        toast.error('Isi lokasi dan teks terlebih dahulu');
                        return;
                      }
                      const k =
                        newTextKey.trim() ||
                        `${newTextCat.toLowerCase()}.${newTextLocation.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
                      updateEditableText(k, newTextVal.trim(), newTextLocation.trim(), newTextCat);
                      setNewTextLocation('');
                      setNewTextVal('');
                      setNewTextKey('');
                      toast.success('✅ Item teks baru berhasil ditambahkan!');
                    }}
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                  >
                    + Tambah Teks
                  </button>
                </div>

                {/* Table of Editable Texts */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-500">
                        <th className="py-2.5 pr-3">Lokasi</th>
                        <th className="py-2.5 px-2">Kategori</th>
                        <th className="py-2.5 px-2">Teks Default</th>
                        <th className="py-2.5 px-2">Teks Saat Ini</th>
                        <th className="py-2.5 pl-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {allTextItems.map((item) => {
                        const isEditing = editingTextKey === item.key;
                        const isModified = item.currentText !== item.defaultText;
                        return (
                          <tr key={item.key} className="hover:bg-gray-50">
                            <td className="py-3 pr-3">
                              <div className="font-bold text-gray-900">{item.location}</div>
                              <div className="font-mono text-[10px] text-gray-400">{item.key}</div>
                            </td>
                            <td className="py-3 px-2">
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded font-medium text-[11px]">
                                {item.category}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-gray-500 max-w-xs truncate" title={item.defaultText}>
                              {item.defaultText}
                            </td>
                            <td className="py-3 px-2 max-w-sm">
                              {isEditing ? (
                                <div className="space-y-1.5">
                                  <textarea
                                    rows={2}
                                    value={editingTextValue}
                                    onChange={(e) => setEditingTextValue(e.target.value)}
                                    className="w-full border border-emerald-500 rounded-lg px-2.5 py-1.5 text-gray-900 font-medium"
                                  />
                                  <div className="text-[10px] font-mono text-gray-500">
                                    {editingTextValue.length} karakter
                                  </div>
                                </div>
                              ) : (
                                <div className="font-semibold text-gray-900">
                                  {item.currentText}
                                  {isModified && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-mono">
                                      Diedit
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="py-3 pl-3 text-right whitespace-nowrap space-x-1.5">
                              {isEditing ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateEditableText(item.key, editingTextValue, item.location, item.category);
                                      setEditingTextKey(null);
                                      toast.success(`✅ Teks "${item.location}" berhasil disimpan!`);
                                    }}
                                    className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg cursor-pointer"
                                  >
                                    💾 Simpan
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingTextKey(null)}
                                    className="px-2.5 py-1 border border-gray-300 bg-white rounded-lg text-gray-600 cursor-pointer"
                                  >
                                    Batal
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingTextKey(item.key);
                                      setEditingTextValue(item.currentText);
                                    }}
                                    className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-semibold rounded-lg cursor-pointer"
                                  >
                                    ✏️ Edit
                                  </button>
                                  {isModified && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        resetEditableText(item.key);
                                        toast.success(`🔄 "${item.location}" dikembalikan ke default`);
                                      }}
                                      className="px-2.5 py-1 border border-gray-300 bg-white hover:bg-gray-100 rounded-lg text-gray-700 cursor-pointer"
                                    >
                                      🔄 Reset
                                    </button>
                                  )}
                                  {item.history.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        revertEditableTextVersion(item.key, 0);
                                        toast.success('↩️ Dikembalikan ke versi sebelumnya');
                                      }}
                                      className="px-2 py-1 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg font-medium cursor-pointer"
                                    >
                                      ↩️ Revert ({item.history.length})
                                    </button>
                                  )}
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              3. EDIT SEMUA FOTO (/sistem/foto-manager)
          ========================================================= */}
          {section === 'foto-manager' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <div className="text-emerald-700 font-mono font-bold text-[11px]">
                      BAGIAN 2 · /sistem/foto-manager · FOTO PUBLIK & INTERNAL (UNLIMITED)
                    </div>
                    <h2 className="text-base font-bold text-gray-900 mt-0.5">
                      Manajemen Semua Foto Website Publik & Sistem Internal
                    </h2>
                    <p className="text-gray-500">
                      Setiap foto dilengkapi tombol [✏️ Ganti], [🗑️ Hapus], [👁️ Preview], [⭐ Set Utama], [🔄 Reset], dan Reorder.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(['ALL', 'Website Publik', 'Sistem Internal'] as const).map((sc) => (
                      <button
                        key={sc}
                        type="button"
                        onClick={() => setPhotoScopeFilter(sc)}
                        className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                          photoScopeFilter === sc
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {sc === 'ALL' ? 'Semua Slot Foto' : sc}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {photoSlots
                    .filter((sl) => photoScopeFilter === 'ALL' || sl.scope === photoScopeFilter)
                    .map((slot) => {
                      const primary = slot.photos.find((p) => p.isPrimary) || slot.photos[0];
                      return (
                        <div
                          key={slot.slotKey}
                          className="border border-gray-200 rounded-2xl overflow-hidden bg-white flex flex-col justify-between shadow-xs"
                        >
                          <div>
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                              <div>
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-mono font-bold rounded text-[10px]">
                                  {slot.scope} · {slot.photos.length} Foto
                                </span>
                                <h3 className="font-bold text-gray-900 text-sm mt-1">{slot.title}</h3>
                                <p className="font-mono text-[10px] text-gray-500">{slot.folderPath}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  resetPhotoSlot(slot.slotKey);
                                  toast.success(`🔄 Slot "${slot.title}" di-reset ke default`);
                                }}
                                className="px-2.5 py-1 border border-gray-300 rounded-lg text-[11px] font-semibold hover:bg-gray-50 cursor-pointer"
                              >
                                🔄 Reset
                              </button>
                            </div>

                            <div className="p-4 space-y-3">
                              {primary && (
                                <div className="relative rounded-xl overflow-hidden border border-gray-200">
                                  <img
                                    src={primary.url}
                                    alt={primary.caption}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-44 object-cover"
                                  />
                                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-600 text-white font-bold text-[10px] rounded">
                                    ⭐ Thumbnail Utama ({primary.sizeKb} KB)
                                  </span>
                                </div>
                              )}

                              {/* Thumbnails & Actions per Photo */}
                              <div className="space-y-2">
                                {slot.photos.map((ph, idx) => (
                                  <div
                                    key={ph.id}
                                    className="p-2 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between gap-2"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <img
                                        src={ph.url}
                                        alt={ph.caption}
                                        referrerPolicy="no-referrer"
                                        className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                                      />
                                      <div className="truncate">
                                        <div className="font-bold text-gray-900 truncate">{ph.caption}</div>
                                        <div className="font-mono text-[10px] text-gray-500 truncate">
                                          {ph.storagePath}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      {!ph.isPrimary && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setPrimaryPhotoInSlot(slot.slotKey, ph.id);
                                            toast.success('⭐ Dijadikan foto utama');
                                          }}
                                          className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-semibold cursor-pointer"
                                        >
                                          ⭐ Utama
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        disabled={idx === 0}
                                        onClick={() => reorderPhotoInSlot(slot.slotKey, idx, idx - 1)}
                                        className="p-1 border border-gray-300 bg-white rounded disabled:opacity-40 cursor-pointer"
                                      >
                                        <ArrowUp className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={idx === slot.photos.length - 1}
                                        onClick={() => reorderPhotoInSlot(slot.slotKey, idx, idx + 1)}
                                        className="p-1 border border-gray-300 bg-white rounded disabled:opacity-40 cursor-pointer"
                                      >
                                        <ArrowDown className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          deletePhotoFromSlot(slot.slotKey, ph.id);
                                          toast.success('🗑️ Foto dipindahkan ke Trash (Soft Delete)');
                                        }}
                                        className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-[10px] font-semibold cursor-pointer"
                                      >
                                        🗑️ Hapus
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Upload New Photo to Slot */}
                          <div className="p-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-[11px] text-gray-500">Max 5 MB · JPG/PNG/WEBP · Auto-Compress</span>
                            <label className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5">
                              <Upload className="w-3.5 h-3.5" />
                              <span>[✏️ Ganti / + Upload Foto]</span>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                onChange={(e) => {
                                  const files = e.target.files;
                                  if (!files) return;
                                  Array.from(files).forEach((file) => {
                                    if (file.size > 5 * 1024 * 1024) {
                                      toast.error(`File ${file.name} melebihi 5 MB!`);
                                      return;
                                    }
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                      const kb = Math.max(80, Math.round((file.size / 1024) * 0.65));
                                      addPhotoToSlot(
                                        slot.slotKey,
                                        String(reader.result),
                                        file.name.replace(/\.[^/.]+$/, ''),
                                        kb
                                      );
                                      toast.success(`✅ Foto ${file.name} berhasil diunggah ke ${slot.title}`);
                                    };
                                    reader.readAsDataURL(file);
                                  });
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              4. CMS WEBSITE PUBLIK - 10 TAB (/sistem/website-editor)
          ========================================================= */}
          {section === 'website-editor' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <div className="text-emerald-700 font-mono font-bold text-[11px]">
                    BAGIAN 3 · /sistem/website-editor · 10 TAB CMS LENGKAP
                  </div>
                  <h2 className="text-base font-bold text-gray-900 mt-0.5">
                    CMS Website Publik Editor — 10 Tab Pengaturan Konten
                  </h2>
                  <p className="text-gray-500">
                    Hero, Keunggulan, Statistik, Testimoni, Navbar, Footer, Logo & Branding, Promo, SEO, Halaman Statis
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCmsPreviewOpen((p) => !p)}
                  className="px-3.5 py-2 border border-gray-300 bg-white hover:bg-gray-50 rounded-xl font-semibold text-gray-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <span>{cmsPreviewOpen ? 'Tutup Preview' : '👁️ Lihat Preview Tab'}</span>
                </button>
              </div>

              {/* 10 Tab Pills */}
              <div className="flex flex-wrap gap-1.5 border-b border-gray-200 pb-3">
                {CMS_10_TABS.map((t, idx) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setCmsTab(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      cmsTab === t
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {idx + 1}. {t}
                  </button>
                ))}
              </div>

              {/* TAB 1: HERO */}
              {cmsTab === 'Hero' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Judul Utama Hero</label>
                      <input
                        type="text"
                        value={cmsContent.hero.title}
                        onChange={(e) => {
                          updateCmsContent({ hero: { ...cmsContent.hero, title: e.target.value } }, 'Hero');
                          updateEditableText('web.hero.title', e.target.value, 'Hero - Judul Utama', 'Website');
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 font-bold text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Badge Atas Hero</label>
                      <input
                        type="text"
                        value={cmsContent.hero.badge}
                        onChange={(e) => {
                          updateCmsContent({ hero: { ...cmsContent.hero, badge: e.target.value } }, 'Hero');
                          updateEditableText('web.hero.badge', e.target.value, 'Hero - Badge', 'Website');
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Subjudul Hero</label>
                    <textarea
                      rows={3}
                      value={cmsContent.hero.subtitle}
                      onChange={(e) => {
                        updateCmsContent({ hero: { ...cmsContent.hero, subtitle: e.target.value } }, 'Hero');
                        updateEditableText('web.hero.subtitle', e.target.value, 'Hero - Subjudul', 'Website');
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                      <div className="font-bold text-gray-900">Tombol CTA 1 (Utama)</div>
                      <input
                        type="text"
                        value={cmsContent.hero.cta1Text}
                        onChange={(e) => {
                          updateCmsContent({ hero: { ...cmsContent.hero, cta1Text: e.target.value } }, 'Hero');
                          updateEditableText('web.hero.cta1', e.target.value, 'Hero - CTA 1', 'Website');
                        }}
                        placeholder="Teks Tombol CTA 1"
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 bg-white"
                      />
                      <input
                        type="text"
                        value={cmsContent.hero.cta1Link}
                        onChange={(e) =>
                          updateCmsContent({ hero: { ...cmsContent.hero, cta1Link: e.target.value } }, 'Hero')
                        }
                        placeholder="Link Tujuan (mis: /booking)"
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 bg-white font-mono"
                      />
                    </div>
                    <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                      <div className="font-bold text-gray-900">Tombol CTA 2 (Sekunder)</div>
                      <input
                        type="text"
                        value={cmsContent.hero.cta2Text}
                        onChange={(e) => {
                          updateCmsContent({ hero: { ...cmsContent.hero, cta2Text: e.target.value } }, 'Hero');
                          updateEditableText('web.hero.cta2', e.target.value, 'Hero - CTA 2', 'Website');
                        }}
                        placeholder="Teks Tombol CTA 2"
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 bg-white"
                      />
                      <input
                        type="text"
                        value={cmsContent.hero.cta2Link}
                        onChange={(e) =>
                          updateCmsContent({ hero: { ...cmsContent.hero, cta2Link: e.target.value } }, 'Hero')
                        }
                        placeholder="Link Tujuan (mis: /katalog)"
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 bg-white font-mono"
                      />
                    </div>
                  </div>
                  <UploadFoto
                    photos={cmsContent.hero.banners}
                    onChange={(nextBanners) =>
                      updateCmsContent({ hero: { ...cmsContent.hero, banners: nextBanners } }, 'Hero')
                    }
                    label="Foto Banner Hero (Unlimited Slideshow)"
                  />
                </div>
              )}

              {/* TAB 2: KEUNGGULAN */}
              {cmsTab === 'Keunggulan' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {cmsContent.keunggulan.map((k, idx) => (
                      <div key={k.id} className="p-4 border border-gray-200 rounded-xl space-y-2 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <span className="text-lg">{k.icon}</span>
                          <button
                            type="button"
                            onClick={() =>
                              updateCmsContent(
                                { keunggulan: cmsContent.keunggulan.filter((x) => x.id !== k.id) },
                                'Keunggulan'
                              )
                            }
                            className="text-red-600 hover:underline text-[11px] font-semibold"
                          >
                            🗑️ Hapus Kartu
                          </button>
                        </div>
                        <input
                          type="text"
                          value={k.title}
                          onChange={(e) => {
                            const next = cmsContent.keunggulan.map((x) =>
                              x.id === k.id ? { ...x, title: e.target.value } : x
                            );
                            updateCmsContent({ keunggulan: next }, 'Keunggulan');
                            updateEditableText(`web.keunggulan.${idx + 1}.title`, e.target.value);
                          }}
                          className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 font-bold bg-white"
                        />
                        <textarea
                          rows={3}
                          value={k.description}
                          onChange={(e) => {
                            const next = cmsContent.keunggulan.map((x) =>
                              x.id === k.id ? { ...x, description: e.target.value } : x
                            );
                            updateCmsContent({ keunggulan: next }, 'Keunggulan');
                            updateEditableText(`web.keunggulan.${idx + 1}.desc`, e.target.value);
                          }}
                          className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <input
                      type="text"
                      placeholder="Judul Keunggulan Baru"
                      value={newKeunggulanTitle}
                      onChange={(e) => setNewKeunggulanTitle(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Deskripsi Keunggulan"
                      value={newKeunggulanDesc}
                      onChange={(e) => setNewKeunggulanDesc(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newKeunggulanTitle.trim()) return;
                        updateCmsContent(
                          {
                            keunggulan: [
                              ...cmsContent.keunggulan,
                              {
                                id: `k-${Date.now()}`,
                                icon: '✅',
                                title: newKeunggulanTitle,
                                description: newKeunggulanDesc,
                              },
                            ],
                          },
                          'Keunggulan'
                        );
                        setNewKeunggulanTitle('');
                        setNewKeunggulanDesc('');
                        toast.success('✅ Kartu keunggulan baru ditambahkan');
                      }}
                      className="py-2 px-4 bg-emerald-600 text-white font-bold rounded-lg cursor-pointer"
                    >
                      + Tambah Kartu Keunggulan
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: STATISTIK */}
              {cmsTab === 'Statistik' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {cmsContent.statistik.map((st, idx) => (
                      <div key={st.id} className="p-4 border border-gray-200 rounded-xl space-y-2 bg-gray-50">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[11px] text-gray-500">Statistik #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() =>
                              updateCmsContent(
                                { statistik: cmsContent.statistik.filter((x) => x.id !== st.id) },
                                'Statistik'
                              )
                            }
                            className="text-red-600 text-[11px] font-semibold"
                          >
                            🗑️ Hapus
                          </button>
                        </div>
                        <input
                          type="text"
                          value={st.value}
                          onChange={(e) => {
                            const next = cmsContent.statistik.map((x) =>
                              x.id === st.id ? { ...x, value: e.target.value } : x
                            );
                            updateCmsContent({ statistik: next }, 'Statistik');
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 font-mono font-bold text-base bg-white"
                        />
                        <input
                          type="text"
                          value={st.label}
                          onChange={(e) => {
                            const next = cmsContent.statistik.map((x) =>
                              x.id === st.id ? { ...x, label: e.target.value } : x
                            );
                            updateCmsContent({ statistik: next }, 'Statistik');
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 bg-white"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Angka (mis: 99% Akad)"
                      value={newStatVal}
                      onChange={(e) => setNewStatVal(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 bg-white font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Label Statistik"
                      value={newStatLbl}
                      onChange={(e) => setNewStatLbl(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newStatVal.trim()) return;
                        updateCmsContent(
                          {
                            statistik: [
                              ...cmsContent.statistik,
                              { id: `s-${Date.now()}`, value: newStatVal, label: newStatLbl },
                            ],
                          },
                          'Statistik'
                        );
                        setNewStatVal('');
                        setNewStatLbl('');
                        toast.success('✅ Item statistik ditambahkan');
                      }}
                      className="py-2 px-4 bg-emerald-600 text-white font-bold rounded-lg cursor-pointer"
                    >
                      + Tambah Statistik
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: TESTIMONI */}
              {cmsTab === 'Testimoni' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cmsContent.testimoni.map((t) => (
                      <div key={t.id} className="p-4 border border-gray-200 rounded-xl space-y-2 bg-gray-50">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900">{t.name}</span>
                          <button
                            type="button"
                            onClick={() =>
                              updateCmsContent(
                                { testimoni: cmsContent.testimoni.filter((x) => x.id !== t.id) },
                                'Testimoni'
                              )
                            }
                            className="text-red-600 text-[11px] font-semibold"
                          >
                            🗑️ Hapus
                          </button>
                        </div>
                        <input
                          type="text"
                          value={t.name}
                          onChange={(e) =>
                            updateCmsContent(
                              {
                                testimoni: cmsContent.testimoni.map((x) =>
                                  x.id === t.id ? { ...x, name: e.target.value } : x
                                ),
                              },
                              'Testimoni'
                            )
                          }
                          className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white font-semibold"
                        />
                        <input
                          type="text"
                          value={t.role}
                          onChange={(e) =>
                            updateCmsContent(
                              {
                                testimoni: cmsContent.testimoni.map((x) =>
                                  x.id === t.id ? { ...x, role: e.target.value } : x
                                ),
                              },
                              'Testimoni'
                            )
                          }
                          className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white"
                        />
                        <textarea
                          rows={3}
                          value={t.quote}
                          onChange={(e) =>
                            updateCmsContent(
                              {
                                testimoni: cmsContent.testimoni.map((x) =>
                                  x.id === t.id ? { ...x, quote: e.target.value } : x
                                ),
                              },
                              'Testimoni'
                            )
                          }
                          className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <input
                      type="text"
                      placeholder="Nama Penghuni"
                      value={newTestiName}
                      onChange={(e) => setNewTestiName(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Jabatan & Kavling"
                      value={newTestiRole}
                      onChange={(e) => setNewTestiRole(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Isi Testimoni"
                      value={newTestiQuote}
                      onChange={(e) => setNewTestiQuote(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newTestiName.trim() || !newTestiQuote.trim()) return;
                        updateCmsContent(
                          {
                            testimoni: [
                              ...cmsContent.testimoni,
                              {
                                id: `t-${Date.now()}`,
                                photo: ASSETS.unitInterior,
                                name: newTestiName,
                                role: newTestiRole || 'Penghuni Bahagia Group',
                                quote: newTestiQuote,
                                rating: 5,
                              },
                            ],
                          },
                          'Testimoni'
                        );
                        setNewTestiName('');
                        setNewTestiRole('');
                        setNewTestiQuote('');
                        toast.success('✅ Testimoni baru berhasil ditambahkan');
                      }}
                      className="py-2 px-4 bg-emerald-600 text-white font-bold rounded-lg cursor-pointer"
                    >
                      + Tambah Testimoni
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: NAVBAR */}
              {cmsTab === 'Navbar' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Nama Brand Navbar</label>
                      <input
                        type="text"
                        value={cmsContent.navbar.brandName}
                        onChange={(e) => {
                          updateCmsContent(
                            { navbar: { ...cmsContent.navbar, brandName: e.target.value } },
                            'Navbar'
                          );
                          updateEditableText('web.navbar.brand', e.target.value);
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Teks Tombol Booking</label>
                      <input
                        type="text"
                        value={cmsContent.navbar.bookingButtonText}
                        onChange={(e) => {
                          updateCmsContent(
                            { navbar: { ...cmsContent.navbar, bookingButtonText: e.target.value } },
                            'Navbar'
                          );
                          updateEditableText('web.navbar.btn_booking', e.target.value);
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-5">
                      <input
                        type="checkbox"
                        checked={cmsContent.navbar.sticky}
                        onChange={(e) =>
                          updateCmsContent(
                            { navbar: { ...cmsContent.navbar, sticky: e.target.checked } },
                            'Navbar'
                          )
                        }
                        className="w-4 h-4 accent-emerald-600"
                      />
                      <span className="font-bold text-gray-900">Aktifkan Sticky Navbar (Tetap di Atas Saat Scroll)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: FOOTER */}
              {cmsTab === 'Footer' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Alamat Kantor & Proyek</label>
                    <input
                      type="text"
                      value={cmsContent.footer.address}
                      onChange={(e) =>
                        updateCmsContent({ footer: { ...cmsContent.footer, address: e.target.value } }, 'Footer')
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Nomor Telepon Resmi</label>
                    <input
                      type="text"
                      value={cmsContent.footer.phone}
                      onChange={(e) =>
                        updateCmsContent({ footer: { ...cmsContent.footer, phone: e.target.value } }, 'Footer')
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Email Resmi</label>
                    <input
                      type="text"
                      value={cmsContent.footer.email}
                      onChange={(e) =>
                        updateCmsContent({ footer: { ...cmsContent.footer, email: e.target.value } }, 'Footer')
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Teks Copyright</label>
                    <input
                      type="text"
                      value={cmsContent.footer.copyright}
                      onChange={(e) => {
                        updateCmsContent({ footer: { ...cmsContent.footer, copyright: e.target.value } }, 'Footer');
                        updateEditableText('web.footer.copyright', e.target.value);
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
              )}

              {/* TAB 7: LOGO & BRANDING */}
              {cmsTab === 'Logo & Branding' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Path Logo Grup</label>
                    <input
                      type="text"
                      value={cmsContent.branding.logoGroup}
                      onChange={(e) =>
                        updateCmsContent(
                          { branding: { ...cmsContent.branding, logoGroup: e.target.value } },
                          'Logo & Branding'
                        )
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Warna Utama Tema (Hex)</label>
                    <input
                      type="text"
                      value={cmsContent.branding.primaryColor}
                      onChange={(e) =>
                        updateCmsContent(
                          { branding: { ...cmsContent.branding, primaryColor: e.target.value } },
                          'Logo & Branding'
                        )
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Tipografi / Font Utama</label>
                    <input
                      type="text"
                      value={cmsContent.branding.fontFamily}
                      onChange={(e) =>
                        updateCmsContent(
                          { branding: { ...cmsContent.branding, fontFamily: e.target.value } },
                          'Logo & Branding'
                        )
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
              )}

              {/* TAB 8: PROMO */}
              {cmsTab === 'Promo' && (
                <div className="space-y-4">
                  {cmsContent.promo.map((pr) => (
                    <div key={pr.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-gray-900">{pr.title}</div>
                        <div className="text-gray-600">{pr.description}</div>
                        <div className="font-mono text-[11px] text-emerald-700 mt-1">Periode: {pr.period}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateCmsContent(
                            { promo: cmsContent.promo.filter((x) => x.id !== pr.id) },
                            'Promo'
                          )
                        }
                        className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg font-semibold shrink-0"
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  ))}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <input
                      type="text"
                      placeholder="Judul Promo Baru"
                      value={newPromoTitle}
                      onChange={(e) => setNewPromoTitle(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Deskripsi Promo"
                      value={newPromoDesc}
                      onChange={(e) => setNewPromoDesc(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Periode Aktif"
                      value={newPromoPeriod}
                      onChange={(e) => setNewPromoPeriod(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newPromoTitle.trim()) return;
                        updateCmsContent(
                          {
                            promo: [
                              ...cmsContent.promo,
                              {
                                id: `pr-${Date.now()}`,
                                title: newPromoTitle,
                                description: newPromoDesc,
                                period: newPromoPeriod,
                                image: ASSETS.bahagiaLand,
                                active: true,
                              },
                            ],
                          },
                          'Promo'
                        );
                        setNewPromoTitle('');
                        setNewPromoDesc('');
                        toast.success('✅ Promo baru berhasil ditambahkan');
                      }}
                      className="py-2 px-4 bg-emerald-600 text-white font-bold rounded-lg cursor-pointer"
                    >
                      + Tambah Promo
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 9: SEO */}
              {cmsTab === 'SEO' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Meta Title</label>
                    <input
                      type="text"
                      value={cmsContent.seo.metaTitle}
                      onChange={(e) =>
                        updateCmsContent({ seo: { ...cmsContent.seo, metaTitle: e.target.value } }, 'SEO')
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Meta Keywords</label>
                    <input
                      type="text"
                      value={cmsContent.seo.keywords}
                      onChange={(e) =>
                        updateCmsContent({ seo: { ...cmsContent.seo, keywords: e.target.value } }, 'SEO')
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-gray-700 block mb-1">Meta Description</label>
                    <textarea
                      rows={2}
                      value={cmsContent.seo.metaDescription}
                      onChange={(e) =>
                        updateCmsContent({ seo: { ...cmsContent.seo, metaDescription: e.target.value } }, 'SEO')
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
              )}

              {/* TAB 10: HALAMAN STATIS */}
              {cmsTab === 'Halaman Statis' && (
                <div className="space-y-3">
                  {(['tentang', 'kontak', 'faq', 'sk', 'privasi'] as const).map((pg) => (
                    <div key={pg}>
                      <label className="font-bold text-gray-800 uppercase block mb-1">
                        Halaman {pg.toUpperCase()} (Rich Text)
                      </label>
                      <textarea
                        rows={2}
                        value={cmsContent.staticPages[pg]}
                        onChange={(e) =>
                          updateCmsContent(
                            { staticPages: { ...cmsContent.staticPages, [pg]: e.target.value } },
                            'Halaman Statis'
                          )
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  ))}
                </div>
              )}

              {cmsPreviewOpen && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                  <div className="font-bold text-emerald-900">👁️ Live Preview Konten Tab {cmsTab}:</div>
                  <p className="text-gray-800">
                    Judul Hero: <strong>{cmsContent.hero.title}</strong> · Brand Navbar:{' '}
                    <strong>{cmsContent.navbar.brandName}</strong> · {cmsContent.keunggulan.length} Kartu Keunggulan ·{' '}
                    {cmsContent.testimoni.length} Testimoni Aktif.
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
                <span className="text-gray-500">
                  Perubahan pada Tab <strong>{cmsTab}</strong> langsung tersinkronisasi ke Website Publik.
                </span>
                <button
                  type="button"
                  onClick={() =>
                    toast.success(`🚀 Perubahan CMS Tab "${cmsTab}" berhasil disimpan & dipublikasikan!`)
                  }
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  [🚀 Simpan & Publikasikan Tab {cmsTab}]
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              5. KELOLA USER MULTI-ROLE (/sistem/user)
          ========================================================= */}
          {section === 'user' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-emerald-700 font-mono font-bold text-[11px]">
                      BAGIAN 4A · /sistem/user · CRUD USER MULTI-ROLE
                    </div>
                    <h2 className="text-base font-bold text-gray-900">
                      Manajemen User, Multi-Role, Penempatan PT, Edit, Soft Delete & Reset Password
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.success(`📥 Data ${filteredUsers.length} user berhasil diekspor ke Excel`)}
                    className="px-3.5 py-2 bg-emerald-600 text-white font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Excel</span>
                  </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Cari nama atau email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="ALL">Semua Role</option>
                    <option value="DIREKTUR">DIREKTUR</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="PJT">PJT</option>
                    <option value="PENGAWAS">PENGAWAS</option>
                    <option value="KEUANGAN">KEUANGAN</option>
                    <option value="MARKETING">MARKETING</option>
                    <option value="HRD">HRD</option>
                    <option value="LOGISTIK">LOGISTIK</option>
                  </select>
                  <select
                    value={userPtFilter}
                    onChange={(e) => setUserPtFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="ALL">Semua PT</option>
                    <option value="GROUP">GROUP</option>
                    <option value="PT_TBL">PT Tata Bahagia Land</option>
                    <option value="PT_BPP">PT Bahagia Prima Property</option>
                  </select>
                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="ACTIVE">Aktif</option>
                    <option value="INACTIVE">Nonaktif</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-500">
                        <th className="py-2 pr-2">Nama Lengkap</th>
                        <th className="py-2 px-2">Email Login</th>
                        <th className="py-2 px-2">Role</th>
                        <th className="py-2 px-2">Perusahaan (PT)</th>
                        <th className="py-2 px-2">Status</th>
                        <th className="py-2 pl-2 text-right">Kontrol Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="py-2.5 pr-2 font-bold text-gray-900">{u.name}</td>
                          <td className="py-2.5 px-2 font-mono">{u.email}</td>
                          <td className="py-2.5 px-2">
                            {editingUserId === u.id ? (
                              <select
                                value={u.role}
                                onChange={(e) =>
                                  updateUserFull(u.id, {
                                    role: e.target.value as RoleCode,
                                    roles: [e.target.value as RoleCode],
                                  })
                                }
                                className="border border-emerald-500 rounded px-2 py-1 bg-white font-bold"
                              >
                                <option value="DIREKTUR">DIREKTUR</option>
                                <option value="ADMIN">ADMIN</option>
                                <option value="PJT">PJT</option>
                                <option value="PENGAWAS">PENGAWAS</option>
                                <option value="KEUANGAN">KEUANGAN</option>
                                <option value="MARKETING">MARKETING</option>
                                <option value="HRD">HRD</option>
                                <option value="LOGISTIK">LOGISTIK</option>
                              </select>
                            ) : (
                              <span className="font-semibold text-emerald-700">{u.roles.join(', ')}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-2">
                            {editingUserId === u.id ? (
                              <select
                                value={u.companyId}
                                onChange={(e) =>
                                  updateUserFull(u.id, {
                                    companyId: e.target.value as any,
                                    companyName:
                                      e.target.value === 'GROUP'
                                        ? 'BAHAGIA GROUP PROPERTY'
                                        : e.target.value === 'PT_TBL'
                                        ? 'PT TATA BAHAGIA LAND'
                                        : 'PT BAHAGIA PRIMA PROPERTY',
                                  })
                                }
                                className="border border-emerald-500 rounded px-2 py-1 bg-white"
                              >
                                <option value="GROUP">GROUP</option>
                                <option value="PT_TBL">PT_TBL</option>
                                <option value="PT_BPP">PT_BPP</option>
                              </select>
                            ) : (
                              u.companyName
                            )}
                          </td>
                          <td className="py-2.5 px-2">
                            {u.active ? (
                              <span className="text-emerald-700 font-semibold">Aktif</span>
                            ) : (
                              <span className="text-red-600 font-semibold">Nonaktif</span>
                            )}
                          </td>
                          <td className="py-2.5 pl-2 text-right space-x-1 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingUserId(editingUserId === u.id ? null : u.id)
                              }
                              className="px-2 py-1 border border-gray-300 rounded text-[11px] font-medium hover:bg-gray-100 cursor-pointer"
                            >
                              {editingUserId === u.id ? '💾 Selesai' : '✏️ Edit'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                toggleUserActive(u.id);
                                toast.success(`Status aktif ${u.email} diperbarui`);
                              }}
                              className="px-2 py-1 border border-gray-300 rounded text-[11px] hover:bg-gray-100 cursor-pointer"
                            >
                              {u.active ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                toast.success(
                                  `🔑 Password baru otomatis di-generate & dikirim ke email ${u.email}`
                                )
                              }
                              className="px-2 py-1 border border-gray-300 rounded text-[11px] hover:bg-gray-100 cursor-pointer"
                            >
                              Reset Pass
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeletingUserId(u.id);
                                setDeleteUserReason('');
                                setDeleteUserConfirm('');
                              }}
                              className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-[11px] font-semibold hover:bg-red-100 cursor-pointer"
                            >
                              🗑️ Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Delete User Confirmation Modal (Scenario 4) */}
                {deletingUserId && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
                    <div className="font-bold text-red-900">
                      ⚠️ Konfirmasi Hapus User (Soft Delete ke Trash 30 Hari)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Isi alasan penghapusan user..."
                        value={deleteUserReason}
                        onChange={(e) => setDeleteUserReason(e.target.value)}
                        className="border border-red-300 rounded-lg px-3 py-2 bg-white"
                      />
                      <input
                        type="text"
                        placeholder='Ketik "HAPUS" untuk konfirmasi'
                        value={deleteUserConfirm}
                        onChange={(e) => setDeleteUserConfirm(e.target.value)}
                        className="border border-red-300 rounded-lg px-3 py-2 bg-white font-mono font-bold text-red-600"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (deleteUserConfirm !== 'HAPUS') {
                              toast.error('Ketik kata "HAPUS" terlebih dahulu!');
                              return;
                            }
                            const res = deleteUserSoft(deletingUserId, deleteUserReason);
                            if (!res.ok) {
                              toast.error(res.message);
                            } else {
                              toast.success(`✅ ${res.message}`);
                              setDeletingUserId(null);
                            }
                          }}
                          className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg cursor-pointer"
                        >
                          Konfirmasi Hapus
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingUserId(null)}
                          className="px-3 py-2 border border-gray-300 bg-white rounded-lg"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Add User Form (Scenario 3) */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newUserName.trim() || !newUserEmail.trim()) return;
                  addUser({
                    name: newUserName,
                    email: newUserEmail,
                    password: newUserPassword,
                    role: newUserRole,
                    roles: [newUserRole],
                    companyId: newUserCompany,
                    companyName:
                      newUserCompany === 'GROUP'
                        ? 'BAHAGIA GROUP PROPERTY'
                        : newUserCompany === 'PT_TBL'
                        ? 'PT TATA BAHAGIA LAND'
                        : 'PT BAHAGIA PRIMA PROPERTY',
                    active: true,
                  });
                  setNewUserName('');
                  setNewUserEmail('');
                  toast.success('✅ User baru berhasil ditambahkan & notifikasi Email Event #12 terkirim');
                }}
                className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 text-xs"
              >
                <h3 className="text-sm font-bold text-gray-900">
                  [+ Tambah User Baru] (Nama *, Email *, Password *, No HP, Role, PT)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap *"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Login *"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Password *"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 font-mono"
                  />
                  <input
                    type="tel"
                    placeholder="No HP"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as RoleCode)}
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="DIREKTUR">DIREKTUR</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="PJT">PJT (Penanggung Jawab Teknis)</option>
                    <option value="PENGAWAS">PENGAWAS & PURCHASING</option>
                    <option value="KEUANGAN">KEUANGAN</option>
                    <option value="MARKETING">MARKETING</option>
                    <option value="HRD">HRD</option>
                    <option value="LOGISTIK">LOGISTIK</option>
                  </select>
                  <select
                    value={newUserCompany}
                    onChange={(e) => setNewUserCompany(e.target.value as any)}
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="GROUP">LEVEL GRUP (Bahagia Group)</option>
                    <option value="PT_TBL">PT TATA BAHAGIA LAND</option>
                    <option value="PT_BPP">PT BAHAGIA PRIMA PROPERTY</option>
                  </select>
                  <button
                    type="submit"
                    className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                  >
                    💾 Simpan User Baru
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================================
              6. KELOLA ROLE & MATRIX 9×7 (/sistem/role)
          ========================================================= */}
          {section === 'role' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-emerald-700 font-mono font-bold text-[11px]">
                    BAGIAN 4B · /sistem/role · MATRIX 9 MODUL × 7 AKSI
                  </div>
                  <h2 className="text-base font-bold text-gray-900">
                    CRUD Role & Permission Matrix (Lihat, Tambah, Edit, Hapus, Approve, Export, Print)
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedRoleForMatrix}
                    onChange={(e) => setSelectedRoleForMatrix(e.target.value as RoleCode)}
                    className="border border-gray-300 rounded-lg px-3 py-2 font-bold bg-white"
                  >
                    {roles.map((r) => (
                      <option key={r.role} value={r.role}>
                        Role: {r.role} ({r.level})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      duplicateRole(selectedRoleForMatrix);
                      toast.success(`📋 Role ${selectedRoleForMatrix} berhasil diduplikat`);
                    }}
                    className="px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 rounded-lg font-semibold cursor-pointer"
                  >
                    📋 Duplikat
                  </button>
                </div>
              </div>

              {/* Add New Role */}
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Nama Role Baru (mis: AUDITOR)"
                  value={newRoleCode}
                  onChange={(e) => setNewRoleCode(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 bg-white font-mono"
                />
                <input
                  type="text"
                  placeholder="Level / Deskripsi Role"
                  value={newRoleLevel}
                  onChange={(e) => setNewRoleLevel(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newRoleCode.trim()) return;
                    addRoleFull(newRoleCode.trim(), newRoleLevel);
                    setNewRoleCode('');
                    toast.success('✅ Role baru berhasil ditambahkan ke matriks');
                  }}
                  className="py-1.5 px-4 bg-emerald-600 text-white font-bold rounded-lg cursor-pointer"
                >
                  + Tambah Role Baru
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500">
                      <th className="py-2.5 pr-3">9 Modul Utama</th>
                      <th className="py-2.5 px-2 text-center">Lihat</th>
                      <th className="py-2.5 px-2 text-center">Tambah</th>
                      <th className="py-2.5 px-2 text-center">Edit</th>
                      <th className="py-2.5 px-2 text-center">Hapus</th>
                      <th className="py-2.5 px-2 text-center">Approve</th>
                      <th className="py-2.5 px-2 text-center">Export</th>
                      <th className="py-2.5 px-2 text-center">Print</th>
                      <th className="py-2.5 pl-3 text-right">Aksi Cepat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Object.entries(activeRoleObj.permissions).map(([modName, perms]) => (
                      <tr key={modName} className="hover:bg-gray-50">
                        <td className="py-2.5 pr-3 font-bold text-gray-900">{modName}</td>
                        {(['lihat', 'tambah', 'edit', 'hapus', 'approve', 'export', 'print'] as const).map(
                          (actKey) => (
                            <td key={actKey} className="py-2.5 px-2 text-center">
                              <input
                                type="checkbox"
                                checked={perms[actKey]}
                                onChange={() =>
                                  toggleRolePermission(activeRoleObj.role, modName, actKey)
                                }
                                className="accent-emerald-600 w-4 h-4 cursor-pointer"
                              />
                            </td>
                          )
                        )}
                        <td className="py-2.5 pl-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              selectAllModulePermissions(activeRoleObj.role, modName);
                              toast.success(`Semua izin modul ${modName} diaktifkan untuk ${activeRoleObj.role}`);
                            }}
                            className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-600 hover:text-white rounded text-[11px] font-medium cursor-pointer"
                          >
                            Pilih Semua
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
              7. KELOLA PT / PERUSAHAAN (/sistem/perusahaan)
          ========================================================= */}
          {section === 'perusahaan' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-emerald-700 font-mono font-bold text-[11px]">
                    BAGIAN 5 · /sistem/perusahaan · CRUD PERUSAHAAN (PT)
                  </div>
                  <h2 className="text-base font-bold text-gray-900">
                    Manajemen Badan Hukum PT (Tambah, Edit, Duplikat & Soft Delete PT)
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddPtModal((v) => !v)}
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl cursor-pointer"
                >
                  + Tambah PT Baru
                </button>
              </div>

              {showAddPtModal && (
                <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Nama Badan Hukum PT (mis: PT Bahagia Sentosa Land)"
                    value={newPtName}
                    onChange={(e) => setNewPtName(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Nama Proyek Utama"
                    value={newPtProject}
                    onChange={(e) => setNewPtProject(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Alamat & Lokasi"
                    value={newPtLocation}
                    onChange={(e) => setNewPtLocation(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Tagline / Spesifikasi"
                      value={newPtSpecs}
                      onChange={(e) => setNewPtSpecs(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newPtName.trim()) return;
                        addCompanyFull({
                          name: newPtName,
                          slug: newPtName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                          tagline: newPtSpecs || 'Membangun Hunian Bahagia',
                          projectName: newPtProject || 'Proyek Baru Bahagia Group',
                          location: newPtLocation || 'Kota Kendari',
                          coordinates: { lat: -4.0096, lng: 122.5127 },
                          totalUnits: 50,
                          blockBreakdown: 'Blok A & B (50 Unit)',
                          landArea: '5.000 m²',
                          price: 169000000,
                          hppPerUnit: 125000000,
                          bookingFee: 2000000,
                          dpInfo: 'DP 1% Subsidi FLPP',
                          specs: newPtSpecs || 'Standar Mutu PJT Bahagia Group',
                          legality: 'SHGB Induk & PBG Lengkap',
                          phone: '0811-4000-169',
                          whatsapp: '628114000169',
                          promoBonus: ['Bebas Biaya Akad & Notaris'],
                          banks: ['Bank BTN', 'Bank BRI', 'Bank Mandiri'],
                          operationalHours: 'Senin - Minggu (08.00 - 17.00 WITA)',
                          heroImage: ASSETS.bahagiaLand,
                        });
                        setNewPtName('');
                        setNewPtProject('');
                        setShowAddPtModal(false);
                        toast.success('✅ Perusahaan (PT) baru berhasil ditambahkan!');
                      }}
                      className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg cursor-pointer"
                    >
                      Simpan PT
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {companies.map((comp) => (
                  <div key={comp.id} className="border border-gray-200 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-emerald-700 font-bold">{comp.id}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            duplicateCompany(comp.id);
                            toast.success(`📋 ${comp.name} berhasil diduplikat`);
                          }}
                          className="px-2.5 py-1 border border-gray-300 rounded text-[11px] font-semibold hover:bg-gray-50 cursor-pointer"
                        >
                          📋 Duplikat
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            deleteCompanySoft(comp.id);
                            toast.success(`🗑️ ${comp.name} dipindahkan ke Trash (Soft Delete)`);
                          }}
                          className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-[11px] font-semibold cursor-pointer"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-500 block mb-1">Nama Badan Hukum PT</label>
                      <input
                        type="text"
                        value={comp.name}
                        onChange={(e) => updateCompany(comp.id as any, { name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 font-bold text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 block mb-1">Nama Proyek Perumahan</label>
                      <input
                        type="text"
                        value={comp.projectName}
                        onChange={(e) => updateCompany(comp.id as any, { projectName: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 block mb-1">Alamat & Lokasi Proyek</label>
                      <input
                        type="text"
                        value={comp.location}
                        onChange={(e) => updateCompany(comp.id as any, { location: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 block mb-1">Tagline & Spesifikasi Teknis</label>
                      <textarea
                        rows={2}
                        value={comp.specs}
                        onChange={(e) => updateCompany(comp.id as any, { specs: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.success(`✅ Data ${comp.name} berhasil disimpan`)}
                      className="w-full py-2 bg-emerald-600 text-white font-semibold rounded-lg cursor-pointer"
                    >
                      💾 Simpan Perubahan PT
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================
              8. KATALOG UNIT EDITOR (/sistem/catalog-editor)
          ========================================================= */}
          {section === 'catalog-editor' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-emerald-700 font-mono font-bold text-[11px]">
                    BAGIAN 6A · /sistem/catalog-editor · CRUD KATALOG UNIT ({kavling.length} UNIT)
                  </div>
                  <h2 className="text-base font-bold text-gray-900">
                    Katalog Unit Editor (Tambah 1 Unit, Tambah Banyak, Import/Export Excel, Foto Unlimited)
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      for (let i = 1; i <= 5; i++) {
                        addKavlingUnit({
                          companyId: 'PT_TBL',
                          block: 'D',
                          code: `D-${kavling.length + i}`,
                          type: 'Tipe 36/91 (7×13m)',
                          price: 169000000,
                          hpp: 125000000,
                        });
                      }
                      toast.success('✅ 5 Unit Kavling baru berhasil ditambahkan sekaligus!');
                    }}
                    className="px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold rounded-lg cursor-pointer"
                  >
                    [+ Tambah Banyak (5 Unit)]
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.success('📄 Template Excel Katalog Unit berhasil diunduh')}
                    className="px-3 py-2 border border-gray-300 bg-white rounded-lg font-semibold cursor-pointer"
                  >
                    [📄 Template]
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.success(`📤 ${kavling.length} Unit berhasil diekspor ke Excel`)}
                    className="px-3 py-2 bg-emerald-600 text-white font-bold rounded-lg cursor-pointer"
                  >
                    [📤 Export]
                  </button>
                </div>
              </div>

              {/* Quick Add 1 Unit */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                <div>
                  <label className="text-[11px] text-gray-600 block mb-1">Blok</label>
                  <select
                    value={newUnitBlock}
                    onChange={(e) => setNewUnitBlock(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-lg px-2.5 py-2 bg-white"
                  >
                    <option value="A">Blok A</option>
                    <option value="B">Blok B</option>
                    <option value="C">Blok C</option>
                    <option value="D">Blok D</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-gray-600 block mb-1">Kode Kavling</label>
                  <input
                    type="text"
                    placeholder="Mis: A-99"
                    value={newUnitCode}
                    onChange={(e) => setNewUnitCode(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2.5 py-2 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-600 block mb-1">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    value={newUnitPrice}
                    onChange={(e) => setNewUnitPrice(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-2.5 py-2 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-600 block mb-1">HPP Konstruksi (Rp)</label>
                  <input
                    type="number"
                    value={newUnitHpp}
                    onChange={(e) => setNewUnitHpp(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-2.5 py-2 bg-white font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const code = newUnitCode.trim() || `${newUnitBlock}-${kavling.length + 1}`;
                    addKavlingUnit({
                      companyId: 'PT_TBL',
                      block: newUnitBlock,
                      code,
                      type: 'Tipe 36/91 (7×13m)',
                      price: newUnitPrice,
                      hpp: newUnitHpp,
                    });
                    setNewUnitCode('');
                    toast.success(`✅ Unit Kavling ${code} berhasil ditambahkan ke Katalog!`);
                  }}
                  className="py-2 px-4 bg-emerald-600 text-white font-bold rounded-lg cursor-pointer"
                >
                  [+ Tambah 1 Unit]
                </button>
              </div>

              <input
                type="text"
                placeholder="Cari kode kavling atau proyek..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />

              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500">
                      <th className="py-2 pr-2">Kode</th>
                      <th className="py-2 px-2">Proyek</th>
                      <th className="py-2 px-2">Tipe & Luas</th>
                      <th className="py-2 px-2">Harga / HPP</th>
                      <th className="py-2 px-2">Status</th>
                      <th className="py-2 px-2">Progress</th>
                      <th className="py-2 pl-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {kavling
                      .filter(
                        (k) =>
                          !catalogSearch ||
                          k.code.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                          k.projectName.toLowerCase().includes(catalogSearch.toLowerCase())
                      )
                      .slice(0, 30)
                      .map((unit) => (
                        <tr key={unit.id} className="hover:bg-gray-50">
                          <td className="py-2.5 pr-2 font-mono font-bold text-gray-900">{unit.code}</td>
                          <td className="py-2.5 px-2">{unit.projectName}</td>
                          <td className="py-2.5 px-2">{unit.type}</td>
                          <td className="py-2.5 px-2 font-mono">{formatRupiah(unit.price)}</td>
                          <td className="py-2.5 px-2">
                            <select
                              value={unit.status}
                              onChange={(e) => {
                                updateKavlingStatusAndProgress(
                                  unit.id,
                                  e.target.value as any,
                                  unit.progress
                                );
                                toast.success(`Status kavling ${unit.code} diubah ke ${e.target.value}`);
                              }}
                              className="border border-gray-300 rounded px-2 py-1 bg-white font-semibold"
                            >
                              <option value="Tersedia">Tersedia</option>
                              <option value="Booking">Booking</option>
                              <option value="Proses KPR">Proses KPR</option>
                              <option value="Terjual">Terjual</option>
                              <option value="Serah Terima">Serah Terima</option>
                            </select>
                          </td>
                          <td className="py-2.5 px-2 font-mono">{unit.progress}%</td>
                          <td className="py-2.5 pl-2 text-right space-x-1">
                            <button
                              type="button"
                              onClick={() => {
                                deleteRecordsFromCollection('units_kavling', [unit.id], false);
                                toast.success(`🗑️ Kavling ${unit.code} dipindahkan ke Trash`);
                              }}
                              className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-[11px] font-semibold cursor-pointer"
                            >
                              🗑️ Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
              AUTO-SYNC PROYEK & LOKASI BARU (/sistem/proyek)
          ========================================================= */}
          {section === 'proyek' && <AutoSyncProjectManager />}

          {/* =========================================================
              9. KAVLING & SITE PLAN (/sistem/kavling)
          ========================================================= */}
          {section === 'kavling' && <SitePlanInteractive editable />}

          {/* =========================================================
              10. DATA MASTER 12 KATEGORI (/sistem/data-master)
          ========================================================= */}
          {section === 'data-master' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 text-xs">
              <div>
                <div className="text-emerald-700 font-mono font-bold text-[11px]">
                  BAGIAN 6C · /sistem/data-master · 12 KATEGORI DATA MASTER
                </div>
                <h2 className="text-base font-bold text-gray-900 mt-0.5">
                  Data Master Terpadu — 12 Kategori (CRUD + Aktif/Nonaktif + Urutkan)
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {masterCategories.map((cat, idx) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedMasterCat(cat)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium cursor-pointer ${
                      selectedMasterCat === cat
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {idx + 1}. {cat} ({(dataMaster[cat] || []).length})
                  </button>
                ))}
              </div>

              {/* Add Item to Selected Category */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Kode Item (mis: MAT-NEW)"
                  value={newDmCode}
                  onChange={(e) => setNewDmCode(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white font-mono"
                />
                <input
                  type="text"
                  placeholder={`Nama Item Baru di ${selectedMasterCat}...`}
                  value={newDmLabel}
                  onChange={(e) => setNewDmLabel(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newDmLabel.trim()) return;
                    addDataMasterItem(
                      selectedMasterCat,
                      newDmCode.trim() || `DM-${Date.now().toString().slice(-3)}`,
                      newDmLabel.trim()
                    );
                    setNewDmCode('');
                    setNewDmLabel('');
                    toast.success(`✅ Item ditambahkan ke ${selectedMasterCat}`);
                  }}
                  className="py-2 px-4 bg-emerald-600 text-white font-bold rounded-lg cursor-pointer"
                >
                  + Tambah Item {selectedMasterCat}
                </button>
              </div>

              {/* Items Table */}
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                {(dataMaster[selectedMasterCat] || []).map((it, idx, arr) => (
                  <div key={it.id} className="p-3 bg-white hover:bg-gray-50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-gray-400">#{it.order}</span>
                      <span className="px-2 py-0.5 bg-gray-100 font-mono font-bold rounded text-gray-800">
                        {it.code}
                      </span>
                      <input
                        type="text"
                        value={it.label}
                        onChange={(e) =>
                          updateDataMasterItem(selectedMasterCat, it.id, { label: e.target.value })
                        }
                        className="border border-transparent hover:border-gray-300 focus:border-emerald-500 rounded px-2 py-1 font-semibold text-gray-900"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          updateDataMasterItem(selectedMasterCat, it.id, { active: !it.active })
                        }
                        className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${
                          it.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {it.active ? 'Aktif' : 'Nonaktif'}
                      </button>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => reorderDataMasterItem(selectedMasterCat, it.id, 'UP')}
                        className="p-1 border border-gray-300 rounded disabled:opacity-40 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === arr.length - 1}
                        onClick={() => reorderDataMasterItem(selectedMasterCat, it.id, 'DOWN')}
                        className="p-1 border border-gray-300 rounded disabled:opacity-40 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          deleteDataMasterItem(selectedMasterCat, it.id);
                          toast.success('🗑️ Item dipindahkan ke Trash');
                        }}
                        className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded font-semibold cursor-pointer"
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================
              11. KONTROL COA PENUH (/sistem/coa-control)
          ========================================================= */}
          {section === 'coa-control' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-emerald-700 font-mono font-bold text-[11px]">
                    BAGIAN 7 · /keuangan/coa · COA TIDAK DIKUNCI ({coa.length} AKUN)
                  </div>
                  <h2 className="text-base font-bold text-gray-900 mt-0.5">
                    Kontrol Penuh Bagan Akun (COA) — Tambah, Edit, Hapus Aman, Duplikat, Nonaktifkan & Buku Besar
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/keuangan/coa')}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Buka Halaman Penuh /keuangan/coa</span>
                </button>
              </div>
              <p className="text-gray-600">
                Super Admin memiliki akses penuh tanpa kunci untuk menambah akun baru (Level 1–5), mengedit, menduplikat, menonaktifkan, atau menghapus akun dengan validasi jurnal otomatis di halaman <strong>/keuangan/coa</strong>.
              </p>
            </div>
          )}

          {/* =========================================================
              12. DATA EXPLORER 55+ KOLEKSI (/sistem/data-explorer)
          ========================================================= */}
          {section === 'data-explorer' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-emerald-700 font-mono font-bold text-[11px]">
                    BAGIAN 8 · /sistem/data-explorer · {ALL_55_COLLECTIONS.length} KOLEKSI DATABASE
                  </div>
                  <h2 className="text-base font-bold text-gray-900 mt-0.5">
                    Firestore Data Explorer — Lihat, Filter, Edit, Hapus, Import & Export Semua Koleksi
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toast.success(`📥 Import data ke koleksi /${selectedExplorerCol} siap`)}
                    className="px-3 py-2 border border-gray-300 bg-white rounded-lg font-semibold cursor-pointer"
                  >
                    [📥 Import]
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(explorerRecords, null, 2)], {
                        type: 'application/json',
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `collection-${selectedExplorerCol}.json`;
                      a.click();
                      toast.success(`📤 Koleksi /${selectedExplorerCol} berhasil diekspor!`);
                    }}
                    className="px-3 py-2 bg-emerald-600 text-white font-bold rounded-lg cursor-pointer"
                  >
                    [📤 Export]
                  </button>
                </div>
              </div>

              {/* 55+ Collection Selector Pills */}
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-3 bg-gray-50 border border-gray-200 rounded-xl">
                {ALL_55_COLLECTIONS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setSelectedExplorerCol(col)}
                    className={`px-2.5 py-1 rounded font-mono text-[11px] cursor-pointer ${
                      selectedExplorerCol === col
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    /{col}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="font-mono font-bold text-gray-900">
                  Koleksi Aktif: /{selectedExplorerCol} ({explorerRecords.length} dokumen)
                </div>
                <input
                  type="text"
                  placeholder={`Cari dokumen di /${selectedExplorerCol}...`}
                  value={explorerSearch}
                  onChange={(e) => setExplorerSearch(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 w-64"
                />
              </div>

              <div className="overflow-x-auto max-h-96 border border-gray-200 rounded-xl">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                    <tr>
                      <th className="py-2.5 px-3">ID / Key</th>
                      <th className="py-2.5 px-3">Ringkasan Data Dokumen (JSON Preview)</th>
                      <th className="py-2.5 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {explorerRecords.slice(0, 30).map((row, idx) => {
                      const rowId = row.id || row.code || row.key || row.role || `doc-${idx}`;
                      return (
                        <tr key={rowId} className="hover:bg-gray-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-800 whitespace-nowrap">
                            {rowId}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-gray-600 max-w-xl truncate">
                            {JSON.stringify(row)}
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap space-x-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                toast.info(`Detail Dokumen ${rowId}: ${JSON.stringify(row).slice(0, 120)}...`)
                              }
                              className="px-2.5 py-1 border border-gray-300 bg-white rounded font-semibold cursor-pointer"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                toast.success(`🗑️ Dokumen ${rowId} dipindahkan ke Trash (Soft Delete)`)
                              }
                              className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded font-semibold cursor-pointer"
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
          )}

          {/* =========================================================
              13. RESET DATA (/sistem/reset-data)
          ========================================================= */}
          {section === 'reset-data' && (
            <div className="space-y-6">
              <div className="bg-white border-2 border-amber-300 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-6 bg-amber-50/70 border-b border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-mono font-bold text-amber-800">
                      BAGIAN 9 · /sistem/reset-data
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mt-0.5">
                      ⚠️ RESET DATA SISTEM — Pilih Koleksi yang Ingin Direset
                    </h2>
                    <p className="text-xs text-gray-700 mt-1">
                      Mendukung Auto-Backup JSON, Soft Delete (Trash 30 Hari), dan notifikasi otomatis ke Direktur.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      restoreInitialDemoData();
                      toast.success('🔄 Data default sistem berhasil dipulihkan kembali');
                    }}
                    className="px-3.5 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 rounded-lg shrink-0 cursor-pointer"
                  >
                    [🔄 Reset ke Default]
                  </button>
                </div>

                {/* Protected Section */}
                <div className="p-6 border-b border-gray-200 bg-emerald-50/40 space-y-2 text-xs">
                  <div className="font-bold text-emerald-950 text-sm">
                    🔒 DATA DILINDUNGI (Users, Roles, Companies, Settings, Data Master, Email Templates):
                  </div>
                  <p className="text-gray-600">
                    {users.length} Users · {roles.length} Roles · {companies.length} PT · 12 Kategori Data Master · 12 Email Templates tetap terlindungi.
                  </p>
                </div>

                {/* Checkboxes Selection */}
                <div className="p-6 space-y-5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: 'units_kavling', label: `Units & Kavling (${kavling.length} data)`, desc: 'Data kavling Blok A–D' },
                      { key: 'bookings', label: `Bookings & Complaints (${bookings.length} data)`, desc: 'Pemesanan & komplain' },
                      { key: 'transactions', label: `Transactions / Kas Masuk & Keluar (${journals.length} data)`, desc: 'Jurnal & transaksi kas' },
                      { key: 'work_progress', label: `Work Progress (${verifications.length} data)`, desc: 'Progress fisik & verifikasi' },
                      { key: 'po_invoice', label: `PO & Invoice (${purchaseOrders.length} data)`, desc: 'Purchase Order material' },
                      { key: 'inventory', label: `Inventory (${inventory.length} data)`, desc: 'Stok material gudang' },
                      { key: 'suppliers', label: `Suppliers (${suppliers.length} data)`, desc: 'Daftar toko supplier' },
                      { key: 'spr_prospek', label: `SPR & Prospek (${bookings.length} data)`, desc: 'Pipeline prospek marketing' },
                      { key: 'absensi_payroll', label: `Absensi & Payroll (${attendance.length} data)`, desc: 'Log absensi & slip gaji' },
                      { key: 'testimonials', label: `Testimoni Konsumen (${publicTestimonials.length} data)`, desc: 'Slider testimoni penghuni di Homepage' },
                      { key: 'gallery_photos', label: `Galeri & Progress Pembangunan (${galleryPhotos.length} foto)`, desc: 'Grid foto pembangunan & progress fisik %' },
                      { key: 'articles', label: `Artikel & Berita Blog (${blogArticles.length} artikel)`, desc: 'Artikel Tips KPR, Info Proyek & Promo' },
                      { key: 'coa', label: `COA (Opsional - Reset ke 102 Akun Standar)`, desc: 'Kembalikan saldo COA ke awal' },
                      { key: 'all_dummy', label: 'Semua Data Dummy Operasional', desc: 'Pilih seluruh koleksi operasional di atas' },
                    ].map((col) => {
                      const checked = selectedResetCols.includes(col.key);
                      return (
                        <label
                          key={col.key}
                          className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer ${
                            checked ? 'border-red-500 bg-red-50/40' : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setSelectedResetCols((prev) =>
                                prev.includes(col.key)
                                  ? prev.filter((x) => x !== col.key)
                                  : [...prev, col.key]
                              )
                            }
                            className="accent-red-600 w-4 h-4 mt-0.5"
                          />
                          <div>
                            <div className="font-bold text-gray-900">{col.label}</div>
                            <div className="text-[11px] text-gray-500">{col.desc}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* Confirmation & Action Buttons */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div>
                      <label className="font-bold text-gray-800 block mb-1">
                        Konfirmasi: Ketik <span className="text-red-600 font-mono">"HAPUS"</span>
                      </label>
                      <input
                        type="text"
                        value={resetConfirmText}
                        onChange={(e) => setResetConfirmText(e.target.value)}
                        placeholder='Ketik "HAPUS"...'
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono font-bold text-red-600 bg-white"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          const snap = createBackupSnapshot('Backup Sebelum Reset Data', 'Pre-Reset');
                          const blob = new Blob([snap.payloadJson], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `backup-${Date.now()}.json`;
                          a.click();
                          toast.success('💾 Backup JSON berhasil disimpan & diunduh!');
                        }}
                        className="px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-lg cursor-pointer"
                      >
                        [💾 Backup Dulu]
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (resetConfirmText !== 'HAPUS') {
                            toast.error('Ketik "HAPUS" terlebih dahulu!');
                            return;
                          }
                          resetSelectedCollections(selectedResetCols, true);
                          setResetConfirmText('');
                          toast.success('🗑️ Koleksi yang dipilih berhasil di-reset ke 0 & di-backup! Mengarahkan ke Dashboard...');
                          setTimeout(() => {
                            navigate('/dashboard');
                          }, 400);
                        }}
                        className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-lg cursor-pointer"
                      >
                        [🗑️ Reset yang Dipilih]
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              14. TRASH / KERANJANG SAMPAH 30 HARI (/sistem/trash)
          ========================================================= */}
          {section === 'trash' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-emerald-700 font-mono font-bold text-[11px]">
                    BAGIAN 10 · /sistem/trash · SOFT DELETE RETENSI 30 HARI
                  </div>
                  <h2 className="text-base font-bold text-gray-900 mt-0.5">
                    Trash (Keranjang Sampah) — Restore Data atau Hapus Permanen
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Cari item di Trash..."
                    value={trashSearch}
                    onChange={(e) => setTrashSearch(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                {trashItems
                  .filter(
                    (t) =>
                      (trashFilterCol === 'ALL' || t.collection === trashFilterCol) &&
                      (!trashSearch || t.title.toLowerCase().includes(trashSearch.toLowerCase()))
                  )
                  .map((t) => (
                    <div
                      key={t.id}
                      className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="font-bold text-gray-900">{t.title}</div>
                        <div className="font-mono text-[11px] text-gray-500">
                          Koleksi: /{t.collection} · Dihapus: {t.deletedAt} · Auto-hapus 30 hari
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            restoreTrashItem(t.id);
                            toast.success(`♻️ Data "${t.title}" berhasil dipulihkan (Restore)!`);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                        >
                          [♻️ Restore]
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            permanentDeleteTrashItem(t.id);
                            toast.success(`🗑️ Data "${t.title}" dihapus permanen`);
                          }}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer"
                        >
                          [🗑️ Hapus Permanen]
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* =========================================================
              15. RIWAYAT PERUBAHAN & REVERT (/sistem/log)
          ========================================================= */}
          {(section === 'log' || section === 'login-log' || section === 'error-log') && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-emerald-700 font-mono font-bold text-[11px]">
                    BAGIAN 11 · /sistem/log · AUDIT TRAIL, SEBELUM VS SESUDAH & REVERT
                  </div>
                  <h2 className="text-base font-bold text-gray-900 mt-0.5">
                    Riwayat Perubahan Sistem (Retention 1 Tahun) — Klik [↩️ Revert] untuk Batalkan Perubahan
                  </h2>
                </div>
                <div className="flex gap-1.5">
                  {(['AUDIT', 'LOGIN', 'ERROR', 'API'] as const).map((tb) => (
                    <button
                      key={tb}
                      type="button"
                      onClick={() => setLogTab(tb)}
                      className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                        logTab === tb ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {tb} LOG
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500">
                      <th className="py-2 pr-2">Waktu</th>
                      <th className="py-2 px-2">User & Device/IP</th>
                      <th className="py-2 px-2">Aksi & Koleksi</th>
                      <th className="py-2 px-2">Sebelum → Sesudah</th>
                      <th className="py-2 pl-2 text-right">Revert</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {adminCrudLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="py-2.5 pr-2 font-mono text-gray-500 whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-2.5 px-2">
                          <div className="font-bold text-gray-900">{log.adminName}</div>
                          <div className="font-mono text-[10px] text-gray-400">IP: 103.144.22.10 · Chrome Web</div>
                        </td>
                        <td className="py-2.5 px-2">
                          <span className="font-mono font-bold text-emerald-700">{log.actionType}</span> ·{' '}
                          <span className="font-semibold">{log.collectionName}</span> ({log.targetId})
                        </td>
                        <td className="py-2.5 px-2 font-mono text-[11px]">
                          <span className="text-gray-500">{log.beforeValue}</span>
                          <span className="mx-1 font-bold text-gray-900">→</span>
                          <span className="font-semibold text-emerald-700">{log.afterValue}</span>
                        </td>
                        <td className="py-2.5 pl-2 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              revertAdminCrudLog(log.id);
                              toast.success(`↩️ Perubahan pada ${log.targetId} berhasil di-revert!`);
                            }}
                            className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-bold hover:bg-blue-100 cursor-pointer"
                          >
                            [↩️ Revert]
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
              16. BACKUP & RESTORE (/sistem/backup)
          ========================================================= */}
          {section === 'backup' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-emerald-700 font-mono font-bold text-[11px]">
                    BAGIAN 12 · /sistem/backup · BACKUP & RESTORE SNAPSHOT (RETENTION 30 HARI)
                  </div>
                  <h2 className="text-base font-bold text-gray-900 mt-0.5">
                    Manajemen Backup Database, Jadwal Otomatis & Restore Snapshot JSON
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoBackupEnabled}
                      onChange={(e) => {
                        setAutoBackupEnabled(e.target.checked);
                        toast.success(
                          e.target.checked
                            ? '✅ Jadwal Auto-Backup Harian diaktifkan'
                            : 'Jadwal Auto-Backup dinonaktifkan'
                        );
                      }}
                      className="accent-emerald-600 w-4 h-4"
                    />
                    <span>Auto-Backup Harian (23:00 WITA)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const snap = createBackupSnapshot();
                      toast.success(`💾 Snapshot "${snap.name}" (${snap.sizeKb} KB) berhasil dibuat!`);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                  >
                    [💾 Backup Sekarang]
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {backupSnapshots.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{b.name}</div>
                      <div className="font-mono text-[11px] text-gray-500">
                        Waktu: {b.createdAt} · Oleh: {b.createdBy} · Tipe: {b.type} · Ukuran: {b.sizeKb} KB ({b.collectionsCount} Koleksi)
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          restoreBackupSnapshot(b.id);
                          toast.success(`♻️ Database berhasil dipulihkan dari snapshot "${b.name}"!`);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg cursor-pointer"
                      >
                        [♻️ Restore]
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const blob = new Blob([b.payloadJson], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${b.id}.json`;
                          a.click();
                          toast.success('📥 File Backup JSON berhasil diunduh');
                        }}
                        className="px-3 py-1.5 border border-gray-300 bg-white hover:bg-gray-100 rounded-lg font-semibold cursor-pointer"
                      >
                        Download JSON
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================
              17. CUSTOM FIELD BUILDER (/sistem/custom-field)
          ========================================================= */}
          {section === 'custom-field' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 text-xs">
              <h2 className="text-base font-bold text-gray-900">
                Custom Field Builder (Tambah Field Baru Tanpa Coding)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <select
                  value={cfModule}
                  onChange={(e) => setCfModule(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option>Marketing - SPR</option>
                  <option>Project - RAB</option>
                  <option>Purchasing - PO</option>
                  <option>HRM - Karyawan</option>
                  <option>Keuangan - Kas</option>
                </select>
                <input
                  type="text"
                  placeholder="Nama Field Baru"
                  value={cfLabel}
                  onChange={(e) => setCfLabel(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />
                <select
                  value={cfType}
                  onChange={(e) => setCfType(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="Text">Text</option>
                  <option value="Number">Number</option>
                  <option value="Date">Date</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (!cfLabel.trim()) return;
                    addCustomField(cfModule, cfLabel, cfType);
                    setCfLabel('');
                    toast.success('✅ Custom field berhasil ditambahkan');
                  }}
                  className="py-2 px-4 bg-emerald-600 text-white font-semibold rounded-lg cursor-pointer"
                >
                  + Tambah Field
                </button>
              </div>
              <div className="divide-y divide-gray-100 pt-2">
                {customFields.map((cf) => (
                  <div key={cf.id} className="py-2.5 flex justify-between">
                    <span className="font-bold text-gray-900">{cf.label}</span>
                    <span className="text-gray-500">
                      Modul: {cf.module} · Tipe: {cf.fieldType}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================
              18. LIMIT APPROVAL (/sistem/limit-approval)
          ========================================================= */}
          {section === 'limit-approval' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 text-xs">
              <h2 className="text-base font-bold text-gray-900">
                Pengaturan Limit Single Approval Direktur & Override Admin
              </h2>
              <div className="flex items-center gap-3 max-w-md">
                <input
                  type="number"
                  value={approvalLimit}
                  onChange={(e) => setApprovalLimit(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => toast.success(`✅ Limit approval disimpan: ${formatRupiah(approvalLimit)}`)}
                  className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg whitespace-nowrap cursor-pointer"
                >
                  Simpan Limit
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              19 & 20. EMAIL TEMPLATES & LOG (/sistem/email-templates & /sistem/email-log)
          ========================================================= */}
          {(section === 'email-settings' || section === 'email-templates' || section === 'email-log') && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    12 Event Email Templates & Trigger Log
                  </h2>
                  <p className="text-gray-500">
                    Anda juga dapat mengedit seluruh Subject, Body & Signature email melalui menu <strong>Edit Semua Teks (Kategori: Email)</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTextCatFilter('Email');
                    navigate('/sistem/edit-teks');
                  }}
                  className="px-3.5 py-2 bg-emerald-600 text-white font-bold rounded-lg cursor-pointer"
                >
                  ✏️ Edit Template Email
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500">
                      <th className="py-2 pr-2">Event Trigger</th>
                      <th className="py-2 px-2">Penerima</th>
                      <th className="py-2 px-2">Subjek Email</th>
                      <th className="py-2 px-2">Waktu</th>
                      <th className="py-2 pl-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {emailLogs.map((m) => (
                      <tr key={m.id}>
                        <td className="py-2.5 pr-2 font-semibold text-gray-900">{m.eventName}</td>
                        <td className="py-2.5 px-2 font-mono text-gray-600">{m.recipient}</td>
                        <td className="py-2.5 px-2">{m.subject}</td>
                        <td className="py-2.5 px-2 font-mono text-gray-500">{m.timestamp}</td>
                        <td className="py-2.5 pl-2 text-right text-emerald-700 font-semibold">{m.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
