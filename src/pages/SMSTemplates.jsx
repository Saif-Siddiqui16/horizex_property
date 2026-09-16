import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { MessageSquare, Edit2, Trash2, Plus, X, Search, FileText, Check } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { hasPermission } from '../utils/permissions';

const SMSTemplates = () => {
    const [__forceUpdate, __setForceUpdate] = useState(0);
    useEffect(() => {
        const handleUpdate = () => __setForceUpdate(p => p + 1);
        window.addEventListener('permissionsUpdated', handleUpdate);
        return () => window.removeEventListener('permissionsUpdated', handleUpdate);
    }, []);

    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState({ name: '', content: '', category: '' });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/communication/templates');
            setTemplates(response.data);
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (currentTemplate.id) {
                await api.put(`/api/communication/templates/${currentTemplate.id}`, currentTemplate);
            } else {
                await api.post('/api/communication/templates', currentTemplate);
            }
            setIsModalOpen(false);
            fetchTemplates();
        } catch (error) {
            console.error('Error saving template:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this template?')) return;
        try {
            await api.delete(`/api/communication/templates/${id}`);
            fetchTemplates();
        } catch (error) {
            console.error('Error deleting template:', error);
        }
    };

    const openModal = (template = { name: '', content: '', category: '' }) => {
        setCurrentTemplate(template);
        setIsModalOpen(true);
    };

    const insertPlaceholder = (placeholder) => {
        setCurrentTemplate({
            ...currentTemplate,
            content: (currentTemplate.content || '') + ` {{${placeholder}}}`
        });
    };

    const filteredTemplates = templates.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <MainLayout title="SMS Templates">
            <div className="space-y-4 text-slate-800 w-full max-w-full overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4 w-full">
                    <div className="min-w-0">
                        <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center justify-center sm:justify-start gap-2">
                            <MessageSquare className="h-5 w-5 text-indigo-600 shrink-0" />
                            SMS Templates
                        </h1>
                        <p className="text-gray-500 mt-0.5 text-xs">Manage reusable SMS messages for your tenants.</p>
                    </div>
                    {hasPermission('Templates', 'add') && (
                        <button 
                            onClick={() => openModal()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 h-10 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 w-full sm:w-auto font-bold text-xs shrink-0"
                        >
                            <Plus className="h-4 w-4 shrink-0" />
                            <span className="whitespace-nowrap">Create Template</span>
                        </button>
                    )}
                </div>

                {/* Search Bar */}
                <div className="relative max-w-md w-full">
                    <Search size={14} className="absolute left-3.5 top-3 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 h-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none bg-white font-semibold text-xs text-slate-800"
                    />
                </div>

                {/* Templates Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white border border-gray-100 h-48 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredTemplates.length === 0 ? (
                    <div className="bg-white p-20 text-center rounded-3xl border border-dashed border-gray-200 shadow-sm">
                        <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600">No templates found</h3>
                        <p className="text-gray-400 mt-2">Create your first SMS template to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                        {filteredTemplates.map(template => (
                            <div key={template.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all group overflow-hidden flex flex-col h-fit">
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="bg-indigo-50 p-2 rounded-xl">
                                            <FileText className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div className="flex gap-1">
                                            {hasPermission('Templates', 'edit') && (
                                                <button onClick={() => openModal(template)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                            )}
                                            {hasPermission('Templates', 'delete') && (
                                                <button onClick={() => handleDelete(template.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-500">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-1.5 truncate">{template.name}</h3>
                                    {template.category && (
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full mb-2 inline-block">
                                            {template.category}
                                        </span>
                                    )}
                                    <div className="text-xs text-gray-500 line-clamp-3 leading-relaxed bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                                        {template.content}
                                    </div>
                                </div>
                                <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                        ID: #{template.id}
                                    </span>
                                    <span className="text-[10px] text-gray-400 italic">
                                        Updated: {new Date(template.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
                        <div className="bg-white w-full max-w-2xl rounded-none md:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 my-auto h-[100dvh] md:h-auto md:max-h-[90vh]">
                            
                            {/* Sticky Modal Header */}
                            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 md:px-8 md:py-6 flex justify-between items-center shrink-0 z-20">
                                <h2 className="text-xl md:text-2xl font-bold text-gray-900">{currentTemplate.id ? 'Edit Template' : 'New SMS Template'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>
                            
                            {/* Scrollable Form Body */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                                <form id="sms-template-form" onSubmit={handleSave} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Template Name</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={currentTemplate.name}
                                                onChange={(e) => setCurrentTemplate({...currentTemplate, name: e.target.value})}
                                                className="w-full px-5 py-3.5 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all outline-none bg-gray-50/30 font-medium"
                                                placeholder="e.g. Welcome Message"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Category</label>
                                            <input 
                                                type="text" 
                                                value={currentTemplate.category || ''}
                                                onChange={(e) => setCurrentTemplate({...currentTemplate, category: e.target.value})}
                                                className="w-full px-5 py-3.5 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all outline-none bg-gray-50/30 font-medium"
                                                placeholder="e.g. Onboarding"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Message Content</label>
                                            <span className={`text-[10px] font-bold ${currentTemplate.content?.length > 160 ? 'text-amber-500' : 'text-gray-400'}`}>
                                                {currentTemplate.content?.length || 0} characters
                                            </span>
                                        </div>
                                        <textarea 
                                            rows="5"
                                            required
                                            value={currentTemplate.content}
                                            onChange={(e) => setCurrentTemplate({...currentTemplate, content: e.target.value})}
                                            className="w-full px-5 py-4 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all outline-none bg-gray-50/30 font-medium leading-relaxed"
                                            placeholder="Type your message here..."
                                        />
                                        
                                        {/* Placeholders Toolbar */}
                                        <div className="mt-4">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Insert Placeholders:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {['first_name', 'last_name', 'full_name', 'unit_number', 'building_name'].map(tag => (
                                                    <button
                                                        key={tag}
                                                        type="button"
                                                        onClick={() => insertPlaceholder(tag)}
                                                        className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-lg border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all"
                                                    >
                                                        +{tag.replace('_', ' ')}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* Sticky Modal Footer */}
                            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 md:px-8 md:py-5 flex flex-col sm:flex-row justify-end gap-3 shrink-0 z-20">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-all text-sm text-center"
                                >
                                    Cancel
                                </button>
                                <button 
                                    form="sms-template-form"
                                    type="submit"
                                    className="w-full sm:w-auto px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-100 text-sm text-center"
                                >
                                    {currentTemplate.id ? 'Save Changes' : 'Create Template'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default SMSTemplates;
