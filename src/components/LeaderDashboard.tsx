import React, { useState } from 'react';
import { Task, SectionType, TaskStatus, Directive } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Search, 
  Filter, 
  Send, 
  Calendar, 
  User, 
  Users, 
  ChevronRight, 
  BarChart3, 
  Kanban, 
  Milestone, 
  AlertOctagon, 
  DollarSign, 
  Building2,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  SlidersHorizontal,
  Eye,
  Check
} from 'lucide-react';
import { 
  getStatusBadgeClasses, 
  getStatusLabel, 
  getPriorityLabel, 
  getSectionShortName, 
  calculateSummary 
} from '../utils/helpers';
import { STAFF_MEMBERS } from '../data/staffMembers';

interface LeaderDashboardProps {
  tasks: Task[];
  onOpenDirectiveModal: (task: Task) => void;
  onOpenTaskDetail: (task: Task) => void;
  onOpenReportForm: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onOpenNotice: () => void;
}

export const LeaderDashboard: React.FC<LeaderDashboardProps> = ({
  tasks,
  onOpenDirectiveModal,
  onOpenTaskDetail,
  onOpenReportForm,
  onUpdateTask,
  onOpenNotice,
}) => {
  const summary = calculateSummary(tasks);

  // Tabs for Leader view
  const [activeTab, setActiveTab] = useState<'master' | 'kanban' | 'timeline' | 'bottlenecks'>('master');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    // Search
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

    // Section
    if (selectedSection !== 'all' && task.section !== selectedSection) {
      return false;
    }

    // Assignee
    if (selectedAssignee !== 'all') {
      const assigneeNorm = task.assignee.toLowerCase();
      const targetNorm = selectedAssignee.toLowerCase();
      const matchAssignee = 
        assigneeNorm.includes(targetNorm) || 
        (task.coAssignees && task.coAssignees.some(c => c.toLowerCase().includes(targetNorm))) ||
        (task.leadershipDirector && task.leadershipDirector.toLowerCase().includes(targetNorm));
      if (!matchAssignee) return false;
    }

    // Status
    if (selectedStatus !== 'all' && task.status !== selectedStatus) {
      return false;
    }

    // Priority
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
      return false;
    }

    return true;
  });

  // Calculate section stats
  const sections: SectionType[] = [
    'II. TỔ HÀNH CHÍNH - KẾ TOÁN',
    'III. TỔ DỊCH VỤ CÔNG ÍCH - XÂY DỰNG',
    'IV. CÁC DỰ ÁN ĐẦU TƯ CÔNG TRUNG HẠN',
    'V. CÁC DỰ ÁN ĐẦU TƯ NGÂN SÁCH CHI THƯỜNG XUYÊN',
    'VI. TỔ VĂN HÓA - THỂ THAO - THÔNG TIN - TUYÊN TRUYỀN',
  ];

  const sectionStats = sections.map((sec) => {
    const secTasks = tasks.filter((t) => t.section === sec);
    const count = secTasks.length;
    const completed = secTasks.filter((t) => t.status === 'completed').length;
    const avgProg = count > 0 ? Math.round(secTasks.reduce((s, t) => s + t.progress, 0) / count) : 0;
    const hasDelay = secTasks.some((t) => t.status === 'delayed' || (t.difficulties && t.difficulties.length > 0));
    return {
      name: sec,
      shortName: getSectionShortName(sec),
      count,
      completed,
      avgProg,
      hasDelay,
    };
  });

  // Critical items needing leadership intervention
  const urgentTasks = tasks.filter(
    (t) => t.priority === 'urgent' || t.status === 'delayed' || (t.difficulties && t.difficulties.length > 0)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* 1. Header Welcome & Executive Banner */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-red-950 text-white rounded-2xl p-6 shadow-md border border-slate-700/60 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="bg-red-700 text-white font-mono text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Trung tâm Chỉ huy & Điều hành
              </span>
              <span className="text-slate-300 text-xs">
                Chủ trì: <strong>Đ/c Phạm Thanh Phong – Giám đốc Trung tâm</strong>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Bảng Theo Dõi & Đôn Đốc Tiến Độ Giao Ban Tuần
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Theo dõi toàn diện 40 nhiệm vụ phân công tại cuộc họp giao ban ngày 28/9/2026. Phát lệnh chỉ đạo, cảnh báo tiến độ và đôn đốc giải quyết vướng mắc kịp thời.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenNotice}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-2 shadow transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Xem Thông Báo Kết Luận 28/9</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Executive KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* Total Tasks */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Tổng nhiệm vụ giao</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {summary.total}
            </span>
            <span className="text-2xs text-slate-500 font-medium">100% việc</span>
          </div>
          <div className="mt-2 text-2xs text-slate-500">
            Phân bổ trên 5 tổ / nhóm nhiệm vụ
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs mb-1">
            <span>Đã hoàn thành</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
              {summary.completed}
            </span>
            <span className="text-2xs font-semibold text-emerald-700">
              ({Math.round((summary.completed / summary.total) * 100)}%)
            </span>
          </div>
          <div className="mt-2 text-2xs text-slate-500">
            Đã nghiệm thu / kết thúc hồ sơ
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-blue-700 text-xs mb-1">
            <span>Đang triển khai</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-700 font-mono tabular-nums">
              {summary.inProgress}
            </span>
            <span className="text-2xs font-semibold text-blue-700">
              ({Math.round((summary.inProgress / summary.total) * 100)}%)
            </span>
          </div>
          <div className="mt-2 text-2xs text-slate-500">
            Đúng lộ trình kế hoạch
          </div>
        </div>

        {/* Bottlenecks / Delays */}
        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-2xs bg-rose-50/20">
          <div className="flex items-center justify-between text-rose-700 text-xs mb-1">
            <span>Vướng mắc / Chậm</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-700 font-mono tabular-nums">
              {summary.delayed + summary.paused}
            </span>
            <span className="text-2xs font-semibold text-rose-700">
              cần chỉ đạo
            </span>
          </div>
          <div className="mt-2 text-2xs text-rose-600">
            Do mưa, vốn, hoặc thủ tục
          </div>
        </div>

        {/* Average Progress */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-1">
            <span>Tiến độ trung bình</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {summary.avgProgress}%
            </span>
            <span className="text-2xs text-slate-500 font-medium">toàn đơn vị</span>
          </div>
          <div className="mt-2 bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all"
              style={{ width: `${summary.avgProgress}%` }}
            />
          </div>
        </div>

      </div>

      {/* 3. Section Performance Ribbon */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>Tiến độ thực hiện theo 5 Khối công tác / Tổ chuyên môn:</span>
          <span className="text-2xs text-slate-400 font-normal">Nhấn vào khối để lọc nhiệm vụ</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {sectionStats.map((sec) => {
            const isSelected = selectedSection === sec.name;
            return (
              <div
                key={sec.name}
                onClick={() => setSelectedSection(isSelected ? 'all' : sec.name)}
                className={`p-3 rounded-lg border text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'border-red-600 bg-red-50/50 ring-1 ring-red-600'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
                  <span className="truncate pr-1">{sec.shortName}</span>
                  <span className="font-mono text-slate-900 font-bold">{sec.count} việc</span>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${sec.avgProg}%` }}
                    />
                  </div>
                  <span className="font-mono text-2xs font-bold text-slate-700">
                    {sec.avgProg}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-2xs text-slate-500 mt-2">
                  <span>Xong: <strong>{sec.completed}</strong></span>
                  {sec.hasDelay && (
                    <span className="text-rose-600 font-medium">Có vướng mắc</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Action Hub: Urgent Tasks & Bottlenecks Needing Leadership Direction */}
      {urgentTasks.length > 0 && (
        <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <h3 className="font-bold text-rose-900 text-sm">
                  Khu Vực Cần Chỉ Đạo Đôn Đốc Khẩn ({urgentTasks.length} nhiệm vụ)
                </h3>
                <p className="text-2xs text-rose-700">
                  Các nhiệm vụ gặp vướng mắc khách quan (thời tiết mưa, thủ tục HĐND, nguồn vốn) hoặc cần chỉ đạo gấp
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {urgentTasks.slice(0, 6).map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-lg border border-rose-200 p-3 text-xs flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 text-2xs">
                      {t.code}
                    </span>
                    <span className="text-2xs text-slate-500 font-medium truncate">
                      Phụ trách: <strong>{t.assignee}</strong>
                    </span>
                  </div>

                  <h4 className="font-semibold text-slate-900 line-clamp-2 mt-1">
                    {t.title}
                  </h4>

                  {t.difficulties && (
                    <div className="mt-1.5 bg-rose-50 text-rose-800 p-1.5 rounded border border-rose-100 text-2xs">
                      <strong>Vướng mắc:</strong> {t.difficulties}
                    </div>
                  )}

                  {t.proposals && (
                    <div className="mt-1 bg-amber-50 text-amber-800 p-1.5 rounded border border-amber-100 text-2xs">
                      <strong>Đề xuất:</strong> {t.proposals}
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="font-mono text-2xs text-slate-500">
                    Hạn: <strong>{t.deadline || 'Theo tiến độ'}</strong> · {t.progress}%
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenDirectiveModal(t)}
                    className="px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white font-bold text-2xs rounded flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Chỉ Đạo Ngay</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Main Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('master')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'master'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Bảng Chỉ Huy Danh Mục ({filteredTasks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kanban')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'kanban'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Kanban className="w-4 h-4" />
            <span>Bảng Trực Quan Kanban</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'timeline'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Milestone className="w-4 h-4" />
            <span>Dòng Thời Gian & Mốc Hạn Định</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bottlenecks')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'bottlenecks'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Ma Trận Vướng Mắc & Tháo Gỡ</span>
          </button>
        </div>

        {/* Global Filter Reset */}
        {(searchTerm || selectedSection !== 'all' || selectedAssignee !== 'all' || selectedStatus !== 'all' || selectedPriority !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedSection('all');
              setSelectedAssignee('all');
              setSelectedStatus('all');
              setSelectedPriority('all');
            }}
            className="text-2xs text-red-700 font-semibold hover:underline cursor-pointer"
          >
            Xóa các bộ lọc đang chọn
          </button>
        )}
      </div>

      {/* 6. Filter & Search Controls Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
          
          {/* Search Box (4 cols) */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên dự án, mã II.1, nội dung chỉ đạo, tên cán bộ..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white"
            />
          </div>

          {/* Section Filter (3 cols) */}
          <div className="md:col-span-3">
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
            >
              <option value="all">Tất cả Khối / Tổ công tác</option>
              {sections.map((s) => (
                <option key={s} value={s}>
                  {getSectionShortName(s)}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee Filter (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
            >
              <option value="all">Tất cả Cán bộ</option>
              <option value="Cường">Đ/c Cường</option>
              <option value="Dương">Đ/c Dương</option>
              <option value="Đạt">Đ/c Đạt</option>
              <option value="Trổi">Đ/c Trổi</option>
              <option value="Thiện">Đ/c Thiện</option>
              <option value="Tuyến">Đ/c Tuyến</option>
              <option value="Nhân">Đ/c Nhân</option>
              <option value="Hành chính">Tổ HC - KT</option>
            </select>
          </div>

          {/* Status Filter (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
            >
              <option value="all">Tất cả Trạng thái</option>
              <option value="in_progress">Đang triển khai</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="delayed">Chậm / Vướng mắc</option>
              <option value="pending_input">Chờ phê duyệt/ý kiến</option>
              <option value="paused">Tạm dừng</option>
            </select>
          </div>

          {/* Priority Filter (1 col) */}
          <div className="md:col-span-1">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full py-2 px-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
            >
              <option value="all">Mức ưu tiên</option>
              <option value="urgent">Hỏa tốc</option>
              <option value="high">Cao</option>
              <option value="normal">Bình thường</option>
            </select>
          </div>

        </div>
      </div>

      {/* 7. TAB CONTENT AREA */}

      {/* --- TAB 1: MASTER TABLE VIEW --- */}
      {activeTab === 'master' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-2xs tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-16">Mã</th>
                  <th className="py-3 px-3 w-72">Tên Nhiệm Vụ & Chỉ Đạo</th>
                  <th className="py-3 px-3 w-36">Cán Bộ Phụ Trách</th>
                  <th className="py-3 px-3 w-28">Hạn Định</th>
                  <th className="py-3 px-3 w-32">Tiến Độ %</th>
                  <th className="py-3 px-3 w-32">Trạng Thái</th>
                  <th className="py-3 px-3 min-w-56">Báo Cáo Thực Tế & Chỉ Đạo</th>
                  <th className="py-3 px-3 w-36 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                      Không tìm thấy nhiệm vụ nào phù hợp với bộ lọc tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => {
                    const hasDirective = task.leaderDirectives && task.leaderDirectives.length > 0;
                    return (
                      <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* Code */}
                        <td className="py-3 px-3 align-top font-mono font-bold text-red-700">
                          {task.code}
                        </td>

                        {/* Title & Section */}
                        <td className="py-3 px-3 align-top">
                          <span className="text-2xs text-slate-400 block">{getSectionShortName(task.section)}</span>
                          <span className="font-semibold text-slate-900 text-xs block leading-snug">
                            {task.title}
                          </span>
                          {task.budgetInfo && (
                            <span className="inline-block mt-1 font-mono text-2xs text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              {task.budgetInfo}
                            </span>
                          )}
                        </td>

                        {/* Assignee */}
                        <td className="py-3 px-3 align-top">
                          <strong className="text-slate-900 block">{task.assignee}</strong>
                          {task.coAssignees && task.coAssignees.length > 0 && (
                            <span className="text-2xs text-slate-500 block">
                              +{task.coAssignees.join(', ')}
                            </span>
                          )}
                          {task.leadershipDirector && (
                            <span className="text-2xs text-amber-800 font-medium block">
                              {task.leadershipDirector}
                            </span>
                          )}
                        </td>

                        {/* Deadline */}
                        <td className="py-3 px-3 align-top font-mono text-slate-700">
                          {task.deadline || 'Theo tiến độ'}
                        </td>

                        {/* Progress */}
                        <td className="py-3 px-3 align-top">
                          <div className="flex items-center gap-1.5">
                            <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  task.progress === 100 ? 'bg-emerald-600' : 'bg-blue-600'
                                }`}
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-slate-800 tabular-nums">
                              {task.progress}%
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 align-top">
                          <span className={`inline-block px-2 py-0.5 rounded text-2xs font-medium ${getStatusBadgeClasses(task.status)}`}>
                            {getStatusLabel(task.status)}
                          </span>
                          {task.priority === 'urgent' && (
                            <span className="inline-block ml-1 text-2xs font-bold text-red-600">
                              HỎA TỐC
                            </span>
                          )}
                        </td>

                        {/* Latest Report & Directives */}
                        <td className="py-3 px-3 align-top text-xs">
                          <p className="text-slate-700 line-clamp-2 leading-relaxed">
                            {task.currentReport || 'Đang cập nhật...'}
                          </p>

                          {task.difficulties && (
                            <p className="text-rose-700 text-2xs mt-1 font-medium line-clamp-1">
                              <strong>Vướng:</strong> {task.difficulties}
                            </p>
                          )}

                          {hasDirective && (
                            <div className="mt-1 text-2xs text-red-800 bg-red-50 p-1 rounded border border-red-200 line-clamp-1">
                              <strong>Chỉ đạo GĐ:</strong> {task.leaderDirectives[0].content}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 align-top text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => onOpenDirectiveModal(task)}
                              title="Gửi chỉ đạo, đôn đốc"
                              className="p-1.5 rounded bg-red-700 hover:bg-red-800 text-white transition-colors cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onOpenTaskDetail(task)}
                              title="Xem chi tiết toàn bộ hồ sơ nhiệm vụ"
                              className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
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
      )}

      {/* --- TAB 2: KANBAN BOARD VIEW --- */}
      {activeTab === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 items-start">
          {[
            { id: 'pending_input', label: 'Chờ ý kiến / Thủ tục', color: 'bg-amber-500' },
            { id: 'in_progress', label: 'Đang triển khai', color: 'bg-blue-600' },
            { id: 'delayed', label: 'Chậm / Vướng mắc', color: 'bg-rose-600' },
            { id: 'paused', label: 'Tạm dừng', color: 'bg-slate-500' },
            { id: 'completed', label: 'Đã hoàn thành', color: 'bg-emerald-600' },
          ].map((column) => {
            const columnTasks = filteredTasks.filter((t) => t.status === column.id);
            return (
              <div
                key={column.id}
                className="bg-slate-100/80 rounded-xl p-3 border border-slate-200 flex flex-col max-h-[750px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
                    <span className="font-bold text-xs text-slate-800">{column.label}</span>
                  </div>
                  <span className="font-mono text-2xs font-bold bg-white text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="overflow-y-auto space-y-2.5 flex-1 pr-0.5">
                  {columnTasks.length === 0 ? (
                    <div className="text-center py-8 text-2xs text-slate-400 italic">
                      Không có nhiệm vụ
                    </div>
                  ) : (
                    columnTasks.map((t) => (
                      <div
                        key={t.id}
                        className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs text-xs space-y-2 hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded text-2xs">
                            {t.code}
                          </span>
                          <span className="font-mono text-2xs text-slate-500">
                            {t.deadline || 'Theo tiến độ'}
                          </span>
                        </div>

                        <h4
                          onClick={() => onOpenTaskDetail(t)}
                          className="font-semibold text-slate-900 leading-snug hover:text-blue-600 cursor-pointer"
                        >
                          {t.title}
                        </h4>

                        <div className="text-2xs text-slate-500 flex items-center justify-between">
                          <span>Phụ trách: <strong>{t.assignee}</strong></span>
                          <span className="font-mono font-bold text-blue-700">{t.progress}%</span>
                        </div>

                        <div className="flex-1 bg-slate-200 rounded-full h-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              t.progress === 100 ? 'bg-emerald-600' : 'bg-blue-600'
                            }`}
                            style={{ width: `${t.progress}%` }}
                          />
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => onOpenDirectiveModal(t)}
                            className="text-2xs text-red-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>Chỉ đạo</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenTaskDetail(t)}
                            className="text-2xs text-slate-500 hover:text-slate-800 cursor-pointer"
                          >
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
      )}

      {/* --- TAB 3: TIMELINE & MILESTONES VIEW --- */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">
              Dòng Thời Gian Các Mốc Hoàn Thành & Lịch Trình Công Tác (Tháng 09 - 11/2026)
            </h3>
            <p className="text-xs text-slate-500">
              Căn cứ kết luận cuộc họp giao ban tuần ngày 28/9/2026 của UBND phường Hố Nai
            </p>
          </div>

          <div className="relative border-l-2 border-blue-500 ml-4 pl-6 space-y-6 text-xs">
            
            {/* 28/8 & 19/9 & 26/9 & 27/9 (Milestones completed) */}
            <div className="relative">
              <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white ring-2 ring-emerald-200" />
              <div className="bg-emerald-50/60 border border-emerald-200 p-3 rounded-lg">
                <span className="font-mono font-bold text-emerald-800 text-xs">28/8 - 27/9/2026: Giai đoạn chuẩn bị & khởi công</span>
                <ul className="list-disc list-inside mt-1 text-slate-700 space-y-1">
                  <li>28/8/2026: Hoàn thành xây dựng trường MN Bình Minh CS3 (xử lý phát sinh 27 triệu 4 cửa sổ).</li>
                  <li>19/9/2026: Lựa chọn trúng thầu xúc vận chuyển rác Sonadezi.</li>
                  <li>26/9/2026: Ban hành QĐ 111/QĐ-TTDVTH phê duyệt LCNT Thẩm định giá Sen Việt (sau 15 ngày có kết quả).</li>
                  <li>27/9/2026: Đã thi công 350m đầu đường Lê Ngô Cát.</li>
                </ul>
              </div>
            </div>

            {/* 28/9/2026 - Cuộc họp giao ban tuần */}
            <div className="relative">
              <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-red-700 border-2 border-white ring-2 ring-red-200" />
              <div className="bg-red-50/60 border border-red-200 p-3 rounded-lg">
                <span className="font-mono font-bold text-red-800 text-xs">28/9/2026: Cuộc họp Giao ban tuần trọng điểm</span>
                <p className="text-slate-800 mt-1">
                  Đồng chí Phạm Thanh Phong – Giám đốc Trung tâm chủ trì cuộc họp giao ban tuần, kết luận chỉ đạo 40 nhiệm vụ phân công cho các bộ phận chuyên môn.
                </p>
              </div>
            </div>

            {/* 29/9 & 30/9/2026 - Đã hoàn thành các nhiệm vụ CĐS và biển báo */}
            <div className="relative">
              <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white ring-2 ring-emerald-200" />
              <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-2xs">
                <span className="font-mono font-bold text-slate-900 text-xs">29/9 - 30/9/2026: Hoàn thành các mục đầu tiên</span>
                <p className="text-slate-700 mt-1">
                  Đ/c Thiện hoàn thành Kế hoạch Chuyển đổi số & 100% Bình dân học vụ số. Đ/c Cường hoàn tất kẻ đường THCS Hòa Bình (40 triệu). Đ/c Đạt hoàn tất hợp đồng rác Quang Trung.
                </p>
              </div>
            </div>

            {/* 02/10/2026 - Nghiệm thu Lê Ngô Cát, Ký HĐ Sonadezi */}
            <div className="relative">
              <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white ring-2 ring-emerald-200" />
              <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-2xs">
                <span className="font-mono font-bold text-slate-900 text-xs">02/10/2026: Nghiệm thu thực địa & Ký kết hợp đồng kinh tế</span>
                <p className="text-slate-700 mt-1">
                  Đ/c Cường đi nghiệm thu đường Lê Ngô Cát cùng đơn vị thi công. Đ/c Đạt ký hợp đồng kinh tế xúc vận chuyển rác với Sonadezi. Đ/c Dương hoàn thiện hồ sơ chi phí đường Yên Thế - Cơ Giới.
                </p>
              </div>
            </div>

            {/* 05/10 - 06/10/2026: Trình ký chi bộ & thanh toán khám sức khỏe */}
            <div className="relative">
              <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-200" />
              <div className="bg-blue-50/50 border border-blue-200 p-3 rounded-lg">
                <span className="font-mono font-bold text-blue-900 text-xs">05/10 - 06/10/2026: Quy chế Chi bộ & Gói khám sức khỏe</span>
                <p className="text-slate-700 mt-1">
                  05/10: Tổ HC-KT hoàn thành trình ký Quy chế chi tiêu nội bộ Chi bộ. 06/10: Dự kiến giải ngân gói khám sức khỏe PK Nhân Ái Sài Gòn.
                </p>
              </div>
            </div>

            {/* 09/10/2026: Khởi công tường rào Nghĩa trang Hố Nai 3 */}
            <div className="relative">
              <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-amber-600 border-2 border-white ring-2 ring-amber-200" />
              <div className="bg-amber-50/60 border border-amber-200 p-3 rounded-lg">
                <span className="font-mono font-bold text-amber-900 text-xs">09/10/2026: Khởi công sửa chữa tường rào Nghĩa trang Hố Nai 3 (Khẩn cấp)</span>
                <p className="text-slate-700 mt-1">
                  Đã có quyết định LCNT, đôn đốc tư vấn và nhà thầu tập kết vật tư sẵn sàng khởi công đúng ngày 09/10/2026 (Đ/c Cường phụ trách, Đ/c Tuyến chỉ đạo).
                </p>
              </div>
            </div>

            {/* 10/10/2026: Bàn giao hệ thống phát thanh & nguồn kinh phí */}
            <div className="relative">
              <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-red-600 border-2 border-white ring-2 ring-red-200" />
              <div className="bg-red-50/60 border border-red-200 p-3 rounded-lg">
                <span className="font-mono font-bold text-red-900 text-xs">10/10/2026: Bàn giao hệ thống phát thanh & nguồn kinh phí</span>
                <p className="text-slate-700 mt-1">
                  Hạn chót Tổ HC-KT phối hợp cùng đ/c Hường hoàn tất kiểm kê và bàn giao toàn bộ hệ thống phát thanh cùng nguồn kinh phí.
                </p>
              </div>
            </div>

            {/* 12/10/2026: Hoàn thành Bản đồ số cụm đài truyền thanh thông minh */}
            <div className="relative">
              <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-200" />
              <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-2xs">
                <span className="font-mono font-bold text-slate-900 text-xs">12/10/2026: Bản đồ số cụm đài truyền thanh thông minh phường Hố Nai</span>
                <p className="text-slate-700 mt-1">
                  Đ/c Nhân và Đ/c Thiện hoàn thành số hóa tọa độ GPS từng trụ loa, trạng thái hoạt động và tính năng chỉ đường kỹ thuật trực quan.
                </p>
              </div>
            </div>

            {/* 30/11/2026: Hoàn thành Quy chế đánh giá NĐ 233/2026 */}
            <div className="relative">
              <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-slate-600 border-2 border-white ring-2 ring-slate-200" />
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                <span className="font-mono font-bold text-slate-900 text-xs">30/11/2026: Xây dựng quy chế đánh giá theo Nghị định 233/2026</span>
                <p className="text-slate-700 mt-1">
                  Tổ HC-KT hoàn thành dự thảo khung tiêu chí đánh giá viên chức toàn đơn vị theo NĐ 233/2026 để ban hành áp dụng năm 2027.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- TAB 4: BOTTLENECK & RESOLUTION MATRIX --- */}
      {activeTab === 'bottlenecks' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">
              Ma Trận Vướng Mắc & Kiến Nghị Cần Tháo Gỡ Từ Các Bộ Phận
            </h3>
            <p className="text-xs text-slate-500">
              Tổng hợp trực tiếp từ form báo cáo của viên chức. Giám đốc có thể phát lệnh chỉ đạo giải quyết tại chỗ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks
              .filter((t) => (t.difficulties && t.difficulties.length > 0) || (t.proposals && t.proposals.length > 0) || t.status === 'delayed' || t.status === 'paused')
              .map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 text-xs shadow-2xs space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        {t.code}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-medium ${getStatusBadgeClasses(t.status)}`}>
                        {getStatusLabel(t.status)}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm leading-snug">
                      {t.title}
                    </h4>

                    <div className="text-2xs text-slate-500 mt-1">
                      Phụ trách: <strong>{t.assignee}</strong> · Hạn: <strong>{t.deadline || 'Theo tiến độ'}</strong>
                    </div>

                    {t.difficulties && (
                      <div className="mt-2.5 bg-rose-50 text-rose-900 p-2.5 rounded-lg border border-rose-200">
                        <strong className="block text-rose-800 font-bold mb-0.5">
                          Khó khăn / Vướng mắc:
                        </strong>
                        <p className="leading-relaxed">{t.difficulties}</p>
                      </div>
                    )}

                    {t.proposals && (
                      <div className="mt-2 bg-amber-50 text-amber-900 p-2.5 rounded-lg border border-amber-200">
                        <strong className="block text-amber-800 font-bold mb-0.5">
                          Đề xuất, kiến nghị với Ban Giám đốc:
                        </strong>
                        <p className="leading-relaxed">{t.proposals}</p>
                      </div>
                    )}

                    {t.leaderDirectives && t.leaderDirectives.length > 0 && (
                      <div className="mt-2 bg-slate-50 text-slate-800 p-2.5 rounded-lg border border-slate-200">
                        <strong className="block text-red-700 font-bold mb-0.5">
                          Chỉ đạo trước đó của Giám đốc:
                        </strong>
                        <p className="leading-relaxed font-medium">"{t.leaderDirectives[0].content}"</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-mono text-2xs text-slate-400">
                      Cập nhật: {t.updatedAt}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenDirectiveModal(t)}
                      className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Chỉ Đạo Tháo Gỡ</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

    </div>
  );
};
