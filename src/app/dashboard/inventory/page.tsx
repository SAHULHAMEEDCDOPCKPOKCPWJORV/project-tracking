"use client";
import { useState, useEffect } from "react";
import { useMaterialStore } from "@/lib/store";
import { Package, AlertTriangle, TrendingDown, ArrowDown, ArrowUp, Search } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

export default function InventoryPage() {
  const { materials, setMaterials, updateMaterial } = useMaterialStore();

  useEffect(() => {
    if (materials.length === 0) setMaterials([
      { id:"M001", name:"OPC Cement 53 Grade", category:"Cement", unit:"Bag", unitPrice:420, stock:500 },
      { id:"M002", name:"TMT Steel Fe500 12mm", category:"Steel", unit:"MT", unitPrice:72000, stock:12 },
      { id:"M003", name:"River Sand", category:"Aggregates", unit:"Cum", unitPrice:1800, stock:80 },
      { id:"M004", name:"20mm Coarse Aggregate", category:"Aggregates", unit:"Cum", unitPrice:1400, stock:60 },
      { id:"M005", name:"Brick (Fly Ash)", category:"Masonry", unit:"No", unitPrice:8, stock:25000 },
      { id:"M006", name:"CPVC Pipe 25mm", category:"Plumbing", unit:"Rmt", unitPrice:180, stock:500 },
      { id:"M007", name:"Vitrified Tile 600x600", category:"Flooring", unit:"Sqm", unitPrice:750, stock:300 },
      { id:"M008", name:"Electrical Cable 4Sqmm", category:"Electrical", unit:"Rmt", unitPrice:85, stock:2000 },
    ]);
  }, []);

  const [search, setSearch] = useState("");
  const [issueQty, setIssueQty] = useState<Record<string,number>>({});

  const totalValue = materials.reduce((s,m)=>s+m.unitPrice*m.stock,0);
  const lowStock = materials.filter(m=>m.stock<50);
  const chartData = materials.map(m=>({ name:m.name.length>20?m.name.slice(0,20)+"…":m.name, value:m.unitPrice*m.stock, stock:m.stock }));
  const COLORS = ["#60a5fa","#a78bfa","#34d399","#f59e0b","#ef4444","#f97316","#06b6d4","#ec4899"];

  const issueStock = (id: string) => {
    const qty = issueQty[id] || 0;
    const mat = materials.find(m=>m.id===id);
    if (mat && qty > 0 && qty <= mat.stock) {
      updateMaterial(id, { stock: mat.stock - qty });
      setIssueQty(prev=>({...prev,[id]:0}));
    }
  };

  const filtered = materials.filter(m=>!search||m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:20 }}>
        {[
          { label:"Total Items", value:materials.length, color:"#60a5fa" },
          { label:"Total Value", value:`₹${(totalValue/100000).toFixed(1)}L`, color:"#34d399" },
          { label:"Low Stock Alerts", value:lowStock.length, color:"#ef4444" },
          { label:"Categories", value:Array.from(new Set(materials.map(m=>m.category))).length, color:"#a78bfa" },
        ].map(k=>(
          <div key={k.label} className="kpi-card">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ fontSize:24, color:k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {lowStock.length>0 && (
        <div style={{ padding:"12px 16px", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:10, marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
          <AlertTriangle size={16} color="#ef4444"/>
          <span style={{ fontSize:13, color:"#fca5a5" }}>⚠ Low stock alert: {lowStock.map(m=>m.name).join(", ")}</span>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16, marginBottom:16 }}>
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, color:"#f1f5f9", marginBottom:16 }}>Stock Value by Item</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData.slice(0,8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a"/>
              <XAxis type="number" tick={{ fill:"#64748b", fontSize:10 }} tickFormatter={v=>`₹${(v/1000).toFixed(0)}K`}/>
              <YAxis type="category" dataKey="name" tick={{ fill:"#94a3b8", fontSize:10 }} width={130}/>
              <Tooltip contentStyle={{ background:"#1a2235", border:"1px solid #2a3f6b", borderRadius:8, color:"#f1f5f9" }} formatter={(v:any)=>[`₹${Number(v).toLocaleString("en-IN")}`,""]}/>
              <Bar dataKey="value" radius={[0,4,4,0]}>
                {chartData.slice(0,8).map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, color:"#f1f5f9", marginBottom:16 }}>ABC Analysis</div>
          {materials.slice().sort((a,b)=>b.unitPrice*b.stock - a.unitPrice*a.stock).slice(0,5).map((m,i)=>{
            const label = i<2?"A":i<4?"B":"C";
            const color = i<2?"#34d399":i<4?"#f59e0b":"#60a5fa";
            return (
              <div key={m.id} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <span style={{ width:22, height:22, borderRadius:6, background:`${color}22`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color }}>{label}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, color:"#f1f5f9", fontWeight:600 }}>{m.name.slice(0,22)}</div>
                  <div style={{ fontSize:11, color:"#64748b" }}>₹{(m.unitPrice*m.stock).toLocaleString("en-IN")}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ padding:"12px 16px", marginBottom:16, display:"flex", gap:12 }}>
        <div style={{ position:"relative" }}>
          <Search size={14} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#64748b" }}/>
          <input className="input-field" placeholder="Search inventory..." value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:32, width:240, height:36, fontSize:12 }}/>
        </div>
      </div>

      <div className="card" style={{ overflow:"hidden" }}>
        <table className="data-table">
          <thead><tr><th>Item</th><th>Category</th><th>Unit</th><th>Stock</th><th>Unit Price</th><th>Stock Value</th><th>Status</th><th>Issue Qty</th><th>Issue</th></tr></thead>
          <tbody>
            {filtered.map(m=>{
              const status = m.stock<50?"critical":m.stock<100?"delayed":"complete";
              return (
                <tr key={m.id}>
                  <td style={{ fontWeight:600 }}>{m.name}</td>
                  <td><span className="badge badge-progress">{m.category}</span></td>
                  <td style={{ color:"#94a3b8" }}>{m.unit}</td>
                  <td style={{ fontWeight:700, color:m.stock<50?"#ef4444":m.stock<100?"#f59e0b":"#34d399" }}>{m.stock.toLocaleString("en-IN")}</td>
                  <td>₹{m.unitPrice.toLocaleString("en-IN")}</td>
                  <td style={{ color:"#60a5fa" }}>₹{(m.unitPrice*m.stock).toLocaleString("en-IN")}</td>
                  <td><span className={`badge badge-${status}`}>{m.stock<50?"Low":m.stock<100?"Medium":"Good"}</span></td>
                  <td><input type="number" className="input-field" style={{ width:80, padding:"3px 8px", fontSize:12 }} min={0} max={m.stock} value={issueQty[m.id]||""} onChange={e=>setIssueQty(prev=>({...prev,[m.id]:+e.target.value}))}/></td>
                  <td><button className="btn-danger" style={{ fontSize:11, padding:"4px 10px" }} onClick={()=>issueStock(m.id)}><ArrowDown size={11}/> Issue</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
