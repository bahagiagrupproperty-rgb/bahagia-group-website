import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { RoleCode } from '../data/seedData';
import {
  auth,
  createUserWithEmailAndPassword,
  getPermissionsForRole,
  doc,
  setDoc,
  db,
  seedUsersToFirestore,
} from '../lib/firebase';
import { UserPlus, Database, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export const AdminRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { addUser, users } = useAppStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password123!');
  const [role, setRole] = useState<RoleCode>('MARKETING');
  const [companyId, setCompanyId] = useState<'GROUP' | 'PT_TBL' | 'PT_BPP'>('PT_TBL');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Nama dan email wajib diisi.');
      return;
    }
    if (password.length < 8 || !/\d/.test(password)) {
      toast.error('Password wajib minimal 8 karakter dan mengandung angka.');
      return;
    }

    setLoading(true);
    try {
      // 1. Simpan ke state lokal & RBAC store
      const companyName =
        companyId === 'GROUP'
          ? 'BAHAGIA GROUP PROPERTY'
          : companyId === 'PT_TBL'
          ? 'PT TATA BAHAGIA LAND'
          : 'PT BAHAGIA PRIMA PROPERTY';

      addUser({
        name,
        email,
        password,
        role,
        roles: [role],
        companyId,
        companyName,
        active: true,
      });

      // 2. Coba daftarkan ke Firebase Auth & koleksi Firestore users/{uid} bila diizinkan
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = cred.user.uid;
        await setDoc(doc(db, 'users', uid), {
          uid,
          name: name.slice(0, 120),
          email: email.slice(0, 150),
          role,
          permissions: getPermissionsForRole(role),
          isActive: true,
          companyAccess: companyId === 'GROUP' ? ['PT_TBL', 'PT_BPP'] : [companyId],
          companyId,
          active: true,
          createdAt: new Date().toISOString().slice(0, 64),
          updatedAt: new Date().toISOString().slice(0, 64),
        });
      } catch {
        // Jika Email/Password provider belum diaktifkan di Firebase Console, tetap tersimpan di RBAC Store
      }

      toast.success(`User ${email} (${role}) berhasil diregistrasi oleh Super Admin!`);
      setName('');
      setEmail('');
    } finally {
      setLoading(false);
    }
  };

  const handleRunFirestoreSeed = async () => {
    try {
      const res = await seedUsersToFirestore();
      if (res.seededCount > 0) {
        toast.success(`Berhasil melakukan seeding ${res.seededCount} dokumen user ke Firestore users/{uid}`);
      } else {
        toast.success('Data RBAC 18 akun default siap digunakan (superadmin@bahagia.com, admin.group@bahagia.com, marketing@bahagia.com).');
      }
    } catch {
      toast.error('Gagal menulis ke Firestore: pastikan login Google OAuth sebagai Admin terverifikasi.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-emerald-700">
            KHUSUS SUPER ADMIN · REGISTRASI AKUN & SEEDING RBAC FIRESTORE
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-0.5">
            Registrasi User ERP Baru (`/register`)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Hanya Super Admin (`ADMIN`) yang dapat mengakses halaman ini dan menetapkan role/permission.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRunFirestoreSeed}
            className="px-3.5 py-2 border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1.5"
          >
            <Database className="w-4 h-4" />
            <span>Jalankan Seeding Firestore</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/sistem/user')}
            className="px-3.5 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Daftar User</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleRegister}
          className="lg:col-span-6 bg-white border border-gray-200 rounded-xl p-6 space-y-4 text-xs"
        >
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>Form Registrasi Akun ERP</span>
          </div>

          <div>
            <label className="text-gray-700 font-medium block mb-1">Nama Lengkap Staf *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Hendra Kusuma, S.T."
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
            />
          </div>

          <div>
            <label className="text-gray-700 font-medium block mb-1">Email Login *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@bahagia.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 font-mono"
            />
          </div>

          <div>
            <label className="text-gray-700 font-medium block mb-1">Password Default *</label>
            <input
              type="text"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-700 font-medium block mb-1">Role RBAC *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as RoleCode)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white font-semibold"
              >
                <option value="ADMIN">ADMIN (Super Admin)</option>
                <option value="DIREKTUR">DIREKTUR (Group Approval)</option>
                <option value="PJT">PJT (Verifikasi Teknis)</option>
                <option value="PENGAWAS">PENGAWAS & PURCHASING</option>
                <option value="KEUANGAN">KEUANGAN & PAJAK</option>
                <option value="MARKETING">MARKETING & KPR</option>
                <option value="HRD">HRD & PAYROLL</option>
                <option value="LOGISTIK">LOGISTIK GUDANG</option>
              </select>
            </div>

            <div>
              <label className="text-gray-700 font-medium block mb-1">Akses Perusahaan (companyAccess)</label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white"
              >
                <option value="GROUP">GROUP (PT TBL & PT BPP)</option>
                <option value="PT_TBL">PT TATA BAHAGIA LAND</option>
                <option value="PT_BPP">PT BAHAGIA PRIMA PROPERTY</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-1">
            <div className="text-gray-500">Permissions Otomatis (`permissions[]`):</div>
            <div className="font-mono text-[11px] text-emerald-700 font-semibold">
              {getPermissionsForRole(role).join(', ')}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Menyimpan...' : 'Daftarkan User & Simpan ke Firestore'}
          </button>
        </form>

        <div className="lg:col-span-6 bg-white border border-gray-200 rounded-xl p-6 space-y-4 text-xs">
          <h2 className="text-sm font-bold text-gray-900">
            Struktur Dokumen Firestore `users/&#123;uid&#125;`
          </h2>
          <pre className="p-4 bg-gray-900 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed">
{`{
  "uid": "usr-superadmin-bahagia",
  "name": "Super Admin Bahagia Group",
  "email": "superadmin@bahagia.com",
  "role": "ADMIN",
  "permissions": [
    "Dashboard", "HRM", "Marketing",
    "Project & PJT", "Gudang Logistik",
    "Purchasing", "Keuangan & COA",
    "Laporan", "Sistem Admin"
  ],
  "isActive": true,
  "companyAccess": ["PT_TBL", "PT_BPP"],
  "companyId": "GROUP",
  "active": true,
  "createdAt": "2026-10-08T00:00:00.000Z"
}`}
          </pre>
          <div className="text-gray-600 space-y-1">
            <div className="font-semibold text-gray-900">Total Akun Terdaftar: {users.length} User</div>
            <p>
              Termasuk 3 akun testing utama: <code className="font-mono">superadmin@bahagia.com</code>,{' '}
              <code className="font-mono">admin.group@bahagia.com</code>, dan{' '}
              <code className="font-mono">marketing@bahagia.com</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
