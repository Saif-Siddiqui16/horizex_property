import React, { useState, useEffect, useRef } from 'react';
import { communicationService } from '../../services/communicationService';
import { Send, RefreshCw, MessageSquare } from 'lucide-react';

export const OwnerChat = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [adminUser, setAdminUser] = useState({
        id: '13445edb-cdc2-475b-81c8-d8750e17ffa9',
        name: 'Horizex Property Support',
        role: 'ADMIN'
    });
    const [currentOwnerId, setCurrentOwnerId] = useState(() => {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : {};
        return localStorage.getItem('ownerId') || user.id || user.userId || '48dd27d0-f209-4d53-b163-86a4edde211f';
    });
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const intervalRef = useRef(null);
    const isFetchingRef = useRef(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : {};
        const id = localStorage.getItem('ownerId') || user.id || user.userId || '48dd27d0-f209-4d53-b163-86a4edde211f';
        if (id) setCurrentOwnerId(String(id));
        fetchAdmins();
        return () => clearInterval(intervalRef.current);
    }, []);

    const fetchAdmins = async () => {
        try {
            const rawAdmins = await communicationService.getConversations();
            const list = Array.isArray(rawAdmins) ? rawAdmins : (rawAdmins?.data || []);
            if (list.length > 0) {
                setAdminUser(list[0]);
            }
        } catch (error) {
            console.warn('Using default support contact');
        }
    };

    // Poll for messages
    useEffect(() => {
        if (adminUser?.id) {
            fetchHistory(false);
            intervalRef.current = setInterval(() => fetchHistory(true), 3000);
        }
        return () => clearInterval(intervalRef.current);
    }, [adminUser]);

    const fetchHistory = async (isPolling = false) => {
        if (!adminUser?.id || isFetchingRef.current) return;
        isFetchingRef.current = true;
        try {
            const rawHistory = await communicationService.getHistory(adminUser.id);
            const history = Array.isArray(rawHistory) ? rawHistory : (rawHistory?.data || []);
            setMessages(history);
        } catch (error) {
            if (!isPolling) {
                console.warn('Initial chat history load:', error?.message || error);
            }
        } finally {
            isFetchingRef.current = false;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !adminUser?.id) return;

        const text = newMessage.trim();
        setSending(true);
        try {
            await communicationService.sendMessage(adminUser.id, text);
            setNewMessage('');
            await fetchHistory(false);
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-[calc(100vh-160px)] md:h-[calc(100vh-140px)] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <MessageSquare size={20} />
                </div>
                <div>
                    <h2 className="font-bold text-slate-800">Priority Support</h2>
                    <p className="text-xs font-medium text-slate-500">
                        {adminUser ? `Connected with ${adminUser.name}` : 'Connecting...'}
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-white relative">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                        <MessageSquare className="w-12 h-12 text-slate-200 mb-2 stroke-[1.5]" />
                        <p className="text-sm font-medium text-slate-500">Priority Support Channel</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm">
                            Send a message below to directly contact your property management team.
                        </p>
                    </div>
                )}

                {messages.map((msg, index) => {
                    const isMe = String(msg.senderId) === String(currentOwnerId) || msg.direction === 'OUTBOUND';
                    return (
                        <div key={msg.id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] md:max-w-[80%] px-4 py-2.5 md:px-5 md:py-3 rounded-2xl text-sm font-medium shadow-sm ${
                                isMe
                                    ? 'bg-zinc-900 text-white rounded-br-none'
                                    : 'bg-slate-100 text-slate-700 rounded-bl-none'
                            }`}>
                                {msg.content || msg.message}
                                <div className="text-[10px] mt-1 text-right opacity-70">
                                    {msg.createdAt || msg.sentAt
                                        ? new Date(msg.createdAt || msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : ''}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-slate-50 border-t border-slate-100">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium text-slate-700"
                    />
                    <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="h-12 w-12 bg-zinc-900 text-white rounded-xl flex items-center justify-center hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sending ? <RefreshCw className="animate-spin" size={20} /> : <Send size={20} />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OwnerChat;
