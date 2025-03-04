
import { useState, useEffect } from 'react';
import { PurchaseHistory, TelegramUser } from '@/types';
import { MAX_PURCHASES, TIME_WINDOW_MS, COOLDOWN_MS } from '@/constants/config';

export function usePurchaseManager() {
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>(() => {
    const storedHistory = localStorage.getItem('purchaseHistory');
    return storedHistory ? JSON.parse(storedHistory) : [];
  });
  
  const isUserOnCooldown = (username: string): boolean => {
    if (!username) return false;
    
    const userHistory = purchaseHistory.find(history => history.username === username);
    if (!userHistory) return false;
    
    if (userHistory.cooldownUntil && userHistory.cooldownUntil > Date.now()) {
      return true;
    }
    
    return false;
  };

  const getUserCooldownTimeRemaining = (username: string): number => {
    if (!username) return 0;
    
    const userHistory = purchaseHistory.find(history => history.username === username);
    if (!userHistory || !userHistory.cooldownUntil) return 0;
    
    const remainingTime = Math.max(0, userHistory.cooldownUntil - Date.now());
    return remainingTime;
  };

  const updatePurchaseHistory = (username: string, courseId: number) => {
    const now = Date.now();
    const updatedHistory = [...purchaseHistory];
    
    let userHistory = updatedHistory.find(history => history.username === username);
    
    if (!userHistory) {
      userHistory = {
        username,
        purchases: []
      };
      updatedHistory.push(userHistory);
    }
    
    userHistory.purchases.push({
      timestamp: now,
      courseId
    });
    
    const recentPurchases = userHistory.purchases.filter(
      purchase => purchase.timestamp > now - TIME_WINDOW_MS
    );
    
    userHistory.purchases = recentPurchases;
    
    if (recentPurchases.length > MAX_PURCHASES) {
      userHistory.cooldownUntil = now + COOLDOWN_MS;
    }
    
    setPurchaseHistory(updatedHistory);
    localStorage.setItem('purchaseHistory', JSON.stringify(updatedHistory));
    
    return userHistory.cooldownUntil;
  };

  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const updatedHistory = purchaseHistory.map(userHistory => {
        if (userHistory.cooldownUntil && userHistory.cooldownUntil < now) {
          const { cooldownUntil, ...rest } = userHistory;
          return { ...rest };
        }
        return userHistory;
      });
      
      if (JSON.stringify(updatedHistory) !== JSON.stringify(purchaseHistory)) {
        setPurchaseHistory(updatedHistory);
        localStorage.setItem('purchaseHistory', JSON.stringify(updatedHistory));
      }
    }, 60000);
    
    return () => clearInterval(cleanupInterval);
  }, [purchaseHistory]);

  return {
    purchaseHistory,
    isUserOnCooldown,
    getUserCooldownTimeRemaining,
    updatePurchaseHistory
  };
}
