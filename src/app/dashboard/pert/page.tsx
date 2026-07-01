"use client";
import { useState, useEffect, useRef } from "react";
import { useGanttStore, useProjectStore, GanttTask } from "@/lib/store";
import { generateGanttTasks } from "@/lib/gantt-engine";
import { parseDate, addDays } from "@/lib/utils";
import { ZoomIn, ZoomOut, RefreshCw, Info } from "lucide-react";

interface PERTData extends GanttTask {
  optimistic: number;
  mostLikely: number;
  pessimistic: number;
  expectedTime: number;
  variance: number;
  x: number;
  y: number;
}

export default function PERTPage() {
  const { project } = useProjectStore();
  const { tasks, setTasks } = useGanttStore();
  const svgRef = useRef<SVGSVGElement>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (tasks.length === 0) setTasks(generateGanttTasks(project));
  }, []);

  // Generate PERT data with O/M/P values
  const pertTasks: PERTData[] = tasks.slice(0, 28).map((t, i) => {
    const o = Math.max(1, t.duration - Math.floor(t.duration * 0.3));
    const m = t.duration;
    const p = t.duration + Math.floor(t.duration * 0.5);
    const te = parseFloat(((o + 4 * m + p) / 6).toFixed(2));
    const variance = parseFloat((((p - o) / 6) ** 2).toFixed(2));

    // Auto-layout: columns based on depth
    const col = i % 6;
    const row = Math.floor(i / 6);
    return {
      ...t,
      optimistic: o, mostLikely: m, pessimistic: p,
      expectedTime: te, variance,
      x: 60 + col * 240,
      y: 80 + row * 140,
    };
  });

  const selectedTask = pertTasks.find(t => t.id === selected);

  function handleSVGMouseDown(e: React.MouseEvent) {
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }
  function handleSVGMouseMove(e: React.MouseEvent) {
    if (!dragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }
  function handleSVGMouseUp() { setDragging(false); }

  const NODE_W = 200, NODE_H = 110;

  function getNodeColor(t: PERTData) {
    if (t.isCritical) return { bg: "rgba(239,68,68,0.12)", border: "#ef4444", text: "#fca5a5" };
    return { bg: "rgba(59,130,246,0.1)", border: "#3b82f6", text: "#60a5fa" };
  }

  // Draw dependency arrows
  function Arrow({ from, to }: { from: PERTData; to: PERTData }) {
    const x1 = from.x + NODE_W, y1 = from.y + NODE_H / 2;
    const x2 = to.x, y2 = to.y + NODE_H / 2;
    const mx = (x1 + x2) / 2;
    const color = (from.isCritical && to.isCritical) ? "#ef4444" : "#2a3f6b";
    return (
      <g>
        <defs>
          <marker id={`arrow-${from.id}-${to.id}`} viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color}/>
          </marker>
        </defs>
        <path d={`M ${x1} ${y1} C ${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`}
          stroke={color} strokeWidth={from.isCritical && to.isCritical ? 2 : 1.5}
          fill="none" strokeDasharray={from.isCritical && to.isCritical ? undefined : "4 3"}
          markerEnd={`url(#arrow-${from.id}-${to.id})`} opacity={0.8}/>
      </g>
    );
  }

  return (
    <div style={{ height:"calc(100vh - 56px)", display:"flex", overflow:"hidden" }}>

      {/* ── SVG PERT Canvas ───────────────────────────── */}
      <div style={{ flex:1, position:"relative", overflow:"hidden", background:"#080c18",
        cursor: dragging ? "grabbing" : "grab" }}>

        {/* Toolbar */}
        <div style={{ position:"absolute", top:16, left:16, zIndex:10, display:"flex", gap:8 }}>
          <button className="btn-secondary" onClick={() => setScale(s => Math.min(2, s+0.1))} style={{ padding:"6px 10px" }}>
            <ZoomIn size={14}/>
          </button>
          <span style={{ padding:"6px 12px", background:"rgba(15,22,41,0.8)", borderRadius:8,
            border:"1px solid #1e2d4a", fontSize:12, color:"#94a3b8" }}>
            {Math.round(scale*100)}%
          </span>
          <button className="btn-secondary" onClick={() => setScale(s => Math.max(0.3, s-0.1))} style={{ padding:"6px 10px" }}>
            <ZoomOut size={14}/>
          </button>
          <button className="btn-secondary" onClick={() => { setScale(1); setPan({x:0,y:0}); }} style={{ padding:"6px 10px" }}>
            <RefreshCw size={14}/>
          </button>
        </div>

        {/* PERT Formulas panel */}
        <div style={{ position:"absolute", top:16, right:16, zIndex:10, width:200,
          background:"rgba(15,22,41,0.95)", borderRadius:10, border:"1px solid #1e2d4a", padding:14 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#60a5fa", marginBottom:10 }}>PERT Formulas</div>
          {[
            { f:"TE = (O + 4M + P) / 6", d:"Expected Time" },
            { f:"σ² = ((P - O) / 6)²", d:"Variance" },
            { f:"Slack = LS – ES", d:"Float/Slack" },
            { f:"Critical path: chain with zero float", d:"" },
          ].map(x => (
            <div key={x.f} style={{ marginBottom:8 }}>
              <div style={{ fontSize:10, fontFamily:"monospace", color:"#34d399", background:"rgba(16,185,129,0.1)",
                padding:"2px 6px", borderRadius:4 }}>{x.f}</div>
              {x.d && <div style={{ fontSize:10, color:"#475569", marginTop:2 }}>{x.d}</div>}
            </div>
          ))}
        </div>

        {/* Critical Activities list */}
        <div style={{ position:"absolute", bottom:16, right:16, zIndex:10, width:200,
          background:"rgba(15,22,41,0.95)", borderRadius:10, border:"1px solid #1e2d4a", padding:14,
          maxHeight:300, overflowY:"auto" }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#f87171", marginBottom:10 }}>Critical Activities</div>
          {pertTasks.filter(t => t.isCritical).map(t => (
            <div key={t.id} onClick={() => setSelected(t.id)}
              style={{ display:"flex", gap:6, alignItems:"center", marginBottom:6, cursor:"pointer",
                color: selected===t.id ? "#60a5fa" : "#94a3b8" }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#ef4444", flexShrink:0 }}/>
              <span style={{ fontSize:10 }}>{t.id} {t.name.substring(0,22)}...</span>
            </div>
          ))}
        </div>

        <svg ref={svgRef} width="100%" height="100%"
          onMouseDown={handleSVGMouseDown}
          onMouseMove={handleSVGMouseMove}
          onMouseUp={handleSVGMouseUp}
          onMouseLeave={handleSVGMouseUp}
          onWheel={e => setScale(s => Math.max(0.3, Math.min(2, s - e.deltaY * 0.001)))}>

          {/* Background grid */}
          <defs>
            <pattern id="pgrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(30,45,74,0.4)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pgrid)"/>

          <g transform={`translate(${pan.x},${pan.y}) scale(${scale})`}>

            {/* Arrows */}
            {pertTasks.map(t =>
              t.predecessors.map(pid => {
                const pred = pertTasks.find(p => p.id === pid);
                if (!pred) return null;
                return <Arrow key={`${pid}-${t.id}`} from={pred} to={t}/>;
              })
            )}

            {/* Nodes */}
            {pertTasks.map(t => {
              const { bg, border, text } = getNodeColor(t);
              const isSel = selected === t.id;
              return (
                <g key={t.id} transform={`translate(${t.x},${t.y})`}
                  onClick={() => setSelected(t.id)} style={{ cursor:"pointer" }}>

                  {/* Node box */}
                  <rect width={NODE_W} height={NODE_H} rx={8} ry={8}
                    fill={bg} stroke={isSel ? "#60a5fa" : border}
                    strokeWidth={isSel ? 2.5 : 1.5}/>
                  {isSel && <rect width={NODE_W} height={NODE_H} rx={8} ry={8}
                    fill="none" stroke="#60a5fa" strokeWidth={4} opacity={0.2}/>}

                  {/* Header */}
                  <rect width={NODE_W} height={22} rx={8} ry={8} fill={`${border}22`}/>
                  <rect y={14} width={NODE_W} height={8} fill={`${border}22`}/>

                  {/* ID + Name */}
                  <text x={8} y={14} fontSize={9} fontWeight="bold" fill={text}>{t.id}</text>
                  <text x={NODE_W/2} y={14} fontSize={9} fontWeight="bold" fill="#f1f5f9"
                    textAnchor="middle">{t.name.substring(0,22)}{t.name.length>22?"…":""}</text>

                  {/* O / M / P */}
                  <text x={8} y={36} fontSize={8} fill="#64748b">O={t.optimistic}d M={t.mostLikely}d P={t.pessimistic}d</text>

                  {/* TE / Variance */}
                  <text x={8} y={52} fontSize={9} fill="#34d399" fontWeight="bold">
                    TE={t.expectedTime}d  σ²={t.variance}
                  </text>

                  {/* Float */}
                  <text x={8} y={67} fontSize={8} fill={t.float===0?"#f87171":"#94a3b8"}>
                    Float: {t.float}d · {t.isCritical?"CRITICAL":"Non-critical"}
                  </text>

                  {/* Dates */}
                  <text x={8} y={82} fontSize={7.5} fill="#475569">
                    {t.start} → {t.end}
                  </text>

                  {/* Status bar */}
                  <rect x={8} y={90} width={NODE_W-16} height={12} rx={3} fill="rgba(255,255,255,0.05)"/>
                  <rect x={8} y={90} width={Math.max(4,(NODE_W-16)*t.progress/100)} height={12} rx={3}
                    fill={t.isCritical?"#ef4444":"#3b82f6"} opacity={0.7}/>
                  <text x={NODE_W/2} y={100} fontSize={7.5} fill="white" textAnchor="middle">
                    {t.progress}%
                  </text>

                  {/* Critical glow */}
                  {t.isCritical && (
                    <rect width={NODE_W} height={NODE_H} rx={8} ry={8}
                      fill="none" stroke="#ef4444" strokeWidth={1} opacity={0.4}
                      style={{ filter:"drop-shadow(0 0 8px #ef444488)" }}/>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* ── Right Panel ───────────────────────────────── */}
      <div style={{ width:280, borderLeft:"1px solid #1e2d4a", background:"#0d1426",
        overflowY:"auto", padding:16 }}>

        <div style={{ fontSize:13, fontWeight:700, marginBottom:16, color:"#f1f5f9" }}>PERT Analysis</div>

        {selectedTask ? (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ padding:12, background:"rgba(59,130,246,0.08)", borderRadius:8,
              border:"1px solid rgba(59,130,246,0.2)" }}>
              <div style={{ fontSize:10, color:"#64748b", fontWeight:600 }}>SELECTED ACTIVITY</div>
              <div style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", marginTop:4 }}>{selectedTask.name}</div>
              <div style={{ fontSize:11, color:"#94a3b8" }}>{selectedTask.wbsId}</div>
            </div>

            {[
              { label:"Optimistic (O)", value:`${selectedTask.optimistic} days`, color:"#10b981" },
              { label:"Most Likely (M)", value:`${selectedTask.mostLikely} days`, color:"#3b82f6" },
              { label:"Pessimistic (P)", value:`${selectedTask.pessimistic} days`, color:"#ef4444" },
              { label:"Expected Time (TE)", value:`${selectedTask.expectedTime} days`, color:"#60a5fa" },
              { label:"Variance (σ²)", value:selectedTask.variance.toString(), color:"#f59e0b" },
              { label:"Float / Slack", value:`${selectedTask.float} days`, color: selectedTask.float===0?"#ef4444":"#10b981" },
              { label:"Start", value:selectedTask.start, color:"#94a3b8" },
              { label:"Finish", value:selectedTask.end, color:"#94a3b8" },
              { label:"Resource", value:selectedTask.resource, color:"#94a3b8" },
            ].map(x => (
              <div key={x.label} style={{ display:"flex", justifyContent:"space-between",
                alignItems:"center", padding:"8px 10px", background:"rgba(255,255,255,0.02)",
                borderRadius:6, border:"1px solid #1e2d4a" }}>
                <span style={{ fontSize:11, color:"#64748b" }}>{x.label}</span>
                <span style={{ fontSize:12, fontWeight:700, color:x.color }}>{x.value}</span>
              </div>
            ))}

            {selectedTask.isCritical && (
              <div style={{ padding:10, background:"rgba(239,68,68,0.1)", borderRadius:8,
                border:"1px solid rgba(239,68,68,0.3)" }}>
                <div style={{ fontSize:11, color:"#f87171", fontWeight:700 }}>
                  ⚠ Critical Path Activity
                </div>
                <div style={{ fontSize:10, color:"#94a3b8", marginTop:4 }}>
                  Any delay in this task will delay the project completion date.
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign:"center", padding:"40px 20px", color:"#475569" }}>
            <Info size={32} style={{ margin:"0 auto 12px", display:"block" }}/>
            <p style={{ fontSize:13 }}>Click any node to view PERT details</p>
          </div>
        )}

        <hr style={{ border:"none", borderTop:"1px solid #1e2d4a", margin:"16px 0" }}/>

        {/* Summary stats */}
        <div style={{ fontSize:12, fontWeight:700, color:"#94a3b8", marginBottom:10 }}>Project PERT Summary</div>
        {[
          { label:"Total Activities", value:pertTasks.length },
          { label:"Critical Activities", value:pertTasks.filter(t=>t.isCritical).length },
          { label:"Critical %", value:`${Math.round(pertTasks.filter(t=>t.isCritical).length/pertTasks.length*100)}%` },
          { label:"Avg Expected Time", value:`${(pertTasks.reduce((s,t)=>s+t.expectedTime,0)/pertTasks.length).toFixed(1)}d` },
          { label:"Total Variance", value:(pertTasks.filter(t=>t.isCritical).reduce((s,t)=>s+t.variance,0)).toFixed(2) },
        ].map(x => (
          <div key={x.label} style={{ display:"flex", justifyContent:"space-between",
            marginBottom:6, fontSize:12 }}>
            <span style={{ color:"#64748b" }}>{x.label}</span>
            <span style={{ fontWeight:700, color:"#f1f5f9" }}>{x.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
