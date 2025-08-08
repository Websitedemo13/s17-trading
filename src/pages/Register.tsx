import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ thông tin",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu phải có ít nhất 6 ký tự",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const result = await signUp(email, password);
    
    if (result.error) {
      toast({
        title: "Đăng ký thất bại",
        description: result.error,
        variant: "destructive"
      });
    } else {
      navigate('/login');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 animated-bg opacity-20"></div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-float"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-accent/20 rounded-full blur-xl animate-float animate-delay-200"></div>
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-success/20 rounded-full blur-xl animate-float animate-delay-400"></div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md floating-card animate-slide-up-fade">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center mb-4 animate-bounce-in animate-delay-200">
              <span className="text-2xl font-bold text-white">S17</span>
            </div>
            <CardTitle className="text-3xl font-bold text-gradient animate-slide-down animate-delay-300">
              Đăng ký
            </CardTitle>
            <CardDescription className="text-lg animate-slide-down animate-delay-400">
              Tạo tài khoản S17 Social Trading Platform
            </CardDescription>
          </CardHeader>
        
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3 animate-slide-right animate-delay-500">
                <label className="text-sm font-semibold text-foreground">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="h-12 bg-background/50 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                />
              </div>
              
              <div className="space-y-3 animate-slide-right animate-delay-600">
                <label className="text-sm font-semibold text-foreground">Mật khẩu</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="h-12 bg-background/50 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-primary/10 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-3 animate-slide-right animate-delay-700">
                <label className="text-sm font-semibold text-foreground">Xác nhận mật khẩu</label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="h-12 bg-background/50 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 btn-premium text-lg font-semibold animate-scale-in animate-delay-800"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-3" />
                    Đang xử lý...
                  </>
                ) : (
                  'Tạo tài khoản'
                )}
              </Button>
            </form>

            <div className="relative animate-fade-in animate-delay-900">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-primary/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground font-medium">Hoặc</span>
              </div>
            </div>

            <div className="text-center animate-slide-up animate-delay-1000">
              <p className="text-sm text-muted-foreground">
                Đã có tài khoản?{' '}
                <Link 
                  to="/login" 
                  className="text-primary hover:text-primary-glow font-semibold transition-colors duration-300 hover:underline"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;