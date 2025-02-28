
import React, { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import CourseCard from '@/components/CourseCard';
import LoadingCard from '@/components/LoadingCard';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Type for Udemy courses
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
}

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<UdemyCourse[]>([]);
  const [purchaseLoading, setPurchaseLoading] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [courseLink, setCourseLink] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showAdminTab, setShowAdminTab] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [hasPurchased, setHasPurchased] = useState(false);
  const { toast } = useToast();

  // Check for admin status and purchase history in localStorage on initial load
  useEffect(() => {
    const storedIsAdmin = localStorage.getItem('isAdmin');
    const storedHasPurchased = localStorage.getItem('hasPurchased');
    const storedShowAdminTab = localStorage.getItem('showAdminTab');
    
    if (storedIsAdmin === 'true') {
      setIsAdmin(true);
      // Load orders from localStorage
      const storedOrders = localStorage.getItem('orders');
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      }
    }
    
    if (storedHasPurchased === 'true') {
      setHasPurchased(true);
    }
    
    if (storedShowAdminTab === 'true') {
      setShowAdminTab(true);
    }
  }, []);

  // Function to search courses directly from Udemy
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setCourses([]);
      return;
    }

    setLoading(true);
    setCourses([]); // Clear previous results before fetching

    try {
      // Try several alternative proxy services
      const proxyServices = [
        'https://corsproxy.io/?',
        'https://cors-anywhere.herokuapp.com/',
        'https://api.allorigins.win/raw?url='
      ];
      
      // Encode the search query properly
      const encodedQuery = encodeURIComponent(query);
      const udemyApiUrl = `https://www.udemy.com/api-2.0/courses/?search=${encodedQuery}&page=1&page_size=12&fields[course]=@default,price,price_detail,image_480x270`;
      
      let success = false;
      let errorMessage = '';
      
      // Try each proxy service until one works
      for (const proxyUrl of proxyServices) {
        if (success) break;
        
        try {
          const fullUrl = `${proxyUrl}${encodeURIComponent(udemyApiUrl)}`;
          console.log('Attempting fetch from:', fullUrl);
          
          const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            }
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('API response error:', response.status, errorText);
            errorMessage = `API responded with status ${response.status}`;
            continue; // Try next proxy
          }
          
          const data = await response.json();
          console.log('Udemy API response:', data);
          
          if (!data.results || !Array.isArray(data.results)) {
            console.error('Invalid API response format:', data);
            errorMessage = 'Invalid response format from Udemy API';
            continue; // Try next proxy
          }
          
          // Success! Set courses and mark as successful
          setCourses(data.results);
          success = true;
          break;
          
        } catch (proxyError) {
          console.error(`Error with proxy ${proxyUrl}:`, proxyError);
          errorMessage = `Proxy error: ${proxyError.message}`;
          // Continue to next proxy
        }
      }
      
      // If all proxies failed, show error
      if (!success) {
        throw new Error(errorMessage || 'Failed to fetch courses from Udemy');
      }
      
    } catch (error) {
      console.error('Error fetching Udemy courses:', error);
      toast({
        title: "Search Error",
        description: "Failed to fetch courses from Udemy. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle purchase process
  const handlePurchase = async (courseId: number) => {
    try {
      setPurchaseLoading(courseId);
      
      // Find the course
      const course = courses.find(c => c.id === courseId);
      if (!course) {
        throw new Error('Course not found');
      }
      
      // Create a unique order ID
      const orderId = `ORDER-${Date.now()}`;
      
      // Create a new order
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

Order is waiting for processing.
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

  // Admin login handler
  const handleAdminLogin = () => {
    // In a real app, you would validate this on a secure backend
    // Here we're using a simple password check for demonstration
    if (adminPassword === 'admin123') { // Replace with your secure password
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
        description: "Incorrect password. Please try again.",
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

  // Send course link via Telegram bot
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

      // Create a direct message to the user
      // Note: In a real app, you'd store the user's chat ID during order placement
      // For this demo, we're just sending to the channel
      const botToken = '7854582992:AAFpvQ1yzCi6PswUnI7dzzJtn0Ik07hY6K4';
      const channelId = '@udemmmmp'; // Channel username with @ symbol
      
      const message = `
✅ *COURSE DELIVERY*

🆔 *Order ID:* ${order.id}
📚 *Course:* ${order.courseTitle}
🔗 *Download Link:* ${courseLink}

Thank you for your purchase!
`;
      
      const encodedMessage = encodeURIComponent(message);
      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${channelId}&text=${encodedMessage}&parse_mode=Markdown`;
      
      const response = await fetch(telegramUrl);
      const data = await response.json();
      
      if (!data.ok) {
        throw new Error('Failed to send course link via Telegram');
      }
      
      // After first successful delivery, make the admin tab visible
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
        description: "The course download link has been sent successfully.",
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

  // Function to unlock admin tab with access code
  const handleUnlockAdmin = () => {
    if (accessCode === 'unlock-admin') {
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
        
        {/* Hidden access code input - only for development/testing purposes */}
        {!showAdminTab && (
          <div className="mb-4 max-w-xs mx-auto opacity-30 hover:opacity-100 transition-opacity">
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
        )}
        
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
                  We're processing your request. You'll receive your course download link soon.
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
                        Admin Password
                      </label>
                      <Input
                        id="password"
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Enter admin password"
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
                              {order.id} - {order.courseTitle}
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
