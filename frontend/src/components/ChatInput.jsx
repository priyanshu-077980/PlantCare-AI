import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

export default function ChatInput({ onSendMessage, disabled }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  return (
    <div className="p-3 sm:p-4 bg-slate-900/95 border-t border-slate-800/90 backdrop-blur-md shrink-0">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative flex items-end bg-slate-950 rounded-2xl border border-slate-700/80 focus-within:border-campus-500/70 focus-within:ring-2 focus-within:ring-campus-500/20 shadow-xl transition-all">
          
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Ask anything about fees, attendance rules, scholarships, exams, or internships..."
            className="w-full py-3 sm:py-3.5 pl-4 pr-16 bg-transparent text-sm text-slate-100 placeholder-slate-500 resize-none outline-none max-h-32 min-h-[46px]"
          />

          <div className="absolute right-2 bottom-2 flex items-center">
            <button
              type="submit"
              disabled={!text.trim() || disabled}
              className={`flex items-center justify-center p-2.5 rounded-xl transition-all ${
                text.trim() && !disabled
                  ? 'bg-campus-600 hover:bg-campus-500 text-white shadow-md shadow-campus-600/30 scale-100 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </form>

        <div className="flex justify-end mt-1.5 px-1 text-[11px] text-slate-500">
          <span className="hidden sm:inline">Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">Enter ↵</kbd> to send</span>
        </div>
      </div>
    </div>
  );
}
