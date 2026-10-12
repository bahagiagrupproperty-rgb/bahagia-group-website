import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { ASSETS } from '../data/seedData';
import {
  PublicTestimonialRecord,
  GalleryProgressPhotoRecord,
  BlogArticleRecord,
  generateArticleSlug,
} from '../data/publicSectionsSeedData';
import { UploadFoto } from './UploadFoto';
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  Star,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Check,
  X,
  Search,
  Image as ImageIcon,
  FileText,
  Sparkles,
  Copy,
  Sliders,
  ExternalLink,
  Calendar,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// 1. ADMIN MANAGER: TESTIMONI KONSUMEN (/sistem/testimoni)
// ============================================================================
export const AdminTestimonialsManager: React.FC = () => {
  const {
    publicTestimonials,
    testimonialSettings,
    savePublicTestimonial,
    deletePublicTestimonial,
    toggleTestimonialStatus,
    toggleTestimonialFeatured,
    reorderPublicTestimonial,
    updateTestimonialSettings,
    resetTestimonialsData,
  } = useAppStore();

  const [searchQ, setSearchQ] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<PublicTestimonialRecord | null>(null);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);

  // Form states
  const [consumerName, setConsumerName] = useState('');
  const [unitBlock, setUnitBlock] = useState('A-05');
  const [projectName, setProjectName] = useState('Bahagia Land');
  const [photoList, setPhotoList] = useState<string[]>([ASSETS.unitInterior]);
  const [testimonialText, setTestimonialText] = useState('');
  const [rating, setRating] = useState(5);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  const [isFeatured, setIsFeatured] = useState(false);

  const sortedList = useMemo(() => {
    return [...publicTestimonials]
      .sort((a, b) => a.order - b.order)
      .filter((t) => {
        if (projectFilter !== 'ALL' && t.projectName !== projectFilter) return false;
        if (searchQ.trim()) {
          const q = searchQ.toLowerCase();
          return (
            t.consumerName.toLowerCase().includes(q) ||
            t.unitBlock.toLowerCase().includes(q) ||
            t.testimonialText.toLowerCase().includes(q)
          );
        }
        return true;
      });
  }, [publicTestimonials, projectFilter, searchQ]);

  const openAddModal = () => {
    setEditingId(undefined);
    setConsumerName('');
    setUnitBlock('A-05');
    setProjectName('Bahagia Land');
    setPhotoList([ASSETS.unitInterior]);
    setTestimonialText('');
    setRating(5);
    setDate(new Date().toISOString().slice(0, 10));
    setStatus('Aktif');
    setIsFeatured(true);
    setModalOpen(true);
  };

  const openEditModal = (item: PublicTestimonialRecord) => {
    setEditingId(item.id);
    setConsumerName(item.consumerName);
    setUnitBlock(item.unitBlock);
    setProjectName(item.projectName);
    setPhotoList([item.photoUrl || ASSETS.unitInterior]);
    setTestimonialText(item.testimonialText);
    setRating(item.rating);
    setDate(item.date);
    setStatus(item.status);
    setIsFeatured(item.isFeatured);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consumerName.trim() || !testimonialText.trim()) {
      toast.error('Nama konsumen dan isi testimoni wajib diisi.');
      return;
    }
    savePublicTestimonial({
      id: editingId,
      consumerName: consumerName.trim(),
      unitBlock: unitBlock.trim() || 'A-01',
      projectName,
      photoUrl: photoList[0] || ASSETS.unitInterior,
      testimonialText: testimonialText.trim().slice(0, 500),
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      date,
      status,
      isFeatured,
    });
    setModalOpen(false);
    toast.success(
      editingId
        ? '✅ Testimoni konsumen berhasil diperbarui!'
        : '✅ Testimoni konsumen baru berhasil ditambahkan!'
    );
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Header & Kontrol Admin */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <div className="text-emerald-700 font-mono font-bold text-[11px]">
              SECTION 1 · /sistem/testimoni · KONTROL PENUH SUPER ADMIN
            </div>
            <h2 className="text-lg font-bold text-gray-900 mt-0.5">
              Manajemen Testimoni Konsumen ("Apa Kata Penghuni Kami")
            </h2>
            <p className="text-gray-500">
              Kelola testimoni penghuni Bahagia Land & Bahagia Residence, atur slider otomatis, jumlah tampil, urutan, serta reset data tanpa coding.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>[+ Tambah Testimoni]</span>
            </button>
            <button
              type="button"
              onClick={() => {
                resetTestimonialsData('RESTORE_DEFAULT');
                toast.success('🔄 Data testimoni default (6 penghuni) berhasil dipulihkan!');
              }}
              className="px-3.5 py-2.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl cursor-pointer"
            >
              [🔄 Reset ke Default]
            </button>
            <button
              type="button"
              onClick={() => {
                resetTestimonialsData('CLEAR_ALL');
                toast.success('🗑️ Semua testimoni berhasil dikosongkan!');
              }}
              className="px-3.5 py-2.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl cursor-pointer"
            >
              [🗑️ Kosongkan Semua]
            </button>
          </div>
        </div>

        {/* Panel Kontrol Admin */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div>
            <label className="font-bold text-gray-800 block mb-1">
              Tampilkan di Homepage Publik
            </label>
            <button
              type="button"
              onClick={() => {
                const next = !testimonialSettings.showOnHomepage;
                updateTestimonialSettings({ showOnHomepage: next });
                toast.success(
                  next
                    ? '✅ Section Testimoni ditampilkan di Homepage'
                    : 'Section Testimoni disembunyikan dari Homepage'
                );
              }}
              className={`w-full py-2 px-3 rounded-lg font-bold border cursor-pointer transition-colors ${
                testimonialSettings.showOnHomepage
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {testimonialSettings.showOnHomepage ? '✅ Tampil di Homepage (ON)' : '❌ Disembunyikan (OFF)'}
            </button>
          </div>

          <div>
            <label className="font-bold text-gray-800 block mb-1">
              Jumlah Testimoni Maksimal
            </label>
            <div className="flex gap-1.5">
              {([3, 6, 9] as const).map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => {
                    updateTestimonialSettings({ maxDisplayCount: cnt });
                    toast.success(`Jumlah testimoni di-set ke ${cnt} item`);
                  }}
                  className={`flex-1 py-2 rounded-lg font-bold border cursor-pointer ${
                    testimonialSettings.maxDisplayCount === cnt
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  {cnt} Card
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-800 block mb-1">
              Kecepatan Auto-Slide (Detik)
            </label>
            <input
              type="number"
              min={2}
              max={30}
              value={testimonialSettings.autoSlideSeconds}
              onChange={(e) =>
                updateTestimonialSettings({
                  autoSlideSeconds: Math.max(2, Number(e.target.value) || 5),
                })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white font-mono font-bold"
            />
          </div>

          <div>
            <label className="font-bold text-gray-800 block mb-1">
              Urutan Tampilan Slider
            </label>
            <select
              value={testimonialSettings.orderMode}
              onChange={(e) =>
                updateTestimonialSettings({
                  orderMode: e.target.value as any,
                })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white font-semibold"
            >
              <option value="MANUAL">Urutan Manual (Drag/Panah & Featured)</option>
              <option value="TERBARU">Tanggal Terbaru</option>
              <option value="RATING_TERTINGGI">Rating Bintang Tertinggi</option>
            </select>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {['ALL', 'Bahagia Land', 'Bahagia Residence'].map((prj) => (
              <button
                key={prj}
                type="button"
                onClick={() => setProjectFilter(prj)}
                className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                  projectFilter === prj
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {prj === 'ALL' ? `Semua Proyek (${publicTestimonials.length})` : prj}
              </button>
            ))}
          </div>

          <div className="relative min-w-[260px]">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama konsumen, kavling, atau isi testimoni..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2"
            />
          </div>
        </div>

        {/* Tabel Testimoni: Foto | Nama | Unit | Testimoni | Rating | Status | Aksi */}
        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                <th className="py-3 px-3">Urutan</th>
                <th className="py-3 px-3">Foto</th>
                <th className="py-3 px-3">Nama Konsumen</th>
                <th className="py-3 px-3">Unit & Proyek</th>
                <th className="py-3 px-3">Isi Testimoni</th>
                <th className="py-3 px-3">Rating</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedList.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50/80">
                  <td className="py-3 px-3 font-mono">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-gray-700 w-5">#{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => reorderPublicTestimonial(item.id, 'UP')}
                        className="p-1 hover:bg-gray-200 rounded text-gray-600 cursor-pointer"
                        title="Geser Naik"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => reorderPublicTestimonial(item.id, 'DOWN')}
                        className="p-1 hover:bg-gray-200 rounded text-gray-600 cursor-pointer"
                        title="Geser Turun"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <img
                      src={item.photoUrl}
                      alt={item.consumerName}
                      className="w-11 h-11 rounded-full object-cover border border-gray-200"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-gray-900">{item.consumerName}</div>
                    <div className="text-[11px] font-mono text-gray-400">{item.date}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-emerald-700 block">
                      Kavling {item.unitBlock}
                    </span>
                    <span className="text-[11px] text-gray-500">{item.projectName}</span>
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    <p className="line-clamp-2 text-gray-700 italic">"{item.testimonialText}"</p>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-0.5 text-amber-400 font-bold">
                      <span>{'⭐'.repeat(item.rating)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => toggleTestimonialStatus(item.id)}
                        className={`px-2.5 py-1 rounded-md font-bold text-[11px] cursor-pointer w-fit ${
                          item.status === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {item.status}
                      </button>
                      {item.isFeatured && (
                        <span className="text-[10px] font-bold text-amber-700">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold cursor-pointer"
                      >
                        [✏️ Edit]
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewItem(item)}
                        className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold cursor-pointer"
                      >
                        [👁️ Preview]
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          toggleTestimonialFeatured(item.id);
                          toast.success('⭐ Status Featured testimoni diperbarui');
                        }}
                        className={`px-2.5 py-1.5 rounded-lg font-bold cursor-pointer ${
                          item.isFeatured
                            ? 'bg-amber-500 text-white'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        [⭐ Set Featured]
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          deletePublicTestimonial(item.id);
                          toast.success(`🗑️ Testimoni ${item.consumerName} dipindahkan ke Trash`);
                        }}
                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-bold cursor-pointer"
                      >
                        [🗑️ Hapus]
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sortedList.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    Belum ada data testimoni konsumen. Klik [+ Tambah Testimoni] untuk menambahkan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah/Edit Testimoni */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                {editingId ? '✏️ Edit Testimoni Konsumen' : '+ Tambah Testimoni Konsumen Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Nama Konsumen *
                  </label>
                  <input
                    type="text"
                    required
                    value={consumerName}
                    onChange={(e) => setConsumerName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Unit / Blok (Contoh: A-05) *
                  </label>
                  <input
                    type="text"
                    required
                    value={unitBlock}
                    onChange={(e) => setUnitBlock(e.target.value)}
                    placeholder="A-05"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Proyek</label>
                  <select
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="Bahagia Land">Bahagia Land</option>
                    <option value="Bahagia Residence">Bahagia Residence</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Rating (1 - 5 Bintang)
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white font-bold"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                    <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                    <option value={3}>⭐⭐⭐ (3/5)</option>
                    <option value={2}>⭐⭐ (2/5)</option>
                    <option value={1}>⭐ (1/5)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-gray-700">
                    Isi Testimoni * (Maksimal 500 Karakter)
                  </label>
                  <span className="font-mono text-[11px] text-gray-400">
                    {testimonialText.length}/500
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  maxLength={500}
                  value={testimonialText}
                  onChange={(e) => setTestimonialText(e.target.value)}
                  placeholder="Tuliskan kesan penghuni mengenai rumah, lokasi, atau kemudahan proses KPR..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <UploadFoto
                photos={photoList}
                onChange={setPhotoList}
                maxPhotos={1}
                label="Upload Foto Konsumen / Serah Terima Kunci"
              />

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Status Tampil</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white font-semibold"
                  >
                    <option value="Aktif">Aktif (Tampil di Web)</option>
                    <option value="Nonaktif">Nonaktif (Sembunyikan)</option>
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 font-bold text-gray-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 accent-emerald-600"
                    />
                    <span>⭐ Jadikan Testimoni Unggulan (Featured)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-semibold text-gray-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Simpan Testimoni
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Preview Card */}
      {previewItem && (
        <div
          onClick={() => setPreviewItem(null)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-gray-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="font-bold text-gray-900">👁️ Preview Card Testimoni</span>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 border border-gray-200 rounded-xl space-y-4 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <img
                  src={previewItem.photoUrl}
                  alt={previewItem.consumerName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
                />
                <div>
                  <div>{'⭐'.repeat(previewItem.rating)}</div>
                  <span className="text-[11px] font-mono text-gray-400">{previewItem.date}</span>
                </div>
              </div>
              <p className="text-sm text-gray-800 italic">"{previewItem.testimonialText}"</p>
              <div className="border-t border-gray-200 pt-3">
                <div className="font-bold text-gray-900">{previewItem.consumerName}</div>
                <div className="text-emerald-700 font-semibold">
                  Penghuni {previewItem.projectName} {previewItem.unitBlock}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 2. ADMIN MANAGER: GALERI & PROGRESS PEMBANGUNAN (/sistem/galeri)
// ============================================================================
export const AdminGalleryProgressManager: React.FC = () => {
  const {
    galleryPhotos,
    projectPhysicalProgress,
    gallerySettings,
    saveGalleryPhoto,
    bulkAddGalleryPhotos,
    deleteGalleryPhoto,
    toggleGalleryPhotoStatus,
    toggleGalleryPhotoFeatured,
    reorderGalleryPhoto,
    updateProjectPhysicalProgress,
    updateGallerySettings,
    resetGalleryAndProgressData,
  } = useAppStore();

  const [activeSubTab, setActiveSubTab] = useState<'PHOTOS' | 'PROGRESS' | 'SETTINGS'>('PHOTOS');
  const [catFilter, setCatFilter] = useState<string>('ALL');
  const [projFilter, setProjFilter] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPhotoId, setEditingPhotoId] = useState<string | undefined>(undefined);

  // Form states for Photo
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Pembangunan Unit');
  const [projectName, setProjectName] = useState('Bahagia Land');
  const [unitBlock, setUnitBlock] = useState('');
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([ASSETS.bahagiaLand]);
  const [dateTaken, setDateTaken] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  const [isFeaturedOnHome, setIsFeaturedOnHome] = useState(true);
  const [newCustomCat, setNewCustomCat] = useState('');

  const filteredPhotos = useMemo(() => {
    return [...galleryPhotos]
      .sort((a, b) => a.order - b.order)
      .filter((p) => {
        if (catFilter !== 'ALL' && p.category !== catFilter) return false;
        if (projFilter !== 'ALL' && p.projectName !== projFilter) return false;
        return true;
      });
  }, [galleryPhotos, catFilter, projFilter]);

  const openAddPhotoModal = () => {
    setEditingPhotoId(undefined);
    setTitle('');
    setCategory(gallerySettings.customCategories[0] || 'Pembangunan Unit');
    setProjectName('Bahagia Land');
    setUnitBlock('Blok A');
    setUploadedUrls([ASSETS.bahagiaLand]);
    setDateTaken(new Date().toISOString().slice(0, 10));
    setDescription('');
    setStatus('Aktif');
    setIsFeaturedOnHome(true);
    setModalOpen(true);
  };

  const openEditPhotoModal = (item: GalleryProgressPhotoRecord) => {
    setEditingPhotoId(item.id);
    setTitle(item.title);
    setCategory(item.category);
    setProjectName(item.projectName);
    setUnitBlock(item.unitBlock || '');
    setUploadedUrls([item.photoUrl]);
    setDateTaken(item.dateTaken);
    setDescription(item.description);
    setStatus(item.status);
    setIsFeaturedOnHome(item.isFeaturedOnHome);
    setModalOpen(true);
  };

  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || uploadedUrls.length === 0) {
      toast.error('Judul foto dan minimal 1 gambar wajib diisi.');
      return;
    }

    if (!editingPhotoId && uploadedUrls.length > 1) {
      // Multi-upload sekaligus
      const count = bulkAddGalleryPhotos(
        uploadedUrls.map((u, idx) => ({
          url: u,
          title: `${title.trim()} (${idx + 1})`,
        })),
        {
          category,
          projectName,
          unitBlock,
          dateTaken,
          description,
          status,
          isFeaturedOnHome,
        }
      );
      toast.success(`✅ ${count} Foto pembangunan berhasil diupload sekaligus!`);
    } else {
      saveGalleryPhoto({
        id: editingPhotoId,
        title: title.trim(),
        category,
        projectName,
        unitBlock: unitBlock.trim(),
        photoUrl: uploadedUrls[0],
        dateTaken,
        description: description.trim(),
        status,
        isFeaturedOnHome,
      });
      toast.success(
        editingPhotoId
          ? '✅ Foto galeri berhasil diperbarui!'
          : '✅ Foto galeri baru berhasil ditambahkan!'
      );
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <div className="text-emerald-700 font-mono font-bold text-[11px]">
              SECTION 2 · /sistem/galeri · GALERI FOTO & PROGRESS FISIK KAWASAN
            </div>
            <h2 className="text-lg font-bold text-gray-900 mt-0.5">
              Manajemen Galeri Pembangunan & Progress Fisik Perumahan
            </h2>
            <p className="text-gray-500">
              Upload foto dokumentasi lapangan (multi-upload), atur persentase progress fisik Bahagia Land & Bahagia Residence, dan kontrol tampilan publik.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={openAddPhotoModal}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>[+ Tambah Foto Galeri]</span>
            </button>
            <button
              type="button"
              onClick={() => {
                resetGalleryAndProgressData('RESTORE_DEFAULT');
                toast.success('🔄 Galeri (9 foto) & Progress default berhasil dipulihkan!');
              }}
              className="px-3 py-2.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl cursor-pointer"
            >
              [🔄 Reset Default]
            </button>
          </div>
        </div>

        {/* 3 Sub-Tabs: Tab 1 Foto Galeri, Tab 2 Update Progress Fisik, Tab 3 Pengaturan & Kategori */}
        <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-3">
          {[
            { id: 'PHOTOS', label: `1. Foto Galeri Pembangunan (${galleryPhotos.length} Foto)` },
            { id: 'PROGRESS', label: '2. Update Progress Fisik Proyek (%)' },
            { id: 'SETTINGS', label: '3. Kontrol Tampilan & Kategori Galeri' },
          ].map((tb) => (
            <button
              key={tb.id}
              type="button"
              onClick={() => setActiveSubTab(tb.id as any)}
              className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-colors ${
                activeSubTab === tb.id
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tb.label}
            </button>
          ))}
        </div>

        {/* SUB-TAB 1: FOTO GALERI */}
        {activeSubTab === 'PHOTOS' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {['ALL', ...gallerySettings.customCategories].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCatFilter(c)}
                    className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                      catFilter === c
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {c === 'ALL' ? 'Semua Kategori' : c}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={projFilter}
                  onChange={(e) => setProjFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 bg-white font-semibold"
                >
                  <option value="ALL">Semua Proyek</option>
                  <option value="Bahagia Land">Bahagia Land</option>
                  <option value="Bahagia Residence">Bahagia Residence</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    resetGalleryAndProgressData('CLEAR_PHOTOS');
                    toast.success('🗑️ Semua foto galeri berhasil dikosongkan!');
                  }}
                  className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg font-bold cursor-pointer"
                >
                  Kosongkan Foto
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                    <th className="py-3 px-3">Urutan</th>
                    <th className="py-3 px-3">Foto</th>
                    <th className="py-3 px-3">Judul & Deskripsi</th>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-3">Proyek & Blok</th>
                    <th className="py-3 px-3">Tanggal</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPhotos.map((ph, idx) => (
                    <tr key={ph.id} className="hover:bg-gray-50">
                      <td className="py-3 px-3 font-mono">
                        <div className="flex items-center gap-1">
                          <span className="font-bold">#{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => reorderGalleryPhoto(ph.id, 'UP')}
                            className="p-1 hover:bg-gray-200 rounded cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => reorderGalleryPhoto(ph.id, 'DOWN')}
                            className="p-1 hover:bg-gray-200 rounded cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <img
                          src={ph.photoUrl}
                          alt={ph.title}
                          className="w-16 h-12 object-cover rounded-lg border border-gray-200"
                        />
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-bold text-gray-900">{ph.title}</div>
                        <div className="text-[11px] text-gray-500 line-clamp-1">
                          {ph.description}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-bold text-[11px]">
                          {ph.category}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-gray-800">{ph.projectName}</div>
                        <div className="text-[11px] font-mono text-gray-500">
                          {ph.unitBlock || '-'}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-gray-600">{ph.dateTaken}</td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => toggleGalleryPhotoStatus(ph.id)}
                          className={`px-2.5 py-1 rounded-md font-bold text-[11px] cursor-pointer ${
                            ph.status === 'Aktif'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {ph.status}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditPhotoModal(ph)}
                            className="px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-bold cursor-pointer"
                          >
                            [✏️ Edit]
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              toggleGalleryPhotoFeatured(ph.id);
                              toast.success('⭐ Status Featured foto diperbarui');
                            }}
                            className={`px-2.5 py-1.5 rounded-lg font-bold cursor-pointer ${
                              ph.isFeaturedOnHome
                                ? 'bg-amber-500 text-white'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            ★ Home
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteGalleryPhoto(ph.id);
                              toast.success('🗑️ Foto galeri dihapus ke Trash');
                            }}
                            className="px-2.5 py-1.5 bg-red-50 text-red-700 rounded-lg font-bold cursor-pointer"
                          >
                            [🗑️ Hapus]
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUB-TAB 2: UPDATE PROGRESS FISIK PER PROYEK */}
        {activeSubTab === 'PROGRESS' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div>
                <div className="font-bold text-emerald-950">
                  Slider & Input Persentase Progress Fisik Kawasan (Real-time ke Homepage)
                </div>
                <p className="text-emerald-800 text-[11px]">
                  Geser slider (0–100%) atau ketik angka langsung untuk mengubah progress bar Bahagia Land dan Bahagia Residence di halaman depan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetGalleryAndProgressData('RESET_PROGRESS_ZERO');
                  toast.success('Progress fisik kedua proyek di-reset ke 0%');
                }}
                className="px-3.5 py-2 bg-red-600 text-white font-bold rounded-lg cursor-pointer shrink-0"
              >
                Reset Progress ke 0%
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {projectPhysicalProgress.map((prog) => (
                <div
                  key={prog.id}
                  className="border border-gray-200 rounded-2xl p-5 space-y-4 bg-gray-50/50"
                >
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-emerald-700">
                        PROYEK: {prog.projectName.toUpperCase()}
                      </span>
                      <h3 className="text-base font-bold text-gray-900">
                        Progress Keseluruhan: {prog.overallPercentage}%
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={prog.overallPercentage}
                        onChange={(e) =>
                          updateProjectPhysicalProgress(prog.id, {
                            overallPercentage: Number(e.target.value),
                            stages: prog.stages,
                          })
                        }
                        className="w-20 border border-gray-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-center bg-white"
                      />
                      <span className="font-bold">%</span>
                    </div>
                  </div>

                  <div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={prog.overallPercentage}
                      onChange={(e) =>
                        updateProjectPhysicalProgress(prog.id, {
                          overallPercentage: Number(e.target.value),
                          stages: prog.stages,
                        })
                      }
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="font-bold text-gray-800">
                      Rincian 5 Tahapan Pekerjaan ({prog.projectName}):
                    </div>
                    {prog.stages.map((st, sIdx) => (
                      <div
                        key={st.id}
                        className="bg-white border border-gray-200 rounded-xl p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={st.label}
                            onChange={(e) => {
                              const nextStages = prog.stages.map((item, i) =>
                                i === sIdx ? { ...item, label: e.target.value } : item
                              );
                              updateProjectPhysicalProgress(prog.id, {
                                overallPercentage: prog.overallPercentage,
                                stages: nextStages,
                              });
                            }}
                            className="border border-gray-200 rounded px-2 py-1 font-semibold text-gray-800 flex-1"
                          />
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={st.percentage}
                              onChange={(e) => {
                                const nextStages = prog.stages.map((item, i) =>
                                  i === sIdx
                                    ? { ...item, percentage: Number(e.target.value) }
                                    : item
                                );
                                updateProjectPhysicalProgress(prog.id, {
                                  overallPercentage: prog.overallPercentage,
                                  stages: nextStages,
                                });
                              }}
                              className="w-16 border border-gray-300 rounded px-2 py-1 font-mono font-bold text-right"
                            />
                            <span className="font-mono font-bold">%</span>
                          </div>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={st.percentage}
                          onChange={(e) => {
                            const nextStages = prog.stages.map((item, i) =>
                              i === sIdx
                                ? { ...item, percentage: Number(e.target.value) }
                                : item
                            );
                            updateProjectPhysicalProgress(prog.id, {
                              overallPercentage: prog.overallPercentage,
                              stages: nextStages,
                            });
                          }}
                          className="w-full accent-emerald-600 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-TAB 3: KONTROL ADMIN & KATEGORI */}
        {activeSubTab === 'SETTINGS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
              <h3 className="font-bold text-gray-900 text-sm">
                Pengaturan Tampilan Galeri & Progress di Homepage
              </h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl cursor-pointer">
                  <span className="font-semibold text-gray-800">
                    Tampilkan Grid Galeri Foto di Homepage
                  </span>
                  <input
                    type="checkbox"
                    checked={gallerySettings.showGallerySection}
                    onChange={(e) =>
                      updateGallerySettings({ showGallerySection: e.target.checked })
                    }
                    className="w-4 h-4 accent-emerald-600"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl cursor-pointer">
                  <span className="font-semibold text-gray-800">
                    Tampilkan Progress Bar Fisik di Homepage
                  </span>
                  <input
                    type="checkbox"
                    checked={gallerySettings.showProgressSection}
                    onChange={(e) =>
                      updateGallerySettings({ showProgressSection: e.target.checked })
                    }
                    className="w-4 h-4 accent-emerald-600"
                  />
                </label>

                <div>
                  <label className="font-bold text-gray-700 block mb-1.5">
                    Jumlah Foto di Homepage (6 / 9 / 12)
                  </label>
                  <div className="flex gap-2">
                    {([6, 9, 12] as const).map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => updateGallerySettings({ maxPhotosHomepage: n })}
                        className={`flex-1 py-2 rounded-lg font-bold border cursor-pointer ${
                          gallerySettings.maxPhotosHomepage === n
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-gray-700 border-gray-300'
                        }`}
                      >
                        {n} Foto
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
              <h3 className="font-bold text-gray-900 text-sm">
                Tambah / Edit Kategori Galeri Foto
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nama kategori baru (mis: Infrastruktur)..."
                  value={newCustomCat}
                  onChange={(e) => setNewCustomCat(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newCustomCat.trim()) return;
                    updateGallerySettings({
                      customCategories: [
                        ...gallerySettings.customCategories,
                        newCustomCat.trim(),
                      ],
                    });
                    setNewCustomCat('');
                    toast.success('✅ Kategori galeri ditambahkan');
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg cursor-pointer"
                >
                  + Tambah
                </button>
              </div>
              <div className="space-y-1.5">
                {gallerySettings.customCategories.map((c, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg"
                  >
                    <span className="font-semibold text-gray-800">{c}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateGallerySettings({
                          customCategories: gallerySettings.customCategories.filter(
                            (_, i) => i !== idx
                          ),
                        })
                      }
                      className="text-red-600 hover:underline font-semibold cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tambah/Edit Foto Galeri */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                {editingPhotoId ? '✏️ Edit Foto Galeri' : '+ Upload Foto Galeri Pembangunan'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePhoto} className="space-y-4">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Judul Foto *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Pemasangan Rangka Atap Blok A"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Kategori *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  >
                    {gallerySettings.customCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Proyek *</label>
                  <select
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="Bahagia Land">Bahagia Land</option>
                    <option value="Bahagia Residence">Bahagia Residence</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Blok / Unit (Opsional)
                  </label>
                  <input
                    type="text"
                    value={unitBlock}
                    onChange={(e) => setUnitBlock(e.target.value)}
                    placeholder="Blok A / A-05"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Tanggal Foto</label>
                  <input
                    type="date"
                    value={dateTaken}
                    onChange={(e) => setDateTaken(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white font-semibold"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Deskripsi / Caption Foto
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Keterangan singkat dokumentasi lapangan..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <UploadFoto
                photos={uploadedUrls}
                onChange={setUploadedUrls}
                maxPhotos={editingPhotoId ? 1 : 6}
                label="Upload Foto Pembangunan (Bisa Multi-Upload sekaligus)"
              />

              <label className="flex items-center gap-2 font-bold text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeaturedOnHome}
                  onChange={(e) => setIsFeaturedOnHome(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600"
                />
                <span>⭐ Tampilkan di Homepage Utama (Featured)</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-semibold text-gray-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Simpan Foto Galeri
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. ADMIN MANAGER: ARTIKEL & BERITA BLOG (/sistem/artikel)
// ============================================================================
export const AdminBlogArticlesManager: React.FC = () => {
  const [searchParams] = useSearchParams();
  const {
    blogArticles,
    blogSettings,
    saveBlogArticle,
    deleteBlogArticle,
    duplicateBlogArticle,
    toggleBlogArticleStatus,
    toggleBlogArticleFeatured,
    reorderBlogArticle,
    updateBlogSettings,
    resetBlogArticlesData,
  } = useAppStore();

  const [searchQ, setSearchQ] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Tips KPR');
  const [thumbnailList, setThumbnailList] = useState<string[]>([ASSETS.unitInterior]);
  const [excerpt, setExcerpt] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [contentImages, setContentImages] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState('KPR Subsidi, Bahagia Land, Kendari');
  const [author, setAuthor] = useState('Tim KPR Bahagia Group');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<'Draft' | 'Published' | 'Scheduled'>('Published');
  const [isFeatured, setIsFeatured] = useState(true);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  // Auto-open edit modal if ?edit=ID is in URL
  useEffect(() => {
    const editParam = searchParams.get('edit');
    if (editParam) {
      const found = blogArticles.find((a) => a.id === editParam || a.slug === editParam);
      if (found) {
        openEditModal(found);
      }
    }
  }, [searchParams]);

  const filteredArticles = useMemo(() => {
    return [...blogArticles]
      .sort((a, b) => a.order - b.order)
      .filter((a) => {
        if (catFilter !== 'ALL' && a.category !== catFilter) return false;
        if (searchQ.trim()) {
          const q = searchQ.toLowerCase();
          return (
            a.title.toLowerCase().includes(q) ||
            a.slug.toLowerCase().includes(q) ||
            a.excerpt.toLowerCase().includes(q)
          );
        }
        return true;
      });
  }, [blogArticles, catFilter, searchQ]);

  const openAddModal = () => {
    setEditingId(undefined);
    setTitle('');
    setSlug('');
    setCategory(blogSettings.customCategories[0] || 'Tips KPR');
    setThumbnailList([ASSETS.unitInterior]);
    setExcerpt('');
    setContentHtml(
      '<p>Tuliskan isi artikel lengkap di sini...</p>\n<h3>Subjudul Bagian 1</h3>\n<p>Penjelasan detail...</p>'
    );
    setContentImages([]);
    setTagsInput('KPR Subsidi, Rumah Pertama, Kendari');
    setAuthor('Tim KPR Bahagia Group');
    setPublishDate(new Date().toISOString().slice(0, 10));
    setStatus('Published');
    setIsFeatured(false);
    setMetaTitle('');
    setMetaDescription('');
    setModalOpen(true);
  };

  const openEditModal = (art: BlogArticleRecord) => {
    setEditingId(art.id);
    setTitle(art.title);
    setSlug(art.slug);
    setCategory(art.category);
    setThumbnailList([art.thumbnailUrl || ASSETS.unitInterior]);
    setExcerpt(art.excerpt);
    setContentHtml(art.contentHtml);
    setContentImages(art.contentImages || []);
    setTagsInput((art.tags || []).join(', '));
    setAuthor(art.author);
    setPublishDate(art.publishDate);
    setStatus(art.status);
    setIsFeatured(art.isFeatured);
    setMetaTitle(art.metaTitle || '');
    setMetaDescription(art.metaDescription || '');
    setModalOpen(true);
  };

  const insertFormatTag = (openTag: string, closeTag: string) => {
    setContentHtml((prev) => `${prev}\n${openTag}Teks di sini${closeTag}`);
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim() || !contentHtml.trim()) {
      toast.error('Judul artikel, ringkasan, dan isi artikel wajib diisi.');
      return;
    }

    const saved = saveBlogArticle({
      id: editingId,
      title: title.trim(),
      slug: slug.trim() || generateArticleSlug(title),
      category,
      thumbnailUrl: thumbnailList[0] || ASSETS.unitInterior,
      excerpt: excerpt.trim().slice(0, 200),
      contentHtml,
      contentImages,
      tags: tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      author: author.trim() || 'Admin Bahagia Group',
      publishDate,
      status,
      isFeatured,
      metaTitle: metaTitle.trim() || `${title.trim()} — Bahagia Group Property`,
      metaDescription: metaDescription.trim() || excerpt.trim().slice(0, 160),
    });

    setModalOpen(false);
    toast.success(
      editingId
        ? `✅ Artikel "${saved.title}" berhasil diperbarui!`
        : `✅ Artikel baru "${saved.title}" berhasil diterbitkan!`
    );
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <div className="text-emerald-700 font-mono font-bold text-[11px]">
              SECTION 3 · /sistem/artikel · BLOG, TIPS KPR & BERITA PERUSAHAAN
            </div>
            <h2 className="text-lg font-bold text-gray-900 mt-0.5">
              Manajemen Artikel & Info Properti (CMS Blog Lengkap)
            </h2>
            <p className="text-gray-500">
              Tulis artikel baru dengan rich text formatting, upload gambar, atur SEO meta title/description, dan publikasikan langsung ke website publik.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>[+ Tulis Artikel Baru]</span>
            </button>
            <Link
              to="/artikel"
              className="px-3.5 py-2.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
              <span>Lihat /artikel</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                resetBlogArticlesData('RESTORE_DEFAULT');
                toast.success('🔄 Artikel default berhasil dipulihkan!');
              }}
              className="px-3.5 py-2.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl cursor-pointer"
            >
              [🔄 Reset Default]
            </button>
          </div>
        </div>

        {/* Kontrol Admin Section 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div>
            <label className="font-bold text-gray-800 block mb-1">
              Tampilkan Section Artikel di Homepage
            </label>
            <button
              type="button"
              onClick={() => {
                const next = !blogSettings.showOnHomepage;
                updateBlogSettings({ showOnHomepage: next });
                toast.success(
                  next
                    ? '✅ Section Artikel ditampilkan di Homepage'
                    : 'Section Artikel disembunyikan dari Homepage'
                );
              }}
              className={`w-full py-2 px-3 rounded-lg font-bold border cursor-pointer ${
                blogSettings.showOnHomepage
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {blogSettings.showOnHomepage ? '✅ Tampil di Homepage (ON)' : '❌ Disembunyikan (OFF)'}
            </button>
          </div>

          <div>
            <label className="font-bold text-gray-800 block mb-1">
              Jumlah Artikel di Homepage (3 / 6)
            </label>
            <div className="flex gap-2">
              {([3, 6] as const).map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => updateBlogSettings({ maxArticlesHomepage: cnt })}
                  className={`flex-1 py-2 rounded-lg font-bold border cursor-pointer ${
                    blogSettings.maxArticlesHomepage === cnt
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  {cnt} Artikel
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-800 block mb-1">
              Tambah Kategori Artikel Baru
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="Kategori baru..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newCategoryName.trim()) return;
                  updateBlogSettings({
                    customCategories: [
                      ...blogSettings.customCategories,
                      newCategoryName.trim(),
                    ],
                  });
                  setNewCategoryName('');
                  toast.success('✅ Kategori artikel baru ditambahkan');
                }}
                className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Filter Kategori & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {['ALL', ...blogSettings.customCategories].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCatFilter(c)}
                className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                  catFilter === c
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {c === 'ALL' ? `Semua (${blogArticles.length})` : c}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Cari judul artikel atau slug..."
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 min-w-[250px]"
          />
        </div>

        {/* Tabel Artikel: Thumbnail | Judul | Kategori | Tanggal | Status | Views | Aksi */}
        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                <th className="py-3 px-3">Urutan</th>
                <th className="py-3 px-3">Thumbnail</th>
                <th className="py-3 px-3">Judul & Slug URL</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3">Tanggal</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Views</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredArticles.map((art, idx) => (
                <tr key={art.id} className="hover:bg-gray-50">
                  <td className="py-3 px-3 font-mono">
                    <div className="flex items-center gap-1">
                      <span className="font-bold">#{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => reorderBlogArticle(art.id, 'UP')}
                        className="p-1 hover:bg-gray-200 rounded cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => reorderBlogArticle(art.id, 'DOWN')}
                        className="p-1 hover:bg-gray-200 rounded cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <img
                      src={art.thumbnailUrl}
                      alt={art.title}
                      className="w-16 h-12 object-cover rounded-lg border border-gray-200"
                    />
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    <div className="font-bold text-gray-900 line-clamp-1">{art.title}</div>
                    <div className="font-mono text-[11px] text-emerald-700">
                      /artikel/{art.slug}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-bold text-[11px]">
                      {art.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-gray-600">{art.publishDate}</td>
                  <td className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => toggleBlogArticleStatus(art.id)}
                      className={`px-2.5 py-1 rounded-md font-bold text-[11px] cursor-pointer ${
                        art.status === 'Published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : art.status === 'Scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {art.status}
                    </button>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-gray-700">
                    {art.viewsCount}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(art)}
                        className="px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-bold cursor-pointer"
                      >
                        [✏️ Edit]
                      </button>
                      <Link
                        to={`/artikel/${art.slug}`}
                        className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold"
                      >
                        [👁️ Preview]
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          duplicateBlogArticle(art.id);
                          toast.success('📋 Artikel berhasil diduplikasi sebagai Draft');
                        }}
                        className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold cursor-pointer"
                      >
                        [📋 Duplikat]
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          deleteBlogArticle(art.id);
                          toast.success('🗑️ Artikel dipindahkan ke Trash');
                        }}
                        className="px-2.5 py-1.5 bg-red-50 text-red-700 rounded-lg font-bold cursor-pointer"
                      >
                        [🗑️ Hapus]
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tulis / Edit Artikel Lengkap */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                {editingId ? '✏️ Edit Artikel / Berita' : '+ Tulis Artikel / Berita Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Judul Artikel *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!editingId) {
                        setSlug(generateArticleSlug(e.target.value));
                      }
                    }}
                    placeholder="Contoh: 5 Tips Lolos KPR Subsidi dengan Mudah"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Slug URL (Auto-generate, bisa diedit)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="5-tips-lolos-kpr-subsidi-dengan-mudah"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Kategori *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  >
                    {blogSettings.customCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Penulis</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Tanggal Publish
                  </label>
                  <input
                    type="date"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white font-bold"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-gray-700">
                    Ringkasan / Excerpt * (Maksimal 200 Karakter)
                  </label>
                  <span className="font-mono text-[11px] text-gray-400">
                    {excerpt.length}/200
                  </span>
                </div>
                <textarea
                  rows={2}
                  required
                  maxLength={200}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Ringkasan singkat artikel yang tampil pada kartu blog di homepage..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              {/* Rich Text Editor dengan Toolbar Formatting */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="font-semibold text-gray-700">
                    Isi Artikel Lengkap * (Rich Text Editor)
                  </label>
                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      type="button"
                      onClick={() => insertFormatTag('<strong>', '</strong>')}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded font-bold cursor-pointer"
                    >
                      B (Bold)
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatTag('<em>', '</em>')}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded italic cursor-pointer"
                    >
                      I (Italic)
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatTag('<h3>', '</h3>')}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded font-bold cursor-pointer"
                    >
                      H3 Heading
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertFormatTag('<ul>\n  <li>', '</li>\n  <li>Poin 2</li>\n</ul>')
                      }
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
                    >
                      • List
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertFormatTag('<a href="/booking" class="text-emerald-700 underline">', '</a>')
                      }
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
                    >
                      🔗 Link
                    </button>
                  </div>
                </div>
                <textarea
                  rows={8}
                  required
                  value={contentHtml}
                  onChange={(e) => setContentHtml(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <UploadFoto
                  photos={thumbnailList}
                  onChange={setThumbnailList}
                  maxPhotos={1}
                  label="Thumbnail Utama Artikel *"
                />
                <UploadFoto
                  photos={contentImages}
                  onChange={setContentImages}
                  maxPhotos={4}
                  label="Sisipkan Foto di Dalam Artikel (Opsional)"
                />
              </div>

              {/* Tags & SEO */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Tags (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="KPR Subsidi, FLPP, Kendari"
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    SEO Meta Title
                  </label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Otomatis dari judul jika kosong"
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    SEO Meta Description
                  </label>
                  <input
                    type="text"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Otomatis dari ringkasan jika kosong"
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 bg-white"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 font-bold text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600"
                />
                <span>⭐ Jadikan Artikel Unggulan (Featured di Homepage)</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-semibold text-gray-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Simpan & Publikasikan Artikel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
