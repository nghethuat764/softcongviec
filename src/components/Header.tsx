import React from 'react';
import { 
  Building2, 
  RotateCcw,
  Database,
  LogOut,
  Menu,
  Paperclip,
  CheckCircle2
} from 'lucide-react';
import { StaffMember } from '../types';
import { useAuth } from '../context/AuthContext';
import { LogoTTDVTH } from './LogoTTDVTH';

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
  onResetData,
  taskCount,
  onToggleMobileMenu,
}) => {
  const { currentUser, isLeader, logout } = useAuth();

  return (
    <header className="bg-[#153e6b] text-white border-b border-[#0f2f52] sticky top-0 z-40 shadow-xs font-sans">
      {/* 1. Dải Băng Thể Thức Quốc Hiệu / Cơ Quan Nhà Nước */}
      <div className="bg-[#224270] text-[#f8f8f8] px-4 sm:px-6 py-1 text-xs border-b border-[#bcb7b7]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-2xs sm:text-xs">
            <span className="font-bold tracking-wide uppercase">UBND PHƯỜNG HỐ NAI</span>
            <span className="text-red-300">/</span>
            <span className="uppercase text-red-100 font-semibold">TRUNG TÂM DỊCH VỤ TỔNG HỢP</span>
          </div>

          {/* User Account Bar */}
          <div className="flex items-center gap-2 text-2xs">
            {currentUser ? (
              <div className="flex items-center gap-2 bg-black/20 px-2.5 py-0.5 rounded border border-white/20">
                <span className="text-red-100">Cán bộ:</span>
                <span className="font-bold text-white">{currentUser.fullName}</span>
                <span className="text-red-200 hidden sm:inline">({currentUser.position})</span>
                <span className="text-white/40">|</span>
                <span className="text-white font-medium uppercase text-3xs">
                  {currentUser.role === 'LEADER' ? 'Lãnh đạo' : 'Viên chức'}
                </span>
                <button
                  type="button"
                  onClick={onOpenLoginModal}
                  title="Chuyển đổi tài khoản khác"
                  className="text-amber-200 hover:text-white underline ml-1 cursor-pointer"
                >
                  Đổi TK
                </button>
                <button
                  type="button"
                  onClick={logout}
                  title="Đăng xuất khỏi hệ thống"
                  className="text-white hover:bg-black/30 px-1.5 py-0.5 rounded flex items-center gap-1 ml-1 cursor-pointer transition-colors"
                >
                  <LogOut className="w-3 h-3 text-red-200" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLoginModal}
                className="px-2.5 py-0.5 rounded bg-white text-[#8b1818] font-bold text-2xs cursor-pointer hover:bg-red-50"
              >
                Đăng Nhập
              </button>
            )}

            {/* Quick utility links */}
            <div className="flex items-center gap-2 pl-2 border-l border-red-900/60 text-2xs">
              {onOpenAttachments && (
                <button
                  type="button"
                  onClick={onOpenAttachments}
                  className="text-red-100 hover:text-white flex items-center gap-1 cursor-pointer"
                  title="Xem và tải các file/hồ sơ đính kèm"
                >
                  <Paperclip className="w-3 h-3" />
                  <span className="hidden sm:inline">File đính kèm</span>
                </button>
              )}
              <button
                type="button"
                onClick={onOpenNotice}
                className="text-red-100 hover:text-white flex items-center gap-1 cursor-pointer"
                title="Xem toàn văn văn bản kết luận 28/9"
              >
                <span className="hidden sm:inline">Văn bản 28/9</span>
              </button>
              <button
                type="button"
                onClick={onOpenDatabaseSchema}
                className="text-red-100 hover:text-white flex items-center gap-1 cursor-pointer"
                title="Xem cấu trúc Database & Lược đồ DDL SQL"
              >
                <Database className="w-3 h-3" />
                <span className="hidden sm:inline">CSDL</span>
              </button>
              <button
                type="button"
                onClick={onResetData}
                className="text-red-200 hover:text-white cursor-pointer"
                title="Khôi phục lại dữ liệu nguyên bản từ văn bản kết luận 28/9"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar: Brand & Module Heading */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-3">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <LogoTTDVTH className="w-11 h-11 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold tracking-tight text-white leading-tight">
                  HỆ THỐNG PHÂN CÔNG NHIỆM VỤ & BÁO CÁO TIẾN ĐỘ
                </h1>
                <span className="bg-white/10 text-white text-xs px-2 py-0.5 rounded font-mono font-medium">
                  {taskCount} việc
                </span>
              </div>
              <p className="text-2xs sm:text-xs text-blue-100 mt-0.5">
                Cơ chế 2 chiều: Ban Giám đốc chỉ đạo điều hành ↔ Viên chức báo cáo tiến độ chuyên môn
              </p>
            </div>
          </div>

          {/* Phía Phải Header: Chỉ báo phân hệ hiện tại & Nút mở menu trên Mobile */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded bg-white/10 border border-white/15 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-200" />
              <span className="text-blue-100">
                {currentRole === 'leader' ? 'Phân hệ: Lãnh đạo (Ban Giám đốc)' : `Phân hệ: Viên chức (${selectedStaff.name})`}
              </span>
            </div>

            {onToggleMobileMenu && (
              <button
                type="button"
                onClick={onToggleMobileMenu}
                className="lg:hidden px-2.5 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              >
                <Menu className="w-4 h-4" />
                <span>Menu</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 3. Dải Chỉ Báo Thẩm Quyền (Trang Nhã, Gọn Gàng) */}
      <div className="bg-[#eef2f6] text-slate-700 px-4 sm:px-6 py-1.5 text-xs border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2 text-2xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-500 uppercase tracking-wider">CẤU TRÚC ĐIỀU HÀNH:</span>
            <span className="text-slate-600">Hệ thống Chỉ đạo & Báo cáo</span>
            <span className="text-slate-400">/</span>
            <span className="font-bold text-[#153e6b] uppercase">
              {currentRole === 'leader' ? 'Phân Hệ Lãnh Đạo (Ban Giám Đốc)' : 'Phân Hệ Viên Chức (Báo Cáo Tiến Độ)'}
            </span>
            <span className="text-slate-500 hidden md:inline">
              {currentRole === 'leader' 
                ? '— Quyền hạn: Phân công nhiệm vụ, phát lệnh chỉ đạo, giám sát 40 việc giao ban'
                : `— Tác nghiệp: Cán bộ ${selectedStaff.name} báo cáo tiến độ, khó khăn & tiếp thu chỉ đạo`}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600">
            <span>Trạng thái phiên làm việc:</span>
            <span className="font-semibold text-slate-900">
              {currentUser?.fullName} ({currentUser?.role === 'LEADER' ? 'Lãnh đạo' : 'Nhân viên'})
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
