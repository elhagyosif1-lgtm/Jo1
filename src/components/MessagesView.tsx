import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Lock,
  ShieldCheck,
  Send,
  ArrowRight,
  Sparkles,
  Search,
  MessageCircle,
  CheckCheck
} from 'lucide-react';

export const MessagesView: React.FC = () => {
  const { setActiveTab } = useApp();

  const [activeChatId, setActiveChatId] = useState<string | null>('chat-1');
  const [inputMsg, setInputMsg] = useState('');

  const [conversations, setConversations] = useState([
    {
      id: 'chat-1',
      name: 'كريم تك ⚡',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      badgeLevel: 52,
      lastMsg: 'شكراً جزيلاً على الدعم الأسطوري في البث! 🚀',
      time: 'منذ 10 دقائق',
      unread: 1,
      messages: [
        {
          id: 'm1',
          sender: 'كريم تك ⚡',
          text: 'أهلاً يا صديقي يوسف! شفت إطلاق هدية طائر الفينيق في البث، كانت هزة شاشة خرافية 🔥',
          time: '10:42 م',
          isMe: false,
        },
        {
          id: 'm2',
          sender: 'أنت',
          text: 'تستاهل كل خير يا فنان، محتواك في التكنولوجيا والذكاء الاصطناعي الأفضل على الإطلاق!',
          time: '10:44 م',
          isMe: true,
        },
        {
          id: 'm3',
          sender: 'كريم تك ⚡',
          text: 'شكراً جزيلاً على الدعم الأسطوري في البث! 🚀',
          time: '10:45 م',
          isMe: false,
        },
      ],
    },
    {
      id: 'chat-2',
      name: 'سارة المغامرة 🏄‍♀️',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      badgeLevel: 50,
      lastMsg: 'الفيديو القادم هيكون عن قفزة المظلات 🪂',
      time: 'منذ ساعتين',
      unread: 0,
      messages: [
        {
          id: 'm2-1',
          sender: 'سارة',
          text: 'الفيديو القادم هيكون عن قفزة المظلات 🪂 لا تفوت العرض الأول!',
          time: '08:30 م',
          isMe: false,
        },
      ],
    },
  ]);

  const activeChat = conversations.find(c => c.id === activeChatId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !activeChatId) return;

    setConversations(prev =>
      prev.map(c => {
        if (c.id === activeChatId) {
          return {
            ...c,
            lastMsg: inputMsg.trim(),
            time: 'الآن',
            messages: [
              ...c.messages,
              {
                id: `m-${Date.now()}`,
                sender: 'أنت',
                text: inputMsg.trim(),
                time: 'الآن',
                isMe: true,
              },
            ],
          };
        }
        return c;
      })
    );
    setInputMsg('');
  };

  return (
    <div className="w-full h-full bg-black text-white flex flex-col pt-safe pb-24 overflow-hidden select-none">
      {/* Top Header */}
      <div className="px-4 py-3 bg-neutral-950 border-b border-neutral-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('feed')}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-1.5">
              <span>المحادثات الخاصة والمشفرة</span>
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
            </h2>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
              <ShieldCheck className="w-3 h-3" />
              <span>محادثات مشفرة طرفاً لطرف E2EE آمنة تماماً</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
        {/* Left: Chat List */}
        <div className="border-l border-neutral-900 bg-neutral-950 overflow-y-auto no-scrollbar p-3 space-y-1">
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="ابحث في الرسائل..."
              className="w-full bg-neutral-900 text-xs rounded-xl pr-9 pl-3 py-2 border border-neutral-800 outline-none text-white placeholder-neutral-500"
            />
          </div>

          {conversations.map(c => {
            const isSelected = c.id === activeChatId;
            return (
              <div
                key={c.id}
                onClick={() => setActiveChatId(c.id)}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-neutral-850 border border-neutral-700'
                    : 'hover:bg-neutral-900 border border-transparent'
                }`}
              >
                <div className="relative">
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                  {c.badgeLevel && (
                    <span className="absolute -bottom-1 -right-1 px-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 text-[9px] font-black text-white">
                      {c.badgeLevel}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white truncate">{c.name}</h4>
                    <span className="text-[10px] text-neutral-500">{c.time}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 truncate mt-0.5">{c.lastMsg}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Active Chat Conversation */}
        <div className="col-span-2 flex flex-col bg-black overflow-hidden">
          {activeChat ? (
            <>
              {/* Chat Sub-Header */}
              <div className="px-4 py-2.5 bg-neutral-900/60 backdrop-blur-md border-b border-neutral-850 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={activeChat.avatar}
                    alt={activeChat.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{activeChat.name}</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 text-[9px] font-black">
                        LVL {activeChat.badgeLevel}
                      </span>
                    </h3>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> تشفير آمن 256-bit نشط
                    </span>
                  </div>
                </div>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-center max-w-xs mx-auto text-[10px] text-emerald-300">
                  🔒 الرسائل والمكالمات في هذه المحادثة مشفرة بالكامل بين الطرفين. لا يمكن لأحد قراءتها بما في ذلك خوادم المنصة.
                </div>

                {activeChat.messages.map(m => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        m.isMe
                          ? 'bg-rose-600 text-white rounded-br-xs'
                          : 'bg-neutral-850 text-neutral-100 rounded-bl-xs border border-neutral-700'
                      }`}
                    >
                      {m.text}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 px-1 text-[9px] text-neutral-500">
                      <span>{m.time}</span>
                      {m.isMe && <CheckCheck className="w-3 h-3 text-cyan-400" />}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-neutral-950 border-t border-neutral-850 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMsg}
                  onChange={e => setInputMsg(e.target.value)}
                  placeholder="اكتب رسالة مشفرة آمنة..."
                  className="flex-1 bg-neutral-850 text-white text-xs rounded-full px-4 py-2.5 outline-none focus:ring-1 focus:ring-rose-500"
                />
                <button
                  type="submit"
                  disabled={!inputMsg.trim()}
                  className="p-2.5 rounded-full bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-6 text-neutral-500 text-xs">
              اختر محادثة من القائمة للبدء.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
