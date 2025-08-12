import { memo, useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';

const TradingViewChart = memo(() => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between mb-4">
        <a
          href="https://www.tradingview.com/chart/?symbol=BINANCE:BTCUSDT"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ExternalLink className="h-4 w-4" />
          Open in TradingView
        </a>
      </div>

      <div className="w-full h-full relative">
        {isLoading && (
          <div className="absolute inset-0 bg-muted/20 rounded-lg animate-pulse flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading TradingView chart...</p>
            </div>
          </div>
        )}
        
        {hasError ? (
          <div className="absolute inset-0 bg-muted/20 rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="mb-2">Chart temporarily unavailable</p>
              <a 
                href="https://www.tradingview.com/chart/?symbol=BINANCE:BTCUSDT" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary underline text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                View on TradingView
              </a>
            </div>
          </div>
        ) : (
          <iframe
            src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_76d87&symbol=BINANCE%3ABTCUSDT&interval=D&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&hideideas=1&theme=Dark&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=www.tradingview.com&utm_medium=widget&utm_campaign=chart&utm_term=BINANCE%3ABTCUSDT"
            className="w-full h-full rounded-lg"
            frameBorder="0"
            allowtransparency="true"
            scrolling="no"
            allowFullScreen={true}
            onLoad={handleLoad}
            onError={handleError}
            style={{ display: hasError ? 'none' : 'block' }}
          />
        )}
      </div>
      
      <div className="text-center text-xs text-muted-foreground mt-3">
        Powered by TradingView • Real-time Bitcoin price chart
      </div>
    </div>
  );
});

TradingViewChart.displayName = 'TradingViewChart';

export default TradingViewChart;
