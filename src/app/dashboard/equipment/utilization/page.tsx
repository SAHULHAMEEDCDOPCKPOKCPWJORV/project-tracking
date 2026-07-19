"use client";
import { useState, useEffect } from "react";
import { useEquipmentStore } from "@/lib/store";
import { BarChart3, TrendingUp, Clock, AlertTriangle, ArrowLeft } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from "recharts";
import Link from "next/link";

export default function EquipmentUtilizationPage() {
  const { equipmentList } = useEquipmentStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = equipmentList.map(eq => ({
    name: eq.id,
    activeHours: eq.status === "Active" ? Math.floor(Math.random() * 40) + 40 : Math.floor(Math.random() * 20),
    idleHours: eq.status === "Idle" ? Math.floor(Math.random() * 40) + 20 : Math.floor(Math.random() * 10),
    maintenanceHours: eq.status === "Maintenance" ? Math.floor(Math.random() * 20) + 10 : 0
  }));

  const totalActive = chartData.reduce((acc, curr) => acc + curr.activeHours, 0);
  const totalIdle = chartData.reduce((acc, curr) => acc + curr.idleHours, 0);

  if (!mounted) return null;

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24, width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/dashboard/equipment" style={{ color: "#94a3b8", display: "flex", alignItems: "center" }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f1f5f9" }}>Utilization Analytics</h1>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>Track equipment usage and efficiency.</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <select className="input-field" style={{ width: 160 }}>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Month</option>
          </select>
          <button className="btn-primary">
            <TrendingUp size={16} /> Generate Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <div className="kpi-card glass-dark">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Clock size={20} color="#3b82f6" />
            <span className="badge badge-progress">High</span>
          </div>
          <div className="kpi-value" style={{ marginTop: 12 }}>{totalActive} hrs</div>
          <div className="kpi-label">Total Active Hours</div>
        </div>
        
        <div className="kpi-card glass-dark">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <AlertTriangle size={20} color="#f59e0b" />
            <span className="badge badge-delayed">Warning</span>
          </div>
          <div className="kpi-value" style={{ marginTop: 12 }}>{totalIdle} hrs</div>
          <div className="kpi-label">Total Idle Hours</div>
        </div>

        <div className="kpi-card glass-dark">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <BarChart3 size={20} color="#10b981" />
            <span className="badge badge-complete">Good</span>
          </div>
          <div className="kpi-value" style={{ marginTop: 12 }}>
            {Math.round((totalActive / ((totalActive + totalIdle) || 1)) * 100)}%
          </div>
          <div className="kpi-label">Overall Utilization Rate</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="card glass" style={{ padding: 20 }}>
        <div className="section-title">Utilization Breakdown by Equipment</div>
        <div style={{ height: 400, marginTop: 24 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={{ stroke: "#1e2d4a" }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={{ stroke: "#1e2d4a" }} />
              <RechartsTooltip 
                contentStyle={{ background: "#111827", border: "1px solid #2a3f6b", borderRadius: 8, color: "#f1f5f9" }}
                itemStyle={{ fontSize: 13 }}
              />
              <Legend wrapperStyle={{ paddingTop: 20 }} />
              <Bar dataKey="activeHours" name="Active Hours" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
              <Bar dataKey="idleHours" name="Idle Hours" stackId="a" fill="#475569" />
              <Bar dataKey="maintenanceHours" name="Maintenance" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
