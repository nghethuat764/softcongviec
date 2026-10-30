import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  RotateCcw,
  Database,
  LogOut,
  Menu,
  Paperclip,
  CheckCircle2,
  Users,
  Image as ImageIcon,
  Clock,
  Smartphone
} from 'lucide-react';
import { StaffMember } from '../types';
import { useAuth } from '../context/AuthContext';
import { LogoTTDVTH } from './LogoTTDVTH';
import { CountUpNumber } from './CountUpNumber';

interface HeaderProps {
  currentRole: 'leader' | 'staff';
  onRoleChange: (role: 'leader' | 'staff') => void;
  selectedStaff: StaffMember;
  onStaffChange: (staff: StaffMember) => void;
  onOpenNotice: () => void;
  onOpenNewTask: () => void;
  onOpenDatabaseSchema: () => void;
  onOpenLoginModal: () => void;
  onOpenAttachments?: () => void;
  onOpenUserManagement?: () => void;
  onOpenDepartmentManagement?: () => void;
  onOpenBgSettings?: () => void;
  onOpenMobileMockup?: () => void;
  onResetData: () => void;
  taskCount: number;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  selectedStaff,
  onOpenNotice,
  onOpenDatabaseSchema,
  onOpenLoginModal,
  onOpenAttachments,
  onOpenUserManagement,
  onOpenDepartmentManagement,
  onOpenBgSettings,
  onOpenMobileMockup,
  onResetData,
  taskCount,
  onToggleMobileMenu,
}) => {
  const { currentUser, isLeader, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTimeClock = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <header className="bg-[#003366] dark:bg-[#071324] text-white border-b border-[#002244] dark:border-[#1e293b] sticky top-0 z-40 shadow-xs font-sans transition-colors duration-200">
      {/* 1. Dải Băng Thể Thức Quốc Hiệu / Cơ Quan Nhà Nước */}
      <div className="bg-[#003366] dark:bg-[#050e1a] text-[#f8f8f8] px-4 sm:px-6 py-1.5 text-[12px] border-b border-[#bcb7b7]/40 dark:border-[#1e293b] transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[12px]">
            <span className="font-bold tracking-wide uppercase">UBND PHƯỜNG HỐ NAI</span>
            <span className="text-blue-200 dark:text-sky-400">/</span>
            <span className="uppercase text-blue-100 dark:text-sky-200 font-semibold">TRUNG TÂM DỊCH VỤ TỔNG HỢP</span>
          </div>

          {/* User Account Bar & Quick Actions */}
          <div className="flex items-center gap-2 text-[12px]">
            {currentUser ? (
              <div className="flex items-center gap-2 bg-black/25 dark:bg-white/10 px-2.5 py-1 rounded-[6px] border border-white/20">
                <div className="w-5 h-5 rounded-full bg-blue-400 dark:bg-sky-400 text-[#003366] text-[10px] font-black flex items-center justify-center shrink-0">
                  {currentUser.fullName.split(' ').slice(-1)[0][0] || 'CB'}
                </div>
                <span className="font-semibold text-white truncate max-w-[140px] sm:max-w-none">{currentUser.fullName}</span>
                <span className="text-blue-200 dark:text-sky-200 hidden md:inline text-[11px]">({currentUser.position})</span>
                <div className="hidden sm:flex items-center gap-1 text-amber-300 dark:text-amber-200 font-mono text-[11px] font-bold bg-black/30 px-2 py-0.5 rounded border border-amber-300/30 shrink-0 shadow-2xs">
                  <Clock className="w-3 h-3 text-amber-300 shrink-0" />
                  <span>{formatDateTimeClock(currentTime)}</span>
                </div>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                  currentUser.role === 'LEADER' ? 'bg-red-500/30 text-red-200 border border-red-400/30' : 'bg-blue-400/25 text-blue-200 border border-blue-300/30'
                }`}>
                  {currentUser.role === 'LEADER' ? 'Lãnh đạo' : 'Viên chức'}
                </span>
                <button
                  type="button"
                  onClick={onOpenLoginModal}
                  title="Chuyển đổi tài khoản làm việc khác"
                  className="text-amber-300 hover:text-white underline ml-1 cursor-pointer font-medium text-[11px]"
                >
                  Đổi TK
                </button>
                <button
                  type="button"
                  onClick={logout}
                  title="Đăng xuất khỏi hệ thống"
                  className="text-blue-200 dark:text-sky-200 hover:text-white hover:bg-white/10 px-1.5 py-0.5 rounded flex items-center gap-1 ml-0.5 cursor-pointer transition-colors text-[11px]"
                >
                  <LogOut className="w-3 h-3 text-red-300" />
                  <span className="hidden sm:inline">Thoát</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLoginModal}
                className="px-3 py-1 rounded-[6px] bg-white text-[#003366] font-bold text-[12px] cursor-pointer hover:bg-blue-50"
              >
                Đăng Nhập
              </button>
            )}

            {/* Quick reset button (hidden on mobile) */}
            <div className="hidden sm:flex items-center pl-1.5 border-l border-blue-400/30 dark:border-sky-400/20">
              <button
                type="button"
                onClick={onResetData}
                className="text-blue-200 dark:text-sky-200 hover:text-white cursor-pointer p-1 rounded hover:bg-white/10 transition-colors"
                title="Khôi phục dữ liệu gốc từ thông báo giao ban"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar: Brand & Module Heading */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <LogoTTDVTH className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 filter drop-shadow-xs" />
            <div>
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                <h1 className="text-[13px] sm:text-[19px] font-bold tracking-tight text-yellow-300 sm:text-white leading-snug sm:leading-tight">
                  HỆ THỐNG PHÂN CÔNG NHIỆM VỤ & VÀ BÁO CÁO TIẾN ĐỘ
                </h1>
                <span className="bg-white/15 text-white text-[11px] sm:text-[12px] px-1.5 sm:px-2 py-0.5 rounded-[4px] font-mono font-bold border border-white/20">
                  <CountUpNumber value={taskCount} suffix=" việc" />
                </span>
              </div>
              <p className="hidden sm:block text-[12px] sm:text-[13px] text-blue-100 dark:text-sky-200 mt-0.5 leading-snug">
                Ủy ban nhân dân phường Hố Nai · Trung tâm Dịch vụ Tổng hợp
              </p>
            </div>
          </div>

          {/* Phía Phải Header: Nút Mô Phỏng App Mobile & Chỉ báo phân hệ */}
          <div className="flex items-center gap-2">
            {onOpenMobileMockup && (
              <button
                type="button"
                onClick={onOpenMobileMockup}
                className="px-3 py-1.5 rounded-[6px] bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[12px] sm:text-[13px] flex items-center gap-1.5 shadow-sm border border-amber-300/60 cursor-pointer active:scale-95 transition-all"
                title="Mở giao diện mô phỏng ứng dụng di động Native (iOS/Android)"
              >
                <Smartphone className="w-4 h-4 text-slate-950" />
                <span>MOCKUP APP MOBILE</span>
              </button>
            )}

            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-[6px] border text-[13px] ${
              currentRole === 'leader'
                ? 'bg-amber-400/15 border-amber-300/30 text-amber-200'
                : 'bg-white/10 border-white/20 text-white'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-200 dark:text-sky-300" />
              <span className="font-semibold text-white">
                {currentRole === 'leader' ? 'Phân hệ: Ban Giám Đốc' : `Phân hệ: Viên Chức (${selectedStaff.name})`}
              </span>
            </div>

            {onToggleMobileMenu && (
              <button
                type="button"
                onClick={onToggleMobileMenu}
                className="lg:hidden px-3 py-1.5 rounded-[6px] bg-white/15 hover:bg-white/25 text-white flex items-center gap-1.5 text-[13px] font-medium cursor-pointer transition-colors"
              >
                <Menu className="w-4 h-4" />
                <span>Menu</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
