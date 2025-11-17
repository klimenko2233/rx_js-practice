import {useEffect, useRef, useState} from 'react';
import {debounceTime, distinctUntilChanged, fromEvent, map} from 'rxjs';

export const EventObservable = () => {
    const [inputValue, setInputValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!inputRef.current) return;

        const input$ = fromEvent(inputRef.current, 'input').pipe(
            map(event => (event.target as HTMLInputElement).value),
            debounceTime(300),
            distinctUntilChanged()
        );

        const subscription = input$.subscribe({
            next: value => {
                setSearchTerm(value);
                console.log('Searching for:', value);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <div className=" p-6 border rounded-lg shadow-md mt-4">
            <h2 className="text-xl font-bold mb-4">Event Observable (Search with Debounce)</h2>
            <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                className="border p-2 rounded w-full mb-4"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
            />
            <p>Current search term: <strong>{searchTerm}</strong></p>
            <p className="text-sm text-gray-600 mt-2">
                Notice how the search term is updated only after the user stops typing for 300ms.
            </p>
        </div>
    );

}