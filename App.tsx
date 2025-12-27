import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Icons } from './components/Icons';
import { Calendar } from './components/Calendar';
import { EntryCard } from './components/EntrySection';
import { EntryEditor } from './components/EntryEditor';
import { StatsView } from './components/StatsView';
import { Sidebar } from './components/Sidebar';
import { LoginView } from './components/LoginView';
import { JournalData, ViewState, CategoryType, JournalItem } from './types';
import { loadJournalData, saveJournalData, getEmptyEntry, formatDateKey } from './utils';
import { useLanguage } from './components/LanguageContext';

const App = () => {
  const { t, language } = useLanguage();
  const [data, setData] = useState<JournalData>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<ViewState>(ViewState.CALENDAR);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('trilog_auth_token') === 'true';
    }
    return false;
  });

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('trilog_theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });

  // Editor State
  const [editorOpen, setEditorOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('victory');

  // Touch handling for swipe
  const touchStartRef = useRef<number | null>(null);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('trilog_theme', theme);
  }, [theme]);

  // Auth Handlers
  const handleLogin = () => {
    localStorage.setItem('trilog_auth_token', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('trilog_auth_token');
    setIsAuthenticated(false);
    setIsSidebarOpen(false); // Close sidebar ensuring fresh state on next login
  };

  // Notification Logic
  useEffect(() => {
    if (!isAuthenticated) return;

    // Check every 30 seconds
    const interval = setInterval(() => {
      const enabled = localStorage.getItem('trilog_reminder_enabled') === 'true';
      if (!enabled) return;

      const time = localStorage.getItem('trilog_reminder_time');
      if (!time) return;

      const lastSent = localStorage.getItem('trilog_reminder_last_sent');
      const today = new Date().toDateString();

      if (lastSent === today) return; // Already sent today

      const [targetHour, targetMinute] = time.split(':').map(Number);
      const now = new Date();
      
      // Check if current time matches (hours and minutes)
      if (now.getHours() === targetHour && now.getMinutes() === targetMinute) {
        if (Notification.permission === 'granted') {
          try {
            new Notification("TriLog", {
              body: "Time to record your small victories, anxieties, and gratitudes for today! ✍️",
            });
            localStorage.setItem('trilog_reminder_last_sent', today);
          } catch (e) {
            console.error("Notification failed", e);
          }
        }
      }
    }, 30000); 

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Load initial data
  useEffect(() => {
    if (isAuthenticated) {
      const loaded = loadJournalData();
      setData(loaded);
    }
  }, [isAuthenticated]);

  // Save on change
  useEffect(() => {
    if (isAuthenticated && Object.keys(data).length > 0) {
      saveJournalData(data);
    }
  }, [data, isAuthenticated]);

  const dateKey = formatDateKey(selectedDate);
  const currentEntry = data[dateKey] || getEmptyEntry();

  const handleEntryChange = (category: CategoryType, newItem: any) => {
    const updatedEntry = { ...currentEntry, [category]: newItem, lastUpdated: Date.now() };
    setData(prev => ({
      ...prev,
      [dateKey]: updatedEntry
    }));
  };

  const openEditor = (category: CategoryType) => {
    setActiveCategory(category);
    setEditorOpen(true);
  };

  const isToday = formatDateKey(new Date()) === dateKey;
  const currentDayNumber = new Date().getDate();

  const handleHeaderCalendarClick = () => {
    if (view === ViewState.STATS) {
      setView(ViewState.CALENDAR);
      setIsCalendarOpen(false); // Reset to closed state like a fresh entry
    } else {
      setIsCalendarOpen(!isCalendarOpen);
    }
  };

  // Check if all three sections have content (text, images, or audio)
  const isDailyComplete = useMemo(() => {
    const hasData = (item: JournalItem) => 
      (item.text && item.text.trim().length > 0) || 
      (item.images && item.images.length > 0) || 
      !!item.audio;

    return (
      hasData(currentEntry.victory) &&
      hasData(currentEntry.anxiety) &&
      hasData(currentEntry.gratitude)
    );
  }, [currentEntry]);

  // Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchEnd - touchStartRef.current;

    // Detect Right Swipe (Start from left edge < 60px to be safe from conflicts)
    if (diff > 50 && touchStartRef.current < 60) {
      setIsSidebarOpen(true);
    }

    touchStartRef.current = null;
  };

  const headerDateStr = useMemo(() => {
    return selectedDate.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  }, [selectedDate, language]);

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div 
      className="max-w-md mx-auto h-screen bg-slate-50 dark:bg-slate-950 relative shadow-2xl overflow-hidden flex flex-col font-sans transition-colors duration-300"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        theme={theme}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
      />
      
      {/* Header with Blur Effect */}
      <header className="pt-5 pb-3 px-6 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100/50 dark:border-slate-800/50 transition-all shrink-0">
        
        {/* Left: Menu & Today & Title */}
        <div className="flex items-center gap-3">
          {/* Menu Button */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-400 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-full transition-colors"
          >
            <Icons.Menu size={22} />
          </button>

          <button 
            onClick={() => setSelectedDate(new Date())}
            className="relative w-10 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm flex flex-col items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all group overflow-hidden ml-1"
            title={t('today')}
          >
            <div className="w-full h-3 bg-red-500 absolute top-0 left-0"></div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 pt-2 font-serif">{currentDayNumber}</span>
          </button>
          
          <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="cursor-pointer group ml-1">
            <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">{t('app_title')}</h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-none mt-0.5 flex items-center gap-1">
              <span>{headerDateStr}</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">✍️</span>
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-4">
          {/* Light Bulb Indicator */}
          <div className="relative group">
            <div 
              className={`p-2 rounded-full transition-all duration-700 ease-out ${
                isDailyComplete 
                  ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)] scale-110 ring-1 ring-yellow-100 dark:ring-yellow-800' 
                  : 'bg-transparent text-slate-200 dark:text-slate-700'
              }`}
            >
              <Icons.Lightbulb 
                size={22} 
                className={`transition-all duration-700 ${isDailyComplete ? 'fill-yellow-400' : 'fill-none'}`}
                strokeWidth={isDailyComplete ? 2 : 2}
              />
            </div>
            
            {/* Tooltip */}
            {!isDailyComplete && (
              <div className="absolute right-0 top-full mt-2 w-40 p-2 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-[10px] rounded-lg text-center opacity-0 transition-opacity pointer-events-none group-hover:opacity-100 z-50">
                {t('tooltip_complete')}
              </div>
            )}
             
            {/* Ping animation when complete */}
             {isDailyComplete && (
                <div className="absolute inset-0 rounded-full animate-ping bg-yellow-400 opacity-20 duration-1000" style={{ animationIterationCount: 1 }}></div>
             )}
          </div>

          {/* View Switcher */}
          <div className="flex bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-full backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
            <button 
              onClick={handleHeaderCalendarClick}
              className={`p-2 rounded-full transition-all duration-300 ${view === ViewState.CALENDAR ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100 scale-100' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 scale-95'}`}
              aria-label="Calendar View"
            >
              <Icons.Calendar size={18} className={isCalendarOpen && view === ViewState.CALENDAR ? "text-indigo-600 dark:text-indigo-400" : ""} />
            </button>
            <button 
              onClick={() => setView(ViewState.STATS)}
              className={`p-2 rounded-full transition-all duration-300 ${view === ViewState.STATS ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100 scale-100' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 scale-95'}`}
              aria-label="Stats View"
            >
              <Icons.Stats size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-5 overflow-hidden flex flex-col">
        {view === ViewState.CALENDAR ? (
          <div className="animate-in fade-in duration-500 flex-1 flex flex-col h-full">
            
            {/* Collapsible Calendar Widget */}
            <div className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden shrink-0 ${isCalendarOpen ? 'max-h-[400px] opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}>
              <Calendar 
                selectedDate={selectedDate} 
                onSelectDate={(date) => {
                  setSelectedDate(date);
                  setIsCalendarOpen(false); // Close calendar to navigate to entries
                }} 
                journalData={data} 
              />
            </div>

            <div className="flex-1 flex flex-col gap-5 min-h-0">
              <EntryCard 
                type="victory" 
                data={currentEntry.victory} 
                onClick={() => openEditor('victory')}
                className="flex-1"
              />
              <EntryCard 
                type="anxiety" 
                data={currentEntry.anxiety} 
                onClick={() => openEditor('anxiety')}
                className="flex-1"
              />
              <EntryCard 
                type="gratitude" 
                data={currentEntry.gratitude} 
                onClick={() => openEditor('gratitude')}
                className="flex-1"
              />
            </div>
            
            {/* Bottom spacer for safe area (iPhone Home Bar) */}
            <div className="h-6 shrink-0"></div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-right duration-500 h-full overflow-y-auto no-scrollbar">
            <StatsView journalData={data} />
          </div>
        )}
      </main>

      {/* Full Screen Editor Overlay */}
      <EntryEditor 
        isOpen={editorOpen}
        type={activeCategory}
        data={currentEntry[activeCategory]}
        onClose={() => setEditorOpen(false)}
        onChange={(val) => handleEntryChange(activeCategory, val)}
      />

    </div>
  );
};

export default App;