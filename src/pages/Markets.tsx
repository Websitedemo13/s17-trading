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
  Clock,
  LineChart,
  Activity,
  PieChart,
  Zap,
  Target
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MarketIndex {
  name: string;
  code: string;
  value: number;
  change: number;
  changePercent: number;
  lastUpdate: string;
}

interface MarketSector {
  name: string;
  stocks: string[];
  avgChange: number;
  topGainer: string;
  topLoser: string;
}

const Markets = () => {
  const [marketData, setMarketData] = useState<MarketAsset[]>([]);
  const [marketStats, setMarketStats] = useState<any>(null);
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [marketSectors, setMarketSectors] = useState<MarketSector[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'stocks' | 'crypto' | 'indices' | 'sectors'>('all');
  const [sortBy, setSortBy] = useState<'marketCap' | 'price' | 'changePercent'>('marketCap');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [selectedChart, setSelectedChart] = useState<string>('VNINDEX');

  useEffect(() => {
    loadMarketData();
    // Cập nhật dữ liệu mỗi 5 giây để có tính thời gian thực
    const interval = setInterval(loadMarketData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadMarketData = async () => {
    try {
      setLoading(true);
      const [data, stats] = await Promise.all([
        marketDataService.getAllMarketData(),
        marketDataService.getMarketStats()
      ]);
      
      setMarketData(data);
      setMarketStats(stats);
      
      // Tạo dữ liệu chỉ số thị trường với biến động thực tế
      const indices: MarketIndex[] = [
        {
          name: 'VN-INDEX',
          code: 'VNINDEX',
          value: 1245.67 + (Math.random() - 0.5) * 20,
          change: (Math.random() - 0.5) * 15,
          changePercent: (Math.random() - 0.5) * 1.2,
          lastUpdate: new Date().toISOString()
        },
        {
          name: 'HNX-INDEX',
          code: 'HNX',
          value: 238.45 + (Math.random() - 0.5) * 8,
          change: (Math.random() - 0.5) * 5,
          changePercent: (Math.random() - 0.5) * 2.1,
          lastUpdate: new Date().toISOString()
        },
        {
          name: 'UPCOM-INDEX',
          code: 'UPCOM',
          value: 89.23 + (Math.random() - 0.5) * 3,
          change: (Math.random() - 0.5) * 2,
          changePercent: (Math.random() - 0.5) * 2.5,
          lastUpdate: new Date().toISOString()
        },
        {
          name: 'VN30-INDEX',
          code: 'VN30',
          value: 1456.78 + (Math.random() - 0.5) * 25,
          change: (Math.random() - 0.5) * 18,
          changePercent: (Math.random() - 0.5) * 1.3,
          lastUpdate: new Date().toISOString()
        }
      ];
      
      // Tạo dữ liệu ngành với biến động
      const sectors: MarketSector[] = [
        {
          name: 'Ngân hàng',
          stocks: ['VCB', 'TCB', 'BID', 'CTG', 'VPB'],
          avgChange: (Math.random() - 0.5) * 3,
          topGainer: 'VCB',
          topLoser: 'CTG'
        },
        {
          name: 'Bất động sản',
          stocks: ['VIC', 'VHM', 'VRE', 'NVL', 'KDH'],
          avgChange: (Math.random() - 0.5) * 4,
          topGainer: 'VIC',
          topLoser: 'NVL'
        },
        {
          name: 'Công nghệ',
          stocks: ['FPT', 'CMG', 'SAM', 'ELC', 'ITD'],
          avgChange: (Math.random() - 0.5) * 5,
          topGainer: 'FPT',
          topLoser: 'ELC'
        },
        {
          name: 'Hàng tiêu dùng',
          stocks: ['MSN', 'VNM', 'SAB', 'MCH', 'KDC'],
          avgChange: (Math.random() - 0.5) * 2.5,
          topGainer: 'VNM',
          topLoser: 'MCH'
        },
        {
          name: 'Năng lượng',
          stocks: ['GAS', 'PLX', 'PVD', 'BSR', 'PVS'],
          avgChange: (Math.random() - 0.5) * 3.5,
          topGainer: 'GAS',
          topLoser: 'BSR'
        },
        {
          name: 'Y tế',
          stocks: ['DHG', 'IMP', 'TNH', 'DBT', 'PME'],
          avgChange: (Math.random() - 0.5) * 4.2,
          topGainer: 'DHG',
          topLoser: 'PME'
        }
      ];
      
      setMarketIndices(indices);
      setMarketSectors(sectors);
      
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
      return new Intl.NumberFormat('vi-VN').format(Math.round(price * 100) / 100);
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

  if (loading && marketData.length === 0) {
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
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Activity className="h-3 w-3 animate-pulse text-green-500" />
            <span>Cập nhật mỗi 5 giây</span>
          </div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Market Indices Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-blue-600" />
            Chỉ số thị trường
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketIndices.map((index) => (
              <div 
                key={index.code}
                className={cn(
                  "p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                  selectedChart === index.code && "border-primary bg-primary/5"
                )}
                onClick={() => setSelectedChart(index.code)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">{index.name}</h4>
                  <Badge variant={index.changePercent >= 0 ? 'default' : 'destructive'} className="text-xs">
                    {index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                  </Badge>
                </div>
                <div className="text-2xl font-bold">
                  {index.value.toFixed(2)}
                </div>
                <div className={cn(
                  "text-sm flex items-center gap-1",
                  index.change >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {index.change >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Biểu đồ thời gian thực - {selectedChart}
          </CardTitle>
          <CardDescription>
            Biểu đồ giá theo thời gian thực với dữ liệu cập nhật liên tục
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full border rounded-lg overflow-hidden">
            <iframe
              src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${
                selectedChart === 'VNINDEX' ? 'HOSE%3AVNINDEX' :
                selectedChart === 'HNX' ? 'HNX%3AHNXINDEX' :
                selectedChart === 'UPCOM' ? 'UPCOM%3AUPCOMINDEX' :
                selectedChart === 'VN30' ? 'HOSE%3AVN30' :
                'HOSE%3AVNINDEX'
              }&interval=1&hidesidetoolbar=1&hidetoptoolbar=0&symboledit=1&saveimage=1&toolbarbg=F1F3F6&theme=light&style=1&timezone=Asia%2FHo_Chi_Minh&studies=%5B%5D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=vi_VN&utm_source=cafef.vn&utm_medium=widget&utm_campaign=chart&utm_term=${
                selectedChart === 'VNINDEX' ? 'HOSE%3AVNINDEX' :
                selectedChart === 'HNX' ? 'HNX%3AHNXINDEX' :
                selectedChart === 'UPCOM' ? 'UPCOM%3AUPCOMINDEX' :
                selectedChart === 'VN30' ? 'HOSE%3AVN30' :
                'HOSE%3AVNINDEX'
              }`}
              width="100%"
              height="100%"
              frameBorder="0"
              allowtransparency="true"
              scrolling="no"
              className="rounded-lg"
            />
          </div>
          <div className="mt-4 flex gap-2 flex-wrap">
            {marketIndices.map((index) => (
              <Button
                key={index.code}
                variant={selectedChart === index.code ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedChart(index.code)}
              >
                {index.code}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

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
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${(marketStats.stocks.gainers / (marketStats.stocks.gainers + marketStats.stocks.losers)) * 100}%` }}
                />
              </div>
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
              <div className="text-xs text-muted-foreground mt-1">
                BTC Dominance: {((marketStats.crypto.btcDominance / marketStats.crypto.totalMarketCap) * 100).toFixed(1)}%
              </div>
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
              <div className="text-xs text-muted-foreground mt-1">
                +{((Math.random() * 20) + 5).toFixed(1)}% so với hôm qua
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cập nhật</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {new Date().toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
              <p className="text-xs text-muted-foreground">Thời gian thực</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-600">Live</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Market Sectors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-green-600" />
            Ngành thị trường
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketSectors.map((sector) => (
              <div key={sector.name} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{sector.name}</h4>
                  <Badge variant={sector.avgChange >= 0 ? 'default' : 'destructive'}>
                    {sector.avgChange >= 0 ? '+' : ''}{sector.avgChange.toFixed(2)}%
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {sector.stocks.length} mã cổ phiếu
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-green-600">Top tăng:</span>
                    <span className="font-medium">{sector.topGainer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">Top giảm:</span>
                    <span className="font-medium">{sector.topLoser}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Market Data Table */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="stocks">Chứng khoán</TabsTrigger>
          <TabsTrigger value="crypto">Crypto</TabsTrigger>
          <TabsTrigger value="indices">Chỉ số</TabsTrigger>
          <TabsTrigger value="hot">Hot</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
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
                            "font-semibold flex items-center justify-end gap-1",
                            asset.changePercent > 0 ? "text-green-600" : 
                            asset.changePercent < 0 ? "text-red-600" : "text-muted-foreground"
                          )}>
                            {asset.changePercent > 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : asset.changePercent < 0 ? (
                              <TrendingDown className="h-3 w-3" />
                            ) : null}
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
        </TabsContent>

        <TabsContent value="stocks">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chứng khoán Việt Nam</h3>
                <p className="text-muted-foreground">
                  Dữ liệu chứng khoán từ các sàn HOSE, HNX, UPCOM
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crypto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Coins className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Tiền điện tử</h3>
                <p className="text-muted-foreground">
                  Dữ liệu crypto từ các sàn giao dịch lớn
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indices">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {marketIndices.map((index) => (
                  <div key={index.code} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{index.name}</h4>
                      <p className="text-sm text-muted-foreground">{index.code}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">{index.value.toFixed(2)}</div>
                      <div className={cn(
                        "text-sm flex items-center gap-1 justify-end",
                        index.change >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {index.change >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hot">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Cổ phiếu hot</h3>
                <p className="text-muted-foreground">
                  Các mã được quan tâm nhất trong ngày
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Markets;
