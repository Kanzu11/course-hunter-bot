
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { ADMIN_ACCESS_CODE } from '@/constants/config';

interface AccessCodeInputProps {
  setShowAdminTab: (value: boolean) => void;
}

const AccessCodeInput: React.FC<AccessCodeInputProps> = ({ setShowAdminTab }) => {
  const [accessCode, setAccessCode] = useState('');
  const { toast } = useToast();

  const handleUnlockAdmin = () => {
    if (accessCode === ADMIN_ACCESS_CODE) {
      setShowAdminTab(true);
      localStorage.setItem('showAdminTab', 'true');
      toast({
        title: "Admin Tab Unlocked",
        description: "You now have access to the admin tab.",
        variant: "default",
      });
      setAccessCode('');
    } else {
      toast({
        title: "Invalid Code",
        description: "The access code you entered is invalid.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex space-x-2">
      <Input
        type="text"
        value={accessCode}
        onChange={(e) => setAccessCode(e.target.value)}
        placeholder="Access code"
        className="text-xs"
      />
      <Button size="sm" variant="outline" onClick={handleUnlockAdmin}>
        Unlock
      </Button>
    </div>
  );
};

export default AccessCodeInput;
