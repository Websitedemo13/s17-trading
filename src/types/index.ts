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