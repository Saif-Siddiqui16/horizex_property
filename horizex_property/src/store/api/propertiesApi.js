import { masterApi } from '../baseApi';

export const propertiesApi = masterApi.injectEndpoints({
  endpoints: (builder) => ({
    getProperties: builder.query({
      query: (params) => ({
        url: '/admin/properties',
        params,
      }),
      transformResponse: (response) => response.data || [],
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Properties', id })), { type: 'Properties', id: 'LIST' }]
          : [{ type: 'Properties', id: 'LIST' }],
    }),
    getPropertyById: builder.query({
      query: (id) => `/admin/properties/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: 'Properties', id }],
    }),
    createProperty: builder.mutation({
      query: (body) => ({
        url: '/admin/properties',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Properties', id: 'LIST' }, 'Dashboard'],
    }),
    updateProperty: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/properties/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Properties', id }, { type: 'Properties', id: 'LIST' }],
    }),
    deleteProperty: builder.mutation({
      query: (id) => ({
        url: `/admin/properties/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Properties', id: 'LIST' }, 'Dashboard'],
    }),

    // Units
    getUnits: builder.query({
      query: (params) => ({
        url: '/admin/units',
        params,
      }),
      transformResponse: (response) => response.data || [],
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Units', id })), { type: 'Units', id: 'LIST' }]
          : [{ type: 'Units', id: 'LIST' }],
    }),
    getUnitById: builder.query({
      query: (id) => `/admin/units/${id}`,
      transformResponse: (response) => response.data,
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
      invalidatesTags: (result, error, { id }) => [{ type: 'Units', id }, { type: 'Units', id: 'LIST' }, 'Dashboard'],
    }),

    // Unit Types
    getUnitTypes: builder.query({
      query: () => '/admin/unit-types',
      transformResponse: (response) => response.data || [],
      providesTags: ['UnitTypes'],
    }),
  }),
});

export const {
  useGetPropertiesQuery,
  useGetPropertyByIdQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  useGetUnitsQuery,
  useGetUnitByIdQuery,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useGetUnitTypesQuery,
} = propertiesApi;

