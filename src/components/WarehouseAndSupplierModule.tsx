import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  useAppStore,
  SupplierRecord,
  InventoryRecord,
  StockMovementRecord,
  SupplierBankAccount,
} from '../store/useAppStore';
import { formatRupiah as formatRp } from '../data/seedData';
import { UploadFoto } from './UploadFoto';
import { SuperAdminCrudBar } from './SuperAdminCrudBar';
import { toast } from 'sonner';
import {
  ExportActionButtons,
  exportToExcel,
  exportToPDF,
  exportToCSV,
  printHtmlReport,
} from '../utils/exportUtils';

function exportToExcelCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const dataObjs = rows.map((r) => {
    const obj: Record<string, any> = {};
    headers.forEach((h, i) => {
      obj[h] = r[i] ?? '';
    });
    return obj;
  });
  exportToExcel(dataObjs, filename, 'Data Gudang', headers);
}

function exportToPdfDocument(title: string, headers: string[], rows: (string | number)[][]) {
  const safeName = title.replace(/[^a-zA-Z0-9_-]/g, '_');
  exportToPDF(title, headers, rows, safeName);
}
import {
  Plus,
  Search,
  Edit3,
  Eye,
  Trash2,
  Phone,
  MapPin,
  Building2,
  Landmark,
  FileSpreadsheet,
  FileText,
  Printer,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  ClipboardCheck,
  MinusCircle,
  CheckCircle2,
  AlertTriangle,
  Star,
  History,
  Package,
  X,
  Upload,
} from 'lucide-react';

const BANK_OPTIONS = [
  'BCA',
  'BRI',
  'BNI',
  'Mandiri',
  'BTN',
  'BSI',
  'Bank Sultra',
  'Lainnya',
];

const SUPPLIER_CATEGORIES: SupplierRecord['category'][] = [
  'Material Toko',
  'Material Bumi',
  'Jasa',
  'Transportasi',
  'Lainnya',
];

const MATERIAL_UNITS = [
  'Sak',
  'Batang',
  'Kubik',
  'Biji',
  'Dos',
  'Lembar',
  'Kg',
  'Meter',
  'Roll',
  'Kaleng',
  'Set',
  'Unit',
];

export const WarehouseAndSupplierModule: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    currentUser,
    selectedCompanyFilter,
    suppliers,
    inventory,
    stockMovements,
    stockOpnameBatches,
    purchaseOrders,
    cashTransactions,
    kavling,
    saveSupplierFull,
    deleteSupplierSoft,
    updateSupplierProductPrice,
    recordInitialStockManual,
    recordStockInTransaction,
    recordStockOutTransaction,
    recordStockOpnameBatch,
    updateInventoryMasterInfo,
    reduceStockWithReason,
    deleteInventoryItemSoft,
    updateStockMovementEntry,
    deleteStockMovementEntry,
    bulkImportInventoryItems,
    createPurchaseOrder,
    approvePurchaseOrder,
  } = useAppStore();

  // Determine initial active view based on URL
  const isSupplierRoute = location.pathname.includes('/gudang/supplier');
  const isPurchaseOrderRoute = location.pathname.includes('/purchasing/po') || location.pathname.includes('/purchasing/invoice');
  const [activeMainTab, setActiveMainTab] = useState<'KARTU_STOK' | 'SUPPLIER' | 'PO'>(
    isSupplierRoute ? 'SUPPLIER' : isPurchaseOrderRoute ? 'PO' : 'KARTU_STOK'
  );

  // Sync tab when URL changes
  React.useEffect(() => {
    if (location.pathname.includes('/gudang/supplier')) {
      setActiveMainTab('SUPPLIER');
    } else if (
      location.pathname.includes('/gudang/stok') ||
      location.pathname.includes('/gudang/inventori') ||
      location.pathname.includes('/gudang/penerimaan') ||
      location.pathname.includes('/gudang/pengeluaran')
    ) {
      setActiveMainTab('KARTU_STOK');
    } else if (location.pathname.includes('/purchasing/po') || location.pathname.includes('/purchasing/invoice')) {
      setActiveMainTab('PO');
    }
  }, [location.pathname]);

  // ============================================================================
  // 1. STATE FOR SUPPLIER FORM (6 SECTIONS) & DETAIL (4 TABS)
  // ============================================================================
  const [supplierSearch, setSupplierSearch] = useState('');
  const [supplierCategoryFilter, setSupplierCategoryFilter] = useState<string>('ALL');
  const [supplierStatusFilter, setSupplierStatusFilter] = useState<string>('ALL');

  const [supplierFormOpen, setSupplierFormOpen] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);

  const nextSupplierCode = useMemo(() => {
    if (editingSupplierId) {
      const found = suppliers.find((s) => s.id === editingSupplierId);
      if (found) return found.code;
    }
    return `SUP-2026-${String(suppliers.length + 1).padStart(4, '0')}`;
  }, [suppliers, editingSupplierId]);

  const [supName, setSupName] = useState('');
  const [supPic, setSupPic] = useState('');
  const [supCategory, setSupCategory] = useState<SupplierRecord['category']>('Material Toko');
  const [supType, setSupType] = useState<'Perorangan' | 'PT' | 'CV' | 'UD'>('PT');
  const [supPhone, setSupPhone] = useState('');
  const [supOfficePhone, setSupOfficePhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supWebsite, setSupWebsite] = useState('');
  const [supAddress, setSupAddress] = useState('');
  const [supKelurahan, setSupKelurahan] = useState('');
  const [supKecamatan, setSupKecamatan] = useState('');
  const [supCity, setSupCity] = useState('Kota Kendari');
  const [supProvince, setSupProvince] = useState('Sulawesi Tenggara');
  const [supPostalCode, setSupPostalCode] = useState('');
  const [supLandmark, setSupLandmark] = useState('');
  const [supBankName, setSupBankName] = useState('BCA');
  const [supBankAccount, setSupBankAccount] = useState('');
  const [supBankOwner, setSupBankOwner] = useState('');
  const [supBankBranch, setSupBankBranch] = useState('');
  const [supAdditionalBanks, setSupAdditionalBanks] = useState<SupplierBankAccount[]>([]);
  const [supNpwp, setSupNpwp] = useState('');
  const [supTempoDays, setSupTempoDays] = useState(30);
  const [supCreditLimit, setSupCreditLimit] = useState(100000000);
  const [supStatus, setSupStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  const [supNotes, setSupNotes] = useState('');
  const [supRating, setSupRating] = useState(5);
  const [supLogoUrl, setSupLogoUrl] = useState('');

  // Detail Supplier Modal (4 Tabs: PROFIL | RIWAYAT_PO | RIWAYAT_PEMBAYARAN | PRODUK)
  const [selectedDetailSupplier, setSelectedDetailSupplier] = useState<SupplierRecord | null>(null);
  const [supplierDetailTab, setSupplierDetailTab] = useState<
    'PROFIL' | 'RIWAYAT_PO' | 'RIWAYAT_PEMBAYARAN' | 'PRODUK'
  >('PROFIL');
  const [poDateFilter, setPoDateFilter] = useState('');
  const [poStatusFilter, setPoStatusFilter] = useState('ALL');
  const [newProdCode, setNewProdCode] = useState('');
  const [newProdName, setNewProdName] = useState('');
  const [newProdUnit, setNewProdUnit] = useState('Sak');
  const [newProdPrice, setNewProdPrice] = useState(68000);

  const openAddSupplierModal = () => {
    setEditingSupplierId(null);
    setSupName('');
    setSupPic('');
    setSupCategory('Material Toko');
    setSupType('PT');
    setSupPhone('');
    setSupOfficePhone('');
    setSupEmail('');
    setSupWebsite('');
    setSupAddress('');
    setSupKelurahan('');
    setSupKecamatan('');
    setSupCity('Kota Kendari');
    setSupProvince('Sulawesi Tenggara');
    setSupPostalCode('');
    setSupLandmark('');
    setSupBankName('BCA');
    setSupBankAccount('');
    setSupBankOwner('');
    setSupBankBranch('');
    setSupAdditionalBanks([]);
    setSupNpwp('');
    setSupTempoDays(30);
    setSupCreditLimit(100000000);
    setSupStatus('Aktif');
    setSupNotes('');
    setSupRating(5);
    setSupLogoUrl('');
    setSupplierFormOpen(true);
  };

  const openEditSupplierModal = (sup: SupplierRecord) => {
    setEditingSupplierId(sup.id);
    setSupName(sup.name);
    setSupPic(sup.picName || '');
    setSupCategory(sup.category);
    setSupType(sup.supplierType || 'PT');
    setSupPhone(sup.phone);
    setSupOfficePhone(sup.officePhone || '');
    setSupEmail(sup.email || '');
    setSupWebsite(sup.website || '');
    setSupAddress(sup.address);
    setSupKelurahan(sup.kelurahan || '');
    setSupKecamatan(sup.kecamatan || '');
    setSupCity(sup.city || 'Kota Kendari');
    setSupProvince(sup.province || 'Sulawesi Tenggara');
    setSupPostalCode(sup.postalCode || '');
    setSupLandmark(sup.landmark || '');
    setSupBankName(sup.bankName || 'BCA');
    setSupBankAccount(sup.bankAccount || '');
    setSupBankOwner(sup.bankAccountOwner || sup.name);
    setSupBankBranch(sup.bankBranch || '');
    setSupAdditionalBanks(sup.additionalBanks || []);
    setSupNpwp(sup.npwp || '');
    setSupTempoDays(sup.tempoDays || 30);
    setSupCreditLimit(sup.creditLimit || 0);
    setSupStatus(sup.status || 'Aktif');
    setSupNotes(sup.notes || '');
    setSupRating(Math.round(sup.rating || 5));
    setSupLogoUrl(sup.logoUrl || '');
    setSupplierFormOpen(true);
  };

  const handleSaveSupplier = (keepOpenForNext: boolean) => {
    if (!supName.trim()) {
      toast.error('Nama Perusahaan Supplier wajib diisi!');
      return;
    }
    if (!supPhone.trim()) {
      toast.error('No HP / WhatsApp Supplier wajib diisi!');
      return;
    }
    if (!supAddress.trim()) {
      toast.error('Alamat Lengkap Supplier wajib diisi!');
      return;
    }
    if (!supBankName || !supBankAccount.trim() || !supBankOwner.trim()) {
      toast.error('Data Rekening Bank (Nama Bank, No Rekening, Nama Pemilik) wajib diisi!');
      return;
    }

    const saved = saveSupplierFull({
      id: editingSupplierId || undefined,
      code: nextSupplierCode,
      name: supName.trim(),
      picName: supPic.trim(),
      category: supCategory,
      supplierType: supType,
      phone: supPhone.trim(),
      officePhone: supOfficePhone.trim(),
      email: supEmail.trim(),
      website: supWebsite.trim(),
      address: supAddress.trim(),
      kelurahan: supKelurahan.trim(),
      kecamatan: supKecamatan.trim(),
      city: supCity.trim(),
      province: supProvince.trim(),
      postalCode: supPostalCode.trim(),
      landmark: supLandmark.trim(),
      bankName: supBankName,
      bankAccount: supBankAccount.trim(),
      bankAccountOwner: supBankOwner.trim(),
      bankBranch: supBankBranch.trim(),
      additionalBanks: supAdditionalBanks,
      npwp: supNpwp.trim(),
      tempoDays: Number(supTempoDays) || 30,
      creditLimit: Number(supCreditLimit) || 0,
      status: supStatus,
      notes: supNotes.trim(),
      rating: supRating,
      logoUrl: supLogoUrl,
    });

    toast.success(
      editingSupplierId
        ? `✅ Data Supplier ${saved.code} (${saved.name}) berhasil diperbarui!`
        : `✅ Supplier baru ${saved.code} (${saved.name}) berhasil disimpan!`
    );

    if (keepOpenForNext) {
      openAddSupplierModal();
    } else {
      setSupplierFormOpen(false);
    }
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const matchSearch =
        !supplierSearch.trim() ||
        s.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
        s.code.toLowerCase().includes(supplierSearch.toLowerCase()) ||
        s.address.toLowerCase().includes(supplierSearch.toLowerCase()) ||
        s.bankAccount.toLowerCase().includes(supplierSearch.toLowerCase()) ||
        (s.picName || '').toLowerCase().includes(supplierSearch.toLowerCase());
      const matchCat = supplierCategoryFilter === 'ALL' || s.category === supplierCategoryFilter;
      const matchStatus =
        supplierStatusFilter === 'ALL' || (s.status || 'Aktif') === supplierStatusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }, [suppliers, supplierSearch, supplierCategoryFilter, supplierStatusFilter]);

  // ============================================================================
  // 2. STATE FOR KARTU STOK, INPUT STOK AWAL, STOK MASUK, KELUAR, OPNAME, CRUD
  // ============================================================================
  const [stockSearch, setStockSearch] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState<'ALL' | 'Bahagia Land' | 'Bahagia Residence'>('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState<'ALL' | 'AMAN' | 'WARNING' | 'KRITIS'>('ALL');

  // Modal Input Stok Awal Manual
  const [initialStockModalOpen, setInitialStockModalOpen] = useState(false);
  const [initDate, setInitDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [initWarehouse, setInitWarehouse] = useState<'Bahagia Land' | 'Bahagia Residence'>('Bahagia Land');
  const [initCategory, setInitCategory] = useState<'Toko' | 'Bumi'>('Toko');
  const [initMaterialSelect, setInitMaterialSelect] = useState<string>('NEW');
  const [initMaterialName, setInitMaterialName] = useState('Semen Tonasa 50 Kg');
  const [initUnit, setInitUnit] = useState('Sak');
  const [initQty, setInitQty] = useState(500);
  const [initMinStock, setInitMinStock] = useState(100);
  const [initUnitPrice, setInitUnitPrice] = useState(70000);
  const [initDesc, setInitDesc] = useState('Stok opname awal Oktober 2026');
  const [initProofUrl, setInitProofUrl] = useState('');

  const autoGeneratedMaterialCode = useMemo(() => {
    if (initMaterialSelect !== 'NEW') {
      const existing = inventory.find((i) => i.id === initMaterialSelect);
      if (existing) return existing.code;
    }
    return `MT-2026-${String(inventory.length + 1).padStart(4, '0')}`;
  }, [initMaterialSelect, inventory]);

  const handleOpenInitialStockModal = () => {
    setInitDate(new Date().toISOString().slice(0, 10));
    setInitWarehouse('Bahagia Land');
    setInitCategory('Toko');
    setInitMaterialSelect('NEW');
    setInitMaterialName('');
    setInitUnit('Sak');
    setInitQty(500);
    setInitMinStock(50);
    setInitUnitPrice(70000);
    setInitDesc('Stok opname awal Oktober 2026');
    setInitProofUrl('');
    setInitialStockModalOpen(true);
  };

  const handleSelectExistingForInitial = (val: string) => {
    setInitMaterialSelect(val);
    if (val === 'NEW') {
      setInitMaterialName('');
      return;
    }
    const found = inventory.find((i) => i.id === val);
    if (found) {
      setInitMaterialName(found.name);
      setInitUnit(found.unit);
      setInitMinStock(found.minStock);
      setInitUnitPrice(found.unitPrice);
      setInitCategory(found.materialCategory || 'Toko');
      setInitWarehouse(
        found.warehouse.includes('Residence') ? 'Bahagia Residence' : 'Bahagia Land'
      );
    }
  };

  const handleSaveInitialStock = (keepOpenForNext: boolean) => {
    if (!initMaterialName.trim()) {
      toast.error('Nama Material wajib diisi!');
      return;
    }
    if (initQty <= 0) {
      toast.error('Stok Awal harus lebih dari 0!');
      return;
    }

    const companyId: 'PT_TBL' | 'PT_BPP' =
      initWarehouse === 'Bahagia Residence' ? 'PT_BPP' : 'PT_TBL';

    recordInitialStockManual({
      date: initDate,
      companyId,
      warehouse: initWarehouse,
      materialCategory: initCategory,
      existingMaterialId: initMaterialSelect !== 'NEW' ? initMaterialSelect : undefined,
      materialCode: autoGeneratedMaterialCode,
      materialName: initMaterialName.trim(),
      unit: initUnit,
      initialStock: Number(initQty),
      minStock: Number(initMinStock),
      unitPrice: Number(initUnitPrice),
      description: initDesc.trim() || 'Stok opname awal Oktober 2026',
      proofUrl: initProofUrl || undefined,
    });

    toast.success('✅ Stok awal berhasil disimpan');

    if (keepOpenForNext) {
      setInitMaterialSelect('NEW');
      setInitMaterialName('');
      setInitQty(100);
    } else {
      setInitialStockModalOpen(false);
    }
  };

  // Modal Form Stok Masuk (SM-2026-10-0001)
  const [stockInModalOpen, setStockInModalOpen] = useState(false);
  const [smDate, setSmDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [smWarehouse, setSmWarehouse] = useState<'Bahagia Land' | 'Bahagia Residence'>('Bahagia Land');
  const [smMaterialId, setSmMaterialId] = useState<string>('');
  const [smQty, setSmQty] = useState<number>(100);
  const [smUnitPrice, setSmUnitPrice] = useState<number>(68000);
  const [smSupplierId, setSmSupplierId] = useState<string>('');
  const [smPoInvoiceNo, setSmPoInvoiceNo] = useState<string>('');
  const [smDesc, setSmDesc] = useState<string>('');
  const [smProofUrl, setSmProofUrl] = useState<string>('');

  const nextSmNumber = useMemo(() => {
    const count = stockMovements.filter((m) => m.movementType === 'MASUK').length + 1;
    return `SM-2026-10-${String(count).padStart(4, '0')}`;
  }, [stockMovements]);

  const openStockInModal = (preselectedItem?: InventoryRecord) => {
    const target = preselectedItem || inventory[0];
    setSmDate(new Date().toISOString().slice(0, 10));
    if (target) {
      setSmMaterialId(target.id);
      setSmWarehouse(
        target.warehouse.includes('Residence') ? 'Bahagia Residence' : 'Bahagia Land'
      );
      setSmUnitPrice(target.unitPrice);
    }
    setSmQty(100);
    setSmSupplierId(suppliers[0]?.id || '');
    setSmPoInvoiceNo('PO-2026-0001');
    setSmDesc('Penerimaan stok material masuk ke gudang');
    setSmProofUrl('');
    setStockInModalOpen(true);
  };

  const handleSaveStockIn = () => {
    if (!smMaterialId) {
      toast.error('Pilih material terlebih dahulu!');
      return;
    }
    if (smQty <= 0) {
      toast.error('Kuantitas masuk harus lebih dari 0!');
      return;
    }
    const sup = suppliers.find((s) => s.id === smSupplierId);
    const companyId: 'PT_TBL' | 'PT_BPP' =
      smWarehouse === 'Bahagia Residence' ? 'PT_BPP' : 'PT_TBL';

    const mov = recordStockInTransaction({
      date: smDate,
      companyId,
      warehouse: smWarehouse,
      materialId: smMaterialId,
      qtyIn: Number(smQty),
      unitPrice: Number(smUnitPrice),
      supplierId: sup?.id,
      supplierName: sup?.name || 'Supplier Umum',
      poOrInvoiceNo: smPoInvoiceNo,
      description: smDesc,
      proofUrl: smProofUrl || undefined,
    });

    if (mov) {
      toast.success(
        `✅ Stok masuk ${mov.referenceNo} berhasil disimpan (+${mov.qtyIn} ${mov.unit}) & Auto-Jurnal tercatat!`
      );
      setStockInModalOpen(false);
    }
  };

  // Modal Form Stok Keluar (SK-2026-10-0001)
  const [stockOutModalOpen, setStockOutModalOpen] = useState(false);
  const [skDate, setSkDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [skWarehouse, setSkWarehouse] = useState<'Bahagia Land' | 'Bahagia Residence'>('Bahagia Land');
  const [skMaterialId, setSkMaterialId] = useState<string>('');
  const [skQty, setSkQty] = useState<number>(50);
  const [skPurpose, setSkPurpose] = useState<'Proyek Unit' | 'Fasum' | 'Lainnya'>('Proyek Unit');
  const [skUnitBlock, setSkUnitBlock] = useState<string>('Unit A01');
  const [skDesc, setSkDesc] = useState<string>('');
  const [skProofUrl, setSkProofUrl] = useState<string>('');

  const nextSkNumber = useMemo(() => {
    const count = stockMovements.filter((m) => m.movementType === 'KELUAR').length + 1;
    return `SK-2026-10-${String(count).padStart(4, '0')}`;
  }, [stockMovements]);

  const openStockOutModal = (preselectedItem?: InventoryRecord) => {
    const target = preselectedItem || inventory[0];
    setSkDate(new Date().toISOString().slice(0, 10));
    if (target) {
      setSkMaterialId(target.id);
      setSkWarehouse(
        target.warehouse.includes('Residence') ? 'Bahagia Residence' : 'Bahagia Land'
      );
    }
    setSkQty(25);
    setSkPurpose('Proyek Unit');
    setSkUnitBlock('Unit A01');
    setSkDesc('Pengeluaran material untuk pekerjaan konstruksi lapangan');
    setSkProofUrl('');
    setStockOutModalOpen(true);
  };

  const handleSaveStockOut = () => {
    if (!skMaterialId) {
      toast.error('Pilih material terlebih dahulu!');
      return;
    }
    const companyId: 'PT_TBL' | 'PT_BPP' =
      skWarehouse === 'Bahagia Residence' ? 'PT_BPP' : 'PT_TBL';

    const res = recordStockOutTransaction({
      date: skDate,
      companyId,
      warehouse: skWarehouse,
      materialId: skMaterialId,
      qtyOut: Number(skQty),
      purposeType: skPurpose,
      unitBlockCode: skPurpose === 'Proyek Unit' ? skUnitBlock : undefined,
      description: skDesc,
      proofUrl: skProofUrl || undefined,
    });

    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    toast.success(`✅ ${res.message} & Auto-Jurnal WIP tercatat!`);
    setStockOutModalOpen(false);
  };

  // Modal Form Stok Opname Batch
  const [opnameModalOpen, setOpnameModalOpen] = useState(false);
  const [opnDate, setOpnDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [opnWarehouse, setOpnWarehouse] = useState<'Bahagia Land' | 'Bahagia Residence'>('Bahagia Land');
  const [opnGeneralNotes, setOpnGeneralNotes] = useState('Opname fisik bulanan gudang logistik');
  const [opnSignature, setOpnSignature] = useState(
    () => `TTD-${(currentUser?.name || 'LOGISTIK').toUpperCase().replace(/\s+/g, '-')}`
  );
  const [opnPhotoUrl, setOpnPhotoUrl] = useState('');
  const [opnRows, setOpnRows] = useState<
    Record<string, { physicalStock: number; notes: string }>
  >({});

  const openOpnameModal = () => {
    const initialMap: Record<string, { physicalStock: number; notes: string }> = {};
    inventory.forEach((inv) => {
      initialMap[inv.id] = {
        physicalStock: inv.stock,
        notes: 'Sesuai perhitungan fisik rak',
      };
    });
    setOpnRows(initialMap);
    setOpnDate(new Date().toISOString().slice(0, 10));
    setOpnameModalOpen(true);
  };

  const opnameFilteredInventory = useMemo(() => {
    return inventory.filter((inv) =>
      opnWarehouse === 'Bahagia Residence'
        ? inv.warehouse.includes('Residence')
        : inv.warehouse.includes('Land')
    );
  }, [inventory, opnWarehouse]);

  const opnameTotalDifferenceValue = useMemo(() => {
    return opnameFilteredInventory.reduce((acc, inv) => {
      const phys = opnRows[inv.id]?.physicalStock ?? inv.stock;
      const diff = phys - inv.stock;
      return acc + diff * inv.unitPrice;
    }, 0);
  }, [opnameFilteredInventory, opnRows]);

  const handleSaveOpnameBatch = () => {
    if (!opnSignature.trim()) {
      toast.error('Tanda tangan petugas opname wajib diisi!');
      return;
    }
    const companyId: 'PT_TBL' | 'PT_BPP' =
      opnWarehouse === 'Bahagia Residence' ? 'PT_BPP' : 'PT_TBL';

    const itemsPayload = opnameFilteredInventory.map((inv) => ({
      materialId: inv.id,
      physicalStock: Number(opnRows[inv.id]?.physicalStock ?? inv.stock),
      notes: opnRows[inv.id]?.notes || 'Opname fisik',
    }));

    const batch = recordStockOpnameBatch({
      date: opnDate,
      companyId,
      warehouse: opnWarehouse,
      officerName: currentUser?.name || 'La Ode Darman (Logistik)',
      signatureText: opnSignature,
      generalNotes: opnGeneralNotes,
      photoUrl: opnPhotoUrl || undefined,
      items: itemsPayload,
    });

    toast.success(
      `✅ Stok Opname ${batch.opnameNo} berhasil disimpan! Stok sistem disesuaikan & notifikasi dikirim ke Admin.`
    );
    setOpnameModalOpen(false);
  };

  // Modal Edit Stok (Master Info: nama, satuan, stok minimum, keterangan — stok saat ini dikunci)
  const [editStockItem, setEditStockItem] = useState<InventoryRecord | null>(null);
  const [editMatName, setEditMatName] = useState('');
  const [editMatUnit, setEditMatUnit] = useState('Sak');
  const [editMatMinStock, setEditMatMinStock] = useState(50);
  const [editMatCategory, setEditMatCategory] = useState<'Toko' | 'Bumi'>('Toko');
  const [editMatPrice, setEditMatPrice] = useState(0);
  const [editMatNotes, setEditMatNotes] = useState('');

  const openEditStockModal = (item: InventoryRecord) => {
    setEditStockItem(item);
    setEditMatName(item.name);
    setEditMatUnit(item.unit);
    setEditMatMinStock(item.minStock);
    setEditMatCategory(item.materialCategory || 'Toko');
    setEditMatPrice(item.unitPrice);
    setEditMatNotes(item.notes || '');
  };

  const handleSaveEditStock = () => {
    if (!editStockItem) return;
    if (!editMatName.trim()) {
      toast.error('Nama material wajib diisi!');
      return;
    }
    updateInventoryMasterInfo(editStockItem.id, {
      name: editMatName.trim(),
      unit: editMatUnit,
      minStock: Number(editMatMinStock),
      materialCategory: editMatCategory,
      unitPrice: Number(editMatPrice),
      notes: editMatNotes.trim(),
    });
    toast.success(`✅ Data master material ${editStockItem.code} berhasil diperbarui!`);
    setEditStockItem(null);
  };

  // Modal Kurangi Stok (Koreksi dengan Alasan: Rusak / Hilang / Kadaluarsa / Lainnya)
  const [reduceStockItem, setReduceStockItem] = useState<InventoryRecord | null>(null);
  const [reduceQty, setReduceQty] = useState(5);
  const [reduceReason, setReduceReason] = useState<'Rusak' | 'Hilang' | 'Kadaluarsa' | 'Lainnya'>('Rusak');
  const [reduceNotes, setReduceNotes] = useState('');

  const handleConfirmReduceStock = () => {
    if (!reduceStockItem) return;
    if (!reduceNotes.trim()) {
      toast.error('Keterangan alasan koreksi wajib diisi!');
      return;
    }
    const res = reduceStockWithReason({
      materialId: reduceStockItem.id,
      qtyReduce: Number(reduceQty),
      reasonCategory: reduceReason,
      notes: reduceNotes.trim(),
    });
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    toast.success(`✅ ${res.message}`);
    setReduceStockItem(null);
    setReduceNotes('');
  };

  // Modal Hapus Stok (Soft Delete + Ketik "HAPUS" + Alasan Wajib)
  const [deleteStockTarget, setDeleteStockTarget] = useState<InventoryRecord | null>(null);
  const [deleteConfirmWord, setDeleteConfirmWord] = useState('');
  const [deleteStockReason, setDeleteStockReason] = useState('');

  const handleConfirmDeleteStock = () => {
    if (!deleteStockTarget) return;
    if (deleteConfirmWord.trim().toUpperCase() !== 'HAPUS') {
      toast.error('Ketik kata "HAPUS" untuk mengonfirmasi penghapusan!');
      return;
    }
    if (!deleteStockReason.trim()) {
      toast.error('Alasan penghapusan wajib diisi!');
      return;
    }
    deleteInventoryItemSoft(deleteStockTarget.id, deleteStockReason.trim());
    toast.success(
      `🗑️ Kartu stok ${deleteStockTarget.code} (${deleteStockTarget.name}) dipindahkan ke Trash (30 hari).`
    );
    setDeleteStockTarget(null);
    setDeleteConfirmWord('');
    setDeleteStockReason('');
  };

  // Modal Detail Riwayat Kartu Stok per Material (lengkap dengan Edit/Hapus mutasi)
  const [detailCardItem, setDetailCardItem] = useState<InventoryRecord | null>(null);
  const [editingMovement, setEditingMovement] = useState<StockMovementRecord | null>(null);
  const [editMovQtyIn, setEditMovQtyIn] = useState(0);
  const [editMovQtyOut, setEditMovQtyOut] = useState(0);
  const [editMovPrice, setEditMovPrice] = useState(0);
  const [editMovDesc, setEditMovDesc] = useState('');

  // Modal Import Excel Stok
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importCsvText, setImportCsvText] = useState(
    'MT-2026-0006;Cat Tembok Dulux WeatherShield 20L;Bahagia Land;Toko;Kaleng;45;10;1250000;Stok Awal Gudang\nMT-2026-0007;Keramik Lantai Roman 40x40 Putih;Bahagia Residence;Toko;Dos;320;50;65000;Stok Awal Gudang'
  );

  const handleBulkImport = () => {
    const lines = importCsvText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const parsed = lines.map((line) => {
      const parts = line.split(';').map((p) => p.trim());
      const wh = parts[2] || 'Bahagia Land';
      return {
        code: parts[0] || undefined,
        name: parts[1] || 'Material Baru',
        warehouse: wh,
        companyId: (wh.includes('Residence') ? 'PT_BPP' : 'PT_TBL') as 'PT_TBL' | 'PT_BPP',
        materialCategory: ((parts[3] === 'Bumi' ? 'Bumi' : 'Toko') as 'Toko' | 'Bumi'),
        unit: parts[4] || 'Sak',
        initialStock: Number(parts[5]) || 100,
        minStock: Number(parts[6]) || 20,
        unitPrice: Number(parts[7]) || 50000,
        notes: parts[8] || 'Import Excel Kartu Stok',
      };
    });
    const count = bulkImportInventoryItems(parsed);
    toast.success(`✅ Berhasil mengimpor ${count} item Kartu Stok beserta Auto-Jurnal!`);
    setImportModalOpen(false);
  };

  // ============================================================================
  // 3. STATE FOR PURCHASE ORDER (MULTI-MATERIAL)
  // ============================================================================
  const [poSupplierId, setPoSupplierId] = useState(suppliers[0]?.id || 'sup-1');
  const [poDiscount, setPoDiscount] = useState(250000);
  const [poPpn, setPoPpn] = useState(11);
  const [poShipping, setPoShipping] = useState(500000);
  const [poItems, setPoItems] = useState([
    { materialName: 'Semen Tonasa 50 Kg', unit: 'Sak', qty: 200, unitPrice: 68000 },
    { materialName: 'Besi Beton Polos 10mm SNI', unit: 'Batang', qty: 100, unitPrice: 72500 },
  ]);

  const poSubtotal = poItems.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const poAfterDisc = Math.max(0, poSubtotal - poDiscount);
  const poTaxVal = Math.round((poAfterDisc * poPpn) / 100);
  const poGrandTotal = poAfterDisc + poTaxVal + poShipping;

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === poSupplierId) || suppliers[0];
    if (!sup) return;
    createPurchaseOrder({
      companyId: selectedCompanyFilter === 'PT_BPP' ? 'PT_BPP' : 'PT_TBL',
      supplierId: sup.id,
      supplierName: sup.name,
      items: poItems,
      discount: poDiscount,
      ppnPercent: poPpn,
      shippingCost: poShipping,
      subtotal: poSubtotal,
      grandTotal: poGrandTotal,
      createdBy: currentUser?.name || 'Purchasing',
    });
    toast.success('PO Multi-Material berhasil diterbitkan!');
  };

  // Computed Kartu Stok rows with Stok Awal, Stok Masuk, Stok Keluar, Stok Saat Ini, Status
  const enrichedStockCards = useMemo(() => {
    return inventory
      .filter((inv) =>
        selectedCompanyFilter === 'ALL' ? true : inv.companyId === selectedCompanyFilter
      )
      .map((inv) => {
        const itemMovs = stockMovements.filter(
          (m) => m.materialId === inv.id || m.materialCode === inv.code
        );
        const calcInit =
          inv.initialStock !== undefined
            ? inv.initialStock
            : itemMovs
                .filter((m) => m.movementType === 'SALDO_AWAL')
                .reduce((s, m) => s + m.qtyIn, 0) || inv.stock;
        const calcIn =
          inv.stockInTotal !== undefined
            ? inv.stockInTotal
            : itemMovs
                .filter((m) => m.movementType === 'MASUK' || (m.movementType === 'OPNAME' && m.qtyIn > 0))
                .reduce((s, m) => s + m.qtyIn, 0);
        const calcOut =
          inv.stockOutTotal !== undefined
            ? inv.stockOutTotal
            : itemMovs
                .filter(
                  (m) =>
                    m.movementType === 'KELUAR' ||
                    m.movementType === 'KOREKSI' ||
                    (m.movementType === 'OPNAME' && m.qtyOut > 0)
                )
                .reduce((s, m) => s + m.qtyOut, 0);

        // Status Stok:
        // 🔴 Kritis (stok < minimum)
        // 🟡 Warning (stok >= minimum && stok <= minimum * 1.25)
        // 🟢 Aman (stok > minimum * 1.25)
        let stockStatus: 'AMAN' | 'WARNING' | 'KRITIS' = 'AMAN';
        if (inv.stock < inv.minStock) {
          stockStatus = 'KRITIS';
        } else if (inv.stock <= Math.ceil(inv.minStock * 1.25)) {
          stockStatus = 'WARNING';
        }

        return {
          ...inv,
          computedInitial: calcInit,
          computedIn: calcIn,
          computedOut: calcOut,
          stockStatus,
          movementsCount: itemMovs.length,
        };
      })
      .filter((row) => {
        const matchSearch =
          !stockSearch.trim() ||
          row.name.toLowerCase().includes(stockSearch.toLowerCase()) ||
          row.code.toLowerCase().includes(stockSearch.toLowerCase()) ||
          row.warehouse.toLowerCase().includes(stockSearch.toLowerCase());
        const matchWh =
          warehouseFilter === 'ALL' ||
          (warehouseFilter === 'Bahagia Land' && row.warehouse.includes('Land')) ||
          (warehouseFilter === 'Bahagia Residence' && row.warehouse.includes('Residence'));
        const matchSt = stockStatusFilter === 'ALL' || row.stockStatus === stockStatusFilter;
        return matchSearch && matchWh && matchSt;
      });
  }, [inventory, stockMovements, selectedCompanyFilter, stockSearch, warehouseFilter, stockStatusFilter]);

  const handleExportStockExcel = () => {
    exportToExcelCsv(
      'kartu-stok-gudang-bahagia-group',
      [
        'Kode Barang',
        'Nama Material',
        'Gudang/Proyek',
        'Kategori',
        'Satuan',
        'Stok Awal',
        'Stok Masuk',
        'Stok Keluar',
        'Stok Saat Ini',
        'Stok Minimum',
        'Harga Satuan',
        'Total Nilai',
        'Status Stok',
      ],
      enrichedStockCards.map((c) => [
        c.code,
        c.name,
        c.warehouse,
        c.materialCategory || 'Toko',
        c.unit,
        c.computedInitial,
        c.computedIn,
        c.computedOut,
        c.stock,
        c.minStock,
        c.unitPrice,
        c.stock * c.unitPrice,
        c.stockStatus,
      ])
    );
    toast.success('📤 Data Kartu Stok berhasil di-export ke Excel (CSV)!');
  };

  return (
    <div className="space-y-6">
      {/* Header & Navigation Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Gudang Logistik & Purchasing Terpadu
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-0.5">
            Manajemen Supplier Lengkap, Input Stok Awal Manual & Kartu Stok CRUD
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Tersinkronisasi otomatis dengan Jurnal Umum Keuangan (Persediaan Material Toko/Bumi & WIP Konstruksi)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg border border-gray-200">
            <button
              onClick={() => {
                setActiveMainTab('KARTU_STOK');
                navigate('/gudang/stok');
              }}
              className={`px-3.5 py-2 text-xs font-bold rounded-md transition-colors ${
                activeMainTab === 'KARTU_STOK'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              📦 Kartu Stok & Opname ({inventory.length})
            </button>
            <button
              onClick={() => {
                setActiveMainTab('SUPPLIER');
                navigate('/gudang/supplier');
              }}
              className={`px-3.5 py-2 text-xs font-bold rounded-md transition-colors ${
                activeMainTab === 'SUPPLIER'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              🏢 Database Supplier ({suppliers.length})
            </button>
            <button
              onClick={() => {
                setActiveMainTab('PO');
                navigate('/purchasing/po');
              }}
              className={`px-3.5 py-2 text-xs font-bold rounded-md transition-colors ${
                activeMainTab === 'PO'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              🧾 Purchase Order ({purchaseOrders.length})
            </button>
          </div>
          {currentUser?.role === 'ADMIN' && (
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.origin);
                toast.success(
                  '🚀 Modul Gudang Logistik, Supplier & Kartu Stok siap digunakan (Live URL disalin)!'
                );
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              🚀 Deploy &amp; Salin Link Live
            </button>
          )}
        </div>
      </div>

      <SuperAdminCrudBar
        collectionKey={
          activeMainTab === 'SUPPLIER'
            ? 'suppliers'
            : activeMainTab === 'PO'
            ? 'po_invoice'
            : 'inventory'
        }
        collectionLabel={
          activeMainTab === 'SUPPLIER'
            ? 'Database Supplier'
            : activeMainTab === 'PO'
            ? 'Purchase Orders (PO)'
            : 'Kartu Stok Gudang Logistik'
        }
        itemCount={
          activeMainTab === 'SUPPLIER'
            ? suppliers.length
            : activeMainTab === 'PO'
            ? purchaseOrders.length
            : inventory.length
        }
        sampleAdjustTarget={{
          id: inventory[0]?.code || 'MT-2026-0001',
          label: inventory[0]?.name || 'Semen Tonasa 50 Kg',
          currentValue: inventory[0]?.stock || 420,
          unitLabel: inventory[0]?.unit || 'Sak',
        }}
      />

      {/* ===================================================================== */}
      {/* TAB 1: KARTU STOK, INPUT STOK AWAL, STOK MASUK/KELUAR & OPNAME        */}
      {/* ===================================================================== */}
      {activeMainTab === 'KARTU_STOK' && (
        <div className="space-y-5">
          {/* Top Action Bar sesuai spesifikasi */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleOpenInitialStockModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                <Plus className="w-4 h-4" /> + Input Stok Awal
              </button>
              <button
                onClick={() => openStockInModal()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                <ArrowDownLeft className="w-4 h-4" /> + Tambah Stok Masuk
              </button>
              <button
                onClick={() => openStockOutModal()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                <ArrowUpRight className="w-4 h-4" /> ➖ Stok Keluar
              </button>
              <button
                onClick={openOpnameModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                <ClipboardCheck className="w-4 h-4" /> 📊 Opname
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setImportModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-700" /> 📥 Import Excel
              </button>
              <ExportActionButtons
                title="Laporan Kartu Stok Material Gudang Logistik"
                subtitle={`Total ${enrichedStockCards.length} Material`}
                filename="Kartu_Stok_Gudang"
                headers={['Kode', 'Nama Material', 'Gudang', 'Satuan', 'Stok Awal', 'Masuk', 'Keluar', 'Saat Ini', 'Minimum', 'Harga Satuan', 'Status']}
                data={enrichedStockCards.map((c) => ({
                  Kode: c.code,
                  'Nama Material': c.name,
                  Gudang: c.warehouse,
                  Satuan: c.unit,
                  'Stok Awal': c.computedInitial,
                  Masuk: c.computedIn,
                  Keluar: c.computedOut,
                  'Saat Ini': c.stock,
                  Minimum: c.minStock,
                  'Harga Satuan': c.unitPrice,
                  Status: c.stockStatus,
                }))}
                rows={enrichedStockCards.map((c) => [
                  c.code,
                  c.name,
                  c.warehouse,
                  c.unit,
                  c.computedInitial,
                  c.computedIn,
                  c.computedOut,
                  c.stock,
                  c.minStock,
                  formatRp(c.unitPrice),
                  c.stockStatus,
                ])}
              />
              <button
                onClick={() => toast.success('🔄 Data Kartu Stok berhasil disinkronkan!')}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg"
              >
                <RefreshCw className="w-3.5 h-3.5" /> 🔄 Refresh
              </button>
            </div>
          </div>

          {/* Summary KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-xs text-gray-500">Total Item Material</div>
              <div className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">
                {enrichedStockCards.length} Material
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Bahagia Land & Bahagia Residence
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-xs text-gray-500">Total Nilai Persediaan Gudang</div>
              <div className="text-2xl font-bold text-emerald-700 mt-1 tabular-nums">
                {formatRp(
                  enrichedStockCards.reduce((sum, item) => sum + item.stock * item.unitPrice, 0)
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Tercatat pada COA 1-1310 & 1-1320
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-xs text-gray-500">Status Stok Aman / Warning</div>
              <div className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">
                🟢 {enrichedStockCards.filter((x) => x.stockStatus === 'AMAN').length} · 🟡{' '}
                {enrichedStockCards.filter((x) => x.stockStatus === 'WARNING').length}
              </div>
              <div className="text-xs text-gray-500 mt-1">Stok di atas batas minimum</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-xs text-gray-500">Status Stok Kritis (Perlu PO)</div>
              <div className="text-2xl font-bold text-red-600 mt-1 tabular-nums">
                🔴 {enrichedStockCards.filter((x) => x.stockStatus === 'KRITIS').length} Item
              </div>
              <div className="text-xs text-gray-500 mt-1">Di bawah stok minimum</div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                placeholder="Cari kode barang (MT-2026-0001), nama material, atau lokasi gudang..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={warehouseFilter}
                onChange={(e) => setWarehouseFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white font-medium"
              >
                <option value="ALL">Semua Gudang/Proyek</option>
                <option value="Bahagia Land">Gudang Bahagia Land</option>
                <option value="Bahagia Residence">Gudang Bahagia Residence</option>
              </select>
              <select
                value={stockStatusFilter}
                onChange={(e) => setStockStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white font-medium"
              >
                <option value="ALL">Semua Status Stok</option>
                <option value="AMAN">🟢 Aman (Stok &gt; Minimum)</option>
                <option value="WARNING">🟡 Warning (Mendekati Minimum)</option>
                <option value="KRITIS">🔴 Kritis (Di Bawah Minimum)</option>
              </select>
            </div>
          </div>

          {/* Tabel Utama Kartu Stok */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                    <th className="py-3 px-3">Kode Barang</th>
                    <th className="py-3 px-3">Nama Material</th>
                    <th className="py-3 px-3">Gudang/Proyek</th>
                    <th className="py-3 px-3">Satuan</th>
                    <th className="py-3 px-3 text-right">Stok Awal</th>
                    <th className="py-3 px-3 text-right">Stok Masuk</th>
                    <th className="py-3 px-3 text-right">Stok Keluar</th>
                    <th className="py-3 px-3 text-right">Stok Saat Ini</th>
                    <th className="py-3 px-3 text-right">Stok Minimum</th>
                    <th className="py-3 px-3">Status Stok</th>
                    <th className="py-3 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-xs">
                  {enrichedStockCards.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-gray-900">{item.code}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-gray-900">{item.name}</div>
                        <div className="text-[11px] text-gray-500">
                          Kategori {item.materialCategory || 'Toko'} · {formatRp(item.unitPrice)}/{item.unit}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium text-gray-700">{item.warehouse}</td>
                      <td className="py-3 px-3 text-gray-700 font-semibold">{item.unit}</td>
                      <td className="py-3 px-3 text-right tabular-nums text-gray-700">
                        {item.computedInitial.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums font-semibold text-emerald-700">
                        +{item.computedIn.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums font-semibold text-amber-700">
                        -{item.computedOut.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums font-bold text-gray-900 text-sm">
                        {item.stock.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums text-gray-500">
                        {item.minStock.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3">
                        {item.stockStatus === 'AMAN' && (
                          <span className="font-semibold text-emerald-700">🟢 Aman</span>
                        )}
                        {item.stockStatus === 'WARNING' && (
                          <span className="font-semibold text-amber-700">🟡 Warning</span>
                        )}
                        {item.stockStatus === 'KRITIS' && (
                          <span className="font-semibold text-red-600">🔴 Kritis</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex flex-wrap items-center justify-end gap-1">
                          <button
                            onClick={() => openEditStockModal(item)}
                            title="Edit Data Stok"
                            className="px-2 py-1 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded text-[11px] font-semibold"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => openStockInModal(item)}
                            title="Tambah Stok Masuk"
                            className="px-2 py-1 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-[11px] font-semibold"
                          >
                            ➕ Tambah
                          </button>
                          <button
                            onClick={() => {
                              setReduceStockItem(item);
                              setReduceQty(5);
                              setReduceReason('Rusak');
                              setReduceNotes('');
                            }}
                            title="Kurangi Stok (Koreksi)"
                            className="px-2 py-1 border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded text-[11px] font-semibold"
                          >
                            ➖ Kurangi
                          </button>
                          <button
                            onClick={() => setDetailCardItem(item)}
                            title="Lihat Riwayat Kartu Stok"
                            className="px-2 py-1 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded text-[11px] font-semibold"
                          >
                            👁️ Detail
                          </button>
                          <button
                            onClick={() => {
                              setDeleteStockTarget(item);
                              setDeleteConfirmWord('');
                              setDeleteStockReason('');
                            }}
                            title="Hapus Soft Delete"
                            className="px-2 py-1 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 rounded text-[11px] font-semibold"
                          >
                            🗑️ Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {enrichedStockCards.length === 0 && (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-gray-500 text-xs">
                        Tidak ada data material yang sesuai filter. Klik <b>[+ Input Stok Awal]</b> untuk menambah stok.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Riwayat Stok Opname Terakhir */}
          {stockOpnameBatches.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Riwayat Berita Acara Stok Opname Gudang
                  </h3>
                  <p className="text-xs text-gray-500">
                    Selisih opname otomatis membukukan Jurnal Penyesuaian Persediaan
                  </p>
                </div>
                <span className="text-xs font-semibold text-gray-600">
                  Total: {stockOpnameBatches.length} Berita Acara
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500">
                      <th className="py-2">No Opname</th>
                      <th className="py-2">Tanggal</th>
                      <th className="py-2">Gudang/Proyek</th>
                      <th className="py-2">Petugas Opname</th>
                      <th className="py-2">Jumlah Item</th>
                      <th className="py-2 text-right">Total Nilai Selisih</th>
                      <th className="py-2">Tanda Tangan Digital</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stockOpnameBatches.map((b) => (
                      <tr key={b.id}>
                        <td className="py-2.5 font-mono font-bold text-gray-900">{b.opnameNo}</td>
                        <td className="py-2.5 text-gray-600">{b.date}</td>
                        <td className="py-2.5 font-medium text-gray-800">{b.warehouse}</td>
                        <td className="py-2.5 text-gray-700">{b.officerName}</td>
                        <td className="py-2.5 text-gray-700">{b.items.length} Material</td>
                        <td
                          className={`py-2.5 text-right font-bold tabular-nums ${
                            b.totalDifferenceValue < 0
                              ? 'text-red-600'
                              : b.totalDifferenceValue > 0
                              ? 'text-emerald-700'
                              : 'text-gray-700'
                          }`}
                        >
                          {formatRp(b.totalDifferenceValue)}
                        </td>
                        <td className="py-2.5 font-mono text-[11px] text-emerald-700">
                          {b.signatureText}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: DATABASE SUPPLIER LENGKAP (ALAMAT + REKENING BANK + 4 TAB)     */}
      {/* ===================================================================== */}
      {activeMainTab === 'SUPPLIER' && (
        <div className="space-y-5">
          {/* Action & Filter Bar Supplier */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={supplierSearch}
                  onChange={(e) => setSupplierSearch(e.target.value)}
                  placeholder="Cari kode (SUP-2026-0001), nama supplier, alamat, PIC, atau no rekening..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>
              <select
                value={supplierCategoryFilter}
                onChange={(e) => setSupplierCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white font-medium"
              >
                <option value="ALL">Semua Kategori</option>
                {SUPPLIER_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={supplierStatusFilter}
                onChange={(e) => setSupplierStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white font-medium"
              >
                <option value="ALL">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <ExportActionButtons
                title="Database Supplier Resmi Bahagia Group"
                subtitle={`Total ${filteredSuppliers.length} Supplier`}
                filename="Database_Supplier_Bahagia_Group"
                headers={['Kode', 'Nama Supplier', 'PIC', 'Kategori', 'No HP', 'Alamat', 'Bank', 'No Rekening', 'Pemilik Rekening', 'Tempo', 'Status']}
                data={filteredSuppliers.map((s) => ({
                  Kode: s.code,
                  'Nama Supplier': s.name,
                  PIC: s.picName || '-',
                  Kategori: s.category,
                  'No HP': s.phone,
                  Alamat: `${s.address}${s.city ? `, ${s.city}` : ''}`,
                  Bank: s.bankName,
                  'No Rekening': s.bankAccount,
                  'Pemilik Rekening': s.bankAccountOwner || s.name,
                  Tempo: `${s.tempoDays} Hari`,
                  Status: s.status || 'Aktif',
                }))}
                rows={filteredSuppliers.map((s) => [
                  s.code,
                  s.name,
                  s.picName || '-',
                  s.category,
                  s.phone,
                  `${s.address}${s.city ? `, ${s.city}` : ''}`,
                  s.bankName,
                  s.bankAccount,
                  s.bankAccountOwner || s.name,
                  `${s.tempoDays} Hari`,
                  s.status || 'Aktif',
                ])}
              />
              <button
                onClick={openAddSupplierModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                <Plus className="w-4 h-4" /> + Tambah Supplier
              </button>
            </div>
          </div>

          {/* Tabel Supplier Update Kolom */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                    <th className="py-3 px-3">Kode</th>
                    <th className="py-3 px-3">Nama Supplier</th>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-3">Kontak</th>
                    <th className="py-3 px-3">Alamat</th>
                    <th className="py-3 px-3">Bank</th>
                    <th className="py-3 px-3">No Rekening</th>
                    <th className="py-3 px-3 text-center">Tempo</th>
                    <th className="py-3 px-3 text-center">Rating</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-xs">
                  {filteredSuppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-gray-900">{s.code}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-gray-900">{s.name}</div>
                        <div className="text-[11px] text-gray-500">
                          {s.supplierType || 'PT'} · PIC: {s.picName || 'Admin Supplier'}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium text-gray-700">{s.category}</td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-gray-900">{s.phone}</div>
                        {s.email && <div className="text-[11px] text-gray-500">{s.email}</div>}
                      </td>
                      <td className="py-3 px-3 max-w-[220px]">
                        <div className="text-gray-800 line-clamp-2">{s.address}</div>
                        {(s.kecamatan || s.city) && (
                          <div className="text-[11px] text-gray-500">
                            {[s.kelurahan, s.kecamatan, s.city].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 font-bold text-gray-900">{s.bankName}</td>
                      <td className="py-3 px-3">
                        <div className="font-mono font-semibold text-gray-900">{s.bankAccount}</div>
                        <div className="text-[11px] text-gray-500">
                          a.n. {s.bankAccountOwner || s.name}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center tabular-nums font-semibold text-gray-700">
                        {s.tempoDays} Hari
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-amber-600">
                        {'⭐'.repeat(Math.min(5, Math.max(1, Math.round(s.rating || 5))))}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-semibold ${
                            (s.status || 'Aktif') === 'Aktif' ? 'text-emerald-700' : 'text-gray-400'
                          }`}
                        >
                          {s.status || 'Aktif'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex flex-wrap items-center justify-end gap-1">
                          <button
                            onClick={() => openEditSupplierModal(s)}
                            className="px-2 py-1 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded text-[11px] font-semibold"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDetailSupplier(s);
                              setSupplierDetailTab('PROFIL');
                            }}
                            className="px-2 py-1 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded text-[11px] font-semibold"
                          >
                            👁️ Detail
                          </button>
                          <a
                            href={`https://wa.me/${s.phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-[11px] font-semibold"
                          >
                            📞 WA
                          </a>
                          <button
                            onClick={() => {
                              setSelectedDetailSupplier(s);
                              setSupplierDetailTab('RIWAYAT_PO');
                            }}
                            className="px-2 py-1 border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded text-[11px] font-semibold"
                          >
                            📊 Riwayat
                          </button>
                          <button
                            onClick={() => {
                              deleteSupplierSoft(s.id, 'Soft delete dari tabel Supplier');
                              toast.success(`🗑️ Supplier ${s.name} dipindahkan ke Trash.`);
                            }}
                            className="px-2 py-1 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 rounded text-[11px] font-semibold"
                          >
                            🗑️ Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: PURCHASE ORDER MULTI-MATERIAL                                  */}
      {/* ===================================================================== */}
      {activeMainTab === 'PO' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-bold text-gray-900 mb-3">
              Buat Purchase Order (PO) Multi-Material
            </h2>
            <form onSubmit={handleCreatePO} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Pilih Supplier Resmi</label>
                <select
                  value={poSupplierId}
                  onChange={(e) => setPoSupplierId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name} ({s.bankName} {s.bankAccount} · Tempo {s.tempoDays} Hari)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-gray-700">Daftar Item Material PO</label>
                  <button
                    type="button"
                    onClick={() =>
                      setPoItems([
                        ...poItems,
                        { materialName: 'Material Baru', unit: 'Sak', qty: 10, unitPrice: 50000 },
                      ])
                    }
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    + Tambah Baris
                  </button>
                </div>
                {poItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-1.5 items-center">
                    <input
                      type="text"
                      value={item.materialName}
                      onChange={(e) => {
                        const next = [...poItems];
                        next[idx].materialName = e.target.value;
                        setPoItems(next);
                      }}
                      className="col-span-5 px-2 py-1.5 border border-gray-300 rounded"
                      placeholder="Nama Material"
                    />
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) => {
                        const next = [...poItems];
                        next[idx].qty = Number(e.target.value);
                        setPoItems(next);
                      }}
                      className="col-span-2 px-2 py-1.5 border border-gray-300 rounded text-right"
                    />
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => {
                        const next = [...poItems];
                        next[idx].unit = e.target.value;
                        setPoItems(next);
                      }}
                      className="col-span-2 px-2 py-1.5 border border-gray-300 rounded"
                    />
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => {
                        const next = [...poItems];
                        next[idx].unitPrice = Number(e.target.value);
                        setPoItems(next);
                      }}
                      className="col-span-3 px-2 py-1.5 border border-gray-300 rounded text-right"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Diskon (Rp)</label>
                  <input
                    type="number"
                    value={poDiscount}
                    onChange={(e) => setPoDiscount(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">PPN (%)</label>
                  <input
                    type="number"
                    value={poPpn}
                    onChange={(e) => setPoPpn(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Ongkir (Rp)</label>
                  <input
                    type="number"
                    value={poShipping}
                    onChange={(e) => setPoShipping(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal Material:</span>
                  <span className="font-semibold tabular-nums">{formatRp(poSubtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-900 font-bold text-sm pt-1 border-t border-gray-200">
                  <span>Grand Total PO:</span>
                  <span className="text-emerald-700 tabular-nums">{formatRp(poGrandTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
              >
                Terbitkan Purchase Order (PO)
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-bold text-gray-900">Daftar Purchase Order (PO)</h2>
              <ExportActionButtons
                title="Daftar Purchase Order (PO Multi-Material)"
                subtitle={`Total ${purchaseOrders.length} PO`}
                filename="Purchase_Orders_Bahagia_Group"
                headers={['No. PO', 'Supplier', 'Rincian Material', 'Grand Total', 'Status', 'Dibuat Oleh']}
                data={purchaseOrders.map((po) => ({
                  'No. PO': po.id,
                  Supplier: po.supplierName,
                  'Rincian Material': po.items.map((it) => `${it.materialName} (${it.qty} ${it.unit})`).join(', '),
                  'Grand Total': po.grandTotal,
                  Status: po.status,
                  'Dibuat Oleh': po.createdBy,
                }))}
                rows={purchaseOrders.map((po) => [
                  po.id,
                  po.supplierName,
                  po.items.map((it) => `${it.materialName} (${it.qty} ${it.unit})`).join(', '),
                  formatRp(po.grandTotal),
                  po.status,
                  po.createdBy,
                ])}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="py-2.5">No. PO</th>
                    <th className="py-2.5">Supplier</th>
                    <th className="py-2.5 text-right">Grand Total</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {purchaseOrders.map((po) => (
                    <tr key={po.id}>
                      <td className="py-3 font-mono font-bold text-gray-900">{po.id}</td>
                      <td className="py-3 font-medium text-gray-800">{po.supplierName}</td>
                      <td className="py-3 text-right font-bold tabular-nums">
                        {formatRp(po.grandTotal)}
                      </td>
                      <td className="py-3 font-semibold text-emerald-700">{po.status}</td>
                      <td className="py-3 text-right">
                        {po.status === 'Menunggu Approval Direktur' && (
                          <button
                            onClick={() => {
                              approvePurchaseOrder(po.id, 'Approved');
                              toast.success(`PO ${po.id} Approved!`);
                            }}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold"
                          >
                            Approve PO
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: FORM TAMBAH / EDIT SUPPLIER LENGKAP (6 SECTIONS)             */}
      {/* ===================================================================== */}
      {supplierFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Database Pemasok Resmi Bahagia Group
                </span>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingSupplierId ? `Edit Supplier (${nextSupplierCode})` : 'Form Tambah Supplier Lengkap (6 Section)'}
                </h2>
              </div>
              <button
                onClick={() => setSupplierFormOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* SECTION 1 - INFORMASI DASAR */}
              <div className="bg-gray-50/70 border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="font-bold text-gray-900 border-b border-gray-200 pb-2">
                  SECTION 1 — INFORMASI DASAR
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      Kode Supplier (Auto)
                    </label>
                    <input
                      type="text"
                      value={nextSupplierCode}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-600 font-mono font-bold rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Jenis Supplier</label>
                    <select
                      value={supType}
                      onChange={(e) => setSupType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    >
                      <option value="PT">PT (Perseroan Terbatas)</option>
                      <option value="CV">CV (Commanditaire Vennootschap)</option>
                      <option value="UD">UD (Usaha Dagang)</option>
                      <option value="Perorangan">Perorangan</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Nama Perusahaan Supplier *
                  </label>
                  <input
                    type="text"
                    value={supName}
                    onChange={(e) => setSupName(e.target.value)}
                    placeholder="Contoh: PT Aneka Bangunan Kendari"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      Nama Kontak Person (PIC)
                    </label>
                    <input
                      type="text"
                      value={supPic}
                      onChange={(e) => setSupPic(e.target.value)}
                      placeholder="Nama Sales / Direktur"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Kategori *</label>
                    <select
                      value={supCategory}
                      onChange={(e) => setSupCategory(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    >
                      {SUPPLIER_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2 - KONTAK */}
              <div className="bg-gray-50/70 border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="font-bold text-gray-900 border-b border-gray-200 pb-2">
                  SECTION 2 — KONTAK SUPPLIER
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      No HP / WhatsApp *
                    </label>
                    <input
                      type="text"
                      value={supPhone}
                      onChange={(e) => setSupPhone(e.target.value)}
                      placeholder="08114055889"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      No Telepon Kantor
                    </label>
                    <input
                      type="text"
                      value={supOfficePhone}
                      onChange={(e) => setSupOfficePhone(e.target.value)}
                      placeholder="0401-3124455"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={supEmail}
                    onChange={(e) => setSupEmail(e.target.value)}
                    placeholder="sales@supplier.co.id"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Website (Opsional)
                  </label>
                  <input
                    type="text"
                    value={supWebsite}
                    onChange={(e) => setSupWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* SECTION 3 - ALAMAT LENGKAP (WAJIB) */}
              <div className="bg-emerald-50/40 border border-emerald-200 rounded-xl p-4 space-y-3">
                <div className="font-bold text-emerald-950 border-b border-emerald-200 pb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-700" /> SECTION 3 — ALAMAT LENGKAP (WAJIB)
                </div>
                <div>
                  <label className="font-semibold text-gray-800 block mb-1">
                    Alamat Lengkap (Jalan, Nomor, RT/RW, Kompleks) *
                  </label>
                  <textarea
                    rows={2}
                    value={supAddress}
                    onChange={(e) => setSupAddress(e.target.value)}
                    placeholder="Jl. MT Haryono No. 88, Ruko Graha Asri..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Kelurahan/Desa</label>
                    <input
                      type="text"
                      value={supKelurahan}
                      onChange={(e) => setSupKelurahan(e.target.value)}
                      placeholder="Wua-Wua"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Kecamatan</label>
                    <input
                      type="text"
                      value={supKecamatan}
                      onChange={(e) => setSupKecamatan(e.target.value)}
                      placeholder="Wua-Wua"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Kabupaten/Kota</label>
                    <input
                      type="text"
                      value={supCity}
                      onChange={(e) => setSupCity(e.target.value)}
                      className="w-full px-2.5 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Provinsi</label>
                    <input
                      type="text"
                      value={supProvince}
                      onChange={(e) => setSupProvince(e.target.value)}
                      className="w-full px-2.5 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Kode Pos</label>
                    <input
                      type="text"
                      value={supPostalCode}
                      onChange={(e) => setSupPostalCode(e.target.value)}
                      placeholder="93117"
                      className="w-full px-2.5 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Patokan / Landmark Terdekat
                  </label>
                  <input
                    type="text"
                    value={supLandmark}
                    onChange={(e) => setSupLandmark(e.target.value)}
                    placeholder="Depan Pasar Baru Wua-Wua"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* SECTION 4 - REKENING BANK (WAJIB) */}
              <div className="bg-emerald-50/40 border border-emerald-200 rounded-xl p-4 space-y-3">
                <div className="font-bold text-emerald-950 border-b border-emerald-200 pb-2 flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-emerald-700" /> SECTION 4 — REKENING BANK (WAJIB)
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-800 block mb-1">Nama Bank *</label>
                    <select
                      value={supBankName}
                      onChange={(e) => setSupBankName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white font-semibold"
                    >
                      {BANK_OPTIONS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-800 block mb-1">No Rekening *</label>
                    <input
                      type="text"
                      value={supBankAccount}
                      onChange={(e) => setSupBankAccount(e.target.value)}
                      placeholder="1234567890"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-800 block mb-1">
                      Nama Pemilik Rekening *
                    </label>
                    <input
                      type="text"
                      value={supBankOwner}
                      onChange={(e) => setSupBankOwner(e.target.value)}
                      placeholder="Sesuai buku tabungan / giro"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Cabang Bank</label>
                    <input
                      type="text"
                      value={supBankBranch}
                      onChange={(e) => setSupBankBranch(e.target.value)}
                      placeholder="KC Kendari"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                {/* Multiple Bank Accounts support */}
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-gray-600">
                      Rekening Bank Tambahan (Opsional)
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSupAdditionalBanks([
                          ...supAdditionalBanks,
                          {
                            id: `bnk-${Date.now()}`,
                            bankName: 'BRI',
                            accountNumber: '',
                            accountOwner: supName || '',
                            branchName: 'Kendari',
                          },
                        ])
                      }
                      className="text-[11px] font-bold text-emerald-700 hover:underline"
                    >
                      + Tambah Rekening Lain
                    </button>
                  </div>
                  {supAdditionalBanks.map((b, idx) => (
                    <div key={b.id} className="grid grid-cols-12 gap-1.5 mb-1.5">
                      <select
                        value={b.bankName}
                        onChange={(e) => {
                          const next = [...supAdditionalBanks];
                          next[idx].bankName = e.target.value;
                          setSupAdditionalBanks(next);
                        }}
                        className="col-span-3 px-2 py-1 border border-gray-300 rounded bg-white text-[11px]"
                      >
                        {BANK_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={b.accountNumber}
                        onChange={(e) => {
                          const next = [...supAdditionalBanks];
                          next[idx].accountNumber = e.target.value;
                          setSupAdditionalBanks(next);
                        }}
                        placeholder="No Rek"
                        className="col-span-4 px-2 py-1 border border-gray-300 rounded bg-white text-[11px]"
                      />
                      <input
                        type="text"
                        value={b.accountOwner}
                        onChange={(e) => {
                          const next = [...supAdditionalBanks];
                          next[idx].accountOwner = e.target.value;
                          setSupAdditionalBanks(next);
                        }}
                        placeholder="Atas Nama"
                        className="col-span-4 px-2 py-1 border border-gray-300 rounded bg-white text-[11px]"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setSupAdditionalBanks(supAdditionalBanks.filter((_, i) => i !== idx))
                        }
                        className="col-span-1 text-red-600 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 5 - KEUANGAN */}
              <div className="bg-gray-50/70 border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="font-bold text-gray-900 border-b border-gray-200 pb-2">
                  SECTION 5 — KEUANGAN & TERMIN
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">NPWP</label>
                    <input
                      type="text"
                      value={supNpwp}
                      onChange={(e) => setSupNpwp(e.target.value)}
                      placeholder="01.234.567.8-811.000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      Tempo Pembayaran (Hari) *
                    </label>
                    <input
                      type="number"
                      value={supTempoDays}
                      onChange={(e) => setSupTempoDays(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      Limit Kredit (Rp - Opsional)
                    </label>
                    <input
                      type="number"
                      value={supCreditLimit}
                      onChange={(e) => setSupCreditLimit(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Status</label>
                    <select
                      value={supStatus}
                      onChange={(e) => setSupStatus(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Nonaktif">Nonaktif</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 6 - LAIN-LAIN */}
              <div className="bg-gray-50/70 border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="font-bold text-gray-900 border-b border-gray-200 pb-2">
                  SECTION 6 — LAIN-LAIN (RATING & LOGO)
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      Rating Supplier (1-5 Bintang)
                    </label>
                    <select
                      value={supRating}
                      onChange={(e) => setSupRating(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 - Sangat Baik)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 - Baik)</option>
                      <option value={3}>⭐⭐⭐ (3 - Cukup)</option>
                      <option value={2}>⭐⭐ (2 - Kurang)</option>
                      <option value={1}>⭐ (1 - Buruk)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      Catatan Supplier
                    </label>
                    <input
                      type="text"
                      value={supNotes}
                      onChange={(e) => setSupNotes(e.target.value)}
                      placeholder="Catatan pengiriman / diskon khusus"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
                <div>
                  <UploadFoto
                    label="Logo Supplier (Opsional)"
                    photos={supLogoUrl ? [supLogoUrl] : []}
                    onChange={(urls) => {
                      setSupLogoUrl(urls[0] || '');
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={() => setSupplierFormOpen(false)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleSaveSupplier(true)}
                className="px-4 py-2.5 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-bold"
              >
                Simpan & Tambah Lagi
              </button>
              <button
                type="button"
                onClick={() => handleSaveSupplier(false)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                Simpan Supplier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: DETAIL SUPPLIER (4 TAB: PROFIL, PO, PEMBAYARAN, PRODUK)       */}
      {/* ===================================================================== */}
      {selectedDetailSupplier && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-xl">
            <div className="flex items-start justify-between border-b border-gray-200 pb-4">
              <div>
                <div className="text-xs font-mono font-bold text-emerald-700">
                  {selectedDetailSupplier.code} · {selectedDetailSupplier.category}
                </div>
                <h2 className="text-lg font-bold text-gray-900 mt-0.5">
                  {selectedDetailSupplier.name}
                </h2>
                <p className="text-xs text-gray-500">
                  PIC: {selectedDetailSupplier.picName || '-'} · Tempo {selectedDetailSupplier.tempoDays} Hari · Status:{' '}
                  {selectedDetailSupplier.status || 'Aktif'}
                </p>
              </div>
              <button
                onClick={() => setSelectedDetailSupplier(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Tabs Navigation */}
            <div className="flex flex-wrap gap-1 p-1 bg-gray-100 rounded-lg border border-gray-200">
              {(
                [
                  { id: 'PROFIL', label: 'TAB 1 - PROFIL & ALAMAT' },
                  { id: 'RIWAYAT_PO', label: 'TAB 2 - RIWAYAT PO' },
                  { id: 'RIWAYAT_PEMBAYARAN', label: 'TAB 3 - RIWAYAT PEMBAYARAN' },
                  { id: 'PRODUK', label: 'TAB 4 - PRODUK & HARGA' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSupplierDetailTab(tab.id)}
                  className={`px-3.5 py-2 rounded-md text-xs font-bold transition-colors ${
                    supplierDetailTab === tab.id
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: PROFIL */}
            {supplierDetailTab === 'PROFIL' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 border border-gray-200 rounded-xl space-y-2">
                  <div className="font-bold text-gray-900">Informasi Kontak & Identitas</div>
                  <div className="grid grid-cols-3 py-1 border-b border-gray-100">
                    <span className="text-gray-500">Jenis / Kategori:</span>
                    <span className="col-span-2 font-semibold text-gray-900">
                      {selectedDetailSupplier.supplierType || 'PT'} / {selectedDetailSupplier.category}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 py-1 border-b border-gray-100">
                    <span className="text-gray-500">HP / WhatsApp:</span>
                    <span className="col-span-2 font-semibold text-emerald-700">
                      {selectedDetailSupplier.phone}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 py-1 border-b border-gray-100">
                    <span className="text-gray-500">Telepon / Email:</span>
                    <span className="col-span-2 text-gray-800">
                      {selectedDetailSupplier.officePhone || '-'} / {selectedDetailSupplier.email || '-'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 py-1 border-b border-gray-100">
                    <span className="text-gray-500">NPWP:</span>
                    <span className="col-span-2 font-mono text-gray-800">
                      {selectedDetailSupplier.npwp || '-'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 py-1">
                    <span className="text-gray-500">Rating & Limit:</span>
                    <span className="col-span-2 font-semibold text-gray-900">
                      {'⭐'.repeat(Math.round(selectedDetailSupplier.rating || 5))} · Limit{' '}
                      {formatRp(selectedDetailSupplier.creditLimit || 0)}
                    </span>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-xl space-y-2">
                  <div className="font-bold text-gray-900">Rekening Bank Terdaftar</div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="font-bold text-emerald-950">
                      {selectedDetailSupplier.bankName} — {selectedDetailSupplier.bankAccount}
                    </div>
                    <div className="text-emerald-800 mt-0.5">
                      a.n. {selectedDetailSupplier.bankAccountOwner || selectedDetailSupplier.name} (
                      {selectedDetailSupplier.bankBranch || 'Cabang Utama'})
                    </div>
                  </div>
                  {(selectedDetailSupplier.additionalBanks || []).map((b) => (
                    <div key={b.id} className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="font-bold text-gray-900">
                        {b.bankName} — {b.accountNumber}
                      </div>
                      <div className="text-gray-600">a.n. {b.accountOwner}</div>
                    </div>
                  ))}
                </div>

                <div className="md:col-span-2 p-4 border border-gray-200 rounded-xl space-y-2">
                  <div className="font-bold text-gray-900">Alamat Lengkap & Google Maps</div>
                  <p className="text-gray-800 font-medium">
                    {selectedDetailSupplier.address}
                    {selectedDetailSupplier.kelurahan ? `, Kel. ${selectedDetailSupplier.kelurahan}` : ''}
                    {selectedDetailSupplier.kecamatan ? `, Kec. ${selectedDetailSupplier.kecamatan}` : ''}
                    {selectedDetailSupplier.city ? `, ${selectedDetailSupplier.city}` : ''}
                    {selectedDetailSupplier.province ? `, ${selectedDetailSupplier.province}` : ''}{' '}
                    {selectedDetailSupplier.postalCode || ''}
                  </p>
                  {selectedDetailSupplier.landmark && (
                    <p className="text-gray-500">Patokan: {selectedDetailSupplier.landmark}</p>
                  )}
                  <div className="w-full h-48 rounded-lg overflow-hidden border border-gray-200 mt-2">
                    <iframe
                      title="Lokasi Supplier"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      src={`https://www.google.com/maps?q=${encodeURIComponent(
                        `${selectedDetailSupplier.address} ${selectedDetailSupplier.city || 'Kendari'}`
                      )}&output=embed`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: RIWAYAT PO */}
            {supplierDetailTab === 'RIWAYAT_PO' && (
              <div className="space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={poDateFilter}
                      onChange={(e) => setPoDateFilter(e.target.value)}
                      className="px-2.5 py-1.5 border border-gray-300 rounded-lg"
                    />
                    <select
                      value={poStatusFilter}
                      onChange={(e) => setPoStatusFilter(e.target.value)}
                      className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
                    >
                      <option value="ALL">Semua Status PO</option>
                      <option value="Approved">Approved</option>
                      <option value="Menunggu Approval Direktur">Menunggu Approval Direktur</option>
                    </select>
                  </div>
                  <div className="font-bold text-emerald-700">
                    Total Nilai PO:{' '}
                    {formatRp(
                      purchaseOrders
                        .filter(
                          (po) =>
                            po.supplierId === selectedDetailSupplier.id ||
                            po.supplierName === selectedDetailSupplier.name
                        )
                        .reduce((s, po) => s + po.grandTotal, 0)
                    )}
                  </div>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500">
                      <th className="py-2">No PO</th>
                      <th className="py-2">Tanggal</th>
                      <th className="py-2">Rincian Item</th>
                      <th className="py-2 text-right">Nilai PO</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {purchaseOrders
                      .filter(
                        (po) =>
                          (po.supplierId === selectedDetailSupplier.id ||
                            po.supplierName === selectedDetailSupplier.name) &&
                          (poStatusFilter === 'ALL' || po.status === poStatusFilter) &&
                          (!poDateFilter || po.createdAt.startsWith(poDateFilter))
                      )
                      .map((po) => (
                        <tr key={po.id}>
                          <td className="py-2.5 font-mono font-bold">{po.id}</td>
                          <td className="py-2.5">{po.createdAt}</td>
                          <td className="py-2.5">
                            {po.items.map((i) => `${i.materialName} (${i.qty} ${i.unit})`).join(', ')}
                          </td>
                          <td className="py-2.5 text-right font-bold tabular-nums">
                            {formatRp(po.grandTotal)}
                          </td>
                          <td className="py-2.5 font-semibold text-emerald-700">{po.status}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 3: RIWAYAT PEMBAYARAN */}
            {supplierDetailTab === 'RIWAYAT_PEMBAYARAN' && (
              <div className="space-y-3 text-xs">
                {(() => {
                  const supPOs = purchaseOrders.filter(
                    (po) =>
                      po.supplierId === selectedDetailSupplier.id ||
                      po.supplierName === selectedDetailSupplier.name
                  );
                  const totalPoVal = supPOs.reduce((s, p) => s + p.grandTotal, 0);
                  const supPayments = cashTransactions.filter(
                    (tx) =>
                      tx.type === 'KAS_KELUAR' &&
                      (tx.supplierName === selectedDetailSupplier.name ||
                        tx.description.toLowerCase().includes(selectedDetailSupplier.name.toLowerCase()))
                  );
                  const totalPaid = supPayments.reduce((s, tx) => s + tx.amount, 0);
                  const remainingDebt = Math.max(0, totalPoVal - totalPaid);

                  return (
                    <>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                          <div className="text-gray-500">Total Tagihan PO</div>
                          <div className="text-base font-bold text-gray-900 mt-0.5 tabular-nums">
                            {formatRp(totalPoVal)}
                          </div>
                        </div>
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <div className="text-emerald-700">Total Dibayar (Kas Keluar)</div>
                          <div className="text-base font-bold text-emerald-800 mt-0.5 tabular-nums">
                            {formatRp(totalPaid)}
                          </div>
                        </div>
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                          <div className="text-amber-800">Sisa Hutang Supplier</div>
                          <div className="text-base font-bold text-amber-900 mt-0.5 tabular-nums">
                            {formatRp(remainingDebt)} ({remainingDebt === 0 ? 'LUNAS' : 'BELUM LUNAS'})
                          </div>
                        </div>
                      </div>

                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200 text-gray-500">
                            <th className="py-2">No Transaksi</th>
                            <th className="py-2">Tanggal</th>
                            <th className="py-2">Keterangan Pembayaran</th>
                            <th className="py-2">Akun Kas/Bank</th>
                            <th className="py-2 text-right">Nominal Dibayar</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {supPayments.map((tx) => (
                            <tr key={tx.id}>
                              <td className="py-2.5 font-mono font-bold">{tx.id}</td>
                              <td className="py-2.5">{tx.date}</td>
                              <td className="py-2.5">{tx.description}</td>
                              <td className="py-2.5">{tx.cashAccount}</td>
                              <td className="py-2.5 text-right font-bold text-emerald-700 tabular-nums">
                                {formatRp(tx.amount)}
                              </td>
                            </tr>
                          ))}
                          {supPayments.length === 0 && (
                            <tr>
                              <td colSpan={5} className="py-6 text-center text-gray-400">
                                Belum ada riwayat pembayaran Kas Keluar untuk supplier ini.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </>
                  );
                })()}
              </div>
            )}

            {/* TAB 4: PRODUK & UPDATE HARGA */}
            {supplierDetailTab === 'PRODUK' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Kode Material</label>
                    <input
                      type="text"
                      value={newProdCode}
                      onChange={(e) => setNewProdCode(e.target.value)}
                      placeholder="MT-2026-0001"
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded bg-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="font-semibold text-gray-700 block mb-1">Nama Material</label>
                    <input
                      type="text"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      placeholder="Semen Tonasa 50 Kg"
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Harga Terakhir (Rp)</label>
                    <input
                      type="number"
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newProdName.trim()) {
                        toast.error('Isi nama material terlebih dahulu!');
                        return;
                      }
                      updateSupplierProductPrice(
                        selectedDetailSupplier.id,
                        newProdCode || 'MT-NEW',
                        newProdName.trim(),
                        newProdUnit,
                        Number(newProdPrice)
                      );
                      const refreshed = useAppStore
                        .getState()
                        .suppliers.find((x) => x.id === selectedDetailSupplier.id);
                      if (refreshed) setSelectedDetailSupplier(refreshed);
                      setNewProdName('');
                      toast.success('✅ Harga material supplier berhasil diperbarui!');
                    }}
                    className="py-2 px-3 bg-emerald-600 text-white font-bold rounded-lg"
                  >
                    + Simpan / Update Harga
                  </button>
                </div>

                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500">
                      <th className="py-2">Kode Material</th>
                      <th className="py-2">Nama Material</th>
                      <th className="py-2">Satuan</th>
                      <th className="py-2 text-right">Harga Terakhir</th>
                      <th className="py-2">Terakhir Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(selectedDetailSupplier.suppliedProducts || []).map((prod) => (
                      <tr key={prod.id}>
                        <td className="py-2.5 font-mono font-bold">{prod.materialCode}</td>
                        <td className="py-2.5 font-semibold text-gray-900">{prod.materialName}</td>
                        <td className="py-2.5">{prod.unit}</td>
                        <td className="py-2.5 text-right font-bold text-emerald-700 tabular-nums">
                          {formatRp(prod.lastPrice)}
                        </td>
                        <td className="py-2.5 text-gray-500">{prod.updatedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: INPUT STOK AWAL MANUAL (BARU)                                */}
      {/* ===================================================================== */}
      {initialStockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-2xl w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Opname Stok Existing Gudang
                </span>
                <h2 className="text-base font-bold text-gray-900">
                  Form Input Stok Awal Manual (+ Auto-Jurnal Saldo Awal)
                </h2>
              </div>
              <button
                onClick={() => setInitialStockModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Tanggal Input (Default: Hari Ini) *
                </label>
                <input
                  type="date"
                  value={initDate}
                  onChange={(e) => setInitDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Gudang / Proyek *</label>
                <select
                  value={initWarehouse}
                  onChange={(e) => setInitWarehouse(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white font-semibold"
                >
                  <option value="Bahagia Land">Bahagia Land (PT Tata Bahagia Land)</option>
                  <option value="Bahagia Residence">Bahagia Residence (PT Bahagia Prima Property)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Kategori Material *
                </label>
                <select
                  value={initCategory}
                  onChange={(e) => setInitCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="Toko">Toko (Semen, Besi, Cat, Keramik, Atap)</option>
                  <option value="Bumi">Bumi (Pasir, Batu Gunung, Batu Bata, Tanah Timbun)</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Pilih Material dari Inventori / Buat Baru *
                </label>
                <select
                  value={initMaterialSelect}
                  onChange={(e) => handleSelectExistingForInitial(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="NEW">+ Material Baru (Input Manual)</option>
                  {inventory.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.code} - {inv.name} ({inv.warehouse})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Nama Material (Auto-Isi / Ketik) *
                </label>
                <input
                  type="text"
                  value={initMaterialName}
                  onChange={(e) => setInitMaterialName(e.target.value)}
                  placeholder="Contoh: Semen Tonasa 50 Kg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Kode Barang (Auto-Generate)
                </label>
                <input
                  type="text"
                  value={autoGeneratedMaterialCode}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 bg-gray-100 font-mono font-bold text-gray-700 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Satuan *</label>
                <select
                  value={initUnit}
                  onChange={(e) => setInitUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  {MATERIAL_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Stok Awal (Angka) *
                </label>
                <input
                  type="number"
                  value={initQty}
                  onChange={(e) => setInitQty(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Stok Minimum (Untuk Alert) *
                </label>
                <input
                  type="number"
                  value={initMinStock}
                  onChange={(e) => setInitMinStock(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Harga Satuan (Rp) *
                </label>
                <input
                  type="number"
                  value={initUnitPrice}
                  onChange={(e) => setInitUnitPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <span className="font-semibold text-emerald-900">
                Total Nilai Stok Awal (Stok × Harga):
              </span>
              <span className="text-base font-bold text-emerald-700 tabular-nums">
                {formatRp(initQty * initUnitPrice)}
              </span>
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">Keterangan</label>
              <input
                type="text"
                value={initDesc}
                onChange={(e) => setInitDesc(e.target.value)}
                placeholder="Stok opname awal Oktober 2026"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <UploadFoto
              label="Upload Bukti Opname Awal (Foto/PDF, Opsional)"
              photos={initProofUrl ? [initProofUrl] : []}
              onChange={(urls) => {
                setInitProofUrl(urls[0] || '');
              }}
            />

            <div className="flex flex-wrap justify-end gap-2 border-t border-gray-200 pt-3">
              <button
                type="button"
                onClick={() => setInitialStockModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleSaveInitialStock(true)}
                className="px-4 py-2 border border-emerald-600 text-emerald-700 rounded-lg font-bold"
              >
                Simpan & Tambah Lagi
              </button>
              <button
                type="button"
                onClick={() => handleSaveInitialStock(false)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: FORM STOK MASUK (SM-2026-10-0001)                            */}
      {/* ===================================================================== */}
      {stockInModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-xl w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <span className="text-[11px] font-mono font-bold text-teal-700">{nextSmNumber}</span>
                <h2 className="text-base font-bold text-gray-900">
                  Form Tambah Stok Masuk (+ Auto-Jurnal Persediaan)
                </h2>
              </div>
              <button onClick={() => setStockInModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Tanggal Masuk *</label>
                <input
                  type="date"
                  value={smDate}
                  onChange={(e) => setSmDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">No Transaksi (Auto)</label>
                <input
                  type="text"
                  value={nextSmNumber}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 bg-gray-100 font-mono font-bold rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Gudang / Proyek *</label>
                <select
                  value={smWarehouse}
                  onChange={(e) => setSmWarehouse(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="Bahagia Land">Bahagia Land</option>
                  <option value="Bahagia Residence">Bahagia Residence</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Material *</label>
                <select
                  value={smMaterialId}
                  onChange={(e) => {
                    setSmMaterialId(e.target.value);
                    const found = inventory.find((i) => i.id === e.target.value);
                    if (found) setSmUnitPrice(found.unitPrice);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white font-semibold"
                >
                  {inventory.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.code} - {inv.name} (Stok: {inv.stock} {inv.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Kuantitas Masuk ({inventory.find((i) => i.id === smMaterialId)?.unit || 'Satuan'}) *
                </label>
                <input
                  type="number"
                  value={smQty}
                  onChange={(e) => setSmQty(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Harga Satuan (Rp) *</label>
                <input
                  type="number"
                  value={smUnitPrice}
                  onChange={(e) => setSmUnitPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Supplier</label>
                <select
                  value={smSupplierId}
                  onChange={(e) => setSmSupplierId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">No PO / Invoice</label>
                <input
                  type="text"
                  value={smPoInvoiceNo}
                  onChange={(e) => setSmPoInvoiceNo(e.target.value)}
                  placeholder="PO-2026-0001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex justify-between items-center">
              <span className="font-semibold text-teal-900">
                Total Nilai Masuk (Dr Persediaan / Cr Utang Supplier):
              </span>
              <span className="text-sm font-bold text-teal-800 tabular-nums">
                {formatRp(smQty * smUnitPrice)}
              </span>
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">Keterangan</label>
              <input
                type="text"
                value={smDesc}
                onChange={(e) => setSmDesc(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <UploadFoto
              label="Upload Bukti Surat Jalan / Nota (Opsional)"
              photos={smProofUrl ? [smProofUrl] : []}
              onChange={(urls) => {
                setSmProofUrl(urls[0] || '');
              }}
            />

            <div className="flex justify-end gap-2 border-t border-gray-200 pt-3">
              <button
                type="button"
                onClick={() => setStockInModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveStockIn}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold"
              >
                Simpan Stok Masuk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 5: FORM STOK KELUAR (SK-2026-10-0001)                           */}
      {/* ===================================================================== */}
      {stockOutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-xl w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <span className="text-[11px] font-mono font-bold text-amber-700">{nextSkNumber}</span>
                <h2 className="text-base font-bold text-gray-900">
                  Form Stok Keluar (+ Auto-Jurnal Bangunan Dalam Penyelesaian)
                </h2>
              </div>
              <button onClick={() => setStockOutModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Tanggal Keluar *</label>
                <input
                  type="date"
                  value={skDate}
                  onChange={(e) => setSkDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">No Transaksi (Auto)</label>
                <input
                  type="text"
                  value={nextSkNumber}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 bg-gray-100 font-mono font-bold rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Gudang / Proyek *</label>
                <select
                  value={skWarehouse}
                  onChange={(e) => setSkWarehouse(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="Bahagia Land">Bahagia Land</option>
                  <option value="Bahagia Residence">Bahagia Residence</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Material *</label>
                <select
                  value={skMaterialId}
                  onChange={(e) => setSkMaterialId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white font-semibold"
                >
                  {inventory.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.code} - {inv.name} (Tersedia: {inv.stock} {inv.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Kuantitas Keluar (Maks: {inventory.find((i) => i.id === skMaterialId)?.stock || 0}{' '}
                  {inventory.find((i) => i.id === skMaterialId)?.unit || ''}) *
                </label>
                <input
                  type="number"
                  value={skQty}
                  onChange={(e) => setSkQty(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Tujuan Pemakaian *</label>
                <select
                  value={skPurpose}
                  onChange={(e) => setSkPurpose(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="Proyek Unit">Proyek Unit</option>
                  <option value="Fasum">Fasum</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>

            {skPurpose === 'Proyek Unit' && (
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Pilih / Ketik Unit atau Blok Tujuan
                </label>
                <input
                  type="text"
                  list="kavling-unit-list"
                  value={skUnitBlock}
                  onChange={(e) => setSkUnitBlock(e.target.value)}
                  placeholder="Contoh: Unit A01 / Blok B"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <datalist id="kavling-unit-list">
                  <option value="Unit A01" />
                  <option value="Unit A02" />
                  {kavling.slice(0, 25).map((k) => (
                    <option key={k.id} value={`Unit ${k.code}`} />
                  ))}
                </datalist>
              </div>
            )}

            <div>
              <label className="font-semibold text-gray-700 block mb-1">Keterangan</label>
              <input
                type="text"
                value={skDesc}
                onChange={(e) => setSkDesc(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <UploadFoto
              label="Upload Bukti Bon Pengambilan Barang (Opsional)"
              photos={skProofUrl ? [skProofUrl] : []}
              onChange={(urls) => {
                setSkProofUrl(urls[0] || '');
              }}
            />

            <div className="flex justify-end gap-2 border-t border-gray-200 pt-3">
              <button
                type="button"
                onClick={() => setStockOutModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveStockOut}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold"
              >
                Simpan Stok Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 6: FORM STOK OPNAME LENGKAP                                     */}
      {/* ===================================================================== */}
      {opnameModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                  Penyesuaian Stok Fisik vs Sistem
                </span>
                <h2 className="text-base font-bold text-gray-900">
                  Form Stok Opname Gudang (+ Auto-Jurnal Selisih & Notifikasi Admin)
                </h2>
              </div>
              <button onClick={() => setOpnameModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Tanggal Opname *</label>
                <input
                  type="date"
                  value={opnDate}
                  onChange={(e) => setOpnDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Gudang / Proyek *</label>
                <select
                  value={opnWarehouse}
                  onChange={(e) => setOpnWarehouse(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white font-semibold"
                >
                  <option value="Bahagia Land">Bahagia Land</option>
                  <option value="Bahagia Residence">Bahagia Residence</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Petugas Opname (Auto: User Login)
                </label>
                <input
                  type="text"
                  value={currentUser?.name || 'La Ode Darman (Logistik)'}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-lg font-semibold"
                />
              </div>
            </div>

            {/* Tabel Daftar Material Opname */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-600">
                    <th className="py-2.5 px-3">Nama Material</th>
                    <th className="py-2.5 px-3 text-right">Stok Sistem</th>
                    <th className="py-2.5 px-3 text-right">Stok Fisik</th>
                    <th className="py-2.5 px-3 text-right">Selisih</th>
                    <th className="py-2.5 px-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {opnameFilteredInventory.map((inv) => {
                    const phys = opnRows[inv.id]?.physicalStock ?? inv.stock;
                    const diff = phys - inv.stock;
                    return (
                      <tr key={inv.id}>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-gray-900">{inv.name}</div>
                          <div className="text-[11px] text-gray-500">
                            {inv.code} · {formatRp(inv.unitPrice)}/{inv.unit}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold">
                          {inv.stock} {inv.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <input
                            type="number"
                            value={phys}
                            onChange={(e) =>
                              setOpnRows({
                                ...opnRows,
                                [inv.id]: {
                                  physicalStock: Number(e.target.value),
                                  notes: opnRows[inv.id]?.notes || '',
                                },
                              })
                            }
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-right font-bold"
                          />
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-bold tabular-nums ${
                            diff < 0 ? 'text-red-600' : diff > 0 ? 'text-emerald-700' : 'text-gray-500'
                          }`}
                        >
                          {diff > 0 ? `+${diff}` : diff} {inv.unit}
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={opnRows[inv.id]?.notes || ''}
                            onChange={(e) =>
                              setOpnRows({
                                ...opnRows,
                                [inv.id]: {
                                  physicalStock: phys,
                                  notes: e.target.value,
                                },
                              })
                            }
                            placeholder="Catatan fisik rak..."
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
              <span className="font-semibold text-blue-950">Total Nilai Selisih Opname:</span>
              <span
                className={`text-sm font-bold tabular-nums ${
                  opnameTotalDifferenceValue < 0 ? 'text-red-600' : 'text-emerald-700'
                }`}
              >
                {formatRp(opnameTotalDifferenceValue)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Keterangan Umum</label>
                <input
                  type="text"
                  value={opnGeneralNotes}
                  onChange={(e) => setOpnGeneralNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Tanda Tangan Digital Petugas *
                </label>
                <input
                  type="text"
                  value={opnSignature}
                  onChange={(e) => setOpnSignature(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono font-bold text-emerald-800"
                />
              </div>
            </div>

            <UploadFoto
              label="Upload Foto Dokumentasi Opname Gudang"
              photos={opnPhotoUrl ? [opnPhotoUrl] : []}
              onChange={(urls) => {
                setOpnPhotoUrl(urls[0] || '');
              }}
            />

            <div className="flex justify-end gap-2 border-t border-gray-200 pt-3">
              <button
                type="button"
                onClick={() => setOpnameModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveOpnameBatch}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
              >
                Simpan & Sesuaikan Stok Sistem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 7: EDIT MASTER STOK (Stok Saat Ini Dikunci)                     */}
      {/* ===================================================================== */}
      {editStockItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                ✏️ Edit Data Stok ({editStockItem.code})
              </h3>
              <button onClick={() => setEditStockItem(null)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
              Stok saat ini (<b>{editStockItem.stock} {editStockItem.unit}</b>) dikunci agar akuntabel. Perubahan jumlah stok wajib melalui <b>Stok Masuk</b>, <b>Stok Keluar</b>, <b>Koreksi</b>, atau <b>Stok Opname</b>.
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Nama Material *</label>
                <input
                  type="text"
                  value={editMatName}
                  onChange={(e) => setEditMatName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Satuan *</label>
                  <select
                    value={editMatUnit}
                    onChange={(e) => setEditMatUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    {MATERIAL_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Stok Minimum *</label>
                  <input
                    type="number"
                    value={editMatMinStock}
                    onChange={(e) => setEditMatMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Keterangan</label>
                <textarea
                  rows={2}
                  value={editMatNotes}
                  onChange={(e) => setEditMatNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditStockItem(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEditStock}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 8: KURANGI STOK (KOREKSI DENGAN ALASAN)                         */}
      {/* ===================================================================== */}
      {reduceStockItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                ➖ Kurangi Stok / Koreksi ({reduceStockItem.name})
              </h3>
              <button onClick={() => setReduceStockItem(null)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Jumlah Pengurangan (Stok Saat Ini: {reduceStockItem.stock} {reduceStockItem.unit}) *
                </label>
                <input
                  type="number"
                  value={reduceQty}
                  onChange={(e) => setReduceQty(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Alasan Koreksi *</label>
                <select
                  value={reduceReason}
                  onChange={(e) => setReduceReason(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="Rusak">Rusak</option>
                  <option value="Hilang">Hilang</option>
                  <option value="Kadaluarsa">Kadaluarsa / Membatu</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Rincian Keterangan Koreksi *
                </label>
                <textarea
                  rows={2}
                  value={reduceNotes}
                  onChange={(e) => setReduceNotes(e.target.value)}
                  placeholder="Contoh: 5 sak semen mengeras terkena rembesan air hujan"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReduceStockItem(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReduceStock}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold"
              >
                Simpan Koreksi & Auto-Jurnal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 9: HAPUS STOK (KETIK "HAPUS" + ALASAN WAJIB + SOFT DELETE)      */}
      {/* ===================================================================== */}
      {deleteStockTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="text-base font-bold text-red-600">
                🗑️ Konfirmasi Hapus Kartu Stok ({deleteStockTarget.code})
              </h3>
              <button onClick={() => setDeleteStockTarget(null)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600">
              Data <b>{deleteStockTarget.name}</b> akan dipindahkan ke <b>Trash Bin (30 Hari)</b> dan dapat di-restore kapan saja oleh Admin.
            </p>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">Alasan Hapus (Wajib) *</label>
              <input
                type="text"
                value={deleteStockReason}
                onChange={(e) => setDeleteStockReason(e.target.value)}
                placeholder="Contoh: Duplikasi kode barang / material sudah tidak dipakai"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">
                Ketik <b>HAPUS</b> untuk konfirmasi *
              </label>
              <input
                type="text"
                value={deleteConfirmWord}
                onChange={(e) => setDeleteConfirmWord(e.target.value)}
                placeholder="HAPUS"
                className="w-full px-3 py-2 border border-red-300 rounded-lg font-mono font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteStockTarget(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDeleteStock}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
              >
                Hapus ke Trash (Soft Delete)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 10: DETAIL RIWAYAT KARTU STOK PER MATERIAL                      */}
      {/* ===================================================================== */}
      {detailCardItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-start justify-between border-b border-gray-200 pb-3">
              <div>
                <span className="font-mono font-bold text-emerald-700">{detailCardItem.code}</span>
                <h3 className="text-base font-bold text-gray-900">
                  👁️ Riwayat Lengkap Kartu Stok: {detailCardItem.name}
                </h3>
                <p className="text-gray-500">
                  Gudang: {detailCardItem.warehouse} · Stok Saat Ini:{' '}
                  <b>
                    {detailCardItem.stock} {detailCardItem.unit}
                  </b>
                </p>
              </div>
              <button onClick={() => setDetailCardItem(null)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                    <th className="py-2 px-3">No Transaksi</th>
                    <th className="py-2 px-3">Tanggal</th>
                    <th className="py-2 px-3">Jenis</th>
                    <th className="py-2 px-3 text-right">Masuk</th>
                    <th className="py-2 px-3 text-right">Keluar</th>
                    <th className="py-2 px-3 text-right">Saldo</th>
                    <th className="py-2 px-3">Keterangan / Tujuan / Supplier</th>
                    <th className="py-2 px-3">Petugas</th>
                    <th className="py-2 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stockMovements
                    .filter(
                      (m) => m.materialId === detailCardItem.id || m.materialCode === detailCardItem.code
                    )
                    .map((m) => (
                      <tr key={m.id}>
                        <td className="py-2.5 px-3 font-mono font-bold">{m.referenceNo}</td>
                        <td className="py-2.5 px-3">{m.date}</td>
                        <td className="py-2.5 px-3 font-semibold">{m.movementType}</td>
                        <td className="py-2.5 px-3 text-right text-emerald-700 font-bold tabular-nums">
                          {m.qtyIn > 0 ? `+${m.qtyIn}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right text-amber-700 font-bold tabular-nums">
                          {m.qtyOut > 0 ? `-${m.qtyOut}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold tabular-nums">
                          {m.balanceAfter} {m.unit}
                        </td>
                        <td className="py-2.5 px-3">
                          <div>{m.description}</div>
                          {m.supplierName && (
                            <div className="text-[11px] text-gray-500">
                              Supplier: {m.supplierName} ({m.poOrInvoiceNo || '-'})
                            </div>
                          )}
                          {m.unitBlockCode && (
                            <div className="text-[11px] text-emerald-700">
                              Tujuan: {m.purposeType} — {m.unitBlockCode}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-gray-600">{m.officerName}</td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="inline-flex gap-1">
                            <button
                              onClick={() => {
                                setEditingMovement(m);
                                setEditMovQtyIn(m.qtyIn);
                                setEditMovQtyOut(m.qtyOut);
                                setEditMovPrice(m.unitPrice);
                                setEditMovDesc(m.description);
                              }}
                              className="px-2 py-0.5 border border-gray-200 rounded text-[11px]"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => {
                                deleteStockMovementEntry(m.id, 'Koreksi hapus baris mutasi kartu stok');
                                toast.success('Mutasi kartu stok dihapus & saldo disesuaikan.');
                              }}
                              className="px-2 py-0.5 border border-red-200 text-red-600 rounded text-[11px]"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {editingMovement && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                <div className="font-bold text-gray-900">
                  Edit Baris Mutasi ({editingMovement.referenceNo})
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-gray-600 mb-1">Qty Masuk</label>
                    <input
                      type="number"
                      value={editMovQtyIn}
                      onChange={(e) => setEditMovQtyIn(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Qty Keluar</label>
                    <input
                      type="number"
                      value={editMovQtyOut}
                      onChange={(e) => setEditMovQtyOut(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Keterangan</label>
                    <input
                      type="text"
                      value={editMovDesc}
                      onChange={(e) => setEditMovDesc(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded bg-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingMovement(null)}
                    className="px-3 py-1.5 border border-gray-300 rounded"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      updateStockMovementEntry(editingMovement.id, {
                        qtyIn: editMovQtyIn,
                        qtyOut: editMovQtyOut,
                        unitPrice: editMovPrice,
                        description: editMovDesc,
                      });
                      setEditingMovement(null);
                      const updatedCard = useAppStore
                        .getState()
                        .inventory.find((x) => x.id === detailCardItem.id);
                      if (updatedCard) setDetailCardItem(updatedCard);
                      toast.success('✅ Baris mutasi kartu stok berhasil diperbarui!');
                    }}
                    className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded"
                  >
                    Simpan Mutasi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 11: IMPORT EXCEL KARTU STOK                                     */}
      {/* ===================================================================== */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-xl w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                📥 Import Excel / CSV Data Kartu Stok Gudang
              </h3>
              <button onClick={() => setImportModalOpen(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600">
              Format kolom (pisahkan dengan titik koma <code>;</code>):{' '}
              <code>Kode;Nama Material;Gudang;Kategori(Toko/Bumi);Satuan;Stok Awal;Stok Min;Harga;Keterangan</code>
            </p>
            <textarea
              rows={5}
              value={importCsvText}
              onChange={(e) => setImportCsvText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg font-mono text-[11px]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleBulkImport}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
              >
                Proses Import Kartu Stok
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
