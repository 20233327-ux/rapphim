import React, { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Clock, Film, Play, Edit, Trash2, X, Upload, Link, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Movie, MovieStatus } from '../types';

interface MoviesModuleProps {
  movies: Movie[];
  setMovies: React.Dispatch<React.SetStateAction<Movie[]>>;
}

export const MoviesModule: React.FC<MoviesModuleProps> = ({ movies, setMovies }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MovieStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 120,
    genre: 'Action',
    rating: 'PG-13',
    director: '',
    actors: '',
    releaseDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'now-showing' as MovieStatus,
    posterUrl: '',
    posterType: 'url' as 'url' | 'file'
  });

  const filteredMovies = movies.filter(m => 
    (m.title.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === 'all' || m.status === statusFilter)
  );

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa phim này?')) {
      setMovies(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleOpenModal = (movie?: Movie) => {
    if (movie) {
      setEditingMovie(movie);
      setFormData({
        title: movie.title,
        description: movie.description,
        duration: movie.duration,
        genre: movie.genre.join(', '),
        rating: movie.rating,
        director: movie.director,
        actors: movie.actors.join(', '),
        releaseDate: movie.releaseDate,
        endDate: movie.endDate,
        status: movie.status,
        posterUrl: movie.posterUrl,
        posterType: 'url'
      });
    } else {
      setEditingMovie(null);
      setFormData({
        title: '',
        description: '',
        duration: 120,
        genre: 'Action, Drama',
        rating: 'PG-13',
        director: '',
        actors: '',
        releaseDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        status: 'now-showing',
        posterUrl: '',
        posterType: 'url'
      });
    }
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, posterUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const movieData: Movie = {
      id: editingMovie ? editingMovie.id : `M${Date.now()}`,
      code: editingMovie ? editingMovie.code : `M${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      title: formData.title,
      description: formData.description,
      duration: formData.duration,
      genre: formData.genre.split(',').map(s => s.trim()),
      rating: formData.rating,
      posterUrl: formData.posterUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400&h=600',
      director: formData.director,
      actors: formData.actors.split(',').map(s => s.trim()),
      releaseDate: formData.releaseDate,
      endDate: formData.endDate,
      status: formData.status,
    };

    if (editingMovie) {
      setMovies(prev => prev.map(m => m.id === editingMovie.id ? movieData : m));
    } else {
      setMovies(prev => [movieData, ...prev]);
    }
    setIsModalOpen(false);
  };

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
          <button onClick={() => handleOpenModal()} className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-400 transition-all">
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
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${movie.status === 'now-showing' ? 'bg-emerald-500/10 text-emerald-500' : movie.status === 'coming-soon' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>
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
                  <button onClick={() => handleOpenModal(movie)} className="p-2 text-zinc-500 hover:text-yellow-500 transition-colors">
                    <Edit size={16}/>
                  </button>
                  <button onClick={() => handleDelete(movie.id)} className="p-2 text-zinc-500 hover:text-red-500 transition-colors">
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-zinc-950 border border-zinc-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white">{editingMovie ? 'Chỉnh sửa phim' : 'Thêm phim mới'}</h2>
                  <p className="text-zinc-500 text-sm">Nhập thông tin chi tiết cho bộ phim</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-900 rounded-xl text-zinc-500 transition-colors">
                  <X size={24}/>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left side: Poster selection */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Poster phim</label>
                    <div className="aspect-[2/3] w-full bg-zinc-900 rounded-2xl border-2 border-dashed border-zinc-800 overflow-hidden relative group">
                      {formData.posterUrl ? (
                        <img src={formData.posterUrl} className="w-full h-full object-cover" alt="Preview"/>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700">
                          <Film size={48} className="mb-4 opacity-20"/>
                          <span className="text-xs font-bold">Chưa có ảnh</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 p-6 text-center">
                        <p className="text-xs text-zinc-300">Kích thước khuyên dùng: 400x600px</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-900 space-y-4">
                    <div className="flex gap-2 p-1 bg-zinc-950 rounded-xl">
                      <button type="button" onClick={() => setFormData(f => ({ ...f, posterType: 'url' }))} 
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${formData.posterType === 'url' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>
                        <Link size={14}/> URL Ảnh
                      </button>
                      <button type="button" onClick={() => setFormData(f => ({ ...f, posterType: 'file' }))} 
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${formData.posterType === 'file' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>
                        <Upload size={14}/> Tải từ máy
                      </button>
                    </div>

                    {formData.posterType === 'url' ? (
                      <input type="url" placeholder="https://example.com/poster.jpg" value={formData.posterUrl} onChange={(e) => setFormData(f => ({ ...f, posterUrl: e.target.value }))}
                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white outline-none focus:border-yellow-500/50"
                      />
                    ) : (
                      <label className="block w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-500 cursor-pointer hover:border-yellow-500/30 transition-all text-center">
                        <span className="font-bold">Chọn file ảnh...</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange}/>
                      </label>
                    )}
                  </div>
                </div>

                {/* Right side: Form info */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Tên phim</label>
                       <input type="text" required value={formData.title} onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white outline-none focus:border-yellow-500/50"
                       />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Thời lượng (p)</label>
                        <input type="number" required value={formData.duration} onChange={(e) => setFormData(f => ({ ...f, duration: parseInt(e.target.value) }))}
                          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white outline-none focus:border-yellow-500/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Độ tuổi</label>
                        <select value={formData.rating} onChange={(e) => setFormData(f => ({ ...f, rating: e.target.value }))}
                          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white outline-none"
                        >
                          <option value="G">G - Mọi lứa tuổi</option>
                          <option value="PG">PG - Cần giám sát</option>
                          <option value="PG-13">PG-13 - Trên 13 tuổi</option>
                          <option value="R">R - Trên 18 tuổi</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Thể loại (cách nhau bởi dấu phẩy)</label>
                      <input type="text" placeholder="Hành động, Viễn tưởng..." value={formData.genre} onChange={(e) => setFormData(f => ({ ...f, genre: e.target.value }))}
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white outline-none focus:border-yellow-500/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Trạng thái</label>
                      <div className="flex gap-2">
                        {['now-showing', 'coming-soon', 'stopped'].map(s => (
                          <button key={s} type="button" onClick={() => setFormData(f => ({ ...f, status: s as MovieStatus }))}
                            className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase border transition-all ${formData.status === s ? 'bg-yellow-500 border-yellow-500 text-black' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
                          >
                            {s === 'now-showing' ? 'Đang chiếu' : s === 'coming-soon' ? 'Sắp chiếu' : 'Ngừng chiếu'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Mô tả</label>
                      <textarea rows={3} value={formData.description} onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white outline-none focus:border-yellow-500/50 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 px-6 bg-zinc-900 border border-zinc-800 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all">
                      Hủy bỏ
                    </button>
                    <button type="submit" className="flex-[2] py-4 px-6 bg-yellow-500 text-black rounded-2xl font-bold hover:bg-yellow-400 transition-all shadow-xl shadow-yellow-500/20">
                      {editingMovie ? 'Cập nhật phim' : 'Lưu phim mới'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};