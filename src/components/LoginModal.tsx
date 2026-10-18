import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  Lock, 
  User, 
  X,
  KeyRound,
  LogOut,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, currentUser, logout } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim()) {
      setError('Vui lòng nhập tên tài khoản cán bộ.');
      return;
    }
    const success = login(username, password);
    if (success) {
      setUsername('');
      setPassword('');
      onClose();
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.');
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[8px] shadow-xl max-w-md w-full border border-[#E5E7EB] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Official Banner Header */}
        <div className="bg-[#003366] px-5 py-4 text-white flex items-center justify-between border-b border-[#002244]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[6px] bg-white/10 flex items-center justify-center text-white shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[12px] font-semibold uppercase tracking-wider text-blue-200 block">
                UBND PHƯỜNG HỐ NAI · TTDVTH
              </span>
              <h2 className="text-[16px] font-bold text-white">
                Chuyển Đổi Tài Khoản Cán Bộ
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-[6px] text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status if already logged in */}
        {currentUser && (
          <div className="bg-[#F4F6F9] px-5 py-3 border-b border-[#E5E7EB] text-[13px] flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <span className="text-[#4B5563] text-[12px] block">Tài khoản đang đăng nhập:</span>
              <span className="font-bold text-[#111827] truncate block text-[14px]">{currentUser.fullName}</span>
              <span className="text-[#4B5563] text-[12px]">{currentUser.position}</span>
            </div>
            <span className={`px-2.5 py-1 rounded-[4px] text-[12px] font-bold shrink-0 border ${
              currentUser.isLeader ? 'bg-red-50 text-[#D32F2F] border-red-200' : 'bg-blue-50 text-[#003366] border-blue-200'
            }`}>
              {currentUser.role === 'LEADER' ? 'CẤP LÃNH ĐẠO' : 'CẤP NHÂN VIÊN'}
            </span>
          </div>
        )}

        <div className="p-5 space-y-4">
          
          {/* Custom Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            {error && (
              <div className="p-3 rounded-[8px] bg-red-50 border border-red-200 text-[#D32F2F] text-[13px] leading-relaxed">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[13px] font-semibold text-[#111827] mb-1.5">
                Tên đăng nhập / Mã cán bộ:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên tài khoản cán bộ..."
                  className="w-full pl-9 pr-3 py-2 text-[14px] rounded-[8px] border border-[#E5E7EB] bg-white text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366] focus:border-[#003366]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#111827] mb-1.5">
                Mật khẩu:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu công vụ..."
                  className="w-full pl-9 pr-9 py-2 text-[14px] rounded-[8px] border border-[#E5E7EB] bg-white text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366] focus:border-[#003366] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-3 bg-[#F4F6F9] rounded-[8px] border border-[#E5E7EB] text-[12px] text-[#4B5563] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#003366] shrink-0" />
              <span>Đăng nhập đúng tài khoản để tự động chuyển màn hình Lãnh đạo hoặc Nhân viên.</span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#003366] hover:bg-[#002244] text-white font-bold text-[14px] rounded-[8px] transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer tracking-wide"
            >
              <KeyRound className="w-4 h-4 text-white" />
              <span>XÁC NHẬN ĐĂNG NHẬP</span>
            </button>
          </form>

          {/* Quick Logout Button */}
          {currentUser && (
            <div className="pt-2 border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 bg-white hover:bg-red-50 hover:text-[#D32F2F] hover:border-red-200 border border-[#E5E7EB] text-[#111827] font-semibold text-[13px] rounded-[8px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-[#D32F2F]" />
                <span>Đăng Xuất Khỏi Hệ Thống</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-[#F4F6F9] px-5 py-3 border-t border-[#E5E7EB] flex items-center justify-end text-[12px] text-[#4B5563]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
