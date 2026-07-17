"use client";
import { useState, useEffect } from "react";
import { useBOQStore, useProjectStore } from "@/lib/store";
import { generateBOQ } from "@/lib/gantt-engine";
import { formatCurrency } from "@/lib/utils";
import { RefreshCw, Download, Plus, Trash2, Edit3, ChevronDown, ChevronRight } from "lucide-react";

export default function BOQPage() {
  const { project } = useProjectStore();
  const { items, setItems, updateItem } = useBOQStore();
  const [groupBy, setGroupBy] = useState<"floor" | "category">("floor");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (items.length === 0) setItems(generateBOQ(project));
  }, []);

  const filtered = items.filter(i =>
    !search || i.item.toLowerCase().includes(search.toLowerCase()) ||
    i.floor.toLowerCase().includes(search.toLowerCase())
  );

  // Group items
  const groups: Record<string, typeof items> = {};
  filtered.forEach(i => {
    const key = groupBy === "floor" ? i.floor : i.category;
    if (!groups[key]) groups[key] = [];
    groups[key].push(i);
  });

  function getAmount(i: typeof items[0]) {
    return i.quantity * (1 + i.wastage / 100) * i.rate;
  }
  function getGSTAmt(i: typeof items[0]) {
    return getAmount(i) * i.gst / 100;
  }
  function getTotal(i: typeof items[0]) {
    return getAmount(i) + getGSTAmt(i);
  }

  const grandTotal = items.reduce((s, i) => s + getTotal(i), 0);
  const totalGST = items.reduce((s, i) => s + getGSTAmt(i), 0);
  const baseTotal = items.reduce((s, i) => s + getAmount(i), 0);

  function toggleGroup(k: string) {
    setCollapsed(prev => {
      const n = new Set(prev);
      if (n.has(k)) n.delete(k); else n.add(k);
      return n;
    });
  }

  const COLS = ["Item", "Unit", "Qty", "Wastage%", "Rate (₹)", "Amount", "GST%", "GST Amt", "Total"];

  return (
    <div style={{ height:"calc(100vh - 56px)", display:"flex", flexDirection:"column" }}>

      {/* Toolbar */}
      <div style={{ padding:"10px 20px", borderBottom:"1px solid #1e2d4a",
        background:"rgba(13,20,38,0.95)", display:"flex", gap:10, alignItems:"center" }}>

        <input className="input-field" placeholder="Search items..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ width:200, height:34, fontSize:12 }}/>

        <div style={{ display:"flex", background:"rgba(255,255,255,0.04)", borderRadius:8,
          border:"1px solid #1e2d4a" }}>
          {["floor","category"].map(g => (
            <button key={g} onClick={() => setGroupBy(g as "floor"|"category")} style={{
              padding:"5px 14px", fontSize:12, fontWeight:600, cursor:"pointer", border:"none",
              background: groupBy===g ? "rgba(59,130,246,0.2)" : "transparent",
              color: groupBy===g ? "#60a5fa" : "#64748b", borderRadius:8 }}>
              {g === "floor" ? "Floor-wise" : "Category-wise"}
            </button>
          ))}
        </div>

        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <button onClick={() => setItems(generateBOQ(project))} className="btn-secondary">
            <RefreshCw size={14}/> Regenerate
          </button>
          <button className="btn-primary">
            <Download size={14}/> Export BOQ
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ padding:"10px 20px", borderBottom:"1px solid #1e2d4a",
        display:"flex", gap:12, background:"rgba(10,14,26,0.9)" }}>
        {[
          { label:"Base Amount", value:formatCurrency(baseTotal), color:"#60a5fa" },
          { label:"Total GST", value:formatCurrency(totalGST), color:"#f59e0b" },
          { label:"Grand Total", value:formatCurrency(grandTotal), color:"#34d399" },
          { label:"Total Items", value:items.length.toString(), color:"#94a3b8" },
          { label:"Project", value:project.projectName, color:"#a78bfa" },
        ].map(x => (
          <div key={x.label} style={{ padding:"8px 16px", background:"rgba(255,255,255,0.03)",
            borderRadius:8, border:"1px solid #1e2d4a" }}>
            <div style={{ fontSize:10, color:"#64748b", fontWeight:600,
              letterSpacing:"0.07em", textTransform:"uppercase" }}>{x.label}</div>
            <div style={{ fontSize:16, fontWeight:800, color:x.color }}>{x.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ flex:1, overflowY:"auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width:240 }}>Item</th>
              <th style={{ width:60 }}>Unit</th>
              <th style={{ width:80 }}>Qty</th>
              <th style={{ width:80 }}>Wastage%</th>
              <th style={{ width:100 }}>Rate (₹)</th>
              <th style={{ width:110 }}>Amount</th>
              <th style={{ width:60 }}>GST%</th>
              <th style={{ width:110 }}>GST Amt</th>
              <th style={{ width:120 }}>Total</th>
              <th style={{ width:70 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groups).map(([group, groupItems]) => {
              const groupTotal = groupItems.reduce((s, i) => s + getTotal(i), 0);
              const isCol = collapsed.has(group);
              return (
                <>
                  {/* Group header */}
                  <tr key={`grp-${group}`} onClick={() => toggleGroup(group)}
                    style={{ background:"rgba(59,130,246,0.08)", cursor:"pointer" }}>
                    <td colSpan={9} style={{ padding:"10px 14px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        {isCol ? <ChevronRight size={14} color="#60a5fa"/> : <ChevronDown size={14} color="#60a5fa"/>}
                        <span style={{ fontWeight:700, color:"#60a5fa", fontSize:13 }}>{group}</span>
                        <span style={{ fontSize:11, color:"#64748b" }}>({groupItems.length} items)</span>
                        <span style={{ marginLeft:"auto", fontWeight:700, color:"#34d399", fontSize:13 }}>
                          {formatCurrency(groupTotal)}
                        </span>
                      </div>
                    </td>
                    <td/>
                  </tr>

                  {/* Items */}
                  {!isCol && groupItems.map(item => {
                    const amt = getAmount(item);
                    const gstAmt = getGSTAmt(item);
                    const total = getTotal(item);
                    const isEdit = editId === item.id;

                    return (
                      <tr key={item.id}>
                        <td style={{ fontWeight:500 }}>
                          {isEdit ? (
                            <input type="text" className="input-field"
                              style={{ width:"100%", padding:"3px 6px", fontSize:12 }}
                              value={item.item}
                              onChange={e => updateItem(item.id, { item: e.target.value })}/>
                          ) : <span>{item.item}</span>}
                        </td>
                        <td>
                          {isEdit ? (
                            <input type="text" className="input-field"
                              style={{ width:60, padding:"3px 6px", fontSize:12 }}
                              value={item.unit}
                              onChange={e => updateItem(item.id, { unit: e.target.value })}/>
                          ) : <span style={{ color:"#64748b" }}>{item.unit}</span>}
                        </td>
                        <td>
                          {isEdit ? (
                            <input type="number" className="input-field"
                              style={{ width:70, padding:"3px 6px", fontSize:12 }}
                              value={item.quantity}
                              onChange={e => updateItem(item.id, { quantity:+e.target.value })}/>
                          ) : <span>{item.quantity.toFixed(2)}</span>}
                        </td>
                        <td>
                          {isEdit ? (
                            <div style={{ display:"flex", alignItems:"center", gap:2 }}>
                              <input type="number" className="input-field"
                                style={{ width:60, padding:"3px 6px", fontSize:12 }}
                                value={item.wastage}
                                onChange={e => updateItem(item.id, { wastage:+e.target.value })}/>
                              <span style={{ fontSize:12, color:"#64748b" }}>%</span>
                            </div>
                          ) : <span style={{ color:"#64748b" }}>{item.wastage}%</span>}
                        </td>
                        <td>
                          {isEdit ? (
                            <input type="number" className="input-field"
                              style={{ width:90, padding:"3px 6px", fontSize:12 }}
                              value={item.rate}
                              onChange={e => updateItem(item.id, { rate:+e.target.value })}/>
                          ) : <span>₹{item.rate.toLocaleString("en-IN")}</span>}
                        </td>
                        <td style={{ fontWeight:600, color:"#f1f5f9" }}>
                          ₹{Math.round(amt).toLocaleString("en-IN")}
                        </td>
                        <td>
                          {isEdit ? (
                            <div style={{ display:"flex", alignItems:"center", gap:2 }}>
                              <input type="number" className="input-field"
                                style={{ width:60, padding:"3px 6px", fontSize:12 }}
                                value={item.gst}
                                onChange={e => updateItem(item.id, { gst:+e.target.value })}/>
                              <span style={{ fontSize:12, color:"#64748b" }}>%</span>
                            </div>
                          ) : <span style={{ color:"#f59e0b" }}>{item.gst}%</span>}
                        </td>
                        <td style={{ color:"#f59e0b" }}>
                          ₹{Math.round(gstAmt).toLocaleString("en-IN")}
                        </td>
                        <td style={{ fontWeight:700, color:"#34d399" }}>
                          ₹{Math.round(total).toLocaleString("en-IN")}
                        </td>
                        <td>
                          <div style={{ display:"flex", gap:4 }}>
                            <button onClick={() => setEditId(isEdit ? null : item.id)}
                              style={{ background:"none", border:"none", cursor:"pointer",
                                color: isEdit ? "#34d399" : "#64748b", padding:3 }}>
                              <Edit3 size={13}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </>
              );
            })}
          </tbody>

          {/* Grand total row */}
          <tfoot>
            <tr style={{ background:"rgba(16,185,129,0.08)", borderTop:"2px solid rgba(16,185,129,0.3)" }}>
              <td colSpan={5} style={{ fontWeight:800, fontSize:14, color:"#f1f5f9" }}>
                GRAND TOTAL (Incl. GST)
              </td>
              <td style={{ fontWeight:800, fontSize:14, color:"#60a5fa" }}>
                ₹{Math.round(baseTotal).toLocaleString("en-IN")}
              </td>
              <td/>
              <td style={{ fontWeight:700, color:"#f59e0b" }}>
                ₹{Math.round(totalGST).toLocaleString("en-IN")}
              </td>
              <td style={{ fontWeight:800, fontSize:14, color:"#34d399" }}>
                ₹{Math.round(grandTotal).toLocaleString("en-IN")}
              </td>
              <td/>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
