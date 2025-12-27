import React, { useMemo } from 'react';
import { Icons } from './Icons';
import { JournalData, JournalItem } from '../types';
import { formatDateKey } from '../utils';
import { useLanguage } from './LanguageContext';

interface CalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  journalData: JournalData;
}

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelectDate, journalData }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date(selectedDate));
  const { language } = useLanguage();

  // Ensure currentMonth is always set to the 1st to avoid month skipping bugs when day is 31
  const normalizedCurrentMonth = useMemo(() => {
    return new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  }, [currentMonth]);

  const daysInMonth = useMemo(() => {
    const year = normalizedCurrentMonth.getFullYear();
    const month = normalizedCurrentMonth.getMonth();
    const date = new Date(year, month, 1);
    const days: (Date | null)[] = [];

    // Pad empty days at start
    const startDay = date.getDay();
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [normalizedCurrentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const getDayStatus = (date: Date): 'complete' | 'partial' | 'empty' => {
    const key = formatDateKey(date);
    const entry = journalData[key];
    if (!entry) return 'empty';

    const hasContent = (item: JournalItem) => 
      (item.text && item.text.trim().length > 0) || 
      (item.images && item.images.length > 0) || 
      !!item.audio;

    const v = hasContent(entry.victory);
    const a = hasContent(entry.anxiety);
    const g = hasContent(entry.gratitude);

    if (v && a && g) return 'complete';
    if (v || a || g) return 'partial';
    return 'empty';
  };

  // Localized Month Title
  const monthTitle = useMemo(() => {
    return new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-US', { month: 'long', year: 'numeric' }).format(normalizedCurrentMonth);
  }, [normalizedCurrentMonth, language]);

  // Localized Weekdays Header
  const weekdays = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'narrow' });
    const days = [];
    // Start from Sunday to match Calendar logic
    const d = new Date(2023, 0, 1); // Jan 1 2023 was a Sunday
    for (let i = 0; i < 7; i++) {
      days.push(formatter.format(d));
      d.setDate(d.getDate() + 1);
    }
    return days;
  }, [language]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          <Icons.ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 capitalize">
          {monthTitle}
        </h2>
        <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          <Icons.ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map((day, idx) => (
          <div key={idx} className="text-center text-xs font-medium text-slate-400 dark:text-slate-500 py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} />;
          
          const isSelected = formatDateKey(date) === formatDateKey(selectedDate);
          const isToday = formatDateKey(date) === formatDateKey(new Date());
          const status = getDayStatus(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => onSelectDate(date)}
              className={`
                relative h-10 w-10 mx-auto flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 group
                ${isSelected 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' 
                  : isToday 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}
              `}
            >
              <span className="relative z-0">{date.getDate()}</span>
              
              {/* Complete: Lightbulb Icon - Made Prominent */}
              {!isSelected && status === 'complete' && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 animate-in zoom-in duration-300 z-10">
                   <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-[1px] rounded-full p-[1px] shadow-sm">
                     <Icons.Lightbulb 
                       size={18} 
                       className="text-yellow-500 dark:text-yellow-400 fill-yellow-400 dark:fill-yellow-400 drop-shadow-[0_2px_4px_rgba(234,179,8,0.5)]" 
                       strokeWidth={2.5}
                     />
                   </div>
                </div>
              )}

              {/* Partial: Dot */}
              {!isSelected && status === 'partial' && (
                <span className="absolute bottom-1.5 h-1 w-1 bg-slate-300 dark:bg-slate-600 rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};