import React from 'react';
import { ExternalLink, PlayCircle, Maximize2 } from 'lucide-react';

interface VideoEmbedProps {
  url: string;
  title: string;
  onExpand?: () => void;
}

export const VideoEmbed: React.FC<VideoEmbedProps> = ({ url, title, onExpand }) => {
  // Simple heuristic to extract YouTube Video ID
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeId(url);

  if (videoId) {
    return (
      <div className="group mt-4 mb-6 relative rounded-xl overflow-hidden shadow-lg bg-black ring-1 ring-slate-700">
        <div className="relative pb-[56.25%] h-0">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        
        {/* Header Bar */}
        <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-end pointer-events-none">
             {onExpand && (
                <button 
                  onClick={(e) => {
                      e.stopPropagation();
                      onExpand();
                  }}
                  className="pointer-events-auto p-1.5 bg-slate-800/80 text-white rounded-lg hover:bg-emerald-500 transition-colors backdrop-blur-sm"
                  title="Maximize"
                >
                    <Maximize2 className="w-4 h-4" />
                </button>
             )}
        </div>

        <div className="p-3 bg-slate-800 flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-slate-300 font-medium truncate">{title}</span>
        </div>
      </div>
    );
  }

  // Fallback for non-embeddable video links
  return (
    <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 mt-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors group"
    >
        <div className="bg-slate-900 p-2 rounded-md group-hover:bg-slate-800 transition-colors">
            <ExternalLink className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-slate-200 truncate">{title}</h4>
            <p className="text-xs text-slate-500 truncate">{url}</p>
        </div>
    </a>
  );
};
