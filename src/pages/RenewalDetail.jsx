import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ArrowLeft, Clock, FileText, Send, Calendar, CheckCircle2, AlertCircle, Plus, Trash2, Download } from 'lucide-react';
import { mockRenewalService } from '../mock/mockServices';
import { RENEWAL_STATUSES } from '../mock/renewals';

export const RenewalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [renewal, setRenewal] = useState(null);
  const [loading, setLoading] = useState(true);

  // Notes & Documents States
  const [noteText, setNoteText] = useState('');
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Agreement');
  const [status, setStatus] = useState('');

  const fetchRenewalDetails = async () => {
    try {
      setLoading(true);
      const res = await mockRenewalService.getById(id);
      setRenewal(res.data);
      setStatus(res.data?.status || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRenewalDetails();
  }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    await mockRenewalService.updateStatus(id, newStatus);
    setStatus(newStatus);
    fetchRenewalDetails();
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    await mockRenewalService.addNote(id, noteText, 'Admin User');
    setNoteText('');
    fetchRenewalDetails();
  };

  const handleUploadDoc = async (e) => {
    e.preventDefault();
    if (!docName.trim()) return;
    await mockRenewalService.uploadDocument(id, docName, docType);
    setDocName('');
    fetchRenewalDetails();
  };

  const handleDeleteDoc = async (docId) => {
    if (window.confirm('Delete this document?')) {
      await mockRenewalService.deleteDocument(id, docId);
      fetchRenewalDetails();
    }
  };

  const handleSendNoticeDirect = async () => {
    await mockRenewalService.sendNotice(id);
    alert('Lease renewal notice dispatched to tenant email.');
    fetchRenewalDetails();
  };

  if (loading) {
    return (
      <MainLayout title="Lease Renewal Details">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  if (!renewal) {
    return (
      <MainLayout title="Renewal Not Found">
        <div className="p-6 text-center">
          <p className="text-slate-500">The renewal record could not be loaded.</p>
          <Button onClick={() => navigate('/leases/renewals')} className="mt-4">Back to Renewals</Button>
        </div>
      </MainLayout>
    );
  }

  const currentStatusConfig = RENEWAL_STATUSES[renewal.status.toUpperCase().replace(' ', '_')] || RENEWAL_STATUSES.DRAFT;

  return (
    <MainLayout title={`Lease Renewal: ${renewal.tenantName}`}>
      <div className="flex flex-col gap-6 p-6">
        
        {/* Navigation & Status Header */}
        <section className="bg-white p-6 rounded-[22px] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/leases/renewals')}
              className="p-2.5 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all border border-slate-100"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">{renewal.tenantName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{renewal.propertyName} • {renewal.unitNumber}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span className="text-[10px] font-bold text-[#667eea] uppercase tracking-widest bg-[#667eea]/10 border border-[#667eea]/20 px-2 py-0.5 rounded-md">
                  {renewal.companyName}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Workflow Status:</span>
              <select
                value={status}
                onChange={(e) => handleUpdateStatus(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
              >
                {Object.keys(RENEWAL_STATUSES).map(k => (
                  <option key={k} value={RENEWAL_STATUSES[k].label}>{RENEWAL_STATUSES[k].label}</option>
                ))}
              </select>
            </div>
            {!renewal.noticeSent && (
              <Button onClick={handleSendNoticeDirect} variant="primary" className="text-xs font-bold">
                <Send size={14} className="mr-1.5" />
                Send Notice
              </Button>
            )}
          </div>
        </section>

        {/* Current vs Proposed Lease Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-white border border-slate-200 rounded-[22px] shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Current Lease Terms</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Lease Start Date</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{renewal.leaseStart}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Lease End Date</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{renewal.leaseEnd}</p>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Current Monthly Rent</p>
                <p className="text-lg font-black text-slate-900 font-mono mt-0.5">${(renewal.currentRent || 0).toLocaleString('en-CA')}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-slate-200 rounded-[22px] shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Proposed Renewal Terms</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Renewal Date</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{renewal.renewalDueDate}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Notice Status</p>
                <p className="text-sm font-bold mt-0.5 text-slate-800">
                  {renewal.noticeSent ? `Sent on ${renewal.noticeDate}` : 'Pending Notice'}
                </p>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Proposed Rent</p>
                  <p className="text-lg font-black text-indigo-600 font-mono mt-0.5">${(renewal.proposedRent || 0).toLocaleString('en-CA')}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Rent Increase</p>
                  <p className="text-sm font-bold text-emerald-600 mt-0.5">
                    +${(renewal.proposedRent - renewal.currentRent || 0).toLocaleString('en-CA')} 
                    ({Math.round(((renewal.proposedRent - renewal.currentRent) / (renewal.currentRent || 1)) * 100)}%)
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Previous Renewals History */}
        {renewal.previousRenewals && renewal.previousRenewals.length > 0 && (
          <Card className="p-6 bg-white border border-slate-200 rounded-[22px] shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Previous Renewals History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Renewal ID</th>
                    <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Proposed Rent</th>
                    <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Due Date</th>
                    <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Final Status</th>
                  </tr>
                </thead>
                <tbody>
                  {renewal.previousRenewals.map(prev => (
                    <tr key={prev.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-3 text-xs font-bold text-slate-700">#REN-{prev.id}</td>
                      <td className="py-3 text-xs font-bold text-slate-700 font-mono">${prev.proposedRent}</td>
                      <td className="py-3 text-xs font-semibold text-slate-600">{prev.renewalDueDate}</td>
                      <td className="py-3 text-xs font-bold">
                        <span className="text-[9px] uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {prev.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Audit Timeline & Auto-Reminders Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Audit Timeline */}
          <Card className="p-6 bg-white border border-slate-200 rounded-[22px] shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Audit Timeline</h3>
            <div className="relative border-l border-slate-200 pl-6 ml-3 space-y-6">
              {renewal.history?.map((hist, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-indigo-50 border-2 border-indigo-500 flex items-center justify-center">
                    <CheckCircle2 size={10} className="text-indigo-600" />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">{hist.activity}</span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider mt-1">{hist.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Auto Reminders UI */}
          <Card className="p-6 bg-white border border-slate-200 rounded-[22px] shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Auto-Reminders UI</h3>
            <div className="space-y-4">
              {[
                { title: 'Lease Renewal Notice', desc: 'Dispatched to tenant via email and portal notification.', status: renewal.noticeSent ? 'Reminder Sent' : 'Upcoming Reminder', date: renewal.noticeDate || 'Scheduled 90 Days Before Expiry' },
                { title: 'Lease Expiry Reminder', desc: 'Second follow-up reminder sent automatically to tenant.', status: renewal.noticeSent ? 'Reminder Scheduled' : 'Reminder Pending', date: 'Scheduled 30 Days Before Expiry' },
                { title: 'Final Notice of Non-Renewal', desc: 'Sent when no response is received prior to legal timeline limits.', status: 'Reminder Pending', date: 'Scheduled 15 Days Before Expiry' }
              ].map((rem, idx) => {
                const statusColor = rem.status === 'Reminder Sent' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                    rem.status === 'Reminder Scheduled' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                    rem.status === 'Upcoming Reminder' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                    'bg-slate-50 text-slate-500 border border-slate-200';
                return (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-start gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{rem.title}</p>
                      <p className="text-[11px] text-slate-500 mt-1 font-medium leading-normal">{rem.desc}</p>
                      <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider mt-2 block">{rem.date}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase whitespace-nowrap tracking-wider shrink-0 ${statusColor}`}>
                      {rem.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Documents & Internal Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Documents */}
          <Card className="p-6 bg-white border border-slate-200 rounded-[22px] shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Renewal Documents</h3>
              <div className="space-y-3 mb-6">
                {(!renewal.documents || renewal.documents.length === 0) ? (
                  <p className="text-xs text-slate-400 font-medium py-4 text-center">No documents uploaded.</p>
                ) : (
                  renewal.documents.map(doc => (
                    <div key={doc.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-3">
                      <div className="min-w-0 flex items-center gap-3">
                        <FileText className="text-slate-400 shrink-0" size={18} />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-700 truncate">{doc.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{doc.uploadDate} • {doc.size} • {doc.type}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-1.5 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors text-slate-400">
                          <Download size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="p-1.5 hover:text-rose-600 hover:bg-white rounded-lg transition-colors text-slate-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <form onSubmit={handleUploadDoc} className="border-t border-slate-100 pt-4 flex gap-2">
              <input
                type="text"
                placeholder="Document file name (e.g. signed_lease.pdf)"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                required
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
              />
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="Agreement">Agreement</option>
                <option value="Correspondence">Letter</option>
                <option value="Notice">Notice</option>
              </select>
              <Button type="submit" variant="secondary" className="text-xs font-bold h-9">
                <Plus size={14} />
              </Button>
            </form>
          </Card>

          {/* Internal Notes */}
          <Card className="p-6 bg-white border border-slate-200 rounded-[22px] shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Internal Notes</h3>
              <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2 mb-6">
                {(!renewal.notes || renewal.notes.length === 0) ? (
                  <p className="text-xs text-slate-400 font-medium py-4 text-center">No internal notes added.</p>
                ) : (
                  renewal.notes.map(note => (
                    <div key={note.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase mb-1">
                        <span>{note.author}</span>
                        <span>{note.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-normal font-medium">{note.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <form onSubmit={handleAddNote} className="border-t border-slate-100 pt-4 flex gap-2">
              <input
                type="text"
                placeholder="Write an internal note..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                required
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
              />
              <Button type="submit" variant="primary" className="text-xs font-bold h-9">
                Add Note
              </Button>
            </form>
          </Card>
        </div>

      </div>
    </MainLayout>
  );
};
