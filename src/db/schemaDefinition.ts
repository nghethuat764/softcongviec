import { TableMetadata } from '../types/database';

export const DATABASE_TABLES_METADATA: TableMetadata[] = [
  {
    tableName: 'users',
    displayName: 'Bảng Người Dùng & Phân Quyền (users)',
    description: 'Lưu trữ tài khoản, chức danh, đơn vị công tác và phân quyền vai trò (LÃNH ĐẠO / NHÂN VIÊN).',
    columns: [
      { name: 'id', type: 'VARCHAR(64)', constraint: 'PRIMARY KEY', description: 'Mã định danh duy nhất của người dùng' },
      { name: 'username', type: 'VARCHAR(50)', constraint: 'UNIQUE NOT NULL', description: 'Tên đăng nhập hệ thống' },
      { name: 'password_hash', type: 'VARCHAR(255)', constraint: 'NOT NULL', description: 'Mật khẩu đã mã hóa an toàn' },
      { name: 'full_name', type: 'VARCHAR(150)', constraint: 'NOT NULL', description: 'Họ và tên cán bộ, viên chức' },
      { name: 'short_name', type: 'VARCHAR(50)', constraint: 'NOT NULL', description: 'Tên gọi tắt hiển thị trên giao diện' },
      { name: 'role', type: 'VARCHAR(20)', constraint: "CHECK (role IN ('LEADER', 'STAFF'))", description: 'Quyền hạn: LÃNH ĐẠO (LEADER) hoặc NHÂN VIÊN (STAFF)' },
      { name: 'position', type: 'VARCHAR(100)', constraint: 'NOT NULL', description: 'Chức danh / Vị trí việc làm' },
      { name: 'unit', type: 'VARCHAR(150)', constraint: 'NOT NULL', description: 'Đơn vị / Tổ chuyên môn' },
      { name: 'email', type: 'VARCHAR(100)', constraint: 'UNIQUE NOT NULL', description: 'Địa chỉ email công vụ' },
      { name: 'phone', type: 'VARCHAR(20)', constraint: 'NULL', description: 'Số điện thoại liên lạc' },
      { name: 'is_active', type: 'BOOLEAN', constraint: 'DEFAULT TRUE', description: 'Trạng thái hoạt động tài khoản' },
      { name: 'created_at', type: 'TIMESTAMP', constraint: 'DEFAULT CURRENT_TIMESTAMP', description: 'Thời điểm tạo tài khoản' },
    ],
  },
  {
    tableName: 'tasks',
    displayName: 'Bảng Nhiệm Vụ & Phân Công (tasks)',
    description: 'Lưu trữ thông tin nhiệm vụ do Lãnh đạo giao, phân công cho nhân viên, hạn định và trạng thái.',
    columns: [
      { name: 'id', type: 'VARCHAR(64)', constraint: 'PRIMARY KEY', description: 'Mã định danh duy nhất của nhiệm vụ' },
      { name: 'code', type: 'VARCHAR(20)', constraint: 'NOT NULL', description: 'Mã nhiệm vụ theo kết luận giao ban (VD: II.1, III.2b)' },
      { name: 'section', type: 'VARCHAR(150)', constraint: 'NOT NULL', description: 'Tổ / Khối chuyên môn phụ trách' },
      { name: 'category', type: 'VARCHAR(100)', constraint: 'NOT NULL', description: 'Phân loại nhóm công việc' },
      { name: 'title', type: 'VARCHAR(255)', constraint: 'NOT NULL', description: 'Tên nhiệm vụ / Dự án / Công trình' },
      { name: 'requirement', type: 'TEXT', constraint: 'NOT NULL', description: 'Nội dung kết luận chỉ đạo của Giám đốc' },
      { name: 'assignee_id', type: 'VARCHAR(64)', constraint: 'FOREIGN KEY REFERENCES users(id)', description: 'Cán bộ phụ trách chính (Nhân viên được giao việc)' },
      { name: 'created_by_leader_id', type: 'VARCHAR(64)', constraint: 'FOREIGN KEY REFERENCES users(id)', description: 'Lãnh đạo phát lệnh giao việc (Thường là Giám đốc)' },
      { name: 'leadership_director', type: 'VARCHAR(100)', constraint: 'NULL', description: 'Lãnh đạo phụ trách theo dõi chỉ đạo (VD: Đ/c Tuyến)' },
      { name: 'status', type: 'VARCHAR(30)', constraint: "CHECK (status IN ('in_progress','completed','delayed','pending_input','paused'))", description: 'Trạng thái thực hiện hiện tại' },
      { name: 'progress', type: 'INTEGER', constraint: 'CHECK (progress BETWEEN 0 AND 100)', description: 'Phần trăm hoàn thành (0% - 100%)' },
      { name: 'priority', type: 'VARCHAR(20)', constraint: "CHECK (priority IN ('normal','high','urgent'))", description: 'Mức độ ưu tiên: Bình thường, Cao, Hỏa tốc' },
      { name: 'deadline', type: 'DATE', constraint: 'NULL', description: 'Hạn hoàn thành công việc' },
      { name: 'start_date', type: 'DATE', constraint: 'NULL', description: 'Ngày bắt đầu triển khai' },
      { name: 'budget_info', type: 'VARCHAR(200)', constraint: 'NULL', description: 'Thông tin kinh phí / Dự toán ngân sách' },
      { name: 'current_report', type: 'TEXT', constraint: 'NULL', description: 'Nội dung báo cáo tiến độ mới nhất của cán bộ' },
      { name: 'difficulties', type: 'TEXT', constraint: 'NULL', description: 'Khó khăn, vướng mắc phát sinh trong quá trình làm' },
      { name: 'proposals', type: 'TEXT', constraint: 'NULL', description: 'Kiến nghị, đề xuất với Lãnh đạo Trung tâm' },
      { name: 'created_at', type: 'TIMESTAMP', constraint: 'DEFAULT CURRENT_TIMESTAMP', description: 'Thời điểm giao nhiệm vụ' },
      { name: 'updated_at', type: 'TIMESTAMP', constraint: 'DEFAULT CURRENT_TIMESTAMP', description: 'Thời điểm cập nhật gần nhất' },
    ],
  },
  {
    tableName: 'task_co_assignees',
    displayName: 'Bảng Cán Bộ Phối Hợp (task_co_assignees)',
    description: 'Quan hệ nhiều-nhiều (N-N) xác định các viên chức phối hợp thực hiện nhiệm vụ.',
    columns: [
      { name: 'id', type: 'VARCHAR(64)', constraint: 'PRIMARY KEY', description: 'Mã định danh bản ghi' },
      { name: 'task_id', type: 'VARCHAR(64)', constraint: 'FOREIGN KEY REFERENCES tasks(id) ON DELETE CASCADE', description: 'Mã nhiệm vụ' },
      { name: 'user_id', type: 'VARCHAR(64)', constraint: 'FOREIGN KEY REFERENCES users(id)', description: 'Cán bộ phối hợp' },
      { name: 'role_description', type: 'VARCHAR(100)', constraint: 'NULL', description: 'Vai trò phối hợp chuyên môn' },
    ],
  },
  {
    tableName: 'task_progress_reports',
    displayName: 'Bảng Nhật Ký Báo Cáo Tiến Độ (task_progress_reports)',
    description: 'Lưu vết từng lần nhân viên cập nhật báo cáo tiến độ qua form riêng biệt.',
    columns: [
      { name: 'id', type: 'VARCHAR(64)', constraint: 'PRIMARY KEY', description: 'Mã định danh báo cáo tiến độ' },
      { name: 'task_id', type: 'VARCHAR(64)', constraint: 'FOREIGN KEY REFERENCES tasks(id) ON DELETE CASCADE', description: 'Mã nhiệm vụ được báo cáo' },
      { name: 'reporter_id', type: 'VARCHAR(64)', constraint: 'FOREIGN KEY REFERENCES users(id)', description: 'Cán bộ trực tiếp báo cáo' },
      { name: 'progress_percent', type: 'INTEGER', constraint: 'CHECK (progress_percent BETWEEN 0 AND 100)', description: 'Mức độ tiến độ tại thời điểm báo cáo' },
      { name: 'status', type: 'VARCHAR(30)', constraint: 'NOT NULL', description: 'Trạng thái tại thời điểm báo cáo' },
      { name: 'work_done', type: 'TEXT', constraint: 'NOT NULL', description: 'Nội dung công việc cụ thể đã làm thực tế' },
      { name: 'difficulties', type: 'TEXT', constraint: 'NULL', description: 'Khó khăn phát sinh ghi nhận' },
      { name: 'proposals', type: 'TEXT', constraint: 'NULL', description: 'Đề xuất kiến nghị gửi Lãnh đạo' },
      { name: 'attachments_json', type: 'JSONB', constraint: 'NULL', description: 'Số hiệu văn bản / Quyết định / Biên bản nghiệm thu đính kèm' },
      { name: 'submitted_at', type: 'TIMESTAMP', constraint: 'DEFAULT CURRENT_TIMESTAMP', description: 'Thời điểm nộp form báo cáo' },
    ],
  },
  {
    tableName: 'leader_directives',
    displayName: 'Bảng Chỉ Đạo & Đôn Đốc Của Lãnh Đạo (leader_directives)',
    description: 'Lưu trữ chỉ đạo, đôn đốc, kết luận của Giám đốc/Phó Giám đốc đối với nhiệm vụ.',
    columns: [
      { name: 'id', type: 'VARCHAR(64)', constraint: 'PRIMARY KEY', description: 'Mã định danh ý kiến chỉ đạo' },
      { name: 'task_id', type: 'VARCHAR(64)', constraint: 'FOREIGN KEY REFERENCES tasks(id) ON DELETE CASCADE', description: 'Mã nhiệm vụ được chỉ đạo' },
      { name: 'author_id', type: 'VARCHAR(64)', constraint: 'FOREIGN KEY REFERENCES users(id)', description: 'Lãnh đạo ra chỉ đạo' },
      { name: 'content', type: 'TEXT', constraint: 'NOT NULL', description: 'Nội dung chỉ đạo, đôn đốc cụ thể' },
      { name: 'target_deadline', type: 'DATE', constraint: 'NULL', description: 'Mốc hạn định yêu cầu mới (nếu có)' },
      { name: 'is_urgent', type: 'BOOLEAN', constraint: 'DEFAULT FALSE', description: 'Đóng dấu chỉ đạo HỎA TỐC' },
      { name: 'created_at', type: 'TIMESTAMP', constraint: 'DEFAULT CURRENT_TIMESTAMP', description: 'Thời điểm phát lệnh chỉ đạo' },
    ],
  },
  {
    tableName: 'audit_logs',
    displayName: 'Bảng Nhật Ký Hoạt Động & Bảo Mật (audit_logs)',
    description: 'Lưu vết lịch sử phân công, đổi trạng thái, đăng nhập và bảo mật hệ thống.',
    columns: [
      { name: 'id', type: 'VARCHAR(64)', constraint: 'PRIMARY KEY', description: 'Mã bản ghi kiểm toán' },
      { name: 'action', type: 'VARCHAR(50)', constraint: 'NOT NULL', description: 'Hành động: ASSIGN_TASK, UPDATE_PROGRESS, DIRECTIVE, LOGIN...' },
      { name: 'user_id', type: 'VARCHAR(64)', constraint: 'FOREIGN KEY REFERENCES users(id)', description: 'Tài khoản thực hiện' },
      { name: 'target_task_id', type: 'VARCHAR(64)', constraint: 'NULL', description: 'Mã nhiệm vụ liên quan (nếu có)' },
      { name: 'details', type: 'TEXT', constraint: 'NOT NULL', description: 'Chi tiết hành động thực hiện' },
      { name: 'timestamp', type: 'TIMESTAMP', constraint: 'DEFAULT CURRENT_TIMESTAMP', description: 'Thời điểm thực hiện' },
    ],
  },
];

export const SQL_SCHEMA_SCRIPT = `-- =========================================================================
-- HỆ THỐNG PHÂN CÔNG NHIỆM VỤ & BÁO CÁO TIẾN ĐỘ TTDVTH PHƯỜNG HỐ NAI
-- DDL DATABASE SCHEMA: POSTGRESQL / RELATIONAL DATABASE
-- Phiên bản: 1.0 - Chuẩn hóa RBAC và Form Báo cáo Tiến độ
-- =========================================================================

-- 1. BẢNG NGƯỜI DÙNG & PHÂN QUYỀN (users)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    short_name VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('LEADER', 'STAFF')),
    position VARCHAR(100) NOT NULL,
    unit VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chỉ mục tối ưu đăng nhập và tra cứu vai trò
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- 2. BẢNG NHIỆM VỤ & PHÂN CÔNG (tasks)
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(20) NOT NULL,
    section VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    requirement TEXT NOT NULL,
    assignee_id VARCHAR(64) NOT NULL REFERENCES users(id) ON UPDATE CASCADE,
    created_by_leader_id VARCHAR(64) NOT NULL REFERENCES users(id) ON UPDATE CASCADE,
    leadership_director VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'in_progress' 
        CHECK (status IN ('in_progress', 'completed', 'delayed', 'pending_input', 'paused')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    priority VARCHAR(20) NOT NULL DEFAULT 'normal' 
        CHECK (priority IN ('normal', 'high', 'urgent')),
    deadline DATE,
    start_date DATE,
    budget_info VARCHAR(200),
    current_report TEXT,
    difficulties TEXT,
    proposals TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_section ON tasks(section);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);

-- 3. BẢNG CÁN BỘ PHỐI HỢP (task_co_assignees)
CREATE TABLE IF NOT EXISTS task_co_assignees (
    id VARCHAR(64) PRIMARY KEY,
    task_id VARCHAR(64) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_description VARCHAR(100),
    UNIQUE(task_id, user_id)
);

CREATE INDEX idx_co_assignees_task ON task_co_assignees(task_id);
CREATE INDEX idx_co_assignees_user ON task_co_assignees(user_id);

-- 4. BẢNG NHẬT KÝ BÁO CÁO TIẾN ĐỘ CỦA NHÂN VIÊN (task_progress_reports)
CREATE TABLE IF NOT EXISTS task_progress_reports (
    id VARCHAR(64) PRIMARY KEY,
    task_id VARCHAR(64) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    reporter_id VARCHAR(64) NOT NULL REFERENCES users(id),
    progress_percent INTEGER NOT NULL CHECK (progress_percent BETWEEN 0 AND 100),
    status VARCHAR(30) NOT NULL,
    work_done TEXT NOT NULL,
    difficulties TEXT,
    proposals TEXT,
    attachments_json JSONB,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_task ON task_progress_reports(task_id);
CREATE INDEX idx_reports_reporter ON task_progress_reports(reporter_id);
CREATE INDEX idx_reports_date ON task_progress_reports(submitted_at DESC);

-- 5. BẢNG CHỈ ĐẠO & ĐÔN ĐỐC CỦA LÃNH ĐẠO (leader_directives)
CREATE TABLE IF NOT EXISTS leader_directives (
    id VARCHAR(64) PRIMARY KEY,
    task_id VARCHAR(64) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    author_id VARCHAR(64) NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    target_deadline DATE,
    is_urgent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_directives_task ON leader_directives(task_id);
CREATE INDEX idx_directives_author ON leader_directives(author_id);

-- 6. BẢNG NHẬT KÝ KIỂM TOÁN HỆ THỐNG (audit_logs)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    target_task_id VARCHAR(64),
    details TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
`;
