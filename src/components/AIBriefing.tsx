import React, { useMemo } from 'react';
import { RegionData, calculateMetrics } from '../data';
import { Bot, AlertTriangle, CheckCircle2, TrendingDown, TrendingUp, ShieldAlert, Target, Zap, Activity, Info, ArrowRight } from 'lucide-react';

interface Props {
  data: RegionData[];
  selectedYear: number;
  selectedRegionId: string | null;
}

export function AIBriefing({ data, selectedYear, selectedRegionId }: Props) {
  const briefing = useMemo(() => {
    // Generate an advanced intelligence briefing
    if (selectedRegionId) {
      const region = data.find(r => r.id === selectedRegionId);
      if (!region) return null;
      
      const m = calculateMetrics(region, selectedYear);
      const isDeficit = m.surplusDeficit < 0;
      
      // Calculate ranks
      const allMetrics = data.map(r => ({ id: r.id, ...calculateMetrics(r, selectedYear) }));
      const prodRank = allMetrics.sort((a, b) => b.production - a.production).findIndex(x => x.id === region.id) + 1;
      const popRank = allMetrics.sort((a, b) => b.population - a.population).findIndex(x => x.id === region.id) + 1;
      const capRank = allMetrics.sort((a, b) => b.carryingCapacity - a.carryingCapacity).findIndex(x => x.id === region.id) + 1;

      const riskLevel = m.carryingCapacity < 0.5 ? 'Severe' : m.carryingCapacity < 1 ? 'Critical' : m.carryingCapacity < 1.2 ? 'Moderate' : 'Low';
      const riskColor = riskLevel === 'Severe' || riskLevel === 'Critical' ? 'text-rose-400' : riskLevel === 'Moderate' ? 'text-amber-400' : 'text-emerald-400';

      return {
        title: `${region.name} Automated Analysis`,
        subtitle: `Regional Diagnostic Report for ${selectedYear}`,
        status: m.status,
        executiveSummary: `${region.name} is operating at a carrying capacity ratio of ${m.carryingCapacity.toFixed(3)} for the year ${selectedYear}. The region will experience a projected ${isDeficit ? 'shortfall' : 'surplus'} of ${Math.abs(m.surplusDeficit / 1000).toLocaleString(undefined, {maximumFractionDigits: 1})}k Metric Tons (MT). With a population of ${m.population.toLocaleString()}, the agricultural output ${isDeficit ? 'fails to meet basic demands without intervention' : 'exceeds local consumption, positioning the region as a net exporter'}.`,
        metricsBreakdown: [
          { label: 'Production Rank', value: `#${prodRank} of ${data.length}`, context: `${(m.production / 1000).toLocaleString(undefined, {maximumFractionDigits: 0})}k MT generated` },
          { label: 'Demand Rank', value: `#${popRank} of ${data.length}`, context: `${(m.totalNeed / 1000).toLocaleString(undefined, {maximumFractionDigits: 0})}k MT required` },
          { label: 'Capacity Rank', value: `#${capRank} of ${data.length}`, context: `Ratio of ${m.carryingCapacity.toFixed(2)}` },
          { label: 'Land Gap', value: `${m.landGap > 0 ? '+' : ''}${m.landGap.toLocaleString(undefined, {maximumFractionDigits: 0})} ha`, context: isDeficit ? 'Shortfall in rice land area' : 'Excess productive buffer' }
        ],
        riskAssessment: {
          level: riskLevel,
          color: riskColor,
          details: isDeficit 
            ? `The region exhibits a high dependency on external supply chains. A land gap of ${Math.abs(m.landGap).toLocaleString(undefined, {maximumFractionDigits: 0})} hectares means immediate policy intervention is required to avoid localized inflation and food insecurity.`
            : `The region acts as a stabilizing pillar for national food security. Over-production creates an optimal buffer, but requires adequate post-harvest facilities to prevent spoilage.`
        },
        recommendations: isDeficit ? [
          `Prioritize yield optimization: Increase metric tons per hectare via high-yield varieties to offset the ${Math.abs(m.landGap).toLocaleString(undefined, {maximumFractionDigits: 0})} ha land gap.`,
          `Establish robust logistics and import agreements with surplus regions (e.g., Central Luzon, Cagayan Valley) to bridge the ${Math.abs(m.surplusDeficit / 1000).toLocaleString(undefined, {maximumFractionDigits: 1})}k MT deficit.`,
          `Implement zoning laws to protect the remaining ${region.riceYieldArea.toLocaleString()} hectares of agricultural land from urban encroachment.`
        ] : [
          `Expand cold storage and post-harvest infrastructure to manage the ${Math.abs(m.surplusDeficit / 1000).toLocaleString(undefined, {maximumFractionDigits: 1})}k MT surplus and minimize waste.`,
          `Develop inter-regional trade corridors to efficiently distribute excess yield to neighboring deficit regions.`,
          `Provide subsidies to maintain current yield efficiency and reward sustained surplus production.`
        ],
        icon: isDeficit ? AlertTriangle : CheckCircle2,
        color: isDeficit ? 'text-rose-400' : 'text-emerald-400',
        bg: isDeficit ? 'bg-rose-500/5 border-rose-500/20' : 'bg-emerald-500/5 border-emerald-500/20'
      };
    } else {
      let totalProd = 0;
      let totalNeed = 0;
      let totalLandGap = 0;
      let shortageCount = 0;
      const sortedByCapacity = [...data].map(r => ({ r, m: calculateMetrics(r, selectedYear) })).sort((a, b) => a.m.carryingCapacity - b.m.carryingCapacity);
      
      data.forEach(r => {
        const m = calculateMetrics(r, selectedYear);
        totalProd += m.production;
        totalNeed += m.totalNeed;
        totalLandGap += m.landGap;
        if (m.status === 'Shortage') shortageCount++;
      });
      
      const nationalCap = totalNeed > 0 ? totalProd / totalNeed : 0;
      const isDeficit = totalProd < totalNeed;
      const biggestDeficit = sortedByCapacity[0];
      const biggestSurplus = sortedByCapacity[sortedByCapacity.length - 1];

      const riskLevel = nationalCap < 0.9 ? 'Severe' : nationalCap < 1 ? 'Critical' : nationalCap < 1.1 ? 'Moderate' : 'Low';
      const riskColor = riskLevel === 'Severe' || riskLevel === 'Critical' ? 'text-rose-400' : riskLevel === 'Moderate' ? 'text-amber-400' : 'text-emerald-400';

      return {
        title: 'National Strategic Intelligence Briefing',
        subtitle: `Macro-Level Security Diagnostic for ${selectedYear}`,
        status: isDeficit ? 'Shortage' : 'Surplus',
        executiveSummary: `For the fiscal year ${selectedYear}, the Philippines is projected to operate at a national carrying capacity ratio of ${nationalCap.toFixed(3)}. The country faces an aggregate net ${isDeficit ? 'deficit' : 'surplus'} of ${Math.abs((totalProd - totalNeed) / 1000).toLocaleString(undefined, {maximumFractionDigits: 1})}k MT. Currently, ${shortageCount} out of ${data.length} regions are structurally unable to sustain their own populations independently.`,
        metricsBreakdown: [
          { label: 'Nat. Production', value: `${(totalProd / 1000000).toLocaleString(undefined, {maximumFractionDigits: 2})}M MT`, context: 'Total output across all regions' },
          { label: 'Nat. Demand', value: `${(totalNeed / 1000000).toLocaleString(undefined, {maximumFractionDigits: 2})}M MT`, context: 'Total consumption requirement' },
          { label: 'Deficit Regions', value: `${shortageCount} of ${data.length}`, context: 'Operating below 1.0 capacity' },
          { label: 'Net Land Gap', value: `${totalLandGap > 0 ? '+' : ''}${(totalLandGap / 1000).toLocaleString(undefined, {maximumFractionDigits: 1})}k ha`, context: 'Aggregate theoretical land balance' }
        ],
        riskAssessment: {
          level: riskLevel,
          color: riskColor,
          details: isDeficit 
            ? `The nation faces a macro-level vulnerability. Domestic production cannot cover demand, necessitating international imports. The most severe internal crisis point is ${biggestDeficit.r.name} with a ratio of ${biggestDeficit.m.carryingCapacity.toFixed(2)}.`
            : `National self-sufficiency is maintained. However, internal supply chain logistics are critical to distribute the surplus from regions like ${biggestSurplus.r.name} (Ratio: ${biggestSurplus.m.carryingCapacity.toFixed(2)}) to the ${shortageCount} deficit regions.`
        },
        recommendations: [
          `Targeted Yield Interventions: Focus national agricultural subsidies and modern technology adoption on the ${shortageCount} underperforming regions to lift their carrying capacity.`,
          `Supply Chain Optimization: Establish high-efficiency transport routes connecting ${biggestSurplus.r.name} directly to consumption centers like ${biggestDeficit.r.name}.`,
          `Strategic Land Management: To offset the aggregate national land gap of ${Math.abs(totalLandGap).toLocaleString(undefined, {maximumFractionDigits: 0})} hectares, the DA must incentivize vertical farming, double-cropping, and protect existing agricultural zones from urbanization.`
        ],
        icon: isDeficit ? AlertTriangle : CheckCircle2,
        color: isDeficit ? 'text-rose-400' : 'text-emerald-400',
        bg: isDeficit ? 'bg-rose-500/5 border-rose-500/20' : 'bg-emerald-500/5 border-emerald-500/20'
      };
    }
  }, [data, selectedYear, selectedRegionId]);

  if (!briefing) return null;
  const Icon = briefing.icon;

  return (
    <div className={`rounded-2xl border p-6 flex flex-col gap-6 ${briefing.bg}`}>
      {/* Header Section */}
      <div className="flex gap-4 items-start border-b border-slate-800/50 pb-5">
        <div className={`p-3 rounded-xl bg-slate-900/80 border border-slate-800 ${briefing.color} shrink-0 shadow-sm`}>
          <Bot size={24} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-1.5">
            <h3 className={`font-bold text-lg ${briefing.color}`}>{briefing.title}</h3>
            <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-700 shadow-sm">
              <Activity size={12} className="text-blue-400" />
              Deep Analysis Output
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">{briefing.subtitle}</p>
        </div>
      </div>

      {/* Executive Summary */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
          <Info size={14} /> Executive Summary
        </h4>
        <p className="text-sm text-slate-300 leading-relaxed">
          {briefing.executiveSummary}
        </p>
      </div>

      {/* Core Metrics Grid */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
          <Target size={14} /> Core Metrics Breakdown
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {briefing.metricsBreakdown.map((metric, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800/50 rounded-lg p-3">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{metric.label}</div>
              <div className="text-lg font-bold text-slate-200 mb-1">{metric.value}</div>
              <div className="text-[10px] text-slate-400 leading-tight">{metric.context}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Risk Assessment */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
            <ShieldAlert size={14} /> Risk Assessment
          </h4>
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-lg p-4 h-full">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-slate-400">Threat Level:</span>
              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-950 border border-slate-800 ${briefing.riskAssessment.color}`}>
                {briefing.riskAssessment.level}
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {briefing.riskAssessment.details}
            </p>
          </div>
        </div>

        {/* Strategic Recommendations */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
            <Zap size={14} /> Strategic Recommendations
          </h4>
          <ul className="space-y-3">
            {briefing.recommendations.map((rec, i) => (
               <li key={i} className="flex gap-3 text-sm text-slate-300 items-start bg-slate-900/30 p-3 rounded-lg border border-slate-800/50">
                 <ArrowRight size={14} className={`shrink-0 mt-0.5 ${briefing.color}`} />
                 <span className="leading-relaxed">{rec}</span>
               </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

