import { masterApi } from '../baseApi';

export const leasesApi = masterApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeases: builder.query({
      query: (params) => ({
        url: '/admin/leases',
        params,
      }),
      transformResponse: (response) => {
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response)) return response;
        return response?.data || [];
      },
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [...result.map(({ id }) => ({ type: 'Leases', id })), { type: 'Leases', id: 'LIST' }]
          : [{ type: 'Leases', id: 'LIST' }],
    }),
    getLeaseById: builder.query({
      query: (id) => `/admin/leases/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (result, error, id) => [{ type: 'Leases', id }],
    }),
    createLease: builder.mutation({
      query: (body) => ({
        url: '/admin/leases',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Leases', id: 'LIST' }, 'Units', 'Invoices', 'Dashboard'],
    }),
    updateLease: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/leases/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Leases', id },
        { type: 'Leases', id: 'LIST' },
        'Dashboard',
      ],
    }),
    deleteLease: builder.mutation({
      query: (id) => ({
        url: `/admin/leases/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Leases', id: 'LIST' }, 'Units', 'Dashboard'],
    }),
    sendLeaseCredentials: builder.mutation({
      query: (id) => ({
        url: `/admin/leases/${id}/send-credentials`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Leases', id }],
    }),
    renewLease: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/leases/${id}/renew`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Leases', id }, 'Renewals'],
    }),
    addMoveInspection: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/leases/${id}/inspections`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Leases', id }, 'Readiness'],
    }),
  }),
});

export const {
  useGetLeasesQuery,
  useGetLeaseByIdQuery,
  useCreateLeaseMutation,
  useUpdateLeaseMutation,
  useDeleteLeaseMutation,
  useSendLeaseCredentialsMutation,
  useRenewLeaseMutation,
  useAddMoveInspectionMutation,
} = leasesApi;
