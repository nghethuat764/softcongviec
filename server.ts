import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// User rate-limiting store (per user per day)
interface UserUsage {
  count: number;
  lastResetDate: string;
}
const userUsageMap = new Map<string, UserUsage>();
const MAX_DAILY_CALLS_PER_USER = 50;

function checkAndIncrementRateLimit(userId: string): { allowed: boolean; remaining: number; totalUsed: number } {
  const today = new Date().toISOString().split('T')[0];
  let record = userUsageMap.get(userId);

  if (!record || record.lastResetDate !== today) {
    record = { count: 0, lastResetDate: today };
  }

  if (record.count >= MAX_DAILY_CALLS_PER_USER) {
    return {
      allowed: false,
      remaining: 0,
      totalUsed: record.count,
    };
  }

  record.count += 1;
  userUsageMap.set(userId, record);

  return {
    allowed: true,
    remaining: MAX_DAILY_CALLS_PER_USER - record.count,
    totalUsed: record.count,
  };
}

// Timeout helper (8 seconds MAX)
function withTimeout<T>(promise: Promise<T>, timeoutMs = 8000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('AI_TIMEOUT_EXCEEDED'));
    }, timeoutMs);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// Helper to initialize GoogleGenAI instance with API Key
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// REST API: Directive Suggestions for Leaders
app.post('/api/ai/directive-suggestions', async (req, res) => {
  try {
    const { task, user } = req.body;

    if (!user) {
      return res.status(401).json({ error: 'Chưa xác thực thông tin người dùng.' });
    }

    // RBAC Check: Only Leadership can use AI Directive Assistant
    const isLeaderRole = user.isLeader || user.role === 'admin' || user.role === 'leader';
    if (!isLeaderRole) {
      return res.status(403).json({
        error: 'Rào cản phân quyền (RBAC): Chức năng AI gợi ý chỉ đạo dành riêng cho Ban Giám Đốc và Lãnh đạo.',
      });
    }

    // Rate limiting check
    const userId = user.id || user.username || 'unknown_user';
    const rateCheck = checkAndIncrementRateLimit(userId);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: `Bạn đã đạt giới hạn ${MAX_DAILY_CALLS_PER_USER} lượt sử dụng AI trong ngày hôm nay. Vui lòng thử lại vào ngày mai.`,
        remainingToday: 0,
        totalUsed: rateCheck.totalUsed,
      });
    }

    // Extract facts strictly from provided task
    const facts = [
      `Mã nhiệm vụ: ${task.code || 'N/A'}`,
      `Tên nhiệm vụ: ${task.title || 'Không có tên'}`,
      `Khối/Tổ phụ trách: ${task.section || 'Nhiệm vụ chung'}`,
      `Cán bộ chính: ${task.assignee || 'Chưa phân công'}${task.coAssignees?.length ? ` (Phối hợp: ${task.coAssignees.join(', ')})` : ''}`,
      `Trạng thái & Tiến độ: ${task.status === 'completed' ? 'Đã hoàn thành' : task.status === 'pending' ? 'Chờ xử lý' : 'Đang triển khai'} (${task.progress || 0}%)`,
      `Thời hạn hiện tại: ${task.deadline || 'Chưa định ngày'}`,
      `Yêu cầu ban đầu: ${task.requirement || 'Chưa ghi chú'}`,
      `Khó khăn/Vướng mắc báo cáo: ${task.difficulties ? task.difficulties : 'Không báo cáo vướng mắc'}`,
      `Báo cáo mới nhất: ${task.currentReport || 'Chưa có thông tin mới'}`,
    ];

    const aiClient = getGenAIClient();

    // Fallback if API Key not present or invalid
    if (!aiClient) {
      const fallbackSuggestions = generateRuleBasedFallback(task);
      return res.json({
        success: true,
        isFallback: true,
        fallbackReason: 'Không tìm thấy API Key Gemini trên server. Đã chuyển sang bộ quy tắc mẫu thông minh.',
        facts,
        suggestions: fallbackSuggestions,
        disclaimer: '📌 LƯU Ý: AI chỉ đóng vai trò trợ lý gợi ý dựa trên báo cáo thực tế. Quyết định và nội dung chỉ đạo thuộc thẩm quyền của Lãnh đạo.',
        usage: { remainingToday: rateCheck.remaining, totalUsed: rateCheck.totalUsed },
      });
    }

    const systemInstruction = `Bạn là Trợ lý Lãnh đạo cao cấp cho Ban Giám Đốc Trung tâm Dịch vụ Tổng hợp Hố Nai.
Nhiệm vụ của bạn là phân tích báo cáo công việc và đề xuất 3 phương án chỉ đạo/đôn đốc ngắn gọn, quyết liệt, chuẩn phong cách hành chính nhà nước.

NGUYÊN TẮC BẮT BUỘC (ZERO HALLUCINATION):
1. TUYỆT ĐỐI KHÔNG tự bịa ra số liệu, ngày tháng, tên người hay sự thật không có trong dữ liệu đầu vào.
2. Tất cả nhận định phải dựa trên 📌 DỮ KIỆN THỰC TẾ được cung cấp.
3. Phân định rõ ràng đâu là Dữ kiện thực tế (Fact) và đâu là Nhận định / Gợi ý của AI.
4. Chỉ đạo phải có tính khả thi, nêu rõ hướng giải quyết (đẩy nhanh, báo cáo giải trình, tạm dừng, phối hợp phòng ban).`;

    const promptText = `Dữ liệu nhiệm vụ thực tế từ báo cáo:
- Mã công việc: ${task.code}
- Tiêu đề: ${task.title}
- Đơn vị phụ trách: ${task.section}
- Cán bộ thực hiện: ${task.assignee} (Phối hợp: ${task.coAssignees?.join(', ') || 'Không'})
- Tiến độ: ${task.progress}%
- Hạn hoàn thành: ${task.deadline || 'Theo tiến độ'}
- Mức độ ưu tiên: ${task.priority || 'Bình thường'}
- Yêu cầu ban đầu: ${task.requirement}
- Vướng mắc/khó khăn do cán bộ báo cáo: ${task.difficulties || 'Không có'}
- Báo cáo tiến độ gần nhất: ${task.currentReport || 'Đang thực hiện'}

Hãy trả về JSON danh sách 3 gợi ý chỉ đạo đôn đốc theo phong cách khác nhau (Quyết liệt/Hỗ trợ tháo gỡ/Ấn định mốc báo cáo).`;

    const callPromise = aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: 'Tiêu đề ngắn của hướng chỉ đạo' },
                  content: { type: Type.STRING, description: 'Nội dung chi tiết câu chỉ đạo đôn đốc' },
                  tone: { type: Type.STRING, description: 'Trạng thái phong cách (vd: Đôn đốc quyết liệt, Tháo gỡ vướng mắc, Ấn định thời hạn)' },
                  recommendedDeadline: { type: Type.STRING, description: 'Gợi ý ngày hạn mới YYYY-MM-DD nếu cần thiết, hoặc rỗng' },
                  isUrgent: { type: Type.BOOLEAN, description: 'Có nên gắn nhãn HỎA TỐC không' },
                  reasoning: { type: Type.STRING, description: 'Căn cứ nhận định của AI từ dữ kiện thực tế' },
                },
                required: ['title', 'content', 'tone', 'isUrgent', 'reasoning'],
              },
            },
          },
          required: ['suggestions'],
        },
      },
    });

    const aiResult = (await withTimeout(callPromise, 8000)) as any;
    const responseText = aiResult.text || '';
    const parsedData = JSON.parse(responseText);

    return res.json({
      success: true,
      isFallback: false,
      facts,
      suggestions: parsedData.suggestions || [],
      disclaimer: '📌 LƯU Ý: AI chỉ đóng vai trò trợ lý gợi ý dựa trên báo cáo thực tế. Quyết định chỉ đạo thuộc thẩm quyền chuyên môn của Lãnh đạo.',
      usage: { remainingToday: rateCheck.remaining, totalUsed: rateCheck.totalUsed },
    });
  } catch (error: any) {
    console.error('Error generating AI directive suggestions:', error);
    // Return structured rule-based fallback if timeout or internal error occurs
    const task = req.body?.task || {};
    const fallbackSuggestions = generateRuleBasedFallback(task);

    return res.json({
      success: true,
      isFallback: true,
      fallbackReason: error.message === 'AI_TIMEOUT_EXCEEDED' 
        ? 'Quá thời gian phản hồi (tối đa 8 giây). Đã kích hoạt chế độ mẫu chỉ đạo dự phòng.' 
        : 'Có lỗi xảy ra trong quá trình xử lý AI. Đã chuyển sang mẫu chỉ đạo tự động.',
      facts: [
        `Mã nhiệm vụ: ${task.code || 'N/A'}`,
        `Tên nhiệm vụ: ${task.title || 'N/A'}`,
        `Tiến độ: ${task.progress || 0}%`,
        `Vướng mắc: ${task.difficulties || 'Không'}`,
      ],
      suggestions: fallbackSuggestions,
      disclaimer: '📌 LƯU Ý: AI chỉ đóng vai trò trợ lý gợi ý dựa trên báo cáo thực tế. Quyết định chỉ đạo thuộc thẩm quyền chuyên môn của Lãnh đạo.',
      usage: { remainingToday: 49, totalUsed: 1 },
    });
  }
});

// REST API: Quick AI Draft Task Content
app.post('/api/ai/draft-task', async (req, res) => {
  try {
    const { promptText, section, user } = req.body;

    if (!user) {
      return res.status(401).json({ error: 'Chưa xác thực thông tin người dùng.' });
    }

    const isLeaderRole = user.isLeader || user.role === 'admin' || user.role === 'leader';
    if (!isLeaderRole) {
      return res.status(403).json({ error: 'Chỉ Lãnh đạo mới có quyền sử dụng công cụ soạn nhanh nhiệm vụ.' });
    }

    const userId = user.id || user.username || 'unknown_user';
    const rateCheck = checkAndIncrementRateLimit(userId);
    if (!rateCheck.allowed) {
      return res.status(429).json({ error: `Đã vượt quá giới hạn lượt dùng AI trong ngày.` });
    }

    const aiClient = getGenAIClient();
    if (!aiClient) {
      return res.json({
        success: true,
        isFallback: true,
        draft: {
          code: `PS-${Math.floor(Math.random() * 900 + 100)}`,
          title: promptText.slice(0, 80),
          category: 'Nhiệm vụ phát sinh',
          requirement: `Yêu cầu triển khai chi tiết: ${promptText}. Đảm bảo chất lượng và báo cáo tiến độ định kỳ.`,
          priority: 'normal',
        },
      });
    }

    const callPromise = aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Phân tích yêu cầu ngắn của Lãnh đạo: "${promptText}" (Khối: ${section || 'Chưa chọn'}).
Trả về cấu trúc nhiệm vụ hành chính chuẩn gồm: Mã gợi ý, Tiêu đề nhiệm vụ ngắn gọn, Loại công việc, Yêu cầu kết luận cụ thể, Mức ưu tiên (normal, high, urgent).`,
      config: {
        systemInstruction: 'Bạn là bộ soạn thảo công văn nhiệm vụ cho Trung tâm Dịch vụ Tổng hợp Hố Nai. Chuẩn hóa ý kiến thô của Lãnh đạo thành nhiệm vụ rõ ràng, chuyên nghiệp.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            code: { type: Type.STRING },
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            requirement: { type: Type.STRING },
            priority: { type: Type.STRING, enum: ['normal', 'high', 'urgent'] },
          },
          required: ['code', 'title', 'category', 'requirement', 'priority'],
        },
      },
    });

    const aiResult = (await withTimeout(callPromise, 8000)) as any;
    const parsed = JSON.parse(aiResult.text || '{}');

    return res.json({
      success: true,
      isFallback: false,
      draft: parsed,
    });
  } catch (error: any) {
    console.error('Error drafting task via AI:', error);
    return res.json({
      success: true,
      isFallback: true,
      draft: {
        code: `PS-${Math.floor(Math.random() * 900 + 100)}`,
        title: req.body?.promptText || 'Nhiệm vụ mới',
        category: 'Nhiệm vụ phát sinh',
        requirement: `Yêu cầu thực hiện theo đúng chỉ đạo: ${req.body?.promptText || ''}.`,
        priority: 'normal',
      },
    });
  }
});

// REST API: AI Executive Report Summary
app.post('/api/ai/report-summary', async (req, res) => {
  try {
    const { filterOptions, tasks, user } = req.body;

    if (!user) {
      return res.status(401).json({ error: 'Chưa xác thực thông tin người dùng.' });
    }

    const userId = user.id || user.username || 'unknown_user';
    const rateCheck = checkAndIncrementRateLimit(userId);
    if (!rateCheck.allowed) {
      return res.status(429).json({ error: 'Đã đạt giới hạn lượt sử dụng AI Báo cáo trong ngày.' });
    }

    const total = tasks ? tasks.length : 0;
    const completed = tasks ? tasks.filter((t: any) => t.status === 'completed').length : 0;
    const delayed = tasks ? tasks.filter((t: any) => t.status === 'delayed' || (t.status !== 'completed' && t.deadline && new Date(t.deadline) < new Date())).length : 0;
    const inProgress = total - completed - delayed;

    // Compact payload to reduce token count and accelerate latency (completes in ~2-4s)
    const compactTasks = tasks ? tasks.slice(0, 30) : [];
    const factsText = compactTasks.length > 0
      ? compactTasks.map((t: any) => `- [${t.code}] ${t.title.slice(0, 80)} (${t.section}): ${t.progress}%, ${t.status}, Hạn: ${t.deadline || 'K/o'}${t.difficulties ? `, VM: ${t.difficulties.slice(0, 60)}` : ''}`).join('\n')
      : 'Không có nhiệm vụ nào trong kỳ báo cáo này.';

    const aiClient = getGenAIClient();

    if (!aiClient) {
      const fallbackReport = generateRuleBasedReportFallback(tasks, filterOptions);
      return res.json({
        success: true,
        isFallback: true,
        fallbackReason: 'Không tìm thấy API Key Gemini. Hệ thống tự động trích xuất báo cáo từ bộ quy tắc tổng hợp.',
        report: fallbackReport,
        usage: { remainingToday: rateCheck.remaining, totalUsed: rateCheck.totalUsed },
      });
    }

    const systemInstruction = `Bạn là Trợ lý Tổng hợp Báo cáo Cao cấp cho Ban Giám Đốc Trung tâm Dịch vụ Tổng hợp Hố Nai.
Nhiệm vụ của bạn là tổng hợp báo cáo giao ban ngắn gọn, chuyên nghiệp, chính xác theo chuẩn văn bản hành chính công vụ Việt Nam.

NGUYÊN TẮC BẮT BUỘC (ZERO HALLUCINATION):
1. Tuyệt đối KHÔNG tự bịa đặt số liệu hay tên công việc ngoài danh sách nhiệm vụ được cung cấp.
2. Báo cáo phải phản ánh chính xác tình hình thực tế, làm nổi bật nhiệm vụ trễ hạn, có vướng mắc và đề xuất giải pháp chỉ đạo cụ thể.`;

    const promptText = `Kỳ báo cáo: ${filterOptions?.datePreset || 'Tùy chỉnh'} (Từ ${filterOptions?.fromDate || 'đầu kỳ'} đến ${filterOptions?.toDate || 'cuối kỳ'}).
Phòng ban lọc: ${filterOptions?.selectedDepartment || 'Tất cả phòng ban'}.

Thống kê chung:
- Tổng số nhiệm vụ: ${total}
- Đã hoàn thành: ${completed} (${total > 0 ? Math.round((completed/total)*100) : 0}%)
- Trễ hạn/Khó khăn: ${delayed}
- Đang triển khai: ${inProgress}

Danh sách chi tiết nhiệm vụ trong kỳ:
${factsText}

Hãy tạo Báo cáo Tổng hợp AI chuẩn hóa theo định dạng JSON.`;

    const callPromise = aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING, description: 'Đoạn tổng quan tình hình báo cáo chung của toàn Trung tâm' },
            keyAchievements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Danh sách các kết quả nổi bật đã hoàn thành'
            },
            delayedRisks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  taskCode: { type: Type.STRING },
                  taskTitle: { type: Type.STRING },
                  assignee: { type: Type.STRING },
                  issue: { type: Type.STRING },
                  suggestedAction: { type: Type.STRING },
                },
                required: ['taskCode', 'taskTitle', 'assignee', 'issue', 'suggestedAction'],
              },
              description: 'Danh sách các điểm nóng/vướng mắc chậm tiến độ cần Lãnh đạo đôn đốc',
            },
            sectionEvaluations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sectionName: { type: Type.STRING },
                  taskCount: { type: Type.INTEGER },
                  completedCount: { type: Type.INTEGER },
                  evaluation: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ['Tốt', 'Khá', 'Đạt', 'Cần đôn đốc'] },
                },
                required: ['sectionName', 'taskCount', 'completedCount', 'evaluation', 'status'],
              },
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Các đề xuất chỉ đạo của AI cho Ban Giám Đốc trong phiên giao ban',
            },
          },
          required: ['executiveSummary', 'keyAchievements', 'delayedRisks', 'sectionEvaluations', 'recommendations'],
        },
      },
    });

    // Timeout extended to 25 seconds for maximum safety & stability
    const aiResult = (await withTimeout(callPromise, 25000)) as any;
    const parsedReport = JSON.parse(aiResult.text || '{}');

    return res.json({
      success: true,
      isFallback: false,
      report: parsedReport,
      usage: { remainingToday: rateCheck.remaining, totalUsed: rateCheck.totalUsed },
    });
  } catch (error: any) {
    console.warn('AI report summary generation warning (falling back to rule-based report):', error?.message || error);
    const fallbackReport = generateRuleBasedReportFallback(req.body?.tasks, req.body?.filterOptions);
    return res.json({
      success: true,
      isFallback: true,
      fallbackReason: error?.message === 'AI_TIMEOUT_EXCEEDED'
        ? 'Thời gian chờ AI phản hồi vượt quá 25s. Đã chuyển sang báo cáo tổng hợp tự động từ CSDL.'
        : 'Đã kích hoạt báo cáo tổng hợp quy tắc tự động.',
      report: fallbackReport,
      usage: { remainingToday: 49, totalUsed: 1 },
    });
  }
});

// REST API: Interactive AI Chatbox Helper for Staff
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { userMessage, user, tasks } = req.body;

    if (!user) {
      return res.status(401).json({ error: 'Chưa xác thực thông tin người dùng.' });
    }

    if (!userMessage || !userMessage.trim()) {
      return res.status(400).json({ error: 'Nội dung tin nhắn không được để rỗng.' });
    }

    const userId = user.id || user.username || 'unknown_user';
    const rateCheck = checkAndIncrementRateLimit(userId);
    if (!rateCheck.allowed) {
      return res.status(429).json({ error: 'Bạn đã hết lượt hỏi AI ChatBox trong ngày.' });
    }

    const compactTasks = tasks ? tasks.slice(0, 25) : [];
    const tasksSummaryText = compactTasks.length > 0
      ? compactTasks.map((t: any) => `- Mã [${t.code}] ${t.title.slice(0, 60)} (${t.section}) | Phụ trách: ${t.assignee} | Tiến độ: ${t.progress}% | Trạng thái: ${t.status} | Hạn: ${t.deadline || 'Không'}${t.difficulties ? ` | VM: ${t.difficulties.slice(0, 40)}` : ''}`).join('\n')
      : 'Hiện chưa có danh sách nhiệm vụ.';

    const systemInstruction = `Bạn là Trợ Lý AI Hỏi Đáp Công Vụ thông minh của Trung tâm Dịch vụ Tổng hợp Phường Hố Nai.
Cán bộ đang trò chuyện với bạn: ${user.fullName} (${user.position || 'Cán bộ'}, ${user.unit || 'Tổ chuyên môn'}).

NHIỆM VỤ:
Trả lời lịch sự, thân thiện, chính xác các thắc mắc của cán bộ về danh sách công việc, tiến độ, thời hạn, vướng mắc, cách báo cáo hoặc thông tin các Tổ chuyên môn.

DỮ LIỆU NHIỆM VỤ THỰC TẾ TRÊN HỆ THỐNG:
${tasksSummaryText}

NGUYÊN TẮC TRẢ LỜI:
1. Trả lời ngắn gọn, lịch sự (2-4 câu), đúng trọng tâm.
2. Dùng dữ liệu nhiệm vụ thực tế ở trên để giải đáp chính xác mã việc, người phụ trách, hạn chót và tiến độ %.
3. Nếu cán bộ hỏi cách báo cáo tiến độ, hướng dẫn bấm nút "Xem việc" hoặc nút "Báo cáo tiến độ" trên giao diện.`;

    const aiClient = getGenAIClient();

    if (!aiClient) {
      const fallbackReply = generateChatFallbackResponse(userMessage, compactTasks, user);
      return res.json({
        success: true,
        reply: fallbackReply,
        isFallback: true,
        usage: { remainingToday: rateCheck.remaining, totalUsed: rateCheck.totalUsed },
      });
    }

    const callPromise = aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userMessage,
      config: {
        systemInstruction,
      },
    });

    // Timeout extended to 20s for maximum network tolerance and response stability
    const aiResult = (await withTimeout(callPromise, 20000)) as any;
    const replyText = aiResult.text || 'Dạ, tôi đã nhận được thông tin. Bạn có cần hỗ trợ thêm gì về công việc không ạ?';

    return res.json({
      success: true,
      reply: replyText,
      isFallback: false,
      usage: { remainingToday: rateCheck.remaining, totalUsed: rateCheck.totalUsed },
    });
  } catch (error: any) {
    console.warn('AI Chat error (using rule fallback):', error?.message || error);
    const fallbackReply = generateChatFallbackResponse(req.body?.userMessage || '', req.body?.tasks || [], req.body?.user);
    return res.json({
      success: true,
      reply: fallbackReply,
      isFallback: true,
      usage: { remainingToday: 49, totalUsed: 1 },
    });
  }
});

// Rule-based fallback for AI Chat when offline or timing out
function generateChatFallbackResponse(msg: string, tasks: any[], user: any): string {
  const q = msg.toLowerCase();
  const userName = user?.fullName || 'Đồng chí';

  if (q.includes('trễ') || q.includes('quá hạn') || q.includes('chậm')) {
    const delayed = tasks.filter((t) => t.status === 'delayed' || (t.status !== 'completed' && t.deadline && new Date(t.deadline) < new Date()));
    if (delayed.length > 0) {
      const listStr = delayed.slice(0, 3).map((t) => `• [${t.code}] ${t.title} (${t.assignee} phụ trách)`).join('\n');
      return `Dạ chào ${userName}, hiện hệ thống ghi nhận ${delayed.length} nhiệm vụ có dấu hiệu trễ hạn:\n${listStr}\nĐề nghị đồng chí đôn đốc cán bộ báo cáo giải trình ạ!`;
    }
    return `Dạ chào ${userName}, hiện tại không có nhiệm vụ nào bị trễ hạn ạ!`;
  }

  if (q.includes('báo cáo') || q.includes('cập nhật')) {
    return `Chào ${userName}, để báo cáo tiến độ công việc, đồng chí vui lòng chọn nhiệm vụ trong danh sách, sau đó nhấn nút "Báo cáo tiến độ" để nhập % hoàn thành và gửi báo cáo nhé!`;
  }

  if (q.includes('việc của tôi') || q.includes('nhiệm vụ của tôi')) {
    const myTasks = tasks.filter((t) => (t.assignee || '').toLowerCase().includes((userName || '').toLowerCase()));
    if (myTasks.length > 0) {
      const myStr = myTasks.slice(0, 3).map((t) => `• [${t.code}] ${t.title} - Tiến độ ${t.progress}%`).join('\n');
      return `Dạ thưa ${userName}, danh sách công việc do đồng chí phụ trách gồm:\n${myStr}`;
    }
    return `Dạ chào ${userName}, đồng chí có thể xem danh sách công việc của mình trong màn hình Cổng Báo Cáo Viên Chức ạ!`;
  }

  return `Dạ chào ${userName}, tôi là Trợ lý AI TTDVTH Phường Hố Nai. Tôi có thể giúp đồng chí tra cứu tiến độ công việc, danh sách trễ hạn và hướng dẫn báo cáo công tác. Đồng chí cần hỗ trợ thông tin gì ạ?`;
}

// Rule-based Fallback Generator when Gemini API is unavailable or times out
function generateRuleBasedFallback(task: any) {
  const hasDiff = task.difficulties && task.difficulties.trim().length > 0;
  const isLagging = (task.progress || 0) < 50;

  return [
    {
      title: 'Chỉ đạo tháo gỡ vướng mắc & tăng tốc',
      content: hasDiff
        ? `Giao đồng chí ${task.assignee || 'phụ trách'} chủ động xử lý vướng mắc "${task.difficulties}", phối hợp các bên liên quan hoàn thành trước hạn.`
        : `Yêu cầu đồng chí ${task.assignee || 'phụ trách'} tập trung nhân lực đẩy nhanh tiến độ, đảm bảo khối lượng công việc đúng kế hoạch.`,
      tone: 'Đôn đốc & Hỗ trợ',
      recommendedDeadline: task.deadline || '',
      isUrgent: isLagging,
      reasoning: hasDiff 
        ? 'Dựa trên báo cáo vướng mắc từ cán bộ phụ trách.' 
        : 'Dựa trên tiến độ hiện tại của nhiệm vụ.',
    },
    {
      title: 'Yêu cầu báo cáo chi tiết & ấn định thời hạn',
      content: `Yêu cầu đồng chí ${task.assignee || 'phụ trách'} làm văn bản giải trình rõ tiến độ và phương án hoàn thiện chi tiết trước 17h00 ngày mai.`,
      tone: 'Ấn định thời hạn',
      recommendedDeadline: '',
      isUrgent: false,
      reasoning: 'Đảm bảo tính tuân thủ báo cáo định kỳ theo quy chế giao ban.',
    },
    {
      title: 'Phối hợp liên phòng ban tháo gỡ',
      content: `Đề nghị cán bộ phụ trách phối hợp chặt chẽ với các bộ phận liên quan thuộc Trung tâm và UBND phường để dứt điểm thủ tục.`,
      tone: 'Phối hợp xử lý',
      recommendedDeadline: '',
      isUrgent: false,
      reasoning: 'Gợi ý tăng cường kết nối liên phòng ban để tháo gỡ quy trình.',
    },
  ];
}

// Rule-based Fallback Generator for Full AI Reports
function generateRuleBasedReportFallback(tasks: any[] = [], filterOptions: any = {}) {
  const total = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const delayedTasks = tasks.filter((t) => t.status === 'delayed' || (t.status !== 'completed' && t.deadline && new Date(t.deadline) < new Date()));
  const completedRate = total > 0 ? Math.round((completedTasks.length / total) * 100) : 0;

  // Group by section
  const sectionsMap = new Map<string, { total: number; completed: number }>();
  tasks.forEach((t) => {
    const sec = t.section || 'Nhiệm vụ chung';
    const cur = sectionsMap.get(sec) || { total: 0, completed: 0 };
    cur.total += 1;
    if (t.status === 'completed') cur.completed += 1;
    sectionsMap.set(sec, cur);
  });

  const sectionEvaluations = Array.from(sectionsMap.entries()).map(([sectionName, stats]) => {
    const rate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    let status: 'Tốt' | 'Khá' | 'Đạt' | 'Cần đôn đốc' = 'Đạt';
    if (rate >= 80) status = 'Tốt';
    else if (rate >= 60) status = 'Khá';
    else if (rate < 40) status = 'Cần đôn đốc';

    return {
      sectionName,
      taskCount: stats.total,
      completedCount: stats.completed,
      evaluation: `Tổ ${sectionName} đạt tỷ lệ hoàn thành ${rate}% (${stats.completed}/${stats.total} nhiệm vụ).`,
      status,
    };
  });

  const delayedRisks = delayedTasks.map((t) => ({
    taskCode: t.code || 'N/A',
    taskTitle: t.title || 'Không có tiêu đề',
    assignee: t.assignee || 'Cán bộ phụ trách',
    issue: t.difficulties || 'Chậm tiến độ so với kế hoạch ban đầu',
    suggestedAction: `Yêu cầu đ/c ${t.assignee} báo cáo giải trình và tập trung hoàn thành dứt điểm.`,
  }));

  const keyAchievements = completedTasks.slice(0, 5).map((t) =>
    `Hoàn thành xuất sắc nhiệm vụ "${t.title}" (${t.code}) do đ/c ${t.assignee} phụ trách.`
  );

  return {
    executiveSummary: `Trong kỳ báo cáo, toàn Trung tâm triển khai tổng số ${total} nhiệm vụ. Trong đó có ${completedTasks.length} nhiệm vụ đã hoàn thành (${completedRate}%), ${delayedTasks.length} nhiệm vụ có nguy cơ trễ hạn cần tập trung đôn đốc tháo gỡ.`,
    keyAchievements: keyAchievements.length > 0 ? keyAchievements : ['Các nhiệm vụ đang được triển khai đúng tiến độ đề ra.'],
    delayedRisks: delayedRisks.length > 0 ? delayedRisks : [],
    sectionEvaluations,
    recommendations: [
      'Tiếp tục đôn đốc sát sao các nhiệm vụ trọng điểm phát sinh ngoài giao ban.',
      'Yêu cầu các Tổ trưởng chủ động rà soát quy trình và phối hợp UBND phường để tháo gỡ vướng mắc.',
    ],
  };
}

// Vite integration for Development / Static serving for Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 App Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
