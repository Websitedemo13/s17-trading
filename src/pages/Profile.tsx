import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';
import { supabase } from '@/integrations/supabase/client';
import { Portfolio } from '@/types';
import ActivityFeed from '@/components/ActivityFeed';
import SettingsDialog from '@/components/SettingsDialog';
import {
  Pencil,
  Wallet,
  TrendingUp,
  TrendingDown,
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  Globe,
  Camera,
  Save,
  Eye,
  EyeOff,
  Download,
  Upload,
  Trash2,
  Key,
  AlertTriangle,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Link,
  Github,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Activity,
  Edit3,
  MoreHorizontal
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  location?: string;
  birth_date?: string;
  company?: string;
  website?: string;
  github_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  notification_email?: boolean;
  notification_push?: boolean;
  notification_sms?: boolean;
  theme_preference?: 'light' | 'dark' | 'system';
  language?: string;
  timezone?: string;
  currency?: string;
  privacy_profile?: 'public' | 'private' | 'friends';
  privacy_portfolio?: boolean;
  privacy_activity?: boolean;
  two_factor_enabled?: boolean;
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

const Profile = () => {
  const { user, signOut } = useAuthStore();
  const {
    profile,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    loading,
    exportUserData
  } = useProfileStore();
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [company, setCompany] = useState('');
  const [website, setWebsite] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  // Settings states
  const [notificationEmail, setNotificationEmail] = useState(true);
  const [notificationPush, setNotificationPush] = useState(true);
  const [notificationSms, setNotificationSms] = useState(false);
  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>('system');
  const [language, setLanguage] = useState('vi');
  const [timezone, setTimezone] = useState('Asia/Ho_Chi_Minh');
  const [currency, setCurrency] = useState('USD');
  const [privacyProfile, setPrivacyProfile] = useState<'public' | 'private' | 'friends'>('public');
  const [privacyPortfolio, setPrivacyPortfolio] = useState(false);
  const [privacyActivity, setPrivacyActivity] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
      fetchPortfolio();
    }
  }, [user, fetchProfile]);

  // Update form states when profile changes
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setPhone(profile.phone || '');
      setLocation(profile.location || '');
      setBirthDate(profile.birth_date || '');
      setCompany(profile.company || '');
      setWebsite(profile.website || '');
      setGithubUrl(profile.github_url || '');
      setTwitterUrl(profile.twitter_url || '');
      setLinkedinUrl(profile.linkedin_url || '');
      setFacebookUrl(profile.facebook_url || '');
      setInstagramUrl(profile.instagram_url || '');
      setNotificationEmail(profile.notification_email ?? true);
      setNotificationPush(profile.notification_push ?? true);
      setNotificationSms(profile.notification_sms ?? false);
      setThemePreference(profile.theme_preference || 'system');
      setLanguage(profile.language || 'vi');
      setTimezone(profile.timezone || 'Asia/Ho_Chi_Minh');
      setCurrency(profile.currency || 'USD');
      setPrivacyProfile(profile.privacy_profile || 'public');
      setPrivacyPortfolio(profile.privacy_portfolio ?? false);
      setPrivacyActivity(profile.privacy_activity ?? false);
      setTwoFactorEnabled(profile.two_factor_enabled ?? false);
    }
  }, [profile]);

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

  const handleUpdateProfile = async () => {
    if (!user) return;

    await updateProfile(user.id, {
      display_name: displayName,
      bio,
      phone,
      location,
      birth_date: birthDate,
      company,
      website,
      github_url: githubUrl,
      twitter_url: twitterUrl,
      linkedin_url: linkedinUrl,
      facebook_url: facebookUrl,
      instagram_url: instagramUrl,
      notification_email: notificationEmail,
      notification_push: notificationPush,
      notification_sms: notificationSms,
      theme_preference: themePreference,
      language,
      timezone,
      currency,
      privacy_profile: privacyProfile,
      privacy_portfolio: privacyPortfolio,
      privacy_activity: privacyActivity,
      two_factor_enabled: twoFactorEnabled
    });
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu phải có ít nhất 8 ký tự",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đổi mật khẩu thành công!"
      });

      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Lỗi",
        description: "Không thể đổi mật khẩu",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    await uploadAvatar(user.id, file);
  };

  const deleteAccount = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.')) {
      return;
    }

    setLoading(true);
    try {
      // Delete user data first
      await supabase.from('profiles').delete().eq('id', user?.id);
      await supabase.from('portfolios').delete().eq('user_id', user?.id);
      
      // Sign out and redirect
      await signOut();
      
      toast({
        title: "Thành công",
        description: "Tài khoản đã được xóa thành công",
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa tài khoản",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const data = {
        profile,
        portfolio,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `profile-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Thành công",
        description: "Xuất dữ liệu thành công!"
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xuất dữ liệu",
        variant: "destructive"
      });
    }
  };

  const totalPortfolioValue = portfolio.reduce((total, item) => {
    return total + (Number(item.amount) * Number(item.avg_price));
  }, 0);

  const totalPortfolioPL = portfolio.reduce((total, item) => {
    // Mock current price calculation for demo
    const currentPrice = Number(item.avg_price) * (1 + (Math.random() - 0.5) * 0.2);
    const currentValue = Number(item.amount) * currentPrice;
    const costBasis = Number(item.amount) * Number(item.avg_price);
    return total + (currentValue - costBasis);
  }, 0);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
          Hồ sơ cá nhân
        </h1>
        <p className="text-muted-foreground text-lg">
          Quản lý thông tin cá nhân, cài đặt và bảo mật tài khoản
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto p-1">
          <TabsTrigger value="overview" className="flex items-center gap-2 py-3">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Tổng quan</span>
          </TabsTrigger>
          <TabsTrigger value="personal" className="flex items-center gap-2 py-3">
            <Pencil className="h-4 w-4" />
            <span className="hidden sm:inline">Thông tin</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2 py-3">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Cài đặt</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 py-3">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Bảo mật</span>
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2 py-3">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Portfolio</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="glass-card lg:col-span-1">
              <CardHeader className="text-center pb-2">
                <div className="relative mx-auto mb-4">
                  <Avatar className="h-24 w-24 mx-auto border-4 border-primary/20">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2">
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors">
                        <Camera className="h-4 w-4" />
                      </div>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </div>
                </div>
                <CardTitle className="text-xl">
                  {profile?.display_name || 'Chưa có tên'}
                </CardTitle>
                <CardDescription className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile?.bio && (
                  <p className="text-sm text-center text-muted-foreground">
                    {profile.bio}
                  </p>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-lg">{portfolio.length}</p>
                    <p className="text-muted-foreground">Tài sản</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-lg">
                      {new Date(user.created_at || '').toLocaleDateString('vi-VN', { 
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-muted-foreground">Tham gia</p>
                  </div>
                </div>

                {(profile?.location || profile?.company) && (
                  <Separator />
                )}

                <div className="space-y-2 text-sm">
                  {profile?.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile?.company && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.company}</span>
                    </div>
                  )}
                  {profile?.website && (
                    <div className="flex items-center gap-2">
                      <Link className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={profile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate"
                      >
                        {profile.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                {(profile?.github_url || profile?.twitter_url || profile?.linkedin_url) && (
                  <>
                    <Separator />
                    <div className="flex justify-center gap-3">
                      {profile?.github_url && (
                        <a 
                          href={profile.github_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Github className="h-5 w-5" />
                        </a>
                      )}
                      {profile?.twitter_url && (
                        <a 
                          href={profile.twitter_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Twitter className="h-5 w-5" />
                        </a>
                      )}
                      {profile?.linkedin_url && (
                        <a 
                          href={profile.linkedin_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                      {profile?.facebook_url && (
                        <a 
                          href={profile.facebook_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Facebook className="h-5 w-5" />
                        </a>
                      )}
                      {profile?.instagram_url && (
                        <a 
                          href={profile.instagram_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Instagram className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Portfolio Summary */}
            <Card className="glass-card lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      Portfolio Overview
                    </CardTitle>
                    <CardDescription>
                      Tổng quan về danh mục đầu tư của bạn
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveTab('portfolio')}
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 rounded-lg bg-primary/5">
                    <p className="text-2xl font-bold text-primary">
                      ${totalPortfolioValue.toLocaleString('en-US', { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">Tổng giá trị</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-success/5">
                    <p className={`text-2xl font-bold ${totalPortfolioPL >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {totalPortfolioPL >= 0 ? '+' : ''}${totalPortfolioPL.toLocaleString('en-US', { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">P&L</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-info/5">
                    <p className="text-2xl font-bold text-info">
                      {portfolio.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Tài sản</p>
                  </div>
                </div>

                {portfolio.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {portfolio.slice(0, 5).map((item) => {
                      const currentValue = Number(item.amount) * Number(item.avg_price);
                      const isPositive = currentValue > 0;
                      
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="font-bold text-primary text-sm">
                                {item.symbol.slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{item.symbol.toUpperCase()}</p>
                              <p className="text-xs text-muted-foreground">
                                {Number(item.amount).toFixed(8)} coins
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-medium text-sm">
                              ${currentValue.toFixed(2)}
                            </p>
                            <div className="flex items-center gap-1 justify-end">
                              {isPositive ? (
                                <TrendingUp className="h-3 w-3 text-success" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-destructive" />
                              )}
                              <p className="text-xs text-muted-foreground">
                                @${Number(item.avg_price).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {portfolio.length > 5 && (
                      <div className="text-center pt-3">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setActiveTab('portfolio')}
                        >
                          Xem thêm {portfolio.length - 5} tài sản
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">Chưa có dữ liệu portfolio</p>
                    <p className="text-sm">Thêm các giao dịch để theo dõi danh mục đầu tư</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin cá nhân
              </CardTitle>
              <CardDescription>
                Cập nhật thông tin cá nhân và liên kết mạng xã hội
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Tên hiển thị</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Nhập tên hiển thị"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user.email || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Tiểu sử</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Viết vài dòng về bản thân..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+84 xxx xxx xxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Địa chỉ</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Thành phố, Quốc gia"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Ngày sinh</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Công ty</Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Tên công ty"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Liên kết mạng xã hội</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="github">GitHub</Label>
                    <Input
                      id="github"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      value={twitterUrl}
                      onChange={(e) => setTwitterUrl(e.target.value)}
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                      placeholder="https://facebook.com/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={updateProfile} disabled={loading}>
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Lưu thay đổi
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notifications */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Thông báo
                </CardTitle>
                <CardDescription>
                  Quản lý cách bạn nhận thông báo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="notif-email">Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông báo qua email
                    </p>
                  </div>
                  <Switch
                    id="notif-email"
                    checked={notificationEmail}
                    onCheckedChange={setNotificationEmail}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="notif-push">Push notification</Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông báo đẩy trên trình duyệt
                    </p>
                  </div>
                  <Switch
                    id="notif-push"
                    checked={notificationPush}
                    onCheckedChange={setNotificationPush}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="notif-sms">SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông báo qua tin nhắn
                    </p>
                  </div>
                  <Switch
                    id="notif-sms"
                    checked={notificationSms}
                    onCheckedChange={setNotificationSms}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Giao diện
                </CardTitle>
                <CardDescription>
                  Tùy chỉnh giao diện và hiển thị
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Chủ đề</Label>
                  <Select value={themePreference} onValueChange={(value: 'light' | 'dark' | 'system') => setThemePreference(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Sáng
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Tối
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          Theo hệ thống
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ngôn ngữ</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Múi giờ</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Ho_Chi_Minh">GMT+7 (Việt Nam)</SelectItem>
                      <SelectItem value="Asia/Tokyo">GMT+9 (Tokyo)</SelectItem>
                      <SelectItem value="America/New_York">GMT-5 (New York)</SelectItem>
                      <SelectItem value="Europe/London">GMT+0 (London)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tiền tệ</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="VND">VND (₫)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Privacy */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Quyền riêng tư
                </CardTitle>
                <CardDescription>
                  Kiểm soát ai có thể xem thông tin của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Hiển thị hồ sơ</Label>
                  <Select value={privacyProfile} onValueChange={(value: 'public' | 'private' | 'friends') => setPrivacyProfile(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Công khai</SelectItem>
                      <SelectItem value="friends">Chỉ bạn bè</SelectItem>
                      <SelectItem value="private">Riêng tư</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="privacy-portfolio">Ẩn portfolio</Label>
                    <p className="text-sm text-muted-foreground">
                      Không hiển thị danh mục đầu tư cho người khác
                    </p>
                  </div>
                  <Switch
                    id="privacy-portfolio"
                    checked={privacyPortfolio}
                    onCheckedChange={setPrivacyPortfolio}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="privacy-activity">Ẩn hoạt động</Label>
                    <p className="text-sm text-muted-foreground">
                      Không hiển thị hoạt động giao dịch
                    </p>
                  </div>
                  <Switch
                    id="privacy-activity"
                    checked={privacyActivity}
                    onCheckedChange={setPrivacyActivity}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Quản lý dữ liệu
                </CardTitle>
                <CardDescription>
                  Xuất và quản lý dữ liệu cá nhân
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" onClick={exportData} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Xuất dữ liệu
                </Button>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Dữ liệu sẽ được xuất dưới định dạng JSON bao gồm thông tin hồ sơ và portfolio.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button onClick={updateProfile} disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Lưu cài đặt
            </Button>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Change Password */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Đổi mật khẩu
                </CardTitle>
                <CardDescription>
                  Cập nhật mật khẩu để bảo mật tài khoản
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={passwordVisible ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                    >
                      {passwordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Mật khẩu mới</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Xác nhận mật khẩu mới"
                  />
                </div>
                <Button 
                  onClick={changePassword} 
                  disabled={loading || !newPassword || !confirmPassword}
                  className="w-full"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Key className="h-4 w-4 mr-2" />
                  )}
                  Đổi mật khẩu
                </Button>
              </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Xác thực hai yếu tố
                </CardTitle>
                <CardDescription>
                  Tăng cường bảo mật với xác thực 2FA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="2fa">Kích hoạt 2FA</Label>
                    <p className="text-sm text-muted-foreground">
                      Sử dụng ứng dụng authenticator
                    </p>
                  </div>
                  <Switch
                    id="2fa"
                    checked={twoFactorEnabled}
                    onCheckedChange={setTwoFactorEnabled}
                  />
                </div>
                
                {twoFactorEnabled && (
                  <Alert>
                    <Smartphone className="h-4 w-4" />
                    <AlertDescription>
                      Để hoàn tất thiết lập 2FA, vui lòng quét mã QR bằng ứng dụng Google Authenticator hoặc Authy.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label>Thiết bị đã đăng nhập</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        <Monitor className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Trình duyệt hiện tại</p>
                          <p className="text-sm text-muted-foreground">
                            {navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                             navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                             navigator.userAgent.includes('Safari') ? 'Safari' : 'Unknown'} • 
                            {new Date().toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">Hiện tại</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Trạng thái tài khoản
                </CardTitle>
                <CardDescription>
                  Thông tin xác thực và bảo mật
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Email đã xác thực</span>
                    </div>
                    <Badge variant={user.email_confirmed_at ? "default" : "secondary"}>
                      {user.email_confirmed_at ? "Đã xác thực" : "Chưa xác thực"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Số điện thoại</span>
                    </div>
                    <Badge variant={phone ? "default" : "secondary"}>
                      {phone ? "Đã thêm" : "Chưa thêm"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Xác thực 2FA</span>
                    </div>
                    <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
                      {twoFactorEnabled ? "Đã kích hoạt" : "Chưa kích hoạt"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="glass-card border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Vùng nguy hiểm
                </CardTitle>
                <CardDescription>
                  Các hành động không thể hoàn tác
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Xóa tài khoản sẽ xóa vĩnh viễn tất cả dữ liệu của bạn. Hành động này không thể hoàn tác.
                  </AlertDescription>
                </Alert>
                <Button 
                  variant="destructive" 
                  onClick={deleteAccount}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Xóa tài khoản
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Danh mục đầu tư
              </CardTitle>
              <CardDescription>
                Chi tiết danh mục đầu tư và hiệu suất
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 rounded-lg bg-primary/5">
                  <p className="text-2xl font-bold text-primary">
                    ${totalPortfolioValue.toLocaleString('en-US', { 
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">Tổng giá trị</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-success/5">
                  <p className={`text-2xl font-bold ${totalPortfolioPL >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {totalPortfolioPL >= 0 ? '+' : ''}${totalPortfolioPL.toLocaleString('en-US', { 
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">P&L</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-info/5">
                  <p className="text-2xl font-bold text-info">
                    {portfolio.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Tài sản</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-warning/5">
                  <p className="text-2xl font-bold text-warning">
                    {totalPortfolioPL >= 0 && totalPortfolioValue > 0 ? '+' : ''}{((totalPortfolioPL / totalPortfolioValue) * 100).toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground">ROI</p>
                </div>
              </div>

              {portfolio.length > 0 ? (
                <div className="space-y-4">
                  {portfolio.map((item) => {
                    const currentValue = Number(item.amount) * Number(item.avg_price);
                    const isPositive = currentValue > 0;
                    
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-bold text-primary">
                              {item.symbol.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-lg">{item.symbol.toUpperCase()}</p>
                            <p className="text-sm text-muted-foreground">
                              {Number(item.amount).toFixed(8)} coins
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            ${currentValue.toFixed(2)}
                          </p>
                          <div className="flex items-center gap-2 justify-end">
                            {isPositive ? (
                              <TrendingUp className="h-4 w-4 text-success" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-destructive" />
                            )}
                            <p className="text-sm text-muted-foreground">
                              @${Number(item.avg_price).toFixed(2)}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.created_at || '').toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Wallet className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Chưa có dữ liệu portfolio</p>
                  <p className="text-sm">Thêm các giao dịch để theo dõi danh mục đầu tư của bạn</p>
                  <Button className="mt-4" onClick={() => window.location.href = '/portfolio'}>
                    Thêm giao dịch
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
