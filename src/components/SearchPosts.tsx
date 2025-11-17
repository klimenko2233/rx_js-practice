import {useEffect, useRef, useState} from 'react';
import {catchError, debounceTime, distinctUntilChanged, filter, fromEvent, map, of, switchMap, tap} from 'rxjs';
import {ajax} from 'rxjs/internal/ajax/ajax';

interface Post{
    id: number;
    title: string;
    body: string;
}

export const SearchPosts = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>('');
    const [searchTerm, setSearchTerm] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!inputRef.current) return;

        const input$ = fromEvent(inputRef.current, 'input').pipe(
            map(event => (event.target as HTMLInputElement).value),
            debounceTime(500),
            distinctUntilChanged(),
            filter(term => term.length >= 3 || term.length === 0),
            tap(term => {
                setSearchTerm(term);
                setLoading(term.length >=3);
                setError(null);
            }),
            switchMap(term => {
                if (term.length === 0) {
                    return of([])
                }
                const url = `https://jsonplaceholder.typicode.com/posts?q=${encodeURIComponent(term)}`;
                return ajax.getJSON<Post[]>(url).pipe(
                    catchError(err => {
                        setError(err.message || 'Error fetching posts');
                        return of([]);
                    })
                );
            }),
            tap(() => setLoading(false))
        );

        const subscription = input$.subscribe({
            next: data => setPosts(data),
            error: (err) => {
                setError(err.message);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <div className="p-6 border rounded-lg shadow-md mt-4">
            <h2 className="text-xl font-bold mb-4">Search Posts</h2>
            <input
                ref={inputRef}
                type="text"
                placeholder="Search posts (min 3 characters)..."
                className="border p-2 rounded w-full mb-4"
            />

            {loading && <p>Searching...</p>}
            {error && <p className="text-red-500">{error}</p>}

            <div className="space-y-3">
                {posts.map(post => (
                    <div key={post.id} className="mb-4 p-4 border rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold">{post.title}</h3>
                        <p className="text-gray-600">{post.body}</p>
                    </div>
                ))}
                {!loading && searchTerm.length >= 3 && posts.length === 0 && (
                    <p>No post found for "{searchTerm}"</p>
                )}
            </div>
        </div>
    );
};