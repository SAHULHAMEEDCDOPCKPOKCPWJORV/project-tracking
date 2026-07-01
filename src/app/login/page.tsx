"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { Building2, Lock, Mail, AlertCircle, CheckCircle, Eye, EyeOff, Zap, Shield, BarChart3 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    const ok = login(email, password);
    if (ok) {
      setSuccess(true);
      await new Promise((r) => setTimeout(r, 600));
      router.push("/dashboard");
    } else {
      setError("Access Denied – Authorized User Only");
      setLoading(false);
    }
  }

  if (!mounted) return null;

  const features = [
    { icon: BarChart3, label: "Primavera P6 Gantt" },
    { icon: Zap, label: "AI Schedule Analytics" },
    { icon: Shield, label: "PERT & CPM Engine" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a0e1a 0%, #0d1530 50%, #0a0e1a 100%)" }}>

      {/* Animated background blobs */}
      <div style={{
        position:"absolute", top:"10%", left:"5%", width:400, height:400,
        background:"radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
        borderRadius:"50%", filter:"blur(40px)", animation:"pulse 6s ease-in-out infinite"
      }}/>
      <div style={{
        position:"absolute", bottom:"10%", right:"5%", width:350, height:350,
        background:"radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)",
        borderRadius:"50%", filter:"blur(40px)", animation:"pulse 8s ease-in-out infinite reverse"
      }}/>

      {/* Grid lines background */}
      <div style={{
        position:"absolute", inset:0, opacity:0.03,
        backgroundImage:"linear-gradient(rgba(59,130,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,1) 1px, transparent 1px)",
        backgroundSize:"60px 60px"
      }}/>

      <div style={{ display:"flex", gap:48, alignItems:"center", width:"100%", maxWidth:960, padding:"0 24px", zIndex:1 }}>

        {/* Left branding panel */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:32 }}
          className="animate-fade-up hidden md:flex">
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
              <div style={{
                width:52, height:52, borderRadius:14,
                background:"linear-gradient(135deg, #2563eb, #7c3aed)",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 8px 24px rgba(59,130,246,0.4)"
              }}>
                <Building2 size={28} color="white" />
              </div>
              <div>
                <div style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.01em" }}
                  className="gradient-text">BuildTrack Pro</div>
                <div style={{ fontSize:11, color:"#475569", fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase" }}>
                  Civil PMS
                </div>
              </div>
            </div>
            <h1 style={{ fontSize:36, fontWeight:800, lineHeight:1.2, color:"#f1f5f9" }}>
              Professional Civil<br />
              <span className="gradient-text">Project Management</span>
            </h1>
            <p style={{ color:"#64748b", marginTop:12, fontSize:15, lineHeight:1.6 }}>
              Complete construction project suite — Gantt scheduling,<br />
              PERT analysis, BOQ generation, and AI-powered insights.
            </p>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {features.map(({ icon: Icon, label }) => (
              <div key={label} style={{
                display:"flex", alignItems:"center", gap:14, padding:"14px 18px",
                background:"rgba(59,130,246,0.06)", borderRadius:10,
                border:"1px solid rgba(59,130,246,0.15)"
              }}>
                <div style={{
                  width:36, height:36, borderRadius:8, background:"rgba(59,130,246,0.15)",
                  display:"flex", alignItems:"center", justifyContent:"center"
                }}>
                  <Icon size={18} color="#60a5fa" />
                </div>
                <span style={{ fontSize:14, fontWeight:500, color:"#94a3b8" }}>{label}</span>
              </div>
            ))}
          </div>

          <div style={{ padding:"14px 18px", background:"rgba(16,185,129,0.06)",
            borderRadius:10, border:"1px solid rgba(16,185,129,0.2)" }}>
            <p style={{ fontSize:12, color:"#34d399", fontWeight:600 }}>
              ✓ Trusted by Civil Engineers & Project Managers across India
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div style={{
          width: 420, padding: 40, borderRadius: 20,
          background: "rgba(15,22,41,0.8)", backdropFilter: "blur(30px)",
          border: "1px solid rgba(59,130,246,0.2)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 80px rgba(59,130,246,0.08)"
        }} className="animate-fade-up">

          {/* Logo mobile */}
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <div style={{
              width:60, height:60, borderRadius:16, margin:"0 auto 14px",
              background:"linear-gradient(135deg, #2563eb, #7c3aed)",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 10px 30px rgba(59,130,246,0.4)"
            }}>
              <Building2 size={30} color="white" />
            </div>
            <h2 style={{ fontSize:22, fontWeight:800, color:"#f1f5f9" }}>BuildTrack Pro</h2>
            <p style={{ fontSize:12, color:"#475569", marginTop:4, letterSpacing:"0.06em" }}>
              CIVIL PROJECT MANAGEMENT SUITE
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:20 }}>
            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <div style={{ position:"relative" }}>
                <Mail size={16} color="#475569" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }}/>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" required
                  className="input-field" style={{ paddingLeft:38 }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div style={{ position:"relative" }}>
                <Lock size={16} color="#475569" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }}/>
                <input
                  type={showPwd ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password" required
                  className="input-field" style={{ paddingLeft:38, paddingRight:44 }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                  position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                  background:"none", border:"none", cursor:"pointer", color:"#475569"
                }}>
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display:"flex", alignItems:"center", gap:10, padding:"12px 14px",
                background:"rgba(239,68,68,0.1)", borderRadius:8,
                border:"1px solid rgba(239,68,68,0.3)"
              }}>
                <AlertCircle size={16} color="#f87171"/>
                <span style={{ fontSize:13, color:"#f87171", fontWeight:500 }}>{error}</span>
              </div>
            )}

            {/* Success */}
            {success && (
              <div style={{
                display:"flex", alignItems:"center", gap:10, padding:"12px 14px",
                background:"rgba(16,185,129,0.1)", borderRadius:8,
                border:"1px solid rgba(16,185,129,0.3)"
              }}>
                <CheckCircle size={16} color="#34d399"/>
                <span style={{ fontSize:13, color:"#34d399", fontWeight:500 }}>
                  Authentication successful. Redirecting...
                </span>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading || success} className="btn-primary"
              style={{ width:"100%", justifyContent:"center", padding:"14px 20px", fontSize:15,
                opacity: loading || success ? 0.8 : 1 }}>
              {loading ? (
                <>
                  <span style={{
                    width:16, height:16, border:"2px solid rgba(255,255,255,0.3)",
                    borderTopColor:"white", borderRadius:"50%", display:"inline-block",
                    animation:"spin 0.7s linear infinite"
                  }}/>
                  Authenticating...
                </>
              ) : success ? "Redirecting..." : "Sign In to BuildTrack Pro"}
            </button>
          </form>

          <p style={{ textAlign:"center", fontSize:11, color:"#334155", marginTop:24 }}>
            © 2026 BuildTrack Pro · Civil PMS · All Rights Reserved
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
      `}</style>
    </div>
  );
}
