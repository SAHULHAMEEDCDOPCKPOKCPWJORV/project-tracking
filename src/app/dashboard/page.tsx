"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore, useGanttStore, useBOQStore } from "@/lib/store";
import { generateGanttTasks, generateBOQ } from "@/lib/gantt-engine";
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  Clock, DollarSign, Users, Target, Activity, Zap,
  ChevronRight, Calendar, BarChart3, ArrowUpRight
} from "lucide-react";
import { formatCurrency, daysBetween, parseDate, formatDisplayDate } from "@/lib/utils";
import {
  RadialBarChart, RadialBar, PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid
} from "recharts";
import Link from "next/link";

export default function ExecutiveDashboard() {
  const { project } = useProjectStore();
  const { tasks, setTasks } = useGanttStore();
  const { items, setItems } = useBOQStore();

  useEffect(() => {
    if (tasks.length === 0) {
      const t = generateGanttTasks(project);
      setTasks(t);
    }
    if (items.length === 0) {
      setItems(generateBOQ(project));
    }
  }, []);

  const totalCost = project.totalBuiltUpArea * project.costPerSqft;
  const advance = totalCost * project.advancePercentage / 100;
  const gst = totalCost * project.gstPercentage / 100;
  const grandTotal = totalCost + gst;
  const duration = daysBetween(parseDate(project.startDate), parseDate(project.endDate));
  const elapsed = daysBetween(parseDate(project.startDate), new Date());
  const scheduleProgress = Math.min(100, Math.round(elapsed / duration * 100));

  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const criticalTasks = tasks.filter(t => t.isCritical).length;
  const delayedTasks = tasks.filter(t => t.status === "delayed").length;
  const inProgressTasks = tasks.filter(t => t.status === "in-progress").length;

  const milestones = tasks.filter(t => t.isMilestone).slice(0, 4);
  const nextTasks = tasks.filter(t => t.status !== "completed").slice(0, 5);

  const kpis = [
    {
      label: "Project Value", value: formatCurrency(grandTotal),
      sub: `₹${(grandTotal/10000000).toFixed(2)} Cr Total Contract`,
      icon: DollarSign, color: "#3b82f6", trend: "+2.4%", trendUp: false,
      bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.25)"
    },
    {
      label: "Schedule", value: `${scheduleProgress}%`,
      sub: "Project Completion", icon: Target, color: "#10b981", trend: "On Track",
      trendUp: true, bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)"
    },
    {
      label: "Cost Variance", value: "+2.4%",
      sub: "Over Budget", icon: TrendingUp, color: "#f59e0b", trend: "Monitor",
      trendUp: false, bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)"
    },
    {
      label: "Deadline Risk", value: "Low",
      sub: "On Track", icon: CheckCircle2, color: "#10b981", trend: "Good",
      trendUp: true, bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)"
    },
    {
      label: "Critical Tasks", value: criticalTasks.toString(),
      sub: "On Critical Path", icon: AlertTriangle, color: "#ef4444", trend: "Watch",
      trendUp: false, bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)"
    },
    {
      label: "Active Workers", value: project.defaultWorkers.toString(),
      sub: "Default Workers", icon: Users, color: "#8b5cf6", trend: "Deployed",
      trendUp: true, bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.25)"
    },
  ];

  const donutData = [
    { name: "Completed", value: completedTasks || 0, color: "#10b981" },
    { name: "In Progress", value: inProgressTasks || 0, color: "#3b82f6" },
    { name: "Delayed", value: delayedTasks || 0, color: "#ef4444" },
    { name: "Not Started", value: Math.max(0, tasks.length - completedTasks - inProgressTasks - delayedTasks), color: "#334155" },
  ];

  const budgetData = [
    { name: "Used", value: 52, color: "#3b82f6" },
    { name: "Remaining", value: 48, color: "#1e2d4a" },
  ];

  const resourceData = [
    { name: "Used", value: 78, color: "#10b981" },
    { name: "Remaining", value: 22, color: "#1e2d4a" },
  ];

  // S-curve mini data
  const sCurve = Array.from({ length: 8 }, (_, i) => ({
    month: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"][i],
    planned: Math.round(Math.pow(i / 7, 0.7) * 100),
    actual: i < 4 ? Math.round(Math.pow(i / 7, 0.9) * 100) : null,
  }));

  const risks = [
    { id: "R01", desc: "Monsoon delay – Foundation Phase", severity: "High", color: "#ef4444" },
    { id: "R02", desc: "Steel price escalation (>5%)", severity: "Medium", color: "#f59e0b" },
    { id: "R03", desc: "Labour shortage during RCC", severity: "Medium", color: "#f59e0b" },
    { id: "R04", desc: "Approval delay – Local body", severity: "Low", color: "#10b981" },
    { id: "R05", desc: "Subcontractor default risk", severity: "Low", color: "#10b981" },
  ];

  const healthScore = 72;

  return (
    <div style={{ padding:24, display:"flex", flexDirection:"column", gap:20 }}>

      {/* ── KPI Cards ─────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:14 }}>
        {kpis.map((k) => (
          <div key={k.label} className="kpi-card" style={{
            background: k.bg, borderColor: k.border,
            borderWidth:1, borderStyle:"solid"
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <k.icon size={20} color={k.color}/>
              <span style={{ fontSize:10, fontWeight:700, color: k.trendUp ? "#34d399" : "#fbbf24",
                background: k.trendUp ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                padding:"2px 7px", borderRadius:10 }}>{k.trend}</span>
            </div>
            <div style={{ marginTop:12, fontSize:26, fontWeight:800, color:"#f1f5f9", lineHeight:1 }}>
              {k.value}
            </div>
            <div style={{ fontSize:11, fontWeight:600, textTransform:"uppercase",
              letterSpacing:"0.06em", color:"#64748b", marginTop:4 }}>{k.label}</div>
            <div style={{ fontSize:11, color:"#475569", marginTop:2 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Row 2: Health Score + S-Curve + Risks ─────── */}
      <div style={{ display:"grid", gridTemplateColumns:"200px 1fr 320px", gap:16 }}>

        {/* Health Score */}
        <div className="card" style={{ padding:20, display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center", gap:8 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#64748b", letterSpacing:"0.08em",
            textTransform:"uppercase" }}>Health Score</div>
          <div style={{ position:"relative", width:100, height:100 }}>
            <svg viewBox="0 0 36 36" style={{ transform:"rotate(-90deg)", width:"100%", height:"100%" }}>
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e2d4a" strokeWidth="3"/>
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3"
                strokeDasharray={`${healthScore} ${100 - healthScore}`} strokeLinecap="round"/>
            </svg>
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:20, fontWeight:800, color:"#10b981" }}>{healthScore}</span>
              <span style={{ fontSize:9, color:"#475569" }}>/ 100</span>
            </div>
          </div>
          <div style={{ fontSize:13, fontWeight:600, color:"#34d399" }}>Good</div>
          <div style={{ fontSize:11, color:"#475569", textAlign:"center" }}>
            Project is progressing within acceptable parameters.
          </div>
        </div>

        {/* S-Curve Mini */}
        <div className="card" style={{ padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div style={{ fontSize:13, fontWeight:700 }}>S-Curve – Planned vs Actual Cost</div>
            <Link href="/dashboard/analytics" style={{ fontSize:12, color:"#60a5fa", textDecoration:"none",
              display:"flex", alignItems:"center", gap:4 }}>
              Full Analytics <ChevronRight size={14}/>
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={sCurve} margin={{ top:0, right:0, bottom:0, left:-20 }}>
              <defs>
                <linearGradient id="plannedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a"/>
              <XAxis dataKey="month" tick={{ fontSize:10, fill:"#64748b" }}/>
              <YAxis tick={{ fontSize:10, fill:"#64748b" }}/>
              <Tooltip contentStyle={{ background:"#111827", border:"1px solid #2a3f6b", borderRadius:8, fontSize:11 }}/>
              <Area type="monotone" dataKey="planned" stroke="#3b82f6" fill="url(#plannedGrad)" strokeWidth={2} dot={false} name="Planned %"/>
              <Area type="monotone" dataKey="actual" stroke="#10b981" fill="url(#actualGrad)" strokeWidth={2} dot={false} name="Actual %"/>
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", gap:16, marginTop:8 }}>
            {[{c:"#3b82f6",l:"Planned"},{c:"#10b981",l:"Actual"}].map(x => (
              <span key={x.l} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:"#94a3b8" }}>
                <span style={{ width:12, height:3, background:x.c, borderRadius:2, display:"inline-block" }}/>
                {x.l}
              </span>
            ))}
          </div>
        </div>

        {/* Top Risks */}
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:12, display:"flex",
            alignItems:"center", gap:8 }}>
            <AlertTriangle size={16} color="#f59e0b"/> Top 5 Risks
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {risks.map(r => (
              <div key={r.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px",
                background:"rgba(255,255,255,0.02)", borderRadius:6,
                border:`1px solid ${r.color}22` }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:r.color, flexShrink:0 }}/>
                <div style={{ flex:1, fontSize:11, color:"#94a3b8", lineHeight:1.3 }}>{r.desc}</div>
                <span style={{ fontSize:10, fontWeight:700, color:r.color,
                  background:`${r.color}18`, padding:"1px 6px", borderRadius:8 }}>{r.severity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: Milestones + Next Tasks + Donut Charts ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:16 }}>

        {/* Milestones */}
        <div className="card" style={{ padding:20, gridColumn:"span 1" }}>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:14, display:"flex",
            alignItems:"center", gap:8, color:"#f1f5f9" }}>
            <Calendar size={15} color="#f59e0b"/> Upcoming Milestones
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {milestones.map(m => (
              <div key={m.id} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                <div style={{ marginTop:3, width:10, height:10, borderRadius:2, flexShrink:0,
                  background:"rgba(245,158,11,0.2)", border:"2px solid #f59e0b",
                  transform:"rotate(45deg)" }}/>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:"#f1f5f9" }}>{m.name}</div>
                  <div style={{ fontSize:11, color:"#475569" }}>{formatDisplayDate(m.start)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next 5 activities */}
        <div className="card" style={{ padding:20, gridColumn:"span 2" }}>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:14, display:"flex",
            alignItems:"center", gap:8, justifyContent:"space-between" }}>
            <span style={{ display:"flex", alignItems:"center", gap:8 }}>
              <Activity size={15} color="#60a5fa"/> Next 5 Activities
            </span>
            <Link href="/dashboard/schedule" style={{ fontSize:12, color:"#60a5fa", textDecoration:"none",
              display:"flex", alignItems:"center", gap:4 }}>
              Open full Gantt <ArrowUpRight size={13}/>
            </Link>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {nextTasks.map(t => {
              const statusColor = t.isCritical ? "#ef4444" : t.status === "in-progress" ? "#3b82f6" : "#64748b";
              return (
                <div key={t.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 10px",
                  background:"rgba(255,255,255,0.02)", borderRadius:6 }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:statusColor, flexShrink:0 }}/>
                  <span style={{ fontSize:11, color:"#94a3b8", minWidth:36 }}>{t.id}</span>
                  <span style={{ fontSize:12, color:"#f1f5f9", flex:1 }}>{t.name}</span>
                  <span style={{ fontSize:10, color:"#475569", marginLeft:"auto", whiteSpace:"nowrap" }}>
                    {t.start} → {t.end}
                  </span>
                  <span style={{ fontSize:10, color:"#64748b", minWidth:24 }}>{t.duration}d</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task Status Donut */}
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontSize:12, fontWeight:700, letterSpacing:"0.07em",
            textTransform:"uppercase", color:"#64748b", marginBottom:12 }}>Task Status</div>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={donutData} cx="50%" cy="50%" innerRadius={38} outerRadius={58}
                dataKey="value" paddingAngle={3}>
                {donutData.map((d, i) => <Cell key={i} fill={d.color}/>)}
              </Pie>
              <Tooltip contentStyle={{ background:"#111827", border:"1px solid #2a3f6b", borderRadius:8, fontSize:11 }}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", flexDirection:"column", gap:4, marginTop:4 }}>
            {donutData.map(d => (
              <div key={d.name} style={{ display:"flex", alignItems:"center", gap:8, fontSize:11 }}>
                <div style={{ width:8, height:8, borderRadius:2, background:d.color }}/>
                <span style={{ color:"#94a3b8", flex:1 }}>{d.name}</span>
                <span style={{ color:"#64748b", fontWeight:600 }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 4: Budget/Resource Donuts + Alerts ────── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>

        {/* Completion */}
        <div className="card" style={{ padding:20, textAlign:"center" }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em",
            textTransform:"uppercase", color:"#64748b", marginBottom:8 }}>COMPLETION</div>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={[{v:scheduleProgress},{v:100-scheduleProgress}]} cx="50%" cy="50%"
                innerRadius={40} outerRadius={54} dataKey="v" startAngle={90} endAngle={-270}>
                <Cell fill="#3b82f6"/>
                <Cell fill="#1e2d4a"/>
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ fontSize:28, fontWeight:800, color:"#60a5fa", marginTop:-10 }}>{scheduleProgress}%</div>
          <div style={{ fontSize:11, color:"#475569" }}>SCHEDULE</div>
        </div>

        {/* Budget */}
        <div className="card" style={{ padding:20, textAlign:"center" }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em",
            textTransform:"uppercase", color:"#64748b", marginBottom:8 }}>BUDGET USED</div>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={budgetData} cx="50%" cy="50%" innerRadius={40} outerRadius={54}
                dataKey="value" startAngle={90} endAngle={-270}>
                {budgetData.map((d,i) => <Cell key={i} fill={d.color}/>)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ fontSize:28, fontWeight:800, color:"#60a5fa", marginTop:-10 }}>52%</div>
          <div style={{ fontSize:11, color:"#475569" }}>COST</div>
        </div>

        {/* Resources */}
        <div className="card" style={{ padding:20, textAlign:"center" }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em",
            textTransform:"uppercase", color:"#64748b", marginBottom:8 }}>RESOURCES DEPLOYED</div>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={resourceData} cx="50%" cy="50%" innerRadius={40} outerRadius={54}
                dataKey="value" startAngle={90} endAngle={-270}>
                {resourceData.map((d,i) => <Cell key={i} fill={d.color}/>)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ fontSize:28, fontWeight:800, color:"#10b981", marginTop:-10 }}>78%</div>
          <div style={{ fontSize:11, color:"#475569" }}>UTILIZATION</div>
        </div>
      </div>

      {/* ── Project Info Bar ──────────────────────────── */}
      <div className="card" style={{ padding:"14px 20px", display:"flex", gap:32, flexWrap:"wrap",
        alignItems:"center" }}>
        {[
          { label:"Project", value: project.projectName },
          { label:"Client", value: project.clientName },
          { label:"Contractor", value: project.contractorName },
          { label:"Location", value: `${project.city}, ${project.state}` },
          { label:"Type", value: project.projectType },
          { label:"Start", value: formatDisplayDate(project.startDate) },
          { label:"End", value: formatDisplayDate(project.endDate) },
          { label:"Duration", value: `${duration} days` },
          { label:"Built-up Area", value: `${project.totalBuiltUpArea} sqft` },
          { label:"Total Cost", value: formatCurrency(grandTotal) },
        ].map(x => (
          <div key={x.label}>
            <div style={{ fontSize:10, color:"#475569", fontWeight:600,
              letterSpacing:"0.07em", textTransform:"uppercase" }}>{x.label}</div>
            <div style={{ fontSize:13, fontWeight:700, color:"#f1f5f9" }}>{x.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
