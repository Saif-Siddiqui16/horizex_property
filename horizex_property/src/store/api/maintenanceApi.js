import { masterApi } from '../baseApi';

export const maintenanceApi = masterApi.injectEndpoints({
  endpoints: (builder) => ({
    getTickets: builder.query({
      query: (params) => ({
        url: '/admin/tickets',
        params,
      }),
      transformResponse: (response) => {
        const rawList = Array.isArray(response)
          ? response
          : (response?.data && Array.isArray(response.data) ? response.data : []);

        return rawList.map((ticket) => {
          // Normalize priority
          let normPriority = 'Low';
          const p = String(ticket.priority || '').toUpperCase();
          if (p === 'HIGH' || p === 'EMERGENCY') {
            normPriority = 'High';
          } else if (p === 'MEDIUM') {
            normPriority = 'Medium';
          }

          // Normalize status
          let normStatus = 'Open';
          const s = String(ticket.status || '').toUpperCase();
          if (s === 'RESOLVED' || s === 'CLOSED') {
            normStatus = 'Resolved';
          } else if (s === 'IN_PROGRESS' || s === 'PENDING_PARTS') {
            normStatus = 'In Progress';
          } else if (ticket.status === 'In Progress' || ticket.status === 'Resolved' || ticket.status === 'Open') {
            normStatus = ticket.status;
          }

          const tenantName = ticket.tenant
            ? `${ticket.tenant.firstName || ''} ${ticket.tenant.lastName || ''}`.trim()
            : (ticket.tenantName || ticket.tenant || 'General Tenant');

          const buildingName = ticket.property?.name || ticket.building || ticket.propertyName || 'General Building';
          const unitNumber = ticket.unit?.unitNumber || ticket.unit || ticket.unitNumber || 'N/A';
          const ticketIdStr = String(ticket.id || '');
          const displayId = ticketIdStr.length > 8
            ? `TCK-${ticketIdStr.slice(0, 6).toUpperCase()}`
            : (ticketIdStr || 'TCK-001');

          return {
            ...ticket,
            id: ticket.id,
            dbId: ticket.id,
            displayId,
            building: buildingName,
            propertyName: buildingName,
            propertyId: ticket.propertyId || ticket.property?.id,
            subject: ticket.title || ticket.subject || 'Maintenance Request',
            title: ticket.title || ticket.subject || 'Maintenance Request',
            desc: ticket.description || ticket.desc || '',
            description: ticket.description || ticket.desc || '',
            tenant: tenantName,
            tenantName,
            tenantId: ticket.tenantId || ticket.tenant?.id,
            tenantDetails: ticket.tenant ? {
              name: tenantName,
              phone: ticket.tenant.phone || '',
              email: ticket.tenant.email || ticket.email || '',
              unit: unitNumber,
              property: buildingName,
              rent: ticket.rent || '',
            } : null,
            unit: unitNumber,
            unitNumber,
            unitId: ticket.unitId || ticket.unit?.id,
            priority: normPriority,
            status: normStatus,
            rawPriority: ticket.priority,
            rawStatus: ticket.status,
            attachments: Array.isArray(ticket.photoUrls)
              ? ticket.photoUrls.map((url) => ({
                  type: url.match(/\.(mp4|mov)$/i) ? 'video' : 'image',
                  url,
                }))
              : (ticket.attachments || []),
            createdAt: ticket.createdAt,
            requestDate: ticket.requestDate || (ticket.createdAt ? ticket.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
            completionDate: ticket.completionDate || (ticket.resolvedAt ? ticket.resolvedAt.split('T')[0] : ''),
          };
        });
      },
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [...result.map(({ id }) => ({ type: 'Tickets', id })), { type: 'Tickets', id: 'LIST' }]
          : [{ type: 'Tickets', id: 'LIST' }],
    }),
    getTicketById: builder.query({
      query: (id) => `/admin/tickets/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (result, error, id) => [{ type: 'Tickets', id }],
    }),
    createTicket: builder.mutation({
      query: (body) => ({
        url: '/admin/tickets',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Tickets', id: 'LIST' }, 'Dashboard'],
    }),
    updateTicketStatus: builder.mutation({
      query: ({ id, status, resolutionNote, photoUrls }) => {
        let backendStatus = status;
        if (status === 'Open') backendStatus = 'SUBMITTED';
        else if (status === 'In Progress') backendStatus = 'IN_PROGRESS';
        else if (status === 'Resolved') backendStatus = 'RESOLVED';

        return {
          url: `/admin/tickets/${id}/status`,
          method: 'PUT',
          body: {
            status: backendStatus,
            resolutionNote: resolutionNote || (backendStatus === 'RESOLVED' ? 'Resolved by maintenance team' : undefined),
            photoUrls,
          },
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Tickets', id },
        { type: 'Tickets', id: 'LIST' },
        'Readiness',
        'Dashboard',
      ],
    }),
    assignTicket: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/tickets/${id}/assign`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Tickets', id }, { type: 'Tickets', id: 'LIST' }],
    }),
    updateTicket: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/tickets/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Tickets', id },
        { type: 'Tickets', id: 'LIST' },
        'Dashboard',
      ],
    }),
    deleteTicket: builder.mutation({
      query: (id) => ({
        url: `/admin/tickets/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Tickets', id },
        { type: 'Tickets', id: 'LIST' },
        'Dashboard',
      ],
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useGetTicketByIdQuery,
  useCreateTicketMutation,
  useUpdateTicketStatusMutation,
  useAssignTicketMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation,
} = maintenanceApi;
