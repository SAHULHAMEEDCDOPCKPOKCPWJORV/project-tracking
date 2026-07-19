"use client";
import { useState, useEffect } from "react";
import { useLabourStore } from "@/lib/store";
import { Plus, Edit3, Trash2, Download, Search, Users, HardHat, Banknote, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const TRADES = ["Mason","Carpenter","Steel Fixer","Plumber","Electrician","Painter","Helper","Excavator Operator","Crane Operator","Welder"];
const CONTRACTORS = ["ABC Contractors","XYZ Labour","Sundar Works","Rajan & Co","National Labour"];

const DEFAULT_WORKERS = [
  { id:"W001", name:"Rajan Kumar", trade:"Mason", dailyWage:900, contractor:"ABC Contractors" },
  { id:"W002", name:"Murugan S", trade:"Carpenter", dailyWage:950, contractor:"ABC Contractors" },
  { id:"W003", name:"Selvam P", trade:"Steel Fixer", dailyWage:1000, contractor:"XYZ Labour" },
  { id:"W004", name:"Arjun R", trade:"Plumber", dailyWage:850, contractor:"Sundar Works" },
  { id:"W005", name:"Suresh V", trade:"Electrician", dailyWage:1100, contractor:"Rajan & Co" },
  { id:"W006", name:"Karthik M", trade:"Helper", dailyWage:650, contractor:"National Labour" },
  { id:"W007", name:"Balu T", trade:"Painter", dailyWage:800, contractor:"ABC Contractors" },
  { id:"W008", name:"Durai K", trade:"Helper", dailyWage:650, contractor:"XYZ Labour" },
  { id:"W009", name:"Ramesh A", trade:"Steel Fixer", dailyWage:1000, contractor:"XYZ Labour" },
  { id:"W010", name:"Vinoth S", trade:"Mason", dailyWage:900, contractor:"ABC Contractors" },
];

export default function LabourPage() {
  const { workers, setWorkers, updateWorker } = useLabourStore();
  const [editId, setEditId] = useState<string|null>(null);
  const [search, setSearch] = useState("");
  const [filterTrade, setFilterTrade] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [newWorker, setNewWorker] = useState({ name:"", trade:"Mason", dailyWage:800, contractor:"ABC Contractors" });

  useEffect(() => {
    if (workers.length === 0) setWorkers(DEFAULT_WORKERS);
  }, []);

  const filtered = workers.filter(w =>
    (filterTrade === "All" || w.trade === filterTrade) &&
    (!search || w.name.toLowerCase().includes(search.toLowerCase()) || w.trade.toLowerCase().includes(search.toLowerCase()))
  );

  const trades = Array.from(new Set(workers.map(w => w.trade)));
  const totalPayroll = workers.reduce((s, w) => s + w.dailyWage, 0);
  const avgWage = workers.length ? Math.round(totalPayroll / workers.length) : 0;

  const addWorker = () => {
    const id = `W${String(workers.length + 1).padStart(3,"0")}`;
    setWorkers([...workers, { id, ...newWorker }]);
    setNewWorker({ name:"", trade:"Mason", dailyWage:800, contractor:"ABC Contractors" });
    setShowAdd(false);
  };

  return (
    <div style={{ padding:20, animation:"fadeInUp 0.4s ease" }}>
      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:20 }}>
        {[
          { label:"Total Workers", value:workers.length, icon:Users, color:"#60a5fa" },
          { label:"Trades", value:trades.length, icon:HardHat, color:"#a78bfa" },
          { label:"Daily Payroll", value:formatCurrency(totalPayroll), icon:Banknote, color:"#34d399" },
          { label:"Avg Daily Wage", value:formatCurrency(avgWage), icon:TrendingUp, color:"#f59e0b" },
        ].map(k => (
          <div key={k.label} className="kpi-card card-glow" style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:`${k.color}18`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <k.icon size={22} color={k.color}/>
            </div>
            <div>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value" style={{ fontSize:22, color:k.color }}>{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="card" style={{ padding:"12px 16px", marginBottom:16, display:"flex", gap:12, alignItems:"center" }}>
        <div style={{ position:"relative" }}>
          <Search size={14} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#64748b" }}/>
          <input className="input-field" placeholder="Search workers..." value={search}
            onChange={e => setSearch(e.target.value)} style={{ paddingLeft:32, width:220, height:36, fontSize:12 }}/>
        </div>
        <select className="input-field" value={filterTrade} onChange={e => setFilterTrade(e.target.value)} style={{ width:160, height:36, fontSize:12 }}>
          <option value="All">All Trades</option>
          {TRADES.map(t => <option key={t}>{t}</option>)}
        </select>
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <button className="btn-secondary" style={{ fontSize:12, padding:"7px 14px" }}><Download size={13}/> Export</button>
          <button className="btn-primary" style={{ fontSize:12, padding:"7px 14px" }} onClick={() => setShowAdd(!showAdd)}><Plus size={13}/> Add Worker</button>
        </div>
      </div>

      {/* Add Worker Row */}
      {showAdd && (
        <div className="card glass" style={{ padding:16, marginBottom:16, display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr auto", gap:12, alignItems:"end" }}>
          <div><label className="label">Name</label><input className="input-field" style={{ height:36, fontSize:12 }} value={newWorker.name} onChange={e => setNewWorker({...newWorker, name:e.target.value})} placeholder="Full Name"/></div>
          <div><label className="label">Trade</label>
            <select className="input-field" style={{ height:36, fontSize:12 }} value={newWorker.trade} onChange={e => setNewWorker({...newWorker, trade:e.target.value})}>
              {TRADES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="label">Daily Wage (₹)</label><input type="number" className="input-field" style={{ height:36, fontSize:12 }} value={newWorker.dailyWage} onChange={e => setNewWorker({...newWorker, dailyWage:+e.target.value})}/></div>
          <div><label className="label">Contractor</label>
            <select className="input-field" style={{ height:36, fontSize:12 }} value={newWorker.contractor} onChange={e => setNewWorker({...newWorker, contractor:e.target.value})}>
              {CONTRACTORS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button className="btn-primary" style={{ height:36, fontSize:12 }} onClick={addWorker}>Add</button>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ overflow:"hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Worker ID</th><th>Name</th><th>Trade</th><th>Daily Wage</th><th>Contractor</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(w => {
              const isEdit = editId === w.id;
              return (
                <tr key={w.id}>
                  <td><span style={{ fontFamily:"monospace", color:"#60a5fa", fontSize:12 }}>{w.id}</span></td>
                  <td style={{ fontWeight:600 }}>
                    {isEdit ? <input className="input-field" style={{ width:"100%", padding:"3px 8px", fontSize:12 }} value={w.name} onChange={e => updateWorker(w.id, { name:e.target.value })}/> : w.name}
                  </td>
                  <td>
                    {isEdit
                      ? <select className="input-field" style={{ width:140, padding:"3px 8px", fontSize:12 }} value={w.trade} onChange={e => updateWorker(w.id, { trade:e.target.value })}>
                          {TRADES.map(t => <option key={t}>{t}</option>)}
                        </select>
                      : <span className="badge badge-progress">{w.trade}</span>}
                  </td>
                  <td style={{ color:"#34d399", fontWeight:700 }}>
                    {isEdit ? <input type="number" className="input-field" style={{ width:100, padding:"3px 8px", fontSize:12 }} value={w.dailyWage} onChange={e => updateWorker(w.id, { dailyWage:+e.target.value })}/> : `₹${w.dailyWage.toLocaleString("en-IN")}`}
                  </td>
                  <td style={{ color:"#94a3b8" }}>{w.contractor}</td>
                  <td>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={() => setEditId(isEdit ? null : w.id)} style={{ background:"none", border:"none", cursor:"pointer", color:isEdit ? "#34d399" : "#64748b", padding:4 }}><Edit3 size={14}/></button>
                      <button onClick={() => setWorkers(workers.filter(x => x.id !== w.id))} style={{ background:"none", border:"none", cursor:"pointer", color:"#ef4444", padding:4 }}><Trash2 size={14}/></button>
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
