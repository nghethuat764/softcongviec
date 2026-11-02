# Kế Hoạch Tích Hợp AI Phân Tích & Tổng Hợp Báo Cáo Giao Ban TTDVTH

Tích hợp Trợ lý AI Phân tích & Tổng hợp Báo cáo Giao ban tự động cho Ban Giám Đốc và Cán bộ Trung tâm Dịch vụ Tổng hợp Hố Nai. Hệ thống hỗ trợ trích xuất Executive Summary, đánh giá tiến độ 5 Khối/Tổ, phát hiện các điểm nóng/rủi ro chậm trễ, gợi ý nội dung Kiến nghị Lãnh đạo và hỗ trợ xuất báo cáo hoàn chỉnh ra file Excel (.xlsx) / Word.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Phương án tích hợp AI vào Báo cáo Giao ban được thiết kế nhằm phục vụ trực tiếp cho Ban Giám Đốc chỉ đạo công tác nhanh nhất mà không phải soạn thảo thủ công.

- **Tính năng AI cốt lõi**:
  - **Executive Summary**: Tự động tổng hợp bức tranh toàn cảnh công việc trong tuần/tháng (Tổng số nhiệm vụ, tỷ lệ hoàn thành, ngân sách đã triển khai).
  - **Phân tích rủi ro & Điểm nóng (Risk Spotter)**: Nhận diện tự động các nhiệm vụ bị chậm tiến độ, có khó khăn vướng mắc chưa giải quyết để cảnh báo Lãnh đạo.
  - **Đánh giá & Kiến nghị AI theo Khối/Tổ**: Tự động gợi ý câu đánh giá tình hình từng phòng ban và đề xuất hướng chỉ đạo tiếp theo.
- **Hình thức hiển thị & Xuất file**:
  - Tích hợp thành Tab/Panel **"🤖 AI Tổng Hợp & Phân Tích Báo Cáo"** ngay trong giao diện Báo cáo Giao ban hiện có.
  - Hỗ trợ nút **"Xuất Báo Cáo Excel (.xlsx)"** & **"Xuất Báo Cáo Word (.docx)"** đã được chèn sẵn nội dung đánh giá và nhận định từ AI.
- **Phân quyền (RBAC) & Nguyên tắc Zero Hallucination**:
  - Chỉ Lãnh đạo (Ban Giám Đốc) và Cán bộ được phân quyền mới có thể kích hoạt tính năng AI Tổng hợp Báo cáo.
  - AI chỉ sử dụng dữ liệu nhiệm vụ thực tế từ CSDL Firestore/Local Data. Không tự bịa đặt số liệu hay báo cáo giả lập.

---

## 1. Overview & Core Concept

- **Mục tiêu**: Giúp Lãnh đạo Trung tâm nắm bắt ngay lập tức trạng thái công việc của 5 Khối/Tổ chuyên môn mà không cần đọc thủ công hàng trăm dòng báo cáo đơn lẻ, đồng thời nhanh chóng phát lệnh chỉ đạo trong các buổi họp giao ban định kỳ.
- **Đối tượng sử dụng**: Ban Giám Đốc Trung tâm, Tổ trưởng các Khối/Tổ hành chính, xây dựng, công ích, văn hóa thông tin.
- **Giá trị mang lại**: Rút ngắn 80% thời gian chuẩn bị và đọc báo cáo giao ban; đảm bảo các nhiệm vụ chậm tiến độ được phát hiện và đôn đốc kịp thời.

---

## 2. User Experience & Visual Design

- **Giao diện Báo cáo AI (AI Reporting Panel)**:
  - Thẻ **📌 Dữ Liệu Thực Tế Tổng Hợp (Facts)**: Số liệu thống kê trực quan (Tổng số việc, % hoàn thành, số việc trễ hạn, tổng kinh phí).
  - Thẻ **🤖 Báo Cáo Tổng Hợp AI (Executive Summary)**: Đoạn văn tổng quan tình hình hoạt động do AI viết theo phong cách hành chính công vụ.
  - Thẻ **⚠️ Cảnh Báo Rủi Ro & Điểm Nóng**: Danh sách các nhiệm vụ vướng mắc cần Lãnh đạo chỉ đạo ngay.
  - Thẻ **🏢 Đánh Giá Theo Khối / Tổ Chuyên Môn**: Bảng phân tích chi tiết 5 Khối (Hành chính kế toán, Dịch vụ công ích - Xây dựng, Văn hóa - Thông tin, Dự án đầu tư...).
- **Bộ Lọc Khoảng Thời Gian & Đơn Vị**:
  - Cho phép chọn nhanh: *Giao ban tuần này*, *Tháng này*, *Quý này*, hoặc *Tùy chỉnh từ ngày... đến ngày...*.
  - Lọc theo từng Khối/Tổ chuyên môn hoặc toàn Trung tâm.
- **Hành động 1-Click Xuất File**:
  - Nút **"Tải Báo Cáo Excel Trọn Bộ"** sử dụng thư viện `xlsx` / `xlsx-js-style` xuất file .xlsx có format tiêu đề trang trọng và dữ liệu AI.
  - Nút **"Sử Dụng Nhận Định AI Cho Biên Bản Giao Ban"** để sao chép hoặc áp dụng ngay vào kết luận họp.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Đưa luồng xử lý AI Báo Báo về Server-side Express API (`/api/ai/report-summary`)**:
  - *Lý do*: Bảo mật `GEMINI_API_KEY`, kiểm soát thời gian chờ (Timeout 12s cho báo cáo dung lượng lớn), áp dụng Rate Limiting (max 30 lượt báo cáo/ngày/người dùng) và ghi log chi phí.
  - *Giải pháp dự phòng*: Nếu API quá tải hoặc timeout, hệ thống tự động tổng hợp số liệu theo quy tắc cứng (Rule-based Fallback Report) để giao diện không bị treo.
- **Decision 2: Cấu trúc Prompt & JSON Schema chuẩn hóa cho Gemini 3.8 Flash**:
  - *Mô hình*: `gemini-3.8-flash` với `responseMimeType: 'application/json'` và `responseSchema` chặt chẽ.
  - *Chống ảo giác (Zero Hallucination)*: Prompt bắt buộc AI chỉ được trích xuất và nhận định dựa trên danh sách Task được truyền lên từ máy chủ.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React SPA Frontend (Vite)                       │
│                                                                        │
│  ┌───────────────────────┐  ┌───────────────────────────────────────┐  │
│  │ ReportModal / View    │  │ AiReportSummaryCard                   │  │
│  │ - Period Filter       │  │ - 📌 Facts Summary                    │  │
│  │ - Section Filter      │  │ - 🤖 Executive Summary                │  │
│  │ - Export Excel Button │  │ - ⚠️ Risk & Delay Spotter             │  │
│  └───────────┬───────────┘  │ - 🏢 Section-by-Section AI Evaluation │  │
│              │              └───────────────────▲───────────────────┘  │
│              │ (Fetch Tasks)                    │ (JSON Response)      │
└──────────────┼──────────────────────────────────┼──────────────────────┘
               │                                  │
               ▼                                  │
┌─────────────────────────────────────────────────┴──────────────────────┐
│                    Node.js Express Server (server.ts)                  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Route: POST /api/ai/report-summary                              │  │
│  │  1. Check User Auth & Role Permissions (RBAC)                    │  │
│  │  2. Rate Limiting Check (30 calls/day per user)                  │  │
│  │  3. Filter Tasks by Date Range & Section Permissions             │  │
│  │  4. Call GoogleGenAI SDK (gemini-3.8-flash with JSON Schema)     │  │
│  │  5. Handle 12s Timeout & Rule-based Fallback                     │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
└────────────────────────────────────┼───────────────────────────────────┘
                                     │
                                     ▼
                     ┌───────────────────────────────┐
                     │ Google Gemini 3.8 Flash API   │
                     │ (Server-side via GEMINI_KEY)  │
                     └───────────────────────────────┘
```

### Data Flow & Component Mapping

1. **Client Service (`src/services/aiReportService.ts`)**:
   - Hàm `fetchAiReportSummary(filterOptions, tasks, user)` gửi dữ liệu lên endpoint `/api/ai/report-summary`.
2. **Server Endpoint (`/api/ai/report-summary` in `server.ts`)**:
   - Trích xuất dữ liệu thực tế từ danh sách nhiệm vụ được lọc.
   - Gọi Gemini SDK tạo báo cáo tổng hợp theo JSON Schema gồm: `executiveSummary`, `keyAchievements`, `delayedRisks`, `sectionEvaluations`, `recommendations`.
3. **UI Component (`src/components/AiReportModal.tsx` & `src/components/ReportModal.tsx`)**:
   - Hiển thị bảng tổng hợp AI sắc nét, hỗ trợ 1-click xuất Excel/Word và áp dụng ý kiến chỉ đạo.
