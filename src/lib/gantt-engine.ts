import { GanttTask, WBSNode, ProjectDetails, BOQItem } from "./store";
import { addDays, formatDate, daysBetween } from "./utils";

function makeTask(
  id: string, wbsId: string, name: string, startDate: Date, duration: number,
  predecessors: string[], status: GanttTask["status"], progress: number,
  isMilestone: boolean, resource: string, level: number, parentId: string | undefined,
  category: string
): GanttTask {
  const start = new Date(startDate);
  const end = addDays(start, Math.max(0, duration - 1));
  return {
    id, wbsId, name,
    start: formatDate(start),
    end: formatDate(end),
    duration, predecessors, status, progress, isMilestone,
    isCritical: false, float: 0, resource, level, parentId, category,
    baselineStart: formatDate(start),
    baselineEnd: formatDate(end),
  };
}

export function generateGanttTasks(project: ProjectDetails): GanttTask[] {
  const base = new Date(project.startDate + "T00:00:00");
  const end = new Date(project.endDate + "T00:00:00");
  const totalDays = Math.max(daysBetween(base, end) || 0, 30); // minimum 30 days
  const floors = Number(project.numFloors) || 1;
  const tasks: GanttTask[] = [];

  const preDays = Math.max(1, Math.round(totalDays * 0.05));
  const earthDays = Math.max(2, Math.round(totalDays * 0.10));
  const foundDays = Math.max(3, Math.round(totalDays * 0.15));
  const superDays = Math.max(5, Math.round(totalDays * 0.40));
  const finDays = Math.max(5, Math.round(totalDays * 0.20));
  const closeDays = Math.max(2, Math.round(totalDays * 0.10));

  // Pre-Construction (preDays)
  tasks.push(makeTask("T001","1.0","Notice to Proceed",base,1,[],"completed",100,true,"PM",0,undefined,"Pre-Construction"));
  tasks.push(makeTask("T002","1.1","Project Kickoff",addDays(base,1),Math.max(1, Math.round(preDays*0.2)),["T001"],"completed",100,false,"PM",1,"T001","Pre-Construction"));
  tasks.push(makeTask("T003","1.2","Site Survey & Layout",addDays(base,3),Math.max(1, Math.round(preDays*0.3)),["T002"],"completed",100,false,"Surveyor",1,"T001","Pre-Construction"));
  tasks.push(makeTask("T004","1.3","Site Mobilization",addDays(base,8),Math.max(1, Math.round(preDays*0.5)),["T003"],"in-progress",60,false,"Contractor",1,"T001","Pre-Construction"));

  // Earthwork
  const earthBase = addDays(base, preDays);
  tasks.push(makeTask("T005","2.0","Site Clearing & Excavation",earthBase,Math.max(1, Math.round(earthDays*0.6)),["T004"],"in-progress",40,false,"Earthwork",0,undefined,"Earthwork"));
  tasks.push(makeTask("T006","2.1","Shoring & Dewatering",addDays(earthBase,Math.round(earthDays*0.6)),Math.max(1, Math.round(earthDays*0.4)),["T005"],"not-started",0,false,"Civil",1,"T005","Earthwork"));

  // Foundation
  const foundBase = addDays(earthBase, earthDays);
  tasks.push(makeTask("T007","3.0","PCC & Foundation Bed",foundBase,Math.max(1, Math.round(foundDays*0.2)),["T006"],"not-started",0,false,"Civil",0,undefined,"Foundation"));
  tasks.push(makeTask("T008","3.1","Raft / Footing RCC",addDays(foundBase,Math.round(foundDays*0.2)),Math.max(1, Math.round(foundDays*0.5)),["T007"],"not-started",0,false,"Structural",1,"T007","Foundation"));
  tasks.push(makeTask("T009","3.2","Plinth Beam & Backfill",addDays(foundBase,Math.round(foundDays*0.7)),Math.max(1, Math.round(foundDays*0.3)),["T008"],"not-started",0,false,"Civil",1,"T007","Foundation"));
  tasks.push(makeTask("T010","3.3","Foundation Complete",addDays(foundBase,foundDays),1,["T009"],"not-started",0,true,"PM",0,undefined,"Foundation"));

  // Superstructure
  const floorDays = Math.max(4, Math.round(superDays / Math.max(1, floors + 1))); // +1 for Ground
  let prevEnd = addDays(foundBase, foundDays);
  const floorTaskIds: string[] = [];
  
  for (let f = 0; f <= floors; f++) {
    const fBase = new Date(prevEnd);
    const fl = f === 0 ? "Ground Floor" : `Floor ${f}`;
    const colId = `T${100 + f * 10}`;
    const beamId = `T${101 + f * 10}`;
    const slabId = `T${102 + f * 10}`;
    const curingId = `T${103 + f * 10}`;
    const pred = f === 0 ? ["T010"] : [floorTaskIds[floorTaskIds.length - 1]];

    tasks.push(makeTask(colId, `4.${f}.1`, `${fl} – Columns`, fBase, Math.max(1, Math.round(floorDays*0.3)), pred,"not-started", 0, false, "Structural", 0, undefined, fl));
    tasks.push(makeTask(beamId, `4.${f}.2`, `${fl} – Beams & Slab Shuttering`, addDays(fBase,Math.round(floorDays*0.3)), Math.max(1, Math.round(floorDays*0.3)), [colId],"not-started", 0, false, "Carpenter", 1, colId, fl));
    tasks.push(makeTask(slabId, `4.${f}.3`, `${fl} – Slab RCC Pour`, addDays(fBase,Math.round(floorDays*0.6)), Math.max(1, Math.round(floorDays*0.1)), [beamId],"not-started", 0, false, "Structural", 1, colId, fl));
    tasks.push(makeTask(curingId, `4.${f}.4`, `${fl} – Curing`, addDays(fBase,Math.round(floorDays*0.7)), Math.max(1, Math.round(floorDays*0.3)), [slabId],"not-started", 0, false, "Labour", 1, colId, fl));

    prevEnd = addDays(fBase, floorDays);
    floorTaskIds.push(curingId);
  }

  tasks.push(makeTask("T_SW","5.0","Structural Works Complete",prevEnd,1,
    [floorTaskIds[floorTaskIds.length - 1]],"not-started",0,true,"PM",0,undefined,"Milestone"));

  // Finishes
  const finBase = new Date(prevEnd);
  tasks.push(makeTask("T_F1","6.1","Brickwork (All Floors)",finBase,Math.max(1, Math.round(finDays*0.3)),["T_SW"],"not-started",0,false,"Masonry",0,undefined,"Finishes"));
  tasks.push(makeTask("T_F2","6.2","Electrical Conduing",addDays(finBase,Math.round(finDays*0.1)),Math.max(1, Math.round(finDays*0.2)),["T_F1"],"not-started",0,false,"Electrician",0,undefined,"MEP"));
  tasks.push(makeTask("T_F3","6.3","Plumbing Rough-in",addDays(finBase,Math.round(finDays*0.1)),Math.max(1, Math.round(finDays*0.2)),["T_F1"],"not-started",0,false,"Plumber",0,undefined,"MEP"));
  tasks.push(makeTask("T_F4","6.4","External Plastering",addDays(finBase,Math.round(finDays*0.3)),Math.max(1, Math.round(finDays*0.25)),["T_F1"],"not-started",0,false,"Masonry",0,undefined,"Finishes"));
  tasks.push(makeTask("T_F5","6.5","Internal Plastering",addDays(finBase,Math.round(finDays*0.4)),Math.max(1, Math.round(finDays*0.25)),["T_F1"],"not-started",0,false,"Masonry",0,undefined,"Finishes"));
  tasks.push(makeTask("T_F6","6.6","Flooring & Tiling",addDays(finBase,Math.round(finDays*0.6)),Math.max(1, Math.round(finDays*0.2)),["T_F5"],"not-started",0,false,"Tiler",0,undefined,"Finishes"));
  tasks.push(makeTask("T_F7","6.7","Doors & Windows",addDays(finBase,Math.round(finDays*0.6)),Math.max(1, Math.round(finDays*0.15)),["T_F5"],"not-started",0,false,"Carpenter",0,undefined,"Finishes"));
  tasks.push(makeTask("T_F8","6.8","Painting & Polish",addDays(finBase,Math.round(finDays*0.8)),Math.max(1, Math.round(finDays*0.2)),["T_F6"],"not-started",0,false,"Painter",0,undefined,"Finishes"));
  
  // Closeout
  const closeBase = addDays(finBase, finDays);
  tasks.push(makeTask("T_C1","7.1","Snagging & Defect Rectification",closeBase,Math.max(1, Math.round(closeDays*0.6)),["T_F8"],"not-started",0,false,"QA",0,undefined,"Closeout"));
  tasks.push(makeTask("T_C2","7.2","Final Inspection",addDays(closeBase,Math.round(closeDays*0.6)),Math.max(1, Math.round(closeDays*0.3)),["T_C1"],"not-started",0,false,"PM",0,undefined,"Closeout"));
  tasks.push(makeTask("T_C3","7.3","Handover & Substantial Completion",addDays(closeBase,Math.round(closeDays*0.9)),1,["T_C2"],"not-started",0,true,"PM",0,undefined,"Milestone"));

  return computeCPM(tasks);
}

function computeCPM(tasks: GanttTask[]): GanttTask[] {
  const map = new Map<string, GanttTask>();
  tasks.forEach((t) => map.set(t.id, t));

  // Forward pass: ES, EF
  const es = new Map<string, number>();
  const ef = new Map<string, number>();
  const epoch = (d: string) => new Date(d + "T00:00:00").getTime();

  tasks.forEach((t) => {
    if (t.predecessors.length === 0) {
      es.set(t.id, epoch(t.start));
    } else {
      const predEF = t.predecessors.map((pid) => ef.get(pid) ?? epoch(t.start));
      es.set(t.id, Math.max(...predEF) + 86400000);
    }
    ef.set(t.id, (es.get(t.id) ?? epoch(t.start)) + (t.duration - 1) * 86400000);
  });

  const projectEnd = Math.max(...Array.from(ef.values()));

  // Backward pass: LS, LF
  const ls = new Map<string, number>();
  const lf = new Map<string, number>();

  [...tasks].reverse().forEach((t) => {
    const successors = tasks.filter((s) => s.predecessors.includes(t.id));
    if (successors.length === 0) {
      lf.set(t.id, projectEnd);
    } else {
      const succLS = successors.map((s) => ls.get(s.id) ?? projectEnd);
      lf.set(t.id, Math.min(...succLS) - 86400000);
    }
    ls.set(t.id, (lf.get(t.id) ?? projectEnd) - (t.duration - 1) * 86400000);
  });

  tasks.forEach((t) => {
    const floatMs = (ls.get(t.id) ?? 0) - (es.get(t.id) ?? 0);
    t.float = Math.max(0, Math.round(floatMs / 86400000));
    t.isCritical = t.float === 0;
  });

  return tasks;
}

export function buildWBSNodes(tasks: GanttTask[]): WBSNode[] {
  return tasks.map((t) => ({
    id: t.id,
    wbsId: t.wbsId,
    name: t.name,
    parentId: t.parentId,
    children: tasks.filter((c) => c.parentId === t.id).map((c) => c.id),
    isCollapsed: false,
    level: t.level,
  }));
}

export function generateBOQ(project: ProjectDetails, materials: any[] = [], labourRates: any[] = []): BOQItem[] {
  const totalBuiltUpArea = Number(project.totalBuiltUpArea) || 1000;
  const numFloors = Number(project.numFloors) || 1;
  const costPerSqft = Number(project.costPerSqft) || 2000;
  const gstPercentage = Number(project.gstPercentage) || 18;
  const targetBudget = totalBuiltUpArea * costPerSqft;

  const items: BOQItem[] = [];
  let counter = 1;

  const getMatPrice = (query: string, defaultPrice: number) => {
    const mat = materials.find(m => m.name.toLowerCase().includes(query.toLowerCase()) || m.category.toLowerCase().includes(query.toLowerCase()));
    return mat ? mat.todayPrice : defaultPrice;
  };
  
  const getLabPrice = (query: string, defaultPrice: number) => {
    const lab = labourRates.find(l => l.trade.toLowerCase().includes(query.toLowerCase()));
    return lab ? lab.dailyRate : defaultPrice;
  };

  const add = (floor: string, category: string, description: string, unit: string, baseRate: number, targetAmount: number, matQuery = "", labQuery = "") => {
    
    let finalRate = baseRate;
    if (matQuery || labQuery) {
      let mCost = matQuery ? getMatPrice(matQuery, baseRate * 0.6) : baseRate * 0.6;
      let lCost = labQuery ? getLabPrice(labQuery, baseRate * 0.3) : baseRate * 0.3;
      if (unit === "Cum" || unit === "Sqm" || unit === "MT") {
        finalRate = mCost + (lCost / 8); 
      }
    }

    const qty = targetAmount / finalRate;
    const amount = targetAmount;
    
    const material = amount * 0.6;
    const labour = amount * 0.3;
    const equipment = amount * 0.1;
    const overhead = amount * 0.05;
    const profit = 10;
    const gst = gstPercentage;
    const totalCost = amount + overhead + (amount * profit / 100) + (amount * gst / 100);
    
    items.push({ 
      id: `BOQ-${counter}`,
      itemNo: `${category.substring(0, 3).toUpperCase()}-${counter}`,
      floor, category, description,
      specification: "Standard Spec",
      activity: "Construction",
      unit, 
      quantity: Number(qty.toFixed(2)), 
      wastage: 5, 
      rate: Number(finalRate.toFixed(2)),
      amount: Number(amount.toFixed(2)),
      contractor: "Main Contractor", vendor: "Local Vendor",
      material, labour, equipment, overhead, profit, gst, totalCost,
      remarks: ""
    });
    counter++;
  };

  // Target budget allocations
  const bFound = targetBudget * 0.15;
  const bSuper = targetBudget * 0.35;
  const bFin = targetBudget * 0.25;
  const bMEP = targetBudget * 0.15;
  const bSite = targetBudget * 0.10;

  // Foundation (15%)
  add("Foundation","Earthwork","Excavation for Footing","Cum", 250, bFound * 0.10, "", "Helper");
  add("Foundation","PCC","PCC M10 (1:3:6)","Cum", 5500, bFound * 0.15, "Cement", "Mason");
  add("Foundation","RCC","RCC M25 – Footings","Cum", 7200, bFound * 0.35, "Cement", "Mason");
  add("Foundation","Steel","TMT Steel Fe500 – Footings","MT", 72000, bFound * 0.25, "Steel", "Steel Fixer");
  add("Foundation","Formwork","Shuttering for Footings","Sqm", 450, bFound * 0.10, "Wood", "Carpenter");
  add("Foundation","Backfill","Backfilling & Compaction","Cum", 200, bFound * 0.05, "", "Helper");

  // Superstructure (35%)
  const bSuperFloor = bSuper / (numFloors + 1);
  for (let f = 0; f <= numFloors; f++) {
    const fl = f === 0 ? "Ground Floor" : `Floor ${f}`;
    add(fl,"RCC","RCC M25 – Columns","Cum", 8000, bSuperFloor * 0.20, "Cement", "Mason");
    add(fl,"RCC","RCC M25 – Beams & Slab","Cum", 7500, bSuperFloor * 0.35, "Cement", "Mason");
    add(fl,"Steel","TMT Steel Fe500 – Columns","MT", 72000, bSuperFloor * 0.20, "Steel", "Steel Fixer");
    add(fl,"Steel","TMT Steel Fe500 – Beams/Slab","MT", 72000, bSuperFloor * 0.15, "Steel", "Steel Fixer");
    add(fl,"Formwork","Shuttering","Sqm", 450, bSuperFloor * 0.10, "Wood", "Carpenter");
  }

  // Finishes (25%)
  const bFinFloor = bFin / (numFloors + 1);
  for (let f = 0; f <= numFloors; f++) {
    const fl = f === 0 ? "Ground Floor" : `Floor ${f}`;
    add(fl,"Masonry","Brickwork (Ext & Int)","Sqm", 320, bFinFloor * 0.25, "Bricks", "Mason");
    add(fl,"Plaster","Cement Plastering","Sqm", 85, bFinFloor * 0.15, "Cement", "Mason");
    add(fl,"Flooring","Vitrified Tile Flooring","Sqm", 750, bFinFloor * 0.25, "Tiles", "Mason");
    add(fl,"Doors/Windows","Doors & UPVC Windows","No", 15000, bFinFloor * 0.25, "Wood", "Carpenter");
    add(fl,"Painting","Interior & Exterior Paint","Sqm", 60, bFinFloor * 0.10, "Paint", "Painter");
  }

  // MEP (15%)
  const bMEPFloor = bMEP / (numFloors + 1);
  for (let f = 0; f <= numFloors; f++) {
    const fl = f === 0 ? "Ground Floor" : `Floor ${f}`;
    add(fl,"Electrical","Wiring & Conduits","Point", 650, bMEPFloor * 0.30, "Electrical", "Electrician");
    add(fl,"Electrical","Fixtures & DBs","No", 1500, bMEPFloor * 0.20, "Electrical", "Electrician");
    add(fl,"Plumbing","Pipes & Drainage","Rmt", 200, bMEPFloor * 0.20, "Plumbing", "Plumber");
    add(fl,"Plumbing","Sanitary Ware","No", 15000, bMEPFloor * 0.30, "Plumbing", "Plumber");
  }

  // Site Works (10%)
  add("Site Works","Compound","Compound Wall & Gate","Rmt", 1200, bSite * 0.40, "Bricks", "Mason");
  add("Site Works","Landscape","External Paving","Sqm", 280, bSite * 0.30, "Tiles", "Mason");
  add("Site Works","Utilities","Water Tank & Septic","No", 25000, bSite * 0.30, "Tank", "Plumber");

  return items;
}
