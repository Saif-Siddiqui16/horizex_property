import { masterApi } from '../baseApi';

export const talCasesApi = masterApi.injectEndpoints({
  endpoints: (builder) => ({
    getTalCases: builder.query({
      query: () => '/admin/tal-cases',
      transformResponse: (response) => response.data || [],
      providesTags: ['TalCases'],
    }),
    getTalCaseById: builder.query({
      query: (id) => `/admin/tal-cases/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: 'TalCases', id }],
    }),
    createTalCase: builder.mutation({
      query: (body) => ({
        url: '/admin/tal-cases',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TalCases'],
    }),
    scheduleHearing: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/tal-cases/${id}/hearings`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'TalCases', id }, 'TalCases'],
    }),
  }),
});

export const {
  useGetTalCasesQuery,
  useGetTalCaseByIdQuery,
  useCreateTalCaseMutation,
  useScheduleHearingMutation,
} = talCasesApi;

