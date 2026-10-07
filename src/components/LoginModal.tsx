import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { USER_ACCOUNTS } from '../data/userAccounts';
import { 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  User, 
  ArrowRight, 
  Check, 
  X,
  KeyRound,
  Shield
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, currentUser, switchUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = login(username, password);
    if (success) {
      onClose();
    } else {
      setError('Tên đăng nhập không chính xác. Vui lòng kiểm tra lại hoặc chọn tài khoản bên dưới.');
    }
  };

  const handleSelectAccount = (userId: string) => {
    switchUser(userId);
    onClose();
  };

  const leaders = USER_ACCOUNTS.filter((u) => u.role === 'LEADER');
  const staff = USER_ACCOUNTS.filter((u) => u.role === 'STAFF');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Official Banner Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-700 flex items-center justify-center shadow-inner">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-2xs font-mono uppercase tracking-wider text-red-300 block">
                UBND PHƯỜNG HỐ NAI · TTDVTH
              </span>
              <h2 className="text-base font-bold text-white">
                Đăng Nhập Phân Quyền Hệ Thống
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status if already logged in */}
        {currentUser && (
          <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-200 text-xs flex items-center justify-between">
            <span className="text-slate-600">
              Đang đăng nhập: <strong>{currentUser.fullName}</strong> ({currentUser.position})
            </span>
            <span className={`px-2 py-0.5 rounded text-2xs font-bold ${
              currentUser.isLeader ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {currentUser.role === 'LEADER' ? 'CẤP LÃNH ĐẠO' : 'CẤP NHÂN VIÊN'}
            </span>
          </div>
        )}

        <div className="p-6 space-y-5 text-xs sm:text-sm">
          
          {/* Custom Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            {error && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên đăng nhập / Mã định danh:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="VD: phong.giamdoc, duong.dtc, cuong.dvci..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mật khẩu:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu (hoặc để trống khi thử nghiệm)..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Xác Nhận Đăng Nhập</span>
            </button>
          </form>

          {/* Quick 1-Click Role Switcher */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <ShieldCheck className="w-4 h-4 text-red-700" />
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  1. Tài khoản Cấp Lãnh Đạo (Quyền: Giao việc, Chỉ đạo, Đôn đốc, Phê duyệt)
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {leaders.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectAccount(u.id)}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-red-600 bg-red-50 text-red-950 ring-1 ring-red-600'
                          : 'border-slate-200 hover:border-red-300 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-xs">
                        <span>{u.fullName}</span>
                        {isCurrent && <Check className="w-3.5 h-3.5 text-red-700" />}
                      </div>
                      <div className="text-2xs text-slate-500 mt-0.5">{u.position}</div>
                      <div className="font-mono text-2xs text-red-700 mt-1">user: {u.username}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <UserCheck className="w-4 h-4 text-blue-700" />
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  2. Tài khoản Cấp Nhân Viên (Quyền: Xem việc được giao, Cập nhật tiến độ)
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {staff.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectAccount(u.id)}
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-blue-600 bg-blue-50 text-blue-950 ring-1 ring-blue-600'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-xs">
                        <span className="truncate">{u.shortName}</span>
                        {isCurrent && <Check className="w-3 h-3 text-blue-700 shrink-0" />}
                      </div>
                      <div className="text-2xs text-slate-500 truncate mt-0.5">{u.unit.replace('Tổ ', '')}</div>
                      <div className="font-mono text-2xs text-blue-700 mt-1 truncate">user: {u.username}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-2xs text-slate-500">
          <span>Phân quyền RBAC bám sát chức danh công vụ</span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>

      </div>
    </div>
  );
};
