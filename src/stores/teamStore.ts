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
  createTeam: (name: string, description?: string) => Promise<boolean>;
  joinTeam: (teamId: string) => Promise<boolean>;
  leaveTeam: (teamId: string) => Promise<boolean>;
  setCurrentTeam: (team: Team | null) => void;
  fetchTeamMembers: (teamId: string) => Promise<void>;
}

export const useTeamStore = create<TeamState>((set, get) => ({
  teams: [],
  currentTeam: null,
  teamMembers: [],
  loading: false,

  fetchTeams: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_members!inner(role),
          team_members(count)
        `);

      if (error) throw error;

      const teamsWithCounts = data?.map(team => ({
        ...team,
        member_count: team.team_members?.length || 0,
        role: team.team_members?.[0]?.role
      })) || [];

      set({ teams: teamsWithCounts });
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

  createTeam: async (name: string, description?: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name,
          description,
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

      toast({
        title: "Thành công",
        description: "Tạo nhóm thành công!"
      });

      get().fetchTeams();
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

  joinTeam: async (teamId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: userData.user.id,
          role: 'member'
        });

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Tham gia nhóm thành công!"
      });

      get().fetchTeams();
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

  leaveTeam: async (teamId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      const { error } = await supabase
        .from('team_members')
        .delete()
        .match({
          team_id: teamId,
          user_id: userData.user.id
        });

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã rời khỏi nhóm"
      });

      get().fetchTeams();
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

  setCurrentTeam: (team: Team | null) => {
    set({ currentTeam: team });
  },

  fetchTeamMembers: async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId);

      if (error) throw error;

      const members = data?.map(member => ({
        ...member,
        user: { display_name: 'User', avatar_url: null }
      })) || [];

      set({ teamMembers: members });
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  },
}));