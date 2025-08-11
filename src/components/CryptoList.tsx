import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const fetchCryptoData = async () => {
  const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const CryptoList = () => {
  const { data: cryptos, isLoading } = useQuery({
    queryKey: ['cryptos'],
    queryFn: fetchCryptoData,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return <div className="glass-card rounded-lg p-6 animate-pulse">Loading...</div>;
  }

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
