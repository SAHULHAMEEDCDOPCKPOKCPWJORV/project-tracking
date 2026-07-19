"use client";
import { useState, useEffect } from "react";
import { useMaterialStore } from "@/lib/store";
import { Search, Download, TrendingUp, TrendingDown, RefreshCw, Plus, Edit2, Trash2, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const DEFAULT_MATERIALS = [
  { id:"M001", name:"OPC Cement", category:"Cement", brand:"UltraTech", specification:"53 Grade", unit:"Bag", todayPrice:420, yesterdayPrice:415, requiredQuantity:15000, stock:500, supplier:"Ramesh Traders", lastUpdated:new Date().toISOString() },
  { id:"M002", name:"TMT Steel Fe500", category:"Steel", brand:"Tata Tiscon", specification:"12mm", unit:"MT", todayPrice:72000, yesterdayPrice:72500, requiredQuantity:120, stock:12, supplier:"Tata Steel Direct", lastUpdated:new Date().toISOString() },
  { id:"M003", name:"River Sand", category:"Sand", brand:"Local", specification:"Coarse", unit:"Cum", todayPrice:1800, yesterdayPrice:1800, requiredQuantity:800, stock:80, supplier:"Bhavani Sand Suppliers", lastUpdated:new Date().toISOString() },
  { id:"M004", name:"M Sand", category:"M Sand", brand:"Robo Sand", specification:"Plastering", unit:"Cum", todayPrice:1600, yesterdayPrice:1550, requiredQuantity:1200, stock:200, supplier:"Robo Silicon", lastUpdated:new Date().toISOString() },
  { id:"M005", name:"20mm Aggregate", category:"Aggregate", brand:"Local", specification:"Blue Metal", unit:"Cum", todayPrice:1400, yesterdayPrice:1400, requiredQuantity:1500, stock:60, supplier:"Sri Ram Crushers", lastUpdated:new Date().toISOString() },
  { id:"M006", name:"AAC Blocks", category:"AAC", brand:"Aerocon", specification:"600x200x200", unit:"No", todayPrice:65, yesterdayPrice:63, requiredQuantity:25000, stock:2500, supplier:"HIL Ltd", lastUpdated:new Date().toISOString() },
  { id:"M007", name:"Vitrified Tile", category:"Tiles", brand:"Kajaria", specification:"600x600 Double Charge", unit:"Sqm", todayPrice:750, yesterdayPrice:750, requiredQuantity:3000, stock:300, supplier:"Kajaria Gallery", lastUpdated:new Date().toISOString() },
  { id:"M008", name:"Interior Emulsion", category:"Paint", brand:"Asian Paints", specification:"Royale Matte", unit:"Ltr", todayPrice:320, yesterdayPrice:310, requiredQuantity:1500, stock:400, supplier:"Asian Paints Depot", lastUpdated:new Date().toISOString() },
];

const CATEGORIES = ["All","Cement","Steel","Sand","M Sand","P Sand","Aggregate","AAC","Bricks","Blocks","Concrete","Tiles","Paint","Plumbing","Electrical","Waterproofing"];
const STATES = ["Maharashtra", "Karnataka", "Tamil Nadu", "Delhi", "Gujarat", "Telangana"];
const DISTRICTS = ["Mumbai", "Bengaluru", "Chennai", "New Delhi", "Ahmedabad", "Hyderabad"];

export default function MaterialsPage() {
  const { materials, setMaterials, updateMaterial, addMaterial, deleteMaterial } = useMaterialStore();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [state, setState] = useState("Tamil Nadu");
  const [district, setDistrict] = useState("Chennai");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "", category: "Cement", brand: "", specification: "", unit: "Bag", todayPrice: 0, requiredQuantity: 0, stock: 0, supplier: ""
  });

  useEffect(() => {
    if (materials.length === 0) setMaterials(DEFAULT_MATERIALS);
  }, []);

  const filtered = materials.filter(m =>
    (filterCat === "All" || m.category === filterCat) &&
    (!search || m.name.toLowerCase().includes(search.toLowerCase()) || m.brand.toLowerCase().includes(search.toLowerCase()))
  );

  const totalMaterialCost = filtered.reduce((s, m) => s + m.todayPrice * m.requiredQuantity, 0);

  return (
    <div style={{ padding:20, display:"flex", flexDirection:"column", gap:20 }}>
      {/* Top Controls */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
        <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(59,130,246,0.1)", border:"1px solid rgba(59,130,246,0.2)", borderRadius:8, padding:"6px 12px" }}>
            <span style={{ fontSize:12, color:"#60a5fa", fontWeight:700 }}>India</span>
            <span style={{ color:"#3b82f6" }}>→</span>
            <select value={state} onChange={e=>setState(e.target.value)} style={{ background:"transparent", border:"none", color:"#f1f5f9", fontSize:12, outline:"none", fontWeight:600 }}>
              {STATES.map(s=><option key={s}>{s}</option>)}
            </select>
            <span style={{ color:"#3b82f6" }}>→</span>
            <select value={district} onChange={e=>setDistrict(e.target.value)} style={{ background:"transparent", border:"none", color:"#f1f5f9", fontSize:12, outline:"none", fontWeight:600 }}>
              {DISTRICTS.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <div style={{ background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.3)", padding:"8px 16px", borderRadius:8, textAlign:"right" }}>
            <div style={{ fontSize:10, color:"#34d399", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>Total Material Cost</div>
            <div style={{ fontSize:20, fontWeight:900, color:"#10b981" }}>{formatCurrency(totalMaterialCost)}</div>
          </div>
          <button className="btn-secondary"><RefreshCw size={14}/> Refresh</button>
          <button className="btn-primary" style={{ background:"linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", padding:"8px 16px" }} onClick={() => { setEditingItem(null); setFormData({ name: "", category: "Cement", brand: "", specification: "", unit: "Bag", todayPrice: 0, requiredQuantity: 0, stock: 0, supplier: "" }); setIsModalOpen(true); }}><Plus size={14}/> Add Material</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding:"12px 16px", display:"flex", gap:12, alignItems:"center" }}>
        <div style={{ position:"relative", flex:1, maxWidth:300 }}>
          <Search size={14} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#64748b" }}/>
          <input className="input-field" placeholder="Search Material or Brand..." value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:32, width:"100%", height:36, fontSize:12 }}/>
        </div>
        <div style={{ display:"flex", gap:6, overflowX:"auto" }} className="hide-scrollbar">
          {CATEGORIES.map(c => (
            <button key={c} onClick={()=>setFilterCat(c)} style={{
              padding:"6px 14px", borderRadius:20, border:"1px solid", fontSize:11, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap",
              background: filterCat===c ? "rgba(59,130,246,0.15)" : "transparent",
              borderColor: filterCat===c ? "#3b82f6" : "#1e2d4a",
              color: filterCat===c ? "#60a5fa" : "#94a3b8"
            }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow:"auto", maxHeight:"calc(100vh - 230px)" }}>
        <table className="data-table">
          <thead style={{ position:"sticky", top:0, zIndex:10, background:"#0c1322" }}>
            <tr>
              <th>Material</th>
              <th>Brand</th>
              <th>Specification</th>
              <th>Unit</th>
              <th>Today's Price</th>
              <th>Yesterday</th>
              <th>Trend</th>
              <th>Req. Qty</th>
              <th>Total Cost</th>
              <th>Stock</th>
              <th>Supplier</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => {
              const diff = m.todayPrice - m.yesterdayPrice;
              const diffPercent = (diff / m.yesterdayPrice) * 100;
              const totalCost = m.todayPrice * m.requiredQuantity;
              return (
                <tr key={m.id} style={{ height:50 }}>
                  <td style={{ fontWeight:700, color:"#f1f5f9" }}>{m.name}</td>
                  <td style={{ color:"#94a3b8" }}>{m.brand}</td>
                  <td style={{ fontSize:11, color:"#64748b" }}>{m.specification}</td>
                  <td style={{ color:"#94a3b8" }}>{m.unit}</td>
                  <td style={{ fontWeight:800, color:"#e2e8f0" }}>₹{m.todayPrice.toLocaleString("en-IN")}</td>
                  <td style={{ color:"#64748b" }}>₹{m.yesterdayPrice.toLocaleString("en-IN")}</td>
                  <td>
                    {diff === 0 ? (
                      <span style={{ color:"#64748b", fontSize:12, fontWeight:700 }}>-</span>
                    ) : diff > 0 ? (
                      <span style={{ display:"flex", alignItems:"center", gap:4, color:"#ef4444", fontSize:11, fontWeight:700, background:"rgba(239,68,68,0.1)", padding:"2px 6px", borderRadius:4, width:"max-content" }}>
                        <TrendingUp size={12}/> +₹{diff} ({diffPercent.toFixed(1)}%)
                      </span>
                    ) : (
                      <span style={{ display:"flex", alignItems:"center", gap:4, color:"#10b981", fontSize:11, fontWeight:700, background:"rgba(16,185,129,0.1)", padding:"2px 6px", borderRadius:4, width:"max-content" }}>
                        <TrendingDown size={12}/> -₹{Math.abs(diff)} ({Math.abs(diffPercent).toFixed(1)}%)
                      </span>
                    )}
                  </td>
                  <td>
                    <input type="number" className="input-field" value={m.requiredQuantity} onChange={e=>updateMaterial(m.id,{requiredQuantity:+e.target.value})} style={{ width:80, padding:"4px 8px", fontSize:12, textAlign:"right" }}/>
                  </td>
                  <td style={{ color:"#34d399", fontWeight:700 }}>{formatCurrency(totalCost)}</td>
                  <td>
                    <input type="number" className="input-field" value={m.stock} onChange={e=>updateMaterial(m.id,{stock:+e.target.value})} style={{ width:70, padding:"4px 8px", fontSize:12, textAlign:"right" }}/>
                  </td>
                  <td style={{ fontSize:11, color:"#94a3b8" }}>{m.supplier}</td>
                  <td style={{ fontSize:10, color:"#64748b" }}>{new Date(m.lastUpdated).toLocaleDateString("en-IN")}</td>
                  <td>
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={() => { setEditingItem(m); setFormData({ name:m.name, category:m.category, brand:m.brand, specification:m.specification, unit:m.unit, todayPrice:m.todayPrice, requiredQuantity:m.requiredQuantity, stock:m.stock, supplier:m.supplier }); setIsModalOpen(true); }} style={{ background:"transparent", border:"none", color:"#60a5fa", cursor:"pointer" }}><Edit2 size={14}/></button>
                      <button onClick={() => { if(confirm("Delete this material?")) deleteMaterial(m.id); }} style={{ background:"transparent", border:"none", color:"#ef4444", cursor:"pointer" }}><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.6)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div className="card" style={{ width:500, padding:24 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
              <h3 style={{ margin:0 }}>{editingItem ? "Edit Material" : "Add Material"}</h3>
              <button onClick={()=>setIsModalOpen(false)} style={{ background:"transparent", border:"none", color:"#94a3b8", cursor:"pointer" }}><X size={18}/></button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div>
                <label className="label">Name</label>
                <input className="input-field" style={{ width:"100%" }} value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})}/>
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input-field" style={{ width:"100%" }} value={formData.category} onChange={e=>setFormData({...formData, category:e.target.value})}>
                  {CATEGORIES.filter(c=>c!=="All").map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Brand</label>
                <input className="input-field" style={{ width:"100%" }} value={formData.brand} onChange={e=>setFormData({...formData, brand:e.target.value})}/>
              </div>
              <div>
                <label className="label">Specification</label>
                <input className="input-field" style={{ width:"100%" }} value={formData.specification} onChange={e=>setFormData({...formData, specification:e.target.value})}/>
              </div>
              <div>
                <label className="label">Unit</label>
                <input className="input-field" style={{ width:"100%" }} value={formData.unit} onChange={e=>setFormData({...formData, unit:e.target.value})}/>
              </div>
              <div>
                <label className="label">Price (₹)</label>
                <input type="number" className="input-field" style={{ width:"100%" }} value={formData.todayPrice} onChange={e=>setFormData({...formData, todayPrice:+e.target.value})}/>
              </div>
              <div>
                <label className="label">Required Qty</label>
                <input type="number" className="input-field" style={{ width:"100%" }} value={formData.requiredQuantity} onChange={e=>setFormData({...formData, requiredQuantity:+e.target.value})}/>
              </div>
              <div>
                <label className="label">Current Stock</label>
                <input type="number" className="input-field" style={{ width:"100%" }} value={formData.stock} onChange={e=>setFormData({...formData, stock:+e.target.value})}/>
              </div>
              <div style={{ gridColumn:"1 / -1" }}>
                <label className="label">Supplier</label>
                <input className="input-field" style={{ width:"100%" }} value={formData.supplier} onChange={e=>setFormData({...formData, supplier:e.target.value})}/>
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:12, marginTop:24 }}>
              <button className="btn-secondary" onClick={()=>setIsModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => {
                if (editingItem) {
                  const changes = { ...formData, yesterdayPrice: editingItem.todayPrice, lastUpdated: new Date().toISOString() };
                  updateMaterial(editingItem.id, changes);
                } else {
                  addMaterial({
                    id: `M${Date.now()}`, yesterdayPrice: formData.todayPrice, lastUpdated: new Date().toISOString(), ...formData
                  });
                }
                setIsModalOpen(false);
              }}>{editingItem ? "Save Changes" : "Add Material"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
