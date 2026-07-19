"use client";
import { useState, useEffect } from "react";
import { useLabourStore } from "@/lib/store";
import { Search, Download, Users, Banknote, HardHat, RefreshCw, BarChart2, Plus, Edit2, Trash2, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

const TRADES = ["Mason", "Helper", "Steel Fixer", "Carpenter", "Electrician", "Plumber", "Painter", "Welder", "Surveyor", "Crane Operator", "JCB Operator", "QAQC", "Supervisor", "Safety", "Store Keeper", "Engineer"];
const STATES = ["Maharashtra", "Karnataka", "Tamil Nadu", "Delhi", "Gujarat", "Telangana"];
const DISTRICTS = ["Mumbai", "Bengaluru", "Chennai", "New Delhi", "Ahmedabad", "Hyderabad"];

const DEFAULT_RATES = [
  { id:"TR01", trade:"Mason", dailyRate:900, monthlyRate:23400, overtimeRate:150, availability:45, required:50 },
  { id:"TR02", trade:"Helper", dailyRate:650, monthlyRate:16900, overtimeRate:100, availability:80, required:100 },
  { id:"TR03", trade:"Steel Fixer", dailyRate:1000, monthlyRate:26000, overtimeRate:160, availability:20, required:25 },
  { id:"TR04", trade:"Carpenter", dailyRate:950, monthlyRate:24700, overtimeRate:140, availability:15, required:15 },
  { id:"TR05", trade:"Electrician", dailyRate:1100, monthlyRate:28600, overtimeRate:180, availability:10, required:8 },
  { id:"TR06", trade:"Plumber", dailyRate:1050, monthlyRate:27300, overtimeRate:170, availability:8, required:10 },
  { id:"TR07", trade:"Painter", dailyRate:800, monthlyRate:20800, overtimeRate:120, availability:25, required:20 },
  { id:"TR08", trade:"Welder", dailyRate:1200, monthlyRate:31200, overtimeRate:200, availability:5, required:6 },
  { id:"TR09", trade:"Surveyor", dailyRate:1500, monthlyRate:39000, overtimeRate:250, availability:2, required:2 },
  { id:"TR10", trade:"Crane Operator", dailyRate:1400, monthlyRate:36400, overtimeRate:220, availability:3, required:2 },
  { id:"TR11", trade:"JCB Operator", dailyRate:1300, monthlyRate:33800, overtimeRate:210, availability:4, required:3 },
  { id:"TR12", trade:"QAQC", dailyRate:1600, monthlyRate:41600, overtimeRate:260, availability:2, required:2 },
  { id:"TR13", trade:"Supervisor", dailyRate:1200, monthlyRate:31200, overtimeRate:200, availability:6, required:6 },
  { id:"TR14", trade:"Safety", dailyRate:1100, monthlyRate:28600, overtimeRate:180, availability:3, required:2 },
  { id:"TR15", trade:"Store Keeper", dailyRate:900, monthlyRate:23400, overtimeRate:150, availability:2, required:2 },
  { id:"TR16", trade:"Engineer", dailyRate:2000, monthlyRate:52000, overtimeRate:300, availability:4, required:3 },
];

export default function LabourPage() {
  const { rates, setRates, updateRate, addRate, deleteRate } = useLabourStore();
  const [search, setSearch] = useState("");
  const [filterTrade, setFilterTrade] = useState("All");
  const [state, setState] = useState("Tamil Nadu");
  const [district, setDistrict] = useState("Chennai");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    trade: "", dailyRate: 0, monthlyRate: 0, overtimeRate: 0, availability: 0, required: 0
  });

  useEffect(() => {
    if (rates.length === 0) setRates(DEFAULT_RATES);
  }, []);

  const filtered = rates.filter(r =>
    (filterTrade === "All" || r.trade === filterTrade) &&
    (!search || r.trade.toLowerCase().includes(search.toLowerCase()))
  );

  const totalDailyCost = filtered.reduce((s, r) => s + r.dailyRate * r.required, 0);
  const totalMonthlyCost = filtered.reduce((s, r) => s + r.monthlyRate * r.required, 0);
  const totalLabour = filtered.reduce((s, r) => s + r.required, 0);
  const availableLabour = filtered.reduce((s, r) => s + r.availability, 0);

  const chartData = filtered.slice(0, 10).map(r => ({
    name: r.trade,
    required: r.required,
    available: r.availability,
    cost: r.dailyRate * r.required
  }));

  return (
    <div style={{ padding:20, display:"flex", flexDirection:"column", gap:20, animation:"fadeInUp 0.4s ease" }}>
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
          <button className="btn-secondary"><RefreshCw size={14}/> Refresh</button>
          <button className="btn-primary" style={{ background:"linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", padding:"8px 16px" }} onClick={() => { setEditingItem(null); setFormData({ trade: "", dailyRate: 0, monthlyRate: 0, overtimeRate: 0, availability: 0, required: 0 }); setIsModalOpen(true); }}><Plus size={14}/> Add Trade</button>
        </div>
      </div>

      {/* KPIs & Chart */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          {[
            { label:"Total Required Manpower", value:totalLabour, icon:Users, color:"#60a5fa" },
            { label:"Total Available Manpower", value:availableLabour, icon:HardHat, color: availableLabour >= totalLabour ? "#34d399" : "#ef4444" },
            { label:"Estimated Daily Cost", value:formatCurrency(totalDailyCost), icon:Banknote, color:"#f59e0b" },
            { label:"Estimated Monthly Cost", value:formatCurrency(totalMonthlyCost), icon:BarChart2, color:"#8b5cf6" },
          ].map((k, i) => (
            <div key={i} className="kpi-card card-glow" style={{ display:"flex", alignItems:"center", gap:16, padding:20 }}>
              <div style={{ width:48, height:48, borderRadius:12, background:`${k.color}18`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <k.icon size={24} color={k.color}/>
              </div>
              <div>
                <div className="kpi-label" style={{ fontSize:10, marginBottom:4 }}>{k.label}</div>
                <div className="kpi-value" style={{ fontSize:22, color:k.color }}>{k.value}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding:20, height:220 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#94a3b8", marginBottom:10 }}>Labour Requirement vs Availability</div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top:0, right:0, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" vertical={false}/>
              <XAxis dataKey="name" tick={{ fontSize:9, fill:"#64748b" }} interval={0} angle={-30} textAnchor="end"/>
              <YAxis tick={{ fontSize:10, fill:"#64748b" }}/>
              <RechartsTooltip cursor={{ fill:"rgba(255,255,255,0.05)" }} contentStyle={{ background:"#0c1322", border:"1px solid #1e2d4a", borderRadius:8, fontSize:12 }}/>
              <Bar dataKey="required" name="Required" fill="#3b82f6" radius={[2,2,0,0]}/>
              <Bar dataKey="available" name="Available" fill="#10b981" radius={[2,2,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card" style={{ padding:"12px 16px", display:"flex", gap:12, alignItems:"center" }}>
        <div style={{ position:"relative", width:240 }}>
          <Search size={14} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#64748b" }}/>
          <input className="input-field" placeholder="Search Trades..." value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:32, width:"100%", height:36, fontSize:12 }}/>
        </div>
        <select className="input-field" value={filterTrade} onChange={e=>setFilterTrade(e.target.value)} style={{ width:180, height:36, fontSize:12 }}>
          <option value="All">All Trades</option>
          {TRADES.map(t=><option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow:"auto", flex:1, maxHeight:"calc(100vh - 400px)" }}>
        <table className="data-table">
          <thead style={{ position:"sticky", top:0, zIndex:10, background:"#0c1322" }}>
            <tr>
              <th>Trade Code</th>
              <th>Trade Description</th>
              <th style={{ textAlign:"right" }}>Daily Rate (8 hrs)</th>
              <th style={{ textAlign:"right" }}>Monthly Rate (26 days)</th>
              <th style={{ textAlign:"right" }}>Overtime (/hr)</th>
              <th style={{ textAlign:"right" }}>Available</th>
              <th style={{ textAlign:"right" }}>Required Qty</th>
              <th style={{ textAlign:"right" }}>Daily Cost</th>
              <th style={{ textAlign:"right" }}>Monthly Cost</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const dailyCost = r.dailyRate * r.required;
              const monthlyCost = r.monthlyRate * r.required;
              const status = r.availability >= r.required ? "Sufficient" : "Shortage";
              const statusColor = status === "Sufficient" ? "#10b981" : "#ef4444";
              
              return (
                <tr key={r.id} style={{ height:46 }}>
                  <td style={{ fontFamily:"monospace", color:"#60a5fa", fontSize:12 }}>{r.id}</td>
                  <td style={{ fontWeight:700, color:"#f1f5f9" }}>{r.trade}</td>
                  <td style={{ textAlign:"right" }}>
                    <input type="number" className="input-field" value={r.dailyRate} onChange={e => updateRate(r.id, { dailyRate:+e.target.value, monthlyRate:Math.round(+e.target.value*26) })} style={{ width:90, padding:"3px 8px", fontSize:12, textAlign:"right" }}/>
                  </td>
                  <td style={{ textAlign:"right" }}>
                    <input type="number" className="input-field" value={r.monthlyRate} onChange={e => updateRate(r.id, { monthlyRate:+e.target.value })} style={{ width:90, padding:"3px 8px", fontSize:12, textAlign:"right" }}/>
                  </td>
                  <td style={{ textAlign:"right" }}>
                    <input type="number" className="input-field" value={r.overtimeRate} onChange={e => updateRate(r.id, { overtimeRate:+e.target.value })} style={{ width:70, padding:"3px 8px", fontSize:12, textAlign:"right" }}/>
                  </td>
                  <td style={{ textAlign:"right" }}>
                    <input type="number" className="input-field" value={r.availability} onChange={e => updateRate(r.id, { availability:+e.target.value })} style={{ width:70, padding:"3px 8px", fontSize:12, textAlign:"right" }}/>
                  </td>
                  <td style={{ textAlign:"right" }}>
                    <input type="number" className="input-field" value={r.required} onChange={e => updateRate(r.id, { required:+e.target.value })} style={{ width:70, padding:"3px 8px", fontSize:12, textAlign:"right" }}/>
                  </td>
                  <td style={{ textAlign:"right", fontWeight:800, color:"#f59e0b" }}>{formatCurrency(dailyCost)}</td>
                  <td style={{ textAlign:"right", fontWeight:800, color:"#8b5cf6" }}>{formatCurrency(monthlyCost)}</td>
                  <td>
                    <span style={{ fontSize:10, fontWeight:700, color:statusColor, background:`${statusColor}18`, padding:"3px 8px", borderRadius:6, border:`1px solid ${statusColor}40` }}>
                      {status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={() => { setEditingItem(r); setFormData({ trade:r.trade, dailyRate:r.dailyRate, monthlyRate:r.monthlyRate, overtimeRate:r.overtimeRate, availability:r.availability, required:r.required }); setIsModalOpen(true); }} style={{ background:"transparent", border:"none", color:"#60a5fa", cursor:"pointer" }}><Edit2 size={14}/></button>
                      <button onClick={() => { if(confirm("Delete this trade?")) deleteRate(r.id); }} style={{ background:"transparent", border:"none", color:"#ef4444", cursor:"pointer" }}><Trash2 size={14}/></button>
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
          <div className="card" style={{ width:400, padding:24 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
              <h3 style={{ margin:0 }}>{editingItem ? "Edit Trade" : "Add Trade"}</h3>
              <button onClick={()=>setIsModalOpen(false)} style={{ background:"transparent", border:"none", color:"#94a3b8", cursor:"pointer" }}><X size={18}/></button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div>
                <label className="label">Trade Description</label>
                <input className="input-field" style={{ width:"100%" }} value={formData.trade} onChange={e=>setFormData({...formData, trade:e.target.value})}/>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div>
                  <label className="label">Daily Rate</label>
                  <input type="number" className="input-field" style={{ width:"100%" }} value={formData.dailyRate} onChange={e=>setFormData({...formData, dailyRate:+e.target.value, monthlyRate:Math.round(+e.target.value*26)})}/>
                </div>
                <div>
                  <label className="label">Monthly Rate</label>
                  <input type="number" className="input-field" style={{ width:"100%" }} value={formData.monthlyRate} onChange={e=>setFormData({...formData, monthlyRate:+e.target.value})}/>
                </div>
                <div>
                  <label className="label">Overtime / Hr</label>
                  <input type="number" className="input-field" style={{ width:"100%" }} value={formData.overtimeRate} onChange={e=>setFormData({...formData, overtimeRate:+e.target.value})}/>
                </div>
                <div/>
                <div>
                  <label className="label">Required Qty</label>
                  <input type="number" className="input-field" style={{ width:"100%" }} value={formData.required} onChange={e=>setFormData({...formData, required:+e.target.value})}/>
                </div>
                <div>
                  <label className="label">Available</label>
                  <input type="number" className="input-field" style={{ width:"100%" }} value={formData.availability} onChange={e=>setFormData({...formData, availability:+e.target.value})}/>
                </div>
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:12, marginTop:24 }}>
              <button className="btn-secondary" onClick={()=>setIsModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => {
                if (editingItem) {
                  updateRate(editingItem.id, formData);
                } else {
                  addRate({
                    id: `TR${Date.now().toString().slice(-4)}`, ...formData
                  });
                }
                setIsModalOpen(false);
              }}>{editingItem ? "Save Changes" : "Add Trade"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
