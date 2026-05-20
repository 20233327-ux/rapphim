import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Ticket, 
  Users, 
  Play, 
  Calendar, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Star
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Movie, Booking, Showtime } from '../types';

interface DashboardModuleProps {
  movies: Movie[];
  bookings: Booking[];
  showtimes: Showtime[];
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({ movies, bookings, showtimes }) => {
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const totalTickets = bookings.length;
  const activeMovies = movies.filter(m => m.status === 'now-showing').length;
  
  // Get next 3 upcoming showtimes
  const upcomingShowtimes = [...showtimes]
    .filter(st => new Date(st.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 4);

  // Mock revenue data for chart
  const revenueData = [
    { name: '06:00', total: 0 },
    { name: '09:00', total: totalRevenue * 0.1 },
    { name: '12:00', total: totalRevenue * 0.25 },
    { name: '15:00', total: totalRevenue * 0.4 },
    { name: '18:00', total: totalRevenue * 0.7 },
    { name: '21:00', total: totalRevenue * 0.9 },
    { name: '23:59', total: totalRevenue },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Chào buổi sáng!</h1>
          <p className="text-zinc-500 mt-1">Hệ thống đang hoạt động ổn định. Dưới đây là tình hình hôm nay.</p>
        </div>
        <div className="hidden md:flex items-center gap-3 bg-zinc-900/50 p-2 rounded-2xl border border-zinc-800">
           <div className="w-10 h-10 bg-yellow-500/10 text-yellow-500 rounded-xl flex items-center justify-center font-bold">
              {new Date().getDate()}
           </div>
           <div className="pr-4">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Tháng {new Date().getMonth() + 1}</p>
              <p className="text-sm font-bold text-white">Năm {new Date().getFullYear()}</p>
           </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Doanh thu hôm nay', value: `${totalRevenue.toLocaleString()}đ`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: '+12%' },
          { label: 'Vé đã bán', value: totalTickets.toLocaleString(), icon: Ticket, color: 'text-yellow-400', bg: 'bg-yellow-500/10', trend: '+8%' },
          { label: 'Phim đang chiếu', value: activeMovies.toString(), icon: Play, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: 'Ổn định' },
          { label: 'Lượt khách', value: (totalTickets * 1.2).toFixed(0), icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10', trend: '+15%' },
        ].map((stat, i) => (
          <div key={i} className="group bg-zinc-950 border border-zinc-900 p-6 rounded-[2rem] hover:border-yellow-500/30 transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <stat.icon size={64} />
            </div>
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 shadow-lg shadow-black`}>
              <stat.icon size={24}/>
            </div>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
            <div className="flex items-end gap-3 mt-1">
              <h3 className="text-3xl font-black text-white">{stat.value}</h3>
              <span className="text-[10px] font-bold text-emerald-500 mb-1">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart Section */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-white">Xu hướng doanh thu</h3>
                  <p className="text-zinc-500 text-sm">Theo dõi doanh thu biến động trong ngày</p>
                </div>
                <select className="bg-zinc-900 border border-zinc-800 text-xs text-white rounded-xl px-4 py-2 outline-none">
                  <option>Hôm nay</option>
                  <option>Hôm qua</option>
                </select>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="dashboardRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.2}/>
                    <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dy={10}/>
                    <YAxis hide/>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', border: '1px solid #1e293b', borderRadius: '16px', color: '#fff' }}
                      itemStyle={{ color: '#eab308' }}
                    />
                    <Area type="monotone" dataKey="total" stroke="#eab308" fillOpacity={1} fill="url(#dashboardRev)" strokeWidth={4}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Quick Actions */}
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button className="flex flex-col items-center justify-center p-6 bg-zinc-900/40 border border-zinc-800 rounded-[2rem] hover:bg-yellow-500 hover:text-black transition-all group">
                <Ticket className="mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold">Tạo vé mới</span>
              </button>
              <button className="flex flex-col items-center justify-center p-6 bg-zinc-900/40 border border-zinc-800 rounded-[2rem] hover:bg-yellow-500 hover:text-black transition-all group">
                <Calendar className="mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold">Lên lịch chiếu</span>
              </button>
              <button className="flex flex-col items-center justify-center p-6 bg-zinc-900/40 border border-zinc-800 rounded-[2rem] hover:bg-yellow-500 hover:text-black transition-all group">
                <Users className="mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold">Quản lý khách</span>
              </button>
           </div>
        </div>

        {/* Status / Upcoming section */}
        <div className="space-y-6">
           <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Clock size={20} className="text-yellow-500"/>
                Suất chiếu sắp tới
              </h3>
              <div className="space-y-4">
                {upcomingShowtimes.length > 0 ? upcomingShowtimes.map((st) => {
                  const m = movies.find(movie => movie.id === st.movieId);
                  return (
                    <div key={st.id} className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                      <img src={m?.posterUrl} className="w-12 h-16 rounded-lg object-cover" alt=""/>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="text-sm font-bold text-white truncate">{m?.title}</h4>
                        <p className="text-xs text-zinc-500 mt-1">{new Date(st.startTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                      <ChevronRight size={16} className="text-zinc-700"/>
                    </div>
                  );
                }) : (
                  <div className="text-center py-8">
                    <AlertCircle className="mx-auto text-zinc-700 mb-2" size={32}/>
                    <p className="text-xs text-zinc-500">Không có suất chiếu sắp tới</p>
                  </div>
                )}
              </div>
              <button className="w-full mt-6 py-3 text-xs font-bold text-yellow-500 hover:bg-yellow-500/5 rounded-xl transition-all">
                Xem toàn bộ lịch chiếu
              </button>
           </div>

           <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-[2.5rem] p-8 text-black relative overflow-hidden">
              <Star className="absolute -bottom-4 -right-4 text-black/10" size={120}/>
              <h3 className="text-xl font-black mb-2">Đạt mục tiêu!</h3>
              <p className="text-sm font-medium opacity-80 mb-6">Doanh thu tuần này đã vượt 15% so với dự kiến.</p>
              <div className="w-full bg-black/10 h-2 rounded-full mb-4">
                <div className="bg-black w-[85%] h-full rounded-full"/>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest">85% Mục tiêu tháng</p>
           </div>
        </div>
      </div>
    </div>
  );
};
