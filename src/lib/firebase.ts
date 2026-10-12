import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut as fbSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  initializeFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  getDocs,
  collection,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  setLogLevel,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { SEED_USERS, RoleCode } from '../data/seedData';

setLogLevel('silent');

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(
  app,
  {
    experimentalAutoDetectLongPolling: true,
  },
  firebaseConfig.firestoreDatabaseId
);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: boolean | string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'live_snapshots', 'master_live_v1'));
  } catch {
    // Operate seamlessly with local/server snapshot cache when offline or behind proxy
  }
}

export function getPermissionsForRole(role: RoleCode): string[] {
  switch (role) {
    case 'ADMIN':
      return ['Dashboard', 'HRM', 'Marketing', 'Project & PJT', 'Gudang Logistik', 'Purchasing', 'Keuangan & COA', 'Laporan', 'Sistem Admin'];
    case 'DIREKTUR':
      return ['Dashboard', 'Marketing', 'Project & PJT', 'Purchasing', 'Keuangan & COA', 'Laporan'];
    case 'PJT':
      return ['Dashboard', 'Project & PJT', 'Laporan'];
    case 'PENGAWAS':
      return ['Dashboard', 'Project & PJT', 'Purchasing', 'Gudang Logistik', 'Laporan'];
    case 'KEUANGAN':
      return ['Dashboard', 'Keuangan & COA', 'Purchasing', 'Laporan'];
    case 'MARKETING':
      return ['Dashboard', 'Marketing', 'Laporan'];
    case 'HRD':
      return ['Dashboard', 'HRM', 'Laporan'];
    case 'LOGISTIK':
      return ['Dashboard', 'Gudang Logistik', 'Purchasing', 'Laporan'];
    default:
      return ['Dashboard'];
  }
}

export async function seedUsersToFirestore(): Promise<{ seededCount: number }> {
  if (!auth.currentUser || !auth.currentUser.emailVerified) {
    return { seededCount: 0 };
  }
  let count = 0;
  for (const u of SEED_USERS) {
    const safeUid = u.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
    const path = `users/${safeUid}`;
    try {
      await setDoc(doc(db, 'users', safeUid), {
        uid: safeUid,
        name: u.name.slice(0, 120),
        email: u.email.slice(0, 150),
        role: u.role.slice(0, 40),
        permissions: getPermissionsForRole(u.role).slice(0, 15),
        isActive: u.active,
        companyAccess: u.companyId === 'GROUP' ? ['PT_TBL', 'PT_BPP'] : [u.companyId],
        companyId: u.companyId.slice(0, 64),
        active: u.active,
        createdAt: new Date().toISOString().slice(0, 64),
        updatedAt: new Date().toISOString().slice(0, 64),
      });
      count++;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
  return { seededCount: count };
}

export async function syncErpRecordToFirestore(record: {
  id: string;
  collectionName: string;
  companyId: string;
  title: string;
  status: string;
  amount?: number;
}) {
  if (!auth.currentUser || !auth.currentUser.emailVerified) return;
  const safeId = record.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  const path = `erp_records/${safeId}`;
  try {
    await setDoc(doc(db, 'erp_records', safeId), {
      id: safeId,
      collectionName: record.collectionName.slice(0, 64),
      companyId: record.companyId.slice(0, 64),
      title: record.title.slice(0, 250),
      status: record.status.slice(0, 64),
      amount: typeof record.amount === 'number' ? record.amount : 0,
      createdBy: auth.currentUser.uid,
      createdAt: new Date().toISOString().slice(0, 64),
      updatedAt: new Date().toISOString().slice(0, 64),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function clearFirestoreCollectionsOnReset() {
  if (!auth.currentUser) return;
  try {
    const snap = await getDocs(collection(db, 'erp_records'));
    for (const d of snap.docs) {
      try {
        await deleteDoc(doc(db, 'erp_records', d.id));
      } catch {
        // ignore individual delete permission errors
      }
    }
  } catch {
    // ignore
  }
}

export async function syncProjectSubmissionToFirestore(
  submission: {
    id: string;
    submissionNumber: string;
    type: string;
    projectName: string;
    companyId: string;
    rabAmount: number;
    status: string;
    requester: string;
    createdAt: string;
  },
  items: {
    id: string;
    category: string;
    description: string;
    volume: number;
    unit: string;
    unitPrice: number;
    subtotal: number;
  }[] = []
) {
  if (!auth.currentUser || !auth.currentUser.emailVerified) return;
  const safeId = submission.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  const path = `project_submissions/${safeId}`;
  const nowIso = new Date().toISOString().slice(0, 64);

  try {
    await setDoc(doc(db, 'project_submissions', safeId), {
      id: safeId,
      submissionNumber: submission.submissionNumber.slice(0, 64),
      type: submission.type.slice(0, 32),
      projectName: submission.projectName.slice(0, 250),
      companyId: submission.companyId.slice(0, 64),
      rabAmount: Number(submission.rabAmount) || 0,
      status: submission.status.slice(0, 64),
      requester: submission.requester.slice(0, 120),
      createdBy: auth.currentUser.uid,
      createdAt: (submission.createdAt || nowIso).slice(0, 64),
      updatedAt: nowIso,
    });

    for (let i = 0; i < Math.min(items.length, 50); i++) {
      const it = items[i];
      const safeItemId = (it.id || `item_${i + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
      const itemPath = `project_submissions/${safeId}/submission_items/${safeItemId}`;
      try {
        await setDoc(doc(db, 'project_submissions', safeId, 'submission_items', safeItemId), {
          id: safeItemId,
          submissionId: safeId,
          category: (it.category || 'RAB').slice(0, 64),
          description: (it.description || 'Item Pekerjaan').slice(0, 250),
          volume: Number(it.volume) || 0,
          unit: (it.unit || 'ls').slice(0, 32),
          unitPrice: Number(it.unitPrice) || 0,
          subtotal: Number(it.subtotal) || 0,
          createdBy: auth.currentUser.uid,
          createdAt: nowIso,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, itemPath);
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export interface ApprovalNotificationItem {
  id: string;
  targetRole:
    | 'DIREKTUR'
    | 'KEUANGAN'
    | 'PJT'
    | 'ADMIN'
    | 'MARKETING'
    | 'PENGAWAS'
    | 'LOGISTIK'
    | 'HRD'
    | 'ALL';
  title: string;
  message: string;
  category:
    | 'PENGAJUAN_PROYEK'
    | 'VERIFIKASI_PJT'
    | 'PURCHASE_ORDER'
    | 'PENGAJUAN_DANA'
    | 'APPROVAL'
    | 'MARKETING_AKAD'
    | 'LOGISTIK_GUDANG'
    | 'HRD_PAYROLL';
  referenceId: string;
  companyId: 'PT_TBL' | 'PT_BPP' | 'GROUP';
  amount: number;
  status: string;
  actionPath: string;
  requester: string;
  isRead: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export async function syncApprovalNotificationToFirestore(notif: ApprovalNotificationItem) {
  if (!auth.currentUser || !auth.currentUser.emailVerified) return;
  const safeId = notif.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  const path = `notifications/${safeId}`;
  const nowIso = new Date().toISOString().slice(0, 64);
  try {
    await setDoc(doc(db, 'notifications', safeId), {
      id: safeId,
      targetRole: (notif.targetRole || 'DIREKTUR').slice(0, 40),
      title: (notif.title || 'Pengajuan Baru Membutuhkan Approval').slice(0, 200),
      message: (notif.message || 'Terdapat pengajuan baru yang menunggu verifikasi/persetujuan.').slice(0, 400),
      category: (notif.category || 'APPROVAL').slice(0, 64),
      referenceId: (notif.referenceId || safeId).slice(0, 128),
      companyId: (notif.companyId || 'PT_TBL').slice(0, 64),
      amount: Number(notif.amount) || 0,
      status: (notif.status || 'Menunggu Approval').slice(0, 64),
      actionPath: (notif.actionPath || '/approval').slice(0, 150),
      requester: (notif.requester || 'Internal ERP').slice(0, 120),
      isRead: Boolean(notif.isRead),
      createdBy: auth.currentUser.uid,
      createdAt: (notif.createdAt || nowIso).slice(0, 64),
      updatedAt: nowIso,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function markFirestoreNotificationRead(notif: ApprovalNotificationItem) {
  if (!auth.currentUser || !auth.currentUser.emailVerified) return;
  const safeId = notif.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  const path = `notifications/${safeId}`;
  const nowIso = new Date().toISOString().slice(0, 64);
  try {
    await setDoc(doc(db, 'notifications', safeId), {
      id: safeId,
      targetRole: (notif.targetRole || 'DIREKTUR').slice(0, 40),
      title: (notif.title || 'Pengajuan Baru Membutuhkan Approval').slice(0, 200),
      message: (notif.message || 'Terdapat pengajuan baru yang menunggu verifikasi/persetujuan.').slice(0, 400),
      category: (notif.category || 'APPROVAL').slice(0, 64),
      referenceId: (notif.referenceId || safeId).slice(0, 128),
      companyId: (notif.companyId || 'PT_TBL').slice(0, 64),
      amount: Number(notif.amount) || 0,
      status: (notif.status || 'Sudah Dibaca').slice(0, 64),
      actionPath: (notif.actionPath || '/approval').slice(0, 150),
      requester: (notif.requester || 'Internal ERP').slice(0, 120),
      isRead: true,
      createdBy: auth.currentUser.uid,
      createdAt: (notif.createdAt || nowIso).slice(0, 64),
      updatedAt: nowIso,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export interface SiteplanPolygonItem {
  id: string;
  nomor: string;
  blok: string;
  points: { x: number; y: number; xPct?: number; yPct?: number }[];
  tipe: string;
  luasTanah: number;
  luasBangunan: number;
  harga: number;
  status: 'tersedia' | 'booking' | 'proses_kpr' | 'akad' | 'terjual' | 'serah_terima';
  konsumen: string;
  progress: number;
  catatan: string;
  color: string;
}

// IndexedDB helper for storing high-res original PNG site plan images without hitting localStorage 5MB quota
const IDB_NAME = 'bahagia_siteplan_assets_db';
const IDB_STORE = 'siteplan_images';

function openSiteplanIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not available'));
      return;
    }
    const req = window.indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const database = req.result;
      if (!database.objectStoreNames.contains(IDB_STORE)) {
        database.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveHighResImageToIdb(key: string, dataUrl: string): Promise<void> {
  try {
    const database = await openSiteplanIdb();
    await new Promise<void>((resolve, reject) => {
      const tx = database.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(dataUrl, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // fallback ignored if private browsing blocks IDB
  }
}

export async function loadHighResImageFromIdb(key: string): Promise<string | null> {
  try {
    const database = await openSiteplanIdb();
    return await new Promise<string | null>((resolve, reject) => {
      const tx = database.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(key);
      req.onsuccess = () => resolve((req.result as string) || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function syncSiteplanMasterToFirestore(payload: {
  projectId: string;
  nama: string;
  backgroundImage: string;
  imageWidth: number;
  imageHeight: number;
  polygons: SiteplanPolygonItem[];
  updatedBy?: string;
}) {
  const safeDocId = payload.projectId
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .slice(0, 128);

  // Always save full high-res image in IndexedDB so local browser never loses quality or hits 5MB localStorage limit
  if (payload.backgroundImage && payload.backgroundImage.startsWith('data:')) {
    await saveHighResImageToIdb(`siteplan_bg_${safeDocId}`, payload.backgroundImage);
  }

  if (!auth.currentUser || !auth.currentUser.emailVerified) return;

  const path = `siteplans/${safeDocId}`;
  const nowIso = new Date().toISOString().slice(0, 64);
  const polygonsJson = JSON.stringify(payload.polygons || []).slice(0, 340000);
  // Ensure backgroundImage string stays within Firestore 350,000 char rule limit
  const safeBgRef =
    payload.backgroundImage.length <= 340000
      ? payload.backgroundImage
      : `/siteplan/${safeDocId === 'bahagia-residence' || safeDocId.includes('bpp') ? 'bahagia residence.png' : 'bahagia land.png'}`;

  try {
    await setDoc(doc(db, 'siteplans', safeDocId), {
      projectId: safeDocId,
      nama: (payload.nama || 'Bahagia Land').slice(0, 200),
      backgroundImage: safeBgRef,
      imageWidth: Math.min(10000, Math.max(100, Math.round(payload.imageWidth || 1920))),
      imageHeight: Math.min(10000, Math.max(100, Math.round(payload.imageHeight || 1080))),
      polygonsJson,
      updatedAt: nowIso,
      updatedBy: (payload.updatedBy || auth.currentUser.email || 'Super Admin').slice(0, 150),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export interface LiveDeployResult {
  ok: boolean;
  version: number;
  publishedAt: string;
  publishedBy: string;
  syncedToServer: boolean;
  syncedToFirestore: boolean;
}

const SNAPSHOT_DOC_ID = 'master_live_v1';

// Helper to compress large base64 data URLs before sending to Firestore (which has 750KB string limit)
function compactStateForFirestore(stateObj: Record<string, any>): string {
  const raw = JSON.stringify(stateObj);
  if (raw.length <= 720000) {
    return raw;
  }
  // If large base64 images exceed Firestore document limits, strip only huge base64 strings > 60KB for Firestore
  return raw.replace(/"data:image\/[^"]{60000,}"/g, '""');
}

export async function publishFullStateToCloudAndServer(
  stateData: Record<string, any>,
  publishedBy = 'Super Admin',
  explicitVersion?: number
): Promise<LiveDeployResult> {
  const nowIso = new Date().toISOString().slice(0, 64);
  const nextVersion = explicitVersion || Date.now();
  let syncedToServer = false;
  let syncedToFirestore = false;

  // 1. Push full state (including high-res base64 images up to 50MB) to Express Backend /api/live-state
  try {
    const resp = await fetch('/api/live-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        version: nextVersion,
        publishedBy,
        state: stateData,
      }),
    });
    if (resp.ok) {
      syncedToServer = true;
    }
  } catch {
    // ignore network error if offline
  }

  // 2. Push to Firestore live_snapshots/master_live_v1 if Firebase user is signed in & verified
  if (auth.currentUser && auth.currentUser.emailVerified) {
    const path = `live_snapshots/${SNAPSHOT_DOC_ID}`;
    try {
      const payloadJson = compactStateForFirestore(stateData).slice(0, 740000);
      await setDoc(doc(db, 'live_snapshots', SNAPSHOT_DOC_ID), {
        id: SNAPSHOT_DOC_ID,
        version: nextVersion,
        publishedAt: nowIso,
        publishedBy: (publishedBy || auth.currentUser.email || 'Super Admin').slice(0, 150),
        payloadJson,
      });
      syncedToFirestore = true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  return {
    ok: syncedToServer || syncedToFirestore,
    version: nextVersion,
    publishedAt: nowIso,
    publishedBy,
    syncedToServer,
    syncedToFirestore,
  };
}

export async function fetchLatestPublishedState(): Promise<{
  version: number;
  publishedAt: string;
  publishedBy: string;
  state: Record<string, any>;
} | null> {
  let bestCandidate: {
    version: number;
    publishedAt: string;
    publishedBy: string;
    state: Record<string, any>;
  } | null = null;

  // 1. Check Server API (/api/live-state)
  try {
    const resp = await fetch('/api/live-state', { cache: 'no-store' });
    if (resp.ok) {
      const data = await resp.json();
      if (data?.ok && data?.hasData && data?.snapshot?.state) {
        bestCandidate = {
          version: Number(data.snapshot.version) || 1,
          publishedAt: String(data.snapshot.publishedAt || ''),
          publishedBy: String(data.snapshot.publishedBy || 'Super Admin'),
          state: data.snapshot.state,
        };
      }
    }
  } catch {
    // ignore fetch error
  }

  // 2. Check Firestore (live_snapshots/master_live_v1) — works across Dev URL & Shared Presentation URL!
  try {
    const snap = await getDoc(doc(db, 'live_snapshots', SNAPSHOT_DOC_ID));
    if (snap.exists()) {
      const d = snap.data();
      const ver = Number(d.version) || 1;
      if (!bestCandidate || ver > bestCandidate.version) {
        try {
          const parsedState = JSON.parse(d.payloadJson);
          bestCandidate = {
            version: ver,
            publishedAt: String(d.publishedAt || ''),
            publishedBy: String(d.publishedBy || 'Super Admin'),
            state: parsedState,
          };
        } catch {
          // ignore JSON parse error
        }
      }
    }
  } catch {
    // ignore Firestore read error
  }

  return bestCandidate;
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  fbSignOut,
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
};
export type { FirebaseUser };



