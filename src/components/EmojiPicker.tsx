import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Search, Smile } from 'lucide-react';

// Comprehensive emoji data organized by categories
const EMOJI_CATEGORIES = {
  recent: {
    name: 'Gần đây',
    icon: '🕐',
    emojis: ['😀', '😂', '❤️', '👍', '👎', '😍', '😢', '😮', '😡', '🎉']
  },
  smileys: {
    name: 'Mặt cười',
    icon: '😀',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
      '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
      '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫',
      '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬',
      '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮'
    ]
  },
  hearts: {
    name: 'Trái tim',
    icon: '❤️',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️'
    ]
  },
  gestures: {
    name: 'Cử chỉ',
    icon: '👍',
    emojis: [
      '👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙',
      '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋',
      '🖖', '👏', '🙌', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿'
    ]
  },
  objects: {
    name: 'Đồ vật',
    icon: '🎉',
    emojis: [
      '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '⭐', '🌟',
      '💯', '🔥', '💫', '✨', '⚡', '💥', '💢', '💦', '💨', '🌈'
    ]
  },
  animals: {
    name: 'Động vật',
    icon: '🐶',
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
      '🦁', '🐮', '🐷', '��', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒'
    ]
  },
  food: {
    name: 'Đồ ăn',
    icon: '🍕',
    emojis: [
      '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑',
      '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥒', '🌶️',
      '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🍞', '🥖', '🥨',
      '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖',
      '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🌮', '🌯', '🥗', '🥘'
    ]
  },
  travel: {
    name: 'Du lịch',
    icon: '✈️',
    emojis: [
      '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
      '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛹', '🚁', '✈️',
      '🛩️', '🛥️', '🚤', '⛵', '🛳️', '⚓', '🚀', '🛸', '🎢', '🎡'
    ]
  }
};

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  trigger?: React.ReactNode;
  className?: string;
}

export const EmojiPicker = ({ onEmojiSelect, trigger, className }: EmojiPickerProps) => {
  const [selectedCategory, setSelectedCategory] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Filter emojis based on search query
  const getFilteredEmojis = (categoryEmojis: string[]) => {
    if (!searchQuery) return categoryEmojis;
    return categoryEmojis.filter(emoji => {
      // You would typically have emoji names/descriptions to search through
      // For simplicity, we'll just return all emojis when searching
      return true;
    });
  };

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setIsOpen(false);
    
    // Add to recent emojis
    const recentEmojis = EMOJI_CATEGORIES.recent.emojis;
    if (!recentEmojis.includes(emoji)) {
      recentEmojis.unshift(emoji);
      if (recentEmojis.length > 10) {
        recentEmojis.pop();
      }
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className={className}>
            <Smile className="h-4 w-4" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="border-b p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm emoji..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8"
            />
          </div>
        </div>

        <div className="flex">
          {/* Category Sidebar */}
          <div className="w-12 border-r bg-muted/30 flex flex-col">
            {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
              <Button
                key={key}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-10 w-10 p-0 rounded-none",
                  selectedCategory === key && "bg-accent"
                )}
                onClick={() => setSelectedCategory(key)}
                title={category.name}
              >
                <span className="text-lg">{category.icon}</span>
              </Button>
            ))}
          </div>

          {/* Emoji Grid */}
          <div className="flex-1">
            <ScrollArea className="h-64">
              <div className="p-3">
                <div className="grid grid-cols-8 gap-1">
                  {getFilteredEmojis(EMOJI_CATEGORIES[selectedCategory].emojis).map((emoji, index) => (
                    <Button
                      key={`${emoji}-${index}`}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-accent text-lg"
                      onClick={() => handleEmojiClick(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Quick Reactions */}
        <div className="border-t p-2">
          <div className="text-xs text-muted-foreground mb-1">Nhanh</div>
          <div className="flex gap-1">
            {['👍', '❤️', '😂', '😮', '😢', '😡'].map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-lg hover:bg-accent"
                onClick={() => handleEmojiClick(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
