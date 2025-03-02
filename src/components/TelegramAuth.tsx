
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
        auth: (options: any, callback?: (user: TelegramUser) => void) => void;
      };
      WebApp?: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
            language_code?: string;
          };
          auth_date: number;
          hash: string;
        };
        ready: () => void;
        close: () => void;
        MainButton?: {
          setText: (text: string) => void;
          show: () => void;
          onClick: (callback: () => void) => void;
        };
      };
    };
    onTelegramAuth?: (user: TelegramUser) => void;
  }
}

const TelegramAuth: React.FC<TelegramAuthProps> = ({ onAuth, botName }) => {
  useEffect(() => {
    // Check if running inside Telegram Mini App
    const isInTelegramWebApp = !!window.Telegram?.WebApp;
    
    if (isInTelegramWebApp) {
      console.log('Running in Telegram WebApp, attempting auto-login');
      
      // Tell Telegram WebApp we're ready
      window.Telegram.WebApp?.ready();
      
      // Extract user data from Telegram WebApp
      if (window.Telegram.WebApp?.initDataUnsafe?.user) {
        const webAppUser = window.Telegram.WebApp.initDataUnsafe;
        const user = webAppUser.user;
        
        if (user) {
          // Format as TelegramUser
          const telegramUser: TelegramUser = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            photo_url: user.photo_url,
            auth_date: webAppUser.auth_date,
            hash: webAppUser.hash
          };
          
          console.log('Auto-logged in via Telegram WebApp:', telegramUser);
          
          // Store user data in localStorage
          localStorage.setItem('telegramUser', JSON.stringify(telegramUser));
          
          // Call onAuth with the user data
          onAuth(telegramUser);
          
          // Set up Telegram MainButton if available
          if (window.Telegram.WebApp?.MainButton) {
            window.Telegram.WebApp.MainButton.setText('Browse Courses');
            window.Telegram.WebApp.MainButton.show();
            window.Telegram.WebApp.MainButton.onClick(() => {
              console.log('Main button clicked');
              // Any action you want on main button click
            });
          }
        }
      } else {
        console.log('No user data available in Telegram WebApp, trying fallback');
        
        // Fallback: Try to extract from query params if we're in WebApp but user data is not directly available
        try {
          const webAppData = window.Telegram.WebApp?.initData;
          if (webAppData) {
            const params = new URLSearchParams(webAppData);
            const userStr = params.get('user');
            if (userStr) {
              const user = JSON.parse(decodeURIComponent(userStr));
              const telegramUser: TelegramUser = {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                photo_url: user.photo_url,
                auth_date: Math.floor(Date.now() / 1000),
                hash: 'webapp_auth' // Dummy hash since we're in WebApp
              };
              
              console.log('Fallback login succeeded via Telegram WebApp data:', telegramUser);
              localStorage.setItem('telegramUser', JSON.stringify(telegramUser));
              onAuth(telegramUser);
            } else {
              console.log('No user data found in Telegram WebApp params');
            }
          }
        } catch (error) {
          console.error('Error parsing WebApp data:', error);
        }
      }
    } else {
      console.log('Not in Telegram WebApp, using regular auth flow');
      
      // Load Telegram script if not already loaded and not in WebApp
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
          console.log('Telegram login callback triggered with user:', user);
          onAuth(user);
          
          // Store user data in localStorage
          localStorage.setItem('telegramUser', JSON.stringify(user));
        };
        
        // Add script to document
        document.head.appendChild(script);
        
        // Create widget container if it doesn't exist
        if (!document.getElementById('telegram-login-container')) {
          const container = document.createElement('div');
          container.id = 'telegram-login-container';
          document.body.appendChild(container);
        }
      }
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
        
        console.log('Found Telegram auth data in URL:', user);
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
  
  // Create a custom Telegram login button - only show if not in WebApp
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
      alert('Telegram login is not available. Please try again later or open this app directly from Telegram.');
    }
  };
  
  // Don't show login button if running in Telegram WebApp
  if (window.Telegram?.WebApp) {
    return (
      <div className="text-center text-gray-500">
        <p>Logging in automatically...</p>
      </div>
    );
  }
  
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
