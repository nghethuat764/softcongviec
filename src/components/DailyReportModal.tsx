import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  X, 
  FileSpreadsheet, 
  Calendar, 
  Filter, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Users, 
  Search, 
  BarChart3, 
  TrendingUp, 
  Building2, 
  ArrowRight,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { useDepartments } from '../context/DepartmentContext';
import { isTaskRelatedToStaff, getStatusLabel, getStatusBadgeClasses, getSectionShortName } from '../utils/helpers';

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onSelectTask?: (task: Task) => void;
}

// Parse date string into Date object safely
function parseComparableDate(dateStr?: string): Date | null {
  if (!dateStr || !dateStr.trim()) return null;
  const s = dateStr.trim();

  // Format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const parts = s.substring(0, 10).split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  // Format: DD/MM/YYYY
  const dmyMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    return new Date(year, month, day);
  }

  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return '—';
  const d = parseComparableDate(dateStr);
  if (!d) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function toInputDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const DailyReportModal: React.FC<DailyReportModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onSelectTask,
}) => {
  const { users } = useAuth();
  const { departments } = useDepartments();

  // Default date range: From beginning of current month to end of current month
  const today = useMemo(() => new Date(), []);
  
  const [datePreset, setDatePreset] = useState<'all' | 'today' | '7days' | 'month' | 'quarter' | 'year' | 'custom'>('all');
  const [fromDate, setFromDate] = useState<string>(() => {
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return toInputDateString(firstDay);
  });
  const [toDate, setToDate] = useState<string>(() => {
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return toInputDateString(lastDay);
  });

  const [dateFieldFilter, setDateFieldFilter] = useState<'deadline' | 'startDate' | 'updatedAt' | 'any'>('deadline');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'delayed' | 'in_progress'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'staff' | 'details'>('overview');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Handler for quick presets
  const applyPreset = (preset: 'all' | 'today' | '7days' | 'month' | 'quarter' | 'year') => {
    setDatePreset(preset);
    const now = new Date();
    if (preset === 'all') {
      return;
    } else if (preset === 'today') {
      const str = toInputDateString(now);
      setFromDate(str);
      setToDate(str);
    } else if (preset === '7days') {
      const past = new Date(now);
      past.setDate(past.getDate() - 7);
      setFromDate(toInputDateString(past));
      setToDate(toInputDateString(now));
    } else if (preset === 'month') {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setFromDate(toInputDateString(first));
      setToDate(toInputDateString(last));
    } else if (preset === 'quarter') {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      const first = new Date(now.getFullYear(), qMonth, 1);
      const last = new Date(now.getFullYear(), qMonth + 3, 0);
      setFromDate(toInputDateString(first));
      setToDate(toInputDateString(last));
    } else if (preset === 'year') {
      const first = new Date(now.getFullYear(), 0, 1);
      const last = new Date(now.getFullYear(), 11, 31);
      setFromDate(toInputDateString(first));
      setToDate(toInputDateString(last));
    }
  };

  // Check if a task is overdue (trễ hạn)
  const isTaskDelayed = (task: Task): boolean => {
    if (task.status === 'delayed') return true;
    if (task.status === 'completed') return false;
    if (!task.deadline) return false;
    const d = parseComparableDate(task.deadline);
    if (!d) return false;
    // Set time to end of deadline day
    d.setHours(23, 59, 59, 999);
    return d.getTime() < today.getTime();
  };

  // Filter tasks based on date range and options
  const filteredTasks = tasks.filter((task) => {
    // 1. Date Range Filter
    if (datePreset !== 'all' && fromDate && toDate) {
      const fromD = parseComparableDate(fromDate);
      const toD = parseComparableDate(toDate);
      if (fromD && toD) {
        toD.setHours(23, 59, 59, 999);

        let taskDate: Date | null = null;
        if (dateFieldFilter === 'deadline') {
          taskDate = parseComparableDate(task.deadline) || parseComparableDate(task.startDate) || parseComparableDate(task.updatedAt);
        } else if (dateFieldFilter === 'startDate') {
          taskDate = parseComparableDate(task.startDate) || parseComparableDate(task.updatedAt);
        } else if (dateFieldFilter === 'updatedAt') {
          taskDate = parseComparableDate(task.updatedAt);
        } else {
          // any
          const d1 = parseComparableDate(task.deadline);
          const d2 = parseComparableDate(task.startDate);
          const d3 = parseComparableDate(task.updatedAt);
          taskDate = d1 || d2 || d3;
        }

        if (taskDate) {
          if (taskDate.getTime() < fromD.getTime() || taskDate.getTime() > toD.getTime()) {
            return false;
          }
        }
      }
    }

    // 2. Department filter
    if (selectedDepartment !== 'all') {
      const secNorm = task.section.toLowerCase();
      const selNorm = selectedDepartment.toLowerCase();
      if (!secNorm.includes(selNorm) && !selNorm.includes(secNorm)) {
        return false;
      }
    }

    // 3. Staff filter
    if (selectedStaffId !== 'all') {
      const targetUser = users.find((u) => u.id === selectedStaffId);
      if (targetUser) {
        if (!isTaskRelatedToStaff(task, targetUser.id, targetUser.fullName)) {
          return false;
        }
      }
    }

    // 4. Status filter (Hoàn thành / Trễ hạn / Đang thực hiện)
    if (statusFilter === 'completed') {
      if (task.status !== 'completed') return false;
    } else if (statusFilter === 'delayed') {
      if (!isTaskDelayed(task)) return false;
    } else if (statusFilter === 'in_progress') {
      if (task.status === 'completed' || isTaskDelayed(task)) return false;
    }

    // 5. Search text filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        task.title.toLowerCase().includes(q) ||
        task.code.toLowerCase().includes(q) ||
        task.assignee.toLowerCase().includes(q) ||
        (task.coAssignees && task.coAssignees.some((c) => c.toLowerCase().includes(q))) ||
        task.requirement.toLowerCase().includes(q) ||
        (task.currentReport && task.currentReport.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  // Calculate high-level KPIs
  const totalCount = filteredTasks.length;
  const completedCount = filteredTasks.filter((t) => t.status === 'completed').length;
  const delayedCount = filteredTasks.filter((t) => isTaskDelayed(t)).length;
  const inProgressCount = filteredTasks.filter((t) => t.status !== 'completed' && !isTaskDelayed(t)).length;

  const completedRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const delayedRate = totalCount > 0 ? Math.round((delayedCount / totalCount) * 100) : 0;
  const inProgressRate = totalCount > 0 ? Math.round((inProgressCount / totalCount) * 100) : 0;
  const avgProgress = totalCount > 0 ? Math.round(filteredTasks.reduce((s, t) => s + (t.progress || 0), 0) / totalCount) : 0;

  // Group performance by Staff member
  const staffStats = useMemo(() => {
    // Only evaluate staff accounts or active assignees
    const staffAccounts = users.filter((u) => u.role === 'STAFF' || u.id.startsWith('usr-'));

    return staffAccounts.map((user) => {
      const userTasks = filteredTasks.filter((t) => isTaskRelatedToStaff(t, user.id, user.fullName));
      const total = userTasks.length;
      const completed = userTasks.filter((t) => t.status === 'completed').length;
      const delayed = userTasks.filter((t) => isTaskDelayed(t)).length;
      const inProg = userTasks.filter((t) => t.status !== 'completed' && !isTaskDelayed(t)).length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      const delayedPct = total > 0 ? Math.round((delayed / total) * 100) : 0;
      const prog = total > 0 ? Math.round(userTasks.reduce((s, t) => s + (t.progress || 0), 0) / total) : 0;

      let rating = 'Đang theo dõi';
      let ratingColor = 'text-gray-600 bg-gray-50 border-gray-200';
      if (total > 0) {
        if (delayed > 0 && delayedPct >= 40) {
          rating = 'Cần đôn đốc (Trễ hạn nhiều)';
          ratingColor = 'text-red-700 bg-red-50 border-red-200';
        } else if (delayed > 0) {
          rating = 'Có nhiệm vụ trễ hạn';
          ratingColor = 'text-amber-700 bg-amber-50 border-amber-200';
        } else if (rate >= 80) {
          rating = 'Tiến độ xuất sắc';
          ratingColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
        } else if (rate >= 50) {
          rating = 'Đạt tiến độ tốt';
          ratingColor = 'text-blue-700 bg-blue-50 border-blue-200';
        } else {
          rating = 'Đang tích cực triển khai';
          ratingColor = 'text-indigo-700 bg-indigo-50 border-indigo-200';
        }
      }

      return {
        user,
        total,
        completed,
        delayed,
        inProg,
        rate,
        prog,
        rating,
        ratingColor,
        tasks: userTasks,
      };
    }).sort((a, b) => b.total - a.total);
  }, [filteredTasks, users]);

  // Handle Export Excel (.xlsx)
  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      const timeRangeText = datePreset === 'all' 
        ? 'Toàn bộ thời gian' 
        : `Từ ngày ${formatDateDisplay(fromDate)} đến ngày ${formatDateDisplay(toDate)}`;

      // 1. Sheet 1: Tổng hợp chung & Thống kê theo Viên chức
      const summaryHeader = [
        ['ỦY BAN NHÂN DÂN PHƯỜNG HỐ NAI', '', '', '', 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM'],
        ['TRUNG TÂM DỊCH VỤ TỔNG HỢP', '', '', '', 'Độc lập - Tự do - Hạnh phúc'],
        [''],
        ['BÁO CÁO THỐNG KÊ NHIỆM VỤ THEO NGÀY & TIẾN ĐỘ VIÊN CHỨC'],
        [`Thời gian thống kê: ${timeRangeText}`],
        [`Thời điểm lập báo cáo: ${new Date().toLocaleString('vi-VN')}`],
        [''],
        ['I. TỔNG HỢP CHỈ SỐ TOÀN HỆ THỐNG'],
        ['Chỉ tiêu', 'Số lượng', 'Tỷ lệ (%)', 'Ghi chú'],
        ['Tổng số nhiệm vụ:', totalCount, '100%', 'Số việc trong kỳ báo cáo'],
        ['Nhiệm vụ đã hoàn thành:', completedCount, `${completedRate}%`, 'Đạt yêu cầu'],
        ['Nhiệm vụ trễ hạn / quá hạn:', delayedCount, `${delayedRate}%`, 'Cần lãnh đạo đôn đốc'],
        ['Nhiệm vụ đang triển khai:', inProgressCount, `${inProgressRate}%`, 'Trong tiến độ kiểm soát'],
        ['Tiến độ trung bình toàn hệ thống:', `${avgProgress}%`, '—', 'Điểm tiến độ bình quân'],
        [''],
        ['II. BẢNG THỐNG KÊ CHI TIẾT TỪNG VIÊN CHỨC'],
        [
          'STT', 
          'Họ và tên viên chức', 
          'Chức danh / Vị trí', 
          'Phòng ban / Tổ chuyên môn', 
          'Tổng số việc', 
          'Đã hoàn thành', 
          'Trễ hạn', 
          'Đang thực hiện', 
          'Tỷ lệ hoàn thành (%)', 
          'Tiến độ TB (%)', 
          'Đánh giá hiệu suất'
        ],
      ];

      const staffRows = staffStats.map((s, idx) => [
        idx + 1,
        s.user.fullName,
        s.user.position,
        s.user.unit,
        s.total,
        s.completed,
        s.delayed,
        s.inProg,
        `${s.rate}%`,
        `${s.prog}%`,
        s.rating
      ]);

      const footerRows = [
        [''],
        ['', '', '', '', '', '..., ngày ... tháng ... năm 2026'],
        ['', 'NGƯỜI LẬP BIỂU', '', '', '', 'BAN GIÁM ĐỐC'],
        ['', '(Ký, ghi rõ họ tên)', '', '', '', '(Ký, đóng dấu)']
      ];

      const wsSummaryData = [...summaryHeader, ...staffRows, ...footerRows];
      const wsSummary = XLSX.utils.aoa_to_sheet(wsSummaryData);

      wsSummary['!cols'] = [
        { wch: 6 },
        { wch: 28 },
        { wch: 26 },
        { wch: 32 },
        { wch: 14 },
        { wch: 15 },
        { wch: 14 },
        { wch: 16 },
        { wch: 20 },
        { wch: 15 },
        { wch: 26 },
      ];

      // 2. Sheet 2: Danh sách chi tiết từng nhiệm vụ
      const detailHeader = [
        ['DANH SÁCH CHI TIẾT CÁC NHIỆM VỤ THEO KỲ BÁO CÁO'],
        [`Thời gian: ${timeRangeText}`],
        [''],
        [
          'STT',
          'Mã việc',
          'Tên nhiệm vụ',
          'Phòng ban / Tổ',
          'Cán bộ phụ trách',
          'Phối hợp',
          'Hạn hoàn thành',
          'Ngày bắt đầu',
          'Tiến độ (%)',
          'Trạng thái',
          'Đánh giá hạn',
          'Nội dung chỉ đạo của Giám đốc',
          'Tình hình báo cáo tiến độ mới nhất',
          'Khó khăn, vướng mắc'
        ]
      ];

      const taskRows = filteredTasks.map((t, idx) => {
        const delayed = isTaskDelayed(t);
        const deadlineStatusText = t.status === 'completed'
          ? 'Đã hoàn thành'
          : delayed
            ? 'TRỄ HẠN'
            : 'Đúng hạn';

        return [
          idx + 1,
          t.code,
          t.title,
          t.section,
          t.assignee,
          (t.coAssignees || []).join(', ') || '—',
          formatDateDisplay(t.deadline),
          formatDateDisplay(t.startDate),
          `${t.progress}%`,
          getStatusLabel(t.status),
          deadlineStatusText,
          t.requirement,
          t.currentReport || 'Chưa cập nhật',
          t.difficulties || 'Không'
        ];
      });

      const wsDetailData = [...detailHeader, ...taskRows];
      const wsDetail = XLSX.utils.aoa_to_sheet(wsDetailData);

      wsDetail['!cols'] = [
        { wch: 6 },
        { wch: 10 },
        { wch: 42 },
        { wch: 30 },
        { wch: 24 },
        { wch: 20 },
        { wch: 16 },
        { wch: 14 },
        { wch: 12 },
        { wch: 18 },
        { wch: 16 },
        { wch: 45 },
        { wch: 45 },
        { wch: 30 },
      ];

      XLSX.utils.book_append_sheet(wb, wsSummary, '1. Tổng Hợp & Viên Chức');
      XLSX.utils.book_append_sheet(wb, wsDetail, '2. Chi Tiết Nhiệm Vụ');

      const fileDate = toInputDateString(new Date());
      const fileName = `BaoCao_ThongKe_TienDo_HoNai_${fileDate}.xlsx`;
      XLSX.writeFile(wb, fileName);

      setExportNotice(`Đã xuất báo cáo thành công file "${fileName}"!`);
      setTimeout(() => setExportNotice(null), 4000);
    } catch (err) {
      console.error('Lỗi xuất file excel:', err);
      setExportNotice('Không thể xuất file Excel. Vui lòng thử lại!');
      setTimeout(() => setExportNotice(null), 4000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[10px] shadow-2xl border border-[#E5E7EB] max-w-6xl w-full flex flex-col max-h-[94vh] overflow-hidden">
        
        {/* Header Modal */}
        <div className="bg-[#003366] text-white p-4 sm:p-5 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-[8px] bg-white/10 border border-white/20 flex items-center justify-center text-blue-200 shrink-0 mt-0.5">
              <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-700/80 text-emerald-100 px-2 py-0.5 rounded">
                  BÁO CÁO THỐNG KÊ TIẾN ĐỘ
                </span>
                <span className="text-blue-200 text-[12px]">·</span>
                <span className="text-[12px] text-blue-100 font-medium">Trung tâm Dịch vụ Tổng hợp · UBND Phường Hố Nai</span>
              </div>
              <h2 className="text-[17px] sm:text-[19px] font-bold text-white mt-0.5 tracking-tight">
                Thống Kê Tiến Độ Nhiệm Vụ Theo Ngày & Đánh Giá Viên Chức
              </h2>
              <p className="text-[12px] sm:text-[13px] text-blue-200 mt-0.5 leading-snug">
                Theo dõi nhiệm vụ hoàn thành, trễ hạn, lọc theo thời gian từ ngày tới ngày, chi tiết từng viên chức và xuất file Excel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[8px] font-bold text-[13px] flex items-center gap-2 transition-colors cursor-pointer shadow-xs border border-emerald-400/40"
              title="Xuất toàn bộ báo cáo và bảng phân tích ra file Excel (.xlsx)"
            >
              <Download className="w-4 h-4 text-emerald-100" />
              <span className="hidden sm:inline">Xuất Excel (.xlsx)</span>
              <span className="sm:hidden">Excel</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white rounded-[8px] hover:bg-white/10 transition-colors cursor-pointer"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Export Notification Toast */}
        {exportNotice && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 flex items-center justify-between text-[13px] text-emerald-800 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{exportNotice}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setExportNotice(null)} 
              className="text-emerald-700 hover:text-emerald-900 font-bold p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filter Bar: Thống kê từ ngày tới ngày & Tùy chọn */}
        <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] space-y-3 shrink-0">
          {/* Row 1: Date Range & Quick Presets */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1 mr-1">
                <Calendar className="w-3.5 h-3.5 text-[#003366]" />
                Kỳ báo cáo:
              </span>
              <button
                type="button"
                onClick={() => applyPreset('all')}
                className={`px-2.5 py-1 rounded-[6px] text-[12px] font-semibold transition-colors cursor-pointer border ${
                  datePreset === 'all'
                    ? 'bg-[#003366] text-white border-[#003366]'
                    : 'bg-white text-[#475569] hover:bg-gray-100 border-[#CBD5E1]'
                }`}
              >
                Toàn bộ
              </button>
              <button
                type="button"
                onClick={() => applyPreset('today')}
                className={`px-2.5 py-1 rounded-[6px] text-[12px] font-semibold transition-colors cursor-pointer border ${
                  datePreset === 'today'
                    ? 'bg-[#003366] text-white border-[#003366]'
                    : 'bg-white text-[#475569] hover:bg-gray-100 border-[#CBD5E1]'
                }`}
              >
                Hôm nay
              </button>
              <button
                type="button"
                onClick={() => applyPreset('7days')}
                className={`px-2.5 py-1 rounded-[6px] text-[12px] font-semibold transition-colors cursor-pointer border ${
                  datePreset === '7days'
                    ? 'bg-[#003366] text-white border-[#003366]'
                    : 'bg-white text-[#475569] hover:bg-gray-100 border-[#CBD5E1]'
                }`}
              >
                7 ngày qua
              </button>
              <button
                type="button"
                onClick={() => applyPreset('month')}
                className={`px-2.5 py-1 rounded-[6px] text-[12px] font-semibold transition-colors cursor-pointer border ${
                  datePreset === 'month'
                    ? 'bg-[#003366] text-white border-[#003366]'
                    : 'bg-white text-[#475569] hover:bg-gray-100 border-[#CBD5E1]'
                }`}
              >
                Tháng này
              </button>
              <button
                type="button"
                onClick={() => applyPreset('quarter')}
                className={`px-2.5 py-1 rounded-[6px] text-[12px] font-semibold transition-colors cursor-pointer border ${
                  datePreset === 'quarter'
                    ? 'bg-[#003366] text-white border-[#003366]'
                    : 'bg-white text-[#475569] hover:bg-gray-100 border-[#CBD5E1]'
                }`}
              >
                Quý này
              </button>
              <button
                type="button"
                onClick={() => applyPreset('year')}
                className={`px-2.5 py-1 rounded-[6px] text-[12px] font-semibold transition-colors cursor-pointer border ${
                  datePreset === 'year'
                    ? 'bg-[#003366] text-white border-[#003366]'
                    : 'bg-white text-[#475569] hover:bg-gray-100 border-[#CBD5E1]'
                }`}
              >
                Năm 2026
              </button>
            </div>

            {/* Date Inputs: Từ ngày -> Đến ngày */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-white border border-[#CBD5E1] rounded-[6px] px-2.5 py-1 text-[13px] shadow-xs">
                <span className="text-[12px] text-[#64748B] font-medium">Từ ngày:</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setDatePreset('custom');
                  }}
                  className="bg-transparent border-0 text-[#1E293B] font-medium text-[13px] focus:outline-hidden cursor-pointer"
                />
              </div>

              <span className="text-[#94A3B8] font-bold">→</span>

              <div className="flex items-center gap-1.5 bg-white border border-[#CBD5E1] rounded-[6px] px-2.5 py-1 text-[13px] shadow-xs">
                <span className="text-[12px] text-[#64748B] font-medium">Đến ngày:</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setDatePreset('custom');
                  }}
                  className="bg-transparent border-0 text-[#1E293B] font-medium text-[13px] focus:outline-hidden cursor-pointer"
                />
              </div>

              {/* Lọc theo trường ngày */}
              <select
                value={dateFieldFilter}
                onChange={(e) => setDateFieldFilter(e.target.value as any)}
                className="bg-white border border-[#CBD5E1] rounded-[6px] px-2.5 py-1.5 text-[12px] font-medium text-[#334155] focus:outline-hidden cursor-pointer shadow-xs"
                title="Chọn căn cứ mốc ngày để thống kê"
              >
                <option value="deadline">Căn cứ: Hạn hoàn thành (Deadline)</option>
                <option value="startDate">Căn cứ: Ngày bắt đầu / Giao việc</option>
                <option value="updatedAt">Căn cứ: Ngày cập nhật báo cáo</option>
                <option value="any">Căn cứ: Mọi mốc thời gian</option>
              </select>
            </div>
          </div>

          {/* Row 2: Secondary Filters (Department, Staff, Status, Search) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 border-t border-[#E2E8F0]/60">
            {/* 1. Lọc theo phòng ban */}
            <div className="flex items-center gap-1.5 bg-white border border-[#CBD5E1] rounded-[6px] px-2.5 py-1.5 text-[13px]">
              <Building2 className="w-4 h-4 text-[#64748B] shrink-0" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full bg-transparent text-[#1E293B] font-medium text-[13px] focus:outline-hidden cursor-pointer truncate"
              >
                <option value="all">Tất cả phòng ban / Tổ</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Lọc theo viên chức */}
            <div className="flex items-center gap-1.5 bg-white border border-[#CBD5E1] rounded-[6px] px-2.5 py-1.5 text-[13px]">
              <Users className="w-4 h-4 text-[#64748B] shrink-0" />
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full bg-transparent text-[#1E293B] font-medium text-[13px] focus:outline-hidden cursor-pointer truncate"
              >
                <option value="all">Tất cả cán bộ, viên chức</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.position})
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Lọc theo tình trạng */}
            <div className="flex items-center gap-1.5 bg-white border border-[#CBD5E1] rounded-[6px] px-2.5 py-1.5 text-[13px]">
              <Filter className="w-4 h-4 text-[#64748B] shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full bg-transparent text-[#1E293B] font-medium text-[13px] focus:outline-hidden cursor-pointer"
              >
                <option value="all">Tất cả tình trạng</option>
                <option value="completed">Đã hoàn thành</option>
                <option value="delayed">Trễ hạn / Quá hạn</option>
                <option value="in_progress">Đang thực hiện đúng hạn</option>
              </select>
            </div>

            {/* 4. Ô tìm kiếm */}
            <div className="flex items-center gap-1.5 bg-white border border-[#CBD5E1] rounded-[6px] px-2.5 py-1.5 text-[13px]">
              <Search className="w-4 h-4 text-[#64748B] shrink-0" />
              <input
                type="text"
                placeholder="Tìm tên việc, mã số, nội dung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-[#1E293B] font-medium text-[13px] focus:outline-hidden"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="p-4 bg-white border-b border-[#E5E7EB] shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {/* Tổng số nhiệm vụ */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] p-3 text-left">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                Tổng số nhiệm vụ
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[24px] font-black text-[#0F172A] font-mono tabular-nums">
                  {totalCount}
                </span>
                <span className="text-[11px] text-[#64748B] font-medium">nhiệm vụ</span>
              </div>
            </div>

            {/* Hoàn thành */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-[8px] p-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  Đã hoàn thành
                </span>
                <span className="text-[11px] font-extrabold bg-emerald-200/70 text-emerald-900 px-1.5 py-0.2 rounded font-mono">
                  {completedRate}%
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[24px] font-black text-emerald-700 font-mono tabular-nums">
                  {completedCount}
                </span>
                <span className="text-[11px] text-emerald-800 font-medium">việc đạt</span>
              </div>
            </div>

            {/* Trễ hạn / Quá hạn */}
            <div className="bg-rose-50/80 border border-rose-200 rounded-[8px] p-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                  Trễ hạn / Quá hạn
                </span>
                <span className="text-[11px] font-extrabold bg-rose-200/70 text-rose-900 px-1.5 py-0.2 rounded font-mono">
                  {delayedRate}%
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[24px] font-black text-rose-700 font-mono tabular-nums">
                  {delayedCount}
                </span>
                <span className="text-[11px] text-rose-800 font-medium">cần đôn đốc</span>
              </div>
            </div>

            {/* Đang triển khai */}
            <div className="bg-blue-50/80 border border-blue-200 rounded-[8px] p-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                  Đang thực hiện
                </span>
                <span className="text-[11px] font-extrabold bg-blue-200/70 text-blue-900 px-1.5 py-0.2 rounded font-mono">
                  {inProgressRate}%
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[24px] font-black text-blue-700 font-mono tabular-nums">
                  {inProgressCount}
                </span>
                <span className="text-[11px] text-blue-800 font-medium">trong tiến độ</span>
              </div>
            </div>

            {/* Tiến độ trung bình */}
            <div className="col-span-2 sm:col-span-4 lg:col-span-1 bg-amber-50/80 border border-amber-200 rounded-[8px] p-3 text-left">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                Tiến độ bình quân
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[24px] font-black text-amber-700 font-mono tabular-nums">
                  {avgProgress}%
                </span>
                <span className="text-[11px] text-amber-800 font-medium">hoàn thành kỳ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs inside modal */}
        <div className="px-4 bg-white border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`py-3 text-[13px] font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
                activeTab === 'overview'
                  ? 'border-[#003366] text-[#003366]'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>1. Thống kê theo Viên chức ({staffStats.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`py-3 text-[13px] font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
                activeTab === 'details'
                  ? 'border-[#003366] text-[#003366]'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>2. Chi tiết danh sách nhiệm vụ ({filteredTasks.length})</span>
            </button>
          </div>

          <div className="text-[12px] text-[#64748B] hidden sm:block">
            Đang lọc: <strong className="text-[#0F172A]">{filteredTasks.length}</strong> / {tasks.length} nhiệm vụ
          </div>
        </div>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#F8FAFC]">
          
          {/* TAB 1: BẢNG THỐNG KÊ CHI TIẾT TỪNG VIÊN CHỨC */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-white rounded-[8px] border border-[#E2E8F0] shadow-xs overflow-hidden">
                <div className="p-3.5 bg-[#F1F5F9] border-b border-[#E2E8F0] flex items-center justify-between">
                  <div>
                    <h3 className="text-[14px] font-bold text-[#0F172A]">
                      Bảng Phân Tích Hiệu Suất & Đánh Giá Tiến Độ Từng Viên Chức
                    </h3>
                    <p className="text-[12px] text-[#64748B] mt-0.5">
                      Tổng hợp số lượng nhiệm vụ được phân công, tỷ lệ hoàn thành và các nhiệm vụ trễ hạn cần đôn đốc
                    </p>
                  </div>
                  <span className="text-[12px] bg-white border border-[#CBD5E1] text-[#334155] px-2.5 py-1 rounded-[6px] font-mono font-semibold">
                    {staffStats.length} Cán bộ / Viên chức
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[13px]">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569] font-bold text-[12px] uppercase tracking-wider">
                        <th className="py-2.5 px-3 text-center w-12">STT</th>
                        <th className="py-2.5 px-3 min-w-[200px]">Viên chức phụ trách</th>
                        <th className="py-2.5 px-3 min-w-[180px]">Phòng ban / Tổ</th>
                        <th className="py-2.5 px-3 text-center min-w-[90px]">Tổng việc</th>
                        <th className="py-2.5 px-3 text-center min-w-[90px] text-emerald-800">Hoàn thành</th>
                        <th className="py-2.5 px-3 text-center min-w-[90px] text-rose-800">Trễ hạn</th>
                        <th className="py-2.5 px-3 text-center min-w-[90px] text-blue-800">Đang làm</th>
                        <th className="py-2.5 px-3 min-w-[140px]">Tỷ lệ hoàn thành</th>
                        <th className="py-2.5 px-3 min-w-[170px]">Đánh giá tiến độ</th>
                        <th className="py-2.5 px-3 text-center w-24">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {staffStats.map((item, index) => (
                        <tr 
                          key={item.user.id} 
                          className="hover:bg-blue-50/40 transition-colors"
                        >
                          <td className="py-3 px-3 text-center font-mono text-[#64748B]">
                            {index + 1}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-[6px] flex items-center justify-center font-bold text-[12px] shrink-0 ${item.user.avatarBg}`}>
                                {item.user.fullName.split(' ').slice(-1)[0][0] || 'V'}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-[#0F172A] leading-tight truncate">
                                  {item.user.fullName}
                                </div>
                                <div className="text-[11px] text-[#64748B] mt-0.5 truncate">
                                  {item.user.position}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-[#475569] font-medium">
                            {item.user.unit}
                          </td>
                          <td className="py-3 px-3 text-center font-bold font-mono text-[14px] text-[#0F172A]">
                            {item.total}
                          </td>
                          <td className="py-3 px-3 text-center font-bold font-mono text-[14px] text-emerald-700">
                            {item.completed}
                          </td>
                          <td className="py-3 px-3 text-center font-bold font-mono text-[14px]">
                            {item.delayed > 0 ? (
                              <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-100 px-2 py-0.5 rounded font-bold">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                {item.delayed}
                              </span>
                            ) : (
                              <span className="text-gray-400">0</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center font-bold font-mono text-[14px] text-blue-700">
                            {item.inProg}
                          </td>
                          <td className="py-3 px-3">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] font-mono">
                                <span className="font-bold text-[#0F172A]">{item.rate}%</span>
                                <span className="text-[#64748B]">TB {item.prog}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className="bg-emerald-600 h-1.5 rounded-full transition-all"
                                  style={{ width: `${item.rate}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] font-semibold border ${item.ratingColor}`}>
                              {item.rating}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStaffId(item.user.id);
                                setActiveTab('details');
                              }}
                              className="px-2.5 py-1 bg-[#003366] hover:bg-[#002244] text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
                              title={`Xem chi tiết các nhiệm vụ của ${item.user.fullName}`}
                            >
                              Xem việc
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHI TIẾT DANH SÁCH NHIỆM VỤ */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="bg-white rounded-[8px] border border-[#E2E8F0] shadow-xs overflow-hidden">
                <div className="p-3.5 bg-[#F1F5F9] border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-[14px] font-bold text-[#0F172A]">
                      Chi Tiết Toàn Bộ Nhiệm Vụ Trong Kỳ Báo Cáo
                    </h3>
                    <p className="text-[12px] text-[#64748B] mt-0.5">
                      Hiển thị danh sách công việc, cán bộ phụ trách, tiến độ và tình hình thực hiện
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedStaffId !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setSelectedStaffId('all')}
                        className="text-[11px] bg-white border border-[#CBD5E1] text-[#003366] px-2.5 py-1 rounded-[6px] font-semibold hover:bg-gray-100 cursor-pointer"
                      >
                        Xóa lọc viên chức ({users.find(u => u.id === selectedStaffId)?.fullName})
                      </button>
                    )}
                    <span className="text-[12px] bg-white border border-[#CBD5E1] text-[#334155] px-2.5 py-1 rounded-[6px] font-mono font-semibold">
                      {filteredTasks.length} nhiệm vụ
                    </span>
                  </div>
                </div>

                {filteredTasks.length === 0 ? (
                  <div className="p-12 text-center text-[#64748B] space-y-2">
                    <FileSpreadsheet className="w-12 h-12 text-[#94A3B8] mx-auto opacity-50" />
                    <p className="text-[14px] font-semibold text-[#334155]">Không có nhiệm vụ nào phù hợp với bộ lọc</p>
                    <p className="text-[12px]">Vui lòng thử điều chỉnh lại khoảng thời gian hoặc chọn "Toàn bộ" để xem dữ liệu.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[13px]">
                      <thead>
                        <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569] font-bold text-[12px] uppercase tracking-wider">
                          <th className="py-2.5 px-3 text-center w-12">STT</th>
                          <th className="py-2.5 px-3 w-16">Mã</th>
                          <th className="py-2.5 px-3 min-w-[240px]">Nhiệm vụ & Yêu cầu chỉ đạo</th>
                          <th className="py-2.5 px-3 min-w-[160px]">Cán bộ phụ trách</th>
                          <th className="py-2.5 px-3 min-w-[150px]">Phòng ban / Tổ</th>
                          <th className="py-2.5 px-3 text-center min-w-[110px]">Hạn hoàn thành</th>
                          <th className="py-2.5 px-3 min-w-[110px]">Tiến độ (%)</th>
                          <th className="py-2.5 px-3 min-w-[130px]">Trạng thái</th>
                          <th className="py-2.5 px-3 min-w-[200px]">Báo cáo tiến độ mới nhất</th>
                          {onSelectTask && <th className="py-2.5 px-3 text-center w-20">Thao tác</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {filteredTasks.map((task, idx) => {
                          const delayed = isTaskDelayed(task);
                          return (
                            <tr key={task.id} className="hover:bg-blue-50/30 transition-colors">
                              <td className="py-3 px-3 text-center font-mono text-[#64748B]">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-[#003366] whitespace-nowrap">
                                {task.code}
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-semibold text-[#0F172A] leading-snug">
                                  {task.title}
                                </div>
                                <div className="text-[12px] text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                                  {task.requirement}
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-medium text-[#0F172A]">
                                  {task.assignee}
                                </div>
                                {task.coAssignees && task.coAssignees.length > 0 && (
                                  <div className="text-[11px] text-[#64748B] mt-0.5">
                                    PH: {task.coAssignees.join(', ')}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-3 text-[#475569]">
                                <span className="inline-block bg-gray-100 text-[#334155] px-2 py-0.5 rounded text-[11px] font-medium">
                                  {getSectionShortName(task.section)}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center whitespace-nowrap">
                                <div className="font-mono text-[12px] font-semibold text-[#1E293B]">
                                  {formatDateDisplay(task.deadline)}
                                </div>
                                {delayed && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 mt-0.5">
                                    <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                                    TRỄ HẠN
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3">
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                                    <span className={task.progress === 100 ? 'text-emerald-700' : 'text-[#0F172A]'}>
                                      {task.progress}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                      className={`h-1.5 rounded-full ${
                                        task.progress === 100 
                                          ? 'bg-emerald-600' 
                                          : delayed 
                                            ? 'bg-rose-600' 
                                            : 'bg-blue-600'
                                      }`}
                                      style={{ width: `${task.progress}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${getStatusBadgeClasses(task.status)}`}>
                                  {getStatusLabel(task.status)}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-[12px] text-[#475569] leading-relaxed">
                                {task.currentReport ? (
                                  <div className="line-clamp-2">
                                    {task.currentReport}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic">Chưa có báo cáo</span>
                                )}
                              </td>
                              {onSelectTask && (
                                <td className="py-3 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => onSelectTask(task)}
                                    className="p-1.5 text-[#003366] hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                    title="Xem chi tiết nhiệm vụ này"
                                  >
                                    <ArrowRight className="w-4 h-4" />
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-white border-t border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-[12px] text-[#64748B] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#003366]" />
            <span>Dữ liệu thống kê chuẩn theo thời gian thực từ hệ thống cơ sở dữ liệu</span>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-[8px] text-[13px] flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Xuất File Excel (.xlsx)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#334155] font-semibold rounded-[8px] text-[13px] transition-colors cursor-pointer"
            >
              Đóng Cửa Sổ
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
