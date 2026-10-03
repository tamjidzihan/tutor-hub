import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { messagingApi } from '../api/messaging';
import type { Conversation, Message } from '../types';
import {
  Send, MessageSquare, Search, Check, CheckCheck, Trash2, ChevronDown
} from 'lucide-react';

export const Messages: React.FC = () => {
  const { user } = useAuth();
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
    fetchConversations().then(async (loadedConvs) => {
      // Check URL query parameters for ?conversation= or ?tutor=
      const params = new URLSearchParams(location.search);
      const convParam = params.get('conversation');
      const tutorParam = params.get('tutor');

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
        } catch {
          showToast('Could not start conversation with tutor.', 'error');
        }
      } else if (loadedConvs.length > 0 && !activeConversationId) {
        setActiveConversationId(loadedConvs[0].id);
      }
    });
  }, [location.search]);

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
          // Update conversation unread count in state
          setConversations((prev) =>
            prev.map((c) => (c.id === activeConversationId ? { ...c, unread_count: 0 } : c))
          );
        }
      } catch {
        // Soft fail
      }
    };

    loadMessages();

    // Polling every 3.5s for real-time messaging updates
    const interval = setInterval(loadMessages, 3500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeConversationId]);

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
      navigate(location.pathname, { replace: true });
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
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[calc(100vh-130px)] flex flex-col md:flex-row">

        {/* Sidebar: Conversation List */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col h-full bg-white">
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 font-heading">Messages</h2>
              <span className="text-xs font-bold text-slate-400">
                {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
              </span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {isLoadingConvs ? (
              <div className="p-6 text-center text-xs text-slate-400">Loading conversations...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No conversations yet</p>
                <p className="text-[11px] text-slate-400">
                  Open any tutor profile or application to initiate a direct chat.
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                const participant = conv.other_participant;
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`w-full text-left p-4 flex items-start gap-3 transition-colors ${isActive ? 'bg-brand-50/60 border-l-4 border-brand-500' : 'hover:bg-slate-50'
                      }`}
                  >
                    <div className="relative w-10 h-10 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-sm shrink-0 overflow-hidden shadow-xs">
                      {participant?.avatar ? (
                        <img src={participant.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        participant?.name?.[0] || 'U'
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {participant?.name || 'User'}
                        </h4>
                        {conv.unread_count > 0 && (
                          <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${participant?.role === 'TUTOR'
                            ? 'bg-sky-50 text-sky-700'
                            : participant?.role === 'ADMIN'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-emerald-50 text-emerald-700'
                            }`}
                        >
                          {participant?.role === 'TUTOR' ? 'Tutor' : participant?.role === 'ADMIN' ? 'Admin' : 'Student'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 truncate">
                        {conv.last_message?.content || 'No messages yet.'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Chat Window */}
        <div className="flex-1 flex flex-col h-full bg-slate-50/40">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-sm overflow-hidden shadow-xs">
                    {otherParty?.avatar ? (
                      <img src={otherParty.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      otherParty?.name?.[0] || 'U'
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{otherParty?.name}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${otherParty?.role === 'TUTOR'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200/60'
                          : otherParty?.role === 'ADMIN'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          }`}
                      >
                        {otherParty?.role === 'TUTOR' ? 'Verified Tutor' : otherParty?.role === 'ADMIN' ? 'Admin' : 'Student'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{otherParty?.email}</p>
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

              {/* Message Thread */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-12 space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-600">Start the conversation</p>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                      Send a message to discuss tutoring schedule, subjects, and learning requirements.
                    </p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMine = m.is_mine;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div className={`group/message relative max-w-[75%] sm:max-w-md ${isMine ? 'self-end' : 'self-start'}`}>
                          <div
                            className={`rounded-2xl px-6 py-2 text-xs shadow-xs leading-relaxed ${isMine
                              ? 'bg-brand-500 text-white rounded-br-xs'
                              : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                              }`}
                          >
                            <p className="whitespace-pre-line">{m.content}</p>
                          </div>
                          {isMine && (
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
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-1">
                          <span>{m.formatted_time}</span>
                          {isMine && (
                            <span>
                              {m.is_read ? (
                                <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
                              ) : (
                                <Check className="w-3 h-3 text-slate-400" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    placeholder={`Message ${otherParty?.name || '...'} (Enter to send)`}
                    className="flex-1 text-xs rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !newMessageText.trim()}
                    className="p-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-colors shadow-xs"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center shadow-xs">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Select a Conversation</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Choose a chat from the sidebar or click "Message Tutor" on any tutor profile to initiate direct communication.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
