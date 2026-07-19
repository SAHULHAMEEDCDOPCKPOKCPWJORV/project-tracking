"use client";
import { useState } from "react";
import { Plus, Edit3, Search, Download, AlertTriangle, CheckCircle, Clock } from "lucide-react";

type NCR = {
  id:string; date:string; activity:string; description:string;
  raisedBy:string; rootCause:string; corrective:string;
  severity:"Critical"|"Major"|"Minor";
  status:"Open"|"Under Review"|"Closed";
};

const DATA: NCR[] = [
  { id:"NCR-001", date:"2026-07-04", activity:"Column RCC", description:"Improper concrete cover for reinforcement bars", raisedBy:"Eng. Ramesh", rootCause:"Lack of cover blocks", corrective:"Provide cover blocks. Rectify before pour.", severity:"Major", status:"Closed" },
  { id:"NCR-002", date:"2026-07-07", activity:"Electrical Conduit", description:"Conduit not secured to structure at 1m intervals", raisedBy:"Eng. Suresh", rootCause:"Supervision lapse", corrective:"Clamp conduit every 1m. Re-inspect.", severity:"Minor", status:"Under Review" },
  { id:"NCR-003", date:"2026-07-10", activity:"Brickwork FF", description:"Course not plumb — deviation >10mm per 3m height", raisedBy:"Eng. Priya", rootCause:"Worker skill issue", corrective:"Demolish and redo affected portion.", severity:"Major", status:"Open" },
  { id:"NCR-004", date:"2026-07-12", activity:"Slab Shuttering", description:"Insufficient props — deflection observed", raisedBy:"Eng. Ramesh", rootCause:"Prop spacing too wide", corrective:"Add props at 600mm c/c. Do not pour until cleared.", severity:"Critical", status:"Open" },
];

const SEV_COLORS: Record<string,string> = { Critical:"badge-critical", Major:"badge-delayed", Minor:"badge-planned" };
const STATUS_COLORS: Record<string,string> = { Open:"badge-critical","Under Review":"badge-delayed", Closed:"badge-complete" };

export default function NCRPage() {
  const [ncrs, setNCRs] = useState(DATA);
  const [search, setSearch] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [editId, setEditId] = useState<string|null>(null);

  const filtered = ncrs.filter(n=>
    (filterSeverity==="All"||n.severity===filterSeverity)&&
    (filterStatus==="All"||n.status===filterStatus)&&
    (!search||n.activity.toLowerCase().includes(search.toLowerCase())||n.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ padding:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:20 }}>
        {[
          { label:"Total NCRs", value:ncrs.length, color:"#60a5fa" },
          { label:"Open", value:ncrs.filter(n=>n.status==="Open").length, color:"#ef4444" },
          { label:"Under Review", value:ncrs.filter(n=>n.status==="Under Review").length, color:"#f59e0b" },
          { label:"Closed", value:ncrs.filter(n=>n.status==="Closed").length, color:"#34d399" },
        ].map(k=>(
          <div key={k.label} className="kpi-card">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ fontSize:24, color:k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding:"12px 16px", marginBottom:16, display:"flex", gap:12, alignItems:"center" }}>
        <div style={{ position:"relative" }}>
          <Search size={14} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#64748b" }}/>
          <input className="input-field" placeholder="Search NCRs..." value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:32, width:200, height:36, fontSize:12 }}/>
        </div>
        <select className="input-field" value={filterSeverity} onChange={e=>setFilterSeverity(e.target.value)} style={{ width:140, height:36, fontSize:12 }}>
          {["All","Critical","Major","Minor"].map(s=><option key={s}>{s}</option>)}
        </select>
        <select className="input-field" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ width:160, height:36, fontSize:12 }}>
          {["All","Open","Under Review","Closed"].map(s=><option key={s}>{s}</option>)}
        </select>
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <button className="btn-secondary" style={{ fontSize:12 }}><Download size={13}/> Export</button>
          <button className="btn-primary" style={{ fontSize:12 }}><Plus size={13}/> Raise NCR</button>
        </div>
      </div>

      <div className="card" style={{ overflow:"hidden" }}>
        <table className="data-table">
          <thead><tr><th>NCR No</th><th>Date</th><th>Activity</th><th>Description</th><th>Raised By</th><th>Corrective Action</th><th>Severity</th><th>Status</th><th>Edit</th></tr></thead>
          <tbody>
            {filtered.map(n=>{
              const isEdit = editId===n.id;
              return (
                <tr key={n.id}>
                  <td style={{ fontFamily:"monospace", color:"#60a5fa", fontSize:12 }}>{n.id}</td>
                  <td style={{ color:"#94a3b8", fontSize:12 }}>{n.date}</td>
                  <td style={{ fontWeight:600 }}>{n.activity}</td>
                  <td style={{ color:"#94a3b8", fontSize:12, maxWidth:180 }}>{n.description}</td>
                  <td style={{ color:"#94a3b8", fontSize:12 }}>{n.raisedBy}</td>
                  <td style={{ color:"#94a3b8", fontSize:12, maxWidth:180 }}>{n.corrective}</td>
                  <td><span className={`badge ${SEV_COLORS[n.severity]}`}>{n.severity}</span></td>
                  <td>
                    {isEdit
                      ? <select className="input-field" style={{ width:140, padding:"3px 8px", fontSize:12 }} value={n.status} onChange={e=>setNCRs(prev=>prev.map(x=>x.id===n.id?{...x,status:e.target.value as any}:x))}>
                          {["Open","Under Review","Closed"].map(s=><option key={s}>{s}</option>)}
                        </select>
                      : <span className={`badge ${STATUS_COLORS[n.status]}`}>{n.status}</span>}
                  </td>
                  <td><button onClick={()=>setEditId(isEdit?null:n.id)} style={{ background:"none", border:"none", cursor:"pointer", color:isEdit?"#34d399":"#64748b", padding:4 }}><Edit3 size={14}/></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
