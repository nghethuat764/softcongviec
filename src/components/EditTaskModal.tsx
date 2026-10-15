import React, { useState, useEffect } from 'react';
import { Task, SectionType, PriorityLevel, TaskStatus } from '../types';
import { STAFF_MEMBERS } from '../data/staffMembers';
import { 
  X, 
  Edit3, 
  Save, 
  Calendar, 
  User, 
  Users, 
  AlertCircle, 
  DollarSign, 
  Clock, 
  FileText,
  Sliders
} from 'lucide-react';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (updatedTask: Task) => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onSaveTask,
}) => {
  const [code, setCode] = useState('');
  const [section, setSection] = useState<SectionType>('III. TỔ DỊCH VỤ CÔNG ÍCH - XÂY DỰNG');
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [coAssigneesText, setCoAssigneesText] = useState('');
  const [requirement, setRequirement] = useState('');
  const [deadline, setDeadline] = useState('');
  const [budgetInfo, setBudgetInfo] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('normal');
  const [status, setStatus] = useState<TaskStatus>('in_progress');
  const [progress, setProgress] = useState(0);
  const [difficulties, setDifficulties] = useState('');
  const [proposals, setProposals] = useState('');

  useEffect(() => {
    if (task) {
      setCode(task.code || '');
      setSection(task.section || 'III. TỔ DỊCH VỤ CÔNG ÍCH - XÂY DỰNG');
      setCategory(task.category || '');
      setTitle(task.title || '');
      setAssignee(task.assignee || '');
      setCoAssigneesText(task.coAssignees ? task.coAssignees.join(', ') : '');
      setRequirement(task.requirement || '');
      setDeadline(task.deadline || '');
      setBudgetInfo(task.budgetInfo || '');
      setPriority(task.priority || 'normal');
      setStatus(task.status || 'in_progress');
      setProgress(task.progress || 0);
      setDifficulties(task.difficulties || '');
      setProposals(task.proposals || '');
    }
  }, [task]);

  if (!isOpen || !task) return null;

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

    const updatedTask: Task = {
      ...task,
      code: code.trim(),
      section,
      category: category.trim(),
      title: title.trim(),
      assignee,
      coAssignees,
      requirement: requirement.trim(),
      deadline: deadline || undefined,
      budgetInfo: budgetInfo.trim() || undefined,
      priority,
      status,
      progress,
      difficulties: difficulties.trim() || undefined,
      proposals: proposals.trim() || undefined,
      updatedAt: timestamp,
    };

    onSaveTask(updatedTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#153e6b] px-6 py-4 text-white flex items-center justify-between border-b border-[#0f2f52] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Chỉnh Sửa Thông Tin Nhiệm Vụ & Phân Công
              </h2>
              <p className="text-xs text-blue-200 font-medium">
                Mã nhiệm vụ: <span className="font-mono font-bold text-white">{task.code}</span>
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã nhiệm vụ:
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tổ / Bộ phận chuyên môn phụ trách:
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value as SectionType)}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              >
                <option value="II. TỔ HÀNH CHÍNH - KẾ TOÁN">II. TỔ HÀNH CHÍNH - KẾ TOÁN</option>
                <option value="III. TỔ DỊCH VỤ CÔNG ÍCH - XÂY DỰNG">III. TỔ DỊCH VỤ CÔNG ÍCH - XÂY DỰNG</option>
                <option value="IV. TỔ VĂN HÓA - THỂ THAO - THÔNG TIN - TUYÊN TRUYỀN">IV. TỔ VĂN HÓA - THỂ THAO - THÔNG TIN - TUYÊN TRUYỀN</option>
                <option value="V. TRẠM TRUYỀN THANH">V. TRẠM TRUYỀN THANH</option>
                <option value="VI. KHU THỂ THAO">VI. KHU THỂ THAO</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tiêu đề nhiệm vụ:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Kiểm tra, xử lý thoát nước tuyến đường số 4..."
              className="w-full p-2 text-xs border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chỉ đạo giao việc cụ thể của Lãnh đạo (Yêu cầu nội dung):
            </label>
            <textarea
              required
              rows={3}
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Cán bộ chủ trì thực hiện:
              </label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-medium"
              >
                {STAFF_MEMBERS.map((s) => (
                  <option key={s.id} value={s.shortName}>
                    {s.name} ({s.shortName}) - {s.role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                Cán bộ phối hợp (cách nhau dấu phẩy):
              </label>
              <input
                type="text"
                value={coAssigneesText}
                onChange={(e) => setCoAssigneesText(e.target.value)}
                placeholder="VD: Đ/c Đạt, Đ/c Trổi..."
                className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Status & Progress Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Trạng thái tiến độ:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              >
                <option value="in_progress">Đang thực hiện</option>
                <option value="completed">Đã hoàn thành</option>
                <option value="delayed">Chậm tiến độ / Vướng mắc</option>
                <option value="paused">Tạm dừng / Chờ duyệt</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Tiến độ hoàn thành:</span>
                <span className="font-mono font-bold text-blue-700">{progress}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer mt-1"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mức độ ưu tiên:
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-medium"
              >
                <option value="normal">Bình thường</option>
                <option value="high">Cao / Trọng tâm</option>
                <option value="urgent">Khẩn cấp / Đôn đốc</option>
              </select>
            </div>
          </div>

          {/* Deadline & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Thời hạn hoàn thành (Deadline):
              </label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="VD: 30/10/2026 hoặc Thường xuyên"
                className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                Kinh phí / Dự toán (nếu có):
              </label>
              <input
                type="text"
                value={budgetInfo}
                onChange={(e) => setBudgetInfo(e.target.value)}
                placeholder="VD: 15.000.000 VNĐ, Chờ HĐND phê duyệt..."
                className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Difficulties & Proposals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-rose-800 mb-1">
                Khó khăn, vướng mắc:
              </label>
              <textarea
                rows={2}
                value={difficulties}
                onChange={(e) => setDifficulties(e.target.value)}
                placeholder="Khó khăn về thời tiết, thủ tục, nguồn vốn..."
                className="w-full p-2 text-xs border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none bg-rose-50/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-800 mb-1">
                Kiến nghị, đề xuất giải pháp:
              </label>
              <textarea
                rows={2}
                value={proposals}
                onChange={(e) => setProposals(e.target.value)}
                placeholder="Đề xuất xin ý kiến Giám đốc, bổ sung nhân lực..."
                className="w-full p-2 text-xs border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-amber-50/30"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Cập Nhật Vào Database</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
