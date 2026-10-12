import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import {
  auth,
  onAuthStateChanged,
  fbSignOut,
  getPermissionsForRole,
} from '../lib/firebase';
import { RoleCode } from '../data/seedData';
import { ShieldAlert, Lock, ArrowLeft, LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: RoleCode[];
  requiredModule?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredModule,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAppStore();
  const [authReady, setAuthReady] = useState(false);

  // Listen to Firebase Auth state + Session Timeout (60 minutes)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const timeoutMs = 60 * 60 * 1000; // 60 minutes session timeout
    const timer = setTimeout(async () => {
      try {
        await fbSignOut(auth);
      } catch {
        // ignore
      }
      logout();
      toast.error('Sesi Anda telah berakhir (60 menit). Silakan login kembali.');
      navigate('/login?expired=true', { replace: true });
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [currentUser, logout, navigate]);

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] text-xs text-gray-500">
        Memverifikasi sesi keamanan & otorisasi RBAC...
      </div>
    );
  }

  // 1. Jika belum login -> Redirect ke /login dengan menyimpan URL tujuan
  if (!currentUser) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  // 2. Jika akun dinonaktifkan (isActive = false) -> Tolak akses
  if (!currentUser.active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-6">
        <div className="bg-white border border-red-200 rounded-xl max-w-md w-full p-8 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">Akun Dinonaktifkan (isActive = false)</h1>
          <p className="text-xs text-gray-600 leading-relaxed">
            Maaf, akun <strong>{currentUser.email}</strong> saat ini sedang dinonaktifkan oleh Super Admin Bahagia Group Property.
          </p>
          <button
            type="button"
            onClick={async () => {
              try {
                await fbSignOut(auth);
              } catch {
                // ignore
              }
              logout();
              navigate('/login');
            }}
            className="w-full py-2.5 px-4 bg-gray-900 text-white text-xs font-semibold rounded-lg"
          >
            Kembali ke Halaman Login
          </button>
        </div>
      </div>
    );
  }

  // 3. Cek Role / Permission (RBAC)
  const userPermissions = getPermissionsForRole(currentUser.role);
  const hasRoleAccess =
    !allowedRoles ||
    allowedRoles.includes(currentUser.role) ||
    currentUser.roles?.some((r) => allowedRoles.includes(r)) ||
    currentUser.role === 'ADMIN';

  const hasModulePermission =
    !requiredModule ||
    userPermissions.includes(requiredModule) ||
    currentUser.role === 'ADMIN';

  if (!hasRoleAccess || !hasModulePermission) {
    // Tampilkan 403 Forbidden
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-6">
        <div className="bg-white border border-gray-200 rounded-xl max-w-lg w-full p-8 text-center space-y-5 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold text-amber-700">ERROR 403 — FORBIDDEN ACCESS</div>
            <h1 className="text-xl font-bold text-gray-900">Akses Ditolak (RBAC Permission)</h1>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Akun Anda (<strong>{currentUser.email}</strong>) login dengan role{' '}
            <strong className="text-emerald-700">{currentUser.role}</strong> dan tidak memiliki izin untuk mengakses halaman{' '}
            <code className="px-1.5 py-0.5 bg-gray-100 rounded font-mono text-gray-800">{location.pathname}</code>.
          </p>
          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-lg text-left text-xs space-y-1">
            <div className="font-semibold text-gray-800">Modul yang Diizinkan untuk Role {currentUser.role}:</div>
            <div className="text-gray-600 font-mono">{userPermissions.join(' · ')}</div>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/beranda-role')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ke Beranda Role Saya</span>
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  await fbSignOut(auth);
                } catch {
                  // ignore
                }
                logout();
                navigate('/login');
              }}
              className="px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium rounded-lg flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Ganti Akun / Logout</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
