import { masterApi } from '../baseApi';

export const coworkersApi = masterApi.injectEndpoints({
  endpoints: (builder) => ({
    getCoworkers: builder.query({
      query: () => '/admin/coworkers',
      transformResponse: (response) => (response?.data !== undefined ? response.data : response),
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: 'Coworkers', id })),
              { type: 'Coworkers', id: 'LIST' },
            ]
          : [{ type: 'Coworkers', id: 'LIST' }],
    }),

    getMyPermissions: builder.query({
      query: () => '/admin/my-permissions',
      transformResponse: (response) => (response?.data !== undefined ? response.data : response),
      providesTags: [{ type: 'Permissions', id: 'ME' }],
    }),

    createCoworker: builder.mutation({
      query: (body) => ({
        url: '/admin/coworkers',
        method: 'POST',
        body,
      }),
      transformResponse: (response) => (response?.data !== undefined ? response.data : response),
      invalidatesTags: [{ type: 'Coworkers', id: 'LIST' }],
    }),

    updateCoworker: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/coworkers/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response) => (response?.data !== undefined ? response.data : response),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Coworkers', id },
        { type: 'Coworkers', id: 'LIST' },
        { type: 'Permissions', id: 'ME' },
      ],
    }),

    updatePermissions: builder.mutation({
      query: ({ id, permissions }) => ({
        url: `/admin/coworkers/${id}/permissions`,
        method: 'PUT',
        body: { permissions },
      }),
      transformResponse: (response) => (response?.data !== undefined ? response.data : response),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Coworkers', id },
        { type: 'Coworkers', id: 'LIST' },
        { type: 'Permissions', id: 'ME' },
      ],
    }),

    deleteCoworker: builder.mutation({
      query: (id) => ({
        url: `/admin/coworkers/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response) => (response?.data !== undefined ? response.data : response),
      invalidatesTags: [{ type: 'Coworkers', id: 'LIST' }],
    }),

    sendInvite: builder.mutation({
      query: ({ id, templateId }) => ({
        url: `/admin/coworkers/${id}/send-invite`,
        method: 'POST',
        body: { templateId },
      }),
      transformResponse: (response) => (response?.data !== undefined ? response.data : response),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCoworkersQuery,
  useGetMyPermissionsQuery,
  useCreateCoworkerMutation,
  useUpdateCoworkerMutation,
  useUpdatePermissionsMutation,
  useDeleteCoworkerMutation,
  useSendInviteMutation,
} = coworkersApi;

