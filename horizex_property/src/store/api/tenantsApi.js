import { masterApi } from '../baseApi';

export const tenantsApi = masterApi.injectEndpoints({
  endpoints: (builder) => ({
    getTenants: builder.query({
      query: (params) => ({
        url: '/admin/tenants',
        params,
      }),
      transformResponse: (response) => response.data || [],
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Tenants', id })), { type: 'Tenants', id: 'LIST' }]
          : [{ type: 'Tenants', id: 'LIST' }],
    }),
    getTenantById: builder.query({
      query: (id) => `/admin/tenants/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: 'Tenants', id }],
    }),
    createTenant: builder.mutation({
      query: (body) => ({
        url: '/admin/tenants',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Tenants', id: 'LIST' }],
    }),
    updateTenant: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/tenants/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Tenants', id }, { type: 'Tenants', id: 'LIST' }],
    }),

    // Vehicles
    getVehicles: builder.query({
      query: () => '/admin/tenants/vehicles',
      transformResponse: (response) => response.data || [],
      providesTags: ['Tenants'],
    }),
    createVehicle: builder.mutation({
      query: (body) => ({
        url: '/admin/tenants/vehicles',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Tenants'],
    }),
  }),
});

export const {
  useGetTenantsQuery,
  useGetTenantByIdQuery,
  useCreateTenantMutation,
  useUpdateTenantMutation,
  useGetVehiclesQuery,
  useCreateVehicleMutation,
} = tenantsApi;

