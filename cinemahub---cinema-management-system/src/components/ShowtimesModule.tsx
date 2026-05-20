import React, { useState } from 'react';
import { Plus, Calendar as CalendarIcon, Clock, MapPin, Copy, Search, Filter, ChevronRight, AlertCircle } from 'lucide-react';
import { SHOWTIMES, MOVIES, ROOMS } from '../constants';
import { Showtime } from '../types';

export const ShowtimesModule: React.FC = () => {
  const [showtimes, setShowtimes] = useState<Showtime[]>(SHOWTIMES);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Lịch chiếu phim</h1>
          <p className="text-zinc-500 text-sm">Quản lý các suất chiếu và kiểm tra trùng lịch.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium text-zinc-300 hover:bg-zinc-800 flex items-center gap-2">
            <Copy size={16}/> Sao chép lịch tuần
          </button>
          <button className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-400 transition-all">
            <Plus size={18}/> Thêm suất chiếu
          </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
          const date = new Date();
          date.setDate(date.getDate() + offset);
          const dateStr = date.toISOString().split('T')[0];
          const isSelected = selectedDate === dateStr;
          
          return (
            <button key={dateStr} onClick={() => setSelectedDate(dateStr)}
              className={`flex flex-col items-center min-w-[80px] p-3 rounded-2xl border transition-all ${
                isSelected ? 'bg-yellow-500 border-yellow-500 text-black' : 'bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:border-zinc-700'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider mb-1">
                {offset === 0 ? 'Hôm nay' : date.toLocaleDateString('vi-VN', { weekday: 'short' })}
              </span>
              <span className="text-lg font-bold">{date.getDate()}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-4">
          {ROOMS.map((room) => {
            const roomShowtimes = showtimes.filter(s => s.roomId === room.id);
            
            return (
              <div key={room.id} className="bg-zinc-900/40 rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="p-4 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                      <MapPin size={18}/>
                    </div>
                    <h3 className="font-bold text-white">{room.name} <span className="text-xs font-normal text-zinc-500 ml-2">({room.type})</span></h3>
                  </div>
                  <span className="text-xs text-zinc-500">{roomShowtimes.length} suất chiếu</span>
                </div>
                <div className="p-4">
                  {roomShowtimes.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {roomShowtimes.map((st) => {
                        const movie = MOVIES.find(m => m.id === st.movieId);
                        const start = new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                        const end = new Date(st.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                        
                        return (
                          <div key={st.id} className="group relative">
                            <button className="flex flex-col items-center p-3 bg-zinc-800/50 border border-zinc-700 rounded-xl hover:border-yellow-500/50 transition-all min-w-[120px]">
                              <span className="text-sm font-bold text-white">{start} - {end}</span>
                              <span className="text-[10px] text-zinc-500 mt-1 truncate max-w-[100px]">{movie?.title}</span>
                            </button>
                            <div className="absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                              <h4 className="font-bold text-white mb-2">{movie?.title}</h4>
                              <div className="space-y-2 text-xs text-zinc-400">
                                <p className="flex justify-between"><span>Bắt đầu:</span> <span className="text-white">{start}</span></p>
                                <p className="flex justify-between"><span>Kết thúc:</span> <span className="text-white">{end}</span></p>
                                <p className="flex justify-between"><span>Giá vé:</span> <span className="text-yellow-500 font-bold">{st.basePrice.toLocaleString()}đ</span></p>
                              </div>
                              <div className="mt-4 flex gap-2">
                                <button className="flex-1 py-1.5 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">Sửa</button>
                                <button className="flex-1 py-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors">Xóa</button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-600 italic py-2">Không có suất chiếu nào trong ngày này.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800 p-6">
            <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-yellow-500"/> Kiểm tra xung đột
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <p className="text-sm text-emerald-500">Không phát hiện xung đột lịch chiếu trong ngày hôm nay.</p>
              </div>
              <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                <p className="text-xs text-zinc-500 uppercase font-bold mb-2">Quy tắc tự động</p>
                <ul className="space-y-2 text-xs text-zinc-400">
                  <li className="flex items-start gap-2">• Thời gian nghỉ giữa 2 suất: 15 phút</li>
                  <li className="flex items-start gap-2">• Tự động tính giờ kết thúc dựa trên thời lượng phim</li>
                  <li className="flex items-start gap-2">• Cảnh báo nếu suất chiếu vượt quá 23:59</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800 p-6">
            <h3 className="font-bold text-lg text-white mb-4">Thống kê suất chiếu</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">Tổng số suất</span>
                <span className="text-sm font-bold text-white">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">Phòng bận nhất</span>
                <span className="text-sm font-bold text-white">IMAX Theatre</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">Giờ cao điểm</span>
                <span className="text-sm font-bold text-white">18:00 - 21:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
