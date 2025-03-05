
import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useOrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { toast } = useToast();

  // Load orders from localStorage when component mounts
  useEffect(() => {
    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }
  }, []);

  const addOrder = (newOrder: Order) => {
    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    return updatedOrders;
  };

  const updateOrderStatus = (orderId: string, status: 'pending' | 'completed') => {
    const updatedOrders = orders.map(o => 
      o.id === orderId ? { ...o, status } : o
    );
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    return updatedOrders;
  };

  const sendCourseLink = async (orderId: string, courseLink: string, customMessage: string) => {
    if (!orderId || !courseLink.trim()) {
      toast({
        title: "Error",
        description: "Please select an order and enter a course link",
        variant: "destructive",
      });
      return false;
    }

    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      if (!order.telegramUsername) {
        toast({
          title: "Error",
          description: "This order doesn't have a Telegram username.",
          variant: "destructive",
        });
        return false;
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
      
      updateOrderStatus(orderId, 'completed');
      
      toast({
        title: "Course Ready",
        description: "A notification with the course link has been sent to the admin channel. Please forward it to the customer.",
        variant: "default",
      });
      
      return true;
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
      
      return false;
    }
  };

  return {
    orders,
    setOrders,
    addOrder,
    updateOrderStatus,
    sendCourseLink
  };
}
