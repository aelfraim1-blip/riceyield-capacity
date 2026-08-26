import React, { useMemo } from 'react';
import { RegionData, calculateMetrics } from '../data';
import { Users, TrendingUp, Package, Percent, UserCheck, Map as MapIcon, Maximize2, Info } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface Props {
  region: RegionData | null;
  selectedYear: number;
  allRegions: RegionData[];
}

export function DashboardMetrics({ region, selectedYear, allRegions }: Props) {
  // Aggregate if no region selected
  let population = 0;
  let production = 0;
  let totalNeed = 0;
  let riceYieldArea = 0;
  
  if (region) {
    const m = calculateMetrics(region, selectedYear);
    population = m.population;
    production = m.production;
    totalNeed = m.totalNeed;
    riceYieldArea = region.riceYieldArea;
  } else {
    allRegions.forEach(r => {
      const m = calculateMetrics(r, selectedYear);
      population += m.population;
      production += m.production;
      totalNeed += m.totalNeed;
      riceYieldArea += r.riceYieldArea;
    });
  }

  const carryingCapacity = totalNeed > 0 ? production / totalNeed : 0;
  // Weighted minNeed is totalNeed / population
  const avgMinNeed = population > 0 ? totalNeed / population : 118.81;
  const optimumPopulation = avgMinNeed > 0 ? production / avgMinNeed : 0;
  
  // Aggregate yield per ha is production / riceYieldArea
  const avgYieldPerHa = riceYieldArea > 0 ? production / riceYieldArea : 0;
  const requiredRiceLand = avgYieldPerHa > 0 ? totalNeed / avgYieldPerHa : 0;
  const landGap = riceYieldArea - requiredRiceLand;

  const trendData = useMemo(() => {
    const years = [2024, 2030, 2035, 2040, 2045, 2050];
    return years.map(year => {
      let pop = 0, prod = 0, need = 0, area = 0;
      if (region) {
        const m = calculateMetrics(region, year);
        pop = m.population; prod = m.production; need = m.totalNeed; area = region.riceYieldArea;
      } else {
        allRegions.forEach(r => {
          const m = calculateMetrics(r, year);
          pop += m.population; prod += m.production; need += m.totalNeed; area += r.riceYieldArea;
        });
      }
      const cap = need > 0 ? prod / need : 0;
      const aMinNeed = pop > 0 ? need / pop : 118.81;
      const optPop = aMinNeed > 0 ? prod / aMinNeed : 0;
      const aYieldHa = area > 0 ? prod / area : 0;
      const reqLand = aYieldHa > 0 ? need / aYieldHa : 0;
      
      return {
        year,
        production: prod,
        population: pop,
        totalNeed: need,
        carryingCapacity: cap,
        optimumPopulation: optPop,
        requiredRiceLand: reqLand,
        landGap: area - reqLand
      };
    });
  }, [region, allRegions]);

  const metrics = [
    { label: 'Rice Production', value: `${(production / 1000).toLocaleString(undefined, {maximumFractionDigits: 0})} MT`, icon: TrendingUp, dataKey: 'production', tooltip: 'Estimated total milled rice yield (Metric Tons).' },
    { label: 'Projected Population', value: population.toLocaleString(), icon: Users, dataKey: 'population', tooltip: 'Forecasted number of individuals for the year.' },
    { label: 'Total Need', value: `${(totalNeed / 1000).toLocaleString(undefined, {maximumFractionDigits: 0})} MT`, icon: Package, dataKey: 'totalNeed', tooltip: 'Minimum physical requirement based on population.' },
    { label: 'Capacity Ratio', value: carryingCapacity.toFixed(3), icon: Percent, dataKey: 'carryingCapacity', tooltip: 'Production ÷ Total Need. >1.0 is surplus, <1.0 is shortage.' },
    { label: 'Optimum Population', value: optimumPopulation.toLocaleString(undefined, {maximumFractionDigits: 0}), icon: UserCheck, dataKey: 'optimumPopulation', tooltip: 'Maximum population the current production can sustain.' },
    { label: 'Required Rice Land', value: `${requiredRiceLand.toLocaleString(undefined, {maximumFractionDigits: 0})} ha`, icon: MapIcon, dataKey: 'requiredRiceLand', tooltip: 'Hectares of land required to meet total demand.' },
    { label: 'Land Gap', value: `${landGap > 0 ? '+' : ''}${landGap.toLocaleString(undefined, {maximumFractionDigits: 0})} ha`, icon: Maximize2, dataKey: 'landGap', tooltip: 'Difference between available land and required land.' },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-start mb-2 px-1">
        <div>
          <h3 className="text-lg font-bold text-slate-100">{region ? region.name : 'National Summary'}</h3>
          <p className="text-xs text-slate-500">{region ? 'Selected Region' : 'All Regions'} ({selectedYear})</p>
        </div>
        {region && (
          <span className={`text-[10px] font-bold px-2 py-1 rounded border tracking-wider uppercase ${
            carryingCapacity > 1.05 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
            carryingCapacity < 0.95 ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
            'bg-amber-500/10 text-amber-500 border-amber-500/20'
          }`}>
            {carryingCapacity > 1.05 ? 'Surplus' : carryingCapacity < 0.95 ? 'Shortage' : 'Balance'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          
          let valueColor = 'text-white';
          let strokeColor = '#94a3b8'; // slate-400
          if (m.label === 'Capacity Ratio') { valueColor = 'text-amber-400'; strokeColor = '#fbbf24'; }
          else if (m.label === 'Land Gap') { valueColor = 'text-rose-500'; strokeColor = '#f43f5e'; }
          else if (m.label === 'Rice Production') { valueColor = 'text-emerald-400'; strokeColor = '#34d399'; }

          return (
            <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col justify-between overflow-hidden relative">
              <div>
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="flex items-center gap-1 group relative cursor-help">
                    <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider leading-tight border-b border-dashed border-slate-600">{m.label}</p>
                    <Info size={10} className="text-slate-500 hidden sm:block" />
                    
                    {/* Tooltip */}
                    <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      {m.tooltip}
                      <div className="absolute -bottom-1 left-4 w-2 h-2 bg-slate-800 border-b border-r border-slate-700 transform rotate-45"></div>
                    </div>
                  </div>
                  <Icon size={14} className="text-slate-500 shrink-0" />
                </div>
                <p className={`text-lg sm:text-xl font-bold ${valueColor}`}>{m.value}</p>
              </div>
              <div className="h-8 mt-3 w-full opacity-80 -mx-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <YAxis domain={['auto', 'auto']} hide />
                    <Line 
                      type="monotone" 
                      dataKey={m.dataKey} 
                      stroke={strokeColor} 
                      strokeWidth={2} 
                      dot={{ r: 2, fill: strokeColor, strokeWidth: 0 }} 
                      isAnimationActive={false} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
        <p className="text-xs text-slate-400">
          <strong className="text-slate-300">Interpretation:</strong> {region 
            ? `The data indicates that ${region.name}'s agricultural production can optimally sustain ${optimumPopulation.toLocaleString(undefined, {maximumFractionDigits: 0})} individuals. With a projected demand from ${population.toLocaleString()} people in ${selectedYear}, the region operates at a ${carryingCapacity > 1 ? 'surplus' : 'shortage'}, requiring a land gap adjustment of ${Math.abs(landGap).toLocaleString(undefined, {maximumFractionDigits: 0})} hectares.`
            : `Nationally, agricultural production can optimally sustain ${optimumPopulation.toLocaleString(undefined, {maximumFractionDigits: 0})} individuals. With a projected demand from ${population.toLocaleString()} people in ${selectedYear}, the country operates at an overall ${carryingCapacity > 1 ? 'surplus' : 'shortage'}, necessitating an absolute land gap correction of ${Math.abs(landGap).toLocaleString(undefined, {maximumFractionDigits: 0})} hectares.`}
        </p>
      </div>
    </div>
  );
}
