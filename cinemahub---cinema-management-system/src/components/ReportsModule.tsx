import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Ticket, Users, Download, Filter, ChevronRight, PieChart as PieChartIcon } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Cell, Pie } from 'recharts';
import { MOVIES } from '../constants';

export const ReportsModule: React.FC = () => {
  const revenueData = [
    { name: 'Thứ 2', revenue: 4500000, tickets: 45 },
    { name: 'Thứ 3', revenue: 5200000, tickets: 52 },
    { name: 'Thứ 4', revenue: 3800000, tickets: 38 },
    { name: 'Thứ 5', revenue: 6100000, tickets: 61 },
    { name: 'Thứ 6', revenue: 8900000, tickets: 89 },
    { name: 'Thứ 7', revenue: 12500000, tickets: 125 },
    { name: 'Chủ nhật', revenue: 14200000, tickets: 142 },
  ];

  const movieData = [
    { name: 'Dune: Part Two', value: 45 },
    { name: 'Godzilla x Kong', value: 30 },
    { name: 'Kung Fu Panda 4', value: 15 },
    { name: 'Khác', value: 10 },
  ];

  const COLORS = ['#eab308', '#8b5cf6', '#ec4899', '#64748b'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Báo cáo & Thống kê</h1>
          <p className="text-zinc-500 text-sm">Phân tích doanh thu, lượng vé và hiệu suất rạp phim.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium text-zinc-300 hover:bg-zinc-800 flex items-center gap-2">
            <Filter size={16}/> Lọc thời gian
          </button>
          <button className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-400 transition-all">
            <Download size={18}/> Xuất báo cáo (PDF/Excel)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Tổng doanh thu (Tháng)', value: '342.500.000đ', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Tổng vé bán ra', value: '2.840', icon: Ticket, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: 'Khách hàng mới', value: '+142', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Tỷ lệ tăng trưởng', value: '12.5%', icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon size={20}/>
            </div>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-zinc-900/40 rounded-2xl border border-zinc-800 p-6">
          <h3 className="font-bold text-lg text-white mb-6">Biểu đồ doanh thu tuần</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false}/>
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false}/>
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}/>
                <Area type="monotone" dataKey="revenue" stroke="#eab308" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800 p-6">
          <h3 className="font-bold text-lg text-white mb-6">Tỷ lệ doanh thu theo phim</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={movieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {movieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-6">
            {movieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}/>
                  <span className="text-xs text-zinc-400">{item.name}</span>
                </div>
                <span className="text-xs font-bold text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="p-4 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="font-bold text-white">Top phim doanh thu cao nhất</h3>
          <button className="text-xs text-yellow-500 font-bold hover:underline">Xem tất cả</button>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Phim</th>
              <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Số vé bán</th>
              <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Doanh thu</th>
              <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Tỷ lệ lấp đầy</th>
              <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Xu hướng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {MOVIES.slice(0, 3).map((movie, i) => (
              <tr key={movie.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={movie.posterUrl} alt="" className="w-8 h-12 rounded object-cover" referrerPolicy="no-referrer"/>
                    <span className="font-semibold text-white text-sm">{movie.title}</span>
                  </div>
                </td>
                <td className="p-4 text-zinc-400 text-sm">{(1200 - i * 200).toLocaleString()} vé</td>
                <td className="p-4 text-white font-bold text-sm">{(150000000 - i * 30000000).toLocaleString()}đ</td>
                <td className="p-4">
                  <div className="w-full max-w-[100px] h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500" style={{ width: `${85 - i * 10}%` }}/>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <span className="text-emerald-500 text-xs font-bold flex items-center justify-end gap-1">
                    <TrendingUp size={14}/> +{12 - i * 2}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
