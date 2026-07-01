import { GanttTask } from "@/lib/store";
import { parseDate, daysBetween } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function BaselinePanel({ tasks, theme }: { tasks: GanttTask[], theme: any }) {
  const tasksWithBaseline = tasks.filter(t => t.baselineEnd && t.end);
  
  const varianceData = tasksWithBaseline.slice(0, 10).map(t => {
    const v = daysBetween(parseDate(t.baselineEnd!), parseDate(t.end));
    return { name: t.name.substring(0, 10), variance: v };
  });

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <h4 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", marginBottom:12 }}>Variance Chart (Days)</h4>
        <div style={{ height:200, background:"rgba(255,255,255,0.02)", borderRadius:8, border:"1px solid #1e2d4a", padding:10 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={varianceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a"/>
              <XAxis dataKey="name" tick={{ fontSize:9, fill:"#475569" }}/>
              <YAxis tick={{ fontSize:9, fill:"#475569" }}/>
              <Tooltip contentStyle={{ background:"#111827", border:"1px solid #2a3f6b", borderRadius:8, fontSize:11 }}/>
              <Bar dataKey="variance" fill={theme.orange}>
                {/* Could map cells to colors based on +/- but standard recharts Bar handles it ok */}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", marginBottom:12 }}>Baseline Comparison</h4>
        <table style={{ width:"100%", fontSize:11, textAlign:"left", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ color:"#64748b", borderBottom:"1px solid #1e2d4a" }}>
              <th style={{ padding:6 }}>Task</th>
              <th style={{ padding:6 }}>Base Finish</th>
              <th style={{ padding:6 }}>Act Finish</th>
              <th style={{ padding:6 }}>Var</th>
            </tr>
          </thead>
          <tbody>
            {tasksWithBaseline.slice(0,10).map(t => {
              const v = daysBetween(parseDate(t.baselineEnd!), parseDate(t.end));
              return (
                <tr key={t.id} style={{ borderBottom:"1px solid rgba(30,45,74,0.4)" }}>
                  <td style={{ padding:6, color:"#e2e8f0" }}>{t.name.substring(0,15)}</td>
                  <td style={{ padding:6, color:"#94a3b8" }}>{t.baselineEnd}</td>
                  <td style={{ padding:6, color:"#94a3b8" }}>{t.end}</td>
                  <td style={{ padding:6, fontWeight:700, color: v>0 ? theme.red : v<0 ? theme.green : "#94a3b8" }}>
                    {v>0 ? `+${v}d` : `${v}d`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
