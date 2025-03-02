
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface TelegramAuthProps {
  onAuth: (user: TelegramUser) => void;
  botName: string;
}

declare global {
  interface Window {
    Telegram?: {
      Login: {
        auth: (options: any) => void;
      };
    };
  }
}

const TelegramAuth: React.FC<TelegramAuthProps> = ({ onAuth, botName }) => {
  useEffect(() => {
    // Load Telegram script if not already loaded
    if (!document.getElementById('telegram-login-script')) {
      const script = document.createElement('script');
      script.id = 'telegram-login-script';
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.setAttribute('data-telegram-login', botName);
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-radius', '8');
      script.setAttribute('data-request-access', 'write');
      script.setAttribute('data-userpic', 'false');
      script.setAttribute('data-auth-url', window.location.href);
      script.async = true;
      
      // Handle callback when Telegram auth is completed
      window.onTelegramAuth = (user: TelegramUser) => {
        console.log('Telegram user:', user);
        onAuth(user);
        
        // Store user data in localStorage
        localStorage.setItem('telegramUser', JSON.stringify(user));
      };
      
      document.head.appendChild(script);
    }
    
    // Check URL for Telegram auth data
    const checkUrlForAuthData = () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search);
      
      // Telegram sometimes puts data in hash, sometimes in query
      const params = hashParams.get('tgAuthResult') 
        ? new URLSearchParams(hashParams.get('tgAuthResult') || '')
        : queryParams;
      
      if (params.get('id')) {
        const user: TelegramUser = {
          id: Number(params.get('id')),
          first_name: params.get('first_name') || '',
          last_name: params.get('last_name') || undefined,
          username: params.get('username') || undefined,
          photo_url: params.get('photo_url') || undefined,
          auth_date: Number(params.get('auth_date') || 0),
          hash: params.get('hash') || ''
        };
        
        onAuth(user);
        localStorage.setItem('telegramUser', JSON.stringify(user));
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };
    
    checkUrlForAuthData();
    
    // Clean up script on unmount
    return () => {
      delete window.onTelegramAuth;
    };
  }, [onAuth, botName]);
  
  // Create a custom Telegram login button
  const handleCustomLogin = () => {
    if (window.Telegram && window.Telegram.Login) {
      window.Telegram.Login.auth(
        { 
          bot_id: botName.replace('@', ''),
          request_access: true,
          return_to: window.location.href
        },
        (user: TelegramUser) => {
          console.log('Telegram auth result:', user);
          onAuth(user);
          localStorage.setItem('telegramUser', JSON.stringify(user));
        }
      );
    } else {
      console.error('Telegram Login widget not loaded');
      alert('Telegram login is not available. Please try again later.');
    }
  };
  
  return (
    <div className="flex flex-col items-center space-y-4">
      <Button 
        onClick={handleCustomLogin}
        className="bg-[#0088cc] hover:bg-[#0070a8] text-white px-6 py-3 rounded-lg flex items-center gap-2"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" className="mr-2">
          <path d="M21.38 4.59c.17.85-.34 1.7-.73 2.37L12 21.17c-.38.67-1.36.96-2.04.59-.17-.09-.33-.2-.45-.35L2.09 14.1c-.5-.57-.45-1.43.12-1.93.17-.15.35-.25.56-.31L19.35 4.1c.82-.16 1.63.32 1.8 1.14l.23-.65Z" fill="#0088cc"/>
        </svg>
        Login with Telegram
      </Button>
      <div id="telegram-login-container"></div>
    </div>
  );
};

export default TelegramAuth;
