"use client";
import { useState } from "react";
import { Calendar, Download, Printer, Users, Truck, Package, Activity, Save } from "lucide-react";

const today = new Date().toISOString().split("T")[0];

const ACTIVITIES = [
  "Column Reinforcement – FF","Beam Shuttering – FF","Slab Formwork","Brickwork – GF","Plastering – GF","Tile Laying – GF","Electrical Conduit","Plumbing Roughing-in"
];

export default function DailyProgressPage() {
  const [date, setDate] = useState(today);
  const [weather, setWeather] = useState("Clear");
  const [labourCount, setLabourCount] = useState(42);
  const [equipCount, setEquipCount] = useState(4);
  const [progressData, setProgressData] = useState<Record<string,{planned:number,actual:number,remarks:string}>>(() => {
    const d: any = {};
    ACTIVITIES.forEach(a => d[a] = { planned: Math.floor(Math.random()*30)+20, actual: Math.floor(Math.random()*25)+15, remarks:"" });
    return d;
  });
  const [materialIssues, setMaterialIssues] = useState([
    { material:"Cement (Bags)", qty:120, unit:"Bag" },
    { material:"TMT Steel 12mm", qty:2, unit:"MT" },
    { material:"Sand", qty:8, unit:"Cum" },
  ]);
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(()=>setSaved(false),2500); };

  const overallPlanned = Object.values(progressData).reduce((s,v)=>s+v.planned,0)/ACTIVITIES.length;
  const overallActual = Object.values(progressData).reduce((s,v)=>s+v.actual,0)/ACTIVITIES.length;

  return (
    <div style={{ padding:20 }}>
      {/* Header */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:20 }}>
        {[
          { label:"Date", value:date, color:"#60a5fa" },
          { label:"Labour Strength", value:labourCount, color:"#34d399" },
          { label:"Equipment Active", value:equipCount, color:"#a78bfa" },
          { label:"Overall Progress", value:`${overallActual.toFixed(1)}%`, color:"#f59e0b" },
        ].map(k=>(
          <div key={k.label} className="kpi-card">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ fontSize:k.label==="Date"?16:22, color:k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* DPR Form Header */}
      <div className="card" style={{ padding:16, marginBottom:16 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:16 }}>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input-field" value={date} onChange={e=>setDate(e.target.value)} style={{ height:36, fontSize:12 }}/>
          </div>
          <div>
            <label className="label">Weather</label>
            <select className="input-field" value={weather} onChange={e=>setWeather(e.target.value)} style={{ height:36, fontSize:12 }}>
              {["Clear","Cloudy","Light Rain","Heavy Rain","Windy"].map(w=><option key={w}>{w}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Labour Strength</label>
            <input type="number" className="input-field" value={labourCount} onChange={e=>setLabourCount(+e.target.value)} style={{ height:36, fontSize:12 }}/>
          </div>
          <div>
            <label className="label">Equipment Count</label>
            <input type="number" className="input-field" value={equipCount} onChange={e=>setEquipCount(+e.target.value)} style={{ height:36, fontSize:12 }}/>
          </div>
        </div>
      </div>

      {/* Activity Progress */}
      <div className="card" style={{ overflow:"hidden", marginBottom:16 }}>
        <div style={{ padding:"14px 16px", borderBottom:"1px solid #1e2d4a", fontWeight:700, color:"#f1f5f9", display:"flex", alignItems:"center", gap:8 }}>
          <Activity size={16} color="#60a5fa"/> Activity Progress
        </div>
        <table className="data-table">
          <thead><tr><th>Activity</th><th>Planned (%)</th><th>Actual (%)</th><th>Variance</th><th>Status</th><th>Remarks</th></tr></thead>
          <tbody>
            {ACTIVITIES.map(a=>{
              const d = progressData[a] || { planned:0, actual:0, remarks:"" };
              const variance = d.actual - d.planned;
              return (
                <tr key={a}>
                  <td style={{ fontWeight:600 }}>{a}</td>
                  <td><input type="number" className="input-field" style={{ width:80, padding:"3px 8px", fontSize:12 }} value={d.planned} onChange={e=>setProgressData(prev=>({...prev,[a]:{...d,planned:+e.target.value}}))} min={0} max={100}/></td>
                  <td><input type="number" className="input-field" style={{ width:80, padding:"3px 8px", fontSize:12 }} value={d.actual} onChange={e=>setProgressData(prev=>({...prev,[a]:{...d,actual:+e.target.value}}))} min={0} max={100}/></td>
                  <td style={{ fontWeight:700, color:variance>=0?"#34d399":"#ef4444" }}>{variance>=0?"+":""}{variance.toFixed(1)}%</td>
                  <td>
                    <div style={{ height:6, width:100, background:"#1e2d4a", borderRadius:3, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${Math.min(100,d.actual)}%`, background:variance>=0?"#34d399":"#ef4444", borderRadius:3 }}/>
                    </div>
                  </td>
                  <td><input className="input-field" style={{ width:"100%", padding:"3px 8px", fontSize:12 }} placeholder="Remarks..." value={d.remarks} onChange={e=>setProgressData(prev=>({...prev,[a]:{...d,remarks:e.target.value}}))}/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Material Issues */}
      <div className="card" style={{ overflow:"hidden", marginBottom:16 }}>
        <div style={{ padding:"14px 16px", borderBottom:"1px solid #1e2d4a", fontWeight:700, color:"#f1f5f9", display:"flex", alignItems:"center", gap:8 }}>
          <Package size={16} color="#f59e0b"/> Material Issues Today
        </div>
        <table className="data-table">
          <thead><tr><th>Material</th><th>Quantity</th><th>Unit</th></tr></thead>
          <tbody>
            {materialIssues.map((m,i)=>(
              <tr key={i}>
                <td style={{ fontWeight:600 }}>{m.material}</td>
                <td><input type="number" className="input-field" style={{ width:100, padding:"3px 8px", fontSize:12 }} value={m.qty} onChange={e=>setMaterialIssues(prev=>prev.map((x,j)=>j===i?{...x,qty:+e.target.value}:x))}/></td>
                <td style={{ color:"#94a3b8" }}>{m.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
        <button className="btn-secondary" style={{ fontSize:12 }}><Printer size={13}/> Print DPR</button>
        <button className="btn-secondary" style={{ fontSize:12 }}><Download size={13}/> Export PDF</button>
        <button className="btn-primary" style={{ fontSize:12 }} onClick={save}>
          <Save size={13}/> {saved?"Saved ✓":"Save DPR"}
        </button>
      </div>
    </div>
  );
}
