import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  RotateCcw, 
  Loader2, 
  User, 
  Sparkles, 
  Clock, 
  AlertTriangle,
  HelpCircle,
  FileText,
  ChevronDown
} from 'lucide-react';
import { Task } from '../types';
import { useAuth } from '../context/AuthContext';
import { sendAiChatMessage } from '../services/aiChatService';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  isFallback?: boolean;
}

interface FloatingAiChatWidgetProps {
  tasks: Task[];
}

export const FloatingAiChatWidget: React.FC<FloatingAiChatWidgetProps> = ({ tasks }) => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize initial greeting when user opens chat or user changes
  useEffect(() => {
    const welcomeText = `Xin chào ${currentUser?.fullName || 'Đồng chí'} (${currentUser?.position || 'Cán bộ'})!\n\nTôi là Trợ lý AI Giải Đáp Công Vụ của Trung tâm. Tôi có thể hỗ trợ đồng chí tra cứu nhanh tiến độ nhiệm vụ, các công việc trễ hạn, hướng dẫn quy trình báo cáo hoặc thông tin liên hệ các Tổ chuyên môn. Đồng chí cần hỗ trợ vấn đề gì ạ?`;
    
    setMessages([
      {
        id: 'msg-welcome',
        sender: 'bot',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [currentUser]);

  // Auto-scroll chat view to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: time,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const response = await sendAiChatMessage(text, currentUser, tasks);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFallback: response.isFallback,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        text: 'Dạ, hệ thống Trợ lý AI đang có chút gián đoạn đường truyền. Đồng chí vui lòng thử lại sau vài giây nhé.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        sender: 'bot',
        text: `Đã làm mới cuộc hội thoại. ${currentUser?.fullName || 'Đồng chí'} cần tra cứu hay hỏi đáp thêm thông tin công việc nào ạ?`,
        timestamp: time,
      },
    ]);
  };

  const quickPrompts = [
    { label: '📌 Việc của tôi', prompt: 'Danh sách các nhiệm vụ do tôi phụ trách là gì?' },
    { label: '⚠️ Task trễ hạn', prompt: 'Hiện tại có những nhiệm vụ nào bị trễ hạn hoặc chậm tiến độ?' },
    { label: '❓ Cách báo cáo', prompt: 'Hướng dẫn cho tôi các bước gửi báo cáo tiến độ công việc?' },
    { label: '🏢 Các Tổ CM', prompt: 'Thông tin nhiệm vụ phân công cho các Tổ chuyên môn?' },
  ];

  return (
    <>
      {/* Floating Action Button - Positioned below Palette Button in FloatingThemeControls */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Trợ lý AI Hỏi Đáp Công Vụ (Hỗ trợ 24/7)"
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg hover:scale-110 active:scale-95 relative group border ${
          isOpen
            ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white border-sky-400 ring-2 ring-sky-300'
            : 'bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 text-white border-blue-500 hover:brightness-110'
        }`}
        aria-label="Mở Trợ lý AI Giải Đáp Công Vụ"
      >
        <Bot className="w-5.5 h-5.5 transition-transform group-hover:scale-110" />
        {/* Glowing pulse indicator */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-800"></span>
        </span>
      </button>

      {/* Floating Chat Window Popup */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-5 sm:right-6 w-[calc(100vw-2.5rem)] sm:w-[410px] h-[540px] max-h-[80vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
          role="dialog"
          aria-label="Cửa sổ Trợ lý AI Hỏi Đáp"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#003366] via-indigo-900 to-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-indigo-950/50 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white shadow-inner">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-sm leading-tight text-white">Trợ Lý AI Giải Đáp Công Vụ</h3>
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {currentUser?.fullName} ({currentUser?.unit || 'Phường Hố Nai'})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearChat}
                title="Làm mới cuộc trò chuyện"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Đóng hộp thoại"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/70 dark:bg-slate-950/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[82%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>

                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[10px] text-slate-400">
                      {msg.timestamp}
                    </span>
                    {msg.isFallback && (
                      <span className="text-[10px] text-amber-500 font-medium" title="Phản hồi từ CSDL tự động">
                        (Offline)
                      </span>
                    )}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 rounded-2xl rounded-tl-xs text-xs text-slate-500 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span>AI đang tra cứu dữ liệu...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="px-3 py-2 bg-slate-100/90 dark:bg-slate-900/90 border-t border-slate-200/70 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                disabled={loading}
                onClick={() => handleSendMessage(chip.prompt)}
                className="whitespace-nowrap px-2.5 py-1 text-[11px] font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-full transition-colors shrink-0 cursor-pointer disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Nhập câu hỏi công việc..."
                disabled={loading}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || loading}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs shrink-0 cursor-pointer"
                title="Gửi câu hỏi"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 px-1">
              <span>Trợ lý AI giải đáp theo CSDL Trung tâm</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
