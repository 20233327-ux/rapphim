import React, { useState } from 'react';
import { Ticket, Search, MapPin, Clock, Armchair, ChevronRight, CreditCard, Smartphone, Banknote, QrCode, CheckCircle2, User as UserIcon, ShoppingCart, History, Calendar, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Showtime, Movie, Room, Booking, User } from '../types';

interface BookingModuleProps {
  movies: Movie[];
  showtimes: Showtime[];
  rooms: Room[];
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  users: User[];
  currentUserId: string;
}

export const BookingModule: React.FC<BookingModuleProps> = ({ movies, showtimes, rooms, bookings, setBookings, users, currentUserId }) => {
  const [step, setStep] = useState<'select-showtime' | 'select-seats' | 'payment' | 'success' | 'history'>('select-showtime');
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'vnpay' | 'momo' | 'credit-card' | 'cash'>('vnpay');

  const movie = selectedShowtime ? movies.find(m => m.id === selectedShowtime.movieId) : null;
  const room = selectedShowtime ? rooms.find(r => r.id === selectedShowtime.roomId) : null;

  const userBookings = bookings.filter(b => b.userId === currentUserId);

  // Get booked seats for the selected showtime
  const bookedSeatsForShowtime = bookings
    .filter(b => b.showtimeId === selectedShowtime?.id && b.status === 'completed')
    .flatMap(b => b.seatIds);

  const handleShowtimeSelect = (st: Showtime) => {
    setSelectedShowtime(st);
    setSelectedSeats([]);
    setStep('select-seats');
  };

  const handleSeatToggle = (seatId: string) => {
    setSelectedSeats(prev => prev.includes(seatId) ? prev.filter(s => s !== seatId) : [...prev, seatId]);
  };

  const handlePayment = () => {
    if (!selectedShowtime) return;

    const newBooking: Booking = {
      id: `B${Date.now()}`,
      userId: currentUserId,
      showtimeId: selectedShowtime.id,
      seatIds: selectedSeats,
      totalPrice: selectedShowtime.basePrice * selectedSeats.length,
      paymentMethod: paymentMethod,
      status: 'completed',
      createdAt: new Date().toISOString(),
      qrCode: `CH-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      movieId: ''
    };

    setBookings(prev => [newBooking, ...prev]);
    setStep('success');
  };

  const handlePrint = () => {
    // Generate simple printable content
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const latestBooking = bookings[0]; // Assuming latest is what we want to print
    const st = showtimes.find(s => s.id === latestBooking?.showtimeId);
    const m = movies.find(movie => movie.id === st?.movieId);
    const r = rooms.find(room => room.id === st?.roomId);

    printWindow.document.write(`
      <html>
        <head>
          <title>Vé Xem Phim - ${m?.title}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; text-align: center; }
            .ticket { border: 2px dashed #000; padding: 20px; max-width: 400px; margin: 0 auto; }
            h1 { margin: 10px 0; }
            .info { text-align: left; margin: 20px 0; }
            .qr { margin-top: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <p>CINEMAHUB - Vé Xem Phim</p>
            <h1>${m?.title}</h1>
            <div class="info">
              <p><strong>Ngày:</strong> ${new Date(st?.startTime || '').toLocaleDateString('vi-VN')}</p>
              <p><strong>Giờ:</strong> ${new Date(st?.startTime || '').toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
              <p><strong>Phòng:</strong> ${r?.name}</p>
              <p><strong>Ghế:</strong> ${latestBooking?.seatIds.join(', ')}</p>
              <p><strong>Tổng tiền:</strong> ${latestBooking?.totalPrice.toLocaleString()}đ</p>
            </div>
            <div class="qr">
              MÃ VÉ: ${latestBooking?.qrCode || latestBooking?.id}
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const resetBooking = () => {
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setStep('select-showtime');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {step !== 'history' ? (
            <>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === 'select-showtime' ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>1</div>
              <div className={`w-12 h-0.5 rounded-full ${step !== 'select-showtime' ? 'bg-yellow-500' : 'bg-zinc-800'}`}/>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === 'select-seats' ? 'bg-yellow-500 text-black' : step === 'payment' || step === 'success' ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>2</div>
              <div className={`w-12 h-0.5 rounded-full ${step === 'payment' || step === 'success' ? 'bg-yellow-500' : 'bg-zinc-800'}`}/>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === 'payment' ? 'bg-yellow-500 text-black' : step === 'success' ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>3</div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-white font-bold text-xl">
              <History className="text-yellow-500"/>
              Lịch sử đặt vé
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setStep('history')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${step === 'history' ? 'bg-yellow-500 text-black font-bold' : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'}`}
          >
            <Ticket size={18}/>
            Vé đã đặt
          </button>
          <button onClick={resetBooking}
            className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all ${step !== 'history' ? 'bg-yellow-500 text-black shadow-yellow-500/10' : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'}`}
          >
            Đặt vé mới
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'select-showtime' && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {movies.filter(m => m.status === 'now-showing').map(m => (
                <div key={m.id} className="bg-zinc-900/40 rounded-2xl border border-zinc-800 overflow-hidden group">
                  <div className="flex gap-4 p-4">
                    <img src={m.posterUrl} alt="" className="w-24 h-36 rounded-lg object-cover" referrerPolicy="no-referrer"/>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-white line-clamp-2">{m.title}</h3>
                        <p className="text-xs text-zinc-500 mt-1">{m.duration} phút • {m.rating}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {showtimes.filter(st => st.movieId === m.id).map(st => (
                          <button key={st.id} onClick={() => handleShowtimeSelect(st)}
                            className="px-3 py-1.5 bg-zinc-800 hover:bg-yellow-500 hover:text-black rounded-lg text-xs font-bold transition-all"
                          >
                            {new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'select-seats' && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-zinc-900/40 rounded-3xl border border-zinc-800 p-12 flex flex-col items-center">
              <div className="w-full max-w-md h-2 bg-gradient-to-b from-yellow-500/50 to-transparent rounded-full mb-16 relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-yellow-500/50 uppercase tracking-[0.5em]">Màn hình</div>
              </div>
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${room?.cols || 10}, 1fr)` }}>
                {Array.from({ length: (room?.rows || 8) * (room?.cols || 10) }).map((_, i) => {
                  const row = String.fromCharCode(65 + Math.floor(i / (room?.cols || 10)));
                  const col = (i % (room?.cols || 10)) + 1;
                  const id = `${row}${col}`;
                  const isSelected = selectedSeats.includes(id);
                  const isBooked = bookedSeatsForShowtime.includes(id);
                  return (
                    <button key={id} disabled={isBooked} onClick={() => handleSeatToggle(id)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                        isBooked ? 'bg-zinc-800 text-zinc-700 cursor-not-allowed' : isSelected ? 'bg-yellow-500 text-black scale-110 shadow-lg shadow-yellow-500/20' : 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:border-zinc-600'
                      }`}
                    >
                      {id}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800 p-6">
                <h3 className="font-bold text-lg text-white mb-6">Thông tin vé</h3>
                <div className="flex gap-4 mb-6">
                  <img src={movie?.posterUrl} alt="" className="w-20 h-28 rounded-lg object-cover" referrerPolicy="no-referrer"/>
                  <div>
                    <h4 className="font-bold text-white">{movie?.title}</h4>
                    <p className="text-xs text-yellow-500 mt-1">{room?.name} • {room?.type}</p>
                    <p className="text-xs text-zinc-500 mt-1">{new Date(selectedShowtime?.startTime || '').toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="space-y-4 py-6 border-y border-zinc-800">
                  <div className="flex justify-between text-sm"><span className="text-zinc-500">Ghế đã chọn</span><span className="text-white font-bold">{selectedSeats.join(', ') || 'Chưa chọn'}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-zinc-500">Tạm tính</span><span className="text-white font-bold">{((selectedShowtime?.basePrice || 0) * selectedSeats.length).toLocaleString()}đ</span></div>
                </div>
                <button disabled={selectedSeats.length === 0} onClick={() => setStep('payment')}
                  className="w-full mt-6 py-4 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 disabled:opacity-50 transition-all"
                >
                  Tiếp tục thanh toán
                </button>
                <button onClick={() => setStep('select-showtime')} className="w-full mt-2 py-2 text-zinc-500 text-sm hover:text-white transition-colors">Quay lại</button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'payment' && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800 p-6">
                <h3 className="font-bold text-lg text-white mb-6">Phương thức thanh toán</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'vnpay', label: 'VNPay', icon: Smartphone },
                    { id: 'momo', label: 'MoMo', icon: Smartphone },
                    { id: 'credit-card', label: 'Thẻ tín dụng', icon: CreditCard },
                    { id: 'cash', label: 'Tiền mặt (tại quầy)', icon: Banknote },
                  ].map(method => (
                    <button key={method.id} onClick={() => setPaymentMethod(method.id as any)}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${paymentMethod === method.id ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                    >
                      <method.icon size={24}/>
                      <span className="font-bold">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800 p-6">
                <h3 className="font-bold text-lg text-white mb-6">Thông tin khách hàng</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold">Họ và tên</label>
                    <input type="text" defaultValue={users.find(u => u.id === currentUserId)?.name} placeholder="Nguyễn Văn A" className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-yellow-500"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold">Số điện thoại</label>
                    <input type="text" defaultValue={users.find(u => u.id === currentUserId)?.phone} placeholder="0901234567" className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-yellow-500"/>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800 p-6 h-fit">
              <h3 className="font-bold text-lg text-white mb-6">Tổng kết</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm"><span className="text-zinc-500">Số lượng ghế</span><span className="text-white">{selectedSeats.length}</span></div>
                <div className="flex justify-between text-sm"><span className="text-zinc-500">Tạm tính</span><span className="text-white">{((selectedShowtime?.basePrice || 0) * selectedSeats.length).toLocaleString()}đ</span></div>
                <div className="flex justify-between text-sm"><span className="text-zinc-500">Giảm giá</span><span className="text-emerald-500">-0đ</span></div>
                <div className="pt-4 border-t border-zinc-800 flex justify-between items-end">
                  <span className="text-zinc-500 text-sm">Tổng cộng</span>
                  <span className="text-2xl font-bold text-yellow-500">{((selectedShowtime?.basePrice || 0) * selectedSeats.length).toLocaleString()}đ</span>
                </div>
              </div>
              <button onClick={handlePayment} className="w-full py-4 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20">Xác nhận đặt vé</button>
              <button onClick={() => setStep('select-seats')} className="w-full mt-2 py-2 text-zinc-500 text-sm hover:text-white transition-colors">Quay lại</button>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30">
              <CheckCircle2 size={40}/>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Đặt vé thành công!</h2>
            <p className="text-zinc-500 max-w-md mb-8">Mã vé và thông tin chi tiết đã được gửi đến email và số điện thoại của bạn.</p>
            <div className="bg-white p-6 rounded-3xl mb-8 shadow-2xl shadow-white/5">
              <QrCode size={160} className="text-black"/>
              <p className="text-black font-mono font-bold mt-4 tracking-widest text-lg">CH-8829-1029</p>
            </div>
            <div className="flex gap-4">
              <button onClick={resetBooking} className="px-8 py-3 bg-zinc-900 border border-zinc-800 rounded-xl font-bold text-white hover:bg-zinc-800 transition-all">Về trang chủ</button>
              <button onClick={handlePrint} className="px-8 py-3 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/10">In vé ngay</button>
            </div>
          </motion.div>
        )}


        {step === 'history' && (
          <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userBookings.map(booking => {
                const st = showtimes.find(s => s.id === booking.showtimeId);
                const m = movies.find(movie => movie.id === st?.movieId);
                const r = rooms.find(room => room.id === st?.roomId);
                
                return (
                  <div key={booking.id} className="bg-zinc-900/40 rounded-3xl border border-zinc-800 overflow-hidden flex flex-col sm:flex-row group hover:border-zinc-600 transition-all">
                    <div className="w-full sm:w-40 h-56 sm:h-auto relative">
                      <img src={m?.posterUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer"/>
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent sm:hidden"/>
                    </div>

                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-white text-lg line-clamp-1">{m?.title}</h3>
                          <span className="text-[10px] font-bold px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20 uppercase">Đã thanh toán</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-zinc-400 text-sm">
                            <Calendar size={14} className="text-yellow-500"/>
                            <span>{new Date(st?.startTime || '').toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-zinc-400 text-sm">
                            <Clock size={14} className="text-yellow-500"/>
                            <span>{new Date(st?.startTime || '').toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-zinc-400 text-sm">
                            <MapPin size={14} className="text-yellow-500"/>
                            <span>{r?.name} • Ghế: <span className="text-white font-bold">{booking.seatIds.join(', ')}</span></span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg">
                            <QrCode size={24} className="text-black"/>
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Mã vé</p>
                            <p className="text-xs font-mono text-white font-bold">{booking.id}</p>
                          </div>
                        </div>
                        <button className="p-2 text-zinc-500 hover:text-yellow-500 transition-colors">
                          <ExternalLink size={20}/>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {userBookings.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 text-zinc-700">
                  <Ticket size={32}/>
                </div>
                <h3 className="text-white font-bold text-lg">Chưa có vé nào được đặt</h3>
                <p className="text-zinc-500 text-sm mt-1">Hãy bắt đầu đặt vé để xem lịch sử tại đây.</p>
                <button onClick={() => setStep('select-showtime')} className="mt-6 px-6 py-2 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition-all">Đặt vé ngay</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
