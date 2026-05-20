import React, { useState } from 'react';
import { Mail, Lock, User, LifeBuoy, ChevronRight, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModuleProps {
  onLogin: (user: { name: string; role: string }) => void;
}

export const AuthModule: React.FC<AuthModuleProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Giả lập đăng nhập thành công
    onLogin({
      name: formData.name || 'Duy Nguyễn',
      role: 'Quản trị viên',
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-10 shadow-2xl shadow-yellow-500/5"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/20 mb-6 group cursor-pointer">
            <LifeBuoy className="text-black group-hover:rotate-180 transition-transform duration-500" size={32} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">
            CINEMA<span className="text-yellow-500">HUB</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            {isLogin ? 'Chào mừng bạn quay trở lại' : 'Bắt đầu quản lý rạp phim chuyên nghiệp'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Họ và tên"
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-yellow-500/50 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
              <Mail size={18} />
            </div>
            <input
              type="email"
              placeholder="Email"
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-yellow-500/50 outline-none transition-all"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
              <Lock size={18} />
            </div>
            <input
              type="password"
              placeholder="Mật khẩu"
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-yellow-500/50 outline-none transition-all"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="flex justify-end pt-1">
            <button type="button" className="text-xs text-zinc-500 hover:text-yellow-500 font-bold transition-colors">
              Quên mật khẩu?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-yellow-500/10 active:scale-95"
          >
            {isLogin ? 'ĐĂNG NHẬP' : 'TẠO TÀI KHOẢN'}
            <ChevronRight size={20} />
          </button>
        </form>

        <div className="mt-8 flex items-center gap-4">
          <div className="h-px bg-zinc-900 flex-1" />
          <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Hoặc đăng nhập với</span>
          <div className="h-px bg-zinc-900 flex-1" />
        </div>

        <button className="w-full mt-6 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-2xl py-4 flex items-center justify-center gap-3 transition-colors text-white font-bold text-sm">
          <Github size={20} />
          GitHub
        </button>

        <p className="mt-10 text-center text-zinc-500 text-sm">
          {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-yellow-500 font-black hover:underline"
          >
            {isLogin ? 'Đăng ký ngay' : 'Đăng nhập ngay'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};
