import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
  lastLogin: string;
  isActive: boolean;
  permissions: string[];
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalTeams: number;
  totalMessages: number;
  totalPosts: number;
  monthlyGrowth: {
    users: number;
    teams: number;
    posts: number;
  };
}

interface AdminState {
  isAdmin: boolean;
  adminUser: AdminUser | null;
  stats: AdminStats | null;
  loading: boolean;
  
  // Admin authentication
  checkAdminStatus: (email: string) => boolean;
  setAdminUser: (user: AdminUser) => void;
  clearAdmin: () => void;
  
  // Admin operations
  fetchStats: () => Promise<void>;
  getAllUsers: () => Promise<AdminUser[]>;
  updateUserStatus: (userId: string, isActive: boolean) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
}

// Admin configuration
const ADMIN_ACCOUNTS = [
  {
    email: 'quachthanhlong2k3@gmail.com',
    permissions: ['*'], // Full access
    role: 'Super Admin'
  }
];

export const useAdminStore = create<AdminState>((set, get) => ({
  isAdmin: false,
  adminUser: null,
  stats: null,
  loading: false,

  checkAdminStatus: (email: string) => {
    const adminAccount = ADMIN_ACCOUNTS.find(admin => admin.email === email);
    if (adminAccount) {
      const adminUser: AdminUser = {
        id: 'admin-' + email.split('@')[0],
        email: email,
        displayName: 'Super Admin',
        role: adminAccount.role,
        lastLogin: new Date().toISOString(),
        isActive: true,
        permissions: adminAccount.permissions
      };
      
      set({ 
        isAdmin: true, 
        adminUser: adminUser
      });
      
      toast({
        title: "Đăng nhập Admin thành công",
        description: `Chào mừng ${adminUser.role}!`
      });
      
      return true;
    }
    return false;
  },

  setAdminUser: (user: AdminUser) => {
    set({ isAdmin: true, adminUser: user });
  },

  clearAdmin: () => {
    set({ isAdmin: false, adminUser: null, stats: null });
  },

  fetchStats: async () => {
    set({ loading: true });
    try {
      // Get real user count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get teams count
      const { count: teamCount } = await supabase
        .from('teams')
        .select('*', { count: 'exact', head: true });

      // Get messages count
      const { count: messageCount } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true });

      // Get blog posts count
      const { count: postCount } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true });

      // Calculate monthly growth (simplified - comparing with last month)
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const { count: lastMonthUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', lastMonth.toISOString());

      const realStats: AdminStats = {
        totalUsers: userCount || 0,
        activeUsers: Math.floor((userCount || 0) * 0.7), // Estimate 70% active
        totalTeams: teamCount || 0,
        totalMessages: messageCount || 0,
        totalPosts: postCount || 0,
        monthlyGrowth: {
          users: lastMonthUsers ? ((lastMonthUsers / Math.max(userCount || 1, 1)) * 100) : 0,
          teams: 8.3, // Could implement real calculation
          posts: 15.2 // Could implement real calculation
        }
      };

      set({ stats: realStats });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thống kê admin",
        variant: "destructive"
      });
    } finally {
      set({ loading: false });
    }
  },

  getAllUsers: async () => {
    try {
      // Mock user data - in production, query from profiles table
      const mockUsers: AdminUser[] = [
        {
          id: '1',
          email: 'nguyen.van.a@example.com',
          displayName: 'Nguyễn Văn A',
          role: 'User',
          lastLogin: '2024-01-15T10:30:00Z',
          isActive: true,
          permissions: ['user:read', 'chat:write']
        },
        {
          id: '2',
          email: 'tran.thi.b@example.com',
          displayName: 'Trần Thị B',
          role: 'User',
          lastLogin: '2024-01-14T15:45:00Z',
          isActive: true,
          permissions: ['user:read', 'chat:write']
        },
        {
          id: '3',
          email: 'le.hoang.c@example.com',
          displayName: 'Lê Hoàng C',
          role: 'Premium User',
          lastLogin: '2024-01-13T09:20:00Z',
          isActive: false,
          permissions: ['user:read', 'chat:write', 'ai:access']
        },
        {
          id: '4',
          email: 'pham.minh.d@example.com',
          displayName: 'Phạm Minh D',
          role: 'User',
          lastLogin: '2024-01-12T14:15:00Z',
          isActive: true,
          permissions: ['user:read', 'chat:write']
        },
        {
          id: '5',
          email: 'hoang.thi.e@example.com',
          displayName: 'Hoàng Thị E',
          role: 'Moderator',
          lastLogin: '2024-01-11T11:30:00Z',
          isActive: true,
          permissions: ['user:read', 'chat:write', 'chat:moderate', 'post:moderate']
        }
      ];

      return mockUsers;
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách người dùng",
        variant: "destructive"
      });
      return [];
    }
  },

  updateUserStatus: async (userId: string, isActive: boolean) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Thành công",
        description: `Đã ${isActive ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản người dùng`
      });
      
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái người dùng",
        variant: "destructive"
      });
      return false;
    }
  },

  deleteUser: async (userId: string) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Thành công",
        description: "Đã xóa tài khoản người dùng"
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa tài khoản người dùng",
        variant: "destructive"
      });
      return false;
    }
  }
}));
