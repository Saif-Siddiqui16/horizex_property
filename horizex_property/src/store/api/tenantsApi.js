import { masterApi } from '../baseApi';

export const tenantsApi = masterApi.injectEndpoints({
  endpoints: (builder) => ({
    getTenants: builder.query({
      query: (params) => ({
        url: '/admin/tenants',
        params,
      }),
      transformResponse: (response) => {
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response)) return response;
        return [];
      },
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [...result.map(({ id }) => ({ type: 'Tenants', id })), { type: 'Tenants', id: 'LIST' }]
          : [{ type: 'Tenants', id: 'LIST' }],
    }),
    getTenantById: builder.query({
      query: (id) => `/admin/tenants/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (result, error, id) => [{ type: 'Tenants', id }],
    }),
    createTenant: builder.mutation({
      query: (body) => ({
        url: '/admin/tenants',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Tenants', id: 'LIST' }, 'Dashboard'],
    }),
    updateTenant: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/tenants/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Tenants', id },
        { type: 'Tenants', id: 'LIST' },
        'Dashboard',
      ],
    }),
    deleteTenant: builder.mutation({
      query: (id) => ({
        url: `/admin/tenants/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Tenants', id: 'LIST' }, 'Dashboard'],
    }),
    sendTenantInvite: builder.mutation({
      query: ({ id, methods }) => ({
        url: `/admin/tenants/${id}/send-invite`,
        method: 'POST',
        body: { methods },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Tenants', id }],
    }),

    // Vacant Bedrooms
    getVacantBedrooms: builder.query({
      query: ({ unitId, includeId } = {}) => {
        let url = `/admin/units/bedrooms/vacant?unitId=${unitId || ''}`;
        if (includeId) url += `&includeId=${includeId}`;
        return url;
      },
      transformResponse: (response) => {
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response)) return response;
        return [];
      },
    }),

    // Vehicles
    getVehicles: builder.query({
      query: () => '/admin/tenants/vehicles',
      transformResponse: (response) => {
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response)) return response;
        return [];
      },
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
  useLazyGetTenantByIdQuery,
  useCreateTenantMutation,
  useUpdateTenantMutation,
  useDeleteTenantMutation,
  useSendTenantInviteMutation,
  useGetVacantBedroomsQuery,
  useGetVehiclesQuery,
  useCreateVehicleMutation,
} = tenantsApi;
