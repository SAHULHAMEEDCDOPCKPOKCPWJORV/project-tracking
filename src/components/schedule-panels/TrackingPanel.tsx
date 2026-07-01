import { GanttTask } from "@/lib/store";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function TrackingPanel({ tasks, theme }: { tasks: GanttTask[], theme: any }) {
  const activeTasks = tasks.filter(t => t.status === "in-progress");
  
  const sCurveData = Array.from({ length: 12 }, (_, i) => ({
    week: `W${i+1}`,
    planned: Math.round(Math.pow(i/11, 0.6) * 100),
    actual: i < 6 ? Math.round(Math.pow(i/11, 0.8) * 90) : undefined
  }));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <h4 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", marginBottom:12 }}>S-Curve Progress</h4>
        <div style={{ height:200, background:"rgba(255,255,255,0.02)", borderRadius:8, border:"1px solid #1e2d4a", padding:10 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sCurveData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a"/>
              <XAxis dataKey="week" tick={{ fontSize:9, fill:"#475569" }}/>
              <YAxis tick={{ fontSize:9, fill:"#475569" }}/>
              <Tooltip contentStyle={{ background:"#111827", border:"1px solid #2a3f6b", borderRadius:8, fontSize:11 }}/>
              <Line type="monotone" dataKey="planned" stroke={theme.blue} strokeDasharray="4 4" dot={false} name="Planned %"/>
              <Line type="monotone" dataKey="actual" stroke={theme.green} strokeWidth={2} name="Actual %"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", marginBottom:12 }}>Active Tasks Status</h4>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {activeTasks.map(t => (
            <div key={t.id}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:4 }}>
                <span style={{ color:"#e2e8f0" }}>{t.name}</span>
                <span style={{ color:theme.green, fontWeight:700 }}>{t.progress}%</span>
              </div>
              <div style={{ height:6, background:"rgba(255,255,255,0.1)", borderRadius:3 }}>
                <div style={{ height:"100%", width:`${t.progress}%`, background:theme.green, borderRadius:3 }}/>
              </div>
              <div style={{ fontSize:9, color:"#64748b", marginTop:4 }}>
                Remaining: {t.duration - Math.round(t.duration * t.progress / 100)} days
              </div>
            </div>
          ))}
          {activeTasks.length === 0 && <div style={{ fontSize:11, color:"#64748b" }}>No active tasks.</div>}
        </div>
      </div>
    </div>
  );
}
