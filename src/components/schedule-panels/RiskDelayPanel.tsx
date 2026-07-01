import { GanttTask } from "@/lib/store";

export default function RiskDelayPanel({ tasks, theme }: { tasks: GanttTask[], theme: any }) {
  const delayed = tasks.filter(t => t.status === "delayed");

  const RISKS = [
    { name: "Rain Delay", prob: "High", impact: "High", color: theme.red },
    { name: "Material Shortage", prob: "Medium", impact: "High", color: theme.orange },
    { name: "Labor Strike", prob: "Low", impact: "High", color: theme.yellow },
    { name: "Design Changes", prob: "Medium", impact: "Medium", color: theme.blue },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <h4 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", marginBottom:12 }}>Delayed Activities</h4>
        {delayed.length > 0 ? (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {delayed.map(t => (
              <div key={t.id} style={{ padding:10, background:"rgba(249,115,22,0.1)", borderRadius:8, border:`1px solid ${theme.orange}40` }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, fontWeight:700, color:theme.orange }}>
                  <span>{t.name}</span>
                  <span>{t.float < 0 ? `${Math.abs(t.float)}d Late` : "At Risk"}</span>
                </div>
                <div style={{ fontSize:10, color:"#94a3b8", marginTop:4 }}>Impacts successor tasks on critical path.</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize:11, color:theme.green, padding:10, background:"rgba(16,185,129,0.1)", borderRadius:8 }}>
            ✓ No delayed activities currently tracked.
          </div>
        )}
      </div>

      <div>
        <h4 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", marginBottom:12 }}>Risk Matrix</h4>
        <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:4 }}>
          <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", textAlign:"center", fontSize:10, color:"#64748b", paddingRight:4 }}>Probability</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gridTemplateRows:"1fr 1fr 1fr", gap:4, height:150 }}>
            <div style={{ background:theme.yellow, opacity:0.3, borderRadius:4 }}/>
            <div style={{ background:theme.orange, opacity:0.3, borderRadius:4 }}/>
            <div style={{ background:theme.red, opacity:0.4, borderRadius:4, position:"relative" }}>
              <span style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🌧</span>
            </div>
            
            <div style={{ background:theme.green, opacity:0.2, borderRadius:4 }}/>
            <div style={{ background:theme.yellow, opacity:0.3, borderRadius:4, position:"relative" }}>
              <span style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🧱</span>
            </div>
            <div style={{ background:theme.orange, opacity:0.3, borderRadius:4 }}/>
            
            <div style={{ background:theme.green, opacity:0.2, borderRadius:4 }}/>
            <div style={{ background:theme.green, opacity:0.2, borderRadius:4 }}/>
            <div style={{ background:theme.yellow, opacity:0.3, borderRadius:4, position:"relative" }}>
              <span style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>👷</span>
            </div>
          </div>
        </div>
        <div style={{ textAlign:"center", fontSize:10, color:"#64748b", marginTop:4 }}>Impact</div>
      </div>

      <div>
        <h4 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", marginBottom:12 }}>Risk Register</h4>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {RISKS.map(r => (
            <div key={r.name} style={{ display:"flex", justifyContent:"space-between", padding:8, background:"rgba(255,255,255,0.02)", borderRadius:6, border:"1px solid #1e2d4a", fontSize:11 }}>
              <span style={{ color:"#e2e8f0" }}>{r.name}</span>
              <span style={{ color:r.color, fontWeight:700 }}>{r.prob}/{r.impact}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
