
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TelegramUsernameInput from '@/components/TelegramAuth';
import CoursesSection from '@/components/CoursesSection';
import AdminSection from '@/components/AdminSection';
import UserInfo from '@/components/UserInfo';
import AccessCodeInput from '@/components/AccessCodeInput';
import { useTelegramUser } from '@/hooks/useTelegramUser';
import { ALL_COURSES } from '@/utils/udemyApi';

const Index = () => {
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true');
  const [showAdminTab, setShowAdminTab] = useState(() => localStorage.getItem('showAdminTab') === 'true');
  const { telegramUser, handleTelegramUsernameSubmit, handleTelegramLogout } = useTelegramUser();

  useEffect(() => {
    document.title = "CourseHunter - Find your next learning adventure";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            CourseHunter
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find your next learning adventure at an affordable price
          </p>
        </div>
        
        {telegramUser ? (
          <div className="mb-6 flex justify-center">
            <UserInfo telegramUser={telegramUser} onLogout={handleTelegramLogout} />
          </div>
        ) : (
          <div className="mb-6 flex justify-center">
            <Card className="p-4 max-w-md w-full">
              <h3 className="text-lg font-medium text-center mb-4">Enter Your Telegram Username</h3>
              <TelegramUsernameInput onSubmit={handleTelegramUsernameSubmit} />
            </Card>
          </div>
        )}
        
        <div className="mb-4 max-w-xs mx-auto opacity-20 hover:opacity-100 transition-opacity">
          <AccessCodeInput setShowAdminTab={setShowAdminTab} />
        </div>
        
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            {showAdminTab && <TabsTrigger value="admin">Admin Panel</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="courses">
            <CoursesSection 
              telegramUser={telegramUser} 
              isAdmin={isAdmin} 
            />
          </TabsContent>
          
          {showAdminTab && (
            <TabsContent value="admin">
              <AdminSection 
                isAdmin={isAdmin} 
                setIsAdmin={setIsAdmin} 
                setShowAdminTab={setShowAdminTab} 
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
