import { GanttTask } from "@/lib/store";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function FloatSlackPanel({ tasks, theme }: { tasks: GanttTask[], theme: any }) {
  const floatData = tasks.filter(t => !t.isCritical && t.float > 0).slice(0, 10).map(t => ({
    name: t.name.substring(0,10),
    float: t.float
  }));

  const zeroFloatCount = tasks.filter(t => t.float === 0).length;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ padding:12, background:"rgba(16,185,129,0.1)", borderRadius:8, border:`1px solid ${theme.green}33` }}>
        <div style={{ fontSize:10, color:theme.green, fontWeight:700, textTransform:"uppercase" }}>Total Positive Float</div>
        <div style={{ fontSize:20, fontWeight:800, color:"#f1f5f9", marginTop:4 }}>
          {tasks.reduce((sum, t) => sum + (t.isCritical ? 0 : t.float), 0)} Days
        </div>
      </div>

      <div>
        <h4 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", marginBottom:12 }}>Float Timeline (Days)</h4>
        <div style={{ height:200, background:"rgba(255,255,255,0.02)", borderRadius:8, border:"1px solid #1e2d4a", padding:10 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={floatData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" horizontal={false}/>
              <XAxis type="number" tick={{ fontSize:9, fill:"#475569" }}/>
              <YAxis dataKey="name" type="category" tick={{ fontSize:9, fill:"#94a3b8" }} width={60}/>
              <Tooltip contentStyle={{ background:"#111827", border:"1px solid #2a3f6b", borderRadius:8, fontSize:11 }}/>
              <Bar dataKey="float" fill={theme.green} radius={[0,3,3,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", marginBottom:12 }}>Zero Float Activities</h4>
        <div style={{ display:"flex", justifyContent:"space-between", padding:8, background:"rgba(239,68,68,0.1)", borderRadius:6, border:`1px solid ${theme.red}33`, fontSize:11 }}>
          <span style={{ color:theme.red }}>Critical Path Tasks</span>
          <span style={{ color:theme.red, fontWeight:700 }}>{zeroFloatCount} Tasks</span>
        </div>
      </div>
    </div>
  );
}
