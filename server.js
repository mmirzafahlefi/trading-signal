const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3001 });

wss.on("connection", (ws) => {
  console.log("Client connected");

  const sendSignal = () => {
    const signal = {
      symbol: "BTCUSDT",
      interval: "1h",
      currentPrice: (Math.random() * 50000 + 10000).toFixed(2),
      signal: Math.random() > 0.5 ? "buy" : "sell",
      sl: (Math.random() * 100).toFixed(2),
      tp: (Math.random() * 100).toFixed(2),
    };
    ws.send(JSON.stringify(signal));
  };

  // Kirim sinyal setiap 5 detik
  const interval = setInterval(sendSignal, 5000);

  ws.on("close", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

console.log("WebSocket server running on ws://localhost:3001");
