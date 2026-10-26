import React, { useState } from 'react';
import { Task, SectionType, TaskStatus, Directive } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Search, 
  Send, 
  Calendar, 
  User, 
  Users, 
  BarChart3, 
  Kanban, 
  Milestone, 
  AlertOctagon, 
  DollarSign, 
  Building2,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Eye,
  Check,
  Layers,
  Sparkles,
  LayoutGrid,
  ListOrdered,
  Briefcase,
  ChevronRight,
  PlusCircle,
  Edit3,
  Trash2,
  Paperclip,
  SlidersHorizontal,
  Filter,
  X
} from 'lucide-react';
import { 
  getStatusBadgeClasses, 
  getStatusLabel, 
  getPriorityLabel, 
  getSectionShortName, 
  calculateSummary,
  formatDateDisplay
} from '../utils/helpers';
import { STAFF_MEMBERS } from '../data/staffMembers';
import { useAuth } from '../context/AuthContext';
import { useDepartments } from '../context/DepartmentContext';
import { CountUpNumber } from './CountUpNumber';

interface LeaderDashboardProps {
  tasks: Task[];
  onOpenDirectiveModal: (task: Task) => void;
  onOpenTaskDetail: (task: Task) => void;
  onOpenReportForm: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onOpenNotice: () => void;
  onOpenNewTask?: () => void;
  onOpenAttachments?: () => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

export const LeaderDashboard: React.FC<LeaderDashboardProps> = ({
  tasks,
  onOpenDirectiveModal,
  onOpenTaskDetail,
  onOpenReportForm,
  onUpdateTask,
  onOpenNotice,
  onOpenNewTask,
  onOpenAttachments,
  onEditTask,
  onDeleteTask,
}) => {
  const { users } = useAuth();
  const { departments } = useDepartments();
  const summary = calculateSummary(tasks);

  // Cấp 2: Các Menu Chức Năng Phân Cấp Dành Riêng Cho Lãnh Đạo
  const [activeLeaderMenu, setActiveLeaderMenu] = useState<
    'overview' | 'master' | 'bottlenecks' | 'sections' | 'kanban' | 'timeline'
  >('overview');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Mobile-specific UX states
  const [mobileKanbanTab, setMobileKanbanTab] = useState<string>('all');
  const [isMobileMasterFiltersOpen, setIsMobileMasterFiltersOpen] = useState(false);

  const activeMasterFilterCount = 
    (selectedSection !== 'all' ? 1 : 0) +
    (selectedAssignee !== 'all' ? 1 : 0) +
    (selectedStatus !== 'all' ? 1 : 0) +
    (selectedPriority !== 'all' ? 1 : 0);

  // 5 Section Groups
  const sections: SectionType[] = [
    'II. TỔ HÀNH CHÍNH - KẾ TOÁN',
    'III. TỔ DỊCH VỤ CÔNG ÍCH - XÂY DỰNG',
    'IV. CÁC DỰ ÁN ĐẦU TƯ CÔNG TRUNG HẠN',
    'V. CÁC DỰ ÁN ĐẦU TƯ NGÂN SÁCH CHI THƯỜNG XUYÊN',
    'VI. TỔ VĂN HÓA - THỂ THAO - THÔNG TIN - TUYÊN TRUYỀN',
  ];

  // Section stats calculation
  const sectionStats = sections.map((sec) => {
    const secTasks = tasks.filter((t) => t.section === sec);
    const count = secTasks.length;
    const completed = secTasks.filter((t) => t.status === 'completed').length;
    const inProgress = secTasks.filter((t) => t.status === 'in_progress').length;
    const delayed = secTasks.filter((t) => t.status === 'delayed' || t.status === 'paused').length;
    const avgProg = count > 0 ? Math.round(secTasks.reduce((s, t) => s + t.progress, 0) / count) : 0;
    const hasDelay = secTasks.some((t) => t.status === 'delayed' || (t.difficulties && t.difficulties.length > 0));
    return {
      name: sec,
      shortName: getSectionShortName(sec),
      count,
      completed,
      inProgress,
      delayed,
      avgProg,
      hasDelay,
      taskList: secTasks,
    };
  });

  // Filter tasks based on search & filters
  const filteredTasks = tasks.filter((task) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchText = 
        task.title.toLowerCase().includes(q) ||
        task.code.toLowerCase().includes(q) ||
        task.assignee.toLowerCase().includes(q) ||
        task.requirement.toLowerCase().includes(q) ||
        (task.currentReport && task.currentReport.toLowerCase().includes(q));
      if (!matchText) return false;
    }

    if (selectedSection !== 'all') {
      const secNorm = task.section.toLowerCase();
      const selNorm = selectedSection.toLowerCase();
      if (secNorm !== selNorm && !secNorm.includes(selNorm) && !selNorm.includes(secNorm)) {
        return false;
      }
    }

    if (selectedAssignee !== 'all') {
      const assigneeNorm = task.assignee.toLowerCase();
      const targetNorm = selectedAssignee.toLowerCase();
      const matchAssignee = 
        assigneeNorm.includes(targetNorm) || 
        (task.coAssignees && task.coAssignees.some(c => c.toLowerCase().includes(targetNorm))) ||
        (task.leadershipDirector && task.leadershipDirector.toLowerCase().includes(targetNorm));
      if (!matchAssignee) return false;
    }

    if (selectedStatus !== 'all' && task.status !== selectedStatus) {
      return false;
    }

    if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
      return false;
    }

    return true;
  });

  // Critical tasks needing immediate direction
  const urgentTasks = tasks.filter(
    (t) => t.priority === 'urgent' || t.status === 'delayed' || (t.difficulties && t.difficulties.length > 0)
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6 space-y-4 sm:space-y-6">
      
      {/* =========================================================================
          CẤP 1: BANNER ĐIỀU HÀNH & CHỈ ĐẠO CỦA BAN GIÁM ĐỐC
         ========================================================================= */}
      <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-3.5 sm:p-5 shadow-xs font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-3.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-[#003366] text-white rounded-[8px] flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1 text-[11px] sm:text-[12px] text-[#4B5563] flex-wrap">
                <span className="font-bold text-[#003366] uppercase bg-blue-50 px-1.5 py-0.5 rounded-[4px] border border-blue-100">
                  PHÂN HỆ ĐIỀU HÀNH
                </span>
                <span className="hidden xs:inline">·</span>
                <span>Chủ trì: <strong className="text-[#111827]">Đ/c Phong (GĐ)</strong></span>
                <span>·</span>
                <span>PGĐ: <strong className="text-[#111827]">Đ/c Tuyến</strong></span>
              </div>
              <h2 className="text-[17px] sm:text-[20px] font-bold tracking-tight text-[#111827]">
                Trung Tâm Chỉ Đạo & Giám Sát Nhiệm Vụ
              </h2>
              <p className="text-[12px] sm:text-[14px] text-[#4B5563] mt-0.5 sm:mt-1 max-w-2xl leading-relaxed">
                Theo dõi và kiểm soát toàn diện các nhiệm vụ giao ban. Phân công giao việc cho từng nhân viên, phát lệnh chỉ đạo đôn đốc và tháo gỡ vướng mắc.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={onOpenNotice}
              className="w-full sm:w-auto justify-center px-3.5 py-2.5 bg-[#003366] hover:bg-[#002244] text-white font-medium rounded-[8px] text-[13px] sm:text-[14px] flex items-center gap-2 transition-colors cursor-pointer shadow-xs min-h-[40px]"
            >
              <FileText className="w-4 h-4 text-blue-200" />
              <span>Xem Văn Bản Kết Luận</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CẤP 2: HỆ THỐNG MENU PHÂN CẤP CHUYÊN BIỆT DÀNH CHO LÃNH ĐẠO (BAN GIÁM ĐỐC)
         ========================================================================= */}
      <div className="bg-white rounded-[8px] border border-[#E5E7EB] shadow-xs p-3 sm:p-4 space-y-2.5 sm:space-y-3 font-sans">
        
        {/* 1. Dải Breadcrumb Phân Cấp Cấp Bậc (Hierarchy Breadcrumb) */}
        <div className="flex items-center justify-between flex-wrap gap-1.5 pb-2 border-b border-[#E5E7EB] text-[11px] sm:text-[13px]">
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap text-[11px] sm:text-[12px] text-[#4B5563]">
            <span className="hidden sm:inline">UBND P. Hố Nai</span>
            <ChevronRight className="w-3 h-3 text-gray-400 shrink-0 hidden sm:inline" />
            <span className="font-semibold text-[#111827]">Phân Hệ Lãnh Đạo</span>
            <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
            <span className="hidden xs:inline">
              {activeLeaderMenu === 'overview' || activeLeaderMenu === 'bottlenecks' || activeLeaderMenu === 'sections'
                ? 'Nhóm 1: Giám sát'
                : 'Nhóm 2: Điều hành'}
            </span>
            <ChevronRight className="w-3 h-3 text-gray-400 shrink-0 hidden xs:inline" />
            <span className="font-bold text-[#003366]">
              {activeLeaderMenu === 'overview' && '1.1 Tổng Quan KPI & Tiến Độ'}
              {activeLeaderMenu === 'bottlenecks' && (
                <span>1.2 Radar Đôn Đốc (<CountUpNumber value={urgentTasks.length} /> Vướng Mắc)</span>
              )}
              {activeLeaderMenu === 'sections' && '1.3 Giám Sát 5 Tổ Chuyên Môn'}
              {activeLeaderMenu === 'master' && (
                <span>2.1 Bảng Phân Công (<CountUpNumber value={tasks.length} /> Nhiệm Vụ)</span>
              )}
              {activeLeaderMenu === 'kanban' && '2.2 Bảng Kanban Trực Quan'}
              {activeLeaderMenu === 'timeline' && '2.3 Lộ Trình & Dòng Thời Gian'}
            </span>
          </div>

          <div className="text-[11px] sm:text-[12px] text-[#4B5563]">
            Chỉ đạo: <strong className="text-[#111827]">Giám đốc</strong>
          </div>
        </div>

        {/* 2. Menu Phân Cấp Theo 2 Nhóm Chức Năng Cốt Lõi Của Lãnh Đạo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-3">
          
          {/* Nhóm 1: CHỈ ĐẠO & GIÁM SÁT TIẾN ĐỘ (6 cols) */}
          <div className="lg:col-span-6 bg-[#F4F6F9] p-2.5 sm:p-3 rounded-[8px] border border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2 px-1">
              <span className="text-[11px] sm:text-[12px] font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-[#003366]" />
                NHÓM 1: CHỈ ĐẠO & GIÁM SÁT
              </span>
              <span className="text-[11px] sm:text-[12px] text-[#4B5563] hidden xs:inline">Tiến độ</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              
              {/* Menu 1.1 */}
              <button
                type="button"
                onClick={() => setActiveLeaderMenu('overview')}
                className={`p-2 sm:p-3 rounded-[8px] text-left transition-colors cursor-pointer flex flex-col justify-between border ${
                  activeLeaderMenu === 'overview'
                    ? 'bg-[#003366] text-white border-[#003366] font-semibold shadow-xs'
                    : 'bg-white hover:bg-[#F4F6F9] text-[#111827] border-[#E5E7EB]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <BarChart3 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeLeaderMenu === 'overview' ? 'text-white' : 'text-[#4B5563]'}`} />
                  <span className={`text-[10px] sm:text-[12px] font-mono px-1 sm:px-1.5 py-0.2 rounded font-bold ${
                    activeLeaderMenu === 'overview' ? 'bg-white/20 text-white' : 'bg-[#F4F6F9] text-[#4B5563]'
                  }`}>
                    1.1
                  </span>
                </div>
                <span className="text-[12px] sm:text-[14px] font-semibold leading-tight line-clamp-1">Tổng quan KPI</span>
                <span className={`text-[10px] sm:text-[12px] mt-0.5 sm:mt-1 truncate ${activeLeaderMenu === 'overview' ? 'text-blue-100' : 'text-[#4B5563]'}`}>
                  <CountUpNumber value={tasks.length} suffix=" việc" />
                </span>
              </button>

              {/* Menu 1.2 */}
              <button
                type="button"
                onClick={() => setActiveLeaderMenu('bottlenecks')}
                className={`p-2 sm:p-3 rounded-[8px] text-left transition-colors cursor-pointer flex flex-col justify-between border ${
                  activeLeaderMenu === 'bottlenecks'
                    ? 'bg-[#003366] text-white border-[#003366] font-semibold shadow-xs'
                    : 'bg-white hover:bg-[#F4F6F9] text-[#111827] border-[#E5E7EB]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <AlertOctagon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeLeaderMenu === 'bottlenecks' ? 'text-white' : 'text-[#D32F2F]'}`} />
                  <span className={`text-[10px] sm:text-[12px] font-mono px-1 sm:px-1.5 py-0.2 rounded font-bold ${
                    activeLeaderMenu === 'bottlenecks' ? 'bg-white/20 text-white' : 'bg-red-50 text-[#D32F2F]'
                  }`}>
                    <CountUpNumber value={urgentTasks.length} />
                  </span>
                </div>
                <span className="text-[12px] sm:text-[14px] font-semibold leading-tight line-clamp-1">Radar đôn đốc</span>
                <span className={`text-[10px] sm:text-[12px] mt-0.5 sm:mt-1 truncate ${activeLeaderMenu === 'bottlenecks' ? 'text-blue-100' : 'text-[#4B5563]'}`}>
                  Điểm nghẽn
                </span>
              </button>

              {/* Menu 1.3 */}
              <button
                type="button"
                onClick={() => setActiveLeaderMenu('sections')}
                className={`p-2 sm:p-3 rounded-[8px] text-left transition-colors cursor-pointer flex flex-col justify-between border ${
                  activeLeaderMenu === 'sections'
                    ? 'bg-[#003366] text-white border-[#003366] font-semibold shadow-xs'
                    : 'bg-white hover:bg-[#F4F6F9] text-[#111827] border-[#E5E7EB]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Building2 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeLeaderMenu === 'sections' ? 'text-white' : 'text-[#4B5563]'}`} />
                  <span className={`text-[10px] sm:text-[12px] font-mono px-1 sm:px-1.5 py-0.2 rounded font-bold ${
                    activeLeaderMenu === 'sections' ? 'bg-white/20 text-white' : 'bg-[#F4F6F9] text-[#4B5563]'
                  }`}>
                    1.3
                  </span>
                </div>
                <span className="text-[12px] sm:text-[14px] font-semibold leading-tight line-clamp-1">Giám sát 5 tổ</span>
                <span className={`text-[10px] sm:text-[12px] mt-0.5 sm:mt-1 truncate ${activeLeaderMenu === 'sections' ? 'text-blue-100' : 'text-[#4B5563]'}`}>
                  5 bộ phận
                </span>
              </button>

            </div>
          </div>

          {/* Nhóm 2: PHÂN CÔNG GIAO VIỆC & LỘ TRÌNH (6 cols) */}
          <div className="lg:col-span-6 bg-[#F4F6F9] p-2.5 sm:p-3 rounded-[8px] border border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2 px-1">
              <span className="text-[11px] sm:text-[12px] font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#003366]" />
                NHÓM 2: PHÂN CÔNG & LỘ TRÌNH
              </span>
              <span className="text-[11px] sm:text-[12px] text-[#4B5563] hidden xs:inline">Điều hành</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              
              {/* Menu 2.1 */}
              <button
                type="button"
                onClick={() => setActiveLeaderMenu('master')}
                className={`p-2 sm:p-3 rounded-[8px] text-left transition-colors cursor-pointer flex flex-col justify-between border ${
                  activeLeaderMenu === 'master'
                    ? 'bg-[#003366] text-white border-[#003366] font-semibold shadow-xs'
                    : 'bg-white hover:bg-[#F4F6F9] text-[#111827] border-[#E5E7EB]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <ListOrdered className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeLeaderMenu === 'master' ? 'text-white' : 'text-[#4B5563]'}`} />
                  <span className={`text-[10px] sm:text-[12px] font-mono px-1 sm:px-1.5 py-0.2 rounded font-bold ${
                    activeLeaderMenu === 'master' ? 'bg-white/20 text-white' : 'bg-[#F4F6F9] text-[#4B5563]'
                  }`}>
                    <CountUpNumber value={filteredTasks.length} />
                  </span>
                </div>
                <span className="text-[12px] sm:text-[14px] font-semibold leading-tight line-clamp-1">Phân công</span>
                <span className={`text-[10px] sm:text-[12px] mt-0.5 sm:mt-1 truncate ${activeLeaderMenu === 'master' ? 'text-blue-100' : 'text-[#4B5563]'}`}>
                  Theo cán bộ
                </span>
              </button>

              {/* Menu 2.2 */}
              <button
                type="button"
                onClick={() => setActiveLeaderMenu('kanban')}
                className={`p-2 sm:p-3 rounded-[8px] text-left transition-colors cursor-pointer flex flex-col justify-between border ${
                  activeLeaderMenu === 'kanban'
                    ? 'bg-[#003366] text-white border-[#003366] font-semibold shadow-xs'
                    : 'bg-white hover:bg-[#F4F6F9] text-[#111827] border-[#E5E7EB]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Kanban className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeLeaderMenu === 'kanban' ? 'text-white' : 'text-[#4B5563]'}`} />
                  <span className={`text-[10px] sm:text-[12px] font-mono px-1 sm:px-1.5 py-0.2 rounded font-bold ${
                    activeLeaderMenu === 'kanban' ? 'bg-white/20 text-white' : 'bg-[#F4F6F9] text-[#4B5563]'
                  }`}>
                    2.2
                  </span>
                </div>
                <span className="text-[12px] sm:text-[14px] font-semibold leading-tight line-clamp-1">Bảng Kanban</span>
                <span className={`text-[10px] sm:text-[12px] mt-0.5 sm:mt-1 truncate ${activeLeaderMenu === 'kanban' ? 'text-blue-100' : 'text-[#4B5563]'}`}>
                  5 cột tiến độ
                </span>
              </button>

              {/* Menu 2.3 */}
              <button
                type="button"
                onClick={() => setActiveLeaderMenu('timeline')}
                className={`p-2 sm:p-3 rounded-[8px] text-left transition-colors cursor-pointer flex flex-col justify-between border ${
                  activeLeaderMenu === 'timeline'
                    ? 'bg-[#003366] text-white border-[#003366] font-semibold shadow-xs'
                    : 'bg-white hover:bg-[#F4F6F9] text-[#111827] border-[#E5E7EB]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Milestone className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeLeaderMenu === 'timeline' ? 'text-white' : 'text-[#4B5563]'}`} />
                  <span className={`text-[10px] sm:text-[12px] font-mono px-1 sm:px-1.5 py-0.2 rounded font-bold ${
                    activeLeaderMenu === 'timeline' ? 'bg-white/20 text-white' : 'bg-[#F4F6F9] text-[#4B5563]'
                  }`}>
                    2.3
                  </span>
                </div>
                <span className="text-[12px] sm:text-[14px] font-semibold leading-tight line-clamp-1">Dòng thời gian</span>
                <span className={`text-[10px] sm:text-[12px] mt-0.5 sm:mt-1 truncate ${activeLeaderMenu === 'timeline' ? 'text-blue-100' : 'text-[#4B5563]'}`}>
                  Lịch trình
                </span>
              </button>

            </div>
          </div>

        </div>

        {/* Nhóm 3: TÁC VỤ ĐIỀU HÀNH & KẾT LUẬN GIAO BAN */}
        <div className="pt-2 border-t border-[#E5E7EB] space-y-2">
          <div className="flex items-center justify-between text-[11px] sm:text-[12px]">
            <span className="font-bold text-[#4B5563] uppercase tracking-wider">
              TÁC VỤ ĐIỀU HÀNH LÃNH ĐẠO
            </span>
            <span className="text-[#4B5563] text-[11px] hidden sm:inline">Phím tắt thao tác nhanh</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-2">
            {onOpenNewTask && (
              <button
                type="button"
                onClick={onOpenNewTask}
                className="px-2.5 sm:px-3.5 py-2 rounded-[8px] bg-[#003366] hover:bg-[#002244] text-white font-medium text-[12px] sm:text-[13px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs min-h-[38px]"
              >
                <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">Giao việc</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenNotice}
              className="px-2.5 sm:px-3.5 py-2 rounded-[8px] bg-white hover:bg-[#F4F6F9] text-[#111827] border border-[#E5E7EB] font-medium text-[12px] sm:text-[13px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[38px]"
            >
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4B5563] shrink-0" />
              <span className="truncate">Kết luận</span>
            </button>
            {onOpenAttachments && (
              <button
                type="button"
                onClick={onOpenAttachments}
                className="px-2.5 sm:px-3.5 py-2 rounded-[8px] bg-white hover:bg-[#F4F6F9] text-[#111827] border border-[#E5E7EB] font-medium text-[12px] sm:text-[13px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[38px]"
              >
                <Paperclip className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4B5563] shrink-0" />
                <span className="truncate">Đính kèm ({tasks.reduce((sum, t) => sum + (t.relatedDocs ? t.relatedDocs.length : 0), 0)})</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* =========================================================================
          NỘI DUNG TƯƠNG ỨNG TỪNG MENU CỦA LÃNH ĐẠO
         ========================================================================= */}

      {/* --- MENU 1: TỔNG QUAN KPI & BẢN ĐỒ TIẾN ĐỘ --- */}
      {activeLeaderMenu === 'overview' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
            <div className="bg-white p-3 sm:p-4 rounded-[8px] border border-[#E5E7EB] shadow-xs">
              <div className="flex items-center justify-between text-[#4B5563] text-[12px] sm:text-[13px] mb-1">
                <span className="font-semibold text-[#111827] text-[13px] sm:text-[15px]">Tổng nhiệm vụ</span>
                <Building2 className="w-4 h-4 text-[#003366]" />
              </div>
              <div className="flex items-baseline gap-1.5 sm:gap-2">
                <CountUpNumber 
                  value={summary.total} 
                  className="text-[22px] sm:text-[28px] font-bold text-[#003366] font-mono tabular-nums" 
                />
                <span className="text-[11px] sm:text-[12px] text-[#4B5563] font-medium">100% việc</span>
              </div>
              <div className="mt-1.5 text-[11px] sm:text-[12px] text-[#4B5563] truncate">5 tổ chuyên môn</div>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-[8px] border border-[#E5E7EB] shadow-xs">
              <div className="flex items-center justify-between text-[#4B5563] text-[12px] sm:text-[13px] mb-1">
                <span className="font-semibold text-[#111827] text-[13px] sm:text-[15px]">Đã hoàn thành</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-1.5 sm:gap-2">
                <CountUpNumber 
                  value={summary.completed} 
                  className="text-[22px] sm:text-[28px] font-bold text-emerald-700 font-mono tabular-nums" 
                />
                <span className="text-[11px] sm:text-[12px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-[4px] border border-emerald-200">
                  (<CountUpNumber value={summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0} suffix="%" />)
                </span>
              </div>
              <div className="mt-1.5 text-[11px] sm:text-[12px] text-[#4B5563] truncate">Đã nghiệm thu / xong</div>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-[8px] border border-[#E5E7EB] shadow-xs">
              <div className="flex items-center justify-between text-[#4B5563] text-[12px] sm:text-[13px] mb-1">
                <span className="font-semibold text-[#111827] text-[13px] sm:text-[15px]">Đang triển khai</span>
                <Clock className="w-4 h-4 text-[#1D4ED8]" />
              </div>
              <div className="flex items-baseline gap-1.5 sm:gap-2">
                <CountUpNumber 
                  value={summary.inProgress} 
                  className="text-[22px] sm:text-[28px] font-bold text-[#1D4ED8] font-mono tabular-nums" 
                />
                <span className="text-[11px] sm:text-[12px] font-semibold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded-[4px] border border-blue-200">
                  (<CountUpNumber value={summary.total > 0 ? Math.round((summary.inProgress / summary.total) * 100) : 0} suffix="%" />)
                </span>
              </div>
              <div className="mt-1.5 text-[11px] sm:text-[12px] text-[#4B5563] truncate">Theo đúng lộ trình</div>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-[8px] border border-[#E5E7EB] shadow-xs">
              <div className="flex items-center justify-between text-[#4B5563] text-[12px] sm:text-[13px] mb-1">
                <span className="font-semibold text-[#111827] text-[13px] sm:text-[15px]">Vướng mắc / Chậm</span>
                <AlertTriangle className="w-4 h-4 text-[#D32F2F]" />
              </div>
              <div className="flex items-baseline gap-1.5 sm:gap-2">
                <CountUpNumber 
                  value={summary.delayed + summary.paused} 
                  className="text-[22px] sm:text-[28px] font-bold text-[#D32F2F] font-mono tabular-nums" 
                />
                <span className="text-[11px] sm:text-[12px] font-semibold text-[#D32F2F] bg-red-50 px-1.5 py-0.5 rounded-[4px] border border-red-200">cần chỉ đạo</span>
              </div>
              <div className="mt-1.5 text-[11px] sm:text-[12px] text-[#4B5563] truncate">Thời tiết, vốn, thủ tục</div>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-[8px] border border-[#E5E7EB] shadow-xs col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between text-[#4B5563] text-[12px] sm:text-[13px] mb-1">
                <span className="font-semibold text-[#111827] text-[13px] sm:text-[15px]">Tiến độ chung</span>
                <TrendingUp className="w-4 h-4 text-[#003366]" />
              </div>
              <div className="flex items-baseline gap-2">
                <CountUpNumber 
                  value={summary.avgProgress} 
                  suffix="%" 
                  className="text-[22px] sm:text-[28px] font-bold text-[#111827] font-mono tabular-nums" 
                />
                <span className="text-[11px] sm:text-[12px] text-[#4B5563] font-medium bg-[#F4F6F9] px-1.5 py-0.5 rounded-[4px] border border-[#E5E7EB]">toàn đơn vị</span>
              </div>
              <div className="mt-2 bg-[#F4F6F9] rounded-full h-2 overflow-hidden border border-[#E5E7EB]">
                <div className="bg-[#003366] h-full rounded-full transition-all" style={{ width: `${summary.avgProgress}%` }} />
              </div>
            </div>
          </div>

          {/* Tiến độ 5 khối tóm tắt */}
          <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-3.5 sm:p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-3">
              <h3 className="font-bold text-[#111827] text-[14px] sm:text-[15px] uppercase tracking-wider">
                Tiến độ thực hiện theo 5 Khối công tác:
              </h3>
              <button
                type="button"
                onClick={() => setActiveLeaderMenu('sections')}
                className="text-[12px] sm:text-[13px] text-[#003366] font-bold hover:underline cursor-pointer self-start sm:self-auto"
              >
                Xem chi tiết 5 khối →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
              {sectionStats.map((sec) => (
                <div key={sec.name} className="p-2.5 sm:p-3 bg-[#F4F6F9] rounded-[8px] border border-[#E5E7EB] text-[13px] space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between font-bold text-[#111827]">
                    <span className="truncate pr-1 text-[12px] sm:text-[13px]">{sec.shortName}</span>
                    <CountUpNumber 
                      value={sec.count} 
                      suffix=" việc" 
                      className="font-mono text-[#003366] font-bold text-[12px]" 
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-[#003366] h-full rounded-full" style={{ width: `${sec.avgProg}%` }} />
                    </div>
                    <CountUpNumber 
                      value={sec.avgProg} 
                      suffix="%" 
                      className="font-mono text-[12px] font-bold text-[#111827]" 
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] sm:text-[12px] text-[#4B5563]">
                    <span>Xong: <strong className="text-[#111827]"><CountUpNumber value={sec.completed} /></strong></span>
                    {sec.hasDelay && <span className="text-[#D32F2F] font-semibold">Có vướng mắc</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Hub Preview */}
          {urgentTasks.length > 0 && (
            <div className="bg-red-50/70 border border-red-200 rounded-[8px] p-3.5 sm:p-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2.5">
                <div className="flex items-start sm:items-center gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-[#D32F2F] shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <h3 className="font-bold text-[#111827] text-[14px] sm:text-[15px]">
                      Nhiệm Vụ Cần Ban Giám Đốc Chỉ Đạo Đôn Đốc Ngay (<CountUpNumber value={urgentTasks.length} /> việc)
                    </h3>
                    <p className="text-[11px] sm:text-[12px] text-[#4B5563]">Các việc bị ảnh hưởng do mưa lũ, cấp vốn hoặc sắp đến hạn chót</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveLeaderMenu('bottlenecks')}
                  className="w-full sm:w-auto px-3.5 py-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white rounded-[8px] text-[12px] sm:text-[13px] font-bold cursor-pointer transition-colors text-center"
                >
                  Mở Trung Tâm Đôn Đốc →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                {urgentTasks.slice(0, 3).map((t) => (
                  <div key={t.id} className="bg-white rounded-[8px] border border-red-200 p-3 sm:p-3.5 text-[13px] sm:text-[14px] flex flex-col justify-between shadow-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono font-bold text-[#D32F2F] bg-red-50 px-2 py-0.5 rounded-[4px] text-[11px] sm:text-[12px]">{t.code}</span>
                        <span className="text-[11px] sm:text-[12px] text-[#4B5563] font-medium">Phụ trách: <strong className="text-[#111827]">{t.assignee}</strong></span>
                      </div>
                      <h4 className="font-semibold text-[#111827] line-clamp-2 mt-1 text-[13px] sm:text-[14px] leading-snug">{t.title}</h4>
                      {t.difficulties && (
                        <div className="mt-2 bg-red-50 text-[#D32F2F] p-2 rounded-[6px] text-[11px] sm:text-[12px] border border-red-100">
                          <strong>Vướng mắc:</strong> {t.difficulties}
                        </div>
                      )}
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-[#E5E7EB] flex items-center justify-between gap-2">
                      <div className="text-[11px] sm:text-[12px] text-[#4B5563] font-mono truncate">
                        <span>Hạn: {t.deadline ? formatDateDisplay(t.deadline) : 'Tiến độ'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onOpenDirectiveModal(t)}
                        className="px-2.5 py-1.5 bg-[#003366] hover:bg-[#002244] text-white rounded-[6px] text-[11px] sm:text-[12px] font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Send className="w-3 h-3 text-blue-200" />
                        <span>Chỉ đạo</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- MENU 2: DANH MỤC PHÂN CÔNG GIAO VIỆC (MASTER TABLE) --- */}
      {activeLeaderMenu === 'master' && (
        <div className="space-y-3 sm:space-y-4">
          {/* Cấp 3: Thanh Lọc & Tìm Kiếm Ngữ Cảnh */}
          <div className="bg-white p-3 sm:p-4 rounded-[8px] border border-[#E5E7EB] shadow-xs space-y-2.5 sm:space-y-3">
            {/* Search Input + Mobile Filter Toggle */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#4B5563] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo tên công trình, mã, nội dung, cán bộ..."
                  className="w-full pl-9 pr-8 py-2 bg-[#F4F6F9] border border-[#E5E7EB] rounded-[8px] text-[13px] sm:text-[14px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366] focus:bg-white"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Mobile Filter Toggle Button */}
              <button
                type="button"
                onClick={() => setIsMobileMasterFiltersOpen(!isMobileMasterFiltersOpen)}
                className={`md:hidden px-3 py-2 rounded-[8px] border text-[12px] font-medium flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer min-h-[38px] ${
                  activeMasterFilterCount > 0 || isMobileMasterFiltersOpen
                    ? 'bg-[#003366] text-white border-[#003366]'
                    : 'bg-white text-[#111827] border-[#E5E7EB] hover:bg-[#F4F6F9]'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Lọc</span>
                {activeMasterFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-400 text-[#003366] font-bold text-[10px] flex items-center justify-center">
                    {activeMasterFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Filter Dropdowns: Responsive Grid (Collapsible on mobile) */}
            <div className={`${isMobileMasterFiltersOpen ? 'grid' : 'hidden'} md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-2 sm:gap-3 text-[13px] pt-2 md:pt-0 border-t border-[#E5E7EB] md:border-t-0`}>
              <div className="md:col-span-4">
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full py-2 px-3 bg-[#F4F6F9] border border-[#E5E7EB] rounded-[8px] text-[12px] sm:text-[13px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366] cursor-pointer"
                >
                  <option value="all">Tất cả Khối / Tổ công tác ({departments.length})</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.code ? `[${d.code}] ` : ''}{d.shortName || d.name}
                    </option>
                  ))}
                  {sections.filter(s => !departments.some(d => d.name === s || s.includes(d.name))).map((s) => (
                    <option key={s} value={s}>{getSectionShortName(s)}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="w-full py-2 px-3 bg-[#F4F6F9] border border-[#E5E7EB] rounded-[8px] text-[12px] sm:text-[13px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366] cursor-pointer"
                >
                  <option value="all">Tất cả Cán bộ ({users.length})</option>
                  <optgroup label="── Cán bộ / Viên chức ──">
                    {users.filter(u => !u.isLeader).map((u) => {
                      const filterVal = u.shortName ? u.shortName.replace(/đ\/c\s*/i, '').trim() : u.fullName;
                      return (
                        <option key={u.id} value={filterVal}>
                          {u.shortName || u.fullName}
                        </option>
                      );
                    })}
                  </optgroup>
                  <optgroup label="── Ban Giám Đốc ──">
                    {users.filter(u => u.isLeader).map((u) => {
                      const filterVal = u.shortName ? u.shortName.replace(/đ\/c\s*/i, '').trim() : u.fullName;
                      return (
                        <option key={u.id} value={filterVal}>
                          {u.shortName || u.fullName}
                        </option>
                      );
                    })}
                  </optgroup>
                </select>
              </div>

              <div className="md:col-span-3">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full py-2 px-3 bg-[#F4F6F9] border border-[#E5E7EB] rounded-[8px] text-[12px] sm:text-[13px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366] cursor-pointer"
                >
                  <option value="all">Tất cả Trạng thái</option>
                  <option value="in_progress">Đang triển khai</option>
                  <option value="completed">Đã hoàn thành</option>
                  <option value="delayed">Chậm / Vướng mắc</option>
                  <option value="pending_input">Chờ phê duyệt/ý kiến</option>
                  <option value="paused">Tạm dừng</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full py-2 px-2 bg-[#F4F6F9] border border-[#E5E7EB] rounded-[8px] text-[12px] sm:text-[13px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366] cursor-pointer"
                >
                  <option value="all">Mức ưu tiên</option>
                  <option value="urgent">Hỏa tốc</option>
                  <option value="high">Cao</option>
                  <option value="normal">Bình thường</option>
                </select>
              </div>

              {/* Reset filter button on mobile */}
              {activeMasterFilterCount > 0 && (
                <div className="md:hidden flex justify-end pt-1 sm:col-span-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSection('all');
                      setSelectedAssignee('all');
                      setSelectedStatus('all');
                      setSelectedPriority('all');
                    }}
                    className="text-[12px] text-[#D32F2F] hover:underline font-semibold"
                  >
                    Xóa tất cả điều kiện lọc ({activeMasterFilterCount})
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Master View: Mobile Task Cards (md:hidden) */}
          <div className="md:hidden space-y-2.5">
            {filteredTasks.length === 0 ? (
              <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-8 text-center text-[#4B5563] text-[13px]">
                {tasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="font-semibold text-[#111827]">Hệ thống chưa có nhiệm vụ nào.</span>
                    <span className="text-[12px] text-[#4B5563]">Lãnh đạo có thể bắt đầu giao nhiệm vụ mới ngay.</span>
                    {onOpenNewTask && (
                      <button
                        type="button"
                        onClick={onOpenNewTask}
                        className="mt-2 px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white rounded-[6px] text-[13px] font-bold cursor-pointer transition-colors"
                      >
                        + Giao Nhiệm Vụ Mới
                      </button>
                    )}
                  </div>
                ) : (
                  <span>Không tìm thấy nhiệm vụ nào phù hợp với bộ lọc hiện tại.</span>
                )}
              </div>
            ) : (
              filteredTasks.map((task) => {
                const hasDirective = task.leaderDirectives && task.leaderDirectives.length > 0;
                return (
                  <div key={task.id} className="bg-white rounded-[8px] border border-[#E5E7EB] p-3.5 shadow-xs space-y-2.5">
                    {/* Top row: Code + Priority badge + Status badge */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-bold text-[#003366] bg-blue-50 px-2 py-0.5 rounded text-[11px] border border-blue-200">
                          {task.code}
                        </span>
                        {task.priority === 'urgent' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-[#D32F2F] border border-red-200">
                            Hỏa tốc
                          </span>
                        )}
                        {task.priority === 'high' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            Ưu tiên cao
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded-[4px] text-[11px] font-medium shrink-0 ${getStatusBadgeClasses(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                    </div>

                    {/* Title */}
                    <h4
                      onClick={() => onOpenTaskDetail(task)}
                      className="font-semibold text-[#111827] text-[14px] leading-snug hover:text-[#003366] cursor-pointer"
                    >
                      {task.title}
                    </h4>

                    {/* Department / Section tag */}
                    <div className="text-[11px] text-[#4B5563] truncate">
                      {getSectionShortName(task.section)}
                    </div>

                    {/* Assignee & Dates */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5E7EB] text-[12px]">
                      <div>
                        <span className="text-[#6B7280] block text-[11px]">Cán bộ phụ trách:</span>
                        <span className="font-semibold text-[#111827]">{task.assignee}</span>
                      </div>
                      <div>
                        <span className="text-[#6B7280] block text-[11px]">Hạn hoàn thành:</span>
                        <span className={`font-mono font-medium ${task.status === 'delayed' ? 'text-[#D32F2F]' : 'text-[#111827]'}`}>
                          {task.deadline ? formatDateDisplay(task.deadline) : 'Theo tiến độ'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#6B7280]">Tiến độ công việc</span>
                        <span className="font-mono font-bold text-[#003366]">{task.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            task.progress === 100
                              ? 'bg-emerald-600'
                              : task.status === 'delayed'
                              ? 'bg-[#D32F2F]'
                              : 'bg-[#003366]'
                          }`}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Difficulties / Directives */}
                    {task.difficulties && (
                      <div className="bg-red-50 text-[#D32F2F] p-2 rounded-[6px] text-[11px] border border-red-100">
                        <strong>Vướng:</strong> {task.difficulties}
                      </div>
                    )}
                    {hasDirective && (
                      <div className="bg-blue-50 text-[#003366] p-2 rounded-[6px] text-[11px] border border-blue-200">
                        <strong>Chỉ đạo GĐ:</strong> {task.leaderDirectives[0].content}
                      </div>
                    )}

                    {/* Actions Footer */}
                    <div className="pt-2 border-t border-[#E5E7EB] flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenDirectiveModal(task)}
                        className="flex-1 py-2 bg-[#003366] hover:bg-[#002244] text-white rounded-[6px] text-[12px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs min-h-[36px]"
                      >
                        <Send className="w-3.5 h-3.5 text-blue-200" />
                        <span>Chỉ đạo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenTaskDetail(task)}
                        className="flex-1 py-2 bg-[#F4F6F9] hover:bg-gray-200 text-[#111827] border border-[#E5E7EB] rounded-[6px] text-[12px] font-medium flex items-center justify-center gap-1.5 cursor-pointer min-h-[36px]"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#4B5563]" />
                        <span>Xem chi tiết</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Master Table: Desktop View (hidden md:block) */}
          <div className="hidden md:block bg-white rounded-[8px] border border-[#E5E7EB] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[14px]">
                <thead className="bg-[#F4F6F9] text-[#111827] uppercase font-bold text-[12px] tracking-wider border-b border-[#E5E7EB]">
                  <tr>
                    <th className="py-3 px-3.5 w-16">Mã</th>
                    <th className="py-3 px-3.5 w-72">Tên Nhiệm Vụ</th>
                    <th className="py-3 px-3.5 w-40">Cán Bộ Phụ Trách</th>
                    <th className="py-3 px-3.5 min-w-[140px]">Ngày Giao & Hạn Định</th>
                    <th className="py-3 px-3.5 w-32">Tiến Độ %</th>
                    <th className="py-3 px-3.5 w-32">Trạng Thái</th>
                    <th className="py-3 px-3.5 min-w-56">Báo Cáo & Vướng Mắc</th>
                    <th className="py-3 px-3.5 w-36 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#4B5563] text-[14px]">
                        {tasks.length === 0 ? (
                          <div className="flex flex-col items-center justify-center gap-2">
                            <span className="font-semibold text-[#111827]">Hệ thống chưa có nhiệm vụ nào.</span>
                            <span className="text-[13px] text-[#4B5563]">Dữ liệu mẫu đã được xóa sạch. Lãnh đạo có thể bắt đầu giao nhiệm vụ mới ngay bây giờ.</span>
                            {onOpenNewTask && (
                              <button
                                type="button"
                                onClick={onOpenNewTask}
                                className="mt-2 px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white rounded-[6px] text-[13px] font-bold cursor-pointer transition-colors"
                              >
                                + Giao Nhiệm Vụ Mới
                              </button>
                            )}
                          </div>
                        ) : (
                          'Không tìm thấy nhiệm vụ nào phù hợp với bộ lọc tìm kiếm.'
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((task) => {
                      const hasDirective = task.leaderDirectives && task.leaderDirectives.length > 0;
                      return (
                        <tr key={task.id} className="hover:bg-[#F4F6F9]/60 transition-colors">
                          <td className="py-3.5 px-3.5 align-top">
                            <span className="font-mono font-bold text-[#003366] bg-blue-50 px-2 py-0.5 rounded text-[12px] border border-blue-200">
                              {task.code}
                            </span>
                          </td>
                          <td className="py-3.5 px-3.5 align-top">
                            <span className="text-[12px] text-[#4B5563] block font-medium">{getSectionShortName(task.section)}</span>
                            <span className="font-semibold text-[#111827] text-[14px] block leading-snug">{task.title}</span>
                            <div className="flex items-center gap-1.5 flex-wrap mt-1">
                              {task.budgetInfo && (
                                <span className="font-mono text-[12px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  {task.budgetInfo}
                                </span>
                              )}
                              {task.relatedDocs && task.relatedDocs.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => onOpenTaskDetail(task)}
                                  className="inline-flex items-center gap-1 font-mono text-[12px] text-[#003366] bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors cursor-pointer"
                                  title="Xem và tải các file đính kèm của nhiệm vụ này"
                                >
                                  <Paperclip className="w-3.5 h-3.5 text-[#003366]" />
                                  <span>{task.relatedDocs.length} file đính kèm</span>
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-3.5 align-top">
                            <strong className="text-[#111827] text-[14px] block">{task.assignee}</strong>
                            {task.coAssignees && task.coAssignees.length > 0 && (
                              <span className="text-[12px] text-[#4B5563] block">+{task.coAssignees.join(', ')}</span>
                            )}
                            {task.leadershipDirector && (
                              <span className="text-[12px] text-amber-900 font-medium block">{task.leadershipDirector}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-3.5 align-top text-[13px]">
                            <div className="flex items-center gap-1.5 text-[12px] text-[#4B5563]" title="Ngày phân công nhiệm vụ">
                              <Calendar className="w-3.5 h-3.5 text-[#003366] shrink-0" />
                              <span>Giao: <strong className="font-mono text-[#111827]">{formatDateDisplay(task.assignedDate || task.startDate)}</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[12px] mt-1 font-mono text-[#111827]" title="Thời hạn hoàn thành (Hạn định)">
                              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>Hạn: <strong className={task.deadline ? 'text-[#111827]' : 'text-[#4B5563]'}>{task.deadline ? formatDateDisplay(task.deadline) : 'Theo tiến độ'}</strong></span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3.5 align-top">
                            <div className="flex items-center gap-1.5">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${task.progress === 100 ? 'bg-emerald-600' : 'bg-[#003366]'}`}
                                  style={{ width: `${task.progress}%` }}
                                />
                              </div>
                              <span className="font-mono font-bold text-[#111827] text-[13px] tabular-nums">{task.progress}%</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3.5 align-top">
                            <span className={`inline-block px-2.5 py-0.5 rounded-[4px] text-[12px] font-medium ${getStatusBadgeClasses(task.status)}`}>
                              {getStatusLabel(task.status)}
                            </span>
                            {task.priority === 'urgent' && (
                              <span className="inline-block ml-1 text-[12px] font-bold text-[#D32F2F]">HỎA TỐC</span>
                            )}
                          </td>
                          <td className="py-3.5 px-3.5 align-top text-[14px]">
                            <p className="text-[#111827] line-clamp-2 leading-relaxed">{task.currentReport || 'Đang cập nhật...'}</p>
                            {task.difficulties && (
                              <p className="text-[#D32F2F] text-[12px] mt-1 font-medium line-clamp-1 bg-red-50 p-1 rounded border border-red-100">
                                <strong>Vướng:</strong> {task.difficulties}
                              </p>
                            )}
                            {hasDirective && (
                              <div className="mt-1 text-[12px] text-[#003366] bg-blue-50 p-1 rounded border border-blue-200 line-clamp-1">
                                <strong>Chỉ đạo GĐ:</strong> {task.leaderDirectives[0].content}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-3.5 align-top text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => onOpenDirectiveModal(task)}
                                title="Phát lệnh chỉ đạo / đôn đốc"
                                className="px-2 py-1.5 rounded-[6px] bg-[#003366] hover:bg-[#002244] text-white transition-colors cursor-pointer flex items-center gap-1 text-[12px] font-medium"
                              >
                                <Send className="w-3.5 h-3.5 text-blue-200" />
                                <span>Chỉ đạo</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onOpenTaskDetail(task)}
                                title="Xem toàn bộ hồ sơ nhiệm vụ"
                                className="p-1.5 rounded-[6px] bg-[#F4F6F9] hover:bg-gray-200 text-[#111827] border border-[#E5E7EB] transition-colors cursor-pointer"
                              >
                                <Eye className="w-4 h-4 text-[#4B5563]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- MENU 3: TRUNG TÂM ĐÔN ĐỐC KHẨN & VƯỚNG MẮC --- */}
      {activeLeaderMenu === 'bottlenecks' && (
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-red-50/70 border border-red-200 p-3.5 sm:p-4 rounded-[8px] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs">
            <div>
              <h3 className="font-bold text-[#111827] text-[14px] sm:text-[15px]">Trung Tâm Chỉ Đạo & Đôn Đốc Vướng Mắc Công Vụ</h3>
              <p className="text-[12px] sm:text-[13px] text-[#4B5563] mt-0.5">
                Tổng hợp toàn bộ các nhiệm vụ chậm trễ, khó khăn do thời tiết mưa bão, thủ tục cấp vốn và kiến nghị từ cấp dưới.
              </p>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 bg-[#D32F2F] text-white font-mono font-bold text-[11px] sm:text-[12px] rounded-[6px] shrink-0">
              <CountUpNumber value={tasks.filter(t => (t.difficulties && t.difficulties.length > 0) || t.status === 'delayed' || t.status === 'paused').length} suffix=" việc cần giải quyết" />
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {tasks
              .filter((t) => (t.difficulties && t.difficulties.length > 0) || (t.proposals && t.proposals.length > 0) || t.status === 'delayed' || t.status === 'paused')
              .map((t) => (
                <div key={t.id} className="bg-white rounded-[8px] border border-[#E5E7EB] p-3.5 sm:p-4 text-[13px] sm:text-[14px] shadow-xs space-y-2.5 sm:space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono font-bold text-[#D32F2F] bg-red-50 px-2 py-0.5 rounded text-[11px] sm:text-[12px] border border-red-200">{t.code}</span>
                      <span className={`px-2 py-0.5 rounded-[4px] text-[11px] sm:text-[12px] font-medium ${getStatusBadgeClasses(t.status)}`}>{getStatusLabel(t.status)}</span>
                    </div>
                    <h4 className="font-bold text-[#111827] text-[14px] sm:text-[15px] leading-snug">{t.title}</h4>
                    <div className="text-[11px] sm:text-[12px] text-[#4B5563] mt-1">
                      Phụ trách: <strong className="text-[#111827]">{t.assignee}</strong> · Hạn: <strong className="text-[#111827]">{t.deadline ? formatDateDisplay(t.deadline) : 'Theo tiến độ'}</strong>
                    </div>

                    {t.difficulties && (
                      <div className="mt-2.5 bg-red-50 text-[#111827] p-2.5 sm:p-3 rounded-[6px] border border-red-200 text-[12px] sm:text-[13px]">
                        <strong className="block text-[#D32F2F] font-bold mb-0.5">Khó khăn / Vướng mắc phát sinh:</strong>
                        <p className="leading-relaxed">{t.difficulties}</p>
                      </div>
                    )}

                    {t.proposals && (
                      <div className="mt-2 bg-amber-50 text-[#111827] p-2.5 sm:p-3 rounded-[6px] border border-amber-200 text-[12px] sm:text-[13px]">
                        <strong className="block text-amber-900 font-bold mb-0.5">Đề xuất, kiến nghị với Ban Giám đốc:</strong>
                        <p className="leading-relaxed">{t.proposals}</p>
                      </div>
                    )}

                    {t.leaderDirectives && t.leaderDirectives.length > 0 && (
                      <div className="mt-2 bg-blue-50 text-[#111827] p-2.5 sm:p-3 rounded-[6px] border border-blue-200 text-[12px] sm:text-[13px]">
                        <strong className="block text-[#003366] font-bold mb-0.5">Chỉ đạo trước đó của Giám đốc:</strong>
                        <p className="leading-relaxed font-medium">"{t.leaderDirectives[0].content}"</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2.5 sm:pt-3 border-t border-[#E5E7EB] flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] sm:text-[12px] text-[#4B5563] truncate">Cập nhật: {t.updatedAt}</span>
                    <button
                      type="button"
                      onClick={() => onOpenDirectiveModal(t)}
                      className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-[12px] sm:text-[13px] rounded-[6px] flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors shrink-0"
                    >
                      <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>Phát Lệnh Chỉ Đạo</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* --- MENU 4: GIÁM SÁT 5 TỔ CHUYÊN MÔN --- */}
      {activeLeaderMenu === 'sections' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white p-3.5 sm:p-4 rounded-[8px] border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
            <div>
              <h3 className="font-bold text-[#111827] text-[14px] sm:text-[15px]">Bảng Giám Sát Chuyên Sâu Theo 5 Khối / Tổ Công Tác</h3>
              <p className="text-[12px] sm:text-[13px] text-[#4B5563]">Phân định rõ trách nhiệm tiến độ từng bộ phận chuyên môn</p>
            </div>
            <span className="self-start sm:self-auto text-[11px] sm:text-[12px] font-mono font-bold text-[#003366] bg-blue-50 px-2.5 py-1 rounded-[6px] border border-blue-200">5 Khối Nhiệm Vụ</span>
          </div>

          <div className="space-y-3 sm:space-y-5">
            {sectionStats.map((sec, idx) => (
              <div key={sec.name} className="bg-white rounded-[8px] border border-[#E5E7EB] overflow-hidden shadow-xs">
                <div className="bg-[#F4F6F9] px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-[6px] bg-[#003366] text-white font-bold text-[12px] sm:text-[13px] flex items-center justify-center font-mono shrink-0">
                      {idx + 1}
                    </span>
                    <h4 className="font-bold text-[#111827] text-[14px] sm:text-[15px]">{sec.name}</h4>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-[12px] sm:text-[13px] flex-wrap">
                    <span className="font-semibold text-[#111827]">Tổng: <strong><CountUpNumber value={sec.count} suffix=" việc" /></strong></span>
                    <span className="text-emerald-700 font-semibold">Xong: <strong><CountUpNumber value={sec.completed} /></strong></span>
                    <span className="text-blue-700 font-semibold">Đang làm: <strong><CountUpNumber value={sec.inProgress} /></strong></span>
                    {sec.delayed > 0 && <span className="text-[#D32F2F] font-bold">Vướng: <strong><CountUpNumber value={sec.delayed} /></strong></span>}
                    <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-[4px] border border-[#E5E7EB]">
                      <CountUpNumber value={sec.avgProg} suffix="%" className="font-bold font-mono text-[#111827]" />
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-[#E5E7EB] max-h-96 overflow-y-auto">
                  {sec.taskList.map((t) => (
                    <div key={t.id} className="p-3 sm:p-3.5 hover:bg-[#F4F6F9] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 text-[13px] sm:text-[14px]">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                          <span className="font-mono font-bold text-[#003366] bg-blue-50 px-2 py-0.5 rounded text-[11px] sm:text-[12px] border border-blue-200">{t.code}</span>
                          <span className="font-semibold text-[#111827] text-[13px] sm:text-[14px]">{t.title}</span>
                          <span className={`px-2 py-0.5 rounded-[4px] text-[11px] sm:text-[12px] font-medium ${getStatusBadgeClasses(t.status)}`}>
                            {getStatusLabel(t.status)}
                          </span>
                        </div>
                        <p className="text-[#4B5563] text-[12px] sm:text-[13px] line-clamp-1">{t.currentReport}</p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5E7EB]">
                        <span className="text-[#4B5563] text-[12px] sm:text-[13px] truncate">Phụ trách: <strong className="text-[#111827]">{t.assignee}</strong></span>
                        <div className="w-16 sm:w-24 bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
                          <div className="bg-[#003366] h-full rounded-full" style={{ width: `${t.progress}%` }} />
                        </div>
                        <span className="font-mono font-bold text-[#111827] text-[12px] sm:text-[13px] w-8 text-right">{t.progress}%</span>
                        <button
                          type="button"
                          onClick={() => onOpenDirectiveModal(t)}
                          className="px-2.5 sm:px-3 py-1 bg-[#003366] hover:bg-[#002244] text-white rounded-[6px] text-[11px] sm:text-[12px] font-semibold cursor-pointer transition-colors"
                        >
                          Chỉ đạo
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- MENU 5: BẢNG KANBAN TRỰC QUAN --- */}
      {activeLeaderMenu === 'kanban' && (
        <div className="space-y-3 sm:space-y-4">
          {/* Mobile Kanban Tab Switcher */}
          <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'Tất cả cột' },
              { id: 'pending_input', label: 'Chờ ý kiến', dot: 'bg-amber-500' },
              { id: 'in_progress', label: 'Đang làm', dot: 'bg-blue-600' },
              { id: 'delayed', label: 'Vướng mắc', dot: 'bg-[#D32F2F]' },
              { id: 'paused', label: 'Tạm dừng', dot: 'bg-gray-500' },
              { id: 'completed', label: 'Hoàn thành', dot: 'bg-emerald-600' },
            ].map((tab) => {
              const count = tab.id === 'all' 
                ? filteredTasks.length 
                : filteredTasks.filter(t => t.status === tab.id).length;
              const isActive = mobileKanbanTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMobileKanbanTab(tab.id)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer border ${
                    isActive
                      ? 'bg-[#003366] text-white border-[#003366] shadow-xs'
                      : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:bg-[#F4F6F9]'
                  }`}
                >
                  {tab.dot && <span className={`w-2 h-2 rounded-full ${tab.dot}`} />}
                  <span>{tab.label}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-[#111827]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Kanban Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-3.5 items-start">
            {[
              { id: 'pending_input', label: 'Chờ ý kiến / Thủ tục', color: 'bg-amber-500' },
              { id: 'in_progress', label: 'Đang triển khai', color: 'bg-blue-600' },
              { id: 'delayed', label: 'Chậm / Vướng mắc', color: 'bg-[#D32F2F]' },
              { id: 'paused', label: 'Tạm dừng', color: 'bg-gray-500' },
              { id: 'completed', label: 'Đã hoàn thành', color: 'bg-emerald-600' },
            ]
              .filter((column) => mobileKanbanTab === 'all' || mobileKanbanTab === column.id)
              .map((column) => {
                const columnTasks = filteredTasks.filter((t) => t.status === column.id);
                return (
                  <div key={column.id} className="bg-white rounded-[8px] p-3 border border-[#E5E7EB] shadow-xs flex flex-col max-h-[750px]">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E5E7EB]">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${column.color}`} />
                        <span className="font-bold text-[13px] sm:text-[14px] text-[#111827]">{column.label}</span>
                      </div>
                      <CountUpNumber 
                        value={columnTasks.length} 
                        className="font-mono text-[12px] font-bold bg-[#F4F6F9] text-[#111827] px-2 py-0.5 rounded-[4px] border border-[#E5E7EB]" 
                      />
                    </div>

                    <div className="overflow-y-auto space-y-2.5 flex-1 pr-0.5">
                      {columnTasks.length === 0 ? (
                        <div className="text-center py-8 text-[13px] text-[#4B5563] italic">Không có nhiệm vụ</div>
                      ) : (
                        columnTasks.map((t) => (
                          <div key={t.id} className="bg-[#F4F6F9] rounded-[6px] p-3 border border-[#E5E7EB] text-[13px] space-y-2 hover:border-gray-300 transition-all">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-mono font-bold text-[#003366] bg-blue-50 px-2 py-0.5 rounded text-[11px] sm:text-[12px] border border-blue-200">{t.code}</span>
                              <span className="font-mono text-[11px] text-[#4B5563]" title={`Ngày phân công: ${formatDateDisplay(t.assignedDate || t.startDate)}`}>
                                Hạn: {t.deadline ? formatDateDisplay(t.deadline) : 'Theo tiến độ'}
                              </span>
                            </div>
                            <h4 onClick={() => onOpenTaskDetail(t)} className="font-semibold text-[#111827] text-[13px] sm:text-[14px] leading-snug hover:text-[#003366] cursor-pointer">
                              {t.title}
                            </h4>
                            <div className="text-[11px] sm:text-[12px] text-[#4B5563] flex items-center justify-between">
                              <span>Phụ trách: <strong className="text-[#111827]">{t.assignee}</strong></span>
                              <span className="font-mono font-bold text-[#003366]">{t.progress}%</span>
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div className={`h-full rounded-full ${t.progress === 100 ? 'bg-emerald-600' : 'bg-[#003366]'}`} style={{ width: `${t.progress}%` }} />
                            </div>
                            <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => onOpenDirectiveModal(t)}
                                className="text-[12px] text-[#003366] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Chỉ đạo</span>
                              </button>
                              <button type="button" onClick={() => onOpenTaskDetail(t)} className="text-[12px] text-[#4B5563] hover:text-[#111827] cursor-pointer">
                                Chi tiết →
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* --- MENU 6: DÒNG THỜI GIAN MỐC HOÀN THÀNH --- */}
      {activeLeaderMenu === 'timeline' && (
        <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-6">
          <div className="border-b border-[#E5E7EB] pb-2.5 sm:pb-3">
            <h3 className="font-bold text-[#111827] text-[15px] sm:text-[16px]">
              Dòng Thời Gian Các Mốc Hoàn Thành & Lịch Trình Công Tác (Tháng 09 - 11/2026)
            </h3>
            <p className="text-[12px] sm:text-[13px] text-[#4B5563] mt-0.5 sm:mt-1">
              Phân định lộ trình thực hiện nhiệm vụ công tác của UBND phường Hố Nai
            </p>
          </div>

          <div className="relative border-l-2 border-[#003366] ml-2.5 sm:ml-4 pl-4 sm:pl-6 space-y-4 sm:space-y-6 text-[13px] sm:text-[14px]">
            <div className="relative">
              <span className="absolute -left-[23px] sm:-left-[31px] top-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-600 border-2 border-white ring-2 ring-emerald-200" />
              <div className="bg-emerald-50/70 border border-emerald-200 p-3 sm:p-3.5 rounded-[8px]">
                <span className="font-mono font-bold text-emerald-800 text-[12px] sm:text-[13px]">28/8 - 27/9/2026: Giai đoạn chuẩn bị & khởi công</span>
                <ul className="list-disc list-inside mt-1 text-[#111827] space-y-1 text-[13px] sm:text-[14px]">
                  <li>28/8/2026: Hoàn thành xây dựng trường MN Bình Minh CS3 (xử lý phát sinh 27 triệu 4 cửa sổ).</li>
                  <li>19/9/2026: Lựa chọn trúng thầu xúc vận chuyển rác Sonadezi.</li>
                  <li>26/9/2026: Ban hành QĐ 111/QĐ-TTDVTH phê duyệt LCNT Thẩm định giá Sen Việt (sau 15 ngày có kết quả).</li>
                  <li>27/9/2026: Đã thi công 350m đầu đường Lê Ngô Cát.</li>
                </ul>
              </div>
            </div>

            <div className="relative">
              <span className="absolute -left-[23px] sm:-left-[31px] top-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#003366] border-2 border-white ring-2 ring-blue-200" />
              <div className="bg-blue-50/70 border border-blue-200 p-3 sm:p-3.5 rounded-[8px]">
                <span className="font-mono font-bold text-[#003366] text-[12px] sm:text-[13px]">28/9/2026: Cuộc họp Giao ban tuần trọng điểm</span>
                <p className="text-[#111827] mt-1 text-[13px] sm:text-[14px]">
                  Đồng chí Phạm Thanh Phong – Giám đốc Trung tâm chủ trì cuộc họp giao ban tuần, kết luận chỉ đạo 40 nhiệm vụ phân công cho các bộ phận chuyên môn.
                </p>
              </div>
            </div>

            <div className="relative">
              <span className="absolute -left-[23px] sm:-left-[31px] top-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-600 border-2 border-white ring-2 ring-emerald-200" />
              <div className="bg-white border border-[#E5E7EB] p-3 sm:p-3.5 rounded-[8px] shadow-xs">
                <span className="font-mono font-bold text-[#111827] text-[12px] sm:text-[13px]">29/9 - 30/9/2026: Hoàn thành các mục đầu tiên</span>
                <p className="text-[#4B5563] mt-1 text-[13px] sm:text-[14px]">
                  Đ/c Thiện hoàn thành Kế hoạch Chuyển đổi số & 100% Bình dân học vụ số. Đ/c Cường hoàn tất kẻ đường THCS Hòa Bình (40 triệu). Đ/c Đạt hoàn tất hợp đồng rác Quang Trung.
                </p>
              </div>
            </div>

            <div className="relative">
              <span className="absolute -left-[23px] sm:-left-[31px] top-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-600 border-2 border-white ring-2 ring-emerald-200" />
              <div className="bg-white border border-[#E5E7EB] p-3 sm:p-3.5 rounded-[8px] shadow-xs">
                <span className="font-mono font-bold text-[#111827] text-[12px] sm:text-[13px]">02/10/2026: Nghiệm thu thực địa & Ký kết hợp đồng kinh tế</span>
                <p className="text-[#4B5563] mt-1 text-[13px] sm:text-[14px]">
                  Đ/c Cường đi nghiệm thu đường Lê Ngô Cát cùng đơn vị thi công. Đ/c Đạt ký hợp đồng kinh tế xúc vận chuyển rác với Sonadezi. Đ/c Dương hoàn thiện hồ sơ chi phí đường Yên Thế - Cơ Giới.
                </p>
              </div>
            </div>

            <div className="relative">
              <span className="absolute -left-[23px] sm:-left-[31px] top-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-200" />
              <div className="bg-blue-50/50 border border-blue-200 p-3 sm:p-3.5 rounded-[8px]">
                <span className="font-mono font-bold text-[#003366] text-[12px] sm:text-[13px]">05/10 - 06/10/2026: Quy chế Chi bộ & Gói khám sức khỏe</span>
                <p className="text-[#4B5563] mt-1 text-[13px] sm:text-[14px]">
                  05/10: Tổ HC-KT hoàn thành trình ký Quy chế chi tiêu nội bộ Chi bộ. 06/10: Giải ngân gói khám sức khỏe PK Nhân Ái Sài Gòn.
                </p>
              </div>
            </div>

            <div className="relative">
              <span className="absolute -left-[23px] sm:-left-[31px] top-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-amber-600 border-2 border-white ring-2 ring-amber-200" />
              <div className="bg-amber-50/60 border border-amber-200 p-3 sm:p-3.5 rounded-[8px]">
                <span className="font-mono font-bold text-amber-900 text-[12px] sm:text-[13px]">09/10/2026: Khởi công sửa chữa tường rào Nghĩa trang Hố Nai 3 (Khẩn cấp)</span>
                <p className="text-[#4B5563] mt-1 text-[13px] sm:text-[14px]">
                  Đã có quyết định LCNT, đôn đốc tư vấn và nhà thầu tập kết vật tư sẵn sàng khởi công đúng ngày 09/10/2026 (Đ/c Cường phụ trách, Đ/c Tuyến chỉ đạo).
                </p>
              </div>
            </div>

            <div className="relative">
              <span className="absolute -left-[23px] sm:-left-[31px] top-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#D32F2F] border-2 border-white ring-2 ring-red-200" />
              <div className="bg-red-50/60 border border-red-200 p-3 sm:p-3.5 rounded-[8px]">
                <span className="font-mono font-bold text-[#D32F2F] text-[12px] sm:text-[13px]">10/10/2026: Bàn giao hệ thống phát thanh & nguồn kinh phí</span>
                <p className="text-[#4B5563] mt-1 text-[13px] sm:text-[14px]">
                  Hạn chót Tổ HC-KT phối hợp cùng đ/c Hường hoàn tất kiểm kê và bàn giao toàn bộ hệ thống phát thanh cùng nguồn kinh phí.
                </p>
              </div>
            </div>

            <div className="relative">
              <span className="absolute -left-[23px] sm:-left-[31px] top-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-200" />
              <div className="bg-white border border-[#E5E7EB] p-3 sm:p-3.5 rounded-[8px] shadow-xs">
                <span className="font-mono font-bold text-[#111827] text-[12px] sm:text-[13px]">12/10/2026: Bản đồ số cụm đài truyền thanh thông minh phường Hố Nai</span>
                <p className="text-[#4B5563] mt-1 text-[13px] sm:text-[14px]">
                  Đ/c Nhân và Đ/c Thiện hoàn thành số hóa tọa độ GPS từng trụ loa, trạng thái hoạt động và tính năng chỉ đường kỹ thuật trực quan.
                </p>
              </div>
            </div>

            <div className="relative">
              <span className="absolute -left-[23px] sm:-left-[31px] top-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gray-600 border-2 border-white ring-2 ring-gray-200" />
              <div className="bg-[#F4F6F9] border border-[#E5E7EB] p-3 sm:p-3.5 rounded-[8px]">
                <span className="font-mono font-bold text-[#111827] text-[12px] sm:text-[13px]">30/11/2026: Xây dựng quy chế đánh giá theo Nghị định 233/2026</span>
                <p className="text-[#4B5563] mt-1 text-[13px] sm:text-[14px]">
                  Tổ HC-KT hoàn thành dự thảo khung tiêu chí đánh giá viên chức toàn đơn vị theo NĐ 233/2026 để ban hành áp dụng năm 2027.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
