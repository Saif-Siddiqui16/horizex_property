import { masterApi } from '../baseApi';

export const extraApi = masterApi.injectEndpoints({
  endpoints: (builder) => ({
    // Insurance
    getInsurance: builder.query({
      query: () => '/admin/insurance',
      transformResponse: (response) => response.data || [],
      providesTags: ['Insurance'],
    }),
    createInsurance: builder.mutation({
      query: (body) => ({
        url: '/admin/insurance',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Insurance'],
    }),

    // Notes Hub
    getNotes: builder.query({
      query: (params) => ({
        url: '/admin/notes',
        params,
      }),
      transformResponse: (response) => response.data || [],
      providesTags: ['Notes'],
    }),
    createNote: builder.mutation({
      query: (body) => ({
        url: '/admin/notes',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Notes'],
    }),

    // Clock Logs & Timesheet
    getClockLogs: builder.query({
      query: () => '/admin/clock-logs',
      transformResponse: (response) => response.data || [],
      providesTags: ['ClockLogs'],
    }),
    clockIn: builder.mutation({
      query: (body = {}) => ({
        url: '/admin/clock-in',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ClockLogs'],
    }),
    clockOut: builder.mutation({
      query: (body = {}) => ({
        url: '/admin/clock-out',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ClockLogs'],
    }),
  }),
});

export const {
  useGetInsuranceQuery,
  useCreateInsuranceMutation,
  useGetNotesQuery,
  useCreateNoteMutation,
  useGetClockLogsQuery,
  useClockInMutation,
  useClockOutMutation,
} = extraApi;

