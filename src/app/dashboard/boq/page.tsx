"use client";
import React, { useState, useEffect } from "react";
import { useBOQStore, useProjectStore, BOQItem, useMaterialStore, useLabourStore } from "@/lib/store";
import { generateBOQ } from "@/lib/gantt-engine";
import { formatCurrency } from "@/lib/utils";
import { RefreshCw, Download, ChevronDown, ChevronRight, Edit3, Save } from "lucide-react";

export default function BOQPage() {
  const { project } = useProjectStore();
  const { materials } = useMaterialStore();
  const { rates } = useLabourStore();
  const { items, setItems, updateItem } = useBOQStore();
  const [groupBy, setGroupBy] = useState<"floor" | "category">("floor");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (items.length === 0) setItems(generateBOQ(project, materials, rates));
  }, []);

  const handleRegenerate = () => {
    setItems(generateBOQ(project, materials, rates));
  };

  const filtered = items.filter(i =>
    !search || i.description.toLowerCase().includes(search.toLowerCase()) ||
    i.floor.toLowerCase().includes(search.toLowerCase()) ||
    i.itemNo.toLowerCase().includes(search.toLowerCase())
  );

  // Group items
  const groups: Record<string, typeof items> = {};
  filtered.forEach(i => {
    const key = groupBy === "floor" ? i.floor : i.category;
    if (!groups[key]) groups[key] = [];
    groups[key].push(i);
  });

  function getAmount(i: BOQItem) {
    return i.quantity * i.rate;
  }
  function getTotalCost(i: BOQItem) {
    const amt = getAmount(i);
    return amt + i.overhead + (amt * i.profit / 100) + (amt * i.gst / 100);
  }

  const grandTotal = items.reduce((s, i) => s + getTotalCost(i), 0);
  const baseTotal = items.reduce((s, i) => s + getAmount(i), 0);

  function toggleGroup(k: string) {
    setCollapsed(prev => {
      const n = new Set(prev);
      if (n.has(k)) n.delete(k); else n.add(k);
      return n;
    });
  }

  const handleEditChange = (id: string, field: keyof BOQItem, val: any) => {
    updateItem(id, { [field]: val });
  };

  return (
    <div style={{ height:"calc(100vh - 56px)", display:"flex", flexDirection:"column", background:"#0a0f1c" }}>
      {/* Toolbar */}
      <div style={{ padding:"12px 24px", borderBottom:"1px solid rgba(255,255,255,0.05)",
        background:"linear-gradient(180deg, rgba(13,20,38,0.95) 0%, rgba(10,15,30,0.95) 100%)", display:"flex", gap:15, alignItems:"center", boxShadow:"0 4px 20px rgba(0,0,0,0.2)" }}>
        
        <div style={{ display:"flex", flexDirection:"column" }}>
          <h1 style={{ margin:0, fontSize:18, fontWeight:700, color:"#f1f5f9", letterSpacing:"-0.02em" }}>Bill of Quantities</h1>
          <span style={{ fontSize:12, color:"#64748b" }}>Professional Cost Estimation & BOQ Management</span>
        </div>

        <input className="input-field" placeholder="Search items, floors..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ marginLeft: 20, width:250, height:36, fontSize:13, background:"rgba(0,0,0,0.2)" }}/>

        <div style={{ display:"flex", background:"rgba(0,0,0,0.3)", borderRadius:8,
          border:"1px solid rgba(255,255,255,0.05)", padding: 2 }}>
          {["floor","category"].map(g => (
            <button key={g} onClick={() => setGroupBy(g as "floor"|"category")} style={{
              padding:"6px 16px", fontSize:12, fontWeight:600, cursor:"pointer", border:"none",
              background: groupBy===g ? "rgba(59,130,246,0.15)" : "transparent",
              color: groupBy===g ? "#60a5fa" : "#64748b", borderRadius:6, transition:"all 0.2s" }}>
              {g === "floor" ? "By Floor" : "By Category"}
            </button>
          ))}
        </div>

        <div style={{ marginLeft:"auto", display:"flex", gap:10 }}>
          <button onClick={handleRegenerate} className="btn-secondary" style={{ height:36, padding:"0 16px" }}>
            <RefreshCw size={14}/> Regenerate
          </button>
          <button className="btn-primary" style={{ height:36, padding:"0 16px", background:"linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" }}>
            <Download size={14}/> Export XLS
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ padding:"16px 24px", borderBottom:"1px solid rgba(255,255,255,0.05)",
        display:"flex", gap:16, background:"rgba(10,14,26,0.6)" }}>
        {[
          { label:"Base Project Cost", value:formatCurrency(baseTotal), color:"#60a5fa", icon: "💰" },
          { label:"Total Estimated Cost", value:formatCurrency(grandTotal), color:"#34d399", icon: "📊" },
          { label:"Total Items", value:items.length.toString(), color:"#a78bfa", icon: "📋" },
        ].map(x => (
          <div key={x.label} style={{ flex:1, padding:"16px 20px", background:"linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
            borderRadius:12, border:"1px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center", gap:16,
            boxShadow:"0 4px 15px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize:28 }}>{x.icon}</div>
            <div>
              <div style={{ fontSize:11, color:"#94a3b8", fontWeight:600,
                letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:4 }}>{x.label}</div>
              <div style={{ fontSize:20, fontWeight:800, color:x.color }}>{x.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Area with Horizontal Scroll */}
      <div style={{ flex:1, overflow:"auto", padding: "0 24px 24px 24px" }}>
        <div style={{ minWidth: 2000, background:"rgba(13,20,38,0.5)", borderRadius: 12, border:"1px solid rgba(255,255,255,0.05)", overflow:"hidden", marginTop: 16 }}>
          <table className="data-table" style={{ width:"100%", borderCollapse:"collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background:"rgba(0,0,0,0.4)", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
                <th style={{ padding:"12px 16px", color:"#94a3b8", fontWeight:600, width: 50 }}></th>
                <th style={{ padding:"12px 16px", color:"#94a3b8", fontWeight:600, width: 100 }}>Item No</th>
                <th style={{ padding:"12px 16px", color:"#94a3b8", fontWeight:600, width: 250 }}>Description</th>
                <th style={{ padding:"12px 16px", color:"#94a3b8", fontWeight:600, width: 150 }}>Specification</th>
                <th style={{ padding:"12px 16px", color:"#94a3b8", fontWeight:600, width: 120 }}>Activity</th>
                <th style={{ padding:"12px 16px", color:"#94a3b8", fontWeight:600, width: 80 }}>Unit</th>
                <th style={{ padding:"12px 16px", color:"#94a3b8", fontWeight:600, width: 100, textAlign:"right" }}>Qty</th>
                <th style={{ padding:"12px 16px", color:"#94a3b8", fontWeight:600, width: 120, textAlign:"right" }}>Rate (₹)</th>
                <th style={{ padding:"12px 16px", color:"#94a3b8", fontWeight:600, width: 120, textAlign:"right" }}>Amount</th>
                <th style={{ padding:"12px 16px", color:"#94a3b8", fontWeight:600, width: 120 }}>Contractor</th>
                <th style={{ padding:"12px 16px", color:"#94a3b8", fontWeight:600, width: 120 }}>Vendor</th>
                <th style={{ padding:"12px 16px", color:"#94a3b8", fontWeight:600, width: 100, textAlign:"right" }}>Material</th>
                <th style={{ padding:"12px 16px", color:"#94a3b8", fontWeight:600, width: 100, textAlign:"right" }}>Labour</th>
                <th style={{ padding:"12px 16px", color:"#94a3b8", fontWeight:600, width: 100, textAlign:"right" }}>Equip.</th>
                <th style={{ padding:"12px 16px", color:"#94a3b8", fontWeight:600, width: 100, textAlign:"right" }}>Overhead</th>
                <th style={{ padding:"12px 16px", color:"#94a3b8", fontWeight:600, width: 80, textAlign:"right" }}>Profit %</th>
                <th style={{ padding:"12px 16px", color:"#94a3b8", fontWeight:600, width: 80, textAlign:"right" }}>GST %</th>
                <th style={{ padding:"12px 16px", color:"#34d399", fontWeight:700, width: 120, textAlign:"right" }}>Total Cost</th>
                <th style={{ padding:"12px 16px", color:"#94a3b8", fontWeight:600, width: 150 }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groups).map(([group, groupItems]) => {
                const groupTotal = groupItems.reduce((s, i) => s + getTotalCost(i), 0);
                const isCol = collapsed.has(group);
                return (
                  <React.Fragment key={`grp-${group}`}>
                    {/* Group header */}
                    <tr onClick={() => toggleGroup(group)}
                      style={{ background:"rgba(59,130,246,0.08)", cursor:"pointer", borderBottom:"1px solid rgba(255,255,255,0.02)" }}>
                      <td colSpan={17} style={{ padding:"12px 16px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          {isCol ? <ChevronRight size={16} color="#60a5fa"/> : <ChevronDown size={16} color="#60a5fa"/>}
                          <span style={{ fontWeight:700, color:"#60a5fa", fontSize:14, textTransform:"uppercase", letterSpacing:"0.05em" }}>{group}</span>
                          <span style={{ fontSize:12, color:"#64748b", background:"rgba(255,255,255,0.1)", padding:"2px 8px", borderRadius:10 }}>{groupItems.length} items</span>
                        </div>
                      </td>
                      <td style={{ padding:"12px 16px", fontWeight:800, color:"#34d399", fontSize:14, textAlign:"right" }}>
                        {formatCurrency(groupTotal)}
                      </td>
                      <td/>
                    </tr>

                    {/* Items */}
                    {!isCol && groupItems.map((item, idx) => {
                      const isEdit = editId === item.id;
                      const amt = getAmount(item);
                      const tCost = getTotalCost(item);
                      const rowBg = idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)";

                      const InputCell = ({ field, type="text", width }: { field: keyof BOQItem, type?: string, width?: number|string }) => (
                        <td style={{ padding:"8px 16px", borderBottom:"1px solid rgba(255,255,255,0.03)" }}>
                          {isEdit ? (
                            <input type={type} className="input-field"
                              style={{ width: width || "100%", padding:"4px 8px", fontSize:12, background:"rgba(0,0,0,0.5)", border:"1px solid #3b82f6" }}
                              value={item[field] as any}
                              onChange={e => handleEditChange(item.id, field, type === "number" ? +e.target.value : e.target.value)}/>
                          ) : (
                            <div style={{ color:"#e2e8f0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", width: width ? (width as number) - 20 : "auto" }}>
                              {type === "number" && field !== "quantity" && field !== "profit" && field !== "gst" ? 
                                `₹${Math.round(item[field] as number).toLocaleString("en-IN")}` : 
                                type === "number" ? (item[field] as number).toFixed(2) :
                                item[field]}
                            </div>
                          )}
                        </td>
                      );

                      return (
                        <tr key={item.id} style={{ background: isEdit ? "rgba(59,130,246,0.05)" : rowBg, transition:"all 0.2s" }}
                          onDoubleClick={() => setEditId(item.id)}>
                          <td style={{ padding:"8px 16px", borderBottom:"1px solid rgba(255,255,255,0.03)", textAlign:"center" }}>
                            <button onClick={() => setEditId(isEdit ? null : item.id)}
                              style={{ background:"none", border:"none", cursor:"pointer", color: isEdit ? "#34d399" : "#64748b", padding:4, borderRadius:4 }}>
                              {isEdit ? <Save size={14}/> : <Edit3 size={14}/>}
                            </button>
                          </td>
                          <InputCell field="itemNo" width={80} />
                          <InputCell field="description" width={220} />
                          <InputCell field="specification" width={130} />
                          <InputCell field="activity" width={100} />
                          <InputCell field="unit" width={60} />
                          
                          <td style={{ padding:"8px 16px", borderBottom:"1px solid rgba(255,255,255,0.03)", textAlign:"right" }}>
                            {isEdit ? (
                              <input type="number" className="input-field" style={{ width:70, padding:"4px 8px", fontSize:12, textAlign:"right", background:"rgba(0,0,0,0.5)", border:"1px solid #3b82f6" }}
                                value={item.quantity} onChange={e => handleEditChange(item.id, "quantity", +e.target.value)}/>
                            ) : <span style={{ color:"#f1f5f9", fontWeight:500 }}>{item.quantity.toFixed(2)}</span>}
                          </td>
                          
                          <td style={{ padding:"8px 16px", borderBottom:"1px solid rgba(255,255,255,0.03)", textAlign:"right" }}>
                            {isEdit ? (
                              <input type="number" className="input-field" style={{ width:90, padding:"4px 8px", fontSize:12, textAlign:"right", background:"rgba(0,0,0,0.5)", border:"1px solid #3b82f6" }}
                                value={item.rate} onChange={e => handleEditChange(item.id, "rate", +e.target.value)}/>
                            ) : <span style={{ color:"#f1f5f9" }}>₹{item.rate.toLocaleString("en-IN")}</span>}
                          </td>
                          
                          <td style={{ padding:"8px 16px", borderBottom:"1px solid rgba(255,255,255,0.03)", textAlign:"right", fontWeight:600, color:"#94a3b8" }}>
                            ₹{Math.round(amt).toLocaleString("en-IN")}
                          </td>
                          
                          <InputCell field="contractor" width={100} />
                          <InputCell field="vendor" width={100} />
                          
                          <td style={{ padding:"8px 16px", borderBottom:"1px solid rgba(255,255,255,0.03)", textAlign:"right" }}>
                            {isEdit ? <input type="number" className="input-field" style={{ width:80, padding:"4px", fontSize:12, textAlign:"right" }} value={item.material} onChange={e => handleEditChange(item.id, "material", +e.target.value)}/>
                              : <span>₹{Math.round(item.material).toLocaleString("en-IN")}</span>}
                          </td>
                          <td style={{ padding:"8px 16px", borderBottom:"1px solid rgba(255,255,255,0.03)", textAlign:"right" }}>
                            {isEdit ? <input type="number" className="input-field" style={{ width:80, padding:"4px", fontSize:12, textAlign:"right" }} value={item.labour} onChange={e => handleEditChange(item.id, "labour", +e.target.value)}/>
                              : <span>₹{Math.round(item.labour).toLocaleString("en-IN")}</span>}
                          </td>
                          <td style={{ padding:"8px 16px", borderBottom:"1px solid rgba(255,255,255,0.03)", textAlign:"right" }}>
                            {isEdit ? <input type="number" className="input-field" style={{ width:80, padding:"4px", fontSize:12, textAlign:"right" }} value={item.equipment} onChange={e => handleEditChange(item.id, "equipment", +e.target.value)}/>
                              : <span>₹{Math.round(item.equipment).toLocaleString("en-IN")}</span>}
                          </td>
                          <td style={{ padding:"8px 16px", borderBottom:"1px solid rgba(255,255,255,0.03)", textAlign:"right" }}>
                            {isEdit ? <input type="number" className="input-field" style={{ width:80, padding:"4px", fontSize:12, textAlign:"right" }} value={item.overhead} onChange={e => handleEditChange(item.id, "overhead", +e.target.value)}/>
                              : <span>₹{Math.round(item.overhead).toLocaleString("en-IN")}</span>}
                          </td>
                          <td style={{ padding:"8px 16px", borderBottom:"1px solid rgba(255,255,255,0.03)", textAlign:"right", color:"#f59e0b" }}>
                            {isEdit ? <input type="number" className="input-field" style={{ width:50, padding:"4px", fontSize:12, textAlign:"right" }} value={item.profit} onChange={e => handleEditChange(item.id, "profit", +e.target.value)}/>
                              : <span>{item.profit}%</span>}
                          </td>
                          <td style={{ padding:"8px 16px", borderBottom:"1px solid rgba(255,255,255,0.03)", textAlign:"right", color:"#f59e0b" }}>
                            {isEdit ? <input type="number" className="input-field" style={{ width:50, padding:"4px", fontSize:12, textAlign:"right" }} value={item.gst} onChange={e => handleEditChange(item.id, "gst", +e.target.value)}/>
                              : <span>{item.gst}%</span>}
                          </td>

                          <td style={{ padding:"8px 16px", borderBottom:"1px solid rgba(255,255,255,0.03)", textAlign:"right", fontWeight:700, color:"#34d399", background:"rgba(52,211,153,0.05)" }}>
                            ₹{Math.round(tCost).toLocaleString("en-IN")}
                          </td>
                          <InputCell field="remarks" width={130} />
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
