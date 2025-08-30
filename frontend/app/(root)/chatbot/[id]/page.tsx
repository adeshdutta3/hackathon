// app/chatbot/[id]/page.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, Moon, Send, Sun, Plus, PlusCircle } from 'lucide-react';
import { useRecoilState } from 'recoil';
import { darkModeState } from '@/recoil/blackandwhite';
import { useUser } from '@clerk/nextjs';
import WalletButton from '@/components/ui/connect-wallet';
import Providers from '@/components/Providers';
import { useRouter, useParams } from 'next/navigation';
import { JSX } from 'react/jsx-runtime';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { chatsState } from '@/recoil/chats';


type Role = 'user' | 'bot';
type Message = { role: Role; text: string; id?: string };

const LOCAL_KEY = 'chat_session_id';

// ... same imports

export default function ChatbotPage(): JSX.Element {
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const user = useUser();
  const [darkMode, setDarkMode] = useRecoilState(darkModeState);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const [userMsgCount, setUserMsgCount] = useState(0); // ✅ track user messages
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const urlId = params?.id ? String(params.id) : null;
  const [chatCount, setChatCount] = useState(() => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("chatCount");
    return saved ? parseInt(saved, 10) : 0;
  }
  return 0;
}); 
   const [chats, setChats] = useRecoilState(chatsState);
  // Auto-resize textarea
  useEffect(() => { if (textareaRef.current) autoResize(textareaRef.current); }, []);

  // Auto-scroll on new messages
  useEffect(() => { 
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages]);

  // ✅ Update user message count whenever messages change
  useEffect(() => {
    const count = messages.filter(m => m.role === 'user').length;
    setUserMsgCount(count);
  }, [messages]);

  // Initialization
  useEffect(() => {
    (async () => {
      try {
        const local = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_KEY) : null;

        if (urlId) {
          setChatId(urlId);
          localStorage.setItem(LOCAL_KEY, urlId);
          await loadHistory(urlId);
          return;
        }

        if (local) {
          router.replace(`/chatbot/${local}`);
          return;
        }

        const res = await fetch('/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'New Chat', userId: user.user?.id ?? null }),
        });
        if (!res.ok) throw new Error('Failed to create chat');
        const newChat = await res.json();
        const id = newChat.id as string;
        localStorage.setItem(LOCAL_KEY, id);
        router.replace(`/chatbot/${id}`);
      } catch (err) {
        console.error('Init error', err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlId, user.user?.id]);

  // Load history
  useEffect(() => {
    if (!chatId) return;
    loadHistory(chatId);
  }, [chatId]);

  async function loadHistory(id: string) {
    try {
      const res = await fetch(`/api/chats/${id}/messages`);
      if (!res.ok) throw new Error('Failed to load history');
      const data = await res.json();
      const msgs: Message[] = data.map((m: any) => ({
        role: m.role === 'assistant' ? 'bot' : m.role,
        text: m.content,
        id: m.id,
      }));
      setMessages(msgs);
      setChatId(id);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  }

  useEffect(() => {
  if (userMsgCount > 10) {
    setShowLimitDialog(true);
  }
}, [userMsgCount]);

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto';
    const max = 200;
    const newHeight = Math.min(el.scrollHeight, max);
    el.style.height = `${newHeight}px`;
    el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden';
  }

  const handleSend = async () => {
    if (userMsgCount >= 10) {
      setShowLimitDialog(true);
      return;
    }
    const text = input.trim();
    if (!text) return;
    if (!chatId) {
      console.error('No chat id available.');
      return;
    }

    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setMessages(prev => [...prev, { role: 'bot', text: '' }]);

    try {
      const saveUser = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, role: 'user' }),
      });
      if (!saveUser.ok) console.warn('Failed to persist user message');

      const res = await fetch('http://localhost:8000/query/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          user_id: user.user?.id || 'guest_user',
          session_id: chatId,
        }),
      });
      const aiData = await res.json();
      const botText = aiData.answer || aiData.clarification_question || 'No answer.';

      setMessages(prev => {
        const copy = [...prev];
        for (let i = copy.length - 1; i >= 0; i--) {
          if (copy[i].role === 'bot' && copy[i].text === '') {
            copy[i] = { role: 'bot', text: botText };
            return copy;
          }
        }
        return [...copy, { role: 'bot', text: botText }];
      });

      const saveBot = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: botText, role: 'assistant' }),
      });
      if (!saveBot.ok) console.warn('Failed to persist bot message');
    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'bot', text: '⚠️ Error contacting server.' },
      ]);
    }
  };
   useEffect(() => {
    localStorage.setItem("chatCount", chatCount.toString());
  }, [chatCount]);

async function createChat() {
  try {
    setLoading(true);
    const res = await fetch("/api/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `Untitled${chatCount}`,
        userId: user.user?.id,
      }),
    });

    if (!res.ok) throw new Error(await res.text());
    const newChat = await res.json();

    setChats((prev) => [newChat, ...prev]);
    router.push(`/chatbot/${newChat.id}`);
  } catch (err) {
    console.error("Error creating chat:", err);
  } finally {
    setChatCount((prev) => prev + 1);
    setLoading(false);
  }
}

  return (
    <main className={` h-full w-full flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-slate-100 text-black'}`}>
      <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <DialogContent className="sm:max-w-md bg-slate-900 text-slate-100">
          <DialogHeader>
            <DialogTitle>Message Limit Reached</DialogTitle>
            <DialogDescription>
              You’ve sent more than 10 messages in this session.  
              Upgrade your plan or connect your wallet to continue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <button
              onClick={createChat}
              disabled={loading}
              className="px-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              <div className='flex gap-1'>
                New Chat
                <PlusCircle className="mt-1 h-4 w-4" />
              </div>
            </button>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              Upgrade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className={`cursor-pointer border-b ${darkMode ? "border-gray-700" : "border-gray-200"} px-4 py-6 flex justify-between`} >
        <div className="cousor-pointer flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-center sm:justify-start" onClick={()=>{
        router.replace('/')
      }}>
          <div className={`rounded-lg ${darkMode ? "bg-gray-900 text-white shadow-gray-500" : "bg-white text-gray-700"} p-1 sm:p-2 shadow-sm`}>
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-[#60a5fa]" />
          </div>
          <div>
            <h1 className={`${darkMode ? "text-slate-100" : "text-gray-700"} text-base sm:text-lg font-semibold tracking-tight`}>
              DeFi AI Assistant
            </h1>
            <div className="text-[10px] sm:text-xs text-slate-400">
              Powered by <span className="text-[#60a5fa] font-medium">Coinbase</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-6 w-full sm:w-auto justify-center sm:justify-end">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`cursor-pointer p-2 rounded-full border transition-all hover:scale-110 hover:shadow-[0_0_10px_rgba(250,204,21,0.7)] ${darkMode ? "border-gray-600" : "border-gray-400"}`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-400 animate-pulse" />
            ) : (
              <Moon className="w-5 h-5 text-gray-700" />
            )}
          </button>
          <Providers>
            <WalletButton />
          </Providers>
        </div>
      </div>

      {/* ... rest of UI unchanged */}

      {/* Empty State */}
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Welcome to AI Chatbot
          </h1>
          <p className={`text-lg max-w-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Ask me anything about crypto, markets, or insights. Start chatting below.
          </p>
        </div>
      )}

      {/* Chat Messages */}
      {messages.length > 0 && (
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {messages.map((msg, i) => (
            <div key={msg.id ?? i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xl px-5 py-3 whitespace-pre-wrap rounded-2xl text-sm shadow-md 
                ${msg.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none'
                    : darkMode
                      ? 'bg-gray-800 text-gray-200 rounded-bl-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Box */}
      <form onSubmit={e => { e.preventDefault(); handleSend(); }} className={`p-4 border-t ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} flex gap-3`}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => { setInput(e.target.value); if (textareaRef.current) autoResize(textareaRef.current); }}
          placeholder="Type your message..."
          className={`flex-1 px-4 py-3 rounded-xl focus:outline-none shadow-sm overflow-hidden ${darkMode ? 'bg-gray-800 text-white placeholder-gray-400' : 'bg-gray-100 text-black placeholder-gray-500'}`}
          rows={1}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        />
        <button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 rounded-xl shadow-md hover:scale-105 transform transition flex items-center gap-2">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </main>
  );
}
