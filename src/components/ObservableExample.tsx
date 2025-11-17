import {useEffect, useState} from 'react';
import {filter, map, Observable, tap} from 'rxjs';

export const ObservableExample = () => {
    const [count, setCount] = useState(0);
    const [message, setMessage] = useState('');
    const [isEven, setIsEven] = useState(false);

    useEffect(() => {
        const counter$ = new Observable<number>((subscriber) => {
            let count = 0;
            const interval = setInterval(() => {
                subscriber.next(count++);
            }, 1000);

            return () => {
                clearInterval(interval);
                console.log('Observable cleared');
            };
        });

        const subscription = counter$.pipe(
            tap(value => console.log('Original value:', value)),
            filter(value => value % 2 === 0),
            map(value => value * 2),
            tap(value => setIsEven(value % 4 === 0))
        ).subscribe({
            next: value => {
                setCount(value);
                setMessage(`Transformed value: ${value}`);
            },
            error: err => console.error('Error:', err),
            complete: () => console.log('Observable completed')
            });

        return () => subscription.unsubscribe();
    }, []);

    return (
      <div className="p-6 border rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Basic with Operators</h2>
          <p className="text-2xl mb-4">Count: {count}</p>
          <p className="text-gray-600">{message}</p>
          <p className={`text-sm ${isEven ? 'text-green-600' : 'text-red-600'}`}>
              {isEven ? 'Even and divisible by 4' : 'Odd or not divisible by 4'}
          </p>
      </div>
    );
};

