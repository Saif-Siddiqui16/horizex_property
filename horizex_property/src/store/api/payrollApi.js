import { masterApi } from '../baseApi';

export const payrollApi = masterApi.injectEndpoints({
  endpoints: (builder) => ({
    // -------------------------------------------------------------
    // SHIFTS
    // -------------------------------------------------------------
    getShifts: builder.query({
      query: (params) => ({
        url: '/admin/shifts',
        params,
      }),
      transformResponse: (response) => response?.data || response || [],
      providesTags: ['Shifts'],
    }),
    createShift: builder.mutation({
      query: (body) => ({
        url: '/admin/shifts',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Shifts'],
    }),
    updateShift: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/shifts/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Shifts'],
    }),
    deleteShift: builder.mutation({
      query: (id) => ({
        url: `/admin/shifts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Shifts'],
    }),

    // -------------------------------------------------------------
    // LEAVES
    // -------------------------------------------------------------
    getLeaves: builder.query({
      query: (params) => ({
        url: '/admin/leaves',
        params,
      }),
      transformResponse: (response) => response?.data || response || [],
      providesTags: ['Leaves'],
    }),
    createLeave: builder.mutation({
      query: (body) => ({
        url: '/admin/leaves',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Leaves'],
    }),
    updateLeaveStatus: builder.mutation({
      query: ({ id, status, reason, rejectionReason }) => ({
        url: `/admin/leaves/${id}/status`,
        method: 'PATCH',
        body: { status, reason, rejectionReason },
      }),
      invalidatesTags: ['Leaves'],
    }),
    deleteLeave: builder.mutation({
      query: (id) => ({
        url: `/admin/leaves/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Leaves'],
    }),

    // -------------------------------------------------------------
    // OVERTIME
    // -------------------------------------------------------------
    getOvertime: builder.query({
      query: (params) => ({
        url: '/admin/overtime',
        params,
      }),
      transformResponse: (response) => response?.data || response || [],
      providesTags: ['Overtime'],
    }),
    createOvertime: builder.mutation({
      query: (body) => ({
        url: '/admin/overtime',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Overtime'],
    }),
    updateOvertimeStatus: builder.mutation({
      query: ({ id, status, paidStatus }) => ({
        url: `/admin/overtime/${id}/status`,
        method: 'PATCH',
        body: { status, paidStatus },
      }),
      invalidatesTags: ['Overtime'],
    }),
    deleteOvertime: builder.mutation({
      query: (id) => ({
        url: `/admin/overtime/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Overtime'],
    }),

    // -------------------------------------------------------------
    // PAYROLL RUNS
    // -------------------------------------------------------------
    getPayrollRuns: builder.query({
      query: (params) => ({
        url: '/admin/payroll/runs',
        params,
      }),
      transformResponse: (response) => response?.data || response || [],
      providesTags: ['Payroll'],
    }),
    generatePayroll: builder.mutation({
      query: (body) => ({
        url: '/admin/payroll/runs/generate',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Payroll', 'Overtime', 'Leaves'],
    }),
    createPayrollRun: builder.mutation({
      query: (body) => ({
        url: '/admin/payroll/runs',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Payroll'],
    }),
    approvePayroll: builder.mutation({
      query: ({ id, level = 1 }) => ({
        url: `/admin/payroll/runs/${id}/approve`,
        method: 'PATCH',
        body: { level },
      }),
      invalidatesTags: ['Payroll', 'Overtime'],
    }),
    rejectPayroll: builder.mutation({
      query: ({ id, reason = '' }) => ({
        url: `/admin/payroll/runs/${id}/reject`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: ['Payroll'],
    }),
    markPaidPayroll: builder.mutation({
      query: (id) => ({
        url: `/admin/payroll/runs/${id}/pay`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Payroll'],
    }),
    uploadPayrollReceipt: builder.mutation({
      query: ({ id, receiptFile }) => ({
        url: `/admin/payroll/runs/${id}/receipt`,
        method: 'POST',
        body: { receiptFile },
      }),
      invalidatesTags: ['Payroll'],
    }),
  }),
});

export const {
  useGetShiftsQuery,
  useCreateShiftMutation,
  useUpdateShiftMutation,
  useDeleteShiftMutation,
  useGetLeavesQuery,
  useCreateLeaveMutation,
  useUpdateLeaveStatusMutation,
  useDeleteLeaveMutation,
  useGetOvertimeQuery,
  useCreateOvertimeMutation,
  useUpdateOvertimeStatusMutation,
  useDeleteOvertimeMutation,
  useGetPayrollRunsQuery,
  useGeneratePayrollMutation,
  useCreatePayrollRunMutation,
  useApprovePayrollMutation,
  useRejectPayrollMutation,
  useMarkPaidPayrollMutation,
  useUploadPayrollReceiptMutation,
} = payrollApi;

