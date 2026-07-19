"use client";
import React from "react";
import { formatCurrency } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";

export default function CashflowPage() {
  const cashflowData = [
    { month: "Jan", inflow: 1200000, outflow: 800000, net: 400000 },
    { month: "Feb", inflow: 1500000, outflow: 1000000, net: 500000 },
    { month: "Mar", inflow: 1100000, outflow: 1300000, net: -200000 },
    { month: "Apr", inflow: 2000000, outflow: 1500000, net: 500000 },
    { month: "May", inflow: 1800000, outflow: 1200000, net: 600000 },
    { month: "Jun", inflow: 2500000, outflow: 1800000, net: 700000 },
    { month: "Jul", inflow: 2200000, outflow: 1900000, net: 300000 },
  ];

  const totalInflow = cashflowData.reduce((acc, d) => acc + d.inflow, 0);
  const totalOutflow = cashflowData.reduce((acc, d) => acc + d.outflow, 0);
  const netCashflow = totalInflow - totalOutflow;

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f1f5f9" }}>Cashflow Analytics</h1>
        <button className="btn-secondary">Export Report</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <div className="kpi-card" style={{ background: "rgba(16,185,129,0.1)", borderColor: "rgba(16,185,129,0.25)" }}>
          <TrendingUp size={20} color="#10b981" />
          <div className="kpi-value" style={{ marginTop: 12, color: "#34d399" }}>{formatCurrency(totalInflow)}</div>
          <div className="kpi-label">Total Inflow (YTD)</div>
        </div>
        <div className="kpi-card" style={{ background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.25)" }}>
          <TrendingDown size={20} color="#ef4444" />
          <div className="kpi-value" style={{ marginTop: 12, color: "#f87171" }}>{formatCurrency(totalOutflow)}</div>
          <div className="kpi-label">Total Outflow (YTD)</div>
        </div>
        <div className="kpi-card" style={{ background: "rgba(59,130,246,0.1)", borderColor: "rgba(59,130,246,0.25)" }}>
          <Activity size={20} color="#3b82f6" />
          <div className="kpi-value" style={{ marginTop: 12, color: "#60a5fa" }}>{formatCurrency(netCashflow)}</div>
          <div className="kpi-label">Net Cashflow</div>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div className="section-title">Cashflow Trend (Inflow vs Outflow)</div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={cashflowData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
            <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} stroke="#1e2d4a" />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} stroke="#1e2d4a" tickFormatter={(val) => `₹${val/100000}L`} />
            <Tooltip
              contentStyle={{ background: "#111827", border: "1px solid #2a3f6b", borderRadius: 8, fontSize: 12 }}
              formatter={(value: any) => formatCurrency(Number(value))}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="inflow" name="Inflow" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#inflowGrad)" />
            <Area type="monotone" dataKey="outflow" name="Outflow" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#outflowGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div className="section-title">Net Cashflow per Month</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={cashflowData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} stroke="#1e2d4a" />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} stroke="#1e2d4a" tickFormatter={(val) => `₹${val/100000}L`} />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              contentStyle={{ background: "#111827", border: "1px solid #2a3f6b", borderRadius: 8, fontSize: 12 }}
              formatter={(value: any) => formatCurrency(Number(value))}
            />
            <Bar dataKey="net" name="Net Cashflow" radius={[4, 4, 0, 0]}>
              {cashflowData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.net >= 0 ? "#3b82f6" : "#f59e0b"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
