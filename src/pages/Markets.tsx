import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { marketDataService, MarketAsset } from '@/lib/marketData';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter, 
  BarChart3, 
  DollarSign,
  Building2,
  Coins,
  Globe,
  RefreshCw,
  Star,
  Clock
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Markets = () => {
  const [marketData, setMarketData] = useState<MarketAsset[]>([]);
  const [marketStats, setMarketStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'stocks' | 'crypto'>('all');
  const [sortBy, setSortBy] = useState<'marketCap' | 'price' | 'changePercent'>('marketCap');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => {
    loadMarketData();
    const interval = setInterval(loadMarketData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadMarketData = async () => {
    try {
      const [data, stats] = await Promise.all([
        marketDataService.getAllMarketData(),
        marketDataService.getMarketStats()
      ]);
      setMarketData(data);
      setMarketStats(stats);
    } catch (error) {
      console.error('Error loading market data:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu thị trường",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = marketData.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           asset.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || 
                         (selectedType === 'stocks' && asset.type === 'stock') ||
                         (selectedType === 'crypto' && asset.type === 'crypto');
      return matchesSearch && matchesType;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortBy] || 0;
      let bValue = b[sortBy] || 0;
      
      if (sortOrder === 'desc') {
        return bValue - aValue;
      } else {
        return aValue - bValue;
      }
    });

    return filtered;
  }, [marketData, searchTerm, selectedType, sortBy, sortOrder]);

  const toggleWatchlist = (symbol: string) => {
    setWatchlist(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const formatPrice = (price: number, type: 'stock' | 'crypto') => {
    if (type === 'stock') {
      return new Intl.NumberFormat('vi-VN').format(price);
    } else {
      return price < 1 
        ? `$${price.toFixed(6)}`
        : `$${new Intl.NumberFormat('en-US', { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 2 
          }).format(price)}`;
    }
  };

  const formatMarketCap = (marketCap: number, type: 'stock' | 'crypto') => {
    if (type === 'stock') {
      if (marketCap >= 1e12) return `${(marketCap / 1e12).toFixed(1)}T VND`;
      if (marketCap >= 1e9) return `${(marketCap / 1e9).toFixed(1)}B VND`;
      return `${(marketCap / 1e6).toFixed(1)}M VND`;
    } else {
      if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(1)}B`;
      if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(1)}M`;
      return `$${(marketCap / 1e3).toFixed(1)}K`;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Đang tải dữ liệu thị trường...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Thị trường tài chính</h1>
        <p className="text-muted-foreground">
          Theo dõi chứng khoán Việt Nam và tiền điện tử theo thời gian thực
        </p>
      </div>

      {/* Market Stats */}
      {marketStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">VN Stocks</CardTitle>
              <Building2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {marketStats.stocks.gainers}/{marketStats.stocks.losers}
              </div>
              <p className="text-xs text-muted-foreground">Tăng/Giảm</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Crypto Market</CardTitle>
              <Coins className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                ${(marketStats.crypto.totalMarketCap / 1e12).toFixed(2)}T
              </div>
              <p className="text-xs text-muted-foreground">Tổng vốn hóa</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${(marketStats.crypto.totalVolume / 1e9).toFixed(1)}B
              </div>
              <p className="text-xs text-muted-foreground">Khối lượng giao dịch</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Update</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {new Date(marketStats.lastUpdate).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              <p className="text-xs text-muted-foreground">Cập nhật lần cuối</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm mã chứng khoán..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="stocks">Chứng khoán</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marketCap">Vốn hóa</SelectItem>
                  <SelectItem value="price">Giá</SelectItem>
                  <SelectItem value="changePercent">% Thay đổi</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              >
                {sortOrder === 'desc' ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadMarketData}
                disabled={loading}
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {filteredAndSortedData.map((asset) => (
                <div
                  key={`${asset.type}-${asset.symbol}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleWatchlist(asset.symbol)}
                      className="p-0 h-auto"
                    >
                      <Star 
                        className={cn(
                          "h-4 w-4",
                          watchlist.includes(asset.symbol) 
                            ? "fill-yellow-400 text-yellow-400" 
                            : "text-muted-foreground"
                        )} 
                      />
                    </Button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{asset.symbol}</span>
                        <Badge variant={asset.type === 'stock' ? 'default' : 'secondary'}>
                          {asset.type === 'stock' ? (
                            <Building2 className="h-3 w-3 mr-1" />
                          ) : (
                            <Coins className="h-3 w-3 mr-1" />
                          )}
                          {asset.type === 'stock' ? 'STOCK' : 'CRYPTO'}
                        </Badge>
                        {asset.exchange && (
                          <Badge variant="outline" className="text-xs">
                            {asset.exchange}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {asset.name}
                        {asset.sector && ` • ${asset.sector}`}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-8 text-right">
                    <div>
                      <p className="font-semibold">
                        {formatPrice(asset.price, asset.type)}
                      </p>
                      <p className="text-xs text-muted-foreground">Giá hiện tại</p>
                    </div>
                    <div>
                      <p className={cn(
                        "font-semibold",
                        asset.changePercent > 0 ? "text-green-600" : 
                        asset.changePercent < 0 ? "text-red-600" : "text-muted-foreground"
                      )}>
                        {asset.changePercent > 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                      </p>
                      <p className="text-xs text-muted-foreground">24h</p>
                    </div>
                    <div>
                      <p className="font-semibold">
                        {asset.marketCap ? formatMarketCap(asset.marketCap, asset.type) : 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground">Vốn hóa</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Markets;
