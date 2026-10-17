import React from 'react';
import { 
  Building2, 
  RotateCcw,
  Database,
  LogOut,
  Menu,
  Paperclip,
  CheckCircle2,
  Users,
  Image as ImageIcon
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
  onOpenUserManagement?: () => void;
  onOpenDepartmentManagement?: () => void;
  onOpenBgSettings?: () => void;
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
  onResetData,
  taskCount,
  onToggleMobileMenu,
}) => {
  const { currentUser, isLeader, logout } = useAuth();

  return (
    <header className="bg-[#003366] text-white border-b border-[#002244] sticky top-0 z-40 shadow-xs font-sans">
      {/* 1. Dải Băng Thể Thức Quốc Hiệu / Cơ Quan Nhà Nước */}
      <div className="bg-[#003366] text-[#f8f8f8] px-4 sm:px-6 py-1.5 text-[12px] border-b border-[#bcb7b7]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[12px]">
            <span className="font-bold tracking-wide uppercase">UBND PHƯỜNG HỐ NAI</span>
            <span className="text-blue-200">/</span>
            <span className="uppercase text-blue-100 font-semibold">TRUNG TÂM DỊCH VỤ TỔNG HỢP</span>
          </div>

          {/* User Account Bar */}
          <div className="flex items-center gap-2 text-[12px]">
            {currentUser ? (
              <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-[6px] border border-white/20">
                <span className="text-blue-100">Cán bộ:</span>
                <span className="font-bold text-white">{currentUser.fullName}</span>
                <span className="text-blue-200 hidden sm:inline">({currentUser.position})</span>
                <span className="text-white/40">|</span>
                <span className="text-white font-medium uppercase text-[11px]">
                  {currentUser.role === 'LEADER' ? 'Lãnh đạo' : 'Viên chức'}
                </span>
                <button
                  type="button"
                  onClick={onOpenLoginModal}
                  title="Chuyển đổi tài khoản khác"
                  className="text-amber-200 hover:text-white underline ml-1 cursor-pointer font-medium"
                >
                  Đổi TK
                </button>
                <button
                  type="button"
                  onClick={logout}
                  title="Đăng xuất khỏi hệ thống"
                  className="text-white hover:bg-black/30 px-2 py-0.5 rounded-[4px] flex items-center gap-1 ml-1 cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-200" />
                  <span>Đăng xuất</span>
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

            {/* Quick utility links */}
            <div className="flex items-center gap-2 pl-2 border-l border-blue-400/30 text-[12px]">
              {onOpenAttachments && (
                <button
                  type="button"
                  onClick={onOpenAttachments}
                  className="text-blue-100 hover:text-white flex items-center gap-1.5 cursor-pointer px-1.5 py-0.5 rounded hover:bg-white/10"
                  title="Xem và tải các file/hồ sơ đính kèm"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">File đính kèm</span>
                </button>
              )}
              <button
                type="button"
                onClick={onOpenNotice}
                className="text-blue-100 hover:text-white flex items-center gap-1.5 cursor-pointer px-1.5 py-0.5 rounded hover:bg-white/10"
                title="Xem văn bản kết luận giao ban"
              >
                <span className="hidden sm:inline">Văn bản kết luận</span>
              </button>
              <button
                type="button"
                onClick={onOpenDatabaseSchema}
                className="text-blue-100 hover:text-white flex items-center gap-1.5 cursor-pointer px-1.5 py-0.5 rounded hover:bg-white/10"
                title="Xem cấu trúc Database & Lược đồ DDL SQL"
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">CSDL</span>
              </button>
              {onOpenUserManagement && isLeader && (
                <button
                  type="button"
                  onClick={onOpenUserManagement}
                  className="text-blue-100 hover:text-white flex items-center gap-1.5 cursor-pointer px-1.5 py-0.5 rounded hover:bg-white/10"
                  title="Quản lý người dùng & phân quyền hệ thống"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Quản lý người dùng</span>
                </button>
              )}
              {onOpenDepartmentManagement && isLeader && (
                <button
                  type="button"
                  onClick={onOpenDepartmentManagement}
                  className="text-blue-100 hover:text-white flex items-center gap-1.5 cursor-pointer px-1.5 py-0.5 rounded hover:bg-white/10"
                  title="Quản lý phòng ban, tổ chuyên môn & cơ cấu tổ chức"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Quản lý phòng ban</span>
                </button>
              )}
              {onOpenBgSettings && (
                <button
                  type="button"
                  onClick={onOpenBgSettings}
                  className="text-blue-100 hover:text-white flex items-center gap-1.5 cursor-pointer px-1.5 py-0.5 rounded hover:bg-white/10"
                  title="Cài đặt và thay đổi hình nền cho trang quản lý"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Hình nền</span>
                </button>
              )}
              <button
                type="button"
                onClick={onResetData}
                className="text-blue-200 hover:text-white cursor-pointer p-1 rounded hover:bg-white/10"
                title="Khôi phục lại dữ liệu nguyên bản"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar: Brand & Module Heading */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3.5">
            <LogoTTDVTH className="w-11 h-11 shrink-0" />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-[18px] sm:text-[20px] font-bold tracking-tight text-white leading-tight">
                  HỆ THỐNG PHÂN CÔNG NHIỆM VỤ & BÁO CÁO TIẾN ĐỘ
                </h1>
                <span className="bg-white/15 text-white text-[12px] px-2.5 py-0.5 rounded-[6px] font-mono font-medium border border-white/20">
                  {taskCount} việc
                </span>
              </div>
              <p className="text-[13px] text-blue-100 mt-1">
                Cơ chế 2 chiều: Ban Giám đốc chỉ đạo điều hành ↔ Viên chức báo cáo tiến độ chuyên môn
              </p>
            </div>
          </div>

          {/* Phía Phải Header: Chỉ báo phân hệ hiện tại & Nút mở menu trên Mobile */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-white/10 border border-white/15 text-[13px]">
              <CheckCircle2 className="w-4 h-4 text-blue-200" />
              <span className="text-white font-medium">
                {currentRole === 'leader' ? 'Phân hệ: Lãnh đạo (Ban Giám đốc)' : `Phân hệ: Viên chức (${selectedStaff.name})`}
              </span>
            </div>

            {onToggleMobileMenu && (
              <button
                type="button"
                onClick={onToggleMobileMenu}
                className="lg:hidden px-3 py-1.5 rounded-[8px] bg-white/15 hover:bg-white/25 text-white flex items-center gap-1.5 text-[13px] font-medium cursor-pointer"
              >
                <Menu className="w-4 h-4" />
                <span>Menu</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 3. Dải Chỉ Báo Thẩm Quyền (Trang Nhã, Gọn Gàng) */}
      <div className="bg-[#FFFFFF] text-[#111827] px-4 sm:px-6 py-2 text-[13px] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2 text-[13px]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[#4B5563] uppercase tracking-wider text-[12px]">CẤU TRÚC ĐIỀU HÀNH:</span>
            <span className="text-[#4B5563]">Hệ thống Chỉ đạo & Báo cáo</span>
            <span className="text-gray-300">/</span>
            <span className="font-bold text-[#003366] uppercase">
              {currentRole === 'leader' ? 'Phân Hệ Lãnh Đạo (Ban Giám Đốc)' : 'Phân Hệ Viên Chức (Báo Cáo Tiến Độ)'}
            </span>
            <span className="text-[#4B5563] hidden md:inline text-[13px]">
              {currentRole === 'leader' 
                ? '— Quyền hạn: Phân công nhiệm vụ, phát lệnh chỉ đạo, đôn đốc tiến độ'
                : `— Tác nghiệp: Cán bộ ${selectedStaff.name} báo cáo tiến độ, khó khăn & tiếp thu chỉ đạo`}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[#4B5563]">
            <span>Phiên làm việc:</span>
            <span className="font-semibold text-[#111827]">
              {currentUser?.fullName} ({currentUser?.role === 'LEADER' ? 'Lãnh đạo' : 'Viên chức'})
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
