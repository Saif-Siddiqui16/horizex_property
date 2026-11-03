import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';
import { tokenRefreshed, loggedOut } from './authSlice';

const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:5000/api',
  credentials: 'include', // Automatically passes HttpOnly cookies
  prepareHeaders: (headers, { getState }) => {
    const token = getState()?.auth?.accessToken || localStorage.getItem('accessToken');
    if (token) {
      headers.set('authorization', 'Bearer ' + token);
    }

    const effectiveCompanyId = getState()?.auth?.effectiveCompanyId || localStorage.getItem('companyContext') || localStorage.getItem('global_selected_company_id');
    if (effectiveCompanyId) {
      headers.set('x-company-context', effectiveCompanyId);
    }

    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshResult = await baseQuery(
          { url: '/auth/refresh', method: 'POST' },
          api,
          extraOptions
        );

        if (refreshResult.data && refreshResult.data.data?.accessToken) {
          api.dispatch(tokenRefreshed({ accessToken: refreshResult.data.data.accessToken }));
          // Retry original query with new token
          result = await baseQuery(args, api, extraOptions);
        } else {
          api.dispatch(loggedOut());
        }
      } catch (err) {
        api.dispatch(loggedOut());
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const masterApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Auth',
    'Company',
    'Properties',
    'Units',
    'Readiness',
    'Tenants',
    'Leases',
    'Renewals',
    'Invoices',
    'Payments',
    'BankAccounts',
    'Tickets',
    'TalCases',
    'Dashboard',
    'UnitTypes',
    'Insurance',
    'Notes',
    'ClockLogs',
    'Employees',
    'Shifts',
    'Leaves',
    'Overtime',
    'Payroll',
  ],
  endpoints: () => ({}),
});

