import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Candidate } from '../types';
import { Sparkles, BarChart2 } from 'lucide-react';

interface SkillsFrequencyChartProps {
  candidates: Candidate[];
  selectedSkillsFilter: string[];
  onToggleSkillFilter: (skill: string) => void;
}

interface SkillData {
  skill: string;
  count: number;
  candidatesList: string[];
}

export default function SkillsFrequencyChart({
  candidates,
  selectedSkillsFilter,
  onToggleSkillFilter,
}: SkillsFrequencyChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 260 });
  const [hoveredBar, setHoveredBar] = useState<SkillData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Handle responsiveness via ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        // Keep height reasonable but responsive
        const height = width < 500 ? 200 : 260;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Calculate skill frequency statistics across the candidate pool
  const { topSkills, totalUniqueSkills } = useMemo(() => {
    const counts: Record<string, { count: number; names: string[] }> = {};

    candidates.forEach((cand) => {
      cand.skills.forEach((skill) => {
        const trimmed = skill.trim();
        if (trimmed) {
          if (!counts[trimmed]) {
            counts[trimmed] = { count: 0, names: [] };
          }
          counts[trimmed].count += 1;
          if (!counts[trimmed].names.includes(cand.name)) {
            counts[trimmed].names.push(cand.name);
          }
        }
      });
    });

    const uniqueCount = Object.keys(counts).length;

    const sortedSkills = Object.entries(counts)
      .map(([skill, data]) => ({
        skill,
        count: data.count,
        candidatesList: data.names,
      }))
      .sort((a, b) => b.count - a.count || a.skill.localeCompare(b.skill));

    // Display top 10 skills (or top 7 on small screens)
    const limit = dimensions.width < 450 ? 6 : dimensions.width < 650 ? 8 : 12;

    return {
      topSkills: sortedSkills.slice(0, limit),
      totalUniqueSkills: uniqueCount,
    };
  }, [candidates, dimensions.width]);

  // Margin definitions
  const margin = { top: 20, right: 15, bottom: 45, left: 35 };
  const { width, height } = dimensions;

  // D3 Scales calculation
  const { xScale, yScale, bars } = useMemo(() => {
    const xScale = d3
      .scaleBand()
      .domain(topSkills.map((d) => d.skill))
      .range([margin.left, width - margin.right])
      .padding(0.32);

    const maxCount = topSkills.length > 0 ? Math.max(...topSkills.map((d) => d.count)) : 1;
    // Buffer the top axis
    const yScale = d3
      .scaleLinear()
      .domain([0, Math.max(maxCount + 1, 4)])
      .range([height - margin.bottom, margin.top]);

    const bars = topSkills.map((d) => {
      const x = xScale(d.skill) || 0;
      const y = yScale(d.count);
      const barWidth = xScale.bandwidth();
      const barHeight = height - margin.bottom - y;

      return {
        ...d,
        x,
        y,
        barWidth,
        barHeight,
      };
    });

    return { xScale, yScale, bars };
  }, [topSkills, width, height, margin.left, margin.right, margin.bottom, margin.top]);

  // Generate vertical grid lines and tick marks
  const yTicks = useMemo(() => {
    const maxVal = yScale.domain()[1];
    const step = maxVal <= 6 ? 1 : Math.ceil(maxVal / 5);
    const ticks = [];
    for (let i = 0; i <= maxVal; i += step) {
      ticks.push(Math.round(i));
    }
    return Array.from(new Set(ticks));
  }, [yScale]);

  return (
    <div className="liquid-glass border border-white/10 rounded-2xl p-5 md:p-6 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80">
            <BarChart2 size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-sm tracking-tight text-white flex items-center gap-1.5">
              Talent Skill Frequency Distribution
              <Sparkles size={13} className="text-white/40" />
            </h3>
            <p className="text-[10px] text-gray-400 font-light mt-0.5">
              Aggregated skill occurrence across current candidates. Click on any bar to filter results.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-right">
            <span className="block text-[9px] uppercase tracking-wider text-gray-500 font-mono">Unique Skills</span>
            <span className="text-xs font-bold text-white font-mono">{totalUniqueSkills}</span>
          </div>
          {selectedSkillsFilter.length > 0 && (
            <button
              onClick={() => onToggleSkillFilter('CLEAR_ALL')}
              className="text-[10px] bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 text-white font-mono px-2.5 py-1 rounded-md transition-colors"
            >
              Reset Skill Filter
            </button>
          )}
        </div>
      </div>

      <div ref={containerRef} className="relative w-full overflow-visible select-none">
        {topSkills.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 border border-dashed border-white/10 rounded-xl text-gray-500 text-xs">
            No skill distribution data available.
          </div>
        ) : (
          <>
            <svg width={width} height={height} className="overflow-visible">
              {/* Background horizontal grid lines */}
              <g className="grid-lines">
                {yTicks.map((tick) => (
                  <g key={`grid-${tick}`} transform={`translate(0, ${yScale(tick)})`}>
                    <line
                      x1={margin.left}
                      x2={width - margin.right}
                      stroke="rgba(255, 255, 255, 0.04)"
                      strokeWidth={1}
                      strokeDasharray="2,2"
                    />
                    <text
                      x={margin.left - 8}
                      dy="0.32em"
                      textAnchor="end"
                      fill="#888"
                      className="text-[9px] font-mono"
                    >
                      {tick}
                    </text>
                  </g>
                ))}
              </g>

              {/* Chart Bars */}
              <g className="bars">
                {bars.map((bar) => {
                  const isFiltered = selectedSkillsFilter.includes(bar.skill);
                  const hasFilters = selectedSkillsFilter.length > 0;
                  
                  // Styling states:
                  // 1. Filtered and active -> Glowing bright blue/indigo
                  // 2. Not filtered but has filters -> Slightly dimmed/translucent
                  // 3. No active filters -> Beautiful ambient white/indigo gradient
                  let barFill = 'url(#gradient-default)';
                  let barStroke = 'rgba(255, 255, 255, 0.15)';
                  let opacity = 1;

                  if (hasFilters) {
                    if (isFiltered) {
                      barFill = 'url(#gradient-active)';
                      barStroke = '#ffffff';
                      opacity = 1;
                    } else {
                      opacity = 0.35;
                    }
                  } else if (hoveredBar?.skill === bar.skill) {
                    barFill = 'url(#gradient-hover)';
                    barStroke = 'rgba(255, 255, 255, 0.4)';
                  }

                  return (
                    <g key={bar.skill} className="group cursor-pointer">
                      {/* Bar Rectangle with CSS Transition */}
                      <rect
                        x={bar.x}
                        y={bar.y}
                        width={bar.barWidth}
                        height={Math.max(bar.barHeight, 2)}
                        rx={3}
                        ry={3}
                        fill={barFill}
                        stroke={barStroke}
                        strokeWidth={isFiltered ? 1.5 : 0.8}
                        style={{
                          transition: 'all 350ms cubic-bezier(0.16, 1, 0.3, 1)',
                          opacity,
                        }}
                        onClick={() => onToggleSkillFilter(bar.skill)}
                        onMouseEnter={(e) => {
                          setHoveredBar(bar);
                          const rect = e.currentTarget.getBoundingClientRect();
                          const containerRect = containerRef.current?.getBoundingClientRect();
                          if (containerRect) {
                            setTooltipPos({
                              x: rect.left - containerRect.left + bar.barWidth / 2,
                              y: rect.top - containerRect.top - 8,
                            });
                          }
                        }}
                        onMouseLeave={() => setHoveredBar(null)}
                      />

                      {/* Micro Pill Value on Top of Bar */}
                      {bar.barHeight > 18 && (
                        <text
                          x={bar.x + bar.barWidth / 2}
                          y={bar.y + 12}
                          textAnchor="middle"
                          fill="rgba(255, 255, 255, 0.8)"
                          className="text-[9px] font-bold font-mono pointer-events-none"
                          style={{ opacity: hasFilters && !isFiltered ? 0.3 : 1 }}
                        >
                          {bar.count}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* X Axis Labels */}
              <g className="x-axis">
                {bars.map((bar) => {
                  const isFiltered = selectedSkillsFilter.includes(bar.skill);
                  const isHovered = hoveredBar?.skill === bar.skill;
                  return (
                    <text
                      key={`label-${bar.skill}`}
                      x={bar.x + bar.barWidth / 2}
                      y={height - margin.bottom + 16}
                      textAnchor="middle"
                      onClick={() => onToggleSkillFilter(bar.skill)}
                      className={`text-[9px] md:text-[10px] font-mono cursor-pointer transition-colors ${
                        isFiltered
                          ? 'fill-white font-bold'
                          : isHovered
                          ? 'fill-gray-200'
                          : 'fill-gray-500 hover:fill-gray-300'
                      }`}
                    >
                      {bar.skill}
                    </text>
                  );
                })}
                <line
                  x1={margin.left}
                  y1={height - margin.bottom}
                  x2={width - margin.right}
                  y2={height - margin.bottom}
                  stroke="rgba(255, 255, 255, 0.1)"
                />
              </g>

              {/* Color Gradients Definitions */}
              <defs>
                {/* Default Ambient Gradient */}
                <linearGradient id="gradient-default" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.18)" />
                  <stop offset="100%" stopColor="rgba(255, 255, 255, 0.04)" />
                </linearGradient>

                {/* Hover Ambient Gradient */}
                <linearGradient id="gradient-hover" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.28)" />
                  <stop offset="100%" stopColor="rgba(255, 255, 255, 0.08)" />
                </linearGradient>

                {/* Filtered Active Gradient */}
                <linearGradient id="gradient-active" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="rgba(255, 255, 255, 0.4)" />
                </linearGradient>
              </defs>
            </svg>

            {/* Premium Rich Tooltip */}
            {hoveredBar && (
              <div
                className="absolute z-30 pointer-events-none bg-zinc-950/95 border border-white/20 px-3 py-2 rounded-xl shadow-2xl backdrop-blur-md text-left transition-all duration-150 transform -translate-x-1/2 -translate-y-full w-48 text-xs flex flex-col gap-1.5"
                style={{
                  left: tooltipPos.x,
                  top: tooltipPos.y,
                }}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-0.5">
                  <span className="font-mono font-bold text-white text-xs">{hoveredBar.skill}</span>
                  <span className="bg-white/15 border border-white/10 text-white px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">
                    {hoveredBar.count} {hoveredBar.count === 1 ? 'match' : 'matches'}
                  </span>
                </div>
                
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] uppercase tracking-wider text-gray-500 font-mono">Matched Talent:</span>
                  <div className="flex flex-col gap-0.5 max-h-24 overflow-y-auto">
                    {hoveredBar.candidatesList.slice(0, 4).map((name, index) => (
                      <span key={name} className="text-gray-300 text-[10px] truncate leading-tight">
                        • {name}
                      </span>
                    ))}
                    {hoveredBar.candidatesList.length > 4 && (
                      <span className="text-[8px] text-gray-500 font-mono pl-1">
                        + {hoveredBar.candidatesList.length - 4} more candidates
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-[8px] text-gray-500 font-mono border-t border-white/5 pt-1 mt-0.5 text-center">
                  Click bar to filter by skill
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
