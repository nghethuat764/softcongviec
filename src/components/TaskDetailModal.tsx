import React, { useState } from 'react';
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
  Paperclip,
  Eye,
  Download,
  Upload,
  PlusCircle
} from 'lucide-react';
import { getStatusBadgeClasses, getStatusLabel, getPriorityLabel, formatDateDisplay } from '../utils/helpers';
import { DocumentViewerModal } from './DocumentViewerModal';
import { downloadAttachmentFile } from '../utils/documentDownload';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onOpenReportForm: (task: Task) => void;
  onOpenDirectiveModal: (task: Task) => void;
  onOpenEditModal?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onUpdateTask?: (task: Task) => void;
  onViewDocument?: (docName: string, task: Task) => void;
  currentRole: 'leader' | 'staff';
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onOpenReportForm,
  onOpenDirectiveModal,
  onOpenEditModal,
  onDeleteTask,
  onUpdateTask,
  onViewDocument,
  currentRole,
}) => {
  const [viewingDocName, setViewingDocName] = useState<string | null>(null);
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [newDocText, setNewDocText] = useState('');

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
        <div className="bg-[#153e6b] px-6 py-4 text-white flex items-center justify-between border-b border-[#0f2f52] shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold bg-white/15 px-2.5 py-1 rounded text-white">
              {task.code}
            </span>
            <div>
              <span className="text-xs text-blue-200 block font-medium">{task.section}</span>
              <h2 className="text-base font-bold text-white leading-tight">{task.title}</h2>
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

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          
          {/* Status & KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
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
              <span className="text-slate-500 block text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#003366]" />
                Ngày phân công
              </span>
              <div className="mt-1 font-mono font-bold text-slate-800 text-xs">
                {formatDateDisplay(task.assignedDate || task.startDate)}
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-xs flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                Hạn hoàn thành
              </span>
              <div className="flex items-center gap-1.5 mt-1 font-mono font-medium text-slate-800 text-xs">
                <span>{task.deadline ? formatDateDisplay(task.deadline) : 'Theo tiến độ'}</span>
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
          <div className="grid grid-cols-1 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            {task.budgetInfo && (
              <div className="pb-3 border-b border-slate-200">
                <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  Kinh phí / Dự toán:
                </span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">{task.budgetInfo}</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-700 font-bold flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-blue-600" />
                  <span>Hồ Sơ & File Đính Kèm Căn Cứ:</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-3xs font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                    {task.relatedDocs ? task.relatedDocs.length : 0} tệp đính kèm
                  </span>
                  {currentRole === 'leader' && onUpdateTask && !isAddingDoc && (
                    <button
                      type="button"
                      onClick={() => setIsAddingDoc(true)}
                      className="text-3xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5 cursor-pointer ml-1"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>Thêm tệp</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Document List */}
              {task.relatedDocs && task.relatedDocs.length > 0 ? (
                <div className="space-y-2">
                  {task.relatedDocs.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-white rounded-lg border border-slate-200 hover:border-blue-300 shadow-2xs transition-all"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-slate-800 text-xs block truncate" title={doc}>
                            {doc}
                          </span>
                          <span className="text-3xs text-slate-400">Văn bản căn cứ công vụ hợp lệ</span>
                        </div>
                      </div>

                      {/* Action buttons: Xem Trực Tiếp & Tải File */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => {
                            if (onViewDocument) {
                              onViewDocument(doc, task);
                            } else {
                              setViewingDocName(doc);
                            }
                          }}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-lg text-2xs font-semibold flex items-center gap-1 border border-blue-200 transition-colors cursor-pointer"
                          title="Xem trực tiếp văn bản này trên hệ thống"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Xem trực tiếp</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadAttachmentFile(doc, task)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-2xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                          title="Tải văn bản này về máy tính"
                        >
                          <Download className="w-3 h-3" />
                          <span>Tải file</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-2xs text-slate-500 italic bg-white p-3 rounded-lg border border-dashed border-slate-200">
                  Chưa có tài liệu đính kèm. Lãnh đạo hoặc cán bộ có thể bổ sung hồ sơ nghiệm thu, quyết định.
                </div>
              )}

              {/* Add new attachment form if leader requested */}
              {isAddingDoc && (
                <div className="mt-2 p-2.5 bg-blue-50/70 rounded-lg border border-blue-200 space-y-2">
                  <span className="text-2xs font-bold text-blue-900 block">Lãnh đạo thêm hồ sơ / file đính kèm mới:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newDocText}
                      onChange={(e) => setNewDocText(e.target.value)}
                      placeholder="Nhập tên tài liệu (VD: Biên bản nghiệm thu đợt 2, Quyết định bổ sung...)"
                      className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <label className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-2xs font-semibold flex items-center gap-1 cursor-pointer">
                      <Upload className="w-3 h-3 text-slate-500" />
                      <span>Chọn tệp</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setNewDocText(`${file.name} (${Math.round(file.size / 1024)} KB)`);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingDoc(false);
                        setNewDocText('');
                      }}
                      className="px-2.5 py-1 text-2xs text-slate-600 hover:text-slate-800"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      disabled={!newDocText.trim()}
                      onClick={() => {
                        if (newDocText.trim() && onUpdateTask) {
                          const prevDocs = task.relatedDocs || [];
                          const updatedDocs = [...prevDocs, newDocText.trim()];
                          onUpdateTask({ ...task, relatedDocs: updatedDocs });
                          setNewDocText('');
                          setIsAddingDoc(false);
                        }
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-2xs font-bold cursor-pointer"
                    >
                      Lưu đính kèm
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

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
        <div className="bg-slate-50/90 px-4 sm:px-6 py-2.5 sm:py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span>Cập nhật: <span className="font-mono text-slate-700 font-medium">{task.updatedAt}</span></span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
            {currentRole === 'leader' && (
              <>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="group relative h-8 px-2.5 rounded-[6px] text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-xs font-medium inline-flex items-center gap-1.5 transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] shadow-2xs hover:shadow-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-400/50 cursor-pointer whitespace-nowrap"
                  title="Xóa nhiệm vụ này khỏi hệ thống"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-200 shrink-0" />
                  <span>Xóa</span>
                </button>
                {onOpenEditModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenEditModal(task);
                    }}
                    className="group relative h-8 px-2.5 rounded-[6px] text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-xs font-medium inline-flex items-center gap-1.5 transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] shadow-2xs hover:shadow-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400/50 cursor-pointer whitespace-nowrap"
                    title="Chỉnh sửa thông tin nhiệm vụ"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-700 group-hover:rotate-12 transition-transform duration-200 shrink-0" />
                    <span>Sửa</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDirectiveModal(task);
                  }}
                  className="group relative h-8 px-3 rounded-[6px] bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white text-xs font-medium inline-flex items-center gap-1.5 shadow-xs hover:shadow-md hover:shadow-red-700/25 transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1 cursor-pointer whitespace-nowrap"
                  title="Ban hành văn bản hoặc ý kiến chỉ đạo đôn đốc"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-red-100 group-hover:scale-110 transition-transform duration-200 shrink-0" />
                  <span>Chỉ đạo</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenReportForm(task);
              }}
              className="group relative h-8 px-3.5 rounded-[6px] bg-gradient-to-r from-[#003366] to-[#004080] hover:from-[#00274f] hover:to-[#003366] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs hover:shadow-md hover:shadow-blue-900/25 transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-1 cursor-pointer whitespace-nowrap"
              title="Cập nhật báo cáo tiến độ công việc mới nhất"
            >
              <Send className="w-3.5 h-3.5 text-blue-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200 shrink-0" />
              <span>Báo cáo tiến độ</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="h-8 px-3 rounded-[6px] bg-white hover:bg-slate-100 border border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-800 text-xs font-medium transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] shadow-2xs hover:shadow-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400/50 cursor-pointer whitespace-nowrap"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>

      {/* Direct In-App Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={!!viewingDocName}
        onClose={() => setViewingDocName(null)}
        docName={viewingDocName}
        task={task}
        allDocs={task.relatedDocs || []}
        onSelectDoc={(d) => setViewingDocName(d)}
      />
    </div>
  );
};
