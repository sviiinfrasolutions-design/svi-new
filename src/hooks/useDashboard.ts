import { useGetApi } from './useApi';

export interface DashboardAnalytics {
  totalUsers: number;
  newUsersThisMonth: number;
  userGrowth: { date: string; count: number }[];
  documentStats: { type: string; count: number }[];
  activities: {
    id: string;
    action: string;
    created_at: string;
    user?: { full_name?: string };
  }[];
}

/**
 * Fetch dashboard analytics with built-in caching (30s stale time).
 *
 * @example
 * const { data: analytics, isLoading } = useDashboardAnalytics(token);
 */
export function useDashboardAnalytics(token: string | null) {
  return useGetApi<DashboardAnalytics>(['dashboard', 'analytics'], '/api/admin/analytics', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    enabled: !!token,
  });
}

/**
 * Fetch recent activities.
 *
 * @example
 * const { data: activities } = useDashboardActivities(token, 10);
 */
export function useDashboardActivities(token: string | null, limit = 10) {
  return useGetApi<{ activities: DashboardAnalytics['activities'] }>(
    ['dashboard', 'activities', String(limit)],
    `/api/admin/activities?limit=${limit}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      enabled: !!token,
    }
  );
}
