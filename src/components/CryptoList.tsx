import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const FALLBACK_CRYPTO_DATA = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'btc',
    current_price: 95234,
    price_change_percentage_24h: 2.4,
    total_volume: 45234567890,
    image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png'
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'eth',
    current_price: 3456,
    price_change_percentage_24h: -1.2,
    total_volume: 23456789012,
    image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png'
  },
  {
    id: 'ripple',
    name: 'XRP',
    symbol: 'xrp',
    current_price: 2.45,
    price_change_percentage_24h: 5.7,
    total_volume: 8765432109,
    image: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png'
  },
  {
    id: 'cardano',
    name: 'Cardano',
    symbol: 'ada',
    current_price: 1.12,
    price_change_percentage_24h: 3.8,
    total_volume: 2345678901,
    image: 'https://assets.coingecko.com/coins/images/975/small/cardano.png'
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'sol',
    current_price: 234.56,
    price_change_percentage_24h: -2.1,
    total_volume: 5432109876,
    image: 'https://assets.coingecko.com/coins/images/4128/small/solana.png'
  }
];

const fetchCryptoData = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false',
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
    return data.length > 0 ? data : FALLBACK_CRYPTO_DATA;
  } catch (error) {
    console.warn('Failed to fetch live crypto data, using fallback:', error);
    return FALLBACK_CRYPTO_DATA;
  }
};

const CryptoList = () => {
  const { data: cryptos, isLoading, error } = useQuery({
    queryKey: ['cryptos'],
    queryFn: fetchCryptoData,
    refetchInterval: 60000, // Refetch every 60 seconds (reduced frequency)
    retry: 2, // Retry failed requests 2 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  if (isLoading) {
    return <div className="glass-card rounded-lg p-6 animate-pulse">Loading cryptocurrency data...</div>;
  }

  // Always show data (either live or fallback), even if there's an error
  const displayData = cryptos || FALLBACK_CRYPTO_DATA;

  return (
    <div className="glass-card rounded-lg p-3 sm:p-4 lg:p-6 animate-fade-in">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Top Cryptocurrencies</h2>
      <div className="overflow-x-auto -mx-3 sm:mx-0">
        <table className="w-full min-w-[480px] sm:min-w-0">
          <thead>
            <tr className="text-left text-xs sm:text-sm text-muted-foreground">
              <th className="pb-3 sm:pb-4 pl-3 sm:pl-0">Name</th>
              <th className="pb-3 sm:pb-4">Price</th>
              <th className="pb-3 sm:pb-4 hidden sm:table-cell">24h Change</th>
              <th className="pb-3 sm:pb-4 sm:hidden">Change</th>
              <th className="pb-3 sm:pb-4 hidden md:table-cell">Volume</th>
            </tr>
          </thead>
          <tbody>
            {cryptos?.map((crypto) => (
              <tr key={crypto.symbol} className="border-t border-secondary">
                <td className="py-3 sm:py-4 pl-3 sm:pl-0">
                  <div className="flex items-center gap-2">
                    <img src={crypto.image} alt={crypto.name} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" />
                    <div>
                      <p className="font-medium text-sm sm:text-base">{crypto.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{crypto.symbol.toUpperCase()}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 sm:py-4 text-sm sm:text-base">
                  ${crypto.current_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 sm:py-4">
                  <span
                    className={`flex items-center gap-1 text-xs sm:text-sm ${
                      crypto.price_change_percentage_24h >= 0 ? "text-success" : "text-warning"
                    }`}
                  >
                    {crypto.price_change_percentage_24h >= 0 ? (
                      <ArrowUpIcon className="w-2 h-2 sm:w-3 sm:h-3" />
                    ) : (
                      <ArrowDownIcon className="w-2 h-2 sm:w-3 sm:h-3" />
                    )}
                    {Math.abs(crypto.price_change_percentage_24h).toFixed(1)}%
                  </span>
                </td>
                <td className="py-3 sm:py-4 hidden md:table-cell text-sm">
                  ${(crypto.total_volume / 1e9).toFixed(1)}B
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CryptoList;
