import React from 'react';
import { Message } from '../types';
import { User, Bot, Search, Film, Sparkles, Maximize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { VideoEmbed } from './VideoEmbed';

interface ChatMessageProps {
  message: Message;
  onPlayVideo?: (url: string, type: 'youtube' | 'native') => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onPlayVideo }) => {
  const isUser = message.role === 'user';

  // Filter sources to find potential videos for the research case
  const videoSources = message.sources?.filter(s => 
    s.uri.includes('youtube.com') || s.uri.includes('youtu.be') || s.title.toLowerCase().includes('video')
  ) || [];

  const uniqueSources = message.sources ? 
    Array.from(new Map(message.sources.map(item => [item.uri, item])).values()) 
    : [];

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      
      {/* Avatar */}
      <div className={`
        flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg
        ${isUser ? 'bg-slate-700' : 'bg-gradient-to-br from-emerald-500 to-teal-700'}
      `}>
        {isUser ? <User className="w-5 h-5 text-slate-300" /> : <Bot className="w-6 h-6 text-white" />}
      </div>

      {/* Content Bubble */}
      <div className={`flex flex-col max-w-[85%] md:max-w-[75%]`}>
        <div className={`
          rounded-2xl px-5 py-4 shadow-sm
          ${isUser 
            ? 'bg-emerald-600 text-white rounded-tr-none' 
            : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'}
        `}>
            {/* Text Content */}
            {message.text && (
                <div className={`prose prose-invert prose-sm max-w-none ${isUser ? 'prose-p:text-white' : ''}`}>
                   <ReactMarkdown>{message.text}</ReactMarkdown>
                </div>
            )}

            {/* Generated Video (Veo) */}
            {message.generatedVideo && (
                <div className="mt-4 rounded-xl overflow-hidden bg-black border border-emerald-500/30 shadow-xl">
                    <div className="bg-slate-900/80 p-2 flex items-center gap-2 border-b border-white/10">
                        <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span className="text-xs font-medium text-emerald-100">AI Generated Stream</span>
                    </div>
                    <div className="relative group">
                        <video 
                            src={message.generatedVideo.url} 
                            controls 
                            className="w-full aspect-video object-cover"
                        />
                        {onPlayVideo && (
                            <button 
                                onClick={() => onPlayVideo(message.generatedVideo!.url, 'native')}
                                className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-emerald-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
                            >
                                <Maximize2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* Video Embeds from Research (YouTube) */}
        {!isUser && videoSources.length > 0 && (
            <div className="mt-4 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <Film className="w-3 h-3" />
                    <span>Recommended Videos</span>
                </div>
                {videoSources.slice(0, 2).map((video, idx) => (
                    <VideoEmbed 
                        key={idx} 
                        url={video.uri} 
                        title={video.title} 
                        onExpand={onPlayVideo ? () => onPlayVideo(video.uri, 'youtube') : undefined}
                    />
                ))}
            </div>
        )}

        {/* Sources List */}
        {!isUser && uniqueSources.length > 0 && (
            <div className="mt-3 pt-3">
                 <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <Search className="w-3 h-3" />
                    <span>Research Sources</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {uniqueSources.map((source, idx) => (
                        <a 
                            key={idx}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 px-2 py-1 rounded-md transition-colors truncate max-w-[200px]"
                            title={source.title}
                        >
                            {idx + 1}. {source.title}
                        </a>
                    ))}
                </div>
            </div>
        )}

        {/* Timestamp */}
        <span className={`text-[10px] text-slate-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
