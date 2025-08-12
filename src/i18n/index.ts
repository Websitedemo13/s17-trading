// Comprehensive multi-language support system

export type SupportedLanguage = 'vi' | 'en' | 'zh' | 'ja' | 'ko' | 'th' | 'id';

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
  dateFormat: string;
  numberFormat: Intl.NumberFormatOptions;
  currencyFormat: Intl.NumberFormatOptions;
}

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
  vi: {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    rtl: false,
    dateFormat: 'dd/MM/yyyy',
    numberFormat: { locale: 'vi-VN' },
    currencyFormat: { style: 'currency', currency: 'VND', locale: 'vi-VN' }
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
    dateFormat: 'MM/dd/yyyy',
    numberFormat: { locale: 'en-US' },
    currencyFormat: { style: 'currency', currency: 'USD', locale: 'en-US' }
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    rtl: false,
    dateFormat: 'yyyy/MM/dd',
    numberFormat: { locale: 'zh-CN' },
    currencyFormat: { style: 'currency', currency: 'CNY', locale: 'zh-CN' }
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    rtl: false,
    dateFormat: 'yyyy/MM/dd',
    numberFormat: { locale: 'ja-JP' },
    currencyFormat: { style: 'currency', currency: 'JPY', locale: 'ja-JP' }
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    rtl: false,
    dateFormat: 'yyyy/MM/dd',
    numberFormat: { locale: 'ko-KR' },
    currencyFormat: { style: 'currency', currency: 'KRW', locale: 'ko-KR' }
  },
  th: {
    code: 'th',
    name: 'Thai',
    nativeName: 'ไทย',
    flag: '🇹🇭',
    rtl: false,
    dateFormat: 'dd/MM/yyyy',
    numberFormat: { locale: 'th-TH' },
    currencyFormat: { style: 'currency', currency: 'THB', locale: 'th-TH' }
  },
  id: {
    code: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    flag: '🇮🇩',
    rtl: false,
    dateFormat: 'dd/MM/yyyy',
    numberFormat: { locale: 'id-ID' },
    currencyFormat: { style: 'currency', currency: 'IDR', locale: 'id-ID' }
  }
};

export const DEFAULT_LANGUAGE: SupportedLanguage = 'vi';

// Get browser language or fallback to default
export const getBrowserLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  
  const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
  return SUPPORTED_LANGUAGES[browserLang] ? browserLang : DEFAULT_LANGUAGE;
};

// Get language from localStorage or browser
export const getStoredLanguage = (): SupportedLanguage => {
  try {
    const stored = localStorage.getItem('language') as SupportedLanguage;
    return SUPPORTED_LANGUAGES[stored] ? stored : getBrowserLanguage();
  } catch {
    return getBrowserLanguage();
  }
};

// Store language preference
export const setStoredLanguage = (language: SupportedLanguage): void => {
  try {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    
    // Update RTL if needed
    const config = SUPPORTED_LANGUAGES[language];
    document.documentElement.dir = config.rtl ? 'rtl' : 'ltr';
  } catch (error) {
    console.warn('Failed to store language preference:', error);
  }
};

// Translation interface
export interface Translations {
  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    update: string;
    confirm: string;
    yes: string;
    no: string;
    ok: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    search: string;
    filter: string;
    sort: string;
    view: string;
    download: string;
    upload: string;
    share: string;
    copy: string;
    refresh: string;
    more: string;
    less: string;
  };

  // Navigation
  nav: {
    dashboard: string;
    markets: string;
    teams: string;
    chat: string;
    blog: string;
    aiChat: string;
    profile: string;
    settings: string;
    admin: string;
    login: string;
    logout: string;
    register: string;
    about: string;
  };

  // Dashboard
  dashboard: {
    title: string;
    overview: string;
    portfolio: string;
    totalValue: string;
    totalGain: string;
    totalLoss: string;
    assets: string;
    recentActivity: string;
    topPerformers: string;
    marketSummary: string;
    news: string;
    quickActions: string;
  };

  // Markets
  markets: {
    title: string;
    price: string;
    change: string;
    volume: string;
    marketCap: string;
    rank: string;
    trending: string;
    gainers: string;
    losers: string;
    watchlist: string;
    addToWatchlist: string;
    removeFromWatchlist: string;
  };

  // Blog
  blog: {
    title: string;
    featured: string;
    trending: string;
    latest: string;
    categories: string;
    readMore: string;
    readTime: string;
    author: string;
    publishedAt: string;
    tags: string;
    relatedPosts: string;
    comments: string;
    like: string;
    share: string;
    bookmark: string;
    saved: string;
  };

  // Profile
  profile: {
    title: string;
    overview: string;
    personalInfo: string;
    security: string;
    notifications: string;
    appearance: string;
    privacy: string;
    activity: string;
    displayName: string;
    email: string;
    phone: string;
    location: string;
    bio: string;
    website: string;
    socialLinks: string;
    changePassword: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    twoFactor: string;
    theme: string;
    language: string;
    currency: string;
    timezone: string;
  };

  // Trading
  trading: {
    buy: string;
    sell: string;
    amount: string;
    price: string;
    total: string;
    balance: string;
    available: string;
    orders: string;
    history: string;
    openOrders: string;
    orderBook: string;
    market: string;
    limit: string;
    stop: string;
    profit: string;
    loss: string;
    leverage: string;
    margin: string;
  };

  // Errors
  errors: {
    general: string;
    network: string;
    unauthorized: string;
    forbidden: string;
    notFound: string;
    serverError: string;
    invalidInput: string;
    required: string;
    tooShort: string;
    tooLong: string;
    invalidEmail: string;
    passwordMismatch: string;
    weakPassword: string;
  };

  // Time
  time: {
    now: string;
    today: string;
    yesterday: string;
    tomorrow: string;
    thisWeek: string;
    lastWeek: string;
    thisMonth: string;
    lastMonth: string;
    thisYear: string;
    lastYear: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
    weeksAgo: string;
    monthsAgo: string;
    yearsAgo: string;
  };
}

// Default English translations
export const defaultTranslations: Translations = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    update: 'Update',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    view: 'View',
    download: 'Download',
    upload: 'Upload',
    share: 'Share',
    copy: 'Copy',
    refresh: 'Refresh',
    more: 'More',
    less: 'Less',
  },
  nav: {
    dashboard: 'Dashboard',
    markets: 'Markets',
    teams: 'Teams',
    chat: 'Chat',
    blog: 'Blog',
    aiChat: 'AI Chat',
    profile: 'Profile',
    settings: 'Settings',
    admin: 'Admin',
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    about: 'About',
  },
  dashboard: {
    title: 'Dashboard',
    overview: 'Overview',
    portfolio: 'Portfolio',
    totalValue: 'Total Value',
    totalGain: 'Total Gain',
    totalLoss: 'Total Loss',
    assets: 'Assets',
    recentActivity: 'Recent Activity',
    topPerformers: 'Top Performers',
    marketSummary: 'Market Summary',
    news: 'News',
    quickActions: 'Quick Actions',
  },
  markets: {
    title: 'Markets',
    price: 'Price',
    change: 'Change',
    volume: 'Volume',
    marketCap: 'Market Cap',
    rank: 'Rank',
    trending: 'Trending',
    gainers: 'Top Gainers',
    losers: 'Top Losers',
    watchlist: 'Watchlist',
    addToWatchlist: 'Add to Watchlist',
    removeFromWatchlist: 'Remove from Watchlist',
  },
  blog: {
    title: 'Blog',
    featured: 'Featured',
    trending: 'Trending',
    latest: 'Latest',
    categories: 'Categories',
    readMore: 'Read More',
    readTime: 'min read',
    author: 'Author',
    publishedAt: 'Published',
    tags: 'Tags',
    relatedPosts: 'Related Posts',
    comments: 'Comments',
    like: 'Like',
    share: 'Share',
    bookmark: 'Bookmark',
    saved: 'Saved',
  },
  profile: {
    title: 'Profile',
    overview: 'Overview',
    personalInfo: 'Personal Information',
    security: 'Security',
    notifications: 'Notifications',
    appearance: 'Appearance',
    privacy: 'Privacy',
    activity: 'Activity',
    displayName: 'Display Name',
    email: 'Email',
    phone: 'Phone',
    location: 'Location',
    bio: 'Bio',
    website: 'Website',
    socialLinks: 'Social Links',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    twoFactor: 'Two-Factor Authentication',
    theme: 'Theme',
    language: 'Language',
    currency: 'Currency',
    timezone: 'Timezone',
  },
  trading: {
    buy: 'Buy',
    sell: 'Sell',
    amount: 'Amount',
    price: 'Price',
    total: 'Total',
    balance: 'Balance',
    available: 'Available',
    orders: 'Orders',
    history: 'History',
    openOrders: 'Open Orders',
    orderBook: 'Order Book',
    market: 'Market',
    limit: 'Limit',
    stop: 'Stop',
    profit: 'Profit',
    loss: 'Loss',
    leverage: 'Leverage',
    margin: 'Margin',
  },
  errors: {
    general: 'An error occurred',
    network: 'Network error',
    unauthorized: 'Unauthorized',
    forbidden: 'Forbidden',
    notFound: 'Not found',
    serverError: 'Server error',
    invalidInput: 'Invalid input',
    required: 'Required field',
    tooShort: 'Too short',
    tooLong: 'Too long',
    invalidEmail: 'Invalid email',
    passwordMismatch: 'Passwords do not match',
    weakPassword: 'Password is too weak',
  },
  time: {
    now: 'Now',
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeek: 'This week',
    lastWeek: 'Last week',
    thisMonth: 'This month',
    lastMonth: 'Last month',
    thisYear: 'This year',
    lastYear: 'Last year',
    minutesAgo: 'minutes ago',
    hoursAgo: 'hours ago',
    daysAgo: 'days ago',
    weeksAgo: 'weeks ago',
    monthsAgo: 'months ago',
    yearsAgo: 'years ago',
  },
};
