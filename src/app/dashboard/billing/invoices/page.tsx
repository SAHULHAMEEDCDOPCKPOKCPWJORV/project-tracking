"use client";
import React, { useEffect } from "react";
import { useBillingStore } from "@/lib/store";
import { formatCurrency, formatDisplayDate } from "@/lib/utils";
import { FileText, Plus, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function InvoicesPage() {
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

  const invoices = records.filter(r => r.type === "Vendor Bill" || r.type === "Client Invoice");
  const totalInvoices = invoices.reduce((acc, r) => acc + r.amount, 0);

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/billing" className="btn-secondary" style={{ padding: "8px" }}><ChevronLeft size={18} /></Link>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f1f5f9" }}>Invoices</h1>
        </div>
        <button className="btn-primary"><Plus size={16} /> New Invoice</button>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div className="section-title">All Invoices (Vendor & Client)</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Invoice Details</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: "center", color: "#64748b" }}>No Invoices found</td></tr>
            )}
            {invoices.map(r => (
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
                <td>
                  <button className="btn-secondary" style={{ fontSize: 11, padding: "4px 8px" }}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={{ textAlign: "right", fontWeight: 700, padding: 12 }}>Total Invoices:</td>
              <td style={{ fontWeight: 800, color: "#3b82f6", padding: 12 }}>{formatCurrency(totalInvoices)}</td>
              <td colSpan={3}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
