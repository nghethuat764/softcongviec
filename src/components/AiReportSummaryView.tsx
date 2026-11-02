import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { UserAccount } from '../types/database';
import { 
  Sparkles, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  TrendingUp, 
  Building2, 
  Copy, 
  Check, 
  Info,
  ShieldAlert,
  Award
} from 'lucide-react';
import { fetchAiReportSummary, AiReportSummary, ReportFilterOptions } from '../services/aiReportService';
import { toast } from '../context/ToastContext';

interface AiReportSummaryViewProps {
  filterOptions: ReportFilterOptions;
  tasks: Task[];
  currentUser: UserAccount | null;
  onExportExcel?: () => void;
}

export const AiReportSummaryView: React.FC<AiReportSummaryViewProps> = ({
  filterOptions,
  tasks,
  currentUser,
  onExportExcel,
}) => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<AiReportSummary | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remainingQuota, setRemainingQuota] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Automatically trigger AI analysis when component mounts or filter options change
  const handleGenerateAiReport = async () => {
    setLoading(true);
    setError(null);

    const res = await fetchAiReportSummary(filterOptions, tasks, currentUser);

    setLoading(false);
    if (!res.success || !res.report) {
      setError(res.error || 'Không thể tạo báo cáo AI.');
    } else {
      setReportData(res.report);
      setIsFallback(!!res.isFallback);
      setFallbackReason(res.fallbackReason || null);
      if (res.usage) {
        setRemainingQuota(res.usage.remainingToday);
      }
    }
  };

  useEffect(() => {
    handleGenerateAiReport();
  }, [filterOptions.datePreset, filterOptions.selectedDepartment, filterOptions.fromDate, filterOptions.toDate]);

  const handleCopySummary = () => {
    if (!reportData) return;

    const copyText = `BÁO CÁO TỔNG HỢP GIAO BAN - TTDVTH HỐ NAI
Kỳ báo cáo: ${filterOptions.datePreset || 'Tùy chỉnh'} (${filterOptions.fromDate || ''} - ${filterOptions.toDate || ''})
--------------------------------------------------
1. TỔNG QUAN HẠẠT ĐỘNG:
${reportData.executiveSummary}

2. NỔI BẬT KHỐI LƯỢNG ĐÃ HOÀN THÀNH:
${reportData.keyAchievements.map((item, idx) => `• ${item}`).join('\n')}

3. ĐIỂM NÓNG VƯỚNG MẮC & RỦI RO TRỄ HẠN:
${reportData.delayedRisks.map((item) => `[Mã ${item.taskCode}] ${item.taskTitle} - Phụ trách: ${item.assignee}\n - Vướng mắc: ${item.issue}\n - Đề xuất chỉ đạo: ${item.suggestedAction}`).join('\n\n')}

4. ĐỀ XUẤT CHỈ ĐẠO CỦA LÃNH ĐẠO:
${reportData.recommendations.map((rec) => `- ${rec}`).join('\n')}`;

    navigator.clipboard.writeText(copyText);
    setCopied(true);
    toast.success('Đã sao chép báo cáo AI', 'Đã lưu nội dung tổng hợp vào bộ nhớ tạm để dán vào biên bản.');
    setTimeout(() => setCopied(false), 3000);
  };

  // Compute Facts summary from client tasks list
  const totalTasks = tasks.length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const delayedCount = tasks.filter((t) => t.status === 'delayed' || (t.status !== 'completed' && t.deadline && new Date(t.deadline) < new Date())).length;
  const completedRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className="space-y-4 text-xs sm:text-sm animate-in fade-in duration-200">

      {/* Top Banner Control */}
      <div className="bg-gradient-to-r from-[#003366] via-blue-900 to-indigo-900 rounded-xl p-4 text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 flex-wrap">
                Trợ Lý AI Phân Tích & Tổng Hợp Báo Cáo Giao Ban
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-semibold">
                  Zero Hallucination
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-blue-200 mt-0.5">
                Tự động trích xuất Executive Summary, điểm nóng rủi ro & gợi ý kiến nghị Lãnh đạo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleGenerateAiReport}
              disabled={loading}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 active:scale-95 text-slate-950 font-bold text-xs rounded-lg shadow flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Đang tổng hợp...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 text-slate-950" />
                  <span>Cập Nhật Báo Cáo AI</span>
                </>
              )}
            </button>

            {reportData && (
              <button
                type="button"
                onClick={handleCopySummary}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4 text-blue-200" />}
                <span>{copied ? 'Đã Sao Chép' : 'Sao Chép Báo Cáo'}</span>
              </button>
            )}
          </div>
        </div>

        {remainingQuota !== null && (
          <div className="mt-2.5 pt-2 border-t border-white/10 text-[11px] text-blue-200 flex items-center justify-between">
            <span>📌 Phân tích từ dữ liệu thực tế: <strong>{totalTasks} nhiệm vụ</strong></span>
            <span>Hạn ngạch AI hôm nay: <strong>{remainingQuota}/30 lượt còn lại</strong></span>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto animate-spin">
            <RefreshCw className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">Đang tổng hợp báo cáo bằng mô hình Gemini AI...</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Hệ thống đang rà soát dữ liệu thực tế từ {totalTasks} nhiệm vụ, phân loại trễ hạn và tổng hợp kiến nghị cho Ban Giám Đốc.
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <div className="flex-1">
            <strong>Không thể tạo báo cáo AI: </strong> {error}
          </div>
          <button
            type="button"
            onClick={handleGenerateAiReport}
            className="px-3 py-1 bg-red-600 text-white font-bold rounded text-xs hover:bg-red-700 cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Main AI Report Output */}
      {reportData && !loading && (
        <div className="space-y-4">

          {isFallback && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{fallbackReason || 'Kích hoạt báo cáo quy tắc tự động.'}</span>
            </div>
          )}

          {/* Facts Card */}
          <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              📌 Dữ Liệu Báo Cáo Thực Tế Từ CSDL
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="text-slate-400 block text-[11px]">Tổng số việc:</span>
                <span className="text-base font-bold text-white font-mono">{totalTasks} việc</span>
              </div>
              <div className="bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-800/60">
                <span className="text-emerald-300 block text-[11px]">Đã hoàn thành:</span>
                <span className="text-base font-bold text-emerald-400 font-mono">{completedCount} việc ({completedRate}%)</span>
              </div>
              <div className="bg-rose-950/60 p-2.5 rounded-lg border border-rose-800/60">
                <span className="text-rose-300 block text-[11px]">Cần đôn đốc / Trễ:</span>
                <span className="text-base font-bold text-rose-400 font-mono">{delayedCount} việc</span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="text-slate-400 block text-[11px]">Phạm vi lọc:</span>
                <span className="text-xs font-semibold text-blue-300 truncate block">{filterOptions.selectedDepartment || 'Toàn hệ thống'}</span>
              </div>
            </div>
          </div>

          {/* 1. Executive Summary */}
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-2">
            <h4 className="text-xs sm:text-sm font-bold text-[#003366] uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#003366]" />
              1. Bức Tranh Tổng Quan Tình Hình Thực Hiện (Executive Summary)
            </h4>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium bg-blue-50/50 p-3.5 rounded-lg border border-blue-100">
              "{reportData.executiveSummary}"
            </p>
          </div>

          {/* 2. Key Achievements */}
          {reportData.keyAchievements && reportData.keyAchievements.length > 0 && (
            <div className="bg-emerald-50/50 rounded-xl p-4 sm:p-5 border border-emerald-200/80 space-y-2">
              <h4 className="text-xs sm:text-sm font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-700" />
                2. Khối Lượng Công Việc & Kết Quả Nổi Bật Đã Đạt Được
              </h4>
              <div className="space-y-1.5 pl-1">
                {reportData.keyAchievements.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-emerald-950 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Delayed Risks Spotter */}
          <div className="bg-rose-50/60 rounded-xl p-4 sm:p-5 border border-rose-200 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-rose-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                3. Điểm Nóng Vướng Mắc & Cảnh Báo Trễ Hạn ({reportData.delayedRisks.length})
              </h4>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
                Cần Lãnh đạo chỉ đạo ngay
              </span>
            </div>

            {reportData.delayedRisks.length === 0 ? (
              <div className="p-3 bg-white rounded-lg border border-rose-200 text-xs text-slate-600 italic">
                ✓ Không ghi nhận nhiệm vụ trễ hạn hay vướng mắc nghiêm trọng trong kỳ báo cáo này.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {reportData.delayedRisks.map((item, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-rose-200 shadow-2xs space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                        {item.taskCode}
                      </span>
                      <span className="text-slate-600 font-semibold">Phụ trách: {item.assignee}</span>
                    </div>
                    <h5 className="font-bold text-slate-900 text-xs">{item.taskTitle}</h5>
                    <div className="text-rose-800 bg-rose-50/80 p-2 rounded text-[11px]">
                      <strong>Vướng mắc: </strong>{item.issue}
                    </div>
                    <div className="text-blue-900 bg-blue-50 p-2 rounded text-[11px] font-medium border border-blue-100">
                      💡 <strong>Gợi ý hướng chỉ đạo: </strong>{item.suggestedAction}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Section Evaluations */}
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-[#003366] uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#003366]" />
              4. Đánh Giá Hiệu Suất Theo Khối / Tổ Chuyên Môn
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reportData.sectionEvaluations.map((sec, idx) => {
                let badgeClass = 'bg-blue-100 text-blue-800 border-blue-200';
                if (sec.status === 'Tốt') badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                if (sec.status === 'Cần đôn đốc') badgeClass = 'bg-rose-100 text-rose-800 border-rose-200';

                return (
                  <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">{sec.sectionName}</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] border ${badgeClass}`}>
                        {sec.status} ({sec.completedCount}/{sec.taskCount} việc)
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed text-[11px] font-medium">
                      {sec.evaluation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Leadership Recommendations */}
          <div className="bg-indigo-950 text-white rounded-xl p-4 sm:p-5 border border-indigo-800 shadow-sm space-y-2">
            <h4 className="text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              5. Đề Xuất Đột Phá & Kết Luận Cho Phiên Giao Ban Lãnh Đạo
            </h4>
            <div className="space-y-2 pl-1">
              {reportData.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-indigo-100">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">
              📌 LƯU Ý: AI hỗ trợ trợ lý tổng hợp từ dữ liệu thực tế. Ý kiến kết luận thuộc thẩm quyền của Lãnh đạo.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopySummary}
                className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Sao Chép Vào Báo Cáo
              </button>
              {onExportExcel && (
                <button
                  type="button"
                  onClick={onExportExcel}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow transition-colors cursor-pointer"
                >
                  Xuất File Excel (.xlsx)
                </button>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
