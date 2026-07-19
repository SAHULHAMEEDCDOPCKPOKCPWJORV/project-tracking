import { GanttTask, WBSNode, ProjectDetails, BOQItem } from "./store";
import { addDays, formatDate } from "./utils";

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
  const floors = project.numFloors;
  const tasks: GanttTask[] = [];

  // ─── Phase 1: Pre-Construction ─────────────────────────────────────────
  tasks.push(makeTask("T001","1.0","Notice to Proceed",base,1,[],
    "completed",100,true,"PM",0,undefined,"Pre-Construction"));
  tasks.push(makeTask("T002","1.1","Project Kickoff",addDays(base,1),2,["T001"],
    "completed",100,false,"PM",1,"T001","Pre-Construction"));
  tasks.push(makeTask("T003","1.2","Site Survey & Layout",addDays(base,3),5,["T002"],
    "completed",100,false,"Surveyor",1,"T001","Pre-Construction"));
  tasks.push(makeTask("T004","1.3","Site Mobilization",addDays(base,8),8,["T003"],
    "in-progress",60,false,"Contractor",1,"T001","Pre-Construction"));

  // ─── Phase 2: Earthwork ────────────────────────────────────────────────
  const earthBase = addDays(base, 16);
  tasks.push(makeTask("T005","2.0","Site Clearing & Excavation",earthBase,10,["T004"],
    "in-progress",40,false,"Earthwork",0,undefined,"Earthwork"));
  tasks.push(makeTask("T006","2.1","Shoring & Dewatering",addDays(earthBase,10),5,["T005"],
    "not-started",0,false,"Civil",1,"T005","Earthwork"));

  // ─── Phase 3: Foundation ───────────────────────────────────────────────
  const foundBase = addDays(base, 31);
  tasks.push(makeTask("T007","3.0","PCC & Foundation Bed",foundBase,5,["T006"],
    "not-started",0,false,"Civil",0,undefined,"Foundation"));
  tasks.push(makeTask("T008","3.1","Raft / Footing RCC",addDays(foundBase,5),14,["T007"],
    "not-started",0,false,"Structural",1,"T007","Foundation"));
  tasks.push(makeTask("T009","3.2","Plinth Beam & Backfill",addDays(foundBase,19),5,["T008"],
    "not-started",0,false,"Civil",1,"T007","Foundation"));
  tasks.push(makeTask("T010","3.3","Foundation Complete",addDays(foundBase,24),1,["T009"],
    "not-started",0,true,"PM",0,undefined,"Foundation"));

  // ─── Phase 4: Superstructure (per floor) ──────────────────────────────
  let prevEnd = addDays(foundBase, 25);
  const floorTaskIds: string[] = [];
  for (let f = 1; f <= floors; f++) {
    const fBase = new Date(prevEnd);
    const colId = `T${100 + f * 10}`;
    const beamId = `T${101 + f * 10}`;
    const slabId = `T${102 + f * 10}`;
    const curingId = `T${103 + f * 10}`;
    const pred = f === 1 ? ["T010"] : [floorTaskIds[floorTaskIds.length - 1]];

    tasks.push(makeTask(colId, `4.${f}.1`, `Floor ${f} – Columns`, fBase, 7, pred,
      "not-started", 0, false, "Structural", 0, undefined, `Floor ${f}`));
    tasks.push(makeTask(beamId, `4.${f}.2`, `Floor ${f} – Beams & Slab Shuttering`, addDays(fBase,7), 7, [colId],
      "not-started", 0, false, "Carpenter", 1, colId, `Floor ${f}`));
    tasks.push(makeTask(slabId, `4.${f}.3`, `Floor ${f} – Slab RCC Pour`, addDays(fBase,14), 4, [beamId],
      "not-started", 0, false, "Structural", 1, colId, `Floor ${f}`));
    tasks.push(makeTask(curingId, `4.${f}.4`, `Floor ${f} – Curing`, addDays(fBase,18), 5, [slabId],
      "not-started", 0, false, "Labour", 1, colId, `Floor ${f}`));

    prevEnd = addDays(fBase, 23);
    floorTaskIds.push(curingId);
  }

  // ─── Structural Milestone ──────────────────────────────────────────────
  tasks.push(makeTask("T_SW","5.0","Structural Works Complete",prevEnd,1,
    [floorTaskIds[floorTaskIds.length - 1]],"not-started",0,true,"PM",0,undefined,"Milestone"));

  // ─── Phase 5: MEP & Finishes ───────────────────────────────────────────
  const finBase = new Date(prevEnd);
  tasks.push(makeTask("T_F1","6.1","Brickwork (All Floors)",addDays(finBase,1),30,["T_SW"],
    "not-started",0,false,"Masonry",0,undefined,"Finishes"));
  tasks.push(makeTask("T_F2","6.2","Electrical Conduing",addDays(finBase,15),20,["T_F1"],
    "not-started",0,false,"Electrician",0,undefined,"MEP"));
  tasks.push(makeTask("T_F3","6.3","Plumbing Rough-in",addDays(finBase,15),20,["T_F1"],
    "not-started",0,false,"Plumber",0,undefined,"MEP"));
  tasks.push(makeTask("T_F4","6.4","External Plastering",addDays(finBase,20),25,["T_F1"],
    "not-started",0,false,"Masonry",0,undefined,"Finishes"));
  tasks.push(makeTask("T_F5","6.5","Internal Plastering",addDays(finBase,30),25,["T_F1"],
    "not-started",0,false,"Masonry",0,undefined,"Finishes"));
  tasks.push(makeTask("T_F6","6.6","Flooring & Tiling",addDays(finBase,55),20,["T_F5"],
    "not-started",0,false,"Tiler",0,undefined,"Finishes"));
  tasks.push(makeTask("T_F7","6.7","Doors & Windows",addDays(finBase,55),15,["T_F5"],
    "not-started",0,false,"Carpenter",0,undefined,"Finishes"));
  tasks.push(makeTask("T_F8","6.8","External Roadway & Landscape",addDays(finBase,55),20,["T_F4"],
    "not-started",0,false,"Civil",0,undefined,"Finishes"));
  tasks.push(makeTask("T_F9","6.9","Water Tank & Overhead Tank",addDays(finBase,60),12,["T_F3"],
    "not-started",0,false,"Plumber",0,undefined,"MEP"));
  tasks.push(makeTask("T_F10","6.10","Septic Tank & Sewage",addDays(finBase,60),10,["T_F3"],
    "not-started",0,false,"Plumber",0,undefined,"MEP"));
  tasks.push(makeTask("T_F11","6.11","Internal Painting & Polish",addDays(finBase,75),15,["T_F6"],
    "not-started",0,false,"Painter",0,undefined,"Finishes"));
  tasks.push(makeTask("T_F12","6.12","External Painting",addDays(finBase,75),15,["T_F6"],
    "not-started",0,false,"Painter",0,undefined,"Finishes"));
  tasks.push(makeTask("T_F13","6.13","Compound Wall & Gates",addDays(finBase,65),12,["T_F8"],
    "not-started",0,false,"Civil",0,undefined,"Finishes"));
  tasks.push(makeTask("T_F14","6.14","Electrical Fixtures",addDays(finBase,80),10,["T_F2"],
    "not-started",0,false,"Electrician",0,undefined,"MEP"));
  tasks.push(makeTask("T_F15","6.15","Plumbing Fixtures",addDays(finBase,80),10,["T_F3"],
    "not-started",0,false,"Plumber",0,undefined,"MEP"));

  // ─── Phase 6: Closeout ─────────────────────────────────────────────────
  const closeBase = addDays(finBase, 95);
  tasks.push(makeTask("T_C1","7.1","Snagging & Defect Rectification",closeBase,10,
    ["T_F11","T_F12","T_F14","T_F15"],"not-started",0,false,"QA",0,undefined,"Closeout"));
  tasks.push(makeTask("T_C2","7.2","Final Inspection",addDays(closeBase,10),5,["T_C1"],
    "not-started",0,false,"PM",0,undefined,"Closeout"));
  tasks.push(makeTask("T_C3","7.3","Handover & Substantial Completion",addDays(closeBase,15),1,["T_C2"],
    "not-started",0,true,"PM",0,undefined,"Milestone"));

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
  const { totalBuiltUpArea, numFloors, costPerSqft, gstPercentage } = project;
  const floorArea = totalBuiltUpArea / (numFloors + 1);
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

  const add = (floor: string, category: string, description: string, unit: string, qty: number, rate: number, wastage = 5, matQuery = "", labQuery = "") => {
    
    // dynamically adjust rate based on materials & labour if provided
    let finalRate = rate;
    if (matQuery || labQuery) {
      let mCost = matQuery ? getMatPrice(matQuery, rate * 0.6) : rate * 0.6;
      let lCost = labQuery ? getLabPrice(labQuery, rate * 0.3) : rate * 0.3;
      // Some simple heuristic to fit into a per-unit rate
      if (unit === "Cum" || unit === "Sqm" || unit === "MT") {
        finalRate = mCost + (lCost / 8); // simplified
      }
    }

    const amount = qty * finalRate;
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
      floor, 
      category, 
      description,
      specification: "Standard Spec",
      activity: "Construction",
      unit, 
      quantity: qty, 
      wastage, 
      rate: finalRate,
      amount,
      contractor: "Main Contractor",
      vendor: "Local Vendor",
      material,
      labour,
      equipment,
      overhead,
      profit,
      gst,
      totalCost,
      remarks: ""
    });
    counter++;
  };

  // Foundation items
  add("Foundation","Earthwork","Excavation for Footing","Cum", floorArea * 0.3, 250, 0, "", "Helper");
  add("Foundation","PCC","PCC M10 (1:3:6)","Cum", floorArea * 0.05, 5500, 3, "Cement", "Mason");
  add("Foundation","RCC","RCC M25 – Footings","Cum", floorArea * 0.12, 7200, 5, "Cement", "Mason");
  add("Foundation","Steel","TMT Steel Fe500 – Footings","MT", floorArea * 0.012, 72000, 5, "Steel", "Steel Fixer");
  add("Foundation","Formwork","Shuttering for Footings","Sqm", floorArea * 0.8, 450, 5, "Wood", "Carpenter");
  add("Foundation","Masonry","Plinth Beam","Cum", floorArea * 0.04, 7500, 5, "Cement", "Mason");
  add("Foundation","Backfill","Backfilling & Compaction","Cum", floorArea * 0.2, 200, 0, "", "Helper");

  for (let f = 0; f <= numFloors; f++) {
    const floorLabel = f === 0 ? "Ground Floor" : `Floor ${f}`;
    add(floorLabel,"RCC","RCC M25 – Columns","Cum", floorArea * 0.04, 8000, 5, "Cement", "Mason");
    add(floorLabel,"RCC","RCC M25 – Beams","Cum", floorArea * 0.06, 8000, 5, "Cement", "Mason");
    add(floorLabel,"RCC","RCC M25 – Slab","Cum", floorArea * 0.12, 7500, 5, "Cement", "Mason");
    add(floorLabel,"Steel","TMT Steel Fe500 – Columns","MT", floorArea * 0.005, 72000, 5, "Steel", "Steel Fixer");
    add(floorLabel,"Steel","TMT Steel Fe500 – Beams","MT", floorArea * 0.007, 72000, 5, "Steel", "Steel Fixer");
    add(floorLabel,"Steel","TMT Steel Fe500 – Slab","MT", floorArea * 0.009, 72000, 5, "Steel", "Steel Fixer");
    add(floorLabel,"Formwork","Shuttering – Columns","Sqm", floorArea * 0.5, 450, 5, "Wood", "Carpenter");
    add(floorLabel,"Formwork","Shuttering – Beams & Slab","Sqm", floorArea * 1.2, 420, 5, "Wood", "Carpenter");
    add(floorLabel,"Masonry","Brickwork 230mm (Ext)","Sqm", floorArea * 0.35, 320, 10, "Bricks", "Mason");
    add(floorLabel,"Masonry","Brickwork 115mm (Int)","Sqm", floorArea * 0.5, 280, 10, "Bricks", "Mason");
    add(floorLabel,"Plaster","Cement Plaster 12mm (Ext)","Sqm", floorArea * 0.9, 85, 10, "Cement", "Mason");
    add(floorLabel,"Plaster","Cement Plaster 12mm (Int)","Sqm", floorArea * 1.8, 75, 10, "Cement", "Mason");
    add(floorLabel,"Flooring","Vitrified Tile 600×600","Sqm", floorArea * 0.95, 750, 5, "Tiles", "Mason");
    add(floorLabel,"Flooring","Skirting Tile","Rmt", floorArea * 0.3, 120, 5, "Tiles", "Mason");
    add(floorLabel,"Doors","Teak Wood Door Frame + Shutter","No", Math.max(1, Math.round(floorArea / 200)), 18000, 3, "Wood", "Carpenter");
    add(floorLabel,"Windows","UPVC Sliding Window","No", Math.max(2, Math.round(floorArea / 150)), 8500, 3, "Glass", "Carpenter");
    add(floorLabel,"Painting","Interior Emulsion Paint","Sqm", floorArea * 1.8, 55, 5, "Paint", "Painter");
    add(floorLabel,"Painting","Exterior Texture Paint","Sqm", floorArea * 0.5, 120, 5, "Paint", "Painter");
    add(floorLabel,"Electrical","Electrical Wiring (Full)","Point", Math.round(floorArea / 15), 650, 5, "Electrical", "Electrician");
    add(floorLabel,"Electrical","MCB Distribution Board","No", 1, 4500, 2, "Electrical", "Electrician");
    add(floorLabel,"Electrical","Light Fixtures","No", Math.round(floorArea / 20), 850, 5, "Electrical", "Electrician");
    add(floorLabel,"Electrical","Power Sockets","No", Math.round(floorArea / 25), 350, 5, "Electrical", "Electrician");
    add(floorLabel,"Plumbing","CPVC Pipe 25mm","Rmt", floorArea * 0.4, 180, 10, "Plumbing", "Plumber");
    add(floorLabel,"Plumbing","PVC Drain 110mm","Rmt", floorArea * 0.3, 220, 10, "Plumbing", "Plumber");
    add(floorLabel,"Plumbing","Sanitary Ware Set","No", Math.max(1, Math.round(floorArea / 300)), 22000, 3, "Plumbing", "Plumber");
  }

  // Site Works
  add("Site Works","Water Tank","Overhead Water Tank 1000L","No", 1, 15000, 2, "Tank", "Plumber");
  add("Site Works","Septic","Septic Tank (Brick)","No", 1, 45000, 3, "Bricks", "Mason");
  add("Site Works","Compound","Compound Wall (1.8m)","Rmt", Math.sqrt(totalBuiltUpArea) * 4, 1200, 5, "Bricks", "Mason");
  add("Site Works","Compound","Main Gate (MS)","No", 1, 35000, 3, "Steel", "Welder");
  add("Site Works","Landscape","External Paving","Sqm", totalBuiltUpArea * 0.3, 280, 5, "Tiles", "Mason");

  return items;
}
