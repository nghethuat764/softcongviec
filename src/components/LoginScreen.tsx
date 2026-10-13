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
  ShieldCheck,
  Building2
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
    <div className="min-h-screen bg-linear-to-b from-[#072146] via-[#0b3366] to-[#072146] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-red-800 selection:text-white">
      {/* Background Decorative Grid and Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[46rem] h-96 bg-blue-500/15 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-red-600/10 blur-3xl rounded-full pointer-events-none" />

      {/* Top Government Branding Ribbon */}
      <header className="relative z-10 bg-[#061d3c]/90 border-b border-[#0d3b73] backdrop-blur-md px-4 sm:px-8 py-3 shadow-lg">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="p-0.5 bg-white/10 rounded-full shadow-inner ring-1 ring-white/20">
              <LogoTTDVTH className="w-11 h-11 hover:scale-105 transition-transform" />
            </div>
            <div>
              <div className="text-2xs font-mono uppercase tracking-widest text-amber-300 font-extrabold flex items-center gap-1.5 drop-shadow-xs">
                <Building2 className="w-3.5 h-3.5 text-amber-300 inline" />
                <span>UBND PHƯỜNG HỐ NAI</span>
                <span className="text-blue-300">·</span>
                <span className="text-blue-100">TỈNH ĐỒNG NAI</span>
              </div>
              <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight uppercase drop-shadow-xs">
                TRUNG TÂM DỊCH VỤ TỔNG HỢP
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#08274f] border border-blue-400/30 text-2xs text-blue-100 shadow-xs">
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cloud Firestore:</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-emerald-300 font-mono">
                {dbConnected ? 'Đồng bộ trực tuyến' : 'Ngoại tuyến'}
              </span>
            </span>
            <span className="hidden md:inline-flex px-3 py-1 rounded-full bg-[#7a1212] border border-amber-400/40 text-2xs text-amber-200 font-bold shadow-xs">
              {tasksCount} nhiệm vụ giao ban
            </span>
          </div>
        </div>
      </header>

      {/* Main Login Center Area */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center justify-center">
        
        {/* Title & Portal Badge */}
        <div className="text-center max-w-xl mb-6 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#7a1212]/90 border border-amber-400/40 text-amber-200 text-xs font-bold shadow-md">
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>HỆ THỐNG ĐIỀU HÀNH & BÁO CÁO CÔNG VỤ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            Cổng Đăng Nhập Tác Nghiệp
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            Vui lòng điền tài khoản và mật khẩu được cấp để truy cập vào hệ thống.
            Hệ thống tự động điều hướng đúng phân hệ chức năng theo phân quyền công vụ.
          </p>
        </div>

        {/* Centered Dignified Login Card (Bright, crisp white card with authoritative styling) */}
        <div className="w-full max-w-md mx-auto bg-white text-slate-800 rounded-3xl p-7 sm:p-9 shadow-2xl border-2 border-blue-100 relative">
          
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#0a2f5c] to-[#0d3b73] text-white flex items-center justify-center shadow-md">
                <KeyRound className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#0a2f5c] text-sm">Xác Thực Danh Tính Cán Bộ</h3>
                <span className="text-3xs text-slate-500 font-medium">Bảo mật phân quyền RBAC</span>
              </div>
            </div>
            <span className="text-3xs font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
              PORTAL v2.5
            </span>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 shadow-xs animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Tên đăng nhập / Mã định danh:</span>
                <span className="text-3xs text-red-600 font-semibold font-mono">* Bắt buộc</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Nhập tên tài khoản cán bộ..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-all font-sans"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Mật khẩu:</span>
                <span className="text-3xs text-red-600 font-semibold font-mono">* Bắt buộc</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Nhập mật khẩu công vụ..."
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role Notice */}
            <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200/80 text-2xs text-slate-700 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#0a2f5c]">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Quy định phân quyền hiển thị màn hình:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                <li><strong className="text-red-700">Cấp lãnh đạo:</strong> Tự động hiển thị màn hình Lãnh Đạo (giao việc, điều hành).</li>
                <li><strong className="text-blue-700">Cấp nhân viên:</strong> Tự động hiển thị màn hình Nhân Viên (báo cáo tiến độ).</li>
              </ul>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-linear-to-r from-[#0a2f5c] via-[#0d3b73] to-[#0a2f5c] hover:from-[#08264a] hover:to-[#0a305e] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-950/30 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-wider mt-2"
            >
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4 text-amber-300" />
              )}
              <span>{isSubmitting ? 'Đang xác thực...' : 'ĐĂNG NHẬP HỆ THỐNG'}</span>
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 text-3xs text-slate-500 flex items-center justify-between">
            <span className="font-medium">Hệ thống bảo mật xác thực công vụ</span>
            <span className="font-mono text-slate-600 font-bold">SSL / TLS 256-bit</span>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-[#051a38] border-t border-[#0d3261] py-3.5 px-4 text-center text-2xs text-blue-200/80">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Hệ Thống Phân Công Nhiệm Vụ & Báo Cáo Tiến Độ Chuyên Môn · TTDVTH Phường Hố Nai</span>
          <span>Cơ sở dữ liệu đám mây Google Cloud Firestore</span>
        </div>
      </footer>

    </div>
  );
};
