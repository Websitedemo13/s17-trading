import { memo, useMemo } from 'react';
import { useMarketStore } from '@/stores/marketStore';
import { ArrowUpIcon, ArrowDownIcon, TrendingUp, DollarSign, Activity } from 'lucide-react';

const formatNumber = (num: number) => {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
};

const formatPercentage = (num: number) => `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;

const StatCard = memo(({ 
  title, 
  value, 
  change, 
  icon: Icon,
  color = 'text-foreground'
}: {
  title: string;
  value: string;
  change?: number;
  icon: any;
  color?: string;
}) => (
  <div className="glass-card p-4 sm:p-6 rounded-lg animate-fade-in">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className={`text-xl sm:text-2xl font-bold ${color}`}>{value}</p>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm mt-1 ${
            change >= 0 ? 'text-success' : 'text-destructive'
          }`}>
            {change >= 0 ? (
              <ArrowUpIcon className="w-3 h-3" />
            ) : (
              <ArrowDownIcon className="w-3 h-3" />
            )}
            {formatPercentage(Math.abs(change))}
          </div>
        )}
      </div>
      <div className="p-3 bg-primary/10 rounded-full">
        <Icon className="w-6 h-6 text-primary" />
      </div>
    </div>
  </div>
));

StatCard.displayName = 'StatCard';

const OptimizedMarketStats = memo(() => {
  const { marketStats, loading } = useMarketStore();

  const stats = useMemo(() => {
    if (!marketStats) {
      return [
        {
          title: 'Total Market Cap',
          value: 'Loading...',
          icon: DollarSign,
        },
        {
          title: '24h Volume',
          value: 'Loading...',
          icon: Activity,
        },
        {
          title: 'Bitcoin Dominance',
          value: 'Loading...',
          icon: TrendingUp,
        }
      ];
    }

    return [
      {
        title: 'Total Market Cap',
        value: formatNumber(marketStats.market_cap),
        change: marketStats.market_cap_change_24h,
        icon: DollarSign,
        color: marketStats.market_cap_change_24h >= 0 ? 'text-success' : 'text-destructive'
      },
      {
        title: '24h Volume',
        value: formatNumber(marketStats.volume_24h),
        change: marketStats.volume_change_24h,
        icon: Activity,
        color: marketStats.volume_change_24h >= 0 ? 'text-success' : 'text-destructive'
      },
      {
        title: 'Bitcoin Dominance',
        value: `${marketStats.btc_dominance.toFixed(1)}%`,
        icon: TrendingUp,
        color: 'text-orange-500'
      }
    ];
  }, [marketStats]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-4 sm:p-6 rounded-lg animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-8 bg-muted rounded w-32"></div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-muted rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {stats.map((stat, index) => (
        <StatCard
          key={stat.title}
          {...stat}
        />
      ))}
    </div>
  );
});

OptimizedMarketStats.displayName = 'OptimizedMarketStats';

export default OptimizedMarketStats;
