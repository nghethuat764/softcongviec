import React, { useState, useMemo } from 'react';
import { Task, TaskStatus, PriorityLevel } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from '../context/ToastContext';
import { CountUpNumber } from './CountUpNumber';
import { getStatusBadgeClasses, getStatusLabel, formatDateDisplay } from '../utils/helpers';
import {
  Smartphone,
  X,
  Home,
  CheckSquare,
  BarChart2,
  ShieldCheck,
  User,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Send,
  Bell,
  Sparkles,
  Wifi,
  Battery,
  Signal,
  RotateCcw,
  Maximize2,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Building2,
  FileSpreadsheet,
  Moon,
  Sun,
  Laptop
} from 'lucide-react';

interface MobileMockupSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onUpdateTask?: (task: Task) => void;
  onAddTask?: (task: Task) => void;
}

export const MobileMockupSimulator: React.FC<MobileMockupSimulatorProps> = ({
  isOpen,
  onClose,
  tasks,
  onUpdateTask,
  onAddTask,
}) => {
  const { currentUser, isLeader } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Mobile Device Mockup Frame: 'ios' | 'android'
  const [deviceFrame, setDeviceFrame] = useState<'ios' | 'android'>('ios');
  
  // Mobile Active Bottom Tab: 'home' | 'tasks' | 'analytics' | 'directives' | 'profile'
  const [activeTab, setActiveTab] = useState<'home' | 'tasks' | 'analytics' | 'directives' | 'profile'>('home');

  // Mobile Task Filter
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed' | 'delayed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mobile Selected Task Bottom Sheet
  const [selectedMobileTask, setSelectedMobileTask] = useState<Task | null>(null);

  // Mobile Quick Directive Sheet State
  const [showDirectiveSheet, setShowDirectiveSheet] = useState(false);
  const [directiveText, setDirectiveText] = useState('');

  // Mobile Quick New Task Sheet State
  const [showNewTaskSheet, setShowNewTaskSheet] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAssignee, setNewAssignee] = useState('Nguyễn Văn Cường');

  // Time format for status bar
  const currentTime = useMemo(() => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }, []);

  if (!isOpen) return null;

  // Filter tasks for mobile list
  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === 'in_progress' && t.status === 'completed') return false;
    if (statusFilter === 'completed' && t.status !== 'completed') return false;
    if (statusFilter === 'delayed') {
      if (t.status === 'completed') return false;
      if (!t.deadline) return false;
      const today = new Date().toISOString().substring(0, 10);
      if (t.deadline >= today) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.assignee.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate statistics
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const inProgressCount = tasks.filter((t) => t.status !== 'completed').length;
  const delayedCount = tasks.filter((t) => {
    if (t.status === 'completed') return false;
    if (!t.deadline) return false;
    return t.deadline < new Date().toISOString().substring(0, 10);
  }).length;

  const handleProgressUpdate = (newProgress: number) => {
    if (!selectedMobileTask || !onUpdateTask) return;
    const updated: Task = {
      ...selectedMobileTask,
      progress: newProgress,
      status: newProgress === 100 ? 'completed' : 'in_progress',
      updatedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    onUpdateTask(updated);
    setSelectedMobileTask(updated);
    toast.success('Cập nhật tiến độ thành công', `Nhiệm vụ [${updated.code}] đã đạt ${newProgress}%`);
  };

  const handleAddDirective = () => {
    if (!selectedMobileTask || !directiveText.trim() || !onUpdateTask) return;
    const newDir = {
      id: 'dir-' + Date.now(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN'),
      author: currentUser ? currentUser.fullName : 'Phạm Thanh Phong - Giám đốc',
      content: directiveText.trim(),
    };
    const updated: Task = {
      ...selectedMobileTask,
      leaderDirectives: [newDir, ...(selectedMobileTask.leaderDirectives || [])],
    };
    onUpdateTask(updated);
    setSelectedMobileTask(updated);
    setDirectiveText('');
    setShowDirectiveSheet(false);
    toast.success('Gửi chỉ đạo thành công', `Đã phát lệnh đôn đốc cho cán bộ ${updated.assignee}`);
  };

  const handleCreateNewTaskMobile = () => {
    if (!newTitle.trim() || !onAddTask) return;
    const newTask: Task = {
      id: 'task-' + Date.now(),
      code: `PS-${Math.floor(Math.random() * 900 + 100)}`,
      section: 'III. TỔ DỊCH VỤ CÔNG ÍCH - XÂY DỰNG',
      category: 'Nhiệm vụ phát sinh Mobile',
      title: newTitle.trim(),
      assignee: newAssignee,
      requirement: 'Tạo nhanh từ giao diện ứng dụng di động.',
      currentReport: 'Khởi tạo nhiệm vụ mới từ ứng dụng di động.',
      progress: 0,
      status: 'in_progress',
      priority: 'normal',
      assignedDate: new Date().toISOString().substring(0, 10),
      deadline: new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 10),
      progressLogs: [],
      leaderDirectives: [],
      updatedAt: 'Vừa xong',
    };
    onAddTask(newTask);
    setNewTitle('');
    setShowNewTaskSheet(false);
    toast.success('Tạo nhiệm vụ mới thành công', `Mã nhiệm vụ: ${newTask.code}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      
      {/* Container Overlay */}
      <div className="max-w-5xl w-full flex flex-col items-center justify-center space-y-4 my-auto">
        
        {/* Top Control Bar Header */}
        <div className="w-full bg-[#003366] text-white px-5 py-3 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Smartphone className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  MOCKUP MÔ PHỎNG NATIVE MOBILE APP
                </h2>
                <span className="bg-amber-400/20 text-amber-200 text-[10px] font-mono px-2 py-0.5 rounded font-bold border border-amber-300/30">
                  iOS & Android Ready
                </span>
              </div>
              <p className="text-xs text-blue-100">
                Thử nghiệm tương tác vuốt, chạm, đổi tab, cập nhật tiến độ & chỉ đạo trực tiếp như trên điện thoại thật
              </p>
            </div>
          </div>

          {/* Device & Theme Toggles */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-black/30 p-1 rounded-lg flex items-center gap-1 border border-white/15 text-xs">
              <button
                type="button"
                onClick={() => setDeviceFrame('ios')}
                className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  deviceFrame === 'ios'
                    ? 'bg-white text-[#003366] shadow-xs'
                    : 'text-blue-100 hover:text-white'
                }`}
              >
                iPhone 16 Pro
              </button>
              <button
                type="button"
                onClick={() => setDeviceFrame('android')}
                className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  deviceFrame === 'android'
                    ? 'bg-white text-[#003366] shadow-xs'
                    : 'text-blue-100 hover:text-white'
                }`}
              >
                Galaxy S24
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-blue-200 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              title="Đóng cửa sổ mô phỏng"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Smartphone Shell Frame */}
        <div 
          className={`relative transition-all duration-300 shadow-2xl bg-black border-[12px] border-slate-900 ${
            deviceFrame === 'ios'
              ? 'rounded-[50px] ring-4 ring-slate-800 w-[380px] sm:w-[410px] h-[780px]'
              : 'rounded-[36px] ring-4 ring-slate-800 w-[380px] sm:w-[410px] h-[780px]'
          } flex flex-col overflow-hidden select-none`}
        >
          {/* Hardware Top elements */}
          {deviceFrame === 'ios' ? (
            /* Dynamic Island (iPhone) */
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-40 flex items-center justify-between px-2.5">
              <div className="w-3 h-3 rounded-full bg-slate-900/90 border border-slate-800" />
              <div className="w-2.5 h-2.5 rounded-full bg-blue-950/80" />
            </div>
          ) : (
            /* Punch hole camera (Android) */
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-950 border border-slate-800 rounded-full z-40" />
          )}

          {/* Status Bar */}
          <div className="bg-[#003366] text-white px-6 pt-3 pb-1 flex items-center justify-between text-xs font-semibold z-30 shrink-0">
            <span className="font-mono text-[11px] tracking-tight">{currentTime}</span>
            <div className="flex items-center gap-1.5 text-[10px]">
              <Signal className="w-3 h-3 text-white" />
              <Wifi className="w-3 h-3 text-white" />
              <div className="flex items-center gap-0.5">
                <span className="font-mono text-[10px]">98%</span>
                <Battery className="w-3.5 h-3.5 text-emerald-300" />
              </div>
            </div>
          </div>

          {/* Mobile Screen App Main Content Area */}
          <div className="flex-1 bg-[#F4F6F9] dark:bg-[#0b1120] text-slate-900 dark:text-slate-100 flex flex-col overflow-hidden relative">
            
            {/* Native Mobile App Header */}
            <div className="bg-[#003366] text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-md border-b border-[#002244]">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold border border-white/20 shrink-0">
                  <Building2 className="w-4.5 h-4.5 text-amber-300" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold text-blue-200 block truncate uppercase">UBND PHƯỜNG HỐ NAI</span>
                  <h1 className="text-xs font-bold text-white truncate tracking-tight">NHIỆM VỤ & TIẾN ĐỘ</h1>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('directives')}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white relative cursor-pointer"
                >
                  <Bell className="w-4 h-4 text-amber-300" />
                  {delayedCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">
                      {delayedCount}
                    </span>
                  )}
                </button>
                
                <div className="w-7 h-7 rounded-full bg-blue-400 text-[#003366] font-bold text-[10px] flex items-center justify-center border border-white/30">
                  {currentUser ? currentUser.fullName.split(' ').slice(-1)[0][0] : 'CB'}
                </div>
              </div>
            </div>

            {/* Scrollable View Content depending on Active Tab */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3.5 pb-16">
              
              {/* TAB 1: TRANG CHỦ (HOME) */}
              {activeTab === 'home' && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  
                  {/* Banner chào mừng & Phân hệ */}
                  <div className="bg-gradient-to-r from-[#003366] to-[#0a4682] text-white p-3.5 rounded-xl shadow-xs space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-blue-200 uppercase font-semibold">Chào đồng chí,</span>
                        <h2 className="text-sm font-bold text-white">{currentUser?.fullName || 'Phạm Thanh Phong'}</h2>
                      </div>
                      <span className="bg-amber-400/20 text-amber-200 border border-amber-300/30 text-[10px] font-bold px-2 py-0.5 rounded">
                        {isLeader ? 'BAN GIÁM ĐỐC' : 'VIÊN CHỨC'}
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-100 leading-snug">
                      Đã đồng bộ trực tuyến dữ liệu chỉ đạo & báo cáo tiến độ mới nhất.
                    </p>
                  </div>

                  {/* Top KPI Grid Cards */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white dark:bg-[#131c31] p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <div className="flex items-center justify-between text-slate-500 mb-1">
                        <span className="text-[11px] font-semibold">Tổng nhiệm vụ</span>
                        <Layers className="w-3.5 h-3.5 text-[#003366] dark:text-sky-400" />
                      </div>
                      <div className="text-lg font-black text-[#003366] dark:text-sky-400 font-mono">
                        <CountUpNumber value={totalCount} />
                      </div>
                      <span className="text-[10px] text-slate-400">Công việc giao ban</span>
                    </div>

                    <div className="bg-white dark:bg-[#131c31] p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <div className="flex items-center justify-between text-slate-500 mb-1">
                        <span className="text-[11px] font-semibold">Hoàn thành</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div className="text-lg font-black text-emerald-600 font-mono">
                        <CountUpNumber value={completedCount} />
                      </div>
                      <span className="text-[10px] text-emerald-600 font-medium">
                        Đạt {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}% KPI
                      </span>
                    </div>

                    <div className="bg-white dark:bg-[#131c31] p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <div className="flex items-center justify-between text-slate-500 mb-1">
                        <span className="text-[11px] font-semibold">Đang triển khai</span>
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <div className="text-lg font-black text-blue-600 font-mono">
                        <CountUpNumber value={inProgressCount} />
                      </div>
                      <span className="text-[10px] text-blue-600 font-medium">Thường xuyên</span>
                    </div>

                    <div className="bg-white dark:bg-[#131c31] p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <div className="flex items-center justify-between text-slate-500 mb-1">
                        <span className="text-[11px] font-semibold">Cần đôn đốc</span>
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      </div>
                      <div className="text-lg font-black text-red-600 font-mono">
                        <CountUpNumber value={delayedCount} />
                      </div>
                      <span className="text-[10px] text-red-600 font-medium">Nhiệm vụ trễ hạn</span>
                    </div>
                  </div>

                  {/* Section Title & Urgent Action Tasks List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Nhiệm vụ quan trọng
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveTab('tasks')}
                        className="text-[11px] text-[#003366] dark:text-sky-400 font-bold flex items-center cursor-pointer"
                      >
                        Xem tất cả <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {tasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          onClick={() => setSelectedMobileTask(task)}
                          className="bg-white dark:bg-[#131c31] p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-[#003366] transition-all cursor-pointer space-y-2 active:scale-[0.99]"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] font-bold text-red-700 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 px-1.5 py-0.5 rounded">
                              {task.code}
                            </span>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${getStatusBadgeClasses(task.status)}`}>
                              {getStatusLabel(task.status)}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                            {task.title}
                          </h4>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                              👤 {task.assignee}
                            </span>
                            <span className="font-mono text-slate-500">
                              {task.deadline ? formatDateDisplay(task.deadline) : '—'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: CÔNG VIỆC / NHIỆM VỤ (TASKS LIST) */}
              {activeTab === 'tasks' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  
                  {/* Mobile Search & Filter Pills */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm mã, tên nhiệm vụ, cán bộ..."
                        className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#131c31] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pb-1">
                      <button
                        type="button"
                        onClick={() => setStatusFilter('all')}
                        className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ${
                          statusFilter === 'all'
                            ? 'bg-[#003366] text-white'
                            : 'bg-white dark:bg-[#131c31] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        Tất cả ({totalCount})
                      </button>

                      <button
                        type="button"
                        onClick={() => setStatusFilter('in_progress')}
                        className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ${
                          statusFilter === 'in_progress'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-[#131c31] text-blue-700 border border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        Đang làm ({inProgressCount})
                      </button>

                      <button
                        type="button"
                        onClick={() => setStatusFilter('completed')}
                        className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ${
                          statusFilter === 'completed'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white dark:bg-[#131c31] text-emerald-700 border border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        Đã xong ({completedCount})
                      </button>

                      <button
                        type="button"
                        onClick={() => setStatusFilter('delayed')}
                        className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ${
                          statusFilter === 'delayed'
                            ? 'bg-red-600 text-white'
                            : 'bg-white dark:bg-[#131c31] text-red-700 border border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        Trễ hạn ({delayedCount})
                      </button>
                    </div>
                  </div>

                  {/* Task Cards Feed */}
                  <div className="space-y-2">
                    {filteredTasks.length === 0 ? (
                      <div className="bg-white dark:bg-[#131c31] p-6 text-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                        Không tìm thấy nhiệm vụ phù hợp
                      </div>
                    ) : (
                      filteredTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => setSelectedMobileTask(task)}
                          className="bg-white dark:bg-[#131c31] p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-[#003366] transition-all cursor-pointer space-y-2 active:scale-[0.99]"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] font-bold text-red-700 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 px-1.5 py-0.5 rounded">
                              {task.code}
                            </span>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${getStatusBadgeClasses(task.status)}`}>
                              {getStatusLabel(task.status)}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                            {task.title}
                          </h4>

                          {/* Progress bar */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span>Tiến độ:</span>
                              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{task.progress || 0}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  task.progress === 100 ? 'bg-emerald-600' : 'bg-[#003366]'
                                }`}
                                style={{ width: `${task.progress || 0}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                              👤 {task.assignee}
                            </span>
                            <span className="font-mono text-slate-500">
                              Hạn: {task.deadline ? formatDateDisplay(task.deadline) : '—'}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                </div>
              )}

              {/* TAB 3: BÁO CÁO THỐNG KÊ (ANALYTICS) */}
              {activeTab === 'analytics' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="bg-white dark:bg-[#131c31] p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <h3 className="text-xs font-bold text-[#003366] dark:text-sky-400 uppercase flex items-center gap-1.5">
                        <BarChart2 className="w-4 h-4 text-emerald-600" />
                        TỔNG HỢP HIỆU SUẤT KHU VỰC
                      </h3>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">
                        UBND Phường
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-600 dark:text-slate-400">Tỷ lệ hoàn thành công việc</span>
                          <span className="font-bold text-emerald-600 font-mono">
                            {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-600 dark:text-slate-400">Tỷ lệ nhiệm vụ đúng hạn</span>
                          <span className="font-bold text-blue-600 font-mono">
                            {totalCount > 0 ? Math.round(((totalCount - delayedCount) / totalCount) * 100) : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${totalCount > 0 ? Math.round(((totalCount - delayedCount) / totalCount) * 100) : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#003366] text-white p-3.5 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold uppercase flex items-center gap-1.5 text-amber-300">
                      <FileSpreadsheet className="w-4 h-4" />
                      Xuất Báo Cáo Công Vụ (.XLSX)
                    </h4>
                    <p className="text-[11px] text-blue-100 leading-snug">
                      Đã tối ưu hóa file Excel báo cáo thống kê theo đúng biểu mẫu quy định của UBND tỉnh & phường.
                    </p>
                    <button
                      type="button"
                      onClick={() => toast.success('Đã gửi báo cáo Excel', 'File báo cáo đã được tải xuống thiết bị mobile')}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
                    >
                      Tải Xuất Báo Cáo Ngay
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: CHỈ ĐẠO ĐÔN ĐỐC (DIRECTIVES) */}
              {activeTab === 'directives' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-red-600" />
                      LỊCH SỬ CHỈ ĐẠO CỦA LÃNH ĐẠO
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {tasks.filter((t) => t.leaderDirectives && t.leaderDirectives.length > 0).length === 0 ? (
                      <div className="bg-white dark:bg-[#131c31] p-6 text-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                        Chưa có ý kiến chỉ đạo đôn đốc mới
                      </div>
                    ) : (
                      tasks
                        .filter((t) => t.leaderDirectives && t.leaderDirectives.length > 0)
                        .map((task) => (
                          <div
                            key={task.id}
                            onClick={() => setSelectedMobileTask(task)}
                            className="bg-white dark:bg-[#131c31] p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2 cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] font-bold text-red-700 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 px-1.5 py-0.5 rounded">
                                {task.code}
                              </span>
                              <span className="text-[10px] text-slate-500">👤 {task.assignee}</span>
                            </div>

                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                              {task.title}
                            </h4>

                            {task.leaderDirectives?.slice(0, 1).map((dir) => (
                              <div key={dir.id} className="p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-[11px] text-amber-900 dark:text-amber-200 leading-snug space-y-1">
                                <div className="font-bold text-red-700 dark:text-red-400 text-[10px] flex items-center justify-between">
                                  <span>{dir.author}</span>
                                  <span className="font-mono text-slate-400">{dir.timestamp}</span>
                                </div>
                                <p>"{dir.content}"</p>
                              </div>
                            ))}
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: CÁ NHÂN & CÀI ĐẶT (PROFILE) */}
              {activeTab === 'profile' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="bg-white dark:bg-[#131c31] p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-2 shadow-2xs">
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-sm">
                      {currentUser ? currentUser.fullName.split(' ').slice(-1)[0][0] : 'CB'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{currentUser?.fullName || 'Cán bộ'}</h3>
                      <span className="text-xs text-slate-500">{currentUser?.position || 'Chức vụ công tác'}</span>
                    </div>
                    <span className="inline-block bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 px-2.5 py-0.5 rounded text-[11px] font-semibold border border-blue-200 dark:border-blue-800">
                      {currentUser?.unit || 'Ủy Ban Nhân Dân Phường Hố Nai'}
                    </span>
                  </div>

                  <div className="bg-white dark:bg-[#131c31] rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                    <div 
                      onClick={toggleTheme}
                      className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {isDark ? <Moon className="w-4 h-4 text-sky-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Giao diện Sáng / Tối</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase">{isDark ? 'Chế độ Tối' : 'Chế độ Sáng'}</span>
                    </div>

                    <div className="p-3 flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Phiên bản Mobile Native</span>
                      <span className="font-mono font-bold text-emerald-600">v2.4.0 (Capacitor)</span>
                    </div>

                    <div className="p-3 flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Cơ sở dữ liệu Trực tuyến</span>
                      <span className="font-mono font-bold text-blue-600">Cloud Firestore</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Mobile Bottom Navigation Bar (Tab Bar) */}
            <div className="bg-white dark:bg-[#111c35] border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shrink-0 z-30 shadow-lg">
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors cursor-pointer ${
                  activeTab === 'home'
                    ? 'text-[#003366] dark:text-sky-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Trang chủ</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tasks')}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors cursor-pointer ${
                  activeTab === 'tasks'
                    ? 'text-[#003366] dark:text-sky-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>Nhiệm vụ</span>
              </button>

              {/* Floating Center Action Button */}
              <button
                type="button"
                onClick={() => setShowNewTaskSheet(true)}
                className="w-10 h-10 -mt-5 rounded-full bg-[#003366] hover:bg-[#002244] text-white flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900 cursor-pointer active:scale-95 transition-transform"
                title="Tạo nhanh nhiệm vụ mới"
              >
                <Plus className="w-5 h-5 text-white" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'text-[#003366] dark:text-sky-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                <BarChart2 className="w-4 h-4" />
                <span>Báo cáo</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors cursor-pointer ${
                  activeTab === 'profile'
                    ? 'text-[#003366] dark:text-sky-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Cá nhân</span>
              </button>
            </div>

            {/* Bottom Home Indicator Bar (iOS/Android) */}
            <div className="bg-white dark:bg-[#111c35] py-1 flex justify-center shrink-0">
              <div className="w-32 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* MODAL SHEET: TASK DETAIL SHEET */}
            {selectedMobileTask && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex flex-col justify-end animate-in fade-in duration-150">
                <div className="bg-white dark:bg-[#131c31] rounded-t-2xl max-h-[85%] flex flex-col p-4 space-y-3.5 animate-in slide-in-from-bottom duration-200">
                  <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />

                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-red-700 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 px-2 py-0.5 rounded">
                        {selectedMobileTask.code}
                      </span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${getStatusBadgeClasses(selectedMobileTask.status)}`}>
                        {getStatusLabel(selectedMobileTask.status)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedMobileTask(null)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="overflow-y-auto space-y-3 pr-1 text-xs">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {selectedMobileTask.title}
                    </h3>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg space-y-1 text-[11px]">
                      <div className="text-slate-600 dark:text-slate-400">👤 Cán bộ thực hiện: <strong className="text-slate-900 dark:text-slate-100">{selectedMobileTask.assignee}</strong></div>
                      <div className="text-slate-600 dark:text-slate-400">📅 Hạn hoàn thành: <strong className="text-slate-900 dark:text-slate-100">{selectedMobileTask.deadline ? formatDateDisplay(selectedMobileTask.deadline) : 'Chưa thiết lập'}</strong></div>
                      <div className="text-slate-600 dark:text-slate-400">📋 Yêu cầu: <span className="text-slate-800 dark:text-slate-200">{selectedMobileTask.requirement}</span></div>
                    </div>

                    {/* Progress Slider adjustment */}
                    <div className="space-y-1.5 p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/50">
                      <div className="flex justify-between text-xs font-bold text-[#003366] dark:text-sky-300">
                        <span>Cập nhật tiến độ trực tiếp:</span>
                        <span className="font-mono text-sm">{selectedMobileTask.progress || 0}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="10"
                        value={selectedMobileTask.progress || 0}
                        onChange={(e) => handleProgressUpdate(parseInt(e.target.value, 10))}
                        className="w-full accent-[#003366] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Leader Directives Feed */}
                    {selectedMobileTask.leaderDirectives && selectedMobileTask.leaderDirectives.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-[#003366] dark:text-sky-400 flex items-center gap-1 text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5 text-red-600" /> Ý KIẾN CHỈ ĐẠO CỦA LÃNH ĐẠO ({selectedMobileTask.leaderDirectives.length}):
                        </h4>
                        <div className="space-y-1.5">
                          {selectedMobileTask.leaderDirectives.map((dir) => (
                            <div key={dir.id} className="p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-[11px] leading-snug">
                              <div className="font-bold text-red-700 dark:text-red-400 text-[10px] flex items-center justify-between">
                                <span>{dir.author}</span>
                                <span className="font-mono text-slate-400">{dir.timestamp}</span>
                              </div>
                              <p className="mt-0.5 text-slate-800 dark:text-slate-200">"{dir.content}"</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800">
                    {isLeader && (
                      <button
                        type="button"
                        onClick={() => setShowDirectiveSheet(true)}
                        className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Phát Lệnh Chỉ Đạo</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleProgressUpdate(100)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Đánh Dấu Hoàn Thành</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL SHEET: DIRECTIVE INPUT SHEET */}
            {showDirectiveSheet && selectedMobileTask && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-xs z-50 flex flex-col justify-end">
                <div className="bg-white dark:bg-[#131c31] rounded-t-2xl p-4 space-y-3 animate-in slide-in-from-bottom duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h3 className="text-xs font-bold text-red-700 dark:text-red-400 uppercase flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Chỉ Đạo Trực Tiếp Nhiệm Vụ [{selectedMobileTask.code}]
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowDirectiveSheet(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <textarea
                    rows={3}
                    value={directiveText}
                    onChange={(e) => setDirectiveText(e.target.value)}
                    placeholder="Nhập nội dung chỉ đạo đôn đốc cán bộ..."
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDirectiveSheet(false)}
                      className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleAddDirective}
                      className="flex-1 py-2 bg-red-700 hover:bg-red-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Gửi Chỉ Đạo</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL SHEET: NEW TASK SHEET */}
            {showNewTaskSheet && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-xs z-50 flex flex-col justify-end">
                <div className="bg-white dark:bg-[#131c31] rounded-t-2xl p-4 space-y-3 animate-in slide-in-from-bottom duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h3 className="text-xs font-bold text-[#003366] dark:text-sky-400 uppercase flex items-center gap-1.5">
                      <Plus className="w-4 h-4" />
                      Tạo Nhanh Nhiệm Vụ Phát Sinh
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowNewTaskSheet(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Tên nhiệm vụ công vụ:
                      </label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Nhập tên công việc phát sinh..."
                        className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Cán bộ được giao:
                      </label>
                      <input
                        type="text"
                        value={newAssignee}
                        onChange={(e) => setNewAssignee(e.target.value)}
                        placeholder="Tên cán bộ chủ trì..."
                        className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowNewTaskSheet(false)}
                      className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateNewTaskMobile}
                      className="flex-1 py-2 bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Phân Công</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
