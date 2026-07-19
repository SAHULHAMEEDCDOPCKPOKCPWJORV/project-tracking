"use client";
import { useState } from "react";
import { Settings, Users, Shield, Bell, Database, Key, Save, CheckCircle } from "lucide-react";

const TABS = ["General","Users & Roles","Notifications","Security","Data"] as const;
type Tab = typeof TABS[number];

const USERS = [
  { id:1, name:"Sahul Hameed", email:"sahulhameed03111@gmail.com", role:"Admin", status:"Active" },
  { id:2, name:"Ramesh Kumar", email:"ramesh@buildtrack.com", role:"Project Manager", status:"Active" },
  { id:3, name:"Priya S", email:"priya@buildtrack.com", role:"Site Engineer", status:"Active" },
  { id:4, name:"Arjun R", email:"arjun@buildtrack.com", role:"Viewer", status:"Inactive" },
];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("General");
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(()=>setSaved(false),2500); };

  return (
    <div style={{ padding:20 }}>
      {/* Tab bar */}
      <div style={{ display:"flex", gap:4, marginBottom:24, background:"rgba(255,255,255,0.03)", borderRadius:10, padding:4, border:"1px solid #1e2d4a" }}>
        {TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            padding:"8px 18px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:600,
            background:tab===t?"rgba(59,130,246,0.2)":"transparent",
            color:tab===t?"#60a5fa":"#64748b",
            transition:"all 0.15s",
            display:"flex", alignItems:"center", gap:6
          }}>
            {t==="General"&&<Settings size={13}/>}
            {t==="Users & Roles"&&<Users size={13}/>}
            {t==="Notifications"&&<Bell size={13}/>}
            {t==="Security"&&<Shield size={13}/>}
            {t==="Data"&&<Database size={13}/>}
            {t}
          </button>
        ))}
      </div>

      {tab==="General" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          <div className="card" style={{ padding:24 }}>
            <div style={{ fontWeight:700, color:"#f1f5f9", marginBottom:20, fontSize:15 }}>Company Settings</div>
            {[
              { label:"Company Name", placeholder:"BuildTrack Engineering", value:"BuildTrack Engineering" },
              { label:"Company Email", placeholder:"info@buildtrack.com", value:"info@buildtrack.com" },
              { label:"Phone", placeholder:"+91 9876543210", value:"+91 9876543210" },
              { label:"Address", placeholder:"Chennai, Tamil Nadu", value:"No. 12, Anna Nagar, Chennai - 600040" },
            ].map(f=>(
              <div key={f.label} style={{ marginBottom:16 }}>
                <label className="label">{f.label}</label>
                <input className="input-field" defaultValue={f.value} style={{ height:38, fontSize:13 }}/>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding:24 }}>
            <div style={{ fontWeight:700, color:"#f1f5f9", marginBottom:20, fontSize:15 }}>System Preferences</div>
            {[
              { label:"Currency", options:["INR (₹)","USD ($)","EUR (€)"] },
              { label:"Date Format", options:["DD/MM/YYYY","MM/DD/YYYY","YYYY-MM-DD"] },
              { label:"Language", options:["English","Tamil","Hindi"] },
              { label:"Timezone", options:["IST (UTC+5:30)","UTC","PST"] },
            ].map(f=>(
              <div key={f.label} style={{ marginBottom:16 }}>
                <label className="label">{f.label}</label>
                <select className="input-field" style={{ height:38, fontSize:13 }}>
                  {f.options.map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div style={{ marginBottom:16 }}>
              <label className="label">Default GST Rate (%)</label>
              <input type="number" className="input-field" defaultValue={18} style={{ height:38, fontSize:13 }}/>
            </div>
          </div>
          <div style={{ gridColumn:"1/-1", display:"flex", justifyContent:"flex-end" }}>
            <button className="btn-primary" style={{ fontSize:13 }} onClick={save}>
              {saved ? <><CheckCircle size={14}/> Saved!</> : <><Save size={14}/> Save Settings</>}
            </button>
          </div>
        </div>
      )}

      {tab==="Users & Roles" && (
        <div className="card" style={{ overflow:"hidden" }}>
          <div style={{ padding:"14px 16px", borderBottom:"1px solid #1e2d4a", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontWeight:700, color:"#f1f5f9" }}>User Management</div>
            <button className="btn-primary" style={{ fontSize:12 }}>+ Invite User</button>
          </div>
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {USERS.map(u=>(
                <tr key={u.id}>
                  <td style={{ fontWeight:600 }}>{u.name}</td>
                  <td style={{ color:"#94a3b8", fontSize:12 }}>{u.email}</td>
                  <td>
                    <select className="input-field" defaultValue={u.role} style={{ width:180, padding:"3px 8px", fontSize:12 }}>
                      {["Admin","Project Manager","Site Engineer","QA Engineer","Viewer"].map(r=><option key={r}>{r}</option>)}
                    </select>
                  </td>
                  <td><span className={`badge ${u.status==="Active"?"badge-complete":"badge-planned"}`}>{u.status}</span></td>
                  <td>
                    <button className="btn-secondary" style={{ fontSize:11, padding:"4px 10px" }}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab==="Notifications" && (
        <div className="card" style={{ padding:24, maxWidth:600 }}>
          <div style={{ fontWeight:700, color:"#f1f5f9", marginBottom:20, fontSize:15 }}>Notification Settings</div>
          {[
            { label:"Email notifications for NCRs", defaultChecked:true },
            { label:"Low stock alerts via email", defaultChecked:true },
            { label:"Safety incident alerts", defaultChecked:true },
            { label:"Payment due reminders", defaultChecked:false },
            { label:"Daily progress report summary", defaultChecked:false },
            { label:"Weekly project status digest", defaultChecked:true },
          ].map(n=>(
            <label key={n.label} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:"1px solid #1e2d4a", cursor:"pointer" }}>
              <input type="checkbox" defaultChecked={n.defaultChecked} style={{ width:16, height:16, accentColor:"#3b82f6" }}/>
              <span style={{ fontSize:13, color:"#f1f5f9" }}>{n.label}</span>
            </label>
          ))}
          <div style={{ marginTop:20, display:"flex", justifyContent:"flex-end" }}>
            <button className="btn-primary" style={{ fontSize:13 }} onClick={save}>
              {saved ? <><CheckCircle size={14}/> Saved!</> : <><Save size={14}/> Save</>}
            </button>
          </div>
        </div>
      )}

      {tab==="Security" && (
        <div className="card" style={{ padding:24, maxWidth:500 }}>
          <div style={{ fontWeight:700, color:"#f1f5f9", marginBottom:20, fontSize:15 }}>Security Settings</div>
          <div style={{ marginBottom:16 }}>
            <label className="label">Current Password</label>
            <input type="password" className="input-field" style={{ height:38, fontSize:13 }}/>
          </div>
          <div style={{ marginBottom:16 }}>
            <label className="label">New Password</label>
            <input type="password" className="input-field" style={{ height:38, fontSize:13 }}/>
          </div>
          <div style={{ marginBottom:24 }}>
            <label className="label">Confirm New Password</label>
            <input type="password" className="input-field" style={{ height:38, fontSize:13 }}/>
          </div>
          <button className="btn-primary" style={{ fontSize:13, width:"100%" }} onClick={save}>
            <Key size={14}/> {saved?"Password Updated!":"Update Password"}
          </button>
        </div>
      )}

      {tab==="Data" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          {[
            { title:"Export All Data", desc:"Download complete project data as JSON/Excel backup.", action:"Export Backup", color:"#60a5fa" },
            { title:"Import Data", desc:"Import BOQ, schedule, or other data from Excel files.", action:"Import", color:"#a78bfa" },
            { title:"Clear BOQ Data", desc:"Reset all BOQ items and regenerate from project parameters.", action:"Clear & Regenerate", color:"#f59e0b" },
            { title:"Audit Log", desc:"View complete audit trail of all changes made in the system.", action:"View Audit Log", color:"#34d399" },
          ].map(c=>(
            <div key={c.title} className="card" style={{ padding:24 }}>
              <div style={{ fontWeight:700, color:"#f1f5f9", marginBottom:8 }}>{c.title}</div>
              <div style={{ fontSize:13, color:"#64748b", marginBottom:20 }}>{c.desc}</div>
              <button className="btn-secondary" style={{ fontSize:13, color:c.color, borderColor:`${c.color}44` }}>{c.action}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
