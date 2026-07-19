"use client";
import { useState } from "react";
import { Plus, Search, CheckCircle, Clock, XCircle, FileText } from "lucide-react";

type Submittal = { id:string; title:string; discipline:string; submittedBy:string; date:string; reviewBy:string; status:"Pending Review"|"Approved"|"Approved with Comments"|"Rejected"; revision:string };

const DATA: Submittal[] = [
  { id:"SUB-001", title:"Concrete Mix Design Report – M25", discipline:"Structural", submittedBy:"Concrete Supplier", date:"2026-06-20", reviewBy:"Str. Ramesh", status:"Approved", revision:"R1" },
  { id:"SUB-002", title:"Steel Mill Certificate – TMT Fe500", discipline:"Structural", submittedBy:"JSW Steel", date:"2026-06-22", reviewBy:"Str. Ramesh", status:"Approved", revision:"R1" },
  { id:"SUB-003", title:"Brick Technical Data Sheet", discipline:"Architectural", submittedBy:"Brick Supplier", date:"2026-07-01", reviewBy:"Ar. Suresh", status:"Approved with Comments", revision:"R1" },
  { id:"SUB-004", title:"CPVC Pipe Technical Spec", discipline:"MEP", submittedBy:"CPVC Ltd", date:"2026-07-05", reviewBy:"MEP Arjun", status:"Pending Review", revision:"R1" },
  { id:"SUB-005", title:"Tile Sample – Vitrified 600x600", discipline:"Architectural", submittedBy:"Kajaria", date:"2026-07-08", reviewBy:"Ar. Suresh", status:"Pending Review", revision:"R1" },
  { id:"SUB-006", title:"Paint Approval – Interior Emulsion", discipline:"Architectural", submittedBy:"Contractor", date:"2026-07-12", reviewBy:"Ar. Suresh", status:"Rejected", revision:"R1" },
];

const STATUS_COLORS: Record<string,string> = { "Approved":"badge-complete","Approved with Comments":"badge-delayed","Pending Review":"badge-progress","Rejected":"badge-critical" };
const DISC_COLORS: Record<string,string> = { Structural:"badge-delayed", Architectural:"badge-progress", MEP:"badge-complete", Electrical:"badge-planned" };

export default function SubmittalsPage() {
  const [submittals, setSubmittals] = useState(DATA);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [editId, setEditId] = useState<string|null>(null);

  const filtered = submittals.filter(s=>
    (filterStatus==="All"||s.status===filterStatus)&&
    (!search||s.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ padding:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:20 }}>
        {[
          { label:"Total Submittals", value:submittals.length, color:"#60a5fa" },
          { label:"Approved", value:submittals.filter(s=>s.status==="Approved").length, color:"#34d399" },
          { label:"Pending Review", value:submittals.filter(s=>s.status==="Pending Review").length, color:"#f59e0b" },
          { label:"Rejected", value:submittals.filter(s=>s.status==="Rejected").length, color:"#ef4444" },
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
          <input className="input-field" placeholder="Search submittals..." value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:32, width:240, height:36, fontSize:12 }}/>
        </div>
        <select className="input-field" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ width:200, height:36, fontSize:12 }}>
          {["All","Approved","Approved with Comments","Pending Review","Rejected"].map(s=><option key={s}>{s}</option>)}
        </select>
        <div style={{ marginLeft:"auto" }}>
          <button className="btn-primary" style={{ fontSize:12 }}><Plus size={13}/> New Submittal</button>
        </div>
      </div>

      <div className="card" style={{ overflow:"hidden" }}>
        <table className="data-table">
          <thead><tr><th>Submittal No</th><th>Title</th><th>Discipline</th><th>Submitted By</th><th>Date</th><th>Review By</th><th>Rev</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {filtered.map(s=>{
              const isEdit = editId===s.id;
              return (
                <tr key={s.id}>
                  <td style={{ fontFamily:"monospace", color:"#60a5fa", fontSize:12 }}>{s.id}</td>
                  <td style={{ fontWeight:600 }}>{s.title}</td>
                  <td><span className={`badge ${DISC_COLORS[s.discipline]||"badge-planned"}`}>{s.discipline}</span></td>
                  <td style={{ color:"#94a3b8", fontSize:12 }}>{s.submittedBy}</td>
                  <td style={{ color:"#94a3b8", fontSize:12 }}>{s.date}</td>
                  <td style={{ color:"#94a3b8", fontSize:12 }}>{s.reviewBy}</td>
                  <td style={{ color:"#94a3b8", fontSize:12 }}>{s.revision}</td>
                  <td>
                    {isEdit
                      ? <select className="input-field" style={{ width:190, padding:"3px 8px", fontSize:12 }} value={s.status} onChange={e=>setSubmittals(prev=>prev.map(x=>x.id===s.id?{...x,status:e.target.value as any}:x))}>
                          {["Pending Review","Approved","Approved with Comments","Rejected"].map(st=><option key={st}>{st}</option>)}
                        </select>
                      : <span className={`badge ${STATUS_COLORS[s.status]}`}>{s.status}</span>}
                  </td>
                  <td>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={()=>setEditId(isEdit?null:s.id)} style={{ background:"none", border:"none", cursor:"pointer", color:isEdit?"#34d399":"#64748b", padding:4 }}><CheckCircle size={14}/></button>
                      <button style={{ background:"none", border:"none", cursor:"pointer", color:"#60a5fa", padding:4 }}><FileText size={14}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
