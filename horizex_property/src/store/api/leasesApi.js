import { masterApi } from '../baseApi';

export const leasesApi = masterApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeases: builder.query({
      query: (params) => ({
        url: '/admin/leases',
        params,
      }),
      transformResponse: (response) => response.data || [],
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Leases', id })), { type: 'Leases', id: 'LIST' }]
          : [{ type: 'Leases', id: 'LIST' }],
    }),
    getLeaseById: builder.query({
      query: (id) => `/admin/leases/${id}`,
      transformResponse: (response) => response.data,
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
  useRenewLeaseMutation,
  useAddMoveInspectionMutation,
} = leasesApi;

