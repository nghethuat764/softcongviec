import React, { useState } from 'react';
import { Task, StaffMember, TaskStatus, ProgressReportLog, Directive } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Send, 
  ChevronRight, 
  User, 
  Users, 
  Calendar, 
  ShieldCheck, 
  Building, 
  Check, 
  PlusCircle, 
  HelpCircle, 
  Lock,
  Inbox,
  ListOrdered,
  History,
  Lightbulb,
  ArrowRight,
  ClipboardList,
  Sparkles,
  Search,
  Paperclip,
  Upload,
  X
} from 'lucide-react';
import { getStatusBadgeClasses, getStatusLabel, isTaskRelatedToStaff } from '../utils/helpers';
import { STAFF_MEMBERS } from '../data/staffMembers';
import { useAuth } from '../context/AuthContext';

interface StaffReportingPortalProps {
  tasks: Task[];
  selectedStaff: StaffMember;
  onStaffChange: (staff: StaffMember) => void;
  onUpdateTask: (updatedTask: Task) => void;
  onOpenNewTask?: () => void;
}

export const StaffReportingPortal: React.FC<StaffReportingPortalProps> = ({
  tasks,
  selectedStaff,
  onStaffChange,
  onUpdateTask,
  onOpenNewTask,
}) => {
  const { currentUser, isLeader, isStaff } = useAuth();
  // Filter tasks for this staff member
  const myTasks = tasks.filter((t) =>
    isTaskRelatedToStaff(t, selectedStaff.id, selectedStaff.shortName)
  );

  const [activeTaskId, setActiveTaskId] = useState<string>(
    myTasks.length > 0 ? myTasks[0].id : ''
  );
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Menu Phân Cấp Dành Riêng Cho Viên Chức (Nhân Viên)
  type StaffMenuKey = 
    | 'report_form'       // 1.1 Form Cập Nhật Tiến Độ & Vướng Mắc
    | 'my_tasks_matrix'   // 1.2 Danh Mục Phân Công Nhiệm Vụ Của Tôi
    | 'directives_inbox'  // 2.1 Hòm Thư Lệnh Đôn Đốc & Chỉ Đạo Của Giám Đốc
    | 'report_history'    // 3.1 Sổ Nhật Ký Báo Cáo Đã Gửi
    | 'proposal_new';     // 3.2 Đề Xuất Việc Phát Sinh Mới

  const [activeStaffMenu, setActiveStaffMenu] = useState<StaffMenuKey>('report_form');

  // Lọc danh sách các chỉ đạo của Giám đốc gửi tới nhiệm vụ của cán bộ này
  const myDirectives: { task: Task; directive: Directive }[] = [];
  myTasks.forEach((t) => {
    if (t.leaderDirectives && t.leaderDirectives.length > 0) {
      t.leaderDirectives.forEach((dir) => {
        myDirectives.push({ task: t, directive: dir });
      });
    }
  });

  // Lọc lịch sử các lần báo cáo đã gửi
  const allMyReportLogs: { task: Task; log: ProgressReportLog }[] = [];
  myTasks.forEach((t) => {
    if (t.progressLogs && t.progressLogs.length > 0) {
      t.progressLogs.forEach((l) => {
        allMyReportLogs.push({ task: t, log: l });
      });
    }
  });

  // Current active task for reporting
  const currentTask = tasks.find((t) => t.id === activeTaskId) || myTasks[0] || null;

  // Form State initialized from currentTask
  const [progressVal, setProgressVal] = useState<number>(currentTask ? currentTask.progress : 0);
  const [statusVal, setStatusVal] = useState<TaskStatus>(currentTask ? currentTask.status : 'in_progress');
  const [workDone, setWorkDone] = useState<string>('');
  const [difficulties, setDifficulties] = useState<string>('');
  const [proposals, setProposals] = useState<string>('');
  const [deadlineVal, setDeadlineVal] = useState<string>('');
  const [newDocument, setNewDocument] = useState<string>('');
  const [attachedDocs, setAttachedDocs] = useState<string[]>(currentTask?.relatedDocs ? [...currentTask.relatedDocs] : []);

  // When active task changes, sync form state
  const handleSelectTask = (task: Task) => {
    setActiveTaskId(task.id);
    setProgressVal(task.progress);
    setStatusVal(task.status);
    setWorkDone(task.currentReport || '');
    setDifficulties(task.difficulties || '');
    setProposals(task.proposals || '');
    setDeadlineVal(task.deadline || '');
    setNewDocument('');
    setAttachedDocs(task.relatedDocs ? [...task.relatedDocs] : []);
  };

  const handleAddDocument = (docName: string) => {
    const trimmed = docName.trim();
    if (!trimmed) return;
    if (!attachedDocs.includes(trimmed)) {
      setAttachedDocs((prev) => [...prev, trimmed]);
    }
    setNewDocument('');
  };

  const handleRemoveDocument = (docToRemove: string) => {
    setAttachedDocs((prev) => prev.filter((d) => d !== docToRemove));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;
    const docEntry = `${file.name} (${sizeStr})`;
    if (!attachedDocs.includes(docEntry)) {
      setAttachedDocs((prev) => [...prev, docEntry]);
    }
    e.target.value = '';
  };

  // Quick preset progress buttons
  const handleSetProgressPreset = (val: number) => {
    setProgressVal(val);
    if (val === 100) {
      setStatusVal('completed');
    } else if (statusVal === 'completed' && val < 100) {
      setStatusVal('in_progress');
    }
  };

  // Submit report
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTask) return;

    const timestamp = new Date().toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newLog: ProgressReportLog = {
      id: 'log-' + Date.now(),
      timestamp,
      reporter: selectedStaff.name,
      progressPercent: progressVal,
      status: statusVal,
      workDone: workDone.trim() || 'Đã cập nhật tiến độ công việc.',
      difficulties: difficulties.trim() || undefined,
      proposals: proposals.trim() || undefined,
    };

    const updatedDocs = [...attachedDocs];
    if (newDocument.trim() && !updatedDocs.includes(newDocument.trim())) {
      updatedDocs.push(newDocument.trim());
    }

    const updated: Task = {
      ...currentTask,
      progress: progressVal,
      status: statusVal,
      currentReport: workDone.trim() || currentTask.currentReport,
      difficulties: difficulties.trim(),
      proposals: proposals.trim(),
      deadline: deadlineVal || currentTask.deadline,
      relatedDocs: updatedDocs,
      progressLogs: [newLog, ...currentTask.progressLogs],
      updatedAt: timestamp,
    };

    onUpdateTask(updated);
    setNewDocument('');
    setAttachedDocs(updatedDocs);

    // Show toast
    setToastMessage(`Đã gửi báo cáo tiến độ thành công cho nhiệm vụ: ${currentTask.code}!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered task list
  const filteredMyTasks = myTasks.filter((t) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'completed') return t.status === 'completed';
    if (filterStatus === 'in_progress') return t.status === 'in_progress';
    if (filterStatus === 'issues') return t.status === 'delayed' || t.status === 'paused' || (t.difficulties && t.difficulties.length > 0);
    return true;
  });

  const completedCount = myTasks.filter((t) => t.status === 'completed').length;
  const inProgressCount = myTasks.filter((t) => t.status === 'in_progress').length;
  const issueCount = myTasks.filter((t) => t.status === 'delayed' || t.status === 'paused').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-emerald-700 text-white px-4 py-3 rounded-[8px] shadow-md flex items-center justify-between text-[14px] animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-white hover:text-emerald-100 font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Staff Identity & Overview Banner */}
      <div className="bg-white rounded-[8px] shadow-xs border border-[#E5E7EB] border-t-4 border-t-[#003366] p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-[8px] flex items-center justify-center font-extrabold text-[20px] shadow-xs border border-[#E5E7EB] ${selectedStaff.avatarBg}`}>
              {selectedStaff.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[18px] sm:text-[20px] font-bold text-[#111827]">{selectedStaff.name}</h2>
                <span className="bg-blue-50 text-[#003366] text-[12px] px-2.5 py-0.5 rounded-[4px] font-bold border border-blue-200">
                  {selectedStaff.role}
                </span>
              </div>
              <div className="text-[13px] text-[#4B5563] mt-1 flex items-center gap-1.5 flex-wrap">
                <span>Đơn vị: <strong className="text-[#111827]">{selectedStaff.unit}</strong></span>
                <span className="text-gray-300">·</span>
                <span className="inline-flex items-center gap-1 text-[12px] text-[#003366] bg-blue-50 px-2 py-0.5 rounded-[4px] border border-blue-200 font-semibold">
                  <Building className="w-3.5 h-3.5 text-[#003366]" />
                  <span>TTDVTH Hố Nai</span>
                </span>
                <span className="text-gray-300">·</span>
                <span>Phân công theo Kết luận giao ban tuần</span>
              </div>
            </div>
          </div>

          {/* Quick Staff Switcher for testing/demo */}
          <div className="flex items-center gap-2.5">
            <span className="text-[13px] text-[#4B5563] font-medium whitespace-nowrap">Chuyển cán bộ:</span>
            <select
              value={selectedStaff.id}
              onChange={(e) => {
                const found = STAFF_MEMBERS.find((m) => m.id === e.target.value);
                if (found) {
                  onStaffChange(found);
                  const firstTaskOfStaff = tasks.find((t) =>
                    isTaskRelatedToStaff(t, found.id, found.shortName)
                  );
                  if (firstTaskOfStaff) {
                    handleSelectTask(firstTaskOfStaff);
                  }
                }
              }}
              className="text-[13px] bg-[#F4F6F9] border border-[#E5E7EB] rounded-[8px] p-2 font-medium text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366] cursor-pointer"
            >
              {STAFF_MEMBERS.filter((m) => m.id !== 'phong').map((m) => (
                <option key={m.id} value={m.id}>
                  {m.shortName} ({m.unit})
                </option>
              ))}
            </select>

            {isLeader && onOpenNewTask && (
              <button
                type="button"
                onClick={onOpenNewTask}
                className="px-3.5 py-2 bg-[#003366] hover:bg-[#002244] text-white text-[13px] font-semibold rounded-[8px] flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer shadow-xs"
                title="Lãnh đạo phân công nhiệm vụ mới"
              >
                <PlusCircle className="w-4 h-4 text-blue-200" />
                <span>Giao Việc Mới</span>
              </button>
            )}
          </div>
        </div>

        {/* Metric Badges - enlarged numbers 24-28px */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-4 pt-4 border-t border-[#E5E7EB] text-[13px]">
          <div className="bg-[#F4F6F9] p-3.5 rounded-[8px] border border-[#E5E7EB]">
            <span className="text-[#4B5563] font-medium block text-[13px]">Nhiệm vụ được giao</span>
            <strong className="text-[26px] text-[#003366] font-mono font-bold tabular-nums mt-0.5 block">{myTasks.length} việc</strong>
          </div>
          <div className="bg-[#F4F6F9] p-3.5 rounded-[8px] border border-[#E5E7EB]">
            <span className="text-[#4B5563] font-medium block text-[13px]">Đã hoàn thành</span>
            <strong className="text-[26px] text-emerald-700 font-mono font-bold tabular-nums mt-0.5 block">{completedCount} việc</strong>
          </div>
          <div className="bg-[#F4F6F9] p-3.5 rounded-[8px] border border-[#E5E7EB]">
            <span className="text-[#4B5563] font-medium block text-[13px]">Đang triển khai</span>
            <strong className="text-[26px] text-[#1D4ED8] font-mono font-bold tabular-nums mt-0.5 block">{inProgressCount} việc</strong>
          </div>
          <div className="bg-[#F4F6F9] p-3.5 rounded-[8px] border border-[#E5E7EB]">
            <span className="text-[#4B5563] font-medium block text-[13px]">Vướng mắc / Chậm</span>
            <strong className="text-[26px] text-[#D32F2F] font-mono font-bold tabular-nums mt-0.5 block">{issueCount} việc</strong>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CẤP 2: HỆ THỐNG MENU PHÂN CẤP CHUYÊN BIỆT DÀNH CHO VIÊN CHỨC (NHÂN VIÊN)
         ========================================================================= */}
      <div className="bg-white rounded-[8px] border border-[#E5E7EB] shadow-xs p-4 sm:p-5 space-y-3.5">
        
        {/* 1. Dải Breadcrumb & Thông Tin Cán Bộ Tác Nghiệp */}
        <div className="flex items-center justify-between flex-wrap gap-2.5 pb-3 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-1.5 flex-wrap text-[13px]">
            <span className="font-semibold text-[#4B5563] flex items-center gap-1.5 bg-[#F4F6F9] px-2.5 py-1 rounded-[6px] border border-[#E5E7EB] text-[12px]">
              <Building className="w-3.5 h-3.5 text-[#003366]" />
              TTDVTH Hố Nai
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="font-medium text-[#4B5563] bg-[#F4F6F9] px-2 py-1 rounded-[6px] border border-[#E5E7EB] text-[12px]">
              Phân Hệ Viên Chức
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            {/* Active Sub-view Indicator */}
            <span className="px-2.5 py-1 rounded-[6px] text-[12px] font-bold border border-[#E5E7EB] bg-[#F4F6F9] text-[#003366] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#003366]" />
              {activeStaffMenu === 'report_form' && '1.1 Form Báo Cáo Từng Nhiệm Vụ'}
              {activeStaffMenu === 'my_tasks_matrix' && `1.2 Danh Mục Việc Giao (${myTasks.length})`}
              {activeStaffMenu === 'directives_inbox' && `2.1 Hòm Thư Lệnh Chỉ Đạo (${myDirectives.length})`}
              {activeStaffMenu === 'report_history' && `3.1 Sổ Nhật Ký Báo Cáo (${allMyReportLogs.length})`}
              {activeStaffMenu === 'proposal_new' && '3.2 Đề Xuất Phát Sinh Mới'}
            </span>
          </div>

          {/* Cán bộ tác nghiệp */}
          <div className="flex items-center gap-2 bg-[#F4F6F9] px-3 py-1 rounded-[6px] border border-[#E5E7EB] text-[13px]">
            <div className="w-6 h-6 rounded bg-[#003366] text-white flex items-center justify-center font-bold text-[12px]">
              {selectedStaff.name.split(' ').slice(-1)[0][0]}
            </div>
            <div className="text-left leading-tight">
              <span className="font-semibold text-[#111827] text-[13px] block">{selectedStaff.name}</span>
              <span className="text-[11px] text-[#4B5563]">
                {selectedStaff.role}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Menu Phân Cấp Theo 3 Nhóm Tác Nghiệp Viên Chức */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Nhóm 1: BÁO CÁO TIẾN ĐỘ CHUYÊN MÔN */}
          <div className="bg-[#F4F6F9] p-3 rounded-[8px] border border-[#E5E7EB] flex flex-col justify-between space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[12px] font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-[#003366]" />
                NHÓM 1: BÁO CÁO TIẾN ĐỘ
              </span>
              <span className="text-[11px] text-[#4B5563] font-medium bg-white px-2 py-0.5 rounded border border-[#E5E7EB]">
                Tác nghiệp
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
              {/* Menu 1.1 */}
              <button
                type="button"
                onClick={() => setActiveStaffMenu('report_form')}
                className={`p-3 rounded-[8px] text-left transition-colors cursor-pointer flex flex-col justify-between border ${
                  activeStaffMenu === 'report_form'
                    ? 'bg-[#003366] text-white border-[#003366] font-semibold shadow-xs'
                    : 'bg-white hover:bg-[#F4F6F9] text-[#111827] border-[#E5E7EB]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <FileText className={`w-4 h-4 ${activeStaffMenu === 'report_form' ? 'text-white' : 'text-[#4B5563]'}`} />
                  <span className={`text-[12px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    activeStaffMenu === 'report_form' ? 'bg-white/20 text-white' : 'bg-[#F4F6F9] text-[#4B5563]'
                  }`}>
                    1.1
                  </span>
                </div>
                <div>
                  <span className="text-[14px] font-bold block leading-tight">Form Báo Cáo Việc</span>
                  <span className={`text-[12px] block mt-0.5 ${activeStaffMenu === 'report_form' ? 'text-blue-100' : 'text-[#4B5563]'}`}>
                    Nhập %, tiến độ, minh chứng
                  </span>
                </div>
              </button>

              {/* Menu 1.2 */}
              <button
                type="button"
                onClick={() => setActiveStaffMenu('my_tasks_matrix')}
                className={`p-3 rounded-[8px] text-left transition-colors cursor-pointer flex flex-col justify-between border ${
                  activeStaffMenu === 'my_tasks_matrix'
                    ? 'bg-[#003366] text-white border-[#003366] font-semibold shadow-xs'
                    : 'bg-white hover:bg-[#F4F6F9] text-[#111827] border-[#E5E7EB]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <ListOrdered className={`w-4 h-4 ${activeStaffMenu === 'my_tasks_matrix' ? 'text-white' : 'text-[#4B5563]'}`} />
                  <span className={`text-[12px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    activeStaffMenu === 'my_tasks_matrix' ? 'bg-white/20 text-white' : 'bg-[#F4F6F9] text-[#4B5563]'
                  }`}>
                    {myTasks.length} việc
                  </span>
                </div>
                <div>
                  <span className="text-[14px] font-bold block leading-tight">Bảng Việc Của Tôi</span>
                  <span className={`text-[12px] block mt-0.5 ${activeStaffMenu === 'my_tasks_matrix' ? 'text-blue-100' : 'text-[#4B5563]'}`}>
                    Toàn bộ danh mục nhiệm vụ
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Nhóm 2: TIẾP THU CHỈ ĐẠO CỦA LÃNH ĐẠO */}
          <div className="bg-[#F4F6F9] p-3 rounded-[8px] border border-[#E5E7EB] flex flex-col justify-between space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[12px] font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#003366]" />
                NHÓM 2: CHỈ ĐẠO LÃNH ĐẠO
              </span>
              <span className="text-[11px] text-[#4B5563] font-medium bg-white px-2 py-0.5 rounded border border-[#E5E7EB]">
                Chỉ đạo
              </span>
            </div>

            <div className="flex-1 flex flex-col">
              {/* Menu 2.1 */}
              <button
                type="button"
                onClick={() => setActiveStaffMenu('directives_inbox')}
                className={`p-3 rounded-[8px] text-left transition-colors cursor-pointer flex flex-col justify-between h-full border ${
                  activeStaffMenu === 'directives_inbox'
                    ? 'bg-[#003366] text-white border-[#003366] font-semibold shadow-xs'
                    : 'bg-white hover:bg-[#F4F6F9] text-[#111827] border-[#E5E7EB]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <Inbox className={`w-4 h-4 ${activeStaffMenu === 'directives_inbox' ? 'text-white' : 'text-[#4B5563]'}`} />
                  <span className={`text-[12px] font-mono px-2 py-0.5 rounded font-bold ${
                    activeStaffMenu === 'directives_inbox'
                      ? 'bg-white/20 text-white'
                      : myDirectives.length > 0
                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                      : 'bg-[#F4F6F9] text-[#4B5563]'
                  }`}>
                    {myDirectives.length} chỉ đạo
                  </span>
                </div>
                <div>
                  <span className="text-[14px] font-bold block leading-tight">Hòm Thư Lệnh Đôn Đốc</span>
                  <span className={`text-[12px] block mt-0.5 ${activeStaffMenu === 'directives_inbox' ? 'text-blue-100' : 'text-[#4B5563]'}`}>
                    Ý kiến đôn đốc & chỉ đạo trực tiếp
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Nhóm 3: SỔ NHẬT KÝ & ĐỀ XUẤT VIỆC MỚI */}
          <div className="bg-[#F4F6F9] p-3 rounded-[8px] border border-[#E5E7EB] flex flex-col justify-between space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[12px] font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-[#003366]" />
                NHÓM 3: NHẬT KÝ & ĐỀ XUẤT
              </span>
              <span className="text-[11px] text-[#4B5563] font-medium bg-white px-2 py-0.5 rounded border border-[#E5E7EB]">
                Lưu trữ
              </span>
            </div>

            <div className={`grid gap-2 flex-1 ${isLeader ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Menu 3.1 */}
              <button
                type="button"
                onClick={() => setActiveStaffMenu('report_history')}
                className={`p-3 rounded-[8px] text-left transition-colors cursor-pointer flex flex-col justify-between border ${
                  activeStaffMenu === 'report_history'
                    ? 'bg-[#003366] text-white border-[#003366] font-semibold shadow-xs'
                    : 'bg-white hover:bg-[#F4F6F9] text-[#111827] border-[#E5E7EB]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <Clock className={`w-4 h-4 ${activeStaffMenu === 'report_history' ? 'text-white' : 'text-[#4B5563]'}`} />
                  <span className={`text-[12px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    activeStaffMenu === 'report_history' ? 'bg-white/20 text-white' : 'bg-[#F4F6F9] text-[#4B5563]'
                  }`}>
                    {allMyReportLogs.length} bản ghi
                  </span>
                </div>
                <div>
                  <span className="text-[14px] font-bold block leading-tight">Sổ Nhật Ký Đã Gửi</span>
                  <span className={`text-[12px] block mt-0.5 ${activeStaffMenu === 'report_history' ? 'text-blue-100' : 'text-[#4B5563]'}`}>
                    Lịch sử các lần báo cáo tiến độ
                  </span>
                </div>
              </button>

              {/* Menu 3.2: Chỉ hiển thị cho cấp Lãnh đạo */}
              {isLeader && (
                <button
                  type="button"
                  onClick={() => setActiveStaffMenu('proposal_new')}
                  className={`p-3 rounded-[8px] text-left transition-colors cursor-pointer flex flex-col justify-between border ${
                    activeStaffMenu === 'proposal_new'
                      ? 'bg-[#003366] text-white border-[#003366] font-semibold shadow-xs'
                      : 'bg-white hover:bg-[#F4F6F9] text-[#111827] border-[#E5E7EB]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <Sparkles className={`w-4 h-4 ${activeStaffMenu === 'proposal_new' ? 'text-white' : 'text-[#4B5563]'}`} />
                    <span className={`text-[12px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      activeStaffMenu === 'proposal_new' ? 'bg-white/20 text-white' : 'bg-[#F4F6F9] text-[#4B5563]'
                    }`}>
                      3.2
                    </span>
                  </div>
                  <div>
                    <span className="text-[14px] font-bold block leading-tight">Đề Xuất Việc Mới</span>
                    <span className={`text-[12px] block mt-0.5 ${activeStaffMenu === 'proposal_new' ? 'text-blue-100' : 'text-[#4B5563]'}`}>
                      Quyền Lãnh đạo
                    </span>
                  </div>
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* =========================================================================
          NỘI DUNG TƯƠNG ỨNG TỪNG MENU BÁO CÁO CỦA NHÂN VIÊN
         ========================================================================= */}

      {/* 1.1 FORM BÁO CÁO TIẾN ĐỘ TỪNG NHIỆM VỤ */}
      {activeStaffMenu === 'report_form' && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Tasks List of this Staff (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[8px] shadow-xs border border-[#E5E7EB] overflow-hidden">
          <div className="p-4 border-b border-[#E5E7EB] bg-[#F4F6F9] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#111827] text-[15px]">Danh Sách Nhiệm Vụ Của Tôi</h3>
              <p className="text-[13px] text-[#4B5563]">Chọn nhiệm vụ để mở form báo cáo</p>
            </div>
            <span className="font-mono text-[12px] font-bold bg-white text-[#111827] px-2.5 py-0.5 rounded-[4px] border border-[#E5E7EB]">
              {filteredMyTasks.length}/{myTasks.length}
            </span>
          </div>

          {/* Quick Filter Tabs */}
          <div className="p-2 border-b border-[#E5E7EB] flex items-center gap-1.5 overflow-x-auto text-[13px] bg-white">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-[6px] transition-colors whitespace-nowrap cursor-pointer text-[13px] ${
                filterStatus === 'all'
                  ? 'bg-[#003366] text-white font-medium'
                  : 'text-[#4B5563] hover:bg-[#F4F6F9]'
              }`}
            >
              Tất cả ({myTasks.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('in_progress')}
              className={`px-3 py-1.5 rounded-[6px] transition-colors whitespace-nowrap cursor-pointer text-[13px] ${
                filterStatus === 'in_progress'
                  ? 'bg-[#003366] text-white font-medium'
                  : 'text-[#4B5563] hover:bg-[#F4F6F9]'
              }`}
            >
              Đang làm ({inProgressCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('issues')}
              className={`px-3 py-1.5 rounded-[6px] transition-colors whitespace-nowrap cursor-pointer text-[13px] ${
                filterStatus === 'issues'
                  ? 'bg-[#D32F2F] text-white font-medium'
                  : 'text-[#4B5563] hover:bg-[#F4F6F9]'
              }`}
            >
              Vướng mắc ({issueCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1.5 rounded-[6px] transition-colors whitespace-nowrap cursor-pointer text-[13px] ${
                filterStatus === 'completed'
                  ? 'bg-emerald-700 text-white font-medium'
                  : 'text-[#4B5563] hover:bg-[#F4F6F9]'
              }`}
            >
              Đã xong ({completedCount})
            </button>
          </div>

          {/* Task Items */}
          <div className="divide-y divide-[#E5E7EB] max-h-[620px] overflow-y-auto">
            {filteredMyTasks.length === 0 ? (
              <div className="p-6 text-center text-[14px] text-[#4B5563]">
                Không tìm thấy nhiệm vụ nào trong danh mục lọc này.
              </div>
            ) : (
              filteredMyTasks.map((t) => {
                const isSelected = currentTask && currentTask.id === t.id;
                const hasDirective = t.leaderDirectives && t.leaderDirectives.length > 0;
                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTask(t)}
                    className={`p-3.5 transition-colors cursor-pointer text-[14px] ${
                      isSelected
                        ? 'bg-blue-50/90 border-l-4 border-l-[#003366]'
                        : 'hover:bg-[#F4F6F9]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono font-bold text-[#003366] bg-blue-50 px-2 py-0.5 rounded-[4px] text-[12px] border border-blue-200">
                        {t.code}
                      </span>
                      <span className={`px-2 py-0.5 rounded-[4px] font-medium text-[12px] ${getStatusBadgeClasses(t.status)}`}>
                        {getStatusLabel(t.status)}
                      </span>
                    </div>

                    <h4 className="font-semibold text-[#111827] line-clamp-2 leading-snug text-[14px]">
                      {t.title}
                    </h4>

                    {/* Progress Bar in list */}
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            t.progress === 100 ? 'bg-emerald-600' : 'bg-[#003366]'
                          }`}
                          style={{ width: `${t.progress}%` }}
                        />
                      </div>
                      <span className="font-mono tabular-nums text-[#111827] font-bold text-[12px]">
                        {t.progress}%
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[12px] text-[#4B5563]">
                      <span>Hạn: {t.deadline || 'Theo tiến độ'}</span>
                      {hasDirective && (
                        <span className="text-[#003366] font-medium flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#003366]" />
                          Có chỉ đạo BGĐ
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Dedicated Reporting Form for Selected Task (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[8px] shadow-xs border border-[#E5E7EB] overflow-hidden">
          {currentTask ? (
            <div>
              {/* Form Title Banner */}
              <div className="bg-[#003366] text-white p-4 border-b border-[#002244] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-white/20 text-white font-mono text-[12px] px-2 py-0.5 rounded-[4px] font-bold border border-white/20">
                      {currentTask.code}
                    </span>
                    <span className="text-[12px] text-blue-100 font-medium">
                      {currentTask.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-[16px] text-white mt-1.5 leading-snug">
                    {currentTask.title}
                  </h3>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[12px] text-blue-200 block">Tiến độ hiện tại</span>
                  <span className="font-mono text-[22px] font-bold text-white">
                    {progressVal}%
                  </span>
                </div>
              </div>

              {/* Notice Directive Box (The foundation requirements) */}
              <div className="bg-[#F4F6F9] p-4 border-b border-[#E5E7EB] text-[13px] space-y-2.5">
                <div>
                  <span className="font-bold text-[#111827] flex items-center gap-1.5 text-[13px]">
                    <FileText className="w-4 h-4 text-[#003366]" />
                    Chỉ đạo giao nhiệm vụ từ Thông báo kết luận giao ban:
                  </span>
                  <p className="text-[#111827] bg-white p-3 rounded-[6px] border border-[#E5E7EB] mt-1.5 leading-relaxed text-[14px]">
                    {currentTask.requirement}
                  </p>
                </div>

                {/* Display Director's Directives if any */}
                {currentTask.leaderDirectives && currentTask.leaderDirectives.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-[6px] text-[#111827]">
                    <div className="font-bold flex items-center gap-1.5 text-[#003366] mb-1 text-[13px]">
                      <ShieldCheck className="w-4 h-4 text-[#003366]" />
                      Ý kiến chỉ đạo mới nhất của Giám đốc Phạm Thanh Phong:
                    </div>
                    <p className="leading-relaxed font-medium text-[14px]">
                      "{currentTask.leaderDirectives[0].content}"
                    </p>
                    <div className="text-[12px] text-[#4B5563] mt-1.5">
                      Thời điểm chỉ đạo: {currentTask.leaderDirectives[0].timestamp}
                      {currentTask.leaderDirectives[0].targetDeadline && (
                        <span> · Hạn yêu cầu: {currentTask.leaderDirectives[0].targetDeadline}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Form Controls */}
              <form onSubmit={handleSubmitReport} className="p-5 space-y-4 text-[14px]">
                
                {/* 1. Progress Slider & Quick Presets */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-[#111827] text-[14px]">
                      1. Mức độ hoàn thành công việc (%): <span className="text-[#003366] font-mono text-[16px]">{progressVal}%</span>
                    </label>
                    <div className="flex items-center gap-1 text-[12px]">
                      {[0, 25, 50, 75, 90, 100].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleSetProgressPreset(preset)}
                          className={`px-2 py-0.5 rounded-[4px] border transition-colors cursor-pointer ${
                            progressVal === preset
                              ? 'bg-[#003366] text-white border-[#003366] font-bold'
                              : 'bg-white hover:bg-[#F4F6F9] text-[#111827] border-[#E5E7EB]'
                          }`}
                        >
                          {preset}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={progressVal}
                    onChange={(e) => handleSetProgressPreset(Number(e.target.value))}
                    className="w-full accent-[#003366] cursor-pointer h-2 bg-gray-200 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[12px] text-[#4B5563] mt-1">
                    <span>0% (Chưa làm)</span>
                    <span>50% (Đang làm nửa khối lượng)</span>
                    <span>100% (Hoàn thành)</span>
                  </div>
                </div>

                {/* 2. Task Status Selector */}
                <div>
                  <label className="font-bold text-[#111827] text-[14px] block mb-1.5">
                    2. Trạng thái thực hiện hiện tại: <span className="text-[#D32F2F]">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { val: 'in_progress', label: 'Đang triển khai', desc: 'Đang thực hiện bình thường' },
                      { val: 'completed', label: 'Hoàn thành', desc: 'Đã xong toàn bộ nội dung' },
                      { val: 'delayed', label: 'Vướng mắc / Chậm', desc: 'Mưa, vướng mặt bằng, hồ sơ' },
                      { val: 'pending_input', label: 'Chờ phê duyệt / Ý kiến', desc: 'Chờ HĐND, Đảng ủy, Phòng ban' },
                      { val: 'paused', label: 'Tạm dừng', desc: 'Chờ cân đối vốn, quyết định' },
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => {
                          setStatusVal(item.val as TaskStatus);
                          if (item.val === 'completed') setProgressVal(100);
                        }}
                        className={`p-3 rounded-[8px] border text-left transition-all cursor-pointer ${
                          statusVal === item.val
                            ? 'bg-blue-50 border-[#003366] text-[#003366] ring-1 ring-[#003366]'
                            : 'bg-white hover:bg-[#F4F6F9] border-[#E5E7EB] text-[#111827]'
                        }`}
                      >
                        <div className="font-semibold text-[13px] flex items-center justify-between">
                          <span>{item.label}</span>
                          {statusVal === item.val && <Check className="w-4 h-4 text-[#003366]" />}
                        </div>
                        <div className="text-[12px] text-[#4B5563] mt-0.5">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Detailed Work Done */}
                <div>
                  <label className="font-bold text-[#111827] text-[14px] block mb-1">
                    3. Nội dung cụ thể đã triển khai (Báo cáo thực tế) <span className="text-[#D32F2F]">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={workDone}
                    onChange={(e) => setWorkDone(e.target.value)}
                    placeholder="Ghi rõ các công việc đã thực hiện trong tuần, khối lượng đạt được, số liệu cụ thể..."
                    className="w-full text-[14px] p-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366]"
                  />
                </div>

                {/* 4. Difficulties / Bottlenecks */}
                <div>
                  <label className="font-bold text-[#111827] text-[14px] block mb-1">
                    4. Khó khăn, vướng mắc phát sinh (nếu có):
                  </label>
                  <textarea
                    rows={2}
                    value={difficulties}
                    onChange={(e) => setDifficulties(e.target.value)}
                    placeholder="Ví dụ: Thời tiết mưa kéo dài không thảm nhựa được; Chờ HĐND phê duyệt kinh phí; Chờ hướng dẫn của Đảng ủy..."
                    className="w-full text-[14px] p-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#D32F2F]"
                  />
                </div>

                {/* 5. Proposals to Leadership */}
                <div>
                  <label className="font-bold text-[#111827] text-[14px] block mb-1">
                    5. Đề xuất, kiến nghị với Ban Giám đốc Trung tâm:
                  </label>
                  <textarea
                    rows={2}
                    value={proposals}
                    onChange={(e) => setProposals(e.target.value)}
                    placeholder="Ví dụ: Kiến nghị Giám đốc làm việc với Phòng KTHTĐT hỗ trợ thẩm định; Xin gia hạn tiến độ..."
                    className="w-full text-[14px] p-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#003366]"
                  />
                </div>

                {/* 6. Hạn hoàn thành & Hồ sơ tài liệu đính kèm minh chứng */}
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="font-bold text-[#111827] text-[14px] block mb-1">
                      6. Hạn hoàn thành dự kiến / điều chỉnh:
                    </label>
                    <input
                      type="date"
                      value={deadlineVal}
                      onChange={(e) => setDeadlineVal(e.target.value)}
                      className="w-full sm:w-72 text-[14px] p-2.5 rounded-[8px] border border-[#E5E7EB] focus:outline-none focus:ring-1 focus:ring-[#003366] bg-white text-[#111827]"
                    />
                  </div>

                  {/* 7. Phần Văn Bản, Biên Bản & Hồ Sơ Đính Kèm Tối Ưu */}
                  <div className="bg-[#F4F6F9] rounded-[8px] border border-[#E5E7EB] p-4 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="font-bold text-[#111827] text-[14px] flex items-center gap-1.5">
                        <Paperclip className="w-4 h-4 text-[#003366]" />
                        7. Hồ sơ, Biên bản & Văn bản đính kèm minh chứng:
                      </label>
                      <span className="text-[12px] font-mono font-bold text-[#003366] bg-blue-100 px-2 py-0.5 rounded-[4px] border border-blue-200">
                        {attachedDocs.length} tài liệu đính kèm
                      </span>
                    </div>

                    {/* Danh sách tài liệu đã đính kèm */}
                    {attachedDocs.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {attachedDocs.map((doc, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-1.5 bg-white text-[#111827] text-[13px] px-3 py-1.5 rounded-[6px] border border-[#E5E7EB] shadow-xs"
                          >
                            <FileText className="w-4 h-4 text-[#003366] shrink-0" />
                            <span className="font-medium max-w-[280px] sm:max-w-[360px] truncate" title={doc}>
                              {doc}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocument(doc)}
                              className="text-gray-400 hover:text-[#D32F2F] p-0.5 rounded transition-colors ml-1 cursor-pointer"
                              title="Gỡ bỏ tài liệu này"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[13px] text-[#4B5563] italic bg-white p-3 rounded-[6px] border border-dashed border-[#E5E7EB]">
                        Chưa có tài liệu đính kèm. Bạn có thể nhập số hiệu văn bản hoặc tải tệp minh chứng bên dưới.
                      </div>
                    )}

                    {/* Thanh nhập số hiệu và tải tệp */}
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <div className="relative flex-1 min-w-[200px]">
                        <input
                          type="text"
                          value={newDocument}
                          onChange={(e) => setNewDocument(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddDocument(newDocument);
                            }
                          }}
                          placeholder="Nhập số hiệu/tên văn bản (VD: BB Nghiệm thu ngày 12/10, QĐ 111...)"
                          className="w-full text-[14px] p-2.5 rounded-[8px] border border-[#E5E7EB] focus:outline-none focus:ring-1 focus:ring-[#003366] bg-white text-[#111827]"
                        />
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleAddDocument(newDocument)}
                        disabled={!newDocument.trim()}
                        className="px-4 py-2.5 bg-[#003366] hover:bg-[#002244] disabled:opacity-40 text-white text-[13px] font-semibold rounded-[8px] flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Thêm</span>
                      </button>

                      {/* Nút đính kèm tệp */}
                      <label className="px-4 py-2.5 bg-white hover:bg-[#F4F6F9] text-[#111827] text-[13px] font-semibold rounded-[8px] border border-[#E5E7EB] flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0">
                        <Upload className="w-4 h-4 text-[#4B5563]" />
                        <span>Tải tệp</span>
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                        />
                      </label>
                    </div>

                    {/* Gợi ý mẫu văn bản nhanh */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[12px] text-[#4B5563] font-medium">Gợi ý nhanh:</span>
                      {[
                        'Biên bản nghiệm thu kỹ thuật',
                        'Tờ trình thẩm định phê duyệt',
                        'Quyết định / Kết luận giao ban',
                        'Ảnh hiện trường khảo sát',
                        'Báo cáo giải trình tiến độ',
                      ].map((template) => (
                        <button
                          key={template}
                          type="button"
                          onClick={() => handleAddDocument(template)}
                          className="text-[12px] bg-white hover:bg-blue-50 text-[#4B5563] hover:text-[#003366] px-2.5 py-0.5 rounded-[4px] border border-[#E5E7EB] transition-colors cursor-pointer"
                        >
                          + {template}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submit Action Button */}
                <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[13px] text-[#4B5563]">
                    Báo cáo bởi: <strong className="text-[#111827]">{selectedStaff.name}</strong> · Tự động đồng bộ lên Lãnh đạo
                  </span>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#003366] hover:bg-[#002244] text-white text-[14px] font-bold rounded-[8px] flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-blue-200" />
                    <span>GỬI BÁO CÁO TIẾN ĐỘ</span>
                  </button>
                </div>

              </form>

              {/* Audit Trail: History of Reports */}
              {currentTask.progressLogs.length > 0 && (
                <div className="p-5 border-t border-slate-200 bg-slate-50/50">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    Lịch sử các lần báo cáo tiến độ trước đây ({currentTask.progressLogs.length})
                  </h4>
                  <div className="space-y-2">
                    {currentTask.progressLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-800">
                            {log.reporter} · <span className="text-blue-600">{log.progressPercent}%</span>
                          </span>
                          <span className="font-mono text-2xs text-slate-400">{log.timestamp}</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{log.workDone}</p>
                        {log.difficulties && (
                          <div className="mt-1 text-rose-700">
                            <strong>Khó khăn:</strong> {log.difficulties}
                          </div>
                        )}
                        {log.proposals && (
                          <div className="mt-0.5 text-amber-700">
                            <strong>Kiến nghị:</strong> {log.proposals}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">
              Vui lòng chọn một nhiệm vụ ở cột bên trái để cập nhật báo cáo tiến độ.
            </div>
          )}
        </div>

      </div>
      )}

      {/* =========================================================================
          1.2 DANH MỤC PHÂN CÔNG NHIỆM VỤ CỦA TÔI (MY TASKS MATRIX)
         ========================================================================= */}
      {activeStaffMenu === 'my_tasks_matrix' && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-blue-50 text-blue-700">
                  <ListOrdered className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Bảng Phân Công Nhiệm Vụ Của Viên Chức: {selectedStaff.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tổng số: <strong>{myTasks.length} nhiệm vụ</strong> theo Thông báo kết luận giao ban tuần ngày 28/9/2026
                  </p>
                </div>
              </div>
            </div>

            {isLeader && onOpenNewTask && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenNewTask}
                  className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Giao Việc Mới</span>
                </button>
              </div>
            )}
          </div>

          {/* Task Matrix Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-2xs">
                <tr>
                  <th className="p-3 w-16 text-center">Mã Số</th>
                  <th className="p-3 min-w-[200px]">Nhiệm Vụ & Phân Loại</th>
                  <th className="p-3 min-w-[260px]">Chỉ Đạo Kết Luận Của Giám Đốc (28/9)</th>
                  <th className="p-3 w-28 text-center">Tiến Độ</th>
                  <th className="p-3 w-28">Trạng Thái</th>
                  <th className="p-3 w-28">Thời Hạn</th>
                  <th className="p-3 w-32 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {myTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                      Hiện tại chưa có nhiệm vụ nào được phân công cho cán bộ này.
                    </td>
                  </tr>
                ) : (
                  myTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 text-center">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200">
                          {t.code}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900 leading-snug">{t.title}</div>
                        <div className="text-2xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <span className="text-blue-700 font-medium">{t.category}</span>
                          {t.coAssignees && t.coAssignees.length > 0 && (
                            <span className="text-slate-400">· Phối hợp: {t.coAssignees.join(', ')}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="text-slate-700 line-clamp-3 leading-relaxed bg-slate-50/60 p-2 rounded border border-slate-100 text-2xs">
                          {t.requirement}
                        </p>
                        {t.leaderDirectives && t.leaderDirectives.length > 0 && (
                          <div className="mt-1 text-2xs text-red-700 flex items-center gap-1 font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                            <span>Có chỉ đạo mới từ Giám đốc</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-mono font-bold text-xs text-slate-800 tabular-nums">
                            {t.progress}%
                          </span>
                          <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                t.progress === 100 ? 'bg-emerald-600' : 'bg-blue-600'
                              }`}
                              style={{ width: `${t.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded font-medium text-2xs inline-block ${getStatusBadgeClasses(t.status)}`}>
                          {getStatusLabel(t.status)}
                        </span>
                      </td>
                      <td className="p-3 text-2xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{t.deadline || 'Theo tiến độ'}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            handleSelectTask(t);
                            setActiveStaffMenu('report_form');
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-2xs font-bold transition-colors inline-flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Báo Cáo</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          2.1 HÒM THƯ LỆNH ĐÔN ĐỐC & CHỈ ĐẠO CỦA GIÁM ĐỐC
         ========================================================================= */}
      {activeStaffMenu === 'directives_inbox' && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-red-100 text-red-800">
                <Inbox className="w-5 h-5 text-red-700" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Hòm Thư Lệnh Chỉ Đạo & Đôn Đốc Của Ban Giám Đốc
                </h3>
                <p className="text-xs text-slate-500">
                  Các chỉ đạo trực tiếp từ <strong>Đ/c Phạm Thanh Phong – Giám đốc</strong> đối với các nhiệm vụ của <strong>{selectedStaff.name}</strong>
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-red-50 text-red-800 font-bold text-xs border border-red-200">
              {myDirectives.length} chỉ đạo tiếp nhận
            </span>
          </div>

          {myDirectives.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <ShieldCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">Chưa có chỉ đạo mới nào</p>
              <p className="text-slate-500 mt-1">Các ý kiến chỉ đạo đôn đốc từ Ban Giám đốc đối với các nhiệm vụ của bạn sẽ xuất hiện tại đây.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myDirectives.map(({ task, directive }, idx) => (
                <div
                  key={directive.id || idx}
                  className="bg-red-50/40 border border-red-200/90 rounded-xl p-4 transition-all hover:shadow-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-red-800 text-white font-mono text-xs px-2 py-0.5 rounded font-bold">
                        {task.code}
                      </span>
                      <span className="font-bold text-slate-900 text-xs">
                        {task.title}
                      </span>
                      {directive.isUrgent && (
                        <span className="bg-red-600 text-white text-3xs font-bold px-2 py-0.5 rounded uppercase">
                          Khẩn cấp / Ưu tiên
                        </span>
                      )}
                    </div>
                    <span className="text-2xs text-slate-500 font-mono">
                      Thời điểm phát lệnh: {directive.timestamp}
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-lg border border-red-200/80 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-900 mb-1">
                      <ShieldCheck className="w-4 h-4 text-red-700" />
                      <span>Ý kiến chỉ đạo từ: {directive.author}</span>
                    </div>
                    <p className="text-slate-800 text-xs leading-relaxed font-medium pl-5 border-l-2 border-red-600">
                      "{directive.content}"
                    </p>
                    {directive.targetDeadline && (
                      <div className="mt-2 text-2xs text-red-800 font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Hạn yêu cầu hoàn thành: <strong>{directive.targetDeadline}</strong></span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-xs">
                    <span className="text-2xs text-slate-500">
                      Tiến độ hiện tại của việc này: <strong className="text-blue-700 font-mono">{task.progress}%</strong> ({getStatusLabel(task.status)})
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setToastMessage(`Đã ghi nhận tiếp thu chỉ đạo của Giám đốc cho nhiệm vụ ${task.code}!`);
                          setTimeout(() => setToastMessage(null), 3500);
                        }}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-2xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Đã Tiếp Thu & Đang Làm</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectTask(task);
                          setActiveStaffMenu('report_form');
                        }}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-2xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>Báo Cáo Tiến Độ Nhiệm Vụ Này</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          3.1 SỔ NHẬT KÝ BÁO CÁO ĐÃ GỬI (REPORT HISTORY)
         ========================================================================= */}
      {activeStaffMenu === 'report_history' && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-slate-100 text-slate-800">
                <History className="w-5 h-5 text-slate-700" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Sổ Nhật Ký Báo Cáo Tiến Độ Tuần Của Viên Chức
                </h3>
                <p className="text-xs text-slate-500">
                  Lịch sử lưu trữ toàn bộ các lần báo cáo tiến độ chuyên môn đã gửi lên Ban Giám đốc ({allMyReportLogs.length} bản ghi)
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 font-bold text-xs border border-blue-200 font-mono">
              {allMyReportLogs.length} lần báo cáo
            </span>
          </div>

          {allMyReportLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">Chưa có lịch sử báo cáo</p>
              <p className="text-slate-500 mt-1">Khi bạn gửi báo cáo tiến độ cho các nhiệm vụ, nhật ký sẽ tự động lưu trữ tại đây để theo dõi qua các tuần.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allMyReportLogs.map(({ task, log }) => (
                <div key={log.id} className="p-4 bg-slate-50/60 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {task.code}
                      </span>
                      <strong className="text-slate-900 text-xs">{task.title}</strong>
                    </div>
                    <div className="flex items-center gap-2 text-2xs">
                      <span className="font-mono text-slate-500">{log.timestamp}</span>
                      <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded font-mono">
                        {log.progressPercent}%
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-800 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                    {log.workDone}
                  </p>

                  {log.difficulties && (
                    <div className="text-2xs text-rose-800 bg-rose-50 p-2 rounded border border-rose-200">
                      <strong>Khó khăn, vướng mắc:</strong> {log.difficulties}
                    </div>
                  )}

                  {log.proposals && (
                    <div className="text-2xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                      <strong>Đề xuất với Giám đốc:</strong> {log.proposals}
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectTask(task);
                        setActiveStaffMenu('report_form');
                      }}
                      className="text-2xs font-semibold text-blue-700 hover:text-blue-900 underline cursor-pointer"
                    >
                      Mở cập nhật thêm cho nhiệm vụ này →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          3.2 ĐỀ XUẤT VIỆC MỚI (PROPOSAL NEW)
         ========================================================================= */}
      {activeStaffMenu === 'proposal_new' && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden space-y-4 p-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
              <Lightbulb className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Đề Xuất Nhiệm Vụ Phát Sinh Ngoài Giao Ban Tuần
              </h3>
              <p className="text-xs text-slate-500">
                Chủ động báo cáo các nội dung phát sinh cần Ban Giám đốc Trung tâm phê duyệt và giao chỉ tiêu thực hiện
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h4 className="font-bold text-slate-800 text-xs">Căn Cứ Pháp Lý & Thực Tiễn</h4>
              <p className="text-2xs text-slate-600 leading-relaxed">
                Nêu rõ văn bản chỉ đạo của UBND Phường, Phòng ban chuyên môn thị xã/tỉnh, hoặc nhu cầu phát sinh thực tế tại địa bàn Hố Nai.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h4 className="font-bold text-slate-800 text-xs">Phân Công & Dự Toán</h4>
              <p className="text-2xs text-slate-600 leading-relaxed">
                Đề xuất cán bộ chủ trì, các bộ phận phối hợp, tiến độ hoàn thành và khái toán kinh phí dự kiến nếu có.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h4 className="font-bold text-slate-800 text-xs">Giám Đốc Phê Duyệt</h4>
              <p className="text-2xs text-slate-600 leading-relaxed">
                Sau khi gửi đề xuất, Giám đốc Phạm Thanh Phong sẽ xem xét phê duyệt và chính thức giao mã số theo dõi vào hệ thống.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs text-slate-500">
              Cán bộ tác nghiệp: <strong>{selectedStaff.name}</strong> ({selectedStaff.unit})
            </span>
            {isLeader && onOpenNewTask ? (
              <button
                type="button"
                onClick={onOpenNewTask}
                className="px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Lãnh Đạo Giao Nhiệm Vụ Mới</span>
              </button>
            ) : (
              <div className="text-2xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Chức năng giao việc mới chỉ hiển thị và thực hiện bởi cấp Lãnh đạo.</span>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

