import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './authSlice';
import uiReducer from './uiSlice';
import { masterApi } from './baseApi';

// Import domain APIs so their endpoints are injected into masterApi
import './api/authApi';
import './api/companiesApi';
import './api/propertiesApi';
import './api/readinessApi';
import './api/tenantsApi';
import './api/leasesApi';
import './api/accountingApi';
import './api/maintenanceApi';
import './api/talCasesApi';
import './api/analyticsApi';
import './api/mediaApi';
import './api/extraApi';
import './api/employeesApi';
import './api/payrollApi';
import './api/coworkersApi';
import './api/tenantPortalApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    [masterApi.reducerPath]: masterApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(masterApi.middleware),
});

setupListeners(store.dispatch);

// Re-export actions & selectors
export * from './authSlice';
export * from './uiSlice';
export * from './baseApi';

// Re-export all API hooks
export * from './api/authApi';
export * from './api/companiesApi';
export * from './api/propertiesApi';
export * from './api/readinessApi';
export * from './api/tenantsApi';
export * from './api/leasesApi';
export * from './api/accountingApi';
export * from './api/maintenanceApi';
export * from './api/talCasesApi';
export * from './api/analyticsApi';
export * from './api/mediaApi';
export * from './api/extraApi';
export * from './api/employeesApi';
export * from './api/payrollApi';
export * from './api/coworkersApi';
export * from './api/tenantPortalApi';
