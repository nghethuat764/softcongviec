import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogoTTDVTH } from './LogoTTDVTH';
import {
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  FileCheck2,
  Building
} from 'lucide-react';

interface LoginScreenProps {
  tasksCount?: number;
  dbConnected?: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  tasksCount = 40,
  dbConnected = true,
}) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Vui lòng nhập tên tài khoản hoặc mã định danh cán bộ.');
      return;
    }

    if (!password) {
      setError('Vui lòng nhập mật khẩu công vụ.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const success = login(username, password);
      setIsSubmitting(false);

      if (!success) {
        setError(
          'Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.'
        );
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#111827] flex flex-col justify-between font-sans">
      
      {/* 1. Header Cơ Quan Nhà Nước */}
      <header className="bg-[#003366] text-white border-b border-[#002244] shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoTTDVTH className="w-10 h-10 shrink-0" />
            <div>
              <div className="text-[12px] uppercase font-semibold text-blue-200 tracking-wider">
                UBND PHƯỜNG HỐ NAI · TRUNG TÂM DỊCH VỤ TỔNG HỢP
              </div>
              <h1 className="text-[16px] sm:text-[18px] font-bold text-white tracking-wide uppercase">
                HỆ THỐNG PHÂN CÔNG NHIỆM VỤ & BÁO CÁO TIẾN ĐỘ
              </h1>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[12px] text-blue-100">
            <span className="bg-white/10 px-2.5 py-1 rounded-[4px] border border-white/20 font-medium">
              {tasksCount} nhiệm vụ giao ban
            </span>
            <span className="bg-white/10 px-2.5 py-1 rounded-[4px] border border-white/20 font-medium">
              {dbConnected ? 'Dữ liệu trực tuyến' : 'Ngoại tuyến'}
            </span>
          </div>
        </div>
      </header>

      {/* 2. Khung Đăng Nhập Trang Trọng Chuẩn Cơ Quan Nhà Nước */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-14 flex flex-col items-center justify-center">
        
        <div className="w-full max-w-md bg-white text-[#111827] rounded-[8px] shadow-sm border border-[#E5E7EB] overflow-hidden">
          
          {/* Card Title Header */}
          <div className="bg-[#F4F6F9] border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[6px] bg-[#003366] text-white flex items-center justify-center font-bold text-[14px] shrink-0">
                <KeyRound className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-[16px] font-bold text-[#111827] uppercase tracking-tight">
                  Đăng Nhập Cán Bộ
                </h2>
                <span className="text-[12px] text-[#4B5563] block">Xác thực danh tính thực thi công vụ</span>
              </div>
            </div>
            <span className="text-[12px] font-semibold px-2.5 py-1 rounded-[4px] bg-[#003366]/10 text-[#003366] border border-[#003366]/20">
              Cổng Nội Bộ
            </span>
          </div>

          {/* Form Content */}
          <div className="p-6">
            
            {error && (
              <div className="mb-4 p-3 rounded-[8px] bg-red-50 border border-red-200 text-[#D32F2F] text-[13px] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#D32F2F] shrink-0 mt-0.5" />
                <div className="leading-relaxed">{error}</div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Tên đăng nhập */}
              <div>
                <label className="block text-[13px] font-semibold text-[#111827] mb-1.5">
                  Tên tài khoản / Mã cán bộ: <span className="text-[#D32F2F]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Nhập tên đăng nhập cán bộ..."
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E5E7EB] rounded-[8px] text-[14px] text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#003366] focus:border-[#003366]"
                  />
                </div>
              </div>

              {/* Mật khẩu */}
              <div>
                <label className="block text-[13px] font-semibold text-[#111827] mb-1.5">
                  Mật khẩu: <span className="text-[#D32F2F]">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Nhập mật khẩu..."
                    className="w-full pl-9 pr-9 py-2.5 bg-white border border-[#E5E7EB] rounded-[8px] text-[14px] text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#003366] focus:border-[#003366] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Bảng Hướng Dẫn Phân Quyền */}
              <div className="p-3 bg-[#F4F6F9] rounded-[8px] border border-[#E5E7EB] text-[12px] text-[#4B5563] space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-[#111827]">
                  <FileCheck2 className="w-4 h-4 text-[#003366]" />
                  <span>Cơ chế phân hệ tự động:</span>
                </div>
                <div className="text-[#4B5563] space-y-1 pl-1">
                  <p>• <strong className="text-[#111827]">Ban Giám Đốc:</strong> Tự động mở Phân hệ Lãnh đạo (điều hành, phân công nhiệm vụ).</p>
                  <p>• <strong className="text-[#111827]">Viên chức:</strong> Tự động mở Phân hệ Nhân viên (báo cáo tiến độ chuyên môn).</p>
                </div>
              </div>

              {/* Nút Đăng Nhập Chính */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#003366] hover:bg-[#002244] text-white font-bold text-[14px] rounded-[8px] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-wider shadow-xs"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4 text-white" />
                )}
                <span>{isSubmitting ? 'ĐANG XÁC THỰC...' : 'ĐĂNG NHẬP HỆ THỐNG'}</span>
              </button>
            </form>
          </div>
        </div>

      </main>

      {/* 3. Footer Cơ Quan Nhà Nước */}
      <footer className="bg-white border-t border-[#E5E7EB] py-3.5 px-4 text-center text-[12px] text-[#4B5563]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <span className="font-medium">Ủy Ban Nhân Dân Phường Hố Nai · Trung Tâm Dịch Vụ Tổng Hợp</span>
          <span>Hệ thống chỉ đạo điều hành và quản lý tiến độ 40 nhiệm vụ giao ban</span>
        </div>
      </footer>

    </div>
  );
};
