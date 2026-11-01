import { masterApi } from '../baseApi';

export const analyticsApi = masterApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => '/admin/dashboard/stats',
      transformResponse: (response) => response.data || {},
      providesTags: ['Dashboard'],
    }),
    getRevenueTrajectory: builder.query({
      query: () => '/admin/analytics/revenue',
      transformResponse: (response) => response.data || [],
      providesTags: ['Dashboard'],
    }),
    getVacancyAnalytics: builder.query({
      query: () => '/admin/analytics/vacancy',
      transformResponse: (response) => response.data || [],
      providesTags: ['Dashboard', 'Units'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetRevenueTrajectoryQuery,
  useGetVacancyAnalyticsQuery,
} = analyticsApi;

