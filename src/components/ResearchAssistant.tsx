// src/components/ResearchAssistant.tsx
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Paperclip, Loader2, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '../lib/utils';

// Markdown & LaTeX 渲染库
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // 👈 核心：引入公式样式，否则就是乱码

type Message = {
  role: 'user' | 'ai';
  content: string;
};

export default function ResearchAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: '👋 你好！我是你的科研助手。上传一篇论文 PDF，或者直接问我问题吧！' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  const API_BASE = 'https://www.zvhivta.space/api/research';

  // 自动滚动
  useEffect(() => {
    scrollViewportRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat?question=${encodeURIComponent(userText)}`);
      if (!res.ok) throw new Error('API Error');
      const data = await res.text();
      setMessages(prev => [...prev, { role: 'ai', content: data }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: '⚠️ 连接失败，请检查后端服务。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setMessages(prev => [...prev, { role: 'user', content: `📄 正在上传: ${file.name}` }]);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload Error');
      const text = await res.text();
      setMessages(prev => [...prev, { role: 'ai', content: text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: '❌ 上传失败，请重试。' }]);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-sans">
      <div 
        className={cn(
          "w-[380px] bg-background border rounded-xl shadow-2xl transition-all duration-300 overflow-hidden flex flex-col",
          // 固定高度 600px
          isOpen ? "h-[600px] opacity-100 translate-y-0" : "h-0 opacity-0 translate-y-10 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="bg-primary p-4 flex justify-between items-center text-primary-foreground shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-background/20 p-1.5 rounded-lg">
              <FileText size={18} />
            </div>
            <span className="font-semibold">Assistant</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20" onClick={() => setIsOpen(false)}>
            <X size={18} />
          </Button>
        </div>

        {/* 🔥 核心修复：
           1. flex-1: 占据 Header 和 Input 剩下的所有空间
           2. min-h-0: 允许 flex 子项压缩，这是 ScrollArea 能滚动的关键！
           3. w-full: 宽度撑满
        */}
        <div className="flex-1 min-h-0 w-full bg-muted/30">
          {/* ScrollArea 必须设置 h-full 才能在父容器内滚动 */}
          <ScrollArea className="h-full p-4">
            <div className="flex flex-col gap-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                    msg.role === 'user'
                      ? "bg-primary text-primary-foreground self-end rounded-br-sm"
                      : "bg-background border text-foreground self-start rounded-bl-sm"
                  )}
                >
                  {msg.role === 'ai' ? (
                    // 渲染 Markdown 和 LaTeX
                    <ReactMarkdown 
                      remarkPlugins={[remarkMath]} 
                      rehypePlugins={[rehypeKatex]}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground text-xs ml-2">
                  <Loader2 className="animate-spin h-3 w-3" />
                  <span>AI 正在思考...</span>
                </div>
              )}
              {/* 底部锚点 */}
              <div ref={scrollViewportRef} className="h-1" />
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-background shrink-0">
          <div className="flex gap-2 items-center">
            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileUpload} />
            <Button variant="outline" size="icon" className="shrink-0 rounded-full" onClick={() => fileInputRef.current?.click()} title="上传论文">
              <Paperclip size={18} className="text-muted-foreground" />
            </Button>

            <input
              className="flex h-10 w-full rounded-full border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 flex-1"
              placeholder="问点什么..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={isLoading}
            />

            <Button size="icon" className="shrink-0 rounded-full" onClick={handleSend} disabled={!input.trim() || isLoading}>
              <Send size={18} />
            </Button>
          </div>
        </div>
      </div>

      <Button
        size="icon"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95",
          isOpen ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        )}
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle size={28} />
      </Button>
    </div>
  );
}