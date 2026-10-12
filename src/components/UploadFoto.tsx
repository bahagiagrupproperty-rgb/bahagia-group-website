import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, ZoomIn, ArrowLeft, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ASSETS } from '../data/seedData';

interface UploadFotoProps {
  photos: string[];
  onChange: (newPhotos: string[]) => void;
  label?: string;
}

export const UploadFoto: React.FC<UploadFotoProps> = ({
  photos,
  onChange,
  label = 'Upload Foto Dokumentasi / Katalog (Unlimited · Auto-Compress · Maks 5MB/file)',
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxW = 1000;
          const scale = img.width > maxW ? maxW / img.width : 1;
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const validFiles = acceptedFiles.filter((f) => {
        if (f.size > 5 * 1024 * 1024) {
          toast.error(`Ukuran file ${f.name} melebihi batas 5MB`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      setUploading(true);
      setProgress(25);
      const compressedList: string[] = [];

      for (let i = 0; i < validFiles.length; i++) {
        const dataUrl = await compressImage(validFiles[i]);
        compressedList.push(dataUrl);
        setProgress(Math.round(((i + 1) / validFiles.length) * 100));
      }

      onChange([...photos, ...compressedList]);
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
        toast.success(`${compressedList.length} foto berhasil di-compress & diunggah`);
      }, 250);
    },
    [photos, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: true,
  });

  const handleRemove = (idx: number) => {
    const removed = photos[idx];
    const next = photos.filter((_, i) => i !== idx);
    onChange(next);
    toast('Foto dihapus dari galeri', {
      action: {
        label: 'Undo',
        onClick: () => onChange([...next.slice(0, idx), removed, ...next.slice(idx)]),
      },
    });
  };

  const handleReorder = (idx: number, dir: -1 | 1) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= photos.length) return;
    const copy = [...photos];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    onChange(copy);
  };

  const addPlaceholderDemo = () => {
    onChange([...photos, ASSETS.placeholder]);
    toast.success('Foto placeholder standar berhasil ditambahkan');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-700">{label}</span>
        <button
          type="button"
          onClick={addPlaceholderDemo}
          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium whitespace-nowrap"
        >
          + Tambah Foto Placeholder
        </button>
      </div>

      <div
        {...getRootProps()}
        className={`border border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-emerald-500 bg-emerald-50/40' : 'border-gray-300 bg-gray-50/60 hover:bg-gray-100/60'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-5 h-5 text-gray-500 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-800">
          Tarik & letakkan banyak foto di sini, atau klik untuk memilih file
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Mendukung Bulk Upload Unlimited · Otomatis Kompresi Web · Maksimal 5MB per foto
        </p>
      </div>

      {uploading && (
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div className="bg-emerald-500 h-full transition-all duration-200" style={{ width: `${progress}%` }} />
        </div>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {photos.map((src, idx) => (
            <div key={idx} className="group relative border border-gray-200 rounded-lg overflow-hidden bg-white">
              <img
                src={src || ASSETS.placeholder}
                alt={`Galeri ${idx + 1}`}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = ASSETS.placeholder;
                }}
                className="w-full h-28 object-cover"
              />
              <div className="flex items-center justify-between px-2 py-1.5 bg-white border-t border-gray-100 text-xs text-gray-600">
                <span className="tabular-nums">#{idx + 1}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleReorder(idx, -1)}
                    disabled={idx === 0}
                    className="p-1 hover:text-gray-900 disabled:opacity-30"
                    title="Geser Kiri"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReorder(idx, 1)}
                    disabled={idx === photos.length - 1}
                    className="p-1 hover:text-gray-900 disabled:opacity-30"
                    title="Geser Kanan"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLightboxUrl(src)}
                    className="p-1 hover:text-emerald-600"
                    title="Perbesar Lightbox"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="p-1 text-red-600 hover:text-red-700"
                    title="Hapus Foto"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {photos.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-500 py-1">
          <ImageIcon className="w-4 h-4 text-gray-400" />
          <span>Belum ada foto diunggah. Gunakan area drag & drop di atas.</span>
        </div>
      )}

      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        >
          <div className="max-w-4xl w-full bg-white rounded-xl overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <span className="text-sm font-semibold text-gray-900">Pratinjau Foto Resolusi Penuh</span>
              <button
                type="button"
                onClick={() => setLightboxUrl(null)}
                className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={lightboxUrl}
              alt="Lightbox Preview"
              referrerPolicy="no-referrer"
              className="w-full max-h-[75vh] object-contain bg-gray-950"
            />
          </div>
        </div>
      )}
    </div>
  );
};
