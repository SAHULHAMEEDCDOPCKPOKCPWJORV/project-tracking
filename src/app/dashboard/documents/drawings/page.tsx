"use client";
import { useState } from "react";
import { Plus, FileText, Search, Download, Edit3, Printer } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type Drawing = { id:string; title:string; discipline:string; revision:string; date:string; status:"Issued for Construction"|"Under Review"|"Superseded"|"Draft"; drawnBy:string };

const DATA: Drawing[] = [
  { id:"DWG-A001", title:"Site Plan & Layout", discipline:"Architectural", revision:"Rev 3", date:"2026-06-15", status:"Issued for Construction", drawnBy:"Ar. Suresh" },
  { id:"DWG-A002", title:"Ground Floor Plan", discipline:"Architectural", revision:"Rev 2", date:"2026-06-10", status:"Issued for Construction", drawnBy:"Ar. Suresh" },
  { id:"DWG-A003", title:"Elevation – North & South", discipline:"Architectural", revision:"Rev 1", date:"2026-06-12", status:"Issued for Construction", drawnBy:"Ar. Suresh" },
  { id:"DWG-S001", title:"Foundation Layout & Details", discipline:"Structural", revision:"Rev 2", date:"2026-06-20", status:"Issued for Construction", drawnBy:"Str. Ramesh" },
  { id:"DWG-S002", title:"Column Schedule", discipline:"Structural", revision:"Rev 1", date:"2026-06-22", status:"Issued for Construction", drawnBy:"Str. Ramesh" },
  { id:"DWG-S003", title:"Beam & Slab Reinforcement", discipline:"Structural", revision:"Rev 1", date:"2026-06-25", status:"Under Review", drawnBy:"Str. Ramesh" },
  { id:"DWG-M001", title:"Plumbing Layout – GF", discipline:"MEP", revision:"Rev 1", date:"2026-07-01", status:"Issued for Construction", drawnBy:"MEP Arjun" },
  { id:"DWG-E001", title:"Electrical SLD", discipline:"Electrical", revision:"Rev 0", date:"2026-07-05", status:"Draft", drawnBy:"Elec. Suresh" },
];

const DISC_COLORS: Record<string,string> = { Architectural:"badge-progress", Structural:"badge-delayed", MEP:"badge-complete", Electrical:"badge-planned" };
const STATUS_COLORS: Record<string,string> = { "Issued for Construction":"badge-complete", "Under Review":"badge-delayed", "Superseded":"badge-planned", "Draft":"badge-critical" };

export default function DrawingsPage() {
  const [drawings, setDrawings] = useState(DATA);
  const [search, setSearch] = useState("");
  const [filterDisc, setFilterDisc] = useState("All");

  const filtered = drawings.filter(d=>
    (filterDisc==="All"||d.discipline===filterDisc)&&
    (!search||d.title.toLowerCase().includes(search.toLowerCase())||d.id.toLowerCase().includes(search.toLowerCase()))
  );

  const disciplines = Array.from(new Set(drawings.map(d=>d.discipline)));

  return (
    <div style={{ padding:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:20 }}>
        {[
          { label:"Total Drawings", value:drawings.length, color:"#60a5fa" },
          { label:"Issued for Construction", value:drawings.filter(d=>d.status==="Issued for Construction").length, color:"#34d399" },
          { label:"Under Review", value:drawings.filter(d=>d.status==="Under Review").length, color:"#f59e0b" },
          { label:"Draft", value:drawings.filter(d=>d.status==="Draft").length, color:"#ef4444" },
        ].map(k=>(
          <div key={k.label} className="kpi-card">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ fontSize:22, color:k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding:"12px 16px", marginBottom:16, display:"flex", gap:12, alignItems:"center" }}>
        <div style={{ position:"relative" }}>
          <Search size={14} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#64748b" }}/>
          <input className="input-field" placeholder="Search drawings..." value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:32, width:220, height:36, fontSize:12 }}/>
        </div>
        <select className="input-field" value={filterDisc} onChange={e=>setFilterDisc(e.target.value)} style={{ width:160, height:36, fontSize:12 }}>
          <option>All</option>{disciplines.map(d=><option key={d}>{d}</option>)}
        </select>
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <button className="btn-secondary" style={{ fontSize:12 }}><Download size={13}/> Download All</button>
          <button className="btn-primary" style={{ fontSize:12 }}><Plus size={13}/> Upload Drawing</button>
        </div>
      </div>

      <div className="card" style={{ overflow:"hidden" }}>
        <table className="data-table">
          <thead><tr><th>Drawing No</th><th>Title</th><th>Discipline</th><th>Revision</th><th>Date</th><th>Drawn By</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {filtered.map(d=>(
              <tr key={d.id}>
                <td style={{ fontFamily:"monospace", color:"#60a5fa", fontSize:12 }}>{d.id}</td>
                <td style={{ fontWeight:600 }}>{d.title}</td>
                <td><span className={`badge ${DISC_COLORS[d.discipline]||"badge-planned"}`}>{d.discipline}</span></td>
                <td style={{ color:"#94a3b8", fontSize:12 }}>{d.revision}</td>
                <td style={{ color:"#94a3b8", fontSize:12 }}>{d.date}</td>
                <td style={{ color:"#94a3b8", fontSize:12 }}>{d.drawnBy}</td>
                <td><span className={`badge ${STATUS_COLORS[d.status]||"badge-planned"}`}>{d.status}</span></td>
                <td>
                  <div style={{ display:"flex", gap:6 }}>
                    <button style={{ background:"none", border:"none", cursor:"pointer", color:"#60a5fa", padding:4 }} title="View"><FileText size={14}/></button>
                    <button style={{ background:"none", border:"none", cursor:"pointer", color:"#64748b", padding:4 }} title="Download"><Download size={14}/></button>
                    <button style={{ background:"none", border:"none", cursor:"pointer", color:"#64748b", padding:4 }} title="Print"><Printer size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
