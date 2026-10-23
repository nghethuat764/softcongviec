import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogoTTDVTH } from './LogoTTDVTH';
import { DynamicGovCanvas } from './DynamicGovCanvas';
import { CountUpNumber } from './CountUpNumber';
import {
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  FileCheck2,
  ShieldCheck
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
  const { isDark } = useTheme();
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
    <div className={`relative min-h-screen text-[#111827] dark:text-slate-100 flex flex-col justify-between font-sans overflow-hidden select-none transition-colors duration-200 ${isDark ? 'dark bg-[#081021]' : 'bg-slate-50'}`}>
      
      {/* Dynamic Animated Canvas Background */}
      <DynamicGovCanvas />

      {/* 1. Header Cơ Quan Nhà Nước */}
      <header className="relative z-10 bg-[#003366]/95 dark:bg-[#061122]/95 backdrop-blur-md text-white border-b border-white/10 dark:border-white/5 shadow-sm transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoTTDVTH className="w-10 h-10 shrink-0" />
            <div>
              <div className="text-[12px] uppercase font-semibold text-blue-200 dark:text-sky-300 tracking-wider">
                UBND PHƯỜNG HỐ NAI · TRUNG TÂM DỊCH VỤ TỔNG HỢP
              </div>
              <h1 className="text-[16px] sm:text-[18px] font-bold text-white tracking-wide uppercase">
                HỆ THỐNG PHÂN CÔNG NHIỆM VỤ & BÁO CÁO TIẾN ĐỘ
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[12px] text-blue-100 dark:text-sky-200">
            <span className="bg-white/15 px-2.5 py-1 rounded-[4px] border border-white/20 font-medium">
              <CountUpNumber value={tasksCount} suffix=" nhiệm vụ giao ban" />
            </span>
            <span className="bg-white/15 px-2.5 py-1 rounded-[4px] border border-white/20 font-medium">
              {dbConnected ? 'Dữ liệu trực tuyến' : 'Ngoại tuyến'}
            </span>
          </div>
        </div>
      </header>

      {/* 2. Khung Đăng Nhập Trang Trọng Đặt Giữa Canvas */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center">
        
        <div className="w-full max-w-md bg-white dark:bg-[#131c31] text-[#111827] dark:text-slate-100 rounded-[8px] shadow-2xl border border-white/40 dark:border-slate-700/60 overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200 transition-colors">
          
          {/* Card Title Header */}
          <div className="bg-[#F4F6F9] dark:bg-[#0d1527] border-b border-[#E5E7EB] dark:border-[#1e293b] px-6 py-4 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[6px] bg-[#003366] dark:bg-sky-600 text-white flex items-center justify-center font-bold text-[14px] shrink-0">
                <KeyRound className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-[16px] font-bold text-[#111827] dark:text-slate-100 uppercase tracking-tight">
                  Đăng Nhập Cán Bộ
                </h2>
                <span className="text-[12px] text-[#4B5563] dark:text-slate-400 block">Xác thực danh tính thực thi công vụ</span>
              </div>
            </div>
            <span className="text-[12px] font-semibold px-2.5 py-1 rounded-[4px] bg-[#003366]/10 dark:bg-sky-400/10 text-[#003366] dark:text-sky-300 border border-[#003366]/20 dark:border-sky-400/20">
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

              {/* Truy Cập Nhanh Trực Tiếp Vào Dashboard */}
              <div className="pt-3 border-t border-[#E5E7EB] dark:border-slate-700/60 text-center">
                <span className="text-[11px] font-semibold text-[#6B7280] dark:text-slate-400 block mb-2">
                  Hoặc chọn đăng nhập nhanh để kiểm tra Dashboard:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => login('phong.giamdoc', '123456')}
                    className="px-2 py-1.5 rounded-[6px] bg-red-50 hover:bg-red-100 text-[#D32F2F] text-[12px] font-bold border border-red-200 transition-colors cursor-pointer"
                  >
                    Ban Giám Đốc
                  </button>
                  <button
                    type="button"
                    onClick={() => login('cuong.dvci', '123456')}
                    className="px-2 py-1.5 rounded-[6px] bg-blue-50 hover:bg-blue-100 text-[#003366] text-[12px] font-bold border border-blue-200 transition-colors cursor-pointer"
                  >
                    Viên Chức
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

      </main>


    </div>
  );
};
