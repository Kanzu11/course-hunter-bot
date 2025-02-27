
import React, { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import CourseCard from '@/components/CourseCard';
import LoadingCard from '@/components/LoadingCard';
import { useToast } from '@/hooks/use-toast';

// Expanded mock data to demonstrate better search
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
  {
    id: 4,
    title: "Web Design for Beginners",
    description: "Learn UI/UX principles and web design fundamentals. Create beautiful, responsive websites with HTML and CSS.",
    thumbnail: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=450&fit=crop",
  },
  {
    id: 5,
    title: "JavaScript Advanced Concepts",
    description: "Deep dive into JavaScript. Learn closures, prototypes, async/await, and other advanced JavaScript patterns.",
    thumbnail: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&h=450&fit=crop",
  },
  {
    id: 6,
    title: "Social Media Marketing Masterclass",
    description: "Learn how to grow your business using Facebook, Instagram, Twitter, and TikTok marketing strategies.",
    thumbnail: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&h=450&fit=crop",
  },
];

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState(mockCourses);
  const [purchaseLoading, setPurchaseLoading] = useState<number | null>(null);
  const { toast } = useToast();

  // Enhanced search function that finds partial matches and similar courses
  const handleSearch = (query: string) => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (!query.trim()) {
        setCourses(mockCourses);
        setLoading(false);
        return;
      }
      
      const queryWords = query.toLowerCase().split(/\s+/);
      
      // Calculate relevance score for each course
      const scoredCourses = mockCourses.map(course => {
        const titleLower = course.title.toLowerCase();
        const descLower = course.description.toLowerCase();
        
        // Calculate match score (higher is better)
        let score = 0;
        
        // Check for exact matches first (highest priority)
        if (titleLower.includes(query.toLowerCase())) {
          score += 10;
        }
        
        if (descLower.includes(query.toLowerCase())) {
          score += 5;
        }
        
        // Check for partial matches with individual words
        queryWords.forEach(word => {
          if (word.length > 2) { // Only consider words with 3+ characters
            if (titleLower.includes(word)) {
              score += 3;
            }
            if (descLower.includes(word)) {
              score += 1;
            }
          }
        });
        
        return { course, score };
      });
      
      // Filter courses with any relevance and sort by score
      const filteredCourses = scoredCourses
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.course);
      
      setCourses(filteredCourses.length ? filteredCourses : mockCourses);
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
      // Make sure the bot is added to the channel as an admin with post messages permission
      const botToken = '7854582992:AAFpvQ1yzCi6PswUnI7dzzJtn0Ik07hY6K4';
      const channelId = '@udemmmmp'; // Channel username with @ symbol
      
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
        throw new Error(`Failed to send notification to Telegram: ${JSON.stringify(data)}`);
      }
      
      // Show success message
      toast({
        title: "Order Placed Successfully!",
        description: `Your order for "${course.title}" has been placed. We'll send you the course details soon.`,
        variant: "default",
      });
      
      console.log('Purchase completed for course:', courseId);
      console.log('Notification sent to Telegram channel');
      console.log('Telegram API response:', data);
      
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
          ) : courses.length > 0 ? (
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
          ) : (
            <div className="col-span-3 text-center py-10">
              <h3 className="text-xl font-medium text-gray-700">No courses found</h3>
              <p className="text-gray-500 mt-2">Try a different search term</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
