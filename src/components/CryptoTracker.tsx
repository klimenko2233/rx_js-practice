import { useEffect, useState, useRef } from 'react';
import {cryptoService, type CryptoPrice, type CryptoUpdate} from '../services/crypto.service';
import { Subscription } from 'rxjs';

export const CryptoTracker = () => {
    const [prices, setPrices] = useState<Record<string, CryptoUpdate>>({});
    const [cryptoInfo, setCryptoInfo] = useState<Record<string, CryptoPrice>>({});
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [useWebSocket, setUseWebSocket] = useState(true);

    const subscriptionRef = useRef<Subscription>();

    useEffect(() => {
        console.log('Starting crypto tracker...');

        const staticInfoSub = cryptoService.getCryptoInfo().subscribe({
            next: (assets: CryptoPrice[]) => {
                const infoMap: Record<string, CryptoPrice> = {};
                assets.forEach(asset => {
                    infoMap[asset.id] = asset;
                });
                setCryptoInfo(infoMap);
            },
            error: (err) => {
                setError(`Failed to load crypto info: ${err.message}`);
            }
        });

        if (useWebSocket) {
            const wsSub = cryptoService.connect().subscribe({
                next: (update) => {
                    if (update) {
                        setIsConnected(true);
                        setError(null);

                        setPrices(prev => ({
                            ...prev,
                            [update.coin]: update
                        }));
                    }
                },
                error: (err) => {
                    console.log('WebSocket failed, falling back to polling');
                    setUseWebSocket(false);
                },
                complete: () => {
                    setIsConnected(false);
                }
            });

            subscriptionRef.current = new Subscription();
            subscriptionRef.current.add(staticInfoSub);
            subscriptionRef.current.add(wsSub);
        } else {
            const pollingSub = cryptoService.getCryptoInfo().subscribe({
                next: (assets) => {
                    const infoMap: Record<string, CryptoPrice> = {};
                    assets.forEach(asset => {
                        infoMap[asset.id] = asset;
                    });
                    setCryptoInfo(infoMap);
                }
            });

            const interval = setInterval(() => {
                cryptoService.getCryptoInfo().subscribe({
                    next: (assets) => {
                        const infoMap: Record<string, CryptoPrice> = {};
                        assets.forEach(asset => {
                            infoMap[asset.id] = asset;
                        });
                        setCryptoInfo(infoMap);
                    }
                });
            }, 10000);

            subscriptionRef.current = new Subscription();
            subscriptionRef.current.add(staticInfoSub);
            subscriptionRef.current.add(pollingSub);

            return () => {
                if (subscriptionRef.current) {
                    subscriptionRef.current.unsubscribe();
                }
                clearInterval(interval);
                cryptoService.disconnect();
            };
        }

        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
            }
            cryptoService.disconnect();
        };
    }, [useWebSocket]);

    const getPriceColor = (change: number) => {
        if (change > 0) return 'text-green-600';
        if (change < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    const formatPrice = (price: number) => {
        if (price < 1) return price.toFixed(4);
        if (price < 1000) return price.toFixed(2);
        return Math.round(price).toLocaleString();
    };

    const cryptoList = ['bitcoin', 'ethereum', 'cardano', 'solana', 'dogecoin'];

    return (
        <div className="p-6 border rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">📊 Real-time Crypto Tracker</h2>

            <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">
                    {useWebSocket ? 'Live prices from Binance WebSocket' : 'Prices from CoinGecko API (updated every 10s)'}
                </p>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                            isConnected && useWebSocket ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                        <span className="text-sm">
              {useWebSocket ? (isConnected ? 'WebSocket Connected' : 'Connecting...') : 'Using Polling'}
            </span>
                    </div>
                    <button
                        onClick={() => setUseWebSocket(!useWebSocket)}
                        className="text-sm bg-blue-500 text-white px-3 py-1 rounded"
                    >
                        {useWebSocket ? 'Switch to Polling' : 'Try WebSocket'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cryptoList.map(cryptoId => {
                    const priceData = prices[cryptoId];
                    const info = cryptoInfo[cryptoId];

                    const currentPrice = priceData?.price || info?.current_price;
                    const currentChange = priceData?.change || info?.price_change_percentage_24h;

                    return (
                        <div key={cryptoId} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                    {info?.image && (
                                        <img
                                            src={info.image}
                                            alt={info.name}
                                            className="w-8 h-8 mr-3"
                                        />
                                    )}
                                    <h3 className="font-bold text-lg">
                                        {info?.symbol ? info.symbol.toUpperCase() : cryptoId.toUpperCase()}
                                    </h3>
                                </div>
                                {priceData && useWebSocket && (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Live
                  </span>
                                )}
                            </div>

                            <p className="text-gray-600 text-sm mb-2">
                                {info?.name || cryptoId}
                            </p>

                            <div className="space-y-1">
                                <p className={`text-xl font-bold ${getPriceColor(currentChange || 0)}`}>
                                    ${currentPrice ? formatPrice(currentPrice) : 'Loading...'}
                                </p>

                                {currentChange !== undefined && (
                                    <p className={`text-sm ${getPriceColor(currentChange)}`}>
                                        {currentChange > 0 ? '+' : ''}{currentChange.toFixed(2)}%
                                    </p>
                                )}

                                {priceData && (
                                    <p className="text-xs text-gray-400">
                                        Updated: {new Date(priceData.timestamp).toLocaleTimeString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <h4 className="font-bold mb-2">ℹ️ Technical Info:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Static data: CoinGecko API</li>
                    <li>• Real-time: Binance WebSocket</li>
                    <li>• Fallback: Polling every 10 seconds</li>
                    <li>• CORS proxy for SpaceX API</li>
                </ul>
            </div>
        </div>
    );
};