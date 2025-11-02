import { useEffect, useRef, useState } from "react";
import { createMockPriceStream, type PriceTick } from "../services/priceStream";

export function usePriceFeed(symbol: string) {
  const streamRef = useRef<ReturnType<typeof createMockPriceStream> | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [history, setHistory] = useState<PriceTick[]>([]);
  const [isPaused, setPaused] = useState(false);

  useEffect(() => {
    streamRef.current = createMockPriceStream();
    const unsub = streamRef.current.subscribe((t) => {
      setPrice(t.price);
      setHistory((h) => [...h.slice(-240), t]); // keep a small rolling window
    });
    return () => {
      unsub();
      streamRef.current?.close();
    };
  }, [symbol]);

  const togglePause = () => {
    setPaused((p) => {
      const next = !p;
      if (next) {
        streamRef.current?.pause();
      } else {
        streamRef.current?.resume();
      }
      return next;
    });
  };

  return { price, history, isPaused, togglePause };
}
