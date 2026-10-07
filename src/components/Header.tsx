import React from 'react';
import { 
  Building2, 
  UserCheck, 
  FileText, 
  PlusCircle, 
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  Database,
  LogIn,
  LogOut,
  User
} from 'lucide-react';
import { STAFF_MEMBERS } from '../data/staffMembers';
import { StaffMember } from '../types';
import { useAuth } from '../context/AuthContext';

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
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  selectedStaff,
  onStaffChange,
  onOpenNotice,
  onOpenNewTask,
  onOpenDatabaseSchema,
  onOpenLoginModal,
  onResetData,
  taskCount,
}) => {
  const { currentUser, isLeader, logout, switchUser } = useAuth();

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      {/* Top Banner Ribbon */}
      <div className="bg-red-800 text-red-100 px-4 py-1 text-xs flex flex-wrap items-center justify-between border-b border-red-900">
        <div className="flex items-center gap-2 font-medium">
          <span className="font-bold tracking-wide uppercase">UBND PHƯỜNG HỐ NAI</span>
          <span className="text-red-300">/</span>
          <span>TRUNG TÂM DỊCH VỤ TỔNG HỢP</span>
        </div>
        <div className="text-red-200 text-xs flex items-center gap-2 flex-wrap">
          <span className="hidden md:inline">Thông báo Kết luận cuộc họp giao ban tuần 28/9/2026</span>
          <span className="text-red-400 hidden md:inline">·</span>
          <span>Chủ trì: <strong>Đ/c Phạm Thanh Phong – Giám đốc TT</strong></span>
          <span className="text-red-400">·</span>
          
          {/* User Status in Ribbon */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 bg-red-900/80 px-2 py-0.5 rounded text-2xs font-medium">
              <span className={`w-1.5 h-1.5 rounded-full ${currentUser.isLeader ? 'bg-amber-400' : 'bg-blue-300'}`} />
              <span>{currentUser.fullName}</span>
              <span className="font-mono opacity-80">({currentUser.role === 'LEADER' ? 'LÃNH ĐẠO' : 'NHÂN VIÊN'})</span>
              <button
                type="button"
                onClick={onOpenLoginModal}
                title="Đổi tài khoản"
                className="underline ml-1 hover:text-white cursor-pointer"
              >
                Đổi
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="bg-red-700 hover:bg-red-600 text-white px-2 py-0.5 rounded font-bold text-2xs cursor-pointer"
            >
              Đăng Nhập
            </button>
          )}
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-700 text-white flex items-center justify-center font-bold shadow-inner shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Phân Công Nhiệm Vụ & Báo Cáo Tiến Độ
                </h1>
                <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded border border-slate-700 font-mono tabular-nums">
                  {taskCount} nhiệm vụ
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Phân quyền cấp Lãnh đạo giao việc, đôn đốc & Form báo cáo tiến độ cho Nhân viên
              </p>
            </div>
          </div>

          {/* Controls: Role Switcher & Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Mode Switcher Segmented Control */}
            <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex items-center">
              <button
                type="button"
                onClick={() => onRoleChange('leader')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentRole === 'leader'
                    ? 'bg-red-700 text-white shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Màn Hình Lãnh Đạo</span>
              </button>

              <button
                type="button"
                onClick={() => onRoleChange('staff')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentRole === 'staff'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Form Báo Cáo Nhân Viên</span>
              </button>
            </div>

            {/* Staff Selector Dropdown (Shown when in Staff mode) */}
            {currentRole === 'staff' && (
              <div className="relative inline-block text-left">
                <div className="flex items-center bg-slate-800 rounded-lg border border-blue-500/60 px-2 py-1 text-xs">
                  <span className="text-blue-300 mr-1.5 font-medium">Báo cáo:</span>
                  <select
                    value={selectedStaff.id}
                    onChange={(e) => {
                      const found = STAFF_MEMBERS.find((m) => m.id === e.target.value);
                      if (found) {
                        onStaffChange(found);
                        // Also sync active logged-in user if available
                        const matchingAccount = STAFF_MEMBERS.find((u) => u.id === found.id);
                        if (matchingAccount) switchUser('usr-' + found.id);
                      }
                    }}
                    className="bg-slate-800 text-white text-xs font-medium focus:outline-none cursor-pointer pr-4 appearance-none"
                  >
                    {STAFF_MEMBERS.filter((m) => m.id !== 'phong').map((member) => (
                      <option key={member.id} value={member.id} className="bg-slate-800 text-white">
                        {member.shortName} - {member.unit}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 pointer-events-none -ml-3" />
                </div>
              </div>
            )}

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1.5">
              
              {/* Database Schema Viewer */}
              <button
                type="button"
                onClick={onOpenDatabaseSchema}
                title="Xem phân tích cấu trúc cơ sở dữ liệu và mã nguồn DDL SQL"
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Cơ Sở Dữ Liệu</span>
                <span className="sm:hidden">DB</span>
              </button>

              {/* Official Notice */}
              <button
                type="button"
                onClick={onOpenNotice}
                title="Xem văn bản kết luận cuộc họp giao ban tuần ngày 28/9/2026"
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Văn Bản Kết Luận</span>
                <span className="sm:hidden">Kết Luận</span>
              </button>

              {/* Giao việc mới (Leader action) */}
              <button
                type="button"
                onClick={onOpenNewTask}
                title={isLeader ? "Lãnh đạo phân công / giao nhiệm vụ mới" : "Đề xuất nhiệm vụ phát sinh ngoài giao ban"}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isLeader
                    ? 'bg-red-800/80 hover:bg-red-700 text-white border-red-700'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">{isLeader ? 'Lãnh Đạo Giao Việc' : 'Báo Việc Mới'}</span>
                <span className="sm:hidden">+ Việc</span>
              </button>

              {/* Switch Account / Login */}
              <button
                type="button"
                onClick={onOpenLoginModal}
                title="Đăng nhập hoặc chuyển đổi tài khoản phân quyền"
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Tài Khoản</span>
              </button>

              {/* Reset Data */}
              <button
                type="button"
                onClick={onResetData}
                title="Khôi phục lại dữ liệu gốc từ văn bản kết luận 28/9/2026"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
