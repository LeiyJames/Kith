import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Message, UserProfile } from '../services/mockDb';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  Send, Image, MapPin, Calendar, Clock, Check, CheckCheck, 
  Smile, Phone, Video, AlertCircle, ShieldCheck 
} from 'lucide-react';

const CHAT_USERS = [
  { id: 'org-foodbank', name: 'City Harvest Food Bank', role: 'Organization', avatar: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=150', verified: true },
  { id: 'user-elena', name: 'Elena Chen', role: 'User', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', verified: false },
  { id: 'org-greenwood', name: 'Greenwood Park Alliance', role: 'Organization', avatar: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=150', verified: true }
];

export const Messaging: React.FC = () => {
  const { messages, chatWithUser, currentUser, refreshMessages } = useApp();
  
  const [activeChatUserId, setActiveChatUserId] = useState<string>('org-foodbank');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter messages belonging to active thread
  const threadMessages = messages.filter(m => 
    (m.senderId === currentUser?.id && m.receiverId === activeChatUserId) ||
    (m.senderId === activeChatUserId && m.receiverId === currentUser?.id)
  );

  const activeChatUser = CHAT_USERS.find(cu => cu.id === activeChatUserId);

  useEffect(() => {
    scrollToBottom();
  }, [threadMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText;
    setInputText('');

    try {
      await chatWithUser(activeChatUserId, textToSend);
      
      // If sending to an organization, simulate a typing delay
      if (activeChatUserId === 'org-foodbank') {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          refreshMessages();
        }, 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Mock location sharing trigger
  const handleShareLocation = async () => {
    try {
      await chatWithUser(activeChatUserId, 'Shared coordinates: Downtown Sector B Center', 'location', {
        lat: 40.7128,
        lng: -74.0060,
        address: 'Downtown Sector B Center'
      });
      refreshMessages();
    } catch (err) {
      console.error(err);
    }
  };

  // Mock appointment scheduling bubble trigger
  const handleScheduleSession = async () => {
    try {
      await chatWithUser(
        activeChatUserId, 
        'Appointment Scheduled: Thursday, July 2nd, 3:00 PM', 
        'appointment', 
        { date: '2026-07-02', time: '3:00 PM' }
      );
      refreshMessages();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card className="h-[520px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-md grid grid-cols-1 md:grid-cols-3 overflow-hidden text-left">
      
      {/* 1. Conversations Sidebar list */}
      <div className="border-r border-slate-100 dark:border-slate-800/80 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/10">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60">
          <h2 className="text-sm font-bold font-display text-slate-800 dark:text-slate-100">Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
          {CHAT_USERS.filter(u => u.id !== currentUser?.id).map((user) => {
            const lastMsg = messages
              .filter(m => (m.senderId === user.id && m.receiverId === currentUser?.id) || (m.senderId === currentUser?.id && m.receiverId === user.id))
              .pop();

            return (
              <div
                key={user.id}
                onClick={() => setActiveChatUserId(user.id)}
                className={`p-4 flex items-center space-x-3 cursor-pointer transition-all duration-200 ${
                  activeChatUserId === user.id 
                    ? 'bg-brand-blue-50/20 dark:bg-brand-blue-900/10 border-l-4 border-brand-blue-500 font-semibold' 
                    : 'hover:bg-slate-100/50'
                }`}
              >
                <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-xl object-cover" />
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-205 flex items-center">
                      {user.name}
                      {user.verified && <ShieldCheck className="w-3.5 h-3.5 ml-1 text-brand-blue-500" />}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-1 truncate">
                    {lastMsg ? lastMsg.content : 'No messages yet.'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Message History Chat Area */}
      <div className="md:col-span-2 flex flex-col h-full bg-white dark:bg-slate-900">
        
        {/* Header User info */}
        {activeChatUser && (
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/30 dark:bg-slate-950/20">
            <div className="flex items-center space-x-3">
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
            
            <div className="flex space-x-2 text-slate-400">
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"><Phone className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"><Video className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {/* Message bubble stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {threadMessages.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">No messages yet in this thread.</p>
            </div>
          ) : (
            threadMessages.map((msg) => {
              const isMe = msg.senderId === currentUser?.id;
              
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
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

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-50 dark:bg-slate-850 border rounded-2xl rounded-bl-none px-4 py-2.5 text-xs text-slate-500 flex items-center space-x-2.5">
                <span className="font-semibold">Coordinator typing</span>
                <span className="flex space-x-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form controls */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center space-x-2 bg-slate-50/20 dark:bg-slate-950/10">
          <button
            type="button"
            onClick={handleShareLocation}
            title="Share Location coordinates"
            className="p-2.5 text-slate-400 hover:text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
          >
            <MapPin className="w-5 h-5" />
          </button>
          
          <button
            type="button"
            onClick={handleScheduleSession}
            title="Schedule session coordinates"
            className="p-2.5 text-slate-400 hover:text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer animate-pulse"
          >
            <Calendar className="w-5 h-5" />
          </button>

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
  );
};
