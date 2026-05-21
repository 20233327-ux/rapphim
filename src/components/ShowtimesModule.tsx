import React, { useState } from 'react';
import { Plus, Calendar as CalendarIcon, Clock, MapPin, Copy, Search, Filter, ChevronRight, AlertCircle, X } from 'lucide-react';
import { Showtime, Movie, Room } from '../types';

interface ShowtimesModuleProps {
  showtimes: Showtime[];
  setShowtimes: React.Dispatch<React.SetStateAction<Showtime[]>>;
  movies: Movie[];
  rooms: Room[];
}

interface ShowtimeFormData {
  movieId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  basePrice: number;
}

export const ShowtimesModule: React.FC<ShowtimesModuleProps> = ({ showtimes, setShowtimes, movies, rooms }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState<Showtime | null>(null);
  const [formData, setFormData] = useState<ShowtimeFormData>({
    movieId: movies[0]?.id || '',
    roomId: rooms[0]?.id || '',
    startTime: '10:00',
    endTime: '12:00',
    basePrice: 100000,
  });

  const checkConflicts = (roomId: string, startTime: string, endTime: string, excludeId?: string): Showtime[] => {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const BREAK_TIME = 15 * 60 * 1000; // 15 minutes

    return showtimes.filter(st => {
      if (st.roomId !== roomId) return false;
      if (excludeId && st.id === excludeId) return false;

      const stStart = new Date(st.startTime).getTime();
      const stEnd = new Date(st.endTime).getTime();

      // Check if times overlap with break time
      return !(end + BREAK_TIME <= stStart || start >= stEnd + BREAK_TIME);
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Xóa suất chiếu này?')) {
      setShowtimes(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleEdit = (showtime: Showtime) => {
    setEditingShowtime(showtime);
    const startDateTime = new Date(showtime.startTime);
    const endDateTime = new Date(showtime.endTime);
    setFormData({
      movieId: showtime.movieId,
      roomId: showtime.roomId,
      startTime: startDateTime.toTimeString().slice(0, 5),
      endTime: endDateTime.toTimeString().slice(0, 5),
      basePrice: showtime.basePrice,
    });
    setShowModal(true);
  };

  const handleSaveShowtime = () => {
    if (!formData.movieId || !formData.roomId || !formData.startTime || !formData.endTime) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const fullStartTime = `${selectedDate}T${formData.startTime}:00`;
    const fullEndTime = `${selectedDate}T${formData.endTime}:00`;

    if (fullStartTime >= fullEndTime) {
      alert('Thời gian bắt đầu phải trước thời gian kết thúc');
      return;
    }

    const conflicts = checkConflicts(formData.roomId, fullStartTime, fullEndTime, editingShowtime?.id);
    if (conflicts.length > 0) {
      alert('Phòng này đã có suất chiếu trùng lịch (bao gồm thời gian nghỉ 15 phút)');
      return;
    }

    if (editingShowtime) {
      // Update existing
      setShowtimes(prev =>
        prev.map(s =>
          s.id === editingShowtime.id
            ? { ...s, movieId: formData.movieId, roomId: formData.roomId, startTime: fullStartTime, endTime: fullEndTime, basePrice: formData.basePrice }
            : s
        )
      );
    } else {
      // Add new
      const newShowtime: Showtime = {
        id: `S${Date.now()}`,
        movieId: formData.movieId,
        roomId: formData.roomId,
        startTime: fullStartTime,
        endTime: fullEndTime,
        basePrice: formData.basePrice,
      };
      setShowtimes(prev => [...prev, newShowtime]);
    }

    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setEditingShowtime(null);
    setFormData({
      movieId: movies[0]?.id || '',
      roomId: rooms[0]?.id || '',
      startTime: '10:00',
      endTime: '12:00',
      basePrice: 100000,
    });
  };

  const handleAddShowtime = (roomId?: string) => {
    if (rooms.length === 0) {
      alert('Vui lòng thêm phòng trước');
      return;
    }
    resetForm();
    if (roomId) {
      setFormData(prev => ({ ...prev, roomId }));
    }
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{editingShowtime ? 'Sửa suất chiếu' : 'Thêm suất chiếu'}</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-zinc-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Phim</label>
                <select
                  value={formData.movieId}
                  onChange={e => setFormData(prev => ({ ...prev, movieId: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2"
                >
                  <option value="">Chọn phim</option>
                  {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Phòng</label>
                <select
                  value={formData.roomId}
                  onChange={e => setFormData(prev => ({ ...prev, roomId: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2"
                >
                  <option value="">Chọn phòng</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.type})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Bắt đầu</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={e => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Kết thúc</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={e => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Giá vé (đ)</label>
                <input
                  type="number"
                  value={formData.basePrice}
                  onChange={e => setFormData(prev => ({ ...prev, basePrice: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveShowtime}
                  className="flex-1 py-2 px-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition"
                >
                  {editingShowtime ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Lịch chiếu phim</h1>
          <p className="text-zinc-500 text-sm">Quản lý các suất chiếu và kiểm tra trùng lịch.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium text-zinc-300 hover:bg-zinc-800 flex items-center gap-2">
            <Copy size={16}/> Sao chép lịch tuần
          </button>
          <button onClick={() => handleAddShowtime()} className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-400 transition-all">
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
          {rooms.map((room) => {
            const roomShowtimes = showtimes.filter(s => s.roomId === room.id && s.startTime.startsWith(selectedDate));
            const roomConflicts = roomShowtimes.length > 1 ? roomShowtimes.length - 1 : 0;
            
            return (
              <div key={room.id} className="bg-zinc-900/40 rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="p-4 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                      <MapPin size={18}/>
                    </div>
                    <h3 className="font-bold text-white">{room.name} <span className="text-xs font-normal text-zinc-500 ml-2">({room.type})</span></h3>
                  </div>
                  <span className={`text-xs ${roomShowtimes.length > 0 ? 'text-yellow-500' : 'text-zinc-500'}`}>{roomShowtimes.length} suất chiếu</span>
                </div>
                <div className="p-4">
                  {roomShowtimes.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {roomShowtimes.map((st) => {
                        const movie = movies.find(m => m.id === st.movieId);
                        const start = new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                        const end = new Date(st.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                        
                        return (
                          <div key={st.id} className="group relative">
                            <button className="flex flex-col items-center p-3 bg-zinc-800/50 border border-zinc-700 rounded-xl hover:border-yellow-500/50 transition-all min-w-[120px]">
                              <span className="text-sm font-bold text-white">{start} - {end}</span>
                              <span className="text-[10px] text-zinc-500 mt-1 truncate max-w-[100px]">{movie?.title || 'Phim đã xóa'}</span>
                            </button>
                            <div className="absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                              <h4 className="font-bold text-white mb-2">{movie?.title}</h4>
                              <div className="space-y-2 text-xs text-zinc-400">
                                <p className="flex justify-between"><span>Bắt đầu:</span> <span className="text-white">{start}</span></p>
                                <p className="flex justify-between"><span>Kết thúc:</span> <span className="text-white">{end}</span></p>
                                <p className="flex justify-between"><span>Giá vé:</span> <span className="text-yellow-500 font-bold">{st.basePrice.toLocaleString()}đ</span></p>
                              </div>
                              <div className="mt-4 flex gap-2">
                                <button onClick={() => handleEdit(st)} className="flex-1 py-1.5 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">Sửa</button>
                                <button onClick={() => handleDelete(st.id)} className="flex-1 py-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors">Xóa</button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-zinc-600 italic py-2">Không có suất chiếu nào trong ngày này.</p>
                      <button onClick={() => handleAddShowtime(room.id)} className="text-xs text-yellow-500 hover:underline">Thêm nhanh</button>
                    </div>
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
              {(() => {
                const todayShowtimes = showtimes.filter(s => s.startTime.startsWith(selectedDate));
                const conflicts: Showtime[] = [];
                
                todayShowtimes.forEach(st => {
                  const conflictList = checkConflicts(st.roomId, st.startTime, st.endTime, st.id);
                  conflicts.push(...conflictList);
                });

                if (conflicts.length === 0) {
                  return (
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                      <p className="text-sm text-emerald-500">✓ Không phát hiện xung đột lịch chiếu trong ngày hôm nay.</p>
                    </div>
                  );
                } else {
                  return (
                    <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                      <p className="text-sm text-red-500">⚠ Phát hiện {conflicts.length} xung đột lịch chiếu</p>
                    </div>
                  );
                }
              })()}
              <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                <p className="text-xs text-zinc-500 uppercase font-bold mb-2">Quy tắc tự động</p>
                <ul className="space-y-2 text-xs text-zinc-400">
                  <li className="flex items-start gap-2">• Thời gian nghỉ giữa 2 suất: 15 phút</li>
                  <li className="flex items-start gap-2">• Tự động tính giờ kết thúc dựa trên thời lượng phim</li>
                  <li className="flex items-start gap-2">• Cảnh báo nếu suất chiếu vượt quá 23:59</li></ul>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800 p-6">
            <h3 className="font-bold text-lg text-white mb-4">Thống kê suất chiếu</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">Tổng số suất</span>
                <span className="text-sm font-bold text-white">{showtimes.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">Suất hôm nay</span>
                <span className="text-sm font-bold text-white">{showtimes.filter(s => s.startTime.startsWith(selectedDate)).length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">Phòng tối đa</span>
                <span className="text-sm font-bold text-white">
                  {rooms.reduce((max, r) => {
                    const count = showtimes.filter(s => s.roomId === r.id).length;
                    return count > max.count ? { name: r.name, count } : max;
                  }, { name: 'N/A', count: 0 }).name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
