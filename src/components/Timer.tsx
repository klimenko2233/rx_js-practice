import { useEffect, useState, useMemo, useRef } from 'react';
import { Subject, interval, EMPTY } from 'rxjs';
import { switchMap, tap, startWith } from 'rxjs/operators';

type TimerCommand = 'start' | 'pause' | 'reset';

export const Timer = () => {
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    const secondsRef = useRef(seconds);

    useEffect(() => {
        secondsRef.current = seconds;
    }, [seconds]);

    const timerCommand$ = useMemo(() => new Subject<TimerCommand>(), []);

    useEffect(() => {
        const subscription = timerCommand$.pipe(
            switchMap(command => {
                switch (command) {
                    case 'start':
                        setIsRunning(true);
                        return interval(1000).pipe(
                            tap(() => {
                                const newValue = secondsRef.current + 1;
                                secondsRef.current = newValue;
                                setSeconds(newValue);
                            })
                        );

                    case 'pause':
                        setIsRunning(false);
                        return EMPTY;

                    case 'reset':
                        setIsRunning(false);
                        setSeconds(0);
                        secondsRef.current = 0;
                        return EMPTY;

                    default:
                        return EMPTY;
                }
            })
        ).subscribe({
            next: () => console.log('Timer tick'),
            error: (err) => console.error('Timer error:', err),
            complete: () => console.log('Timer completed')
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [timerCommand$]);

    const handleStart = () => {
        timerCommand$.next('start');
    };

    const handlePause = () => {
        timerCommand$.next('pause');
    };

    const handleReset = () => {
        timerCommand$.next('reset');
    };

    return (
        <div className="p-6 border rounded-lg shadow-md mt-4">
            <h2 className="text-xl font-bold mb-4">Fixed Timer with RxJS</h2>
            <p className="text-2xl mb-4">Seconds: {seconds}</p>
            <div className="space-x-2">
                <button
                    onClick={handleStart}
                    disabled={isRunning}
                    className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
                >
                    Start
                </button>
                <button
                    onClick={handlePause}
                    disabled={!isRunning}
                    className="bg-yellow-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
                >
                    Pause
                </button>
                <button
                    onClick={handleReset}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                >
                    Reset
                </button>
            </div>
            <p className="mt-2">Status: {isRunning ? 'Running' : 'Paused'}</p>
            <p className="text-sm text-gray-600 mt-2">
                Ref value: {secondsRef.current}
            </p>
        </div>
    );
};
