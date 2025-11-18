import {useEffect, useState} from 'react';
import {type LaunchWithRocket, spaceXService} from '../services/spacex.service';

export const SpaceXLaunches = () => {
    const [launches, setLaunches] = useState<LaunchWithRocket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        const subscription = spaceXService.getLaunchesWithRockets().subscribe({
            next: (launchData) => {
                setLaunches(launchData);
                setLoading(false);
                console.log('Loaded launches:', launchData);
            },
            error: (err) => {
                setError(err.message);
                setLoading(false);
                console.error('Failed to load launches:', err);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="p-6 border rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">SpaceX Launches</h2>
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2">Loading SpaceX data...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 border rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">SpaceX Launches</h2>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 border rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">🚀 SpaceX Recent Launches</h2>

            <div className="space-y-4">
                {launches.map(launch => (
                    <div key={launch.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-4">
                            {launch.rocketDetails.flickr_images[0] && (
                                <img
                                    src={launch.rocketDetails.flickr_images[0]}
                                    alt={launch.rocketDetails.name}
                                    className="w-20 h-20 object-cover rounded"
                                />
                            )}

                            <div className="flex-1">
                                <h3 className="font-bold text-lg">{launch.name}</h3>
                                <p className="text-gray-600">
                                    <strong>Rocket:</strong> {launch.rocketDetails.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                    <strong>Date:</strong> {new Date(launch.date_utc).toLocaleDateString()}
                                </p>
                                <p className="text-sm">
                                    Status:
                                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                        launch.success
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {launch.success ? 'Success' : 'Failed'}
                                    </span>
                                </p>
                                <p className="text-sm text-gray-600 mt-2">
                                    {launch.rocketDetails.description.substring(0, 150)}...
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                    <strong>API Info:</strong> Data loaded from SpaceX API in real-time
                </p>
            </div>
        </div>
    );
};