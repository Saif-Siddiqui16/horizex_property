import { masterApi } from '../baseApi';

export const reportsApi = masterApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomReport: builder.query({
      query: (params) => ({
        url: '/admin/reports/custom-builder',
        params,
      }),
      transformResponse: (response) => response?.data || response || {},
      providesTags: ['CustomReport'],
    }),

    fetchCustomReport: builder.mutation({
      query: (body) => ({
        url: '/admin/reports/custom-builder',
        method: 'POST',
        body,
      }),
      transformResponse: (response) => response?.data || response || {},
    }),

    getReportTemplates: builder.query({
      query: (params) => ({
        url: '/admin/reports/templates',
        params: typeof params === 'string' ? { module: params } : params,
      }),
      transformResponse: (response) => (Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []),
      providesTags: ['ReportTemplates'],
    }),

    saveReportTemplate: builder.mutation({
      query: (body) => ({
        url: '/admin/reports/templates',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ReportTemplates'],
    }),

    deleteReportTemplate: builder.mutation({
      query: (id) => ({
        url: `/admin/reports/templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ReportTemplates'],
    }),

    getReportAuditLogs: builder.query({
      query: (params) => ({
        url: '/admin/reports/audit-logs',
        params,
      }),
      transformResponse: (response) => (Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []),
      providesTags: ['ReportAuditLogs'],
    }),

    logReportAudit: builder.mutation({
      query: (body) => ({
        url: '/admin/reports/audit-logs',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ReportAuditLogs'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCustomReportQuery,
  useFetchCustomReportMutation,
  useGetReportTemplatesQuery,
  useSaveReportTemplateMutation,
  useDeleteReportTemplateMutation,
  useGetReportAuditLogsQuery,
  useLogReportAuditMutation,
} = reportsApi;
