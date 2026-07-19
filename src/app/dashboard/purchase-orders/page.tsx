"use client";
import { useState } from "react";
import { Plus, FileText, CheckCircle, Clock, XCircle, Download, Search, Edit3 } from "lucide-react";

type PO = {
  id: string; supplier: string; date: string; items: string;
  amount: number; status: "Draft"|"Approved"|"Delivered"|"Cancelled";
  category: string;
};

const INITIAL_POS: PO[] = [
  { id:"PO-2026-001", supplier:"Ramco Cements Ltd", date:"2026-07-01", items:"OPC Cement 500 Bags", amount:210000, status:"Delivered", category:"Cement" },
  { id:"PO-2026-002", supplier:"JSW Steel", date:"2026-07-03", items:"TMT Steel 5MT", amount:360000, status:"Approved", category:"Steel" },
  { id:"PO-2026-003", supplier:"Sand Traders", date:"2026-07-05", items:"River Sand 50 Cum", amount:90000, status:"Delivered", category:"Aggregates" },
  { id:"PO-2026-004", supplier:"Kajaria Tiles", date:"2026-07-08", items:"Vitrified Tile 200 Sqm", amount:150000, status:"Draft", category:"Flooring" },
  { id:"PO-2026-005", supplier:"Finolex Cables", date:"2026-07-10", items:"Electrical Cable 500 Rmt", amount:42500, status:"Approved", category:"Electrical" },
  { id:"PO-2026-006", supplier:"CPVC Pipes Ltd", date:"2026-07-12", items:"CPVC Pipe 25mm 200 Rmt", amount:36000, status:"Delivered", category:"Plumbing" },
];

const STATUS_COLORS: Record<string,string> = { Draft:"badge-planned", Approved:"badge-progress", Delivered:"badge-complete", Cancelled:"badge-critical" };

export default function PurchaseOrdersPage() {
  const [pos, setPOs] = useState<PO[]>(INITIAL_POS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [editId, setEditId] = useState<string|null>(null);

  const filtered = pos.filter(p =>
    (filterStatus === "All" || p.status === filterStatus) &&
    (!search || p.supplier.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()))
  );

  const totalAmount = pos.reduce((s,p)=>s+p.amount,0);
  const delivered = pos.filter(p=>p.status==="Delivered").reduce((s,p)=>s+p.amount,0);
  const pending = pos.filter(p=>p.status==="Approved").reduce((s,p)=>s+p.amount,0);

  return (
    <div style={{ padding:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:20 }}>
        {[
          { label:"Total POs", value:pos.length, color:"#60a5fa" },
          { label:"Total Value", value:`₹${(totalAmount/100000).toFixed(1)}L`, color:"#a78bfa" },
          { label:"Delivered", value:`₹${(delivered/100000).toFixed(1)}L`, color:"#34d399" },
          { label:"Pending", value:`₹${(pending/100000).toFixed(1)}L`, color:"#f59e0b" },
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
          <input className="input-field" placeholder="Search POs..." value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:32, width:220, height:36, fontSize:12 }}/>
        </div>
        <select className="input-field" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ width:160, height:36, fontSize:12 }}>
          {["All","Draft","Approved","Delivered","Cancelled"].map(s=><option key={s}>{s}</option>)}
        </select>
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <button className="btn-secondary" style={{ fontSize:12 }}><Download size={13}/> Export</button>
          <button className="btn-primary" style={{ fontSize:12 }}><Plus size={13}/> New PO</button>
        </div>
      </div>

      <div className="card" style={{ overflow:"hidden" }}>
        <table className="data-table">
          <thead><tr><th>PO No</th><th>Supplier</th><th>Date</th><th>Items</th><th>Category</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(po=>{
              const isEdit = editId === po.id;
              return (
                <tr key={po.id}>
                  <td style={{ fontFamily:"monospace", color:"#60a5fa", fontSize:12 }}>{po.id}</td>
                  <td style={{ fontWeight:600 }}>{po.supplier}</td>
                  <td style={{ color:"#94a3b8", fontSize:12 }}>{po.date}</td>
                  <td style={{ color:"#94a3b8", fontSize:12 }}>{po.items}</td>
                  <td><span className="badge badge-progress">{po.category}</span></td>
                  <td style={{ fontWeight:700, color:"#34d399" }}>₹{po.amount.toLocaleString("en-IN")}</td>
                  <td>
                    {isEdit
                      ? <select className="input-field" style={{ width:130, padding:"3px 8px", fontSize:12 }} value={po.status} onChange={e=>{ setPOs(prev=>prev.map(p=>p.id===po.id?{...p,status:e.target.value as PO["status"]}:p)); }}>
                          {["Draft","Approved","Delivered","Cancelled"].map(s=><option key={s}>{s}</option>)}
                        </select>
                      : <span className={`badge ${STATUS_COLORS[po.status]}`}>{po.status}</span>}
                  </td>
                  <td>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={()=>setEditId(isEdit?null:po.id)} style={{ background:"none", border:"none", cursor:"pointer", color:isEdit?"#34d399":"#64748b", padding:4 }}><Edit3 size={14}/></button>
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
