import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { Team, TeamMember } from '@/types';
import { toast } from '@/hooks/use-toast';

interface TeamState {
  teams: Team[];
  currentTeam: Team | null;
  teamMembers: TeamMember[];
  loading: boolean;
  fetchTeams: () => Promise<void>;
  createTeam: (data: { name: string; description?: string }) => Promise<boolean>;
  joinTeam: (inviteCode: string) => Promise<boolean>;
  leaveTeam: (teamId: string) => Promise<boolean>;
  fetchTeamMembers: (teamId: string) => Promise<void>;
  inviteMember: (teamId: string, email: string) => Promise<boolean>;
  removeMember: (teamId: string, userId: string) => Promise<boolean>;
  updateMemberRole: (teamId: string, userId: string, role: 'admin' | 'member') => Promise<boolean>;
  generateInviteCode: (teamId: string) => Promise<string | null>;
  setCurrentTeam: (team: Team | null) => void;
}

export const useTeamStore = create<TeamState>((set, get) => ({
  teams: [],
  currentTeam: null,
  teamMembers: [],
  loading: false,

  fetchTeams: async () => {
    set({ loading: true });
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Fetch teams where user is a member
      const { data: memberTeams, error: memberError } = await supabase
        .from('team_members')
        .select(`
          team_id,
          role,
          teams (
            id,
            name,
            description,
            avatar_url,
            created_by,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', userData.user.id);

      if (memberError) throw memberError;

      // Get member counts for each team
      const teamIds = memberTeams?.map(tm => tm.team_id) || [];
      const { data: memberCounts } = await supabase
        .from('team_members')
        .select('team_id')
        .in('team_id', teamIds);

      const teams: Team[] = memberTeams?.map(tm => {
        const team = tm.teams as any;
        const memberCount = memberCounts?.filter(mc => mc.team_id === tm.team_id).length || 0;
        
        return {
          ...team,
          role: tm.role,
          member_count: memberCount
        };
      }) || [];

      set({ teams });
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách nhóm",
        variant: "destructive"
      });
    } finally {
      set({ loading: false });
    }
  },

  createTeam: async (data) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      // Create team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: data.name,
          description: data.description,
          created_by: userData.user.id
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add creator as admin
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: userData.user.id,
          role: 'admin'
        });

      if (memberError) throw memberError;

      // Refresh teams list
      await get().fetchTeams();

      toast({
        title: "Thành công",
        description: "Nhóm đã được tạo thành công!",
      });

      return true;
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo nhóm",
        variant: "destructive"
      });
      return false;
    }
  },

  joinTeam: async (inviteCode) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      // For demo purposes, treat inviteCode as team ID
      // In production, you'd have a proper invite system
      const teamId = inviteCode;

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', userData.user.id)
        .single();

      if (existingMember) {
        toast({
          title: "Thông báo",
          description: "Bạn đã là thành viên của nhóm này",
          variant: "default"
        });
        return false;
      }

      // Verify team exists
      const { data: team } = await supabase
        .from('teams')
        .select('id, name')
        .eq('id', teamId)
        .single();

      if (!team) {
        toast({
          title: "Lỗi",
          description: "Nhóm không tồn tại",
          variant: "destructive"
        });
        return false;
      }

      // Join team
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: userData.user.id,
          role: 'member'
        });

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error joining team:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tham gia nhóm",
        variant: "destructive"
      });
      return false;
    }
  },

  leaveTeam: async (teamId) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userData.user.id);

      if (error) throw error;

      // Update local state
      const teams = get().teams.filter(team => team.id !== teamId);
      set({ teams });

      return true;
    } catch (error) {
      console.error('Error leaving team:', error);
      toast({
        title: "Lỗi",
        description: "Không thể rời khỏi nhóm",
        variant: "destructive"
      });
      return false;
    }
  },

  fetchTeamMembers: async (teamId) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          profiles (
            display_name,
            avatar_url
          )
        `)
        .eq('team_id', teamId)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      const members: TeamMember[] = data?.map(member => ({
        ...member,
        user: {
          display_name: member.profiles?.display_name,
          avatar_url: member.profiles?.avatar_url
        }
      })) || [];

      set({ teamMembers: members });
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách thành viên",
        variant: "destructive"
      });
    }
  },

  inviteMember: async (teamId, email) => {
    try {
      // In a real app, you'd send an email invitation
      // For demo, we'll just show the team ID that can be used to join
      toast({
        title: "Mã mời",
        description: `Chia sẻ mã này để mời thành viên: ${teamId}`,
      });
      return true;
    } catch (error) {
      console.error('Error inviting member:', error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi lời mời",
        variant: "destructive"
      });
      return false;
    }
  },

  removeMember: async (teamId, userId) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      const teamMembers = get().teamMembers.filter(member => member.user_id !== userId);
      set({ teamMembers });

      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa thành viên",
        variant: "destructive"
      });
      return false;
    }
  },

  updateMemberRole: async (teamId, userId, role) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role })
        .eq('team_id', teamId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      const teamMembers = get().teamMembers.map(member => 
        member.user_id === userId ? { ...member, role } : member
      );
      set({ teamMembers });

      return true;
    } catch (error) {
      console.error('Error updating member role:', error);
      toast({
        title: "L��i",
        description: "Không thể cập nhật quyền thành viên",
        variant: "destructive"
      });
      return false;
    }
  },

  generateInviteCode: async (teamId) => {
    try {
      // For demo, return the team ID as invite code
      return teamId;
    } catch (error) {
      console.error('Error generating invite code:', error);
      return null;
    }
  },

  setCurrentTeam: (team) => {
    set({ currentTeam: team });
  }
}));
