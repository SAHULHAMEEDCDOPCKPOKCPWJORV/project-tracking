"use client";
import { useBOQStore } from "@/lib/store";
import { useEffect } from "react";
import { TrendingUp, TrendingDown, Target, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { generateBOQ } from "@/lib/gantt-engine";
import { useProjectStore } from "@/lib/store";
import { computeEarnedValue, computeCPI, computeSPI, forecastCompletion } from "@/lib/erp-engine";

export default function CostControlPage() {
  const { project } = useProjectStore();
  const { items, setItems } = useBOQStore();

  useEffect(() => {
    if (items.length === 0) setItems(generateBOQ(project));
  }, []);

  const budgetCost = items.reduce((s, i) => s + i.quantity * (1 + i.wastage / 100) * i.rate, 0);
  const progress = 38; // Simulated 38% progress
  const ev = computeEarnedValue(items, progress);
  const plannedValue = budgetCost * 0.45; // Planned at 45%
  const actualCost = budgetCost * 0.41;   // Actual spent 41%
  const cpi = computeCPI(ev, actualCost);
  const spi = computeSPI(ev, plannedValue);
  const forecast = forecastCompletion(cpi, budgetCost);
  const variance = budgetCost - forecast;

  const categories = Array.from(new Set(items.map(i => i.category)));
  const chartData = categories.slice(0, 8).map(cat => {
    const catItems = items.filter(i => i.category === cat);
    const budget = catItems.reduce((s, i) => s + i.quantity * i.rate, 0);
    return { name: cat, Budget: Math.round(budget / 1000), Actual: Math.round(budget * 0.41 / 1000), EV: Math.round(budget * 0.38 / 1000) };
  });

  const sCurveData = [
    { month:"Jul", planned:15, actual:12, ev:12 },
    { month:"Aug", planned:25, actual:22, ev:22 },
    { month:"Sep", planned:35, actual:30, ev:30 },
    { month:"Oct", planned:45, actual:38, ev:38 },
    { month:"Nov", planned:55, actual:null, ev:null },
    { month:"Dec", planned:65, actual:null, ev:null },
    { month:"Jan", planned:75, actual:null, ev:null },
    { month:"Feb", planned:85, actual:null, ev:null },
    { month:"Mar", planned:95, actual:null, ev:null },
    { month:"Apr", planned:100, actual:null, ev:null },
  ];

  return (
    <div style={{ padding:20 }}>
      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:20 }}>
        {[
          { label:"Budget at Completion", value:formatCurrency(budgetCost), icon:Target, color:"#60a5fa" },
          { label:"Earned Value", value:formatCurrency(ev), icon:TrendingUp, color:"#34d399" },
          { label:"CPI", value:cpi.toFixed(2), icon:cpi>=1?TrendingUp:TrendingDown, color:cpi>=1?"#34d399":"#ef4444" },
          { label:"SPI", value:spi.toFixed(2), icon:spi>=1?TrendingUp:TrendingDown, color:spi>=1?"#34d399":"#ef4444" },
        ].map(k=>(
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

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:20 }}>
        {[
          { label:"Actual Cost", value:formatCurrency(actualCost), color:"#f59e0b" },
          { label:"Forecast at Completion", value:formatCurrency(forecast), color:"#a78bfa" },
          { label:"Cost Variance", value:`${variance>=0?"+":""}${formatCurrency(variance)}`, color:variance>=0?"#34d399":"#ef4444" },
          { label:"Progress", value:`${progress}%`, color:"#60a5fa" },
        ].map(k=>(
          <div key={k.label} className="kpi-card">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ fontSize:20, color:k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, color:"#f1f5f9", marginBottom:16 }}>S-Curve — Planned vs Actual vs EV (%)</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={sCurveData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a"/>
              <XAxis dataKey="month" tick={{ fill:"#64748b", fontSize:11 }}/>
              <YAxis tick={{ fill:"#64748b", fontSize:11 }} unit="%"/>
              <Tooltip contentStyle={{ background:"#1a2235", border:"1px solid #2a3f6b", borderRadius:8, color:"#f1f5f9" }}/>
              <Legend wrapperStyle={{ fontSize:11, color:"#94a3b8" }}/>
              <Line dataKey="planned" stroke="#60a5fa" strokeWidth={2} dot={false} name="Planned"/>
              <Line dataKey="actual" stroke="#34d399" strokeWidth={2} strokeDasharray="5 3" name="Actual"/>
              <Line dataKey="ev" stroke="#a78bfa" strokeWidth={2} strokeDasharray="5 3" name="Earned Value"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, color:"#f1f5f9", marginBottom:16 }}>Budget vs Actual vs EV by Category (₹K)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a"/>
              <XAxis dataKey="name" tick={{ fill:"#64748b", fontSize:9 }} angle={-30} textAnchor="end" height={40}/>
              <YAxis tick={{ fill:"#64748b", fontSize:10 }}/>
              <Tooltip contentStyle={{ background:"#1a2235", border:"1px solid #2a3f6b", borderRadius:8, color:"#f1f5f9" }}/>
              <Legend wrapperStyle={{ fontSize:11, color:"#94a3b8" }}/>
              <Bar dataKey="Budget" fill="#60a5fa" radius={[4,4,0,0]}/>
              <Bar dataKey="Actual" fill="#f59e0b" radius={[4,4,0,0]}/>
              <Bar dataKey="EV" fill="#34d399" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cost breakdown table */}
      <div className="card" style={{ overflow:"hidden" }}>
        <div style={{ padding:"14px 16px", borderBottom:"1px solid #1e2d4a", fontWeight:700, color:"#f1f5f9" }}>Cost Control Register</div>
        <table className="data-table">
          <thead><tr><th>Category</th><th>Budget Cost</th><th>Actual Cost</th><th>EV</th><th>Variance</th><th>CPI</th></tr></thead>
          <tbody>
            {chartData.map(c=>{
              const budget=c.Budget*1000, actual=c.Actual*1000, ev=c.EV*1000;
              const cpiRow=(ev/actual).toFixed(2);
              const var_=budget-actual;
              return (
                <tr key={c.name}>
                  <td style={{ fontWeight:600 }}>{c.name}</td>
                  <td>₹{budget.toLocaleString("en-IN")}</td>
                  <td style={{ color:"#f59e0b" }}>₹{actual.toLocaleString("en-IN")}</td>
                  <td style={{ color:"#a78bfa" }}>₹{ev.toLocaleString("en-IN")}</td>
                  <td style={{ color:var_>=0?"#34d399":"#ef4444", fontWeight:600 }}>{var_>=0?"+":""}₹{Math.abs(var_).toLocaleString("en-IN")}</td>
                  <td><span className={`badge ${+cpiRow>=1?"badge-complete":"badge-critical"}`}>{cpiRow}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
