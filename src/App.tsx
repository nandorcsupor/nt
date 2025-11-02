import TickerPnLCard from "./components/TickerPnLCard";

export default function App() {
  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <TickerPnLCard
        symbol="BTC-PERP"
        side="short"
        entryPrice={67250}
        size={100}
      />
    </div>
  );
}
