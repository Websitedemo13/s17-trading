import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuthStore();

  useEffect(() => {
    // Check if we have the required tokens and set session
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');
    
    if (!accessToken || !refreshToken || type !== 'recovery') {
      toast({
        title: "Link không hợp lệ",
        description: "Link reset mật khẩu không hợp lệ hoặc đã hết hạn.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    // Set session with the tokens from URL
    const setSession = async () => {
      setValidating(true);
      try {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        
        if (error) {
          console.error('Error setting session:', error);
          toast({
            title: "Lỗi xác thực",
            description: "Không thể xác thực link reset. Vui lòng thử lại.",
            variant: "destructive",
          });
          navigate('/login');
        } else {
          setIsValidToken(true);
          toast({
            title: "Xác thực thành công",
            description: "Bạn có thể đặt mật khẩu mới ngay bây giờ.",
          });
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Có lỗi xảy ra",
          description: "Vui lòng thử lại từ email.",
          variant: "destructive",
        });
        navigate('/login');
      } finally {
        setValidating(false);
      }
    };

    setSession();
  }, [searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Mật khẩu không khớp",
        description: "Vui lòng nhập lại mật khẩu xác nhận.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Mật khẩu quá ngắn",
        description: "Mật khẩu phải có ít nhất 6 ký tự.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const result = await resetPassword(password);
      
      if (result.error) {
        toast({
          title: "Lỗi đổi mật khẩu",
          description: result.error,
          variant: "destructive",
        });
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Có lỗi xảy ra",
        description: "Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4">
        <div className="w-full max-w-md animate-scale-in">
          <Card className="border-primary/20 shadow-elegant bg-background/80 backdrop-blur-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Đang xác thực...</h3>
                  <p className="text-sm text-muted-foreground">
                    Vui lòng chờ trong khi chúng tôi xác thực link reset mật khẩu của bạn.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4">
      <div className="w-full max-w-md animate-scale-in">
        <Card className="border-primary/20 shadow-elegant bg-background/80 backdrop-blur-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
              <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Đặt lại mật khẩu
              </CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">
              Link xác thực hợp lệ. Nhập mật khẩu mới cho tài khoản của bạn.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    required
                    disabled={!isValidToken}
                    className="pr-10 border-primary/20 focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    required
                    disabled={!isValidToken}
                    className="pr-10 border-primary/20 focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !isValidToken || !password || !confirmPassword}
                className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang cập nhật mật khẩu...
                  </>
                ) : (
                  'Cập nhật mật khẩu mới'
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Quay lại đăng nhập
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;