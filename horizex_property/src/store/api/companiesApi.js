import { masterApi } from '../baseApi';

export const companiesApi = masterApi.injectEndpoints({
  endpoints: (builder) => ({
    getCompanies: builder.query({
      query: (params) => ({
        url: '/admin/companies',
        params,
      }),
      transformResponse: (response) => {
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response)) return response;
        return [];
      },
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: 'Company', id })),
              { type: 'Company', id: 'LIST' },
            ]
          : [{ type: 'Company', id: 'LIST' }],
    }),

    getCompanyById: builder.query({
      query: (id) => `/admin/companies/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (result, error, id) => [{ type: 'Company', id }],
    }),

    createCompany: builder.mutation({
      query: (body) => ({
        url: '/admin/companies',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Company', id: 'LIST' }, 'Dashboard'],
    }),

    updateCompany: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/companies/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Company', id },
        { type: 'Company', id: 'LIST' },
      ],
    }),

    deleteCompany: builder.mutation({
      query: (id) => ({
        url: `/admin/companies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Company', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetCompaniesQuery,
  useGetCompanyByIdQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
} = companiesApi;

