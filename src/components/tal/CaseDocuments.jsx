import React, { useState } from 'react';
import { Card } from '../Card';
import { File, Upload, Trash2, Eye, Download, FileText, Image, Gavel, Scale, Paperclip, Mail, Smartphone, MessageSquare, Video, ClipboardList } from 'lucide-react';
import { TAL_DOCUMENT_TYPES } from '../../mock/talCases';

export const CaseDocuments = ({ documents = [], onUpload, onDelete }) => {
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('LEASE_AGREEMENT');
  const [docSize, setDocSize] = useState('1.5 MB');

  const getDocIcon = (type) => {
    switch (type) {
      case 'LEASE_AGREEMENT':
      case 'RENT_LEDGER':
      case 'PAYMENT_HISTORY':
      case 'RECEIPTS':
      case 'INVOICES':
        return FileText;
      case 'INSPECTION_REPORTS':
        return ClipboardList;
      case 'PROPERTY_PHOTOS':
        return Image;
      case 'VIDEOS':
        return Video;
      case 'TENANT_COMMUNICATIONS':
        return MessageSquare;
      case 'EMAILS':
        return Mail;
      case 'SMS_RECORDS':
        return Smartphone;
      case 'LEGAL_NOTICES':
      case 'TAL_FORMS':
      case 'HEARING_NOTICE':
      case 'TRIBUNAL_DECISION':
        return Scale;
      default:
        return Paperclip;
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!docName.trim()) return;

    onUpload({
      name: docName.trim().endsWith('.pdf') || docName.trim().endsWith('.zip') || docName.trim().endsWith('.jpg') ? docName.trim() : `${docName.trim()}.pdf`,
      type: docType,
      size: docSize,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Admin User',
      version: 'v1.0'
    });

    setDocName('');
  };

  return (
    <Card className="p-5 bg-white border border-slate-200 rounded-[22px] shadow-sm">
      <h3 className="text-xs font-black text-slate-800 tracking-wider uppercase mb-1">Document Management</h3>
      <p className="text-[10px] text-slate-400 font-medium mb-4">Upload and categorize legal forms, tenant evidence, and correspondence</p>

      {/* Upload Form */}
      <form onSubmit={handleUploadSubmit} className="bg-slate-50 p-4.5 rounded-2xl border border-slate-100 mb-5 space-y-3">
        <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
          <Upload size={12} />
          Upload Legal Document
        </h4>
        <div className="space-y-2.5">
          <input
            type="text"
            required
            placeholder="File name... (e.g. Rent Ledger June 2026)"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-700 placeholder:text-slate-400"
          />
          <div className="flex gap-2">
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="flex-1 px-3 py-2.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none text-slate-700"
            >
              {Object.keys(TAL_DOCUMENT_TYPES).map(k => (
                <option key={k} value={k}>{TAL_DOCUMENT_TYPES[k].label}</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shrink-0"
            >
              Upload
            </button>
          </div>
        </div>
      </form>

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="py-6 text-center text-xs font-semibold text-slate-400">
          No files uploaded yet.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto pr-1">
          {documents.map((doc) => {
            const Icon = getDocIcon(doc.type);
            const label = TAL_DOCUMENT_TYPES[doc.type]?.label || doc.type || 'Other';
            return (
              <div key={doc.id} className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 px-1.5 rounded-xl transition-all">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7.5 h-7.5 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">{doc.name}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[8px] text-slate-400 font-bold">
                      <span className="bg-slate-100 px-1 py-0.5 rounded text-[7px] text-slate-600">{label}</span>
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>By: {doc.uploadedBy || 'Admin User'}</span>
                      <span>•</span>
                      <span className="text-indigo-600">{doc.version || 'v1.0'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => alert(`Viewing file preview: ${doc.name}`)}
                    title="View Preview"
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <Eye size={13} />
                  </button>
                  <button
                    onClick={() => alert(`Downloading file: ${doc.name}`)}
                    title="Download File"
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <Download size={13} />
                  </button>
                  <button
                    onClick={() => onDelete(doc.id)}
                    title="Delete File"
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
export default CaseDocuments;
