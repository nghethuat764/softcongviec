import { Task } from '../types';
import { UserAccount } from '../types/database';

export interface AiDirectiveSuggestion {
  title: string;
  content: string;
  tone: string;
  recommendedDeadline?: string;
  isUrgent: boolean;
  reasoning: string;
}

export interface AiDirectiveResponse {
  success: boolean;
  isFallback?: boolean;
  fallbackReason?: string;
  facts: string[];
  suggestions: AiDirectiveSuggestion[];
  disclaimer: string;
  usage?: {
    remainingToday: number;
    totalUsed: number;
  };
  error?: string;
}

export interface AiTaskDraftResponse {
  success: boolean;
  isFallback?: boolean;
  draft: {
    code: string;
    title: string;
    category: string;
    requirement: string;
    priority: 'normal' | 'high' | 'urgent';
  };
  error?: string;
}

/**
 * Fetch AI-generated directive suggestions based on task context and logged-in user permissions.
 */
export async function fetchAiDirectiveSuggestions(
  task: Task,
  user: UserAccount | null
): Promise<AiDirectiveResponse> {
  try {
    const res = await fetch('/api/ai/directive-suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ task, user }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        facts: [],
        suggestions: [],
        disclaimer: 'Không thể kết nối dịch vụ AI Trợ lý.',
        error: data.error || `Lỗi từ máy chủ (${res.status})`,
      };
    }

    return data;
  } catch (err: any) {
    console.error('Failed to fetch AI directive suggestions:', err);
    return {
      success: false,
      facts: [],
      suggestions: [],
      disclaimer: 'Không kết nối được dịch vụ mạng.',
      error: 'Không thể kết nối đến máy chủ AI. Vui lòng kiểm tra lại đường truyền.',
    };
  }
}

/**
 * Request AI to draft structured task parameters from raw text prompt.
 */
export async function fetchAiTaskDraft(
  promptText: string,
  section: string,
  user: UserAccount | null
): Promise<AiTaskDraftResponse> {
  try {
    const res = await fetch('/api/ai/draft-task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ promptText, section, user }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        draft: {
          code: `PS-${Math.floor(Math.random() * 900 + 100)}`,
          title: promptText.slice(0, 80),
          category: 'Nhiệm vụ phát sinh',
          requirement: promptText,
          priority: 'normal',
        },
        error: data.error || 'Lỗi kết nối máy chủ',
      };
    }

    return data;
  } catch (err: any) {
    console.error('Failed to draft task via AI:', err);
    return {
      success: false,
      draft: {
        code: `PS-${Math.floor(Math.random() * 900 + 100)}`,
        title: promptText.slice(0, 80),
        category: 'Nhiệm vụ phát sinh',
        requirement: promptText,
        priority: 'normal',
      },
      error: 'Lỗi mạng khi kết nối máy chủ AI.',
    };
  }
}
