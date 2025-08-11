// Enhanced Team System Types

export type AccountType = 'basic' | 'premium' | 'enterprise';
export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'expired';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface EnhancedProfile {
  id: string;
  display_name?: string;
  avatar_url?: string;
  account_type: AccountType;
  max_teams: number;
  is_admin: boolean;
  notification_settings: {
    floating_teams: boolean;
    sound: boolean;
    desktop: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface EnhancedTeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'admin' | 'member';
  is_owner: boolean;
  invited_by?: string;
  invited_at?: string;
  joined_at: string;
  user?: {
    display_name?: string;
    avatar_url?: string;
    account_type: AccountType;
  };
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  inviter_id: string;
  invitee_email: string;
  invitee_id?: string;
  status: InvitationStatus;
  message?: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  team?: {
    name: string;
    description?: string;
    avatar_url?: string;
  };
  inviter?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export interface TeamJoinRequest {
  id: string;
  team_id: string;
  requester_id: string;
  status: RequestStatus;
  message?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  team?: {
    name: string;
    description?: string;
    avatar_url?: string;
  };
  requester?: {
    display_name?: string;
    avatar_url?: string;
    account_type: AccountType;
  };
  reviewer?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export interface FloatingNotification {
  id: string;
  user_id: string;
  team_id?: string;
  message_id?: string;
  type: 'team_message' | 'team_invite' | 'team_request' | 'account_upgrade' | 'system';
  title: string;
  content: string;
  avatar_url?: string;
  is_read: boolean;
  is_dismissed: boolean;
  priority: 1 | 2 | 3 | 4; // 1=low, 2=normal, 3=high, 4=urgent
  metadata: Record<string, any>;
  expires_at?: string;
  created_at: string;
}

export interface AccountUpgradeRequest {
  id: string;
  user_id: string;
  requested_type: AccountType;
  current_type: AccountType;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  user?: {
    display_name?: string;
    avatar_url?: string;
    email?: string;
  };
  reviewer?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export interface EnhancedTeam {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  member_count: number;
  owner: EnhancedTeamMember;
  members: EnhancedTeamMember[];
  user_role?: 'admin' | 'member';
  is_owner: boolean;
  pending_invitations: number;
  pending_requests: number;
}

export interface TeamSettings {
  allow_join_requests: boolean;
  require_approval: boolean;
  max_members: number;
  default_role: 'admin' | 'member';
  notification_settings: {
    new_members: boolean;
    new_messages: boolean;
    mentions: boolean;
  };
}

export interface TeamStats {
  total_messages: number;
  active_members: number;
  recent_activity: Array<{
    type: 'message' | 'join' | 'leave';
    user: string;
    timestamp: string;
  }>;
}

// Account type configurations
export const ACCOUNT_LIMITS = {
  basic: {
    max_teams: 5,
    max_team_members: 10,
    features: ['basic_chat', 'file_sharing'],
    name: 'Cơ bản',
    description: 'Dành cho cá nhân và nhóm nhỏ'
  },
  premium: {
    max_teams: 15,
    max_team_members: 50,
    features: ['basic_chat', 'file_sharing', 'video_calls', 'advanced_admin'],
    name: 'Cao cấp',
    description: 'Dành cho team chuyên nghiệp'
  },
  enterprise: {
    max_teams: 50,
    max_team_members: 200,
    features: ['basic_chat', 'file_sharing', 'video_calls', 'advanced_admin', 'analytics', 'api_access'],
    name: 'Doanh nghiệp',
    description: 'Dành cho tổ chức lớn'
  }
} as const;

export const NOTIFICATION_PRIORITIES = {
  1: { name: 'Thấp', color: 'text-gray-500', bg: 'bg-gray-100' },
  2: { name: 'Bình thường', color: 'text-blue-500', bg: 'bg-blue-100' },
  3: { name: 'Cao', color: 'text-orange-500', bg: 'bg-orange-100' },
  4: { name: 'Khẩn cấp', color: 'text-red-500', bg: 'bg-red-100' }
} as const;
