import { useEffect, useState } from "react";
import SignalCard from "../components/SignalCard";

interface SignalResponse {
  symbol: string;
  interval: string;
  currentPrice: string;
  signal: "buy" | "sell" | "hold";
  sl: string;
  tp: string;
}

export default function Home() {
  const [signalData, setSignalData] = useState<SignalResponse | null>(null);
  const [history, setHistory] = useState<SignalResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [interval, setInterval] = useState("1h");

  // WebSocket State
  const [socketConnected, setSocketConnected] = useState(false);

  // Risk Management State
  const [capital, setCapital] = useState<number | "">("");
  const [riskPercentage, setRiskPercentage] = useState<number | "">("");
  const [calculatedPosition, setCalculatedPosition] = useState<number | null>(null);

  const fetchSignal = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/signal?symbol=${symbol}&interval=${interval}`);
      const data: SignalResponse = await response.json();
      setSignalData(data);
      setHistory((prevHistory) => [...prevHistory, data]); // 
    } catch (error) {
      console.error("Error fetching signal:", error);
    }
    setLoading(false);
  };

  const calculatePositionSize = () => {
    if (capital && riskPercentage && signalData) {
      const riskAmount = (capital * riskPercentage) / 100;
      const stopLossDistance = Math.abs(
        parseFloat(signalData.currentPrice) - parseFloat(signalData.sl)
      );
      if (stopLossDistance > 0) {
        const positionSize = riskAmount / stopLossDistance;
        setCalculatedPosition(positionSize);
      } else {
        alert("Invalid stop loss distance.");
      }
    } else {
      alert("Please provide valid inputs for capital, risk percentage, and ensure a signal is loaded.");
    }
  };

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3001"); // WebSocket ke server 
    socket.onopen = () => setSocketConnected(true);
    socket.onmessage = (event) => {
      const data: SignalResponse = JSON.parse(event.data);
      setSignalData(data);
      setHistory((prevHistory) => [...prevHistory, data]); // Tambahkan ke riwayat
    };
    socket.onclose = () => setSocketConnected(false);
    return () => socket.close(); // Bersihkan koneksi
  }, []);

  return (
    <div className="relative bg-yellow-50 overflow-hidden max-h-screen text-black">
      <header className="fixed right-0 top-0 left-60 bg-yellow-50 py-3 px-4 h-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <button type="button" className="flex items-center focus:outline-none rounded-lg text-gray-600 hover:text-yellow-600 focus:text-yellow-600 font-semibold p-2 border border-transparent hover:border-yellow-300 focus:border-yellow-300 transition">
                <span className="inline-flex items-center justify-center w-6 h-6 text-gray-600 text-xs rounded bg-white transition mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-chevron-left" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
                  </svg>
                </span>
                <span className="text-sm">Archive</span>
              </button>
            </div>
            <div className="text-lg font-bold">
              {socketConnected ? "WebSocket Connected ✅" : "WebSocket Disconnected ❌"}
            </div>
            <div>
              <button type="button" className="flex items-center focus:outline-none rounded-lg text-gray-600 hover:text-yellow-600 focus:text-yellow-600 font-semibold p-2 border border-transparent hover:border-yellow-300 focus:border-yellow-300 transition">
                <span className="text-sm">This week</span>
                <span className="inline-flex items-center justify-center w-6 h-6 text-gray-600 text-xs rounded bg-white transition ml-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <aside className="fixed inset-y-0 left-0 bg-white shadow-md max-h-screen w-60">
        <div className="flex flex-col justify-between h-full">
          <div className="flex-grow">
            <div className="px-4 py-6 text-center border-b">
              <h1 className="text-xl font-bold leading-none"><span className="text-yellow-700">Trading Signal</span> Bot</h1>
            </div>
            <div className="p-4">
              <ul className="space-y-1">
                <li>
                  <a href="javascript:void(0)" className="flex items-center bg-yellow-200 rounded-xl font-bold text-sm text-yellow-900 py-3 px-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="text-lg mr-4" viewBox="0 0 16 16">
                      <path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4V.5zM16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2zm-3.5-7h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5z" />
                    </svg>Bot
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="p-4">
            <button type="button" className="inline-flex items-center justify-center h-9 px-4 rounded-xl bg-gray-900 text-gray-300 hover:text-white text-sm font-semibold transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="" viewBox="0 0 16 16">
                <path d="M12 1a1 1 0 0 1 1 1v13h1.5a.5.5 0 0 1 0 1h-13a.5.5 0 0 1 0-1H3V2a1 1 0 0 1 1-1h8zm-2 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
              </svg>
            </button> <span className="font-bold text-sm ml-2">Logout</span>
          </div>
        </div>
      </aside>

      <main className="ml-60 pt-16 max-h-screen overflow-auto">
        <div className="px-6 py-8 h-[100vh]">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-8 mb-5">
              <h1 className="text-3xl font-bold mb-10">Trading Signal Bot</h1>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  fetchSignal();
                }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-stretch">

                    {/* Input Simbol */}
                    <div>
                        <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
                          <input
                            id="symbol"
                            type="text"
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                            className="block grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                            placeholder="Enter symbol (e.g., BTCUSDT)"
                          />
                        </div>
                    </div>

                    {/* Pilih Interval */}
                    <div className="ml-4">
                        <div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
                            <select
                            id="interval"
                            value={interval}
                            onChange={(e) => setInterval(e.target.value)}
                            className="col-start-1 row-start-1 w-full appearance-none rounded-md py-1.5 pl-3 pr-7 text-base text-gray-500 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                              <option value="1m">1 Minute</option>
                              <option value="5m">5 Minutes</option>
                              <option value="15m">15 Minutes</option>
                              <option value="1h">1 Hour</option>
                              <option value="1d">1 Day</option>
                            </select>
                        </div>
                    </div>

                    {/* Tombol Submit */}
                    {/* <button
                      type="submit"
                      className="inline-flex items-center justify-center py-2 px-3 rounded-xl bg-white text-gray-800 hover:text-green-500 text-sm font-semibold transition"
                    >
                      Get Signal
                    </button> */}
                  </div>
                  <div className="flex items-center gap-x-2">
                    <button type="submit" className="inline-flex items-center justify-center h-9 px-5 rounded-xl bg-gray-900 text-gray-300 hover:text-white text-sm font-semibold transition">
                      Get Signal
                    </button>
                  </div>
                </div>
              </form>

              <hr className="my-10"></hr>

              <div className="grid grid-cols-2 gap-x-20">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Signal</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      {/* Tampilkan Signal */}
                      {loading ? (
                        <div className="p-4 bg-green-100 rounded-xl">
                          <p className="text-center">Loading signal...</p>
                        </div>
                      ) : signalData ? (
                        <SignalCard {...signalData} />
                      ) : (
                        <div className="p-4 bg-green-100 rounded-xl">
                          <p className="text-center">No signal fetched yet.</p>
                        </div>
                      )}
                    </div>
                    {/* <div className="p-4 bg-yellow-100 rounded-xl text-gray-800">
                      <div className="font-bold text-2xl leading-none">20</div>
                      <div className="mt-2">Tasks finished</div>
                    </div>
                    <div className="p-4 bg-yellow-100 rounded-xl text-gray-800">
                      <div className="font-bold text-2xl leading-none">5,5</div>
                      <div className="mt-2">Tracked hours</div>
                    </div> */}
                    <div className="col-span-2">
                      <div className="p-4 bg-purple-100 rounded-xl text-gray-800">
                        <div className="font-bold text-xl leading-none">History</div>
                        <div className="mt-2">
                          <ul className="space-y-2">
                            {history.map((item, index) => (
                              <li key={index} className="p-2 border rounded-md">
                                <p>
                                  <strong>{item.symbol}</strong> - {item.interval}
                                </p>
                                <p>Signal: {item.signal}</p>
                                <p>Price: ${item.currentPrice}</p>
                                <p>Stop Loss (SL): ${item.sl}</p>
                                <p>Take Profit (TP): ${item.tp}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-black">Risk Management</h2>

                  {/* Risk Management */}
                  <div className="mt-8 w-full max-w-md bg-white p-4 rounded-lg shadow-md text-black">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="capital" className="block text-sm/6 font-medium text-gray-900">Modal Capital:</label>
                        <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
                          <div className="shrink-0 select-none text-base text-gray-500 sm:text-sm/6">$</div>
                          <input
                            id="capital"
                            type="number"
                            value={capital}
                            onChange={(e) => setCapital(e.target.value ? parseFloat(e.target.value) : "")}
                            className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6" placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="riskPercentage" className="block text-sm/6 font-medium text-gray-900">
                          Risk per Trade (%):
                        </label>
                        <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
                          <input
                            id="riskPercentage"
                            type="number"
                            value={riskPercentage}
                            onChange={(e) => setRiskPercentage(e.target.value ? parseFloat(e.target.value) : "")}
                            className="block min-w-0 grow py-1.5 pl-3 pr-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                            placeholder="Enter your risk percentage"
                          />
                          <div className="shrink-0 select-none text-base text-gray-500 sm:text-sm/6 mr-2">%</div>
                        </div>
                      </div>
                      <button
                        onClick={calculatePositionSize}
                        className="w-full bg-green-500 text-white py-2 rounded-md shadow-md hover:bg-green-600"
                      >
                        Calculate Position Size
                      </button>
                      {calculatedPosition !== null && (
                        <div className="mt-4 p-4 bg-gray-100 rounded-md">
                          <p className="text-sm font-medium">
                            Position Size: <span className="font-bold">{calculatedPosition.toFixed(4)} units</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
