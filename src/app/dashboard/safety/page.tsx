"use client";
import { useState } from "react";
import { ShieldAlert, AlertTriangle, CheckCircle, Users, Plus, Search, Download } from "lucide-react";

type SafetyRecord = { id:string; date:string; type:"Toolbox Talk"|"Incident"|"Near Miss"|"PPE Check"|"Safety Audit"; topic:string; conducted:string; workers:number; status:"Completed"|"Pending"|"Overdue" };

const DATA: SafetyRecord[] = [
  { id:"SF-001", date:"2026-07-01", type:"Toolbox Talk", topic:"Working at Height Safety", conducted:"Safety Officer Karthik", workers:45, status:"Completed" },
  { id:"SF-002", date:"2026-07-03", type:"PPE Check", topic:"PPE Compliance Inspection", conducted:"Safety Officer Karthik", workers:60, status:"Completed" },
  { id:"SF-003", date:"2026-07-05", type:"Near Miss", topic:"Scaffolding near miss – Floor 1", conducted:"Eng. Ramesh", workers:8, status:"Completed" },
  { id:"SF-004", date:"2026-07-08", type:"Toolbox Talk", topic:"Electrical Safety Basics", conducted:"Safety Officer Karthik", workers:38, status:"Completed" },
  { id:"SF-005", date:"2026-07-10", type:"Safety Audit", topic:"Monthly Site Safety Audit", conducted:"External Auditor", workers:60, status:"Pending" },
  { id:"SF-006", date:"2026-07-15", type:"Toolbox Talk", topic:"Excavation Safety", conducted:"Safety Officer Karthik", workers:30, status:"Pending" },
];

const TYPE_COLORS: Record<string,string> = {
  "Toolbox Talk":"badge-progress","Incident":"badge-critical","Near Miss":"badge-delayed","PPE Check":"badge-planned","Safety Audit":"badge-complete"
};

export default function SafetyPage() {
  const [records, setRecords] = useState(DATA);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");

  const filtered = records.filter(r=>
    (filterType==="All"||r.type===filterType)&&
    (!search||r.topic.toLowerCase().includes(search.toLowerCase()))
  );

  const incidents = records.filter(r=>r.type==="Incident").length;
  const nearMiss = records.filter(r=>r.type==="Near Miss").length;
  const talks = records.filter(r=>r.type==="Toolbox Talk").length;
  const safetyDays = 47; // Simulated

  return (
    <div style={{ padding:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:20 }}>
        {[
          { label:"Safe Days", value:safetyDays, icon:ShieldAlert, color:"#34d399" },
          { label:"Incidents", value:incidents, icon:AlertTriangle, color:"#ef4444" },
          { label:"Near Misses", value:nearMiss, icon:AlertTriangle, color:"#f59e0b" },
          { label:"Toolbox Talks", value:talks, icon:Users, color:"#60a5fa" },
        ].map(k=>(
          <div key={k.label} className="kpi-card" style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:`${k.color}18`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <k.icon size={22} color={k.color}/>
            </div>
            <div><div className="kpi-label">{k.label}</div><div className="kpi-value" style={{ fontSize:24, color:k.color }}>{k.value}</div></div>
          </div>
        ))}
      </div>

      <div style={{ padding:"12px 20px", background:"rgba(16,185,129,0.07)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:10, marginBottom:16, display:"flex", alignItems:"center", gap:12 }}>
        <CheckCircle size={18} color="#34d399"/>
        <span style={{ color:"#34d399", fontWeight:600, fontSize:13 }}>🛡 Site Safety Status: GOOD — {safetyDays} consecutive days without LTI</span>
      </div>

      <div className="card" style={{ padding:"12px 16px", marginBottom:16, display:"flex", gap:12, alignItems:"center" }}>
        <div style={{ position:"relative" }}>
          <Search size={14} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#64748b" }}/>
          <input className="input-field" placeholder="Search records..." value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:32, width:220, height:36, fontSize:12 }}/>
        </div>
        <select className="input-field" value={filterType} onChange={e=>setFilterType(e.target.value)} style={{ width:180, height:36, fontSize:12 }}>
          {["All","Toolbox Talk","Incident","Near Miss","PPE Check","Safety Audit"].map(t=><option key={t}>{t}</option>)}
        </select>
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <button className="btn-secondary" style={{ fontSize:12 }}><Download size={13}/> Export</button>
          <button className="btn-primary" style={{ fontSize:12 }}><Plus size={13}/> New Record</button>
        </div>
      </div>

      <div className="card" style={{ overflow:"hidden" }}>
        <table className="data-table">
          <thead><tr><th>ID</th><th>Date</th><th>Type</th><th>Topic</th><th>Conducted By</th><th>Workers</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map(r=>(
              <tr key={r.id}>
                <td style={{ fontFamily:"monospace", color:"#60a5fa", fontSize:12 }}>{r.id}</td>
                <td style={{ color:"#94a3b8", fontSize:12 }}>{r.date}</td>
                <td><span className={`badge ${TYPE_COLORS[r.type]||"badge-planned"}`}>{r.type}</span></td>
                <td style={{ fontWeight:600 }}>{r.topic}</td>
                <td style={{ color:"#94a3b8", fontSize:12 }}>{r.conducted}</td>
                <td style={{ textAlign:"center", color:"#f1f5f9" }}>{r.workers}</td>
                <td><span className={`badge ${r.status==="Completed"?"badge-complete":r.status==="Pending"?"badge-delayed":"badge-critical"}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
