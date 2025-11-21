import React from 'react';
import { X, Film } from 'lucide-react';

interface VideoModalProps {
  url: string;
  type: 'youtube' | 'native';
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ url, type, onClose }) => {
  const getYoutubeEmbedUrl = (videoUrl: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = videoUrl.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : videoUrl;
  };

  const embedUrl = type === 'youtube' ? getYoutubeEmbedUrl(url) : url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10">
        
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={onClose}
            className="p-2 bg-black/50 hover:bg-slate-800 text-white rounded-full transition-colors backdrop-blur-sm"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {type === 'youtube' ? (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={url}
            controls
            autoPlay
            className="w-full h-full"
          />
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
            <div className="flex items-center gap-2 text-emerald-400">
                <Film className="w-5 h-5" />
                <span className="font-semibold tracking-wide text-sm">FitStream Theater Mode</span>
            </div>
        </div>
      </div>
    </div>
  );
};
