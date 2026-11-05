import { createSlice } from '@reduxjs/toolkit';

const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('accessToken');

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  accessToken: storedToken || null,
  role: storedUser ? JSON.parse(storedUser).role : null,
  isAuthenticated: !!storedToken,
  effectiveCompanyId: null,
  permissions: [], // Secure in-memory permissions matrix (never persisted in unencrypted localStorage)
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, permissions } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.role = user?.role || null;
      state.isAuthenticated = true;
      if (permissions) {
        state.permissions = permissions;
      }

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', accessToken);
    },
    setPermissions: (state, action) => {
      state.permissions = action.payload || [];
    },
    tokenRefreshed: (state, action) => {
      const { accessToken } = action.payload;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      localStorage.setItem('accessToken', accessToken);
    },
    setCompanyContext: (state, action) => {
      state.effectiveCompanyId = action.payload;
    },
    loggedOut: (state) => {
      state.user = null;
      state.accessToken = null;
      state.role = null;
      state.permissions = [];
      state.isAuthenticated = false;
      state.effectiveCompanyId = null;

      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('permissions'); // Clear any legacy localstorage key
    },
  },
});

export const { setCredentials, setPermissions, tokenRefreshed, setCompanyContext, loggedOut } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.accessToken;
export const selectCurrentRole = (state) => state.auth.role;
export const selectUserPermissions = (state) => state.auth.permissions;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

export default authSlice.reducer;
