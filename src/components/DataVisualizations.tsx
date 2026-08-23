import React, { useMemo } from 'react';
import { RegionData, calculateMetrics } from '../data';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine, Legend } from 'recharts';
import { Activity, BarChart2, Map, Users } from 'lucide-react';

interface Props {
  data: RegionData[];
  selectedYear: '2024' | '2030' | '2035';
  selectedRegionId: string | null;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs">
        <p className="font-bold text-slate-200 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
            <span className="text-slate-400">{entry.name}:</span>
            <span className="font-semibold text-slate-100">
              {typeof entry.value === 'number' 
                ? (entry.value > 1000 ? entry.value.toLocaleString(undefined, {maximumFractionDigits: 0}) : entry.value.toFixed(2))
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function DataVisualizations({ data, selectedYear, selectedRegionId }: Props) {
  // 1. Trend Data: Production vs Total Need across years
  const trendData = useMemo(() => {
    const years: ('2024' | '2030' | '2035')[] = ['2024', '2030', '2035'];
    return years.map(year => {
      let prod = 0, need = 0;
      const regionsToUse = selectedRegionId ? data.filter(r => r.id === selectedRegionId) : data;
      
      regionsToUse.forEach(r => {
        const m = calculateMetrics(r, year);
        prod += m.production;
        need += m.totalNeed;
      });
      
      return { 
        year, 
        Production: prod / 1000, 
        Demand: need / 1000 
      };
    });
  }, [data, selectedRegionId]);

  // 2. Regional Capacity Comparison for the selected year
  const capacityData = useMemo(() => {
    return data.map(r => {
      const m = calculateMetrics(r, selectedYear);
      return {
        id: r.id,
        name: r.name,
        capacity: m.carryingCapacity,
      };
    }).sort((a, b) => b.capacity - a.capacity); // Sort highest to lowest
  }, [data, selectedYear]);

  // 3. Optimal vs Projected Population Comparison
  const popComparisonData = useMemo(() => {
    return data.map(r => {
      const m = calculateMetrics(r, selectedYear);
      return {
        id: r.id,
        name: r.name,
        Projected: m.population,
        Optimal: m.optimumPopulation
      };
    }).sort((a, b) => b.Projected - a.Projected);
  }, [data, selectedYear]);

  // 4. Existing vs Required Land Comparison
  const landComparisonData = useMemo(() => {
    return data.map(r => {
      const m = calculateMetrics(r, selectedYear);
      return {
        id: r.id,
        name: r.name,
        Existing: r.riceYieldArea,
        Required: m.requiredRiceLand
      };
    }).sort((a, b) => b.Required - a.Required);
  }, [data, selectedYear]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      
      {/* Chart 1: Trend Area Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-2">
          <Activity size={16} className="text-blue-400" />
          Production vs Demand Forecast (MT)
        </h3>
        <p className="text-[10px] text-slate-500 mb-4">
          <strong className="text-slate-400">Interpretation:</strong> Visualizes the widening or shrinking gap between agricultural output and population demand over time. Converging lines indicate looming food insecurity.
        </p>
        <div className="flex-1 min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="year" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value/1000).toFixed(1)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} iconType="circle" />
              <Area type="monotone" dataKey="Production" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProd)" />
              <Area type="monotone" dataKey="Demand" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorDemand)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Regional Capacity Bar Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-2">
          <BarChart2 size={16} className="text-emerald-400" />
          Regional Carrying Capacity Ratio ({selectedYear})
        </h3>
        <p className="text-[10px] text-slate-500 mb-4">
          <strong className="text-slate-400">Interpretation:</strong> Values below 1.0 (Optimal) represent regions incapable of feeding their own population without external intervention, imports, or increased yield efficiency.
        </p>
        <div className="flex-1 min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={capacityData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="id" stroke="#64748b" fontSize={9} interval={0} angle={-45} textAnchor="end" tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b', opacity: 0.4 }} />
              <ReferenceLine y={1.0} stroke="#fbbf24" strokeDasharray="3 3" label={{ position: 'top', value: 'Optimal (1.0)', fill: '#fbbf24', fontSize: 10 }} />
              <Bar dataKey="capacity" name="Capacity Ratio" radius={[4, 4, 0, 0]}>
                {capacityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.capacity > 1.05 ? '#10b981' : entry.capacity < 0.95 ? '#f43f5e' : '#fbbf24'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Projected vs Optimal Population (Figure 6 Analog) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col lg:col-span-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-2">
          <Users size={16} className="text-blue-400" />
          Comparison of Projected vs. Optimal Population ({selectedYear})
        </h3>
        <p className="text-[10px] text-slate-500 mb-4">
          <strong className="text-slate-400">Interpretation:</strong> Inspired by population growth analysis, this chart compares the forecasted population against the theoretical maximum population the region's agricultural output can sustain (Optimal Population).
        </p>
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={popComparisonData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="id" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${(val/1000000).toFixed(1)}M`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b', opacity: 0.4 }} />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} iconType="circle" />
              <Bar dataKey="Projected" name="Projected Population" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Optimal" name="Optimal Capacity" fill="#10b981" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 4: Land Need Analysis (Figure 7 Analog) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col lg:col-span-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-2">
          <Map size={16} className="text-amber-400" />
          Agricultural Land Need vs. Existing Land ({selectedYear})
        </h3>
        <p className="text-[10px] text-slate-500 mb-4">
          <strong className="text-slate-400">Interpretation:</strong> Evaluates the physical land requirement to support the projected population. Regions where the "Required" bar exceeds the "Existing" bar face severe land shortages (often driven by urban sprawl/land conversion).
        </p>
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={landComparisonData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="id" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${(val/1000).toFixed(0)}k ha`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b', opacity: 0.4 }} />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} iconType="circle" />
              <Bar dataKey="Existing" name="Existing Agricultural Area" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Required" name="Required Land Need" fill="#f43f5e" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
