import React, { useState } from 'react';
import { Task, StaffMember, TaskStatus, ProgressReportLog } from '../types';
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
  Lock
} from 'lucide-react';
import { getStatusBadgeClasses, getStatusLabel, isTaskRelatedToStaff } from '../utils/helpers';
import { STAFF_MEMBERS } from '../data/staffMembers';
import { useAuth } from '../context/AuthContext';

interface StaffReportingPortalProps {
  tasks: Task[];
  selectedStaff: StaffMember;
  onStaffChange: (staff: StaffMember) => void;
  onUpdateTask: (updatedTask: Task) => void;
  onOpenNewTask: () => void;
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

    const updatedDocs = [...(currentTask.relatedDocs || [])];
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
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between text-xs sm:text-sm animate-in fade-in slide-in-from-top-2">
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
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${selectedStaff.avatarBg}`}>
              {selectedStaff.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900">{selectedStaff.name}</h2>
                <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded font-medium border border-blue-200">
                  {selectedStaff.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Đơn vị: <strong>{selectedStaff.unit}</strong> · Phân công theo Kết luận giao ban tuần 28/9/2026
              </p>
            </div>
          </div>

          {/* Quick Staff Switcher for testing/demo */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 whitespace-nowrap">Chuyển cán bộ:</span>
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
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {STAFF_MEMBERS.filter((m) => m.id !== 'phong').map((m) => (
                <option key={m.id} value={m.id}>
                  {m.shortName} ({m.unit})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={onOpenNewTask}
              className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors whitespace-nowrap cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Báo Việc Mới</span>
            </button>
          </div>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-slate-500 block">Nhiệm vụ được giao</span>
            <strong className="text-base text-slate-900 font-mono tabular-nums">{myTasks.length} việc</strong>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
            <span className="text-emerald-700 block">Đã hoàn thành</span>
            <strong className="text-base text-emerald-800 font-mono tabular-nums">{completedCount} việc</strong>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <span className="text-blue-700 block">Đang triển khai</span>
            <strong className="text-base text-blue-800 font-mono tabular-nums">{inProgressCount} việc</strong>
          </div>
          <div className="bg-rose-50 p-3 rounded-lg border border-rose-200">
            <span className="text-rose-700 block">Vướng mắc / Chậm</span>
            <strong className="text-base text-rose-800 font-mono tabular-nums">{issueCount} việc</strong>
          </div>
        </div>
      </div>

      {/* Main Split: Left is Task Selector, Right is Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Tasks List of this Staff (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Danh Sách Nhiệm Vụ Của Tôi</h3>
              <p className="text-xs text-slate-500">Chọn nhiệm vụ để mở form báo cáo</p>
            </div>
            <span className="font-mono text-xs font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
              {filteredMyTasks.length}/{myTasks.length}
            </span>
          </div>

          {/* Quick Filter Tabs */}
          <div className="p-2 border-b border-slate-200 flex items-center gap-1 overflow-x-auto text-xs bg-white">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-slate-900 text-white font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Tất cả ({myTasks.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('in_progress')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                filterStatus === 'in_progress'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Đang làm ({inProgressCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('issues')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                filterStatus === 'issues'
                  ? 'bg-rose-600 text-white font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Vướng mắc ({issueCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('completed')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                filterStatus === 'completed'
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Đã xong ({completedCount})
            </button>
          </div>

          {/* Task Items */}
          <div className="divide-y divide-slate-100 max-h-[620px] overflow-y-auto">
            {filteredMyTasks.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                Không tìm thấy nhiệm vụ nào trong danh mục lọc này.
              </div>
            ) : (
              filteredMyTasks.map((t) => {
                const isSelected = currentTask && currentTask.id === t.id;
                const hasDirective = t.leaderDirectives.length > 0;
                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTask(t)}
                    className={`p-3.5 transition-colors cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-blue-50/80 border-l-4 border-l-blue-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                        {t.code}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-medium text-2xs ${getStatusBadgeClasses(t.status)}`}>
                        {getStatusLabel(t.status)}
                      </span>
                    </div>

                    <h4 className="font-semibold text-slate-900 line-clamp-2 leading-snug">
                      {t.title}
                    </h4>

                    {/* Progress Bar in list */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            t.progress === 100 ? 'bg-emerald-600' : 'bg-blue-600'
                          }`}
                          style={{ width: `${t.progress}%` }}
                        />
                      </div>
                      <span className="font-mono tabular-nums text-slate-700 font-bold text-2xs">
                        {t.progress}%
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-2xs text-slate-500">
                      <span>Hạn: {t.deadline || 'Theo tiến độ'}</span>
                      {hasDirective && (
                        <span className="text-red-700 font-medium flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-red-600" />
                          Có chỉ đạo
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
        <div className="lg:col-span-7 bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          {currentTask ? (
            <div>
              {/* Form Title Banner */}
              <div className="bg-slate-900 text-white p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-red-700 text-white font-mono text-xs px-2 py-0.5 rounded font-bold">
                      {currentTask.code}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      {currentTask.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white mt-1 leading-snug">
                    {currentTask.title}
                  </h3>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-slate-400 block">Tiến độ hiện tại</span>
                  <span className="font-mono text-lg font-bold text-emerald-400">
                    {progressVal}%
                  </span>
                </div>
              </div>

              {/* Notice Directive Box (The foundation requirements) */}
              <div className="bg-slate-50 p-4 border-b border-slate-200 text-xs space-y-2">
                <div>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-red-700" />
                    Chỉ đạo gốc từ Thông báo kết luận cuộc họp giao ban 28/9/2026:
                  </span>
                  <p className="text-slate-700 bg-white p-2.5 rounded border border-slate-200 mt-1 leading-relaxed">
                    {currentTask.requirement}
                  </p>
                </div>

                {/* Display Director's Directives if any */}
                {currentTask.leaderDirectives && currentTask.leaderDirectives.length > 0 && (
                  <div className="bg-red-50 border border-red-200 p-2.5 rounded text-red-950">
                    <div className="font-bold flex items-center gap-1 text-red-800 mb-1">
                      <ShieldCheck className="w-4 h-4 text-red-700" />
                      Ý kiến chỉ đạo mới nhất của Giám đốc Phạm Thanh Phong:
                    </div>
                    <p className="leading-relaxed font-medium">
                      "{currentTask.leaderDirectives[0].content}"
                    </p>
                    <div className="text-2xs text-red-700 mt-1">
                      Thời điểm chỉ đạo: {currentTask.leaderDirectives[0].timestamp}
                      {currentTask.leaderDirectives[0].targetDeadline && (
                        <span> · Hạn yêu cầu: {currentTask.leaderDirectives[0].targetDeadline}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Form Controls */}
              <form onSubmit={handleSubmitReport} className="p-5 space-y-4 text-xs sm:text-sm">
                
                {/* 1. Progress Slider & Quick Presets */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-800 text-xs">
                      1. Mức độ hoàn thành công việc (%): <span className="text-blue-700 font-mono text-sm">{progressVal}%</span>
                    </label>
                    <div className="flex items-center gap-1 text-2xs">
                      {[0, 25, 50, 75, 90, 100].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleSetProgressPreset(preset)}
                          className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                            progressVal === preset
                              ? 'bg-blue-600 text-white border-blue-600 font-bold'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
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
                    className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-2xs text-slate-400 mt-1">
                    <span>0% (Chưa làm)</span>
                    <span>50% (Đang làm nửa khối lượng)</span>
                    <span>100% (Hoàn thành)</span>
                  </div>
                </div>

                {/* 2. Task Status Selector */}
                <div>
                  <label className="font-bold text-slate-800 text-xs block mb-1.5">
                    2. Trạng thái thực hiện hiện tại: <span className="text-red-500">*</span>
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
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                          statusVal === item.val
                            ? 'bg-blue-50 border-blue-600 text-blue-900 ring-1 ring-blue-600'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="font-semibold text-xs flex items-center justify-between">
                          <span>{item.label}</span>
                          {statusVal === item.val && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                        <div className="text-2xs text-slate-500 mt-0.5">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Detailed Work Done */}
                <div>
                  <label className="font-bold text-slate-800 text-xs block mb-1">
                    3. Nội dung cụ thể đã triển khai (Báo cáo thực tế) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={workDone}
                    onChange={(e) => setWorkDone(e.target.value)}
                    placeholder="Ghi rõ các công việc đã thực hiện trong tuần, khối lượng đạt được, số liệu cụ thể..."
                    className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>

                {/* 4. Difficulties / Bottlenecks */}
                <div>
                  <label className="font-bold text-slate-800 text-xs block mb-1">
                    4. Khó khăn, vướng mắc phát sinh (nếu có):
                  </label>
                  <textarea
                    rows={2}
                    value={difficulties}
                    onChange={(e) => setDifficulties(e.target.value)}
                    placeholder="Ví dụ: Thời tiết mưa kéo dài không thảm nhựa được; Chờ HĐND phê duyệt kinh phí; Chờ hướng dẫn của Đảng ủy..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                {/* 5. Proposals to Leadership */}
                <div>
                  <label className="font-bold text-slate-800 text-xs block mb-1">
                    5. Đề xuất, kiến nghị với Ban Giám đốc Trung tâm:
                  </label>
                  <textarea
                    rows={2}
                    value={proposals}
                    onChange={(e) => setProposals(e.target.value)}
                    placeholder="Ví dụ: Kiến nghị Giám đốc làm việc với Phòng KTHTĐT hỗ trợ thẩm định; Xin gia hạn tiến độ..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* 6. Deadline & Attachment Docs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="font-bold text-slate-800 text-xs block mb-1">
                      Hạn hoàn thành dự kiến / thực tế:
                    </label>
                    <input
                      type="date"
                      value={deadlineVal}
                      onChange={(e) => setDeadlineVal(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 text-xs block mb-1">
                      Số hiệu văn bản / Biên bản đính kèm:
                    </label>
                    <input
                      type="text"
                      value={newDocument}
                      onChange={(e) => setNewDocument(e.target.value)}
                      placeholder="VD: BB Nghiệm thu ngày 02/10, QĐ 111..."
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Submit Action Button */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-2xs text-slate-500">
                    Báo cáo bởi: <strong>{selectedStaff.name}</strong> · Tự động cập nhật lên Dashboard Lãnh đạo
                  </span>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Gửi Báo Cáo Tiến Độ</span>
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

    </div>
  );
};
