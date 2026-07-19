import { BOQItem, GanttTask, LabourRate, Equipment, MaterialItem, BillingRecord } from "./store";

export function computeLabourCost(rates: LabourRate[], hoursWorked: number): number {
  return rates.reduce((sum, r) => sum + ((r.dailyRate / 8) * hoursWorked * r.required), 0);
}

export function computeEquipmentCost(equipment: Equipment[], hoursUsed: number): number {
  return equipment.reduce((sum, eq) => sum + (eq.hourlyRate * hoursUsed), 0);
}

export function computeMaterialCost(materials: MaterialItem[], quantitiesUsed: Record<string, number>): number {
  return materials.reduce((sum, m) => {
    const used = quantitiesUsed[m.id] || 0;
    return sum + (used * m.todayPrice);
  }, 0);
}

export function computeEarnedValue(boq: BOQItem[], progressPercentage: number): number {
  const totalBudget = boq.reduce((s, i) => s + (i.quantity * i.rate), 0);
  return totalBudget * (progressPercentage / 100);
}

export function computeSPI(earnedValue: number, plannedValue: number): number {
  if (plannedValue === 0) return 1;
  return earnedValue / plannedValue;
}

export function computeCPI(earnedValue: number, actualCost: number): number {
  if (actualCost === 0) return 1;
  return earnedValue / actualCost;
}

export function forecastCompletion(cpi: number, totalBudget: number): number {
  if (cpi === 0) return totalBudget;
  return totalBudget / cpi;
}
