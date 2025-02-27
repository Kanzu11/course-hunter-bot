
import React, { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import CourseCard from '@/components/CourseCard';
import LoadingCard from '@/components/LoadingCard';
import { useToast } from '@/hooks/use-toast';

// Temporary mock data
const mockCourses = [
  {
    id: 1,
    title: "Complete Web Development Bootcamp",
    description: "Learn web development from scratch. Master HTML, CSS, JavaScript, React and Node.js with practical projects.",
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop",
  },
  {
    id: 2,
    title: "Python Programming Masterclass",
    description: "Comprehensive Python programming course covering basics to advanced concepts, data science, and machine learning.",
    thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=450&fit=crop",
  },
  {
    id: 3,
    title: "Digital Marketing Essential Training",
    description: "Master digital marketing strategies, SEO, social media marketing, and content creation for business growth.",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop",
  },
];

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState(mockCourses);
  const [purchaseLoading, setPurchaseLoading] = useState<number | null>(null);
  const { toast } = useToast();

  const handleSearch = (query: string) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const filtered = mockCourses.filter(course => 
        course.title.toLowerCase().includes(query.toLowerCase()) ||
        course.description.toLowerCase().includes(query.toLowerCase())
      );
      setCourses(filtered);
      setLoading(false);
    }, 500);
  };

  const handlePurchase = async (courseId: number) => {
    try {
      setPurchaseLoading(courseId);
      
      // Find the course
      const course = mockCourses.find(c => c.id === courseId);
      if (!course) {
        throw new Error('Course not found');
      }
      
      // Send notification to Telegram channel using the bot
      const botToken = '7854582992:AAFpvQ1yzCi6PswUnI7dzzJtn0Ik07hY6K4';
      const channelId = '@udemmmmp'; // Channel username
      
      // Create order message
      const orderMessage = `
🛒 *NEW COURSE ORDER*
      
📚 *Course:* ${course.title}
💰 *Price:* 300 ETB
⏰ *Order Time:* ${new Date().toLocaleString()}
      
Order is waiting for processing.
      `;
      
      // Encode message for URL
      const encodedMessage = encodeURIComponent(orderMessage);
      
      // Send to Telegram
      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${channelId}&text=${encodedMessage}&parse_mode=Markdown`;
      
      const response = await fetch(telegramUrl);
      const data = await response.json();
      
      if (!data.ok) {
        throw new Error('Failed to send notification to Telegram');
      }
      
      // Show success message
      toast({
        title: "Order Placed Successfully!",
        description: `Your order for "${course.title}" has been placed. We'll send you the course details soon.`,
        variant: "default",
      });
      
      console.log('Purchase completed for course:', courseId);
      console.log('Notification sent to Telegram channel');
      
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Udemy Course Hunter
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find your next learning adventure at an affordable price
          </p>
        </div>
        
        <div className="mb-12">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array(3).fill(0).map((_, index) => (
              <LoadingCard key={index} />
            ))
          ) : (
            courses.map((course) => (
              <CourseCard
                key={course.id}
                title={course.title}
                description={course.description}
                thumbnail={course.thumbnail}
                onPurchase={() => handlePurchase(course.id)}
                isLoading={purchaseLoading === course.id}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
