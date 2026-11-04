import { masterApi } from '../baseApi';

export const settingsApi = masterApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query({
      query: (params) => ({
        url: '/admin/settings',
        params,
      }),
      transformResponse: (response) => response?.data || response || {},
      providesTags: ['Settings'],
    }),
    saveSettings: builder.mutation({
      query: (body) => ({
        url: '/admin/settings',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Settings'],
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useSaveSettingsMutation,
} = settingsApi;

