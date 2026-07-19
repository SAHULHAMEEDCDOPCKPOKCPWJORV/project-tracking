"use client";
import { useState } from "react";
import { Plus, Edit3, CheckCircle, XCircle, Clock, Search, Download, ClipboardCheck } from "lucide-react";

type Inspection = {
  id:string; activity:string; date:string; inspector:string;
  type:string; result:"Pass"|"Fail"|"Pending"; remarks:string;
};

const DATA: Inspection[] = [
  { id:"QC-001", activity:"Foundation RCC Pour", date:"2026-07-02", inspector:"Eng. Ramesh", type:"Concrete Cube Test", result:"Pass", remarks:"28-day strength 32 MPa. OK." },
  { id:"QC-002", activity:"Brickwork GF", date:"2026-07-05", inspector:"Eng. Priya", type:"Masonry Inspection", result:"Pass", remarks:"Joints uniform, plumb verified." },
  { id:"QC-003", activity:"Slab FF Pour", date:"2026-07-08", inspector:"Eng. Ramesh", type:"Slump Test", result:"Pass", remarks:"Slump 75mm. Acceptable." },
  { id:"QC-004", activity:"Electrical Conduit", date:"2026-07-10", inspector:"Eng. Suresh", type:"Electrical Check", result:"Fail", remarks:"Conduit not properly secured. Rectify." },
  { id:"QC-005", activity:"Plastering Int GF", date:"2026-07-12", inspector:"Eng. Priya", type:"Surface Finish", result:"Pending", remarks:"Inspection scheduled." },
  { id:"QC-006", activity:"Footing Steel Binding", date:"2026-07-01", inspector:"Eng. Ramesh", type:"Reinforcement Check", result:"Pass", remarks:"Cover blocks provided. Spacing correct." },
];

export default function QualityPage() {
  const [inspections, setInspections] = useState(DATA);
  const [search, setSearch] = useState("");
  const [filterResult, setFilterResult] = useState("All");
  const [editId, setEditId] = useState<string|null>(null);

  const filtered = inspections.filter(i=>
    (filterResult==="All"||i.result===filterResult)&&
    (!search||i.activity.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ padding:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:20 }}>
        {[
          { label:"Total Inspections", value:inspections.length, color:"#60a5fa" },
          { label:"Passed", value:inspections.filter(i=>i.result==="Pass").length, color:"#34d399" },
          { label:"Failed", value:inspections.filter(i=>i.result==="Fail").length, color:"#ef4444" },
          { label:"Pending", value:inspections.filter(i=>i.result==="Pending").length, color:"#f59e0b" },
        ].map(k=>(
          <div key={k.label} className="kpi-card" style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:`${k.color}18`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <ClipboardCheck size={20} color={k.color}/>
            </div>
            <div><div className="kpi-label">{k.label}</div><div className="kpi-value" style={{ fontSize:22, color:k.color }}>{k.value}</div></div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding:"12px 16px", marginBottom:16, display:"flex", gap:12, alignItems:"center" }}>
        <div style={{ position:"relative" }}>
          <Search size={14} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#64748b" }}/>
          <input className="input-field" placeholder="Search activity..." value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:32, width:220, height:36, fontSize:12 }}/>
        </div>
        <select className="input-field" value={filterResult} onChange={e=>setFilterResult(e.target.value)} style={{ width:150, height:36, fontSize:12 }}>
          {["All","Pass","Fail","Pending"].map(r=><option key={r}>{r}</option>)}
        </select>
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <button className="btn-secondary" style={{ fontSize:12 }}><Download size={13}/> Export</button>
          <button className="btn-primary" style={{ fontSize:12 }}><Plus size={13}/> New Inspection</button>
        </div>
      </div>

      <div className="card" style={{ overflow:"hidden" }}>
        <table className="data-table">
          <thead><tr><th>ID</th><th>Activity</th><th>Type</th><th>Date</th><th>Inspector</th><th>Result</th><th>Remarks</th><th>Edit</th></tr></thead>
          <tbody>
            {filtered.map(i=>{
              const isEdit = editId === i.id;
              return (
                <tr key={i.id}>
                  <td style={{ fontFamily:"monospace", color:"#60a5fa", fontSize:12 }}>{i.id}</td>
                  <td style={{ fontWeight:600 }}>{i.activity}</td>
                  <td><span className="badge badge-planned">{i.type}</span></td>
                  <td style={{ color:"#94a3b8", fontSize:12 }}>{i.date}</td>
                  <td style={{ color:"#94a3b8", fontSize:12 }}>{i.inspector}</td>
                  <td>
                    {isEdit
                      ? <select className="input-field" style={{ width:110, padding:"3px 8px", fontSize:12 }} value={i.result} onChange={e=>setInspections(prev=>prev.map(x=>x.id===i.id?{...x,result:e.target.value as any}:x))}>
                          {["Pass","Fail","Pending"].map(r=><option key={r}>{r}</option>)}
                        </select>
                      : <span className={`badge ${i.result==="Pass"?"badge-complete":i.result==="Fail"?"badge-critical":"badge-delayed"}`}>
                          {i.result==="Pass"?<CheckCircle size={11}/>:i.result==="Fail"?<XCircle size={11}/>:<Clock size={11}/>}
                          {" "}{i.result}
                        </span>}
                  </td>
                  <td style={{ color:"#94a3b8", fontSize:12 }}>{i.remarks}</td>
                  <td><button onClick={()=>setEditId(isEdit?null:i.id)} style={{ background:"none", border:"none", cursor:"pointer", color:isEdit?"#34d399":"#64748b", padding:4 }}><Edit3 size={14}/></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
