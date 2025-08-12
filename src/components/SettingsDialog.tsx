import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Eye,
  Save,
  Download,
  Key,
  Smartphone,
  AlertTriangle,
  Sun,
  Moon,
  Monitor,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SettingsDialogProps {
  children: React.ReactNode;
}

export const SettingsDialog = ({ children }: SettingsDialogProps) => {
  const { user } = useAuthStore();
  const { 
    profile, 
    updateProfile, 
    updateNotificationSettings,
    updateAppearanceSettings,
    updatePrivacySettings,
    changePassword,
    loading 
  } = useProfileStore();

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Form states
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [website, setWebsite] = useState(profile?.website || '');

  // Notification settings
  const [notificationEmail, setNotificationEmail] = useState(profile?.notification_email ?? true);
  const [notificationPush, setNotificationPush] = useState(profile?.notification_push ?? true);
  const [notificationSms, setNotificationSms] = useState(profile?.notification_sms ?? false);

  // Appearance settings
  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>(profile?.theme_preference || 'system');
  const [language, setLanguage] = useState(profile?.language || 'vi');
  const [currency, setCurrency] = useState(profile?.currency || 'USD');

  // Privacy settings
  const [privacyProfile, setPrivacyProfile] = useState<'public' | 'private' | 'friends'>(profile?.privacy_profile || 'public');
  const [privacyPortfolio, setPrivacyPortfolio] = useState(profile?.privacy_portfolio ?? false);
  const [privacyActivity, setPrivacyActivity] = useState(profile?.privacy_activity ?? false);

  // Security settings
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  const handleSaveGeneral = async () => {
    if (!user) return;

    const success = await updateProfile(user.id, {
      display_name: displayName,
      bio,
      phone,
      location,
      website
    });

    if (success) {
      toast({
        title: "Thành công",
        description: "Cập nhật thông tin cá nhân thành công!"
      });
    }
  };

  const handleSaveNotifications = async () => {
    if (!user) return;

    const success = await updateNotificationSettings(user.id, {
      notification_email: notificationEmail,
      notification_push: notificationPush,
      notification_sms: notificationSms
    });

    if (success) {
      toast({
        title: "Thành công",
        description: "Cập nhật cài đặt thông báo thành công!"
      });
    }
  };

  const handleSaveAppearance = async () => {
    if (!user) return;

    const success = await updateAppearanceSettings(user.id, {
      theme_preference: themePreference,
      language,
      currency
    });

    if (success) {
      toast({
        title: "Thành công",
        description: "Cập nhật giao diện thành công!"
      });
    }
  };

  const handleSavePrivacy = async () => {
    if (!user) return;

    const success = await updatePrivacySettings(user.id, {
      privacy_profile: privacyProfile,
      privacy_portfolio: privacyPortfolio,
      privacy_activity: privacyActivity
    });

    if (success) {
      toast({
        title: "Thành công",
        description: "Cập nhật cài đặt riêng tư thành công!"
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
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    }
  };

  const exportData = () => {
    try {
      const data = {
        profile,
        settings: {
          notifications: { notificationEmail, notificationPush, notificationSms },
          appearance: { themePreference, language, currency },
          privacy: { privacyProfile, privacyPortfolio, privacyActivity }
        },
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `settings-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Thành công",
        description: "Xuất cài đặt thành công!"
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xuất cài đặt",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Cài đặt hệ thống
          </DialogTitle>
          <DialogDescription>
            Quản lý tài khoản, thông báo, giao diện và bảo mật
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="general" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Chung</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Thông báo</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-1">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Giao diện</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Riêng tư</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Bảo mật</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card>
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
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Tiểu sử</Label>
                  <Input
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Viết vài dòng về bản thân..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Số điện thoại
                    </Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+84 xxx xxx xxx"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Địa chỉ
                    </Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Thành phố, Quốc gia"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveGeneral} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Lưu thay đổi
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Cài đặt thông báo
                </CardTitle>
                <CardDescription>
                  Chọn cách bạn muốn nhận thông báo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="notif-email">Email</Label>
                    </div>
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

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="notif-push">Push notification</Label>
                    </div>
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

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="notif-sms">SMS</Label>
                    </div>
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

                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Lưu cài đặt
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Giao diện và hiển thị
                </CardTitle>
                <CardDescription>
                  Tùy chỉnh giao diện theo sở thích
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
                      <SelectItem value="vi">🇻🇳 Tiếng Việt</SelectItem>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                      <SelectItem value="zh">🇨🇳 中文</SelectItem>
                      <SelectItem value="ja">🇯🇵 日本語</SelectItem>
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
                      <SelectItem value="BTC">BTC (₿)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveAppearance} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Lưu cài đặt
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-4">
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
                  <Select value={privacyProfile} onValueChange={(value: 'public' | 'private' | 'friends') => setPrivacyProfile(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center justify-between w-full">
                          <span>Công khai</span>
                          <Badge variant="secondary" className="ml-2">Tất cả mọi người</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="friends">
                        <div className="flex items-center justify-between w-full">
                          <span>Bạn bè</span>
                          <Badge variant="secondary" className="ml-2">Chỉ bạn bè</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center justify-between w-full">
                          <span>Riêng tư</span>
                          <Badge variant="secondary" className="ml-2">Chỉ bản thân</Badge>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

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

                <Separator />

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

                <div className="flex justify-end">
                  <Button onClick={handleSavePrivacy} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Lưu cài đặt
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-4">
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
                  <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
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

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleChangePassword} 
                    disabled={loading || !newPassword || !confirmPassword || !currentPassword}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Đổi mật khẩu
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Sao lưu dữ liệu
                </CardTitle>
                <CardDescription>
                  Xuất dữ liệu cài đặt và thông tin cá nhân
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={exportData} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Xuất dữ liệu
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Dữ liệu sẽ được xuất dưới định dạng JSON
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
