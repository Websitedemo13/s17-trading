import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from './authStore';
import {
  EnhancedTeam,
  EnhancedTeamMember,
  TeamInvitation,
  TeamJoinRequest,
  AccountUpgradeRequest,
  EnhancedProfile,
  AccountType,
  TeamSettings
} from '@/types/teams';

interface EnhancedTeamState {
  // Teams data
  teams: EnhancedTeam[];
  currentTeam: EnhancedTeam | null;
  teamMembers: EnhancedTeamMember[];
  teamSettings: TeamSettings | null;
  
  // Invitations and requests
  sentInvitations: TeamInvitation[];
  receivedInvitations: TeamInvitation[];
  teamRequests: TeamJoinRequest[];
  myRequests: TeamJoinRequest[];
  
  // Account management
  userProfile: EnhancedProfile | null;
  upgradeRequests: AccountUpgradeRequest[];
  
  // Loading states
  loading: boolean;
  inviting: boolean;
  processing: boolean;

  // Team management actions
  fetchTeams: () => Promise<void>;
  fetchTeamDetails: (teamId: string) => Promise<void>;
  createTeam: (teamData: { name: string; description?: string; avatar_url?: string }) => Promise<boolean>;
  updateTeam: (teamId: string, updates: Partial<EnhancedTeam>) => Promise<boolean>;
  deleteTeam: (teamId: string) => Promise<boolean>;
  leaveTeam: (teamId: string) => Promise<boolean>;
  
  // Member management actions
  fetchTeamMembers: (teamId: string) => Promise<void>;
  inviteToTeam: (teamId: string, email: string, message?: string) => Promise<boolean>;
  removeTeamMember: (teamId: string, memberId: string) => Promise<boolean>;
  updateMemberRole: (teamId: string, memberId: string, role: 'admin' | 'member') => Promise<boolean>;
  transferOwnership: (teamId: string, newOwnerId: string) => Promise<boolean>;
  
  // Invitation management
  fetchInvitations: () => Promise<void>;
  respondToInvitation: (invitationId: string, accept: boolean) => Promise<boolean>;
  cancelInvitation: (invitationId: string) => Promise<boolean>;
  
  // Join request management
  requestToJoinTeam: (teamId: string, message?: string) => Promise<boolean>;
  fetchJoinRequests: (teamId?: string) => Promise<void>;
  respondToJoinRequest: (requestId: string, approve: boolean, adminNotes?: string) => Promise<boolean>;
  
  // Account management
  fetchUserProfile: () => Promise<void>;
  requestAccountUpgrade: (requestedType: AccountType, reason?: string) => Promise<boolean>;
  fetchUpgradeRequests: () => Promise<void>;
  processUpgradeRequest: (requestId: string, approve: boolean, adminNotes?: string) => Promise<boolean>;
  upgradeUserAccount: (userId: string, accountType: AccountType) => Promise<boolean>;
  
  // Settings management
  fetchTeamSettings: (teamId: string) => Promise<void>;
  updateTeamSettings: (teamId: string, settings: Partial<TeamSettings>) => Promise<boolean>;
  updateNotificationSettings: (settings: Partial<EnhancedProfile['notification_settings']>) => Promise<boolean>;
  
  // Real-time subscriptions
  subscribeToTeamUpdates: (teamId: string) => () => void;
  subscribeToInvitations: () => () => void;
  subscribeToRequests: () => () => void;
}

export const useEnhancedTeamStore = create<EnhancedTeamState>((set, get) => ({
  // Initial state
  teams: [],
  currentTeam: null,
  teamMembers: [],
  teamSettings: null,
  sentInvitations: [],
  receivedInvitations: [],
  teamRequests: [],
  myRequests: [],
  userProfile: null,
  upgradeRequests: [],
  loading: false,
  inviting: false,
  processing: false,

  // Fetch user's teams
  fetchTeams: async () => {
    set({ loading: true });
    try {
      const authUser = useAuthStore.getState().user;
      if (!authUser) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_members!inner (
            user_id,
            role,
            is_owner,
            joined_at
          )
        `)
        .eq('team_members.user_id', authUser.id);

      if (error) throw error;

      // Get member counts and additional details for each team
      const teamsWithDetails = await Promise.all(
        (data || []).map(async (team) => {
          const { data: memberData } = await supabase
            .from('team_members')
            .select(`
              *,
              profiles (display_name, avatar_url, account_type)
            `)
            .eq('team_id', team.id);

          const { data: inviteCount } = await supabase
            .from('team_invitations')
            .select('id', { count: 'exact' })
            .eq('team_id', team.id)
            .eq('status', 'pending');

          const { data: requestCount } = await supabase
            .from('team_join_requests')
            .select('id', { count: 'exact' })
            .eq('team_id', team.id)
            .eq('status', 'pending');

          const userMember = memberData?.find(m => m.user_id === authUser.id);

          return {
            ...team,
            member_count: memberData?.length || 0,
            members: memberData || [],
            owner: memberData?.find(m => m.is_owner) || memberData?.[0],
            user_role: userMember?.role,
            is_owner: userMember?.is_owner || false,
            pending_invitations: inviteCount?.length || 0,
            pending_requests: requestCount?.length || 0
          } as EnhancedTeam;
        })
      );

      set({ teams: teamsWithDetails });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      console.error('Error fetching teams:', {
        message: errorMessage,
        error
      });
      toast({
        title: "Lỗi",
        description: `Không thể tải danh sách nhóm: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch team details
  fetchTeamDetails: async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_members (
            *,
            profiles (display_name, avatar_url, account_type)
          )
        `)
        .eq('id', teamId)
        .single();

      if (error) throw error;

      const authUser = useAuthStore.getState().user;
      const userMember = data.team_members.find((m: any) => m.user_id === authUser?.id);

      const enhancedTeam: EnhancedTeam = {
        ...data,
        member_count: data.team_members.length,
        members: data.team_members,
        owner: data.team_members.find((m: any) => m.is_owner),
        user_role: userMember?.role,
        is_owner: userMember?.is_owner || false,
        pending_invitations: 0,
        pending_requests: 0
      };

      set({ currentTeam: enhancedTeam, teamMembers: data.team_members });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      console.error('Error fetching team details:', {
        message: errorMessage,
        error
      });
      toast({
        title: "Lỗi",
        description: `Không thể tải thông tin nhóm: ${errorMessage}`,
        variant: "destructive"
      });
    }
  },

  // Create new team
  createTeam: async (teamData) => {
    set({ loading: true });
    try {
      const authUser = useAuthStore.getState().user;
      if (!authUser) throw new Error('User not authenticated');

      // Check if user can join more teams
      const { data: canJoin } = await supabase.rpc('can_join_team', {
        user_uuid: authUser.id
      });

      if (!canJoin) {
        toast({
          title: "Giới hạn nhóm",
          description: "Bạn đã đạt giới hạn số lượng nhóm. Hãy nâng cấp tài khoản để tham gia thêm nhóm.",
          variant: "destructive"
        });
        return false;
      }

      // Create team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          ...teamData,
          created_by: authUser.id
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add creator as owner
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: authUser.id,
          role: 'admin',
          is_owner: true
        });

      if (memberError) throw memberError;

      toast({
        title: "Thành công",
        description: "Đã tạo nhóm mới thành công!"
      });

      get().fetchTeams();
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      console.error('Error creating team:', {
        message: errorMessage,
        error
      });
      toast({
        title: "Lỗi",
        description: `Không thể tạo nhóm mới: ${errorMessage}`,
        variant: "destructive"
      });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Delete team (owner only)
  deleteTeam: async (teamId: string) => {
    set({ loading: true });
    try {
      const authUser = useAuthStore.getState().user;
      if (!authUser) throw new Error('User not authenticated');

      // Check if user is owner
      const { data: membership } = await supabase
        .from('team_members')
        .select('is_owner')
        .eq('team_id', teamId)
        .eq('user_id', authUser.id)
        .single();

      if (!membership?.is_owner) {
        throw new Error('Only team owner can delete the team');
      }

      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã xóa nhóm thành công"
      });

      get().fetchTeams();
      return true;
    } catch (error) {
      console.error('Error deleting team:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa nhóm",
        variant: "destructive"
      });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Invite user to team
  inviteToTeam: async (teamId: string, email: string, message?: string) => {
    set({ inviting: true });
    try {
      const authUser = useAuthStore.getState().user;
      if (!authUser) throw new Error('User not authenticated');

      // Check if user has permission to invite
      const { data: membership } = await supabase
        .from('team_members')
        .select('role, is_owner')
        .eq('team_id', teamId)
        .eq('user_id', authUser.id)
        .single();

      if (!membership || (membership.role !== 'admin' && !membership.is_owner)) {
        throw new Error('Only team admins can invite members');
      }

      // Check if invitation already exists
      const { data: existingInvite } = await supabase
        .from('team_invitations')
        .select('id')
        .eq('team_id', teamId)
        .eq('invitee_email', email)
        .eq('status', 'pending')
        .single();

      if (existingInvite) {
        toast({
          title: "Lời mời đã tồn tại",
          description: "Đã có lời mời pending cho email này",
          variant: "destructive"
        });
        return false;
      }

      // Create invitation
      const { error } = await supabase
        .from('team_invitations')
        .insert({
          team_id: teamId,
          inviter_id: authUser.id,
          invitee_email: email,
          message
        });

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã gửi lời mời thành công"
      });

      get().fetchInvitations();
      return true;
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi lời mời",
        variant: "destructive"
      });
      return false;
    } finally {
      set({ inviting: false });
    }
  },

  // Request to join team
  requestToJoinTeam: async (teamId: string, message?: string) => {
    set({ processing: true });
    try {
      const authUser = useAuthStore.getState().user;
      if (!authUser) throw new Error('User not authenticated');

      // Check if user can join more teams
      const { data: canJoin } = await supabase.rpc('can_join_team', {
        user_uuid: authUser.id
      });

      if (!canJoin) {
        toast({
          title: "Giới hạn nhóm",
          description: "Bạn đã đạt giới hạn số lượng nhóm. Hãy nâng cấp tài khoản để tham gia thêm nhóm.",
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase
        .from('team_join_requests')
        .insert({
          team_id: teamId,
          requester_id: authUser.id,
          message
        });

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã gửi yêu cầu tham gia nhóm"
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      console.error('Error requesting to join team:', {
        message: errorMessage,
        error
      });
      toast({
        title: "Lỗi",
        description: `Không thể gửi yêu cầu tham gia: ${errorMessage}`,
        variant: "destructive"
      });
      return false;
    } finally {
      set({ processing: false });
    }
  },

  // Fetch user profile
  fetchUserProfile: async () => {
    try {
      const authUser = useAuthStore.getState().user;
      if (!authUser) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Supabase error fetching profile:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        // Create default profile if doesn't exist
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: authUser.id,
              display_name: authUser.user_metadata?.display_name || authUser.email?.split('@')[0],
              account_type: 'basic',
              max_teams: 5,
              is_admin: false,
              notification_settings: {
                floating_teams: true,
                sound: true,
                desktop: true
              }
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', {
              message: createError.message,
              details: createError.details,
              hint: createError.hint,
              code: createError.code
            });
            toast({
              title: "Lỗi",
              description: `Không thể tạo profile: ${createError.message || 'Unknown error'}`,
              variant: "destructive"
            });
            return;
          }
          set({ userProfile: newProfile });
        }
        return;
      }

      set({ userProfile: data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching user profile:', errorMessage);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin người dùng",
        variant: "destructive"
      });
    }
  },

  // Request account upgrade
  requestAccountUpgrade: async (requestedType: AccountType, reason?: string) => {
    set({ processing: true });
    try {
      const authUser = useAuthStore.getState().user;
      if (!authUser) throw new Error('User not authenticated');

      const { userProfile } = get();
      if (!userProfile) throw new Error('User profile not loaded');

      const { error } = await supabase
        .from('account_upgrade_requests')
        .insert({
          user_id: authUser.id,
          requested_type: requestedType,
          current_type: userProfile.account_type,
          reason
        });

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã gửi yêu cầu nâng cấp tài khoản"
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      console.error('Error requesting account upgrade:', {
        message: errorMessage,
        error
      });
      toast({
        title: "Lỗi",
        description: `Không thể gửi yêu cầu nâng cấp: ${errorMessage}`,
        variant: "destructive"
      });
      return false;
    } finally {
      set({ processing: false });
    }
  },

  // Fetch invitations
  fetchInvitations: async () => {
    try {
      const authUser = useAuthStore.getState().user;
      if (!authUser) return;

      const { data: received, error: receivedError } = await supabase
        .from('team_invitations')
        .select(`
          *,
          teams (name, description, avatar_url),
          inviter:profiles!team_invitations_inviter_id_fkey (display_name, avatar_url)
        `)
        .eq('invitee_id', authUser.id);

      if (receivedError) throw receivedError;

      const { data: sent, error: sentError } = await supabase
        .from('team_invitations')
        .select(`
          *,
          teams (name, description, avatar_url)
        `)
        .eq('inviter_id', authUser.id);

      if (sentError) throw sentError;

      set({ 
        receivedInvitations: received || [],
        sentInvitations: sent || []
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      console.error('Error fetching invitations:', {
        message: errorMessage,
        error
      });
    }
  },

  // Respond to invitation
  respondToInvitation: async (invitationId: string, accept: boolean) => {
    set({ processing: true });
    try {
      const authUser = useAuthStore.getState().user;
      if (!authUser) throw new Error('User not authenticated');

      if (accept) {
        // Check if user can join more teams
        const { data: canJoin } = await supabase.rpc('can_join_team', {
          user_uuid: authUser.id
        });

        if (!canJoin) {
          toast({
            title: "Giới hạn nhóm",
            description: "Bạn đã đạt giới hạn số lượng nhóm. Hãy nâng cấp tài khoản để tham gia thêm nhóm.",
            variant: "destructive"
          });
          return false;
        }
      }

      // Update invitation status
      const { data: invitation, error: updateError } = await supabase
        .from('team_invitations')
        .update({ 
          status: accept ? 'accepted' : 'rejected',
          invitee_id: authUser.id
        })
        .eq('id', invitationId)
        .select('team_id')
        .single();

      if (updateError) throw updateError;

      if (accept) {
        // Add user to team
        const { error: memberError } = await supabase
          .from('team_members')
          .insert({
            team_id: invitation.team_id,
            user_id: authUser.id,
            role: 'member'
          });

        if (memberError) throw memberError;
      }

      toast({
        title: "Thành công",
        description: accept ? "Đã tham gia nhóm thành công" : "Đã từ chối lời mời"
      });

      get().fetchInvitations();
      if (accept) get().fetchTeams();
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      console.error('Error responding to invitation:', {
        message: errorMessage,
        error
      });
      toast({
        title: "Lỗi",
        description: `Không thể xử lý lời mời: ${errorMessage}`,
        variant: "destructive"
      });
      return false;
    } finally {
      set({ processing: false });
    }
  },

  // Update notification settings
  updateNotificationSettings: async (settings) => {
    try {
      const authUser = useAuthStore.getState().user;
      if (!authUser) throw new Error('User not authenticated');

      let { userProfile } = get();

      // If profile not loaded, try to fetch it first
      if (!userProfile) {
        await get().fetchUserProfile();
        userProfile = get().userProfile;

        // If still no profile, create default settings
        if (!userProfile) {
          const defaultSettings = {
            floating_teams: true,
            sound: true,
            desktop: true,
            ...settings
          };

          const { error } = await supabase
            .from('profiles')
            .upsert({
              id: authUser.id,
              notification_settings: defaultSettings,
              account_type: 'basic',
              max_teams: 5,
              is_admin: false
            });

          if (error) {
            console.error('Supabase error upserting profile:', {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            });
            throw error;
          }

          // Fetch the updated profile
          await get().fetchUserProfile();

          toast({
            title: "Thành công",
            description: "Đã cập nhật cài đặt thông báo"
          });
          return true;
        }
      }

      const updatedSettings = {
        ...userProfile.notification_settings,
        ...settings
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          notification_settings: updatedSettings
        })
        .eq('id', authUser.id);

      if (error) {
        console.error('Supabase error updating notification settings:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      set({
        userProfile: {
          ...userProfile,
          notification_settings: updatedSettings
        }
      });

      toast({
        title: "Thành công",
        description: "Đã cập nhật cài đặt thông báo"
      });

      return true;
    } catch (error) {
      let errorMessage = 'Unknown error';

      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as any).message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      console.error('Error updating notification settings:', {
        error,
        errorMessage,
        type: typeof error
      });

      toast({
        title: "Lỗi",
        description: `Không thể cập nhật cài đặt thông báo: ${errorMessage}`,
        variant: "destructive"
      });
      return false;
    }
  },

  // Placeholder implementations for other methods
  updateTeam: async () => false,
  leaveTeam: async () => false,
  fetchTeamMembers: async () => {},
  removeTeamMember: async () => false,
  updateMemberRole: async () => false,
  transferOwnership: async () => false,
  cancelInvitation: async () => false,
  fetchJoinRequests: async () => {},
  respondToJoinRequest: async () => false,
  fetchUpgradeRequests: async () => {},
  processUpgradeRequest: async () => false,
  upgradeUserAccount: async () => false,
  fetchTeamSettings: async () => {},
  updateTeamSettings: async () => false,
  subscribeToTeamUpdates: () => () => {},
  subscribeToInvitations: () => () => {},
  subscribeToRequests: () => () => {}
}));
