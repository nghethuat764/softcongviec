import React, { useState, useMemo } from 'react';
import XLSX from 'xlsx-js-style';
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
  ChevronDown,
  SlidersHorizontal,
  ChevronUp
} from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { useDepartments } from '../context/DepartmentContext';
import { toast } from '../context/ToastContext';
import { isTaskRelatedToStaff, getStatusLabel, getStatusBadgeClasses, getSectionShortName } from '../utils/helpers';
import { CountUpNumber } from './CountUpNumber';

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

  const [dateFieldFilter, setDateFieldFilter] = useState<'assignedDate' | 'deadline' | 'startDate' | 'updatedAt' | 'any'>('assignedDate');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'delayed' | 'in_progress'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'staff' | 'details'>('overview');
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedDepartment !== 'all') count++;
    if (selectedStaffId !== 'all') count++;
    if (statusFilter !== 'all') count++;
    if (searchTerm.trim()) count++;
    if (datePreset !== 'all') count++;
    return count;
  }, [selectedDepartment, selectedStaffId, statusFilter, searchTerm, datePreset]);

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
        if (dateFieldFilter === 'assignedDate') {
          taskDate = parseComparableDate(task.assignedDate) || parseComparableDate(task.startDate);
        } else if (dateFieldFilter === 'deadline') {
          taskDate = parseComparableDate(task.deadline) || parseComparableDate(task.assignedDate) || parseComparableDate(task.startDate) || parseComparableDate(task.updatedAt);
        } else if (dateFieldFilter === 'startDate') {
          taskDate = parseComparableDate(task.startDate) || parseComparableDate(task.assignedDate) || parseComparableDate(task.updatedAt);
        } else if (dateFieldFilter === 'updatedAt') {
          taskDate = parseComparableDate(task.updatedAt);
        } else {
          // any
          const d0 = parseComparableDate(task.assignedDate);
          const d1 = parseComparableDate(task.deadline);
          const d2 = parseComparableDate(task.startDate);
          const d3 = parseComparableDate(task.updatedAt);
          taskDate = d0 || d1 || d2 || d3;
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

  // Handle Export Excel (.xlsx) with standard Government Statistical Form
  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      const timeRangeText = datePreset === 'all' 
        ? 'Toàn bộ thời gian' 
        : `Từ ngày ${formatDateDisplay(fromDate)} đến ngày ${formatDateDisplay(toDate)}`;

      const criterionText = dateFieldFilter === 'assignedDate'
        ? 'Ngày phân công nhiệm vụ'
        : dateFieldFilter === 'deadline'
          ? 'Hạn hoàn thành (Deadline)'
          : dateFieldFilter === 'startDate'
            ? 'Ngày bắt đầu / Giao việc'
            : dateFieldFilter === 'updatedAt'
              ? 'Ngày cập nhật tiến độ'
              : 'Mọi mốc thời gian';

      const departmentText = selectedDepartment === 'all' ? 'Tất cả các tổ chuyên môn' : selectedDepartment;
      const staffText = selectedStaffId === 'all' 
        ? 'Tất cả cán bộ, viên chức' 
        : (users.find((u) => u.id === selectedStaffId)?.fullName || selectedStaffId);
      const statusText = statusFilter === 'all' 
        ? 'Tất cả tình trạng' 
        : statusFilter === 'completed' 
          ? 'Đã hoàn thành' 
          : statusFilter === 'delayed' 
            ? 'Trễ hạn / Quá hạn' 
            : 'Đang thực hiện đúng hạn';

      // ==========================================
      // SHEET 1: FORM BÁO CÁO THỐNG KÊ TIẾN ĐỘ & VIÊN CHỨC
      // ==========================================
      const wsSummaryData: any[][] = [
        // Rows 0-2: National Motto & Agency
        ['ỦY BAN NHÂN DÂN PHƯỜNG HỐ NAI', '', '', '', 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', '', '', '', '', '', ''],
        ['TRUNG TÂM DỊCH VỤ TỔNG HỢP', '', '', '', 'Độc lập - Tự do - Hạnh phúc', '', '', '', '', '', ''],
        ['Số: ....../BC-TTDVTH', '', '', '', '--------------------------------', '', '', '', '', '', ''],
        [''],
        
        // Row 4-7: Report Title & Parameters
        ['BÁO CÁO THỐNG KÊ TIẾN ĐỘ NHIỆM VỤ VÀ ĐÁNH GIÁ VIÊN CHỨC', '', '', '', '', '', '', '', '', '', ''],
        [`Thời gian thống kê: ${timeRangeText}`, '', '', '', '', '', '', '', '', '', ''],
        [`Căn cứ: ${criterionText} | Phạm vi: ${departmentText} | Viên chức: ${staffText} | Tình trạng: ${statusText}`, '', '', '', '', '', '', '', '', '', ''],
        [`Thời điểm xuất dữ liệu: ${new Date().toLocaleString('vi-VN')}`, '', '', '', '', '', '', '', '', '', ''],
        [''],

        // Row 9: Section I Title (Form Thống Kê Tiến Độ)
        ['I. BẢNG TỔNG HỢP CHỈ SỐ TIẾN ĐỘ TOÀN HỆ THỐNG (FORM THỐNG KÊ TIẾN ĐỘ)', '', '', '', '', '', '', '', '', '', ''],
        
        // Row 10: KPI Table Header
        ['STT', 'Chỉ tiêu thống kê nhiệm vụ', '', '', 'Số lượng', '', 'Tỷ lệ (%)', '', 'Trạng thái / Đánh giá kiểm soát', '', ''],
        
        // Row 11-15: 5 Core Statistical Metrics
        [1, '1. Tổng số nhiệm vụ', '', '', totalCount, '', '100.0%', '', 'Toàn bộ nhiệm vụ trong kỳ báo cáo', '', ''],
        [2, '2. Đã hoàn thành', '', '', completedCount, '', `${completedRate}%`, '', 'Nhiệm vụ đã hoàn thành đạt yêu cầu', '', ''],
        [3, '3. Trễ hạn / Quá hạn', '', '', delayedCount, '', `${delayedRate}%`, '', 'Nhiệm vụ quá hạn cần lãnh đạo đôn đốc xử lý gấp', '', ''],
        [4, '4. Đang thực hiện', '', '', inProgressCount, '', `${inProgressRate}%`, '', 'Nhiệm vụ đang triển khai trong hạn kiểm soát', '', ''],
        [5, '5. Tiến độ bình quân toàn hệ thống', '', '', `${avgProgress}%`, '', '—', '', 'Điểm tiến độ bình quân toàn bộ công việc', '', ''],
        [''],

        // Row 17: Section II Title
        ['II. BẢNG THỐNG KÊ TIẾN ĐỘ CHI TIẾT TỪNG CÁN BỘ, VIÊN CHỨC', '', '', '', '', '', '', '', '', '', ''],
        
        // Row 18: Staff Table Header
        [
          'STT', 
          'Họ và tên viên chức', 
          'Chức danh / Vị trí', 
          'Phòng ban / Tổ chuyên môn', 
          'Tổng số nhiệm vụ', 
          'Đã hoàn thành', 
          'Trễ hạn', 
          'Đang thực hiện', 
          'Tiến độ bình quân (%)', 
          'Tỷ lệ hoàn thành (%)', 
          'Xếp loại hiệu suất'
        ],
      ];

      // Staff Data Rows
      staffStats.forEach((s, idx) => {
        wsSummaryData.push([
          idx + 1,
          s.user.fullName,
          s.user.position || 'Viên chức chuyên môn',
          s.user.unit || 'Tổ chuyên môn',
          s.total,
          s.completed,
          s.delayed,
          s.inProg,
          `${s.prog}%`,
          `${s.rate}%`,
          s.rating
        ]);
      });

      // Total Row for Staff Table
      const overallRating = completedRate >= 80 ? 'Hoàn thành xuất sắc' : completedRate >= 60 ? 'Hoàn thành tốt' : completedRate >= 40 ? 'Đạt yêu cầu' : 'Cần đôn đốc quyết liệt';
      wsSummaryData.push([
        'TỔNG CỘNG TOÀN HỆ THỐNG', '', '', '',
        totalCount,
        completedCount,
        delayedCount,
        inProgressCount,
        `${avgProgress}%`,
        `${completedRate}%`,
        overallRating
      ]);

      // Signatures
      const now = new Date();
      wsSummaryData.push(['']);
      wsSummaryData.push(['', '', '', '', '', '', '', `Hố Nai, ngày ${String(now.getDate()).padStart(2, '0')} tháng ${String(now.getMonth() + 1).padStart(2, '0')} năm ${now.getFullYear()}`, '', '', '']);
      wsSummaryData.push(['NGƯỜI LẬP BIỂU', '', '', '', 'PHỤ TRÁCH TỔ CHUYÊN MÔN', '', '', 'BAN GIÁM ĐỐC', '', '', '']);
      wsSummaryData.push(['(Ký, ghi rõ họ tên)', '', '', '', '(Ký, ghi rõ họ tên)', '', '', '(Ký, đóng dấu)', '', '', '']);
      wsSummaryData.push(['']);
      wsSummaryData.push(['']);
      wsSummaryData.push(['']);
      wsSummaryData.push(['', '', '', '', '', '', '', 'Phạm Thanh Phong', '', '', '']);

      const wsSummary = XLSX.utils.aoa_to_sheet(wsSummaryData);

      // Sheet 1 Merges
      const staffRowCount = staffStats.length;
      const totalRowIndex = 19 + staffRowCount;
      const signDateIndex = totalRowIndex + 2;
      const signTitleIndex = signDateIndex + 1;
      const signNoteIndex = signTitleIndex + 1;
      const signNameIndex = signNoteIndex + 4;

      const summaryMerges: XLSX.Range[] = [
        // Header
        { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
        { s: { r: 0, c: 4 }, e: { r: 0, c: 10 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
        { s: { r: 1, c: 4 }, e: { r: 1, c: 10 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
        { s: { r: 2, c: 4 }, e: { r: 2, c: 10 } },

        // Title
        { s: { r: 4, c: 0 }, e: { r: 4, c: 10 } },
        { s: { r: 5, c: 0 }, e: { r: 5, c: 10 } },
        { s: { r: 6, c: 0 }, e: { r: 6, c: 10 } },
        { s: { r: 7, c: 0 }, e: { r: 7, c: 10 } },

        // Section I Title
        { s: { r: 9, c: 0 }, e: { r: 9, c: 10 } },

        // Section I KPI Table
        { s: { r: 10, c: 1 }, e: { r: 10, c: 3 } },
        { s: { r: 10, c: 4 }, e: { r: 10, c: 5 } },
        { s: { r: 10, c: 6 }, e: { r: 10, c: 7 } },
        { s: { r: 10, c: 8 }, e: { r: 10, c: 10 } },

        // Metric 1: Tổng số nhiệm vụ
        { s: { r: 11, c: 1 }, e: { r: 11, c: 3 } },
        { s: { r: 11, c: 4 }, e: { r: 11, c: 5 } },
        { s: { r: 11, c: 6 }, e: { r: 11, c: 7 } },
        { s: { r: 11, c: 8 }, e: { r: 11, c: 10 } },

        // Metric 2: Đã hoàn thành
        { s: { r: 12, c: 1 }, e: { r: 12, c: 3 } },
        { s: { r: 12, c: 4 }, e: { r: 12, c: 5 } },
        { s: { r: 12, c: 6 }, e: { r: 12, c: 7 } },
        { s: { r: 12, c: 8 }, e: { r: 12, c: 10 } },

        // Metric 3: Trễ hạn
        { s: { r: 13, c: 1 }, e: { r: 13, c: 3 } },
        { s: { r: 13, c: 4 }, e: { r: 13, c: 5 } },
        { s: { r: 13, c: 6 }, e: { r: 13, c: 7 } },
        { s: { r: 13, c: 8 }, e: { r: 13, c: 10 } },

        // Metric 4: Đang thực hiện
        { s: { r: 14, c: 1 }, e: { r: 14, c: 3 } },
        { s: { r: 14, c: 4 }, e: { r: 14, c: 5 } },
        { s: { r: 14, c: 6 }, e: { r: 14, c: 7 } },
        { s: { r: 14, c: 8 }, e: { r: 14, c: 10 } },

        // Metric 5: Tiến độ bình quân
        { s: { r: 15, c: 1 }, e: { r: 15, c: 3 } },
        { s: { r: 15, c: 4 }, e: { r: 15, c: 5 } },
        { s: { r: 15, c: 6 }, e: { r: 15, c: 7 } },
        { s: { r: 15, c: 8 }, e: { r: 15, c: 10 } },

        // Section II Title
        { s: { r: 17, c: 0 }, e: { r: 17, c: 10 } },

        // Staff Total Row Merged Label (Cols 0-3)
        { s: { r: totalRowIndex, c: 0 }, e: { r: totalRowIndex, c: 3 } },

        // Signatures
        { s: { r: signDateIndex, c: 7 }, e: { r: signDateIndex, c: 10 } },
        { s: { r: signTitleIndex, c: 0 }, e: { r: signTitleIndex, c: 3 } },
        { s: { r: signTitleIndex, c: 4 }, e: { r: signTitleIndex, c: 6 } },
        { s: { r: signTitleIndex, c: 7 }, e: { r: signTitleIndex, c: 10 } },
        { s: { r: signNoteIndex, c: 0 }, e: { r: signNoteIndex, c: 3 } },
        { s: { r: signNoteIndex, c: 4 }, e: { r: signNoteIndex, c: 6 } },
        { s: { r: signNoteIndex, c: 7 }, e: { r: signNoteIndex, c: 10 } },
        { s: { r: signNameIndex, c: 7 }, e: { r: signNameIndex, c: 10 } },
      ];

      wsSummary['!merges'] = summaryMerges;

      wsSummary['!cols'] = [
        { wch: 6 },   // A: STT
        { wch: 30 },  // B: Họ và tên viên chức / Chỉ tiêu
        { wch: 25 },  // C: Chức danh / Vị trí
        { wch: 32 },  // D: Phòng ban / Tổ chuyên môn
        { wch: 18 },  // E: Tổng số nhiệm vụ
        { wch: 16 },  // F: Đã hoàn thành
        { wch: 15 },  // G: Trễ hạn
        { wch: 16 },  // H: Đang thực hiện
        { wch: 22 },  // I: Tiến độ bình quân (%)
        { wch: 22 },  // J: Tỷ lệ hoàn thành (%)
        { wch: 25 },  // K: Xếp loại hiệu suất
      ];

      // Row heights for crisp presentation
      const summaryRowHeights: { hpt: number }[] = [];
      summaryRowHeights[0] = { hpt: 22 };
      summaryRowHeights[1] = { hpt: 20 };
      summaryRowHeights[2] = { hpt: 18 };
      summaryRowHeights[3] = { hpt: 12 };
      summaryRowHeights[4] = { hpt: 28 }; // Main Title
      summaryRowHeights[5] = { hpt: 20 };
      summaryRowHeights[6] = { hpt: 18 };
      summaryRowHeights[7] = { hpt: 18 };
      summaryRowHeights[8] = { hpt: 14 };
      summaryRowHeights[9] = { hpt: 24 }; // Section I Title
      summaryRowHeights[10] = { hpt: 26 }; // KPI Table Header
      summaryRowHeights[11] = { hpt: 22 };
      summaryRowHeights[12] = { hpt: 22 };
      summaryRowHeights[13] = { hpt: 22 };
      summaryRowHeights[14] = { hpt: 22 };
      summaryRowHeights[15] = { hpt: 22 };
      summaryRowHeights[16] = { hpt: 14 };
      summaryRowHeights[17] = { hpt: 24 }; // Section II Title
      summaryRowHeights[18] = { hpt: 28 }; // Staff Table Header
      summaryRowHeights[totalRowIndex] = { hpt: 25 }; // Total Row
      summaryRowHeights[signTitleIndex] = { hpt: 24 };
      summaryRowHeights[signNoteIndex] = { hpt: 20 };
      summaryRowHeights[signNameIndex] = { hpt: 26 };

      wsSummary['!rows'] = summaryRowHeights;

      // ==========================================
      // APPLY BORDERS & STYLING FOR SHEET 1
      // ==========================================
      const borderThin = {
        top: { style: 'thin', color: { rgb: 'CBD5E1' } },
        bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
        left: { style: 'thin', color: { rgb: 'CBD5E1' } },
        right: { style: 'thin', color: { rgb: 'CBD5E1' } },
      };

      const borderHeader = {
        top: { style: 'medium', color: { rgb: '003366' } },
        bottom: { style: 'medium', color: { rgb: '003366' } },
        left: { style: 'thin', color: { rgb: '1E3A8A' } },
        right: { style: 'thin', color: { rgb: '1E3A8A' } },
      };

      const borderTotal = {
        top: { style: 'medium', color: { rgb: '003366' } },
        bottom: { style: 'double', color: { rgb: '003366' } },
        left: { style: 'thin', color: { rgb: 'CBD5E1' } },
        right: { style: 'thin', color: { rgb: 'CBD5E1' } },
      };

      const setCellStyle = (ws: any, r: number, c: number, style: any) => {
        const ref = XLSX.utils.encode_cell({ r, c });
        if (!ws[ref]) {
          ws[ref] = { t: 's', v: '' };
        }
        ws[ref].s = { ...(ws[ref].s || {}), ...style };
      };

      // 1. National header styling (Rows 0-2)
      setCellStyle(wsSummary, 0, 0, {
        font: { name: 'Times New Roman', sz: 11, bold: true, color: { rgb: '003366' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      });
      setCellStyle(wsSummary, 1, 0, {
        font: { name: 'Times New Roman', sz: 11, bold: true, underline: true, color: { rgb: '003366' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      });
      setCellStyle(wsSummary, 2, 0, {
        font: { name: 'Times New Roman', sz: 10, italic: true },
        alignment: { horizontal: 'center', vertical: 'center' },
      });

      setCellStyle(wsSummary, 0, 4, {
        font: { name: 'Times New Roman', sz: 11, bold: true },
        alignment: { horizontal: 'center', vertical: 'center' },
      });
      setCellStyle(wsSummary, 1, 4, {
        font: { name: 'Times New Roman', sz: 11, bold: true, underline: true },
        alignment: { horizontal: 'center', vertical: 'center' },
      });
      setCellStyle(wsSummary, 2, 4, {
        font: { name: 'Times New Roman', sz: 10, color: { rgb: '666666' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      });

      // 2. Main Title (Rows 4-7)
      for (let c = 0; c <= 10; c++) {
        setCellStyle(wsSummary, 4, c, {
          font: { name: 'Times New Roman', sz: 15, bold: true, color: { rgb: '003366' } },
          alignment: { horizontal: 'center', vertical: 'center' },
          fill: { fgColor: { rgb: 'F0F7FF' } },
        });
        setCellStyle(wsSummary, 5, c, {
          font: { name: 'Times New Roman', sz: 11, bold: true, italic: true, color: { rgb: '1E293B' } },
          alignment: { horizontal: 'center', vertical: 'center' },
        });
        setCellStyle(wsSummary, 6, c, {
          font: { name: 'Times New Roman', sz: 10, italic: true, color: { rgb: '475569' } },
          alignment: { horizontal: 'center', vertical: 'center' },
        });
        setCellStyle(wsSummary, 7, c, {
          font: { name: 'Times New Roman', sz: 10, italic: true, color: { rgb: '64748B' } },
          alignment: { horizontal: 'center', vertical: 'center' },
        });
      }

      // 3. Section I Title (Row 9)
      for (let c = 0; c <= 10; c++) {
        setCellStyle(wsSummary, 9, c, {
          font: { name: 'Times New Roman', sz: 12, bold: true, color: { rgb: '003366' } },
          fill: { fgColor: { rgb: 'E2E8F0' } },
          alignment: { horizontal: 'left', vertical: 'center' },
        });
      }

      // 4. Section I KPI Table Header (Row 10) - KẺ BẢNG VÀ CĂN CHỈNH
      for (let c = 0; c <= 10; c++) {
        setCellStyle(wsSummary, 10, c, {
          font: { name: 'Times New Roman', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '003366' } },
          border: borderHeader,
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        });
      }

      // Table 1 Data Rows (Rows 11-15) - KẺ BẢNG TỪNG Ô
      const kpiRowBg = ['F8FAFC', 'ECFDF5', 'FEF2F2', 'EFF6FF', 'FFFBEB'];
      const kpiTextColors = ['0F172A', '065F46', '991B1B', '1E40AF', '92400E'];

      for (let i = 0; i < 5; i++) {
        const r = 11 + i;
        const bg = kpiRowBg[i];
        const textColor = kpiTextColors[i];

        for (let c = 0; c <= 10; c++) {
          let align: 'left' | 'center' | 'right' = 'center';
          if (c >= 1 && c <= 3) align = 'left';
          if (c >= 8 && c <= 10) align = 'left';

          setCellStyle(wsSummary, r, c, {
            font: { 
              name: 'Times New Roman', 
              sz: (c >= 4 && c <= 5) ? 12 : 11, 
              bold: (c >= 1 && c <= 7), 
              color: { rgb: textColor } 
            },
            fill: { fgColor: { rgb: bg } },
            border: borderThin,
            alignment: { horizontal: align, vertical: 'center', wrapText: true },
          });
        }
      }

      // 5. Section II Title (Row 17)
      for (let c = 0; c <= 10; c++) {
        setCellStyle(wsSummary, 17, c, {
          font: { name: 'Times New Roman', sz: 12, bold: true, color: { rgb: '003366' } },
          fill: { fgColor: { rgb: 'E2E8F0' } },
          alignment: { horizontal: 'left', vertical: 'center' },
        });
      }

      // 6. Section II Staff Table Header (Row 18) - KẺ BẢNG VÀ CĂN CHỈNH
      for (let c = 0; c <= 10; c++) {
        setCellStyle(wsSummary, 18, c, {
          font: { name: 'Times New Roman', sz: 10.5, bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '003366' } },
          border: borderHeader,
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        });
      }

      // 7. Section II Staff Data Rows (Row 19 to 19 + staffStats.length - 1)
      for (let i = 0; i < staffStats.length; i++) {
        const r = 19 + i;
        const rowBg = i % 2 === 0 ? 'FFFFFF' : 'F8FAFC';

        for (let c = 0; c <= 10; c++) {
          let align: 'left' | 'center' | 'right' = 'center';
          if (c === 1 || c === 2 || c === 3) align = 'left'; // Name, Position, Unit

          let fontColor = '0F172A';
          let isBold = (c === 1 || c === 4 || c === 8 || c === 9 || c === 10);
          if (c === 5) { fontColor = '059669'; isBold = true; } // Completed: Green
          if (c === 6) { fontColor = 'DC2626'; isBold = true; } // Delayed: Red
          if (c === 7) { fontColor = '0284C7'; } // In progress: Blue

          setCellStyle(wsSummary, r, c, {
            font: { name: 'Times New Roman', sz: 10.5, bold: isBold, color: { rgb: fontColor } },
            fill: { fgColor: { rgb: rowBg } },
            border: borderThin,
            alignment: { horizontal: align, vertical: 'center', wrapText: true },
          });
        }
      }

      // 8. Staff Table Total Row (Row totalRowIndex)
      for (let c = 0; c <= 10; c++) {
        let align: 'left' | 'center' | 'right' = 'center';
        let fontColor = '0F172A';
        if (c === 5) fontColor = '059669';
        if (c === 6) fontColor = 'DC2626';
        if (c === 7) fontColor = '0284C7';

        setCellStyle(wsSummary, totalRowIndex, c, {
          font: { name: 'Times New Roman', sz: 11, bold: true, color: { rgb: fontColor } },
          fill: { fgColor: { rgb: 'E2E8F0' } },
          border: borderTotal,
          alignment: { horizontal: align, vertical: 'center' },
        });
      }

      // 9. Signatures Styling
      setCellStyle(wsSummary, signDateIndex, 7, {
        font: { name: 'Times New Roman', sz: 11, italic: true },
        alignment: { horizontal: 'center', vertical: 'center' },
      });
      [0, 4, 7].forEach((col) => {
        setCellStyle(wsSummary, signTitleIndex, col, {
          font: { name: 'Times New Roman', sz: 11, bold: true },
          alignment: { horizontal: 'center', vertical: 'center' },
        });
        setCellStyle(wsSummary, signNoteIndex, col, {
          font: { name: 'Times New Roman', sz: 10, italic: true, color: { rgb: '64748B' } },
          alignment: { horizontal: 'center', vertical: 'center' },
        });
      });
      setCellStyle(wsSummary, signNameIndex, 7, {
        font: { name: 'Times New Roman', sz: 11, bold: true },
        alignment: { horizontal: 'center', vertical: 'center' },
      });

      // ==========================================
      // SHEET 2: DANH SÁCH CHI TIẾT TỪNG NHIỆM VỤ
      // ==========================================
      const wsDetailData: any[][] = [
        ['ỦY BAN NHÂN DÂN PHƯỜNG HỐ NAI', '', '', '', '', '', 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', '', '', '', '', '', '', ''],
        ['TRUNG TÂM DỊCH VỤ TỔNG HỢP', '', '', '', '', '', 'Độc lập - Tự do - Hạnh phúc', '', '', '', '', '', '', ''],
        [''],
        ['DANH SÁCH CHI TIẾT CÁC NHIỆM VỤ THEO KỲ BÁO CÁO THỐNG KÊ TIẾN ĐỘ', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        [`Thời gian thống kê: ${timeRangeText} | Căn cứ: ${criterionText}`, '', '', '', '', '', '', '', '', '', '', '', '', ''],
        [`Tổng số: ${totalCount} nhiệm vụ | Đã hoàn thành: ${completedCount} (${completedRate}%) | Trễ hạn: ${delayedCount} (${delayedRate}%) | Đang thực hiện: ${inProgressCount} (${inProgressRate}%) | Tiến độ bình quân: ${avgProgress}%`, '', '', '', '', '', '', '', '', '', '', '', '', ''],
        [''],
        [
          'STT',
          'Mã nhiệm vụ',
          'Tên nhiệm vụ',
          'Phòng ban / Tổ chuyên môn',
          'Cán bộ chủ trì',
          'Cán bộ phối hợp',
          'Ngày phân công',
          'Hạn hoàn thành',
          'Tiến độ (%)',
          'Trạng thái thực hiện',
          'Đánh giá hạn',
          'Nội dung chỉ đạo của Lãnh đạo',
          'Tình hình báo cáo tiến độ mới nhất',
          'Khó khăn, vướng mắc & kiến nghị'
        ]
      ];

      filteredTasks.forEach((t, idx) => {
        const delayed = isTaskDelayed(t);
        const deadlineStatusText = t.status === 'completed'
          ? 'Đã hoàn thành'
          : delayed
            ? 'TRỄ HẠN'
            : 'Đang thực hiện đúng hạn';

        wsDetailData.push([
          idx + 1,
          t.code,
          t.title,
          t.section,
          t.assignee,
          (t.coAssignees || []).join(', ') || '—',
          formatDateDisplay(t.assignedDate || t.startDate),
          formatDateDisplay(t.deadline),
          `${t.progress}%`,
          getStatusLabel(t.status),
          deadlineStatusText,
          t.requirement || 'Thực hiện theo thông báo kết luận giao ban',
          t.currentReport || 'Chưa cập nhật báo cáo',
          t.difficulties || 'Không'
        ]);
      });

      // Bottom summary row for Sheet 2
      wsDetailData.push([
        'TỔNG CỘNG', '', '',
        `${filteredTasks.length} nhiệm vụ`, '', '', '', '',
        `${avgProgress}%`,
        `Hoàn thành: ${completedCount}`,
        `Trễ hạn: ${delayedCount}`,
        `Đang thực hiện: ${inProgressCount}`,
        `Tỷ lệ hoàn thành: ${completedRate}%`,
        `Tỷ lệ trễ hạn: ${delayedRate}%`
      ]);

      const wsDetail = XLSX.utils.aoa_to_sheet(wsDetailData);

      const detailRowCount = filteredTasks.length;
      const detailTotalRowIndex = 8 + detailRowCount;

      const detailMerges: XLSX.Range[] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
        { s: { r: 0, c: 6 }, e: { r: 0, c: 13 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
        { s: { r: 1, c: 6 }, e: { r: 1, c: 13 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: 13 } },
        { s: { r: 4, c: 0 }, e: { r: 4, c: 13 } },
        { s: { r: 5, c: 0 }, e: { r: 5, c: 13 } },

        // Total row merges
        { s: { r: detailTotalRowIndex, c: 0 }, e: { r: detailTotalRowIndex, c: 2 } },
        { s: { r: detailTotalRowIndex, c: 3 }, e: { r: detailTotalRowIndex, c: 7 } },
      ];

      wsDetail['!merges'] = detailMerges;

      wsDetail['!cols'] = [
        { wch: 6 },   // A: STT
        { wch: 12 },  // B: Mã nhiệm vụ
        { wch: 45 },  // C: Tên nhiệm vụ
        { wch: 28 },  // D: Phòng ban / Tổ
        { wch: 24 },  // E: Cán bộ chủ trì
        { wch: 24 },  // F: Cán bộ phối hợp
        { wch: 16 },  // G: Ngày phân công
        { wch: 16 },  // H: Hạn hoàn thành
        { wch: 14 },  // I: Tiến độ (%)
        { wch: 20 },  // J: Trạng thái thực hiện
        { wch: 22 },  // K: Đánh giá hạn
        { wch: 48 },  // L: Nội dung chỉ đạo của Lãnh đạo
        { wch: 48 },  // M: Báo cáo tiến độ mới nhất
        { wch: 34 },  // N: Khó khăn, vướng mắc & kiến nghị
      ];

      const detailRowHeights: { hpt: number }[] = [];
      detailRowHeights[0] = { hpt: 22 };
      detailRowHeights[1] = { hpt: 20 };
      detailRowHeights[3] = { hpt: 28 }; // Main Title
      detailRowHeights[4] = { hpt: 20 };
      detailRowHeights[5] = { hpt: 20 };
      detailRowHeights[7] = { hpt: 28 }; // Table Header
      detailRowHeights[detailTotalRowIndex] = { hpt: 25 }; // Total row

      wsDetail['!rows'] = detailRowHeights;

      // ==========================================
      // APPLY BORDERS & STYLING FOR SHEET 2
      // ==========================================
      // 1. Header & Title (Rows 0-5)
      setCellStyle(wsDetail, 0, 0, {
        font: { name: 'Times New Roman', sz: 11, bold: true, color: { rgb: '003366' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      });
      setCellStyle(wsDetail, 1, 0, {
        font: { name: 'Times New Roman', sz: 11, bold: true, underline: true, color: { rgb: '003366' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      });
      setCellStyle(wsDetail, 0, 6, {
        font: { name: 'Times New Roman', sz: 11, bold: true },
        alignment: { horizontal: 'center', vertical: 'center' },
      });
      setCellStyle(wsDetail, 1, 6, {
        font: { name: 'Times New Roman', sz: 11, bold: true, underline: true },
        alignment: { horizontal: 'center', vertical: 'center' },
      });

      for (let c = 0; c <= 13; c++) {
        setCellStyle(wsDetail, 3, c, {
          font: { name: 'Times New Roman', sz: 14, bold: true, color: { rgb: '003366' } },
          alignment: { horizontal: 'center', vertical: 'center' },
          fill: { fgColor: { rgb: 'F0F7FF' } },
        });
        setCellStyle(wsDetail, 4, c, {
          font: { name: 'Times New Roman', sz: 10.5, italic: true, color: { rgb: '475569' } },
          alignment: { horizontal: 'center', vertical: 'center' },
        });
        setCellStyle(wsDetail, 5, c, {
          font: { name: 'Times New Roman', sz: 10.5, bold: true, color: { rgb: '003366' } },
          fill: { fgColor: { rgb: 'E0F2FE' } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: borderThin,
        });
      }

      // 2. Sheet 2 Table Header (Row 7, 14 cols) - KẺ BẢNG VÀ CĂN CHỈNH
      for (let c = 0; c <= 13; c++) {
        setCellStyle(wsDetail, 7, c, {
          font: { name: 'Times New Roman', sz: 10.5, bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '003366' } },
          border: borderHeader,
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        });
      }

      // 3. Sheet 2 Data Rows (Row 8 to 8 + filteredTasks.length - 1) - KẺ BẢNG TỪNG Ô
      for (let i = 0; i < filteredTasks.length; i++) {
        const r = 8 + i;
        const task = filteredTasks[i];
        const isDelayed = isTaskDelayed(task);
        const isCompleted = task.status === 'completed';
        const rowBg = i % 2 === 0 ? 'FFFFFF' : 'F8FAFC';

        for (let c = 0; c <= 13; c++) {
          let align: 'left' | 'center' | 'right' = 'center';
          // Columns with left alignment: Tên việc, Phòng ban, Cán bộ, Phối hợp, Chỉ đạo, Báo cáo, Khó khăn
          if (c === 2 || c === 3 || c === 4 || c === 5 || c === 11 || c === 12 || c === 13) {
            align = 'left';
          }

          let fontColor = '0F172A';
          let isBold = (c === 1 || c === 2 || c === 4 || c === 7 || c === 8);
          let cellBg = rowBg;

          if (c === 8) { // Tiến độ
            isBold = true;
          }
          if (c === 10) { // Đánh giá hạn
            isBold = true;
            if (isCompleted) {
              fontColor = '059669';
              cellBg = 'ECFDF5';
            } else if (isDelayed) {
              fontColor = 'DC2626';
              cellBg = 'FEF2F2';
            } else {
              fontColor = '0284C7';
            }
          }

          setCellStyle(wsDetail, r, c, {
            font: { name: 'Times New Roman', sz: 10, bold: isBold, color: { rgb: fontColor } },
            fill: { fgColor: { rgb: cellBg } },
            border: borderThin,
            alignment: { horizontal: align, vertical: 'center', wrapText: true },
          });
        }
      }

      // 4. Sheet 2 Total Row (Row detailTotalRowIndex) - KẺ BẢNG
      for (let c = 0; c <= 13; c++) {
        setCellStyle(wsDetail, detailTotalRowIndex, c, {
          font: { name: 'Times New Roman', sz: 10.5, bold: true, color: { rgb: '003366' } },
          fill: { fgColor: { rgb: 'E2E8F0' } },
          border: borderTotal,
          alignment: { horizontal: 'center', vertical: 'center' },
        });
      }

      // Append Worksheets with official names
      XLSX.utils.book_append_sheet(wb, wsSummary, '1. Tổng Hợp & Viên Chức');
      XLSX.utils.book_append_sheet(wb, wsDetail, '2. Chi Tiết Nhiệm Vụ');

      const fileDate = toInputDateString(new Date());
      const fileName = `BaoCao_ThongKe_TienDo_HoNai_${fileDate}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success('Xuất báo cáo thành công', `Tệp Excel "${fileName}" đã được tải xuống thành công.`);
      setExportNotice(`Đã xuất báo cáo tiến độ thành công file "${fileName}"!`);
      setTimeout(() => setExportNotice(null), 4000);
    } catch (err) {
      console.error('Lỗi xuất file excel:', err);
      toast.error('Xuất báo cáo thất bại', 'Có lỗi xảy ra khi tạo tệp Excel. Vui lòng thử lại!');
      setExportNotice('Không thể xuất file Excel. Vui lòng thử lại!');
      setTimeout(() => setExportNotice(null), 4000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-3 md:p-4 animate-in fade-in duration-200">
      <div className="bg-white sm:rounded-[10px] shadow-2xl border-0 sm:border border-[#E5E7EB] max-w-6xl w-full flex flex-col h-[100dvh] sm:h-[94vh] max-h-[100dvh] sm:max-h-[94vh] overflow-hidden">
        
        {/* Header Modal */}
        <div className="bg-[#003366] text-white p-3.5 sm:p-5 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[8px] bg-white/10 border border-white/20 flex items-center justify-center text-blue-200 shrink-0 mt-0.5">
              <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-emerald-700/80 text-emerald-100 px-2 py-0.5 rounded">
                  BÁO CÁO THỐNG KÊ TIẾN ĐỘ
                </span>
                <span className="text-blue-200 text-[12px] hidden sm:inline">·</span>
                <span className="text-[11px] sm:text-[12px] text-blue-100 font-medium truncate hidden sm:inline">TTDVTH · UBND Phường Hố Nai</span>
              </div>
              <h2 className="text-[15px] sm:text-[19px] font-bold text-white mt-0.5 tracking-tight leading-tight truncate sm:whitespace-normal">
                Thống Kê Tiến Độ Nhiệm Vụ & Đánh Giá Viên Chức
              </h2>
              <p className="text-[11px] sm:text-[13px] text-blue-200 mt-0.5 leading-snug line-clamp-1 sm:line-clamp-none">
                Lọc thời gian, tổng hợp theo viên chức, đánh giá KPI và xuất file Excel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[6px] sm:rounded-[8px] font-bold text-[12px] sm:text-[13px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs border border-emerald-400/40"
              title="Xuất toàn bộ báo cáo và bảng phân tích ra file Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-100" />
              <span className="hidden sm:inline">Xuất Excel (.xlsx)</span>
              <span className="sm:hidden font-semibold">Xuất Excel</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 text-white/70 hover:text-white rounded-[6px] sm:rounded-[8px] hover:bg-white/10 transition-colors cursor-pointer"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Export Notification Toast */}
        {exportNotice && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between text-[12px] sm:text-[13px] text-emerald-800 animate-in fade-in shrink-0">
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

        {/* Main Unified Scrollable Body: Everything scrolls smoothly together without locking */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-[#F8FAFC]">

          {/* Filter Bar: Thống kê từ ngày tới ngày & Tùy chọn */}
          <div className="p-3 sm:p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] space-y-2.5 sm:space-y-3">
            
            {/* Row 1: Search & Quick Filter Toggle for Mobile */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Tìm tên việc, mã số, nội dung, cán bộ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-white border border-[#CBD5E1] rounded-[6px] sm:rounded-[8px] text-[13px] text-[#1E293B] font-medium focus:outline-hidden focus:ring-1 focus:ring-[#003366] shadow-2xs"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Mobile Filter Toggle Button */}
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen((prev) => !prev)}
                className={`sm:hidden px-3 py-2 rounded-[6px] text-[12px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  isMobileFiltersOpen || activeFilterCount > 0
                    ? 'bg-[#003366] text-white border-[#003366]'
                    : 'bg-white text-[#475569] border-[#CBD5E1] hover:bg-gray-100'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Lọc</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
                {isMobileFiltersOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Row 2: Date Range & Quick Presets (Swipeable pills on mobile) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 sm:gap-3">
              
              {/* Quick Presets: Horizontal swipe on mobile, wrap on desktop */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 touch-pan-x sm:flex-wrap text-[12px] scrollbar-none">
                <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1 shrink-0 mr-0.5">
                  <Calendar className="w-3.5 h-3.5 text-[#003366]" />
                  Kỳ:
                </span>
                {(['all', 'today', '7days', 'month', 'quarter', 'year'] as const).map((preset) => {
                  const labels: Record<string, string> = {
                    all: 'Toàn bộ',
                    today: 'Hôm nay',
                    '7days': '7 ngày qua',
                    month: 'Tháng này',
                    quarter: 'Quý này',
                    year: 'Năm 2026',
                  };
                  const isSelected = datePreset === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className={`px-2.5 py-1 rounded-[6px] text-[11px] sm:text-[12px] font-semibold whitespace-nowrap transition-colors cursor-pointer border shrink-0 ${
                        isSelected
                          ? 'bg-[#003366] text-white border-[#003366] shadow-2xs'
                          : 'bg-white text-[#475569] hover:bg-gray-100 border-[#CBD5E1]'
                      }`}
                    >
                      {labels[preset]}
                    </button>
                  );
                })}
              </div>

              {/* Date Inputs: Từ ngày -> Đến ngày */}
              <div className="grid grid-cols-1 sm:flex sm:items-center gap-2">
                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                  <div className="flex items-center gap-1.5 bg-white border border-[#CBD5E1] rounded-[6px] px-2 sm:px-2.5 py-1 text-[12px] sm:text-[13px] shadow-2xs">
                    <span className="text-[11px] sm:text-[12px] text-[#64748B] font-medium shrink-0">Từ:</span>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => {
                        setFromDate(e.target.value);
                        setDatePreset('custom');
                      }}
                      className="w-full bg-transparent border-0 text-[#1E293B] font-medium text-[12px] sm:text-[13px] focus:outline-hidden cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 bg-white border border-[#CBD5E1] rounded-[6px] px-2 sm:px-2.5 py-1 text-[12px] sm:text-[13px] shadow-2xs">
                    <span className="text-[11px] sm:text-[12px] text-[#64748B] font-medium shrink-0">Đến:</span>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => {
                        setToDate(e.target.value);
                        setDatePreset('custom');
                      }}
                      className="w-full bg-transparent border-0 text-[#1E293B] font-medium text-[12px] sm:text-[13px] focus:outline-hidden cursor-pointer"
                    />
                  </div>
                </div>

                {/* Lọc theo trường ngày */}
                <select
                  value={dateFieldFilter}
                  onChange={(e) => setDateFieldFilter(e.target.value as any)}
                  className="w-full sm:w-auto bg-white border border-[#CBD5E1] rounded-[6px] px-2.5 py-1.5 text-[11px] sm:text-[12px] font-medium text-[#334155] focus:outline-hidden cursor-pointer shadow-2xs truncate"
                  title="Chọn căn cứ mốc ngày để thống kê"
                >
                  <option value="assignedDate">Căn cứ: Ngày phân công nhiệm vụ</option>
                  <option value="deadline">Căn cứ: Hạn hoàn thành (Deadline)</option>
                  <option value="startDate">Căn cứ: Ngày bắt đầu / Giao việc</option>
                  <option value="updatedAt">Căn cứ: Ngày cập nhật báo cáo</option>
                  <option value="any">Căn cứ: Mọi mốc thời gian</option>
                </select>
              </div>
            </div>

            {/* Row 3: Secondary Filters (Tổ chuyên môn, Cán bộ, Tình trạng) */}
            <div className={`grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#E2E8F0]/80 ${
              isMobileFiltersOpen ? 'grid animate-in fade-in slide-in-from-top-1' : 'hidden sm:grid'
            }`}>
              {/* 1. Lọc theo phòng ban */}
              <div className="flex items-center gap-1.5 bg-white border border-[#CBD5E1] rounded-[6px] px-2.5 py-1.5 text-[12px] sm:text-[13px]">
                <Building2 className="w-4 h-4 text-[#64748B] shrink-0" />
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full bg-transparent text-[#1E293B] font-medium text-[12px] sm:text-[13px] focus:outline-hidden cursor-pointer truncate"
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
              <div className="flex items-center gap-1.5 bg-white border border-[#CBD5E1] rounded-[6px] px-2.5 py-1.5 text-[12px] sm:text-[13px]">
                <Users className="w-4 h-4 text-[#64748B] shrink-0" />
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full bg-transparent text-[#1E293B] font-medium text-[12px] sm:text-[13px] focus:outline-hidden cursor-pointer truncate"
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
              <div className="flex items-center gap-1.5 bg-white border border-[#CBD5E1] rounded-[6px] px-2.5 py-1.5 text-[12px] sm:text-[13px]">
                <Filter className="w-4 h-4 text-[#64748B] shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full bg-transparent text-[#1E293B] font-medium text-[12px] sm:text-[13px] focus:outline-hidden cursor-pointer"
                >
                  <option value="all">Tất cả tình trạng</option>
                  <option value="completed">Đã hoàn thành</option>
                  <option value="delayed">Trễ hạn / Quá hạn</option>
                  <option value="in_progress">Đang thực hiện đúng hạn</option>
                </select>
              </div>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="p-3 sm:p-4 bg-white border-b border-[#E5E7EB]">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
              {/* Tổng số nhiệm vụ */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] p-2.5 sm:p-3 text-left">
                <span className="text-[10px] sm:text-[11px] font-bold text-[#64748B] uppercase tracking-wider block truncate">
                  Tổng số nhiệm vụ
                </span>
                <div className="flex items-baseline gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                  <CountUpNumber 
                    value={totalCount} 
                    className="text-[18px] sm:text-[24px] font-black text-[#0F172A] font-mono tabular-nums" 
                  />
                  <span className="text-[10px] sm:text-[11px] text-[#64748B] font-medium">nhiệm vụ</span>
                </div>
              </div>

              {/* Hoàn thành */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-[8px] p-2.5 sm:p-3 text-left">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] sm:text-[11px] font-bold text-emerald-800 uppercase tracking-wider truncate">
                    Hoàn thành
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-extrabold bg-emerald-200/70 text-emerald-900 px-1.5 py-0.2 rounded font-mono shrink-0">
                    <CountUpNumber value={completedRate} suffix="%" />
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                  <CountUpNumber 
                    value={completedCount} 
                    className="text-[18px] sm:text-[24px] font-black text-emerald-700 font-mono tabular-nums" 
                  />
                  <span className="text-[10px] sm:text-[11px] text-emerald-800 font-medium">việc đạt</span>
                </div>
              </div>

              {/* Trễ hạn / Quá hạn */}
              <div className="bg-rose-50/80 border border-rose-200 rounded-[8px] p-2.5 sm:p-3 text-left">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] sm:text-[11px] font-bold text-rose-800 uppercase tracking-wider truncate">
                    Trễ hạn / Quá hạn
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-extrabold bg-rose-200/70 text-rose-900 px-1.5 py-0.2 rounded font-mono shrink-0">
                    <CountUpNumber value={delayedRate} suffix="%" />
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                  <CountUpNumber 
                    value={delayedCount} 
                    className="text-[18px] sm:text-[24px] font-black text-rose-700 font-mono tabular-nums" 
                  />
                  <span className="text-[10px] sm:text-[11px] text-rose-800 font-medium truncate">cần đôn đốc</span>
                </div>
              </div>

              {/* Đang triển khai */}
              <div className="bg-blue-50/80 border border-blue-200 rounded-[8px] p-2.5 sm:p-3 text-left">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] sm:text-[11px] font-bold text-blue-800 uppercase tracking-wider truncate">
                    Đang thực hiện
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-extrabold bg-blue-200/70 text-blue-900 px-1.5 py-0.2 rounded font-mono shrink-0">
                    <CountUpNumber value={inProgressRate} suffix="%" />
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                  <CountUpNumber 
                    value={inProgressCount} 
                    className="text-[18px] sm:text-[24px] font-black text-blue-700 font-mono tabular-nums" 
                  />
                  <span className="text-[10px] sm:text-[11px] text-blue-800 font-medium truncate">trong tiến độ</span>
                </div>
              </div>

              {/* Tiến độ trung bình */}
              <div className="col-span-2 sm:col-span-4 lg:col-span-1 bg-amber-50/80 border border-amber-200 rounded-[8px] p-2.5 sm:p-3 text-left">
                <span className="text-[10px] sm:text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                  Tiến độ bình quân
                </span>
                <div className="flex items-baseline gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                  <CountUpNumber 
                    value={avgProgress} 
                    suffix="%" 
                    className="text-[18px] sm:text-[24px] font-black text-amber-700 font-mono tabular-nums" 
                  />
                  <span className="text-[10px] sm:text-[11px] text-amber-800 font-medium">toàn đơn vị</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs inside modal (Sticky beneath Header) */}
          <div className="sticky top-0 z-20 px-3 sm:px-4 bg-white/95 backdrop-blur-xs border-b border-[#E5E7EB] flex items-center justify-between shadow-2xs overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`py-2.5 sm:py-3 text-[12px] sm:text-[13px] font-bold border-b-2 flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-colors whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-[#003366] text-[#003366]'
                    : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span className="sm:hidden">1. Cán bộ ({staffStats.length})</span>
                <span className="hidden sm:inline">1. Thống kê theo Viên chức ({staffStats.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`py-2.5 sm:py-3 text-[12px] sm:text-[13px] font-bold border-b-2 flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-colors whitespace-nowrap ${
                  activeTab === 'details'
                    ? 'border-[#003366] text-[#003366]'
                    : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                <span className="sm:hidden">2. Việc ({filteredTasks.length})</span>
                <span className="hidden sm:inline">2. Chi tiết danh sách nhiệm vụ ({filteredTasks.length})</span>
              </button>
            </div>

            <div className="text-[11px] sm:text-[12px] text-[#64748B] shrink-0 pl-2">
              <span className="hidden sm:inline">Đang lọc: </span>
              <strong className="text-[#0F172A]"><CountUpNumber value={filteredTasks.length} /></strong>
              <span className="text-[#64748B]">/<CountUpNumber value={tasks.length} /> việc</span>
            </div>
          </div>

          {/* Main Tab Content */}
          <div className="p-2.5 sm:p-4 pb-24 sm:pb-8">
            
            {/* TAB 1: BẢNG THỐNG KÊ CHI TIẾT TỪNG VIÊN CHỨC */}
            {activeTab === 'overview' && (
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-white rounded-[8px] border border-[#E2E8F0] shadow-xs overflow-hidden">
                  <div className="p-3 sm:p-3.5 bg-[#F1F5F9] border-b border-[#E2E8F0] flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-[13px] sm:text-[14px] font-bold text-[#0F172A]">
                        Bảng Phân Tích Hiệu Suất Từng Viên Chức
                      </h3>
                      <p className="text-[11px] sm:text-[12px] text-[#64748B] mt-0.5">
                        Tổng hợp số lượng nhiệm vụ được phân công, tỷ lệ hoàn thành và trễ hạn
                      </p>
                    </div>
                    <span className="text-[11px] sm:text-[12px] bg-white border border-[#CBD5E1] text-[#334155] px-2 py-1 rounded-[6px] font-mono font-semibold shrink-0">
                      {staffStats.length} Cán bộ
                    </span>
                  </div>

                  {/* Mobile Card List for Staff (sm:hidden) */}
                  <div className="sm:hidden divide-y divide-[#E2E8F0]">
                    {staffStats.map((item, index) => (
                      <div key={item.user.id} className="p-3 bg-white space-y-2.5 hover:bg-blue-50/20 transition-colors">
                        {/* Top: Avatar, Name, Unit, and Action */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-[11px] text-[#94A3B8] w-4 shrink-0">
                              #{index + 1}
                            </span>
                            <div className={`w-8 h-8 rounded-[6px] flex items-center justify-center font-bold text-[12px] shrink-0 ${item.user.avatarBg}`}>
                              {item.user.fullName.split(' ').slice(-1)[0][0] || 'V'}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-[13px] text-[#0F172A] leading-tight truncate">
                                {item.user.fullName}
                              </div>
                              <div className="text-[11px] text-[#64748B] mt-0.5 truncate">
                                {item.user.position || item.user.unit}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStaffId(item.user.id);
                              setActiveTab('details');
                            }}
                            className="px-2.5 py-1 bg-[#003366] hover:bg-[#002244] text-white rounded-[6px] text-[11px] font-semibold transition-colors shrink-0 cursor-pointer"
                            title={`Xem chi tiết các nhiệm vụ của ${item.user.fullName}`}
                          >
                            Xem việc
                          </button>
                        </div>

                        {/* 4-Metric Grid */}
                        <div className="grid grid-cols-4 gap-1.5 text-center">
                          <div className="bg-[#F8FAFC] rounded p-1.5 border border-[#E2E8F0]">
                            <div className="text-[9px] text-[#64748B] font-semibold uppercase">Tổng</div>
                            <div className="text-[14px] font-bold font-mono text-[#0F172A] mt-0.5">{item.total}</div>
                          </div>
                          <div className="bg-emerald-50 rounded p-1.5 border border-emerald-200">
                            <div className="text-[9px] text-emerald-800 font-semibold uppercase">Đạt</div>
                            <div className="text-[14px] font-bold font-mono text-emerald-700 mt-0.5">{item.completed}</div>
                          </div>
                          <div className={`rounded p-1.5 border ${item.delayed > 0 ? 'bg-rose-50 border-rose-200' : 'bg-gray-50 border-gray-200'}`}>
                            <div className={`text-[9px] font-semibold uppercase ${item.delayed > 0 ? 'text-rose-800' : 'text-gray-500'}`}>Trễ</div>
                            <div className={`text-[14px] font-bold font-mono mt-0.5 ${item.delayed > 0 ? 'text-rose-700' : 'text-gray-400'}`}>
                              {item.delayed}
                            </div>
                          </div>
                          <div className="bg-blue-50 rounded p-1.5 border border-blue-200">
                            <div className="text-[9px] text-blue-800 font-semibold uppercase">Đang làm</div>
                            <div className="text-[14px] font-bold font-mono text-blue-700 mt-0.5">{item.inProg}</div>
                          </div>
                        </div>

                        {/* Progress bar & Rating */}
                        <div className="flex items-center justify-between gap-3 pt-1 border-t border-[#F1F5F9]">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-[#64748B]">Tỷ lệ hoàn thành:</span>
                              <span className="font-bold text-[#0F172A]">{item.rate}% <span className="text-[#64748B] font-normal">(TB {item.prog}%)</span></span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-emerald-600 h-1.5 rounded-full transition-all"
                                style={{ width: `${item.rate}%` }}
                              />
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-semibold border shrink-0 ${item.ratingColor}`}>
                            {item.rating}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table (hidden sm:block) */}
                  <div className="hidden sm:block overflow-x-auto">
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
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-white rounded-[8px] border border-[#E2E8F0] shadow-xs overflow-hidden">
                  <div className="p-3 sm:p-3.5 bg-[#F1F5F9] border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-[13px] sm:text-[14px] font-bold text-[#0F172A]">
                        Chi Tiết Toàn Bộ Nhiệm Vụ Trong Kỳ Báo Cáo
                      </h3>
                      <p className="text-[11px] sm:text-[12px] text-[#64748B] mt-0.5">
                        Hiển thị danh sách công việc, cán bộ phụ trách, tiến độ và tình hình thực hiện
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {selectedStaffId !== 'all' && (
                        <button
                          type="button"
                          onClick={() => setSelectedStaffId('all')}
                          className="text-[11px] bg-white border border-[#CBD5E1] text-[#003366] px-2 py-1 rounded-[6px] font-semibold hover:bg-gray-100 cursor-pointer"
                        >
                          Bỏ lọc ({users.find(u => u.id === selectedStaffId)?.fullName?.split(' ').slice(-1)[0] || 'viên chức'}) ✕
                        </button>
                      )}
                      <span className="text-[11px] sm:text-[12px] bg-white border border-[#CBD5E1] text-[#334155] px-2.5 py-1 rounded-[6px] font-mono font-semibold">
                        {filteredTasks.length} nhiệm vụ
                      </span>
                    </div>
                  </div>

                  {filteredTasks.length === 0 ? (
                    <div className="p-8 sm:p-12 text-center text-[#64748B] space-y-2">
                      <FileSpreadsheet className="w-10 h-10 sm:w-12 sm:h-12 text-[#94A3B8] mx-auto opacity-50" />
                      <p className="text-[13px] sm:text-[14px] font-semibold text-[#334155]">Không có nhiệm vụ nào phù hợp với bộ lọc</p>
                      <p className="text-[11px] sm:text-[12px]">Vui lòng thử điều chỉnh lại khoảng thời gian hoặc chọn "Toàn bộ" để xem dữ liệu.</p>
                    </div>
                  ) : (
                    <>
                      {/* Mobile Card List for Tasks (sm:hidden) */}
                      <div className="sm:hidden divide-y divide-[#E2E8F0]">
                        {filteredTasks.map((task) => {
                          const delayed = isTaskDelayed(task);
                          return (
                            <div key={task.id} className="p-3 bg-white space-y-2 hover:bg-blue-50/20 transition-colors">
                              {/* Row 1: Code, Status, Delayed badge */}
                              <div className="flex items-center justify-between gap-1.5 flex-wrap">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-mono font-bold text-[11px] bg-blue-50 text-[#003366] px-1.5 py-0.5 rounded border border-blue-200">
                                    {task.code}
                                  </span>
                                  <span className="inline-block bg-gray-100 text-[#334155] px-1.5 py-0.5 rounded text-[10px] font-medium">
                                    {getSectionShortName(task.section)}
                                  </span>
                                  {delayed && (
                                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                      <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                                      TRỄ HẠN
                                    </span>
                                  )}
                                </div>

                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${getStatusBadgeClasses(task.status)}`}>
                                  {getStatusLabel(task.status)}
                                </span>
                              </div>

                              {/* Row 2: Title & Requirement */}
                              <div>
                                <div className="font-bold text-[13px] text-[#0F172A] leading-snug">
                                  {task.title}
                                </div>
                                {task.requirement && (
                                  <div className="text-[11px] text-[#64748B] mt-1 line-clamp-2 leading-relaxed bg-[#F8FAFC] p-1.5 rounded border border-[#E2E8F0]">
                                    {task.requirement}
                                  </div>
                                )}
                              </div>

                              {/* Row 3: Assignee & Deadlines */}
                              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                                <div>
                                  <span className="text-[#64748B] block text-[10px]">Phụ trách:</span>
                                  <span className="font-semibold text-[#0F172A]">{task.assignee}</span>
                                  {task.coAssignees && task.coAssignees.length > 0 && (
                                    <span className="text-[10px] text-[#64748B] block truncate">
                                      PH: {task.coAssignees.join(', ')}
                                    </span>
                                  )}
                                </div>
                                <div className="text-right">
                                  <span className="text-[#64748B] block text-[10px]">Hạn hoàn thành:</span>
                                  <span className="font-mono font-bold text-[12px] text-[#1E293B]">
                                    {formatDateDisplay(task.deadline)}
                                  </span>
                                  <span className="text-[10px] text-[#64748B] block font-mono">
                                    Giao: {formatDateDisplay(task.assignedDate || task.startDate)}
                                  </span>
                                </div>
                              </div>

                              {/* Row 4: Progress Bar */}
                              <div className="space-y-1 pt-1 border-t border-[#F1F5F9]">
                                <div className="flex items-center justify-between text-[11px] font-mono">
                                  <span className="text-[#64748B]">Tiến độ thực tế:</span>
                                  <span className={`font-bold ${task.progress === 100 ? 'text-emerald-700' : 'text-[#0F172A]'}`}>
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

                              {/* Row 5: Latest Report & Action button */}
                              <div className="flex items-center justify-between pt-1 gap-2">
                                <div className="text-[11px] text-[#475569] truncate flex-1">
                                  {task.currentReport ? (
                                    <span><strong className="text-[#334155]">BC:</strong> {task.currentReport}</span>
                                  ) : (
                                    <span className="text-gray-400 italic">Chưa có báo cáo</span>
                                  )}
                                </div>
                                {onSelectTask && (
                                  <button
                                    type="button"
                                    onClick={() => onSelectTask(task)}
                                    className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-[#003366] rounded text-[11px] font-bold flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                                  >
                                    <span>Xem</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Desktop Table (hidden sm:block) */}
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-left border-collapse text-[13px]">
                          <thead>
                            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569] font-bold text-[12px] uppercase tracking-wider">
                              <th className="py-2.5 px-3 text-center w-12">STT</th>
                              <th className="py-2.5 px-3 w-16">Mã</th>
                              <th className="py-2.5 px-3 min-w-[240px]">Nhiệm vụ & Yêu cầu chỉ đạo</th>
                              <th className="py-2.5 px-3 min-w-[160px]">Cán bộ phụ trách</th>
                              <th className="py-2.5 px-3 min-w-[150px]">Phòng ban / Tổ</th>
                              <th className="py-2.5 px-3 text-center min-w-[120px]">Ngày phân công</th>
                              <th className="py-2.5 px-3 text-center min-w-[120px]">Hạn hoàn thành</th>
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
                                    <div className="font-mono text-[12px] font-semibold text-[#003366]">
                                      {formatDateDisplay(task.assignedDate || task.startDate)}
                                    </div>
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
                    </>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-3.5 bg-white border-t border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
          <div className="text-[11px] sm:text-[12px] text-[#64748B] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#003366] shrink-0" />
            <span className="truncate">Dữ liệu thống kê thời gian thực từ hệ thống</span>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3 sm:px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-[8px] text-[12px] sm:text-[13px] flex items-center justify-center gap-1.5 sm:gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Xuất Excel</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#334155] font-semibold rounded-[8px] text-[12px] sm:text-[13px] transition-colors cursor-pointer text-center"
            >
              Đóng Cửa Sổ
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
