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
      query: (params) => ({
        url: '/admin/clock-logs',
        params,
      }),
      transformResponse: (response) => {
        const raw = response?.data || response || [];
        if (!Array.isArray(raw)) return [];
        return raw.map(log => {
          let meta = {};
          if (log.notes) {
            try {
              meta = typeof log.notes === 'string' ? JSON.parse(log.notes) : log.notes;
            } catch (e) {
              meta = {};
            }
          }
          const user = log.staff?.user || {};
          const clockInDate = log.clockIn ? log.clockIn.split('T')[0] : '';
          return {
            id: log.id,
            employeeId: user.id || log.staffId,
            employeeName: user.firstName ? `${user.firstName} ${user.lastName}` : (log.employeeName || 'Staff Member'),
            employeeNo: user.email ? `EMP-${user.email.slice(0, 4).toUpperCase()}` : '',
            department: log.staff?.department || 'Operations',
            date: clockInDate,
            clockIn: log.clockIn,
            clockOut: log.clockOut,
            breakStart: meta.breakStart || null,
            breakEnd: meta.breakEnd || null,
            totalHours: log.totalHours ? Number(log.totalHours) : 0,
            overtimeHours: meta.overtimeHours ? Number(meta.overtimeHours) : 0,
            status: meta.status || 'Present',
            ...meta,
          };
        });
      },
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

