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
  Paperclip,
  Users,
  Building2,
  Image as ImageIcon,
  FileSpreadsheet,
  Smartphone
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
  onOpenUserManagement?: () => void;
  onOpenDailyReport?: () => void;
  onOpenDepartmentManagement?: () => void;
  onOpenBgSettings?: () => void;
  onOpenMobileMockup?: () => void;
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
  onOpenUserManagement,
  onOpenDailyReport,
  onOpenDepartmentManagement,
  onOpenBgSettings,
  onOpenMobileMockup,
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
    <div className="flex flex-col h-full justify-between p-4 space-y-5 font-sans text-[#111827]">
      
      {/* Top Section: Navigation Header & Role Switcher */}
      <div className="space-y-5">
        
        {/* Mobile Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] lg:hidden">
          <span className="font-bold text-[14px] text-[#111827] uppercase tracking-wider">
            Danh Mục Chức Năng
          </span>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1.5 rounded-[8px] text-[#4B5563] hover:text-[#111827] hover:bg-[#F4F6F9] cursor-pointer"
              title="Đóng menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Section 1: Phân Hệ Chức Năng */}
        <div>
          <div className="px-1 mb-2">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#4B5563]">
              PHÂN HỆ LÀM VIỆC
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {/* 1. Nút Phân Hệ Lãnh Đạo - Chỉ hiển thị cho Ban Giám Đốc */}
            {isLeader && (
              <button
                type="button"
                onClick={handleLeaderClick}
                className={`w-full p-4 rounded-[8px] text-left transition-colors flex items-center justify-between cursor-pointer border ${
                  currentRole === 'leader'
                    ? 'bg-[#003366] text-white border-[#003366] font-semibold shadow-xs'
                    : 'bg-white hover:bg-[#F4F6F9] text-[#111827] border-[#E5E7EB]'
                }`}
                title="Mở phân hệ Lãnh đạo điều hành"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-[6px] flex items-center justify-center shrink-0 ${
                    currentRole === 'leader' ? 'bg-white/20 text-white' : 'bg-[#F4F6F9] text-[#003366]'
                  }`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <div className="text-[14px] font-bold leading-tight truncate">
                      Phân Hệ Lãnh Đạo
                    </div>
                    <div className={`text-[12px] mt-0.5 truncate ${currentRole === 'leader' ? 'text-blue-100' : 'text-[#4B5563]'}`}>
                      Ban Giám Đốc điều hành
                    </div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 ${currentRole === 'leader' ? 'text-blue-200' : 'text-[#9CA3AF]'}`} />
              </button>
            )}

            {/* 2. Nút Phân Hệ Viên Chức - Ẩn khi đăng nhập bằng quyền Lãnh đạo, chỉ hiển thị cho Viên chức */}
            {!isLeader && (
              <button
                type="button"
                onClick={handleStaffClick}
                className={`w-full p-4 rounded-[8px] text-left transition-colors flex items-center justify-between cursor-pointer border ${
                  currentRole === 'staff'
                    ? 'bg-[#003366] text-white border-[#003366] font-semibold shadow-xs'
                    : 'bg-white hover:bg-[#F4F6F9] text-[#111827] border-[#E5E7EB]'
                }`}
                title="Mở phân hệ Viên chức báo cáo tiến độ"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-[6px] flex items-center justify-center shrink-0 ${
                    currentRole === 'staff' ? 'bg-white/20 text-white' : 'bg-[#F4F6F9] text-[#003366]'
                  }`}>
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <div className="text-[14px] font-bold leading-tight truncate">
                      Phân Hệ Viên Chức
                    </div>
                    <div className={`text-[12px] mt-0.5 truncate ${currentRole === 'staff' ? 'text-blue-100' : 'text-[#4B5563]'}`}>
                      Báo cáo tiến độ nhiệm vụ
                    </div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 ${currentRole === 'staff' ? 'text-blue-200' : 'text-[#9CA3AF]'}`} />
              </button>
            )}
          </div>
        </div>

        {/* Section 2: Nghiệp Vụ Chính */}
        <div>
          <div className="px-1 mb-2">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#4B5563]">
              TÁC NGHIỆP CÔNG VIỆC
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {/* Giao Việc Mới (Chỉ Lãnh Đạo) */}
            {isLeader && (
              <button
                type="button"
                onClick={() => {
                  onOpenNewTask();
                  if (onCloseMobile) onCloseMobile();
                }}
                title="Lãnh đạo phân công / giao nhiệm vụ mới cho cán bộ"
                className="w-full p-3.5 sm:p-4 rounded-[8px] text-left bg-[#003366] hover:bg-[#002244] text-white font-medium text-[14px] flex items-center justify-between transition-colors shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <PlusCircle className="w-5 h-5 text-blue-200 shrink-0" />
                  <span className="truncate font-semibold">Giao việc mới</span>
                </div>
                <span className="text-[12px] text-blue-200 bg-white/15 px-2 py-0.5 rounded-[4px] font-mono">
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
              title="Xem văn bản kết luận giao ban"
              className="w-full p-3.5 sm:p-4 rounded-[8px] text-left bg-white hover:bg-[#F4F6F9] text-[#111827] border border-[#E5E7EB] flex items-center justify-between text-[14px] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-5 h-5 text-[#4B5563] shrink-0" />
                <span className="truncate font-medium">Văn bản kết luận</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#9CA3AF] shrink-0" />
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
                className="w-full p-3.5 sm:p-4 rounded-[8px] text-left bg-white hover:bg-[#F4F6F9] text-[#111827] border border-[#E5E7EB] flex items-center justify-between text-[14px] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Paperclip className="w-5 h-5 text-[#4B5563] shrink-0" />
                  <span className="truncate font-medium">Hồ sơ & File đính kèm</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#9CA3AF] shrink-0" />
              </button>
            )}
          </div>
        </div>

        {/* Section 3: Tiện Ích */}
        <div>
          <div className="px-1 mb-2">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#4B5563]">
              TIỆN ÍCH DỮ LIỆU
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => {
                onOpenDatabaseSchema();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full px-3 py-2.5 rounded-[8px] text-left text-[13px] text-[#4B5563] hover:text-[#111827] hover:bg-[#F4F6F9] flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Database className="w-4 h-4 text-[#4B5563] shrink-0" />
              <span className="truncate">Cơ sở dữ liệu hệ thống</span>
            </button>

            {onOpenMobileMockup && (
              <button
                type="button"
                onClick={() => {
                  onOpenMobileMockup();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full px-3 py-2.5 rounded-[8px] text-left text-[13px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                title="Mở giao diện mô phỏng ứng dụng di động Native (iOS/Android)"
              >
                <Smartphone className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="truncate">Mô phỏng App Mobile</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onResetData();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full px-3 py-2.5 rounded-[8px] text-left text-[13px] text-[#4B5563] hover:text-[#111827] hover:bg-[#F4F6F9] flex items-center gap-2.5 transition-colors cursor-pointer"
              title="Khôi phục dữ liệu gốc (Xóa toàn bộ dữ liệu mẫu)"
            >
              <RotateCcw className="w-4 h-4 text-[#4B5563] shrink-0" />
              <span className="truncate">Khôi phục dữ liệu gốc</span>
            </button>
          </div>
        </div>

        {/* Section 4: Quản Lý (Ngay sau Tiện ích dữ liệu - Chỉ Lãnh Đạo) */}
        {isLeader && (
          <div className="pt-1">
            <div className="px-1 mb-2">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#4B5563]">
                QUẢN LÝ
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              {/* Menu 1: Quản lý người dùng */}
              {onOpenUserManagement && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenUserManagement();
                    if (onCloseMobile) onCloseMobile();
                  }}
                  title="Quản lý người dùng, thay đổi, thêm, xoá, sửa tài khoản đăng nhập"
                  className="w-full p-3 sm:p-3.5 rounded-[8px] text-left bg-blue-50/70 hover:bg-blue-100/80 text-[#003366] border border-blue-200 flex items-center justify-between text-[14px] font-semibold transition-colors cursor-pointer shadow-xs group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Users className="w-5 h-5 text-[#003366] shrink-0 group-hover:scale-105 transition-transform" />
                    <span className="truncate">Quản lý người dùng</span>
                  </div>
                  <span className="text-[11px] bg-[#003366] text-white px-2 py-0.5 rounded font-mono font-bold">
                    CSDL
                  </span>
                </button>
              )}

              {/* Menu 2: Quản lý phòng ban (Ngay sau Quản lý người dùng) */}
              {onOpenDepartmentManagement && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenDepartmentManagement();
                    if (onCloseMobile) onCloseMobile();
                  }}
                  title="Quản lý phòng ban, tổ chuyên môn, thay đổi, thêm, xoá, sửa cơ cấu tổ chức"
                  className="w-full p-3 sm:p-3.5 rounded-[8px] text-left bg-blue-50/70 hover:bg-blue-100/80 text-[#003366] border border-blue-200 flex items-center justify-between text-[14px] font-semibold transition-colors cursor-pointer shadow-xs group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Building2 className="w-5 h-5 text-[#003366] shrink-0 group-hover:scale-105 transition-transform" />
                    <span className="truncate">Quản lý phòng ban</span>
                  </div>
                  <span className="text-[11px] bg-[#003366] text-white px-2 py-0.5 rounded font-mono font-bold">
                    CSDL
                  </span>
                </button>
              )}

              {/* Menu 3: Báo cáo thống kê theo ngày (Đứng sau Quản lý phòng ban) */}
              {onOpenDailyReport && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenDailyReport();
                    if (onCloseMobile) onCloseMobile();
                  }}
                  title="Báo cáo thống kê tiến độ theo ngày, nhiệm vụ hoàn thành, trễ hạn, chi tiết từng viên chức và xuất file Excel"
                  className="w-full p-3 sm:p-3.5 rounded-[8px] text-left bg-emerald-50/80 hover:bg-emerald-100/90 text-emerald-950 border border-emerald-200 flex items-center justify-between text-[14px] font-semibold transition-colors cursor-pointer shadow-xs group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-700 shrink-0 group-hover:scale-105 transition-transform" />
                    <span className="truncate">Báo cáo thống kê</span>
                  </div>
                  <span className="text-[11px] bg-emerald-700 text-white px-2 py-0.5 rounded font-mono font-bold">
                    EXCEL
                  </span>
                </button>
              )}

              {/* Menu 3: Hình nền trang quản lý */}
              {onOpenBgSettings && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenBgSettings();
                    if (onCloseMobile) onCloseMobile();
                  }}
                  title="Thay đổi hình nền cho trang quản lý hoặc tải ảnh từ máy tính"
                  className="w-full p-3 sm:p-3.5 rounded-[8px] text-left bg-white hover:bg-blue-50/60 text-[#003366] border border-[#E5E7EB] hover:border-blue-200 flex items-center justify-between text-[14px] font-semibold transition-colors cursor-pointer shadow-xs group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ImageIcon className="w-5 h-5 text-[#003366] shrink-0 group-hover:scale-105 transition-transform" />
                    <span className="truncate">Hình nền quản lý</span>
                  </div>
                  <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold border border-slate-200">
                    ẢNH NỀN
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Bottom Section: Current Account Info & Status */}
      <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#1e293b] space-y-2.5">

        {/* Firestore Status */}
        <div className="bg-[#F4F6F9] dark:bg-[#131c31] border border-[#E5E7EB] dark:border-[#1e293b] rounded-[8px] p-2.5 text-[12px] text-[#4B5563] dark:text-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5 font-medium text-[#111827] dark:text-slate-200">
              <Cloud className="w-4 h-4 text-[#003366] dark:text-sky-400" />
              Cơ sở dữ liệu:
            </span>
            <span className="text-emerald-700 dark:text-emerald-300 font-semibold font-mono text-[11px] bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              Đồng bộ trực tuyến
            </span>
          </div>
          <div className="flex items-center justify-between text-[12px] text-[#4B5563] dark:text-slate-400">
            <span>Tổng số nhiệm vụ:</span>
            <span className="font-bold font-mono text-[#111827] dark:text-slate-100">{taskCount} việc</span>
          </div>
        </div>

        {/* Current User Card */}
        {currentUser && (
          <div className="bg-[#FFFFFF] dark:bg-[#131c31] border border-[#E5E7EB] dark:border-[#1e293b] rounded-[8px] p-3 transition-colors">
            <div className="flex items-center gap-2.5 mb-2.5 min-w-0">
              <div className="w-8 h-8 rounded-[6px] bg-[#003366] dark:bg-sky-600 text-white flex items-center justify-center font-bold text-[13px] shrink-0">
                {currentUser.fullName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1 truncate">
                <div className="text-[13px] font-bold text-[#111827] dark:text-slate-100 truncate leading-tight">
                  {currentUser.fullName}
                </div>
                <div className="text-[12px] text-[#4B5563] dark:text-slate-400 truncate">
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
              className="w-full py-2 px-2.5 bg-[#F4F6F9] dark:bg-[#1e293b] hover:bg-[#E5E7EB] dark:hover:bg-[#334155] text-[#111827] dark:text-slate-200 rounded-[6px] text-[12px] font-semibold flex items-center justify-center gap-1.5 border border-[#E5E7EB] dark:border-[#334155] transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#4B5563] dark:text-slate-400" />
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
      <aside className="hidden lg:flex w-68 shrink-0 bg-white dark:bg-[#0f172a] border-r border-[#E5E7EB] dark:border-[#1e293b] flex-col sticky top-[102px] h-[calc(100vh-102px)] overflow-y-auto transition-colors">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-start">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-76 max-w-[85vw] bg-white dark:bg-[#0f172a] border-r border-[#E5E7EB] dark:border-[#1e293b] h-full overflow-y-auto z-10 shadow-xl flex flex-col transition-colors">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
