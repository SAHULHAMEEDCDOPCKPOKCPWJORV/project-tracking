"use client";
import { useState } from "react";
import { Calculator, Download, Layers, PieChart as PieChartIcon, Settings, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useProjectStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

const FOUNDATION_TYPES = ["Raft Foundation", "Isolated Footing", "Pile Foundation"];

export default function EstimationPage() {
  const router = useRouter();
  const { project, setProject } = useProjectStore();
  
  const [area, setArea] = useState(project.totalBuiltUpArea || 10000);
  const [costSqft, setCostSqft] = useState(project.costPerSqft || 2500);
  const [floors, setFloors] = useState(project.numFloors || 5);
  const [foundation, setFoundation] = useState("Raft Foundation");

  // Cost calculation rules of thumb
  const baseTotal = area * costSqft;
  let foundationMult = 1.0;
  if (foundation === "Pile Foundation") foundationMult = 1.15;
  if (foundation === "Isolated Footing") foundationMult = 0.95;

  const totalCost = baseTotal * foundationMult;
  const civilCost = totalCost * 0.45;
  const finishCost = totalCost * 0.30;
  const mepCost = totalCost * 0.15;
  const siteCost = totalCost * 0.10;

  const chartData = [
    { name: "Civil Works", value: civilCost, color: "#3b82f6" },
    { name: "Finishing", value: finishCost, color: "#10b981" },
    { name: "MEP", value: mepCost, color: "#f59e0b" },
    { name: "Site Works", value: siteCost, color: "#8b5cf6" },
  ];

  const handleGenerateBOQ = () => {
    setProject({
      totalBuiltUpArea: area,
      costPerSqft: costSqft,
      numFloors: floors,
      estimatedCost: totalCost,
    });
    router.push("/dashboard/boq");
  };

  return (
    <div style={{ padding:20, display:"flex", flexDirection:"column", gap:20, animation:"fadeInUp 0.4s ease" }}>
      {/* Top Banner */}
      <div style={{ padding:"16px 24px", background:"linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(37,99,235,0.05) 100%)", borderRadius:12, border:"1px solid rgba(59,130,246,0.2)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", gap:16, alignItems:"center" }}>
          <div style={{ width:48, height:48, background:"#3b82f6", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 15px rgba(59,130,246,0.4)" }}>
            <Calculator size={24} color="#fff"/>
          </div>
          <div>
            <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:"#f1f5f9" }}>Parametric Cost Estimator</h1>
            <span style={{ fontSize:13, color:"#94a3b8" }}>Quickly generate project budgets based on key parameters</span>
          </div>
        </div>
        <button onClick={handleGenerateBOQ} className="btn-primary" style={{ padding:"10px 20px", fontSize:14, background:"linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", boxShadow:"0 4px 15px rgba(37,99,235,0.4)" }}>
          Generate Detailed BOQ <ArrowRight size={16}/>
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"320px 1fr", gap:20 }}>
        {/* Left: Inputs */}
        <div className="card" style={{ padding:24, display:"flex", flexDirection:"column", gap:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:14, fontWeight:700, color:"#f1f5f9", borderBottom:"1px solid #1e2d4a", paddingBottom:12 }}>
            <Settings size={18} color="#60a5fa"/> Project Parameters
          </div>
          
          <div>
            <label className="label">Total Built Up Area (Sqft)</label>
            <input type="number" className="input-field" value={area} onChange={e=>setArea(+e.target.value)} style={{ width:"100%", height:44, fontSize:15, fontWeight:600 }}/>
          </div>

          <div>
            <label className="label">Base Cost per Sqft (₹)</label>
            <input type="number" className="input-field" value={costSqft} onChange={e=>setCostSqft(+e.target.value)} style={{ width:"100%", height:44, fontSize:15, fontWeight:600 }}/>
          </div>

          <div>
            <label className="label">Number of Floors</label>
            <input type="number" className="input-field" value={floors} onChange={e=>setFloors(+e.target.value)} style={{ width:"100%", height:44, fontSize:15, fontWeight:600 }}/>
          </div>

          <div>
            <label className="label">Foundation Type</label>
            <select className="input-field" value={foundation} onChange={e=>setFoundation(e.target.value)} style={{ width:"100%", height:44, fontSize:14, fontWeight:600 }}>
              {FOUNDATION_TYPES.map(f=><option key={f}>{f}</option>)}
            </select>
          </div>
          
          <div style={{ padding:16, background:"rgba(16,185,129,0.1)", borderRadius:8, border:"1px solid rgba(16,185,129,0.2)", marginTop:10 }}>
            <div style={{ fontSize:11, color:"#34d399", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4 }}>Estimated Total Cost</div>
            <div style={{ fontSize:28, fontWeight:900, color:"#10b981" }}>{formatCurrency(totalCost)}</div>
          </div>
        </div>

        {/* Right: Breakdown & Charts */}
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          
          {/* Top Breakdowns */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
            {[
              { label:"Civil Works", val:civilCost, pct:"45%", color:"#3b82f6" },
              { label:"Finishing", val:finishCost, pct:"30%", color:"#10b981" },
              { label:"MEP", val:mepCost, pct:"15%", color:"#f59e0b" },
              { label:"Site Works", val:siteCost, pct:"10%", color:"#8b5cf6" },
            ].map(b => (
              <div key={b.label} className="card-glow" style={{ padding:20, background:"#0d1426", borderRadius:12, border:`1px solid ${b.color}40`, position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:0, left:0, width:4, height:"100%", background:b.color }}/>
                <div style={{ fontSize:12, fontWeight:700, color:"#94a3b8", marginBottom:8 }}>{b.label}</div>
                <div style={{ fontSize:20, fontWeight:800, color:b.color }}>{formatCurrency(b.val)}</div>
                <div style={{ fontSize:11, color:"#64748b", marginTop:4 }}>{b.pct} of Total</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="card" style={{ flex:1, padding:24, display:"flex", gap:24 }}>
            <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
                <PieChartIcon size={18} color="#a78bfa"/> Cost Distribution
              </div>
              <div style={{ flex:1, position:"relative" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value" stroke="none">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: any) => formatCurrency(Number(value))} contentStyle={{ background:"#0c1322", border:"1px solid #1e2d4a", borderRadius:8, fontSize:12 }}/>
                    <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text */}
                <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%, -50%)", textAlign:"center", marginTop:-18 }}>
                  <div style={{ fontSize:11, color:"#64748b", fontWeight:700 }}>TOTAL COST</div>
                  <div style={{ fontSize:14, fontWeight:800, color:"#f1f5f9" }}>₹{(totalCost/10000000).toFixed(2)} Cr</div>
                </div>
              </div>
            </div>

            <div style={{ width:300, background:"rgba(255,255,255,0.02)", borderRadius:12, padding:16, border:"1px solid rgba(255,255,255,0.05)" }}>
               <div style={{ fontSize:13, fontWeight:700, color:"#e2e8f0", marginBottom:16 }}>Cost Highlights</div>
               <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                 <div style={{ padding:12, background:"rgba(59,130,246,0.1)", borderRadius:8 }}>
                   <div style={{ fontSize:11, color:"#60a5fa" }}>Cost per Floor</div>
                   <div style={{ fontSize:15, fontWeight:700, color:"#f1f5f9" }}>{formatCurrency(totalCost / floors)}</div>
                 </div>
                 <div style={{ padding:12, background:"rgba(16,185,129,0.1)", borderRadius:8 }}>
                   <div style={{ fontSize:11, color:"#34d399" }}>Cost per Sqft</div>
                   <div style={{ fontSize:15, fontWeight:700, color:"#f1f5f9" }}>₹{Math.round(totalCost / area).toLocaleString("en-IN")}</div>
                 </div>
                 <div style={{ padding:12, background:"rgba(245,158,11,0.1)", borderRadius:8 }}>
                   <div style={{ fontSize:11, color:"#fbbf24" }}>Foundation Premium</div>
                   <div style={{ fontSize:15, fontWeight:700, color:"#f1f5f9" }}>
                     {foundationMult === 1.0 ? "None" : foundationMult > 1.0 ? `+${Math.round((foundationMult-1)*100)}%` : `${Math.round((foundationMult-1)*100)}%`}
                   </div>
                 </div>
               </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
