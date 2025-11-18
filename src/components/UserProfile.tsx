import { useEffect, useState } from 'react';
import { authService } from '../services/auth.service';

export const UserProfile = () => {
    const [user, setUser] = useState(authService.currentUser);
    const [loading, setLoading] = useState(authService.isLoading);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [editName, setEditName] = useState('');

    useEffect(() => {
        const userSubscription = authService.currentUser$.subscribe({
            next: (currentUser) => {
                setUser(currentUser);
                if (currentUser) {
                    setEditName(currentUser.name);
                }
            }
        });

        const loadingSubscription = authService.loading$.subscribe({
            next: (isLoading) => setLoading(isLoading)
        });

        return () => {
            userSubscription.unsubscribe();
            loadingSubscription.unsubscribe();
        };
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await authService.login(email, password).toPromise();
            setEmail('');
            setPassword('');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleLogout = () => {
        authService.logout();
        setError(null);
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            await authService.updateProfile({ name: editName }).toPromise();
            setEditMode(false);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleLoadProfile = () => {
        authService.loadUserProfile().subscribe();
    };

    if (loading) {
        return (
            <div className="p-6 border rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">User Profile</h2>
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 border rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">User Profile with Real API</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {user ? (
                <div>
                    <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
                        <h3 className="font-semibold text-green-800">Welcome back!</h3>
                    </div>

                    {!editMode ? (
                        <div className="space-y-2">
                            <p><strong>Name:</strong> {user.name}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Username:</strong> {user.username}</p>
                            <p><strong>ID:</strong> {user.id}</p>

                            <div className="flex space-x-2 mt-4">
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded"
                                >
                                    Edit Profile
                                </button>
                                <button
                                    onClick={handleLoadProfile}
                                    className="bg-gray-500 text-white px-4 py-2 rounded"
                                >
                                    Load Random Profile
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 text-white px-4 py-2 rounded"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="border p-2 rounded w-full"
                                    required
                                />
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    type="submit"
                                    className="bg-green-500 text-white px-4 py-2 rounded"
                                >
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditMode(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Use: Sincere@april.biz"
                            className="border p-2 rounded w-full"
                            required
                        />
                        <p className="text-sm text-gray-600 mt-1">
                            Try: Sincere@april.biz (from JSONPlaceholder)
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Any password works for demo"
                            className="border p-2 rounded w-full"
                            required
                        />
                        <p className="text-sm text-gray-600 mt-1">
                            Any password will work in this demo
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="bg-green-500 text-white px-4 py-2 rounded w-full"
                    >
                        Login
                    </button>
                </form>
            )}

            <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
                <p><strong>Debug Info:</strong></p>
                <p>User in state: {user ? 'Yes' : 'No'}</p>
                <p>Loading: {loading ? 'Yes' : 'No'}</p>
                <p>Token in storage: {localStorage.getItem('auth_token') ? 'Yes' : 'No'}</p>
            </div>
        </div>
    );
};