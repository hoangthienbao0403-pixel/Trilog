import React, { useRef, useState, useEffect } from 'react';
import { Icons } from './Icons';
import { JournalItem, CategoryType } from '../types';
import { fileToBase64, blobToBase64 } from '../utils';
import { useLanguage } from './LanguageContext';

interface EntryEditorProps {
  type: CategoryType;
  data: JournalItem;
  isOpen: boolean;
  onClose: () => void;
  onChange: (newData: JournalItem) => void;
}

const THEME = {
  victory: { 
    // Warm Amber/Gold Gradient - Premium feel
    bg: 'bg-gradient-to-br from-[#FFFCF5] to-[#FFF4E0] dark:bg-gradient-to-br dark:from-slate-950 dark:to-[#2D1B0A]', 
    accent: 'text-amber-600 dark:text-amber-500',
    placeholder: 'text-amber-900/20 dark:text-amber-100/20',
    text: 'text-amber-950 dark:text-amber-50',
  },
  anxiety: { 
    // Cool Slate/Blue Gradient - Calm feel
    bg: 'bg-gradient-to-br from-[#F8FAFC] to-[#EEF4FF] dark:bg-gradient-to-br dark:from-slate-950 dark:to-[#0F172A]', 
    accent: 'text-slate-500 dark:text-slate-400',
    placeholder: 'text-slate-900/20 dark:text-slate-100/20',
    text: 'text-slate-800 dark:text-slate-200',
  },
  gratitude: { 
    // Soft Rose Gradient - Warm feel
    bg: 'bg-gradient-to-br from-[#FFFAFB] to-[#FFE9EF] dark:bg-gradient-to-br dark:from-slate-950 dark:to-[#2A0F15]',
    accent: 'text-rose-500 dark:text-rose-400',
    placeholder: 'text-rose-900/20 dark:text-rose-100/20',
    text: 'text-rose-950 dark:text-rose-50',
  },
};

const MOOD_EMOJIS = [
  "😊", "😌", "🥳", "🥰", "🤩", "😎", "😆", "😅", "🥲", "🫡", "😇", "🤗",
  "🤔", "😶", "😶‍🌫️", "🙄", "😬", "😮", "🤠",
  "😤", "😡", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😢", "😭", "😓", "😵‍💫", "😞", "😔",
  "😴", "🥱", "🤮", "🤧", "🤕", "😷", "🥴",
  "👏", "👍", "👎", "👊", "✌️", "🤟", "👌", "🙏", "💪", "🙌", "👀", "🧠", "🫀",
  "🌟", "🔥", "✨", "💫", "🌈", "☀️", "🌙", "☁️", "⛈️", "❄️", "🌊", "⚡",
  "🌱", "🌿", "🌻", "🌹", "🍂", "🍄", "🌵", "🐾", "🦋", "🦄",
  "☕", "🍵", "🍻", "🥂", "🍕", "🍦", "🍫", "🎂",
  "🏆", "🥇", "🎯", "🎨", "🎤", "🎧", "🎮", "📚", "🖊️", "💻", "✈️", "🚀", "🏠",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💔", "💯", "💤", "⚠️", "✅"
];

// --- Sub-Component: Isolated Audio Player ---
const JournalAudioPlayer: React.FC<{ 
  src: string; 
  theme: typeof THEME['victory']; 
  onDelete: () => void; 
}> = ({ src, theme, onDelete }) => {
  const { t } = useLanguage();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlayback = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const curr = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      setCurrentTime(curr);
      if (dur > 0) setProgress((curr / dur) * 100);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const newTime = (x / width) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
    }
  };

  // Dedicated handler for delete to ensure it captures clicks aggressively
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation(); // Nuclear option to prevent bubbling
    onDelete();
  };

  return (
    <div 
      className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 mt-6 animate-in fade-in slide-in-from-bottom-2 ring-1 ring-black/5 dark:ring-white/5 relative z-10" 
      onClick={e => e.stopPropagation()}
    >
      <audio 
        ref={audioRef} 
        src={src} 
        onTimeUpdate={handleTimeUpdate} 
        onEnded={handleEnded}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
      
      <div className="flex items-center gap-4">
        {/* Play Button */}
        <button 
          onClick={togglePlayback} 
          type="button"
          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 ${theme.accent.replace('text-', 'bg-')} text-white shadow-lg shadow-indigo-500/20`}
        >
          {isPlaying ? <Icons.Pause size={20} fill="currentColor" /> : <Icons.Play size={20} fill="currentColor" className="ml-1" />}
        </button>

        {/* Progress Area */}
        <div className="flex-1 space-y-2 overflow-hidden">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('voice_note')}</span>
            <span className="text-[10px] font-mono text-slate-400">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          
          {/* Interactive Progress Bar */}
          <div 
            className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full w-full overflow-hidden cursor-pointer relative group"
            onClick={handleSeek}
          >
              <div 
                className={`h-full rounded-full transition-all duration-100 ease-linear ${theme.accent.replace('text-', 'bg-')}`} 
                style={{ width: `${progress}%` }}
              ></div>
          </div>
        </div>

        {/* Delete Action - Direct action without confirmation dialog */}
        <button 
          type="button"
          onClick={handleDeleteClick}
          className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all relative z-50 cursor-pointer"
          title={t('delete')}
        >
          <Icons.Trash size={18} />
        </button>
      </div>
    </div>
  );
};

export const EntryEditor: React.FC<EntryEditorProps> = ({ type, data, isOpen, onClose, onChange }) => {
  const { t, language } = useLanguage();
  const theme = THEME[type];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimerRef = useRef<number | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Auto-resize textarea logic
  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset to calculate shrink
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(adjustHeight, 10);
    }
  }, [isOpen, data.text]);

  if (!isOpen) return null;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...data, text: e.target.value });
  };

  const addEmoji = (emoji: string) => {
    onChange({ ...data, text: data.text + emoji });
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Media Handlers ---

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        onChange({ ...data, images: [...data.images, base64] });
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
          }
        }, 100);
      } catch (err) {
        console.error("Image upload failed", err);
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...data.images];
    newImages.splice(index, 1);
    onChange({ ...data, images: newImages });
  };

  // Robust delete handler
  const handleDeleteAudio = () => {
    // Explicitly set audio to undefined. This is often cleaner than 'delete' operator
    // for state updates where we want to ensure the key is treated as empty.
    const updatedData = { ...data, audio: undefined };
    onChange(updatedData as JournalItem);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const base64 = await blobToBase64(blob);
        onChange({ ...data, audio: base64 });
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingDuration(0);

      // Start Timer
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Mic denied", err);
      alert("Please allow microphone access to record audio.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  // Date formatter for header
  const dateStr = new Date().toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`fixed inset-0 z-[100] ${theme.bg} flex flex-col animate-in slide-in-from-bottom-10 duration-300 transition-colors`}>
      
      {/* Header - Minimalist */}
      <div className="flex items-center justify-between px-5 py-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-b border-black/5 dark:border-white/5 z-20 relative">
        <button 
          onClick={onClose} 
          className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
        >
          <Icons.ChevronLeft size={22} />
          <span className="font-medium">{t('back')}</span>
        </button>
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest opacity-80">
          {t(`${type}_title`)}
        </span>
        <button 
          onClick={onClose} 
          className={`font-bold ${theme.accent} hover:opacity-80 transition-opacity`}
        >
          {t('done')}
        </button>
      </div>

      {/* Main Edit Area - Apple Notes Style */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto relative no-scrollbar z-10" 
        onClick={() => textareaRef.current?.focus()}
      >
          <div className="px-6 py-6 pb-32 min-h-full flex flex-col">
            
            {/* Date Hint */}
            <div className="text-center text-xs font-medium text-slate-400/80 dark:text-slate-500 mb-6">
              {dateStr}
            </div>

             {/* Text Input - Auto Expanding */}
            <textarea
              ref={textareaRef}
              className={`w-full bg-transparent text-xl leading-relaxed ${theme.text} placeholder:${theme.placeholder} focus:outline-none resize-none overflow-hidden block relative z-20`}
              placeholder={t(`write_${type}`)}
              value={data.text}
              onChange={handleTextChange}
              autoFocus
              rows={1}
              style={{ minHeight: '150px' }}
            />

            {/* Media Area - Integrated Flow */}
            <div className="space-y-4 mt-4 z-20 relative" onClick={(e) => e.stopPropagation()}>
              
              {/* Images Grid */}
              {data.images.length > 0 && (
                <div className="grid grid-cols-1 gap-4 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {data.images.map((img, idx) => (
                    <div key={idx} className="relative rounded-2xl overflow-hidden shadow-sm group ring-1 ring-black/5 dark:ring-white/5 bg-white dark:bg-slate-800">
                      <img src={img} className="w-full h-auto object-cover" alt="attachment" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                      <button 
                        onClick={() => removeImage(idx)}
                        className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100"
                      >
                        <Icons.X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Audio Player Card - Isolated Component */}
              {data.audio && (
                <JournalAudioPlayer 
                  key={data.audio.substring(0, 20)} // Force remount if source changes partially
                  src={data.audio} 
                  theme={theme} 
                  onDelete={handleDeleteAudio} 
                />
              )}
            </div>
          </div>
      </div>

      {/* Bottom Toolbar - Sticky & Dynamic */}
      <div className={`
        absolute bottom-0 left-0 right-0 
        bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl
        border-t border-slate-100 dark:border-slate-800 
        shadow-[0_-4px_30px_rgba(0,0,0,0.03)] dark:shadow-black/20
        transition-all duration-300
        z-30
      `}>
          
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

          {isRecording ? (
            /* Recording State Toolbar */
            <div className="px-6 py-4 flex items-center justify-between animate-in slide-in-from-bottom duration-300">
               {/* Left: Timer & Indicator */}
               <div className="flex items-center gap-3">
                 <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                 </div>
                 <span className="font-mono text-lg font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                   {formatTime(recordingDuration)}
                 </span>
               </div>

               {/* Center: Fake Waveform Animation */}
               <div className="flex items-center justify-center gap-[3px] h-8 flex-1 mx-6 opacity-80">
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1 bg-red-500 rounded-full animate-pulse"
                      style={{ 
                        height: `${Math.max(20, Math.random() * 100)}%`,
                        animationDuration: '0.8s',
                        animationDelay: `${i * 0.05}s`
                      }} 
                    />
                  ))}
               </div>

               {/* Right: Stop Button */}
               <button 
                  onClick={stopRecording}
                  className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg shadow-red-500/30 transition-all hover:scale-105 active:scale-95"
               >
                 <div className="w-3 h-3 bg-white rounded-[2px]" />
               </button>
            </div>
          ) : (
            /* Default Toolbar */
            <div className="px-6 py-3 pb-8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors active:scale-95 group"
                  title="Add Image"
                >
                  <Icons.Image size={24} className="text-slate-500 dark:text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </button>

                <button 
                  onClick={startRecording}
                  disabled={!!data.audio} // Disable if audio already exists
                  className={`p-3 rounded-2xl transition-all active:scale-95 group ${data.audio ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  title="Record Audio"
                >
                  <Icons.Mic size={24} className="text-slate-500 dark:text-slate-400 group-hover:text-red-500 transition-colors" />
                </button>
              </div>

              <div className="relative">
                <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                  className={`p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors active:scale-95 ${showEmojiPicker ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}
                  title="Add Emoji"
                >
                  <Icons.Smile size={24} />
                </button>
                
                {showEmojiPicker && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowEmojiPicker(false)}></div>
                    <div className="absolute bottom-full right-[-10px] mb-4 bg-white dark:bg-slate-900 p-3 rounded-3xl shadow-2xl dark:shadow-black/50 border border-slate-100 dark:border-slate-800 grid grid-cols-6 gap-2 w-80 max-h-72 overflow-y-auto no-scrollbar z-20 animate-in zoom-in-95 duration-200 origin-bottom-right">
                        {MOOD_EMOJIS.map(e => (
                          <button key={e} onClick={() => addEmoji(e)} className="text-2xl hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-xl transition-transform hover:scale-110 flex items-center justify-center">
                            {e}
                          </button>
                        ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};