import { memo, useState, useEffect, lazy, Suspense } from 'react';
import { RefreshCw } from 'lucide-react';

// Lazy load TradingView widget để giảm initial bundle size
const TradingViewWidget = lazy(() =>
  import('react-tradingview-widget').catch(() => ({
    default: () => (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Chart temporarily unavailable</p>
        </div>
      </div>
    )
  }))
);

const TradingViewSkeleton = () => (
  <div className="h-full w-full bg-muted/20 rounded-lg animate-pulse flex items-center justify-center">
    <div className="text-center">
      <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading chart...</p>
    </div>
  </div>
);

const CryptoChart = memo(() => {
  const [shouldLoadChart, setShouldLoadChart] = useState(false);

  useEffect(() => {
    // Delay chart loading để ưu tiên load các component quan trọng khác trước
    const timer = setTimeout(() => {
      setShouldLoadChart(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="glass-card p-3 sm:p-4 lg:p-6 rounded-lg animate-fade-in">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold">Bitcoin Price</h2>
      </div>
      <div className="h-[250px] sm:h-[350px] lg:h-[400px] w-full">
        {shouldLoadChart ? (
          <Suspense fallback={<TradingViewSkeleton />}>
            <TradingViewWidget
              symbol="BINANCE:BTCUSDT"
              theme="Dark"
              locale="en"
              autosize
              hide_side_toolbar={true} // Ẩn sidebar để giảm complexity
              allow_symbol_change={false} // Disable để giảm load
              interval="D"
              toolbar_bg="#141413"
              enable_publishing={false}
              hide_top_toolbar={true} // Ẩn top toolbar để performance tốt hơn
              save_image={false}
              container_id="tradingview_chart"
              loading_screen={{ backgroundColor: "#1a1a1a" }}
              disabled_features={[
                "header_symbol_search",
                "header_chart_type",
                "header_compare",
                "header_undo_redo",
                "header_fullscreen_button"
              ]}
            />
          </Suspense>
        ) : (
          <TradingViewSkeleton />
        )}
      </div>
    </div>
  );
});

export default CryptoChart;
