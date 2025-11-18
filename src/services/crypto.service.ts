import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import {map, retry, catchError, switchMap} from 'rxjs/operators';
import { Observable, of, timer } from 'rxjs';
import { ajax } from 'rxjs/ajax';

export interface CryptoPrice {
    id: string;
    symbol: string;
    name: string;
    current_price: number;
    price_change_percentage_24h: number;
    image: string;
}

export interface CryptoUpdate {
    coin: string;
    price: number;
    change: number;
    symbol: string;
    timestamp: number;
}

class CryptoService {
    private ws$: WebSocketSubject<any> | null = null;

    private readonly BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws';

    private readonly COINGECKO_API = 'https://api.coingecko.com/api/v3/coins/markets';

    connect(): Observable<CryptoUpdate> {
        this.ws$ = webSocket(`${this.BINANCE_WS_URL}/btcusdt@ticker/ethusdt@ticker`);

        return this.ws$.pipe(
            map((message: any) => {
                console.log('Binance WebSocket:', message);

                const symbol = message.s;
                const baseCurrency = symbol.replace('USDT', '').toLowerCase();

                return {
                    coin: baseCurrency,
                    symbol: baseCurrency.toUpperCase(),
                    price: parseFloat(message.c),
                    change: parseFloat(message.P),
                    timestamp: message.E
                };
            }),
            retry({
                count: 3,
                delay: (error, retryCount) => {
                    console.log(`WebSocket retry attempt ${retryCount}`);
                    return timer(2000);
                }
            }),
            catchError(error => {
                console.error('WebSocket error:', error);
                return of();
            })
        );
    }

    getCryptoInfo(): Observable<CryptoPrice[]> {
        const url = `${this.COINGECKO_API}?vs_currency=usd&ids=bitcoin,ethereum,cardano,solana,dogecoin&order=market_cap_desc&per_page=5&page=1&sparkline=false`;

        return ajax.getJSON<CryptoPrice[]>(url).pipe(
            catchError(error => {
                console.error('Error fetching crypto info:', error);
                return of([
                    {
                        id: 'bitcoin',
                        symbol: 'btc',
                        name: 'Bitcoin',
                        current_price: 45000,
                        price_change_percentage_24h: 2.5,
                        image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png'
                    },
                    {
                        id: 'ethereum',
                        symbol: 'eth',
                        name: 'Ethereum',
                        current_price: 3000,
                        price_change_percentage_24h: 1.8,
                        image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png'
                    }
                ]);
            })
        );
    }

    getCryptoPricesPolling(): Observable<CryptoPrice[]> {
        return timer(0, 10000).pipe(
            switchMap(() => this.getCryptoInfo()),
            catchError(error => {
                console.error('Polling error:', error);
                return of([]);
            })
        );
    }

    disconnect(): void {
        if (this.ws$) {
            this.ws$.complete();
            this.ws$ = null;
        }
    }
}

export const cryptoService = new CryptoService();