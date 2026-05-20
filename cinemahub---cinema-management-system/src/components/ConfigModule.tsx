import React, { useState } from 'react';
import { Settings, DollarSign, Percent, Shield, Bell, Database, Globe, Lock, UserPlus, Save, CheckCircle2, Plus, Edit, Trash2 } from 'lucide-react';
import { PROMOTIONS } from '../constants';

export const ConfigModule: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'pricing' | 'promotions' | 'rbac' | 'general'>('pricing');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1 space-y-2">
        {[
          { id: 'pricing', label: 'Cấu hình giá vé', icon: DollarSign },
          { id: 'promotions', label: 'Khuyến mãi & Voucher', icon: Percent },
          { id: 'rbac', label: 'Phân quyền hệ thống', icon: Shield },
          { id: 'general', label: 'Cài đặt chung', icon: Settings },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id as any)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
              activeSection === item.id ? 'bg-yellow-500 text-black font-bold shadow-lg shadow-yellow-500/10' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
            }`}
          >
            <item.icon size={20} />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="lg:col-span-3 bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8">
        {activeSection === 'pricing' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Cấu hình giá vé cơ bản</h3>
              <p className="text-zinc-500 text-sm">Thiết lập giá vé theo loại ghế, khung giờ và ngày trong tuần.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Theo loại ghế</h4>
                <div className="space-y-3">
                  {['Ghế thường', 'Ghế VIP', 'Ghế đôi (Sweetbox)'].map((type, i) => (
                    <div key={type} className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
                      <span className="text-sm text-zinc-300">{type}</span>
                      <div className="flex items-center gap-2">
                        <input type="text" defaultValue={i === 0 ? '80.000' : i === 1 ? '110.000' : '220.000'} className="w-24 bg-zinc-800 border-none rounded-lg p-2 text-right text-sm text-white font-bold outline-none focus:ring-1 focus:ring-yellow-500"/>
                        <span className="text-xs text-zinc-500 font-bold">VNĐ</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Phụ phí khung giờ</h4>
                <div className="space-y-3">
                  {['Suất tối (sau 18h)', 'Cuối tuần (T7, CN)', 'Ngày lễ'].map((type, i) => (
                    <div key={type} className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
                      <span className="text-sm text-zinc-300">{type}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-emerald-500 font-bold">+</span>
                        <input type="text" defaultValue={i === 0 ? '15.000' : i === 1 ? '25.000' : '40.000'} className="w-20 bg-zinc-800 border-none rounded-lg p-2 text-right text-sm text-white font-bold outline-none focus:ring-1 focus:ring-yellow-500"/>
                        <span className="text-xs text-zinc-500 font-bold">VNĐ</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-zinc-800 flex justify-end">
              <button className="px-8 py-3 bg-yellow-500 text-black rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-400 transition-all">
                <Save size={18}/> Lưu cấu hình
              </button>
            </div>
          </div>
        )}

        {activeSection === 'promotions' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Chính sách khuyến mãi</h3>
                <p className="text-zinc-500 text-sm">Quản lý mã giảm giá và các chương trình ưu đãi.</p>
              </div>
              <button className="p-2 bg-yellow-500 text-black rounded-xl hover:bg-yellow-400 transition-all"><Plus size={20}/></button>
            </div>

            <div className="space-y-4">
              {PROMOTIONS.map(promo => (
                <div key={promo.id} className="flex items-center justify-between p-6 bg-zinc-900 border border-zinc-800 rounded-3xl group hover:border-zinc-600 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-500 border border-yellow-500/20">
                      <Percent size={32}/>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">{promo.code}</h4>
                      <p className="text-sm text-zinc-500">{promo.description}</p>
                      <p className="text-[10px] text-zinc-600 font-bold mt-1 uppercase tracking-widest">Hết hạn: {promo.validUntil}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <span className="text-2xl font-bold text-yellow-500">-{promo.discountPercent}%</span>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-zinc-500 hover:text-white transition-colors"><Edit size={18}/></button>
                      <button className="p-2 text-zinc-500 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'rbac' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Phân quyền người dùng</h3>
              <p className="text-zinc-500 text-sm">Thiết lập quyền hạn truy cập cho các vai trò trong hệ thống.</p>
            </div>

            <div className="space-y-6">
              {['Quản trị viên (Admin)', 'Quản lý rạp (Manager)', 'Nhân viên bán vé (Staff)'].map((role, i) => (
                <div key={role} className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-bold text-white">{role}</h4>
                    <button className="text-xs text-yellow-500 font-bold hover:underline">Chỉnh sửa quyền</button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['Quản lý phim', 'Quản lý suất chiếu', 'Bán vé', 'Báo cáo doanh thu', 'Cấu hình hệ thống', 'Quản lý nhân sự'].map((perm, j) => {
                      const isAllowed = i === 0 || (i === 1 && j < 4) || (i === 2 && j === 2);
                      return (
                        <div key={perm} className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${isAllowed ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-zinc-800 border-zinc-700 text-zinc-600'}`}>
                            {isAllowed && <CheckCircle2 size={12}/>}
                          </div>
                          <span className={`text-xs ${isAllowed ? 'text-zinc-300' : 'text-zinc-600'}`}>{perm}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
