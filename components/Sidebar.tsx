import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';
import { useLanguage } from './LanguageContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onLogout: () => void;
}

const PRESET_AVATARS = ["🦊", "🐼", "🦁", "🐰", "🐨", "🐯"];

// --- Account Settings Sub-Component ---
const AccountSettingsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState(() => localStorage.getItem('trilog_email') || '');
  const [password, setPassword] = useState(() => localStorage.getItem('trilog_password') || '');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    setError(null);
    setSuccess(false);

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('invalid_login'));
      return;
    }

    // Password Validation: 6-8 chars, letters + numbers
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,8}$/;
    
    if (!passwordRegex.test(password)) {
      setError(t('password_rule_error'));
      return;
    }

    // Save
    localStorage.setItem('trilog_email', email);
    localStorage.setItem('trilog_password', password);
    setSuccess(true);

    // Clear success message after 2 seconds
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div className="absolute inset-0 bg-white dark:bg-slate-900 z-20 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-50 dark:border-slate-800">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400"
        >
          <Icons.ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('account_info')}</h2>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        
        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">
            {t('email_address')}
          </label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors">
              <Icons.Mail size={18} />
            </div>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">
            {t('password')}
          </label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors">
              <Icons.Lock size={18} />
            </div>
            <input 
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              maxLength={8}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-10 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400 font-mono tracking-wide"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {showPassword ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 px-1 leading-normal">
            {t('password_rule_hint')}
          </p>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-2 animate-in slide-in-from-top-1">
            <Icons.X size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 text-green-600 dark:text-green-400 text-xs flex items-start gap-2 animate-in slide-in-from-top-1">
            <Icons.CheckCircle size={14} className="mt-0.5 shrink-0" />
            <span>{t('account_saved')}</span>
          </div>
        )}

      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-slate-50 dark:border-slate-800">
        <button 
          onClick={handleSave}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
        >
          {t('save_changes')}
        </button>
      </div>
    </div>
  );
};

// --- Notifications Settings Sub-Component ---
const NotificationsSettingsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useLanguage();
  const [enabled, setEnabled] = useState(() => localStorage.getItem('trilog_reminder_enabled') === 'true');
  const [time, setTime] = useState(() => localStorage.getItem('trilog_reminder_time') || '20:00');
  const [permission, setPermission] = useState(Notification.permission);

  const handleToggle = async () => {
    const newState = !enabled;
    if (newState) {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== 'granted') {
        alert(t('enable_notifications_alert'));
      }
    }
    setEnabled(newState);
    localStorage.setItem('trilog_reminder_enabled', String(newState));
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);
    localStorage.setItem('trilog_reminder_time', newTime);
  };

  return (
    <div className="absolute inset-0 bg-white dark:bg-slate-900 z-20 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-50 dark:border-slate-800">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400"
        >
          <Icons.ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('notifications')}</h2>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-6">
        
        {/* Daily Reminder Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${enabled ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'} transition-colors`}>
              <Icons.Bell size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{t('daily_reminder')}</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">{t('get_reminded')}</p>
            </div>
          </div>
          
          <button 
            onClick={handleToggle}
            className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 flex items-center ${enabled ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${enabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
          </button>
        </div>

        {/* Time Picker (Conditionally rendered) */}
        <div className={`transition-all duration-300 ease-out overflow-hidden ${enabled ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col gap-2">
             <div className="flex items-center gap-2 mb-1">
               <Icons.Clock size={16} className="text-slate-400 dark:text-slate-500" />
               <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('reminder_time')}</span>
             </div>
             
             <div className="relative">
               <input 
                 type="time" 
                 value={time}
                 onChange={handleTimeChange}
                 className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-2xl font-bold text-slate-800 dark:text-slate-100 text-center focus:outline-none focus:border-indigo-500 transition-colors"
               />
             </div>
             <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-1">
               {t('reminder_desc')}
             </p>
          </div>
        </div>
        
        {enabled && permission === 'denied' && (
           <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center gap-2">
             <Icons.X size={14} />
             <span>{t('notifications_blocked')}</span>
           </div>
        )}

      </div>
    </div>
  );
};

// --- Language Settings Sub-Component ---
const LanguageSettingsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t, language, setLanguage } = useLanguage();

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'zh', label: '中文 (Chinese)', flag: '🇨🇳' }
  ] as const;

  return (
    <div className="absolute inset-0 bg-white dark:bg-slate-900 z-20 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-50 dark:border-slate-800">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400"
        >
          <Icons.ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('language')}</h2>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-4">
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
          {t('display_language')}
        </p>
        
        <div className="space-y-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                language === lang.code 
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 ring-1 ring-indigo-500/20' 
                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lang.flag}</span>
                <span className={`font-medium ${language === lang.code ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                  {lang.label}
                </span>
              </div>
              
              {language === lang.code && (
                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                  <Icons.Check size={14} strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Help & Support Sub-Component ---
const HelpView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useLanguage();
  return (
    <div className="absolute inset-0 bg-white dark:bg-slate-900 z-20 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-50 dark:border-slate-800">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400"
        >
          <Icons.ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('help_support')}</h2>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-6 text-slate-600 dark:text-slate-300 leading-relaxed font-light">
          
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl">
            <h3 className="text-indigo-600 dark:text-indigo-400 font-bold text-lg mb-2">{t('welcome_home')}</h3>
            <p className="text-sm">
              {t('welcome_desc')}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2">{t('rule_of_three')}</h4>
            <p className="text-sm mb-4">
              {t('rule_desc')}
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-2xl shrink-0">🏆</span>
                <span>
                  <strong className="text-amber-600 dark:text-amber-400 block mb-0.5">{t('victory_title')}</strong>
                  {t('victory_help')}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl shrink-0">🌧️</span>
                <span>
                  <strong className="text-slate-600 dark:text-slate-400 block mb-0.5">{t('anxiety_title')}</strong>
                  {t('anxiety_help')}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl shrink-0">🙏</span>
                <span>
                  <strong className="text-rose-600 dark:text-rose-400 block mb-0.5">{t('gratitude_title')}</strong>
                  {t('gratitude_help')}
                </span>
              </li>
            </ul>
          </div>

          <div className="text-center pt-8 pb-4">
            <span className="text-xs font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">
              {t('designed_with_love')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};


export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, theme, toggleTheme, onLogout }) => {
  const { t } = useLanguage();
  // Navigation State
  const [activeView, setActiveView] = useState<'main' | 'account' | 'notifications' | 'language' | 'help'>('main');

  // Avatar State
  const [avatar, setAvatar] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('trilog_avatar');
    }
    return null;
  });
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Username State
  const [username, setUsername] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('trilog_username') || 'Traveler';
    }
    return 'Traveler';
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Reset view when sidebar closes
  useEffect(() => {
    if (!isOpen) {
      // Delay reset slightly to wait for closing animation
      const timer = setTimeout(() => {
        setActiveView('main');
        setIsPickerOpen(false);
        setIsEditingName(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

  const handleSelectAvatar = (emoji: string) => {
    setAvatar(emoji);
    localStorage.setItem('trilog_avatar', emoji);
    setIsPickerOpen(false);
  };

  const handleSaveName = () => {
    const newName = username.trim() || 'Traveler';
    setUsername(newName);
    localStorage.setItem('trilog_username', newName);
    setIsEditingName(false);
  };

  const menuItems = [
    { id: 'account', icon: Icons.User, label: t('account_info') },
    { id: 'security', icon: Icons.Shield, label: t('security_privacy') },
    { id: 'notifications', icon: Icons.Bell, label: t('notifications') },
    { id: 'language', icon: Icons.Globe || Icons.Settings, label: t('language') }, // Globe fallback if not in icons yet, using settings logic
    { id: 'help', icon: Icons.HelpCircle, label: t('help_support') },
  ];

  const handleMenuClick = (id: string) => {
    if (id === 'account') setActiveView('account');
    else if (id === 'notifications') setActiveView('notifications');
    else if (id === 'language') setActiveView('language');
    else if (id === 'help') setActiveView('help');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/20 dark:bg-slate-950/50 backdrop-blur-sm z-[150] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-slate-900 z-[160] shadow-2xl dark:shadow-black/50 transform transition-transform duration-300 ease-out flex flex-col overflow-hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Render Main View or Sub Views */}
        {activeView === 'account' ? (
          <AccountSettingsView onBack={() => setActiveView('main')} />
        ) : activeView === 'notifications' ? (
          <NotificationsSettingsView onBack={() => setActiveView('main')} />
        ) : activeView === 'language' ? (
          <LanguageSettingsView onBack={() => setActiveView('main')} />
        ) : activeView === 'help' ? (
          <HelpView onBack={() => setActiveView('main')} />
        ) : (
          <>
            {/* User Header */}
            <div className="p-8 pb-6 border-b border-slate-50 dark:border-slate-800 flex flex-col items-center text-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-900">
              
              {/* Avatar Container */}
              <div 
                className="relative group cursor-pointer mb-3"
                onClick={() => setIsPickerOpen(!isPickerOpen)}
              >
                <div className={`w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border-4 border-white dark:border-slate-700 shadow-md flex items-center justify-center transition-all duration-300 ${isPickerOpen ? 'ring-4 ring-indigo-50 dark:ring-indigo-900/30 scale-105' : ''}`}>
                  {avatar ? (
                    <span className="text-5xl leading-none select-none animate-in zoom-in-50 duration-300 filter drop-shadow-sm">{avatar}</span>
                  ) : (
                    <Icons.User size={40} className="text-slate-300 dark:text-slate-500" />
                  )}
                </div>
                
                {/* Edit Badge */}
                <div className="absolute bottom-0 right-0 bg-white dark:bg-slate-700 rounded-full p-1.5 shadow-md border border-slate-50 dark:border-slate-600 text-slate-400 dark:text-slate-300 group-hover:text-indigo-500 transition-colors">
                  <Icons.Edit size={14} />
                </div>
              </div>

              {/* Avatar Picker */}
              <div className={`overflow-hidden transition-all duration-300 ease-out ${isPickerOpen ? 'max-h-20 opacity-100 mb-4' : 'max-h-0 opacity-0 mb-0'}`}>
                <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl flex items-center justify-center gap-2 border border-slate-100 dark:border-slate-700 shadow-inner mx-auto">
                  {PRESET_AVATARS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAvatar(emoji);
                      }}
                      className={`w-8 h-8 flex items-center justify-center text-xl rounded-full transition-transform hover:scale-125 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm ${avatar === emoji ? 'bg-white dark:bg-slate-600 shadow-sm scale-110' : 'opacity-70 hover:opacity-100'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable Username */}
              <div className="mt-1 h-9 flex items-center justify-center relative w-full">
                {isEditingName ? (
                  <input 
                    ref={nameInputRef}
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onBlur={handleSaveName}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    maxLength={15}
                    className="text-lg font-bold text-slate-800 dark:text-slate-100 text-center bg-white dark:bg-slate-800 border-2 border-indigo-100 dark:border-indigo-900/50 rounded-xl px-2 py-0 w-40 focus:outline-none focus:border-indigo-400 focus:shadow-sm transition-all"
                  />
                ) : (
                  <button 
                    onClick={() => setIsEditingName(true)}
                    className="flex items-center gap-2 px-3 py-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group/name max-w-full"
                  >
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">{username}</h3>
                    <Icons.Edit size={14} className="text-slate-300 dark:text-slate-500 group-hover/name:text-indigo-400 transition-colors shrink-0" />
                  </button>
                )}
              </div>
              
              <span className="text-xs font-medium text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full mt-1.5">{t('free_plan')}</span>
            </div>

            {/* Menu Items */}
            <div className="flex-1 py-4 overflow-y-auto no-scrollbar">
              <div className="px-4 space-y-1">
                {menuItems.map((item, idx) => (
                  <button 
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors group"
                  >
                    <item.icon size={20} className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 transition-colors" />
                    <span className="font-medium text-sm">{item.label}</span>
                    <Icons.ChevronRight size={16} className="ml-auto text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}

                {/* Appearance Toggle */}
                <div className="w-full flex items-center justify-between space-x-3 p-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group cursor-pointer" onClick={toggleTheme}>
                  <div className="flex items-center space-x-3">
                    <Icons.Moon size={20} className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 transition-colors" />
                    <span className="font-medium text-sm">{t('appearance')}</span>
                  </div>
                  
                  {/* Toggle Switch */}
                  <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 flex items-center ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
              <button 
                onClick={onLogout}
                className="w-full flex items-center space-x-2 text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors font-medium text-sm mb-4"
              >
                <Icons.LogOut size={18} />
                <span>{t('logout')}</span>
              </button>
              
              <div className="text-center">
                <p className="text-[10px] text-slate-400 dark:text-slate-600 font-medium">{t('version')}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};