import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Language = 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<string, Record<Language, string>> = {
  // General / Navigation
  'back': { en: 'Back', zh: '返回' },
  'done': { en: 'Done', zh: '完成' },
  'cancel': { en: 'Cancel', zh: '取消' },
  'save': { en: 'Save', zh: '保存' },
  'delete': { en: 'Delete', zh: '删除' },
  'loading': { en: 'Loading...', zh: '加载中...' },
  'close': { en: 'Close', zh: '关闭' },
  'today': { en: 'Today', zh: '今天' },
  
  // App Titles & Headers
  'app_title': { en: 'TriLog', zh: '三省日记' },
  'victory_title': { en: 'A Little Victory', zh: '一点小胜利' },
  'anxiety_title': { en: 'A Little Anxiety', zh: '一点小焦虑' },
  'gratitude_title': { en: 'A Little Gratitude', zh: '一点小感恩' },
  
  // Status Labels
  'recorded': { en: 'RECORDED', zh: '已记录' },
  'achieved': { en: 'ACHIEVED', zh: '已达成' },
  'released': { en: 'RELEASED', zh: '已释放' },
  'cherished': { en: 'CHERISHED', zh: '已珍藏' },

  // Placeholders
  'victory_placeholder': { en: "Tap to record a little victory... ✨", zh: "点击记录今天的一点小胜利... ✨" },
  'anxiety_placeholder': { en: "Tap to unload a little anxiety... 🍃", zh: "点击卸下心头的一点小焦虑... 🍃" },
  'gratitude_placeholder': { en: "Tap to share a little gratitude... 💖", zh: "点击记录一点感恩的时刻... 💖" },
  'write_victory': { en: "Write about a little victory here...", zh: "在这里写下你的一点小胜利..." },
  'write_anxiety': { en: "Write about a little anxiety here...", zh: "在这里写下你的一点小焦虑..." },
  'write_gratitude': { en: "Write about a little gratitude here...", zh: "在这里写下你的一点小感恩..." },
  'voice_note': { en: "Voice Note", zh: "语音笔记" },

  // Sidebar
  'menu': { en: 'Menu', zh: '菜单' },
  'account_info': { en: 'Account Info', zh: '账户信息' },
  'security_privacy': { en: 'Security & Privacy', zh: '安全与隐私' },
  'notifications': { en: 'Notifications', zh: '通知提醒' },
  'appearance': { en: 'Appearance', zh: '外观设置' },
  'language': { en: 'Language', zh: '语言设置' },
  'help_support': { en: 'Help & Support', zh: '帮助与支持' },
  'logout': { en: 'Log Out', zh: '退出登录' },
  'free_plan': { en: 'Free Plan', zh: '免费版' },
  'version': { en: 'TriLog v1.1.0', zh: 'TriLog v1.1.0' },

  // Account & Settings
  'email_address': { en: 'Email Address', zh: '邮箱地址' },
  'password': { en: 'Password', zh: '密码' },
  'save_changes': { en: 'Save Changes', zh: '保存修改' },
  'daily_reminder': { en: 'Daily Reminder', zh: '每日提醒' },
  'get_reminded': { en: 'Get reminded to journal', zh: '提醒我记录三件事' },
  'reminder_time': { en: 'Reminder Time', zh: '提醒时间' },
  'reminder_desc': { en: "We'll send you a friendly nudge at this time.", zh: "我们会在这个时间温馨地提醒你。" },
  'dark_mode': { en: 'Dark Mode', zh: '深色模式' },
  'display_language': { en: 'Display Language', zh: '显示语言' },

  // Stats / AI
  'insights': { en: 'Insights', zh: '洞察' },
  'select_range': { en: 'Select Range', zh: '选择时间范围' },
  'from': { en: 'From', zh: '从' },
  'to': { en: 'To', zh: '至' },
  'active_days': { en: 'active days in this period', zh: '天包含记录' },
  'journal_records': { en: 'Journal Records', zh: '日记记录' },
  'ai_summary': { en: 'AI Mindset Summary', zh: 'AI 心境总结' },
  'ai_desc': { en: 'Get a psychological summary of your selected entries.', zh: '获取这段时间心理变化的智能总结。' },
  'generate': { en: 'Generate ✨', zh: '生成 ✨' },
  'analyzing': { en: 'Analyzing insights...', zh: '正在分析心境...' },
  'no_records': { en: 'No records found for this period 🍃', zh: '这段时间没有找到记录 🍃' },
  'tab_victory': { en: 'Victories', zh: '胜利' },
  'tab_anxiety': { en: 'Anxieties', zh: '焦虑' },
  'tab_gratitude': { en: 'Gratitudes', zh: '感恩' },

  // Login
  'welcome_back': { en: 'Welcome back to your safe space.', zh: '欢迎回到你的心灵空间。' },
  'begin_journey': { en: 'Begin your journey of self-reflection.', zh: '开始你的自我反思之旅。' },
  'sign_in': { en: 'Sign In', zh: '登录' },
  'create_account': { en: 'Create Account', zh: '创建账户' },
  'forgot_password': { en: 'Forgot Password?', zh: '忘记密码？' },
  'forgot_alert': { en: "For security in this local-only app, account recovery involves clearing your browser data for this site, which will reset the app.", zh: "为了数据隐私，本应用为本地运行。重置账户需要清除浏览器数据，这将重置应用。" },
  'fill_fields': { en: 'Please fill in all fields', zh: '请填写所有字段' },
  'password_short': { en: 'Password must be at least 4 characters', zh: '密码至少需要4个字符' },
  'invalid_login': { en: 'Invalid email or password', zh: '邮箱或密码错误' },

  // Dialogs
  'delete_confirm': { en: 'Delete this recording?', zh: '确定删除这条录音吗？' },
  'tooltip_complete': { en: 'Complete all 3 entries to light up the day 🌟', zh: '完成三件事，点亮这一天 🌟' },

  // Help & Support
  'welcome_home': { en: 'Welcome Home.', zh: '欢迎回家。' },
  'welcome_desc': { en: "We designed TriLog for anyone who wants to capture their life but feels stuck when staring at a blank page. It’s for the quiet moments when you want to understand yourself better.", zh: "我们设计 TriLog 是为了那些想要记录生活，却在面对空白页时无从下笔的人。它属于那些你想更好地了解自己的静谧时刻。" },
  'rule_of_three': { en: 'The Rule of Three', zh: '三件事原则' },
  'rule_desc': { en: 'We simplified journaling into three meaningful prompts to help you build a habit without the pressure:', zh: '我们将日记简化为三个有意义的提示，助你轻松养成习惯：' },
  'victory_help': { en: 'Acknowledging small wins builds confidence and proves that you are moving forward, step by step.', zh: '记录小胜利能建立自信，证明你正在一步步向前迈进。' },
  'anxiety_help': { en: 'Naming your worries reduces their power over you. Releasing them here clears your mind for rest.', zh: '具象化你的担忧能削弱它们的力量。在这里释放它们，清空思绪，安然入睡。' },
  'gratitude_help': { en: 'Practicing gratitude shifts your perspective from what is missing to what is present, warming your heart.', zh: '练习感恩将视角从缺失转向拥有，温暖内心。' },
  'designed_with_love': { en: 'Designed with ♡', zh: '用心设计 ♡' },

  // Other Messages
  'password_rule_error': { en: "Password must be 6-8 characters long and contain both numbers and letters.", zh: "密码必须是6-8位字符，且包含数字和字母。" },
  'password_rule_hint': { en: "Must be 6-8 characters, combining numbers and letters only.", zh: "必须是6-8位字符，仅包含数字和字母。" },
  'account_saved': { en: "Account details saved successfully.", zh: "账户信息保存成功。" },
  'enable_notifications_alert': { en: "Please enable notifications in your browser settings to use this feature.", zh: "请在浏览器设置中开启通知权限以使用此功能。" },
  'notifications_blocked': { en: "Notifications are blocked. Please enable them in your browser settings.", zh: "通知已被阻止。请在浏览器设置中开启它们。" }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('trilog_lang') as Language) || 'en';
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('trilog_lang', lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};