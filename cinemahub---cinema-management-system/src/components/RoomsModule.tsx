import React, { useState } from 'react';
import { Plus, MapPin, Grid, Layers, Edit, Trash2, Armchair } from 'lucide-react';
import { motion } from 'motion/react';
import { ROOMS } from '../constants';
import { Room, RoomType, SeatType } from '../types';

export const RoomsModule: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>(ROOMS);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý phòng chiếu</h1>
          <p className="text-zinc-500 text-sm">Quản lý danh sách phòng và sơ đồ ghế ngồi.</p>
        </div>
        <button className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-400 transition-all">
          <Plus size={18}/> Thêm phòng mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {rooms.map((room) => (
          <div key={room.id} onClick={() => setSelectedRoom(room)}
            className={`bg-zinc-900/40 p-6 rounded-2xl border transition-all cursor-pointer ${
              selectedRoom?.id === room.id ? 'border-yellow-500 ring-1 ring-yellow-500/50' : 'border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-zinc-800 rounded-xl text-yellow-500">
                <Layers size={24}/>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 bg-zinc-800 text-zinc-400 rounded-lg border border-zinc-700">
                {room.type}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">{room.name}</h3>
            <p className="text-zinc-500 text-sm mb-4">{room.code} • {room.capacity} chỗ ngồi</p>
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Grid size={14}/> {room.rows}x{room.cols}
              </div>
              <div className="flex gap-2">
                <button className="p-1.5 text-zinc-500 hover:text-white transition-colors"><Edit size={14}/></button>
                <button className="p-1.5 text-zinc-500 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedRoom && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">Sơ đồ ghế: {selectedRoom.name}</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-zinc-800 border border-zinc-700"/>
                <span className="text-xs text-zinc-500">Thường</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/50"/>
                <span className="text-xs text-zinc-500">VIP</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-pink-500/20 border border-pink-500/50"/>
                <span className="text-xs text-zinc-500">Đôi</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-full max-w-2xl h-1.5 bg-zinc-800 rounded-full mb-16 relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.5em]">Màn hình</div>
            </div>

            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${selectedRoom.cols}, 1fr)` }}>
              {Array.from({ length: selectedRoom.rows * selectedRoom.cols }).map((_, i) => {
                const row = String.fromCharCode(65 + Math.floor(i / selectedRoom.cols));
                const col = (i % selectedRoom.cols) + 1;
                const isVip = Math.floor(i / selectedRoom.cols) > 2 && Math.floor(i / selectedRoom.cols) < 7;
                const isDouble = Math.floor(i / selectedRoom.cols) === selectedRoom.rows - 1;

                return (
                  <div key={`${row}${col}`} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border transition-all ${ isDouble ? 'bg-pink-500/10 border-pink-500/30 text-pink-500' : isVip ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : 'bg-zinc-900 border-zinc-800 text-zinc-600' }`}>
                    {row}{col}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
