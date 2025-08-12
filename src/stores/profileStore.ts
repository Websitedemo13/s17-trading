import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  role?: 'user' | 'admin' | 'premium';
  account_type?: 'free' | 'premium' | 'enterprise';
  email?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  location?: string;
  birth_date?: string;
  company?: string;
  website?: string;
  github_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  notification_email?: boolean;
  notification_push?: boolean;
  notification_sms?: boolean;
  theme_preference?: 'light' | 'dark' | 'system';
  language?: string;
  timezone?: string;
  currency?: string;
  privacy_profile?: 'public' | 'private' | 'friends';
  privacy_portfolio?: boolean;
  privacy_activity?: boolean;
  two_factor_enabled?: boolean;
  email_verified?: boolean;
  totp_secret?: string;
  backup_codes?: string[];
  last_login_at?: string;
  password_changed_at?: string;
  created_at?: string;
  updated_at?: string;
}

interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  activity_data: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

interface UserSession {
  id: string;
  user_id: string;
  device_info: string;
  ip_address: string;
  last_active: string;
  created_at: string;
}

interface SecuritySettings {
  password_changed_at?: string;
  failed_login_attempts?: number;
  account_locked_until?: string;
  backup_codes?: string[];
  recovery_email?: string;
}

interface ProfileStore {
  profile: UserProfile | null;
  activities: UserActivity[];
  sessions: UserSession[];
  securitySettings: SecuritySettings | null;
  loading: boolean;
  error: string | null;

  // Profile Management
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (userId: string, updates: Partial<UserProfile>) => Promise<boolean>;
  uploadAvatar: (userId: string, file: File) => Promise<string | null>;
  deleteAvatar: (userId: string) => Promise<boolean>;

  // Security Management
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  enableTwoFactor: (userId: string) => Promise<{ secret: string; qrCode: string } | null>;
  disableTwoFactor: (userId: string, token: string) => Promise<boolean>;
  verifyTwoFactor: (token: string) => Promise<boolean>;
  generateBackupCodes: (userId: string) => Promise<string[]>;

  // Activity & Sessions
  fetchUserActivities: (userId: string, limit?: number) => Promise<void>;
  fetchUserSessions: (userId: string) => Promise<void>;
  logActivity: (userId: string, activityType: string, activityData: any) => Promise<void>;
  revokeSession: (sessionId: string) => Promise<boolean>;
  revokeAllSessions: (userId: string, currentSessionId?: string) => Promise<boolean>;

  // Privacy & Settings
  updatePrivacySettings: (userId: string, settings: Partial<UserProfile>) => Promise<boolean>;
  updateNotificationSettings: (userId: string, settings: Partial<UserProfile>) => Promise<boolean>;
  updateAppearanceSettings: (userId: string, settings: Partial<UserProfile>) => Promise<boolean>;

  // Data Management
  exportUserData: (userId: string) => Promise<any>;
  deleteAccount: (userId: string, confirmation: string) => Promise<boolean>;

  // Utils
  clearError: () => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,
  activities: [],
  sessions: [],
  securitySettings: null,
  loading: false,
  error: null,

  fetchProfile: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      set({ profile: data, loading: false });
      
      // Log activity
      if (data) {
        get().logActivity(userId, 'profile_viewed', { timestamp: new Date().toISOString() });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, loading: false });
      console.error('Error fetching profile:', error);
    }
  },

  updateProfile: async (userId: string, updates: Partial<UserProfile>) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...updates,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Fetch updated profile
      await get().fetchProfile(userId);
      
      // Log activity
      await get().logActivity(userId, 'profile_updated', { 
        fields: Object.keys(updates),
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Thành công",
        description: "Cập nhật hồ sơ thành công!"
      });

      set({ loading: false });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, loading: false });
      
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật hồ sơ",
        variant: "destructive"
      });
      
      console.error('Error updating profile:', error);
      return false;
    }
  },

  uploadAvatar: async (userId: string, file: File) => {
    set({ loading: true, error: null });
    try {
      // Validate file
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Kích thước file phải nhỏ hơn 2MB');
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Chỉ hỗ trợ file ảnh (JPEG, PNG, GIF, WebP)');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile
      const success = await get().updateProfile(userId, { avatar_url: data.publicUrl });
      
      if (success) {
        await get().logActivity(userId, 'avatar_updated', { 
          filename: fileName,
          timestamp: new Date().toISOString()
        });

        set({ loading: false });
        return data.publicUrl;
      }

      throw new Error('Không thể cập nhật URL avatar');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, loading: false });
      
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive"
      });
      
      console.error('Error uploading avatar:', error);
      return null;
    }
  },

  deleteAvatar: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { profile } = get();
      if (!profile?.avatar_url) {
        set({ loading: false });
        return true;
      }

      // Extract filename from URL
      const url = new URL(profile.avatar_url);
      const fileName = url.pathname.split('/').slice(-2).join('/');

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([fileName]);

      if (deleteError) {
        console.warn('Error deleting avatar file:', deleteError);
      }

      // Update profile
      const success = await get().updateProfile(userId, { avatar_url: null });
      
      if (success) {
        await get().logActivity(userId, 'avatar_deleted', { 
          timestamp: new Date().toISOString()
        });
      }

      set({ loading: false });
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, loading: false });
      
      toast({
        title: "Lỗi",
        description: "Không thể xóa ảnh đại diện",
        variant: "destructive"
      });
      
      console.error('Error deleting avatar:', error);
      return false;
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    set({ loading: true, error: null });
    try {
      // Validate password strength
      if (newPassword.length < 8) {
        throw new Error('Mật khẩu phải có ít nhất 8 ký tự');
      }

      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
        throw new Error('Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số');
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      // Log activity
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await get().logActivity(user.id, 'password_changed', { 
          timestamp: new Date().toISOString()
        });
      }

      toast({
        title: "Thành công",
        description: "Đổi mật khẩu thành công!"
      });

      set({ loading: false });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, loading: false });
      
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive"
      });
      
      console.error('Error changing password:', error);
      return false;
    }
  },

  enableTwoFactor: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      // Generate TOTP secret
      const secret = generateTOTPSecret();
      const qrCode = generateQRCode(userId, secret);

      // Update profile with 2FA enabled
      const success = await get().updateProfile(userId, { 
        two_factor_enabled: true 
      });

      if (success) {
        await get().logActivity(userId, '2fa_enabled', { 
          timestamp: new Date().toISOString()
        });

        set({ loading: false });
        return { secret, qrCode };
      }

      throw new Error('Không thể kích hoạt 2FA');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, loading: false });
      
      toast({
        title: "Lỗi",
        description: "Không thể kích hoạt xác thực hai yếu tố",
        variant: "destructive"
      });
      
      console.error('Error enabling 2FA:', error);
      return null;
    }
  },

  disableTwoFactor: async (userId: string, token: string) => {
    set({ loading: true, error: null });
    try {
      // Verify token before disabling
      const isValid = await get().verifyTwoFactor(token);
      if (!isValid) {
        throw new Error('Mã xác th���c không hợp lệ');
      }

      // Update profile
      const success = await get().updateProfile(userId, { 
        two_factor_enabled: false 
      });

      if (success) {
        await get().logActivity(userId, '2fa_disabled', { 
          timestamp: new Date().toISOString()
        });
      }

      set({ loading: false });
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, loading: false });
      
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive"
      });
      
      console.error('Error disabling 2FA:', error);
      return false;
    }
  },

  verifyTwoFactor: async (token: string) => {
    try {
      // Mock verification for demo
      // In real implementation, verify against TOTP secret
      return token.length === 6 && /^\d+$/.test(token);
    } catch (error) {
      console.error('Error verifying 2FA token:', error);
      return false;
    }
  },

  generateBackupCodes: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      // Generate 10 backup codes
      const codes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 10).toUpperCase()
      );

      // Store in security settings
      // In real implementation, encrypt these codes
      
      await get().logActivity(userId, 'backup_codes_generated', { 
        count: codes.length,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Thành công",
        description: "Đã tạo mã dự phòng mới"
      });

      set({ loading: false });
      return codes;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, loading: false });
      
      console.error('Error generating backup codes:', error);
      return [];
    }
  },

  fetchUserActivities: async (userId: string, limit = 50) => {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      set({ activities: data || [] });
    } catch (error) {
      console.error('Error fetching user activities:', error);
    }
  },

  fetchUserSessions: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('last_active', { ascending: false });

      if (error) throw error;

      set({ sessions: data || [] });
    } catch (error) {
      console.error('Error fetching user sessions:', error);
    }
  },

  logActivity: async (userId: string, activityType: string, activityData: any) => {
    try {
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: activityType,
          activity_data: activityData,
          ip_address: await getUserIP(),
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.warn('Error logging activity:', error);
      }
    } catch (error) {
      console.warn('Error logging activity:', error);
    }
  },

  revokeSession: async (sessionId: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      // Update sessions list
      const { sessions } = get();
      set({ 
        sessions: sessions.filter(s => s.id !== sessionId),
        loading: false 
      });

      toast({
        title: "Thành công",
        description: "Đã thu hồi phiên đăng nhập"
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, loading: false });
      
      toast({
        title: "Lỗi",
        description: "Không thể thu hồi phiên đăng nhập",
        variant: "destructive"
      });
      
      console.error('Error revoking session:', error);
      return false;
    }
  },

  revokeAllSessions: async (userId: string, currentSessionId?: string) => {
    set({ loading: true, error: null });
    try {
      let query = supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', userId);

      if (currentSessionId) {
        query = query.neq('id', currentSessionId);
      }

      const { error } = await query;

      if (error) throw error;

      // Update sessions list
      const { sessions } = get();
      set({ 
        sessions: currentSessionId 
          ? sessions.filter(s => s.id === currentSessionId)
          : [],
        loading: false 
      });

      await get().logActivity(userId, 'all_sessions_revoked', { 
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Thành công",
        description: "Đã thu hồi tất cả phiên đăng nhập"
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, loading: false });
      
      toast({
        title: "Lỗi",
        description: "Không thể thu hồi phiên đăng nhập",
        variant: "destructive"
      });
      
      console.error('Error revoking all sessions:', error);
      return false;
    }
  },

  updatePrivacySettings: async (userId: string, settings: Partial<UserProfile>) => {
    const success = await get().updateProfile(userId, settings);
    
    if (success) {
      await get().logActivity(userId, 'privacy_settings_updated', { 
        settings: Object.keys(settings),
        timestamp: new Date().toISOString()
      });
    }

    return success;
  },

  updateNotificationSettings: async (userId: string, settings: Partial<UserProfile>) => {
    const success = await get().updateProfile(userId, settings);
    
    if (success) {
      await get().logActivity(userId, 'notification_settings_updated', { 
        settings: Object.keys(settings),
        timestamp: new Date().toISOString()
      });
    }

    return success;
  },

  updateAppearanceSettings: async (userId: string, settings: Partial<UserProfile>) => {
    const success = await get().updateProfile(userId, settings);
    
    if (success) {
      await get().logActivity(userId, 'appearance_settings_updated', { 
        settings: Object.keys(settings),
        timestamp: new Date().toISOString()
      });

      // Apply theme immediately
      if (settings.theme_preference) {
        applyTheme(settings.theme_preference);
      }
    }

    return success;
  },

  exportUserData: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      // Fetch all user data
      const [profileData, portfolioData, activitiesData] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('portfolios').select('*').eq('user_id', userId),
        supabase.from('user_activities').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1000)
      ]);

      const exportData = {
        profile: profileData.data,
        portfolio: portfolioData.data || [],
        activities: activitiesData.data || [],
        exported_at: new Date().toISOString(),
        export_version: '1.0'
      };

      await get().logActivity(userId, 'data_exported', { 
        timestamp: new Date().toISOString()
      });

      set({ loading: false });
      return exportData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, loading: false });
      
      toast({
        title: "Lỗi",
        description: "Không thể xuất dữ liệu",
        variant: "destructive"
      });
      
      console.error('Error exporting user data:', error);
      return null;
    }
  },

  deleteAccount: async (userId: string, confirmation: string) => {
    if (confirmation !== 'DELETE') {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập 'DELETE' để xác nhận",
        variant: "destructive"
      });
      return false;
    }

    set({ loading: true, error: null });
    try {
      // Log final activity
      await get().logActivity(userId, 'account_deletion_initiated', { 
        timestamp: new Date().toISOString()
      });

      // Delete user data in order
      await supabase.from('user_activities').delete().eq('user_id', userId);
      await supabase.from('user_sessions').delete().eq('user_id', userId);
      await supabase.from('portfolios').delete().eq('user_id', userId);
      await supabase.from('profiles').delete().eq('id', userId);

      // Delete avatar files
      const { data: avatarFiles } = await supabase.storage
        .from('avatars')
        .list(userId);

      if (avatarFiles && avatarFiles.length > 0) {
        const filePaths = avatarFiles.map(file => `${userId}/${file.name}`);
        await supabase.storage.from('avatars').remove(filePaths);
      }

      toast({
        title: "Thành công",
        description: "Tài khoản đã được xóa hoàn toàn"
      });

      set({ loading: false });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, loading: false });
      
      toast({
        title: "Lỗi",
        description: "Không thể xóa tài khoản",
        variant: "destructive"
      });
      
      console.error('Error deleting account:', error);
      return false;
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set({
    profile: null,
    activities: [],
    sessions: [],
    securitySettings: null,
    loading: false,
    error: null
  })
}));

// Utility functions

const generateTOTPSecret = (): string => {
  // Generate a random 32-character base32 string
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const generateQRCode = (userId: string, secret: string): string => {
  // Generate QR code URL for authenticator apps
  const issuer = 'CryptoInvest';
  const accountName = userId;
  const otpauthUrl = `otpauth://totp/${issuer}:${accountName}?secret=${secret}&issuer=${issuer}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;
};

const getUserIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'Unknown';
  }
};

const applyTheme = (theme: 'light' | 'dark' | 'system') => {
  const root = document.documentElement;
  
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.classList.toggle('dark', systemTheme === 'dark');
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
  
  localStorage.setItem('theme', theme);
};

export type { UserProfile, UserActivity, UserSession, SecuritySettings };
