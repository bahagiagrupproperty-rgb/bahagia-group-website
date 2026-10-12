import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { SEED_USERS, ASSETS } from '../data/seedData';
import { auth, fbSignOut, getPermissionsForRole } from '../lib/firebase';
import {
  EditableText,
  FloatingEditModeToolbar,
} from './SuperAdminInlineEditor';
import {
  Menu,
  X,
  Search,
  ChevronDown,
  ChevronRight,
  Bell,
  User as UserIcon,
  LogOut,
  Rocket,
  Plus,
  Globe,
  HelpCircle,
  CheckCircle2,
  Copy,
  Sun,
  Moon,
  LayoutDashboard,
  Home,
  Users,
  Megaphone,
  Building2,
  Package,
  CreditCard,
  Wallet,
  FileBarChart,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';

export interface InternalSubMenuItem {
  label: string;
  href: string;
  badgeCount?: number;
  textKey?: string;
}

export interface InternalMenuGroup {
  id: string;
  emoji: string;
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  module: string;
  adminOnly?: boolean;
  badgeCount?: number;
  textKey?: string;
  children?: InternalSubMenuItem[];
}

export const InternalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    currentUser,
    switchQuickRole,
    logout,
    selectedCompanyFilter,
    setCompanyFilter,
    darkMode,
    toggleDarkMode,
    editMode,
    setEditMode,
    verifications,
    purchaseOrders,
    bookings,
    complaints,
    projectSubmissions,
    approvalNotifications,
    markApprovalNotificationRead,
    markAllApprovalNotificationsReadForRole,
    trashItems,
    deployAndPublishLiveState,
    lastDeployedAt,
    lastDeployedVersion,
  } = useAppStore();

  // Responsive check (max-width: 768px)
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  // Mobile drawer open/close state
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Desktop collapsed/expanded state persisted in localStorage
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('bg_erp_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Search menu inside drawer
  const [menuSearch, setMenuSearch] = useState<string>('');

  // Quick Action dropdown in drawer footer & notifications popover
  const [quickActionOpen, setQuickActionOpen] = useState<boolean>(false);
  const [notifOpen, setNotifOpen] = useState<boolean>(false);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);

  // Modals
  const [cmdOpen, setCmdOpen] = useState<boolean>(false);
  const [cmdQuery, setCmdQuery] = useState<string>('');
  const [deployModalOpen, setDeployModalOpen] = useState<boolean>(false);
  const [isDeployingHeader, setIsDeployingHeader] = useState<boolean>(false);
  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(false);

  const handleHeaderDeploy = async () => {
    if (currentUser?.role !== 'ADMIN') {
      toast.error('Fitur Deploy hanya untuk Super Admin.');
      return;
    }
    setIsDeployingHeader(true);
    try {
      const res = await deployAndPublishLiveState();
      setDeployModalOpen(true);
      toast.success(
        `🚀 DEPLOY & PUBLISH BERHASIL! Semua perubahan Web Publik & Internal ERP langsung aktif di Link Presentasi (Versi #${String(res.version).slice(-5)})`
      );
    } catch {
      toast.error('Gagal melakukan deploy, silakan coba lagi.');
    } finally {
      setIsDeployingHeader(false);
    }
  };

  // Touch swipe tracking for left-to-right (open) and right-to-left (close)
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobile && isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isDrawerOpen]);

  // Persist desktop collapsed state
  const handleToggleCollapse = () => {
    if (isMobile) {
      setIsDrawerOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem('bg_erp_sidebar_collapsed', String(next));
        } catch {
          // ignore
        }
        return next;
      });
    }
  };

  // Keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Calculate live notification badges from store
  const waitingDirectorApprovalsCount = useMemo(() => {
    const verCount = verifications.filter(
      (v) => v.status === 'Menunggu Approval Direktur'
    ).length;
    const poCount = purchaseOrders.filter(
      (po) => po.status === 'Menunggu Approval Direktur'
    ).length;
    const subCount = projectSubmissions.filter(
      (s) => s.status === 'Menunggu Approval Direktur'
    ).length;
    return verCount + poCount + subCount;
  }, [verifications, purchaseOrders, projectSubmissions]);

  const waitingPjtCount = useMemo(
    () => verifications.filter((v) => v.status === 'Menunggu Verifikasi PJT').length,
    [verifications]
  );

  const openComplaintsCount = useMemo(
    () => complaints.filter((c) => c.status !== 'Selesai').length,
    [complaints]
  );

  const activeProspectsCount = useMemo(
    () => bookings.filter((b) => b.stage === 'Prospek' || b.stage === 'Follow-up').length,
    [bookings]
  );

  const waitingFinanceVerificationsCount = useMemo(
    () =>
      projectSubmissions.filter((s) => s.status === 'Menunggu Verifikasi Keuangan').length,
    [projectSubmissions]
  );

  const pendingPoCount = useMemo(
    () => purchaseOrders.filter((po) => po.status === 'Menunggu Approval Direktur').length,
    [purchaseOrders]
  );

  // Filter Firestore approvalNotifications relevant to current logged-in role
  const roleRelevantNotifications = useMemo(() => {
    const role = currentUser?.role || 'ADMIN';
    return approvalNotifications.filter((n) => {
      if (role === 'ADMIN') return true;
      return n.targetRole === role || n.targetRole === 'ALL';
    });
  }, [approvalNotifications, currentUser]);

  const unreadRoleNotifCount = useMemo(
    () => roleRelevantNotifications.filter((n) => !n.isRead).length,
    [roleRelevantNotifications]
  );

  const totalNotifCount =
    unreadRoleNotifCount > 0
      ? unreadRoleNotifCount
      : waitingDirectorApprovalsCount +
        waitingFinanceVerificationsCount +
        waitingPjtCount +
        openComplaintsCount;

  // Complete Hierarchical Menu Structure matching specification
  const MENU_STRUCTURE: InternalMenuGroup[] = useMemo(
    () => [
      {
        id: 'dashboard',
        emoji: '📊',
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        module: 'Dashboard',
        textKey: 'menu.sidebar.dashboard',
      },
      {
        id: 'beranda-role',
        emoji: '🏠',
        label: 'Beranda Role',
        href: '/beranda-role',
        icon: Home,
        module: 'Dashboard',
        textKey: 'menu.sidebar.beranda_role',
      },
      {
        id: 'approval',
        emoji: '✅',
        label: 'Single Approval',
        href: '/approval',
        icon: CheckCircle2,
        module: 'Project & PJT',
        badgeCount: waitingDirectorApprovalsCount,
        textKey: 'menu.sidebar.approval',
      },
      {
        id: 'hrm',
        emoji: '👥',
        label: 'HRM',
        icon: Users,
        module: 'HRM',
        textKey: 'menu.sidebar.hrm',
        children: [
          { label: 'Karyawan', href: '/hrm/karyawan' },
          { label: 'Kehadiran', href: '/hrm/kehadiran' },
          { label: 'Payroll', href: '/hrm/payroll' },
          { label: 'Pengumuman', href: '/hrm/pengumuman' },
          { label: 'Pinjaman', href: '/hrm/pinjaman' },
          { label: 'Jam Kerja', href: '/hrm/jam-kerja' },
          { label: 'Hari Libur', href: '/hrm/hari-libur' },
          { label: 'Jadwal Kerja', href: '/hrm/jadwal-kerja' },
        ],
      },
      {
        id: 'marketing',
        emoji: '📢',
        label: 'Marketing',
        icon: Megaphone,
        module: 'Marketing',
        badgeCount: openComplaintsCount,
        textKey: 'menu.sidebar.marketing',
        children: [
          { label: 'Dashboard Marketing', href: '/marketing/dashboard' },
          { label: 'Prospek', href: '/marketing/prospek', badgeCount: activeProspectsCount },
          { label: 'Pipeline (Kanban)', href: '/marketing/pipeline' },
          { label: 'Konsumen', href: '/marketing/konsumen' },
          { label: 'Booking', href: '/marketing/booking' },
          { label: 'Komplain', href: '/marketing/komplain', badgeCount: openComplaintsCount },
          { label: 'SPR', href: '/marketing/spr' },
          { label: 'SPP', href: '/marketing/spp' },
        ],
      },
      {
        id: 'project',
        emoji: '🏢',
        label: 'Project',
        icon: Building2,
        module: 'Project & PJT',
        badgeCount: waitingPjtCount + waitingFinanceVerificationsCount,
        textKey: 'menu.sidebar.project',
        children: [
          { label: 'Lahan', href: '/project/lahan' },
          {
            label: 'Pengajuan Proyek',
            href: '/project/pengajuan-proyek',
            badgeCount: waitingFinanceVerificationsCount,
          },
          { label: 'Penyelesaian Unit', href: '/project/penyelesaian-unit' },
          { label: 'Master Tukang', href: '/project/master-tukang' },
          { label: 'SPK', href: '/project/spk' },
          { label: 'RAB', href: '/project/rab-vs-realisasi' },
          { label: 'Pengajuan Bahan', href: '/project/pengajuan-bahan' },
          { label: 'Progress', href: '/project/progress' },
          {
            label: 'Verifikasi PJT',
            href: '/project/verifikasi',
            badgeCount: waitingPjtCount,
          },
        ],
      },
      {
        id: 'gudang',
        emoji: '📦',
        label: 'Gudang',
        icon: Package,
        module: 'Gudang Logistik',
        textKey: 'menu.sidebar.gudang',
        children: [
          { label: 'Inventori & Kartu Stok', href: '/gudang/stok' },
          { label: 'Supplier', href: '/gudang/supplier' },
          { label: 'Stok Opname', href: '/gudang/stok-opname' },
          { label: 'Penerimaan', href: '/gudang/penerimaan' },
          { label: 'Pengeluaran', href: '/gudang/pengeluaran' },
        ],
      },
      {
        id: 'purchasing',
        emoji: '💳',
        label: 'Purchasing',
        icon: CreditCard,
        module: 'Purchasing',
        badgeCount: pendingPoCount,
        textKey: 'menu.sidebar.purchasing',
        children: [
          { label: 'PO (Purchase Order)', href: '/purchasing/po', badgeCount: pendingPoCount },
          { label: 'Invoice', href: '/purchasing/invoice' },
        ],
      },
      {
        id: 'keuangan',
        emoji: '💰',
        label: 'Keuangan',
        icon: Wallet,
        module: 'Keuangan & COA',
        badgeCount: waitingFinanceVerificationsCount,
        textKey: 'menu.sidebar.keuangan',
        children: [
          { label: 'Dashboard Keuangan', href: '/keuangan/dashboard' },
          { label: 'COA (Bagan Akun)', href: '/keuangan/coa' },
          { label: 'Jurnal', href: '/keuangan/jurnal' },
          { label: 'Kas Masuk', href: '/keuangan/kas-masuk' },
          { label: 'Kas Keluar', href: '/keuangan/kas-keluar' },
          { label: 'Buku Kas Running', href: '/keuangan/buku-kas' },
          { label: 'Hutang', href: '/keuangan/hutang' },
          { label: 'Piutang', href: '/keuangan/piutang' },
          {
            label: 'Pengajuan Dana',
            href: '/keuangan/pengajuan-dana',
            badgeCount: waitingFinanceVerificationsCount,
          },
        ],
      },
      {
        id: 'laporan',
        emoji: '📋',
        label: 'Laporan',
        href: '/laporan',
        icon: FileBarChart,
        module: 'Laporan',
        textKey: 'menu.sidebar.laporan',
      },
      {
        id: 'sistem',
        emoji: '⚙️',
        label: 'Sistem',
        icon: Settings,
        module: 'Sistem Admin',
        adminOnly: true,
        badgeCount: trashItems.length > 0 ? trashItems.length : undefined,
        textKey: 'menu.sidebar.sistem',
        children: [
          { label: 'Super Admin Dashboard', href: '/sistem/dashboard' },
          { label: 'Perusahaan (PT)', href: '/sistem/perusahaan' },
          { label: 'Role & Permission', href: '/sistem/role' },
          { label: 'User Multi-Role', href: '/sistem/user' },
          { label: 'Register User Baru', href: '/register' },
          { label: 'Kavling & Site Plan', href: '/sistem/kavling' },
          { label: 'Catalog Editor', href: '/sistem/catalog-editor' },
          { label: 'Website Editor (CMS)', href: '/sistem/website-editor' },
          { label: 'Testimoni Konsumen', href: '/sistem/testimoni' },
          { label: 'Galeri & Progress', href: '/sistem/galeri' },
          { label: 'Artikel & Berita (Blog)', href: '/sistem/artikel' },
          { label: 'Auto-Sync Proyek Baru', href: '/sistem/proyek' },
          { label: 'Edit Semua Teks (~580)', href: '/sistem/edit-teks' },
          { label: 'Edit Semua Foto', href: '/sistem/foto-manager' },
          { label: 'Data Master', href: '/sistem/data-master' },
          { label: 'Kontrol COA (CRUD)', href: '/sistem/coa-control' },
          { label: 'Data Explorer (55+)', href: '/sistem/data-explorer' },
          { label: 'Custom Field Builder', href: '/sistem/custom-field' },
          { label: 'Limit Approval', href: '/sistem/limit-approval' },
          { label: 'Email Settings', href: '/sistem/email-templates' },
          { label: 'Email Trigger Log', href: '/sistem/email-log' },
          { label: 'Reset Data', href: '/sistem/reset-data' },
          { label: 'Backup & Restore', href: '/sistem/backup' },
          {
            label: 'Trash',
            href: '/sistem/trash',
            badgeCount: trashItems.length > 0 ? trashItems.length : undefined,
          },
          { label: 'Log Aktivitas', href: '/sistem/log' },
        ],
      },
    ],
    [
      waitingDirectorApprovalsCount,
      waitingFinanceVerificationsCount,
      waitingPjtCount,
      openComplaintsCount,
      activeProspectsCount,
      pendingPoCount,
      trashItems.length,
    ]
  );

  // Filter menu groups by user role permissions
  const userPermissions = currentUser ? getPermissionsForRole(currentUser.role) : ['Dashboard'];
  const roleFilteredMenus = useMemo(() => {
    return MENU_STRUCTURE.filter((group) => {
      if (currentUser?.role === 'ADMIN' || currentUser?.role === 'DIREKTUR') return true;
      if (group.adminOnly) return false;
      return userPermissions.includes(group.module);
    });
  }, [MENU_STRUCTURE, currentUser, userPermissions]);

  // Filter menus by search query inside drawer
  const displayedMenus = useMemo(() => {
    const q = menuSearch.trim().toLowerCase();
    if (!q) return roleFilteredMenus;

    return roleFilteredMenus
      .map((group) => {
        const groupMatches = group.label.toLowerCase().includes(q);
        if (!group.children) {
          return groupMatches ? group : null;
        }
        const matchingChildren = group.children.filter((ch) =>
          ch.label.toLowerCase().includes(q)
        );
        if (groupMatches) {
          return group;
        }
        if (matchingChildren.length > 0) {
          return { ...group, children: matchingChildren };
        }
        return null;
      })
      .filter(Boolean) as InternalMenuGroup[];
  }, [roleFilteredMenus, menuSearch]);

  // Expanded submenu state (auto-expand active parent group)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const p = location.pathname;
    return {
      hrm: p.startsWith('/hrm'),
      marketing: p.startsWith('/marketing'),
      project: p.startsWith('/project'),
      gudang: p.startsWith('/gudang'),
      purchasing: p.startsWith('/purchasing'),
      keuangan: p.startsWith('/keuangan'),
      sistem: p.startsWith('/sistem') || p === '/register',
    };
  });

  // Automatically expand parent group when URL changes
  useEffect(() => {
    const p = location.pathname;
    setExpandedGroups((prev) => ({
      ...prev,
      ...(p.startsWith('/hrm') ? { hrm: true } : {}),
      ...(p.startsWith('/marketing') ? { marketing: true } : {}),
      ...(p.startsWith('/project') ? { project: true } : {}),
      ...(p.startsWith('/gudang') ? { gudang: true } : {}),
      ...(p.startsWith('/purchasing') ? { purchasing: true } : {}),
      ...(p.startsWith('/keuangan') ? { keuangan: true } : {}),
      ...(p.startsWith('/sistem') || p === '/register' ? { sistem: true } : {}),
    }));
  }, [location.pathname]);

  const toggleGroupExpand = (groupId: string) => {
    if (isCollapsed && !isMobile) {
      setIsCollapsed(false);
      setExpandedGroups((prev) => ({ ...prev, [groupId]: true }));
      return;
    }
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Check if a menu item or group is active
  const isRouteActive = (href?: string) => {
    if (!href) return false;
    if (location.pathname === href) return true;
    if (href !== '/dashboard' && location.pathname.startsWith(href + '/')) return true;
    return false;
  };

  const isGroupActive = (group: InternalMenuGroup) => {
    if (group.href && isRouteActive(group.href)) return true;
    if (group.children) {
      return group.children.some((ch) => isRouteActive(ch.href));
    }
    return false;
  };

  // Human-readable Breadcrumb segments
  const breadcrumbSegments = useMemo(() => {
    const p = location.pathname;
    for (const grp of MENU_STRUCTURE) {
      if (grp.href === p) {
        return [{ label: grp.label, href: grp.href }];
      }
      if (grp.children) {
        const child = grp.children.find((c) => c.href === p);
        if (child) {
          return [
            { label: grp.label, href: grp.children[0]?.href || '/dashboard' },
            { label: child.label, href: child.href },
          ];
        }
      }
    }
    // Fallback for dynamic sub-routes
    const rawParts = p.split('/').filter(Boolean);
    if (rawParts.length === 0) return [{ label: 'Dashboard', href: '/dashboard' }];
    return rawParts.map((part, idx) => ({
      label: part
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      href: '/' + rawParts.slice(0, idx + 1).join('/'),
    }));
  }, [location.pathname, MENU_STRUCTURE]);

  const handleLogout = async () => {
    try {
      await fbSignOut(auth);
    } catch {
      // ignore
    }
    logout();
    toast.success('Anda telah keluar (Logout) dari sistem.');
    navigate('/login', { replace: true });
  };

  const handleNavigateMenu = (href: string) => {
    navigate(href);
    if (isMobile) {
      setIsDrawerOpen(false);
    }
  };

  // Swipe handlers for mobile drawer
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile || touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY.current);

    // Horizontal swipe must dominate vertical scroll
    if (deltaY < 60) {
      // Swipe from left edge to right -> Open drawer
      if (!isDrawerOpen && touchStartX.current < 48 && deltaX > 65) {
        setIsDrawerOpen(true);
      }
      // Swipe from right to left while drawer is open -> Close drawer
      if (isDrawerOpen && deltaX < -65) {
        setIsDrawerOpen(false);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const QUICK_COMMANDS = [
    { label: 'Buka Dashboard Eksekutif', path: '/dashboard' },
    { label: 'Buka Beranda Alur Kerja Per Role', path: '/beranda-role' },
    { label: 'Single Approval Direktur', path: '/approval' },
    { label: 'HRM — Karyawan, Kehadiran & Payroll', path: '/hrm/karyawan' },
    { label: 'Marketing — Prospek & Pipeline Kanban', path: '/marketing/pipeline' },
    { label: 'Marketing — Daftar Prospek', path: '/marketing/prospek' },
    { label: 'Project — Pengajuan Proyek & RAB PJT', path: '/project/pengajuan-proyek' },
    { label: 'Project — Verifikasi Teknis PJT', path: '/project/verifikasi' },
    { label: 'Project — Progress Fisik & Lahan', path: '/project/progress' },
    { label: 'Gudang — Inventori & Kartu Stok', path: '/gudang/stok' },
    { label: 'Gudang — Database Supplier', path: '/gudang/supplier' },
    { label: 'Purchasing — Purchase Order (PO)', path: '/purchasing/po' },
    { label: 'Keuangan — COA, Jurnal, Kas Masuk & Keluar', path: '/keuangan/dashboard' },
    { label: 'Laporan Lengkap (~65 Laporan)', path: '/laporan' },
    { label: 'Sistem — Kavling & Site Plan Interaktif', path: '/sistem/kavling' },
    { label: 'Sistem — Edit Semua Teks (~580)', path: '/sistem/edit-teks' },
    { label: 'Sistem — Edit Semua Foto', path: '/sistem/foto-manager' },
    { label: 'Sistem — Testimoni, Galeri & Artikel', path: '/sistem/testimoni' },
    { label: 'Lihat Website Publik Bahagia Group Property', path: '/' },
  ];

  const filteredCommands = QUICK_COMMANDS.filter((c) =>
    c.label.toLowerCase().includes(cmdQuery.toLowerCase())
  );

  const effectiveCollapsed = isCollapsed && !isMobile;

  return (
    <div
      className="flex h-screen overflow-hidden bg-[#FAFAFA] text-[#1F2937]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* =====================================================================
          DRAWER / SIDEBAR NAVIGATION (SLIDE FROM LEFT 300ms)
      ===================================================================== */}
      <aside
        className={`fixed md:relative top-0 left-0 h-full bg-white border-r border-gray-200 flex flex-col justify-between transition-all duration-300 ease-in-out z-40 shrink-0 no-print ${
          isMobile
            ? isDrawerOpen
              ? 'translate-x-0 w-[90vw] max-w-[340px] shadow-2xl'
              : '-translate-x-full w-[90vw] max-w-[340px]'
            : effectiveCollapsed
            ? 'w-[64px]'
            : 'w-72'
        }`}
      >
        {/* TOP SECTION: LOGO + CLOSE BUTTON (MOBILE) */}
        <div className="p-3.5 border-b border-gray-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={ASSETS.logoUrl}
              alt="Logo Bahagia Group"
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-lg object-contain bg-emerald-50 border border-emerald-200 p-0.5 shrink-0 cursor-pointer"
              onClick={() => handleNavigateMenu('/dashboard')}
            />
            {!effectiveCollapsed && (
              <div className="min-w-0">
                <Link
                  to="/dashboard"
                  onClick={() => isMobile && setIsDrawerOpen(false)}
                  className="text-sm font-bold tracking-tight text-gray-900 block truncate"
                >
                  Bahagia Group ERP
                </Link>
                <div className="text-[11px] text-emerald-700 font-semibold truncate">
                  {currentUser?.role || 'ADMIN'} · {currentUser?.companyId || 'GROUP'}
                </div>
              </div>
            )}
          </div>

          {isMobile && (
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
              title="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* SEARCH MENU & PINDAH PT DROPDOWN */}
        {!effectiveCollapsed ? (
          <div className="p-3 border-b border-gray-200 space-y-2.5 bg-gray-50/50">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                placeholder="Cari menu (contoh: Kavling, COA)..."
                className="w-full pl-8 pr-7 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-emerald-600"
              />
              {menuSearch && (
                <button
                  type="button"
                  onClick={() => setMenuSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Pindah PT Dropdown */}
            <div>
              <label className="text-[10px] font-mono uppercase text-gray-500 font-bold block mb-1">
                Entitas Perusahaan (Multi-PT):
              </label>
              <select
                value={selectedCompanyFilter}
                onChange={(e) => {
                  setCompanyFilter(e.target.value as any);
                  toast.success(`Filter Entitas diubah ke: ${e.target.value}`);
                }}
                className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white font-semibold text-gray-800 focus:outline-none focus:border-emerald-600"
              >
                <option value="ALL">Konsolidasi Grup (2 PT - 119 Unit)</option>
                <option value="PT_TBL">PT Tata Bahagia Land (97 Unit)</option>
                <option value="PT_BPP">PT Bahagia Prima Property (22 Unit)</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="p-2 border-b border-gray-200 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="p-2 rounded-lg hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 cursor-pointer"
              title="Cari Menu"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* SCROLLABLE NAVIGATION TREE */}
        <nav className="flex-1 overflow-y-auto p-2.5 space-y-1">
          {displayedMenus.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-400">
              Menu &ldquo;{menuSearch}&rdquo; tidak ditemukan.
            </div>
          ) : (
            displayedMenus.map((group) => {
              const Icon = group.icon;
              const hasChildren = Boolean(group.children && group.children.length > 0);
              const isExpanded = Boolean(
                menuSearch.trim() ? true : expandedGroups[group.id]
              );
              const activeGroup = isGroupActive(group);

              if (!hasChildren && group.href) {
                const active = isRouteActive(group.href);
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => handleNavigateMenu(group.href!)}
                    title={effectiveCollapsed ? group.label : undefined}
                    className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      active
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-gray-700 hover:bg-emerald-50/70 hover:text-emerald-800'
                    } ${effectiveCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-4 h-4 shrink-0" />
                      {!effectiveCollapsed && (
                        <span className="truncate">
                          <span className="mr-1.5">{group.emoji}</span>
                          <EditableText
                            textKey={group.textKey || `menu.sidebar.${group.id}`}
                            fallback={group.label}
                            category="Menu"
                            location={`Sidebar Menu - ${group.label}`}
                          />
                        </span>
                      )}
                    </div>

                    {!effectiveCollapsed && group.badgeCount && group.badgeCount > 0 ? (
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full shrink-0 ${
                          active
                            ? 'bg-white text-emerald-700'
                            : 'bg-red-600 text-white'
                        }`}
                      >
                        {group.badgeCount}
                      </span>
                    ) : null}
                  </button>
                );
              }

              // Expandable Parent Group
              return (
                <div key={group.id} className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => toggleGroupExpand(group.id)}
                    title={effectiveCollapsed ? group.label : undefined}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeGroup
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                        : 'text-gray-700 hover:bg-gray-100'
                    } ${effectiveCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          activeGroup ? 'text-emerald-600' : 'text-gray-500'
                        }`}
                      />
                      {!effectiveCollapsed && (
                        <span className="truncate">
                          <span className="mr-1.5">{group.emoji}</span>
                          <EditableText
                            textKey={group.textKey || `menu.sidebar.${group.id}`}
                            fallback={group.label}
                            category="Menu"
                            location={`Sidebar Group - ${group.label}`}
                          />
                        </span>
                      )}
                    </div>

                    {!effectiveCollapsed && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        {group.badgeCount && group.badgeCount > 0 ? (
                          <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-red-600 text-white">
                            {group.badgeCount}
                          </span>
                        ) : null}
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200" />
                        )}
                      </div>
                    )}
                  </button>

                  {/* Submenu Items */}
                  {!effectiveCollapsed && isExpanded && group.children && (
                    <div className="pl-5 pr-1 py-1 space-y-0.5 border-l-2 border-emerald-100 ml-4 transition-all duration-300">
                      {group.children.map((sub, idx) => {
                        const subActive = location.pathname === sub.href;
                        const isLast = idx === group.children!.length - 1;
                        return (
                          <button
                            key={sub.href}
                            type="button"
                            onClick={() => handleNavigateMenu(sub.href)}
                            className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                              subActive
                                ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                                : 'text-gray-600 hover:bg-emerald-50/70 hover:text-emerald-800 font-medium'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <span
                                className={`font-mono text-[10px] ${
                                  subActive ? 'text-emerald-200' : 'text-gray-300'
                                }`}
                              >
                                {isLast ? '└──' : '├──'}
                              </span>
                              <span className="truncate">{sub.label}</span>
                            </div>

                            {sub.badgeCount && sub.badgeCount > 0 ? (
                              <span
                                className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full shrink-0 ${
                                  subActive
                                    ? 'bg-white text-emerald-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {sub.badgeCount}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </nav>

        {/* BOTTOM DRAWER: QUICK ACTION + WEB PUBLIK + USER INFO + LOGOUT */}
        <div className="p-3 border-t border-gray-200 bg-gray-50/60 space-y-2.5">
          {!effectiveCollapsed ? (
            <>
              {/* Quick Action Button [+ Tambah Cepat] */}
              <div className="relative">
                {quickActionOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-xl p-2 space-y-1 text-xs z-50">
                    <div className="px-2 py-1 font-bold text-gray-900 border-b border-gray-100 flex items-center justify-between">
                      <span>⚡ Tambah Cepat</span>
                      <button
                        type="button"
                        onClick={() => setQuickActionOpen(false)}
                        className="text-gray-400 hover:text-gray-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setQuickActionOpen(false);
                        handleNavigateMenu('/marketing/prospek');
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 rounded-lg font-medium cursor-pointer"
                    >
                      + Tambah Prospek Baru
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setQuickActionOpen(false);
                        handleNavigateMenu('/purchasing/po');
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 rounded-lg font-medium cursor-pointer"
                    >
                      + Tambah PO Material
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setQuickActionOpen(false);
                        handleNavigateMenu('/sistem/kavling');
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 rounded-lg font-medium cursor-pointer"
                    >
                      + Tambah / Edit Kavling
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setQuickActionOpen(false);
                        handleNavigateMenu('/keuangan/kas-masuk');
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 rounded-lg font-medium cursor-pointer"
                    >
                      + Catat Kas Masuk / Keluar
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuickActionOpen((p) => !p)}
                    className="py-2 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Cepat</span>
                  </button>
                  <Link
                    to="/"
                    onClick={() => isMobile && setIsDrawerOpen(false)}
                    className="py-2 px-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Web Publik</span>
                  </Link>
                </div>
              </div>

              {/* User Profile Card + Logout */}
              <div className="pt-2 border-t border-gray-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {(currentUser?.name || 'AD')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {currentUser?.name || 'Super Admin'}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-medium truncate">
                      {currentUser?.role === 'ADMIN' ? 'Super Admin' : currentUser?.role}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 transition-colors shrink-0 cursor-pointer"
                  title="Logout / Keluar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsCollapsed(false);
                  setQuickActionOpen(true);
                }}
                className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center cursor-pointer"
                title="Tambah Cepat"
              >
                <Plus className="w-4 h-4" />
              </button>
              <Link
                to="/"
                className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-emerald-600 flex items-center justify-center"
                title="Buka Website Publik"
              >
                <Globe className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-9 h-9 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 flex items-center justify-center cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* =====================================================================
          BACKDROP BLUR (MOBILE ONLY)
      ===================================================================== */}
      {isMobile && isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-30 transition-opacity duration-300 no-print"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* =====================================================================
          MAIN CONTENT AREA (HEADER + BREADCRUMB + VIEWPORT)
      ===================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 z-20 shrink-0 no-print">
          {/* Top Bar: [☰] Bahagia Group ERP ... [🔔] [👤 Admin] [🚀 Deploy] [🚪] */}
          <div className="h-15 px-4 sm:px-6 flex items-center justify-between gap-3">
            {/* Left: Hamburger Button + Brand Title */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={handleToggleCollapse}
                className="p-2 rounded-xl border border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 text-gray-700 hover:text-emerald-800 transition-colors cursor-pointer shrink-0"
                title={
                  isMobile
                    ? 'Buka Menu Navigasi'
                    : isCollapsed
                    ? 'Perluas Sidebar'
                    : 'Kecilkan Sidebar'
                }
                aria-label="Toggle Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    to="/dashboard"
                    className="text-sm sm:text-base font-extrabold text-gray-900 tracking-tight truncate"
                  >
                    Bahagia Group ERP
                  </Link>
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {selectedCompanyFilter === 'ALL'
                      ? 'KONSOLIDASI 2 PT'
                      : selectedCompanyFilter}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Actions: Ctrl+K, Inline Edit, Bell Notification, User Role Switcher, Deploy, Logout */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setCmdOpen(true)}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-xl text-xs text-gray-500 hover:border-gray-300 bg-gray-50 cursor-pointer"
                title="Pencarian Cepat (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Cari...</span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-gray-200 rounded">
                  Ctrl+K
                </kbd>
              </button>

              {/* Inline Edit Mode Toggle for Super Admin */}
              {currentUser?.role === 'ADMIN' && (
                <button
                  type="button"
                  onClick={() => {
                    const next = !editMode;
                    setEditMode(next);
                    toast.success(
                      next
                        ? '✏️ Edit Mode ON: Klik teks atau foto mana saja untuk mengedit langsung!'
                        : '✏️ Edit Mode OFF'
                    );
                  }}
                  className={`hidden sm:inline-flex px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors whitespace-nowrap cursor-pointer ${
                    editMode
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  {editMode ? '✏️ Edit ON' : '✏️ Edit Teks/Foto'}
                </button>
              )}

              {/* Notification Bell [🔔] */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen((p) => !p);
                    setUserMenuOpen(false);
                  }}
                  className="relative p-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 cursor-pointer"
                  title="Notifikasi Sistem"
                >
                  <Bell className="w-4 h-4" />
                  {totalNotifCount > 0 && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-red-600 text-white text-[10px] font-mono font-bold rounded-full">
                      {totalNotifCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-96 max-w-[92vw] bg-white border border-gray-200 rounded-2xl shadow-xl p-3.5 space-y-2.5 text-xs z-50">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <div>
                        <span className="font-bold text-gray-900 block">
                          🔔 Alert Approval & Verifikasi ({totalNotifCount})
                        </span>
                        <span className="text-[10px] text-emerald-700 font-mono">
                          Role Aktif: {currentUser?.role || 'ADMIN'} · Real-Time Firestore
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadRoleNotifCount > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              markAllApprovalNotificationsReadForRole(currentUser?.role);
                              toast.success('Semua notifikasi untuk role ini ditandai sudah dibaca');
                            }}
                            className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                          >
                            Tandai Semua Dibaca
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setNotifOpen(false)}
                          className="text-gray-400 hover:text-gray-700"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Ringkasan Antrean Berdasarkan Role */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setNotifOpen(false);
                          navigate('/approval');
                        }}
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-left cursor-pointer"
                      >
                        <div className="text-[10px] text-red-700 font-semibold">Approval Direktur</div>
                        <div className="text-sm font-mono font-bold text-red-800">
                          {waitingDirectorApprovalsCount} Item
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNotifOpen(false);
                          navigate('/project/pengajuan-proyek');
                        }}
                        className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left cursor-pointer"
                      >
                        <div className="text-[10px] text-amber-800 font-semibold">Verifikasi Keuangan</div>
                        <div className="text-sm font-mono font-bold text-amber-900">
                          {waitingFinanceVerificationsCount} Item
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNotifOpen(false);
                          navigate('/project/verifikasi');
                        }}
                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left cursor-pointer"
                      >
                        <div className="text-[10px] text-emerald-800 font-semibold">Verifikasi PJT</div>
                        <div className="text-sm font-mono font-bold text-emerald-900">
                          {waitingPjtCount} Item
                        </div>
                      </button>
                    </div>

                    {/* Daftar Alert Real-Time dari Firestore untuk Role yang Menyetujui */}
                    <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                      {roleRelevantNotifications.length === 0 ? (
                        <div className="py-6 text-center text-gray-400 italic">
                          Belum ada alert pengajuan untuk role {currentUser?.role}
                        </div>
                      ) : (
                        roleRelevantNotifications.slice(0, 8).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markApprovalNotificationRead(n.id);
                              setNotifOpen(false);
                              navigate(n.actionPath || '/approval');
                            }}
                            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                              n.isRead
                                ? 'bg-gray-50/70 border-gray-100 text-gray-600'
                                : 'bg-emerald-50/70 border-emerald-200 text-gray-900 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  n.targetRole === 'DIREKTUR'
                                    ? 'bg-red-100 text-red-700'
                                    : n.targetRole === 'KEUANGAN'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                UNTUK: {n.targetRole}
                              </span>
                              <span className="text-[10px] font-mono text-gray-400">
                                {n.createdAt}
                              </span>
                            </div>
                            <div className="font-bold text-xs text-gray-900 mt-1 flex items-center justify-between gap-1">
                              <span className="truncate">{n.title}</span>
                              {!n.isRead && (
                                <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5">
                              {n.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile / Role Switcher [👤 Admin] */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen((p) => !p);
                    setNotifOpen(false);
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs font-semibold text-gray-800 flex items-center gap-1.5 cursor-pointer"
                  title="Profil & Ganti Role"
                >
                  <UserIcon className="w-4 h-4 text-emerald-600" />
                  <span className="hidden md:inline max-w-[110px] truncate">
                    {currentUser?.role || 'Admin'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 space-y-2.5 text-xs z-50">
                    <div className="border-b border-gray-100 pb-2">
                      <div className="font-bold text-gray-900">{currentUser?.name}</div>
                      <div className="text-[11px] text-gray-500">{currentUser?.email}</div>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-gray-400 font-bold block mb-1">
                        Simulasi Pindah Role Cepat:
                      </label>
                      <select
                        value={currentUser?.id || ''}
                        onChange={(e) => {
                          switchQuickRole(e.target.value);
                          setUserMenuOpen(false);
                          toast.success('Berhasil berganti akun role aktif');
                        }}
                        className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-gray-50 font-medium text-gray-800"
                      >
                        {SEED_USERS.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.role} · {u.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => {
                          toggleDarkMode();
                          setUserMenuOpen(false);
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-1 text-gray-700 cursor-pointer"
                      >
                        {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                        <span>Tema</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          setOnboardingOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-1 text-gray-700 cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Panduan</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* DEPLOY BUTTON — HANYA UNTUK SUPER ADMIN */}
              {currentUser?.role === 'ADMIN' && (
                <button
                  type="button"
                  disabled={isDeployingHeader}
                  onClick={handleHeaderDeploy}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-extrabold rounded-xl flex items-center gap-1.5 shadow-sm ring-2 ring-amber-300/60 transition-all whitespace-nowrap cursor-pointer"
                  title="Publish & Deploy Langsung ke Link Web / Presentasi (Khusus Super Admin)"
                >
                  <Rocket className={`w-3.5 h-3.5 ${isDeployingHeader ? 'animate-bounce' : ''}`} />
                  <span>{isDeployingHeader ? 'Deploying...' : '🚀 Deploy & Publish'}</span>
                </button>
              )}

              {/* LOGOUT BUTTON [🚪] */}
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 sm:px-3 sm:py-1.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Logout (Keluar)"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Sub-Header Bar: Breadcrumb: Sistem > Kavling */}
          <div className="px-4 sm:px-6 py-2 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-gray-500 truncate">
              <span className="text-gray-400 font-medium">Breadcrumb:</span>
              <Link to="/dashboard" className="hover:text-emerald-700 font-medium text-gray-700">
                ERP
              </Link>
              {breadcrumbSegments.map((seg, idx) => (
                <React.Fragment key={seg.href + idx}>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <Link
                    to={seg.href}
                    className={`truncate ${
                      idx === breadcrumbSegments.length - 1
                        ? 'font-bold text-emerald-700'
                        : 'text-gray-600 hover:text-emerald-700 font-medium'
                    }`}
                  >
                    {seg.label}
                  </Link>
                </React.Fragment>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-2 text-[11px] text-gray-400 font-mono shrink-0">
              <span>{location.pathname}</span>
            </div>
          </div>
        </header>

        {/* Scrollable Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24">
          <div className="max-w-7xl w-full mx-auto">{children}</div>
        </main>

        <FloatingEditModeToolbar />
      </div>

      {/* =====================================================================
          COMMAND PALETTE MODAL (Ctrl+K)
      ===================================================================== */}
      {cmdOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20 p-4"
          onClick={() => setCmdOpen(false)}
        >
          <div
            className="bg-white border border-gray-200 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3.5 border-b border-gray-200 flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                autoFocus
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
                placeholder="Ketik nama halaman, fitur, atau modul (Ctrl+K)..."
                className="w-full text-xs outline-none"
              />
              <button
                type="button"
                onClick={() => setCmdOpen(false)}
                className="text-xs text-gray-400 hover:text-gray-700"
              >
                ESC
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredCommands.map((cmd) => (
                <button
                  key={cmd.path}
                  type="button"
                  onClick={() => {
                    setCmdOpen(false);
                    navigate(cmd.path);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-emerald-50 text-xs flex items-center justify-between cursor-pointer"
                >
                  <span className="font-medium text-gray-900">{cmd.label}</span>
                  <span className="font-mono text-[11px] text-emerald-700">{cmd.path}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          DEPLOY TO LIVE PRESENTATION & CLOUD MODAL
      ===================================================================== */}
      {deployModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setDeployModalOpen(false)}
        >
          <div
            className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    ✅ Publish &amp; Deploy Live Berhasil!
                  </h3>
                  <p className="text-[11px] text-emerald-700 font-semibold">
                    Sinkronisasi Real-Time Server &amp; Cloud Aktif · Versi #{String(lastDeployedVersion || Date.now()).slice(-6)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeployModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-600">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-emerald-950">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Semua Perubahan Web Publik &amp; Internal ERP Telah Live!</span>
                </div>
                <p>
                  Apapun yang Anda ubah/edit di Web Publik maupun Internal ERP kini langsung tersimpan di Server &amp; Cloud Database sehingga link presentasi ke Bos Anda selalu menampilkan versi paling baru secara real-time.
                </p>
                {lastDeployedAt && (
                  <p className="text-[10px] font-mono text-emerald-800 pt-1">
                    Waktu Deploy Terakhir: {lastDeployedAt}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5">
                  <div className="font-bold text-gray-900 flex items-center justify-between">
                    <span>1️⃣ Link Presentasi Live (Real-Time Auto-Sync)</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                      UTAMA
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-gray-800 bg-white p-2 rounded border border-gray-200 break-all">
                    {typeof window !== 'undefined' ? window.location.origin : ''}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.origin);
                      toast.success('✅ Link Presentasi Live berhasil disalin ke clipboard!');
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Link Presentasi Live</span>
                  </button>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5">
                  <div className="font-bold text-gray-900">
                    2️⃣ Link Publik Shared (Cloud Synced)
                  </div>
                  <div className="font-mono text-[11px] text-gray-800 bg-white p-2 rounded border border-gray-200 break-all">
                    {typeof window !== 'undefined'
                      ? window.location.origin.replace('ais-dev-', 'ais-pre-')
                      : ''}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const sharedUrl = window.location.origin.replace('ais-dev-', 'ais-pre-');
                      navigator.clipboard?.writeText(sharedUrl);
                      toast.success('✅ Link Publik Shared berhasil disalin ke clipboard!');
                    }}
                    className="w-full py-2 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Link Publik Shared</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <button
                  type="button"
                  disabled={isDeployingHeader}
                  onClick={handleHeaderDeploy}
                  className="px-4 py-2 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold rounded-xl cursor-pointer"
                >
                  🔄 Push Ulang Sekarang
                </button>
                <button
                  type="button"
                  onClick={() => setDeployModalOpen(false)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Selesai &amp; Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ONBOARDING & HELP MODAL
      ===================================================================== */}
      {onboardingOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setOnboardingOpen(false)}
        >
          <div
            className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                Panduan Navigasi Hamburger Drawer — Bahagia Group ERP
              </h3>
              <button
                type="button"
                onClick={() => setOnboardingOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5 text-gray-600 leading-relaxed">
              <p>
                <strong>1. Tombol Hamburger [☰]:</strong> Klik ikon <code>[☰]</code> di kiri atas header untuk membuka/menutup drawer di mobile atau mengecilkan/memperluas sidebar di desktop.
              </p>
              <p>
                <strong>2. Cari Menu &amp; Submenu:</strong> Gunakan kotak pencarian di bagian atas drawer untuk memfilter seluruh menu dan 24 sub-menu Sistem secara instan.
              </p>
              <p>
                <strong>3. Swipe Gesture (Mobile):</strong> Geser jari dari tepi kiri ke kanan untuk membuka drawer, atau geser ke kiri untuk menutupnya.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOnboardingOpen(false)}
              className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
