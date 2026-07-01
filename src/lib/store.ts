import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ProjectDetails {
  projectName: string;
  clientName: string;
  contractorName: string;
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
  floor: string;
  category: string;
  item: string;
  unit: string;
  quantity: number;
  wastage: number;
  rate: number;
  gst: number;
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
  contractorName: "",
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
