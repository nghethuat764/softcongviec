import React, { useState } from 'react';
import { Task, Directive } from '../types';
import { useAuth } from '../context/AuthContext';
import { X, Send, AlertTriangle, Clock, ShieldCheck, User, Sparkles, RefreshCw, CheckCircle2, Info, FileText } from 'lucide-react';
import { fetchAiDirectiveSuggestions, AiDirectiveSuggestion, AiDirectiveResponse } from '../services/aiDirectiveService';

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

  // AI State
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiData, setAiData] = useState<AiDirectiveResponse | null>(null);
  const [selectedAiIndex, setSelectedAiIndex] = useState<number | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showAiPanel, setShowAiPanel] = useState(false);

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

  const handleFetchAiSuggestions = async () => {
    setIsLoadingAi(true);
    setAiError(null);
    setShowAiPanel(true);

    const result = await fetchAiDirectiveSuggestions(task, currentUser);

    setIsLoadingAi(false);
    if (result.error) {
      setAiError(result.error);
    } else {
      setAiData(result);
    }
  };

  const handleApplyAiSuggestion = (suggestion: AiDirectiveSuggestion, index: number) => {
    setSelectedAiIndex(index);
    setContent(suggestion.content);
    if (suggestion.recommendedDeadline && suggestion.recommendedDeadline.trim()) {
      setNewDeadline(suggestion.recommendedDeadline);
    }
    if (suggestion.isUrgent !== undefined) {
      setIsUrgent(suggestion.isUrgent);
    }
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
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-[#003366] px-6 py-4 text-white flex items-center justify-between border-b border-[#002244] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Chỉ Đạo & Đôn Đốc Của Giám Đốc</h2>
              <p className="text-xs text-blue-200 font-medium">Ý kiến chỉ đạo trực tiếp - Trợ lý AI phân tích dữ kiện thực tế</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-4">

          {/* Task Context Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
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

          {/* AI Directive Assistant Section */}
          <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 rounded-xl p-4 text-white shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-amber-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    Trợ Lý AI Gợi Ý Chỉ Đạo (Ban Giám Đốc)
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-semibold">
                      Phân tích Server-side
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Phân tích báo cáo thực tế, tự động tổng hợp câu chỉ đạo chuẩn phong cách điều hành
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFetchAiSuggestions}
                disabled={isLoadingAi}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-slate-950 font-bold text-xs rounded-lg shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoadingAi ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Đang tổng hợp dữ kiện AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>⚡ Tạo Gợi Ý Chỉ Đạo Thông Minh</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Error display */}
            {aiError && (
              <div className="mt-3 bg-red-950/80 border border-red-500/50 text-red-200 p-2.5 rounded-lg text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}

            {/* AI Suggestions & Fact Panel */}
            {showAiPanel && aiData && (
              <div className="mt-4 pt-4 border-t border-indigo-800/80 space-y-4">
                
                {/* Fact Breakdown (📌 Dữ kiện thực tế) */}
                <div className="bg-slate-950/60 border border-indigo-500/30 rounded-lg p-3 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      📌 DỮ KIỆN THỰC TẾ TỪ CSDL (KHOẢNG CÁCH KHÔNG BỊẠ SỐ LIỆU)
                    </span>
                    {aiData.usage && (
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        Còn lại hôm nay: <strong>{aiData.usage.remainingToday}/50 lượt</strong>
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-300 text-[11px]">
                    {aiData.facts.map((fact, i) => (
                      <div key={i} className="flex items-start gap-1">
                        <span className="text-emerald-400 font-mono">•</span>
                        <span>{fact}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Suggestions Cards (🤖 Nhận định & Gợi ý) */}
                <div>
                  <h5 className="text-xs font-bold text-amber-300 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    🤖 NHẬN ĐỊNH & GỢI Ý CHỈ ĐẠO CỦA AI (CHỌN ĐỂ ÁP DỤNG):
                  </h5>

                  {aiData.isFallback && (
                    <div className="mb-2 text-[11px] bg-amber-950/50 text-amber-200 border border-amber-500/30 p-2 rounded flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{aiData.fallbackReason || 'Chế độ gợi ý mẫu quy tắc dự phòng kích hoạt.'}</span>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    {aiData.suggestions.map((sug, idx) => {
                      const isSelected = selectedAiIndex === idx;
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border transition-all text-xs ${
                            isSelected
                              ? 'bg-blue-950/90 border-blue-400 shadow-md ring-1 ring-blue-400'
                              : 'bg-slate-900/80 border-slate-700 hover:border-slate-500'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs">{sug.title}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                                {sug.tone}
                              </span>
                              {sug.isUrgent && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/30 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> HỎA TỐC
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleApplyAiSuggestion(sug, idx)}
                              className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-500 text-slate-950 font-bold'
                                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-medium'
                              }`}
                            >
                              {isSelected ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                                  <span>Đã Chọn Gợi Ý Này</span>
                                </>
                              ) : (
                                <span>Sử dụng & Chỉnh sửa</span>
                              )}
                            </button>
                          </div>

                          <p className="text-slate-200 text-xs font-medium leading-relaxed bg-black/30 p-2 rounded border border-white/5 mb-1.5">
                            "{sug.content}"
                          </p>

                          <div className="text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
                            <span>💡 <em>Căn cứ nhận định: {sug.reasoning}</em></span>
                            {sug.recommendedDeadline && (
                              <span className="text-amber-300 font-mono">
                                Hạn đề xuất: {sug.recommendedDeadline}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="mt-2 text-[10px] text-slate-400 text-center italic">
                    {aiData.disclaimer}
                  </p>
                </div>

              </div>
            )}
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Quick Directive Templates */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mẫu chỉ đạo hành chính nhanh:
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
                placeholder="Nhập ý kiến chỉ đạo, đôn đốc cụ thể của Giám đốc hoặc nhấn chọn từ gợi ý AI ở trên..."
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
    </div>
  );
};
