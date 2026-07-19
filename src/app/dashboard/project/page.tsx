"use client";
import { useState, useEffect } from "react";
import { useProjectStore } from "@/lib/store";
import { useGanttStore, useBOQStore } from "@/lib/store";
import { generateGanttTasks, generateBOQ } from "@/lib/gantt-engine";
import { formatCurrency, daysBetween, parseDate } from "@/lib/utils";
import { Save, RefreshCw, ChevronDown, Info } from "lucide-react";

const STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh","Puducherry","Chandigarh","Lakshadweep","Andaman & Nicobar"];

const SOIL_TYPES = ["Normal","Hard Rock","Soft Rock","Sandy","Clay","Expansive","Waterlogged"];
const FOUNDATION_TYPES = ["Isolated","Combined","Raft","Pile","Strip","Well","Spread","Mat","Pier","Caisson","Grillage"];
const RCC_GRADES = ["M20","M25","M30","M35","M40"];
const STEEL_GRADES = ["Fe415","Fe500","Fe550","Fe600"];
const CITIES = ["Mumbai","Delhi","Bengaluru","Hyderabad","Ahmedabad","Chennai","Kolkata","Surat","Pune","Jaipur","Lucknow","Kanpur","Nagpur","Indore","Thane","Bhopal","Visakhapatnam","Pimpri-Chinchwad","Patna","Vadodara","Ghaziabad","Ludhiana","Agra","Nashik","Ranchi","Faridabad","Meerut","Rajkot","Kalyan-Dombivli","Vasai-Virar","Varanasi","Srinagar","Aurangabad","Dhanbad","Amritsar","Navi Mumbai","Allahabad","Howrah","Gwalior","Jabalpur","Coimbatore","Vijayawada","Jodhpur","Madurai","Raipur","Kota","Guwahati","Chandigarh","Solapur","Hubballi-Dharwad"];

function Field({ label, children, span = 1 }: { label: string; children: React.ReactNode; span?: number }) {
  return (
    <div style={{ gridColumn: `span ${span}` }}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ padding:"14px 16px", background:"rgba(59,130,246,0.06)",
      borderRadius:10, border:"1px solid rgba(59,130,246,0.15)" }}>
      <div style={{ fontSize:10, color:"#64748b", fontWeight:600, letterSpacing:"0.07em",
        textTransform:"uppercase", marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:20, fontWeight:800, color:"#60a5fa" }}>{value}</div>
      {sub && <div style={{ fontSize:10, color:"#475569", marginTop:2 }}>{sub}</div>}
    </div>
  );
}

export default function ProjectPage() {
  const { project, setProject } = useProjectStore();
  const { setTasks } = useGanttStore();
  const { setItems } = useBOQStore();
  const [saved, setSaved] = useState(false);

  const totalCost = project.totalBuiltUpArea * project.costPerSqft;
  const advance = totalCost * project.advancePercentage / 100;
  const gstAmt = totalCost * project.gstPercentage / 100;
  const retention = totalCost * project.retentionMoney / 100;
  const labourCessAmt = totalCost * project.labourCess / 100;
  const pvcAmt = totalCost * project.pvc / 100;
  const grandTotal = totalCost + gstAmt;
  const costPerFloor = totalCost / (project.numFloors + 1);
  const duration = daysBetween(parseDate(project.startDate), parseDate(project.endDate));

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleRegenerate() {
    const tasks = generateGanttTasks(project);
    setTasks(tasks);
    setItems(generateBOQ(project));
  }

  return (
    <div style={{ padding:24, maxWidth:1400, margin:"0 auto" }}>
      {/* Top actions */}
      <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginBottom:20 }}>
        <button onClick={handleRegenerate} className="btn-secondary">
          <RefreshCw size={15}/> Auto-generate
        </button>
        <button onClick={handleSave} className="btn-primary">
          <Save size={15}/> {saved ? "Saved ✓" : "Save"}
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:20, alignItems:"start" }}>

        {/* ── Left: Input Forms ─────────────────────── */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Project Identity */}
          <div className="card" style={{ padding:24 }}>
            <div className="section-title" style={{ display:"flex", alignItems:"center", gap:8 }}>
              Project Identity
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <Field label="Project Name">
                <input className="input-field" value={project.projectName}
                  onChange={e => setProject({ projectName: e.target.value })}/>
              </Field>
              <Field label="Client Name">
                <input className="input-field" value={project.clientName}
                  onChange={e => setProject({ clientName: e.target.value })}/>
              </Field>
              <Field label="Consultant Name">
                <input className="input-field" value={project.consultantName}
                  onChange={e => setProject({ consultantName: e.target.value })}/>
              </Field>
              <Field label="Contractor Name">
                <input className="input-field" value={project.contractorName}
                  onChange={e => setProject({ contractorName: e.target.value })}/>
              </Field>
              <Field label="Status">
                <select className="input-field" value={project.status}
                  onChange={e => setProject({ status: e.target.value as any })}>
                  {["Planning","In Progress","On Hold","Completed"].map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="City">
                <input className="input-field" list="cities" value={project.city}
                  onChange={e => setProject({ city: e.target.value })}/>
                <datalist id="cities">
                  {CITIES.map(c => <option key={c} value={c} />)}
                </datalist>
              </Field>
              <Field label="State">
                <select className="input-field" value={project.state}
                  onChange={e => setProject({ state: e.target.value })}>
                  {STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Pincode">
                <input className="input-field" value={project.pincode}
                  onChange={e => setProject({ pincode: e.target.value })}/>
              </Field>
              <Field label="Project Type">
                <select className="input-field" value={project.projectType}
                  onChange={e => setProject({ projectType: e.target.value as "Residential"|"Commercial"|"Mixed" })}>
                  {["Residential","Commercial","Mixed"].map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Building Config (G+N)">
                <input className="input-field" value={project.buildingConfig}
                  onChange={e => setProject({ buildingConfig: e.target.value })}/>
              </Field>
              <Field label="Number of Floors">
                <input type="number" className="input-field" value={project.numFloors} min={0} max={50}
                  onChange={e => setProject({ numFloors: +e.target.value })}/>
              </Field>
              <Field label="Default Workers">
                <input type="number" className="input-field" value={project.defaultWorkers}
                  onChange={e => setProject({ defaultWorkers: +e.target.value })}/>
              </Field>
            </div>
          </div>

          {/* Schedule & Site */}
          <div className="card" style={{ padding:24 }}>
            <div className="section-title">Schedule & Site</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
              <Field label="Start Date">
                <input type="date" className="input-field" value={project.startDate}
                  onChange={e => setProject({ startDate: e.target.value })}/>
              </Field>
              <Field label="Planned Completion">
                <input type="date" className="input-field" value={project.endDate}
                  onChange={e => setProject({ endDate: e.target.value })}/>
              </Field>
              <Field label="Total Built-up Area (sqft)">
                <input type="number" className="input-field" value={project.totalBuiltUpArea}
                  onChange={e => setProject({ totalBuiltUpArea: +e.target.value })}/>
              </Field>
              <Field label="Soil Type">
                <select className="input-field" value={project.soilType}
                  onChange={e => setProject({ soilType: e.target.value })}>
                  {SOIL_TYPES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Foundation Type">
                <select className="input-field" value={project.foundationType}
                  onChange={e => setProject({ foundationType: e.target.value })}>
                  {FOUNDATION_TYPES.map(f => <option key={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Footing Depth (m)">
                <input type="number" step="0.1" className="input-field" value={project.footingDepth}
                  onChange={e => setProject({ footingDepth: +e.target.value })}/>
              </Field>
              <Field label="Floor Height (m)">
                <input type="number" step="0.1" className="input-field" value={project.floorHeight}
                  onChange={e => setProject({ floorHeight: +e.target.value })}/>
              </Field>
              <Field label="Plinth Height (m)">
                <input type="number" step="0.1" className="input-field" value={project.plinthHeight}
                  onChange={e => setProject({ plinthHeight: +e.target.value })}/>
              </Field>
            </div>
          </div>

          {/* Structural Specs */}
          <div className="card" style={{ padding:24 }}>
            <div className="section-title">Structural Specifications</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
              <Field label="RCC Grade">
                <select className="input-field" value={project.rccGrade}
                  onChange={e => setProject({ rccGrade: e.target.value })}>
                  {RCC_GRADES.map(g => <option key={g}>{g}</option>)}
                </select>
              </Field>
              <Field label="Steel Grade">
                <select className="input-field" value={project.steelGrade}
                  onChange={e => setProject({ steelGrade: e.target.value })}>
                  {STEEL_GRADES.map(g => <option key={g}>{g}</option>)}
                </select>
              </Field>
              <Field label="Steel Percentage (%)">
                <input type="number" step="0.1" className="input-field" value={project.steelPercentage}
                  onChange={e => setProject({ steelPercentage: +e.target.value })}/>
              </Field>
            </div>
          </div>

          {/* Financial */}
          <div className="card" style={{ padding:24 }}>
            <div className="section-title">Financial Parameters</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
              <Field label="Cost per sq.ft (₹)">
                <input type="number" className="input-field" value={project.costPerSqft}
                  onChange={e => setProject({ costPerSqft: +e.target.value })}/>
              </Field>
              <Field label="Advance Percentage (%)">
                <input type="number" step="0.5" className="input-field" value={project.advancePercentage}
                  onChange={e => setProject({ advancePercentage: +e.target.value })}/>
              </Field>
              <Field label="GST Percentage (%)">
                <input type="number" step="0.5" className="input-field" value={project.gstPercentage}
                  onChange={e => setProject({ gstPercentage: +e.target.value })}/>
              </Field>
              <Field label="Retention Money (%)">
                <input type="number" step="0.5" className="input-field" value={project.retentionMoney}
                  onChange={e => setProject({ retentionMoney: +e.target.value })}/>
              </Field>
              <Field label="Security Deposit (%)">
                <input type="number" step="0.5" className="input-field" value={project.securityDeposit}
                  onChange={e => setProject({ securityDeposit: +e.target.value })}/>
              </Field>
              <Field label="Labour Cess (%)">
                <input type="number" step="0.1" className="input-field" value={project.labourCess}
                  onChange={e => setProject({ labourCess: +e.target.value })}/>
              </Field>
              <Field label="PVC – Price Variation Clause (%)">
                <input type="number" step="0.1" className="input-field" value={project.pvc}
                  onChange={e => setProject({ pvc: +e.target.value })}/>
              </Field>
            </div>
          </div>
        </div>

        {/* ── Right: Auto-calculated Summary ─────────── */}
        <div style={{ position:"sticky", top:16, display:"flex", flexDirection:"column", gap:12 }}>

          {/* Total Cost */}
          <div className="card card-glow" style={{ padding:20,
            background:"linear-gradient(135deg, rgba(59,130,246,0.08), rgba(15,22,41,0.95))" }}>
            <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.1em",
              textTransform:"uppercase", color:"#64748b", marginBottom:8 }}>TOTAL PROJECT COST</div>
            <div style={{ fontSize:36, fontWeight:900, color:"#60a5fa", letterSpacing:"-0.02em" }}>
              {formatCurrency(totalCost)}
            </div>
            <div style={{ fontSize:12, color:"#475569", marginTop:2 }}>
              ₹{totalCost.toLocaleString("en-IN")}
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <StatCard label="Advance" value={formatCurrency(advance)}/>
            <StatCard label="Cost / Floor" value={formatCurrency(costPerFloor)}/>
            <StatCard label="GST Amount" value={formatCurrency(gstAmt)}/>
            <StatCard label="Retention" value={formatCurrency(retention)}/>
            <StatCard label="Labour Cess" value={formatCurrency(labourCessAmt)}/>
            <StatCard label="PVC" value={formatCurrency(pvcAmt)}/>
          </div>

          {/* Grand Total */}
          <div className="card" style={{ padding:20,
            background:"linear-gradient(135deg, rgba(16,185,129,0.06), rgba(15,22,41,0.95))",
            border:"1px solid rgba(16,185,129,0.2)" }}>
            <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.1em",
              textTransform:"uppercase", color:"#64748b" }}>GRAND TOTAL (INCL. TAXES)</div>
            <div style={{ fontSize:30, fontWeight:900, color:"#34d399", marginTop:8 }}>
              {formatCurrency(grandTotal)}
            </div>
            <hr className="divider" style={{ margin:"12px 0" }}/>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {[
                { label:"Duration", value:`${duration} days` },
                { label:"Cost / sqft", value:`₹${project.costPerSqft.toLocaleString("en-IN")}` },
                { label:"Cost / Floor", value:formatCurrency(costPerFloor) },
                { label:"RCC Grade", value:project.rccGrade },
                { label:"Steel Grade", value:project.steelGrade },
              ].map(x => (
                <div key={x.label} style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontSize:12, color:"#64748b" }}>{x.label}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:"#f1f5f9" }}>{x.value}</span>
                </div>
              ))}
            </div>
            <button onClick={handleRegenerate} className="btn-secondary"
              style={{ width:"100%", justifyContent:"center", marginTop:14 }}>
              <RefreshCw size={14}/> Regenerate Schedule & BOQ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
