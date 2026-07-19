"use client";
import { useState } from "react";
import { Plus, Edit3, FileText, Search, Building } from "lucide-react";

type SubContractor = {
  id:string; name:string; scope:string; contact:string;
  contractValue:number; billed:number; paid:number;
  status:"Active"|"Completed"|"Terminated";
};

const DATA: SubContractor[] = [
  { id:"SC-001", name:"Sri Murugan Civil Works", scope:"Brickwork & Plastering", contact:"Murugan K", contractValue:1800000, billed:1200000, paid:900000, status:"Active" },
  { id:"SC-002", name:"Rajan Electrical", scope:"Electrical Works", contact:"Rajan S", contractValue:650000, billed:400000, paid:400000, status:"Active" },
  { id:"SC-003", name:"ARS Plumbing", scope:"Plumbing & Sanitary", contact:"Arumugam R", contractValue:520000, billed:520000, paid:468000, status:"Completed" },
  { id:"SC-004", name:"Sakthi Flooring Co", scope:"Flooring & Tiling", contact:"Sakthi V", contractValue:980000, billed:0, paid:0, status:"Active" },
  { id:"SC-005", name:"National Painters", scope:"Painting Works", contact:"Suresh N", contractValue:420000, billed:0, paid:0, status:"Active" },
];

export default function SubContractorsPage() {
  const [subs, setSubs] = useState(DATA);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string|null>(null);

  const filtered = subs.filter(s=>!search||s.name.toLowerCase().includes(search.toLowerCase()));
  const totalContract = subs.reduce((s,x)=>s+x.contractValue,0);
  const totalBilled = subs.reduce((s,x)=>s+x.billed,0);
  const totalPaid = subs.reduce((s,x)=>s+x.paid,0);
  const outstanding = totalBilled - totalPaid;

  return (
    <div style={{ padding:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:20 }}>
        {[
          { label:"Sub Contractors", value:subs.length, color:"#60a5fa" },
          { label:"Total Contract", value:`₹${(totalContract/100000).toFixed(1)}L`, color:"#a78bfa" },
          { label:"Total Billed", value:`₹${(totalBilled/100000).toFixed(1)}L`, color:"#f59e0b" },
          { label:"Outstanding", value:`₹${(outstanding/100000).toFixed(1)}L`, color:"#ef4444" },
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
          <input className="input-field" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:32, width:240, height:36, fontSize:12 }}/>
        </div>
        <div style={{ marginLeft:"auto" }}>
          <button className="btn-primary" style={{ fontSize:12 }}><Plus size={13}/> Add Sub Contractor</button>
        </div>
      </div>

      <div className="card" style={{ overflow:"hidden" }}>
        <table className="data-table">
          <thead><tr><th>Code</th><th>Name</th><th>Scope</th><th>Contact</th><th>Contract Value</th><th>Billed</th><th>Paid</th><th>Outstanding</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map(s=>{
              const outstanding = s.billed - s.paid;
              const pct = s.contractValue > 0 ? Math.round((s.billed/s.contractValue)*100) : 0;
              return (
                <tr key={s.id}>
                  <td style={{ fontFamily:"monospace", color:"#60a5fa", fontSize:12 }}>{s.id}</td>
                  <td>
                    <div style={{ fontWeight:600 }}>{s.name}</div>
                    <div style={{ fontSize:11, color:"#64748b" }}>Contact: {s.contact}</div>
                  </td>
                  <td style={{ color:"#94a3b8", fontSize:12 }}>{s.scope}</td>
                  <td style={{ color:"#94a3b8", fontSize:12 }}>{s.contact}</td>
                  <td style={{ fontWeight:600 }}>₹{s.contractValue.toLocaleString("en-IN")}</td>
                  <td>
                    <div style={{ fontSize:12 }}>₹{s.billed.toLocaleString("en-IN")}</div>
                    <div style={{ height:4, background:"#1e2d4a", borderRadius:2, marginTop:4, width:80 }}>
                      <div style={{ height:"100%", width:`${pct}%`, background:"#3b82f6", borderRadius:2 }}/>
                    </div>
                    <div style={{ fontSize:10, color:"#64748b" }}>{pct}%</div>
                  </td>
                  <td style={{ color:"#34d399" }}>₹{s.paid.toLocaleString("en-IN")}</td>
                  <td style={{ color:outstanding>0?"#ef4444":"#34d399", fontWeight:600 }}>₹{outstanding.toLocaleString("en-IN")}</td>
                  <td><span className={`badge ${s.status==="Active"?"badge-progress":s.status==="Completed"?"badge-complete":"badge-critical"}`}>{s.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
