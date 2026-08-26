/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { regionsData, calculateMetrics } from './data';
import { PhilippineMap } from './components/PhilippineMap';
import { DashboardMetrics } from './components/DashboardMetrics';
import { Rankings } from './components/Rankings';
import { DataVisualizations } from './components/DataVisualizations';
import { AIBriefing } from './components/AIBriefing';
import { Chatbot } from './components/Chatbot';
import { Printer, Download, LayoutDashboard, Map as MapIcon, BarChart3, ListOrdered, FileText } from 'lucide-react';

type Section = 'intelligence' | 'diagnostic' | 'analytics' | 'rankings';

export default function App() {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<Section>('intelligence');

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

  const navItems = [
    { id: 'intelligence', label: 'Intelligence Briefing', icon: FileText },
    { id: 'diagnostic', label: 'Regional Diagnostic', icon: MapIcon },
    { id: 'analytics', label: 'Comparative Analytics', icon: BarChart3 },
    { id: 'rankings', label: 'National Leaderboard', icon: ListOrdered },
  ] as const;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 z-20 hidden md:flex">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
            <LayoutDashboard className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight leading-tight">AGRI-STAT</h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Philippines</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-800">
           <div className="bg-slate-800/50 rounded-lg p-4 flex flex-col gap-3 border border-slate-700/50">
             <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Simulation Year</span>
             <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-emerald-400">{selectedYear}</span>
             </div>
             <input 
                type="range" 
                min="2024" 
                max="2050" 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
              />
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 bg-slate-900/50 border-b border-slate-800 gap-4 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-4">
             <div className="md:hidden flex items-center gap-3 mr-4">
               <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center shrink-0">
                  <LayoutDashboard className="w-4 h-4 text-slate-950" />
               </div>
               <h1 className="text-sm font-bold tracking-tight">AGRI-STAT</h1>
             </div>
             <h2 className="text-lg font-bold text-slate-200 hidden sm:block">
               {navItems.find(n => n.id === activeSection)?.label}
             </h2>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            <select 
              value={selectedRegionId || ''} 
              onChange={(e) => setSelectedRegionId(e.target.value || null)}
              className="bg-slate-800 border-none text-xs rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer text-slate-200"
            >
              <option value="">All Regions (National View)</option>
              {regionsData.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            
            <div className="w-px h-6 bg-slate-800 hidden sm:block"></div>
            
            <div className="flex gap-2">
              <button onClick={handlePrint} className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors" title="Print Report">
                <Printer size={16} />
              </button>
              <button onClick={handleExportCSV} className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors" title="Export CSV">
                <Download size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Navigation */}
        <div className="md:hidden flex overflow-x-auto bg-slate-900 border-b border-slate-800 no-scrollbar">
           {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                    isActive 
                      ? 'text-emerald-400 border-emerald-500 bg-slate-800/30' 
                      : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <item.icon size={14} />
                  {item.label}
                </button>
              );
            })}
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full max-w-[1600px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeSection === 'intelligence' && (
                <div className="max-w-4xl">
                  <AIBriefing 
                    data={regionsData} 
                    selectedYear={selectedYear} 
                    selectedRegionId={selectedRegionId} 
                  />
                </div>
              )}

              {activeSection === 'diagnostic' && (
                <div className="flex flex-col xl:flex-row gap-6 items-stretch h-full">
                  <div className="xl:w-1/2 flex flex-col gap-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl relative flex flex-col p-4 overflow-hidden h-full min-h-[500px]">
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
                    </div>
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                      <p className="text-[11px] leading-relaxed text-slate-400">
                        <strong className="text-slate-300">Interpretation:</strong> This geospatial heatmap illustrates localized food security. <span className="text-emerald-400">Green regions</span> indicate self-sufficient agricultural output relative to local population density. <span className="text-rose-400">Red regions</span> highlight structural deficits, necessitating robust intra-national supply chains to import rice from surplus territories.
                      </p>
                    </div>
                  </div>

                  <div className="xl:w-1/2 flex flex-col gap-6">
                    <DashboardMetrics 
                      region={selectedRegion} 
                      selectedYear={selectedYear} 
                      allRegions={regionsData}
                    />
                  </div>
                </div>
              )}

              {activeSection === 'analytics' && (
                <DataVisualizations 
                  data={regionsData} 
                  selectedYear={selectedYear} 
                  selectedRegionId={selectedRegionId} 
                />
              )}

              {activeSection === 'rankings' && (
                <div className="max-w-3xl mx-auto">
                  <Rankings 
                    data={regionsData} 
                    selectedYear={selectedYear} 
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
        
        <Chatbot />
      </div>
    </div>
  );
}

