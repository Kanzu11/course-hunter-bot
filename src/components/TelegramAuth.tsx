import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TelegramUsernameProps {
  onSubmit: (username: string) => void;
}

// Define telegram webapp interface
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: {
          user?: {
            username?: string;
            id?: number;
            first_name?: string;
            last_name?: string;
          };
        };
      };
    };
  }
}

const TelegramUsernameInput: React.FC<TelegramUsernameProps> = ({ onSubmit }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [verificationCode, setVerificationCode] = useState('');
  const [sentVerificationCode, setSentVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [verificationTimer, setVerificationTimer] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Try to get username from Telegram WebApp
    try {
      if (window.Telegram?.WebApp?.initDataUnsafe?.user?.username) {
        const telegramUsername = window.Telegram.WebApp.initDataUnsafe.user.username;
        console.log('Got Telegram username automatically:', telegramUsername);
        
        // Validate the automatically retrieved username
        if (validateTelegramUsername(telegramUsername)) {
          onSubmit(telegramUsername);
          setLoading(false);
          return;
        } else {
          console.error('Automatically retrieved Telegram username is invalid');
          toast({
            title: "Invalid Username",
            description: "Your Telegram username is invalid. Please enter a valid username.",
            variant: "destructive",
          });
        }
      }
      
      console.log('Could not get Telegram username automatically. Falling back to manual input.');
      setLoading(false);
    } catch (err) {
      console.error('Error accessing Telegram WebApp:', err);
      setLoading(false);
    }
  }, [onSubmit, toast]);

  // Enhanced username validation function
  const validateTelegramUsername = (username: string): boolean => {
    // Remove @ if present
    const formattedUsername = username.startsWith('@') ? username.substring(1) : username;
    
    // Check if username is valid according to Telegram rules:
    // - 5-32 characters
    // - Only contains A-Z, a-z, 0-9, and underscores
    // - Cannot start with a number or underscore
    // - Cannot have consecutive underscores
    // - Cannot end with an underscore
    
    return (
      formattedUsername.length >= 5 &&
      formattedUsername.length <= 32 &&
      /^[a-zA-Z][a-zA-Z0-9_]*[a-zA-Z0-9]$/.test(formattedUsername) &&
      !formattedUsername.includes('__')
    );
  };

  // Generate a random verification code
  const generateVerificationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Send verification code to Telegram bot
  const sendVerificationCode = async () => {
    if (!username.trim()) {
      setError('Please enter your Telegram username');
      return;
    }

    let formattedUsername = username.trim();
    if (formattedUsername.startsWith('@')) {
      formattedUsername = formattedUsername.substring(1);
    }
    
    if (!validateTelegramUsername(formattedUsername)) {
      setError('Invalid Telegram username. Username must be 5-32 characters, start with a letter, and contain only letters, numbers, and underscores (no consecutive underscores).');
      return;
    }

    setIsVerifying(true);
    const generatedCode = generateVerificationCode();
    setSentVerificationCode(generatedCode);

    try {
      const botToken = '7854582992:AAFpvQ1yzCi6PswUnI7dzzJtn0Ik07hY6K4';
      const message = `📱 Verification Code: ${generatedCode}\n\nPlease enter this code in the CourseHunter app to verify your Telegram username. This code will expire in 5 minutes.`;
      
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: `@${formattedUsername}`,
          text: message,
        }),
      });

      const data = await response.json();
      
      if (data.ok) {
        setIsCodeSent(true);
        toast({
          title: "Verification Code Sent",
          description: `Please check your Telegram messages for a verification code from our bot and enter it below.`,
          variant: "default",
        });
        
        // Start countdown timer (5 minutes)
        setVerificationTimer(300);
        const timerInterval = setInterval(() => {
          setVerificationTimer((prevTime) => {
            if (prevTime <= 1) {
              clearInterval(timerInterval);
              if (isCodeSent && !verificationCode) {
                // Reset if user hasn't completed verification
                setIsCodeSent(false);
                setSentVerificationCode('');
                toast({
                  title: "Verification Expired",
                  description: "The verification code has expired. Please request a new one.",
                  variant: "destructive",
                });
              }
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);
      } else {
        console.error('Failed to send message:', data);
        toast({
          title: "Verification Failed",
          description: "We couldn't send a message to that username. Please check if the username exists and if our bot can message you.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      toast({
        title: "Verification Error",
        description: "There was a problem sending the verification code. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Verify the entered code
  const verifyCode = () => {
    if (verificationCode === sentVerificationCode) {
      // Code is valid, submit the username
      const formattedUsername = username.startsWith('@') ? username.substring(1) : username;
      onSubmit(formattedUsername);
      toast({
        title: "Verification Successful",
        description: "Your Telegram username has been verified successfully!",
        variant: "default",
      });
    } else {
      toast({
        title: "Invalid Code",
        description: "The verification code you entered is incorrect. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If we're already in verification mode, verify the code
    if (isCodeSent) {
      verifyCode();
      return;
    }
    
    // Otherwise, start the verification process
    sendVerificationCode();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0088cc]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center">
            <span className="bg-gray-100 text-gray-500 px-3 py-2 border border-r-0 rounded-l-md">@</span>
            <Input 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_telegram_username"
              className="rounded-l-none"
              disabled={isCodeSent}
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          
          {isCodeSent && (
            <>
              <div className="mt-4">
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code {verificationTimer > 0 && <span className="text-blue-500">({formatTime(verificationTimer)})</span>}
                </label>
                <Input
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter the 6-digit code"
                  className="w-full"
                  maxLength={6}
                />
              </div>
              
              <Alert variant="default" className="bg-blue-50 border-blue-200">
                <AlertDescription>
                  We've sent a verification code to your Telegram account. Please check your messages and enter the code above.
                </AlertDescription>
              </Alert>
            </>
          )}
          
          <Button 
            type="submit"
            className="bg-[#0088cc] hover:bg-[#0070a8] text-white px-6 py-3 rounded-lg flex items-center gap-2"
            disabled={isVerifying}
          >
            {isVerifying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Sending Code...</span>
              </>
            ) : isCodeSent ? (
              'Verify Code'
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" className="mr-2">
                  <path d="M21.38 4.59c.17.85-.34 1.7-.73 2.37L12 21.17c-.38.67-1.36.96-2.04.59-.17-.09-.33-.2-.45-.35L2.09 14.1c-.5-.57-.45-1.43.12-1.93.17-.15.35-.25.56-.31L19.35 4.1c.82-.16 1.63.32 1.8 1.14l.23-.65Z" fill="#0088cc"/>
                </svg>
                Verify with Telegram
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TelegramUsernameInput;
