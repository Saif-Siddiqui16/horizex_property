import { masterApi } from '../baseApi';

export const employeesApi = masterApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query({
      query: (params) => ({
        url: '/admin/employees',
        params,
      }),
      transformResponse: (response) => {
        if (response && response.data !== undefined) return response.data;
        if (Array.isArray(response)) return response;
        return [];
      },
      providesTags: (result) =>
        Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: 'Employees', id })),
              { type: 'Employees', id: 'LIST' },
            ]
          : [{ type: 'Employees', id: 'LIST' }],
    }),

    getEmployeeById: builder.query({
      query: (id) => `/admin/employees/${id}`,
      transformResponse: (response) => {
        if (response && response.data !== undefined) return response.data;
        return response;
      },
      providesTags: (result, error, id) => [{ type: 'Employees', id }],
    }),

    createEmployee: builder.mutation({
      query: (body) => ({
        url: '/admin/employees',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Employees', id: 'LIST' }],
    }),

    updateEmployee: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/employees/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Employees', id },
        { type: 'Employees', id: 'LIST' },
      ],
    }),

    deleteEmployee: builder.mutation({
      query: (id) => ({
        url: `/admin/employees/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Employees', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} = employeesApi;

