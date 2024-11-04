import React from 'react';
import { Gamepad } from 'lucide-react';
import AuthScreen from './components/AuthScreen';
import ChatLayout from './components/ChatLayout';
import { useAuthStore } from './store/authStore';

function App() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {!user ? (
        <AuthScreen />
      ) : (
        <div className="h-screen flex flex-col">
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Gamepad className="h-8 w-8 text-indigo-600" />
                <h1 className="text-2xl font-bold text-gray-900">GameChat</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Welcome, {user.username}!</span>
                <button
                  onClick={() => useAuthStore.getState().logout()}
                  className="text-sm text-red-600 hover:text-red-500"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>
          <ChatLayout />
        </div>
      )}
    </div>
  );
}

export default App;