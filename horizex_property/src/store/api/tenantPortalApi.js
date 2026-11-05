import { masterApi } from '../baseApi';

export const tenantPortalApi = masterApi.injectEndpoints({
  endpoints: (builder) => ({
    getTenantProfile: builder.query({
      query: () => '/tenant/profile',
      transformResponse: (res) => (res?.data !== undefined ? res.data : res),
      providesTags: [{ type: 'TenantProfile', id: 'ME' }],
    }),

    getTenantDashboard: builder.query({
      query: () => '/tenant/dashboard',
      transformResponse: (res) => (res?.data !== undefined ? res.data : res),
      providesTags: [{ type: 'TenantDashboard', id: 'ME' }],
    }),

    getTenantLease: builder.query({
      query: () => '/tenant/lease',
      transformResponse: (res) => (res?.data !== undefined ? res.data : res),
      providesTags: [{ type: 'TenantLease', id: 'ME' }],
    }),

    getTenantInvoices: builder.query({
      query: () => '/tenant/invoices',
      transformResponse: (res) => (res?.data !== undefined ? res.data : res),
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
            ...result.map(({ id }) => ({ type: 'TenantInvoices', id })),
            { type: 'TenantInvoices', id: 'LIST' },
          ]
          : [{ type: 'TenantInvoices', id: 'LIST' }],
    }),

    payTenantInvoice: builder.mutation({
      query: (body) => ({
        url: '/tenant/pay',
        method: 'POST',
        body,
      }),
      transformResponse: (res) => (res?.data !== undefined ? res.data : res),
      invalidatesTags: [
        { type: 'TenantInvoices', id: 'LIST' },
        { type: 'TenantDashboard', id: 'ME' },
        { type: 'TenantReports', id: 'ME' },
      ],
    }),

    getTenantTickets: builder.query({
      query: () => '/tenant/tickets',
      transformResponse: (res) => (res?.data !== undefined ? res.data : res),
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
            ...result.map(({ id }) => ({ type: 'TenantTickets', id })),
            { type: 'TenantTickets', id: 'LIST' },
          ]
          : [{ type: 'TenantTickets', id: 'LIST' }],
    }),

    createTenantTicket: builder.mutation({
      query: (body) => ({
        url: '/tenant/tickets',
        method: 'POST',
        body,
      }),
      transformResponse: (res) => (res?.data !== undefined ? res.data : res),
      invalidatesTags: [
        { type: 'TenantTickets', id: 'LIST' },
        { type: 'TenantDashboard', id: 'ME' },
      ],
    }),

    getTenantVehicles: builder.query({
      query: () => '/tenant/vehicles',
      transformResponse: (res) => (res?.data !== undefined ? res.data : res),
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
            ...result.map(({ id }) => ({ type: 'TenantVehicles', id })),
            { type: 'TenantVehicles', id: 'LIST' },
          ]
          : [{ type: 'TenantVehicles', id: 'LIST' }],
    }),

    addTenantVehicle: builder.mutation({
      query: (body) => ({
        url: '/tenant/vehicles',
        method: 'POST',
        body,
      }),
      transformResponse: (res) => (res?.data !== undefined ? res.data : res),
      invalidatesTags: [
        { type: 'TenantVehicles', id: 'LIST' },
        { type: 'TenantDashboard', id: 'ME' },
      ],
    }),

    deleteTenantVehicle: builder.mutation({
      query: (id) => ({
        url: `/tenant/vehicles/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (res) => (res?.data !== undefined ? res.data : res),
      invalidatesTags: [
        { type: 'TenantVehicles', id: 'LIST' },
        { type: 'TenantDashboard', id: 'ME' },
      ],
    }),

    getTenantDocuments: builder.query({
      query: () => '/tenant/documents',
      transformResponse: (res) => (res?.data !== undefined ? res.data : res),
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
            ...result.map(({ id }) => ({ type: 'TenantDocuments', id })),
            { type: 'TenantDocuments', id: 'LIST' },
          ]
          : [{ type: 'TenantDocuments', id: 'LIST' }],
    }),

    uploadTenantDocument: builder.mutation({
      query: (body) => ({
        url: '/tenant/documents',
        method: 'POST',
        body,
      }),
      transformResponse: (res) => (res?.data !== undefined ? res.data : res),
      invalidatesTags: [{ type: 'TenantDocuments', id: 'LIST' }],
    }),

    getTenantInsurance: builder.query({
      query: () => '/tenant/insurance',
      transformResponse: (res) => (res?.data !== undefined ? res.data : res),
      providesTags: [{ type: 'TenantInsurance', id: 'ME' }],
    }),

    updateTenantInsurance: builder.mutation({
      query: (body) => ({
        url: '/tenant/insurance',
        method: 'POST',
        body,
      }),
      transformResponse: (res) => (res?.data !== undefined ? res.data : res),
      invalidatesTags: [{ type: 'TenantInsurance', id: 'ME' }],
    }),

    getTenantReports: builder.query({
      query: () => '/tenant/reports',
      transformResponse: (res) => (res?.data !== undefined ? res.data : res),
      providesTags: [{ type: 'TenantReports', id: 'ME' }],
    }),
  }),
});

export const {
  useGetTenantProfileQuery,
  useGetTenantDashboardQuery,
  useGetTenantLeaseQuery,
  useGetTenantInvoicesQuery,
  usePayTenantInvoiceMutation,
  useGetTenantTicketsQuery,
  useCreateTenantTicketMutation,
  useGetTenantVehiclesQuery,
  useAddTenantVehicleMutation,
  useDeleteTenantVehicleMutation,
  useGetTenantDocumentsQuery,
  useUploadTenantDocumentMutation,
  useGetTenantInsuranceQuery,
  useUpdateTenantInsuranceMutation,
  useGetTenantReportsQuery,
} = tenantPortalApi;

