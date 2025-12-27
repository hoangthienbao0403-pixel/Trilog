import React, { useState, useMemo } from 'react';
import { JournalData, CategoryType, DailyEntry } from '../types';
import { Icons } from './Icons';
import { analyzeJournalEntries } from '../services/geminiService';
import { formatDateKey, parseDateKey } from '../utils';
import { WheelDatePicker } from './WheelDatePicker';
import { useLanguage } from './LanguageContext';

interface StatsViewProps {
  journalData: JournalData;
}

export const StatsView: React.FC<StatsViewProps> = ({ journalData }) => {
  const { t, language } = useLanguage();
  
  // Default range: last 7 days
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);

  const [startDateStr, setStartDateStr] = useState(formatDateKey(weekAgo));
  const [endDateStr, setEndDateStr] = useState(formatDateKey(today));
  
  const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(null);
  const [activeTab, setActiveTab] = useState<CategoryType>('victory');

  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Tabs Configuration
  const tabs = useMemo(() => [
    { id: 'victory' as CategoryType, label: t('tab_victory'), emoji: '🏆', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100', darkBg: 'dark:bg-amber-900/30' },
    { id: 'anxiety' as CategoryType, label: t('tab_anxiety'), emoji: '🌧️', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-200', darkBg: 'dark:bg-slate-800' },
    { id: 'gratitude' as CategoryType, label: t('tab_gratitude'), emoji: '🙏', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100', darkBg: 'dark:bg-rose-900/30' },
  ], [t]);

  // Group entries for the selected range
  const filteredEntries = useMemo(() => {
    const entries = Object.entries(journalData)
      .filter(([date]) => date >= startDateStr && date <= endDateStr)
      .sort((a, b) => b[0].localeCompare(a[0])); // Sort descending by date

    const grouped = {
      victory: [] as { date: string; content: any }[],
      anxiety: [] as { date: string; content: any }[],
      gratitude: [] as { date: string; content: any }[],
    };

    entries.forEach(([date, rawEntry]) => {
      const entry = rawEntry as DailyEntry;
      if (entry.victory.text || entry.victory.images.length > 0) {
        grouped.victory.push({ date, content: entry.victory });
      }
      if (entry.anxiety.text || entry.anxiety.images.length > 0) {
        grouped.anxiety.push({ date, content: entry.anxiety });
      }
      if (entry.gratitude.text || entry.gratitude.images.length > 0) {
        grouped.gratitude.push({ date, content: entry.gratitude });
      }
    });

    return grouped;
  }, [journalData, startDateStr, endDateStr]);

  const handleGenerateAnalysis = async () => {
    setLoading(true);
    setAnalysis(null);
    const result = await analyzeJournalEntries(startDateStr, endDateStr, journalData, language);
    setAnalysis(result);
    setLoading(false);
  };

  const getEntryCount = () => {
    let count = 0;
    Object.keys(journalData).forEach(key => {
      if (key >= startDateStr && key <= endDateStr) {
        const entry = journalData[key];
        if (entry.victory.text || entry.anxiety.text || entry.gratitude.text) {
          count++;
        }
      }
    });
    return count;
  };

  // Helper to format date for display
  const formatDisplayDate = (dateStr: string) => {
    const date = parseDateKey(dateStr);
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const currentTab = tabs.find(t => t.id === activeTab);
  const activeTabColor = currentTab?.color || 'text-slate-600';
  const activeTabBg = currentTab?.bg || 'bg-slate-200';
  const activeTabDarkBg = currentTab?.darkBg || 'dark:bg-slate-800';

  return (
    <div className="pb-24">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
        <span>{t('insights')}</span> <span className="text-2xl">📊</span>
      </h2>
      
      {/* Date Range Selector */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 mb-6 transition-colors">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1">
          <span>🗓️</span> {t('select_range')}
        </h3>
        <div className="flex items-center space-x-4">
          {/* Start Date Button */}
          <div className="flex-1">
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t('from')}</label>
            <button
              onClick={() => setActivePicker('start')}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-200 font-medium text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-between group"
            >
              <span>{formatDisplayDate(startDateStr)}</span>
              <Icons.Calendar size={14} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
            </button>
          </div>
          
          {/* End Date Button */}
          <div className="flex-1">
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t('to')}</label>
            <button
              onClick={() => setActivePicker('end')}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-200 font-medium text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-between group"
            >
              <span>{formatDisplayDate(endDateStr)}</span>
              <Icons.Calendar size={14} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
            </button>
          </div>
        </div>
        <div className="mt-4 text-xs text-slate-400 dark:text-slate-500 text-center font-medium flex items-center justify-center gap-1">
          <span>📅</span>
          {getEntryCount()} {t('active_days')}
        </div>
      </div>

      {/* Date Pickers */}
      <WheelDatePicker 
        isOpen={activePicker === 'start'}
        onClose={() => setActivePicker(null)}
        initialDate={parseDateKey(startDateStr)}
        onSelect={(date) => setStartDateStr(formatDateKey(date))}
        title={t('from')}
      />
      
      <WheelDatePicker 
        isOpen={activePicker === 'end'}
        onClose={() => setActivePicker(null)}
        initialDate={parseDateKey(endDateStr)}
        onSelect={(date) => setEndDateStr(formatDateKey(date))}
        title={t('to')}
      />

      {/* Classified Entries List */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 px-1 flex items-center gap-2">
           <span>📝</span> {t('journal_records')}
        </h3>
        
        {/* Tabs */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
                activeTab === tab.id 
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm scale-100' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 scale-95'
              }`}
            >
              <span className="text-base">{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* List Content */}
        <div className="space-y-4 min-h-[120px]">
          {filteredEntries[activeTab].length > 0 ? (
            filteredEntries[activeTab].map((item, idx) => (
              <div 
                key={`${item.date}-${idx}`} 
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm animate-in slide-in-from-bottom-2 duration-300 transition-colors"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                    {parseDateKey(item.date).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${activeTabBg.replace('bg-', 'bg-').replace('100', '400')} dark:bg-current ${activeTabColor}`}></div>
                </div>
                
                <p className={`text-base leading-relaxed ${activeTabColor.replace('600', '800').replace('dark:text-slate-400', 'dark:text-slate-200').replace('dark:text-amber-400', 'dark:text-amber-100').replace('dark:text-rose-400', 'dark:text-rose-100')}`}>
                  {item.content.text}
                </p>

                {item.content.images && item.content.images.length > 0 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto pb-2 no-scrollbar">
                    {item.content.images.map((img: string, i: number) => (
                      <img 
                        key={i} 
                        src={img} 
                        alt="memory" 
                        className="w-16 h-16 rounded-xl object-cover border border-slate-100 dark:border-slate-800" 
                      />
                    ))}
                  </div>
                )}
                
                {item.content.audio && (
                   <div className="mt-3 inline-flex items-center px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full text-xs text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
                     <Icons.Mic size={12} className="mr-1.5" />
                     <span>{t('voice_note')}</span>
                   </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-slate-300 dark:text-slate-600">
               <div className={`p-4 rounded-full mb-3 ${activeTabBg} dark:bg-opacity-10 ${activeTabDarkBg}`}>
                 <span className="text-3xl opacity-60">
                    {tabs.find(t => t.id === activeTab)?.emoji}
                 </span>
               </div>
               <p className="text-sm font-medium">{t('no_records')}</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Analysis Section - Compact Bottom Module */}
      <div className="bg-gradient-to-r from-indigo-500 to-violet-600 dark:from-indigo-600 dark:to-violet-800 rounded-2xl p-4 shadow-md text-white overflow-hidden transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🧠</span>
            <h3 className="text-sm font-bold">{t('ai_summary')}</h3>
          </div>
        </div>
        
        {!analysis && !loading ? (
          <div className="flex items-center justify-between">
            <p className="text-indigo-100 text-xs flex-1 mr-4">
              {t('ai_desc')}
            </p>
            <button 
              onClick={handleGenerateAnalysis}
              className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2 px-3 rounded-lg transition-all flex items-center whitespace-nowrap"
            >
              {t('generate')}
            </button>
          </div>
        ) : loading ? (
           <div className="flex items-center space-x-3 py-1">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span className="text-xs font-medium animate-pulse">{t('analyzing')}</span>
           </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="prose prose-invert prose-sm max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed text-indigo-50 text-xs">{analysis}</p>
            </div>
            <button 
              onClick={() => setAnalysis(null)}
              className="mt-2 text-[10px] text-indigo-200 hover:text-white uppercase tracking-wider font-bold"
            >
              {t('close')}
            </button>
          </div>
        )}
      </div>

    </div>
  );
};