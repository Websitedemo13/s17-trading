import { supabase } from '@/integrations/supabase/client';

export const debugSupabase = {
  async checkTableExists(tableName: string) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      console.log(`Table ${tableName}:`, {
        exists: !error,
        error: error ? {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        } : null,
        sampleData: data
      });
      
      return !error;
    } catch (error) {
      console.error(`Error checking table ${tableName}:`, error);
      return false;
    }
  },

  async checkAllTables() {
    console.log('=== Supabase Tables Check ===');
    const tables = [
      'profiles',
      'teams', 
      'team_members',
      'chat_messages',
      'floating_notifications',
      'team_invitations',
      'team_join_requests',
      'account_upgrade_requests'
    ];

    for (const table of tables) {
      await this.checkTableExists(table);
    }
    console.log('=== End Tables Check ===');
  },

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('Current user:', {
        user: user ? {
          id: user.id,
          email: user.email,
          metadata: user.user_metadata
        } : null,
        error
      });
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
};

// Export for manual debugging in console
(window as any).debugSupabase = debugSupabase;
