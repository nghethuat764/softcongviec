import React from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  FileText, 
  PlusCircle, 
  Lock, 
  RotateCcw, 
  Database, 
  Cloud,
  ChevronRight,
  KeyRound,
  X,
  Layers,
  Sparkles,
  Paperclip
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentRole: 'leader' | 'staff';
  onRoleChange: (role: 'leader' | 'staff') => void;
  onOpenNotice: () => void;
  onOpenNewTask: () => void;
  onOpenDatabaseSchema: () => void;
  onOpenLoginModal: () => void;
  onOpenAttachments?: () => void;
  onResetData: () => void;
  taskCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  onRoleChange,
  onOpenNotice,
  onOpenNewTask,
  onOpenDatabaseSchema,
  onOpenLoginModal,
  onOpenAttachments,
  onResetData,
  taskCount,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { currentUser, isLeader } = useAuth();

  const handleLeaderClick = () => {
    if (!isLeader) {
      alert('Quyền truy cập bị giới hạn: Phân hệ Lãnh đạo chỉ dành cho Ban Giám Đốc. Vui lòng đăng nhập tài khoản Lãnh đạo.');
      return;
    }
    onRoleChange('leader');
    if (onCloseMobile) onCloseMobile();
  };

  const handleStaffClick = () => {
    onRoleChange('staff');
    if (onCloseMobile) onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full justify-between p-3.5 space-y-4">
      
      {/* Top Section: Navigation Header & Role Switcher */}
      <div className="space-y-4">
        
        {/* Mobile Header Bar */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 lg:hidden">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-xs text-white uppercase tracking-wider">
              Danh Mục Phân Hệ
            </span>
          </div>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              title="Đóng menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Section 1: Phân Hệ Chức Năng (Theo chiều dọc gọn gàng) */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-3xs font-mono uppercase tracking-wider text-amber-300/90 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              PHÂN HỆ ĐIỀU HÀNH
            </span>
            <span className="text-3xs text-blue-200/60 font-mono">2 vai trò</span>
          </div>

          <div className="flex flex-col gap-1.5">
            
            {/* 1. Nút Phân Hệ Lãnh Đạo */}
            <button
              type="button"
              onClick={handleLeaderClick}
              className={`w-full p-2.5 rounded-xl text-left transition-all relative overflow-hidden flex items-center justify-between group cursor-pointer ${
                currentRole === 'leader'
                  ? 'bg-linear-to-r from-red-700 via-red-800 to-red-900 text-white shadow-md ring-1 ring-amber-400/50'
                  : isLeader
                    ? 'bg-[#0d2b50] hover:bg-[#123969] text-slate-200 hover:text-white border border-[#16447c]'
                    : 'bg-[#0d2b50]/50 text-slate-400 border border-[#16447c]/60 cursor-not-allowed opacity-75'
              }`}
              title={isLeader ? "Mở phân hệ Lãnh đạo" : "Yêu cầu quyền Ban Giám Đốc"}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-xs ${
                  currentRole === 'leader'
                    ? 'bg-amber-400 text-red-950 font-bold'
                    : isLeader
                      ? 'bg-[#081f3b] text-amber-300 group-hover:bg-red-950/60'
                      : 'bg-[#081f3b] text-slate-500'
                }`}>
                  {isLeader ? (
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold uppercase tracking-wide leading-tight truncate">
                    PHÂN HỆ LÃNH ĐẠO
                  </div>
                  <div className={`text-3xs mt-0.5 truncate ${
                    currentRole === 'leader' ? 'text-amber-200' : 'text-slate-300'
                  }`}>
                    {isLeader ? 'Chỉ Đạo & Đôn Đốc' : 'Khóa (Cần BGĐ)'}
                  </div>
                </div>
              </div>
              
              {currentRole === 'leader' && (
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0 ml-1" />
              )}
            </button>

            {/* 2. Nút Phân Hệ Nhân Viên */}
            <button
              type="button"
              onClick={handleStaffClick}
              className={`w-full p-2.5 rounded-xl text-left transition-all relative overflow-hidden flex items-center justify-between group cursor-pointer ${
                currentRole === 'staff'
                  ? 'bg-linear-to-r from-blue-600 via-blue-700 to-indigo-800 text-white shadow-md ring-1 ring-cyan-300/50'
                  : 'bg-[#0d2b50] hover:bg-[#123969] text-slate-200 hover:text-white border border-[#16447c]'
              }`}
              title="Mở phân hệ Viên chức báo cáo tiến độ"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-xs ${
                  currentRole === 'staff'
                    ? 'bg-white text-blue-900 font-bold'
                    : 'bg-[#081f3b] text-blue-300 group-hover:bg-blue-950/60'
                }`}>
                  <UserCheck className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold uppercase tracking-wide leading-tight truncate">
                    PHÂN HỆ NHÂN VIÊN
                  </div>
                  <div className={`text-3xs mt-0.5 truncate ${
                    currentRole === 'staff' ? 'text-cyan-200' : 'text-slate-300'
                  }`}>
                    Báo Cáo Tiến Độ
                  </div>
                </div>
              </div>

              {currentRole === 'staff' && (
                <div className="w-2 h-2 rounded-full bg-cyan-300 animate-ping shrink-0 ml-1" />
              )}
            </button>

          </div>
        </div>

        {/* Section 2: Tác Nghiệp Trọng Tâm (Phân quyền: Giao Việc Mới CHỈ hiển thị cho Cấp Lãnh Đạo) */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-3xs font-mono uppercase tracking-wider text-amber-300/90 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              TÁC NGHIỆP NHIỆM VỤ
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            
            {/* 3. NÚT GIAO VIỆC MỚI: PHÂN QUYỀN CHỈ CẤP LÃNH ĐẠO MỚI HIỂN THỊ */}
            {isLeader && (
              <button
                type="button"
                onClick={() => {
                  onOpenNewTask();
                  if (onCloseMobile) onCloseMobile();
                }}
                title="Lãnh đạo phân công / giao nhiệm vụ mới cho cán bộ"
                className="w-full p-2.5 rounded-xl text-left border bg-linear-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white border-red-500/80 hover:shadow-md flex items-center justify-between shadow-xs transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <PlusCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold uppercase tracking-wide leading-tight truncate">
                      Giao Việc Mới
                    </div>
                    <div className="text-3xs text-white/80 mt-0.5 truncate">
                      Lãnh đạo phân công
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/70 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            )}

            {/* 4. Nút Toàn Văn Văn Bản Kết Luận */}
            <button
              type="button"
              onClick={() => {
                onOpenNotice();
                if (onCloseMobile) onCloseMobile();
              }}
              title="Xem toàn văn Thông báo Kết luận giao ban tuần ngày 28/9/2026"
              className="w-full p-2.5 rounded-xl text-left bg-[#0d2b50] hover:bg-[#123969] text-slate-200 border border-[#16447c] hover:border-blue-400/40 flex items-center justify-between transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-300">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold tracking-wide leading-tight text-white truncate">
                    Văn Bản Kết Luận
                  </div>
                  <div className="text-3xs text-slate-300 mt-0.5 truncate">
                    Thông báo 28/9/2026
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>

            {/* 5. Nút Kho File Đính Kèm Của Lãnh Đạo */}
            <button
              type="button"
              onClick={() => {
                if (onOpenAttachments) onOpenAttachments();
                if (onCloseMobile) onCloseMobile();
              }}
              title="Xem trực tiếp và tải toàn bộ hồ sơ, tài liệu, quyết định đính kèm"
              className="w-full p-2.5 rounded-xl text-left bg-[#0d2b50] hover:bg-[#123969] text-slate-200 border border-[#16447c] hover:border-blue-400/40 flex items-center justify-between transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-300">
                  <Paperclip className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold tracking-wide leading-tight text-white truncate">
                    Kho File Đính Kèm
                  </div>
                  <div className="text-3xs text-cyan-200 mt-0.5 truncate">
                    Xem & Tải trực tiếp
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>

          </div>
        </div>

        {/* Section 3: Tiện Ích & Dữ Liệu (Gọn gàng) */}
        <div>
          <div className="flex items-center justify-between px-1 mb-1.5">
            <span className="text-3xs font-mono uppercase tracking-wider text-amber-300/90 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              TIỆN ÍCH HỆ THỐNG
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => {
                onOpenDatabaseSchema();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full px-2.5 py-2 rounded-lg text-left text-xs text-slate-200 hover:text-white hover:bg-[#123969] flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <div className="flex-1 min-w-0 truncate">
                <span className="block font-medium leading-none truncate">Cơ Sở Dữ Liệu</span>
                <span className="text-3xs text-slate-400 mt-0.5 block truncate">Firestore & Lược đồ</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onResetData();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full px-2.5 py-2 rounded-lg text-left text-xs text-slate-300 hover:text-amber-200 hover:bg-[#123969] flex items-center gap-2.5 transition-colors cursor-pointer"
              title="Khôi phục lại dữ liệu ban đầu 40 nhiệm vụ giao ban"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <div className="flex-1 min-w-0 truncate">
                <span className="block font-medium leading-none truncate">Khôi Phục Gốc</span>
                <span className="text-3xs text-slate-400 mt-0.5 block truncate">Tải lại 40 việc mẫu</span>
              </div>
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Section: Current Account Capsule & Live Sync */}
      <div className="pt-3 border-t border-[#0d2f57] space-y-2.5">
        
        {/* Real-time Firestore Status */}
        <div className="bg-[#06182e] border border-[#0d2f57] rounded-xl p-2.5 text-2xs">
          <div className="flex items-center justify-between text-slate-200 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              Cloud Firestore
            </span>
            <span className="font-mono text-emerald-300 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Trực tuyến
            </span>
          </div>
          <div className="text-slate-400 flex items-center justify-between text-3xs">
            <span>Tổng số nhiệm vụ:</span>
            <span className="font-bold font-mono text-amber-300">{taskCount} việc</span>
          </div>
        </div>

        {/* Current User Card */}
        {currentUser && (
          <div className="bg-[#0d2b50] border border-[#16447c] rounded-xl p-2.5 shadow-sm">
            <div className="flex items-center gap-2 mb-2 min-w-0">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs ${
                currentUser.role === 'LEADER'
                  ? 'bg-amber-400 text-red-950'
                  : 'bg-cyan-500 text-white'
              }`}>
                {currentUser.fullName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1 truncate">
                <div className="text-xs font-bold text-white truncate leading-tight">
                  {currentUser.fullName}
                </div>
                <div className="text-3xs text-slate-300 truncate">
                  {currentUser.position}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onOpenLoginModal();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full py-1.5 px-2 bg-[#081f3b] hover:bg-[#123969] text-amber-300 hover:text-white rounded-lg text-3xs font-semibold flex items-center justify-center gap-1 border border-blue-400/30 transition-colors cursor-pointer"
            >
              <KeyRound className="w-3 h-3 text-amber-300" />
              <span>Chuyển Đổi Tài Khoản</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-[#0a2342] border-r border-[#0d2f57] flex-col sticky top-[108px] h-[calc(100vh-108px)] overflow-y-auto custom-scrollbar shadow-lg">
        {content}
      </aside>

      {/* Mobile Drawer (When toggled on small screens - slides in from left) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-start">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          
          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] bg-[#0a2342] border-r border-[#0d2f57] h-full overflow-y-auto z-10 shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
