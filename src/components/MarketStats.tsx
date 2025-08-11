import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon } from "lucide-react";

const MarketStats = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 animate-fade-in">
      <div className="glass-card p-4 sm:p-5 lg:p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Market Cap</h3>
          <TrendingUpIcon className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
        </div>
        <p className="text-xl sm:text-2xl font-semibold mt-2">$2.1T</p>
        <span className="text-xs sm:text-sm text-success flex items-center gap-1">
          <ArrowUpIcon className="w-2 h-2 sm:w-3 sm:h-3" />
          2.4%
        </span>
      </div>

      <div className="glass-card p-4 sm:p-5 lg:p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">24h Volume</h3>
          <TrendingUpIcon className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
        </div>
        <p className="text-xl sm:text-2xl font-semibold mt-2">$84.2B</p>
        <span className="text-xs sm:text-sm text-success flex items-center gap-1">
          <ArrowUpIcon className="w-2 h-2 sm:w-3 sm:h-3" />
          5.1%
        </span>
      </div>

      <div className="glass-card p-4 sm:p-5 lg:p-6 rounded-lg sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">BTC Dominance</h3>
          <TrendingUpIcon className="w-3 h-3 sm:w-4 sm:h-4 text-warning" />
        </div>
        <p className="text-xl sm:text-2xl font-semibold mt-2">42.1%</p>
        <span className="text-xs sm:text-sm text-warning flex items-center gap-1">
          <ArrowDownIcon className="w-2 h-2 sm:w-3 sm:h-3" />
          0.8%
        </span>
      </div>
    </div>
  );
};

export default MarketStats;
