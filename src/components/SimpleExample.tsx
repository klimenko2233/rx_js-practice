import { useEffect, useState } from 'react';
import { of, delay, map } from 'rxjs';

export const SimpleExample = () => {
    const [data, setData] = useState<string[]>([]);

    useEffect(() => {
        const data$ = of('Apple', 'Banana', 'Cherry').pipe(
            delay(1000),
            map(fruit => `I like ${fruit}`)
        );

        const subscription = data$.subscribe({
            next: item => {
                setData(prev => [...prev, item]);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <div className="p-6 border rounded-lg shadow-md mt-4">
            <h2 className="text-xl font-bold mb-4">Simple Example</h2>
            <ul>
                {data.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );
};