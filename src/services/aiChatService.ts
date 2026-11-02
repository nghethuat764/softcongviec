import { Task } from '../types';
import { UserAccount } from '../types/database';

export interface AiChatResponse {
  success: boolean;
  reply: string;
  isFallback?: boolean;
  usage?: {
    remainingToday: number;
    totalUsed: number;
  };
  error?: string;
}

/**
 * Sends a chat message to the server-side AI Chatbot endpoint for staff assistance.
 */
export async function sendAiChatMessage(
  userMessage: string,
  user: UserAccount | null,
  tasks: Task[]
): Promise<AiChatResponse> {
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage,
        user,
        tasks,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        reply: data.error || 'Dịch vụ Trợ lý AI hiện không sẵn sàng. Vui lòng thử lại sau.',
        error: data.error || `Lỗi từ máy chủ (${res.status})`,
      };
    }

    return data;
  } catch (err: any) {
    console.error('Failed to send AI chat message:', err);
    return {
      success: false,
      reply: 'Không thể kết nối với hệ thống Trợ lý AI. Vui lòng kiểm tra lại mạng internet.',
      error: 'Lỗi kết nối mạng.',
    };
  }
}
