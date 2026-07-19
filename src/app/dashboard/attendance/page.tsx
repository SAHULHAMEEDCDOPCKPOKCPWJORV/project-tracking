"use client";
import { useState, useEffect } from "react";
import { useLabourStore } from "@/lib/store";
import { CheckSquare, XSquare, Search, Download, Calendar } from "lucide-react";

type AttendanceRecord = Record<string, Record<string, "P"|"A"|"HD">>;

const today = new Date().toISOString().split("T")[0];

export default function AttendancePage() {
  const { workers, setWorkers } = useLabourStore();
  const [date, setDate] = useState(today);
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const [search, setSearch] = useState("");

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
  }, []);

  const toggle = (wid: string, val: "P"|"A"|"HD") => {
    setAttendance(prev => ({
      ...prev,
      [date]: { ...(prev[date]||{}), [wid]: val }
    }));
  };

  const markAll = (val: "P"|"A") => {
    const rec: Record<string,string> = {};
    workers.forEach(w => rec[w.id] = val);
    setAttendance(prev => ({ ...prev, [date]: rec as Record<string,"P"|"A"|"HD"> }));
  };

  const dayRec = attendance[date] || {};
  const present = Object.values(dayRec).filter(v=>v==="P").length;
  const halfDay = Object.values(dayRec).filter(v=>v==="HD").length;
  const absent = Object.values(dayRec).filter(v=>v==="A").length;
  const totalWage = workers.reduce((s, w) => {
    const st = dayRec[w.id];
    if (st === "P") return s + w.dailyWage;
    if (st === "HD") return s + w.dailyWage / 2;
    return s;
  }, 0);

  const filtered = workers.filter(w => !search || w.name.toLowerCase().includes(search.toLowerCase()));

  const StatusBtn = ({ wid, val, current, color }: any) => (
    <button onClick={() => toggle(wid, val)} style={{
      padding:"4px 10px", borderRadius:6, fontSize:11, fontWeight:700, cursor:"pointer", border:"1px solid",
      background: current === val ? `${color}25` : "transparent",
      borderColor: current === val ? color : "#1e2d4a",
      color: current === val ? color : "#64748b",
      transition:"all 0.15s"
    }}>{val}</button>
  );

  return (
    <div style={{ padding:20 }}>
      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:20 }}>
        {[
          { label:"Present", value:present, color:"#34d399" },
          { label:"Half Day", value:halfDay, color:"#f59e0b" },
          { label:"Absent", value:absent, color:"#ef4444" },
          { label:"Daily Labour Cost", value:`₹${Math.round(totalWage).toLocaleString("en-IN")}`, color:"#60a5fa" },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ fontSize:24, color:k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="card" style={{ padding:"12px 16px", marginBottom:16, display:"flex", gap:12, alignItems:"center" }}>
        <Calendar size={16} color="#60a5fa"/>
        <input type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} style={{ width:180, height:36, fontSize:12 }}/>
        <div style={{ position:"relative" }}>
          <Search size={14} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#64748b" }}/>
          <input className="input-field" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft:32, width:200, height:36, fontSize:12 }}/>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <button className="btn-secondary" style={{ fontSize:12, padding:"7px 12px" }} onClick={() => markAll("P")}><CheckSquare size={13}/> Mark All P</button>
          <button className="btn-danger" style={{ fontSize:12, padding:"7px 12px" }} onClick={() => markAll("A")}><XSquare size={13}/> Mark All A</button>
          <button className="btn-secondary" style={{ fontSize:12, padding:"7px 12px" }}><Download size={13}/> Export</button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow:"hidden" }}>
        <table className="data-table">
          <thead>
            <tr><th>ID</th><th>Name</th><th>Trade</th><th>Contractor</th><th>Daily Wage</th><th>Status</th><th>Wage Today</th></tr>
          </thead>
          <tbody>
            {filtered.map(w => {
              const st = dayRec[w.id];
              const wageToday = st === "P" ? w.dailyWage : st === "HD" ? w.dailyWage/2 : 0;
              return (
                <tr key={w.id}>
                  <td style={{ fontFamily:"monospace", color:"#60a5fa", fontSize:12 }}>{w.id}</td>
                  <td style={{ fontWeight:600 }}>{w.name}</td>
                  <td><span className="badge badge-progress">{w.trade}</span></td>
                  <td style={{ color:"#94a3b8", fontSize:12 }}>{w.contractor}</td>
                  <td style={{ color:"#f1f5f9" }}>₹{w.dailyWage}</td>
                  <td>
                    <div style={{ display:"flex", gap:6 }}>
                      <StatusBtn wid={w.id} val="P" current={st} color="#34d399"/>
                      <StatusBtn wid={w.id} val="HD" current={st} color="#f59e0b"/>
                      <StatusBtn wid={w.id} val="A" current={st} color="#ef4444"/>
                    </div>
                  </td>
                  <td style={{ fontWeight:700, color: wageToday > 0 ? "#34d399" : "#ef4444" }}>
                    ₹{Math.round(wageToday).toLocaleString("en-IN")}
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
