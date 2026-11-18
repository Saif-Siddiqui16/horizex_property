import React, { useState } from 'react';
import { Wrench, Plus, X, CheckCircle2, Clock, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '../../components/Button';
import { useGetTenantTicketsQuery, useCreateTenantTicketMutation } from '../../store';

export const TenantTickets = () => {
    const { data: rawTickets = [], isLoading } = useGetTenantTicketsQuery();
    const [createTicket, { isLoading: isSubmitting }] = useCreateTenantTicketMutation();

    const [showNew, setShowNew] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);

    const tickets = Array.isArray(rawTickets) ? rawTickets : [];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Resolved':
                return {
                    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    icon: CheckCircle2,
                    label: 'Resolved'
                };
            case 'In Progress':
                return {
                    bg: 'bg-blue-50 text-blue-700 border-blue-200',
                    icon: Clock,
                    label: 'In Progress'
                };
            default:
                return {
                    bg: 'bg-amber-50 text-amber-700 border-amber-200',
                    icon: AlertCircle,
                    label: status || 'Pending'
                };
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'High':
            case 'Emergency':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            case 'Medium':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            default:
                return 'bg-slate-50 text-slate-600 border-slate-200';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;

        try {
            const imageFiles = form.images?.files ? Array.from(form.images.files) : [];
            const videoFile = form.video?.files?.[0] || null;

            const readAsDataUrl = (file) => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            const photoUrls = [];
            for (const file of imageFiles) {
                try {
                    const dataUrl = await readAsDataUrl(file);
                    photoUrls.push(dataUrl);
                } catch (err) {
                    console.error('Failed reading image:', err);
                }
            }
            if (videoFile) {
                try {
                    const dataUrl = await readAsDataUrl(videoFile);
                    photoUrls.push(dataUrl);
                } catch (err) {
                    console.error('Failed reading video:', err);
                }
            }

            await createTicket({
                subject: form.subject.value,
                description: form.description.value,
                priority: form.priority.value,
                photoUrls
            }).unwrap();
            setShowNew(false);
            form.reset();
            alert('Support ticket created successfully!');
        } catch (e) {
            console.error('Ticket Error:', e);
            alert('Failed to create ticket: ' + (e?.data?.message || e?.message || 'Please try again'));
        }
    };

    return (
        <>
            <div className="space-y-6 anim-slide-up">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="space-y-1">
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Support Requests</h2>
                        <p className="text-sm text-slate-500 font-medium">Need something fixed? We're here to help.</p>
                    </div>
                    <Button variant="primary" className="rounded-xl flex items-center gap-2 font-bold py-3 shadow-lg shadow-primary-50 active:scale-95" onClick={() => setShowNew(true)}>
                        <Plus size={18} />
                        Raise New Ticket
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {isLoading ? (
                        <div className="p-12 text-center text-slate-400 font-medium">Loading support tickets...</div>
                    ) : tickets.length === 0 ? (
                        <div className="p-20 text-center space-y-4">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-200">
                                <MessageSquare size={40} />
                            </div>
                            <p className="text-slate-400 font-bold">No tickets found.</p>
                        </div>
                    ) : (
                        tickets.map((ticket) => {
                            const statusConfig = getStatusBadge(ticket.status);
                            const StatusIcon = statusConfig.icon;
                            const priorityClass = getPriorityBadge(ticket.priority);

                            return (
                                <div key={ticket.id || ticket.dbId} onClick={() => setSelectedTicket(ticket)} className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center hover:shadow-md transition-all group cursor-pointer">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                                        ticket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' :
                                        ticket.status === 'In Progress' ? 'bg-blue-50 text-blue-600' :
                                        'bg-indigo-50 text-indigo-600'
                                    }`}>
                                        <Wrench size={24} />
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{ticket.displayId || ticket.id}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight border ${priorityClass}`}>
                                                {ticket.priority} Priority
                                            </span>
                                            {ticket.unitNumber && (
                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                                                    Unit {ticket.unitNumber}
                                                </span>
                                            )}
                                            {ticket.attachments && ticket.attachments.length > 0 && (
                                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                                    {ticket.attachments.length} attachment{ticket.attachments.length > 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-800 group-hover:text-primary-600 transition-colors">{ticket.subject}</h4>
                                        <p className="text-sm text-slate-500 font-medium line-clamp-1">{ticket.desc}</p>
                                    </div>

                                    <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-1 shrink-0 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
                                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight border ${statusConfig.bg}`}>
                                            <StatusIcon size={14} />
                                            {statusConfig.label}
                                        </div>
                                        <span className="text-xs font-bold text-slate-400">{ticket.date}</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* NEW TICKET MODAL */}
            {showNew && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-0 md:p-6 overflow-y-auto anim-fade-in">
                    <div className="bg-white w-full max-w-md rounded-none md:rounded-3xl shadow-2xl flex flex-col overflow-hidden anim-zoom-in my-auto h-[100dvh] md:h-auto md:max-h-[90vh]">
                        
                        {/* Sticky Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-slate-50 p-6 flex items-center justify-between shrink-0 z-10">
                            <h3 className="text-xl font-black text-slate-800">Raise New Ticket</h3>
                            <button onClick={() => setShowNew(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                                <X size={24} />
                            </button>
                        </div>
                        
                        {/* Scrollable Form Body */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8">
                            <form id="raise-ticket-form" onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Subject</label>
                                    <input name="subject" required className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-primary-500 outline-none font-medium text-slate-700 bg-white" placeholder="e.g. Broken Light Fixture" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Priority</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['Low', 'Medium', 'High'].map((p) => (
                                            <label key={p} className="cursor-pointer group">
                                                <input type="radio" name="priority" value={p} defaultChecked={p === 'Medium'} className="peer sr-only" />
                                                <div className="text-center py-2.5 rounded-xl border-2 border-slate-100 peer-checked:border-primary-600 peer-checked:bg-primary-50 text-xs font-black uppercase text-slate-400 peer-checked:text-primary-600 transition-all">
                                                    {p}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Description</label>
                                    <textarea name="description" required className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:border-primary-500 outline-none font-medium text-slate-700 resize-none bg-white" placeholder="Provide more details..." />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Images</label>
                                        <input type="file" name="images" multiple accept=".jpg,.png,.jpeg" className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-primary-50 file:text-primary-600 cursor-pointer" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Video</label>
                                        <input type="file" name="video" accept=".mp4,.mov" className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-primary-50 file:text-primary-600 cursor-pointer" />
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Sticky Modal Footer */}
                        <div className="sticky bottom-0 bg-white border-t border-slate-50 p-6 flex items-center justify-end shrink-0 z-10 w-full">
                            <Button form="raise-ticket-form" type="submit" variant="primary" className="w-full h-14 rounded-2xl font-black text-lg" disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Send Request'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* TICKET DETAIL MODAL */}
            {selectedTicket && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 anim-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl anim-zoom-in overflow-y-auto max-h-[90vh]">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-800">{selectedTicket.displayId || selectedTicket.id} Detail</h3>
                            <button onClick={() => setSelectedTicket(null)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-50">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Status</label>
                                    <div className="mt-1">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tight border ${getStatusBadge(selectedTicket.status).bg}`}>
                                            {selectedTicket.status === 'Resolved' ? <CheckCircle2 size={13} /> : selectedTicket.status === 'In Progress' ? <Clock size={13} /> : <AlertCircle size={13} />}
                                            {selectedTicket.status}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Priority</label>
                                    <div className="mt-1">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-tight border ${getPriorityBadge(selectedTicket.priority)}`}>
                                            {selectedTicket.priority} Priority
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {selectedTicket.unitNumber && (
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Unit / Location</label>
                                    <p className="text-slate-700 font-bold mt-1">Unit {selectedTicket.unitNumber} {selectedTicket.propertyName ? `• ${selectedTicket.propertyName}` : ''}</p>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Subject</label>
                                <p className="text-lg font-bold text-slate-800 mt-1">{selectedTicket.subject}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Description</label>
                                <p className="text-slate-600 font-medium mt-1 whitespace-pre-wrap">{selectedTicket.desc}</p>
                            </div>

                            {selectedTicket.assignee && (
                                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                                    <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Assigned Technician</label>
                                    <p className="text-slate-800 font-bold mt-0.5">{selectedTicket.assignee}</p>
                                </div>
                            )}

                            {selectedTicket.resolutionNote && (
                                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                                    <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Resolution Notes</label>
                                    <p className="text-slate-800 font-medium mt-0.5 whitespace-pre-wrap">{selectedTicket.resolutionNote}</p>
                                    {selectedTicket.resolvedAt && (
                                        <p className="text-xs text-emerald-600 font-semibold mt-1">Resolved on {selectedTicket.resolvedAt}</p>
                                    )}
                                </div>
                            )}

                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Attachments</label>
                            {selectedTicket.attachments && selectedTicket.attachments.length > 0 ? (
                                <div className="space-y-4">
                                    {selectedTicket.attachments.some(a => a.type === 'image') && (
                                        <div className="grid grid-cols-3 gap-2">
                                            {selectedTicket.attachments.filter(a => a.type === 'image').map((img, i) => (
                                                <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 cursor-pointer hover:opacity-90 transition-opacity">
                                                    <img src={img.url} alt="" className="w-full h-full object-cover" onClick={() => window.open(img.url, '_blank')} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {selectedTicket.attachments.find(a => a.type === 'video') && (
                                        <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-900 aspect-video relative group">
                                            <video src={selectedTicket.attachments.find(a => a.type === 'video').url} className="w-full h-full object-cover" controls />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 italic">No attachments provided</p>
                            )}

                            <Button variant="primary" className="w-full h-14 rounded-2xl font-black text-lg" onClick={() => setSelectedTicket(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
