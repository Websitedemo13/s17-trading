import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  Globe, 
  Languages, 
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react';

interface LanguageToggleProps {
  className?: string;
  compact?: boolean;
}

type Language = 'vi' | 'en';

interface TranslationStatus {
  isTranslating: boolean;
  currentLanguage: Language;
  originalLanguage: Language;
}

export const LanguageToggle = ({ className, compact = false }: LanguageToggleProps) => {
  const [translationStatus, setTranslationStatus] = useState<TranslationStatus>({
    isTranslating: false,
    currentLanguage: 'vi', // Default to Vietnamese
    originalLanguage: 'vi'
  });

  // Detect browser language on mount
  useEffect(() => {
    const detectLanguage = (): Language => {
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('vi')) return 'vi';
      if (browserLang.startsWith('en')) return 'en';
      return 'vi'; // Default to Vietnamese
    };

    const detected = detectLanguage();
    setTranslationStatus(prev => ({
      ...prev,
      currentLanguage: detected,
      originalLanguage: detected
    }));
  }, []);

  // Translation functions
  const translatePage = async (targetLanguage: Language) => {
    if (translationStatus.isTranslating) return;
    if (translationStatus.currentLanguage === targetLanguage) return;

    setTranslationStatus(prev => ({
      ...prev,
      isTranslating: true
    }));

    try {
      // Check if Google Translate is available
      if (typeof window !== 'undefined') {
        // Try to use Google Translate API if available
        const googleTranslateElement = document.getElementById('google_translate_element');
        
        if (!googleTranslateElement) {
          // Load Google Translate script dynamically
          await loadGoogleTranslate(targetLanguage);
        } else {
          // Use existing Google Translate
          triggerGoogleTranslate(targetLanguage);
        }
      } else {
        // Fallback: Manual translation for key elements
        await manualTranslation(targetLanguage);
      }

      setTranslationStatus(prev => ({
        ...prev,
        currentLanguage: targetLanguage,
        isTranslating: false
      }));

      toast({
        title: targetLanguage === 'vi' ? 'Đã chuyển sang tiếng Việt' : 'Switched to English',
        description: targetLanguage === 'vi' 
          ? 'Trang web đã được dịch sang tiếng Việt' 
          : 'Website has been translated to English',
        duration: 3000
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      console.error('Translation error:', {
        message: errorMessage,
        error
      });
      setTranslationStatus(prev => ({
        ...prev,
        isTranslating: false
      }));

      toast({
        title: "Lỗi dịch",
        description: "Không thể dịch trang. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    }
  };

  const loadGoogleTranslate = async (targetLanguage: Language): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        // Create Google Translate script
        const script = document.createElement('script');
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;

        // Initialize Google Translate
        (window as any).googleTranslateElementInit = () => {
          new (window as any).google.translate.TranslateElement({
            pageLanguage: translationStatus.originalLanguage,
            includedLanguages: 'vi,en',
            layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
            multilanguagePage: true
          }, 'google_translate_element');

          // Auto-trigger translation
          setTimeout(() => {
            triggerGoogleTranslate(targetLanguage);
            resolve();
          }, 1000);
        };

        script.onerror = () => {
          reject(new Error('Failed to load Google Translate'));
        };

        // Add hidden element for Google Translate
        if (!document.getElementById('google_translate_element')) {
          const div = document.createElement('div');
          div.id = 'google_translate_element';
          div.style.display = 'none';
          document.body.appendChild(div);
        }

        document.head.appendChild(script);
      } catch (error) {
        reject(error);
      }
    });
  };

  const triggerGoogleTranslate = (targetLanguage: Language) => {
    try {
      const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (selectElement) {
        const languageCode = targetLanguage === 'vi' ? 'vi' : 'en';
        selectElement.value = languageCode;
        selectElement.dispatchEvent(new Event('change'));
      }
    } catch (error) {
      console.warn('Could not trigger Google Translate:', error);
      // Fallback to manual translation
      manualTranslation(targetLanguage);
    }
  };

  const manualTranslation = async (targetLanguage: Language) => {
    // Simple manual translation for key UI elements
    const translations = {
      vi: {
        'Dashboard': 'Bảng điều khiển',
        'Markets': 'Thị trường',
        'Teams': 'Nhóm',
        'Chat': 'Trò chuyện',
        'Blog': 'Blog',
        'AI Chat': 'AI Chat',
        'Settings': 'Cài đặt',
        'Profile': 'Hồ sơ',
        'Login': 'Đăng nhập',
        'Register': 'Đăng ký',
        'Logout': 'Đăng xuất',
        'Search': 'Tìm kiếm',
        'Loading': 'Đang tải',
        'Save': 'Lưu',
        'Cancel': 'Hủy',
        'Delete': 'Xóa',
        'Edit': 'Chỉnh sửa',
        'Create': 'Tạo',
        'Update': 'Cập nhật'
      },
      en: {
        'Bảng điều khiển': 'Dashboard',
        'Thị trường': 'Markets',
        'Nhóm': 'Teams',
        'Trò chuyện': 'Chat',
        'Blog': 'Blog',
        'AI Chat': 'AI Chat',
        'Cài đặt': 'Settings',
        'Hồ sơ': 'Profile',
        'Đăng nhập': 'Login',
        'Đăng ký': 'Register',
        'Đăng xuất': 'Logout',
        'Tìm kiếm': 'Search',
        'Đang tải': 'Loading',
        'Lưu': 'Save',
        'Hủy': 'Cancel',
        'Xóa': 'Delete',
        'Chỉnh sửa': 'Edit',
        'Tạo': 'Create',
        'Cập nhật': 'Update'
      }
    };

    const targetTranslations = translations[targetLanguage];
    
    // Find and translate text nodes
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );

    const textNodes: Text[] = [];
    let node;

    while (node = walker.nextNode()) {
      const textNode = node as Text;
      if (textNode.nodeValue && textNode.nodeValue.trim()) {
        textNodes.push(textNode);
      }
    }

    // Apply translations
    textNodes.forEach(textNode => {
      const originalText = textNode.nodeValue?.trim();
      if (originalText && targetTranslations[originalText]) {
        textNode.nodeValue = textNode.nodeValue!.replace(
          originalText,
          targetTranslations[originalText]
        );
      }
    });
  };

  const resetToOriginal = async () => {
    if (translationStatus.isTranslating) return;

    setTranslationStatus(prev => ({
      ...prev,
      isTranslating: true
    }));

    try {
      // Reload page to reset translations
      window.location.reload();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      console.error('Reset error:', {
        message: errorMessage,
        error
      });
      setTranslationStatus(prev => ({
        ...prev,
        isTranslating: false
      }));
    }
  };

  const getLanguageName = (lang: Language) => {
    return lang === 'vi' ? 'Tiếng Việt' : 'English';
  };

  const getLanguageFlag = (lang: Language) => {
    return lang === 'vi' ? '🇻🇳' : '🇺🇸';
  };

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => translatePage(translationStatus.currentLanguage === 'vi' ? 'en' : 'vi')}
        disabled={translationStatus.isTranslating}
        className={cn("h-8 w-8 p-0", className)}
        title={`Chuyển sang ${translationStatus.currentLanguage === 'vi' ? 'English' : 'Tiếng Việt'}`}
      >
        {translationStatus.isTranslating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <span className="text-sm">
            {getLanguageFlag(translationStatus.currentLanguage === 'vi' ? 'en' : 'vi')}
          </span>
        )}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={translationStatus.isTranslating}
          className={cn("h-9 px-3", className)}
        >
          {translationStatus.isTranslating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <>
              <Globe className="h-4 w-4 mr-2" />
              <span className="mr-1">{getLanguageFlag(translationStatus.currentLanguage)}</span>
            </>
          )}
          <span className="hidden sm:inline">
            {getLanguageName(translationStatus.currentLanguage)}
          </span>
          <span className="sm:hidden">
            {translationStatus.currentLanguage.toUpperCase()}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
          Chọn ngôn ngữ / Select Language
        </div>
        
        <DropdownMenuItem
          onClick={() => translatePage('vi')}
          disabled={translationStatus.isTranslating}
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            <span className="mr-2">🇻🇳</span>
            <span>Tiếng Việt</span>
          </div>
          {translationStatus.currentLanguage === 'vi' && (
            <Check className="h-4 w-4 text-primary" />
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => translatePage('en')}
          disabled={translationStatus.isTranslating}
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            <span className="mr-2">🇺🇸</span>
            <span>English</span>
          </div>
          {translationStatus.currentLanguage === 'en' && (
            <Check className="h-4 w-4 text-primary" />
          )}
        </DropdownMenuItem>

        {translationStatus.currentLanguage !== translationStatus.originalLanguage && (
          <>
            <div className="my-1 h-px bg-border" />
            <DropdownMenuItem
              onClick={resetToOriginal}
              disabled={translationStatus.isTranslating}
              className="flex items-center text-muted-foreground"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>Khôi phục gốc / Reset</span>
            </DropdownMenuItem>
          </>
        )}

        <div className="px-2 py-1.5 border-t mt-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <Languages className="h-3 w-3 mr-1" />
              Powered by Google Translate
            </Badge>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageToggle;
