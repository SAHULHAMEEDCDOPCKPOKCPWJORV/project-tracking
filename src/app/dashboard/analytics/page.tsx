"use client";
import React, { useEffect } from "react";
import { useProjectStore, useGanttStore, useBOQStore, useMaterialStore, useLabourStore } from "@/lib/store";
import { generateGanttTasks, generateBOQ } from "@/lib/gantt-engine";
import { formatCurrency, parseDate, daysBetween } from "@/lib/utils";
import { Zap, TrendingUp, TrendingDown, AlertTriangle, Clock } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";

export default function AnalyticsPage() {
  const { project } = useProjectStore();
  const { tasks, setTasks } = useGanttStore();
  const { items, setItems } = useBOQStore();
  const { materials } = useMaterialStore();
  const { rates } = useLabourStore();

  useEffect(() => {
    if (tasks.length === 0) setTasks(generateGanttTasks(project));
    if (items.length === 0) setItems(generateBOQ(project, materials, rates));
  }, []);

  const totalCost = project.totalBuiltUpArea * project.costPerSqft;
  const duration = daysBetween(parseDate(project.startDate), parseDate(project.endDate));
  const months = Math.ceil(duration / 30);

  // S-Curve data
  const sCurveData = Array.from({ length: months }, (_, i) => {
    const pct = i / (months - 1);
    const planned = parseFloat((Math.pow(pct, 0.6) * 100).toFixed(1));
    const actual = i < months * 0.4
      ? parseFloat((Math.pow(pct, 0.8) * 100 * 0.92).toFixed(1))
      : undefined;
    const d = new Date(parseDate(project.startDate));
    d.setMonth(d.getMonth() + i);
    return {
      month: d.toLocaleDateString("en-IN", { month:"short", year:"2-digit" }),
      planned,
      actual,
      plannedCost: parseFloat((planned / 100 * totalCost / 10000000).toFixed(3)),
      actualCost: actual !== undefined ? parseFloat((actual / 100 * totalCost / 10000000).toFixed(3)) : undefined,
    };
  });

  // Cash flow data
  const cashFlowData = Array.from({ length: Math.min(months, 16) }, (_, i) => {
    const d = new Date(parseDate(project.startDate));
    d.setMonth(d.getMonth() + i);
    const pct = i / (months - 1);
    const bell = Math.exp(-Math.pow((pct - 0.5) * 3, 2));
    return {
      month: d.toLocaleDateString("en-IN", { month:"short", year:"2-digit" }),
      inflow: parseFloat((bell * totalCost * 0.12 / 10000000).toFixed(3)),
      outflow: parseFloat((bell * totalCost * 0.10 / 10000000).toFixed(3)),
    };
  });

  // Resource utilization
  const resourceData = [
    { name:"Structural", actual:85, planned:80 },
    { name:"Masonry", actual:70, planned:75 },
    { name:"MEP", actual:60, planned:65 },
    { name:"Finishing", actual:45, planned:55 },
    { name:"Civil", actual:90, planned:85 },
    { name:"Painting", actual:30, planned:40 },
  ];

  // EVM data
  const BCWS = parseFloat((totalCost * 0.45 / 10000000).toFixed(3));
  const BCWP = parseFloat((totalCost * 0.39 / 10000000).toFixed(3));
  const ACWP = parseFloat((totalCost * 0.42 / 10000000).toFixed(3));
  const CPI = parseFloat((BCWP / ACWP).toFixed(2));
  const SPI = parseFloat((BCWP / BCWS).toFixed(2));
  const EAC = parseFloat((totalCost / CPI / 10000000).toFixed(3));

  // Task status distribution
  const statusDist = [
    { status:"Not Started", count:tasks.filter(t=>t.status==="not-started").length, color:"#475569" },
    { status:"In Progress", count:tasks.filter(t=>t.status==="in-progress").length, color:"#3b82f6" },
    { status:"Completed", count:tasks.filter(t=>t.status==="completed").length, color:"#10b981" },
    { status:"Delayed", count:tasks.filter(t=>t.status==="delayed").length, color:"#f59e0b" },
  ];

  // Delay analysis
  const delayData = tasks.filter(t => t.status === "delayed" || t.isCritical).slice(0, 8).map(t => ({
    name: t.name.substring(0, 16),
    float: t.float,
    duration: t.duration,
  }));

  // Productivity trend
  const productData = Array.from({ length: 10 }, (_, i) => ({
    week: `W${i+1}`,
    planned: 100,
    actual: Math.round(85 + Math.sin(i) * 12),
  }));

  // AI Insights
  const criticalCount = tasks.filter(t => t.isCritical).length;
  const aiInsights = [
    { type:"critical", msg:`Critical path has ${criticalCount} activities. Recommend parallelizing foundation & earthwork to save ~15 days.` },
    { type:"cost", msg:`CPI = ${CPI} — ${CPI < 1 ? "cost overrun trend" : "within budget"}. ${CPI < 1 ? "Review high-rate BOQ items and negotiate rates." : "Maintain current spending pattern."}` },
    { type:"schedule", msg:`SPI = ${SPI} — ${SPI < 1 ? "schedule slip" : "ahead of schedule"}. ${SPI < 1 ? "Recommend 6-day work week during structural phase." : "Good progress, monitor monthly."}` },
    { type:"prediction", msg:`Projected completion: ${new Date(parseDate(project.endDate).getTime() + (SPI<1?(1-SPI)*duration*86400000:0)).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}. On-time probability ${SPI>=1?"87%":"72%"}.` },
    { type:"risk", msg:`Top risk: monsoon season overlaps with foundation phase. Add 15-day buffer and arrange dewatering equipment.` },
  ];

  const topRisks = tasks.filter(t => t.isCritical).slice(0, 6);

  const CT = (props: any) => (
    <div style={{ background:"#111827", border:"1px solid #2a3f6b", borderRadius:8, padding:"10px 12px", fontSize:11 }}>
      {props.children}
    </div>
  );

  return (
    <div style={{ padding:20, display:"flex", flexDirection:"column", gap:16 }}>

      {/* ── Row 1: S-Curve + AI Insights ─────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16 }}>

        {/* S-Curve */}
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:14, display:"flex",
            alignItems:"center", gap:8 }}>
            <TrendingUp size={16} color="#60a5fa"/>
            S-Curve — Planned vs Actual Cost (₹ Cr)
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={sCurveData} margin={{ top:5, right:10, bottom:0, left:-10 }}>
              <defs>
                <linearGradient id="planG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="actG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a"/>
              <XAxis dataKey="month" tick={{ fontSize:9, fill:"#475569" }} interval={Math.floor(months/6)}/>
              <YAxis tick={{ fontSize:9, fill:"#475569" }}/>
              <Tooltip content={<CT/>} contentStyle={{ background:"#111827", border:"1px solid #2a3f6b", borderRadius:8, fontSize:11 }}/>
              <Legend wrapperStyle={{ fontSize:11 }}/>
              <Area type="monotone" dataKey="plannedCost" stroke="#3b82f6" fill="url(#planG)" strokeWidth={2} dot={false} name="Planned (₹Cr)" connectNulls/>
              <Area type="monotone" dataKey="actualCost" stroke="#10b981" fill="url(#actG)" strokeWidth={2} dot={false} name="Actual (₹Cr)" connectNulls/>
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", gap:16, marginTop:6 }}>
            {[{c:"#3b82f6",l:"Planned"},{c:"#10b981",l:"Actual"}].map(x => (
              <span key={x.l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#94a3b8" }}>
                <span style={{ width:20, height:3, background:x.c, borderRadius:2, display:"inline-block" }}/>
                {x.l}
              </span>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:14, display:"flex",
            alignItems:"center", gap:8 }}>
            <Zap size={16} color="#f59e0b"/> AI Insights
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {aiInsights.map((ai, i) => {
              const icons: Record<string, React.ReactNode> = {
                critical: <AlertTriangle size={13} color="#ef4444"/>,
                cost: <TrendingDown size={13} color="#f59e0b"/>,
                schedule: <Clock size={13} color="#3b82f6"/>,
                prediction: <TrendingUp size={13} color="#10b981"/>,
                risk: <AlertTriangle size={13} color="#f97316"/>,
              };
              const colors: Record<string, string> = {
                critical:"#ef4444", cost:"#f59e0b", schedule:"#3b82f6", prediction:"#10b981", risk:"#f97316"
              };
              return (
                <div key={i} style={{ padding:"10px 12px",
                  background:`${colors[ai.type]}0d`, borderRadius:8,
                  border:`1px solid ${colors[ai.type]}22`,
                  display:"flex", gap:8, alignItems:"flex-start" }}>
                  <span style={{ marginTop:1 }}>{icons[ai.type]}</span>
                  <p style={{ fontSize:12, color:"#94a3b8", lineHeight:1.5, margin:0 }}>{ai.msg}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Row 2: Cash Flow + Resource Utilization + Task Status ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 280px", gap:16 }}>

        {/* Cash Flow */}
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:12, color:"#f1f5f9" }}>
            Cash Flow Forecast (₹ Cr)
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={cashFlowData} margin={{ top:0, right:0, bottom:0, left:-15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a"/>
              <XAxis dataKey="month" tick={{ fontSize:9, fill:"#475569" }} interval={2}/>
              <YAxis tick={{ fontSize:9, fill:"#475569" }}/>
              <Tooltip contentStyle={{ background:"#111827", border:"1px solid #2a3f6b", borderRadius:8, fontSize:11 }}/>
              <Legend wrapperStyle={{ fontSize:10 }}/>
              <Bar dataKey="inflow" fill="#10b981" name="Inflow" radius={[2,2,0,0]}/>
              <Bar dataKey="outflow" fill="#ef4444" name="Outflow" radius={[2,2,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Resource Utilization */}
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:12, color:"#f1f5f9" }}>
            Resource Utilization
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={resourceData} layout="vertical" margin={{ top:0, right:10, bottom:0, left:10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" horizontal={false}/>
              <XAxis type="number" domain={[0,100]} tick={{ fontSize:9, fill:"#475569" }}/>
              <YAxis dataKey="name" type="category" tick={{ fontSize:10, fill:"#94a3b8" }} width={60}/>
              <Tooltip contentStyle={{ background:"#111827", border:"1px solid #2a3f6b", borderRadius:8, fontSize:11 }}/>
              <Legend wrapperStyle={{ fontSize:10 }}/>
              <Bar dataKey="actual" fill="#3b82f6" name="Actual %" radius={[0,3,3,0]}/>
              <Bar dataKey="planned" fill="#1e2d4a" name="Planned %" radius={[0,3,3,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Task Status Distribution */}
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:14, color:"#f1f5f9" }}>
            Task Status Distribution
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {statusDist.map(s => (
              <div key={s.status}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:11, color:"#94a3b8" }}>{s.status}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:s.color }}>{s.count}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width:`${tasks.length > 0 ? (s.count/tasks.length*100) : 0}%`,
                    background:s.color
                  }}/>
                </div>
              </div>
            ))}
          </div>

          <hr style={{ border:"none", borderTop:"1px solid #1e2d4a", margin:"14px 0" }}/>

          <div style={{ fontSize:12, fontWeight:700, color:"#94a3b8", marginBottom:10 }}>
            Top Risks
          </div>
          {topRisks.map(t => (
            <div key={t.id} style={{ display:"flex", gap:8, marginBottom:6, alignItems:"center" }}>
              <div style={{ width:5, height:5, borderRadius:"50%", background:"#ef4444", flexShrink:0 }}/>
              <span style={{ fontSize:11, color:"#94a3b8", flex:1 }}>{t.name.substring(0,22)}</span>
              <span style={{ fontSize:10, color:"#f87171" }}>{t.float}d float</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Row 3: EVM + Delay Analysis + Productivity ─── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>

        {/* EVM */}
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:14, color:"#f1f5f9" }}>
            Earned Value Analysis (EVM)
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
            {[
              { label:"BCWS (PV)", value:`₹${BCWS.toFixed(2)} Cr`, color:"#3b82f6" },
              { label:"BCWP (EV)", value:`₹${BCWP.toFixed(2)} Cr`, color:"#10b981" },
              { label:"ACWP (AC)", value:`₹${ACWP.toFixed(2)} Cr`, color:"#ef4444" },
              { label:"EAC", value:`₹${EAC.toFixed(2)} Cr`, color:"#f59e0b" },
              { label:"CPI", value:CPI.toFixed(2), color:CPI>=1?"#10b981":"#ef4444" },
              { label:"SPI", value:SPI.toFixed(2), color:SPI>=1?"#10b981":"#ef4444" },
            ].map(x => (
              <div key={x.label} style={{ padding:"8px 10px", background:"rgba(255,255,255,0.03)",
                borderRadius:6, border:"1px solid #1e2d4a" }}>
                <div style={{ fontSize:9, color:"#475569", fontWeight:600,
                  textTransform:"uppercase", letterSpacing:"0.06em" }}>{x.label}</div>
                <div style={{ fontSize:16, fontWeight:800, color:x.color, marginTop:2 }}>{x.value}</div>
              </div>
            ))}
          </div>
          <div style={{ padding:"10px 12px", borderRadius:8,
            background: CPI >= 1 ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
            border:`1px solid ${CPI>=1?"rgba(16,185,129,0.2)":"rgba(239,68,68,0.2)"}` }}>
            <div style={{ fontSize:11, color: CPI >= 1 ? "#34d399" : "#f87171" }}>
              {CPI >= 1
                ? "✓ Project is within budget (CPI ≥ 1.0)"
                : `⚠ Cost overrun detected. Budget variance: ${formatCurrency(Math.abs(ACWP - BCWP) * 10000000)}`}
            </div>
          </div>
        </div>

        {/* Delay Analysis */}
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:12, color:"#f1f5f9" }}>
            Delay Analysis – Float Days
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={delayData.length > 0 ? delayData : [{ name:"No delays", float:0, duration:0 }]}
              margin={{ top:0, right:0, bottom:20, left:-15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a"/>
              <XAxis dataKey="name" tick={{ fontSize:8, fill:"#475569" }} angle={-30} textAnchor="end"/>
              <YAxis tick={{ fontSize:9, fill:"#475569" }}/>
              <Tooltip contentStyle={{ background:"#111827", border:"1px solid #2a3f6b", borderRadius:8, fontSize:11 }}/>
              <Bar dataKey="float" name="Float (days)" radius={[3,3,0,0]}>
                {delayData.map((d, i) => <Cell key={i} fill={d.float===0?"#ef4444":"#f59e0b"}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Productivity Trend */}
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:12, color:"#f1f5f9" }}>
            Productivity Trend
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={productData} margin={{ top:0, right:10, bottom:0, left:-20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a"/>
              <XAxis dataKey="week" tick={{ fontSize:9, fill:"#475569" }}/>
              <YAxis domain={[60,110]} tick={{ fontSize:9, fill:"#475569" }}/>
              <Tooltip contentStyle={{ background:"#111827", border:"1px solid #2a3f6b", borderRadius:8, fontSize:11 }}/>
              <Legend wrapperStyle={{ fontSize:10 }}/>
              <Line type="monotone" dataKey="planned" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Planned %"/>
              <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} dot={{ r:3, fill:"#10b981" }} name="Actual %"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
