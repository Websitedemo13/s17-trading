import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAdminStore } from '@/stores/adminStore';
import { useEnhancedTeamStore } from '@/stores/enhancedTeamStore';
import { EnhancedTeam } from '@/types/teams';

export interface RolePermissions {
  // Global permissions
  isSystemAdmin: boolean;
  canAccessAdminDashboard: boolean;
  canUpgradeAccounts: boolean;
  canManageAllTeams: boolean;
  
  // Team-specific permissions
  canCreateTeams: boolean;
  canJoinTeams: boolean;
  canManageOwnTeams: boolean;
  
  // Account permissions
  canRequestUpgrade: boolean;
  maxTeams: number;
  accountType: 'basic' | 'premium' | 'enterprise';
}

export const useRoleAccess = (teamId?: string): RolePermissions & {
  // Team-specific permissions for current team
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canDeleteTeam: boolean;
  canEditTeam: boolean;
  isTeamOwner: boolean;
  isTeamAdmin: boolean;
  loading: boolean;
} => {
  const { user } = useAuthStore();
  const { isAdmin } = useAdminStore();
  const { userProfile, teams, fetchUserProfile } = useEnhancedTeamStore();
  const [loading, setLoading] = useState(true);
  const [currentTeam, setCurrentTeam] = useState<EnhancedTeam | null>(null);

  useEffect(() => {
    if (user && !userProfile) {
      fetchUserProfile().catch((error) => {
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        console.error('Error in useRoleAccess fetchUserProfile:', {
          message: errorMessage,
          error
        });
      });
    }
  }, [user, userProfile, fetchUserProfile]);

  useEffect(() => {
    if (teamId && teams.length > 0) {
      const team = teams.find(t => t.id === teamId);
      setCurrentTeam(team || null);
    }
    setLoading(false);
  }, [teamId, teams]);

  // System admin permissions - check both database admin flag and admin store
  const isSystemAdmin = userProfile?.is_admin || isAdmin;
  
  // Account info
  const accountType = userProfile?.account_type || 'basic';
  const maxTeams = userProfile?.max_teams || 5;
  
  // Current team role
  const isTeamOwner = currentTeam?.is_owner || false;
  const isTeamAdmin = currentTeam?.user_role === 'admin' || isTeamOwner;

  // Global permissions
  const globalPermissions: RolePermissions = {
    isSystemAdmin,
    canAccessAdminDashboard: isSystemAdmin,
    canUpgradeAccounts: isSystemAdmin,
    canManageAllTeams: isSystemAdmin,
    canCreateTeams: true, // All users can create teams (subject to limits)
    canJoinTeams: true, // All users can join teams (subject to limits)
    canManageOwnTeams: true,
    canRequestUpgrade: accountType !== 'enterprise', // Enterprise users don't need upgrade
    maxTeams,
    accountType
  };

  // Team-specific permissions
  const teamPermissions = {
    canInviteMembers: isTeamAdmin,
    canRemoveMembers: isTeamAdmin,
    canDeleteTeam: isTeamOwner,
    canEditTeam: isTeamAdmin,
    isTeamOwner,
    isTeamAdmin
  };

  return {
    ...globalPermissions,
    ...teamPermissions,
    loading
  };
};

// Component wrapper for role-based rendering
export const RoleGuard = ({ 
  children, 
  requireAdmin = false,
  requireTeamRole,
  teamId,
  fallback = null 
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireTeamRole?: 'owner' | 'admin' | 'member';
  teamId?: string;
  fallback?: React.ReactNode;
}) => {
  const permissions = useRoleAccess(teamId);

  if (permissions.loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check system admin requirement
  if (requireAdmin && !permissions.isSystemAdmin) {
    return <>{fallback}</>;
  }

  // Check team role requirement
  if (requireTeamRole) {
    switch (requireTeamRole) {
      case 'owner':
        if (!permissions.isTeamOwner) return <>{fallback}</>;
        break;
      case 'admin':
        if (!permissions.isTeamAdmin) return <>{fallback}</>;
        break;
      case 'member':
        // All team members can access
        break;
    }
  }

  return <>{children}</>;
};

export default useRoleAccess;
