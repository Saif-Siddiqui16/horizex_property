import React, { useState } from 'react';
import { Card } from '../Card';
import { Scale, Plus, Calendar, Clock, MapPin, UserCheck, Video, ExternalLink, Bell, CheckCircle } from 'lucide-react';
import { Button } from '../Button';

export const CaseHearingList = ({ hearings = [], onAddHearing }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  
  // States for all the fields
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [courtRoom, setCourtRoom] = useState('');
  const [tribunalOffice, setTribunalOffice] = useState('TAL Montreal');
  const [judgeName, setJudgeName] = useState('');
  const [lawyerName, setLawyerName] = useState('');
  const [isVirtual, setIsVirtual] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [reminderSettings, setReminderSettings] = useState('24h before');
  const [attendanceStatus, setAttendanceStatus] = useState('Scheduled');
  const [outcome, setOutcome] = useState('Pending');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !judgeName || !courtRoom) return;

    onAddHearing({
      date: `${date}T${time || '09:00'}:00Z`,
      courtRoom,
      tribunalOffice,
      judgeName,
      judgeId: `jdg-${Math.floor(100 + Math.random() * 900)}`,
      lawyerName,
      isVirtual,
      meetingLink,
      reminderSettings,
      attendanceStatus,
      outcome,
      notes
    });

    // Reset Form
    setDate('');
    setTime('');
    setCourtRoom('');
    setTribunalOffice('TAL Montreal');
    setJudgeName('');
    setLawyerName('');
    setIsVirtual(false);
    setMeetingLink('');
    setReminderSettings('24h before');
    setAttendanceStatus('Scheduled');
    setOutcome('Pending');
    setNotes('');
    setShowAddForm(false);
  };

  return (
    <Card className="p-5 bg-white border border-slate-200 rounded-[22px] shadow-sm">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-black text-slate-800 tracking-wider uppercase">Tribunal Hearings & Dockets</h3>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Manage multiple court dockets, outcomes, and virtual rooms</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-[10px] font-black uppercase tracking-wider py-1.5 h-8.5"
        >
          {showAddForm ? 'Cancel' : 'Schedule Hearing'}
        </Button>
      </div>

      {/* Add Hearing Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-4.5 rounded-2xl border border-slate-100 mb-5 space-y-3.5">
          <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">
            <Scale size={12} />
            Schedule New Hearing Session
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none text-slate-700"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Time</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none text-slate-700"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Tribunal Office</label>
              <input
                type="text"
                placeholder="e.g. TAL Montreal"
                value={tribunalOffice}
                onChange={(e) => setTribunalOffice(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none text-slate-700"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Court Room</label>
              <input
                type="text"
                required
                placeholder="e.g. Room 4A"
                value={courtRoom}
                onChange={(e) => setCourtRoom(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none text-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Judge / Member</label>
              <input
                type="text"
                required
                placeholder="Justice Robert Côté"
                value={judgeName}
                onChange={(e) => setJudgeName(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none text-slate-700"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Assigned Lawyer</label>
              <input
                type="text"
                placeholder="Me. Jean Tremblay"
                value={lawyerName}
                onChange={(e) => setLawyerName(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none text-slate-700"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Type</label>
              <select
                value={isVirtual ? 'true' : 'false'}
                onChange={(e) => setIsVirtual(e.target.value === 'true')}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none text-slate-700"
              >
                <option value="false">In Person</option>
                <option value="true">Virtual Meeting</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Reminders</label>
              <select
                value={reminderSettings}
                onChange={(e) => setReminderSettings(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none text-slate-700"
              >
                <option value="12h before">12h before</option>
                <option value="24h before">24h before</option>
                <option value="48h before">48h before</option>
                <option value="1 week before">1 week before</option>
              </select>
            </div>
          </div>

          {isVirtual && (
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Meeting Link (Virtual URL)</label>
              <input
                type="url"
                placeholder="https://zoom.us/j/..."
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none text-slate-700"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Attendance Status</label>
              <select
                value={attendanceStatus}
                onChange={(e) => setAttendanceStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none text-slate-700"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Attended">Attended</option>
                <option value="Missed">Missed</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Hearing Outcome</label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none text-slate-700"
              >
                <option value="Pending">Pending</option>
                <option value="Adjourned">Adjourned</option>
                <option value="Decision Reserved">Decision Reserved</option>
                <option value="Settled">Settled</option>
                <option value="Concluded">Concluded</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Internal Notes</label>
            <input
              type="text"
              placeholder="e.g. Bring updated rent ledger statement copy..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none text-slate-700"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              className="text-[10px] font-black uppercase tracking-wider px-4 py-2"
            >
              Post Schedule
            </Button>
          </div>
        </form>
      )}

      {/* Hearings List */}
      {hearings.length === 0 ? (
        <div className="py-6 text-center text-xs font-semibold text-slate-400">
          No hearings scheduled yet.
        </div>
      ) : (
        <div className="space-y-3">
          {[...hearings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((h) => (
            <div key={h.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${h.outcome === 'Pending' ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`} />
                  <p className="text-xs font-black text-slate-800">
                    {new Date(h.date).toLocaleDateString('en-CA')} @ {new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <span className="text-[8px] font-black uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded border text-slate-600">
                    {h.attendanceStatus || 'Scheduled'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-600">
                  <Bell size={11} />
                  <span>Reminders: {h.reminderSettings || '24h before'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-500 font-semibold border-t border-b border-slate-100/70 py-2">
                <div className="flex items-center gap-1">
                  <MapPin size={11} className="text-slate-400 shrink-0" />
                  <span>{h.tribunalOffice || 'TAL Office'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={11} className="text-slate-400 shrink-0" />
                  <span>Room: {h.courtRoom}</span>
                </div>
                <div className="flex items-center gap-1">
                  <UserCheck size={11} className="text-slate-400 shrink-0" />
                  <span>Judge: {h.judgeName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <UserCheck size={11} className="text-slate-400 shrink-0" />
                  <span>Lawyer: {h.lawyerName || 'Unassigned'}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-2 items-stretch sm:items-center">
                <div className="text-[10px] text-slate-500 font-medium">
                  {h.isVirtual ? (
                    <div className="flex items-center gap-1.5 text-blue-600 font-bold">
                      <Video size={12} />
                      <span>Virtual Hearing Link Available</span>
                      <a href={h.meetingLink || '#'} target="_blank" rel="noreferrer" className="hover:underline">
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  ) : (
                    <span>Physical Attendance Required</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase text-slate-400">Outcome:</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${h.outcome === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                    {h.outcome || 'Pending'}
                  </span>
                </div>
              </div>

              {h.notes && (
                <div className="bg-slate-100/50 p-2 rounded-lg text-[9px] text-slate-500 font-medium italic mt-1">
                  * Notes: {h.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
export default CaseHearingList;
