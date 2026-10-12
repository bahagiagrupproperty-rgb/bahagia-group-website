import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { EditableText, EditableImage } from './SuperAdminInlineEditor';
import { PublicNavbar, PublicFooter } from '../pages/PublicWebsitePages';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Calendar,
  ZoomIn,
  X,
  ArrowRight,
  Share2,
  Eye,
  Tag,
  CheckCircle2,
  Building2,
  Sparkles,
  BookOpen,
  Settings,
  Plus,
  Trash2,
  Edit3,
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// SECTION 1: TESTIMONI KONSUMEN ("Apa Kata Penghuni Kami") — SLIDER / CAROUSEL
// ============================================================================
export const PublicTestimonialsSection: React.FC = () => {
  const {
    publicTestimonials,
    testimonialSettings,
    currentUser,
    editMode,
    savePublicTestimonial,
    deletePublicTestimonial,
    toggleTestimonialFeatured,
  } = useAppStore();
  const isAdmin = Boolean(currentUser && currentUser.active && currentUser.role === 'ADMIN');

  const sortedActiveTestimonials = useMemo(() => {
    const activeList = publicTestimonials.filter((t) => t.status === 'Aktif');
    const sorted = [...activeList].sort((a, b) => {
      if (testimonialSettings.orderMode === 'TERBARU') {
        return b.date.localeCompare(a.date);
      }
      if (testimonialSettings.orderMode === 'RATING_TERTINGGI') {
        return b.rating - a.rating || a.order - b.order;
      }
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return a.order - b.order;
    });
    return sorted.slice(0, testimonialSettings.maxDisplayCount || 6);
  }, [publicTestimonials, testimonialSettings]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState('A-01');
  const [newProject, setNewProject] = useState<'Bahagia Land' | 'Bahagia Residence'>('Bahagia Land');
  const [newQuote, setNewQuote] = useState('');
  const [newRating, setNewRating] = useState(5);

  useEffect(() => {
    const updateLayout = () => {
      if (window.innerWidth < 768) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  const maxStartIndex = Math.max(0, sortedActiveTestimonials.length - cardsPerView);

  useEffect(() => {
    if (currentIndex > maxStartIndex) {
      setCurrentIndex(0);
    }
  }, [currentIndex, maxStartIndex]);

  useEffect(() => {
    if (
      !testimonialSettings.showOnHomepage ||
      sortedActiveTestimonials.length <= cardsPerView ||
      editMode
    ) {
      return;
    }
    const intervalMs = Math.max(2, testimonialSettings.autoSlideSeconds || 5) * 1000;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxStartIndex ? 0 : prev + 1));
    }, intervalMs);
    return () => clearInterval(timer);
  }, [
    testimonialSettings.showOnHomepage,
    testimonialSettings.autoSlideSeconds,
    sortedActiveTestimonials.length,
    cardsPerView,
    maxStartIndex,
    editMode,
  ]);

  if (!testimonialSettings.showOnHomepage && !isAdmin) {
    return null;
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxStartIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxStartIndex ? 0 : prev + 1));
  };

  const visibleTestimonials = sortedActiveTestimonials.slice(
    currentIndex,
    currentIndex + cardsPerView
  );

  const totalDots = maxStartIndex + 1;

  const handleQuickAddTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newQuote.trim()) {
      toast.error('Mohon isi nama konsumen dan isi testimoni');
      return;
    }
    savePublicTestimonial({
      consumerName: newName.trim(),
      unitBlock: newUnit.trim() || 'A-01',
      projectName: newProject,
      photoUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      testimonialText: newQuote.trim(),
      rating: newRating,
      date: new Date().toISOString().slice(0, 10),
      status: 'Aktif',
      isFeatured: true,
    });
    setNewName('');
    setNewQuote('');
    setShowQuickAddModal(false);
    toast.success('✅ Testimoni baru berhasil ditambahkan!');
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <EditableText
              textKey="web.testimoni_new.kicker"
              fallback="TESTIMONI PENGHUNI RESMI · BAHAGIA LAND & BAHAGIA RESIDENCE"
              category="Website"
              location="Section Testimoni - Label Kicker Atas"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            <EditableText
              textKey="web.testimoni_new.heading"
              fallback="Apa Kata Penghuni Kami"
              category="Website"
              location="Section Testimoni - Judul Utama"
            />
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            <EditableText
              textKey="web.testimoni_new.subheading"
              fallback="Pengalaman nyata keluarga yang telah melaksanakan akad KPR dan menghuni unit di Perumahan Bahagia Land & Bahagia Residence."
              category="Website"
              location="Section Testimoni - Subjudul"
            />
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-end">
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => setShowQuickAddModal(true)}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Testimoni</span>
              </button>
              <Link
                to="/sistem/testimoni"
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Kelola Semua Testimoni</span>
              </Link>
            </>
          )}
          {sortedActiveTestimonials.length > cardsPerView && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Testimoni Sebelumnya"
                className="w-9 h-9 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 cursor-pointer shadow-2xs transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Testimoni Selanjutnya"
                className="w-9 h-9 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 cursor-pointer shadow-2xs transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {sortedActiveTestimonials.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-xs text-gray-500">
          <EditableText
            textKey="web.testimoni_new.empty"
            fallback="Belum ada testimoni aktif yang ditampilkan."
            category="Website"
            location="Section Testimoni - Pesan Kosong"
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleTestimonials.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col justify-between shadow-2xs hover:border-emerald-300 transition-all duration-200 relative"
              >
                <div className="space-y-4">
                  {/* Top: Foto Konsumen (EditableImage) & Bintang Rating */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <EditableImage
                        slotKey={`testimoni-photo-${item.id}`}
                        defaultSrc={item.photoUrl}
                        alt={item.consumerName}
                        caption={`Foto Konsumen ${item.consumerName}`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shrink-0"
                        onImageChange={(newUrl) => {
                          savePublicTestimonial({ ...item, photoUrl: newUrl });
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              onClick={() => {
                                if (isAdmin && editMode) {
                                  savePublicTestimonial({ ...item, rating: i + 1 });
                                  toast.success(`Rating diubah menjadi ${i + 1} bintang`);
                                }
                              }}
                              className={`w-4 h-4 ${
                                isAdmin && editMode ? 'cursor-pointer' : ''
                              } ${
                                i < item.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-mono text-gray-400 block mt-0.5">
                          <EditableText
                            textKey={`web.testimoni.${item.id}.date`}
                            fallback={item.date}
                            category="Website"
                            location={`Testimoni ${item.consumerName} - Tanggal`}
                            onSaveOverride={(val) =>
                              savePublicTestimonial({ ...item, date: val })
                            }
                          />
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {item.isFeatured && (
                        <span className="px-2 py-0.5 rounded-sm bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
                          <EditableText
                            textKey="web.testimoni.badge_pilihan"
                            fallback="★ Pilihan"
                            category="Website"
                            location="Testimoni - Label Badge Pilihan"
                          />
                        </span>
                      )}
                      {isAdmin && editMode && (
                        <button
                          type="button"
                          onClick={() => {
                            deletePublicTestimonial(item.id);
                            toast.success(`🗑️ Testimoni ${item.consumerName} dihapus`);
                          }}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-[10px] font-bold cursor-pointer"
                          title="Hapus Testimoni Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quote Testimoni */}
                  <p className="text-sm text-gray-700 leading-relaxed italic">
                    "
                    <EditableText
                      textKey={`web.testimoni.${item.id}.quote`}
                      fallback={item.testimonialText}
                      category="Website"
                      location={`Testimoni ${item.consumerName} - Isi Testimoni`}
                      onSaveOverride={(val) =>
                        savePublicTestimonial({ ...item, testimonialText: val })
                      }
                    />
                    "
                  </p>
                </div>

                {/* Bottom: Nama Konsumen & Unit/Proyek */}
                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-gray-900 text-sm">
                      <EditableText
                        textKey={`web.testimoni.${item.id}.name`}
                        fallback={item.consumerName}
                        category="Website"
                        location={`Testimoni ${item.consumerName} - Nama Konsumen`}
                        onSaveOverride={(val) =>
                          savePublicTestimonial({ ...item, consumerName: val })
                        }
                      />
                    </div>
                    <div className="text-xs text-emerald-700 font-medium">
                      <EditableText
                        textKey={`web.testimoni.${item.id}.unit`}
                        fallback={`Penghuni ${item.projectName} ${item.unitBlock}`}
                        category="Website"
                        location={`Testimoni ${item.consumerName} - Proyek & Blok`}
                        onSaveOverride={(val) =>
                          savePublicTestimonial({
                            ...item,
                            unitBlock: val.replace(`Penghuni ${item.projectName}`, '').trim() || item.unitBlock,
                          })
                        }
                      />
                    </div>
                  </div>
                  {isAdmin && editMode ? (
                    <button
                      type="button"
                      onClick={() => toggleTestimonialFeatured(item.id)}
                      className="px-2 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded text-[10px] font-bold cursor-pointer"
                    >
                      {item.isFeatured ? '★ Unfeature' : '☆ Set Featured'}
                    </button>
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          {totalDots > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              {Array.from({ length: totalDots }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx
                      ? 'w-7 bg-emerald-600'
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal Tambah Testimoni Cepat (Super Admin) */}
      {showQuickAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">+ Tambah Testimoni Penghuni Baru</h3>
              <button
                type="button"
                onClick={() => setShowQuickAddModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleQuickAddTestimonial} className="space-y-3">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Nama Konsumen *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Proyek</label>
                  <select
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="Bahagia Land">Bahagia Land</option>
                    <option value="Bahagia Residence">Bahagia Residence</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Blok / Unit</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="A-05"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Rating Bintang (1-5)</label>
                <select
                  value={newRating}
                  onChange={(e) => setNewRating(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r} Bintang (⭐)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Isi Testimoni *</label>
                <textarea
                  rows={3}
                  required
                  value={newQuote}
                  onChange={(e) => setNewQuote(e.target.value)}
                  placeholder="Tulis testimoni penghuni..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                >
                  💾 Simpan Testimoni
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

// ============================================================================
// SECTION 2: GALERI PEMBANGUNAN & PROGRESS FISIK ("Galeri & Progress Pembangunan")
// ============================================================================
export const PublicGalleryProgressSection: React.FC = () => {
  const {
    galleryPhotos,
    projectPhysicalProgress,
    gallerySettings,
    currentUser,
    editMode,
    saveGalleryPhoto,
    deleteGalleryPhoto,
    updateProjectPhysicalProgress,
  } = useAppStore();

  const isAdmin = Boolean(currentUser && currentUser.active && currentUser.role === 'ADMIN');

  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedProject, setSelectedProject] = useState<string>('Semua Proyek');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showQuickAddPhotoModal, setShowQuickAddPhotoModal] = useState(false);
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('Progress Pembangunan');
  const [newPhotoProject, setNewPhotoProject] = useState('Bahagia Land');
  const [newPhotoBlock, setNewPhotoBlock] = useState('Blok A');
  const [newPhotoDesc, setNewPhotoDesc] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  const activePhotos = useMemo(() => {
    return [...galleryPhotos]
      .filter((p) => p.status === 'Aktif')
      .sort((a, b) => {
        if (a.isFeaturedOnHome !== b.isFeaturedOnHome) {
          return a.isFeaturedOnHome ? -1 : 1;
        }
        return a.order - b.order;
      });
  }, [galleryPhotos]);

  const filteredPhotos = useMemo(() => {
    return activePhotos
      .filter((p) => {
        if (selectedCategory !== 'Semua' && p.category !== selectedCategory) {
          return false;
        }
        if (
          selectedProject !== 'Semua Proyek' &&
          p.projectName.toLowerCase() !== selectedProject.toLowerCase()
        ) {
          return false;
        }
        return true;
      })
      .slice(0, gallerySettings.maxPhotosHomepage || 9);
  }, [activePhotos, selectedCategory, selectedProject, gallerySettings.maxPhotosHomepage]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % filteredPhotos.length
        );
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null
            ? null
            : (prev - 1 + filteredPhotos.length) % filteredPhotos.length
        );
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, filteredPhotos.length]);

  if (!gallerySettings.showGallerySection && !gallerySettings.showProgressSection && !isAdmin) {
    return null;
  }

  const categoryTabs = ['Semua', ...(gallerySettings.customCategories || [])];
  const currentLightboxPhoto =
    lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  const handleQuickAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoTitle.trim()) {
      toast.error('Mohon isi judul foto galeri');
      return;
    }
    saveGalleryPhoto({
      title: newPhotoTitle.trim(),
      category: newPhotoCategory,
      projectName: newPhotoProject,
      unitBlock: newPhotoBlock,
      photoUrl:
        newPhotoUrl.trim() ||
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80',
      dateTaken: new Date().toISOString().slice(0, 10),
      description: newPhotoDesc.trim() || 'Dokumentasi lapangan terbaru Bahagia Group Property.',
      status: 'Aktif',
      isFeaturedOnHome: true,
    });
    setNewPhotoTitle('');
    setNewPhotoDesc('');
    setNewPhotoUrl('');
    setShowQuickAddPhotoModal(false);
    toast.success('✅ Foto galeri baru berhasil ditambahkan!');
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <EditableText
              textKey="web.galeri_progress.kicker"
              fallback="TRANSPARANSI KONSTRUKSI LAPANGAN · TANPA REKAYASA"
              category="Website"
              location="Section Galeri & Progress - Label Kicker Atas"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            <EditableText
              textKey="web.galeri_progress.heading"
              fallback="Galeri & Progress Pembangunan"
              category="Website"
              location="Section Galeri & Progress - Judul"
            />
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            <EditableText
              textKey="web.galeri_progress.subheading"
              fallback="Dokumentasi foto pembangunan unit, jalan kawasan, serah terima kunci, serta persentase capaian fisik terkini kedua proyek."
              category="Website"
              location="Section Galeri & Progress - Subjudul"
            />
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-end">
            <button
              type="button"
              onClick={() => setShowQuickAddPhotoModal(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Foto Galeri</span>
            </button>
            <Link
              to="/sistem/galeri"
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Kelola Galeri & Update Progress</span>
            </Link>
          </div>
        )}
      </div>

      {/* Bagian 1: Filter Kategori & Proyek + Grid Foto 3x3 */}
      {gallerySettings.showGallerySection && (
        <div className="space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white border border-gray-200 rounded-xl p-3.5">
            {/* Filter Kategori */}
            <div className="flex flex-wrap items-center gap-1.5">
              {categoryTabs.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setLightboxIndex(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Filter Proyek */}
            <div className="flex items-center gap-1.5 shrink-0">
              {['Semua Proyek', 'Bahagia Land', 'Bahagia Residence'].map((proj) => (
                <button
                  key={proj}
                  type="button"
                  onClick={() => {
                    setSelectedProject(proj);
                    setLightboxIndex(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    selectedProject === proj
                      ? 'bg-gray-900 text-white border-gray-900 font-semibold'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {proj}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Foto: Desktop 3 kolom (3x3 = 9 foto), Mobile 2 kolom */}
          {filteredPhotos.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-xs text-gray-500">
              <EditableText
                textKey="web.galeri_progress.empty"
                fallback="Tidak ada foto galeri pada filter kategori/proyek ini."
                category="Website"
                location="Section Galeri - Pesan Kosong"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredPhotos.map((photo, idx) => (
                <div
                  key={photo.id}
                  onClick={() => {
                    if (!editMode) setLightboxIndex(idx);
                  }}
                  className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs hover:border-emerald-400 transition-all cursor-pointer flex flex-col justify-between relative"
                >
                  <div className="relative overflow-hidden h-44 sm:h-56 bg-gray-100">
                    <EditableImage
                      slotKey={`gallery-photo-${photo.id}`}
                      defaultSrc={photo.photoUrl}
                      alt={photo.title}
                      caption={photo.title}
                      className="w-full h-44 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                      onImageChange={(newUrl) => {
                        saveGalleryPhoto({ ...photo, photoUrl: newUrl });
                      }}
                    />
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1 z-20">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-900/80 text-white backdrop-blur-xs">
                        <EditableText
                          textKey={`web.galeri.${photo.id}.cat`}
                          fallback={photo.category}
                          category="Website"
                          location={`Foto Galeri ${photo.title} - Kategori`}
                          onSaveOverride={(val) =>
                            saveGalleryPhoto({ ...photo, category: val })
                          }
                        />
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-700/90 text-white">
                        <EditableText
                          textKey={`web.galeri.${photo.id}.proj`}
                          fallback={photo.projectName}
                          category="Website"
                          location={`Foto Galeri ${photo.title} - Proyek`}
                          onSaveOverride={(val) =>
                            saveGalleryPhoto({ ...photo, projectName: val })
                          }
                        />
                      </span>
                    </div>
                    {isAdmin && editMode && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteGalleryPhoto(photo.id);
                          toast.success(`🗑️ Foto "${photo.title}" dihapus dari galeri`);
                        }}
                        className="absolute top-2.5 right-2.5 z-30 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md cursor-pointer"
                        title="Hapus Foto Galeri Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {!editMode && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center pointer-events-none">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 text-gray-900 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md">
                          <ZoomIn className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Perbesar Foto</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-3.5 sm:p-4 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                      <span>
                        <EditableText
                          textKey={`web.galeri.${photo.id}.block`}
                          fallback={photo.unitBlock || photo.projectName}
                          category="Website"
                          location={`Foto Galeri ${photo.title} - Blok/Unit`}
                          onSaveOverride={(val) =>
                            saveGalleryPhoto({ ...photo, unitBlock: val })
                          }
                        />
                      </span>
                      <span>
                        <EditableText
                          textKey={`web.galeri.${photo.id}.date`}
                          fallback={photo.dateTaken}
                          category="Website"
                          location={`Foto Galeri ${photo.title} - Tanggal`}
                          onSaveOverride={(val) =>
                            saveGalleryPhoto({ ...photo, dateTaken: val })
                          }
                        />
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-emerald-700">
                      <EditableText
                        textKey={`web.galeri.${photo.id}.title`}
                        fallback={photo.title}
                        category="Website"
                        location={`Foto Galeri ${photo.id} - Judul`}
                        onSaveOverride={(val) =>
                          saveGalleryPhoto({ ...photo, title: val })
                        }
                      />
                    </h3>
                    <p className="text-[11px] text-gray-600 line-clamp-2 hidden sm:block">
                      <EditableText
                        textKey={`web.galeri.${photo.id}.desc`}
                        fallback={photo.description}
                        category="Website"
                        location={`Foto Galeri ${photo.id} - Deskripsi`}
                        onSaveOverride={(val) =>
                          saveGalleryPhoto({ ...photo, description: val })
                        }
                      />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bagian 2: Progress Bar Pembangunan Fisik per Proyek */}
      {gallerySettings.showProgressSection && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {projectPhysicalProgress.map((prog) => (
            <div
              key={prog.id}
              className="bg-white border border-gray-200 rounded-xl p-6 space-y-5 shadow-2xs"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-emerald-700 block">
                    <EditableText
                      textKey={`web.progress.${prog.id}.kicker`}
                      fallback="CAPAIAN KONSTRUKSI FISIK KAWASAN"
                      category="Website"
                      location={`Progress ${prog.projectName} - Kicker`}
                    />
                  </span>
                  <h3 className="text-lg font-bold text-gray-900">
                    <EditableText
                      textKey={`web.progress.${prog.id}.title`}
                      fallback={`PROGRESS PEMBANGUNAN ${prog.projectName.toUpperCase()}`}
                      category="Website"
                      location={`Progress ${prog.projectName} - Judul`}
                    />
                  </h3>
                </div>
                <div className="text-right">
                  <span className="font-mono text-2xl font-extrabold text-emerald-600 tabular-nums">
                    <EditableText
                      textKey={`web.progress.${prog.id}.overall`}
                      fallback={`${prog.overallPercentage}%`}
                      category="Website"
                      location={`Progress ${prog.projectName} - Persentase Keseluruhan`}
                      onSaveOverride={(val) => {
                        const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
                        if (!isNaN(num)) {
                          updateProjectPhysicalProgress(prog.id, {
                            overallPercentage: Math.min(100, Math.max(0, num)),
                            stages: prog.stages,
                          });
                        }
                      }}
                    />
                  </span>
                  <span className="block text-[10px] text-gray-400 font-mono">
                    Update: {prog.updatedAt.slice(0, 10)}
                  </span>
                </div>
              </div>

              {/* Overall Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-800">
                  <span>
                    <EditableText
                      textKey={`web.progress.${prog.id}.overall_lbl`}
                      fallback={`Progress Keseluruhan (${prog.projectName})`}
                      category="Website"
                      location={`Progress ${prog.projectName} - Label Overall`}
                    />
                  </span>
                  <span className="font-mono font-bold text-emerald-700 tabular-nums">
                    {prog.overallPercentage}% Selesai
                  </span>
                </div>
                <div className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${prog.overallPercentage}%` }}
                  />
                </div>
              </div>

              {/* Breakdown 5 Tahapan Pekerjaan */}
              <div className="space-y-3 pt-1">
                {prog.stages.map((st) => (
                  <div key={st.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-700 font-medium">
                        <EditableText
                          textKey={`web.progress.${prog.id}.stage.${st.id}.lbl`}
                          fallback={st.label}
                          category="Website"
                          location={`Progress ${prog.projectName} - Nama Tahap ${st.label}`}
                          onSaveOverride={(newLbl) => {
                            updateProjectPhysicalProgress(prog.id, {
                              overallPercentage: prog.overallPercentage,
                              stages: prog.stages.map((s) =>
                                s.id === st.id ? { ...s, label: newLbl } : s
                              ),
                            });
                          }}
                        />
                      </span>
                      <span className="font-mono font-bold text-gray-900 tabular-nums">
                        <EditableText
                          textKey={`web.progress.${prog.id}.stage.${st.id}.pct`}
                          fallback={`${st.percentage}%`}
                          category="Website"
                          location={`Progress ${prog.projectName} - Persentase ${st.label}`}
                          onSaveOverride={(newVal) => {
                            const num = parseInt(newVal.replace(/[^0-9]/g, ''), 10);
                            if (!isNaN(num)) {
                              updateProjectPhysicalProgress(prog.id, {
                                overallPercentage: prog.overallPercentage,
                                stages: prog.stages.map((s) =>
                                  s.id === st.id
                                    ? { ...s, percentage: Math.min(100, Math.max(0, num)) }
                                    : s
                                ),
                              });
                            }
                          }}
                        />
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${st.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal (Zoom Foto + Navigasi Kiri/Kanan) */}
      {currentLightboxPhoto && lightboxIndex !== null && (
        <div
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-gray-200"
          >
            <div className="relative bg-gray-950 flex items-center justify-center max-h-[65vh]">
              <img
                src={currentLightboxPhoto.photoUrl}
                alt={currentLightboxPhoto.title}
                referrerPolicy="no-referrer"
                className="max-h-[65vh] w-auto object-contain"
              />
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              {filteredPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex(
                        (lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                    {currentLightboxPhoto.category}
                  </span>
                  <span className="font-semibold text-gray-800">
                    {currentLightboxPhoto.projectName}
                  </span>
                  {currentLightboxPhoto.unitBlock && (
                    <span className="font-mono text-gray-500">
                      · {currentLightboxPhoto.unitBlock}
                    </span>
                  )}
                  <span className="font-mono text-gray-400">
                    · {currentLightboxPhoto.dateTaken}
                  </span>
                </div>
                <h4 className="text-base font-bold text-gray-900">
                  {currentLightboxPhoto.title}
                </h4>
                <p className="text-xs text-gray-600">{currentLightboxPhoto.description}</p>
              </div>
              <div className="text-xs font-mono text-gray-400 shrink-0">
                Foto {lightboxIndex + 1} / {filteredPhotos.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Foto Galeri Cepat (Super Admin) */}
      {showQuickAddPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">+ Tambah Foto Galeri Baru</h3>
              <button
                type="button"
                onClick={() => setShowQuickAddPhotoModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleQuickAddPhotoSubmit} className="space-y-3">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Judul / Caption Foto *</label>
                <input
                  type="text"
                  required
                  value={newPhotoTitle}
                  onChange={(e) => setNewPhotoTitle(e.target.value)}
                  placeholder="Contoh: Pengecoran Jalan Utama Blok A"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Kategori</label>
                  <select
                    value={newPhotoCategory}
                    onChange={(e) => setNewPhotoCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  >
                    {(gallerySettings.customCategories || ['Progress Pembangunan', 'Rumah Selesai', 'Fasilitas Umum', 'Serah Terima Kunci']).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Proyek</label>
                  <select
                    value={newPhotoProject}
                    onChange={(e) => setNewPhotoProject(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="Bahagia Land">Bahagia Land</option>
                    <option value="Bahagia Residence">Bahagia Residence</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Upload File Foto atau URL</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const reader = new FileReader();
                    reader.onload = () => setNewPhotoUrl(String(reader.result));
                    reader.readAsDataURL(f);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 mb-1.5 bg-gray-50"
                />
                <input
                  type="text"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="Atau tempel URL gambar..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={newPhotoDesc}
                  onChange={(e) => setNewPhotoDesc(e.target.value)}
                  placeholder="Keterangan dokumentasi foto..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickAddPhotoModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                >
                  💾 Simpan Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

// ============================================================================
// SECTION 3: ARTIKEL & BERITA (BLOG) DI HOMEPAGE ("Artikel & Info Properti")
// ============================================================================
export const PublicBlogHomepageSection: React.FC = () => {
  const {
    blogArticles,
    blogSettings,
    currentUser,
    editMode,
    saveBlogArticle,
    deleteBlogArticle,
  } = useAppStore();
  const isAdmin = Boolean(currentUser && currentUser.active && currentUser.role === 'ADMIN');

  const publishedArticles = useMemo(() => {
    return [...blogArticles]
      .filter((a) => a.status === 'Published')
      .sort((a, b) => {
        if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
        return a.order - b.order;
      })
      .slice(0, blogSettings.maxArticlesHomepage || 3);
  }, [blogArticles, blogSettings.maxArticlesHomepage]);

  if (!blogSettings.showOnHomepage && !isAdmin) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <EditableText
              textKey="web.blog.kicker"
              fallback="EDUKASI KPR SUBSIDI, UPDATE PROYEK & PROMO TERBARU"
              category="Website"
              location="Section Artikel & Berita - Label Kicker Atas"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            <EditableText
              textKey="web.blog.heading"
              fallback="Artikel & Info Properti"
              category="Website"
              location="Section Artikel & Berita - Judul"
            />
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            <EditableText
              textKey="web.blog.subheading"
              fallback="Tips lolos KPR Subsidi FLPP, laporan progress pembangunan bulanan, dan informasi promo resmi Bahagia Group Property."
              category="Website"
              location="Section Artikel & Berita - Subjudul"
            />
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-end">
          {isAdmin && (
            <Link
              to="/sistem/artikel"
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>+ Tambah / Kelola Artikel</span>
            </Link>
          )}
          <Link
            to="/artikel"
            className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-lg text-xs font-semibold flex items-center gap-1.5"
          >
            <EditableText
              textKey="web.blog.btn_all"
              fallback="Lihat Semua Artikel"
              category="Website"
              location="Section Artikel - Tombol Lihat Semua"
            />
            <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
          </Link>
        </div>
      </div>

      {publishedArticles.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-xs text-gray-500">
          <EditableText
            textKey="web.blog.empty"
            fallback="Belum ada artikel yang dipublikasikan."
            category="Website"
            location="Section Artikel - Pesan Kosong"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {publishedArticles.map((art) => (
            <article
              key={art.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col justify-between shadow-2xs hover:border-emerald-300 transition-colors relative"
            >
              <div>
                <div className="block relative overflow-hidden h-48">
                  <EditableImage
                    slotKey={`blog-thumb-${art.id}`}
                    defaultSrc={art.thumbnailUrl}
                    alt={art.title}
                    caption={`Thumbnail Artikel: ${art.title}`}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                    onImageChange={(newUrl) => {
                      saveBlogArticle({ ...art, thumbnailUrl: newUrl });
                    }}
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 z-20">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-700 text-white shadow-xs">
                      <EditableText
                        textKey={`web.blog.${art.id}.cat`}
                        fallback={art.category}
                        category="Website"
                        location={`Artikel ${art.title} - Kategori`}
                        onSaveOverride={(val) =>
                          saveBlogArticle({ ...art, category: val })
                        }
                      />
                    </span>
                    {art.isFeatured && (
                      <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-amber-500 text-white">
                        ★ Featured
                      </span>
                    )}
                  </div>
                  {isAdmin && editMode && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteBlogArticle(art.id);
                        toast.success(`🗑️ Artikel "${art.title}" dihapus`);
                      }}
                      className="absolute top-3 right-3 z-30 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md cursor-pointer"
                      title="Hapus Artikel Ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <EditableText
                        textKey={`web.blog.${art.id}.date`}
                        fallback={art.publishDate}
                        category="Website"
                        location={`Artikel ${art.title} - Tanggal`}
                        onSaveOverride={(val) =>
                          saveBlogArticle({ ...art, publishDate: val })
                        }
                      />
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {art.viewsCount}x dibaca
                    </span>
                  </div>

                  <Link to={`/artikel/${art.slug}`} className="block">
                    <h3 className="text-base font-bold text-gray-900 hover:text-emerald-700 leading-snug line-clamp-2">
                      <EditableText
                        textKey={`web.blog.${art.id}.title`}
                        fallback={art.title}
                        category="Website"
                        location={`Artikel ${art.id} - Judul`}
                        onSaveOverride={(val) =>
                          saveBlogArticle({ ...art, title: val })
                        }
                      />
                    </h3>
                  </Link>

                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                    <EditableText
                      textKey={`web.blog.${art.id}.excerpt`}
                      fallback={art.excerpt}
                      category="Website"
                      location={`Artikel ${art.id} - Ringkasan`}
                      onSaveOverride={(val) =>
                        saveBlogArticle({ ...art, excerpt: val })
                      }
                    />
                  </p>
                </div>
              </div>

              <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-500 truncate max-w-[150px]">
                  <EditableText
                    textKey={`web.blog.${art.id}.author`}
                    fallback={art.author}
                    category="Website"
                    location={`Artikel ${art.id} - Penulis`}
                    onSaveOverride={(val) =>
                      saveBlogArticle({ ...art, author: val })
                    }
                  />
                </span>
                <Link
                  to={`/artikel/${art.slug}`}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <EditableText
                    textKey="web.blog.read_more"
                    fallback="Baca Selengkapnya"
                    category="Website"
                    location="Section Artikel - Label Baca Selengkapnya"
                  />
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

// ============================================================================
// HALAMAN DAFTAR SEMUA ARTIKEL (/artikel)
// ============================================================================
export const PublicArticleListPage: React.FC = () => {
  const {
    blogArticles,
    blogSettings,
    currentUser,
    editMode,
    saveBlogArticle,
    deleteBlogArticle,
  } = useAppStore();
  const isAdmin = Boolean(currentUser && currentUser.active && currentUser.role === 'ADMIN');

  const [selectedCat, setSelectedCat] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddArticleModal, setShowAddArticleModal] = useState(false);
  const [newArtTitle, setNewArtTitle] = useState('');
  const [newArtCategory, setNewArtCategory] = useState('Tips Properti');
  const [newArtExcerpt, setNewArtExcerpt] = useState('');
  const [newArtContent, setNewArtContent] = useState('');
  const [newArtThumb, setNewArtThumb] = useState('');

  const categories = ['Semua', ...(blogSettings.customCategories || [])];

  const filteredArticles = useMemo(() => {
    return [...blogArticles]
      .filter((a) => a.status === 'Published' || isAdmin)
      .filter((a) => {
        if (selectedCat !== 'Semua' && a.category !== selectedCat) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            a.title.toLowerCase().includes(q) ||
            a.excerpt.toLowerCase().includes(q) ||
            a.tags.some((t) => t.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => a.order - b.order);
  }, [blogArticles, selectedCat, searchQuery, isAdmin]);

  const handleQuickAddArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArtTitle.trim()) {
      toast.error('Judul artikel wajib diisi');
      return;
    }
    saveBlogArticle({
      title: newArtTitle.trim(),
      category: newArtCategory,
      thumbnailUrl:
        newArtThumb.trim() ||
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80',
      excerpt:
        newArtExcerpt.trim() ||
        'Informasi terbaru seputar rumah subsidi berkualitas di Bahagia Group Property.',
      contentHtml: `<p>${newArtContent.trim() || newArtExcerpt.trim() || 'Isi lengkap artikel properti.'}</p>`,
      contentImages: [],
      tags: ['KPR Subsidi', 'Bahagia Group'],
      author: currentUser?.name || 'Tim Redaksi Bahagia Group',
      publishDate: new Date().toISOString().slice(0, 10),
      status: 'Published',
      isFeatured: false,
    });
    setNewArtTitle('');
    setNewArtExcerpt('');
    setNewArtContent('');
    setNewArtThumb('');
    setShowAddArticleModal(false);
    toast.success('✅ Artikel baru berhasil diterbitkan!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <PublicNavbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold text-emerald-700 uppercase">
              <EditableText
                textKey="web.artikel_page.kicker"
                fallback="BLOG & PUSAT INFORMASI KONSUMEN"
                category="Website"
                location="Halaman Artikel - Label Kicker"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              <EditableText
                textKey="web.artikel_page.heading"
                fallback="Artikel, Tips KPR & Berita Bahagia Group Property"
                category="Website"
                location="Halaman Artikel - Judul Utama"
              />
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              <EditableText
                textKey="web.artikel_page.subheading"
                fallback="Temukan panduan pengajuan KPR Subsidi FLPP, perkembangan proyek Bahagia Land & Bahagia Residence, serta promo terbaru."
                category="Website"
                location="Halaman Artikel - Subjudul"
              />
            </p>
          </div>
          {isAdmin && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowAddArticleModal(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Artikel Cepat</span>
              </button>
              <Link
                to="/sistem/artikel"
                className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Settings className="w-4 h-4" />
                <span>Dashboard Artikel</span>
              </Link>
            </div>
          )}
        </div>

        {/* Filter Kategori & Pencarian */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCat(cat)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  selectedCat === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Cari judul artikel atau topik KPR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-3.5 py-2 bg-white min-w-[260px]"
          />
        </div>

        {/* Grid Artikel */}
        {filteredArticles.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-xs text-gray-500">
            <EditableText
              textKey="web.artikel_page.empty"
              fallback="Tidak ada artikel yang sesuai dengan filter pencarian Anda."
              category="Website"
              location="Halaman Artikel - Pesan Kosong"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredArticles.map((art) => (
              <article
                key={art.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col justify-between shadow-2xs hover:border-emerald-300 transition-colors relative"
              >
                <div>
                  <div className="block relative h-48 overflow-hidden">
                    <EditableImage
                      slotKey={`blog-thumb-${art.id}`}
                      defaultSrc={art.thumbnailUrl}
                      alt={art.title}
                      caption={art.title}
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                      onImageChange={(newUrl) => {
                        saveBlogArticle({ ...art, thumbnailUrl: newUrl });
                      }}
                    />
                    <span className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-700 text-white">
                      <EditableText
                        textKey={`web.blog.${art.id}.cat`}
                        fallback={art.category}
                        category="Website"
                        location={`Artikel ${art.title} - Kategori`}
                        onSaveOverride={(val) =>
                          saveBlogArticle({ ...art, category: val })
                        }
                      />
                    </span>
                    {isAdmin && editMode && (
                      <button
                        type="button"
                        onClick={() => {
                          deleteBlogArticle(art.id);
                          toast.success(`🗑️ Artikel "${art.title}" dihapus`);
                        }}
                        className="absolute top-3 right-3 z-30 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md cursor-pointer"
                        title="Hapus Artikel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                      <span>
                        <EditableText
                          textKey={`web.blog.${art.id}.date`}
                          fallback={art.publishDate}
                          category="Website"
                          location={`Artikel ${art.title} - Tanggal`}
                          onSaveOverride={(val) =>
                            saveBlogArticle({ ...art, publishDate: val })
                          }
                        />
                      </span>
                      <span>{art.viewsCount} views</span>
                    </div>
                    <Link to={`/artikel/${art.slug}`}>
                      <h2 className="text-base font-bold text-gray-900 hover:text-emerald-700 line-clamp-2">
                        <EditableText
                          textKey={`web.blog.${art.id}.title`}
                          fallback={art.title}
                          category="Website"
                          location={`Artikel ${art.id} - Judul`}
                          onSaveOverride={(val) =>
                            saveBlogArticle({ ...art, title: val })
                          }
                        />
                      </h2>
                    </Link>
                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                      <EditableText
                        textKey={`web.blog.${art.id}.excerpt`}
                        fallback={art.excerpt}
                        category="Website"
                        location={`Artikel ${art.id} - Ringkasan`}
                        onSaveOverride={(val) =>
                          saveBlogArticle({ ...art, excerpt: val })
                        }
                      />
                    </p>
                  </div>
                </div>
                <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500">
                    <EditableText
                      textKey={`web.blog.${art.id}.author`}
                      fallback={art.author}
                      category="Website"
                      location={`Artikel ${art.id} - Penulis`}
                      onSaveOverride={(val) =>
                        saveBlogArticle({ ...art, author: val })
                      }
                    />
                  </span>
                  <Link
                    to={`/artikel/${art.slug}`}
                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {showAddArticleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">+ Tulis Artikel Baru</h3>
              <button
                type="button"
                onClick={() => setShowAddArticleModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleQuickAddArticle} className="space-y-3">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Judul Artikel *</label>
                <input
                  type="text"
                  required
                  value={newArtTitle}
                  onChange={(e) => setNewArtTitle(e.target.value)}
                  placeholder="Contoh: 5 Syarat Mudah Lolos KPR Subsidi Bank BTN"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Kategori</label>
                <select
                  value={newArtCategory}
                  onChange={(e) => setNewArtCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                >
                  {(blogSettings.customCategories || ['Tips Properti', 'Update Proyek', 'Promo & Event']).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Upload Foto Thumbnail / URL</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const reader = new FileReader();
                    reader.onload = () => setNewArtThumb(String(reader.result));
                    reader.readAsDataURL(f);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 mb-1.5 bg-gray-50"
                />
                <input
                  type="text"
                  value={newArtThumb}
                  onChange={(e) => setNewArtThumb(e.target.value)}
                  placeholder="Atau tempel URL foto..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Ringkasan (Excerpt)</label>
                <textarea
                  rows={2}
                  value={newArtExcerpt}
                  onChange={(e) => setNewArtExcerpt(e.target.value)}
                  placeholder="Ringkasan singkat artikel..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Isi Artikel Lengkap</label>
                <textarea
                  rows={4}
                  value={newArtContent}
                  onChange={(e) => setNewArtContent(e.target.value)}
                  placeholder="Tulis isi artikel di sini..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddArticleModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                >
                  🚀 Publish Artikel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PublicFooter />
    </div>
  );
};

// ============================================================================
// HALAMAN DETAIL ARTIKEL (/artikel/:slug)
// ============================================================================
export const PublicArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const {
    blogArticles,
    incrementBlogArticleViews,
    currentUser,
    editMode,
    saveBlogArticle,
    deleteBlogArticle,
  } = useAppStore();
  const isAdmin = Boolean(currentUser && currentUser.active && currentUser.role === 'ADMIN');

  const article = useMemo(() => {
    return (
      blogArticles.find((a) => a.slug === slug || a.id === slug) ||
      blogArticles[0]
    );
  }, [blogArticles, slug]);

  useEffect(() => {
    if (article?.slug) {
      incrementBlogArticleViews(article.slug);
    }
  }, [article?.slug]);

  const [editingHtmlModal, setEditingHtmlModal] = useState(false);
  const [draftHtml, setDraftHtml] = useState('');

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
        <PublicNavbar />
        <main className="flex-1 max-w-4xl mx-auto px-6 py-16 text-center space-y-4">
          <h1 className="text-xl font-bold text-gray-900">Artikel Tidak Ditemukan</h1>
          <Link
            to="/artikel"
            className="inline-flex px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold"
          >
            Kembali ke Daftar Artikel
          </Link>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const relatedArticles = blogArticles
    .filter((a) => a.id !== article.id && a.status === 'Published')
    .slice(0, 3);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const whatsappShareHref = `https://wa.me/?text=${encodeURIComponent(
    `${article.title} - ${shareUrl}`
  )}`;
  const facebookShareHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    shareUrl
  )}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(shareUrl);
    toast.success('🔗 Tautan artikel berhasil disalin ke clipboard!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <PublicNavbar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-emerald-700">
              <EditableText
                textKey="web.breadcrumb.home"
                fallback="Beranda"
                category="Website"
                location="Breadcrumb - Beranda"
              />
            </Link>
            <span>/</span>
            <Link to="/artikel" className="hover:text-emerald-700">
              <EditableText
                textKey="web.breadcrumb.artikel"
                fallback="Artikel & Info Properti"
                category="Website"
                location="Breadcrumb - Artikel"
              />
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-[260px]">
              {article.title}
            </span>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setDraftHtml(article.contentHtml);
                  setEditingHtmlModal(true);
                }}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold cursor-pointer flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>✏️ Edit Isi Paragraf Artikel</span>
              </button>
              <button
                type="button"
                onClick={() => navigate(`/sistem/artikel?edit=${article.id}`)}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-bold cursor-pointer"
              >
                Dashboard Artikel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteBlogArticle(article.id);
                  toast.success('🗑️ Artikel dihapus');
                  navigate('/artikel');
                }}
                className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg font-bold cursor-pointer"
              >
                🗑️ Hapus
              </button>
            </div>
          )}
        </div>

        <article className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
          {/* Gambar Utama (EditableImage) */}
          <div className="relative h-64 sm:h-96 bg-gray-100">
            <EditableImage
              slotKey={`blog-thumb-${article.id}`}
              defaultSrc={article.thumbnailUrl}
              alt={article.title}
              caption={`Foto Utama Artikel: ${article.title}`}
              className="w-full h-64 sm:h-96 object-cover"
              onImageChange={(newUrl) => {
                saveBlogArticle({ ...article, thumbnailUrl: newUrl });
              }}
            />
            <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-700 text-white shadow-sm">
                <EditableText
                  textKey={`web.blog.${article.id}.cat`}
                  fallback={article.category}
                  category="Website"
                  location={`Artikel ${article.title} - Kategori`}
                  onSaveOverride={(val) =>
                    saveBlogArticle({ ...article, category: val })
                  }
                />
              </span>
              {article.status !== 'Published' && (
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 text-gray-950">
                  Status: {article.status}
                </span>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-10 space-y-6">
            {/* Meta Info & Title */}
            <div className="space-y-3 border-b border-gray-100 pb-6">
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-mono">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <EditableText
                    textKey={`web.blog.${article.id}.date`}
                    fallback={article.publishDate}
                    category="Website"
                    location={`Artikel ${article.title} - Tanggal`}
                    onSaveOverride={(val) =>
                      saveBlogArticle({ ...article, publishDate: val })
                    }
                  />
                </span>
                <span>·</span>
                <span>
                  Oleh:{' '}
                  <strong className="text-gray-800">
                    <EditableText
                      textKey={`web.blog.${article.id}.author`}
                      fallback={article.author}
                      category="Website"
                      location={`Artikel ${article.title} - Penulis`}
                      onSaveOverride={(val) =>
                        saveBlogArticle({ ...article, author: val })
                      }
                    />
                  </strong>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-gray-400" />
                  {article.viewsCount} kali dibaca
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight">
                <EditableText
                  textKey={`web.blog.${article.id}.title`}
                  fallback={article.title}
                  category="Website"
                  location={`Artikel ${article.id} - Judul Utama`}
                  onSaveOverride={(val) =>
                    saveBlogArticle({ ...article, title: val })
                  }
                />
              </h1>

              <p className="text-sm text-gray-600 leading-relaxed bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl">
                <EditableText
                  textKey={`web.blog.${article.id}.excerpt`}
                  fallback={article.excerpt}
                  category="Website"
                  location={`Artikel ${article.id} - Ringkasan Excerpt`}
                  onSaveOverride={(val) =>
                    saveBlogArticle({ ...article, excerpt: val })
                  }
                />
              </p>
            </div>

            {/* Isi Artikel Lengkap (Rich HTML + Klik Edit Langsung saat Edit Mode) */}
            <div
              onClick={() => {
                if (isAdmin && editMode) {
                  setDraftHtml(article.contentHtml);
                  setEditingHtmlModal(true);
                }
              }}
              className={`prose prose-sm sm:prose-base max-w-none text-gray-800 space-y-4 leading-relaxed [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:pt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-gray-900 ${
                isAdmin && editMode
                  ? 'border-2 border-dashed border-blue-500 bg-blue-50/30 p-4 rounded-xl cursor-pointer'
                  : ''
              }`}
              title={isAdmin && editMode ? 'Klik untuk mengedit seluruh isi artikel' : undefined}
            >
              {isAdmin && editMode && (
                <div className="mb-2 inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded">
                  ✏️ Klik di sini untuk Edit Isi Artikel Lengkap
                </div>
              )}
              <div dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
            </div>

            {/* Galeri Foto di Dalam Artikel (EditableImage) */}
            {article.contentImages && article.contentImages.length > 0 && (
              <div className="pt-4 space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-gray-500">
                  <EditableText
                    textKey="web.blog.doc_photos_heading"
                    fallback="Dokumentasi Foto Terkait"
                    category="Website"
                    location="Detail Artikel - Subjudul Foto Terkait"
                  />
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {article.contentImages.map((imgUrl, idx) => (
                    <div key={idx} className="relative">
                      <EditableImage
                        slotKey={`blog-content-img-${article.id}-${idx}`}
                        defaultSrc={imgUrl}
                        alt={`${article.title} - Foto ${idx + 1}`}
                        className="w-full h-56 object-cover rounded-xl border border-gray-200"
                        onImageChange={(newUrl) => {
                          const nextImgs = [...article.contentImages];
                          nextImgs[idx] = newUrl;
                          saveBlogArticle({ ...article, contentImages: nextImgs });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags & Tombol Share */}
            <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                {article.tags.map((tg, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
                  >
                    #{tg}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 flex items-center gap-1 mr-1">
                  <Share2 className="w-3.5 h-3.5" />
                  Bagikan:
                </span>
                <a
                  href={whatsappShareHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  WhatsApp
                </a>
                <a
                  href={facebookShareHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Facebook
                </a>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Salin Link
                </button>
              </div>
            </div>

            {/* CTA Box di Bawah Artikel */}
            <div className="bg-emerald-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-mono text-emerald-300 uppercase font-bold">
                  <EditableText
                    textKey="web.blog.cta_kicker"
                    fallback="WUJUDKAN RUMAH IMPIAN KELUARGA ANDA"
                    category="Website"
                    location="Detail Artikel - CTA Kicker"
                  />
                </div>
                <h3 className="text-lg font-bold">
                  <EditableText
                    textKey="web.blog.cta_title"
                    fallback="Tertarik Ambil Unit di Bahagia Land atau Bahagia Residence?"
                    category="Website"
                    location="Detail Artikel - CTA Judul"
                  />
                </h3>
                <p className="text-xs text-emerald-100">
                  <EditableText
                    textKey="web.blog.cta_desc"
                    fallback="Harga resmi Rp169.000.000 · Kavling luas 7×13m (91 m²) · Angsuran KPR Subsidi flat Rp1 jutaan/bulan."
                    category="Website"
                    location="Detail Artikel - CTA Deskripsi"
                  />
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/booking"
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-gray-950 font-bold text-xs rounded-xl whitespace-nowrap"
                >
                  <EditableText
                    textKey="web.blog.cta_btn1"
                    fallback="Booking Online Sekarang"
                    category="Website"
                    location="Detail Artikel - Tombol Booking"
                  />
                </Link>
                <Link
                  to="/katalog"
                  className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl whitespace-nowrap border border-emerald-700"
                >
                  <EditableText
                    textKey="web.blog.cta_btn2"
                    fallback="Lihat Katalog Unit"
                    category="Website"
                    location="Detail Artikel - Tombol Katalog"
                  />
                </Link>
              </div>
            </div>
          </div>
        </article>

        {/* Artikel Terkait */}
        {relatedArticles.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              <EditableText
                textKey="web.blog.related_heading"
                fallback="Artikel Terkait Lainnya"
                category="Website"
                location="Detail Artikel - Judul Artikel Terkait"
              />
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/artikel/${rel.slug}`}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-emerald-400 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <EditableImage
                      slotKey={`blog-thumb-${rel.id}`}
                      defaultSrc={rel.thumbnailUrl}
                      alt={rel.title}
                      className="w-full h-40 object-cover"
                      onImageChange={(newUrl) => {
                        saveBlogArticle({ ...rel, thumbnailUrl: newUrl });
                      }}
                    />
                    <div className="p-4 space-y-1.5">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">
                        {rel.category} · {rel.publishDate}
                      </span>
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-2">
                        {rel.title}
                      </h3>
                    </div>
                  </div>
                  <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 text-xs font-semibold text-emerald-700 flex items-center justify-between">
                    <span>Baca Artikel</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {editingHtmlModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                ✏️ Edit Isi Lengkap Artikel: {article.title}
              </h3>
              <button
                type="button"
                onClick={() => setEditingHtmlModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              rows={12}
              value={draftHtml}
              onChange={(e) => setDraftHtml(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 font-mono text-xs"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingHtmlModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  saveBlogArticle({ ...article, contentHtml: draftHtml });
                  setEditingHtmlModal(false);
                  toast.success('✅ Isi artikel berhasil diperbarui!');
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
              >
                💾 Simpan Isi Artikel
              </button>
            </div>
          </div>
        </div>
      )}

      <PublicFooter />
    </div>
  );
};
