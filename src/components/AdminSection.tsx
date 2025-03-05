import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { ADMIN_ACCESS_CODE } from '@/constants/config';
import { useOrderManager } from '@/hooks/useOrderManager';
import { X } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface AdminSectionProps {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  setShowAdminTab: (value: boolean) => void;
}

const AdminSection: React.FC<AdminSectionProps> = ({ isAdmin, setIsAdmin, setShowAdminTab }) => {
  const [adminPassword, setAdminPassword] = useState('');
  const [courseLink, setCourseLink] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const { orders, sendCourseLink, deleteOrder } = useOrderManager();
  
  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_ACCESS_CODE) {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      
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
    const success = await sendCourseLink(selectedOrderId || '', courseLink, customMessage);
    
    if (success) {
      setShowAdminTab(true);
      localStorage.setItem('showAdminTab', 'true');
      setCourseLink('');
      setCustomMessage('');
      setSelectedOrderId(null);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrderToDelete(orderId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (orderToDelete) {
      deleteOrder(orderToDelete);
      setShowDeleteDialog(false);
      setOrderToDelete(null);
    }
  };

  if (!isAdmin) {
    return (
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
    );
  }

  return (
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
                  <th className="py-2 px-4 text-left">Actions</th>
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
                    <td className="py-2 px-4">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteOrder(order.id)}
                        title="Delete Order"
                      >
                        <X className="h-4 w-4" />
                      </Button>
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

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSection;
