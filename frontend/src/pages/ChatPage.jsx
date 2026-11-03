import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Card from '../components/common/Card';
import { 
  fetchChatModels, 
  streamChatCompletion
} from '../api/plantApi';
import { 
  Bot, 
  Send, 
  Square, 
  Sparkles, 
  RotateCcw, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  Leaf, 
  Info, 
  Trash2, 
  User, 
  Cpu, 
  HelpCircle,
  X
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  {
    title: '🌿 Treat Early Blight',
    prompt: 'How do I treat and prevent Early Blight in tomato crops organically and effectively?'
  },
  {
    title: '🐛 Natural Pest Spray',
    prompt: 'Give me a step-by-step recipe for making an organic neem oil spray for leaf aphids and whiteflies.'
  },
  {
    title: '🍂 Yellowing Leaves',
    prompt: 'Why are my plant leaves turning yellow with brown tips? How do I diagnose the nutrient deficiency?'
  },
  {
    title: '🌾 Homemade Compost',
    prompt: 'What is the best method to prepare rich organic compost and vermicompost at home or farm?'
  },
  {
    title: '💧 Watering & Fungus',
    prompt: 'How does overwatering cause fungal root rot and leaf spots, and how can I fix soil drainage?'
  }
];

export default function ChatPage() {
  const location = useLocation();
  const locationState = location.state;

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('plantcare_chat_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [ollamaStatus, setOllamaStatus] = useState({
    online: false,
    models: [],
    default_model: 'llama3.2',
    loading: true
  });
  const [selectedModel, setSelectedModel] = useState('llama3.2');
  const [activeContext, setActiveContext] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Save conversation history to local storage
  useEffect(() => {
    try {
      localStorage.setItem('plantcare_chat_history', JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save chat history', e);
    }
  }, [messages]);

  // Load available Ollama models
  const loadModels = async () => {
    setOllamaStatus(prev => ({ ...prev, loading: true }));
    const res = await fetchChatModels();
    if (res.success && res.data) {
      const data = res.data;
      setOllamaStatus({
        online: data.online ?? true,
        models: data.models || [],
        default_model: data.default_model || 'llama3.2',
        loading: false,
        error: data.error
      });
      if (data.default_model) {
        setSelectedModel(data.default_model);
      } else if (data.models && data.models.length > 0) {
        setSelectedModel(data.models[0]);
      }
    } else {
      setOllamaStatus({
        online: false,
        models: [],
        default_model: 'llama3.2',
        loading: false,
        error: res.error || 'Cannot connect to Ollama service.'
      });
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  // Handle passed diagnosis context from Detection / History page
  useEffect(() => {
    if (locationState?.diagnosis) {
      const diag = locationState.diagnosis;
      setActiveContext(diag);

      // If user came with prompt to auto-ask
      if (locationState.autoPrompt) {
        handleSendMessage(locationState.autoPrompt, diag);
      }
    }
  }, [locationState]);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (messages.length === 0) return;
    if (window.confirm('Clear all conversation messages?')) {
      setMessages([]);
      localStorage.removeItem('plantcare_chat_history');
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  const handleSendMessage = async (textToSend, contextOverride) => {
    const content = (textToSend || input).trim();
    if (!content || isStreaming) return;

    const userMessageId = `user_${Date.now()}`;
    const assistantMessageId = `asst_${Date.now()}`;

    const userMsg = {
      id: userMessageId,
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const asstMsg = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      model: selectedModel,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg, asstMsg];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const contextPayload = contextOverride || activeContext;

    // Send to backend stream endpoint
    await streamChatCompletion({
      messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
      model: selectedModel,
      context: contextPayload ? {
        plant: contextPayload.plant,
        condition: contextPayload.condition,
        predicted_class: contextPayload.rawClass || contextPayload.predicted_class,
        confidence: contextPayload.confidence
      } : null,
      language: 'en',
      signal: abortController.signal,
      onChunk: (chunk) => {
        setMessages((prev) => {
          return prev.map((msg) => {
            if (msg.id === assistantMessageId) {
              return { ...msg, content: msg.content + chunk };
            }
            return msg;
          });
        });
      },
      onDone: () => {
        setIsStreaming(false);
        abortControllerRef.current = null;
      },
      onError: (err) => {
        setMessages((prev) => {
          return prev.map((msg) => {
            if (msg.id === assistantMessageId) {
              return {
                ...msg,
                content: msg.content
                  ? `${msg.content}\n\n*(Error: ${err})*`
                  : `⚠️ **Chatbot Error**: ${err}\n\nPlease ensure Ollama is running (\`ollama serve\`) with the model loaded.`
              };
            }
            return msg;
          });
        });
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] max-w-5xl mx-auto space-y-3">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 px-4 py-3 sm:px-6 sm:py-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-forest-800 to-emerald-600 flex items-center justify-center text-white shadow-sm shadow-forest-900/10">
            <Bot className="w-5 h-5 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">
                PlantCare AI Agronomist
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-forest-100 text-forest-800 border border-forest-200">
                GenAI Local
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Interactive plant pathology & agricultural advisor powered by Ollama
            </p>
          </div>
        </div>

        {/* Right side controls: Model Picker & Status & Clear */}
        <div className="flex items-center gap-2.5 ml-auto">
          {/* Status Indicator */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
            ollamaStatus.online 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${ollamaStatus.online ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{ollamaStatus.online ? 'Ollama Online' : 'Ollama Offline'}</span>
          </div>

          {/* Model Selector Dropdown */}
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-700">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={isStreaming}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              {ollamaStatus.models.length > 0 ? (
                ollamaStatus.models.map((m) => (
                  <option key={m} value={m}>
                    {m.includes('llama3.2') ? `${m} (Recommended)` : m}
                  </option>
                ))
              ) : (
                <option value="llama3.2">llama3.2 (Recommended)</option>
              )}
            </select>
          </div>

          {/* Clear history button */}
          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              disabled={isStreaming}
              title="Clear conversation"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Active Diagnosis Context Pill (if forwarded from Detection) */}
      {activeContext && (
        <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl px-4 py-2 flex items-center justify-between text-xs text-emerald-900 shadow-xs">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              <strong>Active Diagnosis Context:</strong>{' '}
              <span className="font-semibold text-emerald-950">
                {activeContext.plant} — {activeContext.condition}
              </span>
              {activeContext.confidence && (
                <span className="ml-1.5 text-emerald-700 font-mono text-[11px]">
                  ({activeContext.confidence}% confidence)
                </span>
              )}
            </span>
          </div>
          <button
            onClick={() => setActiveContext(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1 rounded-md hover:bg-emerald-100/60 transition-colors"
            title="Dismiss context"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Ollama Offline Banner */}
      {!ollamaStatus.loading && !ollamaStatus.online && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-amber-900 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Local Ollama instance not detected at http://127.0.0.1:11434</p>
            <p className="text-amber-800">
              Please start Ollama in your terminal using: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold">ollama run llama3.2</code> or <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold">ollama serve</code>, then click Reconnect.
            </p>
            <button
              onClick={loadModels}
              className="mt-1 inline-flex items-center gap-1 font-semibold text-amber-900 underline hover:text-amber-950"
            >
              <RotateCcw className="w-3 h-3" /> Reconnect to Ollama
            </button>
          </div>
        </div>
      )}

      {/* Main Conversation Feed */}
      <Card className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6 max-w-xl mx-auto my-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-forest-800 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-forest-900/15">
              <Bot className="w-8 h-8 text-emerald-100" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">
                Hello! How can I assist your crop today?
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                I am your GenAI Agronomist powered by local LLMs via Ollama. Ask anything about crop diseases, organic remedies, soil fertility, watering schedules, or leaf diagnostics in English.
              </p>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="w-full space-y-2 pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Suggested Questions
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {SUGGESTED_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-forest-300 hover:bg-forest-50/50 bg-slate-50/60 text-slate-700 hover:text-forest-900 text-xs font-medium transition-all duration-150 flex flex-col gap-1 text-left group"
                  >
                    <span className="font-bold text-slate-900 group-hover:text-forest-800">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-slate-500 line-clamp-1">
                      {item.prompt}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-lg bg-forest-800 text-emerald-200 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[78%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                        isUser
                          ? 'bg-forest-900 text-white rounded-br-xs'
                          : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="prose prose-sm prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-headings:my-2 prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-strong:text-forest-900 prose-code:text-emerald-700 prose-code:bg-emerald-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                          {msg.content ? (
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          ) : (
                            <span className="flex items-center gap-1.5 text-slate-400 font-medium py-1">
                              <span className="w-2 h-2 rounded-full bg-forest-600 animate-ping" />
                              Analyzing plant symptoms and formulating recommendations...
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Metadata footer */}
                    <div className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}>
                      <span>{msg.timestamp}</span>
                      {!isUser && msg.model && (
                        <>
                          <span>&bull;</span>
                          <span className="font-mono text-forest-700 font-semibold">{msg.model}</span>
                        </>
                      )}
                      {!isUser && msg.content && (
                        <>
                          <span>&bull;</span>
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-700 transition-colors"
                            title="Copy reply"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </Card>

      {/* Input Composer Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 sm:p-3 shadow-xs">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder={
              isStreaming
                ? "Agronomist is responding..."
                : "Ask anything about plant diseases, remedies, fertilization, or crops (Shift+Enter for newline)..."
            }
            disabled={isStreaming}
            className="flex-1 resize-none bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-forest-600/30 focus:border-forest-600 transition-all max-h-44 disabled:opacity-60"
          />

          {isStreaming ? (
            <button
              onClick={handleStopStreaming}
              className="px-4 py-2.5 bg-rose-600 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 hover:bg-rose-700 transition-all shadow-sm active:scale-98"
              title="Stop response generation"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Stop</span>
            </button>
          ) : (
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim()}
              className="p-2.5 sm:px-4 sm:py-2.5 bg-forest-800 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 hover:bg-forest-900 transition-all shadow-sm disabled:opacity-40 disabled:hover:bg-forest-800 active:scale-98"
              title="Send question"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
          <span>
            Powered by <strong>Ollama GenAI</strong> &middot; Model: <code>{selectedModel}</code>
          </span>
          <span className="hidden sm:inline">
            Press <kbd className="bg-slate-100 border border-slate-200 px-1 py-0.5 rounded text-[10px]">Enter</kbd> to send
          </span>
        </div>
      </div>
    </div>
  );
}
