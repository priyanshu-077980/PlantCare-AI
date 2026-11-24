import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ProgrammeSelector from './components/ProgrammeSelector';
import ProgrammeSelectionScreen from './components/ProgrammeSelectionScreen';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import ContextDrawer from './components/ContextDrawer';

import {
  fetchHealth,
  fetchProgrammes,
  sendChatMessage
} from './services/api';

import { Sparkles, Trash2, Bot, ArrowLeft } from 'lucide-react';

export default function App() {
  // Step 1: User chooses programme first (null initially)
  const [selectedProgramme, setSelectedProgramme] = useState(null);
  
  const [programmes, setProgrammes] = useState([
    { id: 'BCA', name: 'Bachelor of Computer Applications' },
    { id: 'BBA', name: 'Bachelor of Business Administration' },
    { id: 'B.Com (H)', name: 'Bachelor of Commerce (Honours)' }
  ]);
  const [health, setHealth] = useState(null);

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [contextDrawer, setContextDrawer] = useState({ isOpen: false, context: '', sources: [] });

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load initial backend health data
  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    try {
      const [hData, pData] = await Promise.allSettled([
        fetchHealth(),
        fetchProgrammes()
      ]);

      if (hData.status === 'fulfilled') setHealth(hData.value);
      if (pData.status === 'fulfilled') setProgrammes(pData.value.programmes || []);
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  // Called when user selects programme in Step 1
  const handleProgrammeChosen = (progId) => {
    setSelectedProgramme(progId);
    
    // Set programme-specific welcome message with brand COLLEGEWALA AI
    const welcomeText = progId === 'BCA' 
      ? `Welcome to **COLLEGEWALA AI**! 🎓\n\nYou are interacting as an enrolled **BCA (Bachelor of Computer Applications)** student.\n\n• **Academic Overview:** 75% mandatory attendance, 120 total credits, 40% passing standard, and a mandatory 6-8 week summer software internship after Semester 4 (carrying 4 credits in Sem 5).\n• **Fee Schedule:** Total fee is **₹57,000 per semester** (Tuition ₹45,000 + Lab & Tech ₹8,000 + Activity ₹4,000). Payment deadlines are **July 15** (odd semesters) and **January 15** (even semesters).\n\nType your query below to get started!`
      : (progId === 'BBA'
        ? `Welcome to **COLLEGEWALA AI**! 🎓\n\nYou are interacting as an enrolled **BBA (Bachelor of Business Administration)** student.\n\n• **Academic Overview:** 75% mandatory attendance, 120 total credits, continuous evaluation (30% internal assessment + 70% final examination), and a mandatory corporate summer internship after Semester 4.\n• **Fee Schedule:** Total fee is **₹50,000 per semester** (Tuition ₹40,000 + Industry Immersion ₹6,000 + Activity ₹4,000). Payment deadlines are **July 15** and **January 15**.\n\nType your query below to get started!`
        : `Welcome to **COLLEGEWALA AI**! 🎓\n\nYou are interacting as an enrolled **B.Com (Honours)** student.\n\n• **Academic Overview:** 75% mandatory attendance, 120 total credits, corporate accounting & taxation curriculum, and a mandatory CA/audit firm internship after Semester 4.\n• **Fee Schedule:** Total fee is **₹43,000 per semester** (Tuition ₹35,000 + Skill Lab ₹5,000 + Activity ₹3,000). Payment deadlines are **July 15** and **January 15**.\n\nType your query below to get started!`);

    setMessages([
      {
        id: 'welcome-' + progId,
        role: 'assistant',
        content: welcomeText,
        category: 'general',
        programme: progId
      }
    ]);
  };

  const handleSelectProgrammeInChat = (progId) => {
    handleProgrammeChosen(progId);
  };

  const handleBackToProgrammeSelection = () => {
    setSelectedProgramme(null);
  };

  const handleSendMessage = async (queryText) => {
    if (!queryText.trim() || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: queryText
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage({
        message: queryText,
        programme: selectedProgramme || 'BCA'
      });

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply,
        category: response.category,
        programme: response.programme,
        sources: response.sources || [],
        retrieved_context: response.retrieved_context,
        latency_ms: response.latency_ms
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⚠️ **Error Processing Query:** ${err.message || 'Could not communicate with the backend server.'}`,
          category: 'general',
          programme: selectedProgramme
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    handleProgrammeChosen(selectedProgramme);
  };

  const handleOpenContext = (context, sources) => {
    setContextDrawer({
      isOpen: true,
      context,
      sources
    });
  };

  // STEP 1: Show Programme Selection Screen first
  if (!selectedProgramme) {
    return <ProgrammeSelectionScreen onSelectProgramme={handleProgrammeChosen} />;
  }

  // STEP 2: Main Clean Chat Interface
  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      
      {/* Top Header */}
      <Header
        health={health}
        activeProgramme={selectedProgramme}
        onChangeProgramme={handleBackToProgrammeSelection}
      />

      {/* Programme Selection Bar inside Chat */}
      <ProgrammeSelector
        programmes={programmes}
        activeProgramme={selectedProgramme}
        onSelect={handleSelectProgrammeInChat}
      />

      {/* Main Chat Area - Responsive & Clean */}
      <main className="flex-1 overflow-y-auto px-4 py-3 sm:py-4 md:px-6">
        <div className="max-w-4xl mx-auto flex flex-col justify-between min-h-full">
          
          {/* Chat Messages */}
          <div className="space-y-1">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80 mb-2.5 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBackToProgrammeSelection}
                  className="flex items-center space-x-1 text-campus-400 hover:text-campus-300 font-medium transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Switch Programme</span>
                </button>
                <span className="text-slate-600">•</span>
                <span className="flex items-center space-x-1 text-slate-400">
                  <Sparkles className="w-3 h-3 text-campus-400" />
                  <span>Active Curriculum: {selectedProgramme}</span>
                </span>
              </div>

              {messages.length > 1 && (
                <button
                  onClick={handleClearChat}
                  className="flex items-center space-x-1 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset Conversation</span>
                </button>
              )}
            </div>

            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onOpenContext={handleOpenContext}
              />
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start space-x-3 py-3 animate-pulse">
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-campus-400">
                  <Bot className="w-4 h-4 animate-bounce" />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-400 flex items-center space-x-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-campus-400 animate-ping"></span>
                  <span>Retrieving official handbook context for {selectedProgramme}...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

        </div>
      </main>

      {/* Bottom Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isLoading}
      />

      {/* Context Inspection Drawer */}
      <ContextDrawer
        isOpen={contextDrawer.isOpen}
        onClose={() => setContextDrawer({ ...contextDrawer, isOpen: false })}
        context={contextDrawer.context}
        sources={contextDrawer.sources}
      />

    </div>
  );
}
