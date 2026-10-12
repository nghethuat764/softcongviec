import React from 'react';
import { Task } from '../types';
import { 
  X, 
  Calendar, 
  User, 
  Users, 
  FileText, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MessageSquare,
  ShieldCheck,
  Send,
  Building,
  Trash2,
  Edit3,
  Paperclip
} from 'lucide-react';
import { getStatusBadgeClasses, getStatusLabel, getPriorityLabel } from '../utils/helpers';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onOpenReportForm: (task: Task) => void;
  onOpenDirectiveModal: (task: Task) => void;
  onOpenEditModal?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  currentRole: 'leader' | 'staff';
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onOpenReportForm,
  onOpenDirectiveModal,
  onOpenEditModal,
  onDeleteTask,
  currentRole,
}) => {
  if (!task) return null;

  const handleDelete = () => {
    if (window.confirm(`LÃNH ĐẠO XÁC NHẬN: Bạn có chắc chắn muốn xóa nhiệm vụ [${task.code}] ${task.title}?`)) {
      if (onDeleteTask) {
        onDeleteTask(task.id);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold bg-red-700 px-2.5 py-1 rounded text-white shadow-xs">
              {task.code}
            </span>
            <div>
              <span className="text-xs text-slate-400 block">{task.section}</span>
              <h2 className="text-base font-bold text-white leading-tight">{task.title}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          
          {/* Status & KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 block text-xs">Trạng thái</span>
              <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-xs font-medium ${getStatusBadgeClasses(task.status)}`}>
                {getStatusLabel(task.status)}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-xs">Tiến độ thực hiện</span>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      task.progress === 100 ? 'bg-emerald-600' : 'bg-blue-600'
                    }`}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
                <span className="font-bold text-slate-800 font-mono tabular-nums text-xs">
                  {task.progress}%
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-xs">Hạn hoàn thành</span>
              <div className="flex items-center gap-1.5 mt-1 font-medium text-slate-800">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{task.deadline || 'Theo tiến độ'}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-xs">Mức độ ưu tiên</span>
              <span className={`inline-block mt-1 text-xs font-semibold ${
                task.priority === 'urgent' ? 'text-red-700' : task.priority === 'high' ? 'text-amber-700' : 'text-slate-700'
              }`}>
                {getPriorityLabel(task.priority)}
              </span>
            </div>
          </div>

          {/* Personnel Assigned */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="text-slate-500 block">Cán bộ phụ trách chính:</span>
                <strong className="text-slate-900 text-sm">{task.assignee}</strong>
              </div>
            </div>

            {task.coAssignees && task.coAssignees.length > 0 && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600 shrink-0" />
                <div>
                  <span className="text-slate-500 block">Cán bộ phối hợp:</span>
                  <span className="text-slate-800 font-medium">{task.coAssignees.join(', ')}</span>
                </div>
              </div>
            )}

            {task.leadershipDirector && (
              <div className="flex items-center gap-2 sm:col-span-2 text-amber-800 bg-amber-50/70 p-2 rounded border border-amber-200">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-amber-900">Lãnh đạo phụ trách chỉ đạo:</span>
                  <span className="ml-1 text-amber-800 font-medium">{task.leadershipDirector}</span>
                </div>
              </div>
            )}
          </div>

          {/* Official Requirement from 28/9/2026 Notice */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-red-700" />
              Nội dung chỉ đạo kết luận cuộc họp giao ban tuần ngày 28/9/2026
            </h3>
            <p className="text-slate-700 leading-relaxed text-xs sm:text-sm bg-white p-3 rounded border border-slate-200">
              {task.requirement}
            </p>
          </div>

          {/* Current Real-world Progress & Details */}
          <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-bold text-blue-900 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
              Tình hình kết quả thực hiện mới nhất
            </h3>
            <p className="text-slate-800 leading-relaxed text-xs sm:text-sm bg-white p-3 rounded border border-blue-200">
              {task.currentReport || 'Đang cập nhật...'}
            </p>
          </div>

          {/* Difficulties & Proposals */}
          {(task.difficulties || task.proposals) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {task.difficulties && (
                <div className="bg-rose-50/70 p-3.5 rounded-lg border border-rose-200 text-xs">
                  <h4 className="font-bold text-rose-800 mb-1 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    Khó khăn, vướng mắc phát sinh
                  </h4>
                  <p className="text-rose-900 leading-relaxed">{task.difficulties}</p>
                </div>
              )}

              {task.proposals && (
                <div className="bg-amber-50/70 p-3.5 rounded-lg border border-amber-200 text-xs">
                  <h4 className="font-bold text-amber-800 mb-1 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                    Đề xuất, kiến nghị với Lãnh đạo
                  </h4>
                  <p className="text-amber-900 leading-relaxed">{task.proposals}</p>
                </div>
              )}
            </div>
          )}

          {/* Budget & Related Docs */}
          {(task.budgetInfo || (task.relatedDocs && task.relatedDocs.length > 0)) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
              {task.budgetInfo && (
                <div>
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    Kinh phí / Dự toán:
                  </span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{task.budgetInfo}</span>
                </div>
              )}

              {task.relatedDocs && task.relatedDocs.length > 0 && (
                <div>
                  <span className="text-slate-500 font-medium flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                      Văn bản căn cứ / Hồ sơ đính kèm:
                    </span>
                    <span className="text-3xs font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                      {task.relatedDocs.length} tệp
                    </span>
                  </span>
                  <div className="mt-1.5 space-y-1">
                    {task.relatedDocs.map((doc, idx) => (
                      <span key={idx} className="flex items-center gap-1.5 text-slate-800 bg-white px-2.5 py-1 rounded-md border border-slate-200 text-xs shadow-2xs font-medium">
                        <FileText className="w-3 h-3 text-blue-600 shrink-0" />
                        <span className="truncate">{doc}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History of Leader Directives */}
          <div>
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-red-700" />
              Lịch sử ý kiến chỉ đạo / đôn đốc của Giám đốc ({task.leaderDirectives.length})
            </h3>
            {task.leaderDirectives.length === 0 ? (
              <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded border border-slate-200">
                Chưa có chỉ đạo bổ sung. Nhiệm vụ thực hiện theo đúng kết luận giao ban tuần.
              </p>
            ) : (
              <div className="space-y-2">
                {task.leaderDirectives.map((d) => (
                  <div
                    key={d.id}
                    className={`p-3 rounded-lg border text-xs ${
                      d.isUrgent
                        ? 'bg-red-50 border-red-300 text-red-950'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold mb-1">
                      <span className="text-red-700 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {d.author}
                      </span>
                      <span className="text-slate-500 font-mono text-2xs">{d.timestamp}</span>
                    </div>
                    <p className="leading-relaxed">{d.content}</p>
                    {d.targetDeadline && (
                      <div className="mt-1.5 text-2xs font-semibold text-red-700">
                        Mốc hạn định yêu cầu: {d.targetDeadline}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* History of Staff Progress Reports */}
          <div>
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" />
              Nhật ký báo cáo tiến độ của cán bộ ({task.progressLogs.length})
            </h3>
            {task.progressLogs.length === 0 ? (
              <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded border border-slate-200">
                Chưa có nhật ký ghi nhận thêm ngoài báo cáo tại cuộc họp giao ban.
              </p>
            ) : (
              <div className="space-y-2">
                {task.progressLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-blue-800">
                        {log.reporter} · Tiến độ: {log.progressPercent}%
                      </span>
                      <span className="text-slate-400 font-mono text-2xs">{log.timestamp}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{log.workDone}</p>
                    {log.difficulties && (
                      <div className="mt-1 text-rose-700 font-medium">
                        Vướng mắc: {log.difficulties}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="text-xs text-slate-500">
            Cập nhật lần cuối: <span className="font-mono">{task.updatedAt}</span>
          </div>

          <div className="flex items-center gap-2">
            {currentRole === 'leader' && (
              <>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 border border-rose-200 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Nhiệm Vụ</span>
                </button>
                {onOpenEditModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenEditModal(task);
                    }}
                    className="px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold flex items-center gap-1.5 border border-amber-200 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                    <span>Sửa Thông Tin</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDirectiveModal(task);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Chỉ Đạo / Đôn Đốc</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenReportForm(task);
              }}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Cập Nhật Báo Cáo Tiến Độ</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
