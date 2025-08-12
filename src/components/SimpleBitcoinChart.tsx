import { memo, useState, useEffect } from 'react';
import { useMarketStore } from '@/stores/marketStore';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

const SimpleBitcoinChart = memo(() => {
  const { cryptoData, loading } = useMarketStore();
  const [btcData, setBtcData] = useState<any>(null);

  useEffect(() => {
    const bitcoin = cryptoData.find(crypto => crypto.id === 'bitcoin' || crypto.symbol.toLowerCase() === 'btc');
    setBtcData(bitcoin);
  }, [cryptoData]);

  if (loading) {
    return (
      <div className="w-full h-full bg-muted/20 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 mx-auto mb-2 animate-pulse text-primary" />
          <p className="text-sm text-muted-foreground">Loading Bitcoin data...</p>
        </div>
      </div>
    );
  }

  if (!btcData) {
    return (
      <div className="w-full h-full bg-muted/20 rounded-lg flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Bitcoin data unavailable</p>
        </div>
      </div>
    );
  }

  const priceChange = btcData.price_change_percentage_24h || 0;
  const isPositive = priceChange >= 0;

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isPositive ? (
            <TrendingUp className="h-5 w-5 text-success" />
          ) : (
            <TrendingDown className="h-5 w-5 text-destructive" />
          )}
          <span className={`text-sm font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
          </span>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Current Price */}
        <div className="text-center">
          <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-2">
            ${btcData.current_price?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 'N/A'}
          </div>
          <div className="text-lg text-muted-foreground">
            Bitcoin (BTC)
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/20 rounded-lg p-4 text-center">
            <div className="text-sm text-muted-foreground mb-1">24h Change</div>
            <div className={`text-lg font-semibold ${isPositive ? 'text-success' : 'text-destructive'}`}>
              {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
            </div>
          </div>
          
          <div className="bg-muted/20 rounded-lg p-4 text-center">
            <div className="text-sm text-muted-foreground mb-1">Market Cap</div>
            <div className="text-lg font-semibold">
              ${(btcData.market_cap / 1e12).toFixed(2)}T
            </div>
          </div>
          
          <div className="bg-muted/20 rounded-lg p-4 text-center">
            <div className="text-sm text-muted-foreground mb-1">24h Volume</div>
            <div className="text-lg font-semibold">
              ${(btcData.total_volume / 1e9).toFixed(2)}B
            </div>
          </div>
          
          <div className="bg-muted/20 rounded-lg p-4 text-center">
            <div className="text-sm text-muted-foreground mb-1">Rank</div>
            <div className="text-lg font-semibold text-primary">
              #1
            </div>
          </div>
        </div>

        {/* Price Movement Visual */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>24h Price Movement</span>
            <span>{isPositive ? '📈' : '📉'}</span>
          </div>
          <div className="w-full bg-muted/20 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${
                isPositive ? 'bg-success' : 'bg-destructive'
              }`}
              style={{ 
                width: `${Math.min(Math.abs(priceChange) * 10, 100)}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Note */}
        <div className="text-center text-xs text-muted-foreground mt-4 p-3 bg-muted/10 rounded-lg">
          💡 Real-time Bitcoin price and market data
          <br />
          <span className="text-primary">TradingView advanced charts available soon</span>
        </div>
      </div>
    </div>
  );
});

SimpleBitcoinChart.displayName = 'SimpleBitcoinChart';

export default SimpleBitcoinChart;
