import { GanttTask, ProjectDetails } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function CostResourcePanel({ type, tasks, project, theme }: { type: "cost"|"resources", tasks: GanttTask[], project: ProjectDetails, theme: any }) {
  
  if (type === "resources") {
    // Resource Aggregation
    const resMap: Record<string, number> = {};
    tasks.forEach(t => {
      if (!t.resource) return;
      const res = t.resource.split(",")[0].trim(); // take primary
      resMap[res] = (resMap[res] || 0) + t.duration;
    });
    const resData = Object.entries(resMap).map(([name, hours]) => ({ name:name.substring(0,8), hours: hours*8 }));

    return (
      <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
        <div>
          <h4 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", marginBottom:12 }}>Resource Allocation (Hours)</h4>
          <div style={{ height:200, background:"rgba(255,255,255,0.02)", borderRadius:8, border:"1px solid #1e2d4a", padding:10 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" horizontal={false}/>
                <XAxis type="number" tick={{ fontSize:9, fill:"#475569" }}/>
                <YAxis dataKey="name" type="category" tick={{ fontSize:9, fill:"#94a3b8" }} width={60}/>
                <Tooltip contentStyle={{ background:"#111827", border:"1px solid #2a3f6b", borderRadius:8, fontSize:11 }}/>
                <Bar dataKey="hours" fill={theme.purple} radius={[0,3,3,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div>
          <h4 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", marginBottom:12 }}>Active Assignments</h4>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {tasks.filter(t => t.status==="in-progress" && t.resource).slice(0,6).map(t => (
              <div key={t.id} style={{ display:"flex", justifyContent:"space-between", padding:8, background:"rgba(255,255,255,0.02)", borderRadius:6, border:"1px solid #1e2d4a", fontSize:11 }}>
                <span style={{ color:"#e2e8f0" }}>{t.resource}</span>
                <span style={{ color:"#94a3b8" }}>{t.name.substring(0,12)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Cost Type
  const totalCost = project.totalBuiltUpArea * project.costPerSqft;
  const evm = [
    { name: "Budget (BAC)", value: totalCost, color: theme.blue },
    { name: "Planned (PV)", value: totalCost * 0.45, color: theme.gray },
    { name: "Earned (EV)", value: totalCost * 0.39, color: theme.green },
    { name: "Actual (AC)", value: totalCost * 0.42, color: theme.red },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <h4 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", marginBottom:12 }}>Earned Value Metrics</h4>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {evm.map(m => (
            <div key={m.name} style={{ padding:12, background:"rgba(255,255,255,0.03)", borderRadius:8, border:`1px solid ${m.color}40` }}>
              <div style={{ fontSize:10, color:m.color, fontWeight:700, textTransform:"uppercase" }}>{m.name}</div>
              <div style={{ fontSize:14, fontWeight:800, color:"#f1f5f9", marginTop:4 }}>{formatCurrency(m.value)}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", marginBottom:12 }}>Cost Distribution</h4>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[
            { label:"Material Cost", pct:60, color:theme.blue },
            { label:"Labor Cost", pct:25, color:theme.orange },
            { label:"Equipment", pct:15, color:theme.purple },
          ].map(c => (
            <div key={c.label}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:4 }}>
                <span style={{ color:"#94a3b8" }}>{c.label}</span>
                <span style={{ color:"#f1f5f9", fontWeight:700 }}>{c.pct}%</span>
              </div>
              <div style={{ height:6, background:"rgba(255,255,255,0.1)", borderRadius:3 }}>
                <div style={{ height:"100%", width:`${c.pct}%`, background:c.color, borderRadius:3 }}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
