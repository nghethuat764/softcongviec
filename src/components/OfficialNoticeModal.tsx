import React from 'react';
import { Task } from '../types';
import { X, Printer, Download, CheckCircle2, Clock } from 'lucide-react';
import { getStatusBadgeClasses, getStatusLabel } from '../utils/helpers';

interface OfficialNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
}

export const OfficialNoticeModal: React.FC<OfficialNoticeModalProps> = ({
  isOpen,
  onClose,
  tasks,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // Group tasks by section
  const hcktTasks = tasks.filter((t) => t.section === 'II. TỔ HÀNH CHÍNH - KẾ TOÁN');
  const dvciTasks = tasks.filter((t) => t.section === 'III. TỔ DỊCH VỤ CÔNG ÍCH - XÂY DỰNG');
  const dtcTasks = tasks.filter((t) => t.section === 'IV. CÁC DỰ ÁN ĐẦU TƯ CÔNG TRUNG HẠN');
  const dtctxTasks = tasks.filter((t) => t.section === 'V. CÁC DỰ ÁN ĐẦU TƯ NGÂN SÁCH CHI THƯỜNG XUYÊN');
  const vhttTasks = tasks.filter((t) => t.section === 'VI. TỔ VĂN HÓA - THỂ THAO - THÔNG TIN - TUYÊN TRUYỀN');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Controls Bar (Hidden during print) */}
        <div className="bg-slate-900 px-6 py-3.5 text-white flex items-center justify-between border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">Văn Bản Kết Luận Giao Ban Tuần (Số: /TB-TTDVTH)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In Văn Bản / Xuất PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Document Paper Body */}
        <div className="p-8 sm:p-12 overflow-y-auto space-y-6 text-slate-900 text-sm leading-relaxed print:overflow-visible print:p-4">
          
          {/* Header Quốc hiệu - Tiêu ngữ */}
          <div className="grid grid-cols-2 text-center border-b border-slate-300 pb-5">
            <div>
              <p className="font-bold text-xs uppercase">UBND PHƯỜNG HỐ NAI</p>
              <p className="font-bold text-xs uppercase underline">TRUNG TÂM DỊCH VỤ TỔNG HỢP</p>
              <p className="text-2xs text-slate-600 mt-1">Số: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/TB-TTDVTH</p>
            </div>
            <div>
              <p className="font-bold text-xs uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p className="font-bold text-xs">Độc lập - Tự do - Hạnh phúc</p>
              <div className="w-24 h-[1px] bg-slate-400 mx-auto my-1"></div>
              <p className="text-2xs italic text-slate-600">Hố Nai, ngày 28 tháng 9 năm 2026</p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center pt-2">
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide">
              THÔNG BÁO
            </h2>
            <h3 className="text-sm sm:text-base font-bold">
              Kết luận cuộc họp giao ban tuần ngày 28/9/2026
            </h3>
          </div>

          {/* Opening text */}
          <div className="space-y-2 text-justify indent-6">
            <p>
              Ngày 28/9/2026, tại Hội trường Trung tâm Dịch vụ tổng hợp phường, Đồng chí <strong>Phạm Thanh Phong – Giám đốc Trung tâm</strong> đã chủ trì cuộc họp giao ban tuần. Tham dự cuộc họp có các đồng chí là Phó Giám đốc, viên chức và người lao động Trung tâm.
            </p>
            <p>
              Sau khi nghe ý kiến trao đổi, thống nhất của các đồng chí dự họp, Đồng chí Phạm Thanh Phong – Giám đốc Trung tâm đã kết luận chỉ đạo thực hiện các nội dung cụ thể sau:
            </p>
          </div>

          {/* I. NHIỆM VỤ CHUNG */}
          <div>
            <h4 className="font-bold uppercase text-red-900 border-b border-red-200 pb-1 mb-2">
              I. NHIỆM VỤ CHUNG
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 pl-2 text-xs sm:text-sm">
              <li>
                Yêu cầu tất cả viên chức Trung tâm chấp hành giờ giấc làm việc. Khi nghỉ phép phải có đơn nộp về tổ Hành chính – Kế toán. Đi công tác có hồ sơ đăng ký theo quy định.
              </li>
              <li>
                Chủ động thực hiện nhiệm vụ, tham mưu thực hiện các nhiệm vụ do mình phụ trách.
              </li>
              <li>
                Bám sát nhiệm vụ, theo sát các phòng ban, UBND phường cho đến khi có kết quả và kết thúc hồ sơ mới xong nhiệm vụ.
              </li>
            </ol>
          </div>

          {/* II. TỔ HÀNH CHÍNH - KẾ TOÁN */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase text-red-900 border-b border-red-200 pb-1">
              II. TỔ HÀNH CHÍNH - KẾ TOÁN
            </h4>
            {hcktTasks.map((t, idx) => (
              <div key={t.id} className="bg-slate-50 p-3 rounded border border-slate-200 text-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-slate-900">
                    {idx + 1}. {t.title}
                  </span>
                  <span className={`px-2 py-0.2 rounded text-2xs font-semibold ${getStatusBadgeClasses(t.status)}`}>
                    {t.progress}% · {getStatusLabel(t.status)}
                  </span>
                </div>
                <p className="text-slate-700 italic">" {t.requirement} "</p>
                <div className="mt-1 text-slate-800 font-medium">
                  → <strong>Tiến độ thực tế:</strong> {t.currentReport}
                </div>
              </div>
            ))}
          </div>

          {/* III. TỔ DỊCH VỤ CÔNG ÍCH - XÂY DỰNG */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase text-red-900 border-b border-red-200 pb-1">
              III. TỔ DỊCH VỤ CÔNG ÍCH - XÂY DỰNG
            </h4>
            {dvciTasks.map((t, idx) => (
              <div key={t.id} className="bg-slate-50 p-3 rounded border border-slate-200 text-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-slate-900">
                    {idx + 1}. {t.title} <span className="text-slate-500 font-normal">({t.assignee})</span>
                  </span>
                  <span className={`px-2 py-0.2 rounded text-2xs font-semibold ${getStatusBadgeClasses(t.status)}`}>
                    {t.progress}% · {getStatusLabel(t.status)}
                  </span>
                </div>
                <p className="text-slate-700 italic">" {t.requirement} "</p>
                <div className="mt-1 text-slate-800 font-medium">
                  → <strong>Tiến độ thực tế:</strong> {t.currentReport}
                </div>
              </div>
            ))}
          </div>

          {/* IV. CÁC DỰ ÁN ĐẦU TƯ CÔNG TRUNG HẠN */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase text-red-900 border-b border-red-200 pb-1">
              IV. CÁC DỰ ÁN ĐẦU TƯ CÔNG TRUNG HẠN (đồng chí Dương)
            </h4>
            {dtcTasks.map((t, idx) => (
              <div key={t.id} className="bg-slate-50 p-3 rounded border border-slate-200 text-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-slate-900">
                    {idx + 1}. {t.title}
                  </span>
                  <span className={`px-2 py-0.2 rounded text-2xs font-semibold ${getStatusBadgeClasses(t.status)}`}>
                    {t.progress}% · {getStatusLabel(t.status)}
                  </span>
                </div>
                <p className="text-slate-700 italic">" {t.requirement} "</p>
                <div className="mt-1 text-slate-800 font-medium">
                  → <strong>Tiến độ thực tế:</strong> {t.currentReport}
                </div>
              </div>
            ))}
          </div>

          {/* V. CÁC DỰ ÁN ĐẦU TƯ NGÂN SÁCH CHI THƯỜNG XUYÊN */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase text-red-900 border-b border-red-200 pb-1">
              V. CÁC DỰ ÁN ĐẦU TƯ NGÂN SÁCH CHI THƯỜNG XUYÊN (đồng chí Dương)
            </h4>
            {dtctxTasks.map((t, idx) => (
              <div key={t.id} className="bg-slate-50 p-3 rounded border border-slate-200 text-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-slate-900">
                    {idx + 1}. {t.title}
                  </span>
                  <span className={`px-2 py-0.2 rounded text-2xs font-semibold ${getStatusBadgeClasses(t.status)}`}>
                    {t.progress}% · {getStatusLabel(t.status)}
                  </span>
                </div>
                <p className="text-slate-700 italic">" {t.requirement} "</p>
                <div className="mt-1 text-slate-800 font-medium">
                  → <strong>Tiến độ thực tế:</strong> {t.currentReport}
                </div>
              </div>
            ))}
          </div>

          {/* VI. TỔ VĂN HÓA - THỂ THAO - THÔNG TIN - TUYÊN TRUYỀN */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase text-red-900 border-b border-red-200 pb-1">
              VI. TỔ VĂN HÓA - THỂ THAO - THÔNG TIN - TUYÊN TRUYỀN (đồng chí Tuyến phụ trách)
            </h4>
            {vhttTasks.map((t, idx) => (
              <div key={t.id} className="bg-slate-50 p-3 rounded border border-slate-200 text-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-slate-900">
                    {idx + 1}. {t.title} <span className="text-slate-500 font-normal">({t.assignee})</span>
                  </span>
                  <span className={`px-2 py-0.2 rounded text-2xs font-semibold ${getStatusBadgeClasses(t.status)}`}>
                    {t.progress}% · {getStatusLabel(t.status)}
                  </span>
                </div>
                <p className="text-slate-700 italic">" {t.requirement} "</p>
                <div className="mt-1 text-slate-800 font-medium">
                  → <strong>Tiến độ thực tế:</strong> {t.currentReport}
                </div>
              </div>
            ))}
          </div>

          {/* Closing & Sign-off */}
          <div className="pt-6">
            <p className="indent-6 text-justify">
              Trên đây là kết luận cuộc họp giao ban tuần ngày 28/9/2026 của Trung tâm Dịch vụ tổng hợp phường. Đề nghị toàn thể viên chức và người lao động nghiêm túc tổ chức triển khai thực hiện./.
            </p>
          </div>

          <div className="grid grid-cols-2 pt-6">
            <div className="text-2xs text-slate-600 space-y-0.5">
              <p className="font-bold">Nơi nhận:</p>
              <p>- BGĐ TT;</p>
              <p>- Toàn thể VC TT;</p>
              <p>- Lưu: HC-KT. (Phongkt)</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-xs uppercase">GIÁM ĐỐC</p>
              <div className="h-16"></div>
              <p className="font-bold text-sm">Phạm Thanh Phong</p>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-end gap-2 print:hidden shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In Bản Kết Luận</span>
          </button>
        </div>

      </div>
    </div>
  );
};
