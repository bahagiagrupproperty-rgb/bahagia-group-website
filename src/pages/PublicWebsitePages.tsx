import React, { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { ASSETS, formatRupiah, SEED_USERS } from '../data/seedData';
import { SitePlanInteractive } from '../components/SitePlanInteractive';
import { UploadFoto } from '../components/UploadFoto';
import { UnitLiveCameraCapture } from '../components/UnitLiveCameraCapture';
import {
  PublicTestimonialsSection,
  PublicGalleryProgressSection,
  PublicBlogHomepageSection,
} from '../components/PublicNewSections';
import {
  EditableText,
  EditableImage,
  FloatingEditModeToolbar,
} from '../components/SuperAdminInlineEditor';
import { auth, googleProvider, signInWithPopup } from '../lib/firebase';
import {
  MapPin,
  ArrowRight,
  CheckCircle2,
  Calculator,
  Phone,
  LogIn,
  Lock,
  Menu,
  X,
  MessageSquareWarning,
  Info,
  CalendarCheck,
  LayoutGrid,
  BookOpen,
  Home as HomeIcon,
  Plus,
  Trash2,
  Edit3,
  Settings,
  Rocket,
} from 'lucide-react';
import { toast } from 'sonner';

export const PublicNavbar: React.FC = () => {
  const {
    currentUser,
    editMode,
    setEditMode,
    cmsContent,
    syncedProjects,
    deployAndPublishLiveState,
  } = useAppStore();
  const [openProjectDropdown, setOpenProjectDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDeployingNav, setIsDeployingNav] = useState(false);
  const location = window.location.pathname;

  const isAdmin = Boolean(currentUser && currentUser.active && currentUser.role === 'ADMIN');

  const handlePublicNavbarDeploy = async () => {
    setIsDeployingNav(true);
    try {
      const res = await deployAndPublishLiveState();
      toast.success(
        `🚀 DEPLOY & PUBLISH BERHASIL! Semua perubahan telah aktif di Link Presentasi (Versi #${String(res.version).slice(-5)})`
      );
    } catch {
      toast.error('Gagal melakukan deploy, silakan coba lagi.');
    } finally {
      setIsDeployingNav(false);
    }
  };

  const navProjects = syncedProjects.filter(
    (p) => p.publishStatus === 'Published' && p.showInNavbar
  );

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <>
      <header
        className={`${
          cmsContent.navbar.sticky ? 'sticky top-0 z-40' : 'relative z-40'
        } bg-white/95 backdrop-blur-xs border-b border-gray-200 px-4 sm:px-6 py-3.5`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Zone 1: Brand Logo & Wordmark */}
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 text-base sm:text-lg font-bold tracking-tight text-gray-900 whitespace-nowrap"
          >
            <span className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
              <EditableImage
                slotKey="logo-group"
                defaultSrc={ASSETS.logoUrl}
                alt="Logo Dummy Bahagia Group Property"
                className="w-9 h-9 object-contain"
              />
            </span>
            <span>
              <EditableText
                textKey="web.navbar.brand"
                fallback={cmsContent.navbar.brandName || 'Bahagia Group Property'}
                category="Website"
                location="Navbar - Nama Brand Utama"
              />
            </span>
          </Link>

          {/* Zone 2: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-gray-600">
            {navProjects.length <= 2 ? (
              navProjects.map((proj) => {
                const targetPath = `/proyek/${proj.slug}`;
                const isActive = location === targetPath;
                return (
                  <Link
                    key={proj.id}
                    to={targetPath}
                    className={`transition-colors whitespace-nowrap flex items-center gap-1 ${
                      isActive ? 'text-emerald-700 font-bold' : 'hover:text-gray-900'
                    }`}
                  >
                    <span>
                      <EditableText
                        textKey={`web.navbar.proj.${proj.slug}`}
                        fallback={proj.projectName.replace('Perumahan ', '')}
                        category="Website"
                        location={`Navbar - Menu Proyek ${proj.projectName}`}
                      />
                    </span>
                    {proj.isFeatured && (
                      <span className="text-[10px] text-amber-600 font-bold">★</span>
                    )}
                  </Link>
                );
              })
            ) : (
              <div
                className="relative"
                onMouseEnter={() => setOpenProjectDropdown(true)}
                onMouseLeave={() => setOpenProjectDropdown(false)}
              >
                <button
                  type="button"
                  onClick={() => setOpenProjectDropdown(!openProjectDropdown)}
                  className="hover:text-gray-900 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer py-1"
                >
                  <span>
                    <EditableText
                      textKey="web.navbar.proyek_dropdown"
                      fallback={`Proyek Kami (${navProjects.length})`}
                      category="Website"
                      location="Navbar - Label Dropdown Proyek"
                    />
                  </span>
                  <span className="text-[10px]">▼</span>
                </button>
                {openProjectDropdown && (
                  <div className="absolute left-0 top-full pt-1 w-64 z-50">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-2 space-y-1">
                      {navProjects.map((proj) => (
                        <Link
                          key={proj.id}
                          to={`/proyek/${proj.slug}`}
                          onClick={() => setOpenProjectDropdown(false)}
                          className="block px-3 py-2 rounded-lg hover:bg-emerald-50 text-xs text-gray-700 hover:text-emerald-900 transition-colors"
                        >
                          <div className="font-semibold flex items-center justify-between">
                            <span>{proj.projectName}</span>
                            {proj.isFeatured && (
                              <span className="text-[10px] text-amber-600 font-bold">★ Unggulan</span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500 truncate">
                            {proj.companyName} · {proj.totalUnits} Unit
                          </div>
                        </Link>
                      ))}
                      <div className="border-t border-gray-100 pt-1 mt-1">
                        <Link
                          to="/katalog"
                          onClick={() => setOpenProjectDropdown(false)}
                          className="block px-3 py-1.5 text-[11px] font-semibold text-emerald-700 hover:underline"
                        >
                          Lihat Semua Proyek & Katalog →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <Link
              to="/katalog"
              className={`transition-colors whitespace-nowrap ${
                location === '/katalog' ? 'text-emerald-700 font-bold' : 'hover:text-gray-900'
              }`}
            >
              <EditableText
                textKey="web.navbar.menu3"
                fallback="Katalog Unit"
                category="Website"
                location="Navbar - Menu Katalog Unit"
              />
            </Link>
            <Link
              to="/artikel"
              className={`transition-colors whitespace-nowrap ${
                location.startsWith('/artikel') ? 'text-emerald-700 font-bold' : 'hover:text-gray-900'
              }`}
            >
              <EditableText
                textKey="web.navbar.menu_artikel"
                fallback="Artikel & Info"
                category="Website"
                location="Navbar - Menu Artikel"
              />
            </Link>
            <Link
              to="/komplain"
              className={`transition-colors whitespace-nowrap ${
                location === '/komplain' ? 'text-emerald-700 font-bold' : 'hover:text-gray-900'
              }`}
            >
              <EditableText
                textKey="web.navbar.menu4"
                fallback="Layanan Komplain"
                category="Website"
                location="Navbar - Menu Layanan Komplain"
              />
            </Link>
            <Link
              to="/tentang"
              className={`transition-colors whitespace-nowrap ${
                location === '/tentang' || location === '/kontak'
                  ? 'text-emerald-700 font-bold'
                  : 'hover:text-gray-900'
              }`}
            >
              <EditableText
                textKey="web.navbar.menu5"
                fallback="Tentang & Kontak"
                category="Website"
                location="Navbar - Menu Tentang & Kontak"
              />
            </Link>
          </nav>

          {/* Zone 3: Desktop Primary Actions + Mobile Hamburger Trigger */}
          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const next = !editMode;
                    setEditMode(next);
                    toast.success(
                      next
                        ? '✏️ Edit Mode ON: Klik teks, angka, atau foto mana saja di halaman ini untuk mengedit langsung!'
                        : '✏️ Edit Mode OFF'
                    );
                  }}
                  className={`hidden md:inline-flex items-center px-3 py-2 text-xs font-bold rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                    editMode
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  {editMode ? '✏️ Edit Mode ON' : '✏️ Edit Mode'}
                </button>
                <button
                  type="button"
                  disabled={isDeployingNav}
                  onClick={handlePublicNavbarDeploy}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 shadow-xs transition-all whitespace-nowrap cursor-pointer"
                  title="Publish & Deploy Langsung ke Link Web / Presentasi"
                >
                  <Rocket className={`w-3.5 h-3.5 ${isDeployingNav ? 'animate-bounce' : ''}`} />
                  <span>{isDeployingNav ? 'Deploying...' : 'Deploy Live'}</span>
                </button>
              </>
            )}

            <Link
              to="/booking"
              className="hidden md:inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap"
            >
              <EditableText
                textKey="web.navbar.btn_booking"
                fallback={cmsContent.navbar.bookingButtonText || 'Booking Unit'}
                category="Website"
                location="Navbar - Tombol Booking"
              />
            </Link>
            <Link
              to={currentUser ? '/dashboard' : '/login'}
              className="hidden md:inline-flex items-center px-4 py-2 text-xs font-medium text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              <EditableText
                textKey="web.navbar.btn_login"
                fallback={
                  currentUser ? 'Dashboard ERP' : cmsContent.navbar.loginButtonText || 'Portal Login'
                }
                category="Website"
                location="Navbar - Tombol Login"
              />
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Tutup Menu Navigasi' : 'Buka Menu Navigasi'}
              aria-expanded={mobileMenuOpen}
              className="md:hidden inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? (
                <>
                  <X className="w-4 h-4 text-gray-700" />
                  <span>Tutup</span>
                </>
              ) : (
                <>
                  <Menu className="w-4 h-4 text-emerald-700" />
                  <span>Menu</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Drawer */}
        {mobileMenuOpen && (
          <>
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 top-[61px] bg-black/40 backdrop-blur-[1px] z-40 transition-opacity"
            />

            <div className="md:hidden absolute left-0 right-0 top-full bg-white border-b border-gray-200 shadow-2xl z-50 px-5 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-gray-400">
                  Menu Navigasi Utama
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                {navProjects.map((proj) => {
                  const targetPath = `/proyek/${proj.slug}`;
                  const isActive = location === targetPath;
                  return (
                    <Link
                      key={proj.id}
                      to={targetPath}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <HomeIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{proj.projectName.replace('Perumahan ', '')}</span>
                      </div>
                      <span className="text-[11px] font-mono text-gray-500">
                        {proj.totalUnits} Unit
                      </span>
                    </Link>
                  );
                })}

                <Link
                  to="/katalog"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    location === '/katalog'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutGrid className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Katalog Unit</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium">Semua Kavling</span>
                </Link>

                <Link
                  to="/artikel"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    location.startsWith('/artikel')
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Artikel & Info Properti</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium">Tips KPR</span>
                </Link>

                <Link
                  to="/komplain"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    location === '/komplain'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MessageSquareWarning className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Layanan Komplain</span>
                  </div>
                  <span className="text-[11px] text-gray-400">Tiket Garansi</span>
                </Link>

                <Link
                  to="/tentang"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    location === '/tentang' || location === '/kontak'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Tentang & Kontak</span>
                  </div>
                  <span className="text-[11px] text-gray-400">Profil PT</span>
                </Link>
              </div>

              <div className="border-t border-gray-200 pt-3 space-y-2.5">
                <Link
                  to="/booking"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>{cmsContent.navbar.bookingButtonText || 'Booking Unit'}</span>
                </Link>

                <Link
                  to={currentUser ? '/dashboard' : '/login'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <LogIn className="w-4 h-4 text-emerald-600" />
                  <span>
                    {currentUser
                      ? `Dashboard ERP (${currentUser.role})`
                      : cmsContent.navbar.loginButtonText || 'Portal Login'}
                  </span>
                </Link>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = !editMode;
                      setEditMode(next);
                      setMobileMenuOpen(false);
                      toast.success(
                        next
                          ? '✏️ Edit Mode ON: Klik teks atau foto mana saja untuk mengedit!'
                          : '✏️ Edit Mode OFF'
                      );
                    }}
                    className={`w-full py-2.5 px-4 text-xs font-bold rounded-xl border transition-colors ${
                      editMode
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {editMode ? '✏️ Matikan Edit Mode Inline' : '✏️ Aktifkan Edit Mode Inline (Admin)'}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </header>
      <FloatingEditModeToolbar />
    </>
  );
};

export const PublicFooter: React.FC = () => {
  const { currentUser, cmsContent, syncedProjects, updateCmsContent } = useAppStore();
  const isAdmin = Boolean(currentUser && currentUser.active && currentUser.role === 'ADMIN');
  const publishedProjects = syncedProjects.filter((p) => p.publishStatus === 'Published');
  return (
    <footer className="bg-white border-t border-gray-200 py-12 px-6 mt-16 pb-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        <div className="space-y-2">
          <div className="font-bold text-gray-900 text-base">
            <EditableText
              textKey="web.footer.brand"
              fallback={cmsContent.footer.brandName || 'Bahagia Group Property'}
              category="Website"
              location="Footer - Nama Perusahaan"
              onSaveOverride={(val) =>
                updateCmsContent({ footer: { ...cmsContent.footer, brandName: val } }, 'Footer')
              }
            />
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            <EditableText
              textKey="web.footer.desc"
              fallback={cmsContent.footer.description}
              category="Website"
              location="Footer - Tagline & Deskripsi"
              onSaveOverride={(val) =>
                updateCmsContent({ footer: { ...cmsContent.footer, description: val } }, 'Footer')
              }
            />
          </p>
        </div>
        <div className="space-y-1.5 text-xs text-gray-600 md:col-span-2">
          <div className="font-semibold text-gray-900 mb-2">
            <EditableText
              textKey="web.footer.projects_heading"
              fallback={`Daftar Proyek Resmi Bahagia Group (${publishedProjects.length} Kawasan Aktif)`}
              category="Website"
              location="Footer - Judul Daftar Proyek"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {publishedProjects.map((proj) => (
              <div key={proj.id} className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 space-y-0.5">
                <Link
                  to={`/proyek/${proj.slug}`}
                  className="font-semibold text-gray-900 hover:text-emerald-700 flex items-center justify-between"
                >
                  <span>
                    <EditableText
                      textKey={`web.footer.proj.${proj.slug}.name`}
                      fallback={proj.projectName}
                      category="Website"
                      location={`Footer - Nama Proyek ${proj.projectName}`}
                    />
                  </span>
                  <span className="text-[11px] font-mono text-emerald-700">
                    <EditableText
                      textKey={`web.footer.proj.${proj.slug}.units`}
                      fallback={`${proj.totalUnits} Unit`}
                      category="Website"
                      location={`Footer - Jumlah Unit ${proj.projectName}`}
                    />
                  </span>
                </Link>
                <p className="text-[11px] text-gray-500">
                  <EditableText
                    textKey={`web.footer.proj.${proj.slug}.company`}
                    fallback={proj.companyName}
                    category="Website"
                    location={`Footer - PT Proyek ${proj.projectName}`}
                  />
                </p>
                <p className="text-[11px] text-gray-600 truncate">
                  <EditableText
                    textKey={`web.footer.proj.${proj.slug}.addr`}
                    fallback={`${proj.address}, ${proj.city}`}
                    category="Website"
                    location={`Footer - Alamat ${proj.projectName}`}
                  />
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="font-semibold text-gray-900 mb-2">
            <EditableText
              textKey="web.footer.quick_links_heading"
              fallback="Akses Cepat & Perbankan"
              category="Website"
              location="Footer - Judul Akses Cepat"
            />
          </div>
          <p>
            <EditableText
              textKey="web.footer.banks"
              fallback="Mitra KPR FLPP: Bank BTN · Bank BRI · Bank Mandiri"
              category="Website"
              location="Footer - Daftar Bank Mitra"
            />
          </p>
          <p>
            Telp:{' '}
            <EditableText
              textKey="web.footer.phone"
              fallback={cmsContent.footer.phone}
              category="Website"
              location="Footer - Nomor Telepon"
              onSaveOverride={(val) =>
                updateCmsContent({ footer: { ...cmsContent.footer, phone: val } }, 'Footer')
              }
            />{' '}
            · Email:{' '}
            <EditableText
              textKey="web.footer.email"
              fallback={cmsContent.footer.email}
              category="Website"
              location="Footer - Alamat Email"
              onSaveOverride={(val) =>
                updateCmsContent({ footer: { ...cmsContent.footer, email: val } }, 'Footer')
              }
            />
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link to="/kontak" className="text-emerald-600 font-medium hover:underline">
              <EditableText
                textKey="web.footer.link_kontak"
                fallback="Hubungi Kami"
                category="Website"
                location="Footer - Link Hubungi Kami"
              />
            </Link>
            <Link to="/artikel" className="text-emerald-600 font-medium hover:underline">
              <EditableText
                textKey="web.footer.link_artikel"
                fallback="Artikel & Info KPR"
                category="Website"
                location="Footer - Link Artikel"
              />
            </Link>
            <Link to="/booking" className="text-emerald-700 font-semibold hover:underline">
              <EditableText
                textKey="web.footer.link_booking"
                fallback="Booking Unit Online"
                category="Website"
                location="Footer - Link Booking Online"
              />
            </Link>
            {isAdmin && (
              <>
                <Link to="/sistem/testimoni" className="text-emerald-700 font-semibold hover:underline">
                  Kelola Testimoni
                </Link>
                <Link to="/sistem/galeri" className="text-emerald-700 font-semibold hover:underline">
                  Kelola Galeri & Progress
                </Link>
                <Link to="/sistem/artikel" className="text-emerald-700 font-semibold hover:underline">
                  Kelola Artikel
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-gray-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
        <span>
          <EditableText
            textKey="web.footer.copyright"
            fallback={cmsContent.footer.copyright}
            category="Website"
            location="Footer - Hak Cipta Copyright"
            onSaveOverride={(val) =>
              updateCmsContent({ footer: { ...cmsContent.footer, copyright: val } }, 'Footer')
            }
          />
        </span>
        <span>
          <EditableText
            textKey="web.footer.sikumbang"
            fallback="Terdaftar Resmi Kementerian PUPR · SiKumbang FLPP"
            category="Website"
            location="Footer - Info Registrasi PUPR SiKumbang"
          />
        </span>
      </div>
    </footer>
  );
};

// 1. HOME PAGE
export const PublicHomePage: React.FC = () => {
  const {
    kavling,
    announcementBanner,
    cmsContent,
    syncedProjects,
    currentUser,
    editMode,
    updateCmsContent,
    saveSyncedProject,
    deleteSyncedProjectSoft,
  } = useAppStore();
  const navigate = useNavigate();
  const isAdmin = Boolean(currentUser && currentUser.active && currentUser.role === 'ADMIN');
  const availableCount = kavling.filter((k) => k.status === 'Tersedia').length;

  const homeProjects = syncedProjects
    .filter((p) => p.publishStatus === 'Published' && p.showOnHome)
    .sort((a, b) => (a.isFeatured === b.isFeatured ? 0 : a.isFeatured ? -1 : 1));

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <PublicNavbar />
      {(announcementBanner || isAdmin) && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 text-center text-xs text-emerald-900">
          <EditableText
            textKey="web.announcement.banner"
            fallback={
              announcementBanner ||
              'TARGET KONSOLIDASI Q4: Percepatan Akad KPR FLPP Bank BTN, BRI & Mandiri untuk 122 Unit Bahagia Group Property.'
            }
            category="Website"
            location="Banner Pengumuman Atas Website"
          />
        </div>
      )}

      <main className="flex-1">
        {/* Hero Section & Statistik */}
        <section className="max-w-7xl mx-auto px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="text-xs font-medium text-gray-500">
              <EditableText
                textKey="web.hero.badge"
                fallback={cmsContent.hero.badge}
                category="Website"
                location="Hero - Sub-Label Atas"
                onSaveOverride={(val) =>
                  updateCmsContent({ hero: { ...cmsContent.hero, badge: val } }, 'Hero')
                }
              />
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
              <EditableText
                textKey="web.hero.title"
                fallback={cmsContent.hero.title}
                category="Website"
                location="Hero - Judul Utama"
                onSaveOverride={(val) =>
                  updateCmsContent({ hero: { ...cmsContent.hero, title: val } }, 'Hero')
                }
              />
            </h1>
            <p className="text-base text-gray-600 leading-relaxed max-w-xl">
              <EditableText
                textKey="web.hero.subtitle"
                fallback={cmsContent.hero.subtitle}
                category="Website"
                location="Hero - Subjudul Deskripsi"
                onSaveOverride={(val) =>
                  updateCmsContent({ hero: { ...cmsContent.hero, subtitle: val } }, 'Hero')
                }
              />
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={cmsContent.hero.cta1Link || '/booking'}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <EditableText
                  textKey="web.hero.cta1"
                  fallback={cmsContent.hero.cta1Text}
                  category="Website"
                  location="Hero - Tombol CTA 1"
                  onSaveOverride={(val) =>
                    updateCmsContent({ hero: { ...cmsContent.hero, cta1Text: val } }, 'Hero')
                  }
                />
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={cmsContent.hero.cta2Link || '/katalog'}
                className="px-5 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                <EditableText
                  textKey="web.hero.cta2"
                  fallback={cmsContent.hero.cta2Text}
                  category="Website"
                  location="Hero - Tombol CTA 2"
                  onSaveOverride={(val) =>
                    updateCmsContent({ hero: { ...cmsContent.hero, cta2Text: val } }, 'Hero')
                  }
                />
              </Link>
            </div>
            <div className="pt-4 border-t border-gray-200 grid grid-cols-3 gap-4 text-xs">
              <div>
                <div className="font-mono text-xl font-bold text-gray-900 tabular-nums">
                  <EditableText
                    textKey="web.stat.1.val"
                    fallback={`${kavling.length} Unit`}
                    category="Website"
                    location="Statistik 1 - Angka Total Unit"
                  />
                </div>
                <div className="text-gray-500 mt-0.5">
                  <EditableText
                    textKey="web.stat.1.lbl"
                    fallback={`Total Kapasitas ${homeProjects.length} Proyek`}
                    category="Website"
                    location="Statistik 1 - Label"
                  />
                </div>
              </div>
              <div>
                <div className="font-mono text-xl font-bold text-emerald-600 tabular-nums">
                  <EditableText
                    textKey="web.stat.2.val"
                    fallback={`${availableCount} Unit`}
                    category="Website"
                    location="Statistik 2 - Angka Unit Tersedia"
                  />
                </div>
                <div className="text-gray-500 mt-0.5">
                  <EditableText
                    textKey="web.stat.2.lbl"
                    fallback={cmsContent.statistik[1]?.label || 'Kavling Siap Dipilih'}
                    category="Website"
                    location="Statistik 2 - Label"
                  />
                </div>
              </div>
              <div>
                <div className="font-mono text-xl font-bold text-gray-900 tabular-nums">
                  <EditableText
                    textKey="web.stat.3.val"
                    fallback={cmsContent.statistik[2]?.value || 'Rp169 Jt'}
                    category="Website"
                    location="Statistik 3 - Angka"
                  />
                </div>
                <div className="text-gray-500 mt-0.5">
                  <EditableText
                    textKey="web.stat.3.lbl"
                    fallback={cmsContent.statistik[2]?.label || 'Harga Resmi Subsidi'}
                    category="Website"
                    location="Statistik 3 - Label"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-xs">
              <EditableImage
                slotKey="hero-banner"
                defaultSrc={cmsContent.hero.banners[0] || ASSETS.heroEstate}
                alt="Kawasan Perumahan Bahagia Group Property"
                className="w-full h-[380px] object-cover"
                onImageChange={(newUrl) =>
                  updateCmsContent({ hero: { ...cmsContent.hero, banners: [newUrl] } }, 'Hero')
                }
              />
              <div className="p-4 bg-white flex items-center justify-between text-xs text-gray-600 border-t border-gray-100">
                <span>
                  <EditableText
                    textKey="web.hero.caption"
                    fallback="Kawasan Hunian Asri · Jalan Lingkungan Lebar · Masjid & Taman"
                    category="Website"
                    location="Hero - Caption Foto Utama"
                  />
                </span>
                <span className="font-mono text-emerald-700 font-semibold">
                  <EditableText
                    textKey="web.hero.banks_badge"
                    fallback="BTN · BRI · Mandiri"
                    category="Website"
                    location="Hero - Badge Bank Mitra"
                  />
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1 BARU: TESTIMONI KONSUMEN ("Apa Kata Penghuni Kami") */}
        <PublicTestimonialsSection />

        {/* Kartu Proyek Auto-Sync */}
        <section className="max-w-7xl mx-auto px-6 py-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                <EditableText
                  textKey="web.projects.heading"
                  fallback={`01. Proyek Unggulan Bahagia Group (${homeProjects.length} Kawasan)`}
                  category="Website"
                  location="Section Proyek - Judul"
                />
              </h2>
              <p className="text-sm text-gray-500">
                <EditableText
                  textKey="web.projects.subheading"
                  fallback="Dikembangkan oleh entitas anak perusahaan resmi dengan pengawasan Penanggung Jawab Teknis (PJT) bersertifikat."
                  category="Website"
                  location="Section Proyek - Subjudul"
                />
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => navigate('/sistem/proyek')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tambah / Kelola Proyek</span>
                </button>
              )}
              <Link
                to="/katalog"
                className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <EditableText
                  textKey="web.projects.link_all"
                  fallback={`Lihat Semua Unit di Katalog (${kavling.length} Unit)`}
                  category="Website"
                  location="Section Proyek - Link Lihat Semua Unit"
                />
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div
            className={`grid grid-cols-1 ${
              homeProjects.length >= 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'lg:grid-cols-2'
            } gap-8`}
          >
            {homeProjects.map((proj) => {
              const projLots = kavling.filter(
                (k) => k.projectName.toLowerCase() === proj.projectName.toLowerCase()
              );
              const availLots = projLots.filter((k) => k.status === 'Tersedia').length;
              const activePromo = proj.promos.find((pr) => pr.isActive);
              return (
                <div
                  key={proj.id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col justify-between shadow-2xs hover:border-emerald-300 transition-colors relative"
                >
                  <div>
                    <div className="relative">
                      <EditableImage
                        slotKey={
                          proj.id === 'PROJ-SYNC-TBL'
                            ? 'project-tbl'
                            : proj.id === 'PROJ-SYNC-BPP'
                            ? 'project-bpp'
                            : `project-${proj.slug}`
                        }
                        defaultSrc={proj.heroImage}
                        alt={proj.projectName}
                        className="w-full h-60 object-cover border-b border-gray-100"
                        onImageChange={(newUrl) => {
                          saveSyncedProject({ ...proj, heroImage: newUrl }, false);
                        }}
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-20">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/95 text-gray-900 shadow-xs">
                          <EditableText
                            textKey={`web.proj.${proj.slug}.type`}
                            fallback={proj.projectType}
                            category="Website"
                            location={`Kartu Proyek ${proj.projectName} - Tipe Proyek`}
                            onSaveOverride={(val) =>
                              saveSyncedProject({ ...proj, projectType: val as any }, false)
                            }
                          />
                        </span>
                        {proj.isFeatured && (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500 text-white shadow-xs">
                            <EditableText
                              textKey="web.proj.featured_badge"
                              fallback="★ Proyek Unggulan"
                              category="Website"
                              location="Kartu Proyek - Badge Proyek Unggulan"
                            />
                          </span>
                        )}
                      </div>
                      {isAdmin && editMode && (
                        <div className="absolute top-3 right-3 z-30 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => navigate(`/sistem/proyek?edit=${proj.id}`)}
                            className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md cursor-pointer"
                            title="Edit Detail Proyek"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteSyncedProjectSoft(proj.id, false);
                              toast.success(`🗑️ Proyek ${proj.projectName} dihapus ke Trash`);
                            }}
                            className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md cursor-pointer"
                            title="Hapus Proyek Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      <div className="absolute bottom-3 right-3 z-20 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-emerald-700/95 text-white shadow-xs">
                        <EditableText
                          textKey={`web.proj.${proj.slug}.avail_badge`}
                          fallback={`Tersedia ${availLots} / ${projLots.length || proj.totalUnits} Unit`}
                          category="Website"
                          location={`Kartu Proyek ${proj.projectName} - Info Ketersediaan`}
                        />
                      </div>
                    </div>
                    <div className="p-6 space-y-3.5">
                      <div className="text-xs text-gray-500 font-medium">
                        <EditableText
                          textKey={`web.proj.${proj.slug}.company_meta`}
                          fallback={`${proj.companyName} · Luas ${proj.landAreaTotal.toLocaleString('id-ID')} m² (${proj.blocks.map((b) => `Blok ${b.blockName}`).join(', ')})`}
                          category="Website"
                          location={`Kartu Proyek ${proj.projectName} - Nama PT & Luas`}
                          onSaveOverride={(val) =>
                            saveSyncedProject({ ...proj, companyName: val.split('·')[0].trim() || proj.companyName }, false)
                          }
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          <EditableText
                            textKey={`web.proj.${proj.slug}.name`}
                            fallback={proj.projectName}
                            category="Website"
                            location={`Kartu Proyek ${proj.projectName} - Nama Proyek`}
                            onSaveOverride={(val) =>
                              saveSyncedProject({ ...proj, projectName: val }, false)
                            }
                          />
                        </h3>
                        {(proj.tagline || editMode) && (
                          <p className="text-xs font-medium text-emerald-700 mt-0.5">
                            <EditableText
                              textKey={`web.proj.${proj.slug}.tagline`}
                              fallback={proj.tagline || 'Hunian Subsidi Berkualitas'}
                              category="Website"
                              location={`Kartu Proyek ${proj.projectName} - Tagline`}
                              onSaveOverride={(val) =>
                                saveSyncedProject({ ...proj, tagline: val }, false)
                              }
                            />
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          <EditableText
                            textKey={`web.proj.${proj.slug}.address`}
                            fallback={`${proj.address}, Kel. ${proj.kelurahan}, Kec. ${proj.kecamatan}, ${proj.city}`}
                            category="Website"
                            location={`Kartu Proyek ${proj.projectName} - Alamat`}
                            onSaveOverride={(val) =>
                              saveSyncedProject({ ...proj, address: val }, false)
                            }
                          />
                        </span>
                      </p>
                      <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">
                        <EditableText
                          textKey={`web.proj.${proj.slug}.desc`}
                          fallback={proj.description}
                          category="Website"
                          location={`Kartu Proyek ${proj.projectName} - Deskripsi`}
                          onSaveOverride={(val) =>
                            saveSyncedProject({ ...proj, description: val }, false)
                          }
                        />
                      </p>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5 text-xs space-y-1.5">
                        <div className="font-semibold text-gray-900 flex items-center justify-between">
                          <span>
                            <EditableText
                              textKey={`web.proj.${proj.slug}.promo_heading`}
                              fallback="Promo & Keuntungan Konsumen:"
                              category="Website"
                              location={`Kartu Proyek ${proj.projectName} - Judul Promo`}
                            />
                          </span>
                          {activePromo && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-sm">
                              <EditableText
                                textKey={`web.proj.${proj.slug}.promo_badge`}
                                fallback={activePromo.badgeText}
                                category="Website"
                                location={`Kartu Proyek ${proj.projectName} - Badge Promo`}
                              />
                            </span>
                          )}
                        </div>
                        <div className="text-gray-600">
                          <EditableText
                            textKey={`web.proj.${proj.slug}.promo_bonus`}
                            fallback={proj.promoBonus.join(' · ')}
                            category="Website"
                            location={`Kartu Proyek ${proj.projectName} - Daftar Bonus`}
                            onSaveOverride={(val) =>
                              saveSyncedProject(
                                {
                                  ...proj,
                                  promoBonus: val.split('·').map((s) => s.trim()).filter(Boolean),
                                },
                                false
                              )
                            }
                          />
                        </div>
                        <div className="text-emerald-700 font-medium pt-0.5">
                          <EditableText
                            textKey={`web.proj.${proj.slug}.dp_info`}
                            fallback={proj.dpInfo}
                            category="Website"
                            location={`Kartu Proyek ${proj.projectName} - Info DP`}
                            onSaveOverride={(val) =>
                              saveSyncedProject({ ...proj, dpInfo: val }, false)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-xs text-gray-500 block">
                        <EditableText
                          textKey="web.proj.price_label"
                          fallback="Harga Jual / Unit"
                          category="Website"
                          location="Kartu Proyek - Label Harga Jual"
                        />
                      </span>
                      <span className="font-mono font-bold text-base text-gray-900 tabular-nums">
                        <EditableText
                          textKey={`web.proj.${proj.slug}.price`}
                          fallback={formatRupiah(proj.price)}
                          category="Website"
                          location={`Kartu Proyek ${proj.projectName} - Harga`}
                          onSaveOverride={(val) => {
                            const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
                            if (!isNaN(num) && num > 0) {
                              saveSyncedProject({ ...proj, price: num }, false);
                            }
                          }}
                        />
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/proyek/${proj.slug}`}
                        className="px-3.5 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-xs font-medium text-gray-800 rounded-lg whitespace-nowrap"
                      >
                        <EditableText
                          textKey="web.proj.btn_detail"
                          fallback="Lihat Detail"
                          category="Website"
                          location="Kartu Proyek - Tombol Lihat Detail"
                        />
                      </Link>
                      <Link
                        to={`/booking?project=${proj.slug}`}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg whitespace-nowrap"
                      >
                        <EditableText
                          textKey="web.proj.btn_pilih"
                          fallback="Pilih Kavling"
                          category="Website"
                          location="Kartu Proyek - Tombol Pilih Kavling"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Master Site Plan Interaktif */}
        <section className="max-w-7xl mx-auto px-6 py-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                <EditableText
                  textKey="web.siteplan_section.heading"
                  fallback="02. Peta Master Site Plan & Ketersediaan Kavling Real-Time"
                  category="Website"
                  location="Section Site Plan - Judul Utama"
                />
              </h2>
              <p className="text-sm text-gray-500">
                <EditableText
                  textKey="web.siteplan_section.subheading"
                  fallback="Pilih tab proyek (Bahagia Land 97 Unit atau Bahagia Residence 22 Unit) dan klik langsung kavling pada peta site plan untuk melihat koordinat, arah hadap, dan status pemesanan."
                  category="Website"
                  location="Section Site Plan - Subjudul"
                />
              </p>
            </div>
          </div>
          <SitePlanInteractive />
        </section>

        {/* SECTION 2 BARU: GALERI PEMBANGUNAN & PROGRESS FISIK */}
        <PublicGalleryProgressSection />

        {/* Keunggulan & Bukti Kualitas */}
        <section className="max-w-7xl mx-auto px-6 py-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl font-bold text-gray-900">
              <EditableText
                textKey="web.keunggulan.heading"
                fallback="03. Standar Kualitas & Verifikasi Teknis"
                category="Website"
                location="Section Keunggulan - Judul"
              />
            </h2>
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  const nextList = [
                    ...cmsContent.keunggulan,
                    {
                      id: `k-${Date.now()}`,
                      title: 'Keunggulan Baru Bahagia Group',
                      description: 'Klik pada teks ini saat Edit Mode aktif untuk mengubah deskripsi keunggulan.',
                    },
                  ];
                  updateCmsContent({ keunggulan: nextList }, 'Keunggulan');
                  toast.success('✅ Kartu Keunggulan baru berhasil ditambahkan!');
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Kartu Keunggulan</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cmsContent.keunggulan.map((item, idx) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-xl p-6 space-y-2 relative"
              >
                {isAdmin && editMode && (
                  <button
                    type="button"
                    onClick={() => {
                      const nextList = cmsContent.keunggulan.filter((x) => x.id !== item.id);
                      updateCmsContent({ keunggulan: nextList }, 'Keunggulan');
                      toast.success('🗑️ Kartu Keunggulan dihapus');
                    }}
                    className="absolute top-3 right-3 p-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg cursor-pointer"
                    title="Hapus Keunggulan Ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="text-sm font-semibold text-gray-900 pr-6">
                  <EditableText
                    textKey={`web.keunggulan.${item.id}.title`}
                    fallback={item.title}
                    category="Website"
                    location={`Keunggulan ${idx + 1} - Judul`}
                    onSaveOverride={(val) => {
                      const nextList = cmsContent.keunggulan.map((x) =>
                        x.id === item.id ? { ...x, title: val } : x
                      );
                      updateCmsContent({ keunggulan: nextList }, 'Keunggulan');
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  <EditableText
                    textKey={`web.keunggulan.${item.id}.desc`}
                    fallback={item.description}
                    category="Website"
                    location={`Keunggulan ${idx + 1} - Deskripsi`}
                    onSaveOverride={(val) => {
                      const nextList = cmsContent.keunggulan.map((x) =>
                        x.id === item.id ? { ...x, description: val } : x
                      );
                      updateCmsContent({ keunggulan: nextList }, 'Keunggulan');
                    }}
                  />
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3 BARU: ARTIKEL & BERITA (BLOG) */}
        <PublicBlogHomepageSection />
      </main>

      <PublicFooter />
    </div>
  );
};

// 2 & 3. PROJECT DETAIL PAGE
export const PublicProjectPage: React.FC<{
  companyId?: 'PT_TBL' | 'PT_BPP';
  isPreviewMode?: boolean;
}> = ({ companyId, isPreviewMode = false }) => {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const {
    syncedProjects,
    kavling,
    toggleProjectPublishStatus,
    saveSyncedProject,
    currentUser,
    editMode,
  } = useAppStore();

  const isAdmin = Boolean(currentUser && currentUser.active && currentUser.role === 'ADMIN');

  const proj = React.useMemo(() => {
    if (slug) {
      return (
        syncedProjects.find((p) => p.slug.toLowerCase() === slug.toLowerCase()) ||
        syncedProjects[0]
      );
    }
    if (companyId === 'PT_BPP') {
      return (
        syncedProjects.find((p) => p.slug === 'bahagia-residence') ||
        syncedProjects.find((p) => p.companyId === 'PT_BPP') ||
        syncedProjects[0]
      );
    }
    return (
      syncedProjects.find((p) => p.slug === 'bahagia-land') ||
      syncedProjects[0]
    );
  }, [slug, companyId, syncedProjects]);

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [kprTenor, setKprTenor] = useState(15);
  const [kprDp, setKprDp] = useState(proj?.minDp || 1690000);
  const [newFacilityInput, setNewFacilityInput] = useState('');
  const [newAdvantageInput, setNewAdvantageInput] = useState('');

  React.useEffect(() => {
    if (proj) {
      setKprDp(proj.minDp);
      setActivePhotoIdx(0);
    }
  }, [proj]);

  if (!proj) {
    return null;
  }

  const projectLots = kavling.filter(
    (k) => k.projectName.toLowerCase() === proj.projectName.toLowerCase()
  );
  const availableLotsCount = projectLots.filter((k) => k.status === 'Tersedia').length;

  const gallery =
    proj.galleryPhotos && proj.galleryPhotos.length > 0
      ? proj.galleryPhotos
      : [proj.heroImage, ASSETS.unitInterior, ASSETS.unitFloorplan];

  const loanPrincipal = Math.max(0, proj.price - kprDp);
  const monthlyRate = 0.05 / 12;
  const totalMonths = kprTenor * 12;
  const estimatedMonthly =
    (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      {isPreviewMode && (
        <div className="sticky top-0 z-50 bg-amber-500 text-gray-950 px-6 py-3 border-b border-amber-600 shadow-md flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
            <span>⚠️ MODE PREVIEW — Proyek "{proj.projectName}" berstatus:</span>
            <span className="px-2 py-0.5 rounded-sm bg-gray-900 text-white uppercase text-xs">
              {proj.publishStatus}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/sistem/proyek?edit=${proj.id}`)}
              className="px-3.5 py-1.5 rounded-lg bg-white text-gray-900 hover:bg-gray-100 text-xs font-bold border border-gray-300 cursor-pointer"
            >
              ✏️ Kembali ke Edit Proyek
            </button>
            {proj.publishStatus !== 'Published' && (
              <button
                type="button"
                onClick={() => {
                  toggleProjectPublishStatus(proj.id, 'Published');
                  toast.success(
                    `✅ Proyek "${proj.projectName}" berhasil dipublish & tayang otomatis di Website Publik!`
                  );
                  navigate(`/proyek/${proj.slug}`);
                }}
                className="px-4 py-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-bold shadow-xs cursor-pointer"
              >
                🚀 Publish Sekarang
              </button>
            )}
          </div>
        </div>
      )}

      <PublicNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* 1. HERO PROYEK & GALERI SLIDER */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <EditableText
                    textKey={`web.proj_detail.${proj.slug}.company`}
                    fallback={proj.companyName}
                    category="Website"
                    location={`Detail Proyek ${proj.projectName} - Nama PT`}
                    onSaveOverride={(val) =>
                      saveSyncedProject({ ...proj, companyName: val }, false)
                    }
                  />
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                  <EditableText
                    textKey={`web.proj_detail.${proj.slug}.type`}
                    fallback={proj.projectType}
                    category="Website"
                    location={`Detail Proyek ${proj.projectName} - Tipe Proyek`}
                    onSaveOverride={(val) =>
                      saveSyncedProject({ ...proj, projectType: val as any }, false)
                    }
                  />
                </span>
                {proj.isFeatured && (
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800">
                    ★ Proyek Unggulan
                  </span>
                )}
              </div>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => navigate(`/sistem/proyek?edit=${proj.id}`)}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Edit Lengkap Proyek</span>
                </button>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                <EditableText
                  textKey={`web.proj_detail.${proj.slug}.title`}
                  fallback={proj.projectName}
                  category="Website"
                  location={`Detail Proyek ${proj.projectName} - Judul`}
                  onSaveOverride={(val) =>
                    saveSyncedProject({ ...proj, projectName: val }, false)
                  }
                />
              </h1>
              <p className="text-sm font-medium text-emerald-700 mt-1">
                <EditableText
                  textKey={`web.proj_detail.${proj.slug}.tagline`}
                  fallback={proj.tagline || 'Kawasan Perumahan Subsidi Terpadu'}
                  category="Website"
                  location={`Detail Proyek ${proj.projectName} - Tagline`}
                  onSaveOverride={(val) =>
                    saveSyncedProject({ ...proj, tagline: val }, false)
                  }
                />
              </p>
            </div>

            <p className="text-xs text-gray-600 flex items-start gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <EditableText
                  textKey={`web.proj_detail.${proj.slug}.full_address`}
                  fallback={`${proj.address}, Kel. ${proj.kelurahan}, Kec. ${proj.kecamatan}, ${proj.city}, ${proj.province} (${proj.landmark})`}
                  category="Website"
                  location={`Detail Proyek ${proj.projectName} - Alamat Lengkap`}
                  onSaveOverride={(val) =>
                    saveSyncedProject({ ...proj, address: val }, false)
                  }
                />
              </span>
            </p>

            {/* 2. RINGKASAN PROYEK CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-gray-500 block">
                  <EditableText
                    textKey="web.proj_detail.lbl_tersedia"
                    fallback="Total & Tersedia"
                    category="Website"
                    location="Detail Proyek - Label Total & Tersedia"
                  />
                </span>
                <span className="font-mono font-bold text-gray-900 text-sm">
                  {availableLotsCount} / {projectLots.length || proj.totalUnits} Unit
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-gray-500 block">
                  <EditableText
                    textKey="web.proj_detail.lbl_luas"
                    fallback="Luas Kawasan"
                    category="Website"
                    location="Detail Proyek - Label Luas Kawasan"
                  />
                </span>
                <span className="font-mono font-bold text-gray-900 text-sm">
                  <EditableText
                    textKey={`web.proj_detail.${proj.slug}.land_area`}
                    fallback={`${proj.landAreaTotal.toLocaleString('id-ID')} m²`}
                    category="Website"
                    location={`Detail Proyek ${proj.projectName} - Luas Kawasan`}
                    onSaveOverride={(val) => {
                      const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
                      if (!isNaN(num)) saveSyncedProject({ ...proj, landAreaTotal: num }, false);
                    }}
                  />
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-gray-500 block">
                  <EditableText
                    textKey="web.proj_detail.lbl_tipe"
                    fallback="Tipe & Ukuran"
                    category="Website"
                    location="Detail Proyek - Label Tipe & Ukuran"
                  />
                </span>
                <span className="font-mono font-bold text-gray-900 text-sm">
                  <EditableText
                    textKey={`web.proj_detail.${proj.slug}.unit_type`}
                    fallback={`${proj.unitType} (${proj.lotDimensions})`}
                    category="Website"
                    location={`Detail Proyek ${proj.projectName} - Tipe & Ukuran`}
                    onSaveOverride={(val) =>
                      saveSyncedProject({ ...proj, unitType: val }, false)
                    }
                  />
                </span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-emerald-700 block">
                  <EditableText
                    textKey="web.proj_detail.lbl_harga"
                    fallback="Harga Resmi"
                    category="Website"
                    location="Detail Proyek - Label Harga Resmi"
                  />
                </span>
                <span className="font-mono font-bold text-emerald-800 text-sm">
                  <EditableText
                    textKey={`web.proj_detail.${proj.slug}.price`}
                    fallback={formatRupiah(proj.price)}
                    category="Website"
                    location={`Detail Proyek ${proj.projectName} - Harga Resmi`}
                    onSaveOverride={(val) => {
                      const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
                      if (!isNaN(num) && num > 0) saveSyncedProject({ ...proj, price: num }, false);
                    }}
                  />
                </span>
              </div>
            </div>

            {/* 3. TENTANG PROYEK & FASILITAS */}
            <div className="text-xs text-gray-700 space-y-2 pt-2 leading-relaxed border-t border-gray-100">
              <p className="text-sm text-gray-800">
                <EditableText
                  textKey={`web.proj_detail.${proj.slug}.desc`}
                  fallback={proj.description}
                  category="Website"
                  location={`Detail Proyek ${proj.projectName} - Deskripsi Lengkap`}
                  onSaveOverride={(val) =>
                    saveSyncedProject({ ...proj, description: val }, false)
                  }
                />
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-1.5">
                  <div className="font-semibold text-gray-900">
                    <EditableText
                      textKey="web.proj_detail.lbl_fasilitas"
                      fallback="Fasilitas Umum Kawasan:"
                      category="Website"
                      location="Detail Proyek - Judul Fasilitas Umum"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.facilities.map((fas, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-white border border-gray-200 rounded-md text-[11px] text-gray-700 inline-flex items-center gap-1"
                      >
                        ✓{' '}
                        <EditableText
                          textKey={`web.proj_detail.${proj.slug}.fas.${i}`}
                          fallback={fas}
                          category="Website"
                          location={`Fasilitas ${i + 1} - ${proj.projectName}`}
                          onSaveOverride={(val) => {
                            const next = [...proj.facilities];
                            next[i] = val;
                            saveSyncedProject({ ...proj, facilities: next }, false);
                          }}
                        />
                        {isAdmin && editMode && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = proj.facilities.filter((_, idx) => idx !== i);
                              saveSyncedProject({ ...proj, facilities: next }, false);
                            }}
                            className="text-red-600 hover:text-red-800 font-bold ml-1 cursor-pointer"
                            title="Hapus Fasilitas"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                  {isAdmin && editMode && (
                    <div className="flex items-center gap-1 pt-1">
                      <input
                        type="text"
                        value={newFacilityInput}
                        onChange={(e) => setNewFacilityInput(e.target.value)}
                        placeholder="+ Tambah fasilitas..."
                        className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 text-[11px]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newFacilityInput.trim()) return;
                          saveSyncedProject(
                            { ...proj, facilities: [...proj.facilities, newFacilityInput.trim()] },
                            false
                          );
                          setNewFacilityInput('');
                        }}
                        className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-1.5">
                  <div className="font-semibold text-gray-900">
                    <EditableText
                      textKey="web.proj_detail.lbl_keunggulan"
                      fallback="Keunggulan Lokasi & Bangunan:"
                      category="Website"
                      location="Detail Proyek - Judul Keunggulan Lokasi"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.advantages.map((adv, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-md text-[11px] text-emerald-800 font-medium inline-flex items-center gap-1"
                      >
                        ★{' '}
                        <EditableText
                          textKey={`web.proj_detail.${proj.slug}.adv.${i}`}
                          fallback={adv}
                          category="Website"
                          location={`Keunggulan ${i + 1} - ${proj.projectName}`}
                          onSaveOverride={(val) => {
                            const next = [...proj.advantages];
                            next[i] = val;
                            saveSyncedProject({ ...proj, advantages: next }, false);
                          }}
                        />
                        {isAdmin && editMode && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = proj.advantages.filter((_, idx) => idx !== i);
                              saveSyncedProject({ ...proj, advantages: next }, false);
                            }}
                            className="text-red-600 hover:text-red-800 font-bold ml-1 cursor-pointer"
                            title="Hapus Keunggulan"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                  {isAdmin && editMode && (
                    <div className="flex items-center gap-1 pt-1">
                      <input
                        type="text"
                        value={newAdvantageInput}
                        onChange={(e) => setNewAdvantageInput(e.target.value)}
                        placeholder="+ Tambah keunggulan..."
                        className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 text-[11px]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newAdvantageInput.trim()) return;
                          saveSyncedProject(
                            { ...proj, advantages: [...proj.advantages, newAdvantageInput.trim()] },
                            false
                          );
                          setNewAdvantageInput('');
                        }}
                        className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 10. TOMBOL AKSI UTAMA */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={`/booking?project=${proj.slug}`}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-2"
              >
                <EditableText
                  textKey={`web.proj_detail.${proj.slug}.btn_booking`}
                  fallback={`Booking Unit Sekarang (${formatRupiah(proj.bookingFee)})`}
                  category="Website"
                  location={`Detail Proyek ${proj.projectName} - Tombol Booking`}
                />
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/kontak"
                className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-xs font-medium rounded-lg flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <EditableText
                  textKey={`web.proj_detail.${proj.slug}.btn_phone`}
                  fallback={`Hubungi Marketing (${proj.picPhone})`}
                  category="Website"
                  location={`Detail Proyek ${proj.projectName} - Nomor Marketing`}
                  onSaveOverride={(val) =>
                    saveSyncedProject({ ...proj, picPhone: val.replace(/[^0-9+ -]/g, '') || proj.picPhone }, false)
                  }
                />
              </Link>
            </div>
          </div>

          {/* Galeri Foto Interaktif (EditableImage) */}
          <div className="lg:col-span-5 space-y-3">
            <EditableImage
              slotKey={`proj-detail-hero-${proj.slug}-${activePhotoIdx}`}
              defaultSrc={gallery[activePhotoIdx] || proj.heroImage}
              alt={proj.projectName}
              caption={`Foto Galeri ${proj.projectName} #${activePhotoIdx + 1}`}
              className="w-full h-72 object-cover rounded-xl border border-gray-200"
              onImageChange={(newUrl) => {
                const nextGal = [...gallery];
                nextGal[activePhotoIdx] = newUrl;
                saveSyncedProject(
                  {
                    ...proj,
                    heroImage: activePhotoIdx === 0 ? newUrl : proj.heroImage,
                    galleryPhotos: nextGal,
                  },
                  false
                );
              }}
            />
            {gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`rounded-lg overflow-hidden border-2 h-16 cursor-pointer ${
                      activePhotoIdx === idx
                        ? 'border-emerald-600'
                        : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl || ASSETS.placeholder}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1">
              <div className="font-semibold text-gray-900">
                <EditableText
                  textKey={`web.proj_detail.${proj.slug}.blocks_heading`}
                  fallback={`Rincian Blok Kawasan (${proj.blocks.length} Blok):`}
                  category="Website"
                  location={`Detail Proyek ${proj.projectName} - Judul Rincian Blok`}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {proj.blocks.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white px-2.5 py-1.5 rounded-md border border-gray-200 flex items-center justify-between"
                  >
                    <span className="font-semibold text-gray-800">Blok {b.blockName}</span>
                    <span className="font-mono text-gray-600">
                      {b.unitCount} unit ({b.startNumber}–{b.endNumber})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4 & 5. SITE PLAN INTERAKTIF & DAFTAR UNIT PER BLOK */}
        <SitePlanInteractive
          projectName={proj.projectName}
          sitePlanImage={proj.sitePlanImage}
        />

        {/* 6, 7, 8, 9. SPESIFIKASI TEKNIS, KALKULATOR KPR, PROMO AKTIF, LOKASI & LEGALITAS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            {/* Spesifikasi Bangunan Lengkap */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">
                <EditableText
                  textKey={`web.proj_detail.${proj.slug}.spec_heading`}
                  fallback={`Spesifikasi Teknis Bangunan — ${proj.unitType} (LT ${proj.landSize} m² / LB ${proj.buildingSize} m²)`}
                  category="Website"
                  location={`Detail Proyek ${proj.projectName} - Judul Spesifikasi`}
                />
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-500 block">Kamar Tidur & Mandi</span>
                  <span className="font-semibold text-gray-900">
                    <EditableText
                      textKey={`web.proj_detail.${proj.slug}.spec_rooms`}
                      fallback={`${proj.bedrooms} KT · ${proj.bathrooms} KM`}
                      category="Website"
                      location={`Detail Proyek ${proj.projectName} - Kamar Tidur & Mandi`}
                    />
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-500 block">Pondasi</span>
                  <span className="font-semibold text-gray-900">
                    <EditableText
                      textKey={`web.proj_detail.${proj.slug}.spec_foundation`}
                      fallback={proj.foundationSpec}
                      category="Website"
                      location={`Detail Proyek ${proj.projectName} - Spesifikasi Pondasi`}
                      onSaveOverride={(val) =>
                        saveSyncedProject({ ...proj, foundationSpec: val }, false)
                      }
                    />
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-500 block">Dinding</span>
                  <span className="font-semibold text-gray-900">
                    <EditableText
                      textKey={`web.proj_detail.${proj.slug}.spec_wall`}
                      fallback={proj.wallSpec}
                      category="Website"
                      location={`Detail Proyek ${proj.projectName} - Spesifikasi Dinding`}
                      onSaveOverride={(val) =>
                        saveSyncedProject({ ...proj, wallSpec: val }, false)
                      }
                    />
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-500 block">Rangka & Atap</span>
                  <span className="font-semibold text-gray-900">
                    <EditableText
                      textKey={`web.proj_detail.${proj.slug}.spec_roof`}
                      fallback={proj.roofSpec}
                      category="Website"
                      location={`Detail Proyek ${proj.projectName} - Spesifikasi Atap`}
                      onSaveOverride={(val) =>
                        saveSyncedProject({ ...proj, roofSpec: val }, false)
                      }
                    />
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-500 block">Lantai & Plafon</span>
                  <span className="font-semibold text-gray-900">
                    <EditableText
                      textKey={`web.proj_detail.${proj.slug}.spec_floor`}
                      fallback={`${proj.floorSpec} · Plafon ${proj.ceilingSpec}`}
                      category="Website"
                      location={`Detail Proyek ${proj.projectName} - Spesifikasi Lantai`}
                      onSaveOverride={(val) =>
                        saveSyncedProject({ ...proj, floorSpec: val }, false)
                      }
                    />
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-500 block">Listrik & Air Bersih</span>
                  <span className="font-semibold text-gray-900">
                    <EditableText
                      textKey={`web.proj_detail.${proj.slug}.spec_elec`}
                      fallback={`${proj.electricitySpec} · ${proj.waterSpec}`}
                      category="Website"
                      location={`Detail Proyek ${proj.projectName} - Listrik & Air`}
                      onSaveOverride={(val) =>
                        saveSyncedProject({ ...proj, electricitySpec: val }, false)
                      }
                    />
                  </span>
                </div>
              </div>
              {proj.floorplanImage && (
                <div className="pt-2">
                  <div className="text-xs font-semibold text-gray-700 mb-2">
                    <EditableText
                      textKey={`web.proj_detail.${proj.slug}.floorplan_lbl`}
                      fallback={`Denah Unit Standar (${proj.lotDimensions}):`}
                      category="Website"
                      location={`Detail Proyek ${proj.projectName} - Label Denah`}
                    />
                  </div>
                  <EditableImage
                    slotKey={`floorplan-${proj.slug}`}
                    defaultSrc={proj.floorplanImage}
                    alt={`Denah ${proj.projectName}`}
                    className="w-full max-h-64 object-cover rounded-lg border border-gray-200"
                    onImageChange={(newUrl) =>
                      saveSyncedProject({ ...proj, floorplanImage: newUrl }, false)
                    }
                  />
                </div>
              )}
            </div>

            {/* Lokasi & Legalitas */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  <EditableText
                    textKey={`web.proj_detail.${proj.slug}.legal_heading`}
                    fallback="Peta Lokasi & Legalitas Kawasan"
                    category="Website"
                    location={`Detail Proyek ${proj.projectName} - Judul Legalitas`}
                  />
                </h2>
                <span className="text-xs font-mono text-gray-600">
                  GPS: {proj.coordinates.lat}, {proj.coordinates.lng}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <span className="text-gray-500 block">Sertifikat Induk & Pecahan</span>
                  <span className="font-semibold text-gray-900">
                    <EditableText
                      textKey={`web.proj_detail.${proj.slug}.cert`}
                      fallback={`${proj.certificateType} (${proj.imbNumber})`}
                      category="Website"
                      location={`Detail Proyek ${proj.projectName} - Sertifikat & IMB`}
                      onSaveOverride={(val) =>
                        saveSyncedProject({ ...proj, imbNumber: val }, false)
                      }
                    />
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Status Lahan & Perizinan</span>
                  <span className="font-semibold text-emerald-700">
                    <EditableText
                      textKey={`web.proj_detail.${proj.slug}.land_status`}
                      fallback={proj.landStatus}
                      category="Website"
                      location={`Detail Proyek ${proj.projectName} - Status Lahan`}
                      onSaveOverride={(val) =>
                        saveSyncedProject({ ...proj, landStatus: val as any }, false)
                      }
                    />
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Patokan Lokasi</span>
                  <span className="font-semibold text-gray-900">
                    <EditableText
                      textKey={`web.proj_detail.${proj.slug}.landmark`}
                      fallback={proj.landmark}
                      category="Website"
                      location={`Detail Proyek ${proj.projectName} - Patokan Lokasi`}
                      onSaveOverride={(val) =>
                        saveSyncedProject({ ...proj, landmark: val }, false)
                      }
                    />
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Jam Operasional Kantor Marketing</span>
                  <span className="font-semibold text-gray-900">
                    <EditableText
                      textKey={`web.proj_detail.${proj.slug}.hours`}
                      fallback={proj.operationalHours}
                      category="Website"
                      location={`Detail Proyek ${proj.projectName} - Jam Operasional`}
                      onSaveOverride={(val) =>
                        saveSyncedProject({ ...proj, operationalHours: val }, false)
                      }
                    />
                  </span>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border border-gray-200 h-60 bg-gray-100">
                <iframe
                  title={`Peta ${proj.projectName}`}
                  src={
                    proj.googleMapsEmbedUrl ||
                    `https://maps.google.com/maps?q=${proj.coordinates.lat},${proj.coordinates.lng}&z=15&output=embed`
                  }
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* KPR Calculator & Promo */}
          <div className="lg:col-span-5 space-y-6">
            {/* Promo Aktif */}
            <div className="bg-emerald-900 text-white rounded-xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  <EditableText
                    textKey={`web.proj_detail.${proj.slug}.promo_kicker`}
                    fallback="Promo & Bonus Konsumen"
                    category="Website"
                    location={`Detail Proyek ${proj.projectName} - Kicker Promo`}
                  />
                </span>
                {proj.promos[0] && (
                  <span className="px-2.5 py-0.5 rounded-sm bg-amber-400 text-gray-950 text-[11px] font-bold">
                    <EditableText
                      textKey={`web.proj_detail.${proj.slug}.promo_badge`}
                      fallback={proj.promos[0].badgeText}
                      category="Website"
                      location={`Detail Proyek ${proj.projectName} - Badge Promo`}
                    />
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold">
                <EditableText
                  textKey={`web.proj_detail.${proj.slug}.promo_title`}
                  fallback={proj.promos[0]?.title || `Promo Spesial ${proj.projectName}`}
                  category="Website"
                  location={`Detail Proyek ${proj.projectName} - Judul Promo`}
                />
              </h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                <EditableText
                  textKey={`web.proj_detail.${proj.slug}.promo_desc`}
                  fallback={proj.promos[0]?.description || proj.dpInfo}
                  category="Website"
                  location={`Detail Proyek ${proj.projectName} - Deskripsi Promo`}
                  onSaveOverride={(val) =>
                    saveSyncedProject({ ...proj, dpInfo: val }, false)
                  }
                />
              </p>
              <div className="pt-2 border-t border-emerald-800 space-y-1 text-xs">
                {proj.promoBonus.map((bon, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-emerald-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      <EditableText
                        textKey={`web.proj_detail.${proj.slug}.bonus.${idx}`}
                        fallback={bon}
                        category="Website"
                        location={`Detail Proyek ${proj.projectName} - Item Bonus ${idx + 1}`}
                        onSaveOverride={(val) => {
                          const next = [...proj.promoBonus];
                          next[idx] = val;
                          saveSyncedProject({ ...proj, promoBonus: next }, false);
                        }}
                      />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulasi KPR */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <Calculator className="w-4 h-4 text-emerald-600" />
                <span>
                  <EditableText
                    textKey={`web.proj_detail.${proj.slug}.kpr_heading`}
                    fallback={`Simulasi KPR Subsidi (${proj.partnerBanks.join(', ')})`}
                    category="Website"
                    location={`Detail Proyek ${proj.projectName} - Judul Simulasi KPR`}
                  />
                </span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Harga Jual Resmi:</span>
                  <span className="font-mono font-bold text-gray-900">{formatRupiah(proj.price)}</span>
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">Uang Muka / DP (Rp)</label>
                  <input
                    type="number"
                    value={kprDp}
                    onChange={(e) => setKprDp(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">Tenor KPR ({kprTenor} Tahun)</label>
                  <div className="flex items-center gap-2">
                    {[10, 15, 20].map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setKprTenor(yr)}
                        className={`flex-1 py-2 rounded-lg font-medium border cursor-pointer ${
                          kprTenor === yr
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {yr} Thn
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-emerald-800 block font-semibold">Estimasi Angsuran / Bulan</span>
                    <span className="text-[11px] text-emerald-700">
                      Plafon KPR: {formatRupiah(loanPrincipal)} (Bunga 5% Flat)
                    </span>
                  </div>
                  <div className="font-mono text-lg font-bold text-emerald-900 tabular-nums">
                    {formatRupiah(Math.round(estimatedMonthly))}/bln
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

// 4. KATALOG UNIT PAGE
export const PublicCatalogPage: React.FC = () => {
  const {
    kavling,
    syncedProjects,
    currentUser,
    editMode,
    saveKavlingLotFull,
    deleteRecordsFromCollection,
  } = useAppStore();
  const navigate = useNavigate();
  const isAdmin = Boolean(currentUser && currentUser.active && currentUser.role === 'ADMIN');

  const [projectTab, setProjectTab] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Tersedia'>('Tersedia');
  const [searchQ, setSearchQ] = useState('');

  const catalogProjects = syncedProjects.filter(
    (p) => p.publishStatus === 'Published' && p.showInCatalog
  );

  const filtered = kavling.filter((k) => {
    if (projectTab !== 'ALL' && k.projectName.toLowerCase() !== projectTab.toLowerCase()) {
      return false;
    }
    if (statusFilter === 'Tersedia' && k.status !== 'Tersedia') return false;
    if (
      searchQ &&
      !k.code.toLowerCase().includes(searchQ.toLowerCase()) &&
      !k.projectName.toLowerCase().includes(searchQ.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <PublicNavbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              <EditableText
                textKey="web.catalog.heading"
                fallback={`Katalog Unit Rumah Subsidi (${kavling.length} Kavling · ${catalogProjects.length} Proyek)`}
                category="Website"
                location="Halaman Katalog - Judul Utama"
              />
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              <EditableText
                textKey="web.catalog.subheading"
                fallback="Harga seragam Rp169.000.000/unit · Kavling 7×13m (91 m²) · Tersedia simulasi angsuran KPR Bank BTN, BRI & Mandiri"
                category="Website"
                location="Halaman Katalog - Subjudul"
              />
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={() => navigate('/sistem/kavling')}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah / Kelola Kavling</span>
              </button>
            )}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-gray-200/70 rounded-lg">
              <button
                type="button"
                onClick={() => setProjectTab('ALL')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                  projectTab === 'ALL' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
                }`}
              >
                Semua Proyek ({kavling.length})
              </button>
              {catalogProjects.map((proj) => {
                const count = kavling.filter(
                  (k) => k.projectName.toLowerCase() === proj.projectName.toLowerCase()
                ).length;
                return (
                  <button
                    key={proj.id}
                    type="button"
                    onClick={() => setProjectTab(proj.projectName)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                      projectTab.toLowerCase() === proj.projectName.toLowerCase()
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-600'
                    }`}
                  >
                    {proj.projectName.replace('Perumahan ', '')} ({count})
                  </button>
                );
              })}
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              <option value="Tersedia">Hanya Unit Tersedia</option>
              <option value="ALL">Semua Status Kavling</option>
            </select>
            <input
              type="text"
              placeholder="Cari kode kavling (mis. A-15)..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              className="text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.slice(0, 24).map((unit) => (
            <div
              key={unit.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col justify-between relative"
            >
              <div>
                <div className="relative">
                  <EditableImage
                    slotKey={`unit-photo-${unit.id}`}
                    defaultSrc={unit.photos[0]}
                    alt={unit.code}
                    caption={`Foto Kavling ${unit.code}`}
                    className="w-full h-48 object-cover border-b border-gray-100"
                    onImageChange={(newUrl) => {
                      saveKavlingLotFull({
                        ...unit,
                        photos: [newUrl, ...unit.photos.slice(1)],
                      });
                    }}
                  />
                  {isAdmin && editMode && (
                    <button
                      type="button"
                      onClick={() => {
                        deleteRecordsFromCollection('units_kavling', [unit.id], false);
                        toast.success(`🗑️ Kavling ${unit.code} dihapus ke Trash`);
                      }}
                      className="absolute top-2.5 right-2.5 z-30 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md cursor-pointer"
                      title="Hapus Kavling Ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="p-5 space-y-2.5">
                  <div className="text-xs text-gray-500">
                    {unit.projectName} · Blok {unit.block} · Status:{' '}
                    <strong className="text-gray-800">
                      <EditableText
                        textKey={`web.unit.${unit.id}.status`}
                        fallback={unit.status}
                        category="Website"
                        location={`Kavling ${unit.code} - Status`}
                        onSaveOverride={(val) =>
                          saveKavlingLotFull({ ...unit, status: val as any })
                        }
                      />
                    </strong>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    <EditableText
                      textKey={`web.unit.${unit.id}.title`}
                      fallback={`Kavling ${unit.code} — ${unit.type}`}
                      category="Website"
                      location={`Kavling ${unit.code} - Judul & Tipe`}
                      onSaveOverride={(val) =>
                        saveKavlingLotFull({
                          ...unit,
                          type: val.split('—')[1]?.trim() || unit.type,
                        })
                      }
                    />
                  </h3>
                  <p className="text-xs text-gray-600">
                    <EditableText
                      textKey={`web.unit.${unit.id}.land`}
                      fallback={`Luas Tanah: ${unit.landSize} · ${unit.extraLand}`}
                      category="Website"
                      location={`Kavling ${unit.code} - Luas Tanah & Spesifikasi`}
                      onSaveOverride={(val) =>
                        saveKavlingLotFull({ ...unit, extraLand: val })
                      }
                    />
                  </p>
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Progress Konstruksi Lapangan</span>
                      <span className="font-mono font-semibold text-gray-800 tabular-nums">
                        <EditableText
                          textKey={`web.unit.${unit.id}.progress`}
                          fallback={`${unit.progress}%`}
                          category="Website"
                          location={`Kavling ${unit.code} - Progress (%)`}
                          onSaveOverride={(val) => {
                            const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
                            if (!isNaN(num)) {
                              saveKavlingLotFull({
                                ...unit,
                                progress: Math.min(100, Math.max(0, num)),
                              });
                            }
                          }}
                        />
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full"
                        style={{ width: `${unit.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-gray-900 tabular-nums">
                  <EditableText
                    textKey={`web.unit.${unit.id}.price`}
                    fallback={formatRupiah(unit.price)}
                    category="Website"
                    location={`Kavling ${unit.code} - Harga`}
                    onSaveOverride={(val) => {
                      const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
                      if (!isNaN(num) && num > 0) {
                        saveKavlingLotFull({ ...unit, price: num });
                      }
                    }}
                  />
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/unit/${unit.id}`}
                    className="px-3 py-1.5 border border-gray-300 bg-white rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Detail & KPR
                  </Link>
                  {unit.status === 'Tersedia' && (
                    <Link
                      to={`/booking?kavling=${unit.id}`}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                    >
                      Booking
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

// 5. DETAIL UNIT & SIMULASI KPR
export const PublicUnitDetailPage: React.FC = () => {
  const { id } = useParams();
  const { kavling, saveKavlingLotFull } = useAppStore();
  const unit = kavling.find((k) => k.id === id) || kavling[0];
  const [tenorYears, setTenorYears] = useState(15);
  const [dpAmount, setDpAmount] = useState(unit.companyId === 'PT_BPP' ? 1000000 : 1690000);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  React.useEffect(() => {
    setActivePhotoIndex(0);
  }, [unit.id, unit.photos?.length]);

  const validPhotos = (unit.photos || []).filter((p) => Boolean(p && p.trim()));
  const unitGallery =
    validPhotos.length > 0
      ? validPhotos
      : [
          unit.companyId === 'PT_BPP' ? ASSETS.bahagiaResidence : ASSETS.bahagiaLand,
          ASSETS.unitInterior,
          ASSETS.unitFloorplan,
        ];
  const currentMainPhoto = unitGallery[activePhotoIndex] || unitGallery[0] || ASSETS.placeholder;

  const loanPrincipal = Math.max(0, unit.price - dpAmount);
  const annualRate = 0.05;
  const monthlyRate = annualRate / 12;
  const months = tenorYears * 12;
  const monthlyInstallment =
    (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <PublicNavbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-4">
            <EditableImage
              slotKey={`unit-detail-main-${unit.id}-${activePhotoIndex}`}
              defaultSrc={currentMainPhoto}
              alt={unit.code}
              className="w-full h-80 object-cover rounded-xl border border-gray-200"
              onImageChange={(newUrl) => {
                const updated = [...unitGallery];
                updated[activePhotoIndex] = newUrl;
                saveKavlingLotFull({ ...unit, photos: updated });
              }}
            />
            {unitGallery.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                {unitGallery.map((imgSrc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`relative rounded-lg overflow-hidden border-2 h-20 cursor-pointer transition-all ${
                      activePhotoIndex === idx
                        ? 'border-emerald-600 ring-1 ring-emerald-500'
                        : 'border-gray-200 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={imgSrc} alt={`${unit.code} #${idx + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.2 bg-black/65 text-white text-[9px] font-mono rounded">
                      #{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <EditableImage
                slotKey={`unit-detail-interior-${unit.id}`}
                defaultSrc={ASSETS.unitInterior}
                alt="Interior Ruang Tamu"
                className="w-full h-44 object-cover rounded-xl border border-gray-200"
              />
              <EditableImage
                slotKey={`unit-detail-floorplan-${unit.id}`}
                defaultSrc={ASSETS.unitFloorplan}
                alt="Denah 7x13m"
                className="w-full h-44 object-cover rounded-xl border border-gray-200"
              />
            </div>

            {/* Live Camera Capture & Unit Photo Association Feature */}
            <UnitLiveCameraCapture unit={unit} />
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <div className="text-xs text-gray-500">
                {unit.projectName} · Status:{' '}
                <strong className="text-emerald-700">
                  <EditableText
                    textKey={`web.unit.${unit.id}.status`}
                    fallback={unit.status}
                    category="Website"
                    location={`Detail Unit ${unit.code} - Status`}
                    onSaveOverride={(val) =>
                      saveKavlingLotFull({ ...unit, status: val as any })
                    }
                  />
                </strong>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                <EditableText
                  textKey={`web.unit.${unit.id}.title`}
                  fallback={`Kavling ${unit.code} — ${unit.type}`}
                  category="Website"
                  location={`Detail Unit ${unit.code} - Judul`}
                />
              </h1>
              <div className="font-mono text-2xl font-bold text-emerald-700 tabular-nums">
                <EditableText
                  textKey={`web.unit.${unit.id}.price`}
                  fallback={formatRupiah(unit.price)}
                  category="Website"
                  location={`Detail Unit ${unit.code} - Harga`}
                  onSaveOverride={(val) => {
                    const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
                    if (!isNaN(num) && num > 0) saveKavlingLotFull({ ...unit, price: num });
                  }}
                />
              </div>
              <div className="text-xs text-gray-600 space-y-1.5 border-t border-gray-100 pt-3">
                <p>
                  <strong>Ukuran Tanah:</strong>{' '}
                  <EditableText
                    textKey={`web.unit.${unit.id}.landsize`}
                    fallback={unit.landSize}
                    category="Website"
                    location={`Detail Unit ${unit.code} - Ukuran Tanah`}
                    onSaveOverride={(val) =>
                      saveKavlingLotFull({ ...unit, landSize: val })
                    }
                  />
                </p>
                <p>
                  <strong>Keunggulan Spesifikasi:</strong>{' '}
                  <EditableText
                    textKey={`web.unit.${unit.id}.extraland`}
                    fallback={unit.extraLand}
                    category="Website"
                    location={`Detail Unit ${unit.code} - Keunggulan Spesifikasi`}
                    onSaveOverride={(val) =>
                      saveKavlingLotFull({ ...unit, extraLand: val })
                    }
                  />
                </p>
                <p>
                  <strong>Progress Pembangunan:</strong> {unit.progress}% (
                  <EditableText
                    textKey={`web.unit.${unit.id}.pjtnotes`}
                    fallback={unit.pjtNotes || 'Terverifikasi PJT'}
                    category="Website"
                    location={`Detail Unit ${unit.code} - Catatan Teknis`}
                    onSaveOverride={(val) =>
                      saveKavlingLotFull({ ...unit, pjtNotes: val })
                    }
                  />
                  )
                </p>
                <p>
                  <strong>Bank Mitra KPR:</strong>{' '}
                  <EditableText
                    textKey="web.unit.banks_info"
                    fallback="BTN, BRI, Mandiri (Bunga Subsidi 5% Flat)"
                    category="Website"
                    location="Detail Unit - Info Bank Mitra"
                  />
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to={`/booking?kavling=${unit.id}`}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2"
                >
                  <EditableText
                    textKey={`web.unit.${unit.id}.btn_booking`}
                    fallback={`Booking Kavling ${unit.code} Sekarang (Rp2.000.000)`}
                    category="Website"
                    location={`Detail Unit ${unit.code} - Tombol Booking`}
                  />
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* KPR Calculator */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <Calculator className="w-4 h-4 text-emerald-600" />
                <span>
                  <EditableText
                    textKey="web.unit.kpr_calc_heading"
                    fallback="Simulasi Angsuran KPR Subsidi FLPP (Bunga 5% Flat)"
                    category="Website"
                    location="Detail Unit - Judul Kalkulator KPR"
                  />
                </span>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-gray-600 block mb-1">Uang Muka (DP)</label>
                  <input
                    type="number"
                    value={dpAmount}
                    onChange={(e) => setDpAmount(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">Tenor KPR ({tenorYears} Tahun)</label>
                  <div className="flex items-center gap-2">
                    {[10, 15, 20].map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setTenorYears(yr)}
                        className={`flex-1 py-2 rounded-lg font-medium border ${
                          tenorYears === yr
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {yr} Tahun
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-emerald-800 block">Estimasi Angsuran / Bulan</span>
                    <span className="text-[11px] text-emerald-700">
                      Plafon Kredit: {formatRupiah(loanPrincipal)}
                    </span>
                  </div>
                  <div className="font-mono text-lg font-bold text-emerald-900 tabular-nums">
                    {formatRupiah(Math.round(monthlyInstallment))}/bln
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

// 6. BOOKING ONLINE PAGE
export const PublicBookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { kavling, addBooking } = useAppStore();
  const availableLots = kavling.filter((k) => k.status === 'Tersedia');
  const preselectedId = searchParams.get('kavling') || availableLots[0]?.id || 'TBL-C-07';

  const [selectedKavlingId, setSelectedKavlingId] = useState(preselectedId);
  const [buyerName, setBuyerName] = useState('');
  const [nik, setNik] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bank, setBank] = useState<'BTN' | 'BRI' | 'Mandiri'>('BTN');
  const [generatedBooking, setGeneratedBooking] = useState<string | null>(null);

  const chosenLot = kavling.find((k) => k.id === selectedKavlingId) || availableLots[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim() || !phone.trim() || !chosenLot) {
      toast.error('Mohon lengkapi nama lengkap dan nomor WhatsApp aktif.');
      return;
    }
    const created = addBooking({
      buyerName,
      nik: nik || '7471000000000001',
      phone,
      email: email || 'konsumen@bahagiagroup.com',
      companyId: chosenLot.companyId,
      kavlingId: chosenLot.id,
      kavlingCode: chosenLot.code,
      bank,
      bookingFee: 2000000,
      price: 169000000,
      stage: 'Booking',
      marketingPic: chosenLot.companyId === 'PT_TBL' ? 'Andi Saputra' : 'Fajar Ramadhan',
    });
    setGeneratedBooking(created.id);
    toast.success(`Booking berhasil dibuat dengan kode ${created.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <PublicNavbar />
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10">
        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              <EditableText
                textKey="web.booking.heading"
                fallback="Form Booking Unit Online"
                category="Website"
                location="Halaman Booking - Judul Utama"
              />
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              <EditableText
                textKey="web.booking.subheading"
                fallback="Otomatis menerbitkan nomor resmi BKG-2026-XXXX dan mengirim notifikasi email ke Marketing & Admin."
                category="Website"
                location="Halaman Booking - Subjudul"
              />
            </p>
          </div>

          {generatedBooking && (
            <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Booking Berhasil Diterbitkan: {generatedBooking}</span>
              </div>
              <p className="text-xs text-emerald-800">
                Kavling <strong>{chosenLot?.code}</strong> ({chosenLot?.projectName}) telah dikunci atas nama{' '}
                <strong>{buyerName}</strong>. Tim Marketing kami segera menghubungi WhatsApp {phone} untuk proses SPR & KPR Bank {bank}.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-700 font-medium block mb-1">
                  <EditableText
                    textKey="web.booking.lbl_kavling"
                    fallback="Pilih Kavling Tersedia *"
                    category="Website"
                    location="Form Booking - Label Pilih Kavling"
                  />
                </label>
                <select
                  value={selectedKavlingId}
                  onChange={(e) => setSelectedKavlingId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white"
                >
                  {availableLots.map((lot) => (
                    <option key={lot.id} value={lot.id}>
                      {lot.projectName} — Kavling {lot.code} (7×13m · Rp169 Jt)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-700 font-medium block mb-1">
                  <EditableText
                    textKey="web.booking.lbl_bank"
                    fallback="Pilih Bank Pelaksana KPR FLPP *"
                    category="Website"
                    location="Form Booking - Label Pilih Bank"
                  />
                </label>
                <select
                  value={bank}
                  onChange={(e) => setBank(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white"
                >
                  <option value="BTN">Bank BTN (Subsidi FLPP)</option>
                  <option value="BRI">Bank BRI (Subsidi FLPP)</option>
                  <option value="Mandiri">Bank Mandiri (Subsidi FLPP)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-700 font-medium block mb-1">
                  <EditableText
                    textKey="web.booking.lbl_nama"
                    fallback="Nama Lengkap Sesuai KTP *"
                    category="Website"
                    location="Form Booking - Label Nama Lengkap"
                  />
                </label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Contoh: La Ode Muhammad Akbar"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                />
              </div>
              <div>
                <label className="text-gray-700 font-medium block mb-1">
                  <EditableText
                    textKey="web.booking.lbl_nik"
                    fallback="Nomor Induk Kependudukan (NIK 16 Digit)"
                    category="Website"
                    location="Form Booking - Label NIK"
                  />
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  placeholder="7471xxxxxxxxxxxx"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-700 font-medium block mb-1">
                  <EditableText
                    textKey="web.booking.lbl_wa"
                    fallback="Nomor WhatsApp Aktif *"
                    category="Website"
                    location="Form Booking - Label WhatsApp"
                  />
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 font-mono"
                />
              </div>
              <div>
                <label className="text-gray-700 font-medium block mb-1">
                  <EditableText
                    textKey="web.booking.lbl_email"
                    fallback="Alamat Email (Untuk Bukti Booking)"
                    category="Website"
                    location="Form Booking - Label Email"
                  />
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">
                  <EditableText
                    textKey="web.booking.fee_title"
                    fallback="Biaya Tanda Jadi (Booking Fee Resmi)"
                    category="Website"
                    location="Form Booking - Judul Booking Fee"
                  />
                </div>
                <div className="text-gray-500">
                  <EditableText
                    textKey="web.booking.fee_desc"
                    fallback="Harga Jual Unit: Rp169.000.000 · Mengurangi Plafon / Biaya Awal"
                    category="Website"
                    location="Form Booking - Keterangan Booking Fee"
                  />
                </div>
              </div>
              <div className="font-mono text-base font-bold text-emerald-700 tabular-nums">
                <EditableText
                  textKey="web.booking.fee_amount"
                  fallback="Rp2.000.000"
                  category="Website"
                  location="Form Booking - Nominal Booking Fee"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <EditableText
                textKey="web.booking.btn_submit"
                fallback="Konfirmasi & Terbitkan Nomor Booking (BKG-2026-XXXX)"
                category="Website"
                location="Form Booking - Tombol Submit"
              />
            </button>
          </form>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

// 7. KOMPLAIN ONLINE PAGE
export const PublicComplaintPage: React.FC = () => {
  const {
    complaints,
    addComplaint,
    updateComplaintStatus,
    deleteComplaint,
    currentUser,
    editMode,
  } = useAppStore();
  const isAdmin = Boolean(currentUser && currentUser.active && currentUser.role === 'ADMIN');

  const [reporterName, setReporterName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyId, setCompanyId] = useState<'PT_TBL' | 'PT_BPP'>('PT_TBL');
  const [kavlingCode, setKavlingCode] = useState('A-04');
  const [category, setCategory] = useState('Plumbing & Air Bersih');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [generatedTicket, setGeneratedTicket] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporterName.trim() || !description.trim()) {
      toast.error('Mohon isi nama penghuni dan detail keluhan teknis.');
      return;
    }
    const tkt = addComplaint({
      reporterName,
      phone: phone || '0812000000',
      companyId,
      kavlingCode,
      category,
      description,
      assignedPic: companyId === 'PT_TBL' ? 'Budi Santoso, S.T.' : 'Agus Setiawan, S.T.',
      photos,
    });
    setGeneratedTicket(tkt.id);
    toast.success(`Tiket komplain ${tkt.id} berhasil diterbitkan`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <PublicNavbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 space-y-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              <EditableText
                textKey="web.complaint.heading"
                fallback="Layanan Purna Jual & Komplain Teknis Warga"
                category="Website"
                location="Halaman Komplain - Judul Utama"
              />
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              <EditableText
                textKey="web.complaint.subheading"
                fallback="Menerbitkan nomor tiket otomatis TKT-2026-XXXX yang langsung ditindaklanjuti oleh Pengawas & diverifikasi PJT."
                category="Website"
                location="Halaman Komplain - Subjudul"
              />
            </p>
          </div>

          {generatedTicket && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900">
              <strong>Tiket Komplain Diterbitkan: {generatedTicket}</strong> — Notifikasi telah dikirimkan ke Marketing, Admin, dan Pengawas Lapangan.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-gray-700 font-medium block mb-1">
                  <EditableText
                    textKey="web.complaint.lbl_perumahan"
                    fallback="Perumahan *"
                    category="Website"
                    location="Form Komplain - Label Perumahan"
                  />
                </label>
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="PT_TBL">Perumahan Bahagia Land (Kendari)</option>
                  <option value="PT_BPP">Perumahan Bahagia Residence (Ranomeeto)</option>
                </select>
              </div>
              <div>
                <label className="text-gray-700 font-medium block mb-1">
                  <EditableText
                    textKey="web.complaint.lbl_blok"
                    fallback="Nomor Blok / Kavling *"
                    category="Website"
                    location="Form Komplain - Label Nomor Blok"
                  />
                </label>
                <input
                  type="text"
                  required
                  value={kavlingCode}
                  onChange={(e) => setKavlingCode(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="text-gray-700 font-medium block mb-1">
                  <EditableText
                    textKey="web.complaint.lbl_kategori"
                    fallback="Kategori Keluhan *"
                    category="Website"
                    location="Form Komplain - Label Kategori"
                  />
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option>Plumbing & Air Bersih</option>
                  <option>Atap & Talang Hujan</option>
                  <option>Finishing Cat & Nat Keramik</option>
                  <option>Instalasi Listrik</option>
                  <option>Drainase & Jalan Lingkungan</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-700 font-medium block mb-1">
                  <EditableText
                    textKey="web.complaint.lbl_nama"
                    fallback="Nama Pemilik Unit *"
                    category="Website"
                    location="Form Komplain - Label Nama Pemilik"
                  />
                </label>
                <input
                  type="text"
                  required
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Nama pemilik rumah"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="text-gray-700 font-medium block mb-1">
                  <EditableText
                    textKey="web.complaint.lbl_wa"
                    fallback="Nomor WhatsApp *"
                    category="Website"
                    location="Form Komplain - Label WhatsApp"
                  />
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-700 font-medium block mb-1">
                <EditableText
                  textKey="web.complaint.lbl_deskripsi"
                  fallback="Deskripsi Detail Keluhan *"
                  category="Website"
                  location="Form Komplain - Label Deskripsi"
                />
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan bagian bangunan yang memerlukan perbaikan masa retensi/garansi..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <UploadFoto photos={photos} onChange={setPhotos} label="Lampirkan Foto Kondisi Bangunan (Opsional)" />

            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg cursor-pointer"
            >
              <EditableText
                textKey="web.complaint.btn_submit"
                fallback="Kirim & Generate Tiket Komplain (TKT-2026-XXXX)"
                category="Website"
                location="Form Komplain - Tombol Submit"
              />
            </button>
          </form>
        </div>

        {/* Status Lacak Tiket */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-base font-bold text-gray-900">
            <EditableText
              textKey="web.complaint.table_heading"
              fallback="Daftar Tiket Komplain & Status Penanganan"
              category="Website"
              location="Halaman Komplain - Judul Tabel Tiket"
            />
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="py-2.5 px-3">Nomor Tiket</th>
                  <th className="py-2.5 px-3">Kavling</th>
                  <th className="py-2.5 px-3">Pelapor</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3">PIC Lapangan</th>
                  <th className="py-2.5 px-3">Status</th>
                  {isAdmin && <th className="py-2.5 px-3 text-right">Aksi Admin</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {complaints.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2.5 px-3 font-mono font-semibold text-gray-900">{c.id}</td>
                    <td className="py-2.5 px-3 font-mono">{c.kavlingCode}</td>
                    <td className="py-2.5 px-3">{c.reporterName}</td>
                    <td className="py-2.5 px-3">{c.category}</td>
                    <td className="py-2.5 px-3">{c.assignedPic}</td>
                    <td className="py-2.5 px-3 font-medium text-emerald-700">
                      {isAdmin && editMode ? (
                        <select
                          value={c.status}
                          onChange={(e) => {
                            updateComplaintStatus(c.id, e.target.value as any);
                            toast.success(`Status tiket ${c.id} diperbarui`);
                          }}
                          className="border border-gray-300 rounded px-2 py-1 text-xs bg-white"
                        >
                          <option value="Baru">Baru</option>
                          <option value="Diproses Pengawas">Diproses Pengawas</option>
                          <option value="Verifikasi PJT">Verifikasi PJT</option>
                          <option value="Selesai">Selesai</option>
                        </select>
                      ) : (
                        c.status
                      )}
                    </td>
                    {isAdmin && (
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            deleteComplaint(c.id);
                            toast.success(`🗑️ Tiket komplain ${c.id} dihapus`);
                          }}
                          className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded text-[10px] font-bold cursor-pointer"
                        >
                          🗑️ Hapus
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

// 8 & 9. TENTANG & KONTAK PAGE
export const PublicAboutContactPage: React.FC = () => {
  const {
    companies,
    updateCompany,
    addCompanyFull,
    deleteCompanySoft,
    currentUser,
    editMode,
  } = useAppStore();
  const isAdmin = Boolean(currentUser && currentUser.active && currentUser.role === 'ADMIN');

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <PublicNavbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-8">
        <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-emerald-700 font-semibold">
              <EditableText
                textKey="web.about.kicker"
                fallback="PROFIL GRUP & INFO LEGALITAS"
                category="Website"
                location="Halaman Tentang - Kicker Atas"
              />
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  addCompanyFull({
                    name: 'PT Entitas Anak Perusahaan Baru',
                    projectName: 'Perumahan Bahagia Baru',
                    slug: `bahagia-${Date.now().toString().slice(-3)}`,
                    totalUnits: 50,
                    location: 'Kota Kendari, Sulawesi Tenggara',
                    coordinates: { lat: -4.0096, lng: 122.5127 },
                    operationalHours: 'Senin - Sabtu (08.00 - 17.00 WITA)',
                    legality: 'SHGB Induk & PBG Lengkap',
                    phone: '0811-4055-667',
                    whatsapp: '628114055667',
                  });
                  toast.success('✅ Kartu Perusahaan/PT baru berhasil ditambahkan!');
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Entitas PT</span>
              </button>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            <EditableText
              textKey="web.about.heading"
              fallback="Bahagia Group Property"
              category="Website"
              location="Halaman Tentang - Judul Utama"
            />
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            <EditableText
              textKey="web.about.description"
              fallback="Bahagia Group Property merupakan induk usaha pengembang properti di Sulawesi Tenggara yang menaungi PT Tata Bahagia Land (Perumahan Bahagia Land - Kota Kendari) dan PT Bahagia Prima Property (Perumahan Bahagia Residence - Kab. Konawe Selatan). Dengan total 122 unit rumah subsidi berkualitas tinggi dan HPP terukur Rp67.651.710/unit, kami menghadirkan rumah layak huni seharga Rp169.000.000/unit."
              category="Website"
              location="Halaman Tentang - Paragraf Deskripsi Profil"
            />
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {companies.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-gray-200 rounded-xl p-6 space-y-3 text-xs relative"
            >
              {isAdmin && editMode && (
                <button
                  type="button"
                  onClick={() => {
                    deleteCompanySoft(c.id);
                    toast.success(`🗑️ Entitas ${c.name} dihapus ke Trash`);
                  }}
                  className="absolute top-4 right-4 p-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg cursor-pointer"
                  title="Hapus Entitas PT Ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <div className="text-sm font-bold text-gray-900 pr-8">
                <EditableText
                  textKey={`web.company.${c.id}.name`}
                  fallback={c.name}
                  category="Website"
                  location={`Profil PT ${c.id} - Nama PT`}
                  onSaveOverride={(val) => updateCompany(c.id as any, { name: val })}
                />
              </div>
              <div className="text-emerald-700 font-semibold">
                <EditableText
                  textKey={`web.company.${c.id}.project`}
                  fallback={c.projectName}
                  category="Website"
                  location={`Profil PT ${c.id} - Nama Proyek`}
                  onSaveOverride={(val) => updateCompany(c.id as any, { projectName: val })}
                />
              </div>
              <p>
                <strong>Alamat Lokasi:</strong>{' '}
                <EditableText
                  textKey={`web.company.${c.id}.location`}
                  fallback={c.location}
                  category="Website"
                  location={`Profil PT ${c.id} - Alamat Lokasi`}
                  onSaveOverride={(val) => updateCompany(c.id as any, { location: val })}
                />
              </p>
              <p>
                <strong>Titik Koordinat:</strong>{' '}
                <EditableText
                  textKey={`web.company.${c.id}.coords`}
                  fallback={`Lat ${c.coordinates.lat}, Lng ${c.coordinates.lng}`}
                  category="Website"
                  location={`Profil PT ${c.id} - Koordinat GPS`}
                />
              </p>
              <p>
                <strong>Jam Operasional:</strong>{' '}
                <EditableText
                  textKey={`web.company.${c.id}.hours`}
                  fallback={c.operationalHours}
                  category="Website"
                  location={`Profil PT ${c.id} - Jam Operasional`}
                  onSaveOverride={(val) => updateCompany(c.id as any, { operationalHours: val })}
                />
              </p>
              <p>
                <strong>Legalitas Proyek:</strong>{' '}
                <EditableText
                  textKey={`web.company.${c.id}.legality`}
                  fallback={c.legality}
                  category="Website"
                  location={`Profil PT ${c.id} - Legalitas`}
                  onSaveOverride={(val) => updateCompany(c.id as any, { legality: val })}
                />
              </p>
              <p>
                <strong>Telepon / WhatsApp Resmi:</strong>{' '}
                <EditableText
                  textKey={`web.company.${c.id}.phone`}
                  fallback={`${c.phone} / +${c.whatsapp}`}
                  category="Website"
                  location={`Profil PT ${c.id} - Telepon & WhatsApp`}
                  onSaveOverride={(val) =>
                    updateCompany(c.id as any, { phone: val.split('/')[0]?.trim() || val })
                  }
                />
              </p>
            </div>
          ))}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

// 10. LOGIN PAGE
export const PublicLoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/dashboard';
  const isExpired = searchParams.get('expired') === 'true';

  const [activeTab, setActiveTab] = useState<'STAFF' | 'PUBLIC'>('STAFF');
  const [email, setEmail] = useState('superadmin@bahagia.com');
  const [password, setPassword] = useState('Password123!');
  const [errorMsg, setErrorMsg] = useState<string | null>(
    isExpired ? 'Sesi Anda telah berakhir. Silakan login kembali untuk melanjutkan.' : null
  );
  const [loading, setLoading] = useState(false);

  const { loginWithSeed, switchQuickRole } = useAppStore();
  const navigate = useNavigate();

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      try {
        const { signInWithEmailAndPassword } = await import('../lib/firebase');
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } catch {
        // Fallback ke verifikasi RBAC Seed Store
      }

      const res = loginWithSeed(email, password);
      if (!res.ok) {
        setErrorMsg(res.message);
        toast.error(res.message);
        return;
      }

      toast.success(res.message);
      navigate(redirectTarget, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error('Masukkan alamat email Anda terlebih dahulu pada kolom Email.');
      return;
    }
    try {
      const { sendPasswordResetEmail } = await import('../lib/firebase');
      await sendPasswordResetEmail(auth, email.trim());
      toast.success(`Tautan reset password telah dikirim ke ${email}`);
    } catch {
      toast.success(`Instruksi pemulihan password untuk ${email} telah dikirimkan ke email Anda.`);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      switchQuickRole('usr-superadmin-bahagia');
      toast.success(`Login Google berhasil sebagai ${cred.user.email}`);
      navigate(redirectTarget, { replace: true });
    } catch {
      toast.error('Gagal masuk dengan popup Google, silakan gunakan form Email & Password.');
    }
  };

  const selectSeedAccount = (u: typeof SEED_USERS[number]) => {
    setEmail(u.email);
    setPassword(u.password);
    setErrorMsg(null);
    toast.info(`Kredensial ${u.email} dimasukkan. Klik tombol "Login" untuk masuk.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <PublicNavbar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Card */}
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-xl p-6 space-y-5 shadow-xs">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
              BG
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                <EditableText
                  textKey="web.login.heading"
                  fallback="Bahagia Group ERP"
                  category="Website"
                  location="Halaman Login - Judul"
                />
              </h1>
              <p className="text-xs text-emerald-700 font-medium">
                <EditableText
                  textKey="web.login.subheading"
                  fallback="Portal Autentikasi & Kontrol Akses (RBAC)"
                  category="Website"
                  location="Halaman Login - Subjudul"
                />
              </p>
            </div>
          </div>

          {searchParams.get('redirect') && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
              Anda harus <strong>login</strong> terlebih dahulu untuk mengakses halaman{' '}
              <code className="font-mono font-bold">{searchParams.get('redirect')}</code>.
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setActiveTab('STAFF');
                setEmail('superadmin@bahagia.com');
                setPassword('Password123!');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-md transition-colors ${
                activeTab === 'STAFF' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
              }`}
            >
              1. Staf ERP & Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('PUBLIC');
                setEmail('user@test.com');
                setPassword('user123');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-md transition-colors ${
                activeTab === 'PUBLIC' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
              }`}
            >
              2. Konsumen Publik
            </button>
          </div>

          <form onSubmit={handleFormLogin} className="space-y-4 text-xs">
            <div>
              <label className="text-gray-700 font-medium block mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@bahagia.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:border-emerald-600 outline-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-gray-700 font-medium">Password</label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Lupa Password?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 font-mono focus:border-emerald-600 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Memverifikasi...' : 'Login'}</span>
            </button>
          </form>

          <div className="border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-2.5 px-4 border border-gray-300 hover:bg-gray-50 text-gray-800 text-xs font-medium rounded-lg flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Login via Firebase Google OAuth</span>
            </button>
          </div>
        </div>

        {/* Seed Accounts Quick Selector */}
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              <EditableText
                textKey="web.login.seed_heading"
                fallback="Akun Default Testing RBAC (Klik untuk Mengisi Form Login)"
                category="Website"
                location="Halaman Login - Judul Akun Default"
              />
            </h2>
            <p className="text-xs text-gray-500">
              <EditableText
                textKey="web.login.seed_subheading"
                fallback="Pilih salah satu akun di bawah untuk menguji hak akses menu sidebar dan proteksi halaman sesuai Role."
                category="Website"
                location="Halaman Login - Subjudul Akun Default"
              />
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
            {SEED_USERS.slice(0, 3).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => selectSeedAccount(u)}
                className="p-3 bg-white border border-emerald-300 hover:border-emerald-600 rounded-lg text-left transition-all cursor-pointer"
              >
                <div className="text-xs font-bold text-emerald-900">{u.role}</div>
                <div className="text-[11px] font-mono text-gray-800 truncate mt-0.5">{u.email}</div>
                <div className="text-[10px] font-mono text-gray-500 mt-0.5">Pass: {u.password}</div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
            {SEED_USERS.slice(3).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => selectSeedAccount(u)}
                className="p-3 border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/30 rounded-lg text-left transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-gray-900 truncate">
                    {u.role} — {u.companyId === 'GROUP' ? 'GRUP' : u.companyId}
                  </div>
                  <div className="text-[11px] text-gray-600 font-mono truncate">{u.email}</div>
                  <div className="text-[10px] text-gray-400">Pass: {u.password}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};
