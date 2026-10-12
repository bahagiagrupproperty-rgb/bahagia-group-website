import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  RefreshCw,
  CheckCircle2,
  X,
  Trash2,
  Star,
  AlertCircle,
  SwitchCamera,
  Upload,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { KavlingLot } from '../data/seedData';
import { useAppStore } from '../store/useAppStore';

interface UnitLiveCameraCaptureProps {
  unit: KavlingLot;
  compact?: boolean;
}

export const UnitLiveCameraCapture: React.FC<UnitLiveCameraCaptureProps> = ({
  unit,
  compact = false,
}) => {
  const { currentUser, saveKavlingLotFull } = useAppStore();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [photoNote, setPhotoNote] = useState('');
  const [setAsPrimaryPhoto, setSetAsPrimaryPhoto] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isStaff = Boolean(currentUser && currentUser.role !== 'USER');
  const staffDisplayName = currentUser?.name || 'Staf Lapangan Bahagia Group';
  const staffRole = currentUser?.role || 'PENGAWAS';

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCameraStream = useCallback(
    async (mode: 'environment' | 'user') => {
      setCameraError(null);
      stopCameraStream();

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(
          'Browser atau perangkat ini tidak mendukung akses kamera langsung (getUserMedia). Anda tetap dapat mengambil foto melalui tombol kamera perangkat di bawah.'
        );
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch (err: any) {
        const msg =
          err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError'
            ? 'Izin kamera ditolak. Mohon izinkan akses kamera pada browser untuk mengambil foto langsung unit rumah.'
            : 'Tidak dapat mengakses kamera secara langsung. Pastikan kamera terhubung dan tidak sedang digunakan aplikasi lain.';
        setCameraError(msg);
      }
    },
    [stopCameraStream]
  );

  useEffect(() => {
    if (cameraOpen && !capturedDataUrl) {
      startCameraStream(facingMode);
    } else {
      stopCameraStream();
    }
    return () => {
      stopCameraStream();
    };
  }, [cameraOpen, facingMode, capturedDataUrl, startCameraStream, stopCameraStream]);

  const handleOpenCameraModal = () => {
    setCapturedDataUrl(null);
    setCameraError(null);
    setPhotoNote(`Dokumentasi Lapangan Kavling ${unit.code} (${unit.progress}%)`);
    setCameraOpen(true);
  };

  const handleCloseCameraModal = () => {
    stopCameraStream();
    setCameraOpen(false);
    setCapturedDataUrl(null);
    setCameraError(null);
  };

  const handleSwitchFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const stampAndCompressCanvas = (source: HTMLVideoElement | HTMLImageElement, srcW: number, srcH: number): string => {
    const canvas = canvasRef.current || document.createElement('canvas');
    const maxW = 1024;
    const scale = srcW > maxW ? maxW / srcW : 1;
    const width = Math.max(320, Math.round(srcW * scale));
    const height = Math.max(240, Math.round(srcH * scale));
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.drawImage(source, 0, 0, width, height);

    // Draw subtle bottom metadata watermark bar for official unit verification record
    const barHeight = 44;
    ctx.fillStyle = 'rgba(17, 24, 39, 0.72)';
    ctx.fillRect(0, height - barHeight, width, barHeight);

    const timestamp = new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(
      `UNIT ${unit.code} · ${unit.projectName.toUpperCase()} (${unit.progress}%)`,
      12,
      height - 24
    );

    ctx.fillStyle = '#F9FAFB';
    ctx.font = '11px sans-serif';
    ctx.fillText(
      `Live Capture: ${timestamp} WITA · Oleh: ${staffDisplayName} (${staffRole})`,
      12,
      height - 8
    );

    return canvas.toDataURL('image/jpeg', 0.82);
  };

  const handleCaptureFrame = () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      toast.error('Kamera belum siap. Silakan tunggu sebentar atau gunakan tombol Unggah/Kamera Perangkat.');
      return;
    }
    const vw = video.videoWidth || 1280;
    const vh = video.videoHeight || 720;
    const dataUrl = stampAndCompressCanvas(video, vw, vh);
    if (dataUrl) {
      stopCameraStream();
      setCapturedDataUrl(dataUrl);
    }
  };

  const handleFallbackFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const dataUrl = stampAndCompressCanvas(img, img.width, img.height);
        if (dataUrl) {
          stopCameraStream();
          setCapturedDataUrl(dataUrl);
        }
      };
      img.src = String(ev.target?.result || '');
    };
    reader.readAsDataURL(file);
  };

  const handleAssociatePhotoToUnit = () => {
    if (!capturedDataUrl) return;
    setIsSaving(true);
    try {
      const existingPhotos = Array.isArray(unit.photos) ? unit.photos : [];
      const updatedPhotos = setAsPrimaryPhoto
        ? [capturedDataUrl, ...existingPhotos]
        : [...existingPhotos, capturedDataUrl];

      const updatedNotes = photoNote.trim()
        ? `${photoNote.trim()} (Foto Live oleh ${staffDisplayName})`
        : unit.pengawasNotes;

      saveKavlingLotFull({
        ...unit,
        photos: updatedPhotos,
        pengawasNotes: updatedNotes,
      });

      toast.success(
        `📸 Foto live Kavling ${unit.code} berhasil disimpan & dikaitkan langsung ke data unit properti!`
      );
      handleCloseCameraModal();
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetPhotoAsPrimary = (idx: number) => {
    if (idx === 0 || !unit.photos[idx]) return;
    const chosen = unit.photos[idx];
    const rest = unit.photos.filter((_, i) => i !== idx);
    saveKavlingLotFull({
      ...unit,
      photos: [chosen, ...rest],
    });
    toast.success(`Foto #${idx + 1} dijadikan foto utama Kavling ${unit.code}`);
  };

  const handleRemoveUnitPhoto = (idx: number) => {
    if (unit.photos.length <= 1) {
      toast.error('Unit harus memiliki minimal 1 foto dokumentasi.');
      return;
    }
    const nextPhotos = unit.photos.filter((_, i) => i !== idx);
    saveKavlingLotFull({
      ...unit,
      photos: nextPhotos,
    });
    toast.success(`Foto dokumentasi dihapus dari Kavling ${unit.code}`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
              <Camera className="w-3 h-3" />
              <span>LIVE CAMERA DOKUMENTASI UNIT</span>
            </span>
            {isStaff && (
              <span className="text-[11px] font-mono text-gray-500">
                Staf Aktif: {staffDisplayName} ({staffRole})
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-gray-900">
            Ambil &amp; Kaitkan Foto Langsung ke Properti Kavling {unit.code}
          </h3>
          <p className="text-xs text-gray-500">
            Gunakan kamera perangkat untuk memotret kondisi aktual unit rumah di lapangan dan menyimpannya langsung ke catatan properti.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCameraModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0 transition-colors"
        >
          <Camera className="w-4 h-4" />
          <span>Ambil Foto Kamera Live</span>
        </button>
      </div>

      {/* Associated Unit Photos Strip */}
      {!compact && unit.photos && unit.photos.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-700">
              Foto Terkait pada Rekord Kavling {unit.code} ({unit.photos.length} Foto)
            </span>
            <span className="text-[11px] text-gray-500">
              Foto #1 tampil sebagai sampul utama unit
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {unit.photos.map((photoUrl, idx) => (
              <div
                key={idx}
                className={`group relative rounded-lg overflow-hidden border bg-gray-50 ${
                  idx === 0 ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-gray-200'
                }`}
              >
                <img
                  src={photoUrl}
                  alt={`Kavling ${unit.code} - Foto ${idx + 1}`}
                  className="w-full h-24 object-cover"
                />
                {idx === 0 && (
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded">
                    Utama
                  </span>
                )}
                <div className="flex items-center justify-between px-2 py-1 bg-white border-t border-gray-100 text-[11px]">
                  <span className="font-mono text-gray-600">Foto #{idx + 1}</span>
                  <div className="flex items-center gap-1">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetPhotoAsPrimary(idx)}
                        className="p-1 text-gray-500 hover:text-amber-600 cursor-pointer"
                        title="Jadikan Foto Utama"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {unit.photos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveUnitPhoto(idx)}
                        className="p-1 text-gray-400 hover:text-red-600 cursor-pointer"
                        title="Hapus Foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden Canvas for capturing & watermarking */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Live Camera Modal */}
      {cameraOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          onClick={handleCloseCameraModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-gray-200 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl text-xs"
          >
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-gray-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-bold text-sm">
                    Kamera Live Dokumentasi — Kavling {unit.code}
                  </div>
                  <div className="text-[11px] text-gray-300">
                    {unit.projectName} · {unit.type} · Status: {unit.status}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseCameraModal}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Camera Viewport or Captured Image Preview */}
              {!capturedDataUrl ? (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden bg-gray-950 aspect-video flex items-center justify-center border border-gray-800">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/60 text-white font-mono text-[11px] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      <span>LIVE · {unit.code}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSwitchFacingMode}
                      className="absolute top-3 right-3 px-2.5 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer"
                      title="Ganti Kamera Depan / Belakang"
                    >
                      <SwitchCamera className="w-3.5 h-3.5" />
                      <span>{facingMode === 'environment' ? 'Kamera Belakang' : 'Kamera Depan'}</span>
                    </button>
                  </div>

                  {cameraError && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-900">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="font-semibold">{cameraError}</div>
                        <div className="text-[11px] text-amber-800">
                          Anda juga dapat menggunakan tombol <strong>Kamera Perangkat / Pilih File</strong> di bawah.
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFallbackFileInput}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Kamera Perangkat / File</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCaptureFrame}
                      className="flex-1 sm:flex-initial px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>jepret Foto Unit Sekarang</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden border border-emerald-300 bg-gray-950">
                    <img
                      src={capturedDataUrl}
                      alt={`Hasil Foto Kavling ${unit.code}`}
                      className="w-full max-h-80 object-contain mx-auto"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Foto Siap Dikaitkan ke Unit {unit.code}</span>
                    </span>
                  </div>

                  <div className="space-y-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">
                        Catatan Dokumentasi Lapangan (Tersimpan di Rekord Unit)
                      </label>
                      <input
                        type="text"
                        value={photoNote}
                        onChange={(e) => setPhotoNote(e.target.value)}
                        placeholder={`Contoh: Tampak depan Kavling ${unit.code} selesai pengecatan`}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={setAsPrimaryPhoto}
                        onChange={(e) => setSetAsPrimaryPhoto(e.target.checked)}
                        className="accent-emerald-600 w-4 h-4"
                      />
                      <span className="font-medium text-gray-800">
                        Jadikan sebagai foto sampul utama (Primary Photo) untuk Kavling {unit.code}
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setCapturedDataUrl(null)}
                      className="px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Ambil Ulang</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleAssociatePhotoToUnit}
                      className="flex-1 py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Simpan &amp; Kaitkan ke Kavling {unit.code}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
