interface SignalCardProps {
  symbol: string;
  currentPrice: string;
  signal: "buy" | "sell" | "hold";
  sl: string;
  tp: string;
}

const SignalCard: React.FC<SignalCardProps> = ({ symbol, currentPrice, signal, sl, tp }) => (
  <div className="p-4 bg-green-100 rounded-xl">
    <h2 className="text-lg font-bold">{symbol}</h2>
    <p>Current Price: ${currentPrice}</p>
    <p>
      Signal:{" "}
      <span className={signal === "buy" ? "text-green-500" : signal === "sell" ? "text-red-500" : "text-gray-500"}>
        {signal}
      </span>
    </p>
    <p>Stop Loss (SL): ${sl}</p>
    <p>Take Profit (TP): ${tp}</p>
  </div>
);

export default SignalCard;
