import React, { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Clock, Film, Play, Edit, Trash2 } from 'lucide-react';
import { MOVIES } from '../constants';
import { Movie, MovieStatus } from '../types';

export const MoviesModule: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>(MOVIES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MovieStatus | 'all'>('all');

  const filteredMovies = movies.filter(m => 
    (m.title.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === 'all' || m.status === statusFilter)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Quản lý phim</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18}/>
            <input type="text" placeholder="Tìm mã hoặc tên phim..." className="pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:ring-2 focus:ring-yellow-500/50 outline-none" value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 rounded-xl px-4 py-2 outline-none" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="now-showing">Đang chiếu</option>
            <option value="coming-soon">Sắp chiếu</option>
            <option value="stopped">Ngừng chiếu</option>
          </select>
          <button className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-400 transition-all">
            <Plus size={18}/> Thêm phim
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMovies.map((movie) => (
          <div key={movie.id} className="bg-zinc-900/40 rounded-2xl border border-zinc-800 overflow-hidden group hover:border-zinc-600 transition-all duration-300">
            <div className="relative aspect-[2/3] overflow-hidden">
              <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer"/>
              <div className="absolute top-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold rounded uppercase border border-white/10">
                {movie.rating}
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button className="p-3 bg-yellow-500 rounded-full text-black hover:scale-110 transition-transform">
                  <Play size={20} fill="currentColor"/>
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{movie.code}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${ movie.status === 'now-showing' ? 'bg-emerald-500/10 text-emerald-500' : movie.status === 'coming-soon' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500' }`}>
                  {movie.status === 'now-showing' ? 'Đang chiếu' : movie.status === 'coming-soon' ? 'Sắp chiếu' : 'Ngừng chiếu'}
                </span>
              </div>
              <h3 className="font-bold text-white truncate text-lg">{movie.title}</h3>
              <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                <Clock size={12}/> {movie.duration} phút • {movie.director}
              </p>
              <div className="flex flex-wrap gap-1 mt-3">
                {movie.genre.map(g => (
                  <span key={g} className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full border border-zinc-700">{g}</span>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 uppercase">Khởi chiếu</span>
                  <span className="text-xs text-zinc-300">{movie.releaseDate}</span>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-zinc-500 hover:text-yellow-500 transition-colors">
                    <Edit size={16}/>
                  </button>
                  <button className="p-2 text-zinc-500 hover:text-red-500 transition-colors">
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
