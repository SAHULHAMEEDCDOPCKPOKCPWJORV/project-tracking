"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore, useProjectStore } from "@/lib/store";
import {
  Building2, LayoutDashboard, FolderOpen, CalendarDays,
  Network, ClipboardList, BarChart2,
  Download, LogOut, ChevronLeft, ChevronRight, ChevronDown,
  Undo2, Redo2, Cpu, User, Bell,
  Users, HardHat, Pickaxe, Truck, Wrench, ShieldAlert, FileText, Banknote, Calculator, FileCheck, ShoppingCart, Activity
} from "lucide-react";

type NavItem = { href: string; icon: any; label: string; };
type NavGroup = { group: string; items: NavItem[]; };

const navGroups: NavGroup[] = [
  {
    group: "Overview",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/dashboard/project", icon: FolderOpen, label: "Project Details" },
    ]
  },
  {
    group: "Planning",
    items: [
      { href: "/dashboard/schedule", icon: CalendarDays, label: "Planning Schedule" },
      { href: "/dashboard/pert", icon: Network, label: "PERT Network" },
    ]
  },
  {
    group: "Resources",
    items: [
      { href: "/dashboard/materials", icon: Pickaxe, label: "Material Price Management" },
      { href: "/dashboard/labour", icon: Users, label: "Labour Rate Board" },
    ]
  },
  {
    group: "Cost & Estimation",
    items: [
      { href: "/dashboard/boq", icon: ClipboardList, label: "Bill of Quantities (BOQ)" },
      { href: "/dashboard/estimation", icon: Calculator, label: "Estimation" },
    ]
  },
  {
    group: "Reporting",
    items: [
      { href: "/dashboard/analytics", icon: BarChart2, label: "Analytics" },
      { href: "/dashboard/reports", icon: FileText, label: "Project Report" },
    ]
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout, userEmail } = useAuthStore();
  const { project, undo, redo, history, future } = useProjectStore();
  const [collapsed, setCollapsed] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [saved, setSaved] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const defaultExp: Record<string, boolean> = {};
    navGroups.forEach(g => defaultExp[g.group] = true);
    return defaultExp;
  });

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (autoSave && history.length > 0) {
      const t = setTimeout(() => setSaved(true), 1500);
      const t2 = setTimeout(() => setSaved(false), 3500);
      return () => { clearTimeout(t); clearTimeout(t2); };
    }
  }, [history, autoSave]);

  if (!isAuthenticated) return null;

  const sidebarW = collapsed ? 64 : 260;

  const toggleGroup = (grp: string) => {
    setExpandedGroups(prev => ({ ...prev, [grp]: !prev[grp] }));
  };

  let currentPageLabel = "BuildTrack Pro";
  navGroups.forEach(g => {
    g.items.forEach(i => {
      if (pathname === i.href || (pathname !== "/dashboard" && pathname.startsWith(i.href) && i.href !== "/dashboard")) {
        currentPageLabel = i.label;
      }
    });
  });
  if (pathname === "/dashboard") currentPageLabel = "Executive Dashboard";

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:"#0a0e1a" }}>

      {/* ── Sidebar ────────────────────────────────────── */}
      <aside style={{
        width: sidebarW, minHeight:"100vh", background:"#0d1426",
        borderRight:"1px solid #1e2d4a", display:"flex", flexDirection:"column",
        transition:"width 0.25s ease", overflow:"hidden", flexShrink:0, position:"relative", zIndex:50
      }}>

        {/* Logo */}
        <div style={{ padding: collapsed ? "18px 12px" : "18px 16px",
          borderBottom:"1px solid #1e2d4a", display:"flex", alignItems:"center",
          gap:10, overflow:"hidden" }}>
          <div style={{
            width:36, height:36, borderRadius:10, flexShrink:0,
            background:"linear-gradient(135deg, #2563eb, #7c3aed)",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 4px 12px rgba(59,130,246,0.35)"
          }}>
            <Building2 size={20} color="white"/>
          </div>
          {!collapsed && (
            <div style={{ overflow:"hidden" }}>
              <div style={{ fontWeight:800, fontSize:14, color:"#f1f5f9", whiteSpace:"nowrap" }}>
                BuildTrack Pro
              </div>
              <div style={{ fontSize:10, color:"#475569", fontWeight:600, letterSpacing:"0.1em" }}>
                CIVIL PMS
              </div>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)} style={{
          position:"absolute", top:22, right:-12, width:24, height:24,
          borderRadius:"50%", background:"#1e2d4a", border:"1px solid #2a3f6b",
          display:"flex", alignItems:"center", justifyContent:"center",
          cursor:"pointer", color:"#60a5fa", zIndex:60
        }}>
          {collapsed ? <ChevronRight size={12}/> : <ChevronLeft size={12}/>}
        </button>

        {/* Nav items */}
        <nav style={{ flex:1, padding:"12px 8px", display:"flex", flexDirection:"column", gap:2, overflowY:"auto" }}>
          {navGroups.map(grp => (
            <div key={grp.group} style={{ marginBottom: collapsed ? 4 : 8 }}>
              {!collapsed && (
                <div onClick={() => toggleGroup(grp.group)} style={{
                  padding: "6px 12px", fontSize: 10, fontWeight: 700, color: "#64748b",
                  textTransform: "uppercase", letterSpacing: "0.08em", display: "flex",
                  justifyContent: "space-between", alignItems: "center", cursor: "pointer"
                }}>
                  {grp.group}
                  {expandedGroups[grp.group] ? <ChevronDown size={12}/> : <ChevronRight size={12}/>}
                </div>
              )}
              {(!collapsed ? expandedGroups[grp.group] : true) && grp.items.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                return (
                  <Link key={href} href={href} style={{ textDecoration:"none" }}>
                    <div className={`sidebar-nav-item ${active ? "active" : ""}`}
                      style={{ justifyContent: collapsed ? "center" : "flex-start",
                        padding: collapsed ? "10px 0" : "8px 12px", margin:"1px 0" }}
                      title={collapsed ? label : undefined}>
                      <Icon size={16} style={{ flexShrink:0 }}/>
                      {!collapsed && <span style={{ whiteSpace:"nowrap", fontSize:12.5 }}>{label}</span>}
                      {active && !collapsed && (
                        <div style={{ marginLeft:"auto", width:6, height:6, borderRadius:"50%", background:"#60a5fa" }}/>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Active Project Info */}
        {!collapsed && (
          <div style={{ padding:"12px 14px", borderTop:"1px solid #1e2d4a", margin:"0 8px" }}>
            <div style={{ fontSize:10, color:"#475569", fontWeight:600, letterSpacing:"0.08em",
              textTransform:"uppercase", marginBottom:6 }}>ACTIVE PROJECT</div>
            <div style={{ fontSize:13, fontWeight:700, color:"#f1f5f9" }}>{project.projectName}</div>
            <div style={{ fontSize:11, color:"#475569" }}>{project.clientName}</div>
          </div>
        )}

        {/* Sign out */}
        <div style={{ padding:"12px 8px", borderTop:"1px solid #1e2d4a" }}>
          <button onClick={() => { logout(); router.push("/login"); }}
            className="sidebar-nav-item"
            style={{ width:"100%", background:"none", border:"none", cursor:"pointer",
              color:"#ef4444", justifyContent: collapsed ? "center" : "flex-start",
              padding: collapsed ? "10px 0" : "10px 14px" }}>
            <LogOut size={18}/>
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main area ──────────────────────────────────── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

        {/* Topbar */}
        <header className="topbar" style={{ justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:10, color:"#475569", fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase" }}>
              BUILDTRACK PRO
            </div>
            <div style={{ fontSize:16, fontWeight:700, color:"#f1f5f9", lineHeight:1.2 }}>
              {currentPageLabel}
            </div>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {/* Undo/Redo */}
            <button onClick={undo} disabled={history.length === 0} className="btn-secondary tooltip"
              data-tip="Undo" style={{ padding:"7px 10px", opacity: history.length === 0 ? 0.4 : 1 }}>
              <Undo2 size={15}/>
            </button>
            <button onClick={redo} disabled={future.length === 0} className="btn-secondary tooltip"
              data-tip="Redo" style={{ padding:"7px 10px", opacity: future.length === 0 ? 0.4 : 1 }}>
              <Redo2 size={15}/>
            </button>

            {/* Auto-save */}
            <button onClick={() => setAutoSave(!autoSave)} style={{
              display:"flex", alignItems:"center", gap:8, padding:"7px 14px",
              borderRadius:8, border:"1px solid", cursor:"pointer", fontSize:12, fontWeight:600,
              background: autoSave ? "rgba(16,185,129,0.1)" : "rgba(100,116,139,0.1)",
              borderColor: autoSave ? "rgba(16,185,129,0.3)" : "rgba(100,116,139,0.3)",
              color: autoSave ? "#34d399" : "#64748b"
            }}>
              <Cpu size={14}/>
              {saved ? "Saved ✓" : autoSave ? "Auto-save on" : "Auto-save off"}
            </button>

            {/* Bell */}
            <button className="btn-secondary" style={{ padding:"7px 10px" }}>
              <Bell size={15}/>
            </button>

            {/* User */}
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 12px",
              background:"rgba(59,130,246,0.07)", borderRadius:8, border:"1px solid rgba(59,130,246,0.15)" }}>
              <div style={{ width:28, height:28, borderRadius:"50%",
                background:"linear-gradient(135deg,#2563eb,#7c3aed)",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                <User size={14} color="white"/>
              </div>
              <span style={{ fontSize:12, color:"#94a3b8", fontWeight:500 }}>
                {userEmail?.split("@")[0]}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex:1, overflowY:"auto", overflowX:"hidden" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
