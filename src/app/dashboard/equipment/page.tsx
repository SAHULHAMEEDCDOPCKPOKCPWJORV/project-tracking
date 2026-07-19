"use client";
import { useEffect } from "react";
import { useEquipmentStore } from "@/lib/store";
import { Plus, Settings, Wrench, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function EquipmentPage() {
  const { equipmentList, setEquipment } = useEquipmentStore();
  
  useEffect(() => {
    if (equipmentList.length === 0) {
      setEquipment([
        { id: "EQ-001", name: "Tower Crane TC-1", type: "Crane", hourlyRate: 1500, status: "Active" },
        { id: "EQ-002", name: "Excavator EX-1", type: "Excavator", hourlyRate: 800, status: "Idle" },
        { id: "EQ-003", name: "Concrete Mixer M-1", type: "Mixer", hourlyRate: 400, status: "Active" },
        { id: "EQ-004", name: "Bulldozer B-2", type: "Bulldozer", hourlyRate: 1200, status: "Maintenance" },
        { id: "EQ-005", name: "Generator G-1", type: "Power", hourlyRate: 300, status: "Active" },
      ]);
    }
  }, [equipmentList.length, setEquipment]);

  const activeCount = equipmentList.filter(e => e.status === "Active").length;
  const maintenanceCount = equipmentList.filter(e => e.status === "Maintenance").length;
  const idleCount = equipmentList.filter(e => e.status === "Idle").length;

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24, width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f1f5f9" }}>Equipment Management</h1>
          <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>Manage and track all construction equipment.</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/dashboard/equipment/utilization" className="btn-secondary" style={{ textDecoration: "none" }}>
            View Utilization
          </Link>
          <button className="btn-primary">
            <Plus size={16} /> Add Equipment
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <div className="kpi-card glass">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Settings size={20} color="#3b82f6" />
            <span className="badge badge-progress">Total</span>
          </div>
          <div className="kpi-value" style={{ marginTop: 12 }}>{equipmentList.length}</div>
          <div className="kpi-label">Total Equipment</div>
        </div>
        
        <div className="kpi-card glass">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <CheckCircle2 size={20} color="#10b981" />
            <span className="badge badge-complete">Active</span>
          </div>
          <div className="kpi-value" style={{ marginTop: 12 }}>{activeCount}</div>
          <div className="kpi-label">Currently Active</div>
        </div>

        <div className="kpi-card glass">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Wrench size={20} color="#f59e0b" />
            <span className="badge badge-delayed">Maintenance</span>
          </div>
          <div className="kpi-value" style={{ marginTop: 12 }}>{maintenanceCount}</div>
          <div className="kpi-label">Under Maintenance</div>
        </div>

        <div className="kpi-card glass">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <AlertCircle size={20} color="#94a3b8" />
            <span className="badge badge-planned">Idle</span>
          </div>
          <div className="kpi-value" style={{ marginTop: 12 }}>{idleCount}</div>
          <div className="kpi-label">Currently Idle</div>
        </div>
      </div>

      {/* Table Section */}
      <div className="card glass-dark" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div className="section-title" style={{ margin: 0, border: "none" }}>Equipment Roster</div>
          <input type="text" placeholder="Search equipment..." className="input-field" style={{ width: 240 }} />
        </div>
        
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Hourly Rate</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipmentList.map(eq => (
                <tr key={eq.id}>
                  <td style={{ fontWeight: 600, color: "#60a5fa" }}>{eq.id}</td>
                  <td>{eq.name}</td>
                  <td>{eq.type}</td>
                  <td>₹{eq.hourlyRate}/hr</td>
                  <td>
                    <span className={`badge ${
                      eq.status === "Active" ? "badge-complete" :
                      eq.status === "Maintenance" ? "badge-delayed" : "badge-planned"
                    }`}>
                      {eq.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-secondary" style={{ padding: "4px 8px", fontSize: 11 }}>Edit</button>
                  </td>
                </tr>
              ))}
              {equipmentList.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 32, color: "#64748b" }}>
                    No equipment found. Add some to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
