
import React from 'react';
import { Button } from "@/components/ui/button";
import { TelegramUser } from '@/types';
import { usePurchaseManager } from '@/hooks/usePurchaseManager';

interface UserInfoProps {
  telegramUser: TelegramUser;
  onLogout: () => void;
}

const UserInfo: React.FC<UserInfoProps> = ({ telegramUser, onLogout }) => {
  const { isUserOnCooldown, getUserCooldownTimeRemaining } = usePurchaseManager();
  const username = telegramUser.username;
  const onCooldown = isUserOnCooldown(username);
  
  return (
    <div className="bg-white shadow-sm rounded-lg p-4 flex items-center space-x-4 max-w-md w-full">
      <div className="flex-1">
        <p className="font-medium">
          Welcome, @{username}!
        </p>
        {onCooldown && (
          <p className="text-sm text-red-500">
            Purchase limit reached. Cooldown: {Math.ceil(getUserCooldownTimeRemaining(username) / (60 * 1000))} minutes
          </p>
        )}
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onLogout}
      >
        Change Username
      </Button>
    </div>
  );
};

export default UserInfo;
