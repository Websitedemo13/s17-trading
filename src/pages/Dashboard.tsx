import { useEffect, Suspense, lazy } from 'react';
import OptimizedMarketStats from '@/components/OptimizedMarketStats';
import CryptoChart from '@/components/CryptoChart';
import LazyLoadWrapper from '@/components/LazyLoadWrapper';
import { useMarketStore } from '@/stores/marketStore';

// Lazy load non-critical components
const CryptoList = lazy(() => import('@/components/CryptoList'));
const AIInsights = lazy(() => import('@/components/AIInsights'));

const Dashboard = () => {
  const { fetchCryptoData, fetchMarketStats } = useMarketStore();

  useEffect(() => {
    // Initial load
    fetchCryptoData();
    fetchMarketStats();

    // Auto refresh every 2 minutes (reduced frequency to be less aggressive)
    const interval = setInterval(() => {
      fetchCryptoData();
      fetchMarketStats();
    }, 120000); // 2 minutes instead of 30 seconds

    return () => clearInterval(interval);
  }, [fetchCryptoData, fetchMarketStats]);

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Tổng quan thị trường tiền điện tử và phân tích AI
        </p>
      </div>

      <OptimizedMarketStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <CryptoChart />
          <CryptoList />
        </div>

        <div className="space-y-4 sm:space-y-6">
          <AIInsights />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
