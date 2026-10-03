import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Navigate, Link } from 'react-router-dom';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { messagingApi } from '../api/messaging';
import { tutorsApi } from '../api/tutors';
import type { Conversation, Message, Tutor } from '../types';
import {
  Send,
  MessageSquare,
  Search,
  Check,
  CheckCheck,
  User as UserIcon,
  Sparkles,
  Loader2,
  Plus,
  X,
  GraduationCap,
  Briefcase,
  Trash2,
  ChevronDown
} from 'lucide-react';

export const DashboardMessagesPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [openMessageMenuId, setOpenMessageMenuId] = useState<string | null>(null);

  // New Chat Modal State
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState('');
  const [availableTutors, setAvailableTutors] = useState<Tutor[]>([]);
  const [isLoadingTutors, setIsLoadingTutors] = useState(false);
  const [manualTargetInput, setManualTargetInput] = useState('');
  const [isStartingChat, setIsStartingChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversations on mount
  const fetchConversations = async () => {
    try {
      const data = await messagingApi.getConversations();
      setConversations(data);
      return data;
    } catch {
      showToast('Could not load conversations.', 'error');
      return [];
    } finally {
      setIsLoadingConvs(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchConversations().then(async (loadedConvs) => {
      const params = new URLSearchParams(location.search);
      const convParam = params.get('conversation');
      const tutorParam = params.get('tutor');
      const userParam = params.get('user') || params.get('target_user');

      if (convParam) {
        setActiveConversationId(convParam);
      } else if (tutorParam) {
        try {
          const conv = await messagingApi.startConversation({ tutor_id: tutorParam });
          setConversations((prev) => {
            const exists = prev.find((c) => c.id === conv.id);
            return exists ? prev : [conv, ...prev];
          });
          setActiveConversationId(conv.id);
          navigate(`/dashboard/messages?conversation=${conv.id}`, { replace: true });
        } catch {
          showToast('Could not start conversation with tutor.', 'error');
        }
      } else if (userParam) {
        try {
          const conv = await messagingApi.startConversation({ target_user_id: userParam });
          setConversations((prev) => {
            const exists = prev.find((c) => c.id === conv.id);
            return exists ? prev : [conv, ...prev];
          });
          setActiveConversationId(conv.id);
          navigate(`/dashboard/messages?conversation=${conv.id}`, { replace: true });
        } catch {
          showToast('Could not start conversation with student.', 'error');
        }
      } else if (loadedConvs.length > 0 && !activeConversationId) {
        setActiveConversationId(loadedConvs[0].id);
        navigate(`/dashboard/messages?conversation=${loadedConvs[0].id}`, { replace: true });
      }
    });
  }, [location.search, isAuthenticated]);

  // Load tutors for new chat modal
  useEffect(() => {
    if (!isNewChatOpen) return;
    const fetchTutors = async () => {
      setIsLoadingTutors(true);
      try {
        const res = await tutorsApi.getTutors({ search: newChatSearch.trim() || undefined });
        setAvailableTutors(res.results.slice(0, 10));
      } catch {
        // Soft fail
      } finally {
        setIsLoadingTutors(false);
      }
    };
    const timer = setTimeout(fetchTutors, 300);
    return () => clearTimeout(timer);
  }, [isNewChatOpen, newChatSearch]);

  const handleStartChatWithTutor = async (tutor: Tutor) => {
    setIsStartingChat(true);
    try {
      const conv = await messagingApi.startConversation({ tutor_id: tutor.tutor_id || tutor.id });
      setConversations((prev) => {
        const exists = prev.find((c) => c.id === conv.id);
        return exists ? prev : [conv, ...prev];
      });
      setActiveConversationId(conv.id);
      setIsNewChatOpen(false);
      navigate(`/dashboard/messages?conversation=${conv.id}`, { replace: true });
      showToast(`Conversation started with ${tutor.name}!`, 'success');
    } catch {
      showToast('Failed to start conversation.', 'error');
    } finally {
      setIsStartingChat(false);
    }
  };

  const handleStartManualChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = manualTargetInput.trim();
    if (!query || isStartingChat) return;

    setIsStartingChat(true);
    try {
      const conv = await messagingApi.startConversation({ target_user_id: query });
      setConversations((prev) => {
        const exists = prev.find((c) => c.id === conv.id);
        return exists ? prev : [conv, ...prev];
      });
      setActiveConversationId(conv.id);
      setIsNewChatOpen(false);
      setManualTargetInput('');
      navigate(`/dashboard/messages?conversation=${conv.id}`, { replace: true });
      showToast('Conversation ready!', 'success');
    } catch {
      showToast('Could not find user with this email or ID.', 'error');
    } finally {
      setIsStartingChat(false);
    }
  };

  // Load messages whenever activeConversationId changes
  useEffect(() => {
    if (!activeConversationId) return;

    let isMounted = true;
    const loadMessages = async () => {
      try {
        const msgs = await messagingApi.getMessages(activeConversationId);
        if (isMounted) {
          setMessages(msgs);
          scrollToBottom();
          // Update conversation unread count in local state
          setConversations((prev) =>
            prev.map((c) => (c.id === activeConversationId ? { ...c, unread_count: 0 } : c))
          );
        }
      } catch {
        // Soft fail
      }
    };

    loadMessages();

    // Mark as read in backend
    messagingApi.markAsRead(activeConversationId).catch(() => { });

    // Polling every 3.5s for real-time messaging updates
    const interval = setInterval(loadMessages, 3500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeConversationId]);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversationId || !newMessageText.trim() || isSending) return;

    const content = newMessageText.trim();
    setNewMessageText('');
    setIsSending(true);

    try {
      const msg = await messagingApi.sendMessage(activeConversationId, content);
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();

      // Update last message in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? {
              ...c,
              last_message: {
                content,
                created_at: new Date().toISOString(),
                sender_id: user?.id || '',
                is_read: false,
              },
            }
            : c
        )
      );
    } catch {
      showToast('Message could not be sent.', 'error');
      setNewMessageText(content);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (message: Message) => {
    if (!activeConversationId || !window.confirm('Delete this message permanently?')) return;

    try {
      await messagingApi.deleteMessage(activeConversationId, message.id);
      setMessages((prev) => prev.filter((item) => item.id !== message.id));
      setOpenMessageMenuId(null);
      await fetchConversations();
      showToast('Message deleted.', 'success');
    } catch {
      showToast('Message could not be deleted.', 'error');
    }
  };

  const handleDeleteConversation = async () => {
    if (!activeConversation || !window.confirm('Delete this conversation and all its messages permanently?')) return;

    try {
      await messagingApi.deleteConversation(activeConversation.id);
      setConversations((prev) => prev.filter((item) => item.id !== activeConversation.id));
      setActiveConversationId(null);
      setMessages([]);
      navigate('/dashboard/messages', { replace: true });
      showToast('Conversation deleted.', 'success');
    } catch {
      showToast('Conversation could not be deleted.', 'error');
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const otherParty = activeConversation?.other_participant;

  const filteredConversations = conversations.filter((c) => {
    const name = c.other_participant?.name || '';
    const email = c.other_participant?.email || '';
    const q = searchQuery.toLowerCase();
    return name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
  });

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 p-6 text-white shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-brand-500 px-2.5 py-1 text-xs font-bold">
                Dashboard Messages
              </span>
              <span className="text-xs text-slate-400">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </span>
            </div>
            <h1 className="mt-2 font-heading text-2xl font-black text-white sm:text-3xl">
              Direct Messages & Inquiries
            </h1>
            <p className="mt-1 text-xs text-slate-300 sm:text-sm max-w-xl">
              Communicate directly with verified tutors and students in real time.
            </p>
          </div>
        </div>

        {/* Split Screen Messaging Window */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden h-[calc(100vh-230px)] min-h-[580px] flex flex-col md:flex-row">

          {/* Left Column: Conversation List */}
          <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col h-full bg-white shrink-0">
            <div className="p-4 border-b border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 font-heading">
                    Conversations
                  </h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {conversations.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewChatOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
                  title="Start a new direct message"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Chat</span>
                </button>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-brand-500 text-slate-800 transition"
                />
              </div>
            </div>

            {/* Conversation Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {isLoadingConvs ? (
                <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                  Loading conversations...
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">No conversations</p>
                  <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                    {searchQuery ? 'No match found for your search.' : 'You have no messages yet.'}
                  </p>
                  {!searchQuery && (
                    <button
                      type="button"
                      onClick={() => setIsNewChatOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 text-xs font-bold transition shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Start a New Chat</span>
                    </button>
                  )}
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const other = c.other_participant;
                  const isActive = c.id === activeConversationId;
                  const hasUnread = c.unread_count > 0;

                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setActiveConversationId(c.id);
                        navigate(`/dashboard/messages?conversation=${c.id}`, { replace: true });
                      }}
                      className={`flex items-center gap-3.5 p-4 cursor-pointer transition-all duration-150 ${isActive
                        ? 'bg-brand-50/80 border-l-4 border-brand-500'
                        : 'hover:bg-slate-50'
                        }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {other?.avatar ? (
                          <img
                            src={other.avatar}
                            alt=""
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                            {other?.name ? other.name[0].toUpperCase() : <UserIcon className="w-5 h-5" />}
                          </div>
                        )}
                        {hasUnread && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full ring-2 ring-white" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-xs truncate ${hasUnread ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>
                            {other?.name || 'User'}
                          </p>
                          {c.last_message && (
                            <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                              {new Date(c.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p className={`text-xs truncate ${hasUnread ? 'font-bold text-brand-900' : 'text-slate-500'}`}>
                            {c.last_message ? c.last_message.content : 'No messages yet'}
                          </p>
                          {other?.role && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase tracking-wider shrink-0">
                              {other.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Chat Window */}
          <div className="flex-1 flex flex-col h-full bg-slate-50/40">
            {activeConversation ? (
              <>
                {/* Active Chat Header */}
                <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {otherParty?.avatar ? (
                      <img
                        src={otherParty.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                        {otherParty?.name ? otherParty.name[0].toUpperCase() : <UserIcon className="w-5 h-5" />}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900 font-heading">
                          {otherParty?.name}
                        </h4>
                        {otherParty?.role && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 uppercase tracking-wider border border-brand-200">
                            {otherParty.role}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {otherParty?.email}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDeleteConversation}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete conversation"
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Message Bubbles Container */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center py-16 space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-700">No messages in this chat yet</p>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Send a message below to start the direct conversation.
                      </p>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.is_mine;
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className={`group/message relative max-w-[75%] ${isMe ? 'self-end' : 'self-start'}`}>
                            <div
                              className={`rounded-2xl px-6 py-1.5 text-xs shadow-xs leading-relaxed whitespace-pre-wrap ${isMe
                                ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-br-xs'
                                : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                                }`}
                            >
                              {m.content}
                            </div>
                            {isMe && (
                              <div className="absolute right-1 bottom-0.5 z-10">
                                <button
                                  type="button"
                                  onClick={() => setOpenMessageMenuId((current) => current === m.id ? null : m.id)}
                                  className={`rounded-lg bg-white/90 p-1 text-slate-500 shadow-sm transition-opacity hover:bg-white hover:text-slate-800 focus:opacity-100 ${openMessageMenuId === m.id ? 'opacity-100' : 'opacity-0 group-hover/message:opacity-100'
                                    }`}
                                  title="Message options"
                                  aria-label="Message options"
                                  aria-expanded={openMessageMenuId === m.id}
                                >
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </button>
                                {openMessageMenuId === m.id && (
                                  <div className="absolute right-0 top-full mt-1 min-w-32 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteMessage(m)}
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

                          <div className="flex items-center gap-1 mt-1 px-1">
                            <span className="text-[10px] text-slate-400">
                              {m.formatted_time || new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && (
                              m.is_read ? (
                                <CheckCheck className="w-3.5 h-3.5 text-brand-600" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-slate-400" />
                              )
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Form */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-4 bg-white border-t border-slate-200 flex items-center gap-3"
                >
                  <input
                    type="text"
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Type your message..."
                    disabled={isSending}
                    className="flex-1 text-xs px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-brand-500 focus:bg-white text-slate-800 transition"
                  />
                  <button
                    type="submit"
                    disabled={!newMessageText.trim() || isSending}
                    className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold disabled:opacity-40 transition-colors shadow-sm shrink-0"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Send</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-200/60 shadow-xs flex items-center justify-center text-brand-600">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800">
                    No Conversation Selected
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Select a conversation from the left sidebar or start a new direct message.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewChatOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-xs transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Start New Chat</span>
                  </button>
                  <Link
                    to="/find-tutor"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Browse Tutors</span>
                  </Link>
                  <Link
                    to="/job-board"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Tuition Jobs</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* START NEW CONVERSATION MODAL */}
      {/* ======================================================== */}
      {isNewChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-xs">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-slate-900 text-sm">
                    Start Direct Conversation
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Connect with a verified tutor or student
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewChatOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Tutor Search */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Search Verified Tutors
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={newChatSearch}
                    onChange={(e) => setNewChatSearch(e.target.value)}
                    placeholder="Search by tutor name, subject, or ID..."
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-brand-500 transition text-slate-800"
                  />
                </div>
              </div>

              {/* Tutors Quick List */}
              <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-slate-100">
                {isLoadingTutors ? (
                  <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                    Finding tutors...
                  </div>
                ) : availableTutors.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-400">
                    No tutors found matching query.
                  </p>
                ) : (
                  availableTutors.map((tut) => (
                    <div
                      key={tut.id}
                      className="flex items-center justify-between gap-3 py-2.5 hover:bg-slate-50 px-2 rounded-xl transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {tut.profile_photo ? (
                          <img
                            src={tut.profile_photo}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {tut.name ? tut.name[0].toUpperCase() : 'T'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {tut.name}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {tut.university || tut.area || tut.tutor_id}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={isStartingChat}
                        onClick={() => handleStartChatWithTutor(tut)}
                        className="px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shrink-0 shadow-xs transition active:scale-95"
                      >
                        Message
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-400 font-bold text-[10px]">
                    Or message any student / user by email or ID
                  </span>
                </div>
              </div>

              {/* Manual Entry Form */}
              <form onSubmit={handleStartManualChat} className="space-y-3">
                <input
                  type="text"
                  value={manualTargetInput}
                  onChange={(e) => setManualTargetInput(e.target.value)}
                  placeholder="Enter user email or User UUID..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-brand-500 transition text-slate-800"
                />
                <button
                  type="submit"
                  disabled={!manualTargetInput.trim() || isStartingChat}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold disabled:opacity-40 transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  {isStartingChat ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Open Conversation</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
