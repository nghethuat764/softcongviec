import React, { useState, useEffect } from 'react';
import { Task, SectionType, PriorityLevel, TaskStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { useDepartments } from '../context/DepartmentContext';
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
  const { users } = useAuth();
  const { departments } = useDepartments();
  const [code, setCode] = useState('');
  const [section, setSection] = useState<SectionType>('III. TỔ DỊCH VỤ CÔNG ÍCH - XÂY DỰNG');
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
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
      const matched = users.find(
        (u) => u.id === task.assigneeId || u.shortName === task.assignee || u.fullName === task.assignee
      );
      setSelectedUserId(matched?.id || '');
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
  }, [task, users]);

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

    const matchedAssignee = users.find((u) => u.shortName === assignee || u.fullName === assignee);
    const coAssigneeIds = coAssignees && coAssignees.length > 0
      ? users.filter((u) => coAssignees.some((co) => co.toLowerCase().includes((u.shortName || '').toLowerCase()) || co.toLowerCase().includes(u.fullName.toLowerCase()))).map((u) => u.id)
      : undefined;

    const updatedTask: Task = {
      ...task,
      code: code.trim(),
      section,
      category: category.trim(),
      title: title.trim(),
      assignee,
      assigneeId: matchedAssignee?.id || task.assigneeId,
      coAssignees,
      coAssigneeIds,
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Tổ / Bộ phận chuyên môn phụ trách:
                </label>
                <span className="text-[11px] text-[#003366] bg-blue-50 px-1.5 py-0.2 rounded font-mono font-medium border border-blue-200">
                  CSDL phòng ban ({departments.length})
                </span>
              </div>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value as SectionType)}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-medium cursor-pointer"
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.code ? `[${dept.code}] ` : ''}{dept.name}
                  </option>
                ))}
                {section && !departments.some((d) => d.name === section) && (
                  <option value={section}>{section}</option>
                )}
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  Cán bộ chủ trì thực hiện:
                </label>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-mono font-medium border border-emerald-200">
                  CSDL ({users.length} cán bộ)
                </span>
              </div>
              <select
                value={selectedUserId}
                onChange={(e) => {
                  const uId = e.target.value;
                  setSelectedUserId(uId);
                  const picked = users.find((u) => u.id === uId);
                  if (picked) {
                    setAssignee(picked.shortName || picked.fullName);
                    // Tự động gợi ý phòng ban tương ứng
                    if (picked.unit) {
                      const matchedDept = departments.find((d) => 
                        d.name.toLowerCase() === picked.unit.toLowerCase() ||
                        d.code.toLowerCase() === picked.unit.toLowerCase() ||
                        d.name.toLowerCase().includes(picked.unit.toLowerCase()) ||
                        picked.unit.toLowerCase().includes(d.name.toLowerCase())
                      );
                      if (matchedDept) {
                        setSection(matchedDept.name);
                      }
                    }
                  }
                }}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-medium cursor-pointer"
              >
                <optgroup label={`── Cán bộ / Viên chức chuyên môn (${users.filter(u => !u.isLeader).length}) ──`}>
                  {users.filter(u => !u.isLeader).map((u) => {
                    const text = `${u.fullName} (${u.shortName || u.username}) - ${u.unit || u.position || 'Viên chức'}`;
                    return (
                      <option key={u.id} value={u.id}>
                        {text}
                      </option>
                    );
                  })}
                </optgroup>
                <optgroup label={`── Ban Giám Đốc / Lãnh đạo (${users.filter(u => u.isLeader).length}) ──`}>
                  {users.filter(u => u.isLeader).map((u) => {
                    const text = `${u.fullName} (${u.shortName || u.username}) - ${u.position || 'Lãnh đạo'}`;
                    return (
                      <option key={u.id} value={u.id}>
                        {text}
                      </option>
                    );
                  })}
                </optgroup>
                {selectedUserId && !users.some((u) => u.id === selectedUserId) && (
                  <option value={selectedUserId}>{assignee || selectedUserId}</option>
                )}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  Cán bộ phối hợp:
                </label>
                <span className="text-[10px] text-slate-500 font-normal">
                  (Bấm tên để chọn nhanh)
                </span>
              </div>
              <input
                type="text"
                value={coAssigneesText}
                onChange={(e) => setCoAssigneesText(e.target.value)}
                placeholder="VD: Đ/c Đạt, Đ/c Trổi..."
                className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              {/* Quick User Chips */}
              <div className="flex flex-wrap gap-1 mt-1.5 max-h-16 overflow-y-auto pt-0.5">
                {users.filter(u => (u.shortName || u.fullName) !== assignee).map((u) => {
                  const name = u.shortName || u.fullName;
                  const isPicked = (coAssigneesText || '')
                    .split(',')
                    .map((s) => s.trim().toLowerCase())
                    .includes(name.toLowerCase());
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        const currentList = coAssigneesText
                          ? coAssigneesText.split(',').map((s) => s.trim()).filter(Boolean)
                          : [];
                        if (isPicked) {
                          setCoAssigneesText(
                            currentList.filter((s) => s.toLowerCase() !== name.toLowerCase()).join(', ')
                          );
                        } else {
                          setCoAssigneesText([...currentList, name].join(', '));
                        }
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium border transition-colors cursor-pointer ${
                        isPicked
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {isPicked ? '✓ ' : '+ '}{name}
                    </button>
                  );
                })}
              </div>
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
