export type RegionData = {
  id: string;
  name: string;
  basePop2024: number; // P(0)
  growthRate: number; // r
  riceYieldArea: number; // in hectares
  yieldPerHa: number; // in kg/ha
  minNeed: number; // in kg per capita
};

export const regionsData: RegionData[] = [
  { id: 'I', name: 'Ilocos Region', basePop2024: 5342453, growthRate: 0.0080, riceYieldArea: 408569, yieldPerHa: 4810, minNeed: 118.81 },
  { id: 'II', name: 'Cagayan Valley', basePop2024: 3777608, growthRate: 0.0059, riceYieldArea: 625570, yieldPerHa: 4670, minNeed: 118.81 },
  { id: 'III', name: 'Central Luzon', basePop2024: 12989074, growthRate: 0.0108, riceYieldArea: 673654, yieldPerHa: 5170, minNeed: 118.81 },
  { id: 'IVA', name: 'CALABARZON', basePop2024: 16933234, growthRate: 0.0107, riceYieldArea: 89402, yieldPerHa: 3480, minNeed: 118.81 },
  { id: 'V', name: 'Bicol Region', basePop2024: 6064426, growthRate: -0.0007, riceYieldArea: 333806, yieldPerHa: 3600, minNeed: 118.81 },
  { id: 'VI', name: 'Western Visayas', basePop2024: 4861911, growthRate: 0.0066, riceYieldArea: 571971, yieldPerHa: 3310, minNeed: 118.81 },
  { id: 'VII', name: 'Central Visayas', basePop2024: 6640875, growthRate: 0.0035, riceYieldArea: 100993, yieldPerHa: 3130, minNeed: 118.81 },
  { id: 'VIII', name: 'Eastern Visayas', basePop2024: 4625929, growthRate: 0.0041, riceYieldArea: 229260, yieldPerHa: 3610, minNeed: 118.81 },
  { id: 'IX', name: 'Zamboanga Peninsula', basePop2024: 3943837, growthRate: 0.0042, riceYieldArea: 165294, yieldPerHa: 4130, minNeed: 118.81 },
  { id: 'X', name: 'Northern Mindanao', basePop2024: 5178326, growthRate: 0.0073, riceYieldArea: 176990, yieldPerHa: 4600, minNeed: 118.81 },
  { id: 'XI', name: 'Davao Region', basePop2024: 5389422, growthRate: 0.0066, riceYieldArea: 112553, yieldPerHa: 4520, minNeed: 118.81 },
  { id: 'XII', name: 'SOCCSKSARGEN', basePop2024: 4462776, growthRate: 0.0155, riceYieldArea: 332229, yieldPerHa: 3650, minNeed: 118.81 },
  { id: 'CAR', name: 'CAR', basePop2024: 1808985, growthRate: 0.0015, riceYieldArea: 93509, yieldPerHa: 3200, minNeed: 118.81 },
  { id: 'BARMM', name: 'BARMM', basePop2024: 5691583, growthRate: 0.0343, riceYieldArea: 260963, yieldPerHa: 3510, minNeed: 118.81 },
  { id: 'XIII', name: 'Caraga', basePop2024: 2865196, growthRate: 0.0051, riceYieldArea: 164900, yieldPerHa: 3480, minNeed: 118.81 },
  { id: 'IVB', name: 'MIMAROPA', basePop2024: 3245446, growthRate: 0.0013, riceYieldArea: 306258, yieldPerHa: 3780, minNeed: 118.81 },
  { id: 'NCR', name: 'NCR', basePop2024: 14001751, growthRate: 0.0091, riceYieldArea: 0, yieldPerHa: 0, minNeed: 265 },
  { id: 'NIR', name: 'NIR', basePop2024: 4904944, growthRate: 0.0072, riceYieldArea: 0, yieldPerHa: 0, minNeed: 265 },
];

/**
 * Applies the Logistic Growth Model: P(t) = K / (1 + A * e^(-rt))
 * This replaces the Exponential model to remove "infinite growth" bias. It models the demographic 
 * transition by naturally decelerating the population growth rate as it approaches a stabilization limit (K).
 */
export function calculateMetrics(region: RegionData, year: number) {
  const t = year - 2024;
  
  // K is the estimated demographic asymptote (assumed stabilization point, e.g., 2x current population)
  // This prevents the extreme upward bias seen in exponential long-term forecasts.
  const K = region.basePop2024 * 2.0; 
  const A = (K - region.basePop2024) / region.basePop2024;
  
  const population = Math.round(K / (1 + A * Math.exp(-region.growthRate * t)));

  const production = region.riceYieldArea * region.yieldPerHa; // Total kg
  const totalNeed = population * region.minNeed; // Total kg
  const carryingCapacity = totalNeed > 0 ? production / totalNeed : 0;
  const optimumPopulation = region.minNeed > 0 ? production / region.minNeed : 0;
  
  // Required Rice Land to feed the population
  const requiredRiceLand = region.yieldPerHa > 0 ? totalNeed / region.yieldPerHa : 0;
  const landGap = region.riceYieldArea - requiredRiceLand; // Positive is surplus land
  const surplusDeficit = production - totalNeed; // Positive is surplus kg

  let status: 'Surplus' | 'Shortage' | 'Balance' = 'Balance';
  if (carryingCapacity > 1.05) status = 'Surplus';
  else if (carryingCapacity < 0.95) status = 'Shortage';

  return {
    population,
    production,
    totalNeed,
    carryingCapacity,
    optimumPopulation,
    requiredRiceLand,
    landGap,
    surplusDeficit,
    status,
  };
}
