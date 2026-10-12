import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  ASSETS,
  KavlingLot,
  formatRupiah,
  DEFAULT_SITE_PLAN_STATUS_COLORS,
} from '../data/seedData';
import { UploadFoto } from './UploadFoto';
import { EditableText } from './SuperAdminInlineEditor';
import {
  loadHighResImageFromIdb,
  saveHighResImageToIdb,
  syncSiteplanMasterToFirestore,
} from '../lib/firebase';
import {
  CheckCircle2,
  X,
  ArrowRight,
  Image as ImageIcon,
  LayoutGrid,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Plus,
  Edit3,
  Trash2,
  Upload,
  Eye,
  Move,
  Download,
  FileSpreadsheet,
  Search,
  History,
  AlertTriangle,
  Copy,
  Layers,
  MousePointer,
  PenTool,
  Hand,
  Save,
  Square,
  RotateCw,
  Home,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface SitePlanInteractiveProps {
  companyId?: 'PT_TBL' | 'PT_BPP';
  projectName?: string;
  sitePlanImage?: string;
  editable?: boolean;
}

export const SitePlanInteractive: React.FC<SitePlanInteractiveProps> = ({
  companyId = 'PT_TBL',
  projectName,
  sitePlanImage,
  editable = false,
}) => {
  const {
    currentUser,
    kavling,
    syncedProjects,
    sitePlanConfigs,
    updateKavlingStatusAndProgress,
    updateSitePlanImageConfig,
    resetSitePlanImageToDefault,
    updateSitePlanStatusColors,
    toggleSitePlanGridOnPublic,
    saveKavlingLotFull,
    updateKavlingOverlayCoords,
    bulkUpdateKavlingLots,
    bulkAddKavlingRange,
    resetProjectKavlingData,
    deleteRecordsFromCollection,
  } = useAppStore();

  const navigate = useNavigate();

  const isSuperAdmin = Boolean(
    editable || (currentUser && currentUser.active && currentUser.role === 'ADMIN')
  );

  const defaultProjectName =
    projectName ||
    (companyId === 'PT_BPP' ? 'Perumahan Bahagia Residence' : 'Perumahan Bahagia Land');

  const [activeProjectName, setActiveProjectName] = useState<string>(defaultProjectName);
  const [selectedBlock, setSelectedBlock] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Default to OVERLAY_EDITOR when opened inside /sistem/kavling (editable=true)
  const [adminSubTab, setAdminSubTab] = useState<
    'VIEW_INTERACTIVE' | 'SITE_PLAN_UPLOAD' | 'OVERLAY_EDITOR' | 'KAVLING_TABLE'
  >(editable ? 'OVERLAY_EDITOR' : 'VIEW_INTERACTIVE');

  // Public/Map View Modes: ORIGINAL_OVERLAY (Default!) vs GRID_MATRIX
  const [publicViewMode, setPublicViewMode] = useState<'ORIGINAL_OVERLAY' | 'GRID_MATRIX'>(
    'ORIGINAL_OVERLAY'
  );

  // Zoom, Pan & Fullscreen states
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const overlayBoardRef = useRef<HTMLDivElement | null>(null);

  // Interactive Lot Hover & Detail Modal
  const [hoveredLot, setHoveredLot] = useState<KavlingLot | null>(null);
  const [selectedLot, setSelectedLot] = useState<KavlingLot | null>(null);

  // Manual Canvas Editor Tools: PLACE_HOUSE_ICON (Default!) | SELECT_MOVE | DELETE_TOOL | PAN_TOOL
  const [editorTool, setEditorTool] = useState<
    'SELECT_MOVE' | 'PLACE_HOUSE_ICON' | 'DRAW_RECT' | 'DRAW_POLYGON' | 'DELETE_TOOL' | 'PAN_TOOL'
  >('PLACE_HOUSE_ICON');

  // Polygon drawing draft vertices + live cursor + Shift straight-line lock
  const [polygonDraftPoints, setPolygonDraftPoints] = useState<{ xPct: number; yPct: number }[]>(
    []
  );
  const [cursorBoardPct, setCursorBoardPct] = useState<{ xPct: number; yPct: number } | null>(
    null
  );
  const [shiftStraightMode, setShiftStraightMode] = useState<boolean>(false);
  const [isShiftKeyPressed, setIsShiftKeyPressed] = useState<boolean>(false);

  // Default rotation angle & house icon size when placing a new house icon (auto-inherits from last adjusted icon!)
  const [defaultDrawRotationDeg, setDefaultDrawRotationDeg] = useState<number>(0);
  const [defaultHouseSizePct, setDefaultHouseSizePct] = useState<number>(3.2);

  // Rectangle / Vertex / Whole-Shape Dragging & Rotating State
  const [draggingPolygonState, setDraggingPolygonState] = useState<{
    lotId: string;
    mode: 'MOVE_POLYGON' | 'MOVE_VERTEX' | 'ROTATE_RECT';
    vertexIndex?: number;
    startMouseX: number;
    startMouseY: number;
    initialPoints: { xPct: number; yPct: number }[];
    initialRotationDeg?: number;
    centerXPct?: number;
    centerYPct?: number;
  } | null>(null);

  // Clipboard for Copy (Ctrl+C) & Paste/Duplicate (Ctrl+V) Rectangle
  const [copiedPolygonPoints, setCopiedPolygonPoints] = useState<
    { xPct: number; yPct: number }[] | null
  >(null);
  const [copiedRotationDeg, setCopiedRotationDeg] = useState<number>(0);

  const [snapToGrid, setSnapToGrid] = useState<boolean>(false);
  const [snapToBlocks, setSnapToBlocks] = useState<boolean>(true);
  const [activeSnapGuides, setActiveSnapGuides] = useState<
    {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      label?: string;
      snapPoint?: { xPct: number; yPct: number };
    }[]
  >([]);
  const [showEditorGrid, setShowEditorGrid] = useState<boolean>(false);
  const [selectedEditorLotId, setSelectedEditorLotId] = useState<string | null>(null);

  // Draw new rectangle on canvas
  const [drawingRect, setDrawingRect] = useState<{
    startXPct: number;
    startYPct: number;
    currentXPct: number;
    currentYPct: number;
    snappedPoints?: { xPct: number; yPct: number }[];
  } | null>(null);

  // High-res image override loaded from IndexedDB if Admin uploaded a large PNG
  const [idbHighResBg, setIdbHighResBg] = useState<string | null>(null);

  // Full CRUD Modal for Kavling (Add / Edit Single Lot or Row of Lots)
  const [showLotFormModal, setShowLotFormModal] = useState<boolean>(false);
  const [editingLotForm, setEditingLotForm] = useState<{
    id?: string;
    companyId: 'PT_TBL' | 'PT_BPP';
    projectName: string;
    block: string;
    number: number;
    code: string;
    type: string;
    landSize: string;
    buildingSize: number;
    extraLand: string;
    price: number;
    hpp: number;
    status: KavlingLot['status'];
    progress: number;
    buyerName: string;
    buyerPhone: string;
    paymentMethod: 'Cash' | 'KPR' | 'Tempo';
    bank: string;
    pengawasNotes: string;
    pjtNotes: string;
    photos: string[];
    customFillColor: string;
    xPct: number;
    yPct: number;
    widthPct: number;
    heightPct: number;
    rotationDeg: number;
    repeatCount: number;
    points?: { xPct: number; yPct: number }[];
    orientation: 'Utara' | 'Selatan' | 'Timur' | 'Barat';
  } | null>(null);

  // Bulk Generate Modal (Tambah Banyak Sekaligus)
  const [showBulkGenerateModal, setShowBulkGenerateModal] = useState<boolean>(false);
  const [bulkGenBlock, setBulkGenBlock] = useState<string>('A');
  const [bulkGenStart, setBulkGenStart] = useState<number>(1);
  const [bulkGenEnd, setBulkGenEnd] = useState<number>(27);
  const [bulkGenType, setBulkGenType] = useState<string>('Tipe 36/91 Subsidi');
  const [bulkGenLandSize, setBulkGenLandSize] = useState<string>('7×13 m (91 m²)');
  const [bulkGenBuildingSize, setBulkGenBuildingSize] = useState<number>(36);
  const [bulkGenPrice, setBulkGenPrice] = useState<number>(169000000);
  const [bulkGenHpp, setBulkGenHpp] = useState<number>(67651710);
  const [bulkGenStatus, setBulkGenStatus] = useState<KavlingLot['status']>('Tersedia');

  // Table Search, Selection & Bulk Edit States
  const [tableSearch, setTableSearch] = useState<string>('');
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);
  const [bulkActionStatus, setBulkActionStatus] = useState<KavlingLot['status']>('Tersedia');
  const [bulkActionPrice, setBulkActionPrice] = useState<string>('');
  const [resetConfirmInput, setResetConfirmInput] = useState<string>('');
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  // Preview Lightbox for Site Plan Card
  const [previewSitePlanUrl, setPreviewSitePlanUrl] = useState<string | null>(null);

  useEffect(() => {
    if (projectName) {
      setActiveProjectName(projectName);
      setSelectedBlock('ALL');
    }
  }, [projectName]);

  const isBahagiaLand =
    activeProjectName.toLowerCase().includes('bahagia land') ||
    (!activeProjectName.toLowerCase().includes('residence') && companyId === 'PT_TBL');

  const projSlug = isBahagiaLand ? 'bahagia-land' : 'bahagia-residence';

  // Load high-res PNG from IndexedDB if Admin uploaded a custom PNG
  useEffect(() => {
    let cancelled = false;
    loadHighResImageFromIdb(`siteplan_bg_${projSlug}`).then((dataUrl) => {
      if (!cancelled) {
        setIdbHighResBg(dataUrl || null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [projSlug]);

  const activeSyncedProj = syncedProjects.find(
    (p) => p.projectName.toLowerCase() === activeProjectName.toLowerCase()
  );

  const activeSitePlanConfig = useMemo(() => {
    const found = sitePlanConfigs.find(
      (c) =>
        c.projectName.toLowerCase() === activeProjectName.toLowerCase() ||
        (activeSyncedProj && c.projectId === activeSyncedProj.id)
    );
    const defaultImg = isBahagiaLand
      ? ASSETS.sitePlanBahagiaLand
      : ASSETS.sitePlanBahagiaResidence;
    if (found) {
      return {
        ...found,
        imageUrl:
          found.imageUrl ||
          sitePlanImage ||
          activeSyncedProj?.sitePlanImage ||
          found.defaultImageUrl ||
          defaultImg,
        defaultImageUrl: found.defaultImageUrl || defaultImg,
      };
    }
    return {
      projectId: activeSyncedProj?.id || (isBahagiaLand ? 'PROJ-SYNC-TBL' : 'PROJ-SYNC-BPP'),
      projectName: activeProjectName,
      companyId: isBahagiaLand ? 'PT_TBL' : 'PT_BPP',
      sourceFileName: isBahagiaLand ? 'bahagia land.png' : 'bahagia residence.png',
      imageUrl:
        sitePlanImage ||
        activeSyncedProj?.sitePlanImage ||
        defaultImg,
      defaultImageUrl: defaultImg,
      resolution: '1920 × 1080 px (Original PNG)',
      fileSizeText: isBahagiaLand ? '2.45 MB' : '1.92 MB',
      uploadedAt: '2026-10-10 08:30',
      showGridOnPublic: false,
      statusColors: { ...DEFAULT_SITE_PLAN_STATUS_COLORS },
      history: [],
    };
  }, [sitePlanConfigs, activeProjectName, activeSyncedProj, isBahagiaLand, sitePlanImage]);

  const originalSitePlanImg =
    idbHighResBg ||
    activeSitePlanConfig.imageUrl ||
    activeSitePlanConfig.defaultImageUrl ||
    (isBahagiaLand ? ASSETS.sitePlanBahagiaLand : ASSETS.sitePlanBahagiaResidence);

  const projectLots = useMemo(
    () =>
      kavling.filter(
        (lot) => lot.projectName.toLowerCase() === activeProjectName.toLowerCase()
      ),
    [kavling, activeProjectName]
  );

  // Lots that actually have manually drawn polygons (3+ vertices)
  const drawnPolygonLots = useMemo(
    () =>
      projectLots.filter(
        (lot) => lot.mapCoords?.points && lot.mapCoords.points.length >= 3
      ),
    [projectLots]
  );

  const availableBlocks = useMemo(
    () => Array.from(new Set(projectLots.map((l) => l.block))).sort(),
    [projectLots]
  );

  const filteredLots = useMemo(() => {
    return projectLots.filter((lot) => {
      if (selectedBlock !== 'ALL' && lot.block !== selectedBlock) return false;
      if (selectedStatus !== 'ALL') {
        if (selectedStatus === 'Booking' && lot.status !== 'Booking' && lot.status !== 'Proses KPR')
          return false;
        if (selectedStatus === 'Terjual' && lot.status !== 'Terjual' && lot.status !== 'Akad')
          return false;
        if (
          selectedStatus !== 'Booking' &&
          selectedStatus !== 'Terjual' &&
          lot.status !== selectedStatus
        )
          return false;
      }
      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase();
        return (
          lot.code.toLowerCase().includes(q) ||
          (lot.buyerName || '').toLowerCase().includes(q) ||
          lot.status.toLowerCase().includes(q) ||
          lot.type.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [projectLots, selectedBlock, selectedStatus, tableSearch]);

  const stats = useMemo(
    () => ({
      total: projectLots.length,
      drawnCount: drawnPolygonLots.length,
      tersedia: projectLots.filter((k) => k.status === 'Tersedia').length,
      booking: projectLots.filter((k) => k.status === 'Booking').length,
      prosesKpr: projectLots.filter((k) => k.status === 'Proses KPR').length,
      terjual: projectLots.filter((k) => k.status === 'Terjual' || k.status === 'Akad').length,
      serahTerima: projectLots.filter((k) => k.status === 'Serah Terima').length,
    }),
    [projectLots, drawnPolygonLots]
  );

  const selectedEditorLot = useMemo(
    () => projectLots.find((l) => l.id === selectedEditorLotId) || null,
    [projectLots, selectedEditorLotId]
  );

  // Get polygon/rectangle points for a lot (only if explicitly drawn/defined)
  const getLotPolygonPoints = (lot: KavlingLot): { xPct: number; yPct: number }[] | null => {
    if (lot.mapCoords?.points && lot.mapCoords.points.length >= 3) {
      return lot.mapCoords.points;
    }
    return null;
  };

  // Compute 4 corners of a rectangle rotated by rotationDeg around its center
  const computeRotatedRectPoints = (
    centerX: number,
    centerY: number,
    widthPct: number,
    heightPct: number,
    rotationDeg: number
  ): { xPct: number; yPct: number }[] => {
    const rad = (rotationDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const hw = widthPct / 2;
    const hh = heightPct / 2;
    const localCorners = [
      { dx: -hw, dy: -hh },
      { dx: hw, dy: -hh },
      { dx: hw, dy: hh },
      { dx: -hw, dy: hh },
    ];
    return localCorners.map(({ dx, dy }) => ({
      xPct: Number(Math.max(0, Math.min(100, centerX + dx * cos - dy * sin)).toFixed(2)),
      yPct: Number(Math.max(0, Math.min(100, centerY + dx * sin + dy * cos)).toFixed(2)),
    }));
  };

  // Calculate rotation angle (in degrees) of a 4-point rectangle from its top edge (p0 -> p1)
  const getRectAngleDegFromPoints = (
    pts: { xPct: number; yPct: number }[],
    fallbackDeg = 0
  ): number => {
    if (!pts || pts.length < 2) return fallbackDeg;
    const dx = pts[1].xPct - pts[0].xPct;
    const dy = pts[1].yPct - pts[0].yPct;
    if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return fallbackDeg;
    return Math.round((Math.atan2(dy, dx) * 180) / Math.PI);
  };

  // Rotate an arbitrary array of points around a center (cx, cy) by deltaDeg
  const rotatePointsAroundCenter = (
    pts: { xPct: number; yPct: number }[],
    cx: number,
    cy: number,
    deltaDeg: number
  ): { xPct: number; yPct: number }[] => {
    const rad = (deltaDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return pts.map((pt) => {
      const dx = pt.xPct - cx;
      const dy = pt.yPct - cy;
      return {
        xPct: Number(Math.max(0, Math.min(100, cx + dx * cos - dy * sin)).toFixed(2)),
        yPct: Number(Math.max(0, Math.min(100, cy + dx * sin + dy * cos)).toFixed(2)),
      };
    });
  };

  // Get bounding box & centroid from polygon points
  const getPolygonBoundsAndCenter = (pts: { xPct: number; yPct: number }[]) => {
    const xs = pts.map((p) => p.xPct);
    const ys = pts.map((p) => p.yPct);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const centerX = Number((xs.reduce((a, b) => a + b, 0) / pts.length).toFixed(2));
    const centerY = Number((ys.reduce((a, b) => a + b, 0) / pts.length).toFixed(2));
    return {
      xPct: Number(minX.toFixed(2)),
      yPct: Number(minY.toFixed(2)),
      widthPct: Number(Math.max(1.2, maxX - minX).toFixed(2)),
      heightPct: Number(Math.max(1.2, maxY - minY).toFixed(2)),
      centerX,
      centerY,
    };
  };

  // Constrain a point relative to an anchor vertex so the segment is strictly straight (0° horizontal, 90° vertical, or 45° diagonal) when Shift is held or Straight Line mode is active
  const constrainPointToStraightLine = (
    anchor: { xPct: number; yPct: number },
    rawX: number,
    rawY: number
  ): { xPct: number; yPct: number; angleDeg: number } => {
    const dx = rawX - anchor.xPct;
    const dy = rawY - anchor.yPct;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.05) {
      return { xPct: Number(rawX.toFixed(2)), yPct: Number(rawY.toFixed(2)), angleDeg: 0 };
    }
    const rawRad = Math.atan2(dy, dx);
    const stepRad = Math.PI / 4; // Snap every 45° (0°, 45°, 90°, 135°, 180°, -45°, -90°, -135°)
    const snappedRad = Math.round(rawRad / stepRad) * stepRad;
    const angleDeg = Math.round((snappedRad * 180) / Math.PI);

    // For pure horizontal (0° / 180°) or pure vertical (90° / -90°), keep exact anchor coordinate so lines are 100% straight!
    if (angleDeg === 0 || angleDeg === 180 || angleDeg === -180) {
      return {
        xPct: Number(Math.max(0, Math.min(100, rawX)).toFixed(2)),
        yPct: anchor.yPct,
        angleDeg,
      };
    }
    if (angleDeg === 90 || angleDeg === -90) {
      return {
        xPct: anchor.xPct,
        yPct: Number(Math.max(0, Math.min(100, rawY)).toFixed(2)),
        angleDeg,
      };
    }

    const nx = anchor.xPct + Math.cos(snappedRad) * dist;
    const ny = anchor.yPct + Math.sin(snappedRad) * dist;
    return {
      xPct: Number(Math.max(0, Math.min(100, nx)).toFixed(2)),
      yPct: Number(Math.max(0, Math.min(100, ny)).toFixed(2)),
      angleDeg,
    };
  };

  // Smart Magnetic Snapping Engine: Snaps a single point (e.g., rectangle start/end corner) to existing blocks' corners, edge midpoints, or center lines
  const snapCoordinateToExistingBlocks = (
    rawX: number,
    rawY: number,
    excludeLotId?: string
  ): {
    xPct: number;
    yPct: number;
    guides: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      label?: string;
      snapPoint?: { xPct: number; yPct: number };
    }[];
  } => {
    if (!snapToBlocks || drawnPolygonLots.length === 0) {
      return { xPct: rawX, yPct: rawY, guides: [] };
    }

    const POINT_THRESHOLD = 1.35; // % of canvas for direct corner/edge-midpoint snap
    const AXIS_THRESHOLD = 0.85; // % of canvas for X/Y center or edge alignment line

    let bestPointDist = POINT_THRESHOLD;
    let snappedPoint: {
      xPct: number;
      yPct: number;
      refX: number;
      refY: number;
      label: string;
    } | null = null;

    for (const lot of drawnPolygonLots) {
      if (lot.id === excludeLotId) continue;
      const pts = getLotPolygonPoints(lot);
      if (!pts || pts.length < 3) continue;
      const b = getPolygonBoundsAndCenter(pts);

      // 1. Check snap to corners and edge midpoints of existing blocks
      const candidatePoints: { x: number; y: number; label: string }[] = [
        { x: b.centerX, y: b.centerY, label: `Tengah ${lot.code}` },
      ];
      pts.forEach((pt, idx) => {
        candidatePoints.push({ x: pt.xPct, y: pt.yPct, label: `Sudut ${lot.code}` });
        const nextPt = pts[(idx + 1) % pts.length];
        candidatePoints.push({
          x: Number(((pt.xPct + nextPt.xPct) / 2).toFixed(2)),
          y: Number(((pt.yPct + nextPt.yPct) / 2).toFixed(2)),
          label: `Tepi ${lot.code}`,
        });
      });

      for (const cp of candidatePoints) {
        const dist = Math.hypot(rawX - cp.x, rawY - cp.y);
        if (dist < bestPointDist) {
          bestPointDist = dist;
          snappedPoint = {
            xPct: cp.x,
            yPct: cp.y,
            refX: b.centerX,
            refY: b.centerY,
            label: cp.label,
          };
        }
      }
    }

    if (snappedPoint) {
      return {
        xPct: snappedPoint.xPct,
        yPct: snappedPoint.yPct,
        guides: [
          {
            x1: snappedPoint.refX,
            y1: snappedPoint.refY,
            x2: snappedPoint.xPct,
            y2: snappedPoint.yPct,
            label: `Snap ${snappedPoint.label}`,
            snapPoint: { xPct: snappedPoint.xPct, yPct: snappedPoint.yPct },
          },
        ],
      };
    }

    // 2. Otherwise check orthogonal X / Y alignment to existing blocks' centers or bounding edges
    let snappedX = rawX;
    let snappedY = rawY;
    let bestDx = AXIS_THRESHOLD;
    let bestDy = AXIS_THRESHOLD;
    const guides: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      label?: string;
      snapPoint?: { xPct: number; yPct: number };
    }[] = [];
    let xGuide: { x: number; y1: number; y2: number; label: string } | null = null;
    let yGuide: { y: number; x1: number; x2: number; label: string } | null = null;

    for (const lot of drawnPolygonLots) {
      if (lot.id === excludeLotId) continue;
      const pts = getLotPolygonPoints(lot);
      if (!pts || pts.length < 3) continue;
      const b = getPolygonBoundsAndCenter(pts);

      const xTargets = [
        { val: b.centerX, label: `Sejajar Tengah ${lot.code}` },
        { val: b.xPct, label: `Sejajar Tepi ${lot.code}` },
        { val: Number((b.xPct + b.widthPct).toFixed(2)), label: `Sejajar Tepi ${lot.code}` },
      ];
      for (const xt of xTargets) {
        const dx = Math.abs(rawX - xt.val);
        if (dx < bestDx) {
          bestDx = dx;
          snappedX = xt.val;
          xGuide = { x: xt.val, y1: b.centerY, y2: rawY, label: xt.label };
        }
      }

      const yTargets = [
        { val: b.centerY, label: `Sejajar Tengah ${lot.code}` },
        { val: b.yPct, label: `Sejajar Tepi ${lot.code}` },
        { val: Number((b.yPct + b.heightPct).toFixed(2)), label: `Sejajar Tepi ${lot.code}` },
      ];
      for (const yt of yTargets) {
        const dy = Math.abs(rawY - yt.val);
        if (dy < bestDy) {
          bestDy = dy;
          snappedY = yt.val;
          yGuide = { y: yt.val, x1: b.centerX, x2: rawX, label: yt.label };
        }
      }
    }

    if (xGuide) {
      guides.push({
        x1: xGuide.x,
        y1: xGuide.y1,
        x2: xGuide.x,
        y2: snappedY,
        label: xGuide.label,
      });
    }
    if (yGuide) {
      guides.push({
        x1: yGuide.x1,
        y1: yGuide.y,
        x2: snappedX,
        y2: yGuide.y,
        label: yGuide.label,
      });
    }

    return {
      xPct: Number(snappedX.toFixed(2)),
      yPct: Number(snappedY.toFixed(2)),
      guides,
    };
  };

  // Snap a full 4-corner rectangle (when dragging/moving or drawing) so its edges, corners, or center magnetize to existing blocks
  const snapRectanglePointsToBlocks = (
    candidatePts: { xPct: number; yPct: number }[],
    excludeLotId?: string
  ): {
    points: { xPct: number; yPct: number }[];
    guides: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      label?: string;
      snapPoint?: { xPct: number; yPct: number };
    }[];
  } => {
    if (!snapToBlocks || drawnPolygonLots.length === 0 || candidatePts.length < 3) {
      return { points: candidatePts, guides: [] };
    }

    const candBounds = getPolygonBoundsAndCenter(candidatePts);
    const SNAP_THRESHOLD = 1.45; // % of canvas for magnetic edge/corner/center locking

    let bestDist = SNAP_THRESHOLD;
    let bestShift: { dx: number; dy: number } | null = null;
    let bestGuides: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      label?: string;
      snapPoint?: { xPct: number; yPct: number };
    }[] = [];

    // Compute candidate edge midpoints (top, right, bottom, left)
    const candEdgeMids = candidatePts.map((pt, idx) => {
      const next = candidatePts[(idx + 1) % candidatePts.length];
      return {
        xPct: (pt.xPct + next.xPct) / 2,
        yPct: (pt.yPct + next.yPct) / 2,
      };
    });

    for (const lot of drawnPolygonLots) {
      if (lot.id === excludeLotId) continue;
      const targetPts = getLotPolygonPoints(lot);
      if (!targetPts || targetPts.length < 3) continue;
      const targetBounds = getPolygonBoundsAndCenter(targetPts);

      // A. Edge-Midpoint to Edge-Midpoint Snap (flushes two rotated or axis-aligned blocks directly side-by-side!)
      const targetEdgeMids = targetPts.map((pt, idx) => {
        const next = targetPts[(idx + 1) % targetPts.length];
        return {
          xPct: (pt.xPct + next.xPct) / 2,
          yPct: (pt.yPct + next.yPct) / 2,
          p1: pt,
          p2: next,
        };
      });

      for (const cMid of candEdgeMids) {
        for (const tMid of targetEdgeMids) {
          const d = Math.hypot(tMid.xPct - cMid.xPct, tMid.yPct - cMid.yPct);
          if (d < bestDist) {
            bestDist = d;
            bestShift = { dx: tMid.xPct - cMid.xPct, dy: tMid.yPct - cMid.yPct };
            bestGuides = [
              {
                x1: tMid.p1.xPct,
                y1: tMid.p1.yPct,
                x2: tMid.p2.xPct,
                y2: tMid.p2.yPct,
                label: `Snap Tepi ${lot.code}`,
                snapPoint: {
                  xPct: Number(tMid.xPct.toFixed(2)),
                  yPct: Number(tMid.yPct.toFixed(2)),
                },
              },
            ];
          }
        }
      }

      // B. Corner-to-Corner Snap (aligns vertices of adjacent blocks along any angle)
      for (const cPt of candidatePts) {
        for (const tPt of targetPts) {
          const d = Math.hypot(tPt.xPct - cPt.xPct, tPt.yPct - cPt.yPct);
          if (d < bestDist) {
            bestDist = d;
            bestShift = { dx: tPt.xPct - cPt.xPct, dy: tPt.yPct - cPt.yPct };
            bestGuides = [
              {
                x1: targetBounds.centerX,
                y1: targetBounds.centerY,
                x2: tPt.xPct,
                y2: tPt.yPct,
                label: `Snap Sudut ${lot.code}`,
                snapPoint: { xPct: tPt.xPct, yPct: tPt.yPct },
              },
            ];
          }
        }
      }
    }

    if (bestShift) {
      const shifted = candidatePts.map((pt) => ({
        xPct: Number(Math.max(0, Math.min(100, pt.xPct + bestShift!.dx)).toFixed(2)),
        yPct: Number(Math.max(0, Math.min(100, pt.yPct + bestShift!.dy)).toFixed(2)),
      }));
      return { points: shifted, guides: bestGuides };
    }

    // C. Center-to-Center X / Y Axis Alignment (when placing blocks in a row or column with a gap)
    const CENTER_AXIS_THRESHOLD = 0.85;
    let dxCenter = 0;
    let dyCenter = 0;
    let bestCenterDx = CENTER_AXIS_THRESHOLD;
    let bestCenterDy = CENTER_AXIS_THRESHOLD;
    let xCenterGuide: { x: number; y1: number; y2: number; label: string } | null = null;
    let yCenterGuide: { y: number; x1: number; x2: number; label: string } | null = null;

    for (const lot of drawnPolygonLots) {
      if (lot.id === excludeLotId) continue;
      const targetPts = getLotPolygonPoints(lot);
      if (!targetPts || targetPts.length < 3) continue;
      const targetBounds = getPolygonBoundsAndCenter(targetPts);

      const distCx = Math.abs(targetBounds.centerX - candBounds.centerX);
      if (distCx < bestCenterDx) {
        bestCenterDx = distCx;
        dxCenter = targetBounds.centerX - candBounds.centerX;
        xCenterGuide = {
          x: targetBounds.centerX,
          y1: targetBounds.centerY,
          y2: candBounds.centerY,
          label: `Sejajar Tengah ${lot.code}`,
        };
      }

      const distCy = Math.abs(targetBounds.centerY - candBounds.centerY);
      if (distCy < bestCenterDy) {
        bestCenterDy = distCy;
        dyCenter = targetBounds.centerY - candBounds.centerY;
        yCenterGuide = {
          y: targetBounds.centerY,
          x1: targetBounds.centerX,
          x2: candBounds.centerX,
          label: `Sejajar Tengah ${lot.code}`,
        };
      }
    }

    if (xCenterGuide || yCenterGuide) {
      const aligned = candidatePts.map((pt) => ({
        xPct: Number(Math.max(0, Math.min(100, pt.xPct + dxCenter)).toFixed(2)),
        yPct: Number(Math.max(0, Math.min(100, pt.yPct + dyCenter)).toFixed(2)),
      }));
      const guides: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        label?: string;
        snapPoint?: { xPct: number; yPct: number };
      }[] = [];
      if (xCenterGuide) {
        guides.push({
          x1: xCenterGuide.x,
          y1: xCenterGuide.y1,
          x2: xCenterGuide.x,
          y2: Number((candBounds.centerY + dyCenter).toFixed(2)),
          label: xCenterGuide.label,
        });
      }
      if (yCenterGuide) {
        guides.push({
          x1: yCenterGuide.x1,
          y1: yCenterGuide.y,
          x2: Number((candBounds.centerX + dxCenter).toFixed(2)),
          y2: yCenterGuide.y,
          label: yCenterGuide.label,
        });
      }
      return { points: aligned, guides };
    }

    return { points: candidatePts, guides: [] };
  };

  // Rotate a selected lot to an exact target angle (in degrees)
  const applyLotRotationAngle = (lot: KavlingLot, targetAngleDeg: number) => {
    const pts = getLotPolygonPoints(lot);
    if (!pts || pts.length < 3) return;
    const normalizedDeg = ((targetAngleDeg + 180) % 360 + 360) % 360 - 180;
    const currentDeg =
      typeof lot.mapCoords?.rotationDeg === 'number'
        ? lot.mapCoords.rotationDeg
        : getRectAngleDegFromPoints(pts, 0);
    const deltaDeg = normalizedDeg - currentDeg;
    const bounds = getPolygonBoundsAndCenter(pts);
    const rotatedPts = rotatePointsAroundCenter(pts, bounds.centerX, bounds.centerY, deltaDeg);
    const newBounds = getPolygonBoundsAndCenter(rotatedPts);
    setDefaultDrawRotationDeg(normalizedDeg);
    updateKavlingOverlayCoords(lot.id, {
      x: Math.round((newBounds.xPct / 100) * 1920),
      y: Math.round((newBounds.yPct / 100) * 1080),
      width: Math.round((newBounds.widthPct / 100) * 1920),
      height: Math.round((newBounds.heightPct / 100) * 1080),
      xPct: newBounds.xPct,
      yPct: newBounds.yPct,
      widthPct: newBounds.widthPct,
      heightPct: newBounds.heightPct,
      rotationDeg: normalizedDeg,
      shape: 'RECT',
      points: rotatedPts,
    });
  };

  // Resize a selected lot (House Icon) to a specific size percentage (perkecil / perbesar)
  const applyLotHouseSize = (lot: KavlingLot, targetSizePct: number) => {
    const pts = getLotPolygonPoints(lot);
    if (!pts || pts.length < 3) return;
    const clampedSize = Number(Math.max(1.4, Math.min(9.0, targetSizePct)).toFixed(2));
    const bounds = getPolygonBoundsAndCenter(pts);
    const currentDeg =
      typeof lot.mapCoords?.rotationDeg === 'number'
        ? lot.mapCoords.rotationDeg
        : getRectAngleDegFromPoints(pts, 0);
    const resizedPts = computeRotatedRectPoints(
      bounds.centerX,
      bounds.centerY,
      clampedSize,
      clampedSize,
      currentDeg
    );
    setDefaultHouseSizePct(clampedSize);
    updateKavlingOverlayCoords(lot.id, {
      x: Math.round(((bounds.centerX - clampedSize / 2) / 100) * 1920),
      y: Math.round(((bounds.centerY - clampedSize / 2) / 100) * 1080),
      width: Math.round((clampedSize / 100) * 1920),
      height: Math.round((clampedSize / 100) * 1080),
      xPct: Number((bounds.centerX - clampedSize / 2).toFixed(2)),
      yPct: Number((bounds.centerY - clampedSize / 2).toFixed(2)),
      widthPct: clampedSize,
      heightPct: clampedSize,
      rotationDeg: currentDeg,
      shape: 'RECT',
      points: resizedPts,
    });
  };

  // Get status color hex from Admin config
  const getLotColorHex = (lot: KavlingLot) => {
    if (lot.customFillColor) return lot.customFillColor;
    const map = activeSitePlanConfig.statusColors || DEFAULT_SITE_PLAN_STATUS_COLORS;
    return map[lot.status] || '#22C55E';
  };

  // Convert hex + alpha for semi-transparent overlay
  const hexToRgba = (hex: string, alpha: number) => {
    const clean = hex.replace('#', '');
    if (clean.length !== 6) return `rgba(34, 197, 94, ${alpha})`;
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Open Lot Add/Edit Form Modal (Triggered when rectangle is drawn or when editing a kavling)
  const openLotEditorModal = (
    lot?: KavlingLot,
    defaultPolygon?: {
      xPct: number;
      yPct: number;
      widthPct: number;
      heightPct: number;
      rotationDeg?: number;
      points?: { xPct: number; yPct: number }[];
    }
  ) => {
    if (lot) {
      const pts = getLotPolygonPoints(lot);
      const bounds = pts
        ? getPolygonBoundsAndCenter(pts)
        : {
            xPct: defaultPolygon?.xPct ?? lot.mapCoords?.xPct ?? 20,
            yPct: defaultPolygon?.yPct ?? lot.mapCoords?.yPct ?? 25,
            widthPct: defaultPolygon?.widthPct ?? lot.mapCoords?.widthPct ?? 4.5,
            heightPct: defaultPolygon?.heightPct ?? lot.mapCoords?.heightPct ?? 4.5,
          };
      const rotDeg =
        defaultPolygon?.rotationDeg ??
        lot.mapCoords?.rotationDeg ??
        (pts ? getRectAngleDegFromPoints(pts, 0) : 0);
      setEditingLotForm({
        id: lot.id,
        companyId: lot.companyId,
        projectName: lot.projectName,
        block: lot.block,
        number: lot.number,
        code: lot.code,
        type: lot.type,
        landSize: lot.landSize,
        buildingSize: lot.buildingSize || 36,
        extraLand: lot.extraLand,
        price: lot.price,
        hpp: lot.hpp,
        status: lot.status,
        progress: lot.progress,
        buyerName: lot.buyerName || '',
        buyerPhone: lot.buyerPhone || '',
        paymentMethod: lot.paymentMethod || 'KPR',
        bank: lot.bank || 'BTN',
        pengawasNotes: lot.pengawasNotes || '',
        pjtNotes: lot.pjtNotes || '',
        photos: lot.photos || [],
        customFillColor: lot.customFillColor || '',
        xPct: bounds.xPct,
        yPct: bounds.yPct,
        widthPct: bounds.widthPct,
        heightPct: bounds.heightPct,
        rotationDeg: rotDeg,
        repeatCount: 1,
        points: defaultPolygon?.points || pts || undefined,
        orientation: lot.mapCoords?.orientation || 'Selatan',
      });
    } else {
      // Find the first kavling in this project that doesn't have a rectangle yet so Admin can quickly link A-01, A-02...
      const nextUnmappedLot = projectLots.find(
        (l) => !l.mapCoords?.points || l.mapCoords.points.length < 3
      );
      const initialRot = defaultPolygon?.rotationDeg ?? defaultDrawRotationDeg ?? 0;
      if (nextUnmappedLot && defaultPolygon?.points) {
        setEditingLotForm({
          id: nextUnmappedLot.id,
          companyId: nextUnmappedLot.companyId,
          projectName: nextUnmappedLot.projectName,
          block: nextUnmappedLot.block,
          number: nextUnmappedLot.number,
          code: nextUnmappedLot.code,
          type: nextUnmappedLot.type,
          landSize: nextUnmappedLot.landSize,
          buildingSize: nextUnmappedLot.buildingSize || 36,
          extraLand: nextUnmappedLot.extraLand,
          price: nextUnmappedLot.price,
          hpp: nextUnmappedLot.hpp,
          status: nextUnmappedLot.status,
          progress: nextUnmappedLot.progress,
          buyerName: nextUnmappedLot.buyerName || '',
          buyerPhone: nextUnmappedLot.buyerPhone || '',
          paymentMethod: nextUnmappedLot.paymentMethod || 'KPR',
          bank: nextUnmappedLot.bank || 'BTN',
          pengawasNotes: nextUnmappedLot.pengawasNotes || '',
          pjtNotes: nextUnmappedLot.pjtNotes || '',
          photos: nextUnmappedLot.photos || [],
          customFillColor: nextUnmappedLot.customFillColor || '',
          xPct: defaultPolygon.xPct,
          yPct: defaultPolygon.yPct,
          widthPct: defaultPolygon.widthPct,
          heightPct: defaultPolygon.heightPct,
          rotationDeg: initialRot,
          repeatCount: 1,
          points: defaultPolygon.points,
          orientation: 'Selatan',
        });
      } else {
        const nextNum = projectLots.length + 1;
        const defaultBlk = selectedBlock !== 'ALL' ? selectedBlock : 'A';
        const nextCode = `${defaultBlk}-${String(nextNum).padStart(2, '0')}`;
        setEditingLotForm({
          companyId: isBahagiaLand ? 'PT_TBL' : 'PT_BPP',
          projectName: activeProjectName,
          block: defaultBlk,
          number: nextNum,
          code: nextCode,
          type: 'Tipe 36/91 Subsidi',
          landSize: '7×13 m (91 m²)',
          buildingSize: 36,
          extraLand: 'Depan 4m, Belakang 3m, Samping 1m',
          price: 169000000,
          hpp: 67651710,
          status: 'Tersedia',
          progress: 50,
          buyerName: '',
          buyerPhone: '',
          paymentMethod: 'KPR',
          bank: 'BTN',
          pengawasNotes: 'Sesuai gambar kerja Site Plan asli.',
          pjtNotes: 'Terverifikasi PJT.',
          photos: [isBahagiaLand ? ASSETS.bahagiaLand : ASSETS.bahagiaResidence],
          customFillColor: '',
          xPct: defaultPolygon?.xPct ?? 20,
          yPct: defaultPolygon?.yPct ?? 25,
          widthPct: defaultPolygon?.widthPct ?? 4.5,
          heightPct: defaultPolygon?.heightPct ?? 4.5,
          rotationDeg: initialRot,
          repeatCount: 1,
          points: defaultPolygon?.points,
          orientation: 'Selatan',
        });
      }
    }
    setShowLotFormModal(true);
  };

  // Finish drawing a 3+ vertex polygon on the original PNG (directly creates the polygon on canvas without popup interruption!)
  const finishPolygonDrawing = (pts: { xPct: number; yPct: number }[]) => {
    if (pts.length < 3) {
      toast.error('Minimal 3 titik sudut untuk menutup bidang polygon kavling');
      return;
    }
    const bounds = getPolygonBoundsAndCenter(pts);
    setPolygonDraftPoints([]);
    setCursorBoardPct(null);
    setActiveSnapGuides([]);

    const nextUnmappedLot = projectLots.find(
      (l) => !l.mapCoords?.points || l.mapCoords.points.length < 3
    );

    if (nextUnmappedLot) {
      updateKavlingOverlayCoords(nextUnmappedLot.id, {
        x: Math.round((bounds.xPct / 100) * 1920),
        y: Math.round((bounds.yPct / 100) * 1080),
        width: Math.round((bounds.widthPct / 100) * 1920),
        height: Math.round((bounds.heightPct / 100) * 1080),
        xPct: bounds.xPct,
        yPct: bounds.yPct,
        widthPct: bounds.widthPct,
        heightPct: bounds.heightPct,
        rotationDeg: 0,
        shape: 'POLYGON',
        points: pts,
      });
      setSelectedEditorLotId(nextUnmappedLot.id);
      toast.success(
        `✅ Polygon ${nextUnmappedLot.code} (${pts.length} titik) berhasil dibuat! Klik titik kuning untuk geser sudut atau bulatan hijau untuk putar.`
      );
    } else {
      const nextNum = projectLots.length + 1;
      const defaultBlk = selectedBlock !== 'ALL' ? selectedBlock : 'A';
      const nextCode = `${defaultBlk}-${String(nextNum).padStart(2, '0')}`;
      const saved = saveKavlingLotFull({
        companyId: isBahagiaLand ? 'PT_TBL' : 'PT_BPP',
        projectName: activeProjectName,
        block: defaultBlk,
        number: nextNum,
        code: nextCode,
        type: 'Tipe 36/91 Subsidi',
        landSize: '7×13 m (91 m²)',
        buildingSize: 36,
        extraLand: 'Depan 4m, Belakang 3m, Samping 1m',
        price: 169000000,
        hpp: 67651710,
        status: 'Tersedia',
        progress: 50,
        pjtVerified: false,
        pengawasNotes: 'Sesuai gambar kerja Site Plan asli.',
        pjtNotes: 'Terverifikasi PJT.',
        photos: [isBahagiaLand ? ASSETS.bahagiaLand : ASSETS.bahagiaResidence],
        mapCoords: {
          x: Math.round((bounds.xPct / 100) * 1920),
          y: Math.round((bounds.yPct / 100) * 1080),
          width: Math.round((bounds.widthPct / 100) * 1920),
          height: Math.round((bounds.heightPct / 100) * 1080),
          xPct: bounds.xPct,
          yPct: bounds.yPct,
          widthPct: bounds.widthPct,
          heightPct: bounds.heightPct,
          rotationDeg: 0,
          shape: 'POLYGON',
          points: pts,
          orientation: 'Selatan',
        },
      });
      setSelectedEditorLotId(saved.id);
      toast.success(`✅ Polygon ${saved.code} (${pts.length} titik) berhasil dibuat!`);
    }
  };

  // Keyboard shortcuts for Canvas Editor: Shift (straight line), Enter (finish polygon), Backspace (undo vertex), Escape (cancel), Ctrl+C / Ctrl+V
  useEffect(() => {
    if (!isSuperAdmin || adminSubTab !== 'OVERLAY_EDITOR' || showLotFormModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftKeyPressed(true);
      }
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'Enter' && polygonDraftPoints.length >= 3) {
        e.preventDefault();
        finishPolygonDrawing(polygonDraftPoints);
        return;
      }

      if (e.key === 'Backspace' && polygonDraftPoints.length > 0) {
        e.preventDefault();
        setPolygonDraftPoints((prev) => prev.slice(0, -1));
        toast.info('Titik terakhir dibatalkan (Backspace)');
        return;
      }

      if (e.key === 'Escape') {
        if (drawingRect) {
          setDrawingRect(null);
          toast.info('Pembuatan bidang dibatalkan (Esc)');
        } else if (polygonDraftPoints.length > 0) {
          setPolygonDraftPoints([]);
          setCursorBoardPct(null);
          setActiveSnapGuides([]);
          toast.info('Gambar polygon dibatalkan (Esc)');
        } else if (selectedEditorLotId) {
          setSelectedEditorLotId(null);
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (selectedEditorLot?.mapCoords?.points && selectedEditorLot.mapCoords.points.length >= 3) {
          e.preventDefault();
          const pts = selectedEditorLot.mapCoords.points;
          const rot =
            selectedEditorLot.mapCoords.rotationDeg ?? getRectAngleDegFromPoints(pts, 0);
          setCopiedPolygonPoints(pts);
          setCopiedRotationDeg(rot);
          toast.success(
            `📋 Rectangle ${selectedEditorLot.code} (Sudut ${rot}°) disalin! Tekan Ctrl+V untuk paste kavling sebelahnya.`
          );
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        if (copiedPolygonPoints && copiedPolygonPoints.length >= 3) {
          e.preventDefault();
          // Shift along the rectangle's top edge direction so pasted rectangles line up neatly in a housing block!
          let stepX = 2.5;
          let stepY = 0;
          if (copiedPolygonPoints.length >= 2) {
            stepX = copiedPolygonPoints[1].xPct - copiedPolygonPoints[0].xPct;
            stepY = copiedPolygonPoints[1].yPct - copiedPolygonPoints[0].yPct;
          }
          const shiftedPoints = copiedPolygonPoints.map((pt) => ({
            xPct: Number(Math.max(0.5, Math.min(99, pt.xPct + stepX)).toFixed(2)),
            yPct: Number(Math.max(0.5, Math.min(99, pt.yPct + stepY)).toFixed(2)),
          }));
          setCopiedPolygonPoints(shiftedPoints);
          const bounds = getPolygonBoundsAndCenter(shiftedPoints);
          const nextUnmappedLot = projectLots.find(
            (l) => !l.mapCoords?.points || l.mapCoords.points.length < 3
          );
          if (nextUnmappedLot) {
            updateKavlingOverlayCoords(nextUnmappedLot.id, {
              x: Math.round((bounds.xPct / 100) * 1920),
              y: Math.round((bounds.yPct / 100) * 1080),
              width: Math.round((bounds.widthPct / 100) * 1920),
              height: Math.round((bounds.heightPct / 100) * 1080),
              xPct: bounds.xPct,
              yPct: bounds.yPct,
              widthPct: bounds.widthPct,
              heightPct: bounds.heightPct,
              rotationDeg: copiedRotationDeg,
              shape: 'RECT',
              points: shiftedPoints,
            });
            setSelectedEditorLotId(nextUnmappedLot.id);
            toast.success(`✅ Kotak ${nextUnmappedLot.code} ditempel sejajar (Ctrl+V)!`);
          }
        }
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedEditorLot && polygonDraftPoints.length === 0) {
          e.preventDefault();
          updateKavlingOverlayCoords(selectedEditorLot.id, {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            points: [],
          });
          toast.success(`🗑️ Rectangle kavling ${selectedEditorLot.code} dihapus dari kanvas`);
          setSelectedEditorLotId(null);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftKeyPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    isSuperAdmin,
    adminSubTab,
    showLotFormModal,
    drawingRect,
    polygonDraftPoints,
    selectedEditorLotId,
    selectedEditorLot,
    copiedPolygonPoints,
    copiedRotationDeg,
  ]);

  // Save form from Modal (supports single rectangle OR generating a row of N adjacent rotated rectangles for a housing block!)
  const handleSaveLotForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLotForm) return;
    const xPct = Number(editingLotForm.xPct.toFixed(2));
    const yPct = Number(editingLotForm.yPct.toFixed(2));
    const widthPct = Number(editingLotForm.widthPct.toFixed(2));
    const heightPct = Number(editingLotForm.heightPct.toFixed(2));
    const rotationDeg = Number(editingLotForm.rotationDeg || 0);
    setDefaultDrawRotationDeg(rotationDeg);

    // Base 4 points of the first rectangle (including rotation)
    let basePoints: { xPct: number; yPct: number }[];
    if (editingLotForm.points && editingLotForm.points.length >= 3) {
      const currentPtsAngle = getRectAngleDegFromPoints(editingLotForm.points, 0);
      if (Math.abs(currentPtsAngle - rotationDeg) > 0.5) {
        const b = getPolygonBoundsAndCenter(editingLotForm.points);
        basePoints = rotatePointsAroundCenter(
          editingLotForm.points,
          b.centerX,
          b.centerY,
          rotationDeg - currentPtsAngle
        );
      } else {
        basePoints = editingLotForm.points;
      }
    } else {
      const cx = xPct + widthPct / 2;
      const cy = yPct + heightPct / 2;
      basePoints = computeRotatedRectPoints(cx, cy, widthPct, heightPct, rotationDeg);
    }

    const repeatCount = Math.max(1, Math.min(30, Number(editingLotForm.repeatCount) || 1));

    // Step vector along the rectangle's width edge (p0 -> p1) so multiple units form a neat angled block row
    const stepX =
      basePoints.length >= 2 ? basePoints[1].xPct - basePoints[0].xPct : widthPct;
    const stepY =
      basePoints.length >= 2 ? basePoints[1].yPct - basePoints[0].yPct : 0;

    let lastSavedId: string | null = null;
    const startNumber = Number(editingLotForm.number) || 1;
    const blockCode = editingLotForm.block.toUpperCase();

    for (let i = 0; i < repeatCount; i++) {
      const unitNum = startNumber + i;
      const unitCode =
        i === 0
          ? editingLotForm.code.toUpperCase()
          : `${blockCode}-${String(unitNum).padStart(2, '0')}`;

      const unitPoints = basePoints.map((pt) => ({
        xPct: Number(Math.max(0, Math.min(100, pt.xPct + stepX * i)).toFixed(2)),
        yPct: Number(Math.max(0, Math.min(100, pt.yPct + stepY * i)).toFixed(2)),
      }));
      const unitBounds = getPolygonBoundsAndCenter(unitPoints);

      const matchingExistingByCode = projectLots.find(
        (l) => l.code.toUpperCase() === unitCode.trim().toUpperCase()
      );

      const saved = saveKavlingLotFull({
        id: matchingExistingByCode?.id || (i === 0 ? editingLotForm.id : undefined),
        companyId: editingLotForm.companyId,
        projectName: editingLotForm.projectName,
        block: blockCode,
        number: unitNum,
        code: unitCode,
        type: editingLotForm.type,
        landSize: editingLotForm.landSize,
        buildingSize: Number(editingLotForm.buildingSize) || 36,
        extraLand: editingLotForm.extraLand,
        price: Number(editingLotForm.price) || 169000000,
        hpp: Number(editingLotForm.hpp) || 67651710,
        status: matchingExistingByCode && i > 0 ? matchingExistingByCode.status : editingLotForm.status,
        progress:
          matchingExistingByCode && i > 0
            ? matchingExistingByCode.progress
            : Number(editingLotForm.progress) || 0,
        pjtVerified: Number(editingLotForm.progress) >= 75,
        buyerName:
          i === 0
            ? editingLotForm.buyerName.trim() || undefined
            : matchingExistingByCode?.buyerName,
        buyerPhone:
          i === 0
            ? editingLotForm.buyerPhone.trim() || undefined
            : matchingExistingByCode?.buyerPhone,
        paymentMethod: editingLotForm.paymentMethod,
        bank: editingLotForm.bank || undefined,
        pengawasNotes: editingLotForm.pengawasNotes,
        pjtNotes: editingLotForm.pjtNotes,
        photos: editingLotForm.photos,
        customFillColor: editingLotForm.customFillColor || undefined,
        mapCoords: {
          x: Math.round((unitBounds.xPct / 100) * 1920),
          y: Math.round((unitBounds.yPct / 100) * 1080),
          width: Math.round((unitBounds.widthPct / 100) * 1920),
          height: Math.round((unitBounds.heightPct / 100) * 1080),
          xPct: unitBounds.xPct,
          yPct: unitBounds.yPct,
          widthPct: unitBounds.widthPct,
          heightPct: unitBounds.heightPct,
          rotationDeg,
          shape: 'RECT',
          points: unitPoints,
          orientation: editingLotForm.orientation,
        },
      });
      lastSavedId = saved.id;
    }

    setShowLotFormModal(false);
    if (lastSavedId) setSelectedEditorLotId(lastSavedId);
    toast.success(
      repeatCount > 1
        ? `✅ ${repeatCount} Rectangle Blok ${blockCode} (Sudut ${rotationDeg}°) berhasil dibuat & disimpan ke Site Plan!`
        : `✅ Rectangle Kavling ${editingLotForm.code} (Sudut ${rotationDeg}°) berhasil disimpan!`
    );
  };

  // Handle File Upload for Site Plan (PNG / JPG / WebP) — Preserves Original Image 100% + Saves to IndexedDB & Firestore
  const handleSitePlanFileUpload = (
    file: File,
    targetProjId: string,
    targetProjName: string,
    targetCompId: string
  ) => {
    if (file.size > 15 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 15MB');
      return;
    }

    const sizeMb = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
    const isResidenceTarget =
      file.name.toLowerCase().includes('residence') ||
      targetProjName.toLowerCase().includes('residence');
    const targetSlug = isResidenceTarget ? 'bahagia-residence' : 'bahagia-land';

    // For PNG, JPG, WebP image files: read original high-res data URL for IndexedDB and optimized WebP/JPEG for localStorage/Firestore
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rawDataUrl = ev.target?.result as string;
      const img = new Image();
      img.onload = async () => {
        // 1. Save 100% full-resolution PNG to IndexedDB so browser renders it crystal clear without 5MB localStorage limit
        await saveHighResImageToIdb(`siteplan_bg_${targetSlug}`, rawDataUrl);
        if (targetSlug === projSlug) {
          setIdbHighResBg(rawDataUrl);
        }

        // 2. Create a compact WebP/JPEG version (< 250KB) for Zustand localStorage & Firestore document
        const canvas = document.createElement('canvas');
        const maxW = 1600;
        const scale = img.width > maxW ? maxW / img.width : 1;
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compactUrl = canvas.toDataURL('image/webp', 0.86);

        updateSitePlanImageConfig({
          projectId: targetProjId,
          projectName: targetProjName,
          companyId: targetCompId,
          sourceFileName: file.name,
          imageUrl: compactUrl,
          resolution: `${img.width} × ${img.height} px (Original PNG)`,
          fileSizeText: sizeMb,
        });
        toast.success(
          `✅ Gambar asli "${file.name}" (${img.width}×${img.height} px) berhasil diterapkan apa adanya!`
        );
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Start dragging an entire rectangle, a corner vertex handle, or the rotation handle
  const handlePolygonMouseDown = (
    e: React.MouseEvent,
    lot: KavlingLot,
    mode: 'MOVE_POLYGON' | 'MOVE_VERTEX' | 'ROTATE_RECT',
    vertexIndex?: number
  ) => {
    if (adminSubTab !== 'OVERLAY_EDITOR') return;

    // Always stop propagation when clicking an existing rectangle or its handles so the canvas never starts drawing a duplicate rectangle underneath!
    e.stopPropagation();

    if (editorTool === 'DELETE_TOOL') {
      updateKavlingOverlayCoords(lot.id, {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        points: [],
      });
      if (selectedEditorLotId === lot.id) setSelectedEditorLotId(null);
      toast.success(`🗑️ Rectangle kavling ${lot.code} dihapus dari gambar Site Plan`);
      return;
    }

    if (editorTool === 'PAN_TOOL') return;

    setSelectedEditorLotId(lot.id);
    const pts = getLotPolygonPoints(lot);
    if (!pts) return;

    const bounds = getPolygonBoundsAndCenter(pts);
    const currentRot =
      typeof lot.mapCoords?.rotationDeg === 'number'
        ? lot.mapCoords.rotationDeg
        : getRectAngleDegFromPoints(pts, 0);

    setDraggingPolygonState({
      lotId: lot.id,
      mode,
      vertexIndex,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      initialPoints: pts.map((p) => ({ ...p })),
      initialRotationDeg: currentRot,
      centerXPct: bounds.centerX,
      centerYPct: bounds.centerY,
    });
  };

  // Instant 1-click creation of a new rotatable rectangle on canvas (no popup form needed!)
  const createInstantRotatableRect = (
    xPct: number,
    yPct: number,
    widthPct: number,
    heightPct: number,
    customPoints?: { xPct: number; yPct: number }[]
  ) => {
    const cx = xPct + widthPct / 2;
    const cy = yPct + heightPct / 2;
    const rotDeg = defaultDrawRotationDeg || 0;
    const rectPts =
      customPoints && customPoints.length >= 3
        ? customPoints
        : computeRotatedRectPoints(cx, cy, widthPct, heightPct, rotDeg);
    const bounds = getPolygonBoundsAndCenter(rectPts);

    // Attach to first unmapped lot in this project (e.g., A-01, A-02) or create next unit
    const nextUnmappedLot = projectLots.find(
      (l) => !l.mapCoords?.points || l.mapCoords.points.length < 3
    );

    if (nextUnmappedLot) {
      updateKavlingOverlayCoords(nextUnmappedLot.id, {
        x: Math.round((bounds.xPct / 100) * 1920),
        y: Math.round((bounds.yPct / 100) * 1080),
        width: Math.round((widthPct / 100) * 1920),
        height: Math.round((heightPct / 100) * 1080),
        xPct: bounds.xPct,
        yPct: bounds.yPct,
        widthPct,
        heightPct,
        rotationDeg: rotDeg,
        shape: 'RECT',
        points: rectPts,
      });
      setSelectedEditorLotId(nextUnmappedLot.id);
      toast.success(
        `✅ Kotak ${nextUnmappedLot.code} dibuat! Tarik bulatan hijau di atas kotak untuk memutar sudutnya.`
      );
    } else {
      const nextNum = projectLots.length + 1;
      const defaultBlk = selectedBlock !== 'ALL' ? selectedBlock : 'A';
      const nextCode = `${defaultBlk}-${String(nextNum).padStart(2, '0')}`;
      const saved = saveKavlingLotFull({
        companyId: isBahagiaLand ? 'PT_TBL' : 'PT_BPP',
        projectName: activeProjectName,
        block: defaultBlk,
        number: nextNum,
        code: nextCode,
        type: 'Tipe 36/91 Subsidi',
        landSize: '7×13 m (91 m²)',
        buildingSize: 36,
        extraLand: 'Depan 4m, Belakang 3m, Samping 1m',
        price: 169000000,
        hpp: 67651710,
        status: 'Tersedia',
        progress: 50,
        pjtVerified: false,
        pengawasNotes: 'Sesuai gambar kerja Site Plan asli.',
        pjtNotes: 'Terverifikasi PJT.',
        photos: [isBahagiaLand ? ASSETS.bahagiaLand : ASSETS.bahagiaResidence],
        mapCoords: {
          x: Math.round((bounds.xPct / 100) * 1920),
          y: Math.round((bounds.yPct / 100) * 1080),
          width: Math.round((widthPct / 100) * 1920),
          height: Math.round((heightPct / 100) * 1080),
          xPct: bounds.xPct,
          yPct: bounds.yPct,
          widthPct,
          heightPct,
          rotationDeg: rotDeg,
          shape: 'RECT',
          points: rectPts,
          orientation: 'Selatan',
        },
      });
      setSelectedEditorLotId(saved.id);
      toast.success(
        `✅ Kotak ${saved.code} dibuat! Tarik bulatan hijau di atas kotak untuk memutar sudutnya.`
      );
    }
  };

  const handleBoardMouseDown = (e: React.MouseEvent) => {
    // 1-Click House Icon Placement (Tanpa perlu menggambar!)
    if (adminSubTab === 'OVERLAY_EDITOR' && editorTool === 'PLACE_HOUSE_ICON') {
      if (!overlayBoardRef.current) return;
      const rect = overlayBoardRef.current.getBoundingClientRect();
      const rawX = Math.max(1, Math.min(99, ((e.clientX - rect.left) / rect.width) * 100));
      const rawY = Math.max(1, Math.min(99, ((e.clientY - rect.top) / rect.height) * 100));
      const sizePct = defaultHouseSizePct || 3.2;
      const rotDeg = defaultDrawRotationDeg || 0;
      const candidatePts = computeRotatedRectPoints(rawX, rawY, sizePct, sizePct, rotDeg);
      const snappedRect = snapRectanglePointsToBlocks(candidatePts);
      const finalPts = snappedRect.points;
      const b = getPolygonBoundsAndCenter(finalPts);
      createInstantRotatableRect(
        Number((b.centerX - sizePct / 2).toFixed(2)),
        Number((b.centerY - sizePct / 2).toFixed(2)),
        sizePct,
        sizePct,
        finalPts
      );
      setActiveSnapGuides([]);
      return;
    }

    if (adminSubTab === 'OVERLAY_EDITOR' && editorTool === 'DRAW_RECT') {
      if (!overlayBoardRef.current) return;
      const rect = overlayBoardRef.current.getBoundingClientRect();
      const rawX = Math.max(0, Math.min(98, ((e.clientX - rect.left) / rect.width) * 100));
      const rawY = Math.max(0, Math.min(98, ((e.clientY - rect.top) / rect.height) * 100));
      const snappedStart = snapCoordinateToExistingBlocks(rawX, rawY);
      setActiveSnapGuides(snappedStart.guides);
      setDrawingRect({
        startXPct: snappedStart.xPct,
        startYPct: snappedStart.yPct,
        currentXPct: snappedStart.xPct,
        currentYPct: snappedStart.yPct,
      });
      return;
    }

    if (adminSubTab === 'OVERLAY_EDITOR' && editorTool === 'DRAW_POLYGON') {
      if (!overlayBoardRef.current) return;
      const rect = overlayBoardRef.current.getBoundingClientRect();
      const rawX = Math.max(0, Math.min(99.8, ((e.clientX - rect.left) / rect.width) * 100));
      const rawY = Math.max(0, Math.min(99.8, ((e.clientY - rect.top) / rect.height) * 100));

      // Check if clicking near the first vertex to close the polygon (when 3+ vertices exist)
      if (polygonDraftPoints.length >= 3) {
        const first = polygonDraftPoints[0];
        const distToFirst = Math.hypot(rawX - first.xPct, rawY - first.yPct);
        if (distToFirst <= 1.8) {
          finishPolygonDrawing(polygonDraftPoints);
          return;
        }
      }

      const useStraight = e.shiftKey || shiftStraightMode || isShiftKeyPressed;
      let targetX = rawX;
      let targetY = rawY;

      if (useStraight && polygonDraftPoints.length > 0) {
        const lastPt = polygonDraftPoints[polygonDraftPoints.length - 1];
        const constrained = constrainPointToStraightLine(lastPt, rawX, rawY);
        targetX = constrained.xPct;
        targetY = constrained.yPct;
      } else {
        const snapped = snapCoordinateToExistingBlocks(rawX, rawY);
        targetX = snapped.xPct;
        targetY = snapped.yPct;
      }

      const step = snapToGrid ? 0.5 : 0.05;
      const xPct = Number((Math.round(targetX / step) * step).toFixed(2));
      const yPct = Number((Math.round(targetY / step) * step).toFixed(2));

      // Prevent duplicate identical vertex on fast double-click
      if (polygonDraftPoints.length > 0) {
        const last = polygonDraftPoints[polygonDraftPoints.length - 1];
        if (Math.hypot(xPct - last.xPct, yPct - last.yPct) < 0.25) {
          if (polygonDraftPoints.length >= 3) {
            finishPolygonDrawing(polygonDraftPoints);
          }
          return;
        }
      }

      const nextPts = [...polygonDraftPoints, { xPct, yPct }];
      setPolygonDraftPoints(nextPts);
      return;
    }

    // Pan when using PAN_TOOL or when zoomed in
    if (editorTool === 'PAN_TOOL' || zoomLevel > 1) {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    } else if (adminSubTab === 'OVERLAY_EDITOR' && editorTool === 'SELECT_MOVE') {
      setSelectedEditorLotId(null);
    }
  };

  const handleBoardMouseMove = (e: React.MouseEvent) => {
    if (
      overlayBoardRef.current &&
      adminSubTab === 'OVERLAY_EDITOR' &&
      editorTool === 'PLACE_HOUSE_ICON' &&
      !draggingPolygonState
    ) {
      const rect = overlayBoardRef.current.getBoundingClientRect();
      const rawX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const rawY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      const sizePct = defaultHouseSizePct || 3.2;
      const rotDeg = defaultDrawRotationDeg || 0;
      const candidatePts = computeRotatedRectPoints(rawX, rawY, sizePct, sizePct, rotDeg);
      const snappedRect = snapRectanglePointsToBlocks(candidatePts);
      const b = getPolygonBoundsAndCenter(snappedRect.points);
      setCursorBoardPct({ xPct: b.centerX, yPct: b.centerY });
      setActiveSnapGuides(snappedRect.guides);
    }

    if (overlayBoardRef.current && adminSubTab === 'OVERLAY_EDITOR' && editorTool === 'DRAW_POLYGON') {
      const rect = overlayBoardRef.current.getBoundingClientRect();
      const rawX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const rawY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

      const useStraight = e.shiftKey || shiftStraightMode || isShiftKeyPressed;
      if (useStraight && polygonDraftPoints.length > 0) {
        const lastPt = polygonDraftPoints[polygonDraftPoints.length - 1];
        const constrained = constrainPointToStraightLine(lastPt, rawX, rawY);
        setCursorBoardPct({ xPct: constrained.xPct, yPct: constrained.yPct });
        setActiveSnapGuides([
          {
            x1: lastPt.xPct,
            y1: lastPt.yPct,
            x2: constrained.xPct,
            y2: constrained.yPct,
            label: `⇧ Garis Lurus (${constrained.angleDeg}°)`,
            snapPoint: { xPct: constrained.xPct, yPct: constrained.yPct },
          },
        ]);
      } else {
        const snapped = snapCoordinateToExistingBlocks(rawX, rawY);
        setCursorBoardPct({ xPct: snapped.xPct, yPct: snapped.yPct });
        setActiveSnapGuides(snapped.guides);
      }
    }

    if (draggingPolygonState && overlayBoardRef.current) {
      const rect = overlayBoardRef.current.getBoundingClientRect();

      // Mode 1: ROTATE_RECT — rotate rectangle smoothly around its center by dragging the top handle
      if (
        draggingPolygonState.mode === 'ROTATE_RECT' &&
        typeof draggingPolygonState.centerXPct === 'number' &&
        typeof draggingPolygonState.centerYPct === 'number'
      ) {
        const mouseXPct = ((e.clientX - rect.left) / rect.width) * 100;
        const mouseYPct = ((e.clientY - rect.top) / rect.height) * 100;
        const rawAngle =
          (Math.atan2(
            mouseYPct - draggingPolygonState.centerYPct,
            mouseXPct - draggingPolygonState.centerXPct
          ) *
            180) /
            Math.PI +
          90;
        let normalizedDeg = Math.round(((rawAngle + 180) % 360 + 360) % 360 - 180);
        if (snapToGrid || e.shiftKey) {
          normalizedDeg = Math.round(normalizedDeg / 5) * 5;
        }
        const deltaDeg = normalizedDeg - (draggingPolygonState.initialRotationDeg || 0);
        const nextPoints = rotatePointsAroundCenter(
          draggingPolygonState.initialPoints,
          draggingPolygonState.centerXPct,
          draggingPolygonState.centerYPct,
          deltaDeg
        );
        const bounds = getPolygonBoundsAndCenter(nextPoints);
        setDefaultDrawRotationDeg(normalizedDeg);
        updateKavlingOverlayCoords(draggingPolygonState.lotId, {
          x: Math.round((bounds.xPct / 100) * 1920),
          y: Math.round((bounds.yPct / 100) * 1080),
          width: Math.round((bounds.widthPct / 100) * 1920),
          height: Math.round((bounds.heightPct / 100) * 1080),
          xPct: bounds.xPct,
          yPct: bounds.yPct,
          widthPct: bounds.widthPct,
          heightPct: bounds.heightPct,
          rotationDeg: normalizedDeg,
          shape: 'RECT',
          points: nextPoints,
        });
        return;
      }

      const deltaXPct = ((e.clientX - draggingPolygonState.startMouseX) / rect.width) * 100;
      const deltaYPct = ((e.clientY - draggingPolygonState.startMouseY) / rect.height) * 100;
      const step = snapToGrid ? 0.5 : 0.05;

      let nextPoints: { xPct: number; yPct: number }[] = [];
      if (
        draggingPolygonState.mode === 'MOVE_VERTEX' &&
        typeof draggingPolygonState.vertexIndex === 'number'
      ) {
        // Uniformly scale the House Icon around its center when dragging any of its 4 yellow corner handles!
        const initPts = draggingPolygonState.initialPoints;
        const initBounds = getPolygonBoundsAndCenter(initPts);
        const cx = draggingPolygonState.centerXPct ?? initBounds.centerX;
        const cy = draggingPolygonState.centerYPct ?? initBounds.centerY;
        const mouseXPct = ((e.clientX - rect.left) / rect.width) * 100;
        const mouseYPct = ((e.clientY - rect.top) / rect.height) * 100;
        const radialDist = Math.hypot(mouseXPct - cx, mouseYPct - cy);
        const newSizePct = Number(
          Math.max(1.4, Math.min(9.0, radialDist * 1.42)).toFixed(2)
        );
        const rotDeg =
          draggingPolygonState.initialRotationDeg ?? getRectAngleDegFromPoints(initPts, 0);
        nextPoints = computeRotatedRectPoints(cx, cy, newSizePct, newSizePct, rotDeg);
        setDefaultHouseSizePct(newSizePct);
        updateKavlingOverlayCoords(draggingPolygonState.lotId, {
          x: Math.round(((cx - newSizePct / 2) / 100) * 1920),
          y: Math.round(((cy - newSizePct / 2) / 100) * 1080),
          width: Math.round((newSizePct / 100) * 1920),
          height: Math.round((newSizePct / 100) * 1080),
          xPct: Number((cx - newSizePct / 2).toFixed(2)),
          yPct: Number((cy - newSizePct / 2).toFixed(2)),
          widthPct: newSizePct,
          heightPct: newSizePct,
          rotationDeg: rotDeg,
          shape: 'RECT',
          points: nextPoints,
        });
        return;
      } else {
        const rawMovedPoints = draggingPolygonState.initialPoints.map((pt) => {
          const nx = Math.max(0, Math.min(100, pt.xPct + deltaXPct));
          const ny = Math.max(0, Math.min(100, pt.yPct + deltaYPct));
          return {
            xPct: Number((Math.round(nx / step) * step).toFixed(2)),
            yPct: Number((Math.round(ny / step) * step).toFixed(2)),
          };
        });
        const snappedMove = snapRectanglePointsToBlocks(
          rawMovedPoints,
          draggingPolygonState.lotId
        );
        nextPoints = snappedMove.points;
        setActiveSnapGuides(snappedMove.guides);
      }

      const bounds = getPolygonBoundsAndCenter(nextPoints);
      updateKavlingOverlayCoords(draggingPolygonState.lotId, {
        x: Math.round((bounds.xPct / 100) * 1920),
        y: Math.round((bounds.yPct / 100) * 1080),
        width: Math.round((bounds.widthPct / 100) * 1920),
        height: Math.round((bounds.heightPct / 100) * 1080),
        xPct: bounds.xPct,
        yPct: bounds.yPct,
        widthPct: bounds.widthPct,
        heightPct: bounds.heightPct,
        rotationDeg: draggingPolygonState.initialRotationDeg,
        shape: 'RECT',
        points: nextPoints,
      });
      return;
    }

    if (drawingRect && overlayBoardRef.current) {
      const rect = overlayBoardRef.current.getBoundingClientRect();
      const rawX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const rawY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

      // Snap the dragged end-corner first, then also check full-rectangle edge/center snapping against existing blocks
      const snappedEnd = snapCoordinateToExistingBlocks(rawX, rawY);
      const minX = Math.min(drawingRect.startXPct, snappedEnd.xPct);
      const minY = Math.min(drawingRect.startYPct, snappedEnd.yPct);
      const wPct = Math.max(1.8, Math.abs(snappedEnd.xPct - drawingRect.startXPct));
      const hPct = Math.max(1.8, Math.abs(snappedEnd.yPct - drawingRect.startYPct));
      const cx = minX + wPct / 2;
      const cy = minY + hPct / 2;
      const candidatePts = computeRotatedRectPoints(
        cx,
        cy,
        wPct,
        hPct,
        defaultDrawRotationDeg || 0
      );
      const snappedRect = snapRectanglePointsToBlocks(candidatePts);
      setActiveSnapGuides(
        snappedRect.guides.length > 0 ? snappedRect.guides : snappedEnd.guides
      );

      setDrawingRect((prev) =>
        prev
          ? {
              ...prev,
              currentXPct: snappedEnd.xPct,
              currentYPct: snappedEnd.yPct,
              snappedPoints: snappedRect.points,
            }
          : null
      );
      return;
    }

    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
    }
  };

  const handleBoardMouseUp = () => {
    setActiveSnapGuides([]);
    if (draggingPolygonState) {
      setDraggingPolygonState(null);
    }
    if (drawingRect) {
      const dragW = Math.abs(drawingRect.currentXPct - drawingRect.startXPct);
      const dragH = Math.abs(drawingRect.currentYPct - drawingRect.startYPct);
      const finalSnappedPoints = drawingRect.snappedPoints;
      setDrawingRect(null);

      // Ignore accidental tiny clicks (< 0.8% drag distance) so it never duplicates automatically!
      if (dragW < 0.8 && dragH < 0.8) {
        return;
      }

      const xPct = Number(Math.min(drawingRect.startXPct, drawingRect.currentXPct).toFixed(2));
      const yPct = Number(Math.min(drawingRect.startYPct, drawingRect.currentYPct).toFixed(2));
      const widthPct = Number(Math.max(1.8, dragW).toFixed(2));
      const heightPct = Number(Math.max(1.8, dragH).toFixed(2));

      // Create the rotatable rectangle directly on canvas (using snapped coordinates if magnetized to an existing block!)
      createInstantRotatableRect(xPct, yPct, widthPct, heightPct, finalSnappedPoints);
    }
    setIsPanning(false);
  };

  // Explicit Save All Polygons to Firestore button handler
  const handleManualSaveToFirestore = async () => {
    const polygonsPayload = drawnPolygonLots.map((k) => ({
      id: `poly-${k.code}`,
      nomor: k.code,
      blok: k.block,
      points: (k.mapCoords?.points || []).map((pt) => ({
        x: Math.round((pt.xPct / 100) * 1920),
        y: Math.round((pt.yPct / 100) * 1080),
        xPct: pt.xPct,
        yPct: pt.yPct,
      })),
      tipe: k.type.replace('Tipe ', ''),
      luasTanah: 91,
      luasBangunan: k.buildingSize || 36,
      harga: k.price,
      status: k.status.toLowerCase().replace(/\s+/g, '_') as
        | 'tersedia'
        | 'booking'
        | 'proses_kpr'
        | 'akad'
        | 'terjual'
        | 'serah_terima',
      konsumen: k.buyerName || '',
      progress: k.progress,
      catatan: k.pengawasNotes || '',
      color: getLotColorHex(k),
    }));

    await syncSiteplanMasterToFirestore({
      projectId: projSlug,
      nama: isBahagiaLand ? 'Bahagia Land' : 'Bahagia Residence',
      backgroundImage: originalSitePlanImg,
      imageWidth: 1920,
      imageHeight: 1080,
      polygons: polygonsPayload,
      updatedBy: currentUser?.email || 'superadmin@bahagia.com',
    });

    toast.success(
      `💾 ${polygonsPayload.length} Polygon Kavling ${activeProjectName} berhasil disimpan ke Firestore (siteplans/${projSlug})!`
    );
  };

  const handleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      mapContainerRef.current.requestFullscreen().catch(() => {
        toast.info('Gunakan tombol Zoom In (+) untuk memperbesar peta site plan');
      });
    }
  };

  // Export Kavling Data (CSV / JSON)
  const handleExportKavlingCsv = () => {
    const headers = [
      'ID',
      'Proyek',
      'Blok',
      'Nomor',
      'Kode',
      'Tipe',
      'Luas Tanah',
      'Luas Bangunan',
      'Harga',
      'HPP',
      'Status',
      'Progress(%)',
      'Konsumen',
      'Bank',
      'Jumlah Titik Polygon',
    ];
    const rows = projectLots.map((l) => {
      const ptsCount = l.mapCoords?.points?.length || 0;
      return [
        l.id,
        `"${l.projectName}"`,
        l.block,
        l.number,
        l.code,
        `"${l.type}"`,
        `"${l.landSize}"`,
        l.buildingSize || 36,
        l.price,
        l.hpp,
        l.status,
        l.progress,
        `"${l.buyerName || '-'}"`,
        l.bank || '-',
        ptsCount,
      ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-kavling-${activeProjectName.toLowerCase().replace(/\s+/g, '-')}.csv`;
    a.click();
    toast.success(`📤 Data ${projectLots.length} kavling berhasil diekspor ke CSV/Excel!`);
  };

  // Block summary breakdown
  const blockSummaries = availableBlocks.map((blk) => {
    const lotsInBlock = projectLots.filter((l) => l.block === blk);
    const avail = lotsInBlock.filter((l) => l.status === 'Tersedia').length;
    const booked = lotsInBlock.filter(
      (l) => l.status === 'Booking' || l.status === 'Proses KPR'
    ).length;
    const sold = lotsInBlock.filter(
      (l) => l.status === 'Terjual' || l.status === 'Akad' || l.status === 'Serah Terima'
    ).length;

    let colorBadge = 'bg-emerald-100 text-emerald-900 border-emerald-400';
    let colorName = `${lotsInBlock.length} Unit`;

    if (isBahagiaLand) {
      if (blk === 'A') {
        colorBadge = 'bg-amber-100 text-amber-900 border-amber-400';
        colorName = `Kuning (${lotsInBlock.length} Unit)`;
      } else if (blk === 'B') {
        colorBadge = 'bg-purple-100 text-purple-900 border-purple-400';
        colorName = `Ungu (${lotsInBlock.length} Unit)`;
      } else if (blk === 'C') {
        colorBadge = 'bg-sky-100 text-sky-900 border-sky-400';
        colorName = `Biru (${lotsInBlock.length} Unit)`;
      } else if (blk === 'D') {
        colorBadge = 'bg-rose-100 text-rose-900 border-rose-400';
        colorName = `Merah (${lotsInBlock.length} Unit)`;
      }
    }

    return {
      block: blk,
      total: lotsInBlock.length,
      range: `Blok ${blk}-01 s/d ${blk}-${String(lotsInBlock.length).padStart(2, '0')}`,
      avail,
      booked,
      sold,
      colorBadge,
      colorName,
    };
  });

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 space-y-6 shadow-2xs">
      {/* =====================================================================
          HEADER & PROJECT SWITCHER
      ===================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="font-mono font-bold text-emerald-700">
              <EditableText
                textKey="web.siteplan.kicker"
                fallback="SITE PLAN INTERAKTIF (GAMBAR PNG ASLI + MANUAL POLYGON OVERLAY)"
                category="Website"
                location="Site Plan - Label Kicker Atas"
              />
            </span>
            <span>·</span>
            <span className="font-mono">{activeSitePlanConfig.sourceFileName}</span>
            <span>·</span>
            <span>{stats.drawnCount} Polygon Digambar</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            {isSuperAdmin && adminSubTab === 'OVERLAY_EDITOR' ? (
              `SITE PLAN EDITOR — ${activeProjectName.toUpperCase()}`
            ) : (
              <EditableText
                textKey={`web.siteplan.${projSlug}.title`}
                fallback={`Site Plan Interaktif — ${activeProjectName} (${stats.total} Unit)`}
                category="Website"
                location={`Site Plan ${activeProjectName} - Judul`}
              />
            )}
          </h3>
          <p className="text-xs text-gray-500">
            <EditableText
              textKey={`web.siteplan.${projSlug}.subtitle`}
              fallback={
                isBahagiaLand
                  ? 'PT Tata Bahagia Land · Jl. Anawai, Kel. Anawai, Kec. Wua-wua, Kota Kendari · Background Asli: "bahagia land.png"'
                  : 'PT Bahagia Prima Property · Jl. Gersamata, Kec. Ranomeeto, Kab. Konawe Selatan · Background Asli: "bahagia residence.png"'
              }
              category="Website"
              location={`Site Plan ${activeProjectName} - Subjudul Lokasi`}
            />
          </p>
        </div>

        {/* Project Switcher Dropdown & Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-600">
              <EditableText
                textKey="web.siteplan.lbl_proyek"
                fallback="Proyek:"
                category="Website"
                location="Site Plan - Label Dropdown Proyek"
              />
            </span>
            <select
              value={activeProjectName}
              onChange={(e) => {
                setActiveProjectName(e.target.value);
                setSelectedBlock('ALL');
                setPolygonDraftPoints([]);
                setSelectedEditorLotId(null);
                setZoomLevel(1);
                setPanOffset({ x: 0, y: 0 });
              }}
              className="px-3.5 py-2 text-xs font-bold rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-950 cursor-pointer"
            >
              {syncedProjects
                .filter(
                  (p) => p.publishStatus === 'Published' || p.projectName === activeProjectName
                )
                .map((proj) => (
                  <option key={proj.id} value={proj.projectName}>
                    {proj.projectName.replace('Perumahan ', '')}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* =====================================================================
          SUPER ADMIN CONTROL TABS (HANYA TAMPIL UNTUK SUPER ADMIN / EDITABLE)
      ===================================================================== */}
      {isSuperAdmin && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-mono font-bold text-emerald-800 uppercase">
                SUPER ADMIN — HOUSE ICON STAMP EDITOR (TEMPEL IKON RUMAH + NOMOR UNIT)
              </span>
              <p className="text-xs text-gray-600">
                Tidak perlu menggambar manual! Cukup <strong>1x Klik</strong> pada gambar Site Plan untuk menempelkan <strong>Ikon Rumah + Nomor Unit</strong>. Ukuran ikon bisa diperkecil/diperbesar dan sudut kemiringannya bisa diputar bebas.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <label className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>[📤 Upload Gambar PNG Asli]</span>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleSitePlanFileUpload(
                        file,
                        activeSitePlanConfig.projectId,
                        activeProjectName,
                        isBahagiaLand ? 'PT_TBL' : 'PT_BPP'
                      );
                    }
                  }}
                />
              </label>
              <button
                type="button"
                onClick={handleManualSaveToFirestore}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>[💾 Simpan ke Firestore]</span>
              </button>
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>[🔄 Reset Semua]</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-emerald-200/70">
            <button
              type="button"
              onClick={() => setAdminSubTab('OVERLAY_EDITOR')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                adminSubTab === 'OVERLAY_EDITOR'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>1. Site Plan Editor (Tempel Ikon Rumah + Nomor Unit)</span>
            </button>
            <button
              type="button"
              onClick={() => setAdminSubTab('VIEW_INTERACTIVE')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                adminSubTab === 'VIEW_INTERACTIVE'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>2. Preview Web Publik Interaktif</span>
            </button>
            <button
              type="button"
              onClick={() => setAdminSubTab('SITE_PLAN_UPLOAD')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                adminSubTab === 'SITE_PLAN_UPLOAD'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>3. Ganti Background PNG & Warna Status</span>
            </button>
            <button
              type="button"
              onClick={() => setAdminSubTab('KAVLING_TABLE')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                adminSubTab === 'KAVLING_TABLE'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>4. Tabel Data Kavling ({projectLots.length} Unit)</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: ADMIN UPLOAD / UBAH SITE PLAN & KONTROL WARNA STATUS
      ===================================================================== */}
      {isSuperAdmin && adminSubTab === 'SITE_PLAN_UPLOAD' && (
        <div className="space-y-6 bg-gray-50 border border-gray-200 rounded-2xl p-5">
          <div>
            <h4 className="text-base font-bold text-gray-900">
              Manajemen File Gambar PNG Asli Site Plan ("bahagia land.png" & "bahagia residence.png")
            </h4>
            <p className="text-xs text-gray-500">
              Upload file PNG asli Anda agar ditampilkan 100% apa adanya sebagai background Canvas Editor & Website Publik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sitePlanConfigs.map((cfg) => {
              const isCfgResidence = cfg.projectName.toLowerCase().includes('residence');
              const cfgImg =
                (isCfgResidence && !isBahagiaLand && idbHighResBg) ||
                (!isCfgResidence && isBahagiaLand && idbHighResBg)
                  ? idbHighResBg
                  : cfg.imageUrl;

              return (
                <div
                  key={cfg.projectId}
                  className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-emerald-700">
                        {cfg.companyId} · FILE BACKGROUND ASLI
                      </span>
                      <h5 className="text-base font-bold text-gray-900">
                        {cfg.projectName} — Site Plan
                      </h5>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveProjectName(cfg.projectName);
                        setAdminSubTab('OVERLAY_EDITOR');
                      }}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      [✏️ Buka Canvas Editor]
                    </button>
                  </div>

                  <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-100 h-56 flex items-center justify-center">
                    <img
                      src={
                        cfgImg ||
                        cfg.imageUrl ||
                        cfg.defaultImageUrl ||
                        (isCfgResidence
                          ? ASSETS.sitePlanBahagiaResidence
                          : ASSETS.sitePlanBahagiaLand)
                      }
                      alt={cfg.projectName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <div>
                      <span className="text-gray-500 block">File Sumber Aktif</span>
                      <span className="font-mono font-semibold text-gray-900 truncate block">
                        {cfg.sourceFileName}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Resolusi & Ukuran</span>
                      <span className="font-mono font-semibold text-gray-900">
                        {cfg.resolution} · {cfg.fileSizeText}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewSitePlanUrl(cfgImg || cfg.imageUrl)}
                      className="px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-800 cursor-pointer flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>[👁️ Preview Penuh]</span>
                    </button>

                    <label className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>[📤 Upload PNG Asli]</span>
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleSitePlanFileUpload(
                              file,
                              cfg.projectId,
                              cfg.projectName,
                              cfg.companyId
                            );
                          }
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={async () => {
                        const slug = isCfgResidence ? 'bahagia-residence' : 'bahagia-land';
                        await saveHighResImageToIdb(`siteplan_bg_${slug}`, '');
                        if (slug === projSlug) setIdbHighResBg(null);
                        resetSitePlanImageToDefault(cfg.projectId);
                        toast.success(`🔄 Gambar Site Plan ${cfg.projectName} di-reset ke default`);
                      }}
                      className="px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 cursor-pointer"
                    >
                      [🔄 Reset Gambar]
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Kustomisasi Warna Status Overlay Kavling */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
            <div>
              <h5 className="text-sm font-bold text-gray-900">
                Warna Status Polygon Kavling (Transparan 40% di Atas Gambar PNG)
              </h5>
              <p className="text-xs text-gray-500">
                🟢 Tersedia (#22C55E) · 🟡 Booking (#EAB308) · 🟠 Proses KPR (#F97316) · 🔵 Akad (#3B82F6) · 🔴 Terjual (#EF4444)
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {(
                [
                  'Tersedia',
                  'Booking',
                  'Proses KPR',
                  'Akad',
                  'Terjual',
                  'Serah Terima',
                ] as const
              ).map((stKey) => {
                const currentHex =
                  activeSitePlanConfig.statusColors?.[stKey] ||
                  DEFAULT_SITE_PLAN_STATUS_COLORS[stKey];
                return (
                  <div
                    key={stKey}
                    className="p-3 rounded-xl border border-gray-200 bg-gray-50 flex flex-col justify-between gap-2"
                  >
                    <span className="text-xs font-bold text-gray-800">{stKey}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentHex}
                        onChange={(e) =>
                          updateSitePlanStatusColors(activeSitePlanConfig.projectId, {
                            [stKey]: e.target.value,
                          })
                        }
                        className="w-8 h-8 rounded cursor-pointer border border-gray-300"
                      />
                      <span className="font-mono text-xs text-gray-600">{currentHex}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          RINGKASAN BLOK & FILTER BAR
      ===================================================================== */}
      {adminSubTab !== 'SITE_PLAN_UPLOAD' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {blockSummaries.map((b) => (
              <button
                key={b.block}
                type="button"
                onClick={() => setSelectedBlock(selectedBlock === b.block ? 'ALL' : b.block)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedBlock === b.block
                    ? 'ring-2 ring-emerald-600 bg-emerald-50/40 border-emerald-400'
                    : 'bg-gray-50/70 hover:bg-gray-100/80 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${b.colorBadge}`}>
                    BLOK {b.block}
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-gray-600">
                    {b.colorName}
                  </span>
                </div>
                <div className="mt-2.5 flex items-baseline justify-between">
                  <div>
                    <div className="text-sm font-bold text-gray-900 font-mono">{b.range}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      Tersedia: <strong className="text-emerald-700">{b.avail}</strong> · Booking:{' '}
                      <strong className="text-amber-700">{b.booked}</strong> · Terjual:{' '}
                      <strong className="text-red-700">{b.sold}</strong>
                    </div>
                  </div>
                  <span className="text-lg font-mono font-extrabold text-gray-900 tabular-nums">
                    {b.total}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* TOOLBAR FILTER BLOK, STATUS & ZOOM CONTROLS */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              {adminSubTab === 'VIEW_INTERACTIVE' && (
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setPublicViewMode('ORIGINAL_OVERLAY')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      publicViewMode === 'ORIGINAL_OVERLAY'
                        ? 'bg-emerald-700 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Gambar PNG Asli + Polygon ({drawnPolygonLots.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPublicViewMode('GRID_MATRIX')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      publicViewMode === 'GRID_MATRIX'
                        ? 'bg-emerald-700 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Daftar Nomor Unit ({filteredLots.length})</span>
                  </button>
                </div>
              )}

              {/* Filter Blok Buttons */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedBlock('ALL')}
                  className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${
                    selectedBlock === 'ALL'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Semua ({stats.total})
                </button>
                {availableBlocks.map((blk) => (
                  <button
                    key={blk}
                    type="button"
                    onClick={() => setSelectedBlock(blk)}
                    className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${
                      selectedBlock === blk
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Blok {blk}
                  </button>
                ))}
              </div>

              {/* Filter Status Dropdown */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 font-semibold"
              >
                <option value="ALL">Semua Status ({stats.total})</option>
                <option value="Tersedia">🟢 Tersedia ({stats.tersedia})</option>
                <option value="Booking">🟡 Booking ({stats.booking})</option>
                <option value="Proses KPR">🟠 Proses KPR ({stats.prosesKpr})</option>
                <option value="Terjual">🔴 Terjual / Akad ({stats.terjual})</option>
                <option value="Serah Terima">🟣 Serah Terima ({stats.serahTerima})</option>
              </select>
            </div>

            {/* Zoom & Fullscreen Controls */}
            {adminSubTab !== 'KAVLING_TABLE' && publicViewMode === 'ORIGINAL_OVERLAY' && (
              <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2 py-1">
                <button
                  type="button"
                  onClick={() =>
                    setZoomLevel((z) => {
                      const next = Math.max(0.8, Number((z - 0.25).toFixed(2)));
                      if (next <= 1) setPanOffset({ x: 0, y: 0 });
                      return next;
                    })
                  }
                  title="Zoom Out (-)"
                  className="p-1 text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono font-bold px-1.5 text-gray-800 tabular-nums">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(3.5, Number((z + 0.25).toFixed(2))))}
                  title="Zoom In (+)"
                  className="p-1 text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setZoomLevel(1);
                    setPanOffset({ x: 0, y: 0 });
                  }}
                  title="Fit Screen (100%)"
                  className="px-1.5 py-0.5 text-[11px] font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  [Fit]
                </button>
                <button
                  type="button"
                  onClick={handleFullscreen}
                  title="Fullscreen Site Plan"
                  className="p-1 text-emerald-700 hover:text-emerald-900 cursor-pointer border-l border-gray-200 pl-2"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* =====================================================================
          TUGAS 1 & 3: CANVAS EDITOR MANUAL (ADMIN) & INTERACTIVE SITE PLAN (PUBLIK)
      ===================================================================== */}
      {(adminSubTab === 'VIEW_INTERACTIVE' || adminSubTab === 'OVERLAY_EDITOR') &&
        publicViewMode === 'ORIGINAL_OVERLAY' && (
          <div className="space-y-4">
            {/* TOOLBAR CANVAS EDITOR RECTANGLE BISA DIPUTAR (ROTATABLE RECTANGLE) */}
            {isSuperAdmin && adminSubTab === 'OVERLAY_EDITOR' && (
              <div className="bg-gray-900 text-white p-4 rounded-xl space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-emerald-400">TOOLS EDITOR:</span>

                    <button
                      type="button"
                      onClick={() => {
                        setEditorTool('PLACE_HOUSE_ICON');
                        setPolygonDraftPoints([]);
                        toast.info(
                          'Mode Tempel Ikon Rumah: Cukup 1x klik pada gambar Site Plan untuk menaruh Ikon Rumah + Nomor Unit!'
                        );
                      }}
                      className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer ${
                        editorTool === 'PLACE_HOUSE_ICON'
                          ? 'bg-amber-500 text-gray-950 shadow-xs'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <Home className="w-3.5 h-3.5" />
                      <span>
                        [🏠 Tempel Ikon Rumah{' '}
                        {defaultDrawRotationDeg !== 0 ? `(${defaultDrawRotationDeg}°)` : ''}]
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditorTool('SELECT_MOVE');
                        setPolygonDraftPoints([]);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer ${
                        editorTool === 'SELECT_MOVE'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <MousePointer className="w-3.5 h-3.5" />
                      <span>[👆 Pilih / Geser / Putar]</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditorTool('DELETE_TOOL');
                        setPolygonDraftPoints([]);
                        toast.info('Klik pada ikon rumah kavling mana saja untuk menghapusnya');
                      }}
                      className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer ${
                        editorTool === 'DELETE_TOOL'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>[🗑️ Hapus]</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditorTool('PAN_TOOL');
                        setPolygonDraftPoints([]);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer ${
                        editorTool === 'PAN_TOOL'
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <Hand className="w-3.5 h-3.5" />
                      <span>[🖐️ Geser Canvas]</span>
                    </button>

                    {/* Kontrol Ukuran Ikon Rumah (Perkecil / Perbesar) */}
                    <div className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1">
                      <Home className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[11px] text-gray-300">Ukuran Ikon:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const cur = selectedEditorLot
                            ? selectedEditorLot.mapCoords?.widthPct || defaultHouseSizePct
                            : defaultHouseSizePct;
                          const next = Number(Math.max(1.4, cur - 0.3).toFixed(2));
                          setDefaultHouseSizePct(next);
                          if (selectedEditorLot) applyLotHouseSize(selectedEditorLot, next);
                        }}
                        title="Perkecil Ikon Rumah"
                        className="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 rounded text-[11px] font-bold text-white cursor-pointer"
                      >
                        − Kecil
                      </button>
                      <input
                        type="range"
                        min={1.4}
                        max={8.0}
                        step={0.2}
                        value={
                          selectedEditorLot
                            ? selectedEditorLot.mapCoords?.widthPct || defaultHouseSizePct
                            : defaultHouseSizePct
                        }
                        onChange={(e) => {
                          const val = Number(e.target.value) || 3.2;
                          setDefaultHouseSizePct(val);
                          if (selectedEditorLot) {
                            applyLotHouseSize(selectedEditorLot, val);
                          }
                        }}
                        className="w-20 accent-emerald-500 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const cur = selectedEditorLot
                            ? selectedEditorLot.mapCoords?.widthPct || defaultHouseSizePct
                            : defaultHouseSizePct;
                          const next = Number(Math.min(9.0, cur + 0.3).toFixed(2));
                          setDefaultHouseSizePct(next);
                          if (selectedEditorLot) applyLotHouseSize(selectedEditorLot, next);
                        }}
                        title="Perbesar Ikon Rumah"
                        className="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 rounded text-[11px] font-bold text-white cursor-pointer"
                      >
                        + Besar
                      </button>
                      <span className="font-mono text-[11px] font-bold text-emerald-300">
                        {(selectedEditorLot
                          ? selectedEditorLot.mapCoords?.widthPct || defaultHouseSizePct
                          : defaultHouseSizePct
                        ).toFixed(1)}
                        %
                      </span>
                    </div>

                    {/* Kontrol Kemiringan / Sudut Ikon Rumah */}
                    <div className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1">
                      <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[11px] text-gray-300">Kemiringan:</span>
                      <input
                        type="number"
                        min={-180}
                        max={180}
                        value={
                          selectedEditorLot
                            ? selectedEditorLot.mapCoords?.rotationDeg ??
                              getRectAngleDegFromPoints(
                                selectedEditorLot.mapCoords?.points || [],
                                0
                              )
                            : defaultDrawRotationDeg
                        }
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setDefaultDrawRotationDeg(val);
                          if (selectedEditorLot) {
                            applyLotRotationAngle(selectedEditorLot, val);
                          }
                        }}
                        className="w-14 bg-gray-900 border border-gray-600 rounded px-1.5 py-0.5 text-center font-mono font-bold text-amber-300"
                      />
                      <span className="text-gray-400">°</span>
                      <button
                        type="button"
                        onClick={() => {
                          const cur = selectedEditorLot
                            ? selectedEditorLot.mapCoords?.rotationDeg ??
                              getRectAngleDegFromPoints(
                                selectedEditorLot.mapCoords?.points || [],
                                0
                              )
                            : defaultDrawRotationDeg;
                          const next = cur - 5;
                          setDefaultDrawRotationDeg(next);
                          if (selectedEditorLot) applyLotRotationAngle(selectedEditorLot, next);
                        }}
                        title="Putar Kiri -5°"
                        className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 rounded text-[10px] font-mono cursor-pointer"
                      >
                        -5°
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const cur = selectedEditorLot
                            ? selectedEditorLot.mapCoords?.rotationDeg ??
                              getRectAngleDegFromPoints(
                                selectedEditorLot.mapCoords?.points || [],
                                0
                              )
                            : defaultDrawRotationDeg;
                          const next = cur + 5;
                          setDefaultDrawRotationDeg(next);
                          if (selectedEditorLot) applyLotRotationAngle(selectedEditorLot, next);
                        }}
                        title="Putar Kanan +5°"
                        className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 rounded text-[10px] font-mono cursor-pointer"
                      >
                        +5°
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDefaultDrawRotationDeg(0);
                          if (selectedEditorLot) applyLotRotationAngle(selectedEditorLot, 0);
                        }}
                        title="Reset Kemiringan 0°"
                        className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 rounded text-[10px] font-mono cursor-pointer"
                      >
                        0°
                      </button>
                    </div>
                  </div>

                    {selectedEditorLot && (
                      <div className="flex flex-wrap items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
                        <span className="font-mono font-bold text-amber-300">
                          Terpilih: 🏠 {selectedEditorLot.code} (
                          {selectedEditorLot.mapCoords?.rotationDeg ??
                            getRectAngleDegFromPoints(
                              selectedEditorLot.mapCoords?.points || [],
                              0
                            )}
                          °)
                        </span>
                        <button
                          type="button"
                          onClick={() => openLotEditorModal(selectedEditorLot)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold cursor-pointer"
                        >
                          ✏️ Detail Kavling
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const pts = selectedEditorLot.mapCoords?.points;
                            if (pts && pts.length >= 3) {
                              const rot =
                                selectedEditorLot.mapCoords?.rotationDeg ??
                                getRectAngleDegFromPoints(pts, 0);
                              const sizePct =
                                selectedEditorLot.mapCoords?.widthPct || defaultHouseSizePct;
                              const stepX =
                                pts.length >= 2 ? pts[1].xPct - pts[0].xPct : sizePct;
                              const stepY =
                                pts.length >= 2 ? pts[1].yPct - pts[0].yPct : 0;
                              const shifted = pts.map((pt) => ({
                                xPct: Number(Math.max(0.5, Math.min(99, pt.xPct + stepX)).toFixed(2)),
                                yPct: Number(Math.max(0.5, Math.min(99, pt.yPct + stepY)).toFixed(2)),
                              }));
                              const bounds = getPolygonBoundsAndCenter(shifted);
                              createInstantRotatableRect(
                                Number((bounds.centerX - sizePct / 2).toFixed(2)),
                                Number((bounds.centerY - sizePct / 2).toFixed(2)),
                                sizePct,
                                sizePct,
                                shifted
                              );
                              setDefaultDrawRotationDeg(rot);
                            }
                          }}
                          className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded font-bold cursor-pointer flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>+ Gandakan di Sebelahnya</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateKavlingOverlayCoords(selectedEditorLot.id, {
                              x: 0,
                              y: 0,
                              width: 0,
                              height: 0,
                              points: [],
                            });
                            setSelectedEditorLotId(null);
                            toast.success(`🗑️ Ikon Rumah ${selectedEditorLot.code} dihapus`);
                          }}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold cursor-pointer"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-800 text-[11px] text-gray-300">
                    <div>
                      💡 <strong>Cara Pakai Ikon Rumah:</strong> Cukup <strong>1x Klik</strong> di atas gambar Site Plan untuk menempelkan <strong>Ikon Rumah + Nomor Unit</strong>. Anda bisa langsung mengatur <strong>Ukuran Ikon (− Kecil / + Besar)</strong> atau <strong>Kemiringan (°)</strong> di toolbar, maupun menarik langsung <strong>bulatan hijau</strong> (putar) dan <strong>titik kuning</strong> (perbesar/perkecil) pada ikon rumah!
                    </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer bg-emerald-950/80 border border-emerald-600/60 px-2.5 py-1 rounded-lg text-emerald-300 font-semibold">
                      <input
                        type="checkbox"
                        checked={snapToBlocks}
                        onChange={(e) => setSnapToBlocks(e.target.checked)}
                        className="accent-emerald-500"
                      />
                      <span>🧲 Snap Tepi & Tengah Blok</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showEditorGrid}
                        onChange={(e) => setShowEditorGrid(e.target.checked)}
                        className="accent-emerald-500"
                      />
                      <span>Garis Bantu Grid</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={snapToGrid}
                        onChange={(e) => setSnapToGrid(e.target.checked)}
                        className="accent-emerald-500"
                      />
                      <span>Snap Sudut 5° & Grid</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* LAYOUT WORKSPACE: CANVAS UTAMA (KIRI) + PANEL DAFTAR RECTANGLE (KANAN SAAT MODE EDITOR) */}
            <div
              className={`grid grid-cols-1 ${
                isSuperAdmin && adminSubTab === 'OVERLAY_EDITOR' ? 'xl:grid-cols-4' : ''
              } gap-4 items-start`}
            >
              {/* KANVAS UTAMA: GAMBAR PNG ASLI SEBAGAI BACKGROUND + SVG ROTATABLE RECTANGLE OVERLAY DI ATASNYA */}
              <div
                ref={mapContainerRef}
                onMouseDown={handleBoardMouseDown}
                onMouseMove={handleBoardMouseMove}
                onMouseUp={handleBoardMouseUp}
                onMouseLeave={() => {
                  handleBoardMouseUp();
                  setCursorBoardPct(null);
                }}
                className={`${
                  isSuperAdmin && adminSubTab === 'OVERLAY_EDITOR' ? 'xl:col-span-3' : ''
                } relative bg-gray-900 border-2 border-gray-300 rounded-2xl overflow-auto shadow-inner select-none ${
                  adminSubTab === 'OVERLAY_EDITOR' &&
                  (editorTool === 'DRAW_RECT' || editorTool === 'DRAW_POLYGON')
                    ? 'cursor-crosshair'
                    : editorTool === 'PAN_TOOL'
                    ? 'cursor-grab'
                    : ''
                }`}
              >
                <div
                  ref={overlayBoardRef}
                  className="relative min-w-[860px] w-full mx-auto transition-transform origin-top-left"
                  style={{
                    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                  }}
                >
                  {/* 1. GAMBAR ASLI SITE PLAN PNG ("bahagia land.png" / "bahagia residence.png") APA ADANYA */}
                  <img
                    src={originalSitePlanImg}
                    alt={`Gambar Asli Site Plan ${activeProjectName}`}
                    referrerPolicy="no-referrer"
                    draggable={false}
                    className="w-full h-auto block object-contain pointer-events-none"
                  />

                  {/* 2. GARIS BANTU GRID (OPSIONAL) */}
                  {((adminSubTab === 'OVERLAY_EDITOR' && showEditorGrid) ||
                    activeSitePlanConfig.showGridOnPublic) && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundImage:
                          'linear-gradient(to right, rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.22) 1px, transparent 1px)',
                        backgroundSize: '2.5% 2.5%',
                      }}
                    />
                  )}

                  {/* 3. SVG OVERLAY UNTUK MERENDER SEMUA IKON RUMAH + NOMOR UNIT KAVLING */}
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="absolute inset-0 w-full h-full z-20"
                  >
                    {drawnPolygonLots.map((lot) => {
                      const pts = getLotPolygonPoints(lot);
                      if (!pts) return null;

                      const isFilteredOut =
                        (selectedBlock !== 'ALL' && lot.block !== selectedBlock) ||
                        (selectedStatus !== 'ALL' &&
                          !(
                            (selectedStatus === 'Booking' &&
                              (lot.status === 'Booking' || lot.status === 'Proses KPR')) ||
                            (selectedStatus === 'Terjual' &&
                              (lot.status === 'Terjual' || lot.status === 'Akad')) ||
                            lot.status === selectedStatus
                          ));

                      const baseHex = getLotColorHex(lot);
                      const isHovered = hoveredLot?.id === lot.id;
                      const isEditorSelected = selectedEditorLotId === lot.id;
                      const center = getPolygonBoundsAndCenter(pts);
                      const lotRotDeg =
                        lot.mapCoords?.rotationDeg ?? getRectAngleDegFromPoints(pts, 0);

                      // Ukuran Ikon Rumah (dapat diperkecil / diperbesar)
                      const houseW = Math.max(
                        1.4,
                        Math.min(9.0, lot.mapCoords?.widthPct || center.widthPct || 3.2)
                      );
                      const houseH = houseW;
                      const hw = houseW / 2;
                      const hh = houseH / 2;

                      // Siluet Ikon Rumah (Atap Segitiga + Badan Rumah) dalam koordinat lokal terhadap titik tengah (0,0)
                      const houseShapeLocalPts = [
                        `0,${(-hh).toFixed(2)}`, // Puncak atap
                        `${(hw * 1.06).toFixed(2)},${(-hh * 0.12).toFixed(2)}`, // Sayap atap kanan
                        `${(hw * 0.84).toFixed(2)},${(-hh * 0.12).toFixed(2)}`, // Dinding atas kanan
                        `${(hw * 0.84).toFixed(2)},${hh.toFixed(2)}`, // Sudut kanan bawah
                        `${(-hw * 0.84).toFixed(2)},${hh.toFixed(2)}`, // Sudut kiri bawah
                        `${(-hw * 0.84).toFixed(2)},${(-hh * 0.12).toFixed(2)}`, // Dinding atas kiri
                        `${(-hw * 1.06).toFixed(2)},${(-hh * 0.12).toFixed(2)}`, // Sayap atap kiri
                      ].join(' ');

                      const roofOnlyLocalPts = [
                        `0,${(-hh).toFixed(2)}`,
                        `${(hw * 1.06).toFixed(2)},${(-hh * 0.12).toFixed(2)}`,
                        `${(-hw * 1.06).toFixed(2)},${(-hh * 0.12).toFixed(2)}`,
                      ].join(' ');

                      // Top-edge midpoint and outward rotation handle coordinates
                      const rotRad = (lotRotDeg * Math.PI) / 180;
                      const topMidX = Number((center.centerX + Math.sin(rotRad) * hh).toFixed(2));
                      const topMidY = Number((center.centerY - Math.cos(rotRad) * hh).toFixed(2));
                      const rotHandleX = Number(
                        Math.max(
                          0.5,
                          Math.min(99.5, center.centerX + Math.sin(rotRad) * (hh + 1.85))
                        ).toFixed(2)
                      );
                      const rotHandleY = Number(
                        Math.max(
                          0.5,
                          Math.min(99.5, center.centerY - Math.cos(rotRad) * (hh + 1.85))
                        ).toFixed(2)
                      );

                      const handleCorners = computeRotatedRectPoints(
                        center.centerX,
                        center.centerY,
                        houseW,
                        houseH,
                        lotRotDeg
                      );

                      return (
                        <g
                          key={lot.id}
                          style={{ opacity: isFilteredOut ? 0.18 : 1 }}
                          className={
                            adminSubTab === 'OVERLAY_EDITOR'
                              ? editorTool === 'SELECT_MOVE' || editorTool === 'PLACE_HOUSE_ICON'
                                ? 'cursor-move'
                                : editorTool === 'DELETE_TOOL'
                                ? 'cursor-pointer'
                                : ''
                              : 'cursor-pointer'
                          }
                        >
                          {/* Grup Ikon Rumah + Nomor Unit yang berputar mengikuti kemiringan */}
                          <g
                            transform={`translate(${center.centerX}, ${center.centerY}) rotate(${lotRotDeg})`}
                            onMouseDown={(e) =>
                              handlePolygonMouseDown(e, lot, 'MOVE_POLYGON')
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              if (adminSubTab === 'OVERLAY_EDITOR') {
                                setSelectedEditorLotId(lot.id);
                              } else {
                                setSelectedLot(lot);
                              }
                            }}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              if (isSuperAdmin) {
                                openLotEditorModal(lot);
                              }
                            }}
                            onMouseEnter={() => setHoveredLot(lot)}
                            onMouseLeave={() => setHoveredLot(null)}
                          >
                            {/* Badan & Atap Ikon Rumah */}
                            <polygon
                              points={houseShapeLocalPts}
                              fill={hexToRgba(
                                baseHex,
                                isHovered || isEditorSelected ? 0.92 : 0.82
                              )}
                              stroke={isHovered || isEditorSelected ? '#FFFFFF' : '#0F172A'}
                              strokeWidth={isHovered || isEditorSelected ? '0.32' : '0.2'}
                              strokeLinejoin="round"
                            />
                            {/* Aksen Atap Segitiga */}
                            <polygon
                              points={roofOnlyLocalPts}
                              fill="rgba(15, 23, 42, 0.28)"
                              stroke="none"
                            />
                            {/* Garis Bawah Atap */}
                            <line
                              x1={-hw * 0.84}
                              y1={-hh * 0.12}
                              x2={hw * 0.84}
                              y2={-hh * 0.12}
                              stroke="rgba(255,255,255,0.55)"
                              strokeWidth="0.14"
                            />

                            {/* Nomor Unit Kavling di Dalam Badan Ikon Rumah */}
                            <text
                              x={0}
                              y={hh * 0.42}
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill="#FFFFFF"
                              fontSize={Math.max(0.72, houseW * 0.34).toFixed(2)}
                              fontWeight="900"
                              fontFamily="monospace"
                              style={{
                                paintOrder: 'stroke',
                                stroke: '#0F172A',
                                strokeWidth: `${Math.max(0.22, houseW * 0.09).toFixed(2)}px`,
                                pointerEvents: 'none',
                                userSelect: 'none',
                              }}
                            >
                              {lot.code}
                            </text>
                          </g>

                          {/* Gagang Putar Kemiringan (Bulatan Hijau) + 4 Titik Sudut Skala (Kuning) Saat Ikon Rumah Terpilih */}
                          {adminSubTab === 'OVERLAY_EDITOR' &&
                            editorTool !== 'DELETE_TOOL' &&
                            editorTool !== 'PAN_TOOL' &&
                            isEditorSelected && (
                              <>
                                {/* Garis & Gagang Putar Kemiringan (Rotation Handle) */}
                                <line
                                  x1={topMidX}
                                  y1={topMidY}
                                  x2={rotHandleX}
                                  y2={rotHandleY}
                                  stroke="#10B981"
                                  strokeWidth="0.32"
                                />
                                <circle
                                  cx={rotHandleX}
                                  cy={rotHandleY}
                                  r="0.95"
                                  fill="#10B981"
                                  stroke="#FFFFFF"
                                  strokeWidth="0.28"
                                  className="cursor-grab"
                                  onMouseDown={(e) =>
                                    handlePolygonMouseDown(e, lot, 'ROTATE_RECT')
                                  }
                                />

                                {/* 4 Titik Sudut untuk Memperkecil / Memperbesar Ikon Rumah */}
                                {handleCorners.map((pt, vIdx) => (
                                  <rect
                                    key={vIdx}
                                    x={pt.xPct - 0.55}
                                    y={pt.yPct - 0.55}
                                    width="1.1"
                                    height="1.1"
                                    fill="#F59E0B"
                                    stroke="#FFFFFF"
                                    strokeWidth="0.22"
                                    transform={`rotate(${lotRotDeg}, ${pt.xPct}, ${pt.yPct})`}
                                    className="cursor-nwse-resize"
                                    onMouseDown={(e) =>
                                      handlePolygonMouseDown(e, lot, 'MOVE_VERTEX', vIdx)
                                    }
                                  />
                                ))}
                              </>
                            )}
                        </g>
                      );
                    })}

                    {/* 4. PREVIEW HANTU (GHOST PREVIEW) IKON RUMAH MENGIKUTI KURSOR SAAT MODE TEMPEL IKON */}
                    {adminSubTab === 'OVERLAY_EDITOR' &&
                      editorTool === 'PLACE_HOUSE_ICON' &&
                      cursorBoardPct &&
                      !draggingPolygonState &&
                      (() => {
                        const hw = (defaultHouseSizePct || 3.2) / 2;
                        const hh = hw;
                        const ghostLocalPts = [
                          `0,${(-hh).toFixed(2)}`,
                          `${(hw * 1.06).toFixed(2)},${(-hh * 0.12).toFixed(2)}`,
                          `${(hw * 0.84).toFixed(2)},${(-hh * 0.12).toFixed(2)}`,
                          `${(hw * 0.84).toFixed(2)},${hh.toFixed(2)}`,
                          `${(-hw * 0.84).toFixed(2)},${hh.toFixed(2)}`,
                          `${(-hw * 0.84).toFixed(2)},${(-hh * 0.12).toFixed(2)}`,
                          `${(-hw * 1.06).toFixed(2)},${(-hh * 0.12).toFixed(2)}`,
                        ].join(' ');
                        const nextUnmapped = projectLots.find(
                          (l) => !l.mapCoords?.points || l.mapCoords.points.length < 3
                        );
                        const previewLabel =
                          nextUnmapped?.code ||
                          `${selectedBlock !== 'ALL' ? selectedBlock : 'A'}-${String(
                            projectLots.length + 1
                          ).padStart(2, '0')}`;
                        return (
                          <g
                            transform={`translate(${cursorBoardPct.xPct}, ${cursorBoardPct.yPct}) rotate(${defaultDrawRotationDeg})`}
                            className="pointer-events-none"
                            style={{ opacity: 0.72 }}
                          >
                            <polygon
                              points={ghostLocalPts}
                              fill="rgba(16, 185, 129, 0.75)"
                              stroke="#FFFFFF"
                              strokeWidth="0.28"
                              strokeDasharray="0.4,0.25"
                            />
                            <text
                              x={0}
                              y={hh * 0.42}
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill="#FFFFFF"
                              fontSize={Math.max(0.72, (defaultHouseSizePct || 3.2) * 0.34).toFixed(
                                2
                              )}
                              fontWeight="900"
                              fontFamily="monospace"
                              style={{
                                paintOrder: 'stroke',
                                stroke: '#0F172A',
                                strokeWidth: '0.25px',
                              }}
                            >
                              {previewLabel}
                            </text>
                          </g>
                        );
                      })()}

                    {/* 4. PREVIEW POLYGON YANG SEDANG DIGAMBAR (TITIK-PER-TITIK + GARIS KARET SHIFT LURUS) */}
                    {polygonDraftPoints.length > 0 && (
                      <g className="pointer-events-none">
                        {/* Area bayangan polygon jika sudah >= 2 titik + kursor */}
                        {polygonDraftPoints.length >= 2 && cursorBoardPct && (
                          <polygon
                            points={[...polygonDraftPoints, cursorBoardPct]
                              .map((p) => `${p.xPct},${p.yPct}`)
                              .join(' ')}
                            fill="rgba(245, 158, 11, 0.25)"
                          />
                        )}

                        {/* Garis antar titik yang sudah diklik */}
                        {polygonDraftPoints.length >= 2 && (
                          <polyline
                            points={polygonDraftPoints
                              .map((p) => `${p.xPct},${p.yPct}`)
                              .join(' ')}
                            fill="none"
                            stroke="#F59E0B"
                            strokeWidth="0.4"
                          />
                        )}

                        {/* Garis karet (rubber-band line) dari titik terakhir ke posisi kursor (Hijau/Cyan saat Shift Lurus aktif!) */}
                        {cursorBoardPct && (
                          <line
                            x1={polygonDraftPoints[polygonDraftPoints.length - 1].xPct}
                            y1={polygonDraftPoints[polygonDraftPoints.length - 1].yPct}
                            x2={cursorBoardPct.xPct}
                            y2={cursorBoardPct.yPct}
                            stroke={
                              shiftStraightMode || isShiftKeyPressed ? '#06B6D4' : '#FBBF24'
                            }
                            strokeWidth="0.38"
                            strokeDasharray="0.55,0.35"
                          />
                        )}

                        {/* Titik-titik sudut polygon yang sudah ditempatkan */}
                        {polygonDraftPoints.map((pt, idx) => {
                          const isFirst = idx === 0;
                          const canClose = isFirst && polygonDraftPoints.length >= 3;
                          return (
                            <circle
                              key={idx}
                              cx={pt.xPct}
                              cy={pt.yPct}
                              r={canClose ? '1.15' : '0.7'}
                              fill={canClose ? '#10B981' : '#F59E0B'}
                              stroke="#FFFFFF"
                              strokeWidth="0.28"
                            />
                          );
                        })}

                        {/* Indikator titik kursor saat ini */}
                        {cursorBoardPct && (
                          <circle
                            cx={cursorBoardPct.xPct}
                            cy={cursorBoardPct.yPct}
                            r="0.65"
                            fill={shiftStraightMode || isShiftKeyPressed ? '#06B6D4' : '#FFFFFF'}
                            stroke="#0F172A"
                            strokeWidth="0.22"
                          />
                        )}
                      </g>
                    )}

                    {/* 4B. PREVIEW RECTANGLE YANG SEDANG DITARIK (FALLBACK) */}
                    {drawingRect &&
                      Math.abs(drawingRect.currentXPct - drawingRect.startXPct) >= 0.8 &&
                      Math.abs(drawingRect.currentYPct - drawingRect.startYPct) >= 0.8 &&
                      (() => {
                        const xPct = Math.min(drawingRect.startXPct, drawingRect.currentXPct);
                        const yPct = Math.min(drawingRect.startYPct, drawingRect.currentYPct);
                        const wPct = Math.max(
                          1.8,
                          Math.abs(drawingRect.currentXPct - drawingRect.startXPct)
                        );
                        const hPct = Math.max(
                          1.8,
                          Math.abs(drawingRect.currentYPct - drawingRect.startYPct)
                        );
                        const cx = xPct + wPct / 2;
                        const cy = yPct + hPct / 2;
                        const previewPts =
                          drawingRect.snappedPoints && drawingRect.snappedPoints.length >= 3
                            ? drawingRect.snappedPoints
                            : computeRotatedRectPoints(
                                cx,
                                cy,
                                wPct,
                                hPct,
                                defaultDrawRotationDeg
                              );
                        return (
                          <g className="pointer-events-none">
                            <polygon
                              points={previewPts.map((p) => `${p.xPct},${p.yPct}`).join(' ')}
                              fill="rgba(245, 158, 11, 0.38)"
                              stroke="#F59E0B"
                              strokeWidth="0.35"
                              strokeDasharray="0.6,0.4"
                            />
                            {previewPts.map((pt, idx) => (
                              <rect
                                key={idx}
                                x={pt.xPct - 0.5}
                                y={pt.yPct - 0.5}
                                width="1.0"
                                height="1.0"
                                fill="#FFFFFF"
                                stroke="#0F172A"
                                strokeWidth="0.2"
                              />
                            ))}
                          </g>
                        );
                      })()}

                    {/* 5. GARIS BANTU MAGNETIC SNAP (CYAN ALIGNMENT GUIDES & SNAP INDICATOR) */}
                    {activeSnapGuides.length > 0 && (
                      <g className="pointer-events-none">
                        {activeSnapGuides.map((g, idx) => (
                          <g key={idx}>
                            <line
                              x1={g.x1}
                              y1={g.y1}
                              x2={g.x2}
                              y2={g.y2}
                              stroke="#06B6D4"
                              strokeWidth="0.38"
                              strokeDasharray="0.5,0.3"
                            />
                            {g.snapPoint && (
                              <circle
                                cx={g.snapPoint.xPct}
                                cy={g.snapPoint.yPct}
                                r="0.9"
                                fill="#06B6D4"
                                stroke="#FFFFFF"
                                strokeWidth="0.25"
                              />
                            )}
                            {g.label && (
                              <text
                                x={(g.x1 + g.x2) / 2}
                                y={Math.max(2, (g.y1 + g.y2) / 2 - 1.1)}
                                textAnchor="middle"
                                fill="#22D3EE"
                                fontSize="1.05"
                                fontWeight="800"
                                fontFamily="monospace"
                                style={{
                                  paintOrder: 'stroke',
                                  stroke: '#0F172A',
                                  strokeWidth: '0.35px',
                                }}
                              >
                                {g.label}
                              </text>
                            )}
                          </g>
                        ))}
                      </g>
                    )}
                  </svg>
                </div>

                {/* Tooltip Hover Kavling di Kiri Bawah Gambar Site Plan */}
                {hoveredLot && (
                  <div className="sticky bottom-3 left-3 z-30 inline-flex flex-wrap items-center gap-2.5 bg-gray-900/95 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs border border-gray-700 m-3 pointer-events-none">
                    <span className="font-mono font-extrabold text-emerald-400 text-sm">
                      Kavling {hoveredLot.code}
                    </span>
                    <span>·</span>
                    <span>Blok {hoveredLot.block}</span>
                    <span>·</span>
                    <span className="font-bold text-amber-300">{hoveredLot.status}</span>
                    <span>·</span>
                    <span>{hoveredLot.type}</span>
                    <span>·</span>
                    <span>Luas {hoveredLot.landSize}</span>
                    <span>·</span>
                    <span className="font-mono font-bold text-white">
                      {formatRupiah(hoveredLot.price)}
                    </span>
                    <span>·</span>
                    <span className="text-emerald-300 font-semibold">
                      {adminSubTab === 'OVERLAY_EDITOR'
                        ? 'Drag untuk geser · Bulatan hijau atas untuk putar sudut · Double-klik untuk edit'
                        : 'Klik untuk detail & Booking'}
                    </span>
                  </div>
                )}
              </div>

              {/* PANEL KANAN: DAFTAR IKON RUMAH KAVLING */}
              {isSuperAdmin && adminSubTab === 'OVERLAY_EDITOR' && (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3 max-h-[680px] flex flex-col">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
                    <div>
                      <h5 className="text-xs font-extrabold text-gray-900 uppercase font-mono">
                        DAFTAR IKON RUMAH ({drawnPolygonLots.length}/{stats.total})
                      </h5>
                      <p className="text-[11px] text-gray-500">
                        Klik kavling untuk atur ukuran / kemiringan
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditorTool('PLACE_HOUSE_ICON');
                        toast.info(
                          'Silakan klik langsung di atas gambar Site Plan untuk menaruh Ikon Rumah + Nomor Unit!'
                        );
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                    >
                      + Ikon Rumah
                    </button>
                  </div>

                  {drawnPolygonLots.length === 0 ? (
                    <div className="p-4 bg-white border border-dashed border-gray-300 rounded-xl text-center space-y-2 text-xs text-gray-600">
                      <Home className="w-6 h-6 text-emerald-600 mx-auto" />
                      <div className="font-bold text-gray-900">
                        Belum Ada Ikon Rumah Ditempatkan
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        Cukup <strong>1x Klik</strong> pada gambar Site Plan di samping untuk menempelkan <strong>Ikon Rumah + Nomor Unit</strong>.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-y-auto space-y-1.5 pr-1 flex-1">
                      {drawnPolygonLots.map((lot) => {
                        const isSel = selectedEditorLotId === lot.id;
                        const cHex = getLotColorHex(lot);
                        return (
                          <div
                            key={lot.id}
                            onClick={() => setSelectedEditorLotId(lot.id)}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 cursor-pointer transition-all ${
                              isSel
                                ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500'
                                : 'bg-white border-gray-200 hover:bg-gray-100/70'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="w-3 h-3 rounded-full shrink-0 border border-gray-400"
                                style={{ backgroundColor: cHex }}
                              />
                              <div className="truncate">
                                <span className="font-mono font-bold text-gray-900">
                                  {lot.code}
                                </span>
                                <span className="text-[11px] text-gray-500 ml-1.5">
                                  ({lot.status})
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openLotEditorModal(lot);
                                }}
                                title="Edit Data Kavling"
                                className="p-1 text-gray-600 hover:text-emerald-700 rounded cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateKavlingOverlayCoords(lot.id, {
                                    x: 0,
                                    y: 0,
                                    width: 0,
                                    height: 0,
                                    points: [],
                                  });
                                  if (selectedEditorLotId === lot.id) setSelectedEditorLotId(null);
                                  toast.success(`🗑️ Polygon ${lot.code} dihapus`);
                                }}
                                title="Hapus Polygon"
                                className="p-1 text-gray-500 hover:text-red-600 rounded cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Quick Unmapped Kavling List so Admin knows which units still need polygons */}
                  <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-600">
                    <span>Total Terdaftar: {stats.total} Unit</span>
                    <span className="font-mono font-bold text-emerald-700">
                      Tergambar: {drawnPolygonLots.length}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* LEGENDA STATUS & WARNA OVERLAY */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-700 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                {(
                  [
                    { key: 'Tersedia', label: `🟢 Tersedia (${stats.tersedia})` },
                    { key: 'Booking', label: `🟡 Booking (${stats.booking})` },
                    { key: 'Proses KPR', label: `🟠 Proses KPR (${stats.prosesKpr})` },
                    { key: 'Terjual', label: `🔴 Terjual / Akad (${stats.terjual})` },
                    { key: 'Serah Terima', label: `🟣 Serah Terima (${stats.serahTerima})` },
                  ] as const
                ).map((item) => {
                  const cHex =
                    activeSitePlanConfig.statusColors?.[item.key] ||
                    DEFAULT_SITE_PLAN_STATUS_COLORS[item.key];
                  return (
                    <span key={item.key} className="flex items-center gap-1.5 font-semibold">
                      <span
                        className="w-3.5 h-3.5 rounded-xs inline-block border border-gray-400"
                        style={{ backgroundColor: cHex }}
                      />
                      <span>{item.label}</span>
                    </span>
                  );
                })}
              </div>
              <span className="font-mono tabular-nums text-gray-600 font-semibold">
                Background Asli: {activeSitePlanConfig.sourceFileName}
              </span>
            </div>
          </div>
        )}

      {/* =====================================================================
          MATRIKS DAFTAR NOMOR KAVLING (GRID VIEW)
      ===================================================================== */}
      {adminSubTab === 'VIEW_INTERACTIVE' && publicViewMode === 'GRID_MATRIX' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 lg:grid-cols-11 gap-2.5">
            {filteredLots.map((lot) => {
              const cHex = getLotColorHex(lot);
              return (
                <button
                  key={lot.id}
                  type="button"
                  onClick={() => setSelectedLot(lot)}
                  style={{
                    backgroundColor: hexToRgba(cHex, 0.14),
                    borderColor: hexToRgba(cHex, 0.65),
                  }}
                  className="p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between h-22 hover:scale-[1.03]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-gray-900 tabular-nums">
                      {lot.code}
                    </span>
                    {lot.pjtVerified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    )}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-gray-800 truncate">{lot.status}</div>
                    <div className="text-[10px] font-mono text-gray-600">
                      Prog: {lot.progress}%
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: TABEL CRUD KAVLING, BULK ACTION & EXPORT/IMPORT
      ===================================================================== */}
      {isSuperAdmin && adminSubTab === 'KAVLING_TABLE' && (
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari kode kavling, konsumen, status..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg bg-white w-60"
                />
              </div>
              <button
                type="button"
                onClick={() => openLotEditorModal()}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
              >
                [+ Tambah 1 Kavling]
              </button>
              <button
                type="button"
                onClick={() => setShowBulkGenerateModal(true)}
                className="px-3.5 py-2 bg-white border border-emerald-300 text-emerald-800 font-bold rounded-lg cursor-pointer"
              >
                [+ Tambah Banyak Sekaligus]
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportKavlingCsv}
                className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>Export CSV / Excel ({projectLots.length})</span>
              </button>
            </div>
          </div>

          {selectedTableIds.length > 0 && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-bold text-amber-950">
                ☑️ {selectedTableIds.length} Kavling Dipilih:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={bulkActionStatus}
                  onChange={(e) => setBulkActionStatus(e.target.value as KavlingLot['status'])}
                  className="border border-amber-300 rounded-lg px-2.5 py-1.5 bg-white font-semibold"
                >
                  <option value="Tersedia">Set Status: Tersedia</option>
                  <option value="Booking">Set Status: Booking</option>
                  <option value="Proses KPR">Set Status: Proses KPR</option>
                  <option value="Terjual">Set Status: Terjual</option>
                  <option value="Serah Terima">Set Status: Serah Terima</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    bulkUpdateKavlingLots(selectedTableIds, { status: bulkActionStatus });
                    toast.success(
                      `✅ Status ${selectedTableIds.length} kavling diubah ke ${bulkActionStatus}`
                    );
                    setSelectedTableIds([]);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg cursor-pointer"
                >
                  Terapkan Status
                </button>

                <input
                  type="number"
                  placeholder="Harga Baru (Rp)..."
                  value={bulkActionPrice}
                  onChange={(e) => setBulkActionPrice(e.target.value)}
                  className="border border-amber-300 rounded-lg px-2.5 py-1.5 bg-white w-36 font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    const p = Number(bulkActionPrice);
                    if (!p || p <= 0) {
                      toast.error('Masukkan nominal harga baru yang valid');
                      return;
                    }
                    bulkUpdateKavlingLots(selectedTableIds, { price: p });
                    toast.success(
                      `✅ Harga ${selectedTableIds.length} kavling diubah ke ${formatRupiah(p)}`
                    );
                    setBulkActionPrice('');
                    setSelectedTableIds([]);
                  }}
                  className="px-3 py-1.5 bg-gray-900 text-white font-bold rounded-lg cursor-pointer"
                >
                  Ubah Harga Massal
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto border border-gray-200 rounded-xl max-h-[520px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3">
                    <input
                      type="checkbox"
                      checked={
                        filteredLots.length > 0 &&
                        selectedTableIds.length === filteredLots.length
                      }
                      onChange={(e) =>
                        setSelectedTableIds(
                          e.target.checked ? filteredLots.map((l) => l.id) : []
                        )
                      }
                      className="accent-emerald-600"
                    />
                  </th>
                  <th className="py-2.5 px-2">Kode</th>
                  <th className="py-2.5 px-2">Blok</th>
                  <th className="py-2.5 px-2">Tipe & Luas</th>
                  <th className="py-2.5 px-2">Harga Jual</th>
                  <th className="py-2.5 px-2">Status</th>
                  <th className="py-2.5 px-2">Progress</th>
                  <th className="py-2.5 px-2">Konsumen</th>
                  <th className="py-2.5 px-2">Status Polygon</th>
                  <th className="py-2.5 px-3 text-right">Aksi CRUD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLots.map((lot) => {
                  const pts = getLotPolygonPoints(lot);
                  const checked = selectedTableIds.includes(lot.id);
                  return (
                    <tr key={lot.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setSelectedTableIds((prev) =>
                              e.target.checked
                                ? [...prev, lot.id]
                                : prev.filter((id) => id !== lot.id)
                            )
                          }
                          className="accent-emerald-600"
                        />
                      </td>
                      <td className="py-2.5 px-2 font-mono font-bold text-gray-900">{lot.code}</td>
                      <td className="py-2.5 px-2 font-semibold">Blok {lot.block}</td>
                      <td className="py-2.5 px-2">
                        <div>{lot.type}</div>
                        <div className="text-[11px] text-gray-500">{lot.landSize}</div>
                      </td>
                      <td className="py-2.5 px-2 font-mono font-semibold text-emerald-700 tabular-nums">
                        {formatRupiah(lot.price)}
                      </td>
                      <td className="py-2.5 px-2">
                        <select
                          value={lot.status}
                          onChange={(e) => {
                            updateKavlingStatusAndProgress(
                              lot.id,
                              e.target.value as KavlingLot['status'],
                              lot.progress
                            );
                            toast.success(`Status ${lot.code} diubah ke ${e.target.value}`);
                          }}
                          className="border border-gray-300 rounded px-2 py-1 bg-white font-semibold text-[11px]"
                        >
                          <option value="Tersedia">🟢 Tersedia</option>
                          <option value="Booking">🟡 Booking</option>
                          <option value="Proses KPR">🟠 Proses KPR</option>
                          <option value="Akad">🔵 Akad</option>
                          <option value="Terjual">🔴 Terjual</option>
                          <option value="Serah Terima">🟣 Serah Terima</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-2 font-mono tabular-nums">{lot.progress}%</td>
                      <td className="py-2.5 px-2">
                        {lot.buyerName ? (
                          <span className="font-semibold text-gray-900">{lot.buyerName}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 font-mono text-[11px]">
                        {pts ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">
                            ✓ {pts.length} Titik
                          </span>
                        ) : (
                          <span className="text-gray-400">Belum Digambar</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap space-x-1">
                        <button
                          type="button"
                          onClick={() => openLotEditorModal(lot)}
                          className="px-2.5 py-1 border border-gray-300 bg-white hover:bg-gray-100 rounded font-semibold cursor-pointer"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEditorLotId(lot.id);
                            setAdminSubTab('OVERLAY_EDITOR');
                          }}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-semibold cursor-pointer"
                        >
                          📍 Canvas
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          TUGAS 3.2: POPUP DETAIL KAVLING ( SAAT KAVLING DIKLIK DI WEB PUBLIK )
      ===================================================================== */}
      {selectedLot && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setSelectedLot(null)}
        >
          <div
            className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-emerald-700">
                    {selectedLot.projectName}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-mono text-[11px]">
                    Blok {selectedLot.block} · No. {String(selectedLot.number).padStart(2, '0')}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mt-0.5">
                  🏠 KAVLING {selectedLot.code} — {selectedLot.projectName.replace('Perumahan ', '')}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLot(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedLot.photos && selectedLot.photos[0] && (
              <img
                src={selectedLot.photos[0]}
                alt={`Kavling ${selectedLot.code}`}
                referrerPolicy="no-referrer"
                className="w-full h-44 object-cover rounded-xl border border-gray-200"
              />
            )}

            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <span className="text-gray-500 block">Blok / Nomor</span>
                <span className="font-mono font-bold text-gray-900">
                  Blok {selectedLot.block} / No. {String(selectedLot.number).padStart(2, '0')}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Tipe & Luas Bangunan</span>
                <span className="font-semibold text-gray-900">
                  {selectedLot.type} ({selectedLot.buildingSize || 36} m²)
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Luas Tanah</span>
                <span className="font-semibold text-gray-900">{selectedLot.landSize}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Harga</span>
                <span className="font-mono font-bold text-emerald-700 text-sm tabular-nums">
                  {formatRupiah(selectedLot.price)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Status</span>
                <span className="font-bold text-gray-900">
                  {selectedLot.status === 'Tersedia'
                    ? '🟢 TERSEDIA'
                    : selectedLot.status === 'Booking'
                    ? '🟡 BOOKING'
                    : selectedLot.status === 'Proses KPR'
                    ? '🟠 PROSES KPR'
                    : '🔴 TERJUAL'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Progress Pembangunan</span>
                <span className="font-mono font-semibold text-gray-900 tabular-nums">
                  {selectedLot.progress}%
                </span>
              </div>
              <div className="col-span-2">
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full transition-all"
                    style={{ width: `${selectedLot.progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    const lotToEdit = selectedLot;
                    setSelectedLot(null);
                    openLotEditorModal(lotToEdit);
                  }}
                  className="px-3.5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  ✏️ Edit Kavling (Admin)
                </button>
              )}

              <div className="flex flex-wrap items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    const id = selectedLot.id;
                    setSelectedLot(null);
                    navigate(`/unit/${id}`);
                  }}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  [Lihat Detail Lengkap]
                </button>

                {selectedLot.status === 'Tersedia' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const id = selectedLot.id;
                      setSelectedLot(null);
                      navigate(`/booking?kavling=${id}`);
                    }}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>[Booking Unit Ini →]</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="px-3.5 py-2 bg-gray-100 text-gray-500 rounded-xl text-xs font-semibold">
                    Unit Sudah {selectedLot.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TUGAS 1.4: POPUP FORM DATA KAVLING SETELAH POLYGON SELESAI DIGAMBAR
      ===================================================================== */}
      {showLotFormModal && editingLotForm && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowLotFormModal(false)}
        >
          <form
            onSubmit={handleSaveLotForm}
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-gray-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl text-xs my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[11px] font-mono font-bold text-emerald-700">
                  DATA KAVLING & RECTANGLE BLOK PERUMAHAN
                </span>
                <h4 className="text-base font-bold text-gray-900">
                  Rectangle Kavling — {editingLotForm.code} ({editingLotForm.projectName.replace('Perumahan ', '')})
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowLotFormModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* KONTROL SUDUT PUTAR RECTANGLE & GENERATOR DERET BLOK PERUMAHAN */}
            <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono font-bold text-emerald-900 flex items-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5 text-emerald-700" />
                  <span>PENGATURAN SUDUT PUTAR RECTANGLE & DERET BLOK</span>
                </span>
                <span className="font-mono text-[11px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  Sudut Saat Ini: {editingLotForm.rotationDeg}°
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">
                    Putar Sudut Kemiringan (-180° s/d 180°)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      step={1}
                      value={editingLotForm.rotationDeg}
                      onChange={(e) => {
                        const deg = Number(e.target.value);
                        const cx = editingLotForm.xPct + editingLotForm.widthPct / 2;
                        const cy = editingLotForm.yPct + editingLotForm.heightPct / 2;
                        const nextPts = computeRotatedRectPoints(
                          cx,
                          cy,
                          editingLotForm.widthPct,
                          editingLotForm.heightPct,
                          deg
                        );
                        setEditingLotForm({
                          ...editingLotForm,
                          rotationDeg: deg,
                          points: nextPts,
                        });
                      }}
                      className="flex-1 accent-emerald-600 cursor-pointer"
                    />
                    <input
                      type="number"
                      min={-180}
                      max={180}
                      value={editingLotForm.rotationDeg}
                      onChange={(e) => {
                        const deg = Number(e.target.value) || 0;
                        const cx = editingLotForm.xPct + editingLotForm.widthPct / 2;
                        const cy = editingLotForm.yPct + editingLotForm.heightPct / 2;
                        const nextPts = computeRotatedRectPoints(
                          cx,
                          cy,
                          editingLotForm.widthPct,
                          editingLotForm.heightPct,
                          deg
                        );
                        setEditingLotForm({
                          ...editingLotForm,
                          rotationDeg: deg,
                          points: nextPts,
                        });
                      }}
                      className="w-16 border border-emerald-300 rounded-lg px-2 py-1 font-mono font-bold text-center bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-700 font-semibold block mb-1">
                    Buat Deret Blok Sekaligus (Jumlah Unit Berjejer)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={editingLotForm.repeatCount}
                      onChange={(e) =>
                        setEditingLotForm({
                          ...editingLotForm,
                          repeatCount: Math.max(1, Math.min(30, Number(e.target.value) || 1)),
                        })
                      }
                      className="w-20 border border-emerald-300 rounded-lg px-3 py-1.5 font-mono font-bold bg-white text-emerald-900"
                    />
                    <span className="text-[11px] text-gray-600 leading-tight">
                      {editingLotForm.repeatCount > 1
                        ? `Otomatis membuat ${editingLotForm.repeatCount} kotak berderet (${editingLotForm.code} s/d ${editingLotForm.block}-${String(editingLotForm.number + editingLotForm.repeatCount - 1).padStart(2, '0')})`
                        : '1 Unit (Isi >1 untuk langsung membuat 1 barisan blok)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-gray-600 font-semibold block mb-1">
                  Nomor Kavling Awal * (contoh: A-01)
                </label>
                <input
                  type="text"
                  required
                  value={editingLotForm.code}
                  onChange={(e) => {
                    const codeVal = e.target.value.toUpperCase();
                    const parts = codeVal.split('-');
                    const blk = parts[0] || editingLotForm.block;
                    const num = parseInt(parts[1] || '', 10) || editingLotForm.number;
                    setEditingLotForm({
                      ...editingLotForm,
                      code: codeVal,
                      block: blk,
                      number: num,
                    });
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono font-bold text-emerald-800"
                />
              </div>
              <div>
                <label className="text-gray-600 font-semibold block mb-1">Blok *</label>
                <select
                  value={editingLotForm.block}
                  onChange={(e) => {
                    const nextBlk = e.target.value;
                    setEditingLotForm({
                      ...editingLotForm,
                      block: nextBlk,
                      code: `${nextBlk}-${String(editingLotForm.number).padStart(2, '0')}`,
                    });
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white font-mono font-bold"
                >
                  <option value="A">Blok A</option>
                  <option value="B">Blok B</option>
                  <option value="C">Blok C</option>
                  <option value="D">Blok D</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-gray-600 font-semibold block mb-1">Tipe Unit</label>
                <input
                  type="text"
                  required
                  value={editingLotForm.type}
                  onChange={(e) => setEditingLotForm({ ...editingLotForm, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="text-gray-600 font-semibold block mb-1">Luas Tanah</label>
                <input
                  type="text"
                  required
                  value={editingLotForm.landSize}
                  onChange={(e) =>
                    setEditingLotForm({ ...editingLotForm, landSize: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="text-gray-600 font-semibold block mb-1">Luas Bangunan (m²)</label>
                <input
                  type="number"
                  value={editingLotForm.buildingSize}
                  onChange={(e) =>
                    setEditingLotForm({
                      ...editingLotForm,
                      buildingSize: Number(e.target.value),
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-gray-600 font-semibold block mb-1">Harga (Rp)</label>
                <input
                  type="number"
                  required
                  value={editingLotForm.price}
                  onChange={(e) =>
                    setEditingLotForm({ ...editingLotForm, price: Number(e.target.value) })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-gray-600 font-semibold block mb-1">Status *</label>
                <select
                  value={editingLotForm.status}
                  onChange={(e) =>
                    setEditingLotForm({
                      ...editingLotForm,
                      status: e.target.value as KavlingLot['status'],
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white font-bold"
                >
                  <option value="Tersedia">🟢 Tersedia</option>
                  <option value="Booking">🟡 Booking</option>
                  <option value="Proses KPR">🟠 Proses KPR</option>
                  <option value="Akad">🔵 Akad</option>
                  <option value="Terjual">🔴 Terjual</option>
                  <option value="Serah Terima">🟣 Serah Terima</option>
                </select>
              </div>
              <div>
                <label className="text-gray-600 font-semibold block mb-1">
                  Progress ({editingLotForm.progress}%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={editingLotForm.progress}
                  onChange={(e) =>
                    setEditingLotForm({ ...editingLotForm, progress: Number(e.target.value) })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-gray-600 font-semibold block mb-1">
                  Konsumen (jika sudah booking)
                </label>
                <input
                  type="text"
                  placeholder="Nama konsumen..."
                  value={editingLotForm.buyerName}
                  onChange={(e) =>
                    setEditingLotForm({ ...editingLotForm, buyerName: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="text-gray-600 font-semibold block mb-1">Catatan</label>
                <input
                  type="text"
                  placeholder="Catatan kavling..."
                  value={editingLotForm.pengawasNotes}
                  onChange={(e) =>
                    setEditingLotForm({ ...editingLotForm, pengawasNotes: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <UploadFoto
              photos={editingLotForm.photos}
              onChange={(nextPhotos) =>
                setEditingLotForm({ ...editingLotForm, photos: nextPhotos })
              }
              label="Foto Unit / Denah Kavling"
            />

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowLotFormModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl font-semibold text-gray-700 cursor-pointer"
              >
                [Batal]
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer"
              >
                [💾 Simpan Kavling]
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================================
          MODAL TAMBAH BANYAK KAVLING SEKALIGUS (BULK GENERATE)
      ===================================================================== */}
      {showBulkGenerateModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setShowBulkGenerateModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[11px] font-mono font-bold text-emerald-700">
                  BULK GENERATE DATA KAVLING
                </span>
                <h4 className="text-base font-bold text-gray-900">
                  [+ Tambah Banyak Sekaligus] — {activeProjectName}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkGenerateModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-gray-600 font-semibold block mb-1">Blok *</label>
                <input
                  type="text"
                  value={bulkGenBlock}
                  onChange={(e) => setBulkGenBlock(e.target.value.toUpperCase())}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-gray-600 font-semibold block mb-1">Dari Nomor *</label>
                <input
                  type="number"
                  min={1}
                  value={bulkGenStart}
                  onChange={(e) => setBulkGenStart(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="text-gray-600 font-semibold block mb-1">Sampai Nomor *</label>
                <input
                  type="number"
                  min={1}
                  value={bulkGenEnd}
                  onChange={(e) => setBulkGenEnd(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-600 font-semibold block mb-1">Tipe Unit</label>
                <input
                  type="text"
                  value={bulkGenType}
                  onChange={(e) => setBulkGenType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="text-gray-600 font-semibold block mb-1">Luas Tanah</label>
                <input
                  type="text"
                  value={bulkGenLandSize}
                  onChange={(e) => setBulkGenLandSize(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="text-gray-600 font-semibold block mb-1">Harga Jual (Rp)</label>
                <input
                  type="number"
                  value={bulkGenPrice}
                  onChange={(e) => setBulkGenPrice(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-gray-600 font-semibold block mb-1">Status Awal</label>
                <select
                  value={bulkGenStatus}
                  onChange={(e) => setBulkGenStatus(e.target.value as KavlingLot['status'])}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white font-semibold"
                >
                  <option value="Tersedia">🟢 Tersedia</option>
                  <option value="Booking">🟡 Booking</option>
                  <option value="Terjual">🔴 Terjual</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkGenerateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const createdCount = bulkAddKavlingRange({
                    companyId: isBahagiaLand ? 'PT_TBL' : 'PT_BPP',
                    projectName: activeProjectName,
                    block: bulkGenBlock,
                    startNum: bulkGenStart,
                    endNum: bulkGenEnd,
                    type: bulkGenType,
                    landSize: bulkGenLandSize,
                    buildingSize: bulkGenBuildingSize,
                    price: bulkGenPrice,
                    hpp: bulkGenHpp,
                    status: bulkGenStatus,
                  });
                  setShowBulkGenerateModal(false);
                  toast.success(
                    `✅ ${createdCount} kavling baru berhasil ditambahkan ke ${activeProjectName}!`
                  );
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
              >
                🚀 Tambah Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL RESET KAVLING PROYEK (DENGAN KONFIRMASI KETIK "RESET")
      ===================================================================== */}
      {showResetModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setShowResetModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-2 border-red-300 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="font-bold text-red-700 text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Reset Polygon & Kavling — {activeProjectName}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-gray-600">
              Ketik <strong className="font-mono text-red-600">RESET</strong> di bawah ini untuk memilih aksi reset pada proyek <strong>{activeProjectName}</strong>:
            </p>

            <input
              type="text"
              placeholder='Ketik "RESET" untuk mengaktifkan tombol'
              value={resetConfirmInput}
              onChange={(e) => setResetConfirmInput(e.target.value)}
              className="w-full border border-red-300 rounded-lg px-3 py-2 font-mono font-bold text-red-700"
            />

            <div className="space-y-2">
              <button
                type="button"
                disabled={resetConfirmInput !== 'RESET'}
                onClick={() => {
                  resetProjectKavlingData(activeProjectName, 'RESTORE_DEFAULT_SEED');
                  setResetConfirmInput('');
                  setShowResetModal(false);
                  toast.success(
                    `🧹 Semua polygon di kanvas ${activeProjectName} telah dibersihkan (Siap digambar manual)`
                  );
                }}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-xl cursor-pointer"
              >
                1. Bersihkan Semua Polygon di Kanvas (Mulai Gambar dari 0)
              </button>

              <button
                type="button"
                disabled={resetConfirmInput !== 'RESET'}
                onClick={() => {
                  resetProjectKavlingData(activeProjectName, 'RESET_STATUS_ONLY');
                  setResetConfirmInput('');
                  setShowResetModal(false);
                  toast.success(
                    `🔄 Semua kavling di ${activeProjectName} di-reset menjadi status "Tersedia"`
                  );
                }}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-gray-950 font-bold rounded-xl cursor-pointer"
              >
                2. Reset Semua Status ke "Tersedia" (Polygon Tetap)
              </button>

              <button
                type="button"
                disabled={resetConfirmInput !== 'RESET'}
                onClick={() => {
                  resetProjectKavlingData(activeProjectName, 'DELETE_ALL_LOTS');
                  setResetConfirmInput('');
                  setShowResetModal(false);
                  toast.success(`🗑️ Semua kavling di ${activeProjectName} telah dikosongkan`);
                }}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold rounded-xl cursor-pointer"
              >
                3. Hapus Semua Data Kavling Proyek Ini
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          LIGHTBOX PREVIEW UKURAN PENUH GAMBAR SITE PLAN
      ===================================================================== */}
      {previewSitePlanUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setPreviewSitePlanUrl(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-5xl w-full overflow-hidden shadow-2xl"
          >
            <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between">
              <span className="font-bold text-sm text-gray-900">
                Preview Resolusi Penuh Gambar Asli Site Plan
              </span>
              <button
                type="button"
                onClick={() => setPreviewSitePlanUrl(null)}
                className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-gray-950 flex justify-center max-h-[80vh] overflow-auto">
              <img
                src={previewSitePlanUrl}
                alt="Site Plan Full Preview"
                referrerPolicy="no-referrer"
                className="max-w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
