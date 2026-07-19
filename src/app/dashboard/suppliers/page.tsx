"use client";
import { useState } from "react";
import { Star, Edit3, Plus, Search, Phone, Mail } from "lucide-react";

type Supplier = { id:string; name:string; category:string; contact:string; phone:string; email:string; rating:number; totalOrders:number; totalValue:number; status:"Active"|"Inactive"|"Blacklisted" };

const SUPPLIERS: Supplier[] = [
  { id:"S001", name:"Ramco Cements Ltd", category:"Cement", contact:"Suresh Kumar", phone:"9876543210", email:"suresh@ramco.com", rating:5, totalOrders:12, totalValue:2520000, status:"Active" },
  { id:"S002", name:"JSW Steel", category:"Steel", contact:"Rajesh Patel", phone:"9876543211", email:"rajesh@jsw.com", rating:4, totalOrders:8, totalValue:2880000, status:"Active" },
  { id:"S003", name:"Sand Traders Pvt", category:"Aggregates", contact:"Mani S", phone:"9876543212", email:"mani@sand.com", rating:3, totalOrders:15, totalValue:1350000, status:"Active" },
  { id:"S004", name:"Kajaria Tiles", category:"Flooring", contact:"Priya R", phone:"9876543213", email:"priya@kajaria.com", rating:5, totalOrders:6, totalValue:900000, status:"Active" },
  { id:"S005", name:"Finolex Cables", category:"Electrical", contact:"Arun V", phone:"9876543214", email:"arun@finolex.com", rating:4, totalOrders:10, totalValue:425000, status:"Active" },
  { id:"S006", name:"Plumber Corp", category:"Plumbing", contact:"Balu K", phone:"9876543215", email:"balu@plumbcorp.com", rating:2, totalOrders:4, totalValue:144000, status:"Inactive" },
];

const StarRating = ({ n }: { n:number }) => (
  <div style={{ display:"flex", gap:2 }}>
    {[1,2,3,4,5].map(i=><Star key={i} size={13} fill={i<=n?"#f59e0b":"none"} color="#f59e0b"/>)}
  </div>
);

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState(SUPPLIERS);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string|null>(null);

  const filtered = suppliers.filter(s=>!search||s.name.toLowerCase().includes(search.toLowerCase())||s.category.toLowerCase().includes(search.toLowerCase()));
  const totalValue = suppliers.reduce((s,x)=>s+x.totalValue,0);
  const avgRating = suppliers.reduce((s,x)=>s+x.rating,0)/suppliers.length;

  return (
    <div style={{ padding:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:20 }}>
        {[
          { label:"Total Suppliers", value:suppliers.length, color:"#60a5fa" },
          { label:"Active", value:suppliers.filter(s=>s.status==="Active").length, color:"#34d399" },
          { label:"Total Procurement", value:`₹${(totalValue/100000).toFixed(1)}L`, color:"#a78bfa" },
          { label:"Avg Rating", value:`${avgRating.toFixed(1)} ★`, color:"#f59e0b" },
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
          <input className="input-field" placeholder="Search suppliers..." value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:32, width:240, height:36, fontSize:12 }}/>
        </div>
        <div style={{ marginLeft:"auto" }}>
          <button className="btn-primary" style={{ fontSize:12 }}><Plus size={13}/> Add Supplier</button>
        </div>
      </div>

      <div className="card" style={{ overflow:"hidden" }}>
        <table className="data-table">
          <thead><tr><th>Code</th><th>Supplier Name</th><th>Category</th><th>Contact</th><th>Rating</th><th>Total Orders</th><th>Total Value</th><th>Status</th><th>Edit</th></tr></thead>
          <tbody>
            {filtered.map(s=>{
              const isEdit = editId === s.id;
              return (
                <tr key={s.id}>
                  <td style={{ fontFamily:"monospace", color:"#60a5fa", fontSize:12 }}>{s.id}</td>
                  <td>
                    <div style={{ fontWeight:600, color:"#f1f5f9" }}>{s.name}</div>
                    <div style={{ fontSize:11, color:"#64748b", display:"flex", gap:8, marginTop:2 }}>
                      <span style={{ display:"flex", alignItems:"center", gap:3 }}><Phone size={10}/>{s.phone}</span>
                      <span style={{ display:"flex", alignItems:"center", gap:3 }}><Mail size={10}/>{s.email}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-progress">{s.category}</span></td>
                  <td style={{ color:"#94a3b8", fontSize:12 }}>{s.contact}</td>
                  <td><StarRating n={s.rating}/></td>
                  <td style={{ textAlign:"center" }}>{s.totalOrders}</td>
                  <td style={{ color:"#34d399", fontWeight:600 }}>₹{s.totalValue.toLocaleString("en-IN")}</td>
                  <td>
                    {isEdit
                      ? <select className="input-field" style={{ width:130, padding:"3px 8px", fontSize:12 }} value={s.status} onChange={e=>setSuppliers(prev=>prev.map(x=>x.id===s.id?{...x,status:e.target.value as any}:x))}>
                          {["Active","Inactive","Blacklisted"].map(st=><option key={st}>{st}</option>)}
                        </select>
                      : <span className={`badge ${s.status==="Active"?"badge-complete":s.status==="Inactive"?"badge-planned":"badge-critical"}`}>{s.status}</span>}
                  </td>
                  <td><button onClick={()=>setEditId(isEdit?null:s.id)} style={{ background:"none", border:"none", cursor:"pointer", color:isEdit?"#34d399":"#64748b", padding:4 }}><Edit3 size={14}/></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
