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
  Menu,
  Paperclip
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
  onRoleChange,
  selectedStaff,
  onOpenNotice,
  onOpenNewTask,
  onOpenDatabaseSchema,
  onOpenLoginModal,
  onOpenAttachments,
  onResetData,
  taskCount,
  onToggleMobileMenu,
}) => {
  const { currentUser, isLeader, logout } = useAuth();

  return (
    <header className="bg-linear-to-r from-[#0a274c] via-[#0d3464] to-[#0a274c] text-white border-b border-[#082142] sticky top-0 z-40 shadow-lg">
      {/* 1. Dải Băng Thể Thức Cơ Quan Nhà Nước */}
      <div className="bg-linear-to-r from-[#881313] via-[#9e1c1c] to-[#881313] text-red-50 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-[#731010] shadow-2xs">
        <div className="flex items-center gap-2 font-medium">
          <Building2 className="w-4 h-4 text-amber-300 inline-block drop-shadow-xs" />
          <span className="font-extrabold tracking-wide uppercase text-amber-200 drop-shadow-xs">UBND PHƯỜNG HỐ NAI</span>
          <span className="text-red-300">/</span>
          <span className="uppercase text-white font-bold tracking-wide">TRUNG TÂM DỊCH VỤ TỔNG HỢP</span>
          <span className="text-red-300/80 hidden lg:inline">|</span>
          <span className="text-2xs text-red-100/90 hidden lg:inline">
            Theo dõi Thông báo Kết luận giao ban tuần ngày 28/9/2026 (Chủ trì: Đ/c Phạm Thanh Phong – Giám đốc)
          </span>
        </div>

        {/* User Account Capsule & Logout */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-[#700e0e]/90 px-3 py-0.5 rounded-full text-2xs border border-amber-400/40 shadow-xs">
              <span className={`w-2 h-2 rounded-full ${currentUser.isLeader ? 'bg-amber-300 animate-pulse' : 'bg-blue-300'}`} />
              <span className="font-bold text-white">{currentUser.fullName}</span>
              <span className="text-amber-200/90 hidden sm:inline">({currentUser.position})</span>
              <span className={`px-2 py-0.5 rounded font-extrabold text-3xs uppercase tracking-wider ${
                currentUser.role === 'LEADER' ? 'bg-amber-400 text-red-950 font-black' : 'bg-blue-400/20 text-blue-100'
              }`}>
                {currentUser.role === 'LEADER' ? 'CẤP LÃNH ĐẠO' : 'CẤP NHÂN VIÊN'}
              </span>
              <button
                type="button"
                onClick={onOpenLoginModal}
                title="Chuyển đổi tài khoản khác"
                className="text-amber-300 hover:text-white underline ml-1 cursor-pointer font-medium"
              >
                Đổi TK
              </button>
              <button
                type="button"
                onClick={logout}
                title="Đăng xuất khỏi hệ thống"
                className="text-white hover:bg-red-800 bg-red-950/80 px-2 py-0.5 rounded-md border border-red-700/80 flex items-center gap-1 ml-1 cursor-pointer font-bold transition-colors"
              >
                <LogOut className="w-3 h-3 text-red-200" />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="px-3 py-0.5 rounded-md bg-amber-400 hover:bg-amber-300 text-red-950 font-extrabold text-2xs cursor-pointer shadow-xs transition-colors"
            >
              Đăng Nhập
            </button>
          )}

          {/* Quick utility links */}
          <div className="flex items-center gap-2 text-2xs pl-2 border-l border-red-700/60">
            {onOpenAttachments && (
              <>
                <button
                  type="button"
                  onClick={onOpenAttachments}
                  className="text-amber-300 hover:text-white flex items-center gap-1 cursor-pointer font-bold"
                  title="Xem và tải các file/hồ sơ đính kèm"
                >
                  <Paperclip className="w-3 h-3 text-amber-300" />
                  <span className="hidden sm:inline">File Đính Kèm</span>
                </button>
                <span className="text-red-300">·</span>
              </>
            )}
            <button
              type="button"
              onClick={onOpenDatabaseSchema}
              className="text-red-100 hover:text-white flex items-center gap-1 cursor-pointer"
              title="Xem cấu trúc Database & Lược đồ DDL SQL"
            >
              <Database className="w-3 h-3 text-emerald-300" />
              <span className="hidden sm:inline">Cơ Sở Dữ Liệu</span>
            </button>
            <span className="text-red-300">·</span>
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

      {/* 2. Main Navigation Bar: Brand + High-level Module Switcher (Cấp 1) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3.5">
            <div className="p-0.5 bg-white/10 rounded-full shadow-inner ring-1 ring-white/20">
              <LogoTTDVTH className="w-12 h-12 hover:scale-105 transition-transform" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-tight drop-shadow-xs">
                  Hệ Thống Phân Công Nhiệm Vụ & Báo Cáo Tiến Độ
                </h1>
                <span className="bg-[#061d38] text-amber-300 text-xs px-2.5 py-0.5 rounded-full border border-blue-400/30 font-mono font-bold tabular-nums shadow-xs">
                  {taskCount} nhiệm vụ
                </span>
              </div>
              <p className="text-xs text-blue-100/80 mt-0.5">
                Cơ chế 2 chiều: Ban Giám đốc chỉ đạo điều hành ↔ Viên chức báo cáo tiến độ chuyên môn
              </p>
            </div>
          </div>

          {/* Phía Phải Header: Chỉ báo phân hệ hiện tại & Nút mở menu trên Mobile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Thẻ chỉ báo phân hệ đang mở */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold shadow-xs ${
              currentRole === 'leader'
                ? 'bg-linear-to-r from-red-900/90 to-red-800/90 border-amber-400/40 text-amber-200'
                : 'bg-linear-to-r from-blue-900/90 to-indigo-900/90 border-blue-400/40 text-blue-100'
            }`}>
              {currentRole === 'leader' ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>Đang Mở: Phân Hệ Lãnh Đạo</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 text-cyan-300" />
                  <span>Đang Mở: Phân Hệ Nhân Viên ({selectedStaff.name})</span>
                </>
              )}
            </div>

            {/* Nút mở Menu Dọc bên trái trên điện thoại / màn hình nhỏ */}
            {onToggleMobileMenu && (
              <button
                type="button"
                onClick={onToggleMobileMenu}
                className="lg:hidden px-3 py-2 rounded-xl bg-[#072448] hover:bg-[#0c315e] text-slate-100 border border-blue-400/30 flex items-center gap-2 text-xs font-bold transition-colors cursor-pointer shadow-sm"
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
          ? 'bg-[#061e3d] border-[#0c3364] text-red-100' 
          : 'bg-[#061e3d] border-[#0c3364] text-blue-100'
      }`}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-amber-300/90 tracking-wide text-2xs">CẤU TRÚC PHÂN CẤP:</span>
          <span className="text-slate-300 text-2xs">Hệ Thống Chỉ Đạo & Báo Cáo</span>
          <span className="text-slate-500">→</span>
          <span className={`px-2 py-0.5 rounded font-extrabold uppercase text-3xs tracking-wider ${
            currentRole === 'leader'
              ? 'bg-red-800 text-amber-200 border border-amber-400/40'
              : 'bg-blue-800 text-cyan-100 border border-blue-400/40'
          }`}>
            {currentRole === 'leader' ? 'PHÂN HỆ 1: LÃNH ĐẠO (BAN GIÁM ĐỐC)' : 'PHÂN HỆ 2: VIÊN CHỨC (NHÂN VIÊN BÁO CÁO)'}
          </span>
          <span className="text-slate-300/90 text-2xs hidden md:inline">
            {currentRole === 'leader' 
              ? '· Quyền hạn: Phân công nhiệm vụ, phát lệnh chỉ đạo, giám sát KPI 40 việc'
              : `· Tác nghiệp: Cán bộ ${selectedStaff.name} báo cáo tiến độ, khó khăn & tiếp thu chỉ đạo`}
          </span>
        </div>

        <div className="flex items-center gap-2 text-2xs">
          <span className="text-slate-300">Trạng thái:</span>
          <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded-full border border-white/15">
            {currentUser?.fullName} ({currentUser?.role === 'LEADER' ? 'Cấp Lãnh Đạo' : 'Cấp Nhân Viên'})
          </span>
        </div>
      </div>
    </header>
  );
};
