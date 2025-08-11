import { useState } from 'react';
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
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
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
  Zap
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Settings = () => {
  const { user } = useAuthStore();
  const { theme, setTheme, primaryColor, setPrimaryColor } = useThemeStore();
  
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false
  });
  
  const [bugReport, setBugReport] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState('suggestion');

  const themes = [
    { id: 'light', name: 'Sáng', icon: Sun, preview: 'bg-white border' },
    { id: 'dark', name: 'Tối', icon: Moon, preview: 'bg-gray-900 border-gray-700' },
    { id: 'system', name: 'Hệ thống', icon: Monitor, preview: 'bg-gradient-to-r from-white to-gray-900' }
  ];

  const colorThemes = [
    { id: 'blue', name: 'Xanh dương', color: 'bg-blue-500', value: 'hsl(220, 100%, 60%)' },
    { id: 'green', name: 'Xanh lá', color: 'bg-green-500', value: 'hsl(142, 76%, 60%)' },
    { id: 'red', name: 'Đỏ', color: 'bg-red-500', value: 'hsl(0, 84%, 60%)' },
    { id: 'purple', name: 'Tím', color: 'bg-purple-500', value: 'hsl(280, 100%, 70%)' },
    { id: 'orange', name: 'Cam', color: 'bg-orange-500', value: 'hsl(25, 95%, 65%)' },
    { id: 'pink', name: 'Hồng', color: 'bg-pink-500', value: 'hsl(330, 100%, 70%)' },
    { id: 'cyan', name: 'Cyan', color: 'bg-cyan-500', value: 'hsl(180, 100%, 60%)' },
    { id: 'yellow', name: 'Vàng', color: 'bg-yellow-500', value: 'hsl(50, 100%, 60%)' }
  ];

  const handleSaveProfile = () => {
    toast({
      title: "Thành công",
      description: "Đã cập nhật thông tin cá nhân"
    });
  };

  const handleSaveBugReport = () => {
    if (!bugReport.trim()) return;
    
    // In real app, send to backend
    toast({
      title: "Thành công", 
      description: "Đã gửi báo cáo lỗi. Chúng tôi sẽ xem xét sớm nhất!"
    });
    setBugReport('');
  };

  const handleSendFeedback = () => {
    if (!feedback.trim()) return;
    
    // In real app, send to backend
    toast({
      title: "Cảm ơn!",
      description: "Góp ý của bạn rất quan trọng với chúng tôi!"
    });
    setFeedback('');
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as 'light' | 'dark' | 'system');
    toast({
      title: "Đã thay đổi theme",
      description: `Chuyển sang theme ${themes.find(t => t.id === newTheme)?.name}`
    });
  };

  const handleColorChange = (colorValue: string) => {
    setPrimaryColor(colorValue);
    document.documentElement.style.setProperty('--primary', colorValue);
    toast({
      title: "Đã thay đổi màu chủ đạo",
      description: "Giao diện đã được cập nhật!"
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Cài đặt</h1>
        <p className="text-muted-foreground">
          Quản lý tài khoản, giao diện và tùy chọn ứng dụng
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            H��� sơ
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Giao diện
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Thông báo
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Góp ý
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Về app
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Thông tin cá nhân
              </CardTitle>
              <CardDescription>
                Cập nhật thông tin và ảnh đại diện của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Thay đổi ảnh
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    JPG, PNG. Tối đa 2MB
                  </p>
                </div>
              </div>

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
                    value={email}
                    disabled
                    className="bg-muted"
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
                <div className="space-y-2">
                  <Label>Trạng thái</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                      Đang hoạt động
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Giới thiệu</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Viết vài dòng về bản thân..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile}>
                  Lưu thay đổi
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Chủ đề giao diện
              </CardTitle>
              <CardDescription>
                Tùy chỉnh giao diện theo sở thích của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">Chế độ hiển thị</Label>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  {themes.map((themeOption) => {
                    const Icon = themeOption.icon;
                    return (
                      <div
                        key={themeOption.id}
                        onClick={() => handleThemeChange(themeOption.id)}
                        className={cn(
                          "flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary/50",
                          theme === themeOption.id ? "border-primary bg-primary/5" : "border-border"
                        )}
                      >
                        <div className={cn("w-12 h-12 rounded-lg mb-2 flex items-center justify-center", themeOption.preview)}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className="text-sm font-medium">{themeOption.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Màu chủ đạo</Label>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mt-3">
                  {colorThemes.map((color) => (
                    <div
                      key={color.id}
                      onClick={() => handleColorChange(color.value)}
                      className={cn(
                        "flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:border-primary/50",
                        primaryColor === color.value ? "border-primary" : "border-border"
                      )}
                    >
                      <div className={cn("w-8 h-8 rounded-full", color.color)} />
                      <span className="text-xs mt-1">{color.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
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
                    <Label className="text-base">Thông báo email</Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông báo qua email về hoạt động quan trọng
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, email: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Thông báo đẩy</Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông báo trực tiếp trên thiết bị
                    </p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, push: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Email marketing</Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông tin về tính năng mới và khuyến mãi
                    </p>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, marketing: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5 text-red-500" />
                  Báo cáo lỗi
                </CardTitle>
                <CardDescription>
                  Gặp sự cố? Hãy cho chúng tôi biết!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Mô tả lỗi bạn gặp phải..."
                  value={bugReport}
                  onChange={(e) => setBugReport(e.target.value)}
                  rows={4}
                />
                <Button 
                  onClick={handleSaveBugReport}
                  disabled={!bugReport.trim()}
                  className="w-full"
                >
                  <Bug className="h-4 w-4 mr-2" />
                  Gửi báo cáo
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  Góp ý & Đề xuất
                </CardTitle>
                <CardDescription>
                  Chia sẻ ý tưởng để cải thiện ứng dụng
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={feedbackType} onValueChange={setFeedbackType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suggestion">Đề xuất tính năng</SelectItem>
                    <SelectItem value="improvement">Cải thiện</SelectItem>
                    <SelectItem value="compliment">Khen ngợi</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Chia sẻ góp ý của bạn..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                />
                <Button 
                  onClick={handleSendFeedback}
                  disabled={!feedback.trim()}
                  className="w-full"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Gửi góp ý
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  S17 Trading Platform
                </CardTitle>
                <CardDescription>
                  Phiên bản 1.0.0
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Nền tảng giao dịch cryptocurrency hiện đại với AI hỗ trợ, 
                  chat nhóm và qu���n lý portfolio thông minh.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4" />
                    <span>Website: s17trading.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4" />
                    <span>Email: support@s17trading.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    <span>Hotline: 1900-xxxx</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Điều khoản & Chính sách
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Điều khoản sử dụng
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Điều khoản sử dụng</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 text-sm">
                      <p><strong>1. Chấp nhận điều khoản</strong></p>
                      <p>Bằng việc sử dụng S17 Trading Platform, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu dưới đây.</p>
                      
                      <p><strong>2. Sử dụng dịch vụ</strong></p>
                      <p>Bạn cam kết sử dụng nền tảng một cách hợp pháp và không vi phạm quyền của bên thứ ba.</p>
                      
                      <p><strong>3. Rủi ro đầu tư</strong></p>
                      <p>Giao dịch cryptocurrency có rủi ro cao. Bạn hiểu và chấp nhận mọi rủi ro có thể xảy ra.</p>
                      
                      <p><strong>4. Bảo mật tài khoản</strong></p>
                      <p>Bạn có trách nhiệm bảo mật thông tin đăng nhập và thông báo ngay khi phát hiện bất thường.</p>
                      
                      <p><strong>5. Liên hệ</strong></p>
                      <p>Mọi thắc mắc về điều khoản, vui lòng liên hệ support@s17trading.com</p>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Chính sách bảo mật
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Chính sách bảo mật</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 text-sm">
                      <p><strong>Thu thập thông tin</strong></p>
                      <p>Chúng tôi chỉ thu thập thông tin cần thiết để cung cấp dịch vụ tốt nhất.</p>
                      
                      <p><strong>Sử dụng thông tin</strong></p>
                      <p>Thông tin của bạn được sử dụng để cải thiện trải nghiệm và bảo mật tài khoản.</p>
                      
                      <p><strong>Chia sẻ thông tin</strong></p>
                      <p>Chúng tôi không chia sẻ thông tin cá nhân với bên thứ ba trừ khi được pháp luật yêu cầu.</p>
                      
                      <p><strong>Bảo mật dữ liệu</strong></p>
                      <p>Chúng tôi áp dụng các biện pháp bảo mật hàng đầu để bảo vệ dữ liệu của bạn.</p>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" className="w-full justify-start">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Trung tâm trợ giúp
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
