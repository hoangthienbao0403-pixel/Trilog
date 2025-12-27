import React, { useMemo } from 'react';
import { Icons } from './Icons';
import { JournalItem, CategoryType } from '../types';
import { useLanguage } from './LanguageContext';

interface EntryCardProps {
  type: CategoryType;
  data: JournalItem;
  onClick: () => void;
  className?: string;
}

export const EntryCard: React.FC<EntryCardProps> = ({ type, data, onClick, className = '' }) => {
  const { t } = useLanguage();
  
  const hasContent = data.text.length > 0 || data.images.length > 0 || !!data.audio;

  // Configuration memoized to react to language changes
  const config = useMemo(() => {
    const configs = {
      victory: {
        title: t('victory_title'),
        emoji: '🏆',
        gradient: 'bg-gradient-to-br from-amber-100 via-orange-50 to-amber-100 dark:from-amber-950/40 dark:via-slate-900 dark:to-amber-950/20',
        border: 'border-amber-200 dark:border-amber-900/30',
        textMain: 'text-amber-900 dark:text-amber-100',
        textSub: 'text-amber-700 dark:text-amber-300',
        iconColor: 'text-amber-600 dark:text-amber-400',
        placeholder: t('victory_placeholder'),
        CompletedIcon: Icons.Award,
        completedLabel: t('achieved')
      },
      anxiety: {
        title: t('anxiety_title'),
        emoji: '🌧️',
        gradient: 'bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 dark:from-slate-800/40 dark:via-slate-900 dark:to-slate-800/20',
        border: 'border-slate-200 dark:border-slate-700/50',
        textMain: 'text-slate-900 dark:text-slate-100',
        textSub: 'text-slate-600 dark:text-slate-400',
        iconColor: 'text-slate-500 dark:text-slate-400',
        placeholder: t('anxiety_placeholder'),
        CompletedIcon: Icons.Feather,
        completedLabel: t('released')
      },
      gratitude: {
        title: t('gratitude_title'),
        emoji: '🙏',
        gradient: 'bg-gradient-to-br from-rose-100 via-pink-50 to-rose-100 dark:from-rose-950/40 dark:via-slate-900 dark:to-rose-950/20',
        border: 'border-rose-200 dark:border-rose-900/30',
        textMain: 'text-rose-900 dark:text-rose-100',
        textSub: 'text-rose-700 dark:text-rose-300',
        iconColor: 'text-rose-500 dark:text-rose-400',
        placeholder: t('gratitude_placeholder'),
        CompletedIcon: Icons.Heart,
        completedLabel: t('cherished')
      }
    };
    return configs[type];
  }, [type, t]);

  const IconComponent = config.CompletedIcon;

  return (
    <div 
      onClick={onClick}
      className={`relative group rounded-3xl p-6 transition-all duration-300 ${config.gradient} border ${config.border} shadow-sm hover:shadow-md cursor-pointer active:scale-[0.98] overflow-hidden flex flex-col justify-between min-h-[160px] ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <h3 className={`text-lg font-bold tracking-tight ${config.textMain} flex items-center gap-2`}>
          <span className="text-xl filter drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300">{config.emoji}</span>
          {config.title}
        </h3>
        <div className={`p-2 rounded-full bg-white/30 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity ${config.textMain}`}>
          <Icons.Edit size={16} />
        </div>
      </div>

      {/* Content State Display */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {hasContent ? (
          <div className="flex flex-col items-center justify-center animate-in zoom-in-50 duration-500">
             <div className={`w-14 h-14 rounded-full border-2 ${config.border} flex items-center justify-center bg-white/20 dark:bg-white/5 backdrop-blur-sm shadow-sm mb-2 group-hover:scale-110 transition-transform`}>
                <IconComponent 
                  size={28} 
                  className={`${config.textMain} ${type === 'gratitude' ? 'fill-rose-400/20' : ''}`} 
                  strokeWidth={2.5} 
                />
             </div>
             <span className={`text-xs font-bold uppercase tracking-widest ${config.textSub} opacity-80`}>
                {config.completedLabel}
             </span>
          </div>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center opacity-50">
             <p className={`${config.textSub} text-sm italic font-medium text-center px-4`}>
               {config.placeholder}
             </p>
          </div>
        )}
      </div>

      {/* Indicators (Bottom Row) */}
      {hasContent && (
        <div className="flex items-center justify-center gap-3 mt-4 pt-0 shrink-0 opacity-60">
          {data.images.length > 0 && (
             <div className="flex items-center gap-1" title={`${data.images.length} images`}>
                <Icons.Image size={14} className={config.textSub} />
                <span className={`text-[10px] font-bold ${config.textSub}`}>{data.images.length}</span>
             </div>
          )}
          {data.audio && (
             <div className="flex items-center gap-1" title="Voice note attached">
                <Icons.Mic size={14} className={config.textSub} />
             </div>
          )}
        </div>
      )}
    </div>
  );
};