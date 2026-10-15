import React, { useState } from 'react';
import { Task, SectionType, PriorityLevel, TaskStatus } from '../types';
import { X, PlusCircle, User, Calendar, DollarSign, FileText, ShieldCheck, Lock } from 'lucide-react';
import { STAFF_MEMBERS } from '../data/staffMembers';
import { useAuth } from '../context/AuthContext';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (newTask: Task) => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
}) => {
  const { currentUser, isLeader } = useAuth();

  const [code, setCode] = useState(`PS-${Math.floor(Math.random() * 900 + 100)}`);
  const [section, setSection] = useState<SectionType>('III. TỔ DỊCH VỤ CÔNG ÍCH - XÂY DỰNG');
  const [category, setCategory] = useState('Nhiệm vụ phát sinh');
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState(
    isLeader ? 'Đ/c Cường' : (currentUser?.shortName || 'Đ/c Cường')
  );
  const [coAssigneesText, setCoAssigneesText] = useState('');
  const [requirement, setRequirement] = useState('');
  const [deadline, setDeadline] = useState('');
  const [budgetInfo, setBudgetInfo] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('normal');
  const [initialProgress, setInitialProgress] = useState(0);

  if (!isOpen) return null;

  if (!isLeader) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 text-center animate-in fade-in zoom-in-95 duration-150">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Giới Hạn Phân Quyền</h3>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Chức năng giao việc mới chỉ được phân quyền dành riêng cho <strong>Cấp Lãnh Đạo (Ban Giám Đốc)</strong>. Vui lòng đăng nhập tài khoản Lãnh đạo để giao nhiệm vụ.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !requirement.trim()) return;

    const timestamp = new Date().toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const coAssignees = coAssigneesText
      ? coAssigneesText.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    const newTask: Task = {
      id: 'task-' + Date.now(),
      code: code.trim(),
      section,
      category: category.trim(),
      title: title.trim(),
      assignee,
      coAssignees,
      requirement: requirement.trim(),
      currentReport: isLeader 
        ? 'Nhiệm vụ mới do Lãnh đạo giao phân công.' 
        : `Nhiệm vụ phát sinh do ${currentUser?.fullName || 'viên chức'} đề xuất.`,
      progress: initialProgress,
      status: initialProgress === 100 ? 'completed' : 'in_progress',
      deadline: deadline || undefined,
      budgetInfo: budgetInfo.trim() || undefined,
      priority,
      progressLogs: [],
      leaderDirectives: [],
      updatedAt: timestamp,
    };

    onAddTask(newTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#153e6b] px-6 py-4 text-white flex items-center justify-between border-b border-[#0f2f52]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
              {isLeader ? <ShieldCheck className="w-5 h-5 text-white" /> : <PlusCircle className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isLeader ? 'Lãnh Đạo Phân Công & Giao Nhiệm Vụ Mới' : 'Đề Xuất Nhiệm Vụ Phát Sinh Ngoài Giao Ban'}
              </h2>
              <p className="text-xs text-blue-200 font-medium">
                {isLeader 
                  ? `Người giao: ${currentUser?.fullName || 'Giám đốc'} (Ban Giám Đốc)` 
                  : `Người đề xuất: ${currentUser?.fullName || 'Nhân viên'} (Chờ phê duyệt)`}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã nhiệm vụ: <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="VD: III.11 hoặc PS-01"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Khối / Tổ công tác: <span className="text-red-500">*</span>
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value as SectionType)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="II. TỔ HÀNH CHÍNH - KẾ TOÁN">II. TỔ HÀNH CHÍNH - KẾ TOÁN</option>
                <option value="III. TỔ DỊCH VỤ CÔNG ÍCH - XÂY DỰNG">III. TỔ DỊCH VỤ CÔNG ÍCH - XÂY DỰNG</option>
                <option value="IV. CÁC DỰ ÁN ĐẦU TƯ CÔNG TRUNG HẠN">IV. CÁC DỰ ÁN ĐẦU TƯ CÔNG TRUNG HẠN</option>
                <option value="V. CÁC DỰ ÁN ĐẦU TƯ NGÂN SÁCH CHI THƯỜNG XUYÊN">V. CÁC DỰ ÁN ĐẦU TƯ NGÂN SÁCH CHI THƯỜNG XUYÊN</option>
                <option value="VI. TỔ VĂN HÓA - THỂ THAO - THÔNG TIN - TUYÊN TRUYỀN">VI. TỔ VĂN HÓA - THỂ THAO - THÔNG TIN - TUYÊN TRUYỀN</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên nhiệm vụ / Công trình / Hạng mục: <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Khảo sát sửa chữa cống thoát nước ngõ 15 đường Chu Văn An..."
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cán bộ phụ trách chính (Người nhận việc): <span className="text-red-500">*</span>
              </label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {STAFF_MEMBERS.filter((m) => m.id !== 'phong').map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.shortName} ({m.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cán bộ phối hợp (nếu có, cách nhau dấu phẩy):
              </label>
              <input
                type="text"
                value={coAssigneesText}
                onChange={(e) => setCoAssigneesText(e.target.value)}
                placeholder="VD: Đ/c Thiện, Đ/c Trổi"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isLeader ? 'Yêu cầu kết luận / Nội dung chỉ đạo của Lãnh đạo:' : 'Nội dung công việc đề xuất triển khai:'} <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              placeholder="Ghi rõ nội dung chỉ đạo, chất lượng công việc cần đạt, trách nhiệm bàn giao..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thời hạn hoàn thành:
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mức độ ưu tiên:
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="normal">Bình thường</option>
                <option value="high">Ưu tiên cao</option>
                <option value="urgent">Hỏa tốc / Khẩn cấp</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kinh phí / Dự toán:
              </label>
              <input
                type="text"
                value={budgetInfo}
                onChange={(e) => setBudgetInfo(e.target.value)}
                placeholder="VD: 50 triệu đồng"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow transition-colors cursor-pointer ${
                isLeader ? 'bg-red-700 hover:bg-red-800' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{isLeader ? 'Phân Công Nhiệm Vụ' : 'Gửi Đề Xuất Nhiệm Vụ'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
