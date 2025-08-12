import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';
import { useAdminStore } from './adminStore';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ error?: string }>;
  resetPassword: (password: string) => Promise<{ error?: string }>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,

  signIn: async (email: string, password: string) => {
    try {
      // Check for admin account first
      if (email === 'quachthanhlong2k3@gmail.com' && password === '13072003') {
        const adminStore = useAdminStore.getState();
        const isAdmin = adminStore.checkAdminStatus(email);

        if (isAdmin) {
          // For admin, create a mock user session
          const mockUser = {
            id: 'admin-' + email.split('@')[0],
            email: email,
            user_metadata: {
              display_name: 'Super Admin',
              avatar_url: null
            }
          } as User;

          set({ user: mockUser, session: { user: mockUser } as Session });

          toast({
            title: "Đăng nhập Admin thành công",
            description: "Chào mừng Super Admin!",
          });

          return {};
        }
      }

      // Regular user authentication
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn quay trở lại!",
      });

      return {};
    } catch (error) {
      return { error: "Có lỗi xảy ra khi đăng nhập" };
    }
  },

  signUp: async (email: string, password: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        return { error: error.message };
      }

      toast({
        title: "Đăng ký thành công",
        description: "Vui lòng kiểm tra email để xác thực tài khoản.",
      });

      return {};
    } catch (error) {
      return { error: "Có lỗi xảy ra khi đăng ký" };
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
    toast({
      title: "Đăng xuất thành công",
      description: "Hẹn gặp lại bạn!",
    });
  },

  forgotPassword: async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      if (error) {
        return { error: error.message };
      }

      toast({
        title: "Email đã được gửi",
        description: "Vui lòng kiểm tra email để reset mật khẩu.",
      });

      return {};
    } catch (error) {
      return { error: "Có lỗi xảy ra khi gửi email reset mật khẩu" };
    }
  },

  resetPassword: async (password: string) => {
    try {
      // Get current session to verify user is authenticated via reset link
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return { error: "Phiên đăng nhập không hợp lệ. Vui lòng thử lại từ email." };
      }

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        return { error: error.message };
      }

      toast({
        title: "Đổi mật khẩu thành công",
        description: "Mật khẩu của bạn đã được cập nhật.",
      });

      return {};
    } catch (error) {
      return { error: "Có lỗi xảy ra khi đổi mật khẩu" };
    }
  },

  initialize: () => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);

        // If user signed in, ensure profile exists
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            // First check if profile exists
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', session.user.id)
              .single();

            // If no profile exists, create one
            if (!existingProfile) {
              await supabase
                .from('profiles')
                .insert({
                  id: session.user.id,
                  email: session.user.email,
                  display_name: session.user.user_metadata?.display_name ||
                               session.user.email?.split('@')[0] || 'User',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
            }
          } catch (error) {
            console.warn('Could not ensure profile exists:', error);
            // Fallback toast notification
            toast({
              title: "Không thể tạo profile",
              description: "Vui lòng thử đăng nhập lại",
              variant: "destructive"
            });
          }
        }

        set({
          session,
          user: session?.user ?? null,
          loading: false
        });
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      // If user is already signed in, ensure profile exists
      if (session?.user) {
        try {
          await supabase.rpc('ensure_profile_exists', {
            user_id: session.user.id,
            user_email: session.user.email
          });
        } catch (error) {
          console.warn('Could not ensure profile exists:', error);
        }
      }

      set({
        session,
        user: session?.user ?? null,
        loading: false
      });
    });

    return () => subscription.unsubscribe();
  },
}));
