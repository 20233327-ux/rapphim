import React, { useState } from 'react';
import { Users, Search, Filter, Download, Plus, MoreVertical, Star, History, Mail, Phone, MapPin } from 'lucide-react';
import { USERS } from '../constants';
import { User } from '../types';

export const CustomersModule: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>(USERS.filter(u => u.role === 'customer'));
  const [search, setSearch] = useState('');

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý khách hàng</h1>
          <p className="text-zinc-500 text-sm">Quản lý thông tin, lịch sử giao dịch và điểm thưởng.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium text-zinc-300 hover:bg-zinc-800 flex items-center gap-2">
            <Download size={16}/> Xuất danh sách
          </button>
          <button className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-400 transition-all">
            <Plus size={18}/> Thêm khách hàng
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18}/>
          <input type="text" placeholder="Tìm theo tên, email hoặc số điện thoại..." className="w-full pl-10 pr-4 py-2 bg-zinc-800 border-none rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-yellow-500/50" value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="p-2 bg-zinc-800 text-zinc-400 rounded-xl hover:text-white transition-colors">
          <Filter size={20}/>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((customer) => (
          <div key={customer.id} className="bg-zinc-900/40 rounded-2xl border border-zinc-800 p-6 hover:border-zinc-600 transition-all group">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 font-bold text-lg border border-yellow-500/20">
                  {customer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-white group-hover:text-yellow-500 transition-colors">{customer.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Star size={12} className="text-yellow-500 fill-yellow-500"/>
                    <span className="text-xs text-zinc-500 font-bold">{customer.points} điểm</span>
                  </div>
                </div>
              </div>
              <button className="p-2 text-zinc-600 hover:text-white transition-colors">
                <MoreVertical size={18}/>
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <Mail size={14} className="text-zinc-600"/> {customer.email}
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <Phone size={14} className="text-zinc-600"/> {customer.phone}
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <MapPin size={14} className="text-zinc-600"/> {customer.address || 'Chưa cập nhật'}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex gap-2">
              <button className="flex-1 py-2 bg-zinc-800 rounded-xl text-xs font-bold text-zinc-300 hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
                <History size={14}/> Lịch sử mua vé
              </button>
              <button className="px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-xl text-xs font-bold hover:bg-yellow-500/20 transition-colors">
                Tích điểm
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
