interface MarketAsset {
  symbol: string;
  name: string;
  type: 'crypto' | 'stock';
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  lastUpdate: string;
  exchange?: string;
  sector?: string;
}

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  marketCap: number;
  pe: number;
  eps: number;
  exchange: string;
  sector: string;
  lastUpdate: string;
}

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap: number;
  rank: number;
  supply: number;
  maxSupply?: number;
  lastUpdate: string;
}

class MarketDataService {
  private wsConnections: Map<string, WebSocket> = new Map();
  private priceCache: Map<string, MarketAsset> = new Map();
  private updateCallbacks: Map<string, Function[]> = new Map();

  // Vietnamese stocks from CafeF and other sources
  async getVietnamStocks(): Promise<StockData[]> {
    try {
      // Mock API call to CafeF or other Vietnamese stock APIs
      // In production, you'd call actual APIs like:
      // - CafeF API
      // - VietStock API
      // - SSI API
      // - HOSE/HNX official APIs
      
      // Generate realistic dynamic stock data
      const basePrice = 42500;
      const variation = (Math.random() - 0.5) * 2000; // ±1000 VND variation
      const currentPrice = basePrice + variation;
      const change = variation;
      const changePercent = (change / basePrice) * 100;

      const dynamicStocks: StockData[] = [
        {
          symbol: 'VIC',
          name: 'Tập đoàn Vingroup',
          price: Math.round(currentPrice),
          change: Math.round(change),
          changePercent: Math.round(changePercent * 100) / 100,
          volume: Math.floor(Math.random() * 2000000 + 1500000),
          high: Math.round(currentPrice + Math.abs(variation) * 0.5),
          low: Math.round(currentPrice - Math.abs(variation) * 0.5),
          open: Math.round(basePrice + (Math.random() - 0.5) * 500),
          previousClose: basePrice,
          marketCap: 195000000000000,
          pe: 15.2,
          eps: 2800,
          exchange: 'HOSE',
          sector: 'Bất động sản',
          lastUpdate: new Date().toISOString()
        },
        {
          symbol: 'VCB',
          name: 'Ngân hàng TMCP Ngoại thương Việt Nam',
          price: Math.round(82300 + (Math.random() - 0.5) * 1500),
          change: Math.round((Math.random() - 0.5) * 800),
          changePercent: Math.round((Math.random() - 0.5) * 2 * 100) / 100,
          volume: Math.floor(Math.random() * 2000000 + 1500000),
          high: 83500,
          low: 81900,
          open: 83000,
          previousClose: 83000,
          marketCap: 418000000000000,
          pe: 10.8,
          eps: 7620,
          exchange: 'HOSE',
          sector: 'Ngân h��ng',
          lastUpdate: new Date().toISOString()
        },
        {
          symbol: 'VHM',
          name: 'Công ty CP Vinhomes',
          price: 55200,
          change: 1200,
          changePercent: 2.22,
          volume: 3200000,
          high: 55800,
          low: 53800,
          open: 54000,
          previousClose: 54000,
          marketCap: 158000000000000,
          pe: 12.5,
          eps: 4416,
          exchange: 'HOSE',
          sector: 'Bất động sản',
          lastUpdate: new Date().toISOString()
        },
        {
          symbol: 'TCB',
          name: 'Ngân hàng TMCP Kỹ thương Việt Nam',
          price: 23450,
          change: 150,
          changePercent: 0.64,
          volume: 5600000,
          high: 23700,
          low: 23200,
          open: 23300,
          previousClose: 23300,
          marketCap: 75000000000000,
          pe: 6.8,
          eps: 3450,
          exchange: 'HOSE',
          sector: 'Ngân hàng',
          lastUpdate: new Date().toISOString()
        },
        {
          symbol: 'MSN',
          name: 'Công ty CP Tập đoàn Masan',
          price: 68500,
          change: -500,
          changePercent: -0.72,
          volume: 1200000,
          high: 69200,
          low: 67800,
          open: 69000,
          previousClose: 69000,
          marketCap: 158000000000000,
          pe: 18.5,
          eps: 3703,
          exchange: 'HOSE',
          sector: 'Hàng tiêu dùng',
          lastUpdate: new Date().toISOString()
        }
      ];

      return dynamicStocks;
    } catch (error) {
      console.error('Error fetching Vietnam stocks:', error);
      return [];
    }
  }

  // Enhanced crypto data
  async getCryptoData(): Promise<CryptoData[]> {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h'
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch crypto data');
      }

      const data = await response.json();
      
      return data.map((coin: any): CryptoData => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        change24h: coin.price_change_24h || 0,
        changePercent24h: coin.price_change_percentage_24h || 0,
        volume24h: coin.total_volume || 0,
        marketCap: coin.market_cap || 0,
        rank: coin.market_cap_rank || 0,
        supply: coin.circulating_supply || 0,
        maxSupply: coin.max_supply,
        lastUpdate: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching crypto data:', error);

      // Fallback crypto data when API fails
      const fallbackCrypto: CryptoData[] = [
        {
          id: 'bitcoin',
          symbol: 'BTC',
          name: 'Bitcoin',
          price: 43500 + (Math.random() - 0.5) * 2000,
          change24h: (Math.random() - 0.5) * 1000,
          changePercent24h: (Math.random() - 0.5) * 5,
          volume24h: 28000000000 + Math.random() * 5000000000,
          marketCap: 850000000000,
          rank: 1,
          supply: 19500000,
          maxSupply: 21000000,
          lastUpdate: new Date().toISOString()
        },
        {
          id: 'ethereum',
          symbol: 'ETH',
          name: 'Ethereum',
          price: 2650 + (Math.random() - 0.5) * 200,
          change24h: (Math.random() - 0.5) * 100,
          changePercent24h: (Math.random() - 0.5) * 4,
          volume24h: 15000000000 + Math.random() * 3000000000,
          marketCap: 320000000000,
          rank: 2,
          supply: 120500000,
          lastUpdate: new Date().toISOString()
        },
        {
          id: 'binancecoin',
          symbol: 'BNB',
          name: 'BNB',
          price: 320 + (Math.random() - 0.5) * 20,
          change24h: (Math.random() - 0.5) * 15,
          changePercent24h: (Math.random() - 0.5) * 3,
          volume24h: 1200000000 + Math.random() * 300000000,
          marketCap: 48000000000,
          rank: 3,
          supply: 150000000,
          maxSupply: 200000000,
          lastUpdate: new Date().toISOString()
        }
      ];

      return fallbackCrypto;
    }
  }

  // Combined market data
  async getAllMarketData(): Promise<MarketAsset[]> {
    try {
      const [stocks, crypto] = await Promise.all([
        this.getVietnamStocks(),
        this.getCryptoData()
      ]);

      const stockAssets: MarketAsset[] = stocks.map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        type: 'stock' as const,
        price: stock.price,
        change: stock.change,
        changePercent: stock.changePercent,
        volume: stock.volume,
        marketCap: stock.marketCap,
        lastUpdate: stock.lastUpdate,
        exchange: stock.exchange,
        sector: stock.sector
      }));

      const cryptoAssets: MarketAsset[] = crypto.slice(0, 20).map(coin => ({
        symbol: coin.symbol,
        name: coin.name,
        type: 'crypto' as const,
        price: coin.price,
        change: coin.change24h,
        changePercent: coin.changePercent24h,
        volume: coin.volume24h,
        marketCap: coin.marketCap,
        lastUpdate: coin.lastUpdate
      }));

      return [...stockAssets, ...cryptoAssets];
    } catch (error) {
      console.error('Error fetching market data:', error);
      return [];
    }
  }

  // Real-time price updates
  subscribeToPrice(symbol: string, callback: (data: MarketAsset) => void): () => void {
    if (!this.updateCallbacks.has(symbol)) {
      this.updateCallbacks.set(symbol, []);
    }
    
    this.updateCallbacks.get(symbol)!.push(callback);

    // Start real-time updates if not already started
    this.startRealTimeUpdates(symbol);

    // Return unsubscribe function
    return () => {
      const callbacks = this.updateCallbacks.get(symbol) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      
      if (callbacks.length === 0) {
        this.stopRealTimeUpdates(symbol);
      }
    };
  }

  private startRealTimeUpdates(symbol: string) {
    if (this.wsConnections.has(symbol)) {
      return; // Already connected
    }

    // Simulate real-time updates with intervals
    // In production, use WebSocket connections to exchanges
    const interval = setInterval(async () => {
      try {
        const marketData = await this.getAllMarketData();
        const asset = marketData.find(item => item.symbol === symbol);
        
        if (asset) {
          // Add small random variation to simulate real-time changes
          const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
          asset.price = asset.price * (1 + variation);
          asset.change = asset.change + (asset.price * variation);
          asset.changePercent = (asset.change / (asset.price - asset.change)) * 100;
          asset.lastUpdate = new Date().toISOString();

          this.priceCache.set(symbol, asset);
          
          // Notify all subscribers
          const callbacks = this.updateCallbacks.get(symbol) || [];
          callbacks.forEach(callback => callback(asset));
        }
      } catch (error) {
        console.error(`Error updating ${symbol}:`, error);
      }
    }, 5000); // Update every 5 seconds

    // Store interval reference as a mock WebSocket
    this.wsConnections.set(symbol, { close: () => clearInterval(interval) } as any);
  }

  private stopRealTimeUpdates(symbol: string) {
    const ws = this.wsConnections.get(symbol);
    if (ws) {
      ws.close();
      this.wsConnections.delete(symbol);
    }
  }

  // Get specific asset data
  async getAssetData(symbol: string, type: 'crypto' | 'stock'): Promise<MarketAsset | null> {
    try {
      const allData = await this.getAllMarketData();
      return allData.find(asset => asset.symbol === symbol && asset.type === type) || null;
    } catch (error) {
      console.error(`Error fetching ${symbol} data:`, error);
      return null;
    }
  }

  // Market statistics
  async getMarketStats() {
    try {
      const [stocks, crypto] = await Promise.all([
        this.getVietnamStocks(),
        this.getCryptoData()
      ]);

      const stockStats = {
        totalValue: stocks.reduce((sum, stock) => sum + stock.marketCap, 0),
        gainers: stocks.filter(stock => stock.changePercent > 0).length,
        losers: stocks.filter(stock => stock.changePercent < 0).length,
        unchanged: stocks.filter(stock => stock.changePercent === 0).length,
        totalVolume: stocks.reduce((sum, stock) => sum + stock.volume, 0)
      };

      const cryptoStats = {
        totalMarketCap: crypto.reduce((sum, coin) => sum + coin.marketCap, 0),
        totalVolume: crypto.reduce((sum, coin) => sum + coin.volume24h, 0),
        gainers: crypto.filter(coin => coin.changePercent24h > 0).length,
        losers: crypto.filter(coin => coin.changePercent24h < 0).length,
        btcDominance: crypto.find(coin => coin.symbol === 'BTC')?.marketCap || 0
      };

      return {
        stocks: stockStats,
        crypto: cryptoStats,
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching market stats:', error);
      return null;
    }
  }

  // Cleanup all connections
  dispose() {
    this.wsConnections.forEach(ws => ws.close());
    this.wsConnections.clear();
    this.updateCallbacks.clear();
    this.priceCache.clear();
  }
}

export const marketDataService = new MarketDataService();
export type { MarketAsset, StockData, CryptoData };
