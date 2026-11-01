import { masterApi } from '../baseApi';

export const readinessApi = masterApi.injectEndpoints({
  endpoints: (builder) => ({
    getReadinessDashboard: builder.query({
      query: () => '/admin/readiness/dashboard',
      transformResponse: (response) => response.data || { totalInTurnover: 0, stages: {} },
      providesTags: ['Readiness'],
    }),
    updateReadinessStep: builder.mutation({
      query: ({ unitId, ...body }) => ({
        url: `/admin/readiness/units/${unitId}`,
        method: 'PUT',
        body,
      }),
      // Optimistic update for instant checkbox responses!
      async onQueryStarted({ unitId, ...body }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          readinessApi.util.updateQueryData('getReadinessDashboard', undefined, (draft) => {
            for (const stageKey of Object.keys(draft.stages || {})) {
              const unitIndex = draft.stages[stageKey].findIndex((u) => u.id === unitId);
              if (unitIndex !== -1) {
                draft.stages[stageKey][unitIndex].readiness = {
                  ...draft.stages[stageKey][unitIndex].readiness,
                  ...body,
                };
              }
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['Readiness', 'Units', 'Dashboard'],
    }),
  }),
});

export const { useGetReadinessDashboardQuery, useUpdateReadinessStepMutation } = readinessApi;

