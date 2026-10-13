import { Task } from '../types';
import { getStatusLabel } from './helpers';

/**
 * Generate formatted official document content for printing, previewing, and downloading
 */
export function generateOfficialDocContent(docName: string, task?: Task) {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  const code = task?.code || 'NV-CV';
  const title = task?.title || docName;
  const section = task?.section || 'TỔ CHUYÊN MÔN - TTDVTH';
  const assignee = task?.assignee || 'Cán bộ phụ trách chuyên môn';
  const deadline = task?.deadline || 'Theo tiến độ giao ban';
  const progress = task ? `${task.progress}%` : 'Đang xử lý';
  const status = task ? getStatusLabel(task.status) : 'Đang thực hiện';
  const budget = task?.budgetInfo || 'Theo dự toán ngân sách được phê duyệt';
  const currentReport = task?.currentReport || 'Đang triển khai các hạng mục theo đúng kế hoạch đề ra.';
  const requirement = task?.requirement || 'Thực hiện nghiêm túc, đúng tiến độ và quy chuẩn kỹ thuật.';

  return {
    docName,
    code,
    title,
    section,
    assignee,
    deadline,
    progress,
    status,
    budget,
    currentReport,
    requirement,
    day,
    month,
    year,
    issueDate: `${day}/${month}/${year}`,
  };
}

/**
 * Triggers native browser download for an attached document
 */
export function downloadAttachmentFile(docName: string, task?: Task) {
  const data = generateOfficialDocContent(docName, task);

  // If the document name ends with image or specific extension
  const safeTitle = (task?.code ? `[${task.code}]_` : '') + docName.replace(/[/\\?%*:|"<>]/g, '_');
  
  // Format Word-compatible HTML Document (.doc)
  const htmlContent = `
    <!DOCTYPE html>
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${data.docName}</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.4; margin: 40px; color: #000; }
        .header-table { width: 100%; margin-bottom: 25px; border-collapse: collapse; }
        .header-table td { vertical-align: top; font-size: 11pt; border: none; padding: 2px; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
        .italic { font-style: italic; }
        .uppercase { text-transform: uppercase; }
        .doc-title { font-size: 15pt; font-weight: bold; text-align: center; margin: 25px 0 15px 0; color: #b91c1c; }
        .doc-subtitle { font-size: 12pt; font-style: italic; text-align: center; margin-bottom: 25px; }
        .content-box { margin-top: 15px; }
        .info-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .info-table th, .info-table td { border: 1px solid #333; padding: 6px 10px; font-size: 11.5pt; text-align: left; }
        .info-table th { background-color: #f1f5f9; }
        .signature-table { width: 100%; margin-top: 40px; border-collapse: collapse; }
        .signature-table td { border: none; vertical-align: top; text-align: center; font-size: 11.5pt; width: 50%; }
        .stamp-box { display: inline-block; border: 2px dashed #b91c1c; color: #b91c1c; padding: 6px 12px; margin-top: 10px; font-weight: bold; font-size: 10pt; text-transform: uppercase; }
      </style>
    </head>
    <body>
      <table class="header-table">
        <tr>
          <td class="text-center" style="width: 45%;">
            <div>ỦY BAN NHÂN DÂN PHƯỜNG HỐ NAI</div>
            <div class="bold">TRUNG TÂM DỊCH VỤ TỔNG HỢP</div>
            <div style="font-size: 10pt; margin-top: 4px;">Số hiệu: TTDVTH-${data.code}</div>
          </td>
          <td class="text-center" style="width: 55%;">
            <div class="bold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div class="bold">Độc lập - Tự do - Hạnh phúc</div>
            <div style="font-size: 11pt; margin-top: 4px;">----------o0o----------</div>
            <div class="italic" style="margin-top: 4px; font-size: 10.5pt;">Hố Nai, ngày ${data.day} tháng ${data.month} năm ${data.year}</div>
          </td>
        </tr>
      </table>

      <div class="doc-title uppercase">
        HỒ SƠ / TÀI LIỆU ĐÍNH KÈM CÔNG VỤ
      </div>
      <div class="doc-subtitle">
        V/v: ${data.docName} (Liên quan nhiệm vụ [${data.code}] ${data.title})
      </div>

      <div class="content-box">
        <p><strong>Căn cứ:</strong> Kết luận giao ban tuần và phân công nhiệm vụ chuyên môn của Ban Giám đốc Trung tâm Dịch vụ Tổng hợp Phường Hố Nai;</p>
        <p><strong>Căn cứ:</strong> Báo cáo hiện trạng và hồ sơ kiểm tra thực địa phục vụ công tác điều hành;</p>
        <p>Hồ sơ tài liệu đính kèm này được trích xuất chính thức từ Hệ thống Quản trị & Điều hành Công vụ TTDVTH với các thông tin căn cứ chi tiết sau:</p>

        <table class="info-table">
          <tr>
            <th style="width: 30%;">Thông Tin</th>
            <th>Nội Dung Chi Tiết</th>
          </tr>
          <tr>
            <td class="bold">Tên hồ sơ / tài liệu:</td>
            <td class="bold" style="color: #0369a1;">${data.docName}</td>
          </tr>
          <tr>
            <td class="bold">Mã nhiệm vụ liên quan:</td>
            <td class="bold">${data.code} - ${data.title}</td>
          </tr>
          <tr>
            <td class="bold">Đơn vị phụ trách:</td>
            <td>${data.section}</td>
          </tr>
          <tr>
            <td class="bold">Cán bộ thụ lý / báo cáo:</td>
            <td>${data.assignee}</td>
          </tr>
          <tr>
            <td class="bold">Tiến độ thực tế:</td>
            <td><strong>${data.progress}</strong> - Trạng thái: ${data.status}</td>
          </tr>
          <tr>
            <td class="bold">Kinh phí / Dự toán:</td>
            <td>${data.budget}</td>
          </tr>
          <tr>
            <td class="bold">Hạn hoàn thành:</td>
            <td>${data.deadline}</td>
          </tr>
          <tr>
            <td class="bold">Yêu cầu & Chỉ đạo:</td>
            <td>${data.requirement}</td>
          </tr>
          <tr>
            <td class="bold">Tình hình thực tế đã làm:</td>
            <td>${data.currentReport}</td>
          </tr>
        </table>

        <p style="margin-top: 20px;"><strong>Ghi chú xác thực:</strong> Tài liệu đính kèm đã được thẩm định tính xác thực, phục vụ công tác nghiệm thu, giải ngân và tổng hợp báo cáo UBND Phường.</p>
      </div>

      <table class="signature-table">
        <tr>
          <td>
            <div class="bold">CÁN BỘ LẬP HỒ SƠ / BÁO CÁO</div>
            <div class="italic" style="font-size: 10pt; margin-top: 2px;">(Ký và ghi rõ họ tên)</div>
            <br><br><br>
            <div class="bold">${data.assignee}</div>
          </td>
          <td>
            <div class="bold">GIÁM ĐỐC TRUNG TÂM</div>
            <div class="italic" style="font-size: 10pt; margin-top: 2px;">(Ký duyệt số, đóng dấu)</div>
            <div class="stamp-box">ĐÃ KIỂM TRA & DUYỆT</div>
            <br><br>
            <div class="bold">Phạm Thanh Phong</div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeTitle}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
