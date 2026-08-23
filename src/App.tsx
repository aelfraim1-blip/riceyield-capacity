/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { regionsData, calculateMetrics } from './data';
import { PhilippineMap } from './components/PhilippineMap';
import { DashboardMetrics } from './components/DashboardMetrics';
import { Rankings } from './components/Rankings';
import { DataVisualizations } from './components/DataVisualizations';
import { AIBriefing } from './components/AIBriefing';
import { Printer, Download } from 'lucide-react';

export default function App() {
  const [selectedYear, setSelectedYear] = useState<'2024' | '2030' | '2035'>('2024');
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

  const selectedRegion = selectedRegionId ? regionsData.find(r => r.id === selectedRegionId) || null : null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ["Region ID", "Region Name", "Population", "Production (MT)", "Total Need (MT)", "Capacity Ratio", "Status"];
    const rows = regionsData.map(r => {
      const m = calculateMetrics(r, selectedYear);
      return [r.id, r.name, m.population, m.production, m.totalNeed, m.carryingCapacity.toFixed(3), m.status].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agri-stat-export-${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden">
      <header className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 bg-slate-900/50 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-slate-950" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight">AGRI-STAT <span className="text-emerald-500">PHILIPPINES</span></h1>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex gap-2">
            <button onClick={handlePrint} className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors" title="Print Report">
              <Printer size={16} />
            </button>
            <button onClick={handleExportCSV} className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors" title="Export CSV">
              <Download size={16} />
            </button>
          </div>
          <div className="w-px h-6 bg-slate-800 hidden sm:block"></div>
          <div className="flex bg-slate-800 p-1 rounded-md">
            <button 
              onClick={() => setSelectedYear('2024')}
              className={`px-4 py-1.5 text-xs font-medium rounded transition-colors ${selectedYear === '2024' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'hover:bg-slate-700'}`}
            >2024</button>
            <button 
              onClick={() => setSelectedYear('2030')}
              className={`px-4 py-1.5 text-xs font-medium rounded transition-colors ${selectedYear === '2030' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'hover:bg-slate-700'}`}
            >2030</button>
            <button 
              onClick={() => setSelectedYear('2035')}
              className={`px-4 py-1.5 text-xs font-medium rounded transition-colors ${selectedYear === '2035' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'hover:bg-slate-700'}`}
            >2035</button>
          </div>
          <select 
            value={selectedRegionId || ''} 
            onChange={(e) => setSelectedRegionId(e.target.value || null)}
            className="bg-slate-800 border-none text-xs rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="">All Regions</option>
            {regionsData.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-6 max-w-[1600px] mx-auto w-full">
        <AIBriefing 
          data={regionsData} 
          selectedYear={selectedYear} 
          selectedRegionId={selectedRegionId} 
        />

        <div className="flex flex-col xl:flex-row gap-6 items-stretch">
          <div className="xl:w-1/3 flex flex-col gap-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl relative flex flex-col p-4 overflow-hidden min-h-[500px]">
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Surplus
                </div>
                <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> Balance
                </div>
                <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> Shortage
                </div>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center">
                <PhilippineMap 
                  data={regionsData}
                  selectedYear={selectedYear}
                  selectedRegionId={selectedRegionId}
                  onSelectRegion={setSelectedRegionId}
                />
              </div>
              
              <div className="absolute bottom-4 right-4 text-[10px] text-slate-500 bg-slate-950/80 px-3 py-1.5 rounded-full border border-slate-800 z-10 pointer-events-none">
                Visualizing: Regional Food Security ({selectedYear})
              </div>
            </div>
            <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
              <p className="text-[11px] leading-relaxed text-slate-400">
                <strong className="text-slate-300">Interpretation:</strong> This geospatial heatmap illustrates localized food security. <span className="text-emerald-400">Green regions</span> indicate self-sufficient agricultural output relative to local population density. <span className="text-rose-400">Red regions</span> highlight structural deficits, necessitating robust intra-national supply chains to import rice from surplus territories.
              </p>
            </div>
          </div>

          <div className="xl:w-2/3 flex flex-col gap-6">
            <DashboardMetrics 
              region={selectedRegion} 
              selectedYear={selectedYear} 
              allRegions={regionsData}
            />
            <Rankings 
              data={regionsData} 
              selectedYear={selectedYear} 
            />
          </div>
        </div>

        {/* Detailed Visualizations */}
        <DataVisualizations 
          data={regionsData} 
          selectedYear={selectedYear} 
          selectedRegionId={selectedRegionId} 
        />
      </main>

      <footer className="px-6 py-3 bg-slate-900 text-[10px] text-slate-500 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-2 mt-auto">
        <p>© 2026 Department of Agriculture - Rice Planning Systems</p>
        <p>Forecasted carrying capacity and food security metrics</p>
      </footer>
    </div>
  );
}

