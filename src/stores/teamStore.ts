import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { Team, TeamMember } from '@/types';
import { toast } from '@/hooks/use-toast';
// Removed notification store import to fix circular dependency

interface TeamState {
  teams: Team[];
  currentTeam: Team | null;
  teamMembers: TeamMember[];
  loading: boolean;
  teamSettings: Record<string, any>;
  
  // Core team methods
  fetchTeams: () => Promise<void>;
  createTeam: (data: { name: string; description?: string; avatar_url?: string }) => Promise<boolean>;
  updateTeam: (teamId: string, data: { name?: string; description?: string; avatar_url?: string }) => Promise<boolean>;
  deleteTeam: (teamId: string) => Promise<boolean>;
  
  // Member management
  joinTeam: (inviteCode: string) => Promise<boolean>;
  leaveTeam: (teamId: string) => Promise<boolean>;
  fetchTeamMembers: (teamId: string) => Promise<void>;
  inviteMember: (teamId: string, email: string, role?: 'admin' | 'member') => Promise<boolean>;
  removeMember: (teamId: string, userId: string) => Promise<boolean>;
  updateMemberRole: (teamId: string, userId: string, role: 'admin' | 'member') => Promise<boolean>;
  
  // Team settings and features
  fetchTeamSettings: (teamId: string) => Promise<void>;
  updateTeamSettings: (teamId: string, settings: any) => Promise<boolean>;
  
  // Invite system
  generateInviteCode: (teamId: string, expiresIn?: number) => Promise<string | null>;
  generateInviteLink: (teamId: string) => string;
  validateInviteCode: (inviteCode: string) => Promise<{ valid: boolean; team?: Team; error?: string }>;
  
  // Real-time subscriptions
  subscribeToTeam: (teamId: string) => () => void;
  subscribeToTeamMembers: (teamId: string) => () => void;
  
  // Utility methods
  setCurrentTeam: (team: Team | null) => void;
  searchTeams: (query: string) => Promise<Team[]>;
  getTeamStats: (teamId: string) => Promise<any>;
  cleanup: () => void;
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
  teamSettings: {},

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

      // Create demo teams if none exist
      if (globalTeams.length === 0) {
        const demoTeams = [
          {
            id: 'team_demo_1',
            name: 'Crypto Traders VN',
            description: 'Nhóm trading crypto chuyên nghiệp tại Việt Nam. Chia sẻ signal, phân tích thị trường và học hỏi kinh nghiệm.',
            avatar_url: '',
            created_by: 'demo-user-admin',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
            member_count: 15,
            role: 'admin',
            members: [{
              id: 'member_1',
              team_id: 'team_demo_1',
              user_id: currentUser.id,
              role: 'admin',
              joined_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              user: {
                display_name: currentUser.display_name,
                avatar_url: ''
              }
            }]
          },
          {
            id: 'team_demo_2',
            name: 'Stock Analysis Hub',
            description: 'Phân tích chứng khoán Việt Nam. Focus vào blue-chip stocks như VIC, VHM, VCB và các cổ phiếu tiềm năng.',
            avatar_url: '',
            created_by: 'demo-user-2',
            created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            member_count: 23,
            role: 'member',
            members: [{
              id: 'member_2',
              team_id: 'team_demo_2',
              user_id: currentUser.id,
              role: 'member',
              joined_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              user: {
                display_name: currentUser.display_name,
                avatar_url: ''
              }
            }]
          },
          {
            id: 'team_demo_3',
            name: 'DeFi Yield Farmers',
            description: 'Cộng đồng yield farming và DeFi strategies. Chia sẻ opportunities trên các protocols như Uniswap, Aave, Curve.',
            avatar_url: '',
            created_by: 'demo-user-3',
            created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            member_count: 8,
            role: 'member',
            members: [{
              id: 'member_3',
              team_id: 'team_demo_3',
              user_id: currentUser.id,
              role: 'member',
              joined_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
              user: {
                display_name: currentUser.display_name,
                avatar_url: ''
              }
            }]
          }
        ];

        localStorage.setItem('global_teams', JSON.stringify(demoTeams));

        // Add demo teams to user's teams list
        const userTeams = demoTeams.map(team => ({
          id: team.id,
          name: team.name,
          description: team.description,
          avatar_url: team.avatar_url,
          created_by: team.created_by,
          created_at: team.created_at,
          updated_at: team.updated_at,
          member_count: team.member_count,
          role: team.role
        }));

        saveToStorage(currentUser.id, 'teams', userTeams);
        set({ teams: userTeams });
        return;
      }

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
              avatar_url: data.avatar_url,
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
              // Welcome notification removed to fix circular dependency
              // TODO: Add notification system integration later

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
        avatar_url: data.avatar_url || '',
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

  updateTeam: async (teamId, data) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        // Check if user is admin
        const { data: memberData } = await supabase
          .from('team_members')
          .select('role')
          .eq('team_id', teamId)
          .eq('user_id', userData.user.id)
          .single();

        if (memberData?.role !== 'admin') {
          toast({
            title: "Lỗi",
            description: "Chỉ admin mới có thể cập nhật thông tin nhóm",
            variant: "destructive"
          });
          return false;
        }

        const { error } = await supabase
          .from('teams')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', teamId);

        if (!error) {
          await get().fetchTeams();
          
          // Notification removed to fix circular dependency
          // TODO: Add notification system integration later

          toast({
            title: "Thành công",
            description: "Thông tin nhóm đã được cập nhật!",
          });
          return true;
        }
      }
    } catch (error) {
      console.error('Error updating team:', error);
    }

    toast({
      title: "Lỗi",
      description: "Không thể cập nhật thông tin nhóm",
      variant: "destructive"
    });
    return false;
  },

  deleteTeam: async (teamId) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        // Check if user is admin
        const { data: memberData } = await supabase
          .from('team_members')
          .select('role')
          .eq('team_id', teamId)
          .eq('user_id', userData.user.id)
          .single();

        if (memberData?.role !== 'admin') {
          toast({
            title: "Lỗi",
            description: "Chỉ admin mới có thể xóa nhóm",
            variant: "destructive"
          });
          return false;
        }

        const { error } = await supabase
          .from('teams')
          .delete()
          .eq('id', teamId);

        if (!error) {
          // Update local state
          const teams = get().teams.filter(team => team.id !== teamId);
          set({ teams });
          
          // Clear current team if it was deleted
          if (get().currentTeam?.id === teamId) {
            set({ currentTeam: null });
          }

          toast({
            title: "Thành công",
            description: "Nhóm đã được xóa!",
          });
          return true;
        }
      }
    } catch (error) {
      console.error('Error deleting team:', error);
    }

    toast({
      title: "Lỗi",
      description: "Không thể xóa nhóm",
      variant: "destructive"
    });
    return false;
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
              description: "Bạn đã l�� thành viên của nhóm này",
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
        description: "Không thể rời khỏi nhóm",
        variant: "destructive"
      });
      return false;
    }
  },

  fetchTeamMembers: async (teamId) => {
    const maxRetries = 3;
    let attempt = 0;

    const attemptFetch = async (): Promise<void> => {
      try {
        // Add timeout to prevent hanging requests
        const { data, error } = await Promise.race([
          supabase
            .from('team_members')
            .select(`
              *,
              profiles (
                display_name,
                avatar_url
              )
            `)
            .eq('team_id', teamId)
            .order('joined_at', { ascending: true }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 10000)
          )
        ]) as any;

        if (error) throw error;

        const members: TeamMember[] = data?.map(member => ({
          ...member,
          user: {
            display_name: member.profiles?.display_name || 'Unknown User',
            avatar_url: member.profiles?.avatar_url || null
          }
        })) || [];

        set({ teamMembers: members });
      } catch (error) {
        attempt++;
        console.error(`Error fetching team members (attempt ${attempt}):`, error);

        if (attempt < maxRetries) {
          // Exponential backoff: wait longer between retries
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
          return attemptFetch();
        } else {
          // All retries failed, set empty array and show user-friendly message
          set({ teamMembers: [] });

          // Only show toast for non-network errors or after all retries
          if (!error.message?.includes('Failed to fetch') && !error.message?.includes('Request timeout')) {
            toast({
              title: "Không thể tải thành viên",
              description: "Vui lòng thử lại sau. Kiểm tra kết nối mạng của bạn.",
              variant: "destructive"
            });
          }
        }
      }
    };

    return attemptFetch();
  },

  inviteMember: async (teamId, email, role = 'member') => {
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
        title: "Lỗi",
        description: "Không thể cập nhật quyền thành viên",
        variant: "destructive"
      });
      return false;
    }
  },

  fetchTeamSettings: async (teamId) => {
    try {
      // In real app, this would fetch from a team_settings table
      const defaultSettings = {
        allowPublicJoin: false,
        requireApproval: true,
        maxMembers: 100,
        enableNotifications: true,
        enableActivities: true
      };
      
      const teamSettings = get().teamSettings;
      set({ 
        teamSettings: { 
          ...teamSettings, 
          [teamId]: defaultSettings 
        } 
      });
    } catch (error) {
      console.error('Error fetching team settings:', error);
    }
  },

  updateTeamSettings: async (teamId, settings) => {
    try {
      const teamSettings = get().teamSettings;
      set({ 
        teamSettings: { 
          ...teamSettings, 
          [teamId]: { ...teamSettings[teamId], ...settings } 
        } 
      });
      
      toast({
        title: "Thành công",
        description: "Cài đặt nhóm đã được cập nhật!",
      });
      return true;
    } catch (error) {
      console.error('Error updating team settings:', error);
      return false;
    }
  },

  generateInviteCode: async (teamId, expiresIn) => {
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

  validateInviteCode: async (inviteCode) => {
    try {
      const { data: team, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', inviteCode)
        .single();

      if (error || !team) {
        return { 
          valid: false, 
          error: 'Mã mời không hợp lệ hoặc nhóm không tồn tại' 
        };
      }

      return { valid: true, team };
    } catch (error) {
      return { 
        valid: false, 
        error: 'Không thể xác thực mã mời' 
      };
    }
  },

  searchTeams: async (query) => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(20);

      if (!error && data) {
        return data;
      }
    } catch (error) {
      console.log('Search not available, using local data');
    }

    // Fallback to local search
    const teams = get().teams;
    return teams.filter(team => 
      team.name.toLowerCase().includes(query.toLowerCase()) ||
      team.description?.toLowerCase().includes(query.toLowerCase())
    );
  },

  getTeamStats: async (teamId) => {
    try {
      const { data: memberCount } = await supabase
        .from('team_members')
        .select('id', { count: 'exact' })
        .eq('team_id', teamId);

      const { data: recentActivity } = await supabase
        .from('team_activities')
        .select('*')
        .eq('team_id', teamId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .limit(10);

      const { data: unreadNotifications } = await supabase
        .from('team_notifications')
        .select('id', { count: 'exact' })
        .eq('team_id', teamId)
        .eq('read', false);

      return {
        memberCount: memberCount?.length || 0,
        recentActivity: recentActivity || [],
        unreadNotifications: unreadNotifications?.length || 0
      };
    } catch (error) {
      console.error('Error fetching team stats:', error);
      return {
        memberCount: 0,
        recentActivity: [],
        unreadNotifications: 0
      };
    }
  },

  subscribeToTeam: (teamId) => {
    try {
      const subscription = supabase
        .channel(`team_${teamId}`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'teams',
            filter: `id=eq.${teamId}`
          }, 
          (payload) => {
            console.log('Team updated:', payload);
            get().fetchTeams();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.log('Real-time not available');
      return () => {};
    }
  },

  subscribeToTeamMembers: (teamId) => {
    try {
      const subscription = supabase
        .channel(`team_members_${teamId}`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'team_members',
            filter: `team_id=eq.${teamId}`
          }, 
          (payload) => {
            console.log('Team members updated:', payload);
            get().fetchTeamMembers(teamId);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.log('Real-time not available');
      return () => {};
    }
  },

  cleanup: () => {
    set({
      teams: [],
      currentTeam: null,
      teamMembers: [],
      teamSettings: {}
    });
  },

  setCurrentTeam: (team) => {
    set({ currentTeam: team });
  }
}));
