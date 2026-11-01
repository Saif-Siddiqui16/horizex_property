import { masterApi } from '../baseApi';

export const accountingApi = masterApi.injectEndpoints({
  endpoints: (builder) => ({
    getInvoices: builder.query({
      query: (params) => ({
        url: '/admin/invoices',
        params,
      }),
      transformResponse: (response) => response.data || [],
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Invoices', id })), { type: 'Invoices', id: 'LIST' }]
          : [{ type: 'Invoices', id: 'LIST' }],
    }),
    getPaymentsReceived: builder.query({
      query: () => '/admin/payments-received',
      transformResponse: (response) => response.data || [],
      providesTags: ['Payments'],
    }),
    getOutstandingDues: builder.query({
      query: () => '/admin/outstanding-dues',
      transformResponse: (response) => response.data || [],
      providesTags: ['Invoices', 'Payments'],
    }),
    // Single Place to Collect Rent
    recordPayment: builder.mutation({
      query: (body) => ({
        url: '/admin/payments',
        method: 'POST',
        body,
      }),
      // CROSS-SCREEN LIVE SYNC (ARCHITECTURE.md Section 2.1)
      invalidatesTags: ['Payments', 'Invoices', 'Units', 'Dashboard', 'BankAccounts'],
    }),
    getBankAccounts: builder.query({
      query: () => '/admin/accounts',
      transformResponse: (response) => response.data || [],
      providesTags: ['BankAccounts'],
    }),
    createBankAccount: builder.mutation({
      query: (body) => ({
        url: '/admin/accounts',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['BankAccounts'],
    }),
  }),
});

export const {
  useGetInvoicesQuery,
  useGetPaymentsReceivedQuery,
  useGetOutstandingDuesQuery,
  useRecordPaymentMutation,
  useGetBankAccountsQuery,
  useCreateBankAccountMutation,
} = accountingApi;

