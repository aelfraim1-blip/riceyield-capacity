import React, { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RegionData, calculateMetrics } from '../data';

interface MapProps {
  data: RegionData[];
  selectedYear: number;
  selectedRegionId: string | null;
  onSelectRegion: (id: string | null) => void;
}

const mapPositions: Record<string, { x: number; y: number }> = {
  'I': { x: 30, y: 10 },
  'CAR': { x: 45, y: 15 },
  'II': { x: 60, y: 10 },
  'III': { x: 40, y: 25 },
  'NCR': { x: 50, y: 30 },
  'IVA': { x: 55, y: 38 },
  'IVB': { x: 35, y: 45 },
  'V': { x: 70, y: 45 },
  'VI': { x: 50, y: 58 },
  'NIR': { x: 60, y: 65 },
  'VII': { x: 70, y: 60 },
  'VIII': { x: 85, y: 52 },
  'IX': { x: 45, y: 75 },
  'X': { x: 65, y: 72 },
  'XIII': { x: 85, y: 70 },
  'BARMM': { x: 50, y: 85 },
  'XII': { x: 65, y: 88 },
  'XI': { x: 80, y: 82 },
};

export function PhilippineMap({ data, selectedYear, selectedRegionId, onSelectRegion }: MapProps) {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="relative w-full h-[480px] max-h-[600px] mx-auto overflow-hidden group" onClick={() => onSelectRegion(null)}>
      
      <div className="absolute top-2 right-2 flex flex-col gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 p-1 rounded-lg border border-slate-700 backdrop-blur-sm">
        <button onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(z + 0.5, 3)); }} className="bg-slate-800 hover:bg-slate-700 text-slate-300 w-7 h-7 flex items-center justify-center rounded border border-slate-600 transition-colors">+</button>
        <button onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(z - 0.5, 1)); }} className="bg-slate-800 hover:bg-slate-700 text-slate-300 w-7 h-7 flex items-center justify-center rounded border border-slate-600 transition-colors">-</button>
      </div>

      <div className="w-full h-full transform origin-center transition-transform duration-300" style={{ transform: `scale(${zoom})` }}>
        <svg viewBox="0 0 400 600" className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
        <path d="M150 50 L180 30 L210 60 L230 40 L240 80 L210 110 L180 140 L150 120 Z" fill="none" stroke="#1e293b" strokeWidth="2"/>
        <path d="M180 140 L200 250 L140 280 L230 320 L170 450 L240 480 L190 520" fill="none" stroke="#1e293b" strokeWidth="2"/>
      </svg>
      {data.map((region) => {
        const pos = mapPositions[region.id];
        if (!pos) return null;

        const metrics = calculateMetrics(region, selectedYear);
        let colorClass = 'bg-slate-800/50 border-slate-700 text-slate-400';
        let dotColor = 'bg-slate-500';
        let shadowColor = '';
        
        if (metrics.status === 'Surplus') {
          colorClass = 'bg-emerald-500/20 border-emerald-500/50 hover:bg-emerald-500/40 text-emerald-400';
          dotColor = 'bg-emerald-500';
          shadowColor = 'shadow-[0_0_15px_rgba(16,185,129,0.3)]';
        } else if (metrics.status === 'Shortage') {
          colorClass = 'bg-rose-500/20 border-rose-500/50 hover:bg-rose-500/40 text-rose-400';
          dotColor = 'bg-rose-500';
          shadowColor = 'shadow-[0_0_15px_rgba(244,63,94,0.3)]';
        } else if (metrics.status === 'Balance') {
          colorClass = 'bg-amber-500/20 border-amber-500/50 hover:bg-amber-500/40 text-amber-400';
          dotColor = 'bg-amber-500';
          shadowColor = 'shadow-[0_0_15px_rgba(245,158,11,0.3)]';
        }

        const isSelected = selectedRegionId === region.id;
        if (isSelected) {
          colorClass = twMerge(colorClass, 'ring-1 ring-slate-100 ring-offset-2 ring-offset-slate-900 scale-125 z-10 font-bold', shadowColor);
        }

        return (
          <button
            key={region.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelectRegion(region.id);
            }}
            className={twMerge(
              "absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out cursor-pointer border shadow-sm backdrop-blur-sm",
              colorClass,
              isSelected ? "w-14 h-14" : "w-10 h-10 hover:scale-110"
            )}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            title={`${region.name} - ${metrics.status}`}
          >
            <span className="text-[10px] sm:text-xs">{region.id}</span>
            <div className={twMerge("absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full shadow-sm", dotColor)} />
          </button>
        );
      })}
      </div>
    </div>
  );
}
