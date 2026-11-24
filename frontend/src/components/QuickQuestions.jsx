import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronRight, 
  BookOpen, 
  Receipt, 
  MessageSquare, 
  Sparkles,
  Search,
  Filter
} from 'lucide-react';

const allFaqs = {
  BCA: [
    { category: 'academic', tag: 'Attendance', text: 'What is the mandatory attendance requirement to sit for semester exams?' },
    { category: 'academic', tag: 'Internship', text: 'What are the rules and credits for BCA 4th-semester summer training/internship?' },
    { category: 'academic', tag: 'Grading', text: 'What is the passing criteria and 10-point CGPA grading scale for BCA?' },
    { category: 'academic', tag: 'Promotion', text: 'What is the minimum credit requirement to be promoted from 1st year to 2nd year?' },
    { category: 'academic', tag: 'Medical', text: 'Can medical condonation be granted if attendance is below 75%?' },
    
    { category: 'fee', tag: 'Tuition Fee', text: 'What is the complete semester fee breakdown (Tuition + Lab + Activity) for BCA?' },
    { category: 'fee', tag: 'Due Dates', text: 'When is the deadline to pay odd and even semester fees?' },
    { category: 'fee', tag: 'Late Fine', text: 'What is the late fee penalty if payment is delayed by 10 to 25 days?' },
    { category: 'fee', tag: 'Scholarship', text: 'What merit scholarships are offered for students with 80%+ or 90%+ in 12th?' },
    { category: 'fee', tag: 'Refund Policy', text: 'What is the refund policy if a student withdraws admission?' },

    { category: 'general', tag: 'Hostel & Bus', text: 'What are the hostel room fees and college bus transportation charges?' },
    { category: 'general', tag: 'Study Tips', text: 'Can you give me tips to balance BCA semester subjects and coding projects?' }
  ],
  BBA: [
    { category: 'academic', tag: 'Attendance', text: 'What is the mandatory attendance percentage required to sit for semester exams?' },
    { category: 'academic', tag: 'Internship', text: 'What are the summer internship requirements for BBA students after Semester 4?' },
    { category: 'academic', tag: 'Grading', text: 'What is the passing marks criteria and internal assessment weightage for BBA?' },
    { category: 'academic', tag: 'Promotion', text: 'How many credits are required to be promoted to 2nd and 3rd year?' },
    
    { category: 'fee', tag: 'Tuition Fee', text: 'What is the total fee per semester for BBA (including industry immersion)?' },
    { category: 'fee', tag: 'Due Dates', text: 'What are the due dates for BBA semester fee payments?' },
    { category: 'fee', tag: 'Late Fine', text: 'What is the late fine charged per day after the payment due date?' },
    { category: 'fee', tag: 'Scholarship', text: 'What scholarships are available for BBA meritorious students?' },
    { category: 'fee', tag: 'Refund Policy', text: 'What are the cancellation and fee refund rules for BBA?' },

    { category: 'general', tag: 'Hostel & Bus', text: 'What are the hostel accommodation charges and college transport bus fees?' },
    { category: 'general', tag: 'Career', text: 'How can I prepare for campus management placements during BBA?' }
  ],
  'B.Com (H)': [
    { category: 'academic', tag: 'Attendance', text: 'What is the minimum attendance required for B.Com (H) courses?' },
    { category: 'academic', tag: 'Internship', text: 'What are the summer internship guidelines (CA/Audit firms) after Semester 4?' },
    { category: 'academic', tag: 'Grading', text: 'What is the 10-point grading system and passing marks percentage for B.Com (H)?' },
    { category: 'academic', tag: 'Promotion', text: 'What are the promotion criteria from 1st year to 2nd year?' },
    
    { category: 'fee', tag: 'Tuition Fee', text: 'What is the total semester fee for B.Com (Honours) including skill lab fees?' },
    { category: 'fee', tag: 'Due Dates', text: 'When is the last date to pay the B.Com (H) semester fees without fine?' },
    { category: 'fee', tag: 'Late Fine', text: 'How much late fine is charged if fee is delayed beyond the deadline?' },
    { category: 'fee', tag: 'Scholarship', text: 'Are there merit scholarships available based on 12th commerce marks?' },
    { category: 'fee', tag: 'Refund Policy', text: 'How much refund is given if admission is cancelled before or after classes start?' },

    { category: 'general', tag: 'Hostel & Bus', text: 'What are the hostel facilities and bus transport fees?' },
    { category: 'general', tag: 'Career', text: 'How do I manage CA preparation alongside my B.Com (H) curriculum?' }
  ]
};

export default function QuickQuestions({ programme = 'BCA', onSelect }) {
  const [activeTab, setActiveTab] = useState('all'); // all | academic | fee | general
  const [searchQuery, setSearchQuery] = useState('');

  const questionsList = allFaqs[programme] || allFaqs['BCA'];

  const filteredQuestions = questionsList.filter((q) => {
    const matchesTab = activeTab === 'all' || q.category === activeTab;
    const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          q.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const categoryIcons = {
    academic: BookOpen,
    fee: Receipt,
    general: MessageSquare,
  };

  return (
    <div className="max-w-4xl mx-auto my-6 px-4">
      
      {/* Header and Filter Bar */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 mb-4 shadow-lg backdrop-blur-sm">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-campus-500/10 text-campus-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                <span>Frequently Asked Questions</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-campus-500/10 text-campus-400 border border-campus-500/20 font-semibold">
                  {programme} FAQs
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Click any question to get an instant official handbook answer
              </p>
            </div>
          </div>

          {/* Search bar inside FAQ header */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-48 pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-campus-500"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All FAQs', count: questionsList.length },
            { id: 'academic', label: '📚 Academic Regulations', count: questionsList.filter(q => q.category === 'academic').length },
            { id: 'fee', label: '💰 Fees & Scholarships', count: questionsList.filter(q => q.category === 'fee').length },
            { id: 'general', label: '🏛️ General & Campus', count: questionsList.filter(q => q.category === 'general').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === tab.id
                  ? 'bg-campus-600 text-white shadow-sm'
                  : 'bg-slate-950/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === tab.id ? 'bg-campus-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

      </div>

      {/* Grid of FAQ cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {filteredQuestions.length === 0 ? (
          <div className="col-span-2 text-center py-6 text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800/80">
            No questions matched your search. Type your custom query in the box below!
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const Icon = categoryIcons[q.category] || HelpCircle;
            const isFee = q.category === 'fee';
            const isAcademic = q.category === 'academic';

            return (
              <button
                key={idx}
                onClick={() => onSelect(q.text)}
                className="group flex items-start text-left p-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-850 hover:bg-slate-800/90 border border-slate-800 hover:border-campus-500/40 transition-all text-xs text-slate-300 hover:text-white shadow-sm active:scale-[0.99] relative overflow-hidden"
              >
                <div
                  className={`p-2 rounded-lg shrink-0 mr-3 mt-0.5 transition-colors ${
                    isFee
                      ? 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20'
                      : isAcademic
                      ? 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20'
                      : 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 pr-2">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 group-hover:text-campus-400 transition-colors">
                      {q.tag}
                    </span>
                  </div>
                  <span className="font-medium leading-relaxed block text-slate-200 group-hover:text-white">
                    {q.text}
                  </span>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-campus-400 shrink-0 mt-2 transition-transform group-hover:translate-x-1" />
              </button>
            );
          })
        )}
      </div>

    </div>
  );
}
