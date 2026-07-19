"use client";
import { useState } from "react";
import { Calculator, Download, Plus, TrendingUp, BarChart2, Layers } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type EstItem = { id:string; description:string; unit:string; qty:number; labour:number; material:number; equipment:number; overhead:number; profit:number };

const INITIAL: EstItem[] = [
  { id:"E001", description:"Earthwork Excavation", unit:"Cum", qty:450, labour:60, material:0, equipment:120, overhead:10, profit:8 },
  { id:"E002", description:"PCC M10 in Foundation", unit:"Cum", qty:75, labour:400, material:4800, equipment:200, overhead:10, profit:8 },
  { id:"E003", description:"RCC M25 Columns", unit:"Cum", qty:60, labour:800, material:6200, equipment:400, overhead:12, profit:10 },
  { id:"E004", description:"RCC M25 Beams & Slab", unit:"Cum", qty:180, labour:700, material:6000, equipment:350, overhead:12, profit:10 },
  { id:"E005", description:"TMT Steel Fe500", unit:"MT", qty:18, labour:2000, material:68000, equipment:500, overhead:8, profit:8 },
  { id:"E006", description:"Brickwork 230mm", unit:"Sqm", qty:525, labour:180, material:120, equipment:20, overhead:10, profit:8 },
  { id:"E007", description:"Plastering 12mm", unit:"Sqm", qty:2700, labour:60, material:40, equipment:10, overhead:8, profit:8 },
  { id:"E008", description:"Vitrified Tile Flooring", unit:"Sqm", qty:1425, labour:80, material:650, equipment:15, overhead:8, profit:8 },
];

export default function EstimationPage() {
  const [items, setItems] = useState(INITIAL);
  const [gstRate, setGstRate] = useState(18);

  const update = (id: string, key: keyof EstItem, val: any) => setItems(prev=>prev.map(i=>i.id===id?{...i,[key]:val}:i));

  const calcRow = (i: EstItem) => {
    const base = (i.labour + i.material + i.equipment) * i.qty;
    const overheadAmt = base * i.overhead / 100;
    const subtotal = base + overheadAmt;
    const profitAmt = subtotal * i.profit / 100;
    const net = subtotal + profitAmt;
    const gstAmt = net * gstRate / 100;
    return { base, overheadAmt, subtotal, profitAmt, net, gstAmt, total: net + gstAmt };
  };

  const totals = items.reduce((s,i)=>{ const c=calcRow(i); return { net:s.net+c.net, gst:s.gst+c.gstAmt, total:s.total+c.total }; }, { net:0, gst:0, total:0 });

  return (
    <div style={{ padding:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:20 }}>
        {[
          { label:"Estimate Items", value:items.length, color:"#60a5fa" },
          { label:"Net Cost", value:formatCurrency(totals.net), color:"#a78bfa" },
          { label:"GST Amount", value:formatCurrency(totals.gst), color:"#f59e0b" },
          { label:"Grand Total", value:formatCurrency(totals.total), color:"#34d399" },
        ].map(k=>(
          <div key={k.label} className="kpi-card">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ fontSize:20, color:k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding:"12px 16px", marginBottom:16, display:"flex", gap:16, alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <label className="label" style={{ marginBottom:0 }}>GST Rate %:</label>
          <input type="number" className="input-field" style={{ width:80, height:36, fontSize:12 }} value={gstRate} onChange={e=>setGstRate(+e.target.value)}/>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <button className="btn-secondary" style={{ fontSize:12 }}><Download size={13}/> Export Excel</button>
          <button className="btn-primary" style={{ fontSize:12 }}><Plus size={13}/> Add Item</button>
        </div>
      </div>

      <div className="card" style={{ overflow:"auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ minWidth:200 }}>Description</th><th>Unit</th><th>Qty</th>
              <th>Labour<br/>(₹/Unit)</th><th>Material<br/>(₹/Unit)</th><th>Equipment<br/>(₹/Unit)</th>
              <th>Overhead%</th><th>Profit%</th><th>Net Amount</th><th>GST</th><th>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map(i=>{
              const c = calcRow(i);
              return (
                <tr key={i.id}>
                  <td style={{ fontWeight:600 }}>
                    <input className="input-field" style={{ width:"100%", padding:"3px 8px", fontSize:12 }} value={i.description} onChange={e=>update(i.id,"description",e.target.value)}/>
                  </td>
                  <td><input className="input-field" style={{ width:60, padding:"3px 6px", fontSize:12 }} value={i.unit} onChange={e=>update(i.id,"unit",e.target.value)}/></td>
                  <td><input type="number" className="input-field" style={{ width:70, padding:"3px 6px", fontSize:12 }} value={i.qty} onChange={e=>update(i.id,"qty",+e.target.value)}/></td>
                  <td><input type="number" className="input-field" style={{ width:80, padding:"3px 6px", fontSize:12 }} value={i.labour} onChange={e=>update(i.id,"labour",+e.target.value)}/></td>
                  <td><input type="number" className="input-field" style={{ width:90, padding:"3px 6px", fontSize:12 }} value={i.material} onChange={e=>update(i.id,"material",+e.target.value)}/></td>
                  <td><input type="number" className="input-field" style={{ width:80, padding:"3px 6px", fontSize:12 }} value={i.equipment} onChange={e=>update(i.id,"equipment",+e.target.value)}/></td>
                  <td><input type="number" className="input-field" style={{ width:60, padding:"3px 6px", fontSize:12 }} value={i.overhead} onChange={e=>update(i.id,"overhead",+e.target.value)}/></td>
                  <td><input type="number" className="input-field" style={{ width:60, padding:"3px 6px", fontSize:12 }} value={i.profit} onChange={e=>update(i.id,"profit",+e.target.value)}/></td>
                  <td style={{ fontWeight:600, color:"#f1f5f9" }}>₹{Math.round(c.net).toLocaleString("en-IN")}</td>
                  <td style={{ color:"#f59e0b" }}>₹{Math.round(c.gstAmt).toLocaleString("en-IN")}</td>
                  <td style={{ fontWeight:700, color:"#34d399" }}>₹{Math.round(c.total).toLocaleString("en-IN")}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background:"rgba(59,130,246,0.05)", borderTop:"2px solid #1e2d4a" }}>
              <td colSpan={8} style={{ fontWeight:800, color:"#f1f5f9", fontSize:13 }}>GRAND TOTAL</td>
              <td style={{ fontWeight:800, color:"#60a5fa" }}>₹{Math.round(totals.net).toLocaleString("en-IN")}</td>
              <td style={{ fontWeight:700, color:"#f59e0b" }}>₹{Math.round(totals.gst).toLocaleString("en-IN")}</td>
              <td style={{ fontWeight:800, color:"#34d399", fontSize:14 }}>₹{Math.round(totals.total).toLocaleString("en-IN")}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
