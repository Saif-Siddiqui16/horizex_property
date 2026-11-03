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
} = payrollApi;

