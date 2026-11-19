import { masterApi } from '../baseApi';

export const integrationsApi = masterApi.injectEndpoints({
  endpoints: (builder) => ({
    getQuickBooksOverview: builder.query({
      query: (params) => ({
        url: '/admin/integrations/quickbooks/overview',
        params: typeof params === 'string' ? { companyId: params } : params,
      }),
      transformResponse: (response) => response?.data || response || {},
      providesTags: ['QuickBooks', 'Company'],
    }),

    saveQuickBooksCredentials: builder.mutation({
      query: (body) => ({
        url: '/admin/integrations/quickbooks/credentials',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['QuickBooks'],
    }),

    disconnectQuickBooks: builder.mutation({
      query: (body) => ({
        url: '/admin/integrations/quickbooks/disconnect',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['QuickBooks'],
    }),

    triggerQuickBooksSync: builder.mutation({
      query: (body) => ({
        url: '/admin/integrations/quickbooks/sync',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['QuickBooks', 'SyncQueue', 'Invoices', 'BankAccounts'],
    }),

    getCalendarEvents: builder.query({
      query: (params) => ({
        url: '/admin/integrations/calendar/events',
        params: typeof params === 'string' ? { companyId: params } : params,
      }),
      transformResponse: (response) => (Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []),
      providesTags: ['CalendarEvents'],
    }),

    createCalendarEvent: builder.mutation({
      query: (body) => ({
        url: '/admin/integrations/calendar/events',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CalendarEvents'],
    }),

    deleteCalendarEvent: builder.mutation({
      query: ({ id, companyId }) => ({
        url: `/admin/integrations/calendar/events/${id}`,
        method: 'DELETE',
        params: { companyId },
      }),
      invalidatesTags: ['CalendarEvents'],
    }),

    triggerCalendarSync: builder.mutation({
      query: (body) => ({
        url: '/admin/integrations/calendar/sync',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CalendarEvents', 'SyncQueue'],
    }),

    getNotifications: builder.query({
      query: (params) => ({
        url: '/admin/integrations/notifications',
        params,
      }),
      transformResponse: (response) => (Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []),
      providesTags: ['Notifications'],
    }),

    markNotificationRead: builder.mutation({
      query: (id) => ({
        url: `/admin/integrations/notifications/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications'],
    }),

    markAllNotificationsRead: builder.mutation({
      query: (companyId) => ({
        url: '/admin/integrations/notifications/mark-all-read',
        method: 'POST',
        params: { companyId },
      }),
      invalidatesTags: ['Notifications'],
    }),

    dismissNotification: builder.mutation({
      query: (id) => ({
        url: `/admin/integrations/notifications/${id}/dismiss`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications'],
    }),

    getNotificationRules: builder.query({
      query: (params) => ({
        url: '/admin/integrations/notification-rules',
        params: typeof params === 'string' ? { companyId: params } : params,
      }),
      transformResponse: (response) => (Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []),
      providesTags: ['NotificationRules'],
    }),

    toggleNotificationRule: builder.mutation({
      query: ({ id, isActive, companyId }) => ({
        url: `/admin/integrations/notification-rules/${id}`,
        method: 'PUT',
        body: { isActive, companyId },
      }),
      invalidatesTags: ['NotificationRules'],
    }),

    getSyncQueue: builder.query({
      query: (params) => ({
        url: '/admin/integrations/queue',
        params: typeof params === 'string' ? { companyId: params } : params,
      }),
      transformResponse: (response) => (Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []),
      providesTags: ['SyncQueue'],
    }),

    retrySyncJob: builder.mutation({
      query: (id) => ({
        url: `/admin/integrations/queue/${id}/retry`,
        method: 'POST',
      }),
      invalidatesTags: ['SyncQueue', 'QuickBooks'],
    }),

    cancelSyncJob: builder.mutation({
      query: (id) => ({
        url: `/admin/integrations/queue/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['SyncQueue'],
    }),

    getIntegrationLogs: builder.query({
      query: (params) => ({
        url: '/admin/integrations/logs',
        params: typeof params === 'string' ? { companyId: params } : params,
      }),
      transformResponse: (response) => (Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []),
      providesTags: ['IntegrationLogs'],
    }),
  }),
});

export const {
  useGetQuickBooksOverviewQuery,
  useSaveQuickBooksCredentialsMutation,
  useDisconnectQuickBooksMutation,
  useTriggerQuickBooksSyncMutation,
  useGetCalendarEventsQuery,
  useCreateCalendarEventMutation,
  useDeleteCalendarEventMutation,
  useTriggerCalendarSyncMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDismissNotificationMutation,
  useGetNotificationRulesQuery,
  useToggleNotificationRuleMutation,
  useGetSyncQueueQuery,
  useRetrySyncJobMutation,
  useCancelSyncJobMutation,
  useGetIntegrationLogsQuery,
} = integrationsApi;
