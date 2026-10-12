import React from 'react';
import { 
  Building2, 
  UserCheck, 
  FileText, 
  PlusCircle, 
  RotateCcw,
  ShieldCheck, 
  Database,
  LogIn,
  LogOut,
  Lock,
  User, 
  ArrowRight, 
  Shield, 
  Briefcase,
  Menu
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
  onResetData: () => void;
  taskCount: number;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  selectedStaff,
  onOpenNotice,
  onOpenNewTask,
  onOpenDatabaseSchema,
  onOpenLoginModal,
  onResetData,
  taskCount,
  onToggleMobileMenu,
}) => {
  const { currentUser, isLeader, logout } = useAuth();

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      {/* 1. Dải Băng Thể Thức Cơ Quan Nhà Nước */}
      <div className="bg-red-950 text-red-100 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-red-900/60">
        <div className="flex items-center gap-2 font-medium">
          <Building2 className="w-4 h-4 text-amber-400 inline-block" />
          <span className="font-bold tracking-wide uppercase">UBND PHƯỜNG HỐ NAI</span>
          <span className="text-red-400">/</span>
          <span className="uppercase text-red-200">TRUNG TÂM DỊCH VỤ TỔNG HỢP</span>
          <span className="text-red-500 hidden lg:inline">|</span>
          <span className="text-2xs text-red-300 hidden lg:inline">
            Theo dõi Thông báo Kết luận giao ban tuần ngày 28/9/2026 (Chủ trì: Đ/c Phạm Thanh Phong – Giám đốc)
          </span>
        </div>

        {/* User Account Capsule & Logout */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-red-900/80 px-2.5 py-0.5 rounded-full text-2xs border border-red-800">
              <span className={`w-2 h-2 rounded-full ${currentUser.isLeader ? 'bg-amber-400 animate-pulse' : 'bg-blue-300'}`} />
              <span className="font-semibold">{currentUser.fullName}</span>
              <span className="text-red-300 hidden sm:inline">({currentUser.position})</span>
              <span className={`px-1.5 py-0.2 rounded font-bold text-3xs uppercase ${
                currentUser.role === 'LEADER' ? 'bg-amber-400/20 text-amber-200' : 'bg-blue-400/20 text-blue-200'
              }`}>
                {currentUser.role === 'LEADER' ? 'CẤP LÃNH ĐẠO' : 'CẤP NHÂN VIÊN'}
              </span>
              <button
                type="button"
                onClick={onOpenLoginModal}
                title="Chuyển đổi tài khoản khác"
                className="text-amber-300 hover:text-white underline ml-1 cursor-pointer"
              >
                Đổi TK
              </button>
              <button
                type="button"
                onClick={logout}
                title="Đăng xuất khỏi hệ thống"
                className="text-red-200 hover:text-white bg-red-950/80 px-1.5 py-0.5 rounded border border-red-800 flex items-center gap-1 ml-1 cursor-pointer font-bold"
              >
                <LogOut className="w-3 h-3 text-red-300" />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="px-2.5 py-0.5 rounded bg-red-700 hover:bg-red-600 text-white font-bold text-2xs cursor-pointer"
            >
              Đăng Nhập
            </button>
          )}

          {/* Quick utility links */}
          <div className="flex items-center gap-1.5 text-2xs pl-2 border-l border-red-900/80">
            <button
              type="button"
              onClick={onOpenDatabaseSchema}
              className="text-red-200 hover:text-white flex items-center gap-1 cursor-pointer"
              title="Xem cấu trúc Database & Lược đồ DDL SQL"
            >
              <Database className="w-3 h-3 text-emerald-400" />
              <span className="hidden sm:inline">Cơ Sở Dữ Liệu</span>
            </button>
            <span className="text-red-400">·</span>
            <button
              type="button"
              onClick={onResetData}
              className="text-red-300 hover:text-rose-200 cursor-pointer"
              title="Khôi phục lại dữ liệu nguyên bản từ văn bản kết luận 28/9"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar: Brand + High-level Module Switcher (Cấp 1) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <LogoTTDVTH className="w-12 h-12 hover:scale-105 transition-transform" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                  Hệ Thống Phân Công Nhiệm Vụ & Báo Cáo Tiến Độ
                </h1>
                <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded border border-slate-700 font-mono tabular-nums">
                  {taskCount} nhiệm vụ
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Cơ chế 2 chiều: Ban Giám đốc chỉ đạo điều hành ↔ Viên chức báo cáo tiến độ chuyên môn
              </p>
            </div>
          </div>

          {/* Phía Phải Header: Chỉ báo phân hệ hiện tại & Nút mở menu trên Mobile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Thẻ chỉ báo phân hệ đang mở */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold shadow-xs ${
              currentRole === 'leader'
                ? 'bg-red-950/80 border-red-800 text-red-200'
                : 'bg-blue-950/80 border-blue-800 text-blue-200'
            }`}>
              {currentRole === 'leader' ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Đang Mở: Phân Hệ Lãnh Đạo</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  <span>Đang Mở: Phân Hệ Nhân Viên ({selectedStaff.name})</span>
                </>
              )}
            </div>

            {/* Nút mở Menu Dọc bên trái trên điện thoại / màn hình nhỏ */}
            {onToggleMobileMenu && (
              <button
                type="button"
                onClick={onToggleMobileMenu}
                className="lg:hidden px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 flex items-center gap-2 text-xs font-bold transition-colors cursor-pointer shadow-sm"
                title="Mở menu điều hành bên trái"
              >
                <Menu className="w-4 h-4 text-amber-400" />
                <span>Menu Điều Hành</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 3. Dải Phân Cấp & Chỉ Báo Thẩm Quyền (Cấp Hệ Thống -> Cấp Phân Hệ) */}
      <div className={`px-4 sm:px-6 lg:px-8 py-1.5 text-xs border-t transition-colors flex items-center justify-between flex-wrap gap-2 ${
        currentRole === 'leader' 
          ? 'bg-red-950/70 border-red-900 text-red-200' 
          : 'bg-slate-950 border-slate-800 text-blue-200'
      }`}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-300">CẤU TRÚC PHÂN CẤP:</span>
          <span className="text-slate-400">Hệ Thống Chỉ Đạo & Báo Cáo</span>
          <span className="text-slate-500">→</span>
          <span className={`px-2 py-0.5 rounded font-bold uppercase text-2xs ${
            currentRole === 'leader'
              ? 'bg-red-900 text-amber-200 border border-red-800'
              : 'bg-blue-900 text-blue-100 border border-blue-800'
          }`}>
            {currentRole === 'leader' ? 'PHÂN HỆ 1: LÃNH ĐẠO (BAN GIÁM ĐỐC)' : 'PHÂN HỆ 2: VIÊN CHỨC (NHÂN VIÊN BÁO CÁO)'}
          </span>
          <span className="text-slate-400 hidden md:inline">
            {currentRole === 'leader' 
              ? '· Quyền hạn: Phân công nhiệm vụ, phát lệnh chỉ đạo, giám sát KPI 40 việc'
              : `· Tác nghiệp: Cán bộ ${selectedStaff.name} báo cáo tiến độ, khó khăn & tiếp thu chỉ đạo`}
          </span>
        </div>

        <div className="flex items-center gap-2 text-2xs">
          <span className="text-slate-400">Trạng thái phân quyền:</span>
          <span className="font-semibold text-white">
            {currentUser?.fullName} ({currentUser?.role === 'LEADER' ? 'Cấp Lãnh Đạo' : 'Cấp Nhân Viên'})
          </span>
        </div>
      </div>
    </header>
  );
};
