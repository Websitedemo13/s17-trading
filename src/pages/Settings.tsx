import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { useProfileStore } from '@/stores/profileStore';
import { useLanguage, useTranslation } from '@/stores/i18nStore';
import { supabase } from '@/integrations/supabase/client';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Bug, 
  MessageSquare, 
  Shield, 
  Bell, 
  Moon, 
  Sun, 
  Monitor,
  Mail,
  Phone,
  Globe,
  Camera,
  Lock,
  FileText,
  HelpCircle,
  Heart,
  Zap,
  Save,
  Download,
  Upload,
  Trash2,
  Key,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  User,
  CreditCard,
  Smartphone,
  Laptop,
  Wifi,
  Database,
  BarChart3,
  Calendar,
  Clock,
  Link,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Facebook
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const Settings = () => {
  const { user, signOut } = useAuthStore();
  const { theme, setTheme, primaryColor, setPrimaryColor } = useThemeStore();
  const { profile, updateProfile, changePassword, loading } = useProfileStore();
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage();
  const { t } = useTranslation();
  
  // Profile states
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  
  // Security states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  // Notification states
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false,
    updates: true,
    security: true,
    social: false
  });
  
  // Privacy states
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    allowInvites: true
  });
  
  // Performance states
  const [preferences, setPreferences] = useState({
    autoSave: true,
    highContrast: false,
    reducedMotion: false,
    compactMode: false,
    showTooltips: true
  });

  // Load profile data
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setPhone(profile.phone || '');
      setLocation(profile.location || '');
      setWebsite(profile.website || '');
      setGithubUrl(profile.github_url || '');
      setTwitterUrl(profile.twitter_url || '');
      setLinkedinUrl(profile.linkedin_url || '');
      setTwoFactorEnabled(profile.two_factor_enabled || false);
      
      // Set notification preferences
      setNotifications(prev => ({
        ...prev,
        email: profile.notification_email ?? true,
        push: profile.notification_push ?? true,
        marketing: false
      }));
      
      // Set privacy preferences
      setPrivacy(prev => ({
        ...prev,
        profileVisibility: profile.privacy_profile || 'public',
        showEmail: !profile.privacy_activity,
        allowMessages: true
      }));
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user) return;

    const success = await updateProfile(user.id, {
      display_name: displayName,
      bio,
      phone,
      location,
      website,
      github_url: githubUrl,
      twitter_url: twitterUrl,
      linkedin_url: linkedinUrl,
      notification_email: notifications.email,
      notification_push: notifications.push,
      privacy_profile: privacy.profileVisibility as 'public' | 'private' | 'friends'
    });

    if (success) {
      toast({
        title: "Thành công",
        description: "Đã lưu cài đặt profile!"
      });
    }
  };

  const handleChangePassword = async () => {
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

    const success = await changePassword(currentPassword, newPassword);
    if (success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "Kích thước file phải nhỏ hơn 2MB",
        variant: "destructive"
      });
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      toast({
        title: "Thành công",
        description: "Đ�� cập nhật ảnh đại diện!"
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải lên ảnh đại diện",
        variant: "destructive"
      });
    }
  };

  const exportSettings = () => {
    const settingsData = {
      profile: { displayName, bio, phone, location, website },
      notifications,
      privacy,
      preferences,
      theme,
      language: currentLanguage,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(settingsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `s17-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Thành công",
      description: "Đã xuất cài đặt thành công!"
    });
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength(newPassword);

  if (!user) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Vui lòng đăng nhập để truy cập cài đặt</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Cài đặt hệ thống
            </h1>
            <p className="text-muted-foreground mt-1">
              Quản lý tài khoản, bảo mật và tùy chỉnh trải nghiệm của bạn
            </p>
          </div>
          <Button onClick={exportSettings} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Xuất cài đặt
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto p-1">
            <TabsTrigger value="profile" className="flex items-center gap-2 py-3">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Hồ sơ</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 py-3">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Bảo mật</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 py-3">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Thông báo</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2 py-3">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Giao diện</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2 py-3">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Riêng tư</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2 py-3">
              <SettingsIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Nâng cao</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Avatar & Basic Info */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Ảnh đại diện
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24 border-4 border-primary/20">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <p className="font-medium">{displayName || user.email?.split('@')[0]}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Tải lên ảnh mới
                        </span>
                      </Button>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Information */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Thông tin cá nhân
                  </CardTitle>
                  <CardDescription>
                    Cập nhật thông tin hiển thị công khai
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+84 xxx xxx xxx"
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Địa chỉ</Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Thành phố, Quốc gia"
                      />
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
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium mb-3">Liên kết mạng xã hội</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="github" className="flex items-center gap-2">
                          <Github className="h-4 w-4" />
                          GitHub
                        </Label>
                        <Input
                          id="github"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          placeholder="https://github.com/username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twitter" className="flex items-center gap-2">
                          <Twitter className="h-4 w-4" />
                          Twitter
                        </Label>
                        <Input
                          id="twitter"
                          value={twitterUrl}
                          onChange={(e) => setTwitterUrl(e.target.value)}
                          placeholder="https://twitter.com/username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkedin" className="flex items-center gap-2">
                          <Linkedin className="h-4 w-4" />
                          LinkedIn
                        </Label>
                        <Input
                          id="linkedin"
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveProfile} disabled={loading}>
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
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Change Password */}
              <Card>
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
                    <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowPasswords(!showPasswords)}
                      >
                        {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                    <Input
                      id="newPassword"
                      type={showPasswords ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới"
                    />
                    {newPassword && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>Độ mạnh mật khẩu</span>
                          <span>{passwordStrength}%</span>
                        </div>
                        <Progress value={passwordStrength} className="h-2" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                    <Input
                      id="confirmPassword"
                      type={showPasswords ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Xác nhận mật khẩu mới"
                    />
                  </div>

                  <Button 
                    onClick={handleChangePassword} 
                    disabled={loading || !newPassword || !confirmPassword || !currentPassword}
                    className="w-full"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Đổi mật khẩu
                  </Button>
                </CardContent>
              </Card>

              {/* Two-Factor Authentication */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Xác thực hai yếu tố
                  </CardTitle>
                  <CardDescription>
                    Tăng cường bảo mật tài khoản
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Kích hoạt 2FA</Label>
                      <p className="text-sm text-muted-foreground">
                        Sử dụng ứng dụng xác thực
                      </p>
                    </div>
                    <Switch
                      checked={twoFactorEnabled}
                      onCheckedChange={setTwoFactorEnabled}
                    />
                  </div>

                  {twoFactorEnabled && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Xác thực hai yếu tố đã được kích hoạt. Sử dụng ứng dụng Google Authenticator để tạo mã xác thực.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Thiết bị đã đăng nhập</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Laptop className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">Trình duyệt hiện tại</p>
                            <p className="text-xs text-muted-foreground">
                              Chrome • {new Date().toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">Hiện tại</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Cài đặt thông báo
                </CardTitle>
                <CardDescription>
                  Quản lý cách bạn nhận thông báo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Thông báo email</Label>
                      <p className="text-sm text-muted-foreground">
                        Nhận thông báo quan trọng qua email
                      </p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, email: checked }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Thông báo đẩy</Label>
                      <p className="text-sm text-muted-foreground">
                        Nhận thông báo ngay lập tức trên trình duyệt
                      </p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, push: checked }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>C��p nhật sản phẩm</Label>
                      <p className="text-sm text-muted-foreground">
                        Thông báo về tính năng mới và cập nhật
                      </p>
                    </div>
                    <Switch
                      checked={notifications.updates}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, updates: checked }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Thông báo bảo mật</Label>
                      <p className="text-sm text-muted-foreground">
                        Cảnh báo về hoạt động đáng ngờ
                      </p>
                    </div>
                    <Switch
                      checked={notifications.security}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, security: checked }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Theme Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Giao diện
                  </CardTitle>
                  <CardDescription>
                    Tùy chỉnh giao diện hiển thị
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Chủ đề</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={theme === 'light' ? 'default' : 'outline'}
                        onClick={() => setTheme('light')}
                        className="flex flex-col gap-2 h-auto p-4"
                      >
                        <Sun className="h-6 w-6" />
                        <span className="text-xs">Sáng</span>
                      </Button>
                      <Button
                        variant={theme === 'dark' ? 'default' : 'outline'}
                        onClick={() => setTheme('dark')}
                        className="flex flex-col gap-2 h-auto p-4"
                      >
                        <Moon className="h-6 w-6" />
                        <span className="text-xs">Tối</span>
                      </Button>
                      <Button
                        variant={theme === 'system' ? 'default' : 'outline'}
                        onClick={() => setTheme('system')}
                        className="flex flex-col gap-2 h-auto p-4"
                      >
                        <Monitor className="h-6 w-6" />
                        <span className="text-xs">Hệ thống</span>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Màu chủ đạo</Label>
                    <div className="grid grid-cols-6 gap-2">
                      {['blue', 'green', 'purple', 'red', 'orange', 'pink'].map((color) => (
                        <Button
                          key={color}
                          variant={primaryColor === color ? 'default' : 'outline'}
                          onClick={() => setPrimaryColor(color)}
                          className={cn(
                            "h-10 w-10 p-0 rounded-full",
                            color === 'blue' && "bg-blue-500 hover:bg-blue-600",
                            color === 'green' && "bg-green-500 hover:bg-green-600",
                            color === 'purple' && "bg-purple-500 hover:bg-purple-600",
                            color === 'red' && "bg-red-500 hover:bg-red-600",
                            color === 'orange' && "bg-orange-500 hover:bg-orange-600",
                            color === 'pink' && "bg-pink-500 hover:bg-pink-600"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Language Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Ngôn ngữ & Khu vực
                  </CardTitle>
                  <CardDescription>
                    Cài đặt ngôn ngữ và định dạng
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Ngôn ngữ hiển thị</Label>
                    <Select value={currentLanguage} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLanguages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            <div className="flex items-center gap-2">
                              <span>{lang.flag}</span>
                              <span>{lang.nativeName}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Múi giờ</Label>
                    <Select defaultValue="Asia/Ho_Chi_Minh">
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
                    <Select defaultValue="VND">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VND">VND (₫)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Quyền riêng tư
                </CardTitle>
                <CardDescription>
                  Kiểm soát ai có thể xem thông tin của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Hiển thị hồ sơ</Label>
                  <Select 
                    value={privacy.profileVisibility} 
                    onValueChange={(value) => 
                      setPrivacy(prev => ({ ...prev, profileVisibility: value }))
                    }
                  >
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

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Hiển th�� email</Label>
                      <p className="text-sm text-muted-foreground">
                        Cho phép người khác xem email của bạn
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showEmail}
                      onCheckedChange={(checked) => 
                        setPrivacy(prev => ({ ...prev, showEmail: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Hiển thị số điện thoại</Label>
                      <p className="text-sm text-muted-foreground">
                        Cho phép người khác xem số điện thoại
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showPhone}
                      onCheckedChange={(checked) => 
                        setPrivacy(prev => ({ ...prev, showPhone: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Cho phép tin nhắn</Label>
                      <p className="text-sm text-muted-foreground">
                        Người khác có thể gửi tin nhắn cho bạn
                      </p>
                    </div>
                    <Switch
                      checked={privacy.allowMessages}
                      onCheckedChange={(checked) => 
                        setPrivacy(prev => ({ ...prev, allowMessages: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Cho phép lời mời nhóm</Label>
                      <p className="text-sm text-muted-foreground">
                        Người khác có thể mời bạn vào nhóm
                      </p>
                    </div>
                    <Switch
                      checked={privacy.allowInvites}
                      onCheckedChange={(checked) => 
                        setPrivacy(prev => ({ ...prev, allowInvites: checked }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Hiệu suất
                  </CardTitle>
                  <CardDescription>
                    Tối ưu hóa trải nghiệm sử dụng
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Tự động lưu</Label>
                      <p className="text-sm text-muted-foreground">
                        Lưu thay đổi tự động
                      </p>
                    </div>
                    <Switch
                      checked={preferences.autoSave}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, autoSave: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Chế độ nén</Label>
                      <p className="text-sm text-muted-foreground">
                        Giao diện gọn gàng hơn
                      </p>
                    </div>
                    <Switch
                      checked={preferences.compactMode}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, compactMode: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Giảm hiệu ứng</Label>
                      <p className="text-sm text-muted-foreground">
                        Giảm animation cho thiết bị yếu
                      </p>
                    </div>
                    <Switch
                      checked={preferences.reducedMotion}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, reducedMotion: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Data & Storage */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Dữ liệu & Lưu trữ
                  </CardTitle>
                  <CardDescription>
                    Quản lý dữ liệu ứng dụng
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Dữ liệu đã sử dụng</span>
                      <span>2.4 MB / 100 MB</span>
                    </div>
                    <Progress value={2.4} className="h-2" />
                  </div>

                  <Button variant="outline" className="w-full" onClick={exportSettings}>
                    <Download className="h-4 w-4 mr-2" />
                    Xuất tất cả dữ liệu
                  </Button>

                  <Button variant="outline" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa cache
                  </Button>

                  <Alert className="border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Vùng nguy hiểm:</strong> Xóa tài khoản sẽ không thể khôi phục.
                    </AlertDescription>
                  </Alert>

                  <Button variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa tài khoản
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Settings;
