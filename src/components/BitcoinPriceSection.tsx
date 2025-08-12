import { memo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SimpleBitcoinChart from './SimpleBitcoinChart';
import TradingViewChart from './TradingViewChart';
import { BarChart3, Activity } from 'lucide-react';

const BitcoinPriceSection = memo(() => {
  return (
    <Tabs defaultValue="simple" className="w-full">
      <div className="glass-card p-3 sm:p-4 lg:p-6 rounded-lg animate-fade-in">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold">Bitcoin Price</h2>
          <TabsList className="grid w-[280px] grid-cols-2">
            <TabsTrigger value="simple" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Quick View
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Advanced Chart
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="simple" className="mt-0">
          <div className="h-[250px] sm:h-[350px] lg:h-[400px] w-full">
            <SimpleBitcoinChart />
          </div>
        </TabsContent>
        
        <TabsContent value="advanced" className="mt-0">
          <div className="h-[250px] sm:h-[350px] lg:h-[400px] w-full">
            <TradingViewChart />
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
});

BitcoinPriceSection.displayName = 'BitcoinPriceSection';

export default BitcoinPriceSection;
