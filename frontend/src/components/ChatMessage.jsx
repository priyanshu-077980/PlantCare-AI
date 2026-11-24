import React, { useState } from 'react';
import { User, Bot, Check, Copy, Clock, Layers } from 'lucide-react';

// Lightweight parser for markdown bullets and bold text
function FormattedContent({ content }) {
  if (!content) return null;

  const lines = content.split('\n');

  return (
    <div className="space-y-1.5 text-sm leading-relaxed text-slate-200">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1.5" />;

        // Header style lines
        if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.slice(2, -2).includes('**')) {
          return (
            <div key={idx} className="font-bold text-slate-100 text-base mt-2 mb-1">
              {trimmed.slice(2, -2)}
            </div>
          );
        }

        // Bullet points
        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('* ');
        const textContent = isBullet ? trimmed.replace(/^[•\-\*]\s*/, '') : trimmed;

        // Simple bold parser
        const parts = textContent.split(/(\*\*.*?\*\*)/g);
        const rendered = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-semibold text-white">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start space-x-2 pl-1">
              <span className="text-campus-400 font-bold mt-0.5">•</span>
              <div className="flex-1">{rendered}</div>
            </div>
          );
        }

        return <p key={idx}>{rendered}</p>;
      })}
    </div>
  );
}

export default function ChatMessage({ message, onOpenContext }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex items-start gap-3 py-3.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
          isUser
            ? 'bg-gradient-to-br from-campus-500 to-indigo-600 text-white'
            : 'bg-slate-800 text-campus-400 border border-slate-700/80'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble Container */}
      <div className={`flex flex-col max-w-[85%] sm:max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* Brand & Programme Pill for Assistant */}
        {!isUser && (
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide border bg-campus-500/10 text-campus-400 border-campus-500/20">
              COLLEGEWALA AI
            </span>
            {message.programme && (
              <span className="text-[11px] text-slate-400 font-medium">
                for {message.programme}
              </span>
            )}
            {message.latency_ms && (
              <span className="flex items-center text-[10px] text-slate-500">
                <Clock className="w-2.5 h-2.5 mr-0.5" /> {message.latency_ms}ms
              </span>
            )}
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-3.5 shadow-sm transition-all ${
            isUser
              ? 'bg-campus-600 text-white rounded-tr-sm'
              : 'bg-slate-900/90 border border-slate-800/80 rounded-tl-sm backdrop-blur-sm'
          }`}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <FormattedContent content={message.content} />
          )}
        </div>

        {/* Action Bar for Assistant Message */}
        {!isUser && (
          <div className="flex items-center space-x-3 mt-1.5 text-xs text-slate-400 px-1">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 hover:text-slate-200 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {message.retrieved_context && (
              <button
                onClick={() => onOpenContext(message.retrieved_context, message.sources)}
                className="flex items-center space-x-1 text-campus-400 hover:text-campus-300 transition-colors font-medium"
              >
                <Layers className="w-3 h-3" />
                <span>View Source Context</span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
