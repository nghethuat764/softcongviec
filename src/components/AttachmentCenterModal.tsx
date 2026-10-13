import React, { useState, useMemo } from 'react';
import { Task } from '../types';
import { 
  X, 
  Search, 
  Download, 
  Eye, 
  FileText, 
  Paperclip, 
  Filter, 
  Building, 
  User, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink,
  Sparkles,
  Layers,
  FolderOpen
} from 'lucide-react';
import { downloadAttachmentFile } from '../utils/documentDownload';

interface AttachmentCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onViewDoc: (docName: string, task: Task) => void;
  onSelectTask: (task: Task) => void;
}

export const AttachmentCenterModal: React.FC<AttachmentCenterModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onViewDoc,
  onSelectTask,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'decision' | 'acceptance' | 'contract' | 'plan' | 'other'>('all');
  const [downloadedDoc, setDownloadedDoc] = useState<string | null>(null);

  // Extract all attachments linked to tasks
  const allAttachments = useMemo(() => {
    const list: { docName: string; task: Task; category: 'decision' | 'acceptance' | 'contract' | 'plan' | 'other' }[] = [];
    tasks.forEach((task) => {
      if (task.relatedDocs && task.relatedDocs.length > 0) {
        task.relatedDocs.forEach((doc) => {
          const lower = doc.toLowerCase();
          let category: 'decision' | 'acceptance' | 'contract' | 'plan' | 'other' = 'other';
          if (lower.includes('quyết định') || lower.includes('qđ') || lower.includes('nghị định')) {
            category = 'decision';
          } else if (lower.includes('nghiệm thu') || lower.includes('khảo sát') || lower.includes('biên bản') || lower.includes('bb')) {
            category = 'acceptance';
          } else if (lower.includes('hợp đồng') || lower.includes('hđ') || lower.includes('chứng từ') || lower.includes('kinh phí') || lower.includes('giá')) {
            category = 'contract';
          } else if (lower.includes('kế hoạch') || lower.includes('tờ trình') || lower.includes('phương án') || lower.includes('báo cáo') || lower.includes('đề xuất')) {
            category = 'plan';
          }
          list.push({ docName: doc, task, category });
        });
      }
    });
    return list;
  }, [tasks]);

  // Filter attachments
  const filteredList = useMemo(() => {
    return allAttachments.filter((item) => {
      // Category filter
      if (selectedFilter !== 'all' && item.category !== selectedFilter) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const match = 
          item.docName.toLowerCase().includes(q) ||
          item.task.code.toLowerCase().includes(q) ||
          item.task.title.toLowerCase().includes(q) ||
          item.task.assignee.toLowerCase().includes(q) ||
          item.task.section.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [allAttachments, selectedFilter, searchTerm]);

  // Count by category
  const counts = useMemo(() => {
    return {
      all: allAttachments.length,
      decision: allAttachments.filter((i) => i.category === 'decision').length,
      acceptance: allAttachments.filter((i) => i.category === 'acceptance').length,
      contract: allAttachments.filter((i) => i.category === 'contract').length,
      plan: allAttachments.filter((i) => i.category === 'plan').length,
      other: allAttachments.filter((i) => i.category === 'other').length,
    };
  }, [allAttachments]);

  if (!isOpen) return null;

  const handleDownload = (docName: string, task: Task) => {
    downloadAttachmentFile(docName, task);
    setDownloadedDoc(docName);
    setTimeout(() => setDownloadedDoc(null), 3000);
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'decision':
        return { label: 'Quyết định / Chỉ đạo', color: 'bg-red-50 text-red-700 border-red-200' };
      case 'acceptance':
        return { label: 'Biên bản nghiệm thu', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'contract':
        return { label: 'Hợp đồng & Kinh phí', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'plan':
        return { label: 'Kế hoạch & Tờ trình', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      default:
        return { label: 'Hồ sơ đính kèm', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-800 flex items-center justify-center text-red-300 shrink-0">
              <FolderOpen className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xs font-mono uppercase tracking-wider text-red-300 font-bold">
                  UBND PHƯỜNG HỐ NAI · TTDVTH
                </span>
                <span className="text-3xs bg-red-800/80 text-amber-300 px-2 py-0.5 rounded-full font-mono font-bold">
                  {allAttachments.length} tệp đính kèm
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Kho Hồ Sơ & Văn Bản Đính Kèm Của Lãnh Đạo
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {downloadedDoc && (
          <div className="bg-emerald-600 text-white px-6 py-2 text-xs font-semibold flex items-center justify-between shrink-0 animate-in slide-in-from-top duration-150">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Đã tải thành công tệp: <strong>{downloadedDoc}</strong></span>
            </span>
            <span className="text-3xs opacity-80">Định dạng văn bản công vụ .doc</span>
          </div>
        )}

        {/* Toolbar: Search & Category Filters */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm theo tên tài liệu, mã NV-01, cán bộ phụ trách, tổ chuyên môn..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 shadow-2xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick summary badge */}
            <div className="shrink-0 text-xs text-slate-500 font-medium">
              Hiển thị <strong className="text-slate-900">{filteredList.length}</strong> / {allAttachments.length} tài liệu
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              Tất cả ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('decision')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                selectedFilter === 'decision'
                  ? 'bg-red-800 text-white shadow-xs'
                  : 'bg-white hover:bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              <span>Quyết định & Chỉ đạo</span>
              <span className="font-mono text-2xs px-1.5 rounded-full bg-red-100 text-red-900">{counts.decision}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('acceptance')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                selectedFilter === 'acceptance'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              <span>Biên bản nghiệm thu & Khảo sát</span>
              <span className="font-mono text-2xs px-1.5 rounded-full bg-emerald-100 text-emerald-900">{counts.acceptance}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('contract')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                selectedFilter === 'contract'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-white hover:bg-amber-50 text-amber-900 border border-amber-200'
              }`}
            >
              <span>Hợp đồng & Kinh phí</span>
              <span className="font-mono text-2xs px-1.5 rounded-full bg-amber-100 text-amber-900">{counts.contract}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('plan')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                selectedFilter === 'plan'
                  ? 'bg-blue-800 text-white shadow-xs'
                  : 'bg-white hover:bg-blue-50 text-blue-800 border border-blue-200'
              }`}
            >
              <span>Kế hoạch & Tờ trình</span>
              <span className="font-mono text-2xs px-1.5 rounded-full bg-blue-100 text-blue-900">{counts.plan}</span>
            </button>
          </div>
        </div>

        {/* Document Cards List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-3 bg-slate-100/50">
          {filteredList.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 p-8">
              <Paperclip className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Không tìm thấy tài liệu nào phù hợp với bộ lọc</p>
              <p className="text-xs text-slate-500 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc bấm "Tất cả" để xem toàn bộ tài liệu.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredList.map((item, idx) => {
                const catInfo = getCategoryBadge(item.category);
                return (
                  <div
                    key={`${item.task.id}-${idx}`}
                    className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-red-300 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-3xs font-bold px-2 py-0.5 rounded border uppercase ${catInfo.color}`}>
                          {catInfo.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectTask(item.task);
                            onClose();
                          }}
                          className="font-mono text-3xs font-bold bg-slate-100 hover:bg-red-50 text-red-800 hover:text-red-900 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1 cursor-pointer"
                          title="Xem chi tiết nhiệm vụ này"
                        >
                          <span>{item.task.code}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </button>
                      </div>

                      {/* Document Name */}
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-red-700 transition-colors flex items-start gap-2">
                        <FileText className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{item.docName}</span>
                      </h3>

                      {/* Associated Task Title */}
                      <p className="text-2xs text-slate-600 mt-2 line-clamp-1">
                        <strong>Nhiệm vụ:</strong> {item.task.title}
                      </p>

                      {/* Section & Assignee */}
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-500">
                        <span className="flex items-center gap-1 truncate max-w-[55%]">
                          <Building className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{item.task.section.replace(/^[IVX]+\.\s*/, '')}</span>
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <User className="w-3 h-3 text-blue-600 shrink-0" />
                          <span>{item.task.assignee}</span>
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons: Xem Trực Tiếp & Tải File */}
                    <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onViewDoc(item.docName, item.task);
                        }}
                        className="py-1.5 px-2 bg-blue-50 hover:bg-blue-600 text-blue-800 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-blue-200 hover:border-blue-600 transition-all cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem trực tiếp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownload(item.docName, item.task)}
                        className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tải file</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Toàn bộ tài liệu được ký duyệt số và lưu trữ bảo mật trên đám mây Firestore</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
          >
            Đóng kho hồ sơ
          </button>
        </div>

      </div>
    </div>
  );
};
