import { Task, TaskStatus, PriorityLevel, SectionType } from '../types';
import { UserAccount, Department } from '../types/database';

export function getStatusLabel(status: TaskStatus): string {
  switch (status) {
    case 'completed':
      return 'Hoàn thành';
    case 'in_progress':
      return 'Đang triển khai';
    case 'pending_input':
      return 'Chờ ý kiến / Thủ tục';
    case 'delayed':
      return 'Chậm / Vướng mắc';
    case 'paused':
      return 'Tạm dừng';
    default:
      return status;
  }
}

export function getStatusBadgeClasses(status: TaskStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'in_progress':
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'pending_input':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'delayed':
      return 'bg-rose-50 text-rose-700 border border-rose-200';
    case 'paused':
      return 'bg-slate-100 text-slate-700 border border-slate-300';
    default:
      return 'bg-slate-50 text-slate-700 border border-slate-200';
  }
}

export function getPriorityLabel(priority: PriorityLevel): string {
  switch (priority) {
    case 'urgent':
      return 'Hỏa tốc / Khẩn cấp';
    case 'high':
      return 'Ưu tiên cao';
    case 'normal':
      return 'Bình thường';
  }
}

export function getSectionShortName(section: SectionType): string {
  switch (section) {
    case 'II. TỔ HÀNH CHÍNH - KẾ TOÁN':
      return 'Tổ Hành chính - Kế toán';
    case 'III. TỔ DỊCH VỤ CÔNG ÍCH - XÂY DỰNG':
      return 'Tổ DVCI - Xây dựng';
    case 'IV. CÁC DỰ ÁN ĐẦU TƯ CÔNG TRUNG HẠN':
      return 'Đầu tư công trung hạn';
    case 'V. CÁC DỰ ÁN ĐẦU TƯ NGÂN SÁCH CHI THƯỜNG XUYÊN':
      return 'Đầu tư ngân sách chi TX';
    case 'VI. TỔ VĂN HÓA - THỂ THAO - THÔNG TIN - TUYÊN TRUYỀN':
      return 'Tổ VH-TT-TT-TT';
    default:
      return section;
  }
}

export function isTaskRelatedToStaff(task: Task, staffId: string, staffName: string): boolean {
  if (staffId === 'all') return true;

  const cleanId = staffId.replace('usr-', '').toLowerCase();
  
  // 1. Direct ID matching if available
  if (task.assigneeId) {
    const taskAssigneeCleanId = task.assigneeId.replace('usr-', '').toLowerCase();
    if (taskAssigneeCleanId === cleanId) return true;
  }
  if (task.coAssigneeIds && Array.isArray(task.coAssigneeIds)) {
    if (task.coAssigneeIds.some((id: string) => id.replace('usr-', '').toLowerCase() === cleanId)) {
      return true;
    }
  }

  const normalize = (s: string) => s.toLowerCase().replace(/đ\/c\s*/g, '').trim();
  const targetNorm = normalize(staffName || '');
  const assigneeNorm = normalize(task.assignee || '');

  // 2. Direct string match on assignee
  if (targetNorm && (assigneeNorm.includes(targetNorm) || targetNorm.includes(assigneeNorm))) {
    return true;
  }

  // 3. Match by last name word (e.g. "Cường", "Dương", "Đạt", "Trổi", "Thiện", "Nhân")
  const nameParts = targetNorm.split(' ').filter(Boolean);
  const firstName = nameParts.length > 0 ? nameParts[nameParts.length - 1] : '';
  if (firstName && firstName.length >= 2) {
    const assigneeWords = assigneeNorm.split(/[\s,./-]+/).filter(Boolean);
    if (assigneeWords.includes(firstName)) {
      return true;
    }
  }

  // 4. Co-assignees matching
  if (task.coAssignees && task.coAssignees.length > 0) {
    for (const co of task.coAssignees) {
      const coNorm = normalize(co);
      if (targetNorm && (coNorm.includes(targetNorm) || targetNorm.includes(coNorm))) {
        return true;
      }
      if (firstName && firstName.length >= 2) {
        const coWords = coNorm.split(/[\s,./-]+/).filter(Boolean);
        if (coWords.includes(firstName)) {
          return true;
        }
      }
    }
  }

  // 5. Special group mapping for HCKT
  if (cleanId.includes('hckt') && (task.section.includes('HÀNH CHÍNH') || task.assignee.includes('Kế toán') || task.assignee.includes('HC-KT'))) {
    return true;
  }

  return false;
}

export function calculateSummary(tasks: Task[]) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const delayed = tasks.filter(t => t.status === 'delayed').length;
  const pending = tasks.filter(t => t.status === 'pending_input').length;
  const paused = tasks.filter(t => t.status === 'paused').length;

  const urgentOrHigh = tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length;
  const hasIssues = tasks.filter(t => (t.difficulties && t.difficulties.trim().length > 0) || t.status === 'delayed').length;
  
  const avgProgress = total > 0 ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / total) : 0;

  return {
    total,
    completed,
    inProgress,
    delayed,
    pending,
    paused,
    urgentOrHigh,
    hasIssues,
    avgProgress,
  };
}

export function isUserInDepartment(
  user: UserAccount,
  sectionOrDeptName: string,
  departments: Department[] = []
): boolean {
  if (!user || !sectionOrDeptName) return false;

  const userUnit = (user.unit || '').trim().toLowerCase();
  const target = sectionOrDeptName.trim().toLowerCase();

  if (!userUnit && !target) return false;

  // 1. Direct equality or substring containment
  if (userUnit && target && (userUnit === target || userUnit.includes(target) || target.includes(userUnit))) {
    return true;
  }

  // 2. Lookup corresponding department from departments list
  const deptObj = departments.find(
    (d) =>
      d.name.toLowerCase() === target ||
      d.code.toLowerCase() === target ||
      (d.shortName && d.shortName.toLowerCase() === target) ||
      target.includes(d.name.toLowerCase()) ||
      d.name.toLowerCase().includes(target)
  );

  if (deptObj) {
    const dName = deptObj.name.toLowerCase();
    const dCode = deptObj.code.toLowerCase();
    const dShort = (deptObj.shortName || '').toLowerCase();

    if (userUnit === dName || userUnit.includes(dName) || dName.includes(userUnit)) {
      return true;
    }
    if (dCode && (userUnit.includes(dCode) || userUnit === dCode)) {
      return true;
    }
    if (dShort && (userUnit.includes(dShort) || dShort.includes(userUnit))) {
      return true;
    }
    if (deptObj.leaderId && (user.id === deptObj.leaderId || user.id.replace('usr-', '') === deptObj.leaderId)) {
      return true;
    }
  }

  // 3. Domain semantic matching for standard administrative sections
  // Dịch vụ công ích - Xây dựng (DVCI - XD)
  const isTargetDvci =
    target.includes('công ích') ||
    target.includes('dịch vụ công ích') ||
    target.includes('xây dựng') ||
    target.includes('dvci') ||
    target.includes('đầu tư') ||
    target.includes('thường xuyên') ||
    target.startsWith('iii.') ||
    target.startsWith('iv.') ||
    target.startsWith('v.');

  if (isTargetDvci) {
    return (
      userUnit.includes('công ích') ||
      userUnit.includes('xây dựng') ||
      userUnit.includes('dvci') ||
      userUnit.includes('ccn') ||
      userUnit.includes('môi trường') ||
      userUnit.includes('dự án')
    );
  }

  // Văn hóa - Thể thao - Thông tin - Tuyên truyền (VH - TT)
  const isTargetVhtt =
    target.includes('văn hóa') ||
    target.includes('thể thao') ||
    target.includes('thông tin') ||
    target.includes('tuyên truyền') ||
    target.includes('truyền thanh') ||
    target.includes('vh-tt') ||
    target.includes('vhtt') ||
    target.startsWith('vi.');

  if (isTargetVhtt) {
    return (
      userUnit.includes('văn hóa') ||
      userUnit.includes('thể thao') ||
      userUnit.includes('thông tin') ||
      userUnit.includes('tuyên truyền') ||
      userUnit.includes('truyền thanh') ||
      userUnit.includes('cntt') ||
      userUnit.includes('vh-tt') ||
      userUnit.includes('vhtt')
    );
  }

  // Hành chính - Kế toán (HC - KT)
  const isTargetHckt =
    target.includes('hành chính') ||
    target.includes('kế toán') ||
    target.includes('hc-kt') ||
    target.includes('hckt') ||
    target.startsWith('ii.');

  if (isTargetHckt) {
    return (
      userUnit.includes('hành chính') ||
      userUnit.includes('kế toán') ||
      userUnit.includes('hc-kt') ||
      userUnit.includes('hckt')
    );
  }

  // Ban Giám Đốc
  const isTargetBgd =
    target.includes('giám đốc') ||
    target.includes('ban giám đốc') ||
    target.includes('bgd');

  if (isTargetBgd) {
    return (
      userUnit.includes('giám đốc') ||
      userUnit.includes('bgd') ||
      user.isLeader ||
      user.role === 'LEADER'
    );
  }

  return false;
}

export function getUsersForDepartment(
  users: UserAccount[],
  sectionOrDeptName: string,
  departments: Department[] = []
): UserAccount[] {
  return users.filter((u) => isUserInDepartment(u, sectionOrDeptName, departments));
}

