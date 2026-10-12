import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { TextCategory } from '../data/superAdminSeedData';
import { auth, db, doc, getDoc, onAuthStateChanged } from '../lib/firebase';
import {
  Edit3,
  Check,
  X,
  RotateCcw,
  Eye,
  Upload,
  Trash2,
  Star,
  ArrowLeft,
  ArrowRight,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  History,
  Rocket,
  Image as ImageIcon,
  FileText,
  Plus,
  Sliders,
  Map,
  Building2,
  MessageSquare,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';

interface EditableTextProps {
  textKey: string;
  fallback: string;
  category?: TextCategory;
  location?: string;
  className?: string;
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3';
  onSaveOverride?: (newVal: string) => void;
}

export const EditableText: React.FC<EditableTextProps> = ({
  textKey,
  fallback,
  category = 'Website',
  location = 'Teks Halaman',
  className = '',
  as: Component = 'span',
  onSaveOverride,
}) => {
  const {
    currentUser,
    editMode,
    editableTexts,
    updateEditableText,
    resetEditableText,
    revertEditableTextVersion,
  } = useAppStore();

  const isAdmin = Boolean(currentUser && currentUser.active && currentUser.role === 'ADMIN');

  const item = editableTexts[textKey];
  const currentVal = item !== undefined ? item.currentText : fallback;

  const [openModal, setOpenModal] = useState(false);
  const [draft, setDraft] = useState(currentVal);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!openModal) {
      setDraft(currentVal);
    }
  }, [currentVal, openModal]);

  if (!editMode || !isAdmin) {
    return <Component className={className}>{currentVal}</Component>;
  }

  const modalContent = openModal ? (
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="bg-white border border-gray-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl text-left text-xs font-normal"
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-mono font-bold rounded text-[10px]">
              INLINE TEXT EDITOR · {category.toUpperCase()}
            </span>
            <h3 className="text-base font-bold text-gray-900 mt-1">{location}</h3>
            <p className="text-[11px] text-gray-500 font-mono">Key: {textKey}</p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpenModal(false);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Rich Text Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-50 border border-gray-200 rounded-lg p-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDraft((d) => `**${d}**`);
              }}
              className="px-2.5 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100 font-bold flex items-center gap-1 cursor-pointer"
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" /> Bold
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDraft((d) => `*${d}*`);
              }}
              className="px-2.5 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100 italic flex items-center gap-1 cursor-pointer"
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" /> Italic
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDraft((d) => `${d}\n• Item Baru`);
              }}
              className="px-2.5 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100 flex items-center gap-1 cursor-pointer"
              title="List"
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDraft((d) => `${d} [Link](/katalog)`);
              }}
              className="px-2.5 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100 flex items-center gap-1 cursor-pointer"
              title="Link"
            >
              <LinkIcon className="w-3.5 h-3.5" /> Link
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDraft('');
                toast.info('🗑️ Teks dikosongkan. Klik Simpan untuk menerapkan.');
              }}
              className="px-2.5 py-1 bg-red-50 border border-red-200 text-red-700 rounded hover:bg-red-100 font-bold flex items-center gap-1 cursor-pointer"
              title="Kosongkan / Hapus Teks"
            >
              <Trash2 className="w-3.5 h-3.5" /> Kosongkan
            </button>
          </div>
          <span className="font-mono text-[11px] text-gray-500">
            {draft.length} karakter
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="font-semibold text-gray-700 block">Teks Baru:</label>
          <textarea
            rows={4}
            value={draft}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
          <div className="text-[11px] font-semibold text-gray-500">Teks Default Sistem:</div>
          <div className="text-gray-700">{item?.defaultText || fallback}</div>
        </div>

        {showPreview && (
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
            <div className="text-[11px] font-bold text-emerald-800">👁️ PREVIEW SEBELUM SIMPAN:</div>
            <div className="text-sm font-medium text-gray-900 whitespace-pre-line">{draft}</div>
          </div>
        )}

        {/* Version History */}
        {item?.history && item.history.length > 0 && (
          <div className="border-t border-gray-100 pt-3 space-y-2">
            <div className="font-bold text-gray-800 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-emerald-600" />
              <span>Riwayat Perubahan ({item.history.length} versi)</span>
            </div>
            <div className="max-h-28 overflow-y-auto space-y-1.5">
              {item.history.map((ver, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between gap-2"
                >
                  <div className="truncate">
                    <span className="font-mono text-[10px] text-gray-500">{ver.timestamp}</span> ·{' '}
                    <span className="font-medium text-gray-800">{ver.value}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      revertEditableTextVersion(textKey, idx);
                      setDraft(ver.value);
                      if (onSaveOverride) {
                        onSaveOverride(ver.value);
                      }
                      toast.success('↩️ Teks dikembalikan ke versi terpilih');
                    }}
                    className="px-2 py-1 bg-white border border-gray-300 hover:bg-gray-100 rounded text-[10px] font-semibold shrink-0 cursor-pointer"
                  >
                    ↩️ Revert
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowPreview((p) => !p);
              }}
              className="px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 rounded-lg font-semibold text-gray-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>👁️ Preview</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                resetEditableText(textKey);
                const defVal = item?.defaultText || fallback;
                setDraft(defVal);
                if (onSaveOverride) {
                  onSaveOverride(defVal);
                }
                toast.success('🔄 Teks dikembalikan ke default');
              }}
              className="px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 rounded-lg font-semibold text-gray-700 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>🔄 Reset Default</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpenModal(false);
              }}
              className="px-3.5 py-2 border border-gray-300 bg-white hover:bg-gray-50 rounded-lg font-semibold text-gray-700 cursor-pointer"
            >
              ↩️ Batal
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onSaveOverride) {
                  onSaveOverride(draft);
                }
                updateEditableText(textKey, draft, location, category);
                setOpenModal(false);
                toast.success('✅ Teks berhasil disimpan & dipublikasikan!');
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>💾 Simpan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <Component
        onClick={(e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setDraft(currentVal);
          setOpenModal(true);
        }}
        title={`Klik untuk edit teks: ${location}`}
        className={`${className} relative inline-block border-2 border-dashed border-blue-500 bg-blue-50/40 hover:bg-blue-100/70 rounded px-1.5 py-0.5 cursor-pointer transition-all group`}
      >
        <span>{currentVal || '(Teks Dihapus / Kosong)'}</span>
        <span className="ml-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-blue-600 text-white rounded shadow-xs">
          ✏️ Edit
        </span>
      </Component>

      {modalContent && typeof document !== 'undefined'
        ? createPortal(modalContent, document.body)
        : modalContent}
    </>
  );
};

interface EditableImageProps {
  slotKey: string;
  defaultSrc: string;
  alt: string;
  className?: string;
  caption?: string;
  onImageChange?: (newUrl: string) => void;
}

export const EditableImage: React.FC<EditableImageProps> = ({
  slotKey,
  defaultSrc,
  alt,
  className = '',
  caption,
  onImageChange,
}) => {
  const {
    currentUser,
    editMode,
    photoSlots,
    addPhotoToSlot,
    deletePhotoFromSlot,
    setPrimaryPhotoInSlot,
    reorderPhotoInSlot,
    resetPhotoSlot,
  } = useAppStore();

  const isAdmin = Boolean(currentUser && currentUser.active && currentUser.role === 'ADMIN');

  const slot = photoSlots.find((s) => s.slotKey === slotKey);
  const primaryPhoto =
    slot?.photos.find((p) => p.isPrimary && p.url) ||
    slot?.photos.find((p) => Boolean(p.url)) || { url: defaultSrc, caption: alt };
  const displayUrl = primaryPhoto?.url || defaultSrc || ASSETS.placeholder;

  const [openModal, setOpenModal] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [customUrlInput, setCustomUrlInput] = useState('');

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} melebihi batas maksimal 10 MB!`);
        return;
      }
      setUploadProgress(25);
      const reader = new FileReader();
      reader.onload = () => {
        setUploadProgress(80);
        setTimeout(() => {
          const dataUrl = String(reader.result);
          const compressedKb = Math.max(85, Math.round((file.size / 1024) * 0.65));
          addPhotoToSlot(slotKey, dataUrl, file.name.replace(/\.[^/.]+$/, ''), compressedKb);
          if (onImageChange) {
            onImageChange(dataUrl);
          }
          setUploadProgress(null);
          toast.success(`✅ Foto "${file.name}" berhasil di-compress (${compressedKb} KB) & dijadikan foto aktif!`);
        }, 200);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <>
      <div className="relative group">
        <img
          src={displayUrl}
          alt={alt}
          referrerPolicy="no-referrer"
          className={className}
        />

        {editMode && isAdmin && (
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpenModal(true);
            }}
            className="absolute inset-0 bg-blue-900/55 opacity-90 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 cursor-pointer border-2 border-dashed border-blue-400 z-10"
          >
            <div className="px-3 py-1.5 bg-white text-blue-900 rounded-xl font-bold text-xs shadow-lg flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-blue-600" />
              <span>✏️ Ganti / Kelola Foto ({slot?.photos.length || 1})</span>
            </div>
            <span className="text-[10px] text-white font-mono mt-1 bg-blue-950/80 px-2 py-0.5 rounded truncate max-w-full">
              {slot?.folderPath || `/photos/${slotKey}.jpg`}
            </span>
          </div>
        )}
      </div>

      {openModal &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-gray-200 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl text-left text-xs max-h-[90vh] overflow-y-auto font-normal"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-mono font-bold rounded text-[10px]">
                    SUPER ADMIN PHOTO MANAGER · UNLIMITED UPLOAD & AUTO-COMPRESS
                  </span>
                  <h3 className="text-base font-bold text-gray-900 mt-1">
                    {slot?.title || caption || alt}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-mono">
                    Slot ID: {slotKey} · Path: {slot?.folderPath || `/photos/${slotKey}-{timestamp}.jpg`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenModal(false);
                  }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drag & Drop / Bulk Upload Box */}
              <label className="block border-2 border-dashed border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50/80 rounded-xl p-6 text-center cursor-pointer transition-colors">
                <Upload className="w-7 h-7 text-emerald-600 mx-auto mb-2" />
                <div className="font-bold text-gray-900 text-sm">
                  Drag & Drop Foto Baru ke Sini atau Klik untuk Pilih File (Langsung Mengganti Foto Aktif)
                </div>
                <div className="text-[11px] text-gray-500 mt-1">
                  Mendukung JPG, PNG, WEBP · Maksimal 10 MB/file · Auto-Compress Otomatis · Unlimited Jumlah Foto
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => handleFilesSelected(e.target.files)}
                  className="hidden"
                />
              </label>

              {/* Input URL Gambar Langsung */}
              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <input
                  type="text"
                  value={customUrlInput}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="Atau tempel URL foto langsung (https://...)"
                  className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!customUrlInput.trim()) return;
                    addPhotoToSlot(slotKey, customUrlInput.trim(), alt || slotKey, 250);
                    if (onImageChange) {
                      onImageChange(customUrlInput.trim());
                    }
                    setCustomUrlInput('');
                    toast.success('✅ Foto dari URL berhasil disimpan & diterapkan!');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shrink-0 cursor-pointer"
                >
                  + Pakai URL Foto
                </button>
              </div>

              {uploadProgress !== null && (
                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[11px] text-emerald-700">
                    <span>Mengompresi & Mengunggah Foto...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Photo Gallery Grid with Action Buttons per Photo */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">
                    Daftar Foto Aktif di Slot Ini ({slot?.photos.length || 1} Foto)
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      resetPhotoSlot(slotKey);
                      if (onImageChange) {
                        onImageChange(defaultSrc);
                      }
                      toast.success('🔄 Slot foto berhasil di-reset ke foto default sistem');
                    }}
                    className="px-3 py-1.5 border border-gray-300 bg-white hover:bg-gray-50 rounded-lg font-semibold text-gray-700 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>🔄 Reset Default</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(slot?.photos || [
                    {
                      id: 'default-1',
                      url: defaultSrc,
                      storagePath: `/photos/${slotKey}.jpg`,
                      caption: alt,
                      isPrimary: true,
                      sizeKb: 320,
                      uploadedAt: 'Default',
                    },
                  ]).map((ph, idx, arr) => (
                    <div
                      key={ph.id}
                      className={`border rounded-xl overflow-hidden bg-white flex flex-col justify-between ${
                        ph.isPrimary ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-gray-200'
                      }`}
                    >
                      <div>
                        <div className="relative">
                          <img
                            src={ph.url}
                            alt={ph.caption}
                            referrerPolicy="no-referrer"
                            className="w-full h-40 object-cover border-b border-gray-100 cursor-zoom-in"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLightboxUrl(ph.url);
                            }}
                          />
                          {ph.isPrimary && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-600 text-white font-bold text-[10px] rounded shadow-xs">
                              ⭐ FOTO UTAMA AKTIF
                            </span>
                          )}
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white font-mono text-[10px] rounded">
                            {ph.sizeKb} KB
                          </span>
                        </div>
                        <div className="p-3 space-y-1">
                          <div className="font-bold text-gray-900 truncate">{ph.caption}</div>
                          <div className="font-mono text-[10px] text-gray-500 truncate">
                            {ph.storagePath}
                          </div>
                        </div>
                      </div>

                      <div className="p-2.5 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setLightboxUrl(ph.url);
                            }}
                            className="px-2 py-1 bg-white border border-gray-300 hover:bg-gray-100 rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                            title="Preview Besar (Lightbox)"
                          >
                            <Eye className="w-3 h-3" /> 👁️ Preview
                          </button>
                          {!ph.isPrimary && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setPrimaryPhotoInSlot(slotKey, ph.id);
                                if (onImageChange) {
                                  onImageChange(ph.url);
                                }
                                toast.success('⭐ Dijadikan foto utama (thumbnail aktif)');
                              }}
                              className="px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Star className="w-3 h-3" /> ⭐ Set Utama
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              reorderPhotoInSlot(slotKey, idx, idx - 1);
                            }}
                            className="p-1 bg-white border border-gray-300 rounded disabled:opacity-40 cursor-pointer"
                            title="Geser Kiri / Atas"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === arr.length - 1}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              reorderPhotoInSlot(slotKey, idx, idx + 1);
                            }}
                            className="p-1 bg-white border border-gray-300 rounded disabled:opacity-40 cursor-pointer"
                            title="Geser Kanan / Bawah"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              deletePhotoFromSlot(slotKey, ph.id);
                              toast.success('🗑️ Foto dihapus (Soft Delete ke Trash 30 Hari)');
                            }}
                            className="px-2 py-1 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenModal(false);
                    toast.success('✅ Perubahan foto berhasil disimpan & tampil di Web Publik!');
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  💾 Simpan & Tutup
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Lightbox Zoom */}
      {lightboxUrl &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            onClick={(e) => {
              e.stopPropagation();
              setLightboxUrl(null);
            }}
            className="fixed inset-0 z-[10000] bg-black/85 flex items-center justify-center p-6 cursor-zoom-out"
          >
            <img
              src={lightboxUrl}
              alt="Preview Zoom"
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[88vh] rounded-xl shadow-2xl border border-white/20"
            />
          </div>,
          document.body
        )}
    </>
  );
};

export const FloatingEditModeToolbar: React.FC = () => {
  const {
    editMode,
    setEditMode,
    currentUser,
    deployAndPublishLiveState,
    lastDeployedAt,
    lastDeployedVersion,
  } = useAppStore();
  const navigate = useNavigate();
  const [firestoreRoleVerified, setFirestoreRoleVerified] = useState<boolean>(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  useEffect(() => {
    if (!currentUser || !currentUser.active || currentUser.role !== 'ADMIN') {
      if (editMode) {
        setEditMode(false);
      }
      setFirestoreRoleVerified(false);
      return;
    }

    setFirestoreRoleVerified(true);

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setFirestoreRoleVerified(currentUser.role === 'ADMIN');
        return;
      }
      try {
        const safeUid = currentUser.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
        const snap = await getDoc(doc(db, 'users', safeUid));
        if (snap.exists()) {
          const data = snap.data();
          setFirestoreRoleVerified(data.role === 'ADMIN' && data.isActive !== false);
        } else {
          setFirestoreRoleVerified(currentUser.role === 'ADMIN');
        }
      } catch {
        setFirestoreRoleVerified(currentUser.role === 'ADMIN');
      }
    });

    return () => unsubscribe();
  }, [currentUser, editMode, setEditMode]);

  if (!currentUser || !currentUser.active || currentUser.role !== 'ADMIN' || !firestoreRoleVerified) {
    return null;
  }

  const adminName = currentUser.name;

  const handleInstantDeploy = async () => {
    setIsDeploying(true);
    try {
      const res = await deployAndPublishLiveState();
      setShowPublishModal(true);
      toast.success(
        `🚀 DEPLOY BERHASIL! Semua perubahan Web Publik & Internal ERP langsung aktif di Link Presentasi (Versi #${String(res.version).slice(-5)})`
      );
    } catch {
      toast.error('Gagal melakukan deploy, silakan coba lagi.');
    } finally {
      setIsDeploying(false);
    }
  };

  const liveOrigin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-dev-ndjmnbhbgl3i4t3rpz35so-730506330170.asia-southeast1.run.app';
  const sharedOrigin = liveOrigin.replace('ais-dev-', 'ais-pre-');

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-wrap items-center gap-1.5 bg-gray-950/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-emerald-500/40 text-xs max-w-[96vw]">
        <div className="flex items-center gap-2 pr-2 border-r border-gray-700">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              editMode ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="font-bold whitespace-nowrap">
            {editMode ? `✏️ EDIT LANGSUNG ON — ${adminName}` : '👑 Super Admin Full Control'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            const next = !editMode;
            setEditMode(next);
            toast.success(
              next
                ? '✏️ Edit Mode AKTIF: Klik tulisan, angka, foto, atau tombol [+ Tambah / 🗑️ Hapus] mana saja di halaman ini!'
                : '👁️ Mode Preview Normal aktif'
            );
          }}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
            editMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-300'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {editMode ? '[✏️ Edit Mode: ON — Klik Tulisan/Foto]' : '[✏️ Aktifkan Edit Semua Tulisan & Foto]'}
        </button>

        {editMode && (
          <button
            type="button"
            onClick={async () => {
              setEditMode(false);
              await handleInstantDeploy();
            }}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg whitespace-nowrap cursor-pointer"
          >
            [💾 Selesai &amp; Deploy Live]
          </button>
        )}

        {/* TOMBOL DEPLOY & PUBLISH LANGSUNG KE LINK PRESENTASI */}
        <button
          type="button"
          disabled={isDeploying}
          onClick={handleInstantDeploy}
          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-extrabold rounded-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-md ring-2 ring-amber-300/60 transition-all"
          title="Publish & Deploy Langsung Semua Perubahan ke Link Web / Presentasi"
        >
          <Rocket className={`w-3.5 h-3.5 ${isDeploying ? 'animate-bounce' : ''}`} />
          <span>{isDeploying ? '⏳ Deploying...' : '🚀 DEPLOY & PUBLISH KE WEB'}</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/sistem/edit-teks')}
          className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded-lg flex items-center gap-1 whitespace-nowrap cursor-pointer"
          title="Tabel Edit Semua Tulisan (~580 Teks)"
        >
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          <span>Semua Teks</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/sistem/foto-manager')}
          className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded-lg flex items-center gap-1 whitespace-nowrap cursor-pointer"
          title="Manajemen & Ganti Semua Foto"
        >
          <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span>Semua Foto</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/sistem/proyek')}
          className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded-lg flex items-center gap-1 whitespace-nowrap cursor-pointer"
          title="Tambah / Edit / Hapus Proyek"
        >
          <Building2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Proyek</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/sistem/kavling')}
          className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded-lg flex items-center gap-1 whitespace-nowrap cursor-pointer"
          title="Canvas Editor Site Plan & Kavling"
        >
          <Map className="w-3.5 h-3.5 text-emerald-400" />
          <span>Site Plan</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/sistem/testimoni')}
          className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded-lg flex items-center gap-1 whitespace-nowrap cursor-pointer"
          title="Kelola Testimoni"
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
          <span>Testimoni</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/sistem/galeri')}
          className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded-lg flex items-center gap-1 whitespace-nowrap cursor-pointer"
          title="Kelola Galeri & Progress"
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          <span>Galeri</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/sistem/artikel')}
          className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded-lg flex items-center gap-1 whitespace-nowrap cursor-pointer"
          title="Kelola Artikel & Berita"
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          <span>Artikel</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/sistem/dashboard')}
          className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg flex items-center gap-1 whitespace-nowrap cursor-pointer"
        >
          <Rocket className="w-3.5 h-3.5" />
          <span>Pusat Admin</span>
        </button>
      </div>

      {showPublishModal &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            onClick={() => setShowPublishModal(false)}
            className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs"
            >
              <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900">
                      ✅ Deploy &amp; Publish Live Berhasil!
                    </h3>
                    <p className="text-[11px] text-emerald-700 font-semibold">
                      Sinkronisasi Real-Time Server &amp; Cloud Aktif · Versi #{String(lastDeployedVersion).slice(-6)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-emerald-950">
                <div className="font-bold">
                  Semua perubahan Anda (Teks, Foto, Logo, Site Plan, Kavling, Artikel, Galeri &amp; Data Internal ERP) telah dipublikasikan!
                </div>
                <p className="text-[11px] leading-relaxed">
                  Siapapun (termasuk Bos Anda) yang membuka link di bawah ini dari HP atau Laptop lain akan langsung melihat perubahan terbaru Anda secara otomatis.
                </p>
                {lastDeployedAt && (
                  <p className="text-[10px] font-mono text-emerald-800 pt-1">
                    Waktu Deploy Terakhir: {lastDeployedAt}
                  </p>
                )}
              </div>

              <div className="space-y-2.5">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5">
                  <div className="font-bold text-gray-900 flex items-center justify-between">
                    <span>1️⃣ Link Presentasi Live (Real-Time Auto-Sync)</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                      DIREKOMENDASIKAN
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-gray-700 break-all bg-white p-2 rounded border border-gray-200">
                    {liveOrigin}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(liveOrigin);
                      toast.success('✅ Link Presentasi Live berhasil disalin!');
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                  >
                    📋 Salin Link Presentasi Live
                  </button>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5">
                  <div className="font-bold text-gray-900">
                    2️⃣ Link Publik Shared (Cloud Firestore Synced)
                  </div>
                  <div className="font-mono text-[11px] text-gray-700 break-all bg-white p-2 rounded border border-gray-200">
                    {sharedOrigin}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(sharedOrigin);
                      toast.success('✅ Link Publik Shared berhasil disalin!');
                    }}
                    className="w-full py-2 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-lg cursor-pointer"
                  >
                    📋 Salin Link Publik Shared
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
