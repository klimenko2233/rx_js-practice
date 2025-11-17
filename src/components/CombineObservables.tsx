import {useEffect, useState} from 'react';
import {combineLatest, map, Observable} from 'rxjs';

export const CombineObservables = () => {
    const [result, setResult] = useState('');
    const [values, setValues] = useState({ temp:0, humidity:0 });

    useEffect(() => {
        const temperature$ = new Observable<number>(subscriber => {
            let temp = 20;
            const interval = setInterval(() => {
                temp += (Math.random() - 0.5) * 2;
                subscriber.next(Number(temp.toFixed(1)));
            }, 1500);
            return () => clearInterval(interval);
        });

        const humidity$ = new Observable<number>(subscriber => {
            let humidity = 50;
            const interval = setInterval(() => {
                humidity += (Math.random() - 0.5) * 5;
                humidity = Math.max(30, Math.min(80, humidity));
                subscriber.next(Number(humidity.toFixed(1)));
            }, 2000);
            return () => clearInterval(interval);
        });

        const combined$ = combineLatest([temperature$, humidity$]).pipe(
            map(([temp, humidity]) => ({
                temp,
                humidity,
                comfort: temp > 25 && humidity > 60 ? 'Uncomfortable' : 'Comfortable'
            }))
            );

        const subscription = combined$.subscribe({
            next: data => {
                setValues({temp: data.temp, humidity: data.humidity});
                setResult(`Temperature: ${data.temp}°C, Humidity: ${data.humidity}%, Comfort: ${data.comfort}`)
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    return (
        <div className="p-6 border rounded-lg shadow-md mt-4">
            <h2 className="text-xl font-bold mb-4">Combine Observables</h2>
            <p className="text-lg mb-2">{result}</p>
            <div className="flex space-x-4 mt-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{values.temp}°C</div>
                    <div className="text-sm text-gray-600">Temperature</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{values.humidity}</div>
                    <div className="text-sm text-gray-600">Humidity</div>
                </div>
            </div>
        </div>
    );
}