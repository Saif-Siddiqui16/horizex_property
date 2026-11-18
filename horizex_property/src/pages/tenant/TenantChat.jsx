import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { communicationService } from '../../services/communicationService';
import { joinConversation, leaveConversation, onNewMessage } from '../../services/socketService';
import { Send, RefreshCw, MessageSquare, Headphones, ShieldCheck, CheckCheck } from 'lucide-react';

export const TenantChat = () => {
    const authUser = useSelector((state) => state.auth?.user);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [adminUser, setAdminUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const messagesEndRef = useRef(null);
    const intervalRef = useRef(null);

    const currentUserId = authUser?.id || authUser?.userId || localStorage.getItem('userId');
    const tenantId = authUser?.tenantId || currentUserId;

    useEffect(() => {
        initChat();

        // Join socket room for real-time messages
        if (tenantId) {
            joinConversation(tenantId);
        }

        const unsubscribe = onNewMessage((incoming) => {
            if (!incoming) return;
            setMessages((prev) => {
                // If message already exists by ID, ignore
                if (prev.some((m) => m.id === incoming.id)) {
                    return prev;
                }
                // Check if incoming is confirming a temp message from this user
                const isFromMe = incoming.senderId === currentUserId || incoming.isMe;
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

                // New message (e.g. from Admin / Support)
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

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (tenantId) leaveConversation(tenantId);
            unsubscribe();
        };
    }, [tenantId, currentUserId]);

    const initChat = async () => {
        try {
            setLoading(true);
            await fetchChatData();
        } catch (error) {
            console.error('Error initializing support chat:', error);
        } finally {
            setLoading(false);
        }

        // Poll for new messages every 3.5 seconds
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            fetchChatData(true);
        }, 3500);
    };

    const fetchChatData = async (silent = false) => {
        try {
            if (!silent) setRefreshing(true);

            // 1. Try dedicated tenant messages endpoint first
            try {
                const res = await communicationService.getTenantMessages();
                if (res) {
                    if (res.supportContact) {
                        setAdminUser(res.supportContact);
                    }
                    if (Array.isArray(res.messages)) {
                        setMessages(res.messages);
                        return;
                    }
                }
            } catch (_) {
                // Fallback to general communication API
            }

            // 2. Fallback: query conversations for support admin
            let supportContact = adminUser;
            if (!supportContact) {
                const admins = await communicationService.getConversations();
                if (admins && admins.length > 0) {
                    supportContact = admins[0];
                    setAdminUser(admins[0]);
                }
            }

            if (supportContact) {
                const history = await communicationService.getHistory(supportContact.id);
                setMessages(history || []);

                const unreadExist = (history || []).some(m => !m.isRead && m.senderId === supportContact.id);
                if (unreadExist) {
                    await communicationService.markAsRead(supportContact.id);
                }
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
        } finally {
            if (!silent) setRefreshing(false);
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
        if (!text || sending) return;

        setSending(true);
        try {
            // Optimistically add message
            const tempMessage = {
                id: `temp-${Date.now()}`,
                content: text,
                message: text,
                createdAt: new Date().toISOString(),
                isMe: true,
                senderId: currentUserId,
            };
            setMessages(prev => [...prev, tempMessage]);
            setNewMessage('');

            // Send to tenant endpoint
            try {
                await communicationService.sendTenantMessage(text);
            } catch (_) {
                if (adminUser?.id) {
                    await communicationService.sendMessage(adminUser.id, text);
                }
            }

            // Refresh to get server confirmed state
            await fetchChatData(true);
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    const contactDisplayName = adminUser?.name || adminUser?.firstName || 'Horizex Property Support';

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-[calc(100vh-140px)] flex flex-col w-full max-w-full">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-xs">
                        <MessageSquare size={22} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="font-bold text-slate-800 text-base">Support Chat</h2>
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Online
                            </span>
                        </div>
                        <p className="text-xs font-medium text-slate-500">
                            {adminUser ? `Chatting with ${contactDisplayName}` : 'Connecting to property support...'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchChatData(false)}
                        disabled={refreshing}
                        title="Refresh chat"
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white border border-transparent hover:border-slate-200 transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={refreshing ? 'animate-spin text-indigo-600' : ''} />
                    </button>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/30 relative">
                {loading && messages.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400 text-sm">
                        <RefreshCw className="animate-spin text-indigo-500" size={28} />
                        <p className="font-medium">Connecting to support channel...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-4 max-w-md mx-auto">
                        <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-sm border border-indigo-100">
                            <Headphones size={32} />
                        </div>
                        <h3 className="text-base font-bold text-slate-800 mb-1">Welcome to Property Support</h3>
                        <p className="text-xs text-slate-500 leading-relaxed mb-4">
                            Have questions regarding your lease, rent payments, maintenance tickets, or building amenities? Type a message below to connect with your Property Management team.
                        </p>
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-2xs">
                            <ShieldCheck size={14} className="text-emerald-500" />
                            Official Horizex Support Line
                        </div>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.isMe !== undefined
                            ? msg.isMe
                            : (msg.senderId === currentUserId || msg.direction === 'OUTBOUND');

                        const messageText = msg.content || msg.message || '';
                        const formattedTime = msg.createdAt
                            ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '';

                        return (
                            <div key={msg.id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] sm:max-w-[75%] space-y-1`}>
                                    {!isMe && (
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                                            {adminUser?.firstName || 'Property Support'}
                                        </p>
                                    )}
                                    <div
                                        className={`px-4 sm:px-5 py-3 rounded-2xl text-sm font-medium shadow-2xs leading-relaxed break-words ${
                                            isMe
                                                ? 'bg-zinc-900 text-white rounded-br-none'
                                                : 'bg-white text-slate-700 rounded-bl-none border border-slate-100'
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap">{messageText}</p>
                                        <div
                                            className={`text-[10px] mt-1.5 flex items-center gap-1 justify-end ${
                                                isMe ? 'text-zinc-400' : 'text-slate-400'
                                            }`}
                                        >
                                            <span>{formattedTime}</span>
                                            {isMe && <CheckCheck size={12} className="text-zinc-400" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-100">
                <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3 items-center">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message to Property Support..."
                        className="flex-1 h-12 px-4 rounded-xl border border-slate-200 focus:border-zinc-900 focus:ring-4 focus:ring-zinc-100 outline-none transition-all font-medium text-slate-700 bg-slate-50/50 hover:bg-white focus:bg-white min-w-0 text-sm"
                    />
                    <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="h-12 w-12 bg-zinc-900 text-white rounded-xl flex items-center justify-center hover:bg-zinc-800 transition-all shadow-md shadow-zinc-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                        {sending ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
                    </button>
                </form>
            </div>
        </div>
    );
};
