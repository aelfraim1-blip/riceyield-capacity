export type RegionData = {
  id: string;
  name: string;
  pop2024: number;
  pop2030: number;
  pop2035: number;
  riceYieldArea: number; // in hectares
  yieldPerHa: number; // in kg/ha
  minNeed: number; // in kg per capita
};

export const regionsData: RegionData[] = [
  { id: 'I', name: 'Ilocos Region', pop2024: 5342453, pop2030: 5605144.915, pop2035: 5833895.218, riceYieldArea: 408569, yieldPerHa: 4810, minNeed: 118.81 },
  { id: 'II', name: 'Cagayan Valley', pop2024: 3777608, pop2030: 3913730.476, pop2035: 4030905.357, riceYieldArea: 625570, yieldPerHa: 4670, minNeed: 118.81 },
  { id: 'III', name: 'Central Luzon', pop2024: 12989074, pop2030: 13858635.53, pop2035: 14627576.41, riceYieldArea: 673654, yieldPerHa: 5170, minNeed: 118.81 },
  { id: 'IVA', name: 'CALABARZON', pop2024: 16933234, pop2030: 18056002.89, pop2035: 19048306.5, riceYieldArea: 89402, yieldPerHa: 3480, minNeed: 118.81 },
  { id: 'V', name: 'Bicol Region', pop2024: 6064426, pop2030: 6039008.824, pop2035: 6017909.239, riceYieldArea: 333806, yieldPerHa: 3600, minNeed: 118.81 },
  { id: 'VI', name: 'Western Visayas', pop2024: 4861911, pop2030: 5058305.625, pop2035: 5228014.506, riceYieldArea: 571971, yieldPerHa: 3310, minNeed: 118.81 },
  { id: 'VII', name: 'Central Visayas', pop2024: 6640875, pop2030: 6781807.992, pop2035: 6901534.181, riceYieldArea: 100993, yieldPerHa: 3130, minNeed: 118.81 },
  { id: 'VIII', name: 'Eastern Visayas', pop2024: 4625929, pop2030: 4741138.116, pop2035: 4839334.521, riceYieldArea: 229260, yieldPerHa: 3610, minNeed: 118.81 },
  { id: 'IX', name: 'Zamboanga Peninsula', pop2024: 3943837, pop2030: 4044484.525, pop2035: 4130316.784, riceYieldArea: 165294, yieldPerHa: 4130, minNeed: 118.81 },
  { id: 'X', name: 'Northern Mindanao', pop2024: 5178326, pop2030: 5410177.154, pop2035: 5611296.725, riceYieldArea: 176990, yieldPerHa: 4600, minNeed: 118.81 },
  { id: 'XI', name: 'Davao Region', pop2024: 5389422, pop2030: 5607125.186, pop2035: 5795247.259, riceYieldArea: 112553, yieldPerHa: 4520, minNeed: 118.81 },
  { id: 'XII', name: 'SOCCSKSARGEN', pop2024: 4462776, pop2030: 4897725.893, pop2035: 5292395.58, riceYieldArea: 332229, yieldPerHa: 3650, minNeed: 118.81 },
  { id: 'CAR', name: 'CAR', pop2024: 1808985, pop2030: 1825339.349, pop2035: 1839080.861, riceYieldArea: 93509, yieldPerHa: 3200, minNeed: 118.81 },
  { id: 'BARMM', name: 'BARMM', pop2024: 5691583, pop2030: 6992152.277, pop2035: 8300273.091, riceYieldArea: 260963, yieldPerHa: 3510, minNeed: 118.81 },
  { id: 'XIII', name: 'Caraga', pop2024: 2865196, pop2030: 2954226.213, pop2035: 3030527.691, riceYieldArea: 164900, yieldPerHa: 3480, minNeed: 118.81 },
  { id: 'IVB', name: 'MIMAROPA', pop2024: 3245446, pop2030: 3270859.462, pop2035: 3292189.296, riceYieldArea: 306258, yieldPerHa: 3780, minNeed: 118.81 },
  { id: 'NCR', name: 'NCR', pop2024: 14001751, pop2030: 14787502.42, pop2035: 15475875.52, riceYieldArea: 0, yieldPerHa: 0, minNeed: 265 },
  { id: 'NIR', name: 'NIR', pop2024: 4904944, pop2030: 5121481.108, pop2035: 5309213.333, riceYieldArea: 0, yieldPerHa: 0, minNeed: 265 },
];

export function calculateMetrics(region: RegionData, year: '2024' | '2030' | '2035') {
  let population = region.pop2024;
  if (year === '2030') population = region.pop2030;
  if (year === '2035') population = region.pop2035;

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
