import { useMemo } from "react";
import { usePriceFeed } from "../hooks/usePriceFeed";
import { pnlPct, pnlAbsFromPct } from "../helpers/pnl";

interface TickerPnLCardProps {
  symbol: string;
  side: "long" | "short";
  entryPrice: number;
  size?: number;
}

export default function TickerPnLCard({
  symbol,
  side,
  entryPrice,
  size = 0,
}: TickerPnLCardProps) {
  const { price, isPaused, togglePause, history } = usePriceFeed(symbol);

  const pnlPercentage = useMemo(() => {
    if (price === null) return 0;
    return pnlPct(side, entryPrice, price);
  }, [side, entryPrice, price]);

  const pnlDollar = useMemo(() => {
    if (!size) return null;
    return pnlAbsFromPct(pnlPercentage, size);
  }, [pnlPercentage, size]);

  const oneMinChange = useMemo(() => {
    if (history.length < 2 || price === null) return null;
    // Find the tick closest to 60 seconds ago
    const now = Date.now();
    const oneMinAgo = history.filter((t) => now - t.ts >= 60000).at(-1); // Last element that's >= 60s old (closest to 60s)
    if (!oneMinAgo) return null;
    return ((price - oneMinAgo.price) / oneMinAgo.price) * 100;
  }, [history, price]);

  const isPositive = pnlPercentage >= 0;
  const pnlColorClass = isPositive ? "text-green-500" : "text-red-500";
  const bgColorClass = isPositive
    ? "bg-green-50 border-green-200"
    : "bg-red-50 border-red-200";

  return (
    <div
      className={`border-2 rounded-lg p-6 w-96 shadow-lg transition-colors ${bgColorClass}`}
      role="article"
      aria-label={`${symbol} ticker and PnL card`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{symbol}</h2>
        <button
          onClick={togglePause}
          className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
          aria-label={isPaused ? "Resume price updates" : "Pause price updates"}
        >
          {isPaused ? "▶ Resume" : "⏸ Pause"}
        </button>
      </div>

      {/* Current Price */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 font-medium">Current Price</p>
        <p className="text-3xl font-bold text-gray-900">
          {price !== null ? `$${price.toLocaleString()}` : "Loading..."}
        </p>
      </div>

      {/* Position Info */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase">Position</p>
          <p className="text-lg font-semibold text-gray-800 capitalize">
            {side}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Entry Price</p>
          <p className="text-lg font-semibold text-gray-800">
            ${entryPrice.toLocaleString()}
          </p>
        </div>
        <div>
          {oneMinChange !== null && (
            <>
              <p className="text-xs text-gray-500 uppercase">1-min:</p>
              <p className="text-lg font-semibold text-gray-800">
                {oneMinChange > 0 ? "+" : ""}
                {oneMinChange.toFixed(2)}%
              </p>
            </>
          )}
        </div>
      </div>

      {/* PnL Section */}
      <div className="border-t-2 border-gray-300 pt-4">
        <p className="text-sm text-gray-600 font-medium mb-2">Profit & Loss</p>
        <div className="flex items-baseline gap-3">
          <p
            className={`text-4xl font-bold ${pnlColorClass}`}
            aria-label={`PnL percentage: ${pnlPercentage.toFixed(2)}%`}
          >
            {isPositive ? "+" : ""}
            {pnlPercentage.toFixed(2)}%
          </p>
          {pnlDollar !== null && (
            <p
              className={`text-xl font-semibold ${pnlColorClass}`}
              aria-label={`PnL in dollars: ${pnlDollar.toFixed(2)}`}
            >
              ({isPositive ? "+" : ""}${pnlDollar.toFixed(2)})
            </p>
          )}
        </div>
      </div>

      {/* Status indicator */}
      {isPaused && (
        <div className="mt-4 text-center">
          <span className="inline-block px-3 py-1 bg-yellow-200 text-yellow-800 text-xs font-semibold rounded-full">
            Updates Paused
          </span>
        </div>
      )}
    </div>
  );
}
