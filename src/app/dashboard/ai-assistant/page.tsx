"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, RefreshCw } from "lucide-react";
import { useProjectStore, useBOQStore } from "@/lib/store";
import { generateBOQ } from "@/lib/gantt-engine";

type Msg = { role:"user"|"assistant"; content:string; ts:string };

const CANNED: Record<string,string> = {
  "what is the project status": "Based on the current schedule data, the project is approximately **38% complete** as of today. The critical path runs through the structural works. Schedule Performance Index (SPI) = 0.84, indicating a slight delay. Recommend accelerating Column & Slab activities on Floor 2.",
  "what is the budget": "The current total BOQ value is approximately **₹2.4 Crore**. Against a budget of ₹2.4Cr, the current actual spend is ₹98.4L (41%). Cost Performance Index (CPI) = 0.93. The project is slightly over budget. Review steel and concrete costs.",
  "critical path": "The critical path currently runs through: **Foundation → GF Columns → GF Slab → FF Columns → FF Slab → Structural Complete → Brickwork → Plastering → Handover**. Total float on critical tasks = 0 days. Monitor daily.",
  "labour productivity": "Current labour strength is **42 workers** on site. Average daily productivity is at 78% of planned levels. Masonry trade shows the lowest productivity at 68%. Recommend adding 4 extra masons to recover the 3-day delay in brickwork.",
  "material forecast": "Based on current consumption rates, you will need to place a **cement order** in approximately 12 days (current stock: 500 bags, daily consumption: ~40 bags). **Steel** stock is adequate for 18 more days of structural work.",
  "delay prediction": "AI analysis predicts a **14-day delay** in project completion if the current productivity trend continues. Key risk: Brickwork is 8 days behind. Mitigation: Increase masonry gang from 4 to 7 workers, work 6 days/week.",
  "cash flow": "Projected cash outflow for next 30 days: **₹28.5L**. Largest expenses: Labour (₹8.2L), Steel procurement (₹12.0L), Concrete (₹5.4L). Ensure client billing for Milestone 2 is submitted this week to maintain positive cash flow.",
  "risk": "Top 3 project risks identified:\n1. **Schedule Risk** (High): Structural delays cascading to finishes.\n2. **Cost Risk** (Medium): Steel prices risen 3% since estimate.\n3. **Quality Risk** (Low): 1 open NCR on slab shuttering — clear before pour.",
};

function getAIResponse(question: string): string {
  const q = question.toLowerCase().trim();
  for (const [key, resp] of Object.entries(CANNED)) {
    if (q.includes(key) || key.split(" ").some(w => q.includes(w))) return resp;
  }
  return "I'm analyzing your project data… Based on the current BOQ, schedule, and cost data in BuildTrack Pro, I can help you with: project status, budget analysis, critical path, labour productivity, material forecasting, delay prediction, cash flow, and risk assessment. Please ask a specific question!";
}

const SUGGESTIONS = [
  "What is the project status?",
  "What is the budget?",
  "Show critical path",
  "Labour productivity report",
  "Material forecast",
  "Delay prediction",
  "Cash flow summary",
  "Risk analysis",
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role:"assistant", content:"Hello! I'm your **BuildTrack AI Assistant** 🤖. I have full access to your project data including BOQ, schedule, labour, materials, costs, and more. Ask me anything about your project!", ts:new Date().toLocaleTimeString() }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const send = (text?: string) => {
    const msg = (text||input).trim();
    if (!msg) return;
    const ts = new Date().toLocaleTimeString();
    setMessages(prev=>[...prev, { role:"user", content:msg, ts }]);
    setInput("");
    setLoading(true);
    setTimeout(()=>{
      const resp = getAIResponse(msg);
      setMessages(prev=>[...prev, { role:"assistant", content:resp, ts:new Date().toLocaleTimeString() }]);
      setLoading(false);
    }, 800);
  };

  const formatContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      const formatted = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} style={{ marginBottom:4 }} dangerouslySetInnerHTML={{ __html:formatted }}/>;
    });
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 56px)" }}>
      {/* Header */}
      <div style={{ padding:"16px 20px", borderBottom:"1px solid #1e2d4a", background:"rgba(13,20,38,0.95)", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:40, height:40, borderRadius:12, background:"linear-gradient(135deg,#2563eb,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Sparkles size={20} color="white"/>
        </div>
        <div>
          <div style={{ fontWeight:800, color:"#f1f5f9" }}>BuildTrack AI Assistant</div>
          <div style={{ fontSize:11, color:"#64748b" }}>Powered by project intelligence · Real-time data analysis</div>
        </div>
        <button onClick={()=>setMessages([{ role:"assistant", content:"Conversation cleared. How can I help you?", ts:new Date().toLocaleTimeString() }])} className="btn-secondary" style={{ marginLeft:"auto", fontSize:12 }}>
          <RefreshCw size={12}/> Clear
        </button>
      </div>

      {/* Suggestions */}
      <div style={{ padding:"12px 20px", borderBottom:"1px solid #1e2d4a", display:"flex", gap:8, flexWrap:"wrap", background:"rgba(10,14,26,0.8)" }}>
        {SUGGESTIONS.map(s=>(
          <button key={s} onClick={()=>send(s)} style={{ padding:"5px 12px", borderRadius:20, border:"1px solid #1e2d4a", background:"rgba(59,130,246,0.05)", color:"#94a3b8", fontSize:11, cursor:"pointer", transition:"all 0.15s" }}
            onMouseEnter={e=>{(e.target as any).style.borderColor="#3b82f6";(e.target as any).style.color="#60a5fa";}}
            onMouseLeave={e=>{(e.target as any).style.borderColor="#1e2d4a";(e.target as any).style.color="#94a3b8";}}>
            {s}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", padding:"20px", display:"flex", flexDirection:"column", gap:16 }}>
        {messages.map((m,i)=>(
          <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", flexDirection:m.role==="user"?"row-reverse":"row" }}>
            <div style={{ width:34, height:34, borderRadius:10, flexShrink:0, background:m.role==="assistant"?"linear-gradient(135deg,#2563eb,#7c3aed)":"rgba(59,130,246,0.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {m.role==="assistant" ? <Bot size={16} color="white"/> : <User size={16} color="#60a5fa"/>}
            </div>
            <div style={{ maxWidth:"70%", padding:"12px 16px", borderRadius:m.role==="user"?"12px 12px 4px 12px":"12px 12px 12px 4px", background:m.role==="assistant"?"rgba(15,22,41,0.9)":"rgba(59,130,246,0.12)", border:"1px solid", borderColor:m.role==="assistant"?"#1e2d4a":"rgba(59,130,246,0.25)" }}>
              <div style={{ fontSize:13, color:"#f1f5f9", lineHeight:1.6 }}>{formatContent(m.content)}</div>
              <div style={{ fontSize:10, color:"#475569", marginTop:6 }}>{m.ts}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
            <div style={{ width:34, height:34, borderRadius:10, background:"linear-gradient(135deg,#2563eb,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Bot size={16} color="white"/>
            </div>
            <div style={{ padding:"12px 16px", borderRadius:"12px 12px 12px 4px", background:"rgba(15,22,41,0.9)", border:"1px solid #1e2d4a" }}>
              <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                {[0,1,2].map(n=>(
                  <div key={n} style={{ width:8, height:8, borderRadius:"50%", background:"#3b82f6", animation:`pulse-glow 1.2s ${n*0.2}s infinite` }}/>
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{ padding:"16px 20px", borderTop:"1px solid #1e2d4a", background:"rgba(13,20,38,0.95)", display:"flex", gap:12 }}>
        <input className="input-field" placeholder="Ask about your project… e.g. 'What is the current budget status?'" value={input}
          onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
          style={{ flex:1, height:44, fontSize:13 }}/>
        <button onClick={()=>send()} className="btn-primary" style={{ padding:"0 20px", height:44, fontSize:13 }} disabled={!input.trim()||loading}>
          <Send size={15}/> Send
        </button>
      </div>
    </div>
  );
}
