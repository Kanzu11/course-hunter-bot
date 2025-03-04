
import { useState } from 'react';
import { TelegramUser } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useTelegramUser() {
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(() => {
    const storedUser = localStorage.getItem('telegramUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const { toast } = useToast();

  const handleTelegramUsernameSubmit = (username: string) => {
    console.log('Telegram username submitted:', username);
    const user: TelegramUser = { username };
    setTelegramUser(user);
    
    localStorage.setItem('telegramUser', JSON.stringify(user));
    
    toast({
      title: "Username Saved",
      description: `Welcome, @${username}! You can now purchase courses.`,
      variant: "default",
    });
  };

  const handleTelegramLogout = () => {
    setTelegramUser(null);
    localStorage.removeItem('telegramUser');
    toast({
      title: "Username Cleared",
      description: "Your Telegram username has been cleared.",
      variant: "default",
    });
  };

  return {
    telegramUser,
    handleTelegramUsernameSubmit,
    handleTelegramLogout
  };
}
