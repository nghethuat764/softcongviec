import { Task } from '../types';
import { UserAccount } from '../types/database';

export interface DelayedRiskItem {
  taskCode: string;
  taskTitle: string;
  assignee: string;
  issue: string;
  suggestedAction: string;
}

export interface SectionEvaluationItem {
  sectionName: string;
  taskCount: number;
  completedCount: number;
  evaluation: string;
  status: 'Tốt' | 'Khá' | 'Đạt' | 'Cần đôn đốc';
}

export interface AiReportSummary {
  executiveSummary: string;
  keyAchievements: string[];
  delayedRisks: DelayedRiskItem[];
  sectionEvaluations: SectionEvaluationItem[];
  recommendations: string[];
}

export interface AiReportResponse {
  success: boolean;
  isFallback?: boolean;
  fallbackReason?: string;
  report?: AiReportSummary;
  usage?: {
    remainingToday: number;
    totalUsed: number;
  };
  error?: string;
}

export interface ReportFilterOptions {
  datePreset?: string;
  fromDate?: string;
  toDate?: string;
  dateFieldFilter?: string;
  selectedDepartment?: string;
  selectedStaffId?: string;
  statusFilter?: string;
}

/**
 * Fetch AI Executive Report Summary based on filtered tasks and user context.
 */
export async function fetchAiReportSummary(
  filterOptions: ReportFilterOptions,
  tasks: Task[],
  user: UserAccount | null
): Promise<AiReportResponse> {
  try {
    const res = await fetch('/api/ai/report-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filterOptions, tasks, user }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || `Lỗi máy chủ (${res.status})`,
      };
    }

    return data;
  } catch (err: any) {
    console.error('Failed to fetch AI report summary:', err);
    return {
      success: false,
      error: 'Không thể kết nối đến máy chủ AI Báo cáo. Vui lòng kiểm tra lại mạng.',
    };
  }
}
