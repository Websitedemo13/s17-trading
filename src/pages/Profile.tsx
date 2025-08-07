import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { Portfolio } from '@/types';
import { Pencil, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Profile = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchPortfolio();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data);
      setDisplayName(data?.display_name || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchPortfolio = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPortfolio(data || []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: displayName,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Cập nhật hồ sơ thành công!"
      });

      setEditingProfile(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật hồ sơ",
        variant: "destructive"
      });
    }
  };

  const totalPortfolioValue = portfolio.reduce((total, item) => {
    return total + (Number(item.amount) * Number(item.avg_price));
  }, 0);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">
          Quản lý thông tin cá nhân và danh mục đầu tư
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Thông tin cá nhân
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingProfile(!editingProfile)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tên hiển thị</label>
              {editingProfile ? (
                <div className="space-y-2">
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Nhập tên hiển thị"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={updateProfile}>
                      Lưu
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setEditingProfile(false)}
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm">
                  {profile?.display_name || 'Chưa có tên hiển thị'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Ngày tham gia</p>
              <p className="text-sm">
                {new Date(user.created_at || '').toLocaleDateString('vi-VN')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Overview */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Danh mục đầu tư
            </CardTitle>
            <CardDescription>
              Tổng giá trị: ${totalPortfolioValue.toLocaleString('en-US', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {portfolio.length > 0 ? (
              <div className="space-y-4">
                {portfolio.map((item) => {
                  const currentValue = Number(item.amount) * Number(item.avg_price);
                  const isPositive = currentValue > 0;
                  
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-bold text-primary">
                            {item.symbol.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{item.symbol.toUpperCase()}</p>
                          <p className="text-sm text-muted-foreground">
                            {Number(item.amount).toFixed(8)} coins
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium">
                          ${currentValue.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-1">
                          {isPositive ? (
                            <TrendingUp className="h-3 w-3 text-success" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-destructive" />
                          )}
                          <p className="text-sm text-muted-foreground">
                            @${Number(item.avg_price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Wallet className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Chưa có dữ liệu danh mục đầu tư</p>
                <p className="text-sm">Thêm các giao dịch để theo dõi portfolio</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;