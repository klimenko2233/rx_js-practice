import { useEffect, useState, useMemo } from 'react';
import { Subject } from 'rxjs';

export const SubjectsExample = () => {
    const [messages, setMessages] = useState<string[]>([]);

    const messageSubject = useMemo(() => new Subject<string>(), []);

    useEffect(() => {
        console.log('Setting up subscription...');

        const subscription = messageSubject.subscribe({
            next: message => {
                console.log('Received:', message);
                setMessages(prev => [...prev, message]);
            }
        });

        return () => {
            console.log('Cleaning up subscription...');
            subscription.unsubscribe();
        };
    }, [messageSubject]);

    const sendMessage = (message: string) => {
        console.log('Sending:', message);
        messageSubject.next(`Message: ${message}`);
    };

    return (
        <div className="p-6 border rounded-lg shadow-md mt-4">
            <h2 className="text-xl font-bold mb-4">Subjects Example</h2>
            <div className="space-y-2">
                <button
                    onClick={() => sendMessage('Hello from Subject')}
                    className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                >
                    Send Hello
                </button>
                <button
                    onClick={() => sendMessage('Another Message')}
                    className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                >
                    Send Another
                </button>
                <button
                    onClick={() => sendMessage('Goodbye')}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                >
                    Send Goodbye
                </button>
            </div>
            <div className="mt-4">
                <h3 className="font-bold">Received Messages:</h3>
                <ul className="list-disc list-inside">
                    {messages.map((msg, index) => (
                        <li key={index} className="text-gray-700">{msg}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}