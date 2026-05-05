"use client";

import React from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

interface RevenueChartProps {
  data: { name: string; revenue: number }[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[2.5rem] flex flex-col h-full group hover:border-violet-500/50 transition-all">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-zinc-900 dark:text-white leading-tight">Doanh thu tuần này</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-bold mt-1 uppercase tracking-wider">Tổng quan 7 ngày qua</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-violet-600 shadow-sm" />
            <span className="text-xs font-bold text-zinc-500">Doanh thu</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" opacity={0.5} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#a1a1aa", fontSize: 12, fontWeight: "bold" }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#a1a1aa", fontSize: 12, fontWeight: "bold" }} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "#ffffff", 
                borderRadius: "1rem", 
                border: "1px solid #e4e4e7",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                padding: "12px"
              }}
              labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
              itemStyle={{ fontWeight: "bold", color: "#7c3aed" }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#7c3aed" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
