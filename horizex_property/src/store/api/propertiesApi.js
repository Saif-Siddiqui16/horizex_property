import { masterApi } from '../baseApi';

export const propertiesApi = masterApi.injectEndpoints({
  endpoints: (builder) => ({
    getProperties: builder.query({
      query: (params) => ({
        url: '/admin/properties',
        params,
      }),
      transformResponse: (response) => {
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response)) return response;
        return [];
      },
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [...result.map(({ id }) => ({ type: 'Properties', id })), { type: 'Properties', id: 'LIST' }]
          : [{ type: 'Properties', id: 'LIST' }],
    }),
    getPropertyById: builder.query({
      query: (id) => `/admin/properties/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (result, error, id) => [{ type: 'Properties', id }],
    }),
    createProperty: builder.mutation({
      query: (body) => ({
        url: '/admin/properties',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Properties', id: 'LIST' }, 'Dashboard', 'Company'],
    }),
    updateProperty: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/properties/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Properties', id },
        { type: 'Properties', id: 'LIST' },
        'Company',
      ],
    }),
    deleteProperty: builder.mutation({
      query: (id) => ({
        url: `/admin/properties/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Properties', id: 'LIST' }, 'Dashboard', 'Company'],
    }),

    // Owners query for building assignment
    getOwners: builder.query({
      query: () => '/admin/owners',
      transformResponse: (response) => {
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response)) return response;
        return [];
      },
      providesTags: ['Users'],
    }),

    // Units
    getUnits: builder.query({
      query: (params) => ({
        url: '/admin/units',
        params,
      }),
      transformResponse: (response) => {
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response)) return response;
        return [];
      },
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [...result.map(({ id }) => ({ type: 'Units', id })), { type: 'Units', id: 'LIST' }]
          : [{ type: 'Units', id: 'LIST' }],
    }),
    getUnitById: builder.query({
      query: (id) => `/admin/units/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (result, error, id) => [{ type: 'Units', id }],
    }),
    createUnit: builder.mutation({
      query: (body) => ({
        url: '/admin/units',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Units', id: 'LIST' }, { type: 'Properties', id: 'LIST' }, 'Dashboard'],
    }),
    updateUnit: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/units/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Units', id },
        { type: 'Units', id: 'LIST' },
        { type: 'Properties', id: 'LIST' },
        'Dashboard',
      ],
    }),
    deleteUnit: builder.mutation({
      query: (id) => ({
        url: `/admin/units/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Units', id: 'LIST' }, { type: 'Properties', id: 'LIST' }, 'Dashboard'],
    }),

    // Unit Types
    getUnitTypes: builder.query({
      query: () => '/admin/unit-types',
      transformResponse: (response) => {
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response)) return response;
        return [];
      },
      providesTags: ['UnitTypes'],
    }),
    createUnitType: builder.mutation({
      query: (body) => ({
        url: '/admin/unit-types',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['UnitTypes'],
    }),
    updateUnitType: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/unit-types/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['UnitTypes'],
    }),
    deleteUnitType: builder.mutation({
      query: (id) => ({
        url: `/admin/unit-types/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['UnitTypes'],
    }),
  }),
});

export const {
  useGetPropertiesQuery,
  useGetPropertyByIdQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  useGetOwnersQuery,
  useGetUnitsQuery,
  useGetUnitByIdQuery,
  useLazyGetUnitByIdQuery,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitMutation,
  useGetUnitTypesQuery,
  useCreateUnitTypeMutation,
  useUpdateUnitTypeMutation,
  useDeleteUnitTypeMutation,
} = propertiesApi;
