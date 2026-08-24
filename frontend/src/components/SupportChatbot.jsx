import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, X, Send, Loader2, User, MinusCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { contactAPI } from '../services/api';
import notificationSound from '../assets/sounds/admin_notification.mp3';

const WELCOME = "Hi! I'm Sambid's AI support assistant 👋\n\nI can help you with:\n• Plan features & pricing\n• How contract matching works\n• Account & billing questions\n• Federal contracting basics\n\nWhat can I help you with today?";

// Same avatar everywhere the assistant appears — teaser bubble, header, and
// message bubbles — so it reads as one consistent identity, not three.
const AVATAR_URL = 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80';

// Shown once per browser session, a few seconds after the page loads, so the
// widget doesn't sit as a silent icon nobody notices — a real, dismissible
// nudge instead. Never opens the chat by itself, only offers to.
const TEASER_DELAY_MS = 4000;
const TEASER_SESSION_KEY = 'sambid_chat_teaser_shown';

// Bot replies come back as markdown (bold, bullets, headings) from the AI.
// User messages are plain text, rendered as-is with no parsing.
const markdownComponents = {
  p:  ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 last:mb-0 pl-4 space-y-1 list-disc marker:text-gray-400">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 last:mb-0 pl-4 space-y-1 list-decimal marker:text-gray-400">{children}</ol>,
  li: ({ children }) => <li className="pl-0.5">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  h1: ({ children }) => <p className="font-semibold text-gray-900 mb-1">{children}</p>,
  h2: ({ children }) => <p className="font-semibold text-gray-900 mb-1">{children}</p>,
  h3: ({ children }) => <p className="font-semibold text-gray-900 mb-1">{children}</p>,
  a:  ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="underline text-indigo-600 hover:text-indigo-700">{children}</a>,
  code: ({ children }) => <code className="bg-gray-200/70 rounded px-1 py-0.5 text-xs">{children}</code>,
};

function Message({ msg }) {
  const isBot = msg.role === 'assistant';
  return (
    <div className={`flex gap-2.5 ${isBot ? '' : 'flex-row-reverse'}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 overflow-hidden ${
        isBot ? '' : 'bg-gray-200'
      }`}>
        {isBot
          ? <img src={AVATAR_URL} alt="" className="w-full h-full object-cover" />
          : <User className="w-4 h-4 text-gray-600" />}
      </div>
      <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
        isBot
          ? 'bg-gray-100 text-gray-800 rounded-tl-none'
          : 'bg-indigo-600 text-white rounded-tr-none whitespace-pre-wrap'
      }`}>
        {isBot
          ? <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{msg.content}</ReactMarkdown>
          : msg.content}
      </div>
    </div>
  );
}

export default function SupportChatbot() {
  const [open,     setOpen]     = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [unread,   setUnread]   = useState(0);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: WELCOME },
  ]);
  const [showTeaser, setShowTeaser] = useState(false);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const audioRef   = useRef(null);

  // Auto-pop the "Have a question?" bubble once per session, before the chat
  // is ever opened — dismissible, and never fires again once the visitor has
  // either opened the chat or closed the bubble.
  useEffect(() => {
    if (sessionStorage.getItem(TEASER_SESSION_KEY)) return;
    const t = setTimeout(() => setShowTeaser(true), TEASER_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  const dismissTeaser = () => {
    setShowTeaser(false);
    sessionStorage.setItem(TEASER_SESSION_KEY, '1');
  };

  // Init AI reply sound
  useEffect(() => {
    audioRef.current = new Audio(notificationSound);
    audioRef.current.preload = 'auto';
    return () => { if (audioRef.current) audioRef.current.pause(); };
  }, []);

  const playAISound = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
    setTimeout(() => { if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; } }, 1500);
  };

  // Scroll to bottom on new message
  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, minimized]);

  // Focus input when opened
  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, minimized]);

  const handleOpen = () => {
    setOpen(true);
    setMinimized(false);
    setUnread(0);
    dismissTeaser();
  };

  const handleClose = () => {
    setOpen(false);
    setUnread(0);
  };

  // Accept optional override text (used by quick replies to avoid async state race)
  const sendMessage = (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);        // update UI with user message
    dispatchChat(next, text); // fire API call - outside the updater, fires exactly once
  };

  const dispatchChat = async (currentMessages, text) => {
    setLoading(true);
    try {
      // Send history excluding the initial welcome and the just-added user message
      const history = currentMessages.slice(1, -1);
      const res = await contactAPI.chat({ message: text, history });
      const reply = res.data.reply || "I'm sorry, I couldn't process that. Please try again.";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      playAISound();
      if (minimized || !open) setUnread(u => u + 1);
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment or fill the contact form for human support.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const QUICK = [
    'What plans do you offer?',
    'How does matching work?',
    'How do I upgrade to Enterprise?',
    'My plan expired, what do I do?',
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat window */}
      {open && (
        <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col transition-all duration-200 ${
          minimized ? 'h-14' : 'h-[520px]'
        } w-80 sm:w-96`}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-indigo-600 rounded-t-2xl">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30 shrink-0">
              <img src={AVATAR_URL} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm">Sambid Support</p>
              <p className="text-indigo-200 text-xs">AI assistant · Usually instant</p>
            </div>
            <button onClick={() => setMinimized(v => !v)} className="text-indigo-200 hover:text-white transition">
              <MinusCircle className="w-4 h-4" />
            </button>
            <button onClick={handleClose} className="text-indigo-200 hover:text-white transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.map((m, i) => <Message key={i} msg={m} />)}

                {loading && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full overflow-hidden shrink-0">
                      <img src={AVATAR_URL} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick replies - only show at start */}
              {messages.length <= 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                  {QUICK.map(q => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 transition border border-indigo-200"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="px-3 pb-3 pt-2 border-t border-gray-100">
                <div className="flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    rows={1}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent text-sm text-gray-800 resize-none outline-none min-h-[24px] max-h-24 placeholder-gray-400"
                    style={{ height: 'auto' }}
                    onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                    className="shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition disabled:opacity-40"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-center text-xs text-gray-400 mt-1.5">
                  AI Assistant · <Link to="/contact" className="text-indigo-500 hover:underline">Human support</Link>
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Auto-popped teaser bubble — dismissible, opens the chat on click */}
      {!open && showTeaser && (
        <button
          onClick={handleOpen}
          className="group relative flex items-center gap-3 bg-gradient-to-r from-indigo-700 to-purple-700 hover:from-indigo-600 hover:to-purple-600 text-white pl-3 pr-9 py-2.5 rounded-full shadow-2xl transition-all duration-200 animate-[teaserIn_320ms_ease-out] max-w-[280px] sm:max-w-xs text-left"
        >
          <style>{`@keyframes teaserIn { from { opacity: 0; transform: translateY(10px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
          <img
            src={AVATAR_URL}
            alt=""
            className="w-9 h-9 rounded-full object-cover shrink-0 border-2 border-white/30"
          />
          <span className="min-w-0">
            <span className="block text-sm font-semibold leading-tight">Have a question? Ask away! 👋</span>
            <span className="block text-xs text-indigo-100 mt-0.5">Sambid AI · Usually instant</span>
          </span>
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); dismissTeaser(); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); dismissTeaser(); } }}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        </button>
      )}

      {/* Floating button */}
      {!open && (
        <button
          onClick={handleOpen}
          className="relative w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        >
          <MessageCircle className="w-6 h-6" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unread}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
