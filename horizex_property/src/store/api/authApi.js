import { masterApi } from '../baseApi';
import { setCredentials, loggedOut } from '../authSlice';

export const authApi = masterApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data) {
            dispatch(setCredentials(data.data));
          }
        } catch (error) {
          // handled in component
        }
      },
      invalidatesTags: ['Auth'],
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(loggedOut());
        } catch (error) {
          dispatch(loggedOut());
        }
      },
      invalidatesTags: ['Auth'],
    }),
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),
    getProfile: builder.query({
      query: () => '/auth/profile',
      transformResponse: (response) => response?.data || response,
      providesTags: ['Profile', 'Auth'],
    }),
    updateProfile: builder.mutation({
      query: (body) => ({
        url: '/auth/profile',
        method: 'PATCH',
        body,
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: ['Profile', 'Auth'],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = authApi;
