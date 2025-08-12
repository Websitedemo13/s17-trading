export interface User {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
  role?: 'admin' | 'member';
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  user?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export interface ChatMessage {
  id: string;
  team_id: string;
  user_id: string;
  content: string;
  created_at: string;
  message_type?: 'text' | 'file' | 'image' | 'system';
  reply_to?: string;
  edited_at?: string;
  is_pinned?: boolean;
  metadata?: Record<string, any>;
  user?: {
    display_name?: string;
    avatar_url?: string;
  };
  reactions?: MessageReaction[];
  attachments?: MessageAttachment[];
  read_receipts?: MessageReadReceipt[];
  reply_message?: ChatMessage;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  mime_type?: string;
  created_at: string;
}

export interface TypingIndicator {
  id: string;
  team_id: string;
  user_id: string;
  is_typing: boolean;
  updated_at: string;
  user?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export interface UserPresence {
  id: string;
  user_id: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  last_seen: string;
  updated_at: string;
}

export interface MessageReadReceipt {
  id: string;
  message_id: string;
  user_id: string;
  read_at: string;
  user?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export interface Portfolio {
  id: string;
  user_id: string;
  symbol: string;
  amount: number;
  avg_price: number;
  created_at: string;
  updated_at: string;
}

export interface AIInsight {
  id: string;
  user_id: string;
  insight_type: string;
  content: any;
  created_at: string;
}

export interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
}

export interface MarketStats {
  market_cap: number;
  volume_24h: number;
  btc_dominance: number;
  market_cap_change_24h: number;
  volume_change_24h: number;
}
