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
  Cloud,
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
      setError('Vui lòng nhập mật khẩu (mật khẩu mặc định: 123456).');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const success = login(username, password);
      setIsSubmitting(false);

      if (!success) {
        setError(
          'Tên đăng nhập hoặc mật khẩu không chính xác. Mật khẩu mặc định hệ thống là: 123456. Vui lòng kiểm tra lại.'
        );
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-red-900 selection:text-white">
      {/* Background Decorative Grid and Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[42rem] h-80 bg-red-900/15 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-blue-900/10 blur-3xl rounded-full pointer-events-none" />

      {/* Top Government Branding Ribbon */}
      <header className="relative z-10 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-md">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <LogoTTDVTH className="w-11 h-11 hover:scale-105 transition-transform" />
            <div>
              <div className="text-2xs font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                <span>UBND PHƯỜNG HỐ NAI</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-300">TỈNH ĐỒNG NAI</span>
              </div>
              <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight uppercase">
                TRUNG TÂM DỊCH VỤ TỔNG HỢP
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700/80 text-2xs text-slate-300">
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cloud Firestore:</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-emerald-300 font-mono">
                {dbConnected ? 'Đồng bộ trực tuyến' : 'Ngoại tuyến'}
              </span>
            </span>
            <span className="hidden md:inline-flex px-2.5 py-1 rounded-full bg-red-950/70 border border-red-800/80 text-2xs text-red-200 font-bold">
              {tasksCount} nhiệm vụ giao ban
            </span>
          </div>
        </div>
      </header>

      {/* Main Login Center Area */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center justify-center">
        
        {/* Title & Portal Badge */}
        <div className="text-center max-w-xl mb-6 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-700/60 text-red-200 text-xs font-semibold shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
            <span>HỆ THỐNG ĐIỀU HÀNH & BÁO CÁO CÔNG VỤ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Đăng Nhập Cổng Tác Nghiệp
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Vui lòng điền tên tài khoản và mật khẩu được cấp để truy cập vào hệ thống.
            Hệ thống tự động điều hướng đúng phân quyền công vụ.
          </p>
        </div>

        {/* Centered Login Form Card */}
        <div className="w-full max-w-md mx-auto bg-slate-900/95 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <KeyRound className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Xác Thực Danh Tính Cán Bộ</h3>
                <span className="text-3xs text-slate-400">Bảo mật phân quyền RBAC</span>
              </div>
            </div>
            <span className="text-3xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              PORTAL v2.5
            </span>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Tên đăng nhập / Mã định danh:</span>
                <span className="text-3xs text-slate-500 font-mono">Bắt buộc</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Nhập tên tài khoản..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-750 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all font-sans"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Mật khẩu:</span>
                <span className="text-3xs text-slate-500 font-mono">Bắt buộc</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Nhập mật khẩu công vụ..."
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-750 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role Notice */}
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-2xs text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Quy định phân quyền hiển thị màn hình:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400 pl-1">
                <li><strong className="text-red-300">Cấp lãnh đạo:</strong> Hiển thị màn hình Lãnh Đạo (giao việc mới, điều hành).</li>
                <li><strong className="text-blue-300">Cấp nhân viên:</strong> Hiển thị màn hình Nhân Viên (báo cáo tiến độ).</li>
              </ul>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-950/60 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-wider mt-2"
            >
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4 text-amber-300" />
              )}
              <span>{isSubmitting ? 'Đang xác thực...' : 'ĐĂNG NHẬP HỆ THỐNG'}</span>
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-800/80 text-2xs text-slate-500 flex items-center justify-between">
            <span>Hệ thống bảo mật xác thực công vụ</span>
            <span className="font-mono text-slate-400">SSL / TLS 256-bit</span>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-900 border-t border-slate-800/90 py-3 px-4 text-center text-2xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Hệ Thống Phân Công Nhiệm Vụ & Báo Cáo Tiến Độ Chuyên Môn · TTDVTH Phường Hố Nai</span>
          <span>Cơ sở dữ liệu đám mây Google Cloud Firestore</span>
        </div>
      </footer>

    </div>
  );
};
