import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiDelete } from '@/src/lib/api/fetcher';

// ── Attendance Analytics ─────────────────────────────────────────────────

export interface AttendanceAnalytics {
  today: {
    present: number;
    absent: number;
    half_day: number;
    leave: number;
    total: number;
    rate: number;
  };
  weeklyTrend: Array<{ date: string; rate: number }>;
  monthlyBreakdown: Array<{ name: string; count: number }>;
  thirtyDayTrend: Array<{ date: string; rate: number }>;
}

export function useAttendanceAnalytics() {
  return useQuery<AttendanceAnalytics>({
    queryKey: ['admin', 'attendance', 'analytics'],
    queryFn: () => apiGet<AttendanceAnalytics>('/api/admin/attendance/analytics'),
    staleTime: 30_000,
    retry: 1,
  });
}

// ── Chat Logs ────────────────────────────────────────────────────────────

interface ChatLog {
  id: string;
  session_id: string;
  message_count: number;
  user_message_count: number;
  created_at: string;
  updated_at: string;
  user_agent: string;
  messages: string;
}

interface ChatLogsResponse {
  logs: ChatLog[];
  pagination: {
    totalPages: number;
    page: number;
  };
}

export function useChatLogs(page: number) {
  return useQuery<ChatLogsResponse>({
    queryKey: ['admin', 'chat-logs', page],
    queryFn: () =>
      apiGet<ChatLogsResponse>('/api/chat/log', {
        params: { page: String(page), limit: '20' },
      }),
  });
}

export function useClearChatLogs() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => apiDelete<void>('/api/chat/log', { params: { all: 'true' } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'chat-logs'] });
    },
  });
}
