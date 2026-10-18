import React, { useState, useEffect } from 'react';
import { Task, SectionType, PriorityLevel, TaskStatus } from '../types';
import { X, PlusCircle, User, Calendar, DollarSign, FileText, ShieldCheck, Lock, Building2, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDepartments } from '../context/DepartmentContext';

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
  const { currentUser, isLeader, users } = useAuth();
  const { departments } = useDepartments();

  const [code, setCode] = useState(`PS-${Math.floor(Math.random() * 900 + 100)}`);
  const [section, setSection] = useState<SectionType>('III. TỔ DỊCH VỤ CÔNG ÍCH - XÂY DỰNG');
  const [category, setCategory] = useState('Nhiệm vụ phát sinh');
  const [title, setTitle] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [assignee, setAssignee] = useState('');
  const [coAssigneesText, setCoAssigneesText] = useState('');
  const [requirement, setRequirement] = useState('');
  const [deadline, setDeadline] = useState('');
  const [budgetInfo, setBudgetInfo] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('normal');
  const [initialProgress, setInitialProgress] = useState(0);

  // Sync default assignee and section from live Firestore database
  useEffect(() => {
    if (isOpen) {
      // Find matching user from users list
      const matchedUser = users.find(
        (u) => u.id === selectedUserId || u.shortName === assignee || u.fullName === assignee
      );

      if (matchedUser) {
        setSelectedUserId(matchedUser.id);
        setAssignee(matchedUser.shortName || matchedUser.fullName);
        if (matchedUser.unit) {
          const matchedDept = departments.find(
            (d) =>
              d.name.toLowerCase() === matchedUser.unit.toLowerCase() ||
              d.code.toLowerCase() === matchedUser.unit.toLowerCase() ||
              d.name.toLowerCase().includes(matchedUser.unit.toLowerCase()) ||
              matchedUser.unit.toLowerCase().includes(d.name.toLowerCase())
          );
          if (matchedDept) {
            setSection(matchedDept.name);
          }
        }
      } else if (users.length > 0) {
        const defaultStaff = users.find((u) => !u.isLeader) || users[0];
        if (defaultStaff) {
          setSelectedUserId(defaultStaff.id);
          setAssignee(defaultStaff.shortName || defaultStaff.fullName);
          if (defaultStaff.unit) {
            const matchedDept = departments.find(
              (d) =>
                d.name.toLowerCase() === defaultStaff.unit.toLowerCase() ||
                d.code.toLowerCase() === defaultStaff.unit.toLowerCase() ||
                d.name.toLowerCase().includes(defaultStaff.unit.toLowerCase()) ||
                defaultStaff.unit.toLowerCase().includes(d.name.toLowerCase())
            );
            if (matchedDept) {
              setSection(matchedDept.name);
            }
          }
        }
      }

      // If current section is not in departments, default to first department
      if (departments.length > 0 && !departments.some((d) => d.name === section)) {
        const defaultDept = departments.find((d) => d.code === 'DVCI-XD') || departments[0];
        if (defaultDept) {
          setSection(defaultDept.name);
        }
      }
    }
  }, [isOpen, users, departments]);

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

    const matchedAssignee = users.find((u) => u.shortName === assignee || u.fullName === assignee);
    const coAssigneeIds = coAssignees && coAssignees.length > 0
      ? users.filter((u) => coAssignees.some((co) => co.toLowerCase().includes((u.shortName || '').toLowerCase()) || co.toLowerCase().includes(u.fullName.toLowerCase()))).map((u) => u.id)
      : undefined;

    const newTask: Task = {
      id: 'task-' + Date.now(),
      code: code.trim(),
      section,
      category: category.trim(),
      title: title.trim(),
      assignee,
      assigneeId: matchedAssignee?.id,
      coAssignees,
      coAssigneeIds,
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Khối / Tổ công tác: <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-[#003366] bg-blue-50 px-1.5 py-0.2 rounded font-mono font-medium border border-blue-200">
                  CSDL phòng ban ({departments.length})
                </span>
              </div>
              <select
                value={section}
                onChange={(e) => {
                  const newSec = e.target.value as SectionType;
                  setSection(newSec);
                  // Tự động kiểm tra: nếu cán bộ hiện tại không thuộc đơn vị này, gợi ý cán bộ thuộc đơn vị này
                  const currentStaff = users.find(u => u.id === selectedUserId);
                  const isBelong = currentStaff?.unit && (
                    currentStaff.unit.toLowerCase() === newSec.toLowerCase() ||
                    newSec.toLowerCase().includes(currentStaff.unit.toLowerCase()) ||
                    currentStaff.unit.toLowerCase().includes(newSec.toLowerCase())
                  );
                  if (!isBelong) {
                    const deptStaff = users.find(u => !u.isLeader && u.unit && (
                      u.unit.toLowerCase() === newSec.toLowerCase() ||
                      newSec.toLowerCase().includes(u.unit.toLowerCase()) ||
                      u.unit.toLowerCase().includes(newSec.toLowerCase())
                    ));
                    if (deptStaff) {
                      setSelectedUserId(deptStaff.id);
                      setAssignee(deptStaff.shortName || deptStaff.fullName);
                    }
                  }
                }}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white"
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Cán bộ phụ trách chính (Người nhận việc): <span className="text-red-500">*</span>
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
                    // Tự động gợi ý / đồng bộ phòng ban tương ứng của cán bộ
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
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white font-medium"
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
                <label className="block text-xs font-semibold text-slate-700">
                  Cán bộ phối hợp (nếu có):
                </label>
                <span className="text-[10px] text-slate-500 font-normal">
                  (Bấm tên để chọn nhanh)
                </span>
              </div>
              <input
                type="text"
                value={coAssigneesText}
                onChange={(e) => setCoAssigneesText(e.target.value)}
                placeholder="VD: Đ/c Thiện, Đ/c Trổi"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          ? 'bg-blue-600 text-white border-blue-600'
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
