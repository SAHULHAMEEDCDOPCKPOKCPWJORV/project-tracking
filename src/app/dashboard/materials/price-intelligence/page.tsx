"use client";
import { useState, useEffect } from "react";
import { useMaterialStore } from "@/lib/store";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const PRICE_HISTORY = [
  { month:"Feb", cement:400, steel:68000, sand:1600, aggregate:1300 },
  { month:"Mar", cement:410, steel:70000, sand:1700, aggregate:1350 },
  { month:"Apr", cement:415, steel:71000, sand:1750, aggregate:1380 },
  { month:"May", cement:420, steel:72000, sand:1780, aggregate:1400 },
  { month:"Jun", cement:418, steel:71500, sand:1800, aggregate:1400 },
  { month:"Jul", cement:420, steel:72000, sand:1800, aggregate:1400 },
];

export default function PriceIntelligencePage() {
  const { materials } = useMaterialStore();

  const insights = [
    { material:"Cement (OPC 53)", current:420, prev:418, unit:"Bag", trend:"up" },
    { material:"TMT Steel Fe500", current:72000, prev:71500, unit:"MT", trend:"up" },
    { material:"River Sand", current:1800, prev:1800, unit:"Cum", trend:"stable" },
    { material:"Coarse Aggregate", current:1400, prev:1380, unit:"Cum", trend:"up" },
    { material:"Brick (Fly Ash)", current:8, prev:9, unit:"No", trend:"down" },
    { material:"Vitrified Tile", current:750, prev:780, unit:"Sqm", trend:"down" },
  ];

  return (
    <div style={{ padding:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:20 }}>
        {[
          { label:"Price Increases", value:insights.filter(i=>i.trend==="up").length, icon:TrendingUp, color:"#ef4444" },
          { label:"Price Drops", value:insights.filter(i=>i.trend==="down").length, icon:TrendingDown, color:"#34d399" },
          { label:"Stable Prices", value:insights.filter(i=>i.trend==="stable").length, icon:AlertTriangle, color:"#f59e0b" },
        ].map(k=>(
          <div key={k.label} className="kpi-card" style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:`${k.color}18`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <k.icon size={22} color={k.color}/>
            </div>
            <div><div className="kpi-label">{k.label}</div><div className="kpi-value" style={{ fontSize:24, color:k.color }}>{k.value}</div></div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, color:"#f1f5f9", marginBottom:16 }}>Cement Price Trend (₹/Bag)</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={PRICE_HISTORY}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a"/>
              <XAxis dataKey="month" tick={{ fill:"#64748b", fontSize:11 }}/>
              <YAxis tick={{ fill:"#64748b", fontSize:11 }} domain={[380,440]}/>
              <Tooltip contentStyle={{ background:"#1a2235", border:"1px solid #2a3f6b", borderRadius:8, color:"#f1f5f9" }}/>
              <Bar dataKey="cement" fill="#60a5fa" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, color:"#f1f5f9", marginBottom:16 }}>Steel Price Trend (₹/MT)</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={PRICE_HISTORY}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a"/>
              <XAxis dataKey="month" tick={{ fill:"#64748b", fontSize:11 }}/>
              <YAxis tick={{ fill:"#64748b", fontSize:11 }} domain={[65000,75000]}/>
              <Tooltip contentStyle={{ background:"#1a2235", border:"1px solid #2a3f6b", borderRadius:8, color:"#f1f5f9" }}/>
              <Bar dataKey="steel" fill="#a78bfa" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ overflow:"hidden" }}>
        <div style={{ padding:"14px 16px", borderBottom:"1px solid #1e2d4a", fontWeight:700, color:"#f1f5f9" }}>Market Rate Comparison</div>
        <table className="data-table">
          <thead><tr><th>Material</th><th>Unit</th><th>Current Rate</th><th>Previous Rate</th><th>Change</th><th>Trend</th></tr></thead>
          <tbody>
            {insights.map(i=>{
              const diff = i.current - i.prev;
              const pct = ((diff/i.prev)*100).toFixed(1);
              return (
                <tr key={i.material}>
                  <td style={{ fontWeight:600 }}>{i.material}</td>
                  <td style={{ color:"#94a3b8" }}>{i.unit}</td>
                  <td style={{ fontWeight:700, color:"#f1f5f9" }}>₹{i.current.toLocaleString("en-IN")}</td>
                  <td style={{ color:"#64748b" }}>₹{i.prev.toLocaleString("en-IN")}</td>
                  <td style={{ color: diff>0?"#ef4444":diff<0?"#34d399":"#f59e0b", fontWeight:600 }}>
                    {diff>0?"+":""}{diff.toLocaleString("en-IN")} ({diff>0?"+":""}{pct}%)
                  </td>
                  <td>
                    <span className={`badge ${i.trend==="up"?"badge-critical":i.trend==="down"?"badge-complete":"badge-delayed"}`}>
                      {i.trend==="up"?"↑ Rising":i.trend==="down"?"↓ Falling":"→ Stable"}
                    </span>
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
