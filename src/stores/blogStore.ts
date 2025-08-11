import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  status: 'draft' | 'published';
  slug: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

interface BlogState {
  posts: BlogPost[];
  loading: boolean;
  
  // CRUD operations
  fetchPosts: () => Promise<void>;
  createPost: (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updatePost: (id: string, updates: Partial<BlogPost>) => Promise<boolean>;
  deletePost: (id: string) => Promise<boolean>;
  publishPost: (id: string) => Promise<boolean>;
  unpublishPost: (id: string) => Promise<boolean>;
}

export const useBlogStore = create<BlogState>((set, get) => ({
  posts: [],
  loading: false,

  fetchPosts: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ posts: data || [] });
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải bài viết",
        variant: "destructive"
      });
    } finally {
      set({ loading: false });
    }
  },

  createPost: async (post) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .insert({
          ...post,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã tạo bài viết mới"
      });

      // Refresh posts list
      get().fetchPosts();
      return true;
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo bài viết",
        variant: "destructive"
      });
      return false;
    }
  },

  updatePost: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã cập nhật bài viết"
      });

      // Update local state
      const posts = get().posts.map(post => 
        post.id === id ? { ...post, ...updates } : post
      );
      set({ posts });

      return true;
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật bài viết",
        variant: "destructive"
      });
      return false;
    }
  },

  deletePost: async (id) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã xóa bài viết"
      });

      // Remove from local state
      const posts = get().posts.filter(post => post.id !== id);
      set({ posts });

      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa bài viết",
        variant: "destructive"
      });
      return false;
    }
  },

  publishPost: async (id) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã xuất bản bài viết"
      });

      // Update local state
      const posts = get().posts.map(post => 
        post.id === id 
          ? { ...post, status: 'published' as const, published_at: new Date().toISOString() }
          : post
      );
      set({ posts });

      return true;
    } catch (error) {
      console.error('Error publishing post:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xuất bản bài viết",
        variant: "destructive"
      });
      return false;
    }
  },

  unpublishPost: async (id) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          status: 'draft',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã hủy xuất bản bài viết"
      });

      // Update local state
      const posts = get().posts.map(post => 
        post.id === id ? { ...post, status: 'draft' as const } : post
      );
      set({ posts });

      return true;
    } catch (error) {
      console.error('Error unpublishing post:', error);
      toast({
        title: "Lỗi",
        description: "Không thể hủy xuất bản bài viết",
        variant: "destructive"
      });
      return false;
    }
  }
}));
