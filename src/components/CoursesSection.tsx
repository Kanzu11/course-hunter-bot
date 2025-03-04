
import React, { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import CourseCard from '@/components/CourseCard';
import LoadingCard from '@/components/LoadingCard';
import { searchUdemyCourses, ALL_COURSES } from '@/utils/udemyApi';
import { TelegramUser } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { usePurchaseManager } from '@/hooks/usePurchaseManager';
import { useOrderManager } from '@/hooks/useOrderManager';
import { MAX_PURCHASES } from '@/constants/config';

interface CoursesSectionProps {
  telegramUser: TelegramUser | null;
  isAdmin: boolean;
}

const CoursesSection: React.FC<CoursesSectionProps> = ({ telegramUser, isAdmin }) => {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState(ALL_COURSES);
  const [purchaseLoading, setPurchaseLoading] = useState<number | null>(null);
  const [hasPurchased, setHasPurchased] = useState(() => localStorage.getItem('hasPurchased') === 'true');
  const { toast } = useToast();
  const { isUserOnCooldown, getUserCooldownTimeRemaining, updatePurchaseHistory } = usePurchaseManager();
  const { addOrder } = useOrderManager();

  const handleSearch = async (query: string) => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      const searchResults = await searchUdemyCourses(query);
      
      setCourses(searchResults);
      
      if (searchResults.length === 0 && query.trim() !== '') {
        toast({
          title: "No courses found",
          description: "Try different keywords or check your spelling",
          variant: "destructive",
        });
      } else if (query.trim() !== '') {
        toast({
          title: `Found ${searchResults.length} courses`,
          description: "Showing the most relevant results",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (courseId: number) => {
    if (purchaseLoading !== null) return;
    
    try {
      setPurchaseLoading(courseId);
      
      if (!telegramUser) {
        toast({
          title: "Username Required",
          description: "Please enter your Telegram username before purchasing a course.",
          variant: "destructive",
        });
        setPurchaseLoading(null);
        return;
      }
      
      const username = telegramUser.username;
      
      if (isUserOnCooldown(username)) {
        const remainingTime = getUserCooldownTimeRemaining(username);
        const minutes = Math.ceil(remainingTime / (60 * 1000));
        
        toast({
          title: "Purchase Limit Reached",
          description: `You've reached the maximum number of purchases. Please try again in ${minutes} minutes.`,
          variant: "destructive",
        });
        setPurchaseLoading(null);
        return;
      }
      
      const course = ALL_COURSES.find(c => c.id === courseId);
      if (!course) {
        throw new Error('Course not found');
      }
      
      const orderId = `ORDER-${Date.now()}`;
      
      const newOrder = {
        id: orderId,
        courseId: course.id,
        courseTitle: course.title,
        orderDate: new Date().toLocaleString(),
        status: 'pending' as const,
        telegramUsername: username
      };
      
      addOrder(newOrder);
      
      setHasPurchased(true);
      localStorage.setItem('hasPurchased', 'true');
      
      const cooldownUntil = updatePurchaseHistory(username, courseId);
      
      if (cooldownUntil) {
        const cooldownMinutes = Math.ceil((cooldownUntil - Date.now()) / (60 * 1000));
        toast({
          title: "Purchase Limit Reached",
          description: `You've reached the maximum number of purchases (${MAX_PURCHASES}). A cooldown of ${cooldownMinutes} minutes has been applied.`,
          variant: "destructive",
        });
      }
      
      const botToken = '7854582992:AAFpvQ1yzCi6PswUnI7dzzJtn0Ik07hY6K4';
      const channelId = '@udemmmmp';
      
      const orderMessage = `
🛒 *NEW COURSE ORDER*

📚 *Course:* ${course.title}
🆔 *Order ID:* ${orderId}
💰 *Price:* 299 ETB
⏰ *Order Time:* ${new Date().toLocaleString()}
👤 *Telegram:* @${username}

Order is waiting for processing. Course will be sent directly to the customer.
`;
      
      const encodedMessage = encodeURIComponent(orderMessage);
      
      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${channelId}&text=${encodedMessage}&parse_mode=Markdown`;
      
      const response = await fetch(telegramUrl);
      const data = await response.json();
      
      if (!data.ok) {
        console.error('Telegram API error:', data);
        throw new Error(`Failed to send notification to Telegram: ${JSON.stringify(data)}`);
      }
      
      toast({
        title: "Order Placed Successfully!",
        description: `Your order for "${course.title}" has been placed. You will receive your course via Telegram soon.`,
        variant: "default",
      });
      
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Order Failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPurchaseLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <SearchBar 
          onSearch={handleSearch} 
          isLoading={loading} 
          placeholder="Search for courses (e.g. '100 Days of Code', 'Python', 'Web Development')"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, index) => (
            <LoadingCard key={index} />
          ))
        ) : courses.length > 0 ? (
          courses.map((course) => (
            <CourseCard
              key={course.id}
              title={course.title}
              description={course.description}
              thumbnail={course.image_480x270}
              price={course.price_detail?.amount}
              rating={course.rating}
              numReviews={course.num_reviews}
              instructor={course.instructor}
              onPurchase={() => handlePurchase(course.id)}
              isLoading={purchaseLoading === course.id}
            />
          ))
        ) : (
          <div className="col-span-3 text-center py-10">
            <h3 className="text-xl font-medium text-gray-700">
              {loading ? 'Searching courses...' : 'No courses found'}
            </h3>
            <p className="text-gray-500 mt-2">
              Try another search term or browse all courses
            </p>
          </div>
        )}
      </div>
      
      {telegramUser && isUserOnCooldown(telegramUser.username) && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-medium text-red-800">Purchase Limit Reached</h3>
          <p className="text-red-700">
            You've reached the maximum number of purchases ({MAX_PURCHASES}) within the time limit. 
            Please try again in {Math.ceil(getUserCooldownTimeRemaining(telegramUser.username) / (60 * 1000))} minutes.
          </p>
        </div>
      )}
      
      {hasPurchased && (
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-medium text-green-800">Thank you for your order!</h3>
          <p className="text-green-700">
            We're processing your request. You'll receive your course download link directly on Telegram.
          </p>
        </div>
      )}
    </div>
  );
};

export default CoursesSection;
