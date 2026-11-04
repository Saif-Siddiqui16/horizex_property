import { masterApi } from '../baseApi';

export const analyticsApi = masterApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: (params) => ({
        url: '/admin/dashboard/stats',
        params,
      }),
      transformResponse: (response) => response.data || {},
      providesTags: ['Dashboard'],
    }),
    getRevenueTrajectory: builder.query({
      query: (params) => ({
        url: '/admin/analytics/revenue',
        params,
      }),
      transformResponse: (response) => response.data || [],
      providesTags: ['Dashboard'],
    }),
    getVacancyAnalytics: builder.query({
      query: (params) => ({
        url: '/admin/analytics/vacancy',
        params,
      }),
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
