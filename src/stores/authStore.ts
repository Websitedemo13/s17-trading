import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

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
      (event, session) => {
        console.log('Auth state changed:', event, session);
        set({ 
          session, 
          user: session?.user ?? null,
          loading: false
        });
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ 
        session, 
        user: session?.user ?? null,
        loading: false
      });
    });

    return () => subscription.unsubscribe();
  },
}));