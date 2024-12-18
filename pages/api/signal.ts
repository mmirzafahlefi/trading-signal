import { NextApiRequest, NextApiResponse } from "next";
import Binance, { Candle } from "binance-api-node";

// Konfigurasi Binance Client
const client = Binance({
  apiKey: process.env.BINANCE_API_KEY || "",
  apiSecret: process.env.BINANCE_SECRET_KEY || "",
});

// Definisi tipe data untuk respons sinyal
interface SignalResponse {
  symbol: string;
  interval: string;
  currentPrice: string;
  signal: "buy" | "sell" | "hold";
  sl: string;
  tp: string;
}

interface SignalResult {
  signal: "buy" | "sell" | "hold";
  sl: string;
  tp: string;
}

// Fungsi untuk menghitung sinyal
const calculateSignal = (priceData: Candle[]): SignalResult => {
  const closePrices = priceData.map((candle) => parseFloat(candle.close));
  const currentPrice = closePrices[closePrices.length - 1];
  const averagePrice = closePrices.reduce((a, b) => a + b, 0) / closePrices.length;

  let signal: "buy" | "sell" | "hold" = "hold";
  let sl: string, tp: string;

  if (currentPrice > averagePrice) {
    signal = "buy";
    sl = (currentPrice * 0.98).toFixed(2); // Stop Loss 2% di bawah
    tp = (currentPrice * 1.02).toFixed(2); // Take Profit 2% di atas
  } else if (currentPrice < averagePrice) {
    signal = "sell";
    sl = (currentPrice * 1.02).toFixed(2); // Stop Loss 2% di atas
    tp = (currentPrice * 0.98).toFixed(2); // Take Profit 2% di bawah
  } else {
    sl = "0";
    tp = "0";
  }

  return { signal, sl, tp };
};

// Endpoint API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { symbol = "BTCUSDT", interval = "1h" } = req.query as { symbol: string; interval: string };

    // Mendapatkan data historis
    const candles = await client.candles({ symbol, interval, limit: 50 });
    const { signal, sl, tp } = calculateSignal(candles);

    const currentPrice = parseFloat(candles[candles.length - 1].close).toFixed(2);

    const response: SignalResponse = {
      symbol,
      interval,
      currentPrice,
      signal,
      sl,
      tp,
    };

    res.status(200).json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
