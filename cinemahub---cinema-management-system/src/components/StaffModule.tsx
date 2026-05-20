import React, { useState } from 'react';
import { Users, Plus, Search, Filter, Calendar, Clock, DollarSign, UserCheck, MoreVertical, Edit, Trash2, ShieldCheck } from 'lucide-react';
import { USERS, SHIFTS } from '../constants';
import { User, Shift } from '../types';

export const StaffModule: React.FC = () => {
  const [staff, setStaff] = useState<User[]>(USERS.filter(u => u.role === 'admin' || u.role === 'staff' || u.role === 'manager'));
  const [activeTab, setActiveTab] = useState<'list' | 'shifts'>('list');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý nhân sự</h1>
          <p className="text-zinc-500 text-sm">Quản lý nhân viên, phân ca và theo dõi hiệu suất.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-400 transition-all">
            <Plus size={18}/> Thêm nhân viên
          </button>
        </div>
      </div>

      <div className="flex border-b border-zinc-800">
        <button onClick={() => setActiveTab('list')}
          className={`px-6 py-3 text-sm font-bold transition-all relative ${activeTab === 'list' ? 'text-yellow-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Danh sách nhân viên
          {activeTab === 'list' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500"/>}
        </button>
        <button onClick={() => setActiveTab('shifts')}
          className={`px-6 py-3 text-sm font-bold transition-all relative ${activeTab === 'shifts' ? 'text-yellow-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Phân ca & Chấm công
          {activeTab === 'shifts' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500"/>}
        </button>
      </div>

      {activeTab === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((member) => (
            <div key={member.id} className="bg-zinc-900/40 rounded-2xl border border-zinc-800 p-6 hover:border-zinc-700 transition-all">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700">
                    <UserCheck size={24}/>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{member.name}</h3>
                    <p className="text-xs text-zinc-500 font-mono">{member.code}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                  member.role === 'admin' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                  member.role === 'manager' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 
                  'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                }`}>
                  {member.role}
                </span>
              </div>
              <div className="space-y-3 mb-6">
                <p className="text-xs text-zinc-400 flex items-center gap-2"><Clock size={14} className="text-zinc-600"/> Ca làm việc: Sáng / Chiều</p>
                <p className="text-xs text-zinc-400 flex items-center gap-2"><DollarSign size={14} className="text-zinc-600"/> Doanh thu tháng: 45.000.000đ</p>
                <p className="text-xs text-zinc-400 flex items-center gap-2"><ShieldCheck size={14} className="text-zinc-600"/> Quyền hạn: {member.role === 'admin' ? 'Toàn quyền' : 'Giới hạn'}</p>
              </div>
              <div className="flex gap-2 pt-4 border-t border-zinc-800">
                <button className="flex-1 py-2 bg-zinc-800 rounded-xl text-xs font-bold text-zinc-300 hover:bg-zinc-700 transition-colors">Chỉnh sửa</button>
                <button className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-colors">Xóa</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="p-4 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"><Calendar size={18}/></button>
              <h3 className="font-bold text-white">Lịch làm việc tuần này</h3>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-zinc-800 rounded-lg text-xs font-bold text-zinc-400">Tuần trước</button>
              <button className="px-3 py-1.5 bg-zinc-800 rounded-lg text-xs font-bold text-zinc-400">Tuần sau</button>
            </div>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Nhân viên</th>
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Ca làm</th>
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Thời gian</th>
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Trạng thái</th>
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Doanh thu ca</th>
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {SHIFTS.map((shift) => {
                const staffMember = USERS.find(u => u.id === shift.staffId);
                return (
                  <tr key={shift.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">{staffMember?.name[0]}</div>
                        <span className="font-semibold text-white text-sm">{staffMember?.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                        shift.type === 'morning' ? 'bg-yellow-500/10 text-yellow-500' : 
                        shift.type === 'afternoon' ? 'bg-orange-500/10 text-orange-500' : 
                        'bg-purple-500/10 text-purple-500'
                      }`}>
                        {shift.type === 'morning' ? 'Sáng' : shift.type === 'afternoon' ? 'Chiều' : 'Tối'}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-400 text-xs">
                      {shift.type === 'morning' ? '07:00 - 12:00' : shift.type === 'afternoon' ? '12:00 - 17:00' : '17:00 - 22:00'}
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold ${shift.status === 'completed' ? 'text-emerald-500' : 'text-zinc-500'}`}>
                        {shift.status === 'completed' ? 'Đã hoàn thành' : 'Sắp tới'}
                      </span>
                    </td>
                    <td className="p-4 text-white font-bold text-sm">{shift.revenue.toLocaleString()}đ</td>
                    <td className="p-4 text-right">
                      <button className="text-zinc-500 hover:text-white transition-colors"><MoreVertical size={16}/></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
