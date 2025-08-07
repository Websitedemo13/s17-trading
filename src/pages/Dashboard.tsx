import { useEffect } from 'react';
import MarketStats from '@/components/MarketStats';
import CryptoChart from '@/components/CryptoChart';
import CryptoList from '@/components/CryptoList';
import AIInsights from '@/components/AIInsights';
import { useMarketStore } from '@/stores/marketStore';

const Dashboard = () => {
  const { fetchCryptoData, fetchMarketStats } = useMarketStore();

  useEffect(() => {
    fetchCryptoData();
    fetchMarketStats();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      fetchCryptoData();
      fetchMarketStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchCryptoData, fetchMarketStats]);

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Tổng quan thị trường tiền điện tử và phân tích AI
        </p>
      </div>

      <MarketStats />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <CryptoChart />
          <CryptoList />
        </div>
        
        <div className="space-y-6">
          <AIInsights />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;