import React from 'react';

const ChatLayout: React.FC = () => {
  return (
    <div className="flex-1 flex">
      {/* Chat list */}
      <div className="w-80 border-r border-gray-200 bg-white">
        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-800">Chats</h2>
        </div>
        {/* Chat list will be implemented next */}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4">
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;