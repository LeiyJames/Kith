import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Message, UserProfile, mockDb, supabase, mapProfile } from '../services/mockDb';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  Send, Check, CheckCheck, 
  MapPin, Calendar, AlertCircle, ShieldCheck, Trash2, X 
} from 'lucide-react';

export const Messaging: React.FC = () => {
  const { messages, chatWithUser, currentUser, markMessagesAsRead, deleteMessage, deleteConversation, showToast } = useApp();
  const location = useLocation();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeChatUserId, setActiveChatUserId] = useState<string>('');
  const [deleteConvoTarget, setDeleteConvoTarget] = useState<UserProfile | null>(null);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);
  const prevThreadLenRef = useRef(0);

  // Extract partner IDs to prevent infinite fetching loops by monitoring ID string list changes only
  const chatUserIdsStr = Array.from(
    new Set(
      messages
        .map(m => m.senderId === currentUser?.id ? m.receiverId : m.senderId)
        .filter(id => id && id !== currentUser?.id)
    )
  ).sort().join(',');

  // Load profiles of active chat users (targeted load rather than listing entire database)
  useEffect(() => {
    if (!currentUser) return;

    const loadChatUsers = async () => {
      try {
        const ids = chatUserIdsStr ? chatUserIdsStr.split(',') : [];
        if (location.state?.userId && !ids.includes(location.state.userId)) {
          ids.push(location.state.userId);
        }

        if (ids.length === 0) {
          setUsers([]);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .in('id', ids);

        if (error) throw error;
        setUsers((data || []).map(mapProfile));
      } catch (err) {
        console.error('Error loading chat users:', err);
      }
    };
    loadChatUsers();
  }, [currentUser, chatUserIdsStr, location.state?.userId]);

  // Sort users so that ones with active chat history appear at the top, ordered by most recent message
  const sortedChatUsers = [...users].sort((a, b) => {
    const msgsA = messages.filter(m => (m.senderId === a.id && m.receiverId === currentUser?.id) || (m.senderId === currentUser?.id && m.receiverId === a.id));
    const msgsB = messages.filter(m => (m.senderId === b.id && m.receiverId === currentUser?.id) || (m.senderId === currentUser?.id && m.receiverId === b.id));
    
    const lastMsgA = msgsA[msgsA.length - 1];
    const lastMsgB = msgsB[msgsB.length - 1];
    
    const timeA = lastMsgA ? new Date(lastMsgA.timestamp).getTime() : 0;
    const timeB = lastMsgB ? new Date(lastMsgB.timestamp).getTime() : 0;
    
    return timeB - timeA;
  });

  // Filter to only display users who have chat history or who are being explicitly messaged via location state
  const chatUsersToDisplay = sortedChatUsers.filter(user => 
    user.id === location.state?.userId ||
    messages.some(m => (m.senderId === user.id && m.receiverId === currentUser?.id) || (m.senderId === currentUser?.id && m.receiverId === user.id))
  );

  // Set active chat user dynamically on load/state change
  useEffect(() => {
    if (location.state?.userId) {
      setActiveChatUserId(location.state.userId);
    } else if (!activeChatUserId && chatUsersToDisplay.length > 0) {
      setActiveChatUserId(chatUsersToDisplay[0].id);
    }
  }, [location.state, chatUsersToDisplay, activeChatUserId]);

  // Mark messages in active thread as read safely (avoiding infinite loops by checking hasUnread state first)
  useEffect(() => {
    if (activeChatUserId) {
      const hasUnread = messages.some(m => m.senderId === activeChatUserId && m.receiverId === currentUser?.id && m.status !== 'read');
      if (hasUnread) {
        markMessagesAsRead(activeChatUserId);
      }
    }
  }, [activeChatUserId, messages, currentUser?.id, markMessagesAsRead]);

  // Filter messages belonging to active thread
  const threadMessages = messages.filter(m => 
    activeChatUserId && (
      (m.senderId === currentUser?.id && m.receiverId === activeChatUserId) ||
      (m.senderId === activeChatUserId && m.receiverId === currentUser?.id)
    )
  );

  const activeChatUser = users.find(cu => cu.id === activeChatUserId);

  // Only auto-scroll when a new message arrives and the user hasn't scrolled up
  useEffect(() => {
    const isNewMessage = threadMessages.length > prevThreadLenRef.current;
    prevThreadLenRef.current = threadMessages.length;

    if (isNewMessage && !userScrolledUpRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [threadMessages]);

  // Scroll to bottom on first load or when switching threads
  useEffect(() => {
    userScrolledUpRef.current = false;
    prevThreadLenRef.current = threadMessages.length;
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [activeChatUserId]);

  // Detect if user has scrolled away from the bottom
  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    userScrolledUpRef.current = distFromBottom > 80;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatUserId) return;

    const textToSend = inputText;
    setInputText('');

    try {
      await chatWithUser(activeChatUserId, textToSend);
    } catch (err) {
      console.error(err);
    }
  };



  // Mobile: toggle between sidebar and chat view
  const [showMobileChat, setShowMobileChat] = useState(false);

  // When selecting a user on mobile, switch to chat view
  const handleSelectUser = (userId: string) => {
    setActiveChatUserId(userId);
    setShowMobileChat(true);
  };

  return (
    <>
    <Card className="h-[calc(100vh-180px)] min-h-[400px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-md flex flex-col md:grid md:grid-cols-3 overflow-hidden text-left">
      
      {/* 1. Conversations Sidebar list */}
      <div className={`border-r border-slate-100 dark:border-slate-800/80 flex flex-col min-h-0 bg-slate-50/50 dark:bg-slate-950/10 ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 flex-shrink-0">
          <h2 className="text-sm font-bold font-display text-slate-800 dark:text-slate-100">Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-slate-100 dark:divide-slate-800/80">
          {chatUsersToDisplay.length === 0 ? (
            <div className="p-6 text-center text-slate-400 dark:text-slate-500 py-16 space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold">No active chats yet</p>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                When a volunteer claims your donation or messages you about a listing, they will appear here.
              </p>
            </div>
          ) : (
            chatUsersToDisplay.map((user) => {
              const lastMsg = messages
                .filter(m => (m.senderId === user.id && m.receiverId === currentUser?.id) || (m.senderId === currentUser?.id && m.receiverId === user.id))
                .pop();
              const isUnread = lastMsg && lastMsg.senderId === user.id && lastMsg.status !== 'read';

              return (
                <div
                  key={user.id}
                  className={`p-4 flex items-center space-x-3 cursor-pointer group/conv transition-all duration-200 ${
                    activeChatUserId === user.id 
                      ? 'bg-brand-blue-50/20 dark:bg-brand-blue-900/10 border-l-4 border-brand-blue-500 font-semibold' 
                      : 'hover:bg-slate-100/50'
                  }`}
                >
                  <div className="flex-1 flex items-center space-x-3 overflow-hidden" onClick={() => handleSelectUser(user.id)}>
                    <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-850 dark:text-slate-200 flex items-center">
                          {user.name}
                          {user.verified && <ShieldCheck className="w-3.5 h-3.5 ml-1 text-brand-blue-500 flex-shrink-0" />}
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-brand-blue-500 animate-pulse ml-2 flex-shrink-0" />
                          )}
                        </span>
                        <span className="text-[9px] text-slate-400 flex-shrink-0">
                          {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className={`text-[10px] mt-1 truncate ${isUnread ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-450 dark:text-slate-400'}`}>
                        {lastMsg ? lastMsg.content : 'No messages yet.'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConvoTarget(user);
                    }}
                    className="opacity-0 group-hover/conv:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all flex-shrink-0 cursor-pointer"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Message History Chat Area */}
      <div className={`md:col-span-2 flex flex-col min-h-0 bg-white dark:bg-slate-900 ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Header User info */}
        {activeChatUser ? (
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/30 dark:bg-slate-950/20 flex-shrink-0">
            <div className="flex items-center space-x-3">
              {/* Back button for mobile */}
              <button
                onClick={() => setShowMobileChat(false)}
                className="md:hidden p-1.5 -ml-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <img src={activeChatUser.avatar} alt="avatar" className="w-8 h-8 rounded-lg object-cover" />
              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-150 flex items-center">
                  {activeChatUser.name}
                  {activeChatUser.verified && <ShieldCheck className="w-3.5 h-3.5 ml-1 text-brand-blue-500" />}
                </h3>
                <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wide">
                  {activeChatUser.role}
                </span>
              </div>
            </div>
            

          </div>
        ) : (
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center bg-slate-50/30 dark:bg-slate-950/20 flex-shrink-0">
            <button
              onClick={() => setShowMobileChat(false)}
              className="md:hidden p-1.5 -ml-1 mr-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="text-xs text-slate-400 font-medium">Select a conversation</span>
          </div>
        )}

        {/* Message bubble stream — scrollable */}
        <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4">
          {threadMessages.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">No messages yet in this thread.</p>
            </div>
          ) : (
            threadMessages.map((msg) => {
              const isMe = msg.senderId === currentUser?.id;
              
              return (
                <div key={msg.id} className={`flex items-end group/msg ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {isMe && (
                    <button
                      onClick={() => {
                        deleteMessage(msg.id);
                      }}
                      className="opacity-0 group-hover/msg:opacity-100 p-1 text-slate-300 hover:text-red-500 rounded transition-all mr-1 flex-shrink-0 cursor-pointer"
                      title="Delete message"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                  <div className={`max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-1.5 shadow-sm ${
                    isMe 
                      ? 'bg-brand-blue-500 text-white rounded-br-none' 
                      : 'bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-800/80'
                  }`}>
                    
                    {/* Render attachment bubble based on types */}
                    {msg.type === 'location' && (
                      <div className="flex items-center space-x-2 p-1 bg-black/5 dark:bg-white/5 rounded-lg border border-black/10">
                        <MapPin className="w-4 h-4 text-brand-amber-500 fill-brand-amber-500/10" />
                        <span className="font-semibold text-[10px]">Location Shared</span>
                      </div>
                    )}

                    {msg.type === 'appointment' && (
                      <div className="flex items-center space-x-2 p-1.5 bg-black/5 dark:bg-white/5 rounded-lg border border-black/10 text-left">
                        <Calendar className="w-4 h-4 text-brand-green-500" />
                        <div>
                          <p className="font-bold text-[10px] uppercase">Meeting Scheduled</p>
                          <p className="text-[9px] opacity-80">{msg.metadata?.date} at {msg.metadata?.time}</p>
                        </div>
                      </div>
                    )}

                    {msg.type === 'donation_status' && (
                      <div className="flex items-center space-x-2 p-1 bg-black/5 dark:bg-white/5 rounded-lg border border-black/10 text-[10px]">
                        <Check className="w-4 h-4 text-brand-green-500" />
                        <span className="font-semibold">Donation Reserved successfully</span>
                      </div>
                    )}

                    <p>{msg.content}</p>

                    {/* Timestamp & receipts */}
                    <div className="flex justify-end items-center space-x-1 text-[9px] opacity-70">
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMe && (
                        msg.status === 'read' ? <CheckCheck className="w-3 h-3 text-brand-green-300" /> : <Check className="w-3 h-3 text-slate-300" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form controls */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center space-x-2 bg-slate-50/20 dark:bg-slate-950/10 flex-shrink-0">
          <input
            type="text"
            className="flex-1 px-4 py-2 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl text-xs focus:outline-none focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 text-slate-800 dark:text-slate-100"
            placeholder="Type your message here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          
          <Button type="submit" variant="primary" className="p-2.5 rounded-xl min-w-0" disabled={!inputText.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>

    {/* Delete Conversation Confirmation Modal */}
    {deleteConvoTarget && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConvoTarget(null)}>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm mx-4 overflow-hidden animate-in" onClick={e => e.stopPropagation()}>
          <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Delete Conversation</h3>
            <button onClick={() => setDeleteConvoTarget(null)} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center space-x-3">
              <img src={deleteConvoTarget.avatar} alt="" className="w-10 h-10 rounded-xl object-cover" />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{deleteConvoTarget.name}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">{deleteConvoTarget.role}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              This will permanently delete all messages in this conversation. This action cannot be undone.
            </p>
          </div>
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteConvoTarget(null)} className="cursor-pointer font-semibold">
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="cursor-pointer font-semibold"
              onClick={async () => {
                await deleteConversation(deleteConvoTarget.id);
                if (activeChatUserId === deleteConvoTarget.id) {
                  setActiveChatUserId('');
                  setShowMobileChat(false);
                }
                setDeleteConvoTarget(null);
                showToast('Conversation deleted.', 'success');
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
