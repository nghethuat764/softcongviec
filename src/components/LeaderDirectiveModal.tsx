import React, { useState } from 'react';
import { Task, Directive } from '../types';
import { useAuth } from '../context/AuthContext';
import { X, Send, AlertTriangle, Clock, ShieldCheck, User } from 'lucide-react';

interface LeaderDirectiveModalProps {
  task: Task | null;
  onClose: () => void;
  onSubmitDirective: (taskId: string, directive: Directive, updatedDeadline?: string) => void;
}

export const LeaderDirectiveModal: React.FC<LeaderDirectiveModalProps> = ({
  task,
  onClose,
  onSubmitDirective,
}) => {
  if (!task) return null;

  const { currentUser } = useAuth();
  const [content, setContent] = useState('');
  const [newDeadline, setNewDeadline] = useState(task.deadline || '');
  const [isUrgent, setIsUrgent] = useState(task.priority === 'urgent');
  const [quickTemplate, setQuickTemplate] = useState('');

  const templates = [
    'Yêu cầu đồng chí đẩy nhanh tiến độ, tập trung nhân lực hoàn thành đúng hạn.',
    'Báo cáo giải trình rõ nguyên nhân vướng mắc và đề xuất hướng xử lý trước 17h00 ngày mai.',
    'Chủ động phối hợp chặt chẽ với các phòng ban chuyên môn của UBND phường để tháo gỡ thủ tục.',
    'Tạm dừng các khâu ngoài trời do thời tiết mưa lớn, khi thời tiết thuận lợi phải thi công bù ngay.',
    'Phối hợp với đơn vị tư vấn hoàn thiện phương án chi tiết để báo cáo Thường trực UBND phường.',
  ];

  const handleApplyTemplate = (tpl: string) => {
    setQuickTemplate(tpl);
    setContent(tpl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const authorName = currentUser 
      ? `${currentUser.fullName} - ${currentUser.position || (currentUser.isLeader ? 'Ban Giám Đốc' : 'Lãnh đạo')}`
      : 'Phạm Thanh Phong - Giám đốc Trung tâm';

    const newDirective: Directive = {
      id: 'dir-' + Date.now(),
      timestamp: new Date().toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      author: authorName,
      content: content.trim(),
      targetDeadline: newDeadline || undefined,
      isUrgent: isUrgent,
    };

    onSubmitDirective(task.id, newDirective, newDeadline);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-[#003366] px-6 py-4 text-white flex items-center justify-between border-b border-[#002244]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Chỉ Đạo & Đôn Đốc Của Giám Đốc</h2>
              <p className="text-xs text-blue-200 font-medium">Ý kiến chỉ đạo trực tiếp - Lưu vết lịch sử điều hành</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Context Card */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <span className="font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              {task.code}
            </span>
            <span className="text-slate-500 font-medium">
              {task.section}
            </span>
          </div>
          <h3 className="font-semibold text-slate-900 text-sm mb-2">{task.title}</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 bg-white p-2.5 rounded border border-slate-200">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Phụ trách: <strong>{task.assignee}</strong></span>
              {task.coAssignees && task.coAssignees.length > 0 && (
                <span className="text-slate-500">(Phối hợp: {task.coAssignees.join(', ')})</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Hạn hiện tại: <strong>{task.deadline || 'Theo tiến độ'}</strong> · Tiến độ: <strong>{task.progress}%</strong></span>
            </div>
          </div>

          {task.difficulties && (
            <div className="mt-2 text-rose-700 bg-rose-50 border border-rose-200 p-2 rounded text-xs flex items-start gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Khó khăn/vướng mắc do nhân viên báo cáo: </strong>
                {task.difficulties}
              </div>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Quick Directive Templates */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mẫu chỉ đạo nhanh (nhấn để chọn):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {templates.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className={`text-xs px-2.5 py-1 rounded border text-left transition-colors cursor-pointer ${
                    quickTemplate === tpl
                      ? 'bg-blue-50 border-blue-400 text-blue-700 font-medium'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  {tpl.length > 45 ? tpl.substring(0, 45) + '...' : tpl}
                </button>
              ))}
            </div>
          </div>

          {/* Directive Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Nội dung kết luận / Ý kiến chỉ đạo đôn đốc <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập ý kiến chỉ đạo, đôn đốc cụ thể của Giám đốc đối với cán bộ phụ trách..."
              className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
            />
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Điều chỉnh / ấn định thời hạn chót mới (nếu có):
              </label>
              <input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <span className="text-red-700 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Đóng dấu HỎA TỐC / Khẩn cấp cần giải quyết ngay
                </span>
              </label>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-[6px] border border-slate-300 hover:border-slate-400 text-slate-700 hover:bg-slate-100 text-xs font-medium transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] shadow-2xs hover:shadow-xs cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="group px-4 py-1.5 rounded-[6px] bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:shadow-md hover:shadow-red-700/25 transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
              <span>Phát Lệnh Chỉ Đạo Đôn Đốc</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
