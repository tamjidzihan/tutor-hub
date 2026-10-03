import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MessageSquare,
  MessageCircle,
  X,
  Send,
  ArrowLeft,
  ExternalLink,
  Search,
  User as UserIcon,
  Sparkles,
  Loader2,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { messagingApi } from '../../api/messaging';
import type { Conversation, Message } from '../../types';

export const FloatingChat: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingConvs, setIsLoadingConvs] = useState(false);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [openMessageMenuId, setOpenMessageMenuId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageMenuRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Poll conversations for badge and list
  const fetchConversations = async (silent = false) => {
    if (!isAuthenticated) return;
    if (!silent) setIsLoadingConvs(true);
    try {
      const data = await messagingApi.getConversations();
      setConversations(data);
    } catch {
      // Soft fail
    } finally {
      if (!silent) setIsLoadingConvs(false);
    }
  };

  // Initial fetch and polling for conversation unread badges
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchConversations();
    const interval = setInterval(() => fetchConversations(true), 8000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Load messages for active conversation
  const fetchMessages = async (convId: string, silent = false) => {
    if (!silent) setIsLoadingMsgs(true);
    try {
      const msgs = await messagingApi.getMessages(convId);
      setMessages(msgs);
      scrollToBottom();
    } catch {
      // Soft fail
    } finally {
      if (!silent) setIsLoadingMsgs(false);
    }
  };

  // When active conversation changes, fetch messages and poll
  useEffect(() => {
    if (!activeConversation) return;

    fetchMessages(activeConversation.id);

    // Mark as read
    if (activeConversation.unread_count > 0) {
      messagingApi.markAsRead(activeConversation.id).then(() => {
        setConversations((prev) =>
          prev.map((c) => (c.id === activeConversation.id ? { ...c, unread_count: 0 } : c))
        );
      }).catch(() => { });
    }

    // Real-time polling for messages inside the active conversation
    const interval = setInterval(() => {
      fetchMessages(activeConversation.id, true);
    }, 3500);

    return () => clearInterval(interval);
  }, [activeConversation?.id]);

  // Focus input when conversation is opened
  useEffect(() => {
    if (activeConversation && isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [activeConversation, isOpen]);

  useEffect(() => {
    if (!openMessageMenuId) return;

    const handleOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !messageMenuRef.current?.contains(event.target)) {
        setOpenMessageMenuId(null);
      }
    };

    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, [openMessageMenuId]);

  // Send message
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConversation || isSending) return;

    const content = inputText.trim();
    setInputText('');
    setSendError(null);
    setIsSending(true);

    try {
      const newMsg = await messagingApi.sendMessage(activeConversation.id, content);
      setMessages((prev) => [...prev, newMsg]);
      scrollToBottom();

      // Update conversation list preview
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? {
              ...c,
              last_message: {
                content: newMsg.content,
                created_at: newMsg.created_at,
                sender_id: newMsg.sender,
                is_read: true,
              },
              updated_at: newMsg.created_at,
            }
            : c
        )
      );
    } catch {
      setSendError('Failed to send message. Please retry.');
      setInputText(content); // Restore draft
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (message: Message) => {
    if (!activeConversation || !window.confirm('Delete this message permanently?')) return;

    try {
      await messagingApi.deleteMessage(activeConversation.id, message.id);
      setMessages((prev) => prev.filter((item) => item.id !== message.id));
      setOpenMessageMenuId(null);
      await fetchConversations(true);
      setSendError(null);
    } catch {
      setSendError('Failed to delete message. Please retry.');
    }
  };

  const handleDeleteConversation = async () => {
    if (!activeConversation || !window.confirm('Delete this conversation and all its messages permanently?')) return;

    try {
      await messagingApi.deleteConversation(activeConversation.id);
      setConversations((prev) => prev.filter((item) => item.id !== activeConversation.id));
      setActiveConversation(null);
      setMessages([]);
      setSendError(null);
    } catch {
      setSendError('Failed to delete conversation. Please retry.');
    }
  };

  // Calculate total unread messages
  const totalUnread = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);

  // Filter conversations by search
  const filteredConversations = conversations.filter((c) => {
    const name = c.other_participant?.name || '';
    const lastContent = c.last_message?.content || '';
    const q = searchQuery.toLowerCase();
    return name.toLowerCase().includes(q) || lastContent.toLowerCase().includes(q);
  });

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
  };

  // If user is not authenticated or currently on the dedicated full-page messages view, do not display floating popup
  if (!isAuthenticated || !user) return null;
  if (location.pathname === '/messages' || location.pathname === '/dashboard/messages') return null;

  return (
    <>
      {/* ======================================================== */}
      {/* FLOATING CHAT POPUP WINDOW */}
      {/* ======================================================== */}
      <div
        className={`fixed bottom-22 right-4 sm:bottom-24 sm:right-6 z-50 flex flex-col w-[calc(100vw-2rem)] max-w-[360px] sm:max-w-[400px] h-[520px] max-h-[calc(100vh-110px)] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden transition-all duration-300 ease-out origin-bottom-right ${isOpen
          ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
          }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 text-white p-4 shrink-0 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            {activeConversation ? (
              <button
                type="button"
                onClick={() => setActiveConversation(null)}
                className="p-1 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title="Back to conversation list"
                aria-label="Back to conversations"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500 text-white shadow-xs">
                <MessageSquare className="w-4 h-4" />
              </div>
            )}

            <div className="min-w-0">
              {activeConversation ? (
                <div className="flex items-center gap-2">
                  <span className="font-heading text-sm font-bold truncate text-white">
                    {activeConversation.other_participant?.name || 'Chat'}
                  </span>
                  {activeConversation.other_participant?.role && (
                    <span className="rounded-md bg-brand-500/20 text-brand-300 border border-brand-500/30 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider">
                      {activeConversation.other_participant.role}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-sm font-bold text-white">
                    Messages
                  </h3>
                  {totalUnread > 0 && (
                    <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      {totalUnread} new
                    </span>
                  )}
                </div>
              )}
              <p className="text-[10px] text-slate-400 truncate">
                {activeConversation
                  ? 'Real-time conversation'
                  : 'Direct chats with students & tutors'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {activeConversation && (
              <button
                type="button"
                onClick={handleDeleteConversation}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-red-300 transition-colors"
                title="Delete conversation"
                aria-label="Delete conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (activeConversation) {
                  navigate(`/dashboard/messages?conversation=${activeConversation.id}`);
                } else {
                  navigate('/dashboard/messages');
                }
              }}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Open in full screen"
              aria-label="Open in full screen"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Close chat window"
              aria-label="Close chat window"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* VIEW 1: ACTIVE CONVERSATION MESSAGES */}
        {/* ======================================================== */}
        {activeConversation ? (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoadingMsgs && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-xs text-slate-400 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">No messages here yet</p>
                  <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                    Say hello to start the conversation!
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.is_mine;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`group/message relative max-w-[80%] ${isMine ? 'self-end' : 'self-start'}`}>
                        <div
                          className={`rounded-2xl px-6 py-1.5 text-xs shadow-xs leading-relaxed whitespace-pre-wrap ${isMine
                            ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                            }`}
                        >
                          {msg.content}
                        </div>
                        {isMine && (
                          <div
                            ref={openMessageMenuId === msg.id ? messageMenuRef : null}
                            className="absolute right-1 bottom-0.5 z-10"
                          >
                            <button
                              type="button"
                              onClick={() => setOpenMessageMenuId((current) => current === msg.id ? null : msg.id)}
                              className={`rounded-lg bg-white/90 p-1 text-slate-500 shadow-sm transition-opacity hover:bg-brand-500 hover:text-white focus:opacity-100 ${openMessageMenuId === msg.id ? 'opacity-100' : 'opacity-0 group-hover/message:opacity-100'
                                }`}
                              title="Message options"
                              aria-label="Message options"
                              aria-expanded={openMessageMenuId === msg.id}
                            >
                              <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                            {openMessageMenuId === msg.id && (
                              <div className="absolute right-0 top-full mt-1 min-w-32 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMessage(msg)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-0.5 px-1 font-medium">
                        <span>{msg.formatted_time || formatTime(msg.created_at)}</span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Error notice */}
            {sendError && (
              <div className="px-4 py-1.5 bg-red-50 text-red-600 text-[11px] font-semibold border-t border-red-100 flex items-center justify-between">
                <span>{sendError}</span>
                <button
                  type="button"
                  onClick={() => setSendError(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={handleSend}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type a message..."
                disabled={isSending}
                className="flex-1 text-xs px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800 transition"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 hover:bg-brand-600 text-white disabled:opacity-40 disabled:hover:bg-brand-500 transition-colors shadow-xs shrink-0"
                aria-label="Send message"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        ) : (
          /* ======================================================== */
          /* VIEW 2: CONVERSATION LIST */
          /* ======================================================== */
          <div className="flex-1 flex flex-col min-h-0 bg-white">
            {/* Search */}
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800 transition"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {isLoadingConvs && conversations.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-xs text-slate-400 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                  Loading conversations...
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-6 text-center space-y-3">
                  <MessageCircle className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">No conversations yet</p>
                  <p className="text-[11px] text-slate-400 max-w-[220px] mx-auto">
                    {searchQuery
                      ? 'No conversations match your search.'
                      : 'Connect with a tutor or student to start chatting.'}
                  </p>
                  {!searchQuery && (
                    <div className="flex flex-col gap-2 pt-1 max-w-[200px] mx-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          navigate('/find-tutor');
                        }}
                        className="w-full py-1.5 px-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition shadow-xs"
                      >
                        Find a Tutor
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          navigate('/dashboard/messages');
                        }}
                        className="w-full py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                      >
                        Open Messaging Hub
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const other = conv.other_participant;
                  const hasUnread = conv.unread_count > 0;
                  const lastMsg = conv.last_message;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => setActiveConversation(conv)}
                      className={`flex items-center gap-3 p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${hasUnread ? 'bg-brand-50/40' : ''
                        }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {other?.avatar ? (
                          <img
                            src={other.avatar}
                            alt={other.name}
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-xs font-black text-white shadow-xs">
                            {other?.name ? other.name[0].toUpperCase() : <UserIcon className="h-4 w-4" />}
                          </div>
                        )}
                        {hasUnread && (
                          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-xs truncate ${hasUnread ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>
                            {other?.name || 'User'}
                          </p>
                          {lastMsg && (
                            <span className="text-[9px] text-slate-400 shrink-0 font-medium">
                              {formatTime(lastMsg.created_at)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <p className={`text-[11px] truncate ${hasUnread ? 'font-bold text-brand-900' : 'text-slate-500'}`}>
                            {lastMsg ? lastMsg.content : 'No messages yet'}
                          </p>
                          {hasUnread && (
                            <span className="rounded-full bg-brand-500 px-1.5 py-0.2 text-[9px] font-bold text-white shrink-0 shadow-xs">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Bar: Full Page Link */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/60 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/dashboard/messages');
                }}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 transition inline-flex items-center gap-1.5"
              >
                <span>Open Full Messaging Hub</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* FLOATING TRIGGER BUTTON (BOTTOM-RIGHT) */}
      {/* ======================================================== */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat' : 'Open messages'}
        className={`fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-all duration-300 transform active:scale-90 hover:scale-105 ${isOpen
          ? 'bg-slate-800 hover:bg-slate-900 rotate-90 shadow-slate-900/30'
          : 'bg-gradient-to-tr from-brand-600 via-brand-500 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 shadow-brand-500/35 hover:shadow-brand-500/50'
          }`}
      >
        {isOpen ? (
          <X className="h-6 w-6 transition-transform duration-200" />
        ) : (
          <div className="relative">
            <MessageCircle className="h-6 w-6" />
            {totalUnread > 0 && (
              <span className="absolute -top-3.5 -right-3.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white shadow-md ring-2 ring-white animate-in zoom-in-75 duration-200">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </div>
        )}
      </button>
    </>
  );
};
