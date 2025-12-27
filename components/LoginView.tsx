import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { useLanguage } from './LanguageContext';

interface LoginViewProps {
  onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const { t } = useLanguage();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    // Check if account exists
    const storedEmail = localStorage.getItem('trilog_email');
    if (!storedEmail) {
      setIsRegistering(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError(t('fill_fields'));
      setShake(true);
      return;
    }

    if (isRegistering) {
      // Basic validation
      if (password.length < 4) {
        setError(t('password_short'));
        setShake(true);
        return;
      }
      // Save account
      localStorage.setItem('trilog_email', email);
      localStorage.setItem('trilog_password', password);
      // Login
      onLogin();
    } else {
      // Validate
      const storedEmail = localStorage.getItem('trilog_email');
      const storedPass = localStorage.getItem('trilog_password');

      if (email.toLowerCase() === (storedEmail || '').toLowerCase() && password === storedPass) {
        onLogin();
      } else {
        setError(t('invalid_login'));
        setShake(true);
      }
    }
  };

  useEffect(() => {
    if (shake) {
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [shake]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-sm">
        {/* Logo/Brand */}
        <div className="text-center mb-10 animate-in fade-in zoom-in duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-500/20 mb-6 transform rotate-3">
            <span className="text-4xl">✍️</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2 tracking-tight">{t('app_title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            {isRegistering ? t('begin_journey') : t('welcome_back')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 animate-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-backwards">
          <div className={`space-y-4 transition-transform duration-100 ${shake ? 'translate-x-[-5px]' : ''} ${shake ? 'translate-x-[5px]' : ''}`}>
             
             {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">
                {t('email_address')}
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Icons.Mail size={20} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                  placeholder="hello@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">
                {t('password')}
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Icons.Lock size={20} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-xs px-1 animate-in slide-in-from-top-1">
              <Icons.X size={14} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 mt-4"
          >
            {isRegistering ? t('create_account') : t('sign_in')}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center animate-in fade-in duration-700 delay-300 fill-mode-backwards">
           {!isRegistering && (
             <button 
               onClick={() => {
                 alert(t('forgot_alert'));
               }}
               className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
             >
               {t('forgot_password')}
             </button>
           )}
        </div>
      </div>
    </div>
  );
};