"use client";
import { useState, useEffect } from "react";
import { useProjectStore, useGanttStore, GanttTask } from "@/lib/store";
import { generateGanttTasks } from "@/lib/gantt-engine";
import { parseDate, addDays, formatDate, daysBetween, formatCurrency } from "@/lib/utils";
import {
  LayoutDashboard, ListTree, AlertTriangle, Target, LineChart, Timer,
  Clock, Users, DollarSign, Calendar as CalIcon, Link, AlertCircle,
  PackageCheck, ShieldAlert, FileText, ChevronRight, ChevronDown, Flag,
  X, CheckCircle2, PlayCircle, PauseCircle, AlertOctagon
} from "lucide-react";
import WbsPanel from "@/components/schedule-panels/WbsPanel";
import CriticalPathPanel from "@/components/schedule-panels/CriticalPathPanel";
import TrackingPanel from "@/components/schedule-panels/TrackingPanel";
import CostResourcePanel from "@/components/schedule-panels/CostResourcePanel";
import FloatSlackPanel from "@/components/schedule-panels/FloatSlackPanel";
import RiskDelayPanel from "@/components/schedule-panels/RiskDelayPanel";
import BaselinePanel from "@/components/schedule-panels/BaselinePanel";

export type PanelType = "none"|"dashboard"|"wbs"|"critical"|"baseline"|"tracking"|"float"|"slack"|"resources"|"cost"|"calendar"|"dependencies"|"delays"|"deliverables"|"risk"|"reports";

const ROW_H = 48;  // taller rows

const ZOOM_LEVELS = [
  { label: "Day",   cellW: 36,  fmt: (d: Date) => d.toLocaleDateString("en-IN",{day:"2-digit",month:"short"}) },
  { label: "Week",  cellW: 90,  fmt: (d: Date) => `Wk ${Math.ceil(d.getDate()/7)} ${d.toLocaleDateString("en-IN",{month:"short"})}` },
  { label: "Month", cellW: 130, fmt: (d: Date) => d.toLocaleDateString("en-IN",{month:"long",year:"2-digit"}) },
];

const MS_THEME = {
  blue:   "#2563eb",
  red:    "#ef4444",
  green:  "#10b981",
  yellow: "#eab308",
  gray:   "#64748b",
  orange: "#f97316",
  purple: "#8b5cf6",
};

// ── Activity SVG Blueprints ──────────────────────────────
function ActivityBlueprint({ task }: { task: GanttTask }) {
  const cat  = task.category?.toLowerCase() ?? "";
  const name = task.name.toLowerCase();

  if (cat.includes("earth") || name.includes("excavat") || name.includes("grading")) {
    return (
      <svg width="100%" height="130" viewBox="0 0 360 130">
        <defs>
          <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#92400e" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#78350f" stopOpacity="0.6"/>
          </linearGradient>
        </defs>
        <rect width="360" height="130" fill="#050810" rx="8"/>
        {/* Ground surface */}
        <path d="M0 55 Q90 45 180 55 Q270 65 360 55 L360 130 L0 130 Z" fill="url(#soilGrad)"/>
        {/* Excavation pit */}
        <path d="M110 55 L80 105 L280 105 L250 55" fill="#0a0f1e" stroke="#f59e0b" strokeWidth="2"/>
        {/* Dimension lines */}
        <line x1="80" y1="115" x2="280" y2="115" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 2"/>
        <line x1="80" y1="110" x2="80" y2="120" stroke="#f59e0b" strokeWidth="1.5"/>
        <line x1="280" y1="110" x2="280" y2="120" stroke="#f59e0b" strokeWidth="1.5"/>
        <text x="180" y="126" fill="#f59e0b" fontSize="9" textAnchor="middle" fontWeight="600">W = {Math.round(task.duration * 0.8 * 10)/10} m</text>
        {/* Excavator icon hint */}
        <rect x="250" y="20" width="80" height="30" rx="4" fill="rgba(245,158,11,0.08)" stroke="rgba(245,158,11,0.3)" strokeWidth="1"/>
        <text x="290" y="29" fill="#f59e0b" fontSize="7" textAnchor="middle" fontWeight="700">EXCAVATION</text>
        <text x="290" y="42" fill="#94a3b8" fontSize="7" textAnchor="middle">CROSS SECTION</text>
        {/* Slope marks */}
        <line x1="110" y1="55" x2="80" y2="105" stroke="#fbbf24" strokeWidth="1.5"/>
        <line x1="250" y1="55" x2="280" y2="105" stroke="#fbbf24" strokeWidth="1.5"/>
        <text x="92" y="82" fill="#fbbf24" fontSize="8" transform="rotate(-50 92 82)">1:1.5</text>
        <text x="262" y="82" fill="#fbbf24" fontSize="8" transform="rotate(50 262 82)">1:1.5</text>
      </svg>
    );
  }

  if (cat.includes("foundation") || name.includes("foundation") || name.includes("footing") || name.includes("pile")) {
    return (
      <svg width="100%" height="130" viewBox="0 0 360 130">
        <rect width="360" height="130" fill="#050810" rx="8"/>
        {/* Grade line */}
        <line x1="0" y1="40" x2="360" y2="40" stroke="#94a3b8" strokeWidth="1" strokeDasharray="5 3"/>
        <text x="10" y="36" fill="#94a3b8" fontSize="8">GL</text>
        {/* Column */}
        <rect x="155" y="0" width="50" height="40" fill="rgba(16,185,129,0.12)" stroke="#10b981" strokeWidth="2"/>
        {/* Rebar in column */}
        <line x1="162" y1="2" x2="162" y2="38" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3 2"/>
        <line x1="170" y1="2" x2="170" y2="38" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3 2"/>
        <line x1="190" y1="2" x2="190" y2="38" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3 2"/>
        <line x1="198" y1="2" x2="198" y2="38" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3 2"/>
        {/* Footing base */}
        <rect x="80" y="75" width="200" height="30" fill="rgba(16,185,129,0.12)" stroke="#10b981" strokeWidth="2"/>
        {/* Pedestal */}
        <rect x="130" y="40" width="100" height="35" fill="rgba(16,185,129,0.08)" stroke="#10b981" strokeWidth="1.5"/>
        {/* Dimension arrows */}
        <line x1="80" y1="112" x2="280" y2="112" stroke="#10b981" strokeWidth="1"/>
        <line x1="80" y1="108" x2="80" y2="116" stroke="#10b981" strokeWidth="1.5"/>
        <line x1="280" y1="108" x2="280" y2="116" stroke="#10b981" strokeWidth="1.5"/>
        <text x="180" y="126" fill="#10b981" fontSize="9" textAnchor="middle" fontWeight="600">ISOLATED FOOTING — {task.name.toUpperCase()}</text>
        {/* PCC layer */}
        <rect x="75" y="105" width="210" height="8" fill="rgba(100,116,139,0.3)" stroke="#64748b" strokeWidth="1"/>
        <text x="180" y="113" fill="#94a3b8" fontSize="7" textAnchor="middle">P.C.C. LAYER</text>
      </svg>
    );
  }

  if (name.includes("column") || name.includes("rcc column")) {
    return (
      <svg width="100%" height="130" viewBox="0 0 360 130">
        <rect width="360" height="130" fill="#050810" rx="8"/>
        {/* Column sections */}
        {[60, 150, 240].map((x, i) => (
          <g key={i}>
            <rect x={x} y="10" width="60" height="110" fill="rgba(59,130,246,0.08)" stroke="#3b82f6" strokeWidth="1.5"/>
            {/* Longitudinal bars */}
            {[x+8, x+16, x+44, x+52].map((bx, j) => (
              <line key={j} x1={bx} y1="12" x2={bx} y2="118" stroke="#60a5fa" strokeWidth="2" strokeDasharray="4 3"/>
            ))}
            {/* Stirrups */}
            {[25, 45, 65, 85, 105].map((y, k) => (
              <rect key={k} x={x+6} y={y} width="48" height="8" fill="none" stroke="#93c5fd" strokeWidth="1" strokeDasharray="2 1"/>
            ))}
            <text x={x+30} y="128" fill="#60a5fa" fontSize="7" textAnchor="middle" fontWeight="700">C{i+1}</text>
          </g>
        ))}
        <text x="180" y="8" fill="#3b82f6" fontSize="8" textAnchor="middle" fontWeight="700">COLUMN REBAR DETAIL — {task.name.toUpperCase()}</text>
      </svg>
    );
  }

  if (name.includes("beam") || name.includes("slab")) {
    return (
      <svg width="100%" height="130" viewBox="0 0 360 130">
        <rect width="360" height="130" fill="#050810" rx="8"/>
        {/* Slab body */}
        <rect x="20" y="40" width="320" height="35" fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth="2"/>
        {/* Top bars */}
        {Array.from({length:10}).map((_,i) => (
          <line key={`t${i}`} x1={25+i*32} y1="42" x2={25+i*32} y2="73" stroke="#818cf8" strokeWidth="2" strokeDasharray="3 2"/>
        ))}
        {/* Bottom bars */}
        {Array.from({length:8}).map((_,i) => (
          <line key={`b${i}`} x1={40+i*36} y1="43" x2={40+i*36} y2="72" stroke="#a5b4fc" strokeWidth="2.5"/>
        ))}
        {/* Support columns */}
        <rect x="20" y="75" width="40" height="50" fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth="1.5"/>
        <rect x="300" y="75" width="40" height="50" fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth="1.5"/>
        {/* Dimension */}
        <line x1="20" y1="28" x2="340" y2="28" stroke="#6366f1" strokeWidth="1"/>
        <line x1="20" y1="24" x2="20" y2="32" stroke="#6366f1" strokeWidth="1.5"/>
        <line x1="340" y1="24" x2="340" y2="32" stroke="#6366f1" strokeWidth="1.5"/>
        <text x="180" y="20" fill="#818cf8" fontSize="9" textAnchor="middle" fontWeight="700">BEAM/SLAB PLAN — {task.name.toUpperCase()}</text>
      </svg>
    );
  }

  if (name.includes("mason") || name.includes("brick") || name.includes("wall")) {
    return (
      <svg width="100%" height="130" viewBox="0 0 360 130">
        <rect width="360" height="130" fill="#050810" rx="8"/>
        {/* Brick pattern */}
        {Array.from({length:5}).map((_,row) =>
          Array.from({length: row%2===0 ? 8 : 7}).map((_,col) => (
            <rect key={`${row}-${col}`}
              x={row%2===0 ? col*44+10 : col*44+32} y={row*22+10}
              width="42" height="20"
              fill="rgba(194,120,80,0.15)" stroke="#d97706" strokeWidth="1"/>
          ))
        )}
        <text x="180" y="124" fill="#d97706" fontSize="9" textAnchor="middle" fontWeight="700">MASONRY BOND PATTERN — {task.name.toUpperCase()}</text>
      </svg>
    );
  }

  if (cat.includes("mep") || name.includes("electric") || name.includes("plumb") || name.includes("hvac")) {
    return (
      <svg width="100%" height="130" viewBox="0 0 360 130">
        <rect width="360" height="130" fill="#050810" rx="8"/>
        {/* Electrical conduit */}
        <line x1="20" y1="40" x2="180" y2="40" stroke="#06b6d4" strokeWidth="3"/>
        <line x1="180" y1="40" x2="180" y2="90" stroke="#06b6d4" strokeWidth="3"/>
        <line x1="180" y1="90" x2="340" y2="90" stroke="#06b6d4" strokeWidth="3"/>
        {/* Plumbing */}
        <line x1="20" y1="70" x2="140" y2="70" stroke="#60a5fa" strokeWidth="4"/>
        <circle cx="140" cy="70" r="6" fill="none" stroke="#60a5fa" strokeWidth="2"/>
        <line x1="146" y1="70" x2="340" y2="70" stroke="#60a5fa" strokeWidth="4"/>
        {/* HVAC duct */}
        <rect x="50" y="10" width="260" height="20" fill="rgba(239,68,68,0.08)" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2"/>
        {/* Legend */}
        <line x1="20" y1="105" x2="40" y2="105" stroke="#06b6d4" strokeWidth="2"/>
        <text x="46" y="109" fill="#06b6d4" fontSize="8">Electrical</text>
        <line x1="100" y1="105" x2="120" y2="105" stroke="#60a5fa" strokeWidth="3"/>
        <text x="126" y="109" fill="#60a5fa" fontSize="8">Plumbing</text>
        <line x1="195" y1="105" x2="215" y2="105" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 1"/>
        <text x="221" y="109" fill="#ef4444" fontSize="8">HVAC Duct</text>
        <text x="180" y="124" fill="#94a3b8" fontSize="9" textAnchor="middle" fontWeight="700">MEP SCHEMATIC — {task.name.toUpperCase()}</text>
      </svg>
    );
  }

  // Default generic plan view
  return (
    <svg width="100%" height="130" viewBox="0 0 360 130">
      <rect width="360" height="130" fill="#050810" rx="8"/>
      {/* Generic floor plan outline */}
      <rect x="30" y="20" width="300" height="90" fill="rgba(139,92,246,0.05)" stroke="#8b5cf6" strokeWidth="2"/>
      {/* Internal walls */}
      <line x1="150" y1="20" x2="150" y2="110" stroke="#8b5cf6" strokeWidth="1.5"/>
      <line x1="30" y1="65" x2="150" y2="65" stroke="#8b5cf6" strokeWidth="1.5"/>
      <line x1="230" y1="20" x2="230" y2="110" stroke="#8b5cf6" strokeWidth="1.5"/>
      <line x1="230" y1="65" x2="330" y2="65" stroke="#8b5cf6" strokeWidth="1.5"/>
      {/* Door openings */}
      <path d="M75 110 Q90 95 105 110" fill="none" stroke="#a78bfa" strokeWidth="1.5"/>
      <path d="M190 20 Q205 35 220 20" fill="none" stroke="#a78bfa" strokeWidth="1.5"/>
      {/* Activity label */}
      <text x="180" y="126" fill="#a78bfa" fontSize="9" textAnchor="middle" fontWeight="700">{task.name.toUpperCase()} — LAYOUT PLAN</text>
    </svg>
  );
}

// ── Editable Popup Modal ──────────────────────────────────
function TaskPopup({ task, onClose, onSave }: { task: GanttTask; onClose: () => void; onSave: (updated: GanttTask) => void }) {
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<GanttTask>({ ...task });

  // Derive finish from start+duration whenever either changes
  function handleChange(field: keyof GanttTask, val: any) {
    setDraft(prev => {
      const updated = { ...prev, [field]: val };
      // Auto-recalculate end when start or duration changes
      if (field === "start" || field === "duration") {
        const s = parseDate(field === "start" ? val : updated.start);
        const dur = field === "duration" ? +val : updated.duration;
        updated.end = formatDate(addDays(s, Math.max(1, dur) - 1));
      }
      // Auto-set status from progress
      if (field === "progress") {
        const p = +val;
        updated.status = p === 100 ? "completed" : p > 0 ? "in-progress" : "not-started";
      }
      return updated;
    });
  }

  function handleSave() {
    onSave(draft);
    setEditMode(false);
  }

  const t = editMode ? draft : task;
  const statusColor = t.status === "completed" ? "#10b981" : t.status === "in-progress" ? "#eab308" : t.status === "delayed" ? "#f97316" : "#64748b";
  const StatusIcon  = t.status === "completed" ? CheckCircle2 : t.status === "in-progress" ? PlayCircle : t.status === "delayed" ? AlertOctagon : PauseCircle;

  const inputStyle: React.CSSProperties = {
    background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.3)",
    borderRadius: 6, color: "#f1f5f9", fontSize: 13, fontWeight: 700,
    padding: "3px 8px", outline: "none", width: "100%", textAlign: "center"
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(6px)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:"linear-gradient(145deg,#0d1526 0%,#0b0f1e 100%)", border:"1px solid #1e3054", borderRadius:20, width:500, maxWidth:"95vw", maxHeight:"90vh", overflowY:"auto", boxShadow:"0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(59,130,246,0.1)" }} onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div style={{ padding:"16px 20px", background:"rgba(37,99,235,0.08)", borderBottom:"1px solid #1e3054", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6, flexWrap:"wrap" }}>
              <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:10, background:`${statusColor}18`, color:statusColor, border:`1px solid ${statusColor}40`, textTransform:"uppercase" }}>
                {t.status.replace("-"," ")}
              </span>
              {t.isCritical && <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:10, background:"rgba(239,68,68,0.15)", color:"#ef4444", border:"1px solid rgba(239,68,68,0.3)" }}>⚠ Critical</span>}
              {t.isMilestone && <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:10, background:"rgba(139,92,246,0.15)", color:"#8b5cf6", border:"1px solid rgba(139,92,246,0.3)" }}>🏁 Milestone</span>}
              {editMode && <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:10, background:"rgba(234,179,8,0.15)", color:"#eab308", border:"1px solid rgba(234,179,8,0.3)" }}>✏ Editing</span>}
            </div>
            {editMode ? (
              <input value={draft.name} onChange={e => handleChange("name", e.target.value)}
                style={{ ...inputStyle, textAlign:"left", fontSize:16, fontWeight:800, padding:"4px 10px", width:"100%", borderRadius:8 }}/>
            ) : (
              <h3 style={{ fontSize:17, fontWeight:800, color:"#f1f5f9", margin:0 }}>{t.name}</h3>
            )}
            <p style={{ fontSize:11, color:"#64748b", margin:"4px 0 0" }}>{t.wbsId} · {t.category}</p>
          </div>
          <div style={{ display:"flex", gap:8, flexShrink:0, marginLeft:12 }}>
            {editMode ? (
              <>
                <button onClick={() => { setDraft({...task}); setEditMode(false); }} style={{ padding:"6px 12px", borderRadius:8, border:"1px solid #1e3054", background:"transparent", color:"#94a3b8", cursor:"pointer", fontSize:11 }}>Cancel</button>
                <button onClick={handleSave} style={{ padding:"6px 12px", borderRadius:8, border:"none", background:"linear-gradient(135deg,#10b981,#059669)", color:"white", cursor:"pointer", fontSize:11, fontWeight:700 }}>💾 Save</button>
              </>
            ) : (
              <button onClick={() => setEditMode(true)} style={{ padding:"6px 14px", borderRadius:8, border:"1px solid rgba(59,130,246,0.4)", background:"rgba(59,130,246,0.1)", color:"#60a5fa", cursor:"pointer", fontSize:11, fontWeight:700 }}>✏ Edit</button>
            )}
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid #1e3054", borderRadius:"50%", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#94a3b8" }}>
              <X size={16}/>
            </button>
          </div>
        </div>

        {/* ── Date / Duration / Float grid ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:1, borderBottom:"1px solid #1e3054", background:"#1e3054" }}>
          {[
            { label:"Start Date", icon:"📅", color:"#60a5fa",
              view: <span style={{ fontSize:13, fontWeight:800, color:"#60a5fa" }}>{t.start}</span>,
              edit: <input type="date" value={draft.start} onChange={e => handleChange("start", e.target.value)} style={inputStyle}/> },
            { label:"Finish Date", icon:"🏁", color:"#34d399",
              view: <span style={{ fontSize:13, fontWeight:800, color:"#34d399" }}>{t.end}</span>,
              edit: <span style={{ fontSize:13, fontWeight:800, color:"#34d399" }}>{draft.end}</span> },
            { label:"Duration", icon:"⏱", color:"#fbbf24",
              view: <span style={{ fontSize:13, fontWeight:800, color:"#fbbf24" }}>{t.duration}d</span>,
              edit: <input type="number" min={1} value={draft.duration} onChange={e => handleChange("duration", +e.target.value)} style={inputStyle}/> },
            { label:"Float", icon:"📊", color: t.float===0?"#ef4444":"#10b981",
              view: <span style={{ fontSize:13, fontWeight:800, color: t.float===0?"#ef4444":"#10b981" }}>{t.float}d</span>,
              edit: <input type="number" min={0} value={draft.float} onChange={e => handleChange("float", +e.target.value)} style={inputStyle}/> },
          ].map(x => (
            <div key={x.label} style={{ padding:"12px 10px", background:"#0d1526", textAlign:"center" }}>
              <div style={{ fontSize:16, marginBottom:3 }}>{x.icon}</div>
              <div style={{ fontSize:9, color:"#64748b", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>{x.label}</div>
              {editMode ? x.edit : x.view}
            </div>
          ))}
        </div>

        {/* ── Progress ── */}
        <div style={{ padding:"16px 20px", borderBottom:"1px solid #1e3054" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <StatusIcon size={16} color={statusColor}/>
              <span style={{ fontSize:13, fontWeight:700, color:"#e2e8f0" }}>Work Completion</span>
            </div>
            {editMode ? (
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <input type="number" min={0} max={100} value={draft.progress}
                  onChange={e => handleChange("progress", Math.min(100, Math.max(0, +e.target.value)))}
                  style={{ ...inputStyle, width:60, fontSize:18, fontWeight:900 }}/>
                <span style={{ color:statusColor, fontWeight:900 }}>%</span>
              </div>
            ) : (
              <span style={{ fontSize:22, fontWeight:900, color:statusColor }}>{t.progress}%</span>
            )}
          </div>

          {/* Clickable progress slider always visible in edit mode */}
          {editMode && (
            <input type="range" min={0} max={100} value={draft.progress}
              onChange={e => handleChange("progress", +e.target.value)}
              style={{ width:"100%", accentColor:statusColor, marginBottom:8, cursor:"pointer" }}/>
          )}

          <div style={{ height:12, background:"rgba(255,255,255,0.06)", borderRadius:6, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${t.progress}%`, background:`linear-gradient(90deg,${statusColor}88,${statusColor})`, borderRadius:6, transition:"width 0.3s ease" }}/>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:5, fontSize:10, color:"#475569" }}>
            <span>0%</span>
            <span style={{ color:statusColor }}>Done: {t.progress}% · Remaining: {100-t.progress}%</span>
            <span>100%</span>
          </div>

          {/* Status + Resource row */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:12 }}>
            <div style={{ padding:"8px 12px", background:"rgba(255,255,255,0.03)", borderRadius:8, border:"1px solid #1e3054" }}>
              <div style={{ fontSize:9, color:"#64748b", fontWeight:700, textTransform:"uppercase", marginBottom:5 }}>Status</div>
              {editMode ? (
                <select value={draft.status} onChange={e => handleChange("status", e.target.value)}
                  style={{ ...inputStyle, textAlign:"left", padding:"3px 8px" }}>
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="delayed">Delayed</option>
                </select>
              ) : (
                <span style={{ fontSize:12, fontWeight:700, color:statusColor }}>{t.status.replace("-"," ")}</span>
              )}
            </div>
            <div style={{ padding:"8px 12px", background:"rgba(255,255,255,0.03)", borderRadius:8, border:"1px solid #1e3054" }}>
              <div style={{ fontSize:9, color:"#64748b", fontWeight:700, textTransform:"uppercase", marginBottom:5 }}>Resource</div>
              {editMode ? (
                <input value={draft.resource} onChange={e => handleChange("resource", e.target.value)}
                  style={{ ...inputStyle, textAlign:"left", fontSize:11, padding:"3px 8px" }}/>
              ) : (
                <span style={{ fontSize:12, fontWeight:700, color:"#94a3b8" }}>{t.resource || "Unassigned"}</span>
              )}
            </div>
          </div>

          {/* Predecessors */}
          <div style={{ marginTop:10 }}>
            <div style={{ fontSize:9, color:"#64748b", fontWeight:700, textTransform:"uppercase", marginBottom:5 }}>Predecessors</div>
            {editMode ? (
              <input value={draft.predecessors.join(",")} onChange={e => handleChange("predecessors", e.target.value.split(",").map(s=>s.trim()).filter(Boolean))}
                placeholder="e.g. T001, T002"
                style={{ ...inputStyle, textAlign:"left", fontSize:11, padding:"4px 10px", width:"100%", boxSizing:"border-box" }}/>
            ) : (
              <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                {t.predecessors.length > 0
                  ? t.predecessors.map(p => <span key={p} style={{ padding:"1px 8px", background:"rgba(59,130,246,0.1)", borderRadius:8, color:"#60a5fa", fontSize:11, border:"1px solid rgba(59,130,246,0.2)" }}>{p}</span>)
                  : <span style={{ fontSize:11, color:"#475569" }}>None</span>
                }
              </div>
            )}
          </div>
        </div>

        {/* ── Blueprint ── */}
        <div style={{ padding:"14px 20px" }}>
          <div style={{ fontSize:10, color:"#64748b", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>
            📐 Activity Blueprint / Construction Schematic
          </div>
          <div style={{ borderRadius:10, overflow:"hidden", border:"1px solid #1a2540" }}>
            <ActivityBlueprint task={t}/>
          </div>
          {editMode && (
            <div style={{ marginTop:12, padding:"10px 14px", background:"rgba(16,185,129,0.06)", borderRadius:8, border:"1px solid rgba(16,185,129,0.2)", fontSize:11, color:"#34d399" }}>
              ✅ All changes are previewed live. Click <strong>Save</strong> to apply them to the Gantt chart.
            </div>
          )}
        </div>

        <style>{`@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}`}</style>
      </div>
    </div>
  );
}


// ── Main Page ─────────────────────────────────────────────
export default function SchedulePage() {
  const { project } = useProjectStore();
  const { tasks, setTasks, updateTask } = useGanttStore();
  const [zoomIdx, setZoomIdx] = useState(1);
  const [activePanel, setActivePanel] = useState<PanelType>("none");
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [popupTask, setPopupTask] = useState<GanttTask | null>(null);

  const zoom = ZOOM_LEVELS[zoomIdx];

  useEffect(() => {
    if (tasks.length === 0) setTasks(generateGanttTasks(project));
  }, []);

  const projectStart = parseDate(project.startDate);
  const projectEnd   = parseDate(project.endDate);

  function getDateCols() {
    const cols: Date[] = [];
    let cur = new Date(projectStart);
    const intervalDays = zoomIdx === 0 ? 1 : zoomIdx === 1 ? 7 : 30;
    while (cur <= projectEnd || cols.length < 8) {
      cols.push(new Date(cur));
      cur = addDays(cur, intervalDays);
    }
    return cols;
  }
  const dateCols  = getDateCols();
  const totalDays = daysBetween(projectStart, projectEnd) + 1;
  const ganttWidth = Math.max(dateCols.length * zoom.cellW, 1200);

  const getTaskLeft  = (t: GanttTask) => (daysBetween(projectStart, parseDate(t.start)) / totalDays) * ganttWidth;
  const getTaskWidth = (t: GanttTask) => (Math.max(1, t.duration) / totalDays) * ganttWidth;

  const visibleTasks = tasks.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()));

  function toggleCollapse(id: string) {
    setCollapsed(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function getBarColor(t: GanttTask) {
    if (t.isCritical && activePanel === "critical") return MS_THEME.red;
    if (t.isCritical) return "#dc2626";
    if (t.status === "completed") return MS_THEME.green;
    if (t.status === "in-progress") return MS_THEME.yellow;
    if (t.status === "delayed") return MS_THEME.orange;
    return MS_THEME.blue;
  }

  const RIBBON_TABS = [
    { id:"dashboard",    icon:LayoutDashboard, label:"Dashboard",  color:"#3b82f6" },
    { id:"wbs",          icon:ListTree,        label:"WBS",         color:"#8b5cf6" },
    { id:"critical",     icon:AlertTriangle,   label:"Critical",    color:"#ef4444" },
    { id:"baseline",     icon:Target,          label:"Baseline",    color:"#64748b" },
    { id:"tracking",     icon:LineChart,        label:"Tracking",   color:"#10b981" },
    { id:"float",        icon:Timer,           label:"Float",       color:"#f59e0b" },
    { id:"slack",        icon:Clock,           label:"Slack",       color:"#06b6d4" },
    { id:"resources",    icon:Users,           label:"Resources",   color:"#ec4899" },
    { id:"cost",         icon:DollarSign,      label:"Cost",        color:"#10b981" },
    { id:"calendar",     icon:CalIcon,         label:"Calendar",    color:"#6366f1" },
    { id:"dependencies", icon:Link,            label:"Dependencies",color:"#8b5cf6" },
    { id:"delays",       icon:AlertCircle,     label:"Delays",      color:"#f97316" },
    { id:"deliverables", icon:PackageCheck,    label:"Deliverables",color:"#34d399" },
    { id:"risk",         icon:ShieldAlert,     label:"Risk",        color:"#ef4444" },
    { id:"reports",      icon:FileText,        label:"Reports",     color:"#64748b" },
  ];

  return (
    <div style={{ height:"calc(100vh - 56px)", display:"flex", flexDirection:"column", overflow:"hidden" }}>

      {/* ── Top Ribbon ── */}
      <div style={{ background:"#0c1322", borderBottom:"1px solid #1e2d4a", padding:"8px 16px", flexShrink:0 }}>
        <div style={{ display:"flex", gap:4, overflowX:"auto" }} className="hide-scrollbar">
          {RIBBON_TABS.map(tab => {
            const on = activePanel === tab.id;
            return (
              <button key={tab.id} onClick={() => setActivePanel(on ? "none" : tab.id as PanelType)}
                style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5, padding:"8px 10px", minWidth:72,
                  borderRadius:8, border:"1px solid", cursor:"pointer", transition:"all 0.18s",
                  background: on ? `${tab.color}18` : "rgba(255,255,255,0.02)",
                  borderColor: on ? `${tab.color}50` : "transparent",
                  color: on ? tab.color : "#64748b" }}>
                <tab.icon size={18} color={on ? tab.color : "#475569"}/>
                <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.04em" }}>{tab.label}</span>
              </button>
            );
          })}
          {/* Zoom buttons at end */}
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6, flexShrink:0, paddingLeft:12, borderLeft:"1px solid #1e2d4a" }}>
            {ZOOM_LEVELS.map((z, i) => (
              <button key={z.label} onClick={() => setZoomIdx(i)}
                style={{ padding:"4px 12px", borderRadius:6, border:"1px solid", fontSize:11, fontWeight:700, cursor:"pointer",
                  background: zoomIdx===i ? "rgba(59,130,246,0.15)" : "transparent",
                  borderColor: zoomIdx===i ? "#3b82f6" : "#1e2d4a",
                  color: zoomIdx===i ? "#60a5fa" : "#64748b" }}>
                {z.label}
              </button>
            ))}
            <input placeholder="🔍 Search..." value={search} onChange={e=>setSearch(e.target.value)}
              style={{ padding:"4px 10px", borderRadius:6, border:"1px solid #1e2d4a", background:"rgba(255,255,255,0.04)",
                color:"#e2e8f0", fontSize:11, width:130, outline:"none" }}/>
          </div>
        </div>
      </div>

      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* ── Main Gantt ── */}
        <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

          {/* Left: Data Table */}
          <div style={{ width:480, flexShrink:0, borderRight:"2px solid #1e2d4a", background:"#080c18", display:"flex", flexDirection:"column" }}>
            {/* Header */}
            <div style={{ display:"flex", height:44, background:"#0c1322", borderBottom:"1px solid #1e2d4a", fontSize:10, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em", flexShrink:0 }}>
              {[["ID",38],["Activity Name",200],["Dur",55],["Start",80],["Finish",80],["Float",55]].map(([h,w])=>(
                <div key={h} style={{ width:+w, minWidth:+w, padding:"0 8px", display:"flex", alignItems:"center", borderRight:"1px solid #1e2d4a" }}>{h}</div>
              ))}
            </div>
            {/* Rows */}
            <div style={{ overflowY:"auto", flex:1 }}>
              {visibleTasks.map(t => {
                if (t.parentId && collapsed.has(t.parentId)) return null;
                const children = tasks.filter(c => c.parentId === t.id);
                const isCol = collapsed.has(t.id);
                const col = getBarColor(t);
                return (
                  <div key={t.id} style={{ display:"flex", height:ROW_H, borderBottom:"1px solid #0f1a2e", alignItems:"center",
                    background: t.isCritical && activePanel==="critical" ? "rgba(239,68,68,0.05)" : undefined,
                    cursor:"pointer" }} onClick={() => setPopupTask(t)}>
                    <div style={{ width:38, minWidth:38, padding:"0 8px", fontSize:11, color:col, fontWeight:700, borderRight:"1px solid #0f1a2e" }}>{t.id}</div>
                    <div style={{ width:200, minWidth:200, padding:"0 6px", display:"flex", alignItems:"center", gap:5, paddingLeft: 6+t.level*14, overflow:"hidden", borderRight:"1px solid #0f1a2e" }}>
                      {children.length > 0 && (
                        <button onClick={e=>{e.stopPropagation();toggleCollapse(t.id);}} style={{ background:"none", border:"none", cursor:"pointer", color:"#475569", padding:0, flexShrink:0 }}>
                          {isCol ? <ChevronRight size={13}/> : <ChevronDown size={13}/>}
                        </button>
                      )}
                      {t.isMilestone ? <Flag size={12} color={MS_THEME.purple} style={{ flexShrink:0 }}/> : <div style={{ width:10, height:10, background:col, borderRadius:3, flexShrink:0, boxShadow:`0 0 6px ${col}66` }}/>}
                      <div>
                        <div style={{ fontSize:12, color:"#e2e8f0", fontWeight: t.isMilestone?700:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.name}</div>
                        {/* Mini progress below name */}
                        <div style={{ height:3, width:"100%", background:"rgba(255,255,255,0.06)", borderRadius:2, marginTop:3 }}>
                          <div style={{ height:"100%", width:`${t.progress}%`, background:col, borderRadius:2 }}/>
                        </div>
                      </div>
                    </div>
                    <div style={{ width:55, minWidth:55, padding:"0 8px", fontSize:11, color:"#94a3b8", borderRight:"1px solid #0f1a2e", textAlign:"right" }}>{t.duration}d</div>
                    <div style={{ width:80, minWidth:80, padding:"0 8px", fontSize:10, color:"#64748b", borderRight:"1px solid #0f1a2e" }}>{t.start}</div>
                    <div style={{ width:80, minWidth:80, padding:"0 8px", fontSize:10, color:"#64748b", borderRight:"1px solid #0f1a2e" }}>{t.end}</div>
                    <div style={{ width:55, minWidth:55, padding:"0 8px", fontSize:11, fontWeight:700, color: t.float===0?"#ef4444":"#10b981" }}>{t.float}d</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Gantt Canvas */}
          <div style={{ flex:1, overflow:"auto", background:"#060914", position:"relative" }}>
            <div style={{ width:ganttWidth, minWidth:"100%", position:"relative" }}>

              {/* Two-level date header */}
              <div style={{ height:44, display:"flex", position:"sticky", top:0, zIndex:10, background:"rgba(10,14,30,0.97)", borderBottom:"2px solid #1e2d4a" }}>
                {dateCols.map((d, i) => (
                  <div key={i} style={{ width:zoom.cellW, minWidth:zoom.cellW, borderRight:"1px solid #1e2d4a",
                    display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                    background: i%2===0 ? "rgba(255,255,255,0.01)" : "transparent" }}>
                    <span style={{ fontSize:10, fontWeight:700, color:"#60a5fa" }}>{zoom.fmt(d)}</span>
                  </div>
                ))}
              </div>

              {/* Today line */}
              {(() => {
                const off = daysBetween(projectStart, new Date());
                if (off >= 0 && off <= totalDays) {
                  const lx = (off / totalDays) * ganttWidth;
                  return (
                    <div style={{ position:"absolute", left:lx, top:44, width:2, height:"100%", background:"#ef4444", zIndex:8, opacity:0.8 }}>
                      <div style={{ position:"absolute", top:0, left:-20, fontSize:8, color:"#ef4444", fontWeight:700, background:"#0a0e1e", padding:"1px 4px", borderRadius:3, whiteSpace:"nowrap" }}>TODAY</div>
                    </div>
                  );
                }
              })()}

              {/* Task rows */}
              {visibleTasks.map(t => {
                if (t.parentId && collapsed.has(t.parentId)) return null;
                const left  = getTaskLeft(t);
                const width = getTaskWidth(t);
                const color = getBarColor(t);
                const progressW = width * t.progress / 100;

                return (
                  <div key={t.id} style={{ height:ROW_H, position:"relative", borderBottom:"1px solid #0a1020" }}>
                    {/* Grid lines */}
                    {dateCols.map((_, i) => (
                      <div key={i} style={{ position:"absolute", left:i*zoom.cellW, top:0, width:1, height:"100%", background:"rgba(30,45,74,0.25)" }}/>
                    ))}

                    {/* Baseline bar */}
                    {(activePanel==="baseline"||activePanel==="tracking") && t.baselineStart && t.baselineEnd && (
                      <div style={{ position:"absolute", top:ROW_H-10, height:4, borderRadius:2, background:"rgba(100,116,139,0.5)", zIndex:2,
                        left:(daysBetween(projectStart, parseDate(t.baselineStart))/totalDays)*ganttWidth,
                        width: Math.max(4,(daysBetween(parseDate(t.baselineStart),parseDate(t.baselineEnd))/totalDays)*ganttWidth)
                      }}/>
                    )}

                    {/* Milestone diamond */}
                    {t.isMilestone ? (
                      <div onClick={() => setPopupTask(t)} style={{ position:"absolute", top:"50%", left:left+width/2,
                        width:18, height:18, transform:"translate(-50%,-50%) rotate(45deg)",
                        background:MS_THEME.purple, boxShadow:`0 0 12px ${MS_THEME.purple}88`, zIndex:4, cursor:"pointer" }} title={t.name}/>
                    ) : (
                      /* ── Gantt bar ── */
                      <div onClick={() => setPopupTask(t)}
                        title={`${t.name} | ${t.start} → ${t.end} | ${t.progress}% done`}
                        style={{ position:"absolute", top:"50%", transform:"translateY(-50%)",
                          left, width:Math.max(width, 8), height:24,
                          borderRadius:5, cursor:"pointer", zIndex:4,
                          background:`${color}18`,
                          border:`1.5px solid ${color}`,
                          boxShadow: t.isCritical ? `0 0 10px ${color}55` : undefined }}>

                        {/* Progress fill */}
                        <div style={{ position:"absolute", top:0, left:0, height:"100%", width:progressW, background:`linear-gradient(90deg, ${color}cc, ${color})`, borderRadius:4 }}/>

                        {/* Label inside bar */}
                        {width > 50 && (
                          <span style={{ position:"absolute", left:6, top:"50%", transform:"translateY(-50%)", fontSize:10, fontWeight:700, color:"white", whiteSpace:"nowrap", overflow:"hidden", maxWidth:width-12, textShadow:"0 1px 4px rgba(0,0,0,0.9)", zIndex:2 }}>
                            {t.name.length > Math.floor(width/7) ? t.name.substring(0,Math.floor(width/7))+"…" : t.name}
                          </span>
                        )}
                        {/* Progress % badge on right side */}
                        {width > 30 && (
                          <span style={{ position:"absolute", right:4, top:"50%", transform:"translateY(-50%)", fontSize:9, fontWeight:800, color:color, zIndex:2, background:"rgba(0,0,0,0.6)", borderRadius:4, padding:"0 3px" }}>
                            {t.progress}%
                          </span>
                        )}
                      </div>
                    )}

                    {/* Float tail */}
                    {(activePanel==="float"||activePanel==="slack") && !t.isCritical && t.float>0 && (
                      <div style={{ position:"absolute", top:"50%", transform:"translateY(-50%)", left:left+width, height:8,
                        width:(t.float/totalDays)*ganttWidth, background:"rgba(16,185,129,0.2)", borderTop:"2px dashed #10b981", zIndex:1 }}/>
                    )}
                    {/* Resource label */}
                    {activePanel==="resources" && (
                      <span style={{ position:"absolute", left:left+width+6, top:"50%", transform:"translateY(-50%)", fontSize:9, color:"#94a3b8", whiteSpace:"nowrap" }}>{t.resource}</span>
                    )}
                    {/* Cost label */}
                    {activePanel==="cost" && (
                      <span style={{ position:"absolute", left:left+width+6, top:"50%", transform:"translateY(-50%)", fontSize:9, color:"#34d399", whiteSpace:"nowrap" }}>{formatCurrency(t.duration*12000)}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Side Panels ── */}
        {activePanel !== "none" && (
          <div style={{ width:400, flexShrink:0, background:"#080c18", borderLeft:"1px solid #1e2d4a", display:"flex", flexDirection:"column", boxShadow:"-8px 0 24px rgba(0,0,0,0.5)" }}>
            <div style={{ padding:"14px 18px", borderBottom:"1px solid #1e2d4a", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#0c1322" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                {(() => { const tab = RIBBON_TABS.find(t=>t.id===activePanel); return tab ? <><tab.icon size={18} color={tab.color}/><span style={{ fontSize:14, fontWeight:700, color:"#f1f5f9" }}>{tab.label}</span></> : null; })()}
              </div>
              <button onClick={()=>setActivePanel("none")} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer" }}><X size={16}/></button>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:16 }}>
              {activePanel==="wbs"          && <WbsPanel tasks={tasks}/>}
              {activePanel==="critical"     && <CriticalPathPanel tasks={tasks} theme={MS_THEME}/>}
              {activePanel==="tracking"     && <TrackingPanel tasks={tasks} theme={MS_THEME}/>}
              {activePanel==="cost"         && <CostResourcePanel type="cost" tasks={tasks} project={project} theme={MS_THEME}/>}
              {activePanel==="resources"    && <CostResourcePanel type="resources" tasks={tasks} project={project} theme={MS_THEME}/>}
              {(activePanel==="float"||activePanel==="slack") && <FloatSlackPanel tasks={tasks} theme={MS_THEME}/>}
              {(activePanel==="risk"||activePanel==="delays")  && <RiskDelayPanel tasks={tasks} theme={MS_THEME}/>}
              {activePanel==="baseline"     && <BaselinePanel tasks={tasks} theme={MS_THEME}/>}
              {["dashboard","calendar","dependencies","deliverables","reports"].includes(activePanel) && (
                <div style={{ textAlign:"center", padding:"40px 16px", color:"#475569" }}>
                  <AlertCircle size={36} style={{ margin:"0 auto 12px" }}/><p style={{ fontSize:12 }}>Select a task from the Gantt chart to see details.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Task Click Popup ── */}
      {popupTask && <TaskPopup task={popupTask} onClose={() => setPopupTask(null)} onSave={(updated) => { updateTask(updated.id, updated); setPopupTask(null); }}/>}
    </div>
  );
}
