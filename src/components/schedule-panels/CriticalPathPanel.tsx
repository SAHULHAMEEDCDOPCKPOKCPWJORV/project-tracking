import { GanttTask } from "@/lib/store";

export default function CriticalPathPanel({ tasks, theme }: { tasks: GanttTask[], theme: any }) {
  const criticalTasks = tasks.filter(t => t.isCritical);
  const zeroFloat = tasks.filter(t => t.float === 0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <div style={{ padding:12, background:"rgba(239,68,68,0.1)", borderRadius:8, border:`1px solid ${theme.red}33` }}>
          <div style={{ fontSize:10, color:theme.red, fontWeight:700, textTransform:"uppercase" }}>Critical Activities</div>
          <div style={{ fontSize:20, fontWeight:800, color:"#f1f5f9", marginTop:4 }}>{criticalTasks.length}</div>
        </div>
        <div style={{ padding:12, background:"rgba(245,158,11,0.1)", borderRadius:8, border:"1px solid rgba(245,158,11,0.3)" }}>
          <div style={{ fontSize:10, color:"#f59e0b", fontWeight:700, textTransform:"uppercase" }}>Zero Float Tasks</div>
          <div style={{ fontSize:20, fontWeight:800, color:"#f1f5f9", marginTop:4 }}>{zeroFloat.length}</div>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", marginBottom:12 }}>Critical Path Network</h4>
        <div style={{ background:"rgba(255,255,255,0.02)", borderRadius:8, border:"1px solid #1e2d4a", padding:16 }}>
          {criticalTasks.slice(0,8).map((t, i) => (
            <div key={t.id} style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
              <div style={{ padding:"6px 12px", background:`${theme.red}15`, border:`1px solid ${theme.red}50`, borderRadius:6, color:theme.red, fontSize:11, fontWeight:700, width:"100%", textAlign:"center" }}>
                {t.name}
              </div>
              {i < Math.min(criticalTasks.length, 8) - 1 && (
                <div style={{ width:2, height:16, background:theme.red, opacity:0.5, margin:"2px 0" }}/>
              )}
            </div>
          ))}
          {criticalTasks.length > 8 && <div style={{ textAlign:"center", fontSize:10, color:"#64748b", marginTop:8 }}>+ {criticalTasks.length - 8} more activities</div>}
        </div>
      </div>

      <div>
        <h4 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", marginBottom:12 }}>Critical Delay Impact</h4>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {criticalTasks.slice(0,5).map(t => (
            <div key={t.id} style={{ display:"flex", justifyContent:"space-between", padding:8, background:"rgba(255,255,255,0.02)", borderRadius:6, border:"1px solid #1e2d4a", fontSize:11 }}>
              <span style={{ color:"#e2e8f0" }}>{t.name}</span>
              <span style={{ color:theme.red, fontWeight:700 }}>0d Float</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
