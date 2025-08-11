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
  generateInviteLink: (teamId: string) => string;
  setCurrentTeam: (team: Team | null) => void;
}

// Helper functions for localStorage fallback
const getStorageKey = (userId: string, key: string) => `team_${userId}_${key}`;

const saveToStorage = (userId: string, key: string, data: any) => {
  try {
    localStorage.setItem(getStorageKey(userId, key), JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

const loadFromStorage = (userId: string, key: string) => {
  try {
    const data = localStorage.getItem(getStorageKey(userId, key));
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return null;
  }
};

const getCurrentUser = () => {
  // Try to get current user from various auth store formats
  try {
    // Try zustand auth store format
    const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    let user = authData?.state?.user;

    // If not found, try direct user storage
    if (!user) {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userData.id) user = userData;
    }

    // If still not found, check if admin user is logged in
    if (!user) {
      const adminData = JSON.parse(localStorage.getItem('admin-storage') || '{}');
      if (adminData?.state?.user) {
        user = adminData.state.user;
      }
    }

    if (user && user.id) {
      return {
        id: user.id,
        email: user.email || 'admin@example.com',
        display_name: user.user_metadata?.display_name || user.display_name || user.email?.split('@')[0] || 'Admin User'
      };
    }
  } catch (error) {
    console.warn('Error getting current user:', error);
  }

  // Create a consistent demo user for testing
  const demoUserId = 'demo-user-admin';
  return {
    id: demoUserId,
    email: 'admin@s17trading.com',
    display_name: 'Admin User'
  };
};

export const useTeamStore = create<TeamState>((set, get) => ({
  teams: [],
  currentTeam: null,
  teamMembers: [],
  loading: false,

  fetchTeams: async () => {
    set({ loading: true });
    try {
      const currentUser = getCurrentUser();

      // Try Supabase first, fallback to localStorage
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
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

          if (!memberError && memberTeams) {
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
            set({ loading: false });
            return;
          }
        }
      } catch (supabaseError) {
        console.log('Supabase not available, using localStorage fallback');
      }

      // Fallback to localStorage
      const storedTeams = loadFromStorage(currentUser.id, 'teams') || [];
      const globalTeams = JSON.parse(localStorage.getItem('global_teams') || '[]');

      // Combine user teams with global teams they've joined
      const userTeamIds = storedTeams.map((t: any) => t.id);
      const joinedTeams = globalTeams.filter((t: any) =>
        t.members && t.members.some((m: any) => m.user_id === currentUser.id)
      );

      const allTeams = [...storedTeams, ...joinedTeams.filter((t: any) => !userTeamIds.includes(t.id))];

      set({ teams: allTeams });

    } catch (error) {
      console.error('Error fetching teams:', error);
      // Even if there's an error, don't show error toast for localStorage fallback
      set({ teams: [] });
    } finally {
      set({ loading: false });
    }
  },

  createTeam: async (data) => {
    try {
      const currentUser = getCurrentUser();

      // Try Supabase first, fallback to localStorage
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
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

          if (!teamError && team) {
            // Add creator as admin
            const { error: memberError } = await supabase
              .from('team_members')
              .insert({
                team_id: team.id,
                user_id: userData.user.id,
                role: 'admin'
              });

            if (!memberError) {
              await get().fetchTeams();
              toast({
                title: "Thành công",
                description: "Nhóm đã được tạo thành công!",
              });
              return true;
            }
          }
        }
      } catch (supabaseError) {
        console.log('Supabase not available, using localStorage fallback');
      }

      // Fallback to localStorage
      const teamId = 'team_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const newTeam: Team = {
        id: teamId,
        name: data.name,
        description: data.description,
        avatar_url: '',
        created_by: currentUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        member_count: 1,
        role: 'admin'
      };

      // Save to user's teams
      const userTeams = loadFromStorage(currentUser.id, 'teams') || [];
      userTeams.push(newTeam);
      saveToStorage(currentUser.id, 'teams', userTeams);

      // Save to global teams for sharing
      const globalTeams = JSON.parse(localStorage.getItem('global_teams') || '[]');
      const globalTeam = {
        ...newTeam,
        members: [{
          id: 'member_' + Date.now(),
          team_id: teamId,
          user_id: currentUser.id,
          role: 'admin',
          joined_at: new Date().toISOString(),
          user: {
            display_name: currentUser.display_name,
            avatar_url: ''
          }
        }]
      };
      globalTeams.push(globalTeam);
      localStorage.setItem('global_teams', JSON.stringify(globalTeams));

      // Update local state
      const currentTeams = get().teams;
      set({ teams: [...currentTeams, newTeam] });

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
      const currentUser = getCurrentUser();

      // Try Supabase first, fallback to localStorage
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
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
            });
            return false;
          }

          // Verify team exists
          const { data: team } = await supabase
            .from('teams')
            .select('id, name')
            .eq('id', teamId)
            .single();

          if (team) {
            // Join team
            const { error } = await supabase
              .from('team_members')
              .insert({
                team_id: teamId,
                user_id: userData.user.id,
                role: 'member'
              });

            if (!error) {
              await get().fetchTeams();
              toast({
                title: "Thành công",
                description: `Đã tham gia nhóm "${team.name}"!`,
              });
              return true;
            }
          }
        }
      } catch (supabaseError) {
        console.log('Supabase not available, using localStorage fallback');
      }

      // Fallback to localStorage
      const globalTeams = JSON.parse(localStorage.getItem('global_teams') || '[]');
      const team = globalTeams.find((t: any) => t.id === inviteCode);

      if (!team) {
        toast({
          title: "Lỗi",
          description: "Mã mời không hợp lệ hoặc nhóm không tồn tại",
          variant: "destructive"
        });
        return false;
      }

      // Check if already a member
      const isAlreadyMember = team.members?.some((m: any) => m.user_id === currentUser.id);
      if (isAlreadyMember) {
        toast({
          title: "Thông báo",
          description: "Bạn đã là thành viên của nhóm này",
        });
        return false;
      }

      // Add user to team
      if (!team.members) team.members = [];
      team.members.push({
        id: 'member_' + Date.now(),
        team_id: team.id,
        user_id: currentUser.id,
        role: 'member',
        joined_at: new Date().toISOString(),
        user: {
          display_name: currentUser.display_name,
          avatar_url: ''
        }
      });

      // Update member count
      team.member_count = team.members.length;

      // Save back to global teams
      const updatedGlobalTeams = globalTeams.map((t: any) => t.id === team.id ? team : t);
      localStorage.setItem('global_teams', JSON.stringify(updatedGlobalTeams));

      // Add to user's teams with member role
      const userTeam = { ...team, role: 'member' };
      delete userTeam.members; // Don't store members list in user's teams

      const userTeams = loadFromStorage(currentUser.id, 'teams') || [];
      userTeams.push(userTeam);
      saveToStorage(currentUser.id, 'teams', userTeams);

      // Update local state
      await get().fetchTeams();

      toast({
        title: "Thành công",
        description: `Đã tham gia nhóm "${team.name}"!`,
      });

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
        description: "Không th�� rời khỏi nhóm",
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
      const inviteLink = get().generateInviteLink(teamId);

      // In a real app, you'd send an email invitation
      // For demo, we'll copy the invite link to clipboard
      navigator.clipboard.writeText(inviteLink).then(() => {
        toast({
          title: "Link mời đã được sao chép",
          description: `Chia sẻ link này để mời ${email} tham gia nhóm`,
        });
      }).catch(() => {
        toast({
          title: "Mã mời",
          description: `Mã mời: ${teamId}`,
        });
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

  generateInviteLink: (teamId) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/teams?invite=${teamId}`;
  },

  setCurrentTeam: (team) => {
    set({ currentTeam: team });
  }
}));
