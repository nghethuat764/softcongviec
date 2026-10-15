import React, { useState } from 'react';
import { DATABASE_TABLES_METADATA, SQL_SCHEMA_SCRIPT } from '../db/schemaDefinition';
import { 
  Database, 
  X, 
  Copy, 
  Check, 
  Table, 
  Key, 
  Network, 
  FileCode, 
  Layers, 
  ShieldCheck, 
  UserCheck 
} from 'lucide-react';

interface DatabaseSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSchemaModal: React.FC<DatabaseSchemaModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'tables' | 'erd' | 'sql'>('analysis');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-[#153e6b] px-6 py-4 text-white flex items-center justify-between border-b border-[#0f2f52] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Cấu Trúc Cơ Sở Dữ Liệu & Lược Đồ SQL
              </h2>
              <p className="text-xs text-blue-200 font-medium">
                Lược đồ dữ liệu phân công nhiệm vụ, báo cáo tiến độ và phân quyền cán bộ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-nav Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('analysis')}
            className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'analysis'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>1. Phân Tích Nội Dung Lưu Trữ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tables')}
            className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'tables'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Table className="w-3.5 h-3.5 text-emerald-600" />
            <span>2. Cấu Trúc Bảng Dữ Liệu ({DATABASE_TABLES_METADATA.length} bảng)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('erd')}
            className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'erd'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-purple-600" />
            <span>3. Sơ Đồ Quan Hệ ERD</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'sql'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-amber-600" />
            <span>4. Mã Nguồn SQL DDL</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm flex-1">
          
          {/* TAB 1: PHÂN TÍCH NỘI DUNG LƯU TRỮ */}
          {activeTab === 'analysis' && (
            <div className="space-y-5">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-blue-950">
                <h3 className="font-bold text-sm mb-1">
                  Mục tiêu thiết kế Database theo Form nghiệp vụ
                </h3>
                <p className="text-xs leading-relaxed text-blue-900">
                  Cơ sở dữ liệu được thiết kế theo mô hình quan hệ (Relational RDBMS - PostgreSQL/MySQL) đảm bảo tính toàn vẹn tham chiếu (Referential Integrity), hỗ trợ kiểm toán vết (Audit Trail) và phân quyền chặt chẽ giữa <strong>Cấp Lãnh đạo</strong> và <strong>Cấp Nhân viên</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Entity 1 */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">1</span>
                    <h4 className="font-bold text-slate-900 text-xs">Người Dùng & Phân Quyền (Bảng users)</h4>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs pl-1">
                    <li><strong>Mục đích:</strong> Xác thực danh tính và phân tách quyền hạn công vụ.</li>
                    <li><strong>Dữ liệu lưu trữ:</strong> ID, Username, PasswordHash, Họ tên, Tên tắt, Email, Điện thoại, Đơn vị, Chức vụ.</li>
                    <li><strong>Phân quyền (RBAC):</strong> Role = <code>'LEADER'</code> (Lãnh đạo) hoặc <code>'STAFF'</code> (Nhân viên).</li>
                  </ul>
                </div>

                {/* Entity 2 */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">2</span>
                    <h4 className="font-bold text-slate-900 text-xs">Nhiệm Vụ & Phân Công (Bảng tasks)</h4>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs pl-1">
                    <li><strong>Mục đích:</strong> Lưu vết toàn bộ 40 nhiệm vụ từ thông báo kết luận và các nhiệm vụ mới phát sinh.</li>
                    <li><strong>Dữ liệu lưu trữ:</strong> Mã nhiệm vụ (II.1, III.2b), Khối/Tổ phụ trách, Tiêu đề, Yêu cầu kết luận của Giám đốc, Kinh phí/Dự toán.</li>
                    <li><strong>Khóa ngoại liên kết:</strong> <code>created_by_leader_id</code> (Lãnh đạo giao việc) và <code>assignee_id</code> (Cán bộ phụ trách chính).</li>
                  </ul>
                </div>

                {/* Entity 3 */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">3</span>
                    <h4 className="font-bold text-slate-900 text-xs">Nhật Ký Báo Cáo Tiến Độ (Bảng task_progress_reports)</h4>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs pl-1">
                    <li><strong>Mục đích:</strong> Lưu trữ từng lần nhân viên nộp Form báo cáo tiến độ.</li>
                    <li><strong>Dữ liệu lưu trữ:</strong> TaskId, ReporterId, % Tiến độ (0-100), Trạng thái, Nội dung đã làm thực tế, Khó khăn/Vướng mắc, Kiến nghị Lãnh đạo, Văn bản đính kèm, Thời điểm nộp.</li>
                    <li><strong>Tính năng:</strong> Giúp Lãnh đạo xem lại được toàn bộ tiến trình lịch sử, không bị đè mất dữ liệu cũ.</li>
                  </ul>
                </div>

                {/* Entity 4 */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">4</span>
                    <h4 className="font-bold text-slate-900 text-xs">Chỉ Đạo & Đôn Đốc Của Lãnh Đạo (Bảng leader_directives)</h4>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs pl-1">
                    <li><strong>Mục đích:</strong> Lưu vết các ý kiến chỉ đạo, đôn đốc tức thời của Giám đốc/Phó Giám đốc.</li>
                    <li><strong>Dữ liệu lưu trữ:</strong> TaskId, AuthorId, Nội dung chỉ đạo, Hạn chót mới ấn định, Cờ HỎA TỐC (is_urgent), Thời điểm phát lệnh.</li>
                    <li><strong>Tính năng:</strong> Nhân viên phụ trách sẽ nhận được cảnh báo chỉ đạo ngay trên Form của mình.</li>
                  </ul>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: CẤU TRÚC BẢNG DỮ LIỆU */}
          {activeTab === 'tables' && (
            <div className="space-y-6">
              {DATABASE_TABLES_METADATA.map((tbl) => (
                <div key={tbl.tableName} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                  <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs font-mono">{tbl.tableName}</h4>
                      <p className="text-2xs text-slate-500">{tbl.displayName} - {tbl.description}</p>
                    </div>
                    <span className="font-mono text-2xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                      {tbl.columns.length} cột
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-2xs border-collapse">
                      <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Tên Cột</th>
                          <th className="py-2 px-3">Kiểu Dữ Liệu</th>
                          <th className="py-2 px-3">Ràng Buộc (Constraints)</th>
                          <th className="py-2 px-3">Mô Tả Chức Năng</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {tbl.columns.map((col) => (
                          <tr key={col.name} className="hover:bg-slate-50/70">
                            <td className="py-2 px-3 font-bold text-slate-800">{col.name}</td>
                            <td className="py-2 px-3 text-blue-700">{col.type}</td>
                            <td className="py-2 px-3 text-red-700">{col.constraint}</td>
                            <td className="py-2 px-3 font-sans text-slate-600">{col.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: ERD SƠ ĐỒ QUAN HỆ */}
          {activeTab === 'erd' && (
            <div className="space-y-4">
              <div className="bg-slate-900 text-slate-100 p-6 rounded-xl font-mono text-xs leading-relaxed overflow-x-auto shadow-inner">
                <div className="text-amber-400 font-bold mb-3">
                  -- SƠ ĐỒ THỰC THỂ QUAN HỆ (ENTITY RELATIONSHIP DIAGRAM) --
                </div>
{`+-----------------------+           1 : N           +------------------------------+
|        users          | ------------------------> |            tasks             |
|-----------------------|   (assignee_id)           |------------------------------|
| PK  id                |                           | PK  id                       |
|     username          | ------------------------> |     code                     |
|     role (LEADER/STAFF|   (created_by_leader_id)  |     section, title           |
|     full_name         |       1 : N               |     requirement              |
|     unit, position    |                           | FK  assignee_id              |
+-----------------------+                           | FK  created_by_leader_id     |
           |                                        |     status, progress         |
           | 1 : N                                  |     deadline, budget_info    |
           | (reporter_id)                          +------------------------------+
           |                                                       |
           v                                                       | 1 : N (task_id)
+------------------------------+                                   |
|    task_progress_reports     | <---------------------------------+
|------------------------------|
| PK  id                       |
| FK  task_id                  |
| FK  reporter_id              |
|     progress_percent (0-100) |
|     status, work_done        |
|     difficulties, proposals  |
|     submitted_at             |
+------------------------------+

+-----------------------+           1 : N           +------------------------------+
|        users          | ------------------------> |      leader_directives       |
|-----------------------|   (author_id)             |------------------------------|
| PK  id                |                           | PK  id                       |
+-----------------------+                           | FK  task_id                  |
           ^                                        | FK  author_id                |
           |                                        |     content                  |
           +--------------------------------------- |     target_deadline          |
                   (task_id: 1 : N from tasks)      |     is_urgent                |
                                                    +------------------------------+`}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <strong className="text-slate-900 block mb-1">Quy tắc ràng buộc Lãnh đạo giao việc:</strong>
                  <p className="text-slate-600 leading-relaxed">
                    Cột <code>created_by_leader_id</code> tham chiếu đến người dùng có <code>role = 'LEADER'</code>. Khi lãnh đạo giao nhiệm vụ mới, hệ thống tự động gán ID của lãnh đạo đó và gán <code>assignee_id</code> là nhân viên nhận việc.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <strong className="text-slate-900 block mb-1">Quy tắc bảo vệ dữ liệu nhân viên:</strong>
                  <p className="text-slate-600 leading-relaxed">
                    Khi nhân viên nộp Form báo cáo tiến độ, hệ thống ghi bản ghi mới vào <code>task_progress_reports</code> kèm <code>reporter_id = current_user.id</code>, đồng thời cập nhật trạng thái mới nhất lên <code>tasks</code>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MÃ NGUỒN SQL DDL */}
          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  File: <code>schema.sql</code> (Hỗ trợ PostgreSQL 14+, MySQL 8+, SQLite 3)
                </span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Đã Sao Chép SQL!' : 'Sao Chép Mã SQL'}</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-950 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto max-h-[480px] leading-relaxed">
                {SQL_SCHEMA_SCRIPT}
              </pre>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500">
            Hệ thống hỗ trợ export DDL và đồng bộ dữ liệu vào cơ sở dữ liệu quan hệ
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 font-medium transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
