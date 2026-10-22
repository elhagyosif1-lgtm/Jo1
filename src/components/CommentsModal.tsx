import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Heart, Send } from 'lucide-react';

export const CommentsModal: React.FC = () => {
  const {
    activeCommentsModalVideoId,
    setActiveCommentsModalVideoId,
    comments,
    addComment,
    likeComment,
    t,
  } = useApp();

  const [inputVal, setInputVal] = useState('');
  const quickEmojis = ['🔥', '❤️', '😂', '👏', '😍', '✨', '💯', '🙌'];

  if (!activeCommentsModalVideoId) return null;

  const videoComments = comments[activeCommentsModalVideoId] || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    addComment(activeCommentsModalVideoId, inputVal.trim());
    setInputVal('');
  };

  const handleAddEmoji = (emoji: string) => {
    setInputVal(prev => prev + emoji);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      {/* Background click to close */}
      <div
        className="absolute inset-0"
        onClick={() => setActiveCommentsModalVideoId(null)}
      />

      {/* Slide-up Sheet */}
      <div className="relative z-10 w-full max-w-lg h-[75vh] max-h-[640px] bg-neutral-900 border-t border-neutral-800 rounded-t-3xl flex flex-col shadow-2xl overflow-hidden select-none animate-in slide-in-from-bottom duration-200">
        {/* Grab Handle */}
        <div className="w-12 h-1 bg-neutral-700 rounded-full mx-auto my-2.5" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-base">
              {t('comments')}
            </span>
            <span className="text-xs text-neutral-400 font-bold tabular-nums">
              ({videoComments.length})
            </span>
          </div>
          <button
            onClick={() => setActiveCommentsModalVideoId(null)}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {videoComments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
              <span className="text-3xl mb-2">💬</span>
              <p className="font-bold text-white mb-1">لا توجد تعليقات بعد</p>
              <p className="text-xs text-neutral-500">كن أول من يشارك برأيه في هذا الفيديو!</p>
            </div>
          ) : (
            videoComments.map(c => (
              <div key={c.id} className="flex items-start gap-3 group">
                <img
                  src={c.author.avatarUrl}
                  alt={c.author.displayName}
                  className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-neutral-700"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="font-bold text-xs text-neutral-300">
                      {c.author.displayName}
                    </span>
                    <span className="text-[10px] text-neutral-500">{c.createdAt}</span>
                  </div>
                  <p className="text-sm text-neutral-100 leading-relaxed break-words">
                    {c.text}
                  </p>
                </div>
                {/* Like Comment */}
                <button
                  onClick={() => likeComment(activeCommentsModalVideoId, c.id)}
                  className="flex flex-col items-center gap-0.5 text-neutral-400 hover:text-rose-500 transition-colors p-1"
                >
                  <Heart
                    className={`w-4 h-4 transition-all ${
                      c.isLiked ? 'text-rose-500 fill-rose-500 scale-110' : ''
                    }`}
                  />
                  {c.likes > 0 && (
                    <span className="text-[10px] font-semibold tabular-nums">
                      {c.likes}
                    </span>
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Quick Emoji Bar */}
        <div className="px-4 py-2 border-t border-neutral-800/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {quickEmojis.map(emoji => (
            <button
              key={emoji}
              onClick={() => handleAddEmoji(emoji)}
              className="text-lg hover:scale-125 active:scale-95 transition-transform px-1"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Comment Input Footer */}
        <form
          onSubmit={handleSubmit}
          className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center gap-2 pb-safe"
        >
          <input
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder={t('addComment')}
            className="flex-1 bg-neutral-800 text-white placeholder-neutral-500 text-sm rounded-full px-4 py-2.5 outline-none focus:ring-1 focus:ring-rose-500 transition-all"
          />
          <button
            type="submit"
            disabled={!inputVal.trim()}
            className="p-2.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-40 disabled:hover:bg-rose-600 transition-colors active:scale-95 shadow-md"
            title="إرسال"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
