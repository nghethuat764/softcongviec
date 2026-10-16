import { PriorityLevel, SectionType, TaskStatus } from './index';

export type UserRole = 'LEADER' | 'STAFF';

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  shortName: string;
  role: UserRole;
  position: string; // e.g. "Giám đốc Trung tâm", "Viên chức Tổ DVCI - XD"
  unit: string;     // e.g. "Ban Giám đốc", "Tổ Dịch vụ công ích - Xây dựng"
  email: string;
  phone?: string;
  avatarBg: string;
  isLeader: boolean;
}

// Database Entity: Departments / Units Table (Phòng ban / Tổ chuyên môn)
export interface Department {
  id: string;               // e.g. "dept-bgd", "dept-dvci-xd"
  code: string;             // e.g. "BGD", "DVCI-XD", "VH-TT", "HC-KT"
  name: string;             // e.g. "Tổ Dịch vụ công ích - Xây dựng"
  shortName: string;        // e.g. "Tổ DVCI - XD"
  leaderName: string;       // Trưởng phòng / Tổ trưởng / Lãnh đạo phụ trách
  leaderId?: string;        // Liên kết users.id
  phone?: string;           // Số điện thoại liên hệ
  email?: string;           // Hộp thư công vụ
  location?: string;        // Địa điểm văn phòng
  description: string;      // Chức năng, nhiệm vụ quyền hạn chính
  colorBadge?: string;      // Nhận diện màu sắc (blue, emerald, amber, red, purple)
  order?: number;           // Thứ tự sắp xếp hiển thị
  createdAt?: string;
  updatedAt?: string;
}

// Database Entity: Tasks Table
export interface DbTask {
  id: string;
  code: string;                  // e.g. "II.1", "III.2a"
  section: SectionType;
  category: string;
  title: string;
  requirement: string;            // Chỉ đạo giao việc của Giám đốc
  assigneeId: string;             // Foreign Key -> users.id
  assigneeName: string;           // Cached for display
  coAssigneeIds?: string[];       // Array of user IDs
  coAssignees?: string[];         // Cached names
  leadershipDirector?: string;    // Lãnh đạo phụ trách chỉ đạo
  createdByLeaderId: string;      // Foreign Key -> users.id (người giao việc)
  status: TaskStatus;
  progress: number;               // 0 - 100
  priority: PriorityLevel;
  deadline?: string;              // YYYY-MM-DD
  startDate?: string;
  budgetInfo?: string;
  relatedDocs?: string[];
  currentReport: string;
  difficulties?: string;
  proposals?: string;
  createdAt: string;
  updatedAt: string;
}

// Database Entity: Task Progress Reports Table (Audit log for staff)
export interface DbProgressReport {
  id: string;
  taskId: string;                 // Foreign Key -> tasks.id
  reporterId: string;             // Foreign Key -> users.id
  reporterName: string;
  progressPercent: number;
  status: TaskStatus;
  workDone: string;
  difficulties?: string;
  proposals?: string;
  attachments?: string[];
  submittedAt: string;
}

// Database Entity: Leader Directives Table (Audit log for directives)
export interface DbLeaderDirective {
  id: string;
  taskId: string;                 // Foreign Key -> tasks.id
  authorId: string;               // Foreign Key -> users.id
  authorName: string;
  content: string;
  targetDeadline?: string;
  isUrgent: boolean;
  createdAt: string;
}

// Database Entity: Audit Logs Table
export interface DbAuditLog {
  id: string;
  action: 'ASSIGN_TASK' | 'UPDATE_PROGRESS' | 'DIRECTIVE' | 'EDIT_TASK' | 'DELETE_TASK' | 'LOGIN';
  userId: string;
  userName: string;
  userRole: UserRole;
  targetTaskId?: string;
  targetTaskTitle?: string;
  details: string;
  timestamp: string;
}

// Database schema table metadata for visual schema explorer
export interface TableColumnMetadata {
  name: string;
  type: string;
  constraint: string;
  description: string;
}

export interface TableMetadata {
  tableName: string;
  displayName: string;
  description: string;
  columns: TableColumnMetadata[];
}
