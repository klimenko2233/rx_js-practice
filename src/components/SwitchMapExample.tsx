import {useEffect, useRef, useState} from 'react';
import {fromEvent, map, switchMap, tap, timer} from 'rxjs';

export const SwitchMapExample = () => {
    const [status, setStatus] = useState('Idle');
    const [result, setResult] = useState('');
    const buttonRef = useRef<HTMLButtonElement>(null);

    const fakeApiCall = (requestId: number) => {
        return timer(2000).pipe(
            map(() => `Response for request ${requestId}`)
        );
    };

    useEffect(() => {
        if(!buttonRef.current) return;

        let requestId = 0;

        const click$ = fromEvent(buttonRef.current, 'click').pipe(
            tap(() => {
                requestId++;
                setStatus(`Request #${requestId} started...`);
            }),
            switchMap(() => fakeApiCall(requestId))
        );

        const subscription = click$.subscribe({
            next: response => {
                setStatus('Completed')
                setResult(response);
            },
            error: err => {
                setStatus('Error');
                console.error('Error:', err);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <div className="p-6 border rounded-lg shadow-md mt-4">
            <h2 className="text-xl font-bold mb-4">SwitchMap Example</h2>
            <p className="mb-4">Click multiple times quickly - previous requests will be cancelled</p>
            <button
                ref={buttonRef}
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                Make API Call
            </button>
            <div className="mt-4">
                <p><strong>Status:</strong>{status}</p>
                <p><strong>Result</strong>{result}</p>
            </div>
        </div>
    );
}