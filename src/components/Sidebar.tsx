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
      onOpenLoginModal();
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
    <div className="flex flex-col h-full justify-between p-3.5 space-y-4 font-sans text-slate-800">
      
      {/* Top Section: Navigation Header & Role Switcher */}
      <div className="space-y-4">
        
        {/* Mobile Header Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 lg:hidden">
          <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
            Danh Mục Chức Năng
          </span>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              title="Đóng menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Section 1: Phân Hệ Chức Năng */}
        <div>
          <div className="px-2 mb-1.5">
            <span className="text-3xs font-bold uppercase tracking-wider text-slate-500">
              PHÂN HỆ LÀM VIỆC
            </span>
          </div>

          <div className="flex flex-col gap-1">
            {/* 1. Nút Phân Hệ Lãnh Đạo */}
            <button
              type="button"
              onClick={handleLeaderClick}
              className={`w-full px-3 py-2.5 rounded-lg text-left transition-colors flex items-center justify-between cursor-pointer border ${
                currentRole === 'leader'
                  ? 'bg-[#153e6b] text-white border-[#153e6b] font-semibold shadow-2xs'
                  : isLeader
                    ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                    : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
              }`}
              title={isLeader ? "Mở phân hệ Lãnh đạo" : "Yêu cầu quyền Ban Giám Đốc"}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                  currentRole === 'leader' ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {isLeader ? <ShieldCheck className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold leading-tight truncate">
                    Phân Hệ Lãnh Đạo
                  </div>
                  <div className={`text-3xs mt-0.5 truncate ${currentRole === 'leader' ? 'text-blue-100' : 'text-slate-500'}`}>
                    {isLeader ? 'Ban Giám Đốc điều hành' : 'Yêu cầu quyền Lãnh đạo'}
                  </div>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 shrink-0 ${currentRole === 'leader' ? 'text-blue-200' : 'text-slate-400'}`} />
            </button>

            {/* 2. Nút Phân Hệ Nhân Viên */}
            <button
              type="button"
              onClick={handleStaffClick}
              className={`w-full px-3 py-2.5 rounded-lg text-left transition-colors flex items-center justify-between cursor-pointer border ${
                currentRole === 'staff'
                  ? 'bg-[#153e6b] text-white border-[#153e6b] font-semibold shadow-2xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
              title="Mở phân hệ Viên chức báo cáo tiến độ"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                  currentRole === 'staff' ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold leading-tight truncate">
                    Phân Hệ Viên Chức
                  </div>
                  <div className={`text-3xs mt-0.5 truncate ${currentRole === 'staff' ? 'text-blue-100' : 'text-slate-500'}`}>
                    Báo cáo tiến độ nhiệm vụ
                  </div>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 shrink-0 ${currentRole === 'staff' ? 'text-blue-200' : 'text-slate-400'}`} />
            </button>
          </div>
        </div>

        {/* Section 2: Nghiệp Vụ Chính */}
        <div>
          <div className="px-2 mb-1.5">
            <span className="text-3xs font-bold uppercase tracking-wider text-slate-500">
              TÁC NGHIỆP CÔNG VIỆC
            </span>
          </div>

          <div className="flex flex-col gap-1">
            {/* Giao Việc Mới (Chỉ Lãnh Đạo) */}
            {isLeader && (
              <button
                type="button"
                onClick={() => {
                  onOpenNewTask();
                  if (onCloseMobile) onCloseMobile();
                }}
                title="Lãnh đạo phân công / giao nhiệm vụ mới cho cán bộ"
                className="w-full px-3 py-2 rounded-lg text-left bg-[#153e6b] hover:bg-[#103257] text-white font-medium text-xs flex items-center justify-between transition-colors shadow-2xs cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <PlusCircle className="w-4 h-4 text-blue-200 shrink-0" />
                  <span className="truncate">Giao việc mới</span>
                </div>
                <span className="text-3xs text-blue-200 bg-white/10 px-1.5 py-0.5 rounded font-mono">
                  BGĐ
                </span>
              </button>
            )}

            {/* Văn Bản Kết Luận */}
            <button
              type="button"
              onClick={() => {
                onOpenNotice();
                if (onCloseMobile) onCloseMobile();
              }}
              title="Xem toàn văn Thông báo Kết luận giao ban tuần ngày 28/9/2026"
              className="w-full px-3 py-2 rounded-lg text-left bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 flex items-center justify-between text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="truncate">Văn bản kết luận 28/9</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {/* Kho File Đính Kèm */}
            {onOpenAttachments && (
              <button
                type="button"
                onClick={() => {
                  onOpenAttachments();
                  if (onCloseMobile) onCloseMobile();
                }}
                title="Xem trực tiếp và tải toàn bộ hồ sơ, tài liệu, quyết định đính kèm"
                className="w-full px-3 py-2 rounded-lg text-left bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 flex items-center justify-between text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Paperclip className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="truncate">Hồ sơ & File đính kèm</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            )}
          </div>
        </div>

        {/* Section 3: Tiện Ích */}
        <div>
          <div className="px-2 mb-1.5">
            <span className="text-3xs font-bold uppercase tracking-wider text-slate-500">
              TIỆN ÍCH DỮ LIỆU
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => {
                onOpenDatabaseSchema();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full px-3 py-1.5 rounded-lg text-left text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">Cơ sở dữ liệu hệ thống</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onResetData();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full px-3 py-1.5 rounded-lg text-left text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-2 transition-colors cursor-pointer"
              title="Khôi phục lại dữ liệu ban đầu 40 nhiệm vụ giao ban"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">Khôi phục dữ liệu gốc</span>
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Section: Current Account Info & Status */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        {/* Firestore Status */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-2xs text-slate-600">
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Cloud className="w-3.5 h-3.5 text-slate-500" />
              Cơ sở dữ liệu:
            </span>
            <span className="text-emerald-700 font-semibold font-mono text-3xs">
              Đồng bộ trực tuyến
            </span>
          </div>
          <div className="flex items-center justify-between text-3xs text-slate-500">
            <span>Tổng số nhiệm vụ:</span>
            <span className="font-bold font-mono text-slate-800">{taskCount} việc</span>
          </div>
        </div>

        {/* Current User Card */}
        {currentUser && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
            <div className="flex items-center gap-2 mb-2 min-w-0">
              <div className="w-7 h-7 rounded bg-[#153e6b] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser.fullName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1 truncate">
                <div className="text-xs font-bold text-slate-800 truncate leading-tight">
                  {currentUser.fullName}
                </div>
                <div className="text-3xs text-slate-500 truncate">
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
              className="w-full py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 rounded text-3xs font-medium flex items-center justify-center gap-1 border border-slate-200 transition-colors cursor-pointer"
            >
              <KeyRound className="w-3 h-3 text-slate-500" />
              <span>Đổi tài khoản cán bộ</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 bg-white border-r border-slate-200 flex-col sticky top-[102px] h-[calc(100vh-102px)] overflow-y-auto">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-start">
          <div 
            className="fixed inset-0 bg-slate-900/40 transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] bg-white border-r border-slate-200 h-full overflow-y-auto z-10 shadow-xl flex flex-col">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
