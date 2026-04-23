import { Units } from "@/generated/prisma/enums.js";

const LB_PER_KG = 2.2046226218;

export function kgToDisplayWeight(kg: number, units: Units): number {
  if (units === Units.metric) {
    return kg;
  }
  return kg * LB_PER_KG;
}

export function weightUnitSuffix(units: Units): "kg" | "lb" {
  return units === Units.metric ? "kg" : "lb";
}

export function formatWeightForPrompt(kg: number, units: Units, fractionDigits = 1): string {
  const value = kgToDisplayWeight(kg, units);
  const suffix = weightUnitSuffix(units);
  const factor = 10 ** fractionDigits;
  const rounded = Math.round(value * factor) / factor;
  return `${String(rounded)} ${suffix}`;
}
