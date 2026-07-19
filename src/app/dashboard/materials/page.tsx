"use client";
import { useState, useEffect } from "react";
import { useMaterialStore } from "@/lib/store";
import { Plus, Edit3, Search, Download, Package } from "lucide-react";

const DEFAULT_MATERIALS = [
  { id:"M001", name:"OPC Cement 53 Grade", category:"Cement", unit:"Bag", unitPrice:420, stock:500 },
  { id:"M002", name:"TMT Steel Fe500 12mm", category:"Steel", unit:"MT", unitPrice:72000, stock:12 },
  { id:"M003", name:"River Sand", category:"Aggregates", unit:"Cum", unitPrice:1800, stock:80 },
  { id:"M004", name:"20mm Coarse Aggregate", category:"Aggregates", unit:"Cum", unitPrice:1400, stock:60 },
  { id:"M005", name:"Brick (Fly Ash)", category:"Masonry", unit:"No", unitPrice:8, stock:25000 },
  { id:"M006", name:"CPVC Pipe 25mm", category:"Plumbing", unit:"Rmt", unitPrice:180, stock:500 },
  { id:"M007", name:"Vitrified Tile 600x600", category:"Flooring", unit:"Sqm", unitPrice:750, stock:300 },
  { id:"M008", name:"Electrical Cable 4Sqmm", category:"Electrical", unit:"Rmt", unitPrice:85, stock:2000 },
  { id:"M009", name:"UPVC Window 3-track", category:"Doors & Windows", unit:"No", unitPrice:8500, stock:20 },
  { id:"M010", name:"Interior Emulsion Paint", category:"Paint", unit:"Ltr", unitPrice:220, stock:400 },
];

const CATEGORIES = ["All","Cement","Steel","Aggregates","Masonry","Plumbing","Flooring","Electrical","Doors & Windows","Paint"];

export default function MaterialsPage() {
  const { materials, setMaterials, updateMaterial } = useMaterialStore();
  const [editId, setEditId] = useState<string|null>(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");

  useEffect(() => {
    if (materials.length === 0) setMaterials(DEFAULT_MATERIALS);
  }, []);

  const filtered = materials.filter(m =>
    (filterCat === "All" || m.category === filterCat) &&
    (!search || m.name.toLowerCase().includes(search.toLowerCase()))
  );

  const totalValue = materials.reduce((s, m) => s + m.unitPrice * m.stock, 0);
  const categories = Array.from(new Set(materials.map(m => m.category)));

  return (
    <div style={{ padding:20 }}>
      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:20 }}>
        {[
          { label:"Total Items", value:materials.length, color:"#60a5fa" },
          { label:"Categories", value:categories.length, color:"#a78bfa" },
          { label:"Inventory Value", value:`₹${(totalValue/100000).toFixed(1)}L`, color:"#34d399" },
          { label:"Low Stock (<50)", value:materials.filter(m=>m.stock<50).length, color:"#ef4444" },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ fontSize:24, color:k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="card" style={{ padding:"12px 16px", marginBottom:16, display:"flex", gap:12, alignItems:"center" }}>
        <div style={{ position:"relative" }}>
          <Search size={14} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#64748b" }}/>
          <input className="input-field" placeholder="Search materials..." value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:32, width:220, height:36, fontSize:12 }}/>
        </div>
        <select className="input-field" value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{ width:180, height:36, fontSize:12 }}>
          {CATEGORIES.map(c=><option key={c}>{c}</option>)}
        </select>
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <button className="btn-secondary" style={{ fontSize:12 }}><Download size={13}/> Export</button>
          <button className="btn-primary" style={{ fontSize:12 }}><Plus size={13}/> Add Material</button>
        </div>
      </div>

      <div className="card" style={{ overflow:"hidden" }}>
        <table className="data-table">
          <thead>
            <tr><th>Code</th><th>Material Name</th><th>Category</th><th>Unit</th><th>Unit Price (₹)</th><th>Stock</th><th>Stock Value</th><th>Status</th><th>Edit</th></tr>
          </thead>
          <tbody>
            {filtered.map(m => {
              const isEdit = editId === m.id;
              const val = m.unitPrice * m.stock;
              const stockStatus = m.stock < 50 ? "badge-critical" : m.stock < 100 ? "badge-delayed" : "badge-complete";
              const stockLabel = m.stock < 50 ? "Low" : m.stock < 100 ? "Medium" : "Good";
              return (
                <tr key={m.id}>
                  <td style={{ fontFamily:"monospace", color:"#60a5fa", fontSize:12 }}>{m.id}</td>
                  <td style={{ fontWeight:600 }}>{isEdit ? <input className="input-field" style={{ width:"100%", padding:"3px 8px", fontSize:12 }} value={m.name} onChange={e=>updateMaterial(m.id,{name:e.target.value})}/> : m.name}</td>
                  <td><span className="badge badge-progress">{m.category}</span></td>
                  <td style={{ color:"#94a3b8" }}>{m.unit}</td>
                  <td>{isEdit ? <input type="number" className="input-field" style={{ width:100, padding:"3px 8px", fontSize:12 }} value={m.unitPrice} onChange={e=>updateMaterial(m.id,{unitPrice:+e.target.value})}/> : `₹${m.unitPrice.toLocaleString("en-IN")}`}</td>
                  <td>{isEdit ? <input type="number" className="input-field" style={{ width:90, padding:"3px 8px", fontSize:12 }} value={m.stock} onChange={e=>updateMaterial(m.id,{stock:+e.target.value})}/> : m.stock.toLocaleString("en-IN")}</td>
                  <td style={{ color:"#34d399", fontWeight:600 }}>₹{val.toLocaleString("en-IN")}</td>
                  <td><span className={`badge ${stockStatus}`}>{stockLabel}</span></td>
                  <td><button onClick={()=>setEditId(isEdit?null:m.id)} style={{ background:"none", border:"none", cursor:"pointer", color:isEdit?"#34d399":"#64748b", padding:4 }}><Edit3 size={14}/></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
