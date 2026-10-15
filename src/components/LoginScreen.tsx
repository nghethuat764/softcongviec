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
  Building2,
  FileCheck2
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
      setError('Vui lòng nhập mật khẩu.');
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
    <div className="min-h-screen bg-[#0f294a] text-slate-100 flex flex-col justify-between font-sans">
      
      {/* 1. Dải Băng Quốc Hiệu & Cơ Quan Nhà Nước Chuẩn Thể Thức */}
      <header className="bg-[#8b1818] border-b border-[#731313] px-4 sm:px-8 py-2 text-white">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider">UBND PHƯỜNG HỐ NAI</span>
            <span className="text-red-200">/</span>
            <span className="uppercase text-red-100 font-medium">TRUNG TÂM DỊCH VỤ TỔNG HỢP</span>
          </div>
        </div>
      </header>

      {/* 2. Sub-header Hệ Thống */}
      <div className="bg-[#153e6b] border-b border-[#0f2f52] px-4 sm:px-8 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoTTDVTH className="w-10 h-10 shrink-0" />
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-wide uppercase">
                HỆ THỐNG PHÂN CÔNG NHIỆM VỤ & BÁO CÁO TIẾN ĐỘ
              </h1>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-2xs text-blue-200">
            <span className="bg-white/10 px-2 py-0.5 rounded border border-white/15">
              {tasksCount} nhiệm vụ giao ban
            </span>
            <span className="bg-white/10 px-2 py-0.5 rounded border border-white/15">
              {dbConnected ? 'Dữ liệu trực tuyến' : 'Ngoại tuyến'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Khung Đăng Nhập Trang Trọng Chuẩn Cơ Quan Nhà Nước */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center">
        
        <div className="w-full max-w-md bg-white text-slate-800 rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          
          {/* Card Top Title Header */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-[#153e6b] text-white flex items-center justify-center font-bold text-sm">
                <KeyRound className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                  Đăng Nhập Cán Bộ
                </h2>
                <span className="text-3xs text-slate-500">Xác thực danh tính thực thi công vụ</span>
              </div>
            </div>
            <span className="text-3xs font-semibold px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
              Cổng Nội Bộ
            </span>
          </div>

          {/* Form Content */}
          <div className="p-6">
            
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{error}</div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Tên đăng nhập */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên tài khoản / Mã cán bộ: <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Nhập tên đăng nhập cán bộ..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#153e6b] focus:border-[#153e6b]"
                  />
                </div>
              </div>

              {/* Mật khẩu */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật khẩu: <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Nhập mật khẩu..."
                    className="w-full pl-9 pr-9 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#153e6b] focus:border-[#153e6b] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Bảng Hướng Dẫn Phân Quyền */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-2xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <FileCheck2 className="w-3.5 h-3.5 text-[#153e6b]" />
                  <span>Cơ chế phân hệ tự động:</span>
                </div>
                <div className="text-slate-600 space-y-0.5 pl-1">
                  <p>• <strong>Ban Giám Đốc:</strong> Tự động mở Phân hệ Lãnh đạo (điều hành, phân công việc).</p>
                  <p>• <strong>Viên chức:</strong> Tự động mở Phân hệ Nhân viên (báo cáo tiến độ chuyên môn).</p>
                </div>
              </div>

              {/* Nút Đăng Nhập Chính */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#153e6b] hover:bg-[#103257] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4 text-white" />
                )}
                <span>{isSubmitting ? 'Đang xác thực...' : 'ĐĂNG NHẬP HỆ THỐNG'}</span>
              </button>
            </form>
          </div>
        </div>

      </main>

      {/* 4. Footer Cơ Quan Nhà Nước */}
      <footer className="bg-[#0b213b] border-t border-[#123157] py-3 px-4 text-center text-2xs text-slate-400">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
          <span>Ủy Ban Nhân Dân Phường Hố Nai · Trung Tâm Dịch Vụ Tổng Hợp</span>
          <span>Hệ thống chỉ đạo điều hành và quản lý tiến độ 40 nhiệm vụ giao ban</span>
        </div>
      </footer>

    </div>
  );
};
