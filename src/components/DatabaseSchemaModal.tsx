import React, { useState } from 'react';
import { DATABASE_TABLES_METADATA, SQL_SCHEMA_SCRIPT } from '../db/schemaDefinition';
import { ORACLE_SQL_SCHEMA_SCRIPT, ORACLE_NODEJS_INTEGRATION_CODE } from '../db/oracleSchemaScript';
import { generateLiveOracleSqlScript, downloadOracleSqlScript } from '../utils/oracleExport';
import { useAuth } from '../context/AuthContext';
import { useDepartments } from '../context/DepartmentContext';
import { Task } from '../types';
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
  UserCheck,
  Server,
  Download,
  Terminal,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  HardDrive
} from 'lucide-react';

interface DatabaseSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks?: Task[];
}

export const DatabaseSchemaModal: React.FC<DatabaseSchemaModalProps> = ({ 
  isOpen, 
  onClose,
  tasks = []
}) => {
  const { users } = useAuth();
  const { departments } = useDepartments();

  const [activeTab, setActiveTab] = useState<'analysis' | 'tables' | 'erd' | 'sql' | 'oracle'>('oracle');
  const [copied, setCopied] = useState(false);
  const [copiedOracle, setCopiedOracle] = useState(false);
  const [copiedNode, setCopiedNode] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Hook rules: check isOpen after hooks
  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyOracleSql = () => {
    const liveSql = generateLiveOracleSqlScript(tasks, users, departments);
    navigator.clipboard.writeText(liveSql);
    setCopiedOracle(true);
    setTimeout(() => setCopiedOracle(false), 2500);
  };

  const handleCopyNodeCode = () => {
    navigator.clipboard.writeText(ORACLE_NODEJS_INTEGRATION_CODE);
    setCopiedNode(true);
    setTimeout(() => setCopiedNode(false), 2500);
  };

  const handleDownloadOracleFile = () => {
    downloadOracleSqlScript(tasks, users, departments);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Modal Header */}
        <div className="bg-[#003366] px-5 sm:px-6 py-4 text-white flex items-center justify-between border-b border-[#002244] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5 text-red-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Kiến Trúc Cơ Sở Dữ Liệu & Chuyển Đổi Sang Oracle Local
                </h2>
                <span className="bg-red-500/20 text-red-200 border border-red-400/30 text-[11px] font-mono px-2 py-0.2 rounded font-bold">
                  ORACLE 19c/21c/23ai
                </span>
              </div>
              <p className="text-xs text-blue-200 font-medium">
                Quản lý cấu trúc DDL, quan hệ bảng và kịch bản di chuyển từ Cloud Firestore sang máy chủ Oracle On-Premise
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
        <div className="bg-slate-100 border-b border-slate-200 px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('oracle')}
            className={`px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'oracle'
                ? 'bg-red-700 text-white shadow-xs'
                : 'text-red-900 bg-red-50 hover:bg-red-100'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>★ Chuyển Đổi Sang Oracle Local</span>
          </button>

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
            <span>1. Phân Tích Thực Thể</span>
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
            <span>2. Cấu Trúc Bảng ({DATABASE_TABLES_METADATA.length} bảng)</span>
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
            <span>3. Sơ Đồ ERD Quan Hệ</span>
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
            <span>4. PostgreSQL / ANSI SQL</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm flex-1">
          
          {/* TAB 0: CHUYỂN ĐỔI SANG ORACLE DATABASE LOCAL (CHÍNH) */}
          {activeTab === 'oracle' && (
            <div className="space-y-6">
              
              {/* Banner Top */}
              <div className="bg-linear-to-r from-red-900 to-amber-900 text-white p-5 rounded-xl shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                      <Server className="w-6 h-6 text-amber-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-400 text-red-950 px-2 py-0.5 rounded font-mono">
                          MÁY CHỦ ON-PREMISE LOCAL
                        </span>
                        <span className="text-[12px] text-amber-200 font-medium">Bảo mật nội bộ tuyệt đối</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                        Kế Hoạch Di Chuyển CSDL Sang Oracle Database Local
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleDownloadOracleFile}
                      className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-red-950 font-bold rounded-lg text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-md"
                      title="Tải về file script .sql chứa toàn bộ cấu trúc và dữ liệu thực tế"
                    >
                      <Download className="w-4 h-4" />
                      <span>Tải File Script Oracle (.sql)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyOracleSql}
                      className="px-3.5 py-2.5 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-lg text-xs flex items-center gap-2 transition-colors cursor-pointer border border-white/20"
                    >
                      {copiedOracle ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedOracle ? 'Đã chép SQL!' : 'Sao chép SQL'}</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-amber-100 leading-relaxed max-w-4xl">
                  Chuyển từ dịch vụ đám mây Cloud Firestore sang máy chủ Oracle Database Local giúp cơ quan làm chủ hoàn toàn dữ liệu, chạy độc lập trong mạng LAN nội bộ, không phụ thuộc kết nối Internet và đáp ứng tối đa tiêu chuẩn an toàn thông tin của các cơ quan nhà nước.
                </p>

                {downloadSuccess && (
                  <div className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 px-3 py-2 rounded-lg text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span>Đã tạo và tải xuống file script <strong>oracle_database_local_ttdvth.sql</strong> thành công! Bạn có thể mở trực tiếp trong Oracle SQL Developer để chạy.</span>
                  </div>
                )}
              </div>

              {/* 5 Bước chuyển đổi chi tiết */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-red-700" />
                  Quy Trình 5 Bước Chuyển Cấu Trúc & Dữ Liệu Sang Oracle Local
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Bước 1 */}
                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center shrink-0">
                        1
                      </span>
                      <h5 className="font-bold text-slate-900 text-xs">
                        Cài Đặt Oracle Database Trên Máy Chủ Local
                      </h5>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      Cài đặt <strong>Oracle Database 19c, 21c, 23ai hoặc Oracle XE (Free)</strong> trên máy chủ nội bộ (Windows Server hoặc RHEL / Ubuntu Server).
                    </p>
                    <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg">
                      CREATE USER ttdvth_admin IDENTIFIED BY "MatKhauBaoMat@2026";<br/>
                      GRANT CONNECT, RESOURCE TO ttdvth_admin;
                    </div>
                  </div>

                  {/* Bước 2 */}
                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center shrink-0">
                        2
                      </span>
                      <h5 className="font-bold text-slate-900 text-xs">
                        Thực Thi Script DDL & DML Khởi Tạo Bảng
                      </h5>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      Mở công cụ <strong>Oracle SQL Developer</strong> hoặc <strong>PL/SQL Developer</strong>, kết nối vào user <code>ttdvth_admin</code> và chạy toàn bộ file <code>oracle_database_local_ttdvth.sql</code> (đã tải về ở trên).
                    </p>
                    <div className="text-[11px] text-slate-500">
                      ✓ Tự động tạo 8 bảng quan hệ chuẩn 3NF, ràng buộc khóa ngoại, indexes và nạp sẵn 100% dữ liệu hiện có.
                    </div>
                  </div>

                  {/* Bước 3 */}
                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                        3
                      </span>
                      <h5 className="font-bold text-slate-900 text-xs">
                        Cài Đặt Driver Node.js 'oracledb' Cho Backend
                      </h5>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      Trên server Node.js chạy ứng dụng, cài đặt thư viện chính thức từ Oracle:
                    </p>
                    <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg">
                      npm install oracledb dotenv
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Từ Oracle 19c/21c/23c, thư viện chạy chế độ <strong>Thin mode</strong> hoàn toàn không cần cài đặt thêm Oracle Instant Client cồng kềnh.
                    </p>
                  </div>

                  {/* Bước 4 */}
                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
                        4
                      </span>
                      <h5 className="font-bold text-slate-900 text-xs">
                        Cấu Hình Chuỗi Kết Nối Trong File .env
                      </h5>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      Thiết lập các biến môi trường trỏ trực tiếp vào địa chỉ IP của máy chủ Oracle nội bộ:
                    </p>
                    <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg">
                      ORACLE_USER=ttdvth_admin<br/>
                      ORACLE_PASSWORD=MatKhauBaoMat@2026<br/>
                      ORACLE_CONNECT_STRING=192.168.1.100:1521/XEPDB1
                    </div>
                  </div>

                </div>

                {/* Bước 5: Sao lưu & Dự phòng */}
                <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0">
                      5
                    </span>
                    <h5 className="font-bold text-slate-900 text-xs">
                      Thiết Lập Sao Lưu Tự Động Định Kỳ (Oracle Data Pump & RMAN)
                    </h5>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Tạo tác vụ tự động sao lưu hàng ngày bằng lệnh <code>expdp</code> (Data Pump) để xuất file <code>.dmp</code> lưu trữ ra ổ cứng ngoài hoặc NAS của cơ quan:
                  </p>
                  <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg">
                    expdp ttdvth_admin/MatKhauBaoMat@2026 schemas=ttdvth_admin directory=DATA_PUMP_DIR dumpfile=backup_ttdvth_%U.dmp logfile=backup.log
                  </div>
                </div>
              </div>

              {/* So sánh đặc tả cấu trúc dữ liệu NoSQL Firestore vs Oracle Database */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="p-3.5 bg-slate-100 border-b border-slate-200 font-bold text-xs text-slate-800">
                  Bảng Đối Chiếu Cấu Trúc Dữ Liệu (Firestore NoSQL $\rightarrow$ Oracle Relational 3NF)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                        <th className="py-2.5 px-3">Thực Thể Nghiệp Vụ</th>
                        <th className="py-2.5 px-3">Cấu Trúc Cũ (Firestore NoSQL)</th>
                        <th className="py-2.5 px-3">Cấu Trúc Mới (Oracle Local 3NF)</th>
                        <th className="py-2.5 px-3">Ưu Điểm Vượt Trội</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-900">Tài khoản & Phân quyền</td>
                        <td className="py-2.5 px-3 font-mono">collection('users')</td>
                        <td className="py-2.5 px-3 font-mono text-red-700 font-bold">TABLE NGUOI_DUNG</td>
                        <td className="py-2.5 px-3">Ràng buộc UNIQUE, mã hóa mật khẩu, kiểm soát vai trò RBAC chặt chẽ</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-900">Phòng ban & Tổ</td>
                        <td className="py-2.5 px-3 font-mono">collection('departments')</td>
                        <td className="py-2.5 px-3 font-mono text-red-700 font-bold">TABLE DM_PHONG_BAN</td>
                        <td className="py-2.5 px-3">Khóa ngoại LEADER_ID liên kết NGUOI_DUNG, phân cấp tổ chức rõ ràng</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-900">Nhiệm vụ & Giao việc</td>
                        <td className="py-2.5 px-3 font-mono">collection('tasks')</td>
                        <td className="py-2.5 px-3 font-mono text-red-700 font-bold">TABLE NHIEM_VU</td>
                        <td className="py-2.5 px-3">Kiểu CLOB chứa văn bản dài, DATE chuẩn, kiểm tra CHECK tiến độ 0-100%</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-900">Cán bộ phối hợp</td>
                        <td className="py-2.5 px-3 font-mono">Array coAssignees[]</td>
                        <td className="py-2.5 px-3 font-mono text-red-700 font-bold">TABLE NHIEM_VU_PHOI_HOP</td>
                        <td className="py-2.5 px-3">Chuẩn hóa quan hệ nhiều-nhiều (N-N), dễ dàng thống kê và truy vấn báo cáo</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-900">Nhật ký tiến độ</td>
                        <td className="py-2.5 px-3 font-mono">Array progressLogs[]</td>
                        <td className="py-2.5 px-3 font-mono text-red-700 font-bold">TABLE NHAT_KY_TIEN_DO</td>
                        <td className="py-2.5 px-3">Lưu vết lịch sử vĩnh viễn theo thời gian, chống ghi đè làm mất dữ liệu</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-900">Chỉ đạo của Giám đốc</td>
                        <td className="py-2.5 px-3 font-mono">Array leaderDirectives[]</td>
                        <td className="py-2.5 px-3 font-mono text-red-700 font-bold">TABLE CHI_DAO_LANH_DAO</td>
                        <td className="py-2.5 px-3">Cờ HỎA TỐC, hạn định mới, liên kết trực tiếp tới tài khoản Lãnh đạo ra lệnh</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Code kết nối Node.js Backend */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-emerald-700" />
                    Mẫu Code Kết Nối Node.js Backend ('oracledb' Connection Pool)
                  </h4>
                  <button
                    type="button"
                    onClick={handleCopyNodeCode}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-2xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedNode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedNode ? 'Đã sao chép!' : 'Sao chép code'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto max-h-[300px] leading-relaxed">
                  {ORACLE_NODEJS_INTEGRATION_CODE}
                </pre>
              </div>

            </div>
          )}

          {/* TAB 1: PHÂN TÍCH NỘI DUNG LƯU TRỮ */}
          {activeTab === 'analysis' && (
            <div className="space-y-5">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-blue-950">
                <h3 className="font-bold text-sm mb-1">
                  Mục tiêu thiết kế Database theo Form nghiệp vụ
                </h3>
                <p className="text-xs leading-relaxed text-blue-900">
                  Cơ sở dữ liệu được thiết kế theo mô hình quan hệ (Relational RDBMS - Oracle/PostgreSQL) đảm bảo tính toàn vẹn tham chiếu (Referential Integrity), hỗ trợ kiểm toán vết (Audit Trail) và phân quyền chặt chẽ giữa <strong>Cấp Lãnh đạo</strong> và <strong>Cấp Nhân viên</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Entity 1 */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">1</span>
                    <h4 className="font-bold text-slate-900 text-xs">Người Dùng & Phân Quyền (Bảng NGUOI_DUNG)</h4>
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
                    <h4 className="font-bold text-slate-900 text-xs">Nhiệm Vụ & Phân Công (Bảng NHIEM_VU)</h4>
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
                    <h4 className="font-bold text-slate-900 text-xs">Nhật Ký Báo Cáo Tiến Độ (Bảng NHAT_KY_TIEN_DO)</h4>
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
                    <h4 className="font-bold text-slate-900 text-xs">Chỉ Đạo & Đôn Đốc Của Lãnh Đạo (Bảng CHI_DAO_LANH_DAO)</h4>
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
                      {tbl.columns.length} trường dữ liệu
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                          <th className="py-2 px-3">Tên Cột (Field)</th>
                          <th className="py-2 px-3">Kiểu Dữ Liệu</th>
                          <th className="py-2 px-3">Ràng Buộc (Constraint)</th>
                          <th className="py-2 px-3">Mô Tả Chức Năng</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {tbl.columns.map((col) => (
                          <tr key={col.name} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-mono font-semibold text-slate-800 flex items-center gap-1.5">
                              {col.constraint?.includes('PRIMARY KEY') && <Key className="w-3 h-3 text-amber-500" />}
                              {col.constraint?.includes('FOREIGN KEY') && <Network className="w-3 h-3 text-blue-500" />}
                              <span>{col.name}</span>
                            </td>
                            <td className="py-2 px-3 font-mono text-blue-600">{col.type}</td>
                            <td className="py-2 px-3 font-mono text-2xs text-purple-700 bg-purple-50/50 rounded">
                              {col.constraint || 'NULL'}
                            </td>
                            <td className="py-2 px-3 text-slate-600">{col.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: SƠ ĐỒ QUAN HỆ ERD */}
          {activeTab === 'erd' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto leading-relaxed whitespace-pre">
{`+------------------------------+             +------------------------------+
|       DM_PHONG_BAN           |             |         NGUOI_DUNG           |
+------------------------------+             +------------------------------+
| PK  id                       |             | PK  id                       |
|     code (UNIQUE)            | 1         N |     username (UNIQUE)        |
|     name                     |<------------|     password_hash            |
|     leader_name              |             |     full_name                |
| FK  leader_id --------------->(users.id)   |     role ('LEADER'|'STAFF')  |
+------------------------------+             |     position, unit, email    |
                                             +------------------------------+
                                                            ^
                                                            | 1
                                                            |
                                                            | N (assignee_id / created_by)
                                                            v
+------------------------------+             +------------------------------+
|     NHIEM_VU_PHOI_HOP        |             |           NHIEM_VU           |
+------------------------------+             +------------------------------+
| PK  id                       | 1         N | PK  id                       |
| FK  task_id ----------------->-------------|     code (VD: 'II.1')        |
| FK  user_id ----------------->(users.id)   |     title, requirement       |
+------------------------------+             | FK  assignee_id              |
                                             | FK  created_by_leader_id     |
                                             |     progress, status, deadline|
                                             +------------------------------+
                                                            |
                                                            | 1
                                                            |
                                             +--------------+---------------+
                                             | 1 : N                        | 1 : N
                                             v                              v
                              +------------------------------+ +------------------------------+
                              |      NHAT_KY_TIEN_DO         | |      CHI_DAO_LANH_DAO        |
                              +------------------------------+ +------------------------------+
                              | PK  id                       | | PK  id                       |
                              | FK  task_id                  | | FK  task_id                  |
                              | FK  reporter_id              | | FK  author_id                |
                              |     progress_percent         | |     content                  |
                              |     work_done, difficulties  | |     target_deadline          |
                              |     submitted_at             | |     is_urgent                |
                              +------------------------------+ +------------------------------+`}
              </div>
            </div>
          )}

          {/* TAB 4: MÃ NGUỒN SQL DDL (ANSI / PostgreSQL) */}
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
        <div className="bg-slate-50 px-5 sm:px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-[#003366]" />
            <span>Kịch bản Oracle Database đã chuẩn hóa toàn bộ dữ liệu thực tế tại UBND Phường Hố Nai</span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={handleDownloadOracleFile}
              className="px-3.5 py-1.5 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải Script Oracle (.sql)</span>
            </button>
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
    </div>
  );
};
