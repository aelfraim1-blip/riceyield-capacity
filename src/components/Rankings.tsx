import React from 'react';
import { RegionData, calculateMetrics } from '../data';
import { Trophy, TrendingUp, AlertTriangle, Users, Map as MapIcon } from 'lucide-react';

interface Props {
  data: RegionData[];
  selectedYear: '2024' | '2030' | '2035';
}

export function Rankings({ data, selectedYear }: Props) {
  const regionsWithMetrics = data.map(r => ({
    region: r,
    metrics: calculateMetrics(r, selectedYear)
  }));

  const byCapacity = [...regionsWithMetrics].sort((a, b) => b.metrics.carryingCapacity - a.metrics.carryingCapacity);
  const byYield = [...regionsWithMetrics].sort((a, b) => b.region.yieldPerHa - a.region.yieldPerHa);
  const byProduction = [...regionsWithMetrics].sort((a, b) => b.metrics.production - a.metrics.production);
  const byPopulation = [...regionsWithMetrics].sort((a, b) => b.metrics.population - a.metrics.population);
  const byRequiredLand = [...regionsWithMetrics].sort((a, b) => b.metrics.requiredRiceLand - a.metrics.requiredRiceLand);
  const bySurplusDeficit = [...regionsWithMetrics].sort((a, b) => b.metrics.surplusDeficit - a.metrics.surplusDeficit);

  const largestDeficitRegion = bySurplusDeficit[bySurplusDeficit.length - 1];
  const hasDeficit = largestDeficitRegion.metrics.surplusDeficit < 0;

  const rankings = [
    { label: 'Highest Capacity', value: byCapacity[0]?.region.name, color: 'text-emerald-400' },
    { label: 'Lowest Capacity', value: byCapacity[byCapacity.length - 1]?.region.name, color: 'text-amber-400' },
    { label: 'Highest Yield', value: byYield[0]?.region.name, color: 'text-emerald-400' },
    { label: 'Highest Production', value: byProduction[0]?.region.name, color: 'text-emerald-400' },
    { label: 'Highest Population', value: byPopulation[0]?.region.name, color: 'text-rose-400' },
    { label: 'Highest Land Req.', value: byRequiredLand[0]?.region.name, color: 'text-amber-400' },
    { label: 'Largest Surplus', value: bySurplusDeficit[0]?.region.name, color: 'text-emerald-400' },
    { label: 'Largest Deficit', value: hasDeficit ? largestDeficitRegion.region.name : 'None', color: 'text-rose-400' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex-1 flex flex-col overflow-hidden">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Regional Performance Ranking</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 flex-1 overflow-y-auto">
        {rankings.map((r, i) => {
          return (
            <div key={i} className="flex items-center justify-between p-2.5 rounded bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-600 w-4">0{i + 1}</span>
                <span className="text-xs font-medium text-slate-200 truncate max-w-[120px] sm:max-w-[100px] md:max-w-[150px]" title={r.value}>{r.value}</span>
              </div>
              <span className={`text-[10px] font-bold ${r.color} shrink-0`}>{r.label}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-slate-800">
        <p className="text-[11px] leading-relaxed text-slate-400">
          <strong className="text-slate-300">Interpretation:</strong> This ranking highlights systemic disparities. Regions with the largest surplus (e.g., {bySurplusDeficit[0]?.region.name}) are crucial "food baskets" necessary to subsidize highly populated, land-scarce areas like {largestDeficitRegion.region.name}.
        </p>
      </div>
    </div>
  );
}
