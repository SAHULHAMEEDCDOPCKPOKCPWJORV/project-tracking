"use client";
import { useState, useEffect } from "react";
import { useLabourStore } from "@/lib/store";
import { Download, Printer, Banknote, Users, TrendingUp, Calculator } from "lucide-react";

const MONTH_DAYS = 26;

export default function PayrollPage() {
  const { workers, setWorkers } = useLabourStore();
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0,7));
  const [presentDays, setPresentDays] = useState<Record<string,number>>({});

  useEffect(() => {
    if (workers.length === 0) {
      setWorkers([
        { id:"W001", name:"Rajan Kumar", trade:"Mason", dailyWage:900, contractor:"ABC Contractors" },
        { id:"W002", name:"Murugan S", trade:"Carpenter", dailyWage:950, contractor:"ABC Contractors" },
        { id:"W003", name:"Selvam P", trade:"Steel Fixer", dailyWage:1000, contractor:"XYZ Labour" },
        { id:"W004", name:"Arjun R", trade:"Plumber", dailyWage:850, contractor:"Sundar Works" },
        { id:"W005", name:"Suresh V", trade:"Electrician", dailyWage:1100, contractor:"Rajan & Co" },
        { id:"W006", name:"Karthik M", trade:"Helper", dailyWage:650, contractor:"National Labour" },
      ]);
    }
    // Set default present days
    const defaults: Record<string,number> = {};
    workers.forEach(w => { defaults[w.id] = Math.floor(Math.random()*5)+22; });
    setPresentDays(defaults);
  }, [workers.length]);

  const rows = workers.map(w => {
    const days = presentDays[w.id] ?? MONTH_DAYS;
    const gross = w.dailyWage * days;
    const pf = Math.round(gross * 0.12);
    const esic = Math.round(gross * 0.0075);
    const net = gross - pf - esic;
    return { ...w, days, gross, pf, esic, net };
  });

  const totGross = rows.reduce((s,r) => s+r.gross, 0);
  const totPF = rows.reduce((s,r) => s+r.pf, 0);
  const totNet = rows.reduce((s,r) => s+r.net, 0);

  return (
    <div style={{ padding:20 }}>
      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:20 }}>
        {[
          { label:"Total Workers", value:workers.length, icon:Users, color:"#60a5fa" },
          { label:"Gross Payroll", value:`₹${Math.round(totGross).toLocaleString("en-IN")}`, icon:Banknote, color:"#34d399" },
          { label:"PF Deductions", value:`₹${Math.round(totPF).toLocaleString("en-IN")}`, icon:Calculator, color:"#f59e0b" },
          { label:"Net Payroll", value:`₹${Math.round(totNet).toLocaleString("en-IN")}`, icon:TrendingUp, color:"#a78bfa" },
        ].map(k => (
          <div key={k.label} className="kpi-card card-glow" style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:`${k.color}18`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <k.icon size={22} color={k.color}/>
            </div>
            <div>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value" style={{ fontSize:20, color:k.color }}>{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="card" style={{ padding:"12px 16px", marginBottom:16, display:"flex", gap:12, alignItems:"center" }}>
        <label className="label" style={{ marginBottom:0 }}>Month:</label>
        <input type="month" className="input-field" value={month} onChange={e => setMonth(e.target.value)} style={{ width:180, height:36, fontSize:12 }}/>
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <button className="btn-secondary" style={{ fontSize:12 }}><Printer size={13}/> Print</button>
          <button className="btn-primary" style={{ fontSize:12 }}><Download size={13}/> Export Excel</button>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="card" style={{ overflow:"auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Emp ID</th><th>Name</th><th>Trade</th><th>Daily Wage</th>
              <th>Days Present</th><th>Gross Salary</th><th>PF (12%)</th><th>ESIC (0.75%)</th><th>Net Salary</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td style={{ fontFamily:"monospace", color:"#60a5fa", fontSize:12 }}>{r.id}</td>
                <td style={{ fontWeight:600 }}>{r.name}</td>
                <td><span className="badge badge-progress">{r.trade}</span></td>
                <td>₹{r.dailyWage}</td>
                <td>
                  <input type="number" className="input-field" style={{ width:70, padding:"3px 8px", fontSize:12 }}
                    value={presentDays[r.id] ?? MONTH_DAYS}
                    onChange={e => setPresentDays(prev => ({...prev, [r.id]:+e.target.value}))}/>
                </td>
                <td style={{ color:"#f1f5f9", fontWeight:600 }}>₹{r.gross.toLocaleString("en-IN")}</td>
                <td style={{ color:"#f59e0b" }}>₹{r.pf.toLocaleString("en-IN")}</td>
                <td style={{ color:"#f59e0b" }}>₹{r.esic.toLocaleString("en-IN")}</td>
                <td style={{ color:"#34d399", fontWeight:700 }}>₹{r.net.toLocaleString("en-IN")}</td>
                <td><span className="badge badge-complete">Generated</span></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background:"rgba(59,130,246,0.05)", borderTop:"2px solid #1e2d4a" }}>
              <td colSpan={5} style={{ fontWeight:800, fontSize:13, color:"#f1f5f9" }}>TOTAL</td>
              <td style={{ fontWeight:800, color:"#60a5fa" }}>₹{totGross.toLocaleString("en-IN")}</td>
              <td style={{ fontWeight:700, color:"#f59e0b" }}>₹{totPF.toLocaleString("en-IN")}</td>
              <td style={{ fontWeight:700, color:"#f59e0b" }}>₹{rows.reduce((s,r)=>s+r.esic,0).toLocaleString("en-IN")}</td>
              <td style={{ fontWeight:800, color:"#34d399" }}>₹{totNet.toLocaleString("en-IN")}</td>
              <td/>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
