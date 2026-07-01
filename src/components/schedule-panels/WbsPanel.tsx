import { GanttTask } from "@/lib/store";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function WbsPanel({ tasks }: { tasks: GanttTask[] }) {
  const wbsRoots = tasks.filter(t => t.level === 0);
  
  const pieData = Object.entries(
    tasks.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#06b6d4"];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <h4 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", marginBottom:12 }}>Activities by WBS Category</h4>
        <div style={{ height:240, background:"rgba(255,255,255,0.02)", borderRadius:8, border:"1px solid #1e2d4a" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {pieData.map((e, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background:"#111827", border:"1px solid #2a3f6b", borderRadius:8, fontSize:11 }}/>
              <Legend wrapperStyle={{ fontSize:11 }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", marginBottom:12 }}>WBS Tree Overview</h4>
        <div style={{ background:"rgba(255,255,255,0.02)", borderRadius:8, border:"1px solid #1e2d4a", padding:12, fontSize:12, color:"#94a3b8" }}>
          <div style={{ fontWeight:700, color:"#f1f5f9", marginBottom:8 }}>Construction Project</div>
          {wbsRoots.map(r => (
            <div key={r.id} style={{ marginBottom:6 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ color:"#3b82f6" }}>├──</span> {r.name}
              </div>
              {tasks.filter(c => c.parentId === r.id).map(c => (
                <div key={c.id} style={{ marginLeft:20, display:"flex", alignItems:"center", gap:6, color:"#64748b" }}>
                  <span>├</span> {c.name}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
