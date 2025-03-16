'use client';

import { useEffect, useState } from "react";
import { fetchMessages, triggerMessageFetch } from "../../utils/api";

// Define interface for IoTMessage based on backend model
interface IoTMessage {
  id: string;
  content: string;
  receivedAt: string;
}

export default function Messages() {
  const [messages, setMessages] = useState<IoTMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchMessages();
      setMessages(data);
    } catch (err) {
      setError('Failed to load messages. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchNewMessage = async () => {
    setLoading(true);
    setError('');
    try {
      await triggerMessageFetch();
      await loadMessages();
    } catch (err) {
      setError('Failed to fetch new messages. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  return (
    <div className="container mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">IoT Messages</h1>
          <button 
            onClick={handleFetchNewMessage}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : 'Fetch New Messages'}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        {loading && !error ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div key={message.id} className="border dark:border-gray-700 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 bg-gray-50 dark:bg-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-gray-700 dark:text-gray-300">Message ID: {message.id}</p>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(message.receivedAt).toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-800 rounded border dark:border-gray-600">
                    <pre className="whitespace-pre-wrap break-words text-gray-800 dark:text-gray-200">{message.content}</pre>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-600 dark:text-gray-300">No messages found</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Click the button above to fetch messages from IoT devices</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}