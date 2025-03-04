import React, { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import CourseCard from '@/components/CourseCard';
import LoadingCard from '@/components/LoadingCard';
import TelegramUsernameInput from '@/components/TelegramAuth';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { searchUdemyCourses, ALL_COURSES } from '@/utils/udemyApi';

interface TelegramUser {
  username: string;
  id?: number;
}

interface Order {
  id: string;
  courseId: number;
  courseTitle: string;
  orderDate: string;
  status: 'pending' | 'completed';
  telegramUsername: string;
}

interface PurchaseHistory {
  username: string;
  purchases: {
    timestamp: number;
    courseId: number;
  }[];
  cooldownUntil?: number;
}

const ADMIN_ACCESS_CODE = 'admin-kanzed-2024';
const MAX_PURCHASES = 6;
const TIME_WINDOW_MS = 10 * 60 * 1000; // 10 minutes in milliseconds
const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes in milliseconds

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState(ALL_COURSES);
  const [purchaseLoading, setPurchaseLoading] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true');
  const [adminPassword, setAdminPassword] = useState('');
  const [orders, setOrders] = useState<Order[]>(() => {
    const storedOrders = localStorage.getItem('orders');
    return storedOrders ? JSON.parse(storedOrders) : [];
  });
  const [courseLink, setCourseLink] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showAdminTab, setShowAdminTab] = useState(() => localStorage.getItem('showAdminTab') === 'true');
  const [accessCode, setAccessCode] = useState('');
  const [hasPurchased, setHasPurchased] = useState(() => localStorage.getItem('hasPurchased') === 'true');
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(() => {
    const storedUser = localStorage.getItem('telegramUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>(() => {
    const storedHistory = localStorage.getItem('purchaseHistory');
    return storedHistory ? JSON.parse(storedHistory) : [];
  });
  const { toast } = useToast();

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

  const handleTelegramUsernameSubmit = (username: string) => {
    console.log('Telegram username submitted:', username);
    const user: TelegramUser = { username };
    setTelegramUser(user);
    
    localStorage.setItem('telegramUser', JSON.stringify(user));
    
    toast({
      title: "Username Saved",
      description: `Welcome, @${username}! You can now purchase courses.`,
      variant: "default",
    });
  };

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
      
      const newOrder: Order = {
        id: orderId,
        courseId: course.id,
        courseTitle: course.title,
        orderDate: new Date().toLocaleString(),
        status: 'pending',
        telegramUsername: username
      };
      
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedOrders = [...existingOrders, newOrder];
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      
      setHasPurchased(true);
      localStorage.setItem('hasPurchased', 'true');
      
      if (isAdmin) {
        setOrders(updatedOrders);
      } else {
        setOrders(existingOrders => [...existingOrders, newOrder]);
      }
      
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

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_ACCESS_CODE) {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      
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

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
    toast({
      title: "Admin Logout",
      description: "You have been logged out of the admin panel.",
      variant: "default",
    });
  };

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

      if (!order.telegramUsername) {
        toast({
          title: "Error",
          description: "This order doesn't have a Telegram username.",
          variant: "destructive",
        });
        return;
      }

      const botToken = '7854582992:AAFpvQ1yzCi6PswUnI7dzzJtn0Ik07hY6K4';
      const channelId = '@udemmmmp';
      
      const channelMessage = `
📬 *COURSE DELIVERED*

🆔 *Order ID:* ${order.id}
📚 *Course:* ${order.courseTitle}
👤 *Customer:* @${order.telegramUsername}

Course link has been prepared and ready to send to the customer.
Please forward this message to @${order.telegramUsername}:

✅ *YOUR COURSE IS READY!*

🆔 *Order ID:* ${order.id}
📚 *Course:* ${order.courseTitle}
🔗 *Download Link:* ${courseLink}

${customMessage ? `📝 *Message:* ${customMessage}` : ''}
`;

      const encodedChannelMessage = encodeURIComponent(channelMessage);
      const channelUrl = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${channelId}&text=${encodedChannelMessage}&parse_mode=Markdown`;
      
      console.log("Sending notification to channel:", channelId);
      
      const channelResponse = await fetch(channelUrl);
      const channelData = await channelResponse.json();
      
      if (!channelData.ok) {
        console.error('Telegram API error:', channelData);
        throw new Error(`Failed to send notification: ${channelData.description || JSON.stringify(channelData)}`);
      }
      
      setShowAdminTab(true);
      localStorage.setItem('showAdminTab', 'true');
      
      const updatedOrders = orders.map(o => 
        o.id === selectedOrderId ? { ...o, status: 'completed' as const } : o
      );
      
      setOrders(updatedOrders);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      
      toast({
        title: "Course Ready",
        description: "A notification with the course link has been sent to the admin channel. Please forward it to the customer.",
        variant: "default",
      });
      
      setCourseLink('');
      setCustomMessage('');
      setSelectedOrderId(null);
      
    } catch (error) {
      console.error('Error sending course link:', error);
      
      let errorMessage = "Failed to send course link. Please try again.";
      if (error instanceof Error) {
        errorMessage = `${errorMessage} Error: ${error.message}`;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

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

  const handleTelegramLogout = () => {
    setTelegramUser(null);
    localStorage.removeItem('telegramUser');
    toast({
      title: "Username Cleared",
      description: "Your Telegram username has been cleared.",
      variant: "default",
    });
  };

  useEffect(() => {
    setCourses(ALL_COURSES);
  }, []);

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
            <div className="bg-white shadow-sm rounded-lg p-4 flex items-center space-x-4 max-w-md w-full">
              <div className="flex-1">
                <p className="font-medium">
                  Welcome, @{telegramUser.username}!
                </p>
                {isUserOnCooldown(telegramUser.username) && (
                  <p className="text-sm text-red-500">
                    Purchase limit reached. Cooldown: {Math.ceil(getUserCooldownTimeRemaining(telegramUser.username) / (60 * 1000))} minutes
                  </p>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleTelegramLogout}
              >
                Change Username
              </Button>
            </div>
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
            
            {isUserOnCooldown(telegramUser?.username || '') && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-lg font-medium text-red-800">Purchase Limit Reached</h3>
                <p className="text-red-700">
                  You've reached the maximum number of purchases ({MAX_PURCHASES}) within the time limit. 
                  Please try again in {Math.ceil(getUserCooldownTimeRemaining(telegramUser?.username || '') / (60 * 1000))} minutes.
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
                              {order.id} - {order.courseTitle} (@{order.telegramUsername})
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
                      
                      <div className="space-y-2">
                        <label htmlFor="customMessage" className="text-sm font-medium">
                          Custom Message (Optional)
                        </label>
                        <Textarea
                          id="customMessage"
                          value={customMessage}
                          onChange={(e) => setCustomMessage(e.target.value)}
                          placeholder="Add a custom message to send with the course link"
                          rows={3}
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
                              <th className="py-2 px-4 text-left">Customer</th>
                              <th className="py-2 px-4 text-left">Course</th>
                              <th className="py-2 px-4 text-left">Date</th>
                              <th className="py-2 px-4 text-left">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.map(order => (
                              <tr key={order.id} className="border-b hover:bg-gray-50">
                                <td className="py-2 px-4">{order.id}</td>
                                <td className="py-2 px-4">
                                  @{order.telegramUsername}
                                </td>
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
