import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './components/ChatMessage';
import { InputBox } from './components/InputBox';
import { streamGeminiResponse, generateFitnessVideo } from './services/gemini';
import { Message, GroundingSource } from './types';
import { Dumbbell, Activity, Zap, Video as VideoIcon, AlertCircle } from 'lucide-react';
import { VideoModal } from './components/VideoModal';

declare global {
  interface AIStudio {
    hasSelectedApiKey(): Promise<boolean>;
    openSelectKey(): Promise<void>;
  }
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: "Hi! I'm FitStream AI. I can research workout tips or find streaming videos. Try asking for 'HIIT workout videos' or say 'Generate a video of a yoga pose'!",
      timestamp: Date.now(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState<string>('');
  
  const [videoModal, setVideoModal] = useState<{isOpen: boolean; url: string; type: 'youtube' | 'native'} | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handlePlayVideo = (url: string, type: 'youtube' | 'native') => {
    setVideoModal({ isOpen: true, url, type });
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      text: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Detect Video Generation Intent
    const isVideoGen = text.toLowerCase().includes('generate video') || 
                       text.toLowerCase().includes('create a video') ||
                       text.toLowerCase().startsWith('/video');

    if (isVideoGen) {
      setLoadingText('Initializing creative studio...');
      try {
        // Check API Key for Veo
        if (window.aistudio) {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await window.aistudio.openSelectKey();
                // Re-check or assume success, if fail, retry block handles it
            }
        }

        setLoadingText('Generating your custom fitness video (this takes a moment)...');
        const videoUrl = await generateFitnessVideo(text);
        
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            text: `I've generated a video based on your request: "${text}".`,
            generatedVideo: {
                url: videoUrl,
                mimeType: 'video/mp4'
            },
            timestamp: Date.now(),
          }
        ]);

      } catch (error: any) {
        console.error('Video Gen Error:', error);
        let errorText = "I couldn't generate that video right now.";
        
        // Handle API Key error specifically if possible, though generic fallback is safe
        if (error.message?.includes('Requested entity was not found') && window.aistudio) {
             await window.aistudio.openSelectKey();
             errorText = "It seems the API Key was invalid or missing. Please select a valid key and try again.";
        }

        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            text: errorText,
            timestamp: Date.now(),
            isError: true,
          },
        ]);
      } finally {
        setIsLoading(false);
        setLoadingText('');
      }
      return;
    }

    // Standard Chat / Research
    try {
      setLoadingText('Searching fitness database...');
      const placeholderId = Date.now();
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: '',
          id: placeholderId,
          timestamp: Date.now(),
          isStreaming: true,
        },
      ]);

      let fullText = '';
      let groundingSources: GroundingSource[] = [];

      await streamGeminiResponse(
        text,
        messages.slice(1),
        (chunkText, sources) => {
          fullText += chunkText;
          if (sources) {
            groundingSources = sources;
          }

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === placeholderId
                ? { ...msg, text: fullText, sources: groundingSources }
                : msg
            )
          );
        }
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === placeholderId ? { ...msg, isStreaming: false } : msg
        )
      );
    } catch (error) {
      console.error('Error getting response:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: "Sorry, I encountered an error while researching that for you. Please try again.",
          timestamp: Date.now(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      setLoadingText('');
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-slate-900 text-slate-200 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-800/50 backdrop-blur-md border-b border-slate-700 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg shadow-lg shadow-emerald-500/20">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              FitStream AI
            </h1>
            <p className="text-xs text-slate-400">Research & Video Companion</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-400">
          <div className="flex items-center gap-1">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Research</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>Instant Stream</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-slate-800 rounded-md border border-slate-700">
            <VideoIcon className="w-3 h-3 text-purple-400" />
            <span className="text-xs">Veo Gen Enabled</span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, index) => (
            <ChatMessage 
                key={msg.id || index} 
                message={msg} 
                onPlayVideo={handlePlayVideo}
            />
          ))}
          
          {isLoading && (
            <div className="flex items-center gap-3 text-slate-500 text-sm animate-pulse ml-2 p-3 bg-slate-800/50 rounded-xl max-w-fit">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-emerald-400 font-medium">{loadingText}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="max-w-3xl mx-auto">
          <InputBox onSend={handleSendMessage} isLoading={isLoading} />
          <div className="flex justify-between items-center mt-2 px-1">
             <p className="text-xs text-slate-500">
                Try "Find 10 min abs workout" or "Generate video of a futuristic gym"
             </p>
          </div>
        </div>
      </div>

      {/* Video Theater Modal */}
      {videoModal && (
        <VideoModal 
            url={videoModal.url} 
            type={videoModal.type} 
            onClose={() => setVideoModal(null)} 
        />
      )}
    </div>
  );
}