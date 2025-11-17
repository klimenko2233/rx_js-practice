import {useEffect, useState} from 'react';
import {ajax} from 'rxjs/internal/ajax/ajax';
import {catchError, map, of, tap} from 'rxjs';

interface User {
    id: number;
    name: string;
    email: string;
}

export const HttpExample = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        const subscription = ajax.getJSON<User[]>('https://jsonplaceholder.typicode.com/users').pipe(
            tap(() => console.log('Request started')),
            map(response => {
                console.log('Raw response:', response);
                return response;
            }),
            catchError(err => {
                console.error('HTTP error:', err);
                setError(err.message || 'smth went wrong');
                return of([]);
            }),
            tap(() => setLoading(false))
        ).subscribe({
            next: (data) => setUsers(data),
            error: (err) => {
                setError(err.message);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return(
            <div className="p-6 border rounded-lg shadow-md mt-4">
                <h2 className="text-xl font-bold mb-4">Request Example</h2>
                <p>Loading users...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 border rounded-lg shadow-md mt-4">
                <h2 className="text-xl font-bold mb-4">HTTP Request Example</h2>
                <p className="text-red-500">Error: {error}</p>
            </div>
        );
    }

    return (
      <div className="p-6 border rounded-lg shadow-md mt-4">
          <h2 className="text-xl font-bold mb-4">HTTP Request Example</h2>
          <div className="space-y-2">
              {users.map(user => (
                  <div key={user.id} className="mb-4 p-4 border rounded-lg shadow-sm">
                      <h3 className="text-lg font-semibold">{user.name}</h3>
                      <p className="text-gray-600">{user.email}</p>
                  </div>
              ))}
          </div>
      </div>
    );
};