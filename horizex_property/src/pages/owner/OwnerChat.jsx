import React, { useState, useEffect, useRef } from 'react';
import { communicationService } from '../../services/communicationService';
import { joinConversation, leaveConversation, onNewMessage } from '../../services/socketService';
import { Send, RefreshCw, MessageSquare } from 'lucide-react';

export const OwnerChat = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [adminUser, setAdminUser] = useState(null);
    const [currentOwnerId, setCurrentOwnerId] = useState(() => {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : {};
        return localStorage.getItem('ownerId') || user.id || user.userId || '';
    });
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const intervalRef = useRef(null);
    const isFetchingRef = useRef(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : {};
        const id = localStorage.getItem('ownerId') || user.id || user.userId || '';
        if (id) {
            setCurrentOwnerId(String(id));
            joinConversation(String(id));
        }

        const unsubscribe = onNewMessage((incoming) => {
            if (!incoming) return;
            setMessages((prev) => {
                if (prev.some((m) => m.id === incoming.id)) return prev;
                const isFromMe = (id && String(incoming.senderId) === String(id)) || incoming.isMe;
                const tempIndex = prev.findIndex((m) => m.id?.startsWith('temp-') && m.content === incoming.content);
                if (tempIndex !== -1) {
                    const next = [...prev];
                    next[tempIndex] = {
                        ...incoming,
                        isMe: true,
                        direction: 'OUTBOUND',
                    };
                    return next;
                }
                return [
                    ...prev,
                    {
                        ...incoming,
                        isMe: isFromMe,
                        direction: isFromMe ? 'OUTBOUND' : 'INBOUND',
                    },
                ];
            });
        });

        fetchAdmins();

        return () => {
            clearInterval(intervalRef.current);
            if (id) leaveConversation(String(id));
            unsubscribe();
        };
    }, []);

    const fetchAdmins = async () => {
        try {
            const rawAdmins = await communicationService.getConversations();
            const list = Array.isArray(rawAdmins) ? rawAdmins : (rawAdmins?.data || []);
            if (list.length > 0) {
                setAdminUser(list[0]);
            } else {
                setAdminUser(null);
            }
        } catch (error) {
            console.warn('Failed to load support contact:', error?.message || error);
            setAdminUser(null);
        }
    };

    // Poll for messages every 3 seconds as fallback
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
        const text = newMessage.trim();
        if (!text || !adminUser?.id || sending || !currentOwnerId) return;

        const tempId = `temp-${Date.now()}`;
        const tempMsg = {
            id: tempId,
            content: text,
            message: text,
            senderId: currentOwnerId,
            createdAt: new Date().toISOString(),
            sentAt: new Date().toISOString(),
            direction: 'OUTBOUND',
            isMe: true,
        };
        setMessages((prev) => [...prev, tempMsg]);
        setNewMessage('');
        setSending(true);

        try {
            const res = await communicationService.sendMessage(adminUser.id, text);
            if (res?.id) {
                setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...res, isMe: true, direction: 'OUTBOUND' } : m)));
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
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
                        {adminUser ? `Connected with ${adminUser.name || 'Property Support'}` : 'Connecting with Property Support...'}
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
                            {adminUser ? 'Send a message below to directly contact your property management team.' : 'Connecting with property management support...'}
                        </p>
                    </div>
                )}

                {messages.map((msg, index) => {
                    const isMe = msg.isMe !== undefined 
                        ? msg.isMe 
                        : (String(msg.senderId) === String(currentOwnerId) || msg.direction === 'OUTBOUND');
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
                        placeholder={adminUser ? "Type a message..." : "Connecting support..."}
                        disabled={!adminUser?.id || !currentOwnerId}
                        className="flex-1 h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium text-slate-700 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                    <button
                        type="submit"
                        disabled={sending || !newMessage.trim() || !adminUser?.id || !currentOwnerId}
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
