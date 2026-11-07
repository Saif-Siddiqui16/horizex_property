import { masterApi } from '../baseApi';

export const ownerPortalApi = masterApi.injectEndpoints({
  endpoints: (builder) => ({
    getOwnerProfile: builder.query({
      query: () => '/owner/profile',
      transformResponse: (res) => (res?.data !== undefined ? res.data : res),
      providesTags: [{ type: 'OwnerProfile', id: 'ME' }],
    }),

    getOwnerDashboardStats: builder.query({
      query: () => '/owner/dashboard/stats',
      transformResponse: (res) => (res?.data !== undefined ? res.data : res),
      providesTags: [{ type: 'OwnerDashboard', id: 'STATS' }],
    }),

    getOwnerFinancialPulse: builder.query({
      query: () => '/owner/dashboard/financial-pulse',
      transformResponse: (res) => (res?.data !== undefined ? res.data : res),
      providesTags: [{ type: 'OwnerDashboard', id: 'PULSE' }, { type: 'OwnerFinancials', id: 'PULSE' }],
    }),

    getOwnerProperties: builder.query({
      query: () => '/owner/properties',
      transformResponse: (res) => (res?.data !== undefined ? res.data : res),
      providesTags: [{ type: 'OwnerProperties', id: 'LIST' }],
    }),

    getOwnerFinancials: builder.query({
      query: (params) => ({
        url: '/owner/financials',
        params,
      }),
      transformResponse: (res) => (res?.data !== undefined ? res.data : res),
      providesTags: [{ type: 'OwnerFinancials', id: 'LIST' }],
    }),

    getOwnerReports: builder.query({
      query: () => '/owner/reports',
      transformResponse: (res) => (res?.data !== undefined ? res.data : res),
      providesTags: [{ type: 'OwnerReports', id: 'LIST' }],
    }),

    getOwnerRentRoll: builder.query({
      query: (params) => ({
        url: '/owner/reports/rent-roll',
        params,
      }),
      transformResponse: (res) => (res?.data !== undefined ? res.data : res),
      providesTags: [{ type: 'OwnerRentRoll', id: 'LIST' }],
    }),

    getOwnerConversations: builder.query({
      query: () => '/owner/communication/conversations',
      transformResponse: (res) => (res?.data !== undefined ? res.data : res),
      providesTags: [{ type: 'OwnerChat', id: 'CONVERSATIONS' }],
    }),

    getOwnerChatHistory: builder.query({
      query: (adminId) => ({
        url: '/owner/communication/history',
        params: adminId ? { adminId } : undefined,
      }),
      transformResponse: (res) => (res?.data !== undefined ? res.data : res),
      providesTags: [{ type: 'OwnerChat', id: 'HISTORY' }],
    }),

    sendOwnerMessage: builder.mutation({
      query: (body) => ({
        url: '/owner/communication/send',
        method: 'POST',
        body,
      }),
      transformResponse: (res) => (res?.data !== undefined ? res.data : res),
      invalidatesTags: [{ type: 'OwnerChat', id: 'HISTORY' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetOwnerProfileQuery,
  useGetOwnerDashboardStatsQuery,
  useGetOwnerFinancialPulseQuery,
  useGetOwnerPropertiesQuery,
  useGetOwnerFinancialsQuery,
  useGetOwnerReportsQuery,
  useGetOwnerRentRollQuery,
  useGetOwnerConversationsQuery,
  useGetOwnerChatHistoryQuery,
  useSendOwnerMessageMutation,
} = ownerPortalApi;
