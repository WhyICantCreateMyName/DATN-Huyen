"use client";

import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";

interface TopRatedProduct {
  name: string;
  rating: number;
  count: number;
}

interface ReviewChartProps {
  data: TopRatedProduct[];
}

export default function ReviewChart({ data }: ReviewChartProps) {
  const chartData = data.map((item, index) => ({
    name: item.name.length > 15 ? item.name.substring(0, 15) + "..." : item.name,
    fullName: item.name,
    value: item.rating,
    count: item.count,
    color: [
      "#6366f1", // Indigo
      "#8b5cf6", // Violet
      "#a855f7", // Purple
      "#d946ef", // Fuchsia
      "#ec4899"  // Pink
    ][index % 5]
  }));

  return (
    <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[2.5rem] flex flex-col h-full group hover:border-violet-500/50 transition-all">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-zinc-900 dark:text-white leading-tight">Sản phẩm được yêu thích</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-bold mt-1 uppercase tracking-wider">Top 5 đánh giá cao nhất</p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[300px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e4e4e7" opacity={0.5} />
              <XAxis 
                type="number"
                domain={[0, 5]}
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#a1a1aa", fontSize: 12, fontWeight: "bold" }} 
              />
              <YAxis 
                dataKey="name"
                type="category"
                axisLine={false} 
                tickLine={false} 
                width={100}
                tick={{ fill: "#3f3f46", fontSize: 10, fontWeight: "black" }} 
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-xl">
                        <p className="font-black text-sm text-zinc-900 mb-1">{data.fullName}</p>
                        <p className="text-xs font-bold text-violet-600 uppercase">Rating: {data.value} / 5.0</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1">{data.count} đánh giá</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="value" 
                radius={[0, 10, 10, 0]}
                barSize={30}
                animationDuration={1500}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-10">
            <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4">
              <p className="text-2xl">⭐</p>
            </div>
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Chưa có dữ liệu đánh giá</p>
          </div>
        )}
      </div>
    </div>
  );
}
