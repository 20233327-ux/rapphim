import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, Shield, ArrowRight, Eye, EyeOff, Film, AlertCircle, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { dataService } from '../dataService';

interface AuthModuleProps {
  users: User[];
  onLogin: (user: User) => void;
}

export const AuthModule: React.FC<AuthModuleProps> = ({ users, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const payload = await dataService.login(email, password);
        const fullUser = users.find((u) => u.id === payload.user.id);

        if (fullUser) {
          onLogin(fullUser);
          return;
        }

        onLogin({
          id: payload.user.id,
          name: payload.user.name,
          email: payload.user.email,
          phone: '',
          role: payload.user.role,
        });
      } else {
        // Validation for registration
        if (!name.trim()) {
          setError('Vui lòng nhập họ và tên');
          return;
        }

        if (!email.includes('@')) {
          setError('Email không hợp lệ');
          return;
        }

        if (password.length < 6) {
          setError('Mật khẩu phải ít nhất 6 ký tự');
          return;
        }

        if (password !== confirmPassword) {
          setError('Mật khẩu không khớp');
          return;
        }

        // Call register API
        const payload = await dataService.register(name, email, password, phone || undefined);
        
        onLogin({
          id: payload.user.id,
          name: payload.user.name,
          email: payload.user.email,
          phone: phone || '',
          role: payload.user.role,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Đã xảy ra lỗi';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchMode = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setError(null);
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500 rounded-2xl shadow-2xl shadow-yellow-500/20 mb-6">
            <Film className="text-black" size={32} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
            CINEMA<span className="text-yellow-500">HUB</span>
          </h1>
          <p className="text-zinc-500">Hệ thống quản lý rạp phim chuyên nghiệp</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50" />
          
          <div className="flex bg-zinc-900 p-1 rounded-2xl mb-8">
            <button 
              onClick={() => handleSwitchMode(true)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${isLogin ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Đăng nhập
            </button>
            <button 
              onClick={() => handleSwitchMode(false)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${!isLogin ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Đăng ký
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-5"
                >
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-yellow-500 transition-colors" size={20} />
                    <input 
                      type="text" 
                      placeholder="Họ và tên"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-zinc-900 rounded-2xl text-white outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all"
                    />
                  </div>

                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-yellow-500 transition-colors" size={20} />
                    <input 
                      type="tel" 
                      placeholder="Số điện thoại (tùy chọn)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-zinc-900 rounded-2xl text-white outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-yellow-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Email hoặc Tên đăng nhập"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-zinc-900 rounded-2xl text-white outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-yellow-500 transition-colors" size={20} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-12 py-4 bg-zinc-900/50 border border-zinc-900 rounded-2xl text-white outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-yellow-500 transition-colors" size={20} />
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="Nhập lại mật khẩu"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required={!isLogin}
                      className="w-full pl-12 pr-12 py-4 bg-zinc-900/50 border border-zinc-900 rounded-2xl text-white outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-yellow-500 text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-yellow-400 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  {isLogin ? 'Đang xử lý...' : 'Đang tạo...'}
                </>
              ) : (
                <>
                  {isLogin ? 'Đăng nhập ngay' : 'Tạo tài khoản'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-zinc-500 text-sm">
            Quên mật khẩu? <button className="text-yellow-500 font-bold hover:underline">Khôi phục</button>
          </p>
        </div>

        <div className="mt-8 flex justify-center gap-6">
          <div className="flex items-center gap-2 text-zinc-600">
            <Shield size={16} />
            <span className="text-xs">Bảo mật SSL</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-600">
            <UserIcon size={16} />
            <span className="text-xs">2FA Option</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
