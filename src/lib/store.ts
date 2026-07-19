import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ProjectDetails {
  projectName: string;
  clientName: string;
  consultantName: string;
  contractorName: string;
  status: "Planning" | "In Progress" | "On Hold" | "Completed";
  city: string;
  state: string;
  pincode: string;
  projectType: "Residential" | "Commercial" | "Mixed";
  buildingConfig: string;
  numFloors: number;
  startDate: string;
  endDate: string;
  defaultWorkers: number;
  totalBuiltUpArea: number;
  soilType: string;
  foundationType: string;
  footingDepth: number;
  floorHeight: number;
  plinthHeight: number;
  rccGrade: string;
  steelGrade: string;
  steelPercentage: number;
  costPerSqft: number;
  advancePercentage: number;
  gstPercentage: number;
  retentionMoney: number;
  securityDeposit: number;
  labourCess: number;
  pvc: number;
  estimatedCost?: number;
}

export interface GanttTask {
  id: string;
  wbsId: string;
  name: string;
  start: string;
  end: string;
  duration: number;
  predecessors: string[];
  status: "not-started" | "in-progress" | "completed" | "delayed";
  progress: number;
  isMilestone: boolean;
  isCritical: boolean;
  float: number;
  resource: string;
  level: number;
  parentId?: string;
  baselineStart?: string;
  baselineEnd?: string;
  category: string;
}

export interface WBSNode {
  id: string;
  wbsId: string;
  name: string;
  parentId?: string;
  children: string[];
  isCollapsed: boolean;
  level: number;
}

export interface BOQItem {
  id: string;
  itemNo: string;
  floor: string;
  category: string;
  description: string;
  specification: string;
  activity: string;
  unit: string;
  quantity: number;
  wastage: number;
  rate: number;
  amount: number;
  contractor: string;
  vendor: string;
  material: number;
  labour: number;
  equipment: number;
  overhead: number;
  profit: number;
  gst: number;
  totalCost: number;
  remarks: string;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  userEmail: string | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

interface ProjectState {
  project: ProjectDetails;
  setProject: (p: Partial<ProjectDetails>) => void;
  history: ProjectDetails[];
  future: ProjectDetails[];
  undo: () => void;
  redo: () => void;
}

interface GanttState {
  tasks: GanttTask[];
  wbsNodes: WBSNode[];
  setTasks: (tasks: GanttTask[]) => void;
  updateTask: (id: string, changes: Partial<GanttTask>) => void;
  addTask: (task: GanttTask) => void;
  deleteTask: (id: string) => void;
  toggleWBSCollapse: (id: string) => void;
}

interface BOQState {
  items: BOQItem[];
  setItems: (items: BOQItem[]) => void;
  updateItem: (id: string, changes: Partial<BOQItem>) => void;
}

const defaultProject: ProjectDetails = {
  projectName: "",
  clientName: "",
  consultantName: "",
  contractorName: "",
  status: "Planning",
  city: "Chennai",
  state: "Tamil Nadu",
  pincode: "600001",
  projectType: "Residential",
  buildingConfig: "G+1",
  numFloors: 1,
  startDate: "2026-07-01",
  endDate: "2027-10-30",
  defaultWorkers: 60,
  totalBuiltUpArea: 1500,
  soilType: "Normal",
  foundationType: "Isolated",
  footingDepth: 2.5,
  floorHeight: 3.2,
  plinthHeight: 0.6,
  rccGrade: "M25",
  steelGrade: "Fe500",
  steelPercentage: 2.5,
  costPerSqft: 1500,
  advancePercentage: 10,
  gstPercentage: 18,
  retentionMoney: 5,
  securityDeposit: 2,
  labourCess: 1,
  pvc: 2,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      userEmail: null,
      login: (email, password) => {
        if (email === "sahulhameed03111@gmail.com" && password === "sahul26") {
          const token = btoa(`${email}:${Date.now()}`);
          set({ isAuthenticated: true, token, userEmail: email });
          return true;
        }
        return false;
      },
      logout: () => set({ isAuthenticated: false, token: null, userEmail: null }),
    }),
    { name: "buildtrack-auth" }
  )
);

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      project: defaultProject,
      history: [],
      future: [],
      setProject: (partial) => {
        const current = get().project;
        set((s) => ({
          project: { ...current, ...partial },
          history: [...s.history.slice(-30), current],
          future: [],
        }));
      },
      undo: () => {
        const { history, project } = get();
        if (history.length === 0) return;
        const prev = history[history.length - 1];
        set((s) => ({
          project: prev,
          history: s.history.slice(0, -1),
          future: [project, ...s.future],
        }));
      },
      redo: () => {
        const { future, project } = get();
        if (future.length === 0) return;
        const next = future[0];
        set((s) => ({
          project: next,
          history: [...s.history, project],
          future: s.future.slice(1),
        }));
      },
    }),
    { name: "buildtrack-project" }
  )
);

export const useGanttStore = create<GanttState>()(
  persist(
    (set) => ({
      tasks: [],
      wbsNodes: [],
      setTasks: (tasks) => set({ tasks }),
      updateTask: (id, changes) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...changes } : t)),
        })),
      addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      toggleWBSCollapse: (id) =>
        set((s) => ({
          wbsNodes: s.wbsNodes.map((n) =>
            n.id === id ? { ...n, isCollapsed: !n.isCollapsed } : n
          ),
        })),
    }),
    { name: "buildtrack-gantt" }
  )
);

export const useBOQStore = create<BOQState>()(
  persist(
    (set) => ({
      items: [],
      setItems: (items) => set({ items }),
      updateItem: (id, changes) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, ...changes } : i)),
        })),
    }),
    { name: "buildtrack-boq" }
  )
);

// --- New ERP Stores ---

export interface LabourRate {
  id: string;
  trade: string;
  dailyRate: number;
  monthlyRate: number;
  overtimeRate: number;
  availability: number;
  required: number;
}
interface LabourState {
  rates: LabourRate[];
  setRates: (rates: LabourRate[]) => void;
  updateRate: (id: string, changes: Partial<LabourRate>) => void;
  addRate: (rate: LabourRate) => void;
  deleteRate: (id: string) => void;
}
export const useLabourStore = create<LabourState>()(persist((set) => ({
  rates: [],
  setRates: (rates) => set({ rates }),
  updateRate: (id, changes) => set(s => ({ rates: s.rates.map(r => r.id === id ? { ...r, ...changes } : r) })),
  addRate: (rate) => set(s => ({ rates: [...s.rates, rate] })),
  deleteRate: (id) => set(s => ({ rates: s.rates.filter(r => r.id !== id) }))
}), { name: "buildtrack-labour-rates" }));

export interface Equipment {
  id: string;
  name: string;
  type: string;
  hourlyRate: number;
  status: "Active" | "Maintenance" | "Idle";
}
interface EquipmentState {
  equipmentList: Equipment[];
  setEquipment: (eq: Equipment[]) => void;
  updateEquipment: (id: string, changes: Partial<Equipment>) => void;
}
export const useEquipmentStore = create<EquipmentState>()(persist((set) => ({
  equipmentList: [],
  setEquipment: (eq) => set({ equipmentList: eq }),
  updateEquipment: (id, changes) => set(s => ({ equipmentList: s.equipmentList.map(e => e.id === id ? { ...e, ...changes } : e) }))
}), { name: "buildtrack-equipment" }));

export interface MaterialItem {
  id: string;
  name: string;
  category: string;
  brand: string;
  specification: string;
  unit: string;
  todayPrice: number;
  yesterdayPrice: number;
  requiredQuantity: number;
  stock: number;
  supplier: string;
  lastUpdated: string;
}
interface MaterialState {
  materials: MaterialItem[];
  setMaterials: (mats: MaterialItem[]) => void;
  updateMaterial: (id: string, changes: Partial<MaterialItem>) => void;
  addMaterial: (mat: MaterialItem) => void;
  deleteMaterial: (id: string) => void;
}
export const useMaterialStore = create<MaterialState>()(persist((set) => ({
  materials: [],
  setMaterials: (mats) => set({ materials: mats }),
  updateMaterial: (id, changes) => set(s => ({ materials: s.materials.map(m => m.id === id ? { ...m, ...changes } : m) })),
  addMaterial: (mat) => set(s => ({ materials: [...s.materials, mat] })),
  deleteMaterial: (id) => set(s => ({ materials: s.materials.filter(m => m.id !== id) }))
}), { name: "buildtrack-material" }));

export interface QualityIssue {
  id: string;
  title: string;
  description: string;
  status: "Open" | "Resolved";
  date: string;
}
interface QualityState {
  issues: QualityIssue[];
  setIssues: (issues: QualityIssue[]) => void;
  updateIssue: (id: string, changes: Partial<QualityIssue>) => void;
}
export const useQualityStore = create<QualityState>()(persist((set) => ({
  issues: [],
  setIssues: (issues) => set({ issues }),
  updateIssue: (id, changes) => set(s => ({ issues: s.issues.map(i => i.id === id ? { ...i, ...changes } : i) }))
}), { name: "buildtrack-quality" }));

export interface BillingRecord {
  id: string;
  title: string;
  amount: number;
  type: "RA Bill" | "Vendor Bill" | "Client Invoice";
  status: "Draft" | "Submitted" | "Approved" | "Paid";
  date: string;
}
interface BillingState {
  records: BillingRecord[];
  setRecords: (records: BillingRecord[]) => void;
  updateRecord: (id: string, changes: Partial<BillingRecord>) => void;
}
export const useBillingStore = create<BillingState>()(persist((set) => ({
  records: [],
  setRecords: (records) => set({ records }),
  updateRecord: (id, changes) => set(s => ({ records: s.records.map(r => r.id === id ? { ...r, ...changes } : r) }))
}), { name: "buildtrack-billing" }));
