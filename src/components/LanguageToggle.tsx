import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { 
  Globe, 
  Check, 
  ChevronDown, 
  Languages,
  Loader2 
} from 'lucide-react';
import { useLanguage } from '@/stores/i18nStore';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/i18n';
import { cn } from '@/lib/utils';

interface LanguageToggleProps {
  compact?: boolean;
  showLabel?: boolean;
  className?: string;
}

export const LanguageToggle = ({ 
  compact = false, 
  showLabel = true,
  className 
}: LanguageToggleProps) => {
  const { currentLanguage, setLanguage, isLoading, availableLanguages } = useLanguage();
  const [open, setOpen] = useState(false);
  
  const currentConfig = SUPPORTED_LANGUAGES[currentLanguage];

  const handleLanguageChange = async (language: SupportedLanguage) => {
    if (language === currentLanguage) return;
    
    try {
      await setLanguage(language);
      setOpen(false);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  if (compact) {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("w-9 h-9 p-0", className)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="text-base">{currentConfig.flag}</span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            Choose Language
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableLanguages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{lang.flag}</span>
                <div>
                  <div className="font-medium">{lang.nativeName}</div>
                  <div className="text-xs text-muted-foreground">{lang.name}</div>
                </div>
              </div>
              {currentLanguage === lang.code && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn("gap-2", className)}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span className="text-base">{currentConfig.flag}</span>
              {showLabel && (
                <>
                  <span className="hidden sm:inline font-medium">
                    {currentConfig.nativeName}
                  </span>
                  <span className="sm:hidden font-medium">
                    {currentConfig.code.toUpperCase()}
                  </span>
                </>
              )}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2 py-3">
          <Globe className="h-4 w-4" />
          <span>Select Language</span>
          <Badge variant="secondary" className="ml-auto text-xs">
            {availableLanguages.length}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="max-h-64 overflow-y-auto">
          {availableLanguages.map((lang) => {
            const isSelected = currentLanguage === lang.code;
            const isComingSoon = !['vi', 'en'].includes(lang.code);
            
            return (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => !isComingSoon && handleLanguageChange(lang.code)}
                className={cn(
                  "flex items-center justify-between py-3 px-3",
                  isSelected && "bg-accent",
                  isComingSoon && "opacity-50 cursor-not-allowed"
                )}
                disabled={isComingSoon}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{lang.flag}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{lang.nativeName}</span>
                      {isComingSoon && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          Soon
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{lang.name}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </DropdownMenuItem>
            );
          })}
        </div>
        
        <DropdownMenuSeparator />
        <div className="p-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            More languages coming soon
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageToggle;
