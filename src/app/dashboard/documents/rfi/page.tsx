"use client";
import { useState } from "react";
import { Plus, Search, MessageSquare, Clock, CheckCircle } from "lucide-react";

type RFI = { id:string; date:string; subject:string; raisedBy:string; assignedTo:string; status:"Open"|"Responded"|"Closed"; priority:"High"|"Medium"|"Low"; response:string; dueDate:string };

const DATA: RFI[] = [
  { id:"RFI-001", date:"2026-07-02", subject:"Foundation depth clarification near Grid A-1", raisedBy:"Site Engineer", assignedTo:"Structural Designer", status:"Responded", priority:"High", response:"Increase depth to 1.8m per revised drawing DWG-S001 Rev3.", dueDate:"2026-07-05" },
  { id:"RFI-002", date:"2026-07-06", subject:"Brick specification — fly ash vs clay", raisedBy:"Contractor", assignedTo:"Architect", status:"Open", priority:"Medium", response:"", dueDate:"2026-07-09" },
  { id:"RFI-003", date:"2026-07-08", subject:"Column tie spacing at critical section", raisedBy:"Site Engineer", assignedTo:"Structural Designer", status:"Responded", priority:"High", response:"Reduce tie spacing to 100mm in lap zone per IS 13920.", dueDate:"2026-07-10" },
  { id:"RFI-004", date:"2026-07-11", subject:"Paint brand approval for exterior", raisedBy:"Contractor", assignedTo:"Architect", status:"Open", priority:"Low", response:"", dueDate:"2026-07-18" },
  { id:"RFI-005", date:"2026-07-13", subject:"Plumbing pipe routing conflict with beam", raisedBy:"Plumber", assignedTo:"Structural Designer", status:"Closed", priority:"High", response:"Re-route pipe below beam soffit. See sketch attached.", dueDate:"2026-07-15" },
];

const STATUS_COLORS: Record<string,string> = { Open:"badge-critical", Responded:"badge-progress", Closed:"badge-complete" };
const PRIORITY_COLORS: Record<string,string> = { High:"badge-critical", Medium:"badge-delayed", Low:"badge-planned" };

export default function RFIPage() {
  const [rfis, setRFIs] = useState(DATA);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [expandId, setExpandId] = useState<string|null>(null);

  const filtered = rfis.filter(r=>
    (filterStatus==="All"||r.status===filterStatus)&&
    (!search||r.subject.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ padding:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:20 }}>
        {[
          { label:"Total RFIs", value:rfis.length, color:"#60a5fa" },
          { label:"Open", value:rfis.filter(r=>r.status==="Open").length, color:"#ef4444" },
          { label:"Responded", value:rfis.filter(r=>r.status==="Responded").length, color:"#f59e0b" },
          { label:"Closed", value:rfis.filter(r=>r.status==="Closed").length, color:"#34d399" },
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
          <input className="input-field" placeholder="Search RFIs..." value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:32, width:240, height:36, fontSize:12 }}/>
        </div>
        <select className="input-field" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ width:160, height:36, fontSize:12 }}>
          {["All","Open","Responded","Closed"].map(s=><option key={s}>{s}</option>)}
        </select>
        <div style={{ marginLeft:"auto" }}>
          <button className="btn-primary" style={{ fontSize:12 }}><Plus size={13}/> New RFI</button>
        </div>
      </div>

      <div className="card" style={{ overflow:"hidden" }}>
        {filtered.map(r=>(
          <div key={r.id} style={{ borderBottom:"1px solid #1e2d4a" }}>
            <div onClick={()=>setExpandId(expandId===r.id?null:r.id)} style={{ padding:"14px 16px", cursor:"pointer", display:"flex", gap:16, alignItems:"center" }}>
              <span style={{ fontFamily:"monospace", color:"#60a5fa", fontSize:12, minWidth:80 }}>{r.id}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, color:"#f1f5f9" }}>{r.subject}</div>
                <div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>Raised: {r.date} · Assigned to: {r.assignedTo} · Due: {r.dueDate}</div>
              </div>
              <span className={`badge ${PRIORITY_COLORS[r.priority]}`}>{r.priority}</span>
              <span className={`badge ${STATUS_COLORS[r.status]}`}>{r.status}</span>
            </div>
            {expandId===r.id && (
              <div style={{ padding:"0 16px 16px", background:"rgba(59,130,246,0.03)" }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                  <div>
                    <div className="label">Raised By</div>
                    <div style={{ color:"#94a3b8", fontSize:13 }}>{r.raisedBy}</div>
                  </div>
                  <div>
                    <div className="label">Response</div>
                    {r.response
                      ? <div style={{ color:"#34d399", fontSize:13 }}>{r.response}</div>
                      : <div style={{ color:"#64748b", fontSize:13, fontStyle:"italic" }}>Awaiting response…</div>}
                  </div>
                </div>
                {r.status==="Open" && (
                  <div style={{ marginTop:12 }}>
                    <textarea className="input-field" rows={2} placeholder="Type response here..." style={{ fontSize:12 }}/>
                    <div style={{ marginTop:8, display:"flex", gap:8 }}>
                      <button className="btn-primary" style={{ fontSize:12 }} onClick={()=>setRFIs(prev=>prev.map(x=>x.id===r.id?{...x,status:"Responded",response:"Response recorded."}:x))}>
                        <CheckCircle size={12}/> Mark Responded
                      </button>
                      <button className="btn-secondary" style={{ fontSize:12 }} onClick={()=>setRFIs(prev=>prev.map(x=>x.id===r.id?{...x,status:"Closed"}:x))}>Close RFI</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
