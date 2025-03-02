import React, { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import CourseCard from '@/components/CourseCard';
import LoadingCard from '@/components/LoadingCard';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Type for mock courses
interface UdemyCourse {
  id: number;
  title: string;
  url: string;
  description: string;
  image_480x270: string;
  price: string;
  price_detail: {
    amount: number;
    currency: string;
  };
}

// Type for orders
interface Order {
  id: string;
  courseId: number;
  courseTitle: string;
  orderDate: string;
  status: 'pending' | 'completed';
  chatId?: string; // Add chat ID for Telegram messaging
}

// The secure admin access code - this should ideally be hashed in a real app
const ADMIN_ACCESS_CODE = 'admin-kanzed-2024';

// Mock course data to replace Udemy API
const MOCK_COURSES: UdemyCourse[] = [
  {
    id: 1,
    title: "Complete Web Development Bootcamp 2024",
    url: "https://www.udemy.com/course/web-development-bootcamp/",
    description: "Become a full-stack web developer with just one course. HTML, CSS, Javascript, Node, React, MongoDB, Web3 and more!",
    image_480x270: "https://img-c.udemycdn.com/course/480x270/1565838_e54e_16.jpg",
    price: "$94.99",
    price_detail: {
      amount: 94.99,
      currency: "USD"
    }
  },
  {
    id: 2,
    title: "Machine Learning A-Z: AI, Python & R + ChatGPT",
    url: "https://www.udemy.com/course/machinelearning/",
    description: "Learn to create Machine Learning Algorithms in Python and R from two Data Science experts. Code templates included.",
    image_480x270: "https://img-c.udemycdn.com/course/480x270/950390_270f_3.jpg",
    price: "$84.99",
    price_detail: {
      amount: 84.99,
      currency: "USD"
    }
  },
  {
    id: 3,
    title: "The Complete JavaScript Course 2024: From Zero to Expert!",
    url: "https://www.udemy.com/course/the-complete-javascript-course/",
    description: "The modern JavaScript course for everyone! Master JavaScript with projects, challenges and theory. Many courses in one!",
    image_480x270: "https://img-c.udemycdn.com/course/480x270/851712_fc61_6.jpg",
    price: "$94.99",
    price_detail: {
      amount: 94.99,
      currency: "USD"
    }
  },
  {
    id: 4,
    title: "React - The Complete Guide 2024 (incl. React Router & Redux)",
    url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
    description: "Dive in and learn React.js from scratch! Learn Reactjs, Redux, React Routing, Animations, Next.js and more!",
    image_480x270: "https://img-c.udemycdn.com/course/480x270/1362070_b9a1_2.jpg",
    price: "$94.99",
    price_detail: {
      amount: 94.99,
      currency: "USD"
    }
  },
  {
    id: 5,
    title: "Python for Data Science and Machine Learning Bootcamp",
    url: "https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/",
    description: "Learn how to use NumPy, Pandas, Seaborn, Matplotlib, Plotly, Scikit-Learn, Machine Learning, and more!",
    image_480x270: "https://img-c.udemycdn.com/course/480x270/903744_8eb2.jpg",
    price: "$89.99",
    price_detail: {
      amount: 89.99,
      currency: "USD"
    }
  },
  {
    id: 6,
    title: "The Complete Digital Marketing Course - 12 Courses in 1",
    url: "https://www.udemy.com/course/the-complete-digital-marketing-course/",
    description: "Master Digital Marketing Strategy, Social Media Marketing, SEO, YouTube, Email, Facebook Marketing, Analytics & More!",
    image_480x270: "https://img-c.udemycdn.com/course/480x270/914296_3670_8.jpg",
    price: "$84.99",
    price_detail: {
      amount: 84.99,
      currency: "USD"
    }
  },
  {
    id: 7,
    title: "The Data Science Course 2024: Complete Data Science Bootcamp",
    url: "https://www.udemy.com/course/the-data-science-course-complete-data-science-bootcamp/",
    description: "Complete Data Science Training: Mathematics, Statistics, Python, Advanced Statistics in Python, Machine & Deep Learning",
    image_480x270: "https://img-c.udemycdn.com/course/480x270/1754098_e0df_3.jpg",
    price: "$84.99",
    price_detail: {
      amount: 84.99,
      currency: "USD"
    }
  },
  {
    id: 8,
    title: "AWS Certified Solutions Architect - Associate 2024",
    url: "https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/",
    description: "Want to pass the AWS Solutions Architect Associate Exam? Want to become Amazon Web Services Certified? Do this course!",
    image_480x270: "https://img-c.udemycdn.com/course/480x270/362328_91f3_10.jpg",
    price: "$94.99",
    price_detail: {
      amount: 94.99,
      currency: "USD"
    }
  },
  {
    id: 9,
    title: "The Complete Cyber Security Course: Hackers Exposed!",
    url: "https://www.udemy.com/course/the-complete-internet-security-privacy-course-volume-1/",
    description: "Volume 1: Become a Cyber Security Specialist, Defeat Hackers and Network Engineer with Practical Cyber Security Skills!",
    image_480x270: "https://img-c.udemycdn.com/course/480x270/614772_233b_9.jpg",
    price: "$74.99",
    price_detail: {
      amount: 74.99,
      currency: "USD"
    }
  },
  {
    id: 10,
    title: "iOS & Swift - The Complete iOS App Development Bootcamp",
    url: "https://www.udemy.com/course/ios-13-app-development-bootcamp/",
    description: "From Beginner to iOS App Developer with Just One Course! Fully Updated with Complete Modules on SwiftUI and Telegram Clones!",
    image_480x270: "https://img-c.udemycdn.com/course/480x270/1778502_f4b9_12.jpg",
    price: "$94.99",
    price_detail: {
      amount: 94.99,
      currency: "USD"
    }
  },
  {
    id: 11,
    title: "Angular - The Complete Guide (2024 Edition)",
    url: "https://www.udemy.com/course/the-complete-guide-to-angular-2/",
    description: "Master Angular (formerly \"Angular 2\") and build awesome, reactive web apps with the successor of Angular.js",
    image_480x270: "https://img-c.udemycdn.com/course/480x270/756150_c033_2.jpg",
    price: "$94.99",
    price_detail: {
      amount: 94.99,
      currency: "USD"
    }
  },
  {
    id: 12,
    title: "Microsoft Excel - Excel from Beginner to Advanced",
    url: "https://www.udemy.com/course/microsoft-excel-2013-from-beginner-to-advanced-and-beyond/",
    description: "Excel with this A-Z Microsoft Excel Course. Microsoft Excel 2010, 2013, 2016, Excel 2019, Office 365",
    image_480x270: "https://img-c.udemycdn.com/course/480x270/793796_0e89_2.jpg",
    price: "$94.99",
    price_detail: {
      amount: 94.99,
      currency: "USD"
    }
  }
];

// Add the new Python course
const ADDITIONAL_COURSES: UdemyCourse[] = [
  {
    id: 13,
    title: "100 Days of Code: The Complete Python Pro Bootcamp",
    url: "https://www.udemy.com/course/100-days-of-code/",
    description: "Master Python by building 100 projects in 100 days. Learn data science, automation, build websites, games and apps!",
    image_480x270: "https://img-c.udemycdn.com/course/480x270/2776760_f176_10.jpg",
    price: "$89.99",
    price_detail: {
      amount: 89.99,
      currency: "USD"
    }
  }
];

// Combine the courses
const ALL_COURSES = [...MOCK_COURSES, ...ADDITIONAL_COURSES];

const Index = () => {
  // State variables with stable initialization
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<UdemyCourse[]>(ALL_COURSES);
  const [purchaseLoading, setPurchaseLoading] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true');
  const [adminPassword, setAdminPassword] = useState('');
  const [orders, setOrders] = useState<Order[]>(() => {
    const storedOrders = localStorage.getItem('orders');
    return storedOrders ? JSON.parse(storedOrders) : [];
  });
  const [courseLink, setCourseLink] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showAdminTab, setShowAdminTab] = useState(() => localStorage.getItem('showAdminTab') === 'true');
  const [accessCode, setAccessCode] = useState('');
  const [hasPurchased, setHasPurchased] = useState(() => localStorage.getItem('hasPurchased') === 'true');
  const { toast } = useToast();

  // Improved search function with better matching
  const handleSearch = (query: string) => {
    if (loading) return; // Prevent multiple concurrent searches
    
    setLoading(true);
    
    // Short timeout just to simulate a real search
    setTimeout(() => {
      if (!query.trim()) {
        // If query is empty, show all courses
        setCourses(ALL_COURSES);
      } else {
        // Filter courses with improved search logic
        const searchTerm = query.toLowerCase();
        const filteredCourses = ALL_COURSES.filter(course => {
          const titleLower = course.title.toLowerCase();
          const descLower = course.description.toLowerCase();
          
          // Check if any word from the search query appears in the title or description
          const searchWords = searchTerm.split(' ');
          return searchWords.some(word => 
            titleLower.includes(word) || descLower.includes(word)
          );
        });
        
        setCourses(filteredCourses);
      }
      
      setLoading(false);
    }, 300);
  };

  // Handle purchase process - improved to not ask for Telegram ID
  const handlePurchase = async (courseId: number) => {
    if (purchaseLoading !== null) return; // Prevent multiple concurrent purchases
    
    try {
      setPurchaseLoading(courseId);
      
      // Find the course
      const course = ALL_COURSES.find(c => c.id === courseId);
      if (!course) {
        throw new Error('Course not found');
      }
      
      // Create a unique order ID
      const orderId = `ORDER-${Date.now()}`;
      
      // Create a new order (without asking for chat ID)
      const newOrder: Order = {
        id: orderId,
        courseId: course.id,
        courseTitle: course.title,
        orderDate: new Date().toLocaleString(),
        status: 'pending'
      };
      
      // Save order to localStorage
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedOrders = [...existingOrders, newOrder];
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      
      // Update purchase status
      setHasPurchased(true);
      localStorage.setItem('hasPurchased', 'true');
      
      // Update state if in admin mode
      if (isAdmin) {
        setOrders(updatedOrders);
      } else {
        setOrders(existingOrders => [...existingOrders, newOrder]);
      }
      
      // Send notification to Telegram channel using the bot
      const botToken = '7854582992:AAFpvQ1yzCi6PswUnI7dzzJtn0Ik07hY6K4';
      const channelId = '@udemmmmp'; // Channel username with @ symbol
      
      // Create order message
      const orderMessage = `
🛒 *NEW COURSE ORDER*

📚 *Course:* ${course.title}
🆔 *Order ID:* ${orderId}
💰 *Price:* 300 ETB
⏰ *Order Time:* ${new Date().toLocaleString()}

Order is waiting for processing. Customer will receive course via our bot @udemmy_official_bot
`;
      
      // Encode message for URL
      const encodedMessage = encodeURIComponent(orderMessage);
      
      // Send to Telegram
      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${channelId}&text=${encodedMessage}&parse_mode=Markdown`;
      
      const response = await fetch(telegramUrl);
      const data = await response.json();
      
      if (!data.ok) {
        console.error('Telegram API error:', data);
        throw new Error(`Failed to send notification to Telegram: ${JSON.stringify(data)}`);
      }
      
      // Show success message with instructions for the user
      toast({
        title: "Order Placed Successfully!",
        description: `Your order for "${course.title}" has been placed. Please message @udemmy_official_bot on Telegram to receive your course.`,
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

  // Admin login handler - using secure access code
  const handleAdminLogin = () => {
    // Check if entered password matches the secure admin access code
    if (adminPassword === ADMIN_ACCESS_CODE) {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      
      // Load orders from localStorage
      const storedOrders = localStorage.getItem('orders');
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      }
      
      toast({
        title: "Admin Login Successful",
        description: "You now have access to the admin panel.",
        variant: "default",
      });
    } else {
      toast({
        title: "Admin Login Failed",
        description: "Incorrect access code. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Admin logout handler
  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
    toast({
      title: "Admin Logout",
      description: "You have been logged out of the admin panel.",
      variant: "default",
    });
  };

  // Send course link via Telegram bot - Updated to use direct user chat ID
  const handleSendCourseLink = async () => {
    if (!selectedOrderId || !courseLink.trim()) {
      toast({
        title: "Error",
        description: "Please select an order and enter a course link",
        variant: "destructive",
      });
      return;
    }

    try {
      const order = orders.find(o => o.id === selectedOrderId);
      if (!order) {
        throw new Error('Order not found');
      }

      if (!order.chatId) {
        toast({
          title: "Error",
          description: "This order doesn't have a chat ID. Please ask the customer for their Telegram chat ID.",
          variant: "destructive",
        });
        return;
      }

      // Send message directly to the user's chat ID
      const botToken = '7854582992:AAFpvQ1yzCi6PswUnI7dzzJtn0Ik07hY6K4';
      const userChatId = order.chatId; // Use the stored chat ID
      
      const message = `
✅ *COURSE DELIVERY*

🆔 *Order ID:* ${order.id}
📚 *Course:* ${order.courseTitle}
🔗 *Download Link:* ${courseLink}

Thank you for your purchase!
`;
      
      const encodedMessage = encodeURIComponent(message);
      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${userChatId}&text=${encodedMessage}&parse_mode=Markdown`;
      
      const response = await fetch(telegramUrl);
      const data = await response.json();
      
      if (!data.ok) {
        console.error('Telegram API error:', data);
        throw new Error(`Failed to send course link via Telegram: ${JSON.stringify(data)}`);
      }
      
      // Also send confirmation to the channel
      const channelId = '@udemmmmp';
      const channelMessage = `
📬 *COURSE DELIVERED*

🆔 *Order ID:* ${order.id}
📚 *Course:* ${order.courseTitle}
👤 *User Chat ID:* ${order.chatId}

Course has been delivered to the customer.
`;
      
      const encodedChannelMessage = encodeURIComponent(channelMessage);
      const channelUrl = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${channelId}&text=${encodedChannelMessage}&parse_mode=Markdown`;
      
      await fetch(channelUrl);
      
      // Make admin tab visible permanently after first successful delivery
      setShowAdminTab(true);
      localStorage.setItem('showAdminTab', 'true');
      
      // Update order status to completed
      const updatedOrders = orders.map(o => 
        o.id === selectedOrderId ? { ...o, status: 'completed' as const } : o
      );
      
      setOrders(updatedOrders);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      
      toast({
        title: "Course Link Sent",
        description: "The course download link has been sent successfully to the customer's Telegram.",
        variant: "default",
      });
      
      // Reset form
      setCourseLink('');
      setSelectedOrderId(null);
      
    } catch (error) {
      console.error('Error sending course link:', error);
      toast({
        title: "Error",
        description: "Failed to send course link. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to unlock admin tab with special access code
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

  // Initialize by loading all courses on first render
  useEffect(() => {
    setCourses(ALL_COURSES);
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
        
        {/* Hidden access code input - only for developer/admin access */}
        <div className="mb-4 max-w-xs mx-auto opacity-20 hover:opacity-100 transition-opacity">
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
        </div>
        
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            {showAdminTab && <TabsTrigger value="admin">Admin Panel</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="courses" className="space-y-8">
            <div className="mb-8">
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
                    thumbnail={course.image_480x270}
                    price={course.price_detail?.amount}
                    onPurchase={() => handlePurchase(course.id)}
                    isLoading={purchaseLoading === course.id}
                  />
                ))
              ) : (
                <div className="col-span-3 text-center py-10">
                  <h3 className="text-xl font-medium text-gray-700">
                    {loading ? 'Searching courses...' : 'Search for courses'}
                  </h3>
                  <p className="text-gray-500 mt-2">
                    Enter a search term to find courses
                  </p>
                </div>
              )}
            </div>
            
            {hasPurchased && (
              <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-medium text-green-800">Thank you for your order!</h3>
                <p className="text-green-700">
                  We're processing your request. You'll receive your course download link on Telegram.
                </p>
              </div>
            )}
          </TabsContent>
          
          {showAdminTab && (
            <TabsContent value="admin">
              {!isAdmin ? (
                <Card className="max-w-md mx-auto p-6">
                  <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium">
                        Admin Access Code
                      </label>
                      <Input
                        id="password"
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Enter admin access code"
                      />
                    </div>
                    <Button onClick={handleAdminLogin} className="w-full">
                      Login
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Admin Panel</h2>
                    <Button variant="outline" onClick={handleAdminLogout}>
                      Logout
                    </Button>
                  </div>
                  
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Send Course Link</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="order" className="text-sm font-medium">
                          Select Order
                        </label>
                        <select
                          id="order"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={selectedOrderId || ''}
                          onChange={(e) => setSelectedOrderId(e.target.value || null)}
                        >
                          <option value="">-- Select an order --</option>
                          {orders.map(order => (
                            <option key={order.id} value={order.id}>
                              {order.id} - {order.courseTitle} {order.chatId ? `(Chat ID: ${order.chatId})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="courseLink" className="text-sm font-medium">
                          Course Download Link
                        </label>
                        <Input
                          id="courseLink"
                          type="text"
                          value={courseLink}
                          onChange={(e) => setCourseLink(e.target.value)}
                          placeholder="Enter course download link"
                        />
                      </div>
                      
                      <Button onClick={handleSendCourseLink} className="w-full">
                        Send Link to Customer
                      </Button>
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Order History</h3>
                    {orders.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="py-2 px-4 text-left">Order ID</th>
                              <th className="py-2 px-4 text-left">Course</th>
                              <th className="py-2 px-4 text-left">Date</th>
                              <th className="py-2 px-4 text-left">Status</th>
                              <th className="py-2 px-4 text-left">Chat ID</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.map(order => (
                              <tr key={order.id} className="border-b hover:bg-gray-50">
                                <td className="py-2 px-4">{order.id}</td>
                                <td className="py-2 px-4">{order.courseTitle}</td>
                                <td className="py-2 px-4">{order.orderDate}</td>
                                <td className="py-2 px-4">
                                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                    order.status === 'completed' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {order.status === 'completed' ? 'Delivered' : 'Pending'}
                                  </span>
                                </td>
                                <td className="py-2 px-4">{order.chatId || 'Not provided'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        No orders found.
                      </p>
                    )}
                  </Card>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
