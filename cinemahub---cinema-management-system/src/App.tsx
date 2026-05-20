import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Film, 
  Calendar, 
  Ticket, 
  Users, 
  BarChart3, 
  Settings, 
  Search, 
  Bell, 
  User as UserIcon,
  LogOut,
  Menu,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthModule } from './components/AuthModule';
import { MoviesModule } from './components/MoviesModule';
import { RoomsModule } from './components/RoomsModule';
import { ShowtimesModule } from './components/ShowtimesModule';
import { BookingModule } from './components/BookingModule';
import { CustomersModule } from './components/CustomersModule';
import { StaffModule } from './components/StaffModule';
import { ReportsModule } from './components/ReportsModule';
import { ConfigModule } from './components/ConfigModule';

type View = 'dashboard' | 'movies' | 'rooms' | 'showtimes' | 'booking' | 'customers' | 'staff' | 'reports' | 'config';

const App: React.FC = () => {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (!user) {
    return <AuthModule onLogin={(userData) => setUser(userData)} />;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'movies', label: 'Quản lý phim', icon: Film },
    { id: 'rooms', label: 'Phòng chiếu', icon: Calendar },
    { id: 'showtimes', label: 'Lịch chiếu', icon: Calendar },
    { id: 'booking', label: 'Bán vé & Đặt vé', icon: Ticket },
    { id: 'customers', label: 'Khách hàng', icon: Users },
    { id: 'staff', label: 'Nhân sự', icon: Users },
    { id: 'reports', label: 'Báo cáo', icon: BarChart3 },
    { id: 'config', label: 'Cấu hình', icon: Settings },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <ReportsModule />;
      case 'movies': return <MoviesModule />;
      case 'rooms': return <RoomsModule />;
      case 'showtimes': return <ShowtimesModule />;
      case 'booking': return <BookingModule />;
      case 'customers': return <CustomersModule />;
      case 'staff': return <StaffModule />;
      case 'reports': return <ReportsModule />;
      case 'config': return <ConfigModule />;
      default: return <ReportsModule />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-yellow-500/30 selection:text-yellow-500">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-zinc-950 border-r border-zinc-900 z-50 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
            <Film className="text-black" size={24} />
          </div>
          {isSidebarOpen && (
            <span className="text-xl font-black text-white tracking-tighter">CINEMA<span className="text-yellow-500">HUB</span></span>
          )}
        </div>

        <nav className="mt-6 px-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as View)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
                activeView === item.id 
                  ? 'bg-yellow-500 text-black font-bold shadow-lg shadow-yellow-500/10' 
                  : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
              }`}
            >
              <item.icon size={20} className={activeView === item.id ? 'text-black' : 'group-hover:text-yellow-500 transition-colors'} />
              {isSidebarOpen && <span className="text-sm">{item.label}</span>}
              {activeView === item.id && isSidebarOpen && (
                <motion.div layoutId="active-pill" className="ml-auto">
                  <ChevronRight size={16} />
                </motion.div>
              )}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-6 left-0 w-full px-3">
          <button 
            onClick={() => setUser(null)}
            className="w-full flex items-center gap-4 px-4 py-3 text-zinc-500 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-sm font-bold">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-20'}`}>
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-zinc-900 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-500 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="text"
                placeholder="Tìm kiếm nhanh..."
                className="pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:ring-2 focus:ring-yellow-500/50 outline-none w-64 transition-all focus:w-80"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-zinc-900 rounded-xl text-zinc-500 relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-yellow-500 rounded-full border-2 border-[#050505]" />
            </button>
            <div className="h-8 w-px bg-zinc-800 mx-2" />
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-none">{user.name}</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">{user.role}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
                <UserIcon size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default App;
