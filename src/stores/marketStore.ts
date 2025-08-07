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
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false'
      );
      const data = await response.json();
      set({ cryptoData: data });
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      // Fallback data
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