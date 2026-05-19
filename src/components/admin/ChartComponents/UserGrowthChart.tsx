'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface UserGrowthChartProps {
  data: Array<{
    date: string;
    users: number;
  }>;
}

export default function UserGrowthChart({ data }: UserGrowthChartProps) {
  return (
    <div className="bg-white/80 dark:bg-[#0e0e14]/65 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">User Growth</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last 30 days</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-gold" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">New Users</span>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c9a84c" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#c9a84c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(14, 14, 20, 0.95)',
                border: '1px solid rgba(201, 168, 76, 0.2)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px'
              }}
              cursor={{ stroke: '#c9a84c', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <Area
              type="monotone"
              dataKey="users"
              stroke="#c9a84c"
              strokeWidth={2}
              fill="url(#userGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
