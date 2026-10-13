import React, { useState } from 'react';
import { Task } from '../types';
import { 
  X, 
  Download, 
  Printer, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  FileText, 
  CheckCircle2, 
  Building, 
  Calendar, 
  User, 
  DollarSign, 
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Paperclip
} from 'lucide-react';
import { downloadAttachmentFile, generateOfficialDocContent } from '../utils/documentDownload';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  docName: string | null;
  task?: Task | null;
  allDocs?: string[];
  onSelectDoc?: (doc: string) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  docName,
  task,
  allDocs = [],
  onSelectDoc,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen || !docName) return null;

  const docData = generateOfficialDocContent(docName, task || undefined);

  // Handle download
  const handleDownload = () => {
    downloadAttachmentFile(docName, task || undefined);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Zoom controls
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 150));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 70));
  const handleResetZoom = () => setZoomLevel(100);

  // Navigation between multiple docs
  const currentIndex = allDocs.indexOf(docName);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allDocs.length - 1;

  const handlePrevDoc = () => {
    if (hasPrev && onSelectDoc) {
      onSelectDoc(allDocs[currentIndex - 1]);
    }
  };

  const handleNextDoc = () => {
    if (hasNext && onSelectDoc) {
      onSelectDoc(allDocs[currentIndex + 1]);
    }
  };

  // Determine doc type badge
  const getDocTypeBadge = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('quyết định') || lower.includes('qđ')) return { label: 'Quyết Định', color: 'bg-red-100 text-red-800 border-red-300' };
    if (lower.includes('nghiệm thu') || lower.includes('bb')) return { label: 'Biên Bản Nghiệm Thu', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (lower.includes('kế hoạch')) return { label: 'Kế Hoạch Công Tác', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    if (lower.includes('hợp đồng')) return { label: 'Hợp Đồng Kinh Tế', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    if (lower.includes('tờ trình')) return { label: 'Tờ Trình Phê Duyệt', color: 'bg-purple-100 text-purple-800 border-purple-300' };
    if (lower.includes('nghị định') || lower.includes('văn bản')) return { label: 'Văn Bản Quy Phạm', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
    return { label: 'Hồ Sơ Đính Kèm', color: 'bg-slate-100 text-slate-800 border-slate-300' };
  };

  const typeBadge = getDocTypeBadge(docName);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div 
        className={`bg-slate-900 rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col transition-all duration-200 print:border-none print:shadow-none print:w-full ${
          isFullscreen 
            ? 'w-full h-full fixed inset-0 rounded-none' 
            : 'max-w-4xl w-full max-h-[95vh] h-[90vh]'
        }`}
      >
        {/* Top Control Bar - Official Government Styled */}
        <div className="bg-linear-to-r from-[#0a2f5c] via-[#0d3b73] to-[#0a2f5c] px-4 sm:px-6 py-3 border-b border-blue-900 text-white flex items-center justify-between shrink-0 print:hidden gap-3 shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#7a1212] border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0 shadow-sm">
              <FileText className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-3xs font-bold px-2 py-0.5 rounded border uppercase ${typeBadge.color}`}>
                  {typeBadge.label}
                </span>
                {task && (
                  <span className="font-mono text-3xs bg-red-900/80 text-red-200 px-1.5 py-0.5 rounded font-bold border border-red-700/60">
                    {task.code}
                  </span>
                )}
                {allDocs.length > 1 && (
                  <span className="text-3xs text-slate-400 font-mono">
                    ({currentIndex + 1}/{allDocs.length} tệp)
                  </span>
                )}
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-md sm:max-w-lg mt-0.5" title={docName}>
                {docName}
              </h2>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Prev / Next Document Navigation if multiple */}
            {allDocs.length > 1 && (
              <div className="hidden sm:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                <button
                  type="button"
                  disabled={!hasPrev}
                  onClick={handlePrevDoc}
                  title="Tệp đính kèm trước"
                  className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 rounded cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={!hasNext}
                  onClick={handleNextDoc}
                  title="Tệp đính kèm tiếp theo"
                  className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 rounded cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Zoom Controls */}
            <div className="hidden md:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
              <button
                type="button"
                onClick={handleZoomOut}
                title="Thu nhỏ"
                className="p-1.5 text-slate-300 hover:text-white rounded cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                title="Tỉ lệ 100%"
                className="px-1.5 text-3xs font-mono text-slate-300 hover:text-white cursor-pointer"
              >
                {zoomLevel}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                title="Phóng to"
                className="p-1.5 text-slate-300 hover:text-white rounded cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              title="In văn bản này"
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-2xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">In</span>
            </button>

            {/* Primary Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              title="Tải tệp này về máy tính"
              className="px-3 sm:px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-2xs sm:text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải File</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Toàn màn hình'}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              title="Đóng cửa sổ xem file"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Toast when downloaded */}
        {downloadSuccess && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top duration-150 print:hidden shrink-0">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Đã tải file <strong>{docName}</strong> thành công về máy tính của bạn!</span>
            </span>
            <span className="text-3xs opacity-80">Định dạng Word/Văn bản công vụ</span>
          </div>
        )}

        {/* Document Viewing Body Area */}
        <div className="flex-1 overflow-y-auto bg-slate-950/60 p-4 sm:p-8 flex justify-center custom-scrollbar print:p-0 print:bg-white print:overflow-visible">
          
          {/* Paper View Container (Simulates real standard A4 official paper) */}
          <div 
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="w-full max-w-[850px] bg-white text-slate-900 rounded-lg shadow-2xl p-8 sm:p-14 transition-transform duration-100 min-h-[900px] flex flex-col justify-between border border-slate-200/80 font-serif leading-relaxed text-slate-800 print:shadow-none print:border-none print:p-0 print:transform-none"
          >
            {/* Paper Header */}
            <div>
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-300 text-xs sm:text-sm">
                {/* Left Header */}
                <div className="text-center font-sans">
                  <div className="text-2xs text-slate-600 uppercase font-semibold">
                    ỦY BAN NHÂN DÂN PHƯỜNG HỐ NAI
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase mt-0.5">
                    TRUNG TÂM DỊCH VỤ TỔNG HỢP
                  </div>
                  <div className="text-2xs text-slate-500 font-mono mt-1">
                    Số: TTDVTH-{docData.code}/HSCV
                  </div>
                  <div className="w-20 h-0.5 bg-slate-400 mx-auto mt-1" />
                </div>

                {/* Right Header */}
                <div className="text-center font-sans">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 uppercase">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </div>
                  <div className="text-2xs sm:text-xs font-semibold text-slate-800 mt-0.5">
                    Độc lập - Tự do - Hạnh phúc
                  </div>
                  <div className="w-28 h-0.5 bg-slate-400 mx-auto mt-1" />
                  <div className="text-2xs italic text-slate-600 mt-2">
                    Hố Nai, ngày {docData.day} tháng {docData.month} năm {docData.year}
                  </div>
                </div>
              </div>

              {/* Document Title Banner */}
              <div className="text-center my-8">
                <span className="inline-block px-3 py-1 rounded bg-red-50 text-red-800 text-2xs font-sans font-bold uppercase tracking-widest border border-red-200 mb-2">
                  HỒ SƠ / TÀI LIỆU ĐÍNH KÈM CHÍNH THỨC
                </span>
                <h1 className="text-lg sm:text-2xl font-bold text-red-900 uppercase tracking-tight">
                  {docData.docName}
                </h1>
                <p className="text-xs sm:text-sm italic text-slate-600 mt-1">
                  (Thuộc nhiệm vụ công vụ: <strong className="font-sans font-bold text-slate-900">[{docData.code}] {docData.title}</strong>)
                </p>
              </div>

              {/* Official Legal Basis */}
              <div className="space-y-2 text-xs sm:text-sm leading-relaxed mb-6 font-sans">
                <p className="italic text-slate-700">
                  - <strong>Căn cứ:</strong> Kết luận giao ban công tác tuần của Ban Giám đốc Trung tâm Dịch vụ Tổng hợp Phường Hố Nai;
                </p>
                <p className="italic text-slate-700">
                  - <strong>Căn cứ:</strong> Quyết định phân công nhiệm vụ và trách nhiệm chỉ đạo điều hành của Lãnh đạo Trung tâm;
                </p>
                <p className="italic text-slate-700">
                  - <strong>Căn cứ:</strong> Hồ sơ, biên bản kiểm tra thực địa, hồ sơ nghiệm thu kỹ thuật và tài liệu báo cáo tiến độ do bộ phận chuyên môn cung cấp;
                </p>
              </div>

              {/* Key Metadata Table */}
              <div className="my-6 font-sans overflow-hidden rounded-xl border border-slate-300">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-300 font-bold text-xs uppercase text-slate-800 flex items-center justify-between">
                  <span>THÔNG TIN TRÍCH XUẤT HỒ SƠ ĐÍNH KÈM</span>
                  <span className="text-2xs font-mono font-normal text-slate-500">HỆ THỐNG QUẢN LÝ TTDVTH</span>
                </div>
                <table className="w-full text-xs text-left border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="w-1/3 py-2.5 px-4 bg-slate-50 font-semibold text-slate-600">Tên tài liệu / Văn bản:</td>
                      <td className="py-2.5 px-4 font-bold text-blue-900 text-sm">{docData.docName}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-2.5 px-4 bg-slate-50 font-semibold text-slate-600">Nhiệm vụ liên quan:</td>
                      <td className="py-2.5 px-4 font-bold text-slate-800">[{docData.code}] {docData.title}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-2.5 px-4 bg-slate-50 font-semibold text-slate-600">Đơn vị / Tổ chuyên môn:</td>
                      <td className="py-2.5 px-4 text-slate-800">{docData.section}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-2.5 px-4 bg-slate-50 font-semibold text-slate-600">Cán bộ phụ trách / thụ lý:</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{docData.assignee}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-2.5 px-4 bg-slate-50 font-semibold text-slate-600">Tiến độ thực tế & Trạng thái:</td>
                      <td className="py-2.5 px-4 text-slate-800">
                        <span className="font-bold text-emerald-700">{docData.progress}</span> · Trạng thái: <strong>{docData.status}</strong>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-2.5 px-4 bg-slate-50 font-semibold text-slate-600">Kinh phí / Dự toán:</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{docData.budget}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-2.5 px-4 bg-slate-50 font-semibold text-slate-600">Thời hạn hoàn thành:</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-red-700">{docData.deadline}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-2.5 px-4 bg-slate-50 font-semibold text-slate-600">Yêu cầu & Chỉ đạo chuyên môn:</td>
                      <td className="py-2.5 px-4 text-slate-700 leading-relaxed">{docData.requirement}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 bg-slate-50 font-semibold text-slate-600">Nội dung báo cáo thực tế:</td>
                      <td className="py-2.5 px-4 text-slate-800 leading-relaxed bg-amber-50/40">{docData.currentReport}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Directives from leadership if any */}
              {task && task.leaderDirectives && task.leaderDirectives.length > 0 && (
                <div className="my-6 p-4 rounded-xl bg-red-50 border border-red-200 font-sans text-xs">
                  <div className="font-bold text-red-950 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-red-700" />
                    <span>Ý KIẾN CHỈ ĐẠO CỦA BAN GIÁM ĐỐC TRUNG TÂM ({task.leaderDirectives.length})</span>
                  </div>
                  <div className="space-y-2">
                    {task.leaderDirectives.map((d) => (
                      <div key={d.id} className="p-2.5 bg-white rounded-lg border border-red-100 text-slate-800">
                        <div className="flex items-center justify-between text-2xs text-slate-500 mb-1">
                          <span className="font-bold text-red-800">{d.author}</span>
                          <span>{d.timestamp}</span>
                        </div>
                        <p className="font-medium text-slate-800">{d.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inspection statement */}
              <div className="mt-6 text-xs sm:text-sm leading-relaxed text-slate-700">
                <p>
                  Tài liệu đính kèm này là căn cứ hồ sơ pháp lý, kỹ thuật hoặc hiện trường đã được số hóa và đồng bộ trên hệ thống dữ liệu đám mây Google Cloud Firestore của Trung tâm Dịch vụ Tổng hợp Phường Hố Nai. Lãnh đạo Trung tâm và các bộ phận chuyên môn sử dụng tài liệu này để kiểm tra, đánh giá, nghiệm thu và lưu trữ phục vụ công tác thanh kiểm tra.
                </p>
              </div>
            </div>

            {/* Official Signatures Section */}
            <div className="mt-12 pt-8 border-t border-slate-300 font-sans">
              <div className="grid grid-cols-2 gap-8 text-center text-xs sm:text-sm">
                <div>
                  <div className="font-bold text-slate-800 uppercase">CÁN BỘ THỤ LÝ / LẬP HỒ SƠ</div>
                  <div className="text-2xs italic text-slate-500 mt-0.5">(Ký, ghi rõ họ tên và xác nhận tài liệu)</div>
                  <div className="h-16 flex items-center justify-center">
                    <span className="font-serif italic text-blue-900 text-sm">Đã lập & số hóa</span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">{docData.assignee}</div>
                </div>

                <div>
                  <div className="font-bold text-slate-800 uppercase">GIÁM ĐỐC TRUNG TÂM</div>
                  <div className="text-2xs italic text-slate-500 mt-0.5">(Phê duyệt và ký số điện tử)</div>
                  <div className="h-16 flex items-center justify-center">
                    {/* Official Electronic Stamp Badge */}
                    <div className="border-2 border-red-600 rounded-lg p-1.5 text-center bg-red-50/50 shadow-xs">
                      <div className="text-3xs font-extrabold text-red-700 uppercase tracking-tighter">
                        TRUNG TÂM DỊCH VỤ TỔNG HỢP
                      </div>
                      <div className="text-2xs font-black text-red-800 uppercase">
                        ĐÃ KIỂM TRA & PHÊ DUYỆT
                      </div>
                      <div className="text-3xs text-red-600 font-mono">
                        {docData.issueDate} · KÝ SỐ HỢP LỆ
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">Phạm Thanh Phong</div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Bottom Bar */}
        <div className="bg-slate-950 px-4 sm:px-6 py-2.5 border-t border-slate-800 text-slate-400 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Paperclip className="w-3.5 h-3.5 text-amber-400" />
            <span>Đang xem trực tiếp tệp: <strong className="text-slate-200">{docName}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-2xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Tải file Word/Văn bản (.doc)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-2xs font-semibold cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
