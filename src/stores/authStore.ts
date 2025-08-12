import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';
import { useAdminStore } from './adminStore';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdminSession: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ error?: string }>;
  resetPassword: (password: string) => Promise<{ error?: string }>;
  initialize: () => (() => void) | undefined;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  isAdminSession: false,

  signIn: async (email: string, password: string) => {
    try {
      // Check for admin account first
      if (email === 'quachthanhlong2k3@gmail.com' && password === '13072003') {
        try {
          // For admin, create a mock user session
          const mockUser = {
            id: 'admin-' + email.split('@')[0],
            email: email,
            user_metadata: {
              display_name: 'Super Admin',
              avatar_url: null
            },
            aud: 'authenticated',
            role: 'authenticated',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as User;

          const mockSession = {
            user: mockUser,
            access_token: 'mock-admin-token',
            token_type: 'bearer',
            expires_in: 3600,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            refresh_token: 'mock-refresh-token'
          } as Session;

          // Set admin status in the admin store
          const adminStore = useAdminStore.getState();
          const isAdminValid = adminStore.checkAdminStatus(email);

          if (isAdminValid) {
            // Set user state first with admin flag
            set({
              user: mockUser,
              session: mockSession,
              loading: false,
              isAdminSession: true
            });

            // Delay toast to ensure state is updated
            setTimeout(() => {
              toast({
                title: "Đăng nhập Admin thành công",
                description: "Chào mừng Super Admin!",
              });
            }, 100);

            return {};
          } else {
            return { error: "Tài khoản admin không hợp lệ" };
          }
        } catch (error) {
          console.error('Admin login error:', error);
          return { error: "Lỗi đăng nhập admin" };
        }
      }

      // Regular user authentication with timeout
      const authPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const { error } = await Promise.race([
        authPromise,
        new Promise<{ error: { message: string } }>((_, reject) =>
          setTimeout(() => reject({ error: { message: 'Timeout kết nối. Vui lòng thử lại.' } }), 10000)
        )
      ]);

      if (error) {
        // Provide user-friendly error messages
        const errorMessage = error.message.includes('Invalid login')
          ? 'Email hoặc mật khẩu không đúng'
          : error.message.includes('Email not confirmed')
          ? 'Vui lòng xác thực email trước khi đăng nhập'
          : error.message.includes('Too many requests')
          ? 'Quá nhiều lần thử. Vui lòng đợi một chút rồi thử lại'
          : error.message;
        return { error: errorMessage };
      }

      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn quay trở lại!",
      });

      return {};
    } catch (error: any) {
      console.error('Sign in error:', error);
      const errorMessage = error?.error?.message ||
                          error?.message ||
                          "Có lỗi xảy ra khi đăng nhập. Vui lòng kiểm tra kết nối mạng.";
      return { error: errorMessage };
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
    try {
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Signout timeout')), 5000)
        )
      ]);
    } catch (error) {
      console.warn('Signout error (non-blocking):', error);
    }

    // Always clear local state regardless of Supabase response
    set({ user: null, session: null, loading: false, isAdminSession: false });

    // Clear admin state if admin is logging out
    const adminStore = useAdminStore.getState();
    if (adminStore.isAdmin) {
      adminStore.clearAdmin();
    }

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
        description: "Vui l��ng kiểm tra email để reset mật khẩu.",
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

        // Check if current session is admin to prevent override
        const currentState = get();
        const isCurrentAdminSession = currentState.isAdminSession;

        // Don't override admin session with null session
        if (isCurrentAdminSession && !session) {
          console.log('Preserving admin session, ignoring auth state change');
          return;
        }

        // Update auth state immediately to prevent UI freezing
        set({
          session,
          user: session?.user ?? null,
          loading: false,
          isAdminSession: false // Reset admin flag for regular auth
        });

        // If user signed in, try to ensure profile exists (non-blocking)
        if (event === 'SIGNED_IN' && session?.user) {
          // Run profile creation in background without blocking login
          setTimeout(async () => {
            try {
              // First check if profile exists with timeout
              const profileQuery = supabase
                .from('profiles')
                .select('id')
                .eq('id', session.user.id)
                .single();

              const { data: existingProfile } = await Promise.race([
                profileQuery,
                new Promise((_, reject) =>
                  setTimeout(() => reject(new Error('Profile check timeout')), 3000)
                )
              ]);

              // If no profile exists, create one with timeout
              if (!existingProfile) {
                const insertQuery = supabase
                  .from('profiles')
                  .insert({
                    id: session.user.id,
                    email: session.user.email,
                    display_name: session.user.user_metadata?.display_name ||
                                 session.user.email?.split('@')[0] || 'User',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  });

                await Promise.race([
                  insertQuery,
                  new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Profile creation timeout')), 3000)
                  )
                ]);
              }
            } catch (error) {
              console.warn('Could not ensure profile exists (non-blocking):', error);
              // Don't show error toast for profile creation issues
              // as they don't block the login process
            }
          }, 100);
        }
      }
    );

    // Get initial session with timeout
    const initializeSession = async () => {
      try {
        const sessionPromise = supabase.auth.getSession();
        const { data: { session } } = await Promise.race([
          sessionPromise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Session fetch timeout')), 5000)
          )
        ]);

        // Check if current session is admin to prevent override
        const currentState = get();
        const isCurrentAdminSession = currentState.isAdminSession;

        if (isCurrentAdminSession) {
          console.log('Preserving admin session during initialization');
          set({ loading: false }); // Only update loading
          return;
        }

        // Update state immediately
        set({
          session,
          user: session?.user ?? null,
          loading: false,
          isAdminSession: false // Reset admin flag for regular auth
        });

        // Handle profile creation in background if needed
        if (session?.user) {
          setTimeout(async () => {
            try {
              const { data: existingProfile } = await Promise.race([
                supabase
                  .from('profiles')
                  .select('id')
                  .eq('id', session.user.id)
                  .single(),
                new Promise((_, reject) =>
                  setTimeout(() => reject(new Error('Profile check timeout')), 3000)
                )
              ]);

              if (!existingProfile) {
                await Promise.race([
                  supabase
                    .from('profiles')
                    .insert({
                      id: session.user.id,
                      email: session.user.email,
                      display_name: session.user.user_metadata?.display_name ||
                                   session.user.email?.split('@')[0] || 'User',
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    }),
                  new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Profile creation timeout')), 3000)
                  )
                ]);
              }
            } catch (error) {
              console.warn('Background profile setup failed (non-blocking):', error);
            }
          }, 100);
        }
      } catch (error) {
        console.error('Session initialization failed:', error);

        // Check if current session is admin before clearing
        const currentState = get();
        if (currentState.isAdminSession) {
          console.log('Preserving admin session despite initialization error');
          set({ loading: false }); // Only update loading
          return;
        }

        // Set loading to false even if session fetch fails
        set({
          session: null,
          user: null,
          loading: false,
          isAdminSession: false
        });
      }
    };

    initializeSession();

    return () => subscription.unsubscribe();
  },
}));
