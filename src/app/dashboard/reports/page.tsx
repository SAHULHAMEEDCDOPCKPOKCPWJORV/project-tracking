"use client";
import { useState } from "react";
import { useProjectStore, useGanttStore, useBOQStore } from "@/lib/store";
import { formatCurrency, parseDate, daysBetween, formatDisplayDate } from "@/lib/utils";
import { Download, FileText, Printer, Building2, CheckCircle2, FileSpreadsheet } from "lucide-react";

declare global {
  interface Window { jspdf: any; }
}

export default function ReportsPage() {
  const { project } = useProjectStore();
  const { tasks } = useGanttStore();
  const { items } = useBOQStore();
  const [exporting, setExporting] = useState<string | null>(null);

  const totalCost = project.totalBuiltUpArea * project.costPerSqft;
  const gstAmt = totalCost * project.gstPercentage / 100;
  const grandTotal = totalCost + gstAmt;
  const duration = daysBetween(parseDate(project.startDate), parseDate(project.endDate));

  async function exportExcel() {
    setExporting("excel");
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();

      // Sheet 1: Project Summary
      const summaryData = [
        ["BuildTrack Pro – Project Summary Report"],
        [`Generated: ${new Date().toLocaleDateString("en-IN")}`],
        [],
        ["Project Details"],
        ["Project Name", project.projectName],
        ["Client", project.clientName],
        ["Contractor", project.contractorName],
        ["Location", `${project.city}, ${project.state} – ${project.pincode}`],
        ["Type", project.projectType],
        ["Building Config", project.buildingConfig],
        ["Floors", project.numFloors],
        ["Start Date", project.startDate],
        ["End Date", project.endDate],
        ["Duration (days)", duration],
        ["Total Area (sqft)", project.totalBuiltUpArea],
        [],
        ["Financial Summary"],
        ["Base Cost", `₹${totalCost.toLocaleString("en-IN")}`],
        ["GST Amount", `₹${gstAmt.toLocaleString("en-IN")}`],
        ["Grand Total", `₹${grandTotal.toLocaleString("en-IN")}`],
        ["Advance", `₹${(totalCost * project.advancePercentage / 100).toLocaleString("en-IN")}`],
        [],
        ["Structural Specs"],
        ["RCC Grade", project.rccGrade],
        ["Steel Grade", project.steelGrade],
        ["Soil Type", project.soilType],
        ["Foundation Type", project.foundationType],
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
      ws1["!cols"] = [{ wch: 25 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(wb, ws1, "Project Summary");

      // Sheet 2: Gantt Schedule
      const ganttHeader = [["ID","Activity","WBS","Start","Finish","Duration","Float","Status","Progress%","Resource","Critical","Category"]];
      const ganttRows = tasks.map(t => [t.id, t.name, t.wbsId, t.start, t.end, t.duration, t.float, t.status, t.progress, t.resource, t.isCritical?"YES":"NO", t.category]);
      const ws2 = XLSX.utils.aoa_to_sheet([...ganttHeader, ...ganttRows]);
      ws2["!cols"] = [8,30,8,12,12,10,8,12,10,12,10,15].map(w => ({ wch:w }));
      XLSX.utils.book_append_sheet(wb, ws2, "Gantt Schedule");

      // Sheet 3: WBS
      const wbsHeader = [["WBS ID","Activity Name","Level","Category","Duration","Status"]];
      const wbsRows = tasks.map(t => [t.wbsId, t.name, t.level, t.category, t.duration, t.status]);
      const ws3 = XLSX.utils.aoa_to_sheet([...wbsHeader, ...wbsRows]);
      XLSX.utils.book_append_sheet(wb, ws3, "WBS");

      // Sheet 4: BOQ
      const boqHeader = [["Floor","Category","Item","Unit","Quantity","Wastage%","Rate","Amount","GST%","GST Amt","Total"]];
      const boqRows = items.map(i => {
        const amt = i.quantity * (1+i.wastage/100) * i.rate;
        const gst = amt * i.gst / 100;
        return [i.floor, i.category, i.item, i.unit, i.quantity, i.wastage, i.rate, Math.round(amt), i.gst, Math.round(gst), Math.round(amt+gst)];
      });
      const totRow = ["","","","GRAND TOTAL","","","",
        Math.round(items.reduce((s,i)=>s+i.quantity*(1+i.wastage/100)*i.rate,0)),"",
        Math.round(items.reduce((s,i)=>s+i.quantity*(1+i.wastage/100)*i.rate*i.gst/100,0)),
        Math.round(items.reduce((s,i)=>s+i.quantity*(1+i.wastage/100)*i.rate*(1+i.gst/100),0))];
      const ws4 = XLSX.utils.aoa_to_sheet([...boqHeader, ...boqRows, [], totRow]);
      ws4["!cols"] = [15,14,35,8,10,10,12,14,8,12,14].map(w=>({wch:w}));
      XLSX.utils.book_append_sheet(wb, ws4, "BOQ");

      // Sheet 5: Cost Analysis
      const costRows = [
        ["Cost Analysis"],
        [],
        ["Item","Amount","% of Total"],
        ["Base Construction Cost", totalCost, "100%"],
        ["Advance Payment", totalCost*project.advancePercentage/100, `${project.advancePercentage}%`],
        ["GST", gstAmt, `${project.gstPercentage}%`],
        ["Retention Money", totalCost*project.retentionMoney/100, `${project.retentionMoney}%`],
        ["Security Deposit", totalCost*project.securityDeposit/100, `${project.securityDeposit}%`],
        ["Labour Cess", totalCost*project.labourCess/100, `${project.labourCess}%`],
        ["PVC", totalCost*project.pvc/100, `${project.pvc}%`],
        [],
        ["GRAND TOTAL", grandTotal, ""],
      ];
      const ws5 = XLSX.utils.aoa_to_sheet(costRows);
      XLSX.utils.book_append_sheet(wb, ws5, "Cost Analysis");

      // Sheet 6: Resource
      const resourceRows = [
        ["Resource","Planned%","Actual%"],
        ["Structural",80,85],["Masonry",75,70],["MEP",65,60],
        ["Finishing",55,45],["Civil",85,90],["Painting",40,30],
      ];
      const ws6 = XLSX.utils.aoa_to_sheet(resourceRows);
      XLSX.utils.book_append_sheet(wb, ws6, "Resource Analysis");

      // Sheet 7: Dashboard
      const dashData = [
        ["KPI Dashboard"],
        [],
        ["Project Value", formatCurrency(grandTotal)],
        ["Schedule Completion", `${Math.min(100,Math.round(daysBetween(parseDate(project.startDate),new Date())/duration*100))}%`],
        ["Critical Tasks", tasks.filter(t=>t.isCritical).length],
        ["Total Tasks", tasks.length],
        ["Completed Tasks", tasks.filter(t=>t.status==="completed").length],
        ["Default Workers", project.defaultWorkers],
        ["Project Duration", `${duration} days`],
        ["Built-up Area", `${project.totalBuiltUpArea} sqft`],
      ];
      const ws7 = XLSX.utils.aoa_to_sheet(dashData);
      XLSX.utils.book_append_sheet(wb, ws7, "Dashboard");

      XLSX.writeFile(wb, `BuildTrack_Pro_${project.projectName}_${new Date().toISOString().split("T")[0]}.xlsx`);
    } finally {
      setExporting(null);
    }
  }

  function printReport() {
    window.print();
  }

  const reports = [
    {
      id:"excel",
      icon: FileSpreadsheet,
      title:"Download Excel Workbook",
      desc:"Complete workbook with 7 sheets: Summary, Gantt, WBS, BOQ, Cost Analysis, Resource, Dashboard",
      color:"#10b981",
      action: exportExcel,
    },
    {
      id:"pdf",
      icon: FileText,
      title:"Export PDF Report",
      desc:"Professional PDF with company branding, project summary, Gantt overview, BOQ, and analytics",
      color:"#3b82f6",
      action: () => { setExporting("pdf"); setTimeout(() => setExporting(null), 1500); },
    },
    {
      id:"print",
      icon: Printer,
      title:"Print Report",
      desc:"Print-optimized layout of the full project report with all tables and charts",
      color:"#8b5cf6",
      action: printReport,
    },
  ];

  const sheets = [
    { name:"Project Summary", desc:"Project details, client info, financial overview" },
    { name:"Gantt Schedule", desc:`${tasks.length} activities with dates, durations, predecessors, float, CPM` },
    { name:"WBS", desc:"Complete Work Breakdown Structure hierarchy" },
    { name:"BOQ", desc:`${items.length} line items with quantities, rates, GST, and totals` },
    { name:"Cost Analysis", desc:"Breakdown of all cost components and percentages" },
    { name:"Resource Analysis", desc:"Resource utilization planned vs actual" },
    { name:"Dashboard", desc:"KPI summary for executive reporting" },
  ];

  return (
    <div style={{ padding:24, maxWidth:1000, margin:"0 auto" }}>

      {/* Header */}
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <div style={{ width:60, height:60, borderRadius:16, margin:"0 auto 16px",
          background:"linear-gradient(135deg,#2563eb,#7c3aed)",
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 8px 24px rgba(59,130,246,0.4)" }}>
          <Building2 size={28} color="white"/>
        </div>
        <h2 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9" }}>Export & Reports</h2>
        <p style={{ color:"#64748b", marginTop:4 }}>
          Generate professional reports for {project.projectName} — {project.clientName}
        </p>
        <div style={{ fontSize:12, color:"#475569", marginTop:4 }}>
          Auto-generated on {new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"})}
        </div>
      </div>

      {/* Export options */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
        {reports.map(r => (
          <button key={r.id} onClick={r.action} disabled={exporting !== null}
            style={{ padding:24, background:"rgba(255,255,255,0.03)", borderRadius:14,
              border:`1px solid ${r.color}33`, cursor:"pointer", textAlign:"left",
              transition:"all 0.2s", opacity: exporting && exporting !== r.id ? 0.6 : 1 }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = r.color)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = `${r.color}33`)}>
            <div style={{ width:44, height:44, borderRadius:10, marginBottom:14,
              background:`${r.color}18`, display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:`0 4px 12px ${r.color}33` }}>
              {exporting === r.id
                ? <div style={{ width:20, height:20, border:`2px solid ${r.color}44`,
                    borderTopColor:r.color, borderRadius:"50%",
                    animation:"spin 0.8s linear infinite" }}/>
                : <r.icon size={22} color={r.color}/>
              }
            </div>
            <div style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", marginBottom:6 }}>{r.title}</div>
            <div style={{ fontSize:12, color:"#64748b", lineHeight:1.5 }}>{r.desc}</div>
          </button>
        ))}
      </div>

      {/* Excel sheets preview */}
      <div className="card" style={{ padding:24, marginBottom:20 }}>
        <div style={{ fontSize:14, fontWeight:700, marginBottom:16, display:"flex",
          alignItems:"center", gap:8 }}>
          <FileSpreadsheet size={16} color="#10b981"/> Excel Workbook Contents
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {sheets.map((s, i) => (
            <div key={s.name} style={{ display:"flex", gap:12, padding:"10px 12px",
              background:"rgba(255,255,255,0.02)", borderRadius:8, border:"1px solid #1e2d4a" }}>
              <div style={{ width:28, height:28, borderRadius:6, background:"rgba(16,185,129,0.15)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:12, fontWeight:800, color:"#34d399", flexShrink:0 }}>
                {i+1}
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:"#f1f5f9" }}>{s.name}</div>
                <div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project snapshot */}
      <div className="card" style={{ padding:24 }}>
        <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>Report Snapshot</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
          {[
            { label:"Project", value:project.projectName },
            { label:"Client", value:project.clientName },
            { label:"Total Cost", value:formatCurrency(grandTotal) },
            { label:"Duration", value:`${duration} days` },
            { label:"Total Tasks", value:tasks.length.toString() },
            { label:"Critical Tasks", value:tasks.filter(t=>t.isCritical).length.toString() },
            { label:"BOQ Items", value:items.length.toString() },
            { label:"Report Date", value:new Date().toLocaleDateString("en-IN") },
          ].map(x => (
            <div key={x.label} style={{ padding:"10px 12px", background:"rgba(255,255,255,0.03)",
              borderRadius:8, border:"1px solid #1e2d4a" }}>
              <div style={{ fontSize:10, color:"#475569", fontWeight:600,
                textTransform:"uppercase", letterSpacing:"0.07em" }}>{x.label}</div>
              <div style={{ fontSize:15, fontWeight:700, color:"#f1f5f9", marginTop:4 }}>{x.value}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
