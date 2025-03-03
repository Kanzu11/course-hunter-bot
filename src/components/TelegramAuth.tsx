
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TelegramUsernameProps {
  onSubmit: (username: string) => void;
}

const TelegramUsernameInput: React.FC<TelegramUsernameProps> = ({ onSubmit }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!username.trim()) {
      setError('Please enter your Telegram username');
      return;
    }
    
    // Format the username correctly
    let formattedUsername = username.trim();
    if (formattedUsername.startsWith('@')) {
      formattedUsername = formattedUsername.substring(1);
    }
    
    // Validate username format (letters, numbers, and underscores, 5-32 characters)
    if (!/^[a-zA-Z0-9_]{5,32}$/.test(formattedUsername)) {
      setError('Telegram username must be 5-32 characters and contain only letters, numbers, and underscores');
      return;
    }
    
    setError('');
    onSubmit(formattedUsername);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <span className="bg-gray-100 text-gray-500 px-3 py-2 border border-r-0 rounded-l-md">@</span>
            <Input 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_telegram_username"
              className="rounded-l-none"
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          
          <Button 
            type="submit"
            className="bg-[#0088cc] hover:bg-[#0070a8] text-white px-6 py-3 rounded-lg flex items-center gap-2"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" className="mr-2">
              <path d="M21.38 4.59c.17.85-.34 1.7-.73 2.37L12 21.17c-.38.67-1.36.96-2.04.59-.17-.09-.33-.2-.45-.35L2.09 14.1c-.5-.57-.45-1.43.12-1.93.17-.15.35-.25.56-.31L19.35 4.1c.82-.16 1.63.32 1.8 1.14l.23-.65Z" fill="#0088cc"/>
            </svg>
            Continue with Telegram
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TelegramUsernameInput;
