import { create } from 'zustand';
import { CryptoData, MarketStats } from '@/types';

interface MarketState {
  cryptoData: CryptoData[];
  marketStats: MarketStats | null;
  loading: boolean;
  fetchCryptoData: () => Promise<void>;
  fetchMarketStats: () => Promise<void>;
}

export const useMarketStore = create<MarketState>((set) => ({
  cryptoData: [],
  marketStats: null,
  loading: false,

  fetchCryptoData: async () => {
    set({ loading: true });
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false',
        {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        set({ cryptoData: data });
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.warn('Failed to fetch live crypto data, using fallback:', error);
      // Enhanced fallback data with more realistic values
      set({
        cryptoData: [
          {
            id: 'bitcoin',
            name: 'Bitcoin',
            symbol: 'BTC',
            current_price: 95234,
            price_change_percentage_24h: 2.4,
            market_cap: 1893456789000,
            total_volume: 45234567890,
            image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png'
          },
          {
            id: 'ethereum',
            name: 'Ethereum',
            symbol: 'ETH',
            current_price: 3456,
            price_change_percentage_24h: -1.2,
            market_cap: 415678901234,
            total_volume: 23456789012,
            image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png'
          },
          {
            id: 'ripple',
            name: 'XRP',
            symbol: 'XRP',
            current_price: 2.45,
            price_change_percentage_24h: 5.7,
            market_cap: 139876543210,
            total_volume: 8765432109,
            image: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png'
          },
          {
            id: 'cardano',
            name: 'Cardano',
            symbol: 'ADA',
            current_price: 1.12,
            price_change_percentage_24h: 3.8,
            market_cap: 39876543210,
            total_volume: 2345678901,
            image: 'https://assets.coingecko.com/coins/images/975/small/cardano.png'
          },
          {
            id: 'solana',
            name: 'Solana',
            symbol: 'SOL',
            current_price: 234.56,
            price_change_percentage_24h: -2.1,
            market_cap: 110123456789,
            total_volume: 5432109876,
            image: 'https://assets.coingecko.com/coins/images/4128/small/solana.png'
          }
        ]
      });
    } finally {
      set({ loading: false });
    }
  },

  fetchMarketStats: async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/global'
      );
      const data = await response.json();
      
      set({
        marketStats: {
          market_cap: data.data?.total_market_cap?.usd || 2100000000000,
          volume_24h: data.data?.total_volume?.usd || 84200000000,
          btc_dominance: data.data?.market_cap_percentage?.btc || 42.1,
          market_cap_change_24h: 2.4,
          volume_change_24h: 5.1
        }
      });
    } catch (error) {
      console.error('Error fetching market stats:', error);
      // Fallback data
      set({
        marketStats: {
          market_cap: 2100000000000,
          volume_24h: 84200000000,
          btc_dominance: 42.1,
          market_cap_change_24h: 2.4,
          volume_change_24h: 5.1
        }
      });
    }
  },
}));
