import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useAdminStore } from '@/stores/adminStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  LogOut, 
  User, 
  Settings, 
  Crown, 
  Menu, 
  X,
  BarChart3,
  TrendingUp,
  Users,
  MessageCircle,
  FileText,
  Bot,
  Home,
  ChevronRight
} from 'lucide-react';
import { HeaderNotificationSystem } from '@/components/HeaderNotificationSystem';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const { isAdmin } = useAdminStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: BarChart3,
      description: 'Tổng quan và thống kê',
      category: 'main'
    },
    { 
      path: '/markets', 
      label: 'Markets', 
      icon: TrendingUp,
      description: 'Thị trường và giá cả',
      category: 'main'
    },
    { 
      path: '/teams', 
      label: 'Teams', 
      icon: Users,
      description: 'Nhóm và cộng tác',
      category: 'social'
    },
    { 
      path: '/chat', 
      label: 'Chat', 
      icon: MessageCircle,
      description: 'Trò chuyện nhóm',
      category: 'social'
    },
    { 
      path: '/blog', 
      label: 'Blog', 
      icon: FileText,
      description: 'Tin tức và phân tích',
      category: 'content'
    },
    { 
      path: '/chat-ai', 
      label: 'AI Chat', 
      icon: Bot,
      description: 'Trợ lý AI thông minh',
      category: 'ai'
    }
  ];

  const userMenuItems = [
    { path: '/profile', label: 'Hồ sơ cá nhân', icon: User },
    { path: '/settings', label: 'Cài đặt', icon: Settings },
  ];

  if (!user) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container-responsive">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-2 text-xl font-bold text-primary hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-sm">
                S17
              </div>
              <span className="hidden sm:inline bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                S17 Trading
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link 
                to="/about" 
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                Về chúng tôi
              </Link>
              <Link 
                to="/blog" 
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                Blog
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Đăng nhập</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Đăng ký</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container-responsive">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link 
              to="/dashboard" 
              className="flex items-center gap-2 text-xl font-bold text-primary hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-sm">
                S17
              </div>
              <span className="hidden sm:inline bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                S17 Trading
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 ml-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      "hover:bg-accent hover:text-accent-foreground hover:scale-105",
                      active 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {item.category === 'ai' && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        AI
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Quick access on tablet */}
            <div className="hidden md:flex lg:hidden items-center gap-1">
              {navItems.slice(0, 4).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={item.label}
                    className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200",
                      "hover:bg-accent hover:scale-105",
                      active 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "text-muted-foreground hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                );
              })}
            </div>

            {/* Language Toggle */}
            <LanguageToggle />

            {/* Notifications */}
            <HeaderNotificationSystem />

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="lg:hidden w-9 h-9 p-0"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <SheetHeader className="p-6 pb-4 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <SheetTitle className="text-lg font-semibold">
                        {user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'}
                      </SheetTitle>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {isAdmin && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          <Crown className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                </SheetHeader>

                <div className="p-6 space-y-6">
                  {/* Main Navigation */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">ĐIỀU HƯỚNG</h3>
                    <div className="space-y-1">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        
                        return (
                          <SheetClose asChild key={item.path}>
                            <Link
                              to={item.path}
                              className={cn(
                                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                                "hover:bg-accent",
                                active 
                                  ? "bg-primary text-primary-foreground shadow-sm" 
                                  : "text-foreground hover:text-accent-foreground"
                              )}
                            >
                              <Icon className="h-5 w-5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="font-medium">{item.label}</div>
                                <div className="text-xs text-muted-foreground group-hover:text-accent-foreground/70">
                                  {item.description}
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 opacity-50" />
                            </Link>
                          </SheetClose>
                        );
                      })}
                    </div>
                  </div>

                  {/* User Menu */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">TÀI KHOẢN</h3>
                    <div className="space-y-1">
                      {userMenuItems.map((item) => {
                        const Icon = item.icon;
                        
                        return (
                          <SheetClose asChild key={item.path}>
                            <Link
                              to={item.path}
                              className="flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 hover:bg-accent text-foreground hover:text-accent-foreground"
                            >
                              <Icon className="h-5 w-5 flex-shrink-0" />
                              <span className="font-medium">{item.label}</span>
                            </Link>
                          </SheetClose>
                        );
                      })}
                      
                      {isAdmin && (
                        <SheetClose asChild>
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 hover:bg-accent text-amber-600 hover:text-amber-700"
                          >
                            <Crown className="h-5 w-5 flex-shrink-0" />
                            <span className="font-medium">Admin Dashboard</span>
                          </Link>
                        </SheetClose>
                      )}
                    </div>
                  </div>

                  {/* Sign Out */}
                  <div className="pt-4 border-t">
                    <Button 
                      variant="ghost" 
                      onClick={signOut}
                      className="w-full justify-start gap-3 py-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">Đăng xuất</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 hidden lg:flex">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <div className="p-3 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </div>

                {userMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem asChild key={item.path}>
                      <Link to={item.path} className="flex items-center gap-2 py-2">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}

                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2 py-2 text-amber-600">
                        <Crown className="h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={signOut}
                  className="text-red-600 focus:text-red-700 focus:bg-red-50 py-2"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
