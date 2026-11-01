import { masterApi } from '../baseApi';

export const maintenanceApi = masterApi.injectEndpoints({
  endpoints: (builder) => ({
    getTickets: builder.query({
      query: (params) => ({
        url: '/admin/tickets',
        params,
      }),
      transformResponse: (response) => response.data || [],
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Tickets', id })), { type: 'Tickets', id: 'LIST' }]
          : [{ type: 'Tickets', id: 'LIST' }],
    }),
    getTicketById: builder.query({
      query: (id) => `/admin/tickets/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: 'Tickets', id }],
    }),
    createTicket: builder.mutation({
      query: (body) => ({
        url: '/admin/tickets',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Tickets', id: 'LIST' }, 'Dashboard'],
    }),
    updateTicketStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/tickets/${id}/status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Tickets', id },
        { type: 'Tickets', id: 'LIST' },
        'Readiness',
        'Dashboard',
      ],
    }),
    assignTicket: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/tickets/${id}/assign`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Tickets', id }, { type: 'Tickets', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useGetTicketByIdQuery,
  useCreateTicketMutation,
  useUpdateTicketStatusMutation,
  useAssignTicketMutation,
} = maintenanceApi;

