export type TaskStatus = 
  | 'completed'       // Hoàn thành
  | 'in_progress'     // Đang triển khai
  | 'pending_input'   // Đang lấy ý kiến / Chờ phê duyệt / Chờ hướng dẫn
  | 'delayed'         // Chậm tiến độ / Vướng mắc
  | 'paused';         // Tạm dừng

export type PriorityLevel = 'urgent' | 'high' | 'normal';

export interface ProgressReportLog {
  id: string;
  timestamp: string;
  reporter: string;
  progressPercent: number;
  status: TaskStatus;
  workDone: string;
  difficulties?: string;
  proposals?: string;
  attachments?: string[];
}

export interface Directive {
  id: string;
  timestamp: string;
  author: string; // e.g., 'Phạm Thanh Phong - Giám đốc'
  content: string;
  targetDeadline?: string;
  isUrgent?: boolean;
}

export type SectionType = 
  | 'II. TỔ HÀNH CHÍNH - KẾ TOÁN'
  | 'III. TỔ DỊCH VỤ CÔNG ÍCH - XÂY DỰNG'
  | 'IV. CÁC DỰ ÁN ĐẦU TƯ CÔNG TRUNG HẠN'
  | 'V. CÁC DỰ ÁN ĐẦU TƯ NGÂN SÁCH CHI THƯỜNG XUYÊN'
  | 'VI. TỔ VĂN HÓA - THỂ THAO - THÔNG TIN - TUYÊN TRUYỀN';

export interface Task {
  id: string;
  code: string;              // e.g. "II.1", "III.2b", "VI.4a"
  section: SectionType;
  title: string;
  category: string;           // Phân loại nhóm việc (Chi thường xuyên, Dự án xây dựng, Vệ sinh môi trường, Tuyên truyền,...)
  assignee: string;           // Cán bộ phụ trách chính (Đ/c Cường, Đ/c Dương, Đ/c Đạt, Đ/c Trổi, Đ/c Thiện, Đ/c Tuyến, Kế toán,...)
  assigneeId?: string;
  coAssignees?: string[];     // Cán bộ phối hợp
  coAssigneeIds?: string[];
  leadershipDirector?: string;// Lãnh đạo chỉ đạo (e.g. "Đ/c Tuyến chỉ đạo")
  requirement: string;        // Chỉ đạo kết luận giao ban của Giám đốc
  currentReport: string;      // Tình hình thực hiện cập nhật nhất
  progress: number;           // 0 - 100
  status: TaskStatus;
  deadline?: string;          // Hạn định (e.g. 10/10/2026, 30/11/2026)
  startDate?: string;
  budgetInfo?: string;        // Thông tin kinh phí/dự toán nếu có
  relatedDocs?: string[];     // Văn bản đính kèm/căn cứ
  difficulties?: string;      // Vướng mắc, khó khăn
  proposals?: string;         // Đề xuất, kiến nghị
  priority: PriorityLevel;
  progressLogs: ProgressReportLog[];
  leaderDirectives: Directive[];
  updatedAt: string;
}

export interface StaffMember {
  id: string;
  name: string;
  shortName: string;
  role: string;
  unit: string;
  avatarBg: string;
}
