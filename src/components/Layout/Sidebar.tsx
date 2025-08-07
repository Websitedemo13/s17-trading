import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  User, 
  TrendingUp,
  Activity
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const sidebarItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: BarChart3,
      description: 'Tổng quan thị trường'
    },
    {
      title: 'Teams',
      href: '/teams',
      icon: Users,
      description: 'Quản lý nhóm trading'
    },
    {
      title: 'AI Chat',
      href: '/chat-ai',
      icon: MessageSquare,
      description: 'Tư vấn AI'
    },
    {
      title: 'Portfolio',
      href: '/profile',
      icon: TrendingUp,
      description: 'Danh mục đầu tư'
    },
    {
      title: 'Analytics',
      href: '/analytics',
      icon: Activity,
      description: 'Phân tích chi tiết'
    }
  ];

  return (
    <div className="glass-card w-64 min-h-screen p-6 border-r">
      <div className="space-y-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Navigation
          </h2>
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                  location.pathname === item.href 
                    ? "bg-accent text-accent-foreground" 
                    : "transparent"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>{item.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;