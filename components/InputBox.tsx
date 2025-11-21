import React, { useState, KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface InputBoxProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

export const InputBox: React.FC<InputBoxProps> = ({ onSend, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative flex items-center w-full">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask for a HIIT workout, yoga poses, or nutrition tips..."
        disabled={isLoading}
        className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-xl pl-4 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-slate-500 transition-all shadow-lg"
      />
      <button
        onClick={handleSend}
        disabled={!input.trim() || isLoading}
        className={`absolute right-2 p-2 rounded-lg transition-all duration-200
          ${input.trim() && !isLoading 
            ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
            : 'bg-slate-700 text-slate-500 cursor-not-allowed'}
        `}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};
