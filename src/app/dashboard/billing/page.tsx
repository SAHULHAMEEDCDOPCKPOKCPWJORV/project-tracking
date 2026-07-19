"use client";
import React, { useEffect } from "react";
import { useBillingStore } from "@/lib/store";
import { formatCurrency, formatDisplayDate } from "@/lib/utils";
import { DollarSign, FileText, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function BillingOverviewPage() {
  const { records, setRecords } = useBillingStore();

  useEffect(() => {
    if (records.length === 0) {
      setRecords([
        { id: "B001", title: "Foundation Stage RA Bill", amount: 1500000, type: "RA Bill", status: "Paid", date: "2026-07-05" },
        { id: "B002", title: "Cement Supplier Invoice", amount: 450000, type: "Vendor Bill", status: "Approved", date: "2026-07-10" },
        { id: "B003", title: "Client First Installment", amount: 2000000, type: "Client Invoice", status: "Submitted", date: "2026-07-15" },
        { id: "B004", title: "Steel Vendor Bill", amount: 800000, type: "Vendor Bill", status: "Draft", date: "2026-07-18" },
      ]);
    }
  }, [records.length, setRecords]);

  const totalBilled = records.reduce((acc, r) => acc + r.amount, 0);
  const totalPaid = records.filter(r => r.status === "Paid").reduce((acc, r) => acc + r.amount, 0);
  const pendingAmount = records.filter(r => r.status !== "Paid").reduce((acc, r) => acc + r.amount, 0);

  const pieData = [
    { name: "Paid", value: totalPaid, color: "#10b981" },
    { name: "Pending", value: pendingAmount, color: "#f59e0b" },
  ];

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f1f5f9" }}>Billing Overview</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/dashboard/billing/ra-bills" className="btn-secondary">View RA Bills</Link>
          <Link href="/dashboard/billing/invoices" className="btn-secondary">View Invoices</Link>
          <button className="btn-primary"><FileText size={16} /> New Bill</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <div className="kpi-card" style={{ background: "rgba(59,130,246,0.1)", borderColor: "rgba(59,130,246,0.25)" }}>
          <DollarSign size={20} color="#3b82f6" />
          <div className="kpi-value" style={{ marginTop: 12 }}>{formatCurrency(totalBilled)}</div>
          <div className="kpi-label">Total Billed Amount</div>
        </div>
        <div className="kpi-card" style={{ background: "rgba(16,185,129,0.1)", borderColor: "rgba(16,185,129,0.25)" }}>
          <CheckCircle size={20} color="#10b981" />
          <div className="kpi-value" style={{ marginTop: 12 }}>{formatCurrency(totalPaid)}</div>
          <div className="kpi-label">Total Received/Paid</div>
        </div>
        <div className="kpi-card" style={{ background: "rgba(245,158,11,0.1)", borderColor: "rgba(245,158,11,0.25)" }}>
          <Clock size={20} color="#f59e0b" />
          <div className="kpi-value" style={{ marginTop: 12 }}>{formatCurrency(pendingAmount)}</div>
          <div className="kpi-label">Pending Clearances</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div className="section-title">Payment Status</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" paddingAngle={5}>
                {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #2a3f6b", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 10 }}>
            {pieData.map(d => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#94a3b8" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div className="section-title">Recent Billing Records</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {records.slice(0, 5).map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td style={{ fontWeight: 600, color: "#f1f5f9" }}>{r.title}</td>
                  <td>{r.type}</td>
                  <td style={{ fontWeight: 700 }}>{formatCurrency(r.amount)}</td>
                  <td>
                    <span className={`badge ${
                      r.status === "Paid" ? "badge-complete" :
                      r.status === "Draft" ? "badge-planned" :
                      r.status === "Submitted" ? "badge-progress" :
                      "badge-delayed"
                    }`}>{r.status}</span>
                  </td>
                  <td>{formatDisplayDate(r.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
