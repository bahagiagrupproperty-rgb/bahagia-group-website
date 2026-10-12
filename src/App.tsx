/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import {
  PublicHomePage,
  PublicProjectPage,
  PublicCatalogPage,
  PublicUnitDetailPage,
  PublicBookingPage,
  PublicComplaintPage,
  PublicAboutContactPage,
  PublicLoginPage,
} from './pages/PublicWebsitePages';
import {
  PublicArticleListPage,
  PublicArticleDetailPage,
} from './components/PublicNewSections';
import { InternalLayout } from './components/InternalLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SimpleDashboardPage, RoleWorkflowHubPage } from './pages/DashboardAndRolePage';
import {
  PjtVerificationPage,
  SingleApprovalDirectorPage,
  ProjectComprehensivePage,
} from './pages/ProjectAndPjtPages';
import { ProjectSubmissionsHubPage } from './pages/ProjectSubmissionPages';
import {
  MarketingModulePage,
  PurchasingAndLogisticsPage,
  HrmModulePage,
  ComprehensiveReportsPage,
} from './pages/ErpOperationalPages';
import { FinanceModuleComprehensivePage } from './pages/FinanceModulePages';
import { AdminControlCenterPage } from './pages/AdminControlCenterPage';
import { AdminRegisterPage } from './pages/AdminRegisterPage';
import { RoleCode } from './data/seedData';
import { useAppStore } from './store/useAppStore';
import {
  db,
  doc,
  collection,
  query,
  where,
  onSnapshot,
  fetchLatestPublishedState,
  ApprovalNotificationItem,
} from './lib/firebase';
import { toast } from 'sonner';

function LiveSyncInitializer() {
  const applyRemotePublishedState = useAppStore((s) => s.applyRemotePublishedState);
  const setApprovalNotificationsFromFirestore = useAppStore(
    (s) => s.setApprovalNotificationsFromFirestore
  );

  React.useEffect(() => {
    let active = true;
    const seenNotifIds = new Set<string>(
      useAppStore.getState().approvalNotifications.map((n) => n.id)
    );

    const pullLatest = async () => {
      const latest = await fetchLatestPublishedState();
      if (active && latest && latest.state) {
        applyRemotePublishedState(
          latest.state,
          latest.version,
          latest.publishedAt,
          latest.publishedBy
        );
      }
    };

    // 1. Pull immediately on page load
    pullLatest();

    // 2. Poll /api/live-state every 5 seconds so presentation viewers see changes live without even refreshing
    const interval = setInterval(pullLatest, 5000);

    // 3. Also listen to Firestore live_snapshots/master_live_v1 in real-time across all URLs (ais-dev and ais-pre)
    const unsubFirestore = onSnapshot(
      doc(db, 'live_snapshots', 'master_live_v1'),
      (snap) => {
        if (!active || !snap.exists()) return;
        const d = snap.data();
        if (d?.payloadJson && d?.version) {
          try {
            const parsed = JSON.parse(d.payloadJson);
            applyRemotePublishedState(
              parsed,
              Number(d.version) || Date.now(),
              String(d.publishedAt || ''),
              String(d.publishedBy || 'Super Admin')
            );
          } catch {
            // ignore parse error
          }
        }
      },
      () => {
        // ignore listener error
      }
    );

    // 4. Real-time Server-Sent Events (SSE) stream for instant cross-role & cross-device auto-sync
    let es: EventSource | null = null;
    if (typeof EventSource !== 'undefined') {
      try {
        es = new EventSource('/api/live-state/stream');
        es.onmessage = (event) => {
          if (!active) return;
          try {
            const data = JSON.parse(event.data);
            if (data && data.state && data.version > 0) {
              applyRemotePublishedState(
                data.state,
                data.version,
                data.publishedAt,
                data.publishedBy
              );
            }
          } catch {
            // ignore parse error
          }
        };
      } catch {
        // fallback to polling
      }
    }

    // 5. Real-time BroadcastChannel for instant cross-tab sync in the same browser
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('bahagia_erp_realtime_sync');
        bc.onmessage = (ev) => {
          if (!active) return;
          const data = ev.data;
          if (data && data.state && data.version > 0) {
            applyRemotePublishedState(
              data.state,
              data.version,
              data.publishedAt,
              data.publishedBy
            );
          }
        };
      } catch {
        // ignore
      }
    }

    // 6. Real-time Firestore listener on /notifications collection (Query Enforced by targetRole)
    const notifQuery = query(
      collection(db, 'notifications'),
      where('targetRole', 'in', [
        'DIREKTUR',
        'KEUANGAN',
        'PJT',
        'PENGAWAS',
        'MARKETING',
        'LOGISTIK',
        'HRD',
        'ADMIN',
        'ALL',
      ])
    );
    let isFirstNotifSnapshot = true;
    const unsubNotifs = onSnapshot(
      notifQuery,
      (snap) => {
        if (!active || snap.empty) {
          isFirstNotifSnapshot = false;
          return;
        }
        const docs: ApprovalNotificationItem[] = [];
        const currentRole = useAppStore.getState().currentUser?.role;
        snap.forEach((docSnap) => {
          const data = docSnap.data() as ApprovalNotificationItem;
          if (data && data.id) {
            docs.push(data);
            if (!isFirstNotifSnapshot && !seenNotifIds.has(data.id) && !data.isRead) {
              seenNotifIds.add(data.id);
              if (
                currentRole &&
                (currentRole === 'ADMIN' ||
                  currentRole === data.targetRole ||
                  data.targetRole === 'ALL')
              ) {
                toast.info(`🔔 [${data.targetRole}] ${data.title}`, {
                  description: data.message,
                });
              }
            } else {
              seenNotifIds.add(data.id);
            }
          }
        });
        isFirstNotifSnapshot = false;
        if (docs.length > 0) {
          setApprovalNotificationsFromFirestore(docs);
        }
      },
      () => {
        // ignore listener error if unauthenticated or offline
      }
    );

    return () => {
      active = false;
      clearInterval(interval);
      unsubFirestore();
      unsubNotifs();
      if (es) es.close();
      if (bc) bc.close();
    };
  }, [applyRemotePublishedState, setApprovalNotificationsFromFirestore]);

  return null;
}

function ProtectedErpPage({
  children,
  allowedRoles,
  requiredModule,
}: {
  children: React.ReactNode;
  allowedRoles?: RoleCode[];
  requiredModule?: string;
}) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles} requiredModule={requiredModule}>
      <InternalLayout>{children}</InternalLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LiveSyncInitializer />
      <Toaster position="bottom-right" richColors closeButton />
      <Routes>
        {/* HALAMAN WEBSITE PUBLIK + AUTO-SYNC PROYEK + BLOG ARTIKEL */}
        <Route path="/" element={<PublicHomePage />} />
        <Route path="/proyek/bahagia-land" element={<PublicProjectPage companyId="PT_TBL" />} />
        <Route path="/proyek/bahagia-residence" element={<PublicProjectPage companyId="PT_BPP" />} />
        <Route path="/proyek/:slug" element={<PublicProjectPage />} />
        <Route path="/preview/proyek/:slug" element={<PublicProjectPage isPreviewMode />} />
        <Route path="/katalog" element={<PublicCatalogPage />} />
        <Route path="/unit/:id" element={<PublicUnitDetailPage />} />
        <Route path="/booking" element={<PublicBookingPage />} />
        <Route path="/komplain" element={<PublicComplaintPage />} />
        <Route path="/artikel" element={<PublicArticleListPage />} />
        <Route path="/artikel/:slug" element={<PublicArticleDetailPage />} />
        <Route path="/tentang" element={<PublicAboutContactPage />} />
        <Route path="/kontak" element={<PublicAboutContactPage />} />
        <Route path="/login" element={<PublicLoginPage />} />

        {/* HALAMAN REGISTER KHUSUS SUPER ADMIN */}
        <Route
          path="/register"
          element={
            <ProtectedErpPage allowedRoles={['ADMIN']} requiredModule="Sistem Admin">
              <AdminRegisterPage />
            </ProtectedErpPage>
          }
        />

        {/* DASHBOARD SEDERHANA & ALUR KERJA PER ROLE */}
        <Route
          path="/dashboard"
          element={
            <ProtectedErpPage requiredModule="Dashboard">
              <SimpleDashboardPage />
            </ProtectedErpPage>
          }
        />
        <Route
          path="/beranda-role"
          element={
            <ProtectedErpPage requiredModule="Dashboard">
              <RoleWorkflowHubPage />
            </ProtectedErpPage>
          }
        />

        {/* SINGLE APPROVAL DIREKTUR */}
        <Route
          path="/approval"
          element={
            <ProtectedErpPage allowedRoles={['DIREKTUR', 'ADMIN', 'KEUANGAN']} requiredModule="Project & PJT">
              <SingleApprovalDirectorPage />
            </ProtectedErpPage>
          }
        />

        {/* PROJECT, RAB, PENGAJUAN PROYEK PJT, PROGRESS & VERIFIKASI PJT */}
        <Route
          path="/project/pengajuan-proyek/*"
          element={
            <ProtectedErpPage
              allowedRoles={['PJT', 'DIREKTUR', 'ADMIN', 'KEUANGAN', 'PENGAWAS']}
              requiredModule="Project & PJT"
            >
              <ProjectSubmissionsHubPage />
            </ProtectedErpPage>
          }
        />
        <Route
          path="/project/rab-vs-realisasi"
          element={
            <ProtectedErpPage
              allowedRoles={['PJT', 'DIREKTUR', 'ADMIN', 'KEUANGAN', 'PENGAWAS']}
              requiredModule="Project & PJT"
            >
              <ProjectSubmissionsHubPage />
            </ProtectedErpPage>
          }
        />
        <Route
          path="/project/verifikasi"
          element={
            <ProtectedErpPage allowedRoles={['PJT', 'DIREKTUR', 'ADMIN', 'PENGAWAS']} requiredModule="Project & PJT">
              <PjtVerificationPage />
            </ProtectedErpPage>
          }
        />
        <Route
          path="/project/verifikasi-rab"
          element={
            <ProtectedErpPage allowedRoles={['PJT', 'DIREKTUR', 'ADMIN', 'PENGAWAS']} requiredModule="Project & PJT">
              <PjtVerificationPage />
            </ProtectedErpPage>
          }
        />
        <Route
          path="/project/*"
          element={
            <ProtectedErpPage allowedRoles={['PENGAWAS', 'PJT', 'DIREKTUR', 'ADMIN']} requiredModule="Project & PJT">
              <ProjectComprehensivePage />
            </ProtectedErpPage>
          }
        />

        {/* MARKETING & PIPELINE KANBAN */}
        <Route
          path="/marketing/*"
          element={
            <ProtectedErpPage allowedRoles={['MARKETING', 'DIREKTUR', 'ADMIN']} requiredModule="Marketing">
              <MarketingModulePage />
            </ProtectedErpPage>
          }
        />

        {/* PURCHASING (DIAKSES PENGAWAS) & GUDANG LOGISTIK */}
        <Route
          path="/purchasing/*"
          element={
            <ProtectedErpPage
              allowedRoles={['PENGAWAS', 'LOGISTIK', 'KEUANGAN', 'DIREKTUR', 'ADMIN']}
              requiredModule="Purchasing"
            >
              <PurchasingAndLogisticsPage />
            </ProtectedErpPage>
          }
        />
        <Route
          path="/gudang/*"
          element={
            <ProtectedErpPage
              allowedRoles={['LOGISTIK', 'PENGAWAS', 'DIREKTUR', 'ADMIN']}
              requiredModule="Gudang Logistik"
            >
              <PurchasingAndLogisticsPage />
            </ProtectedErpPage>
          }
        />

        {/* KEUANGAN, KAS MASUK, KAS KELUAR, BUKU KAS, AUTO-JURNAL & COA CRUD */}
        <Route
          path="/keuangan/*"
          element={
            <ProtectedErpPage allowedRoles={['KEUANGAN', 'DIREKTUR', 'ADMIN']} requiredModule="Keuangan & COA">
              <FinanceModuleComprehensivePage />
            </ProtectedErpPage>
          }
        />

        {/* HRM, ABSENSI SELFIE+GPS & PAYROLL */}
        <Route
          path="/hrm/*"
          element={
            <ProtectedErpPage allowedRoles={['HRD', 'DIREKTUR', 'ADMIN']} requiredModule="HRM">
              <HrmModulePage />
            </ProtectedErpPage>
          }
        />

        {/* LAPORAN LENGKAP PER ROLE (~65) */}
        <Route
          path="/laporan"
          element={
            <ProtectedErpPage requiredModule="Laporan">
              <ComprehensiveReportsPage />
            </ProtectedErpPage>
          }
        />

        {/* ADMIN CONTROL CENTER (16 FITUR + 24 SUB-MENU) */}
        <Route
          path="/sistem/:section"
          element={
            <ProtectedErpPage allowedRoles={['ADMIN', 'DIREKTUR']} requiredModule="Sistem Admin">
              <AdminControlCenterPage />
            </ProtectedErpPage>
          }
        />
        <Route path="/sistem" element={<Navigate to="/sistem/dashboard" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
