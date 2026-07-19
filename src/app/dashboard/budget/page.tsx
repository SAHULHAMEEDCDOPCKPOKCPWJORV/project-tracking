"use client";
import React from "react";
import { formatCurrency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { Target, AlertTriangle, CheckCircle } from "lucide-react";

export default function BudgetPage() {
  const budgetData = [
    { category: "Materials", allocated: 15000000, spent: 12000000, remaining: 3000000 },
    { category: "Labor", allocated: 8000000, spent: 6500000, remaining: 1500000 },
    { category: "Equipment", allocated: 5000000, spent: 4800000, remaining: 200000 },
    { category: "Subcontractors", allocated: 12000000, spent: 11500000, remaining: 500000 },
    { category: "Overhead", allocated: 2000000, spent: 2200000, remaining: -200000 },
  ];

  const totalAllocated = budgetData.reduce((acc, d) => acc + d.allocated, 0);
  const totalSpent = budgetData.reduce((acc, d) => acc + d.spent, 0);
  const overBudget = budgetData.filter(d => d.remaining < 0).length;

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f1f5f9" }}>Budget Monitoring</h1>
        <button className="btn-primary">Update Budget</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <div className="kpi-card" style={{ background: "rgba(59,130,246,0.1)", borderColor: "rgba(59,130,246,0.25)" }}>
          <Target size={20} color="#3b82f6" />
          <div className="kpi-value" style={{ marginTop: 12 }}>{formatCurrency(totalAllocated)}</div>
          <div className="kpi-label">Total Budget Allocated</div>
        </div>
        <div className="kpi-card" style={{ background: "rgba(16,185,129,0.1)", borderColor: "rgba(16,185,129,0.25)" }}>
          <CheckCircle size={20} color="#10b981" />
          <div className="kpi-value" style={{ marginTop: 12 }}>{formatCurrency(totalSpent)}</div>
          <div className="kpi-label">Total Spent to Date</div>
        </div>
        <div className="kpi-card" style={{ background: overBudget > 0 ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)", borderColor: overBudget > 0 ? "rgba(239,68,68,0.25)" : "rgba(245,158,11,0.25)" }}>
          <AlertTriangle size={20} color={overBudget > 0 ? "#ef4444" : "#f59e0b"} />
          <div className="kpi-value" style={{ marginTop: 12, color: overBudget > 0 ? "#f87171" : "#fbbf24" }}>
            {((totalSpent / totalAllocated) * 100).toFixed(1)}%
          </div>
          <div className="kpi-label">Budget Utilization</div>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div className="section-title">Budget vs Actual by Category</div>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={budgetData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" vertical={false} />
            <XAxis dataKey="category" tick={{ fill: "#94a3b8", fontSize: 12 }} stroke="#1e2d4a" />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} stroke="#1e2d4a" tickFormatter={(val) => `₹${val/100000}L`} />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              contentStyle={{ background: "#111827", border: "1px solid #2a3f6b", borderRadius: 8, fontSize: 12 }}
              formatter={(value: any) => formatCurrency(Number(value))}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="allocated" name="Allocated Budget" fill="#1e2d4a" radius={[4, 4, 0, 0]} />
            <Bar dataKey="spent" name="Spent" radius={[4, 4, 0, 0]}>
              {budgetData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.spent > entry.allocated ? "#ef4444" : "#3b82f6"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div className="section-title">Category Breakdown Details</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Allocated Budget</th>
              <th>Total Spent</th>
              <th>Remaining Budget</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {budgetData.map((d, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600, color: "#f1f5f9" }}>{d.category}</td>
                <td>{formatCurrency(d.allocated)}</td>
                <td style={{ fontWeight: 700 }}>{formatCurrency(d.spent)}</td>
                <td style={{ color: d.remaining < 0 ? "#ef4444" : "#34d399", fontWeight: 700 }}>
                  {formatCurrency(d.remaining)}
                </td>
                <td>
                  <span className={`badge ${d.remaining < 0 ? "badge-critical" : d.remaining < d.allocated * 0.1 ? "badge-delayed" : "badge-complete"}`}>
                    {d.remaining < 0 ? "Over Budget" : d.remaining < d.allocated * 0.1 ? "At Risk" : "On Track"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
